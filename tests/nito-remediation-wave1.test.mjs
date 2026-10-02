import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { productCatalog, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';

const asOf = new Date('2026-09-29T10:52:14.812Z');
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = (id, addons = []) => resolveCatalogFacts(product(id), addons, asOf);
const fact = (id, key, addons = []) => facts(id, addons).find(f => f.key === key);
const rows = (a, b) => compareCatalogProducts(product(a), product(b)).sections.flatMap(s => s.rows);
const hash = path => createHash('sha256').update(readFileSync(new URL('../' + path, import.meta.url))).digest('hex');

// B-001 / GAP-2361: own Delkasko package lacks the Kasko holiday-rental clause.
test('B-001: public source identities remain the reviewed Delkasko and Kasko originals', () => {
  assert.equal(hash('catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf'), '45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7');
  assert.equal(hash('catalog/sources/mc-bobil/gjensidige-mc-kasko-vilkar.pdf'), '735f518bd45c6470965c1ea6be2f596b6504cee9a09c47718a629ed319db5e58');
});
test('B-001: MC Delkasko has no unsupported holiday rental and retains baggage and assistance', () => {
  for (const tier of ['ansvar', 'delkasko']) assert.equal(facts(`gjensidige-mc-${tier}`).some(f => f.key.startsWith('mc.leiekjoretoy.')), false);
  assert.match(fact('gjensidige-mc-delkasko', 'mc.bagasje.begrensning').value, /låst oppbevaringsrom/u);
  assert.match(fact('gjensidige-mc-delkasko', 'veihjelp.dekning').value, /driftsstans/u);
  assert.equal(fact('gjensidige-mc-delkasko', 'veihjelp.egenandel').value, '750 kr');
});
test('B-001: legitimate Kasko rental keeps its duration, trigger and exact source scope', () => {
  assert.equal(fact('gjensidige-mc-kasko', 'mc.leiekjoretoy.dager').value, 'Inntil 15 dager');
  assert.match(fact('gjensidige-mc-kasko', 'mc.leiekjoretoy.begrensning').value, /innen 2 virkedager; for å fullføre planlagt ferie/u);
  for (const f of facts('gjensidige-mc-kasko').filter(f => f.key.startsWith('mc.leiekjoretoy.'))) {
    assert.equal(f.source.documentId, 'mc-bobil:gjensidige-mc-kasko-vilkar.pdf:mc');
    assert.equal(f.source.page, 4);
  }
  assert.equal(fact('gjensidige-bobil-kasko', 'leiebil.dager').value, 'Inntil 15 dager');
  assert.equal(facts('gjensidige-bobil-kasko').some(f => f.key.startsWith('mc.')), false);
});
test('B-001: comparison is source-backed, side-symmetric and missing is not unavailable', () => {
  const a = 'gjensidige-mc-delkasko', b = 'gjensidige-mc-kasko';
  const f = rows(a, b).find(r => r.key === 'mc.leiekjoretoy.dekning');
  const r = rows(b, a).find(r => r.key === 'mc.leiekjoretoy.dekning');
  assert.equal(f.first.state, 'unknown'); assert.equal(f.second.state, 'included');
  assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
  assert.equal(compareCatalogProducts(product(a), product(a)).differenceCount, 0);
});
test('B-001: an explicit customer rental duration still wins over Kasko catalog', () => {
  for (const value of ['Inntil 7 dager', 'Inntil 21 dager']) {
    const result = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null,
      insurances: [{ type: 'MC', productName: 'Kasko', canonicalProductName: 'Kasko', annualPremium: null, deductible: null,
        coverageSummary: null, addOns: [], importantTerms: [{ name: 'Leie-MC – antall dager', value, canonicalKey: 'mc.leiekjoretoy.dager' }] }] });
    const term = result.insurances[0].importantTerms.find(f => f.key === 'mc.leiekjoretoy.dager');
    assert.equal(term.value, value); assert.equal(term.coverageOrigin, 'document');
  }
});

// B-002 / GAP-5106: Standard excludes decoration; Topp explicitly adds it.
test('B-002: Standard exclusion and Topp inclusion use their own clause and page', () => {
  assert.equal(hash('catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf'), '6c77bd57259d8d01390bccaf415f14f6b245e45345b597b6f651574ebaeebec3');
  const s = fact('fremtind-hus-standard', 'hus.bygninger.utsmykning');
  const t = fact('fremtind-hus-topp', 'hus.bygninger.utsmykning');
  assert.equal(s.coverageAvailability, 'unavailable'); assert.match(s.value, /unntatt på Standard/u);
  assert.equal(s.source.documentId, 'fremtindHusStandard'); assert.equal(s.source.page, 3);
  assert.equal(t.value, 'Kunstnerisk utsmykning av bygningen omfattes.');
  assert.equal(t.source.documentId, 'fremtindHusTopp'); assert.equal(t.source.page, 1);
  assert.equal(facts('fremtind-hus-topp').filter(f => f.key === t.key).length, 1);
});
test('B-002: artwork comparison separates an explicit exclusion from an included top benefit', () => {
  const a = 'fremtind-hus-standard', b = 'fremtind-hus-topp';
  const f = rows(a, b).find(r => r.key === 'hus.bygninger.utsmykning');
  const r = rows(b, a).find(r => r.key === f.key);
  assert.equal(f.first.state, 'unavailable'); assert.equal(f.second.state, 'included');
  assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
  for (const id of [a, b]) {
    assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
    for (const addon of ['fremtind-hus-rate-insekter', 'fremtind-hus-utleie']) {
      assert.deepEqual(fact(id, f.key, [addon]), fact(id, f.key));
    }
  }
});
test('B-002: explicit customer artwork information retains document authority', () => {
  const value = 'Kunstnerisk utsmykning er særskilt avtalt i kundens dokument';
  const result = enrichExtractedAgreementWithCatalog({ company: 'Fremtind', totalAnnualPremium: null,
    insurances: [{ type: 'Hus', productName: 'Standard', annualPremium: null, deductible: null,
      coverageSummary: null, addOns: [], importantTerms: [{ name: 'Kunstnerisk utsmykning', value, canonicalKey: 'hus.bygninger.utsmykning' }] }] });
  const term = result.insurances[0].importantTerms.find(f => f.key === 'hus.bygninger.utsmykning');
  assert.equal(term.value, value); assert.equal(term.coverageOrigin, 'document');
});

// B-003 / GAP-3706, GAP-3746: young-engine fixed deductibles are not percentage minima.
test('B-003: motor/gir deductible keeps all exact age branches, basis and source', () => {
  assert.equal(hash('catalog/sources/boat-pet/if-boat-terms.pdf'), '57e7aac8542dd10bfc92611f380b68754905b6808a66590307af86517c2072ae');
  for (const id of ['if-bat-kasko', 'if-bat-super']) {
    const f = fact(id, 'bat.maskinskade.egenandel', ['if-bat-motor-gir']);
    for (const clause of ['til og med 5 år 4 000 kr', 'over 5 til og med 10 år 8 000 kr', '11 år 10 %', '12 år 20 %', '13 år 30 %', '14 år 40 %', '15 år 50 %', 'av reparasjonskostnaden', 'Minst 8 000 kr gjelder prosentgrenene', '1. januar året etter kjøp som ny']) assert.ok(f.value.includes(clause), clause);
    assert.equal(f.source.page, 6); assert.equal(f.source.section, '4.9.5');
    assert.equal(fact(id, f.key), undefined);
  }
});
test('B-003: motor/gir remains optional on both supported tiers and absent on Delkasko', () => {
  const a = 'if-bat-kasko', b = 'if-bat-super';
  const f = rows(a, b).find(r => r.key === 'bat.maskinskade.egenandel');
  const r = rows(b, a).find(r => r.key === f.key);
  assert.equal(f.first.state, 'optional'); assert.equal(f.second.state, 'optional');
  assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
  assert.equal(compareCatalogProducts(product(a), product(a)).differenceCount, 0);
  assert.equal(fact('if-bat-delkasko', f.key), undefined);
  assert.throws(() => fact('if-bat-delkasko', f.key, ['if-bat-motor-gir']), /Ugyldig eller ikke gyldig tilleggsdekning/u);
});
test('B-003: explicit customer deductible wins over optional catalog branches', () => {
  for (const value of ['6 500 kr', '12 500 kr']) {
    const result = enrichExtractedAgreementWithCatalog({ company: 'If', totalAnnualPremium: null,
      insurances: [{ type: 'Båt', productName: 'Kasko', annualPremium: null, deductible: null, coverageSummary: null,
        addOns: [{ name: 'Motor- og girskade', annualPremium: null, deductible: null, importantTerms: [] }], addOnIds: ['if-bat-motor-gir'],
        importantTerms: [{ name: 'Maskinskade – egenandel', value, canonicalKey: 'bat.maskinskade.egenandel' }] }] });
    const term = result.insurances[0].importantTerms.find(f => f.key === 'bat.maskinskade.egenandel');
    assert.equal(term.value, value); assert.equal(term.coverageOrigin, 'document');
  }
});

function assertSwap(a, b, key) {
  const f = rows(a, b).find(r => r.key === key), r = rows(b, a).find(r => r.key === key);
  assert.ok(f); assert.ok(r); assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
  for (const id of [a, b]) assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
}
function assertDocument(id, key, value) {
  const p = product(id), f = fact(id, key);
  const result = enrichExtractedAgreementWithCatalog({ company: p.company, totalAnnualPremium: null,
    insurances: [{ type: p.insuranceType, productName: p.name, annualPremium: null, deductible: null, coverageSummary: null,
      addOns: [], importantTerms: [{ name: f.label, value, canonicalKey: key }] }] });
  const term = result.insurances[0].importantTerms.find(f => f.key === key);
  assert.equal(term.value, value); assert.equal(term.coverageOrigin, 'document');
}
// B-004: medical accident trigger is independent of cancellation severity.
test('B-004: all If Reise levels use the unqualified accident trigger from §5.1', () => {
  assert.equal(hash('catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf'), '1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566');
  for (const tier of ['basis', 'standard', 'super']) {
    const f = fact(`if-reise-${tier}`, 'reise.medisinsk.behandling');
    assert.match(f.value, /uventet akutt sykdom eller ulykkesskade/u); assert.doesNotMatch(f.value, /alvorlig/u);
    assert.equal(f.source.page, 13); assert.equal(f.source.documentId, 'ifReiseTerms');
    assert.match(fact(`if-reise-${tier}`, 'reise.medisinsk.kjent').value, /kjent før avreise/u);
  }
  assert.match(fact('if-reise-standard', 'reise.avbestilling.dekning').value, /alvorlig ulykkesskade/u);
});
test('B-004: baggage safety applies only to Standard and Super; Basis negatives survive', () => {
  assert.equal(fact('if-reise-basis', 'reise.sikkerhet.reisegods'), undefined);
  for (const key of ['reise.bagasje.dekning', 'reise.forsinkelse.rute']) assert.match(fact('if-reise-basis', key).value, /Ikke inkludert/u);
  for (const tier of ['standard', 'super']) assert.match(fact(`if-reise-${tier}`, 'reise.sikkerhet.reisegods').value, /under tilsyn/u);
  assertSwap('if-reise-basis', 'if-reise-super', 'reise.medisinsk.behandling');
  assertSwap('if-reise-basis', 'if-reise-standard', 'reise.sikkerhet.reisegods');
});
test('B-004: customer-specific medical clause remains authoritative', () => {
  assertDocument('if-reise-standard', 'reise.medisinsk.behandling', 'Dokumentert særvilkår for medisinsk behandling');
});

// B-005: C.1.5 uses agreed sum; C.1.2 has a conditional per-event limit.
test('B-005: moving sum has no invented per-item maximum and preserves the conditional rule', () => {
  assert.equal(hash('catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf'), '926c4b93a76b49868bc596784fac9133613f80dc2487d96ab608eb73cfa90776');
  const f = fact('sb-innbo-super', 'flytting.transport.grense');
  assert.match(f.value, /^Avtalt forsikringssum/u); assert.doesNotMatch(f.value, /50 000|per gjenstand/u);
  assert.match(f.value, /utenfor boligen eller.*mistes ned, faller ned eller velter.*100 000 kr per hendelse/u);
  assert.match(f.value, /ny bolig eller lagringsplass i Norge/u);
  assert.equal(f.source.documentId, 'sbInnboSuper'); assert.equal(f.source.page, 20); assert.match(f.source.section, /C\.1\.2/u);
  assert.equal(fact('sb-innbo-standard', f.key), undefined);
});
test('B-005: moving comparison keeps Standard separate and document sums authoritative', () => {
  assertSwap('sb-innbo-standard', 'sb-innbo-super', 'flytting.transport.grense');
  for (const value of ['Avtalt sum 75 000 kr', 'Avtalt sum 125 000 kr']) assertDocument('sb-innbo-super', 'flytting.transport.grense', value);
});

// B-006: unknown vehicle + identifiable parking/time, no invented age/police condition.
test('B-006: Frende parking bonus clause follows §11.13 on Kasko and Utvidet', () => {
  assert.equal(hash('catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf'), '088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88');
  for (const id of ['frende-bil-kasko', 'frende-bil-utvidet']) {
    const f = fact(id, 'bonus.parkert'); assert.match(f.value, /ukjent kjøretøy.*står parkert.*bestemt parkering.*avgrenset tidsrom/u);
    assert.doesNotMatch(f.value, /seks|6 år|politi/u); assert.equal(f.source.page, 10); assert.equal(f.source.section, '11.13');
  }
  assert.deepEqual(fact('frende-bil-kasko', 'bonus.parkert'), fact('frende-bil-utvidet', 'bonus.parkert'));
  assert.equal(fact('frende-bil-delkasko', 'bonus.parkert'), undefined);
});
test('B-006: parking comparison and explicit customer terms remain stable', () => {
  // Product mode deliberately excludes customer-specific bonus.*; do not change that contract.
  const a = 'frende-bil-kasko', b = 'frende-bil-utvidet';
  assert.equal(rows(a, b).some(r => r.key === 'bonus.parkert'), false);
  assert.equal(rows(b, a).some(r => r.key === 'bonus.parkert'), false);
  for (const id of [a, b]) assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
  assertDocument('frende-bil-kasko', 'bonus.parkert', 'Dokumentert særvilkår for parkeringsskade');
});

// B-007: retain supported thawing without asserting flushing or a new exclusion.
test('B-007: both Gjensidige house levels retain thawing with its own product-page source', () => {
  assert.equal(hash('catalog/sources/gjensidige/hus/Husforsikring-produktside.html'), '32d491a3f2648199545134ff68994615f45b25f48d169bd3ff43ea61b9bad534');
  for (const id of ['gjensidige-hus', 'gjensidige-hus-pluss']) {
    const f = fact(id, 'hus.ror.tining'); assert.equal(f.value, 'Hjelp til å tine utvendige rør.');
    assert.doesNotMatch(f.label + f.value, /spyling|unntatt|ikke dekket/u);
    assert.equal(f.source.documentId, 'gjensidigeHusProduct'); assert.equal(f.source.section, 'Brann-, vann- og naturskader');
    assert.equal(facts(id).filter(f => f.key === 'hus.ror.tining').length, 1);
  }
});
test('B-007: thawing comparison preserves source and document authority in both directions', () => {
  assertSwap('gjensidige-hus', 'gjensidige-hus-pluss', 'hus.ror.tining');
  assertDocument('gjensidige-hus', 'hus.ror.tining', 'Dokumentert utvidelse av rørservice');
});
