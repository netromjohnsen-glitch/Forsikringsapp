import fs from 'node:fs';
import crypto from 'node:crypto';
import {productCatalog as c,catalogProductIdentity,resolveProductComponentIds,resolveCatalogFacts,resolveCatalogEvidence,availableAddOns} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
import {productComparisonProducts,isHistoricalCatalogProduct,materializeCatalogProduct} from '/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts';
const out='/tmp/source-catalog-completeness-audit';
const eligible=new Set(productComparisonProducts(c).map(catalogProductIdentity));
const products=c.products.map(p=>{
 const identity=catalogProductIdentity(p), channels=[null,'sparebank1','dnb','eika'];
 const addons=[...new Map(channels.flatMap(ch=>availableAddOns(p,new Date(),ch,c)).map(a=>[a.id,a])).values()];
 return {...p,agreementScope:p.agreementScope??'ordinary',identity,historical:isHistoricalCatalogProduct(p),eligible:eligible.has(identity),components:resolveProductComponentIds(p,c),addons:addons.map(a=>a.id),evidence:resolveCatalogEvidence(p,[],new Date(),null,c),facts:resolveCatalogFacts(p,[],new Date(),null,c),materialized:eligible.has(identity)?materializeCatalogProduct(p,c).facts:[],addonFacts:Object.fromEntries(addons.map(a=>[a.id,c.facts[a.componentId]??[]]))};
});
const data={products,addons:c.addOns,sources:c.sources,components:c.facts,agreementScopes:c.agreementScopes,now:new Date().toISOString()};
fs.writeFileSync(out+'/catalog.json',JSON.stringify(data,null,2));
fs.writeFileSync(out+'/catalog-fingerprint.txt',crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex')+'\n');
console.log(JSON.stringify({products:products.length,eligible:eligible.size,historical:products.filter(p=>p.historical).map(p=>p.identity),addons:c.addOns.length,sources:Object.keys(c.sources).length,components:Object.keys(c.facts).length,families:[...new Set(products.map(p=>p.insuranceType))],providers:[...new Set(products.map(p=>p.providerId))],scopes:[...new Set(products.map(p=>p.agreementScope))]},null,2));
