import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const smartOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b051-smart-e21693e/proposal.json',import.meta.url)));
export function transformSmartRows(rows,owner,{jsonSnapshot=false}={}){
 if(owner!==smartOracle.owner)return rows;
 for(const r of smartOracle.rows)assert.equal(rows.filter(f=>f.key===r.key).length,1);
 const termsRef=rows.find(f=>f.key==='hus.service.smart.avtale').source;
 return rows.map(f=>{
  const r=smartOracle.rows.find(r=>r.key===f.key);if(!r)return f;
  assert.equal(f.label,r.label);assert.equal(f.value,r.previous_value);
  assert.equal(f.source.page,1);assert.equal(f.source.section,f.key==='hus.service.smart'?'Hus Smart':'Avtalevilkår');
  assert.equal(Object.hasOwn(f,'qualificationSource'),false);
  const primary={...termsRef,page:1,section:r.primary.section};
  // JSON historical oracles omit undefined; raw catalog controls preserve it.
  if(!jsonSnapshot)primary.productCode=undefined;
  return {...f,value:r.value,source:primary,...(f.key==='hus.service.smart'?{qualificationSource:{...f.source}}:{})};
 });
}
export function applySmart(catalog,options={jsonSnapshot:true}){
 const expected=structuredClone(catalog);
 expected.facts[smartOracle.owner]=transformSmartRows(expected.facts[smartOracle.owner],smartOracle.owner,options);
 return expected;
}
