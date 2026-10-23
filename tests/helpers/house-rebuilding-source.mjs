import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independently recorded original paragraphs and exact before source identities.
export const rebuildingSourceOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-rebuilding-sources-39b63c1/source-oracle.json',import.meta.url)));
export const rebuildingSourceKeys=rebuildingSourceOracle.keys;
function project(value,page){
 const copy=structuredClone(value);
 function sourceTree(item,expected){
  if(!item||typeof item!=='object')return;
  if(item.documentId===expected.documentId&&Object.hasOwn(item,'page')){
   for(const [key,value] of Object.entries(expected))if(key!=='page')assert.equal(item[key],value,key);
   assert.ok(item.page===17||item.page===16,'Only the approved shared rebuilding page17-to16 delta can be projected');
   item.page=page;
  }
  for(const child of Object.values(item))sourceTree(child,expected);
 }
 function visit(item){
  if(!item||typeof item!=='object')return;
  const expected=rebuildingSourceOracle.source_before.find(f=>f.key===item.key);
  if(expected)sourceTree(item,expected.source);
  else for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
// Compatibility only: direct source tests separately require current page16.
export const withRebuildingSourcePage=value=>project(value,16);
export const withOriginalRebuildingSourcePage=value=>project(value,17);
