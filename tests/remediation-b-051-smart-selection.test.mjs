import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {serialize,deserialize} from 'node:v8';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts,catalogReferenceForProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,enrichConsolidatedInsurance} from '../lib/catalog-enrichment.ts';
import {groupAddOnNames,groupInsurances,groupTerms} from '../lib/comparison.ts';
import {resolveHouseSmartDocumentSelection,houseSmartTermKey} from '../lib/hus-smart-selection.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';

const audit=new URL('../docs/audit/checkpoints/b051-smart-selection-85be811/',import.meta.url);
const ids=['gjensidige-hus','gjensidige-hus-pluss'],parent='hus.service.smart',addonId='gjensidige-hus-smart';
const keys=[parent,'hus.service.smart.avtale','hus.sikkerhet.egenandelsreduksjon'];
const date=new Date('2026-10-23T12:00:00Z');
const product=id=>productCatalog.products.find(p=>p.productId===id);
const record=(id,role,values,addon=false)=>({company:'Gjensidige',type:'Hus',agreementScope:'ordinary',productName:product(id).name,canonicalProductName:product(id).name,documentRole:role,objectIdentifiers:[],agreementPeriod:null,documentIndices:[1],annualPremium:null,deductible:null,coverageSummary:null,importantTerms:values.map(value=>({name:'Hus Smart',value,canonicalKey:null,documentIndices:[1]})),addOns:addon?[{name:'Hus Smart',annualPremium:null,deductible:null,importantTerms:[]}]:[]});
const selection=(id,i)=>resolveHouseSmartDocumentSelection(product(id),i);
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const observation=[];
const cases=[['absent',[],false,'unknown',false],['addon-only',[],true,'selected',false],['yes-term',['Valgt'],false,'selected',false],['yes-addon',['Valgt'],true,'selected',false],['no-term',['Ikke valgt'],false,'not_selected',false],['no-addon',['Ikke valgt'],true,'not_selected',false],['conflict',['Valgt','Ikke valgt'],true,'unknown',true],['unknown',['Ukjent'],true,'unknown',false],['description',['Valgfri alarmtjeneste; kan kjøpes separat.'],false,'unknown',false],['condition',['Når Hus Smart er valgt, gjelder egne avtalevilkår.'],false,'unknown',false]];
for(const id of ids)for(const side of ['existing','offer'])for(const role of ['individual_agreement','unknown'])for(const[name,values,addon,status,conflict]of cases)test(`SMART-SELECTION pipeline ${id}/${side}/${role}/${name}`,()=>{
 const first=documentPipeline([[record(id,role,values,addon)]],side).insuranceData.insurances[0];
 const states=[first,repeat(first),repeat(repeat(first))];
 for(const i of states){
  const state=selection(id,i);assert.equal(state?.status??'unknown',status);assert.equal(state?.conflict??false,conflict);
  assert.deepEqual(i.addOnIds,status==='selected'?[addonId]:[]);assert.equal(groupAddOnNames([i],'Hus'),status==='selected'?'Hus Smart':null);
  assert.equal(i.deductible,null);assert.equal(i.annualPremium,null);
  const customer=i.importantTerms.filter(t=>t.key===parent&&t.coverageOrigin==='document');
  assert.deepEqual(customer.map(t=>t.value),name==='addon-only'?['Valgt']:values);
  for(const t of customer)assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);
  const catalogSmart=i.importantTerms.filter(t=>keys.includes(t.key)&&t.coverageOrigin==='catalog');
  assert.equal(catalogSmart.length,status==='selected'?2:0);
  if(status==='selected')for(const t of catalogSmart){const expected=resolveCatalogFacts(product(id),[addonId],date).find(f=>f.key===t.key);assert.equal(t.value,expected.value);assert.deepEqual(t.source,expected.source);}
 }
 assert.deepEqual(states[1].importantTerms.filter(t=>keys.includes(t.key)),states[0].importantTerms.filter(t=>keys.includes(t.key)));
 observation.push({id,side,role,name,values,status,conflict,actual:selection(id,first),addOnIds:first.addOnIds,display:groupAddOnNames([first],'Hus')});
});

for(const id of ids)for(const side of ['existing','offer'])test(`SMART-SELECTION supporting separation ${id}/${side}`,()=>{
 const general=record(id,'general_terms',['Valgt'],true);const a=documentPipeline([[general]],side).insuranceData;
 assert.equal(a.insurances.length,0);assert.equal(a.supportingEvidence.length,1);
 const b=documentPipeline([[record(id,'individual_agreement',['Ikke valgt'],true)],[general]],side).insuranceData;
 assert.equal(b.insurances.length,1);assert.equal(b.supportingEvidence.length,1);assert.equal(selection(id,b.insurances[0]).status,'not_selected');assert.equal(groupAddOnNames(b.insurances,'Hus'),null);
 assert.equal(b.supportingEvidence[0].importantTerms[0].value,'Valgt');
});
for(const id of ids)test(`SMART-SELECTION addon terms and details are distinct ${id}`,()=>{
 for(const value of ['Ikke valgt','Ukjent','Valgt']){
  const r=record(id,'individual_agreement',[],true);r.addOns[0].importantTerms=[{name:'Hus Smart',value,canonicalKey:null,documentIndices:[1]},{name:'Alarmtjenestens avtalevilkår',value:'Kundens avtalevilkår',canonicalKey:null,documentIndices:[1]}];
  const i=documentPipeline([[r]]).insuranceData.insurances[0];assert.equal(selection(id,i).status,value==='Valgt'?'selected':value==='Ukjent'?'unknown':'not_selected');assert.equal(groupAddOnNames([i],'Hus'),value==='Valgt'?'Hus Smart':null);
  assert.equal(i.importantTerms.find(t=>t.key==='hus.service.smart.avtale').value,'Kundens avtalevilkår');assert.deepEqual(repeat(i).importantTerms.filter(t=>keys.includes(t.key)),i.importantTerms.filter(t=>keys.includes(t.key)));
 }
 for(const name of ['Hus Smart – redusert egenandel','Alarmtjenestens avtalevilkår']){
  const r=record(id,'individual_agreement',[]);r.importantTerms=[{name,value:'Valgt',canonicalKey:null,documentIndices:[1]}];const i=documentPipeline([[r]]).insuranceData.insurances[0];assert.equal(selection(id,i).status,'unknown');assert.deepEqual(i.addOnIds,[]);assert.equal(groupAddOnNames([i],'Hus'),null);
 }
});
for(const id of ids)test(`SMART-SELECTION same-record conflict retains complete sources ${id}`,()=>{
 const source=n=>({documentId:`pdf:existing:${n}`,filename:`Dokument ${n+1}`,termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Smart',documentRole:'individual_agreement'});
 const ts=['Valgt','Ikke valgt'].map((value,n)=>({name:'Hus Smart',key:parent,value,coverageOrigin:'document',sources:[source(n)]}));
 const i=enrichConsolidatedInsurance('Gjensidige',record(id,'individual_agreement',[],true),ts,date);
 for(const x of [i,repeat(i)]){assert.equal(selection(id,x).conflict,true);assert.equal(selection(id,x).status,'unknown');assert.deepEqual(selection(id,x).sources,[source(0),source(1)]);assert.deepEqual(x.addOnIds,[]);assert.equal(groupAddOnNames([x],'Hus'),null);}
});
for(const id of ids)test(`SMART-SELECTION status headings are local to the documented addon ${id}`,()=>{
 for(const name of ['Valg','Valgstatus','Status','Dekning'])for(const value of ['Ikke valgt','Ukjent','Valgt']){
  const r=record(id,'individual_agreement',[],true);r.addOns[0].importantTerms=[{name,value,canonicalKey:null,documentIndices:[1]}];const i=documentPipeline([[r]]).insuranceData.insurances[0];
  assert.equal(selection(id,i).status,value==='Valgt'?'selected':value==='Ikke valgt'?'not_selected':'unknown');assert.equal(groupAddOnNames([i],'Hus'),value==='Valgt'?'Hus Smart':null);assert.equal(houseSmartTermKey({name,value}),null);
 }
});
for(const id of ids)test(`SMART-SELECTION supporting sources cannot supply a customer choice ${id}`,()=>{
 const general={documentId:'terms:smart',filename:'Vilkår',termsNumber:'Smart',effectiveFrom:'',page:1,section:'Generelt',documentRole:'general_terms'};
 const i={...record(id,'unknown',[]),catalogReference:catalogReferenceForProduct(product(id))};i.addOns=[{name:'Hus Smart',importantTerms:[{name:'Hus Smart',value:'Valgt',coverageOrigin:'document',sources:[general]}]}];assert.equal(selection(id,i).status,'unknown');assert.equal(groupAddOnNames([i],'Hus'),null);
});
for(const id of ids)test(`SMART-SELECTION unproved object identity never merges ${id}`,()=>{
 const out=documentPipeline([[record(id,'individual_agreement',['Valgt'])],[record(id,'individual_agreement',['Ikke valgt'])]]).insuranceData;
 assert.equal(out.insurances.length,2);assert.deepEqual(out.insurances.map(i=>selection(id,i).status).sort(),['not_selected','selected']);
});
for(const id of ids)test(`SMART-SELECTION supporting aliases cannot duplicate or replace the customer ${id}`,()=>{
 const customer=record(id,'individual_agreement',['Kundens Smart-vilkår 42 000 kr']);
 const general=record(id,'general_terms',['Generelt alarmvilkår'],true);general.importantTerms.push({name:'Hus Smart – alarmtjeneste',value:'Generelt alarmvilkår',canonicalKey:null,documentIndices:[1]},{name:'Alarmtjenestens avtalevilkår',value:'Generell tjenestebegrensning',canonicalKey:null,documentIndices:[1]});
 const first=documentPipeline([[customer],[general]]).insuranceData.insurances[0];
 for(const i of [first,repeat(first),repeat(repeat(first))]){
  assert.deepEqual(i.importantTerms.filter(t=>t.key===parent).map(t=>t.value),['Kundens Smart-vilkår 42 000 kr']);assert.equal(selection(id,i).status,'unknown');assert.equal(groupAddOnNames([i],'Hus'),null);
  const detail=i.importantTerms.find(t=>t.key==='hus.service.smart.avtale');assert.ok(detail);assert.equal(detail.coverageOrigin,'catalog');assert.ok(detail.sources.every(s=>s.documentRole==='general_terms'));assert.ok(i.recordEvidence.some(e=>e.documentRole==='general_terms'));
 }
});
for(const id of ids)test(`SMART-SELECTION comparison both directions and no generic duplicate ${id}`,()=>{
 const a=documentPipeline([[record(id,'individual_agreement',['Valgt'])]],'existing').insuranceData.insurances[0];
 const b=documentPipeline([[record(id,'individual_agreement',['Ikke valgt'],true)]],'offer').insuranceData.insurances[0];
 for(const[x,y,side]of[[a,b,'first'],[b,a,'second']]){const rows=groupTerms(groupInsurances([x],[y],null)[0],null);assert.equal(rows.filter(r=>r.key===parent).length,1);assert.equal(rows.some(r=>r.key==='hus smart'),false);const row=rows.find(r=>r.key===parent);assert.equal(row[side],'Valgt');assert.equal(row[side+'Sources'][0].documentRole,'individual_agreement');}
});
for(const id of ids)test(`SMART-SELECTION exact aliases preserve other identities ${id}`,()=>{
 const i=enrichConsolidatedInsurance('Gjensidige',record(id,'individual_agreement',['Valgt']),[{name:'Hus Smart',key:'glass.dekning',coverageOrigin:'document',value:'Kundeverdi 9 000 kr'},{name:'Hus Smart',key:parent,coverageOrigin:'document',value:'Valgt'}],date);
 assert.equal(i.importantTerms.find(t=>t.key==='glass.dekning').value,'Kundeverdi 9 000 kr');
 for(const name of ['Smart','Alarm','Innbo Smart']){assert.equal(houseSmartTermKey({name,value:'Valgt'}),null);}
});
test('SMART-SELECTION 202 other products and catalog identity preserve baseline; manual Smart follows explicit-choice contract',()=>{
 const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',audit)));const bytes=readFileSync(new URL('baseline.v8.gz',audit));assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.baseline_sha256);const baseline=deserialize(gunzipSync(bytes));assert.equal(baseline.others.length,202);
 for(const c of baseline.others){if(c.error)assert.throws(()=>enrichExtractedAgreementWithCatalog(c.input,date),{message:c.error},c.id);else assert.deepEqual(enrichExtractedAgreementWithCatalog(c.input,date),c.output,c.id);}
 // Only the newly authorized manual Smart marker, continuation ID and its three
 // keyed catalog rows may differ from this frozen document-choice baseline.
 for(const c of baseline.manual){
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0],expectedFirst=structuredClone(c.first),expectedRepeat=structuredClone(c.repeated);
  if(c.first.addOnIds.includes(addonId)){
   for(const i of [expectedFirst,expectedRepeat])i.addOns.find(a=>a.id===addonId).manualSelection={origin:'manual',addOnId:addonId,catalogReference:{...c.first.catalogReference}};
   expectedRepeat.addOnIds=[...expectedRepeat.addOnIds,addonId];
   expectedRepeat.importantTerms=[...expectedRepeat.importantTerms.filter(t=>!houseSmartTermKey(t)),...structuredClone(c.first.importantTerms.filter(houseSmartTermKey))];
   expectedRepeat.catalogFacts.push(...structuredClone(c.first.catalogFacts.filter(f=>keys.includes(f.key))));
  }
  assert.deepEqual(first,expectedFirst);assert.deepEqual(repeat(first),expectedRepeat);
  const expected=c.first.addOnIds.includes(addonId)?(c.first.addOnIds.length>1?'Hus Smart · Utleie':'Hus Smart'):null;assert.equal(groupAddOnNames([first],'Hus'),expected);assert.equal(groupAddOnNames([repeat(first)],'Hus'),expected);
 }
 assert.equal(createHash('sha256').update(serialize(productCatalog)).digest('hex'),meta.catalog_sha256);
});
test('SMART-SELECTION unknown product/provider/type/scope/version and unavailable component never activate',()=>{
 const r=record(ids[0],'individual_agreement',['Valgt'],true);
 for(const overrides of [{company:'Ukjent'},{type:'Innbo'},{agreementScope:'nito'},{productName:'Ukjent',canonicalProductName:'Ukjent'}]){
  const i=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[{...r,...overrides}]},date).insurances[0];assert.equal(i.importantTerms.some(t=>t.key===parent),false);assert.equal(i.addOnIds?.includes(addonId)??false,false);
 }
 for(const change of [c=>{for(const id of ids)c.products.find(p=>p.productId===id).version='Unknown version';},c=>{c.addOns=c.addOns.filter(a=>a.id!==addonId);}]){
  const catalog=structuredClone(productCatalog);change(catalog);const i=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[r]},date,undefined,undefined,catalog).insurances[0];assert.equal(i.addOnIds.includes(addonId),false);
 }
});
process.on('exit',()=>{if(process.env.SMART_SELECTION_PROBE_FILE)writeFileSync(process.env.SMART_SELECTION_PROBE_FILE,JSON.stringify(observation,null,2)+'\n');});
