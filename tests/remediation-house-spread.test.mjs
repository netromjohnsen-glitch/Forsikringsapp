import {withoutWar} from './helpers/house-war.mjs';
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
import {spreadOracle as o,spreadFact,applySpread as currentApplySpread,withoutSpread} from './helpers/house-spread.mjs';


// Preserve point19's exact contract;the new suite checks both point17 additions.
const productCatalog=withoutWar(currentCatalog);
const resolveCatalogFacts=(p,a,date,channel=null,c=productCatalog)=>currentFacts(p,a,date,channel,c);
const resolveCatalogEvidence=(p,a,date,channel=null,c=productCatalog)=>currentEvidence(p,a,date,channel,c);
const availableAddOns=(p,date,channel=null,c=productCatalog)=>currentAddOns(p,date,channel,c);
const findCatalogProduct=(provider,id,version,context,c=productCatalog)=>currentFind(provider,id,version,context,c);
const normalizeManualAgreement=(input,c=productCatalog)=>currentManual(input,c);
const enrichExtractedAgreementWithCatalog=(input,date,measure,trace,c=productCatalog)=>currentEnrich(input,date,measure,trace,c);
const materializeCatalogProduct=(p,c=productCatalog)=>currentMaterialize(p,c);
const compareCatalogProducts=(a,b,c=productCatalog)=>currentCompare(a,b,c);
const documentPipeline=(...args)=>withoutWar(currentPipeline(...args));
const applySpread=c=>withoutWar(currentApplySpread(c));

const dir=new URL('../docs/audit/checkpoints/house-spread-2028c16/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-24T12:00:00Z');
const clean=x=>JSON.parse(JSON.stringify(x)),p=id=>productCatalog.products.find(p=>p.productId===id),pick=i=>i.importantTerms.filter(t=>o.keys.includes(t.key));
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const out=[i];for(let j=0;j<3;j++)out.push(repeat(clean(out.at(-1))));return out;};
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,def,values=[],role='individual_agreement',name=def.label)=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name,value,canonicalKey:null,documentIndices:[1]}))});

test('SPREAD-P19 exact original P2 signature and both source bindings retained',()=>{
 assert.equal(o.signature,'d1230f13e6b445d7');assert.deepEqual(o.original_bindings.map(b=>[b.finding_id,b.source_fact_id]),[['GAP-2110','SF-3024'],['GAP-2169','SF-3111']]);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8').split('\n').find(l=>l.startsWith(o.signature+','));assert.ok(registry.includes('DEFER_POST_PILOT'));
});
test('SPREAD-P19 complete catalog equals independent before plus only two exact point19 facts',()=>{
 assert.deepEqual(productCatalog,applySpread(before.catalog));assert.deepEqual(withoutSpread(productCatalog),before.catalog);
 for(const owner of owners)for(const key of o.keys){const rows=productCatalog.facts[owner].filter(f=>f.key===key);assert.deepEqual(rows,[spreadFact(owner,key)]);assert.equal(JSON.stringify(rows),JSON.stringify([spreadFact(owner,key)]));}
});
for(const [n,id]of ids.entries()){
 test('SPREAD-P19 complete original point19 with all linked conditions '+id,()=>{
  const b=o.original_bindings[n],page=o.source_pages[n],file=new URL('../'+b.source_artifact,import.meta.url),number=n?14:13;assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),b.source_sha256);assert.equal(productCatalog.sources[owners[n]].sha256,b.source_sha256);
  const text=execFileSync('pdftotext',['-raw','-f',String(number),'-l',String(number),file.pathname,'-']).toString();assert.equal(text,page.raw_text);const flat=text.replace(/\s+/gu,' '),block=flat.split('19. Farlig spredning av biologiske eller kjemiske substanser m.m.')[1].split('20. Jordskjelv')[0].trim();assert.equal(block,o.rows[0].value);
  for(const phrase of ['For personskade under Bilansvarsloven og Lov om yrkesskadeforsikring samt på reise- og personforsikringer','farlig spredning av biologiske eller kjemiske substanser','raketter, atomvåpen eller radioaktiv stråling','For reise- og personforsikringer gjelder følgende begrensning:','Ved skade eller tap forårsaket av atomvåpen eller radioaktiv stråling','samlet erstatningsansvar overfor alle kunder og kravstillere','kr 500 millioner pr. skadehendelse','sammenhengende kjede av hendelser','For øvrige forsikringer dekkes ikke slike skader eller tap.'])assert.ok(block.includes(phrase),phrase);assert.ok(!block.includes('48 timer'));
  const layout=execFileSync('pdftotext',['-layout','-f',String(number),'-l',String(number),file.pathname,'-']).toString();assert.equal(layout,page.layout_text);
  for(const field of ['structuredValue','coverageAvailability','deductibleClassification','qualificationSource'])assert.equal(Object.hasOwn(spreadFact(owners[n],o.keys[0]),field),false);
  assert.equal(o.subscope,'Generelle vilkår punkt19 Farlig spredning av biologiske eller kjemiske substanser m.m. only');assert.equal(o.whole_signature_closure,false);
 });
 for(const c of before.configurations.filter(c=>c.id===id))test('SPREAD-P19 all choices full old-field equality and three JSON enrichments '+id+'/'+c.selected.join('+'),()=>{
  const facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);assert.deepEqual(withoutSpread(facts),c.facts);assert.deepEqual(withoutSpread(evidence),c.evidence);assert.deepEqual(facts.filter(f=>o.keys.includes(f.key)),o.keys.map(k=>spreadFact(owners[n],k)));assert.equal(evidence.filter(f=>o.keys.includes(f.key)).length,n?2:1);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSpread(first),c.first);const expected=pick(first);assert.equal(expected.length,1);
  const factSource=key=>spreadFact(owners[n],key).source;for(const term of expected){assert.equal(term.value,o.rows.find(r=>r.key===term.key).value);assert.equal(term.coverageOrigin,'catalog');assert.deepEqual(term.source,spreadFact(owners[n],term.key).source);assert.deepEqual(clean(term.sources),clean([{...factSource(term.key),note:n?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined}]));assert.equal(term.overriddenBase.length,n);if(n)assert.deepEqual(term.overriddenBase,[{value:term.value,source:spreadFact(owners[0],term.key).source}]);}
  const results=stages(first);for(const i of results){assert.deepEqual(clean(pick(i)),clean(expected));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);}
  const last=results.at(-1);assert.deepEqual(withoutSpread(last),c.repeat3);const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display.filter(f=>!o.keys.includes(f.key)),c.display);for(const row of display.filter(f=>o.keys.includes(f.key))){assert.equal(row.first,row.second);assert.ok(!row.first.startsWith('✓'));assert.equal(row.firstSources[0].page,n?14:13);assert.equal(row.secondSources[0].documentId,owners[n]);}
 });
 for(const side of ['existing','offer'])for(const def of o.rows)for(const values of [[],['Kundens konkrete regel om farlig spredning'],['Ukjent'],['Ikke valgt'],['Kundens regel A','Kundens regel B']])test('SPREAD-P19 independent document priority '+id+'/'+side+'/'+def.key+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,def,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[def.value];
  for(const i of stages(first)){const rows=pick(i).filter(t=>t.key===def.key);assert.deepEqual(rows.map(t=>t.value),expected);assert.ok(rows.every(t=>t.coverageOrigin===(expected[0]===def.value?'catalog':'document')));assert.deepEqual(clean(rows),clean(pick(first).filter(t=>t.key===def.key)));for(const other of o.rows.filter(r=>r.key!==def.key))assert.deepEqual(pick(i).filter(t=>t.key===other.key).map(t=>t.value),[other.value]);if(expected[0]!==def.value)assert.ok(rows.every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));}
 });
 for(const side of ['existing','offer'])test('SPREAD-P19 general terms evidence only '+id+'/'+side,()=>{
  const general={...raw(id),documentRole:'general_terms',importantTerms:o.rows.map(def=>({name:def.label,value:def.value,canonicalKey:null,documentIndices:[1]}))};const alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[{...raw(id),importantTerms:[]}],[general]],side).insuranceData,control=documentPipeline([[{...raw(id),importantTerms:[]}]],side).insuranceData.insurances[0];assert.equal(data.supportingEvidence.length,1);for(const i of stages(data.insurances[0])){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.deepEqual(i.addOnIds,control.addOnIds);}
 });
 for(const name of ['Farlig spredning','ABC','Biologiske og kjemiske substanser','Atomskade','Radioaktiv stråling','500 millioner','Forsikringssum','Generelle vilkår','Sammenhengende kjede av hendelser'])test('SPREAD-P19 generic label cannot override precise point19 '+id+'/'+name,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Syntetisk annen regel'],undefined,name)]]).insuranceData.insurances[0];assert.deepEqual(pick(first).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Syntetisk annen regel'&&t.coverageOrigin==='document'));
 });
 for(const [label,key]of [['Forsikrede bygninger','hus.bygninger.dekning'],['Fast inventar og installasjoner','hus.bygninger.tilbehor']])test('SPREAD-P19 positive customer field leaves independent point19 '+id+'/'+key,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Kundens objektregel'],undefined,label)]]).insuranceData.insurances[0];for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.deepEqual(i.importantTerms.filter(t=>t.key===key).map(t=>t.value),['Kundens objektregel']);}
 });
 test('SPREAD-P19 exact ordinary product identity boundaries '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('SPREAD-P19 all214 manual and144 actual document outputs preserve every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutSpread(first),c.first,c.id);assert.deepEqual(withoutSpread(repeat(first)),c.repeated,c.id);}for(const c of before.documents)assert.deepEqual(withoutSpread(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('SPREAD-P19 materialization and52 comparisons preserve all prior rows and reverse sides',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>!o.keys.includes(f.key))},c.output);for(const key of o.keys){const row=now.facts.find(f=>f.key===key);assert.equal(row.role,'term');assert.equal(row.value,o.rows.find(r=>r.key===key).value);}}
 assert.equal(before.comparisons.length,52);for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a),rows=now.sections.flatMap(s=>s.rows),old=c.output.sections.flatMap(s=>s.rows);assert.deepEqual(rows.filter(f=>!o.keys.includes(f.key)),old.filter(f=>!o.keys.includes(f.key)));for(const key of o.keys){const f=rows.find(r=>r.key===key),rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(f.first,rev.second);assert.deepEqual(f.second,rev.first);assert.equal(f.conceptId,'hus.ovrig');}
  const oldDiff=old.filter(r=>o.keys.includes(r.key)&&r.different).length,newDiff=rows.filter(r=>o.keys.includes(r.key)&&r.different).length;assert.equal(now.differenceCount,c.output.differenceCount-oldDiff+newDiff);if(c.a===c.b)assert.equal(now.differenceCount,0);
 }
});
test('SPREAD-P19 other products/addons and peer keys keep full original facts',()=>{
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));for(const a of availableAddOns(product,date)){const selected=[a.id];try{const expected=resolveCatalogFacts(old,selected,date,null,before.catalog);assert.deepEqual(resolveCatalogFacts(product,selected,date),expected);}catch(error){assert.throws(()=>resolveCatalogFacts(product,selected,date),{message:error.message});}}}
 const tryg=Object.entries(productCatalog.facts).flatMap(([owner,rows])=>rows.filter(f=>f.key===o.keys[0]&&!owners.includes(owner)).map(f=>({owner,fact:f})));assert.equal(tryg.length,0);for(const {owner,fact}of tryg)assert.deepEqual(fact,before.catalog.facts[owner].find(f=>f.key===o.keys[0]));
});
test('SPREAD-P19 terms alone never infer coverage or change canonical aliases/enum',()=>{
 for(const def of o.rows){assert.deepEqual(deriveCanonicalCoverages({type:'Hus',importantTerms:[{key:def.key,name:def.label,value:def.value}],coverages:[],addOns:[]},'Hus'),[]);assert.equal(normalizeCatalogTermKey(def.key),def.key);assert.equal(canonicalDocumentFactKeys.includes(def.key),false);assert.notEqual(normalizeTermName(def.label,{insuranceType:'Hus'}),def.key);}
 for(const key of o.keys){assert.equal(isNonAssertingCoverageDetail(key),true);assert.equal(key.endsWith('.dekning'),false);assert.equal(conceptForFactKey('bolig',key).id,'hus.ovrig');}
 assert.equal(o.rows.length,1);assert.ok(o.rows[0].value.startsWith('For personskade under Bilansvarsloven'));assert.ok(o.rows[0].value.endsWith('For øvrige forsikringer dekkes ikke slike skader eller tap.'));
});
test('SPREAD-P19 guarded compatibility rejects unrelated edits and preserves customer/other providers',()=>{
 for(const key of o.keys)for(const change of [f=>f.source.page=99,f=>f.source.section='Other',f=>f.value='Other',f=>f.structuredValue={kind:'money',amount:300}]){const row=spreadFact(owners[0],key);change(row);assert.throws(()=>withoutSpread([row]));const cat=applySpread(before.catalog);change(cat.facts[owners[0]].find(f=>f.key===key));assert.throws(()=>applySpread(cat));}
 const peer=Object.values(before.catalog.facts).flat().filter(f=>o.keys.includes(f.key));assert.equal(peer.length,0);assert.deepEqual(withoutSpread(peer),peer);const customer={key:o.keys[0],name:o.rows[0].label,value:'Kundens regel',source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:3}};assert.deepEqual(withoutSpread([customer]),[customer]);
});

test('SPREAD-P19 atomic source guards reject lost type limits,house sum,event rewrite or missing exclusion',()=>{
 const changes=[['For reise- og personforsikringer gjelder følgende begrensning:','For husforsikring gjelder følgende begrensning:'],['overfor alle kunder og kravstillere','overfor hver huseier'],['kr 500 millioner','kr 1 milliard'],['atomvåpen eller radioaktiv stråling','biologiske substanser'],['sammenhengende kjede av hendelser','periode på 48 timer'],['raketter, ',''],['For øvrige forsikringer dekkes ikke slike skader eller tap.','']];
 for(const [from,to]of changes){const row=spreadFact(owners[0],o.keys[0]);assert.ok(row.value.includes(from));row.value=row.value.replace(from,to);assert.throws(()=>withoutSpread([row]));}
});
for(const [n,id]of ids.entries())for(const side of ['existing','offer'])for(const mode of ['point19','point18','both','unknown'])test('SPREAD-P19 independent point18/19document priority '+id+'/'+side+'/'+mode,()=>{
 const terror=before.catalog.facts[owners[n]].find(f=>f.key==='hus.terror.begrensning');assert.ok(terror);const custom19=['point19','both'].includes(mode),custom18=['point18','both'].includes(mode);
 const rec={...raw(id),importantTerms:[{name:o.rows[0].label,value:custom19?'Kundens spredningsregel':'Ukjent',canonicalKey:null,documentIndices:[1]},{name:terror.label,value:custom18?'Kundens terrorregel':'Ukjent',canonicalKey:null,documentIndices:[1]}]};const first=documentPipeline([[rec]],side).insuranceData.insurances[0];
 for(const i of stages(first)){
  const spread=pick(i);assert.equal(spread.length,1);assert.equal(spread[0].value,custom19?'Kundens spredningsregel':o.rows[0].value);assert.equal(spread[0].coverageOrigin,custom19?'document':'catalog');
  const prior=i.importantTerms.filter(f=>f.key===terror.key);assert.equal(prior.length,1);assert.equal(prior[0].value,custom18?'Kundens terrorregel':terror.value);assert.equal(prior[0].coverageOrigin,custom18?'document':'catalog');assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(first,'Hus')));assert.deepEqual(i.addOnIds,first.addOnIds);
 }
});
