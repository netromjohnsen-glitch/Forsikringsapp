import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deserialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {productCatalog,resolveCatalogFacts,resolveCatalogEvidence,findCatalogProduct} from '../lib/product-catalog.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {materializeCatalogProduct,compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {groupInsurances,groupTerms} from '../lib/comparison.ts';
import {documentPipeline} from './helpers/supporting-terms.mjs';
import {buildingsSourceOracle as o,withBuildingsSourcePage,withOriginalBuildingsSourcePage} from './helpers/house-buildings-source.mjs';
const dir=new URL('../docs/audit/checkpoints/house-buildings-source-1b5b5aa/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),date=new Date('2026-10-23T12:00:00Z');
const p=id=>productCatalog.products.find(p=>p.productId===id),repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const clean=x=>JSON.parse(JSON.stringify(x));
function checkTerm(i){const rows=i.importantTerms.filter(t=>t.key===o.key);assert.equal(rows.length,1);assert.equal(rows[0].value,o.value);assert.equal(rows[0].coverageOrigin,'catalog');assert.equal(rows[0].source.page,3);assert.equal(rows[0].source.documentId,'gjensidigeHusStandard');assert.ok(rows[0].sources.every(s=>s.page===3));}
test('BUILDINGS-SOURCE exact full raw catalog delta: one shared primary page2 to3, all other fields unchanged',()=>{
 const expected=structuredClone(before.catalog);const row=expected.facts.gjensidigeHusStandard.find(f=>f.key===o.key);assert.equal(row.source.page,2);assert.equal(row.value,o.value);row.source.page=3;
 assert.deepEqual(productCatalog,expected);assert.deepEqual(withOriginalBuildingsSourcePage(productCatalog),before.catalog);
 assert.equal(productCatalog.facts.gjensidigeHusPluss.some(f=>f.key===o.key),false);
});
for(const source of o.source_pages.filter(s=>s.PDF_page_1_based===3))test('BUILDINGS-SOURCE original registered PDF table supports page3 '+source.artifact,()=>{
 const file=new URL('../'+source.artifact,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),source.source_sha256);
 const raw=execFileSync('pdftotext',['-raw','-f','3','-l','3',file.pathname,'-']).toString();assert.equal(raw,source.raw_text);
 const flat=raw.replace(/\s+/gu,' ');for(const phrase of ['Bygning angitt i forsikringsbeviset, med fastmontert utstyr','Frittliggende bygg på forsikringsstedet til og med bruttoareal 10 kvm.','Frittliggende bygg over bruttoareal 10 kvm. som ikke er angitt i forsikringsbeviset'])assert.ok(flat.includes(phrase),phrase);
});
for(const c of before.configurations)test('BUILDINGS-SOURCE both levels and all choices keep complete outputs except source page '+c.id+'/'+c.selected.join('+'),()=>{
 assert.deepEqual(resolveCatalogFacts(p(c.id),c.selected,date),withBuildingsSourcePage(c.facts));
 assert.deepEqual(resolveCatalogEvidence(p(c.id),c.selected,date),withBuildingsSourcePage(c.evidence));
 const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];checkTerm(first);assert.deepEqual(first,withBuildingsSourcePage(c.first));
 let last=first;for(let n=0;n<3;n++){last=repeat(clean(last));checkTerm(last);}
 assert.deepEqual(last,withBuildingsSourcePage(c.repeat3));
 const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display,withBuildingsSourcePage(c.display));
 const row=display.find(r=>r.key===o.key);assert.equal(row.firstSources[0].page,3);assert.equal(row.secondSources[0].page,3);
});
test('BUILDINGS-SOURCE all214 manual inputs and144 document controls preserve full prior behavior except page',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);
 for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(first,withBuildingsSourcePage(c.first),c.id);const repeated=repeat(first); // Reproduce the exact company argument recorded by capture-before.mjs.
assert.deepEqual(repeated,withBuildingsSourcePage(c.repeated),c.id);}
 for(const c of before.documents)assert.deepEqual(documentPipeline([[c.record]],c.side).insuranceData,withBuildingsSourcePage(c.output),c.id);
});
test('BUILDINGS-SOURCE materialization and both comparison directions preserve full outputs',()=>{
 for(const c of before.materialized){const result=materializeCatalogProduct(p(c.id));assert.deepEqual(result,withBuildingsSourcePage(c.output));const row=result.facts.find(f=>f.key===o.key);assert.equal(row.sources[0].page,3);assert.equal(row.sources[0].documentId,'gjensidigeHusStandard');}
 assert.equal(before.comparisons.length,52);for(const c of before.comparisons)assert.deepEqual(compareCatalogProducts(p(c.a),p(c.b)),withBuildingsSourcePage(c.output),c.a+'/'+c.b);
});
test('BUILDINGS-SOURCE exact scope and every other product/configuration unchanged',()=>{
 for(const id of ['gjensidige-hus','gjensidige-hus-pluss'])for(const [provider,type,scope,version]of[['if','Hus','ordinary','Alminnelige vilkår'],['gjensidige','Innbo','ordinary','Alminnelige vilkår'],['gjensidige','Hus','nito','Alminnelige vilkår'],['gjensidige','Hus','ordinary','Annen versjon']])assert.equal(findCatalogProduct(provider,id,version,{insuranceType:type,agreementScope:scope}),null);
 for(const product of productCatalog.products.filter(p=>!['gjensidige-hus','gjensidige-hus-pluss'].includes(p.productId)))assert.deepEqual(resolveCatalogFacts(product,[],date),resolveCatalogFacts(before.catalog.products.find(p=>p.productId===product.productId),[],date,null,before.catalog));
});
test('BUILDINGS-SOURCE projection rejects unrelated page/identity changes and preserves customer sources',()=>{
 const row=structuredClone(before.catalog.facts.gjensidigeHusStandard.find(f=>f.key===o.key));
 for(const change of [r=>r.source.page=99,r=>r.source.section='Other section',r=>r.source.filename='Other.pdf']){const bad=structuredClone(row);change(bad);assert.throws(()=>withBuildingsSourcePage(bad));assert.throws(()=>withOriginalBuildingsSourcePage(bad));}
 const otherKey={...row,key:'hus.other'};assert.deepEqual(withBuildingsSourcePage(otherKey),otherKey);
 const customer={...row,source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:9,documentRole:'individual_agreement'}};assert.deepEqual(withBuildingsSourcePage(customer),customer);
 const forward=withBuildingsSourcePage(row);assert.equal(forward.source.page,3);assert.equal(row.source.page,2);assert.deepEqual(withOriginalBuildingsSourcePage(forward),row);
});
