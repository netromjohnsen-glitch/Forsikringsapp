import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independent six-group source contract, recorded before the production edit.
export const personScopeOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/b130-person-scope-cfada9a/source-oracle.json',import.meta.url)));
const o=personScopeOracle;
export function personScopeFact(owner,jsonSnapshot=false){
 assert.ok(['gjensidigeHusStandard','gjensidigeHusPluss'].includes(owner));
 const level=owner==='gjensidigeHusStandard'?'Standard':'Pluss';
 return {key:o.key,label:o.label,value:o.value,...(level==='Pluss'?{replacesBase:true}:{}),source:{documentId:owner,filename:`Hus-${level}-alminnelige-vilkar.pdf`,termsNumber:`Hus ${level}`,effectiveFrom:'',company:'Gjensidige',url:`https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,section:o.section,page:3,version:'Alminnelige vilkår',...(jsonSnapshot?{}:{productCode:undefined})}};
}
export function applyPersonScope(catalog){
 const expected=structuredClone(catalog);
 for(const owner of ['gjensidigeHusStandard','gjensidigeHusPluss']){
  const rows=expected.facts[owner],fact=personScopeFact(owner,!Object.hasOwn(rows[0].source,'productCode'));
  const existing=rows.filter(f=>f.key===o.key);
  if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);
 }
 return expected;
}
// Only this approved delta is projected out of immutable older snapshots.
// Complete new rows/provenance are independently checked by the scoped suite.
export function withoutPersonScope(value){
 const copy=structuredClone(value);
 function visit(item){
  if(Array.isArray(item)){
   for(let i=item.length-1;i>=0;i--){const row=item[i];
    if(row?.key===o.key){
     assert.equal(row.value,o.value);assert.equal(row.label??row.name,o.label);
     const expected=personScopeFact(row.source?.documentId);
     for(const key of Object.keys(expected.source))if(key!=='productCode')assert.equal(row.source[key],expected.source[key]);
     if(row.sources)assert.ok(row.sources.some(s=>s.documentId===expected.source.documentId&&s.page===3&&s.section===o.section));
     item.splice(i,1);
    }else visit(row);
   }
  }else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
