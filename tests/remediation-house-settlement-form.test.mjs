import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize} from 'node:v8';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,resolveCatalogEvidence,availableAddOns,findCatalogProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {groupTerms,groupInsurances} from '../lib/comparison.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeTermName,normalizeCatalogTermKey} from '../lib/insurance-normalization.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {settlementOracle as o,settlementFact,applySettlement,withoutSettlement} from './helpers/house-settlement-form.mjs';

const dir=new URL('../docs/audit/checkpoints/house-settlement-form-6d42440/',import.meta.url);
const bytes=readFileSync(new URL('baseline.v8.gz',dir)),meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir)));
assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-24T12:00:00Z');
const p=id=>productCatalog.products.find(p=>p.productId===id),clean=x=>JSON.parse(JSON.stringify(x));
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const out=[i];for(let j=0;j<3;j++)out.push(repeat(clean(out.at(-1))));return out;};
const pick=i=>i.importantTerms.filter(t=>t.key===o.key);
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,values=[],role='individual_agreement',name=o.label)=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name,value,canonicalKey:null,documentIndices:[1]}))});

test('SETTLEMENT original exact P2 signature and both immutable source bindings',()=>{
 assert.equal(o.signature,'8db65d4d3da9e98b');assert.deepEqual(o.original_bindings.map(b=>[b.finding_id,b.source_fact_id]),[['GAP-2113','SF-3031'],['GAP-2172','SF-3118']]);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8').split('\n').find(l=>l.startsWith(o.signature+','));assert.ok(registry.includes('DEFER_POST_PILOT'));
});
test('SETTLEMENT complete current raw catalog is immutable before plus exactly both independent facts',()=>{
 assert.deepEqual(productCatalog,applySettlement(before.catalog));assert.deepEqual(withoutSettlement(productCatalog),before.catalog);
 for(const owner of owners){const row=productCatalog.facts[owner].filter(f=>f.key===o.key);assert.deepEqual(row,[settlementFact(owner)]);assert.equal(JSON.stringify(row),JSON.stringify([settlementFact(owner)]));}
});
for(const [n,id]of ids.entries()){
 test('SETTLEMENT original source block and exact own full-terms reference '+id,()=>{
  const b=o.original_bindings[n],page=o.source_pages[n],file=new URL('../'+b.source_artifact,import.meta.url);
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_sha256);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_sha256);
  const text=execFileSync('pdftotext',['-raw','-f',String(b.PDF_page_1_based),'-l',String(b.PDF_page_1_based),file.pathname,'-']).toString();assert.equal(text,page.raw_text);
  const block=text.replace(/\s+/gu,' ').split('Hvordan erstatningen blir beregnet')[1].split('Skadet beplantning i hageanlegg')[0].trim();assert.equal(block,page.bounded_block);
  for(const phrase of ['Gjensidige bestemmer hvilke av alternativene ovenfor som velges','velger Gjensidige leverandør','fakturaer utstedes til sikrede','sikrede har fradrag for merverdiavgift','kontantoppgjør skal ikke erstatningen overstige det Gjensidige ville betalt','ikke kan dokumenteres med faktura at håndverker/arbeidskraft er betalt','75% av timesats eks. mva. etter kalkyle utført av Gjensidiges takstmann/leverandør','Timesats for øvrige arbeider er kr 300.'])assert.ok(block.includes(phrase),phrase);
  for(const field of ['structuredValue','deductibleClassification','coverageAvailability','qualificationSource'])assert.equal(Object.hasOwn(settlementFact(owners[n]),field),false);
 });
 for(const c of before.configurations.filter(c=>c.id===id))test('SETTLEMENT full runtime all choices and three JSON enrichments '+id+'/'+c.selected.join('+'),()=>{
  const facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);assert.deepEqual(withoutSettlement(facts),c.facts);assert.deepEqual(withoutSettlement(evidence),c.evidence);assert.deepEqual(facts.filter(f=>f.key===o.key),[settlementFact(owners[n])]);assert.equal(evidence.filter(f=>f.key===o.key).length,n?2:1);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSettlement(first),c.first);
  const expected=pick(first);assert.equal(expected.length,1);assert.equal(expected[0].coverageOrigin,'catalog');assert.equal(expected[0].value,o.value);assert.deepEqual(expected[0].source,settlementFact(owners[n]).source);assert.equal(expected[0].sources.length,1);assert.equal(expected[0].overriddenBase.length,n);
  if(n)assert.deepEqual(expected[0].overriddenBase,[{value:o.value,source:settlementFact(owners[0]).source}]);
  const outputs=stages(first);for(const i of outputs){assert.deepEqual(clean(pick(i)),clean(expected));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);}
  const last=outputs.at(-1);assert.deepEqual(withoutSettlement(last),c.repeat3);const shown=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(shown.filter(f=>f.key!==o.key),c.display);const row=shown.find(f=>f.key===o.key);assert.ok(row);assert.equal(row.first,row.second);assert.ok(!row.first.startsWith('✓'));assert.equal(row.firstSources[0].page,n?17:16);assert.equal(row.secondSources[0].documentId,owners[n]);
 });
 for(const side of ['existing','offer'])for(const values of [[],['Kundens konkrete oppgjørsregel'],['Ukjent'],['Ikke valgt'],['Kundens regel A','Kundens regel B']])test('SETTLEMENT actual document priority and repeated provenance '+id+'/'+side+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[o.value];
  for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),expected);assert.ok(pick(i).every(t=>t.coverageOrigin===(expected[0]===o.value?'catalog':'document')));assert.deepEqual(clean(pick(i)),clean(pick(first)));if(expected[0]!==o.value)assert.ok(pick(i).every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));}
 });
 for(const side of ['existing','offer'])test('SETTLEMENT uploaded general terms support only; never customer choice '+id+'/'+side,()=>{
  const general=record(id,[o.value],'general_terms'),alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[record(id)],[general]],side).insuranceData;assert.equal(data.supportingEvidence.length,1);const control=documentPipeline([[record(id)]],side).insuranceData.insurances[0];
  for(const i of stages(data.insurances[0])){assert.deepEqual(pick(i).map(t=>t.value),[o.value]);assert.equal(pick(i)[0].coverageOrigin,'catalog');assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.deepEqual(i.addOnIds,control.addOnIds);}
 });
 for(const name of ['Oppgjør','Arbeidsbetaling','Timesats','Totalskade','Aldersfradrag'])test('SETTLEMENT generic heading remains unbound and cannot replace exact rule '+id+'/'+name,()=>{
  const first=documentPipeline([[record(id,['Syntetisk annen regel'],undefined,name)]]).insuranceData.insurances[0];assert.deepEqual(pick(first).map(t=>t.value),[o.value]);assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Syntetisk annen regel'&&t.coverageOrigin==='document'));
 });
 test('SETTLEMENT ordinary provider/type/scope/version identity '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);
  assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('SETTLEMENT all214 manual controls and144 actual document outputs keep every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);
 for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSettlement(first),c.first,c.id);assert.deepEqual(withoutSettlement(repeat(first)),c.repeated,c.id);}
 for(const c of before.documents)assert.deepEqual(withoutSettlement(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('SETTLEMENT materialization and all52 bidirectional comparison outputs retain every old row',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>f.key!==o.key)},c.output);const row=now.facts.find(f=>f.key===o.key);assert.ok(row);assert.equal(row.role,'term');assert.equal(row.value,o.value);}
 assert.equal(before.comparisons.length,52);
 for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a);const row=now.sections.flatMap(s=>s.rows).find(r=>r.key===o.key),rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===o.key);assert.deepEqual(row.first,rev.second);assert.deepEqual(row.second,rev.first);assert.equal(row.conceptId,'hus.gjenoppforing');
  assert.deepEqual(now.sections.flatMap(s=>s.rows).filter(r=>r.key!==o.key),c.output.sections.flatMap(s=>s.rows).filter(r=>r.key!==o.key));const old=c.output.sections.flatMap(s=>s.rows).find(r=>r.key===o.key);assert.equal(now.differenceCount,c.output.differenceCount-(old?.different?1:0)+(row.different?1:0));
  if(c.a===c.b)assert.equal(now.differenceCount,0);
 }
});
test('SETTLEMENT every other provider product and addon retains full prior facts including shared-key If/Tryg',()=>{
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));for(const addon of availableAddOns(product,date)){const selected=[addon.id];try{const expected=resolveCatalogFacts(old,selected,date,null,before.catalog);assert.deepEqual(resolveCatalogFacts(product,selected,date),expected);}catch(error){assert.throws(()=>resolveCatalogFacts(product,selected,date),{message:error.message});}}}
});
test('SETTLEMENT existing key/term role stays separate from coverage selection and extractor enum',()=>{
 assert.equal(normalizeCatalogTermKey(o.key),o.key);assert.equal(normalizeTermName(o.label,{insuranceType:'Hus'}),'oppgjørsmåte');assert.equal(canonicalDocumentFactKeys.includes(o.key),false);assert.deepEqual(deriveCanonicalCoverages({type:'Hus',importantTerms:[{key:o.key,name:o.label,value:o.value}],coverages:[],addOns:[]},'Hus'),[]);
 assert.match(o.value,/ikke kan dokumenteres med faktura at håndverker\/arbeidskraft er betalt/u);assert.match(o.value,/75 % av timesats ekskl\. mva\. etter kalkyle utført av Gjensidiges takstmann\/leverandør/u);assert.match(o.value,/Timesats for øvrige arbeider er 300 kroner\./u);assert.doesNotMatch(o.value,/75 % av (?:hele|skaden)|generell timesats|egenandel|aldersfradrag/u);
});
test('SETTLEMENT guarded baseline compatibility rejects altered source/value/extra fields and preserves peers/customer',()=>{
 for(const change of [f=>f.source.page=99,f=>f.source.section='Other',f=>f.value='Other',f=>f.structuredValue={kind:'money',amount:300}]){const row=settlementFact(owners[0]);change(row);assert.throws(()=>withoutSettlement([row]));const cat=applySettlement(before.catalog);change(cat.facts[owners[0]].find(f=>f.key===o.key));assert.throws(()=>applySettlement(cat));}
 const others=Object.entries(before.catalog.facts).flatMap(([,rows])=>rows.filter(f=>f.key===o.key));assert.ok(others.length);assert.deepEqual(withoutSettlement(others),others);const customer={key:o.key,name:o.label,value:'Kundens regel',source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:3}};assert.deepEqual(withoutSettlement([customer]),[customer]);
});
