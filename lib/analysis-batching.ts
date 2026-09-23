import { createHash } from "node:crypto";
import { buildUntrustedDocumentInput } from "./document-redaction.ts";
import { PdfSecurityError, type PreparedPdf } from "./pdf-upload-security.ts";
import { type AnalysisSide } from "./analysis-progress.ts";
export const MAX_JOB_PAGES = 400;
export const MAX_JOB_INPUT_BYTES = 1_000_000;
export const MAX_BATCH_INPUT_BYTES = 160_000;
export const MAX_BATCH_PAGES = 150;
export const MAX_EXTRACTION_BATCHES = 8;
export const MAX_JOB_PRODUCTS = 120;
export const MAX_CONCURRENT_EXTRACTIONS = 2;
// UTF-8 bytes form a conservative upper token estimate; reserve 16k for instructions/schema.
export const INPUT_TOKEN_OVERHEAD = 16_000;
export type TextDocument = { side: AnalysisSide; documentIndex: number; text: string; pages: number };
export type ExtractionBatch = { side: AnalysisSide; batchIndex: number; documents: TextDocument[]; input: string; estimatedInputTokens: number; pages: number };
export function rejectDuplicatePdfs(files: readonly PreparedPdf[]) {
  const seen = new Set<string>();
  for (const file of files) {
    const hash = createHash("sha256").update(file.data).digest("hex");
    if (seen.has(hash)) throw new PdfSecurityError(422, "duplicate_pdf", "Samme PDF er lagt til flere ganger på én side. Fjern duplikatet.");
    seen.add(hash);
  }
}
export function planExtractionBatches(documents: readonly TextDocument[]): ExtractionBatch[] {
  const batches: ExtractionBatch[] = [];
  let totalBytes = 0;
  let totalPages = 0;
  for (const side of ["existing", "offer"] as const) {
    let group: TextDocument[] = [];
    const flush = () => {
      if (!group.length) return;
      const input = buildUntrustedDocumentInput(group.map((d) => d.text));
      const bytes = Buffer.byteLength(input);
      totalBytes += bytes;
      batches.push({ side, batchIndex: batches.length, documents: group, input, pages: group.reduce((sum,d) => sum+d.pages,0), estimatedInputTokens: bytes + INPUT_TOKEN_OVERHEAD });
      group = [];
    };
    for (const doc of documents.filter((d) => d.side === side).sort((a,b) => a.documentIndex-b.documentIndex)) {
      totalPages += doc.pages;
      const input = buildUntrustedDocumentInput([doc.text]);
      if (Buffer.byteLength(input) > MAX_BATCH_INPUT_BYTES || doc.pages > MAX_BATCH_PAGES) throw new PdfSecurityError(413, "document_input_budget", "Én PDF overskrider analysebudsjettet. Del dokumentet ved naturlige produktgrenser og prøv igjen.");
      const candidate = [...group, doc];
      if (group.length && (Buffer.byteLength(buildUntrustedDocumentInput(candidate.map((d) => d.text))) > MAX_BATCH_INPUT_BYTES || candidate.reduce((sum,d) => sum+d.pages,0) > MAX_BATCH_PAGES)) flush();
      group.push(doc);
    }
    flush();
  }
  if (totalPages > MAX_JOB_PAGES || totalBytes > MAX_JOB_INPUT_BYTES || batches.length > MAX_EXTRACTION_BATCHES) throw new PdfSecurityError(413, "job_resource_budget", "Samlet dokumentmengde er for stor. Bruk færre sider eller mindre tekst i én sammenligning.");
  return batches;
}
export async function runBatchPool<T>(batches: readonly ExtractionBatch[], controller: AbortController, work: (batch: ExtractionBatch) => Promise<T>, onConcurrency: (count: number) => void = () => {}): Promise<T[]> {
  const results: T[] = new Array(batches.length);
  let next = 0, active = 0;
  await Promise.allSettled(Array.from({ length: Math.min(MAX_CONCURRENT_EXTRACTIONS, batches.length) }, async () => {
    while (!controller.signal.aborted) {
      const index = next++;
      if (index >= batches.length) return;
      active++; onConcurrency(active);
      try { results[index] = await work(batches[index]); }
      catch (error) { controller.abort(error); }
      finally { active--; }
    }
  }));
  controller.signal.throwIfAborted();
  return results;
}
