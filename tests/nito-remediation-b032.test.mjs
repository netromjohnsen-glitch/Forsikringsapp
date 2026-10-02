import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productCatalog,findCatalogProductBySelection} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {product,facts,fact,sourceHash,compareBoth,documentPriority,manual} from './helpers/wave3-catalog-gate.mjs';

// Archived B-032 / RC-008 / SCRC-054 / RB-50: own-source six P1 bindings.
// General medical restrictions qualify the existing treatment fact rather than
// misclassifying clinics/homecoming as known disease or pregnancy. Geographical
// restrictions qualify existing geography rather than being labelled as sport.
// Cloud equivalents of own-source, held-out PC-2070–2082 and B-017 dependency gates.
const id='fremtind-reise',version='PRE-450.200-015';
const hash='2e410ce7bb27c5d355f564d4fd44c88e28e5199448cb691f139440cacc8d4267';
const signatures=['04503010dc9e3d1c','0a4c00f264f8598a','16975c6010b38998','35353fc1d7303989','ce13c233ff0847a4','f6897ce2a1eabf76'];
const bindings=[['GAP-5144','SF-7365'],['GAP-5145','SF-7369'],['GAP-5150','SF-7374'],['GAP-5159','SF-7389'],['GAP-5169','SF-7401'],['GAP-5173','SF-7405']];
const changed=['personer.omfang','omrade.verden','bagasje.verdisaker','medisinsk.behandling','aktivitet.unntak','omrade.ud','avbestilling.dekning'].map(k=>'reise.'+k);
const text=key=>fact(id,'reise.'+key).value;
test('R-032-01: own PDF hash, all six bindings/signatures, ordinary active generation',()=>{
 sourceHash('catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf',hash);
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-032');
 assert.deepEqual(b.signature_ids,signatures);assert.deepEqual(b.dependencies,['B-017']);assert.deepEqual(b.evidence.map(e=>[e.finding_id,e.source_fact_id]),bindings);
 const p=product(id);assert.equal(p.providerId,'fremtind');assert.equal(p.insuranceType,'Reise');assert.equal(p.agreementScope??'ordinary','ordinary');assert.equal(p.version,version);
});
test('R-032-02: every changed claim retains exact active full-terms provenance and page',()=>{
 const pages=[1,1,3,6,7,1,11];
 for(const [i,key] of changed.entries()){const f=fact(id,key);assert.equal(f.source.documentId,'fremtindReiseUnifiedTerms');assert.equal(f.source.version,version);assert.equal(f.source.page,pages[i]);assert.equal(f.source.url,'https://dokument.fremtind.no/vilkar/fremtind/pm/reise/Reise_PM.pdf');}
 assert.equal(productCatalog.sources.fremtindReiseUnifiedTerms.sha256,hash);
});
test('R-032-03: Nordic residence/register and Norwegian social insurance or EEA rights',()=>{
 assert.match(text('personer.omfang'),/fast bostedsadresse i Norden.*nordisk folkeregister.*norsk folketrygd eller.*EØS/);
 assert.match(text('personer.omfang'),/ektefelle, samboer, egne barn, fosterbarn, barn under vergeansvar.*husstanden.*folkeregistrert adresse hos en av foreldrene til fylte 21 år.*barnebarn og oldebarn.*alene med sikrede/);
 assert.match(text('personer.omfang'),/utenfor Norden krever særskilt avtale.*norsk folketrygd.*utstasjonertes behandlingsutgifter.*egen arbeidsgiverordning/);
});
test('R-032-04: workplace/school/military and mobile7.4 exception; over6000 and expedition scope',()=>{
 assert.match(text('omrade.verden'),/fast arbeidssted i arbeidstiden i Norden.*studiested, inkludert barnehage.*studietiden i Norden.*militærtjeneste.*disse unntakene gjelder ikke mobildekningen i punkt 7.4/);
 assert.match(text('omrade.verden'),/over 6 000 meters høyde.*ekspedisjoner.*dårlig infrastruktur.*sykehus.*helsepersonell\/transport/);
 assert.match(text('omrade.ud'),/fraråder reise til eller opphold i.*ugyldig på hele reisen/);
});
test('R-032-05: valuable group cap per loss, other objects per object/loss, bicycle theft scope',()=>{
 const value=text('bagasje.verdisaker');
 assert.match(value,/Smykker, klokker, pelsverk, bunad, elektronikk med tilbehør, musikkinstrumenter med tilbehør, sports-\/fritidsutstyr, våpen med tilbehør og kjøreutstyr.*samlet.*40 000 kr per skadetilfelle/);
 assert.match(value,/Tyveri av sykkel.*samlede grensen bare utenfor kommunen.*bosatt, har studiested eller arbeidssted.*sykkel under bruk er unntatt/);
 assert.match(value,/Kjøre-\/sikkerhetsutstyr er unntatt når det er i bruk eller oppbevares sammen med kjøretøyet/);
 assert.match(value,/Øvrige enkeltgjenstander.*40 000 kr per gjenstand per skadetilfelle/);
});
test('R-032-06: medical exclusions retain subjects and separate post-homecoming psychological benefit',()=>{
 const v=text('medisinsk.behandling');
 assert.match(v,/akutt uventet sykdom, akutt forverring av kronisk sykdom eller ulykkesskade/);
 assert.match(v,/30 døgn.*første legebesøk.*hjemtransport ikke er medisinsk forsvarlig/);
 assert.match(v,/Unntatt er utgifter etter hjemkomst til fast bopel i Norden, opphold og behandling ved private klinikker i Norden, fortsatt opphold og behandling i utlandet når hjemtransport er medisinsk forsvarlig, tolketjenester og oversettelse av legedokumenter, mat og drikke/);
 assert.match(v,/forlenget opphold eller endret reiserute.*nærmeste familie bosatt på reisemålet/);
 assert.match(v,/Psykologisk førstehjelp etter hjemkomst.*ran\/overfall.*naturkatastrofe eller terrorangrep.*egen dekning inntil 25 000 kr per skadetilfelle/);
 assert.equal(text('medisinsk.kjent'),'Utgifter som følge av kjent sykdom før avreise, planlagt behandling eller påregnelige komplikasjoner omfattes ikke.');
 assert.match(text('medisinsk.graviditet'),/fra og med uke 36 og frivillig abort/);
});
test('R-032-07: medical and accident activity lists stay qualified, strict over1G and under16',()=>{
 const v=text('aktivitet.unntak');assert.match(v,/Sykdom på reise etter punkt 10.1.*bobsleigh-aking/);assert.match(v,/Ulykkesdelen i punkt 11.1.*organiserte idrettskonkurranser.*bruttoinntekt og\/eller sponsormidler på mer enn 1 G per år/);assert.match(v,/Disse aktivitetsunntakene i ulykkesdelen gjelder ikke barn under 16 år/);assert.match(v,/dykking dypere enn 40 meter/);
 assert.equal(v.includes('fra 1 G'),false);
});
test('R-032-08: cancellation personal/family/group<=8, common itinerary, key person and property',()=>{
 const v=text('avbestilling.dekning');assert.match(v,/ikke-refunderbare forhåndsbetalte.*sikrede, eneste medreisende eller deres nærmeste familier.*inntil 8 personer.*samme avreise, hjemreise og reisemål/);assert.match(v,/nøkkelperson sikrede er avhengig av.*alvorlig skade på egen eiendom eller forretning/);assert.match(v,/Bare sikredes personlige økonomiske tap og andel for seg og medforsikrede/);
});
test('R-032-09: cancellation court summons, advice/evacuation72h and Norwegian domestic leisure advice',()=>{
 const v=text('avbestilling.dekning');assert.match(v,/sikrede, ektefelle eller eneste medreisende som meddommer eller vitne.*når reisen skulle gjennomføres/);assert.match(v,/UD-reiseråd eller lokal evakuering som gjelder 72 timer før avreise.*fritidsreiser innenlands i strid med nasjonale råd fra den norske regjeringen/);assert.match(v,/Reiser omfattet av UD-reiseråd ved bestilling eller betaling er unntatt/);
});
test('R-032-10: same-product/both directions preserve treatment and qualified cancellation coverage',()=>{
 compareBoth(id,['frende-reiseforsikring','tryg-reise-ekstra','storebrand-reise-standard','storebrand-reise-super'],changed.filter(k=>!k.endsWith('omrade.ud')&&!k.endsWith('omrade.verden')));
 const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
 for(const peer of [id,'frende-reiseforsikring'])for(const key of ['reise.omrade.verden','reise.omrade.ud']){const a=rows(id,peer).find(r=>r.key===key),b=rows(peer,id).find(r=>r.key===key);assert.ok(a);assert.ok(b);assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);if(id===peer)assert.equal(a.different,false);}
});
test('R-032-11: document restrictions/alternative amounts win; no invented rider/price',()=>{
 for(const key of changed)documentPriority(id,key,'Dokumentert særvilkår: 8 888 kr');
 documentPriority(id,'reise.avbestilling.dekning','Ikke valgt');documentPriority(id,'reise.medisinsk.behandling','Ikke valgt');
 const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);
});
test('R-032-12: B-017 split delay models and unavailable checked-bag branch unchanged',()=>{
 assert.match(text('forsinkelse.fremmote_sum'),/overnatting inntil 6 000.*innhenting av reiseruten uten øvre sum/);assert.match(text('forsinkelse.avgang_sum'),/samlet inntil 6 000.*innen 24 timer/);assert.doesNotMatch(text('forsinkelse.rute'),/6 000|øvre sum|ubegrenset/);
 const checked=facts(id).filter(f=>f.key==='reise.bagasje.forsinket');assert.equal(checked.length,2);assert.equal(checked[1].source.page,6);assert.match(checked[1].value,/500 kr per person.*overnatting/);assert.doesNotMatch(checked[1].value,/fire timer/);
});
test('R-032-13: PC-2070–2082 held-out scope, travel length, luggage, dental/accident and evacuation',()=>{
 assert.match(text('omrade.verden'),/Ansvar og rettshjelp.*bare.*utenfor Norden/);assert.match(text('varighet.maks'),/70 dager/);assert.match(text('bagasje.uhell'),/2 500.*per skadetilfelle.*Mobiltelefon, datamaskin/);assert.match(text('bagasje.forsinket'),/fire timers.*5 000.*jobbreise/);assert.match(text('medisinsk.tann'),/5 000.*1 000/);assert.match(text('ulykke.invaliditet'),/700 000.*500 000.*100 000/);assert.match(text('ulykke.dodsfall'),/150 000.*500 000.*100 000/);assert.match(text('ulykke.behandling'),/to år.*5 %/);assert.match(text('avbestilling.dyrepensjonat'),/2 500/);assert.match(text('evakuering'),/2 000.*per døgn.*150 000.*forsikringsår/);
});
test('R-032-14: no historical generation/provider/type/scope leakage',()=>{
 for(const p of productCatalog.products.filter(p=>p.productId!==id))for(const key of changed){assert.ok(facts(p.productId).filter(f=>f.key===key).every(f=>f.value!==fact(id,key).value));}
 for(const scope of ['nito','lofavor'])assert.equal(findCatalogProductBySelection('Fremtind','Reise','Reise',scope),null);
 assert.equal(product('eika-reise-p10').providerId,'fremtind-eika-legacy');assert.equal(product('eika-reise-p10').version,'P10-P10P-2025-01-01');
});
