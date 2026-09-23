import { parentPort, workerData } from "node:worker_threads";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

PDFParse.setWorker(getPath());
let parser;
try {
  parser = new PDFParse({ data: workerData.data, verbosity: 0, isEvalSupported: false });
  const start = performance.now();
  // getInfo loads the document once; getText reuses that loaded document.
  const info = await parser.getInfo();
  const parseMs = performance.now() - start;
  if (info.total > workerData.maxPages) {
    parentPort.postMessage({ error: "too_many_pages" });
  } else {
    const textStart = performance.now();
    const result = await parser.getText();
    const textMs = performance.now() - textStart;
    if (result.text.length > workerData.maxCharacters) {
      parentPort.postMessage({ error: "too_much_text" });
    } else {
      parentPort.postMessage({ text: result.text, pages: result.total, parseMs, textMs });
    }
  }
} catch (error) {
  // Never transmit parser messages, document metadata, paths or stack traces.
  parentPort.postMessage({ error: /password/i.test(error?.name ?? "") ? "encrypted_pdf" : "invalid_pdf" });
} finally {
  try { await parser?.destroy(); } catch { /* No raw logging. */ }
}
