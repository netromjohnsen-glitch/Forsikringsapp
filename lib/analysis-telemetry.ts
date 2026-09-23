import { sanitizeSemanticAudit } from "./semantic-audit.ts";
import type { SemanticMatcherMetrics } from "./hybrid-matching.ts";
// Only fixed stage names and numeric measurements cross the logging boundary.
export const ANALYSIS_MODEL = "gpt-5.6-luna";
export type AnalysisStage = "uploadValidation" | "pdfWorker" | "pdfParsing" | "textExtraction" |
  "inputPreparation" | "aiExtraction" | "structuredOutput" | "normalization" |
  "documentNormalization" | "catalogLookup" | "catalogEnrichment" |
  "semanticMatching" | "semanticApi" | "response";
export type MeasureSync = <T>(stage: AnalysisStage, work: () => T) => T;

const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

export function numericUsage(response: unknown) {
  const object = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const usage = object.usage && typeof object.usage === "object" ? object.usage as Record<string, unknown> : {};
  const details = usage.input_tokens_details && typeof usage.input_tokens_details === "object"
    ? usage.input_tokens_details as Record<string, unknown> : {};
  return {
    inputTokens: finite(usage.input_tokens),
    outputTokens: finite(usage.output_tokens),
    totalTokens: finite(usage.total_tokens),
    cachedInputTokens: finite(details.cached_tokens),
  };
}

export function createAnalysisTelemetry(requestId: string, now = () => performance.now()) {
  const start = now();
  const timings: Partial<Record<AnalysisStage, number>> = {};
  const documents: { index: number; bytes: number; pages: number; characters: number; durationMs: number }[] = [];
  const calls: { kind: "extraction" | "semantic"; model: string; durationMs: number; success: boolean;
    usage: ReturnType<typeof numericUsage> }[] = [];
  let semanticMatcher: SemanticMatcherMetrics | undefined;
  let products = 0;
  let documentCount = 0;
  let uploadBytes = 0;
  const record = (stage: AnalysisStage, duration: number) => {
    timings[stage] = (timings[stage] ?? 0) + Math.max(0, duration);
  };
  const measureSync: MeasureSync = (stage, work) => {
    const start = now();
    try { return work(); } finally { record(stage, now() - start); }
  };
  return {
    measureSync,
    async measure<T>(stage: AnalysisStage, work: () => Promise<T>): Promise<T> {
      const start = now();
      try { return await work(); } finally { record(stage, now() - start); }
    },
    record,
    semanticMatcher(metrics: SemanticMatcherMetrics) {
      // Explicit numeric allowlist; never spread caller/model data into logs.
      semanticMatcher = {
        ...(metrics.audit ? { audit: sanitizeSemanticAudit(metrics.audit) } : {}),
        invoked: metrics.invoked === true,
        deterministicMatches: finite(metrics.deterministicMatches) ?? 0,
        unresolvedCandidates: finite(metrics.unresolvedCandidates) ?? 0,
        semanticCandidatesSent: finite(metrics.semanticCandidatesSent) ?? 0,
        semanticMatchesAccepted: finite(metrics.semanticMatchesAccepted) ?? 0,
        durationMs: finite(metrics.durationMs) ?? 0,
      };
    },
    document(index: number, bytes: number, pages: number, characters: number, durationMs: number) {
      documents.push({ index, bytes, pages, characters, durationMs });
    },
    usage(kind: "extraction" | "semantic", durationMs: number, success: boolean, response?: unknown) {
      calls.push({ kind, model: ANALYSIS_MODEL, durationMs, success, usage: numericUsage(response) });
    },
    uploadedDocuments(count: number) { documentCount = count; },
    products(count: number) { products += count; },
    upload(bytes: number) { uploadBytes += bytes; },
    snapshot(status: number) {
      return {
        event: "analysis.metrics",
        requestId: /^[a-f0-9-]{36}$/iu.test(requestId) ? requestId : undefined,
        status, totalMs: Math.max(0, now() - start), timings: { ...timings },
        ...(semanticMatcher ? { semanticMatcher: { ...semanticMatcher,
          inputTokens: calls.find((call) => call.kind === "semantic")?.usage.inputTokens ?? (semanticMatcher.invoked ? null : 0),
          outputTokens: calls.find((call) => call.kind === "semantic")?.usage.outputTokens ?? (semanticMatcher.invoked ? null : 0),
        } } : {}),
        uploadBytes, documentCount, parsedDocumentCount: documents.length, products,
        documents: documents.map((item) => ({ ...item })),
        calls: calls.map((item) => ({ ...item, usage: { ...item.usage } })),
      };
    },
  };
}
export type AnalysisTelemetry = ReturnType<typeof createAnalysisTelemetry>;
