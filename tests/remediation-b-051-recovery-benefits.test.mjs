import {applyLegal} from './helpers/b051-legal.mjs';
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
import {baselineCatalog as previousBaseline,expectedCatalog as previousExpectedCatalog,sourceOracle as oracle,keys} from '../docs/audit/checkpoints/b051-recovery-benefits-69c71dc/expected-catalog.mjs';
import { applyPhysical } from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const baseline=applyLegal(applySmart(applyHealthHelp(applyLiability(applyPhysical(previousBaseline))))),expectedCatalog=applyLegal(applySmart(applyHealthHelp(applyLiability(applyPhysical(previousExpectedCatalog)))));
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
let count=0;function check(name,fn){count++;test('R-051-RECOVERY-'+name+'-'+count,fn);}
for(const id of ids)for(const key of keys)for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('enrichment',()=>{
 const ts=values.map(v=>term(key,v)),old=enrich(baseline,id,ts),cur=enrich(candidate,id,ts),a=repeat(baseline,old),b=repeat(candidate,cur);
 assert.deepEqual(status(cur),status(old));assert.deepEqual(status(b),status(a));assert.deepEqual(cur.addOnIds,[]);assert.deepEqual(b.addOnIds,[]);
 const fallback=!values.length||values[0]==='Ukjent';assert.deepEqual(pick(cur,key).map(t=>t.value),fallback?[oracle[key].value]:values);
 for(const t of pick(cur,key)){assert.equal(t.coverageOrigin,fallback?'catalog':'document');assert.deepEqual(t.source,fallback?fact(candidate,key).source:source);if(fallback)assert.deepEqual(t.sources,catalogFactSources(fact(candidate,key)));else assert.equal(Object.hasOwn(t,'sources'),false);}
 assert.deepEqual(pick(b,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]),pick(cur,key).map(t=>[t.name,t.key,t.value,t.source,t.sources]));
 const added=(x,y)=>status(y).filter(v=>!status(x).some(w=>w.id===v.id));assert.deepEqual(added(cur,b),added(old,a));assert.deepEqual(added(cur,b),[{id:'rettshjelp.dekning',status:'selected',conflict:false}]);

});
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const values of [[],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt'],['Kundevilkår 73 000 kr']])check('pipeline',()=>{
 const docs=[[record(id,role,keys.flatMap(key=>values.map(value=>[key,value])))]];const old=pipeline(baseline,docs),cur=pipeline(candidate,docs);
 assert.equal(cur.insurances.length,role==='general_terms'?0:1);assert.equal(cur.supportingEvidence.length,role==='general_terms'?1:0);
 if(role==='general_terms'){assert.deepEqual(cur.supportingEvidence,old.supportingEvidence);for(const t of cur.supportingEvidence[0].importantTerms){assert.equal(t.key,undefined);assert.equal(Object.hasOwn(t,'key'),true);assert.equal(Object.hasOwn(t,'source'),false);assert.equal(t.sources.length,1);}}
 else{assert.deepEqual(status(cur.insurances[0]),status(old.insurances[0]));assert.deepEqual(cur.insurances[0].addOnIds,[]);
  for(const key of keys){const rows=pick(cur.insurances[0],key);const fallback=!values.length||values[0]==='Ukjent';assert.deepEqual(rows.map(t=>t.value),fallback?[oracle[key].value]:values);
   if(!fallback)for(const t of rows){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:'pdf:existing:0',filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}}
 }

});
for(const id of ids)check('support+customer',()=>{const docs=[[record(id,'individual_agreement',[[keys[0],'Kundevilkår 73 000 kr']])],[record(id,'general_terms',[[keys[1],'Generelt oppgjørsvilkår']])]];const old=pipeline(baseline,docs),cur=pipeline(candidate,docs);assert.equal(cur.insurances.length,1);assert.equal(cur.supportingEvidence.length,1);assert.deepEqual(cur.supportingEvidence,old.supportingEvidence);assert.equal(pick(cur.insurances[0],keys[0])[0].value,'Kundevilkår 73 000 kr');assert.deepEqual(status(cur.insurances[0]),status(old.insurances[0]));});
for(const id of ids)for(const custom of [false,true])check('manual',()=>{const old=manual(baseline,id,custom),cur=manual(candidate,id,custom);assert.deepEqual(status(cur),status(old));assert.deepEqual(cur.addOnIds,[]);if(custom){assert.deepEqual(cur,old);assert.equal(cur.catalogReference,null);assert.equal(cur.catalogFacts,null);assert.deepEqual(cur.importantTerms,keys.map(key=>({name:fact(baseline,key).label,value:'Manuelt vilkår 73 000 kr'})));}else for(const key of keys){const t=pick(cur,key)[0];assert.equal(t.coverageOrigin,'catalog');assert.equal(t.value,oracle[key].value);assert.deepEqual(t.sources,catalogFactSources(fact(candidate,key)).map((s,i)=>({...s,note:i?'Supplerende kilde for faktumets anvendelse':undefined})));}});
for(const id of ids)check('materialization',()=>{const a=materializeCatalogProduct(product(baseline,id),baseline),b=materializeCatalogProduct(product(candidate,id),candidate);for(const key of keys){const old=a.facts.find(f=>f.key===key),cur=b.facts.find(f=>f.key===key);assert.equal(cur.state,old.state);assert.equal(cur.role,old.role);assert.equal(cur.value,oracle[key].value);assert.deepEqual(cur.sources,catalogFactSources(fact(candidate,key)).map(s=>({...s,sourceType:undefined})));}});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('product-comparison',()=>{const f=compareCatalogProducts(product(candidate,id),product(candidate,other),candidate),r=compareCatalogProducts(product(candidate,other),product(candidate,id),candidate);if(id===other)assert.equal(f.differenceCount,0);for(const key of keys){const a=f.sections.flatMap(s=>s.rows).find(r=>r.key===key),b=r.sections.flatMap(s=>s.rows).find(r=>r.key===key);assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);assert.deepEqual(a.first.sources,catalogFactSources(fact(candidate,key)).map(s=>({...s,sourceType:undefined})));}});
for(const id of ids)for(const key of keys)check('document-comparison',()=>{const c=enrich(candidate,id,[term(key,'Kundevilkår 73 000 kr')]),m=manual(candidate,id);for(const [a,b,side]of [[c,m,'first'],[m,c,'second']]){const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===key);assert.equal(row[side],'Kundevilkår 73 000 kr');assert.deepEqual(row[side+'Sources'],[source]);}});
check('isolation',()=>{assert.deepEqual(candidate.sources,baseline.sources);assert.deepEqual(candidate.products,baseline.products);assert.deepEqual(candidate.addOns,baseline.addOns);for(const [owner,rows]of Object.entries(baseline.facts)){const excluded=owner==='gjensidigeHusStandard'?keys:[];const old=rows.filter(f=>!excluded.includes(f.key)),cur=candidate.facts[owner].filter(f=>!excluded.includes(f.key));assert.deepEqual(cur,old);}for(const p of candidate.products.filter(p=>!ids.includes(p.productId))){assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(product(baseline,p.productId),[],date,null,baseline));}for(const id of ids){assert.deepEqual(resolveProductComponentIds(product(candidate,id),candidate),resolveProductComponentIds(product(baseline,id),baseline));const a=resolveCatalogFacts(product(baseline,id),[],date,null,baseline),b=resolveCatalogFacts(product(candidate,id),[],date,null,candidate);assert.deepEqual(a.filter(f=>!keys.includes(f.key)),b.filter(f=>!keys.includes(f.key)));for(const key of keys){assert.equal(Object.hasOwn(b.find(f=>f.key===key),'overriddenBase'),false);assert.equal(Object.hasOwn(b.find(f=>f.key===key),'replacesBase'),false);}}});
const combos=[[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],['gjensidige-hus-utleie','gjensidige-hus-smart']];
for(const id of ids)for(const addons of [...combos,...(id===ids[0]?[['gjensidige-hus-rate-insekter']]:[])])check('addon-isolation',()=>{
 const old=resolveCatalogFacts(product(baseline,id),addons,date,null,baseline),cur=resolveCatalogFacts(product(candidate,id),addons,date,null,candidate);
 assert.deepEqual(cur.filter(f=>!keys.includes(f.key)),old.filter(f=>!keys.includes(f.key)));
 for(const key of keys){assert.equal(cur.filter(f=>f.key===key).length,1);assert.equal(cur.find(f=>f.key===key).value,oracle[key].value);}
 const a=manual(baseline,id,false,addons),b=manual(candidate,id,false,addons);assert.deepEqual(status(b),status(a));assert.deepEqual(b.addOnIds,a.addOnIds);
});

check('complete-independent-three-row-oracle',()=>assert.deepEqual(candidate,expectedCatalog));
check('bindings',()=>{
 const a=JSON.parse(readFileSync(new URL('../docs/audit/checkpoints/b051-recovery-benefits-69c71dc/authorization.json',import.meta.url)));
 const expected={'292dacd4533926fd':[['GAP-2119','SF-3045'],['GAP-2178','SF-3132']],
 'b3b964a9c6105360':[['GAP-2098','SF-3007'],['GAP-2157','SF-3094']],
 'ed99577218e2302b':[['GAP-2120','SF-3046'],['GAP-2179','SF-3133']]};
 assert.deepEqual(a.signatures.map(s=>s.signature_id).sort(),Object.keys(expected).sort());
 for(const s of a.signatures){assert.equal(s.final_batch_id,'B-051');assert.equal(s.P2_occurrences,'0');assert.deepEqual(JSON.parse(s.finding_ids),expected[s.signature_id].map(x=>x[0]));assert.deepEqual(JSON.parse(s.source_fact_ids),expected[s.signature_id].map(x=>x[1]));assert.deepEqual(JSON.parse(s.products).map(JSON.parse),ids.map(id=>['gjensidige','bolig','ordinary',id,'Alminnelige vilkår']));}
});
for(const [level,page,qual,hash]of [['Standard',18,5,'d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],['Pluss',19,6,'79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792']])check('source-'+level,()=>{
 const filename='Hus-'+level+'-alminnelige-vilkar.pdf',p=new URL('../catalog/sources/gjensidige/hus/'+filename,import.meta.url);
 assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),hash);
 const registered=baseline.sources['gjensidigeHus'+level];assert.deepEqual(candidate.sources[registered.id],registered);assert.equal(registered.sha256,hash);assert.equal(registered.effectiveFrom,'');assert.equal(Object.hasOwn(registered,'sourceType'),false);
 const text=n=>execFileSync('pdftotext',['-raw','-f',String(n),'-l',String(n),p.pathname,'-']).toString().replace(/\s+/gu,' ');
 const settlement=text(page),nature=settlement.slice(settlement.indexOf('Naturskade -'),settlement.indexOf('Naturskade og flomlignende situasjon'));
 for(const x of ['brannforsikret bygning','ikke gis tillatelse','fare for ny naturskade','totalskadet','bolighus eller fritidshus','markedsverdi før skaden','5 dekar','eventuelle forsikrede uthus','ustabil','selv om huset ikke er skadet','ikke klagerett','samtykker skriftlig','god beskyttelse','ettersyn og vedlikehold'])assert.ok(nature.includes(x),x);
 const orders=settlement.slice(settlement.indexOf('Merutgifter som følge av påbud'));
 for(const x of ['skade som er dekket','nødvendige merutgifter','hjemmel i lov eller offentlig forskrift','differansen','dokumentert ikke kan dekkes','grunnundersøkelser og fundamentering','ikke direkte vedrører byggearbeidet','betingelse for at bygningen tillates gjenoppført','forholdet mellom gulvareal','tap av nytteareal','selv om skaden ikke hadde inntruffet','antikvariske prinsipper','urasjonell byggemåte','midlertidig','riving/ombygging/rehabilitering','dispensasjonsmuligheter'])assert.ok(orders.includes(x),x);
 const wheelchair=text(5),part=wheelchair.slice(wheelchair.indexOf('Ombygging for rullestolbruker'),wheelchair.indexOf('Etter en erstatningsmessig skade'));
 for(const x of ['250 000','nødvendige forandringer','varig rullestolbruker','plutselig ytre fysisk hendelse','innen 10 år regnet fra ulykken','Medfødt funksjonsnedsettelse','fra sikrede tilstås rullestol fra Hjelpemiddelsentralen','annen offentlig instans','20 år','fødselstidspunktet','utenfor forsikringstiden','Andre skader','både bygnings- og innboforsikring','medisinske komplikasjoner','autorisert eller uatorisert helsepersonell'])assert.ok(part.includes(x),x);
 const additional=level==='Pluss'?(()=>{
  const first=text(5),next=text(6);
  const heading='Etter en erstatningsmessig skade dekkes i tillegg utover forsikringssummen';
  const start=first.indexOf(heading),end=next.indexOf('Råte og skadeinsekter');
  assert.notEqual(start,-1);assert.notEqual(end,-1);
  assert.equal(first.slice(start).trim(),heading);
  assert.match(next,/^Hus Hus Hus FORSIKRINGSBEVIS Dekkes Dekkes ikke - Riving, rydding, bortkjøring og deponering av verdiløse bygningsrester/u);
  return first.slice(start)+' '+next.slice(0,end);
 })():text(qual);for(const x of ['utover forsikringssummen','Merutgifter på grunn av offentlig påbud','Offentlig påbud for omlegging av utvendige vann- og kloakkledninger','etablering av renseanlegg','som følge av lekkasje'])assert.ok(additional.includes(x),x);
});
for(const id of ids)for(const key of keys)check('strict-raw-repeat-fields',()=>{
 const a=enrich(baseline,id,[]),b=enrich(candidate,id,[]),ar=repeat(baseline,a),br=repeat(candidate,b);
 const fields=i=>Object.keys(pick(i,key)[0]).sort();assert.deepEqual(fields(b),fields(a));assert.deepEqual(fields(br),fields(ar));
 const f=pick(b,key)[0],again=pick(br,key)[0];assert.deepEqual(again,{name:f.name,value:f.value,key:f.key,coverageOrigin:'document',source:f.source,sources:f.sources});
 assert.deepEqual(f,{name:fact(candidate,key).label,value:oracle[key].value,key,coverageOrigin:'catalog',structuredValue:undefined,deductibleClassification:undefined,source:fact(candidate,key).source,sources:catalogFactSources(fact(candidate,key)),overriddenBase:[]});
 const rf=resolveCatalogFacts(product(candidate,id),[],date,null,candidate).find(f=>f.key===key);
 assert.equal(Object.hasOwn(rf,'replacesBase'),false);assert.equal(Object.hasOwn(rf,'overriddenBase'),false);assert.equal(Object.hasOwn(rf.source,'productCode'),true);assert.equal(rf.source.productCode,undefined);assert.equal(Object.hasOwn(rf.source,'sourceType'),false);
});
check('reverse-audit',()=>execFileSync('node',[new URL('./helpers/b051-liability.mjs',import.meta.url).pathname,'--audit'],{stdio:'pipe'}));
