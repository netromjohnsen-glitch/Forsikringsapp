import {applyHealthHelp} from './b051-health-help.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productCatalog} from '../../lib/product-catalog.ts';
import {expectedCatalog as previousCatalog} from '../../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
export const sourceOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b051-liability-3947e4e/source-oracle.json',import.meta.url)));
export const baselineCatalog=applyHealthHelp(previousCatalog);
export function transformLiabilityRows(rows,owner){
 if(owner!==sourceOracle.owner)return rows;
 assert.equal(rows.filter(f=>f.key===sourceOracle.key).length,1);
 return rows.map(f=>{
  if(f.key!==sourceOracle.key)return f;
  assert.equal(f.label,sourceOracle.label);assert.equal(f.value,sourceOracle.previous_value);
  assert.deepEqual([f.source.page,f.source.section],sourceOracle.previous_primary);
  return {...f,value:sourceOracle.value,source:{...f.source,page:sourceOracle.primary[0],section:sourceOracle.primary[1]}};
 });
}
export function applyLiability(catalog){
 const expected=structuredClone(catalog);
 expected.facts[sourceOracle.owner]=transformLiabilityRows(expected.facts[sourceOracle.owner],sourceOracle.owner);
 return expected;
}
export const expectedCatalog=applyLiability(baselineCatalog);
export function assertLiabilityCatalog(){
 // The historical whole-catalog oracle is a JSON snapshot. Preserve its layer;
 // raw undefined fields are checked separately in the permanent liability gate.
 assert.deepEqual(JSON.parse(JSON.stringify(productCatalog)),JSON.parse(JSON.stringify(expectedCatalog)));
 const fact=productCatalog.facts[sourceOracle.owner].find(f=>f.key===sourceOracle.key);
 assert.equal(Object.hasOwn(fact.source,'productCode'),true);assert.equal(fact.source.productCode,undefined);
 assert.equal(Object.hasOwn(fact.source,'sourceType'),false);
}
if(process.argv.includes('--audit')){assertLiabilityCatalog();console.log('PASS: independent full-field liability catalog oracle');}
