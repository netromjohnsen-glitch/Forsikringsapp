import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {applyProgress,emptyProgress} from '../lib/analysis-progress.ts';
import {vehiclePrices,vehiclePriceDifferences,differentVehiclePriceBasis} from '../lib/vehicle-price-presentation.ts';
import {createDifferences,groupInsurances} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
const require=createRequire(import.meta.url);
async function component(file) {
 const absolute=path.resolve(file);
 let code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 code=code.replace(/from "([^"]+)"/g,(_,specifier)=>`from "${pathToFileURL(specifier.startsWith('.')?path.resolve(path.dirname(absolute),specifier):require.resolve(specifier)).href}"`);
 return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
const {AnalysisProgress}=await component('app/components/analysis-progress.tsx');
const {VehiclePriceList}=await component('app/components/vehicle-price.tsx');
const render=(state)=>renderToStaticMarkup(React.createElement(AnalysisProgress,{state}));
function state(count=2) {return applyProgress(emptyProgress(),{type:'analysis_started',existingDocumentCount:count,offerDocumentCount:1});}
const doc=(status,index=0)=>({type:'document_status',side:'existing',documentIndex:index,status});
const product=(status='completed',insuranceType='bil',index=0)=>({type:'product_status',side:'existing',batchIndex:0,productIndex:index,insuranceType,status});
test('analyzing panel is prominent and separates existing/offer responsively',()=>{
 const html=render(state());assert.match(html,/Analyserer forsikringene/);assert.match(html,/Eksisterende/);assert.match(html,/Nytt tilbud/);assert.match(html,/sm:grid-cols-2/);assert.match(html,/rounded-2xl/);
});
for(const [status,label] of [['queued','Venter'],['analyzing','Analyseres'],['completed','Ferdig'],['failed','Kunne ikke analyseres']])test(`document ${status} has text and status icon`,()=>{
 const html=render({...state(),documents:[doc(status)]});assert.match(html,new RegExp(label));assert.match(html,/aria-hidden="true"/);
});
test('no product appears before identification; completed products get real friendly type',()=>{
 assert.doesNotMatch(render(state()),/Identifiserte produkter/);
 const html=render({...state(),products:[product()]});assert.match(html,/Bil: Ferdig/);
});
test('partial analysis has warning and explicit successful/failed count',()=>{
 const html=render({...state(),status:'partial',documents:[doc('completed'),doc('failed',1)]});assert.match(html,/ferdig med merknader/);assert.match(html,/1 av 2 dokumenter analysert/);assert.match(html,/1 dokument kunne ikke analyseres/);assert.match(html,/ufullstendig/);assert.match(html,/role="alert"/);
});
test('completed panel is compact with collapsed details and product count',()=>{
 const html=render({...state(),status:'completed',documents:[doc('completed')],products:[product(),product('completed','reise',1)]});assert.match(html,/Analysen er ferdig/);assert.match(html,/2 forsikringsprodukter/);assert.match(html,/<details /);assert.doesNotMatch(html,/<details[^>]*open|<progress/);
});
test('progressbar percentage measures only processed real documents including isolated failure',()=>{
 const html=render({...state(),documents:[doc('completed'),doc('failed',1),doc('analyzing',2),doc('queued',3)]});assert.match(html,/50 %/);assert.match(html,/value="2" max="4"/);assert.match(html,/2 av 4 dokumenter behandlet/);
});
test('upload and final preparation are indeterminate, not fake 100 percent completion',()=>{
 for(const s of [{...emptyProgress(),status:'uploading'},{...state(),documents:[doc('completed')]}]){const html=render(s);assert.match(html,/<progress/);assert.doesNotMatch(html,/<progress[^>]* value=/);assert.doesNotMatch(html,/100 %/);}
 const source=fs.readFileSync('app/components/analysis-progress.tsx','utf8');assert.doesNotMatch(source,/setInterval|setTimeout|Math.random|Date.now/);
});
test('multiple documents and multiproduct PDF are displayed only from state',()=>{
 const html=render({...state(),products:[product(),product('completed','bolig',1),product('completed','innbo',2),product('completed','reise',3)]});assert.match(html,/Dokument 2/);for(const type of ['Bil','Hus','Innbo','Reise'])assert.match(html,new RegExp(`${type}: Ferdig`));
});
test('PII-like raw insurance type and arbitrary fields are never rendered in progress',()=>{
 const html=render({...state(),products:[{...product('identified','PRIVATE_PERSON'),filename:'PRIVATE_FILENAME'}]});assert.doesNotMatch(html,/PRIVATE/);assert.match(html,/Ukjent forsikringstype/);
});
test('progress is accessible beyond color',()=>{
 const html=render(state());for(const attr of ['aria-live="polite"','role="status"','aria-label="Behandlede dokumenter"','aria-valuetext='])assert.ok(html.includes(attr));
});
const insurance=(type='Bil',values=['12 457 kr','2 329 kr','14 786 kr'])=>({type,productName:'Kasko',annualPremium:values[2]??values[0]??null,deductible:null,coverageSummary:null,importantTerms:values.flatMap((value,i)=>value?[{key:['premie.ekskl_tfa','premie.tfa','premie.total'][i],name:'Original label',value,coverageOrigin:'document'}]:[])});
const offer=()=>insurance('Bil',['9 518 kr','3 270 kr','12 788 kr']);
const diffs=(left,right)=>{const first={insuranceData:{company:'Gjensidige',totalAnnualPremium:left.annualPremium,insurances:[left]}},second={insuranceData:{company:'Gjensidige',totalAnnualPremium:right.annualPremium,insurances:[right]}};const groups=groupInsurances([left],[right],null);return presentImportantDifferences(createDifferences(first,second,groups,null),groups,null);};
test('vehicle labels and values use all three separate canonical fields',()=>{
 const html=renderToStaticMarkup(React.createElement(VehiclePriceList,{insurance:insurance()}));for(const value of ['Forsikringspris','TFA','Totalt','12 457 kr','2 329 kr','14 786 kr'])assert.ok(html.includes(value));assert.doesNotMatch(html,/Premie ekskl/);
});
for(const [index,key] of ['premie.ekskl_tfa','premie.tfa','premie.total'].entries())test(`price field ${key} maps exactly and is never derived`,()=>{
 const result=vehiclePrices(insurance());assert.equal(result[index].key,key);assert.equal(result[index].value,['12 457 kr','2 329 kr','14 786 kr'][index]);
});
test('Gjensidige regression keeps insurance delta 2939 separate from total delta 1998',()=>{
 const values=vehiclePriceDifferences(insurance(),offer());assert.deepEqual(values.map(v=>v.deltaOre),[-293900,-199800]);
 const result=diffs(insurance(),offer());assert.deepEqual(result.filter(d=>d.type==='price').map(d=>d.title),['Forsikringspris','Totalt']);assert.match(result[0].text.replaceAll('\u00a0',' '),/2 939 kr billigere/);assert.match(result[1].text.replaceAll('\u00a0',' '),/1 998 kr billigere/);
});
test('TFA is shown even when equal and never gets a company-price saving claim',()=>{
 const other=offer();other.importantTerms[1].value='2 329 kr';assert.equal(vehiclePrices(other)[1].value,'2 329 kr');assert.ok(diffs(insurance(),other).every(d=>d.termKey!=='premie.tfa'));
 assert.ok(diffs(insurance(),offer()).every(d=>d.termKey!=='premie.tfa'));
});
for(const missing of [0,2])test(`missing ${missing===0?'insurance premium':'total'} never produces a false delta`,()=>{
 const values=['9 518 kr','3 270 kr','12 788 kr'];values[missing]=null;const result=vehiclePriceDifferences(insurance(),insurance('Bil',values));assert.ok(result.every(d=>d.key!==(missing===0?'premie.ekskl_tfa':'premie.total')));
});
test('exclusive premium cannot be compared to inclusive total, including root annual premium',()=>{
 const left=insurance('Bil',['12 457 kr',null,null]),right=insurance('Bil',[null,null,'12 788 kr']);assert.equal(differentVehiclePriceBasis(left,right),true);assert.equal(diffs(left,right).filter(d=>d.type==='price').length,0);
});
test('total is not computed from insurance price and TFA',()=>assert.equal(vehiclePrices(insurance('Bil',['100 kr','20 kr',null]))[2].value,null));
for(const type of ['MC','Bobil','Campingvogn','Varebil','Motorvognforsikring'])test(`${type} uses vehicle price presentation without collapsing its type`,()=>{
 const result=vehiclePrices(insurance(type));assert.equal(result[0].label,'Forsikringspris');assert.equal(result[2].value,'14 786 kr');
});
for(const type of ['Hus','Innbo','Reise','Barn','Liv','Båt'])test(`${type} does not gain TFA fields`,()=>{
 assert.equal(vehiclePrices(insurance(type)),null);assert.equal(renderToStaticMarkup(React.createElement(VehiclePriceList,{insurance:insurance(type)})),'');
});
test('conflicting amounts, monthly prices, ranges and missing evidence are not compared',()=>{
 for(const value of ['100 kr per måned','100–200 kr','Fra 100 kr']){const left=insurance('Bil',[value,null,null]);assert.equal(vehiclePriceDifferences(left,offer()).length,0);}
 const left=insurance();left.importantTerms.push({...left.importantTerms[0],value:'100 kr'});assert.ok(vehiclePriceDifferences(left,offer()).every(d=>d.key!=='premie.ekskl_tfa'));
});
test('MC price aliases reuse existing canonical price facts and preserve source',()=>{
 const source={documentId:'test',filename:'Dokument 1',termsNumber:'',effectiveFrom:'',page:1,section:'Pris'};
 const raw={...insurance('MC'),addOns:[],importantTerms:[{name:'Premie ekskl trafikkforsikringsavgift',value:'100 kr',sources:[source]}]};
 const normalized=normalizeDocumentFacts(raw);assert.equal(normalized[0].key,'premie.ekskl_tfa');assert.deepEqual(normalized[0].sources,[source]);
});

test('catalog price availability is not an individually documented premium',()=>{
 const item=insurance();item.importantTerms=item.importantTerms.map(t=>({...t,coverageOrigin:'catalog'}));assert.ok(vehiclePrices(item).every(f=>f.value===null));
});
test('two raw PDF annualPremium fields with unknown TFA basis never produce vehicle savings',()=>{
 const left=insurance('Bil',[]),right=insurance('Bil',[]);left.annualPremium='100 kr';right.annualPremium='200 kr';assert.equal(diffs(left,right).filter(d=>d.type==='price').length,0);
});
test('manual input does not bypass different explicitly documented price bases',()=>{
 const left=insurance('Bil',['100 kr',null,null]),right=insurance('Bil',[null,null,'200 kr']);
 const docs=[left,right].map(i=>({source:'manual',insuranceData:{company:'Test',totalAnnualPremium:i.annualPremium,insurances:[i]}}));
 assert.equal(createDifferences(docs[0],docs[1],groupInsurances([left],[right],null),null).filter(d=>d.type==='price').length,0);
});
test('manual completion does not invent document or extracted product counts',()=>{
 const html=render({...emptyProgress(),status:'completed'});assert.match(html,/Registrerte opplysninger er sammenlignet/);assert.doesNotMatch(html,/0 av 0/);
});
test('price presentation preserves the canonical fact sources',()=>{
 const item=insurance(),source={documentId:'pdf:existing:0',filename:'Dokument 1',page:1,section:'Pris'};item.importantTerms[0].sources=[source];assert.deepEqual(vehiclePrices(item)[0].sources,[source]);
});
