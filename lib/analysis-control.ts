import { MAX_PDF_REQUEST_BYTES, PdfSecurityError } from "./pdf-upload-security.ts";

// One active pipeline per process: at most one PDF worker and two side-level
// extraction calls. No unbounded queue retaining request bodies in memory.
export const MAX_ACTIVE_ANALYSES = 1;
export const MAX_CONCURRENT_SIDE_ANALYSES = 2;
export const ANALYSIS_DEADLINE_MS = 220_000;
export const PDF_TIMEOUT_MS = 45_000;

export class AnalysisControlError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function createAnalysisAdmission(limit = MAX_ACTIVE_ANALYSES) {
  let active = 0;
  return {
    acquire() {
      if (active >= limit) throw new AnalysisControlError(429, "analysis_capacity", "Analysetjenesten er opptatt. Prøv igjen om litt.");
      active++;
      let released = false;
      return () => { if (!released) { released = true; active--; } };
    },
  };
}
export const analysisAdmission = createAnalysisAdmission();

export function requestLifecycle(clientSignal: AbortSignal, timeoutMs = ANALYSIS_DEADLINE_MS) {
  const controller = new AbortController();
  const onClientAbort = () => controller.abort(new AnalysisControlError(499, "client_aborted", "Analysen ble avbrutt."));
  clientSignal.addEventListener("abort", onClientAbort, { once: true });
  if (clientSignal.aborted) onClientAbort();
  const timer = setTimeout(() => controller.abort(
    new AnalysisControlError(504, "analysis_timeout", "Analysen tok for lang tid. Prøv igjen med færre dokumenter."),
  ), timeoutMs);
  return {
    controller,
    signal: controller.signal,
    dispose() { clearTimeout(timer); clientSignal.removeEventListener("abort", onClientAbort); },
  };
}

export async function readBoundedFormData(
  request: Request, signal: AbortSignal, onBytes: (bytes: number) => void = () => {},
): Promise<FormData> {
  signal.throwIfAborted();
  if (!request.body) throw new PdfSecurityError(422, "invalid_form_data", "Opplastingen kunne ikke leses.");
  let bytes = 0;
  let sizeError: PdfSecurityError | undefined;
  const body = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytes += chunk.byteLength;
      onBytes(chunk.byteLength);
      if (bytes > MAX_PDF_REQUEST_BYTES) {
        sizeError = new PdfSecurityError(413, "request_too_large", "Opplastingen er for stor. Maks samlet størrelse er 25 MiB.");
        throw sizeError;
      }
      controller.enqueue(chunk);
    },
  }), { signal });
  try {
    const bounded = new Request(request.url, {
      method: "POST", headers: { "content-type": request.headers.get("content-type") ?? "" },
      body, duplex: "half", signal,
    } as RequestInit);
    return await bounded.formData();
  } catch {
    signal.throwIfAborted();
    if (sizeError) throw sizeError;
    throw new PdfSecurityError(422, "invalid_form_data", "Opplastingen kunne ikke leses.");
  }
}

// Fixed two-side API boundary. All PDF validation must finish before this call.
// Wait for cancellation/settlement of siblings before releasing admission.
export async function analyzeAgreementSides<T>(
  sides: readonly (() => Promise<T>)[], controller: AbortController,
): Promise<T[]> {
  if (sides.length > MAX_CONCURRENT_SIDE_ANALYSES) throw new Error("Invalid agreement side count");
  controller.signal.throwIfAborted();
  const settled = await Promise.allSettled(sides.map(async (work) => {
    try { return await work(); } catch (error) {
      if (!controller.signal.aborted) controller.abort(error);
      throw error;
    }
  }));
  if (controller.signal.aborted) throw controller.signal.reason;
  return settled.map((item) => {
    if (item.status === "rejected") throw item.reason;
    return item.value;
  });
}
