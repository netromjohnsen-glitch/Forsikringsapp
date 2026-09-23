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
  preparePdf,
  validateAggregatePdfBytes,
  validateParsedPdfSide,
  validatePdfFileList,
  validateRequestContentLength,
} from "@/lib/pdf-upload-security";
import { hasValidPilotSession, isPilotAccessConfigured } from "@/lib/pilot-access";

import { readPdf } from "@/lib/pdf-reader";
import { createAnalysisTelemetry, type AnalysisTelemetry } from "@/lib/analysis-telemetry";
import {
  AnalysisControlError, analysisAdmission, requestLifecycle,
  readBoundedFormData, analyzeAgreementSides,
} from "@/lib/analysis-control";

export const maxDuration = 240;
export const runtime = "nodejs";

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
    logLevel: "off", // SDK debug logging must never serialize customer requests.
  });
  return openaiClient;
}

async function extractInsuranceData(text: string, signal: AbortSignal, telemetry: AnalysisTelemetry) {
  signal.throwIfAborted();
  const client = openai();
  const started = performance.now();
  let response;
  try {
    response = await telemetry.measure("aiExtraction", () => client.responses.create(
      buildExtractionRequest(text),
      { timeout: EXTRACTION_TIMEOUT_MS, maxRetries: 0, signal },
    ));
  } finally {
    telemetry.usage("extraction", performance.now() - started, response?.status === "completed", response);
  }
  signal.throwIfAborted();
  const extracted = telemetry.measureSync("structuredOutput", () => parseExtractionResponse(response));
  if (extracted.insurances.length === 0) {
    throw new PdfSecurityError(422, "no_insurance_data", "Fant ingen forsikringsopplysninger i PDF-en.");
  }
  telemetry.products(extracted.insurances.length);
  return extracted;
}

async function parsePdfAgreement(files: readonly PreparedPdf[], signal: AbortSignal, telemetry: AnalysisTelemetry, offset: number) {
  const documentTexts: string[] = [];
  const pageCounts: number[] = [];
  for (const [index, file] of files.entries()) {
    signal.throwIfAborted();
    const bytes = file.data.byteLength;
    const start = performance.now();
    const parsed = await telemetry.measure("pdfWorker", () => readPdf(file, signal));
    telemetry.record("pdfParsing", parsed.parseMs);
    telemetry.record("textExtraction", parsed.textMs);
    telemetry.document(offset + index, bytes, parsed.pages, parsed.text.length, performance.now() - start);
    documentTexts.push(parsed.text);
    pageCounts.push(parsed.pages);
    // Check cumulative limits before spending resources on the next document.
    validateParsedPdfSide(pageCounts, documentTexts);
  }
  return {
    modelInput: telemetry.measureSync("inputPreparation", () => buildUntrustedDocumentInput(documentTexts)),
    filename: files.length === 1 ? "1 PDF-dokument" : `${files.length} PDF-dokumenter`,
  };
}

async function analyzeParsedAgreement(parsed: { modelInput: string; filename: string }, signal: AbortSignal, telemetry: AnalysisTelemetry) {
  const extracted = await extractInsuranceData(parsed.modelInput, signal, telemetry);
  const withDocumentAddOns = telemetry.measureSync("normalization", () => ({
    ...extracted,
    insurances: extracted.insurances.map(includePdfAddOnTerms),
  }));
  return {
    source: "pdf" as const,
    filename: parsed.filename,
    insuranceData: finalizeAgreementPricing(telemetry.measureSync("catalogEnrichment", () =>
      enrichExtractedAgreementWithCatalog(withDocumentAddOns, new Date(), telemetry.measureSync))),
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
  signal: AbortSignal,
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
  for (const file of rawFiles) { signal.throwIfAborted(); files.push(await preparePdf(file)); }
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
  const telemetry = createAnalysisTelemetry(requestId);
  const lifecycle = requestLifecycle(request.signal);
  let release: (() => void) | undefined;
  let outcome = 500;
  const respond = (body: unknown, status: number) => {
    outcome = status;
    return telemetry.measureSync("response", () => noStoreJson(body, status, {
      ...responseHeaders(requestId), ...(status === 429 ? { "Retry-After": "5" } : {}),
    }));
  };
  try {
    if (!isPilotAccessConfigured()) {
      return respond({ error: "Pilottilgang er ikke konfigurert." }, 503);
    }
    if (!hasValidPilotSession(request)) {
      return respond({ error: "Gyldig pilottilgang kreves." }, 401);
    }
    if (!isSameOriginRequest(request)) {
      return respond({ error: "Requesten ble avvist fordi origin ikke stemmer." }, 403);
    }
    release = analysisAdmission.acquire();
    const pending = await telemetry.measure("uploadValidation", async () => {
      validateRequestContentLength(request.headers.get("content-length"));
      if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
        throw new PdfSecurityError(415, "unsupported_request_type", "Opplastingen må bruke multipart/form-data.");
      }
      const formData = await readBoundedFormData(request, lifecycle.signal, telemetry.upload);
      const allowed = new Set(["existingMode", "offerMode", "existingManual", "offerManual", "existingFiles", "offerFiles"]);
      for (const [key, value] of formData.entries()) {
        if (!allowed.has(key) || (key.endsWith("Files") && !(value instanceof File)) ||
          (!key.endsWith("Files") && (typeof value !== "string" || formData.getAll(key).length !== 1))) {
          throw new PdfSecurityError(422, "invalid_form_data", "Ugyldige opplastingsfelt.");
        }
      }
      const existingRawFiles = uploadedFiles(formData, "existing");
      const offerRawFiles = uploadedFiles(formData, "offer");
      telemetry.uploadedDocuments(existingRawFiles.length + offerRawFiles.length);
      validateAggregatePdfBytes([existingRawFiles, offerRawFiles]);
      for (const side of ["existing", "offer"] as const) {
        if (formData.get(`${side}Mode`) === "manual" && formData.getAll(`${side}Files`).length) {
          throw new PdfSecurityError(422, "invalid_form_data", "PDF kan ikke sendes på en manuell side.");
        }
      }
      return [
        await pendingAgreement(formData, "existing", existingRawFiles, lifecycle.signal),
        await pendingAgreement(formData, "offer", offerRawFiles, lifecycle.signal),
      ] as const;
    });

    // Alle PDF-er parses og valideres før første dokument sendes til OpenAI.
    const parsedPdfAgreements: (Awaited<ReturnType<typeof parsePdfAgreement>> | null)[] = [];
    let documentOffset = 0;
    for (const agreement of pending) {
      parsedPdfAgreements.push(agreement.mode === "pdf"
        ? await parsePdfAgreement(agreement.files, lifecycle.signal, telemetry, documentOffset) : null);
      if (agreement.mode === "pdf") documentOffset += agreement.files.length;
      else telemetry.products(agreement.document.insuranceData.insurances.length);
    }

    const documents = await analyzeAgreementSides(pending.map((agreement, index) => async () =>
      agreement.mode === "manual" ? agreement.document
        : analyzeParsedAgreement(parsedPdfAgreements[index]!, lifecycle.signal, telemetry)),
    lifecycle.controller);

    const matchingPlan = await telemetry.measure("semanticMatching", () => runHybridMatching(
      documents[0].insuranceData.insurances,
      documents[1].insuranceData.insurances,
      (batch) => requestSemanticMatches(openai(), batch, { signal: lifecycle.signal, telemetry }),
      telemetry.semanticMatcher,
    ));
    lifecycle.signal.throwIfAborted();

    return respond({
      documents: documents.map((document) => sanitizeAnalysisDocumentForClient(document as unknown as Record<string, unknown>)),
      matchingPlan,
    }, 200);
  } catch (caught) {
    const error = lifecycle.signal.aborted ? lifecycle.signal.reason : caught;
    if (error instanceof AnalysisControlError) return respond({ error: error.message }, error.status);
    if (error instanceof ManualAgreementError) {
      return respond({ error: error.message }, 400);
    }
    if (error instanceof PdfSecurityError) {
      return respond({ error: error.message }, error.status);
    }
    const status = externalStatus(error);
    if (status === 429) {
      console.error("ANALYSE_FEIL", safeErrorMetadata(requestId, "external_rate_limit", error));
      return respond({ error: "Analysetjenesten har nådd en midlertidig kapasitetsgrense. Prøv igjen senere." }, 429);
    }
    const category = error instanceof AnalysisOutputError ? "invalid_ai_output"
      : error instanceof AnalysisServiceError ? error.code
      : status !== null && status >= 500 ? "external_service_error"
      : "analysis_service_error";
    console.error("ANALYSE_FEIL", safeErrorMetadata(requestId, category, error));
    return respond({ error: "Analysetjenesten er midlertidig utilgjengelig. Prøv igjen senere." }, 503);
  } finally {
    lifecycle.dispose();
    release?.();
    console.info("ANALYSIS_METRICS", JSON.stringify(telemetry.snapshot(outcome)));
  }
}
