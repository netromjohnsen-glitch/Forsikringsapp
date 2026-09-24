import test from 'node:test';
import assert from 'node:assert/strict';
import {car,term,parsed,batches,pipeline,facts} from './helpers/pilot-quality.mjs';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {groupInsurances,groupTerms,createDifferences} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
import {portfolioPrice,portfolioPriceDifference} from '../lib/portfolio-price-presentation.ts';
import {vehiclePrices} from '../lib/vehicle-price-presentation.ts';
import {productCatalog} from '../lib/product-catalog.ts';
import {coverageDetailPresentation} from '../lib/coverage-detail-presentation.ts';
const doc=objects=>({source:'pdf',insuranceData:{totalAnnualPremium:null,insurances:objects}});
const total=r=>portfolioPrice(r).components.find(c=>c.key==='premie.total');
for(const swap of [false,true])for(const reverse of [false,true])for(const completion of [false,true])test(`quality 2+2 whole pipeline sideSwap=${swap} pdfReverse=${reverse} completionReverse=${completion}`,()=>{
 const records=[car(),car('Pluss')],other=[car('Kasko','første registreringsdato',true),car('Pluss','første registreringsdato',true)];
 const a=pipeline(swap?other:records,'existing',completion),b=pipeline((swap?records:other).slice()[reverse?'reverse':'slice'](),'offer',!completion);
 for(const d of [a,b]){assert.equal(d.insuranceData.insurances.length,2);assert.deepEqual(portfolioPrice(d).components.map(c=>c.amount),[2197500,559900,2757400]);assert.ok(portfolioPrice(d).components.every(c=>c.completeness==='complete'));}
 const groups=groupInsurances(a.insuranceData.insurances,b.insuranceData.insurances,null);assert.equal(groups.length,2);assert.equal(portfolioPriceDifference(portfolioPrice(a),portfolioPrice(b),groups),null);
 for(const g of groups){assert.equal(g.first[0].objectIdentifiers[0].value,g.second[0].objectIdentifiers[0].value);const expected=g.first[0].productName==='Kasko'?['1 år','15 000 km']:['3 år','60 000 km'];const terms=groupTerms(g,null);for(const [i,key] of ['nyverdi.alder','nyverdi.km'].entries()){const t=terms.find(t=>t.key===key);assert.equal(t.first,expected[i]);assert.equal(t.second,expected[i]);assert.ok(t.firstSources.every(s=>s.documentId.startsWith('pdf:')));}
 for(const r of [...g.first,...g.second]){assert.equal(facts(r,'nyverdi.km')[0].coverageOrigin,'document');assert.equal(facts(r,'kjoretoy.kjorelengde')[0].value,'20 000 km per forsikringsår');assert.deepEqual(normalizeDocumentFacts({...r,importantTerms:normalizeDocumentFacts(r)}),normalizeDocumentFacts(r));}
 const detail=coverageDetailPresentation(terms);assert.ok(detail.compact.some(r=>r.label==='Bilnøkkel'&&r.firstDescription==='Tapt, stjålet eller skadet bilnøkkel'));for(const key of ['bilnokkel.grense','bilnokkel.egenandel','bilnokkel.antall_skader'])assert.ok(detail.additional.some(t=>t.key===key));
 }
 // No fabricated difference for identical effective limits. Create a real level
 // difference on an exact object only to verify the compact pair renderer input.
 const changed=structuredClone(b);const target=changed.insuranceData.insurances.find(r=>r.productName==='Kasko');for(const t of target.importantTerms)if(t.key==='nyverdi.km')t.value='16 000 km';const g2=groupInsurances(a.insuranceData.insurances,changed.insuranceData.insurances,null);const presented=presentImportantDifferences(createDifferences(a,changed,g2,null),g2,null);assert.ok(presented.some(p=>p.limitPair?.first==='1 år / 15 000 km'&&p.limitPair?.second==='1 år / 16 000 km'));
});
for(const value of ['15 000 km','12 345 km'])for(const anchor of ['førstegangsregistrering','første registreringsdato'])test(`registration anchor preserves limit at every stage ${anchor} ${value}`,()=>{
 const raw=car('Kasko',anchor);raw.importantTerms[0].value=raw.importantTerms[0].value.replace('15 000 km',value);
 const extracted=parsed([raw]).insurances[0];assert.ok(extracted.importantTerms[0].value.includes(value));
 const normalized={...extracted,importantTerms:normalizeDocumentFacts(extracted)};
 const enriched=enrichExtractedAgreementWithCatalog(parsed([raw])).insurances[0];const batch=batches([raw],'existing')[0].agreement.insurances[0];const client=pipeline([raw]).insuranceData.insurances[0];
 for(const r of [normalized,enriched,batch,client]){assert.deepEqual(facts(r,'nyverdi.km').map(t=>t.value),[value]);assert.equal(facts(r,'nyverdi.km')[0].coverageOrigin,'document');}
});
for(const company of ['Gjensidige','Tryg'])for(const [x,y] of [['12 000','18 000'],['12 345','98 765']])test(`generic document ${x} / synthetic catalog ${y} precedence ${company}`,()=>{
 const raw=car();raw.company=company;raw.importantTerms[0].value=`Inntil 1 år fra førstegangsregistrering og inntil ${x} km.`;
 const saved=productCatalog.facts;try{productCatalog.facts=Object.fromEntries(Object.entries(saved).map(([key,list])=>[key,list.map(f=>f.key==='nyverdi.km'?{...f,value:`${y} km`}:f)]));const r=enrichExtractedAgreementWithCatalog(parsed([raw])).insurances[0];assert.equal(facts(r,'nyverdi.km')[0].value,`${x} km`);assert.equal(facts(r,'nyverdi.km')[0].coverageOrigin,'document');assert.ok(r.catalogFacts.some(f=>f.key==='nyverdi.km'&&f.value===`${y} km`));}finally{productCatalog.facts=saved;}
});
test('actual registration field still ends totalskade context',()=>{const raw=car();raw.importantTerms=[term('Totalskadegaranti – Kasko','Inntil 1 år. Førstegangsregistrering: 2019. Kilometerstand 164 000 km. Årlig kjørelengde 20 000 km.')];assert.equal(normalizeDocumentFacts(raw).filter(t=>t.key==='nyverdi.km').length,0);});
test('summary registration anchor preserves explicit totalskade km',()=>{const raw=car();raw.coverageSummary=raw.importantTerms[0].name+': '+raw.importantTerms[0].value;raw.importantTerms=raw.importantTerms.slice(1);assert.equal(facts(pipeline([raw]).insuranceData.insurances[0],'nyverdi.km')[0].value,'15 000 km');});
test('same object duplicate records and cross-batch formatting do not double count',()=>{const a=car(),b=car();b.importantTerms=b.importantTerms.filter(t=>t.canonicalKey==='premie.total');b.importantTerms[0].value='14 786 kr';const d=pipeline([a,b,car('Pluss')]);assert.equal(d.insuranceData.insurances.length,2);assert.equal(total(d).amount,2757400);assert.equal(total(d).completeness,'complete');});
test('single-object display and portfolio agree on equal numeric formats',()=>{const d=pipeline([car('Kasko','førstegangsregistrering',true)]);const p=vehiclePrices(d.insuranceData.insurances[0]).find(p=>p.key==='premie.total');assert.equal(p.amount,1478600);assert.equal(total(d).amount,p.amount);assert.equal(total(d).completeness,'complete');});
for(const side of ['existing','offer'])test(`different numbers aggregate generally ${side}`,()=>{const rows=[car(),car('Pluss')];rows.forEach((r,i)=>{r.importantTerms=r.importantTerms.filter(t=>t.canonicalKey!=='premie.total');r.importantTerms.push(term('Totalpris',i?'22222 kr':'11111 kr','premie.total'),term('Totalpris',i?'22 222 kr':'11 111 kr','premie.total'));});assert.equal(total(pipeline(rows,side)).amount,3333300);});
for(const bad of ['14 000 kr','14786 kr per måned','14786 kr og 100 kr'])test(`price conflict/unparseable remains conservative ${bad}`,()=>{const raw=car();raw.importantTerms.push(term('Totalpris',bad,'premie.total'));const result=total(pipeline([raw]));assert.notEqual(result.completeness,'complete');assert.equal(result.amount,null);});
test('2/3 partial totals retain subtotal and missing total is not reconstructed',()=>{const third=car();third.objectIdentifiers[0].value='ZZ10003';third.importantTerms=third.importantTerms.filter(t=>t.canonicalKey!=='premie.total');const d=pipeline([car(),car('Pluss'),third]);assert.equal(total(d).completeness,'partial');assert.equal(total(d).priced,2);assert.equal(total(d).expected,3);assert.equal(total(d).amount,2757400);assert.equal(total(doc([d.insuranceData.insurances.find(r=>r.objectIdentifiers[0].value==='ZZ10003')])).amount,null);});
