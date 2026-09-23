// Run after: npx next build --webpack
// Entirely local: synthetic PDF, random ephemeral pilot credentials, fake OpenAI.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { syntheticPdf } from "../tests/helpers/synthetic-pdf.mjs";

const calls = [];
let peak = 0;
let active = 0;
let apiFailure = false;
const mock = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString());
  calls.push({ kind: input.text.format.name, model: input.model, store: input.store });
  peak = Math.max(peak, ++active);
  await new Promise((resolve) => setTimeout(resolve, 150));
  active--;
  if (apiFailure) {
    response.writeHead(429, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: { message: "PRIVATE_STUB_ERROR", type: "rate_limit_error" } }));
    return;
  }
  const content = input.text.format.name === "semantic_insurance_matches" ? { decisions: [] } : {
    company: "Syntetisk selskap", totalAnnualPremium: null, totalAnnualPremiumScope: "partial_or_unclear",
    insurances: ["Bil", "Hus", "Innbo", "Reise"].map((type) => ({
      type, productName: "Test", canonicalProductName: null, annualPremium: null, deductible: null,
      coverageSummary: "PRIVATE_OUTPUT_SENTINEL",
      importantTerms: [], addOns: [],
    })),
  };
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({
    id: "resp_local", object: "response", status: "completed", model: input.model,
    output: [{ type: "message", role: "assistant", status: "completed", id: "msg_local",
      content: [{ type: "output_text", text: JSON.stringify(content), annotations: [] }] }],
    usage: { input_tokens: 123, output_tokens: 45, total_tokens: 168, input_tokens_details: { cached_tokens: 12 } },
  }));
});
mock.listen(0, "127.0.0.1");
await once(mock, "listening");
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const code = randomUUID();
const secret = randomUUID() + randomUUID();
const key = randomUUID();
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, PILOT_ACCESS_CODE: code, PILOT_SESSION_SECRET: secret,
    OPENAI_API_KEY: key, OPENAI_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1`,
    NEXT_TELEMETRY_DISABLED: "1", OPENAI_LOG: "debug" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
child.stdout.on("data", (chunk) => { logs += chunk.toString(); });
child.stderr.on("data", (chunk) => { logs += chunk.toString(); });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + "/pilot-access")).status === 200; } catch { /* startup */ }
    if (ready) break;
    await delay(100);
  }
  assert.ok(ready, "production server must start");
  const unauthorized = await fetch(base + "/api/analyze", { method: "POST" });
  assert.equal(unauthorized.status, 401);
  assert.equal(calls.length, 0);
  const login = await fetch(base + "/api/pilot-access", {
    method: "POST", headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";", 1)[0];
  const headers = { origin: base, cookie };
  const manual = {
    company: "Gjensidige", totalAnnualPremium: "",
    products: [{ type: "Bil", productName: "Kasko", annualPremium: "", deductible: "",
      coverageSummary: "", importantTerms: [],
      catalogReference: { providerId: "gjensidige", productId: "gj-bil-kasko", version: null }, addOnIds: [] }],
  };
  const manualForm = () => {
    const body = new FormData();
    for (const side of ["existing", "offer"]) { body.set(side + "Mode", "manual"); body.set(side + "Manual", JSON.stringify(manual)); }
    return body;
  };
  const manualResult = await fetch(base + "/api/analyze", { method: "POST", headers, body: manualForm() });
  assert.equal(manualResult.status, 200);
  assert.equal(calls.length, 0);
  const pdfForm = () => {
    const body = new FormData();
    for (const side of ["existing", "offer"]) {
      body.set(side + "Mode", "pdf");
      body.append(side + "Files", new File([syntheticPdf(1, "Bil Hus Innbo Reise PRIVATE_PDF_SENTINEL")], "../../PRIVATE_FILENAME.pdf", { type: "application/pdf" }));
    }
    return body;
  };
  const pending = fetch(base + "/api/analyze", { method: "POST", headers, body: pdfForm() });
  for (let i = 0; i < 100 && !active; i++) await delay(10);
  const busy = await fetch(base + "/api/analyze", { method: "POST", headers, body: manualForm() });
  assert.equal(busy.status, 429);
  assert.equal(busy.headers.get("retry-after"), "5");
  const response = await pending;
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/u);
  const result = await response.json();
  assert.deepEqual(result.documents.map((document) => document.insuranceData.insurances.length), [4, 4]);
  assert.equal(calls.length, 2);
  assert.equal(peak, 2);
  assert.ok(calls.every((call) => call.store === false && call.model === "gpt-5.6-luna"));

  const corrupt = pdfForm();
  corrupt.set("existingFiles", new File(["%PDF-1.7\nPRIVATE_INVALID"], "bad.pdf", { type: "application/pdf" }));
  const rejected = await fetch(base + "/api/analyze", { method: "POST", headers, body: corrupt });
  assert.equal(rejected.status, 422);
  assert.equal(calls.length, 2, "all PDFs must pass parsing before any AI call");

  const extra = manualForm();
  extra.set("unexpected", "PRIVATE");
  assert.equal((await fetch(base + "/api/analyze", { method: "POST", headers, body: extra })).status, 422);

  apiFailure = true;
  const failed = await fetch(base + "/api/analyze", { method: "POST", headers, body: pdfForm() });
  assert.equal(failed.status, 429);
  assert.doesNotMatch(await failed.text(), /PRIVATE_STUB_ERROR/u);
  assert.equal(calls.length, 4, "zero retries");
  apiFailure = false;
  assert.equal((await fetch(base + "/api/analyze", { method: "POST", headers, body: manualForm() })).status, 200);
  await delay(100);
  for (const sensitive of [code, secret, key, "PRIVATE_PDF_SENTINEL", "PRIVATE_OUTPUT_SENTINEL", "PRIVATE_FILENAME", "PRIVATE_STUB_ERROR", "PRIVATE_INVALID"]) {
    assert.equal(logs.includes(sensitive), false, "sensitive test marker must not enter server logs");
  }
  const metrics = logs.split("\n").filter((line) => line.startsWith("ANALYSIS_METRICS "))
    .map((line) => JSON.parse(line.slice("ANALYSIS_METRICS ".length)));
  const success = metrics.find((entry) => entry.status === 200 && entry.calls.length === 2);
  assert.ok(success);
  assert.equal(success.products, 8);
  assert.equal(success.documentCount, 2);
  assert.equal(success.calls[0].usage.totalTokens, 168);
  assert.ok(Array.isArray(success.semanticMatcher.audit.candidates));
  assert.ok(Array.isArray(success.semanticMatcher.audit.decisions));
  assert.equal(success.semanticMatcher.audit.omitted, 0);
  assert.equal(success.semanticMatcher.invoked, false);
  assert.equal(success.semanticMatcher.semanticCandidatesSent, 0);
  assert.equal(success.semanticMatcher.deterministicMatches, 4);
  assert.equal(success.semanticMatcher.inputTokens, 0);
  assert.equal(success.semanticMatcher.outputTokens, 0);
  console.log(JSON.stringify({ result: "PASS", checks: [
    "unauthorized", "manual/catalog", "synthetic PDF to mocked AI to response",
    "two-side concurrency", "N documents to M products", "capacity limit", "invalid PDF before AI",
    "strict form fields", "429/no retries/sibling abort", "admission released", "private logging", "semantic fallback telemetry/no unnecessary AI",
  ], syntheticMetrics: success }, null, 2));
} finally {
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(3000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await new Promise((resolve) => mock.close(resolve));
}
