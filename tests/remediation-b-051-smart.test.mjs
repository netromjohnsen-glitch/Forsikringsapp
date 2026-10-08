import {applyRot} from './helpers/b051-rot.mjs';
import {applyLegal} from './helpers/b051-legal.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {deserialize} from 'node:v8';
import {gunzipSync,gzipSync} from 'node:zlib';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {materializeCatalogProduct,compareCatalogProducts,productComparisonProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms,groupAddOnNames} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {relatedCoveragesForInsuranceType} from '../lib/insurance-normalization.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {expectedCatalog} from './helpers/b051-liability.mjs';
const audit=new URL('../docs/audit/checkpoints/b051-smart-e21693e/',import.meta.url);
const proposal=JSON.parse(readFileSync(new URL('proposal.json',audit)));
const snapshot=JSON.parse(readFileSync(new URL('baseline-snapshot.json',audit)));
const snapshotBytes=readFileSync(new URL(snapshot.snapshot,audit));
assert.equal(createHash('sha256').update(snapshotBytes).digest('hex'),snapshot.sha256);
const baseline=applyRot(applyLegal(deserialize(gunzipSync(snapshotBytes)))),candidate=productCatalog,addon='gjensidige-hus-smart',ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-07T12:00:00Z');

let checks=0;const samples=[];
// OPEN baseline customer-mode findings are characterization, never approval.
const check=fn=>{checks++;test('R-051-SMART matrix '+checks,fn);};
const get=(c,id)=>c.products.find(p=>p.productId===id);
const keys=proposal.rows.map(x=>x.key),smart=i=>i.importantTerms.filter(t=>keys.includes(t.key)||/smart|alarmtjeneste/i.test(t.name)),status=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const source={documentId:'synthetic:smart:customer',filename:'Syntetisk Smart-avtale.pdf',termsNumber:'Syntetisk kundevilkår',effectiveFrom:'',company:'Gjensidige',page:2,section:'Kundens Smart-vilkår',note:'Syntetisk kontraktprobe',url:'https://example.invalid/synthetic-smart'};
const states=[[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundens Smart-vilkår 42 000 kr']];
const rawExpected=baseline.facts[proposal.owner].map(f=>{
 const r=proposal.rows.find(x=>x.key===f.key);if(!r)return structuredClone(f);
 if(r.key==='hus.service.smart')return {...structuredClone(f),value:r.value,source:{...structuredClone(baseline.facts[proposal.owner].find(x=>x.key==='hus.service.smart.avtale').source),page:1,section:'6. Alarmtjeneste'},qualificationSource:structuredClone(f.source)};
 return {...structuredClone(f),value:r.value,source:{...structuredClone(f.source),page:1,section:'9. Selskapets ansvar'}};
});
check(()=>assert.deepEqual(candidate.facts[proposal.owner],rawExpected));
check(()=>assert.deepEqual(JSON.parse(JSON.stringify(candidate)),JSON.parse(JSON.stringify(expectedCatalog))));
const manual=(c,id,selected=[],custom=false)=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':get(c,id).name,customProduct:custom,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:selected,importantTerms:[{name:proposal.rows[0].label,value:'Manuelt Smart-vilkår 42 000 kr'}]}]},c).insuranceData.insurances[0];
const agreement=(id,vs,addons=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:get(baseline,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:proposal.rows.flatMap(r=>vs.map(value=>({name:r.label,canonicalKey:r.key,value,source}))),addOns:addons}]});
const enrich=(c,a)=>enrichExtractedAgreementWithCatalog(a,date,undefined,undefined,c).insurances[0];
const record=(id,role,vs,addonPresent=false)=>({company:'Gjensidige',type:'Hus',agreementScope:'ordinary',productName:get(baseline,id).name,canonicalProductName:get(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],annualPremium:null,deductible:null,coverageSummary:null,importantTerms:[...vs.map(value=>({name:'Hus Smart',value,canonicalKey:null,documentIndices:[1]})),...proposal.rows.flatMap(r=>vs.map(value=>({name:r.label,value,canonicalKey:null,documentIndices:[1]})))],addOns:addonPresent?[{name:'Hus Smart',annualPremium:null,deductible:null,importantTerms:vs.map(value=>({name:'Hus Smart',value,canonicalKey:null,documentIndices:[1]}))}]:[]});
function pipe(c,docs,side){const save=productCatalog.facts;try{productCatalog.facts=c.facts;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts=save;}}
for(const id of ids){
 check(()=>assert.deepEqual(relatedCoveragesForInsuranceType('Hus').filter(x=>JSON.stringify(x).includes('smart')),[]));
 check(()=>assert.equal(canonicalDocumentFactKeys.some(x=>keys.includes(x)),false));
 for(const selected of [[],[addon],['gjensidige-hus-utleie'],[addon,'gjensidige-hus-utleie'],...(id===ids[0]?[[addon,'gjensidige-hus-rate-insekter']]:[])])check(()=>{
  const a=resolveCatalogFacts(get(baseline,id),selected,date,null,baseline),b=resolveCatalogFacts(get(candidate,id),selected,date,null,candidate);
  assert.deepEqual(b.filter(f=>!keys.includes(f.key)),a.filter(f=>!keys.includes(f.key)));
  assert.equal(b.filter(f=>keys.includes(f.key)).length,selected.includes(addon)?2:0);
  if(selected.includes(addon))assert.deepEqual(b.filter(f=>keys.includes(f.key)),rawExpected.filter(f=>keys.includes(f.key)));
  samples.push({mode:'resolve',id,selected,smartRows:b.filter(f=>keys.includes(f.key)).map(f=>({key:f.key,source:f.source,qualificationSource:f.qualificationSource}))});
 });
 check(()=>{const a=materializeCatalogProduct(get(baseline,id),baseline),b=materializeCatalogProduct(get(candidate,id),candidate);for(const r of proposal.rows){const x=a.facts.find(f=>f.key===r.key),y=b.facts.find(f=>f.key===r.key);assert.equal(y.state,'optional');assert.equal(y.role,'term');assert.equal(y.value,r.value);assert.deepEqual(y.addOnNames,x.addOnNames);assert.deepEqual(y.sources,catalogFactSources(rawExpected.find(f=>f.key===r.key)).map(s=>({...s,sourceType:undefined})));samples.push({mode:'materialize',id,key:r.key,before:{state:x.state,role:x.role},after:{state:y.state,role:y.role},sources:y.sources});}});
 for(const selected of [[],[addon],[addon,'gjensidige-hus-utleie']])for(const custom of [false,true])check(()=>{if(custom&&selected.length){assert.throws(()=>manual(baseline,id,selected,custom),/Tillegg krever et sikkert katalogprodukt/);assert.throws(()=>manual(candidate,id,selected,custom),/Tillegg krever et sikkert katalogprodukt/);samples.push({mode:'manual-rejected-invalid',id,selected,custom});return;}const a=manual(baseline,id,selected,custom),b=manual(candidate,id,selected,custom);assert.deepEqual(status(b),status(a));assert.deepEqual(b.addOnIds,a.addOnIds);if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);}else if(selected.includes(addon))for(const r of proposal.rows){const t=b.importantTerms.find(t=>t.key===r.key);assert.equal(t.value,r.value);assert.equal(t.coverageOrigin,'catalog');assert.deepEqual(t.sources,catalogFactSources(rawExpected.find(f=>f.key===r.key)).map((s,i)=>({...s,note:i===0?undefined:'Supplerende kilde for faktumets anvendelse'})));}samples.push({mode:'manual',id,selected,custom,addOnIds:b.addOnIds,displayedAddOns:groupAddOnNames([b],'Hus'),smartValues:smart(b).map(t=>({key:t.key,value:t.value,origin:t.coverageOrigin}))});});
 for(const vs of states)check(()=>{const a=enrich(baseline,agreement(id,vs)),b=enrich(candidate,agreement(id,vs));assert.deepEqual(b,a);assert.deepEqual(b.addOnIds,[]);for(const t of smart(b)){assert.ok(vs.includes(t.value));assert.deepEqual(t.source,source);assert.equal(Object.hasOwn(t,'sources'),false);}const aa=enrich(baseline,{company:'Gjensidige',totalAnnualPremium:null,insurances:[a]}),bb=enrich(candidate,{company:'Gjensidige',totalAnnualPremium:null,insurances:[b]});assert.deepEqual(bb,aa);assert.deepEqual(smart(bb),smart(b));samples.push({mode:'direct-document',id,vs,addOnIds:b.addOnIds,smartValues:smart(b).map(t=>({key:t.key,value:t.value,source:t.source})),canonicalSmart:status(b).filter(x=>x.id.includes('smart'))});});
 for(const role of ['individual_agreement','unknown','general_terms'])for(const side of ['existing','offer'])for(const vs of states)for(const addonPresent of [false,true])check(()=>{const docs=[[record(id,role,vs,addonPresent)]],a=pipe(baseline,docs,side),b=pipe(candidate,docs,side);assert.deepEqual(b,a);assert.equal(b.insurances.length,role==='general_terms'?0:1);if(role==='general_terms')assert.equal(b.supportingEvidence.length,1);else{const i=b.insurances[0];assert.deepEqual(i.addOnIds,[]);for(const t of smart(i)){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);assert.ok(vs.includes(t.value));}samples.push({mode:'pipeline',id,role,side,vs,addonPresent,addOnIds:i.addOnIds,displayedAddOns:groupAddOnNames([i],'Hus'),keys:smart(i).map(t=>t.key),values:smart(i).map(t=>t.value)});}});
 check(()=>{const docs=[[record(id,'individual_agreement',['Kundens Smart-vilkår 42 000 kr'])],[record(id,'general_terms',['Generelt alarmvilkår: utrykning er betinget av vekterdekning og adkomst.'],true)]],a=pipe(baseline,docs,'existing'),b=pipe(candidate,docs,'existing');assert.deepEqual(b,a);assert.equal(b.supportingEvidence.length,1);assert.ok(smart(b.insurances[0]).every(t=>t.value==='Kundens Smart-vilkår 42 000 kr'));});
 check(()=>{const a=manual(baseline,id,[addon]),b=manual(candidate,id,[addon]),aa=enrich(baseline,{company:'Gjensidige',totalAnnualPremium:null,insurances:[a]}),bb=enrich(candidate,{company:'Gjensidige',totalAnnualPremium:null,insurances:[b]});assert.deepEqual(status(bb),status(aa));assert.deepEqual(bb.addOnIds,aa.addOnIds);assert.deepEqual(smart(bb).map(t=>({name:t.name,value:t.value,source:t.source,sources:t.sources})),smart(b).map(t=>({name:t.name,value:t.value,source:t.source,sources:t.sources})));assert.deepEqual(smart(aa).map(t=>({name:t.name,value:t.value,source:t.source,sources:t.sources})),smart(a).map(t=>({name:t.name,value:t.value,source:t.source,sources:t.sources})));samples.push({mode:'repeat-manual',id,beforeAddOnIds:a.addOnIds,baselineRepeated:aa.addOnIds,candidateRepeated:bb.addOnIds,beforeKeys:smart(a).map(t=>t.key),baselineKeys:smart(aa).map(t=>t.key),candidateKeys:smart(bb).map(t=>t.key)});});
 for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check(()=>{const a=compareCatalogProducts(get(candidate,id),get(candidate,other),candidate),b=compareCatalogProducts(get(candidate,other),get(candidate,id),candidate);if(id===other)assert.equal(a.differenceCount,0);for(const r of a.sections.flatMap(s=>s.rows)){const rev=b.sections.flatMap(s=>s.rows).find(x=>x.key===r.key);assert.deepEqual(r.first,rev.second);assert.deepEqual(r.second,rev.first);}samples.push({mode:'product-comparison',id,other,smartRows:a.sections.flatMap(s=>s.rows).filter(r=>keys.includes(r.key))});});
 check(()=>{const customer=enrich(candidate,agreement(id,['Kundens Smart-vilkår 42 000 kr'])),general=manual(candidate,id,[addon]);for(const[a,b,s]of[[customer,general,'first'],[general,customer,'second']]){const rows=groupTerms(groupInsurances([a],[b],null)[0],null);samples.push({mode:'customer-comparison',id,side:s,rows:rows.filter(r=>keys.includes(r.key)||/smart|alarmtjeneste/i.test(r.label??r.name??'')).map(r=>({key:r.key,first:r.first,second:r.second,firstSources:r.firstSources,secondSources:r.secondSources}))});for(const r of proposal.rows){const row=rows.find(x=>x.key===r.key);assert.ok(row);assert.equal(row[s],'Kundens Smart-vilkår 42 000 kr');assert.deepEqual(row[s+'Sources'],[source]);}}});
}

for(const id of ids)for(const vs of states)check(()=>{
 const aa=pipe(baseline,[[record(id,'individual_agreement',vs)]],'existing').insurances[0],bb=pipe(candidate,[[record(id,'individual_agreement',vs)]],'existing').insurances[0];
 for(const side of ['first','second']){
  const general=manual(candidate,id,[addon]);const pair=side==='first'?[bb,general]:[general,bb];
  const rows=groupTerms(groupInsurances([pair[0]],[pair[1]],null)[0],null);
  const picked=rows.filter(r=>keys.includes(r.key)||/smart|alarmtjeneste/i.test(r.key));
  assert.deepEqual(smart(bb),smart(aa));
  samples.push({mode:'actual-document-comparison',id,vs,side,rows:picked.map(r=>({key:r.key,first:r.first,second:r.second,firstValueCount:r.firstValueCount,secondValueCount:r.secondValueCount,firstSources:r.firstSources,secondSources:r.secondSources}))});
 }
});
let protectedRaw=0,components=0,otherProducts=0;
check(()=>{for(const meta of ['products','addOns','sources','insuranceTypes'])assert.deepEqual(candidate[meta],baseline[meta]);for(const[o,fs]of Object.entries(baseline.facts)){const filter=rows=>rows.filter(f=>o!==proposal.owner||!keys.includes(f.key));assert.deepEqual(filter(candidate.facts[o]),filter(fs));protectedRaw+=filter(fs).length;if(o!==proposal.owner)components++;}for(const p of candidate.products){assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(get(baseline,p.productId),[],date,null,baseline));if(!ids.includes(p.productId)){if(productComparisonProducts(baseline).some(x=>x.productId===p.productId&&x.version===p.version)){assert.deepEqual(materializeCatalogProduct(p,candidate),materializeCatalogProduct(get(baseline,p.productId),baseline));}else{assert.throws(()=>materializeCatalogProduct(p,baseline),/Katalogproduktet kan ikke sammenlignes sikkert/);assert.throws(()=>materializeCatalogProduct(p,candidate),/Katalogproduktet kan ikke sammenlignes sikkert/);}otherProducts++;}}});
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fingerprints=ids.flatMap(id=>(id===ids[0]?[[],['gjensidige-hus-rate-insekter'],[addon]]:[[],[addon]]).map(addons=>{const fs=c=>resolveCatalogFacts(get(c,id),addons,date,null,c).filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');return {id,addons,before:hash(fs(baseline)),after:hash(fs(candidate))};}));

check(()=>{assert.equal(protectedRaw,4157);assert.equal(components,317);assert.equal(otherProducts,202);assert.equal(baseline.products.length,204);});
check(()=>{for(const f of fingerprints.filter(f=>!f.addons.includes(addon)))assert.equal(f.before,f.after);});
const verification=JSON.parse(readFileSync(new URL('source-verification.json',audit)));
for(const source of verification.frozen_sources)check(()=>assert.equal(createHash('sha256').update(readFileSync(new URL('../'+source.path,import.meta.url))).digest('hex'),source.sha256));
const decode=s=>s.replace(/&(quot|amp|lt|gt|nbsp|#x[0-9a-f]+|#[0-9]+);/gi,(full,entity)=>{const chars={quot:'"',amp:'&',lt:'<',gt:'>',nbsp:'\u00a0'};return entity[0]==='#'?String.fromCodePoint(entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10)):chars[entity.toLowerCase()]??full;});
const html=readFileSync(new URL('../catalog/sources/gjensidige/hus/Hus-Smart-alarmvilkar.html',import.meta.url),'utf8');
const sections=[...html.matchAll(/data-part="article-section"\s+data-props="([^"]+)"/g)].map(m=>JSON.parse(decode(m[1])));
for(const n of ['6','9'])check(()=>{const section=sections.find(s=>s.title===proposal.source_sections[n].title);assert.ok(section);assert.equal(decode(section.text.replace(/<[^>]*>/g,' ')).replace(/\s+/gu,' ').trim(),proposal.source_sections[n].text);const r=proposal.rows.find(r=>r.primary.section===section.title);assert.equal(r.value,r.previous_value+' '+proposal.source_sections[n].text);});
for(const b of proposal.bindings)for(const pair of b.pairs)check(()=>{const auth=JSON.parse(readFileSync(new URL('authorization.json',audit)));const original=auth.signatures.find(s=>s.signature_id===b.signature);const idx=JSON.parse(original.finding_ids).indexOf(pair.GAP);assert.ok(idx>=0);assert.equal(JSON.parse(original.source_fact_ids)[idx],pair.SF);assert.equal(JSON.parse(JSON.parse(original.products)[idx])[3],pair.product);assert.equal(original.final_batch_id,'B-051');});
process.on('exit',()=>{if(process.env.SMART_PROBE_RESULT_FILE)writeFileSync(process.env.SMART_PROBE_RESULT_FILE,gzipSync(JSON.stringify({checks,protectedRaw,components,otherProducts,baseFactsUnchangedAllProducts:baseline.products.length,fingerprints,samples}),{mtime:0}));});
