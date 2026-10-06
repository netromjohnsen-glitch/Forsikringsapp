import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { catalogFactSources, enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage, deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { car, term as rawTerm } from './helpers/pilot-quality.mjs';

// B-050 bounded contracts: GAP-2904/SF-4056 plus validation-only
// 1f56c194d413f97d/GAP-2901/SF-4053 and 8e9d297cb0d1bd0e/GAP-2902/SF-4054.
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

// Existing B-022 Bruk contracts, independently bound to the frozen source.
const brukRestriction = 'hund.bruksverdi.begrensning';
const ownBruk = k => {
  const rows = productCatalog.facts[bruk].filter(f => f.key === k);
  assert.equal(rows.length, 1);
  assert.deepEqual(facts().filter(f => f.key === k), rows);
  return rows[0];
};
const avlClauses = [
  /Avlshund: fysisk mistet avlsevnen 100 %/u,
  /hannhund far til minst 1 kull siste 2 år/u,
  /tispe født minst 1 kull på normal måte siste 2 år før sykdom\/skade/u,
];
const workingClauses = [
  /Jakthund, gjeterhund og tjenestehund: trent for og regelmessig brukt til formålet/u,
  /bruksegenskapen nedsatt minst 50 %/u,
  /Hunden må være utredet, adekvat behandlet og ha gjennomgått tilstrekkelig lang rekonvalesens/u,
];
const assertBrukPage2 = f => {
  assert.equal(f.source.documentId, 'boat-pet:gjensidige:hund:life-use');
  assert.equal(f.source.filename, 'gjensidige-dog-life-use-terms.pdf');
  assert.equal(f.source.termsNumber, 'Hund Liv og Bruk');
  assert.equal(f.source.company, 'Gjensidige');
  assert.equal(f.source.agreementScope, 'ordinary');
  assert.equal(f.source.version, ''); assert.equal(f.source.effectiveFrom, '');
  assert.equal(f.source.page, 2);
  assert.equal(f.source.section, f.key === parent ? 'Hvilke skader/hendelser – tap av bruksverdi' : 'Forutsetninger – tap av bruksverdi');
  const refs = catalogFactSources(f);
  assert.equal(refs.length, 2);
  assert.ok(refs.some(s => s.documentId === f.source.documentId && s.page === 2 && s.section === f.source.section));
  assert.ok(refs.some(s => s.documentId === 'boat-pet:gjensidige:hund:product' && s.page === 1 && s.section === 'Bruk – tillegg til Liv'));
};
test('R-050-SF-4053/SF-4054: frozen PDF2/printed6 complete Tap av bruksverdi clauses', async () => {
  PDFParse.setWorker(getPath());
  const parser = new PDFParse({ data: readFileSync(new URL('../catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf', import.meta.url)) });
  try {
    const page = (await parser.getText()).pages[1].text.replace(/\s+/gu, ' ').trim();
    assert.match(page, /Livsvarig tap av bruksverdi innenfor forsikret bruksområde som følge av sykdom eller ulykke/u);
    assert.match(page, /Bruksegenskapen som er tapt må være dokumentert av veterinær/u);
    assert.match(page, /Avlshund må ha fysisk mistet avlsevnen 100%/u);
    assert.match(page, /Hannhund må være far til minst 1 kull siste 2 år, og tispe må ha født minst 1 kull på normal måte siste 2 år, før sykdommen\/skaden oppsto/u);
    assert.match(page, /Jakthund, gjeterhund og tjenestehund må være trent for og regelmessig brukt til formålet, og bruksegenskapen være nedsatt minst 50%/u);
    assert.match(page, /Hunden må være utredet, adekvat behandlet og gjennomgått tilstrekkelig lang rekonvalesens/u);
  } finally { await parser.destroy(); }
});
for (const [signature, binding, clauses] of [
  ['1f56c194d413f97d', 'GAP-2901/SF-4053', avlClauses],
  ['8e9d297cb0d1bd0e', 'GAP-2902/SF-4054', workingClauses],
]) test(`R-050-${signature}: ${binding} complete effective and optional-product contract`, () => {
  const main = ownBruk(parent), restriction = ownBruk(brukRestriction);
  assert.equal(main.value, 'Valgfritt tillegg til valgt Liv: livsvarig tap av bruksverdi innenfor forsikret bruksområde som følge av sykdom eller ulykke');
  assert.match(restriction.value, /Bruksegenskapen må være dokumentert tapt av veterinær/u);
  for (const clause of clauses) assert.match(restriction.value, clause);
  assertBrukPage2(main); assertBrukPage2(restriction);
  assert.equal(isNonAssertingCoverageDetail(brukRestriction), true);
  for (const ids of [[], [liv]]) assert.equal(facts(ids).some(f => f.key === parent || f.key === brukRestriction), false);
  const materialized = materializeCatalogProduct(product);
  for (const f of [main, restriction]) {
    const row = materialized.facts.filter(r => r.key === f.key && r.value === f.value);
    assert.equal(row.length, 1); assert.equal(row[0].state, 'optional');
    assert.deepEqual(row[0].addOnNames, ['Bruk']);
    const expectedSources = catalogFactSources(f).map(source => {
      const sourceType = productCatalog.sources[source.documentId].sourceType;
      assert.equal(sourceType, source.documentId === 'boat-pet:gjensidige:hund:life-use' ? 'full_terms' : 'product_page');
      return { ...source, sourceType };
    });
    assert.deepEqual(row[0].sources, expectedSources);
  }
});
test('R-050-BRUK-QUALIFICATIONS: restriction alone cannot select Bruk or Liv; explicit states remain authoritative', () => {
  const restriction = { ...term(brukRestriction, ownBruk(brukRestriction).value), name: 'Bruksverdi – begrensninger' };
  for (const [choice, expected, conflict] of [
    [[], 'unknown', false],
    [[term(parent, 'Valgt')], 'selected', false],
    [[term(parent, 'Ikke valgt')], 'not_selected', false],
    [[term(parent, 'Valgt'), term(parent, 'Ikke valgt')], 'unknown', true],
  ]) {
    const out = enrich([term(life, 'Valgt'), ...choice, restriction]);
    assert.equal(coverage(out).status, expected); assert.equal(coverage(out).conflict, conflict);
    assert.equal(coverage(out, life).status, 'selected');
    assert.equal(out.addOnIds.includes(bruk), expected === 'selected');
    assert.equal(coverage(out).details.find(d => d.key === brukRestriction).value, restriction.value);
  }
  const alone = enrich([restriction]);
  assert.equal(coverage(alone).status, 'unknown'); assert.equal(coverage(alone, life).status, 'unknown');
  assert.equal(alone.addOnIds.includes(bruk), false);
});
test('R-050-BRUK-DOCUMENT: explicit customer restriction wins with exact provenance', () => {
  const document = { ...term(brukRestriction, 'Kundens dokumenterte særvilkår for Bruk'), name: 'Bruksverdi – begrensninger' };
  const out = enrich([term(life, 'Valgt'), term(parent, 'Valgt'), document]);
  const detail = coverage(out).details.find(d => d.key === brukRestriction);
  assert.equal(detail.value, document.value); assert.deepEqual(detail.sources, [document.source]);
  assert.equal(coverage(out).status, 'selected');
  assert.equal(out.importantTerms.filter(t => t.key === brukRestriction).length, 1);
});

// 3f4b9eff50404590 / GAP-2869 / SF-4018: available choices, never customer selection.
const sumKey = 'dyr.veterinar.sum.valgbar';
const sumChoices = 'Valg mellom 20 000, 30 000, 40 000 eller 50 000 kr. Valgt forsikringssum fremgår av forsikringsbeviset.';
const sumFact = () => {
  const rows = facts([]).filter(f => f.key === sumKey);
  assert.equal(rows.length, 1);
  return rows[0];
};
const sumTerm = v => ({ ...term(sumKey, v), name: 'Veterinærbehandling – valgbar forsikringssum' });
test('R-050-3f4b9eff50404590: SF-4018 frozen Behandling sum choices and exact provenance', () => {
  const html = readFileSync(new URL('../catalog/sources/boat-pet/gjensidige-dog-product.html', import.meta.url), 'utf8')
    .replace(/&amp;nbsp;|&nbsp;|\u00a0/gu, ' ').replace(/\s+/gu, ' ');
  assert.ok(html.includes('Du kan velge å få erstattet veterinærutgifter opptil 20 000, 30 000, 40 000 eller 50 000 kroner.'));
  const f = sumFact(); assert.equal(f.value, sumChoices);
  assert.equal(f.label, 'Veterinærbehandling – valgbar forsikringssum');
  assert.equal(f.source.documentId, 'boat-pet:gjensidige:hund:product');
  assert.equal(f.source.filename, 'gjensidige-dog-product.html');
  assert.equal(f.source.company, 'Gjensidige'); assert.equal(f.source.agreementScope, 'ordinary');
  assert.equal(f.source.page, 1); assert.equal(f.source.section, 'Behandling – valgbar forsikringssum');
  assert.equal(f.source.termsNumber, 'Hundeforsikring – produktoversikt');
  assert.equal(f.source.version, ''); assert.equal(f.source.effectiveFrom, '');
  const source = productCatalog.sources[f.source.documentId];
  assert.equal(source.sourceType, 'product_page'); assert.equal(source.insuranceType, 'Hund');
  assert.equal(source.sha256, 'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58');
  assert.equal(f.qualificationSource.documentId, 'boat-pet:gjensidige:hund');
  assert.equal(f.qualificationSource.page, 1); assert.equal(f.qualificationSource.section, 'Veterinærbehandling');
  assert.equal(f.deductibleClassification, undefined); assert.equal(f.coverageAvailability, undefined);
});
test('R-050-SUM-PRODUCT: choices remain a term; same product and both directions retain complete sources', () => {
  const f = sumFact(), row = materializeCatalogProduct(product).facts.find(r => r.key === sumKey);
  assert.equal(row.value, sumChoices); assert.equal(row.role, 'term'); assert.equal(row.state, 'included');
  assert.deepEqual(row.addOnNames, []);
  assert.deepEqual(row.sources, catalogFactSources(f).map(source => ({ ...source, sourceType: productCatalog.sources[source.documentId].sourceType })));
  assert.deepEqual(row.sources.map(s => s.sourceType), ['product_page', 'ipid']);
  assert.equal(compareCatalogProducts(product, product).differenceCount, 0);
  const other = productCatalog.products.find(p => p.productId === 'frende-hund-veterin-r'); assert.ok(other);
  const forward = compareCatalogProducts(product, other).sections.flatMap(s => s.rows).find(r => r.key === sumKey);
  const reverse = compareCatalogProducts(other, product).sections.flatMap(s => s.rows).find(r => r.key === sumKey);
  assert.deepEqual(forward.first, reverse.second); assert.deepEqual(forward.second, reverse.first);
  assert.deepEqual(JSON.parse(JSON.stringify(forward.first.facts[0].sources)), row.sources);
});
test('R-050-SUM-CUSTOMER: silence keeps choices as catalog definition; customer sum wins', () => {
  const silent = enrich([]), definition = silent.importantTerms.find(t => t.key === sumKey);
  assert.equal(definition.value, sumChoices); assert.equal(definition.coverageOrigin, 'catalog');
  assert.deepEqual(definition.sources, catalogFactSources(sumFact()));
  assert.equal(coverage(silent, life).status, 'unknown'); assert.equal(coverage(silent).status, 'unknown');
  assert.deepEqual(silent.addOnIds, []);
  for (const v of ['20 000 kr', '27 000 kr', '40 000 kr', '50 000 kr']) {
    const input = sumTerm(v), out = enrich([input]);
    const actual = out.importantTerms.find(t => t.key === sumKey);
    assert.equal(actual.value, v); assert.equal(actual.coverageOrigin, 'document');
    assert.deepEqual(actual.source, input.source);
    const detail = canonicalCoverage(out, 'Hund', 'dyr.veterinar.dekning').details.find(d => d.key === sumKey);
    assert.equal(detail.value, v); assert.deepEqual(detail.sources, [input.source]);
    assert.equal(coverage(out, life).status, 'unknown'); assert.equal(coverage(out).status, 'unknown');
    assert.deepEqual(out.addOnIds, []);
  }
});
test('R-050-SUM-SELECTION: only sum text/provenance changes; all existing selection states preserved', () => {
  const baseline = structuredClone(productCatalog);
  const f = baseline.facts[id].find(f => f.key === sumKey);
  f.value = 'Valgt forsikringssum fremgår av forsikringsbeviset';
  f.source = { ...f.qualificationSource, note: f.source.note }; delete f.qualificationSource;
  const veterinary = v => ({ ...term('dyr.veterinar.dekning', v), name: 'Veterinærbehandling' });
  for (const terms of [[], [sumTerm('27 000 kr')], [veterinary('Valgt')], [veterinary('Ikke valgt')], [veterinary('Valgt'), veterinary('Ikke valgt')], [term(life, 'Valgt'), term(parent, 'Valgt')]]) {
    const input = { company: 'Gjensidige', totalAnnualPremium: null, insurances: [{ type: 'Hund', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: null, deductible: null, coverageSummary: null, importantTerms: terms, addOns: [] }] };
    const before = enrichExtractedAgreementWithCatalog(input, date, undefined, undefined, baseline).insurances[0];
    const after = enrich(terms);
    const states = out => deriveCanonicalCoverages(out, 'Hund').map(c => [c.id, c.status, c.conflict]);
    assert.deepEqual(states(after), states(before)); assert.deepEqual(after.addOnIds, before.addOnIds);
  }
});
test('R-050-SUM-ISOLATION: no Katt, Liv, Bruk or other product choices changed', () => {
  const katt = productCatalog.products.find(p => p.productId === 'gjensidige-katt-behandling'); assert.ok(katt);
  assert.equal(resolveCatalogFacts(katt, [], date).find(f => f.key === sumKey).value, 'Valgt forsikringssum fremgår av forsikringsbeviset');
  for (const component of [liv, bruk, 'gjensidige-katt-liv', 'gjensidige-katt-bruk'])
    assert.equal(productCatalog.facts[component].some(f => f.key === sumKey), false);
  for (const [component, rows] of Object.entries(productCatalog.facts))
    assert.equal(rows.some(f => f.key === sumKey && f.value === sumChoices), component === id, component);
  for (const scope of [{ insuranceType: 'Katt', agreementScope: 'ordinary' }, { insuranceType: 'Hund', agreementScope: 'nito' }])
    assert.equal(findCatalogProduct('gjensidige', id, null, scope), null);
});
for (const side of ['existing', 'offer']) test(`R-050-SUM-PIPELINE: ${side} individual sum beats general available choices`, () => {
  const out = documentPipeline([[record([sumTerm('27 000 kr')])], [record([sumTerm(sumChoices)], 'general_terms')]], side).insuranceData.insurances[0];
  assert.equal(out.importantTerms.find(t => t.key === sumKey).value, '27 000 kr');
  assert.ok(out.recordEvidence.some(r => r.documentRole === 'general_terms' && r.importantTerms.some(t => t.key === sumKey && t.value === sumChoices)));
  assert.equal(coverage(out, life).status, 'unknown'); assert.equal(coverage(out).status, 'unknown');
});
test('R-050-SUM-MANUAL: known catalog product preserves catalog choices, not free-text customer sum', () => {
  const manual = terms => normalizeManualAgreement({ company: 'Gjensidige', products: [{ type: 'Hund', productName: 'Behandling', importantTerms: terms, addOnIds: [] }] }).insuranceData.insurances[0];
  const silent = manual([]), explicit = manual([sumTerm('27 000 kr')]), f = sumFact();
  // Baseline known-product branch uses effective catalog facts; its secondary
  // presentation reference adds this exact qualification note, without sourceType.
  const expectedSources = [
    { ...f.source, note: f.source.note || undefined },
    { ...f.qualificationSource, note: [f.qualificationSource.note, 'Supplerende kilde for faktumets anvendelse'].filter(Boolean).join(' · ') },
  ];
  for (const out of [silent, explicit]) {
    const rows = out.importantTerms.filter(t => t.key === sumKey); assert.equal(rows.length, 1);
    const t = rows[0]; assert.equal(t.value, sumChoices); assert.notEqual(t.value, '27 000 kr');
    assert.equal(t.name, f.label); assert.equal(t.coverageOrigin, 'catalog');
    assert.deepEqual(t.source, f.source); assert.deepEqual(t.sources, expectedSources);
    assert.deepEqual(t.sources.map(s => s.documentId), ['boat-pet:gjensidige:hund:product', 'boat-pet:gjensidige:hund']);
    assert.equal(out.catalogSelectionConfirmed, true);
    assert.equal(coverage(out, life).status, 'unknown'); assert.equal(coverage(out).status, 'unknown');
    assert.deepEqual(out.addOnIds, []);
  }
});
