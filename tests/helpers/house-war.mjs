import {applySmartDetails,withoutSmartDetails} from './house-smart-details.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Source contract and all expected references sealed before the production edit.
export const warOracle=JSON.parse(readFileSync(new URL('../../docs/audit/checkpoints/house-war-5d38b87/source-oracle.json',import.meta.url)));
const o=warOracle,owners=['gjensidigeHusStandard','gjensidigeHusPluss'],clean=x=>JSON.parse(JSON.stringify(x));
function reference(s,jsonSnapshot){
 return {documentId:s.documentId,filename:s.filename,termsNumber:s.termsNumber,effectiveFrom:s.effectiveFrom,
  company:s.company,url:s.url,section:s.section,page:s.page,version:s.version,
  ...(jsonSnapshot?{}:{productCode:undefined}),...(s.note?{note:s.note}:{})};
}
export function warFact(owner,key,jsonSnapshot=false){
 const expected=o.facts.find(p=>p.owner===owner&&p.fact.key===key)?.fact;assert.ok(expected);
 return {key:expected.key,label:expected.label,value:expected.value,...(expected.replacesBase?{replacesBase:true}:{}),
  source:reference(expected.source,jsonSnapshot),...(expected.qualificationSource?{qualificationSource:reference(expected.qualificationSource,jsonSnapshot)}:{})};
}
export function warSources(fact,manual=false){
 const refs=[fact.source,...(fact.qualificationSource?[fact.qualificationSource]:[])];
 return manual?refs.map((source,i)=>({...source,note:i===0
  ?[source.note,fact.replacesBase?'Effektiv verdi fra dokumentert utvidelse eller tillegg':undefined].filter(Boolean).join(' · ')||undefined
  :[source.note,'Supplerende kilde for faktumets anvendelse'].filter(Boolean).join(' · ')})):refs;
}
export function applyWar(catalog){
 const copy=structuredClone(catalog);
 for(const owner of owners)for(const key of o.keys){const rows=copy.facts[owner],fact=warFact(owner,key,!Object.hasOwn(rows[0].source,'productCode')),existing=rows.filter(f=>f.key===key);if(existing.length)assert.deepEqual(existing,[fact]);else rows.push(fact);}
 return applySmartDetails(copy);
}
// Check exact own-provider contract before projecting the two approved point17 additions.
// Shared other-provider keys and customer-document rules are never projected.
export function withoutWar(value){
 const copy=withoutSmartDetails(value);
 function visit(item){
  if(Array.isArray(item))for(let i=item.length-1;i>=0;i--){const row=item[i];
   if(o.keys.includes(row?.key)&&owners.includes(row.source?.documentId)){
    const fact=warFact(row.source.documentId,row.key,!Object.hasOwn(row.source,'productCode'));
    assert.equal(row.value,fact.value);assert.equal(row.label??row.name,fact.label);assert.deepEqual(clean(row.source),clean(fact.source));
    for(const field of ['structuredValue','coverageAvailability','deductibleClassification'])assert.equal(row[field],undefined);
    if(row.sources){const actual=JSON.stringify(clean(row.sources));assert.ok([false,true].some(manual=>actual===JSON.stringify(clean(warSources(fact,manual)))),'complete raw or established manual source references');}
    if(Object.hasOwn(row,'label'))assert.deepEqual(row,fact);
    if(row.overriddenBase)assert.deepEqual(clean(row.overriddenBase),fact.replacesBase?[{value:fact.value,source:clean(warFact(owners[0],row.key).source)}]:[]);
    item.splice(i,1);
   }else visit(row);
  }else if(item&&typeof item==='object')for(const child of Object.values(item))visit(child);
 }
 visit(copy);return copy;
}
