import test from 'node:test';
import assert from 'node:assert/strict';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, manual } from './helpers/wave3-catalog-gate.mjs';

// B-026 RC-002/SCRC-056: 3b2827e82907124b, 8e51d2bd3733005e, b74fed60e3293733.
// GAP-5265/5272/5286 SF-7515/7524/7542; GAP-5274/5288 SF-7526/7544;
// GAP-5297 SF-7555. Independent oracle: archived full terms pages 4, 7–10.
const ids=['eika-fremtind-snoscooter-ansvar','eika-fremtind-snoscooter-minikasko','eika-fremtind-snoscooter-kasko'];
const legal=['snoscooter.rettshjelp.dekning','snoscooter.rettshjelp.grense','snoscooter.rettshjelp.egenandel'];
const equipment=['snoscooter.utstyr.dekning','snoscooter.utstyr.grense'];
test('R-026-01: exact original/hash, provider/type/version and per-clause provenance',()=>{
  sourceHash('catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf','2103322d55713ff007aec488ffd3cc09ebd35d88ded5904314226f48c36915bb');
  for(const id of ids){assert.equal(product(id).providerId,'eika-fremtind');assert.equal(product(id).insuranceType,'Snøscooter');assert.equal(product(id).version,'2023-10-29');
    const keys=[...legal,...(id!==ids[0]?equipment:[]),...(id===ids[2]?['snoscooter.kasko.egenandel']:[])];
    for(const key of keys){const f=fact(id,key);assert.equal(f.source.documentId,'vehicle:fremtind-Vilkar_Kasko_Snoscooter.pdf');assert.ok([4,7,8,9,10].includes(f.source.page));}}
});
test('R-026-02: legal subject, geography, former owner and separate financial caps',()=>{
  for(const id of ids){assert.match(fact(id,legal[0]).value,/personlig eier.*rettmessig bruker\/fører.*Norden.*tidligere eier.*salget/);
    assert.equal(fact(id,legal[1]).value,'Inntil sikredes økonomiske interesse, maksimalt 100 000 kr per tvist; kan utvides til 250 000 kr ved minst tre parter på sikredes side (ektefeller/samboere regnes som én part). Finansklagenemnda: inntil 15 000 kr; forliksråd/jordskifterett: inntil 25 000 kr. Sakkyndige som ikke er oppnevnt av retten: inntil 20 % av forsikringssummen');
    assert.match(fact(id,legal[2]).value,/forsikringsbeviset.*20 %.*advokat og sakkyndig.*Én egenandel per tvist/);
    assert.equal(facts(id).filter(f=>f.key===legal[0]).length,1);}
});
test('R-026-03: equipment only Mini/Kasko, 10000 applies to mounted equipment, no invented riding-gear sum',()=>{
  for(const id of ids.slice(1)){assert.match(fact(id,equipment[0]).value,/seriemessig.*ekstra dekk og felger.*brannslokningsapparat.*førstehjelpsutstyr.*kjøreutstyr/);
    assert.equal(fact(id,equipment[1]).value,'Fastmontert tilleggsutstyr: inntil 10 000 kr; egen sum for kjøreutstyr er ikke oppgitt i vilkåret');assert.equal(fact(id,equipment[0]).source.page,4);}
  assert.ok(facts(ids[0]).every(f=>!f.key.startsWith('snoscooter.utstyr.')));
});
test('R-026-04: Kasko under23 undisclosed driver adds12000, no veteran animal reduction',()=>{
  const f=fact(ids[2],'snoscooter.kasko.egenandel');assert.equal(f.source.page,7);assert.equal(f.source.section,'Kasko 3.1');
  assert.equal(f.value,'Egenandel fremgår av forsikringsbeviset; økes med 12 000 kr når fører er under 23 år ved skaden og bruk av fører under 23 år ikke er opplyst');assert.doesNotMatch(f.value,/\b2 000\b|\bdyr\b|\bveteran\b/);
  for(const id of ids.slice(0,2))assert.ok(facts(id).every(f=>f.key!=='snoscooter.kasko.egenandel'));
});
test('R-026-05: same product and side swap preserve level-specific facts',()=>{
  for(const id of ids)compareBoth(id,['if-snoscooter-kasko',...ids.filter(x=>x!==id)],[...legal,...(id!==ids[0]?equipment:[]),...(id===ids[2]?['snoscooter.kasko.egenandel']:[])]);
});
test('R-026-06: document values and rejection win, silent optional not selected',()=>{
  for(const id of ids){documentPriority(id,legal[1],'77 777 kr');documentPriority(id,legal[0],'Ikke valgt');}
  documentPriority(ids[2],'snoscooter.kasko.egenandel','3 333 kr');
});
test('R-026-07: manual positives preserve price/geography/season and object/provider negatives',()=>{
  for(const id of ids){const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);for(const key of legal)assert.ok(out.importantTerms.some(t=>t.key===key));
    assert.equal(fact(id,'snoscooter.avtale.geografi').value,'Norden; lovpliktig ansvar gjelder også hele EØS');assert.match(fact(id,'snoscooter.avtale.sesong').value,/Sesongvariert pris/);}
  for(const id of ['eika-fremtind-campingvogn-kasko','eika-fremtind-tilhenger-kasko','if-snoscooter-kasko'])assert.ok(facts(id).every(f=>!f.value.includes('økes med 12 000 kr')));
});
