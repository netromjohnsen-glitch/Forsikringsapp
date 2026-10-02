import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const out=[];
for(const [left,right,keys] of [['gjensidige-hund-behandling','tryg-hund-behandling',['dyr.rehabilitering.grense','dyr.rehabilitering.dekning']]]){
 const a=productCatalog.products.find(p=>p.productId===left),b=productCatalog.products.find(p=>p.productId===right);
 const flat=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
 out.push({left:catalogProductIdentity(a),right:catalogProductIdentity(b),forward:flat(compareCatalogProducts(a,b)).filter(r=>keys.includes(r.key)),reverse:flat(compareCatalogProducts(b,a)).filter(r=>keys.includes(r.key))});
}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-gjensidige-pet-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({left:x.left,right:x.right,forward:x.forward.map(r=>({key:r.key,first:r.first,second:r.second.state})),reverse:x.reverse.map(r=>({key:r.key,first:r.first.state,second:r.second.state}))})),null,2));
