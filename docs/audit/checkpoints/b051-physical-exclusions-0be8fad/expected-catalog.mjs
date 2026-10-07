import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expectedCatalog as previousCatalog} from '../b051-recovery-benefits-69c71dc/expected-catalog.mjs';
export const baselineCatalog=structuredClone(previousCatalog);
export const sourceOracle=JSON.parse(readFileSync(new URL('source-oracle.json',import.meta.url)));
export const keys=sourceOracle.standard.map(o=>o.key);
export function transformPhysicalRows(rows,owner,{jsonSnapshot=false}={}){
 if(owner==='gjensidigeHusStandard')return rows.map(f=>{
  const o=sourceOracle.standard.find(o=>o.key===f.key);if(!o)return f;
  assert.equal(rows.filter(x=>x.key===o.key).length,1);
  assert.equal(f.label,o.label);assert.equal(f.value,o.previous_value);
  assert.deepEqual([f.source.page,f.source.section],o.primary);
  assert.equal(Object.hasOwn(f,'qualificationSource'),false);
  return {...f,value:o.value,...(o.qualification?{qualificationSource:{...f.source,page:o.qualification[0],section:o.qualification[1]}}:{})};
 });
 if(owner==='gjensidigeHusPluss'){
  const o=sourceOracle.plus;
  assert.equal(rows.some(f=>f.key===o.key),false,'No pre-existing Pluss override');
  const reference={...baselineCatalog.facts.gjensidigeHusPluss.find(f=>f.key==='hus.rate.dekning').source,page:o.primary[0],section:o.primary[1]};
  // JSON snapshots omit this one explicitly undefined field; raw controls retain it.
  if(jsonSnapshot){assert.equal(reference.productCode,undefined);delete reference.productCode;}
  return [...rows,{key:o.key,label:o.label,value:o.value,replacesBase:true,source:reference}];
 }
 return rows;
}
export function applyPhysical(catalog,{jsonSnapshot=false}={}){
 const expected=structuredClone(catalog);
 for(const owner of ['gjensidigeHusStandard','gjensidigeHusPluss'])expected.facts[owner]=transformPhysicalRows(expected.facts[owner],owner,{jsonSnapshot});
 return expected;
}
export const expectedCatalog=applyPhysical(baselineCatalog);
