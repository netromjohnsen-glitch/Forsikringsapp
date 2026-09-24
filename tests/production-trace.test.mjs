import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clientTraceEvents, safeTraceProduct, safeTraceType, sanitizeTraceEvent,
  traceCoverages, traceFacts, traceKeySet, traceKeys, traceProductIdentityState,
} from '../lib/production-trace.ts';
import { groupInsurances, groupTerms, createDifferences } from '../lib/comparison.ts';
import { presentImportantDifferences } from '../lib/comparison-presentation.ts';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { car, pipeline } from './helpers/pilot-quality.mjs';

const canary = 'PRIVATE_CUSTOMER_CANARY';
const privateFields = {
  value: `15 791 km ${canary}`,
  label: `Kunde ${canary}`,
  name: `Person ${canary}`,
  filename: `${canary}.pdf`,
  source: { filename: `${canary}.pdf`, section: canary },
  sources: [{ documentId: canary }],
  amount: 1579100,
  objectIdentifiers: [{ type: 'registration', value: 'ZZ90909' }],
  vin: 'PRIVATEVIN1234567',
  registration: 'ZZ90909',
  identifierHash: canary,
  address: `${canary} 9`,
  email: `${canary}@example.test`,
  extractedText: canary,
  debug: canary,
};

test('trace sanitizer accepts exact diagnostic metadata and returns an independent copy', () => {
  const event = {
    stage: 'catalog', side: 'left', objectRef: 'object_0', docRef: 'doc_1', batchRef: 'batch_0',
    insuranceType: 'bil', providerId: 'gjensidige', productId: 'gj-bil-kasko',
    facts: [{ key: 'nyverdi.km', present: true, origin: 'document' }],
    decisions: [{ key: 'nyverdi.km', decision: 'DOCUMENT_PRESENT_SKIP_CATALOG' }],
  };
  const actual = sanitizeTraceEvent(event);
  assert.deepEqual(actual, event);
  assert.notEqual(actual, event);
  assert.notEqual(actual.facts, event.facts);
});

test('trace sanitizer rejects every raw/private top-level field rather than silently forwarding it', () => {
  for (const [field, value] of Object.entries(privateFields)) {
    assert.equal(sanitizeTraceEvent({ stage: 'effective', [field]: value }), null, field);
  }
  assert.equal(sanitizeTraceEvent(JSON.parse('{"stage":"effective","__proto__":{"value":"PRIVATE"}}')), null);
  assert.equal(sanitizeTraceEvent({ stage: 'effective', constructor: canary }), null);
});

test('trace sanitizer rejects raw/private fields at every nested trace boundary', () => {
  const samples = {
    facts: { key: 'nyverdi.km', present: true, origin: 'document' },
    decisions: { key: 'nyverdi.km', decision: 'DOCUMENT_PRESENT_SKIP_CATALOG' },
    coverages: { key: 'leiebil.dekning', status: 'selected', origin: 'document', reason: 'explicit_status' },
    prices: { key: 'premie.total', state: 'present', annualBasis: 'canonical_annual', comparable: true, reason: 'ANNUAL_PARSED' },
    components: { key: 'premie.total', completeness: 'complete', expected: 2, priced: 2 },
    comparisons: { key: 'nyverdi.km', leftPresent: true, rightPresent: true, leftOrigin: 'document', rightOrigin: 'catalog', state: 'DIFFERENCE_EMITTED' },
  };
  for (const [field, sample] of Object.entries(samples)) {
    assert.ok(sanitizeTraceEvent({ stage: 'comparison', [field]: [sample] }), field);
    for (const [extra, value] of Object.entries(privateFields)) {
      assert.equal(sanitizeTraceEvent({ stage: 'comparison', [field]: [{ ...sample, [extra]: value }] }), null, `${field}.${extra}`);
    }
  }
});

test('known canonical prefixes never permit arbitrary customer suffixes or whitespace', () => {
  const invalid = ['nyverdi.km.' + canary, 'nyverdi.' + canary, 'premie.total ' + canary, 'nyverdi.km ', ' nyverdi.km', 'NYVERDI.KM', canary];
  for (const key of invalid) {
    assert.equal(sanitizeTraceEvent({ stage: 'effective', keys: [key] }), null, key);
    assert.equal(sanitizeTraceEvent({ stage: 'effective', facts: [{ key, present: true, origin: 'document' }] }), null, key);
    assert.deepEqual(traceKeySet([{ key, name: canary, value: canary }]), []);
    assert.ok(traceFacts([{ key, value: canary }]).every(fact => !fact.present));
  }
});

test('reference, provider, product and reason vocabularies reject private strings including plausible prefixes', () => {
  const badFields = {
    stage: `extraction_${canary}`, side: canary, objectRef: `object_1_${canary}`, docRef: `doc_0_${canary}`,
    batchRef: `batch_0_${canary}`, objectRefs: [`object_${canary}`], documentRefs: [`doc_${canary}`],
    providerId: `gjensidige_${canary}`, productId: `gj-bil-kasko_${canary}`, beforeProductIds: [`gj-bil-kasko_${canary}`],
    insuranceType: `bil_${canary}`, insuranceTypes: [`bil_${canary}`], reason: `DOCUMENT_PRESENT_SKIP_CATALOG_${canary}`,
  };
  for (const [field, value] of Object.entries(badFields)) assert.equal(sanitizeTraceEvent({ stage: 'effective', [field]: value }), null, field);
  for (const value of ['object_-1', 'object_01', 'object_1000', 'object_1\n', 'object_1@example.test']) {
    assert.equal(sanitizeTraceEvent({ stage: 'effective', objectRef: value }), null, value);
  }
  assert.deepEqual(safeTraceProduct({ providerId: canary, productId: canary, company: canary }), { providerId: null, productId: null });
  assert.equal(safeTraceType({ type: `bil_${canary}` }), 'unknown');
  assert.equal(safeTraceType({ type: 'Motorvognforsikring' }), 'bil');
});

test('trace shapes reject invalid counts, oversized collections and malformed values', () => {
  for (const value of [-1, 1.5, 10001, NaN, Infinity, '1', null]) {
    assert.equal(sanitizeTraceEvent({ stage: 'complete', eventCount: value }), null);
  }
  for (const durationMs of [-1, Infinity, 300001, '10']) assert.equal(sanitizeTraceEvent({ stage: 'complete', durationMs }), null);
  assert.equal(sanitizeTraceEvent({ stage: 'effective', keys: Array(65).fill('nyverdi.km') }), null);
  assert.equal(sanitizeTraceEvent({ stage: 'effective', facts: [{ key: 'nyverdi.km', present: true }] }), null);
  assert.equal(sanitizeTraceEvent({ stage: 'effective', facts: [{ key: 'nyverdi.km', present: 'true', origin: 'document' }] }), null);
  for (const input of [null, [], false, 'effective', {}]) assert.equal(sanitizeTraceEvent(input), null);
});

test('fact projection uses exact canonical keys and never emits raw labels, values, provenance or identity', () => {
  const record = {
    ...privateFields,
    importantTerms: [
      { key: 'nyverdi.km', coverageOrigin: 'document', ...privateFields },
      { canonicalKey: 'premie.total', coverageOrigin: 'catalog', ...privateFields },
      { key: `premie.${canary}`, ...privateFields },
    ],
    addOns: [{ ...privateFields, importantTerms: [{ key: 'leiebil.dekning', coverageOrigin: 'document', ...privateFields }] }],
    consolidation: { factConflicts: [{ key: 'nyverdi.km', values: [canary] }] },
  };
  const before = structuredClone(record);
  assert.deepEqual(traceKeySet(record), ['leiebil.dekning', 'nyverdi.km', 'premie.total']);
  const facts = traceFacts(record);
  assert.equal(facts.length, traceKeys.length);
  assert.deepEqual(facts.find(fact => fact.key === 'nyverdi.km'), { key: 'nyverdi.km', present: true, origin: 'conflict' });
  assert.deepEqual(facts.find(fact => fact.key === 'premie.total'), { key: 'premie.total', present: true, origin: 'catalog' });
  assert.deepEqual(facts.find(fact => fact.key === 'nyverdi.alder'), { key: 'nyverdi.alder', present: false, origin: 'unknown' });
  assert.doesNotMatch(JSON.stringify(facts), /PRIVATE|ZZ90909|15791|15 791|\.pdf|@example/);
  assert.deepEqual(record, before);
});

function coverageRecord(importantTerms, extra = {}) {
  return { type: 'Bil', productName: 'Syntetisk test', annualPremium: null, deductible: null, coverageSummary: null, importantTerms, addOns: [], ...extra };
}
const coverageTerm = (value, coverageOrigin = 'document') => ({ key: 'leiebil.dekning', name: 'Leiebil', value, coverageOrigin });

test('coverage trace reports strongest document assertion even when lower-priority catalog evidence comes first', () => {
  for (const reverse of [false, true]) {
    const terms = [coverageTerm('Inkludert', 'catalog'), coverageTerm('Leiebil er ikke valgt')];
    const record = coverageRecord(reverse ? terms.toReversed() : terms, { catalogSelectionConfirmed: true });
    const before = structuredClone(record);
    const coverage = traceCoverages(record).find(item => item.key === 'leiebil.dekning');
    assert.deepEqual(coverage, { key: 'leiebil.dekning', status: 'not_selected', origin: 'document', reason: 'explicit_status' });
    assert.equal(coverage.status, canonicalCoverage(record, 'bil', coverage.key).status);
    assert.deepEqual(record, before);
  }
});

test('coverage trace prioritizes document add-on over weaker main-value assertion', () => {
  const record = coverageRecord([coverageTerm('Leiebil ved verkstedopphold')], {
    addOns: [{ name: 'Leiebil', annualPremium: null, deductible: null, importantTerms: [] }],
  });
  const coverage = traceCoverages(record).find(item => item.key === 'leiebil.dekning');
  assert.deepEqual(coverage, { key: 'leiebil.dekning', status: 'selected', origin: 'document', reason: 'add_on' });
});

test('coverage trace preserves conflict and unknown instead of treating any catalog presence as selected', () => {
  const conflicting = coverageRecord([coverageTerm('Valgt'), coverageTerm('Ikke valgt')]);
  assert.deepEqual(traceCoverages(conflicting).find(item => item.key === 'leiebil.dekning'), {
    key: 'leiebil.dekning', status: 'unknown', origin: 'conflict', reason: 'CONFLICT',
  });
  const unconfirmed = coverageRecord([coverageTerm('Inkludert', 'catalog')]);
  assert.deepEqual(traceCoverages(unconfirmed).find(item => item.key === 'leiebil.dekning'), {
    key: 'leiebil.dekning', status: 'unknown', origin: 'unknown', reason: 'NO_EVIDENCE',
  });
  const confirmed = coverageRecord([coverageTerm('Inkludert', 'catalog')], { catalogSelectionConfirmed: true });
  assert.deepEqual(traceCoverages(confirmed).find(item => item.key === 'leiebil.dekning'), {
    key: 'leiebil.dekning', status: 'selected', origin: 'catalog', reason: 'explicit_status',
  });
});

function actualComparison(documents) {
  const groups = groupInsurances(documents[0].insuranceData.insurances, documents[1].insuranceData.insurances, null);
  return {
    documents,
    groups,
    details: groups.map(group => ({group, terms: groupTerms(group, null)})),
    differences: createDifferences(documents[0], documents[1], groups, null),
    portfolioPrices: documents.map(document => portfolioPrice(document)),
  };
}
function projection(input) {
  return clientTraceEvents({
    ...input,
    presentedDifferences: presentImportantDifferences(input.differences, input.groups, null),
    details: input.groups.map(group => ({ group, terms: groupTerms(group, null) })),
    context: { traceId: 'PRIVATE_TRACE_CONTEXT_ONLY', ticket: 'PRIVATE_TICKET_ONLY', objectRefs: { left: ['object_0', 'object_1'], right: ['object_2', 'object_3'] } },
    priceBranches: ['portfolio', 'portfolio'],
  });
}

test('raw key presence is separate from effective undocumented-value absence', () => {
  const record = { importantTerms: [{ key: 'nyverdi.km', value: 'Ikke dokumentert', coverageOrigin: 'document' }] };
  assert.deepEqual(traceKeySet(record), ['nyverdi.km']);
  assert.deepEqual(traceFacts(record).find(f => f.key === 'nyverdi.km'), { key: 'nyverdi.km', present: false, origin: 'unknown' });
});

test('trace distinguishes explicit unknown product identity from legacy fallback without logging product text', () => {
  assert.equal(traceProductIdentityState({productName: canary, canonicalProductName: null}), 'EXPLICIT_UNKNOWN');
  assert.equal(traceProductIdentityState({productName: canary}), 'LEGACY_FALLBACK');
  assert.equal(traceProductIdentityState({canonicalProductName: canary}), 'PRESENT');
  assert.equal(traceProductIdentityState({}), 'MISSING');
});

test('actual detailed coverage row observes selected/document despite absent main term', () => {
  const insurance = { type: 'Bil', productName: null, annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: [{key:'maskinskade.alder', name:'Syntetisk detalj', value:'11 år', coverageOrigin:'document', sources:[{documentId:canary,filename:canary,page:1,section:canary,termsNumber:'',effectiveFrom:''}]}] };
  const documents = [0,1].map(() => ({insuranceData:{company:null,totalAnnualPremium:null,insurances:[structuredClone(insurance)]}}));
  const input = actualComparison(documents);
  const row = input.details[0].terms.find(t => t.key === 'maskinskade.dekning');
  assert.equal(row.first, null);
  assert.equal(row.firstCoverage.status, 'selected');
  const events = projection(input);
  const fact = events.find(e => e.stage === 'comparison').comparisons.find(f => f.key === row.key);
  assert.equal(fact.leftPresent, true);
  assert.equal(fact.leftOrigin, 'document');
  assert.ok(events.some(e => e.side === 'left' && e.coverages?.some(c => c.key === row.key && c.status === 'selected' && c.origin === 'document')));
  assert.doesNotMatch(JSON.stringify(events), /11 år|PRIVATE_CUSTOMER/);
});

test('actual 2+2 comparison and prices remain identical with or without client diagnostic projection', () => {
  const first = pipeline([car(), car('Pluss')]);
  const second = pipeline([car('Pluss'), car()], 'offer');
  const input = actualComparison([first, second]);
  const before = structuredClone(input);
  const rowsBefore = input.groups.map(group => groupTerms(group, null));
  const events = projection(input);
  assert.deepEqual(input, before);
  assert.deepEqual(actualComparison(input.documents), before);
  assert.deepEqual(input.groups.map(group => groupTerms(group, null)), rowsBefore);
  assert.ok(events.length > 0);
  assert.deepEqual(events, projection(input));
  assert.ok(events.every(event => sanitizeTraceEvent(event) !== null));
  for (const stage of ['client_result', 'price_input', 'portfolio', 'comparison', 'presentation']) assert.ok(events.some(event => event.stage === stage), stage);
  for (const event of events.filter(event => event.stage === 'portfolio')) {
    assert.equal(event.branch, 'portfolio');
    assert.equal(event.objectCount, 2);
    assert.ok(event.components.every(component => component.expected === 2 && component.priced === 2));
  }
  const comparisons = events.filter(event => event.stage === 'comparison');
  assert.deepEqual(comparisons.map(event => [event.leftRefs, event.rightRefs]), [[['object_0'], ['object_3']], [['object_1'], ['object_2']]]);
  assert.ok(comparisons.every(event => event.comparisons.every(fact => fact.state === 'NO_DIFFERENCE_EMITTED')));
  assert.doesNotMatch(JSON.stringify(events), /PRIVATE_TRACE|PRIVATE_TICKET|ZZ1000|15 000|60 000|27 574|1478600|2757400|\.pdf/);
});

test('client projection observes an emitted difference while preserving document values and sources', () => {
  const first = pipeline([car()]);
  const second = pipeline([car()], 'offer');
  const term = second.insuranceData.insurances[0].importantTerms.find(term => term.key === 'nyverdi.km');
  term.value = '12 345 km';
  const input = actualComparison([first, second]);
  const before = structuredClone(input);
  assert.ok(input.differences.some(difference => difference.termKey === 'nyverdi.km' || difference.relatedTermKeys?.includes('nyverdi.km')));
  const event = projection(input).find(event => event.stage === 'comparison');
  assert.equal(event.comparisons.find(fact => fact.key === 'nyverdi.km').state, 'DIFFERENCE_EMITTED');
  assert.deepEqual(input, before);
  assert.doesNotMatch(JSON.stringify(event), /12 345|15 000|pdf:|Gjensidige|ZZ1000/);
});

test('client projection cannot leak adversarial raw values, labels, source filenames or object identity', () => {
  const documents = [pipeline([car()]), pipeline([car()], 'offer')];
  for (const document of documents) {
    const insurance = document.insuranceData.insurances[0];
    document.filename = `${canary}.pdf`;
    insurance.company = canary;
    insurance.productName = canary;
    insurance.objectIdentifiers = [{ type: 'registration', value: 'ZZ90909' }];
    insurance.importantTerms.push({ key: `nyverdi.${canary}`, name: canary, value: canary, sources: [{ filename: `${canary}.pdf` }] });
    for (const term of insurance.importantTerms) term.sources = [{ documentId: canary, filename: `${canary}.pdf`, section: canary }];
  }
  const input = actualComparison(documents);
  const before = structuredClone(input);
  const events = projection(input);
  assert.ok(events.length > 0);
  assert.deepEqual(input, before);
  assert.ok(events.every(event => sanitizeTraceEvent(event) !== null));
  assert.doesNotMatch(JSON.stringify(events), /PRIVATE|ZZ90909|ZZ1000|\.pdf|15 000|14786|1478600/);
});
