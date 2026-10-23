import {withoutVacancy,vacancyCatalogBaselineHash} from './helpers/b130-vacancy.mjs';
import {withHouseCatalogOrigin} from './helpers/house-origin.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {serialize,deserialize} from 'node:v8';
import {createHash} from 'node:crypto';
import {productCatalog,catalogReferenceForProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog,validatedManualSelectionAddOn} from '../lib/catalog-enrichment.ts';
import {groupAddOnNames,groupInsurances,groupTerms} from '../lib/comparison.ts';
import {HOUSE_RENTAL_ADDON as addon,HOUSE_RENTAL_KEYS as keys,houseRentalTermKey,resolveHouseRentalManualSelection,validatedHouseRentalManualSelection} from '../lib/hus-rental-selection.ts';
import {validatedHouseSmartManualSelection} from '../lib/hus-smart-selection.ts';
import {validateAnalysisOutput} from '../lib/analysis-output.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
const dir=new URL('../docs/audit/checkpoints/b051-manual-rental-d53c2a1/',import.meta.url);
const meta=JSON.parse(readFileSync(new URL('baseline-identity.json',dir))),bytes=readFileSync(new URL('baseline.v8.gz',dir)),hash=x=>createHash('sha256').update(x).digest('hex');
assert.equal(hash(bytes),meta.baseline_sha256);
const baseline=deserialize(gunzipSync(bytes)),ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-23T12:00:00Z');
const p=id=>productCatalog.products.find(p=>p.productId===id),fixture=(id,addons=[addon])=>structuredClone([...baseline.manual,...baseline.controls].find(c=>c.id===id&&JSON.stringify(c.input.products[0].addOnIds)===JSON.stringify(addons)).input);
const manual=(id,addons=[addon])=>normalizeManualAgreement(fixture(id,addons)).insuranceData.insurances[0];
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const stages=i=>{const a=repeat(i),b=repeat(a);return[i,a,b,repeat(JSON.parse(JSON.stringify(b)))];};
const rental=i=>i.importantTerms.filter(t=>keys.includes(t.key)),clean=x=>JSON.parse(JSON.stringify(x));
const marker=id=>({origin:'manual',addOnId:addon,catalogReference:catalogReferenceForProduct(p(id))});
const state=(id,i)=>resolveHouseRentalManualSelection(p(id),i,date);
const source=n=>({documentId:`synthetic:rental:${n}`,filename:`Kundebevis ${n}.pdf`,termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',page:n+1,section:'Kundens Utleie-valg',documentRole:'individual_agreement'});
const term=(name,value,n=0,extra={})=>({name,value,coverageOrigin:'document',sources:[source(n)],...extra});
for(const id of ids){
 test(`RENTAL-MANUAL initial contract differs only by exact addon-bound proof ${id}`,()=>{
  for(const c of baseline.manual.filter(c=>c.id===id)){const expected=structuredClone(c.first);expected.addOns.find(a=>a.id===addon).manualSelection=marker(id);assert.deepEqual(withoutVacancy(normalizeManualAgreement(c.input).insuranceData.insurances[0]),expected);}
 });
 test(`RENTAL-MANUAL three repeats and JSON keep five full keyed catalog rows ${id}`,()=>{
  const first=manual(id),rows=rental(first);assert.equal(rows.length,5);assert.deepEqual(new Set(rows.map(t=>t.key)),new Set(keys));
  for(const i of stages(first)){assert.deepEqual(i.addOnIds,[addon]);assert.equal(state(id,i).status,'selected');assert.equal(groupAddOnNames([i],'Hus'),'Utleie');assert.deepEqual(clean(rental(i)),clean(rows));assert.equal(i.annualPremium,null);assert.equal(i.deductible,null);assert.equal(i.deductibleOrigin,'customer');assert.deepEqual(i.addOns.find(a=>a.id===addon).manualSelection,marker(id));assert.ok(rental(i).every(t=>t.coverageOrigin==='catalog'&&t.sources.length));}
  assert.deepEqual(rental(repeat(first)),rows);
  const d=rows.find(t=>t.key==='hus.utleie.egenandel');assert.equal(d.deductibleClassification,'override');assert.match(d.sources[0].note,/Uttrykkelig særskilt egenandel/);assert.match(d.value,/10 000/);
 });
 test(`RENTAL-MANUAL Smart/rot combinations preserve all explicit choices and their facts ${id}`,()=>{
  for(const c of baseline.manual.filter(c=>c.id===id)){const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];for(const i of stages(first).slice(1)){assert.deepEqual(new Set(i.addOnIds),new Set(first.addOnIds));assert.deepEqual(clean(rental(i)),clean(rental(first)));for(const other of first.addOnIds.filter(x=>x!==addon)){assert.deepEqual(i.addOns.find(a=>a.id===other).manualSelection,first.addOns.find(a=>a.id===other).manualSelection);}
   const smart=t=>t.importantTerms.filter(x=>['hus.service.smart','hus.sikkerhet.egenandelsreduksjon','hus.service.smart.avtale'].includes(x.key));assert.deepEqual(clean(smart(i)),clean(smart(first)));}}
 });
 test(`RENTAL-MANUAL deselection, stale IDs/catalog rows and reselect ${id}`,()=>{
  const first=manual(id),input=fixture(id);input.products[0].addOnIds=[];const off=normalizeManualAgreement(input).insuranceData.insurances[0];
  for(const i of stages(off)){assert.deepEqual(i.addOnIds,[]);assert.equal(rental(i).length,0);assert.equal(groupAddOnNames([i],'Hus'),null);}
  const stale={...off,addOnIds:[addon],importantTerms:[...off.importantTerms,...rental(first)]};for(const i of stages(repeat(stale))){assert.deepEqual(i.addOnIds,[]);assert.equal(rental(i).length,0);assert.equal(groupAddOnNames([i],'Hus'),null);}
  assert.deepEqual(repeat(manual(id)).addOnIds,[addon]);
 });
 for(const placement of ['record','addon'])for(const [values,status,conflict]of [[['Valgt'],'selected',false],[['Ikke valgt'],'not_selected',false],[['Valgt','Ikke valgt'],'unknown',true],[['Ukjent'],'unknown',false]])test(`RENTAL-MANUAL document choice ${id}/${placement}/${values.join('+')}`,()=>{
  const first=manual(id),evidence=values.map((value,n)=>term(placement==='record'?'Utleie':'Valg',value,n));if(placement==='record')first.importantTerms.push(...evidence);else first.addOns.push({name:'Utleie',annualPremium:null,deductible:null,coverageOrigin:'document',importantTerms:evidence});
  for(const i of stages(first)){assert.equal(state(id,i).status,status);assert.equal(state(id,i).conflict,conflict);assert.deepEqual(state(id,i).sources,values.map((_,n)=>source(n)));assert.equal(groupAddOnNames([i],'Hus'),status==='selected'?'Utleie':null);if(i!==first){assert.deepEqual(i.addOnIds,status==='selected'?[addon]:[]);assert.equal(rental(i).filter(t=>t.coverageOrigin==='catalog').length,status==='selected'?5:0);}const ts=placement==='record'?i.importantTerms:i.addOns.at(-1).importantTerms;assert.deepEqual(ts.filter(t=>t.coverageOrigin==='document'&&values.includes(t.value)).map(t=>({name:t.name,value:t.value,sources:t.sources})),evidence.map(t=>({name:t.name,value:t.value,sources:t.sources})));}
 });
 test(`RENTAL-MANUAL every local choice heading is scoped to the documented addon ${id}`,()=>{
  for(const name of ['Valg','Valgstatus','Status','Dekning']){const first=manual(id);first.addOns.push({name:'Utleie',coverageOrigin:'document',importantTerms:[term(name,'Ikke valgt')]});assert.equal(state(id,repeat(first)).status,'not_selected');const other=manual(id);other.importantTerms.push(term(name,'Ikke valgt'));assert.equal(state(id,repeat(other)).status,'selected');}
 });
 test(`RENTAL-MANUAL descriptions/conditional availability and detail statuses never choose the addon ${id}`,()=>{
  for(const value of ['Valgfri utvidelse som må være registrert i forsikringsbeviset.','Når utleie er angitt i forsikringsbeviset, gjelder egne vilkår.']){const i=manual(id);i.importantTerms.push(term('Utleie',value));assert.equal(state(id,repeat(i)).status,'selected');}
  for(const key of keys)for(const value of ['Valgt','Ikke valgt','Ukjent','Kundens vilkår 13 000 kr']){const first=manual(id),name=rental(first).find(t=>t.key===key).name,customer=term(name,value,0,{canonicalKey:key});first.importantTerms.push(customer);const i=repeat(first);assert.equal(state(id,i).status,'selected');assert.equal(groupAddOnNames([i],'Hus'),'Utleie');const rows=i.importantTerms.filter(t=>t.key===key);assert.equal(rows.length,1);assert.equal(rows[0].value,value);assert.equal(rows[0].coverageOrigin,'document');assert.deepEqual(rows[0].sources,customer.sources);assert.equal(rental(i).filter(t=>t.coverageOrigin==='catalog').length,4);assert.deepEqual(clean(rental(repeat(i))),clean(rental(i)));}
 });
 test(`RENTAL-MANUAL supporting evidence is never customer choice and retains provenance ${id}`,()=>{
  const first=manual(id);const s=term('Utleie – utkastelse','Generelt vilkår 19 000 kr',0,{key:'hus.utleie.utkastelse',coverageOrigin:'catalog',sources:[{...source(0),documentRole:'general_terms'}]});first.importantTerms.push(s);first.importantTerms.push(term('Utleie','Ikke valgt',0,{coverageOrigin:'catalog',sources:[{...source(0),documentRole:'general_terms'}]}));
  for(const i of stages(first)){assert.equal(state(id,i).status,'selected');assert.equal(groupAddOnNames([i],'Hus'),'Utleie');const retained=i.importantTerms.find(t=>t.value===s.value);assert.equal(retained.coverageOrigin,'catalog');assert.deepEqual(retained.sources,s.sources);}
 });
 test(`RENTAL-MANUAL invalid/missing/cross-addon markers cannot select or display ${id}`,()=>{
  const first=manual(id),valid=first.addOns[0],ref=marker(id).catalogReference;const invalid=[null,undefined,[],1,'manual',{}, {origin:'manual'}, {origin:'manual',catalogReference:ref}, {...marker(id),extra:true},{...marker(id),origin:'document'},{...marker(id),addOnId:'gjensidige-hus-smart'},{...marker(id),addOnId:'gjensidige-hus-rate-insekter'},{...marker(id),catalogReference:null},{...marker(id),catalogReference:[]}, Object.assign(Object.create({origin:'manual'}),{addOnId:addon,catalogReference:ref,extra:true}),...Object.keys(ref).map(field=>{const r={...ref};delete r[field];return{...marker(id),catalogReference:r};}),...Object.keys(ref).map(field=>({...marker(id),catalogReference:{...ref,[field]:'wrong'}})),{...marker(id),catalogReference:{...ref,extra:true}},marker(ids.find(x=>x!==id))];
  for(const m of invalid){const entry={...valid,manualSelection:m};assert.equal(validatedHouseRentalManualSelection(p(id),entry,date),null);for(const i of stages(repeat({...first,addOns:[entry]}))){assert.deepEqual(i.addOnIds,[]);assert.equal(groupAddOnNames([i],'Hus'),null);assert.equal(rental(i).length,0);}const yes={...first,addOns:[entry],importantTerms:[...first.importantTerms,term('Utleie','Valgt')]};assert.deepEqual(repeat(yes).addOnIds,[]);}
  const raw={...valid};delete raw.manualSelection;assert.deepEqual(repeat({...first,addOns:[raw]}).addOnIds,[]);assert.equal(groupAddOnNames([{...first,addOns:[raw]}],'Hus'),null);
  for(const delta of [{id:'wrong'},{coverageOrigin:'document'}])assert.equal(validatedHouseRentalManualSelection(p(id),{...valid,...delta},date),null);
  assert.equal(validatedManualSelectionAddOn(p(id),{...valid,id:'gjensidige-hus-rate-insekter'},date),null);assert.equal(validatedHouseSmartManualSelection(p(id),{...valid,id:'gjensidige-hus-smart'},date),null);
  const renamed={...first,addOns:[{...valid,name:'Urelatert tekst'}]};assert.deepEqual(repeat(renamed).addOnIds,[addon]);
 });
 test(`RENTAL-MANUAL provider/type/product/scope/version/component isolation ${id}`,()=>{
  const first=manual(id),valid=first.addOns[0];for(const delta of [{providerId:'if'},{productId:'if-hus-basis'},{insuranceType:'Innbo'},{agreementScope:'nito'},{version:'Annen'}])assert.equal(validatedHouseRentalManualSelection({...p(id),...delta},valid,date),null);
  assert.equal(resolveHouseRentalManualSelection(p(id),{...first,type:'Innbo'},date),null);const c=structuredClone(productCatalog);c.addOns=c.addOns.filter(a=>a.id!==addon);assert.equal(validatedHouseRentalManualSelection(p(id),valid,date,c),null);assert.equal(resolveHouseRentalManualSelection(p(id),first,date,c).status,'unknown');
  assert.equal(houseRentalTermKey({name:'Utleie',key:'glass.dekning',value:'Valgt'}),null);
  for(const name of ['Utleieforsikring','Registrert utleie','Utleieavtale']){const i=manual(id);i.importantTerms.push(term(name,'Ikke valgt'));assert.equal(state(id,repeat(i)).status,'selected');}
 });
 test(`RENTAL-MANUAL source-bearing document addons remain outside manual context ${id}`,()=>{
  const i=manual(id,[]);i.addOns=[{name:'Utleie',annualPremium:null,deductible:null,coverageOrigin:'document',source:source(0),importantTerms:[term('Valg','Ikke valgt')]}];
  assert.equal(state(id,i),null);const output=repeat(i);assert.deepEqual(output.addOnIds,[]);assert.equal(state(id,output),null);assert.equal(groupAddOnNames([output],'Hus'),null);
 });
 test(`RENTAL-MANUAL extraction cannot introduce internal choice proof ${id}`,()=>{
  const record=baseline.documents.find(c=>c.id===id).record,extracted={company:'Gjensidige',totalAnnualPremium:null,totalAnnualPremiumScope:'entire_agreement',insurances:[record]};assert.equal(validateAnalysisOutput(extracted).insurances.length,1);const bad=structuredClone(extracted);bad.insurances[0].addOns=[{name:'Utleie',annualPremium:null,deductible:null,importantTerms:[],manualSelection:marker(id)}];assert.throws(()=>validateAnalysisOutput(bad));const input=fixture(id,[]);input.products[0].manualSelection=marker(id);assert.deepEqual(normalizeManualAgreement(input).insuranceData.insurances[0].addOnIds,[]);
 });
 test(`RENTAL-MANUAL UI FormData boundary retains proof and honors fresh checkbox removal ${id}`,()=>{
  const input=fixture(id),submit=(raw,side)=>{const form=new FormData();form.set(side+'Mode','manual');form.set(side+'Manual',JSON.stringify(raw));return normalizeManualAgreement(JSON.parse(form.get(side+'Manual'))).insuranceData.insurances[0];};
  input.products[0].catalogReference=catalogReferenceForProduct(p(id));input.products[0].annualPremium='12345';input.products[0].deductible='6000';
  for(const side of ['existing','offer']){const first=submit(input,side);for(const i of stages(first)){assert.deepEqual(i.addOnIds,[addon]);assert.equal(groupAddOnNames([i],'Hus'),'Utleie');assert.equal(i.annualPremium,'12345');assert.equal(i.deductible,'6000');assert.deepEqual(clean(rental(i)),clean(rental(first)));}
   const off=structuredClone(input);off.products[0].addOnIds=[];for(const i of stages(submit(off,side))){assert.deepEqual(i.addOnIds,[]);assert.equal(rental(i).length,0);assert.equal(groupAddOnNames([i],'Hus'),null);assert.equal(i.annualPremium,'12345');assert.equal(i.deductible,'6000');}}
 });
 test(`RENTAL-MANUAL canonical comparison both directions with full sources ${id}`,()=>{
  const a=repeat(manual(id)),b=manual(id,[]);for(const[x,y,side]of[[a,b,'first'],[b,a,'second']]){const rows=groupTerms(groupInsurances([x],[y],null)[0],null);for(const t of rental(a)){const row=rows.filter(r=>r.key===t.key);assert.equal(row.length,1);assert.equal(row[0][side],t.value);assert.deepEqual(row[0][side+'Sources'],t.sources);}assert.equal(rows.filter(r=>r.key==='utleie avtalevilkår').length,0);}
 });
}
test('RENTAL-MANUAL 202 other products and six non-rental manual controls preserve exact initial/repeat output',()=>{
 assert.equal(baseline.others.length,202);assert.equal(baseline.controls.length,6);for(const c of [...baseline.others,...baseline.controls]){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(withoutVacancy(first),c.first,c.id);const result=enrichExtractedAgreementWithCatalog({company:c.input.company,totalAnnualPremium:null,insurances:[first]},date).insurances[0];assert.deepEqual(withoutVacancy(result),withHouseCatalogOrigin(c.repeated,c.first),c.id);assert.equal(groupAddOnNames([result],c.input.products[0].type),c.display);}
 assert.equal(hash(serialize(withoutVacancy(productCatalog))),vacancyCatalogBaselineHash);
});
test('RENTAL-DOCUMENT all 144 frozen before cases differ only by the authorized document choice',()=>{
 assert.equal(baseline.documents.length,144);
 for(const c of baseline.documents){
  const expected=structuredClone(c.output),i=expected.insurances[0];
  const values=c.record.importantTerms.filter(t=>t.name==='Utleie'&&!t.canonicalKey).map(t=>t.value);
  const yes=values.includes('Valgt'),no=values.includes('Ikke valgt'),unknown=values.includes('Ukjent');
  const viaAddOn=!yes&&!no&&!unknown&&c.record.addOns.some(a=>a.name==='Utleie');
  const selected=Boolean(i&&!no&&(yes||viaAddOn));
  if(i&&selected){
   // Independent oracle: the already published five manual catalog rows and
   // catalog facts, not a snapshot taken from the new document implementation.
   const m=baseline.manual.find(m=>m.id===c.id).first;
   i.addOnIds=[addon];i.catalogFacts.push(...m.catalogFacts.filter(t=>keys.includes(t.key)));
   if(viaAddOn){
    const sources=structuredClone(i.documentSources);
    const index=i.importantTerms.findIndex(t=>t.coverageOrigin==='catalog');
    i.importantTerms.splice(index<0?i.importantTerms.length:index,0,{name:'Utleie',value:'Valgt',key:undefined,coverageOrigin:'document',sources});
    i.recordEvidence[0].importantTerms.push({name:'Utleie',value:'Valgt',canonicalKey:null,documentIndices:[1],coverageOrigin:'document',sources});
   }
   i.importantTerms.push(...rental(m));
  }
  const output=documentPipeline([[c.record]],c.side).insuranceData;
  assert.deepEqual(withoutVacancy(output),expected,`${c.id}/${c.side}/${c.role}/${values}/${c.record.addOns.length}`);
  assert.equal(groupAddOnNames(output.insurances,'Hus'),selected?'Utleie':null,c.id);
 }
});
