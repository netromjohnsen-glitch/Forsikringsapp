// Run after: npx next build --webpack
// Entirely local: synthetic PDF, random ephemeral pilot credentials, fake OpenAI.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { syntheticPdf } from "../tests/helpers/synthetic-pdf.mjs";

import { pdfAddonSelection } from "../tests/helpers/pdf-addon-selection.mjs";
import { readAnalysisResponse } from "../lib/analysis-client.ts";
import { groupAddOnNames, groupInsurances } from "../lib/comparison.ts";

const calls = [];
let addonScenario = false;
let vehicleObjectScenario = false;
let portfolioScenario = false;
let portfolioCalls = 0;
let consolidationScenario = false;
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
  const content = input.text.format.name === "semantic_insurance_matches" ? { decisions: [] } : addonScenario ? pdfAddonSelection() : {
    company: vehicleObjectScenario ? "If" : "Syntetisk selskap", totalAnnualPremium: null, totalAnnualPremiumScope: "partial_or_unclear",
    insurances: (vehicleObjectScenario ? ["Bil", "Snøscooter", "Campingvogn", "Tilhenger"] : ["Bil", "Hus", "Innbo", "Reise"]).map((type) => ({
      type, company: vehicleObjectScenario ? "If" : "Syntetisk selskap", documentIndices: Array.from({length: input.text.format.schema.properties.insurances.items.properties.documentIndices.maxItems}, (_,i)=>i+1), productName: vehicleObjectScenario ? "Kasko" : "Test", canonicalProductName: vehicleObjectScenario ? "Kasko" : null, annualPremium: null, deductible: null,
      coverageSummary: "PRIVATE_OUTPUT_SENTINEL",
      importantTerms: [], addOns: [],
    })),
  };
  if (portfolioScenario && input.text.format.name !== "semantic_insurance_matches") {
    const reverse = portfolioCalls++ % 2 === 1;
    content.insurances = ["Bil", "Bil", "Bil", "Tilhenger", "Tilhenger", "Snøscooter", "Campingvogn"].map((type, i) => ({
      ...content.insurances[0], type, company: reverse ? "Tryg" : "If", productName: "Kasko", canonicalProductName: "Kasko",
      objectIdentifiers: [{ type: "registration", value: `ZZ90${100+i}`, documentIndices: [1] }],
      importantTerms: [{ name: "Forsikringspris", value: `${1000+i} kr`, canonicalKey: "premie.ekskl_tfa", documentIndices: [1] }],
    }));
    if (consolidationScenario) {
      content.insurances = content.insurances.flatMap((item, i) => [
        { ...item, documentIndices: [1], documentRole: "individual_agreement", agreementPeriod: null },
        ...(i === 0 || i === 2 || i === 3 ? [{ ...item, documentIndices: [2], documentRole: "individual_agreement", agreementPeriod: null,
          objectIdentifiers: item.objectIdentifiers.map(id => ({ ...id, documentIndices: [2] })),
          importantTerms: [{ name: "Egenandel", value: "6000 kr", canonicalKey: null, documentIndices: [2] }] }] : []),
      ]);
    }
    if (reverse) content.insurances.reverse();
  }
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
  addonScenario = true;
  const addonResponse = await fetch(base + "/api/analyze", { method: "POST", headers, body: pdfForm() });
  assert.equal(addonResponse.status, 200);
  const addonResult = await addonResponse.json();
  for (const document of addonResult.documents) {
    const insurance = document.insuranceData.insurances[0];
    assert.deepEqual(insurance.addOns, []);
    assert.ok(insurance.catalogReference);
    assert.equal(groupAddOnNames([insurance], "bil"), "Leiebil · Maskinskade");
  }
  assert.equal(calls.length, 6, "addon regression adds only the two expected extraction calls, no semantic call");
  addonScenario = false;
  const multiForm = (count, corruptIndex = -1) => {
    const body = new FormData();
    for (const side of ["existing", "offer"]) {
      body.set(side + "Mode", "pdf");
      for (let i=0; i<count; i++) body.append(side + "Files", new File([
        side === "existing" && i === corruptIndex ? "%PDF-1.7\nINVALID_PHASE2" : syntheticPdf(1, `Synthetic PRIVATE_PDF_SENTINEL ${side} ${i}`)
      ], `PRIVATE_FILENAME_${i}.pdf`, {type:"application/pdf"}));
    }
    return body;
  };
  const progress = [];
  const beforeMulti = calls.length;
  const streamed = await fetch(base + "/api/analyze", {method:"POST", headers:{...headers,accept:"application/x-ndjson"},body:multiForm(10)});
  assert.match(streamed.headers.get("content-type"),/application\/x-ndjson/);
  assert.match(streamed.headers.get("cache-control"),/no-store/);
  const multi = await readAnalysisResponse(streamed, event=>progress.push(event));
  assert.equal(multi.analysis.successfulDocuments,20);
  assert.equal(multi.analysis.partialSuccess,false);
  assert.equal(calls.length-beforeMulti,2,"20 small PDFs use two extraction calls, not twenty");
  assert.equal(peak,2);
  assert.equal(progress.filter(e=>e.type==='document_status'&&e.status==='completed').length,20);
  assert.equal(progress.filter(e=>e.type==='product_status'&&e.status==='identified').length,8);
  assert.ok(!JSON.stringify(progress).includes('PRIVATE'));
  assert.equal(multi.documents[0].insuranceData.insurances[0].documentReferences.length,10);
  const overLimitCalls=calls.length;
  const tooMany=await fetch(base+'/api/analyze',{method:'POST',headers,body:multiForm(11)});
  assert.equal(tooMany.status,413);assert.equal(calls.length,overLimitCalls);
  const partialProgress=[];
  const partialResponse=await fetch(base+'/api/analyze',{method:'POST',headers:{...headers,accept:'application/x-ndjson'},body:multiForm(3,1)});
  const partial=await readAnalysisResponse(partialResponse,e=>partialProgress.push(e));
  assert.equal(partial.analysis.partialSuccess,true);assert.equal(partial.analysis.failedDocuments,1);assert.equal(partial.analysis.successfulDocuments,5);
  assert.equal(partialProgress.at(-1).partialSuccess,true);
  vehicleObjectScenario = true;
  const vehicleProgress = [], beforeVehicle = calls.length;
  const vehicleResponse = await fetch(base+'/api/analyze', {method:'POST',headers:{...headers,accept:'application/x-ndjson'},body:multiForm(3)});
  const vehicleResult = await readAnalysisResponse(vehicleResponse,e=>vehicleProgress.push(e));
  assert.equal(vehicleResult.analysis.successfulDocuments,6);
  assert.equal(calls.length-beforeVehicle,2,'new types introduce no extra AI calls');
  for (const document of vehicleResult.documents) {
    assert.deepEqual(document.insuranceData.insurances.map(p=>p.type),['Bil','Snøscooter','Campingvogn','Tilhenger']);
    assert.ok(document.insuranceData.insurances.every(p=>p.catalogReference?.providerId==='if'));
    assert.ok(document.insuranceData.insurances.every(p=>p.documentReferences.length===3));
  }
  assert.equal(groupInsurances(...vehicleResult.documents.map(d=>d.insuranceData.insurances),null).length,4);
  for(const type of ['snøscooter','campingvogn','tilhenger'])assert.ok(vehicleProgress.some(e=>e.type==='product_status'&&e.insuranceType===type));
  portfolioScenario = true;
  const portfolioProgress = [];
  const portfolioResponse = await fetch(base+'/api/analyze', {method:'POST',headers:{...headers,accept:'application/x-ndjson'},body:multiForm(3)});
  const portfolioResult = await readAnalysisResponse(portfolioResponse,e=>portfolioProgress.push(e));
  const portfolioGroups = groupInsurances(...portfolioResult.documents.map(d=>d.insuranceData.insurances),portfolioResult.matchingPlan);
  assert.equal(portfolioGroups.length,7);
  assert.ok(portfolioGroups.every(g=>g.objectMatch.reason==='EXACT_OBJECT_ID' && g.first[0].objectIdentifiers[0].value===g.second[0].objectIdentifiers[0].value));
  assert.ok(portfolioResult.documents.every(d=>d.insuranceData.insurances.every(p=>p.objectIdentifiers[0].sources[0].documentId.startsWith('pdf:'))));
  assert.equal(portfolioCalls,2);
  assert.doesNotMatch(JSON.stringify(portfolioProgress),/ZZ90[0-9]+/);
  assert.doesNotMatch(logs,/ZZ90[0-9]+/);
  consolidationScenario = true;
  const consolidatedResponse = await fetch(base+'/api/analyze', {method:'POST',headers:{...headers,accept:'application/x-ndjson'},body:multiForm(3)});
  const consolidatedResult = await readAnalysisResponse(consolidatedResponse, e=>assert.doesNotMatch(JSON.stringify(e),/ZZ90[0-9]+/));
  for (const document of consolidatedResult.documents) {
    const objects = document.insuranceData.insurances;
    assert.equal(objects.length,7);
    assert.equal(objects.filter(p=>p.consolidation.status==='consolidated').length,3);
    for (const object of objects.filter(p=>p.consolidation.status==='consolidated')) {
      assert.equal(object.recordEvidence.length,2);
      assert.equal(object.documentReferences.length,2);
      assert.ok(object.importantTerms.some(t=>t.value==='6000 kr'));
      assert.ok(object.importantTerms.some(t=>t.key==='premie.ekskl_tfa'));
    }
  }
  assert.ok(groupInsurances(...consolidatedResult.documents.map(d=>d.insuranceData.insurances),consolidatedResult.matchingPlan).every(g=>g.objectMatch.reason==='EXACT_OBJECT_ID'));
  assert.doesNotMatch(logs,/ZZ90[0-9]+/);
  consolidationScenario = false;
  portfolioScenario = false;
  vehicleObjectScenario = false;
  await delay(100);
  const aborted = new AbortController();
  const abortResponse = await fetch(base+'/api/analyze',{method:'POST',headers:{...headers,accept:'application/x-ndjson'},body:multiForm(2),signal:aborted.signal});
  const abortReader = abortResponse.body.getReader();
  await abortReader.read();
  aborted.abort();
  await abortReader.cancel().catch(()=>{});
  let released=false;
  for(let i=0;i<100;i++) {
    await delay(50);
    const retry=await fetch(base+'/api/analyze',{method:'POST',headers,body:manualForm()});
    if(retry.status===200){released=true;break;}
    assert.equal(retry.status,429);
  }
  assert.equal(released,true,'disconnect releases admission and aborts server work');
  const multiMetrics=logs.split('\n').filter(line=>line.startsWith('ANALYSIS_METRICS ')).map(line=>JSON.parse(line.slice('ANALYSIS_METRICS '.length))).find(m=>m.successfulDocuments===20);
  assert.equal(multiMetrics.batchCount,2);assert.equal(multiMetrics.maxConcurrentExtractions,2);assert.equal(multiMetrics.extractionCalls,2);
  for(const value of [code,secret,key,'PRIVATE_PDF_SENTINEL','PRIVATE_OUTPUT_SENTINEL','PRIVATE_FILENAME','INVALID_PHASE2'])assert.equal(logs.includes(value),false);
  console.log(JSON.stringify({ result: "PASS", checks: [
    "Phase 2: 10+10 streamed, two calls, concurrency, provenance, 11 rejected, partial corrupt PDF, safe progress/metrics",
    "Cross-document consolidation: 10 records per side -> 7 exact object pairs, complementary facts and provenance",
    "7-object portfolio: 3 cars + 2 trailers + snowmobile + caravan, shuffled IDs, provenance, private progress/logging",
    "Bil + snowmobile + caravan + trailer through HTTP, exact If catalogs, provenance and friendly progress",
    "PDF details with empty addOns through HTTP, enrichment, sanitizer and comparison",

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
