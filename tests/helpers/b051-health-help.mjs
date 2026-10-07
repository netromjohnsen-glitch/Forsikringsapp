import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const healthOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b051-health-help-732b4cc/source-oracle.json',import.meta.url)));
export function transformHealthHelpRows(rows,owner){
 if(owner!==healthOracle.owner)return rows;
 assert.equal(rows.filter(f=>f.key===healthOracle.key).length,1);
 return rows.map(f=>{
  if(f.key!==healthOracle.key)return f;
  assert.equal(f.label,healthOracle.label);assert.equal(f.value,healthOracle.previous_value);
  assert.deepEqual([f.source.page,f.source.section],healthOracle.previous_primary);
  return {...f,value:healthOracle.value,source:{...f.source,page:healthOracle.primary[0]}};
 });
}
export function applyHealthHelp(catalog){
 const expected=structuredClone(catalog);
 expected.facts[healthOracle.owner]=transformHealthHelpRows(expected.facts[healthOracle.owner],healthOracle.owner);
 return expected;
}
