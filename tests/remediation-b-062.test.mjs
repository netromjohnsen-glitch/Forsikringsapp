import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts, materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,enrich,manual,documentPriority,sourceHash,date} from './helpers/wave3-catalog-gate.mjs';

// B-062 / RC-038 / SCRC-042. Own dog source, never inferred from cat/peer facts.
const ids=['if-hund-basis','if-hund-standard','if-hund-super'];
const file='catalog/sources/boat-pet/if-dog-terms.pdf';
const hash='d2372736a4d99d4c434ac87ea068c5051908742ae03e454220b6b1cc1d436c75';
// JSON omits undefined object properties; retain every defined value and array slot.
const omitUndefinedProperties=value=>Array.isArray(value)?value.map(omitUndefinedProperties):
 value!==null&&typeof value==='object'?Object.fromEntries(Object.entries(value)
  .filter(([,entry])=>entry!==undefined).map(([key,entry])=>[key,omitUndefinedProperties(entry)])):value;
const bindings=[
 ['06e0d3656c844b4e',24,39,0],['06e0d3656c844b4e',25,40,1],['06e0d3656c844b4e',26,41,2],
 ['2879b34d37585633',27,42,0],['648fbba4be12af9d',28,43,1],['3ff115fa72b6972f',29,44,1],
 ['a4af300967811a01',30,45,2],['88aeaa94ca507b76',31,46,0],['88aeaa94ca507b76',32,47,1],['88aeaa94ca507b76',33,48,2],
 ['fbe62d1dfbbd54bb',34,49,0],['fbe62d1dfbbd54bb',35,50,1],['fbe62d1dfbbd54bb',36,51,2],
 ['365ac075c1e01d44',3779,5396,0],['365ac075c1e01d44',3802,5423,1],['365ac075c1e01d44',3828,5453,2],['4463e9dc92398049',3821,5445,2],
];
const definitions={
 '06e0d3656c844b4e':[['dyr.tannskade.dekning',4,'5.1.2',[/ulykkeshendelse/,/rotspissabcess ved avskalling\/fraktur/,/valgt veterinærsum/]]],
 '2879b34d37585633':[['dyr.medisin.dekning',4,'5.1.1',[/Medisiner, bandasjemateriell, body\/halskrage og potesokk/,/behandlingen hos veterinæren/,/Separat kjøp.*Standard og Super/]]],
 '648fbba4be12af9d':[['dyr.tannsykdom.grense',4,'5.1.3',[/15 000 kr i løpet av hundens liv/,/karies og tannresorpsjon/,/Tilbakeholdte melketenner, tanncyster, emaljedefekter og bittfeil/,/medisinsk nødvendig/,/tilsvarende veterinærdekning før fylte fire måneder/]]],
 '3ff115fa72b6972f':[['dyr.allergi.dekning',4,'5.1.4',[/Utredning og behandling av allergi/]],['dyr.allergi.grense',4,'5.1.4',[/15 000 kr i løpet av hundens liv/,/valgt veterinærsum/]]],
 'a4af300967811a01':[['dyr.veterinar.rollover',5,'5.1.9',[/skadefritt forsikringsår/,/10 000 kr.*neste forsikringsår/,/nedjustering.*reduseres oppspart rollover tilsvarende/,/dobbelte av valgt forsikringssum/,/Opptjening og bruk.*bare.*Super/]]],
 '88aeaa94ca507b76':[['dyr.karenstid.sykdom',8,'6.2.1',[/20 dager/,/sykdom, feil eller svakheter/,/ved ikrafttredelse/,/påvises eller viser symptomer/,/flytting fra annet selskap/,/If med annen eier/,/ny karenstid bare for forhøyelsen\/utvidelsen/]]],
 'fbe62d1dfbbd54bb':[['dyr.veterinaralder.opphor',4,'4 Varighet',[/kan beholdes hele hundens liv/]]],
 '365ac075c1e01d44':[['dyr.liv.reduksjon.start',6,'5.2',[/Gruppe 1.*året hunden fyller 6 år/,/Gruppe 2 \(alle andre raser som ikke inngår i gruppe 1 og gruppe 3, samt blandingshunder\).*året hunden fyller 8 år/,/Gruppe 3.*året hunden fyller 10 år/,/pyreenerhund/,/kleiner mustlander/,/west highland white terrier og whippet/]],['dyr.liv.reduksjon.sats',6,'5.2',[/^20 % av siste forsikringsårs forsikringssum per fornyelse$/]],['dyr.liv.opphor',6,'5.2',[/Gruppe 1: ved fornyelse det året hunden blir 8 år/,/Gruppe 2: ved hovedforfall det året hunden blir 10 år/,/Gruppe 3: ved hovedforfall det året hunden blir 12 år/]]],
 '4463e9dc92398049':[['dyr.tannsykdom.dekning',4,'5.1.3',[/karies og tannresorpsjon/,/Tilbakeholdte melketenner, tanncyster, emaljedefekter og bittfeil/,/medisinsk nødvendig/,/tilsvarende veterinærdekning før fylte fire måneder/]],['dyr.tannsykdom.grense',4,'5.1.3',[/valgt forsikringssum for veterinærutgifter årlig/]]],
};
const own=(id,key)=>resolveCatalogFacts(product(id),key.startsWith('dyr.liv.')?['if-hund-liv']:[],date).find(f=>f.key===key);
// Independent §5.2 source oracle. This checks the displayed rule, not a customer breed classifier.
const groupMembers=[
 'berner sennenhund, grand danois, irsk ulvehund, leonberger, newfoundlandshund, pyreenerhund, napolitansk mastiff og sankt bernardshund',
 'alle andre raser som ikke inngår i gruppe 1 og gruppe 3, samt blandingshunder',
 'bichon havanais, border terrier, cairn terrier, chihuahua, chinese crested, dvergschnauzer, finsk lapphund, finsk spetts, foxterrier, islandsk fårehund, jack russel terrier, lhasa apso, toy-, dverg- og mellompuddel, kleiner mustlander, norrbottenspets, norsk buhund, papillon, phalene, schnauzer, shih tzu, softcoated wheaten terrier, tibetansk spaniel, tibetansk terrier, welsh springer spaniel, west highland white terrier og whippet',
];
function assertLifeAgeModel(id){
 const start=own(id,'dyr.liv.reduksjon.start').value;
 assert.equal(start,`Gruppe 1 (${groupMembers[0]}): ved hver fornyelse fra året hunden fyller 6 år. Gruppe 2 (${groupMembers[1]}): fra året hunden fyller 8 år. Gruppe 3 (${groupMembers[2]}): fra året hunden fyller 10 år.`);
 assert.equal(own(id,'dyr.liv.reduksjon.sats').value,'20 % av siste forsikringsårs forsikringssum per fornyelse');
 assert.equal(own(id,'dyr.liv.opphor').value,'Gruppe 1: ved fornyelse det året hunden blir 8 år. Gruppe 2: ved hovedforfall det året hunden blir 10 år. Gruppe 3: ved hovedforfall det året hunden blir 12 år. Rasegruppene følger 5.2.');
 assert.ok(groupMembers[0].includes('berner sennenhund'));
 assert.ok(!groupMembers[2].includes('berner sennenhund'));
 assert.ok(groupMembers[2].includes('chihuahua'));
 assert.ok(!groupMembers[0].includes('chihuahua'));
 assert.match(groupMembers[1],/ikke inngår i gruppe 1 og gruppe 3, samt blandingshunder$/);
 // The exact residual condition, rather than source-order precedence, protects both held-out breeds.
 const groups=[...start.matchAll(/Gruppe (\d) \(([^)]+)\): ([^.]+)\./g)];
 assert.equal(groups.length,3);
 assert.ok(groups[0][2].includes('berner sennenhund'));assert.match(groups[0][3],/året hunden fyller 6 år$/);
 assert.ok(groups[2][2].includes('chihuahua'));assert.match(groups[2][3],/året hunden fyller 10 år$/);
 assert.equal(groups[1][2],groupMembers[1]);assert.match(groups[1][3],/året hunden fyller 8 år$/);
 assert.doesNotMatch(start,/fødselsdag|etter fylte/);
}
for(const id of ids){
 test(`R-062-GROUP2 ${id}: explicit source residual excludes Group 1/3; mixed breeds and complete age model`,()=>assertLifeAgeModel(id));
 test(`R-062-GROUP-SELECTION ${id}: known and unknown group details never select Liv; document wins`,()=>{
  for(const value of ['Rasegruppe 1 – berner sennenhund','Rasegruppe 2 – blandingshund','Rasegruppe 3 – chihuahua','Rasegruppe ukjent']){
   const key='dyr.liv.reduksjon.start';const rule={name:own(id,key).label,canonicalKey:key,value};
   for(const parent of [undefined,'Ikke dokumentert','Ikke valgt','Valgt']){
    const out=enrich(id,[...(parent?[{name:'Liv, død og tap',canonicalKey:'dyr.liv.dekning',value:parent}]:[]),rule]);
    assert.equal(canonicalCoverage(out,'Hund','dyr.liv.dekning').status,parent==='Valgt'?'selected':parent==='Ikke valgt'?'not_selected':'unknown');
    assert.equal(out.addOnIds.includes('if-hund-liv'),parent==='Valgt');
    const term=out.importantTerms.find(t=>t.key===key);assert.ok(term);assert.equal(term.value,value);assert.equal(term.coverageOrigin,'document');
   }
  }
  const silent=enrich(id,[]);assert.deepEqual(silent.addOnIds,[]);
  assert.equal(canonicalCoverage(silent,'Hund','dyr.liv.dekning').status,'unknown');
  assert.ok(!silent.importantTerms.some(t=>t.key==='dyr.liv.reduksjon.start'));
 });
}
for(const [signature,gap,sf,tier]of bindings)test(`R-062-${signature} GAP-${gap}/SF-${sf}: source dimensions/provenance`,()=>{
 for(const [key,page,section,patterns]of definitions[signature]){const f=own(ids[tier],key);assert.ok(f,key);for(const pattern of patterns)assert.match(f.value,pattern);
 assert.equal(f.source.documentId,'boat-pet:if:hund');assert.equal(f.source.filename,'if-dog-terms.pdf');assert.equal(f.source.company,'If');assert.equal(f.source.termsNumber,'Hundeforsikring');assert.equal(f.source.version,'2022-12-01');assert.equal(f.source.effectiveFrom,'2022-12-01');assert.equal(f.source.agreementScope,'ordinary');assert.equal(f.source.page,page);assert.equal(f.source.section,section);assert.equal(f.coverageAvailability,undefined);
 if(key.startsWith('dyr.tannsykdom.'))assert.doesNotMatch(f.value,/sammenhengende/);if(key==='dyr.karenstid.sykdom')assert.doesNotMatch(f.value,/direkte/);
 }
});

test('R-062-SOURCE: frozen bytes, complete exact 9/17 original identities and material source clauses',async()=>{
 sourceHash(file,hash);const source=productCatalog.sources['boat-pet:if:hund'];assert.equal(source.sha256,hash);assert.equal(source.sourceType,'full_terms');assert.equal(source.url,'https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Hundeforsikring');
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-062');assert.deepEqual(batch.signature_ids.sort(),[...new Set(bindings.map(b=>b[0]))].sort());assert.equal(bindings.length,17);assert.deepEqual(batch.P2_piggyback_signatures,[]);
 const expected=bindings.map(([,g,s,t])=>['GAP-'+String(g).padStart(4,'0'),'SF-'+String(s).padStart(4,'0'),ids[t]]).sort();
 const actual=batch.evidence.flatMap(e=>e.finding_ids.map((g,i)=>[g,e.source_fact_ids[i],JSON.parse(e.product_identities[i]??e.product_identity)[3]])).sort();assert.deepEqual(actual,expected);
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../'+file,import.meta.url))});try{const pdf=await parser.getText();const page=n=>pdf.pages[n-1].text.replace(/\s+/g,' ');
 for(const phrase of ['Veterinærforsikringen kan beholdes hele hundens liv','body/halskrage og potesokk','rotspissabcess ved avskalling/fraktur','15 000 kroner i løpet av hundens liv','før fylte fire måneder','når det er medisinsk nødvendig'])assert.ok(page(4).includes(phrase),phrase);
 assert.match(page(5),/skadefritt forsikringsår/);assert.match(page(5),/Opptjening og bruk.*kun så lenge.*super/);
 for(const years of [6,8,10])assert.ok(page(6).includes('fra året hunden fyller '+years+' år'));for(const years of [8,10,12])assert.ok(page(6).includes('det året hunden blir '+years+' år'));
 assert.ok(page(6).includes('Alle andre raser som ikke inngår i gruppe 1 og gruppe 3, samt blandingshunder.'));
 assert.match(page(8),/Karenstiden gjelder ikke ved flytting fra annet selskap/);assert.match(page(8),/ny karenstid for forhøyelsen\/utvidelsen/);
 assert.match(page(7),/30 000 kroner for hele kullet/);assert.match(page(7),/2 000 kroner per skade\/sykdom/);assert.match(page(7),/kjøpt før valpene er født/);assert.match(page(9),/dokumentasjon/);
 }finally{await parser.destroy();}
});

for(let t=0;t<3;t++)for(const [n,kind]of [[13+t,'deductible'],[16+t,'administration'],[19+t,'optional'],[22+t,'ages'],[1489+t*2,'puppies'],[1490+t*2,'vet']])test(`R-062-PC-${String(n).padStart(4,'0')}: ${kind}`,()=>{
 const id=ids[t],out=enrich(id,[]);assert.equal(product(id).insuranceType,'Hund');assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
 if(kind==='deductible'){assert.equal(fact(id,'dyr.veterinar.egenandel.fast').deductibleClassification,'reference');assert.match(fact(id,'dyr.veterinar.egenandel.fast').value,/faktisk valg står i forsikringsbeviset/);}
 if(kind==='administration')assert.ok(facts(id).every(f=>!/administrasjon|skademelding|dokumentasjon/.test(f.key)));
 if(kind==='optional'){assert.ok(availableAddOns(product(id),date).some(a=>a.id==='if-hund-liv'));assert.equal(canonicalCoverage(out,'Hund','dyr.liv.dekning').status,'unknown');assert.deepEqual(out.addOnIds,[]);}
 if(kind==='ages')assertLifeAgeModel(id);
 if(kind==='puppies'){assert.ok(availableAddOns(product(id),date).every(a=>!/valpekull/.test(a.id)));assert.ok(facts(id).every(f=>!/valpekull/.test(f.key)));}
 if(kind==='vet')assert.equal(canonicalCoverage(out,'Hund','dyr.veterinar.dekning').status,'selected');
});

test('R-062-FU-01: Standard allergy is its own included fact, no peer inference',()=>{assert.equal(materializeCatalogProduct(product(ids[1])).facts.find(f=>f.key==='dyr.allergi.dekning').state,'included');assert.equal(canonicalCoverage(enrich(ids[1],[]),'Hund','dyr.allergi.dekning').status,'selected');assert.match(fact(ids[1],'dyr.allergi.grense').value,/15 000 kr i løpet av hundens liv/);assert.ok(!facts(ids[0]).some(f=>f.key==='dyr.allergi.grense'));});

test('R-062-CUSTOMER: silent/details/unknown/refused/selected Liv and document override',()=>{
 for(const id of ids){for(const value of ['Ukjent','Ikke dokumentert','Ikke valgt']){const out=enrich(id,[{name:'Liv, død og tap',canonicalKey:'dyr.liv.dekning',value}]);assert.ok(!out.addOnIds.includes('if-hund-liv'));assert.equal(canonicalCoverage(out,'Hund','dyr.liv.dekning').status,value==='Ikke valgt'?'not_selected':'unknown');}
 const key='dyr.liv.reduksjon.start';const detail=enrich(id,[{name:own(id,key).label,canonicalKey:key,value:'Rasegruppe 1'}]);assert.ok(!detail.addOnIds.includes('if-hund-liv'));
 const out=enrich(id,[{name:'Liv, død og tap',canonicalKey:'dyr.liv.dekning',value:'Valgt'},{name:own(id,key).label,canonicalKey:key,value:'Kundens dokumenterte startalder 7 år'}]);assert.ok(out.addOnIds.includes('if-hund-liv'));assert.equal(out.importantTerms.find(t=>t.key===key).value,'Kundens dokumenterte startalder 7 år');assert.equal(out.importantTerms.find(t=>t.key===key).coverageOrigin,'document');
 for(const k of ['dyr.tannskade.dekning','dyr.karenstid.sykdom','dyr.veterinaralder.opphor'])documentPriority(id,k,'Kundens dokumenterte særvilkår');documentPriority(id,'dyr.tannskade.dekning','Ikke valgt');assert.equal(canonicalCoverage(enrich(id,[{name:'Tannskade ved ulykke',canonicalKey:'dyr.tannskade.dekning',value:'Ikke valgt'}]),'Hund','dyr.tannskade.dekning').status,'not_selected');
 }
});

test('R-062-COMPARE: same product/all Hund peers/both directions/optional life/native manual/serialization',()=>{
 const auditFixture={value:'20 %',agreementScope:'ordinary',source:{documentId:'boat-pet:if:hund',page:6},deductible:null,structuredValue:undefined};
 const serialized=JSON.parse(JSON.stringify(auditFixture));
 assert.deepEqual(serialized,omitUndefinedProperties(auditFixture));
 assert.equal(omitUndefinedProperties(auditFixture).deductible,null);
 for(const changed of [{...auditFixture,value:'10 %'},{...auditFixture,agreementScope:'nito'},
  {...auditFixture,source:{...auditFixture.source,page:4}}])assert.notDeepEqual(serialized,omitUndefinedProperties(changed));
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Hund');for(const id of ids){const m=manual(id);assert.deepEqual(m.addOnIds,[]);assert.equal(canonicalCoverage(m,'Hund','dyr.liv.dekning').status,'unknown');
 for(const f of facts(id)){const term=m.importantTerms.find(t=>t.key===f.key);assert.ok(term,f.key);assert.equal(term.value,f.value);assert.ok(term.sources.some(s=>s.documentId===f.source.documentId&&s.page===f.source.page&&s.section===f.source.section));}
 assert.deepEqual(JSON.parse(JSON.stringify(m)),omitUndefinedProperties(m));
 for(const peer of peers){const a=compareCatalogProducts(product(id),peer),b=compareCatalogProducts(peer,product(id));for(const r of a.sections.flatMap(s=>s.rows)){const reverse=b.sections.flatMap(s=>s.rows).find(s=>s.key===r.key);assert.ok(reverse);assert.deepEqual(r.first,reverse.second);assert.deepEqual(r.second,reverse.first);if(peer.productId===id)assert.equal(r.different,false);}assert.equal(a.sections.flatMap(s=>s.rows).find(r=>r.key==='dyr.liv.reduksjon.start').first.state,'optional');}
 }
});

test('R-062-ISOLATION: exact company/type/scope/version, tiers and unchanged cat life',()=>{
 for(const id of ids){const p=product(id);for(const [provider,version,type,scope]of [['tryg',p.version,'Hund','ordinary'],['if','invented','Hund','ordinary'],['if',p.version,'Katt','ordinary'],['if',p.version,'Hund','nito']])assert.equal(findCatalogProduct(provider,id,version,{insuranceType:type,agreementScope:scope}),null);assert.equal(p.version,'2022-12-01');assert.equal(p.company,'If');}
 assert.ok(!facts(ids[0]).some(f=>f.key==='dyr.tannsykdom.grense'));assert.ok(!facts(ids[1]).some(f=>f.key==='dyr.veterinar.rollover'));assert.doesNotMatch(fact(ids[2],'dyr.tannsykdom.grense').value,/15 000|løpet av hundens liv/);
 for(const id of ['if-katt-basis','if-katt-standard','if-katt-super']){const fs=resolveCatalogFacts(product(id),['if-katt-liv'],date);assert.ok(fs.every(f=>!f.source.documentId.includes(':hund')));assert.equal(fs.find(f=>f.key==='dyr.liv.opphor').value,'Ved fornyelse det året katten blir 13 år');}
});
