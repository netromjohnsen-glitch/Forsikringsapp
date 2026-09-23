import { safeProgress, type ProgressEvent } from "./analysis-progress.ts";
import { validatePdfFileList, validateAggregatePdfBytes } from "./pdf-upload-security.ts";
export function validateUploadSelection(existing: readonly File[], offer: readonly File[]) {
  for (const files of [existing, offer]) if (files.length) validatePdfFileList(files);
  validateAggregatePdfBytes([existing, offer]);
}
export async function readAnalysisResponse(response: Response, onProgress: (event: ProgressEvent) => void): Promise<unknown> {
  if (!response.headers.get("content-type")?.includes("application/x-ndjson")) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysen kunne ikke fullføres.");
    return data;
  }
  if (!response.body) throw new Error("Forbindelsen ble brutt. Start analysen på nytt.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > 32 * 1024 * 1024) throw new Error("Analyseresultatet er for stort.");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline+1);
        if (!line.trim()) continue;
        const frame = JSON.parse(line);
        if (frame.type === "progress") onProgress(safeProgress(frame.event));
        else if (frame.type === "result") return frame.data;
        else if (frame.type === "error") throw new Error(typeof frame.error === "string" ? frame.error : "Analysen kunne ikke fullføres.");
        else if (frame.type !== "heartbeat") throw new Error("Ugyldig analysestatus.");
      }
    }
    throw new Error("Forbindelsen ble brutt før resultatet kom. Start analysen på nytt.");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
