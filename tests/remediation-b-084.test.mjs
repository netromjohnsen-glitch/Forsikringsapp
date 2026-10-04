import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,findCatalogProduct,availableAddOns} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {vehicleObjectFacts,vehicleObjectCoverageMatrix} from '../lib/vehicle-object-catalog.ts';
import {product,facts,fact,sourceHash,date,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// B084_SOURCE_CLEAR / RC-060 / SCRC-011 / RB-10: four P1, seven bindings.
// SC-007/SR-053's two compound fire/theft signatures remain OPEN. Frozen
// camp02 own-policy assistance is separate from motor09 towing-car fallback.
const ids=['storebrand-tilhenger-brann-og-tyveri','storebrand-tilhenger-kasko'];
const file='storebrand-vilkar-campingvogn-og-tilhenger.pdf';
const sources=[
 [file,'fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8'],
 ['storebrand-tilhengerforsikring.html','378021a3e4d8dcd820dbfe9ca083d47d2719d49159e72e8152cfc71c0efc0be3'],
 ['storebrand-campingvognforsikring.html','82ef7c5c1de0d2b8e4837c260210b5b5d66766d57942aabc5da1d18be58363a0'],
 ['storebrand-vilkar-generelle.pdf','4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754'],
 ['storebrand-vilkar-motorvognforsikring.pdf','7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb'],
];
const bindings=[
 ['083aacaf64d96a6d',812,1261,0,'redning.dekning'],
 ['083aacaf64d96a6d',831,1285,1,'redning.dekning'],
 ['0f3c8f521d015563',832,1287,1,'kasko.dekning'],
 ['bd10327c68f65e94',818,1269,0,'rettshjelp.dekning'],
 ['bd10327c68f65e94',838,1295,1,'rettshjelp.dekning'],
 ['4a0b6d8d7a8c01e0',819,1270,0,'rettshjelp.grense'],
 ['4a0b6d8d7a8c01e0',839,1296,1,'rettshjelp.grense'],
];
const held=['aabc6ac929bfcc3a','d30d57137cab24e4'];
const own=(id,key)=>fact(id,'tilhenger.'+key);
const check=(f,patterns)=>{for(const pattern of patterns)assert.match(f.value,pattern);return f;};
const legalLimits=[/Samlet erstatning per tvist inntil 100 000 kr/,/flere parter er på samme side.*forsikring i ulike selskaper/,/3–10 parter på sikredes side: 250 000 kr per tvist/,/11–25: 500 000 kr/,/26–49: 750 000 kr/,/50 eller flere: 1 000 000 kr/];

function dimension(tier,key){
 const f=own(ids[tier],key);
 if(key==='redning.dekning'){
  check(f,[/Nødvendig transport av tilhenger til nærmeste verksted uten beløpsgrense/,/Reparasjon på stedet skal velges dersom dette lar seg gjøre og er billigere enn frakt til verkstedet/,tier===0?/Veihjelp gjelder i Norden/:/EØS og Sveits.*inntil 3 måneder.*Grønt kort.*ikke Tyrkia, Russland, Belarus eller Kosovo/]);
  assert.doesNotMatch(f.value,/500|750|5 000|fast sted|bilforsikring|startvansker|hjemtransport|passasjer/);
  assert.equal(f.source.page,6);assert.equal(f.source.section,'6.1.3');
  assert.equal(f.qualificationSource.page,3);assert.equal(f.qualificationSource.section,'4, fortsetter side 4');
 }else if(key==='kasko.dekning'){
  assert.equal(tier,1);check(f,[/Når Kasko er avtalt i forsikringsbeviset/,/skade på tilhengeren ved sammenstøt, utforkjøring, velt, hærverk, naturskade/,/annen tilfeldig, plutselig ytre påvirkning/,/Det samme gjelder skade forårsaket av skadedyr/,/i tillegg til Brann- og tyveriforsikring/]);
  assert.doesNotMatch(f.value,/egenandel|8 000|1 000/);assert.equal(f.source.page,6);assert.equal(f.source.section,'6.2');
 }else if(key==='rettshjelp.dekning'){
  check(f,[/Rettshjelp i Norden for privatpersonen nevnt i forsikringsbeviset/,/eier og rettmessig bruker eller fører av det forsikrede kjøretøyet/,/tvist i egenskap av eier, rettmessig bruker eller fører/,/Tvisten må som hovedregel ha oppstått mens forsikringen er i kraft/,/tidligere eier når forsikringen opphørte i forbindelse med salget/,/leasingtaker når forsikringen opphørte i forbindelse med tilbakeleveringen/]);
  assert.equal(f.source.page,12);assert.equal(f.source.section,'10.1–10.2');assert.equal(f.qualificationSource.page,13);assert.equal(f.qualificationSource.section,'10.3.1, 10.3.4–5');
 }else{
  assert.equal(key,'rettshjelp.grense');check(f,legalLimits);assert.doesNotMatch(f.value,/per person|per part|per forsikringsår/);assert.equal(f.source.page,14);assert.equal(f.source.section,'10.5');assert.equal(f.coverageAvailability,undefined);
 }
 if(key.endsWith('.dekning'))assert.equal(f.coverageAvailability,'included');
 return f;
}
function provenance(f){
 for(const s of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])]){
  assert.equal(s.documentId,'vehicle:'+file);assert.equal(s.filename,file);assert.equal(s.termsNumber,'camp02');assert.equal(s.effectiveFrom,'2026-03-01');
  if(s.version!==undefined)assert.equal(s.version,'2026-03-01');assert.match(s.url,/^https:\/\/www\.storebrand\.no\/privat\/forsikring\/.*\/vilkar-campingvogn-og-tilhenger\.pdf$/);
  assert.ok(Number.isInteger(s.page)&&s.page>=3&&s.page<=14);assert.ok(s.section);assert.match(s.note,/kundens forsikringsbevis går foran/);
 }
}
for(const [name,hash] of sources)test('R-084-HASH '+name,()=>sourceHash('catalog/sources/vehicle-extensions/'+name,hash));
test('R-084-SOURCE independent own-policy clauses, geography, roles and all five sums',async()=>{
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+file,import.meta.url))});
 try{const out=await parser.getText();assert.equal(out.pages.length,15);const page=n=>out.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');
  for(const p of [/EØS/,/Sveits/,/3 måneders/,/Grønt kort/,/delkaskoforsikring.*Norden/])assert.match(page(3),p);
  assert.match(page(4),/Tyrkia, Russland, Belarus og Kosovo/);
  for(const p of [/Nødvendig transport av campingvogn \/ tilhenger til nærmeste verksted/,/lar seg gjøre og er billigere/,/Ubegrenset i Norden/,/Når det er spesifisert i forsikringsbeviset at Kasko er avtalt/,/sammenstøt, utforkjøring, velt, hærverk, naturskade/,/tilfeldig, plutselig ytre påvirkning/,/skade forårsaket av skadedyr/])assert.match(page(6),p);
  assert.match(page(7),/Egenandelen for kaskoskader framgår av forsikringsbeviset/);
  for(const p of [/Privatperson som er nevnt i Forsikringsbeviset/,/Eier av kjøretøyet/,/Rettmessig bruker eller fører/,/Rettshjelpsforsikringen gjelder i Norden/])assert.match(page(12),p);
  for(const p of [/Tvisten må ha oppstått mens forsikringen er i kraft/,/forsikringen opphørte i forbindelse med salget/,/tidligere eier/,/forsikringen opphørte i forbindelse med tilbakelevering/,/leasingtaker/])assert.match(page(13),p);
  for(const p of [/ved hver tvist er inntil 100 000 kroner/,/flere parter på samme side/,/forsikring i ulike forsikringsselskaper/,/3-10 parter – forsikringssum pr tvist kr\. 250\.000 kroner/,/11-25 parter – forsikringssum pr tvist kr\. 500\.000 kroner/,/26-49 parter – forsikringssum pr tvist kr\. 750\.000 kroner/,/50 eller flere parter – forsikringssum pr tvist kr\. 1\.000\.000 kroner/])assert.match(page(14),p);
 }finally{await parser.destroy();}
});
test('R-084-CONTEXT motor09 fallback cannot replace own camp02 assistance',async()=>{
 sourceHash('catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf',sources[4][1]);
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+sources[4][0],import.meta.url))});
 try{const out=await parser.getText();const page=out.pages.find(p=>p.num===11).text.replace(/\s+/g,' ');assert.match(page,/Campingvogn\/tilhenger under bruk med kjøretøyet er medforsikret, hvis campingvognen\/tilhengeren ikke har annen tilsvarende dekning/);}finally{await parser.destroy();}
 for(const id of ids){assert.equal(own(id,'redning.dekning').source.termsNumber,'camp02');assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger','tilhenger.redning.dekning').status,'selected');}
});
test('R-084-SET exact four authorized signatures, seven bindings and two held compounds',()=>{
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-084');
 assert.equal(new Set(bindings.map(b=>b[0])).size,4);assert.equal(bindings.length,7);assert.equal(new Set(bindings.map(b=>b[1]+':'+b[2])).size,7);
 assert.deepEqual([...new Set([...bindings.map(b=>b[0]),...held])].sort(),[...batch.signature_ids].sort());assert.equal(batch.P1_occurrence_count,11);
});
for(const [sig,gap,sf,tier,key] of bindings)test(`R-084-${sig} GAP-${String(gap).padStart(4,'0')}/SF-${String(sf).padStart(4,'0')}`,()=>{
 const p=product(ids[tier]);assert.equal(p.providerId,'storebrand');assert.equal(p.company,'Storebrand');assert.equal(p.insuranceType,'Tilhenger');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,'2026-03-01');
 const f=dimension(tier,key);assert.equal(f.key,'tilhenger.'+key);assert.equal(facts(ids[tier]).filter(x=>x.key===f.key).length,1);provenance(f);
});
const controls=[[430,0,'sum'],[431,0,'geo'],[432,0,'admin'],[433,1,'sum'],[434,1,'geo'],[435,1,'deductible'],[436,1,'admin']];
for(const [pc,tier,kind] of controls)test('R-084-PC-'+String(pc).padStart(4,'0'),()=>{
 const id=ids[tier];switch(kind){
  case 'sum':assert.ok(!facts(id).some(f=>f.key==='tilhenger.avtale.forsikringssum'));assert.equal(enrich(id,[]).annualPremium,null);break;
  case 'geo':check(own(id,'avtale.geografi'),[/EØS og Sveits/,/Grønt kort-land i Europa inntil 3 måneder/,/unntatt Tyrkia, Russland, Belarus og Kosovo/]);if(tier===0)assert.match(own(id,'redning.dekning').value,/Veihjelp gjelder i Norden/);break;
  case 'deductible':assert.ok(!facts(id).some(f=>f.key==='tilhenger.kasko.egenandel'));assert.equal(enrich(id,[]).deductible,null);break;
  case 'admin':assert.ok(facts(id).every(f=>!/^tilhenger\.(administrasjon|fornyelse|skjønn|regress|oppgjør)\./.test(f.key)));break;
  default:assert.fail(kind);
 }
});
test('R-084-PRIORITY explicit customer values and declines win over catalog parents/details',()=>{
 for(const [, , ,tier,key] of bindings)documentPriority(ids[tier],'tilhenger.'+key,'Kundens uttrykkelige dokumentverdi');
 for(const id of ids)for(const family of ['redning','rettshjelp']){
  const out=enrich(id,[{name:own(id,family+'.dekning').label,canonicalKey:'tilhenger.'+family+'.dekning',value:'Ikke valgt'}]);
  assert.equal(canonicalCoverage(out,'Tilhenger','tilhenger.'+family+'.dekning').status,'not_selected');
  if(family==='rettshjelp')assert.ok(!out.importantTerms.some(t=>t.key==='tilhenger.rettshjelp.grense'));
 }
 const rejected=enrich(ids[1],[{name:'Kasko',canonicalKey:'tilhenger.kasko.dekning',value:'Ikke valgt'}]);assert.equal(canonicalCoverage(rejected,'Tilhenger','tilhenger.kasko.dekning').status,'not_selected');
});
test('R-084-SELECTION limit presence never selects unrelated optional coverage',()=>{
 for(const id of ids){const out=enrich(id,[{name:'Rettshjelp – grense',canonicalKey:'tilhenger.rettshjelp.grense',value:'75 000 kr per tvist avtalt'}]);assert.equal(out.addOnIds.length,0);assert.deepEqual(availableAddOns(product(id),date),[]);assert.equal(canonicalCoverage(out,'Tilhenger','tilhenger.skadedyr.dekning'),null);assert.ok(!out.importantTerms.some(t=>t.key==='tilhenger.skadedyr.dekning'));assert.equal(canonicalCoverage(out,'Tilhenger','tilhenger.naturskade.dekning').status,'unknown');const limit=out.importantTerms.find(t=>t.key==='tilhenger.rettshjelp.grense');assert.ok(limit);assert.equal(limit.value,'75 000 kr per tvist avtalt');assert.equal(limit.coverageOrigin,'document');}
 const lower=enrich(ids[0],[]);assert.equal(canonicalCoverage(lower,'Tilhenger','tilhenger.kasko.dekning').status,'unknown');assert.ok(!facts(ids[0]).some(f=>f.key==='tilhenger.kasko.dekning'));assert.equal(vehicleObjectCoverageMatrix[ids[0]]['tilhenger.kasko.dekning'],'not_included');
 assert.equal(canonicalCoverage(enrich(ids[1],[]),'Tilhenger','tilhenger.kasko.dekning').status,'selected');
 for(const id of ids)assert.ok(!facts(id).some(f=>/^tilhenger\.(naturskade|skadedyr)\.dekning$/.test(f.key)));
});
test('R-084-PROVENANCE all seven fact sources and qualifications survive both customer converters',()=>{
 for(const [, , ,tier,key] of bindings){const f=own(ids[tier],key);for(const out of [enrich(ids[tier],[]),manual(ids[tier])]){
  const t=out.importantTerms.find(t=>t.key===f.key);assert.ok(t,f.key);assert.equal(t.value,f.value);
  for(const ref of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])])assert.ok(t.sources.some(s=>Object.entries(ref).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)),f.key+' '+ref.section);
 }}
});
test('R-084-COMPARE same product and all active ordinary trailer peers in both directions',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Tilhenger'&&catalogAgreementScope(p)==='ordinary');assert.ok(peers.length>2);
 for(const id of ids)for(const peer of peers){const a=compareCatalogProducts(product(id),peer).sections.flatMap(s=>s.rows),b=compareCatalogProducts(peer,product(id)).sections.flatMap(s=>s.rows);
  for(const r of a){const back=b.find(x=>x.key===r.key);assert.ok(back,r.key);assert.deepEqual(r.first,back.second);assert.deepEqual(r.second,back.first);if(peer.productId===id)assert.equal(r.different,false);}
  for(const [, , ,tier,key] of bindings.filter(b=>ids[b[3]]===id)){const f=own(ids[tier],key),r=a.find(r=>r.key===f.key);assert.ok(r,f.key);assert.equal(r.first.state,'included');assert.ok(r.first.facts.some(x=>x.value===f.value));for(const ref of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])])assert.ok(r.first.sources.some(s=>s.documentId===ref.documentId&&s.page===ref.page&&s.section===ref.section));}
 }
 for(const id of ids){const limit=materializeCatalogProduct(product(id)).facts.find(f=>f.key==='tilhenger.rettshjelp.grense');assert.equal(limit.role,'term');assert.equal(limit.state,'included');}
});
test('R-084-SCOPE provider, object type, channel and version are exact',()=>{
 for(const id of ids){const p=product(id);for(const opts of [{insuranceType:'Tilhenger',agreementScope:'nito'},{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Snøscooter',agreementScope:'ordinary'}])assert.equal(findCatalogProduct(p.providerId,id,p.version,opts),null);assert.equal(findCatalogProduct('frende',id,p.version,{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct(p.providerId,id,'invented-version',{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.deepEqual(p.componentIds,[id]);assert.equal(p.inheritsProductId,undefined);}
});
test('R-084-HOLD no unresolved deductible choice or held-dimension rewrite is credited',()=>{
 for(const id of ids){const fs=facts(id);assert.ok(!fs.some(f=>/^tilhenger\.(redning|tyveri|kasko)\.egenandel$/.test(f.key)));assert.equal(own(id,'brann.dekning').value,'Inkludert i produktnivået');assert.equal(own(id,'tyveri.dekning').value,'Inkludert i produktnivået');
  // This unchanged legacy fire row is an OPEN applicability issue, not a
  // newly source-certified deductible. Exact preservation prevents choosing.
  assert.equal(own(id,'brann.egenandel').value,'8 000 kr dersom annet ikke fremgår av forsikringsbeviset');assert.equal(own(id,'brann.egenandel').source.section,'6.1.1');
  assert.equal(new Set(vehicleObjectFacts[id].map(f=>f.key)).size,vehicleObjectFacts[id].length);assert.ok(fs.every(f=>!f.value.includes('Felles skadeunntak i §7.21–24')));
 }
 assert.equal(held.length,2);
});
