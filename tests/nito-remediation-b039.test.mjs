import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {product, facts, fact, date, sourceHash, documentPriority} from './helpers/wave3-catalog-gate.mjs';

const ids=['frende-hus-standard','frende-hus-utvidet'];
const hash='6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7';
const signatures=['2cdb5babb9baeb36','385d0c2172a2a0aa','4091848d2d30b0ce','4a68aa57721576ba','91375b3834c1df04','c0b644be0f01f227','dc93e0369213538a'];
// Independent own-source oracle, PDF clauses 5.6/5.8/6.5-7/6.10/6.16/8.4/9.5.
const oracle=[
 ['GAP-0295',ids,'hus.plutselig.dekning','frendeHusStandard',5,['våtrom og følgeskade','takrenne','drenering','tap av vann, olje, væske eller gass','heksesot','virvelløse dyr','tele, setning, jordtrykk','montasjefeil','estetiske skader og punktert glass','leietakers','frost, klimaskade','flomlignende situasjon','presise avvikene i særdekningene']],
 ['GAP-0296',ids,'hus.pabud.dekning','frendeHusStandard',7,['1 000 000 kr','25 %','250 000 kr','grunnundersøkelser og fundamentering','arkeologisk','betingelse for gjenoppføring','uten skaden','midlertidig/provisorisk','planlagt ombygging/rehabilitering','opprinnelig innvendig areal','forholdsmessig','det offentlige']],
 ['GAP-0297',ids,'hus.forsikringsform','frendeHusStandard',6,['Fullverdi','Førsterisiko','avtalt sum i forsikringsbeviset','selv om bygningen har økt i verdi','innen fem år','40 % av markedsverdien før skaden','fortsatt begrenset til avtalt sum']],
 ['GAP-0298',ids,'hus.gjenoppforing.ingen','frendeHusStandard',7,['innen fem år','i tillegg til reduksjonen','offentlige inngrep','annen eier','ektefelle, samboer eller livsarving','reduserte markedsverdi']],
 ['GAP-0302',ids,'hus.rettshjelp.grense','frendeHusStandard',12,['100 000 kr per tvist','250 000 kr ved minst tre','1 000 000 kr ved minst 20','samme side','økonomiske interessen','på tvers av forsikringer/selskaper']],
 ['GAP-0304',ids,'hus.leietap.skade','frendeHusStandard',5,['dekningsmessig bygningsskade','normal reparasjons-/gjenoppføringstid','utleie står i forsikringsbeviset','skadedagen','normalt kunne ha skjedd','Skriftlig leiekontrakt','depositum/garanti','Sparte utgifter','opptjente renter']],
 ['GAP-0319',[ids[1]],'hus.handverker.folgeskade','frendeHusExtended',13,['autorisert håndverker med ansvarsrett','innen ti år','10 000 000 kr','Selve feilen dekkes bare på våtrom','eget arbeid','kjent før forsikringskjøpet','for sen reklamasjon','prøves først','Frende overtar kravet']],
];
for(const [gap,products,key,sourceId,page,values] of oracle)test(`R-039-${gap}: exact own-source dimensions and level`,()=>{
 for(const id of products){const f=fact(id,key);assert.equal(f.source.documentId,sourceId);assert.equal(f.source.page,page);
  assert.equal(f.source.company,'Frende');assert.equal(f.source.filename,'Vilkar-husforsikring.pdf');assert.equal(f.source.effectiveFrom,'2026-09-01');
  assert.equal(f.source.version,'Ikke oppgitt');assert.equal(f.source.termsNumber,'Ikke oppgitt');
  assert.equal(f.source.url,'https://api.frende.no/documents/terms/public/pnc/HomeInsurance');assert.equal(productCatalog.sources[sourceId].sha256,hash);
  for(const value of values)assert.ok(f.value.includes(value),`${gap}/${id}: ${value}`);
 }
});
test('R-039-SOURCE: original hash, exact seven signatures and thirteen bindings',()=>{
 sourceHash('catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf',hash);
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-039');
 assert.deepEqual(b.signature_ids,signatures);assert.equal(b.P2_piggyback_count,0);assert.deepEqual(b.dependencies,[]);
 assert.deepEqual(oracle.map(o=>o[0]),b.evidence.map(e=>e.finding_id));assert.equal(b.evidence.reduce((n,e)=>n+e.finding_ids.length,0),13);
 for(const e of b.evidence){assert.equal(e.sha256,hash);for(const identity of e.product_identities){const [provider,type,scope,id,version]=JSON.parse(identity);assert.equal(provider,'frende');assert.equal(type,'bolig');assert.equal(scope,'ordinary');assert.ok(ids.includes(id));assert.equal(version,'2026-09-01');}}
});
test('R-039-LEGAL: correct deductible page and one deductible per dispute, Mekle retained',()=>{
 for(const id of ids){const f=fact(id,'hus.rettshjelp.egenandel');assert.match(f.value,/6 000 kr pluss 20 % av øvrige kostnader/);assert.match(f.value,/én egenandel per tvist.*flere parter/);
  assert.match(f.value,/Mekle.*uten egenandel/);assert.equal(f.source.page,12);assert.equal(f.source.section,'8.4, jf. 8.2 side 11');assert.equal(f.deductibleClassification,'override');
 }
});
test('R-039-LEVEL: Standard exclusions, exact Utvidet override, no loss of base provenance',()=>{
 const standard=facts(ids[0]),extended=facts(ids[1]);
 assert.match(fact(ids[0],'hus.handverker.folgeskade').value,/unntatt på Standard/);
 assert.match(fact(ids[0],'hus.vatrom.folgeskade').value,/Standard unntar/);
 const f=fact(ids[1],'hus.takvegg.folgeskade');assert.equal(f.replacesBase,true);assert.equal(f.source.documentId,'frendeHusExtended');
 assert.match(f.value,/innenfor konstruksjonens tettesjikt/);assert.match(f.value,/Selve taket\/veggen og utettheten repareres ikke/);assert.match(f.value,/prøves først.*Frende overtar kravet/);
 for(const rows of [standard,extended])assert.equal(new Set(rows.map(f=>f.key)).size,rows.length);
 assert.equal(product(ids[1]).inheritsProductId,ids[0]);assert.equal(fact(ids[1],'hus.plutselig.dekning').source.documentId,'frendeHusStandard');
});
test('R-039-FORM: conditional first-loss wording retains structured full-value policy authority',()=>{
 for(const id of ids)assert.deepEqual(fact(id,'hus.forsikringsform').structuredValue,{kind:'insurance_form',forms:['full_value','first_loss'],defaultForm:'full_value',authority:'policy'});
 assert.match(fact(ids[0],'hus.gjenoppforing.hovedregel').value,/samme formål.*samme gnr\.\/bnr.*fem år/);
 assert.match(fact(ids[0],'hus.gjenoppforing.annetsted').value,/40 %.*samme kommune/);
 assert.match(fact(ids[0],'hus.gjenoppforing.ingen').source.section,/6\.16 side 9/);
});
test('R-039-RENTAL: documented choice, contract and loss qualification; no inferred nonpayment cover',()=>{
 for(const id of ids)for(const chosen of [[],['frende-hus-utleie'],['frende-hus-rate-skadedyr'],['frende-hus-utleie','frende-hus-rate-skadedyr']]){
  const p=product(id),rows=resolveCatalogFacts(p,chosen,date);
  const contract=rows.find(f=>f.key==='hus.utleie.vilkar');assert.equal(Boolean(contract),chosen.includes('frende-hus-utleie'));
  if(contract){assert.match(contract.value,/forsikringsbeviset.*Skriftlig husleieavtale/);assert.match(contract.value,/parter, pris, varighet.*depositum\/bankgaranti.*opphør/);assert.equal(contract.source.documentId,'frendeHusRental');}
  const out=normalizeManualAgreement({company:'Frende',totalAnnualPremium:'',products:[{type:'Hus',productName:p.name,annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:chosen}]}).insuranceData.insurances[0];
  assert.deepEqual(out.addOnIds,chosen);assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
  assert.ok(!rows.some(f=>['hus.utleie.tyveri','hus.utleie.mislighold','hus.utleie.utkastelse'].includes(f.key)));
  assert.match(rows.find(f=>f.key==='hus.leietap.skade').value,/utleie står i forsikringsbeviset/);
 }
});
test('R-039-PC: audited positive controls, tining/special deductibles and age table preserved',()=>{
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv',import.meta.url),'utf8');
 for(const pc of [191,203,204,205,207,210,214,222,234,235,236,238,241,245,248,249])assert.ok(registry.includes(`PC-${String(pc).padStart(4,'0')},AUDITED_POSITIVE,frende Hus`));
 assert.match(fact(ids[0],'hus.ror.tining').value,/50 000.*Standard/);
 assert.equal(fact(ids[0],'hus.egenandel.generell').deductibleClassification,'reference');assert.match(fact(ids[0],'hus.egenandel.gjentatt_skade').value,/20 000.*24 måneder/);
 const age=fact(ids[0],'hus.aldersfradrag.utvendige_ledninger_tanker').structuredValue;assert.deepEqual([age.freeYears,age.annualPercent,age.maximumPercent],[20,5,80]);
 const glass=fact(ids[1],'hus.glass.isolerglass_punktering').structuredValue;assert.deepEqual([glass.freeYears,glass.annualPercent],[10,10]);
});
test('R-039-COMPARE: all row identities, sources and statuses preserve same-product/side-swap',()=>{
 const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
 for(const id of ids)for(const peer of [id,...ids.filter(p=>p!==id),'if-hus-super','tryg-hus-ekstra']){
  const forward=rows(id,peer),reverse=rows(peer,id);
  for(const r of forward){const swap=reverse.find(s=>s.key===r.key);assert.ok(swap,r.key);assert.deepEqual(r.first,swap.second);assert.deepEqual(r.second,swap.first);if(peer===id)assert.equal(r.different,false);}
  assert.equal(forward.find(r=>r.key==='hus.plutselig.dekning').first.state,'included');
 }
});
test('R-039-PRIORITY: two customer overrides beat each changed base/extended dimension',()=>{
 for(const [,products,key] of oracle)for(const id of products)for(const value of ['Dokumentert kundevilkår 17 777 kr','Dokumentert kundevilkår 31 111 kr'])documentPriority(id,key,value);
});
test('R-039-SCOPE: exact provider/type/version, no cross-product source/add-on leakage',()=>{
 for(const id of ids){const p=product(id);assert.equal(findCatalogProduct('frende',id,'2026-09-01',{insuranceType:'Hus',agreementScope:'ordinary'}),p);
  assert.equal(findCatalogProduct('if',id,'2026-09-01'),null);assert.equal(findCatalogProduct('frende',id,'unknown'),null);
  for(const scope of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-09-01',scope),null);
 }
 for(const other of productCatalog.products.filter(p=>!ids.includes(p.productId))){assert.equal(availableAddOns(other,date).some(a=>a.id==='frende-hus-utleie'),false);
  assert.ok(resolveCatalogFacts(other,[],date).every(f=>!['frendeHusStandard','frendeHusExtended','frendeHusRental'].includes(f.source.documentId)),other.productId);
 }
});
