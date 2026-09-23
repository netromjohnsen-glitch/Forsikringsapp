import test from 'node:test';
import assert from 'node:assert/strict';
import {parseExtractionResponse,sanitizeAnalysisDocumentForClient} from '../lib/analysis-output.ts';
import {planExtractionBatches} from '../lib/analysis-batching.ts';
import {enrichBatch,mergeBatchResults} from '../lib/analysis-merge.ts';
import {createAnalysisTelemetry} from '../lib/analysis-telemetry.ts';
import {createDifferences,groupInsurances,groupTerms} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
const fact=(name,canonicalKey,value)=>({name,canonicalKey,value});
const raw=(terms,extras={})=>({type:'Bil',productName:'Kasko',canonicalProductName:'Kasko',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms,...extras});
function pipeline(insurance,side='existing',company='Gjensidige') {
 const parsed=parseExtractionResponse({output_text:JSON.stringify({company,totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[insurance]})});
 const batch=planExtractionBatches([{side,documentIndex:0,text:'Synthetic insurance document',pages:1}])[0];
 const agreement=enrichBatch(parsed,batch,createAnalysisTelemetry('00000000-0000-0000-0000-000000000000'));
 return sanitizeAnalysisDocumentForClient(mergeBatchResults([{batch,agreement}],side,false));
}
const policy=d=>d.insuranceData.insurances[0];
const compare=(left,right)=>{const groups=groupInsurances(left.insuranceData.insurances,right.insuranceData.insurances,null);return {terms:groupTerms(groups[0],null),differences:presentImportantDifferences(createDifferences(left,right,groups,null),groups,null)};};

const limits=(age,km)=>[
 ...(age?[fact('Totalskadegaranti alder','nyverdi.alder',age)]:[]),
 ...(km?[fact('Totalskadegaranti kilometergrense','nyverdi.km',km)]:[]),
];
const otherKm=[
 fact('Årlig kjørelengde','kjoretoy.kjorelengde','20 000 km'),
 fact('Kilometerstand','kjoretoy.kilometerstand','164 000 km'),
 fact('Avtalt maksimal kilometerstand','kjoretoy.avtalt_maks_kilometerstand','183 800 km'),
 fact('Maskinskade kilometergrense','maskinskade.km','200 000 km'),
];
function shown(age,km,extras=[],company='Ukjent') {
 const left=pipeline(raw([...limits(age,km),...extras]),'existing',company);
 const right=pipeline(raw(limits('4 år','80 000 km')),'offer','Ukjent');
 return {left,right,...compare(left,right)};
}
const family=result=>result.differences.find(d=>d.conceptId==='bil.totalskade');
for(const [age,km,expected] of [
 ['1 år','15 000 km','1 år / 15 000 km'],
 ['3 år','60 000 km','3 år / 60 000 km'],
 ['2 år','40 000 km','2 år / 40 000 km'],
 ['2 år',null,'2 år'],[null,'40 000 km','40 000 km'],
]) test(`effective totalskade presentation: ${expected}`,()=>{
 assert.equal(family(shown(age,km,otherKm)).limitPair.first,expected);
});
for(const extra of otherKm)test(`does not substitute ${extra.canonicalKey}`,()=>{
 const result=shown('3 år','60 000 km',[extra]);
 assert.equal(family(result).limitPair.first,'3 år / 60 000 km');
 assert.equal(family(shown('3 år',null,[extra])).limitPair.first,'3 år');
});
test('long pilot-like age survives every stage and composes with canonical distance',()=>{
 const age='For Kasko gjelder totalskadegarantien inntil kjøretøyet er 1 år fra første registreringsdato';
 assert.ok(age.length>90);
 const result=shown(age,'15 000 km',otherKm,'Gjensidige');
 const effective=policy(result.left).importantTerms;
 assert.equal(effective.find(t=>t.key==='nyverdi.km').value,'15 000 km');
 assert.ok(effective.find(t=>t.key==='nyverdi.km').sources.some(s=>s.documentId==='pdf:existing:0'));
 assert.equal(result.terms.find(t=>t.key==='nyverdi.km').first,'15 000 km');
 assert.ok(family(result).items.some(i=>i.termKey==='nyverdi.km'));
 assert.equal(family(result).limitPair.first,`${age} / 15 000 km`);
});
test('document limits override conflicting catalog values with provenance retained',()=>{
 const result=shown('2 år','40 000 km',[],'Gjensidige');
 const term=policy(result.left).importantTerms.find(t=>t.key==='nyverdi.km');
 assert.equal(term.coverageOrigin,'document');
 assert.ok(term.sources.some(s=>s.documentId==='pdf:existing:0'));
 assert.ok(!policy(result.left).importantTerms.some(t=>t.key==='nyverdi.km'&&t.value==='Inntil 20 000 km'));
 assert.equal(family(result).limitPair.first,'2 år / 40 000 km');
});
test('equal kilometre limit remains in summary although comparison omits it as a difference',()=>{
 const result=shown('2 år','80 000 km');
 assert.ok(!family(result).items.some(i=>i.termKey==='nyverdi.km'));
 assert.equal(family(result).limitPair.first,'2 år / 80 000 km');
});
test('line breaks and long wording do not suppress canonical kilometre limits',()=>{
 const age='Til første hovedforfall etter 2 år\nRegnet fra første registrering';
 assert.equal(family(shown(age,'40 000 km')).limitPair.first,`${age} / 40 000 km`);
});

// Render the actual page card declarations, without mounting the upload app.
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const source=fs.readFileSync('app/page.tsx','utf8');
const ast=ts.createSourceFile('page.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const names=new Set(['heroFactOrder','differenceIdentity','orderedFamilyItems','splitDifferenceValues','compactPair','collapsedHero','humanDetailLabel','sentenceCase','ConceptFamilyCard','PresentationTypeLabel','PresentationSources','DifferenceValues']);
const declarations=ast.statements.filter(node=>names.has(node.name?.text)||node.declarationList?.declarations.some(d=>names.has(d.name.text))).map(node=>node.getText(ast)).join('\n');
const require=createRequire(import.meta.url);
let js=ts.transpileModule(declarations+'\nexport {ConceptFamilyCard};',{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext}}).outputText;
js=js.replace('"react/jsx-runtime"',JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
const {ConceptFamilyCard}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('actual collapsed card renders full long age and km without line clamping',()=>{
 const age='For Kasko gjelder totalskadegarantien inntil kjøretøyet er 1 år fra første registreringsdato';
 const difference=family(shown(age,'15 000 km',otherKm,'Gjensidige'));
 const html=renderToStaticMarkup(React.createElement(ConceptFamilyCard,{difference}));
 const summary=html.split('</summary>')[0];
 assert.ok(summary.includes(`${age} / 15 000 km`));
 assert.ok(summary.includes('4 år / 80 000 km'));
 assert.ok(!summary.includes('line-clamp'));
 assert.ok(summary.includes('sm:grid-cols-2'));
});
