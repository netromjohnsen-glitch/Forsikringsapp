import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const out=[];const flat=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
for(const [left,right,keys] of [['eika-fremtind-campingvogn-kasko','frende-campingvogn-kasko',['campingvogn.fukt.dekning']],['eika-fremtind-snoscooter-kasko','frende-snoscooter-kasko',['snoscooter.utstyr.grense']],['fremtind-mc-kasko','tryg-mc-kasko',['nyverdi.alder','nyverdi.km']]]){
 const a=productCatalog.products.find(p=>p.productId===left),b=productCatalog.products.find(p=>p.productId===right);
 out.push({left:catalogProductIdentity(a),right:catalogProductIdentity(b),forward:flat(compareCatalogProducts(a,b)).filter(r=>keys.includes(r.key)),reverse:flat(compareCatalogProducts(b,a)).filter(r=>keys.includes(r.key))});
}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-fremtind-light-vehicle-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({left:x.left,right:x.right,rows:x.forward})),null,2));
