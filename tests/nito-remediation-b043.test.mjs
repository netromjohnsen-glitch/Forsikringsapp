import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { product, fact, sourceHash, date, documentPriority, enrich } from './helpers/wave3-catalog-gate.mjs';

// B-043 / RC-019 / SCRC-010: independent source dimensions for ordinary
// Frende Reise, 01.03.2026. No new key, add-on or inherited product.
const id='frende-reiseforsikring', source='frendeReiseTerms';
const hash='a15cb9cf2a1cba6c17eb62f3793cc5f664724f66780ebb692b93775f3f922509';
const signatures=['0b8bc178065a498f','2b4c6b827f399126','2d6235f633ad6d97','627fa475ee5cedba','8909f7b07db6ef56','8eb75eca5c1b28d0','951c941d72ee54fa','b8ff2d37ea4b0069','cd6d6ffabd8b62ef','cfa9c20b75d659f3','d7d3f74bec00427a','dd98a9c1ebb5593e'];
const oracle=[
 ['GAP-0325','SF-0594','reise.personer.omfang',2,['Alle forsikrede','folketrygden','folkeregistrert adresse i Norge','21 år','barnebarn/oldebarn','felles reise','ikke har egen reiseforsikring']],
 ['GAP-0326','SF-0599','reise.avbestilling.dekning',3,['uventet akutt','forverring etter at reisen er betalt','Frende kan kreve legeattest','legen må ha vurdert tilstanden før avreise','nærmeste familie','den eneste medreisende','i dennes familie','vedkommende bor i EØS','seks personer','mindre enn 14 dager']],
 ['GAP-0328','SF-0601','reise.avbestilling.dekning',3,['ikke-refunderbare transport- og overnattingsutgifter','Forhåndsbetalte arrangementer og utflukter','bare når overnattingsutgiftene erstattes']],
 ['GAP-0329','SF-0602','reise.avbestilling.dekning',3,['sannsynlige komplikasjoner, forverring eller behandlingsbehov','kjent sykdom før bestilling','etter 36. svangerskapsuke','rekonvalesens som varer lenger enn forventet','bortfalt reiseformål','hel eller delvis betaling før forsikringen ble kjøpt','flyttet fra et annet selskap som også dekker avbestilling','betaling etter avbestillingshendelsen','påbegynt reise']],
 ['GAP-0331','SF-0604','reise.forsinkelse.rute',4,['1,5 time','forhåndsbetalt transport','trafikkaos','teknisk feil/trafikkuhell i offentlig transport','teknisk feil/trafikkuhell som krever berging','første bestemmelsessted','24 timer','6 000 kr per person','først kreves av transportøren']],
 ['GAP-0333','SF-0608','reise.bagasje.dekning',5,['Egne ting','lånte/leide ting når eieren krever erstatning','arbeidsgivers ting er unntatt','Tyveri, ran, skadeverk','trafikk-/båtuhell','brann, vannlednings-/naturskade','transportørens ansvar går foran']],
 ['GAP-0334','SF-0611','reise.bagasje.dekning',5,['koffert/bag','rift, hull, svimerker, hakk, riper, avskallinger, flekker','slitasje, forbruk','væskesøl på innsjekket bagasje','kjøretøy/båt med tilbehør, nøkler og tilhenger','luftsportsutstyr og droner i bruk','ufortollede tollpliktige gjenstander','ektefelle/samboer, barn, foreldre eller søsken','ikke påvirker bruk av sykkelen','Mistet, glemt eller bortkommet']],
 ['GAP-0335','SF-0620','reise.medisinsk.behandling',7,['privat sykehus eller lege i Norge eller Norden','lete- og redningsaksjoner','etter hjemkomst','Ikke-akutt eller forventet','kontroll/rutinebehandling','planlagt operasjon/behandling','hjemtransport forsvarlig','etter 36. svangerskapsuke']],
 ['GAP-0336','SF-0621','reise.medisinsk.behandling',7,['legeforeskrevet fysikalsk/kiropraktisk','reseptmedisin','legeordinert hotell','Egen bil til og fra slik medisinsk behandling','5 kr per kilometer']],
 ['GAP-0340','SF-0637','reise.ulykke.dodsfall',12,['Testamentarisk begunstigelse','kapittel 15','ektefelle eller barn etter § 15-1','samboer hvis det ikke finnes ektefelle eller barn','Uten testamentarisk begunstiget, ektefelle, samboer eller barn utbetales ikke erstatning','skilt eller separert','Tidligere invaliditetserstatning']],
 ['GAP-0341','SF-0638','reise.ulykke.dekning',11,['brudd i ryggsøylen påvist ved røntgen','rettmessig fører eller passasjer','ICD-10 F43.1 (PTSD)','livsvarig medisinsk invaliditet som erstattes','behandlingen gjelder en omfattet ulykkesskade','barn under 16 år','Insektsstikk','hjerte-/karsykdom, kreft eller artritt','selv om ulykkesskade er årsaken']],
 ['GAP-0342','SF-0642','reise.rettshjelp.dekning',14,['privat tvist','reise utenfor Norden','Yrke, næring, styreoppdrag og eierskap/feste av fast eiendom','yrkesskadeforsikringsloven','etter at saken er brakt inn for domstolene']],
];
const own=key=>fact(id,key);

test('R-043-SOURCE: frozen hashes, exact 12 signatures and 12 GAP/SF bindings, scope and pages',async()=>{
 sourceHash('catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf',hash);
 for(const s of Object.values(productCatalog.sources).filter(s=>s.id.startsWith('frendeReise')))
  sourceHash('catalog/sources/frende/reise/'+s.filename,s.sha256);
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-043');
 assert.deepEqual(batch.signature_ids,signatures);assert.equal(batch.P1_signature_count,12);assert.equal(batch.P2_piggyback_count,0);
 assert.deepEqual(batch.dependencies,[]);assert.deepEqual(batch.root_cause_ids,['RC-019']);assert.deepEqual(batch.original_root_cause_ids,['SCRC-010']);
 assert.deepEqual(batch.evidence.map(e=>[e.finding_id,e.source_fact_id]),oracle.map(e=>e.slice(0,2)));
 for(const e of batch.evidence){assert.equal(e.sha256,hash);assert.equal(e.product_identity,JSON.stringify(['frende','reise','ordinary',id,'2026-03-01']));}
 const s=productCatalog.sources[source];assert.equal(s.sha256,hash);assert.equal(s.url,'https://api.frende.no/documents/terms/public/pnc/TravelInsurance');
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf',import.meta.url))});
 try{const pdf=await parser.getText();assert.equal(pdf.total,17);
  const page=n=>pdf.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');
  const quotes={2:['Alle må være medlem av folketrygden','folkeregistrert adresse i Norge'],3:['Legen må ha gjort vurderingen før avreisetidspunktet','Hvis vi erstatter utgifter til overnatting','bor i et EØS-land'],4:['trafikkuhell som krever berging','reisen var påbegynt'],5:['ting som arbeidsgiveren din eier','skader på sykkel som ikke påvirker bruk'],7:['privat sykehus eller lege i Norge eller Norden','fem kroner per kilometer','lete- og redningsaksjoner'],11:['fører eller passasjer','F43.1 (PTSD)'],12:['i testament har bestemt','Hvis foreldrene er skilt eller separert'],14:['yrkesskadeforsikringsloven','etter at saken er brakt inn for domstolene']};
  for(const [n,values]of Object.entries(quotes))for(const quote of values)assert.ok(page(Number(n)).includes(quote),`PDF ${n}: ${quote}`);
 }finally{await parser.destroy();}
});
for(const [gap,sf,key,page,values]of oracle)test(`R-043-${gap}/${sf}: precise source dimension`,()=>{
 const f=own(key);for(const value of values)assert.ok(f.value.includes(value),gap+': '+value);
 assert.equal(f.source.documentId,source);assert.equal(f.source.company,'Frende');assert.equal(f.source.page,page);
 assert.equal(f.source.filename,'Vilkar-reiseforsikring-01032026.pdf');assert.equal(f.source.effectiveFrom,'2026-03-01');
 assert.equal(f.source.version,'Vilkår av 01. mars 2026');assert.equal(f.source.termsNumber,'Ikke oppgitt');
 assert.equal(f.source.url,productCatalog.sources[source].url);assert.match(f.source.note,/Forsikringsbeviset går foran/);
});
test('R-043-DIMENSIONS: no cancellation condition moved into medical or treatment/dental amounts',()=>{
 assert.match(own('reise.avbestilling.dekning').source.section,/3\.1–3\.4.*side 4/);
 assert.doesNotMatch(own('reise.medisinsk.behandling').value,/før forsikringen ble kjøpt|avbestillingshendelsen|bortfalt reiseformål/);
 assert.match(own('reise.medisinsk.behandling').source.section,/6\.1.*side 6.*6\.3–6\.4/);
 assert.match(own('reise.medisinsk.tann').value,/5 000.*ulykkesskade.*1 000.*spising/);
 assert.match(own('reise.bagasje.sportsutstyr').value,/40 000.*enkeltgjenstand.*droner i bruk.*ikke påvirker bruk av sykkelen/);
 assert.match(own('reise.aktivitet.unntak').value,/forbunds-\/kretsserie og cup \(unntatt bedriftsidrett\)/);
});
test('R-043-PRIORITY: every changed canonical identity retains explicit document value and rejection',()=>{
 for(const key of new Set([...oracle.map(o=>o[2]),'reise.bagasje.sportsutstyr','reise.aktivitet.unntak']))
  for(const value of ['Kundens uttrykkelige vilkår og sum 17 777 kr','Ikke valgt'])documentPriority(id,key,value);
});
test('R-043-COMPARE: same product and both directions retain exact facts and included product state',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Reise'&&p.productId!==id&&!p.historicalProduct);
 // Registered, active comparison controls, including previously verified travel batches.
 const ids=[id,'fremtind-reise','storebrand-reise-super','frende-reiseforsikring'];
 assert.ok(peers.some(p=>p.productId===ids[1]));assert.ok(peers.some(p=>p.productId===ids[2]));
 for(const peer of new Set(ids)){
  const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows);
  const b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const [,,key]of oracle){const row=a.find(r=>r.key===key),reverse=b.find(r=>r.key===key);assert.ok(row,key);assert.ok(reverse,key);
   assert.equal(row.first.state,'included');assert.deepEqual(row.first,reverse.second);assert.deepEqual(row.second,reverse.first);
   assert.ok(row.first.facts.some(f=>f.key===key&&f.value===own(key).value));if(peer===id)assert.equal(row.different,false);
  }
 }
});
test('R-043-SCOPE: one ordinary product, exact provider/type/version, unique keys and no leaked source',()=>{
 const p=product(id);assert.equal(p.company,'Frende');assert.equal(p.insuranceType,'Reise');assert.equal(p.version,'2026-03-01');
 assert.equal(p.inheritsProductId,undefined);assert.deepEqual(availableAddOns(p,date),[]);
 assert.equal(findCatalogProduct('frende',id,p.version,{insuranceType:'Reise',agreementScope:'ordinary'}),p);
 for(const [provider,version,scope]of [['if',p.version,'ordinary'],['frende','wrong','ordinary'],['frende',p.version,'nito']])
  assert.equal(findCatalogProduct(provider,id,version,{insuranceType:'Reise',agreementScope:scope}),null);
 assert.equal(findCatalogProduct('frende',id,p.version,{insuranceType:'MC',agreementScope:'ordinary'}),null);
 const fs=resolveCatalogFacts(p,[],date);assert.equal(new Set(fs.map(f=>f.key)).size,fs.length);assert.ok(fs.every(f=>f.key.startsWith('reise.')));
 const out=enrich(id,[]);assert.deepEqual(out.addOnIds,[]);assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
 for(const peer of productCatalog.products.filter(p=>p.productId!==id))
  assert.ok(resolveCatalogFacts(peer,[],date).every(f=>f.source.documentId!==source),peer.productId);
 assert.ok(fs.every(f=>!['frendeReiseReplacedTerms2020','frendeReiseMiddleEast2026'].includes(f.source.documentId)));
});
// Positive controls PC-0257–PC-0292. These assert semantic limits and conditions,
// rather than locking mutable text/provenance with a whole-catalog fingerprint.
const controls=[
 [257,'reise.varighet.maks',/75 dager/],
 [258,'reise.varighet.enkeltreise_utvidelse',/før avreise.*én reise.*Norden, Europa eller hele verden/],
 [259,'reise.omrade.verden',/hele verden.*bostedsadressen.*jobb.*barnehage/],
 [260,'reise.omrade.ud',/Svalbard.*UD.*bestilt og betalt før/],
 [261,'reise.forsinkelse.rute',/offentlig transport.*24 timer.*6 000 kr per person/],
 [262,'reise.forsinkelse.hotell_arrangement',/åtte timers.*6 000 kr.*ikke tjenestereise/],
 [263,'reise.bagasje.uhell',/ytre fysisk skade.*ser idet.*8 000 kr per forsikringsår/],
 [264,'reise.bagasje.per_gjenstand',/40 000 kr.*tilbehør/],
 [265,'reise.bagasje.forsinket',/utreise.*6 000.*PIR/i],
 [266,'reise.bagasje.forsinket',/transitt.*overnatting.*500 kr/],
 [267,'reise.leiebil.egenandel',/Ingen generell.*personbil\/motorsykkel.*overnatting/],
 [268,'reise.leiebil.egenandel',/Bobil.*privatleie.*bildeling.*leasing.*unntatt/],
 [269,'reise.skadedyr.dekning',/VIS Forsikring.*forhåndsgodkjent.*Forebygging.*unntatt/],
 [270,'reise.skadedyr.dekning',/50 000 kr per tilfelle.*to tilfeller per år/],
 [271,'reise.medisinsk.kjent',/Falck.*plutselig og uventet/],
 [272,'reise.aktivitet.unntak',/1 G.*motorsport.*bedriftsidrett.*40 meter.*6 000/],
 [273,'reise.hjemtransport',/forhåndsgodkjent.*40 000/],
 [274,'reise.sykeledsagelse',/inntil to personer fra Norden/],
 [275,'reise.medisinsk.kriseterapi',/20 000 kr.*Norge/],
 [276,'reise.tjeneste.alarm',/Medisinsk rådgivning før reise.*informasjonstjeneste/],
 [277,'reise.reiseavbrudd',/ikke fortsettelsesforsikring/],
 [278,'reise.reiseavbrudd',/hjemtransport.*sykehus.*sengeleie.*to forhåndsbetalte/],
 [279,'reise.evakuering',/seks uker.*UD.*forhåndsgodkjent/],
 [280,'reise.veterinar',/1 000 kr per skade.*utenfor Norden.*ID-merking.*vaksinering/],
 [281,'reise.bagasje.aldersfradrag',/brukstid.*slitasje.*alder.*markedsverdi.*eldste/],
 [282,'reise.bagasje.egenandel',/Ingen egenandel.*forsikringsbeviset.*rettshjelp/],
 [283,'reise.ulykke.invaliditet',/500 000.*700 000.*75 år.*100 000.*80 år.*forholdsmessig/],
 [284,'reise.ulykke.behandling',/Norge.*tre år.*5 %.*Ingen egenandel.*tyggeskade/],
 [285,'reise.ansvar.dekning',/privatperson.*utenfor Norden.*Yrke\/næring/],
 [286,'reise.ansvar.sum',/15 000 000 kr per skadetilfelle.*per år/],
 [287,'reise.ansvar.dekning',/motorvogn\/båt\/luftfartøy.*familie.*leide\/lånte\/brukte/],
 [288,'reise.rettshjelp.sum',/100 000 kr per tvist.*økonomiske interesse/],
 [289,'reise.sikkerhet.reisegods',/tilsyn.*safe.*aldri.*innsjekket.*sykkel/],
 [290,'reise.avtale.generellevilkar',/Generelle regler.*skadeoppgjør/],
 [291,'reise.evakuering',/seks uker/],
 [292,'reise.medisinsk.graviditet',/etter 36\. svangerskapsuke/],
];
for(const [pc,key,expected]of controls)test(`R-043-PC-${String(pc).padStart(4,'0')}: preserved own-source control`,()=>{
 assert.match(own(key).value,expected);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv',import.meta.url),'utf8');
 assert.ok(registry.includes(`PC-${String(pc).padStart(4,'0')},AUDITED_POSITIVE,frende Reise`));
 if(pc===264)for(const [key,value]of Object.entries({'reise.bagasje.kontanter':'10 000','reise.bagasje.pass_billetter':'20 000','reise.bagasje.leid':'20 000','reise.bagasje.nokler':'4 000'}))assert.ok(own(key).value.includes(value));
 if(pc===270)assert.match(own('reise.skadedyr.egenandel').value,/2 000.*500/);
 if(pc===283)assert.match(own('reise.ulykke.dodsfall').value,/500 000.*150 000.*75 år.*100 000.*80 år/);
 if(pc===288)assert.match(own('reise.rettshjelp.egenandel').value,/4 000.*20 %/);
 if(pc===291)assert.equal(resolveCatalogFacts(product(id),[],date).some(f=>f.source.documentId==='frendeReiseMiddleEast2026'),false);
});
