import {withoutSmartDetails} from './helpers/house-smart-details.mjs';
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
import {warOracle as o,warFact,warSources,applyWar as currentApplyWar,withoutWar} from './helpers/house-war.mjs';


// The independent service-detail suite checks the six approved additions;keep point17's exact contract.
const productCatalog=withoutSmartDetails(currentCatalog);
const resolveCatalogFacts=(p,a,date,channel=null,c=productCatalog)=>currentFacts(p,a,date,channel,c);
const resolveCatalogEvidence=(p,a,date,channel=null,c=productCatalog)=>currentEvidence(p,a,date,channel,c);
const availableAddOns=(p,date,channel=null,c=productCatalog)=>currentAddOns(p,date,channel,c);
const findCatalogProduct=(provider,id,version,context,c=productCatalog)=>currentFind(provider,id,version,context,c);
const normalizeManualAgreement=(input,c=productCatalog)=>currentManual(input,c);
const enrichExtractedAgreementWithCatalog=(input,date,measure,trace,c=productCatalog)=>currentEnrich(input,date,measure,trace,c);
const materializeCatalogProduct=(p,c=productCatalog)=>currentMaterialize(p,c);
const compareCatalogProducts=(a,b,c=productCatalog)=>currentCompare(a,b,c);
const documentPipeline=(...args)=>withoutSmartDetails(currentPipeline(...args));
const applyWar=c=>withoutSmartDetails(currentApplyWar(c));

const dir=new URL('../docs/audit/checkpoints/house-war-5d38b87/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-24T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id),pick=i=>i.importantTerms.filter(t=>o.keys.includes(t.key));
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const out=[i];for(let j=0;j<3;j++)out.push(repeat(clean(out.at(-1))));return out;};
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,def,values=[],role='individual_agreement',name=def.label)=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name,value,canonicalKey:null,documentIndices:[1]}))});

test('WAR-P17 exact original P2 signature and both source bindings retained',()=>{
 assert.equal(o.signature,'d1230f13e6b445d7');assert.deepEqual(o.original_bindings.map(b=>[b.finding_id,b.source_fact_id]),[['GAP-2110','SF-3024'],['GAP-2169','SF-3111']]);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8').split('\n').find(l=>l.startsWith(o.signature+','));assert.ok(registry.includes('DEFER_POST_PILOT'));
});
test('WAR-P17 complete catalog equals independent before plus only two exact point17 facts',()=>{
 assert.deepEqual(productCatalog,applyWar(before.catalog));assert.deepEqual(withoutWar(productCatalog),before.catalog);
 for(const owner of owners)for(const key of o.keys){const rows=productCatalog.facts[owner].filter(f=>f.key===key);assert.deepEqual(rows,[warFact(owner,key)]);assert.equal(JSON.stringify(rows),JSON.stringify([warFact(owner,key)]));}
});
for(const [n,id]of ids.entries()){
 test('WAR-P17 complete original point17 with all linked conditions '+id,()=>{
  const b=o.original_bindings[n],page=o.source_pages[n*2],continuation=o.source_pages[n*2+1],file=new URL('../'+b.source_artifact,import.meta.url),number=n?13:12;assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_sha256);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_sha256);
  const texts=[];for(const [p,num]of [[page,number],[continuation,number+1]]){const text=execFileSync('pdftotext',['-raw','-f',String(num),'-l',String(num),file.pathname,'-']).toString();assert.equal(text,p.raw_text);const layout=execFileSync('pdftotext',['-layout','-f',String(num),'-l',String(num),file.pathname,'-']).toString();assert.equal(layout,p.layout_text);texts.push(text.replaceAll('GENERELLE VILKÅR',''));}
  const flat=texts.map(t=>t.replace(/\s+/gu,' ').trim()).join(' '),block=flat.split('17. Krig og uroligheter')[1].split('18. Skade ved terrorhandlinger')[0].trim();assert.equal(block,o.rows[0].value);
  for(const phrase of ['Forsikringen dekker ikke skade på person, ting eller tap','Krig eller alvorlige uroligheter i Norge','dersom forsikrede reiser inn i, eller tar opphold i','hvis ikke annet er avtalt skriftlig','Deltakelse i krig','Lov om yrkesskadeforsikring','På person og reiseforsikringer','På motorvognforsikring','når forsikrede allerede befinner seg','når forsikret motorvogn allerede befinner seg'])assert.ok(block.includes(phrase),phrase);assert.equal((block.match(/inntil 6 uker/gu)||[]).length,2);
  for(const field of ['structuredValue','coverageAvailability','deductibleClassification'])assert.equal(Object.hasOwn(warFact(owners[n],o.keys[0]),field),false);assert.equal(warFact(owners[n],o.keys[0]).source.page,number);assert.equal(warFact(owners[n],o.keys[0]).qualificationSource.page,number+1);
  assert.equal(o.subscope,'Generelle vilkår punkt17 Krig og uroligheter only');assert.equal(o.whole_signature_closure,false);
 });
 for(const c of before.configurations.filter(c=>c.id===id))test('WAR-P17 all choices full old-field equality and three JSON enrichments '+id+'/'+c.selected.join('+'),()=>{
  const facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);assert.deepEqual(withoutWar(facts),c.facts);assert.deepEqual(withoutWar(evidence),c.evidence);assert.deepEqual(facts.filter(f=>o.keys.includes(f.key)),o.keys.map(k=>warFact(owners[n],k)));assert.equal(evidence.filter(f=>o.keys.includes(f.key)).length,n?2:1);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutWar(first),c.first);const expected=pick(first);assert.equal(expected.length,1);
  for(const term of expected){assert.equal(term.value,o.rows.find(r=>r.key===term.key).value);assert.equal(term.coverageOrigin,'catalog');assert.deepEqual(term.source,warFact(owners[n],term.key).source);assert.deepEqual(clean(term.sources),clean(warSources(warFact(owners[n],term.key),true)));assert.equal(term.overriddenBase.length,n);if(n)assert.deepEqual(term.overriddenBase,[{value:term.value,source:warFact(owners[0],term.key).source}]);}
  const results=stages(first);for(const i of results){assert.deepEqual(clean(pick(i)),clean(expected));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);}
  const last=results.at(-1);assert.deepEqual(withoutWar(last),c.repeat3);const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display.filter(f=>!o.keys.includes(f.key)),c.display);for(const row of display.filter(f=>o.keys.includes(f.key))){assert.equal(row.first,row.second);assert.ok(!row.first.startsWith('✓'));assert.equal(row.firstSources[0].page,n?13:12);assert.equal(row.firstSources[1].page,n?14:13);assert.equal(row.secondSources[0].documentId,owners[n]);}
 });
 for(const side of ['existing','offer'])for(const def of o.rows)for(const values of [[],['Kundens konkrete krigsregel'],['Ukjent'],['Ikke valgt'],['Kundens regel A','Kundens regel B']])test('WAR-P17 independent document priority '+id+'/'+side+'/'+def.key+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,def,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[def.value];
  for(const i of stages(first)){const rows=pick(i).filter(t=>t.key===def.key);assert.deepEqual(rows.map(t=>t.value),expected);assert.ok(rows.every(t=>t.coverageOrigin===(expected[0]===def.value?'catalog':'document')));assert.deepEqual(clean(rows),clean(pick(first).filter(t=>t.key===def.key)));for(const other of o.rows.filter(r=>r.key!==def.key))assert.deepEqual(pick(i).filter(t=>t.key===other.key).map(t=>t.value),[other.value]);if(expected[0]!==def.value)assert.ok(rows.every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));}
 });
 for(const side of ['existing','offer'])test('WAR-P17 general terms evidence only '+id+'/'+side,()=>{
  const general={...raw(id),documentRole:'general_terms',importantTerms:o.rows.map(def=>({name:def.label,value:def.value,canonicalKey:null,documentIndices:[1]}))};const alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[{...raw(id),importantTerms:[]}],[general]],side).insuranceData,control=documentPipeline([[{...raw(id),importantTerms:[]}]],side).insuranceData.insurances[0];assert.equal(data.supportingEvidence.length,1);for(const i of stages(data.insurances[0])){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.deepEqual(i.addOnIds,control.addOnIds);}
 });
 for(const name of ['Krig','Uroligheter','Reiseadvarsel','6 uker','Generelle vilkår','Krigsdekning','Personskade','Utlandet','Deltakelse i krig'])test('WAR-P17 generic label cannot override precise point17 '+id+'/'+name,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Syntetisk annen regel'],undefined,name)]]).insuranceData.insurances[0];assert.deepEqual(pick(first).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Syntetisk annen regel'&&t.coverageOrigin==='document'));
 });
 for(const [label,key]of [['Forsikrede bygninger','hus.bygninger.dekning'],['Fast inventar og installasjoner','hus.bygninger.tilbehor']])test('WAR-P17 positive customer field leaves independent point17 '+id+'/'+key,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Kundens objektregel'],undefined,label)]]).insuranceData.insurances[0];for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.deepEqual(i.importantTerms.filter(t=>t.key===key).map(t=>t.value),['Kundens objektregel']);}
 });
 test('WAR-P17 exact ordinary product identity boundaries '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('WAR-P17 all214 manual and144 actual document outputs preserve every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutWar(first),c.first,c.id);assert.deepEqual(withoutWar(repeat(first)),c.repeated,c.id);}for(const c of before.documents)assert.deepEqual(withoutWar(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('WAR-P17 materialization and52 comparisons preserve all prior rows and reverse sides',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>!o.keys.includes(f.key))},c.output);for(const key of o.keys){const row=now.facts.find(f=>f.key===key);assert.equal(row.role,'term');assert.equal(row.value,o.rows.find(r=>r.key===key).value);}}
 assert.equal(before.comparisons.length,52);for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a),rows=now.sections.flatMap(s=>s.rows),old=c.output.sections.flatMap(s=>s.rows);assert.deepEqual(rows.filter(f=>!o.keys.includes(f.key)),old.filter(f=>!o.keys.includes(f.key)));for(const key of o.keys){const f=rows.find(r=>r.key===key),rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(f.first,rev.second);assert.deepEqual(f.second,rev.first);assert.equal(f.conceptId,'hus.ovrig');}
  const oldDiff=old.filter(r=>o.keys.includes(r.key)&&r.different).length,newDiff=rows.filter(r=>o.keys.includes(r.key)&&r.different).length;assert.equal(now.differenceCount,c.output.differenceCount-oldDiff+newDiff);if(c.a===c.b)assert.equal(now.differenceCount,0);
 }
});
test('WAR-P17 other products/addons and peer keys keep full original facts',()=>{
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));for(const a of availableAddOns(product,date)){const selected=[a.id];try{const expected=resolveCatalogFacts(old,selected,date,null,before.catalog);assert.deepEqual(resolveCatalogFacts(product,selected,date),expected);}catch(error){assert.throws(()=>resolveCatalogFacts(product,selected,date),{message:error.message});}}}
 const tryg=Object.entries(productCatalog.facts).flatMap(([owner,rows])=>rows.filter(f=>f.key===o.keys[0]&&!owners.includes(owner)).map(f=>({owner,fact:f})));assert.equal(tryg.length,0);for(const {owner,fact}of tryg)assert.deepEqual(fact,before.catalog.facts[owner].find(f=>f.key===o.keys[0]));
});
test('WAR-P17 terms alone never infer coverage or change canonical aliases/enum',()=>{
 for(const def of o.rows){assert.deepEqual(deriveCanonicalCoverages({type:'Hus',importantTerms:[{key:def.key,name:def.label,value:def.value}],coverages:[],addOns:[]},'Hus'),[]);assert.equal(normalizeCatalogTermKey(def.key),def.key);assert.equal(canonicalDocumentFactKeys.includes(def.key),false);assert.notEqual(normalizeTermName(def.label,{insuranceType:'Hus'}),def.key);}
 for(const key of o.keys){assert.equal(isNonAssertingCoverageDetail(key),true);assert.equal(key.endsWith('.dekning'),false);assert.equal(conceptForFactKey('bolig',key).id,'hus.ovrig');}
 assert.equal(o.rows.length,1);assert.ok(o.rows[0].value.includes('Krig eller alvorlige uroligheter i Norge'));assert.ok(o.rows[0].value.includes('På motorvognforsikringen'));
});
test('WAR-P17 guarded compatibility rejects unrelated edits and preserves customer/other providers',()=>{
 for(const key of o.keys)for(const change of [f=>f.source.page=99,f=>f.source.section='Other',f=>f.value='Other',f=>f.structuredValue={kind:'money',amount:300}]){const row=warFact(owners[0],key);change(row);assert.throws(()=>withoutWar([row]));const cat=applyWar(before.catalog);change(cat.facts[owners[0]].find(f=>f.key===key));assert.throws(()=>applyWar(cat));}
 const peer=Object.values(before.catalog.facts).flat().filter(f=>o.keys.includes(f.key));assert.equal(peer.length,0);assert.deepEqual(withoutWar(peer),peer);const customer={key:o.keys[0],name:o.rows[0].label,value:'Kundens regel',source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:3}};assert.deepEqual(withoutWar([customer]),[customer]);
});

test('WAR-P17 complete source guards reject lost geography,agreement,worker or6week conditions',()=>{
 const changes=[['Krig eller alvorlige uroligheter i Norge','Krig i utlandet'],['hvis ikke annet er avtalt skriftlig',''],['Deltakelse i krig',''],['Begrensningene over gjelder ikke for personskade som går inn under Lov om yrkesskadeforsikring.',''],['På person og reiseforsikringer','På husforsikring'],['inntil 6 uker','inntil 12 uker'],['når forsikret motorvogn allerede befinner seg','når en forsikring finnes']];for(const [from,to]of changes){const row=warFact(owners[0],o.keys[0]);assert.ok(row.value.includes(from));row.value=row.value.replace(from,to);assert.throws(()=>withoutWar([row]));}
});
test('WAR-P17 missing or altered continuation source cannot pass compatibility projection',()=>{
 for(const change of [f=>delete f.qualificationSource,f=>f.qualificationSource.page=99,f=>f.qualificationSource.note='Other']){const row=warFact(owners[0],o.keys[0]);change(row);assert.throws(()=>withoutWar([row]));}
 const fact=warFact(owners[0],o.keys[0]);const term={key:fact.key,name:fact.label,value:fact.value,source:fact.source,sources:warSources(fact,true).slice(0,1)};assert.throws(()=>withoutWar([term]));
});
for(const [n,id]of ids.entries())for(const side of ['existing','offer'])for(const mode of ['point17','point18','both','unknown'])test('WAR-P17 independent point18/19document priority '+id+'/'+side+'/'+mode,()=>{
 const terror=before.catalog.facts[owners[n]].find(f=>f.key==='hus.terror.begrensning');assert.ok(terror);const custom19=['point17','both'].includes(mode),custom18=['point18','both'].includes(mode);
 const rec={...raw(id),importantTerms:[{name:o.rows[0].label,value:custom19?'Kundens spredningsregel':'Ukjent',canonicalKey:null,documentIndices:[1]},{name:terror.label,value:custom18?'Kundens terrorregel':'Ukjent',canonicalKey:null,documentIndices:[1]}]};const first=documentPipeline([[rec]],side).insuranceData.insurances[0];
 for(const i of stages(first)){
  const spread=pick(i);assert.equal(spread.length,1);assert.equal(spread[0].value,custom19?'Kundens spredningsregel':o.rows[0].value);assert.equal(spread[0].coverageOrigin,custom19?'document':'catalog');
  const prior=i.importantTerms.filter(f=>f.key===terror.key);assert.equal(prior.length,1);assert.equal(prior[0].value,custom18?'Kundens terrorregel':terror.value);assert.equal(prior[0].coverageOrigin,custom18?'document':'catalog');assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(first,'Hus')));assert.deepEqual(i.addOnIds,first.addOnIds);
 }
});
