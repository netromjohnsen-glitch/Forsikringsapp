import {withoutFrostAndVacancy} from './helpers/b130-frost.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deserialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {normalizeTermName} from '../lib/insurance-normalization.ts';
import {applyWater,waterFact,waterOracle as o} from './helpers/b051-water.mjs';
import {documentPipeline} from './helpers/supporting-terms.mjs';
const path=new URL('../docs/audit/checkpoints/b051-water-25004-cd6e03d/',import.meta.url);
const bytes=readFileSync(new URL('baseline-catalog.v8.gz',path));
assert.equal(createHash('sha256').update(bytes).digest('hex'),o.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),expected=applyWater(baseline),key=o.key;
const ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'];
const date=new Date('2026-10-22T12:00:00Z');
const product=(id,c=productCatalog)=>c.products.find(p=>p.productId===id);
const fact=id=>resolveCatalogFacts(product(id),[],date).filter(f=>f.key===key);
const customerSource={documentId:'synthetic:water',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Vannvilkår',company:'Gjensidige'};
const input=(id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{type:'Hus',productName:product(id).name,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms}]});
const enrich=(id,terms=[])=>enrichExtractedAgreementWithCatalog(input(id,terms),date).insurances[0];
const pick=i=>i.importantTerms.filter(t=>t.key===key);
const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
test('WATER original signature has exactly both ordinary source bindings',()=>{
 assert.equal(o.original_binding.signature_id,'25004bc4d7dd2c03');
 assert.deepEqual(JSON.parse(o.original_binding.finding_ids),['GAP-2088','GAP-2142']);
 assert.deepEqual(JSON.parse(o.original_binding.source_fact_ids),['SF-2991','SF-3075']);
 assert.deepEqual(o.source_evidence.map(x=>JSON.parse(x.product_identity)),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));
});
for(const [i,id] of ids.entries()){
 test('WATER source bytes and explicit covered-damage trigger '+id,()=>{
  const e=o.source_evidence[i],file=new URL('../'+e.artifact,import.meta.url),b=readFileSync(file);
  assert.equal(createHash('sha256').update(b).digest('hex'),e.sha256);
  const text=execFileSync('pdftotext',['-raw','-f','3','-l','3',file.pathname,'-']).toString().replace(/\s+/gu,' ');
  assert.ok(text.includes(o.value.slice(0,-1)));
  assert.equal(productCatalog.sources[owners[i]].sha256,e.sha256);
 });
 test('WATER exact effective row and own provenance '+id,()=>{
  assert.deepEqual(fact(id),[waterFact(owners[i])]);
  assert.deepEqual(productCatalog.facts[owners[i]].filter(f=>f.key===key),[waterFact(owners[i])]);
  assert.doesNotMatch(fact(id)[0].value,/50 år|fullverdiforsikret|over bakkeplan/u);
  const materialized=materializeCatalogProduct(product(id)).facts.filter(f=>f.key===key);
  assert.equal(materialized.length,1);assert.equal(materialized[0].state,'included');
  assert.equal(materialized[0].value,o.value);assert.equal(materialized[0].sources[0].documentId,owners[i]);
 });
 test('WATER repeated enrichment preserves source and no addon selection '+id,()=>{
  const a=enrich(id),b=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[a]},date).insurances[0];
  assert.equal(pick(a).length,1);assert.equal(pick(b).length,1);
  // Catalog origin and complete source-backed metadata survive repeat.
  assert.deepEqual(pick(a).map(t=>[t.key,t.name,t.value,t.source,t.sources]),pick(b).map(t=>[t.key,t.name,t.value,t.source,t.sources]));
  assert.equal(pick(a)[0].coverageOrigin,'catalog');assert.equal(pick(b)[0].coverageOrigin,'catalog');assert.deepEqual(pick(b),pick(a));
  assert.equal(pick(a)[0].value,o.value);assert.deepEqual(pick(a)[0].sources,catalogFactSources(fact(id)[0]));
  const old=enrichExtractedAgreementWithCatalog(input(id),date,undefined,undefined,baseline).insurances[0];
  assert.deepEqual(a.addOnIds,old.addOnIds);assert.deepEqual(a.addOns,old.addOns);
 });
 for(const value of ['Ikke omfattet','Kundens særvilkår for vann','Valgt','Ikke valgt'])test('WATER document priority '+id+'/'+value,()=>{
  const a=enrich(id,[{name:o.label,canonicalKey:key,value,source:customerSource}]);
  assert.equal(pick(a).length,1);assert.equal(pick(a)[0].value,value);assert.equal(pick(a)[0].coverageOrigin,'document');assert.deepEqual(pick(a)[0].source,customerSource);
  const b=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[a]},date).insurances[0];assert.deepEqual(pick(b),pick(a));
 });
 test('WATER manual known product retains own source '+id,()=>{
  const out=normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:product(id).name,annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:[]}]}).insuranceData.insurances[0];
  assert.equal(pick(out).length,1);assert.equal(pick(out)[0].value,o.value);assert.equal(pick(out)[0].sources[0].documentId,owners[i]);
 });
 test('WATER exact scope isolation '+id,()=>{
  const p=product(id);assert.equal(findCatalogProduct('gjensidige',id,p.version,{agreementScope:'nito',insuranceType:'Hus'}),null);
  assert.equal(findCatalogProduct('gjensidige',id,p.version,{agreementScope:'ordinary',insuranceType:'Innbo'}),null);
 });
}
test('WATER exact alias does not absorb broad water/roof text or other insurance types',()=>{
 assert.equal(normalizeTermName(o.label,{insuranceType:'Hus'}),key);
 for(const name of ['Vannskade','Vann gjennom tak og yttervegg','Utett våtrom','Vann fra terreng'])assert.notEqual(normalizeTermName(name,{insuranceType:'Hus'}),key);
 for(const type of ['Innbo','Bobil'])assert.notEqual(normalizeTermName(o.label,{insuranceType:type}),key);
});
test('WATER precise row survives both comparison directions; unverified peers unknown',()=>{
 for(const [a,b]of [[ids[0],ids[1]],[ids[0],'if-hus-basis'],[ids[1],'if-hus-basis']]){
  const f=rows(a,b).find(r=>r.key===key),r=rows(b,a).find(r=>r.key===key);assert.ok(f);assert.equal(f.conceptId,'hus.vann-fukt');
  assert.deepEqual(f.first,r.second);assert.deepEqual(f.second,r.first);
  if(b==='if-hus-basis')assert.equal(f.second.state,'unknown');else assert.equal(f.second.text,f.first.text);
 }
 for(const id of ids)assert.equal(compareCatalogProducts(product(id),product(id)).differenceCount,0);
});
test('WATER full-field source oracle; only the two authorized rows added',()=>{
 assert.deepEqual(productCatalog,expected);
 for(const id of ids){
  const before=resolveCatalogFacts(product(id,baseline),[],date,null,baseline);
  const after=resolveCatalogFacts(product(id),[],date).filter(f=>f.key!==key);assert.deepEqual(withoutFrostAndVacancy(after),before);
 }
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.equal(resolveCatalogFacts(p,[],date).some(f=>f.key===key),false,p.productId);
});
for(const id of ids)for(const side of ['existing','offer'])test('WATER supporting terms cannot create a customer or override refusal '+id+'/'+side,()=>{
 const record=(role,values)=>({type:'Hus',company:'Gjensidige',agreementScope:'ordinary',productName:product(id).name,canonicalProductName:product(id).name,annualPremium:null,deductible:null,coverageSummary:null,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],documentRole:role,addOns:[],importantTerms:values.map(value=>({name:o.label,value,documentIndices:[1]}))});
 const supporting=record('general_terms',[o.value]);
 const alone=documentPipeline([[supporting]],side).insuranceData;
 assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
 const out=documentPipeline([[record('individual_agreement',['Ikke omfattet'])],[supporting]],side).insuranceData;
 assert.equal(out.insurances.length,1);assert.equal(out.supportingEvidence.length,1);
 const terms=pick(out.insurances[0]);assert.equal(terms.length,1);assert.equal(terms[0].value,'Ikke omfattet');assert.equal(terms[0].coverageOrigin,'document');
 assert.equal(terms[0].sources[0].documentRole,'individual_agreement');
});
test('WATER active expectation helper rejects changes and duplicates in either new source binding',()=>{
 for(const owner of owners){
  const changed=applyWater(baseline);changed.facts[owner].find(f=>f.key===key).source.page=99;assert.throws(()=>applyWater(changed));
  const duplicate=applyWater(baseline);duplicate.facts[owner].push(waterFact(owner));assert.throws(()=>applyWater(duplicate));
 }
});
