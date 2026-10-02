import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, findCatalogProduct } from '../lib/product-catalog.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { product, facts, fact, sourceHash, compareBoth, documentPriority, enrich, manual } from './helpers/wave3-catalog-gate.mjs';

const ids=['frende-campingvogn-brann-og-tyveri','frende-campingvogn-kasko'];
const pdf='vehicle:frende-CaravanInsurance.pdf',web='vehicle:frende-campingvognforsikring.html';
const hashes={
  [pdf]:'088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88',
  [web]:'14db91b9abaed2a8ffc923f72522a62c3a9d127056193d84ef7c3cb29ec84fba',
};
const signatures=['03045d2456be525b','1854cec0050b708e','20858a4a4e18762e','3f9c134a90c83677','459beaec02408da0','514f10567e4faf88','56b80af118b2eea8','7a8eb54ff6d90565','7ad5ef4794a0fdf9','a4b40cdbb03a527f','b87d6cb9533f0229','d0466a1fdaabe26f','eac8a06e022194f2','ef8447d08841c46d'];
// Fixed oracles from §3/4/6/14/18 and the archived Caravan product page.
const oracle=[
  ['GAP-0112',ids,'rettshjelp.grense',pdf,12,['100 000 kr per tvist','250 000 kr','minst tre parter']],
  ['GAP-0116',ids,'losore.grense',web,1,['20 000 kr samlet','10 000 kr per enkeltgjenstand']],
  ['GAP-1720',ids,'rettshjelp.dekning',pdf,11,['Norden','privatkunder','personlig eier, rettmessig bruker eller fører','salg','kjøp av nytt','Voldgift']],
  ['GAP-1721',ids,'rettshjelp.begrensning',pdf,12,['egen advokat','sakkyndige','vitner','Ikke ankegebyr','idømte','betalingsudyktig motpart','sameiere','yrke/virksomhet','straffesak','fullt utnyttet klageadgang','før forsikringen']],
  ['GAP-1722',ids,'rettshjelp.grense',pdf,12,['økonomiske interessen','Uforsikrede parter']],
  ['GAP-1723',ids,'rettshjelp.egenandel',pdf,13,['4 000 kr','20 % av øvrige kostnader','én egenandel per tvist']],
  ['GAP-1724',ids,'brann.begrensning',pdf,3,['Svimerker','delen eller komponenten','kortslutning','følgeskaden']],
  ['GAP-1725',ids,'tyveri.begrensning',pdf,3,['husstandsmedlem eller ansatt','lånt eller prøvd','ikke levert tilbake']],
  ['GAP-1735',ids,'losore.grense',web,1,['100 000 eller 200 000 kr','høyere sum krever kundens dokumenterte valg']],
  ['GAP-1736',ids,'losore.dekning',pdf,3,['Tyveri','campingvognen','tilkoblet fortelt av tre eller glassfiber','20 000 kr']],
  ['GAP-1758',[ids[1]],'kasko.dekning',pdf,3,['Plutselig og uforutsett','sammenstøt, utforkjøring, velt og hærverk','feilfylling','relevant for det forsikrede objektet']],
  ['GAP-1759',[ids[1]],'kasko.begrensning',pdf,4,['Motor, gir, drivverk og elektroniske styreenheter','annen dekket skade','frost, fukt, vann, råte','innvendige flekker','rust/slitasje','underslag','regress','6.1.2 holdes separat']],
  ['GAP-1770',[ids[1]],'fukt.begrensning',pdf,14,['oppstod siste år','utbedring av lekkasjen og rørlekkasje','Årlig fukttest','utført og godkjent av autorisert caravanforhandler','anmerkninger eller påvist fukt','nødvendige tiltak']],
  ['GAP-1771',[ids[1]],'naturskade.dekning',web,1,['campingvogn og spikertelt/fortelt','når Kasko er valgt']],
];
for(const [gap,products,key,source,page,values] of oracle)test(`R-037-${gap}: own source, exact scope and qualifications`,()=>{
  for(const id of products){const f=fact(id,'campingvogn.'+key);assert.equal(f.source.documentId,source);assert.equal(f.source.page,page);
    assert.equal(productCatalog.sources[source].sha256,hashes[source]);
    if(source===pdf){assert.equal(f.source.effectiveFrom,'2026-01-01');assert.equal(f.source.url,'https://api.frende.no/documents/terms/public/pnc/CaravanInsurance');}
    else{assert.equal(f.source.effectiveFrom,'');assert.equal(f.source.url,'https://www.frende.no/forsikringer/campingvognforsikring/');}
    for(const value of values)assert.ok(f.value.includes(value),`${gap}/${id}: ${value}`);
  }
});
test('R-037-SOURCE: both original hashes, 14 signatures and 24 bindings',()=>{
  sourceHash('catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf',hashes[pdf]);
  sourceHash('catalog/sources/vehicle-extensions/frende-campingvognforsikring.html',hashes[web]);
  const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-037');
  assert.deepEqual(b.signature_ids,signatures);assert.equal(b.evidence.length,14);
  assert.equal(b.evidence.reduce((n,e)=>n+e.finding_ids.length,0),24);
  assert.deepEqual(oracle.map(o=>o[0]),b.evidence.map(e=>e.finding_id));
  for(const e of b.evidence){assert.ok(Object.values(hashes).includes(e.sha256));for(const identity of e.product_identities){const [,type,scope,id,version]=JSON.parse(identity);assert.equal(type,'campingvogn');assert.equal(scope,'ordinary');assert.equal(version,'2026-01-01');assert.ok(ids.includes(id));}}
});
test('R-037-LEVEL: inheritance is precise; Kasko-only causes never enter fire/theft',()=>{
  for(const id of ids){assert.equal(fact(id,'campingvogn.brann.dekning').value,'Skade etter brann eller lynnedslag');assert.match(fact(id,'campingvogn.tyveri.dekning').value,/tyveri eller forsøk på tyveri/);
    assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);
    assert.equal(fact(id,'campingvogn.rettshjelp.egenandel').value,'4 000 kr pluss 20 % av øvrige kostnader; én egenandel per tvist også ved flere parter på samme side');
    assert.equal(fact(id,'campingvogn.rettshjelp.egenandel').deductibleClassification,'standard');
  }
  assert.ok(facts(ids[0]).every(f=>!['campingvogn.kasko.','campingvogn.fukt.','campingvogn.naturskade.'].some(prefix=>f.key.startsWith(prefix))));
  assert.equal(fact(ids[1],'campingvogn.fukt.dekning').source.section,'6.1.2');
  assert.equal(fact(ids[1],'campingvogn.fukt.begrensning').source.section,'18.1.11, jf. 6.1.2 side 3');
});
test('R-037-PC: geography, equipment, tent and no car-only benefit transfer',()=>{
  for(const id of ids){assert.equal(fact(id,'campingvogn.avtale.geografi').value,'Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden');
    assert.equal(fact(id,'campingvogn.utstyr.grense').value,'20 000 kr fastmontert ekstrautstyr');
    assert.equal(fact(id,'campingvogn.fortelt.dekning').value,'Fortelt, samt platting og terrasse knyttet til campingvognen');
    assert.ok(facts(id).every(f=>!['campingvogn.nyverdi.','campingvogn.maskinskade.','campingvogn.leiebil.','campingvogn.glass.','campingvogn.redning.'].some(prefix=>f.key.startsWith(prefix))));
    const m=manual(id);assert.equal(m.addOnIds.length,0);assert.equal(m.annualPremium,null);assert.equal(m.deductible,null);
  }
});
test('R-037-COMPARE: same product and both directions, all exact own keys',()=>{
  for(const id of ids)compareBoth(id,['if-campingvogn-kasko','tryg-campingvogn-kasko',...ids.filter(x=>x!==id)],facts(id).map(f=>f.key));
});
test('R-037-DOCUMENT: customer sum/terms win; explicit rejection preserved',()=>{
  for(const id of ids){for(const f of facts(id))documentPriority(id,f.key,'Avtalt kundeverdi');
    const out=enrich(id,[{name:'Løsøre forsikringssum',canonicalKey:'campingvogn.losore.grense',value:'Avtalt 77 777 kr'}]);
    assert.equal(out.importantTerms.find(t=>t.key==='campingvogn.losore.grense').value,'Avtalt 77 777 kr');assert.equal(out.addOnIds.length,0);
    for(const key of ['campingvogn.losore.dekning','campingvogn.kasko.dekning','campingvogn.naturskade.dekning']){
      const negative=enrich(id,[{name:key,canonicalKey:key,value:'Ikke valgt'}]);assert.equal(canonicalCoverage(negative,'Campingvogn',key).status,'not_selected');
    }
  }
});
test('R-037-SCOPE: provider/type/scope/version isolation; no new vehicle bonus or age',()=>{
  for(const id of ids){assert.equal(findCatalogProduct('frende',id,'2026-01-01',{insuranceType:'Campingvogn',agreementScope:'ordinary'}),product(id));
    for(const scope of [{insuranceType:'Bobil'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-01-01',scope),null);
    assert.equal(findCatalogProduct('if',id,'2026-01-01'),null);assert.equal(findCatalogProduct('frende',id,'unknown'),null);
    assert.ok(facts(id).every(f=>!f.key.startsWith('bonus.')&&!f.key.endsWith('.alder')));
  }
  for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>![pdf,web].includes(f.source.documentId)));
});
