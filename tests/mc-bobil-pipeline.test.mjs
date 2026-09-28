import test from 'node:test';
import assert from 'node:assert/strict';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { mcBobilRecord as record, mcBobilTerm as term, mcBobilTerms as terms } from './helpers/mc-bobil.mjs';
import { groupInsurances, groupTerms, createDifferences } from '../lib/comparison.ts';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { productCatalog, findCatalogProductBySelection, resolveCatalogFacts, availableAddOns, catalogConnectionStatus } from '../lib/product-catalog.ts';
import { resolveCatalogSources } from '../lib/catalog-source-resolution.ts';
import { mcBobilProducts } from '../lib/mc-bobil-catalog.ts';
import { runHybridMatching } from '../lib/hybrid-matching.ts';

const objects=d=>d.insuranceData.insurances;
const enrich=r=>enrichExtractedAgreementWithCatalog({company:r.company,totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[r]}).insurances[0];
const get=(p,key)=>p.importantTerms.filter(t=>t.key===key);
const compare=(a,b)=>groupInsurances(objects(a),objects(b),null);
const date=new Date('2026-09-28');

for(const type of ['MC','Bobil']) {
  for(const [age,km] of [[2,'17 000'],[4,'33 000']])test(`${type}: precise compound document limits ${age}/${km} survive canonical rescoping and catalog`,()=>{
    const out=enrich(record(type,1,{importantTerms:[term('Dokumentert nyverdigrense',`Gjelder for kjøretøy inntil ${age} år og inntil ${km} km`,'nyverdi.km')]}));
    assert.deepEqual(get(out,'nyverdi.alder').map(t=>t.value),[`Gjelder for kjøretøy inntil ${age} år`]);
    assert.deepEqual(get(out,'nyverdi.km').map(t=>t.value),[`inntil ${km} km`]);
    assert.ok(get(out,'nyverdi.km').every(t=>t.coverageOrigin==='document'));
  });
  for(const amount of ['17 000 km','31 000 km']) test(`${type}: document limit ${amount} wins catalog and repeated consolidation`,()=>{
    const r=record(type,1,{importantTerms:[term('Totalskadegaranti kilometergrense',amount,'nyverdi.km')]});
    const out=objects(documentPipeline([[r],[{...r,importantTerms:[term('Årlig kjørelengde','24 000 km','kjoretoy.kjorelengde')]}]]));
    assert.equal(out.length,1);assert.deepEqual(get(out[0],'nyverdi.km').map(t=>t.value),[amount]);
    assert.equal(get(out[0],'nyverdi.km')[0].coverageOrigin,'document');
    assert.equal(get(out[0],'nyverdi.km')[0].sources[0].documentId,'pdf:existing:0');
    assert.equal(get(out[0],'kjoretoy.kjorelengde')[0].value,'24 000 km');
    assert.ok(out[0].catalogFacts.some(f=>f.key==='nyverdi.km'&&f.value!==amount));
  });
  for(const [choice,status,selected] of [[null,'unknown',false],['Ikke valgt','not_selected',false],['Valgt','selected',true]]) test(`${type}: optional motor component activated only by document choice ${choice}`,()=>{
    const r=record(type,1,{importantTerms:choice?[term('Motor- og girskade',choice)]:[]});
    const out=enrich(r);assert.equal(canonicalCoverage(out,type,'maskinskade.dekning').status,status);
    assert.equal(out.addOnIds.length>0,selected);
    const detail=type==='MC'?'maskinskade.alder':'maskinskade.km';
    assert.equal(get(out,detail).length>0,selected);
    if(selected)assert.ok(get(out,detail).every(t=>t.coverageOrigin==='catalog'));
  });
  test(`${type}: explicit rejection beats even a documented product-inherent base coverage`,()=>{
    const out=enrich(record(type,1,{importantTerms:[term('Kasko','Ikke valgt')]}));
    assert.equal(canonicalCoverage(out,type,'kasko.dekning').status,'not_selected');
    assert.ok(get(out,'kasko.dekning').every(t=>t.coverageOrigin==='document'));
  });
  test(`${type}: conflicting explicit optional choices stay unknown without catalog arbitration`,()=>{
    const out=enrich(record(type,1,{importantTerms:[term('Motor- og girskade','Valgt'),term('Motor- og girskade','Ikke valgt')]}));
    assert.equal(canonicalCoverage(out,type,'maskinskade.dekning').conflict,true);
    assert.equal(out.addOnIds.length,0);
  });
  test(`${type}: terms alone never form a customer object or portfolio contribution`,()=>{
    const out=documentPipeline([[terms(type,{importantTerms:[term('Totalpris','9 000 kr','premie.total')]})]]);
    assert.equal(objects(out).length,0);assert.equal(out.insuranceData.supportingEvidence.length,1);
    assert.equal(portfolioPrice(out).objectCount,0);
  });
  for(const together of [false,true])test(`${type}: customer + terms ${together?'same':'separate'} PDF remains one object with document prices`,()=>{
    const customer=record(type),support=terms(type,{importantTerms:[term('Totalpris','99 999 kr','premie.total'),term('Supplerende generelt vilkår','Syntetisk, ingen kundeopplysning')]});
    const out=documentPipeline(together?[[customer,support]]:[[customer],[support]]);
    assert.equal(objects(out).length,1);assert.equal(get(objects(out)[0],'premie.total')[0].value,'1202 kr.');
    assert.ok(objects(out)[0].recordEvidence.some(r=>r.documentRole==='general_terms'));
    assert.equal(portfolioPrice(out).components.find(c=>c.key==='premie.total').amount,120200);
  });
  test(`${type}: customer endorsement can add detail without copying another object's price`,()=>{
    const a=record(type,1),b=record(type,2);
    const endorsement={...a,annualPremium:null,importantTerms:[term('Motor- og girskade','Valgt'),term('Maskinskade kilometergrense','177 000 km','maskinskade.km')]};
    const out=objects(documentPipeline([[a],[b],[endorsement]],'existing',true,true));
    assert.equal(out.length,2);
    const first=out.find(r=>r.objectIdentifiers[0].value===a.objectIdentifiers[0].value);
    const second=out.find(r=>r!==first);
    assert.equal(get(first,'maskinskade.km')[0].value,'177 000 km');
    assert.equal(get(second,'maskinskade.km').length,0);
    assert.notEqual(first.annualPremium,second.annualPremium);
  });
  test(`${type}: terms wrong provider/type/product/scope/version cannot attach`,()=>{
    const customer=record(type);
    for(const patch of [{company:'Tryg'},{type:type==='MC'?'Bobil':'MC'},{canonicalProductName:'Delkasko'},
      {agreementScope:'ordinary-dnb',company:'Fremtind'}, {agreementPeriod:{from:'2025-01-01',to:'2025-12-31'}}]) {
      const out=objects(documentPipeline([[customer],[terms(type,{...patch,importantTerms:[term('Syntetisk støttefact','Må ikke tilknyttes')]})]]));
      assert.ok(!out[0].importantTerms.some(t=>t.value==='Må ikke tilknyttes'));
    }
  });
  test(`${type}: unknown product keeps customer and evidence without fuzzy catalog match`,()=>{
    const out=enrich(record(type,1,{productName:'Kaskoo',canonicalProductName:'Kaskoo'}));
    assert.equal(out.catalogReference,null);assert.ok(out.importantTerms.length);
    assert.match(catalogConnectionStatus([out]),/Ikke koblet/);
  });
}

test('two MC + two Bobil pair exactly in reversed order across provider/product changes',()=>{
  const records=[record('MC',1),record('MC',2),record('Bobil',3),record('Bobil',4)];
  const a=documentPipeline(records.map(r=>[r]),'existing',true);
  const b=documentPipeline(records.toReversed().map(r=>[{...r,company:'Gjensidige',canonicalProductName:r.type==='Bobil'?'Pluss':'Delkasko',productName:r.type==='Bobil'?'Pluss':'Delkasko'}]),'offer');
  const groups=compare(a,b);assert.equal(groups.length,4);
  for(const g of groups){assert.equal(g.objectMatch.status,'matched');assert.equal(g.first[0].objectIdentifiers[0].value,g.second[0].objectIdentifiers[0].value);
    assert.equal(g.first[0].catalogReference.providerId,'if');assert.equal(g.second[0].catalogReference.providerId,'gjensidige');
    for(const key of ['premie.ekskl_tfa','premie.tfa','premie.total','kjoretoy.kjorelengde']){
      const row=groupTerms(g,null).find(r=>r.key===key);assert.equal(row.first,row.second);
    }
  }
  for(const side of [a,b]){const price=portfolioPrice(side);assert.equal(price.objectCount,4);assert.ok(price.components.every(c=>c.completeness==='complete'&&c.priced===4));}
});
test('missing/new MC and Bobil objects remain explicit although types exist on both sides',()=>{
  const a=documentPipeline([[record('MC',1)],[record('MC',2)],[record('Bobil',3)],[record('Bobil',4)]]);
  const b=documentPipeline([[record('Bobil',4)],[record('MC',1)],[record('MC',5)]],'offer');
  const groups=compare(a,b);assert.equal(groups.filter(g=>g.objectMatch.status==='matched').length,2);
  assert.equal(groups.filter(g=>!g.second.length).length,2);assert.equal(groups.filter(g=>!g.first.length).length,1);
  assert.equal(createDifferences(a,b,groups,null).filter(d=>d.kind==='object').length,3);
});
test('multiple same-type unidentified objects are never paired by index or product',async()=>{
  const rows=[record('MC',1,{objectIdentifiers:[]}),record('MC',2,{objectIdentifiers:[]}),record('Bobil',3,{objectIdentifiers:[]}),record('Bobil',4,{objectIdentifiers:[]})];
  const a=documentPipeline(rows.map(r=>[r])),b=documentPipeline(rows.toReversed().map(r=>[r]),'offer');
  assert.ok(compare(a,b).every(g=>g.objectMatch.status==='ambiguous'));
  let calls=0;await runHybridMatching(objects(a),objects(b),async()=>{calls++;return{};},undefined,true);assert.equal(calls,0);
});
test('MC/Bobil terms do not inflate mixed Bil + MC + Bobil portfolio',()=>{
  const out=documentPipeline([['Bil','MC','Bobil'].map((type,i)=>record(type,i+1)),[terms('MC'),terms('Bobil')]]);
  const price=portfolioPrice(out);assert.equal(price.objectCount,3);assert.ok(price.components.every(c=>c.completeness==='complete'&&c.expected===3));
});
test('identical registration text does not cross-match different insurance types',()=>{
  const groups=compare(documentPipeline([[record('MC',1)]]),documentPipeline([[record('Bobil',1)]],'offer'));
  assert.equal(groups.length,2);assert.ok(groups.every(g=>g.objectMatch.status!=='matched'));
});
test('all new products resolve exact sources and add-ons without type/scope/provider leakage',()=>{
  for(const p of mcBobilProducts){
    assert.equal(findCatalogProductBySelection(p.company,p.insuranceType,p.name,p.agreementScope),p);
    const facts=resolveCatalogFacts(p,[],date);assert.ok(facts.length>0);
    assert.equal(new Set(facts.map(f=>f.key)).size,facts.length,p.productId);
    for(const f of facts){const s=productCatalog.sources[f.source.documentId];assert.equal(s.providerId,p.providerId);assert.equal(s.insuranceType,p.insuranceType);assert.equal(s.agreementScope,p.agreementScope);}
    assert.ok(availableAddOns(p,date).every(a=>a.providerId===p.providerId&&a.agreementScope===p.agreementScope&&a.requiresLevel.includes(p.productId)));
  }
});
test('new sources obey authority, validity, exact version and agreement applicability',()=>{
  const product=mcBobilProducts[0],origin=productCatalog.sources[product.sourceId];
  const make=(id,sourceType,extra={})=>({...origin,id,sourceType,...extra});
  const sources={terms:make('terms','full_terms'),ipid:make('ipid','ipid'),page:make('page','product_page')};
  const rows=Object.keys(sources).map((id,i)=>({key:'utstyr.grense',label:'Syntetisk',value:`${i+1} kr`,source:{documentId:id}}));
  assert.equal(resolveCatalogSources(rows,sources,product,date).facts[0].source.documentId,'terms');
  for(const patch of [{insuranceType:'Hus'},{providerId:'unknown'},{agreementScope:'member-synthetic'},{productVersion:'other'},
    {effectiveFrom:'2027-01-01'},{validTo:'2025-01-01'},{productIds:['wrong-product']}])
    assert.equal(resolveCatalogSources([rows[0]],{terms:{...sources.terms,...patch}},product,date).facts.length,0);
  const conflict=resolveCatalogSources([...rows.slice(0,1),{...rows[0],value:'different'}],sources,product,date);
  assert.equal(conflict.decisions[0].reason,'conflict');assert.deepEqual(conflict.facts,[]);
});
