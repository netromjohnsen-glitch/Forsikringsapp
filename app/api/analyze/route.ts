import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import { runHybridMatching } from "@/lib/hybrid-matching";
import { requestSemanticMatches } from "@/lib/semantic-matcher";
import { finalizeAgreementPricing } from "@/lib/agreement-pricing";
import { ManualAgreementError, normalizeManualAgreement } from "@/lib/manual-agreement";
import { includePdfAddOnTerms } from "@/lib/pdf-addons";
import { enrichExtractedAgreementWithCatalog } from "@/lib/catalog-enrichment";
import {
  AnalysisOutputError,
  EXTRACTION_TIMEOUT_MS,
  buildExtractionRequest,
  parseExtractionResponse,
  sanitizeAnalysisDocumentForClient,
} from "@/lib/analysis-output";
import { buildUntrustedDocumentInput } from "@/lib/document-redaction";
import { isSameOriginRequest, noStoreJson, safeErrorMetadata } from "@/lib/http-security";
import {
  PdfSecurityError,
  type PreparedPdf,
  pdfParserError,
  preparePdf,
  validateAggregatePdfBytes,
  validateParsedPdf,
  validateParsedPdfSide,
  validatePdfFileList,
  validateRequestContentLength,
} from "@/lib/pdf-upload-security";
import { hasValidPilotSession, isPilotAccessConfigured } from "@/lib/pilot-access";

PDFParse.setWorker(getPath());

export const maxDuration = 240;

let openaiClient: OpenAI | null = null;

class AnalysisServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function openai(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new AnalysisServiceError("missing_openai_key", "Analysetjenesten er ikke konfigurert.");
  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: EXTRACTION_TIMEOUT_MS,
    maxRetries: 0,
  });
  return openaiClient;
}

async function extractInsuranceData(text: string) {
  const response = await openai().responses.create(
    buildExtractionRequest(text),
    { timeout: EXTRACTION_TIMEOUT_MS, maxRetries: 0 },
  );
  const extracted = parseExtractionResponse(response);
  if (extracted.insurances.length === 0) {
    throw new PdfSecurityError(422, "no_insurance_data", "Fant ingen forsikringsopplysninger i PDF-en.");
  }
  return extracted;
}

async function readPdf(pdf: PreparedPdf): Promise<{ text: string; pages: number }> {
  let parser: PDFParse | null = null;
  let result;
  try {
    parser = new PDFParse({ data: Buffer.from(pdf.data) });
    result = await parser.getText();
  } catch (error) {
    throw pdfParserError(error);
  } finally {
    if (parser) {
      try { await parser.destroy(); } catch { /* Ingen dokumentdata eller rå parserfeil logges. */ }
    }
  }
  validateParsedPdf(result.total, result.text);
  return { text: result.text, pages: result.total };
}

async function parsePdfAgreement(files: readonly PreparedPdf[]) {
  const documentTexts: string[] = [];
  const pageCounts: number[] = [];
  for (const file of files) {
    const parsed = await readPdf(file);
    documentTexts.push(parsed.text);
    pageCounts.push(parsed.pages);
  }
  validateParsedPdfSide(pageCounts, documentTexts);
  return {
    modelInput: buildUntrustedDocumentInput(documentTexts),
    filename: files.length === 1 ? "1 PDF-dokument" : `${files.length} PDF-dokumenter`,
  };
}

async function analyzeParsedAgreement(parsed: { modelInput: string; filename: string }) {
  const extracted = await extractInsuranceData(parsed.modelInput);
  const withDocumentAddOns = {
    ...extracted,
    insurances: extracted.insurances.map(includePdfAddOnTerms),
  };
  return {
    source: "pdf" as const,
    filename: parsed.filename,
    insuranceData: finalizeAgreementPricing(enrichExtractedAgreementWithCatalog(withDocumentAddOns)),
  };
}

type PendingAgreement =
  | { mode: "manual"; document: ReturnType<typeof normalizeManualAgreement> }
  | { mode: "pdf"; files: PreparedPdf[] };

function uploadedFiles(formData: FormData, side: "existing" | "offer"): File[] {
  return formData.getAll(`${side}Files`).filter((file): file is File => file instanceof File);
}

async function pendingAgreement(
  formData: FormData,
  side: "existing" | "offer",
  rawFiles: readonly File[],
): Promise<PendingAgreement> {
  const mode = formData.get(`${side}Mode`);
  if (mode === "manual") {
    const raw = formData.get(`${side}Manual`);
    if (typeof raw !== "string") throw new ManualAgreementError("Manuelle opplysninger mangler.");
    try {
      return { mode, document: normalizeManualAgreement(JSON.parse(raw)) };
    } catch (error) {
      if (error instanceof ManualAgreementError) throw error;
      throw new ManualAgreementError("Ugyldige manuelle opplysninger.");
    }
  }
  if (mode !== "pdf") throw new ManualAgreementError("Velg PDF eller manuell registrering på begge sider.");
  validatePdfFileList(rawFiles);
  const files: PreparedPdf[] = [];
  for (const file of rawFiles) files.push(await preparePdf(file));
  return { mode, files };
}

function externalStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const status = (error as Record<string, unknown>).status;
  return typeof status === "number" ? status : null;
}

function responseHeaders(requestId: string): HeadersInit {
  return { "X-Request-Id": requestId };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    if (!isPilotAccessConfigured()) {
      return noStoreJson({ error: "Pilottilgang er ikke konfigurert." }, 503, responseHeaders(requestId));
    }
    if (!hasValidPilotSession(request)) {
      return noStoreJson({ error: "Gyldig pilottilgang kreves." }, 401, responseHeaders(requestId));
    }
    if (!isSameOriginRequest(request)) {
      return noStoreJson({ error: "Requesten ble avvist fordi origin ikke stemmer." }, 403, responseHeaders(requestId));
    }
    validateRequestContentLength(request.headers.get("content-length"));
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
      throw new PdfSecurityError(415, "unsupported_request_type", "Opplastingen må bruke multipart/form-data.");
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw new PdfSecurityError(422, "invalid_form_data", "Opplastingen kunne ikke leses.");
    }

    const existingRawFiles = uploadedFiles(formData, "existing");
    const offerRawFiles = uploadedFiles(formData, "offer");
    validateAggregatePdfBytes([existingRawFiles, offerRawFiles]);

    const pending = [
      await pendingAgreement(formData, "existing", existingRawFiles),
      await pendingAgreement(formData, "offer", offerRawFiles),
    ] as const;

    // Alle PDF-er parses og valideres før første dokument sendes til OpenAI.
    const parsedPdfAgreements = [];
    for (const agreement of pending) {
      parsedPdfAgreements.push(agreement.mode === "pdf" ? await parsePdfAgreement(agreement.files) : null);
    }

    const documents = [];
    for (let index = 0; index < pending.length; index++) {
      const agreement = pending[index];
      documents.push(agreement.mode === "manual"
        ? agreement.document
        : await analyzeParsedAgreement(parsedPdfAgreements[index]!));
    }

    const matchingPlan = await runHybridMatching(
      documents[0].insuranceData.insurances,
      documents[1].insuranceData.insurances,
      (batch) => requestSemanticMatches(openai(), batch),
    );

    return noStoreJson({
      documents: documents.map((document) => sanitizeAnalysisDocumentForClient(document as unknown as Record<string, unknown>)),
      matchingPlan,
    }, 200, responseHeaders(requestId));
  } catch (error) {
    if (error instanceof ManualAgreementError) {
      return noStoreJson({ error: error.message }, 400, responseHeaders(requestId));
    }
    if (error instanceof PdfSecurityError) {
      return noStoreJson({ error: error.message }, error.status, responseHeaders(requestId));
    }
    const status = externalStatus(error);
    if (status === 429) {
      console.error("ANALYSE_FEIL", safeErrorMetadata(requestId, "external_rate_limit", error));
      return noStoreJson({ error: "Analysetjenesten har nådd en midlertidig kapasitetsgrense. Prøv igjen senere." }, 429, responseHeaders(requestId));
    }
    const category = error instanceof AnalysisOutputError ? "invalid_ai_output"
      : error instanceof AnalysisServiceError ? error.code
      : status !== null && status >= 500 ? "external_service_error"
      : "analysis_service_error";
    console.error("ANALYSE_FEIL", safeErrorMetadata(requestId, category, error));
    return noStoreJson(
      { error: "Analysetjenesten er midlertidig utilgjengelig. Prøv igjen senere." },
      503,
      responseHeaders(requestId),
    );
  }
}
