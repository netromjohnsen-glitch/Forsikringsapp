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
import {normalizeCatalogTermKey,normalizeTermName} from '../lib/insurance-normalization.ts';
import {conceptForFactKey} from '../lib/presentation-catalog.ts';
import {canonicalDocumentFactKeys} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {additionalCostsOracle as o,additionalCostsFact,additionalCostsSources,applyAdditionalCosts,withoutAdditionalCosts} from './helpers/house-additional-costs.mjs';

const dir=new URL('../docs/audit/checkpoints/house-additional-costs-de087fc/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],owners=['gjensidigeHusStandard','gjensidigeHusPluss'],date=new Date('2026-10-24T12:00:00Z'),clean=x=>JSON.parse(JSON.stringify(x));
const p=id=>productCatalog.products.find(p=>p.productId===id),pick=i=>i.importantTerms.filter(t=>o.keys.includes(t.key));
const repeat=(i,catalog=productCatalog)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,catalog).insurances[0];
const stages=(i,catalog=productCatalog)=>{const out=[i];for(let j=0;j<3;j++)out.push(repeat(clean(out.at(-1)),catalog));return out;};
const raw=id=>structuredClone(before.documents.find(c=>c.id===id&&c.record.documentRole==='individual_agreement'&&!c.record.importantTerms.length&&!c.record.addOns.length).record);
const record=(id,def,values=[],role='individual_agreement',name=def.label)=>({...raw(id),documentRole:role,importantTerms:values.map(value=>({name,value,canonicalKey:null,documentIndices:[1]}))});

test('ADDITIONAL-COSTS exact original P2 signature/both bindings and immutable disposition',()=>{
 assert.equal(o.signature,'e103e7cb532fb8d4');assert.deepEqual(o.original_bindings.map(b=>[b.finding_id,b.source_fact_id]),[['GAP-2099','SF-3008'],['GAP-2158','SF-3095']]);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p2-piggyback.csv',import.meta.url),'utf8').split('\n').find(l=>l.startsWith(o.signature+','));assert.ok(registry.includes('DEFER_POST_PILOT'));
});
test('ADDITIONAL-COSTS complete catalog is independent before plus only six own-source facts',()=>{
 assert.deepEqual(productCatalog,applyAdditionalCosts(before.catalog));assert.deepEqual(withoutAdditionalCosts(productCatalog),before.catalog);
 for(const owner of owners)for(const key of o.keys){const rows=productCatalog.facts[owner].filter(f=>f.key===key);assert.deepEqual(rows,[additionalCostsFact(owner,key)]);assert.equal(JSON.stringify(rows),JSON.stringify([additionalCostsFact(owner,key)]));}
});
for(const page of o.source_pages)test('ADDITIONAL-COSTS original full source page '+page.path+'/'+page.PDF_page_1_based,()=>{
 const file=new URL('../'+page.path,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),page.sha256);
 const text=execFileSync('pdftotext',['-raw','-f',String(page.PDF_page_1_based),'-l',String(page.PDF_page_1_based),file.pathname,'-']).toString();assert.equal(text,page.raw_text);
 const owner=page.path.includes('Standard')?owners[0]:owners[1];assert.equal(productCatalog.sources[owner].sha256,page.sha256);
});
test('ADDITIONAL-COSTS source triggers,complete removal object,index/period and water causation',()=>{
 const text=(file,page)=>o.source_pages.find(p=>p.path.includes(file)&&p.PDF_page_1_based===page).raw_text.replace(/\s+/gu,' ');
 const standard=text('Standard',5),plussHeading=text('Pluss',5),pluss=text('Pluss',6),heading='Etter en erstatningsmessig skade dekkes i tillegg utover forsikringssummen';
 assert.ok(standard.includes(heading));assert.ok(plussHeading.includes(heading));
 const list=t=>t.slice(t.indexOf('Riving, rydding'),t.indexOf('I tillegg dekkes:'));assert.equal(list(standard),list(pluss));
 for(const t of [standard,pluss])for(const phrase of ['Riving, rydding, bortkjøring og deponering av verdiløse bygningsrester','Prisstigning','Økt vannavgift som følge av skaden'])assert.ok(t.includes(phrase),phrase);
 for(const [file,page] of [['Standard',18],['Pluss',19]])assert.ok(text(file,page).includes('Det justeres for gjennomsnittlig prisstigning etter byggekostnadsindeksen, innenfor normal reparasjon/gjenoppføringstid.'));
 assert.ok(standard.includes('maksimalt kr 10 millioner per kunde'));for(const row of o.rows)assert.ok(!/millioner|300|75|20 %|SSB/u.test(row.value));
});
for(const [n,id]of ids.entries()){
 for(const c of before.configurations.filter(c=>c.id===id))test('ADDITIONAL-COSTS all choices and full prior-state equality '+id+'/'+c.selected.join('+'),()=>{
  const facts=resolveCatalogFacts(p(id),c.selected,date),evidence=resolveCatalogEvidence(p(id),c.selected,date);
  assert.deepEqual(withoutAdditionalCosts(facts),c.facts);assert.deepEqual(withoutAdditionalCosts(evidence),c.evidence);assert.deepEqual(facts.filter(f=>o.keys.includes(f.key)),o.keys.map(k=>additionalCostsFact(owners[n],k)));assert.equal(evidence.filter(f=>o.keys.includes(f.key)).length,n?6:3);
  const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutAdditionalCosts(first),c.first);const expected=pick(first);assert.equal(expected.length,3);
  for(const term of expected){const fact=additionalCostsFact(owners[n],term.key);assert.equal(term.value,fact.value);assert.equal(term.coverageOrigin,'catalog');assert.deepEqual(term.source,fact.source);assert.deepEqual(clean(term.sources),clean(additionalCostsSources(fact,true)));assert.deepEqual(clean(term.overriddenBase),n?[{value:fact.value,source:clean(additionalCostsFact(owners[0],term.key).source)}]:[]);}
  const baselineStages=stages(c.first,before.catalog);for(const [j,i] of stages(first).entries()){assert.deepEqual(withoutAdditionalCosts(i),baselineStages[j]);assert.deepEqual(clean(pick(i)),clean(expected));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus').filter(c=>c.id!==o.keys[0])),clean(deriveCanonicalCoverages(c.repeat3,'Hus')));assert.equal(deriveCanonicalCoverages(i,'Hus').find(c=>c.id===o.keys[0]).status,'selected');assert.deepEqual(clean(i.addOns),clean(baselineStages[j].addOns));assert.deepEqual(new Set(i.addOnIds),new Set(c.selected));assert.equal(i.annualPremium,c.first.annualPremium);assert.equal(i.deductible,c.first.deductible);}
  const last=stages(first).at(-1);assert.deepEqual(withoutAdditionalCosts(last),c.repeat3);const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display.filter(f=>!o.keys.includes(f.key)),c.display);for(const row of display.filter(f=>o.keys.includes(f.key))){assert.equal(row.first,row.second);assert.equal(row.firstSources[0].page,n?6:5);assert.equal(row.firstSources[0].documentId,owners[n]);}
 });
 for(const side of ['existing','offer'])for(const def of o.rows)for(const values of [[],['Kundens konkrete tilleggsregel'],['Ukjent'],['Ikke valgt'],['Kundens regel A','Kundens regel B']])test('ADDITIONAL-COSTS independent document priority '+id+'/'+side+'/'+def.key+'/'+values.join('+'),()=>{
  const first=documentPipeline([[record(id,def,values)]],side).insuranceData.insurances[0],expected=values.length&&values[0]!=='Ukjent'?values:[def.value];
  for(const i of stages(first)){const rows=pick(i).filter(t=>t.key===def.key);assert.deepEqual(rows.map(t=>t.value),expected);assert.ok(rows.every(t=>t.coverageOrigin===(expected[0]===def.value?'catalog':'document')));assert.deepEqual(clean(rows),clean(pick(first).filter(t=>t.key===def.key)));for(const other of o.rows.filter(r=>r.key!==def.key))assert.deepEqual(pick(i).filter(t=>t.key===other.key).map(t=>t.value),[other.value]);if(expected[0]!==def.value)assert.ok(rows.every(t=>t.sources.every(s=>s.documentRole==='individual_agreement')));}
  if(values[0]==='Ikke valgt'&&def.key===o.keys[0])assert.equal(deriveCanonicalCoverages(first,'Hus').find(c=>c.id===def.key).status,'not_selected');
 });
 for(const side of ['existing','offer'])test('ADDITIONAL-COSTS general terms supporting only '+id+'/'+side,()=>{
  const general={...raw(id),documentRole:'general_terms',importantTerms:o.rows.map(def=>({name:def.label,value:def.value,canonicalKey:null,documentIndices:[1]}))};const alone=documentPipeline([[general]],side).insuranceData;assert.equal(alone.insurances.length,0);assert.equal(alone.supportingEvidence.length,1);
  const data=documentPipeline([[{...raw(id),importantTerms:[]}],[general]],side).insuranceData,control=documentPipeline([[{...raw(id),importantTerms:[]}]],side).insuranceData.insurances[0];assert.equal(data.supportingEvidence.length,1);for(const i of stages(data.insurances[0])){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(pick(i).every(t=>t.coverageOrigin==='catalog'));assert.deepEqual(clean(deriveCanonicalCoverages(i,'Hus')),clean(deriveCanonicalCoverages(control,'Hus')));assert.deepEqual(i.addOnIds,control.addOnIds);assert.equal(deriveCanonicalCoverages(i,'Hus').find(c=>c.id===o.keys[0]).status,'selected');}
 });
 for(const name of ['Etter skade','Tilleggsutgifter','Rydding','Prisstigning','Vannavgift','Vann'])test('ADDITIONAL-COSTS generic label cannot bind a precise rule '+id+'/'+name,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Syntetisk annen regel'],undefined,name)]]).insuranceData.insurances[0];assert.deepEqual(pick(first).map(t=>t.value),o.rows.map(r=>r.value));assert.ok(first.importantTerms.some(t=>t.name===name&&t.value==='Syntetisk annen regel'&&t.coverageOrigin==='document'));
 });
 test('ADDITIONAL-COSTS nearby customer settlement rule does not suppress additions '+id,()=>{
  const first=documentPipeline([[record(id,o.rows[0],['Kundens oppgjørsregel'],undefined,'Oppgjørsmåte')]]).insuranceData.insurances[0];for(const i of stages(first)){assert.deepEqual(pick(i).map(t=>t.value),o.rows.map(r=>r.value));assert.deepEqual(i.importantTerms.filter(t=>t.key==='hus.gjenoppforing.oppgjorsmate').map(t=>t.value),['Kundens oppgjørsregel']);}
 });
 test('ADDITIONAL-COSTS ordinary identity,type,provider,version boundaries '+id,()=>{
  for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p(id).version,context),null);assert.equal(findCatalogProduct('if',id,p(id).version,{insuranceType:'Hus',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('gjensidige',id,'Annen versjon',{insuranceType:'Hus',agreementScope:'ordinary'}),null);
 });
}
test('ADDITIONAL-COSTS all214 manual and144 actual document controls preserve every old field',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);
 for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutAdditionalCosts(first),c.first,c.id);assert.deepEqual(withoutAdditionalCosts(repeat(first)),c.repeated,c.id);}
 for(const c of before.documents)assert.deepEqual(withoutAdditionalCosts(documentPipeline([[c.record]],c.side).insuranceData),c.output,c.id);
});
test('ADDITIONAL-COSTS materialization and52 comparisons retain all preexisting rows and reverse sides',()=>{
 for(const c of before.materialized){const now=materializeCatalogProduct(p(c.id));assert.deepEqual({...now,facts:now.facts.filter(f=>!o.keys.includes(f.key))},c.output);const owner=owners[ids.indexOf(c.id)];for(const [i,key] of o.keys.entries()){const fact=now.facts.find(f=>f.key===key);assert.equal(fact.role,i===0?'coverage':'term');assert.equal(fact.value,o.rows[i].value);assert.deepEqual(clean(fact.sources),clean(additionalCostsSources(additionalCostsFact(owner,key))));}}
 assert.equal(before.comparisons.length,52);for(const c of before.comparisons){const a=productCatalog.products.find(p=>p.productId===c.a),b=productCatalog.products.find(p=>p.productId===c.b),now=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a),rows=now.sections.flatMap(s=>s.rows),old=c.output.sections.flatMap(s=>s.rows);assert.deepEqual(rows.filter(f=>!o.keys.includes(f.key)),old.filter(f=>!o.keys.includes(f.key)));for(const key of o.keys){const f=rows.find(r=>r.key===key),rev=reverse.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(f.first,rev.second);assert.deepEqual(f.second,rev.first);assert.equal(f.conceptId,key===o.keys[2]?'hus.vann-fukt':'hus.gjenoppforing');if(!ids.includes(c.b)&&!resolveCatalogFacts(b,[],date).some(f=>f.key===key))assert.equal(f.second.state,'unknown');}
  const oldDiff=old.filter(r=>o.keys.includes(r.key)&&r.different).length,newDiff=rows.filter(r=>o.keys.includes(r.key)&&r.different).length;assert.equal(now.differenceCount,c.output.differenceCount-oldDiff+newDiff);if(c.a===c.b)assert.equal(now.differenceCount,0);
 }
});
test('ADDITIONAL-COSTS other products/all available add-ons and shared existing keys unchanged',()=>{
 for(const product of productCatalog.products.filter(p=>!ids.includes(p.productId))){const old=before.catalog.products.find(p=>p.productId===product.productId);assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(old,[],date,null,before.catalog));for(const a of availableAddOns(product,date)){const selected=[a.id];let expected;try{expected=resolveCatalogFacts(old,selected,date,null,before.catalog);}catch(error){assert.throws(()=>resolveCatalogFacts(product,selected,date),{message:error.message});continue;}assert.deepEqual(resolveCatalogFacts(product,selected,date),expected);}}
 for(const [owner,rows] of Object.entries(productCatalog.facts))if(!owners.includes(owner))assert.deepEqual(rows,before.catalog.facts[owner]);
 assert.equal(Object.values(before.catalog.facts).flat().filter(f=>f.key===o.keys[0]).length,6);assert.equal(Object.values(before.catalog.facts).flat().filter(f=>f.key===o.keys[1]).length,3);
});
test('ADDITIONAL-COSTS known-product coverage benefit is distinct from customer choice;details never assert coverage',()=>{
 for(const def of o.rows){assert.equal(normalizeCatalogTermKey(def.key),def.key);assert.equal(canonicalDocumentFactKeys.includes(def.key),false);assert.notEqual(normalizeTermName(def.label,{insuranceType:'Hus'}),def.key);}
 const bare=(row,origin)=>({importantTerms:[{key:row.key,name:row.label,value:row.value,coverageOrigin:origin}],addOns:[]});
 assert.equal(deriveCanonicalCoverages(bare(o.rows[0],'catalog'),'Hus')[0].status,'unknown');for(const def of o.rows.slice(1))assert.deepEqual(deriveCanonicalCoverages(bare(def,'document'),'Hus'),[]);
 assert.equal(conceptForFactKey('bolig',o.keys[2]).id,'hus.vann-fukt');
});
test('ADDITIONAL-COSTS projection guards reject contract/provenance mutations and retain peers/customer rules',()=>{
 for(const key of o.keys)for(const change of [f=>f.source.page=99,f=>f.source.section='Other',f=>f.value='Other',f=>f.structuredValue={kind:'money',amount:300},f=>f.coverageAvailability='included']){const row=additionalCostsFact(owners[0],key);change(row);assert.throws(()=>withoutAdditionalCosts([row]));const catalog=applyAdditionalCosts(before.catalog);change(catalog.facts[owners[0]].find(f=>f.key===key));assert.throws(()=>applyAdditionalCosts(catalog));}
 for(const owner of owners){const row=additionalCostsFact(owner,o.keys[1]);row.qualificationSource.page=99;assert.throws(()=>withoutAdditionalCosts([row]));}
 const peer=Object.values(before.catalog.facts).flat().filter(f=>o.keys.includes(f.key));assert.equal(peer.length,9);assert.deepEqual(withoutAdditionalCosts(peer),peer);const customer={key:o.keys[0],name:o.rows[0].label,value:'Kundens regel',source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:3}};assert.deepEqual(withoutAdditionalCosts([customer]),[customer]);
});
