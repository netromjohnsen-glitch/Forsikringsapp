import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {vehicleObjectProducts as products,vehicleObjectFacts as facts,vehicleObjectCoverageMatrix as matrix,vehicleObjectSources as sources} from '../lib/vehicle-object-catalog.ts';
import {findCatalogProductBySelection as lookup,resolveCatalogFacts,catalogConnectionStatus,canonicalProviderId} from '../lib/product-catalog.ts';
import {normalizeInsuranceType,normalizeTermName,canonicalInsuranceTypeLabel} from '../lib/insurance-normalization.ts';
import {enrichExtractedAgreementWithCatalog as enrich} from '../lib/catalog-enrichment.ts';
import {normalizeDocumentFacts} from '../lib/document-fact-normalization.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';

const policy=(type,productName,importantTerms=[])=>({type,productName,canonicalProductName:productName,annualPremium:null,deductible:null,coverageSummary:null,importantTerms,addOns:[]});
const enrichOne=(company,type,name,terms=[])=>enrich({company,totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[policy(type,name,terms)]}).insurances[0];
const get=(company,type,name,key)=>resolveCatalogFacts(lookup(company,type,name),[]).find(f=>f.key===key);
for(const [alias,id] of [['Snøscooter','snøscooter'],['Snoscooter','snøscooter'],['Snøscooterforsikring','snøscooter'],['Beltemotorsykkel','snøscooter'],['Campingvognforsikring','campingvogn'],['Tilhengerforsikring','tilhenger']])test(`explicit object alias ${alias}`,()=>assert.equal(normalizeInsuranceType(alias),id));
test('all vehicle types remain distinct; Kasko alone does not infer a vehicle',()=>{
 const ids=['Bil','MC','ATV','Bobil','Snøscooter','Campingvogn','Tilhenger'].map(t=>normalizeInsuranceType(t));assert.equal(new Set(ids).size,7);
 assert.equal(lookup('Tryg','Kasko','Kasko'),null);
 for(const type of ['Snøscooter','Campingvogn','Tilhenger'])assert.equal(canonicalInsuranceTypeLabel(type),type);
});
for(const company of ['Tryg','Gjensidige','Frende','Storebrand','If','Eika'])for(const [type,prefix] of [['Snøscooter','snoscooter'],['Campingvogn','campingvogn'],['Tilhenger','tilhenger']])test(`source-backed ${company} ${type} Kasko and isolation`,()=>{
 const product=lookup(company,type,'Kasko');assert.ok(product);
 assert.equal(product.providerId,company==='Eika'?'eika-fremtind':company.toLowerCase());
 assert.equal(lookup(company,type,'Kaskoo'),null);assert.equal(lookup('Unknown',type,'Kasko'),null);
 const rows=resolveCatalogFacts(product,[]);assert.ok(rows.length>3);
 assert.ok(rows.every(f=>f.key.startsWith(prefix+'.')));
 assert.ok(rows.every(f=>sources[f.source.documentId]));
 const actual=enrichOne(company,type,'Kasko');assert.equal(canonicalCoverage(actual,type,`${prefix}.kasko.dekning`).status,'selected');
 assert.match(catalogConnectionStatus([actual]),/✓ Koblet/);
 assert.ok(actual.importantTerms.every(t=>!['leiebil.dekning','maskinskade.km','nyverdi.km'].includes(t.key)));
 // Representative source value for every provider/type, not just existence.
 const representative=company==='If'?get(company,type,'Kasko',`${prefix}.brann.egenandel`):company==='Storebrand'?get(company,type,'Kasko',`${prefix}.rettshjelp.grense`):get(company,type,'Kasko',`${prefix}.avtale.geografi`);
 if(company==='Gjensidige'&&type==='Snøscooter')assert.equal(get(company,type,'Kasko','snoscooter.ulykke.grense').value,'Dødsfall 100 000 kr; invaliditet 200 000 kr');
 else {assert.ok(representative);assert.ok(representative.source.page>0);if(company==='If')assert.match(representative.value,/8 000/);else if(company==='Storebrand')assert.equal(representative.value,'100 000 kr per tvist');else assert.match(representative.value,/Europa|Norden/);}
});
test('Eika means verified channel, never generic Fremtind/SpareBank1/DNB',()=>{
 assert.equal(canonicalProviderId('Eika'),'eika-fremtind');
 for(const company of ['Fremtind','SpareBank 1','DNB'])for(const type of ['Snøscooter','Campingvogn','Tilhenger'])assert.equal(lookup(company,type,'Kasko'),null);
 assert.equal(lookup('Eika','Tilhenger','Minikasko'),null);
 assert.ok(lookup('Eika','Campingvogn','Minikasko'));
});
test('provider and product-level boundaries are exact',()=>{
 assert.equal(lookup('Gjensidige Forsikring ASA','Campingvogn','Pluss')?.providerId,'gjensidige');
 for(const company of ['Tryg','Gjensidige','Frende','If','Storebrand','Eika'])assert.equal(lookup(company,'Tilhenger','Super'),null);
 assert.equal(lookup('If','Snøscooter','Super'),null);assert.equal(lookup('Storebrand','Snøscooter','Super'),null);
 assert.equal(lookup('Frende','Campingvogn','Pluss'),null);
});
test('full terms establish different camping limits without page overriding or duplicate facts',()=>{
 const tryg=get('Tryg','Campingvogn','Campingvogn Ekstra','campingvogn.losore.grense');assert.match(tryg.value,/50 000.*10 000.*15 000/);assert.equal(tryg.source.termsNumber,'PAU27016');
 assert.match(get('Tryg','Campingvogn','Campingvogn Ekstra','campingvogn.fukt.egenandel').value,/25 %.*8 000/);
 assert.match(get('Gjensidige','Campingvogn','Pluss','campingvogn.ferie.grense').value,/1 500.*14/);
 assert.match(get('Storebrand','Campingvogn','Super','campingvogn.ferie.grense').value,/1 500.*15/);
 assert.match(get('Frende','Campingvogn','Kasko','campingvogn.fukt.begrensning').value,/siste år/);
 assert.match(get('Eika','Campingvogn','Kasko','campingvogn.losore.grense').value,/10 000.*per gjenstand/);
 assert.equal(get('Storebrand','Campingvogn','Super','campingvogn.losore.grense'),undefined,'conflicting 30k/100k is not guessed');
 assert.equal(get('If','Campingvogn','Super','campingvogn.losore.grense'),undefined,'marketing 100k does not replace incomplete full terms');
 for(const p of products){const rows=resolveCatalogFacts(p,[]);assert.equal(new Set(rows.map(f=>f.key)).size,rows.length);assert.ok(rows.every(f=>f.source.filename.endsWith('.pdf')));}
});
test('coverage matrix separates standard, optional and lower-level exclusions',()=>{
 assert.equal(matrix['tryg-snoscooter-kasko']['snoscooter.forerulykke.dekning'],'optional');
 assert.equal(matrix['tryg-campingvogn-kasko']['campingvogn.fukt.dekning'],'unknown');
 assert.equal(matrix['tryg-campingvogn-campingvogn-ekstra']['campingvogn.fukt.dekning'],'standard');
 assert.equal(matrix['gjensidige-campingvogn-delkasko']['campingvogn.kasko.dekning'],'not_included');
 assert.equal(matrix['eika-fremtind-snoscooter-ansvar']['snoscooter.ulykke.dekning'],'standard');
});
test('catalog-only optional coverage stays unknown and manual choice is explicit',()=>{
 const plain=enrichOne('Tryg','Snøscooter','Kasko');assert.equal(canonicalCoverage(plain,'Snøscooter','snoscooter.forerulykke.dekning').status,'unknown');
 const chosen=normalizeManualAgreement({company:'Tryg',totalAnnualPremium:'',products:[{...policy('Snøscooter','Kasko'),annualPremium:'',deductible:'',coverageSummary:'',addOnIds:['tryg-snoscooter-forerulykke']}]});
 assert.equal(canonicalCoverage(chosen.insuranceData.insurances[0],'Snøscooter','snoscooter.forerulykke.dekning').status,'selected');
});
for(const [value,status] of [['Førerulykke er ikke valgt','not_selected'],['Førerulykke er valgt','selected'],['Ikke dokumentert','unknown']])test(`individual optional choice: ${status}`,()=>{
 const i=enrichOne('Tryg','Snøscooter','Kasko',[{name:'Førerulykke',canonicalKey:'snoscooter.forerulykke.dekning',value}]);assert.equal(canonicalCoverage(i,'Snøscooter','snoscooter.forerulykke.dekning').status,status);
});
test('customer deductible beats full terms while catalog evidence is retained',()=>{
 const i=enrichOne('If','Campingvogn','Kasko',[{name:'Brann egenandel',canonicalKey:'campingvogn.brann.egenandel',value:'12 000 kr'}]);
 assert.equal(i.importantTerms.filter(f=>f.key==='campingvogn.brann.egenandel').length,1);
 assert.equal(i.importantTerms.find(f=>f.key==='campingvogn.brann.egenandel').value,'12 000 kr');
 assert.equal(i.importantTerms.find(f=>f.key==='campingvogn.brann.egenandel').coverageOrigin,'document');
 assert.match(i.catalogFacts.find(f=>f.key==='campingvogn.brann.egenandel').value,/8 000/);
});
for(const [type,prefix] of [['Snøscooter','snoscooter'],['Campingvogn','campingvogn'],['Tilhenger','tilhenger']])test(`type and coverage scoped alias ${type}`,()=>{
 assert.equal(normalizeTermName('Brann egenandel',{insuranceType:type}),`${prefix}.brann.egenandel`);
 assert.equal(normalizeTermName('Kasko',{insuranceType:type}),`${prefix}.kasko.dekning`);
 const rows=normalizeDocumentFacts(policy(type,'Kasko',[{name:'Brann egenandel',canonicalKey:'brann.egenandel',value:'9000 kr'}]));assert.equal(rows[0].key,`${prefix}.brann.egenandel`);
});
test('source manifest originals and every active fact have verifiable provenance',()=>{
 const root='catalog/sources/vehicle-extensions/';const manifest=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
 assert.equal(manifest.documents.length,69);
 for(const doc of manifest.documents){assert.equal(createHash('sha256').update(fs.readFileSync(root+doc.filename)).digest('hex'),doc.sha256);assert.match(doc.urls[0],/^https:\/\//);assert.ok(doc.version===null||typeof doc.version==='string');}
 for(const rows of Object.values(facts))for(const fact of rows){const doc=manifest.documents.find(d=>`vehicle:${d.filename}`===fact.source.documentId);assert.ok(doc);assert.notEqual(doc.validity,'future');assert.ok(fact.source.page<=doc.pages);}
 assert.ok(manifest.documents.some(d=>d.validity==='future'));
 const frende=manifest.documents.filter(d=>/frende-.*Insurance.pdf/.test(d.filename));assert.equal(new Set(frende.map(d=>d.sha256)).size,1);
});
test('documented level inheritance keeps one effective fact and base provenance',()=>{
 const product=lookup('Tryg','Campingvogn','Campingvogn Ekstra');assert.equal(product.inheritsProductId,'tryg-campingvogn-kasko');
 const rows=resolveCatalogFacts(product,[]);assert.equal(rows.filter(f=>f.key==='campingvogn.utstyr.grense').length,1);
 assert.equal(rows.find(f=>f.key==='campingvogn.utstyr.grense').value,'50 000 kr');
 assert.equal(lookup('If','Tilhenger','Kasko').inheritsProductId,'if-tilhenger-delkasko');
});
test('trailer natural damage is source-backed, and cargo is not inferred from Kasko',()=>{
 assert.equal(get('Tryg','Tilhenger','Kasko','tilhenger.naturskade.egenandel').value,'8 000 kr');
 for(const p of products.filter(p=>p.insuranceType==='Tilhenger'))assert.ok(resolveCatalogFacts(p,[]).every(f=>!f.key.includes('.losore.')));
 assert.match(get('Frende','Tilhenger','Kasko','tilhenger.kasko.begrensning').value,/ikke omfattet/);
});
