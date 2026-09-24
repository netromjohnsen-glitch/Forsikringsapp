import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichExtractedAgreementWithCatalog, enrichConsolidatedInsurance } from '../lib/catalog-enrichment.ts';
import { consolidateInsuranceRecords } from '../lib/insurance-object-consolidation.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { car, parsed } from './helpers/pilot-quality.mjs';

const asOf = new Date('2026-09-24');
function observer() {
  const calls = { normalization: [], product: [], catalog: [], effective: [] };
  const trace = Object.fromEntries(Object.keys(calls).map(key => [key, (...args) => calls[key].push(args)]));
  return { trace, calls };
}

test('catalog observer sees the actual lookup, single normalization and returned facts without changing output', () => {
  const agreement = parsed([car()]);
  const before = structuredClone(agreement);
  const expected = enrichExtractedAgreementWithCatalog(agreement, asOf);
  const { trace, calls } = observer();
  const stages = [];
  const result = enrichExtractedAgreementWithCatalog(agreement, asOf, (stage, work) => {
    stages.push(stage);
    return work();
  }, trace);
  assert.deepEqual(result, expected);
  assert.deepEqual(agreement, before);
  assert.deepEqual(stages, ['catalogLookup', 'documentNormalization']);
  assert.equal(calls.normalization.length, 1);
  assert.equal(calls.normalization[0][0], agreement.insurances[0]);
  assert.equal(calls.product.length, 1);
  assert.equal(calls.product[0][1].productId, result.insurances[0].catalogReference.productId);
  assert.equal(calls.catalog.length, 1);
  assert.equal(calls.catalog[0][0].effectiveTerms, result.insurances[0].importantTerms);
  assert.equal(calls.catalog[0][0].catalogFacts, result.insurances[0].catalogFacts);
  assert.equal(calls.catalog[0][0].product, calls.product[0][1]);
});

test('unknown product observer reports no catalog and retains exact document-only output', () => {
  const agreement = parsed([car()]);
  agreement.insurances[0].canonicalProductName = 'Syntetisk ukjent produkt';
  const expected = enrichExtractedAgreementWithCatalog(agreement, asOf);
  const { trace, calls } = observer();
  const result = enrichExtractedAgreementWithCatalog(agreement, asOf, undefined, trace);
  assert.deepEqual(result, expected);
  assert.equal(calls.product[0][1], null);
  const catalog = calls.catalog[0][0];
  for (const key of ['effectiveFacts', 'catalogFacts', 'supplementalTerms', 'blockedKeys']) assert.deepEqual(catalog[key], []);
  assert.equal(catalog.product, null);
  assert.equal(catalog.effectiveTerms, result.insurances[0].importantTerms);
});

test('consolidated enrichment observer never reruns already resolved document normalization', () => {
  const insurance = parsed([car()]).insurances[0];
  const terms = normalizeDocumentFacts(insurance);
  const { trace, calls } = observer();
  const result = enrichConsolidatedInsurance('Gjensidige', insurance, terms, asOf, trace);
  assert.deepEqual(result, enrichConsolidatedInsurance('Gjensidige', insurance, terms, asOf));
  assert.equal(calls.normalization.length, 0);
  assert.equal(calls.product.length, 1);
  assert.equal(calls.catalog.length, 1);
});

test('catalog observer records only keys actually suppressed by explicit not-selected status', () => {
  const input = car('Pluss');
  input.importantTerms.find(term => term.name === 'Leiebil').value = 'Ikke valgt';
  const { trace, calls } = observer();
  const result = enrichExtractedAgreementWithCatalog(parsed([input]), asOf, undefined, trace);
  const catalog = calls.catalog[0][0];
  assert.ok(catalog.blockedKeys.length > 0);
  assert.ok(catalog.blockedKeys.every(key => key.startsWith('leiebil.')));
  assert.ok(catalog.blockedKeys.every(key => catalog.effectiveFacts.some(fact => fact.key === key)));
  assert.ok(catalog.blockedKeys.every(key => !catalog.supplementalTerms.some(fact => fact.key === key)));
  assert.deepEqual(result, enrichExtractedAgreementWithCatalog(parsed([input]), asOf));
});

const source = index => ({ documentId: `pdf:existing:${index}`, filename: `Syntetisk dokument ${index}`, page: 1, section: 'Syntetisk test', termsNumber: '', effectiveFrom: '' });
function record(index, overrides = {}) {
  const insurance = parsed([car()]).insurances[0];
  return {
    ...insurance,
    company: 'Gjensidige',
    analysisObjectId: `existing:0:${index}`,
    documentReferences: [{ side: 'existing', documentIndex: index }],
    documentSources: [source(index)],
    ...overrides,
  };
}
function consolidationObserver() {
  const perRecord = new Map();
  const completed = [];
  return {
    perRecord,
    completed,
    hooks: {
      forRecord(record) {
        if (!perRecord.has(record)) perRecord.set(record, observer());
        return perRecord.get(record).trace;
      },
      consolidated(...args) { completed.push(args); },
    },
  };
}

test('consolidation observer captures each actual repeated normalization and consolidated result', () => {
  const records = [record(0), record(1)];
  const before = structuredClone(records);
  const expected = consolidateInsuranceRecords(records);
  const { hooks, perRecord, completed } = consolidationObserver();
  const result = consolidateInsuranceRecords(records, undefined, hooks);
  assert.deepEqual(result, expected);
  assert.deepEqual(records, before);
  assert.equal(perRecord.size, 2);
  for (const item of records) {
    const calls = perRecord.get(item).calls.normalization;
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0][0].importantTerms, item.importantTerms);
    assert.deepEqual(calls[0][1], normalizeDocumentFacts(calls[0][0]));
  }
  assert.equal(completed.length, 1);
  assert.deepEqual(completed[0][0], records);
  assert.equal(completed[0][1], result[0].record);
  assert.equal(completed[0][2], 'consolidated');
  assert.deepEqual(completed[0][3], []);
});

test('standalone observer captures actual output without inventing another normalization pass', () => {
  const input = record(0);
  const { hooks, perRecord, completed } = consolidationObserver();
  const result = consolidateInsuranceRecords([input], undefined, hooks);
  assert.deepEqual(result, consolidateInsuranceRecords([input]));
  assert.equal(perRecord.size, 0);
  assert.deepEqual(completed[0][0], [input]);
  assert.equal(completed[0][1], result[0].record);
  assert.equal(completed[0][2], 'standalone');
});

test('unresolved consolidation observer reports actual conflict and separate outputs unchanged', () => {
  const records = [record(0), record(1, { productName: 'Pluss', canonicalProductName: 'Pluss' })];
  const { hooks, perRecord, completed } = consolidationObserver();
  const result = consolidateInsuranceRecords(records, undefined, hooks);
  assert.deepEqual(result, consolidateInsuranceRecords(records));
  assert.equal(perRecord.size, 0);
  assert.equal(completed.length, 2);
  for (const [index, call] of completed.entries()) {
    assert.deepEqual(call[0], [records[index]]);
    assert.equal(call[1], result[index].record);
    assert.equal(call[2], 'unresolved');
    assert.ok(call[3].includes('product_conflict'));
  }
});
