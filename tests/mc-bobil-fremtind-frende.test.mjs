import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fremtindFrendeMcBobilCatalog as data } from '../lib/mc-bobil-fremtind-frende-catalog.ts';
import { findCatalogProductBySelection, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { resolveCatalogSources } from '../lib/catalog-source-resolution.ts';
import { mcBobilKeyApplies } from '../lib/mc-bobil-registry.ts';

const catalog = { ...data, companies: ['Fremtind', 'Frende'], insuranceTypes: ['MC', 'Bobil'], agreementScopes: [
  { id: 'ordinary-sparebank1', providerId: 'fremtind', name: 'Ordinær via SpareBank 1' },
  { id: 'ordinary-dnb', providerId: 'fremtind', name: 'Ordinær via DNB' },
] };
const date = new Date('2026-09-28');
const product = id => data.products.find(p => p.productId === id);
const facts = (id, addOns = []) => resolveCatalogFacts(product(id), addOns, date, null, catalog);
const get = (id, key, addOns = []) => facts(id, addOns).find(f => f.key === key);
const manifest = JSON.parse(readFileSync(new URL('../catalog/sources/mc-bobil/fremtind-frende-manifest.json', import.meta.url)));

for (const [company, type, scope, levels] of [
  ['Fremtind', 'MC', 'ordinary-sparebank1', ['Ansvar', 'Delkasko', 'Kasko']],
  ['Fremtind', 'Bobil', 'ordinary-dnb', ['Ansvar', 'Minikasko', 'Kasko', 'Topp']],
  ['Frende', 'MC', 'ordinary', ['Ansvar', 'Delkasko', 'Kasko']],
  ['Frende', 'Bobil', 'ordinary', ['Ansvar', 'Delkasko', 'Kasko', 'Utvidet']],
]) test(`${company} ${type} has only the verified tiers in exact distribution scope`, () => {
  assert.deepEqual(data.products.filter(p => p.company === company && p.insuranceType === type).map(p => p.name), levels);
  for (const level of levels) {
    const found = findCatalogProductBySelection(company, type, level, scope, catalog);
    assert.ok(found);
    assert.equal(found.agreementScope, scope);
    assert.equal(found.providerId, company.toLowerCase());
    assert.ok(facts(found.productId).length > 5);
  }
});
test('Fremtind distributor never becomes underwriting provider and scopes reject LOfavor', () => {
  assert.ok(data.products.filter(p => p.company === 'Fremtind').every(p => p.providerId === 'fremtind'));
  assert.equal(findCatalogProductBySelection('Fremtind', 'MC', 'Kasko', 'ordinary-dnb', catalog), null);
  assert.equal(findCatalogProductBySelection('Fremtind', 'Bobil', 'Kasko', 'ordinary-sparebank1', catalog), null);
  assert.equal(findCatalogProductBySelection('Fremtind', 'MC', 'Kasko', 'lofavor', catalog), null);
});
test('all 18 official inventory entries hash-verifiably reuse or preserve originals', () => {
  assert.equal(manifest.sources.length, 18);
  for (const source of manifest.sources) {
    const bytes = readFileSync(new URL(`../${source.localPath}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.name);
    assert.match(new URL(source.originUrl).hostname, /(?:^|\.)(?:frende\.no|sparebank1\.no|dnb\.no|fremtind\.no)$/u);
    if (source.localPath.endsWith('.pdf')) assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  }
});
test('Frende type-specific APIs share bytes but retain independent type source identities', () => {
  const mc = manifest.sources.find(s => s.name === 'frende-mc-terms.pdf');
  const bobil = manifest.sources.find(s => s.name === 'frende-bobil-terms.pdf');
  assert.equal(mc.localPath, bobil.localPath);
  assert.equal(mc.sha256, bobil.sha256);
  assert.notEqual(data.products.find(p => p.productId === 'frende-mc-kasko').sourceId, product('frende-bobil-kasko').sourceId);
});
test('catalog rows have exact type/scope/source provenance and never populate customer pricing or mileage', () => {
  for (const p of data.products) {
    const seen = new Set();
    for (const f of facts(p.productId)) {
      assert.equal(seen.has(f.key), false, `${p.productId} duplicate ${f.key}`); seen.add(f.key);
      assert.ok(mcBobilKeyApplies(p.insuranceType.toLowerCase(), f.key));
      assert.doesNotMatch(f.key, /^(?:premie|kjoretoy)\./u);
      const source = data.sources[f.source.documentId];
      assert.equal(source.providerId, p.providerId);
      assert.equal(source.insuranceType, p.insuranceType);
      assert.equal(source.agreementScope, p.agreementScope);
      assert.ok(source.productIds.includes(p.productId));
      assert.ok(f.source.page > 0 && f.source.section.length > 0);
      assert.equal(f.source.agreementScope, p.agreementScope);
    }
  }
});
test('current Fremtind MC IPID version is known but no invented effective date', () => {
  const source = data.sources['mcb-ff-fremtind-mc-ipid'];
  assert.equal(source.version, 'V.104');
  assert.equal(source.effectiveFrom, '');
});
test('Fremtind MC generic rental exclusion does not suppress its explicit MC exception', () => {
  assert.equal(get('fremtind-mc-delkasko', 'leiebil.dekning'), undefined);
  assert.match(get('fremtind-mc-kasko', 'leiebil.dager').value, /15 dager/u);
  assert.equal(get('fremtind-mc-kasko', 'leiebil.dagsgrense').value, '350 kr per dag');
  assert.match(get('fremtind-mc-kasko', 'leiebil.dekning').source.termsNumber, /PMO-357\.120-010/u);
});
test('Fremtind MC glass scoped to other vehicle types never enters MC', () => {
  assert.ok(data.products.filter(p => p.insuranceType === 'MC' && p.providerId === 'fremtind')
    .every(p => !facts(p.productId).some(f => f.key.startsWith('glass.'))));
});
test('Fremtind MC contents and equipment limits stay separate', () => {
  assert.equal(get('fremtind-mc-delkasko', 'utstyr.grense').value, 'Inntil 10 000 kr');
  assert.equal(get('fremtind-mc-delkasko', 'mc.bagasje.grense').value, 'Inntil 5 000 kr samlet');
  assert.match(get('fremtind-mc-delkasko', 'mc.bagasje.begrensning').value, /smykker/u);
});
test('Fremtind geography differs correctly between MC and Bobil', () => {
  assert.equal(get('fremtind-mc-ansvar', 'avtale.geografi').value, 'Europa, Tyrkia og Israel');
  assert.match(get('fremtind-bobil-ansvar', 'avtale.geografi').value, /unntatt Tyrkia, Kosovo, Russland og Belarus/u);
});
test('Fremtind Bobil current full terms supersede stale DNB webpage limits', () => {
  assert.equal(get('fremtind-bobil-topp', 'bobil.losore.grense').value, 'Inntil 100 000 kr');
  assert.equal(get('fremtind-bobil-kasko', 'bobil.losore.grense').value, 'Inntil 40 000 kr');
  assert.match(get('fremtind-bobil-topp', 'utstyr.grense').value, /50 000/u);
  assert.equal(get('fremtind-bobil-topp', 'bobil.feriegaranti.dager').value, 'Resterende planlagt ferie, inntil 15 dager');
});
test('Fremtind Bobil source authority rejects injected stale official page value', () => {
  const p = product('fremtind-bobil-topp');
  const term = get(p.productId, 'bobil.losore.grense');
  const page = data.sources['mcb-ff-fremtind-dnb-bobil-page'];
  const stale = { ...term, value: 'Inntil 80 000 kr', source: { ...term.source, documentId: page.id } };
  const result = resolveCatalogSources([stale, term], data.sources, p, date);
  assert.deepEqual(result.facts.map(f => f.value), ['Inntil 100 000 kr']);
  assert.equal(result.decisions[0].reason, 'source_priority');
});
test('Bobil totalskade, fukt and rental ages/days/kilometers never exchange meaning', () => {
  assert.match(get('fremtind-bobil-topp', 'nyverdi.km').value, /100 000/u);
  assert.match(get('fremtind-bobil-topp', 'nyverdi.alder').value, /3 år/u);
  assert.match(get('fremtind-bobil-topp', 'bobil.fukt.alder').value, /15 år/u);
  assert.match(get('fremtind-bobil-topp', 'bobil.fukt.kontroll').value, /ett år/u);
  assert.equal(get('fremtind-bobil-kasko', 'bobil.fukt.dekning'), undefined);
});
test('Fremtind rental and machine stay optional even on Topp', () => {
  for (const id of ['fremtind-bobil-kasko', 'fremtind-bobil-topp']) {
    assert.equal(get(id, 'maskinskade.dekning'), undefined);
    assert.equal(get(id, 'leiebil.dekning'), undefined);
    assert.deepEqual(availableAddOns(product(id), catalog).map(a => a.id).sort(), ['fremtind-bobil-leiebil', 'fremtind-bobil-maskinskade']);
    assert.ok(get(id, 'maskinskade.dekning', ['fremtind-bobil-maskinskade']));
  }
});
test('Fremtind machine maximum200000 is independent of deductible bracket99999', () => {
  assert.match(get('fremtind-bobil-kasko', 'maskinskade.km', ['fremtind-bobil-maskinskade']).value, /200 000/u);
  assert.doesNotMatch(get('fremtind-bobil-kasko', 'maskinskade.km', ['fremtind-bobil-maskinskade']).value, /99 999/u);
  assert.match(get('fremtind-bobil-kasko', 'maskinskade.egenandel.kilometer', ['fremtind-bobil-maskinskade']).value, /99 999/u);
});
test('wrong type, provider, tier and scope riders reject instead of leaking', () => {
  for (const [id, addon] of [
    ['fremtind-mc-kasko', 'fremtind-bobil-maskinskade'],
    ['frende-bobil-kasko', 'fremtind-bobil-leiebil'],
    ['frende-mc-ansvar', 'frende-bobil-leiebil'],
    ['fremtind-bobil-ansvar', 'fremtind-bobil-maskinskade'],
  ]) assert.throws(() => facts(id, [addon]), /tilleggsdekning/u);
});
test('Frende MC accident is available, never silently included in base tier', () => {
  for (const id of ['frende-mc-ansvar', 'frende-mc-delkasko', 'frende-mc-kasko']) {
    assert.equal(get(id, 'ulykke.dekning'), undefined);
    assert.ok(get(id, 'ulykke.dekning', ['frende-mc-ulykke']));
    assert.match(get(id, 'ulykke.invaliditet', ['frende-mc-ulykke']).value, /200 000/u);
  }
});
test('Frende MC gets riding gear but no Bobil moisture, engine, rental or nyverdi rule', () => {
  const rows = facts('frende-mc-kasko');
  assert.ok(rows.some(f => f.key === 'mc.kjoreutstyr.dekning'));
  assert.ok(rows.every(f => !/^(?:bobil|nyverdi|maskinskade|leiebil)\./u.test(f.key)));
  assert.equal(get('frende-mc-delkasko', 'mc.bagasje.dekning'), undefined);
  assert.equal(get('frende-mc-kasko', 'mc.bagasje.grense').value, 'Inntil 10 000 kr');
});
test('Frende Bobil Utvidet refines equipment contents moisture and nyverdi', () => {
  assert.match(get('frende-bobil-kasko', 'nyverdi.km').value, /15 000/u);
  assert.match(get('frende-bobil-utvidet', 'nyverdi.km').value, /60 000/u);
  assert.equal(get('frende-bobil-utvidet', 'utstyr.grense').value, 'Inntil 50 000 kr');
  assert.equal(get('frende-bobil-utvidet', 'bobil.losore.grense').value, 'Inntil 100 000 kr');
  assert.equal(get('frende-bobil-kasko', 'bobil.fukt.dekning'), undefined);
  assert.match(get('frende-bobil-utvidet', 'bobil.fukt.kontroll').value, /12 måneder/u);
  assert.equal(get('frende-bobil-utvidet', 'bobil.fukt.alder'), undefined);
});
test('Frende holiday benefit is actual-expense reimbursement only after chosen rental rider', () => {
  assert.equal(get('frende-bobil-utvidet', 'bobil.feriegaranti.dekning'), undefined);
  const add = ['frende-bobil-leiebil'];
  assert.match(get('frende-bobil-utvidet', 'bobil.feriegaranti.dekning', add).value, /refusjon/u);
  assert.match(get('frende-bobil-utvidet', 'bobil.feriegaranti.dager', add).value, /15 dager/u);
  assert.match(get('frende-bobil-utvidet', 'leiebil.dager', add).value, /31 dager/u);
  assert.equal(get('frende-bobil-utvidet', 'bobil.ferieavbrudd.dekning', add), undefined);
});
test('Frende machine keeps documentary age qualification and deductible intervals separate', () => {
  const add = ['frende-bobil-maskinskade'];
  assert.match(get('frende-bobil-kasko', 'maskinskade.alder', add).value, /Punkt 9\.1/u);
  assert.match(get('frende-bobil-kasko', 'maskinskade.km', add).value, /200 000/u);
  assert.equal(get('frende-bobil-kasko', 'maskinskade.dekning'), undefined);
});
test('cross-type source candidates remain inapplicable even when physical Frende PDF is shared', () => {
  const foreign = get('frende-bobil-utvidet', 'nyverdi.km');
  assert.deepEqual(resolveCatalogSources([foreign], data.sources, product('frende-mc-kasko'), date).facts, []);
});
test('no unverified private hire or genuine membership product was created', () => {
  assert.ok(data.products.every(p => !/lofavør|nito|utdannings/u.test(p.name.toLowerCase())));
  assert.ok(Object.values(data.facts).flat().every(f => f.key !== 'bobil.utleie.dekning'));
});
