import { writeFileSync } from 'node:fs';
const RealDate = Date;
const frozen = new RealDate('2026-09-29T10:52:14.812Z').getTime();
globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [frozen])); } static now() { return frozen; } };
const root = '/Users/morten/Documents/forsikringsapp';
const {productCatalog,resolveCatalogFacts,availableAddOns,catalogProductIdentity} = await import(root+'/lib/product-catalog.ts');
const {materializeCatalogProduct,productComparisonProducts}=await import(root+'/lib/catalog-product-comparison.ts');
const eligible = new Set(productComparisonProducts().map(catalogProductIdentity));
const result=productCatalog.products.map(p=>({identity:catalogProductIdentity(p),provider:p.providerId,type:p.insuranceType,productId:p.productId,
 base:resolveCatalogFacts(p,[]),addons:Object.fromEntries(availableAddOns(p).map(a=>[a.id,resolveCatalogFacts(p,[a.id])])),
 materialized:eligible.has(catalogProductIdentity(p))?materializeCatalogProduct(p).facts:null}));
writeFileSync(process.argv[2],JSON.stringify(result,null,2));
console.log('snapshot',result.length,'products;',result.filter(x=>x.materialized).length,'active');
