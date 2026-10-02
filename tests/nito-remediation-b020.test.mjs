import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';

// Cloud gate for eb5ab1901f70dfbd / fd13be8474440377,
// GAP-2134/SF-3064, GAP-2147/SF-3082, RC-110, CR-230/CR-231.
const base = 'gjensidige-hus', plus = 'gjensidige-hus-pluss', addon = 'gjensidige-hus-rate-insekter';
const date = new Date('2026-09-29T10:52:14.812Z');
const animals = ['hus.skadedyr.dyr.bekjempelse', 'hus.skadedyr.dyr.bygningsskade'];
const insects = ['hus.skadedyr.insekter.bekjempelse', 'hus.skadedyr.insekter.bygningsskade', 'hus.skadedyr.insekter.egenandel'];
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = (id, addons = []) => resolveCatalogFacts(product(id), addons, date);
const fact = (id, key, addons = []) => { const f = facts(id, addons).find(f => f.key === key); assert.ok(f, key); return f; };
const rows = (a, b) => compareCatalogProducts(product(a), product(b)).sections.flatMap(s => s.rows);
const manual = (id, addons = [], terms = []) => normalizeManualAgreement({ company: 'Gjensidige', totalAnnualPremium: '',
  products: [{ type: 'Hus', productName: product(id).name, annualPremium: '', deductible: '', coverageSummary: '', importantTerms: terms, addOnIds: addons }] });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null,
  insurances: [{ type: 'Hus', productName: product(plus).name, annualPremium: null, deductible: null, coverageSummary: null, addOns: [], importantTerms: terms }] }, date);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('R-020-01: all frozen hashes and fact/qualification provenance', () => {
  for (const [filename, hash] of [
    ['Hus-Standard-alminnelige-vilkar.pdf', 'd237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],
    ['Hus-Pluss-alminnelige-vilkar.pdf', '79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792'],
    ['IPID-Husforsikring-EAP01.pdf', '5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9'],
  ]) assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/gjensidige/hus/' + filename, import.meta.url))).digest('hex'), hash);
  for (const key of animals) { assert.equal(fact(base, key).source.documentId, 'gjensidigeHusStandard'); assert.equal(fact(base, key).source.page, 3); }
  for (const key of insects) {
    const f = fact(base, key, [addon]);
    assert.equal(f.source.documentId, 'gjensidigeHusPluss');
    assert.equal(f.source.page, key.endsWith('egenandel') ? 1 : 6);
    assert.equal(f.qualificationSource.documentId, 'gjensidigeHusIpid'); assert.equal(f.qualificationSource.page, 2);
  }
});
test('R-020-02: exact provider/type/scope/version boundaries', () => {
  for (const id of [base, plus]) {
    const p = product(id);
    assert.equal(findCatalogProduct('gjensidige', id, p.version, { agreementScope: 'ordinary', insuranceType: 'Hus' }), p);
    for (const scope of [{ agreementScope: 'nito' }, { insuranceType: 'Innbo' }]) assert.equal(findCatalogProduct('gjensidige', id, p.version, scope), null);
    assert.equal(findCatalogProduct('gjensidige', id, 'unknown'), null);
  }
  for (const p of productCatalog.products.filter(p => ![base, plus].includes(p.productId))) {
    assert.equal(resolveCatalogFacts(p, [], date).some(f => [...animals, ...insects].includes(f.key)), false, p.productId);
  }
});
test('R-020-03: same products have no false difference', () => {
  for (const id of [base, plus]) assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
});
test('R-020-04: every affected row preserves source and state on side swap', () => {
  for (const [a, b] of [[base, plus], [plus, base]]) for (const f of rows(a, b)) {
    const r = rows(b, a).find(r => r.key === f.key); assert.ok(r);
    assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
  }
});
test('R-020-05: precise document wins; broad facts conservatively block only matching children', () => {
  const guards = [
    ['hus.skadedyr.bekjempelse', [animals[0], insects[0]]],
    ['hus.skadedyr.bygningsskade', [animals[1], insects[1]]],
    ['hus.skadedyr.egenandel', [insects[2]]],
  ];
  for (const key of [...animals, ...insects]) for (const value of ['Dokumentert særvilkår 8 000 kr', 'Dokumentert særvilkår 13 000 kr', 'Ikke omfattet']) {
    const r = enrich([{ name: fact(plus, key).label, value }]);
    const t = r.insurances[0].importantTerms.find(t => t.key === key);
    assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
  }
  for (const [broad, blocked] of guards) {
    let r = enrich([{ name: 'Dokumentert skadedyrregel', canonicalKey: broad, value: 'Dokumentert kundevilkår 9 000 kr' }]);
    for (let pass = 0; pass < 2; pass++) {
      for (const key of blocked) assert.equal(r.insurances[0].importantTerms.some(t => t.key === key), false);
      assert.equal(r.insurances[0].importantTerms.find(t => t.key === broad).value, 'Dokumentert kundevilkår 9 000 kr');
      r = enrichExtractedAgreementWithCatalog(r, date);
    }
    const both = enrich([{ name: 'Dokumentert skadedyrregel', canonicalKey: broad, value: 'Dokumentert kundevilkår' },
      { name: fact(plus, blocked[0]).label, canonicalKey: blocked[0], value: 'Dokumentert 14 000 kr' }]);
    assert.equal(both.insurances[0].importantTerms.find(t => t.key === blocked[0]).value, 'Dokumentert 14 000 kr');
    for (const value of ['Ukjent', 'Ikke dokumentert']) {
      const terms = enrich([{ name: 'Skadedyrregel', canonicalKey: broad, value }]).insurances[0].importantTerms;
      for (const key of blocked) assert.equal(terms.find(t => t.key === key).coverageOrigin, 'catalog');
    }
  }
});
test('R-020-06: 53 archived positive controls and all unrelated facts remain unchanged', () => {
  const registry = readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv', import.meta.url), 'utf8');
  for (let pc = 821; pc <= 873; pc++) assert.ok(registry.includes(`PC-${String(pc).padStart(4, '0')}`));
  // Fingerprints captured before B-020 from 00483c9, excluding only the
  // deliberately split pest identities and narrowed rot coverage.
  for (const [id, addons, expected] of [
    [base, [], '3d260a791bf81f3b90ed82f2dbb5bdeaeb4566dd924b95ca5e1a93501034ff0e'],
    [base, [addon], '1da2d35abf53b63e88a6455d96dfe2e0c9b715a9757059ccad934e5089f329c6'],
    [plus, [], '1d2485559ec23fea417d600ce1b21b344a00ab301230b154da2fb9c27829873b'],
  ]) assert.equal(digest(facts(id, addons).filter(f => !f.key.startsWith('hus.skadedyr.') && f.key !== 'hus.rate.dekning')), expected);
  assert.match(fact(base, 'hus.rate.dekning').value, /unntatt/u);
  assert.match(fact(base, 'hus.skadedyr.grunnunntak').value, /Insekter|insekter/u);
  assert.match(fact(plus, 'hus.rate.dekning').value, /fullverdiforsikret.*råtesopper/u);
  assert.doesNotMatch(fact(plus, 'hus.rate.dekning').value, /insekter/u);
});
test('R-020-07: animals survive Standard, selected extension and Plus inheritance', () => {
  for (const [id, addons] of [[base, []], [base, [addon]], [plus, []]]) {
    for (const key of animals) assert.deepEqual(fact(id, key, addons), fact(base, key));
    assert.match(fact(id, animals[1], addons).value, /fysisk skade.*svekket isolasjonsevne og lukt/u);
    assert.doesNotMatch(fact(id, animals[0], addons).value, /fire bein/u);
  }
});
test('R-020-08: optional insect availability never selects customer cover or removes animals', () => {
  const r = rows(base, plus);
  for (const key of insects) { const row = r.find(r => r.key === key); assert.ok(row); assert.equal(row.first.state, 'optional'); assert.equal(row.second.state, 'included'); }
  for (const addons of [[], [addon]]) {
    const terms = manual(base, addons).insuranceData.insurances[0].importantTerms;
    for (const key of animals) assert.ok(terms.some(t => t.key === key));
    assert.equal(terms.some(t => t.key === insects[0]), addons.length > 0);
  }
  const terms = enrich([{ name: fact(plus, insects[0]).label, value: 'Ikke valgt' }]).insurances[0].importantTerms;
  assert.equal(terms.find(t => t.key === insects[0]).value, 'Ikke valgt');
  for (const key of animals) assert.ok(terms.some(t => t.key === key));
});
test('R-020-09: full value and action-specific deductibles stay qualified', () => {
  for (const key of insects.slice(0, 2)) assert.match(fact(plus, key).value, /fullverdiforsikret/u);
  assert.match(fact(plus, insects[2]).value, /2 000/u);
  assert.match(fact(plus, 'hus.rate.egenandel').value, /6 000.*bygningsskade/u);
  assert.match(fact(plus, 'hus.rate.egenandel').label, /Råte og skadeinsekter/u);
  assert.match(fact(plus, insects[1]).value, /Materialnedbrytning.*treødeleggende/u);
});
test('R-020-10: broad counterparts stay unknown instead of being guessed', () => {
  const peers = productCatalog.products.filter(p => p.insuranceType === 'Hus' && p.providerId !== 'gjensidige');
  for (const p of peers) for (const key of [...animals, ...insects]) {
    const f = rows(plus, p.productId).find(r => r.key === key), r = rows(p.productId, plus).find(r => r.key === key);
    assert.ok(f); assert.equal(f.second.state, 'unknown'); assert.deepEqual(f.first, r.second);
  }
});
test('R-020-11: only explicit Hus aliases choose children; broad text never does', () => {
  for (const key of [...animals, ...insects]) {
    const name = fact(plus, key).label;
    assert.equal(normalizeTermName(name, { insuranceType: 'Hus' }), key);
    for (const insuranceType of ['Innbo', 'Bobil']) assert.notEqual(normalizeTermName(name, { insuranceType }), key);
  }
  assert.notEqual(normalizeTermName('Bekjempelse av skadedyr', { insuranceType: 'Hus' }), animals[0]);
  assert.notEqual(normalizeTermName('Bekjempelse av skadedyr', { insuranceType: 'Hus' }), insects[0]);
});
