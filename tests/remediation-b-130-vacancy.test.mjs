import {withoutAdditionalCosts} from './helpers/house-additional-costs.mjs';
import {withOriginalBuildingsSourcePage} from './helpers/house-buildings-source.mjs';
import {withoutFrostAndVacancy,withoutFrost} from './helpers/b130-frost.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize} from 'node:v8';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,availableAddOns,resolveAddOnPackage,findCatalogProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {groupTerms,groupInsurances,groupAddOnNames} from '../lib/comparison.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeTermName} from '../lib/insurance-normalization.ts';
import {isNonAssertingCoverageDetail} from '../lib/coverage-fact-semantics.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {vacancyOracle as o,vacancyFact,applyVacancy} from './helpers/b130-vacancy.mjs';

const dir=new URL('../docs/audit/checkpoints/b130-vacancy-f5f88cc/',import.meta.url);
const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir))),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-23T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id);
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const a=repeat(i),b=repeat(a);return[i,a,b,repeat(clean(b))];};
const pick=i=>i.importantTerms.filter(t=>t.key===o.key);
const raw=id=>structuredClone(baseline.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,values=[],role='individual_agreement')=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name:o.label,value,canonicalKey:null,documentIndices:[1]}))});
const states=i=>clean(deriveCanonicalCoverages(withOriginalBuildingsSourcePage(withoutAdditionalCosts(i)),'Hus'));

test('VACANCY original CR-224 signature has exactly both source bindings',()=>{
 assert.equal(o.signature,'597df4c45c6d3db9');assert.equal(o.original_registry.final_batch_id,'B-130');
 assert.deepEqual(JSON.parse(o.original_registry.finding_ids),['GAP-2122','GAP-2181']);
 assert.deepEqual(JSON.parse(o.original_registry.source_fact_ids),['SF-3049','SF-3136']);
 assert.deepEqual(o.original_bindings.map(b=>JSON.parse(b.product_identity)),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));
 const queue=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/canonical-review-queue.csv',import.meta.url),'utf8');assert.ok(queue.includes('CR-224'));assert.ok(queue.includes(o.signature));
});
test('VACANCY complete catalog equals independent before catalog plus exactly two raw facts',()=>{
 assert.deepEqual(withoutFrost(productCatalog),applyVacancy(baseline.catalog));
 assert.deepEqual(withoutFrostAndVacancy(productCatalog),baseline.catalog);
 for(const owner of owners)assert.deepEqual(productCatalog.facts[owner].filter(f=>f.key===o.key),[vacancyFact(owner)]);
 for(const owner of owners){const bad=applyVacancy(baseline.catalog);bad.facts[owner].find(f=>f.key===o.key).source.page=99;assert.throws(()=>applyVacancy(bad));assert.throws(()=>withoutFrostAndVacancy(bad));}
});
for(const [n,id]of ids.entries()){
 test('VACANCY original registered PDF source and complete page-2 restriction '+id,()=>{
  const b=o.original_bindings[n],file=new URL('../'+b.source_artifact,import.meta.url);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_hash);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_hash);
  const text=execFileSync('pdftotext',['-raw','-f','2','-l','2',file.pathname,'-']).toString().replace(/\s+/gu,' ');
  assert.ok(text.includes(o.value.slice(0,-1)));assert.ok(text.includes('For bygningsforsikring gjelder:'));
  assert.equal(productCatalog.sources[owners[n]].effectiveFrom,'');assert.equal(productCatalog.sources[owners[n]].version,'Alminnelige vilkår');
 });
 test('VACANCY one effective nonasserting row and own source on each level '+id,()=>{
  const fact=resolveCatalogFacts(p(id),[],date).filter(f=>f.key===o.key);assert.deepEqual(fact,[vacancyFact(owners[n])]);
  const m=materializeCatalogProduct(p(id)).facts.filter(f=>f.key===o.key);assert.equal(m.length,1);assert.equal(m[0].role,'term');assert.equal(m[0].value,o.value);assert.deepEqual(m[0].sources,catalogFactSources(vacancyFact(owners[n])).map(s=>({...s,sourceType:undefined})));
  assert.equal(isNonAssertingCoverageDetail(o.key),true);assert.equal(canonicalDocumentFactKeys.includes(o.key),false);
  assert.equal(normalizeTermName(o.label,{insuranceType:'Hus'}),'fraflyttet bolig dekningsbegrensning');
 });
 for(const c of baseline.configurations.filter(c=>c.id===id))test('VACANCY all valid manual choices exact prior outputs plus new term '+id+'/'+c.selected.join('+'),()=>{
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutFrostAndVacancy(first),c.first);
  const term=pick(first);assert.equal(term.length,1);assert.equal(term[0].value,o.value);assert.equal(term[0].coverageOrigin,'catalog');assert.equal(term[0].source.documentId,owners[n]);assert.equal(term[0].source.page,2);
  const expectedFact=vacancyFact(owners[n]);
  assert.deepEqual(term,[{name:o.label,value:o.value,key:o.key,coverageOrigin:'catalog',structuredValue:undefined,deductibleClassification:undefined,source:expectedFact.source,sources:[{...expectedFact.source,note:n?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined}],overriddenBase:n?[{value:o.value,source:vacancyFact(owners[0]).source}]:[]}]);
  assert.equal(term[0].overriddenBase.length,n);if(n)assert.equal(term[0].overriddenBase[0].source.documentId,owners[0]);
  for(const i of stages(first)){assert.deepEqual(clean(pick(i)),clean(term));assert.deepEqual(states(i),states(c.first));assert.deepEqual(new Set(i.addOnIds),new Set(c.first.addOnIds));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);assert.equal(groupAddOnNames([i],'Hus'),groupAddOnNames([c.first],'Hus'));}
 });
 for(const side of ['existing','offer'])for(const values of [[],['Kundens særavtale: normal dekning ved fraflytting'],['Ikke valgt'],['Ukjent'],['Kundens regel A','Kundens motstridende regel B']])test('VACANCY actual PDF pipeline exact product-label priority '+id+'/'+side+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[o.value];
  for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),expected);assert.ok(pick(i).every(t=>t.coverageOrigin===(expected[0]===o.value?'catalog':'document')));assert.deepEqual(clean(pick(i)),clean(pick(first)));assert.deepEqual(states(i),states(first));}
  if(expected[0]!==o.value)assert.ok(pick(first).every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));
  const shown=groupTerms(groupInsurances([first],[first],null)[0],null).find(r=>r.key===o.key);assert.ok(shown);assert.ok(!shown.first?.startsWith('✓'));
 });
 test('VACANCY late genuine specific customer rule has fresh priority and keeps references '+id,()=>{
  const first=documentPipeline([[record(id)]]).insuranceData.insurances[0];
  const source={documentId:'synthetic:vacancy',filename:'Kundebevis.pdf',termsNumber:'Særavtale',page:2,section:'Avtalt fravik',effectiveFrom:'',documentRole:'individual_agreement'};
  const value='Kundens særavtale uten fraflyttingsbegrensning';
  const late=repeat({...first,importantTerms:[...first.importantTerms,{name:o.label,value,coverageOrigin:'document',sources:[source]}]});
  const fresh=documentPipeline([[record(id,[value])]]).insuranceData.insurances[0];
  for(const i of stages(late)){assert.deepEqual(pick(i).map(t=>[t.key,t.name,t.value,t.coverageOrigin]),pick(fresh).map(t=>[t.key,t.name,t.value,t.coverageOrigin]));assert.deepEqual(pick(i)[0].sources,[source]);}
 });
 for(const side of ['existing','offer'])test('VACANCY uploaded general terms are evidence, never customer occupancy or choice '+id+'/'+side,()=>{
  const generic=record(id,[o.value],'general_terms');const alone=documentPipeline([[generic]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[record(id)],[generic]],side).insuranceData,first=data.insurances[0];assert.equal(data.supportingEvidence.length,1);
  const reference=documentPipeline([[record(id)]],side).insuranceData.insurances[0];
  for(const i of stages(first)){assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(states(i),states(reference));assert.deepEqual(i.addOnIds,reference.addOnIds);assert.deepEqual(clean(i.recordEvidence),clean(first.recordEvidence));}
 });
 for(const name of ['Fraflyttet bolig','Ubebodd','Ansvarsbegrensninger'])test('VACANCY generic occupancy heading is not a rule or automatic denial '+id+'/'+name,()=>{
  const first=documentPipeline([[{...raw(id),importantTerms:[{name,value:'Ja',canonicalKey:null,documentIndices:[1]}]}]]).insuranceData.insurances[0];
  const silent=documentPipeline([[record(id)]]).insuranceData.insurances[0];
  assert.deepEqual(pick(first).map(t=>t.value),[o.value]);assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Ja'&&t.coverageOrigin==='document'));assert.deepEqual(states(first),states(silent));
 });
 test('VACANCY exact provider/type/ordinary/version boundaries '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);
  assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
  assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('VACANCY all 214 before manual inputs and 144 actual document outputs preserve every old field',()=>{
 for(const c of baseline.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutFrostAndVacancy(first),c.first,c.id);const next=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(withoutFrostAndVacancy(next),c.repeated,c.id);}
 for(const c of baseline.documents)assert.deepEqual(withoutFrostAndVacancy(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
 assert.equal(baseline.controls.length,214);assert.equal(baseline.documents.length,144);assert.equal(baseline.configurations.length,12);
});
test('VACANCY same product and side reversal; peer unknown is not lack of coverage',()=>{
 for(const id of ids)assert.equal(compareCatalogProducts(p(id),p(id)).differenceCount,0);
 for(const a of ids)for(const b of [...ids,'if-hus-basis','tryg-hus','fremtind-hus-standard']){
  const forward=compareCatalogProducts(p(a),p(b)).sections.flatMap(s=>s.rows).find(r=>r.key===o.key),reverse=compareCatalogProducts(p(b),p(a)).sections.flatMap(s=>s.rows).find(r=>r.key===o.key);
  assert.ok(forward);assert.deepEqual(forward.first,reverse.second);assert.deepEqual(forward.second,reverse.first);assert.equal(forward.first.text,o.value);assert.equal(forward.conceptId,'hus.ovrig');
  if(!ids.includes(b)){assert.equal(forward.second.state,'unknown');assert.deepEqual(forward.second.sources,[]);}
 }
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(baseline.catalog.products.find(p=>p.productId===product.productId),[],date,null,baseline.catalog));for(const addon of availableAddOns(product,date)){const selected=resolveAddOnPackage(product,addon.id,date);assert.equal(resolveCatalogFacts(product,selected,date).some(f=>f.key===o.key),false);assert.deepEqual(resolveCatalogFacts(product,selected,date),resolveCatalogFacts(baseline.catalog.products.find(p=>p.productId===product.productId),selected,date,null,baseline.catalog));}}
});
