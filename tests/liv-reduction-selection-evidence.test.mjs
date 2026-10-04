import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { productCatalog, availableAddOns, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { boatPetFactLabel, boatPetKeyApplies } from '../lib/boat-pet-registry.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { createDifferences, groupAddOnNames, groupInsurances, groupTerms } from '../lib/comparison.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';

// If §5.2 presupposes Liv bought in the certificate. Its age schedule cannot
// establish that purchase. Other providers keep their own values and species.
const parent = 'dyr.liv.dekning';
const rules = [
  ['dyr.liv.reduksjon.start', 'Rasegruppe 1'],
  ['dyr.liv.reduksjon.sats', '20 % av siste forsikringsårs forsikringssum'],
  ['dyr.liv.opphor', 'Ved fornyelse det året hunden blir 8 år'],
];
const date = new Date('2026-09-29T10:52:14.812Z');
const pets = productCatalog.products.filter(p => ['Hund', 'Katt'].includes(p.insuranceType));
const find = id => {
  const product = pets.find(p => p.productId === id);
  assert.ok(product, id);
  return product;
};
const source = p => ({
  documentId: `synthetic-customer:${p.productId}`, filename: 'kundebevis.pdf',
  termsNumber: 'Syntetisk kundebevis', effectiveFrom: '2026-09-29',
  company: p.company, agreementScope: p.agreementScope, version: p.version,
  page: 3, section: 'Avtalte Liv-opplysninger',
});
const term = (p, key, value) => ({
  name: boatPetFactLabel(p.insuranceType.toLowerCase(), key), canonicalKey: key, value, source: source(p),
});
const record = (p, importantTerms, documentRole = 'individual_agreement') => ({
  company: p.company, type: p.insuranceType, productName: p.name, canonicalProductName: p.name,
  agreementScope: p.agreementScope, documentRole, agreementPeriod: null, objectIdentifiers: [],
  annualPremium: null, deductible: null, coverageSummary: null, importantTerms, addOns: [],
});
// Raw extraction contains schema fields only. The actual PDF pipeline attaches
// source references after parsing; direct enrichment fixtures above already
// represent that later stage and deliberately carry a customer source.
const pipelineRecord = (p, terms, role = 'individual_agreement') => ({
  ...record(p, terms, role),
  importantTerms: terms.map(({ name, canonicalKey, value }) => ({ name, canonicalKey, value })),
});
const enrich = (p, terms) => enrichExtractedAgreementWithCatalog({
  company: p.company, totalAnnualPremium: null, insurances: [record(p, terms)],
}, date).insurances[0];
const life = insurance => canonicalCoverage(insurance, insurance.type, parent);
const hasBaseLife = p => resolveCatalogFacts(p, [], date).some(f => f.key === parent);
const lifeIds = p => availableAddOns(p, date).filter(a =>
  (productCatalog.facts[a.componentId] ?? []).some(f => f.key === parent)).map(a => a.id);
const syntheticRule = (p, key) => p.providerId === 'if' && p.insuranceType === 'Hund'
  ? rules.find(([k]) => k === key)[1]
  : {
    'dyr.liv.reduksjon.start': 'Dokumentert reduksjonsgruppe',
    'dyr.liv.reduksjon.sats': 'Dokumentert reduksjonssats',
    'dyr.liv.opphor': 'Ved dokumentert opphørsgrense',
  }[key];
function assertDocumentDetail(insurance, p, key, value) {
  const detail = insurance.importantTerms.find(t => t.key === key && t.coverageOrigin === 'document');
  assert.ok(detail, `${p.productId}: ${key}`);
  assert.equal(detail.value, value);
  assert.deepEqual(detail.source, source(p));
  const canonicalDetail = life(insurance).details.find(t => t.key === key);
  assert.ok(canonicalDetail, key);
  assert.equal(canonicalDetail.value, value);
  assert.ok(canonicalDetail.sources.some(s => s.documentId === source(p).documentId && s.page === 3));
}
function assertPipelineDetail(insurance, key, value, role) {
  const detail = insurance.importantTerms.find(t => t.key === key && t.coverageOrigin === 'document');
  assert.ok(detail, key);
  assert.equal(detail.value, value);
  assert.deepEqual(detail.sources, [{
    documentId: 'pdf:existing:0', filename: 'Dokument 1', termsNumber: 'Ikke oppgitt',
    effectiveFrom: '', page: 0, section: 'Dokumentopplysninger; side/punkt ikke identifisert', documentRole: role,
  }]);
  const canonicalDetail = life(insurance).details.find(t => t.key === key);
  assert.ok(canonicalDetail, key);
  assert.equal(canonicalDetail.value, value);
  assert.deepEqual(canonicalDetail.sources, detail.sources);
}

test('source: frozen If Hund §5.2 schedule has the reviewed hash', () => {
  assert.equal(createHash('sha256').update(readFileSync(new URL(
    '../catalog/sources/boat-pet/if-dog-terms.pdf', import.meta.url))).digest('hex'),
  'd2372736a4d99d4c434ac87ea068c5051908742ae03e454220b6b1cc1d436c75');
});

test('guard: exactly the three schedule keys; existing restriction identities remain', () => {
  for (const [key] of rules) assert.equal(isNonAssertingCoverageDetail(key), true);
  for (const key of ['parkering.bonus', 'dyr.liv.begrensning', 'uhell.unntak']) {
    assert.equal(isNonAssertingCoverageDetail(key), true);
  }
  for (const key of [parent, 'dyr.liv.sum.valgbar', 'dyr.liv.forsvinning', 'dyr.liv.tyveri',
    'leiebil.dager', 'maskinskade.alder', 'hund.bruksverdi.alder', 'dyr.veterinaralder.opphor',
    'dyr.liv.opphor.annet', 'annen.liv.reduksjon.start']) {
    assert.equal(isNonAssertingCoverageDetail(key), false, key);
  }
});

for (const p of pets) for (const [key] of rules) {
  test(`${p.productId} / ${key}: silent, unknown, selected, refused and conflicting Liv`, () => {
    const value = syntheticRule(p, key);
    const detail = term(p, key, value);
    for (const state of ['silent', 'unknown', 'selected', 'negative', 'conflict']) {
      const parents = state === 'silent' ? [] : state === 'conflict'
        ? [term(p, parent, 'Valgt'), term(p, parent, 'Ikke valgt')]
        : [term(p, parent, { unknown: 'Ikke dokumentert', selected: 'Valgt', negative: 'Ikke valgt' }[state])];
      // Verify the un-enriched document separately from independently included
      // Storebrand base Liv. The rule never supplies a positive assertion.
      const normalized = normalizeDocumentFacts(record(p, [...parents, detail]));
      const bare = canonicalCoverage({ importantTerms: normalized, addOns: [] }, p.insuranceType, parent);
      assert.equal(bare.status, state === 'selected' ? 'selected' : state === 'negative' ? 'not_selected' : 'unknown');
      assert.equal(bare.conflict, state === 'conflict');
      assert.ok(bare.evidence.some(e => e.kind === 'restriction' && e.status === 'unknown' && e.value === value));

      const out = enrich(p, [...parents, detail]);
      const coverage = life(out);
      const expected = state === 'selected' || (hasBaseLife(p) && ['silent', 'unknown'].includes(state))
        ? 'selected' : state === 'negative' ? 'not_selected' : 'unknown';
      assert.equal(coverage.status, expected);
      assert.equal(coverage.conflict, state === 'conflict');
      const ids = lifeIds(p);
      assert.deepEqual(out.addOnIds.filter(id => ids.includes(id)), state === 'selected' ? ids : []);
      if (state !== 'selected') assert.equal(groupAddOnNames([out], p.insuranceType), null);
      assertDocumentDetail(out, p, key, value);
      if (expected !== 'selected') assert.equal(coverage.summary, null);
      if (state === 'selected') assert.ok(coverage.summary?.includes(value));
      // Consolidation/repeated normalization keeps the document's exact rule.
      const repeated = enrichExtractedAgreementWithCatalog({
        company: p.company, totalAnnualPremium: null, insurances: [out],
      }, date).insurances[0];
      assert.equal(life(repeated).status, expected);
      assertDocumentDetail(repeated, p, key, value);
    }
  });
}

for (const tier of ['basis', 'standard', 'super']) for (const [key, value] of rules) {
  const p = find(`if-hund-${tier}`);
  test(`If Hund ${tier} / ${key}: actual pipeline roles and supporting terms`, () => {
    const detail = term(p, key, value);
    for (const role of ['individual_agreement', 'unknown']) {
      const out = documentPipeline([[pipelineRecord(p, [detail], role)]]).insuranceData.insurances[0];
      assert.equal(life(out).status, 'unknown');
      assert.deepEqual(out.addOnIds, []);
      assert.equal(groupAddOnNames([out], p.insuranceType), null);
      assertPipelineDetail(out, key, value, role);
    }
    const support = pipelineRecord(p, [detail], 'general_terms');
    const onlyTerms = documentPipeline([[support]]);
    assert.deepEqual(onlyTerms.insuranceData.insurances, []);
    assert.equal(onlyTerms.insuranceData.supportingEvidence.length, 1);
    for (const state of ['silent', 'selected', 'negative', 'conflict']) {
      const parents = state === 'silent' ? [] : state === 'conflict'
        ? [term(p, parent, 'Valgt'), term(p, parent, 'Ikke valgt')]
        : [term(p, parent, state === 'selected' ? 'Valgt' : 'Ikke valgt')];
      for (const separate of [false, true]) {
        const customer = pipelineRecord(p, parents);
        const documents = separate ? [[customer], [support]] : [[customer, support]];
        const out = documentPipeline(documents, 'existing', separate, separate).insuranceData.insurances[0];
        assert.equal(life(out).status, state === 'selected' ? 'selected' : state === 'negative' ? 'not_selected' : 'unknown');
        assert.equal(life(out).conflict, state === 'conflict');
        assert.equal(out.addOnIds.includes('if-hund-liv'), state === 'selected');
        if (state !== 'selected') {
          assert.ok(!out.importantTerms.some(t => t.key === key));
          assert.ok(out.recordEvidence.some(e => e.documentRole === 'general_terms' &&
            e.importantTerms.some(t => t.canonicalKey === key || t.key === key)));
        }
      }
    }
  });
  test(`If Hund ${tier} / ${key}: same product and both customer comparison directions`, () => {
    const silent = enrich(p, [term(p, key, value)]);
    const selected = enrich(p, [term(p, parent, 'Valgt'), term(p, key, value)]);
    for (const [first, second] of [[silent, silent], [silent, selected], [selected, silent]]) {
      const groups = groupInsurances([first], [second], null);
      assert.equal(groups.length, 1);
      const row = groupTerms(groups[0], null).find(t => t.key === parent);
      assert.ok(row);
      assert.equal(row.firstCoverage.status, life(first).status);
      assert.equal(row.secondCoverage.status, life(second).status);
      const doc = insurance => ({ insuranceData: { company: p.company, totalAnnualPremium: null, insurances: [insurance] } });
      const differences = createDifferences(doc(first), doc(second), groups, null);
      if (first === second) assert.deepEqual(differences, []);
      else assert.ok(differences.some(d => d.title === row.label));
    }
  });
}

for (const p of pets) {
  test(`${p.productId}: product terms, source identity, same product and side swap`, () => {
    const peer = find(`if-${p.insuranceType.toLowerCase()}-super`);
    for (const other of [p, peer]) {
      const forward = compareCatalogProducts(p, other).sections.flatMap(s => s.rows);
      const reverse = compareCatalogProducts(other, p).sections.flatMap(s => s.rows);
      for (const [key] of rules) {
        const row = forward.find(r => r.key === key);
        if (!row) continue; // Some products legitimately contain no schedule.
        const swapped = reverse.find(r => r.key === key);
        assert.ok(swapped);
        assert.deepEqual(row.first, swapped.second);
        assert.deepEqual(row.second, swapped.first);
        if (p === other) assert.equal(row.different, false);
        for (const side of ['first', 'second']) for (const fact of row[side].facts) {
          assert.equal(fact.role, 'term');
          assert.ok(fact.sources.length > 0);
        }
      }
    }
  });
}

test('held-out: actual Liv amount and explicit/manual selection still choose Liv', () => {
  for (const tier of ['basis', 'standard', 'super']) {
    const p = find(`if-hund-${tier}`);
    const out = enrich(p, [term(p, 'dyr.liv.sum.valgbar', 'Kundens avtalte Liv-sum 25 000 kr')]);
    assert.equal(life(out).status, 'selected');
    assert.ok(out.addOnIds.includes('if-hund-liv'));
    const manual = normalizeManualAgreement({ company: p.company, totalAnnualPremium: '', products: [{
      type: p.insuranceType, productName: p.name, agreementScope: p.agreementScope,
      annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [], addOnIds: ['if-hund-liv'],
    }] }).insuranceData.insurances[0];
    assert.equal(life(manual).status, 'selected');
    assert.ok(manual.addOnIds.includes('if-hund-liv'));
  }
});

test('held-out: Leiebil, Maskinskade, veterinarian sum and Bruksverdi retain their own contracts', () => {
  for (const [type, key, value, parentKey] of [
    ['Bil', 'leiebil.dager', 'Leiebil inntil 60 dager', 'leiebil.dekning'],
    ['Bil', 'maskinskade.alder', '10 år', 'maskinskade.dekning'],
    ['Bil', 'maskinskade.km', '200 000 km', 'maskinskade.dekning'],
    ['Hund', 'dyr.veterinar.sum.valgbar', 'Avtalt sum 40 000 kr', 'dyr.veterinar.dekning'],
    ['Hund', 'hund.bruksverdi.alder', '7 år', 'hund.bruksverdi.dekning'],
  ]) {
    const coverage = canonicalCoverage({ importantTerms: [{ key, name: key, value, coverageOrigin: 'document' }] }, type, parentKey);
    assert.equal(coverage.status, 'selected', key);
    assert.ok(coverage.details.some(d => d.key === key && d.value === value));
  }
});

test('species/type isolation: Hund schedule values are not imported into Katt or Båt', () => {
  const cat = find('if-katt-super');
  const catOut = enrich(cat, [term(cat, 'dyr.liv.reduksjon.start', 'Dokumentert katt-aldersregel')]);
  assert.equal(life(catOut).status, 'unknown');
  assert.ok(!catOut.importantTerms.some(t => t.coverageOrigin === 'catalog' && t.key.startsWith('dyr.liv.')));
  for (const [key] of rules) {
    assert.equal(boatPetKeyApplies('hund', key), true);
    assert.equal(boatPetKeyApplies('katt', key), true);
    assert.equal(boatPetKeyApplies('båt', key), false);
    const wrongType = normalizeDocumentFacts({ ...record(cat, [term(cat, key, 'Syntetisk vilkår')]), type: 'Båt' });
    assert.ok(!wrongType.some(t => t.key === key));
  }
});
