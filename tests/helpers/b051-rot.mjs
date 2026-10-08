import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deserialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const audit=new URL('../../docs/audit/checkpoints/b051-rot-77db841/',import.meta.url);
export const rotOracle=JSON.parse(readFileSync(new URL('proposal.json',audit)));
const snapshot=JSON.parse(readFileSync(new URL('baseline-snapshot.json',audit)));
const bytes=readFileSync(new URL(snapshot.snapshot,audit));
assert.equal(createHash('sha256').update(bytes).digest('hex'),snapshot.sha256);
const baseline=deserialize(gunzipSync(bytes));
export function transformRotRows(rows,owner){
 if(!rotOracle.owners.includes(owner))return transformRotStatusRows(rows,owner);
 assert.equal(rows.filter(f=>f.key===rotOracle.key).length,1);
 return rows.map(f=>{
  if(f.key!==rotOracle.key)return f;
  const previous=baseline.facts[owner].find(x=>x.key===rotOracle.key);
  // Only this reference field is omitted by the established JSON snapshot layer.
  // Compare all fields within that layer; never normalize the whole comparison.
  const expected=structuredClone(previous);
  if(!Object.hasOwn(f.source,'productCode')){
   assert.equal(expected.source.productCode,undefined);
   delete expected.source.productCode;
  }
  assert.deepEqual(f,expected);
  assert.equal(f.value,rotOracle.previous_value);
  assert.equal(f.label,rotOracle.label);
  return {...f,value:rotOracle.value};
 });
}
export function applyRot(catalog){
 const result=structuredClone(catalog);
 for(const owner of rotOracle.owners)result.facts[owner]=transformRotRows(result.facts[owner],owner);
 result.facts.gjensidigeHusStandard=transformRotStatusRows(result.facts.gjensidigeHusStandard,'gjensidigeHusStandard');
 result.addOns=transformRotStatusAddOns(result.addOns);
 return result;
}

// Authorized selection metadata only. Values and source references remain the
// independently verified original catalog contract, including raw undefined fields.
export function transformRotStatusRows(rows, owner) {
  if (owner !== 'gjensidigeHusStandard') return rows;
  assert.equal(rows.filter(fact => fact.key === 'hus.rate.dekning').length, 1);
  return rows.map(fact => {
    if (fact.key !== 'hus.rate.dekning') return fact;
    assert.equal(fact.label, 'Råte og sopp');
    assert.equal(fact.value, 'Sopp og råte er unntatt på Hus uten valgfri utvidelse.');
    assert.equal(fact.source.documentId, 'gjensidigeHusStandard');
    assert.equal(fact.source.page, 3);
    assert.equal(fact.source.section, 'Hus – Dekkes ikke');
    assert.equal(Object.hasOwn(fact, 'coverageAvailability'), false);
    return { ...fact, coverageAvailability: 'unavailable' };
  });
}
export function transformRotStatusAddOns(addOns) {
  assert.equal(addOns.filter(addOn => addOn.id === 'gjensidige-hus-rate-insekter').length, 1);
  return addOns.map(addOn => {
    if (addOn.id !== 'gjensidige-hus-rate-insekter') return addOn;
    assert.equal(addOn.componentId, 'gjensidigeHusRotOption');
    assert.equal(addOn.providerId, 'gjensidige');
    assert.deepEqual(addOn.requiresLevel, ['gjensidige-hus']);
    assert.deepEqual(addOn.insuranceTypes, ['Hus']);
    assert.equal(Object.hasOwn(addOn, 'selectionEvidenceKeys'), false);
    return { ...addOn, selectionEvidenceKeys: ['hus.rate.dekning'] };
  });
}
export function applyRotStatus(catalog) {
  const result = structuredClone(catalog);
  result.facts.gjensidigeHusStandard = transformRotStatusRows(result.facts.gjensidigeHusStandard, 'gjensidigeHusStandard');
  result.addOns = transformRotStatusAddOns(result.addOns);
  return result;
}
