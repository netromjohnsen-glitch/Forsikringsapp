import test from 'node:test';
import assert from 'node:assert/strict';
import { productCatalog } from '../lib/product-catalog.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { car, term as rawTerm } from './helpers/pilot-quality.mjs';

// Explicit B-050 shared-selection authority: only this exact canonical limit.
const limit = 'hund.bruksverdi.grense', use = 'hund.bruksverdi.dekning', life = 'dyr.liv.dekning';
const rule = 'Ved tap av bruksverdi er erstatningsgrunnlaget forsikringssummen. Det gjøres fradrag for gjenverdi minimum kr 5 000. Ved utbetalt erstatning for tap av bruksverdi blir forsikringssummen for Død endret i samsvar med gjenverdien.';
const source = { documentId: 'synthetic-customer', filename: 'synthetic-customer.pdf', company: 'Gjensidige', page: 1 };
const label = key => key === limit ? 'Bruksverdi – grense' : key === use ? 'Bruksverdi' : 'Liv, død og tap';
const term = (key, value) => ({ canonicalKey: key, name: label(key), value, source });
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const coverage = (object, key) => canonicalCoverage(object, object.type, key);
const status = (object, key) => coverage(object, key).status;
const enrich = (terms, company = 'Gjensidige', name = 'Behandling') => {
  const input = { company, totalAnnualPremium: null, insurances: [{ type: 'Hund', productName: name,
    agreementScope: 'ordinary', annualPremium: null, deductible: null, coverageSummary: null, importantTerms: terms, addOns: [] }] };
  const before = structuredClone(input);
  const result = enrichExtractedAgreementWithCatalog(input, new Date('2026-10-05')).insurances[0];
  assert.deepEqual(input, before);
  return result;
};
const scenarios = [
  ['missing', [], 'unknown', 'unknown', [], false, false],
  ['rule alone', [term(limit, rule)], 'unknown', 'unknown', [], false, false],
  ['Liv alone', [term(life, 'Valgt')], 'unknown', 'selected', ['gjensidige-hund-liv'], false, false],
  ['Liv plus rule', [term(life, 'Valgt'), term(limit, rule)], 'unknown', 'selected', ['gjensidige-hund-liv'], false, false],
  ['explicit Bruk without Liv', [term(use, 'Valgt')], 'selected', 'unknown', [], false, false],
  ['explicit Liv and Bruk', [term(life, 'Valgt'), term(use, 'Valgt'), term(limit, rule)], 'selected', 'selected', ['gjensidige-hund-liv', 'gjensidige-hund-bruk'], false, false],
  ['Liv refused', [term(life, 'Ikke valgt'), term(limit, rule)], 'unknown', 'not_selected', [], false, false],
  ['Liv conflict', [term(life, 'Valgt'), term(life, 'Ikke valgt'), term(limit, rule)], 'unknown', 'unknown', [], false, true],
  ['Bruk refused', [term(use, 'Ikke valgt'), term(limit, rule)], 'not_selected', 'unknown', [], false, false],
  ['Bruk conflict', [term(use, 'Valgt'), term(use, 'Ikke valgt'), term(limit, rule)], 'unknown', 'unknown', [], true, false],
];
for (const [name, terms, expectedUse, expectedLife, ids, useConflict, lifeConflict] of scenarios) test(`Bruk limit enrichment: ${name}`, () => {
  const out = enrich(terms);
  assert.equal(status(out, use), expectedUse); assert.equal(status(out, life), expectedLife);
  assert.deepEqual(out.addOnIds, ids);
  assert.equal(coverage(out, use).conflict, useConflict); assert.equal(coverage(out, life).conflict, lifeConflict);
  if (terms.some(t => t.canonicalKey === limit)) {
    const detail = coverage(out, use).details.find(d => d.key === limit); assert.ok(detail);
    assert.equal(detail.value, rule); assert.ok(detail.sources.some(s => s.documentId === source.documentId));
    const effective = out.importantTerms.find(t => t.key === limit); assert.equal(effective.value, rule);
    assert.equal(effective.coverageOrigin, 'document');
  }
});
const record = (terms, role = 'individual_agreement') => ({ ...car(), type: 'Hund', productName: 'Behandling',
  canonicalProductName: 'Behandling', agreementScope: 'ordinary', objectIdentifiers: [], documentRole: role,
  importantTerms: terms.map(t => rawTerm(t.name, t.value, t.canonicalKey)), addOns: [] });
for (const side of ['existing', 'offer']) for (const role of ['individual_agreement', 'unknown']) test(`Bruk limit actual document pipeline: ${side}/${role}`, () => {
  const out = documentPipeline([[record([term(life, 'Valgt'), term(limit, rule)], role)]], side).insuranceData.insurances;
  assert.equal(out.length, 1); assert.equal(status(out[0], use), 'unknown'); assert.equal(status(out[0], life), 'selected');
  assert.deepEqual(out[0].addOnIds, ['gjensidige-hund-liv']);
  const detail = coverage(out[0], use).details.find(d => d.key === limit);
  assert.equal(detail.value, rule); assert.ok(detail.sources.some(s => s.documentRole === role));
  assert.equal(out[0].documentRole, role);
});
for (const [name, terms, expectedUse, expectedLife, ids] of scenarios.filter(s => !s[0].includes('conflict'))) test(`Bruk limit supporting terms: ${name}`, () => {
  // The generic clause is a separate supporting record, never customer selection.
  const customerTerms = terms.filter(t => t.canonicalKey !== limit);
  const out = documentPipeline([[record(customerTerms)], [record([term(limit, rule)], 'general_terms')]]).insuranceData.insurances[0];
  assert.equal(status(out, use), expectedUse); assert.equal(status(out, life), expectedLife); assert.deepEqual(out.addOnIds, ids);
  const evidence = out.recordEvidence.find(r => r.documentRole === 'general_terms'); assert.ok(evidence);
  assert.ok(evidence.importantTerms.some(t => t.key === limit && t.value === rule));
  const effective = out.importantTerms.find(t => t.key === limit);
  if (expectedUse === 'selected') { assert.equal(effective.value, rule); assert.equal(effective.coverageOrigin, 'catalog'); }
  else assert.equal(effective, undefined);
});
test('Bruk limit document X beats supporting Y in both sides', () => {
  for (const side of ['existing', 'offer']) {
    const out = documentPipeline([[record([term(life, 'Valgt'), term(use, 'Valgt'), term(limit, '17 000 kr')])],
      [record([term(limit, rule)], 'general_terms')]], side).insuranceData.insurances[0];
    assert.equal(status(out, use), 'selected');
    assert.equal(out.importantTerms.find(t => t.key === limit).value, '17 000 kr');
    assert.equal(coverage(out, use).details.find(t => t.key === limit).value, '17 000 kr');
  }
});
const manual = (customProduct, addOnIds = []) => normalizeManualAgreement({ company: 'Gjensidige', products: [{
  type: 'Hund', productName: 'Behandling', customProduct, importantTerms: [{ name: label(limit), value: rule }], addOnIds,
}] }).insuranceData.insurances[0];
test('Bruk limit manual custom preserves raw detail without selecting coverage', () => {
  const out = manual(true); assert.equal(status(out, use), 'unknown'); assert.equal(status(out, life), 'unknown');
  assert.deepEqual(out.addOnIds, []); assert.equal(out.importantTerms[0].value, rule);
  assert.equal(coverage(out, use).details.find(t => t.key === limit).value, rule);
});
test('Bruk limit manual catalog requires independent Liv and Bruk choices', () => {
  assert.equal(status(manual(false), use), 'unknown');
  const liv = manual(false, ['gjensidige-hund-liv']); assert.equal(status(liv, use), 'unknown'); assert.equal(status(liv, life), 'selected');
  const both = manual(false, ['gjensidige-hund-liv', 'gjensidige-hund-bruk']); assert.equal(status(both, use), 'selected');
  assert.throws(() => manual(false, ['gjensidige-hund-bruk']), /Ugyldig eller ikke gyldig tilleggsdekning/u);
});
test('Bruk limit product availability, same product and both comparison directions', () => {
  const p = product('gjensidige-hund-behandling'), other = product('frende-hund-veterin-r');
  const f = materializeCatalogProduct(p).facts.find(f => f.key === use); assert.equal(f.state, 'optional'); assert.deepEqual(f.addOnNames, ['Bruk']);
  assert.equal(compareCatalogProducts(p, p).differenceCount, 0);
  const forward = compareCatalogProducts(p, other).sections.flatMap(s => s.rows);
  const reverse = compareCatalogProducts(other, p).sections.flatMap(s => s.rows);
  for (const row of forward) { const swapped = reverse.find(r => r.key === row.key); assert.ok(swapped);
    assert.deepEqual(row.first, swapped.second); assert.deepEqual(row.second, swapped.first); }
});
test('Bruk limit Frende Tap and refusal preserve independent Liv facts', () => {
  const out = enrich([term(life, 'Valgt'), term(use, 'Ikke valgt'), term(limit, '17 000 kr')], 'Frende', 'Veterinær');
  assert.equal(status(out, life), 'selected'); assert.equal(status(out, use), 'not_selected'); assert.ok(out.addOnIds.includes('frende-hund-tap'));
  assert.ok(out.importantTerms.some(t => t.key === 'dyr.liv.opphor' && t.coverageOrigin === 'catalog'));
  assert.ok(out.importantTerms.some(t => t.key === 'dyr.liv.forsvinning' && t.coverageOrigin === 'catalog'));
  const selected = enrich([term(life, 'Valgt')], 'Frende', 'Veterinær'); assert.equal(status(selected, use), 'selected');
});
for (const p of productCatalog.products.filter(p => p.providerId === 'storebrand' && p.insuranceType === 'Hund' && /Dødsfall/u.test(p.name))) test(`Bruk limit Storebrand selected product preserved: ${p.productId}`, () => {
  const out = normalizeManualAgreement({ company: 'Storebrand', products: [{ type: 'Hund', productName: p.name,
    importantTerms: [], addOnIds: [] }] }).insuranceData.insurances[0];
  assert.equal(status(out, use), 'selected'); assert.equal(status(out, life), 'selected');
  assert.ok(coverage(out, use).details.some(d => d.key === limit && /50 %/u.test(d.value)));
});
test('Bruk limit Fremtind stays independent; Katt and positive details stay assertive', () => {
  const addon = productCatalog.addOns.find(a => a.id === 'sparebank1-fremtind-hund-bruk'); assert.ok(addon);
  assert.equal(addon.requiresAddOnIds, undefined);
  for (const key of ['katt.bruksverdi.alder', 'katt.bruksverdi.grense', 'maskinskade.alder', 'maskinskade.km', 'leiebil.dager', 'dyr.liv.sum.valgbar'])
    assert.equal(isNonAssertingCoverageDetail(key), false, key);
  for (const [type, key, value, parent] of [['Bil', 'maskinskade.alder', '10 år', 'maskinskade.dekning'],
    ['Bil', 'maskinskade.km', '200 000 km', 'maskinskade.dekning'], ['Bil', 'leiebil.dager', 'Leiebil inntil 60 dager', 'leiebil.dekning']])
    assert.equal(canonicalCoverage({ importantTerms: [{ key, name: key, value, coverageOrigin: 'document' }] }, type, parent).status, 'selected');
  const input = { company: 'If', totalAnnualPremium: null, insurances: [{ type: 'Hund', productName: 'Basis',
    annualPremium: null, deductible: null, coverageSummary: null, addOns: [], importantTerms: [term('dyr.liv.sum.valgbar', 'Kundens avtalte Liv-sum 25 000 kr')] }] };
  const out = enrichExtractedAgreementWithCatalog(input, new Date('2026-10-05')).insurances[0];
  assert.equal(status(out, life), 'selected'); assert.ok(out.addOnIds.includes('if-hund-liv'));
});
