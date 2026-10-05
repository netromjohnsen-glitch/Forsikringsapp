import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { catalogFactSources, enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { car, term as rawTerm } from './helpers/pilot-quality.mjs';

// B-050 partial closure ONLY: 0a6b5f6f535df685 / GAP-2904 / SF-4056.
// Other B-050 findings and historical holds are not closed by this gate.
const date = new Date('2026-10-05T00:00:00Z');
const key = 'hund.bruksverdi.grense', parent = 'hund.bruksverdi.dekning', life = 'dyr.liv.dekning';
const id = 'gjensidige-hund-behandling', liv = 'gjensidige-hund-liv', bruk = 'gjensidige-hund-bruk';
const value = 'Ved tap av bruksverdi er erstatningsgrunnlaget forsikringssummen. Det gjøres fradrag for gjenverdi minimum kr 5 000. Ved utbetalt erstatning for tap av bruksverdi blir forsikringssummen for Død endret i samsvar med gjenverdien.';
const product = productCatalog.products.find(p => p.productId === id); assert.ok(product);
const facts = (ids = [liv, bruk]) => resolveCatalogFacts(product, ids, date);
const own = () => { const rows = facts().filter(f => f.key === key); assert.equal(rows.length, 1); return rows[0]; };
const term = (canonicalKey, v) => ({ canonicalKey, name: canonicalKey === life ? 'Liv, død og tap' : canonicalKey === parent ? 'Bruksverdi' : 'Bruksverdi – grense', value: v,
  source: { documentId: 'synthetic-customer', filename: 'synthetic-customer.pdf', company: 'Gjensidige', page: 1 } });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [{
  type: 'Hund', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: null, deductible: null,
  coverageSummary: null, importantTerms: terms, addOns: [],
}] }, date).insurances[0];
const coverage = (r, k = parent) => canonicalCoverage(r, 'Hund', k);
const provenance = sources => {
  assert.ok(sources.some(s => s.documentId === 'boat-pet:gjensidige:hund:life-use' && s.page === 8 && s.section === 'Erstatningsgrunnlag – tap av bruksverdi'));
  assert.ok(sources.some(s => s.documentId === 'boat-pet:gjensidige:hund:product' && s.page === 1 && s.section === 'Bruk – tillegg til Liv'));
};
for (const [filename, hash] of [
  ['gjensidige-dog-life-use-terms.pdf', '90536e3520ee46f476f480be9760bc92bd40162e29fd53e914df44b70ea150ea'],
  ['gjensidige-dog-product.html', 'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58'],
  ['gjensidige-dog-treatment-terms.pdf', '8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6'],
]) test(`R-050-SOURCE: frozen ${filename}`, () => {
  assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/boat-pet/' + filename, import.meta.url))).digest('hex'), hash);
  const source = Object.values(productCatalog.sources).find(s => s.filename === filename);
  if (filename === 'gjensidige-dog-treatment-terms.pdf') {
    const audit = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/baseline.json', import.meta.url), 'utf8'));
    assert.equal(audit.repo_files['catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf'], hash);
    assert.equal(source, undefined, 'This frozen audit source is not a production source for the partial Bruk scope');
  } else {
    assert.ok(source);
    assert.equal(source.sha256, hash); assert.equal(source.company, 'Gjensidige'); assert.equal(source.agreementScope, 'ordinary');
    assert.equal(source.version, ''); assert.equal(source.effectiveFrom, '');
  }
});
test('R-050-SF-4056: source PDF8/printed13 documents the complete residual-value rule', async () => {
  PDFParse.setWorker(getPath());
  const parser = new PDFParse({ data: readFileSync(new URL('../catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf', import.meta.url)) });
  try {
    const result = await parser.getText(); const page = result.pages[7].text.replace(/\s+/gu, ' ').trim();
    assert.match(page, /Erstatningsgrunnlag/u);
    assert.ok(page.includes(value), 'All three source sentences must occur together on PDF page 8');
  } finally { await parser.destroy(); }
});
test('R-050-GAP-2904: exact canonical rule, primary and dependency provenance', () => {
  const f = own(); assert.equal(f.value, value); assert.equal(f.label, 'Bruksverdi – grense');
  assert.equal(f.source.filename, 'gjensidige-dog-life-use-terms.pdf'); assert.equal(f.source.termsNumber, 'Hund Liv og Bruk');
  assert.equal(f.source.company, 'Gjensidige'); assert.equal(f.source.agreementScope, 'ordinary');
  assert.equal(f.source.version, ''); assert.equal(f.source.effectiveFrom, '');
  provenance(catalogFactSources(f));
  assert.equal(f.deductibleClassification, undefined); assert.equal(f.coverageAvailability, undefined);
  assert.equal(isNonAssertingCoverageDetail(key), true);
});
test('R-050-SCOPE: only Hund Bruk; no base, Liv-only, Katt or alternate scope/version leakage', () => {
  for (const ids of [[], [liv]]) assert.equal(facts(ids).some(f => f.key === key), false);
  const addon = productCatalog.addOns.find(a => a.id === bruk); assert.ok(addon);
  assert.deepEqual(addon.insuranceTypes, ['Hund']); assert.equal(addon.providerId, 'gjensidige');
  assert.deepEqual(addon.requiresAddOnIds, [liv]); assert.deepEqual(addon.selectionEvidenceKeys, [parent]);
  assert.equal(findCatalogProduct('gjensidige', id, 'unknown', { insuranceType: 'Hund', agreementScope: 'ordinary' }), null);
  for (const scope of [{ insuranceType: 'Katt', agreementScope: 'ordinary' }, { insuranceType: 'Hund', agreementScope: 'nito' }])
    assert.equal(findCatalogProduct('gjensidige', id, null, scope), null);
  for (const p of productCatalog.products.filter(p => p !== product)) assert.equal(availableAddOns(p, date).some(a => a.id === bruk), false);
  for (const [component, rows] of Object.entries(productCatalog.facts)) {
    const matches = rows.filter(f => f.key === key && f.source.documentId === 'boat-pet:gjensidige:hund:life-use');
    assert.equal(matches.length, component === bruk ? 1 : 0, component);
  }
});
for (const [name, terms, expected, expectedLife, selected] of [
  ['silence', [], 'unknown', 'unknown', false],
  ['rule alone', [term(key, value)], 'unknown', 'unknown', false],
  ['Liv plus rule', [term(life, 'Valgt'), term(key, value)], 'unknown', 'selected', false],
  ['explicit Bruk without Liv', [term(parent, 'Valgt')], 'selected', 'unknown', false],
  ['explicit Liv and Bruk', [term(life, 'Valgt'), term(parent, 'Valgt')], 'selected', 'selected', true],
  ['Bruk refused', [term(life, 'Valgt'), term(parent, 'Ikke valgt'), term(key, value)], 'not_selected', 'selected', false],
  ['Bruk conflict', [term(life, 'Valgt'), term(parent, 'Valgt'), term(parent, 'Ikke valgt'), term(key, value)], 'unknown', 'selected', false],
]) test(`R-050-SELECTION: ${name}`, () => {
  const out = enrich(terms); assert.equal(coverage(out).status, expected); assert.equal(coverage(out, life).status, expectedLife);
  assert.equal(out.addOnIds.includes(bruk), selected);
  assert.equal(coverage(out).conflict, name === 'Bruk conflict');
  if (selected) provenance(out.importantTerms.find(t => t.key === key).sources);
  if (terms.some(t => t.canonicalKey === key)) assert.equal(coverage(out).details.find(d => d.key === key).value, value);
});
test('R-050-DOCUMENT: explicit customer limit overrides real catalog with source intact', () => {
  const out = enrich([term(life, 'Valgt'), term(parent, 'Valgt'), term(key, '17 000 kr')]);
  const f = out.importantTerms.find(t => t.key === key); assert.equal(f.value, '17 000 kr'); assert.equal(f.coverageOrigin, 'document');
  assert.deepEqual(f.source, { documentId: 'synthetic-customer', filename: 'synthetic-customer.pdf', company: 'Gjensidige', page: 1 });
  const detail = coverage(out).details.find(d => d.key === key); assert.ok(detail);
  assert.equal(detail.value, '17 000 kr');
  assert.deepEqual(detail.sources, [f.source]);
});
const record = (terms, role = 'individual_agreement') => ({ ...car(), type: 'Hund', productName: 'Behandling',
  canonicalProductName: 'Behandling', agreementScope: 'ordinary', objectIdentifiers: [], documentRole: role, addOns: [],
  importantTerms: terms.map(t => rawTerm(t.name, t.value, t.canonicalKey)) });
for (const side of ['existing', 'offer']) test(`R-050-PIPELINE: ${side} customer X beats general Y; general Y never selects`, () => {
  const customer = [term(life, 'Valgt'), term(parent, 'Valgt'), term(key, '17 000 kr')];
  const out = documentPipeline([[record(customer)], [record([term(key, value)], 'general_terms')]], side).insuranceData.insurances[0];
  assert.equal(coverage(out).status, 'selected'); assert.equal(out.importantTerms.find(t => t.key === key).value, '17 000 kr');
  assert.ok(out.recordEvidence.some(r => r.documentRole === 'general_terms' && r.importantTerms.some(t => t.key === key && t.value === value)));
  const silent = documentPipeline([[record([term(life, 'Valgt')], 'unknown')], [record([term(key, value)], 'general_terms')]], side).insuranceData.insurances[0];
  assert.equal(coverage(silent).status, 'unknown'); assert.equal(silent.addOnIds.includes(bruk), false);
});
test('R-050-PRODUCT: optional term, same product, both directions and serialization provenance', () => {
  const f = materializeCatalogProduct(product).facts.find(f => f.key === key); assert.equal(f.state, 'optional'); assert.equal(f.role, 'term');
  assert.equal(f.value, value); assert.deepEqual(f.addOnNames, ['Bruk']); provenance(f.sources);
  assert.equal(compareCatalogProducts(product, product).differenceCount, 0);
  const other = productCatalog.products.find(p => p.productId === 'frende-hund-veterin-r'); assert.ok(other);
  const forward = compareCatalogProducts(product, other).sections.flatMap(s => s.rows);
  const reverse = compareCatalogProducts(other, product).sections.flatMap(s => s.rows);
  for (const row of forward) { const swapped = reverse.find(r => r.key === row.key); assert.ok(swapped);
    assert.deepEqual(row.first, swapped.second); assert.deepEqual(row.second, swapped.first); }
  const serialized = JSON.parse(JSON.stringify(forward.find(r => r.key === key).first));
  provenance(serialized.facts.flatMap(f => f.sources));
});
test('R-050-MANUAL: selected package has exact full rule/provenance, Liv alone does not', () => {
  const manual = ids => normalizeManualAgreement({ company: 'Gjensidige', products: [{ type: 'Hund', productName: 'Behandling',
    importantTerms: [], addOnIds: ids }] }).insuranceData.insurances[0];
  const out = manual([liv, bruk]); assert.equal(coverage(out).status, 'selected');
  const f = out.importantTerms.find(t => t.key === key); assert.equal(f.value, value); provenance(f.sources);
  assert.equal(coverage(manual([liv])).status, 'unknown');
});
test('R-050-PC-1056–1058: allergy, separate offspring and administrative facts preserved', () => {
  assert.equal(facts([]).find(f => f.key === 'dyr.allergi.grense').value, 'Inntil 5 000 kr');
  const html = readFileSync(new URL('../catalog/sources/boat-pet/gjensidige-dog-product.html', import.meta.url), 'utf8');
  assert.match(html, /Kull/iu);
  assert.equal(facts().some(f => /kull|klage|administrativ/iu.test(f.key)), false);
});
