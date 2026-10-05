import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog,resolveCatalogFacts,availableAddOns,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,enrich,manual,documentPriority,sourceHash,date} from './helpers/wave3-catalog-gate.mjs';

// B-065 / RC-041 / SCRC-002: independent If Katt source, ordinary scope.
const ids=['if-katt-basis','if-katt-standard','if-katt-super'];
const file='catalog/sources/boat-pet/if-cat-terms.pdf';
const hash='bcd631394fbfe7d0a6f0de3d7e79dc82aee2f5d5bb16d4a0b7192e177716abe7';
const jsonShape=value=>Array.isArray(value)?value.map(jsonShape):value!==null&&typeof value==='object'?
 Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).map(([k,v])=>[k,jsonShape(v)])):value;
const bindings=[
 ['14f1659d7deca726',42,69,0],['14f1659d7deca726',43,70,1],['14f1659d7deca726',44,71,2],
 ['7b3858af27a7a47d',45,72,0],['77c42af3c823a2d7',46,73,1],['6fbf66f1b3ffc64d',47,74,1],
 ['60604b48df670cfe',48,75,2],['13dd5fb68cb6608a',49,76,0],['13dd5fb68cb6608a',50,77,1],['13dd5fb68cb6608a',51,78,2],
 ['47c04f60b45c9fd9',52,79,0],['47c04f60b45c9fd9',53,80,1],['47c04f60b45c9fd9',54,81,2],['6eff25c2c8207516',57,93,2],
];
const definitions={
 '14f1659d7deca726':[['dyr.tannskade.dekning',4,'5.1.2',[/ulykkeshendelse/,/rotspissabcess ved avskalling\/fraktur/,/valgt veterinærsum/]]],
 '7b3858af27a7a47d':[['dyr.medisin.dekning',4,'5.1.1',[/Medisiner, bandasjemateriell, body\/halskrage og potesokk/,/behandlingen hos veterinæren/,/Separat kjøp.*Standard og Super/]]],
 '77c42af3c823a2d7':[['dyr.tannsykdom.grense',4,'5.1.3',[/Karies og tannresorpsjon/,/5 000 kr i løpet av kattens liv/,/valgt veterinærsum/,/tilbakeholdte melketenner, tanncyster, emaljedefekter og bittfeil/,/medisinsk nødvendig/,/forsikret før fylte fire måneder/]]],
 '6fbf66f1b3ffc64d':[['dyr.allergi.dekning',4,'5.1.4',[/Utredning og behandling av allergi/]],['dyr.allergi.grense',4,'5.1.4',[/15 000 kr i løpet av kattens liv/,/valgt veterinærsum/]]],
 '60604b48df670cfe':[['dyr.veterinar.rollover',5,'5.1.9',[/skadefritt forsikringsår/,/10 000 kr.*neste forsikringsår/,/nedjustering.*reduseres oppspart rollover tilsvarende/,/dobbelte av valgt forsikringssum/,/Opptjening og bruk.*bare.*Super/]]],
 '13dd5fb68cb6608a':[['dyr.karenstid.sykdom',7,'6.2.1',[/20 dager/,/sykdom, feil eller svakheter/,/ved ikrafttredelse/,/påvises eller viser symptomer/,/flytting fra annet selskap/,/If med annen eier/,/ny karenstid bare for forhøyelsen\/utvidelsen/]]],
 '47c04f60b45c9fd9':[['dyr.veterinaralder.opphor',4,'4 Varighet',[/kan beholdes hele kattens liv/]]],
 '6eff25c2c8207516':[['dyr.tannsykdom.dekning',4,'5.1.3',[/karies og tannresorpsjon/,/Tilbakeholdte melketenner, tanncyster, emaljedefekter og bittfeil/,/medisinsk nødvendig/,/forsikret før fylte fire måneder/,/valgt forsikringssum for veterinærutgifter årlig/,/tannresorpsjon \(TR\) dekkes med inntil 5 000 kr årlig/]]],
};
for(const [signature,gap,sf,tier]of bindings)test(`R-065-${signature} GAP-${gap}/SF-${sf}: exact cat dimensions and provenance`,()=>{
 for(const [key,page,section,patterns]of definitions[signature]){const f=fact(ids[tier],key);for(const re of patterns)assert.match(f.value,re);
  assert.equal(f.source.documentId,'boat-pet:if:katt');assert.equal(f.source.filename,'if-cat-terms.pdf');assert.equal(f.source.company,'If');
  assert.equal(f.source.termsNumber,'Katteforsikring');assert.equal(f.source.version,'2022-12-01');assert.equal(f.source.effectiveFrom,'2022-12-01');assert.equal(f.source.agreementScope,'ordinary');assert.equal(f.source.page,page);assert.equal(f.source.section,section);assert.equal(f.coverageAvailability,undefined);
  if(key.startsWith('dyr.tannsykdom.'))assert.doesNotMatch(f.value,/tilsvarende|sammenhengende/);
  if(key==='dyr.karenstid.sykdom')assert.doesNotMatch(f.value,/direkte/);
 }
});

test('R-065-SOURCE: frozen own-cat bytes, exact 8/14 identities and complete material clauses',async()=>{
 sourceHash(file,hash);const s=productCatalog.sources['boat-pet:if:katt'];assert.equal(s.sha256,hash);assert.equal(s.sourceType,'full_terms');assert.equal(s.url,'https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Katteforsikring');
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-065');
 assert.deepEqual(b.signature_ids.sort(),[...new Set(bindings.map(b=>b[0]))].sort());assert.deepEqual(b.P2_piggyback_signatures,[]);
 const tuples=bindings.map(([,g,s,t])=>['GAP-'+String(g).padStart(4,'0'),'SF-'+String(s).padStart(4,'0'),ids[t]]).sort();
 assert.deepEqual(b.evidence.flatMap(e=>e.finding_ids.map((g,i)=>[g,e.source_fact_ids[i],JSON.parse(e.product_identities[i]??e.product_identity)[3]])).sort(),tuples);assert.equal(tuples.length,14);
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../'+file,import.meta.url))});try{const pdf=await parser.getText();const page=n=>pdf.pages[n-1].text.replace(/\s+/g,' ');
  for(const phrase of ['Veterinærforsikringen kan beholdes hele kattens liv','body/halskrage og potesokk','rotspissabcess ved avskalling/fraktur','5 000 kroner i løpet av kattens liv','Dersom katten har vært forsikret før fylte fire måneder','når det er medisinsk nødvendig','tannresorpsjon (TR) som dekkes med inntil 5 000 kroner årlig','15 000 kroner i løpet av kattens liv'])assert.ok(page(4).includes(phrase),phrase);
  assert.match(page(5),/skadefritt forsikringsår/);assert.match(page(5),/Opptjening og bruk.*kun så lenge.*super/);assert.match(page(5),/hver fornyelse fra året katten fyller 10 år/);assert.match(page(5),/20% av siste forsikringsårs forsikringssum/);assert.match(page(5),/fornyelse det året katten blir 13 år/);
  assert.match(page(7),/Karenstiden gjelder ikke ved flytting fra annet selskap/);assert.match(page(7),/ny karenstid for forhøyelsen\/utvidelsen/);
  assert.match(page(6),/30 000 kroner for hele kullet/);assert.match(page(6),/2 000 kroner per skade\/sykdom/);assert.match(page(6),/kjøpt før kattungene er født/);assert.match(page(6),/kullet må være født før katten fyller seks år/);assert.match(page(8),/dokumentasjon/);
 }finally{await parser.destroy();}
});

for(let t=0;t<3;t++)for(const [n,kind]of [[25+t,'deductible'],[28+t,'administration'],[31+t,'optional'],[34+t,'ages'],[1495+t*2,'kittens'],[1496+t*2,'vet']])test(`R-065-PC-${String(n).padStart(4,'0')}: ${kind}`,()=>{
 const id=ids[t],out=enrich(id,[]);assert.equal(product(id).insuranceType,'Katt');assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
 if(kind==='deductible'){assert.equal(fact(id,'dyr.veterinar.egenandel.fast').deductibleClassification,'reference');assert.match(fact(id,'dyr.veterinar.egenandel.fast').value,/faktisk valg står i forsikringsbeviset/);}
 if(kind==='administration')assert.ok(facts(id).every(f=>!/administrasjon|skademelding|dokumentasjon/.test(f.key)));
 if(kind==='optional'){assert.ok(availableAddOns(product(id),date).some(a=>a.id==='if-katt-liv'));assert.equal(canonicalCoverage(out,'Katt','dyr.liv.dekning').status,'unknown');assert.deepEqual(out.addOnIds,[]);}
 if(kind==='ages'){const fs=resolveCatalogFacts(product(id),['if-katt-liv'],date);assert.equal(fs.find(f=>f.key==='dyr.liv.reduksjon.start').value,'Fra 10 år');assert.equal(fs.find(f=>f.key==='dyr.liv.reduksjon.sats').value,'20 % av siste forsikringsårs forsikringssum per fornyelse');assert.equal(fs.find(f=>f.key==='dyr.liv.opphor').value,'Ved fornyelse det året katten blir 13 år');assert.ok(fs.filter(f=>f.key.startsWith('dyr.liv.')).every(f=>f.source.documentId==='boat-pet:if:katt'));}
 if(kind==='kittens'){assert.ok(availableAddOns(product(id),date).every(a=>!/kattunge/.test(a.id)));assert.ok(facts(id).every(f=>!/kattunge/.test(f.key)));}
 if(kind==='vet')assert.equal(canonicalCoverage(out,'Katt','dyr.veterinar.dekning').status,'selected');
});

test('R-065-CUSTOMER: source conditions are not customer qualification; document wins; Liv guard retained',()=>{
 for(const id of ids){assert.deepEqual(enrich(id,[]).addOnIds,[]);
  for(const v of ['Ikke dokumentert','Ukjent','Ikke valgt','Valgt']){const out=enrich(id,[{name:'Liv, død og tap',canonicalKey:'dyr.liv.dekning',value:v}]);assert.equal(out.addOnIds.includes('if-katt-liv'),v==='Valgt');assert.equal(canonicalCoverage(out,'Katt','dyr.liv.dekning').status,v==='Valgt'?'selected':v==='Ikke valgt'?'not_selected':'unknown');}
  for(const key of ['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats','dyr.liv.opphor']){const out=enrich(id,[{name:'Liv-vilkår',canonicalKey:key,value:'Kundens dokumenterte støttevilkår'}]);assert.deepEqual(out.addOnIds,[]);assert.equal(canonicalCoverage(out,'Katt','dyr.liv.dekning').status,'unknown');assert.equal(out.importantTerms.find(t=>t.key===key).coverageOrigin,'document');}
  for(const [key]of Object.values(definitions).flat())if(facts(id).some(f=>f.key===key))documentPriority(id,key,'Kundens dokumenterte særvilkår');
  documentPriority(id,'dyr.tannskade.dekning','Ikke valgt');assert.equal(canonicalCoverage(enrich(id,[{name:'Tannskade ved ulykke',canonicalKey:'dyr.tannskade.dekning',value:'Ikke valgt'}]),'Katt','dyr.tannskade.dekning').status,'not_selected');
 }
});

test('R-065-COMPARE: same product, all cat peers, both directions, manual/source propagation and JSON',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Katt');
 for(const id of ids){const m=manual(id);assert.deepEqual(m.addOnIds,[]);assert.equal(canonicalCoverage(m,'Katt','dyr.liv.dekning').status,'unknown');
  for(const f of facts(id)){const term=m.importantTerms.find(t=>t.key===f.key);assert.ok(term,f.key);assert.equal(term.value,f.value);assert.ok(term.sources.some(s=>s.documentId===f.source.documentId&&s.page===f.source.page&&s.section===f.source.section));}
  assert.deepEqual(JSON.parse(JSON.stringify(m)),jsonShape(m));
  for(const peer of peers){const a=compareCatalogProducts(product(id),peer),b=compareCatalogProducts(peer,product(id));for(const r of a.sections.flatMap(s=>s.rows)){const swap=b.sections.flatMap(s=>s.rows).find(s=>s.key===r.key);assert.ok(swap);assert.deepEqual(r.first,swap.second);assert.deepEqual(r.second,swap.first);if(peer.productId===id)assert.equal(r.different,false);}assert.equal(a.sections.flatMap(s=>s.rows).find(r=>r.key==='dyr.tannskade.dekning').first.state,'included');}
 }
 assert.equal(materializeCatalogProduct(product(ids[1])).facts.find(f=>f.key==='dyr.allergi.dekning').state,'included');
});

test('R-065-ISOLATION: exact provider/type/scope/version; annual TR versus lifetime cap; dog unchanged',()=>{
 for(const id of ids){const p=product(id);for(const [provider,version,type,scope]of [['tryg',p.version,'Katt','ordinary'],['if','invented','Katt','ordinary'],['if',p.version,'Hund','ordinary'],['if',p.version,'Katt','nito']])assert.equal(findCatalogProduct(provider,id,version,{insuranceType:type,agreementScope:scope}),null);assert.equal(p.version,'2022-12-01');assert.equal(p.company,'If');assert.ok(facts(id).every(f=>f.source.documentId==='boat-pet:if:katt'));}
 assert.ok(!facts(ids[0]).some(f=>f.key==='dyr.tannsykdom.grense'||f.key==='dyr.allergi.grense'));assert.ok(!facts(ids[1]).some(f=>f.key==='dyr.veterinar.rollover'));
 assert.match(fact(ids[1],'dyr.tannsykdom.grense').value,/5 000 kr i løpet av kattens liv/);assert.doesNotMatch(fact(ids[2],'dyr.tannsykdom.dekning').value,/løpet av kattens liv/);assert.match(fact(ids[2],'dyr.tannsykdom.dekning').value,/tannresorpsjon \(TR\) dekkes med inntil 5 000 kr årlig/);
 assert.match(fact('if-hund-standard','dyr.tannsykdom.grense').value,/15 000 kr i løpet av hundens liv/);assert.match(fact('if-hund-super','dyr.tannsykdom.dekning').value,/tilsvarende veterinærdekning/);
 assert.doesNotMatch(fact('if-hund-super','dyr.tannsykdom.dekning').value,/5 000/);
});
