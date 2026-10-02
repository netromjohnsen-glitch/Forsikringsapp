import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { canonicalDocumentFactKeys, parseExtractionResponse } from '../lib/analysis-output.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';
import { mcBobilKeyApplies, mcBobilFactLabel } from '../lib/mc-bobil-registry.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { groupTerms } from '../lib/comparison.ts';
import { buildMatchingBatch, runHybridMatching } from '../lib/hybrid-matching.ts';
import { attachSupportingTerms } from '../lib/supporting-terms.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { mcBobilRecord } from './helpers/mc-bobil.mjs';
import { product, facts, fact, sourceHash, date } from './helpers/wave3-catalog-gate.mjs';

// B-035C only: one P1, four original GAP/SF bindings. Source expectations
// are frozen independently of the implementation. No source-dependent cap,
// age decision, other B-035 dimensions or new canonical identity is approved.
const ids = ['frende-bobil-ansvar','frende-bobil-delkasko','frende-bobil-kasko','frende-bobil-utvidet'];
const labels = ['Parkeringsskade – bonustap','Parkeringsdekning – bonustap'];
const keys = ['bonus.parkert','parkering.bonus'];
const ownSource = 'mcb-ff-frende-bobil-terms';
const hash = '088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88';
const term = (name,value='Dokumentert særvilkår',canonicalKey=null) => ({name,value,canonicalKey});
const policy = (importantTerms=[],extra={}) => ({type:'Bobil',productName:'Kasko',canonicalProductName:'Kasko',
  annualPremium:null,deductible:null,coverageSummary:null,importantTerms,addOns:[],...extra});
const agreement = insurance => ({company:'Frende',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[insurance]});
const parsed = insurance => parseExtractionResponse({output_text:JSON.stringify(agreement(insurance))}).insurances[0];
const parking = insurance => canonicalCoverage(insurance,insurance.type,'parkering.dekning');
const get = (insurance,key) => insurance.importantTerms.filter(t=>t.key===key);
const enriched = (id,terms=[],catalog=productCatalog,extra={}) => {
  const p=product(id);
  return enrichExtractedAgreementWithCatalog({...agreement(policy(terms,{type:p.insuranceType,productName:p.name,
    canonicalProductName:p.name,agreementScope:p.agreementScope,...extra})),company:p.company},date,
    (_stage,work)=>work(),undefined,catalog).insurances[0];
};
const rows = (a,b) => groupTerms({key:'bobil',first:[a],second:[b],leftKey:'bobil',rightKey:'bobil'},null);
const source = {documentId:'synthetic-customer',filename:'synthetic.pdf',termsNumber:'',effectiveFrom:'',page:1,section:'Synthetic endorsement'};

for (const [path,expected] of [
  ['catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf',hash],
  ['catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf','57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987'],
  ['catalog/sources/mc-bobil/if-SV707.pdf','a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e'],
  ['catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf','57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987'],
  ['catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf','7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb'],
]) test(`R-035C-SOURCE: frozen original ${path}`,()=>sourceHash(path,expected));

test('R-035C-SOURCE: one signature and exactly four original scoped bindings',()=>{
  const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url)))
    .batches.find(b=>b.batch_id==='B-035');
  assert.ok(batch.signature_ids.includes('3b1cb1eb33398bda'));
  const e=batch.evidence.find(e=>e.finding_ids.includes('GAP-1537'));
  assert.deepEqual(e.finding_ids,['GAP-1537','GAP-1565','GAP-1599','GAP-1631']);
  assert.deepEqual(e.source_fact_ids,['SF-2262','SF-2298','SF-2348','SF-2398']);
  assert.deepEqual(e.product_identities.map(JSON.parse),ids.map(id=>['frende','bobil','ordinary',id,'2026-01-01']));
  assert.equal(e.sha256,hash);
});
for (const [i,id] of ids.entries()) test(`R-035C-BIND-${i+1}: ${id} source, qualified exemptions and exact tier`,()=>{
  const p=product(id),f=fact(id,'bonus.delkasko');
  assert.equal(p.version,'2026-01-01');assert.equal(p.agreementScope,'ordinary');
  assert.equal(f.source.documentId,ownSource);assert.equal(f.source.page,10);assert.equal(f.source.section,'11.13');
  assert.equal(productCatalog.sources[ownSource].sha256,hash);
  assert.match(f.source.url,/MotorHomeInsurance$/u);
  for(const qualifier of ['Ved dekningsmessig skade','tyveri, brann, glassruteskade og veihjelp','valgt maskinskade',
    'tapt/mistet/ødelagt nøkkel eller fjernkontroll','skadet/stjålet ladekabel','erstattes på Utvidet',
    'dyr omgående meldt til politi eller viltnemnda','direkte skyldes naturulykke etter naturskadeloven',
    'utvider ikke produktets dekninger']) assert.ok(f.value.includes(qualifier),qualifier);
  const parked=facts(id).find(f=>f.key==='bonus.parkert');
  assert.equal(Boolean(parked),i>=2);
  if(parked){
    assert.equal(parked.label,labels[0]);assert.equal(parked.source.documentId,ownSource);
    assert.equal(parked.source.page,10);assert.equal(parked.source.section,'11.13');
    assert.match(parked.value,/Dekningsmessig.*ukjent kjøretøy.*står parkert.*bestemt parkering.*avgrenset tidsrom/u);
    assert.doesNotMatch(parked.value,/6 år|seks|politi|150 000|ubegrenset/u);
  }
  const out=enriched(id);assert.equal(parking(out).status,'unknown');assert.deepEqual(out.addOnIds,[]);
  assert.ok(!out.importantTerms.some(t=>t.key==='parkering.dekning'));
});

test('R-035C-N: exact Bobil registry, derived enum and standalone labels',()=>{
  for(const key of ['bonus.parkert','bonus.delkasko']){
    assert.equal(mcBobilKeyApplies('bobil',key),true);assert.equal(mcBobilKeyApplies('mc',key),false);
    assert.equal(canonicalDocumentFactKeys.filter(k=>k===key).length,1);
    assert.ok(mcBobilFactLabel('bobil',key));
    assert.equal(parsed(policy([term('Dokumentert bonus','Ingen bonustap',key)])).importantTerms[0].canonicalKey,key);
  }
  assert.equal(new Set(canonicalDocumentFactKeys).size,canonicalDocumentFactKeys.length);
  for(const key of ['bonus.secret',42,{},'bobil.secret'])assert.throws(()=>parsed(policy([term('Bonus','X',key)])));
  assert.throws(()=>parsed(policy([{name:'Bonus',value:'X',key:'bonus.parkert',coverageOrigin:'document'}])));
});
for (const label of labels) for(const key of keys) test(`R-035C-N: explicit ${key} / ${label} preserves identity and provenance`,()=>{
  const first=normalizeDocumentFacts(policy([{...term(label,'Særvilkår uten bonustap',key),source}]));
  assert.deepEqual(first.map(t=>t.key),[key]);assert.equal(first[0].value,'Særvilkår uten bonustap');
  assert.deepEqual(first[0].source,source);assert.equal(first[0].coverageOrigin,'document');
  assert.deepEqual(normalizeDocumentFacts(policy(first)),first);
  assert.equal(parking(policy(first)).status,'unknown');
});
for(const label of [...labels,'PARKERINGSSKADE: BONUSTAP','Parkeringsskade\u00a0— bonustap']) test(`R-035C-N: nullable whole label is conservative ${label}`,()=>{
  assert.ok(!normalizeTermName(label,{insuranceType:'Bobil'}).includes('.'));
  assert.equal(normalizeDocumentFacts(policy([term(label)]))[0].key,undefined);
  assert.equal(parking(policy([term(label)])).status,'unknown');
});
test('R-035C-N: contextual bonustap retained without asserting its parent',()=>{
  assert.equal(normalizeTermName('Bonustap',{insuranceType:'Bobil'}),'bonustap');
  assert.equal(normalizeTermName('Bonustap',{insuranceType:'Bobil',relatedCoverageParentKeys:['parkering.dekning']}),'parkering.bonus');
  const out=normalizeDocumentFacts(policy([term('Bonustap','Ingen bonustap')],{
    addOns:[{name:'Parkeringsskade',annualPremium:null,deductible:null,importantTerms:[term('Bonustap','Ingen bonustap')]}]}));
  assert.equal(out[0].key,'parkering.bonus');
  assert.equal(parking(policy(out)).status,'unknown');
});
for(const type of ['MC','Innbo','Hus','Reise','Campingvogn'])for(const key of ['bonus.parkert','bonus.delkasko'])
  test(`R-035C-N: new global enum cannot establish ${key} on ${type}`,()=>{
    const out=normalizeDocumentFacts(policy([term('Syntetisk ukjent bonus','X',key)],{type}));
    assert.ok(out.every(t=>t.key!==key));
  });
test('R-035C-N: precise unrelated approved label repair preserved',()=>{
  const out=normalizeDocumentFacts(policy([term('Fortelt forsikringssum','42 000 kr','bonus.parkert'),
    term('Kilometerstand','134 567 km','bonus.parkert')]));
  assert.ok(out.some(t=>t.key==='bobil.fortelt.grense'));assert.ok(out.some(t=>t.key==='kjoretoy.kilometerstand'));
});

for(const id of ids)for(const key of ['bonus.delkasko',...(id.endsWith('kasko')&&!id.endsWith('delkasko')||id.endsWith('utvidet')?['bonus.parkert']:[])])
  test(`R-035C-PRIORITY: explicit ${key} overrides ${id}`,()=>{
    const name=fact(id,key).label,out=enriched(id,[{...term(name,'Dokumentert kundeverdi',key),source}]);
    assert.equal(get(out,key).length,1);assert.equal(get(out,key)[0].value,'Dokumentert kundeverdi');
    assert.equal(get(out,key)[0].coverageOrigin,'document');assert.deepEqual(get(out,key)[0].source,source);
    assert.equal(parking(out).status,'unknown');assert.deepEqual(out.addOnIds,[]);
  });
for(const [id,key] of [['frende-bobil-kasko','bonus.parkert'],['frende-bobil-utvidet','bonus.parkert'],
  ['if-bobil-super','parkering.bonus'],['storebrand-bobil-super','parkering.bonus']])
  test(`R-035C-PRIORITY: nullable exact effective row resolves ${id} to ${key}`,()=>{
    const out=enriched(id,[term(labels[0],'Dokumentert kundeverdi')]);
    assert.equal(get(out,key).length,1);assert.equal(get(out,key)[0].value,'Dokumentert kundeverdi');
    assert.equal(get(out,key)[0].coverageOrigin,'document');
    assert.equal(parking(out).status,key==='parkering.bonus'?'selected':'unknown');
  });
for(const id of ids.slice(0,2))test(`R-035C-PRIORITY: nullable parked clause grants no ${id} coverage`,()=>{
  const out=enriched(id,[term(labels[0])]);
  assert.equal(get(out,'bonus.parkert').length,0);assert.equal(get(out,'parkering.bonus').length,0);
  assert.ok(out.importantTerms.some(t=>t.name===labels[0]&&!t.key));assert.equal(parking(out).status,'unknown');
});
test('R-035C-PRIORITY: unknown product and wrong scope have no catalog fallback',()=>{
  for(const extra of [{productName:'Ukjent',canonicalProductName:'Ukjent'},{agreementScope:'ordinary-dnb'}]){
    const out=enriched(ids[2],[term(labels[0])],productCatalog,extra);
    assert.equal(out.catalogReference,null);assert.ok(out.importantTerms.some(t=>t.name===labels[0]&&!t.key));
    assert.equal(parking(out).status,'unknown');
  }
});
test('R-035C-PRIORITY: two exact effective keys are ambiguity, not first-wins',()=>{
  const id=ids[2],p=product(id),component=p.componentIds[0],f=fact(id,'bonus.parkert');
  const catalog={...productCatalog,facts:{...productCatalog.facts,[component]:[
    ...productCatalog.facts[component],{...f,key:'parkering.bonus'}]}};
  const out=enriched(id,[term(labels[0])],catalog);
  assert.ok(out.importantTerms.some(t=>t.name===labels[0]&&t.coverageOrigin==='document'&&!t.key));
  assert.equal(parking(out).status,'unknown');
});

for(const [value,status] of [['Valgt','selected'],['Ikke valgt','not_selected']])test(`R-035C-SE: explicit parking ${status} is independent`,()=>{
  const out=enriched(ids[2],[term('Parkeringsskade',value,'parkering.dekning'),term(labels[0],'Ingen bonustap','parkering.bonus')]);
  assert.equal(parking(out).status,status);assert.ok(get(out,'parkering.bonus').length);
});
for(const value of ['Ingen bonustap','Dekket under valgt parkeringsdekning','Ikke dokumentert',
  'Ingen bonustap når parkeringsdekning er valgt','Bonusvilkår når parkeringsdekning er ikke valgt'])test(`R-035C-SE: parking bonus consequence alone does not select ${value}`,()=>{
  const out=normalizeDocumentFacts(policy([term(labels[0],value,'parkering.bonus')]));
  assert.equal(parking(policy(out)).status,'unknown');
  assert.equal(isNonAssertingCoverageDetail('parkering.bonus'),true);
});
test('R-035C-SE: exact role preserves numeric and unrelated bonus semantics',()=>{
  for(const key of ['parkering.grense','parkering.egenandel','maskinskade.km','bonus.kasko','bonus.maskinskade'])
    assert.equal(isNonAssertingCoverageDetail(key),false,key);
  const out=normalizeDocumentFacts(policy([term('Parkeringsskade forsikringssum','25 000 kr','parkering.grense')]));
  assert.equal(parking(policy(out)).status,'selected');
  const catalogTerm={key:'parkering.bonus',name:labels[0],value:'Ingen bonustap',coverageOrigin:'catalog'};
  assert.equal(parking(policy([catalogTerm],{catalogSelectionConfirmed:true})).status,'unknown');
});
test('R-035C-SE: bonus cannot unlock orphan catalog limits; valid witness still can',()=>{
  const id=ids[2],component=product(id).componentIds[0],f=fact(id,'bonus.parkert');
  const catalog={...productCatalog,facts:{...productCatalog.facts,[component]:[
    ...productCatalog.facts[component],{...f,key:'parkering.bonus'},
    {...f,key:'parkering.grense',label:'Parkeringsskade – forsikringssum',value:'25 000 kr'}]}};
  const out=enriched(id,[term(labels[0],'Ingen bonustap','parkering.bonus')],catalog);
  assert.equal(get(out,'parkering.grense').length,0);assert.equal(parking(out).status,'unknown');
  const positive=enriched(id,[term('Parkeringsskade','Valgt','parkering.dekning')],catalog);
  assert.equal(get(positive,'parkering.grense')[0].value,'25 000 kr');assert.equal(parking(positive).status,'selected');
});

for(const [id,value,limit] of [['if-bobil-super','Ingen bonustap for skader innen denne dekningen','20 000 kr samlet for uhells- og parkeringsskade per skadetilfelle'],
  ['storebrand-bobil-super','Uten bonustap innen beløpsgrensen','25 000 kr']])
  test(`R-035C-PC: ${id} existing parking bundle and document priority`,()=>{
    assert.equal(fact(id,'parkering.bonus').value,value);assert.equal(fact(id,'parkering.grense').value,limit);
    assert.equal(fact(id,'parkering.bonus').source.page,id.startsWith('if-')?12:17);
    const out=enriched(id,[term(labels[0],'Kundens særvilkår','parkering.bonus')]);
    assert.equal(get(out,'parkering.bonus')[0].value,'Kundens særvilkår');assert.equal(parking(out).status,'selected');
    assert.deepEqual(out.addOnIds,[]);assert.equal(get(out,'bonus.parkert').length,0);
    assert.equal(get(out,'parkering.grense')[0].value,limit);
    const self=compareCatalogProducts(product(id),product(id));assert.equal(self.differenceCount,0);
    assert.ok(self.sections.flatMap(s=>s.rows).some(r=>r.key==='parkering.bonus'));
  });
test('R-035C-PC: catalog scope isolated to four ordinary Frende Bobil products',()=>{
  for(const p of productCatalog.products)if(p.insuranceType==='Bobil'&&!ids.includes(p.productId))
    assert.ok(resolveCatalogFacts(p,[],date).every(f=>!f.key.startsWith('bonus.')));
  for(const p of productCatalog.products)if(!ids.includes(p.productId))
    assert.ok(resolveCatalogFacts(p,[],date).every(f=>!(f.source.documentId===ownSource&&f.key.startsWith('bonus.'))));
  for(const id of ids){const out=enriched(id);assert.deepEqual(out.addOnIds,[]);assert.equal(out.annualPremium,null);}
});
for(const id of ids) test(`R-035C-PC: product bonus filter, same product and reverse ${id}`,()=>{
  const self=compareCatalogProducts(product(id),product(id));assert.equal(self.differenceCount,0);
  for(const [a,b] of [[id,'if-bobil-super'],['if-bobil-super',id]]){
    const rs=compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
    assert.ok(rs.every(r=>!r.key.startsWith('bonus.')));
    assert.ok(rs.some(r=>r.key==='parkering.bonus'));
  }
});

test('R-035C-FLOW: customer comparisons retain correct identity both directions and same product',()=>{
  const a=enriched(ids[2],[term(labels[0],'Kundeverdi A','bonus.parkert')]);
  const b=enriched(ids[2],[term(labels[0],'Kundeverdi B','bonus.parkert')]);
  const ab=rows(a,b).find(r=>r.key==='bonus.parkert'),ba=rows(b,a).find(r=>r.key==='bonus.parkert');
  assert.equal(ab.first,'Kundeverdi A');assert.equal(ab.second,'Kundeverdi B');
  assert.equal(ab.first,ba.second);assert.equal(ab.second,ba.first);
  const same=rows(a,a).find(r=>r.key==='bonus.parkert');assert.equal(same.first,same.second);
  assert.ok(!rows(a,b).some(r=>r.key==='parkering.bonus'));
  const pair=enriched(ids[2],[term(labels[0],'A','bonus.parkert'),term(labels[0],'B','parkering.bonus')]);
  assert.equal(get(pair,'bonus.parkert')[0].value,'A');assert.equal(get(pair,'parkering.bonus')[0].value,'B');
  assert.equal(parking(pair).status,'unknown');
});
test('R-035C-FLOW: schema to repeated multi-PDF normalization keeps document value and source',()=>{
  const r=mcBobilRecord('Bobil',1,{company:'Frende',importantTerms:[term(labels[0],'Kundeverdi','bonus.parkert')]});
  const out=documentPipeline([[r],[r]],'existing',true,true).insuranceData.insurances;
  assert.equal(out.length,1);assert.equal(get(out[0],'bonus.parkert').length,1);
  const f=get(out[0],'bonus.parkert')[0];assert.equal(f.value,'Kundeverdi');assert.equal(f.coverageOrigin,'document');
  assert.ok(f.sources.every(s=>s.documentId.startsWith('pdf:existing:')));assert.equal(parking(out[0]).status,'unknown');
});
test('R-035C-FLOW: different customer objects never share bonus or selection evidence',()=>{
  const a=mcBobilRecord('Bobil',1,{company:'Frende',importantTerms:[term(labels[0],'Kun objekt A','bonus.parkert')]});
  const b=mcBobilRecord('Bobil',2,{company:'Frende',importantTerms:[]});
  const out=documentPipeline([[a],[b]],'existing',true).insuranceData.insurances;
  assert.equal(out.length,2);assert.equal(out.filter(r=>get(r,'bonus.parkert').some(t=>t.value==='Kun objekt A')).length,1);
  assert.ok(out.every(r=>parking(r).status==='unknown'));
});
test('R-035C-FLOW: raw supporting collision retained as evidence only; keyed same-key priority retained',()=>{
  const customer=enriched(ids[2],[term(labels[0],'Kundeverdi','bonus.parkert')],productCatalog,{company:'Frende'});
  const supporting={...policy([term(labels[1],'Generelt bonusvilkår')]),company:'Frende',documentRole:'general_terms',
    agreementScope:'ordinary',agreementPeriod:null,objectIdentifiers:[],documentSources:[],documentReferences:[]};
  const out=attachSupportingTerms(customer,[supporting],'existing');
  assert.equal(get(out,'bonus.parkert')[0].value,'Kundeverdi');assert.equal(parking(out).status,'unknown');
  assert.ok(!out.importantTerms.some(t=>t.value==='Generelt bonusvilkår'));
  assert.ok(Array.isArray(out.recordEvidence));
  assert.ok(out.recordEvidence.some(r=>r.importantTerms.some(t=>t.value==='Generelt bonusvilkår')));
  const keyed=attachSupportingTerms(customer,[{...supporting,importantTerms:[term(labels[0],'Generelt keyed vilkår','bonus.parkert')]}],'existing');
  assert.equal(get(keyed,'bonus.parkert').length,1);assert.equal(get(keyed,'bonus.parkert')[0].value,'Kundeverdi');
});
test('R-035C-FLOW: bonus alone cannot unlock uploaded general parking parent/limit',()=>{
  const customer=enriched(ids[2],[term(labels[0],'Ingen bonustap','parkering.bonus')]);
  const supporting={...policy([term('Parkeringsskade','Dekket','parkering.dekning'),term('Parkeringsskade forsikringssum','25 000 kr','parkering.grense')]),
    company:'Frende',documentRole:'general_terms',agreementScope:'ordinary',agreementPeriod:null,objectIdentifiers:[],documentSources:[],documentReferences:[]};
  const out=attachSupportingTerms(customer,[supporting],'existing');
  assert.equal(get(out,'parkering.dekning').length,0);assert.equal(get(out,'parkering.grense').length,0);
  assert.equal(parking(out).status,'unknown');
});
test('R-035C-FLOW: manual custom raw remains conservative; known catalog stays explicit',()=>{
  const input={company:'Frende',totalAnnualPremium:'',products:[{type:'Bobil',productName:'Syntetisk',annualPremium:'',
    deductible:'',coverageSummary:'',importantTerms:[term(labels[0],'Syntetisk kundeverdi')],addOnIds:[],customProduct:true}]};
  const raw=normalizeManualAgreement(input).insuranceData.insurances[0];
  assert.equal(parking(raw).status,'unknown');assert.ok(raw.importantTerms.some(t=>t.value==='Syntetisk kundeverdi'));
  const known=normalizeManualAgreement({...input,products:[{...input.products[0],productName:'Kasko',customProduct:false,importantTerms:[]}]}).insuranceData.insurances[0];
  assert.ok(get(known,'bonus.parkert').length);assert.equal(parking(known).status,'unknown');assert.deepEqual(known.addOnIds,[]);
});

for(const label of labels)for(const key of keys)for(const reverse of [false,true])
  test(`R-035C-MATCH: unresolved ${label} vs ${key} ${reverse?'reverse':'forward'}`,async()=>{
    const raw=policy([term(label,'X')]),canonical=policy([{name:label,value:'X',key}]);
    const [a,b]=reverse?[canonical,raw]:[raw,canonical];
    assert.equal(buildMatchingBatch([a],[b]).termScopes.length,0);
    let calls=0;const plan=await runHybridMatching([a],[b],async()=>{calls++;return {decisions:[]};});
    assert.equal(calls,0);assert.deepEqual(plan.termMatches,[]);
  });
test('R-035C-MATCH: malformed response cannot introduce an excluded raw identity',async()=>{
  const left=policy([term(labels[0],'X'),term('Syntetisk venstre','X')]);
  const right=policy([{name:labels[0],value:'X',key:'bonus.parkert'},term('Syntetisk høyre','X')]);
  let called=false;
  const plan=await runHybridMatching([left],[right],async batch=>{
    called=true;assert.ok(batch.termScopes.every(s=>s.leftTerms.every(t=>!t.id.includes('parkeringsskade bonustap'))));
    return {decisions:[{kind:'term',scopeId:batch.termScopes[0].id,leftId:'l:parkeringsskade bonustap',
      rightIds:['r:bonus.parkert'],decision:'match',confidence:0.99,reason:'Synthetic attempted ambiguity collapse'}]};
  });
  assert.equal(called,true);assert.deepEqual(plan.termMatches,[]);
});
test('R-035C-MATCH: valid equal identities and raw/raw deterministic alignment retained',async()=>{
  for(const t of [term(labels[0],'X'),{name:labels[0],value:'X',key:'bonus.parkert'}]){
    let calls=0;await runHybridMatching([policy([t])],[policy([t])],async()=>{calls++;return {decisions:[]};});assert.equal(calls,0);
  }
  assert.equal(buildMatchingBatch([policy([{name:labels[0],value:'X',key:'bonus.parkert'}])],
    [policy([{name:labels[0],value:'X',key:'parkering.bonus'}])]).termScopes.length,0);
});
