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
import { createDifferences, groupAddOnNames, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { portfolioPrice } from "../lib/portfolio-price-presentation.ts";
import { vehiclePrices } from "../lib/vehicle-price-presentation.ts";
import { clientTraceEvents, sanitizeTraceEvent } from "../lib/production-trace.ts";
import { portfolioDocuments } from "../tests/helpers/supporting-terms.mjs";
import { mcBobilRecord, mcBobilTerm } from "../tests/helpers/mc-bobil.mjs";
import { applyProgress, emptyProgress } from "../lib/analysis-progress.ts";

const calls = [];
let addonScenario = false;
let vehicleObjectScenario = false;
let portfolioScenario = false;
let portfolioCalls = 0;
let consolidationScenario = false;
let priceScenario = false;
let priceScenarioCalls = 0;
let supportingScenario = false;
let supportingCalls = 0;
let supportingPriceMode = 'customer';
let mcBobilScenario = false;
let mcBobilCalls = 0;
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
  if (priceScenario && input.text.format.name !== "semantic_insurance_matches") {
    const reverse = priceScenarioCalls++ % 2 === 1;
    content.insurances = [[8641, 1359, 10321], [7263, 2047, 9527]].map((prices, index) => ({
      ...content.insurances[0], type: "Bil", documentIndices: [index + 1], documentRole: "individual_agreement",
      objectIdentifiers: [{ type: "registration", value: `ZZ8200${index + 1}`, documentIndices: [index + 1] }],
      importantTerms: prices.map((amount, i) => ({
        name: ["Forsikringspris", "Trafikkforsikringsavgift", "Totalpris"][i],
        canonicalKey: ["premie.ekskl_tfa", "premie.tfa", "premie.total"][i],
        value: `${amount} kr${reverse ? "" : "."}`, documentIndices: [index + 1],
      })),
    }));
    if (reverse) content.insurances.reverse();
  }
  if (supportingScenario && input.text.format.name !== "semantic_insurance_matches") {
    const side = supportingCalls++ % 2 ? "offer" : "existing";
    const documents = portfolioDocuments(side);
    if (side === 'existing' && supportingPriceMode !== 'customer') for (const [customer, supporting] of documents) {
      const prices = customer.importantTerms.filter(t => t.canonicalKey?.startsWith('premie.'));
      customer.importantTerms = customer.importantTerms.filter(t => !t.canonicalKey?.startsWith('premie.'));
      if (supportingPriceMode === 'supporting') supporting.importantTerms.push(...prices);
    }
    content.insurances = documents.flatMap((records, index) => records.map(record => ({ ...record,
      documentIndices: [index + 1],
      objectIdentifiers: record.objectIdentifiers.map(id => ({ ...id, documentIndices: [index + 1] })),
      importantTerms: record.importantTerms.map(term => ({ ...term, documentIndices: [index + 1] })),
    })));
  }
  if (mcBobilScenario && input.text.format.name !== "semantic_insurance_matches") {
    const reverse = mcBobilCalls++ % 2 === 1;
    const records = ["MC", "MC", "Bobil", "Bobil"].map((type, index) => {
      const record = mcBobilRecord(type, index + 1, {
        company: reverse ? "Gjensidige" : "If",
        productName: reverse && type === "Bobil" ? "Pluss" : "Kasko",
        canonicalProductName: reverse && type === "Bobil" ? "Pluss" : "Kasko",
      });
      record.importantTerms.push(mcBobilTerm(
        type === "MC" ? "MC kjøreutstyr forsikringssum" : "Fuktskade aldersgrense",
        type === "MC" ? `${17000 + index * 1000} kr` : `${8 + index} år`,
        type === "MC" ? "mc.kjoreutstyr.grense" : "bobil.fukt.alder",
      ));
      return record;
    });
    if (reverse) records.reverse();
    content.company = reverse ? "Gjensidige" : "If";
    content.insurances = records.map((record, index) => ({ ...record, documentIndices: [index + 1],
      objectIdentifiers: record.objectIdentifiers.map(id => ({ ...id, documentIndices: [index + 1] })),
      importantTerms: record.importantTerms.map(term => ({ ...term, documentIndices: [index + 1] })),
    }));
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
    NEXT_TELEMETRY_DISABLED: "1", OPENAI_LOG: "debug", PILOT_TRACE_ENABLED: "true" },
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
  const traceContext = result.analysis.trace;
  assert.match(traceContext.traceId, /^[0-9a-f-]{36}$/u);
  assert.equal(traceContext.objectRefs.left.length, 4);
  assert.equal(traceContext.objectRefs.right.length, 4);
  assert.equal(new Set([...traceContext.objectRefs.left, ...traceContext.objectRefs.right]).size, 8);
  const traceGroups = groupInsurances(...result.documents.map(document => document.insuranceData.insurances), result.matchingPlan);
  const traceDifferences = createDifferences(...result.documents, traceGroups, result.matchingPlan);
  const tracePriceInputs = result.documents.map(() => []);
  const tracePortfolio = result.documents.map((document, sideIndex) => portfolioPrice(document, 0,
    (objectIndex, input) => tracePriceInputs[sideIndex].push({ objectIndex, input })));
  const receiptEvents = clientTraceEvents({
    documents: result.documents, groups: traceGroups, differences: traceDifferences,
    presentedDifferences: presentImportantDifferences(traceDifferences, traceGroups, result.matchingPlan),
    details: traceGroups.map(group => ({ group, terms: groupTerms(group, result.matchingPlan) })),
    portfolioPrices: tracePortfolio, priceInputs: tracePriceInputs, context: traceContext,
    priceBranches: result.documents.map((document, index) =>
      tracePortfolio[index].compatible && (document.insuranceData.insurances.length > 1 || tracePortfolio[index].conflict || tracePortfolio[index].failedDocuments > 0)
        ? "portfolio"
        : document.insuranceData.insurances.length === 1 && vehiclePrices(document.insuranceData.insurances[0])?.some(field => field.value)
          ? "vehicle" : "legacy"),
  });
  const receipt = { traceId: traceContext.traceId, ticket: traceContext.ticket, events: receiptEvents };
  assert.ok(receiptEvents.length > 0 && receiptEvents.every(event => sanitizeTraceEvent(event)));
  assert.doesNotMatch(JSON.stringify(receiptEvents), /PRIVATE|\.pdf|ZZ[0-9]+/u);
  const postReceipt = body => fetch(base + "/api/analysis-trace", {
    method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify(body),
  });
  assert.equal((await postReceipt({ ...receipt, ticket: "PRIVATE_INVALID_TRACE_TICKET" })).status, 400);
  assert.equal((await postReceipt({ ...receipt, events: [{ ...receiptEvents[0], value: "PRIVATE_TRACE_SENTINEL" }] })).status, 400);
  const acceptedReceipt = await postReceipt(receipt);
  assert.equal(acceptedReceipt.status, 200);
  assert.match(acceptedReceipt.headers.get("cache-control"), /no-store/u);
  assert.equal((await postReceipt(receipt)).status, 409, "signed trace receipt is accepted at most once");
  assert.equal(calls.length, 2, "diagnostic receipt never invokes AI");

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
  mcBobilScenario = true;
  const mcBobilProgress = [], callsBeforeMcBobil = calls.length, mcBobilStarted = performance.now();
  const mcBobilResponse = await fetch(base + '/api/analyze', {
    method: 'POST', headers: { ...headers, accept: 'application/x-ndjson' }, body: multiForm(4),
  });
  const mcBobilResult = await readAnalysisResponse(mcBobilResponse, event => mcBobilProgress.push(event));
  const mcBobilDurationMs = Math.round(performance.now() - mcBobilStarted);
  assert.equal(mcBobilResponse.status, 200);
  assert.equal(mcBobilResult.analysis.successfulDocuments, 8);
  assert.equal(mcBobilResult.analysis.failedDocuments, 0);
  assert.equal(mcBobilCalls, 2);
  assert.equal(calls.length - callsBeforeMcBobil, 2, 'MC/Bobil use only two local extraction calls; no semantic or other AI call');
  for (const document of mcBobilResult.documents) {
    const objects = document.insuranceData.insurances;
    assert.equal(objects.length, 4);
    assert.equal(objects.filter(object => object.type === 'MC').length, 2);
    assert.equal(objects.filter(object => object.type === 'Bobil').length, 2);
    for (const object of objects) {
      const isMc = object.type === 'MC';
      assert.ok(object.catalogReference);
      assert.ok(['if', 'gjensidige'].includes(object.catalogReference.providerId));
      assert.equal(object.catalogReference.agreementScope, 'ordinary');
      assert.match(object.catalogReference.productId, isMc ? /-mc-kasko$/u : /-bobil-(?:kasko|pluss)$/u);
      assert.ok(object.catalogFacts.length > 0);
      assert.ok(object.catalogFacts.every(fact => !fact.key.startsWith(isMc ? 'bobil.' : 'mc.')));
      assert.equal(object.documentReferences.length, 1);
      const reference = object.documentReferences[0];
      const documentId = `pdf:${reference.side}:${reference.documentIndex}`;
      assert.ok(object.objectIdentifiers[0].sources.every(source => source.documentId === documentId));
      const key = isMc ? 'mc.kjoreutstyr.grense' : 'bobil.fukt.alder';
      const fact = object.importantTerms.find(term => term.key === key);
      assert.ok(fact, 'type-specific customer fact survives extraction, catalog enrichment and sanitizer');
      assert.equal(fact.coverageOrigin, 'document');
      assert.ok(fact.sources.every(source => source.documentId === documentId));
    }
    const contributions = [];
    const price = portfolioPrice(document, 0, (objectIndex, input) => contributions.push(input));
    assert.equal(price.objectCount, 4);
    assert.equal(price.compatible, true);
    assert.deepEqual(price.components.map(component => [component.completeness, component.priced, component.amount]), [
      ['complete', 4, 401000], ['complete', 4, 81000], ['complete', 4, 482000],
    ]);
    assert.ok(contributions.every(input => input.reason === 'CONTRIBUTION_ACCEPTED'));
  }
  const mcBobilGroups = groupInsurances(...mcBobilResult.documents.map(document => document.insuranceData.insurances), mcBobilResult.matchingPlan);
  assert.equal(mcBobilGroups.length, 4);
  assert.ok(mcBobilGroups.every(group => group.objectMatch.reason === 'EXACT_OBJECT_ID'));
  for (const group of mcBobilGroups) {
    assert.equal(group.first[0].objectIdentifiers[0].value, group.second[0].objectIdentifiers[0].value);
    assert.notEqual(group.first[0].catalogReference.providerId, group.second[0].catalogReference.providerId);
    const details = groupTerms(group, mcBobilResult.matchingPlan);
    for (const key of ['premie.ekskl_tfa', 'premie.tfa', 'premie.total', group.key === 'mc' ? 'mc.kjoreutstyr.grense' : 'bobil.fukt.alder']) {
      const row = details.find(term => term.key === key);
      assert.ok(row?.first && row.second, 'each matched object retains side-by-side detail values');
      assert.equal(row.first, row.second, 'reversed document order must not mix customer facts');
      assert.ok(row.firstSources.length && row.secondSources.length);
    }
  }
  const mcBobilDifferences = createDifferences(...mcBobilResult.documents, mcBobilGroups, mcBobilResult.matchingPlan);
  assert.ok(!mcBobilDifferences.some(difference => difference.kind === 'object'));
  const mcBobilPresentation = presentImportantDifferences(mcBobilDifferences, mcBobilGroups, mcBobilResult.matchingPlan);
  for (const type of ['mc', 'bobil']) {
    assert.ok(mcBobilPresentation.some(difference => difference.insuranceKey === type));
    assert.ok(mcBobilProgress.some(event => event.type === 'product_status' && event.insuranceType === type));
  }
  assert.doesNotMatch(JSON.stringify(mcBobilProgress), /ZZ95[0-9]+/u);
  assert.doesNotMatch(logs, /ZZ95[0-9]+/u);
  mcBobilScenario = false;
  priceScenario = true;
  const callsBeforePrices = calls.length;
  const priceResponse = await fetch(base + '/api/analyze', { method: 'POST', headers: { ...headers, accept: 'application/x-ndjson' }, body: multiForm(2) });
  const priceResult = await readAnalysisResponse(priceResponse, e => assert.doesNotMatch(JSON.stringify(e), /ZZ8200[12]/u));
  assert.equal(priceResponse.status, 200);
  assert.equal(priceResult.analysis.successfulDocuments, 4);
  assert.equal(priceResult.analysis.failedDocuments, 0);
  assert.equal(priceScenarioCalls, 2);
  assert.equal(calls.length - callsBeforePrices, 2, 'price comparison adds no semantic or other AI calls');
  for (const document of priceResult.documents) {
    const inputs = [];
    const price = portfolioPrice(document, 0, (objectIndex, input) => inputs.push(input));
    assert.equal(price.objectCount, 2);
    assert.deepEqual(price.components.map(c => [c.completeness, c.priced, c.expected, c.amount]), [
      ['complete', 2, 2, 1590400], ['complete', 2, 2, 340600], ['complete', 2, 2, 1984800],
    ]);
    assert.ok(inputs.every(p => p.reason === 'CONTRIBUTION_ACCEPTED' && p.comparable));
  }
  assert.doesNotMatch(logs, /ZZ8200[12]/u);
  priceScenario = false;
  supportingScenario = true;
  let supportingProgress = emptyProgress();
  const callsBeforeSupporting = calls.length;
  const supportingResponse = await fetch(base + '/api/analyze', { method: 'POST', headers: { ...headers, accept: 'application/x-ndjson' }, body: multiForm(2) });
  const supportingResult = await readAnalysisResponse(supportingResponse, event => { supportingProgress = applyProgress(supportingProgress, event); });
  assert.equal(supportingResponse.status, 200);
  assert.equal(supportingResult.analysis.successfulDocuments, 4);
  assert.equal(supportingProgress.products.length, 4);
  assert.equal(supportingProgress.documents.filter(d => d.status === 'completed').length, 4);
  assert.equal(calls.length - callsBeforeSupporting, 2, 'supporting terms add no AI calls');
  for (const document of supportingResult.documents) {
    assert.equal(document.insuranceData.insurances.length, 2);
    assert.equal(document.insuranceData.supportingEvidence.length, 2);
    assert.ok(portfolioPrice(document).components.every(c => c.completeness === 'complete' && c.expected === 2));
    for (const object of document.insuranceData.insurances) {
      assert.ok(object.recordEvidence.some(e => e.documentRole === 'general_terms'));
      assert.equal(object.importantTerms.find(t => t.key === 'nyverdi.km').value, object.canonicalProductName === 'Kasko' ? '15 000 km' : '60 000 km');
      assert.equal(object.consolidation.factConflicts?.length ?? 0, 0);
    }
  }
  const supportingGroups = groupInsurances(...supportingResult.documents.map(d => d.insuranceData.insurances), supportingResult.matchingPlan);
  assert.equal(supportingGroups.length, 2);
  assert.ok(supportingGroups.every(g => g.objectMatch.reason === 'EXACT_OBJECT_ID'));
  assert.ok(!createDifferences(...supportingResult.documents, supportingGroups, supportingResult.matchingPlan).some(d => d.kind === 'object'));
  assert.doesNotMatch(logs, /ZZ1000[12]|Syntetisk produktbegrensning/u);
  const priceTraceRuns = [{ mode: 'customer', result: supportingResult }];
  for (const mode of ['supporting', 'absent']) {
    supportingPriceMode = mode;
    const before = calls.length;
    const response = await fetch(base + '/api/analyze', { method: 'POST', headers: { ...headers, accept: 'application/x-ndjson' }, body: multiForm(2) });
    const result = await readAnalysisResponse(response, () => {});
    assert.equal(response.status, 200); assert.equal(calls.length - before, 2);
    assert.equal(result.documents[0].insuranceData.insurances.length, 2);
    assert.ok(result.documents[0].insuranceData.insurances.every(o => !o.importantTerms.some(t => t.key?.startsWith('premie.'))));
    assert.ok(portfolioPrice(result.documents[1]).components.every(c => c.completeness === 'complete'));
    priceTraceRuns.push({ mode, result });
  }
  for (const { result } of priceTraceRuns) {
    const groups = groupInsurances(...result.documents.map(d => d.insuranceData.insurances), result.matchingPlan);
    const events = clientTraceEvents({ documents: result.documents, groups,
      differences: createDifferences(...result.documents, groups, result.matchingPlan),
      portfolioPrices: result.documents.map(d => portfolioPrice(d)), context: result.analysis.trace, priceBranches: ['portfolio', 'portfolio'] });
    const response = await postReceipt({ traceId: result.analysis.trace.traceId, ticket: result.analysis.trace.ticket, events });
    assert.equal(response.status, 200);
  }
  supportingScenario = false;
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
  const traceEvents = logs.split('\n').filter(line => line.startsWith('ANALYSIS_TRACE ')).map(line => JSON.parse(line.slice('ANALYSIS_TRACE '.length)));
  const serverTrace = traceEvents.filter(event => event.traceId === traceContext.traceId && event.phase === 'server');
  const clientTrace = traceEvents.filter(event => event.traceId === traceContext.traceId && event.phase === 'client');
  assert.ok(serverTrace.some(event => event.stage === 'sanitizer'));
  assert.equal(serverTrace.filter(event => event.stage === 'extraction').length, 8);
  assert.equal(serverTrace.find(event => event.stage === 'complete').observerFailures, 0);
  assert.equal(clientTrace.length, receiptEvents.length);
  assert.ok(clientTrace.some(event => event.stage === 'comparison'));
  for (const event of clientTrace.filter(event => event.objectRef)) assert.ok(serverTrace.some(server => server.objectRef === event.objectRef));
  assert.ok(traceEvents.some(event => event.stage === 'consolidation' && event.accepted));
  for (const { mode, result } of priceTraceRuns) {
    const events = traceEvents.filter(e => e.traceId === result.analysis.trace.traceId);
    const extraction = events.filter(e => e.stage === 'extraction');
    assert.equal(extraction.length, 8);
    for (const event of extraction) {
      const boundary = events.find(e => e.stage === 'role_boundary' && e.recordRef === event.recordRef);
      assert.equal(boundary.objectRef, event.objectRef);
      const expected = event.side === 'right' || mode === 'customer' ? boundary.customerEligible : mode === 'supporting' && !boundary.customerEligible;
      assert.ok(event.pricePresence.every(p => p.present === expected && p.documentedValuePresent === expected));
      assert.deepEqual(boundary.pricePresence, event.pricePresence);
    }
    assert.ok(events.some(e => e.phase === 'client' && e.reason === 'CLIENT_RECEIPT_COMPLETE'));
    for (const event of events.filter(e => e.stage === 'supporting_attachment' && e.attached)) {
      const blocked = mode === 'supporting' && event.side === 'left';
      assert.equal(event.reason, blocked ? 'CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED' : 'SUPPORT_ATTACHED_NO_PRICE');
      assert.deepEqual(event.pricePresenceBefore, event.pricePresenceAfter);
      assert.ok(result.analysis.trace.objectRefs[event.side].includes(event.targetObjectRef));
    }
    const complete = events.find(e => e.phase === 'server' && e.stage === 'complete');
    assert.equal(complete.observerFailures, 0); assert.equal(complete.droppedEvents, 0);
  }
  for (const { traceId, phase, sequence, ...event } of traceEvents) {
    assert.match(traceId, /^[0-9a-f-]{36}$/u);
    assert.ok(['server', 'client'].includes(phase));
    assert.ok(Number.isInteger(sequence));
    assert.ok(sanitizeTraceEvent(event));
  }
  for (const value of [traceContext.ticket, 'PRIVATE_TRACE_SENTINEL', 'PRIVATE_INVALID_TRACE_TICKET']) assert.equal(logs.includes(value), false);
  for(const value of [code,secret,key,'PRIVATE_PDF_SENTINEL','PRIVATE_OUTPUT_SENTINEL','PRIVATE_FILENAME','INVALID_PHASE2'])assert.equal(logs.includes(value),false);
  console.log(JSON.stringify({ result: "PASS", checks: [
    "Production trace: actual server events, signed client receipt, same request/object refs, private-field/ticket rejection, replay rejection, no extra AI",
    "Phase 2: 10+10 streamed, two calls, concurrency, provenance, 11 rejected, partial corrupt PDF, safe progress/metrics",
    "Cross-document consolidation: 10 records per side -> 7 exact object pairs, complementary facts and provenance",
    "7-object portfolio: 3 cars + 2 trailers + snowmobile + caravan, shuffled IDs, provenance, private progress/logging",
    "MC/Bobil: 2+2 objects per side, reversed PDFs, If/Gjensidige exact catalogs, document details and habitation facts, complete prices, exact object pairs, two mocked extraction calls, safe progress/logging",
    "2+2 PDF price portfolio: kr. versus kr, reversed objects, complete independent components, explicit totals, two extraction calls only",
    "Supporting terms: 8 extracted records -> 4 customer objects, 4 documents, exact pairs, complete portfolio, document priority, evidence retained, safe progress",
    "Customer price trace: extraction presence versus supporting placement versus absence, actual role/attachment decisions, linked client receipts, unchanged two-call extraction",
    "Bil + snowmobile + caravan + trailer through HTTP, exact If catalogs, provenance and friendly progress",
    "PDF details with empty addOns through HTTP, enrichment, sanitizer and comparison",

    "unauthorized", "manual/catalog", "synthetic PDF to mocked AI to response",
    "two-side concurrency", "N documents to M products", "capacity limit", "invalid PDF before AI",
    "strict form fields", "429/no retries/sibling abort", "admission released", "private logging", "semantic fallback telemetry/no unnecessary AI",
  ], syntheticMetrics: success, mcBobilSyntheticDurationMs: mcBobilDurationMs }, null, 2));
} finally {
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(3000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
  await new Promise((resolve) => mock.close(resolve));
}
