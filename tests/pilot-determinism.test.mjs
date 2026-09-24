import test from 'node:test';
import assert from 'node:assert/strict';
import {car, term, pipeline, facts} from './helpers/pilot-quality.mjs';
import {deterministicCars, totalskadeTrace} from './helpers/pilot-determinism.mjs';
import {providerDisplayName, agreementProviderDisplayName} from '../lib/provider-presentation.ts';
import {annualAmount, vehiclePrices, vehiclePriceDifferences, differentVehiclePriceBasis} from '../lib/vehicle-price-presentation.ts';
import {portfolioPrice} from '../lib/portfolio-price-presentation.ts';
import {groupInsurances, groupTerms, createDifferences} from '../lib/comparison.ts';
import {presentImportantDifferences} from '../lib/comparison-presentation.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {productCatalog} from '../lib/product-catalog.ts';

test('canonical provider display preserves legal/raw document and evidence', () => {
  const document = pipeline(deterministicCars(true));
  const before = structuredClone(document);
  assert.equal(agreementProviderDisplayName(document.insuranceData), 'Gjensidige');
  assert.equal(providerDisplayName('Gjensidige'), 'Gjensidige');
  assert.equal(providerDisplayName('Gjensidige Forsikring ASA'), 'Gjensidige');
  assert.ok(document.insuranceData.insurances.every(i => i.catalogReference.providerId === 'gjensidige'));
  assert.equal(document.insuranceData.company, 'Gjensidige Forsikring ASA');
  assert.deepEqual(document, before);
});
test('synthetic provider ID chooses display without legal-name heuristics', () => {
  const product = {providerId: 'nordlys', productId: 'bil', version: 'v1', company: 'Nordlys'};
  const catalog = {companies: ['Nordlys'], products: [product], insuranceTypes: ['Bil']};
  assert.equal(providerDisplayName('Nordlys Forsikring AS', product, catalog), 'Nordlys');
  assert.equal(providerDisplayName('Nordlys', product, catalog), 'Nordlys');
  assert.equal(providerDisplayName('Nordlys Forsikring AS', null, catalog), 'Nordlys Forsikring AS');
});
test('unknown provider and ambiguous distributor remain raw; exact channel is preserved', () => {
  assert.equal(providerDisplayName('Ukjent Forsikring AS'), 'Ukjent Forsikring AS');
  const products = ['Kanal A', 'Kanal B'].map((company, i) => ({company, providerId: 'felles', productId: String(i), version: null}));
  const catalog = {products, companies: [], insuranceTypes: []};
  assert.equal(providerDisplayName('Kanal A', null, catalog), 'Kanal A');
  assert.equal(providerDisplayName('Juridisk navn', products[1], catalog), 'Kanal B');
});

for (const swap of [false, true]) for (const reverse of [false, true]) for (const completion of [false, true]) {
  test(`same agreement 2+2: swap=${swap}, document/object reverse=${reverse}, completion=${completion}`, () => {
    const a = deterministicCars(swap), b = deterministicCars(!swap);
    const left = pipeline(a, 'existing', completion);
    const right = pipeline(reverse ? b.toReversed() : b, 'offer', !completion);
    for (const side of [left, right]) {
      assert.equal(agreementProviderDisplayName(side.insuranceData), 'Gjensidige');
      assert.deepEqual(portfolioPrice(side).components.map(c => [c.completeness, c.amount]), [['complete',2197500],['complete',559900],['complete',2757400]]);
    }
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    assert.equal(groups.length, 2);
    for (const group of groups) {
      assert.equal(group.objectMatch.status, 'matched');
      assert.equal(group.first[0].objectIdentifiers[0].value, group.second[0].objectIdentifiers[0].value);
      assert.deepEqual(vehiclePriceDifferences(group.first[0], group.second[0]), []);
      assert.equal(differentVehiclePriceBasis(group.first[0], group.second[0]), false);
      const rows = groupTerms(group, null);
      const isKasko = group.first[0].productName === 'Kasko';
      for (const [key, expected] of [['nyverdi.alder',isKasko?'1 år':'3 år'],['nyverdi.km',isKasko?'15 000 km':'60 000 km'],['kjoretoy.kjorelengde','20 000 km per forsikringsår']]) {
        const row = rows.find(r => r.key === key);
        for (const side of ['first','second']) {assert.equal(row[side], expected);assert.ok(row[side+'SourceOrigins'].every(s => s.origin === 'document'));}
      }
      for (const row of rows) {
        assert.equal(row.firstCoverage?.status, row.secondCoverage?.status, row.key);
        if (row.firstSourceOrigins.some(s => s.origin === 'catalog')) assert.equal(row.first, row.second, row.key);
      }
    }
    const differences = createDifferences(left, right, groups, null);
    assert.equal(differences.length, 0);
    assert.equal(presentImportantDifferences(differences, groups, null).length, 0);
  });
}
for (const amount of ['11 111','22 222']) test(`canonical annual total accepts exact qualifiers generally ${amount}`, () => {
  assert.equal(annualAmount(`kr ${amount} etter rabatter, inklusive trafikkforsikringsavgift`, 'premie.total'), Number(amount.replace(' ',''))*100);
  assert.equal(annualAmount(`${amount} kr per år, eksklusive trafikkforsikringsavgift`, 'premie.ekskl_tfa'), Number(amount.replace(' ',''))*100);
  assert.equal(annualAmount(`kr ${amount} etter rabatter, inklusive trafikkforsikringsavgift`), null);
});
for (const [key, text] of [
  ['premie.total','14 786 kr per måned'], ['premie.total','14 786 kr for perioden'],
  ['premie.total','14 786 kr eksklusive trafikkforsikringsavgift'],
  ['premie.ekskl_tfa','14 786 kr inklusive trafikkforsikringsavgift'],
  ['premie.total','14 786 kr og 2 329 kr'], ['premie.total','14 786–15 000 kr'],
  ['premie.total','14 786 kr før rabatter'], ['premie.total','14 786 kr inklusive trafikkforsikringsavgift uten trafikkforsikringsavgift'],
]) test(`unknown/incompatible annual basis is not numeric equality: ${text}`, () => assert.equal(annualAmount(text, key), null));
test('equal amounts with different price fields remain incomparable', () => {
  const a=car(), b=car();a.importantTerms=[term('Forsikringspris','10 000 kr','premie.ekskl_tfa')];b.importantTerms=[term('Totalpris','10 000 kr','premie.total')];
  const left=pipeline([a]).insuranceData.insurances[0],right=pipeline([b],'offer').insuranceData.insurances[0];
  assert.equal(differentVehiclePriceBasis(left,right),true);assert.deepEqual(vehiclePriceDifferences(left,right),[]);
});
test('real comparable differences are retained with alternate prices', () => {
  const a=car(), b=car();a.importantTerms=[term('Totalpris','12 000 kr','premie.total')];b.importantTerms=[term('Totalpris','10 000 kr per år','premie.total')];
  const [left,right]=[a,b].map(r=>pipeline([r]).insuranceData.insurances[0]);
  assert.equal(vehiclePriceDifferences(left,right)[0].deltaOre,-200000);
});
test('duplicate decorated object prices consolidate without double-counting', () => {
  const d=pipeline([...deterministicCars(),...deterministicCars(true)],'existing',true);
  assert.equal(d.insuranceData.insurances.length,2);
  assert.deepEqual(portfolioPrice(d).components.map(c=>c.amount),[2197500,559900,2757400]);
  assert.ok(portfolioPrice(d).components.every(c=>c.completeness==='complete'));
});
test('missing total stays partial; unknown annual amount is never guessed', () => {
  const records=deterministicCars(true);records[1].importantTerms=records[1].importantTerms.filter(t=>t.canonicalKey!=='premie.total');
  const price=portfolioPrice(pipeline(records));assert.equal(price.components[2].amount,1478600);assert.equal(price.components[2].completeness,'partial');
  records[0].importantTerms.find(t=>t.canonicalKey==='premie.total').value='14 786 kr for perioden';
  assert.equal(portfolioPrice(pipeline(records)).components[2].amount,null);
});

for (const side of ['existing','offer']) for (const value of ['15 000 km','12 345 km']) for (const reverse of [false,true]) test(`eight-stage document trace ${side} ${value} reverse=${reverse}`, () => {
  const trace=totalskadeTrace(side,value,reverse);
  for(const [stage,entries] of Object.entries(trace.stages)) assert.deepEqual(entries,[{value,origin:'document'}],stage);
  assert.equal(facts(trace.client,'kjoretoy.kjorelengde')[0].value,'20 000 km per forsikringsår');
  assert.ok(trace.comparison.firstSources.every(s=>s.documentId.startsWith(`pdf:${side}:`)));
});

test('exact product labels keep customer fact on canonical row rather than suppressing it', () => {
  const a=car(),b=car();a.importantTerms.push(term('Kaskoskade','Dokumentert kaskobeskrivelse'));b.importantTerms.push(term('Geografisk område','Dokumentert geografisk omfang'));
  const left=pipeline([a,a]).insuranceData.insurances,right=pipeline([b,b],'offer').insuranceData.insurances;
  const rows=groupTerms(groupInsurances(left,right,null)[0],null);
  for(const key of ['kasko.dekning','geografi.dekning']){const row=rows.find(r=>r.key===key);assert.equal(row.firstCoverage.status,'selected');assert.equal(row.secondCoverage.status,'selected');}
  assert.equal(rows.find(r=>r.key==='kasko.dekning').first,'Dokumentert kaskobeskrivelse');
  assert.equal(rows.find(r=>r.key==='kasko.dekning').firstSourceOrigins[0].origin,'document');
  assert.equal(rows.find(r=>r.key==='kasko.dekning').secondSourceOrigins[0].origin,'catalog');
  assert.ok(!rows.some(r=>['kaskoskade','geografisk omrade'].includes(r.key)));
});

function withSyntheticCatalog(run) {
  const id='synthetic-determinism',product={company:'Nordlys',insuranceType:'Bil',name:'Kasko',providerId:'nordlys',productId:id,version:'v1',componentIds:[id]};
  const source={documentId:'synthetic-public',filename:'synthetic-public',page:1,section:'Eksempel',termsNumber:'TEST',effectiveFrom:''};
  productCatalog.products.push(product);productCatalog.facts[id]=[{key:'synthetic.dekning',label:'Syntetisk standarddekning',value:'Dokumentert i syntetisk produkt',source}];
  try{run(productCatalog.facts[id],source);}finally{productCatalog.products.splice(productCatalog.products.indexOf(product),1);delete productCatalog.facts[id];}
}
test('generic exact-label identity and catalog silence symmetry with synthetic provider',()=>withSyntheticCatalog(()=>{
  const a=car(),b=car();for(const r of [a,b]){r.company='Nordlys';r.importantTerms=[];}
  let left=pipeline([a]).insuranceData.insurances,right=pipeline([b],'offer').insuranceData.insurances;
  let row=groupTerms(groupInsurances(left,right,null)[0],null).find(r=>r.key==='synthetic.dekning');
  assert.equal(row.first,row.second);assert.equal(row.firstSourceOrigins[0].origin,'catalog');assert.equal(row.secondSourceOrigins[0].origin,'catalog');
  a.importantTerms.push(term('Syntetisk standarddekning','Eget dokumentert vilkår'));
  left=pipeline([a]).insuranceData.insurances;row=groupTerms(groupInsurances(left,right,null)[0],null).find(r=>r.key==='synthetic.dekning');
  assert.equal(row.first,'Eget dokumentert vilkår');assert.equal(row.firstSourceOrigins[0].origin,'document');assert.equal(row.secondSourceOrigins[0].origin,'catalog');
}));
test('ambiguous catalog label does not choose a key or suppress both safe catalog facts',()=>withSyntheticCatalog((catalogFacts,source)=>{
  catalogFacts.push({key:'other.dekning',label:catalogFacts[0].label,value:'En annen betydning',source});
  const r=car();r.company='Nordlys';r.importantTerms=[term(catalogFacts[0].label,'Uavklart betydning')];
  const result=pipeline([r]).insuranceData.insurances[0];
  assert.equal(facts(result,'synthetic.dekning')[0].coverageOrigin,'catalog');assert.equal(facts(result,'other.dekning')[0].coverageOrigin,'catalog');
  assert.ok(result.importantTerms.some(t=>t.coverageOrigin==='document'&&t.value==='Uavklart betydning'&&!t.key));
}));
test('customer-specific facts and explicit not-selected never borrow evidence from other side',()=>{
  const a=car(),b=car();b.importantTerms=[];a.importantTerms.push(term('Individuelt avtalt beløp','4 321 kr'));
  const left=pipeline([a]).insuranceData.insurances,right=pipeline([b],'offer').insuranceData.insurances;
  const rows=groupTerms(groupInsurances(left,right,null)[0],null);
  assert.equal(rows.find(r=>r.label==='Individuelt avtalt beløp').second,null);
  assert.equal(canonicalCoverage(left[0],'bil','leiebil.dekning').status,'not_selected');
  assert.equal(canonicalCoverage(right[0],'bil','leiebil.dekning').status,'unknown');
  assert.ok(vehiclePrices(right[0]).every(p=>p.amount===null));
  assert.equal(facts(right[0],'kjoretoy.kjorelengde').length,0);
});
