import {withoutVacancy,vacancyCatalogBaselineHash} from './helpers/b130-vacancy.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {deserialize,serialize} from 'node:v8';
import {createHash} from 'node:crypto';
import {withHouseCatalogOrigin} from './helpers/house-origin.mjs';
import {productCatalog,findCatalogProduct,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms,groupAddOnNames} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
const dir=new URL('../docs/audit/checkpoints/b051-house-origin-257a197/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
const hash=x=>createHash('sha256').update(x).digest('hex'),meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir)));assert.equal(hash(bytes),meta.baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-23T12:00:00Z'),clean=x=>JSON.parse(JSON.stringify(x));
const term=(name,value)=>({name,value,canonicalKey:null,documentIndices:[1]});
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.role==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const rep=(i,catalog=productCatalog)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,catalog).insurances[0];
const stages=i=>{const a=rep(i),b=rep(a);return[i,a,b,rep(clean(b))];};
const source=n=>({documentId:`synthetic:customer:${n}`,filename:`Kundebevis ${n}.pdf`,termsNumber:'Kundebevis',effectiveFrom:'',page:n+1,section:'Kundens vilkår',documentRole:'individual_agreement'});
const choices=[['silence',[]],['selected',[term('Ubeboelig bolig etter skade','Valgt')]],['refused',[term('Ubeboelig bolig etter skade','Ikke valgt')]],['unknown',[term('Ubeboelig bolig etter skade','Ukjent')]],['conflict',[term('Ubeboelig bolig etter skade','Valgt'),term('Ubeboelig bolig etter skade','Ikke valgt')]],['customer',[term('Ubeboelig bolig etter skade','Kundens særvilkår 13 000 kr')]],['addons',[term('Hus Smart','Valgt'),term('Utleie','Valgt')]]];
for(const id of ids)for(const side of ['existing','offer'])for(const role of ['individual_agreement','unknown'])for(const[name,terms]of choices){
 test(`HOUSE-ORIGIN PDF ${id}/${side}/${role}/${name}`,()=>{
  const first=documentPipeline([[{...raw(id),documentRole:role,importantTerms:terms}]],side).insuranceData.insurances[0];
  const catalog=first.importantTerms.filter(t=>t.coverageOrigin==='catalog'),customer=first.importantTerms.filter(t=>t.coverageOrigin==='document');
  for(const i of stages(first)){
   assert.deepEqual(clean(i.importantTerms.filter(t=>t.coverageOrigin==='catalog')),clean(catalog));
   assert.deepEqual(clean(i.importantTerms.filter(t=>t.coverageOrigin==='document')),clean(customer));
   assert.deepEqual(i.addOnIds,first.addOnIds);assert.equal(groupAddOnNames([i],'Hus'),groupAddOnNames([first],'Hus'));
   assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(first,'Hus')));
   assert.equal(i.annualPremium,first.annualPremium);assert.equal(i.deductible,first.deductible);
  }
  assert.deepEqual(rep(first).importantTerms.filter(t=>t.coverageOrigin==='catalog'),catalog);
  assert.ok(catalog.every(t=>t.source&&t.sources.length));assert.equal(catalog.filter(t=>t.structuredValue).length,7);
 });
}
for(const id of ids){
 test(`HOUSE-ORIGIN manual catalog rows preserve all metadata and notes ${id}`,()=>{
  for(const c of before.controls.filter(c=>c.id===id)){
   const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutVacancy(first),c.first);
   for(const i of stages(first).slice(1)){assert.deepEqual(clean(withoutVacancy(i.importantTerms)).sort((a,b)=>a.key.localeCompare(b.key)),clean(c.first.importantTerms).sort((a,b)=>a.key.localeCompare(b.key)));assert.deepEqual(new Set(i.addOnIds),new Set(c.first.addOnIds));assert.equal(groupAddOnNames([i],'Hus'),groupAddOnNames([first],'Hus'));assert.deepEqual(i.addOns.map(a=>a.manualSelection),first.addOns.map(a=>a.manualSelection));}
  }
 });
 test(`HOUSE-ORIGIN late actual values have same priority as fresh evidence ${id}`,()=>{
  const base=documentPipeline([[raw(id)]]).insuranceData.insurances[0];
  for(const key of ['hus.brukstap.dekning','hus.leietap.skade'])for(const values of [['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundens særvilkår 13 000 kr']]){
   const name=base.importantTerms.find(t=>t.key===key).name;
   const late=rep({...base,importantTerms:[...base.importantTerms,...values.map((value,n)=>({name,value,coverageOrigin:'document',sources:[source(n)]}))]});
   const fresh=documentPipeline([[{...raw(id),importantTerms:values.map(value=>term(name,value))}]]).insuranceData.insurances[0];
   const projection=i=>i.importantTerms.filter(t=>t.key===key).map(t=>({key:t.key,name:t.name,value:t.value,origin:t.coverageOrigin}));
   for(const i of stages(late)){assert.deepEqual(projection(i),projection(fresh));assert.equal(i.importantTerms.filter(t=>t.key===key&&t.coverageOrigin==='document').length,values[0]==='Ukjent'?0:values.length);for(const t of i.importantTerms.filter(t=>t.key===key&&t.coverageOrigin==='document'))assert.deepEqual(t.sources,[source(values.indexOf(t.value))]);}
  }
 });
 test(`HOUSE-ORIGIN uploaded terms keep catalog origin, references and evidence ${id}`,()=>{
  for(const side of ['existing','offer']){
   const r=raw(id),generic={...r,documentRole:'general_terms',importantTerms:[term('Generelt husvilkår','Syntetisk begrensning'),term('Utleie','Valgt')],addOns:[]};
   const data=documentPipeline([[r],[generic]],side).insuranceData,first=data.insurances[0];assert.equal(data.supportingEvidence.length,1);assert.equal(first.addOnIds.length,0);
   for(const i of stages(first)){const t=i.importantTerms.find(t=>t.name==='Generelt husvilkår');assert.equal(t.coverageOrigin,'catalog');assert.deepEqual(t.sources,first.importantTerms.find(t=>t.name==='Generelt husvilkår').sources);assert.ok(t.sources.every(s=>s.documentRole==='general_terms'&&s.documentId===`pdf:${side}:1`));assert.deepEqual(clean(i.recordEvidence),clean(first.recordEvidence));assert.equal(i.addOnIds.length,0);assert.equal(groupAddOnNames([i],'Hus'),null);}
  }
 });
 test(`HOUSE-ORIGIN comparison preserves source origin and deductible classifications ${id}`,()=>{
  const first=documentPipeline([[raw(id)]]).insuranceData.insurances[0],next=rep(first);
  for(const[x,y]of[[first,next],[next,first]])for(const row of groupTerms(groupInsurances([x],[y],null)[0],null)){
   assert.deepEqual(row.firstSourceOrigins,row.secondSourceOrigins);assert.deepEqual(row.firstDeductibleClassifications,row.secondDeductibleClassifications);assert.deepEqual(row.firstBaseFacts,row.secondBaseFacts);
  }
 });
 test(`HOUSE-ORIGIN current resolver drops stale values and references ${id}`,()=>{
  const first=documentPipeline([[raw(id)]]).insuranceData.insurances[0],catalog=structuredClone(productCatalog),p=catalog.products.find(p=>p.productId===id),key='hus.leietap.skade';
  const old=resolveCatalogFacts(p,[],date,null,catalog).find(f=>f.key===key);let changed=false;
  for(const rows of Object.values(catalog.facts))for(const f of rows)if(f.key===key&&f.value===old.value){f.value='Syntetisk ny katalogverdi';f.source={...f.source,section:'Syntetisk ny kildereferanse'};changed=true;}
  assert.ok(changed);const next=rep(first,catalog),row=next.importantTerms.filter(t=>t.key===key);assert.equal(row.length,1);assert.equal(row[0].coverageOrigin,'catalog');assert.equal(row[0].value,'Syntetisk ny katalogverdi');assert.equal(row[0].source.section,'Syntetisk ny kildereferanse');
  const withNote=structuredClone(productCatalog);
  for(const rows of Object.values(withNote.facts))for(const f of rows)if(f.key===key&&f.qualificationSource)f.qualificationSource={...f.qualificationSource,note:'Syntetisk registrert kvalifikasjon'};
  const annotated=rep({...first,importantTerms:[]},withNote);assert.ok(annotated.importantTerms.find(t=>t.key===key).sources.some(s=>s.note==='Syntetisk registrert kvalifikasjon'));
  const removed=rep(annotated);assert.ok(!removed.importantTerms.find(t=>t.key===key).sources.some(s=>s.note?.includes('Syntetisk registrert kvalifikasjon')));
  const added=rep(first,withNote);assert.ok(added.importantTerms.find(t=>t.key===key).sources.some(s=>s.note==='Syntetisk registrert kvalifikasjon'));

 });
}
test('HOUSE-ORIGIN 214 frozen manual controls differ only by authorized target origin/metadata; 202 other products exact',()=>{
 assert.equal(before.controls.length,214);for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutVacancy(first),c.first,c.id);const next=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(withoutVacancy(next),withHouseCatalogOrigin(c.repeated,c.first),c.id);assert.equal(groupAddOnNames([next],c.input.products[0].type),c.display,c.id);}
 assert.equal(hash(serialize(withoutVacancy(productCatalog))),vacancyCatalogBaselineHash);
});
test('HOUSE-ORIGIN all 144 original PDF outputs are exactly unchanged on first enrichment',()=>{
 assert.equal(before.documents.length,144);for(const c of before.documents){const actual=documentPipeline([[c.record]],c.side).insuranceData;assert.deepEqual(withoutVacancy(actual),c.output,c.id);assert.equal(groupAddOnNames(actual.insurances,'Hus'),c.display,c.id);}
});
test('HOUSE-ORIGIN scope is exact products/provider/type/ordinary/version; no global normalizer change',()=>{
 for(const id of ids){
  const first=documentPipeline([[raw(id)]]).insuranceData.insurances[0],original=productCatalog.products.find(p=>p.productId===id);
  assert.ok(findCatalogProduct(original.providerId,original.productId,original.version,original));
  for(const delta of [{providerId:'if',company:'If'},{productId:'synthetic-other-house'},{insuranceType:'Innbo'},{version:'Annen versjon'},{agreementScope:'synthetic-house-scope'}]){
   const catalog=structuredClone(productCatalog);catalog.products=catalog.products.filter(p=>ids.includes(p.productId)).map(p=>({...p,...(delta.productId&&p.productId!==id?{}:delta)}));const product=catalog.products.find(p=>p.name===original.name);
   if(delta.agreementScope)catalog.agreementScopes.push({id:delta.agreementScope,providerId:product.providerId,name:'Syntetisk testscope'});
   const input={...first,company:product.company,type:product.insuranceType,agreementScope:product.agreementScope??'ordinary'};
   const result=enrichExtractedAgreementWithCatalog({company:product.company,totalAnnualPremium:null,insurances:[input]},date,undefined,undefined,catalog).insurances[0];
   assert.ok(result.catalogReference);assert.equal(result.catalogReference.providerId,product.providerId);assert.equal(result.catalogReference.productId,product.productId);assert.equal(result.catalogReference.version,product.version);
   assert.ok(result.importantTerms.some(t=>t.coverageOrigin==='document'&&t.sources?.some(s=>s.documentId==='gjensidigeHusStandard')));
  }
 }
 const first=before.controls.find(c=>c.id==='if-hus-basis'&&!c.error);assert.ok(first);assert.deepEqual(enrichExtractedAgreementWithCatalog({company:first.input.company,totalAnnualPremium:null,insurances:[first.first]},date).insurances[0],first.repeated);
});
