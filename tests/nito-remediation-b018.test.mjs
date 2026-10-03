import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, availableAddOns, resolveCatalogFacts, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';

// B-018: 461c6c588118df04 / GAP-1284 / SF-1902 / RC-108 / CR-162.
// Depends on B-022's selectionEvidenceKeys guard, not a Bruk→Liv rule.
const date = new Date('2026-10-02T00:00:00Z');
const id = 'frende-hund-veterin-r', tap = 'frende-hund-tap', removed = 'frende-hund-bruksverdi';
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = (ids = []) => resolveCatalogFacts(product(id), ids, date);
const own = key => { const f = facts([tap]).find(f => f.key === key); assert.ok(f, key); return f; };
const term = (canonicalKey, value, name = canonicalKey) => ({ name, canonicalKey, value });
const life = value => term('dyr.liv.dekning', value, 'Liv, død og tap');
const use = value => term('hund.bruksverdi.dekning', value, 'Bruksverdi');
const enrich = (importantTerms = [], addOns = []) => {
  const input = { company: 'Frende', totalAnnualPremium: null, insurances: [{ type: 'Hund', productName: 'Veterinær',
    annualPremium: null, deductible: null, coverageSummary: null, importantTerms, addOns }] };
  const original = structuredClone(input);
  const result = enrichExtractedAgreementWithCatalog(input, date).insurances[0];
  assert.deepEqual(input, original);
  return result;
};
const manual = addOnIds => normalizeManualAgreement({ company: 'Frende', totalAnnualPremium: '', products: [{
  type: 'Hund', productName: 'Veterinær', annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [], addOnIds }] });
const hasCatalogUse = r => r.importantTerms.some(t => t.key?.startsWith('hund.bruksverdi.') && t.coverageOrigin === 'catalog');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('R-018-01: unchanged original hash and exact Tap/qualification provenance', () => {
  const source = productCatalog.sources['boat-pet:frende:hund'];
  assert.equal(source.sha256, '6d052e5092d9f92050dcf95a92fa6ce5deda18a5825cdd00ca1c8cd2658c9135');
  assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/boat-pet/frende-dog-terms.pdf', import.meta.url))).digest('hex'), source.sha256);
  for (const [key, section] of [['dekning', '7.1.3 Tap av brukshund'], ['grense', '8.4 Forsikringssum'],
    ['alder', '7.3.1 Tap av brukshund'], ['begrensning', '7.1.3, 7.3 og 8.2']]) {
    const f = own('hund.bruksverdi.' + key);
    assert.equal(f.source.documentId, source.id); assert.equal(f.source.page, 4); assert.equal(f.source.section, section);
    assert.equal(f.source.agreementScope, 'ordinary'); assert.equal(f.source.version, '2026-01-01');
  }
  assert.equal(own('hund.bruksverdi.dekning').qualificationSource.documentId, source.id);
  assert.match(own('hund.bruksverdi.dekning').qualificationSource.section, /7.3.*8.2/u);
});
test('R-018-02: exact provider/species/scope/version; only Frende Hund Tap is affected', () => {
  const p = product(id); assert.equal(p.version, '2026-01-01');
  assert.equal(findCatalogProduct('frende', id, p.version, { insuranceType: 'Hund', agreementScope: 'ordinary' }), p);
  for (const scope of [{ insuranceType: 'Katt' }, { agreementScope: 'nito' }])
    assert.equal(findCatalogProduct('frende', id, p.version, scope), null);
  assert.equal(findCatalogProduct('frende', id, 'unknown'), null);
  assert.equal(findCatalogProduct('gjensidige', id, p.version), null);
  for (const other of productCatalog.products.filter(other => other !== p))
    assert.equal(availableAddOns(other, date).some(a => a.id === tap), false);
  assert.equal(productCatalog.addOns.some(a => a.id === removed), false);
  assert.equal(productCatalog.facts[removed], undefined);
});
test('R-018-03: same-product optional Tap package has known use facts and no artificial difference', () => {
  const c = compareCatalogProducts(product(id), product(id)); assert.equal(c.differenceCount, 0);
  for (const key of ['dekning', 'grense', 'alder', 'begrensning']) {
    const r = c.sections.flatMap(s => s.rows).find(r => r.key === 'hund.bruksverdi.' + key); assert.ok(r);
    assert.equal(r.first.state, 'optional'); assert.deepEqual(r.first, r.second);
  }
  const packageFacts = materializeCatalogProduct(product(id)).facts.filter(f => f.key.startsWith('hund.bruksverdi.'));
  for (const f of packageFacts) assert.deepEqual(f.addOnNames, ['Tap']);
});
test('R-018-04: comparison side swap preserves values, optionality and sources', () => {
  for (const peer of ['gjensidige-hund-behandling', 'sparebank1-fremtind-hund-veterin-r']) {
    const forward = compareCatalogProducts(product(id), product(peer)).sections.flatMap(s => s.rows);
    const reverse = compareCatalogProducts(product(peer), product(id)).sections.flatMap(s => s.rows);
    for (const r of forward) { const swapped = reverse.find(s => s.key === r.key); assert.ok(swapped); assert.deepEqual(r.first, swapped.second); assert.deepEqual(r.second, swapped.first); }
  }
});
test('R-018-05: two document overrides retain document origin; unknown and rejection never select Tap', () => {
  for (const key of ['hund.bruksverdi.grense', 'hund.bruksverdi.alder']) for (const value of ['Dokumentert kundevilkår 6 000 kr', 'Dokumentert kundevilkår 17 000 kr']) {
    let r = enrich([life('Valgt'), term(key, value, own(key).label)]);
    for (let pass = 0; pass < 2; pass++) {
      const t = r.importantTerms.find(t => t.key === key); assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
      r = enrichExtractedAgreementWithCatalog({ company: 'Frende', totalAnnualPremium: null, insurances: [r] }, date).insurances[0];
    }
  }
  for (const value of ['Ukjent', 'Ikke dokumentert', 'Ikke valgt']) {
    const r = enrich([life(value)]); assert.equal(r.addOnIds.includes(tap), false); assert.equal(hasCatalogUse(r), false);
  }
});
test('R-018-06: PC-0571–0574 preserve base, Tap expiry, deductibles and customer-specific sums', () => {
  const registry = readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv', import.meta.url), 'utf8');
  for (let pc = 571; pc <= 574; pc++) assert.ok(registry.includes(`PC-0${pc},AUDITED_POSITIVE,frende`));
  // Updated for source-verified B-038 text/provenance; B-018 semantics are asserted below.
  assert.equal(digest(facts()), '27c5b42872a732bf40c3882f2221bd1c4ded9ab4f5ecd7e9b3c7b6610008ad8f');
  assert.equal(digest(facts([tap]).filter(f => !f.key.startsWith('hund.bruksverdi.'))), '236e42c804a8c19497f6468ce0d23072f555d0a79adf84a4fab315c52a0ec510');
  assert.match(own('dyr.veterinar.sum.valgbar').value, /faktisk sum står i forsikringsbeviset/u);
  assert.match(own('dyr.veterinar.egenandel.fast').value, /Minst 1 000 kr/u);
  assert.equal(own('dyr.veterinar.egenandel.prosent').value, '25 % av skaden');
  assert.equal(own('dyr.liv.opphor').value, 'Første hovedforfall etter 10 år');
  assert.equal(facts([tap]).some(f => /skademelding|obduksjon|frister/u.test(f.key)), false);
});
test('R-018-07: none/Tap/child-only/removed ID/child rejection; no inferred parent or auto-migration', () => {
  assert.equal(hasCatalogUse(enrich()), false);
  for (const value of ['Valgt', 'Ikke valgt']) {
    const r = enrich([use(value)]); assert.equal(r.addOnIds.includes(tap), false); assert.equal(hasCatalogUse(r), false);
    assert.ok(r.importantTerms.some(t => t.key === 'hund.bruksverdi.dekning' && t.value === value && t.coverageOrigin === 'document'));
  }
  const oldText = { name: 'Bruksverdi', annualPremium: null, deductible: null, importantTerms: [] };
  const legacy = enrich([], [oldText]); assert.equal(legacy.addOnIds.includes(tap), false);
  assert.ok(legacy.addOns.some(a => a.name === 'Bruksverdi'));
  assert.throws(() => manual([removed]), { message: 'Ugyldig eller ikke gyldig tilleggsdekning.' });
  assert.equal(manual([]).insuranceData.insurances[0].importantTerms.some(t => t.key === 'hund.bruksverdi.dekning'), false);
  assert.equal(manual([tap]).insuranceData.insurances[0].importantTerms.some(t => t.key === 'hund.bruksverdi.dekning'), true);
  const selected = enrich([life('Valgt')]); assert.ok(selected.addOnIds.includes(tap)); assert.ok(hasCatalogUse(selected));
  const named = enrich([], [{ name: 'Tap', annualPremium: null, deductible: null, importantTerms: [] }]); assert.ok(named.addOnIds.includes(tap)); assert.ok(hasCatalogUse(named));
  const parentRejected = enrich([life('Ikke valgt'), use('Valgt')]); assert.equal(parentRejected.addOnIds.includes(tap), false); assert.equal(hasCatalogUse(parentRejected), false);
  for (const child of [[use('Ikke valgt')], [use('Valgt'), use('Ikke valgt')]]) {
    const r = enrich([life('Valgt'), ...child]);
    assert.ok(r.addOnIds.includes(tap)); assert.equal(hasCatalogUse(r), false);
    assert.ok(r.importantTerms.some(t => t.key === 'dyr.liv.opphor' && t.coverageOrigin === 'catalog'));
    assert.ok(r.importantTerms.some(t => t.key === 'dyr.liv.forsvinning' && t.coverageOrigin === 'catalog'));
  }
});
test('R-018-08: under eight, trained regular use, complete loss, vet evidence, breeding exclusion and 50% offset', () => {
  assert.match(own('hund.bruksverdi.dekning').value, /helt tap.*sykdom eller ulykke.*ferdig trent.*regelmessig/u);
  assert.match(own('hund.bruksverdi.alder').value, /under 8 år/u);
  assert.doesNotMatch(own('hund.bruksverdi.alder').value, /hovedforfall/u);
  assert.match(own('hund.bruksverdi.begrensning').value, /veterinærattest/u);
  assert.match(own('hund.bruksverdi.begrensning').value, /avlsegenskaper er unntatt.*§7.3.*før 4 måneder.*HD\/AA\/AD.*NKK.*foreldrene.*frirøntget/u);
  assert.match(own('hund.bruksverdi.grense').value, /50 %.*forsikringsbeviset.*trekkes fra senere dødsfallserstatning/u);
  const r = enrich([life('Valgt'), term('dyr.liv.sum.valgbar', '44 000 kr', 'Valgt Tap-sum')]);
  assert.equal(r.importantTerms.find(t => t.key === 'dyr.liv.sum.valgbar').value, '44 000 kr');
  const limit = r.importantTerms.find(t => t.key === 'hund.bruksverdi.grense'); assert.match(limit.value, /50 %/u); assert.doesNotMatch(limit.value, /22 000/u);
});
test('R-018-09: Frende Katt/Medisin/Tann unchanged, independent Fremtind and included Storebrand use', () => {
  const p = product('frende-katt-veterin-r');
  const catAddOns = productCatalog.addOns.filter(a => a.providerId === 'frende' && a.insuranceTypes?.includes('Katt'));
  assert.equal(digest([p, productCatalog.facts[p.productId], catAddOns.map(a => [a, productCatalog.facts[a.componentId]])]), 'b9c61bfcad24653234fea00cab416e92bade800eae472bba353f007dc9da9277');
  for (const [id, fingerprint] of [['frende-hund-medisin', '48a0f654a9541f6bd16de416119817209a50db521f122c7a85fc65adcde48475'],
    ['frende-hund-tann', '00b5fa527c62041a9cfcf187e674aecd6c19a4d51aa6b40172e51fa95a8828e6']]) {
    const a = productCatalog.addOns.find(a => a.id === id); assert.equal(digest([a, productCatalog.facts[a.componentId]]), fingerprint);
    assert.doesNotThrow(() => facts([id]));
  }
  const frendeTap = productCatalog.addOns.find(a => a.id === tap);
  assert.deepEqual(frendeTap.selectionEvidenceKeys, ['dyr.liv.dekning']); assert.equal(frendeTap.requiresAddOnIds, undefined);
  const separate = resolveCatalogFacts(product('sparebank1-fremtind-hund-veterin-r'), ['sparebank1-fremtind-hund-bruk'], date);
  assert.ok(separate.some(f => f.key === 'hund.bruksverdi.dekning')); assert.equal(separate.some(f => f.key === 'dyr.liv.dekning'), false);
  const included = resolveCatalogFacts(productCatalog.products.find(p => p.providerId === 'storebrand' && p.insuranceType === 'Hund' && p.name === 'Dødsfall'), [], date);
  assert.ok(included.some(f => f.key === 'hund.bruksverdi.dekning'));
  assert.throws(() => resolveCatalogFacts(product('gjensidige-hund-behandling'), ['gjensidige-hund-bruk'], date), /uttrykkelig valgt/u);
});
