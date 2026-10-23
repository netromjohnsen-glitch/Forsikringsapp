import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independent source contract recorded before production was changed.
export const underinsuranceOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b130-underinsurance-0e4c09d/source-oracle.json',import.meta.url)));
const o=underinsuranceOracle;
export function underinsuranceFact(owner,jsonSnapshot=false){
 assert.ok(['gjensidigeHusStandard','gjensidigeHusPluss'].includes(owner));
 const level=owner==='gjensidigeHusStandard'?'Standard':'Pluss',c=level==='Standard'?o.standard:o.pluss;
 const source={documentId:owner,filename:`Hus-${level}-alminnelige-vilkar.pdf`,termsNumber:`Hus ${level}`,effectiveFrom:'',company:'Gjensidige',url:`https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,section:c.source_section,page:c.source_page,version:'Alminnelige vilkår',...(jsonSnapshot?{}:{productCode:undefined})};
 return {key:o.key,label:o.label,value:o.value,...(level==='Pluss'?{replacesBase:true}:{}),source,qualificationSource:{...source,page:2,section:c.qualification_source_section}};
}
export function applyUnderinsurance(catalog){
 const expected=structuredClone(catalog);
 for(const owner of ['gjensidigeHusStandard','gjensidigeHusPluss']){
  const rows=expected.facts[owner],fact=underinsuranceFact(owner,!Object.hasOwn(rows[0].source,'productCode'));
  const existing=rows.filter(f=>f.key===o.key);
  if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);
 }
 return expected;
}
// Project only this independently specified delta for immutable older snapshots.
// Source/qualifier identity and value are checked before removing any row.
export function withoutUnderinsurance(value){
 const copy=structuredClone(value);
 function checkSource(actual,expected){
  for(const key of Object.keys(expected))if(key!=='productCode')assert.equal(actual[key],expected[key],key);
 }
 function visit(item){
  if(Array.isArray(item)){
   for(let i=item.length-1;i>=0;i--){const row=item[i];
    if(row?.key===o.key){
     assert.equal(row.value,o.value);assert.equal(row.label??row.name,o.label);
     const expected=underinsuranceFact(row.source?.documentId);
     checkSource(row.source,expected.source);
     if(row.qualificationSource)checkSource(row.qualificationSource,expected.qualificationSource);
     else {assert.ok(row.sources);assert.ok(row.sources.some(s=>s.documentId===expected.qualificationSource.documentId&&s.page===2&&s.section===expected.qualificationSource.section));}
     item.splice(i,1);
    }else visit(row);
   }
  }else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
