import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emptyManualProduct, normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { manualProductOptions, applyManualProductSelection, changeManualAgreementScope, CUSTOM_PRODUCT_SELECTION } from '../lib/manual-product-selection.ts';
import { productCatalog, catalogAgreementScopeOptions } from '../lib/product-catalog.ts';
import { groupInsurances, groupTerms } from '../lib/comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { mcBobilRecord } from './helpers/mc-bobil.mjs';

for(const type of ['MC','Bobil']) for(const company of ['Tryg','If','Gjensidige','Storebrand','Fremtind','Frende']) {
  test(`manual ${company} ${type}: exact dropdown, roundtrip and type-scoped facts`,()=>{
    const scope=company==='Fremtind'?(type==='MC'?'ordinary-sparebank1':'ordinary-dnb'):'ordinary';
    const options=manualProductOptions(company,type,productCatalog,scope);
    assert.ok(options.length>=3);
    for(const option of options){
      assert.equal(option.product.company,company);assert.equal(option.product.insuranceType,type);assert.equal(option.product.agreementScope,scope);
      const input=applyManualProductSelection({...emptyManualProduct(),type,agreementScope:scope},company,type,option.value);
      const out=normalizeManualAgreement({company,totalAnnualPremium:'',products:[input]}).insuranceData.insurances[0];
      assert.equal(out.catalogReference.productId,option.product.productId);
      assert.equal(out.catalogReference.agreementScope,scope);
      assert.ok(out.importantTerms.length>0);
      assert.ok(!out.importantTerms.some(f=>f.key==='kjoretoy.kjorelengde'));
    }
  });
}
for(const type of ['MC','Bobil']){
  test(`${type}: unknown custom product remains conservative and full manual details preserved`,()=>{
    let p={...emptyManualProduct(),type,productName:'Syntetisk særprodukt',importantTerms:[{name:'Syntetisk detalj',value:'Behold hele teksten'}]};
    p=applyManualProductSelection(p,'If',type,CUSTOM_PRODUCT_SELECTION);
    const out=normalizeManualAgreement({company:'If',totalAnnualPremium:'',products:[p]}).insuranceData.insurances[0];
    assert.equal(out.catalogReference,null);assert.equal(out.productName,'Syntetisk særprodukt');
    assert.ok(out.importantTerms.some(t=>t.value==='Behold hele teksten'));
  });
  test(`${type}: no new annual-mileage input accepted and empty value never creates customer fact`,()=>{
    assert.throws(()=>normalizeManualAgreement({company:'If',totalAnnualPremium:'',products:[{...emptyManualProduct(),type,productName:'Kasko',annualMileage:'12345'}]}),/bare registreres for Bil/);
  });
  test(`${type}: manual/PDF exact same product yields same catalog fact values`,()=>{
    const p=normalizeManualAgreement({company:'If',totalAnnualPremium:'',products:[{...emptyManualProduct(),type,productName:'Kasko'}]}).insuranceData.insurances[0];
    const pdf=enrichExtractedAgreementWithCatalog({company:'If',totalAnnualPremium:null,insurances:[mcBobilRecord(type,1,{objectIdentifiers:[],importantTerms:[]})]}).insurances[0];
    const [group]=groupInsurances([p],[pdf],null);
    assert.ok(groupTerms(group,null).filter(t=>!t.key.startsWith('premie.')).every(t=>t.first===t.second));
  });
}
test('Fremtind keeps existing unique-scope lookup, rejecting ambiguous or wrong channels',()=>{
  for(const type of ['MC','Bobil']){
    const options=manualProductOptions('Fremtind',type);
    assert.ok(options.length>0);
    const ambiguous={...productCatalog,products:[...productCatalog.products,...options.map(o=>({...o.product,agreementScope:type==='MC'?'ordinary-dnb':'ordinary-sparebank1'}))]};
    assert.deepEqual(manualProductOptions('Fremtind',type,ambiguous),[]);
  }
  assert.deepEqual(catalogAgreementScopeOptions(productCatalog,'Fremtind','MC').map(s=>s.id),['ordinary-sparebank1']);
  assert.deepEqual(catalogAgreementScopeOptions(productCatalog,'Fremtind','Bobil').map(s=>s.id),['ordinary-dnb']);
  const p=changeManualAgreementScope({...emptyManualProduct(),type:'MC'},'Fremtind','MC','ordinary-sparebank1');
  assert.equal(p.agreementScope,'ordinary-sparebank1');
  assert.deepEqual(manualProductOptions('Fremtind','MC',productCatalog,'ordinary-dnb'),[]);
  for(const scope of ['lofavor','nito','utdanningsforbundet'])assert.deepEqual(manualProductOptions('Fremtind','MC',productCatalog,scope),[]);
});
test('manual visible types include MC/Bobil while mileage condition remains Bil-only',()=>{
  const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
  assert.match(page,/const pilotInsuranceTypes = \[[^\n]*"MC", "Bobil"/);
  assert.match(page,/normalizeInsuranceType\(product.type\) === "bil"/);
});
