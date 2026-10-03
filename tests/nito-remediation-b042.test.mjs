import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct} from '../lib/product-catalog.ts';
import {canonicalDocumentFactKeys, parseExtractionResponse} from '../lib/analysis-output.ts';
import {mcBobilKeyApplies, mcBobilFactLabel} from '../lib/mc-bobil-registry.ts';
import {buildMcBobilCatalog} from '../lib/mc-bobil-catalog-builder.ts';
import {normalizeTermName} from '../lib/insurance-normalization.ts';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {groupTerms} from '../lib/comparison.ts';
import {buildMatchingBatch} from '../lib/hybrid-matching.ts';
import {attachSupportingTerms} from '../lib/supporting-terms.ts';
import {mcBobilRecord} from './helpers/mc-bobil.mjs';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {product, facts, fact, sourceHash, date, manual} from './helpers/wave3-catalog-gate.mjs';

// B-042 / RC-018 / SCRC-018. Frozen source oracle plus the approved MC bonus
// type extension. Bonus consequences never establish a coverage or add-on.
const ids=['frende-mc-ansvar','frende-mc-delkasko','frende-mc-kasko'];
const source='mcb-ff-frende-mc-terms', accident='frende-mc-ulykke';
const hash='088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88';
const signatures=['0717cbe5979fe940','15d798ea12be27be','673b0dd64b9ae86b','6a20b5d641186e9a',
 '902297071ab9516b','a84cddf6a4a5ab0f','b6504beef8072acb','bcd4632e3ae2532e','c25762012f5b486d',
 'cf17458e25f6d116','f864e62baa274cb8','fb65e93662e8c95c','fc887c2905220189'];
// Each entry checks a source semantic dimension, independent of display wording.
const oracle=[
 [['GAP-1451','GAP-1479','GAP-1510'],['SF-2121','SF-2162','SF-2208'],'bonus.delkasko',10,'11.13','',
  ['Ved dekningsmessig skade','tyveri, brann, glassruteskade og veihjelp','maskinskade','nøkkel/fjernkontroll','ladekabel','Utvidet','dyr omgående meldt til politi eller viltnemnda','direkte skyldes naturulykke etter naturskadeloven','utvider ikke produktets dekninger','MC har ikke maskinskadedekning','ikke selvstendig glassdekning']],
 [['GAP-1452','GAP-1480','GAP-1511'],['SF-2122','SF-2163','SF-2209'],'ulykke.dekning',10,'12.1',accident,
  ['Valgfri','står i forsikringsbeviset','passasjerer','rettmessige brukere','lovlig bruk','kroppsskade','plutselig ytre, uventet fysisk hendelse','sykdom, slag, illebefinnende','ikke et ulykkestilfelle']],
 [['GAP-1453','GAP-1481','GAP-1512'],['SF-2124','SF-2165','SF-2211'],'ulykke.invaliditet',10,'12.3 (fortsetter side 11)',accident,
  ['200 000 kr ved 100 % livsvarig medisinsk invaliditet','forholdsmessig ved delvis invaliditet','maksimalt 100 %','Tidligere nedsatt funksjon gir fradrag','uten brukbar funksjon','ikke invaliditetserstatning','Sykelig tilstand, disposisjon eller mén','forholdsmessig reduksjon','innen tre år','treårsdagen','dødsfallserstatning i stedet']],
 [['GAP-1455','GAP-1483','GAP-1514'],['SF-2126','SF-2167','SF-2213'],'ansvar.dekning',11,'13.1','',
  ['bilansvarslova','ulovfestede regler','konstatert i forsikringstiden','10 000 000 kr per skadetilfelle og samlet per år','vegfraktavtaler er unntatt']],
 [['GAP-1456','GAP-1484','GAP-1515'],['SF-2127','SF-2168','SF-2214'],'rettshjelp.dekning',11,'14.1–14.3 (fortsetter side 12)','',
  ['Privatkundens','personlig eier, rettmessig bruker eller fører','salgstvist','opphørte ved salget','nytt kjøp før egen forsikring','forsikret i Frende ved kjøpet','Alminnelige domstoler og voldgift','særdomstol']],
 [['GAP-1457','GAP-1485','GAP-1516'],['SF-2128','SF-2169','SF-2215'],'rettshjelp.dekning',11,'14.1–14.3 (fortsetter side 12)','',
  ['egen advokat','rettshjelper','advokatmekler','sakkyndige','vitner og rettsgebyr til forliksråd og tingrett','Ankegebyr','idømte eller avtalte saksomkostninger','sameiere','yrke/virksomhet','familie/arv/skifte','namsmyndighetene','ubestridt inkasso','konkurs/akkord som skyldner','straffesak','krenkelser','bøter/gebyrer','ulovlig handling','advokatsalær/sakkyndigutgifter','Forvaltningsvedtak','fullt utnyttet klageadgang','ikke utgifter før søksmål','Utgifter før tvisten','grunnlag oppstått før forsikringen']],
 [['GAP-1458','GAP-1486','GAP-1517'],['SF-2129','SF-2170','SF-2216'],'rettshjelp.grense',12,'14.4 (fortsetter side 13)','',
  ['100 000 kr per tvist','250 000 kr ved tre eller flere parter på samme side','flere forsikringer eller selskaper','økonomiske interesse']],
 [['GAP-1467','GAP-1495'],['SF-2146','SF-2188'],'brann.dekning',3,'4.1–4.2','',
  ['brann eller lynnedslag','svimerker','delen eller komponenten der brann eller kortslutning oppstod','unntatt','følgeskaden er omfattet']],
 [['GAP-1468','GAP-1496'],['SF-2147','SF-2189'],'tyveri.dekning',3,'4.1–4.2','',
  ['Tyveri av kjøretøyet','forsøk på tyveri','husstand eller ansatte','utlånt eller prøvekjørt og ikke tilbakelevert','unntatt']],
 [['GAP-1469','GAP-1497'],['SF-2149','SF-2191'],'veihjelp.dekning',3,'5.2–5.4','',
  ['påkoblet tilhenger eller campingvogn til nærmeste verksted','reparasjon på stedet når det er rimeligere','motorstopp, punktering, tomt batteri, sykdom','hvilken som helst annen årsak','hindrer videre kjøring','også hjemme']],
 [['GAP-1470','GAP-1498'],['SF-2150','SF-2192'],'veihjelp.dekning',3,'5.2–5.4','',
  ['ikke kan repareres samme dag','rimelige og nødvendige merutgifter','fører/passasjerer utover planlagt hjemkjøring','hotell når det er rimeligere','forhåndsgodkjent av Frende']],
 [['GAP-1471','GAP-1499'],['SF-2151','SF-2193'],'veihjelp.dekning',3,'5.2–5.4','',
  ['reparert eller etterlatt kjøretøy','reiseutgifter for én person tilbake','forhåndsgodkjent','Gjenfunnet kjøretøy etter tyveri','hjemtransportutgifter begrenset til kjøretøyets markedsverdi']],
 [['GAP-1500'],['SF-2195'],'kasko.begrensning',4,'6.2','',
  ['motor, gir, drivverk og elektroniske styreenheter','med mindre årsaken er en annen skade som omfattes','ikke egen maskinskadedekning','Frost, fukt, vann, råte','innvendige flekker, svimerker, søl, bruksslitasje','rust eller slitasje og underslag','fabrikant, leverandør eller reparatør','hvis kravet ikke fører frem','dersom den omfattes av forsikringen','Frende overtar kravet']],
];
const policy=(importantTerms=[],extra={})=>({type:'MC',productName:'Kasko',canonicalProductName:'Kasko',
 annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms,...extra});
const term=(key,value,name=mcBobilFactLabel('mc',key))=>({name,value,canonicalKey:key});
const parked=out=>canonicalCoverage(out,'MC','mc.parkert.dekning');
const enrich=(id,terms=[],extra={},catalog=productCatalog)=>enrichExtractedAgreementWithCatalog({
 company:'Frende',insurances:[policy(terms,{productName:product(id).name,canonicalProductName:product(id).name,agreementScope:'ordinary',...extra})]},
 date,(_stage,work)=>work(),undefined,catalog).insurances[0];
const customerSource={documentId:'synthetic-mc-customer',filename:'synthetic.pdf',termsNumber:'',effectiveFrom:'',page:1,section:'Customer endorsement'};

test('R-042-SOURCE: three frozen hashes, 13 signatures, 32 exact GAP/SF bindings and MC scope',async()=>{
 sourceHash('catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf',hash);
 sourceHash('catalog/sources/mc-bobil/frende-mc-ipid.pdf','11b4f8c1c73d2177ce49d7349ed1fd23151c63dbaaa77f15179b4b83496044eb');
 sourceHash('catalog/sources/mc-bobil/frende-mc-page.html','eb47ef1e8c57e579891464eb8a264047ddcefcbc4b2113c0c4585700fb43c221');
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-042');
 assert.deepEqual(batch.signature_ids,signatures);assert.deepEqual(batch.root_cause_ids,['RC-018']);assert.deepEqual(batch.original_root_cause_ids,['SCRC-018']);
 assert.equal(batch.P2_piggyback_count,0);assert.deepEqual(batch.dependencies,[]);
 assert.deepEqual(batch.evidence.map(e=>[e.finding_ids,e.source_fact_ids]),oracle.map(e=>e.slice(0,2)));
 assert.equal(batch.evidence.flatMap(e=>e.finding_ids).length,32);
 assert.deepEqual(batch.products_affected.map(JSON.parse),ids.map(id=>['frende','mc','ordinary',id,'2026-01-01']));
 const s=productCatalog.sources[source];assert.equal(s.sha256,hash);assert.equal(s.insuranceType,'MC');
 assert.equal(s.providerId,'frende');assert.equal(s.agreementScope,'ordinary');assert.equal(s.sourceType,'full_terms');
 assert.equal(s.url,'https://api.frende.no/documents/terms/public/pnc/MotorcycleInsurance');
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf',import.meta.url))});
 try{const pdf=await parser.getText();assert.equal(pdf.total,15);const text=pdf.text.replace(/\s+/g,' ');
  for(const quote of ['bil, bobil eller MC','en bestemt parkering i et avgrenset tidsrom','10 000 000 kroner per skadetilfelle og samlet per år','treårsdagen'])assert.ok(text.includes(quote),quote);
  assert.match(text,/Ansvaret vårt er dessuten begrenset til den økonomiske\s+(?:Side 12 av 15\s+Vilkår for kjøretøyforsikring\s+-- 12 of 15 --\s+)?interessen du har i saken\./u);
 }finally{await parser.destroy();}
});
for(const [gaps,sfs,key,page,section,addon,values] of oracle)for(const [i,gap] of gaps.entries()){
 const id=key==='kasko.begrensning'?ids[2]:['brann.dekning','tyveri.dekning','veihjelp.dekning'].includes(key)?ids[i+1]:ids[i];
 test('R-042-'+gap+'/'+sfs[i]+': exact source dimension and product',()=>{
  const p=product(id),fs=resolveCatalogFacts(p,addon?[addon]:[],date),f=fs.find(f=>f.key===key);assert.ok(f,key);
  for(const v of values)assert.ok(f.value.includes(v),gap+': '+v);
  assert.equal(fs.filter(f=>f.key===key).length,1);assert.equal(f.source.documentId,source);
  assert.equal(f.source.company,'Frende');assert.equal(f.source.agreementScope,'ordinary');
  assert.equal(f.source.effectiveFrom,'2026-01-01');assert.equal(f.source.page,page);assert.equal(f.source.section,section);
  assert.equal(p.version,'2026-01-01');assert.equal(p.insuranceType,'MC');assert.equal(mcBobilKeyApplies('mc',key),true);
  assert.equal(f.source.url,'https://api.frende.no/documents/terms/public/pnc/MotorcycleInsurance');
  if(addon)assert.ok(!facts(id).some(f=>f.key===key));
 });
}
for(const id of ids)test('R-042-LEVEL: '+id+' available accident and exact bonus tier',()=>{
 assert.ok(fact(id,'bonus.delkasko'));assert.equal(facts(id).some(f=>f.key==='bonus.parkert'),id===ids[2]);
 assert.deepEqual(availableAddOns(product(id),date).map(a=>a.id),[accident]);
 const out=enrich(id);assert.deepEqual(out.addOnIds,[]);assert.equal(parked(out).status,'unknown');
 for(const family of ['glass','maskinskade','nokkel','bobil','parkering','mc.parkert'])
  assert.ok(!facts(id).some(f=>f.key.startsWith(family+'.')),family);
 assert.equal(out.annualPremium,null);assert.equal(canonicalCoverage(out,'MC','ulykke.dekning').status,'unknown');
 assert.ok(!facts(id).some(f=>f.key.startsWith('premie.')||f.key.startsWith('administrasjon.')));
});
for(const key of ['bonus.delkasko','bonus.parkert'])test('R-042-N: exact '+key+' labels, schema and repeated normalization',()=>{
 assert.equal(mcBobilKeyApplies('mc',key),true);assert.equal(mcBobilKeyApplies('bobil',key),true);
 assert.equal(canonicalDocumentFactKeys.filter(k=>k===key).length,1);
 for(const name of [key,mcBobilFactLabel('mc',key)])assert.equal(normalizeTermName(name,{insuranceType:'MC'}),key);
 const t=term(key,'Dokumentert kundeverdi');
 const response=terms=>({output_text:JSON.stringify({company:'Frende',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[policy(terms)]})});
 assert.throws(()=>parseExtractionResponse(response([{...t,source:customerSource}])),/Uventede analysefelt/);
 const parsed=parseExtractionResponse(response([t])).insurances[0];
 // Source references are attached by the document pipeline after extraction.
 const first=normalizeDocumentFacts({...parsed,importantTerms:parsed.importantTerms.map(t=>({...t,source:customerSource}))});
 assert.deepEqual(first.map(t=>t.key),[key]);assert.deepEqual(first[0].source,customerSource);
 assert.deepEqual(normalizeDocumentFacts(policy(first)),first);
 for(const type of ['Innbo','Hus','Reise','Campingvogn','Båt','Hund','Katt','Snøscooter','Tilhenger'])
  assert.ok(normalizeDocumentFacts(policy([term(key,'X','Syntetisk bonus')],{type})).every(t=>t.key!==key),type);
 assert.equal(mcBobilKeyApplies('mc','parkering.bonus'),false);assert.equal(mcBobilKeyApplies('mc','bonus.secret'),false);
});
for(const label of ['Parkeringsskade – bonustap','Parkeringsdekning – bonustap','PARKERINGSSKADE: BONUSTAP','Parkeringsskade\u00a0— bonustap'])
 test('R-042-N: ambiguous '+label+' requires identity or exact effective product row',()=>{
  assert.ok(!normalizeTermName(label,{insuranceType:'MC'}).includes('.'));
  const raw=normalizeDocumentFacts(policy([{name:label,value:'Kundeverdi'}]));assert.equal(raw[0].key,undefined);assert.equal(parked(policy(raw)).status,'unknown');
  const explicit=normalizeDocumentFacts(policy([term('bonus.parkert','Kundeverdi',label)]));assert.equal(explicit[0].key,'bonus.parkert');
  assert.deepEqual(normalizeDocumentFacts(policy(explicit)),explicit);
 });
for(const key of ['bonus.delkasko','bonus.parkert'])for(const value of [
 'Ingen bonustap når Parkert MC er valgt','Bonusfritak når Parkert MC er ikke valgt',
 'Ingen bonustap når maskinskade er valgt','Bonusfritak når maskinskade er ikke valgt',
 'Ingen bonustap når glass er valgt','Ingen bonustap når fører- og passasjerulykke er valgt',
 'Bonustap gjelder','Ingen bonustap',
])test('R-042-SE: '+key+' / '+value+' is a consequence, never selection',()=>{
 const input=policy([term(key,value)]),normalized=normalizeDocumentFacts(input);
 assert.deepEqual(normalized.map(t=>t.key),[key]);assert.equal(parked(policy(normalized)).status,'unknown');
 const out=enrich(ids[2],input.importantTerms);assert.deepEqual(out.addOnIds,[]);assert.equal(parked(out).status,'unknown');
 for(const id of ['maskinskade.dekning','glass.dekning','ulykke.dekning'])assert.equal(canonicalCoverage(out,'MC',id).status,'unknown');
});
for(const status of ['Valgt','Ikke valgt'])test('R-042-SE: independent explicit parking '+status+' survives bonus qualifier',()=>{
 const out=enrich(ids[2],[term('mc.parkert.dekning',status,'Parkert MC'),term('bonus.parkert','Ingen bonustap når Parkert MC er ikke valgt')]);
 assert.equal(parked(out).status,status==='Valgt'?'selected':'not_selected');
});
for(const id of ids)for(const key of ['bonus.delkasko',...(id===ids[2]?['bonus.parkert']:[])])
 test('R-042-PRIORITY: explicit customer '+key+' wins on '+id,()=>{
  const t={...term(key,'Kundens eksplisitte særvilkår',fact(id,key).label),source:customerSource},out=enrich(id,[t]);
  const rows=out.importantTerms.filter(t=>t.key===key);assert.equal(rows.length,1);assert.equal(rows[0].value,t.value);
  assert.equal(rows[0].coverageOrigin,'document');assert.deepEqual(rows[0].source,customerSource);
  assert.equal(parked(out).status,'unknown');assert.deepEqual(out.addOnIds,[]);
 });
test('R-042-PRIORITY: exact product fallback and absence/ambiguity stay conservative',()=>{
 const t={name:'Parkeringsskade – bonustap',value:'Kundeverdi'};
 assert.equal(enrich(ids[2],[t]).importantTerms.find(t=>t.key==='bonus.parkert').value,'Kundeverdi');
 for(const id of ids.slice(0,2))assert.ok(enrich(id,[t]).importantTerms.some(t=>t.value==='Kundeverdi'&&!t.key));
 for(const extra of [{productName:'Ukjent',canonicalProductName:'Ukjent'},{agreementScope:'lofavor'}]){
  const out=enrich(ids[2],[t],extra);assert.equal(out.catalogReference,null);assert.ok(out.importantTerms.some(t=>t.value==='Kundeverdi'&&!t.key));
 }
 const p=product(ids[2]),component=p.componentIds[0],f=fact(ids[2],'bonus.parkert');
 const catalog={...productCatalog,facts:{...productCatalog.facts,[component]:[...productCatalog.facts[component],{...f,key:'bonus.delkasko'}]}};
 const effective=resolveCatalogFacts(p,[],date,null,catalog);
 assert.ok(!effective.some(f=>f.key==='bonus.delkasko'));
 const out=enrich(ids[2],[t],{},catalog);
 assert.equal(out.importantTerms.find(t=>t.value==='Kundeverdi').key,'bonus.parkert');
 assert.equal(parked(out).status,'unknown');
 // True label ambiguity needs two effective identities, not a rejected
 // conflicting value for an already existing canonical key.
 const ambiguousCatalog={...productCatalog,facts:{...productCatalog.facts,[component]:[
  ...productCatalog.facts[component].filter(f=>f.key!=='bonus.delkasko'),{...f,key:'bonus.delkasko'}]}};
 assert.equal(resolveCatalogFacts(p,[],date,null,ambiguousCatalog).filter(row=>row.label===f.label).length,2);
 const ambiguous=enrich(ids[2],[t],{},ambiguousCatalog);
 assert.ok(ambiguous.importantTerms.some(t=>t.value==='Kundeverdi'&&!t.key));assert.equal(parked(ambiguous).status,'unknown');
});
test('R-042-FLOW: customer same product, both directions and product bonus filter',()=>{
 const a=enrich(ids[2],[term('bonus.parkert','Kundeverdi A')]),b=enrich(ids[2],[term('bonus.parkert','Kundeverdi B')]);
 const group=(a,b)=>groupTerms({key:'mc',first:[a],second:[b],leftKey:'mc',rightKey:'mc'},null);
 const ab=group(a,b).find(r=>r.key==='bonus.parkert'),ba=group(b,a).find(r=>r.key==='bonus.parkert');
 assert.equal(ab.first,'Kundeverdi A');assert.equal(ab.second,'Kundeverdi B');assert.equal(ab.first,ba.second);assert.equal(ab.second,ba.first);
 const same=group(a,a).find(r=>r.key==='bonus.parkert');assert.equal(same.first,same.second);
 for(const id of ids)for(const peer of [id,'if-mc-kasko'])for(const [x,y] of [[id,peer],[peer,id]]){
  const c=compareCatalogProducts(product(x),product(y));assert.ok(c.sections.flatMap(s=>s.rows).every(r=>!r.key.startsWith('bonus.')));
  if(x===y)assert.equal(c.differenceCount,0);
 }
});
test('R-042-FLOW: multi-document bonus, supporting evidence and object isolation',()=>{
 const a=mcBobilRecord('MC',1,{company:'Frende',importantTerms:[term('bonus.parkert','Kun objekt A','Parkeringsskade – bonustap')]}),
  b=mcBobilRecord('MC',2,{company:'Frende',importantTerms:[]});
 const out=documentPipeline([[a],[b]],'existing',true,true).insuranceData.insurances;
 assert.equal(out.length,2);assert.equal(out.filter(r=>r.importantTerms.some(t=>t.key==='bonus.parkert'&&t.value==='Kun objekt A')).length,1);
 assert.ok(out.every(r=>parked(r).status==='unknown'));
 const customer={...enrich(ids[2],[term('bonus.parkert','Kundeverdi')]),company:'Frende'};
 const supporting={...policy([{name:'Parkeringsdekning – bonustap',value:'Generelt vilkår'}]),company:'Frende',agreementScope:'ordinary',
  documentRole:'general_terms',agreementPeriod:null,objectIdentifiers:[],documentSources:[],documentReferences:[]};
 const merged=attachSupportingTerms(customer,[supporting],'existing');
 assert.equal(merged.importantTerms.find(t=>t.key==='bonus.parkert').value,'Kundeverdi');
 assert.ok(!merged.importantTerms.some(t=>t.value==='Generelt vilkår'));assert.ok(Array.isArray(merged.recordEvidence));
 assert.ok(merged.recordEvidence.some(r=>r.importantTerms.some(t=>t.value==='Generelt vilkår')));assert.equal(parked(merged).status,'unknown');
 const raw=policy([{name:'Parkeringsskade – bonustap',value:'X'}]),keyed=policy([{name:'Parkeringsskade – bonustap',value:'X',key:'bonus.parkert'}]);
 assert.equal(buildMatchingBatch([raw],[keyed]).termScopes.length,0);assert.equal(buildMatchingBatch([keyed],[raw]).termScopes.length,0);
});
test('R-042-SCOPE: shared source bytes never permit Bobil/MC or provider/scope leakage',()=>{
 const p=product(ids[2]),row={key:'bonus.parkert',value:'X',sourceId:source,page:10,section:'11.13'};
 const definition={providerId:'frende',company:'Frende',type:'mc',agreementScope:'ordinary',productId:'synthetic-mc',name:'Kasko',version:'2026-01-01',sourceId:source,rows:[row]};
 assert.equal(buildMcBobilCatalog(productCatalog.sources,[definition]).facts['synthetic-mc'][0].key,'bonus.parkert');
 for(const change of [{type:'bobil'},{providerId:'if'},{agreementScope:'lofavor'}])assert.throws(()=>buildMcBobilCatalog(productCatalog.sources,[{...definition,...change}]),/source applicability/);
 for(const key of ['parkering.bonus','bonus.secret'])assert.throws(()=>buildMcBobilCatalog(productCatalog.sources,[{...definition,rows:[{...row,key}]}]),/Invalid MC\/Bobil catalog fact/);
 for(const scope of [{insuranceType:'Bobil',agreementScope:'ordinary'},{insuranceType:'MC',agreementScope:'lofavor'}])
  assert.equal(findCatalogProduct('frende',ids[2],'2026-01-01',scope),null);
 assert.equal(findCatalogProduct('frende',ids[2],'2025-01-01',{insuranceType:'MC',agreementScope:'ordinary'}),null);
 for(const p of productCatalog.products)if(!ids.includes(p.productId))
  assert.ok(resolveCatalogFacts(p,[],date).every(f=>!(f.source.documentId===source&&f.key.startsWith('bonus.'))));
 assert.equal(fact('if-bobil-super','parkering.bonus').value,'Ingen bonustap for skader innen denne dekningen');
 assert.equal(fact('storebrand-bobil-super','parkering.bonus').value,'Uten bonustap innen beløpsgrensen');
 assert.equal(fact('frende-bobil-kasko','bonus.parkert').source.documentId,'mcb-ff-frende-bobil-terms');
});
for(const [id,pc] of [[ids[0],[623,624,625,626,627,628]],[ids[1],[629,630,631,632,633,634,635,636,637,638]],[ids[2],[639,640,641,642,643,644,645,646,647,648,649,650,651]]])
 test('R-042-PC: PC-'+pc.map(n=>String(n).padStart(4,'0')).join('/PC-')+' source-qualified positive controls',()=>{
  assert.equal(fact(id,'avtale.geografi').value,'Europa unntatt Russland, Tyrkia og Belarus');assert.equal(fact(id,'rettshjelp.geografi').value,'Norden');
  assert.equal(fact(id,'rettshjelp.egenandel').value,'4 000 kr pluss 20 % av øvrige kostnader');
  const fs=resolveCatalogFacts(product(id),[accident],date),dod=fs.find(f=>f.key==='ulykke.dod');
  assert.equal(dod.value,'100 000 kr hvis avdøde etterlot ektefelle, samboer eller barn, eller var under 21 år');
  assert.ok(!facts(id).some(f=>f.key.startsWith('ulykke.')));assert.equal(manual(id).annualPremium,null);
  if(id!==ids[0]){
   assert.equal(fact(id,'utstyr.grense').value,'Inntil 20 000 kr');assert.match(fact(id,'mc.kjoreutstyr.dekning').value,/Kjøredress, hansker, støvler og hjelm/);
   assert.equal(fact(id,'veihjelp.egenandel').value,'750 kr');assert.equal(fact(id,'brann.egenandel').value,'6 000 kr med mindre lavere egenandel står i forsikringsbeviset');
   assert.match(fact(id,'tyveri.egenandel').value,/6 000 kr.*lavere egenandel.*ingen egenandel hvis tyverialarm fungerte/);
  }
  if(id===ids[2]){assert.equal(fact(id,'mc.bagasje.grense').value,'Inntil 10 000 kr');assert.match(fact(id,'kasko.dekning').value,/sammenstøt, utforkjøring, velt, hærverk og feilfylling/);}
  else assert.ok(!facts(id).some(f=>f.key==='mc.bagasje.grense'));
  assert.ok(!availableAddOns(product(id),date).some(a=>/maskin|utvidet/i.test(a.name)));
 });
test('R-042-REGRESSION: document priority and selected/rejected optional accident retain their contract',()=>{
 for(const id of ids){
  const out=enrich(id,[term('rettshjelp.grense','Dokumentert sum fra kunden')]);assert.equal(out.importantTerms.find(t=>t.key==='rettshjelp.grense').value,'Dokumentert sum fra kunden');
  for(const [value,status] of [['Valgt','selected'],['Ikke valgt','not_selected']]){
   const selected=enrich(id,[term('ulykke.dekning',value,'Fører- og passasjerulykke')]);
   assert.equal(canonicalCoverage(selected,'MC','ulykke.dekning').status,status);
   assert.deepEqual(selected.addOnIds,status==='selected'?[accident]:[]);
  }
 }
});
