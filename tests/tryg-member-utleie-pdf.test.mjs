import assert from 'node:assert/strict';
import test from 'node:test';
import { planExtractionBatches } from '../lib/analysis-batching.ts';
import { enrichBatch, mergeBatchResults } from '../lib/analysis-merge.ts';
import { parseExtractionResponse } from '../lib/analysis-output.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';

const edition = '2026-01-01';
const period = { from: '2026-09-01', to: '2027-08-31' };
const products = [
  {
    scope: 'nito',
    displayName: 'NITO Husforsikring',
    extraName: 'NITO Husforsikring Ekstra',
    addOnName: 'Utleieforsikring til NITO Husforsikring',
    facts: ['hus.utleie_skadeverk', 'hus.utleie_husleie'],
  },
  {
    scope: 'utdanningsforbundet',
    displayName: 'Utdanningsforbundet Husforsikring',
    extraName: 'Utdanningsforbundet Hus Ekstra',
    addOnName: 'Utdanningsforbundet Utleiedekning',
    facts: ['hus.utleie.tapt-leie', 'hus.utleie.egenandel'],
  },
];

const term = (name, value, documentIndex = 1) => ({ name, value, canonicalKey: null, documentIndices: [documentIndex] });
const addOn = (name, importantTerms = []) => ({ name, importantTerms, annualPremium: null, deductible: null });

function house(product, fields = {}) {
  return {
    company: 'Tryg', type: 'Hus', agreementScope: product.scope, agreementPeriod: period,
    productName: product.displayName, canonicalProductName: product.displayName,
    documentRole: 'individual_agreement', documentIndices: [1], objectIdentifiers: [],
    annualPremium: null, deductible: null, coverageSummary: null, importantTerms: [], addOns: [],
    ...fields,
  };
}

function comparePdf(product, insurances, texts = [
  ['Individuelt forsikringsbevis', 'Tryg', product.displayName, 'Vilkårsutgave: ' + edition].join('\n'),
]) {
  const [batch] = planExtractionBatches(texts.map((text, documentIndex) => ({ side: 'existing', documentIndex, text, pages: 1 })));
  const extracted = parseExtractionResponse({ output_text: JSON.stringify({
    company: 'Tryg', totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear', insurances,
  }) });
  const agreement = enrichBatch(extracted, batch, createAnalysisTelemetry('tryg-medlem-utleie-pdf'));
  return mergeBatchResults([{ batch, agreement }], 'existing', false).insuranceData.insurances;
}

function assertRental(insurance, product) {
  const id = 'tryg-' + product.scope + '-hus-utleie';
  const facts = insurance.catalogFacts.filter(fact => fact.source.termsNumber === 'PPK11506');
  assert.deepEqual(insurance.addOnIds, [id]);
  assert.deepEqual(facts.map(fact => fact.key).sort(), [...product.facts].sort());
  const expectedSource = [id + '-terms', product.scope, 1, edition];
  for (const fact of facts) {
    const { source } = fact;
    assert.deepEqual([source.documentId, source.agreementScope, source.page, source.version], expectedSource);
    const effective = insurance.importantTerms.find(item => item.key === fact.key);
    assert.equal(effective?.coverageOrigin, 'catalog');
    assert.deepEqual(effective.source, fact.source);
  }
}

function assertNoRental(insurance) {
  assert.ok(!insurance.addOnIds?.some(id => id.endsWith('-hus-utleie')));
  assert.ok(!insurance.catalogFacts?.some(fact => fact.source.termsNumber === 'PPK11506'));
  assert.ok(!insurance.importantTerms.some(fact => fact.source?.termsNumber === 'PPK11506'));
}

for (const product of products) {
  test(product.scope + ' PDF velger bare sitt eget utleietillegg med kilder fra PPK11506', () => {
    const [named] = comparePdf(product, [house(product, { addOns: [addOn(product.addOnName)] })]);
    assertRental(named, product);
    const selected = named.importantTerms.find(item => item.name === 'Utleie' && item.value === 'Valgt');
    assert.equal(selected?.coverageOrigin, 'document');
    assert.equal(selected?.sources?.[0]?.documentId, 'pdf:existing:0');

    const [explicit] = comparePdf(product, [house(product, {
      productName: product.extraName, canonicalProductName: product.extraName,
      importantTerms: [term('Utleie', 'Valgt')],
    })]);
    assert.equal(explicit.catalogReference?.productId, 'tryg-' + product.scope + '-hus-ekstra');
    assertRental(explicit, product);
  });

  test(product.scope + ' PDF krever eget sikkert utleievalg i riktig medlemsavtale', () => {
    const otherName = products.find(candidate => candidate !== product).addOnName;
    const fixtures = [
      {},
      { importantTerms: [term('Skadeverk ved utleie', '500 000 kr')] },
      { importantTerms: [term('Utleie', 'Ikke valgt')], addOns: [addOn(product.addOnName)] },
      { importantTerms: [term('Utleie', 'Ikke oppgitt')], addOns: [addOn(product.addOnName)] },
      { importantTerms: [term('Utleie', 'Valgt'), term('Utleie', 'Ikke valgt')], addOns: [addOn(product.addOnName)] },
      { addOns: [addOn(product.addOnName, [term('Status', 'Ikke valgt')])] },
      { importantTerms: [term('Utleie', 'Valgt')], addOns: [addOn(otherName)] },
      { importantTerms: [term('Utleie', 'Valgt'), term(otherName, 'Valgt')] },
      { documentRole: 'unknown', addOns: [addOn(product.addOnName)] },
    ];
    for (const fixture of fixtures) {
      const [insurance] = comparePdf(product, [house(product, fixture)]);
      assert.ok(insurance.catalogReference, 'grunnvilkårene følger fortsatt riktig hovedprodukt');
      assertNoRental(insurance);
    }
  });
}

test('utleiebeviset kan ikke låne vilkårsutgave eller valg fra en annen PDF-post', () => {
  const product = products[0];
  const current = 'Vilkårsutgave: ' + edition;
  const selected = addOn(product.addOnName);
  const [wrongVersion] = comparePdf(product, [house(product, { addOns: [selected] })],
    ['Vilkårsutgave: 2024-01-01']);
  assert.equal(wrongVersion.catalogReference, null);
  assertNoRental(wrongVersion);

  const general = house(product, {
    documentRole: 'general_terms', documentIndices: [2],
    addOns: [addOn(product.addOnName, [term('Utleie', 'Valgt', 2)])],
  });
  const [supporting] = comparePdf(product, [house(product), general], [current, current]);
  assert.equal(supporting.catalogReference?.version, edition);
  assertNoRental(supporting);

  const [shared] = comparePdf(product, [house(product, { addOns: [selected] }), house(product, { documentRole: 'general_terms' })], [current]);
  assert.equal(shared.catalogReference, null);
  assertNoRental(shared);
});

test('eksplisitte manuelle Tryg-utleievalg har fortsatt katalogvilkår', () => {
  for (const product of products) {
    const [insurance] = normalizeManualAgreement({ company: 'Tryg', products: [{
      type: 'Hus', agreementScope: product.scope, productName: product.displayName,
      annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [],
      addOnIds: ['tryg-' + product.scope + '-hus-utleie'],
    }] }).insuranceData.insurances;
    assertRental(insurance, product);
  }
});


test('eget PPK11506-nummer bevarer dokumentvalget og avgrenser riktig tilleggsutgave', () => {
  for (const product of products) {
    const productPdf = 'Vilkårsutgave: ' + edition;
    const values = [
      ['Vilkår PPK11506 gjelder fra 01.07.25. Avløser vilkår fra 01.01.25.', false],
      ['Vilkår PPK11506 gjelder fra 1.7.2025.', false],
      ['PPK11506 gjelder fra 2025-07-01', false],
      ['Vilkår PPK11506 gjelder fra 01.01.26. Avløser vilkår fra 01.07.25.', true],
      ['Vilkår PPK11506 gjelder fra 01.01.2026. Avløser vilkår av 01.07.2025.', true],
      ['Vilkår PPK11506 gjelder fra 01.07.25.\nVilkår PPK11506 gjelder fra 01.01.26.', false],
      ['Vilkår PPK99999 gjelder fra 01.07.25.', true],
      ['Avløser vilkår PPK11506 fra 01.07.25.', true],
    ];
    for (const [heading, compatible] of values) {
      const [insurance] = comparePdf(product, [house(product, { addOns: [addOn(product.addOnName)] })],
        [[productPdf, heading].join('\n')]);
      assert.equal(insurance.catalogReference?.version, edition);
      assert.ok(insurance.importantTerms.some(item => item.name === 'Utleie' &&
        item.value === 'Valgt' && item.coverageOrigin === 'document'));
      if (compatible) assertRental(insurance, product);
      else assertNoRental(insurance);
    }
  }
});
