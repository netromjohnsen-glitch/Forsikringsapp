import fs from 'node:fs';
import{productCatalog,availableAddOns,resolveCatalogFacts,catalogProductIdentity}from'/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
const out=[];
for(const p of productCatalog.products.filter(p=>p.productId==='fremtind-bil-kasko'||p.productId==='fremtind-bil-topp'))for(const ch of ['SpareBank 1','DNB','Eika',null]){
const aa=availableAddOns(p,new Date('2026-09-29T10:52:14.812Z'),ch);out.push({product:catalogProductIdentity(p),channel:ch,addons:aa.map(a=>({id:a.id,component:a.componentId,facts:resolveCatalogFacts(p,[a.id],new Date('2026-09-29T10:52:14.812Z'),ch).filter(f=>f.key.startsWith('leiebil.')||f.key.startsWith('maskinskade.')).map(({key,value,source})=>({key,value,source}))}))});}
fs.writeFileSync('/tmp/source-catalog-completeness-audit/runtime-fremtind-channel-probe.json',JSON.stringify(out,null,2));console.log(out.map(x=>({product:x.product,channel:x.channel,addons:x.addons.map(a=>({id:a.id,component:a.component,facts:a.facts.length}))})));
