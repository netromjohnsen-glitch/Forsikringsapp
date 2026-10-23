import {withOriginalBuildingsSourcePage} from './helpers/house-buildings-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize} from 'node:v8';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,resolveCatalogEvidence,availableAddOns,resolveAddOnPackage,findCatalogProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {groupTerms,groupInsurances,groupAddOnNames} from '../lib/comparison.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeTermName} from '../lib/insurance-normalization.ts';
import {isNonAssertingCoverageDetail} from '../lib/coverage-fact-semantics.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {underinsuranceOracle as o,underinsuranceFact,applyUnderinsurance,withoutUnderinsurance} from './helpers/b130-underinsurance.mjs';

const dir=new URL('../docs/audit/checkpoints/b130-underinsurance-0e4c09d/',import.meta.url);
const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir))),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-23T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id);
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const a=repeat(i),b=repeat(a);return[i,a,b,repeat(clean(b))];};
const pick=i=>i.importantTerms.filter(t=>t.key===o.key);
const raw=id=>structuredClone(baseline.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,values=[],role='individual_agreement')=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name:o.label,value,canonicalKey:null,documentIndices:[1]}))});
const states=i=>clean(deriveCanonicalCoverages(withOriginalBuildingsSourcePage(i),'Hus'));
const pdfText=(file,page)=>execFileSync('pdftotext',['-raw','-f',String(page),'-l',String(page),file,'-']).toString().replace(/\s+/gu,' ');

test('UNDERINSURANCE CR-226 has exactly the two original P1 source bindings',()=>{
 assert.equal(o.signature,'15f5b4a3e9f79fd2');assert.equal(o.review_id,'CR-226');assert.equal(o.original_registry.final_batch_id,'B-130');
 assert.equal(o.original_registry.P1_occurrences,'2');assert.equal(o.original_registry.P2_occurrences,'0');
 assert.deepEqual(JSON.parse(o.original_registry.finding_ids),['GAP-2115','GAP-2174']);assert.deepEqual(JSON.parse(o.original_registry.source_fact_ids),['SF-3033','SF-3120']);
 assert.deepEqual(o.original_bindings.map(b=>JSON.parse(b.product_identity)),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));
 assert.equal(meta.base_revision,'0e4c09d528e92da85e3afad6db50620f6db00983');assert.equal(meta.captured_before_production_change,true);
});
test('UNDERINSURANCE exact catalog equals independent before plus two fully specified rows',()=>{
 assert.deepEqual(productCatalog,applyUnderinsurance(baseline.catalog));assert.deepEqual(withoutUnderinsurance(productCatalog),baseline.catalog);
 for(const owner of owners){
  assert.deepEqual(productCatalog.facts[owner].filter(f=>f.key===o.key),[underinsuranceFact(owner)]);
  for(const mutate of [f=>f.source.page=99,f=>f.qualificationSource.page=99,f=>f.value='Reduseres etter arealbrøk']){
   const bad=applyUnderinsurance(baseline.catalog);mutate(bad.facts[owner].find(f=>f.key===o.key));assert.throws(()=>applyUnderinsurance(bad));assert.throws(()=>withoutUnderinsurance(bad));
  }
 }
});
for(const [n,id]of ids.entries()){
 test('UNDERINSURANCE own registered source pages and both complete price/notification triggers '+id,()=>{
  const b=o.original_bindings[n],file=new URL('../'+b.source_artifact,import.meta.url).pathname,page=n?18:17;
  assert.equal(b.source_fact_id,n?'SF-3120':'SF-3033');assert.equal(b.finding_id,n?'GAP-2174':'GAP-2115');assert.equal(b.source_location,`PDF 2,${page}`);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_sha256);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_sha256);
  const primary=pdfText(file,page),qualifier=pdfText(file,2),context=pdfText(file,page-1);
  for(const phrase of ['Tilbygg, påbygg og sidebygg som ikke er meldt','Tilbygg, påbygg og sidebygg omfattes av bygningsforsikringen og skal meldes Gjensidige innen førstkommende hovedforfall for å unngå underforsikring.','Er melding ikke gitt, reduseres erstatningen tilsvarende forholdet mellom avtalt pris før forandringen og riktig pris etter forandringen.','Dersom bygningens areal er større enn hva som fremgår i forsikringsbeviset','slik den ville vært med oppgitt areal og slik den ville vært med faktisk areal'])assert.ok(primary.includes(phrase),phrase);
  for(const phrase of ['Du må varsle Gjensidige dersom bygningens areal er større enn hva som fremgår av forsikringsbeviset','innen neste hovedforfall','kan erstatningen reduseres tilsvarende forholdet mellom bygningens avtalte pris og riktig pris før og etter endringen'])assert.ok(qualifier.includes(phrase),phrase);
  assert.ok(context.includes('Fullverdiforsikret bygning'));assert.ok(context.includes('Førsterisikoforsikret bygning'));
  assert.equal(productCatalog.sources[owners[n]].effectiveFrom,'');assert.equal(productCatalog.sources[owners[n]].version,'Alminnelige vilkår');
 });
 test('UNDERINSURANCE one nonasserting detail with both own references and inherited evidence '+id,()=>{
  const row=resolveCatalogFacts(p(id),[],date).filter(f=>f.key===o.key);assert.deepEqual(row,[underinsuranceFact(owners[n])]);
  for(const key of ['structuredValue','coverageAvailability','catalogSelectionConfirmed','deductibleClassification','selectionEvidenceKeys'])assert.equal(Object.hasOwn(row[0],key),false);
  const m=materializeCatalogProduct(p(id)).facts.filter(f=>f.key===o.key);assert.equal(m.length,1);assert.equal(m[0].role,'term');assert.equal(m[0].value,o.value);
  assert.deepEqual(m[0].sources,catalogFactSources(underinsuranceFact(owners[n])).map(s=>({...s,sourceType:undefined})));
  const ev=resolveCatalogEvidence(p(id),[],date).filter(f=>f.key===o.key);assert.equal(ev.length,n?2:1);assert.deepEqual(ev.map(f=>f.qualificationSource.page),n?[2,2]:[2]);
  assert.equal(isNonAssertingCoverageDetail(o.key),true);assert.equal(canonicalDocumentFactKeys.includes(o.key),false);assert.equal(normalizeTermName(o.label,{insuranceType:'Hus'}),'underforsikring areal og bygningsendringer');
  assert.deepEqual(deriveCanonicalCoverages({type:'Hus',coverages:[],coverageFacts:[],addOns:[],importantTerms:[{key:o.key,name:o.label,value:o.value}]},'Hus'),[]);
 });
 for(const c of baseline.configurations.filter(c=>c.id===id))test('UNDERINSURANCE every valid manual selection retains all old fields and complete sources '+id+'/'+c.selected.join('+'),()=>{
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutUnderinsurance(first),c.first);
  const fact=underinsuranceFact(owners[n]),terms=pick(first);assert.equal(terms.length,1);
  const expected={name:o.label,value:o.value,key:o.key,coverageOrigin:'catalog',structuredValue:undefined,deductibleClassification:undefined,source:fact.source,sources:[{...fact.source,note:n?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined},{...fact.qualificationSource,note:'Supplerende kilde for faktumets anvendelse'}],overriddenBase:n?[{value:o.value,source:underinsuranceFact(owners[0]).source}]:[]};
  assert.deepEqual(terms,[expected]);
  for(const i of stages(first)){assert.deepEqual(clean(pick(i)),clean(terms));assert.deepEqual(states(i),states(c.first));assert.deepEqual(new Set(i.addOnIds),new Set(c.first.addOnIds));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);assert.equal(groupAddOnNames([i],'Hus'),groupAddOnNames([c.first],'Hus'));}
 });
 for(const side of ['existing','offer'])for(const values of [[],['Kundens konkrete underforsikringsregel'],['Ikke valgt'],['Ukjent'],['Kundens regel A','Kundens motstridende regel B']])test('UNDERINSURANCE real document pipeline exact-label priority '+id+'/'+side+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[o.value];
  for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),expected);assert.ok(pick(i).every(t=>t.coverageOrigin===(expected[0]===o.value?'catalog':'document')));assert.deepEqual(clean(pick(i)),clean(pick(first)));assert.deepEqual(states(i),states(first));}
  if(expected[0]!==o.value)assert.ok(pick(first).every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));
  const shown=groupTerms(groupInsurances([first],[first],null)[0],null).find(r=>r.key===o.key);assert.ok(shown);assert.ok(!shown.first?.startsWith('✓'));
 });
 for(const side of ['existing','offer'])test('UNDERINSURANCE late exact document rule wins with complete source '+id+'/'+side,()=>{
  const first=documentPipeline([[record(id)]],side).insuranceData.insurances[0];
  const source={documentId:'synthetic:underinsurance',filename:'Kundebevis.pdf',termsNumber:'Særavtale',page:2,section:'Avtalt fravik',effectiveFrom:'',documentRole:'individual_agreement'};
  const value='Kundens konkrete underforsikringsregel';
  const late=repeat({...first,importantTerms:[...first.importantTerms,{name:o.label,value,coverageOrigin:'document',sources:[source]}]});
  const fresh=documentPipeline([[record(id,[value])]],side).insuranceData.insurances[0];
  for(const i of stages(late)){assert.deepEqual(pick(i).map(t=>[t.key,t.name,t.value,t.coverageOrigin]),pick(fresh).map(t=>[t.key,t.name,t.value,t.coverageOrigin]));assert.deepEqual(pick(i)[0].sources,[source]);}
 });
 for(const side of ['existing','offer'])test('UNDERINSURANCE supporting general terms never confirm form area notification or selection '+id+'/'+side,()=>{
  const generic=record(id,[o.value],'general_terms'),alone=documentPipeline([[generic]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[record(id)],[generic]],side).insuranceData,first=data.insurances[0];assert.equal(data.supportingEvidence.length,1);
  const silent=documentPipeline([[record(id)]],side).insuranceData.insurances[0];
  for(const i of stages(first)){assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(states(i),states(silent));assert.deepEqual(i.addOnIds,silent.addOnIds);assert.deepEqual(clean(i.recordEvidence),clean(first.recordEvidence));}
 });
 for(const [name,value] of [['Forsikringsform','Fullverdi'],['Forsikringsform','Førsterisiko'],['Fullverdi','Ja'],['Underforsikring','Nei'],['Bygningens areal','140 m²'],['Tilbygg meldt','Ja'],['Tilbygg meldt','Nei']])test('UNDERINSURANCE actual form/area/notification is separate and cannot suppress condition '+id+'/'+name+'/'+value,()=>{
  const r={...raw(id),importantTerms:[{name,value,canonicalKey:null,documentIndices:[1]}]},first=documentPipeline([[r]]).insuranceData.insurances[0];
  const silent=documentPipeline([[record(id)]]).insuranceData.insurances[0];
  for(const i of stages(first)){
   assert.deepEqual(pick(i).map(t=>t.value),[o.value]);assert.ok(i.importantTerms.some(t=>t.name===name&&t.value===value&&t.coverageOrigin==='document'));assert.deepEqual(states(i),states(silent));assert.deepEqual(i.addOnIds,silent.addOnIds);assert.equal(i.deductible,silent.deductible);assert.equal(i.annualPremium,silent.annualPremium);
   if(name==='Forsikringsform')assert.ok(i.importantTerms.some(t=>t.key==='hus.forsikringsform'&&t.value===value&&t.coverageOrigin==='document'));
  }
 });
 test('UNDERINSURANCE provider/type/ordinary/version admission stays exact '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);
  assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('UNDERINSURANCE all 214 manual inputs and 144 actual document controls preserve every old field',()=>{
 for(const c of baseline.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutUnderinsurance(first),c.first,c.id);const next=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(withoutUnderinsurance(next),c.repeated,c.id);}
 for(const c of baseline.documents)assert.deepEqual(withoutUnderinsurance(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
 assert.equal(baseline.controls.length,214);assert.equal(baseline.documents.length,144);assert.equal(baseline.configurations.length,12);
});
test('UNDERINSURANCE same product and side-swap retain source asymmetry and peer unknown',()=>{
 for(const id of ids)assert.equal(compareCatalogProducts(p(id),p(id)).differenceCount,0);
 for(const a of ids)for(const b of [...ids,'if-hus-basis','tryg-hus','fremtind-hus-standard']){
  const forward=compareCatalogProducts(p(a),p(b)).sections.flatMap(s=>s.rows).find(r=>r.key===o.key),reverse=compareCatalogProducts(p(b),p(a)).sections.flatMap(s=>s.rows).find(r=>r.key===o.key);
  assert.ok(forward);assert.deepEqual(forward.first,reverse.second);assert.deepEqual(forward.second,reverse.first);assert.equal(forward.first.text,o.value);assert.equal(forward.conceptId,'hus.ovrig');
  if(!ids.includes(b)){assert.equal(forward.second.state,'unknown');assert.deepEqual(forward.second.sources,[]);}
 }
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){
  const before=baseline.catalog.products.find(p=>p.productId===product.productId);
  assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(before,[],date,null,baseline.catalog));
  for(const addon of availableAddOns(product,date)){const selected=resolveAddOnPackage(product,addon.id,date);assert.equal(resolveCatalogFacts(product,selected,date).some(f=>f.key===o.key),false);assert.deepEqual(resolveCatalogFacts(product,selected,date),resolveCatalogFacts(before,selected,date,null,baseline.catalog));}
 }
});
test('UNDERINSURANCE price basis and first-main-anniversary deadline never become area ratio or form override',()=>{
 assert.match(o.value,/innen førstkommende hovedforfall/u);assert.match(o.value,/avtalt pris før forandringen og riktig pris etter forandringen/u);assert.match(o.value,/avtalt pris med oppgitt areal og riktig pris med faktisk areal/u);assert.match(o.value,/innen neste hovedforfall; ellers kan erstatningen reduseres/u);
 for(const id of ids)for(const key of ['hus.forsikringsform','hus.gjenoppforing.hovedregel','hus.gjenoppforing.annetsted','hus.gjenoppforing.totalskade','hus.gjenoppforing.svanemerket','hus.bygninger.dekning','hus.pabud.dekning','hus.fraflyttet.begrensning','hus.sikkerhet.begrensning'])assert.deepEqual(withOriginalBuildingsSourcePage(resolveCatalogFacts(p(id),[],date).find(f=>f.key===key)),resolveCatalogFacts(baseline.catalog.products.find(p=>p.productId===id),[],date,null,baseline.catalog).find(f=>f.key===key));
});
