import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCatalogSources} from '../lib/catalog-source-resolution.ts';
import {productCatalog,resolveCatalogFacts,resolveCatalogEvidence} from '../lib/product-catalog.ts';
const product={company:'Synthetic',providerId:'synthetic',insuranceType:'Bil',productId:'kasko',version:'v2',name:'Kasko'};
const date=new Date('2026-09-24');
const source=(id,sourceType,extra={})=>({id,filename:`${id}.pdf`,termsNumber:id,effectiveFrom:'',sourceType,...extra});
const fact=(id,value,key='nyverdi.km')=>({key,label:key,value,source:{documentId:id,filename:`${id}.pdf`,termsNumber:id,effectiveFrom:'',page:1,section:'Synthetic'}});
const run=(facts,sources,p=product)=>resolveCatalogSources(facts,sources,p,date);
for(const [a,b] of [['15 000 km','20 000 km'],['12 000 km','18 000 km']])test(`full terms outrank product page without numeric matching: ${a}`,()=>{
 const facts=[fact('page',b),fact('terms',a)],sources={page:source('page','product_page'),terms:source('terms','full_terms')};
 const result=run(facts,sources);assert.deepEqual(result.facts.map(f=>f.value),[a]);assert.equal(result.decisions[0].reason,'source_priority');assert.equal(result.decisions[0].evidence.length,2);assert.deepEqual(run(facts.toReversed(),sources),result);
});
test('expired full terms cannot outrank currently applicable version',()=>{const r=run([fact('v1','A'),fact('v2','B')],{v1:source('v1','full_terms',{validTo:'2025-12-31'}),v2:source('v2','full_terms',{effectiveFrom:'2026-01-01'})});assert.equal(r.facts[0].value,'B');assert.equal(r.decisions[0].evidence.length,2);});
for(const validity of [{},{effectiveFrom:'2026-01-01',validTo:'2027-01-01'}])test(`same authority unresolved validity is conflict ${JSON.stringify(validity)}`,()=>{const facts=[fact('a','A'),fact('b','B')],sources={a:source('a','full_terms',validity),b:source('b','full_terms',validity)};const r=run(facts,sources);assert.equal(r.decisions[0].reason,'conflict');assert.deepEqual(r.facts,[]);assert.equal(r.decisions[0].evidence.length,2);assert.deepEqual(r,run(facts.toReversed(),sources));});
for(const scope of [{providerId:'other'},{insuranceType:'Snøscooter'},{productIds:['pluss']},{productVersion:'v1'},{effectiveFrom:'2027-01-01'}])test(`inapplicable higher authority cannot win ${JSON.stringify(scope)}`,()=>{const r=run([fact('wrong','A'),fact('page','B')],{wrong:source('wrong','full_terms',scope),page:source('page','product_page')});assert.equal(r.facts[0].value,'B');});
test('exact product specificity refines same authority',()=>{const r=run([fact('general','A'),fact('exact','B')],{general:source('general','full_terms'),exact:source('exact','full_terms',{productIds:['kasko']})});assert.equal(r.facts[0].value,'B');});
test('distinct canonical mileage identities never compete',()=>{const r=run([fact('a','15 000 km'),fact('b','20 000 km','kjoretoy.kjorelengde')],{a:source('a','full_terms'),b:source('b','product_page')});assert.equal(r.facts.length,2);assert.ok(r.decisions.every(d=>d.reason!=='conflict'));});
test('legacy unspecified source types retain explicit component behavior',()=>{const facts=[fact('a','A'),fact('b','B')];assert.deepEqual(run(facts,{a:source('a',undefined),b:source('b',undefined)}).facts,facts);});
test('production resolver applies source policy and preserves rejected evidence',()=>{
 const id='synthetic-resolution-component';const p={...product,componentIds:[id]};
 productCatalog.sources.syntheticTerms=source('syntheticTerms','full_terms');productCatalog.sources.syntheticPage=source('syntheticPage','product_page');
 productCatalog.facts[id]=[fact('syntheticPage','18 000 km'),fact('syntheticTerms','12 000 km')];
 try{assert.deepEqual(resolveCatalogFacts(p,[],date).map(f=>f.value),['12 000 km']);assert.equal(resolveCatalogEvidence(p,[],date).length,2);}
 finally{delete productCatalog.facts[id];delete productCatalog.sources.syntheticTerms;delete productCatalog.sources.syntheticPage;}
});
