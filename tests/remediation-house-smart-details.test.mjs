import {withoutHealthDiscount} from './helpers/house-health-discount.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize} from 'node:v8';
import {execFileSync} from 'node:child_process';
import {productCatalog as actualCatalog,resolveCatalogFacts as actualFacts,resolveCatalogEvidence as actualEvidence,availableAddOns as actualAddOns,findCatalogProduct as actualFind} from '../lib/product-catalog.ts';
import {normalizeManualAgreement as actualManual} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog as actualEnrich} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct as actualMaterialize,compareCatalogProducts as actualCompare} from '../lib/catalog-product-comparison.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeCatalogTermKey} from '../lib/insurance-normalization.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline as actualPipeline} from './helpers/supporting-terms.mjs';
import {smartDetailsOracle as o,smartDetailFact,smartDetailSources,applySmartDetails as actualApplySmart,withoutSmartDetails} from './helpers/house-smart-details.mjs';
// The new physical-service discount has its own independent suite;retain this six-row contract exactly.
const productCatalog=withoutHealthDiscount(actualCatalog);
const resolveCatalogFacts=(p,a,date,channel=null,c=productCatalog)=>actualFacts(p,a,date,channel,c);
const resolveCatalogEvidence=(p,a,date,channel=null,c=productCatalog)=>actualEvidence(p,a,date,channel,c);
const availableAddOns=(p,date,channel=null,c=productCatalog)=>actualAddOns(p,date,channel,c);
const findCatalogProduct=(provider,id,version,context,c=productCatalog)=>actualFind(provider,id,version,context,c);
const normalizeManualAgreement=(input,c=productCatalog)=>actualManual(input,c);
const enrichExtractedAgreementWithCatalog=(input,date,measure,trace,c=productCatalog)=>actualEnrich(input,date,measure,trace,c);
const materializeCatalogProduct=(p,c=productCatalog)=>actualMaterialize(p,c);
const compareCatalogProducts=(a,b,c=productCatalog)=>actualCompare(a,b,c);
const documentPipeline=(...args)=>withoutHealthDiscount(actualPipeline(...args));
const applySmartDetails=c=>withoutHealthDiscount(actualApplySmart(c));

const dir=new URL('../docs/audit/checkpoints/house-smart-details-b618f7e/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir)),hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(hash(bytes),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-24T12:00:00Z'),clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id),pick=i=>i.importantTerms.filter(t=>o.keys.includes(t.key));
const repeat=(i,c=productCatalog)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const stages=i=>{const out=[i];for(let n=0;n<3;n++)out.push(repeat(clean(out.at(-1))));return out;};
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,parent,child=null)=>({...raw(id),importantTerms:[...parent.map(value=>({name:'Hus Smart',value,canonicalKey:null,documentIndices:[1]})),...(child?[{name:child.label,value:'Kundens detaljregel',canonicalKey:null,documentIndices:[1]}]:[])]});

test('SMART-DETAILS independent before plus only six exact optional component facts',()=>{
 assert.deepEqual(productCatalog,applySmartDetails(before.catalog));assert.deepEqual(withoutSmartDetails(productCatalog),before.catalog);assert.equal(o.keys.length,6);assert.deepEqual(productCatalog.sources,before.catalog.sources);assert.deepEqual(productCatalog.products,before.catalog.products);
 for(const def of o.rows)assert.deepEqual(productCatalog.facts.gjensidigeHusSmart.filter(f=>f.key===def.key),[smartDetailFact(def.key)]);
});
test('SMART-DETAILS six immutable signatures and twelve original source/gap bindings',()=>{
 assert.deepEqual(o.signatures,['b5ae7c1f4cec9d04','afd0d50c324c169c','8f9b15f8127e89be','bbc3739f5ede520f','f80cdfac07dab114','5d062f28d52c1e1d']);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8');for(const b of o.original_bindings){assert.ok(registry.split('\n').find(l=>l.startsWith(b.signature+',')).includes('DEFER_POST_PILOT'));assert.equal(b.source_facts.length,2);assert.equal(b.gap_records.length,2);assert.deepEqual(b.source_facts.map(s=>s.source_fact_id),JSON.parse(b.registry.source_fact_ids));assert.deepEqual(b.gap_records.map(s=>s.finding_id),JSON.parse(b.registry.finding_ids));for(const sf of b.source_facts)assert.equal(hash(readFileSync(new URL('../'+sf.source_artifact,import.meta.url))),sf.source_sha256);}
});
test('SMART-DETAILS complete original HTML hashes, extracted text and source sections',()=>{
 const output=execFileSync('python3',[new URL('verify-source.py',dir).pathname],{cwd:new URL('..',import.meta.url)}).toString();assert.ok(output.includes('PASS'));for(const s of o.sources.sources){assert.equal(hash(readFileSync(new URL('../'+s.path,import.meta.url))),s.sha256);assert.equal(productCatalog.sources[s.registered_source_id].sha256,s.sha256);}
 for(const [section,key]of [['7. Kundens plikter','hus.service.smart.aktivering'],['8. Flytting og overføring av kontrakten','hus.service.smart.oppsigelse'],['10. Varighet og oppsigelse','hus.service.smart.oppsigelse'],['1.4 Utstyr','hus.service.smart.utstyr'],['1.7','hus.service.smart.utstyr']])assert.ok(smartDetailFact(key).value.includes(o.sources.term_sections[section]));
 const price=smartDetailFact('hus.service.smart.pris');for(const text of ['160 kr/mnd','359 kr/mnd','Ingen bindingstid','til enhver tid gjeldende avtalen','forsikringspremie vurderes separat'])assert.ok(price.value.includes(text));assert.equal(price.qualificationSource.documentId,'gjensidigeHusSmartTerms');
 const moving=smartDetailFact('hus.service.smart.oppsigelse').value;assert.ok(moving.includes('Kunden har ingen oppsigelsesfrist dersom behovet for tjenesten er bortfalt eller dersom tjenesten skal flyttes til annet selskap. Ved flytting er oppsigelsesfristen 1 måned.'));assert.ok(moving.includes(o.sources.term_sections['8. Flytting og overføring av kontrakten']));
 const equipment=smartDetailFact('hus.service.smart.utstyr');for(const text of ['med mindre annet er avtalt','12 måneder','etter at avtalen er avsluttet','Selskapet betaler for porto','Den er din når du kjøper den'])assert.ok(equipment.value.includes(text));assert.equal(equipment.qualificationSource.documentId,'gjensidigeHusSmart');
});
for(const id of ids){
 for(const c of before.configurations.filter(c=>c.id===id))test('SMART-DETAILS choices, complete old fields, sources and three JSON enrichments '+id+'/'+c.selected.join('+'),()=>{
  const selected=c.selected.includes('gjensidige-hus-smart'),facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);assert.deepEqual(withoutSmartDetails(facts),c.facts);assert.deepEqual(withoutSmartDetails(evidence),c.evidence);assert.deepEqual(facts.filter(f=>o.keys.includes(f.key)),selected?o.keys.map(k=>smartDetailFact(k)):[]);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSmartDetails(first),c.first);assert.equal(pick(first).length,selected?6:0);for(const i of stages(first)){assert.deepEqual(clean(pick(i)),clean(pick(first)));for(const term of pick(i)){const f=smartDetailFact(term.key);assert.equal(term.value,f.value);assert.equal(term.name,f.label);assert.equal(term.coverageOrigin,'catalog');assert.deepEqual(clean(term.source),clean(f.source));assert.deepEqual(clean(term.sources),clean(smartDetailSources(f,true)));assert.deepEqual(term.overriddenBase,[]);}assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));}assert.deepEqual(withoutSmartDetails(stages(first).at(-1)),c.repeat3);
 });
 for(const side of ['existing','offer'])for(const parent of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt']])for(const child of [null,...o.rows])test('SMART-DETAILS document selection and independent child priority '+id+'/'+side+'/'+parent.join('+')+'/'+(child?.key??'none'),()=>{
  const rec=record(id,parent,child),base=documentPipeline([[rec]],side).insuranceData.insurances[0],selected=parent.length===1&&parent[0]==='Valgt';let current=base,control=repeat(base,before.catalog);
  for(let n=0;n<4;n++){if(n===0)current=repeat(current);else{current=repeat(clean(current));control=repeat(clean(control),before.catalog);}assert.deepEqual(current.addOnIds,control.addOnIds);assert.deepEqual(clean(deriveCanonicalCoverages(current,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.equal(current.annualPremium,control.annualPremium);const rows=pick(current),catalog=rows.filter(t=>t.coverageOrigin==='catalog');assert.equal(catalog.length,selected?(child?5:6):0);for(const term of catalog){const f=smartDetailFact(term.key);assert.equal(term.value,f.value);assert.deepEqual(clean(term.source),clean(f.source));assert.deepEqual(clean(term.sources),clean(smartDetailSources(f)));}if(child){const specific=current.importantTerms.filter(t=>t.name===child.label&&t.value==='Kundens detaljregel');assert.deepEqual(specific.map(t=>t.value),['Kundens detaljregel']);assert.ok(specific.every(t=>t.coverageOrigin==='document'));}assert.deepEqual(clean(withoutSmartDetails(current)),clean(withoutSmartDetails(control)));}
 });
 for(const side of ['existing','offer'])test('SMART-DETAILS general terms alone or paired never selects Smart '+id+'/'+side,()=>{
  const general={...raw(id),documentRole:'general_terms',importantTerms:o.rows.map(r=>({name:r.label,value:r.value,canonicalKey:null,documentIndices:[1]}))};const alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);const pair=documentPipeline([[raw(id)],[general]],side).insuranceData;assert.equal(pair.supportingEvidence.length,1);for(const i of stages(pair.insurances[0]))assert.equal(pick(i).filter(t=>t.coverageOrigin==='catalog').length,0);
 });
 for(const parent of [['Ikke valgt'],['Valgt','Ikke valgt']])test('SMART-DETAILS explicit document choice removes previous manual service details '+id+'/'+parent.join('+'),()=>{
  const c=before.configurations.find(c=>c.id===id&&c.selected.includes('gjensidige-hus-smart')),manual=normalizeManualAgreement(c.input).insuranceData.insurances[0],doc=documentPipeline([[record(id,parent)]], 'existing').insuranceData.insurances[0];const i={...manual,importantTerms:[...manual.importantTerms,...doc.importantTerms.filter(t=>t.key==='hus.service.smart')]};for(const stage of stages(repeat(i)))assert.equal(pick(stage).filter(t=>t.coverageOrigin==='catalog').length,0);
 });
 test('SMART-DETAILS ordinary product identity boundaries '+id,()=>{for(const ctx of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,ctx),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);});
}
test('SMART-DETAILS all214 manual and144 actual document controls retain every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSmartDetails(first),c.first,c.id);assert.deepEqual(withoutSmartDetails(repeat(first)),c.repeated,c.id);}for(const c of before.documents)assert.deepEqual(withoutSmartDetails(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('SMART-DETAILS optional terms,52bidirectional comparisons and other products retain old rows',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>!o.keys.includes(f.key))},c.output);const details=now.facts.filter(f=>o.keys.includes(f.key));assert.equal(details.length,6);assert.ok(details.every(f=>f.role==='term'&&f.state==='optional'));}assert.equal(before.comparisons.length,52);
 for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a),rows=now.sections.flatMap(s=>s.rows),old=c.output.sections.flatMap(s=>s.rows);assert.deepEqual(rows.filter(f=>!o.keys.includes(f.key)),old);const changed=rows.filter(f=>o.keys.includes(f.key)&&f.different).length;assert.equal(now.differenceCount,c.output.differenceCount+changed);for(const row of rows.filter(f=>o.keys.includes(f.key))){const rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===row.key);assert.deepEqual(row.first,rev.second);assert.deepEqual(row.second,rev.first);}if(c.a===c.b)assert.equal(now.differenceCount,0);}
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));assert.deepEqual(availableAddOns(product,date),availableAddOns(old,date,null,before.catalog));}
});
test('SMART-DETAILS no new choice, coverage, parser enum, alias or premium calculation',()=>{
 for(const def of o.rows){assert.equal(normalizeCatalogTermKey(def.key),def.key);assert.equal(canonicalDocumentFactKeys.includes(def.key),false);assert.deepEqual(deriveCanonicalCoverages({type:'Hus',importantTerms:[{key:def.key,name:def.label,value:def.value}],coverages:[],addOns:[]},'Hus'),[]);const fact=smartDetailFact(def.key);for(const field of ['structuredValue','coverageAvailability','deductibleClassification'])assert.equal(fact[field],undefined);}
});
test('SMART-DETAILS guarded projection rejects altered price, notice, source or metadata and leaves customer facts',()=>{
 for(const key of o.keys)for(const change of [f=>f.value='Other',f=>f.source.page=99,f=>f.source.section='Other',f=>f.structuredValue={kind:'money',amount:300}]){const f=smartDetailFact(key);change(f);assert.throws(()=>withoutSmartDetails([f]));const catalog=applySmartDetails(before.catalog);change(catalog.facts.gjensidigeHusSmart.find(f=>f.key===key));assert.throws(()=>applySmartDetails(catalog));}
 for(const key of ['hus.service.smart.pris','hus.service.smart.utstyr']){const f=smartDetailFact(key);delete f.qualificationSource;assert.throws(()=>withoutSmartDetails([f]));}
 const customer={key:o.keys[0],name:o.rows[0].label,value:'Kundens pris',source:{documentId:'pdf:existing:0',filename:'Bevis.pdf',page:2}};assert.deepEqual(withoutSmartDetails([customer]),[customer]);
});
