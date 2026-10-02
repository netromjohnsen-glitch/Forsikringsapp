import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { compareCatalogProducts, productComparisonProducts } from '../lib/catalog-product-comparison.ts';
import { productComparisonView, productParentEvidence, productSectionAnchor, productSectionOrder } from '../lib/product-comparison-presentation.ts';
import { productCatalog } from '../lib/product-catalog.ts';

const products = productComparisonProducts();
const find = (type, company, name) => products.find(p => p.insuranceType === type && p.company === company && p.name === name);
const result = compareCatalogProducts(find('Bil', 'If', 'Super'), find('Bil', 'Frende', 'Utvidet'));
const view = productComparisonView(result);
const groups = view => view.flatMap(s => s.groups);
const rows = view => groups(view).flatMap(g => g.rows);
const row = key => rows(view).find(r => r.key === key);
const group = id => groups(view).find(g => g.id === id);
const factsOn = (view, side) => groups(view).flatMap(g => [...g.rows.flatMap(r => r[side].facts), ...g.models.flatMap(m => m[side]), ...g.details[side]]);
const unknowns = view => rows(view).reduce((n,r) => n + Number(r.first.state === 'unknown') + Number(r.second.state === 'unknown'), 0) + groups(view).flatMap(g=>g.models).reduce((n,m)=>n+Number(!m.first.length)+Number(!m.second.length),0);

// Render the real component, not a parallel test-only implementation; no files are generated.
const require = createRequire(import.meta.url);
const uiSource = fs.readFileSync(new URL('../app/components/product-comparison.tsx', import.meta.url), 'utf8');
let js = ts.transpileModule(uiSource + '\nexport {ProductResult};', {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
js = js.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_m,spec) => `from ${JSON.stringify(spec.startsWith('@/') ? pathToFileURL(path.resolve(spec.slice(2) + '.ts')).href : pathToFileURL(require.resolve(spec)).href)}`);
const {ProductResult} = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const render = r => renderToStaticMarkup(React.createElement(ProductResult, {result:r}));
const html = render(result);

test('audit baseline has 65 rows and 33 asymmetric catalog facts after documented Frende geography', () => {
  const raw=result.sections.flatMap(s=>s.rows); assert.equal(raw.length,65);
  assert.equal(raw.filter(r=>r.first.state==='unknown'||r.second.state==='unknown').length,33);
});
test('Kasko descriptions remain side by side, exactly as sourced', () => {
  const raw=result.sections.flatMap(s=>s.rows).find(r=>r.key==='kasko.dekning'); assert.deepEqual(row('kasko.dekning'),raw);
});
for (const key of ['feilfylling.dekning','haerverk.dekning']) test(`${key}: explicit parent evidence replaces only a false unknown`, () => {
  const value=row(key).second; assert.equal(value.state,'included'); assert.equal(value.parentLabel,'Kaskoskade');
  assert.equal(value.facts[0].key,'kasko.dekning'); assert.equal(value.sources[0].documentId,'frendeKasko');
  assert.equal(value.sources[0].section,'6.1'); assert.equal(value.sources[0].page,3);
  assert.notEqual(value.text,row(key).first.text); assert.equal(group('kasko').rows.some(r=>r.key===key),true);
  assert.equal(view.some(s=>s.id.includes(key.split('.')[0])),false);
});
test('parent evidence never copies the other product deductible or uhell limits',()=>{
  assert.equal(row('feilfylling.egenandel').second.state,'unknown');
  assert.ok(row('feilfylling.dekning').second.facts.every(f=>!f.value.includes('1 000')));
});
test('combined and individual equipment sums retain their distinct scopes and sources',()=>{
  const equipment=group('utstyr'); assert.equal(equipment.rows.length,0);
  assert.ok(equipment.details.first.some(f=>f.key==='tilbehor.bagasje.grense'&&f.value.includes('40 000')));
  assert.deepEqual(equipment.details.second.map(f=>f.key).sort(),['bagasje.grense','tilbehor.grense']);
  assert.equal(equipment.details.second.some(f=>f.value.includes('70 000')),false);
});
test('Motor/gir and Maskinskade remain optional, not customer selected',()=>{
  assert.equal(row('maskinskade.dekning').first.state,'optional'); assert.equal(row('maskinskade.dekning').second.state,'optional');
});
test('machine mileage is a direct comparison with each original qualifier',()=>{
  assert.match(row('maskinskade.km').first.text,/200 000/);assert.match(row('maskinskade.km').second.text,/200 000/);
  assert.match(row('maskinskade.km').first.text,/skader etter mer/);
});
test('deductible models preserve all brackets and subtraction order',()=>{
  const model=group('maskinskade').models[0]; assert.equal(model.first.length,2); assert.equal(model.second.length,3);
  assert.match(model.first.find(f=>f.key==='maskinskade.egenandel').value,/før egenandel/);
  assert.deepEqual(model.second.map(f=>f.value),['10 000 kr','15 000 kr','20 000 kr']);
});
test('kilometerfradrag has its own side without an invented opposite unknown',()=>{
  assert.equal(row('maskinskade.fradrag'),undefined);
  assert.ok(group('maskinskade').models[0].first.some(f=>f.key==='maskinskade.fradrag'));
});
test('component lists stay provider specific without claiming identical component scope',()=>{
  assert.deepEqual(group('maskinskade').details.first.map(f=>f.key),['maskinskade.fossil','maskinskade.el','maskinskade.drivverk']);
  assert.equal(group('maskinskade').details.second.length,0);
});
for(const key of ['maskinskade.alder','parkering.dekning','parkering.grense','parkering.egenandel','bilnokkel.grense','glass.grense.bytte','rettshjelp.grense','geografi.rettshjelp','natur.dekning']) test(key==='geografi.rettshjelp' ? `${key} retains documented Norden on the Frende side` : `${key} remains genuinely unknown on the undocumented side`,()=>{
  assert.ok(row(key));
  if(key==='geografi.rettshjelp'){
    assert.equal(row(key).second.state,'included');assert.equal(row(key).second.text,'Norden');
    assert.equal(row(key).second.sources[0].documentId,'frendeAnsvar');assert.equal(row(key).second.sources[0].page,2);assert.equal(row(key).second.sources[0].section,'2');
    assert.equal(row(key).first.state,'included');
  }else assert.ok([row(key).first.state,row(key).second.state].includes('unknown'));
});
test('veihjelp common coverage/deductible and source-specific transport conditions coexist',()=>{
  assert.equal(row('veihjelp.dekning').first.state,'included');assert.equal(row('veihjelp.egenandel').second.state,'included');
  assert.deepEqual(group('veihjelp').details.first.map(f=>f.key),['veihjelp.transport.grense','veihjelp.unntak']);
});
test('leiebil common optional facts and side-specific triggers/exclusions coexist',()=>{
  for(const key of ['dager','bilklasse','kondemnasjon','kontant']) assert.equal(row(`leiebil.${key}`).second.state,'optional');
  assert.deepEqual(group('leiebil').details.first.map(f=>f.key),['leiebil.vilkar','leiebil.unntak']);
});
test('glass common deductibles and provider-specific exclusions coexist',()=>{
  for(const key of ['dekning','egenandel.bytte','egenandel.reparasjon']) assert.equal(row(`glass.${key}`).second.state,'included');
  assert.equal(group('glass').details.first[0].key,'glass.unntak');
});
test('accident insured sums compare, contractual scope details are nested',()=>{
  assert.ok(row('ulykke.invaliditet')); assert.ok(row('ulykke.dod'));
  assert.deepEqual(group('ulykke').details.first.map(f=>f.key),['ulykke.omfang','ulykke.avtalevilkar','ulykke.unntak']);
});
test('explicit unavailable catalog coverage is not converted to unknown',()=>{
  const comparison=compareCatalogProducts(find('Reise','If','Basis'),find('Reise','If','Super'));
  const unavailable=comparison.sections.flatMap(s=>s.rows).filter(r=>r.first.state==='unavailable');assert.ok(unavailable.length);
  for(const original of unavailable) assert.equal(rows(productComparisonView(comparison)).find(r=>r.key===original.key).first.state,'unavailable');
});
test('every original fact value and source survives hierarchy, without catalog mutation',()=>{
  const before=JSON.stringify(result);
  for(const side of ['first','second']) for(const fact of result.sections.flatMap(s=>s.rows).flatMap(r=>r[side].facts)) {
    assert.ok(factsOn(view,side).some(f=>JSON.stringify(f)===JSON.stringify(fact)),fact.key);
  }
  productComparisonView(result);assert.equal(JSON.stringify(result),before);assert.equal(productCatalog.products.length,204);
});
test('rendered unknown count is 9; actual missing evidence stays visible',()=>{
  assert.equal(unknowns(view),9);assert.equal(html.split('Ikke dokumentert i kataloggrunnlaget').length-1,9);
});

function synthetic() {
  const source={documentId:'test-parent',effectiveFrom:'2099-01-01',page:2,section:'2',filename:'public.pdf',company:'Tryg',url:'https://example.org/terms',termsNumber:'T',agreementScope:'ordinary'};
  const make=(key,value)=>({key,label:key,value,source});
  const products=[{company:'Tryg',providerId:'tryg',insuranceType:'Bil',name:'Alpha',productId:'alpha',version:'1',agreementScope:'ordinary',componentIds:['a']},{company:'If',providerId:'if',insuranceType:'Bil',name:'Beta',productId:'beta',version:'1',agreementScope:'ordinary',componentIds:['b']}];
  const catalog={companies:['Tryg','If'],insuranceTypes:['Bil'],products,addOns:[],sources:{'test-parent':{id:'test-parent',...source}},facts:{a:[make('kasko.dekning','Eksplisitt dokumentert syntetisk hendelse.')],b:[make('testchild.dekning','Syntetisk child')]}};
  const relation={providerId:'tryg',productIds:['alpha'],insuranceType:'bil',agreementScope:'ordinary',productVersion:'1',parentKey:'kasko.dekning',childKeys:['testchild.dekning'],value:'Eksplisitt dokumentert syntetisk hendelse.',source:{documentId:'test-parent',effectiveFrom:'2099-01-01',page:2,section:'2'}};
  const result=compareCatalogProducts(products[0],products[1],catalog);
  return {result,relation};
}
const syntheticChild=(r,rel)=>rows(productComparisonView(r,[rel])).find(r=>r.key==='testchild.dekning').first;
test('parent evaluator works for another provider and an unrelated synthetic child concept',()=>{
  const {result,relation}=synthetic(); assert.equal(syntheticChild(result,relation).state,'included');
});
for(const [label,alter] of [
  ['no explicit relation',(r,rel)=>{rel.childKeys=[];}],
  ['changed canonical provider',(r)=>{r.first.product.providerId='if';}],
  ['changed canonical product',(r)=>{r.first.product.productId='another-product';}],
  ['no approved products',(r,rel)=>{rel.productIds=[];}],
  ['parent prose without explicit evidence',(r)=>{r.first.facts[0].value='Generell Kasko';}],
  ['changed product version',(r)=>{r.first.product.version='2';}],
  ['changed agreement scope',(r)=>{r.first.product.agreementScope='member';}],
  ['changed source date',(r)=>{r.first.facts[0].sources[0].effectiveFrom='2099-02-01';}],
  ['changed source document',(r)=>{r.first.facts[0].sources[0].documentId='other';}],
  ['changed source section',(r)=>{r.first.facts[0].sources[0].section='8';}],
  ['changed source page',(r)=>{r.first.facts[0].sources[0].page=8;}],
  ['cross-type',(r)=>{r.first.product.insuranceType='MC';}],
  ['source scope mismatch',(r)=>{r.first.facts[0].sources[0].agreementScope='member';}],
  ['unavailable parent',(r)=>{r.first.facts[0].state='unavailable';}],
  ['conflicting parents',(r)=>{r.first.facts.push({...r.first.facts[0],value:'Konflikt'});}],
]) test(`parent proof fails closed: ${label}`,()=>{const {result,relation}=synthetic();alter(result,relation);assert.equal(syntheticChild(result,relation).state,'unknown');});
test('explicit child unavailability cannot be overwritten by included parent',()=>{
  const {result,relation}=synthetic(); const child=result.sections.flatMap(s=>s.rows).find(r=>r.key==='testchild.dekning');
  child.first={...child.second,state:'unavailable',text:'Ikke inkludert'};assert.equal(syntheticChild(result,relation).state,'unavailable');
});
test('optional parent yields optional child, never included',()=>{
  const {result,relation}=synthetic();result.first.facts[0].state='optional';
  result.sections.flatMap(s=>s.rows).find(r=>r.key==='kasko.dekning').first.state='optional';
  assert.equal(syntheticChild(result,relation).state,'optional');
});
test('unaudited one-sided key remains unknown instead of being silently hidden',()=>{
  const r=structuredClone(result);const base=r.sections[0].rows[0];
  r.sections[0].rows.push({...base,key:'new.limit',second:{state:'unknown',text:'Ikke dokumentert i kataloggrunnlaget',facts:[],sources:[]}});
  assert.equal(rows(productComparisonView(r)).find(r=>r.key==='new.limit').second.state,'unknown');
});
test('source registry is anchored to source evidence, not company-name matching',()=>{
  assert.ok(productParentEvidence.every(r=>r.providerId&&r.productIds.length&&r.source.documentId&&r.source.effectiveFrom&&r.value&&r.productVersion));
  const source=fs.readFileSync(new URL('../lib/product-comparison-presentation.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\.company\s*===|\.providerId\s*===|\.includes\(["']feilfylling/u);
});

for(const frendeLevel of ['Kasko','Utvidet']) for(const [company,level] of [['If','Super'],['Tryg','Kasko']]) {
  test(`explicit parent identity preserves ${company} ${level} / Frende ${frendeLevel} child evidence`,()=>{
    const comparison=compareCatalogProducts(find('Bil',company,level),find('Bil','Frende',frendeLevel));
    const display=rows(productComparisonView(comparison));
    for(const key of ['feilfylling.dekning','haerverk.dekning']) {
      const value=display.find(row=>row.key===key).second;
      assert.equal(value.state,'included');
      assert.equal(value.parentLabel,'Kaskoskade');
      assert.equal(value.facts[0].key,'kasko.dekning');
      assert.equal(value.sources[0].documentId,'frendeKasko');
      assert.equal(value.sources[0].page,3);
      assert.equal(value.sources[0].section,'6.1');
    }
    const swapped=rows(productComparisonView(compareCatalogProducts(comparison.second.product,comparison.first.product)));
    for(const key of ['feilfylling.dekning','haerverk.dekning']) {
      assert.deepEqual(swapped.find(row=>row.key===key).first,display.find(row=>row.key===key).second);
    }
  });
}

const scenarios=[['Bil','If','Super','Frende','Utvidet'],['Hus','Tryg','Hus Ekstra','If','Super'],['Innbo','Tryg','Innbo Ekstra','If','Super'],['Reise','Tryg','Reise Ekstra','If','Super'],['Snøscooter','Tryg','Kasko','If','Kasko'],['Campingvogn','Tryg','Campingvogn Ekstra','If','Super'],['Tilhenger','Tryg','Kasko','If','Kasko'],['MC','Tryg','MC Ekstra','If','Kasko'],['Bobil','Tryg','Bobil Ekstra','If','Super']];
for(const [type,a,an,b,bn] of scenarios) test(`${type}: nonempty family-specific order, unique live anchors and full source retention`,()=>{
  const r=compareCatalogProducts(find(type,a,an),find(type,b,bn));const v=productComparisonView(r);const rendered=render(r);
  assert.ok(v.length);assert.equal(new Set(v.map(s=>s.id)).size,v.length);assert.equal(new Set(v.map(s=>s.anchorId)).size,v.length);
  const order=productSectionOrder(type);const ranks=v.map(s=>order.indexOf(s.id));assert.deepEqual(ranks,[...ranks].sort((a,b)=>a-b));
  for(const s of v){assert.ok(s.groups.length);assert.ok(rendered.includes(`href="#${s.anchorId}"`));assert.ok(rendered.includes(`id="${s.anchorId}"`));}
  for(const side of ['first','second']) for(const f of r.sections.flatMap(s=>s.rows).flatMap(r=>r[side].facts)) assert.ok(factsOn(v,side).some(candidate=>JSON.stringify(candidate)===JSON.stringify(f)));
});
test('empty sections are absent, product and family changes recalculate navigation',()=>{
  const basic=productComparisonView(compareCatalogProducts(find('Bil','If','Ansvar'),find('Bil','Frende','Ansvar')));
  assert.equal(basic.some(s=>s.id==='bil.maskinskade'),false);assert.ok(view.some(s=>s.id==='bil.maskinskade'));
  assert.notDeepEqual(view.map(s=>s.id),productComparisonView(compareCatalogProducts(find('MC','Tryg','MC Ekstra'),find('MC','If','Kasko'))).map(s=>s.id));
});
test('same exact product retains all details and navigation, without invented differences',()=>{
  const p=find('Bil','If','Super');const r=compareCatalogProducts(p,p);assert.equal(r.differenceCount,0);
  assert.ok(productComparisonView(r).length);assert.match(render(r),/Hopp til dekning/);assert.match(render(r),/Ingen dokumenterte produktforskjeller/);
});
test('canonical IDs remain stable across side swap and distinguish Unicode or punctuation',()=>{
  assert.deepEqual(productComparisonView(compareCatalogProducts(result.second.product,result.first.product)).map(s=>s.anchorId),view.map(s=>s.anchorId));
  assert.notEqual(productSectionAnchor('a.b'),productSectionAnchor('a-b'));assert.notEqual(productSectionAnchor('snøscooter.kasko'),productSectionAnchor('snoscooter.kasko'));
});
test('full product content is directly visible; only sources use details/summary',()=>{
  assert.match(html,/Dekninger og vilkår/);assert.doesNotMatch(html,/Viktigste forskjeller|Vis detaljert sammenligning/);
  assert.ok((html.match(/<details/g)||[]).length>0);
  assert.equal((html.match(/<details/g)||[]).length,(html.match(/<summary aria-label="Vis kilde:/g)||[]).length);
});
test('product A/B, scope header and source links remain accessible without customer statuses',()=>{
  assert.match(html,/Produkt A/);assert.match(html,/Produkt B/);assert.match(html,/Vis kilde/);assert.match(html,/Åpne originalkilde/);
  assert.doesNotMatch(html,/Eksisterende avtale|Nytt tilbud|✓ Valgt|TFA|Årspremie|Manglende objekt|Registreringsnummer/);
});
test('native navigation has labels, focusable sections, offset and logical heading hierarchy',()=>{
  assert.match(html,/<nav aria-label="Hopp til dekning"/);assert.match(html,/tabindex="-1"/);assert.match(html,/scroll-mt-6/);
  for(const tag of ['h2','h3','h4','h5','h6']) assert.ok(html.includes(`<${tag}`));
});
test('mobile chip rail is bounded and desktop wraps without scrollspy or click-only controls',()=>{
  assert.match(html,/max-w-full gap-2 overflow-x-auto py-2 sm:flex-wrap/);assert.match(html,/min-h-11 shrink-0/);
  assert.doesNotMatch(uiSource,/IntersectionObserver|scrollIntoView|position:\s*sticky/);
});
test('nested details keep vertical guide and explicit product/provider association',()=>{
  assert.match(html,/expanded-detail-area/);assert.match(html,/aria-label="Maskinskade \/ motor- og girskade – Produkt A – If"/);
  assert.match(html,/Produktspesifikke detaljer/);
});
test('customer view retains important differences and its existing detailed comparison gate',()=>{
  const customer=fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
  assert.match(customer,/Viktigste forskjeller/);assert.match(customer,/Vis detaljert sammenligning/);
});
test('product selector still invalidates prior results on product, provider and type changes',()=>{
  assert.match(uiSource,/function update\(next: Selection\) \{\s*onInvalidate\(\)/);
  assert.match(uiSource,/setFirst\(emptySelection\(\)\);\s*setSecond\(emptySelection\(\)\);\s*invalidate\(\)/);
});
test('parent-backed children are subordinate to Kasko, not duplicate primary sections',()=>{
  assert.match(html,/Dekninger dokumentert i hovedvilkåret/);
  assert.match(uiSource,/parentBackedRows\.length > 0 && <div className="expanded-detail-area/);
});
test('product materialization and presentation perform zero runtime fetches',()=>{
  const original=globalThis.fetch;let requests=0;
  globalThis.fetch=()=>{requests++;throw new Error('Unexpected product-mode network');};
  try { for(const [type,a,an,b,bn] of scenarios) render(compareCatalogProducts(find(type,a,an),find(type,b,bn))); }
  finally {globalThis.fetch=original;}
  assert.equal(requests,0);
  const metadata=fs.readFileSync(new URL('../lib/product-comparison-presentation.ts',import.meta.url),'utf8');
  assert.doesNotMatch(metadata,/OpenAI|fetch\s*\(|pdf-reader|\/api\//);
});
test('Hus leads with coverage instead of age deductions and deductible details',()=>{
  const result=compareCatalogProducts(find('Hus','Tryg','Hus Ekstra'),find('Hus','If','Super'));
  const water=productComparisonView(result).find(s=>s.id==='hus.vann-fukt');
  assert.notEqual(water.groups[0].id,'hus.aldersfradrag');
  const waterRows=water.groups.find(g=>g.id==='hus.vann').rows;
  assert.ok(!waterRows[0].key.includes('egenandel'));
});
