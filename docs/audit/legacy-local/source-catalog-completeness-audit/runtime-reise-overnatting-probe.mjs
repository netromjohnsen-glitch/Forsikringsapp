import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const c=productCatalog,out=[];
for(const tid of ['tryg-reise-ekstra','tryg-reise-premium']){
 const a=c.products.find(p=>p.productId===tid),b=c.products.find(p=>p.productId==='storebrand-reise-standard');
 const forward=compareCatalogProducts(a,b),reverse=compareCatalogProducts(b,a);
 const flatten=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
 const rows=flatten(forward).filter(r=>['reise.overnatting','reise.omrade.verden'].includes(r.key));
 const reversed=flatten(reverse).filter(r=>['reise.overnatting','reise.omrade.verden'].includes(r.key));
 out.push({first:catalogProductIdentity(a),second:catalogProductIdentity(b),rows,reversed});
}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-reise-overnatting-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
