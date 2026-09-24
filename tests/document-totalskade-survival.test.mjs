import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {parseExtractionResponse,sanitizeAnalysisDocumentForClient} from '../lib/analysis-output.ts';
import {enrichBatch,mergeBatchResults} from '../lib/analysis-merge.ts';
import {planExtractionBatches} from '../lib/analysis-batching.ts';
import {createAnalysisTelemetry} from '../lib/analysis-telemetry.ts';
import {groupInsurances,groupTerms,createDifferences} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
const term=(name,value,canonicalKey=null)=>({name,value,canonicalKey,documentIndices:[1]});
const record=(terms,product='Kasko',company='Gjensidige',id='ZZ10001')=>({type:'Bil',company,productName:product,canonicalProductName:product,annualPremium:null,deductible:null,coverageSummary:null,documentRole:'individual_agreement',agreementPeriod:null,documentIndices:[1],objectIdentifiers:[{type:'registration',value:id,documentIndices:[1]}],importantTerms:terms,addOns:[]});
const facts=(r,key)=>r.importantTerms.filter(t=>t.key===key);
const parsed=records=>parseExtractionResponse({output_text:JSON.stringify({company:'Gjensidige',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:records})});
const terms=(value,shape,product='Kasko')=>[
 ...(shape==='separate'?[term('Totalskadegaranti – alder','1 år','nyverdi.alder'),term('Totalskadegaranti – kilometer',value,'nyverdi.km')]:
 [term(`Totalskadegaranti – ${product}`,`Gjelder for kjøretøy inntil 1 år fra første registreringsdato og inntil ${value}.`,shape==='canonical'?'nyverdi.grenser':null)]),
 term('Årlig kjørelengde','20 000 km per forsikringsår.','kjoretoy.kjorelengde')];
function batchResults(records,side='existing'){
 return planExtractionBatches(records.map((r,documentIndex)=>({side,documentIndex,text:'Synthetic '.repeat(9000),pages:1}))).map(batch=>({batch,agreement:enrichBatch(parsed(batch.documents.map(d=>records[d.documentIndex])),batch,createAnalysisTelemetry('00000000-0000-0000-0000-000000000000'))}));
}
const expectDoc=(r,value)=>{assert.deepEqual(facts(r,'nyverdi.km').map(t=>t.value),[value]);assert.equal(facts(r,'nyverdi.km')[0].coverageOrigin,'document');assert.ok(facts(r,'kjoretoy.kjorelengde')[0].value.includes('20 000'));};
for(const value of ['15 000 km','17 000 km','12 000 km'])for(const shape of ['separate','qualified','canonical'])test(`document ${value} survives every stage (${shape})`,()=>{
 const raw=record(terms(value,shape)),extraction=parsed([raw]).insurances[0];
 assert.ok(extraction.importantTerms.some(t=>t.value.includes(value)));
 const normalized={...raw,importantTerms:normalizeDocumentFacts(extraction)};expectDoc(normalized,value);
 const enriched=enrichExtractedAgreementWithCatalog(parsed([raw])).insurances[0];expectDoc(enriched,value);assert.ok(enriched.catalogFacts.some(t=>t.key==='nyverdi.km'&&t.value==='Inntil 20 000 km'));
 const batches=batchResults([raw]);expectDoc(batches[0].agreement.insurances[0],value);
 const merged=mergeBatchResults(batches,'existing',false);expectDoc(merged.insuranceData.insurances[0],value);
 const client=sanitizeAnalysisDocumentForClient(merged).insuranceData.insurances[0];expectDoc(client,value);assert.ok(facts(client,'nyverdi.km')[0].sources.every(s=>s.documentId.startsWith('pdf:')));
 const other=record(terms('60 000 km','qualified','Pluss'),'Pluss');other.importantTerms[0].value=other.importantTerms[0].value.replace('1 år','3 år');
 const offer=mergeBatchResults(batchResults([other],'offer'),'offer',false).insuranceData.insurances[0];
 const groups=groupInsurances([client],[offer],null),compared=groupTerms(groups[0],null);assert.equal(compared.find(t=>t.key==='nyverdi.km').first,value);assert.equal(compared.find(t=>t.key==='nyverdi.km').second,'60 000 km');
 const doc=r=>({source:'pdf',insuranceData:{company:'Gjensidige',totalAnnualPremium:null,insurances:[r]}});const presented=presentImportantDifferences(createDifferences(doc(client),doc(offer),groups,null),groups,null);const pair=presented.find(d=>d.limitPair)?.limitPair;assert.ok(pair);assert.equal(pair.first,`1 år / ${value}`);assert.equal(pair.second,'3 år / 60 000 km');
});
test('same-object cross-batch fragments preserve document limit and sources',()=>{
 const rows=[record([term('Totalskadegaranti – Kasko','Gjelder for kjøretøy inntil 1 år fra første registreringsdato og inntil 15 000 km.')]),record([term('Årlig kjørelengde','20 000 km per forsikringsår.','kjoretoy.kjorelengde')])];
 const batches=batchResults(rows);assert.equal(batches.length,2);for(const order of [batches,batches.toReversed()]){const r=mergeBatchResults(order,'existing',false).insuranceData.insurances;assert.equal(r.length,1);expectDoc(r[0],'15 000 km');assert.equal(facts(r[0],'nyverdi.km')[0].sources[0].documentId,'pdf:existing:0');assert.equal(facts(r[0],'kjoretoy.kjorelengde')[0].sources[0].documentId,'pdf:existing:1');}
});
test('normalizing a canonical document fact twice retains its identity',()=>{const r=record([term('Dokumentert kilometergrense','17 000 km','nyverdi.km')]);const once=normalizeDocumentFacts(r),twice=normalizeDocumentFacts({...r,importantTerms:once});assert.deepEqual(twice,once);});
test('exact product qualifier works for another existing provider',()=>{const r=record(terms('18 000 km','qualified'),'Kasko','Tryg');const normalized=normalizeDocumentFacts(r);assert.equal(normalized.find(t=>t.key==='nyverdi.km').value,'18 000 km');expectDoc(enrichExtractedAgreementWithCatalog({company:'Tryg',insurances:[r]}).insurances[0],'18 000 km');});
test('wrong product qualifier cannot supply a limit',()=>{const r=record(terms('15 000 km','qualified','Pluss'));assert.ok(!normalizeDocumentFacts(r).some(t=>t.key==='nyverdi.km'));});
test('vehicle type cannot inherit Bil qualified totalskade facts',()=>{const r={...record(terms('15 000 km','qualified')),type:'Tilhenger'};assert.ok(!normalizeDocumentFacts(r).some(t=>t.key==='nyverdi.km'));});
test('generic kilometer label without canonical key remains ambiguous',()=>{assert.ok(!normalizeDocumentFacts(record([term('Kilometergrense','15 000 km')])).some(t=>t.key==='nyverdi.km'));});

test('two logical cars retain Kasko 1/15000 and Pluss 3/60000 in reversed portfolios',()=>{
 const kasko=record(terms('15 000 km','qualified'));const pluss=record(terms('60 000 km','qualified','Pluss'),'Pluss','Gjensidige','ZZ10002');pluss.importantTerms[0].value=pluss.importantTerms[0].value.replace('1 år','3 år');
 const left=mergeBatchResults(batchResults([kasko,pluss]),'existing',false),right=mergeBatchResults(batchResults([pluss,kasko],'offer').toReversed(),'offer',false);
 const groups=groupInsurances(left.insuranceData.insurances,right.insuranceData.insurances,null);assert.equal(groups.length,2);
 for(const group of groups){assert.equal(group.first[0].objectIdentifiers[0].value,group.second[0].objectIdentifiers[0].value);const expected=group.first[0].productName==='Kasko'?['1 år','15 000 km']:['3 år','60 000 km'];const compared=groupTerms(group,null);for(const [i,key] of ['nyverdi.alder','nyverdi.km'].entries()){assert.equal(compared.find(t=>t.key===key).first,expected[i]);assert.equal(compared.find(t=>t.key===key).second,expected[i]);}for(const r of [...group.first,...group.second])expectDoc(r,expected[1]);}
});
