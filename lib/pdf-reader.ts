import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { AnalysisControlError, PDF_TIMEOUT_MS } from "./analysis-control.ts";
import {
  MAX_PDF_PAGES_PER_FILE, MAX_PDF_TEXT_CHARS_PER_FILE,
  PdfSecurityError, validateParsedPdf, type PreparedPdf,
} from "./pdf-upload-security.ts";

export type ParsedPdf = { text: string; pages: number; parseMs: number; textMs: number };
export async function readPdf(
  pdf: PreparedPdf, signal: AbortSignal, timeoutMs = PDF_TIMEOUT_MS,
): Promise<ParsedPdf> {
  signal.throwIfAborted();
  // The path is application-controlled; uploaded names are never used.
  const worker = new Worker(resolve(process.cwd(), "lib/pdf-text-worker.mjs"), {
    workerData: { data: pdf.data, maxPages: MAX_PDF_PAGES_PER_FILE, maxCharacters: MAX_PDF_TEXT_CHARS_PER_FILE },
    transferList: [pdf.data.buffer as ArrayBuffer],
    resourceLimits: { maxOldGenerationSizeMb: 256 },
    env: {}, stdout: true, stderr: true,
  });
  // Third-party parser diagnostics must not reach application logs.
  worker.stdout.resume();
  worker.stderr.resume();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  try {
    return await new Promise<ParsedPdf>((resolveResult, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) onAbort();
      timer = setTimeout(() => reject(new AnalysisControlError(504, "pdf_timeout", "PDF-en tok for lang tid å behandle.")), timeoutMs);
      worker.once("error", () => reject(new PdfSecurityError(422, "invalid_pdf", "PDF-en kunne ikke behandles.")));
      worker.once("exit", () => reject(new PdfSecurityError(422, "invalid_pdf", "PDF-behandlingen ble avbrutt.")));
      worker.once("message", (result) => {
        try {
          if (result.error === "too_many_pages") throw new PdfSecurityError(413, result.error, "PDF-en har for mange sider. Maks er 150 sider per fil.");
          if (result.error === "too_much_text") throw new PdfSecurityError(413, result.error, "PDF-en inneholder for mye tekst for pilotversjonen.");
          if (result.error) throw new PdfSecurityError(422, result.error === "encrypted_pdf" ? "encrypted_pdf" : "invalid_pdf",
            result.error === "encrypted_pdf" ? "PDF-en er passordbeskyttet eller kryptert og kan ikke analyseres." : "PDF-en er korrupt eller kan ikke leses.");
          validateParsedPdf(result.pages, result.text);
          resolveResult(result);
        } catch (error) { reject(error); }
      });
    });
  } finally {
    clearTimeout(timer);
    if (onAbort) signal.removeEventListener("abort", onAbort);
    await worker.terminate();
  }
}
