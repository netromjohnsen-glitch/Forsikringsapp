import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const out=[];const flat=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
for(const [left,right,keys] of [['sparebank1-fremtind-bat-delkasko','sparebank1-fremtind-bat-kasko',['bat.redning.dekning']],['sparebank1-fremtind-bat-kasko','if-bat-kasko',['bat.losore.grense']],['sparebank1-fremtind-bat-toppkasko','storebrand-bat-super',['bat.totalskade.alder']],['sparebank1-fremtind-bat-toppkasko','gjensidige-bat-pluss',['bat.maskinskade.alder']]]){
 const a=productCatalog.products.find(p=>p.productId===left),b=productCatalog.products.find(p=>p.productId===right);
 out.push({left:catalogProductIdentity(a),right:catalogProductIdentity(b),forward:flat(compareCatalogProducts(a,b)).filter(r=>keys.includes(r.key)),reverse:flat(compareCatalogProducts(b,a)).filter(r=>keys.includes(r.key))});
}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-fremtind-boat-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({left:x.left,rows:x.forward.map(r=>({key:r.key,first:r.first.state,second:r.second.state}))})),null,2));