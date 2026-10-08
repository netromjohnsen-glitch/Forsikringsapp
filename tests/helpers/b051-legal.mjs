import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const legalOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b051-legal-b457a8d/source-oracle.json',import.meta.url)));
export function transformLegalRows(rows,owner){
 if(owner!==legalOracle.owner)return rows;
 for(const r of legalOracle.rows)assert.equal(rows.filter(f=>f.key===r.key).length,1);
 return rows.map(f=>{
  const index=legalOracle.rows.findIndex(r=>r.key===f.key);if(index<0)return f;
  const r=legalOracle.rows[index];assert.equal(f.label,r.label);assert.equal(f.value,legalOracle.previous_values[index]);
  assert.deepEqual([f.source.page,f.source.section],[index===0?10:11,index===0?'Rettshjelp':'Rettshjelp – Forsikringssum og egenandel']);
  assert.equal(Object.hasOwn(f,'qualificationSource'),false);
  // Spread the existing reference in its own layer: raw own undefined remains;
  // a historical JSON reference retains omission. No global JSON sanitization.
  return {...f,value:r.value,source:{...f.source,page:r.primary[0],section:r.primary[1]},qualificationSource:{...f.source,page:r.qualification[0],section:r.qualification[1]}};
 });
}
export function applyLegal(catalog){
 const expected=structuredClone(catalog);
 expected.facts[legalOracle.owner]=transformLegalRows(expected.facts[legalOracle.owner],legalOracle.owner);
 return expected;
}
