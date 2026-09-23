import { isKnownInsuranceType } from "./insurance-normalization.ts";
export type AnalysisSide = "existing" | "offer";
export type DocumentStatus = "queued" | "validating" | "extracting" | "ready" | "analyzing" | "completed" | "failed";
export type ProductStatus = "identified" | "analyzing" | "completed" | "failed";
export type JobStatus = "idle" | "uploading" | "analyzing" | "partial" | "completed" | "failed";
export const failureCodes = ["invalid_pdf", "encrypted_pdf", "missing_text_layer", "pdf_timeout", "extraction_failed"] as const;
export type FailureCode = typeof failureCodes[number];
export type ProgressEvent =
  | { type: "analysis_started"; existingDocumentCount: number; offerDocumentCount: number }
  | { type: "document_status"; side: AnalysisSide; documentIndex: number; status: DocumentStatus; error?: FailureCode }
  | { type: "batch_analyzing"; side: AnalysisSide; batchIndex: number; documentCount: number }
  | { type: "product_status"; side: AnalysisSide; batchIndex: number; productIndex: number; insuranceType: string; status: ProductStatus }
  | { type: "comparison_started" }
  | { type: "analysis_completed"; partialSuccess: boolean; successfulDocuments: number; failedDocuments: number };
const integer = (v: unknown, max: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;
// Reconstruct every event; arbitrary fields, labels and error messages never cross this boundary.
export function safeProgress(value: unknown): ProgressEvent {
  if (!value || typeof value !== "object") throw new Error("Invalid progress");
  const v = value as Record<string, unknown>;
  if (v.type === "analysis_started" && integer(v.existingDocumentCount, 10) && integer(v.offerDocumentCount, 10)) return { type: v.type, existingDocumentCount: v.existingDocumentCount as number, offerDocumentCount: v.offerDocumentCount as number };
  if (v.type === "comparison_started") return { type: v.type };
  if (v.type === "analysis_completed" && typeof v.partialSuccess === "boolean" && integer(v.successfulDocuments, 20) && integer(v.failedDocuments, 20)) return { type: v.type, partialSuccess: v.partialSuccess, successfulDocuments: v.successfulDocuments as number, failedDocuments: v.failedDocuments as number };
  if (v.side !== "existing" && v.side !== "offer") throw new Error("Invalid progress side");
  if (v.type === "document_status" && integer(v.documentIndex, 9) && typeof v.status === "string" && ["queued", "validating", "extracting", "ready", "analyzing", "completed", "failed"].includes(v.status as string)) {
    return { type: v.type, side: v.side, documentIndex: v.documentIndex as number, status: v.status as DocumentStatus,
      ...(failureCodes.includes(v.error as FailureCode) ? { error: v.error as FailureCode } : {}) };
  }
  if (v.type === "batch_analyzing" && integer(v.batchIndex, 7) && integer(v.documentCount, 10)) return { type: v.type, side: v.side, batchIndex: v.batchIndex as number, documentCount: v.documentCount as number };
  if (v.type === "product_status" && integer(v.batchIndex, 7) && integer(v.productIndex, 29) && typeof v.status === "string" && ["identified", "analyzing", "completed", "failed"].includes(v.status as string)) return { type: v.type, side: v.side, batchIndex: v.batchIndex as number, productIndex: v.productIndex as number, status: v.status as ProductStatus,
    insuranceType: typeof v.insuranceType === "string" && isKnownInsuranceType(v.insuranceType) ? v.insuranceType : "unknown" };
  throw new Error("Invalid progress");
}
export type ProgressState = { status: JobStatus; documents: Extract<ProgressEvent, { type: "document_status" }>[]; products: Extract<ProgressEvent, { type: "product_status" }>[] };
export const emptyProgress = (): ProgressState => ({ status: "idle", documents: [], products: [] });
const documentOrder: DocumentStatus[] = ["queued", "validating", "extracting", "ready", "analyzing", "completed", "failed"];
const productOrder: ProductStatus[] = ["identified", "analyzing", "completed", "failed"];
export function applyProgress(state: ProgressState, input: ProgressEvent): ProgressState {
  const event = safeProgress(input);
  if (["completed", "partial", "failed"].includes(state.status)) return state;
  if (event.type === "analysis_started") return { status: "analyzing", products: [], documents: (["existing", "offer"] as const).flatMap((side) =>
    Array.from({ length: side === "existing" ? event.existingDocumentCount : event.offerDocumentCount }, (_, documentIndex) => ({ type: "document_status" as const, side, documentIndex, status: "queued" as const }))) };
  if (event.type === "document_status") {
    const previous = state.documents.find((d) => d.side === event.side && d.documentIndex === event.documentIndex);
    if (!previous || ["completed", "failed"].includes(previous.status) || (event.status !== "failed" && documentOrder.indexOf(event.status) !== documentOrder.indexOf(previous.status) + 1)) return state;
    return { ...state, documents: state.documents.map((d) => d === previous ? event : d) };
  }
  if (event.type === "product_status") {
    const previous = state.products.find((p) => p.side === event.side && p.batchIndex === event.batchIndex && p.productIndex === event.productIndex);
    if (!previous && event.status !== "identified") return state;
    if (previous && (["completed", "failed"].includes(previous.status) || productOrder.indexOf(event.status) < productOrder.indexOf(previous.status))) return state;
    return { ...state, products: previous ? state.products.map((p) => p === previous ? event : p) : [...state.products, event].sort((a,b) => a.side.localeCompare(b.side) || a.batchIndex-b.batchIndex || a.productIndex-b.productIndex) };
  }
  if (event.type === "analysis_completed") return { ...state, status: event.partialSuccess ? "partial" : "completed" };
  return state;
}
// Ref-friendly generation gate also prevents stale errors/final results after abort/new analysis.
export function createAnalysisGeneration() { let id = 0; return { next: () => ++id, current: (value: number) => value === id }; }
