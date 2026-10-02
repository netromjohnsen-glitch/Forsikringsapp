import { readFileSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const O='/tmp/nito-catalog-remediation-evening/';
const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...a){super(...(a.length?a:['2026-09-29T10:52:14.812Z']));}static now(){return new RealDate('2026-09-29T10:52:14.812Z').getTime();}};
const R='/Users/morten/Documents/forsikringsapp';
const {productComparisonProducts,compareCatalogProducts}=await import(R+'/lib/catalog-product-comparison.ts');
const audit=JSON.parse(readFileSync(O+'final-targeted-audit.json'));
const all=productComparisonProducts();let directionalPairs=0,checkedRows=0;
for(const a of all.filter(p=>audit.changed_products.includes(p.productId))) {
 assert.equal(compareCatalogProducts(a,a).differenceCount,0);
 for(const b of all.filter(p=>p.insuranceType===a.insuranceType)) {
  const forward=compareCatalogProducts(a,b).sections.flatMap(s=>s.rows),reverse=compareCatalogProducts(b,a).sections.flatMap(s=>s.rows);
  for(const key of audit.allowed_keys[a.productId]) {
   const f=forward.find(r=>r.key===key),r=reverse.find(r=>r.key===key);assert.equal(!!f,!!r);
   if(!f)continue;assert.deepEqual(f.first,r.second);assert.deepEqual(f.second,r.first);checkedRows++;
  }
  directionalPairs+=2;
 }
}
const result={status:'PASS',changedActiveProducts:audit.changed_products.length,directionalPairs,checkedRows,scope:'Every affected product versus all active same-type catalog products, only changed canonical keys; same-product identity stable. No new sources or claims.'};
writeFileSync(O+'final-comparison-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
