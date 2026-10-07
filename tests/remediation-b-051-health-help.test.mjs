import {applySmart} from './helpers/b051-smart.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {healthOracle,applyHealthHelp} from './helpers/b051-health-help.mjs';
import {applyLiability,assertLiabilityCatalog} from './helpers/b051-liability.mjs';
import {readFileSync}from'node:fs';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {catalogFactSources,enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {deriveCanonicalCoverages,coverageStatusFromText} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {expectedCatalog as previousCatalog} from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const oldOracle=applySmart(applyLiability(previousCatalog));
const expectedCatalog=applyHealthHelp(oldOracle);

const key='hus.service.helsehjelp', ids=['gjensidige-hus','gjensidige-hus-pluss'];
const baseline=structuredClone(oldOracle),candidate=productCatalog,date=new Date('2026-10-07T12:00:00Z');
const value=healthOracle.value;
const before=baseline.facts.gjensidigeHusStandard.find(f=>f.key===key);
const expectedFact=expectedCatalog.facts.gjensidigeHusStandard.find(f=>f.key===key);
const expectedHealthFact={...expectedFact,source:{...expectedFact.source,productCode:undefined}};
const prod=(c,id)=>c.products.find(p=>p.productId===id);
const source={documentId:'liability-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',page:2,section:'Avtalt ansvar'};
const input=(c,id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:prod(c,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]});
const term=v=>({name:before.label,canonicalKey:key,value:v,source});
const enrich=(c,id,vs)=>enrichExtractedAgreementWithCatalog(input(c,id,vs.map(term)),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const state=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const target=i=>state(i).filter(x=>x.id.includes('helsehjelp'));
const pick=i=>i.importantTerms.filter(t=>t.key===key);
const sample=[];let n=0;const check=(name,fn)=>test('R-051-HEALTH-'+(++n)+':'+name,fn);
for(const id of ids)for(const vs of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('enrichment',()=>{
 const a=enrich(baseline,id,vs),b=enrich(candidate,id,vs),aa=repeat(baseline,a),bb=repeat(candidate,b);
 assert.deepEqual(state(b),state(a));assert.deepEqual(state(bb),state(aa));assert.deepEqual(b.addOnIds,a.addOnIds);assert.deepEqual(state(bb).filter(x=>!state(b).some(y=>x.id===y.id)),[{id:'rettshjelp.dekning',status:'selected',conflict:false}]);
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
for(const id of ids)for(const custom of [false,true])check('manual',()=>{const a=manual(baseline,id,custom),b=manual(candidate,id,custom);assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);}else{assert.equal(pick(b)[0].value,value);assert.equal(pick(b)[0].coverageOrigin,'catalog');assert.deepEqual(pick(b)[0].sources,catalogFactSources(expectedHealthFact).map(s=>({...s,note:undefined})));}sample.push({mode:'manual',id,custom,before:target(a),after:target(b),catalogReference:b.catalogReference});});
for(const id of ids)check('materialized',()=>{
 const a=materializeCatalogProduct(prod(baseline,id),baseline),b=materializeCatalogProduct(prod(candidate,id),candidate),x=a.facts.find(f=>f.key===key),y=b.facts.find(f=>f.key===key);
 assert.equal(y.state,x.state);assert.equal(y.role,x.role);assert.equal(y.value,value);assert.deepEqual(y.sources,catalogFactSources(expectedHealthFact).map(s=>({...s,sourceType:undefined})));sample.push({mode:'materialized',id,state:y.state,role:y.role,sources:y.sources});
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
 assert.equal(changes.length,0);assert.deepEqual(target(enrich(candidate,id,[])),target(enrich(baseline,id,[])));
 expectedCanonicalCollisions.push({id,changes});
});

const audit=new URL('../docs/audit/checkpoints/b051-health-help-732b4cc/',import.meta.url);
const authorization=JSON.parse(readFileSync(new URL('authorization.json',audit)));
check('independent-full-field-reverse',assertLiabilityCatalog);
check('raw-source-reference-and-only-one-row',()=>{
 const actual=candidate.facts.gjensidigeHusStandard.filter(f=>f.key===key);assert.equal(actual.length,1);
 assert.deepEqual(actual[0],expectedHealthFact);assert.equal(Object.hasOwn(actual[0].source,'productCode'),true);
 assert.equal(actual[0].source.productCode,undefined);assert.equal(Object.hasOwn(actual[0].source,'sourceType'),false);
 assert.deepEqual(before,{...expectedFact,value:healthOracle.previous_value,source:{...expectedFact.source,page:12}});
 assert.equal(candidate.facts.gjensidigeHusPluss.some(f=>f.key===key),false);
});
const layouts=[];
for(const frozen of authorization.frozen_sources)check('frozen-source:'+frozen.identity,()=>{
 const path=new URL('../'+frozen.path,import.meta.url);assert.equal(digestBytes(readFileSync(path)),frozen.sha256);
 const registered=candidate.sources[frozen.identity];assert.equal(registered.sha256,frozen.sha256);assert.equal(registered.insuranceType,'Hus');assert.equal(registered.company,'Gjensidige');assert.equal(registered.effectiveFrom,'');assert.equal(Object.hasOwn(registered,'sourceType'),false);
 const raw=execFileSync('pdftotext',['-layout','-f',String(frozen.page),'-l',String(frozen.page),path.pathname,'-'],{encoding:'utf8'});layouts.push(raw);
 const text=raw.replace(/\s+/gu,' ');
 for(const phrase of ['Helsehjelp 24/7 er knyttet til forsikring av Hus- og Personforsikringer','I tillegg til forsikringstaker','Ektefelle eller samboer med felles adresse i Folkeregisteret','utdanning/førstegangstjeneste, og ikke har meldt adresseendring','Barn som er en del av den faste husstanden, men er folkeregistrert på annen adresse pga. delt foreldreansvar','I hele verden','Forsikringen gir alle i husstanden','Fri bruk av videokonsultasjon med allmenlege','hos Dr.Dropin hele døgnet - alle dager','Kostnadsfri videokonsultasjon med psykolog hos Dr.Dropin for å forebygge hverdagsutfordringer. En konsultasjon pr husstandsmedlem per 12 mnd','Fri bruk av digitale selvhjelpsprogrammer som tilbys gjennom Dr.Dropin','Kostnadsfri videokonsultasjon med fysioterapeut hos Dr.Dropin for å forebygge muskel og skjelettplager. En konsultasjon per husstandsmedlem per 12 mnd.','Rabatt på utvalgte tjenester hos hos Dr.Dropin både digitalt og fysisk der Dr.Dropin har lokasjoner. Les mer om hvilke tjenester dette gjelder på våre nettsider','Digital Veiviser på Din side/gjensidige.no','det offentlige helsevesen','tilgjengelige behandlingssteder','beliggenhet','ventetid','Akutt og øyeblikkelig hjelp','Behandlingsutgifter på sykehus og klinikker'])assert.ok(text.includes(phrase),phrase);
 assert.equal(value.includes('Personforsikringer'),false);
});
check('identical-Standard11-and-Plus12-contract',()=>assert.equal(layouts[0],layouts[1]));
check('four-exact-original-bindings',()=>{
 assert.equal(authorization.original_bindings.length,4);assert.equal(authorization.signatures.length,2);
 const preflight=JSON.parse(readFileSync(new URL('../docs/audit/checkpoints/rv02-b071-b051-f829dd3/b051-preflight.json',import.meta.url)));
 const pairs=[['0eda923b4090cf6c','GAP-2108','SF-3021','gjensidige-hus'],['0eda923b4090cf6c','GAP-2167','SF-3108','gjensidige-hus-pluss'],['8a1beb3695ddb2fd','GAP-2109','SF-3023','gjensidige-hus'],['8a1beb3695ddb2fd','GAP-2168','SF-3110','gjensidige-hus-pluss']];
 assert.deepEqual(authorization.original_bindings.map(b=>[b.signature,b.GAP,b.SF,b.product[3]]),pairs);
 for(const row of authorization.signatures){assert.deepEqual(row,preflight.signatures.find(x=>x.signature===row.signature_id).original_binding);}
});
check('all-54-immutable-receipts',()=>{
 const prior=JSON.parse(readFileSync(new URL('prior-receipts.json',audit)));assert.equal(prior.length,54);assert.equal(new Set(prior.map(x=>x.signature)).size,54);
 for(const entry of prior)assert.equal(digestBytes(readFileSync(new URL('../'+entry.path,import.meta.url))),entry.sha256);
});
check('exact-isolation-counts',()=>{assert.equal(protectedRaw,4158);assert.equal(untouched,317);assert.equal(otherProducts,202);});
check('independent-three-fingerprint-differences',()=>{
 assert.deepEqual(fps.map(x=>x.before),['4dbde0cf9f9f467f2138bb70edf8df3e51addbb158f8330d89e40a58bf7dc752','e2dde9decd0cc64db060cc2ce57421741ff51239de95107264e84cf7388ce489','924f9f29873c4356ad3787e755efeb6ffb13dd5300af42352bb3958ab6bc67bd']);
 assert.deepEqual(fps.map(x=>x.after),['d5c72d2f6ab94d0b3e4fd96343d5117ec357f775c5090515f534d4a9b18baa2e','385845464c7ec23331a28d1634f89c92d7bf693c27eab3084347a276487906ee','29cdf599445370bc905a23455a4ad2ffbf3ed7dd6647ed6948692d1c85483525']);
 for(const f of fps){const p=prod(expectedCatalog,f.id);assert.equal(digest(resolveCatalogFacts(p,f.addons,date,null,expectedCatalog).filter(x=>!x.key.startsWith('hus.skadedyr.')&&x.key!=='hus.rate.dekning')),f.after);}
});
function digestBytes(bytes){return createHash('sha256').update(bytes).digest('hex');}

const extractionRecord=(id,role,values)=>({...input(baseline,id,[]).insurances[0],canonicalProductName:prod(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:values.map(value=>({name:healthOracle.label,value,documentIndices:[1]}))});
const withCatalog=(c,fn)=>{const save=productCatalog.facts;try{productCatalog.facts=c.facts;return fn();}finally{productCatalog.facts=save;}};
const pipe=(c,records,side)=>withCatalog(c,()=>documentPipeline(records,side).insuranceData);
let extractionChecks=0;const extractionCheck=fn=>test('R-051-HEALTH-extraction-'+(++extractionChecks),fn);const observed=[];
for(const id of ['gjensidige-hus','gjensidige-hus-pluss'])for(const role of ['individual_agreement','unknown','general_terms'])for(const side of ['existing','offer'])for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundens tjenesteregel']])extractionCheck(()=>{
 const before=pipe(baseline,[[extractionRecord(id,role,values)]],side),candidateDocument=pipe(candidate,[[extractionRecord(id,role,values)]],side);
 assert.deepEqual(before.supportingEvidence,candidateDocument.supportingEvidence);
 if(role==='general_terms'){
  assert.equal(candidateDocument.insurances.length,0);assert.equal(candidateDocument.supportingEvidence.length,1);
  const raw=JSON.stringify(candidateDocument.supportingEvidence);for(const v of values)assert.ok(raw.includes(v));
 }else{
  const a=before.insurances[0],b=candidateDocument.insurances[0],terms=b.importantTerms.filter(t=>t.name===healthOracle.label);
  assert.equal(terms.length,values.length||1);
  if(values.length&&values[0]!=='Ukjent'){
   assert.deepEqual(terms.map(t=>t.value).sort(),values.toSorted());
   for(const t of terms){assert.equal(t.coverageOrigin,'document');assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);assert.equal(t.key,key);}
  }else{assert.equal(terms[0].value,value);assert.equal(terms[0].coverageOrigin,'catalog');assert.deepEqual(terms[0].sources,catalogFactSources(expectedHealthFact));}
  assert.deepEqual(deriveCanonicalCoverages(a,'Hus'),deriveCanonicalCoverages(b,'Hus'));
  assert.equal(deriveCanonicalCoverages(b,'Hus').some(c=>c.id.includes('helse')||c.id.includes('service')),false);
  const compare=groupTerms(groupInsurances([b],[a],null)[0],null).find(t=>t.key===key);
  observed.push({id,role,side,values,keys:terms.map(t=>t.key),parsed_statuses:terms.map(t=>coverageStatusFromText(t.value,{subject:healthOracle.label,productName:prod(candidate,id).name})),raw_values:terms.map(t=>t.value===value?'proposal':t.value),canonical_service:false,comparison:compare?{first:compare.first,second:compare.second,firstCoverage:compare.firstCoverage,secondCoverage:compare.secondCoverage}:null});
 }
});
for(const id of ['gjensidige-hus','gjensidige-hus-pluss'])for(const side of ['existing','offer'])extractionCheck(()=>{
 const before=pipe(baseline,[[extractionRecord(id,'individual_agreement',['Kundens tjenesteregel'])],[extractionRecord(id,'general_terms',[value])]],side),candidateDocument=pipe(candidate,[[extractionRecord(id,'individual_agreement',['Kundens tjenesteregel'])],[extractionRecord(id,'general_terms',[value])]],side);
 assert.equal(candidateDocument.insurances.length,1);assert.equal(candidateDocument.supportingEvidence.length,1);assert.deepEqual(candidateDocument.supportingEvidence,before.supportingEvidence);
 assert.equal(candidateDocument.insurances[0].importantTerms.find(t=>t.key===key).value,'Kundens tjenesteregel');
});

for(const id of ids)check('baseline-raw-repeat-metadata:'+id,()=>{
 const first=pick(enrich(candidate,id,[]))[0],second=pick(repeat(candidate,enrich(candidate,id,[])))[0];
 const a=pick(enrich(baseline,id,[]))[0],b=pick(repeat(baseline,enrich(baseline,id,[])))[0];
 const changes=(x,y)=>[...new Set([...Object.keys(x),...Object.keys(y)])].filter(k=>Object.hasOwn(x,k)!==Object.hasOwn(y,k)||(!Object.is(x[k],y[k])&&JSON.stringify(x[k])!==JSON.stringify(y[k])));
 assert.deepEqual(changes(first,second),changes(a,b));
 assert.deepEqual(changes(first,second),['coverageOrigin','structuredValue','deductibleClassification','overriddenBase']);
 assert.equal(first.coverageOrigin,'catalog');assert.equal(second.coverageOrigin,'document');
 assert.equal(first.structuredValue,undefined);assert.equal(first.deductibleClassification,undefined);assert.deepEqual(first.overriddenBase,[]);
 for(const k of ['structuredValue','deductibleClassification']){assert.equal(Object.hasOwn(first,k),true);assert.equal(first[k],undefined);assert.equal(Object.hasOwn(second,k),false);assert.equal(second[k],undefined);}
 for(const k of [...new Set([...Object.keys(first),...Object.keys(second)])].filter(k=>!['coverageOrigin','structuredValue','deductibleClassification','overriddenBase'].includes(k))){assert.equal(Object.hasOwn(first,k),Object.hasOwn(second,k));assert.deepEqual(first[k],second[k]);}
 for(const k of ['structuredValue','deductibleClassification','overriddenBase'])assert.equal(Object.hasOwn(second,k),false);
 assert.deepEqual(pick(repeat(candidate,enrich(candidate,id,['Valgt','Ikke valgt']))).map(t=>t.value),['Valgt','Ikke valgt']);
});
