import {withRebuildingSourcePage,withOriginalRebuildingSourcePage} from './house-rebuilding-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Independently frozen page decision and source identity, before production edit.
export const buildingsSourceOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-buildings-source-1b5b5aa/source-oracle.json',import.meta.url)));
const o=buildingsSourceOracle;
// Two further keys approved against the same original object table on fresh a563c50.
export const buildingsSourceKeys=[o.key,'hus.bygninger.tilbehor','hus.teknisk.solceller'];
function project(value,page){
 const copy=structuredClone(value);
 function sourceTree(item){
  if(!item||typeof item!=='object')return;
  if(item.documentId===o.source_before.documentId&&Object.hasOwn(item,'page')){
   for(const [key,value] of Object.entries(o.source_before))if(key!=='page')assert.equal(item[key],value,key);
   assert.ok(item.page===2||item.page===3,'Only the independently approved page2-to3 delta can be projected');
   item.page=page;
  }
  for(const child of Object.values(item))sourceTree(child);
 }
 function visit(item){
  if(!item||typeof item!=='object')return;
  if(buildingsSourceKeys.includes(item.key))sourceTree(item);
  else for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
// Keep immutable snapshots unchanged. Both directions preserve every other field.
// Dedicated source/delta tests require current production page3; projection is
// only for exact equality with older page2 fixtures, never source admission.
export const withBuildingsSourcePage = value => project(withRebuildingSourcePage(value),3);
export const withOriginalBuildingsSourcePage = value => project(withOriginalRebuildingSourcePage(value),2);
