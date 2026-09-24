import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {pipeline, car, term} from './helpers/pilot-quality.mjs';
import {deterministicCars} from './helpers/pilot-determinism.mjs';
const require=createRequire(import.meta.url), root=path.resolve('.'), urls=new Map();
function componentUrl(file) {
  if(urls.has(file))return urls.get(file);
  let source=fs.readFileSync(file,'utf8');
  if(file.endsWith('/app/page.tsx'))source+='\nexport {Comparison};';
  let code=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  code=code.replace(/from "([^"]+)"/g,(_,specifier)=>{
    if(!specifier.startsWith('.')&&!specifier.startsWith('@/'))return `from "${pathToFileURL(require.resolve(specifier)).href}"`;
    let target=specifier.startsWith('@/')?path.resolve(root,specifier.slice(2)):path.resolve(path.dirname(file),specifier);
    if(!path.extname(target))target+=fs.existsSync(target+'.ts')?'.ts':'.tsx';
    return `from "${target.endsWith('.tsx')?componentUrl(target):pathToFileURL(target).href}"`;
  });
  const url='data:text/javascript;base64,'+Buffer.from(code).toString('base64');urls.set(file,url);return url;
}
const {Comparison}=await import(componentUrl(path.resolve('app/page.tsx')));
const render=(a,b)=>renderToStaticMarkup(React.createElement(Comparison,{first:a,second:b,matchingPlan:null}));
const documents=()=>[pipeline(deterministicCars(true)),pipeline(deterministicCars().toReversed(),'offer',true)];
const important=html=>html.split('<section aria-labelledby="important-differences-heading"')[1].split('Vis detaljert sammenligning')[0];
test('actual Comparison component gives both sides canonical name and complete portfolio totals',()=>{
  const html=render(...documents()).replaceAll('\u00a0',' ');
  const overview=html.split('Vis pris per forsikring')[0];
  for(const value of ['21 975 kr','5 599 kr','27 574 kr'])assert.equal(overview.split(value).length-1,2,value);
  assert.equal(overview.split('>Gjensidige<').length-1,2);assert.ok(!overview.includes('Gjensidige Forsikring ASA'));assert.ok(!overview.includes('Total årspris'));
});
test('identical annual object prices live only in object-price disclosure, not Important Differences',()=>{
  const html=render(...documents());assert.ok(html.includes('Vis pris per forsikring'));
  assert.ok(html.includes('ZZ10001 – pris per år'));assert.ok(html.includes('ZZ10002 – pris per år'));
  assert.ok(!important(html).includes('– prisgrunnlag'));assert.ok(!important(html).includes('– pris per år'));
  assert.ok(important(html).includes('Ingen sikre forskjeller funnet'));
  assert.ok(!html.includes('Kan ikke sammenlignes direkte'));
});
test('real comparable object price difference remains highlighted',()=>{
  const [a,b]=documents();for(const t of b.insuranceData.insurances[0].importantTerms)if(t.key==='premie.total')t.value='11 000 kr';
  assert.ok(important(render(a,b)).includes('– prisgrunnlag'));
});
test('incompatible equal numeric price bases keep warning in per-object prices',()=>{
  const a=car(),b=car();a.importantTerms=[term('Forsikringspris','10 000 kr','premie.ekskl_tfa')];b.importantTerms=[term('Totalpris','10 000 kr','premie.total')];
  const html=render(pipeline([a]),pipeline([b],'offer'));
  assert.ok(html.includes('Vis pris per forsikring'));assert.ok(html.includes('Kan ikke sammenlignes direkte'));
  assert.ok(!important(html).includes('– prisgrunnlag'));
});
test('multi-object unparseable prices show explicit portfolio missing states instead of legacy fallback',()=>{
  const a=deterministicCars(true);for(const r of a)for(const t of r.importantTerms)if(t.canonicalKey?.startsWith('premie.'))t.value='100 kr per måned';
  const html=render(pipeline(a),pipeline(a,'offer')).split('Vis pris per forsikring')[0];
  assert.ok(!html.includes('Total årspris'));assert.ok(html.includes('Ikke dokumentert'));assert.ok(html.includes('Forsikringspris'));
});
test('Detailed Comparison shows document and catalog provenance on their own facts',()=>{
  const a=car(),b=car();a.importantTerms.push(term('Kaskoskade','Egen dokumentert beskrivelse'));
  const html=render(pipeline([a]),pipeline([b],'offer'));
  const row=html.match(/<tr[^>]*>[^]*?<\/tr>/gu)?.find(row=>row.includes('>Kaskoskade<'));
  assert.ok(row);assert.ok(row.includes('kundedokument'));assert.ok(row.includes('offentlig vilkår'));assert.ok(!row.includes('— Ikke dokumentert'));
  assert.ok(html.includes('Vis detaljert sammenligning'));assert.ok(!html.includes('Vilkår ikke funnet'));
});
test('legitimate customer-specific unknown and explicit not-selected remain visibly different',()=>{
  const a=car(),b=car();b.importantTerms=[];
  const html=render(pipeline([a]),pipeline([b],'offer'));
  assert.ok(html.includes('❌ Ikke valgt'));assert.ok(html.includes('— Ikke dokumentert'));
  assert.ok(html.includes('Vis kilde'));assert.ok(html.includes('sm:grid-cols-2'));
});
