import fs from 'node:fs';
import {productCatalog,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {compareCatalogProducts} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
import {productComparisonView} from '/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts';
const dir='/tmp/source-catalog-completeness-audit';
const products=JSON.parse(fs.readFileSync(dir+'/catalog.json','utf8')).products;
const specs=[
 ['storebrand-reise-standard','reise.skadedyr.dekning'],
 ['storebrand-reise-standard','reise.skadedyr.egenandel'],
 ['storebrand-reise-standard','reise.bagasje.aldersfradrag'],
 ['storebrand-reise-super','reise.veterinar'],
 ['storebrand-reise-super','reise.skadedyr.dekning'],
 ['storebrand-reise-super','reise.bagasje.aldersfradrag'],
];
const out=[];
for(const [id,key] of specs){
 const a=products.find(p=>p.productId===id);
 const peers=products.filter(p=>p.eligible&&p.insuranceType===a.insuranceType&&p.productId!==id&&p.materialized.some(f=>f.key===key));
 const b=peers.find(p=>p.providerId===a.providerId)??peers[0];
 if(!b){out.push({product:id,key,status:'NO_PEER_ROW',note:'Not a materiality judgment'});continue;}
 const pa=productCatalog.products.find(p=>catalogProductIdentity(p)===a.identity),pb=productCatalog.products.find(p=>catalogProductIdentity(p)===b.identity);
 const comparison=compareCatalogProducts(pa,pb);
 const view=productComparisonView(comparison);
 const raw=comparison.sections.flatMap(s=>s.rows).find(r=>r.key===key);
 const display=view.flatMap(s=>s.groups.flatMap(g=>g.rows)).find(r=>r.key===key);
 const swap=compareCatalogProducts(pb,pa);
 const reverse=productComparisonView(swap).flatMap(s=>s.groups.flatMap(g=>g.rows)).find(r=>r.key===key);
 out.push({product:a.identity,peer:b.identity,key,raw,display,side_swap_consistent:display&&reverse?JSON.stringify(display.first)===JSON.stringify(reverse.second):null,status:display?.first.state==='unknown'?'DISPLAY_UNKNOWN_CONFIRMED':'REVIEW_DISPLAY',note:'Scope-safe diagnostic only; peers do not establish source truth or equivalence. Link own-source inventory before counting.'});
}
fs.writeFileSync(dir+'/runtime-storebrand-reise-probes.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out.map(x=>({product:x.product,key:x.key,status:x.status,text:x.display?.first.text,peer:x.peer,sideSwap:x.side_swap_consistent})),null,2));
