import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
export const baselineCatalog=JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz',import.meta.url))));
for(const path of JSON.parse(gunzipSync(readFileSync(new URL('baseline-undefined-paths.json.gz',import.meta.url))))){let o=baselineCatalog;for(const key of path.slice(0,-1))o=o[key];o[path.at(-1)]=undefined;}
export const sourceOracle=JSON.parse(readFileSync(new URL('source-oracle.json',import.meta.url)));
export const commonExceptions=JSON.parse(readFileSync(new URL('common-exceptions.json',import.meta.url)));
export const keys=Object.keys(sourceOracle);
export function transformSettlementRows(rows,owner){
 if(owner!=='gjensidigeHusStandard')return rows;
 for(const key of keys)assert.equal(rows.filter(f=>f.key===key).length,1,key);
 return rows.map(f=>{
  const o=sourceOracle[f.key];if(!o)return f;
  const previous=baselineCatalog.facts.gjensidigeHusStandard.find(r=>r.key===f.key);
  assert.equal(f.label,previous.label);assert.equal(f.value,previous.value);
  assert.deepEqual([f.source.page,f.source.section],[previous.source.page,previous.source.section]);
  assert.equal(Object.hasOwn(f,'qualificationSource'),false);
  const source={...f.source,page:o.page,section:o.section};
  return {...f,value:o.value,source,
   ...(o.qualification?{qualificationSource:{...source,...o.qualification}}:{}),
   ...(f.structuredValue?.kind==='age_deduction'?{structuredValue:{...f.structuredValue,exceptions:[...f.structuredValue.exceptions,...commonExceptions]}}:{})};
 });
}
export function applySettlement(catalog){const expected=structuredClone(catalog);expected.facts.gjensidigeHusStandard=transformSettlementRows(expected.facts.gjensidigeHusStandard,'gjensidigeHusStandard');return expected;}
export const expectedCatalog=applySettlement(baselineCatalog);
