import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, findCatalogProductBySelection } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';

// Cloud gate implementing B-023.test_plan/post_fix_audit from the immutable
// remediation triage. No old Mac /tmp harness is required.
// P1 c4083286b86c6a98 / fa5c6d8e90dc0961; RC-093;
// GAP-0131/SF-0243, GAP-5351/SF-7623, GAP-5370/SF-7650.
const date = new Date('2026-09-29T10:52:14.812Z');
const ids = ['fremtind-mc-delkasko', 'fremtind-mc-kasko'];
const keys = ['nyverdi.dekning', 'nyverdi.alder', 'nyverdi.km', 'nyverdi.skadegrad', 'nyverdi.begrensning'];
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = id => resolveCatalogFacts(product(id), [], date);
const fact = (id, key) => { const f = facts(id).find(f => f.key === key); assert.ok(f, `${id}: ${key}`); return f; };
const rows = (a, b) => compareCatalogProducts(product(a), product(b)).sections.flatMap(s => s.rows);
const enrich = (id, terms) => enrichExtractedAgreementWithCatalog({ company: 'Fremtind', totalAnnualPremium: null,
  insurances: [{ type: 'MC', productName: product(id).name, agreementScope: 'ordinary-sparebank1',
    annualPremium: null, deductible: null, coverageSummary: null, addOns: [], importantTerms: terms }] }, date).insurances[0];

test('R-023-01: own original/hash and precise Minikasko provenance, including Kasko reference', () => {
  const hash = '2698b98c7ed2b19e82ba8df52a7b14b97d94cbf98c48d55629a72d2e0a89da7e';
  const bytes = readFileSync(new URL('../catalog/sources/mc-bobil/fremtind-mc-terms.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  for (const id of ids) for (const key of keys) {
    const f = fact(id, key), source = productCatalog.sources[f.source.documentId];
    assert.equal(source.sha256, hash);
    assert.equal(source.providerId, 'fremtind');
    assert.equal(source.insuranceType, 'MC');
    assert.equal(source.agreementScope, 'ordinary-sparebank1');
    assert.equal(f.source.page, 6);
    assert.equal(f.source.termsNumber, 'PMO-357.110-013');
    assert.equal(f.source.effectiveFrom, '2023-07-10');
    assert.match(f.source.section, /3\.3\.1.*Kasko 2/u);
    assert.equal(product(id).version, null);
  }
});

test('R-023-02: source-led three months/2000 km and strict greater-than-80% conditions', () => {
  for (const id of ids) {
    assert.match(fact(id, keys[0]).value, /motorsykkel eller moped/u);
    assert.match(fact(id, keys[0]).value, /modell, type og årsmodell.*fabrikkmontert/u);
    assert.match(fact(id, keys[1]).value, /innen 3 måneder.*fabrikkny.*eier/u);
    assert.equal(fact(id, keys[2]).value, 'Kjøretøyet må ikke ha vært kjørt over 2 000 kilometer');
    assert.match(fact(id, keys[3]).value, /overstige 80 %.*skadedagen.*listepris.*uten rabatter eller spesialpris/u);
    assert.match(fact(id, keys[4]).value, /tidligere.*overstiger 10 %.*fabrikkny på eier/u);
  }
});

test('R-023-03: Minikasko/Kasko share the source rule; Ansvar and other product scopes do not inherit it', () => {
  for (const key of keys) assert.deepEqual(fact(ids[0], key), fact(ids[1], key));
  assert.ok(facts('fremtind-mc-ansvar').every(f => !f.key.startsWith('nyverdi.')));
  assert.ok(facts('frende-mc-kasko').every(f => !f.key.startsWith('nyverdi.')));
  for (const scope of ['ordinary-dnb', 'lofavor', 'nito'])
    assert.equal(findCatalogProductBySelection('Fremtind', 'MC', 'Kasko', scope), null);
  assert.match(fact('fremtind-bobil-kasko', keys[1]).value, /1 år/u);
  assert.match(fact('fremtind-bobil-kasko', keys[2]).value, /15 000/u);
});

test('R-023-04: linked FU-06/FU-24/FU-25 controls, same product and side swap', () => {
  const registry = readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv', import.meta.url), 'utf8');
  for (const control of ['FU-06', 'FU-24', 'FU-25']) assert.ok(registry.includes(control));
  for (const id of ids) for (const peer of [...ids, 'fremtind-mc-ansvar', 'frende-mc-kasko']) {
    const forward = rows(id, peer), reverse = rows(peer, id);
    for (const key of keys) {
      const a = forward.find(r => r.key === key), b = reverse.find(r => r.key === key);
      assert.ok(a); assert.ok(b);
      assert.equal(a.first.state, 'included');
      assert.deepEqual(a.first, b.second); assert.deepEqual(a.second, b.first);
      if (peer === id) assert.equal(a.different, false);
      if (peer === 'fremtind-mc-ansvar' || peer === 'frende-mc-kasko') assert.equal(a.second.state, 'unknown');
    }
  }
});

test('R-023-05: document limit wins and annual/accumulated mileage stays separate', () => {
  for (const id of ids) {
    const out = enrich(id, [
      { name: 'Totalskadegaranti kilometergrense', canonicalKey: 'nyverdi.km', value: '1 234 km' },
      { name: 'Årlig kjørelengde', canonicalKey: 'kjoretoy.kjorelengde', value: '12 000 km per år' },
      { name: 'Kilometerstand', canonicalKey: 'kjoretoy.kilometerstand', value: '1 500 km' },
    ]);
    const get = key => out.importantTerms.find(t => t.key === key);
    assert.equal(get('nyverdi.km').value, '1 234 km');
    assert.equal(get('nyverdi.km').coverageOrigin, 'document');
    assert.match(get('kjoretoy.kjorelengde').value, /12 000/u);
    assert.match(get('kjoretoy.kilometerstand').value, /1 500/u);
    assert.equal(out.addOnIds.length, 0);
    assert.equal(normalizeTermName(fact(id, 'nyverdi.km').label, { insuranceType: 'MC' }), 'nyverdi.km');
  }
});

test('R-023-06: explicit document rejection retains priority over included catalog cover', () => {
  for (const id of ids) {
    const out = enrich(id, [{ name: 'Totalskadegaranti', canonicalKey: 'nyverdi.dekning', value: 'Ikke valgt' }]);
    const term = out.importantTerms.find(t => t.key === 'nyverdi.dekning');
    assert.ok(term); assert.equal(term.value, 'Ikke valgt'); assert.equal(term.coverageOrigin, 'document');
    assert.equal(out.addOnIds.length, 0);
  }
});

test('R-023-07: manual enrichment retains source-backed base rule without pricing or inferred choices', () => {
  for (const id of ids) {
    const out = normalizeManualAgreement({ company: 'Fremtind', totalAnnualPremium: '',
      products: [{ type: 'MC', productName: product(id).name, agreementScope: 'ordinary-sparebank1',
        annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [], addOnIds: [] }] });
    const insurance = out.insuranceData.insurances[0];
    assert.equal(insurance.annualPremium, null); assert.equal(insurance.addOnIds.length, 0);
    for (const key of keys) assert.ok(insurance.importantTerms.some(t => t.key === key));
    assert.ok(facts(id).every(f => !/^(?:premie|kjoretoy)\./u.test(f.key)));
  }
});

test('R-023-08: held-out positive controls retain equipment, baggage, assistance and Kasko rental', () => {
  for (const id of ids) {
    assert.equal(fact(id, 'utstyr.grense').value, 'Inntil 10 000 kr');
    assert.equal(fact(id, 'mc.bagasje.grense').value, 'Inntil 5 000 kr samlet');
    assert.match(fact(id, 'mc.bagasje.begrensning').value, /smykker/u);
    assert.equal(fact(id, 'veihjelp.egenandel').value, '500 kr');
  }
  assert.equal(fact(ids[1], 'leiebil.dagsgrense').value, '350 kr per dag');
  assert.equal(facts(ids[0]).some(f => f.key.startsWith('leiebil.')), false);
});
