import test from 'node:test';
import assert from 'node:assert/strict';
import { pipeline, car, term } from './helpers/pilot-quality.mjs';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { groupInsurances, createDifferences } from '../lib/comparison.ts';
import { generalTerms, batchDocuments, documentPipeline, portfolioDocuments } from './helpers/supporting-terms.mjs';
import { deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { attachSupportingTerms, supportingTermsApply, isCustomerObject } from '../lib/supporting-terms.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { analyzePdfBatches } from '../lib/pdf-analysis-pipeline.ts';
import { mergeBatchResults } from '../lib/analysis-merge.ts';
import { parseExtractionResponse } from '../lib/analysis-output.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { safeProgress, applyProgress, emptyProgress } from '../lib/analysis-progress.ts';
import { PdfSecurityError } from '../lib/pdf-upload-security.ts';

const terms = (product = 'Kasko') => ({
  ...car(product), productName: 'Produktvilkår', documentRole: 'general_terms',
  objectIdentifiers: [], annualPremium: null, deductible: null, coverageSummary: null, addOns: [],
  importantTerms: [term('Totalskadegaranti – kilometer', '20 000 km', 'nyverdi.km'),
    term('Generelt produktunntak', 'Syntetisk produktbegrensning')],
});
const objects = d => d.insuranceData.insurances;

test('supporting terms: explicit general-terms record is not a standalone customer object', () => {
  assert.equal(objects(pipeline([car(), terms()])).length, 1);
});
test('supporting terms: only two real objects determine portfolio completeness', () => {
  const price = portfolioPrice(pipeline([car(), terms(), car('Pluss'), terms('Pluss')]));
  assert.equal(price.objectCount, 2);
  assert.ok(price.components.every(c => c.completeness === 'complete' && c.expected === 2));
});
test('supporting terms: one-sided general terms cannot create false missing objects', () => {
  const a = pipeline([car(), car('Pluss'), terms(), terms('Pluss')]);
  const b = pipeline([car('Pluss'), car()], 'offer');
  const groups = groupInsurances(objects(a), objects(b), null);
  assert.equal(groups.length, 2);
  assert.ok(groups.every(g => g.objectMatch.status === 'matched'));
  assert.ok(!createDifferences(a,b,groups,null).some(d => d.kind === 'object'));
});

const fact = (object,key) => object.importantTerms.filter(t => t.key === key);
const coverage = (object,key) => deriveCanonicalCoverages(object,object.type).find(c => c.id === key);
const changeId = (object,id) => ({ ...object,objectIdentifiers:[{type:'registration',value:id,documentIndices:[1]}] });
const evidenceRecord = record => batchDocuments([[record]])[0].agreement.documentRecords[0];
test('supporting terms: role is retained by extraction, and customer promotion stops before enrichment/progress',()=>{
  const result = batchDocuments([[car(),generalTerms()]])[0].agreement;
  assert.equal(result.documentRecords.length,2);
  assert.deepEqual(result.documentRecords.map(r=>r.documentRole),['individual_agreement','general_terms']);
  assert.equal(result.insurances.length,1);
  assert.equal(result.insurances[0].canonicalProductName,'Kasko');
  assert.equal(result.documentRecords[1].catalogReference,undefined);
});
test('supporting terms: two real cars sharing a product stay isolated, both may use common terms',()=>{
  const a=car(),b=changeId(car(),'ZZ81002'); a.deductible='6000 kr';b.deductible='8000 kr';
  const r=objects(documentPipeline([[a],[b],[generalTerms('Kasko',{deductible:'9000 kr'})]]));
  assert.equal(r.length,2);assert.deepEqual(r.map(o=>o.deductible),['6000 kr','8000 kr']);
  for(const o of r){assert.ok(o.recordEvidence.some(r=>r.documentRole==='general_terms'));assert.ok(o.importantTerms.some(t=>t.name==='Generelt produktunntak'));}
});
test('supporting terms: one PDF with three real cars preserves all three',()=>{
  assert.equal(objects(documentPipeline([[car(),changeId(car(),'ZZ81002'),changeId(car(),'ZZ81003'),generalTerms()]])).length,3);
});
test('supporting terms: terms-only PDF has evidence but no customer portfolio',()=>{
  const r=documentPipeline([[generalTerms()]]);
  assert.equal(objects(r).length,0);assert.equal(r.insuranceData.supportingEvidence.length,1);
  assert.equal(r.insuranceData.totalAnnualPremium,null);
  assert.equal(portfolioPrice(r).objectCount,0);
});
for(const role of ['unknown','individual_agreement',undefined])test(`supporting terms: unpriced, unidentified ${role} customer is retained`,()=>{
  const r={...car(),documentRole:role,objectIdentifiers:[],importantTerms:[],annualPremium:null};
  const out=objects(documentPipeline([[r],[generalTerms()]]));assert.equal(out.length,1);
  assert.equal(out[0].documentRole,role);assert.equal(out[0].annualPremium,null);
});
test('supporting terms: misleading product title or filename never classifies a customer record',()=>{
  const r={...car(),documentRole:'unknown',productName:'Generelle vilkår',objectIdentifiers:[],importantTerms:[]};
  assert.equal(objects(documentPipeline([[r]])).length,1);
});
test('supporting terms: customer and general terms in one PDF yield one object with both roles',()=>{
  const r=objects(documentPipeline([[car(),generalTerms()]]))[0];
  assert.deepEqual(r.recordEvidence.map(e=>e.documentRole),['individual_agreement','general_terms']);
  assert.equal(r.documentRole,'individual_agreement');assert.equal(r.consolidation.recordCount,1);
  assert.equal(r.recordEvidence[1].sources[0].documentId,'pdf:existing:0');
});
test('supporting terms: separate terms PDF provenance is retained without relabelling as customer',()=>{
  const r=objects(documentPipeline([[car()],[generalTerms()]]))[0];
  const t=r.importantTerms.find(t=>t.name==='Generelt produktunntak');
  assert.equal(t.coverageOrigin,'catalog');assert.equal(t.sources[0].documentRole,'general_terms');
  assert.equal(t.sources[0].documentId,'pdf:existing:1');
  assert.equal(fact(r,'nyverdi.km')[0].coverageOrigin,'document');
});
for(const product of ['Kasko','Pluss'])test(`supporting terms: ${product} customer totalskade remains authoritative with no false conflict`,()=>{
  const r=objects(documentPipeline([[car(product),generalTerms(product)]]))[0];
  assert.deepEqual(fact(r,'nyverdi.alder').map(t=>t.value),[product==='Kasko'?'1 år':'3 år']);
  assert.deepEqual(fact(r,'nyverdi.km').map(t=>t.value),[product==='Kasko'?'15 000 km':'60 000 km']);
  assert.equal(r.consolidation.factConflicts?.length??0,0);
  assert.ok(r.recordEvidence[1].importantTerms.some(t=>t.key==='nyverdi.km'&&t.value==='20 000 km'));
});
test('supporting terms: alternative customer limit X beats generic Y without value-specific rules',()=>{
  for(const [x,y] of [['17 500 km','21 000 km'],['72 000 km','33 000 km']]){
    const a=car();a.importantTerms=[term('Totalskadegaranti – kilometer',x,'nyverdi.km')];
    const t=generalTerms();t.importantTerms=[term('Totalskadegaranti – kilometer',y,'nyverdi.km')];
    assert.deepEqual(fact(objects(documentPipeline([[a,t]]))[0],'nyverdi.km').map(t=>t.value),[x]);
  }
});
test('supporting terms: actual equal-priority customer conflicts are not hidden',()=>{
  const a=car(),b=car();a.importantTerms=[term('Totalskadegaranti – kilometer','17 500 km','nyverdi.km')];b.importantTerms=[term('Totalskadegaranti – kilometer','18 500 km','nyverdi.km')];
  const r=documentPipeline([[a],[b],[generalTerms()]]),o=objects(r)[0];
  assert.ok(o.consolidation.factConflicts.some(c=>c.key==='nyverdi.km'));
  const other=documentPipeline([[a]],'offer'),g=groupInsurances(objects(r),objects(other),null);
  assert.ok(createDifferences(r,other,g,null).some(d=>d.kind==='object'&&/Motstridende/.test(d.title)));
});
test('supporting terms: customer refusal remains not_selected despite generic selection/details',()=>{
  const t=generalTerms();t.importantTerms=[term('Leiebil','Valgt'),term('Leiebil – reparasjon','60 dager','leiebil.dager')];
  const r=objects(documentPipeline([[car(),t]]))[0];
  assert.equal(coverage(r,'leiebil.dekning').status,'not_selected');
  assert.ok(!fact(r,'leiebil.dager').length);
  assert.equal(r.recordEvidence[1].importantTerms.length,2);
});
test('supporting terms: silence on optional coverage stays unknown even with catalog match',()=>{
  const a=car();a.importantTerms=a.importantTerms.filter(t=>t.name!=='Leiebil');
  const t=generalTerms();t.importantTerms=[term('Leiebil','Valgt'),term('Leiebil – reparasjon','60 dager','leiebil.dager')];
  const r=objects(documentPipeline([[a,t]]))[0];assert.ok(r.catalogReference);
  assert.equal(coverage(r,'leiebil.dekning').status,'unknown');
});
test('supporting terms: documented selected coverage can gain a missing generic detail',()=>{
  const a=car('Pluss');a.company='Syntetisk';a.importantTerms=[term('Leiebil','Valgt')];
  const t=generalTerms('Pluss',{company:'Syntetisk',importantTerms:[term('Leiebil – reparasjon','37 dager','leiebil.dager')]});
  const r=objects(documentPipeline([[a,t]]))[0];assert.equal(coverage(r,'leiebil.dekning').status,'selected');
  assert.equal(fact(r,'leiebil.dager')[0].value,'37 dager');
  assert.equal(fact(r,'leiebil.dager')[0].sources[0].documentRole,'general_terms');
});
test('supporting terms: Kasko and Pluss terms cannot cross product scopes',()=>{
  const t=generalTerms('Pluss');t.importantTerms=[term('Produktspesifikt unntak','Syntetisk Pluss-unntak')];
  const r=objects(documentPipeline([[car()],[car('Pluss')],[t]]));
  assert.ok(!r[0].importantTerms.some(t=>t.name==='Produktspesifikt unntak'));
  assert.ok(r[1].importantTerms.some(t=>t.name==='Produktspesifikt unntak'));
});
for(const change of [{company:'If'},{type:'Hus'},{canonicalProductName:'Kasko medlemsavtale syntetisk'},{canonicalProductName:null}])test(`supporting terms: incompatible scope ${JSON.stringify(change)} is evidence only`,()=>{
  const r=documentPipeline([[car()],[generalTerms('Kasko',change)]]);
  assert.equal(objects(r).length,1);assert.equal(objects(r)[0].recordEvidence.length,1);
  assert.equal(r.insuranceData.supportingEvidence.length,1);
});
test('supporting terms: provider legal-name aliases retain exact scope',()=>{
  const r=objects(documentPipeline([[car()],[generalTerms('Kasko',{company:'Gjensidige Forsikring ASA'})]]))[0];
  assert.equal(r.recordEvidence.length,2);
});
test('supporting terms: explicit object scope can only support that exact object',()=>{
  const t=generalTerms('Kasko',{objectIdentifiers:car().objectIdentifiers});
  const r=objects(documentPipeline([[car()],[changeId(car(),'ZZ81002')],[t]]));
  assert.equal(r.length,2);assert.deepEqual(r.map(o=>o.recordEvidence.length),[2,1]);
  assert.equal(objects(documentPipeline([[t]])).length,0);
});
test('supporting terms: ambiguous identifier and conflict never broaden evidence scope',()=>{
  const t=generalTerms('Kasko',{objectIdentifiers:[...car().objectIdentifiers,{type:'registration',value:'ZZ81002',documentIndices:[1]}]});
  assert.equal(objects(documentPipeline([[car()],[t]]))[0].recordEvidence.length,1);
});
test('supporting terms: House is supported without vehicle identifiers or vehicle logic',()=>{
  const a={...car(),type:'Hus',company:'If',productName:'Super',canonicalProductName:'Super',objectIdentifiers:[],importantTerms:[],deductible:'6000 kr'};
  const b={...a,deductible:'8000 kr'};
  const t=generalTerms('Super',{type:'Hus',company:'If',importantTerms:[term('Generelt produktunntak','Syntetisk husbegrensning')]});
  const r=objects(documentPipeline([[a,b,t]]));assert.equal(r.length,2);
  assert.deepEqual(r.map(o=>o.deductible),['6000 kr','8000 kr']);assert.ok(r.every(o=>o.recordEvidence.length===2));
});
test('supporting terms: manual customer object is retained and can receive safely scoped evidence',()=>{
  const manual=normalizeManualAgreement({company:'Gjensidige',products:[{type:'Bil',productName:'Kasko',annualPremium:'',deductible:'6000',coverageSummary:'',importantTerms:[],catalogReference:null}]});
  const customer=objects(manual)[0];assert.ok(isCustomerObject(customer));
  const r=attachSupportingTerms({...customer,company:'Gjensidige'},[evidenceRecord(generalTerms())],'existing');
  assert.equal(r.deductible,customer.deductible);assert.ok(r.importantTerms.some(t=>t.name==='Generelt produktunntak'));
});
test('supporting terms: upload evidence never crosses comparison sides',()=>{
  const existing=batchDocuments([[car()],[generalTerms()]],'existing');
  const offer=batchDocuments([[car()]],'offer');
  const r=mergeBatchResults([...existing,...offer],'offer',false);assert.equal(objects(r)[0].recordEvidence.length,1);
  assert.ok(!supportingTermsApply(objects(r)[0],existing[0].agreement.documentRecords[1]));
});
test('supporting terms: documented versions and dates cannot silently attach to another/unknown version',()=>{
  const customer=objects(documentPipeline([[car()]]))[0],t=evidenceRecord(generalTerms());
  t.documentSources[0].termsNumber='SYNTHETIC-V2';assert.equal(supportingTermsApply(customer,t),false);
  customer.documentSources[0].termsNumber='SYNTHETIC-V1';assert.equal(supportingTermsApply(customer,t),false);
  customer.documentSources[0].termsNumber='SYNTHETIC-V2';assert.equal(supportingTermsApply(customer,t),true);
  t.documentSources[0].effectiveFrom='2027-01-01';customer.agreementPeriod={from:'2026-01-01',to:null};assert.equal(supportingTermsApply(customer,t),false);
  t.documentSources[0].effectiveFrom='2025-01-01';assert.equal(supportingTermsApply(customer,t),true);
  customer.documentSources[0].effectiveFrom='2024-01-01';assert.equal(supportingTermsApply(customer,t),false);
});
test('supporting terms: conflicting generic facts are retained but never silently choose a winner',()=>{
  const a=generalTerms(),b=generalTerms();b.importantTerms[2].value='Annen syntetisk produktbegrensning';
  const r=objects(documentPipeline([[car(),a,b]]))[0];
  assert.ok(!r.importantTerms.some(t=>t.name==='Generelt produktunntak'));
  assert.equal(r.recordEvidence.length,3);assert.equal(r.consolidation.factConflicts?.length??0,0);
});
test('supporting terms: no generic scalar price, object details or addon list leaks into customer',()=>{
  const a={...car(),company:'Syntetisk',importantTerms:[],annualPremium:null};
  const t=generalTerms('Kasko',{company:'Syntetisk',annualPremium:'9000 kr',importantTerms:[term('Totalpris','9000 kr','premie.total'),term('Årlig kjørelengde','9000 km','kjoretoy.kjorelengde')],addOns:[{name:'Maskinskade',annualPremium:null,deductible:null,importantTerms:[term('Maskinskade','Valgt')]}]});
  const r=objects(documentPipeline([[a,t]]))[0];assert.equal(r.annualPremium,null);assert.deepEqual(r.addOns,[]);
  assert.equal(fact(r,'premie.total').length,0);assert.equal(fact(r,'kjoretoy.kjorelengde').length,0);
  assert.equal(coverage(r,'maskinskade.dekning').status,'unknown');
});
test('supporting terms: a real missing trailer still creates a missing-object warning',()=>{
  const a=documentPipeline([[car()],[{...changeId(car(),'ZZ81009'),type:'Tilhenger'}],[generalTerms()]]);
  const b=documentPipeline([[car()]],'offer'),groups=groupInsurances(objects(a),objects(b),null);
  assert.equal(groups.filter(g=>g.objectMatch.status==='unmatched_existing').length,1);
  assert.equal(groups.find(g=>g.objectMatch.status==='unmatched_existing').key,'tilhenger');
});
for(const split of [false,true])for(const reverse of [false,true])test(`supporting terms: production-like 2+2, split=${split}, reversed completion=${reverse}`,()=>{
  const docs=['existing','offer'].map(side=>documentPipeline(portfolioDocuments(side),side,split,reverse));
  assert.deepEqual(docs.map(d=>objects(d).length),[2,2]);
  assert.deepEqual(docs.map(d=>d.insuranceData.supportingEvidence.length),[2,2]);
  for(const doc of docs){const p=portfolioPrice(doc);assert.equal(p.objectCount,2);assert.ok(p.components.every(c=>c.completeness==='complete'&&c.expected===2));
    for(const o of objects(doc))assert.equal(fact(o,'nyverdi.km')[0].value,o.canonicalProductName==='Kasko'?'15 000 km':'60 000 km');
    const plus=objects(doc).find(o=>o.canonicalProductName==='Pluss');assert.equal(coverage(plus,'maskinskade.dekning').status,'selected');
    assert.equal(fact(plus,'maskinskade.alder')[0].value,'10 år');assert.equal(fact(plus,'maskinskade.km')[0].value,'200 000 km');
  }
  const groups=groupInsurances(...docs.map(objects),null);assert.equal(groups.length,2);assert.ok(groups.every(g=>g.objectMatch.reason==='EXACT_OBJECT_ID'));
  assert.ok(!createDifferences(...docs,groups,null).some(d=>d.kind==='object'));
  const swapped=groupInsurances(...docs.toReversed().map(objects),null);assert.ok(swapped.every(g=>g.objectMatch.status==='matched'));
});
test('supporting terms: genuine missing customer price remains partial',()=>{
  const docs=portfolioDocuments();docs[1][0].importantTerms=docs[1][0].importantTerms.filter(t=>t.canonicalKey!=='premie.total');
  const p=portfolioPrice(documentPipeline(docs));assert.equal(p.components[2].expected,2);assert.equal(p.components[2].completeness,'partial');
});
test('supporting terms: final progress resolves consolidated objects and strips arbitrary fields',()=>{
  let state=applyProgress(emptyProgress(),{type:'analysis_started',existingDocumentCount:2,offerDocumentCount:2});
  for(const side of ['existing','offer'])for(let i=0;i<4;i++)state=applyProgress(state,{type:'product_status',side,batchIndex:0,productIndex:i,insuranceType:'bil',status:'identified'});
  for(const side of ['existing','offer'])state=applyProgress(state,{type:'products_resolved',side,insuranceTypes:['bil','bil']});
  state=applyProgress(state,{type:'analysis_completed',partialSuccess:false,successfulDocuments:4,failedDocuments:0});
  assert.equal(state.products.length,4);assert.ok(state.products.every(p=>p.status==='completed'));
  const event=safeProgress({type:'products_resolved',side:'existing',insuranceTypes:['bil','PRIVATE'],filename:'PRIVATE',objectId:'ZZ81001'});
  assert.deepEqual(event.insuranceTypes,['bil','unknown']);assert.doesNotMatch(JSON.stringify(event),/PRIVATE|ZZ81001/);
});
for(const fail of [false,true])test(`supporting terms: asynchronous PDF pipeline preserves document progress, partial=${fail}, and privacy`,async()=>{
  const events=[],telemetry=createAnalysisTelemetry('synthetic-role-runtime');let calls=0;
  const docs={existing:portfolioDocuments(),offer:portfolioDocuments('offer')};
  const result=await analyzePdfBatches({
    sides:['existing','offer'].map(side=>({side,files:[0,1].map(i=>({data:Buffer.from(`${side}:${i}`),name:`Synthetic-${i}.pdf`}))})),
    controller:new AbortController(),telemetry,emit:event=>events.push(event),
    parse:async pdf=>{if(fail&&pdf.data.toString()==='offer:1')throw new PdfSecurityError(422,'invalid_pdf','Synthetic invalid PDF');return {text:'Synthetic '.repeat(9000),pages:1,parseMs:1,textMs:1};},
    extract:async batch=>{
      calls++;await new Promise(r=>setTimeout(r,batch.side==='existing'?10:1));
      const records=batch.documents.flatMap((d,index)=>docs[batch.side][d.documentIndex].map(record=>({...record,
        documentIndices:[index+1],objectIdentifiers:record.objectIdentifiers.map(id=>({...id,documentIndices:[index+1]})),
        importantTerms:record.importantTerms.map(t=>({...t,documentIndices:[index+1]})),
      })));
      return parseExtractionResponse({output_text:JSON.stringify({company:'Gjensidige',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:records})});
    },
  });
  assert.equal(result.successfulDocuments,fail?3:4);assert.equal(result.partialSuccess,fail);
  assert.equal(calls,fail?3:4);assert.equal(events.filter(e=>e.type==='product_status'&&e.status==='identified').length,fail?3:4);
  assert.deepEqual(['existing','offer'].map(side=>objects(mergeBatchResults(result.results,side,result.partialSuccess)).length),fail?[2,1]:[2,2]);
  assert.doesNotMatch(JSON.stringify(events),/ZZ1000|Synthetic-|Produktbeskrivelse|15 000|60 000|8641/);
  assert.doesNotMatch(JSON.stringify(telemetry.snapshot(200)),/ZZ1000|Synthetic-|Produktbeskrivelse|15 000|60 000|8641/);
});
