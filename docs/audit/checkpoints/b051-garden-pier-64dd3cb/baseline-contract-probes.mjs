import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { inspect } from 'node:util';
const root=new URL('../../../../',import.meta.url).pathname;
const {productCatalog}=await import(root+'lib/product-catalog.ts');
const {enrichExtractedAgreementWithCatalog}=await import(root+'lib/catalog-enrichment.ts');
const {normalizeManualAgreement}=await import(root+'lib/manual-agreement.ts');
const {deriveCanonicalCoverages}=await import(root+'lib/coverage-status.ts');
const {documentPipeline}=await import(root+'tests/helpers/supporting-terms.mjs');
const before=JSON.parse(gunzipSync(readFileSync(root+'docs/audit/checkpoints/b051-garden-pier-64dd3cb/baseline-catalog.json.gz')));
const date=new Date('2026-10-06T12:00:00Z');
const input={company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:'Hus',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:[]}]};
const results=[];
for(const [mode,catalog] of [['COMMITTED_BASELINE',before],['CANDIDATE',productCatalog]]){
 const first=enrichExtractedAgreementWithCatalog(input,date,undefined,undefined,catalog).insurances[0];
 const second=enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[first]},date,undefined,undefined,catalog).insurances[0];
 const select=i=>i.importantTerms.find(t=>t.key==='hus.hage.objekter');
 const a=select(first),b=select(second);assert.equal(a.value,b.value);assert.deepEqual(a.source,b.source);assert.deepEqual(a.sources,b.sources);
 const states=i=>deriveCanonicalCoverages(i,'Hus').map(c=>[c.id,c.status,c.conflict]);
 const manual=normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:'Hus',annualPremium:'',deductible:'',coverageSummary:'',addOnIds:[],importantTerms:[{name:'Hage og uteområde',value:'Kundevilkår 73 000 kr'}]}]},catalog).insuranceData.insurances[0];
 const m=select(manual);assert.equal(Object.hasOwn(m.sources[0],'note'),true);assert.equal(m.sources[0].note,undefined);
 // Actual document pipeline read from the committed component in baseline round, solely in this process.
 const saved=productCatalog.facts.gjensidigeHusStandard;productCatalog.facts.gjensidigeHusStandard=catalog.facts.gjensidigeHusStandard;
 const roleOutputs=[];
 for(const role of ['individual_agreement','unknown','general_terms']){
  const record={...input.insurances[0],canonicalProductName:'Hus',documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:[{name:'Hage og uteområde',value:'Dokumentert kundevilkår 73 000 kr',documentIndices:[1]}]};
  const out=documentPipeline([[record]]).insuranceData;const i=role==='general_terms'?out.supportingEvidence[0]:out.insurances[0];const t=i.importantTerms.find(t=>t.name==='Hage og uteområde');
  assert.equal(t.value,'Dokumentert kundevilkår 73 000 kr');assert.equal(Object.hasOwn(t,'source'),false);assert.equal(t.sources.length,1);
  roleOutputs.push({role,objects:out.insurances.length,supporting:out.supportingEvidence.length,term:inspect(t,{depth:null})});
 }
 productCatalog.facts.gjensidigeHusStandard=saved;
 results.push({mode,re_enrichment:{first:inspect(a,{depth:null}),second:inspect(b,{depth:null}),same_value_and_complete_provenance:true,first_selection_states:states(first),second_selection_states:states(second)},manual:inspect(m,{depth:null}),document_roles:roleOutputs});
}
const sourceOutputs=[];
for(const level of ['Standard','Pluss']){
 const path=root+'catalog/sources/gjensidige/hus/Hus-'+level+'-alminnelige-vilkar.pdf';
 const plain=execFileSync('pdftotext',['-f','3','-l','3',path,'-']).toString().replace(/\s+/gu,' ');
 const layout=execFileSync('pdftotext',['-f','3','-l','3','-layout',path,'-']).toString().replace(/\s+/gu,' ');
 const extract=t=>t.slice(t.indexOf('Fast brygge'),t.indexOf('Fast brygge')+250);
 sourceOutputs.push({level,plain:extract(plain),layout:extract(layout)});
}
writeFileSync(new URL('baseline-contract-probes.json',import.meta.url),JSON.stringify({status:'BASELINE_CONTRACTS_REPRODUCED',results,sourceOutputs},null,2));console.log(JSON.stringify({status:'PASS',modes:results.map(r=>r.mode),sourceOutputs},null,2));
