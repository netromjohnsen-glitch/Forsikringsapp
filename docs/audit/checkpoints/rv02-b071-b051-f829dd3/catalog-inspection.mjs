// Read-only baseline inventory and real-function probes. No candidate mutations.
import { productCatalog, resolveCatalogFacts, resolveProductComponentIds } from '../../../../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../../../../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog, catalogFactSources } from '../../../../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../../../../lib/manual-agreement.ts';
import { relatedCoveragesForInsuranceType } from '../../../../lib/insurance-normalization.ts';
const date=new Date('2026-10-06T12:00:00Z');
const byId=id=>productCatalog.products.find(p=>p.productId===id);
const ids=['gjensidige-hus','gjensidige-hus-pluss'];
const owners=['gjensidigeHusStandard','gjensidigeHusPluss','gjensidigeHusRental','gjensidigeHusRotOption','gjensidigeHusSmart'];
const dogOwners=['sparebank1-fremtind-hund-veterin-r','sparebank1-fremtind-hund-topp','sparebank1-fremtind-hund-liv','sparebank1-fremtind-hund-bruk'];
const manual=(id,addOnIds=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:byId(id).name,annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds}]}).insuranceData.insurances[0];
const source={documentId:'synthetic-rv02-hus-customer',filename:'synthetic-customer.pdf',termsNumber:'Synthetic evidence',effectiveFrom:'',page:2,section:'Avtalte vilkår',company:'Gjensidige',url:'https://example.invalid/synthetic'};
const keys=['hus.utleie.vilkar','hus.utleie.mislighold','hus.utleie.skadeverk','hus.leietap.skade','hus.brukstap.dekning'];
const probes=[];
for(const id of ids) for(const key of keys) for(const value of [null,'Valgt','Ikke valgt','Dokumentert kundevilkår 13 000 kr']){
 const f=productCatalog.facts.gjensidigeHusRental.find(f=>f.key===key)??resolveCatalogFacts(byId(id),[],date).find(f=>f.key===key);
 const input={company:'Gjensidige',totalAnnualPremium:null,insurances:[{type:'Hus',productName:byId(id).name,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:value===null?[]:[{name:f.label,canonicalKey:key,value,source}]}]};
 const out=enrichExtractedAgreementWithCatalog(input,date).insurances[0];
 probes.push({product:id,key,input_value:value,addOnIds:out.addOnIds,terms:out.importantTerms.filter(t=>t.key===key||t.key?.startsWith('hus.utleie.'))});
}
const products=ids.map(id=>({product:byId(id),components:resolveProductComponentIds(byId(id)),effective:resolveCatalogFacts(byId(id),[],date),manual_no_options:manual(id),manual_rental:manual(id,['gjensidige-hus-utleie']),materialized:materializeCatalogProduct(byId(id))}));
const comparisons=ids.flatMap(a=>ids.map(b=>({first:a,second:b,result:compareCatalogProducts(byId(a),byId(b))})));
console.log(JSON.stringify({probe_kind:'READ_ONLY_BASELINE_NO_IMPLEMENTATION_OR_CLOSURE',tested_revision:'f829dd3dba2ad8a5dbb0d0d9eb584be83f428f2e',date:date.toISOString(),all_hus_water_keys:[...new Set(Object.values(productCatalog.facts).flat().filter(f=>f.key.startsWith('hus.vann.')).map(f=>f.key))].sort(),related_hus_coverages:relatedCoveragesForInsuranceType('Hus'),facts:Object.fromEntries(owners.map(id=>[id,productCatalog.facts[id]])),dog_facts:Object.fromEntries(dogOwners.map(id=>[id,productCatalog.facts[id]])),sources:Object.fromEntries(Object.entries(productCatalog.sources).filter(([,s])=>s.company==='Gjensidige'&&s.insuranceType==='Hus'||s.providerId==='sparebank1-fremtind'&&s.insuranceType==='Hund')),products,probes,comparisons,dog_fact_sources:Object.fromEntries(dogOwners.map(id=>[id,productCatalog.facts[id].map(f=>({key:f.key,sources:catalogFactSources(f)}))]))},null,2));
