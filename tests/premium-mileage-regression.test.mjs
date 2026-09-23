import test from 'node:test';
import assert from 'node:assert/strict';
import {parseExtractionResponse,sanitizeAnalysisDocumentForClient} from '../lib/analysis-output.ts';
import {planExtractionBatches} from '../lib/analysis-batching.ts';
import {enrichBatch,mergeBatchResults} from '../lib/analysis-merge.ts';
import {createAnalysisTelemetry} from '../lib/analysis-telemetry.ts';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {vehiclePrices,vehiclePriceDifferences,differentVehiclePriceBasis} from '../lib/vehicle-price-presentation.ts';
import {createDifferences,groupInsurances,groupTerms} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
import {runHybridMatching} from '../lib/hybrid-matching.ts';
const fact=(name,canonicalKey,value)=>({name,canonicalKey,value});
const raw=(terms,extras={})=>({type:'Bil',productName:'Kasko',canonicalProductName:'Kasko',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms,...extras});
function pipeline(insurance,side='existing',company='Gjensidige') {
 const parsed=parseExtractionResponse({output_text:JSON.stringify({company,totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[insurance]})});
 const batch=planExtractionBatches([{side,documentIndex:0,text:'Synthetic insurance document',pages:1}])[0];
 const agreement=enrichBatch(parsed,batch,createAnalysisTelemetry('00000000-0000-0000-0000-000000000000'));
 return sanitizeAnalysisDocumentForClient(mergeBatchResults([{batch,agreement}],side,false));
}
const policy=d=>d.insuranceData.insurances[0];
const compare=(left,right)=>{const groups=groupInsurances(left.insuranceData.insurances,right.insuranceData.insurances,null);return {terms:groupTerms(groups[0],null),differences:presentImportantDifferences(createDifferences(left,right,groups,null),groups,null)};};
const priceTerms=(values)=>values.flatMap((value,i)=>value?[fact(['Forsikringspris','TFA','Totalt'][i],['premie.ekskl_tfa','premie.tfa','premie.total'][i],value)]:[]);
const prices=(values,side='existing',extras={})=>pipeline(raw(priceTerms(values),extras),side);
const mileage=(annual='20 000 km',limit='15 000 km',extras={})=>raw([
 fact('Årlig kjørelengde','kjoretoy.kjorelengde',annual),
 fact('Totalskadegaranti','nyverdi.grenser',`1 år / ${limit}`),
],{coverageSummary:`Totalskadegaranti 1 år årlig kjørelengde ${annual}`, ...extras});
for(const prefix of [false,true])test(`real extraction-like price pipeline, prefix currency ${prefix}`,()=>{
 const a=prices(prefix?['kr 12 457','kr 2 329','kr 14 786']:['12 457 kr','2 329 kr','14 786 kr']);
 const b=prices(['9 518 kr','3 270 kr','12 788 kr'],'offer',{productName:'Pluss – annet kjøretøy',canonicalProductName:'Pluss'});
 assert.equal(differentVehiclePriceBasis(policy(a),policy(b)),false);
 assert.deepEqual(vehiclePriceDifferences(policy(a),policy(b)).map(d=>d.deltaOre),[-293900,-199800]);
 const result=compare(a,b).differences.filter(d=>d.type==='price');assert.deepEqual(result.map(d=>d.title),['Forsikringspris','Totalt']);assert.match(result[0].text.replaceAll('\u00a0',' '),/2 939 kr billigere/);assert.match(result[1].text.replaceAll('\u00a0',' '),/1 998 kr billigere/);
 assert.equal(vehiclePrices(policy(a))[1].amount,232900);assert.equal(vehiclePrices(policy(b))[1].amount,327000);assert.ok(result.every(d=>!d.text.includes('Gjensidige')&&d.termKey!=='premie.tfa'));
});
for(const index of [0,2])test(`only matching price field ${index} is independently comparable`,()=>{
 const a=[null,null,null],b=[null,null,null];a[index]='kr 100';b[index]='90 kr';const left=policy(prices(a)),right=policy(prices(b,'offer'));assert.equal(differentVehiclePriceBasis(left,right),false);assert.equal(vehiclePriceDifferences(left,right).length,1);
});
test('exclusive versus inclusive remains incomparable',()=>{
 const a=policy(prices(['kr 100',null,null])),b=policy(prices([null,null,'90 kr'],'offer'));assert.equal(differentVehiclePriceBasis(a,b),true);assert.equal(vehiclePriceDifferences(a,b).length,0);
});
test('equivalent money formats do not create a false ambiguity; source values remain unchanged',()=>{
 const doc=pipeline(raw([...priceTerms(['kr 12 457',null,null]),fact('Forsikringspris','premie.ekskl_tfa','12\u00a0457 kr')]));const field=vehiclePrices(policy(doc))[0];assert.equal(field.amount,1245700);assert.match(field.value,/kr 12 457/);assert.match(field.value,/12\u00a0457 kr/);
});
for(const value of ['kr 12.457,50 per år','12\u202f457,50 kroner årlig'])test(`explicit annual money format ${value}`,()=>assert.equal(vehiclePrices(policy(prices([value,null,null])))[0].amount,1245750));
test('monthly amounts, arbitrary sentences and competing values remain conservative',()=>{
 for(const value of ['kr 100 per måned','Fra kr 100','kr 100–200'])assert.equal(vehiclePrices(policy(prices([value,null,null])))[0].amount,null);
 const a=pipeline(raw([...priceTerms(['kr 100',null,null]),fact('Forsikringspris','premie.ekskl_tfa','200 kr')]));assert.equal(vehiclePrices(policy(a))[0].amount,null);
});
test('non-vehicle price presentation unaffected',()=>assert.equal(vehiclePrices(policy(prices(['kr 100',null,null],'existing',{type:'Hus',productName:'Ukjent',canonicalProductName:null}))),null));
for(const [annual,limit] of [['20 000 km','15 000 km'],['25 000 km','12 000 km']])test(`pipeline isolates annual ${annual} from totalskade ${limit}`,()=>{
 const left=pipeline(mileage(annual,limit));const right=pipeline(raw([fact('Totalskadegaranti','nyverdi.grenser','3 år / 60 000 km')],{productName:'Pluss',canonicalProductName:'Pluss'}),'offer');
 const terms=policy(left).importantTerms;
 assert.deepEqual(terms.filter(t=>t.key==='nyverdi.km').map(t=>t.value),[limit]);assert.deepEqual(terms.filter(t=>t.key==='nyverdi.alder').map(t=>t.value),['1 år']);assert.equal(terms.find(t=>t.key==='kjoretoy.kjorelengde').value,annual);
 const result=compare(left,right);assert.equal(result.terms.find(t=>t.key==='nyverdi.km').first,limit);assert.equal(result.terms.find(t=>t.key==='nyverdi.km').second,'60 000 km');assert.equal(result.terms.find(t=>t.key==='nyverdi.alder').second,'3 år');
 const family=result.differences.find(d=>d.items?.some(i=>i.termKey==='nyverdi.km'));assert.ok(family);assert.ok(JSON.stringify(family).includes(limit));assert.ok(!JSON.stringify(family).includes(annual));
 assert.ok(terms.find(t=>t.key==='nyverdi.km').sources.some(s=>s.documentId==='pdf:existing:0'));
});
test('compound splitting stops before annual mileage rather than choosing its first km',()=>{
 const data=mileage();data.importantTerms[1].value='1 år, årlig kjørelengde 20 000 km';
 const terms=normalizeDocumentFacts(data);assert.ok(!terms.some(t=>t.key==='nyverdi.km'&&t.value==='20 000 km'));
});
test('explicit canonical limit beats secondary summary-derived conflicting limit',()=>{
 const data=mileage();data.importantTerms.push(fact('Totalskadegaranti kilometergrense','nyverdi.km','15 000 km'));data.coverageSummary='Totalskadegaranti 1 år / 20 000 km';
 assert.deepEqual(policy(pipeline(data)).importantTerms.filter(t=>t.key==='nyverdi.km').map(t=>t.value),['15 000 km']);
});
test('conflicting explicit document limits are preserved rather than first-wins',()=>{
 const data=raw([fact('Totalskadegaranti kilometergrense','nyverdi.km','15 000 km'),fact('Totalskadegaranti kilometergrense','nyverdi.km','12 000 km')]);assert.equal(policy(pipeline(data)).importantTerms.filter(t=>t.key==='nyverdi.km').length,2);
});
const kmFields=[['Kilometerstand','kjoretoy.kilometerstand'],['Årlig kjørelengde','kjoretoy.kjorelengde'],['Avtalt maksimal kilometerstand','kjoretoy.avtalt_maks_kilometerstand'],['Maskinskade kilometergrense','maskinskade.km'],['Totalskadegaranti kilometergrense','nyverdi.km']];
test('five kilometre identities survive deduplication even with identical numerical values',()=>{
 const terms=normalizeDocumentFacts(raw(kmFields.map(([name,key])=>fact(name,key,'42 000 km'))));assert.deepEqual(terms.map(t=>t.key),kmFields.map(([,key])=>key));
});
test('precise annual-mileage label repairs a wrong extraction nyverdi canonicalKey',()=>{
 const data=raw([fact('Årlig kjørelengde','nyverdi.km','20 000 km'),fact('Totalskadegaranti','nyverdi.grenser','1 år / 15 000 km')]);const terms=policy(pipeline(data)).importantTerms;assert.equal(terms.find(t=>t.key==='kjoretoy.kjorelengde').value,'20 000 km');assert.deepEqual(terms.filter(t=>t.key==='nyverdi.km').map(t=>t.value),['15 000 km']);
});
test('semantic matcher cannot merge any two distinct canonical kilometre fields',async()=>{
 for(let i=0;i<kmFields.length;i++)for(let j=i+1;j<kmFields.length;j++){
  const make=([name,key])=>({...raw([]),importantTerms:[{name,key,value:'42 000 km'}]});let calls=0;
  const plan=await runHybridMatching([make(kmFields[i])],[make(kmFields[j])],async()=>{calls++;return {decisions:[]};});assert.equal(calls,0);assert.equal(plan.termMatches.length,0);
 }
});
test('document limit overrides catalog for another provider without hardcoded values',()=>{
 const terms=policy(pipeline(mileage('25 000 km','12 000 km'),'existing','Tryg')).importantTerms;assert.deepEqual(terms.filter(t=>t.key==='nyverdi.km').map(t=>t.value),['12 000 km']);
});
test('a conflicting explicit compound and explicit single-field limit both survive',()=>{
 const data=raw([fact('Totalskadegaranti','nyverdi.grenser','1 år / 15 000 km'),fact('Totalskadegaranti kilometergrense','nyverdi.km','12 000 km')]);
 assert.deepEqual(new Set(normalizeDocumentFacts(data).filter(t=>t.key==='nyverdi.km').map(t=>t.value)),new Set(['12 000 km','15 000 km']));
});
test('unknown structured limit does not suppress a documented summary limit',()=>{
 const data=raw([fact('Totalskadegaranti kilometergrense','nyverdi.km','Ikke dokumentert')],{coverageSummary:'Totalskadegaranti 1 år / 15 000 km'});
 assert.ok(normalizeDocumentFacts(data).some(t=>t.key==='nyverdi.km'&&t.value==='15 000 km'));
});
