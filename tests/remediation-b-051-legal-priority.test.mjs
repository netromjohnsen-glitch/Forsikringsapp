import {withoutVacancy,vacancyCatalogBaselineHash} from './helpers/b130-vacancy.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {deserialize,serialize} from 'node:v8';
import {createHash} from 'node:crypto';
import {productCatalog} from '../lib/product-catalog.ts';
import {enrichExtractedAgreementWithCatalog,enrichConsolidatedInsurance} from '../lib/catalog-enrichment.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms,groupAddOnNames} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
const dir=new URL('../docs/audit/checkpoints/b051-legal-priority-2b198f9/',import.meta.url);
const key='hus.rettshjelp.dekning',generic='rettshjelp.dekning',date=new Date('2026-10-22T12:00:00Z');
const ids=['gjensidige-hus','gjensidige-hus-pluss'];
const product=id=>productCatalog.products.find(p=>p.productId===id);
const record=(id,role,values)=>({company:'Gjensidige',type:'Hus',agreementScope:'ordinary',productName:product(id).name,canonicalProductName:product(id).name,annualPremium:null,deductible:null,coverageSummary:null,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],documentRole:role,importantTerms:values.map(value=>({name:'Rettshjelp',value,documentIndices:[1]})),addOns:[]});
const legal=i=>deriveCanonicalCoverages(i,'Hus').filter(c=>c.id===key||c.id===generic);
const terms=i=>i.importantTerms.filter(t=>t.key===key||t.key===generic);
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const cases=[[[],'selected',false],[['Valgt'],'selected',false],[['Ikke valgt'],'not_selected',false],[['Valgt','Ikke valgt'],'unknown',true],[['Kundevilkår 73 000 kr'],'selected',false],[['Ukjent'],'selected',false]];
const observations=[];
for(const id of ids)for(const side of ['existing','offer'])for(const role of ['individual_agreement','unknown'])for(const[values,status,conflict]of cases)test(`LEGAL-PRIORITY pipeline ${id}/${side}/${role}/${values}`,()=>{
 const out=documentPipeline([[record(id,role,values)]],side).insuranceData;
 assert.equal(out.insurances.length,1);const first=out.insurances[0];
 for(const i of [first,repeat(first),repeat(repeat(first))]){
  const states=legal(i);assert.equal(states.length,1);assert.equal(states[0].id,key);assert.equal(states[0].status,status);assert.equal(states[0].conflict,conflict);
  assert.equal(i.importantTerms.some(t=>t.key===generic),false);assert.deepEqual(i.addOnIds,[]);
  if(values.length&&values[0]!=='Ukjent'){
   assert.deepEqual(terms(i).map(t=>t.value),values);assert.ok(terms(i).every(t=>t.coverageOrigin==='document'));
   for(const t of terms(i))assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);
  }
  if(status==='not_selected'||conflict)assert.equal(i.importantTerms.some(t=>t.coverageOrigin==='catalog'&&t.key?.startsWith('hus.rettshjelp.')),false);
 }
 observations.push({id,side,role,values,status,conflict,actual:legal(first).map(c=>({id:c.id,status:c.status,conflict:c.conflict}))});
});
for(const id of ids)for(const side of ['existing','offer'])test(`LEGAL-PRIORITY supporting separation ${id}/${side}`,()=>{
 const supporting=record(id,'general_terms',['Valgt']);
 const alone=documentPipeline([[supporting]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
 const out=documentPipeline([[record(id,'individual_agreement',['Ikke valgt'])],[supporting]],side).insuranceData;
 assert.equal(out.insurances.length,1);assert.equal(out.supportingEvidence.length,1);assert.equal(legal(out.insurances[0])[0].status,'not_selected');
 assert.equal(out.supportingEvidence[0].importantTerms[0].value,'Valgt');
});
for(const id of ids)for(const side of ['existing','offer'])test(`LEGAL-PRIORITY unproven object identity stays separate ${id}/${side}`,()=>{
 const out=documentPipeline([[record(id,'individual_agreement',['Valgt'])],[record(id,'individual_agreement',['Ikke valgt'])]],side).insuranceData;
 assert.equal(out.insurances.length,2);
 assert.deepEqual(out.insurances.map(i=>legal(i)[0].status).sort(),['not_selected','selected']);
 assert.ok(out.insurances.every(i=>legal(i).length===1&&!legal(i)[0].conflict));
});
for(const id of ids)test(`LEGAL-PRIORITY already resolved same-object conflict preserves both sources ${id}`,()=>{
 const values=['Valgt','Ikke valgt'];
 const source=index=>({documentId:`pdf:existing:${index}`,filename:`Dokument ${index+1}`,termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Rettshjelp',documentRole:'individual_agreement'});
 const ts=values.map((value,index)=>({name:'Rettshjelp',value,key:generic,coverageOrigin:'document',sources:[source(index)]}));
 const first=enrichConsolidatedInsurance('Gjensidige',record(id,'individual_agreement',[]),ts,date);
 for(const i of [first,repeat(first)]){
  const c=legal(i);assert.equal(c.length,1);assert.equal(c[0].status,'unknown');assert.equal(c[0].conflict,true);
  assert.deepEqual([...new Set(c[0].sources.map(s=>s.documentId))].sort(),['pdf:existing:0','pdf:existing:1']);
 }
});
for(const id of ids)test(`LEGAL-PRIORITY direct generic/precise identity and customer sources ${id}`,()=>{
 for(const canonicalKey of [undefined,generic,key]){
  const source={documentId:'synthetic:legal',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Rettshjelp'};
  const input={company:'Gjensidige',totalAnnualPremium:null,insurances:[{...record(id,'individual_agreement',[]),importantTerms:[{name:'Rettshjelp',value:'Ikke valgt',...(canonicalKey?{canonicalKey}:{}),source}]}]};
  const i=enrichExtractedAgreementWithCatalog(input,date).insurances[0];assert.equal(legal(i).length,1);assert.equal(legal(i)[0].status,'not_selected');assert.deepEqual(terms(i)[0].source,source);
 }
});
for(const id of ids)test(`LEGAL-PRIORITY both customer comparison directions ${id}`,()=>{
 const a=documentPipeline([[record(id,'individual_agreement',['Ikke valgt'])]],'existing').insuranceData.insurances[0];
 const b=documentPipeline([[record(id,'individual_agreement',['Valgt'])]],'offer').insuranceData.insurances[0];
 for(const[x,y,side]of[[a,b,'first'],[b,a,'second']]){
  const rows=groupTerms(groupInsurances([x],[y],null)[0],null);assert.equal(rows.filter(r=>r.key===key).length,1);assert.equal(rows.some(r=>r.key===generic),false);
  const r=rows.find(r=>r.key===key);assert.equal(r[side],'Ikke valgt');assert.equal(r[side+'Sources'][0].documentRole,'individual_agreement');
 }
});
test('LEGAL-PRIORITY all other 202 catalog products preserve exact baseline enrichment output',()=>{
 const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir))),bytes=readFileSync(new URL('other-product-baseline.v8.gz',dir));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.snapshot_sha256);const cases=deserialize(gunzipSync(bytes));assert.equal(cases.length,202);
 for(const c of cases){if(c.error)assert.throws(()=>enrichExtractedAgreementWithCatalog(c.input,date),{message:c.error},c.id);else assert.deepEqual(enrichExtractedAgreementWithCatalog(c.input,date),c.output,c.id);}
 assert.equal(createHash('sha256').update(serialize(withoutVacancy(productCatalog))).digest('hex'),vacancyCatalogBaselineHash);
});
test('LEGAL-PRIORITY no global alias; unknown product/scope/type/version cannot gain scoped identity',()=>{
 for(const changes of [{productName:'Ukjent',canonicalProductName:'Ukjent'},{type:'Innbo'},{agreementScope:'nito'},{company:'Ukjent'}]){
  const i={...record(ids[0],'individual_agreement',['Ikke valgt']),...changes};
  const out=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];assert.equal(out.importantTerms.some(t=>t.key===key),false);
 }
 const catalog=structuredClone(productCatalog);for(const id of ids)catalog.products.find(p=>p.productId===id).version='Unknown version';
 const i={...record(ids[0],'individual_agreement',['Ikke valgt']),importantTerms:[{name:'Rettshjelp',canonicalKey:generic,value:'Ikke valgt'}]};
 const out=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,catalog).insurances[0];
 assert.ok(out.importantTerms.some(t=>t.key===generic));
});
for(const id of ids)test(`LEGAL-PRIORITY explicit unrelated keys and details are never remapped ${id}`,()=>{
 for(const other of ['glass.dekning','hus.rettshjelp.grense']){
  const source={documentId:'synthetic:precise',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Kundens særvilkår'};
  const i=enrichConsolidatedInsurance('Gjensidige',record(id,'individual_agreement',[]),[{name:'Rettshjelp',value:'Kundeverdi 9 000 kr',key:other,coverageOrigin:'document',source}],date);
  const t=i.importantTerms.find(t=>t.key===other);assert.ok(t);assert.equal(t.value,'Kundeverdi 9 000 kr');assert.deepEqual(t.source,source);
 }
});
for(const id of ids)for(const values of [['Ikke valgt'],['Valgt','Ikke valgt'],['Valgt']])test(`LEGAL-PRIORITY base cover cannot appear as a selected addon ${id}/${values}`,()=>{
 const recordWithAddon={...record(id,'individual_agreement',values),addOns:[{name:'Rettshjelp',annualPremium:null,deductible:null,importantTerms:[{name:'Dokumentert egenandel',value:'4 000 kr',documentIndices:[1]}]}]};
 const first=documentPipeline([[recordWithAddon]],'existing').insuranceData.insurances[0];
 for(const i of [first,repeat(first),repeat(repeat(first))]){
  assert.equal(i.addOns.length,1);assert.equal(i.addOns[0].name,'Rettshjelp');assert.equal(i.addOns[0].classification,'standard');
  assert.ok(i.addOns[0].importantTerms.some(t=>t.value==='4 000 kr'));
  assert.equal(groupAddOnNames([i],'Hus'),null);assert.equal(legal(i).length,1);
  assert.equal(legal(i)[0].status,values.length===2?'unknown':values[0]==='Valgt'?'selected':'not_selected');
 }
});
process.on('exit',()=>{if(process.env.LEGAL_PRIORITY_PROBE_FILE)writeFileSync(process.env.LEGAL_PRIORITY_PROBE_FILE,JSON.stringify(observations,null,2)+'\n');});
