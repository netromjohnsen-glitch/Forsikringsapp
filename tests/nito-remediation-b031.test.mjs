import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, findCatalogProductBySelection } from '../lib/product-catalog.ts';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, manual } from './helpers/wave3-catalog-gate.mjs';

// Cloud gate for archived B-031 / RC-007 / SCRC-056 / RB-52, dependent on B-023.
// Three P1 signatures, six source bindings, no P2 piggyback. Own frozen PDF,
// not another company's facts, is the oracle. Historical controls PC-0108–0110
// and PC-2111–2130 retain their product/type boundaries below and in B-023.
const signatures=['6338c1e8ef590bef','d3d2844f7b5a3ff7','fe3797ae1c9a3aaa'];
const bindings=[['GAP-5334','SF-7599'],['GAP-5342','SF-7610'],['GAP-5359','SF-7634'],['GAP-5350','SF-7622'],['GAP-5369','SF-7649'],['GAP-5367','SF-7647']];
const ids=['fremtind-mc-ansvar','fremtind-mc-delkasko','fremtind-mc-kasko'];
const hash='2698b98c7ed2b19e82ba8df52a7b14b97d94cbf98c48d55629a72d2e0a89da7e';
const url='https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_MC.pdf';
const legal='Inntil sikredes økonomiske interesse, maksimalt 100 000 kr per tvist; kan utvides til 250 000 kr ved minst tre parter på sikredes side (ektefeller/samboere regnes som én part). Finansklagenemnda: inntil 15 000 kr; forliksråd/jordskifterett: inntil 25 000 kr. Sakkyndige som ikke er oppnevnt av retten: inntil 20 % av forsikringssummen; interessetaket kan fravikes for utgifter godkjent av selskapet på forhånd';
const travel='Transport til nærmeste verksted ved dekket skade eller upåregnelig driftsstans; assistanse også hjemme. Nødvendige merutgifter til hjemreise til bosted med rimeligste kommunikasjonsmiddel ved førers/passasjers ulykkestilfelle, plutselige sykdom eller død som hindrer fortsatt reise med kjøretøyet, dekket skade eller upåregnelig driftsstopp når kjøretøyet ikke kan settes i trafikksikker stand innen rimelig tid, eller tyveri når kjøretøyet ikke kommer til rette innen rimelig tid. Etter sikredes ønske erstattes fortsatt reise til bestemmelsesstedet når dette er rimeligere enn hjemreise. Ved dekket skade, ikke driftsstans alene, utenfor Norden: forhåndsgodkjent leiebil for å følge fastlagt reiserute, inntil 350 kr per dag i maksimalt 30 dager. Drivstoff, fergetransport, veiavgifter, ekstra ulykkesforsikring og særskilt avtalt egenandel for leiebil omfattes ikke';
function provenance(f,id,page,section,version){
 assert.equal(f.source.documentId,id);assert.equal(f.source.page,page);assert.equal(f.source.section,section);
 assert.equal(productCatalog.sources[id].sha256,hash);assert.equal(f.source.url,url);assert.equal(f.source.version,version);
}
test('R-031-01: frozen own-source hash, all three signatures/six bindings and exact scope',()=>{
 sourceHash('catalog/sources/mc-bobil/fremtind-mc-terms.pdf',hash);
 const triage=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url)));
 const batch=triage.batches.find(b=>b.batch_id==='B-031');assert.deepEqual(batch.signature_ids,signatures);assert.deepEqual(batch.dependencies,['B-023']);
 assert.deepEqual(batch.evidence.flatMap(e=>e.finding_ids.map((gap,i)=>[gap,e.source_fact_ids[i]])),bindings);
 for(const id of ids){const p=product(id);assert.equal(p.providerId,'fremtind');assert.equal(p.insuranceType,'MC');assert.equal(p.agreementScope,'ordinary-sparebank1');assert.equal(p.version,null);}
});
test('R-031-02: Norden, personal owner/rightful driver and sold-object dispute on all tiers',()=>{
 for(const id of ids){const f=fact(id,'rettshjelp.dekning');assert.equal(f.value,'Rimelige og nødvendige utgifter til juridisk bistand ved tvist som personlig eier eller rettmessig bruker/fører av kjøretøyet. Ved salg og opphør av forsikringen i forbindelse med salget dekkes også tvist som tidligere eier/rettighetshaver');assert.equal(fact(id,'rettshjelp.geografi').value,'Norden');provenance(f,'mcb-ff-fremtind-mc-terms-rettshjelp',9,'Rettshjelp 1–4','FFE-003.001-003');}
});
test('R-031-03: interest cap, conditional250000, tribunals and non-court experts20%',()=>{
 for(const id of ids){const f=fact(id,'rettshjelp.grense');assert.equal(f.value,legal);provenance(f,'mcb-ff-fremtind-mc-terms-rettshjelp',10,'Rettshjelp 5.1; 4.1–4.2 side 9','FFE-003.001-003');}
});
test('R-031-04: legal deductible remains policy-selected plus20%, not an invented fixed amount',()=>{
 for(const id of ids){const f=fact(id,'rettshjelp.egenandel');assert.equal(f.value,'Avtalt egenandel i forsikringsbeviset, i tillegg 20 % av advokat- og sakkyndigutgifter');assert.equal(f.deductibleClassification,'reference');}
});
test('R-031-05: home/continued travel and separately qualified outside-Norden350/30 on Mini/Kasko',()=>{
 for(const id of ids.slice(1)){const f=fact(id,'veihjelp.dekning');assert.equal(f.value,travel);provenance(f,'mcb-ff-fremtind-mc-terms-mini',6,'Minikasko 2.4.1–2.4.2; persontransport også side 5','PMO-357.110-013');}
 assert.ok(facts(ids[0]).every(f=>!f.key.startsWith('veihjelp.')));
});
test('R-031-06: Kasko-only undisclosed under23 plus12000, no veteran animal discount',()=>{
 const f=fact(ids[2],'kasko.egenandel');assert.equal(f.value,'Egenandel fremgår av forsikringsbeviset; økes med 12 000 kr når fører er under 23 år ved skaden og slik bruk ikke er opplyst');assert.equal(f.deductibleClassification,'reference');assert.doesNotMatch(f.value,/dyr|veteran|(?<!\d)2 000/);provenance(f,'mcb-ff-fremtind-mc-terms-kasko',8,'Kasko 1.1–1.2 og 3.1','PMO-357.120-010');
 for(const id of ids.slice(0,2))assert.ok(facts(id).every(f=>!f.key.startsWith('kasko.')));
});
test('R-031-07: PC-0108/2129 Kasko350/15 stays distinct; Del does not gain general rental family',()=>{
 assert.equal(fact(ids[2],'leiebil.dager').value,'Normal reparasjonstid, maksimalt 15 dager');assert.equal(fact(ids[2],'leiebil.dagsgrense').value,'350 kr per dag');assert.match(fact(ids[2],'leiebil.dekning').value,/forhåndsgodkjennes/);
 assert.ok(facts(ids[1]).every(f=>!f.key.startsWith('leiebil.')));
});
test('R-031-08: dependency B-023 exact five nyverdi dimensions and page6 unchanged',()=>{
 const expected={'nyverdi.dekning':'Nytt kjøretøy av tilsvarende modell, type og årsmodell med fabrikkmontert tilbehør ved dekningsmessig totalskade på motorsykkel eller moped','nyverdi.alder':'Skaden må inntreffe innen 3 måneder etter at kjøretøyet som fabrikkny var registrert på eier','nyverdi.km':'Kjøretøyet må ikke ha vært kjørt over 2 000 kilometer','nyverdi.skadegrad':'Reparasjonskostnadene må overstige 80 % av nyanskaffelsesverdien på skadedagen; takstgrunnlaget er listepris hos forhandler uten rabatter eller spesialpris','nyverdi.begrensning':'Kjøretøyet må tidligere ikke ha vært utsatt for skade som overstiger 10 % av nyanskaffelsesverdien, og må ha vært registrert som fabrikkny på eier'};
 for(const id of ids.slice(1))for(const [key,value] of Object.entries(expected)){const f=fact(id,key);assert.equal(f.value,value);assert.equal(f.source.page,6);}
});
test('R-031-09: same product and both comparison directions retain qualified own facts',()=>{
 for(const id of ids)compareBoth(id,['frende-mc-kasko',...ids.filter(x=>x!==id)],['rettshjelp.dekning','rettshjelp.grense',...(id!==ids[0]?['veihjelp.dekning']:[])]);
});
test('R-031-10: document facts/rejections override catalog, no silent rider or invented premium',()=>{
 for(const id of ids){documentPriority(id,'rettshjelp.grense','77 777 kr');documentPriority(id,'rettshjelp.dekning','Ikke valgt');const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);}
 for(const id of ids.slice(1))documentPriority(id,'veihjelp.dekning','Ikke valgt');documentPriority(ids[2],'kasko.egenandel','4 444 kr');
});
test('R-031-11: historical PC-0109/0110/2111–2130 held-out positive controls',()=>{
 for(const id of ids){assert.equal(fact(id,'avtale.geografi').value,'Europa, Tyrkia og Israel');assert.equal(fact(id,'ansvar.person.grense').value,'Ubegrenset');assert.equal(fact(id,'ansvar.ting.grense').value,'Inntil 100 000 000 kr per skadetilfelle');assert.match(fact(id,'ulykke.invaliditet').value,/200 000.*1 000 000.*under 20/);assert.match(fact(id,'ulykke.dod').value,/100 000.*under 20.*50 000/);}
 for(const id of ids.slice(1)){assert.equal(fact(id,'mc.bagasje.grense').value,'Inntil 5 000 kr samlet');assert.match(fact(id,'mc.bagasje.dekning').value,/påmontert låsbar boks eller veske/);assert.match(fact(id,'mc.bagasje.begrensning').value,/faste husstand.*penger, smykker og klokker/);assert.equal(fact(id,'utstyr.grense').value,'Inntil 10 000 kr');assert.equal(fact(id,'veihjelp.egenandel').value,'500 kr');assert.equal(fact(id,'brann.dekning').value,'Brann, lynnedslag og eksplosjon');assert.ok(facts(id).every(f=>!f.key.startsWith('glass.')));}
 assert.match(fact(ids[2],'kasko.begrensning').value,/Maskinskade omfattes ikke/);
});
test('R-031-12: no other provider/type/scope/version acquires the MC refinements',()=>{
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId))){assert.ok(facts(p.productId).every(f=>f.value!==travel));}
 for(const scope of ['ordinary-dnb','nito','lofavor'])assert.equal(findCatalogProductBySelection('Fremtind','MC','Kasko',scope),null);
 assert.equal(product('fremtind-bobil-kasko').insuranceType,'Bobil');assert.match(fact('fremtind-bobil-kasko','kasko.egenandel').value,/dyr.*2 000/);
});
