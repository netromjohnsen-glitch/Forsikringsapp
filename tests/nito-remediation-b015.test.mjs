import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';

// Cloud replacement for the archived Mac-only gate.py/compare.mjs.
// B-015: b45608cad7c89e92 / GAP-4435 / SF-6305 / RC-103 / CR-254.
const id = 'tryg-innbo-ekstra', key = 'flytting.tyveri_skadeverk.grense';
const broad = 'flytting.transport.grense', date = new Date('2026-09-29T10:52:14.812Z');
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = (id, addons = []) => resolveCatalogFacts(product(id), addons, date);
const fact = (id, k, addons = []) => { const f = facts(id, addons).find(f => f.key === k); assert.ok(f, `${id}: ${k}`); return f; };
const rows = (a, b) => compareCatalogProducts(product(a), product(b)).sections.flatMap(s => s.rows);
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Tryg', totalAnnualPremium: null,
  insurances: [{ type: 'Innbo', productName: product(id).name, annualPremium: null, deductible: null,
    coverageSummary: null, addOns: [], importantTerms: terms }] }, date);

test('R-015-01: frozen own-source hash, clause and provenance', () => {
  const bytes = readFileSync(new URL('../catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '4cffa3b051f329da0fe178b20243a0920d2b5928e9995d485c35b58a48f1f810');
  const s = fact(id, key).source;
  assert.equal(s.documentId, 'trygInnboExtra'); assert.equal(s.page, 4); assert.equal(s.section, '2.4');
  assert.equal(s.company, 'Tryg'); assert.equal(s.termsNumber, 'PPK13302');
});
test('R-015-02: exact product, scope, version and type isolation', () => {
  const p = product(id); assert.equal(p.version, '2026-07-01');
  assert.equal(findCatalogProduct('tryg', id, p.version, { agreementScope: 'ordinary', insuranceType: 'Innbo' }), p);
  for (const scope of [{ agreementScope: 'nito' }, { insuranceType: 'Bil' }]) {
    assert.equal(findCatalogProduct('tryg', id, p.version, scope), null);
  }
  assert.equal(findCatalogProduct('tryg', id, 'unknown'), null);
  for (const p of productCatalog.products.filter(p => p.productId !== id)) {
    assert.equal(resolveCatalogFacts(p, [], date).some(f => f.key === key), false, p.productId);
  }
});
test('R-015-03: same exact product has no differences or unknown child', () => {
  const c = compareCatalogProducts(product(id), product(id)); assert.equal(c.differenceCount, 0);
  const r = c.sections.flatMap(s => s.rows).find(r => r.key === key);
  assert.ok(r); assert.equal(r.first.state, 'included'); assert.deepEqual(r.first, r.second);
});
test('R-015-04: both directions preserve source, state and meaning', () => {
  for (const peer of ['tryg-innbo', 'sb-innbo-super']) {
    const forward = rows(id, peer), reverse = rows(peer, id);
    for (const f of forward) {
      const r = reverse.find(r => r.key === f.key); assert.ok(r);
      assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
    }
    assert.equal(forward.find(r => r.key === key).second.state, 'unknown');
  }
});
test('R-015-05: precise document priority and conservative broad blockers', () => {
  for (const value of ['Dokumentert 12 000 kr per skadetilfelle', 'Dokumentert 45 000 kr per skadetilfelle', 'Ikke omfattet']) {
    let r = enrich([{ name: fact(id, key).label, value }]);
    for (let pass = 0; pass < 2; pass++) {
      const t = r.insurances[0].importantTerms.find(t => t.key === key);
      assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
      r = enrichExtractedAgreementWithCatalog(r, date);
    }
  }
  for (const value of ['Dokumentert samlet flyttegrense 9 000 kr', 'Ikke omfattet']) {
    const input = [{ name: 'Transportskade ved flytting – grense', canonicalKey: broad, value }];
    let r = enrich(input);
    for (let pass = 0; pass < 2; pass++) {
      const terms = r.insurances[0].importantTerms;
      assert.equal(terms.find(t => t.key === broad).value, value);
      assert.equal(terms.some(t => t.key === key), false);
      r = enrichExtractedAgreementWithCatalog(r, date);
    }
    const both = enrich([...input, { name: fact(id, key).label, canonicalKey: key, value: 'Dokumentert 14 000 kr' }]);
    assert.equal(both.insurances[0].importantTerms.find(t => t.key === key).value, 'Dokumentert 14 000 kr');
  }
  for (const value of ['Ikke dokumentert', 'Ukjent']) {
    const terms = enrich([{ name: 'Transportskade ved flytting – grense', canonicalKey: broad, value }]).insurances[0].importantTerms;
    assert.equal(terms.find(t => t.key === key).coverageOrigin, 'catalog');
  }
});
test('R-015-06: all ten archived positive controls retain their source meaning', () => {
  const controls = [
    ['PC-0091', 'innbo.forsikringssum', /forsikringsbevis|velges/iu],
    ['PC-0092', 'innbo.geografi', /Norden.*1 år/u],
    ['PC-0093', 'uhell.begrensning', /Ukjent skadeårsak.*kosmetiske.*garanti.*slitasje.*kjæledyr.*Sykkel/u],
    ['PC-1724', 'innbo.datalager.grense', /50 000/u],
    ['PC-1725', 'innbo.vaesketap.grense', /40 000.*plutselig.*rørledning/u],
    ['PC-1726', 'sykkel.tyveri.grense', /40 000 kr per gjenstand/u],
    ['PC-1727', 'sykkel.egenandel.rabatt', /2 000.*løpende.*FG/u],
    ['PC-1728', 'naturskade.egenandel', /8 000/u],
    ['PC-1729', 'utleie.husleietap.grense', /6 måneders.*én gang per leietaker/u, ['tryg-innbo-utleie']],
    ['PC-1730', 'utleie.utkastelse.grense', /20 000 kr per skadetilfelle/u, ['tryg-innbo-utleie']],
  ];
  for (const [pc, k, pattern, addons = []] of controls) assert.match(fact(id, k, addons).value, pattern, pc);
  assert.match(fact(id, 'utleie.husleietap.egenandel', ['tryg-innbo-utleie']).value, /3 måneders.*10 000/u);
  assert.match(fact(id, 'utleie.egenandel', ['tryg-innbo-utleie']).value, /6 000/u);
  assert.equal(facts(id).some(f => f.key.startsWith('utleie.')), false);
});
test('R-015-07: private theft and professional sublimit stay qualified', () => {
  const value = fact(id, key).value;
  assert.match(value, /Tyveri og skadeverk under privat flytting er omfattet/u);
  assert.match(value, /transportbyrå, idrettslag, forening.*30 000 kr per skadetilfelle/u);
  assert.doesNotMatch(value, /ubegrenset|uten øvre|generell transport/u);
  assert.equal(facts(id).some(f => f.key === broad), false);
});
test('R-015-08: Storebrand B-005 transport and Tryg base stay separate', () => {
  assert.equal(facts('tryg-innbo').some(f => f.key === key), false);
  assert.match(fact('sb-innbo-super', broad).value, /Avtalt forsikringssum/u);
  const r = rows(id, 'sb-innbo-super');
  assert.equal(r.find(r => r.key === key).second.state, 'unknown');
  assert.equal(r.find(r => r.key === broad).first.state, 'unknown');
});
test('R-015-09: only exact Innbo aliases map; broad labels are not guessed', () => {
  const label = 'Tyveri og skadeverk under flytting – grense';
  assert.equal(normalizeTermName(label, { insuranceType: 'Innbo' }), key);
  for (const insuranceType of ['Bil', 'Reise']) assert.notEqual(normalizeTermName(label, { insuranceType }), key);
  for (const name of ['Skade ved flytting', 'Transportskade ved flytting', 'Tyverigrense']) {
    assert.notEqual(normalizeTermName(name, { insuranceType: 'Innbo' }), key);
  }
});
