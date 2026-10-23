import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independent ordinary three-bullet source review; Smart rules are separate.
export const safeguardSourceOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-safeguard-source-d4bcc45/source-oracle.json',import.meta.url)));
const o=safeguardSourceOracle;
function project(value,page){
 const copy=structuredClone(value);
 function sourceTree(item){
  if(!item||typeof item!=='object')return;
  if(item.documentId===o.source_before.source.documentId&&Object.hasOwn(item,'page')){
   for(const [key,value] of Object.entries(o.source_before.source))if(key!=='page')assert.equal(item[key],value,key);
   assert.ok(item.page===18||item.page===17,'Only the approved ordinary safeguard page18-to17 delta can be projected');
   item.page=page;
  }
  for(const child of Object.values(item))sourceTree(child);
 }
 function visit(item){
  if(!item||typeof item!=='object')return;
  if(item.key===o.key)sourceTree(item);
  else for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
// Historical compatibility only; direct tests require actual current page17.
export const withSafeguardSourcePage=value=>project(value,17);
export const withOriginalSafeguardSourcePage=value=>project(value,18);
