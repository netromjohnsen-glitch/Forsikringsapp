import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const waterOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b051-water-25004-cd6e03d/source-oracle.json',import.meta.url)));
export function waterFact(owner,jsonSnapshot=false){
 const level=owner==='gjensidigeHusStandard'?'Standard':'Pluss';
 return {key:waterOracle.key,label:waterOracle.label,value:waterOracle.value,
  ...(level==='Pluss'?{replacesBase:true}:{}),source:{documentId:owner,filename:`Hus-${level}-alminnelige-vilkar.pdf`,termsNumber:`Hus ${level}`,effectiveFrom:'',company:'Gjensidige',url:`https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,section:waterOracle.section,page:3,version:'Alminnelige vilkår',...(jsonSnapshot?{}:{productCode:undefined})}};
}
// Source-bound addition to active historical harness expectations. Existing rows
// are untouched; an already applied addition must match all independent fields.
export function transformWaterRows(rows,owner){
 if(!['gjensidigeHusStandard','gjensidigeHusPluss'].includes(owner))return rows;
 const expected=waterFact(owner,!Object.hasOwn(rows[0].source,'productCode'));
 const existing=rows.filter(f=>f.key===waterOracle.key);
 if(existing.length){assert.deepEqual(existing,[expected]);return rows;}
 return [...rows,expected];
}
export function applyWater(catalog){
 const out=structuredClone(catalog);
 for(const owner of ['gjensidigeHusStandard','gjensidigeHusPluss']){
  out.facts[owner]=transformWaterRows(out.facts[owner],owner);
 }
 return out;
}
