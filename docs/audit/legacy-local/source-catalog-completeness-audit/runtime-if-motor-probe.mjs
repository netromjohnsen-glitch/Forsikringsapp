import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const out=[];
for(const [left,right,keys] of [
 ['if-bil-kasko','gj-bil-kasko',['nyverdi.alder','nyverdi.km']],
 ['if-campingvogn-super','storebrand-campingvogn-super',['campingvogn.fukt.dekning','campingvogn.ferie.dekning','campingvogn.nyverdi.dekning']],
 ['if-bobil-super','if-bobil-kasko',['nyverdi.alder','nyverdi.km','bobil.fukt.dekning']]
]){
 const a=productCatalog.products.find(p=>p.productId===left),b=productCatalog.products.find(p=>p.productId===right);
 if(!a||!b)throw new Error('product not found');
 const flat=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
 out.push({left:catalogProductIdentity(a),right:catalogProductIdentity(b),forward:flat(compareCatalogProducts(a,b)).filter(r=>keys.includes(r.key)),reverse:flat(compareCatalogProducts(b,a)).filter(r=>keys.includes(r.key))});
}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-if-motor-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({left:x.left,right:x.right,forward:x.forward.map(r=>({key:r.key,a:r.left,b:r.right,keys:Object.keys(r)})),reverseCount:x.reverse.length})),null,2));
