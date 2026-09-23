import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseExtractionResponse,sanitizeAnalysisDocumentForClient} from '../lib/analysis-output.ts';
import {planExtractionBatches} from '../lib/analysis-batching.ts';
import {analyzePdfBatches} from '../lib/pdf-analysis-pipeline.ts';
import {enrichBatch,mergeBatchResults} from '../lib/analysis-merge.ts';
import {createAnalysisTelemetry} from '../lib/analysis-telemetry.ts';
import {groupInsurances,groupTerms,groupValue,createDifferences} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
import {runHybridMatching} from '../lib/hybrid-matching.ts';
import {vehiclePriceDifferences,vehiclePrices} from '../lib/vehicle-price-presentation.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {normalizeInsuranceType} from '../lib/insurance-normalization.ts';
import {PdfSecurityError} from '../lib/pdf-upload-security.ts';
const types=['Snøscooter','Campingvogn','Tilhenger'];
const prefix=type=>type==='Snøscooter'?'snoscooter':type.toLowerCase();
const telemetry=()=>createAnalysisTelemetry('00000000-0000-0000-0000-000000000000');
const raw=(type,index=1,value='12 000 kr')=>({type,company:'If',documentIndices:[index],productName:'Kasko – PRIVATE_OBJECT',canonicalProductName:'Kasko',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:[{name:'Brann egenandel',canonicalKey:type==='Bil'?null:`${prefix(type)}.brann.egenandel`,value,documentIndices:[index]}]});
const agreement=insurances=>parseExtractionResponse({output_text:JSON.stringify({company:'If',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances})});
function pipeline(products,side='existing',docs=1){const batch=planExtractionBatches(Array.from({length:docs},(_,i)=>({side,documentIndex:i,text:'Synthetic insurance',pages:1})))[0];return sanitizeAnalysisDocumentForClient(mergeBatchResults([{batch,agreement:enrichBatch(agreement(products),batch,telemetry())}],side,false));}
const pol=d=>d.insuranceData.insurances;
const compare=(left,right)=>{const groups=groupInsurances(pol(left),pol(right),null);return {groups,raw:createDifferences(left,right,groups,null),shown:presentImportantDifferences(createDifferences(left,right,groups,null),groups,null)};};
for(const count of [1,3])test(`${count} synthetic PDF sources preserve three distinct new products and fact attribution`,()=>{
 const result=pipeline(types.map((type,i)=>raw(type,count===1?1:i+1)),'existing',count);
 assert.deepEqual(pol(result).map(p=>p.type),types);
 for(const [i,p] of pol(result).entries()){
  assert.match(p.catalogReference.productId,new RegExp(prefix(types[i])));assert.equal(p.productName,'Kasko – PRIVATE_OBJECT');
  const fact=p.importantTerms.find(t=>t.value==='12 000 kr');assert.equal(fact.sources[0].documentId,`pdf:existing:${count===1?0:i}`);
  assert.equal(fact.coverageOrigin,'document');assert.ok(p.catalogFacts.some(f=>/8 000/.test(f.value)));
 }
});
for(const type of types)test(`${type} compares effective values and shows only relevant scoped concepts`,()=>{
 const result=compare(pipeline([raw(type,1,'12 000 kr')]),pipeline([raw(type,1,'9 000 kr')],'offer'));
 assert.equal(result.groups.length,1);assert.equal(result.groups[0].key,normalizeInsuranceType(type));
 const term=groupTerms(result.groups[0],null).find(t=>t.key===`${prefix(type)}.brann.egenandel`);assert.equal(term.first,'12 000 kr');assert.equal(term.second,'9 000 kr');
 assert.ok(result.shown.some(d=>d.conceptId===`${normalizeInsuranceType(type)}.brann`));assert.ok(result.shown.every(d=>!['bil.maskinskade','bil.leiebil','bil.totalskade'].includes(d.conceptId)));
});
test('one-sided Kasko does not silently disappear or imply no insurance',()=>{
 const existing=pipeline([raw('Campingvogn')]);const offer=pipeline([{...raw('Campingvogn'),productName:'Delkasko',canonicalProductName:'Delkasko'}],'offer');
 assert.equal(canonicalCoverage(pol(existing)[0],'Campingvogn','campingvogn.kasko.dekning').status,'selected');
 assert.equal(canonicalCoverage(pol(offer)[0],'Campingvogn','campingvogn.kasko.dekning').status,'unknown');
 assert.ok(compare(existing,offer).shown.some(d=>d.conceptId==='campingvogn.kasko'));
});
for(const type of types)test(`${type}: objects survive merge, but MULTI_OBJECT_MATCHING_GAP is explicit`,()=>{
 const docs=[0,1].map(documentIndex=>({side:'existing',documentIndex,text:'x '.repeat(45000),pages:1}));
 const batches=planExtractionBatches(docs);assert.equal(batches.length,2);
 const results=batches.map(batch=>({batch,agreement:enrichBatch(agreement([raw(type)]),batch,telemetry())}));
 const first=mergeBatchResults(results,'existing',false),second=mergeBatchResults([...results].reverse(),'existing',false);
 assert.deepEqual(first,second);assert.equal(pol(first).length,2);assert.notEqual(pol(first)[0].analysisObjectId,pol(first)[1].analysisObjectId);
 const groups=groupInsurances(pol(first),pol(second),null);assert.equal(groups.length,1);assert.equal(groups[0].first.length,2,'type group is not a matched insured object');
});
test('missing product is visible in both detail groups and overview',()=>{
 const existing=pipeline(types.map(t=>raw(t)));const offer=pipeline(types.slice(1).map(t=>raw(t)),'offer');const result=compare(existing,offer);
 const missing=result.groups.find(g=>g.key==='snøscooter');assert.equal(missing.first.length,1);assert.equal(missing.second.length,0);
 assert.ok(result.raw.some(d=>d.insuranceKey==='snøscooter'));
 assert.equal(result.shown.some(d=>d.insuranceKey==='snøscooter'&&d.kind==='object'),true);
});
for(const [left,right] of [['Snøscooter','Campingvogn'],['Campingvogn','Tilhenger'],['Tilhenger','Bil']])test(`semantic isolation ${left}/${right}`,async()=>{
 let calls=0;const plan=await runHybridMatching([raw(left)],[raw(right)],async()=>{calls++;return {decisions:[]};});assert.equal(calls,0);assert.equal(plan.insuranceMatches.length,0);assert.equal(plan.termMatches.length,0);
});
for(const type of types)test(`privacy-safe audit accepts ${type} keys but never object labels`,async()=>{
 const t=telemetry();await runHybridMatching([{...raw(type),importantTerms:[{name:'PRIVATE_LABEL',key:`${prefix(type)}.brann.egenandel`,value:'PRIVATE_VALUE'}]}],[{...raw(type),importantTerms:[{name:'PRIVATE_OTHER',value:'PRIVATE_OTHER_VALUE'}]}],async()=>({decisions:[]}),t.semanticMatcher);
 const audit=t.snapshot(200).semanticMatcher.audit;assert.ok(audit.candidates.some(c=>c.detailId===`${prefix(type)}.brann.egenandel`));assert.doesNotMatch(JSON.stringify(audit),/PRIVATE/);
});
for(const partial of [false,true])test(`10+10 PDF pipeline: typed progress, concurrency, provenance and partial=${partial}`,async()=>{
 const t=telemetry(),events=[];let calls=0,active=0,peak=0;
 const result=await analyzePdfBatches({sides:['existing','offer'].map(side=>({side,files:Array.from({length:10},(_,i)=>({data:new Uint8Array([i+1])}))})),controller:new AbortController(),telemetry:t,emit:e=>events.push(e),
 parse:async pdf=>{if(partial&&pdf.data[0]===10)throw new PdfSecurityError(422,'missing_text_layer','Synthetic unavailable text');return {text:'Synthetic public-free document',pages:1,parseMs:1,textMs:1};},
 extract:async batch=>{calls++;peak=Math.max(peak,++active);await Promise.resolve();active--;return agreement(batch.documents.map((doc,i)=>raw(['Bil',...types][doc.documentIndex%4],i+1)));}});
 assert.equal(calls,2);assert.ok(peak<=2);assert.equal(result.partialSuccess,partial);assert.equal(result.successfulDocuments,partial?18:20);
 assert.ok(events.filter(e=>e.type==='product_status').some(e=>e.insuranceType==='snøscooter'));assert.doesNotMatch(JSON.stringify(events),/PRIVATE/);
 const existing=mergeBatchResults(result.results,'existing',partial),offer=mergeBatchResults([...result.results].reverse(),'offer',partial);
 assert.equal(pol(existing).length,partial?9:10);assert.equal(new Set(pol(existing).map(p=>p.analysisObjectId)).size,pol(existing).length);
 assert.equal(groupInsurances(pol(existing),pol(offer),null).length,4);assert.equal(existing.insuranceData.totalAnnualPremium,null);
 for(const p of pol(existing))assert.ok(p.documentReferences[0].side==='existing');
});
const require=createRequire(import.meta.url);
async function component(file){const absolute=path.resolve(file);let code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;code=code.replace(/from "([^"]+)"/g,(_,s)=>`from "${pathToFileURL(s.startsWith('.')?path.resolve(path.dirname(absolute),s):require.resolve(s)).href}"`);return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));}
const {VehiclePriceList}=await component('app/components/vehicle-price.tsx');
const {AnalysisProgress}=await component('app/components/analysis-progress.tsx');
const price=(type,values)=>({...raw(type),annualPremium:values[2]??values[0],importantTerms:values.flatMap((value,i)=>value?[{key:['premie.ekskl_tfa','premie.tfa','premie.total'][i],name:'Price',value,coverageOrigin:'document'}]:[])});
for(const type of types)test(`${type} price rendering has no synthetic TFA, total or zero`,()=>{
 const insurance=price(type,['1 000 kr',null,null]);const html=renderToStaticMarkup(React.createElement(VehiclePriceList,{insurance}));assert.doesNotMatch(html,/>TFA</);assert.match(html,/1 000 kr/);assert.equal(vehiclePrices(insurance)[2].value,null);assert.equal(groupValue([insurance],'annualPremium'),'1 000 kr');
 assert.equal(vehiclePriceDifferences(insurance,price(type,[null,null,'2 000 kr'])).length,0);
});
test('snow with documented TFA renders all three distinct values',()=>{
 const html=renderToStaticMarkup(React.createElement(VehiclePriceList,{insurance:price('Snøscooter',['1 000 kr','100 kr','1 100 kr'])}));for(const value of ['Forsikringspris','TFA','Totalt','1 000 kr','100 kr','1 100 kr'])assert.ok(html.includes(value));
});
test('new types use friendly progress labels through existing registry',()=>{
 const state={status:'analyzing',documents:[],products:types.map((type,i)=>({type:'product_status',side:'existing',batchIndex:0,productIndex:i,insuranceType:normalizeInsuranceType(type),status:'identified'}))};
 const html=renderToStaticMarkup(React.createElement(AnalysisProgress,{state}));for(const type of types)assert.ok(html.includes(type));assert.doesNotMatch(html,/Ukjent forsikringstype/);
});
for(const type of types)test(`${type}: source-backed equipment limits compare across providers`,()=>{
 const leftCompany=type==='Snøscooter'?'Gjensidige':'Tryg';
 const existing=pipeline([{...raw(type),company:leftCompany,importantTerms:[]}]);
 const offer=pipeline([{...raw(type),company:'Frende',importantTerms:[]}],'offer');
 const result=compare(existing,offer);
 const term=groupTerms(result.groups[0],null).find(t=>t.key===`${prefix(type)}.utstyr.grense`);
 assert.match(term.first,/10 000/);assert.match(term.second,/20 000/);
 assert.notEqual(pol(existing)[0].catalogReference.providerId,pol(offer)[0].catalogReference.providerId);
 assert.ok(result.shown.some(d=>d.conceptId===`${normalizeInsuranceType(type)}.utstyr`));
});
