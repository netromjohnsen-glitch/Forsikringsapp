import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,availableAddOns,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {vehicleObjectCoverageMatrix} from '../lib/vehicle-object-catalog.ts';
import {product,facts,fact,sourceHash,date,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// B-076 / RC-052 / SCRC-011 / RB-10. Independent frozen source oracles;
// SC-007/SR-053's conflicting Super contents sum deliberately remains unknown.
const ids=['storebrand-campingvogn-brann-og-tyveri','storebrand-campingvogn-kasko','storebrand-campingvogn-super'];
const files=['storebrand-vilkar-campingvogn-og-tilhenger.pdf','storebrand-campingvognforsikring.html','storebrand-vilkar-generelle.pdf'];
const hashes=['fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8','82ef7c5c1de0d2b8e4837c260210b5b5d66766d57942aabc5da1d18be58363a0','4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754'];
const bindings=[
  ['0fd1daf98e265e61', [[795,1241,2]]],
  ['128df57b17be7ad6', [[742,1174,0],[766,1202,1],[790,1232,2]]],
  ['2a72b5f3f365ce19', [[767,1203,1],[791,1233,2]]],
  ['2f8bab95ed107407', [[792,1238,2]]],
  ['3bab5adbcd71c152', [[745,1177,0],[770,1207,1]]],
  ['3ed3efa6bd8d3086', [[733,1165,0],[757,1193,1],[782,1223,2]]],
  ['5b2e4ce428a9cc46', [[750,1182,0],[775,1212,1],[800,1246,2]]],
  ['725da296a972ab3c', [[749,1181,0],[774,1211,1],[799,1245,2]]],
  ['75c5e46d265d71ec', [[741,1173,0],[765,1201,1],[789,1231,2]]],
  ['78b6564a33378fd4', [[744,1176,0],[769,1206,1]]],
  ['900ac46ae682d261', [[739,1171,0],[763,1199,1],[787,1229,2]]],
  ['9afc9b8fb2557a43', [[794,1240,2]]],
  ['a57f38d5a5182705', [[740,1172,0],[764,1200,1],[788,1230,2]]],
  ['e4932f62cb1de644', [[734,1166,0],[758,1194,1]]],
];
const own=(id,key)=>fact(id,'campingvogn.'+key);
const check=(f,patterns)=>{for(const pattern of patterns)assert.match(f.value,pattern);return f;};
const generalKeys=[['brann','tyveri','losore'],['brann','tyveri','kasko','losore'],['brann','tyveri','kasko','fukt']];
const generalPatterns=[/Felles skadeunntak i §7.21–24/,/frost og snøtyngde/,/frost og\/eller snøtyngde er en medvirkende skadeårsak/,/Fukt-, vann- eller råteskader, sprekker og utettheter/,/med mindre skaden er en direkte følge av en annen erstatningsmessig skade/,/Dersom Super er avtalt.*vann-\/fuktskader.*§6.3.2/,/sammenføyningen i isolerglass er utett/,/vibrasjoner eller vridninger ved kjøring på ujevn veibane/,/slike forhold har vært medvirkende skadeårsak/];
const contentsPatterns=[/Smykker, klokker, kunstgjenstander, penger, verdipapirer/,/mat, dagligvarer, bensin, diesel og maling/,/Tyveri av løst utstyr og personlige eiendeler i fortelt er unntatt/];
function dimension(signature,tier){const id=ids[tier];switch(signature){
 case '0fd1daf98e265e61':{const f=check(own(id,'losore.begrensning'),[...contentsPatterns,/Kaskoforsikringen omfatter ikke/,/annen tilfeldig, plutselig, ytre påvirkning/,/rammer campingvognen utenfra/]);assert.equal(f.coverageAvailability,undefined);assert.doesNotMatch(f.value,/Felles skadeunntak|30 000|100 000/);return[f];}
 case '128df57b17be7ad6':return[check(own(id,'redning.dekning'),[/For campingvogn på fast sted dekkes inntil 5 000 kr for transport til kjørbar vei og frigjøring fra bygningskonstruksjon/,/Egenandelen for veihjelp er 750 kr/])];
 case '2a72b5f3f365ce19':return[check(own(id,'kasko.dekning'),[/Når Kasko er avtalt i forsikringsbeviset/,/sammenstøt, utforkjøring, velt, hærverk, naturskade/,/annen tilfeldig, plutselig ytre påvirkning/,/skade forårsaket av skadedyr/,/i tillegg til Brann- og tyveriforsikring/])];
 case '2f8bab95ed107407':return[check(own(id,'ferie.dekning'),[/erstatningsmessig skade etter påbegynt ferietur med campingvogn/,/utgifter til alternativ overnatting/,/Kravet må dokumenteres overfor Storebrand/]),check(own(id,'ferie.grense'),[/1 500 kr per dag/,/resterende planlagt ferie/,/inntil 15 dager/])];
 case '3bab5adbcd71c152':{const f=check(own(id,'losore.begrensning'),contentsPatterns);if(tier===1)check(f,[/Kaskoforsikringen omfatter ikke/,/rammer campingvognen utenfra/]);else assert.doesNotMatch(f.value,/Kaskoforsikringen|rammer campingvognen utenfra/);return[f];}
 case '3ed3efa6bd8d3086':return[check(own(id,'fortelt.begrensning'),[/må være spesifisert i forsikringsbeviset/,/inkluderes i avtalt forsikringssum/,/Tyveri av løst utstyr og personlige eiendeler i fortelt dekkes ikke/,/Skade på elementer.*under montering eller demontering dekkes ikke/,/ikke er sammenbygget med campingvognen.*kun brann, lyn og eksplosjon/])];
 case '5b2e4ce428a9cc46':return[check(own(id,'rettshjelp.grense'),[/Samlet erstatning per tvist inntil 100 000 kr/,/flere parter er på samme side.*forsikring i ulike selskaper/,/3–10 parter på sikredes side: 250 000 kr per tvist/,/11–25: 500 000 kr/,/26–49: 750 000 kr/,/50 eller flere: 1 000 000 kr/])];
 case '725da296a972ab3c':return[check(own(id,'rettshjelp.dekning'),[/Rettshjelp i Norden/,/privatpersonen nevnt i forsikringsbeviset/,/eier og rettmessig bruker eller fører/,/tvist i egenskap av eier, rettmessig bruker eller fører/,/Tvisten må som hovedregel ha oppstått mens forsikringen er i kraft/,/tidligere eier når forsikringen opphørte i forbindelse med salget/,/leasingtaker når forsikringen opphørte i forbindelse med tilbakeleveringen/])];
 case '75c5e46d265d71ec':return[check(own(id,'redning.dekning'),[/Nødvendig transport.*til nærmeste verksted uten beløpsgrense/,/Reparasjon på stedet skal velges dersom dette lar seg gjøre og er billigere enn frakt/,tier===0?/Veihjelp gjelder i Norden/:/EØS og Sveits.*inntil 3 måneder.*Grønt kort.*ikke Tyrkia, Russland, Belarus eller Kosovo/])];
 case '78b6564a33378fd4':case '9afc9b8fb2557a43':return generalKeys[tier].map(key=>check(own(id,key+'.begrensning'),generalPatterns));
 case '900ac46ae682d261':return[check(own(id,'brann.dekning'),[/brann ved åpen flamme, lynnedslag eller eksplosjon/]),check(own(id,'brann.egenandel'),[/8 000 kr dersom annet ikke fremgår av forsikringsbeviset/])];
 case 'a57f38d5a5182705':return[check(own(id,'tyveri.dekning'),[/Tyveri eller forsøk på tyveri/,/åpenbart at det samtidig er gjort forsøk på å stjele campingvognen/,/det samme gjelder dersom det er gjort innbrudd/,/ikke som tyveri dersom den skyldige tilhører sikredes husstand/,/8 000 kr dersom ikke annet fremgår av forsikringsbeviset/])];
 case 'e4932f62cb1de644':return[check(own(id,'losore.dekning'),[/eier eller rettmessig bruker og dennes husstand/,/hendelser valgt produktnivå dekker/,/Er forsikringssummen tilstrekkelig.*andre som er med i campingvognen/]),check(own(id,'losore.grense'),[/30 000 kr samlet; 5 000 kr per gjenstand \(førsterisiko\)/,/Kamerautstyr regnes som én gjenstand/,/utvides.*må fremgå av forsikringsbeviset/])];
 default:assert.fail(signature);
}}
function provenance(f){for(const s of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])]){assert.equal(s.documentId,'vehicle:'+files[0]);assert.equal(s.filename,files[0]);assert.equal(s.termsNumber,'camp02');assert.equal(s.effectiveFrom,'2026-03-01');if(s.version!==undefined)assert.equal(s.version,'2026-03-01');assert.match(s.url,/storebrand/);assert.ok(Number.isInteger(s.page)&&s.page>=3&&s.page<=14);assert.ok(s.section);}}
for(let i=0;i<files.length;i++)test('R-076-HASH '+files[i],()=>sourceHash('catalog/sources/vehicle-extensions/'+files[i],hashes[i]));
test('R-076-SOURCE complete independent clauses and printed/physical page distinction',async()=>{
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+files[0],import.meta.url))});
 try{const out=await parser.getText();const page=n=>out.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');assert.equal(out.pages.length,15);
 assert.match(page(4),/30 000/);assert.match(page(4),/5 000/);assert.match(page(4),/Kamerautstyr/);
 assert.match(page(5),/åpen flamme/);assert.match(page(6),/750/);assert.match(page(6),/For campingvogn på fast sted dekkes inntil 5\.000 kroner for transport til kjørbar vei og frigjøring fra bygningskonstruksjon/);assert.match(page(6),/lar seg gjøre og er billigere/);
 assert.match(page(7),/nyere enn 15 år/);assert.match(page(8),/15 dager/);assert.match(page(8),/medvirkende skadeårsak/);
 for(const p of [/direkte følge av en annen erstatningsmessig skade/,/sammenføyningen i isolerglass/,/vibrasjoner eller vridninger/,/medvirkende skadeårsak/])assert.match(page(9),p);
 assert.match(page(12),/Norden/);assert.match(page(13),/opphørte i forbindelse med salget/);assert.match(page(13),/tilbakelevering/);
 for(const p of [/ved hver tvist er inntil 100 000 kroner/,/3-10 parter – forsikringssum pr tvist kr\. 250\.000 kroner/,/11-25 parter – forsikringssum pr tvist kr\. 500\.000 kroner/,/26-49 parter – forsikringssum pr tvist kr\. 750\.000 kroner/,/50 eller flere parter – forsikringssum pr tvist kr\. 1\.000\.000 kroner/])assert.match(page(14),p);
 }finally{await parser.destroy();}
});
test('R-076-SET exact 14 signatures /32 source bindings',()=>{assert.equal(bindings.length,14);const pairs=bindings.flatMap(([s,bs])=>bs.map(([g,f,t])=>[s,g,f,t]));assert.equal(pairs.length,32);assert.equal(new Set(pairs.map(x=>x.join(':'))).size,32);const triage=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url)));const batch=triage.batches.find(b=>b.batch_id==='B-076');assert.deepEqual(bindings.map(b=>b[0]).sort(),[...batch.signature_ids].sort());assert.equal(batch.P1_occurrence_count,32);});
for(const [signature,bs] of bindings)for(const [gap,sf,tier] of bs)test(`R-076-${signature} GAP-${String(gap).padStart(4,'0')}/SF-${String(sf).padStart(4,'0')}`,()=>{const p=product(ids[tier]);assert.equal(p.providerId,'storebrand');assert.equal(p.insuranceType,'Campingvogn');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,'2026-03-01');for(const f of dimension(signature,tier))provenance(f);});

const controls=[[413,0,'sum'],[414,0,'geo'],[415,0,'fortelt'],[416,0,'admin'],[417,1,'sum'],[418,1,'geo'],[419,1,'fortelt'],[420,1,'deductible'],[421,1,'admin'],[422,2,'sum'],[423,2,'geo'],[424,2,'fortelt'],[425,2,'deductible'],[426,2,'new'],[427,2,'fukt'],[428,2,'frost'],[429,2,'admin']];
for(const [pc,tier,kind] of controls)test('R-076-PC-'+String(pc).padStart(4,'0'),()=>{const id=ids[tier];switch(kind){
 case 'sum':assert.ok(!facts(id).some(f=>f.key==='campingvogn.avtale.forsikringssum'));assert.equal(enrich(id,[]).annualPremium,null);break;
 case 'geo':check(own(id,'avtale.geografi'),[/EØS og Sveits/,/Grønt kort-land i Europa inntil 3 måneder/,/unntatt Tyrkia, Russland, Belarus og Kosovo/]);break;
 case 'fortelt':check(own(id,'fortelt.begrensning'),[/spesifisert i forsikringsbeviset/,/avtalt forsikringssum/]);assert.equal(canonicalCoverage(enrich(id,[]),'Campingvogn','campingvogn.fortelt.dekning').status,'unknown');break;
 case 'deductible':assert.ok(!facts(id).some(f=>f.key==='campingvogn.kasko.egenandel'));assert.equal(enrich(id,[]).deductible,null);break;
 case 'admin':assert.ok(facts(id).every(f=>!/^campingvogn\.(administrasjon|fornyelse|skjønn|regress|oppgjør)\./.test(f.key)));break;
 case 'new':check(own(id,'nyverdi.alder'),[/tre år/,/fabrikkny på forsikringstakeren/]);check(own(id,'nyverdi.begrensning'),[/Tapt campingvogn eller reparasjon som overstiger listepris/,/gjenkjøp\/dokumentasjon/]);assert.ok(!facts(id).some(f=>f.key==='campingvogn.nyverdi.km'));break;
 case 'fukt':check(own(id,'fukt.alder'),[/Nyere enn 15 år fra produksjonsdato/]);check(own(id,'fukt.begrensning'),[/vegger, tak og gulv/,/uten anmerkninger fra forhandler\/verksted mindre enn ett år/,/ny årlig kontroll kreves/,/opphører når forsikringen opphører/]);break;
 case 'frost':check(own(id,'fukt.begrensning'),[/frost og snøtyngde/,/medvirkende skadeårsak/]);break;
 default:assert.fail(kind);
}});
test('R-076-TIERS restriction-only rows never invent parents, sums or selection',()=>{
 for(const [tier,id] of ids.entries()){const fs=facts(id);assert.equal(new Set(fs.map(f=>f.key)).size,fs.length);const out=enrich(id,[]);for(const k of ['brann','tyveri','redning','rettshjelp'])assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.'+k+'.dekning').status,'selected');assert.deepEqual(availableAddOns(product(id),date),[]);assert.ok(!fs.some(f=>/^campingvogn\.(naturskade|skadedyr|fortelt)\.dekning$/.test(f.key)));assert.equal(out.addOnIds.length,0);
 if(tier!==2){assert.ok(!fs.some(f=>/^campingvogn\.(fukt|ferie|nyverdi)\./.test(f.key)));assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.fukt.dekning').status,'unknown');}else{assert.ok(!fs.some(f=>f.key==='campingvogn.losore.dekning'||f.key==='campingvogn.losore.grense'));assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.losore.dekning').status,'unknown');assert.ok(!out.importantTerms.some(t=>t.key==='campingvogn.losore.begrensning'));}
 assert.equal(vehicleObjectCoverageMatrix[id]['campingvogn.kasko.dekning'],tier===0?'not_included':'standard');
 }
});
test('R-076-PRIORITY explicit document values and declines preserve parent/detail semantics',()=>{
 for(const [tier,id] of ids.entries()){for(const key of ['brann.dekning','tyveri.dekning','redning.dekning','rettshjelp.grense'])documentPriority(id,'campingvogn.'+key,'Kundens uttrykkelige dokumentverdi');const rejected=enrich(id,[{name:'Brann',canonicalKey:'campingvogn.brann.dekning',value:'Ikke valgt'}]);assert.equal(canonicalCoverage(rejected,'Campingvogn','campingvogn.brann.dekning').status,'not_selected');assert.ok(!rejected.importantTerms.some(t=>t.key==='campingvogn.brann.begrensning'));
 const restriction=enrich(id,[{name:'Fortelt – begrensning',canonicalKey:'campingvogn.fortelt.begrensning',value:'Kundens dokumenterte begrensning'}]);assert.equal(canonicalCoverage(restriction,'Campingvogn','campingvogn.fortelt.dekning').status,'unknown');
 if(tier!==2){documentPriority(id,'campingvogn.losore.grense','27 777 kr avtalt');documentPriority(id,'campingvogn.losore.begrensning','Kundens uttrykkelige begrensning');}
 }
 const out=enrich(ids[2],[{name:'Løsøre',canonicalKey:'campingvogn.losore.dekning',value:'Valgt i kundens forsikringsbevis'}]);assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.losore.dekning').status,'selected');assert.equal(out.importantTerms.find(t=>t.key==='campingvogn.losore.begrensning').value,own(ids[2],'losore.begrensning').value);assert.ok(!out.importantTerms.some(t=>t.key==='campingvogn.losore.grense'));
});
test('R-076-PROVENANCE parent/detail sources survive enrichment, manual and product comparison',()=>{
 for(const [tier,id] of ids.entries())for(const family of generalKeys[tier]){const f=own(id,family+'.begrensning');provenance(f);assert.ok(f.qualificationSource);for(const out of [enrich(id,[]),manual(id)]){const t=out.importantTerms.find(t=>t.key===f.key);assert.ok(t);assert.equal(t.value,f.value);for(const ref of [f.source,f.qualificationSource])assert.ok(t.sources.some(s=>Object.entries(ref).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)));}}
});
test('R-076-COMPARE same product, all ordinary peers and both directions',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Campingvogn'&&catalogAgreementScope(p)==='ordinary');assert.ok(peers.length>3);for(const id of ids)for(const peer of peers){const a=compareCatalogProducts(product(id),peer).sections.flatMap(s=>s.rows),b=compareCatalogProducts(peer,product(id)).sections.flatMap(s=>s.rows);for(const r of a){const back=b.find(x=>x.key===r.key);assert.ok(back);assert.deepEqual(r.first,back.second);assert.deepEqual(r.second,back.first);if(peer.productId===id)assert.equal(r.different,false);}for(const f of facts(id)){const row=a.find(r=>r.key===f.key);assert.ok(row,f.key);assert.ok(row.first.facts.some(x=>x.value===f.value));}}
 const m=materializeCatalogProduct(product(ids[2]));const restriction=m.facts.find(f=>f.key==='campingvogn.losore.begrensning');assert.equal(restriction.state,'included');assert.equal(restriction.role,'term');assert.ok(!m.facts.some(f=>f.key==='campingvogn.losore.dekning'||f.key==='campingvogn.losore.grense'));assert.equal(canonicalCoverage(enrich(ids[2],[]),'Campingvogn','campingvogn.losore.dekning').status,'unknown');
});
test('R-076-SCOPE company, product type, scope, version and neighbouring objects remain separate',()=>{
 for(const id of ids){const p=product(id);for(const opts of [{insuranceType:'Campingvogn',agreementScope:'nito'},{insuranceType:'Snøscooter',agreementScope:'ordinary'},{insuranceType:'Tilhenger',agreementScope:'ordinary'}])assert.equal(findCatalogProduct(p.providerId,id,p.version,opts),null);assert.equal(findCatalogProduct('if',id,p.version,{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct(p.providerId,id,'invented-version',{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);}
 for(const p of productCatalog.products.filter(p=>p.providerId==='storebrand'&&['Snøscooter','Tilhenger'].includes(p.insuranceType))){const family=p.insuranceType==='Snøscooter'?'snoscooter':'tilhenger';assert.equal(fact(p.productId,family+'.rettshjelp.grense').value,'100 000 kr per tvist');assert.ok(facts(p.productId).every(f=>!f.value.includes('Felles skadeunntak i §7.21–24')));}
});
