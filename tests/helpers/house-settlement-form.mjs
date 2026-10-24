import {applyGardenImport,withoutGardenImport} from './house-garden-import.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Approved source contract frozen before production changed; never derive from candidate.
export const settlementOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-settlement-form-6d42440/source-oracle.json',import.meta.url)));
const o=settlementOracle,owners=['gjensidigeHusStandard','gjensidigeHusPluss'];
export function settlementFact(owner,jsonSnapshot=false){
 assert.ok(owners.includes(owner));const f=o.facts[owners.indexOf(owner)],s=f.source;
 // Oracle JSON is sorted for sealing; restore the established raw-fact field order.
 // Earlier fingerprint controls hash JSON bytes, including this representation.
 return {key:f.key,label:f.label,value:f.value,...(f.replacesBase?{replacesBase:true}:{}),source:{
  documentId:s.documentId,filename:s.filename,termsNumber:s.termsNumber,effectiveFrom:s.effectiveFrom,
  company:s.company,url:s.url,section:s.section,page:s.page,version:s.version,
  ...(jsonSnapshot?{}:{productCode:undefined}),
 }};
}
export function applySettlement(catalog){
 const copy=structuredClone(catalog);
 for(const owner of owners){const rows=copy.facts[owner],fact=settlementFact(owner,!Object.hasOwn(rows[0].source,'productCode'));
  const existing=rows.filter(f=>f.key===o.key);if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);
 }
 return applyGardenImport(copy);
}
// Remove only exact approved Gjensidige additions for immutable earlier snapshots.
// Other providers sharing the same key and customer document rules are preserved.
export function withoutSettlement(value){
 const copy=withoutGardenImport(value);
 function visit(item){
  if(Array.isArray(item)){
   for(let i=item.length-1;i>=0;i--){const row=item[i];
    if(row?.key===o.key&&owners.includes(row.source?.documentId)){
     const expected=settlementFact(row.source.documentId);assert.equal(row.value,o.value);assert.equal(row.label??row.name,o.label);
     for(const [key,value]of Object.entries(expected.source))if(key!=='productCode')assert.equal(row.source[key],value,key);
     if(row.sources){assert.equal(row.sources.length,1);for(const [key,value]of Object.entries(expected.source))if(key!=='productCode')assert.equal(row.sources[0][key],value,key);}
     if(Object.hasOwn(row,'label'))assert.deepEqual(row,settlementFact(row.source.documentId,!Object.hasOwn(row.source,'productCode')));
     item.splice(i,1);
    }else visit(row);
   }
  }else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
