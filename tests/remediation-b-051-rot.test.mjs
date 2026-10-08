import {execFileSync} from 'node:child_process';
import test from 'node:test';
import {deserialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';
import {applyRot, applyRotStatus} from './helpers/b051-rot.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {expectedCatalog as activeExpected} from './helpers/b051-liability.mjs';
const path=new URL('../docs/audit/checkpoints/b051-rot-77db841/',import.meta.url),p=JSON.parse(readFileSync(new URL('proposal.json',path))),snapshot=JSON.parse(readFileSync(new URL('baseline-snapshot.json',path))),bytes=readFileSync(new URL(snapshot.snapshot,path)),baseline=applyRotStatus(deserialize(gunzipSync(bytes))),candidate=productCatalog,key=p.key,ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-08T12:00:00Z');
assert.equal(createHash('sha256').update(bytes).digest('hex'),snapshot.sha256);

const product=(c,id)=>c.products.find(x=>x.productId===id),terms=i=>i.importantTerms.filter(t=>t.key===key||t.name===p.label),state=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict})),rot=i=>state(i).filter(x=>/rate|råte/u.test(x.id)),source={documentId:'synthetic:rot:customer',filename:'Kundebevis.pdf',termsNumber:'Syntetisk kundebevis',effectiveFrom:'',company:'Gjensidige',page:2,section:'Råte',note:'Minneprobe'};
const vs=[[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundens særvilkår for råte']];
const input=(c,id,values=[],addons=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',agreementScope:'ordinary',productName:product(c,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:values.map(value=>({name:p.label,canonicalKey:key,value,source})),addOns:addons.map(id=>({name:c.addOns.find(a=>a.id===id).name,importantTerms:[]}))}]});
const enrich=(c,id,values=[],addons=[])=>enrichExtractedAgreementWithCatalog(input(c,id,values,addons),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const record=(id,role,values)=>({...input(baseline,id).insurances[0],canonicalProductName:product(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:values.map(value=>({name:p.label,value,canonicalKey:null,documentIndices:[1]}))});
function pipe(c,docs,side){const save=productCatalog.facts;try{productCatalog.facts=c.facts;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts=save;}}
const observations=[];let checks=0;function check(mode,context,fn){checks++;test('R-051-ROT '+mode+' '+JSON.stringify(context),()=>{observations.push({mode,...context,result:fn()});});}
for(const id of ids)for(const values of vs)check('enrichment',{id,values},()=>{const a=enrich(baseline,id,values),b=enrich(candidate,id,values),aa=repeat(baseline,a),bb=repeat(candidate,b);assert.deepEqual(state(b),state(a));assert.deepEqual(state(bb),state(aa));assert.deepEqual(b.addOnIds,a.addOnIds);for(const t of terms(b).filter(t=>t.coverageOrigin==='document')){assert.deepEqual(t.source,source);assert.equal(Object.hasOwn(t,'sources'),false);assert.ok(values.includes(t.value));}return{before:rot(a),after:rot(b),repeat_before:rot(aa),repeat_after:rot(bb),terms:terms(b),addons:b.addOnIds};});
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const side of ['existing','offer'])for(const values of vs)check('document-pipeline',{id,role,side,values},()=>{const docs=[[record(id,role,values)]],a=pipe(baseline,docs,side),b=pipe(candidate,docs,side);assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.equal(b.insurances.length,role==='general_terms'?0:1);if(b.insurances.length){assert.deepEqual(state(b.insurances[0]),state(a.insurances[0]));for(const t of terms(b.insurances[0]).filter(t=>t.coverageOrigin==='document')){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);assert.ok(values.includes(t.value));}}return{before:a.insurances.map(rot),after:b.insurances.map(rot),supporting:b.supportingEvidence.length,terms:b.insurances.map(terms)};});
for(const id of ids)check('support+customer',{id},()=>{const docs=[[record(id,'individual_agreement',['Kundens særvilkår for råte'])],[record(id,'general_terms',[p.value])]],a=pipe(baseline,docs,'existing'),b=pipe(candidate,docs,'existing');assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.deepEqual(state(b.insurances[0]),state(a.insurances[0]));assert.equal(terms(b.insurances[0]).find(t=>t.coverageOrigin==='document').value,'Kundens særvilkår for råte');return{before:rot(a.insurances[0]),after:rot(b.insurances[0]),supporting:b.supportingEvidence};});
for(const id of ids)for(const custom of [false,true])check('manual',{id,custom},()=>{const manual=c=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':product(c,id).name,customProduct:custom,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:[],importantTerms:[{name:p.label,value:'Kundens manuelle særvilkår for råte'}]}]},c).insuranceData.insurances[0];const a=manual(baseline),b=manual(candidate);assert.deepEqual(state(b),state(a));if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);assert.equal(b.importantTerms[0].value,'Kundens manuelle særvilkår for råte');}else{const f=resolveCatalogFacts(product(candidate,id),[],date,null,candidate).find(f=>f.key===key),t=terms(b)[0];assert.equal(t.coverageOrigin,'catalog');assert.equal(t.value,f.value);assert.deepEqual(t.sources,catalogFactSources(f).map((s,index)=>({...s,note:index===0?(f.replacesBase?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined):'Supplerende kilde for faktumets anvendelse'})));}return{before:rot(a),after:rot(b),terms:terms(b),catalogReference:b.catalogReference};});
for(const id of ids)check('materialization',{id},()=>{const a=materializeCatalogProduct(product(baseline,id),baseline),b=materializeCatalogProduct(product(candidate,id),candidate),x=b.facts.find(x=>x.key===key),prev=a.facts.find(x=>x.key===key);assert.deepEqual({...x,value:prev.value},prev);return{before:prev,after:x};});
for(const id of ids)for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],...(id===ids[0]?[['gjensidige-hus-rate-insekter'],['gjensidige-hus-rate-insekter','gjensidige-hus-utleie'],['gjensidige-hus-rate-insekter','gjensidige-hus-smart']]:[])])check('inheritance-addons',{id,addons},()=>{const a=resolveCatalogFacts(product(baseline,id),addons,date,null,baseline),b=resolveCatalogFacts(product(candidate,id),addons,date,null,candidate);assert.deepEqual(b.filter(x=>x.key!==key),a.filter(x=>x.key!==key));const f=b.find(x=>x.key===key),old=a.find(x=>x.key===key);assert.deepEqual({...f,value:old.value},old);assert.equal(f.replacesBase,id===ids[1]||addons.includes('gjensidige-hus-rate-insekter')?true:undefined);return{before:old,after:f};});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('product-comparison',{id,other},()=>{const a=compareCatalogProducts(product(candidate,id),product(candidate,other),candidate),b=compareCatalogProducts(product(candidate,other),product(candidate,id),candidate);if(id===other)assert.equal(a.differenceCount,0);for(const row of a.sections.flatMap(x=>x.rows)){const inverse=b.sections.flatMap(x=>x.rows).find(x=>x.key===row.key);assert.deepEqual(row.first,inverse.second);assert.deepEqual(row.second,inverse.first);}return{differences:a.differenceCount};});
for(const id of ids)for(const side of ['existing','offer'])check('customer-comparison',{id,side},()=>{const customer=pipe(candidate,[[record(id,'individual_agreement',['Kundens særvilkår for råte'])]],side).insurances[0],general=enrich(candidate,id),results=[];for(const[a,b,s]of[[customer,general,'first'],[general,customer,'second']]){const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===key);assert.equal(row[s],'Kundens særvilkår for råte');assert.deepEqual(row[s+'Sources'],terms(customer).find(t=>t.coverageOrigin==='document').sources);results.push(row);}return results;});
check('isolation',{},()=>{let components=0,raw=0,products=0,totalRaw=0;for(const k of ['products','sources','addOns','insuranceTypes'])assert.deepEqual(candidate[k],baseline[k]);for(const[o,fs]of Object.entries(baseline.facts)){totalRaw+=fs.length;const filter=xs=>xs.filter(f=>!p.owners.includes(o)||f.key!==key);assert.deepEqual(filter(candidate.facts[o]),filter(fs));raw+=filter(fs).length;if(!p.owners.includes(o))components++;for(const f of fs.filter(f=>f.key.startsWith('hus.skadedyr.')||f.key==='hus.rate.egenandel'))assert.deepEqual(candidate.facts[o].find(x=>x.key===f.key),f);}for(const pr of baseline.products.filter(x=>!ids.includes(x.productId))){assert.deepEqual(resolveCatalogFacts(pr,[],date,null,candidate),resolveCatalogFacts(pr,[],date,null,baseline));products++;}return{components,raw,products,totalRaw,totalComponents:Object.keys(baseline.facts).length,totalProducts:baseline.products.length};});
check('active-reverse-oracle-collision',{},()=>{assert.deepEqual(JSON.parse(JSON.stringify(applyRot(deserialize(gunzipSync(bytes))))),JSON.parse(JSON.stringify(activeExpected)));assert.deepEqual(JSON.parse(JSON.stringify(candidate)),JSON.parse(JSON.stringify(activeExpected)));const independent=structuredClone(baseline);for(const o of p.owners){const f=independent.facts[o].find(f=>f.key===key);assert.equal(f.value,p.previous_value);assert.equal(f.label,p.label);assert.equal(f.source.documentId,p.primary.documentId);assert.equal(f.source.page,6);assert.equal(f.source.section,p.primary.section);f.value=p.value;}assert.deepEqual(JSON.parse(JSON.stringify(candidate)),JSON.parse(JSON.stringify(independent)));return{changed:p.owners.map(o=>[o,key]),independent_transform:'PASS'};});
check('B020-three-protected-fingerprints',{},()=>{const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');return ids.flatMap(id=>(id===ids[0]?[[],['gjensidige-hus-rate-insekter']]:[[]]).map(addons=>{const rows=c=>resolveCatalogFacts(product(c,id),addons,date,null,c).filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!==key),before=digest(rows(baseline)),after=digest(rows(candidate));assert.equal(after,before);return{id,addons,before,after};}));});

for(const values of vs)check('explicit-addon',{id:ids[0],values},()=>{const addon=['gjensidige-hus-rate-insekter'],a=enrich(baseline,ids[0],values,addon),b=enrich(candidate,ids[0],values,addon);assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);return{before:rot(a),after:rot(b),addons:b.addOnIds,terms:terms(b)};});
for(const id of ids)check('repeated-metadata-full-field',{id},()=>{const a=enrich(baseline,id),b=enrich(candidate,id),aa=repeat(baseline,a),bb=repeat(candidate,b);const control=(x,y)=>{assert.equal(x.importantTerms.length,y.importantTerms.length);return x.importantTerms.map((t,i)=>{const u=y.importantTerms[i];if(t.value===p.value&&u.value===p.previous_value)assert.deepEqual({...t,value:u.value},u);else assert.deepEqual(t,u);return{key:t.key,fields:Object.keys(t),sources:t.sources,source:t.source};});};control(b,a);control(bb,aa);return{first:control(b,a).filter(x=>x.key===key),repeated:control(bb,aa).filter(x=>x.key===key)};});

for(const id of ids)check('materialization-all-rot-rows',{id},()=>{const a=materializeCatalogProduct(product(baseline,id),baseline).facts.filter(f=>f.key===key),b=materializeCatalogProduct(product(candidate,id),candidate).facts.filter(f=>f.key===key);assert.equal(b.length,a.length);for(const[i,f]of b.entries())assert.deepEqual({...f,value:a[i].value},a[i]);return{before:a,after:b};});
for(const addons of [['gjensidige-hus-rate-insekter'],['gjensidige-hus-rate-insekter','gjensidige-hus-utleie'],['gjensidige-hus-rate-insekter','gjensidige-hus-smart']])check('manual-selected-addon',{addons},()=>{const make=c=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:'Hus',annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:addons}]},c).insuranceData.insurances[0],a=make(baseline),b=make(candidate),f=candidate.facts.gjensidigeHusRotOption.find(f=>f.key===key),t=terms(b)[0];assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);assert.ok(b.addOnIds.includes('gjensidige-hus-rate-insekter'));assert.equal(t.value,p.value);assert.equal(t.coverageOrigin,'catalog');assert.deepEqual(t.sources,catalogFactSources(f).map((s,index)=>({...s,note:index===0?'Effektiv verdi fra dokumentert utvidelse eller tillegg':'Supplerende kilde for faktumets anvendelse'})));return{before:rot(a),after:rot(b),addons:b.addOnIds,term:t};});
process.on('exit',()=>{if(process.env.ROT_PROBE_RESULT_FILE)writeFileSync(process.env.ROT_PROBE_RESULT_FILE,JSON.stringify({checks,observations},null,2)+'\n');});

const frozen=[
 ['Hus-Pluss-alminnelige-vilkar.pdf','79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792','gjensidigeHusPluss'],
 ['Hus-Standard-alminnelige-vilkar.pdf','d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc','gjensidigeHusStandard'],
 ['IPID-Husforsikring-EAP01.pdf','5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9','gjensidigeHusIpid'],
];
for(const [filename,sha256,id]of frozen)check('frozen-source',{id},()=>{
 const original=readFileSync(new URL('../catalog/sources/gjensidige/hus/'+filename,import.meta.url));
 assert.equal(createHash('sha256').update(original).digest('hex'),sha256);
 assert.equal(candidate.sources[id].filename,filename);assert.equal(candidate.sources[id].sha256,sha256);
 assert.deepEqual(candidate.sources[id],baseline.sources[id]);
});
check('complete-PDF6-source-clauses',{},()=>{
 const normalized=execFileSync('pdftotext',['-raw','-f','6','-l','6',new URL('../catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf',import.meta.url).pathname,'-'],{encoding:'utf8'}).replace(/\s+/gu,' ');
 const heading='Råte og skadeinsekter Forsikringen gjelder for bygninger som er fullverdiforsikret.';
 const start=normalized.indexOf(heading);assert.ok(start>=0);
 const relevant=normalized.slice(start);assert.ok(relevant.indexOf('Råteskader dekker ikke:')>relevant.indexOf('Råte og skadeinsekter dekker ikke:'));
 for(const clause of [
  'Skade på bygning (nedbrytning av materialer) som skyldes råtesopper og treødeleggende insekter',
  'Den del av skade på bygning som utviklet seg før avtalen begynte å løpe, og heller ikke for skadeutvikling etter at forsikringen har opphørt',
  'Kostnader til kontroll, vedlikehold, forbedringer og behandling av forebyggende karakter',
  'Skader på bygninger innen landbruks- og næringsvirksomhet selv om de er oppført i forsikringsbeviset',
  'Råteskader på dører, vinduer og lekter på yttervegg/tak, laft og alt utvendig treverk',
  'Utvikling av blåved, svertesopp og muggsopp','Annet som er skjemmende for utseendet',
 ])assert.ok(relevant.includes(clause),clause);
 assert.doesNotMatch(p.value,/insekter/u); // B-020's independent insect branches remain separate.
});
check('IPID-optional-and-deductible-source',{},()=>{
 const extract=(filename,page)=>execFileSync('pdftotext',['-raw','-f',String(page),'-l',String(page),new URL('../catalog/sources/gjensidige/hus/'+filename,import.meta.url).pathname,'-'],{encoding:'utf8'}).replace(/\s+/gu,' ');
 assert.ok(extract(frozen[2][0],2).includes('Hus standard kan utvides med dekning for sopp, råte og skadeinsekter'));
 assert.match(extract(frozen[0][0],1),/Råte og skadeinsekter\s+6 000/u);
 for(const owner of p.owners)assert.deepEqual(candidate.facts[owner].find(f=>f.key==='hus.rate.egenandel'),baseline.facts[owner].find(f=>f.key==='hus.rate.egenandel'));
});
const authorization=JSON.parse(readFileSync(new URL('authorization.json',path)));
for(const [index,binding]of p.bindings.entries())check('exact-original-binding',{binding},()=>{
 const original=authorization.original_binding;
 assert.equal(original.signature_id,'6af32d21acb9584c');assert.equal(original.final_batch_id,'B-051');
 assert.equal(JSON.parse(original.finding_ids)[index],binding.gap);assert.equal(JSON.parse(original.source_fact_ids)[index],binding.sf);
 assert.deepEqual(JSON.parse(JSON.parse(original.products)[index]),['gjensidige','bolig','ordinary',binding.product,'Alminnelige vilkår']);
 assert.equal(original.P2_occurrences,'0');
});
check('full-fields-and-independent-provenance',{},()=>{
 assert.deepEqual(candidate,applyRot(deserialize(gunzipSync(bytes))));
 for(const owner of p.owners){const before=baseline.facts[owner].find(f=>f.key===key),after=candidate.facts[owner].find(f=>f.key===key);
  assert.deepEqual(after,{...before,value:p.value});assert.equal(after.replacesBase,true);
  assert.equal(after.source.documentId,'gjensidigeHusPluss');assert.equal(after.source.filename,frozen[0][0]);assert.equal(after.source.page,6);assert.equal(after.source.section,'Råte og skadeinsekter');
  assert.equal(Object.hasOwn(after.source,'productCode'),true);assert.equal(after.source.productCode,undefined);assert.equal(Object.hasOwn(after.source,'sourceType'),false);
  if(owner==='gjensidigeHusRotOption'){assert.equal(after.qualificationSource.documentId,'gjensidigeHusIpid');assert.equal(after.qualificationSource.page,2);assert.equal(after.qualificationSource.section,'Utvidelser');assert.deepEqual(catalogFactSources(after),[before.source,before.qualificationSource]);}
  else{assert.equal(Object.hasOwn(after,'qualificationSource'),false);assert.deepEqual(catalogFactSources(after),[before.source]);}
 }
});
check('transform-negative-controls',{},()=>{
 for(const owner of p.owners)for(const field of ['value','label','replacesBase']){const invalid=structuredClone(baseline);invalid.facts[owner].find(f=>f.key===key)[field]='INVALID';assert.throws(()=>applyRot(invalid));}
 for(const owner of p.owners)for(const field of ['page','section','documentId']){const invalid=structuredClone(baseline);invalid.facts[owner].find(f=>f.key===key).source[field]='INVALID';assert.throws(()=>applyRot(invalid));}
 for(const owner of p.owners){const invalid=structuredClone(baseline);invalid.facts[owner].push(structuredClone(invalid.facts[owner].find(f=>f.key===key)));assert.throws(()=>applyRot(invalid));const missing=structuredClone(baseline);missing.facts[owner]=missing.facts[owner].filter(f=>f.key!==key);assert.throws(()=>applyRot(missing));}
});
check('authorized-optional-status-contract',{},()=>{
 for(const c of [baseline,candidate]){const customer=pipe(c,[[record(ids[0],'individual_agreement',[])]],'existing').insurances[0];assert.equal(rot(customer)[0].status,'unknown');assert.deepEqual(customer.addOnIds,[]);
  const rows=materializeCatalogProduct(product(c,ids[0]),c).facts.filter(f=>f.key===key);assert.equal(rows.find(f=>f.value===baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).value).state,'unavailable');assert.equal(rows.filter(f=>f.state==='optional').length,1);
 }
});
check('sixty-immutable-receipts',{},()=>{
 const prior=JSON.parse(readFileSync(new URL('prior-receipts.json',path)));assert.equal(prior.length,60);assert.equal(new Set(prior.map(r=>r.signature)).size,60);
 for(const r of prior){const b=readFileSync(new URL('../'+r.path,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),r.sha256);assert.equal(JSON.parse(b).status,'PASS');}
});
