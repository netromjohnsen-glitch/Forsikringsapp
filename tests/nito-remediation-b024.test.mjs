import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';

// Repo-relative Cloud gate for B-024 / RC-098 / SCRC-037, GAP-3288–3294,
// GAP-3299 / SF-4631–4637, SF-4642. GAP-3298/SF-4641 remains open:
// the archived definition excludes Supergaranti pending SR-049.
// Fukt/vann's two conditions are retained in the existing fukt model, rather
// than inventing a separate unregistered campingvogn.vann concept.
const date = new Date('2026-09-29T10:52:14.812Z');
const id = 'if-campingvogn-super';
const keys = ['fukt.dekning','fukt.alder','fukt.begrensning','ferie.dekning','ferie.grense',
  'losore.dekning','losore.grense','skadedyr.dekning','skadedyr.begrensning','nyverdi.dekning','nyverdi.alder'].map(k => 'campingvogn.'+k);
const product = id => { const p = productCatalog.products.find(p => p.productId === id); assert.ok(p, id); return p; };
const facts = id => resolveCatalogFacts(product(id), [], date);
const fact = key => { const f = facts(id).find(f => f.key === 'campingvogn.'+key); assert.ok(f,key); return f; };
const rows = (a,b) => compareCatalogProducts(product(a),product(b)).sections.flatMap(s => s.rows);
const enrich = (name,terms) => enrichExtractedAgreementWithCatalog({ company:'If',totalAnnualPremium:null,
  insurances:[{type:'Campingvogn',productName:name,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms}] },date).insurances[0];

test('R-024-01: both exact originals/hashes and scope-specific fact provenance',()=>{
  for(const [path,hash] of [
    ['mc-bobil/if-SV707.pdf','a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e'],
    ['vehicle-extensions/if-campingvognforsikring.html','aad3994299dd6f12a8603e98a17d9a4d7a528f1443bd47f9250aaf6cc8be8943'],
  ]) assert.equal(createHash('sha256').update(readFileSync(new URL('../catalog/sources/'+path,import.meta.url))).digest('hex'),hash);
  assert.equal(product(id).version,'2024-03');
  for(const key of keys){
    const f=facts(id).find(f=>f.key===key);assert.ok(f);
    if(key.includes('.nyverdi.')){assert.equal(f.source.documentId,'vehicle:if-campingvognforsikring.html');assert.match(f.source.section,/Ekstra erstatning/);}
    else {assert.equal(f.source.documentId,'vehicle:if-SV707.pdf');assert.equal(f.source.version,'2022-06');assert.ok([2,3].includes(f.source.page));}
  }
  const source=productCatalog.sources['vehicle:if-SV707.pdf'];
  assert.equal(source.insuranceType,'Campingvogn');assert.equal(source.agreementScope,'ordinary');assert.equal(source.providerId,'if');
  assert.deepEqual(source.productIds,[id]);
});
test('R-024-02: strictly newer than fifteen years from production year',()=>{
  assert.equal(fact('fukt.alder').value,'Campingvognen må være nyere enn 15 år fra produksjonsår');
});
test('R-024-03: pipe leakage has no control requirement; other moisture requires approval',()=>{
  assert.match(fact('fukt.dekning').value,/ferskvann, avløp og varmesystem.*uten krav om fuktkontroll/);
  assert.match(fact('fukt.dekning').value,/Andre fuktskader krever godkjent og bestått fuktkontroll/);
  assert.match(fact('fukt.begrensning').value,/inntil 1 år.*caravanforhandler eller Viking.*ny kontroll/);
  assert.match(fact('fukt.begrensning').value,/måleresultater.*skisse eller bilder.*godkjent/);
});
test('R-024-04: frost/contributing snow and maintenance remain explicit qualifications',()=>{
  assert.match(fact('fukt.begrensning').value,/Frost og frost\/snøtyngde som medvirkende skadeårsak er unntatt/);
  assert.match(fact('fukt.begrensning').value,/vedlikehold.*frostvæske, avtapping.*vannbåren varme/);
});
test('R-024-05: holiday reimbursement needs covered damage after departure and receipts',()=>{
  assert.match(fact('ferie.dekning').value,/erstatningsmessig skade etter påbegynt ferietur.*dokumenterte utgifter.*overnatting eller leiebil/);
  assert.match(fact('ferie.grense').value,/1 500 kr per dag.*resterende planlagt ferie.*15 dager.*faktura eller kvitteringer/);
  assert.equal(fact('ferie.grense').source.section,'3.3.2');
});
test('R-024-06: equipment and baggage share a single 100000 cap',()=>{
  assert.equal(fact('losore.grense').value,'Totalt 100 000 kr samlet for tilleggsutstyr og bagasje i campingvognen');
  assert.equal(fact('losore.grense').source.section,'3.3.3');
  assert.equal(fact('losore.grense').source.page,3);
});
test('R-024-07: pest damage to baggage needs simultaneous vehicle damage and closed storage',()=>{
  assert.match(fact('skadedyr.dekning').value,/Uforutsett.*insekter og gnagere på campingvognen/);
  assert.match(fact('skadedyr.begrensning').value,/bare når det skades samtidig som campingvognen.*Dører, vinduer og luker.*lukket/);
});
test('R-024-08: own camping source establishes three years without imported motor mileage',()=>{
  assert.match(fact('nyverdi.dekning').value,/Helt ny campingvogn ved totalskade.*inntil tre år/);
  assert.equal(fact('nyverdi.alder').value,'Campingvognen er inntil tre år gammel');
  assert.ok(facts(id).every(f=>!f.key.endsWith('nyverdi.km')));
  assert.ok(facts(id).every(f=>!f.key.includes('supergaranti')),'SR-049 is explicitly outside this batch');
});
test('R-024-09: lower tiers and other object types receive none of the Super additions',()=>{
  for(const other of ['if-campingvogn-delkasko','if-campingvogn-kasko'])
    for(const key of keys) assert.equal(facts(other).find(f=>f.key===key),undefined,other+' '+key);
  assert.ok(facts('if-tilhenger-kasko').every(f=>!f.source.documentId.includes('SV707')));
  assert.ok(facts('if-snoscooter-kasko').every(f=>!f.source.documentId.includes('SV707')));
});
test('R-024-10: same product and both comparison directions retain exact facts and sources',()=>{
  for(const other of [id,'if-campingvogn-kasko','gjensidige-campingvogn-pluss']){
    const a=rows(id,other),b=rows(other,id);
    for(const key of keys){const left=a.find(r=>r.key===key),right=b.find(r=>r.key===key);assert.ok(left);assert.ok(right);
      assert.equal(left.first.state,'included');assert.deepEqual(left.first,right.second);assert.deepEqual(left.second,right.first);
      if(other===id)assert.equal(left.different,false);
      if(other==='if-campingvogn-kasko')assert.equal(left.second.state,'unknown');
    }
  }
});
test('R-024-11: customer document values/rejection override catalog and never select riders',()=>{
  const out=enrich('Super',[
    {name:'Løsøre forsikringssum',canonicalKey:'campingvogn.losore.grense',value:'77 777 kr'},
    {name:'Fuktskade',canonicalKey:'campingvogn.fukt.dekning',value:'Ikke valgt'},
  ]);
  for(const [key,value] of [['campingvogn.losore.grense','77 777 kr'],['campingvogn.fukt.dekning','Ikke valgt']]){
    const t=out.importantTerms.find(t=>t.key===key);assert.ok(t);assert.equal(t.value,value);assert.equal(t.coverageOrigin,'document');
  }
  assert.equal(out.addOnIds.length,0);
});
test('R-024-12: manual choice preserves Super facts, pricing absence and held-out deductibles',()=>{
  const out=normalizeManualAgreement({company:'If',totalAnnualPremium:'',products:[{type:'Campingvogn',productName:'Super',annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:[]}]}).insuranceData.insurances[0];
  assert.equal(out.annualPremium,null);assert.equal(out.addOnIds.length,0);
  for(const key of keys)assert.ok(out.importantTerms.some(t=>t.key===key));
  assert.equal(fact('glass.egenandel').value,'3 000 kr ved skifte; ingen egenandel ved reparasjon');
  assert.equal(fact('rettshjelp.egenandel').value,'4 000 kr + 20 % av det overskytende');
});
