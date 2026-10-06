import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { productCatalog, resolveCatalogFacts } from '../../../../lib/product-catalog.ts';
const dir=new URL('./',import.meta.url);
const baseline=JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz',dir))));
const current=JSON.parse(JSON.stringify(productCatalog));
const oracle=JSON.parse(readFileSync(new URL('source-oracle.json',dir)));
const allowed=Object.entries(oracle).map(([key,o])=>[o.owner,key]);
const without=(catalog)=>({...catalog,facts:Object.fromEntries(Object.entries(catalog.facts).map(([owner,rows])=>[owner,rows.filter(f=>!allowed.some(([a,k])=>a===owner&&k===f.key))]))});
assert.deepEqual(without(current),without(baseline),'Every protected component/fact and all catalog metadata must remain identical');
const changes=[];
for(const [owner,key] of allowed){
 const b=baseline.facts[owner].filter(f=>f.key===key),a=current.facts[owner].filter(f=>f.key===key);assert.equal(b.length,1);assert.equal(a.length,1);
 const strip=({value,source,qualificationSource,...rest})=>rest;assert.deepEqual(strip(a[0]),strip(b[0]));
 assert.equal(a[0].value,oracle[key].value);assert.equal(a[0].label,oracle[key].label);
 // Existing primary reference is still valid; all its fields must remain intact.
 assert.deepEqual(a[0].source,b[0].source);
 changes.push({owner,key,before:b[0],after:a[0],changed_fields:Object.keys({...b[0],...a[0]}).filter(k=>JSON.stringify(a[0][k])!==JSON.stringify(b[0][k]))});
}
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fingerprints=[];
for(const [id,addons] of [['gjensidige-hus',[]],['gjensidige-hus',['gjensidige-hus-rate-insekter']],['gjensidige-hus-pluss',[]]]){
 const p=productCatalog.products.find(p=>p.productId===id),b=baseline.products.find(p=>p.productId===id),date=new Date('2026-09-29T10:52:14.812Z');
 const previous=resolveCatalogFacts(b,addons,date,null,baseline),actual=resolveCatalogFacts(p,addons,date);
 const protectedRows=rows=>rows.filter(f=>!['hus.brukstap.dekning','hus.leietap.skade'].includes(f.key));
 assert.deepEqual(JSON.parse(JSON.stringify(protectedRows(actual))),protectedRows(previous));
 const filter=rows=>rows.filter(f=>!f.key.startsWith('hus.skadedyr.')&&f.key!=='hus.rate.dekning');
 fingerprints.push({product:id,addons,before:digest(filter(previous)),after:digest(filter(actual)),authorized_effective_delta:['hus.brukstap.dekning','hus.leietap.skade']});
}
const report={status:'PASS',baseline_revision:'5718a5fdcfe669d6afd11d4c27fe3a45ed24c175',catalog_component_count:Object.keys(current.facts).length,entirely_unchanged_components:Object.keys(current.facts).filter(o=>!allowed.some(([a])=>a===o)).length,protected_raw_facts:Object.values(without(current).facts).flat().length,changes,fingerprints,all_metadata_unchanged:true,B020_pest_facts_and_SC020_hold_unchanged:true};
if(process.argv.includes('--write'))writeFileSync(new URL('catalog-delta.json',dir),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,changes:changes.map(x=>({owner:x.owner,key:x.key,changed_fields:x.changed_fields}))},null,2));
