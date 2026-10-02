import test from 'node:test';
import assert from 'node:assert/strict';
import { productCatalog, resolveCatalogFacts, findCatalogProductBySelection } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { product, fact, sourceHash, compareBoth, documentPriority, manual, date } from './helpers/wave3-catalog-gate.mjs';

// B-029 RC-005/SCRC-053:13 P1 /24 occurrences; B-002 artwork is prerequisite.
// Own frozen source oracle: IPID1; Topp1; Standard3–7; Nature12–13;
// optional Rot1 and SB1/DNB official deductible FAQ. No new canonical key.
const ids=['fremtind-hus-standard','fremtind-hus-topp'];
const addon='fremtind-hus-rate-insekter';
const rot=id=>resolveCatalogFacts(product(id),[addon],date).find(f=>f.key==='hus.rate.dekning');
const common=['avtale.ipid','bygninger.dekning','bygninger.tilbehor','rydding.dekning','plutselig.dekning','naturskade.dekning','gjenoppforing.hovedregel','gjenoppforing.annetsted','gjenoppforing.markedsverdi','aldersfradrag.utvendige_ledninger','egenandel.generell'].map(k=>'hus.'+k);
test('R-029-01: exact source hashes and provider/type/ordinary/version',()=>{
 const root='catalog/sources/fremtind/hus/canonical/';
 for(const [file,hash]of [['IPID_Hus.pdf','62be21f187b55d5d7f5697c74cbf7669167465d96a50ee6c25d326dd6b5facc4'],['Vilkar_Topp_Hus.pdf','6c77bd57259d8d01390bccaf415f14f6b245e45345b597b6f651574ebaeebec3'],['Vilkar_Sopp_og_Rate_valgbar.pdf','036537b5fba6c097cb3ecc93e269a84ed89bd044227b1224cc11aeb29556b245'],['SpareBank1-husforsikring.html','eca5cd4c869448d7387b61ba95f87d9758f8e82869a4641788da415a1b82a1a1'],['DNB-husforsikring.html','99e67d03814eaeb74b2c7cfa2d26d6099c36bf9bf841b080de8d0fdbae92976b']])sourceHash(root+file,hash);
 for(const id of ids){assert.equal(product(id).providerId,'fremtind');assert.equal(product(id).insuranceType,'Hus');assert.equal(product(id).agreementScope??'ordinary','ordinary');assert.equal(product(id).version,'PBK-200.100-015+PBK-200.200-010');}
});
test('R-029-02 GAP-5074/5107: permanent home, no business/three sections, vacant fire/nature only',()=>{
 for(const id of ids){const f=fact(id,common[0]);assert.equal(f.source.documentId,'fremtindHusIpid');assert.equal(f.source.page,1);assert.match(f.value,/permanent bolig.*Næringsvirksomhet.*tre eller flere eierseksjoner.*fraflyttet\/ubebodd.*bare for brann og naturskade/);}
});
test('R-029-03 GAP-5076/5109: temporary materials Norway, small buildings fire/nature, B002 artwork unchanged',()=>{
 for(const id of ids){for(const key of common.slice(1,3)){const f=fact(id,key);assert.equal(f.source.page,3);assert.equal(f.source.documentId,'fremtindHusStandard');assert.match(f.value,/bygningsmaterialer|Bygningsmaterialer/);assert.match(f.value,/midlertidig.*bygning\/container i Norge.*forsikret bygning/);}
  assert.match(fact(id,common[1]).value,/10 m² BTA.*bare brann- og naturskade/);}
 assert.equal(fact(ids[0],'hus.bygninger.utsmykning').value,'Kunstnerisk utsmykning er unntatt på Standard.');assert.equal(fact(ids[0],'hus.bygninger.utsmykning').coverageAvailability,'unavailable');
 assert.equal(fact(ids[1],'hus.bygninger.utsmykning').value,'Kunstnerisk utsmykning av bygningen omfattes.');assert.equal(fact(ids[1],'hus.bygninger.utsmykning').source.page,1);
});
test('R-029-04 GAP-5079/5112: necessary clearing firstloss20%, normal-period SSB increase, moving/storage',()=>{
 for(const id of ids){const f=fact(id,common[3]);assert.equal(f.source.page,3);assert.match(f.source.section,/5\.5\.3 side 7/);assert.match(f.value,/Nødvendige.*førsterisiko.*20 %.*normal gjenoppførings-\/reparasjonstid.*skadedagen.*SSB.*flytting og lagring/);}
});
test('R-029-05 GAP-5084/5117: sudden physical damage retains specific construction, object and renter exclusions',()=>{
 for(const id of ids){const f=fact(id,common[4]);assert.equal(f.source.page,4);for(const text of ['foregående skadepunkter','fundamentering','setninger','jordtrykk','frost/tele','mekanisk svikt','leieboers/husstandens skadeverk','isolerglass','basseng/boblebad','brygge/flytebrygge','takrenne/snøfanger','bunnforankringen'])assert.ok(f.value.includes(text),text);}
});
test('R-029-06 GAP-5085/5118: nature extension requires fixed antenna/awning, excludes mooring/displacement alone',()=>{
 for(const id of ids){const f=fact(id,common[5]);assert.equal(f.source.page,4);assert.match(f.value,/ferdig monterte og fastboltede antenner\/markiser.*flytebrygge.*fortøyning\/moring og bare forskyvning.*unntatt/);}
});
test('R-029-07 GAP-5087/5120: rebuild owner/spouse/heir fiveyears,40% versus all increase/no rebuild',()=>{
 for(const id of ids){assert.match(fact(id,common[6]).value,/fem år.*eier.*ektefelle\/samboer.*livsarving.*samme sted\/formål.*myndighetsnektelse.*samme kommune/);
  assert.match(fact(id,common[7]).value,/annet sted\/formål.*innen fem år.*40 %.*Ingen gjenoppføring.*andre.*all verdiøkning.*markedsverdifallet/);}
});
test('R-029-08 GAP-5088/5121: home purchase min replacement exVAT/marketplus40%, nested1million and two separate deadlines',()=>{
 for(const id of ids){const f=fact(id,common[8]);assert.equal(f.source.page,5);assert.match(f.value,/Norge.*samme formål.*innen to år.*laveste.*eksklusiv MVA.*omsetningsverdi før skade.*40 %.*Innenfor denne summen.*1 000 000.*innen to år etter overtakelse.*Påbud og prisstigning dekkes ikke.*husleietap.*overtakelse/);}
});
test('R-029-09 GAP-5090/5123: all12 consolidated age rows keep rates/max80, plastic exception qualified separately',()=>{
 const expected={utvendige_ledninger:[20,5],tanker_kummer:[20,5],basseng_boblebad:[5,10],berg_jordvarmepumpe:[7,10],luftvarmepumpe:[5,10],bereder_pumpe:[5,5],varmekabler:[10,10],integrerte_hvitevarer:[5,10],solceller:[20,5],smarthus:[5,10]};
 for(const id of ids){for(const [component,[freeYears,annualPercent]]of Object.entries(expected)){const f=fact(id,'hus.aldersfradrag.'+component);assert.equal(f.source.page,6);assert.equal(f.structuredValue.freeYears,freeYears);assert.equal(f.structuredValue.annualPercent,annualPercent);assert.equal(f.structuredValue.maximumPercent,80);assert.equal(f.structuredValue.yearBasis,'started_year');assert.equal(f.deductibleClassification,undefined);}
  const f=fact(id,common[9]);assert.match(f.value,/utvendige.*bunnledninger|Utvendige.*bunnledninger/);assert.match(f.value,/annet enn plast.*sjø-\/jordvarmeledning følger egen rad/);assert.deepEqual(f.structuredValue.exceptions,['Plastrør er unntatt fra tabellradene for utvendige ledninger og bunnledninger']);}
});
test('R-029-10 GAP-5099/5132: nature5dekar and exclusions, building ban land-before-loss plus total building',()=>{
 for(const id of ids){const f=fact(id,common[5]);assert.match(f.source.section,/12–13/);assert.match(f.value,/brannforsikrede objekter i Norge.*fem dekar.*frost, tele, tørke, nedbør, snøtyngde og isgang.*byggenekt.*omsetningsverdi før skade.*fem dekar.*hus\/forsikrede uthus som totalskadet.*ustabil grunn.*selv om huset ikke er skadet/);}
});
test('R-029-11 GAP-5100/5138: chosen rot rider has roofing/log/cosmetic/access/period restrictions',()=>{
 for(const id of ids){const f=rot(id);assert.ok(f);assert.equal(f.source.documentId,'fremtindHusRot');assert.equal(f.source.page,1);for(const text of ['fullverdiforsikret','ekte hussopp','jordslag','skjemmende','taksperre/overgurt','dører/vinduer/lekter','utvendig treverk','laftede','før-/etterperiodisk','Tilkomstkostnader','ikke er erstatningsmessig'])assert.ok(f.value.includes(text),text);}
});
test('R-029-12 GAP-5104/5142:6000–25000 choice qualification never populates actual deductible',()=>{
 for(const id of ids){const f=fact(id,common[10]);assert.equal(f.deductibleClassification,'reference');assert.equal(f.source.documentId,'fremtindHusStandard');assert.equal(f.source.page,7);assert.match(f.value,/forsikringsbeviset.*SpareBank 1 og DNB.*6 000.*25 000.*ikke kundens faktiske egenandel/);assert.equal(f.qualificationSource.documentId,'fremtindHusSpareBank1Channel');assert.match(f.qualificationSource.note,/99e67d03814eaeb74b2c7cfa2d26d6099c36bf9bf841b080de8d0fdbae92976b/);assert.equal(manual(id).deductible,null);}
});
test('R-029-13 GAP-5134: Topp animals require fullvalue/activity/actual damage, no prior activity/cosmetics/cleaning',()=>{
 const damage=fact(ids[1],'hus.skadedyr.bygningsskade'),combat=fact(ids[1],'hus.skadedyr.bekjempelse');assert.match(damage.value,/Fysisk skade, svekket isolasjonsevne og lukt.*fullverdiforsikret.*før avtalen.*skjemmende.*uten påvist redusert isolasjonsevne.*uten bygningsskade.*kjæledyr, insekter og bakterier/);assert.match(combat.value,/påvist aktivitet.*velger metode og skadedyrsfirma.*før avtalen.*uten bygningsskade/);assert.equal(damage.replacesBase,true);assert.match(fact(ids[0],damage.key).value,/unntatt på Standard/);
});
test('R-029-14 GAP-5135: Topp wetroom contractor qualification, timely claim/bankruptcy10years and exclusions',()=>{
 const f=fact(ids[1],'hus.vatrom.selverommet');assert.equal(f.source.page,1);assert.equal(f.source.section,'2.3');assert.match(f.value,/godkjent\/autorisert.*teknisk forskrift.*ti år.*utenfor reklamasjonstiden.*innenfor.*konkurs.*rettidig reklamasjon.*Selve feilen.*kjent feil.*eget arbeid.*udokumentert/);assert.equal(f.replacesBase,true);assert.match(fact(ids[0],f.key).value,/unntatt på Standard/);
});
test('R-029-15: same-product/side-swap preserve exact detail values, optional and unavailable roles',()=>{
 for(const id of ids)compareBoth(id,['if-hus-super',...ids.filter(x=>x!==id)],common);
 const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);const a=rows(ids[0],ids[1]).find(r=>r.key==='hus.bygninger.utsmykning'),b=rows(ids[1],ids[0]).find(r=>r.key===a.key);assert.equal(a.first.state,'unavailable');assert.equal(a.second.state,'included');assert.deepEqual(a.first,b.second);
});
test('R-029-16: explicit document facts/rejection and actual deductible win, no inferred add-ons',()=>{
 for(const id of ids){documentPriority(id,'hus.egenandel.generell','9 999 kr');documentPriority(id,'hus.naturskade.dekning','Ikke valgt');documentPriority(id,'hus.bygninger.dekning','Kundens avtalte bygning');assert.equal(manual(id).addOnIds.length,0);}
});
test('R-029-17: optional rot and cross-provider/type/scope boundaries remain intact',()=>{
 for(const id of ids){assert.match(fact(id,'hus.rate.dekning').value,/unntatt uten valgfri/);assert.ok(productCatalog.addOns.find(a=>a.id===addon).requiresLevel.includes(id));}
 assert.throws(()=>resolveCatalogFacts(product('if-hus-super'),[addon],date),/tilleggsdekning/);assert.throws(()=>resolveCatalogFacts(product('fremtind-bobil-kasko'),[addon],date),/tilleggsdekning/);
 for(const scope of ['nito','lofavor','ordinary-dnb'])assert.equal(findCatalogProductBySelection('Fremtind','Hus','Topp',scope),null);
});
test('R-029-18: held-out rental/insurance-form/totalskade/deductible/price controls unchanged',()=>{
 for(const id of ids){const out=manual(id);assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);assert.deepEqual(fact(id,'hus.forsikringsform').structuredValue.forms,['full_value','first_loss']);assert.match(fact(id,'hus.vann.egenandel.gjentatt_vann').value,/20 000.*24 måneder/);assert.match(fact(id,'hus.naturskade.egenandel').value,/8 000/);}
 assert.match(fact(ids[1],'hus.gjenoppforing.totalskade').value,/75 %.*to år/);assert.equal(fact(ids[0],'hus.hage.basseng').value,'Utvendig basseng og boblebad med ledninger inntil 200 000 kroner.');assert.equal(fact(ids[1],'hus.hage.basseng').value,'Utvendig basseng og boblebad med ledninger inntil 500 000 kroner.');
});
