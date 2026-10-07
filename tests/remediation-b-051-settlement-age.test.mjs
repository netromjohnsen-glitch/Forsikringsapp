import {applySmart} from './helpers/b051-smart.mjs';
import {applyHealthHelp} from './helpers/b051-health-help.mjs';
import { applyLiability } from './helpers/b051-liability.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,resolveProductComponentIds} from '../lib/product-catalog.ts';
import {catalogFactSources,enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {baselineCatalog as previousBaseline, expectedCatalog as previousExpectedCatalog, sourceOracle as oracle, commonExceptions, keys} from '../docs/audit/checkpoints/b051-settlement-age-0bcd250/expected-catalog.mjs';
import { applyRecovery } from '../docs/audit/checkpoints/b051-recovery-benefits-69c71dc/expected-catalog.mjs';
import { applyPhysical } from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const baseline=applySmart(applyHealthHelp(applyLiability(applyPhysical(applyRecovery(previousBaseline))))),expectedCatalog=applySmart(applyHealthHelp(applyLiability(applyPhysical(applyRecovery(previousExpectedCatalog)))));
const candidate=productCatalog,date=new Date('2026-10-07T12:00:00Z');
const ids=['gjensidige-hus','gjensidige-hus-pluss'];
const product=(c,id)=>c.products.find(p=>p.productId===id),fact=(c,key)=>c.facts.gjensidigeHusStandard.find(f=>f.key===key);
const input=(id,terms=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',productName:product(baseline,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]});
const source={documentId:'synthetic-settlement-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',company:'Gjensidige',url:'https://example.invalid/customer',page:2,section:'Avtalte oppgjørsvilkår'};
const term=(key,value)=>({name:fact(baseline,key).label,canonicalKey:key,value,source});
const enrich=(c,id,terms)=>enrichExtractedAgreementWithCatalog(input(id,terms),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const status=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const pick=(i,key)=>i.importantTerms.filter(t=>t.key===key);
const record=(id,role,entries)=>({...input(id).insurances[0],canonicalProductName:product(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:entries.map(([key,value])=>({name:fact(baseline,key).label,value,documentIndices:[1]}))});
const pipeline=(c,docs,side='existing')=>{const save=productCatalog.facts.gjensidigeHusStandard;try{productCatalog.facts.gjensidigeHusStandard=c.facts.gjensidigeHusStandard;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts.gjensidigeHusStandard=save;}};
const manual=(c,id,custom=false,addons=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':product(c,id).name,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:addons,importantTerms:keys.map(key=>({name:fact(baseline,key).label,value:'Manuelt vilkår 73 000 kr'}))}]},c).insuranceData.insurances[0];
const evidence=[];let count=0;function check(name,fn){count++;test('R-051-SETTLEMENT-'+name+'-'+count,fn);}
for(const id of ids)for(const key of keys)for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('enrichment',()=>{
 const ts=values.map(v=>term(key,v)),old=enrich(baseline,id,ts),cur=enrich(candidate,id,ts),a=repeat(baseline,old),b=repeat(candidate,cur);
 assert.deepEqual(status(cur),status(old));assert.deepEqual(status(b),status(a));assert.deepEqual(cur.addOnIds,[]);assert.deepEqual(b.addOnIds,[]);
 const fallback=!values.length||values[0]==='Ukjent';assert.deepEqual(pick(cur,key).map(t=>t.value),fallback?[oracle[key].value]:values);
 for(const t of pick(cur,key)){assert.equal(t.coverageOrigin,fallback?'catalog':'document');assert.deepEqual(t.source,fallback?fact(candidate,key).source:source);if(fallback)assert.deepEqual(t.sources,catalogFactSources(fact(candidate,key)));else assert.equal(Object.hasOwn(t,'sources'),false);}
 assert.deepEqual(pick(b,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]),pick(cur,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
 const added=(x,y)=>status(y).filter(v=>!status(x).some(w=>w.id===v.id));assert.deepEqual(added(cur,b),added(old,a));assert.deepEqual(added(cur,b),[{id:'rettshjelp.dekning',status:'selected',conflict:false}]);
 if(key===keys[0])evidence.push({mode:'enrichment',id,input:values,before_status:status(old),after_status:status(cur),raw_terms:pick(cur,key),repeat_alias:added(cur,b)});
});
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('pipeline',()=>{
 const docs=[[record(id,role,keys.flatMap(key=>values.map(value=>[key,value])))]];const old=pipeline(baseline,docs),cur=pipeline(candidate,docs);
 assert.equal(cur.insurances.length,role==='general_terms'?0:1);assert.equal(cur.supportingEvidence.length,role==='general_terms'?1:0);
 if(role==='general_terms'){assert.deepEqual(cur.supportingEvidence,old.supportingEvidence);for(const t of cur.supportingEvidence[0].importantTerms){assert.equal(t.key,undefined);assert.equal(Object.hasOwn(t,'key'),true);assert.equal(Object.hasOwn(t,'source'),false);assert.equal(t.sources.length,1);}}
 else{assert.deepEqual(status(cur.insurances[0]),status(old.insurances[0]));assert.deepEqual(cur.insurances[0].addOnIds,[]);
  for(const key of keys){const rows=pick(cur.insurances[0],key);const fallback=!values.length||values[0]==='Ukjent';assert.deepEqual(rows.map(t=>t.value),fallback?[oracle[key].value]:values);
   if(!fallback)for(const t of rows){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:'pdf:existing:0',filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}}
 }
 evidence.push({mode:'pipeline',id,role,input:values,customers:cur.insurances.length,support:cur.supportingEvidence.length,before_status:old.insurances.map(status),after_status:cur.insurances.map(status)});
});
for(const id of ids)check('support+customer',()=>{const docs=[[record(id,'individual_agreement',[[keys[0],'Kundevilkår 73 000 kr']])],[record(id,'general_terms',[[keys[1],'Generelt oppgjørsvilkår']])]];const old=pipeline(baseline,docs),cur=pipeline(candidate,docs);assert.equal(cur.insurances.length,1);assert.equal(cur.supportingEvidence.length,1);assert.deepEqual(cur.supportingEvidence,old.supportingEvidence);assert.equal(pick(cur.insurances[0],keys[0])[0].value,'Kundevilkår 73 000 kr');assert.deepEqual(status(cur.insurances[0]),status(old.insurances[0]));});
for(const id of ids)for(const custom of [false,true])check('manual',()=>{const old=manual(baseline,id,custom),cur=manual(candidate,id,custom);assert.deepEqual(status(cur),status(old));assert.deepEqual(cur.addOnIds,[]);if(custom){assert.deepEqual(cur,old);assert.equal(cur.catalogReference,null);assert.equal(cur.catalogFacts,null);assert.deepEqual(cur.importantTerms,keys.map(key=>({name:fact(baseline,key).label,value:'Manuelt vilkår 73 000 kr'})));}else for(const key of keys){const t=pick(cur,key)[0];assert.equal(t.coverageOrigin,'catalog');assert.equal(t.value,oracle[key].value);assert.deepEqual(t.sources,catalogFactSources(fact(candidate,key)).map((s,i)=>({...s,note:i?'Supplerende kilde for faktumets anvendelse':undefined})));}evidence.push({mode:'manual',id,custom,catalogReference:cur.catalogReference,source_example:pick(cur,keys[0])});});
for(const id of ids)check('materialization',()=>{const a=materializeCatalogProduct(product(baseline,id),baseline),b=materializeCatalogProduct(product(candidate,id),candidate);for(const key of keys){const old=a.facts.find(f=>f.key===key),cur=b.facts.find(f=>f.key===key);assert.equal(cur.state,old.state);assert.equal(cur.role,'term');assert.equal(cur.value,oracle[key].value);assert.deepEqual(cur.sources,catalogFactSources(fact(candidate,key)).map(s=>({...s,sourceType:undefined})));}evidence.push({mode:'product',id,rows:b.facts.filter(f=>keys.includes(f.key))});});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('product-comparison',()=>{const f=compareCatalogProducts(product(candidate,id),product(candidate,other),candidate),r=compareCatalogProducts(product(candidate,other),product(candidate,id),candidate);if(id===other)assert.equal(f.differenceCount,0);for(const key of keys){const a=f.sections.flatMap(s=>s.rows).find(r=>r.key===key),b=r.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);assert.deepEqual(a.first.sources,catalogFactSources(fact(candidate,key)).map(s=>({...s,sourceType:undefined})));}});
for(const id of ids)for(const key of keys)check('document-comparison',()=>{const c=enrich(candidate,id,[term(key,'Kundevilkår 73 000 kr')]),m=manual(candidate,id);for(const [a,b,side]of [[c,m,'first'],[m,c,'second']]){const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===key);assert.equal(row[side],'Kundevilkår 73 000 kr');assert.deepEqual(row[side+'Sources'],[source]);}});
let protectedCount=0;check('isolation',()=>{assert.deepEqual(candidate.sources,baseline.sources);assert.deepEqual(candidate.products,baseline.products);assert.deepEqual(candidate.addOns,baseline.addOns);for(const [owner,rows]of Object.entries(baseline.facts)){const excluded=owner==='gjensidigeHusStandard'?keys:[];const old=rows.filter(f=>!excluded.includes(f.key)),cur=candidate.facts[owner].filter(f=>!excluded.includes(f.key));assert.deepEqual(cur,old);protectedCount+=old.length;}for(const p of candidate.products.filter(p=>!ids.includes(p.productId))){assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(product(baseline,p.productId),[],date,null,baseline));}for(const id of ids){assert.deepEqual(resolveProductComponentIds(product(candidate,id),candidate),resolveProductComponentIds(product(baseline,id),baseline));const a=resolveCatalogFacts(product(baseline,id),[],date,null,baseline),b=resolveCatalogFacts(product(candidate,id),[],date,null,candidate);assert.deepEqual(a.filter(f=>!keys.includes(f.key)),b.filter(f=>!keys.includes(f.key)));for(const key of keys){assert.equal(Object.hasOwn(b.find(f=>f.key===key),'overriddenBase'),false);assert.equal(Object.hasOwn(b.find(f=>f.key===key),'replacesBase'),false);}}});
const combos=[[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],['gjensidige-hus-utleie','gjensidige-hus-smart']];
for(const id of ids)for(const addons of [...combos,...(id===ids[0]?[['gjensidige-hus-rate-insekter']]:[])])check('addon-isolation',()=>{
 const old=resolveCatalogFacts(product(baseline,id),addons,date,null,baseline),cur=resolveCatalogFacts(product(candidate,id),addons,date,null,candidate);
 assert.deepEqual(cur.filter(f=>!keys.includes(f.key)),old.filter(f=>!keys.includes(f.key)));
 for(const key of keys){assert.equal(cur.filter(f=>f.key===key).length,1);assert.equal(cur.find(f=>f.key===key).value,oracle[key].value);}
 const a=manual(baseline,id,false,addons),b=manual(candidate,id,false,addons);assert.deepEqual(status(b),status(a));assert.deepEqual(b.addOnIds,a.addOnIds);
});
for(const id of ids)for(const key of keys)check('typed-metadata',()=>{
 const old=fact(baseline,key),cur=fact(candidate,key),a=enrich(baseline,id,[]),b=enrich(candidate,id,[]);
 if(old.structuredValue?.kind==='age_deduction'){
  assert.deepEqual({...cur.structuredValue,exceptions:old.structuredValue.exceptions},old.structuredValue);
  assert.deepEqual(cur.structuredValue.exceptions,[...old.structuredValue.exceptions,...commonExceptions]);
 }else assert.deepEqual(cur.structuredValue,old.structuredValue);
 assert.deepEqual(pick(b,key)[0].structuredValue,cur.structuredValue);
 assert.deepEqual(pick(manual(candidate,id),key)[0].structuredValue,cur.structuredValue);
 const ar=pick(repeat(baseline,a),key)[0],br=pick(repeat(candidate,b),key)[0];
 assert.equal(Object.hasOwn(br,'structuredValue'),Object.hasOwn(ar,'structuredValue'));
 assert.equal(Object.hasOwn(br,'structuredValue'),false); // extractedTerm's established repeat contract
});

check('complete-independent-eight-row-oracle',()=>assert.deepEqual(candidate,expectedCatalog));
check('bindings',()=>{
 const a=JSON.parse(readFileSync(new URL('../docs/audit/checkpoints/b051-settlement-age-0bcd250/authorization.json',import.meta.url)));
 const expected={ '0f7980d6139daa2e':[['GAP-2111','SF-3029'],['GAP-2170','SF-3116']],
 '4971fe7dbeac3649':[['GAP-2112','SF-3030'],['GAP-2171','SF-3117']],
 '6080e5e5a6bb3c63':[['GAP-2118','SF-3042'],['GAP-2177','SF-3129']],
 'ce381a27b7435bec':[['GAP-2117','SF-3036'],['GAP-2176','SF-3123']]};
 assert.deepEqual(a.signatures.map(s=>s.signature_id).sort(),Object.keys(expected).sort());
 for(const s of a.signatures){assert.equal(s.final_batch_id,'B-051');assert.equal(s.P2_occurrences,'0');assert.deepEqual(JSON.parse(s.finding_ids),expected[s.signature_id].map(x=>x[0]));assert.deepEqual(JSON.parse(s.source_fact_ids),expected[s.signature_id].map(x=>x[1]));assert.deepEqual(JSON.parse(s.products).map(JSON.parse),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));}
});
for(const [level,pages,hash]of [['Standard',[16,17],'d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],['Pluss',[17,18],'79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792']])check('source-'+level,()=>{
 const filename='Hus-'+level+'-alminnelige-vilkar.pdf',p=new URL('../catalog/sources/gjensidige/hus/'+filename,import.meta.url);
 assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),hash);
 const registered=baseline.sources['gjensidigeHus'+level];assert.deepEqual(candidate.sources[registered.id],registered);assert.equal(registered.sha256,hash);assert.equal(registered.effectiveFrom,'');assert.equal(Object.hasOwn(registered,'sourceType'),false);
 // Raw extraction follows column order; layout extraction is archived separately.
 const text=execFileSync('pdftotext',['-raw','-f',String(pages[0]),'-l',String(pages[1]),p.pathname,'-']).toString().replace(/\s+/gu,' ');
 const first=text.slice(text.indexOf('Førsterisikoforsikret bygning'),text.indexOf('Bygning som ikke repareres'));
 for(const x of ['innen 5 år','avtalt forsikringssum','vesentlig bedre','overstiger 40 %','konsesjonspliktig landbrukseiendom','enhver verdiøkning','differansen i markedsverdi'])assert.ok(first.includes(x),x);
 const rebuild=text.slice(text.indexOf('Bygning som ikke repareres'),text.indexOf('Tilbygg, påbygg og sidebygg som ikke er meldt'));
 for(const x of ['det laveste av','avkastningsverdi','brukbare materialer','Rivingsutgifter som ville påløpt uavhengig av skaden'])assert.ok(rebuild.includes(x),x);
 const age=text.slice(text.indexOf('I følgende tilfeller trekkes aldersfradrag:'),text.indexOf('Det trekkes ikke egenandel ved:'));
 for(const x of ['plast eller glassfiber','5 %','20 år','den eldste delen','elektrisk utstyr gjelder punkt 2','10 %','5 år','7 år','10 år','maksimalt 80 %','tilhørende rør gjøres ikke fradrag','Ved reparasjon','Ved punktreparasjon','kun av den skadede gjenstand','totalskade av fullverdiforsikret bygning','brann (ild)','lov om naturskadeforsikring § 1'])assert.ok(age.includes(x),x);
});
check('reverse-audit',()=>execFileSync('node',[new URL('./helpers/b051-liability.mjs',import.meta.url).pathname,'--audit'],{stdio:'pipe'}));
