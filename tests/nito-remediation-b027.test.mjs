import test from 'node:test';
import assert from 'node:assert/strict';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, manual } from './helpers/wave3-catalog-gate.mjs';

// B-027 RC-003/SCRC-056: f565572daa0ba05b; GAP-5324 / SF-7586.
// Own-source oracle: Mini 2.4 page2 and deductible4.3 page4; trailer-only.
const id='eika-fremtind-tilhenger-kasko';
const keys=['tilhenger.redning.dekning','tilhenger.redning.begrensning','tilhenger.redning.egenandel'];
test('R-027-01: original hash, exact provider/object/version and clause provenance',()=>{
  sourceHash('catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf','b858b6444a8dce7b9a6cf184b5e69ebe85eea2a1a1471f39712807a06986dc9a');
  const p=product(id);assert.equal(p.providerId,'eika-fremtind');assert.equal(p.insuranceType,'Tilhenger');assert.equal(p.version,'2024-03-21');
  for(const [i,key] of keys.entries()){const f=fact(id,key);assert.equal(f.source.documentId,'vehicle:fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf');assert.equal(f.source.page,i===2?4:2);assert.equal(f.source.section,i===2?'Minikasko 4.3':'Minikasko 2.4');}
});
test('R-027-02: precise rescue trigger, nearest workshop and accessible road replace generic row',()=>{
  assert.equal(fact(id,keys[0]).value,'Nødvendig transport av tilhenger til nærmeste verksted etter erstatningsmessig skade og/eller driftsstans på normalt fremkommelig vei eller sted uten adkomstrestriksjoner');
  assert.equal(facts(id).filter(f=>f.key===keys[0]).length,1);
});
test('R-027-03: cheaper repair, covered-event boundary and deductible500',()=>{
  assert.equal(fact(id,keys[1]).value,'Reparasjon på stedet skal velges når den er billigere enn redning; transport gjelder bare hendelser som forsikringen omfatter, ikke ordinær service eller vedlikehold');
  assert.equal(fact(id,keys[2]).value,'500 kr');
});
test('R-027-04: no camping glass/moisture or snowmobile rider leakage',()=>{
  assert.ok(facts(id).every(f=>!f.key.startsWith('campingvogn.')&&!f.key.startsWith('snoscooter.')&&!/tilhenger\.(glass|fukt)\./.test(f.key)));
  assert.ok(facts('eika-fremtind-snoscooter-kasko').every(f=>!f.key.startsWith('tilhenger.redning.')));
});
test('R-027-05: same product and side swap retain source-specific trailer rescue',()=>{
  compareBoth(id,['if-tilhenger-kasko','gjensidige-tilhenger-kasko'],keys);
});
test('R-027-06: document value/rejection takes precedence and silent riders stay unselected',()=>{
  documentPriority(id,keys[2],'2 222 kr');documentPriority(id,keys[0],'Ikke valgt');
});
test('R-027-07: manual positive, geography/deductible boundaries and other-provider asymmetry',()=>{
  const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);for(const key of keys)assert.ok(out.importantTerms.some(t=>t.key===key));
  assert.equal(fact(id,'tilhenger.avtale.geografi').value,'Europa, Tyrkia og Israel');assert.equal(fact(id,'tilhenger.avtale.egenandel').value,'Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret');
  assert.ok(facts('if-tilhenger-kasko').every(f=>f.value!==fact(id,keys[0]).value));
});
