import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { catalogAgreementScope } from '../lib/agreement-scope.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';

// B-021 / GAP-1057 / SF-1627 / P1 a20572d9ec59ed5e, RC-111.
// Frozen reise10: physical page 8 amounts, page 9 B.3.1.1–2 conditions.
const ids = ['storebrand-reise-standard', 'storebrand-reise-super'];
const arrival = 'reise.forsinkelse.fremmote_sum', departure = 'reise.forsinkelse.avgang_sum';
const frame = 'reise.forsinkelse.rute', keys = [arrival, departure];
const asOf = new Date('2026-09-29T10:52:14.812Z');
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = id => resolveCatalogFacts(product(id), [], asOf);
const fact = (id, key) => { const f = facts(id).find(f => f.key === key); assert.ok(f, `${id}: ${key}`); return f; };
const comparison = (a, b) => compareCatalogProducts(product(a), product(b));
const rows = (a, b) => comparison(a, b).sections.flatMap(s => s.rows);
const enrich = (id, importantTerms) => enrichExtractedAgreementWithCatalog({
  company: 'Storebrand', totalAnnualPremium: null, insurances: [{
    type: 'Reise', productName: product(id).name, annualPremium: null, deductible: null,
    coverageSummary: null, addOns: [], importantTerms,
  }],
});

test('R-021-01: frozen source identity and hash', () => {
  const bytes = readFileSync(new URL('../catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'd44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414');
  const s = productCatalog.sources.storebrandReiseTerms;
  assert.equal(s.termsNumber, 'reise10'); assert.equal(s.effectiveFrom, '2025-06-01');
});
test('R-021-02: precise branch provenance includes condition and amount pages', () => {
  for (const id of ids) for (const [key, clause] of [[arrival, 'B.3.1.1'], [departure, 'B.3.1.2']]) {
    const s = fact(id, key).source;
    assert.equal(s.documentId, 'storebrandReiseTerms'); assert.equal(s.company, 'Storebrand');
    assert.equal(s.filename, 'reise10-vilkar-reiseforsikring.pdf');
    assert.equal(s.termsNumber, 'reise10'); assert.equal(s.effectiveFrom, '2025-06-01');
    assert.equal(s.page, 9); assert.equal(s.section, `${clause}; sumtabell B.3 på fysisk side 8`);
  }
});
test('R-021-03: Standard amounts and triggers stay in their own branches', () => {
  const a = fact(ids[0], arrival).value, d = fact(ids[0], departure).value;
  assert.match(a, /Etter påbegynt reise.*minst 1,5 times.*forhåndsbetalt offentlig transport/u);
  assert.match(a, /overnatting inntil 3 000 kr og videretransport inntil 20 000 kr per person per hendelse/u);
  assert.doesNotMatch(a, /1 500|24 timer/u);
  assert.match(d, /ikke går til avtalt tid.*overnatting inntil 3 000 kr per person per hendelse/u);
  assert.match(d, /Ny transport inntil 1 500 kr per person per hendelse.*innen 24 timer/u);
  assert.match(d, /24-timersvilkåret gjelder bare ny transport, ikke overnatting/u);
  assert.doesNotMatch(d, /20 000|1,5 time/u);
});
test('R-021-04: Super replaces each amount and preserves each trigger', () => {
  const a = fact(ids[1], arrival), d = fact(ids[1], departure);
  assert.match(a.value, /minst 1,5 times.*overnatting og videretransport uten øvre sum/u);
  assert.match(d.value, /overnatting uten øvre sum.*Ny transport uten øvre sum.*innen 24 timer/u);
  assert.match(d.value, /24-timersvilkåret gjelder bare ny transport, ikke overnatting/u);
  assert.doesNotMatch(a.value, /24 timer/u);
  for (const f of [a, d]) { assert.equal(f.replacesBase, true); assert.doesNotMatch(f.value, /3 000|20 000|1 500/u); }
  for (const id of ids) for (const key of keys) assert.equal(facts(id).filter(f => f.key === key).length, 1);
});
test('R-021-05: shared framework preserves documentation without mixed sums', () => {
  assert.deepEqual(fact(ids[0], frame), fact(ids[1], frame));
  for (const id of ids) {
    const f = fact(id, frame);
    assert.doesNotMatch(f.value, /3 000|20 000|1 500|øvre sum/u);
    assert.match(f.value, /etter påbegynt reise.*vær.*teknisk feil/u);
    assert.match(f.value, /7 000 kr skal forhåndsgodkjennes.*originalkvitteringer.*transportør/u);
    assert.equal(f.source.page, 9); assert.equal(f.source.section, 'B.3.1');
  }
});
test('R-021-06: ordinary scope, product identity and contextual aliases stay isolated', () => {
  for (const id of ids) {
    const p = product(id); assert.equal(p.providerId, 'storebrand'); assert.equal(p.insuranceType, 'Reise');
    assert.equal(p.version, '2026-09-20-canonical'); assert.equal(catalogAgreementScope(p), 'ordinary');
    assert.equal(findCatalogProduct('storebrand', id, p.version, { agreementScope: 'ordinary', insuranceType: 'Reise' }), p);
    assert.equal(findCatalogProduct('storebrand', id, p.version, { agreementScope: 'nito', insuranceType: 'Reise' }), null);
  }
  for (const [label, key] of [['Forsinket fremmøte – sum', arrival], ['Forsinket avgang – sum', departure]]) {
    assert.equal(normalizeTermName(label, { insuranceType: 'Reise' }), key);
    assert.notEqual(normalizeTermName(label, { insuranceType: 'Innbo' }), key);
  }
  for (const p of productCatalog.products.filter(p => p.company === 'Storebrand' && p.insuranceType !== 'Reise')) {
    assert.equal(resolveCatalogFacts(p, [], asOf).some(f => keys.includes(f.key)), false);
  }
});
test('R-021-07: same product and both comparison directions preserve branch identity', () => {
  for (const id of ids) {
    assert.equal(comparison(id, id).differenceCount, 0);
    for (const peer of [ids.find(p => p !== id), 'fremtind-reise', 'tryg-reise-ekstra', 'tryg-reise-premium']) {
      for (const key of keys) {
        const f = rows(id, peer).find(r => r.key === key), r = rows(peer, id).find(r => r.key === key);
        assert.ok(f); assert.ok(r); assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
        assert.equal(f.first.state, 'included'); assert.equal(f.second.state, 'included');
      }
    }
  }
});
test('R-021-08: explicit customer facts and broad document blockers retain priority', () => {
  for (const id of ids) {
    for (const key of keys) for (const value of ['Dokumentert særvilkår: 8 000 kr', 'Dokumentert særvilkår: 13 000 kr']) {
      let r = enrich(id, [{ name: fact(id, key).label, value }]);
      for (let pass = 0; pass < 2; pass++) {
        const t = r.insurances[0].importantTerms.find(t => t.key === key);
        assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
        r = enrichExtractedAgreementWithCatalog(r);
      }
    }
    const terms = enrich(id, [{ name: 'Forsinket reise', canonicalKey: frame, value: 'Dokumentert samlet særgrense 9 000 kr' }]).insurances[0].importantTerms;
    assert.equal(terms.find(t => t.key === frame).value, 'Dokumentert samlet særgrense 9 000 kr');
    assert.equal(terms.some(t => keys.includes(t.key)), false);
    const both = enrich(id, [{ name: 'Forsinket reise', canonicalKey: frame, value: 'Dokumentert særvilkår' },
      { name: 'Forsinket fremmøte – sum', value: 'Dokumentert 13 000 kr' }]).insurances[0].importantTerms;
    assert.equal(both.find(t => t.key === arrival).value, 'Dokumentert 13 000 kr');
    assert.equal(both.some(t => t.key === departure), false);
    for (const value of ['Ikke dokumentert', 'Ukjent']) {
      const t = enrich(id, [{ name: 'Forsinket reise', canonicalKey: frame, value }]).insurances[0].importantTerms;
      for (const key of keys) assert.equal(t.find(f => f.key === key).coverageOrigin, 'catalog');
    }
  }
});
test('R-021-09: twelve positive branch controls against Fremtind and Tryg', () => {
  // Twelve reproducible controls for the supplied PC-0532–PC-0543 range:
  // Standard/Super × Fremtind/Tryg Ekstra/Tryg Premium × arrival/departure.
  let pc = 532;
  for (const id of ids) for (const peer of ['fremtind-reise', 'tryg-reise-ekstra', 'tryg-reise-premium']) for (const key of keys) {
    const row = rows(id, peer).find(r => r.key === key);
    assert.ok(row, `PC-${String(pc++).padStart(4, '0')}`);
    assert.ok(row.first.facts.some(f => f.key === key && f.value === fact(id, key).value));
    assert.ok(row.second.facts.some(f => f.key === key && f.value === fact(peer, key).value));
    const reverse = rows(peer, id).find(r => r.key === key);
    assert.deepEqual(row.first, reverse.second); assert.deepEqual(row.second, reverse.first);
  }
  assert.equal(pc, 544);
});
