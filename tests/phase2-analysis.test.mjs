import test from 'node:test';
import assert from 'node:assert/strict';
import { planExtractionBatches, runBatchPool, rejectDuplicatePdfs, MAX_BATCH_INPUT_BYTES } from '../lib/analysis-batching.ts';
import { analyzePdfBatches } from '../lib/pdf-analysis-pipeline.ts';
import { enrichBatch, mergeBatchResults } from '../lib/analysis-merge.ts';
import { safeProgress, applyProgress, emptyProgress, createAnalysisGeneration } from '../lib/analysis-progress.ts';
import { readAnalysisResponse, validateUploadSelection } from '../lib/analysis-client.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { buildExtractionRequest, parseExtractionResponse, AnalysisOutputError } from '../lib/analysis-output.ts';
import { validatePdfFileList, validateAggregatePdfBytes, PdfSecurityError, MAX_PDF_FILE_BYTES, MAX_PDF_REQUEST_BYTES } from '../lib/pdf-upload-security.ts';
import { runHybridMatching } from '../lib/hybrid-matching.ts';
const file = (i=0) => new File([`%PDF-1.7\nSynthetic file ${i}`], `PRIVATE_${i}.pdf`, {type:'application/pdf'});
const textDoc = (i, side='existing', length=100, pages=1) => ({ side, documentIndex:i, text:'x '.repeat(Math.ceil(length/2)).slice(0,length), pages });
const agreement = (types=['Bil'], indices=[1]) => ({ company:'Gjensidige', totalAnnualPremium:null, totalAnnualPremiumScope:'partial_or_unclear', insurances:types.map(type=>({ type, productName:'Kasko', canonicalProductName:'Kasko', company:'Gjensidige', documentIndices:indices, annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:[{name:'Valgfritt faktum',value:'PRIVATE_VALUE',canonicalKey:null,documentIndices:indices}] })) });
const telemetry = () => createAnalysisTelemetry('00000000-0000-0000-0000-000000000000');
async function pipeline(counts=[2,2], custom={}) {
  const events=[], t=telemetry(), controller=new AbortController();
  let current=0, peak=0, calls=0, parsing=0, parsePeak=0;
  const results=await analyzePdfBatches({ sides:counts.map((count,i)=>({side:i?'offer':'existing',files:Array.from({length:count},(_,j)=>({data:new Uint8Array([j+1])}))})), controller, telemetry:t, emit:e=>events.push(e),
    parse:async (pdf)=>{ parsing++; parsePeak=Math.max(parsePeak,parsing); await Promise.resolve(); parsing--;return {text:'synthetic insurance '.repeat(20)+pdf.data[0],pages:1,parseMs:1,textMs:2}; },
    extract:async batch=>{calls++;current++;peak=Math.max(peak,current);await Promise.resolve();current--;return agreement(['Bil'],batch.documents.map((_,i)=>i+1));}, ...custom });
  return {results,events,t,peak,calls,parsePeak};
}
for(const side of ['existing','offer']) {
 test(`10 ${side} PDFs accepted by both UI and backend`,()=>{const files=Array.from({length:10},(_,i)=>file(i));validatePdfFileList(files);validateUploadSelection(side==='existing'?files:[],side==='offer'?files:[]);});
 test(`11 ${side} PDFs rejected by both UI and backend`,()=>{const files=Array.from({length:11},(_,i)=>file(i));assert.throws(()=>validatePdfFileList(files));assert.throws(()=>validateUploadSelection(side==='existing'?files:[],side==='offer'?files:[]));});
}
test('10+10 below byte budget accepted',()=>validateUploadSelection(Array.from({length:10},(_,i)=>file(i)),Array.from({length:10},(_,i)=>file(i))));
test('per-file and aggregate resource limits remain authoritative',()=>{
 assert.throws(()=>validatePdfFileList([{name:'x.pdf',type:'application/pdf',size:MAX_PDF_FILE_BYTES+1}]));
 assert.throws(()=>validateAggregatePdfBytes([[{size:MAX_PDF_REQUEST_BYTES}],[{size:1}]]));
});
for(const counts of [[1,1],[5,0],[10,0],[10,10]]) test(`structural benchmark ${counts.join('+')}: minimum batching, bounded concurrency, N to M`,async()=>{
 const r=await pipeline(counts);assert.equal(r.calls,counts.filter(Boolean).length);assert.ok(r.peak<=2);assert.equal(r.parsePeak,1);
 assert.equal(r.results.successfulDocuments,counts.reduce((a,b)=>a+b,0));assert.equal(r.results.partialSuccess,false);
 assert.equal(r.t.snapshot(200).batchCount,r.calls);assert.ok(r.events.every(e=>!JSON.stringify(e).includes('PRIVATE')));
});
test('batches follow input budget and preserve document boundaries exactly once',()=>{
 const docs=Array.from({length:4},(_,i)=>textDoc(i,'existing',90000));const b=planExtractionBatches(docs);
 assert.equal(b.length,4);assert.deepEqual(b.flatMap(x=>x.documents.map(d=>d.documentIndex)),[0,1,2,3]);
 for(const batch of b)assert.ok(Buffer.byteLength(batch.input)<=MAX_BATCH_INPUT_BYTES);
});
test('page budget can split small-text batches',()=>assert.equal(planExtractionBatches([textDoc(0,'existing',100,90),textDoc(1,'existing',100,90)]).length,2));
test('one oversize PDF fails explicitly without truncation',()=>assert.throws(()=>planExtractionBatches([textDoc(0,'existing',200000)]),e=>e.code==='document_input_budget'));
test('total page budget rejects a 500-page package',()=>assert.throws(()=>planExtractionBatches([...Array.from({length:2},(_,i)=>textDoc(i,'existing',100,125)),...Array.from({length:2},(_,i)=>textDoc(i,'offer',100,125))]),e=>e.code==='job_resource_budget'));
test('aggregate UTF8 input budget enforced',()=>assert.throws(()=>planExtractionBatches(Array.from({length:8},(_,i)=>textDoc(i,'existing',140000))),e=>e.code==='job_resource_budget'));
test('maximum batch count limits fragmentation',()=>assert.throws(()=>planExtractionBatches(Array.from({length:9},(_,i)=>textDoc(i,'existing',90000))),e=>e.code==='job_resource_budget'));
test('duplicate PDFs rejected within side without persisting or logging hashes',()=>assert.throws(()=>rejectDuplicatePdfs([{data:new Uint8Array([1])},{data:new Uint8Array([1])}]),e=>e.code==='duplicate_pdf'&&!/[a-f0-9]{64}/.test(e.message)));
for(const types of [['Bil'],['Bil','Hus','Innbo','Reise']]) test(`single PDF produces ${types.length} products only after extraction`,async()=>{
 let resolved=false;const events=[];
 const r=await pipeline([1,0],{emit:e=>{events.push(e);if(e.type==='product_status')assert.equal(resolved,true);},extract:async()=>{resolved=true;return agreement(types);}});
 assert.equal(r.results.results[0].agreement.insurances.length,types.length);assert.equal(events.filter(e=>e.type==='product_status'&&e.status==='completed').length,types.length);
});
test('four PDF sources and mixed multi-product documents retain precise source IDs',()=>{
 const batch=planExtractionBatches([0,1,2].map(i=>textDoc(i)))[0];
 const data=agreement();data.insurances=[...agreement(['Bil','Reise'],[1]).insurances,...agreement(['Hus'],[2]).insurances,...agreement(['Innbo','Hund'],[3]).insurances];
 const result=enrichBatch(data,batch,telemetry());assert.equal(result.insurances.length,5);
 assert.deepEqual(result.insurances.map(p=>p.documentReferences[0].documentIndex),[0,0,1,2,2]);
 assert.equal(result.insurances[2].importantTerms.find(t=>t.value==='PRIVATE_VALUE').sources[0].documentId,'pdf:existing:1');
});
test('four documents in separate batches merge deterministically to four products',()=>{
 const batches=planExtractionBatches([0,1,2,3].map(i=>textDoc(i,'existing',90000)));
 const results=batches.map((batch,i)=>({batch,agreement:enrichBatch(agreement([['Bil','Hus','Innbo','Reise'][i]]),batch,telemetry())}));
 const first=mergeBatchResults(results,'existing',false),second=mergeBatchResults([...results].reverse(),'existing',false);
 assert.deepEqual(first,second);assert.deepEqual(first.insuranceData.insurances.map(p=>p.type),['Bil','Hus','Innbo','Reise']);assert.equal(first.insuranceData.totalAnnualPremium,null);
});
test('same provider/type/product in separate batches preserves two objects and side identity',()=>{
 const batches=planExtractionBatches([textDoc(0,'existing',90000),textDoc(1,'existing',90000),textDoc(0,'offer')]);
 const results=batches.map(batch=>({batch,agreement:enrichBatch(agreement(),batch,telemetry())}));
 const merged=mergeBatchResults(results,'existing',false).insuranceData.insurances;
 assert.equal(merged.length,2);assert.notEqual(merged[0].analysisObjectId,merged[1].analysisObjectId);assert.equal(mergeBatchResults(results,'offer',false).insuranceData.insurances.length,1);
});
test('same object documented within a batch preserves all sources without duplicate identical facts',()=>{
 const batch=planExtractionBatches([textDoc(0),textDoc(1)])[0],data=agreement(['Bil'],[1,2]);
 data.insurances[0].importantTerms=[{name:'Leiebil',value:'Valgt',canonicalKey:'leiebil.dekning',documentIndices:[1]},{name:'Leiebil',value:'Valgt',canonicalKey:'leiebil.dekning',documentIndices:[2]}];
 const p=enrichBatch(data,batch,telemetry()).insurances[0];const facts=p.importantTerms.filter(t=>t.key==='leiebil.dekning');assert.equal(facts.length,1);assert.equal(facts[0].sources.length,2);
});
test('unknown cross-document object identity stays separate; conflicts are not resolved by completion order',()=>{
 const batches=planExtractionBatches([textDoc(0,'existing',90000),textDoc(1,'existing',90000)]);
 const results=batches.map((batch,i)=>{const a=agreement();a.insurances[0].importantTerms=[{name:'Maskinskade kilometer',canonicalKey:'maskinskade.km',value:i?'180 000 km':'210 000 km',documentIndices:[1]}];return {batch,agreement:enrichBatch(a,batch,telemetry())};});
 assert.deepEqual(mergeBatchResults(results,'existing',false),mergeBatchResults([...results].reverse(),'existing',false));assert.equal(mergeBatchResults(results,'existing',false).insuranceData.insurances.length,2);
});
test('multi-document extraction must supply valid provenance',()=>{
 const batch=planExtractionBatches([textDoc(0),textDoc(1)])[0];const data=agreement();delete data.insurances[0].documentIndices;
 assert.throws(()=>enrichBatch(data,batch,telemetry()),AnalysisOutputError);
 data.insurances[0].documentIndices=[3];assert.throws(()=>enrichBatch(data,batch,telemetry()),AnalysisOutputError);
});
test('batch output schema requires product and term document references and per-product company',()=>{
 const request=buildExtractionRequest('synthetic',3);const product=request.text.format.schema.properties.insurances.items;
 assert.ok(product.required.includes('documentIndices'));assert.ok(product.required.includes('company'));assert.ok(product.properties.importantTerms.items.required.includes('documentIndices'));
 assert.equal(request.model,'gpt-5.6-luna');assert.equal(request.store,false);
 assert.throws(()=>parseExtractionResponse({output_text:JSON.stringify({...agreement(),PRIVATE:'bad'})}));
});
for(const code of ['invalid_pdf','encrypted_pdf','missing_text_layer']) test(`isolated ${code} yields partial success without guessed products`,async()=>{
 const r=await pipeline([3,1],{parse:async pdf=>{if(pdf.data[0]===2)throw new PdfSecurityError(422,code,'PRIVATE_ERROR');return {text:'valid document text '.repeat(3),pages:1,parseMs:1,textMs:1};}});
 assert.equal(r.results.partialSuccess,true);assert.equal(r.results.failures.length,1);assert.equal(r.results.successfulDocuments,3);
 assert.ok(!JSON.stringify(r.events).includes('PRIVATE'));assert.equal(r.events.filter(e=>e.type==='document_status'&&e.status==='failed').length,1);
});
test('request resource violation stops before any AI call',async()=>{
 let calls=0;await assert.rejects(pipeline([2,1],{parse:async()=>{throw new PdfSecurityError(413,'too_many_pages','Too large');},extract:async()=>{calls++;return agreement();}}));assert.equal(calls,0);
});
test('malformed model batch does not discard other successful batches',async()=>{
 const r=await pipeline([3,1],{parse:async()=>({text:'x '.repeat(45000),pages:1,parseMs:1,textMs:1}),extract:async batch=>{if(batch.batchIndex===1)throw new AnalysisOutputError('PRIVATE_MODEL');return agreement();}});
 assert.equal(r.results.failures.length,1);assert.equal(r.results.results.length,3);assert.equal(r.results.partialSuccess,true);
});
test('all documents failing on a side is not presented as a valid empty comparison',async()=>{
 await assert.rejects(pipeline([1,1],{parse:async()=>{throw new PdfSecurityError(422,'invalid_pdf','PRIVATE');}}),e=>e.code==='no_readable_documents');
});
test('out-of-order pool completion preserves order and at most two calls',async()=>{
 const batches=planExtractionBatches([0,1,2].map(i=>textDoc(i,'existing',90000)));const gates=[];let active=0,peak=0;
 const pending=runBatchPool(batches,new AbortController(),async b=>{active++;peak=Math.max(peak,active);await new Promise(resolve=>gates[b.batchIndex]=resolve);active--;return b.batchIndex;});
 await Promise.resolve();assert.equal(gates.length,2);gates[1]();await new Promise(resolve=>setImmediate(resolve));gates[2]();gates[0]();assert.deepEqual(await pending,[0,1,2]);assert.equal(peak,2);
});
test('abort prevents queued batches and waits for active siblings',async()=>{
 const controller=new AbortController();let count=0;
 const b=planExtractionBatches([0,1,2,3].map(i=>textDoc(i,'existing',90000)));
 await assert.rejects(runBatchPool(b,controller,async()=>{count++;controller.abort(new Error('abort'));await Promise.resolve();}));assert.equal(count,1);
});
test('progress is monotonic and completed/failed products cannot regress',()=>{
 let s=applyProgress(emptyProgress(),{type:'analysis_started',existingDocumentCount:1,offerDocumentCount:0});
 for(const status of ['validating','extracting','ready','analyzing','completed'])s=applyProgress(s,{type:'document_status',side:'existing',documentIndex:0,status});
 s=applyProgress(s,{type:'document_status',side:'existing',documentIndex:0,status:'analyzing'});assert.equal(s.documents[0].status,'completed');
 const p={type:'product_status',side:'existing',batchIndex:0,productIndex:0,insuranceType:'bil'};
 s=applyProgress(s,{...p,status:'identified'});s=applyProgress(s,{...p,status:'completed'});s=applyProgress(s,{...p,status:'analyzing'});assert.equal(s.products[0].status,'completed');
 s=applyProgress(s,{type:'analysis_completed',partialSuccess:true,successfulDocuments:1,failedDocuments:1});assert.equal(s.status,'partial');
});
test('progress allowlist blocks labels, values, filename, raw type and error text',()=>{
 const safe=safeProgress({type:'product_status',side:'offer',batchIndex:0,productIndex:0,status:'identified',insuranceType:'PRIVATE_TYPE',filename:'PRIVATE_FILE',value:'PRIVATE_VALUE'});
 assert.equal(safe.insuranceType,'unknown');assert.ok(!JSON.stringify(safe).includes('PRIVATE'));
 const failure=safeProgress({type:'document_status',side:'offer',documentIndex:0,status:'failed',error:'PRIVATE_ERROR'});assert.equal(failure.error,undefined);
});
test('old progress, error and final results are gated after new generation/cancel',()=>{
 const gate=createAnalysisGeneration(),old=gate.next(),fresh=gate.next();assert.equal(gate.current(old),false);assert.equal(gate.current(fresh),true);gate.next();assert.equal(gate.current(fresh),false);
});
test('stream reader handles split frames and never treats missing final result as success',async()=>{
 const encoder=new TextEncoder();const events=[];const lines=JSON.stringify({type:'progress',event:{type:'analysis_started',existingDocumentCount:1,offerDocumentCount:1}})+'\n'+JSON.stringify({type:'result',data:{ok:true}})+'\n';
 const response=new Response(new ReadableStream({start(c){for(const char of lines)c.enqueue(encoder.encode(char));c.close();}}),{headers:{'content-type':'application/x-ndjson'}});
 assert.deepEqual(await readAnalysisResponse(response,e=>events.push(e)),{ok:true});assert.equal(events.length,1);
 await assert.rejects(readAnalysisResponse(new Response('{"type":"heartbeat"}\n',{headers:{'content-type':'application/x-ndjson'}}),()=>{}),/Forbindelsen/);
});
test('token accounting sums all calls and cached input without double counting',()=>{
 const t=telemetry();for(const kind of ['extraction','extraction','semantic'])t.usage(kind,10,true,{usage:{input_tokens:100,output_tokens:20,total_tokens:120,input_tokens_details:{cached_tokens:30}}});
 assert.deepEqual(t.snapshot(200).tokenTotals,{inputTokens:300,outputTokens:60,totalTokens:360,cachedInputTokens:90});assert.equal(t.snapshot(200).extractionCalls,2);
});
test('semantic matcher does not pool facts from multiple objects of the same type',async()=>{
 const ins=agreement(['Bil','Bil']).insurances.map(p=>({...p,importantTerms:[{name:'Unknown',value:'x'}]}));let calls=0;
 await runHybridMatching(ins,ins,async()=>{calls++;return {decisions:[]};});assert.equal(calls,0);
});
test('unknown type is preserved in result but anonymized in progress',async()=>{
 const r=await pipeline([1,0],{extract:async()=>agreement(['PRIVATE_UNKNOWN'])});assert.equal(r.results.results[0].agreement.insurances[0].type,'PRIVATE_UNKNOWN');assert.ok(r.events.filter(e=>e.type==='product_status').every(e=>e.insuranceType==='unknown'));
});

test('long unbroken text remains bounded during privacy filtering',()=>{
 assert.throws(()=>planExtractionBatches([{...textDoc(0),text:'x'.repeat(200000)}]),e=>e.code==='document_input_budget');
});
test('two batches of two different products preserve all four products and their source side',()=>{
 const batches=planExtractionBatches([textDoc(0,'existing',90000),textDoc(1,'existing',90000)]);
 const results=batches.map((batch,i)=>({batch,agreement:enrichBatch(agreement(i?['Innbo','Reise']:['Bil','Hus']),batch,telemetry())}));
 const products=mergeBatchResults(results,'existing',false).insuranceData.insurances;
 assert.deepEqual(products.map(p=>p.type),['Bil','Hus','Innbo','Reise']);
 assert.deepEqual(products.map(p=>p.documentReferences[0]),[{side:'existing',documentIndex:0},{side:'existing',documentIndex:0},{side:'existing',documentIndex:1},{side:'existing',documentIndex:1}]);
});
test('term sources cannot escape the attributed product documents',()=>{
 const batch=planExtractionBatches([textDoc(0),textDoc(1)])[0],data=agreement();
 data.insurances[0].importantTerms[0].documentIndices=[2];
 assert.throws(()=>enrichBatch(data,batch,telemetry()),AnalysisOutputError);
});
test('out-of-sequence document completion and unidentified product completion are ignored',()=>{
 const state=applyProgress(emptyProgress(),{type:'analysis_started',existingDocumentCount:1,offerDocumentCount:0});
 assert.equal(applyProgress(state,{type:'document_status',side:'existing',documentIndex:0,status:'completed'}),state);
 assert.equal(applyProgress(state,{type:'product_status',side:'existing',batchIndex:0,productIndex:0,insuranceType:'bil',status:'completed'}),state);
});
test('per-product company is preserved in a mixed-provider document without cross-provider enrichment',()=>{
 const data=agreement(['Bil','Bil']);data.insurances[1].company='Tryg';data.insurances[1].productName='Ukjent produkt';data.insurances[1].canonicalProductName=null;
 const products=enrichBatch(data,planExtractionBatches([textDoc(0)])[0],telemetry()).insurances;
 assert.equal(products[0].catalogReference.providerId,'gjensidige');assert.equal(products[1].company,'Tryg');assert.ok(!products[1].catalogReference);
});
test('structured extraction schemas have exactly one required entry per defined property',()=>{
 const visit=(value)=>{
  if(!value||typeof value!=='object')return;
  if(value.properties)assert.deepEqual([...value.required].sort(),Object.keys(value.properties).sort());
  for(const child of Object.values(value))if(Array.isArray(child))child.forEach(visit);else visit(child);
 };
 visit(buildExtractionRequest('synthetic').text.format.schema);
 visit(buildExtractionRequest('synthetic',10).text.format.schema);
});
test('partial failure metadata retains original document order despite reversed completion',async()=>{
 const r=await pipeline([3,1],{parse:async()=>({text:'x '.repeat(45000),pages:1,parseMs:1,textMs:1}),extract:async batch=>{
  if(batch.batchIndex===0){await new Promise(resolve=>setImmediate(resolve));throw new AnalysisOutputError('bad');}
  if(batch.batchIndex===1)throw new AnalysisOutputError('bad');
  return agreement();
 }});
 assert.deepEqual(r.results.failures.map(f=>f.documentIndex),[0,1]);
});
