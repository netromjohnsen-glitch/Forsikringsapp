import {withoutFrostAndVacancy} from './helpers/b130-frost.mjs';
import {vacancyCatalogBaselineHash} from './helpers/b130-vacancy.mjs';
import {withHouseCatalogOrigin} from './helpers/house-origin.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {serialize,deserialize} from 'node:v8';
import {createHash} from 'node:crypto';
import {productCatalog,catalogReferenceForProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {groupAddOnNames,groupInsurances,groupTerms} from '../lib/comparison.ts';
import {HOUSE_SMART_ADDON as addon,resolveHouseSmartSelection,validatedHouseSmartManualSelection} from '../lib/hus-smart-selection.ts';
import {validateAnalysisOutput} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
const audit=new URL('../docs/audit/checkpoints/b051-manual-smart-24dfac7/',import.meta.url);
const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',audit)));
const bytes=readFileSync(new URL('baseline.v8.gz',audit));
assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'];
const keys=['hus.service.smart','hus.service.smart.avtale','hus.sikkerhet.egenandelsreduksjon'];
const date=new Date('2026-10-23T12:00:00Z'),p=id=>productCatalog.products.find(p=>p.productId===id);
const fixture=(id,selected=[addon])=>structuredClone(baseline.manual.find(c=>c.id===id&&JSON.stringify(c.input.products[0].addOnIds)===JSON.stringify(selected)).input);
const manual=(id,selected=[addon])=>normalizeManualAgreement(fixture(id,selected)).insuranceData.insurances[0];
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const smart=i=>i.importantTerms.filter(t=>keys.includes(t.key));
const stages=i=>{const b=repeat(i),c=repeat(b),d=repeat(JSON.parse(JSON.stringify(c)));return[i,b,c,d];};
const marker=id=>({origin:'manual',addOnId:addon,catalogReference:catalogReferenceForProduct(p(id))});
const selected=(id,i)=>resolveHouseSmartSelection(p(id),i,date);
const source=n=>({documentId:'pdf:existing:'+n,filename:'Kundebevis.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Smart-valg',documentRole:'individual_agreement'});
for(const id of ids){
 test(`SMART-MANUAL exact explicit choice marker and unchanged initial contract ${id}`,()=>{
  for(const selectedIds of [[],[addon],[addon,'gjensidige-hus-utleie'],['gjensidige-hus-utleie']]){
   const c=baseline.manual.find(c=>c.id===id&&JSON.stringify(c.input.products[0].addOnIds)===JSON.stringify(selectedIds));
   const expected=structuredClone(c.first);for(const a of expected.addOns)if(a.id===addon)a.manualSelection=marker(id);else if(a.id==='gjensidige-hus-utleie')a.manualSelection={origin:'manual',addOnId:a.id,catalogReference:catalogReferenceForProduct(p(id))};
   assert.deepEqual(withoutFrostAndVacancy(manual(id,selectedIds)),expected);
   for(const a of manual(id,selectedIds).addOns)if(a.id==='gjensidige-hus-utleie')assert.deepEqual(a.manualSelection,{origin:'manual',addOnId:a.id,catalogReference:catalogReferenceForProduct(p(id))});else if(a.id!==addon)assert.equal(Object.hasOwn(a,'manualSelection'),false);
  }
 });
 test(`SMART-MANUAL repeated enrichment and JSON persistence retain keys, sources and catalog origin ${id}`,()=>{
  const first=manual(id),expected=smart(first);assert.deepEqual(new Set(expected.map(t=>t.key)),new Set(keys));
  for(const i of stages(first)){
   assert.deepEqual(i.addOnIds,[addon]);assert.equal(selected(id,i).status,'selected');assert.equal(selected(id,i).origin,'manual');assert.equal(groupAddOnNames([i],'Hus'),'Hus Smart');
   assert.deepEqual(JSON.parse(JSON.stringify(smart(i))),JSON.parse(JSON.stringify(expected)));
   assert.equal(smart(i).length,3);assert.ok(smart(i).every(t=>t.coverageOrigin==='catalog'&&t.source&&t.sources.length));
   assert.deepEqual(i.addOns.find(a=>a.id===addon).manualSelection,marker(id));assert.equal(i.annualPremium,null);assert.equal(i.deductible,null);
  }
  assert.deepEqual(smart(repeat(first)),expected);
 });
 test(`SMART-MANUAL fresh deselection removes proof and does not resurrect old facts ${id}`,()=>{
  const on=manual(id),input=fixture(id);input.products[0].addOnIds=[];const off=normalizeManualAgreement(input).insuranceData.insurances[0];
  for(const i of stages(off)){assert.deepEqual(i.addOnIds,[]);assert.equal(groupAddOnNames([i],'Hus'),null);assert.equal(smart(i).length,0);}
  const stale={...off,addOnIds:[addon],importantTerms:[...off.importantTerms,...smart(on)]};
  for(const i of stages(repeat(stale))){assert.deepEqual(i.addOnIds,[]);assert.equal(groupAddOnNames([i],'Hus'),null);assert.notEqual(selected(id,i)?.status,'selected');}
  assert.deepEqual(repeat(manual(id)).addOnIds,[addon]);
 });
 test(`SMART-MANUAL combination preserves independent Smart and Utleie proofs ${id}`,()=>{
  const first=manual(id,[addon,'gjensidige-hus-utleie']);
  for(const i of stages(first).slice(1)){assert.deepEqual(i.addOnIds,[addon,'gjensidige-hus-utleie']);assert.equal(groupAddOnNames([i],'Hus'),'Hus Smart · Utleie');assert.deepEqual(i.addOns.find(a=>a.id==='gjensidige-hus-utleie').manualSelection,{origin:'manual',addOnId:'gjensidige-hus-utleie',catalogReference:catalogReferenceForProduct(p(id))});assert.deepEqual(JSON.parse(JSON.stringify(smart(i))),JSON.parse(JSON.stringify(smart(first))));}
 });
 for(const values of [['Valgt'],['Ikke valgt'],['Valgt','Ikke valgt'],['Ukjent']])test(`SMART-MANUAL document precedence ${id}/${values.join('+')}`,()=>{
  const first=manual(id);const evidence=values.map((value,n)=>({name:'Hus Smart',key:keys[0],value,coverageOrigin:'document',sources:[source(n)]}));first.importantTerms.push(...evidence);
  const status=values.length>1?'unknown':values[0]==='Valgt'?'selected':values[0]==='Ikke valgt'?'not_selected':'unknown';
  for(const i of stages(first)){
   assert.equal(selected(id,i).status,status);assert.equal(selected(id,i).conflict,values.length>1);assert.equal(groupAddOnNames([i],'Hus'),status==='selected'?'Hus Smart':null);
   if(i!==first)assert.deepEqual(i.addOnIds,status==='selected'?[addon]:[]);
   assert.deepEqual(i.importantTerms.filter(t=>keys.includes(t.key)&&t.coverageOrigin==='document'),evidence);
  }
 });
 test(`SMART-MANUAL supporting terms and customer details do not replace choice ${id}`,()=>{
  const first=manual(id);const detail={name:'Alarmtjenestens avtalevilkår',key:keys[1],value:'Kundens avtalevilkår 42 000 kr',coverageOrigin:'document',sources:[source(0)]};first.importantTerms.push(detail);
  first.importantTerms.push({name:'Hus Smart',key:keys[0],value:'Ikke valgt',coverageOrigin:'catalog',sources:[{...source(1),documentRole:'general_terms'}]});
  for(const i of stages(first)){assert.equal(selected(id,i).status,'selected');assert.equal(groupAddOnNames([i],'Hus'),'Hus Smart');assert.deepEqual(i.importantTerms.find(t=>t.value===detail.value),detail);}
 });
 test(`SMART-MANUAL invalid product-bound markers and catalog identity are not choice ${id}`,()=>{
  const first=manual(id),valid=first.addOns[0],ref=marker(id).catalogReference;
  const invalid=[null,undefined,[],1,'manual',{}, {origin:'manual'}, {origin:'manual',catalogReference:ref}, Object.assign(Object.create({origin:'manual'}),{addOnId:addon,catalogReference:ref,extra:true}), {...marker(id),addOnId:'gjensidige-hus-rate-insekter'}, {...marker(id),extra:true},{...marker(id),origin:'document'}, {...marker(id),catalogReference:null},{...marker(id),catalogReference:[]},
   ...Object.keys(ref).map(field=>{const x={...ref};delete x[field];return{origin:'manual',addOnId:addon,catalogReference:x};}),
   ...Object.keys(ref).map(field=>({origin:'manual',addOnId:addon,catalogReference:{...ref,[field]:'Wrong'}})),{origin:'manual',addOnId:addon,catalogReference:{...ref,extra:true}},marker(ids.find(x=>x!==id))];
  for(const m of invalid){const entry={...valid,manualSelection:m};assert.equal(validatedHouseSmartManualSelection(p(id),entry,date),null);
   for(const i of stages(repeat({...first,addOns:[entry]}))){assert.notEqual(selected(id,i)?.status,'selected');assert.deepEqual(i.addOnIds,[]);assert.equal(groupAddOnNames([i],'Hus'),null);}
  }
  const raw={...valid};delete raw.manualSelection;assert.equal(validatedHouseSmartManualSelection(p(id),raw,date),null);assert.deepEqual(repeat({...first,addOns:[raw]}).addOnIds,[]);assert.equal(groupAddOnNames([{...first,addOns:[raw]}],'Hus'),null);
  for(const overrides of [{id:'wrong'},{coverageOrigin:'document'}])assert.equal(validatedHouseSmartManualSelection(p(id),{...valid,...overrides},date),null);
  const renamed={...first,addOns:[{...valid,name:'Urelatert tekst'}]};assert.deepEqual(repeat(renamed).addOnIds,[addon]);assert.equal(groupAddOnNames([repeat(renamed)],'Hus'),'Hus Smart');
 });
 test(`SMART-MANUAL exact provider/product/type/scope/version and applicable component ${id}`,()=>{
  const valid=manual(id).addOns[0];for(const delta of [{providerId:'if'},{productId:'if-hus-basis'},{insuranceType:'Innbo'},{agreementScope:'nito'},{version:'Annen versjon'}])assert.equal(validatedHouseSmartManualSelection({...p(id),...delta},valid,date),null);
  assert.equal(resolveHouseSmartSelection(p(id),{...manual(id),type:'Innbo'},date),null);
  const catalog=structuredClone(productCatalog);catalog.addOns=catalog.addOns.filter(a=>a.id!==addon);assert.equal(validatedHouseSmartManualSelection(p(id),valid,date,catalog),null);
 });
 test(`SMART-MANUAL extraction cannot introduce choice markers ${id}`,()=>{
  const r=baseline.documents.find(c=>c.id===id).record;const extracted={company:'Gjensidige',totalAnnualPremium:null,totalAnnualPremiumScope:'entire_agreement',insurances:[r]};assert.equal(validateAnalysisOutput(extracted).insurances.length,1);
  const forged=structuredClone(extracted);forged.insurances[0].addOns=[{name:'Hus Smart',annualPremium:null,deductible:null,importantTerms:[],manualSelection:marker(id)}];assert.throws(()=>validateAnalysisOutput(forged));
  const input=fixture(id,[]);input.products[0].manualSelection=marker(id);assert.deepEqual(normalizeManualAgreement(input).insuranceData.insurances[0].addOnIds,[]);
 });
 test(`SMART-MANUAL comparison both directions retains sources and canonical rows ${id}`,()=>{
  const a=repeat(manual(id)),b=manual(id,[]);for(const[x,y,side]of[[a,b,'first'],[b,a,'second']]){const rows=groupTerms(groupInsurances([x],[y],null)[0],null);for(const t of smart(a)){const found=rows.filter(r=>r.key===t.key);assert.equal(found.length,1);assert.equal(found[0][side],t.value);assert.deepEqual(found[0][side+'Sources'],t.sources);}assert.equal(rows.some(r=>r.key==='hus smart'),false);}
 });
}
test('SMART-MANUAL all 202 other manual results preserve baseline; non-Smart targets allow only authorized Utleie delta',()=>{
 assert.equal(baseline.others.length,202);for(const c of [...baseline.others,...baseline.manual.filter(c=>!c.input.products[0].addOnIds.includes(addon))]){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0],expectedFirst=structuredClone(c.first),expectedRepeat=structuredClone(c.repeated);
 if(c.first.addOnIds.includes('gjensidige-hus-utleie')){
  const rental='gjensidige-hus-utleie',rows=c.first.importantTerms.filter(t=>t.key?.startsWith('hus.utleie.')),names=new Set(rows.map(t=>t.name));
  for(const i of [expectedFirst,expectedRepeat])i.addOns.find(a=>a.id===rental).manualSelection={origin:'manual',addOnId:rental,catalogReference:{...c.first.catalogReference}};
  expectedRepeat.addOnIds.push(rental);expectedRepeat.importantTerms=[...expectedRepeat.importantTerms.filter(t=>!names.has(t.name)),...structuredClone(rows)];expectedRepeat.catalogFacts.push(...structuredClone(c.first.catalogFacts.filter(f=>f.key.startsWith('hus.utleie.'))));
 }
 assert.deepEqual(withoutFrostAndVacancy(first),expectedFirst,c.id);const result=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(withoutFrostAndVacancy(result),withHouseCatalogOrigin(expectedRepeat,c.first),c.id);}
 assert.equal(createHash('sha256').update(serialize(withoutFrostAndVacancy(productCatalog))).digest('hex'),vacancyCatalogBaselineHash);
});
test('SMART-MANUAL all 96 actual document pipeline outputs and displays are exact baseline',()=>{
 assert.equal(baseline.documents.length,96);for(const c of baseline.documents){const output=documentPipeline([[c.record]],c.side).insuranceData;assert.deepEqual(withoutFrostAndVacancy(output),c.output,c.id);assert.equal(groupAddOnNames(output.insurances,'Hus'),c.display,c.id);}
});
