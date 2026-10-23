import {safeguardSourceOracle} from './helpers/house-safeguard-source.mjs';
import {rebuildingSourceOracle,rebuildingSourceKeys} from './helpers/house-rebuilding-source.mjs';
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
import {buildingsSourceOracle as o,buildingsSourceKeys,withBuildingsSourcePage,withOriginalBuildingsSourcePage} from './helpers/house-buildings-source.mjs';
const dir=new URL('../docs/audit/checkpoints/house-buildings-source-1b5b5aa/',import.meta.url),bytes=readFileSync(new URL('baseline.v8.gz',dir));
assert.equal(createHash('sha256').update(bytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',dir))).baseline_sha256);
const before=deserialize(gunzipSync(bytes)),date=new Date('2026-10-23T12:00:00Z');
const p=id=>productCatalog.products.find(p=>p.productId===id),repeat=i=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[i]},date).insurances[0];
const clean=x=>JSON.parse(JSON.stringify(x));
const sourceKeys=[...buildingsSourceKeys,...rebuildingSourceKeys,safeguardSourceOracle.key],expectedPage=key=>key===safeguardSourceOracle.key?17:rebuildingSourceKeys.includes(key)?16:3;
function checkTerm(i){for(const key of sourceKeys){const rows=i.importantTerms.filter(t=>t.key===key),original=before.catalog.facts.gjensidigeHusStandard.find(f=>f.key===key);assert.equal(rows.length,1);assert.equal(rows[0].value,original.value);assert.equal(rows[0].coverageOrigin,'catalog');assert.equal(rows[0].source.page,expectedPage(key));assert.equal(rows[0].source.documentId,'gjensidigeHusStandard');assert.ok(rows[0].sources.every(s=>s.page===expectedPage(key)));}}
test('BUILDINGS-SOURCE exact full raw catalog: only authorized object,rebuilding and ordinary safeguard source pages',()=>{
 const expected=structuredClone(before.catalog);const row=expected.facts.gjensidigeHusStandard.find(f=>f.key===o.key);assert.equal(row.source.page,2);assert.equal(row.value,o.value);row.source.page=3;
 assert.deepEqual(productCatalog,withBuildingsSourcePage(expected));assert.deepEqual(withOriginalBuildingsSourcePage(productCatalog),before.catalog);
 for(const key of sourceKeys)assert.equal(productCatalog.facts.gjensidigeHusPluss.some(f=>f.key===key),false);
});
for(const source of o.source_pages.filter(s=>s.PDF_page_1_based===3))test('BUILDINGS-SOURCE original registered PDF table supports page3 '+source.artifact,()=>{
 const file=new URL('../'+source.artifact,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),source.source_sha256);
 const raw=execFileSync('pdftotext',['-raw','-f','3','-l','3',file.pathname,'-']).toString();assert.equal(raw,source.raw_text);
 const flat=raw.replace(/\s+/gu,' ');for(const phrase of ['Bygning angitt i forsikringsbeviset, med fastmontert utstyr','Frittliggende bygg på forsikringsstedet til og med bruttoareal 10 kvm.','Frittliggende bygg over bruttoareal 10 kvm. som ikke er angitt i forsikringsbeviset','Solceller som dekker privat forbruk'])assert.ok(flat.includes(phrase),phrase);
});
for(const c of before.configurations)test('BUILDINGS-SOURCE both levels and all choices keep complete outputs except source page '+c.id+'/'+c.selected.join('+'),()=>{
 assert.deepEqual(resolveCatalogFacts(p(c.id),c.selected,date),withBuildingsSourcePage(c.facts));
 assert.deepEqual(resolveCatalogEvidence(p(c.id),c.selected,date),withBuildingsSourcePage(c.evidence));
 const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];checkTerm(first);assert.deepEqual(first,withBuildingsSourcePage(c.first));
 let last=first;for(let n=0;n<3;n++){last=repeat(clean(last));checkTerm(last);}
 assert.deepEqual(last,withBuildingsSourcePage(c.repeat3));
 const display=groupTerms(groupInsurances([last],[last],null)[0],null);assert.deepEqual(display,withBuildingsSourcePage(c.display));
 for(const key of sourceKeys){const row=display.find(r=>r.key===key);assert.equal(row.firstSources[0].page,expectedPage(key));assert.equal(row.secondSources[0].page,expectedPage(key));}
});
test('BUILDINGS-SOURCE all214 manual inputs and144 document controls preserve full prior behavior except page',()=>{
 assert.equal(before.controls.length,214);assert.equal(before.documents.length,144);
 for(const c of before.controls){if(c.error){assert.throws(()=>normalizeManualAgreement(c.input),{message:c.error});continue;}const first=normalizeManualAgreement(c.input).insuranceData.insurances[0];assert.deepEqual(first,withBuildingsSourcePage(c.first),c.id);const repeated=repeat(first); // Reproduce the exact company argument recorded by capture-before.mjs.
assert.deepEqual(repeated,withBuildingsSourcePage(c.repeated),c.id);}
 for(const c of before.documents)assert.deepEqual(documentPipeline([[c.record]],c.side).insuranceData,withBuildingsSourcePage(c.output),c.id);
});
test('BUILDINGS-SOURCE materialization and both comparison directions preserve full outputs',()=>{
 for(const c of before.materialized){const result=materializeCatalogProduct(p(c.id));assert.deepEqual(result,withBuildingsSourcePage(c.output));for(const key of sourceKeys){const row=result.facts.find(f=>f.key===key);assert.equal(row.sources[0].page,expectedPage(key));assert.equal(row.sources[0].documentId,'gjensidigeHusStandard');}}
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

for(const page of rebuildingSourceOracle.source_pages.filter(p=>p.PDF_page_1_based===(p.path.includes('Standard')?16:17)))test('REBUILDING-SOURCE exact original paragraphs '+page.path,()=>{
 const file=new URL('../'+page.path,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),page.sha256);
 const raw=execFileSync('pdftotext',['-raw','-f',String(page.PDF_page_1_based),'-l',String(page.PDF_page_1_based),file.pathname,'-']).toString();assert.equal(raw,page.raw_text);
 const flat=raw.replace(/\s+/gu,' ');for(const phrase of ['Fullverdiforsikret bygning - fullverdigaranti:','samme formål på samme sted innen 5 år','svanemerket bolig','merkostnad på inntil kr 250 000','Er skaden større enn 75%','gjenverdiene er revet og fjernet innen 2 år etter skadetidspunktet'])assert.ok(flat.includes(phrase),phrase);
});
test('REBUILDING-SOURCE exact-key guard rejects unrelated page/source changes and preserves other rules',()=>{
 for(const row of rebuildingSourceOracle.source_before){
  for(const change of [r=>r.source.page=99,r=>r.source.section='Other',r=>r.source.filename='Other.pdf']){const bad=structuredClone(row);change(bad);assert.throws(()=>withBuildingsSourcePage(bad));assert.throws(()=>withOriginalBuildingsSourcePage(bad));}
  const after=withBuildingsSourcePage(row);assert.equal(after.source.page,16);assert.equal(row.source.page,17);assert.deepEqual(withOriginalBuildingsSourcePage(after),row);
  const customer={...row,source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:9,documentRole:'individual_agreement'}};assert.deepEqual(withBuildingsSourcePage(customer),customer);
 }
 for(const key of ['hus.gjenoppforing.annetsted','hus.underforsikring.begrensning']){const row=before.catalog.facts.gjensidigeHusStandard.find(f=>f.key===key);assert.deepEqual(withBuildingsSourcePage(row),row);}
});

for(const block of safeguardSourceOracle.ordinary_source_blocks)test('SAFEGUARD-SOURCE exact ordinary exemption block before separate Smart section '+block.path,()=>{
 const file=new URL('../'+block.path,import.meta.url),page=safeguardSourceOracle.source_pages.find(p=>p.path===block.path&&p.PDF_page_1_based===block.PDF_page_1_based);
 assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),page.sha256);
 const raw=execFileSync('pdftotext',['-raw','-f',String(block.PDF_page_1_based),'-l',String(block.PDF_page_1_based),file.pathname,'-']).toString();assert.equal(raw,page.raw_text);
 const ordinary=raw.replace(/\s+/gu,' ').split('Det trekkes ikke egenandel ved:')[1].split('For Hus Smart med alarmtjeneste fra Gjensidige')[0].trim();assert.equal(ordinary,block.ordinary_three_bullet_block);assert.equal(ordinary.split('- ').length-1,3);
 for(const phrase of ['vannstoppventil som sikrer rørsystem i hele bygningen','i løpet av siste 5 år','kontrollør godkjent av Gjensidige','kontrollskjema/ferdigattest skal foreligge','skade som alene rammer overspenningsvern/brannalarm/innbruddsalarm'])assert.ok(ordinary.includes(phrase),phrase);
});
test('SAFEGUARD-SOURCE exact-key guard preserves customer and unrelated Standard18 references',()=>{
 const row=safeguardSourceOracle.source_before;
 for(const change of [r=>r.source.page=99,r=>r.source.section='Other',r=>r.source.filename='Other.pdf']){const bad=structuredClone(row);change(bad);assert.throws(()=>withBuildingsSourcePage(bad));assert.throws(()=>withOriginalBuildingsSourcePage(bad));}
 const after=withBuildingsSourcePage(row);assert.equal(after.source.page,17);assert.equal(row.source.page,18);assert.deepEqual(withOriginalBuildingsSourcePage(after),row);
 const customer={...row,source:{documentId:'pdf:existing:0',filename:'Kundebevis.pdf',page:9,documentRole:'individual_agreement'}};assert.deepEqual(withBuildingsSourcePage(customer),customer);
 for(const key of ['hus.naturskade.dekning','hus.pabud.dekning','hus.gjenoppforing.annetsted','hus.underforsikring.begrensning']){const other=before.catalog.facts.gjensidigeHusStandard.find(f=>f.key===key);assert.deepEqual(withBuildingsSourcePage(other),other);}
});
