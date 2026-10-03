import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {boatPetKeyApplies} from '../lib/boat-pet-registry.ts';
import {product, date, sourceHash, enrich, manual} from './helpers/wave3-catalog-gate.mjs';

// RC-017 / SCRC-016: only the seven approved ordinary Frende Katt dimensions.
// SC-011/SR-016 (disappearance) is deliberately not resolved by this batch.
const id='frende-katt-veterin-r', medicine='frende-katt-medisin', tap='frende-katt-tap';
const source='boat-pet:frende:katt', hash='5c7791b59cf84da6ef475020f997bac1cc13a865777bdc791b2c3f7ba4b4fe6b';
const signatures=['2c52ff8347425c2c','7a088e05e1aa0910','84e7bbb2344c5c60','b7c3a54f2c64bec8','c6bb0db2c504cd74','cab46e5f569b7815','db74949bd00f107b'];
const rows=(selected=[])=>resolveCatalogFacts(product(id),selected,date);
const own=(key,component='')=>{const f=rows(component?[component]:[]).find(f=>f.key===key);assert.ok(f,key);return f;};
const term=(key,value)=>({name:own(key,[medicine,tap].find(c=>productCatalog.facts[c].some(f=>f.key===key))).label,canonicalKey:key,value});
// Independent oracle from full terms §§4–7, not another species' wording.
const oracle=[
 ['GAP-1286','SF-1905','','dyr.veterinar.dekning',2,'4.1.1',['Rimelige og nødvendige','syk eller skadet katt','medisiner og materiell som veterinæren bruker','dyrehospital/-klinikk']],
 ['GAP-1287','SF-1906','','dyr.allergi.grense',2,'4.1.2 og 4.2.4',['15 000 kr','førstegangsdiagnostisering','allergi/atopi','øre- eller hudlidelser','før kjøp eller innen 20 dager','Antistoffer i blodprøve','før tre måneder','påbegynt før forsikringen']],
 ['GAP-1291','SF-1910','','dyr.veterinar.begrensning',2,'4.2.1–3, 5–7 og 9',['forebyggende','rehabilitering','reiser, fôr','foreskrevne/utleverte medisiner','forbindingsmateriell','alternativ','adferdsforstyrrelser/unormalt temperament','komplikasjoner','trekking av tenner knekt ved ulykke','etter at katten ikke lenger er forsikret','selv om sykdom/skade inntraff']],
 ['GAP-1292','SF-1911','','dyr.karenstid.sykdom',2,'4.2.8',['20 dager','opprinnelig kjøp i Frende eller tidligere selskap','eksisterende sykdom eller skade','karens bare økningen']],
 ['GAP-1293','SF-1912',medicine,'dyr.medisin.dekning',3,'5 Medisinutgifter',['Valgfri dekning når oppført i forsikringsbeviset','rimelige og nødvendige','reseptbelagte medisiner','omfattes av punkt 4','50 % av veterinærforeskrevet spesialfôr','20 000 kr per skadetilfelle og samlet per forsikringsår']],
 ['GAP-1294','SF-1913','','dyr.veterinar.sum.valgbar',3,'7.4 Forsikringssum',['alle veterinærutgifter og alle medisinutgifter per skadetilfelle','begrenset til forsikringssummen i forsikringsbeviset','samme skadetilfelle','over flere forsikringsår']],
 ['GAP-1295','SF-1916',tap,'dyr.liv.begrensning',3,'6.2',['sykdom/skade ved kjøp i Frende eller tidligere selskap','oppstår innen 20 dager','sumøkning bare økningen','Avliving etter komplikasjoner','behandling og operative inngrep som ikke omfattes']],
];

test('R-041-01: original hash, official dated full terms and seven exact bindings',async()=>{
 sourceHash('catalog/sources/boat-pet/frende-cat-terms.pdf',hash);
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-041');
 assert.deepEqual(b.signature_ids,signatures);assert.equal(b.P2_piggyback_count,0);assert.deepEqual(b.dependencies,[]);
 assert.deepEqual(b.root_cause_ids,['RC-017']);assert.deepEqual(b.original_root_cause_ids,['SCRC-016']);assert.deepEqual(b.canonical_review_ids,[]);
 assert.deepEqual(b.evidence.map(e=>[e.finding_id,e.source_fact_id,e.component]),oracle.map(e=>e.slice(0,3)));
 for(const e of b.evidence){assert.equal(e.sha256,hash);assert.equal(e.product_identity,JSON.stringify(['frende','katt','ordinary',id,'2026-01-01']));}
 const s=productCatalog.sources[source];assert.equal(s.sha256,hash);assert.equal(s.sourceType,'full_terms');assert.equal(s.providerId,'frende');assert.equal(s.insuranceType,'Katt');
 assert.equal(s.url,'https://www.frende.no/forsikringer/katteforsikring/');
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/boat-pet/frende-cat-terms.pdf',import.meta.url))});
 try{const pdf=await parser.getText();assert.equal(pdf.total,4);const text=pdf.text.replace(/\s+/g,' ');
  assert.match(text,/Vilkår av 01\. januar 2026/);
  assert.match(text,/20 000 kroner per skadetilfelle og samlet per forsikringsår/);
  assert.match(text,/alle veterinærutgifter og alle medisinutgifter per skadetilfelle/);
  assert.match(text,/ett og samme skadetilfelle påfører deg veterinærutgifter over flere forsikringsår/);
 }finally{await parser.destroy();}
});
for(const [gap,sf,component,key,page,section,values] of oracle)test(`R-041-${gap}/${sf}: exact subject, qualification and own-source provenance`,()=>{
 const f=own(key,component);for(const value of values)assert.ok(f.value.includes(value),`${gap}: ${value}`);
 assert.equal(f.source.documentId,source);assert.equal(f.source.filename,'frende-cat-terms.pdf');assert.equal(f.source.company,'Frende');
 assert.equal(f.source.termsNumber,'Katteforsikring');assert.equal(f.source.version,'2026-01-01');assert.equal(f.source.effectiveFrom,'2026-01-01');
 assert.equal(f.source.agreementScope,'ordinary');assert.equal(f.source.page,page);assert.equal(f.source.section,section);
 assert.equal(boatPetKeyApplies('katt',key),true);assert.equal(rows([medicine,tap]).filter(f=>f.key===key).length,1);
});
test('R-041-09: separate clinical medicines, dispensed prescription medicines and tooth exception',()=>{
 assert.match(own('dyr.veterinar.dekning').value,/medisiner og materiell som veterinæren bruker/);
 assert.match(own('dyr.veterinar.begrensning').value,/foreskrevne\/utleverte medisiner/);
 assert.match(own('dyr.veterinar.begrensning').value,/trekking av tenner knekt ved ulykke/);
 assert.match(own('dyr.medisin.dekning',medicine).value,/omfattes av punkt 4;/);
 assert.doesNotMatch(own('dyr.medisin.dekning',medicine).value,/punkt 4 og 5|tannsykdom/);
 assert.doesNotMatch(own('dyr.veterinar.begrensning').value,/raseunntak|4\.2\.7–9/);
 assert.doesNotMatch(own('dyr.liv.begrensning',tap).value,/adferds|temperament/);
});
test('R-041-10: joint per-claim ceiling spans policy years; medicine annual sublimit stays separate',()=>{
 const sum=own('dyr.veterinar.sum.valgbar').value;
 assert.match(sum,/veterinærutgifter og alle medisinutgifter per skadetilfelle/);
 assert.match(sum,/samme skadetilfelle.*over flere forsikringsår/);
 assert.doesNotMatch(sum,/samlet per forsikringsår|20 000|50 000/);
 assert.match(own('dyr.medisin.dekning',medicine).value,/20 000 kr per skadetilfelle og samlet per forsikringsår/);
});
test('R-041-11: none, medicine, Tap and both; no cross-species or inferred Bruksverdi',()=>{
 assert.deepEqual(availableAddOns(product(id),date).map(a=>a.id),[medicine,tap]);
 for(const selected of [[],[medicine],[tap],[medicine,tap]]){
  const f=rows(selected);assert.equal(f.some(f=>f.key==='dyr.medisin.dekning'),selected.includes(medicine));
  assert.equal(f.some(f=>f.key==='dyr.liv.dekning'),selected.includes(tap));
  assert.equal(f.some(f=>/bruksverdi|tannsykdom/.test(f.key)),false);
  for(const key of ['dyr.veterinar.dekning','dyr.veterinar.begrensning','dyr.karenstid.sykdom'])assert.equal(f.filter(f=>f.key===key).length,1);
 }
 assert.throws(()=>rows(['frende-hund-tap']));
});
test('R-041-12: optional availability is unknown for silent customers; selection and rejection distinct',()=>{
 const silent=manual(id);assert.deepEqual(silent.addOnIds,[]);
 for(const [addon,key] of [[medicine,'dyr.medisin.dekning'],[tap,'dyr.liv.dekning']]){
  assert.equal(canonicalCoverage(silent,'Katt',key).status,'unknown');
  const selected=normalizeManualAgreement({company:'Frende',totalAnnualPremium:'',products:[{type:'Katt',productName:'Veterinær',agreementScope:'ordinary',annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:[addon]}]}).insuranceData.insurances[0];
  assert.equal(canonicalCoverage(selected,'Katt',key).status,'selected');
  const rejected=enrich(id,[term(key,'Ikke valgt')]);assert.deepEqual(rejected.addOnIds,[]);assert.equal(canonicalCoverage(rejected,'Katt',key).status,'not_selected');
 }
 assert.equal(canonicalCoverage(silent,'Katt','dyr.veterinar.dekning').status,'selected');
});
test('R-041-13: document overrides every scoped dimension, retaining identity and origin',()=>{
 for(const [,,component,key] of oracle){
  const parent=component===medicine?'dyr.medisin.dekning':component===tap?'dyr.liv.dekning':null;
  const value=key===parent?'Valgt etter kundens forsikringsbevis':'Dokumentert kundevilkår 7 777 kr';
  const terms=[...(parent&&parent!==key?[term(parent,'Valgt')]:[]),term(key,value)];
  const out=enrich(id,terms);const actual=out.importantTerms.find(t=>t.key===key);assert.ok(actual,key);
  assert.equal(actual.value,value);assert.equal(actual.coverageOrigin,'document');
  assert.equal(normalizeDocumentFacts({type:'Katt',importantTerms:[term(key,value)]}).find(t=>t.key===key).value,value);
  assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
 }
});
test('R-041-14: same product and both directions preserve facts, sources and optional boundaries',()=>{
 for(const peer of [id,'if-katt-standard','gjensidige-katt-behandling','sparebank1-fremtind-katt-veterin-r']){
  const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows);
  const b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const r of a){const reverse=b.find(s=>s.key===r.key);assert.ok(reverse,r.key);assert.deepEqual(r.first,reverse.second);assert.deepEqual(r.second,reverse.first);if(peer===id)assert.equal(r.different,false);}
  for(const [,,component,key] of oracle)assert.equal(a.find(r=>r.key===key).first.state,component?'optional':'included',key);
 }
});
test('R-041-15: exact provider, species, ordinary scope and version; no unrelated source leakage',()=>{
 assert.equal(findCatalogProduct('frende',id,'2026-01-01',{insuranceType:'Katt',agreementScope:'ordinary'}),product(id));
 for(const options of [{insuranceType:'Hund'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-01-01',options),null);
 assert.equal(findCatalogProduct('if',id,'2026-01-01'),null);assert.equal(findCatalogProduct('frende',id,'unknown'),null);
 for(const other of productCatalog.products.filter(p=>p.productId!==id))assert.equal(availableAddOns(other,date).some(a=>[medicine,tap].includes(a.id)),false);
 for(const [component,facts] of Object.entries(productCatalog.facts))if(![id,medicine,tap].includes(component))assert.ok(facts.every(f=>f.source.documentId!==source),component);
});
test('R-041-16: PC-0575–0578 preserve customer sums, minimum deductible, renewal expiry and admin exclusion',()=>{
 const controls=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv',import.meta.url),'utf8');
 for(let pc=575;pc<=578;pc++)assert.ok(controls.includes(`PC-0${pc},AUDITED_POSITIVE,frende`));
 const sum=own('dyr.veterinar.sum.valgbar');assert.match(sum.value,/forsikringsbeviset/);assert.doesNotMatch(sum.value,/50 000/);
 assert.equal(own('dyr.veterinar.egenandel.fast').value,'Minst 1 000 kr per skadetilfelle');assert.equal(own('dyr.veterinar.egenandel.fast').deductibleClassification,'reference');
 assert.equal(own('dyr.veterinar.egenandel.prosent').value,'25 % av skaden');assert.equal(own('dyr.veterinar.egenandel.prosent').deductibleClassification,'coverage');
 assert.equal(own('dyr.liv.opphor',tap).value,'Første hovedforfall etter 10 år');
 assert.equal(rows([medicine,tap]).some(f=>/skademelding|obduksjon|frister/.test(f.key)),false);
});
test('R-041-17: existing Katt addon and Hund selection-evidence contracts retained',()=>{
 for(const addon of [medicine,tap]){const a=productCatalog.addOns.find(a=>a.id===addon);assert.equal(a.requiresAddOnIds,undefined);assert.equal(a.selectionEvidenceKeys,undefined);assert.deepEqual(a.requiresLevel,[id]);}
 assert.deepEqual(productCatalog.addOns.find(a=>a.id==='frende-hund-tap').selectionEvidenceKeys,['dyr.liv.dekning']);
 assert.equal(productCatalog.addOns.some(a=>a.id==='frende-hund-bruksverdi'),false);
 assert.equal(own('dyr.liv.forsvinning',tap).value,'Inkludert i valgt Tap-dekning');
});
