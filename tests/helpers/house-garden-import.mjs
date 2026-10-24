import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independent contract/originals frozen before the production edit.
export const gardenImportOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-garden-import-83c8fee/source-oracle.json',import.meta.url)));
const o=gardenImportOracle,owners=['gjensidigeHusStandard','gjensidigeHusPluss'];
export function gardenImportFact(owner,key,jsonSnapshot=false){
 assert.ok(owners.includes(owner));const row=o.rows.find(row=>row.key===key);assert.ok(row);
 const level=owner==='gjensidigeHusStandard'?'Standard':'Pluss',ref=row[level];
 return {key:row.key,label:row.label,value:row.value,...(ref.replacesBase?{replacesBase:true}:{}),source:{
  documentId:owner,filename:`Hus-${level}-alminnelige-vilkar.pdf`,termsNumber:`Hus ${level}`,effectiveFrom:'',company:'Gjensidige',
  url:`https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,section:row.source_section,page:ref.page,version:'Alminnelige vilkår',...(jsonSnapshot?{}:{productCode:undefined}),
 }};
}
export function applyGardenImport(catalog){
 const copy=structuredClone(catalog);
 for(const owner of owners)for(const key of o.keys){const rows=copy.facts[owner],fact=gardenImportFact(owner,key,!Object.hasOwn(rows[0].source,'productCode')),existing=rows.filter(f=>f.key===key);if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);}
 return copy;
}
// Guard exact provider/key/value/source before projecting the four approved rows.
// Keep Tryg's shared garden key and individual customer-document rules untouched.
export function withoutGardenImport(value){
 const copy=structuredClone(value);
 function visit(item){
  if(Array.isArray(item))for(let i=item.length-1;i>=0;i--){const row=item[i];
   if(o.keys.includes(row?.key)&&owners.includes(row.source?.documentId)){
    const expected=gardenImportFact(row.source.documentId,row.key);assert.equal(row.value,expected.value);assert.equal(row.label??row.name,expected.label);
    for(const [key,value]of Object.entries(expected.source))if(key!=='productCode')assert.equal(row.source[key],value,key);
    if(row.sources){assert.equal(row.sources.length,1);for(const [key,value]of Object.entries(expected.source))if(key!=='productCode')assert.equal(row.sources[0][key],value,key);}
    if(Object.hasOwn(row,'label'))assert.deepEqual(row,gardenImportFact(row.source.documentId,row.key,!Object.hasOwn(row.source,'productCode')));
    item.splice(i,1);
   }else visit(row);
  }
  else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
