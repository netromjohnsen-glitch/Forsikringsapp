import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, availableAddOns, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { product, facts, fact, sourceHash, date, enrich, documentPriority } from './helpers/wave3-catalog-gate.mjs';
const ids=['frende-snoscooter-ansvar','frende-snoscooter-brann-og-tyveri','frende-snoscooter-kasko'];
const pdf='vehicle:frende-SnowmobileInsurance.pdf';
const signatures=['fa3581f9defadf0b','f0d110910d5859b9','ac48d828094ddf9a','2b8d431fd65ef46d','8f6487d71037dfc1','e633eb477c89e02d','ef7193d2d75ff0db','e0c4e8b70c0c8f53','9f39e4d8dadf6e44','ee338e4266bd5646','565b29a45f07c725','413eaf449d1ff4e3','e9c5a56d1ec07795'];
const oracle=[
 ['GAP-0099',ids,'rettshjelp.grense',12,['100 000 kr per tvist','250 000 kr','minst tre parter']],
 ['GAP-0106',ids,'ulykke.grense',10,['100 000 kr hvis','ektefelle, samboer eller barn','under 21 år','200 000 kr','100 % livsvarig medisinsk invaliditet']],
 ['GAP-1644',ids,'rettshjelp.dekning',11,['privatkunder','personlig eier, rettmessig bruker eller fører','salg','kjøp av nytt','Voldgift']],
 ['GAP-1645',ids,'rettshjelp.begrensning',12,['egen advokat','sakkyndige','vitner','Ikke ankegebyr','idømte','sameiere','yrke/virksomhet','straffesak','fullt utnyttet klageadgang','før forsikringen']],
 ['GAP-1646',ids,'rettshjelp.grense',12,['økonomiske interessen','Uforsikrede parter']],
 ['GAP-1647',ids,'rettshjelp.egenandel',13,['4 000 kr pluss 20 % av øvrige kostnader','én egenandel per tvist']],
 ['GAP-1650',ids,'ansvar.dekning',11,['bilansvarslova','ulovfestet','konstatert i forsikringstiden','10 000 000 kr per skadetilfelle og samlet per år','vegfraktavtaler']],
 ['GAP-1651',ids,'ulykke.dekning',10,['Tilvalg på Ansvar, Brann og tyveri og Kasko','valgt bare når dekningen står i kundens forsikringsbevis']],
 ['GAP-1664',ids.slice(1),'brann.begrensning',3,['Svimerker','delen eller komponenten','kortslutning','følgeskaden']],
 ['GAP-1665',ids.slice(1),'tyveri.begrensning',3,['husstandsmedlem eller ansatt','lånt eller prøvd','ikke levert tilbake']],
 ['GAP-1683',ids.slice(1),'tyveri.egenandel',9,['6 000 kr','lavere egenandel','ingen egenandel hvis tyverialarmen fungerte på skadetidspunktet']],
 ['GAP-1700',[ids[2]],'kasko.dekning',3,['Plutselig og uforutsett','sammenstøt, utforkjøring, velt og hærverk','feilfylling','relevant for det forsikrede objektet']],
 ['GAP-1701',[ids[2]],'kasko.begrensning',4,['Motor, gir, drivverk og elektroniske styreenheter','annen dekket skade','frost, fukt, vann, råte','innvendige flekker','rust/slitasje','underslag','regress']],
];
function own(id,key){return resolveCatalogFacts(product(id),key.startsWith('ulykke.')?['frende-snoscooter-ulykke']:[],date).find(f=>f.key==='snoscooter.'+key);}
for(const [gap,products,key,page,values]of oracle)test(`R-044-${gap}: exact source-backed dimensions`,()=>{
 for(const id of products){const f=own(id,key);assert.ok(f);assert.equal(f.source.documentId,pdf);assert.equal(f.source.page,page);assert.equal(f.source.effectiveFrom,'2026-01-01');for(const v of values)assert.ok(f.value.includes(v),`${gap}/${id}: ${v}`);}
});
test('R-044-SOURCE: frozen originals and all 13 signatures / 32 bindings',()=>{
 for(const [file,hash]of [['frende-SnowmobileInsurance.pdf','088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88'],['frende-snoscooterforsikring.html','98b6524f45c3e671e39e60c82ba8318314583a6aafd4e2e96bf3dec0605f26c3'],['frende-Generelle_vilkår-01012026.pdf','7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b']])sourceHash('catalog/sources/vehicle-extensions/'+file,hash);
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-044');assert.equal(b.signature_ids.length,13);assert.equal(signatures.length,13);assert.equal(new Set(b.signature_ids).size,13);assert.equal(new Set(signatures).size,13);assert.deepEqual([...b.signature_ids].sort(),[...signatures].sort());assert.equal(b.evidence.reduce((n,e)=>n+e.finding_ids.length,0),32);
});
test('R-044-LEVEL: all three levels, conditional benefits and no downward leakage',()=>{
 for(const id of ids){assert.equal(availableAddOns(product(id),date).filter(a=>a.id==='frende-snoscooter-ulykke').length,1);assert.ok(facts(id).every(f=>!f.key.startsWith('snoscooter.ulykke.')));
 assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);
 const m=materializeCatalogProduct(product(id));assert.ok(m.facts.filter(f=>f.key.startsWith('snoscooter.ulykke.')).every(f=>f.state==='optional'));
 assert.equal(fact(id,'snoscooter.avtale.geografi').value,'Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden');
 if(id===ids[0])assert.ok(facts(id).every(f=>!/^snoscooter\.(brann|tyveri|kasko)\./.test(f.key)));
 else assert.equal(fact(id,'snoscooter.brann.egenandel').value,'6 000 kr med mindre lavere egenandel står i kundens forsikringsbevis');
 if(id!==ids[2])assert.ok(facts(id).every(f=>!f.key.startsWith('snoscooter.kasko.')));
 }
});
test('R-044-COMPARE: same product and both cross-tier directions',()=>{
 for(const a of ids)for(const b of ids){const x=compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);const y=compareCatalogProducts(product(b),product(a)).sections.flatMap(s=>s.rows);
 for(const r of x){const rev=y.find(t=>t.key===r.key);assert.ok(rev);assert.deepEqual(r.first,rev.second);assert.deepEqual(r.second,rev.first);if(a===b)assert.equal(r.different,false);}
 assert.equal(x.find(r=>r.key==='snoscooter.ulykke.dekning').first.state,'optional');
 }
});
test('R-044-CUSTOMER: silence, explicit selection and rejection retain document priority',()=>{
 for(const id of ids){for(const [value,status]of [[null,'unknown'],['Valgt','selected'],['Ikke valgt','not_selected']]){
 const out=enrich(id,value?[{name:'Fører- og passasjerulykke',canonicalKey:'snoscooter.ulykke.dekning',value}]:[]);
 assert.equal(canonicalCoverage(out,'Snøscooter','snoscooter.ulykke.dekning').status,status);
 }documentPriority(id,'snoscooter.rettshjelp.grense','Kundens dokumenterte sum 17 777 kr');}
});
// TEST_FIXTURE_SEMANTIC_CORRECTION: terms benefits and certificate rows
// have distinct roles at the actual document pipeline boundary.
test('R-044-CUSTOMER-CHILD: role-precise terms, certificate, rejection and conflict',()=>{
 const child={name:'Fører- og passasjerulykke – forsikringssum',canonicalKey:'snoscooter.ulykke.grense',value:'100 000 kr'};
 const parent=value=>({name:'Fører- og passasjerulykke',canonicalKey:'snoscooter.ulykke.dekning',value});
 for(const name of ['Ansvar','Brann og tyveri','Kasko']){
  const record=(documentRole,importantTerms=[])=>({company:'Frende',type:'Snøscooter',productName:name,canonicalProductName:name,agreementScope:'ordinary',documentRole,agreementPeriod:null,objectIdentifiers:[],annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms});
  const terms=record('general_terms',[{...child,value:'Dødsfall 100 000 kr hvis avdøde etterlater ektefelle, samboer eller barn, eller er under 21 år. 200 000 kr ved 100 % livsvarig medisinsk invaliditet'}]);
  assert.equal(documentPipeline([[terms]]).insuranceData.insurances.length,0);
  for(const [scenario,docs,expected,conflict] of [
   ['silent',[[record('individual_agreement')]],'unknown',false],
   ['same-PDF terms',[[record('individual_agreement'),terms]],'unknown',false],
   ['separate-PDF terms',[[record('individual_agreement')],[terms]],'unknown',false],
   ['individual certificate child',[[record('individual_agreement',[child])]],'selected',false],
   ['explicit rejection and positive child',[[record('individual_agreement',[parent('Ikke valgt'),child])]],'not_selected',false],
   ['explicit parent conflict',[[record('individual_agreement',[parent('Valgt'),parent('Ikke valgt')])]],'unknown',true],
  ]){
   const out=documentPipeline(docs);assert.equal(out.insuranceData.insurances.length,1);
   const insurance=out.insuranceData.insurances[0];const coverage=canonicalCoverage(insurance,'Snøscooter','snoscooter.ulykke.dekning');
   assert.equal(coverage.status,expected,`${name}/${scenario}`);assert.equal(coverage.conflict,conflict,`${name}/${scenario}`);
   if(scenario.endsWith('terms')){
    assert.ok(insurance.importantTerms.every(t=>!t.key?.startsWith('snoscooter.ulykke.')));
    assert.deepEqual(insurance.addOnIds,[]);
    assert.ok(out.insuranceData.supportingEvidence.length>0);
   }
   if(scenario==='individual certificate child'){
    assert.ok(coverage.evidence.some(e=>e.origin==='document'));
    assert.equal(insurance.importantTerms.find(t=>t.key==='snoscooter.ulykke.grense').value,'100 000 kr');
   }
  }
 }
});

// §14.3(5): preserve the insured's debtor capacity, never a blanket exclusion.
test('R-044-DEBTOR: 2b8d431fd65ef46d and GAP-1645/1661/1689 retain qualification',()=>{
 for(const id of ids){
  const f=own(id,'rettshjelp.begrensning');
  assert.equal(f.key,'snoscooter.rettshjelp.begrensning');
  assert.equal(f.source.documentId,pdf);assert.equal(f.source.page,12);
  assert.equal(f.source.section,'14.2–14.3');
  assert.match(f.value,/konkurs-\/akkordforhandling når du er konkurs- eller akkordskyldner/);
  assert.ok(!f.value.includes('gjeldsforhandling/konkurs/akkord'));
  assert.ok(f.value.includes('ubestridt inkasso, gjeldsforhandling'));
 }
});

test('R-044-PROVENANCE: six availability bindings retain PDF terms and HTML matrix',()=>{
 const html='vehicle:frende-snoscooterforsikring.html';
 for(const id of ids){
  const f=own(id,'ulykke.dekning');
  assert.equal(resolveCatalogFacts(product(id),['frende-snoscooter-ulykke'],date).filter(t=>t.key===f.key).length,1);
  assert.equal(f.source.documentId,pdf);assert.equal(f.source.page,10);
  assert.equal(f.source.effectiveFrom,'2026-01-01');
  assert.equal(f.qualificationSource.documentId,html);
  assert.equal(f.qualificationSource.filename,'frende-snoscooterforsikring.html');
  assert.equal(f.qualificationSource.url,'https://www.frende.no/forsikringer/snoscooterforsikring/');
  assert.equal(f.qualificationSource.effectiveFrom,'');
  assert.equal(f.qualificationSource.termsNumber,'');
  assert.match(f.qualificationSource.section,/Fører- og passasjerulykke.*Tilvalg.*Ansvar.*Brann og tyveri.*Kasko/);
  assert.equal(materializeCatalogProduct(product(id)).facts.find(t=>t.key===f.key).state,'optional');
  assert.ok(f.value.includes('valgt bare når dekningen står i kundens forsikringsbevis'));
  assert.equal(own(id,'ulykke.grense').source.documentId,pdf);
  assert.equal(own(id,'ulykke.grense').qualificationSource,undefined);
 }
});
