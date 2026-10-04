import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,availableAddOns,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,sourceHash,date,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// B045 own Trailer sources only. Approved SF-2625 includes Kasko; SF-2594 does not.
// Physical deductible conflicts SC-002/SC-015/SR-022/HR-001 remain unresolved.
const ids=['frende-tilhenger-brann-og-tyveri','frende-tilhenger-kasko'];
const pdfFile='frende-TrailerInsurance.pdf',htmlFile='frende-tilhengerforsikring.html';
const read=file=>readFileSync(new URL('../catalog/sources/vehicle-extensions/'+file,import.meta.url));
const own=(id,key)=>fact(id,'tilhenger.'+key);
const check=(f,patterns)=>{for(const p of patterns)assert.match(f.value,p);return f;};
const bindings=[
 ['dc3dd7e6392e2a00','GAP-1776','SF-2576',0],['dc3dd7e6392e2a00','GAP-1798','SF-2605',1],
 ['5dfe8434f98723b2','GAP-1777','SF-2577',0],['5dfe8434f98723b2','GAP-1799','SF-2606',1],
 ['5fac60fd11644ee8','GAP-1778','SF-2578',0],['5fac60fd11644ee8','GAP-1800','SF-2607',1],
 ['64eac561455f4dc4','GAP-1779','SF-2579',0],['64eac561455f4dc4','GAP-1801','SF-2608',1],
 ['baecebe36d3a4914','GAP-0122','SF-0202',0],['baecebe36d3a4914','GAP-0123','SF-0203',1],
 ['ec09ac7820af51c9','GAP-1780','SF-2580',0],['ec09ac7820af51c9','GAP-1802','SF-2609',1],
 ['8c3d0b61762fc4fb','GAP-1781','SF-2581',0],['8c3d0b61762fc4fb','GAP-1803','SF-2610',1],
 ['d7288275a68a7c8e','GAP-1810','SF-2617',1],['f42116db4ead13b5','GAP-1811','SF-2618',1],
 ['e2f8c5bee70295ab','GAP-1791','SF-2594',0],['e2f8c5bee70295ab','GAP-1815','SF-2625',1],
];
const limit=[/100 000 kr per tvist/,/250 000 kr/,/minst tre parter på samme side/,/begrenset til økonomisk interesse|Begrenset til den økonomiske interessen i saken/,/forsikringer\/selskaper|forsikringer eller selskaper/,/Uforsikrede parter bærer sin andel og holdes utenfor erstatningsberegningen/];
const deductible=[/4 000 kr pluss 20 % av øvrige kostnader/,/én (egenandel )?per tvist/];
function dimension(sig,id){
 if(sig==='dc3dd7e6392e2a00')return[check(own(id,'rettshjelp.dekning'),[/privatkunder som personlig eier, rettmessig bruker eller fører av den forsikrede tilhengeren/,/Tvisten må oppstå mens forsikringen gjelder/,/tidligere eier etter salg, når forsikringen i Frende opphørte i forbindelse med salget/,/tvist med selger ved kjøp av nytt kjøretøy før ny forsikring når nåværende kjøretøy var forsikret/,/Samme tvist blir ikke flere ved flere spørsmål, søksmål eller parter på samme side/,/Dekningen gjelder tvist som kan føres for de alminnelige domstolene\. Voldgift og særdomstol omfattes når tvisten ellers kunne vært ført for alminnelige domstoler/])];
 if(sig==='5dfe8434f98723b2'){
  const f=check(own(id,'rettshjelp.dekning'),[/Rimelige og nødvendige utgifter til egen advokat, registrert rettshjelper, retten, advokatmekler som er godkjent av Advokatforeningen og sakkyndige/,/ved rettsbehandling også vitner og rettsgebyr til forliksrådet og tingretten/,/Ikke rettsgebyr ved anke, kjæremål eller andre rettsmidler/,/saksomkostninger du blir idømt eller påtar deg i et forlik/,/Tilkjente omkostninger trekkes fra, med unntak ved dokumentert betalingsudyktig motpart/,/hvis du i en dom blir tilkjent saksomkostninger, kreves forhåndsgodkjenning fra Frende for et senere forlik som innebærer at du må bære dine egne omkostninger/,/sameiere/,/tvist som har sammenheng med yrket ditt eller virksomheten din/,/separasjon\/skilsmisse\/barnefordeling\/samvær\/farskap\/arv\/omstøtelse\/underholdsbidrag\/oppløsning av økonomisk fellesskap mellom samboere eller oppløsning av husstandsfellesskap\/skifte/,/tvist som bare hører inn under namsmyndighetene/,/ubestridt inkasso og gjeldsforhandling\. Sak som gjelder konkurs eller akkordforhandling er unntatt hvis du er konkurs- eller akkordskyldner\./,/straffesak hvor du er fornærmet, mistenkt, siktet, tiltalt eller saksøkt,/,/erstatning for krenkelser etter skadeserstatningsloven §§ 3-3, 3-5, 3-6 og 3-6 a, eller bøter eller gebyrer/,/ulovlig handling fra noen som er omfattet av forsikringen/,/Tvist som gjelder forvaltningsvedtak er unntatt\. Likevel erstattes utgifter ved søksmål etter at klageadgangen er fullt utnyttet; utgifter pådratt før søksmål ble reist, er ikke dekket\./,/Unntatt tvist om advokatsalær eller utgifter til sakkyndige\./,/Ikke utgifter før tvist, før søksmål ved forvaltningsvedtak eller grunnlag som oppstod før forsikringen/]);
  // The debtor qualification belongs to bankruptcy/composition, never debt negotiation.
  assert.doesNotMatch(f.value,/gjeldsforhandling[^.]*akkordskyldner|anke unntatt|bare i første instans/);return[f];
 }
 if(sig==='5fac60fd11644ee8')return[check(own(id,'rettshjelp.grense'),limit)];
 if(sig==='64eac561455f4dc4')return[check(own(id,'rettshjelp.egenandel'),[...deductible,/flere parter på samme side/])];
 if(sig==='baecebe36d3a4914')return[check(own(id,'rettshjelp.dekning'),[...limit,...deductible])];
 if(sig==='ec09ac7820af51c9'){const f=check(own(id,'brann.dekning'),[/brann eller lynnedslag/,/Svimerker og skade på delen eller komponenten der brann eller kortslutning oppstod erstattes ikke/,/følgeskaden av brannen eller kortslutningen omfattes/]);assert.doesNotMatch(f.value,/åpne flammer|eksplosjon/);return[f];}
 if(sig==='8c3d0b61762fc4fb')return[check(own(id,'tyveri.dekning'),[/Tyveri av tilhengeren og skade ved tyveri eller forsøk på tyveri etter straffeloven §321/,/husstandsmedlem eller ansatt/,/tilhengeren er lånt eller prøvd og ikke levert tilbake/])];
 if(sig==='d7288275a68a7c8e')return[check(own(id,'kasko.dekning'),[/Plutselig og uforutsett skade på tilhengeren etter sammenstøt, utforkjøring, velt og hærverk/,/feilfylling av drivstoff der dette er relevant for det forsikrede objektet/])];
 if(sig==='f42116db4ead13b5'){
  const f=check(own(id,'kasko.begrensning'),[/Motor, gir, drivverk og elektroniske styreenheter omfattes bare når årsaken er annen dekket skade/,/frost, fukt, vann, råte/,/innvendige flekker, svimerker, søl, bruksslitasje, rust\/slitasje og underslag/,/fabrikant, leverandør eller reparatør er ansvarlig for er unntatt/,/hvis kravet ikke fører frem, erstattes skaden når den ellers er dekket, og Frende overtar kravet/,/Løse ting og bagasje på tilhenger er ikke omfattet/]);
  assert.doesNotMatch(f.value,/sprekker|gliper|lekkasjer|fukttest|campingvognens/);return[f];
 }
 assert.equal(sig,'e2f8c5bee70295ab');return['brann','tyveri',...(id===ids[1]?['kasko']:[])].map(k=>check(own(id,k+'.dekning'),[/Dekningen gjelder også når tilhengeren ikke er festet til bilen/]));
}
for(const[sig,gap,sf,tier]of bindings)test('R-045-'+sig+': '+gap+'/'+sf+' exact own-source dimension',()=>{
 for(const f of dimension(sig,ids[tier])){
  assert.equal(f.source.documentId,'vehicle:'+pdfFile);assert.equal(f.source.filename,pdfFile);
  assert.equal(f.source.url,'https://api.frende.no/documents/terms/public/pnc/TrailerInsurance');
  assert.equal(f.source.effectiveFrom,'2026-01-01');assert.equal(f.source.termsNumber,'');
  assert.ok(f.source.section);assert.ok(f.source.page>=2&&f.source.page<=13);
  if(sig==='e2f8c5bee70295ab'){assert.equal(f.qualificationSource.documentId,'vehicle:'+htmlFile);assert.equal(f.qualificationSource.page,1);assert.match(f.qualificationSource.section,/FAQ: Er tilhengeren min dekket/);assert.equal(f.qualificationSource.effectiveFrom,'');assert.equal(f.qualificationSource.termsNumber,'');}
 }
});

test('R-045-SOURCE: immutable own originals, source clauses, exact signature/binding inventory',async()=>{
 sourceHash('catalog/sources/vehicle-extensions/'+pdfFile,'088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88');
 sourceHash('catalog/sources/vehicle-extensions/'+htmlFile,'224e454c7280f9001d06af28ec51090175ccc6c8e76eb842e74bfa67d76ef93f');
 sourceHash('catalog/sources/vehicle-extensions/frende-Generelle_vilkår-01012026.pdf','7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b');
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-045');
 assert.deepEqual(batch.signature_ids.sort(),[...new Set(bindings.map(b=>b[0]))].sort());assert.equal(bindings.length,18);assert.equal(new Set(bindings.map(b=>b[0])).size,10);
 assert.deepEqual(batch.P2_piggyback_signatures,[]);assert.deepEqual(batch.dependencies,[]);
 const expected=batch.evidence.flatMap(e=>e.finding_ids.map((g,i)=>[g,e.source_fact_ids[i],JSON.parse(e.product_identities[i]??e.product_identity)[3]]));
 assert.deepEqual(expected.sort(),bindings.map(([,g,s,t])=>[g,s,ids[t]]).sort());
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:read(pdfFile)});
 try{
  const pdf=await parser.getText(),p=n=>pdf.pages[n-1].text.replace(/\s+/g,' ');
  assert.match(p(1),/2026/);assert.match(p(1),/tilhenger/i);
  assert.match(p(3),/lynnedslag/);assert.match(p(3),/321/);assert.match(p(3),/sammenstøt/);assert.match(p(4),/fabrikant/i);
  assert.match(p(12),/gjeldsforhandling/);assert.match(p(12),/konkurs[^.]{0,150}akkordskyldner/);
  assert.match(p(12),/Vi erstatter ikke rettsgebyr ved anke, kjæremål eller bruk av andre rettsmidler/);
  assert.match(p(12),/100[ .]?000/);assert.match(p(12),/250[ .]?000/);assert.match(p(13),/4[ .]?000/);assert.match(p(13),/20 prosent/);
 }finally{await parser.destroy();}
 assert.match(read(htmlFile).toString(),/Kasko, brann og tyveri er også dekket dersom tilhenger ikke er festet til bilen/);
});

const PCs=[
 [79,0,'geography'],[80,1,'geography'],[81,0,'admin'],[82,1,'admin'],[83,0,'equipment'],[84,1,'equipment'],
 [85,0,'cargo'],[86,1,'cargo'],[87,0,'innbo'],[88,1,'innbo'],
 [736,0,'geography'],[737,0,'admin'],[738,0,'cargo'],[739,0,'innbo'],[740,0,'silence'],[741,0,'admin'],
 [742,1,'geography'],[743,1,'admin'],[744,1,'cargo'],[745,1,'innbo'],[746,1,'silence'],[747,1,'admin'],
];
for(const[pc,tier,kind]of PCs)test('R-045-PC-'+String(pc).padStart(4,'0')+': held positive-control boundary',()=>{
 const id=ids[tier],rows=facts(id);
 if(kind==='geography')assert.equal(own(id,'avtale.geografi').value,'Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden');
 if(kind==='equipment'){assert.equal(own(id,'utstyr.grense').value,'20 000 kr fastmontert ekstrautstyr');assert.equal(enrich(id,[]).deductible,null);}
 if(kind==='cargo'){assert.match(own(id,'kasko.begrensning').value,/Løse ting og bagasje på tilhenger er ikke omfattet/);assert.ok(rows.every(f=>!/^tilhenger\.(losore|bagasje)\.dekning$/.test(f.key)));if(tier===0)assert.equal(rows.some(f=>f.key==='tilhenger.kasko.dekning'),false);}
 if(kind==='innbo')assert.ok(rows.every(f=>!/^tilhenger\.(ansvar|ulykke|losore|bagasje)\.dekning$/.test(f.key)));
 if(kind==='silence')assert.ok(rows.every(f=>!/^tilhenger\.(glass|redning|nyverdi|maskinskade|leiebil|delkasko)\./.test(f.key)));
 if(kind==='admin')assert.ok(rows.every(f=>!/^tilhenger\.(administrasjon|oppsigelse|skademelding|renter|svik|skjonn|vinning)\./.test(f.key)));
});

test('R-045-STATE: bases included; no invented Kasko, optional cover or public customer deductible',()=>{
 for(let tier=0;tier<2;tier++){const id=ids[tier],out=enrich(id,[]),m=materializeCatalogProduct(product(id));
  for(const k of ['rettshjelp','brann','tyveri',...(tier===1?['kasko']:[])]){
   assert.equal(own(id,k+'.dekning').coverageAvailability,'included');
   assert.equal(canonicalCoverage(out,'Tilhenger','tilhenger.'+k+'.dekning').status,'selected');
   assert.equal(m.facts.find(f=>f.key==='tilhenger.'+k+'.dekning').state,'included');
  }
  assert.deepEqual(out.addOnIds,[]);assert.deepEqual(availableAddOns(product(id),date),[]);
  assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
  assert.ok(facts(id).every(f=>!/^tilhenger\.(brann|tyveri|kasko)\.egenandel$/.test(f.key)));
 }
 const row=compareCatalogProducts(product(ids[0]),product(ids[1])).sections.flatMap(s=>s.rows).find(r=>r.key==='tilhenger.kasko.dekning');
 assert.equal(row.first.state,'unknown');assert.equal(row.second.state,'included');
});
test('R-045-PRIORITY: explicit document values/declines outrank parent and detail catalog facts',()=>{
 for(let tier=0;tier<2;tier++)for(const short of ['rettshjelp.dekning','rettshjelp.grense','rettshjelp.egenandel','brann.dekning','tyveri.dekning',...(tier===1?['kasko.dekning','kasko.begrensning']:[])]){
  const id=ids[tier],key='tilhenger.'+short;documentPriority(id,key,'Kundens dokumenterte verdi 2 777 kr');
  if(short.endsWith('.dekning')){documentPriority(id,key,'Ikke valgt');assert.equal(canonicalCoverage(enrich(id,[{name:fact(id,key).label,canonicalKey:key,value:'Ikke valgt'}]),'Tilhenger',key).status,'not_selected');}
 }
});
test('R-045-COMPARE: identical product, exact source values and both directions',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Tilhenger'&&catalogAgreementScope(p)==='ordinary');
 for(const id of ids)for(const peer of peers){
  const a=compareCatalogProducts(product(id),peer),b=compareCatalogProducts(peer,product(id));
  for(const row of a.sections.flatMap(s=>s.rows)){
   const rev=b.sections.flatMap(s=>s.rows).find(r=>r.key===row.key);assert.ok(rev);assert.deepEqual(row.first,rev.second);assert.deepEqual(row.second,rev.first);
   if(peer.productId===id)assert.equal(row.different,false);
  }
  for(const f of facts(id)){const row=a.sections.flatMap(s=>s.rows).find(r=>r.key===f.key);assert.ok(row);assert.ok(row.first.facts.some(t=>t.value===f.value));}
 }
});
test('R-045-PROVENANCE: primary and qualification survive all customer/product converters',()=>{
 for(const id of ids)for(const f of facts(id)){
  for(const [mode,out] of [['enrich',enrich(id,[])],['manual',manual(id)]]){
   const t=out.importantTerms.find(t=>t.key===f.key);
   if(mode==='enrich'&&id===ids[0]&&f.key==='tilhenger.kasko.begrensning'){
    assert.equal(facts(id).some(f=>f.key==='tilhenger.kasko.dekning'),false);
    assert.equal(t,undefined);
    assert.equal(out.importantTerms.some(t=>t.key==='tilhenger.kasko.dekning'),false);
    continue;
   }
   assert.ok(t,mode+' '+id+' '+f.key);assert.equal(t.value,f.value);
   for(const source of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])])assert.ok(t.sources.some(s=>Object.entries(source).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)));
  }
  const t=materializeCatalogProduct(product(id)).facts.find(t=>t.key===f.key);
  assert.equal(t.sources.length,f.qualificationSource?2:1);
  for(const source of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])])assert.ok(t.sources.some(s=>Object.entries(source).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)));
 }
 const f=own(ids[1],'kasko.begrensning');assert.equal(f.source.page,4);assert.equal(f.qualificationSource.page,2);assert.equal(f.qualificationSource.section,'3.9 – Løse ting og bagasje gjelder ikke tilhenger');
});
test('R-045-SCOPE: exact provider/type/channel/scope/version; no other family inherits own Trailer sources',()=>{
 for(const id of ids){
  const p=product(id);assert.equal(p.providerId,'frende');assert.equal(p.insuranceType,'Tilhenger');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,'2026-01-01');
  for(const overrides of [{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Tilhenger',agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,null,overrides),null);
  assert.equal(findCatalogProduct('if',id,null,{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);
  assert.equal(findCatalogProduct('frende',id,'invented',{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);
  assert.ok(facts(id).every(f=>f.key.startsWith('tilhenger.')));
 }
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>![pdfFile,htmlFile].includes(f.source.filename)&&![pdfFile,htmlFile].includes(f.qualificationSource?.filename)));
});
