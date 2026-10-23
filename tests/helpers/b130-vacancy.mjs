import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deserialize,serialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';

// Source contract frozen before the production change, not a candidate snapshot.
export const vacancyOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b130-vacancy-f5f88cc/source-oracle.json',import.meta.url)));
const baselineDir=new URL('../../docs/audit/checkpoints/b130-vacancy-f5f88cc/',import.meta.url);
const baselineBytes=readFileSync(new URL('baseline.v8.gz',baselineDir));
assert.equal(createHash('sha256').update(baselineBytes).digest('hex'),JSON.parse(readFileSync(new URL('baseline-identity.json',baselineDir))).baseline_sha256);
// V8 preserves data but can re-encode the same string differently after clone/
// deserialize. Compare the same representation to the independently frozen
// before catalog, retaining undefined fields and the complete catalog contract.
export const vacancyCatalogBaselineHash=createHash('sha256').update(serialize(deserialize(gunzipSync(baselineBytes)).catalog)).digest('hex');
export function vacancyFact(owner,jsonSnapshot=false){
 assert.ok(['gjensidigeHusStandard','gjensidigeHusPluss'].includes(owner));
 const level=owner==='gjensidigeHusStandard'?'Standard':'Pluss';
 return {key:vacancyOracle.key,label:vacancyOracle.label,value:vacancyOracle.value,
  ...(level==='Pluss'?{replacesBase:true}:{}),source:{documentId:owner,filename:`Hus-${level}-alminnelige-vilkar.pdf`,termsNumber:`Hus ${level}`,effectiveFrom:'',company:'Gjensidige',url:`https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,section:vacancyOracle.section,page:2,version:'Alminnelige vilkår',...(jsonSnapshot?{}:{productCode:undefined})}};
}
export function applyVacancy(catalog){
 const expected=structuredClone(catalog);
 for(const owner of ['gjensidigeHusStandard','gjensidigeHusPluss']){
  const rows=expected.facts[owner],fact=vacancyFact(owner,!Object.hasOwn(rows[0].source,'productCode'));
  const existing=rows.filter(f=>f.key===vacancyOracle.key);
  if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);
 }
 return expected;
}

// Project ONLY the independently specified new row when comparing immutable
// older snapshots. Full additions/source fields are tested separately against
// the oracle; every other existing byte/field remains subject to strict equality.
export function withoutVacancy(value){
 const copy=structuredClone(value);
 function visit(item){
  if(Array.isArray(item)){
   for(let i=item.length-1;i>=0;i--){
    const row=item[i];
    if(row?.key===vacancyOracle.key){
     assert.equal(row.value,vacancyOracle.value);
     assert.equal(row.label??row.name,vacancyOracle.label);
     assert.ok(row.source);
     assert.ok(['gjensidigeHusStandard','gjensidigeHusPluss'].includes(row.source.documentId));
     assert.equal(row.source.page,2);assert.equal(row.source.section,vacancyOracle.section);
     item.splice(i,1);
    }else visit(row);
   }
  }else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
