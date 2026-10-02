import test from 'node:test';
import assert from 'node:assert/strict';
import { productCatalog, resolveCatalogFacts, findCatalogProductBySelection } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, manual, date } from './helpers/wave3-catalog-gate.mjs';

// B-028 RC-004/SCRC-006/SCRC-057, 8 P1 signatures / 14 occurrences.
// GAP-0133/SF-0251; GAP-5384/5397/5425/5461 SF-7667/7684/7719/7766;
// GAP-5405/5433/5469 SF-7696/7731/7777; GAP-5407/5435 SF-7698/7733;
// GAP-5442/5476 SF-7741/7785; GAP-5444/5480 SF-7745/7796.
const ids=['fremtind-bobil-ansvar','fremtind-bobil-minikasko','fremtind-bobil-kasko','fremtind-bobil-topp'];
const addon='fremtind-bobil-maskinskade';
const withMachine=id=>resolveCatalogFacts(product(id),[addon],date);
const machine=(id,key)=>{const f=withMachine(id).find(f=>f.key===key);assert.ok(f,key);return f;};
const originals=[
 ['catalog/sources/mc-bobil/fremtind-bobil-topp.pdf','6264e379da1b2bb8f943fb15dae8ec295572f2650863d57be818a3cd29464a0a'],
 ['catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf','0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568'],
 ['catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf','8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818'],
 ['catalog/sources/sparebank1-fremtind/Vilkar_Kasko_Bil.pdf','87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739'],
 ['catalog/sources/sparebank1-fremtind/Vilkar_maskinskade.pdf','0ad5c24b9dca610189dfcd9f10ee6a56a37fa977ed4b1da00a1725baa05d63db'],
];
const legal='Inntil sikredes økonomiske interesse, maksimalt 100 000 kr per tvist; kan utvides til 250 000 kr ved minst tre parter på sikredes side (ektefeller/samboere regnes som én part). Finansklagenemnda: inntil 15 000 kr; forliksråd/jordskifterett: inntil 25 000 kr. Sakkyndige som ikke er oppnevnt av retten: inntil 20 % av forsikringssummen';
const lease='Nybil-erstatning gjelder ikke leaset bil. Startleie erstattes forholdsmessig nedskrevet etter gjenstående leiemåneder ved dekningsmessig skade innen 1 år etter registrering som fabrikkny, ikke kjørt over 15 000 km og reparasjonskostnad over 80 % av nyanskaffelsesverdien på skadedagen (listepris uten rabatter eller spesialpris)';
test('R-028-01: all five original hashes and exact DNB Bobil scope/version',()=>{
 for(const [path,hash] of originals)sourceHash(path,hash);
 for(const id of ids){const p=product(id);assert.equal(p.providerId,'fremtind');assert.equal(p.agreementScope,'ordinary-dnb');assert.equal(p.insuranceType,'Bobil');assert.equal(p.version,'2025-09-18');}
});
test('R-028-02: legal cap retains economic interest, parties, tribunal and expert sublimits on all tiers',()=>{
 for(const id of ids){const f=fact(id,'rettshjelp.grense');assert.equal(f.value,legal);assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-ansvar');assert.equal(f.source.page,5);assert.match(f.source.section,/4\.2.*5\.1.*4\.1 side 4/);}
});
test('R-028-03: Mini tank emptying/cleaning before engine start, not engine damage',()=>{
 const f=fact(ids[1],'feilfylling.dekning');assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-minikasko');assert.equal(f.source.page,5);assert.equal(f.source.section,'Minikasko 2.4.2');
 assert.match(f.value,/Tømming og rens.*ikke har vært startet.*skade etter motorstart omfattes ikke av denne redningsytelsen/);
 assert.ok(facts(ids[0]).every(f=>!f.key.startsWith('feilfylling.')));
});
test('R-028-04: Kasko/Topp engine damage coexists with separately qualified cleaning10000 cap',()=>{
 for(const id of ids.slice(1)){assert.equal(fact(id,'feilfylling.grense').value,'Inntil 10 000 kr for tømming og rens før motorstart; grensen gjelder denne redningsytelsen, ikke Kaskos dekning av skade ved feilfylling');}
 for(const id of ids.slice(2)){assert.match(fact(id,'feilfylling.dekning').value,/Skade ved feilfylling.*dekkes av Kasko.*separat redningsytelse/);assert.equal(fact(id,'feilfylling.dekning').source.documentId,'mcb-ff-fremtind-bobil-kasko');}
});
test('R-028-05: Mini and Kasko leasing1year15000 strict80% and remaining-month settlement',()=>{
 for(const id of ids.slice(1,3)){const f=fact(id,'nyverdi.begrensning');assert.equal(f.value,lease);assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-minikasko');assert.equal(f.source.page,6);assert.equal(f.source.section,'Minikasko 3.2.2');}
 assert.ok(facts(ids[0]).every(f=>!f.key.startsWith('nyverdi.')));
 assert.equal(fact(ids[2],'nyverdi.alder').value,'Innen 1 år etter registrering som fabrikkny');assert.equal(fact(ids[2],'nyverdi.km').value,'Ikke kjørt over 15 000 km');
});
test('R-028-06: Topp leasing3years100000 remains distinct from owned-vehicle replacement and moisture',()=>{
 const f=fact(ids[3],'nyverdi.begrensning');assert.equal(f.value,lease.replace('innen 1 år','innen 3 år').replace('15 000 km','100 000 km'));assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-topp');assert.equal(f.source.page,10);
 assert.match(fact(ids[3],'nyverdi.alder').value,/3 år/);assert.match(fact(ids[3],'nyverdi.km').value,/100 000/);assert.match(fact(ids[3],'bobil.fukt.alder').value,/15 år/);
});
test('R-028-07: Kasko deductible undisclosed under23 plus12000 and animal reduction up to2000',()=>{
 for(const id of ids.slice(2)){const f=fact(id,'kasko.egenandel');assert.equal(f.value,'Egenandel fremgår av forsikringsbeviset; økes med 12 000 kr når fører er under 23 år ved skaden og slik bruk ikke er opplyst. Ved skade påført av dyr reduseres avtalt egenandel med inntil 2 000 kr');assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-kasko');assert.equal(f.source.page,8);assert.equal(f.deductibleClassification,'reference');}
});
test('R-028-08: selected machine rider has named fuel/EV/gear/steering parts and qualified battery heating',()=>{
 for(const id of ids.slice(2)){const f=machine(id,'maskinskade.dekning');assert.equal(f.source.documentId,'mcb-ff-fremtind-bobil-maskinskade');assert.equal(f.source.page,1);
  for(const part of ['motorblokk','topplokk','kamaksel','turbo','wastegate','coil','innsprøytningssystem','EGR','vannpumpe','startmotor','dynamo','lambdasonde','NOX-sensor','AdBlue','høyvoltsbatteri','DC/DC','strømveksler','batterilader','ladekontakt','stillmotor','PTC-varmer','dobbeltmasse','slavesylinder','vinkeldrev','uten mansjetter','girvelger','servopumpe'])assert.ok(f.value.includes(part),part);
  assert.match(f.value,/AC\/klimakompressor når de har kjøle-\/varmefunksjon mot høyvoltsbatteri/);
  assert.match(machine(id,'maskinskade.km').value,/200 000/);assert.match(machine(id,'maskinskade.egenandel.kilometer').value,/99 999/);}
});
test('R-028-09: machine stays optional, wrong level/provider/type/scope rejected',()=>{
 for(const id of ids)assert.ok(facts(id).every(f=>!f.key.startsWith('maskinskade.')));
 for(const id of [ids[0],ids[1],'fremtind-mc-kasko','frende-bobil-kasko'])assert.throws(()=>withMachine(id),/tilleggsdekning/);
 for(const scope of ['ordinary-sparebank1','lofavor','nito'])assert.equal(findCatalogProductBySelection('Fremtind','Bobil','Kasko',scope),null);
});
test('R-028-10: same product and reversed comparisons preserve base and optional states',()=>{
 for(const id of ids){const keys=['rettshjelp.grense',...(id!==ids[0]?['feilfylling.dekning','feilfylling.grense','nyverdi.begrensning']:[]),...(ids.slice(2).includes(id)?['kasko.egenandel']:[])];compareBoth(id,['if-bobil-kasko',...ids.filter(x=>x!==id)],keys);}
 const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
 for(const id of ids.slice(2))for(const peer of [id,'frende-bobil-kasko']){const a=rows(id,peer).find(r=>r.key==='maskinskade.dekning'),b=rows(peer,id).find(r=>r.key==='maskinskade.dekning');assert.ok(a);assert.ok(b);assert.equal(a.first.state,'optional');assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);if(id===peer)assert.equal(a.different,false);}
});
test('R-028-11: explicit document overrides/rejection win; no silent rider selection',()=>{
 for(const id of ids){documentPriority(id,'rettshjelp.grense','88 888 kr');}
 for(const id of ids.slice(1))documentPriority(id,'feilfylling.dekning','Ikke valgt');
 for(const id of ids.slice(2))documentPriority(id,'kasko.egenandel','4 444 kr');
});
test('R-028-12: manual positives, geography/contents/Topp deductible held out and MC untouched',()=>{
 for(const id of ids){const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);assert.equal(out.importantTerms.find(t=>t.key==='rettshjelp.grense').value,legal);assert.equal(fact(id,'avtale.geografi').value,'Europa, unntatt Tyrkia, Kosovo, Russland og Belarus');}
 assert.equal(fact(ids[2],'bobil.losore.grense').value,'Inntil 40 000 kr');assert.equal(fact(ids[3],'bobil.losore.grense').value,'Inntil 100 000 kr');assert.equal(fact(ids[3],'feilfylling.egenandel').value,'1 000 kr; bonustap ved bruk av forsikringen');
 assert.equal(fact('fremtind-mc-kasko','rettshjelp.grense').value,'Inntil 100 000 kr per tvist; inntil 250 000 kr ved minst tre parter på samme side');
 assert.ok(productCatalog.addOns.some(a=>a.id===addon&&a.agreementScope==='ordinary-dnb'));
});
