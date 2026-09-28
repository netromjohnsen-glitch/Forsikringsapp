import test from 'node:test';
import assert from 'node:assert/strict';
import { portfolioDocuments, generalTerms, batchDocuments, objects } from './helpers/supporting-terms.mjs';
import { parsed, term } from './helpers/pilot-quality.mjs';
import { mergeBatchResults } from '../lib/analysis-merge.ts';
import { sanitizeAnalysisDocumentForClient } from '../lib/analysis-output.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { consolidateInsuranceRecords } from '../lib/insurance-object-consolidation.ts';
import { isCustomerObject } from '../lib/supporting-terms.ts';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';

// Only synthetic fixtures. These tests establish the role/price boundary; they
// do not assert what the unavailable production extraction contained.
const keys = ['premie.ekskl_tfa', 'premie.tfa', 'premie.total'];
const keyOf = fact => fact.key ?? fact.canonicalKey;
const prices = record => record.importantTerms.filter(fact => keys.includes(keyOf(fact)));
const presence = record => keys.map(key => prices(record).some(fact => keyOf(fact) === key));
const withoutPrices = record => ({ ...record, annualPremium: null,
  importantTerms: record.importantTerms.filter(fact => !keys.includes(keyOf(fact))) });
const values = record => Object.fromEntries(prices(record).map(fact => [keyOf(fact), fact.value]));
const customer = () => portfolioDocuments()[0][0];

function run(documents, side = 'existing', split = false) {
  const batches = batchDocuments(documents, side, split);
  const merged = mergeBatchResults(batches.toReversed(), side, false);
  const client = sanitizeAnalysisDocumentForClient(merged);
  return { batches, merged, client };
}

function preserved(actual, original, side) {
  assert.deepEqual(values(actual), values(original));
  assert.deepEqual(presence(actual), [true, true, true]);
  for (const fact of prices(actual)) {
    assert.equal(fact.coverageOrigin, 'document');
    assert.ok(fact.sources.length > 0);
    assert.ok(fact.sources.every(source => source.documentRole === 'individual_agreement'));
    assert.ok(fact.sources.every(source => source.documentId.startsWith(`pdf:${side}:`)));
  }
}

test('customer price: combined individual agreement and general sections retain the concrete customer facts', () => {
  const mixed = customer();
  mixed.importantTerms.push(term('Generelt produktunntak', 'Syntetisk begrensning'));
  mixed.deductible = '4300 kr';
  const { batches, client } = run([[mixed]]);
  assert.equal(batches[0].agreement.insurances.length, 1);
  const [object] = objects(client);
  preserved(object, mixed, 'existing');
  assert.equal(object.deductible, mixed.deductible);
  assert.deepEqual(object.objectIdentifiers.map(id => id.value), mixed.objectIdentifiers.map(id => id.value));
  assert.ok(object.importantTerms.some(fact => fact.name === 'Generelt produktunntak'));
});

for (const separatePdf of [false, true]) test(`customer price: separate roles, separate PDF=${separatePdf}`, () => {
  const individual = customer(), terms = generalTerms();
  const { batches, merged, client } = run(separatePdf ? [[individual], [terms]] : [[individual, terms]], 'existing', separatePdf);
  const raw = parsed([individual, terms]);
  assert.deepEqual(raw.insurances.map(presence), [[true, true, true], [false, false, false]]);
  const records = batches.flatMap(batch => batch.agreement.documentRecords);
  assert.deepEqual(records.map(record => isCustomerObject(record)), [true, false]);
  for (const batch of batches) for (const object of batch.agreement.insurances) {
    preserved(object, individual, 'existing');
    const normalized = normalizeDocumentFacts(object);
    const repeated = normalizeDocumentFacts({ ...object, importantTerms: normalized });
    assert.deepEqual(values({ importantTerms: repeated }), values(individual));
  }
  preserved(objects(merged)[0], individual, 'existing');
  preserved(objects(client)[0], individual, 'existing');
  assert.equal(objects(client).length, 1);
  assert.equal(client.insuranceData.supportingEvidence.length, 1);
});

test('customer price: terms-only examples cannot create a customer or price contribution', () => {
  const example = generalTerms('Kasko', { importantTerms: customer().importantTerms, annualPremium: '10321 kr.' });
  const { client } = run([[example]]);
  assert.equal(objects(client).length, 0);
  assert.deepEqual(presence(client.insuranceData.supportingEvidence[0]), [true, true, true]);
  assert.equal(client.insuranceData.totalAnnualPremium, null);
  assert.ok(portfolioPrice(client).components.every(component => component.priced === 0));
});

for (const side of ['existing', 'offer']) for (const reverse of [false, true]) for (const split of [false, true]) {
  test(`customer price: two objects and terms survive side=${side}, reverse=${reverse}, split=${split}`, () => {
    const documents = portfolioDocuments(side);
    if (reverse) { documents.reverse(); documents.forEach(records => records.reverse()); }
    const expected = documents.flat().filter(isCustomerObject);
    const { client } = run(documents, side, split);
    assert.equal(objects(client).length, 2);
    for (const object of objects(client)) {
      const original = expected.find(record => record.canonicalProductName === object.canonicalProductName);
      preserved(object, original, side);
    }
    assert.ok(portfolioPrice(client).components.every(component => component.expected === 2 && component.priced === 2 && component.completeness === 'complete'));
  });
}

for (const suffix of ['kr', 'kr.']) test(`customer price: ${suffix} remains valid through role separation`, () => {
  const individual = customer();
  prices(individual).forEach(fact => { fact.value = fact.value.replace(/kr\.?$/u, suffix); });
  const { client } = run([[individual, generalTerms()]]);
  preserved(objects(client)[0], individual, 'existing');
  assert.ok(portfolioPrice(client).components.every(component => component.completeness === 'complete'));
});

test('customer price: same-object cross-batch consolidation retains prices from the individual record', () => {
  const individual = customer(), supplement = withoutPrices(customer());
  supplement.importantTerms = [term('Egenandel', '4300 kr')];
  const { batches, client } = run([[supplement], [generalTerms()], [individual]], 'existing', true);
  const candidates = batches.flatMap(batch => batch.agreement.documentRecords).filter(isCustomerObject);
  const consolidated = consolidateInsuranceRecords(candidates);
  assert.equal(consolidated.length, 1);
  preserved(consolidated[0].record, individual, 'existing');
  preserved(objects(client)[0], individual, 'existing');
  assert.equal(objects(client)[0].consolidation.recordCount, 2);
});

test('customer price: a legitimate unpriced customer remains in the partial portfolio', () => {
  const documents = portfolioDocuments();
  documents[1][0] = withoutPrices(documents[1][0]);
  const { client } = run(documents);
  assert.equal(objects(client).length, 2);
  assert.ok(portfolioPrice(client).components.every(component => component.expected === 2 && component.priced === 1 && component.completeness === 'partial'));
});

for (const role of ['unknown', undefined]) test(`customer price: uncertain role ${role} and no secure ID do not discard customer prices`, () => {
  const individual = { ...customer(), documentRole: role, objectIdentifiers: [] };
  const { client } = run([[individual, generalTerms()]]);
  assert.equal(objects(client).length, 1);
  assert.deepEqual(values(objects(client)[0]), values(individual));
  assert.ok(portfolioPrice(client).components.every(component => component.completeness === 'complete'));
});

test('customer price: non-vehicle customer price and deductible survive supporting terms', () => {
  const individual = { ...customer(), type: 'Hus', company: 'Syntetisk selskap', productName: 'Standard',
    canonicalProductName: 'Standard', objectIdentifiers: [], annualPremium: '6234 kr.', deductible: '4300 kr',
    importantTerms: [term('Årspremie', '6234 kr.', 'premie.total')] };
  const terms = { ...generalTerms(), type: 'Hus', company: individual.company,
    productName: 'Standard', canonicalProductName: 'Standard', importantTerms: [] };
  const { client } = run([[individual], [terms]]);
  assert.equal(objects(client).length, 1);
  assert.equal(objects(client)[0].annualPremium, individual.annualPremium);
  assert.equal(objects(client)[0].deductible, individual.deductible);
  assert.deepEqual(values(objects(client)[0]), values(individual));
});

test('customer price: manual registration retains its own declared annual price', () => {
  const manual = normalizeManualAgreement({ company: 'Syntetisk selskap', products: [{ type: 'Hus',
    productName: 'Standard', annualPremium: '6234', deductible: '4300', coverageSummary: '', importantTerms: [], catalogReference: null }] });
  const sanitized = sanitizeAnalysisDocumentForClient(manual);
  assert.equal(objects(sanitized).length, 1);
  assert.equal(objects(sanitized)[0].annualPremium, '6234');
  assert.equal(sanitized.insuranceData.totalAnnualPremium, '6 234 kr');
});

test('customer price diagnostic: missing final prices do not prove they were in extraction', () => {
  const individual = withoutPrices(customer());
  const without = run([[individual, generalTerms()]]);
  const withGenericPrices = run([[individual, generalTerms('Kasko', { importantTerms: prices(customer()) })]]);
  // Both produce the reported price absence. Only the second input has price
  // keys anywhere in extraction, and its role provides no customer authority.
  assert.deepEqual(objects(without.client).map(presence), objects(withGenericPrices.client).map(presence));
  assert.deepEqual(presence(objects(without.client)[0]), [false, false, false]);
  assert.deepEqual(presence(without.client.insuranceData.supportingEvidence[0]), [false, false, false]);
  assert.deepEqual(presence(withGenericPrices.client.insuranceData.supportingEvidence[0]), [true, true, true]);
});

test('customer price: generic examples with an object ID are still not customer-authoritative prices', () => {
  const individual = withoutPrices(customer());
  const example = { ...generalTerms(), objectIdentifiers: customer().objectIdentifiers, importantTerms: prices(customer()) };
  const raw = parsed([individual, example]);
  assert.deepEqual(raw.insurances.map(presence), [[false, false, false], [true, true, true]]);
  const { batches, client } = run([[individual, example]]);
  // Exact ID plus product scope permits retaining evidence, not promoting its
  // price examples or changing an explicitly generic record's source role.
  assert.equal(batches[0].agreement.documentRecords.length, 2);
  assert.equal(batches[0].agreement.insurances.length, 1);
  assert.deepEqual(presence(objects(client)[0]), [false, false, false]);
  assert.deepEqual(presence(client.insuranceData.supportingEvidence[0]), [true, true, true]);
  assert.equal(objects(client)[0].recordEvidence.length, 2);
});
