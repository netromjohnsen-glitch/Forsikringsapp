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
// B-008: exact Super composition, not a general boatCore expansion.
test('B-008: Storebrand Super receives source-backed storage equipment and limit', () => {
  assert.equal(hash('catalog/sources/boat-pet/storebrand-boat-terms.pdf'), 'e945049a6b9fba643d9804279690fc8e1dfbb1cd4a419a81503e58fd5b959baa');
  assert.equal(fact('storebrand-bat-super', 'bat.opplagsutstyr.dekning').value, 'Inkludert');
  const f = fact('storebrand-bat-super', 'bat.opplagsutstyr.grense'); assert.equal(f.value, '20 000 kr');
  assert.equal(f.source.page, 9); assert.equal(f.source.documentId, 'boat-pet:storebrand:båt');
  assert.equal(fact('storebrand-bat-delkasko', 'bat.opplagsutstyr.dekning'), undefined);
  assert.equal(fact('storebrand-bat-kasko', 'bat.opplagsutstyr.dekning').value, 'Inkludert');
  assert.equal(fact('storebrand-bat-kasko', 'bat.ferieavbrudd.dager'), undefined);
  assert.equal(fact('storebrand-bat-super', 'bat.ferieavbrudd.dager').value, 'Inntil 30 dager');
});
test('B-008: false unknown is removed without changing Kasko or Delkasko coverage', () => {
  const f=rows('storebrand-bat-kasko','storebrand-bat-super').find(r=>r.key==='bat.opplagsutstyr.dekning');
  assert.equal(f.first.state, 'included'); assert.equal(f.second.state, 'included');
  assertSwap('storebrand-bat-kasko', 'storebrand-bat-super', f.key);
  assertSwap('storebrand-bat-delkasko', 'storebrand-bat-super', f.key);
});
test('B-008: explicit customer storage equipment limit still overrides catalog', () => {
  for (const v of ['12 000 kr', '28 000 kr']) assertDocument('storebrand-bat-super', 'bat.opplagsutstyr.grense', v);
});

const fremtindDog='sparebank1-fremtind-hund-veterin-r', fremtindTop='sparebank1-fremtind-hund-topp';
test('B-009: Fremtind dog base separates lifetime allergy and annual MR/CT limits', () => {
  assert.equal(hash('catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf'), '5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7');
  assert.match(fact(fremtindDog,'dyr.allergi.grense').value,/15 000 kr i løpet av hundens liv/u);
  assert.match(fact(fremtindDog,'dyr.diagnostikk.grense').value,/15 000 kr per forsikringsår/u);
  for(const k of ['dyr.allergi.dekning','dyr.allergi.grense','dyr.diagnostikk.dekning','dyr.diagnostikk.grense']) assert.equal(fact(fremtindDog,k).source.page,1);
  assert.match(fact('sparebank1-fremtind-katt-veterin-r','dyr.diagnostikk.grense').value,/15 000 kr per forsikringsår/u);
});
test('B-009: only selected Topp replaces sublimits; product mode retains included base and optional extension', () => {
  for(const k of ['dyr.allergi.grense','dyr.diagnostikk.grense']) {
    const selected=facts(fremtindDog,[fremtindTop]).filter(f=>f.key===k);
    assert.equal(selected.length,1);assert.match(selected[0].value,/ingen egen.*når Topp er valgt/u);assert.equal(selected[0].source.page,3);
    const f=rows(fremtindDog,'if-hund-super').find(r=>r.key===k);assert.equal(f.first.state,'included');
    assertSwap(fremtindDog,'if-hund-super',k);
  }
});
test('B-009: silent and explicitly rejected Topp do not remove base limits or select addon', () => {
  for(const importantTerms of [[],[{name:'Topp veterinærutgifter',value:'Ikke valgt'}]]) {
    const r=enrichExtractedAgreementWithCatalog({company:'Fremtind',totalAnnualPremium:null,insurances:[{type:'Hund',productName:'Veterinær',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms}]});
    assert.equal(r.insurances[0].addOnIds?.includes(fremtindTop)??false,false);
    assert.match(r.insurances[0].importantTerms.find(f=>f.key==='dyr.allergi.grense').value,/15 000 kr i løpet av hundens liv/u);
  }
  assertDocument(fremtindDog,'dyr.allergi.grense','Dokumentert livstidsgrense 18 000 kr');
});
test('B-009: a named selected Topp extends limits without overriding explicit customer values', () => {
  for(const custom of [null,'Dokumentert livstidsgrense 24 000 kr']) {
    const r=enrichExtractedAgreementWithCatalog({company:'Fremtind',totalAnnualPremium:null,insurances:[{type:'Hund',productName:'Veterinær',annualPremium:null,deductible:null,coverageSummary:null,
      addOns:[{name:'Topp veterinærutgifter',annualPremium:null,deductible:null,importantTerms:[]}],
      importantTerms:custom?[{name:'Allergi – grense',value:custom,canonicalKey:'dyr.allergi.grense'}]:[]}]});
    const i=r.insurances[0];assert.ok(i.addOnIds.includes(fremtindTop));
    const f=i.importantTerms.find(f=>f.key==='dyr.allergi.grense');
    if(custom){assert.equal(f.value,custom);assert.equal(f.coverageOrigin,'document');}
    else assert.match(f.value,/ingen egen livstidsgrense/u);
  }
});

const fremtindLife='sparebank1-fremtind-hund-liv';
test('B-010: life deduction preserves all breed groups, renewal wording and floor', () => {
  assert.equal(hash('catalog/sources/boat-pet/fremtind-dog-life-terms.pdf'), '8445f2c6faede5cfe1c6054e58cc880fc4cea1bbc31321ddc76fdbd035dcf43d');
  const start=fact(fremtindDog,'dyr.liv.reduksjon.start',[fremtindLife]);
  assert.match(start.value,/Fullvilkåret oppgir hovedforfall etter fylte 5 år.*7 år for øvrige raser og blandingshund.*9 år/u);
  for(const name of ['berner sennenhund','sanktbernhardshund','bichon havanais','toy-, dverg- og mellompuddel','whippet']) assert.ok(start.value.includes(name));
  const expiry=fact(fremtindDog,'dyr.liv.opphor',[fremtindLife]);
  assert.match(expiry.value,/hovedforfall etter fylte 8 år.*10 år for øvrige raser og blandingshund.*12 år/u);
  assert.match(fact(fremtindDog,'dyr.liv.reduksjon.sats',[fremtindLife]).value,/20 % per år av total erstatning.*1 500 kr/u);
  assert.equal(start.source.documentId,'boat-pet:sparebank1-fremtind:hund:life');assert.equal(start.source.page,1);
  assert.equal(fact(fremtindDog,start.key),undefined);
});
test('B-010: life remains optional and reduction/expiry stay separate in comparison', () => {
  for(const key of ['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats','dyr.liv.opphor']) {
    const r=rows(fremtindDog,'if-hund-super').find(r=>r.key===key);assert.equal(r.first.state,'optional');assertSwap(fremtindDog,'if-hund-super',key);
  }
});
test('B-010: explicit customer life reduction age still has priority', () => {
  const value='Dokumentert særvilkår: reduksjon fra 11 år';
  const r=enrichExtractedAgreementWithCatalog({company:'Fremtind',totalAnnualPremium:null,insurances:[{type:'Hund',productName:'Veterinær',annualPremium:null,deductible:null,coverageSummary:null,
    addOns:[{name:'Død, tap og tyveri',annualPremium:null,deductible:null,importantTerms:[]}],importantTerms:[{name:'Liv – reduksjonsstart',canonicalKey:'dyr.liv.reduksjon.start',value}]}]});
  const f=r.insurances[0].importantTerms.find(f=>f.key==='dyr.liv.reduksjon.start');assert.equal(f.value,value);assert.equal(f.coverageOrigin,'document');
});

test('B-011: Extra replaces inherited common-storage cap with its own location rules', () => {
  assert.equal(hash('catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf'),'4cffa3b051f329da0fe178b20243a0920d2b5928e9995d485c35b58a48f1f810');
  const key='tyveri.fellesgarasje.grense', f=fact('tryg-innbo-ekstra',key);
  assert.equal(facts('tryg-innbo-ekstra').filter(f=>f.key===key).length,1);
  assert.match(f.value,/350 000 kr.*adgang fra fellesareal.*forsikringsstedet; 60 000 kr.*utenfor forsikringsstedet; 30 000 kr per skadetilfelle/u);
  assert.doesNotMatch(f.value,/15 000/u);assert.equal(f.source.documentId,'trygInnboExtra');assert.equal(f.source.page,4);
  assert.equal(fact('tryg-innbo',key).value,'15 000 kr samlet');
  assert.equal(fact('tryg-innbo','tyveri.fellesbod.grense').value,'50 000 kr');
  assert.equal(fact('tryg-innbo-ekstra','tyveri.privatbod.grense').value,'60 000 kr');
});
test('B-011: scoped limits survive swaps and explicit customer overrides', () => {
  assertSwap('tryg-innbo','tryg-innbo-ekstra','tyveri.fellesgarasje.grense');
  for(const v of ['Dokumentert særgrense 18 000 kr','Dokumentert særgrense 42 000 kr']) assertDocument('tryg-innbo-ekstra','tyveri.fellesgarasje.grense',v);
});

test('B-012: Gjensidige Bobil Kasko has own-source pest coverage without lower-tier leakage', () => {
  assert.equal(hash('catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf'),'7971a0170cf272cacec8e9da23633fa630245631d04e99f455b174dd3a2fc734');
  const key='bobil.skadedyr.dekning',f=fact('gjensidige-bobil-kasko',key);
  assert.equal(f.value,'Skader som skyldes gnagere, insekter og andre skadedyr');assert.equal(f.source.page,3);
  assert.equal(f.source.documentId,'mc-bobil:gjensidige-bobil-kasko-vilkar.pdf:bobil');
  assert.equal(fact('gjensidige-bobil-pluss',key).value,f.value);
  for(const id of ['gjensidige-bobil-ansvar','gjensidige-bobil-delkasko','gjensidige-mc-kasko']) assert.equal(fact(id,key),undefined);
  assert.equal(fact('gjensidige-bobil-kasko','bobil.fukt.dekning'),undefined);
});
test('B-012: pest false unknown closes in both directions while document exclusions win', () => {
  const key='bobil.skadedyr.dekning',r=rows('gjensidige-bobil-kasko','gjensidige-bobil-pluss').find(r=>r.key===key);
  assert.equal(r.first.state,'included');assert.equal(r.second.state,'included');
  assertSwap('gjensidige-bobil-kasko','gjensidige-bobil-pluss',key);
  assertDocument('gjensidige-bobil-kasko',key,'Ikke dekket etter dokumentert særvilkår');
});

test('B-013: Storebrand house deductions preserve material and indoor-electric scope', () => {
  assert.equal(hash('catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf'),'d69c9ec3fc2edfd71c625dfcf9d19dc801dadfb3f627bc0105a78891a3eacd61');
  for(const id of ['storebrand-hus-standard','storebrand-hus-super']) {
    for(const [key,years,percent,qualifier] of [
      ['hus.aldersfradrag.utvendige_ror',20,5,/andre materialer enn plast/u],
      ['hus.aldersfradrag.badeinnretning',2,10,/vannbasseng.*samt innvendig badeinnretning tilknyttet det elektriske/u],
    ]) {
      const f=fact(id,key);assert.match(f.value,qualifier);assert.match(f.structuredValue.exceptions.join(' '),qualifier);
      assert.equal(f.structuredValue.freeYears,years);assert.equal(f.structuredValue.annualPercent,percent);assert.equal(f.structuredValue.maximumPercent,80);
      assert.equal(f.source.page,29);assert.equal(f.source.section,'B.6.4.11');
    }
    assert.deepEqual(fact(id,'hus.aldersfradrag.bereder_pumpe').structuredValue.exceptions,[]);
    assert.equal(fact(id,'hus.aldersfradrag.integrerte_hvitevarer').structuredValue.freeYears,5);
  }
});
test('B-013: house scope qualifiers survive comparisons and customer priority', () => {
  for(const key of ['hus.aldersfradrag.utvendige_ror','hus.aldersfradrag.badeinnretning']) {
    assertSwap('storebrand-hus-standard','storebrand-hus-super',key);
    assertDocument('storebrand-hus-super',key,'Dokumentert særvilkår: 12 år uten fradrag');
  }
});

test('B-014: private vehicle parts and liability retain their own geographic scopes', () => {
  assert.equal(hash('catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf'),'df7af2a169d293e22df138e6561c4c34da854d4923596a828e14bcea7f28cf20');
  assert.equal(hash('catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf'),'4e10857cb9b7832b5661d48089a6024c3622a499d66156b6122f2010574787a1');
  for(const [id,source,page] of [['gj-innbo','gjInnboShared',6],['gj-innbo-pluss','gjInnboPlus',8]]) {
    assert.equal(fact(id,'innbo.kjoretoytilbehor.grense').value,'30 000 kr');
    const f=fact(id,'ansvar.geografi');assert.equal(f.value,'Europa');assert.equal(f.source.documentId,source);assert.equal(f.source.page,page);
    assert.match(fact(id,'innbo.fritidsbat.grense').value,/på forsikringsstedet/u);
    assert.equal(fact(id,'ansvar.grense').value,'5 000 000 kr per skadetilfelle');assert.equal(fact(id,'ansvar.egenandel').value,'4 000 kr per skadetilfelle');
  }
});
test('B-014: Plus bicycle accident/vandalism is worldwide while theft and storage remain distinct', () => {
  for(const key of ['sykkel.uhell.grense','sykkel.skadeverk.grense']) {
    const f=fact('gj-innbo-pluss',key);assert.match(f.value,/30 000 kr i hele verden utenfor boligen og privat uteareal/u);assert.match(f.value,/ritt, løp og konkurranse er unntatt/u);assert.equal(f.source.page,4);
    assert.equal(fact('gj-innbo',key),undefined);assertSwap('gj-innbo','gj-innbo-pluss',key);
  }
  assert.match(fact('gj-innbo-pluss','tyveri.utenforhjem.grense').value,/Norden/u);
  assert.match(fact('gj-innbo-pluss','tyveri.fellesbod.sykkelgrense').value,/Ingen særskilt.*i bod i bygning på forsikringsstedet/u);
  assert.match(fact('gj-innbo-pluss','sykkel.tyveri.grense').value,/30 000 kr.*utenfor bygning/u);
  assert.equal(fact('gj-innbo','tyveri.fellesbod.grense').value,'30 000 kr');
});
test('B-014: optional rent default deductible is not vandalism deductible or implicit selection', () => {
  const id='gj-innbo-pluss',key='utleie.egenandel';assert.equal(fact(id,key),undefined);
  assert.equal(fact(id,key,['gj-innbo-utleie']).value,'10 000 kr ved misligholdt husleie');
  assert.equal(fact(id,'innbo.egenandel').value,'3 000 kr');
  for(const importantTerms of [[],[{name:'Utleie',value:'Ikke valgt'}]]) {
    const r=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[{type:'Innbo',productName:'Innbo Pluss',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms}]});
    assert.equal(r.insurances[0].addOnIds?.includes('gj-innbo-utleie')??false,false);
  }
});
test('B-014: source-specific corrections preserve comparison symmetry and document authority', () => {
  for(const key of ['innbo.kjoretoytilbehor.grense','ansvar.geografi','tyveri.fellesbod.sykkelgrense']) assertSwap('gj-innbo','gj-innbo-pluss',key);
  assertDocument('gj-innbo-pluss','sykkel.uhell.grense','Dokumentert særgrense 45 000 kr');
  assertDocument('gj-innbo','ansvar.geografi','Dokumentert avtale: Norge');
});

test('B-016: Gjensidige Reise Plus replaces Standard single-item sum using its own source', () => {
  assert.equal(hash('catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf'),'97823ecfea0e62a98965bc51ebaac61ee05f3b42766333f959cf2c29ceacea04');
  const key='reise.bagasje.per_gjenstand',a=fact('gjensidige-reise',key),b=fact('gjensidige-reise-pluss',key);
  assert.match(a.value,/20 000 kr per gjenstand/u);assert.match(b.value,/40 000 kr per gjenstand/u);assert.match(b.value,/Annet reisegods enn særskilte kategorier/u);
  assert.equal(b.source.documentId,'gjensidigeReisePlussTerms');assert.equal(b.source.page,6);
  assert.equal(facts('gjensidige-reise-pluss').filter(f=>f.key===key).length,1);
  assert.match(fact('gjensidige-reise','reise.bagasje.total').value,/100 000 kr/u);
  assert.match(fact('gjensidige-reise-pluss','reise.bagasje.total').value,/Ingen generell samlet øvre sum/u);
});
test('B-016: per-item improvement remains distinct from total and explicit customer sums', () => {
  const key='reise.bagasje.per_gjenstand';assertSwap('gjensidige-reise','gjensidige-reise-pluss',key);
  for(const value of ['Dokumentert 25 000 kr per gjenstand','Dokumentert 55 000 kr per gjenstand']) assertDocument('gjensidige-reise-pluss',key,value);
});

// B-019: general travel eligibility is independent of each subcoverage's conditions.
test('B-019: Storebrand Standard and Super share explicit source-backed day-trip eligibility', () => {
  assert.equal(hash('catalog/sources/storebrand/reise/canonical/Reiseforsikring-produktside.html'), 'fc65e95caadecb0ad10d557b276e8befaf39fe5da9ebb40f70c8d3d87ce2636d');
  for (const id of ['storebrand-reise-standard', 'storebrand-reise-super']) {
    const f = fact(id, 'reise.overnatting');
    assert.equal(f.value, 'Reiser med og uten overnatting er omfattet; også dagsturer.');
    assert.equal(f.source.documentId, 'storebrandReiseProductPage');
    assert.equal(f.source.section, 'FAQ: Når gjelder reiseforsikringen?');
    assert.equal(f.coverageAvailability, undefined);
    assert.equal(facts(id).filter(f => f.key === 'reise.overnatting').length, 1);
  }
});
test('B-019: Tryg Ekstra/Premium and Storebrand overnight row is known and symmetric', () => {
  for (const a of ['tryg-reise-ekstra', 'tryg-reise-premium']) for (const b of ['storebrand-reise-standard', 'storebrand-reise-super']) {
    const row = rows(a, b).find(r => r.key === 'reise.overnatting');
    assert.equal(row.first.state, 'included'); assert.equal(row.second.state, 'included');
    assertSwap(a, b, row.key);
  }
});
test('B-019: general day trips do not erase rental car overnight or geography conditions', () => {
  assert.match(fact('storebrand-reise-super', 'reise.leiebil.egenandel').value, /minst én overnatting/u);
  assert.match(fact('storebrand-reise-standard', 'reise.omrade.verden').value, /ikke hjemme, på arbeidssted eller undervisningssted/u);
  assert.equal(fact('storebrand-reise-standard', 'reise.leiebil.egenandel').value, 'Ikke omfattet i Standard.');
});
test('B-019: explicit document overnight terms override general catalog eligibility', () => {
  for (const v of ['Dokumentert særvilkår: minst én overnatting', 'Dokumentert særvilkår: minst to overnattinger']) {
    assertDocument('storebrand-reise-standard', 'reise.overnatting', v);
    assertDocument('storebrand-reise-super', 'reise.overnatting', v);
  }
});

const delayArrival = 'reise.forsinkelse.fremmote_sum', delayDeparture = 'reise.forsinkelse.avgang_sum';
function enrichTerms(id, importantTerms) {
  const p = product(id);
  return enrichExtractedAgreementWithCatalog({ company: p.company, totalAnnualPremium: null,
    insurances: [{ type: p.insuranceType, productName: p.name, annualPremium: null, deductible: null,
      coverageSummary: null, addOns: [], importantTerms }] });
}
test('B-017: active Fremtind separates missed transport from delayed departure and combined cap', () => {
  assert.equal(hash('catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf'), '2e410ce7bb27c5d355f564d4fd44c88e28e5199448cb691f139440cacc8d4267');
  const a = fact('fremtind-reise', delayArrival), d = fact('fremtind-reise', delayDeparture);
  assert.match(a.value, /for sent til forhåndsbetalt offentlig transport.*overnatting inntil 6 000 kr per person per skadetilfelle; innhenting av reiseruten uten øvre sum/u);
  assert.doesNotMatch(a.value, /24 timer/u);
  assert.match(d.value, /ikke går til avtalt tid.*overnatting og innhenting av reiseruten samlet inntil 6 000 kr per person per skadetilfelle/u);
  assert.match(d.value, /Merutgifter til innhenting.*innen 24 timer/u);
  for (const f of [a, d]) { assert.equal(f.source.documentId, 'fremtindReiseUnifiedTerms'); assert.equal(f.source.page, 5); assert.equal(f.source.section, '8.2'); }
  assert.doesNotMatch(fact('fremtind-reise', 'reise.forsinkelse.rute').value, /ubegrenset|6 000|øvre sum/u);
});
test('B-017: unavailable checked bag branch has separate source and no four-hour requirement', () => {
  const bag = facts('fremtind-reise').filter(f => f.key === 'reise.bagasje.forsinket');
  assert.equal(bag.length, 2);
  const delayed = bag.find(f => f.source.section === '8.1'), transit = bag.find(f => f.source.section === '8.2');
  assert.match(delayed.value, /5 000 kr.*Firetimerskravet gjelder ikke jobbreise; hjemreise er unntatt/u);
  assert.match(transit.value, /500 kr per person.*ikke gir tilgang.*overnatting/u);
  assert.doesNotMatch(transit.value, /fire|4 timer|5 000/u); assert.equal(transit.source.page, 6);
  assert.match(fact('fremtind-reise', 'reise.forsinkelse.ankomst').value, /åtte timers.*500 kr per påbegynt døgn.*5 000/u);
});
test('B-017: existing delay identities compare without historical Eika fallback', () => {
  for (const key of [delayArrival, delayDeparture]) {
    assertSwap('fremtind-reise', 'tryg-reise-ekstra', key);
    for (const p of productCatalog.products.filter(p => p.productId.startsWith('eika-reise'))) {
      assert.equal(resolveCatalogFacts(p, [], asOf).some(f => f.key === key), false);
    }
  }
});
test('B-017: precise Reise labels map only in Reise, preserving generic delay', async () => {
  const { normalizeTermName } = await import('../lib/insurance-normalization.ts');
  for (const [name, key] of [['Forsinket fremmøte – sum', delayArrival], ['Forsinket avgang – sum', delayDeparture]]) {
    assert.equal(normalizeTermName(name, { insuranceType: 'Reise' }), key);
    assert.notEqual(normalizeTermName(name, { insuranceType: 'Innbo' }), key);
  }
  assert.notEqual(normalizeTermName('Forsinket reise', { insuranceType: 'Reise' }), delayArrival);
});
test('B-017: explicit precise document amounts win with alternative values', () => {
  for (const key of [delayArrival, delayDeparture]) for (const value of ['Dokumentert særvilkår: 8 000 kr', 'Dokumentert særvilkår: 11 000 kr']) assertDocument('fremtind-reise', key, value);
});
test('B-017: broad document delay blocks uncertain catalog children across repeated normalization', () => {
  const input = [{ name: 'Forsinket reise', canonicalKey: 'reise.forsinkelse.rute', value: 'Dokumentert samlet særgrense 9 000 kr' }];
  let result = enrichTerms('fremtind-reise', input);
  for (let pass = 0; pass < 2; pass++) {
    const terms = result.insurances[0].importantTerms;
    assert.equal(terms.find(f => f.key === 'reise.forsinkelse.rute').value, input[0].value);
    assert.equal(terms.some(f => [delayArrival, delayDeparture].includes(f.key)), false);
    result = enrichExtractedAgreementWithCatalog(result);
  }
});
test('B-017: broad plus explicit child retains customer child but blocks uncertain sibling', () => {
  const r = enrichTerms('fremtind-reise', [
    { name: 'Forsinket reise', canonicalKey: 'reise.forsinkelse.rute', value: 'Dokumentert særvilkår' },
    { name: 'Forsinket fremmøte – sum', canonicalKey: delayArrival, value: 'Dokumentert 13 000 kr' },
  ]).insurances[0];
  assert.equal(r.importantTerms.find(f => f.key === delayArrival).value, 'Dokumentert 13 000 kr');
  assert.equal(r.importantTerms.some(f => f.key === delayDeparture), false);
});
test('B-017: undocumented broad placeholders allow exact catalog children', () => {
  for (const value of ['Ikke dokumentert', 'Ukjent']) {
    const r = enrichTerms('fremtind-reise', [{ name: 'Forsinket reise', canonicalKey: 'reise.forsinkelse.rute', value }]);
    for (const key of [delayArrival, delayDeparture]) assert.equal(r.insurances[0].importantTerms.find(f => f.key === key).coverageOrigin, 'catalog');
  }
});
