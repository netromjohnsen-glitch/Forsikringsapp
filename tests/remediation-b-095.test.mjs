import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog,findCatalogProduct} from '../lib/product-catalog.ts';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,sourceHash,enrich,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// B-095 / RC-071 / SCRC-045: independent frozen-source oracles, eight bindings.
const ids=['tryg-tilhenger-brann','tryg-tilhenger-brann-og-tyveri','tryg-tilhenger-kasko'];
const own=(id,key)=>fact(id,'tilhenger.'+key);
const check=(f,patterns)=>{for(const pattern of patterns)assert.match(f.value,pattern);return f;};
const baseFile=id=>id===ids[0]?'tryg-odpdf-543856fa.pdf':id===ids[1]?'tryg-odpdf-05b2538c.pdf':'tryg-odpdf-f862c645.pdf';
const bindings=[
  {
    "signature": "7871452b1fcf2b1d",
    "GAP": "GAP-4211",
    "SF": "SF-6032",
    "product": "tryg-tilhenger-brann",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "point": "1 §2.1",
    "oracle": "4khvisikkelavereavtalt;åpenild/lyn/eksplosjon."
  },
  {
    "signature": "7871452b1fcf2b1d",
    "GAP": "GAP-4224",
    "SF": "SF-6051",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "point": "1 §2.1",
    "oracle": "4khvisikkelavereavtalt;åpenild/lyn/eksplosjon."
  },
  {
    "signature": "7871452b1fcf2b1d",
    "GAP": "GAP-4239",
    "SF": "SF-6072",
    "product": "tryg-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "point": "2 §2.2",
    "oracle": "6khvisikkelavereavtalt;åpenild/lyn/eksplosjon."
  },
  {
    "signature": "8c3c4b9bdcca1d0a",
    "GAP": "GAP-4219",
    "SF": "SF-6042",
    "product": "tryg-tilhenger-brann",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "point": "§5.3/6",
    "oracle": "Norden/motorPGE91500:100k/tvist,250kmin3parter,20kmotTrygsrettshjelp,økonomiskinteressetak;4k+20%."
  },
  {
    "signature": "8c3c4b9bdcca1d0a",
    "GAP": "GAP-4234",
    "SF": "SF-6063",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "point": "§5.3/6",
    "oracle": "Norden/motorPGE91500:100k/tvist,250kmin3parter,20kmotTrygsrettshjelp,økonomiskinteressetak;4k+20%."
  },
  {
    "signature": "8c3c4b9bdcca1d0a",
    "GAP": "GAP-4252",
    "SF": "SF-6087",
    "product": "tryg-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "point": "§5.3/6",
    "oracle": "Norden/motorPGE91500:100k/tvist,250kmin3parter,20kmotTrygsrettshjelp,økonomiskinteressetak;4k+20%."
  },
  {
    "signature": "c6201d986f790208",
    "GAP": "GAP-4225",
    "SF": "SF-6052",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "point": "1–2 §2.2",
    "oracle": "Tyveri/brukstyveri/hærverkiforsøk;BrannTyveri4k,Kasko6k hvislavereikkeavtalt."
  },
  {
    "signature": "c6201d986f790208",
    "GAP": "GAP-4240",
    "SF": "SF-6073",
    "product": "tryg-tilhenger-kasko",
    "source": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "point": "2 §2.3",
    "oracle": "Tyveri/brukstyveri/hærverkiforsøk;BrannTyveri4k,Kasko6k hvislavereikkeavtalt."
  }
];
const controls=[
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_location": "1 §3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Europa unntatt Russland/Belarus/Tyrkia; rettshjelp Norden.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1680",
    "SF_ID": "SF-6027",
    "product": "tryg-tilhenger-brann",
    "concept": "Geografi"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_location": "1 §1.1;3 §3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Valgtforsikringssumbevis,maxmarkedsverdi;ikkeenverdigaranti.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1681",
    "SF_ID": "SF-6030",
    "product": "tryg-tilhenger-brann",
    "concept": "Grunnsum"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_location": "§3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Markedsverdiførloss,fradragvrak/omregvedbeholdt;Towtakavtaltsum;ingen nyverdigaranti dokumentert.",
    "reason": "MarkedsverdiforsikringssumbevartTow;snømangleroppgjørsform.",
    "control_id": "PC-1682",
    "SF_ID": "SF-6037",
    "product": "tryg-tilhenger-brann",
    "concept": "Totalskade"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_location": "1 §1.2",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Lås,nøkkelseparat;demontertforteltlåstbygningikke fellesgarasje;vær/vind/flomflytting/gassvedlikehold.",
    "reason": "Forteltsikring/flomflytting/gassvilkårbevaressomkildedetalj.",
    "control_id": "PC-1683",
    "SF_ID": "SF-6040",
    "product": "tryg-tilhenger-brann",
    "concept": "Sikkerhet"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_location": "1–5",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Felleshøyesteegenandel/krigterror/oppgjørsadministrasjonkildebeholdt.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1684",
    "SF_ID": "SF-6044",
    "product": "tryg-tilhenger-brann",
    "concept": "Generelt"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-tilhengerforsikring.html",
    "source_location": "FAQ type",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Privatpersonbil/vare/båt/hestetilhenger;godsikkeegenstandardvaredekning.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1685",
    "SF_ID": "SF-6045",
    "product": "tryg-tilhenger-brann",
    "concept": "Objektvalg"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_location": "1 §3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Europa unntatt Russland/Belarus/Tyrkia; rettshjelp Norden.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1686",
    "SF_ID": "SF-6046",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Geografi"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_location": "1 §1.1;3 §3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Valgtforsikringssumbevis,maxmarkedsverdi;ikkeenverdigaranti.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1687",
    "SF_ID": "SF-6049",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Grunnsum"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_location": "§3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Markedsverdiførloss,fradragvrak/omregvedbeholdt;Towtakavtaltsum;ingen nyverdigaranti dokumentert.",
    "reason": "MarkedsverdiforsikringssumbevartTow;snømangleroppgjørsform.",
    "control_id": "PC-1688",
    "SF_ID": "SF-6058",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Totalskade"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_location": "1 §1.2",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Lås,nøkkelseparat;demontertforteltlåstbygningikke fellesgarasje;vær/vind/flomflytting/gassvedlikehold.",
    "reason": "Forteltsikring/flomflytting/gassvilkårbevaressomkildedetalj.",
    "control_id": "PC-1689",
    "SF_ID": "SF-6061",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Sikkerhet"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_location": "1–5",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Felleshøyesteegenandel/krigterror/oppgjørsadministrasjonkildebeholdt.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1690",
    "SF_ID": "SF-6065",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Generelt"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-brann-og-tyveri\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-tilhengerforsikring.html",
    "source_location": "FAQ type",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Privatpersonbil/vare/båt/hestetilhenger;godsikkeegenstandardvaredekning.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1691",
    "SF_ID": "SF-6066",
    "product": "tryg-tilhenger-brann-og-tyveri",
    "concept": "Objektvalg"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_location": "1 §3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Europa unntatt Russland/Belarus/Tyrkia; rettshjelp Norden.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1692",
    "SF_ID": "SF-6067",
    "product": "tryg-tilhenger-kasko",
    "concept": "Geografi"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_location": "1 §1.1;3 §3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Valgtforsikringssumbevis,maxmarkedsverdi;ikkeenverdigaranti.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1693",
    "SF_ID": "SF-6070",
    "product": "tryg-tilhenger-kasko",
    "concept": "Grunnsum"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_location": "§3.3",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "structured_value": "Markedsverdiførloss,fradragvrak/omregvedbeholdt;Towtakavtaltsum;ingen nyverdigaranti dokumentert.",
    "reason": "MarkedsverdiforsikringssumbevartTow;snømangleroppgjørsform.",
    "control_id": "PC-1694",
    "SF_ID": "SF-6082",
    "product": "tryg-tilhenger-kasko",
    "concept": "Totalskade"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_location": "1 §1.2",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Lås,nøkkelseparat;demontertforteltlåstbygningikke fellesgarasje;vær/vind/flomflytting/gassvedlikehold.",
    "reason": "Forteltsikring/flomflytting/gassvilkårbevaressomkildedetalj.",
    "control_id": "PC-1695",
    "SF_ID": "SF-6085",
    "product": "tryg-tilhenger-kasko",
    "concept": "Sikkerhet"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_location": "1–5",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Felleshøyesteegenandel/krigterror/oppgjørsadministrasjonkildebeholdt.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1696",
    "SF_ID": "SF-6089",
    "product": "tryg-tilhenger-kasko",
    "concept": "Generelt"
  },
  {
    "product_identity": "[\"tryg\",\"tilhenger\",\"ordinary\",\"tryg-tilhenger-kasko\",\"2026-01-01\"]",
    "source_artifact": "catalog/sources/vehicle-extensions/tryg-tilhengerforsikring.html",
    "source_location": "FAQ type",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "structured_value": "Privatpersonbil/vare/båt/hestetilhenger;godsikkeegenstandardvaredekning.",
    "reason": "Korrektnivåregelbevart;fullclaimkontrollert.",
    "control_id": "PC-1697",
    "SF_ID": "SF-6090",
    "product": "tryg-tilhenger-kasko",
    "concept": "Objektvalg"
  }
];
const sources=[
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "urls": [
      "https://www.tryg.no/odpdf?vilkNr=05PAU25255&vilk=Kasko-tilhenger"
    ],
    "actual_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "urls": [
      "https://www.tryg.no/odpdf?vilkNr=05PAU26307&vilk=Branntyveri-tilhenger"
    ],
    "actual_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "urls": [
      "https://www.tryg.no/odpdf?vilkNr=05PAU26506&vilk=Brann-tilhenger"
    ],
    "actual_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "urls": [
      "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Rettshjelp"
    ],
    "actual_sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70",
    "actual_sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd",
    "actual_sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "actual_sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320"
  },
  {
    "path": "catalog/sources/vehicle-extensions/tryg-tilhengerforsikring.html",
    "sha256": "726529e52f01d071e14d8a39729749815298bd2c6edf4f6837f26ce11a9c1e4c",
    "actual_sha256": "726529e52f01d071e14d8a39729749815298bd2c6edf4f6837f26ce11a9c1e4c"
  }
];

function provenance(f){
 const s=f.source,reg=productCatalog.sources[s.documentId];assert.ok(reg);assert.equal(s.documentId,'vehicle:'+s.filename);assert.equal(s.url,reg.url);assert.equal(s.termsNumber,reg.termsNumber);assert.equal(s.effectiveFrom,'2026-01-01');assert.ok(s.page>=1);assert.ok(s.section);
 const hash=s.filename==='tryg-odpdf-f862c645.pdf'?sources.find(s=>s.path.endsWith('03ff0533.pdf')).sha256:sources.find(x=>x.path.endsWith('/'+s.filename))?.sha256;assert.ok(hash);sourceHash('catalog/sources/vehicle-extensions/'+s.filename,hash);
}
function dimension(id,signature){
 const high=id===ids[2],checked=[];const c=(key,patterns)=>{const f=check(own(id,key),patterns);checked.push(f);return f;};
 if(signature==='7871452b1fcf2b1d'){
  c('brann.dekning',[/brann med åpen flamme, eksplosjon og lynnedslag/]);
  c('brann.egenandel',[high?/^6 000 kr/:/^4 000 kr/,/lavere egenandel er avtalt og fremgår av forsikringsbeviset/]);
  for(const f of checked){assert.equal(f.source.filename,baseFile(id));assert.equal(f.source.page,high?2:1);assert.equal(f.source.section,high?'2.2':'2.1');}
 }else if(signature==='c6201d986f790208'){
  assert.notEqual(id,ids[0]);
  c('tyveri.dekning',[/tyveri eller brukstyveri av og fra tilhengeren eller deler av den/,/skade eller hærverk i forbindelse med forsøk på tyveri/,/Dersom det fremgår av forsikringsbeviset at tilhengeren er utleid/,/tap av utleid tilhenger som følge av underslag/,/innen 3 måneder etter at Tryg har mottatt melding om at den er savnet/,/Underslag begått av familiemedlemmer eller ansatte hos forsikringstaker dekkes ikke/]);
  c('tyveri.egenandel',[high?/^6 000 kr/:/^4 000 kr/,/lavere egenandel er avtalt og fremgår av forsikringsbeviset/]);
  for(const f of checked)assert.equal(f.source.filename,baseFile(id));assert.equal(checked[0].source.page,high?2:1);assert.equal(checked[1].source.page,2);
 }else{
  assert.equal(signature,'8c3c4b9bdcca1d0a');
  c('rettshjelp.grense',[/100 000 kr per tvist/,/tre eller flere parter på sikredes side.*250 000 kr/,/Eiere av samme gjenstand regnes som én part/,/flere parter er på samme side og har forsikring i ulike selskaper/,/Ved tvist mot Tryg om dekning av rettshjelp.*20 000 kr uavhengig av antall parter/,/sikredes antatte økonomiske interesse i saken/,/utgifter utover dette må godkjennes av Tryg på forhånd/]);
  c('rettshjelp.egenandel',[/4 000 kr og i tillegg 20 % av utgifter som påløper utover 4 000 kr/,/Én egenandel per tvist selv om flere parter er på samme side/]);
  for(const f of checked){assert.equal(f.source.filename,'tryg-odpdf-d8d47def.pdf');assert.doesNotMatch(f.value,/ID-tyveri|Reiseforsikring|(?<!\d)50 000(?!\d)|per forsikringsår/);}
  assert.equal(checked[0].source.page,4);assert.equal(checked[0].source.section,'6.1');assert.equal(checked[1].source.page,5);assert.equal(checked[1].source.section,'6.2');
 }
 for(const f of checked)provenance(f);return checked;
}
for(const s of sources)test('R-095-HASH '+s.path,()=>sourceHash(s.path,s.sha256));
test('R-095-SET exact three signatures, eight bindings, 18 controls and ordinary scope',()=>{
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-095');
 assert.deepEqual([...new Set(bindings.map(b=>b.signature))].sort(),batch.signature_ids.toSorted());assert.equal(bindings.length,8);assert.equal(new Set(bindings.map(b=>b.GAP)).size,8);assert.equal(new Set(bindings.map(b=>b.SF)).size,8);assert.equal(controls.length,18);
 for(const id of ids){const p=product(id);assert.equal(p.providerId,'tryg');assert.equal(p.insuranceType,'Tilhenger');assert.equal(p.version,'2026-01-01');assert.equal(catalogAgreementScope(p),'ordinary');}
});
for(const b of bindings)test(`R-095-BINDING ${b.GAP}/${b.SF} ${b.signature}`,()=>{sourceHash(b.source,b.sha256);assert.ok(dimension(b.product,b.signature).length);});
test('R-095-SOURCE exact own tiers, conditional embezzlement and motor legal limits',async()=>{
 PDFParse.setWorker(getPath());
 for(const file of ['tryg-odpdf-543856fa.pdf','tryg-odpdf-05b2538c.pdf','tryg-odpdf-03ff0533.pdf','tryg-odpdf-d8d47def.pdf']){
  const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+file,import.meta.url))});
  try{const out=await parser.getText();const page=n=>out.pages.find(p=>p.num===n).text.replace(/\s+/g,' ');
   if(file.includes('d8d47def')){
    for(const p of [/privatperson/,/eier eller rettmessig bruker\/fører/,/forsikrede kjøretøy/])assert.match(page(2),p);
    for(const p of [/100\.000 kroner/,/tre eller flere parter på sikredes side/,/250\.000 kroner/,/Eiere av samme eiendom\/eierseksjon\/gjenstand anses som én part/,/20\.000 kroner uavhengig av antall/,/sikredes antatte økonomiske interesse/,/godkjennes av selskapet på forhånd/])assert.match(page(4),p);
    assert.match(page(5),/20 prosent av de utgifter som påløper utover 4\.000 kroner/);
   }else{
    const high=file.includes('03ff0533');const fire=page(high?2:1);
    assert.match(fire,/brann med åpen flamme, eksplosjon og lynnedslag/);assert.match(fire,high?/6\.000 kroner, hvis ikke lavere egenandel er avtalt og fremgår av forsikringsbeviset/:/4\.000 kroner, hvis ikke lavere egenandel er avtalt og fremgår av forsikringsbeviset/);
    if(!file.includes('543856fa')){const text=out.pages.map(p=>p.text).join(' ').replace(/\s+/g,' ');for(const p of [/skade eller hærverk i forbindelse med forsøk på tyveri/,/Dersom det fremgår av forsikringsbeviset at tilhenger er utleiet/,/innen 3 måneder etter at selskapet har mottatt melding/,/Underslag begått av familiemedlemmer eller ansatte hos forsikringstaker dekkes ikke/])assert.match(text,p);}
   }
  }finally{await parser.destroy();}
 }
});
for(const c of controls)test(c.control_id+' '+c.concept+' own-source control',()=>{
 sourceHash(c.source_artifact,sources.find(s=>s.path===c.source_artifact).sha256);
 if(c.concept==='Geografi')check(own(c.product,'avtale.geografi'),[/Europa unntatt Russland, Belarus og Tyrkia/,/rettshjelp i Norden/]);
 else if(['Grunnsum','Totalskade'].includes(c.concept)){const f=check(own(c.product,'avtale.forsikringssum'),[/Avtalt forsikringssum/,/ved totalskade begrenset til markedsverdien/]);assert.doesNotMatch(f.value,/nyverdi|verdigaranti|\d/);}
 else{assert.equal(c.classification,'SOURCE_ONLY_ACCEPTABLE');const manifest=JSON.parse(readFileSync(new URL('../catalog/sources/vehicle-extensions/manifest.json',import.meta.url)));assert.ok(manifest.documents.some(d=>d.filename===c.source_artifact.split('/').at(-1)));assert.ok(!facts(c.product).some(f=>['tilhenger.avtale.sikkerhet','tilhenger.administrasjon.dekning','tilhenger.gods.dekning'].includes(f.key)));}
});
for(const id of ids)test('R-095-CUSTOMER '+id+' document priority, explicit decline and unknown',()=>{
 for(const b of bindings.filter(b=>b.product===id))for(const f of dimension(id,b.signature))documentPriority(id,f.key,'Kundens eksplisitte avtaleverdi');
 for(const key of ['brann.dekning','rettshjelp.dekning',...(id===ids[0]?[]:['tyveri.dekning'])]){
  const full='tilhenger.'+key;assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger',full).status,'selected');
  const declined=enrich(id,[{canonicalKey:full,name:own(id,key).label,value:'Ikke valgt'}]);assert.equal(canonicalCoverage(declined,'Tilhenger',full).status,'not_selected');assert.ok(!declined.importantTerms.some(t=>t.key===full&&t.coverageOrigin==='catalog'));
 }
 assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger','tilhenger.redning.dekning').status,'unknown');
 if(id===ids[0]){assert.equal(canonicalCoverage(enrich(id,[]),'Tilhenger','tilhenger.tyveri.dekning').status,'unknown');assert.ok(!facts(id).some(f=>f.key.startsWith('tilhenger.tyveri.')));}
 assert.equal(own(id,'naturskade.egenandel').value,'8 000 kr');
});
test('R-095-COMPARISON all tiers, own source values, same product and both sides',()=>{
 for(const id of ids)for(const peer of [...ids,'storebrand-tilhenger-kasko']){
  const forward=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows);const back=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const b of bindings.filter(b=>b.product===id))for(const f of dimension(id,b.signature)){
   const row=forward.find(r=>r.key===f.key),swapped=back.find(r=>r.key===f.key);assert.ok(row);assert.ok(swapped);assert.equal(row.first.state,'included');assert.deepEqual(row.first,swapped.second);assert.deepEqual(row.second,swapped.first);if(id===peer)assert.equal(row.different,false);
  }
 }
});
test('R-095-ISOLATION type, company, scope, version and no campingvogn claims',()=>{
 for(const id of ids){const p=product(id);for(const opts of [{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Tilhenger',agreementScope:'nito'}])assert.equal(findCatalogProduct('tryg',id,p.version,opts),null);assert.equal(findCatalogProduct('if',id,p.version,{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('tryg',id,'1900-01-01',{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);assert.ok(!facts(id).some(f=>f.key.startsWith('campingvogn.')));assert.equal(enrich(id,[]).addOnIds.length,0);}
});
