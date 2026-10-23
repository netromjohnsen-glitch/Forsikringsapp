import {withHouseCatalogOrigin} from './helpers/house-origin.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize,serialize} from 'node:v8';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,enrichConsolidatedInsurance} from '../lib/catalog-enrichment.ts';
import {groupAddOnNames,groupTerms,groupInsurances} from '../lib/comparison.ts';
import {HOUSE_RENTAL_ADDON as addon,HOUSE_RENTAL_KEYS as keys,houseRentalTermKey,resolveHouseRentalSelection as selection} from '../lib/hus-rental-selection.ts';
import {attachSupportingTerms} from '../lib/supporting-terms.ts';
import {batchDocuments,documentPipeline} from './helpers/supporting-terms.mjs';
const dir=new URL('../docs/audit/checkpoints/b051-rental-selection-0f10862/',import.meta.url);
const bytes=readFileSync(new URL('baseline.v8.gz',dir)),meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir)));
const hash=x=>createHash('sha256').update(x).digest('hex');assert.equal(hash(bytes),meta.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'];
const p=id=>productCatalog.products.find(p=>p.productId===id),date=new Date('2026-10-23T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x));
const withoutNote=source=>{const copy={...source};delete copy.note;return copy;};
const t=(name,value,canonicalKey=null)=>({name,value,canonicalKey,documentIndices:[1]});
const a=(terms=[])=>({name:'Utleie',annualPremium:null,deductible:null,importantTerms:terms});
const record=(id,extra={})=>({...structuredClone(baseline.documents.find(c=>c.id===id).record),annualPremium:'12345',deductible:'6000',...extra});
const output=(r,side='existing')=>documentPipeline([[r]],side).insuranceData.insurances[0];
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const x=repeat(i),y=repeat(x);return[i,x,y,repeat(clean(y))];};
const rows=i=>i.importantTerms.filter(t=>keys.includes(t.key));
const scenarios=[
 ['silent',[],[], 'unknown',false],
 ['heading-selected',[t('Utleie','Valgt')],[],'selected',false],
 ['agreed-addon',[],[a()],'selected',false],
 ['refusal',[t('Utleie','Ikke valgt')],[a()],'not_selected',false],
 ['unknown',[t('Utleie','Ukjent')],[a()],'unknown',false],
 ['conflict',[t('Utleie','Valgt'),t('Utleie','Ikke valgt')],[a()],'unknown',true],
 ['description',[t('Utleie','Valgfri utvidelse som må være angitt i beviset')],[],'unknown',false],
 ['description-agreed',[t('Utleie','Når utleie er angitt i forsikringsbeviset gjelder egne vilkår.')],[a()],'selected',false],
 ['detail-only',[t('Utleie – avtalevilkår','Valgt')],[],'unknown',false],
 ['detail-not-parent',[t('Utleie – betalingsmislighold','Ikke valgt')],[],'unknown',false],
 ['local-refusal',[],[a([t('Valg','Ikke valgt')])],'not_selected',false],
 ['local-conflict',[t('Utleie','Valgt')],[a([t('Status','Ikke valgt')])],'unknown',true],
 ['local-unknown',[],[a([t('Dekning','Ukjent')])],'unknown',false],
 ['unrelated-explicit-key',[t('Utleie','Valgt','glass.dekning')],[],'unknown',false],
];
for(const id of ids)for(const side of ['existing','offer'])for(const role of ['individual_agreement','unknown']){
 for(const[name,terms,addOns,status,conflict]of scenarios)test(`RENTAL-DOCUMENT ${id}/${side}/${role}/${name}`,()=>{
  const input=record(id,{documentRole:role,importantTerms:terms,addOns});const first=output(input,side);
  for(const i of stages(first)){
   const s=selection(p(id),i,date);assert.equal(s.status,status);assert.equal(s.conflict,conflict);
   assert.deepEqual(i.addOnIds,status==='selected'?[addon]:[]);assert.equal(groupAddOnNames([i],'Hus'),status==='selected'?'Utleie':null);
   assert.equal(rows(i).filter(t=>t.coverageOrigin==='catalog').length,status==='selected'?5:0);
   assert.equal(i.annualPremium,'12345');assert.equal(i.deductible,'6000');
   assert.deepEqual(i.addOns,first.addOns);assert.deepEqual(clean(rows(i)),clean(rows(first)));
   assert.ok(i.importantTerms.filter(t=>t.coverageOrigin==='document'&&(t.name==='Utleie'||houseRentalTermKey(t))).every(t=>t.sources?.length&&t.sources.every(s=>s.documentId===`pdf:${side}:0`&&s.documentRole===role)));
  }
  assert.ok(first.importantTerms.some(t=>t.key==='hus.leietap.skade')); // independent base coverage retained
  if(status==='selected'){
   const facts=resolveCatalogFacts(p(id),[addon],date).filter(f=>keys.includes(f.key));assert.equal(facts.length,5);
   for(const f of facts){const r=rows(first).find(t=>t.key===f.key);assert.equal(r.value,f.value);assert.equal(r.coverageOrigin,'catalog');
    assert.deepEqual(r.sources.map(withoutNote),[f.source,...(f.qualificationSource?[f.qualificationSource]:[])].map(withoutNote));assert.equal(r.deductibleClassification,f.deductibleClassification);}
   assert.match(rows(first).find(t=>t.key==='hus.utleie.egenandel').value,/10 000/);
  }
 });
}
for(const id of ids){
 test(`RENTAL-DOCUMENT source-bound addon fact exists before merge ${id}`,()=>{
  for(const side of ['existing','offer']){const results=batchDocuments([[record(id,{addOns:[a()]})]],side);const raw=results[0].agreement.documentRecords[0];
   const term=raw.importantTerms.find(t=>t.name==='Utleie'&&t.value==='Valgt');assert.ok(term);assert.deepEqual(term.sources,raw.documentSources);assert.equal(term.sources[0].documentId,`pdf:${side}:0`);
   const resolved=enrichConsolidatedInsurance('Gjensidige',raw,raw.importantTerms,date);assert.deepEqual(resolved.addOnIds,[addon]);assert.deepEqual(resolved.importantTerms.find(t=>t.name==='Utleie'&&t.value==='Valgt').sources,term.sources);
  }
 });
 test(`RENTAL-DOCUMENT every detail keeps exact identity, unknown value and original sources ${id}`,()=>{
  for(const key of keys)for(const value of ['Kundens særvilkår 13 000 kroner','Ukjent','Ikke valgt','Valgt']){
   const label=resolveCatalogFacts(p(id),[addon],date).find(f=>f.key===key).label;
   const first=output(record(id,{importantTerms:[t('Utleie','Valgt'),t(label,value)],addOns:[]}));
   for(const i of stages(first)){assert.equal(selection(p(id),i).status,'selected');const r=rows(i).filter(t=>t.key===key);assert.equal(r.length,1);assert.equal(r[0].value,value);assert.equal(r[0].coverageOrigin,'document');assert.deepEqual(r[0].sources,first.importantTerms.find(t=>t.key===key).sources);assert.equal(rows(i).filter(t=>t.coverageOrigin==='catalog').length,4);}
  }
 });
 test(`RENTAL-DOCUMENT local headings require actual addon context ${id}`,()=>{
  for(const label of ['Valg','Valgstatus','Status','Dekning'])for(const value of ['Valgt','Ikke valgt','Ukjent']){
   const local=output(record(id,{importantTerms:[],addOns:[a([t(label,value)])]}));assert.equal(selection(p(id),local).status,{'Valgt':'selected','Ikke valgt':'not_selected','Ukjent':'unknown'}[value]);
   const outside=output(record(id,{importantTerms:[t(label,value)],addOns:[]}));assert.equal(selection(p(id),outside).status,'unknown');
  }
 });
 test(`RENTAL-DOCUMENT supporting terms never supply choice or overwrite unknown detail ${id}`,()=>{
  for(const side of ['existing','offer'])for(const value of ['Valgt','Ikke valgt','Ukjent']){
   const generic=record(id,{documentRole:'general_terms',importantTerms:[t('Utleie',value),t('Utleie – utkastelse','Generisk 19 000 kr')],addOns:[a()]});
   const alone=documentPipeline([[generic]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
   for(const selected of [false,true]){
    const customer=record(id,{importantTerms:[t('Utleie',selected?'Valgt':'Ukjent'),t('Utleie – utkastelse','Ukjent')]});
    const data=documentPipeline([[customer],[generic]],side).insuranceData;assert.equal(data.insurances.length,1);assert.equal(data.supportingEvidence.length,1);
    for(const i of stages(data.insurances[0])){assert.equal(selection(p(id),i).status,selected?'selected':'unknown');assert.equal(groupAddOnNames([i],'Hus'),selected?'Utleie':null);const row=rows(i).filter(t=>t.key==='hus.utleie.utkastelse');assert.equal(row.length,1);assert.equal(row[0].value,'Ukjent');assert.equal(row[0].coverageOrigin,'document');assert.equal(row[0].sources[0].documentId,`pdf:${side}:0`);assert.ok(!i.importantTerms.some(t=>t.value==='Generisk 19 000 kr'));}
    const support=data.insurances[0].recordEvidence.find(r=>r.documentRole==='general_terms');assert.ok(support.importantTerms.some(t=>t.value==='Generisk 19 000 kr'));assert.ok(support.sources.every(s=>s.documentId===`pdf:${side}:1`&&s.documentRole==='general_terms'));
   }
  }
 });
 test(`RENTAL-DOCUMENT exact scoped supporting identities deduplicate and preserve full evidence ${id}`,()=>{
  const customer=output(record(id,{importantTerms:[t('Utleie','Valgt')]}));const generic=batchDocuments([[record(id,{documentRole:'general_terms',importantTerms:keys.map((k,n)=>t(resolveCatalogFacts(p(id),[addon],date).find(f=>f.key===k).label,`Generisk detalj ${n}`))})]])[0].agreement.documentRecords[0];
  const attached=attachSupportingTerms(customer,[generic],'existing');assert.deepEqual(rows(attached),rows(customer));assert.equal(attached.recordEvidence.at(-1).importantTerms.length,5);
 });
 test(`RENTAL-DOCUMENT separate no-ID houses do not exchange choice ${id}`,()=>{
  for(const side of ['existing','offer']){const data=documentPipeline([[record(id,{addOns:[a()]})],[record(id,{importantTerms:[t('Utleie','Ikke valgt')]})]],side).insuranceData;
   assert.equal(data.insurances.length,2);assert.deepEqual(data.insurances.map(i=>selection(p(id),i).status).sort(),['not_selected','selected']);assert.ok(data.insurances.every(i=>i.consolidation.status!=='consolidated'));
   const selected=data.insurances.find(i=>i.addOnIds.includes(addon));assert.ok(selected.importantTerms.filter(t=>t.name==='Utleie').every(t=>t.sources.every(s=>s.documentId===`pdf:${side}:0`)));
  }
 });
 test(`RENTAL-DOCUMENT provider, product, type, scope, version and availability isolation ${id}`,()=>{
  const first=output(record(id,{importantTerms:[t('Utleie','Valgt')]}));
  for(const delta of [{providerId:'if'},{productId:'if-hus-basis'},{insuranceType:'Innbo'},{agreementScope:'nito'},{version:'Annen'}])assert.equal(selection({...p(id),...delta},first),null);
  assert.equal(selection(p(id),{...first,type:'Innbo'}),null);const catalog=structuredClone(productCatalog);catalog.addOns=catalog.addOns.filter(a=>a.id!==addon);assert.equal(selection(p(id),first,date,catalog).status,'unknown');
  for(const name of ['Utleieforsikring','Registrert utleie','Utleieavtale'])assert.equal(selection(p(id),{...first,importantTerms:[{name,value:'Valgt',coverageOrigin:'document'}],addOns:[]}).status,'unknown');
  for(const key of keys){assert.equal(houseRentalTermKey({name:'Utleie',canonicalKey:key,value:'Valgt'}),key);for(const value of ['Valgt','Ikke valgt','Ukjent'])assert.equal(selection(p(id),{...first,importantTerms:[{name:'Utleie',canonicalKey:key,value,coverageOrigin:'document'}],addOns:[]}).status,'unknown');}
  const generic={name:'Utleie',coverageOrigin:'document',importantTerms:[{name:'Valg',value:'Valgt',coverageOrigin:'catalog',sources:[{documentId:'generic',documentRole:'general_terms'}]}]};assert.equal(selection(p(id),{...first,importantTerms:[],addOns:[generic]}).status,'unknown');
 });
 test(`RENTAL-DOCUMENT canonical comparison both directions retains full detail sources ${id}`,()=>{
  const yes=output(record(id,{addOns:[a()]})),no=output(record(id,{importantTerms:[t('Utleie','Ikke valgt')]}));
  for(const[x,y,side]of[[yes,no,'first'],[no,yes,'second']]){const comparisons=groupTerms(groupInsurances([x],[y],null)[0],null);for(const t of rows(yes)){const r=comparisons.filter(r=>r.key===t.key);assert.equal(r.length,1);assert.equal(r[0][side],t.value);assert.deepEqual(r[0][side+'Sources'],t.sources);}}
 });
}
test('RENTAL-DOCUMENT all 214 frozen manual initial/repeat results and displays remain exact; catalog unchanged',()=>{
 assert.equal(baseline.controls.length,214);for(const c of baseline.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(first,c.first,c.id);const repeated=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(repeated,withHouseCatalogOrigin(c.repeated,c.first),c.id);assert.equal(groupAddOnNames([repeated],c.input.products[0].type),c.display,c.id);}
 assert.equal(hash(serialize(productCatalog)),meta.catalog_sha256);
});
