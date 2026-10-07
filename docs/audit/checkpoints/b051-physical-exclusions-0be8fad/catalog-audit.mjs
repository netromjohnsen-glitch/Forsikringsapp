import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {productCatalog,resolveCatalogFacts} from '../../../../lib/product-catalog.ts';
import {baselineCatalog,expectedCatalog,keys} from './expected-catalog.mjs';
assert.deepEqual(productCatalog,expectedCatalog,'Independent literal-source three-row update plus one Pluss insertion');
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const baselineCount=Object.values(baselineCatalog.facts).flat().length;
assert.equal(baselineCount,4158);assert.equal(Object.values(productCatalog.facts).flat().length,4159);
for(const field of ['sources','products','addOns','insuranceTypes'])assert.deepEqual(productCatalog[field],baselineCatalog[field]);
const changes=[];let protectedCount=0,components=0;
for(const[owner,rows]of Object.entries(baselineCatalog.facts)){
 const excluded=owner==='gjensidigeHusStandard'?keys:owner==='gjensidigeHusPluss'?[keys[1]]:[];
 const protectedRows=rows.filter(f=>!excluded.includes(f.key));
 assert.deepEqual(productCatalog.facts[owner].filter(f=>!excluded.includes(f.key)),protectedRows,owner);
 protectedCount+=protectedRows.length;if(!excluded.length)components++;
 for(const key of excluded)changes.push({owner,key,before:rows.find(f=>f.key===key)??null,after:expectedCatalog.facts[owner].find(f=>f.key===key)});
}
assert.equal(protectedCount,4155);assert.equal(components,316);assert.equal(changes.length,4);
const others=productCatalog.products.filter(p=>!['gjensidige-hus','gjensidige-hus-pluss'].includes(p.productId));assert.equal(others.length,202);
const date=new Date('2026-10-07T12:00:00Z');
for(const p of others)assert.deepEqual(resolveCatalogFacts(p,[],date,null,productCatalog),resolveCatalogFacts(baselineCatalog.products.find(b=>b.productId===p.productId),[],date,null,baselineCatalog),p.productId);
const fingerprints=[];
for(const[id,addons]of[['gjensidige-hus',[]],['gjensidige-hus',['gjensidige-hus-rate-insekter']],['gjensidige-hus-pluss',[]]]){
 const product=c=>c.products.find(p=>p.productId===id),filter=rows=>rows.filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');
 const before=resolveCatalogFacts(product(baselineCatalog),addons,date,null,baselineCatalog),expected=resolveCatalogFacts(product(expectedCatalog),addons,date,null,expectedCatalog),actual=resolveCatalogFacts(product(productCatalog),addons,date,null,productCatalog);
 assert.deepEqual(actual,expected);
 assert.deepEqual(actual.filter(f=>!keys.includes(f.key)),before.filter(f=>!keys.includes(f.key)));
 fingerprints.push({product:id,addons,before:digest(filter(before)),after:digest(filter(expected)),basis:'INDEPENDENT_SOURCE_ORACLE_NOT_CANDIDATE'});
}
const report={status:'PASS',baseline_revision:'0be8fadb7e90fc527cd81c5ae5c89accabb2deb0',raw_before:4158,raw_after:4159,entirely_unchanged_components:316,protected_raw_facts:4155,other_products_unchanged:202,metadata_unchanged:true,changes,fingerprints};
if(process.argv.includes('--write'))writeFileSync(new URL('catalog-delta.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,changes:changes.map(c=>({owner:c.owner,key:c.key}))},null,2));
