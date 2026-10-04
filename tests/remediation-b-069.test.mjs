import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog,findCatalogProduct} from '../lib/product-catalog.ts';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {vehicleObjectCoverageMatrix} from '../lib/vehicle-object-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,sourceHash,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';
// B-069 / RC-045 / SCRC-036 / RB-32: exact 4 P1 and 8 own-source GAP/SF.
const ids=['if-tilhenger-delkasko','if-tilhenger-kasko'];
const motor='if-Vilkaar-4103ea25.pdf',general='if-Vilkaar-df7c20ba.pdf';
const own=(id,key)=>fact(id,'tilhenger.'+key);
const check=(f,patterns)=>{for(const p of patterns)assert.match(f.value,p);return f;};
const bindings=[
  {
    "signature": "ab806b76b6a411c5",
    "GAP": "GAP-3303",
    "SF": "SF-4647",
    "product": "if-tilhenger-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt2",
    "oracle": "Europa, bare europeisk Tyrkia; Kosovo, Russland og Belarus unntatt. Rettshjelp bare Norden."
  },
  {
    "signature": "0f691bc408e93d23",
    "GAP": "GAP-3304",
    "SF": "SF-4649",
    "product": "if-tilhenger-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "24 pkt12",
    "oracle": "Personlig eier/rettmessig bruker/fører; økonomisk tvist bare sikret i bevis. Tvist etter salg og leasingretur kan omfattes."
  },
  {
    "signature": "fed9942b2bec85fc",
    "GAP": "GAP-3305",
    "SF": "SF-4650",
    "product": "if-tilhenger-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "point": "10–11 pkt23.2–23.3",
    "oracle": "100 000 per tvist; 250 000 hvis minst3parter på samme side og i vesentlig samme spørsmål. Ikke idømte saksomkostninger."
  },
  {
    "signature": "c49847dfd7a04a85",
    "GAP": "GAP-3307",
    "SF": "SF-4653",
    "product": "if-tilhenger-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4–5 pkt4.2/4.5",
    "oracle": "Brann må ha åpen flamme; kortslutning elektronikk/batteri først ved åpen flamme utenfor enheten. Natur i Norden: skred/storm/flom/stormflo/jordskjelv/vulkan."
  },
  {
    "signature": "ab806b76b6a411c5",
    "GAP": "GAP-3319",
    "SF": "SF-4669",
    "product": "if-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt2",
    "oracle": "Europa, bare europeisk Tyrkia; Kosovo, Russland og Belarus unntatt. Rettshjelp bare Norden."
  },
  {
    "signature": "0f691bc408e93d23",
    "GAP": "GAP-3320",
    "SF": "SF-4671",
    "product": "if-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "24 pkt12",
    "oracle": "Personlig eier/rettmessig bruker/fører; økonomisk tvist bare sikret i bevis. Tvist etter salg og leasingretur kan omfattes."
  },
  {
    "signature": "fed9942b2bec85fc",
    "GAP": "GAP-3321",
    "SF": "SF-4672",
    "product": "if-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "point": "10–11 pkt23.2–23.3",
    "oracle": "100 000 per tvist; 250 000 hvis minst3parter på samme side og i vesentlig samme spørsmål. Ikke idømte saksomkostninger."
  },
  {
    "signature": "c49847dfd7a04a85",
    "GAP": "GAP-3323",
    "SF": "SF-4675",
    "product": "if-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4–5 pkt4.2/4.5",
    "oracle": "Brann må ha åpen flamme; kortslutning elektronikk/batteri først ved åpen flamme utenfor enheten. Natur i Norden: skred/storm/flom/stormflo/jordskjelv/vulkan."
  }
];
const sources=[
  {
    "path": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "urls": [
      "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring"
    ],
    "actual_sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987"
  },
  {
    "path": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "urls": [
      "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Generelle_vilk%C3%A5r"
    ],
    "actual_sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046"
  }
];
const controls=[
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,4,18",
    "classification": "SOURCE_FACT_CUSTOMER_SPECIFIC",
    "structured_value": "Dekningsnivå, tilvalg, sum og egenandel bestemmes av bevis; kundeverdi skal ikke oppfinnes fra standardvilkåret.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1238",
    "SF_ID": "SF-4648",
    "product": "if-tilhenger-delkasko",
    "name": "if Tilhenger Avtalevalg / individuelt bevis"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "19 pkt8.5.2",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "4 000 +20% av overskytende; én egenandel per tvist.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1239",
    "SF_ID": "SF-4651",
    "product": "if-tilhenger-delkasko",
    "name": "if Tilhenger Rettshjelp / egenandel"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "18–19 pkt8.5",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Brann/tyveri/hærverk/natur standard8 000; individuell/særvilkår går foran.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1240",
    "SF_ID": "SF-4659",
    "product": "if-tilhenger-delkasko",
    "name": "if Tilhenger Egenandel / standard og individuelle avvik"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,19–26;GEN3–12",
    "classification": "NOT_COMPARISON_RELEVANT",
    "structured_value": "Premie, varsler, svik, klage, skjønn og lovvalg beholdes i kilde; ikke alle til egne sammenligningsfakta.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1241",
    "SF_ID": "SF-4663",
    "product": "if-tilhenger-delkasko",
    "name": "if Tilhenger Administrative bestemmelser / avtale/oppsigelse/skjønn"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,4,18",
    "classification": "SOURCE_FACT_CUSTOMER_SPECIFIC",
    "structured_value": "Dekningsnivå, tilvalg, sum og egenandel bestemmes av bevis; kundeverdi skal ikke oppfinnes fra standardvilkåret.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1242",
    "SF_ID": "SF-4670",
    "product": "if-tilhenger-kasko",
    "name": "if Tilhenger Avtalevalg / individuelt bevis"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "19 pkt8.5.2",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "4 000 +20% av overskytende; én egenandel per tvist.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1243",
    "SF_ID": "SF-4673",
    "product": "if-tilhenger-kasko",
    "name": "if Tilhenger Rettshjelp / egenandel"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "18–19 pkt8.5",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Brann/tyveri/hærverk/natur standard8 000; individuell/særvilkår går foran.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1244",
    "SF_ID": "SF-4681",
    "product": "if-tilhenger-kasko",
    "name": "if Tilhenger Egenandel / standard og individuelle avvik"
  },
  {
    "product_identity": "[\"if\",\"tilhenger\",\"ordinary\",\"if-tilhenger-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,19–26;GEN3–12",
    "classification": "NOT_COMPARISON_RELEVANT",
    "structured_value": "Premie, varsler, svik, klage, skjønn og lovvalg beholdes i kilde; ikke alle til egne sammenligningsfakta.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1245",
    "SF_ID": "SF-4687",
    "product": "if-tilhenger-kasko",
    "name": "if Tilhenger Administrative bestemmelser / avtale/oppsigelse/skjønn"
  }
];

function provenance(f){
 for(const s of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])]){
  const reg=productCatalog.sources[s.documentId];assert.ok(reg);assert.equal(reg.company,'if');assert.equal(s.documentId,'vehicle:'+s.filename);assert.equal(s.url,reg.url);assert.equal(s.termsNumber,reg.termsNumber);assert.equal(s.effectiveFrom,reg.effectiveFrom);assert.ok(s.page>=1);assert.ok(s.section);sourceHash('catalog/sources/vehicle-extensions/'+s.filename,sources.find(x=>x.path.endsWith('/'+s.filename)).sha256);
  if(s.filename===motor){assert.equal(s.termsNumber,'MOT2-2');assert.equal(s.effectiveFrom,'2024-03');}
  else{assert.equal(s.filename,general);assert.equal(s.termsNumber,'GEN2-9');assert.equal(s.effectiveFrom,'2025-06');}
 }
}
function dimension(id,signature){
 const checked=[],c=(key,patterns)=>{const f=check(own(id,key),patterns);checked.push(f);return f;};
 switch(signature){
 case 'ab806b76b6a411c5':c('avtale.geografi',[/Europa/,/i Tyrkia bare den europeiske delen/,/Kosovo, Russland og Belarus er unntatt/,/Rettshjelp gjelder bare i Norden/]);assert.equal(c('rettshjelp.geografi',[/^Norden$/]).value,'Norden');for(const f of checked)assert.equal(f.source.page,3);break;
 case '0f691bc408e93d23':c('rettshjelp.dekning',[/rimelige og nødvendige/i,/personlig eier, rettmessig bruker eller fører/,/Ved økonomiske forhold.*bare den som er nevnt i forsikringsbeviset/,/ved tvist knyttet til bruk er også rettmessig bruker eller fører sikret/,/solgt og forsikringen opphørte i forbindelse med salget.*tidligere eier/,/tilbakelevert og forsikringen opphørte i forbindelse med tilbakeleveringen.*leasingtaker/]);assert.equal(checked[0].source.page,24);break;
 case 'fed9942b2bec85fc':c('rettshjelp.grense',[/100 000 kr per tvist/,/tre eller flere parter på sikredes side/,/faktiske og juridiske problemstillingene i det alt vesentlige er de samme/,/samlet forsikringssum inntil 250 000 kr/,/Idømte saksomkostninger dekkes ikke/,/Annen forsikringssum i bransjevilkåret går foran/]);assert.equal(checked[0].source.filename,general);assert.equal(checked[0].source.page,11);assert.equal(checked[0].qualificationSource.filename,general);assert.equal(checked[0].qualificationSource.page,10);assert.doesNotMatch(checked[0].value,/per forsikringsår|per person|per part|boligselger/);break;
 case 'c49847dfd7a04a85':c('brann.dekning',[/brann ved åpen flamme, lynnedslag eller eksplosjon/,/kortslutning.*batterier og elektroniske enheter omfattes bare når.*åpen ild på utsiden av enheten/]);c('naturskade.dekning',[/^Skade som direkte skyldes naturskade ved skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden$/]);assert.equal(checked[0].source.page,4);assert.equal(checked[1].source.page,5);break;
 default:assert.fail(signature);
 }
 for(const f of checked)provenance(f);return checked;
}
for(const s of sources)test('R-069-HASH '+s.path,()=>sourceHash(s.path,s.sha256));
test('R-069-SET exact four signatures/eight bindings and ordinary2024-03 scope',()=>{
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-069');assert.deepEqual([...new Set(bindings.map(b=>b.signature))].sort(),batch.signature_ids.toSorted());assert.equal(bindings.length,8);assert.equal(new Set(bindings.map(b=>b.GAP)).size,8);assert.equal(new Set(bindings.map(b=>b.SF)).size,8);assert.equal(controls.length,8);
 for(const id of ids){const p=product(id);assert.equal(p.providerId,'if');assert.equal(p.company,'If');assert.equal(p.insuranceType,'Tilhenger');assert.equal(p.version,'2024-03');assert.equal(catalogAgreementScope(p),'ordinary');}
});
for(const b of bindings)test(`R-069-BINDING ${b.GAP}/${b.SF} ${b.signature}`,()=>{sourceHash(b.source,b.sha256);assert.ok(dimension(b.product,b.signature).length);});
test('R-069-SOURCE own applicable MOT2-2 and explicitly incorporated GEN2-9',async()=>{
 PDFParse.setWorker(getPath());for(const file of [motor,general]){
  const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+file,import.meta.url))});try{const out=await parser.getText();const page=n=>out.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');
   if(file===motor){assert.equal(out.pages.length,26);
    for(const p of [/forsikring kun i den europeiske delen/,/Kosovo, Russland og Belarus/,/Rettshjelpsforsikringen gjelder i Norden/])assert.match(page(3),p);
    for(const p of [/Delkaskoforsikring Alt under Ansvarsforsikring/,/Naturskade, se punkt 4\.5/,/brann ved åpen flamme, lynnedslag eller eksplosjon/,/åpen ild på utsiden av enheten/])assert.match(page(4),p);
    assert.match(page(5),/skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden/);assert.match(page(19),/4 000 kroner med tillegg av 20 % av det overskytende/);assert.match(page(19),/bare en egenandel for hver tvist/);assert.match(page(19),/Egenandel 8 000 kroner/);
    for(const p of [/personlig eier, rettmessig bruker eller fører/,/bare den som er nevnt i forsikringsbeviset/,/forsikringen opphørte i forbindelse med salget/,/forsikringen opphørte i forbindelse med tilbakelevering/])assert.match(page(24),p);
    assert.match(out.text.replace(/\s+/g,' '),/Generelle vilkår/);
   }else{assert.equal(out.pages.length,13);assert.match(page(10),/Når det av bransjevilkåret kommer frem at rettshjelp er omfattet/);assert.match(page(10),/Idømte saksomkostninger dekkes ikke/);for(const p of [/100 000 kroner/,/tre eller flere parter på sikredes side/,/faktiske og juridiske problemstillinger i det alt vesentlige er de samme/,/250 000 kroner/,/gjelder da foran ovennevnte forsikringssummer/])assert.match(page(11),p);}
  }finally{await parser.destroy();}
 }
});
for(const c of controls)test(c.control_id+' '+c.name,()=>{
 sourceHash(c.source_artifact,sources.find(s=>s.path===c.source_artifact).sha256);
 if(c.name.includes('Rettshjelp')){assert.equal(own(c.product,'rettshjelp.egenandel').value,'4 000 kr + 20 % av det overskytende');assert.equal(own(c.product,'rettshjelp.egenandel').source.page,19);documentPriority(c.product,'tilhenger.rettshjelp.egenandel','9 999 kr etter kundens bevis');}
 else if(c.name.includes('Egenandel'))for(const key of ['brann.egenandel','tyveri.egenandel'])check(own(c.product,key),[/8 000 kr/,/annet ikke er avtalt i særvilkår\/forsikringsbevis/]);
 else if(c.classification==='SOURCE_FACT_CUSTOMER_SPECIFIC'){const out=enrich(c.product,[]);assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);assert.equal(out.addOnIds.length,0);assert.equal(own(c.product,'avtale.forsikringssum').value,'Gjenanskaffelsesverdi av angitt tilhenger med fastmontert utstyr');}
 else{assert.equal(c.classification,'NOT_COMPARISON_RELEVANT');assert.ok(!facts(c.product).some(f=>f.key==='tilhenger.administrasjon.dekning'));}
});
for(const id of ids)test('R-069-CUSTOMER '+id+' document precedence, decline and unknown',()=>{
 for(const b of bindings.filter(b=>b.product===id))for(const f of dimension(id,b.signature))documentPriority(id,f.key,'Kundens eksplisitte avtaleverdi');
 for(const key of ['rettshjelp.dekning','brann.dekning','naturskade.dekning']){const full='tilhenger.'+key;assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger',full).status,'selected');const declined=enrich(id,[{canonicalKey:full,name:own(id,key).label,value:'Ikke valgt'}]);assert.equal(canonicalCoverage(declined,'Tilhenger',full).status,'not_selected');assert.ok(!declined.importantTerms.some(t=>t.key===full&&t.coverageOrigin==='catalog'));}
 assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger','tilhenger.redning.dekning').status,'unknown');assert.equal(enrich(id,[]).addOnIds.length,0);
});
for(const id of ids)test('R-069-MULTISOURCE '+id+' legal limit retains primary/qualification in both flows',()=>{
 const f=own(id,'rettshjelp.grense');for(const insurance of [enrich(id,[]),manual(id)]){const t=insurance.importantTerms.find(t=>t.key===f.key);assert.ok(t);assert.equal(t.value,f.value);for(const s of [f.source,f.qualificationSource])assert.ok(t.sources.some(x=>x.documentId===s.documentId&&x.filename===s.filename&&x.page===s.page));}
 assert.equal(vehicleObjectCoverageMatrix[id]['tilhenger.naturskade.dekning'],'standard');
});
test('R-069-COMPARISON same-product, both directions and held-out provider peers',()=>{
 for(const id of ids)for(const peer of [...ids,'tryg-tilhenger-kasko','gjensidige-tilhenger-kasko']){const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows),b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const entry of bindings.filter(x=>x.product===id))for(const f of dimension(id,entry.signature)){const r=a.find(r=>r.key===f.key),s=b.find(r=>r.key===f.key);assert.ok(r);assert.ok(s);assert.equal(r.first.state,'included');assert.deepEqual(r.first,s.second);assert.deepEqual(r.second,s.first);if(id===peer)assert.equal(r.different,false);}
 }
});
test('R-069-ISOLATION provider, type, scope, version and untouched adjacent level',()=>{
 for(const id of ids){const p=product(id);for(const opts of [{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Tilhenger',agreementScope:'nito'}])assert.equal(findCatalogProduct('if',id,p.version,opts),null);assert.equal(findCatalogProduct('tryg',id,p.version,{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('if',id,'1900-01-01',{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);assert.ok(facts(id).every(f=>f.key.startsWith('tilhenger.')));assert.equal(enrich(id,[]).addOnIds.length,0);}
 assert.ok(!facts(ids[0]).some(f=>f.key==='tilhenger.kasko.dekning'));assert.equal(own(ids[1],'kasko.dekning').value,'Inkludert i produktnivået');assert.equal(vehicleObjectCoverageMatrix[ids[0]]['tilhenger.kasko.dekning'],'not_included');assert.equal(vehicleObjectCoverageMatrix[ids[1]]['tilhenger.kasko.dekning'],'standard');
});
