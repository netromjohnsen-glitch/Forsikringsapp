import {withoutTerror} from './helpers/house-terror.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deserialize} from 'node:v8';
import {execFileSync} from 'node:child_process';
import {productCatalog as currentCatalog,resolveCatalogFacts as currentFacts,resolveCatalogEvidence as currentEvidence,availableAddOns as currentAddOns,findCatalogProduct as currentFind} from '../lib/product-catalog.ts';
import {normalizeManualAgreement as currentManual} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog as currentEnrich} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct as currentMaterialize,compareCatalogProducts as currentCompare} from '../lib/catalog-product-comparison.ts';
import {groupTerms,groupInsurances} from '../lib/comparison.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeCatalogTermKey,normalizeTermName} from '../lib/insurance-normalization.ts';
import {conceptForFactKey} from '../lib/presentation-catalog.ts';
import {isNonAssertingCoverageDetail} from '../lib/coverage-fact-semantics.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline as currentPipeline} from './helpers/supporting-terms.mjs';
import {ownerChangeOracle as o,ownerChangeFact,applyOwnerChange as currentApplyOwnerChange,withoutOwnerChange} from './helpers/house-owner-change.mjs';


// Preserve point12's exact historical contract; the new suite validates both point18 additions.
const productCatalog=withoutTerror(currentCatalog);
const resolveCatalogFacts=(p,a,date,channel=null,c=productCatalog)=>currentFacts(p,a,date,channel,c);
const resolveCatalogEvidence=(p,a,date,channel=null,c=productCatalog)=>currentEvidence(p,a,date,channel,c);
const availableAddOns=(p,date,channel=null,c=productCatalog)=>currentAddOns(p,date,channel,c);
const findCatalogProduct=(provider,id,version,context,c=productCatalog)=>currentFind(provider,id,version,context,c);
const normalizeManualAgreement=(input,c=productCatalog)=>currentManual(input,c);
const enrichExtractedAgreementWithCatalog=(input,date,measure,trace,c=productCatalog)=>currentEnrich(input,date,measure,trace,c);
const materializeCatalogProduct=(p,c=productCatalog)=>currentMaterialize(p,c);
const compareCatalogProducts=(a,b,c=productCatalog)=>currentCompare(a,b,c);
const documentPipeline=(...args)=>withoutTerror(currentPipeline(...args));
const applyOwnerChange=c=>withoutTerror(currentApplyOwnerChange(c));

const dir=new URL('../docs/audit/checkpoints/house-owner-change-979f01c/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-24T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id),pick=i=>i.importantTerms.filter(t=>o.keys.includes(t.key));
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const out=[i];for(let j=0;j<3;j++)out.push(repeat(clean(out.at(-1))));return out;};
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,def,values=[],role='individual_agreement',name=def.label)=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name,value,canonicalKey:null,documentIndices:[1]}))});

test('OWNER-CHANGE-P12 exact original P2 signature and both source bindings retained',()=>{
 assert.equal(o.signature,'d1230f13e6b445d7');assert.deepEqual(o.original_bindings.map(b=>[b.finding_id,b.source_fact_id]),[['GAP-2110','SF-3024'],['GAP-2169','SF-3111']]);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8').split('\n').find(l=>l.startsWith(o.signature+','));assert.ok(registry.includes('DEFER_POST_PILOT'));
});
test('OWNER-CHANGE-P12 complete catalog equals independent before plus only two exact point12 facts',()=>{
 assert.deepEqual(productCatalog,applyOwnerChange(before.catalog));assert.deepEqual(withoutOwnerChange(productCatalog),before.catalog);
 for(const owner of owners)for(const key of o.keys){const rows=productCatalog.facts[owner].filter(f=>f.key===key);assert.deepEqual(rows,[ownerChangeFact(owner,key)]);assert.equal(JSON.stringify(rows),JSON.stringify([ownerChangeFact(owner,key)]));}
});
for(const [n,id]of ids.entries()){
 test('OWNER-CHANGE-P12 complete original point12 with all linked conditions '+id,()=>{
  const b=o.original_bindings[n],page=o.source_pages[n],file=new URL('../'+b.source_artifact,import.meta.url),number=n?13:12;assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_sha256);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_sha256);
  const text=execFileSync('pdftotext',['-raw','-f',String(number),'-l',String(number),file.pathname,'-']).toString();assert.equal(text,page.raw_text);const flat=text.replace(/\s+/gu,' '),block=flat.split('12. Opphør ved eierskifte')[1].split('13. Automatisk opphør')[0].trim();assert.equal(block,o.rows[0].value);
  for(const phrase of ['I stedet for forsikringsavtalelovens § 7-2 gjelder:','Skifter den ting forsikringen er knyttet til eier, faller forsikringen bort.','Gjensidige svarer likevel for forsikringstilfeller som inntrer innen fjorten dager etter eierskiftet.','Forsikringen bortfaller uansett når den nye eier har tegnet forsikring.'])assert.ok(block.includes(phrase),phrase);
  const layout=execFileSync('pdftotext',['-layout','-f',String(number),'-l',String(number),file.pathname,'-']).toString();assert.equal(layout,page.layout_text);
  for(const field of ['structuredValue','coverageAvailability','deductibleClassification','qualificationSource'])assert.equal(Object.hasOwn(ownerChangeFact(owners[n],o.keys[0]),field),false);
  assert.equal(o.subscope,'Generelle vilkår punkt12 Opphør ved eierskifte only');assert.equal(o.whole_signature_closure,false);
 });
 for(const c of before.configurations.filter(c=>c.id===id))test('OWNER-CHANGE-P12 all choices full old-field equality and three JSON enrichments '+id+'/'+c.selected.join('+'),()=>{
  const facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);assert.deepEqual(withoutOwnerChange(facts),c.facts);assert.deepEqual(withoutOwnerChange(evidence),c.evidence);assert.deepEqual(facts.filter(f=>o.keys.includes(f.key)),o.keys.map(k=>ownerChangeFact(owners[n],k)));assert.equal(evidence.filter(f=>o.keys.includes(f.key)).length,n?2:1);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutOwnerChange(first),c.first);const expected=pick(first);assert.equal(expected.length,1);
  const factSource=key=>ownerChangeFact(owners[n],key).source;for(const term of expected){assert.equal(term.value,o.rows.find(r=>r.key===term.key).value);assert.equal(term.coverageOrigin,'catalog');assert.deepEqual(term.source,ownerChangeFact(owners[n],term.key).source);assert.deepEqual(clean(term.sources),clean([{...factSource(term.key),note:n?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined}]));assert.equal(term.overriddenBase.length,n);if(n)assert.deepEqual(term.overriddenBase,[{value:term.value,source:ownerChangeFact(owners[0],term.key).source}]);}
  const results=stages(first);for(const i of results){assert.deepEqual(clean(pick(i)),clean(expected));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);}
  const last=results.at(-1);assert.deepEqual(withoutOwnerChange(last),c.repeat3);const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display.filter(f=>!o.keys.includes(f.key)),c.display);for(const row of display.filter(f=>o.keys.includes(f.key))){assert.equal(row.first,row.second);assert.ok(!row.first.startsWith('✓'));assert.equal(row.firstSources[0].page,n?13:12);assert.equal(row.secondSources[0].documentId,owners[n]);}
 });
 for(const side of ['existing','offer'])for(const def of o.rows)for(const values of [[],['Kundens konkrete eierskifteregel'],['Ukjent'],['Ikke valgt'],['Kundens regel A','Kundens regel B']])test('OWNER-CHANGE-P12 independent document priority '+id+'/'+side+'/'+def.key+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,def,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[def.value];
  for(const i of stages(first)){const rows=pick(i).filter(t=>t.key===def.key);assert.deepEqual(rows.map(t=>t.value),expected);assert.ok(rows.every(t=>t.coverageOrigin===(expected[0]===def.value?'catalog':'document')));assert.deepEqual(clean(rows),clean(pick(first).filter(t=>t.key===def.key)));for(const other of o.rows.filter(r=>r.key!==def.key))assert.deepEqual(pick(i).filter(t=>t.key===other.key).map(t=>t.value),[other.value]);if(expected[0]!==def.value)assert.ok(rows.every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));}
 });
 for(const side of ['existing','offer'])test('OWNER-CHANGE-P12 general terms evidence only '+id+'/'+side,()=>{
  const general={...raw(id),documentRole:'general_terms',importantTerms:o.rows.map(def=>({name:def.label,value:def.value,canonicalKey:null,documentIndices:[1]}))};const alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[{...raw(id),importantTerms:[]}],[general]],side).insuranceData,control=documentPipeline([[{...raw(id),importantTerms:[]}]],side).insuranceData.insurances[0];assert.equal(data.supportingEvidence.length,1);for(const i of stages(data.insurances[0])){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.deepEqual(i.addOnIds,control.addOnIds);}
 });
 for(const name of ['Eierskifte','Ny eier','Opphør','Oppsigelse','Avtalevilkår','Ettervern','14 dager'])test('OWNER-CHANGE-P12 generic label cannot override precise point12 '+id+'/'+name,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Syntetisk annen regel'],undefined,name)]]).insuranceData.insurances[0];assert.deepEqual(pick(first).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Syntetisk annen regel'&&t.coverageOrigin==='document'));
 });
 for(const [label,key]of [['Forsikrede bygninger','hus.bygninger.dekning'],['Fast inventar og installasjoner','hus.bygninger.tilbehor']])test('OWNER-CHANGE-P12 positive customer field leaves independent point12 '+id+'/'+key,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Kundens objektregel'],undefined,label)]]).insuranceData.insurances[0];for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.deepEqual(i.importantTerms.filter(t=>t.key===key).map(t=>t.value),['Kundens objektregel']);}
 });
 test('OWNER-CHANGE-P12 exact ordinary product identity boundaries '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('OWNER-CHANGE-P12 all214 manual and144 actual document outputs preserve every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutOwnerChange(first),c.first,c.id);assert.deepEqual(withoutOwnerChange(repeat(first)),c.repeated,c.id);}for(const c of before.documents)assert.deepEqual(withoutOwnerChange(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('OWNER-CHANGE-P12 materialization and52 comparisons preserve all prior rows and reverse sides',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>!o.keys.includes(f.key))},c.output);for(const key of o.keys){const row=now.facts.find(f=>f.key===key);assert.equal(row.role,'term');assert.equal(row.value,o.rows.find(r=>r.key===key).value);}}
 assert.equal(before.comparisons.length,52);for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a),rows=now.sections.flatMap(s=>s.rows),old=c.output.sections.flatMap(s=>s.rows);assert.deepEqual(rows.filter(f=>!o.keys.includes(f.key)),old.filter(f=>!o.keys.includes(f.key)));for(const key of o.keys){const f=rows.find(r=>r.key===key),rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(f.first,rev.second);assert.deepEqual(f.second,rev.first);assert.equal(f.conceptId,'hus.ovrig');}
  const oldDiff=old.filter(r=>o.keys.includes(r.key)&&r.different).length,newDiff=rows.filter(r=>o.keys.includes(r.key)&&r.different).length;assert.equal(now.differenceCount,c.output.differenceCount-oldDiff+newDiff);if(c.a===c.b)assert.equal(now.differenceCount,0);
 }
});
test('OWNER-CHANGE-P12 other products/addons and peer keys keep full original facts',()=>{
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));for(const a of availableAddOns(product,date)){const selected=[a.id];try{const expected=resolveCatalogFacts(old,selected,date,null,before.catalog);assert.deepEqual(resolveCatalogFacts(product,selected,date),expected);}catch(error){assert.throws(()=>resolveCatalogFacts(product,selected,date),{message:error.message});}}}
 const tryg=Object.entries(productCatalog.facts).flatMap(([owner,rows])=>rows.filter(f=>f.key===o.keys[0]&&!owners.includes(owner)).map(f=>({owner,fact:f})));assert.equal(tryg.length,0);for(const {owner,fact}of tryg)assert.deepEqual(fact,before.catalog.facts[owner].find(f=>f.key===o.keys[0]));
});
test('OWNER-CHANGE-P12 terms alone never infer coverage or change canonical aliases/enum',()=>{
 for(const def of o.rows){assert.deepEqual(deriveCanonicalCoverages({type:'Hus',importantTerms:[{key:def.key,name:def.label,value:def.value}],coverages:[],addOns:[]},'Hus'),[]);assert.equal(normalizeCatalogTermKey(def.key),def.key);assert.equal(canonicalDocumentFactKeys.includes(def.key),false);assert.notEqual(normalizeTermName(def.label,{insuranceType:'Hus'}),def.key);}
 for(const key of o.keys){assert.equal(isNonAssertingCoverageDetail(key),false);assert.equal(key.endsWith('.dekning'),false);assert.equal(conceptForFactKey('bolig',key).id,'hus.ovrig');}
 assert.equal(o.rows.length,1);assert.ok(o.rows[0].value.includes('Forsikringen bortfaller uansett når den nye eier har tegnet forsikring.'));
});
test('OWNER-CHANGE-P12 guarded compatibility rejects unrelated edits and preserves customer/other providers',()=>{
 for(const key of o.keys)for(const change of [f=>f.source.page=99,f=>f.source.section='Other',f=>f.value='Other',f=>f.structuredValue={kind:'money',amount:300}]){const row=ownerChangeFact(owners[0],key);change(row);assert.throws(()=>withoutOwnerChange([row]));const cat=applyOwnerChange(before.catalog);change(cat.facts[owners[0]].find(f=>f.key===key));assert.throws(()=>applyOwnerChange(cat));}
 const peer=Object.values(before.catalog.facts).flat().filter(f=>o.keys.includes(f.key));assert.equal(peer.length,0);assert.deepEqual(withoutOwnerChange(peer),peer);const customer={key:o.keys[0],name:o.rows[0].label,value:'Kundens regel',source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:3}};assert.deepEqual(withoutOwnerChange([customer]),[customer]);
});

test('OWNER-CHANGE-P12 atomic rule rejects missing cut-off or altered14day liability',()=>{
 for(const transform of [value=>value.replace('Forsikringen bortfaller uansett når den nye eier har tegnet forsikring.',''),value=>value.replace('innen fjorten dager','innen tretti dager'),value=>value.replace('I stedet for forsikringsavtalelovens § 7-2 gjelder: ',''),value=>value.replace('Skifter den ting forsikringen er knyttet til eier, faller forsikringen bort. ','')]){const row=ownerChangeFact(owners[0],o.keys[0]);row.value=transform(row.value);assert.throws(()=>withoutOwnerChange([row]));}
});
