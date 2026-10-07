import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
export const baselineCatalog=JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz',import.meta.url))));
for(const path of JSON.parse(gunzipSync(readFileSync(new URL('baseline-undefined-paths.json.gz',import.meta.url))))){let o=baselineCatalog;for(const key of path.slice(0,-1))o=o[key];o[path.at(-1)]=undefined;}
export const sourceOracle=JSON.parse(readFileSync(new URL('source-oracle.json',import.meta.url)));
export const keys=Object.keys(sourceOracle);
export function transformRecoveryRows(rows,owner){
 if(owner!=='gjensidigeHusStandard')return rows;
 for(const key of keys)assert.equal(rows.filter(f=>f.key===key).length,1,key);
 return rows.map(f=>{
  const o=sourceOracle[f.key];if(!o)return f;
  assert.equal(f.label,o.label);assert.equal(f.value,o.previous_value);
  assert.deepEqual([f.source.page,f.source.section],o.previous_primary);
  assert.equal(Object.hasOwn(f,'qualificationSource'),false);
  const source={...f.source,page:o.page,section:o.section};
  return {...f,value:o.value,source,...(o.qualification?{qualificationSource:{...source,...o.qualification}}:{})};
 });
}
export function applyRecovery(catalog){const expected=structuredClone(catalog);expected.facts.gjensidigeHusStandard=transformRecoveryRows(expected.facts.gjensidigeHusStandard,'gjensidigeHusStandard');return expected;}
export const expectedCatalog=applyRecovery(baselineCatalog);
