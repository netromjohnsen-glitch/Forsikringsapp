import { safeProgress, type ProgressEvent } from "./analysis-progress.ts";
import { validatePdfFileList, validateAggregatePdfBytes } from "./pdf-upload-security.ts";
export function validateUploadSelection(existing: readonly File[], offer: readonly File[]) {
  for (const files of [existing, offer]) if (files.length) validatePdfFileList(files);
  validateAggregatePdfBytes([existing, offer]);
}
const analysisFailure = "Analysen kunne ikke fullføres. Prøv igjen.";
const incompleteResponse = "Forbindelsen ble brutt før resultatet kom. Start analysen på nytt.";
const invalidStatus = "Ugyldig analysesvar. Start analysen på nytt.";
const maxFrameLength = 32 * 1024 * 1024;

function analysisError(data: unknown): string {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return data.error.trim() || analysisFailure;
  }
  return analysisFailure;
}

function readFrame(line: string, onProgress: (event: ProgressEvent) => void, parseFailed: string) {
  if (line.length > maxFrameLength) throw new Error("Analyseresultatet er for stort.");
  if (!line.trim()) return;

  let frame: { type?: unknown; data?: unknown; event?: unknown } | null;
  try {
    frame = JSON.parse(line);
  } catch {
    throw new Error(parseFailed);
  }
  if (frame?.type === "progress") {
    let event: ProgressEvent;
    try { event = safeProgress(frame.event); }
    catch { throw new Error(invalidStatus); }
    onProgress(event);
  } else if (frame?.type === "result" && "data" in frame) {
    return { data: frame.data };
  } else if (frame?.type === "error") {
    throw new Error(analysisError(frame));
  } else if (frame?.type !== "heartbeat") {
    throw new Error(invalidStatus);
  }
}

export async function readAnalysisResponse(response: Response, onProgress: (event: ProgressEvent) => void): Promise<unknown> {
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/x-ndjson")) {
    const data: unknown = await response.json().catch(() => {
      throw new Error(response.ok ? invalidStatus : analysisFailure);
    });
    if (!response.ok) throw new Error(analysisError(data));
    return data;
  }
  if (!response.body) throw new Error(incompleteResponse);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let start = 0;
      for (let end = buffer.indexOf("\n"); end !== -1; end = buffer.indexOf("\n", start)) {
        const result = readFrame(buffer.slice(start, end), onProgress, invalidStatus);
        if (result) {
          if (!response.ok) throw new Error(analysisFailure);
          return result.data;
        }
        start = end + 1;
      }
      buffer = buffer.slice(start);
      if (buffer.length > maxFrameLength) throw new Error("Analyseresultatet er for stort.");
      if (done) {
        const result = readFrame(buffer, onProgress, incompleteResponse);
        if (!result) throw new Error(incompleteResponse);
        if (!response.ok) throw new Error(analysisFailure);
        return result.data;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
