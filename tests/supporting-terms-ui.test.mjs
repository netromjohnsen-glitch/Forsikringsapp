import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { documentPipeline, portfolioDocuments } from './helpers/supporting-terms.mjs';
import { applyProgress, emptyProgress } from '../lib/analysis-progress.ts';

const require=createRequire(import.meta.url),root=path.resolve('.'),urls=new Map();
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
const {AnalysisProgress}=await import(componentUrl(path.resolve('app/components/analysis-progress.tsx')));
function progress() {
  let state=applyProgress(emptyProgress(),{type:'analysis_started',existingDocumentCount:2,offerDocumentCount:2});
  for(const side of ['existing','offer']){
    for(const documentIndex of [0,1])for(const status of ['validating','extracting','ready','analyzing','completed'])state=applyProgress(state,{type:'document_status',side,documentIndex,status});
    state=applyProgress(state,{type:'products_resolved',side,insuranceTypes:['bil','bil']});
  }
  return applyProgress(state,{type:'analysis_completed',partialSuccess:false,successfulDocuments:4,failedDocuments:0});
}
export function supportingTermsMarkup() {
  const docs=['existing','offer'].map(side=>documentPipeline(portfolioDocuments(side),side));
  return renderToStaticMarkup(React.createElement(React.Fragment,null,
    React.createElement(AnalysisProgress,{state:progress()}),
    React.createElement(Comparison,{first:docs[0],second:docs[1],matchingPlan:null})));
}
test('supporting terms UI: actual progress shows four documents and four customer products',()=>{
  const html=renderToStaticMarkup(React.createElement(AnalysisProgress,{state:progress()}));
  assert.match(html,/4 av 4 dokumenter analysert · 4 forsikringsprodukter/);
  assert.equal(html.split('Bil: Ferdig').length-1,4);
});
test('supporting terms UI: exact pairs and complete prices have no pseudo-object warnings',()=>{
  const html=supportingTermsMarkup().replaceAll('\u00a0',' ');
  assert.doesNotMatch(html,/objekter uten sammenligningspar|Delsum|Motstridende dokumentopplysninger/);
  for(const price of ['15 904 kr','3 406 kr','19 848 kr'])assert.ok(html.includes(price));
  assert.equal(html.split('Eksakt objektmatch').length-1,2);
});
test('supporting terms UI: terms remain reachable with product role and original source reference',()=>{
  const html=supportingTermsMarkup();
  assert.match(html,/Vis dokumentgrunnlag/);assert.match(html,/Dokumentrolle: Generelle vilkår/);
  assert.match(html,/Vis kilde.*produktvilkår/);assert.match(html,/Syntetisk produktbegrensning/);
  assert.match(html,/kundedokument/);assert.match(html,/offentlig vilkår/);
});
