import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { boatPetKeyApplies } from '../lib/boat-pet-registry.ts';
import { product, date, sourceHash } from './helpers/wave3-catalog-gate.mjs';

const id='frende-hund-veterin-r',tap='frende-hund-tap',medicine='frende-hund-medisin',teeth='frende-hund-tann';
const source='boat-pet:frende:hund',hash='6d052e5092d9f92050dcf95a92fa6ce5deda18a5825cdd00ca1c8cd2658c9135';
const signatures=['3597f856a3fb5815','465f854472b3e82d','6769d0c49d81c59e','6dee3fb49b27e4ab','762b45ea101b5d72','82af4c244eb8d5e8','8810f07d993309b5','8e878578ee08aa62','9132251c30eb3313','c391a4fab217f172','f0246801936a9092'];
const facts=(addOns=[])=>resolveCatalogFacts(product(id),addOns,date);
const own=(key,component='')=>{const f=facts(component?[component]:[]).find(f=>f.key===key);assert.ok(f,key);return f;};
// Independent source oracle: exact Hund clauses, not the Cat paraphrase or another provider.
const oracle=[
 ['GAP-1257','SF-1872','','dyr.veterinar.dekning',2,'4.1.1',['Rimelige og nødvendige','syk eller skadet hund','medisiner og materiell som veterinæren bruker','dyrehospital/-klinikk']],
 ['GAP-1258','SF-1873','','dyr.allergi.grense',2,'4.1.4 og 4.2.4 (fortsatt side 3)',['15 000 kr','førstegangsdiagnostisering','allergi/atopi','øre- eller hudlidelser','før kjøp eller innen 20 dager','Antistoffer','før tre måneder','påbegynt før forsikringen']],
 ['GAP-1262','SF-1877','','dyr.veterinar.begrensning',2,'4.2.1–3, 5–10 og 12 (fortsatt side 3)',['forebyggende','rehabilitering','reiser, fôr','foreskrevne/utleverte medisiner','forbindingsmateriell','alternativ','adferdsforstyrrelser','komplikasjoner','Behandling etter at hunden ikke lenger er forsikret','selv om sykdom/skade inntraff']],
 ['GAP-1263','SF-1878','','dyr.karenstid.sykdom',3,'4.2.11',['20 dager','opprinnelig kjøp','tidligere selskap','eksisterende sykdom eller skade','karens bare økningen']],
 ['GAP-1268','SF-1883',teeth,'dyr.tannsykdom.dekning',3,'5.1',['Valgfri dekning når oppført i forsikringsbeviset','tann- og tannkjøttsykdommer','medisiner/materiell veterinæren bruker','klinikkopphold','tilbakeholdte melketenner','medisinsk nødvendig retting av tannstillingsfeil']],
 ['GAP-1269','SF-1884',teeth,'dyr.tannsykdom.begrensning',3,'5.2',['forebyggende','rehabilitering','reiser, fôr','foreskrevne/utleverte','Eksisterende sykdom/skade','tidligere selskap','20 dager','sumøkning bare økningen','mer enn ett år etter opphør']],
 ['GAP-1270','SF-1885',medicine,'dyr.medisin.dekning',3,'6 Medisinutgifter',['Valgfri dekning når oppført i forsikringsbeviset','reseptbelagte medisiner','omfattes av punkt 4 og 5','50 %','veterinærforeskrevet spesialfôr','20 000 kr per skadetilfelle og samlet per forsikringsår']],
 ['GAP-1271','SF-1886','','dyr.veterinar.sum.valgbar',4,'8.4, jf. 4.1 side 2',['Per skadetilfelle og samlet per forsikringsår','faktisk sum står i forsikringsbeviset','veterinærutgifter og medisinutgifter','begrenset til bevisets sum','samme skadetilfelle','over flere forsikringsår']],
 ['GAP-1272','SF-1888',tap,'dyr.liv.dekning',3,'7.1 (fortsatt side 4)',['Valgfri dekning når oppført i forsikringsbeviset','dør eller avlives av dyrevernhensyn','ulykke/sykdom','stjålet eller forsvinner','helt taper bruksegenskaper','ferdig trent','regelmessig brukt']],
 ['GAP-1273','SF-1889',tap,'dyr.liv.begrensning',4,'7.2',['sykdom/skade ved kjøp','tidligere selskap','20 dager','sumøkning bare økningen','adferdsforstyrrelser/unormalt temperament','komplikasjoner','operative inngrep som ikke omfattes']],
 ['GAP-1277','SF-1894',tap,'hund.bruksverdi.grense',4,'8.4 Forsikringssum',['50 %','forsikringssummen','forsikringsbeviset for Tap av hunden','trekkes fra senere dødsfallserstatning']],
];
for(const [gap,,component,key,page,section,values] of oracle)test(`R-038-${gap}: source-bound subject, period and conditions`,()=>{
 const f=own(key,component);assert.equal(f.source.documentId,source);assert.equal(f.source.page,page);assert.equal(f.source.section,section);
 assert.equal(f.source.company,'Frende');assert.equal(f.source.filename,'frende-dog-terms.pdf');assert.equal(f.source.agreementScope,'ordinary');
 assert.equal(f.source.version,'2026-01-01');assert.equal(f.source.effectiveFrom,'2026-01-01');assert.equal(f.source.termsNumber,'Hundeforsikring');
 assert.equal(f.source.url,'https://www.frende.no/forsikringer/hundeforsikring/');
 for(const value of values)assert.ok(f.value.includes(value),`${gap}: ${value}`);
 assert.ok(boatPetKeyApplies('hund',key));
});
test('R-038-SOURCE: original SHA-256, exact 11 signatures/bindings and dependency',()=>{
 sourceHash('catalog/sources/boat-pet/frende-dog-terms.pdf',hash);assert.equal(productCatalog.sources[source].sha256,hash);
 assert.equal(productCatalog.sources[source].sourceType,'full_terms');
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-038');
 assert.deepEqual(b.signature_ids,signatures);assert.deepEqual(b.dependencies,['B-018']);assert.equal(b.P2_piggyback_count,0);
 assert.equal(b.evidence.length,11);
 for(const [i,e] of b.evidence.entries()){
  assert.equal(e.finding_id,oracle[i][0]);assert.equal(e.source_fact_id,oracle[i][1]);assert.equal(e.sha256,hash);
  assert.deepEqual(e.product_identities,['["frende","hund","ordinary","frende-hund-veterin-r","2026-01-01"]']);
 }
});
test('R-038-LIMITS: tooth limit, joint veterinary/medicine sum and distinct expiry rules',()=>{
 assert.equal(own('dyr.tannsykdom.grense',teeth).value,'Inntil 20 000 kr per skadetilfelle og samlet per forsikringsår');
 assert.equal(own('dyr.tannsykdom.grense',teeth).source.section,'5.1');
 assert.ok(!own('dyr.veterinar.begrensning').value.includes('ett år etter opphør'));
 assert.ok(own('dyr.tannsykdom.begrensning',teeth).value.includes('ett år etter opphør'));
 assert.doesNotMatch(own('dyr.veterinar.sum.valgbar').value,/reset|nye 20 000/u);
});
const term=(canonicalKey,value)=>({name:canonicalKey,canonicalKey,value});
const enrich=(terms=[])=>enrichExtractedAgreementWithCatalog({company:'Frende',totalAnnualPremium:null,insurances:[{
 type:'Hund',company:'Frende',productName:'Veterinær',agreementScope:'ordinary',annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[],
}]},date).insurances[0];
const optional=[[medicine,'dyr.medisin.dekning'],[teeth,'dyr.tannsykdom.dekning'],[tap,'dyr.liv.dekning']];
for(const [component,key] of optional)test(`R-038-OPTIONAL-${component}: availability, explicit choice and rejection`,()=>{
 const silent=enrich();assert.equal(silent.addOnIds.length,0);assert.equal(canonicalCoverage(silent,'Hund',key).status,'unknown');
 for(const [value,status,selected] of [['Valgt','selected',true],['Ikke valgt','not_selected',false],['Ikke dokumentert','unknown',false]]){
  const out=enrich([term(key,value)]);assert.equal(out.addOnIds.includes(component),selected);assert.equal(canonicalCoverage(out,'Hund',key).status,status);
  assert.equal(out.importantTerms.find(t=>t.key===key).coverageOrigin,'document');
 }
});
test('R-038-SELECTION: all optional combinations remain exact, base has no add-on facts',()=>{
 const allowed=[medicine,teeth,tap];assert.deepEqual(availableAddOns(product(id),date).map(a=>a.id).sort(),[...allowed].sort());
 for(let mask=0;mask<8;mask++){
  const chosen=allowed.filter((_,i)=>mask&(1<<i));const rows=facts(chosen);assert.equal(new Set(rows.map(f=>f.key)).size,rows.length);
  for(const [component,key] of optional)assert.equal(rows.some(f=>f.key===key),chosen.includes(component));
  const out=normalizeManualAgreement({company:'Frende',totalAnnualPremium:'',products:[{type:'Hund',productName:'Veterinær',agreementScope:'ordinary',annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:chosen}]}).insuranceData.insurances[0];
  assert.deepEqual([...out.addOnIds].sort(),[...chosen].sort());assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
 }
});
test('R-038-B018: existing use eligibility/qualification and parent evidence contract preserved',()=>{
 const addon=productCatalog.addOns.find(a=>a.id===tap);assert.deepEqual(addon.selectionEvidenceKeys,['dyr.liv.dekning']);
 assert.equal(addon.requiresAddOnIds,undefined);assert.equal(productCatalog.addOns.some(a=>a.id==='frende-hund-bruksverdi'),false);
 assert.match(own('hund.bruksverdi.dekning',tap).value,/helt tap.*sykdom eller ulykke.*ferdig trent.*regelmessig/u);
 assert.equal(own('hund.bruksverdi.dekning',tap).source.section,'7.1.3 Tap av brukshund');
 assert.match(own('hund.bruksverdi.alder',tap).value,/under 8 år/u);assert.doesNotMatch(own('hund.bruksverdi.alder',tap).value,/hovedforfall/u);
 assert.match(own('hund.bruksverdi.begrensning',tap).value,/veterinærattest.*avlsegenskaper er unntatt.*før 4 måneder.*HD\/AA\/AD.*NKK.*foreldrene.*frirøntget/u);
 assert.equal(own('hund.bruksverdi.dekning',tap).qualificationSource.section,'7.3 Særvilkår og 8.2 Veterinærattest');
 for(const value of ['Valgt','Ikke valgt'])assert.equal(enrich([term('hund.bruksverdi.dekning',value)]).addOnIds.includes(tap),false);
 const rejected=enrich([term('dyr.liv.dekning','Valgt'),term('hund.bruksverdi.dekning','Ikke valgt')]);
 assert.ok(rejected.addOnIds.includes(tap));assert.ok(rejected.importantTerms.some(t=>t.key==='dyr.liv.forsvinning'&&t.coverageOrigin==='catalog'));
 assert.ok(!rejected.importantTerms.some(t=>t.key?.startsWith('hund.bruksverdi.')&&t.coverageOrigin==='catalog'));
});
test('R-038-PC: original deductibles, expiry and customer-specific sum; no invented age/sum',()=>{
 const controls=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv',import.meta.url),'utf8');
 for(let pc=571;pc<=574;pc++)assert.ok(controls.includes(`PC-0${pc},AUDITED_POSITIVE,frende`));
 assert.equal(own('dyr.veterinar.egenandel.fast').value,'Minst 1 000 kr per skadetilfelle');
 assert.equal(own('dyr.veterinar.egenandel.prosent').value,'25 % av skaden');
 assert.equal(own('dyr.veterinar.egenandel.prosent').deductibleClassification,'coverage');
 assert.equal(own('dyr.liv.opphor',tap).value,'Første hovedforfall etter 10 år');
 assert.equal(facts([tap]).some(f=>/skademelding|obduksjon|frister/u.test(f.key)),false);
});
test('R-038-COMPARE: same product and both directions retain availability and all sources',()=>{
 const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
 for(const peer of [id,'if-hund-standard','gjensidige-hund-behandling','sparebank1-fremtind-hund-veterin-r']){
  const forward=rows(id,peer),reverse=rows(peer,id);
  for(const r of forward){const swapped=reverse.find(s=>s.key===r.key);assert.ok(swapped,r.key);assert.deepEqual(r.first,swapped.second);assert.deepEqual(r.second,swapped.first);if(peer===id)assert.equal(r.different,false);}
  for(const [,key] of optional)assert.equal(forward.find(r=>r.key===key).first.state,'optional');
  for(const key of ['dyr.veterinar.dekning','dyr.veterinar.sum.valgbar','dyr.veterinar.begrensning','dyr.allergi.grense','dyr.karenstid.sykdom'])assert.equal(forward.find(r=>r.key===key).first.state,'included');
 }
});
test('R-038-PRIORITY: explicit document overrides each source-bound dimension; normalization preserves identity',()=>{
 for(const [,,component,key] of oracle){
  const parent=optional.find(([id])=>id===component)?.[1];const value=key===parent?'Valgt etter kundens forsikringsbevis':'Dokumentert kundevilkår 7 777 kr';
  const terms=[...(parent&&parent!==key?[term(parent,'Valgt')]:[]),term(key,value)];
  const out=enrich(terms);const actual=out.importantTerms.find(t=>t.key===key);assert.ok(actual,key);assert.equal(actual.value,value);assert.equal(actual.coverageOrigin,'document');
  assert.equal(normalizeDocumentFacts({type:'Hund',importantTerms:[term(key,value)]}).find(t=>t.key===key).value,value);
 }
});
test('R-038-SCOPE: exact provider/species/scope/version; no other product receives own-source claims',()=>{
 const p=product(id);assert.equal(findCatalogProduct('frende',id,'2026-01-01',{insuranceType:'Hund',agreementScope:'ordinary'}),p);
 for(const options of [{insuranceType:'Katt'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-01-01',options),null);
 assert.equal(findCatalogProduct('if',id,'2026-01-01'),null);assert.equal(findCatalogProduct('frende',id,'unknown'),null);
 for(const other of productCatalog.products.filter(p=>p.productId!==id))assert.equal(availableAddOns(other,date).some(a=>[tap,teeth,medicine].includes(a.id)),false);
 for(const [component,rows] of Object.entries(productCatalog.facts))if(![id,tap,teeth,medicine].includes(component))assert.ok(rows.every(f=>f.source.documentId!==source),component);
});
