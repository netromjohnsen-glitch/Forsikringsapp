import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {coverageDetailPresentation,hasMeaningfulAdditionalDetails} from '../lib/coverage-detail-presentation.ts';
import {portfolioPrice,portfolioPriceDifference} from '../lib/portfolio-price-presentation.ts';
import {groupInsurances,groupTerms,createDifferences} from '../lib/comparison.ts';
import {presentImportantDifferences,sortDetailedTerms} from '../lib/comparison-presentation.ts';
import {consolidateInsuranceRecords} from '../lib/insurance-object-consolidation.ts';
const source={documentId:'pdf:existing:0',filename:'Syntetisk dokument',termsNumber:'',effectiveFrom:'',page:1,section:'Avtale'};
const fact=(key,value,origin='document')=>({key,canonicalKey:key,name:key,value,coverageOrigin:origin,sources:[source]});
const insurance=(id='ZZ10001',terms=[],type='Bil')=>({type,company:'Ukjent',productName:'Kasko',canonicalProductName:'Kasko',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms,objectIdentifiers:id?[{type:'registration',value:id}]:[],documentRole:'unknown',agreementPeriod:null,documentReferences:[{side:'existing',documentIndex:0}],documentSources:[source],analysisObjectId:id??'unknown'});
const doc=(objects,total=null)=>({source:'pdf',insuranceData:{company:null,totalAnnualPremium:total,insurances:objects}});
const car=(id='ZZ10001',a=12457,t=2329,total=14786)=>insurance(id,[fact('premie.ekskl_tfa',`${a} kr`),fact('premie.tfa',`${t} kr`),fact('premie.total',`${total} kr`)]);
const cars=()=>[car(),car('ZZ10002',9518,3270,12788)];
const component=(p,key='premie.total')=>p.components.find(c=>c.key===key);
const model=(left,right=left)=>{const groups=groupInsurances(left,right,null);return groups.map(group=>({group,terms:groupTerms(group,null)}));};
const details=(left,right=left)=>coverageDetailPresentation(sortDetailedTerms(model([insurance(undefined,left)],[insurance(undefined,right)])[0].terms));
const priceDifference=(left,right,failed=0)=>portfolioPriceDifference(portfolioPrice(doc(left)),portfolioPrice(doc(right),failed),groupInsurances(left,right,null));
const consolidate=objects=>consolidateInsuranceRecords(objects).map(item=>item.record);

test('two pilot-shaped cars sum independent price identities',()=>{
 const result=portfolioPrice(doc(cars()));
 assert.deepEqual(result.components.map(c=>c.amount),[2197500,559900,2757400]);
 assert.ok(result.components.every(c=>c.completeness==='complete'&&c.expected===2&&c.priced===2&&c.origin==='calculated_portfolio'));
 assert.equal(result.documented.value,null);
 assert.ok(result.components.every(c=>c.contributions.every(item=>item.sources[0]===source)));
});
test('identical prices are not a zero-kr saving',()=>assert.equal(priceDifference(cars(),cars().reverse()),null));
test('exact matched sets permit aggregate comparison',()=>assert.match(priceDifference(cars(),[car('ZZ10002',9518,3270,12788),car('ZZ10001',12000,2329,14329)]),/457 kr billigere/));
test('unique type pair uses existing matching policy',()=>assert.match(priceDifference([car(null)],[car(null,10000,2329,12329)]),/2.457 kr billigere/));
for(const side of ['existing','offer'])test(`missing object on ${side} prevents saving conclusion`,()=>assert.equal(priceDifference(side==='existing'?cars().slice(0,1):cars(),side==='offer'?cars().slice(0,1):cars()),null));
test('ambiguous identities do not produce aggregate comparison',()=>assert.equal(priceDifference(cars().map(c=>({...c,objectIdentifiers:[]})),cars().map(c=>({...c,objectIdentifiers:[]}))),null));
test('partial failure blocks complete totals and savings',()=>{
 const result=portfolioPrice(doc(cars()),1);assert.equal(component(result).completeness,'partial');assert.equal(priceDifference(cars(),cars(),1),null);
});
for(const [priced,total,expected] of [[2,2,'complete'],[2,3,'partial'],[0,3,'unavailable']])test(`${priced}/${total} priced logical objects is ${expected}`,()=>{
 const objects=Array.from({length:total},(_,i)=>i<priced?car(`ZZ1000${i+1}`):insurance(`ZZ1000${i+1}`));
 const result=component(portfolioPrice(doc(objects)));assert.equal(result.completeness,expected);assert.equal(result.expected,total);assert.equal(result.priced,priced);
});
for(const value of ['100 kr per måned','100 kr / mnd','100–200 kr','100 kr og 200 kr','100 000 km','20 %'])test(`reject incompatible annual basis: ${value}`,()=>{
 const result=component(portfolioPrice(doc([insurance(undefined,[fact('premie.total',value)])])));assert.equal(result.amount,null);assert.notEqual(result.completeness,'complete');
});
test('catalog example is not a customer price',()=>assert.equal(component(portfolioPrice(doc([insurance(undefined,[fact('premie.total','5000 kr','catalog')])]))).amount,null));
test('customer price outranks excluded catalog example without double counting',()=>assert.equal(component(portfolioPrice(doc([insurance(undefined,[fact('premie.total','5000 kr'),fact('premie.total','9000 kr','catalog')])]))).amount,500000));
test('sums/deductibles/km are never prices',()=>assert.equal(component(portfolioPrice(doc([insurance(undefined,[fact('rettshjelp.sum','100000 kr'),fact('egenandel','4000 kr'),fact('nyverdi.km','60000 km')])]))).amount,null));
test('scalar annual premium is not an inferred canonical vehicle total',()=>assert.equal(component(portfolioPrice(doc([{...insurance(),annualPremium:'5000 kr'}]))).amount,null));
test('conflicting prices have no arbitrary winner',()=>{
 const result=component(portfolioPrice(doc([insurance(undefined,[fact('premie.total','5000 kr'),fact('premie.total','5500 kr')])])));assert.equal(result.completeness,'conflicting');assert.equal(result.amount,null);
});
test('unresolved consolidation cannot yield a safe total',()=>assert.equal(component(portfolioPrice(doc([{...car(),consolidation:{status:'unresolved',recordCount:2,issues:['product_conflict']}}]))).completeness,'conflicting'));
test('unresolved price conflict metadata is respected',()=>assert.equal(component(portfolioPrice(doc([{...car(),consolidation:{status:'consolidated',recordCount:2,issues:[],factConflicts:[{key:'premie.total',values:['14786','15000']}]}}]))).completeness,'conflicting'));
for(const [documented,conflict] of [['27574 kr',false],['30000 kr',true]])test(`documented total ${documented} is preserved and reconciled`,()=>{
 const result=portfolioPrice(doc(cars(),documented));assert.equal(result.documented.value,documented);assert.equal(result.documented.origin,'documented_agreement');assert.equal(result.conflict,conflict);assert.equal(component(result).amount,2757400);
 if(conflict)assert.equal(portfolioPriceDifference(result,result,groupInsurances(cars(),cars(),null)),null);
});
test('documented-only agreement price remains available',()=>{const result=portfolioPrice(doc([insurance()], '5000 kr'));assert.equal(result.documented.value,'5000 kr');assert.equal(component(result).completeness,'unavailable');});
test('manual agreement total is not mislabeled PDF evidence',()=>assert.equal(portfolioPrice({...doc(cars(),'27574 kr'),source:'manual'}).documented.origin,'manual_agreement'));
test('reversed order preserves sums and comparison',()=>assert.deepEqual(portfolioPrice(doc(cars())).components.map(c=>c.amount),portfolioPrice(doc(cars().reverse())).components.map(c=>c.amount)));
test('TFA alone does not imply total or insurance price',()=>{const p=portfolioPrice(doc([insurance(undefined,[fact('premie.tfa','1000 kr')])]));assert.deepEqual(p.components.map(c=>c.amount),[null,100000,null]);});
for(const type of ['Tilhenger','Campingvogn','Snøscooter'])test(`${type} does not require invented zero TFA`,()=>{const p=portfolioPrice(doc([insurance(undefined,[fact('premie.total','1000 kr')],type)]));assert.equal(component(p,'premie.tfa').expected,0);assert.equal(component(p,'premie.tfa').amount,null);assert.equal(component(p).completeness,'complete');});
test('mixed nonvehicle portfolio retains documented total without TFA reinterpretation',()=>{const p=portfolioPrice(doc([car(),insurance(null,[fact('premie.total','1000 kr')],'Hus')],'15786 kr'));assert.equal(p.compatible,false);assert.equal(p.documented.value,'15786 kr');assert.ok(p.components.every(c=>c.amount===null));});
test('same object spread over three documents counts once after existing consolidation',()=>{
 const records=car().importantTerms.map((t,i)=>({...insurance(undefined,[t]),documentReferences:[{side:'existing',documentIndex:i}]}));
 const p=portfolioPrice(doc(consolidate(records)));assert.equal(p.objectCount,1);assert.deepEqual(p.components.map(c=>c.amount),[1245700,232900,1478600]);
});
test('duplicate raw records do not duplicate total or TFA',()=>{const p=portfolioPrice(doc(consolidate([...cars(),...cars()])));assert.equal(p.objectCount,2);assert.deepEqual(p.components.map(c=>c.amount),[2197500,559900,2757400]);});
test('price conflict across documents remains conflicting',()=>assert.equal(component(portfolioPrice(doc(consolidate([car(),car(undefined,12457,2329,15100)])))).completeness,'conflicting'));
test('existing document priority is consumed rather than recalculated',()=>{
 const p=portfolioPrice(doc(consolidate([{...car(),documentRole:'individual_agreement'},{...car(undefined,12457,2329,15100),documentRole:'general_terms'}])));assert.equal(component(p).amount,1478600);assert.equal(component(p).completeness,'complete');
});
const fleet=()=>['Bil','Bil','Bil','Tilhenger','Tilhenger','Snøscooter','Campingvogn'].map((type,i)=>({...car(`ZZ1000${i+1}`,1000+i,100+i,1100+2*i),type}));
test('seven logical objects preserve complete prices after duplicate consolidation',()=>{const p=portfolioPrice(doc(consolidate([...fleet(),...fleet()])));assert.equal(p.objectCount,7);assert.equal(component(p).expected,7);assert.equal(component(p).amount,774200);assert.equal(component(p).completeness,'complete');});
test('seven-object missing warning survives and suppresses saving',()=>{const left=consolidate(fleet()),right=consolidate(fleet().slice(1).reverse());const groups=groupInsurances(left,right,null);assert.ok(createDifferences(doc(left),doc(right),groups,null).some(d=>d.kind==='object'));assert.equal(priceDifference(left,right),null);});

test('status only has no extra details',()=>{const d=details([fact('rettshjelp.dekning','Valgt')]);assert.equal(d.hasAdditional,false);assert.ok(d.compact.some(r=>r.first==='✓ Valgt'));});
test('status plus sum deduplicates canonical compact identities',()=>{const d=details([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100 000 kr')]);assert.equal(d.hasAdditional,false);assert.ok(d.compact.some(r=>r.key==='rettshjelp.sum'));});
test('rendered formatting does not determine detail availability',()=>{const d=details([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100 000 kr')],[fact('rettshjelp.dekning','Ja'),fact('rettshjelp.sum','100000 kroner')]);assert.equal(d.hasAdditional,false);});
test('different one-sided pilot details are shown with full values',()=>{
 const d=details([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100000 kr'),fact('rettshjelp.geografi','Norden')],[fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100000 kr'),fact('rettshjelp.egenandel','4 000 kr + 20 % av overskytende beløp')]);
 assert.equal(d.hasAdditional,true);assert.ok(d.additional.some(r=>r.first==='Norden'));assert.ok(d.additional.some(r=>r.second==='4 000 kr + 20 % av overskytende beløp'));
});
test('identical extra facts still warrant details',()=>assert.equal(details([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.geografi','Norden')]).hasAdditional,true));
test('provenance alone does not create a details panel',()=>{const d=details([fact('rettshjelp.dekning','Valgt')]);assert.equal(d.hasAdditional,false);assert.ok(d.sources.length);});
test('freeform effective summary is preserved without invented subfacts',()=>{const value='Forsikringssum 100 000 kr. Gjelder tvist som eier, bruker eller fører i Norden.';const d=details([fact('rettshjelp.dekning',value)]);assert.ok(d.additional.some(r=>r.first===value));assert.ok(!d.compact.some(r=>r.key==='rettshjelp.sum'));});
test('generated parent summary and repeated details do not replay same facts',()=>{
 const d=details([fact('maskinskade.dekning','Valgt'),fact('maskinskade.alder','10 år'),fact('maskinskade.km','200 000 km'),fact('maskinskade.km','200 000 km'),fact('maskinskade.egenandel','8 000 kr')]);
 assert.equal(d.compact.filter(r=>r.key==='maskinskade.km').length,1);assert.equal(d.additional.filter(r=>r.key==='maskinskade.km').length,0);assert.ok(!d.additional.some(r=>r.key.endsWith(':description')));
});
for(const status of ['Ikke valgt','Ikke dokumentert'])test(`coverage status ${status} remains unchanged`,()=>{const d=details([fact('maskinskade.dekning',status)]);assert.ok(d.compact.some(r=>r.first.includes(status)));});
test('helper compares canonical identity rather than text',()=>{assert.equal(hasMeaningfulAdditionalDetails({compact:[{key:'a',first:'100 000'}],additional:[{key:'a',first:'100000 kr'}]}),false);assert.equal(hasMeaningfulAdditionalDetails({compact:[{key:'a',first:'100'}],additional:[{key:'b',first:'100'}]}),true);});
test('object-local concept details cannot leak to another car',()=>{
 const a=insurance('ZZ10001',[fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.geografi','Norden'),fact('premie.tfa','2000 kr'),fact('kjoretoy.kilometerstand','164 000 km')]);
 const b=insurance('ZZ10002',[fact('rettshjelp.dekning','Valgt')]);
 const right=[insurance('ZZ10002',[fact('rettshjelp.dekning','Ikke valgt')]),insurance('ZZ10001',[fact('rettshjelp.dekning','Ikke valgt')])];
 const groups=groupInsurances([a,b],right,null);const result=presentImportantDifferences(createDifferences(doc([a,b]),doc(right),groups,null),groups,null).filter(d=>d.conceptId==='bil.ansvar-rettshjelp');
 assert.equal(result.length,2);assert.deepEqual(result.map(d=>d.details.hasAdditional),[true,false]);assert.ok(result.every(d=>!JSON.stringify(d.details).includes('164 000')));
});
for(const [type,key] of [['Bil','rettshjelp'],['Innbo','rettshjelp'],['Hus','hus.rettshjelp'],['Reise','reise.rettshjelp']])test(`${type} detail structure is generic`,()=>{
 const [g]=model([insurance(null,[fact(`${key}.dekning`,'Valgt'),fact(`${key}.sum`,'100 000 kr'),fact(`${key}.egenandel`,'4000 kr')],type)]);
 const d=coverageDetailPresentation(sortDetailedTerms(g.terms));assert.ok(d.additional.some(r=>r.key===`${key}.egenandel`));assert.equal(d.hasAdditional,true);
});

// Render actual production components. Only imports are supplied to this
// isolated harness; assertions exercise the same JSX shipped to the pilot.
const require=createRequire(import.meta.url);
async function renderModule(path,names,imports='') {
 const source=fs.readFileSync(path,'utf8'),ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const body=ast.statements.filter(n=>names.has(n.name?.text)||n.declarationList?.declarations.some(d=>names.has(d.name.text))).map(n=>n.getText(ast)).join('\n');
 let js=ts.transpileModule(imports+'\n'+body+'\nexport { '+[...names].filter(n=>['ConceptFamilyCard','PortfolioPriceList'].includes(n)).join(',')+' };',{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext}}).outputText;
 js=js.replace('"react/jsx-runtime"',JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
 return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
}
const {ConceptFamilyCard}=await renderModule('app/page.tsx',new Set(['heroFactOrder','differenceIdentity','orderedFamilyItems','splitDifferenceValues','compactPair','collapsedHero','humanDetailLabel','sentenceCase','ConceptFamilyCard','PresentationTypeLabel','PresentationSources','DifferenceValues','SourceDetails']));
const {PortfolioPriceList}=await renderModule('app/components/portfolio-price.tsx',new Set(['PortfolioPriceList']),`import {formatPortfolioPrice} from '${pathToFileURL(process.cwd()+'/lib/portfolio-price-presentation.ts')}';`);
const renderDetails=terms=>renderToStaticMarkup(React.createElement(ConceptFamilyCard,{difference:{title:'Rettshjelp',kind:'term',text:'',details:details(terms)}}));
test('actual UI hides empty expander and retains source controls',()=>{const html=renderDetails([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100000 kr')]);assert.ok(!html.includes('Se detaljer'));assert.ok(html.includes('Vis kilde'));assert.ok(html.includes('✓ Valgt'));});
test('actual expander uses native disclosure semantics and has additional content',()=>{const html=renderDetails([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.sum','100000 kr'),fact('rettshjelp.egenandel','4 000 kr + 20 %')]);assert.ok(html.includes('Se detaljer'));assert.match(html,/<details class="group"><summary/);const expanded=html.split('</summary>')[1].split('</details>')[0];assert.ok(expanded.includes('4 000 kr'));assert.ok(!expanded.includes('100000 kr'));assert.ok(html.includes('sm:grid-cols-2'));});
test('sources remain outside expandable details content',()=>{const html=renderDetails([fact('rettshjelp.dekning','Valgt'),fact('rettshjelp.geografi','Norden')]);assert.ok(html.indexOf('Vis kilde')>html.indexOf('</details>'));});
test('single fallback item is fully visible without meaningless expander',()=>{const html=renderToStaticMarkup(React.createElement(ConceptFamilyCard,{difference:{title:'Tjeneste',kind:'term',text:'Eksisterende: full tekst. Nytt tilbud: annen full tekst.'}}));assert.ok(!html.includes('Se detaljer'));assert.ok(html.includes('full tekst'));});
test('actual portfolio UI shows calculated totals and partial wording',()=>{
 const html=renderToStaticMarkup(React.createElement(PortfolioPriceList,{price:portfolioPrice(doc(cars()))}));assert.match(html,/27.574 kr/);assert.match(html,/21.975 kr/);assert.match(html,/5.599 kr/);assert.ok(html.includes('Beregnet årspris'));assert.ok(!html.includes('Vis kilde'));
 const partial=renderToStaticMarkup(React.createElement(PortfolioPriceList,{price:portfolioPrice(doc([...cars(),insurance('ZZ10003')]))}));assert.ok(partial.includes('2 av 3 objekter priset'));assert.ok(partial.includes('Delsum'));
});
test('actual portfolio UI exposes mismatch without replacing documented value',()=>{const html=renderToStaticMarkup(React.createElement(PortfolioPriceList,{price:portfolioPrice(doc(cars(),'30000 kr'))}));assert.ok(html.includes('30000 kr'));assert.ok(html.includes('stemmer ikke overens'));assert.match(html,/27.574 kr/);});
test('details consume resolved document priority including preserved base sources',()=>{
 const records=[{...insurance(undefined,[fact('maskinskade.alder','10 år'),fact('maskinskade.egenandel','4000 kr')]),documentRole:'individual_agreement'},
 {...insurance(undefined,[fact('maskinskade.alder','8 år'),fact('maskinskade.egenandel','9000 kr')]),documentRole:'general_terms'}];
 const logical=consolidate(records),g=groupInsurances(logical,[insurance(undefined,[fact('maskinskade.alder','12 år')])],null)[0];
 const terms=groupTerms(g,null),d=coverageDetailPresentation(sortDetailedTerms(terms));
 assert.ok(d.compact.some(r=>r.key==='maskinskade.alder'&&r.first==='10 år'));
 assert.ok(d.additional.some(r=>r.key==='maskinskade.egenandel'&&r.first==='4000 kr'));
 assert.ok(!d.additional.some(r=>r.first==='9000 kr'));
 assert.ok(terms.find(t=>t.key==='maskinskade.egenandel').firstBaseFacts.some(b=>b.value==='9000 kr'));
});
test('details are pure presentation and never mutate effective terms',()=>{const terms=model([insurance(undefined,[fact('maskinskade.dekning','Valgt'),fact('maskinskade.km','200 000 km'),fact('maskinskade.egenandel','4000 kr')])])[0].terms;const before=JSON.stringify(terms);coverageDetailPresentation(terms);coverageDetailPresentation(terms);assert.equal(JSON.stringify(terms),before);});
test('totalskade 20 000 km is preserved, not corrected by detail projection',()=>{const d=details([fact('nyverdi.alder','3 år'),fact('nyverdi.km','20 000 km')]);assert.ok(d.compact.some(r=>r.key==='nyverdi.km'&&r.first==='20 000 km'));});
test('price metadata/provenance remain unchanged by aggregation',()=>{const d=doc(cars()),before=JSON.stringify(d);portfolioPrice(d);assert.equal(JSON.stringify(d),before);});
