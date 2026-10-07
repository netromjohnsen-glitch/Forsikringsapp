import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {baselineCatalog as oracleBaseline, expectedCatalog, sourceOracle, assertLiabilityCatalog} from './helpers/b051-liability.mjs';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {catalogFactSources,enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {expectedCatalog as oldOracle} from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';

const key='hus.ansvar.dekning', ids=['gjensidige-hus','gjensidige-hus-pluss'];
const baseline=structuredClone(oracleBaseline),candidate=productCatalog,date=new Date('2026-10-07T12:00:00Z');
const value=sourceOracle.value;
const before=baseline.facts.gjensidigeHusStandard.find(f=>f.key===key);
const after=expectedCatalog.facts.gjensidigeHusStandard.find(f=>f.key===key);
const prod=(c,id)=>c.products.find(p=>p.productId===id);
const source={documentId:'liability-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',page:2,section:'Avtalt ansvar'};
const input=(c,id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:prod(c,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]});
const term=v=>({name:before.label,canonicalKey:key,value:v,source});
const enrich=(c,id,vs)=>enrichExtractedAgreementWithCatalog(input(c,id,vs.map(term)),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const state=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const target=i=>state(i).filter(x=>x.id.includes('ansvar'));
const pick=i=>i.importantTerms.filter(t=>t.key===key);
const sample=[];let n=0;const check=(name,fn)=>test('R-051-LIABILITY-'+(++n)+':'+name,fn);
for(const id of ids)for(const vs of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('enrichment',()=>{
 const a=enrich(baseline,id,vs),b=enrich(candidate,id,vs),aa=repeat(baseline,a),bb=repeat(candidate,b);
 assert.deepEqual(state(b),state(a));assert.deepEqual(state(bb),state(aa));assert.deepEqual(b.addOnIds,a.addOnIds);
 for(const t of pick(b))if(t.coverageOrigin==='document'){assert.deepEqual(t.source,source);assert.equal(Object.hasOwn(t,'sources'),false);assert.ok(vs.includes(t.value));}
 assert.deepEqual(pick(bb).map(t=>[t.name,t.key,t.value,t.source,t.sources]),pick(b).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
 if(vs[0]==='Kundevilkår 73 000 kr')assert.equal(pick(b)[0].value,vs[0]);
 sample.push({mode:'enrichment',id,values:vs,before:target(a),after:target(b),terms:pick(b).map(t=>({key:t.key,value_is_proposal:t.value===value,origin:t.coverageOrigin,source:t.source,sources:t.sources})),repeat_new_ids:state(bb).filter(x=>!state(b).some(y=>x.id===y.id))});
});
const record=(id,role,vs)=>({...input(baseline,id).insurances[0],canonicalProductName:prod(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:vs.map(value=>({name:before.label,value,documentIndices:[1]}))});
function pipeline(c,docs,side){const save=productCatalog.facts;try{productCatalog.facts=c.facts;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts=save;}}
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const side of ['existing','offer'])for(const vs of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('pipeline',()=>{
 const docs=[[record(id,role,vs)]],a=pipeline(baseline,docs,side),b=pipeline(candidate,docs,side);
 assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.equal(b.insurances.length,role==='general_terms'?0:1);
 if(role!=='general_terms'){
  assert.deepEqual(state(b.insurances[0]),state(a.insurances[0]));assert.deepEqual(b.insurances[0].addOnIds,a.insurances[0].addOnIds);
  if(vs[0]==='Kundevilkår 73 000 kr')for(const t of pick(b.insurances[0])){assert.equal(t.value,vs[0]);assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}
 }
 sample.push({mode:'pipeline',id,role,side,values:vs,customer:b.insurances.length,support:b.supportingEvidence.length,before:a.insurances.map(target),after:b.insurances.map(target)});
});
for(const id of ids)check('support+customer',()=>{
 const docs=[[record(id,'individual_agreement',['Kundevilkår 73 000 kr'])],[record(id,'general_terms',[value])]];
 const a=pipeline(baseline,docs,'existing'),b=pipeline(candidate,docs,'existing');assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.equal(b.supportingEvidence.length,1);assert.equal(pick(b.insurances[0])[0].value,'Kundevilkår 73 000 kr');assert.deepEqual(state(b.insurances[0]),state(a.insurances[0]));
});
const manual=(c,id,custom=false,addons=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':prod(c,id).name,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:addons,importantTerms:[{name:before.label,value:'Manuelt vilkår 73 000 kr'}]}]},c).insuranceData.insurances[0];
for(const id of ids)for(const custom of [false,true])check('manual',()=>{const a=manual(baseline,id,custom),b=manual(candidate,id,custom);assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);}else{assert.equal(pick(b)[0].value,value);assert.equal(pick(b)[0].coverageOrigin,'catalog');assert.deepEqual(pick(b)[0].sources,catalogFactSources(after).map(s=>({...s,note:undefined})));}sample.push({mode:'manual',id,custom,before:target(a),after:target(b),catalogReference:b.catalogReference});});
for(const id of ids)check('materialized',()=>{
 const a=materializeCatalogProduct(prod(baseline,id),baseline),b=materializeCatalogProduct(prod(candidate,id),candidate),x=a.facts.find(f=>f.key===key),y=b.facts.find(f=>f.key===key);
 assert.equal(y.state,x.state);assert.equal(y.role,x.role);assert.equal(y.value,value);assert.deepEqual(y.sources,catalogFactSources(after).map(s=>({...s,sourceType:undefined})));sample.push({mode:'materialized',id,state:y.state,role:y.role,sources:y.sources});
});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('comparison',()=>{const a=compareCatalogProducts(prod(candidate,id),prod(candidate,other),candidate),b=compareCatalogProducts(prod(candidate,other),prod(candidate,id),candidate);if(id===other)assert.equal(a.differenceCount,0);for(const row of a.sections.flatMap(s=>s.rows)){const inverse=b.sections.flatMap(s=>s.rows).find(x=>x.key===row.key);assert.deepEqual(row.first,inverse.second);assert.deepEqual(row.second,inverse.first);}});
for(const id of ids)check('customer-comparison',()=>{const customer=enrich(candidate,id,['Kundevilkår 73 000 kr']),general=manual(candidate,id);for(const[a,b,s]of[[customer,general,'first'],[general,customer,'second']]){const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===key);assert.equal(row[s],'Kundevilkår 73 000 kr');assert.deepEqual(row[s+'Sources'],[source]);}});
for(const id of ids)for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],...(id===ids[0]?[['gjensidige-hus-rate-insekter']]:[])])check('addons',()=>{const a=resolveCatalogFacts(prod(baseline,id),addons,date,null,baseline),b=resolveCatalogFacts(prod(candidate,id),addons,date,null,candidate);assert.deepEqual(b.filter(f=>f.key!==key),a.filter(f=>f.key!==key));assert.equal(b.filter(f=>f.key===key).length,1);assert.equal(b.find(f=>f.key===key).source.documentId,'gjensidigeHusStandard');});
let protectedRaw=0,untouched=0,otherProducts=0;
check('isolation',()=>{for(const m of ['sources','products','addOns','insuranceTypes'])assert.deepEqual(candidate[m],baseline[m]);for(const[o,rows]of Object.entries(baseline.facts)){const filter=fs=>fs.filter(f=>o!=='gjensidigeHusStandard'||f.key!==key);assert.deepEqual(filter(candidate.facts[o]),filter(rows));protectedRaw+=filter(rows).length;if(o!=='gjensidigeHusStandard')untouched++;}for(const p of candidate.products.filter(p=>!ids.includes(p.productId))){assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(prod(baseline,p.productId),[],date,null,baseline));otherProducts++;}});
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fps=ids.flatMap(id=>(id===ids[0]?[[],['gjensidige-hus-rate-insekter']]:[[]]).map(addons=>{const filter=x=>x.filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');return{id,addons,before:digest(filter(resolveCatalogFacts(prod(baseline,id),addons,date,null,baseline))),after:digest(filter(resolveCatalogFacts(prod(candidate,id),addons,date,null,candidate)))};}));
let reverseCollision=false;try{assert.deepEqual(candidate,oldOracle);}catch{reverseCollision=true;}
assert.equal(reverseCollision,true);
const expectedCanonicalCollisions=[];
for(const id of ids)check('full-canonical-expected-collision',()=>{
 const a=deriveCanonicalCoverages(enrich(baseline,id,[]),'Hus'),b=deriveCanonicalCoverages(enrich(candidate,id,[]),'Hus');
 const changes=b.flatMap(x=>{const old=a.find(y=>y.id===x.id);return JSON.stringify(old)===JSON.stringify(x)?[]:[{id:x.id,fields:Object.keys(x).filter(k=>JSON.stringify(x[k])!==JSON.stringify(old[k]))}];});
 assert.equal(changes.length,1);assert.equal(changes[0].id,key);assert.deepEqual(target(enrich(candidate,id,[])),target(enrich(baseline,id,[])));
 expectedCanonicalCollisions.push({id,changes});
});

check('independent-full-field-reverse',assertLiabilityCatalog);
check('raw-reference-contract',()=>{
 const raw=candidate.facts.gjensidigeHusStandard.find(f=>f.key===key);
 assert.equal(Object.hasOwn(raw.source,'productCode'),true);assert.equal(raw.source.productCode,undefined);
 assert.equal(Object.hasOwn(raw.source,'sourceType'),false);
 assert.deepEqual(raw,{...before,value,source:{...before.source,page:6,section:'Ansvar – Dekkes / Dekkes ikke',productCode:undefined}});
});
const audit=new URL('../docs/audit/checkpoints/b051-liability-3947e4e/',import.meta.url);
const authorization=JSON.parse(readFileSync(new URL('authorization.json',audit)));
for(const frozen of authorization.frozen_sources)check('source:'+frozen.path,()=>{
 const bytes=readFileSync(new URL('../'+frozen.path,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),frozen.sha256);
 const text=execFileSync('pdftotext',['-raw','-f',String(frozen.page),'-l',String(frozen.page),new URL('../'+frozen.path,import.meta.url).pathname,'-'],{encoding:'utf8'}).replace(/\s+/gu,' ');
 for(const phrase of [
  'Hus-/Hytteforsikringen dekker ansvar som eier av forsikret eiendom - i Norden',
  'Erstatningsansvar for skade på tredjemanns person, ting eller formuesskade',
  'når sikrede er erstatningsansvarlig i henhold til gjeldende rett',
  'når skaden/tapet er konstatert i forsikringstiden',
  'Erstatningsansvar for forurensningsskade når årsaken til skaden er plutselig og uforutsett',
  'driften ikke overstiger årlig omsetning på kr 100 000',
  'yrkesskadeforsikring for ulønnet arbeidshjelp iht lov om yrkesskadeforsikring. Fast ansatte og vikarer er imidlertid ikke dekket',
  'hvis ikke dette er avtalt og skrevet under',
  'ektefelle/samboer, foreldre, steforeldre, fosterforeldre, svigerforeldre, søsken, barn, barnebarn, stebarn, fosterbarn',
  'Det er familieforholdet på det tidspunkt skaden forvoldes, som legges til grunn.',
  'Det er eierforholdet på det tidspunkt skaden forvoldes, som legges til grunn.',
  'for oppreisning (skadeserstatningsloven § 3-5)',
  'for æreskrenking og krenking av privatlivets fred (skadeserstatningsloven § 3-6)',
  'har gitt avkall på sin rett til regress', 'for bøter, gebyr o.l.',
  'bruker, leier, låner eller har mottatt til transport eller forvaring - eller formuestap som følge av dette',
  'som styremedlem', 'ved overføring av smittsom sykdom', 'gradvis forurensning',
  'sopp og råte eller på grunn av langsom inntrengning av fuktighet',
  'forsettlige handlinger, jfr FAL § 4-9',
  'kap. 25 Voldslovbrudd mv. eller kap. 26 Seksuallovbrudd, kap.29 Vern av tilliten til penger og visse dokumenter og kap. 30 Bedrageri',
  'for korrupsjon (skadeserstatningsloven § 1-6 )',
  'motorvogn (el-sparkesykkel er ikke klassifisert som motorvogn utenfor Norge), båt (gjelder ikke fritidsbåt), arbeidsmaskin, drone eller luftfartøy'
 ])assert.ok(text.includes(phrase),phrase);
 assert.equal(value.includes('byggherrens ansvar'),false);
});
check('prior-53-immutable-receipts',()=>{
 const prior=JSON.parse(readFileSync(new URL('prior-receipts.json',audit)));
 assert.equal(prior.length,53);assert.equal(new Set(prior.map(x=>x.signature)).size,53);
 for(const entry of prior)assert.equal(createHash('sha256').update(readFileSync(new URL('../'+entry.path,import.meta.url))).digest('hex'),entry.sha256);
});
check('isolation-counts',()=>{assert.equal(protectedRaw,4158);assert.equal(untouched,317);assert.equal(otherProducts,202);});
check('independent-three-fingerprint-deltas',()=>{
 assert.deepEqual(fps.map(f=>f.after),[
 '4dbde0cf9f9f467f2138bb70edf8df3e51addbb158f8330d89e40a58bf7dc752',
 'e2dde9decd0cc64db060cc2ce57421741ff51239de95107264e84cf7388ce489',
 '924f9f29873c4356ad3787e755efeb6ffb13dd5300af42352bb3958ab6bc67bd']);
 for(const f of fps){const p=prod(expectedCatalog,f.id);const rows=resolveCatalogFacts(p,f.addons,date,null,expectedCatalog).filter(x=>!x.key.startsWith('hus.skadedyr.')&&x.key!=='hus.rate.dekning');assert.equal(digest(rows),f.after);}
});
