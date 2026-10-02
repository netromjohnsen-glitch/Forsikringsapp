import test from 'node:test';
import assert from 'node:assert/strict';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, manual } from './helpers/wave3-catalog-gate.mjs';

// RC-001/SCRC-056: 2aba061e5d8242d5, 532cb1d34c972165, 566b797ec3dd2fdc.
// GAP-5300/5311 SF-7559/7571; GAP-5301/5312 SF-7560/7572;
// GAP-5321 SF-7581. Cloud counterpart to archived B-025 test_plan.
const ids=['eika-fremtind-campingvogn-minikasko','eika-fremtind-campingvogn-kasko'];
const common=['glass.dekning','glass.grense','glass.egenandel','redning.dekning','redning.begrensning','redning.egenandel'].map(k=>'campingvogn.'+k);
const moisture=['fukt.dekning','fukt.alder','fukt.begrensning'].map(k=>'campingvogn.'+k);
test('R-025-01: exact original/hash, Eika scope/version and clause provenance',()=>{
  sourceHash('catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf','b858b6444a8dce7b9a6cf184b5e69ebe85eea2a1a1471f39712807a06986dc9a');
  for(const id of ids){assert.equal(product(id).providerId,'eika-fremtind');assert.equal(product(id).version,'2024-03-21');
    for(const key of common){const f=fact(id,key);assert.equal(f.source.documentId,'vehicle:fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf');assert.match(f.source.section,/Minikasko/);assert.ok([2,3,4].includes(f.source.page));}}
  for(const key of moisture){assert.equal(fact(ids[1],key).source.page,5);assert.equal(fact(ids[1],key).source.section,'Kasko 1.3');}
});
test('R-025-02: roof window, repair600/no deductible and replacement2500/50% remain distinct',()=>{
  for(const id of ids){assert.match(fact(id,common[0]).value,/vindusruter, inkludert takluke.*nye ruter.*repareres/);
    assert.match(fact(id,common[1]).value,/Reparasjon.*600 kr.*skifte.*50 %.*markedsverdi/);
    assert.equal(fact(id,common[2]).value,'Ingen egenandel ved reparasjon (erstatning inntil 600 kr); 2 500 kr ved skifte');}
});
test('R-025-03: assistance trigger, access, cheaper repair and deductible',()=>{
  for(const id of ids){assert.match(fact(id,common[3]).value,/nærmeste verksted.*skade og\/eller driftsstans.*uten adkomstrestriksjoner/);
    assert.match(fact(id,common[4]).value,/billigere.*service, vedlikehold.*dekkes ikke/);assert.equal(fact(id,common[5]).value,'500 kr');}
});
test('R-025-04: Kasko-only moisture needs annual approved test and valid policy period',()=>{
  assert.match(fact(ids[1],moisture[0]).value,/tak, vegger og gulv.*godkjent og bestått.*autorisert caravanforhandler/);
  assert.match(fact(ids[1],moisture[1]).value,/etter 15 år.*registrering som fabrikkny/);
  assert.match(fact(ids[1],moisture[2]).value,/inntil 1 år.*ny kontroll.*utenfor forsikringsperioden dekkes ikke/);
  assert.ok(facts(ids[0]).every(f=>!f.key.startsWith('campingvogn.fukt.')));
  assert.ok(facts('eika-fremtind-tilhenger-kasko').every(f=>!f.key.startsWith('tilhenger.fukt.')&&!f.key.startsWith('tilhenger.glass.')));
});
test('R-025-05: same product and reversed comparison preserve qualified source facts',()=>{
  for(const id of ids)compareBoth(id,['if-campingvogn-kasko',...ids.filter(x=>x!==id)],id===ids[1]?[...common,...moisture]:common);
});
test('R-025-06: explicit document deductible/rejection wins without selecting riders',()=>{
  for(const id of ids){documentPriority(id,'campingvogn.glass.egenandel','1 111 kr');documentPriority(id,'campingvogn.redning.dekning','Ikke valgt');}
});
test('R-025-07: manual route and held-out geography/selected-sum boundary',()=>{
  for(const id of ids){const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);
    for(const key of common)assert.ok(out.importantTerms.some(t=>t.key===key));
    assert.equal(fact(id,'campingvogn.avtale.geografi').value,'Europa, Tyrkia og Israel');
    assert.equal(fact(id,'campingvogn.losore.grense').value,'10 000 kr per gjenstand; samlet sum fremgår av forsikringsbeviset');}
});
