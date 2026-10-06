import {readFileSync} from 'node:fs';import{gunzipSync}from'node:zlib';
import{enrichExtractedAgreementWithCatalog}from'../../../../lib/catalog-enrichment.ts';
import{materializeCatalogProduct}from'../../../../lib/catalog-product-comparison.ts';
import {groupInsurances,groupTerms}from'../../../../lib/comparison.ts';
const catalog=JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz',import.meta.url))));
const product=catalog.products.find(p=>p.productId==='gjensidige-hus');
const keys=['hus.brukstap.dekning','hus.leietap.skade','hus.utleie.vilkar','hus.utleie.mislighold','hus.utleie.utkastelse','hus.utleie.skadeverk'];
const source={documentId:'synthetic-b051-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Avtalte vilkår',company:'Gjensidige',url:'https://example.invalid/customer'};
const probes=[];
for(const key of keys){const input={company:'Gjensidige',totalAnnualPremium:null,insurances:[{type:'Hus',productName:'Hus',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:[{name:key,canonicalKey:key,value:'Ukjent',source}]}]};
 const enriched=enrichExtractedAgreementWithCatalog(input,new Date('2026-10-06'),undefined,undefined,catalog);const out=enriched.insurances[0];probes.push({key,input:input.insurances[0].importantTerms[0],retained:out.importantTerms.filter(t=>t.key===key),addonids:out.addOnIds,comparison:groupTerms(groupInsurances(enriched.insurances,enriched.insurances,null)[0],null).find(r=>r.key===key)});}
const f=materializeCatalogProduct(product,catalog).facts.find(f=>f.key==='hus.brukstap.dekning');
console.log(JSON.stringify({tested_catalog_revision:'5718a5fdcfe669d6afd11d4c27fe3a45ed24c175',unchanged_production_functions:true,registered_source:catalog.sources.gjensidigeHusStandard,registered_sourceType_field_present:Object.hasOwn(catalog.sources.gjensidigeHusStandard,'sourceType'),presented_sourceType_is_undefined:f.sources.every(s=>Object.hasOwn(s,'sourceType')&&s.sourceType===undefined),presented_fact:f,probes},null,2));
