import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createProductionTrace } from '../lib/production-trace-server.ts';
import { tracePricePresence, tracePriceKeys, sanitizeTraceEvent, clientTraceEvents } from '../lib/production-trace.ts';
import { analyzePdfBatches } from '../lib/pdf-analysis-pipeline.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { mergeBatchResults } from '../lib/analysis-merge.ts';
import { sanitizeAnalysisDocumentForClient } from '../lib/analysis-output.ts';
import { attachSupportingTerms } from '../lib/supporting-terms.ts';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { groupInsurances, createDifferences } from '../lib/comparison.ts';
import { portfolioDocuments, generalTerms, batchDocuments } from './helpers/supporting-terms.mjs';
import { parsed, term } from './helpers/pilot-quality.mjs';

const canary = 'PRIVATE_PRICE_TRACE_CANARY';
const priceTerm = t => tracePriceKeys.includes(t.key ?? t.canonicalKey);
const priceVector = state => tracePriceKeys.map(key => ({ key, present: state, documentedValuePresent: state }));
const expectedRole = event => event.documentRole === 'general_terms' ? 'supporting' : 'customer';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function scenario(kind = 'customer', side = 'existing') {
  const documents = portfolioDocuments(side);
  for (const [customer, supporting] of documents) {
    if (kind === 'supporting' || kind === 'absent') {
      const prices = customer.importantTerms.filter(priceTerm);
      customer.importantTerms = customer.importantTerms.filter(t => !priceTerm(t));
      if (kind === 'supporting') supporting.importantTerms.push(...prices);
    }
    if (kind === 'mixed') customer.importantTerms.push(term('Generell seksjon', canary));
  }
  return documents;
}

// Real asynchronous extraction/batch/merge path, with only synthetic parser/AI
// inputs. No private PDF, network or model call is needed for these regressions.
async function run({ kind = 'customer', enabled = true, reverse = false, split = false, documents: supplied,
  injectLateLoss = false, sink, requestId = randomUUID() } = {}) {
  const lines = [], progress = [], documents = supplied ?? {
    existing: scenario(kind), offer: scenario(kind, 'offer'),
  };
  if (reverse) for (const rows of Object.values(documents)) { rows.reverse(); rows.forEach(records => records.reverse()); }
  const trace = createProductionTrace(requestId, enabled, sink ?? (line => lines.push(line)));
  let calls = 0;
  const pipeline = await analyzePdfBatches({
    sides: ['existing', 'offer'].map(side => ({ side, files: documents[side].map((_, index) => ({
      name: `${canary}-${index}.pdf`, data: Buffer.from(`${side}:${index}`),
    })) })),
    controller: new AbortController(), telemetry: createAnalysisTelemetry(requestId), trace,
    emit: event => progress.push(event),
    parse: async () => ({ text: 'Synthetic '.repeat(split ? 9000 : 2), pages: 1, parseMs: 1, textMs: 1 }),
    extract: async batch => {
      calls++;
      await sleep(batch.side === 'existing' ? 2 : 1);
      return parsed(batch.documents.flatMap((doc, index) => documents[doc.side][doc.documentIndex].map(record => ({
        ...record, documentIndices: [index + 1],
        objectIdentifiers: record.objectIdentifiers.map(id => ({ ...id, documentIndices: [index + 1] })),
        importantTerms: record.importantTerms.map(t => ({ ...t, documentIndices: [index + 1] })),
      }))));
    },
  });
  const merged = ['existing', 'offer'].map(side => mergeBatchResults(pipeline.results.toReversed(), side, pipeline.partialSuccess, trace));
  // Test-only fault injection at a known boundary: prove category C is visible
  // without changing production code or pretending to reproduce the pilot bug.
  if (injectLateLoss) for (const record of merged[0].insuranceData.insurances) {
    record.importantTerms = record.importantTerms.filter(t => !priceTerm(t)); record.annualPremium = null;
  }
  const sanitized = merged.map(sanitizeAnalysisDocumentForClient);
  const objectRefs = Object.fromEntries(['left', 'right'].map((side, index) => [side,
    trace?.final(index === 0 ? 'existing' : 'offer', merged[index].insuranceData.insurances, sanitized[index].insuranceData.insurances)]));
  trace?.flush();
  const groups = groupInsurances(...sanitized.map(d => d.insuranceData.insurances), null);
  const differences = createDifferences(...sanitized, groups, null), prices = sanitized.map(d => portfolioPrice(d));
  const receipt = trace ? clientTraceEvents({ documents: sanitized, groups, differences, portfolioPrices: prices,
    context: { traceId: requestId, ticket: canary, objectRefs }, priceBranches: ['portfolio', 'portfolio'] }) : [];
  return { requestId, lines, events: lines.map(line => JSON.parse(line)), objectRefs, receipt, calls, progress,
    snapshot: { documents: sanitized, groups, differences, prices } };
}

function complete(result) {
  const last = result.events.at(-1);
  assert.equal(last.stage, 'complete'); assert.equal(last.observerFailures, 0); assert.equal(last.droppedEvents, 0);
  for (const { traceId, phase, sequence, ...event } of result.events) {
    assert.equal(traceId, result.requestId); assert.equal(phase, 'server'); assert.ok(Number.isInteger(sequence));
    assert.ok(sanitizeTraceEvent(event));
  }
}

for (const kind of ['customer', 'supporting', 'absent', 'mixed']) test(`price trace: extraction and role boundary distinguish ${kind}`, async () => {
  const result = await run({ kind }); complete(result);
  const extraction = result.events.filter(e => e.stage === 'extraction');
  assert.equal(extraction.length, 8);
  for (const event of extraction) {
    assert.equal(event.recordRef, event.objectRef);
    assert.equal(event.insuranceType, 'bil'); assert.equal(event.productIdentityState, 'PRESENT');
    const isCustomer = event.documentRole === 'individual_agreement';
    assert.equal(event.secureObjectIdentityPresent, isCustomer); assert.equal(event.objectIdentityInvalid, false);
    const hasPrice = kind === 'supporting' ? !isCustomer : kind === 'absent' ? false : isCustomer;
    assert.deepEqual(event.pricePresence, priceVector(hasPrice));
    const boundary = result.events.find(e => e.stage === 'role_boundary' && e.recordRef === event.recordRef);
    assert.ok(boundary.sequence > event.sequence); assert.equal(boundary.side, event.side);
    assert.equal(boundary.destination, expectedRole(event)); assert.equal(boundary.customerEligible, isCustomer);
    assert.equal(boundary.documentRole, event.documentRole); assert.deepEqual(boundary.pricePresence, event.pricePresence);
  }
  assert.equal(result.snapshot.documents[0].insuranceData.insurances.length, 2);
});

test('price trace: price-bearing supporting records are explicitly blocked for the actual attached customer', async () => {
  const result = await run({ kind: 'supporting' }); complete(result);
  const events = result.events.filter(e => e.stage === 'supporting_attachment');
  assert.equal(events.length, 8); // Two possible products per side; only exact scopes attach.
  for (const event of events) {
    const source = result.events.find(e => e.stage === 'extraction' && e.recordRef === event.supportingRecordRef);
    assert.equal(source.documentRole, 'general_terms'); assert.equal(source.side, event.side);
    assert.deepEqual(event.pricePresence, priceVector(true));
    assert.deepEqual(event.pricePresenceBefore, priceVector(false)); assert.deepEqual(event.pricePresenceAfter, priceVector(false));
    if (event.attached) {
      assert.equal(event.targetObjectRef, event.objectRef);
      assert.equal(event.reason, 'CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED');
      assert.ok(result.objectRefs[event.side].includes(event.targetObjectRef));
    } else {
      assert.equal(event.targetObjectRef, undefined); assert.equal(event.reason, 'SUPPORT_SCOPE_NOT_APPLICABLE');
    }
  }
  assert.equal(events.filter(e => e.attached).length, 4);
});

test('price trace: ordinary attachment preserves before/after customer prices', async () => {
  const result = await run(); complete(result);
  for (const event of result.events.filter(e => e.stage === 'supporting_attachment')) {
    assert.deepEqual(event.pricePresenceBefore, priceVector(true)); assert.deepEqual(event.pricePresenceAfter, priceVector(true));
    assert.deepEqual(event.pricePresence, priceVector(false));
    if (event.attached) assert.equal(event.reason, 'SUPPORT_ATTACHED_NO_PRICE');
  }
  for (const event of result.events.filter(e => ['normalization', 'consolidation'].includes(e.stage))) {
    assert.deepEqual(event.pricePresenceBefore, priceVector(true)); assert.deepEqual(event.pricePresenceAfter, priceVector(true));
  }
});

test('price trace: a test-injected later loss is distinguishable from extraction absence or supporting placement', async () => {
  const result = await run({ injectLateLoss: true }); complete(result);
  for (const objectRef of result.objectRefs.left) {
    const extraction = result.events.find(e => e.stage === 'extraction' && e.recordRef === objectRef);
    assert.deepEqual(extraction.pricePresence, priceVector(true));
    assert.ok(result.events.some(e => e.stage === 'role_boundary' && e.recordRef === objectRef && e.customerEligible));
    const attached = result.events.find(e => e.stage === 'supporting_attachment' && e.targetObjectRef === objectRef);
    assert.deepEqual(attached.pricePresenceAfter, priceVector(true));
    const final = result.events.findLast(e => e.stage === 'sanitizer' && e.objectRef === objectRef);
    assert.ok(final.sequence > attached.sequence);
    assert.ok(final.facts.filter(f => tracePriceKeys.includes(f.key)).every(f => !f.present));
    assert.ok(result.receipt.find(e => e.stage === 'price_input' && e.objectRef === objectRef).prices.every(p => p.state === 'missing'));
  }
});

for (const reverse of [false, true]) for (const split of [false, true]) test(`price trace: ON/OFF equality and exact refs, reverse=${reverse}, split=${split}`, async () => {
  const off = await run({ enabled: false, reverse, split }), on = await run({ reverse, split }); complete(on);
  assert.deepEqual(on.snapshot, off.snapshot); assert.equal(on.calls, off.calls);
  // Parallel batches may complete in either order. Compare the entire event
  // multiset (including duplicates), plus ordered document/batch sequences.
  const eventBag = events => events.map(event => JSON.stringify(event)).sort();
  assert.deepEqual(eventBag(on.progress), eventBag(off.progress));
  const sequences = events => {
    const groups = new Map();
    for (const event of events) {
      const key = event.type === 'document_status' ? `document:${event.side}:${event.documentIndex}` :
        'batchIndex' in event ? `batch:${event.side}:${event.batchIndex}` : 'job';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(event);
    }
    return Object.fromEntries([...groups].sort(([a], [b]) => a.localeCompare(b)));
  };
  assert.deepEqual(sequences(on.progress), sequences(off.progress));
  for (const result of [off, on]) {
    assert.equal(result.progress[0].type, 'analysis_started');
    assert.equal(result.progress.filter(event => event.type === 'analysis_started').length, 1);
    assert.equal(result.progress.filter(event => event.type === 'batch_analyzing').length, result.calls);
    const groups = sequences(result.progress);
    const documents = Object.entries(groups).filter(([key]) => key.startsWith('document:'));
    assert.equal(documents.length, 4);
    for (const [, events] of documents) assert.deepEqual(events.map(event => event.status),
      ['validating', 'extracting', 'ready', 'analyzing', 'completed']);
    for (const [key, events] of Object.entries(groups).filter(([key]) => key.startsWith('batch:'))) {
      const indices = [...new Set(events.filter(event => event.type === 'product_status').map(event => event.productIndex))].sort((a, b) => a - b);
      assert.ok(indices.length > 0, key);
      assert.deepEqual(indices, Array.from({ length: indices.length }, (_, index) => index));
      assert.deepEqual(events.map(event => event.type === 'batch_analyzing' ? 'start' : `${event.productIndex}:${event.status}`),
        ['start', ...indices.flatMap(index => [`${index}:identified`, `${index}:completed`])], key);
    }
  }
  const beforeExtraction = events => events.slice(0, events.findIndex(event => event.type === 'document_status' && event.status === 'analyzing'));
  assert.deepEqual(beforeExtraction(on.progress), beforeExtraction(off.progress));
  assert.equal(off.lines.length, 0); assert.equal(on.calls, split ? 4 : 2);
  assert.equal(on.snapshot.groups.length, 2); assert.ok(on.snapshot.groups.every(g => g.objectMatch.reason === 'EXACT_OBJECT_ID'));
  assert.ok(on.snapshot.prices.every(p => p.components.every(c => c.completeness === 'complete')));
  for (const side of ['left', 'right']) for (const ref of on.objectRefs[side]) {
    assert.ok(on.events.some(e => e.stage === 'extraction' && e.recordRef === ref && e.side === side));
    assert.ok(on.receipt.some(e => e.stage === 'client_result' && e.objectRef === ref && e.side === side));
  }
});

test('price trace: merged customer refs link back to every extracted record across batches', async () => {
  const docs = Object.fromEntries(['existing', 'offer'].map(side => {
    const initial = scenario('customer', side), extra = structuredClone(initial[0][0]);
    extra.importantTerms = [];
    return [side, [...initial, [extra]]];
  }));
  const result = await run({ documents: docs, split: true }); complete(result);
  const merged = result.events.filter(e => e.stage === 'consolidation' && e.accepted);
  assert.equal(merged.length, 2);
  for (const event of merged) {
    assert.equal(event.inputRefs.length, 2);
    for (const ref of event.inputRefs) assert.ok(result.events.some(e => e.stage === 'extraction' && e.recordRef === ref && e.side === event.side));
    assert.ok(result.events.some(e => e.stage === 'supporting_attachment' && e.targetObjectRef === event.objectRef));
    assert.ok(result.objectRefs[event.side].includes(event.objectRef));
    assert.deepEqual(event.pricePresenceAfter, priceVector(true));
  }
});

test('price trace: terms-only prices keep a source record ref without an invented customer target', async () => {
  const row = scenario('supporting')[0][1];
  const result = await run({ documents: { existing: [[row]], offer: [[structuredClone(row)]] } }); complete(result);
  assert.equal(result.events.filter(e => e.stage === 'role_boundary').length, 2);
  assert.ok(result.events.filter(e => e.stage === 'role_boundary').every(e => !e.customerEligible));
  assert.equal(result.events.filter(e => e.stage === 'supporting_attachment').length, 0);
  assert.deepEqual(result.objectRefs, { left: [], right: [] });
});

test('price trace: concurrent requests have isolated refs, roles, price states and trace IDs', async () => {
  const [a, b] = await Promise.all([run({ kind: 'customer', split: true }), run({ kind: 'supporting', reverse: true, split: true })]);
  assert.notEqual(a.requestId, b.requestId);
  for (const result of [a, b]) { complete(result); assert.equal(result.events.find(e => e.stage === 'extraction').recordRef, 'object_0'); }
  assert.ok(a.events.filter(e => e.stage === 'role_boundary' && e.customerEligible).every(e => e.pricePresence.every(p => p.documentedValuePresent)));
  assert.ok(b.events.filter(e => e.stage === 'role_boundary' && e.customerEligible).every(e => e.pricePresence.every(p => !p.present)));
});

test('price trace: valid key is distinct from an undocumented value and zero stays documented', () => {
  const input = { importantTerms: [term(canary, 'Ikke dokumentert', 'premie.ekskl_tfa'), term(canary, '0 kr.', 'premie.tfa')] };
  assert.deepEqual(tracePricePresence(input), [
    { key: 'premie.ekskl_tfa', present: true, documentedValuePresent: false },
    { key: 'premie.tfa', present: true, documentedValuePresent: true },
    { key: 'premie.total', present: false, documentedValuePresent: false },
  ]);
  assert.deepEqual(tracePricePresence({ importantTerms: [term('Totalpris', '9637 kr.', null)] }), priceVector(false));
});

test('price trace: later label normalization is visible without claiming the explicit key existed at extraction', async () => {
  const docs = { existing: scenario(), offer: scenario('customer', 'offer') };
  const labels = ['Premie ekskl trafikkforsikringsavgift', 'Trafikkforsikringsavgift', 'Årspremie inkl trafikkforsikringsavgift'];
  for (const records of Object.values(docs)) for (const [customer] of records) {
    customer.importantTerms.filter(priceTerm).forEach(t => {
      t.name = labels[tracePriceKeys.indexOf(t.canonicalKey)]; t.canonicalKey = null;
    });
  }
  const result = await run({ documents: docs }); complete(result);
  assert.ok(result.events.filter(e => e.stage === 'extraction').every(e => e.pricePresence.every(p => !p.present)));
  const normalized = result.events.filter(e => e.stage === 'normalization');
  assert.equal(normalized.length, 4);
  assert.ok(normalized.every(e => e.pricePresenceBefore.every(p => !p.present)));
  assert.ok(normalized.every(e => e.pricePresenceAfter.every(p => p.present && p.documentedValuePresent)));
});

test('price trace: unknown role and missing identity remain eligible without an invented role', async () => {
  const docs = { existing: scenario(), offer: scenario('customer', 'offer') };
  for (const records of Object.values(docs)) for (const [customer] of records) {
    customer.documentRole = 'unknown'; customer.objectIdentifiers = [];
  }
  const result = await run({ documents: docs }); complete(result);
  const extracted = result.events.filter(e => e.stage === 'extraction' && e.documentRole === 'unknown');
  assert.equal(extracted.length, 4);
  assert.ok(extracted.every(e => !e.secureObjectIdentityPresent && !e.objectIdentityInvalid));
  assert.ok(result.events.filter(e => e.stage === 'role_boundary' && e.documentRole === 'unknown').every(e => e.customerEligible && e.destination === 'customer'));
});

test('price trace: invalid identity is a boolean, never raw IDs or their hashes', async () => {
  const docs = { existing: scenario(), offer: scenario('customer', 'offer') };
  docs.existing[0][0].objectIdentifiers.push({ type: 'registration', value: 'ZZ99999', documentIndices: [1] });
  const result = await run({ documents: docs }); complete(result);
  const invalid = result.events.filter(e => e.stage === 'extraction' && e.objectIdentityInvalid);
  assert.equal(invalid.length, 1); assert.equal(invalid[0].secureObjectIdentityPresent, false);
  assert.doesNotMatch(result.lines.join(''), /ZZ99999|ZZ1000|identifierHash/);
});

const privateFields = ['value', 'values', 'amount', 'price', 'annualPremium', 'registration', 'vin', 'objectIdentifiers',
  'identifierHash', 'hash', 'filename', 'name', 'address', 'pdfText', 'extractedText', 'modelResponse', 'prompt', 'source', 'sources', 'sourceExcerpt', 'text'];
const roleEvent = { stage: 'role_boundary', side: 'left', recordRef: 'object_0', objectRef: 'object_0',
  documentRole: 'individual_agreement', customerEligible: true, destination: 'customer', reason: 'CUSTOMER_RECORD_RETAINED', pricePresence: priceVector(true) };
const attachmentEvent = { stage: 'supporting_attachment', side: 'left', supportingRecordRef: 'object_1', objectRef: 'object_0', targetObjectRef: 'object_0',
  attached: true, reason: 'CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED', pricePresence: priceVector(true), pricePresenceBefore: priceVector(false), pricePresenceAfter: priceVector(false) };

test('price trace: denylist at every new top-level and nested price boundary', () => {
  for (const event of [roleEvent, attachmentEvent]) {
    assert.ok(sanitizeTraceEvent(event));
    for (const key of privateFields) {
      assert.equal(sanitizeTraceEvent({ ...event, [key]: canary }), null, key);
      for (const field of ['pricePresence', 'pricePresenceBefore', 'pricePresenceAfter'].filter(field => field in event)) {
        const bad = structuredClone(event); bad[field][0][key] = canary;
        assert.equal(sanitizeTraceEvent(bad), null, `${field}.${key}`);
      }
    }
  }
});

test('price trace: closed enums, refs, complete key vectors and boolean types fail closed', () => {
  for (const [field, value] of Object.entries({ documentRole: canary, recordRef: 'object_0_' + canary,
    destination: canary, customerEligible: 'true', reason: 'CUSTOMER_RECORD_RETAINED_' + canary })) {
    assert.equal(sanitizeTraceEvent({ ...roleEvent, [field]: value }), null);
  }
  for (const state of [[], priceVector(true).slice(1), priceVector(true).toReversed(), [priceVector(true)[0], priceVector(true)[0], priceVector(true)[0]],
    [{ key: 'premie.total_' + canary, present: true, documentedValuePresent: true }, ...priceVector(true).slice(1)]]) {
    assert.equal(sanitizeTraceEvent({ ...roleEvent, pricePresence: state }), null);
  }
  for (const field of ['present', 'documentedValuePresent']) {
    const bad = structuredClone(roleEvent); bad.pricePresence[0][field] = canary; assert.equal(sanitizeTraceEvent(bad), null);
  }
  const impossible = structuredClone(roleEvent); impossible.pricePresence[0].present = false;
  assert.equal(sanitizeTraceEvent(impossible), null);
  for (const event of [roleEvent, attachmentEvent]) for (const field of Object.keys(event)) {
    const partial = { ...event }; delete partial[field]; assert.equal(sanitizeTraceEvent(partial), null, field);
  }
  assert.equal(sanitizeTraceEvent({ ...roleEvent, destination: 'supporting' }), null);
  assert.equal(sanitizeTraceEvent({ ...attachmentEvent, attached: false }), null);
  for (const field of ['supportingRecordRef', 'targetObjectRef', 'objectRef']) {
    assert.equal(sanitizeTraceEvent({ ...attachmentEvent, [field]: 'object_1_' + canary }), null);
  }
  for (const field of ['secureObjectIdentityPresent', 'objectIdentityInvalid']) {
    assert.equal(sanitizeTraceEvent({ stage: 'extraction', [field]: canary }), null);
  }
});

test('price trace: records with private labels, product text, filenames and values yield structural metadata only', async () => {
  const docs = { existing: scenario('supporting'), offer: scenario('supporting', 'offer') };
  for (const records of Object.values(docs).flat()) for (const record of records) {
    record.company = canary; record.productName = canary; record.canonicalProductName = canary;
    for (const fact of record.importantTerms) { fact.name = canary; if (priceTerm(fact)) fact.value = '9637 kr.'; }
  }
  const result = await run({ documents: docs }); complete(result);
  assert.doesNotMatch(result.lines.join(''), /PRIVATE|9637|ZZ1000|\.pdf|pdf:|identifierHash|"value"|"filename"/);
  assert.ok(result.events.filter(e => e.stage === 'extraction').every(e => e.productId === null && e.providerId === null));
});

test('price trace: sink or attachment observer failures cannot alter customer output', async () => {
  const baseline = await run({ enabled: false });
  const failed = await run({ sink: () => { throw new Error(canary); } });
  assert.deepEqual(failed.snapshot, baseline.snapshot); assert.equal(failed.calls, baseline.calls);
  const batch = batchDocuments([[portfolioDocuments()[0][0], generalTerms()]])[0];
  const customer = { ...batch.agreement.insurances[0], documentSources: batch.agreement.documentRecords[0].documentSources };
  const supporting = batch.agreement.documentRecords.slice(1);
  assert.deepEqual(attachSupportingTerms(customer, supporting, undefined, () => { throw new Error(canary); }), attachSupportingTerms(customer, supporting));
});
