import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { trygIfMcBobilCatalog as catalog } from '../lib/mc-bobil-tryg-if-catalog.ts';
import { findCatalogProductBySelection, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { mcBobilKeyApplies } from '../lib/mc-bobil-registry.ts';
import { enrichExtractedAgreementWithCatalog as enrich } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { manualProductOptions } from '../lib/manual-product-selection.ts';
const now = new Date('2026-09-28T12:00:00Z');
const select = (provider, type, level, scope='ordinary') => findCatalogProductBySelection(provider, type, level, scope, catalog);
const facts = (provider,type,level,addons=[]) => resolveCatalogFacts(select(provider,type,level),addons,now,null,catalog);
const fact = (provider,type,level,key,addons=[]) => facts(provider,type,level,addons).find(row=>row.key===key);
const matrix = [
 ['Tryg','MC',['Ansvar','Delkasko','Kasko','MC Ekstra']],
 ['Tryg','Bobil',['Ansvar','Delkasko','Kasko','Bobil Ekstra']],
 ['If','MC',['Ansvar','Delkasko','Kasko']],
 ['If','Bobil',['Ansvar','Delkasko','Kasko','Super']],
];
for (const [provider,type,levels] of matrix) {
 for(const level of levels) test(`ordinary ${provider} ${type} ${level}: exact lookup, independent source scope and unique facts`,()=>{
  const product=select(provider,type,level);assert.ok(product);assert.equal(product.insuranceType,type);assert.equal(product.agreementScope,'ordinary');assert.equal(product.providerId,provider.toLowerCase());
  const rows=facts(provider,type,level);assert.ok(rows.length>=7);assert.equal(new Set(rows.map(x=>x.key)).size,rows.length);
  assert.ok(rows.every(x=>mcBobilKeyApplies(type.toLowerCase(),x.key)));assert.ok(rows.every(x=>!/^premie\.|^kjoretoy\./.test(x.key)));
  for(const row of rows){const source=catalog.sources[row.source.documentId];assert.equal(source.providerId,product.providerId);assert.equal(source.insuranceType,type);assert.equal(source.agreementScope,'ordinary');assert.ok(source.sha256);assert.ok(row.source.page>0);}
  assert.ok(rows.some(x=>x.key==='ansvar.dekning'));assert.ok(rows.some(x=>x.key==='rettshjelp.dekning'));
 });
 test(`ordinary ${provider} ${type}: no invented scopes or fuzzy level names`,()=>{
  assert.equal(select(provider,type,levels.at(-1),'nito'),null);
  assert.equal(select(provider,type,'Kaskoo'),null);assert.equal(select('Unknown insurer',type,'Kasko'),null);
  assert.equal(select(provider,type==='MC'?'Bobil':'MC',type==='MC'?'MC Ekstra':'Bobil Ekstra')?.name,undefined);
 });
}
test('15 real product levels and 7 explicitly optional add-on variants',()=>{
 assert.equal(catalog.products.length,15);assert.equal(catalog.addOns.length,7);
 assert.equal(select('If','MC','Super'),null);assert.equal(select('Tryg','Bobil','Super'),null);
 assert.equal(select('Tryg','MC','Maskinskade'),null);
});
test('Tryg MC Kasko new value uses MC-specific source, age and km',()=>{
 assert.match(fact('Tryg','MC','Kasko','nyverdi.alder').value,/ett år/);
 assert.match(fact('Tryg','MC','Kasko','nyverdi.km').value,/10 000/);
 assert.match(fact('Tryg','MC','Kasko','nyverdi.skadegrad').value,/80 %/);
 assert.equal(fact('Tryg','MC','Kasko','nyverdi.km').source.termsNumber,'PAU25405');
 assert.equal(fact('Tryg','Bobil','Kasko','nyverdi.km'),undefined);
});
test('Tryg MC Extra motor age, rental days and parked age remain separate',()=>{
 assert.match(fact('Tryg','MC','MC Ekstra','maskinskade.alder').value,/åtte/);
 assert.match(fact('Tryg','MC','MC Ekstra','mc.parkert.alder').value,/seks/);
 assert.match(fact('Tryg','MC','MC Ekstra','mc.leiekjoretoy.dager').value,/10/);
 assert.match(fact('Tryg','MC','MC Ekstra','mc.leiekjoretoy.dagsbelop').value,/500/);
 assert.equal(fact('Tryg','MC','MC Ekstra','maskinskade.km'),undefined);
 assert.equal(fact('Tryg','MC','Kasko','maskinskade.dekning'),undefined);
});
test('Tryg MC optional accident never leaks from Extra benefit availability',()=>{
 for(const level of matrix[0][2]) assert.equal(fact('Tryg','MC',level,'ulykke.dekning'),undefined);
 const extra=select('Tryg','MC','MC Ekstra');const regular=select('Tryg','MC','Kasko');
 assert.deepEqual(availableAddOns(extra,now,null,catalog).map(x=>x.id),['tryg-mc-ulykke-ekstra']);
 assert.deepEqual(availableAddOns(regular,now,null,catalog).map(x=>x.id),['tryg-mc-ulykke']);
 assert.match(fact('Tryg','MC','MC Ekstra','ulykke.invaliditet',['tryg-mc-ulykke-ekstra']).value,/500 000.*25 %.*200 000/);
 assert.throws(()=>facts('Tryg','MC','Kasko',['tryg-mc-ulykke-ekstra']),/Ugyldig/);
});
test('Tryg MC glass applicability preserves 3/4 wheel restriction',()=>{
 assert.match(fact('Tryg','MC','Delkasko','glass.dekning').value,/3- og 4-hjuls/);
 assert.match(fact('Tryg','MC','Delkasko','glass.begrensning').value,/Vindskjerm/);
});
test('Tryg Bobil ordinary versus Extra belongings have separate per-item caps',()=>{
 assert.match(fact('Tryg','Bobil','Kasko','bobil.losore.grense').value,/15 000/);
 assert.match(fact('Tryg','Bobil','Kasko','bobil.losore.gjenstand').value,/5 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.losore.grense').value,/100 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.losore.gjenstand').value,/10 000.*15 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','utstyr.grense').value,/50 000/);
});
test('Tryg Bobil fukt and actual-expense holiday benefit preserve limits and exclusions',()=>{
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.fukt.alder').value,/15 år/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.fukt.egenandel').value,/25 %.*8 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.fukt.begrensning').value,/rørlekkasje.*frost/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.feriegaranti.dagsbelop').value,/2 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','bobil.feriegaranti.dager').value,/14/);
 assert.equal(fact('Tryg','Bobil','Bobil Ekstra','bobil.ferieavbrudd.dagsbelop'),undefined,'expense cap is not a cash allowance');
});
test('Tryg Bobil motor optionality and coverage cap do not absorb deductible bands',()=>{
 assert.equal(fact('Tryg','Bobil','Bobil Ekstra','maskinskade.dekning'),undefined);
 const selected=['tryg-bobil-maskinskade'];assert.match(fact('Tryg','Bobil','Bobil Ekstra','maskinskade.km',selected).value,/200 000/);
 assert.doesNotMatch(fact('Tryg','Bobil','Bobil Ekstra','maskinskade.km',selected).value,/120 000|160 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','maskinskade.egenandel.kilometer',selected).value,/120 000.*160 000/);
 assert.match(fact('Tryg','Bobil','Bobil Ekstra','maskinskade.begrensning',selected).value,/bodel/);
 assert.throws(()=>facts('Tryg','Bobil','Ansvar',selected),/Ugyldig/);
});
test('If standard accident is source-backed, unlike optional Tryg accident',()=>{
 for(const type of ['MC','Bobil'])assert.ok(fact('If',type,'Ansvar','ulykke.dekning'));
 assert.match(fact('If','MC','Ansvar','ulykke.invaliditet').value,/200 000/);
 assert.match(fact('If','Bobil','Ansvar','ulykke.dod').value,/100 000/);
});
test('If MC special equipment and joint baggage limit are not treated as separate 40k sums',()=>{
 assert.match(fact('If','MC','Delkasko','mc.kjoreutstyr.grense').value,/Ubegrenset/);
 assert.equal(catalog.sources[fact('If','MC','Delkasko','mc.kjoreutstyr.grense').source.documentId].sourceType,'product_page');
 assert.equal(fact('If','MC','Delkasko','mc.kjoreutstyr.dekning').source.termsNumber,'SV692');
 assert.match(fact('If','MC','Delkasko','mc.bagasje.grense').value,/40 000.*samlet.*50 %/);
});
test('If MC motor excludes light MC and has age deductions, no borrowed Bobil km cap',()=>{
 const selected=['if-mc-motor-gir'];assert.match(fact('If','MC','Kasko','maskinskade.dekning',selected).value,/mellomtung\/tung/);
 assert.match(fact('If','MC','Kasko','maskinskade.alder',selected).value,/åtte år.*1. januar/);
 assert.match(fact('If','MC','Kasko','maskinskade.aldersfradrag',selected).value,/10 %.*15 %.*20 %.*30 %/);
 assert.match(fact('If','MC','Kasko','maskinskade.egenandel',selected).value,/4 000/);
 assert.equal(fact('If','MC','Kasko','maskinskade.km',selected),undefined);
 assert.equal(fact('If','MC','Kasko','maskinskade.dekning'),undefined);
 assert.throws(()=>facts('If','MC','Kasko',['if-bobil-motor-gir']),/Ugyldig/);
});
test('If full terms control Bobil Super replacement against conflicting page highlight',()=>{
 const row=fact('If','Bobil','Super','nyverdi.km');assert.equal(row.value,'Før 60 000 km');assert.equal(row.source.termsNumber,'MOT2-2');assert.equal(row.source.section,'4.11–4.11.1 (innlemmet av SV707 §3.3)');
 assert.match(fact('If','Bobil','Kasko','nyverdi.km').value,/15 000/);
 assert.match(fact('If','MC','Kasko','nyverdi.km').value,/15 000/);
 assert.match(fact('If','Bobil','Super','nyverdi.alder').value,/tre år/);
});
test('If Bobil internal leakage differs from controlled external moisture',()=>{
 assert.match(fact('If','Bobil','Super','bobil.fukt.kontroll').value,/ett år/);
 assert.match(fact('If','Bobil','Super','bobil.fukt.alder').value,/15 år.*produksjonsår/);
 assert.match(fact('If','Bobil','Super','bobil.vann.begrensning').value,/Krever ikke fuktkontroll/);
 assert.match(fact('If','Bobil','Super','bobil.skadedyr.begrensning').value,/samtidig/);
 assert.equal(fact('If','Bobil','Kasko','bobil.fukt.dekning'),undefined);
});
test('If Bobil rental add-on45days and Super holiday15days do not cross',()=>{
 assert.equal(fact('If','Bobil','Super','leiebil.dekning'),undefined);
 assert.match(fact('If','Bobil','Super','leiebil.dager',['if-bobil-leiebil']).value,/45 dager/);
 assert.match(fact('If','Bobil','Super','bobil.feriegaranti.dager').value,/15 dager/);
 assert.match(fact('If','Bobil','Super','bobil.feriegaranti.dagsbelop').value,/1 500/);
 assert.throws(()=>facts('If','Bobil','Delkasko',['if-bobil-leiebil']),/Ugyldig/);
});
test('If Bobil purchase age/km and coverage cap stay different semantic identities',()=>{
 const selected=['if-bobil-motor-gir'];assert.equal(fact('If','Bobil','Super','maskinskade.dekning'),undefined);
 assert.match(fact('If','Bobil','Super','maskinskade.km',selected).value,/200 000/);
 assert.match(fact('If','Bobil','Super','maskinskade.kjopskm',selected).value,/150 000/);
 assert.match(fact('If','Bobil','Super','maskinskade.kjopsalder',selected).value,/15 år/);
 assert.equal(fact('If','Bobil','Super','maskinskade.alder',selected),undefined);
 assert.match(fact('If','Bobil','Super','maskinskade.kilometerfradrag',selected).value,/175 000/);
});
test('all source original hashes, dates and per-fact pages match inventory',()=>{
 const manifest=JSON.parse(fs.readFileSync('catalog/sources/mc-bobil/tryg-if-manifest.json','utf8'));
 assert.equal(manifest.documents.length,28);assert.equal(manifest.documents.filter(x=>x.reusedExistingArtifact).length,6);
 for(const entry of manifest.documents){assert.equal(createHash('sha256').update(fs.readFileSync(entry.localPath)).digest('hex'),entry.sha256);assert.match(entry.resolvedUrl,/^https:\/\/(?:www\.)?(?:tryg|if)\.no\//);}
 for(const items of Object.values(catalog.facts))for(const row of items){const source=catalog.sources[row.source.documentId];const entry=manifest.documents.find(x=>x.sha256===source.sha256);assert.ok(entry);assert.equal(source.filename,path.basename(entry.localPath));assert.ok(!entry.pageCount||row.source.page<=entry.pageCount);assert.equal(row.source.effectiveFrom,entry.validFrom??'');}
});
test('no product-date invention from download dates or undated IPIDs',()=>{
 for(const source of Object.values(catalog.sources)){assert.notEqual(source.effectiveFrom,'2026-09-28');if(source.sourceType==='product_page'||source.sourceType==='ipid')assert.equal(source.effectiveFrom,'');}
 assert.equal(fact('Tryg','MC','MC Ekstra','maskinskade.alder').source.effectiveFrom,'2026-07-01');
 assert.equal(fact('If','Bobil','Super','bobil.fukt.kontroll').source.effectiveFrom,'2022-06');
});
for(const [provider,type,levels] of matrix) test(`${provider} ${type} ordinary dropdown contains only verified levels`,()=>{
 assert.deepEqual(manualProductOptions(provider,type,catalog,'ordinary').map(x=>x.label),levels);
 assert.deepEqual(manualProductOptions(provider,type,catalog,'nito'),[]);
});

const enriched=(provider,type,level,importantTerms=[])=>enrich({company:provider,totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[{type,productName:level,canonicalProductName:level,annualPremium:null,deductible:null,coverageSummary:null,importantTerms,addOns:[]}]},now,undefined,undefined,catalog).insurances[0];
for(const [provider,type,level] of [['Tryg','Bobil','Bobil Ekstra'],['If','MC','Kasko'],['If','Bobil','Super']])test(`${provider} ${type} optional motor silence stays unknown`,()=>{
 const i=enriched(provider,type,level);assert.equal(canonicalCoverage(i,type,'maskinskade.dekning').status,'unknown');assert.ok(i.catalogReference);
});
for(const [value,status] of [['Maskinskade er ikke valgt','not_selected'],['Maskinskade er valgt','selected']])test(`If MC optional motor explicit document choice remains ${status}`,()=>{
 const i=enriched('If','MC','Kasko',[{name:'Maskinskade',canonicalKey:'maskinskade.dekning',value}]);assert.equal(canonicalCoverage(i,'MC','maskinskade.dekning').status,status);
});
for(const [provider,type,level,key,value] of [['Tryg','MC','Kasko','nyverdi.km','7 500 km'],['If','Bobil','Super','nyverdi.km','45 000 km']])test(`${provider} ${type} explicit customer fact beats catalog`,()=>{
 const i=enriched(provider,type,level,[{name:'Totalskadegaranti kilometergrense',canonicalKey:key,value}]);const effective=i.importantTerms.filter(x=>x.key===key);assert.equal(effective.length,1);assert.equal(effective[0].value,value);assert.equal(effective[0].coverageOrigin,'document');
});
