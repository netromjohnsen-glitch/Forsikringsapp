import {applySmart} from './helpers/b051-smart.mjs';
import {applyHealthHelp} from './helpers/b051-health-help.mjs';
import { applyLiability } from './helpers/b051-liability.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts,resolveProductComponentIds} from '../lib/product-catalog.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {relatedCoveragesForInsuranceType} from '../lib/insurance-normalization.ts';
import {baselineCatalog as previousBaseline, sourceOracle as oracle} from '../docs/audit/checkpoints/b051-craftsmanship-0cedd98/expected-catalog.mjs';
import { applySettlement } from '../docs/audit/checkpoints/b051-settlement-age-0bcd250/expected-catalog.mjs';
import { applyRecovery } from '../docs/audit/checkpoints/b051-recovery-benefits-69c71dc/expected-catalog.mjs';
import { applyPhysical } from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const baseline=applySmart(applyHealthHelp(applyLiability(applyPhysical(applyRecovery(applySettlement(previousBaseline))))));
const candidate=productCatalog;
const audit=new URL('../docs/audit/checkpoints/b051-craftsmanship-0cedd98/',import.meta.url);
const keys=Object.keys(oracle),ids=['gjensidige-hus','gjensidige-hus-pluss'];
const date=new Date('2026-10-07T12:00:00Z'), digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ref=(id,page,section)=>{const s=baseline.sources[id];return {documentId:s.id,filename:s.filename,termsNumber:s.termsNumber,effectiveFrom:s.effectiveFrom,company:s.company,url:s.url,section,page,version:s.version,productCode:s.productCode};};
const product=(id,c)=>c.products.find(p=>p.productId===id);
const source={documentId:'synthetic-craft-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',url:'https://example.invalid/customer',page:2,section:'Avtalte håndverksvilkår'};
const label=key=>baseline.facts.gjensidigeHusPluss.find(f=>f.key===key).label;
const input=(id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:product(id,baseline).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]});
const term=(key,value)=>({name:label(key),canonicalKey:key,value,source});
const enrich=(c,id,terms)=>enrichExtractedAgreementWithCatalog(input(id,terms),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const statuses=i=>deriveCanonicalCoverages(i,'Hus').map(c=>({id:c.id,status:c.status,conflict:c.conflict}));
const pick=(i,key)=>i.importantTerms.filter(t=>t.key===key);
const cases=[];
const check=(name,fn)=>test('R-051-CRAFT-'+name,fn);
const record=(id,role,terms=[])=>({...input(id).insurances[0],canonicalProductName:product(id,baseline).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:terms.map(([key,value])=>({name:label(key),value,documentIndices:[1]}))});
const pipeline=(c,documents,side='existing')=>{
 const save=productCatalog.facts.gjensidigeHusPluss;
 try{productCatalog.facts.gjensidigeHusPluss=c.facts.gjensidigeHusPluss;return documentPipeline(documents,side).insuranceData;}finally{productCatalog.facts.gjensidigeHusPluss=save;}
};
const manual=(c,id,custom=false,addons=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':product(id,c).name,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:addons,importantTerms:keys.map(key=>({name:label(key),value:'Manuelt vilkår 73 000 kr'}))}]},c).insuranceData.insurances[0];
const expectedSources=(c,id,key)=>{
 if(id===ids[0])return [baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).source];
 const o=oracle[key];return [ref(o.owner,...o.primary),...(o.qualification?[ref(...o.qualification)]:[])];
};
for(const id of ids)for(const key of keys){
 for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']]){
  check('enrich:'+id+':'+key+':'+values.join('|'),()=>{
   const ts=values.map(v=>term(key,v)),old=enrich(baseline,id,ts),cur=enrich(candidate,id,ts),a=repeat(baseline,old),b=repeat(candidate,cur);
   assert.deepEqual(statuses(cur),statuses(old));assert.deepEqual(statuses(b),statuses(a));assert.deepEqual(deriveCanonicalCoverages(cur,'Hus'),deriveCanonicalCoverages(old,'Hus'));assert.deepEqual(deriveCanonicalCoverages(b,'Hus'),deriveCanonicalCoverages(a,'Hus'));assert.deepEqual(cur.addOnIds,[]);assert.deepEqual(b.addOnIds,[]);
   const added=(x,y)=>statuses(y).filter(c=>!statuses(x).some(d=>d.id===c.id));
   assert.deepEqual(added(cur,b),[{id:'rettshjelp.dekning',status:'selected',conflict:false}]);assert.deepEqual(added(cur,b),added(old,a));
   for(const i of [cur,b])assert.equal(new Set(statuses(i).map(c=>c.id)).size,statuses(i).length);
   const fallback=!values.length||values[0]==='Ukjent';
   assert.deepEqual(pick(cur,key).map(t=>t.value),fallback?[id===ids[0]?baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).value:oracle[key].value]:values);
   for(const t of pick(cur,key)){
    assert.equal(t.coverageOrigin,fallback?'catalog':'document');assert.deepEqual(t.source,fallback?expectedSources(candidate,id,key)[0]:source);
    if(fallback){assert.deepEqual(t.sources,expectedSources(candidate,id,key));assert.deepEqual(t.overriddenBase,id===ids[0]?[]:[{value:baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).value,source:baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).source}]);}
    else assert.equal(Object.hasOwn(t,'sources'),false);
   }
   assert.deepEqual(pick(cur,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]),pick(b,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
   if(fallback)assert.deepEqual(pick(b,key),[{name:label(key),value:pick(cur,key)[0].value,key,coverageOrigin:'document',source:expectedSources(candidate,id,key)[0],sources:expectedSources(candidate,id,key)}]);else assert.deepEqual(pick(b,key),pick(cur,key));
   cases.push({kind:'enrichment',id,key,input:values,baseline_statuses:statuses(old),candidate_statuses:statuses(cur),baseline_repeated_alias:added(old,a),candidate_repeated_alias:added(cur,b),baseline_terms:pick(old,key),candidate_terms:pick(cur,key),candidate_repeat_terms:pick(b,key)});
  });
 }
 check('raw-material:'+id+':'+key,()=>{
  const f=resolveCatalogFacts(product(id,candidate),[],date,null,candidate).find(f=>f.key===key);assert.equal(Object.hasOwn(f,'overriddenBase'),false);
  assert.equal(f.replacesBase,id===ids[1]?true:undefined);assert.deepEqual(catalogFactSources(f),expectedSources(candidate,id,key));
  const old=materializeCatalogProduct(product(id,baseline),baseline).facts.find(f=>f.key===key),cur=materializeCatalogProduct(product(id,candidate),candidate).facts.find(f=>f.key===key);
  assert.equal(cur.state,old.state);assert.equal(cur.role,'term');assert.deepEqual(cur.sources,expectedSources(candidate,id,key).map(s=>({...s,sourceType:undefined})));
  cases.push({kind:'materialization',id,key,before:old,after:cur});
 });
}
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']]){
 check('pipeline:'+id+':'+role+':'+values.join('|'),()=>{
  const documents=[[record(id,role,keys.flatMap(key=>values.map(value=>[key,value])))]];
  const old=pipeline(baseline,documents),cur=pipeline(candidate,documents);
  assert.equal(cur.insurances.length,role==='general_terms'?0:1);assert.equal(cur.supportingEvidence.length,role==='general_terms'?1:0);
  if(role!=='general_terms'){
   assert.deepEqual(statuses(cur.insurances[0]),statuses(old.insurances[0]));assert.deepEqual(cur.insurances[0].addOnIds,[]);
   for(const key of keys){
    const rs=pick(cur.insurances[0],key);
    if(values.length&&values[0]!=='Ukjent'){
     assert.deepEqual(rs.map(t=>t.value),values);
     for(const t of rs){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:'pdf:existing:0',filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);assert.equal(t.coverageOrigin,'document');}
    }else assert.deepEqual(rs.map(t=>t.value),[id===ids[0]?baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).value:oracle[key].value]);
   }
  }else{
   const ev=cur.supportingEvidence[0];assert.deepEqual(ev,old.supportingEvidence[0]);
   assert.deepEqual(ev.importantTerms.map(t=>t.value),keys.flatMap(()=>values));
   for(const t of ev.importantTerms){assert.equal(Object.hasOwn(t,'key'),true);assert.equal(t.key,undefined);assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:'pdf:existing:0',filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}
  }
  cases.push({kind:'pipeline',id,role,input:values,baseline:old,candidate:cur});
 });
}
for(const id of ids){
 check('support:'+id,()=>{
  const docs=[[record(id,'individual_agreement',[[keys[0],'Kundevilkår 73 000 kr']])],[record(id,'general_terms',[[keys[1],'Generelt håndverksvilkår']])]];
  const old=pipeline(baseline,docs),cur=pipeline(candidate,docs);
  assert.equal(cur.insurances.length,1);assert.equal(cur.supportingEvidence.length,1);assert.deepEqual(cur.supportingEvidence,old.supportingEvidence);
  assert.equal(pick(cur.insurances[0],keys[0])[0].value,'Kundevilkår 73 000 kr');assert.deepEqual(statuses(cur.insurances[0]),statuses(old.insurances[0]));assert.deepEqual(cur.insurances[0].addOnIds,[]);
  cases.push({kind:'support',id,baseline:old,candidate:cur});
 });
 for(const custom of [false,true])check('manual:'+id+':'+custom,()=>{
  const old=manual(baseline,id,custom),cur=manual(candidate,id,custom);assert.deepEqual(statuses(cur),statuses(old));assert.deepEqual(cur.addOnIds,[]);
  if(custom){assert.deepEqual(cur,old);assert.equal(cur.catalogReference,null);assert.equal(cur.catalogFacts,null);assert.equal(cur.catalogSelectionConfirmed,false);assert.deepEqual(cur.importantTerms,keys.map(key=>({name:label(key),value:'Manuelt vilkår 73 000 kr'})));}
  else{assert.equal(cur.catalogReference.productId,id);for(const key of keys){const t=pick(cur,key)[0];assert.equal(t.coverageOrigin,'catalog');assert.equal(t.value,id===ids[1]?oracle[key].value:baseline.facts.gjensidigeHusStandard.find(f=>f.key===key).value);assert.deepEqual(t.sources,expectedSources(candidate,id,key).map((s,i)=>({...s,note:i?'Supplerende kilde for faktumets anvendelse':id===ids[1]?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined})));}}
  cases.push({kind:'manual',id,custom,baseline:old,candidate:cur});
 });
 for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('comparison:'+id+':'+other,()=>{
  const f=compareCatalogProducts(product(id,candidate),product(other,candidate),candidate),r=compareCatalogProducts(product(other,candidate),product(id,candidate),candidate);
  if(id===other)assert.equal(f.differenceCount,0);
  for(const key of keys){const a=f.sections.flatMap(s=>s.rows).find(r=>r.key===key),b=r.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);assert.deepEqual(a.first.sources,expectedSources(candidate,id,key).map(s=>({...s,sourceType:undefined})));}
  cases.push({kind:'product-comparison',id,other,result:f});
 });
 for(const key of keys)check('document-comparison:'+id+':'+key,()=>{
  const customer=enrich(candidate,id,[term(key,'Kundevilkår 73 000 kr')]),known=manual(candidate,id);
  for(const [a,b,side] of [[customer,known,'first'],[known,customer,'second']]){
   const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===key);assert.equal(row[side],'Kundevilkår 73 000 kr');assert.deepEqual(row[side+'Sources'],[source]);
  }
 });
}
const fingerprints=[];
check('exact-two-row-delta+isolation',()=>{
 assert.deepEqual(candidate.sources,baseline.sources);assert.deepEqual(candidate.products,baseline.products);assert.deepEqual(candidate.addOns,baseline.addOns);
 const changed=Object.keys(candidate.facts).filter(o=>!Object.is(digest(candidate.facts[o]),digest(baseline.facts[o])));assert.deepEqual(changed,['gjensidigeHusPluss']);
 let protectedFacts=0;for(const [owner,rows] of Object.entries(baseline.facts)){
  const exempt=owner==='gjensidigeHusPluss'?keys:[];
  assert.deepEqual(candidate.facts[owner].filter(f=>!exempt.includes(f.key)),rows.filter(f=>!exempt.includes(f.key)));protectedFacts+=rows.filter(f=>!exempt.includes(f.key)).length;
 }
 const others=candidate.products.filter(p=>p.productId!==ids[1]);
 for(const p of others)assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(product(p.productId,baseline),[],date,null,baseline));
 for(const id of ids)for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],['gjensidige-hus-utleie','gjensidige-hus-smart'],...(id===ids[0]?[['gjensidige-hus-rate-insekter']]:[])]){
  const a=resolveCatalogFacts(product(id,baseline),addons,date,null,baseline),b=resolveCatalogFacts(product(id,candidate),addons,date,null,candidate);
  assert.deepEqual(b.filter(f=>!keys.includes(f.key)||id===ids[0]),a.filter(f=>!keys.includes(f.key)||id===ids[0]));assert.deepEqual(resolveProductComponentIds(product(id,candidate),candidate),resolveProductComponentIds(product(id,baseline),baseline));
 }
 for(const [id,addons] of [[ids[0],[]],[ids[0],['gjensidige-hus-rate-insekter']],[ids[1],[]]]){
  const d=new Date('2026-09-29T10:52:14.812Z'),filter=rs=>rs.filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');
  fingerprints.push({id,addons,before:digest(filter(resolveCatalogFacts(product(id,baseline),addons,d,null,baseline))),after:digest(filter(resolveCatalogFacts(product(id,candidate),addons,d,null,candidate)))});
 }
 cases.push({kind:'isolation',components:Object.keys(candidate.facts).length,unchanged_components:Object.keys(candidate.facts).length-1,protected_raw_facts:protectedFacts,other_products_unchanged:others.length,metadata_unchanged:true,all_prior_13_B051_rows_and_B020_pests_unchanged:true});
});

check('NO-NEW-PARENT',()=>{assert.deepEqual(relatedCoveragesForInsuranceType('Hus'),[]);for(const id of ids){for(const c of deriveCanonicalCoverages(enrich(candidate,id,[]),'Hus'))assert.equal(keys.includes(c.id),false);}});

check('BINDINGS', () => {
 const auth = JSON.parse(readFileSync(new URL('authorization.json', audit)));
 const pairs = { '46e94bcf464af845': ['GAP-2153', 'SF-3090'], '2113807ceb290224': ['GAP-2154', 'SF-3091'],
  'af150eab853a1648': ['GAP-2155', 'SF-3092'], '239b00779349f2fd': ['GAP-2156', 'SF-3093'],
  '57c775ac935fb504': ['GAP-2183', 'SF-3140'] };
 assert.deepEqual(auth.signatures.map(s => s.signature).sort(), Object.keys(pairs).sort());
 for (const s of auth.signatures) {
  assert.equal(s.original_binding.final_batch_id, 'B-051');
  assert.equal(s.original_binding.root_cause_id, '["RC-027"]');
  assert.equal(s.original_binding.P2_occurrences, '0');
  assert.deepEqual(s.original_source_evidence.map(e => [e.finding_id, e.source_fact_id]), [pairs[s.signature]]);
  assert.deepEqual(s.original_source_evidence.map(e => JSON.parse(e.product_identity)),
   [['gjensidige', 'bolig', 'ordinary', 'gjensidige-hus-pluss', 'Alminnelige vilkår']]);
 }
});

for (const [id, hash] of [['gjensidigeHusStandard', 'd237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],
 ['gjensidigeHusPluss', '79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792'],
 ['gjensidigeHusProduct', '32d491a3f2648199545134ff68994615f45b25f48d169bd3ff43ea61b9bad534']]) check('SOURCE-' + id, () => {
 const s = baseline.sources[id], current = productCatalog.sources[id];
 assert.deepEqual(current, s); assert.equal(current.sha256, hash);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/gjensidige/hus/' + s.filename, import.meta.url))).digest('hex'), hash);
 assert.equal(s.insuranceType, 'Hus'); assert.equal(s.company, 'Gjensidige');
 assert.equal(s.effectiveFrom, ''); assert.equal(Object.hasOwn(s, 'sourceType'), false);
});

check('SOURCE-FULL-PDF5', () => {
 const p = new URL('../catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf', import.meta.url);
 const text = execFileSync('pdftotext', ['-raw', '-f', '5', '-l', '5', p.pathname, '-']).toString().replace(/\s+/gu, ' ').trim();
 const wetStart = text.indexOf('Håndverks- og entreprenørfeil - våtrom');
 const otherStart = text.indexOf('Håndverks- og entreprenørfeil - andre bygningsskader');
 const end = text.indexOf('Ombygging for rullestolbruker');
 assert.ok(wetStart >= 0 && otherStart > wetStart && end > otherStart);
 const wet = text.slice(wetStart, otherStart), other = text.slice(otherStart, end);
 const cosmetics = 'Kosmetiske feil og skader som kun består av flekker, riper, svinnsprekker, avskallinger, knirk i gulv, samt mindre hakk og merker';
 const guarantee = 'Skade som andre enn sikrede er pliktig til, og har økonomisk evne til å erstatte, i henhold til garanti eller annen avtale';
 for (const clause of [wet, other]) {
  for (const phrase of ['materialfeil, konstruksjonsfeil, prosjekteringsfeil eller uriktig montasje',
   'utført av faglært håndverker eller godkjent/registrert entreprenør', cosmetics, guarantee]) assert.ok(clause.includes(phrase), phrase);
 }
 for (const phrase of ['Skaden må ha oppstått i forsikringstiden og blitt konstatert innen 10 år fra arbeidet ble utført',
  'Arbeider utført av sikrede', 'Arbeider utført av ufaglærte', 'Skade som skyldes bakterier og heksesot']) assert.ok(wet.includes(phrase), phrase);
 for (const phrase of ['Følgeskaden må ha oppstått i forsikringstiden og blitt konstatert innen 10 år fra arbeidet ble utført',
  'Utbedring av selve feilen/mangelen', 'Følgeskader etter arbeider utført av sikrede', 'Følgeskader etter arbeider utført av ufaglærte',
  'Tilkomstkostnader for utbedring av selve feilen/mangelen, utover det som er nødvendig for utbedring av følgeskadene',
  'Skade som skyldes søl, bakterier og heksesot', 'Følgeskade på drensledning']) assert.ok(other.includes(phrase), phrase);
 assert.doesNotMatch(wet, /Utbedring av selve feilen|Følgeskade på drensledning/u);
 assert.doesNotMatch(oracle['hus.vatrom.selverommet'].value, /utbedring av selve feilen|fem år/u);
});

check('SOURCE-WEBSITE-COMPLAINT', () => {
 const raw = readFileSync(new URL('../catalog/sources/gjensidige/hus/Husforsikring-produktside.html', import.meta.url), 'utf8');
 // Decode the frozen HTML representation; original bytes are separately hash checked.
 const text = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, ' ')
  .replace(/<[^>]+>/gu, ' ').replace(/&nbsp;|&#160;|&#x[aA]0;/gu, ' ').replace(/\u00a0/gu, ' ').replace(/\s+/gu, ' ').trim();
 assert.ok(text.includes('Hvis en autorisert håndverker gjør en feil som i ettertid fører til skader på huset, er håndverkeren ansvarlig for å reparere feilen og økonomisk ansvarlig for å dekke følgeskader i opptil 5 år. Hvis det har gått mindre enn fem år, må du derfor først klage til håndverkeren.'));
 assert.ok(text.includes('Hvis håndverkeren ikke retter opp feilen, eller er konkurs, dekker vi disse følgeskadene i opptil 10 år etter at det opprinnelige arbeidet ble utført.'));
 assert.ok(text.includes('Hvis en autorisert håndverker gjør en feil som i ettertid fører til skader (følgeskader) på/i huset, er håndverkeren ansvarlig for å reparere feilen og økonomisk ansvarlig for å dekke følgeskader i opptil 5 år. Hvis håndverkeren ikke utbedrer dette, eller er konkurs, vil vi dekke eventuelle følgeskader som oppstår opptil 10 år etter at det opprinnelige arbeidet ble utført.'));
});

for (const key of keys) check('FULL-FACT-' + key, () => {
 const o = oracle[key], old = baseline.facts[o.owner].filter(f => f.key === key);
 assert.equal(old.length, 1); assert.equal(old[0].value, o.previous_value);
 const expected = { ...old[0], value: o.value, source: ref(o.owner, ...o.primary),
  ...(o.qualification ? { qualificationSource: ref(...o.qualification) } : {}) };
 assert.deepEqual(productCatalog.facts[o.owner].filter(f => f.key === key), [expected]);
 assert.equal(expected.replacesBase, true);
});

check('REVERSE', () => {
 execFileSync('node', [new URL('./helpers/b051-liability.mjs', import.meta.url).pathname,'--audit'], { stdio: 'pipe' });
});
