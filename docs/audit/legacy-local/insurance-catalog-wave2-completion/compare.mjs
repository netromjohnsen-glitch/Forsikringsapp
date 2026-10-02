import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
const root='/Users/morten/Documents/forsikringsapp';
const {productCatalog,catalogProductIdentity}=await import(root+'/lib/product-catalog.ts');
const {compareCatalogProducts,productComparisonProducts}=await import(root+'/lib/catalog-product-comparison.ts');
const batch=JSON.parse(readFileSync('/tmp/nito-wave2-semantic-resolution/wave2-resolution.json')).batches.find(b=>b.batch_id===process.argv[2]);
const eligible=productComparisonProducts();const affected=eligible.filter(p=>batch.affected_products.includes(catalogProductIdentity(p)));
const flatten=r=>r.sections.flatMap(s=>s.rows);let directions=0,count=0;const examples=[];
for(const a of affected){assert.equal(compareCatalogProducts(a,a).differenceCount,0);directions++;
 for(const b of eligible.filter(p=>p.insuranceType===a.insuranceType)){
  const f=flatten(compareCatalogProducts(a,b)),r=flatten(compareCatalogProducts(b,a));directions+=2;count+=f.length;
  for(const row of f){const rev=r.find(x=>x.key===row.key);assert.ok(rev);assert.deepEqual(row.first,rev.second);assert.deepEqual(row.second,rev.first);}
  if(a.productId==='storebrand-reise-standard' && b.productId==='tryg-reise-ekstra')examples.push({a:a.productId,b:b.productId,row:f.find(x=>x.key==='reise.overnatting')});
 }
}
writeFileSync(process.argv[3],JSON.stringify({batch:batch.batch_id,products:affected.map(catalogProductIdentity),directions,rows:count,sameProduct:'PASS',sideSwap:'PASS',examples},null,2));console.log(directions,'directions',count,'rows PASS');
