import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const a=productCatalog.products.find(p=>p.productId==='tryg-bat-bat-ekstra'),b=productCatalog.products.find(p=>p.productId==='gjensidige-bat-pluss');
const flat=x=>productComparisonView(x).flatMap(s=>s.groups.flatMap(g=>g.rows));
const out={left:catalogProductIdentity(a),right:catalogProductIdentity(b),forward:flat(compareCatalogProducts(a,b)).filter(r=>/nyverdi|ferieavbrudd/.test(r.key)),reverse:flat(compareCatalogProducts(b,a)).filter(r=>/nyverdi|ferieavbrudd/.test(r.key))};
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-tryg-boat-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.forward.map(r=>({key:r.key,first:r.first.text,second:r.second.text})),null,2));
