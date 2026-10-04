import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {enrichExtractedAgreementWithCatalog} from '../lib/catalog-enrichment.ts';
import {groupInsurances,groupTerms,createDifferences} from '../lib/comparison.ts';
import {attachSupportingTerms,isCustomerObject} from '../lib/supporting-terms.ts';
import {product,facts,fact,sourceHash,date,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// B088 / RC-064 / SCRC-045 / RB-41: 11 unique P1, 29 GAP/SF bindings.
// Explicit decisions: restriction-only conditional spikertelt rule and split
// FU-20 product/customer contract. Three P2 occurrences are part of one P1,
// not three independent P2 closures. Oracles below come from frozen sources.
const ids=['tryg-campingvogn-brann','tryg-campingvogn-brann-og-tyveri','tryg-campingvogn-kasko','tryg-campingvogn-campingvogn-ekstra'];
const extra=ids[3], parent='campingvogn.naturskade.dekning', limitation='campingvogn.naturskade.begrensning';
const own=(id,key)=>fact(id,'campingvogn.'+key);
const check=(f,patterns)=>{for(const pattern of patterns)assert.match(f.value,pattern);return f;};
const bindings=[
  {
    "signature_id": "6371a027109a53b1",
    "GAP_ID": "GAP-4136",
    "SF_ID": "SF-5932",
    "severity": "P1",
    "product": "tryg-campingvogn-brann",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "1 §1.1;naturskade",
    "existing_keys": [
      "campingvogn.fortelt.dekning"
    ]
  },
  {
    "signature_id": "8719ac68866c1abb",
    "GAP_ID": "GAP-4137",
    "SF_ID": "SF-5933",
    "severity": "P2",
    "product": "tryg-campingvogn-brann",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "1 §1.1;siste §3.4",
    "existing_keys": [
      "campingvogn.losore.dekning",
      "campingvogn.losore.grense"
    ]
  },
  {
    "signature_id": "192923db80af77d1",
    "GAP_ID": "GAP-4138",
    "SF_ID": "SF-5934",
    "severity": "P1",
    "product": "tryg-campingvogn-brann",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "1 §2.1",
    "existing_keys": [
      "campingvogn.brann.dekning",
      "campingvogn.brann.egenandel"
    ]
  },
  {
    "signature_id": "36e149c5b1b6a5f1",
    "GAP_ID": "GAP-4139",
    "SF_ID": "SF-5935",
    "severity": "P1",
    "product": "tryg-campingvogn-brann",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "1–2 §2.2",
    "existing_keys": [
      "campingvogn.naturskade.dekning",
      "campingvogn.naturskade.egenandel"
    ]
  },
  {
    "signature_id": "42e7c69d5f0df6ce",
    "GAP_ID": "GAP-4146",
    "SF_ID": "SF-5944",
    "severity": "P1",
    "product": "tryg-campingvogn-brann",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "source_sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "source_location": "§5.3/6",
    "existing_keys": [
      "campingvogn.rettshjelp.dekning",
      "campingvogn.rettshjelp.grense",
      "campingvogn.rettshjelp.egenandel"
    ]
  },
  {
    "signature_id": "6371a027109a53b1",
    "GAP_ID": "GAP-4151",
    "SF_ID": "SF-5952",
    "severity": "P1",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1 §1.1;naturskade",
    "existing_keys": [
      "campingvogn.fortelt.dekning"
    ]
  },
  {
    "signature_id": "8719ac68866c1abb",
    "GAP_ID": "GAP-4152",
    "SF_ID": "SF-5953",
    "severity": "P2",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1 §1.1;siste §3.4",
    "existing_keys": [
      "campingvogn.losore.dekning",
      "campingvogn.losore.grense"
    ]
  },
  {
    "signature_id": "192923db80af77d1",
    "GAP_ID": "GAP-4153",
    "SF_ID": "SF-5954",
    "severity": "P1",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1 §2.1",
    "existing_keys": [
      "campingvogn.brann.dekning",
      "campingvogn.brann.egenandel"
    ]
  },
  {
    "signature_id": "3faaa47ef10d5767",
    "GAP_ID": "GAP-4154",
    "SF_ID": "SF-5955",
    "severity": "P1",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1–2 §2.2",
    "existing_keys": [
      "campingvogn.tyveri.dekning",
      "campingvogn.tyveri.egenandel"
    ]
  },
  {
    "signature_id": "36e149c5b1b6a5f1",
    "GAP_ID": "GAP-4156",
    "SF_ID": "SF-5958",
    "severity": "P1",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "2 §2.3",
    "existing_keys": [
      "campingvogn.naturskade.dekning",
      "campingvogn.naturskade.egenandel"
    ]
  },
  {
    "signature_id": "42e7c69d5f0df6ce",
    "GAP_ID": "GAP-4163",
    "SF_ID": "SF-5967",
    "severity": "P1",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "source_sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "source_location": "§5.3/6",
    "existing_keys": [
      "campingvogn.rettshjelp.dekning",
      "campingvogn.rettshjelp.grense",
      "campingvogn.rettshjelp.egenandel"
    ]
  },
  {
    "signature_id": "6371a027109a53b1",
    "GAP_ID": "GAP-4168",
    "SF_ID": "SF-5975",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "1 §1.1;naturskade",
    "existing_keys": [
      "campingvogn.fortelt.dekning"
    ]
  },
  {
    "signature_id": "8719ac68866c1abb",
    "GAP_ID": "GAP-4169",
    "SF_ID": "SF-5976",
    "severity": "P2",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "1 §1.1;siste §3.4",
    "existing_keys": [
      "campingvogn.losore.dekning",
      "campingvogn.losore.grense"
    ]
  },
  {
    "signature_id": "192923db80af77d1",
    "GAP_ID": "GAP-4170",
    "SF_ID": "SF-5977",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.2",
    "existing_keys": [
      "campingvogn.brann.dekning",
      "campingvogn.brann.egenandel"
    ]
  },
  {
    "signature_id": "3faaa47ef10d5767",
    "GAP_ID": "GAP-4171",
    "SF_ID": "SF-5978",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.3",
    "existing_keys": [
      "campingvogn.tyveri.dekning",
      "campingvogn.tyveri.egenandel"
    ]
  },
  {
    "signature_id": "36e149c5b1b6a5f1",
    "GAP_ID": "GAP-4173",
    "SF_ID": "SF-5981",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2–3 §2.5",
    "existing_keys": [
      "campingvogn.naturskade.dekning",
      "campingvogn.naturskade.egenandel"
    ]
  },
  {
    "signature_id": "670d6c7edf7952d5",
    "GAP_ID": "GAP-4177",
    "SF_ID": "SF-5985",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.4",
    "existing_keys": [
      "campingvogn.glass.dekning",
      "campingvogn.glass.egenandel"
    ]
  },
  {
    "signature_id": "42e7c69d5f0df6ce",
    "GAP_ID": "GAP-4183",
    "SF_ID": "SF-5993",
    "severity": "P1",
    "product": "tryg-campingvogn-kasko",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "source_sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "source_location": "§5.3/6",
    "existing_keys": [
      "campingvogn.rettshjelp.dekning",
      "campingvogn.rettshjelp.grense",
      "campingvogn.rettshjelp.egenandel"
    ]
  },
  {
    "signature_id": "6371a027109a53b1",
    "GAP_ID": "GAP-4187",
    "SF_ID": "SF-6000",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "1 §1.1;naturskade",
    "existing_keys": [
      "campingvogn.fortelt.dekning"
    ]
  },
  {
    "signature_id": "192923db80af77d1",
    "GAP_ID": "GAP-4188",
    "SF_ID": "SF-6001",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.2",
    "existing_keys": [
      "campingvogn.brann.dekning",
      "campingvogn.brann.egenandel"
    ]
  },
  {
    "signature_id": "3faaa47ef10d5767",
    "GAP_ID": "GAP-4189",
    "SF_ID": "SF-6002",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.3",
    "existing_keys": [
      "campingvogn.tyveri.dekning",
      "campingvogn.tyveri.egenandel"
    ]
  },
  {
    "signature_id": "05fb0b7efd75c8f2",
    "GAP_ID": "GAP-4190",
    "SF_ID": "SF-6003",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.3",
    "existing_keys": [
      "campingvogn.fortelt.dekning"
    ]
  },
  {
    "signature_id": "36e149c5b1b6a5f1",
    "GAP_ID": "GAP-4192",
    "SF_ID": "SF-6005",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2–3 §2.5",
    "existing_keys": [
      "campingvogn.naturskade.dekning",
      "campingvogn.naturskade.egenandel"
    ]
  },
  {
    "signature_id": "670d6c7edf7952d5",
    "GAP_ID": "GAP-4196",
    "SF_ID": "SF-6009",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.4",
    "existing_keys": [
      "campingvogn.glass.dekning",
      "campingvogn.glass.egenandel"
    ]
  },
  {
    "signature_id": "8719ac68866c1abb",
    "GAP_ID": "GAP-4202",
    "SF_ID": "SF-6019",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1 Løstutstyr",
    "existing_keys": [
      "campingvogn.losore.grense",
      "campingvogn.losore.egenandel"
    ]
  },
  {
    "signature_id": "68af0543e37902e0",
    "GAP_ID": "GAP-4203",
    "SF_ID": "SF-6020",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1; sikkerhet1",
    "existing_keys": [
      "campingvogn.skadedyr.dekning"
    ]
  },
  {
    "signature_id": "2208749fcdf21bfd",
    "GAP_ID": "GAP-4204",
    "SF_ID": "SF-6022",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1 Fuktskade; sikkerhet1",
    "existing_keys": [
      "campingvogn.fukt.begrensning"
    ]
  },
  {
    "signature_id": "c66f449a3c6138c6",
    "GAP_ID": "GAP-4205",
    "SF_ID": "SF-6023",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1 Avbruttferie",
    "existing_keys": [
      "campingvogn.ferie.dekning",
      "campingvogn.ferie.grense",
      "campingvogn.ferie.begrensning"
    ]
  },
  {
    "signature_id": "42e7c69d5f0df6ce",
    "GAP_ID": "GAP-4206",
    "SF_ID": "SF-6024",
    "severity": "P1",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf",
    "source_sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "source_location": "§5.3/6",
    "existing_keys": [
      "campingvogn.rettshjelp.dekning",
      "campingvogn.rettshjelp.grense",
      "campingvogn.rettshjelp.egenandel"
    ]
  }
];
const controls=[
  {
    "control_id": "PC-1655",
    "product": "tryg-campingvogn-brann",
    "concept": "Geografi",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70",
    "source_location": "1 §3"
  },
  {
    "control_id": "PC-1656",
    "product": "tryg-campingvogn-brann",
    "concept": "Grunnsum",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "1 §1.1;3 §3.3"
  },
  {
    "control_id": "PC-1657",
    "product": "tryg-campingvogn-brann",
    "concept": "Totalskade",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf",
    "source_sha256": "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79",
    "source_location": "§3.3"
  },
  {
    "control_id": "PC-1658",
    "product": "tryg-campingvogn-brann",
    "concept": "Sikkerhet",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd",
    "source_location": "1 §1.2"
  },
  {
    "control_id": "PC-1659",
    "product": "tryg-campingvogn-brann",
    "concept": "Generelt",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "source_location": "1–5"
  },
  {
    "control_id": "PC-1660",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Geografi",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70",
    "source_location": "1 §3"
  },
  {
    "control_id": "PC-1661",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Grunnsum",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1 §1.1;3 §3.3"
  },
  {
    "control_id": "PC-1662",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Tyveri",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "1–2 §2.2"
  },
  {
    "control_id": "PC-1663",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Totalskade",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf",
    "source_sha256": "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e",
    "source_location": "§3.3"
  },
  {
    "control_id": "PC-1664",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Sikkerhet",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd",
    "source_location": "1 §1.2"
  },
  {
    "control_id": "PC-1665",
    "product": "tryg-campingvogn-brann-og-tyveri",
    "concept": "Generelt",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "source_location": "1–5"
  },
  {
    "control_id": "PC-1666",
    "product": "tryg-campingvogn-kasko",
    "concept": "Geografi",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70",
    "source_location": "1 §3"
  },
  {
    "control_id": "PC-1667",
    "product": "tryg-campingvogn-kasko",
    "concept": "Grunnsum",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "1 §1.1;3 §3.3"
  },
  {
    "control_id": "PC-1668",
    "product": "tryg-campingvogn-kasko",
    "concept": "Tyveri",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "2 §2.3"
  },
  {
    "control_id": "PC-1669",
    "product": "tryg-campingvogn-kasko",
    "concept": "Totalskade",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "§3.3"
  },
  {
    "control_id": "PC-1670",
    "product": "tryg-campingvogn-kasko",
    "concept": "Sikkerhet",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd",
    "source_location": "1 §1.2"
  },
  {
    "control_id": "PC-1671",
    "product": "tryg-campingvogn-kasko",
    "concept": "Generelt",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "source_location": "1–5"
  },
  {
    "control_id": "PC-1672",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Geografi",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-778e88dd.pdf",
    "source_sha256": "d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70",
    "source_location": "1 §3"
  },
  {
    "control_id": "PC-1673",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Grunnsum",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "1 §1.1;3 §3.3"
  },
  {
    "control_id": "PC-1674",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Totalskade",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf",
    "source_sha256": "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e",
    "source_location": "§3.3"
  },
  {
    "control_id": "PC-1675",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Sikkerhet",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-65439673.pdf",
    "source_sha256": "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd",
    "source_location": "1 §1.2"
  },
  {
    "control_id": "PC-1676",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Ekstra",
    "classification": "SOURCE_FACT_ALREADY_REPRESENTED_BY_PARENT",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1"
  },
  {
    "control_id": "PC-1677",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Fastutstyr",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1 Fastmontert"
  },
  {
    "control_id": "PC-1678",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Fukt",
    "classification": "SOURCE_FACT_PRESENT_AND_CATALOGUED",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf",
    "source_sha256": "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726",
    "source_location": "1 Fuktskade"
  },
  {
    "control_id": "PC-1679",
    "product": "tryg-campingvogn-campingvogn-ekstra",
    "concept": "Generelt",
    "classification": "SOURCE_ONLY_ACCEPTABLE",
    "source_path": "catalog/sources/vehicle-extensions/tryg-odpdf-911ff8ae.pdf",
    "source_sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "source_location": "1–5"
  }
];
const sources=[
  [
    "tryg-odpdf-03ff0533.pdf",
    "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e"
  ],
  [
    "tryg-odpdf-05b2538c.pdf",
    "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e"
  ],
  [
    "tryg-odpdf-543856fa.pdf",
    "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79"
  ],
  [
    "tryg-odpdf-d09fac80.pdf",
    "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726"
  ],
  [
    "tryg-odpdf-d8d47def.pdf",
    "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291"
  ],
  [
    "tryg-odpdf-b1fff53e.pdf",
    "037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd"
  ]
];
const baseFile=id=>id===ids[0]?'tryg-odpdf-543856fa.pdf':id===ids[1]?'tryg-odpdf-05b2538c.pdf':'tryg-odpdf-f862c645.pdf';
const sourceHashes=new Map(sources);
sourceHashes.set('tryg-odpdf-f862c645.pdf',sourceHashes.get('tryg-odpdf-03ff0533.pdf'));
function provenance(f){
 for(const s of [f.source,...(f.qualificationSource?[f.qualificationSource]:[])]){
  const registered=productCatalog.sources[s.documentId];assert.ok(registered,s.documentId);
  assert.equal(s.documentId,'vehicle:'+s.filename);assert.equal(s.url,registered.url);
  assert.equal(s.termsNumber,registered.termsNumber);assert.equal(s.effectiveFrom,registered.effectiveFrom);
  assert.ok(s.page>=1);assert.ok(s.section);assert.ok(sourceHashes.has(s.filename),s.filename);
  sourceHash('catalog/sources/vehicle-extensions/'+s.filename,sourceHashes.get(s.filename));
  if(s.filename==='tryg-odpdf-b1fff53e.pdf'){assert.equal(s.termsNumber,'');assert.equal(s.effectiveFrom,'');assert.equal(s.version,undefined);}
 }
}
function dimension(id,signature){
 const high=ids.indexOf(id)>=2;let checked=[];
 const c=(key,patterns)=>{const f=check(own(id,key),patterns);checked.push(f);return f;};
 switch(signature){
 case '6371a027109a53b1':case '05fb0b7efd75c8f2':
  c('fortelt.dekning',[/Fortelt og terrasse konstruert for bruk til forsikret campingvogn/,/uavhengig av byggemateriale/,/Naturskade på spikertelt krever at verdien av spikerteltet er inkludert i forsikringssummen/]);
  if(id!==ids[0])assert.match(checked[0].value,/Tyveri fra fortelt av tøy, duk eller lignende materiale er unntatt/);
  assert.equal(checked[0].source.filename,baseFile(id));assert.equal(checked[0].source.page,1);break;
 case '192923db80af77d1':
  c('brann.dekning',[/brann med åpen flamme, eksplosjon og lynnedslag/]);
  c('brann.egenandel',[high?/^6 000 kr/:/^4 000 kr/,/lavere egenandel er avtalt og fremgår av forsikringsbeviset/]);break;
 case '3faaa47ef10d5767':
  c('tyveri.dekning',[/tyveri eller brukstyveri av og fra kjøretøyet eller deler av dette med tilhørende fortelt og terrasse/,/skade eller hærverk i forbindelse med forsøk på tyveri/,/Tyveri fra fortelt av tøy, duk eller lignende materiale er unntatt/]);
  c('tyveri.egenandel',[high?/^6 000 kr/:/^4 000 kr/,/lavere egenandel er avtalt og fremgår av forsikringsbeviset/]);assert.doesNotMatch(checked[0].value,/underslag|utleiet tilhenger|3 måneder/);break;
 case '36e149c5b1b6a5f1':{
  const f=c('naturskade.begrensning',[/^Naturskade på spikertelt tilhørende campingvognen er dekket når verdien av spikerteltet er inkludert i forsikringssummen/,/Direkte skade ved skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv eller vulkanutbrudd/,/frost, tele, tørke, nedbør, snøtyngde, isgang, dyr, insekter, bakterier, sopp eller råte, er unntatt/,/Egenandel ved slik dekningsmessig naturskade på spikertelt er 8 000 kr/]);
  assert.equal(f.source.filename,baseFile(id));assert.equal(f.source.page,id===ids[0]?1:2);
  assert.equal(f.source.section,id===ids[0]?'2.2':id===ids[1]?'2.3':'2.5');
  assert.equal(f.qualificationSource.page,id===ids[0]?2:id===ids[1]?2:3);
  assert.equal(f.coverageAvailability,undefined);
  assert.ok(!facts(id).some(f=>[parent,'campingvogn.naturskade.egenandel'].includes(f.key)));break;
 }
 case '42e7c69d5f0df6ce':
  c('rettshjelp.grense',[/100 000 kr per tvist/,/tre eller flere parter på sikredes side.*250 000 kr/,/Eiere av samme gjenstand regnes som én part/,/flere parter er på samme side og har forsikring i ulike selskaper/,/Ved tvist mot Tryg om dekning av rettshjelp.*20 000 kr uavhengig av antall parter/,/sikredes antatte økonomiske interesse i saken/,/utgifter utover dette må godkjennes av Tryg på forhånd/]);
  c('rettshjelp.egenandel',[/4 000 kr og i tillegg 20 % av utgifter som påløper utover 4 000 kr/,/Én egenandel per tvist selv om flere parter er på samme side/]);
  assert.equal(checked[0].source.page,4);assert.equal(checked[0].source.section,'6.1');assert.equal(checked[1].source.page,5);assert.equal(checked[1].source.section,'6.2');
  for(const f of checked){assert.equal(f.source.filename,'tryg-odpdf-d8d47def.pdf');assert.doesNotMatch(f.value,/ID-tyveri|Reiseforsikring|(?<!\d)50 000(?!\d)|per forsikringsår/);}break;
 case '670d6c7edf7952d5':
  c('glass.dekning',[/Bruddskader på vindusruter.*plutselig, uventet og ytre påvirkning/,/repareres eller ny rute settes inn hos et av Trygs avtaleverksteder/,/krakelering eller punktert glass er unntatt/]);
  c('glass.egenandel',[/3 000 kr ved hvert skadetilfelle ved utskifting; ingen egenandel ved reparasjon/,/hos et av Trygs avtaleverksteder/]);break;
 case '8719ac68866c1abb':
  c('losore.grense',id===extra?[/^50 000 kr samlet; 10 000 kr per gjenstand; 15 000 kr i fortelt av tekstil/,/Dersom personlig løsøre er utvidet, vises dette i forsikringsbeviset/,/utvidet beløp kommer i tillegg til den samlede erstatningssummen på 50 000 kr\.$/]:[/15 000 kr samlet; 5 000 kr per gjenstand/,/i forsikret campingvogn og fortelt/,/Annen avtalt sum fremgår av forsikringsbeviset/,/utover forsikringssummen for vognen/]);
  c('losore.begrensning',[/Penger, verdipapirer, antikviteter og smykker omfattes ikke/]);
  if(id===extra){c('losore.egenandel',[/^1 000 kr$/]);assert.match(checked[1].value,/ikke ved helt eller delvis utleie av campingvognen/);assert.equal(checked[0].source.filename,'tryg-odpdf-d09fac80.pdf');assert.doesNotMatch(checked[0].value,/disse erstatningssummene|alle.*grensene/);}
  else if(id===ids[0])assert.match(checked[1].value,/Cd-er, dvd-er, elektroniske spill, vin og brennevin omfattes heller ikke/);
  else assert.doesNotMatch(checked[1].value,/Cd-er|dvd-er|spill|vin|brennevin/);break;
 case '68af0543e37902e0':
  c('skadedyr.dekning',[/Skade på campingvognen forårsaket av insekter, gnagere og andre skadedyr/,/hensettes må ha jevnlig innvendig tilsyn og være sikret mot gnagere og andre skadedyr/,/Åpninger og ventiler må være stengt og kjøretøyet skal være tømt for mat/]);
  assert.equal(id,extra);assert.equal(checked[0].qualificationSource.filename,'tryg-odpdf-b1fff53e.pdf');break;
 case '2208749fcdf21bfd':
  c('fukt.begrensning',[/rørbrudd eller lekkasje fra rør, frost/,/fortelt og terrasse uavhengig av byggematerialer eller på teltvogn/,/fabrikant, importør, leverandør eller reparatør.*garanti, reklamasjon eller annet rettsgrunnlag/,/Fører ikke garantikrav eller reklamasjon frem, dekkes skaden hvis øvrige betingelser er til stede; Tryg overtar da sikredes krav/,/hos forhandler eller autorisert verksted én gang hvert forsikringsår/,/fabrikantens krav til fabrikkgaranti oppfylles/,/Ved påvist fukt må nødvendige tiltak utføres omgående/]);
  assert.equal(id,extra);assert.equal(checked[0].qualificationSource.filename,'tryg-odpdf-b1fff53e.pdf');break;
 case 'c66f449a3c6138c6':
  c('ferie.dekning',[/Rimelige og nødvendige merutgifter til leie av campingvogn og\/eller opphold/,/når påbegynt ferie må avbrytes fordi campingvognen er utsatt for erstatningsmessig skade/]);
  c('ferie.grense',[/^1 500 kr per dag i resterende planlagt ferie, maksimalt 14 dager$/]);
  c('ferie.begrensning',[/dokumentere utgiftene og opplyse om feriens planlagte rute og lengde/,/Tryg har ikke ansvar for å fremskaffe campingvogn/,/ikke ved helt eller delvis utleie av campingvognen/]);assert.equal(id,extra);break;
 default:assert.fail(signature);
 }
 for(const f of checked)provenance(f);
 return checked;
}
for(const [file,hash] of sources)test('R-088-HASH '+file,()=>sourceHash('catalog/sources/vehicle-extensions/'+file,hash));
test('R-088-SET exact authoritative 11 P1 and 29 occurrence membership',()=>{
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-088');
 assert.ok(batch);assert.equal(bindings.length,29);assert.equal(new Set(bindings.map(b=>b.GAP_ID)).size,29);assert.equal(new Set(bindings.map(b=>b.SF_ID)).size,29);
 assert.deepEqual([...new Set(bindings.map(b=>b.signature_id))].sort(),batch.signature_ids.toSorted());
 assert.equal(bindings.filter(b=>b.severity==='P1').length,26);assert.equal(bindings.filter(b=>b.severity==='P2').length,3);
 assert.equal(controls.length,25);assert.deepEqual(controls.map(c=>c.control_id).sort(),Array.from({length:25},(_,i)=>'PC-'+(1655+i)));
});
for(const b of bindings)test(`R-088-BINDING ${b.GAP_ID}/${b.SF_ID} ${b.signature_id}`,()=>{
 const p=product(b.product);assert.equal(p.providerId,'tryg');assert.equal(p.insuranceType,'Campingvogn');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,'2026-01-01');
 sourceHash(b.source_path,b.source_sha256);assert.ok(dimension(b.product,b.signature_id).length);
});
test('R-088-PF01–04 and singular sum permanent source-precision contract',()=>{
 check(own(extra,'utstyr.dekning'),[/Fastmontert tilbehør som det er lovlig å ha på campingvognen/]);assert.equal(own(extra,'utstyr.grense').value,'50 000 kr');
 check(own(extra,'fukt.dekning'),[/fukt i tak, vegger og gulv/,/Skaden må ha inntruffet i forsikringstiden/]);
 check(own(extra,'fukt.alder'),[/Innen 10 år etter første registrering som fabrikkny/]);
 assert.equal(own(extra,'fukt.egenandel').value,'8 000 kr for campingvogn inntil 5 år gammel på skadedagen; for campingvogn over 5 år gammel på skadedagen: 25 % av skaden, minst 8 000 kr.');
 dimension(extra,'8719ac68866c1abb');
});
test('R-088-SOURCE exact PAU27016 amount referents, lawful scope, moisture and holiday conditions',async()=>{
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/tryg-odpdf-d09fac80.pdf',import.meta.url))});
 try{const out=await parser.getText();assert.equal(out.pages.length,1);const text=out.pages[0].text.replace(/\s+/g,' ');
  for(const pattern of [/fastmontert tilbehør som det er lovlig å ha på campingvognen/,/samlet verdi til 50\.000 kroner/,/fortelt av tekstil er begrenset til 15\.000 kroner/,/Hver gjenstand er dekket med inntil 10\.000 kroner/,/Utvidet beløp kommer i tillegg til erstatningssummen nevnt over/,/fukt i tak, vegger og gulv/,/Skaden må ha inntruffet i forsikringstiden/,/over 5 år gammel på skadedagen/,/25 prosent av skaden, minimum 8\.000 kroner/,/Rimelige og nødvendige merutgifter/,/påbegynt ferie må avbrytes/,/resterende antall dager av planlagt ferie, inntil 14 dager/])assert.match(text,pattern);
 }finally{await parser.destroy();}
});
for(const control of controls)test(control.control_id+' '+control.concept+' own frozen source',()=>{
 const id=control.product;sourceHash(control.source_path,control.source_sha256);
 switch(control.concept){
 case 'Geografi':check(own(id,'avtale.geografi'),[/Europa unntatt Russland, Belarus og Tyrkia/,/rettshjelp i Norden/]);break;
 case 'Grunnsum':case 'Totalskade':{
  const f=check(own(id,'avtale.forsikringssum'),[/Avtalt forsikringssum/,/ved totalskade begrenset til markedsverdien/]);assert.doesNotMatch(f.value,/nyverdi|verdigaranti|\d/);assert.ok(!facts(id).some(f=>f.key==='campingvogn.totalskade.oppgjor'));break;
 }
 case 'Tyveri':check(own(id,'tyveri.dekning'),[/Tyveri fra fortelt av tøy, duk eller lignende materiale er unntatt/]);assert.doesNotMatch(own(id,'tyveri.dekning').value,/vognen.*fjernet/);break;
 case 'Sikkerhet':case 'Generelt':{
  assert.equal(control.classification,'SOURCE_ONLY_ACCEPTABLE');
  const filename=control.source_path.split('/').at(-1);
  const manifest=JSON.parse(readFileSync(new URL('../catalog/sources/vehicle-extensions/manifest.json',import.meta.url)));
  assert.ok(manifest.documents.some(d=>d.filename===filename&&d.sha256===control.source_sha256));
  assert.ok(!facts(id).some(f=>['campingvogn.avtale.sikkerhet','campingvogn.administrasjon.dekning'].includes(f.key)));
  break;
 }
 case 'Ekstra':assert.equal(id,extra);assert.equal(product(id).inheritsProductId,ids[2]);assert.equal(own(id,'kasko.dekning').value,'Inkludert i produktnivået');break;
 case 'Fastutstyr':assert.equal(own(id,'utstyr.grense').value,'50 000 kr');check(own(id,'utstyr.dekning'),[/som det er lovlig å ha på campingvognen/]);break;
 case 'Fukt':check(own(id,'fukt.alder'),[/Innen 10 år etter første registrering som fabrikkny/]);check(own(id,'fukt.dekning'),[/fukt i tak, vegger og gulv/,/inntruffet i forsikringstiden/]);check(own(id,'fukt.egenandel'),[/inntil 5 år gammel på skadedagen/,/over 5 år gammel på skadedagen: 25 % av skaden, minst 8 000 kr/]);break;
 default:assert.fail(control.concept);
 }
});
const customerSource={documentId:'b088-customer-fixture',filename:'b088-customer-fixture.pdf',company:'Tryg',termsNumber:'',effectiveFrom:'',page:1,section:'Individuell avtale'};
const term=(key,value)=>({canonicalKey:key,name:key===parent?'Naturskade':key===limitation?'Naturskade – begrensninger':'Avtalt forsikringssum',value,source:customerSource});
const scenarios={
 A:[],
 B_object:[{name:'Spikertelt',value:'Dokumentert',source:customerSource}],
 B_object_and_total:[{name:'Spikertelt',value:'Dokumentert',source:customerSource},term('campingvogn.avtale.forsikringssum','300 000 kr')],
 B_restriction:[term(limitation,'Spikertelt er dokumentert; inkludering av verdien i forsikringssummen er ikke dokumentert')],
 C_predicate:[term(limitation,'Spikertelt er dokumentert og verdien er inkludert i forsikringssummen')],
 C_effective:[term(parent,'Valgt; spikertelt er dokumentert og verdien er inkludert i forsikringssummen')],
 D_predicate:[term(limitation,'Spikerteltets verdi er ikke inkludert i forsikringssummen')],
 D_effective:[term(parent,'Ikke valgt; spikerteltets verdi er ikke inkludert i forsikringssummen')],
 conflict:[term(parent,'Valgt'),term(parent,'Ikke valgt')],
};
function customer(id,terms=[]){
 const p=product(id);
 return enrichExtractedAgreementWithCatalog({company:'Tryg',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[{type:'Campingvogn',productName:p.name,canonicalProductName:p.name,agreementScope:'ordinary',documentRole:'individual_agreement',annualPremium:null,deductible:null,coverageSummary:null,importantTerms:terms,addOns:[]}]},date).insurances[0];
}
const status=(insurance)=>canonicalCoverage(insurance,'Campingvogn',parent);
for(const id of ids)for(const [scenario,terms] of Object.entries(scenarios))test(`R-088-CUSTOMER ${id} ${scenario}`,()=>{
 const c=customer(id,terms),coverage=status(c);
 assert.ok(coverage);assert.equal(coverage.status,scenario==='C_effective'?'selected':scenario==='D_effective'?'not_selected':'unknown');assert.equal(coverage.conflict,scenario==='conflict');
 assert.deepEqual(c.addOnIds,[]);assert.equal(c.annualPremium,null);assert.equal(c.deductible,null);
 if(['D_effective','conflict'].includes(scenario))assert.ok(!c.importantTerms.some(t=>t.key?.startsWith('campingvogn.naturskade.')&&t.coverageOrigin==='catalog'));
 assert.ok(!c.catalogFacts.some(f=>[parent,'campingvogn.naturskade.egenandel'].includes(f.key)));
});
for(const id of ids)test('R-088-PRIORITY '+id+' document values and declined parent',()=>{
 documentPriority(id,limitation,'Dokumentert vilkår: egenandel ved slik naturskade på spikertelt er 7 777 kr');
 for(const b of bindings.filter(b=>b.product===id))for(const f of dimension(id,b.signature_id))documentPriority(id,f.key,'Kundens eksplisitte avtaleverdi');
 const c=customer(id,[term(limitation,'Kundens dokumenterte spikerteltvilkår: suminkludering er ikke dokumentert')]);assert.equal(status(c).status,'unknown');
});
for(const id of ids)for(const scenario of ['A','B_restriction','C_effective','D_effective','conflict'])test(`R-088-SUPPORTING ${id} ${scenario}`,()=>{
 const individual={...customer(id,scenarios[scenario]),company:'Tryg',documentRole:'individual_agreement'};
 const general={type:'Campingvogn',productName:product(id).name,canonicalProductName:product(id).name,company:'Tryg',documentRole:'general_terms',agreementScope:'ordinary',agreementPeriod:null,objectIdentifiers:[],documentSources:[],documentReferences:[],annualPremium:null,deductible:null,coverageSummary:null,importantTerms:[term(parent,'Valgt'),term(limitation,'Spikertelt er dekket når verdien inngår i forsikringssummen')],addOns:[]};
 assert.equal(isCustomerObject(general),false);
 const attached=attachSupportingTerms(individual,[general],'existing');assert.ok(attached.recordEvidence?.length);
 assert.equal(status(attached).status,status(individual).status);assert.equal(status(attached).conflict,status(individual).conflict);
});
test('FU-20-PRODUCT exact conditional rule in both directions and same-product',()=>{
 for(const id of ids)for(const peer of [...ids,'if-campingvogn-kasko']){
  const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows),b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  const row=a.find(r=>r.key===limitation),back=b.find(r=>r.key===limitation);assert.ok(row);assert.ok(back);
  assert.deepEqual(row.first,back.second);assert.deepEqual(row.second,back.first);assert.equal(row.first.state,'included');
  assert.ok(row.first.facts.every(f=>f.role==='term'));assert.match(row.first.text,/spikertelt.*verdien.*inkludert i forsikringssummen/);assert.match(row.first.text,/8 000 kr/);assert.doesNotMatch(row.first.text,/✓/);
  assert.ok(!materializeCatalogProduct(product(id)).facts.some(f=>[parent,'campingvogn.naturskade.egenandel'].includes(f.key)));
  if(id===peer)assert.equal(row.different,false);
 }
});
test('FU-20-CUSTOMER all tier pairs preserve status, evidence, detail and side-swap',()=>{
 for(const firstId of ids)for(const secondId of ids)for(const scenario of ['A','B_restriction','C_effective','D_effective']){
  const first=customer(firstId,scenarios[scenario]),second=customer(secondId,scenarios[scenario]);
  const forward=groupInsurances([first],[second],null),backward=groupInsurances([second],[first],null);
  const terms=groupTerms(forward[0],null).filter(t=>t.key?.startsWith('campingvogn.naturskade.')),back=groupTerms(backward[0],null);
  for(const r of terms){const b=back.find(b=>b.key===r.key);assert.ok(b,r.key);assert.deepEqual(r.first,b.second);assert.deepEqual(r.second,b.first);assert.deepEqual(r.firstCoverage,b.secondCoverage);assert.deepEqual(r.secondCoverage,b.firstCoverage);assert.deepEqual(r.firstSources,b.secondSources);assert.deepEqual(r.secondSources,b.firstSources);}
  if(firstId===secondId){const doc=x=>({insuranceData:{company:'Tryg',totalAnnualPremium:null,insurances:[x]}});assert.equal(createDifferences(doc(first),doc(second),forward,null).filter(d=>d.termKey?.startsWith('campingvogn.naturskade.')).length,0);}
 }
});
test('R-088-ISOLATION nearest tiers, trailer and object/provider/scope/version negatives',()=>{
 for(const id of ids){const p=product(id);for(const options of [{insuranceType:'Campingvogn',agreementScope:'nito'},{insuranceType:'Tilhenger',agreementScope:'ordinary'},{insuranceType:'Bobil',agreementScope:'ordinary'}])assert.equal(findCatalogProduct(p.providerId,id,p.version,options),null);
  assert.equal(findCatalogProduct('if',id,p.version,{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct('tryg',id,'1900-01-01',{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);
  assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);
 }
 for(const id of ids.slice(0,3))assert.ok(!facts(id).some(f=>/^campingvogn\.(fukt|skadedyr|ferie)\./.test(f.key)));
 for(const id of ['tryg-tilhenger-brann','tryg-tilhenger-brann-og-tyveri','tryg-tilhenger-kasko']){assert.equal(fact(id,'tilhenger.naturskade.egenandel').value,'8 000 kr');assert.ok(!facts(id).some(f=>f.key.startsWith('campingvogn.')));}
});
