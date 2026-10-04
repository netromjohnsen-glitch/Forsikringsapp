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
// B-068 / RC-044 / SCRC-036 / RB-32: source-led exact 7 P1, 18 GAP/SF.
const ids=['if-snoscooter-ansvar','if-snoscooter-delkasko','if-snoscooter-kasko'];
const motor='if-Vilkaar-4103ea25.pdf',general='if-Vilkaar-df7c20ba.pdf',web='if-snoscooterforsikring.html';
const own=(id,key)=>fact(id,'snoscooter.'+key);
const check=(f,patterns)=>{for(const p of patterns)assert.match(f.value,p);return f;};
const bindings=[
  {
    "signature": "0ed88244fe0c2339",
    "GAP": "GAP-3195",
    "SF": "SF-4512",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-snoscooterforsikring.html",
    "sha256": "9546c45652e033a4b0e15700abacb52dd2d820b26c313858df5f92d1ba3e02f3",
    "point": "Fastmontert tilleggsutstyr og bagasje",
    "oracle": "Samlet40 000;deler tilhørende kjøretøy men umontert separat40 000."
  },
  {
    "signature": "0ed88244fe0c2339",
    "GAP": "GAP-3220",
    "SF": "SF-4544",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-snoscooterforsikring.html",
    "sha256": "9546c45652e033a4b0e15700abacb52dd2d820b26c313858df5f92d1ba3e02f3",
    "point": "Fastmontert tilleggsutstyr og bagasje",
    "oracle": "Samlet40 000;deler tilhørende kjøretøy men umontert separat40 000."
  },
  {
    "signature": "33da004a3560a4a7",
    "GAP": "GAP-3181",
    "SF": "SF-4494",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4–5 pkt4.2/4.5",
    "oracle": "Brann må ha åpen flamme; kortslutning elektronikk/batteri først ved åpen flamme utenfor enheten. Natur i Norden: skred/storm/flom/stormflo/jordskjelv/vulkan."
  },
  {
    "signature": "33da004a3560a4a7",
    "GAP": "GAP-3204",
    "SF": "SF-4524",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4–5 pkt4.2/4.5",
    "oracle": "Brann må ha åpen flamme; kortslutning elektronikk/batteri først ved åpen flamme utenfor enheten. Natur i Norden: skred/storm/flom/stormflo/jordskjelv/vulkan."
  },
  {
    "signature": "3ad25f503ce921f7",
    "GAP": "GAP-3161",
    "SF": "SF-4470",
    "product": "if-snoscooter-ansvar",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4 pkt4.1;19 pkt8.5.1",
    "oracle": "Ansvar etter lov på skadested; EØS bruker norsk lov når gunstigere, særregel personskade utenfor EØS. Ingen egenandel."
  },
  {
    "signature": "3ad25f503ce921f7",
    "GAP": "GAP-3174",
    "SF": "SF-4486",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4 pkt4.1;19 pkt8.5.1",
    "oracle": "Ansvar etter lov på skadested; EØS bruker norsk lov når gunstigere, særregel personskade utenfor EØS. Ingen egenandel."
  },
  {
    "signature": "3ad25f503ce921f7",
    "GAP": "GAP-3197",
    "SF": "SF-4516",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "4 pkt4.1;19 pkt8.5.1",
    "oracle": "Ansvar etter lov på skadested; EØS bruker norsk lov når gunstigere, særregel personskade utenfor EØS. Ingen egenandel."
  },
  {
    "signature": "5ad36feb3dba2c8d",
    "GAP": "GAP-3183",
    "SF": "SF-4496",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt3",
    "oracle": "40 000 samlet, maks50% av kjøretøyverdi. Høyere sum kan avtales; ordinært fabrikk-/nybilutstyr inngår som del av kjøretøy."
  },
  {
    "signature": "5ad36feb3dba2c8d",
    "GAP": "GAP-3206",
    "SF": "SF-4526",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt3",
    "oracle": "40 000 samlet, maks50% av kjøretøyverdi. Høyere sum kan avtales; ordinært fabrikk-/nybilutstyr inngår som del av kjøretøy."
  },
  {
    "signature": "65f34b7fb16c7696",
    "GAP": "GAP-3166",
    "SF": "SF-4475",
    "product": "if-snoscooter-ansvar",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "point": "10–11 pkt23.2–23.3",
    "oracle": "100 000 per tvist; 250 000 hvis minst3parter på samme side og i vesentlig samme spørsmål. Ikke idømte saksomkostninger."
  },
  {
    "signature": "65f34b7fb16c7696",
    "GAP": "GAP-3179",
    "SF": "SF-4491",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "point": "10–11 pkt23.2–23.3",
    "oracle": "100 000 per tvist; 250 000 hvis minst3parter på samme side og i vesentlig samme spørsmål. Ikke idømte saksomkostninger."
  },
  {
    "signature": "65f34b7fb16c7696",
    "GAP": "GAP-3202",
    "SF": "SF-4521",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
    "point": "10–11 pkt23.2–23.3",
    "oracle": "100 000 per tvist; 250 000 hvis minst3parter på samme side og i vesentlig samme spørsmål. Ikke idømte saksomkostninger."
  },
  {
    "signature": "719deb857df6152c",
    "GAP": "GAP-3160",
    "SF": "SF-4468",
    "product": "if-snoscooter-ansvar",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt2",
    "oracle": "Europa, bare europeisk Tyrkia; Kosovo, Russland og Belarus unntatt. Rettshjelp bare Norden."
  },
  {
    "signature": "719deb857df6152c",
    "GAP": "GAP-3173",
    "SF": "SF-4484",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt2",
    "oracle": "Europa, bare europeisk Tyrkia; Kosovo, Russland og Belarus unntatt. Rettshjelp bare Norden."
  },
  {
    "signature": "719deb857df6152c",
    "GAP": "GAP-3196",
    "SF": "SF-4514",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "3 pkt2",
    "oracle": "Europa, bare europeisk Tyrkia; Kosovo, Russland og Belarus unntatt. Rettshjelp bare Norden."
  },
  {
    "signature": "94a6571e0963ef9e",
    "GAP": "GAP-3165",
    "SF": "SF-4474",
    "product": "if-snoscooter-ansvar",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "24 pkt12",
    "oracle": "Personlig eier/rettmessig bruker/fører; økonomisk tvist bare sikret i bevis. Tvist etter salg og leasingretur kan omfattes."
  },
  {
    "signature": "94a6571e0963ef9e",
    "GAP": "GAP-3178",
    "SF": "SF-4490",
    "product": "if-snoscooter-delkasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "24 pkt12",
    "oracle": "Personlig eier/rettmessig bruker/fører; økonomisk tvist bare sikret i bevis. Tvist etter salg og leasingretur kan omfattes."
  },
  {
    "signature": "94a6571e0963ef9e",
    "GAP": "GAP-3201",
    "SF": "SF-4520",
    "product": "if-snoscooter-kasko",
    "source": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "point": "24 pkt12",
    "oracle": "Personlig eier/rettmessig bruker/fører; økonomisk tvist bare sikret i bevis. Tvist etter salg og leasingretur kan omfattes."
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
  },
  {
    "path": "catalog/sources/vehicle-extensions/if-snoscooterforsikring.html",
    "sha256": "9546c45652e033a4b0e15700abacb52dd2d820b26c313858df5f92d1ba3e02f3",
    "urls": [
      "https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring"
    ],
    "actual_sha256": "9546c45652e033a4b0e15700abacb52dd2d820b26c313858df5f92d1ba3e02f3"
  }
];
const controls=[
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-ansvar\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,4,18",
    "classification": "SOURCE_FACT_CUSTOMER_SPECIFIC",
    "structured_value": "Dekningsnivå, tilvalg, sum og egenandel bestemmes av bevis; kundeverdi skal ikke oppfinnes fra standardvilkåret.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1212",
    "SF_ID": "SF-4469",
    "product": "if-snoscooter-ansvar",
    "name": "if Snøscooter Avtalevalg / individuelt bevis"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-ansvar\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "19 pkt8.5.2",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "4 000 +20% av overskytende; én egenandel per tvist.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1213",
    "SF_ID": "SF-4476",
    "product": "if-snoscooter-ansvar",
    "name": "if Snøscooter Rettshjelp / egenandel"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-ansvar\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,19–26;GEN3–12",
    "classification": "NOT_COMPARISON_RELEVANT",
    "structured_value": "Premie, varsler, svik, klage, skjønn og lovvalg beholdes i kilde; ikke alle til egne sammenligningsfakta.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1214",
    "SF_ID": "SF-4480",
    "product": "if-snoscooter-ansvar",
    "name": "if Snøscooter Administrative bestemmelser / avtale/oppsigelse/skjønn"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,4,18",
    "classification": "SOURCE_FACT_CUSTOMER_SPECIFIC",
    "structured_value": "Dekningsnivå, tilvalg, sum og egenandel bestemmes av bevis; kundeverdi skal ikke oppfinnes fra standardvilkåret.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1215",
    "SF_ID": "SF-4485",
    "product": "if-snoscooter-delkasko",
    "name": "if Snøscooter Avtalevalg / individuelt bevis"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "19 pkt8.5.2",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "4 000 +20% av overskytende; én egenandel per tvist.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1216",
    "SF_ID": "SF-4492",
    "product": "if-snoscooter-delkasko",
    "name": "if Snøscooter Rettshjelp / egenandel"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "18–19 pkt8.5",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Brann/tyveri/hærverk/natur standard8 000; individuell/særvilkår går foran.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1217",
    "SF_ID": "SF-4498",
    "product": "if-snoscooter-delkasko",
    "name": "if Snøscooter Egenandel / standard og individuelle avvik"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-delkasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,19–26;GEN3–12",
    "classification": "NOT_COMPARISON_RELEVANT",
    "structured_value": "Premie, varsler, svik, klage, skjønn og lovvalg beholdes i kilde; ikke alle til egne sammenligningsfakta.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1218",
    "SF_ID": "SF-4505",
    "product": "if-snoscooter-delkasko",
    "name": "if Snøscooter Administrative bestemmelser / avtale/oppsigelse/skjønn"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,4,18",
    "classification": "SOURCE_FACT_CUSTOMER_SPECIFIC",
    "structured_value": "Dekningsnivå, tilvalg, sum og egenandel bestemmes av bevis; kundeverdi skal ikke oppfinnes fra standardvilkåret.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1219",
    "SF_ID": "SF-4515",
    "product": "if-snoscooter-kasko",
    "name": "if Snøscooter Avtalevalg / individuelt bevis"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "19 pkt8.5.2",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "4 000 +20% av overskytende; én egenandel per tvist.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1220",
    "SF_ID": "SF-4522",
    "product": "if-snoscooter-kasko",
    "name": "if Snøscooter Rettshjelp / egenandel"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "18–19 pkt8.5",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Brann/tyveri/hærverk/natur standard8 000; individuell/særvilkår går foran.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1221",
    "SF_ID": "SF-4528",
    "product": "if-snoscooter-kasko",
    "name": "if Snøscooter Egenandel / standard og individuelle avvik"
  },
  {
    "product_identity": "[\"if\",\"snøscooter\",\"ordinary\",\"if-snoscooter-kasko\",\"2024-03\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf",
    "source_location": "2,19–26;GEN3–12",
    "classification": "NOT_COMPARISON_RELEVANT",
    "structured_value": "Premie, varsler, svik, klage, skjønn og lovvalg beholdes i kilde; ikke alle til egne sammenligningsfakta.",
    "reason": "Eksakt lokal regel sammenholdt med alle basis- og tilleggsfakta.",
    "control_id": "PC-1222",
    "SF_ID": "SF-4537",
    "product": "if-snoscooter-kasko",
    "name": "if Snøscooter Administrative bestemmelser / avtale/oppsigelse/skjønn"
  }
];

function provenance(f){
 for(const s of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])]){
  const reg=productCatalog.sources[s.documentId];assert.ok(reg);assert.equal(s.documentId,'vehicle:'+s.filename);assert.equal(s.url,reg.url);assert.equal(s.termsNumber,reg.termsNumber);assert.equal(s.effectiveFrom,reg.effectiveFrom);assert.ok(s.page>=1);assert.ok(s.section);sourceHash('catalog/sources/vehicle-extensions/'+s.filename,sources.find(x=>x.path.endsWith('/'+s.filename)).sha256);
  if(s.filename===motor){assert.equal(s.termsNumber,'MOT2-2');assert.equal(s.effectiveFrom,'2024-03');}
  if(s.filename===general){assert.equal(s.termsNumber,'GEN2-9');assert.equal(s.effectiveFrom,'2025-06');}
  if(s.filename===web){assert.equal(s.termsNumber,'');assert.equal(s.effectiveFrom,'');assert.equal(s.version,undefined);}
 }
}
const joint=[/Én felles erstatningsgrense på 40 000 kr samlet for ettermontert tilleggsutstyr og bagasje/,/begrenset til 50 % av kjøretøyets gjenanskaffelsesverdi umiddelbart før skaden/,/Forsikringssummen kan utvides ved å kontakte If/,/Utstyr levert og montert før kjøretøyet ble levert som nytt, inngår som del av kjøretøyet/];
function dimension(id,signature){
 const checked=[],c=(key,patterns)=>{const f=check(own(id,key),patterns);checked.push(f);return f;};
 switch(signature){
 case '719deb857df6152c':c('avtale.geografi',[/Europa/,/i Tyrkia bare den europeiske delen/,/Kosovo, Russland og Belarus er unntatt/,/Rettshjelp gjelder bare i Norden/]);assert.equal(c('rettshjelp.geografi',[/^Norden$/]).value,'Norden');break;
 case '3ad25f503ce921f7':c('ansvar.dekning',[/Skade på personer og ting som skades av forsikret kjøretøy/,/I Norge gjelder norsk bilansvarslov/,/utenfor Norge gjelder skadestedets lovgivning for bilansvar/,/Innenfor EØS dekkes skader etter norske regler dersom dette gir høyere dekning/,/utenfor EØS for personskadeerstatning til fører og passasjerer som har vanlig bosted i Norden/]);assert.equal(c('ansvar.egenandel',[/^Ingen egenandel$/]).source.page,19);break;
 case '94a6571e0963ef9e':c('rettshjelp.dekning',[/rimelige og nødvendige/i,/personlig eier, rettmessig bruker eller fører/,/Ved økonomiske forhold.*bare den som er nevnt i forsikringsbeviset/,/ved tvist knyttet til bruk er også rettmessig bruker eller fører sikret/,/solgt og forsikringen opphørte i forbindelse med salget.*tidligere eier/,/tilbakelevert og forsikringen opphørte i forbindelse med tilbakeleveringen.*leasingtaker/]);assert.equal(checked[0].source.page,24);break;
 case '65f34b7fb16c7696':c('rettshjelp.grense',[/100 000 kr per tvist/,/tre eller flere parter på sikredes side/,/faktiske og juridiske problemstillingene i det alt vesentlige er de samme/,/samlet forsikringssum inntil 250 000 kr/,/Idømte saksomkostninger dekkes ikke/,/Annen forsikringssum i bransjevilkåret går foran/]);assert.equal(checked[0].source.filename,general);assert.equal(checked[0].source.page,11);assert.equal(checked[0].qualificationSource.page,10);break;
 case '33da004a3560a4a7':assert.notEqual(id,ids[0]);c('brann.dekning',[/brann ved åpen flamme, lynnedslag eller eksplosjon/,/kortslutning.*batterier og elektroniske enheter omfattes bare når.*åpen ild på utsiden av enheten/]);c('naturskade.dekning',[/Skade som direkte skyldes naturskade ved skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden/]);assert.equal(checked[0].source.page,4);assert.equal(checked[1].source.page,5);break;
 case '5ad36feb3dba2c8d':case '0ed88244fe0c2339':assert.notEqual(id,ids[0]);c('losore.grense',joint);c('utstyr.grense',[...joint,/i tillegg inntil 40 000 kr for deler som tilhører kjøretøyet, men som ikke er monterte/,/dette er en separat grense for slike deler/]);
  for(const f of checked){assert.equal(f.source.filename,motor);assert.equal(f.source.page,3);assert.equal(f.qualificationSource.filename,web);assert.equal(f.qualificationSource.page,1);}
  assert.doesNotMatch(checked[0].value,/i tillegg inntil 40 000/);assert.doesNotMatch(checked[1].value,/80 000|40 000 kr per gjenstand/);break;
 default:assert.fail(signature);
 }
 for(const f of checked)provenance(f);return checked;
}
for(const s of sources)test('R-068-HASH '+s.path,()=>sourceHash(s.path,s.sha256));
test('R-068-SET exact signatures/bindings and scope',()=>{
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-068');assert.deepEqual([...new Set(bindings.map(b=>b.signature))].sort(),batch.signature_ids.toSorted());assert.equal(bindings.length,18);assert.equal(new Set(bindings.map(b=>b.GAP)).size,18);assert.equal(new Set(bindings.map(b=>b.SF)).size,18);assert.equal(controls.length,11);
 for(const id of ids){const p=product(id);assert.equal(p.providerId,'if');assert.equal(p.insuranceType,'Snøscooter');assert.equal(p.version,'2024-03');assert.equal(catalogAgreementScope(p),'ordinary');}
});
for(const b of bindings)test(`R-068-BINDING ${b.GAP}/${b.SF} ${b.signature}`,()=>{sourceHash(b.source,b.sha256);assert.ok(dimension(b.product,b.signature).length);});
test('R-068-SOURCE own applicable MOT2-2, imported GEN2-9 and exact website',async()=>{
 PDFParse.setWorker(getPath());for(const file of [motor,general]){
  const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+file,import.meta.url))});try{const out=await parser.getText();const page=n=>out.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');
   if(file===motor){assert.equal(out.pages.length,26);
    for(const p of [/forsikring kun i den europeiske delen/,/Kosovo, Russland og Belarus/,/Rettshjelpsforsikringen gjelder i Norden/,/ettermontert tilleggsutstyr og bagasje, med samlet verdi inntil 40 000 kroner/,/50 % av kjøretøyets gjenanskaffelsesverdi umiddelbart før skaden/,/Forsikringssum kan utvides ved å kontakte If/])assert.match(page(3),p);
    for(const p of [/I Norge gjelder norsk bilansvarslov/,/skadestedets lovgivning for bilansvar/,/Innenfor EØS.*høyere dekning/,/personskadeerstatning til fører og passasjerer som har vanlig bosted i Norden/,/brann ved åpen flamme, lynnedslag eller eksplosjon/,/åpen ild på utsiden av enheten/])assert.match(page(4),p);
    assert.match(page(5),/skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden/);assert.match(page(19),/8\.5\.1 Ansvarsskade Ingen egenandel/);assert.match(page(19),/bare en egenandel for hver tvist/);
    for(const p of [/personlig eier, rettmessig bruker eller fører/,/bare den som er nevnt i forsikringsbeviset/,/forsikringen opphørte i forbindelse med salget/,/forsikringen opphørte i forbindelse med tilbakelevering/])assert.match(page(24),p);
   }else{assert.match(page(10),/Idømte saksomkostninger dekkes ikke/);for(const p of [/100 000 kroner/,/tre eller flere parter på sikredes side/,/faktiske og juridiske problemstillinger i det alt vesentlige er de samme/,/250 000 kroner/])assert.match(page(11),p);}
  }finally{await parser.destroy();}
 }
 const html=readFileSync(new URL('../catalog/sources/vehicle-extensions/'+web,import.meta.url),'utf8');assert.match(html,/Vi dekker fastmontert tilleggsutstyr og bagasje for inntil totalt 40 000 kroner\./);assert.match(html,/I tillegg dekker vi deler som tilhører kjøretøyet, men som ikke er monterte, med inntil 40 000 kroner\./);
});
for(const c of controls)test(c.control_id+' '+c.name,()=>{
 sourceHash(c.source_artifact,sources.find(s=>s.path===c.source_artifact).sha256);
 if(c.name.includes('Rettshjelp')){assert.equal(own(c.product,'rettshjelp.egenandel').value,'4 000 kr + 20 % av det overskytende');assert.equal(own(c.product,'rettshjelp.egenandel').source.page,19);documentPriority(c.product,'snoscooter.rettshjelp.egenandel','9 999 kr etter kundens bevis');}
 else if(c.name.includes('Egenandel'))for(const key of ['brann.egenandel','tyveri.egenandel'])check(own(c.product,key),[/8 000 kr/,/annet ikke er avtalt i særvilkår\/forsikringsbevis/]);
 else if(c.classification==='SOURCE_FACT_CUSTOMER_SPECIFIC'){assert.equal(enrich(c.product,[]).annualPremium,null);assert.equal(enrich(c.product,[]).deductible,null);assert.ok(!facts(c.product).some(f=>f.key==='snoscooter.avtale.forsikringssum'));assert.equal(enrich(c.product,[]).addOnIds.length,0);}
 else{assert.equal(c.classification,'NOT_COMPARISON_RELEVANT');assert.ok(!facts(c.product).some(f=>f.key==='snoscooter.administrasjon.dekning'));}
});
for(const id of ids)test('R-068-CUSTOMER '+id+' priority, decline and included/unknown boundaries',()=>{
 for(const b of bindings.filter(b=>b.product===id))for(const f of dimension(id,b.signature))documentPriority(id,f.key,'Kundens eksplisitte avtaleverdi');
 const keys=['ansvar.dekning','rettshjelp.dekning',...(id===ids[0]?[]:['brann.dekning','naturskade.dekning','utstyr.dekning','losore.dekning'])];
 for(const key of keys){const full='snoscooter.'+key;assert.equal(canonicalCoverage(enrich(id,[]),'Snøscooter',full).status,'selected');const declined=enrich(id,[{canonicalKey:full,name:own(id,key).label,value:'Ikke valgt'}]);assert.equal(canonicalCoverage(declined,'Snøscooter',full).status,'not_selected');assert.ok(!declined.importantTerms.some(t=>t.key===full&&t.coverageOrigin==='catalog'));}
 assert.equal(canonicalCoverage(enrich(id,[]),'Snøscooter','snoscooter.forerulykke.dekning').status,'unknown');
 if(id===ids[0])for(const family of ['naturskade','utstyr','losore']){assert.ok(!facts(id).some(f=>f.key.startsWith('snoscooter.'+family+'.')));assert.equal(canonicalCoverage(enrich(id,[]),'Snøscooter','snoscooter.'+family+'.dekning').status,'unknown');}
});
for(const id of ids.slice(1))test('R-068-MULTISOURCE '+id+' combined cap and distinct unmounted-parts qualifier',()=>{
 for(const key of ['utstyr.grense','losore.grense']){const f=own(id,key);provenance(f);for(const i of [enrich(id,[]),manual(id)]){const t=i.importantTerms.find(t=>t.key===f.key);assert.ok(t);assert.equal(t.value,f.value);for(const s of [f.source,f.qualificationSource])assert.ok(t.sources.some(x=>x.documentId===s.documentId&&x.filename===s.filename&&x.page===s.page));}}
 for(const key of ['utstyr.dekning','losore.dekning','naturskade.dekning'])assert.equal(vehicleObjectCoverageMatrix[id]['snoscooter.'+key],'standard');
});
test('R-068-COMPARISON own facts, same-product, both directions and asymmetric peers',()=>{
 for(const id of ids)for(const peer of [...ids,'tryg-snoscooter-kasko','gjensidige-snoscooter-kasko']){const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows),b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const entry of bindings.filter(x=>x.product===id))for(const f of dimension(id,entry.signature)){const r=a.find(r=>r.key===f.key),s=b.find(r=>r.key===f.key);assert.ok(r);assert.ok(s);assert.equal(r.first.state,'included');assert.deepEqual(r.first,s.second);assert.deepEqual(r.second,s.first);if(id===peer)assert.equal(r.different,false);}
 }
});
test('R-068-ISOLATION no other type/provider/scope/version, no new optional choice',()=>{
 for(const id of ids){const p=product(id);for(const opts of [{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Snøscooter',agreementScope:'nito'}])assert.equal(findCatalogProduct('if',id,p.version,opts),null);assert.equal(findCatalogProduct('tryg',id,p.version,{insuranceType:'Snøscooter',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('if',id,'1900-01-01',{insuranceType:'Snøscooter',agreementScope:'ordinary'}),null);assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);assert.ok(facts(id).every(f=>f.key.startsWith('snoscooter.')));assert.equal(enrich(id,[]).addOnIds.length,0);}
});
