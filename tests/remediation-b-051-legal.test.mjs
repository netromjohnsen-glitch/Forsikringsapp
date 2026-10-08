import assert from 'node:assert/strict';
import test from 'node:test';
import {deserialize} from 'node:v8';
import {gunzipSync,gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {applyLegal} from './helpers/b051-legal.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {productCatalog,resolveCatalogFacts} from '../lib/product-catalog.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {enrichExtractedAgreementWithCatalog,catalogFactSources} from '../lib/catalog-enrichment.ts';
import {deriveCanonicalCoverages} from '../lib/coverage-status.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {expectedCatalog as activeExpected} from './helpers/b051-liability.mjs';
const audit=new URL('../docs/audit/checkpoints/b051-legal-b457a8d/',import.meta.url);
const proposal=JSON.parse(readFileSync(new URL('proposal.json',audit)));
const snapshot=JSON.parse(readFileSync(new URL('baseline-snapshot.json',audit)));
const bytes=readFileSync(new URL(snapshot.snapshot,audit));
assert.equal(createHash('sha256').update(bytes).digest('hex'),snapshot.sha256);
const baseline=deserialize(gunzipSync(bytes)),candidate=productCatalog,keys=proposal.rows.map(x=>x.key),ids=['gjensidige-hus','gjensidige-hus-pluss'],date=new Date('2026-10-07T12:00:00Z');

const product=(c,id)=>c.products.find(x=>x.productId===id);
const states=i=>deriveCanonicalCoverages(i,'Hus').map(x=>({id:x.id,status:x.status,conflict:x.conflict}));
const legalStates=i=>states(i).filter(x=>x.id.includes('rettshjelp'));
const legal=i=>i.importantTerms.filter(x=>keys.includes(x.key)||/rettshjelp/iu.test(x.name));
const source={documentId:'synthetic:legal:customer',filename:'Kundebevis.pdf',termsNumber:'Syntetisk kundebevis',effectiveFrom:'',company:'Gjensidige',page:2,section:'Rettshjelp',note:'Minneprobe'};
const input=(c,id,vs=[])=>({company:'Gjensidige',totalAnnualPremium:null,insurances:[{company:'Gjensidige',type:'Hus',agreementScope:'ordinary',productName:product(c,id).name,annualPremium:null,deductible:null,coverageSummary:null,importantTerms:vs.map(([key,value])=>({name:proposal.rows.find(r=>r.key===key).label,canonicalKey:key,value,source})),addOns:[]}]});
const enrich=(c,id,vs=[])=>enrichExtractedAgreementWithCatalog(input(c,id,vs),date,undefined,undefined,c).insurances[0];
const repeat=(c,i)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date,undefined,undefined,c).insurances[0];
const record=(id,role,vs)=>({...input(baseline,id).insurances[0],canonicalProductName:product(baseline,id).name,documentRole:role,agreementPeriod:null,objectIdentifiers:[],documentIndices:[1],importantTerms:vs.map(([key,value])=>({name:proposal.rows.find(r=>r.key===key).label,value,canonicalKey:null,documentIndices:[1]}))});
function pipe(c,docs,side){const save=productCatalog.facts;try{productCatalog.facts=c.facts;return documentPipeline(docs,side).insuranceData;}finally{productCatalog.facts=save;}}
const values=[[],[[keys[0],'Valgt']],[[keys[0],'Ikke valgt']],[[keys[0],'Ukjent']],[[keys[0],'Valgt'],[keys[0],'Ikke valgt']],[[keys[1],'Kundens forsikringssum 42 000 kr']],[[keys[2],'Kundens egenandel 900 kr']]];
const observations=[],failures=[];let checks=0;
function check(mode,info,fn){checks++;test('R-051-LEGAL '+mode+' '+JSON.stringify(info),()=>{const result=fn();observations.push({mode,...info,result});});}
for(const id of ids)for(const vs of values)check('enrichment',{id,vs},()=>{const a=enrich(baseline,id,vs),b=enrich(candidate,id,vs),aa=repeat(baseline,a),bb=repeat(candidate,b);assert.deepEqual(states(b),states(a));assert.deepEqual(states(bb),states(aa));assert.deepEqual(b.addOnIds,a.addOnIds);for(const t of legal(b).filter(t=>t.coverageOrigin==='document')){assert.deepEqual(t.source,source);assert.equal(Object.hasOwn(t,'sources'),false);}return{before:legalStates(a),after:legalStates(b),repeated:legalStates(bb),terms:legal(b)};});
for(const id of ids)for(const role of ['individual_agreement','unknown','general_terms'])for(const side of ['existing','offer'])for(const vs of values)check('document-pipeline',{id,role,side,vs},()=>{const docs=[[record(id,role,vs)]],a=pipe(baseline,docs,side),b=pipe(candidate,docs,side);assert.deepEqual(b.supportingEvidence,a.supportingEvidence);assert.equal(b.insurances.length,role==='general_terms'?0:1);if(b.insurances.length){assert.deepEqual(states(b.insurances[0]),states(a.insurances[0]));for(const t of legal(b.insurances[0]).filter(t=>t.coverageOrigin==='document')){assert.equal(Object.hasOwn(t,'source'),false);assert.deepEqual(t.sources,[{documentId:`pdf:${side}:0`,filename:'Dokument 1',termsNumber:'Ikke oppgitt',effectiveFrom:'',page:0,section:'Dokumentopplysninger; side/punkt ikke identifisert',documentRole:role}]);}if(vs.some(([key])=>key===keys[1]||key===keys[2]))for(const[key,value]of vs){const ts=legal(b.insurances[0]).filter(t=>t.key===key);assert.equal(ts.length,1);assert.equal(ts[0].value,value);assert.equal(ts[0].coverageOrigin,'document');}}return{before:a.insurances.map(legalStates),after:b.insurances.map(legalStates),supporting:b.supportingEvidence.length,terms:b.insurances.map(legal)};});
for(const id of ids)check('support+customer',{id},()=>{const docs=[[record(id,'individual_agreement',[[keys[1],'Kundens forsikringssum 42 000 kr']])],[record(id,'general_terms',[[keys[1],proposal.rows[1].value]])]];const a=pipe(baseline,docs,'existing'),b=pipe(candidate,docs,'existing');assert.deepEqual(a.supportingEvidence,b.supportingEvidence);assert.deepEqual(states(b.insurances[0]),states(a.insurances[0]));assert.equal(legal(b.insurances[0]).find(t=>t.key===keys[1]).value,'Kundens forsikringssum 42 000 kr');return{supporting:b.supportingEvidence.length,after:legalStates(b.insurances[0])};});
for(const id of ids)for(const custom of [false,true])check('manual',{id,custom},()=>{const manual=c=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:custom?'Syntetisk spesialprodukt':product(c,id).name,customProduct:custom,annualPremium:'',deductible:'',coverageSummary:'',addOnIds:[],importantTerms:[{name:proposal.rows[1].label,value:'Manuelt 42 000 kr'}]}]},c).insuranceData.insurances[0];const a=manual(baseline),b=manual(candidate);assert.deepEqual(states(b),states(a));if(custom){assert.deepEqual(b,a);assert.equal(b.catalogReference,null);}else{for(const t of legal(b)){assert.equal(t.coverageOrigin,'catalog');assert.equal(t.value,proposal.rows.find(r=>r.key===t.key).value);assert.deepEqual(t.sources,catalogFactSources(candidate.facts[proposal.owner].find(f=>f.key===t.key)).map((s,index)=>({...s,note:index===0?(t.key===keys[2]?'Uttrykkelig særskilt egenandel som erstatter generell verdi':undefined):'Supplerende kilde for faktumets anvendelse'})));}}return{before:legalStates(a),after:legalStates(b),terms:legal(b),catalogReference:b.catalogReference};});
for(const id of ids)check('materialization',{id},()=>{const a=materializeCatalogProduct(product(baseline,id),baseline),b=materializeCatalogProduct(product(candidate,id),candidate);const rows=b.facts.filter(x=>keys.includes(x.key));assert.equal(rows.length,3);for(const x of rows){const prev=a.facts.find(y=>y.key===x.key),f=candidate.facts[proposal.owner].find(y=>y.key===x.key);assert.equal(x.state,prev.state);assert.equal(x.role,prev.role);assert.equal(x.value,f.value);assert.deepEqual(x.sources,catalogFactSources(f).map(s=>({...s,sourceType:undefined})));}return rows;});
for(const id of ids)for(const addons of [[],['gjensidige-hus-utleie'],['gjensidige-hus-smart'],...(id===ids[0]?[['gjensidige-hus-rate-insekter']]:[])])check('inheritance-addons',{id,addons},()=>{const a=resolveCatalogFacts(product(baseline,id),addons,date,null,baseline),b=resolveCatalogFacts(product(candidate,id),addons,date,null,candidate);assert.deepEqual(b.filter(x=>!keys.includes(x.key)),a.filter(x=>!keys.includes(x.key)));assert.equal(b.filter(x=>keys.includes(x.key)).length,3);return b.filter(x=>keys.includes(x.key));});
for(const id of ids)for(const other of [...ids,'if-hus-basis','storebrand-hus-standard'])check('product-comparison',{id,other},()=>{const a=compareCatalogProducts(product(candidate,id),product(candidate,other),candidate),b=compareCatalogProducts(product(candidate,other),product(candidate,id),candidate);if(id===other)assert.equal(a.differenceCount,0);for(const row of a.sections.flatMap(x=>x.rows)){const inverse=b.sections.flatMap(x=>x.rows).find(x=>x.key===row.key);assert.deepEqual(row.first,inverse.second);assert.deepEqual(row.second,inverse.first);}return{differenceCount:a.differenceCount};});
for(const id of ids)for(const side of ['existing','offer'])check('customer-comparison',{id,side},()=>{const customer=pipe(candidate,[[record(id,'individual_agreement',[[keys[1],'Kundens forsikringssum 42 000 kr']])]],side).insurances[0],general=enrich(candidate,id);const results=[];for(const[a,b,s]of[[customer,general,'first'],[general,customer,'second']]){const row=groupTerms(groupInsurances([a],[b],null)[0],null).find(r=>r.key===keys[1]);assert.equal(row[s],'Kundens forsikringssum 42 000 kr');assert.deepEqual(row[s+'Sources'],legal(customer).find(t=>t.key===keys[1]).sources);results.push(row);}return results;});
check('isolation',{},()=>{let components=0,raw=0,products=0;for(const k of ['products','sources','addOns','insuranceTypes'])assert.deepEqual(candidate[k],baseline[k]);for(const[o,fs]of Object.entries(baseline.facts)){const filter=xs=>xs.filter(f=>o!==proposal.owner||!keys.includes(f.key));assert.deepEqual(filter(candidate.facts[o]),filter(fs));raw+=filter(fs).length;if(o!==proposal.owner)components++;}for(const p of baseline.products.filter(x=>!ids.includes(x.productId))){assert.deepEqual(resolveCatalogFacts(p,[],date,null,candidate),resolveCatalogFacts(p,[],date,null,baseline));products++;}return{components,raw,products};});
check('independent-three-row-transform',{},()=>{
 const expected=applyLegal(baseline);
 assert.deepEqual(candidate,expected);
 assert.deepEqual(JSON.parse(JSON.stringify(candidate)),JSON.parse(JSON.stringify(activeExpected)));
 for(const r of proposal.rows){const f=candidate.facts[proposal.owner].find(x=>x.key===r.key);assert.equal(Object.hasOwn(f.source,'productCode'),true);assert.equal(f.source.productCode,undefined);assert.equal(Object.hasOwn(f.source,'sourceType'),false);assert.equal(Object.hasOwn(f.qualificationSource,'productCode'),true);assert.equal(f.qualificationSource.productCode,undefined);assert.equal(Object.hasOwn(f.qualificationSource,'sourceType'),false);}
 const differences=[];for(const[o,fs]of Object.entries(baseline.facts))for(let i=0;i<fs.length;i++)if(JSON.stringify(candidate.facts[o][i])!==JSON.stringify(fs[i]))differences.push([o,fs[i].key]);assert.deepEqual(differences,keys.map(key=>[proposal.owner,key]));
 assert.equal(candidate.facts[proposal.owner].find(f=>f.key===keys[2]).deductibleClassification,'override');
 return differences;
});

const canonicalChanges=ids.map(id=>{
 const a=deriveCanonicalCoverages(enrich(baseline,id),'Hus'),b=deriveCanonicalCoverages(enrich(candidate,id),'Hus');
 return{id,changes:b.flatMap(x=>{const old=a.find(y=>y.id===x.id);return JSON.stringify(old)===JSON.stringify(x)?[]:[{id:x.id,fields:Object.keys(x).filter(k=>JSON.stringify(x[k])!==JSON.stringify(old[k]))}];})};
});
const metadataTransitions=ids.map(id=>{
 const a=enrich(baseline,id),aa=repeat(baseline,a),b=enrich(candidate,id),bb=repeat(candidate,b);
 const transitions=(first,next)=>legal(first).map(x=>{const y=legal(next).find(t=>t.key===x.key)||legal(next).find(t=>t.name===x.name&&t.value===x.value);return{key:x.key,nextKey:y?.key,changedFields:[...new Set([...Object.keys(x),...Object.keys(y??{})])].filter(k=>Object.hasOwn(x,k)!==Object.hasOwn(y??{},k)||JSON.stringify(x[k])!==JSON.stringify(y?.[k]))};});
 const before=transitions(a,aa),after=transitions(b,bb);assert.deepEqual(after,before);return{id,before,after};
});

const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fingerprints=ids.flatMap(id=>(id===ids[0]?[[],['gjensidige-hus-rate-insekter']]:[[]]).map(addons=>{const rows=c=>resolveCatalogFacts(product(c,id),addons,date,null,c).filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');return{id,addons,before:digest(rows(baseline)),after:digest(rows(candidate)),row_differences:rows(candidate).flatMap((f,i)=>JSON.stringify(f)!==JSON.stringify(rows(baseline)[i])?[f.key]:[])};}));

const verification=JSON.parse(readFileSync(new URL('source-verification.json',audit)));
const pageTexts=[];
for(const frozen of verification.frozen_sources)check('frozen-source',{identity:frozen.identity},()=>{
 const file=new URL('../'+frozen.path,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),frozen.sha256);
 const registered=candidate.sources[frozen.identity];assert.equal(registered.sha256,frozen.sha256);assert.equal(registered.insuranceType,'Hus');assert.equal(registered.company,'Gjensidige');assert.equal(registered.effectiveFrom,'');assert.equal(Object.hasOwn(registered,'sourceType'),false);
 const pages=frozen.pages.map(page=>execFileSync('pdftotext',['-layout','-f',String(page),'-l',String(page),file.pathname,'-'],{encoding:'utf8'}));pageTexts.push(pages);
 // Precise bounded page/column assertions preserve the whole covered clauses.
 const column=(raw,width=65)=>raw.split('\n').map(l=>l.slice(0,width)).join(' ').replace(/\s+/gu,' ').trim();
 const covered=column(pages[0]);
 for(const phrase of ['Rimelige og nødvendige utgifter til advokat','Utgifter til sakkyndige oppnevnt av retten','Rimelige og nødvendige utgifter til sakkyndige som ikke er oppnevnt av retten, begrenset til 40 % av forsikringssum eller økonomisk interesse','Utgifter til vitner ved hovedforhandling og bevisopptak','Jordskifteloven § 7-1 med unntak av bokstav c) og d)','Tvister som er oppstått når forsikringen er i','kraft, med mindre tvisten er unntatt i kolonnen til høyre','årlig omsetning på kr 100 000','forsikringen i Gjensidige opphørte i forbindelse med salget','sikrede er part i egenskap av tidligere eier','ennå ikke har overtatt og tegnet egen forsikring','var forsikret i Gjensidige på kjøpstidspunktet','gruppesøksmål blir avvist','kr 20 000 for hver sikrede i Gjensidige','Utbetalingen kommer til fradrag dersom ny rettshjelpdekning innvilges'])assert.ok(covered.includes(phrase),phrase);
 const first=pages[0].replace(/\s+/gu,' '),second=pages[1].replace(/\s+/gu,' '),third=pages[2].replace(/\s+/gu,' ');
 assert.ok(first.includes('i Norden'));assert.ok(first.includes('bygningsforsikring som kan dekke rettshjelpsutgiftene'));
 assert.ok(covered.includes('advokatutgifter under rettshjelpsforsikringen'));assert.ok(covered.includes('Sikrede kan når som helst kreve meklingen avsluttet'));assert.ok(covered.includes('vil rettshjelpdekningen være i behold'));
 for(const phrase of ['samlede erstatning for alle tvistene','begrenset til kr 500 000','bare de parter som er forsikret i Gjensidige'])assert.ok(column(pages[1],58).includes(phrase),phrase);
 for(const phrase of ['100 000','250 000','500 000','750 000','1 000 000','økonomiske interesse','overstige den faste egenandelen','kr 4 000','20 %','bare en egenandel','egenandel kr 0'])assert.ok(third.includes(phrase),phrase);
 assert.ok(second.includes('Husleietvistutvalget')); // Held contradiction remains original source evidence, never a catalog decision.
 return {pages:frozen.pages,registered_identity:frozen.identity};
});
check('equivalent-source-pages',{},()=>assert.deepEqual(pageTexts[0],pageTexts[1]));
const bindings=JSON.parse(readFileSync(new URL('original-bindings.json',audit)));
for(const row of bindings.registry)for(const [i,gap]of JSON.parse(row.finding_ids).entries())check('original-binding',{signature:row.signature_id,gap},()=>{
 const sf=JSON.parse(row.source_fact_ids)[i],productId=JSON.parse(row.products)[i],g=bindings.gaps.find(x=>x.finding_id===gap),f=bindings.source_facts.find(x=>x.source_fact_id===sf);
 assert.equal(g.signature,row.signature_id);assert.equal(g.source_fact_id,sf);assert.equal(g.product_identity,productId);assert.equal(f.product_identity,productId);assert.equal(row.final_batch_id,'B-051');assert.equal(JSON.parse(productId)[0],'gjensidige');assert.equal(JSON.parse(productId)[2],'ordinary');
});
check('explicit-open-alias-characterization',{},()=>{
 for(const id of ids)for(const vs of [[[keys[0],'Ikke valgt']],[[keys[0],'Valgt'],[keys[0],'Ikke valgt']]]){
  const a=pipe(baseline,[[record(id,'individual_agreement',vs)]],'existing').insurances[0],b=pipe(candidate,[[record(id,'individual_agreement',vs)]],'existing').insurances[0];assert.deepEqual(legalStates(b),legalStates(a));
  assert.equal(legalStates(b).find(s=>s.id===keys[0]).status,'selected');assert.equal(legalStates(b).find(s=>s.id==='rettshjelp.dekning').status,vs.length===1?'not_selected':'unknown');assert.equal(legalStates(b).find(s=>s.id==='rettshjelp.dekning').conflict,vs.length!==1);
 }
});
check('isolation-counts',{},()=>{let raw=0,components=0;for(const[o,fs]of Object.entries(baseline.facts)){raw+=fs.filter(f=>o!==proposal.owner||!keys.includes(f.key)).length;if(o!==proposal.owner)components++;}assert.equal(raw,4156);assert.equal(components,317);assert.equal(baseline.products.length-ids.length,202);});
check('no-HTU-decision',{},()=>{for(const r of proposal.rows)assert.doesNotMatch(r.value,/husleietvist|HTU|15[ .]?000/iu);});
process.on('exit',()=>{if(process.env.LEGAL_PROBE_RESULT_FILE)writeFileSync(process.env.LEGAL_PROBE_RESULT_FILE,gzipSync(JSON.stringify({checks,canonicalChanges,metadataTransitions,fingerprints,observations,failures}),{mtime:0}));});
