import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, findCatalogProductBySelection } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { productComparisonView } from '../lib/product-comparison-presentation.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { normalizeTermName, canonicalTermIdsForType } from '../lib/insurance-normalization.ts';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, enrich, manual, date } from './helpers/wave3-catalog-gate.mjs';

// B-030 RC-006/SCRC-052: all 12 P1 signatures / 19 source bindings.
// Independent frozen source oracle: Standard PBK210.100-014 and Topp
// PBK210.200-013, effective 2025-01-01. The authorized weather identity
// is separate from Uhell, statutory nature and Hus weather.
const std = 'fremtind-innbo-standard';
const top = 'fremtind-innbo-topp';
const ids = [std, top];
const weather = 'innbo.vaer.dekning';
const root = 'catalog/sources/fremtind/innbo/canonical/';
const hashes = {
  'Vilkar_Standard_Innbo.pdf': 'eddc6ba67d46495fce5925679fc75a92bfdb3af7aa4f7ed5ebb0d0592032fced',
  'Vilkar_Topp_Innbo.pdf': 'd051745eb18921707f85bf42c130b780af4c65a0427207390bff6eea17257547',
  'IPID_Innbo.pdf': '5df50f82167bd89c97e7b9d4e8a3de6280878fd288e1ea01c993d42057cf55dd',
};
const signatures = ['1ea53d5bc22ac534', '37b36a5c71ec7d6e', '6a19f67db46dada6', '755dcd55e30eec9e',
  '76a492443927f001', 'a79970b1d87c194f', 'ae502dc2acd1581f', 'b2c12d1d1a90acc2',
  'b713793cb2c2c273', 'd7ad3d00e278ee44', 'f14ead68f11967e0', 'f3647166d674a7dc'];
const bindings = [
  ['GAP-5003', 'SF-7179'], ['GAP-5035', 'SF-7217'], ['GAP-5004', 'SF-7183'], ['GAP-5036', 'SF-7221'],
  ['GAP-5007', 'SF-7186'], ['GAP-5039', 'SF-7224'], ['GAP-5013', 'SF-7193'], ['GAP-5046', 'SF-7232'],
  ['GAP-5014', 'SF-7194'], ['GAP-5024', 'SF-7204'], ['GAP-5065', 'SF-7255'], ['GAP-5025', 'SF-7205'],
  ['GAP-5066', 'SF-7256'], ['GAP-5028', 'SF-7209'], ['GAP-5069', 'SF-7260'], ['GAP-5045', 'SF-7231'],
  ['GAP-5054', 'SF-7241'], ['GAP-5056', 'SF-7246'], ['GAP-5057', 'SF-7247'],
];
const source = (id, key, page) => {
  const f = fact(id, key);
  assert.equal(f.source.documentId, id === std ? 'fremtindInnboStandard' : 'fremtindInnboTopp');
  assert.equal(f.source.page, page);
  assert.equal(f.source.effectiveFrom, '2025-01-01');
  assert.equal(productCatalog.sources[f.source.documentId].sha256, hashes[f.source.filename]);
  return f;
};

test('R-030-01: all12 signatures/19 bindings and exact original hashes/provenance', () => {
  const triage = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json', import.meta.url)));
  const batch = triage.batches.find(b => b.batch_id === 'B-030');
  assert.deepEqual(batch.signature_ids, signatures);
  assert.deepEqual(batch.evidence.map(e => [e.finding_id, e.source_fact_id]), bindings);
  for (const [file, hash] of Object.entries(hashes)) sourceHash(root + file, hash);
  for (const e of batch.evidence) {
    const file = e.artifact.split('/').at(-1);
    assert.equal(e.sha256, hashes[file]);
    assert.equal(e.urls[0], productCatalog.sources[file.includes('Standard') ? 'fremtindInnboStandard' : 'fremtindInnboTopp'].url);
  }
  for (const id of ids) {
    assert.equal(product(id).providerId, 'fremtind');
    assert.equal(product(id).insuranceType, 'Innbo');
    assert.equal(product(id).agreementScope ?? 'ordinary', 'ordinary');
    assert.equal(product(id).version, '2025-01-01');
  }
});

test('R-030-02 GAP-5003/5035: wine500k, separate jewellery/gold350k and other precious metals350k', () => {
  for (const id of ids) {
    const jewellery = source(id, 'innbo.verdigjenstander.smykker_edelmetall.grense', 1);
    assert.match(jewellery.value, /350 000 kr for smykker og gull; separat 350 000 kr for annet edelt metall/);
    const collection = source(id, 'innbo.samling.grense', 1);
    assert.match(collection.value, /350 000 kr for enkeltgjenstander og samlinger/);
    assert.match(collection.value, /ikke ting i bruk for sitt opprinnelige formål.*Vin og sprit.*500 000 kr/);
    for (const f of [jewellery, collection]) assert.match(f.value, /Høyere sum kan avtales.*forsikringsbeviset/);
    assert.equal(fact(id, 'innbo.kunst.grense').value, '500 000 kr; høyere sum kan avtales og må fremgå av forsikringsbeviset');
  }
});

test('R-030-03 GAP-5004/5036: small watercraft and equipment10kmh, greenhouse20k/40k is not their cap', () => {
  for (const id of ids) {
    assert.equal(source(id, 'innbo.luftvannsport.grense', 2).value,
      'Kano, kajakk og seilbrett omfattes; ingen særskilt beløpsgrense oppgitt i punktet');
    const motor = source(id, 'innbo.motorredskap.grense', 2);
    assert.match(motor.value, /Gressklipper, snø- og jordfreser.*ikke kan kjøres fortere enn 10 km\/t/);
    assert.match(motor.value, /ingen særskilt beløpsgrense/);
    assert.equal(fact(id, 'innbo.hobbyveksthus.grense').value, id === std ? '20 000 kr' : '40 000 kr');
  }
});

test('R-030-04 GAP-5007/5039: fixtures own-funded100k/unspecified, tenancy-loss or unrepaired, rooms20k/40k', () => {
  for (const id of ids) {
    const f = source(id, 'innbo.tilleggsinnredning.grense', 2);
    for (const text of ['Leid/sameid', 'borettslag', 'luft-luft-varmepumper', 'fastmontert kjøleaggregat',
      'egenbekostet', 'leieforholdet opphører som følge av skade', 'ikke repareres som del av bygningsskaden',
      'skade som alene rammer integrerte hvitevarer']) assert.ok(f.value.toLowerCase().includes(text.toLowerCase()), text);
    assert.match(f.value, id === std ? /innredning inntil 100 000 kr.*20 000 kr/ : /ingen særskilt beløpsgrense.*40 000 kr/);
    if (id === top) assert.doesNotMatch(f.value, /100 000/);
  }
});

test('R-030-05 GAP-5013/5046: glass/sanitary/plate has own trigger, not just a deductible', () => {
  const s = source(std, 'glass.sanitaer.dekning', 3);
  assert.match(s.value, /leid\/sameid bolig.*borettslagleilighet.*bruddskade.*dører\/vinduer.*sanitærporselen.*platetopp for innbygging/i);
  assert.match(s.value, /Riper og avskallinger.*utett\/punktert isolerglass.*uansett årsak/);
  const t = source(top, 'glass.sanitaer.dekning', 2);
  assert.match(t.source.section, /4\.10 side 5/);
  assert.match(t.value, /innvendige vegger.*sanitærporselen etter §4\.10.*kjent årsak\/tidspunkt.*kosmetiske.*punktert\/utett/);
  assert.doesNotMatch(t.value, /platetopp|§4\.3/);
  assert.equal(t.replacesBase, true);
});

test('R-030-06 GAP-5014: Standard weather exact trigger/geography/exclusions with scoped original', () => {
  const f = fact(std, weather);
  assert.equal(f.value, 'Direkte skade på forsikret innbo ved vind svakere enn storm i Norge; skade som skyldes snøtyngde, snøpress eller ras fra tak følger forsikringens ordinære geografiske område. Hobbyveksthus, lagringstelt og plasthall er unntatt fra begge værdekningene. Utgifter til vedlikehold og forbedringer erstattes ikke');
  assert.equal(f.source.documentId, 'fremtindInnboStandardVaer');
  assert.equal(f.source.page, 3);
  assert.match(f.source.section, /2\.2–2\.3 side 1/);
  const s = productCatalog.sources[f.source.documentId];
  assert.equal(s.sha256, hashes['Vilkar_Standard_Innbo.pdf']);
  assert.equal(s.sourceType, 'full_terms');
  assert.deepEqual(s.productIds, [std]);
  assert.equal(s.insuranceType, 'Innbo');
  assert.equal(s.productVersion, '2025-01-01');
});

test('R-030-07: no general Standard Uhell and no inherited standalone Topp weather assertion', () => {
  assert.equal(facts(std).some(f => f.key === 'uhell.dekning'), false);
  assert.equal(canonicalCoverage(manual(std), 'Innbo', 'uhell.dekning').status, 'unknown');
  assert.equal(canonicalCoverage(manual(std), 'Innbo', weather).status, 'selected');
  assert.equal(facts(top).some(f => f.key === weather), false);
  assert.equal(canonicalCoverage(manual(top), 'Innbo', weather).status, 'unknown');
  assert.equal(canonicalCoverage(manual(top), 'Innbo', 'uhell.dekning').status, 'selected');
  assert.equal(facts(top).filter(f => f.key === 'uhell.dekning').length, 1);
  assert.equal(fact(top, 'uhell.dekning').source.documentId, 'fremtindInnboTopp');
});

test('R-030-08 GAP-5024/5065: FG operative reductions3000/4000 and rainwater prevention0', () => {
  for (const id of ids) {
    const f = source(id, 'sikkerhet.brann', id === std ? 5 : 8);
    assert.match(f.value, id === std ? /inntil 3 000 kr/ : /inntil 4 000 kr/);
    for (const text of ['FG-godkjente', 'montert og i drift', 'alarmsentral', 'NEK-405-2', 'hovedinntaket',
      'innvendig rørskade', 'alene rammer', 'Ingen egenandel ved overvannskade', 'tanker/magasiner',
      'infiltrasjonsgrøfter/-dammer', 'grønne tak']) assert.ok(f.value.includes(text), text);
  }
});

test('R-030-09 GAP-5025/5066: special appliances2000 and held-out bike/FG/liability/legal/nature', () => {
  for (const id of ids) {
    const f = source(id, 'glass.sanitaer.egenandel', id === std ? 6 : 8);
    assert.equal(f.value, '2 000 kr for bruddskade på bygningsglass og sanitærporselen; særskilt egenandel for hvitevarer er også 2 000 kr');
    assert.equal(f.deductibleClassification, 'override');
    assert.equal(fact(id, 'sykkel.egenandel').value, '4 000 kr; 2 000 kr ved tyveri når sykkelen er registrert i FG-godkjent sykkelregister');
    assert.equal(fact(id, 'ansvar.egenandel').value, '4 000 kr');
    assert.equal(fact(id, 'rettshjelp.egenandel').value, '4 000 kr pluss 20 % av overskytende utgifter');
    assert.equal(fact(id, 'naturskade.egenandel').value, 'Lovbestemt egenandel; vilkåret oppgir 8 000 kr');
    assert.equal(manual(id).deductible, null);
  }
});

test('R-030-10 GAP-5028/5069: liability exceptions preserve25kmh/14ft/10HP and registered A1–A3 hobby750000SDR', () => {
  for (const id of ids) {
    const f = source(id, 'ansvar.dekning', id === std ? 7 : 9);
    for (const text of ['rullestol', 'selvgående gressklipper/snøfreser', 'ikke kan oppnå over 25 km/t',
      'hangglider/paraglider uten motor', 'til og med 14 fot', 'til og med 10 HK', 'kano/kajakk',
      'seilbrett/surfebrett', 'Drone/modellfly registrert på sikrede', 'A1, A2 og A3', 'Luftfartstilsynets regler',
      'bare under lek, hobbybruk eller konkurranser', 'objektivt ansvar inntil 750 000 SDR']) assert.ok(f.value.includes(text), text);
    assert.equal(fact(id, 'ansvar.grense').value, 'Forsikringssummen står i forsikringsbeviset');
  }
});

test('R-030-11 GAP-5045: above-ground water ingress through leaks is an explicit Topp refinement', () => {
  const f = source(top, 'vann.dekning', 3);
  assert.equal(f.replacesBase, true);
  assert.match(f.value, /over terreng gjennom utettheter i bygning/);
  assert.match(f.value, /Vanlig bruk\/søl\/kondens og sopp\/råte er unntatt/);
  assert.doesNotMatch(fact(std, 'vann.dekning').value, /over terreng|utettheter/);
});

test('R-030-12 GAP-5054: moving exclusions and transport/storage100k remain separate from Uhell', () => {
  const f = source(top, 'flytting.transport.grense', 4);
  for (const text of ['Norden', 'bygning/container ved midlertidig lagring', 'transport inntil 100 000 kr',
    'enkeltgjenstand/samling inntil 100 000 kr', 'smykker, edelt metall og klokker fra motorkjøretøy/tilhenger',
    'underslag/bedrageri', 'kosmetiske', 'tilhenger og hobbyveksthus', 'penger/verdipapirer',
    'piano/flygel', 'dyr/planter']) assert.ok(f.value.includes(text), text);
  assert.equal(facts(std).some(f => f.key === 'flytting.transport.grense'), false);
});

test('R-030-13 GAP-5056: Topp Uhell has exact excluded objects and aquarium exception', () => {
  const f = source(top, 'uhell.dekning', 5);
  assert.match(f.value, /^Tilfeldig og plutselig ytre fysisk skade med kjent årsak og tidspunkt/);
  for (const text of ['§§4.1–4.9', 'sykkel og små elektriske kjøretøy under bruk',
    'ski-, vann- og luftsportutstyr under bruk', 'modellfly og droner', 'hobbyveksthus, lagringstelt og plasthall',
    'motorkjøretøy/tilhenger', 'mobiltelefon', 'frimerker/mynter/penger/verdipapirer', 'yrkesløsøre/varer',
    'utleiet løsøre', 'innsjekket bagasje', 'utvendig basseng/boblebad', 'dyr, likevel erstattes innhold i akvarium ved bruddskade']) assert.ok(f.value.includes(text), text);
  assert.equal(fact(top, 'uhell.grense').value, '50 000 kr');
});

test('R-030-14 GAP-5057: Topp Uhell preserves excluded causes, lost/unknown/cosmetic and reconstruction', () => {
  const f = fact(top, 'uhell.dekning');
  for (const text of ['egne mangler/feil/svakheter', 'slitasje/bruk/alder', 'kjæledyr', 'kondens/fukt',
    'bakterier/insekter', 'punktert/utett isolerglass uansett årsak', 'frost',
    'Gjenglemte/forlatte/mistede ting', 'ukjent årsak', 'kosmetiske skader', 'underslag/bedrageri',
    'rekonstruksjon']) assert.ok(f.value.includes(text), text);
});

test('R-030-15: weather identity and aliases are Innbo-only, not Uhell/Hus/nature', () => {
  assert.ok(canonicalTermIdsForType('innbo').includes(weather));
  assert.equal(canonicalTermIdsForType('bolig').includes(weather), false);
  for (const name of ['Innbo – værdekning', 'Vind, snø og takras – innbo']) {
    assert.equal(normalizeTermName(name, { insuranceType: 'Innbo' }), weather);
    assert.notEqual(normalizeTermName(name, { insuranceType: 'Hus' }), weather);
    assert.notEqual(normalizeTermName(name, { insuranceType: 'Reise' }), weather);
  }
  assert.equal(normalizeTermName('Uhell', { insuranceType: 'Innbo' }), 'uhell.dekning');
});

test('R-030-16: effective weather inclusion is separate in display, same-product and both directions', () => {
  const keys = ['innbo.samling.grense', 'innbo.verdigjenstander.smykker_edelmetall.grense',
    'innbo.luftvannsport.grense', 'innbo.motorredskap.grense', 'innbo.tilleggsinnredning.grense',
    'glass.sanitaer.dekning', 'glass.sanitaer.egenandel', 'sikkerhet.brann', 'ansvar.dekning', 'vann.dekning'];
  for (const id of ids) compareBoth(id, [std, top, 'sb-innbo-super', 'frende-innbo-standard'], keys);
  compareBoth(std, [top, 'sb-innbo-super', 'frende-innbo-standard'], [weather]);
  const result = compareCatalogProducts(product(std), product(top));
  const rows = result.sections.flatMap(s => s.rows);
  assert.equal(rows.find(r => r.key === weather).second.state, 'unknown');
  assert.equal(rows.find(r => r.key === 'uhell.dekning').first.state, 'unknown');
  assert.equal(rows.find(r => r.key === 'uhell.dekning').second.state, 'included');
  const section = productComparisonView(result).find(s => s.groups.some(g => g.rows.some(r => r.key === weather)));
  assert.notEqual(section.id, 'innbo.uhell');
  const displayed = section.groups.flatMap(g => g.rows).find(r => r.key === weather);
  assert.equal(displayed.label, 'Vind, snø og takras – innbo');
  assert.match(displayed.first.text, /✓ Inkludert.*vind svakere enn storm i Norge/);
});

test('R-030-17: Uhell rejection leaves independent Standard weather effective; own rejection wins', () => {
  const rejectedUhell = enrich(std, [{ name: 'Uhell', canonicalKey: 'uhell.dekning', value: 'Ikke valgt' }]);
  assert.ok(rejectedUhell.importantTerms.some(t => t.key === weather && t.coverageOrigin === 'catalog'));
  assert.equal(canonicalCoverage(rejectedUhell, 'Innbo', 'uhell.dekning').status, 'not_selected');
  assert.equal(canonicalCoverage(rejectedUhell, 'Innbo', weather).status, 'selected');
  documentPriority(std, weather, 'Ikke valgt');
  documentPriority(std, weather, 'Kun kundens dokumenterte vinddekning på avtalt sted');
  const rejectedWeather = enrich(std, [{ name: 'Innbo – værdekning', value: 'Ikke valgt' }]);
  assert.equal(canonicalCoverage(rejectedWeather, 'Innbo', weather).status, 'not_selected');
  assert.equal(rejectedWeather.importantTerms.filter(t => t.key === weather).length, 1);
});

test('R-030-18: all changed shared facts preserve document priority, actual pricing and silent options', () => {
  for (const id of ids) {
    for (const key of ['innbo.samling.grense', 'innbo.tilleggsinnredning.grense', 'glass.sanitaer.egenandel', 'vann.dekning']) {
      documentPriority(id, key, 'Kundens uttrykkelige avtalte verdi');
    }
    const m = manual(id);
    assert.equal(m.annualPremium, null);
    assert.equal(m.deductible, null);
    assert.deepEqual(m.addOnIds, []);
  }
  documentPriority(top, 'uhell.dekning', 'Ikke valgt');
});

test('R-030-19: exact source applicability rejects Topp, wrong provider/type/scope/version', () => {
  for (const changed of [{ productId: top }, { providerId: 'if' }, { insuranceType: 'Hus' },
    { agreementScope: 'nito' }, { agreementScope: 'lofavor' }, { version: '2024-01-01' }]) {
    const candidate = { ...product(std), ...changed, inheritsProductId: undefined };
    assert.equal(resolveCatalogFacts(candidate, [], date).some(f => f.key === weather), false);
  }
  for (const scope of ['nito', 'lofavor']) assert.equal(findCatalogProductBySelection('Fremtind', 'Innbo', 'Innbo', scope), null);
  for (const p of productCatalog.products.filter(p => !ids.includes(p.productId))) {
    assert.equal(resolveCatalogFacts(p, [], date).some(f => f.key === weather), false, p.productId);
  }
});

test('R-030-20: ordinary geography, nature, artwork, optional choice and level caps stay distinct', () => {
  for (const id of ids) {
    assert.equal(fact(id, 'innbo.geografi').value, 'Forsikringsstedet; midlertidig inntil 3 år i Norden og på nytt bosted etter flytting');
    assert.equal(fact(id, 'naturskade.dekning').value, 'Naturskade etter eget lovvilkår; antenner og markiser omfattes når fastmontert');
    assert.equal(fact(id, 'innbo.kunst.grense').source.documentId, 'fremtindInnboStandard');
    for (const channel of [null, 'Eika', 'SpareBank 1', 'DNB']) {
      assert.deepEqual(resolveCatalogFacts(product(id), [], date, channel), facts(id));
    }
  }
  assert.equal(fact(std, 'innbo.lagring.grense').value, '100 000 kr');
  assert.equal(fact(top, 'innbo.lagring.grense').value, '350 000 kr');
  assert.equal(fact(top, 'mobil.egenandel').value, '2 000 kr');
});
