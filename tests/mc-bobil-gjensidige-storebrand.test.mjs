import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gjensidigeStorebrandMcBobilCatalog as owned } from '../lib/mc-bobil-gjensidige-storebrand-catalog.ts';
import { findCatalogProductBySelection, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { resolveCatalogSources } from '../lib/catalog-source-resolution.ts';
import { mcBobilKeyApplies } from '../lib/mc-bobil-registry.ts';

const catalog = { ...owned, companies: ['Gjensidige','Storebrand'], insuranceTypes: ['MC','Bobil'] };
const asOf = new Date('2026-09-28T12:00:00Z');
const product = (provider, type, level) => findCatalogProductBySelection(provider,type,level,'ordinary',catalog);
const rows = (provider,type,level,extras=[]) => resolveCatalogFacts(product(provider,type,level),extras,asOf,null,catalog);
const row = (provider,type,level,key) => rows(provider,type,level).find(f=>f.key===key);
const manifest = JSON.parse(readFileSync(new URL('../catalog/sources/mc-bobil/gjensidige-storebrand-manifest.json',import.meta.url)));

for (const provider of ['Gjensidige','Storebrand']) for (const type of ['MC','Bobil']) {
  const tiers = type==='MC' ? ['Ansvar','Delkasko','Kasko'] : provider==='Gjensidige' ? ['Ansvar','Delkasko','Kasko','Pluss'] : ['Ansvar','Delkasko','Kasko','Super'];
  for (const tier of tiers) test(`${provider} ${type} ${tier}: exact ordinary product and source-backed facts`,()=>{
    const p = product(provider,type,tier); assert.ok(p);
    assert.equal(p.providerId,provider.toLowerCase());assert.equal(p.insuranceType,type);assert.equal(p.agreementScope,'ordinary');
    const facts=rows(provider,type,tier);assert.ok(facts.length>=10);
    assert.equal(new Set(facts.map(f=>f.key)).size,facts.length);
    assert.equal(facts.find(f=>f.key==='ansvar.ting.grense').value,'100 millioner kr');
    for(const f of facts){
      const source=owned.sources[f.source.documentId];assert.ok(source);assert.equal(source.providerId,p.providerId);assert.equal(source.insuranceType,type);assert.equal(source.agreementScope,'ordinary');
      assert.ok(f.source.page>0);assert.ok(f.source.section);assert.ok(mcBobilKeyApplies(type.toLowerCase(),f.key));
      assert.ok(!/^(premie|kjoretoy)\./u.test(f.key));
    }
  });
}

test('Gjensidige and Storebrand product sets do not manufacture MC top tiers',()=>{
  assert.equal(owned.products.length,14);
  for(const provider of ['Gjensidige','Storebrand'])for(const tier of ['Pluss','Super'])assert.equal(product(provider,'MC',tier),null);
  assert.equal(product('Gjensidige','Bobil','Super'),null);assert.equal(product('Storebrand','Bobil','Pluss'),null);
});
test('explicit provider alias and unknown products are deterministic',()=>{
  assert.equal(product('Gjensidige Forsikring ASA','MC','Kasko')?.productId,'gjensidige-mc-kasko');
  assert.equal(product('Gjensidige','Bobil','Kaskoo'),null);assert.equal(product('Unknown','MC','Kasko'),null);
  assert.equal(findCatalogProductBySelection('Storebrand','MC','Kasko','member-nito',catalog),null);
});
test('MC shared Gjensidige end-sheet does not transfer Bobil new-value guarantee',()=>{
  assert.ok(!rows('Gjensidige','MC','Kasko').some(f=>f.key.startsWith('nyverdi.')));
  assert.match(row('Gjensidige','Bobil','Kasko','nyverdi.km').value,/20 000/);
});
test('Gjensidige Bobil IPID phrase cannot invent Pluss total-loss extension',()=>{
  assert.equal(row('Gjensidige','Bobil','Pluss','nyverdi.km').value,row('Gjensidige','Bobil','Kasko','nyverdi.km').value);
  assert.match(row('Gjensidige','Bobil','Pluss','nyverdi.alder').value,/1 år/);
  assert.equal(owned.sources[row('Gjensidige','Bobil','Pluss','nyverdi.km').source.documentId].sourceType,'full_terms');
});
test('Gjensidige Bobil Pluss coverage km is isolated from deductible bands',()=>{
  assert.match(row('Gjensidige','Bobil','Pluss','maskinskade.km').value,/200 000/);
  assert.doesNotMatch(row('Gjensidige','Bobil','Pluss','maskinskade.km').value,/119 999|159 999/);
  assert.match(row('Gjensidige','Bobil','Pluss','maskinskade.egenandel.kilometer').value,/119 999.*10 000.*159 999.*14 000.*18 000/);
});
test('Gjensidige Bobil guarantee and assistance rental have distinct duration keys',()=>{
  assert.match(row('Gjensidige','Bobil','Pluss','bobil.feriegaranti.dager').value,/14/);
  assert.match(row('Gjensidige','Bobil','Pluss','leiebil.dager').value,/15/);
  assert.equal(row('Gjensidige','Bobil','Pluss','bobil.ferieavbrudd.dagsbelop'),undefined);
});
test('Gjensidige MC rental benefit is MC-specific and not Bobil holiday guarantee',()=>{
  assert.match(row('Gjensidige','MC','Kasko','mc.leiekjoretoy.dager').value,/15/);
  assert.match(row('Gjensidige','MC','Kasko','mc.leiekjoretoy.begrensning').value,/2 virkedager/);
  assert.ok(!rows('Gjensidige','MC','Kasko').some(f=>f.key.startsWith('bobil.')));
});
test('Gjensidige base products do not inherit sample rental not-selected status',()=>{
  for(const tier of ['Delkasko','Kasko','Pluss']){
    assert.equal(row('Gjensidige','Bobil',tier,'bobil.utleie.dekning'),undefined);
    assert.equal(row('Gjensidige','Bobil',tier,'bobil.fortelt.dekning'),undefined);
    assert.ok(rows('Gjensidige','Bobil',tier,['gjensidige-bobil-utleie']).some(f=>f.key==='bobil.utleie.dekning'));
  }
});
test('Gjensidige belongings and fixed equipment limits are independently sourced',()=>{
  assert.equal(row('Gjensidige','MC','Kasko','mc.bagasje.grense').value,'5 000 kr');
  assert.equal(row('Gjensidige','MC','Kasko','utstyr.grense').value,'10 000 kr');
  assert.equal(row('Gjensidige','Bobil','Kasko','bobil.losore.grense').value,'10 000 kr');
  assert.equal(row('Gjensidige','Bobil','Pluss','bobil.losore.grense').value,'50 000 kr');
});
test('Storebrand riding equipment included but ambiguous generic baggage omitted',()=>{
  assert.match(row('Storebrand','MC','Kasko','mc.kjoreutstyr.dekning').value,/Kjøredress.*hjelm.*hansker.*støvler/);
  assert.equal(row('Storebrand','MC','Kasko','mc.bagasje.grense'),undefined);
  assert.ok(!rows('Storebrand','MC','Kasko').some(f=>/^(bobil|maskinskade|nyverdi)\./u.test(f.key)));
});
test('Storebrand Bobil explicit baggage sums override general motorvogn row',()=>{
  assert.equal(row('Storebrand','Bobil','Kasko','bobil.losore.grense').value,'30 000 kr');
  assert.equal(row('Storebrand','Bobil','Super','bobil.losore.grense').value,'100 000 kr');
});
test('Storebrand Kasko passenger/van total-loss applicability is not assumed for Bobil',()=>{
  assert.equal(row('Storebrand','Bobil','Kasko','nyverdi.km'),undefined);
  assert.match(row('Storebrand','Bobil','Super','nyverdi.km').value,/60 000/);
  assert.match(row('Storebrand','Bobil','Super','nyverdi.alder').value,/3 år/);
});
test('Storebrand Bobil moisture, engine and holiday limits remain distinct',()=>{
  assert.match(row('Storebrand','Bobil','Super','bobil.fukt.alder').value,/8 år/);
  assert.match(row('Storebrand','Bobil','Super','maskinskade.alder').value,/12 år/);
  assert.match(row('Storebrand','Bobil','Super','maskinskade.km').value,/200 000/);
  assert.match(row('Storebrand','Bobil','Super','bobil.feriegaranti.dager').value,/15 dager/);
  assert.match(row('Storebrand','Bobil','Super','bobil.fukt.kontroll').value,/1 år/);
});
test('Storebrand optional rental is never base-selected and variants remain exclusive',()=>{
  assert.equal(row('Storebrand','Bobil','Super','leiebil.dekning'),undefined);
  assert.equal(row('Storebrand','Bobil','Kasko','leiebil.dekning'),undefined);
  const normal=rows('Storebrand','Bobil','Kasko',['storebrand-bobil-leiebil']);
  const extended=rows('Storebrand','Bobil','Super',['storebrand-bobil-utvidet-leiebil']);
  assert.match(normal.find(f=>f.key==='leiebil.bilklasse').value,/Klasse C/);
  assert.match(extended.find(f=>f.key==='leiebil.bilklasse').value,/Klasse I/);
  assert.equal(owned.addOns.find(a=>a.id==='storebrand-bobil-leiebil').exclusiveGroup,owned.addOns.find(a=>a.id==='storebrand-bobil-utvidet-leiebil').exclusiveGroup);
});
test('add-ons never leak between MC/Bobil or providers',()=>{
  for(const provider of ['Gjensidige','Storebrand']) {
    assert.throws(()=>rows(provider,'MC','Kasko',['gjensidige-bobil-utleie']));
    assert.throws(()=>rows(provider,'MC','Kasko',['storebrand-bobil-leiebil']));
  }
  assert.throws(()=>rows('Gjensidige','Bobil','Kasko',['storebrand-bobil-leiebil']));
  assert.throws(()=>rows('Storebrand','Bobil','Kasko',['gjensidige-bobil-utleie']));
});
test('Storebrand shared source identities are explicitly type-scoped',()=>{
  const mc=owned.sources['mc-bobil:storebrand-motor09:mc']; const bobil=owned.sources['mc-bobil:storebrand-motor09:bobil'];
  assert.equal(mc.sha256,bobil.sha256);assert.notEqual(mc.id,bobil.id);assert.equal(mc.insuranceType,'MC');assert.equal(bobil.insuranceType,'Bobil');
  const foreign=row('Storebrand','Bobil','Super','maskinskade.km');
  const result=resolveCatalogSources([foreign],owned.sources,product('Storebrand','MC','Kasko'),asOf);
  assert.equal(result.decisions[0].reason,'inapplicable');assert.equal(result.facts.length,0);
});
test('Gjensidige current retrieval timestamp never becomes policy version or effective date',()=>{
  for(const p of owned.products.filter(p=>p.providerId==='gjensidige'))assert.equal(p.version,null);
  for(const s of Object.values(owned.sources).filter(s=>s.providerId==='gjensidige'))assert.equal(s.effectiveFrom,'');
});
test('Storebrand explicit dates and policy version retained',()=>{
  assert.equal(owned.sources['mc-bobil:storebrand-motor09:mc'].effectiveFrom,'2025-04-01');
  assert.equal(owned.sources['mc-bobil:storebrand-gener07:bobil'].effectiveFrom,'2026-09-01');
  for(const p of owned.products.filter(p=>p.providerId==='storebrand'))assert.equal(p.version,'motor09');
});
test('official source originals hash-match and facts resolve to inventoried evidence',()=>{
  for(const source of manifest.artifacts){
    assert.match(new URL(source.url).hostname,/^(www\.)?(gjensidige|storebrand)\.no$/u);
    assert.equal(createHash('sha256').update(readFileSync(new URL('../'+source.localPath,import.meta.url))).digest('hex'),source.sha256);
  }
  for(const s of Object.values(owned.sources))assert.ok(manifest.artifacts.some(a=>a.sha256===s.sha256&&a.filename===s.filename));
});
