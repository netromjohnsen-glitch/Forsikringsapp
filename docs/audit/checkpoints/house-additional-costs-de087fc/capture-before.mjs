// Capture fresh-main outputs BEFORE the six additional-cost rows; immutable data afterwards.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {serialize,deserialize} from 'node:v8';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {productCatalog,availableAddOns,resolveCatalogFacts,resolveCatalogEvidence} from '../../../../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../../../../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog} from '../../../../lib/catalog-enrichment.ts';
import {groupInsurances,groupTerms} from '../../../../lib/comparison.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../../../../lib/catalog-product-comparison.ts';
import {documentPipeline} from '../../../../tests/helpers/supporting-terms.mjs';
const target=new URL('./baseline.v8.gz',import.meta.url),date=new Date('2026-10-24T12:00:00Z');
assert.ok(['gjensidigeHusStandard','gjensidigeHusPluss'].every(owner=>!productCatalog.facts[owner].some(f=>['hus.rydding.dekning','hus.gjenoppforing.prisstigning','hus.vann.vannavgift'].includes(f.key))));
const older=deserialize(gunzipSync(readFileSync(new URL('../b130-person-scope-cfada9a/baseline.v8.gz',import.meta.url))));
const ids=['gjensidige-hus','gjensidige-hus-pluss'];
const repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const controls=older.controls.map(c=>{try{const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];return {id:c.id,input:c.input,first,repeated:repeat(first)};}catch(e){assert.ok(c.error);return {id:c.id,input:c.input,error:e.message};}});
const documents=older.documents.map(c=>({id:c.id,side:c.side,record:c.record,output:documentPipeline([[c.record]],c.side).insuranceData}));
const configurations=[];
for(const id of ids){const p=productCatalog.products.find(p=>p.productId===id),addons=availableAddOns(p,date);
 for(let mask=0;mask<2**addons.length;mask++){const selected=addons.filter((_,i)=>mask&(1<<i)).map(a=>a.id),input={company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:p.name,annualPremium:'12345',deductible:'9000',coverageSummary:'',importantTerms:[],addOnIds:selected}]};
  const first=normalizeManualAgreement(input).insuranceData.insurances[0];let last=first;for(let n=0;n<3;n++)last=repeat(JSON.parse(JSON.stringify(last)));
  configurations.push({id,selected,input,facts:resolveCatalogFacts(p,selected,date),evidence:resolveCatalogEvidence(p,selected,date),first,repeat3:last,display:groupTerms(groupInsurances([last],[last],null)[0],null)});
 }
}
const products=ids.map(id=>productCatalog.products.find(p=>p.productId===id));
const comparisons=[];for(const a of products)for(const b of productCatalog.products.filter(p=>p.insuranceType==='Hus'))for(const [x,y] of [[a,b],[b,a]])comparisons.push({a:x.productId,b:y.productId,output:compareCatalogProducts(x,y)});
const baseline={catalog:productCatalog,controls,documents,configurations,materialized:products.map(p=>({id:p.productId,output:materializeCatalogProduct(p)})),comparisons};
const bytes=gzipSync(serialize(baseline),{mtime:0});writeFileSync(target,bytes);
writeFileSync(new URL('./baseline-identity.json',import.meta.url),JSON.stringify({base_revision:'de087fccb92706dbf8d2bf6a697aa6cf6a27081a',captured_before_production_edit:true,baseline_sha256:createHash('sha256').update(bytes).digest('hex'),manual_controls:controls.length,document_controls:documents.length,configurations:configurations.length,comparisons:comparisons.length},null,2)+'\n');
console.log(JSON.stringify({controls:controls.length,documents:documents.length,configurations:configurations.length,comparisons:comparisons.length}));
