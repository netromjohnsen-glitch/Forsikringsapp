import {applyLegal} from './helpers/b051-legal.mjs';
import {applySmart} from './helpers/b051-smart.mjs';
import {applyHealthHelp} from './helpers/b051-health-help.mjs';
import { applyLiability } from './helpers/b051-liability.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {catalogFactSources,enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {baselineCatalog as previousBaseline,expectedCatalog as previousExpectedCatalog,keys as changedKeys,sourceOracle} from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const baseline=applyLegal(applySmart(applyHealthHelp(applyLiability(previousBaseline)))),expectedCatalog=applyLegal(applySmart(applyHealthHelp(applyLiability(previousExpectedCatalog))));
const candidate=productCatalog,d=new Date('2026-10-07T12:00:00Z');
const ids=['gjensidige-hus','gjensidige-hus-pluss'],addon='gjensidige-hus-rate-insekter';
const keys=[...changedKeys,'hus.rate.dekning'];
const product=(c,id)=>c.products.find(p=>p.productId===id);
const raw=(c,owner,key)=>c.facts[owner].find(f=>f.key===key);
const source={documentId:'preflight-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',url:'https://example.invalid/customer',page:2,section:'Dokumenterte kundevilkår'};
const label=key=>raw(baseline,'gjensidigeHusStandard',key)?.label;
const term=(key,value)=>({name:label(key),canonicalKey:key,value,source});
const input=(c,id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:product(c,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]});
const enrich=(c,id,terms)=>enrichExtractedAgreementWithCatalog(input(c,id,terms),d,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},d,undefined,undefined,c).insurances[0];
const state=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const pick=(i,key)=>i.importantTerms.filter(t=>t.key===key);
const record=(id,role,entries)=>({...input(baseline,id).insurances[0],canonicalProductName:product(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:entries.map(([key,value])=>({name:label(key),value,documentIndices:[1]}))});
function pipeline(c,docs,side='existing'){const saved=productCatalog.facts;try{productCatalog.facts=c.facts;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts=saved;}}
const manual=(c,id,custom=false,addons=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':product(c,id).name,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:addons,importantTerms:keys.map(key=>({name:label(key),value:'Manuelt vilkår 73 000 kr'}))}]},c).insuranceData.insurances[0];
const samples=[];
let count=0;function check(name,fn){test('R-051-PHYSICAL-'+(++count)+' '+name,fn);}
for(const id of ids)for(const key of keys)for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check(`enrich/${id}/${key}/${values.join('+')}`,()=>{
 const ts=values.map(v=>term(key,v)),a=enrich(baseline,id,ts),b=enrich(candidate,id,ts),aa=repeat(baseline,a),bb=repeat(candidate,b);
 assert.deepEqual(state(b),state(a));assert.deepEqual(state(bb),state(aa));assert.deepEqual(b.addOnIds,a.addOnIds);
 for(const t of pick(b,key))if(t.coverageOrigin==='document'){assert.deepEqual(t.source,source);assert.equal(Object.hasOwn(t,'sources'),false);assert.ok(values.includes(t.value));}
 assert.deepEqual(pick(bb,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]),pick(b,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
 if(values[0]==='Kundevilkår 73 000 kr')assert.equal(pick(b,key)[0].value,values[0]);
 for(const t of pick(b,key))if(t.coverageOrigin==='catalog'){const f=resolveCatalogFacts(product(candidate,id),b.addOnIds,d,null,candidate).find(f=>f.key===key);assert.equal(t.value,f.value);assert.deepEqual(t.sources,catalogFactSources(f));}
 if(key==='hus.rate.dekning')samples.push({mode:'direct',id,values,before:state(a).filter(x=>x.id.includes('rate')),after:state(b).filter(x=>x.id.includes('rate')),addOns:b.addOnIds});
});
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])for(const side of ['existing','offer'])check(`pipeline/${id}/${role}/${side}/${values.join('+')}`,()=>{
 const docs=[[record(id,role,keys.flatMap(k=>values.map(v=>[k,v])))]],a=pipeline(baseline,docs,side),b=pipeline(candidate,docs,side);
 assert.equal(b.insurances.length,role==='general_terms'?0:1);assert.deepEqual(b.supportingEvidence,a.supportingEvidence);
 if(role==='general_terms'){for(const [i,t]of b.supportingEvidence[0].importantTerms.entries()){assert.deepEqual(t,a.supportingEvidence[0].importantTerms[i]);assert.equal(Object.hasOwn(t,'key'),true);assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}return;}
 const ai=a.insurances[0],bi=b.insurances[0];assert.deepEqual(state(bi),state(ai));assert.deepEqual(bi.addOnIds,ai.addOnIds);
 for(const k of keys)if(values[0]==='Kundevilkår 73 000 kr'){assert.equal(pick(bi,k)[0].value,values[0]);assert.deepEqual(pick(bi,k)[0].sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);assert.equal(Object.hasOwn(pick(bi,k)[0],'source'),false);}
});
for(const id of ids)check(`supporting/${id}`,()=>{const docs=[[record(id,'individual_agreement',[[keys[2],'Kundevilkår 73 000 kr']])],[record(id,'general_terms',[[keys[3],'Generelt råtevilkår']])]],a=pipeline(baseline,docs),b=pipeline(candidate,docs);assert.equal(b.insurances.length,1);assert.equal(b.supportingEvidence.length,1);assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.deepEqual(state(b.insurances[0]),state(a.insurances[0]));assert.equal(pick(b.insurances[0],keys[2])[0].value,'Kundevilkår 73 000 kr');});
for(const id of ids)for(const custom of [false,true])for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],...(id===ids[0]?[[addon]]:[])])check(`manual/${id}/${custom}/${addons}`,()=>{if(custom&&addons.length){for(const c of [baseline,candidate])assert.throws(()=>manual(c,id,custom,addons),/Tillegg krever et sikkert katalogprodukt/u);return;}const a=manual(baseline,id,custom,addons),b=manual(candidate,id,custom,addons);assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);assert.equal(b.catalogFacts,null);}else{for(const k of keys)for(const t of pick(b,k)){assert.equal(t.coverageOrigin,'catalog');assert.notEqual(t.value,'Manuelt vilkår 73 000 kr');const f=resolveCatalogFacts(product(candidate,id),addons,d,null,candidate).find(f=>f.key===k);assert.deepEqual(t.sources,catalogFactSources(f).map((s,i)=>({...s,note:i?[s.note,'Supplerende kilde for faktumets anvendelse'].filter(Boolean).join(' · '):[...(f.source.note?[f.source.note]:[]),...(f.replacesBase?['Effektiv verdi fra dokumentert utvidelse eller tillegg']:[])].join(' · ')||undefined})));if(t.overriddenBase)assert.equal(t.overriddenBase.length,k===keys[1]&&id===ids[1]?1:pick(a,k)[0].overriddenBase?.length??0);}}});
for(const id of ids)check(`materialization/${id}`,()=>{const a=materializeCatalogProduct(product(baseline,id),baseline),b=materializeCatalogProduct(product(candidate,id),candidate);for(const k of keys){const aa=a.facts.filter(f=>f.key===k),bb=b.facts.filter(f=>f.key===k);assert.deepEqual(bb.map(f=>[f.state,f.role,f.addOnNames]),aa.map(f=>[f.state,f.role,f.addOnNames]));for(const t of bb){assert.ok(t.sources.length);for(const s of t.sources){assert.equal(s.sourceType,undefined);assert.equal(Object.hasOwn(s,'productCode'),true);assert.equal(s.productCode, s.documentId==='gjensidigeHusIpid'?'EAP01':undefined);}}samples.push({mode:'product',id,key:k,before:aa.map(f=>[f.state,f.role]),after:bb.map(f=>[f.state,f.role])});}});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check(`compare/${id}/${other}`,()=>{const a=compareCatalogProducts(product(candidate,id),product(candidate,other),candidate),b=compareCatalogProducts(product(candidate,other),product(candidate,id),candidate);if(id===other)assert.equal(a.differenceCount,0);for(const row of a.sections.flatMap(s=>s.rows)){const reverse=b.sections.flatMap(s=>s.rows).find(r=>r.key===row.key);assert.deepEqual(row.first,reverse.second);assert.deepEqual(row.second,reverse.first);}});
for(const id of ids)for(const key of keys)check(`customer-compare/${id}/${key}`,()=>{const a=enrich(candidate,id,[term(key,'Kundevilkår 73 000 kr')]),b=manual(candidate,id);for(const [x,y,side]of [[a,b,'first'],[b,a,'second']]){const row=groupTerms(groupInsurances([x],[y],null)[0],null).find(r=>r.key===key);assert.equal(row[side],'Kundevilkår 73 000 kr');assert.deepEqual(row[side+'Sources'],[source]);}});
check('isolation',()=>{for(const k of ['sources','products','addOns','insuranceTypes'])assert.deepEqual(candidate[k],baseline[k]);const changes={'gjensidigeHusStandard':changedKeys,'gjensidigeHusPluss':[keys[1]]};for(const[owner,rows]of Object.entries(baseline.facts)){const excluded=changes[owner]??[];assert.deepEqual(candidate.facts[owner].filter(f=>!excluded.includes(f.key)),rows.filter(f=>!excluded.includes(f.key)),owner);}for(const p of candidate.products.filter(p=>!ids.includes(p.productId)))assert.deepEqual(resolveCatalogFacts(p,[],d,null,candidate),resolveCatalogFacts(product(baseline,p.productId),[],d,null,baseline),p.productId);for(const id of ids)for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],...(id===ids[0]?[[addon]]:[])]){const a=resolveCatalogFacts(product(baseline,id),addons,d,null,baseline),b=resolveCatalogFacts(product(candidate,id),addons,d,null,candidate);assert.deepEqual(b.filter(f=>!keys.includes(f.key)),a.filter(f=>!keys.includes(f.key)));assert.equal(Object.hasOwn(b.find(f=>f.key===keys[1]),'overriddenBase'),false);}});
check('complete-independent-source-oracle',()=>assert.deepEqual(candidate,expectedCatalog));
check('four-original-bindings',()=>{
 const a=JSON.parse(readFileSync(new URL('../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/authorization.json',import.meta.url)));
 const expected={'a4e5c76df5cbf2af':[['GAP-2093','SF-2999'],['GAP-2148','SF-3083']],'af3a3ee673fedc83':[['GAP-2094','SF-3003'],['GAP-2149','SF-3086']]};
 assert.deepEqual(a.signatures.map(s=>s.signature_id).sort(),Object.keys(expected).sort());
 for(const s of a.signatures){assert.equal(s.final_batch_id,'B-051');assert.equal(s.P2_occurrences,'0');assert.deepEqual(JSON.parse(s.finding_ids),expected[s.signature_id].map(p=>p[0]));assert.deepEqual(JSON.parse(s.source_fact_ids),expected[s.signature_id].map(p=>p[1]));assert.deepEqual(JSON.parse(s.products).map(JSON.parse),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));}
});
for(const[level,hash]of[['Standard','d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],['Pluss','79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792']])check('frozen-source-'+level,()=>{
 const p=new URL('../catalog/sources/gjensidige/hus/Hus-'+level+'-alminnelige-vilkar.pdf',import.meta.url);
 assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),hash);
 const registered=baseline.sources['gjensidigeHus'+level];assert.deepEqual(candidate.sources[registered.id],registered);assert.equal(registered.sha256,hash);assert.equal(registered.effectiveFrom,'');assert.equal(Object.hasOwn(registered,'sourceType'),false);
 const page=n=>execFileSync('pdftotext',['-raw','-f',String(n),'-l',String(n),p.pathname,'-']).toString().replace(/\s+/gu,' ');
 const p3=page(3),p4=page(4);
 for(const phrase of ['Skade som andre enn sikrede er pliktig til, og har økonomisk evne til å erstatte, i henhold til garanti eller annen avtale','Skade som skyldes manglende vedlikehold eller slitasje på bygning og tilknyttet utstyr','Skade forårsaket av mus, rotter og andre dyr','fysisk skade på bygning/bygningsdel, svekket isolasjonsevne og lukt'])assert.ok(p3.includes(phrase),level+' PDF3 '+phrase);
 for(const phrase of ['Skade som skyldes feil-, uforsiktig-, eller hard bruk','Skade som skyldes søl som pågår over tid, kondens, sopp, råte, bakterier,','Skade som kun består av flekker, riper, svinnsprekker, avskallinger, og knirk i gulv samt mindre hakk og merker','Punktering av isolerglass','utilstrekkelig eller sviktende fundamentering','Materialfeil, konstruksjonsfeil eller uriktig montasje, samt skader som følge av dette','Bygning/bygningsdeler som er revet uten godkjenning av Gjensidige','Krav i forbindelse med at ny eier av eiendommen gjør gjeldende mangelskrav mot sikrede'])assert.ok(p4.includes(phrase),level+' PDF4 '+phrase);
 if(level==='Standard'){
  for(const phrase of ['heksesot og kjæledyr','Bekjempelse av-, eller skade som skyldes insekter, som for eksempel stokkmaur og borebille','tele, setninger, jordtrykk'])assert.ok(p4.includes(phrase),phrase);
 }else{
  for(const phrase of ['heksesot, kjæledyr og insekter. Se avsnitt for Råte og skadeinsekter','fundamentering. Se avsnitt for Håndverks-/entreprenørfeil','følge av dette. Se avsnitt for Håndverks-/entreprenørfeil'])assert.ok(p4.includes(phrase),phrase);
  assert.ok(page(5).includes('Håndverks- og entreprenørfeil'));assert.ok(page(6).includes('Råte og skadeinsekter'));
 }
});
check('ipid-original-bytes-and-optional-extension',()=>{
 const p=new URL('../catalog/sources/gjensidige/hus/IPID-Husforsikring-EAP01.pdf',import.meta.url);
 assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),'5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9');
 const text=execFileSync('pdftotext',['-raw','-f','2','-l','2',p.pathname,'-']).toString().replace(/\s+/gu,' ');
 assert.ok(text.includes('Hus standard kan utvides med dekning for sopp, råte og skadeinsekter'));assert.match(text,/Utvidelser/u);
});
check('strict-source-fields-and-Pluss-inheritance',()=>{
 for(const id of ids)for(const key of changedKeys){
  const f=resolveCatalogFacts(product(candidate,id),[],d,null,candidate).find(f=>f.key===key),e=resolveCatalogFacts(product(expectedCatalog,id),[],d,null,expectedCatalog).find(f=>f.key===key);
  assert.deepEqual(f,e);assert.equal(Object.hasOwn(f,'overriddenBase'),false);
  assert.equal(f.replacesBase,id===ids[1]&&key===keys[1]?true:undefined);
  assert.equal(Object.hasOwn(f.source,'productCode'),true);assert.equal(f.source.productCode,undefined);assert.equal(Object.hasOwn(f.source,'sourceType'),false);
  const t=pick(enrich(candidate,id,[]),key)[0];assert.deepEqual(t,pick(enrich(expectedCatalog,id,[]),key)[0]);
  assert.equal(t.overriddenBase.length,id===ids[1]&&key===keys[1]?1:0);
  if(id===ids[1]&&key===keys[1])assert.deepEqual(t.overriddenBase,[{value:sourceOracle.standard[1].value,source:expectedCatalog.facts.gjensidigeHusStandard.find(f=>f.key===key).source}]);
 }
});
check('prior-receipts-immutable',()=>{
 const receipts=JSON.parse(readFileSync(new URL('../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/prior-receipts.json',import.meta.url)));
 assert.equal(receipts.length,51);assert.equal(new Set(receipts.map(r=>r.signature)).size,51);
 for(const r of receipts){const bytes=readFileSync(new URL('../'+r.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.equal(JSON.parse(bytes).status,'PASS');}
});
check('rot-baseline-finding-isolated-not-remediated',()=>{
 for(const id of ids)for(const values of [[],['Valgt'],['Ikke valgt'],['Valgt','Ikke valgt']]){
  const ts=values.map(v=>term('hus.rate.dekning',v)),a=enrich(baseline,id,ts),b=enrich(candidate,id,ts);
  assert.deepEqual(state(b),state(a));assert.deepEqual(b.addOnIds,a.addOnIds);
  assert.deepEqual(pick(b,'hus.rate.dekning'),pick(a,'hus.rate.dekning'));
 }
});
check('full-field-reverse-audit',()=>execFileSync('node',[new URL('./helpers/b051-liability.mjs',import.meta.url).pathname,'--audit'],{stdio:'pipe'}));
