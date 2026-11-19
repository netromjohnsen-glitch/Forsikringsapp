import assert from 'node:assert/strict';
import test from 'node:test';
import { planExtractionBatches } from '../lib/analysis-batching.ts';
import { enrichBatch, mergeBatchResults } from '../lib/analysis-merge.ts';
import { parseExtractionResponse } from '../lib/analysis-output.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';

const productName = 'NITO Innboforsikring Fritidsbolig';
const version = '2026-01-01';
const factKeys = ['innbo.forsikringssted', 'innbo.forsikringssum'];

function extractedInsurance(overrides = {}) {
  return {
    company: 'Tryg Forsikring',
    agreementScope: 'nito',
    documentRole: 'individual_agreement',
    agreementPeriod: { from: '2026-09-01', to: '2026-12-31' },
    documentIndices: [1],
    type: 'Innbo',
    productName,
    canonicalProductName: productName,
    annualPremium: null,
    deductible: null,
    coverageSummary: null,
    importantTerms: [],
    addOns: [],
    ...overrides,
  };
}

function analyze(insurances, { printedName = productName, printedVersion = version } = {}) {
  const lines = ['Syntetisk forsikringsbevis', 'Tryg Forsikring', 'Medlemsavtale: NITO', 'Produkt: ' + printedName];
  if (printedVersion) lines.push('Vilkårsutgave: ' + printedVersion);
  const [batch] = planExtractionBatches([{
    side: 'existing', documentIndex: 0, pages: 1, text: lines.join('\n'),
  }]);
  const extraction = parseExtractionResponse({ output_text: JSON.stringify({
    company: 'Tryg Forsikring',
    totalAnnualPremium: null,
    totalAnnualPremiumScope: 'partial_or_unclear',
    insurances,
  }) });
  const agreement = enrichBatch(extraction, batch, createAnalysisTelemetry('syntetisk-nito-hytteinnbo'));
  return mergeBatchResults([{ batch, agreement }], 'existing', false).insuranceData.insurances;
}

test('NITO hytteinnbo bruker riktig vilkårsutgave når modellen returnerer Innbo', () => {
  const [result] = analyze([extractedInsurance()]);
  assert.equal(result.type, 'Innbo fritidsbolig');
  assert.equal(result.catalogReference?.productId, 'tryg-nito-innbo-fritidsbolig');
  assert.equal(result.catalogReference?.agreementScope, 'nito');
  assert.equal(result.catalogReference?.version, version);
  assert.deepEqual(result.catalogFacts.map(fact => fact.key).sort(), factKeys);
  assert.ok(result.catalogFacts.every(fact =>
    fact.source.documentId === 'tryg-nito-innbo-fritidsbolig-terms' &&
    fact.source.agreementScope === 'nito' && fact.source.version === version && fact.source.page === 2));
  assert.deepEqual(result.importantTerms.filter(term => term.coverageOrigin === 'catalog').map(term => term.key).sort(), factKeys);
});

for (const [label, overrides, pdfOptions] of [
  ['ukjent medlemsavtale', { agreementScope: null }],
  ['annen medlemsavtale', { agreementScope: 'utdanningsforbundet' }],
  ['ukjent produktnavn', { canonicalProductName: null }],
  ['annet produktnavn i PDF', {}, { printedName: 'NITO Innboforsikring' }],
  ['ukjent vilkårsutgave', {}, { printedVersion: null }],
  ['annen vilkårsutgave', {}, { printedVersion: '2025-01-01' }],
]) {
  test('Hytteinnbooppslag avvises ved ' + label, () => {
    const [result] = analyze([extractedInsurance(overrides)], pdfOptions);
    assert.equal(result.type, 'Innbo');
    assert.equal(result.catalogReference, null);
    assert.ok(!result.catalogFacts?.length);
  });
}

test('Delt PDF gir ikke grunnlag for å korrigere NITO hytteinnbo', () => {
  const results = analyze([
    extractedInsurance(),
    extractedInsurance({
      type: 'Bil', productName: 'Syntetisk bilprodukt', canonicalProductName: 'Syntetisk bilprodukt',
    }),
  ]);
  assert.equal(results.length, 2);
  const contents = results.find(result => result.productName === productName);
  assert.equal(contents?.type, 'Innbo');
  assert.equal(contents?.catalogReference, null);
  assert.ok(!contents?.catalogFacts?.length);
});
