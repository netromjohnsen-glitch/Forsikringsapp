import type { ProductionTrace } from "./production-trace-server.ts";
import { readPdf, type ParsedPdf } from "./pdf-reader.ts";
import { PdfSecurityError, validateParsedPdfSide, type PreparedPdf } from "./pdf-upload-security.ts";
import { AnalysisControlError } from "./analysis-control.ts";
import { MAX_JOB_PAGES, MAX_JOB_PRODUCTS, planExtractionBatches, rejectDuplicatePdfs, runBatchPool, type ExtractionBatch, type TextDocument } from "./analysis-batching.ts";
import { enrichBatch, type BatchResult } from "./analysis-merge.ts";
import { safeProgress, type AnalysisSide, type FailureCode, type ProgressEvent } from "./analysis-progress.ts";
import type { ExtractedAgreement } from "./analysis-output.ts";
import type { AnalysisTelemetry } from "./analysis-telemetry.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
export type DocumentFailure = { side: AnalysisSide; documentIndex: number; code: FailureCode };
export async function analyzePdfBatches(options: {
  sides: { side: AnalysisSide; files: PreparedPdf[] }[];
  controller: AbortController; telemetry: AnalysisTelemetry;
  emit: (event: ProgressEvent) => void;
  extract: (batch: ExtractionBatch) => Promise<ExtractedAgreement>;
  trace?: ProductionTrace;
  parse?: (pdf: PreparedPdf, signal: AbortSignal) => Promise<ParsedPdf>;
}) {
  const { sides, controller, telemetry } = options;
  const signal = controller.signal;
  const emit = (event: ProgressEvent) => { const safe = safeProgress(event); telemetry.progress(safe); options.emit(safe); };
  emit({ type: "analysis_started", existingDocumentCount: sides.find((s) => s.side === "existing")?.files.length ?? 0, offerDocumentCount: sides.find((s) => s.side === "offer")?.files.length ?? 0 });
  const failures: DocumentFailure[] = [];
  const texts: TextDocument[] = [];
  const fail = (side: AnalysisSide, documentIndex: number, code: FailureCode, parseFailure = true) => {
    if (parseFailure) options.trace?.document(side, documentIndex, false);
    failures.push({ side, documentIndex, code }); emit({ type: "document_status", side, documentIndex, status: "failed", error: code });
  };
  let globalIndex = 0, totalPages = 0;
  for (const { side, files } of sides) {
    rejectDuplicatePdfs(files);
    const sidePages: number[] = [], sideTexts: string[] = [];
    for (const [documentIndex, file] of files.entries()) {
      signal.throwIfAborted();
      emit({ type: "document_status", side, documentIndex, status: "validating" });
      emit({ type: "document_status", side, documentIndex, status: "extracting" });
      const bytes = file.data.byteLength;
      const start = performance.now();
      try {
        const parsed = await telemetry.measure("pdfWorker", () => (options.parse ?? readPdf)(file, signal));
        telemetry.record("pdfParsing", parsed.parseMs); telemetry.record("textExtraction", parsed.textMs);
        telemetry.document(globalIndex, bytes, parsed.pages, parsed.text.length, performance.now()-start);
        totalPages += parsed.pages;
        if (totalPages > MAX_JOB_PAGES) throw new PdfSecurityError(413, "job_resource_budget", "Samlet dokumentmengde overskrider 400 sider.");
        sidePages.push(parsed.pages); sideTexts.push(parsed.text);
        validateParsedPdfSide(sidePages, sideTexts);
        texts.push({ side, documentIndex, text: parsed.text, pages: parsed.pages });
        options.trace?.document(side, documentIndex, true);
        emit({ type: "document_status", side, documentIndex, status: "ready" });
      } catch (error) {
        signal.throwIfAborted();
        if (error instanceof PdfSecurityError && error.status === 422 && ["invalid_pdf", "encrypted_pdf", "missing_text_layer"].includes(error.code)) fail(side, documentIndex, error.code as FailureCode);
        else if (error instanceof AnalysisControlError && error.code === "pdf_timeout") fail(side, documentIndex, "pdf_timeout");
        else throw error;
      }
      globalIndex++;
    }
    if (files.length && !texts.some((d) => d.side === side)) throw new PdfSecurityError(422, "no_readable_documents", "Ingen dokumenter kunne leses på én av sidene. Prøv igjen med en lesbar PDF.");
  }
  // No AI until all security/resource checks have passed. No document crosses batches.
  const batches = telemetry.measureSync("inputPreparation", () => planExtractionBatches(texts));
  telemetry.batches(batches);
  if (options.trace) for (const batch of batches) options.trace.batch(batch);
  let products = 0;
  const results = await runBatchPool(batches, controller, async (batch): Promise<BatchResult | null> => {
    for (const doc of batch.documents) emit({ type: "document_status", side: doc.side, documentIndex: doc.documentIndex, status: "analyzing" });
    emit({ type: "batch_analyzing", side: batch.side, batchIndex: batch.batchIndex, documentCount: batch.documents.length });
    try {
      const extracted = await options.extract(batch);
      signal.throwIfAborted();
      products += extracted.insurances.length;
      if (products > MAX_JOB_PRODUCTS) throw new PdfSecurityError(413, "too_many_products", "For mange produkter i én sammenligning.");
      const agreement = enrichBatch(extracted, batch, telemetry, options.trace);
      options.trace?.assignment(batch, extracted.insurances);
      for (const [productIndex, product] of agreement.insurances.entries()) {
        const identity = { side: batch.side, batchIndex: batch.batchIndex, productIndex, insuranceType: normalizeInsuranceType(product.type) };
        emit({ type: "product_status", ...identity, status: "identified" });
        emit({ type: "product_status", ...identity, status: "completed" });
      }
      for (const doc of batch.documents) emit({ type: "document_status", side: doc.side, documentIndex: doc.documentIndex, status: "completed" });
      return { batch, agreement };
    } catch (error) {
      signal.throwIfAborted();
      // Capacity/configuration failures affect the whole service; preserve fail-closed behavior.
      const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      if (status === 429 || status === 401 || status === 403 || status === 413 || status === 415 || code === "missing_openai_key") throw error;
      options.trace?.extractionFailed(batch);
      for (const doc of batch.documents) fail(doc.side, doc.documentIndex, "extraction_failed", false);
      return null;
    }
  }, telemetry.extractionConcurrency);
  const successful = results.filter((r): r is BatchResult => r !== null);
  for (const { side, files } of sides) if (files.length && !successful.some((r) => r.batch.side === side)) throw new AnalysisControlError(503, "side_analysis_failed", "Ingen dokumenter kunne analyseres på én av sidene. Prøv igjen.");
  failures.sort((a,b) => (a.side === b.side ? 0 : a.side === "existing" ? -1 : 1) || a.documentIndex - b.documentIndex);
  return { results: successful, failures, successfulDocuments: successful.reduce((sum,r) => sum+r.batch.documents.length,0), partialSuccess: failures.length > 0 };
}
