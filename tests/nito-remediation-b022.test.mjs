import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, resolveAddOnPackage, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { boatPetKeyApplies } from '../lib/boat-pet-registry.ts';

// B-022: 22894946841d0ce5 / 3327dc0e4134e2c5;
// GAP-2900/SF-4052, GAP-2936/SF-4091, RC-112/SCRC-035, CR-160/CR-292.
const date = new Date('2026-10-02T00:00:00Z');
const product = type => productCatalog.products.find(p => p.productId === `gjensidige-${type}-behandling`);
const liv = type => `gjensidige-${type}-liv`, bruk = type => `gjensidige-${type}-bruk`;
const key = type => `${type}.bruksverdi.dekning`;
const facts = (type, ids = []) => resolveCatalogFacts(product(type), ids, date);
const selectedFacts = type => facts(type, [liv(type), bruk(type)]);
const term = (name, canonicalKey, value) => ({ name, canonicalKey, value });
const lifeTerm = value => term('Liv, død og tap', 'dyr.liv.dekning', value);
const brukTerm = (type, value) => term('Bruksverdi', key(type), value);
const enrich = (type, terms = [], addOns = [], catalog = productCatalog) => {
  const input = { company: 'Gjensidige', totalAnnualPremium: null, insurances: [{ type: type === 'hund' ? 'Hund' : 'Katt',
    productName: 'Behandling', annualPremium: null, deductible: null, coverageSummary: null, importantTerms: terms, addOns }] };
  const before = structuredClone(input);
  const result = enrichExtractedAgreementWithCatalog(input, date, undefined, undefined, catalog).insurances[0];
  assert.deepEqual(input, before);
  return result;
};
const manual = (type, ids) => normalizeManualAgreement({ company: 'Gjensidige', totalAnnualPremium: '', products: [{
  type: type === 'hund' ? 'Hund' : 'Katt', productName: 'Behandling', annualPremium: '', deductible: '',
  coverageSummary: '', importantTerms: [], addOnIds: ids }] });
const hasCatalogBruk = (type, insurance) => insurance.importantTerms.some(t => t.key?.startsWith(`${type}.bruksverdi.`) && t.coverageOrigin === 'catalog');

test('R-022-01: four frozen sources, full-term facts and product-page dependency provenance', () => {
  for (const [type, document, hash, sourceType] of [
    ['hund', 'life-use', '90536e3520ee46f476f480be9760bc92bd40162e29fd53e914df44b70ea150ea', 'full_terms'],
    ['katt', 'life-use', '47750999d5bdbe5fc9bf5a2ffe24def17dd1664a2b8f9886bc7868dbf8049f5e', 'full_terms'],
    ['hund', 'product', 'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58', 'product_page'],
    ['katt', 'product', 'f9bc6e31f84bfe1660b0014798ce144fa6fc5ee7f34ccbe14acf28feab883d4f', 'product_page'],
  ]) {
    const s = productCatalog.sources[`boat-pet:gjensidige:${type}:${document}`];
    assert.equal(s.sourceType, sourceType); assert.equal(s.version, ''); assert.equal(s.effectiveFrom, '');
    assert.equal(s.agreementScope, 'ordinary'); assert.equal(s.sha256, hash);
    assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/boat-pet/' + s.filename, import.meta.url))).digest('hex'), hash);
  }
  for (const type of ['hund', 'katt']) for (const f of selectedFacts(type).filter(f => f.key.startsWith(`${type}.bruksverdi.`))) {
    assert.equal(f.source.documentId, `boat-pet:gjensidige:${type}:life-use`);
    assert.equal(f.source.page, type === 'hund' && f.key.endsWith('.alder') ? 3 : 2);
    assert.equal(f.qualificationSource.documentId, `boat-pet:gjensidige:${type}:product`);
    assert.match(f.qualificationSource.section, /tillegg til Liv/u);
  }
});
test('R-022-02: exact provider, species, agreement and version boundaries', () => {
  for (const type of ['hund', 'katt']) {
    const p = product(type);
    assert.equal(findCatalogProduct('gjensidige', p.productId, null, { agreementScope: 'ordinary', insuranceType: p.insuranceType }), p);
    for (const scope of [{ agreementScope: 'nito' }, { insuranceType: type === 'hund' ? 'Katt' : 'Hund' }])
      assert.equal(findCatalogProduct('gjensidige', p.productId, null, scope), null);
    assert.equal(findCatalogProduct('gjensidige', p.productId, 'unknown'), null);
    assert.equal(findCatalogProduct('frende', p.productId, null), null);
    for (const other of productCatalog.products.filter(other => other !== p))
      assert.equal(availableAddOns(other, date).some(a => a.id === bruk(type)), false);
  }
});
test('R-022-03: same product has stable optional Bruk with no artificial difference', () => {
  for (const type of ['hund', 'katt']) {
    const c = compareCatalogProducts(product(type), product(type)); assert.equal(c.differenceCount, 0);
    const r = c.sections.flatMap(s => s.rows).find(r => r.key === key(type)); assert.ok(r);
    assert.equal(r.first.state, 'optional'); assert.deepEqual(r.first, r.second);
  }
});
test('R-022-04: species-correct facts and source follow both comparison directions', () => {
  for (const type of ['hund', 'katt']) {
    const p = product(type), other = productCatalog.products.find(p => p.providerId === 'frende' && p.insuranceType === product(type).insuranceType);
    const forward = compareCatalogProducts(p, other).sections.flatMap(s => s.rows);
    const reverse = compareCatalogProducts(other, p).sections.flatMap(s => s.rows);
    for (const r of forward) { const swapped = reverse.find(s => s.key === r.key); assert.ok(swapped); assert.deepEqual(r.first, swapped.second); assert.deepEqual(r.second, swapped.first); }
    if (type === 'katt') assert.equal(forward.find(r => r.key === key(type)).second.state, 'unknown');
  }
});
test('R-022-05: document values win, silence and explicit rejection never select availability', () => {
  for (const type of ['hund', 'katt']) {
    for (const value of ['Dokumentert kundevilkår 15 000 kr', 'Dokumentert kundevilkår 27 000 kr']) {
      const r = enrich(type, [lifeTerm('Valgt'), brukTerm(type, 'Valgt'), term('Bruksverdi aldersgrense', `${type}.bruksverdi.alder`, value)]);
      const t = r.importantTerms.find(t => t.key === `${type}.bruksverdi.alder`);
      assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
    }
    for (const value of ['Ukjent', 'Ikke dokumentert', 'Ikke valgt']) {
      const r = enrich(type, [lifeTerm('Valgt'), brukTerm(type, value)]);
      assert.equal(hasCatalogBruk(type, r), false);
      assert.equal(r.addOnIds.includes(bruk(type)), false);
    }
    assert.equal(hasCatalogBruk(type, enrich(type)), false);
  }
});
test('R-022-06: PC-1056–1061 protect allergy sums, separate offspring and document priority', () => {
  const registry = readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv', import.meta.url), 'utf8');
  for (let id = 1056; id <= 1061; id++) assert.ok(registry.includes(`PC-${id},AUDITED_POSITIVE,gjensidige`));
  for (const type of ['hund', 'katt']) {
    assert.match(facts(type).find(f => f.key === 'dyr.allergi.grense').value, /5 000/u);
    assert.equal(facts(type).some(f => /kull/iu.test(f.key)), false);
    assert.equal(productCatalog.products.some(p => p.providerId === 'gjensidige' && /kull/iu.test(p.name)), false);
    for (const value of ['3 200 kr', '9 100 kr']) {
      const r = enrich(type, [term('Allergi grense', 'dyr.allergi.grense', value)]);
      const t = r.importantTerms.find(t => t.key === 'dyr.allergi.grense'); assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
    }
    assert.equal(facts(type).some(f => /klage|frister/iu.test(f.key)), false);
  }
});
test('R-022-07: strict manual none/Liv/Bruk/Liv+Bruk; availability never auto-selects Liv', () => {
  for (const type of ['hund', 'katt']) {
    assert.equal(facts(type).some(f => f.key === key(type)), false);
    assert.equal(facts(type, [liv(type)]).some(f => f.key === key(type)), false);
    assert.throws(() => facts(type, [bruk(type)]), /uttrykkelig valgt/u);
    assert.throws(() => manual(type, [bruk(type)]), { message: 'Ugyldig eller ikke gyldig tilleggsdekning.' });
    assert.deepEqual(selectedFacts(type), facts(type, [bruk(type), liv(type)]));
    for (const ids of [[], [liv(type)], [bruk(type), liv(type)], [liv(type), bruk(type)]]) {
      const r = manual(type, ids).insuranceData.insurances[0];
      assert.equal(r.importantTerms.some(t => t.key === key(type)), ids.includes(bruk(type)));
    }
  }
});
test('R-022-08: dependencies reject self/cycle/dangling/provider/type/scope/version/excluded/future', () => {
  const p = product('hund');
  const invalid = change => {
    const c = structuredClone(productCatalog);
    const child = c.addOns.find(a => a.id === bruk('hund')), parent = c.addOns.find(a => a.id === liv('hund'));
    change(c, child, parent);
    assert.throws(() => resolveAddOnPackage(p, child.id, date, null, c), /avhengighet|tilleggsvarianter/u);
  };
  invalid((c, child) => { child.requiresAddOnIds = [child.id]; });
  invalid((c, child, parent) => { parent.requiresAddOnIds = [child.id]; });
  invalid((c, child) => { child.requiresAddOnIds = ['missing']; });
  invalid((c, child, parent) => { parent.providerId = 'frende'; });
  invalid((c, child, parent) => { parent.insuranceTypes = ['Katt']; });
  invalid((c, child, parent) => { parent.agreementScope = 'nito'; });
  invalid((c, child, parent) => { parent.requiresLevel = ['other-product']; });
  invalid((c, child, parent) => { parent.distributionChannels = ['excluded']; });
  invalid((c, child, parent) => { parent.excludeDistributionChannels = ['ordinary']; parent.distributionChannels = ['ordinary']; });
  invalid(c => { c.sources['boat-pet:gjensidige:hund'].productVersion = 'other-version'; });
  invalid(c => { c.sources['boat-pet:gjensidige:hund'].effectiveFrom = '2099-01-01'; });
  invalid(c => { c.sources['boat-pet:gjensidige:hund'].validTo = '2020-01-01'; });
  invalid(c => { c.sources['boat-pet:gjensidige:hund:product'].agreementScope = 'nito'; });
  invalid((c, child, parent) => { child.exclusiveGroup = 'alternatives'; parent.exclusiveGroup = 'alternatives'; });
});
test('R-022-09: PDF missing/rejected/conflicting Liv preserves raw Bruk and valid base', () => {
  for (const type of ['hund', 'katt']) {
    for (const life of [[], [lifeTerm('Ikke valgt')], [lifeTerm('Valgt'), lifeTerm('Ikke valgt')]]) {
      const r = enrich(type, [...life, brukTerm(type, 'Valgt')]);
      assert.equal(r.addOnIds.includes(bruk(type)), false); assert.equal(hasCatalogBruk(type, r), false);
      assert.ok(r.importantTerms.some(t => t.key === 'dyr.veterinar.dekning' && t.coverageOrigin === 'catalog'));
      assert.ok(r.importantTerms.some(t => t.key === key(type) && t.value === 'Valgt' && t.coverageOrigin === 'document'));
      assert.equal(r.importantTerms.some(t => t.key === 'dyr.liv.dekning' && t.coverageOrigin === 'catalog'), false);
    }
    const valid = enrich(type, [lifeTerm('Valgt'), brukTerm(type, 'Valgt')]);
    assert.ok(valid.addOnIds.includes(bruk(type))); assert.ok(valid.addOnIds.includes(liv(type))); assert.ok(hasCatalogBruk(type, valid));
    assert.equal(hasCatalogBruk(type, enrich(type, [lifeTerm('Valgt')])), false);
    assert.equal(hasCatalogBruk(type, enrich(type, [lifeTerm('Valgt'), brukTerm(type, 'Ikke valgt')])), false);
    const names = ['Liv', 'Bruk'].map(name => ({ name, annualPremium: null, deductible: null, importantTerms: [] }));
    assert.ok(hasCatalogBruk(type, enrich(type, [], names)));
    assert.equal(hasCatalogBruk(type, enrich(type, [], [{ name: bruk(type), annualPremium: null, deductible: null, importantTerms: [] }])), false);
  }
});
test('R-022-10: catalog package is optional, separates evidence and never duplicates Liv as Bruk', () => {
  for (const type of ['hund', 'katt']) {
    assert.deepEqual(resolveAddOnPackage(product(type), bruk(type), date), [liv(type), bruk(type)]);
    const m = materializeCatalogProduct(product(type));
    const life = m.facts.filter(f => f.key === 'dyr.liv.dekning'); assert.equal(life.length, 1);
    assert.equal(life[0].state, 'optional'); assert.deepEqual(life[0].addOnNames, ['Liv']);
    const children = m.facts.filter(f => f.key.startsWith(`${type}.bruksverdi.`)); assert.equal(children.length, 3);
    for (const f of children) { assert.equal(f.state, 'optional'); assert.deepEqual(f.addOnNames, ['Bruk']); }
    assert.match(children.find(f => f.key === key(type)).value, /tillegg til valgt Liv/u);
  }
});
test('R-022-11: 50% working dog versus 100% physical breeding loss; distinct Bruk ages and species', () => {
  const dog = selectedFacts('hund').find(f => f.key === 'hund.bruksverdi.begrensning');
  assert.match(dog.value, /100 %.*minst 1 kull siste 2 år/u); assert.match(dog.value, /regelmessig.*50 %/u);
  assert.match(dog.value, /veterinær/u); assert.match(dog.value, /utredet.*adekvat behandlet.*rekonvalesens/u);
  const cat = selectedFacts('katt').find(f => f.key === 'katt.bruksverdi.begrensning');
  assert.match(cat.value, /100 %.*minst 1 kull siste 2 år/u); assert.doesNotMatch(cat.value, /50 %/u);
  for (const [type, years] of [['hund', 8], ['katt', 10]]) {
    assert.match(selectedFacts(type).find(f => f.key === `${type}.bruksverdi.alder`).value, new RegExp(`hovedforfall.*${years} år`, 'u'));
    assert.equal(boatPetKeyApplies(type === 'hund' ? 'katt' : 'hund', key(type)), false);
  }
  assert.equal(selectedFacts('katt').some(f => f.key.startsWith('hund.')), false);
  assert.equal(selectedFacts('katt').some(f => f.key === 'katt.bruksverdi.grense'), false);
  assert.equal(selectedFacts('katt').some(f => f.key === 'dyr.liv.opphor'), false); // no independent Liv expansion
});
test('R-022-12: other add-ons retain independent selection and component facts without metadata', () => {
  for (const p of productCatalog.products) for (const a of availableAddOns(p, date).filter(a => !a.requiresAddOnIds && !a.selectionEvidenceKeys)) {
    assert.deepEqual(resolveAddOnPackage(p, a.id, date), [a.id]);
    assert.doesNotThrow(() => resolveCatalogFacts(p, [a.id], date));
  }
  const frende = productCatalog.products.find(p => p.providerId === 'frende' && p.insuranceType === 'Hund');
  assert.doesNotThrow(() => resolveCatalogFacts(frende, ['frende-hund-bruksverdi'], date));
  // B-018 is deliberately not implemented in this batch.
  assert.equal(productCatalog.addOns.find(a => a.id === 'frende-hund-tap').selectionEvidenceKeys, undefined);
});
