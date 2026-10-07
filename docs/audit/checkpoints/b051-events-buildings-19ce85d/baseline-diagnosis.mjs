import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { productCatalog, resolveCatalogFacts } from '../../../../lib/product-catalog.ts';
import { enrichExtractedAgreementWithCatalog } from '../../../../lib/catalog-enrichment.ts';
import { deriveCanonicalCoverages } from '../../../../lib/coverage-status.ts';
import { baselineCatalog, expectedCatalog, sourceOracle } from './expected-catalog.mjs';
const ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-06T12:00:00Z');
const report={classification:'READ_ONLY_DIAGNOSIS_NO_CORRECTION',roots:[],phases:{},errors:[]};
const fingerprint=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
for (const [phase,catalog] of [['unchanged_HEAD_catalog',baselineCatalog],['candidate',productCatalog]]) {
 const cases=[];
 for(const id of ids)for(const key of Object.keys(sourceOracle).filter(k=>k!=='hus.takvegg.folgeskade'||id===ids[1]))for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']]){
  const p=catalog.products.find(p=>p.productId===id),importantTerms=values.map(value=>({name:sourceOracle[key].label,canonicalKey:key,value,source:{documentId:'synthetic-diag',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Avtalte vilkår'}}));
  const input={company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:p.name,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms}]};
  const first=enrichExtractedAgreementWithCatalog(input,date,undefined,undefined,catalog).insurances[0];
  const again=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[first]},date,undefined,undefined,catalog).insurances[0];
  const states=i=>deriveCanonicalCoverages(i,'Hus').map(c=>({id:c.id,status:c.status,conflict:c.conflict}));
  const row=i=>i.importantTerms.filter(t=>t.key===key);
  assert.deepEqual(row(first).map(t=>[t.name,t.key,t.value,t.source,t.sources]),row(again).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
  assert.deepEqual(first.addOnIds,[]);assert.deepEqual(again.addOnIds,[]);
  const raw=resolveCatalogFacts(p,[],date,null,catalog).find(f=>f.key===key);
  cases.push({id,key,input:values,firstStates:states(first),againStates:states(again),new_ids_on_repeat:states(again).filter(c=>!states(first).some(d=>d.id===c.id)),resolved_raw_has_overriddenBase:Object.hasOwn(raw,'overriddenBase'),resolved_replacesBase:raw.replacesBase??false,first_row:row(first),again_row:row(again)});
 }
 report.phases[phase]=cases;
}
for(let n=0;n<report.phases.candidate.length;n++){
 const a=report.phases.candidate[n],b=report.phases.unchanged_HEAD_catalog[n];
 try { assert.deepEqual(a.firstStates,b.firstStates);assert.deepEqual(a.againStates,b.againStates);assert.deepEqual(a.new_ids_on_repeat,b.new_ids_on_repeat); }catch(e){report.errors.push({n,message:e.message});}
}
report.roots=[{id:'RAW_RESOLVED_VS_ENRICHED_INHERITANCE_METADATA',affected_assertions:['R-051-EVENTS-FACT hus.takvegg.folgeskade at108','R-051-EVENTS-DOCUMENT Pluss takvegg at145/148'],baseline_has_raw_overriddenBase:false,baseline_enriched_fallback_overriddenBase:report.phases.unchanged_HEAD_catalog.find(c=>c.key==='hus.takvegg.folgeskade'&&c.input.length===0).first_row[0].overriddenBase},
 {id:'REPEATED_ENRICHMENT_GLOBAL_CANONICAL_SET_IDEMPOTENCE_ASSUMPTION',affected_line:152,baseline_extra:report.phases.unchanged_HEAD_catalog[0].new_ids_on_repeat,candidate_extra:report.phases.candidate[0].new_ids_on_repeat,all_66_cases_same_baseline_and_candidate:report.errors.length===0}];
report.cases_per_phase=report.phases.candidate.length;report.status='DIAGNOSIS_COMPLETE_NO_CORRECTION';report.candidate_catalog_sha256=fingerprint(productCatalog);report.baseline_catalog_sha256=fingerprint(baselineCatalog);report.independent_expected_catalog_sha256=fingerprint(expectedCatalog);
writeFileSync(new URL('baseline-diagnosis.json', import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({roots:report.roots,cases_per_phase:report.cases_per_phase,errors:report.errors},null,2));
