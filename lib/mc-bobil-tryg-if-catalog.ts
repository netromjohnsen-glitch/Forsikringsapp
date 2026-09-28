import type { CatalogSource } from "./product-catalog.ts";
import { buildMcBobilCatalog, type McBobilRow, type McBobilProductDefinition, type McBobilAddOnDefinition } from "./mc-bobil-catalog-builder.ts";

// Exact public source artifacts, versions and type applicability: tryg-if-manifest.json.
const sources: Record<string, CatalogSource> = {
  "mcb:tryg:mc:tryg-mc-product.html": {
    "id": "mcb:tryg:mc:tryg-mc-product.html",
    "filename": "tryg-mc-product.html",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/forsikringer/kjoretoy/mc-forsikring",
    "sha256": "488ed14be555a30a6706e08bc81dc55d85d06cdcae7f0da7d5cd2f8b6b081b75",
    "documentName": "tryg-mc-product.html"
  },
  "mcb:tryg:bobil:tryg-bobil-product.html": {
    "id": "mcb:tryg:bobil:tryg-bobil-product.html",
    "filename": "tryg-bobil-product.html",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/forsikringer/kjoretoy/bobilforsikring",
    "sha256": "9bcce0eea60c4dd61628fb29d82d27c21ef8b1ee89f5bf3a9dfd86c8de10f385",
    "documentName": "tryg-bobil-product.html"
  },
  "mcb:tryg:mc:tryg-05PAU25003.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU25003.pdf",
    "filename": "Bilforsikring-Ansvar.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25003",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25003&vilk=Ansvar-MC",
    "sha256": "c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6",
    "documentName": "PAU25003",
    "version": "2024-07-01"
  },
  "mcb:tryg:bobil:tryg-05PAU25003.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU25003.pdf",
    "filename": "Bilforsikring-Ansvar.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25003",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25003&vilk=Ansvar-MC",
    "sha256": "c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6",
    "documentName": "PAU25003",
    "version": "2024-07-01"
  },
  "mcb:tryg:mc:tryg-05PAU25935.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU25935.pdf",
    "filename": "tryg-05PAU25935.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25935",
    "effectiveFrom": "2026-01-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25935&vilk=Delkasko-MC",
    "sha256": "7996b6796ba109c322b0382576da6fe3f63145b8fb1342378d5683df82cfbb30",
    "documentName": "PAU25935",
    "version": "2026-01-01"
  },
  "mcb:tryg:mc:tryg-05PAU25405.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU25405.pdf",
    "filename": "tryg-05PAU25405.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25405",
    "effectiveFrom": "2026-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25405&vilk=Kasko-MC",
    "sha256": "917b3381e5792c10decfdeceb3c8af3bb70b4703d0c15406dd972c55321411c0",
    "documentName": "PAU25405",
    "version": "2026-07-01"
  },
  "mcb:tryg:mc:tryg-05PAU27010.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU27010.pdf",
    "filename": "tryg-05PAU27010.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU27010",
    "effectiveFrom": "2026-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU27010&vilk=Ekstra-MC",
    "sha256": "75657812b727c1346472dac5464fd8077826e114e7fe00679e6ac2d2aee97c8b",
    "documentName": "PAU27010",
    "version": "2026-07-01"
  },
  "mcb:tryg:mc:tryg-05PAU28003.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU28003.pdf",
    "filename": "Fører- og Passasjerulykke.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU28003",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU28003&vilk=Forerogpassasjerulykke",
    "sha256": "d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52",
    "documentName": "PAU28003",
    "version": "2024-07-01"
  },
  "mcb:tryg:bobil:tryg-05PAU28003.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU28003.pdf",
    "filename": "Fører- og Passasjerulykke.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU28003",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU28003&vilk=Forerogpassasjerulykke",
    "sha256": "d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52",
    "documentName": "PAU28003",
    "version": "2024-07-01"
  },
  "mcb:tryg:mc:tryg-05PAU20900.pdf": {
    "id": "mcb:tryg:mc:tryg-05PAU20900.pdf",
    "filename": "tryg-05PAU20900.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU20900",
    "effectiveFrom": "2026-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU20900&vilk=Produktvilkaar-MC",
    "sha256": "4c65a011cc69f0fae49ff18d0a5f877b2d3aedfcdc1624c543d87f9ca03a2b35",
    "documentName": "PAU20900",
    "version": "2026-07-01"
  },
  "mcb:tryg:mc:tryg-05000PA209.pdf": {
    "id": "mcb:tryg:mc:tryg-05000PA209.pdf",
    "filename": "tryg-05000PA209.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "000PA209",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PA209&vilk=MC-Sikkerhetsforskrift",
    "sha256": "54f601c4e8e1bc415029b2c4d9787e359719507948774a102f719c6c691900c0",
    "documentName": "000PA209"
  },
  "mcb:tryg:mc:tryg-05PGE91000.pdf": {
    "id": "mcb:tryg:mc:tryg-05PGE91000.pdf",
    "filename": "05PGE91000.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PGE91000",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Generelle-vilkaar",
    "sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "documentName": "PGE91000",
    "version": "2024-07-01"
  },
  "mcb:tryg:bobil:tryg-05PGE91000.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PGE91000.pdf",
    "filename": "05PGE91000.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PGE91000",
    "effectiveFrom": "2024-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Generelle-vilkaar",
    "sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "documentName": "PGE91000",
    "version": "2024-07-01"
  },
  "mcb:tryg:mc:tryg-05PGE91500.pdf": {
    "id": "mcb:tryg:mc:tryg-05PGE91500.pdf",
    "filename": "05PGE91500.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PGE91500",
    "effectiveFrom": "2026-01-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Rettshjelp",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "documentName": "PGE91500",
    "version": "2026-01-01"
  },
  "mcb:tryg:bobil:tryg-05PGE91500.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PGE91500.pdf",
    "filename": "05PGE91500.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PGE91500",
    "effectiveFrom": "2026-01-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Rettshjelp",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "documentName": "PGE91500",
    "version": "2026-01-01"
  },
  "mcb:tryg:bobil:tryg-05PAU25335.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU25335.pdf",
    "filename": "tryg-05PAU25335.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25335",
    "effectiveFrom": "2026-01-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25335&vilk=Delkasko-bobil",
    "sha256": "2a1cd47ccbfbb5ea8532500d3b964fac22a2ede5d34fcffb2046899185fd0e48",
    "documentName": "PAU25335",
    "version": "2026-01-01"
  },
  "mcb:tryg:bobil:tryg-05PAU25305.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU25305.pdf",
    "filename": "tryg-05PAU25305.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU25305",
    "effectiveFrom": "2026-01-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU25305&vilk=Kasko-bobil",
    "sha256": "cd521eb44c91f9ab6a0fd9c06513b1e1e076355efdb2fe130ed222c80c25edea",
    "documentName": "PAU25305",
    "version": "2026-01-01"
  },
  "mcb:tryg:bobil:tryg-05PAU27007.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU27007.pdf",
    "filename": "tryg-05PAU27007.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU27007",
    "effectiveFrom": "2026-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU27007&vilk=Ekstra-bobil",
    "sha256": "a14a3404fceef8c42d91fb4ec95906e06b87edcfc13188e697e01855aa99f404",
    "documentName": "PAU27007",
    "version": "2026-07-01"
  },
  "mcb:tryg:bobil:tryg-05PAU27110.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU27110.pdf",
    "filename": "Bilforsikring-Maskinskade.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU27110",
    "effectiveFrom": "2026-08-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU27110&vilk=Maskinskade-bobil",
    "sha256": "2aa1b0b720c552de29409db06dfdd89c97a57a27a2b669576f3e15f90b21c71d",
    "documentName": "PAU27110",
    "version": "2026-08-01"
  },
  "mcb:tryg:bobil:tryg-05PAU18800.pdf": {
    "id": "mcb:tryg:bobil:tryg-05PAU18800.pdf",
    "filename": "tryg-05PAU18800.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PAU18800",
    "effectiveFrom": "2026-07-01",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PAU18800&vilk=Produktvilkaar-Bobil",
    "sha256": "2549ebec8fae718e4f8d3e8a1b46aacb359a3292f35dea71999ac1595cc53fec",
    "documentName": "PAU18800",
    "version": "2026-07-01"
  },
  "mcb:tryg:bobil:tryg-05000PA188.pdf": {
    "id": "mcb:tryg:bobil:tryg-05000PA188.pdf",
    "filename": "tryg-05000PA188.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "000PA188",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PA188&vilk=Bobil-Sikkerhetsforskrift",
    "sha256": "04ebb4d9cc9d8a3fe157a128ef5b56c97f3ae544c79ea62cac2574c64e1f6e6d",
    "documentName": "000PA188"
  },
  "mcb:tryg:mc:tryg-mc-ipid.pdf": {
    "id": "mcb:tryg:mc:tryg-mc-ipid.pdf",
    "filename": "tryg-mc-ipid.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Motorsykkelforsikring.pdf",
    "sha256": "f02f83205dd20bd896c21266fa6b8b2782644fd70f2780032f91ffa0081ef6d3",
    "documentName": "tryg-mc-ipid.pdf",
    "version": "2025-07-01"
  },
  "mcb:tryg:bobil:tryg-bobil-ipid.pdf": {
    "id": "mcb:tryg:bobil:tryg-bobil-ipid.pdf",
    "filename": "tryg-bobil-ipid.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Bobilforsikring.pdf",
    "sha256": "ec3a019f57f6a8c424aa60611ddecbe4027f4768071668fc816cca1f64a07790",
    "documentName": "tryg-bobil-ipid.pdf",
    "version": "2025-04-01"
  },
  "mcb:if:mc:if-mc-product.html": {
    "id": "mcb:if:mc:if-mc-product.html",
    "filename": "if-mc-product.html",
    "providerId": "if",
    "company": "If",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.if.no/privat/forsikring/kjoretoy/mc-forsikring",
    "sha256": "0c78b98294568d71be4765fcec9ddeffd4c26614d79c4eaecdf914bd11355cb3",
    "documentName": "if-mc-product.html"
  },
  "mcb:if:bobil:if-bobil-product.html": {
    "id": "mcb:if:bobil:if-bobil-product.html",
    "filename": "if-bobil-product.html",
    "providerId": "if",
    "company": "If",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.if.no/privat/forsikring/kjoretoy/bobilforsikring",
    "sha256": "6ab8554b61adb169ad925a551e4ca404f3edc3c0f3cd57d59ffabc8994a63623",
    "documentName": "if-bobil-product.html"
  },
  "mcb:if:mc:if-MOT2-2.pdf": {
    "id": "mcb:if:mc:if-MOT2-2.pdf",
    "filename": "if-Vilkaar-4103ea25.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "MOT2-2",
    "effectiveFrom": "2024-03",
    "url": "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "documentName": "Kjøretøyforsikring",
    "version": "2024-03"
  },
  "mcb:if:bobil:if-MOT2-2.pdf": {
    "id": "mcb:if:bobil:if-MOT2-2.pdf",
    "filename": "if-Vilkaar-4103ea25.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "MOT2-2",
    "effectiveFrom": "2024-03",
    "url": "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring",
    "sha256": "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987",
    "documentName": "Kjøretøyforsikring",
    "version": "2024-03"
  },
  "mcb:if:mc:if-SV692.pdf": {
    "id": "mcb:if:mc:if-SV692.pdf",
    "filename": "if-SV692.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "SV692",
    "effectiveFrom": "2020-11",
    "url": "https://if.no/apps/vilkarsbasendokument/Vilkaar?dt=2020-11-07&vilkaar=SV692",
    "sha256": "ac91470a3859045cd1ab64300bca5ba34531f73faed7965f00797bb89de6f419",
    "documentName": "Tilleggsvilkår for motorsykkel, moped, ATV og snøscooter",
    "version": "2020-11"
  },
  "mcb:if:bobil:if-SV707.pdf": {
    "id": "mcb:if:bobil:if-SV707.pdf",
    "filename": "if-SV707.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "SV707",
    "effectiveFrom": "2022-06",
    "url": "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV707",
    "sha256": "a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e",
    "documentName": "Særvilkår for Campingvogn og bobil",
    "version": "2022-06"
  },
  "mcb:if:mc:if-mc-ipid.pdf": {
    "id": "mcb:if:mc:if-mc-ipid.pdf",
    "filename": "if-mc-ipid.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://if.no/apps/vilkarsbasendokument/IPID?ipid=Motorsykkelforsikring",
    "sha256": "b7d77964328489ec76b1512fbe5ac59302ac75514e0fb71ce36040299850c4f2",
    "documentName": "Motorsykkel IPID"
  },
  "mcb:if:bobil:if-bobil-ipid.pdf": {
    "id": "mcb:if:bobil:if-bobil-ipid.pdf",
    "filename": "if-bobil-ipid.pdf",
    "providerId": "if",
    "company": "If",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://if.no/apps/vilkarsbasendokument/IPID?ipid=Bobilforsikring",
    "sha256": "c408c2633b793713aeedd4c592fd6ccd97c5e6457b257592789a2aae4f0028a7",
    "documentName": "Bobil IPID"
  }
};

type Vehicle = "mc" | "bobil";
const sourceId = (provider: "tryg" | "if", type: Vehicle, filename: string) => `mcb:${provider}:${type}:${filename}`;
const rows = (source: string, page: number, section: string, values: [key: string, value: string, deductible?: McBobilRow["deductibleClassification"]][]): McBobilRow[] =>
  values.map(([key, value, deductibleClassification]) => ({ key, value, sourceId: source, page, section, ...(deductibleClassification ? { deductibleClassification } : {}) }));
// Later verified tier-specific rows replace the same base semantic identity.
const combine = (...sets: McBobilRow[][]): McBobilRow[] => [...new Map(sets.flat().map(row => [row.key, row])).values()];
const tr = (type: Vehicle, doc: string, page: number, section: string, values: Parameters<typeof rows>[3]) => rows(sourceId("tryg", type, `tryg-${doc}.pdf`), page, section, values);
const iff = (type: Vehicle, doc: string, page: number, section: string, values: Parameters<typeof rows>[3]) => rows(sourceId("if", type, `if-${doc}.pdf`), page, section, values);
const definitions: McBobilProductDefinition[] = [];
const additions: McBobilAddOnDefinition[] = [];
function product(provider: "tryg" | "if", type: Vehicle, name: string, slug: string, doc: string, facts: McBobilRow[]) {
  const id = sourceId(provider, type, `${provider}-${doc}.pdf`);
  definitions.push({ providerId: provider, company: provider === "tryg" ? "Tryg" : "If", type, agreementScope: "ordinary", productId: `${provider}-${type}-${slug}`, name, version: sources[id].version ?? null, sourceId: id, rows: facts });
}
function addOn(provider: "tryg" | "if", type: Vehicle, name: string, slug: string, doc: string, levels: string[], facts: McBobilRow[]) {
  additions.push({ providerId: provider, company: provider === "tryg" ? "Tryg" : "If", type, agreementScope: "ordinary", id: `${provider}-${type}-${slug}`, name, sourceId: sourceId(provider, type, `${provider}-${doc}.pdf`), requiresLevel: levels.map(level => { const match = definitions.find(product => product.providerId === provider && product.type === type && product.name === level); if (!match) throw new Error("Missing add-on product level"); return match.productId; }), rows: facts });
}
function trygBase(type: Vehicle) {
  return [
    ...tr(type, "05PAU25003", 1, "1.1–1.2", [
      ["ansvar.dekning", "Ansvar etter bilansvarsloven; ved skade utenfor Norge gjelder vilkårets regler for skadested og norske førere/passasjerer"],
      ["ansvar.person.grense", "Ubegrenset beløp"], ["ansvar.ting.grense", "Inntil 100 millioner kr"],
      ["rettshjelp.dekning", "Rettshjelp er inkludert i ansvarsforsikringen"],
    ]),
    ...tr(type, type === "mc" ? "05PAU20900" : "05PAU18800", 1, "3", [
      ["avtale.geografi", "Europa, unntatt Russland, Belarus og Tyrkia"], ["rettshjelp.geografi", "Norden"],
    ]),
    ...tr(type, "05PGE91500", 4, "6.1", [["rettshjelp.grense", "Inntil 100 000 kr per tvist; 250 000 kr ved minst tre parter på sikredes side. Særgrenser gjelder for enkelte tvister."]]),
    ...tr(type, "05PGE91500", 5, "6.2", [["rettshjelp.egenandel", "4 000 kr + 20 % av utgiftene utover 4 000 kr", "coverage"]]),
  ];
}
function trygPhysical(type: Vehicle) {
  const doc = type === "mc" ? "05PAU25935" : "05PAU25335";
  return [
    ...tr(type, doc, 1, "1", [["utstyr.dekning", "Lovlig fastmontert tilbehør; foliering inkludert, tilhenger og utstyr som fjernes uten verktøy er unntatt"], ["utstyr.grense", type === "mc" ? "10 000 kr" : "10 000 kr; annen avtalt sum følger forsikringsbeviset"]]),
    ...tr(type, doc, 1, "2.1–2.2", [
      ["brann.dekning", "Brann med åpen flamme, eksplosjon og lynnedslag"], ["brann.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt i forsikringsbeviset", "standard"],
      ["tyveri.dekning", "Tyveri/brukstyveri av kjøretøy eller deler, samt skade og hærverk ved forsøk på tyveri"], ["tyveri.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt i forsikringsbeviset", "standard"],
    ]),
    ...tr(type, doc, type === "mc" ? 1 : 2, "2.3", [
      ["glass.dekning", type === "mc" ? "Bruddskade på glassruter på 3- og 4-hjuls motorsykkel hos Trygs avtaleverksted" : "Bruddskade på vindusruter ved tilfeldig, plutselig ytre påvirkning; Trygs avtaleverksted skal brukes"],
      ["glass.begrensning", type === "mc" ? "Vindskjerm dekkes ikke" : "Krakelering/punktert glass og rute som før skaden var for slitt til EU-godkjenning er unntatt"],
      ["glass.egenandel", "3 000 kr ved bytte av rute", "coverage"], ["glass.reparasjon.egenandel", "0 kr ved reparasjon", "coverage"],
    ]),
    ...tr(type, doc, 2, "2.4", [
      ["veihjelp.dekning", "Berging/tauing ved skade, utelåsing, startproblemer, uventet driftsstopp eller tom tank/driftsbatteri; hjemreise på vilkårene"],
      ["veihjelp.egenandel", "750 kr", "coverage"],
      ["veihjelp.begrensning", "Transport maksimalt 50 % av kjøretøyets verdi; ikke haikere, ytelser fra annen avtale/garanti/redningsabonnement eller steder uten veitilknytning"],
    ]),
  ];
}
const trygMcDelkasko = combine(trygBase("mc"), trygPhysical("mc"), tr("mc", "05PAU25935", 1, "1", [
  ["mc.bagasje.dekning", "Bagasje og annet løst utstyr i låsbar bagasjeboks på motorsykkelen"], ["mc.bagasje.grense", "10 000 kr"],
]));
const trygMcKasko = combine(trygMcDelkasko,
  tr("mc", "05PAU25405", 1, "2.1", [
    ["kasko.dekning", "Sammenstøt, utforkjøring, velt, hærverk, feilfylling eller plutselig, uventet ytre påvirkning"],
    ["kasko.egenandel", "Avtalt egenandel fremgår av forsikringsbeviset", "reference"],
    ["kasko.begrensning", "Maskinbrudd og frost unntatt; godkjent ferdighetskurs på is-/hastighetsbane øker egenandelen med 20 000 kr"],
  ]), tr("mc", "05PAU25405", 4, "3.4", [
    ["nyverdi.dekning", "Fabrikkny motorsykkel ved dekningsmessig totalskade eller tyveri når vilkårene er oppfylt"],
    ["nyverdi.alder", "Innen ett år etter registrering som fabrikkny på forsikringstakeren"], ["nyverdi.km", "Ikke kjørt mer enn 10 000 km"],
    ["nyverdi.skadegrad", "Forventet reparasjonskostnad må overstige 80 % av nyanskaffelsesverdi på skadedagen"],
    ["nyverdi.begrensning", "Tyveri: ikke gjenfunnet innen tre uker. Leaset kjøretøy er unntatt; selskapet kan gjøre opp kontant."],
  ]));
const trygMcExtra = combine(trygMcKasko,
  tr("mc", "05PAU27010", 1, "1 – Maskinskade", [
    ["maskinskade.dekning", "Plutselig og uforutsett mekanisk skade på motor, girkasse og kraftoverføring med elektroniske styreenheter"],
    ["maskinskade.alder", "Innen åtte år etter første registrering som fabrikkny"], ["maskinskade.egenandel", "4 000 kr før tre år; 6 000 kr fra tre til og med sju år", "coverage"],
    ["maskinskade.begrensning", "Slitasje/korrosjon, ikke-godkjent ombygging/effektøkning og ordinære kaskoskader er unntatt. Garanti/reklamasjon skal først forsøkes."],
  ]), tr("mc", "05PAU27010", 1, "1 – Parkert motorsykkel, leiebil og utstyr", [
    ["mc.parkert.dekning", "Erstatningsmessig kaskoskade mens motorsykkelen er parkert dekkes uten bonustap når eventuell skadevolder er ukjent"],
    ["mc.parkert.alder", "Innen seks år etter første registrering som fabrikkny"],
    ["mc.leiekjoretoy.dekning", "Leie av bil eller motorsykkel ved erstatningsmessig skade, dokumentert med faktura"],
    ["mc.leiekjoretoy.dagsbelop", "Inntil 500 kr per dag"], ["mc.leiekjoretoy.dager", "Normal reparasjonstid, maksimalt 10 dager"],
    ["mc.leiekjoretoy.begrensning", "Andre utgifter til bruk av leiekjøretøy erstattes ikke"],
    ["mc.bagasje.grense", "30 000 kr i låsbar bagasjeboks"], ["mc.bagasje.begrensning", "Ikke haikeres bagasje, næringsutstyr, penger, verdipapirer eller dyr"],
    ["utstyr.grense", "50 000 kr for lovlig fastmontert tilbehør"],
  ]), tr("mc", "05PAU27010", 2, "1 – Feilfylling og nøkkel", [
    ["feilfylling.dekning", "Rens av motor etter feilfylling av drivstoff"], ["feilfylling.grense", "Inntil 15 000 kr"], ["feilfylling.egenandel", "1 000 kr", "coverage"],
    ["nokkel.dekning", "Skade på eller tap av nøkkel til motorsykkelen"], ["nokkel.grense", "20 000 kr"], ["nokkel.egenandel", "1 000 kr", "coverage"],
  ]));
product("tryg", "mc", "Ansvar", "ansvar", "05PAU20900", trygBase("mc"));
product("tryg", "mc", "Delkasko", "delkasko", "05PAU25935", trygMcDelkasko);
product("tryg", "mc", "Kasko", "kasko", "05PAU25405", trygMcKasko);
product("tryg", "mc", "MC Ekstra", "mc-ekstra", "05PAU27010", trygMcExtra);

function trygAccident(type: Vehicle) {
  return [...tr(type, "05PAU28003", 1, "1–2", [
    ["ulykke.dekning", "Avtalt ulykkesdekning for fører og passasjer"],
    ["ulykke.omfang", "Ulykke i/på kjøretøyet; også utenfor når kjøretøyet er direkte skadeårsak"],
  ]), ...tr(type, "05PAU28003", 2, "3.1–3.2", [["ulykke.invaliditet", "Inntil 200 000 kr ved varig medisinsk invaliditet"], ["ulykke.dod", "100 000 kr ved dødsfall som følge av ulykkesskade innen ett år"]])];
}
addOn("tryg", "mc", "Fører- og passasjerulykke", "ulykke", "05PAU28003", ["Ansvar", "Delkasko", "Kasko"], trygAccident("mc"));
addOn("tryg", "mc", "Fører- og passasjerulykke", "ulykke-ekstra", "05PAU28003", ["MC Ekstra"], combine(trygAccident("mc"), tr("mc", "05PAU27010", 2, "Utvidet sum invaliditet", [["ulykke.invaliditet", "Ved avtalt fører-/passasjerulykke: 500 000 kr ved invaliditetsgrad over 25 %; ellers ordinær sum 200 000 kr"]])));

const trygBobilDelkasko = combine(trygBase("bobil"), trygPhysical("bobil"), tr("bobil", "05PAU25335", 1, "1–2.2", [
  ["bobil.fortelt.dekning", "Fortelt og terrasse konstruert for forsikret bobil, uavhengig av byggemateriale"],
  ["bobil.fortelt.begrensning", "Tyveri fra fortelt av tøy er unntatt; tyveri av/fra fortelt eller terrasse er unntatt når bobilen er fjernet"],
  ["bobil.losore.dekning", "Løst utstyr og personlige eiendeler i forsikret bobil og fortelt"], ["bobil.losore.grense", "15 000 kr, med mindre annen sum er avtalt"], ["bobil.losore.gjenstand", "Inntil 5 000 kr per gjenstand"],
  ["bobil.losore.begrensning", "Penger, verdipapirer, antikviteter, smykker, CD/DVD, elektroniske spill, vin og brennevin er unntatt"],
]));
const trygBobilKasko = combine(trygBobilDelkasko, tr("bobil", "05PAU25305", 1, "2.1", [
  ["kasko.dekning", "Skade på kjøretøy, deler, fortelt og terrasse ved sammenstøt, utforkjøring, velt, hærverk, feilfylling eller plutselig uventet ytre påvirkning"],
  ["kasko.egenandel", "Avtalt egenandel i forsikringsbeviset; økes 5 000 kr ved fører under 23 år, unntatt når føreren er forsikringstaker", "reference"],
  ["kasko.begrensning", "Maskinbrudd, frost og strømbrudd er unntatt"], ["bobil.skadedyr.dekning", "Skade forårsaket av insekter, gnagere og andre skadedyr"],
]));
const trygBobilExtra = combine(trygBobilKasko, tr("bobil", "05PAU27007", 1, "1 – Utstyr, bagasje, nøkkel og feilfylling", [
  ["utstyr.grense", "50 000 kr samlet for fastmontert tilbehør og ekstra dekk/felger"],
  ["bobil.losore.grense", "100 000 kr samlet; eventuell avtalt utvidelse kommer i tillegg"], ["bobil.losore.gjenstand", "10 000 kr per gjenstand; samlet 15 000 kr i fortelt"], ["bobil.losore.egenandel", "1 000 kr", "coverage"],
  ["bobil.losore.begrensning", "Ikke dekket ved helt/delvis utleie. Haikeres bagasje, næringsutstyr, penger, verdipapirer, antikviteter, smykker og dyr er unntatt."],
  ["nokkel.dekning", "Skade på/tap av bilnøkkel og fjernkontroll til kupévarmer"], ["nokkel.grense", "20 000 kr per forsikringsår"], ["nokkel.egenandel", "1 000 kr", "coverage"],
  ["feilfylling.dekning", "Rens av motor etter feilfylling av drivstoff"], ["feilfylling.grense", "15 000 kr"], ["feilfylling.egenandel", "1 000 kr", "coverage"],
]), tr("bobil", "05PAU27007", 1, "1 – Fuktskade og avbrutt ferie", [
  ["bobil.fukt.dekning", "Fuktskade i bobilens tak, vegger og gulv oppstått i forsikringstiden"], ["bobil.fukt.alder", "Innen 15 år etter første registrering som fabrikkny"],
  ["bobil.fukt.egenandel", "8 000 kr før ti år; fra ti år 25 % av skaden, minimum 8 000 kr", "coverage"],
  ["bobil.fukt.begrensning", "Fortelt/terrasse, rørbrudd/rørlekkasje og frost er unntatt. Garanti/reklamasjon skal først forsøkes."],
  ["bobil.feriegaranti.dekning", "Rimelige nødvendige ekstrautgifter til leiebil/opphold når påbegynt ferie avbrytes av erstatningsmessig skade"],
  ["bobil.feriegaranti.dagsbelop", "Inntil 2 000 kr per dag"], ["bobil.feriegaranti.dager", "Resterende planlagte feriedager, maksimalt 14 dager"],
  ["bobil.feriegaranti.begrensning", "Utgifter, planlagt rute og lengde må dokumenteres; ingen dekning ved helt/delvis utleie. Tryg skaffer ikke leiebil; andre bruksutgifter dekkes ikke."],
]));
product("tryg", "bobil", "Ansvar", "ansvar", "05PAU18800", trygBase("bobil"));
product("tryg", "bobil", "Delkasko", "delkasko", "05PAU25335", trygBobilDelkasko);
product("tryg", "bobil", "Kasko", "kasko", "05PAU25305", trygBobilKasko);
product("tryg", "bobil", "Bobil Ekstra", "bobil-ekstra", "05PAU27007", trygBobilExtra);
addOn("tryg", "bobil", "Fører- og passasjerulykke", "ulykke", "05PAU28003", ["Ansvar", "Delkasko", "Kasko", "Bobil Ekstra"], trygAccident("bobil"));
addOn("tryg", "bobil", "Maskinskade", "maskinskade", "05PAU27110", ["Kasko", "Bobil Ekstra"], [
  ...tr("bobil", "05PAU27110", 1, "1", [
    ["maskinskade.dekning", "Plutselige og uforutsette skader/feil på vilkårets oppregnede motor-, gir-, drivlinje- og elektroniske komponenter"],
    ["maskinskade.alder", "Til og med forsikringsperioden kjøretøyet blir ti år, regnet fra første registrering"], ["maskinskade.km", "Inntil kilometerstanden er 200 000 km; dekningen opphører når alder eller kilometergrense nås først"],
  ]), ...tr("bobil", "05PAU27110", 2, "1 – Unntak og egenandel", [
    ["maskinskade.egenandel.kilometer", "10 000 kr inntil 120 000 km; 14 000 kr mellom 120 000–160 000 km; 18 000 kr mellom 160 000–200 000 km", "coverage"],
    ["maskinskade.begrensning", "Utstyr/installasjoner som vesentlig inngår i bodelen, slitasje/korrosjon, ikke-godkjent effektøkning og ordinære kaskoskader er unntatt. Garanti/reklamasjon skal først forsøkes."],
  ]),
]);

function ifBase(type: Vehicle) {
  return [...iff(type, "MOT2-2", 4, "4–4.1", [
    ["ansvar.dekning", "Bilansvar etter norsk lov i Norge og skadestedets lov utenlands, med høyere norsk dekning på vilkårene"],
    ["rettshjelp.dekning", "Rettshjelp ved tvist som personlig eier, rettmessig bruker eller fører av kjøretøyet"],
    ["ulykke.dekning", "Fører- og passasjerulykke inngår i Ansvar; kundens forsikringsbevis har forrang"],
  ]), ...iff(type, "MOT2-2", 3, "2", [["avtale.geografi", "Europa unntatt Kosovo, Russland, Belarus og den asiatiske delen av Tyrkia"], ["rettshjelp.geografi", "Norden"]]),
  ...iff(type, "MOT2-2", 19, "8.5.2", [["rettshjelp.egenandel", "4 000 kr + 20 % av overskytende, hvis ikke annen egenandel følger særvilkår/forsikringsbevis", "standard"]]),
  ...iff(type, "MOT2-2", 22, "11.4–11.5", [["ulykke.omfang", "Ulykke i/på motorvognen; fører også utenfor når motorvognen er direkte skadeårsak ved bruken"], ["ulykke.invaliditet", "200 000 kr per forsikret ved medisinsk invaliditet"], ["ulykke.dod", "100 000 kr ved dødsfall som følge av ulykken; dødsfall innen to år etter skadedato"]]),
  ];
}
function ifPhysical(type: Vehicle) {
  const baggage = type === "mc" ? "mc.bagasje" : "bobil.losore";
  return [...iff(type, "MOT2-2", 3, "3.4", [
    ["utstyr.dekning", "Lovlig ettermontert fast tilleggsutstyr dekket sammen med bagasje"], ["utstyr.grense", "40 000 kr samlet med bagasje, maksimalt 50 % av gjenanskaffelsesverdi; avtalt sum kan utvides"],
    [`${baggage}.dekning`, "Bagasje dekket sammen med ettermontert tilleggsutstyr"], [`${baggage}.grense`, "40 000 kr samlet med tilleggsutstyr, maksimalt 50 % av gjenanskaffelsesverdi; avtalt sum kan utvides"],
  ]), ...iff(type, "MOT2-2", 4, "4.2", [["brann.dekning", "Brann ved åpen flamme, eksplosjon og lynnedslag"], ["brann.begrensning", "Batterier/elektroniske enheter krever åpen ild på utsiden av enheten"]]),
  ...iff(type, "MOT2-2", 5, "4.3–4.7", [
    ["tyveri.dekning", "Tyveri, forsøk på tyveri og innbrudd; visse former for underslag ved annonsert salg/prøvekjøring"],
    ["naturskade.dekning", "Skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden"],
    ["glass.dekning", "Brudd på utvendige glass-/plexiglassruter i kupé, førerhus og lasterom ved tilfeldig, plutselig hendelse"],
    ["glass.begrensning", "Lykter/slitasjeskade unntatt; ved bytte maksimalt 50 % av kjøretøyets gjenanskaffelsesverdi"],
    ["veihjelp.dekning", "Assistanse og transport ved dekket skade/tyveri, startvansker, motorstopp, tom tank, feilfylling, utelåsing eller annet uventet driftsstopp"],
  ]), ...iff(type, "MOT2-2", 6, "4.7.2–4.7.3", [["veihjelp.begrensning", "Transport inntil 50 % av kjøretøyets verdi; verkstedreparasjon og ytelser dekket av annen garanti/avtale unntatt. Rens/tømming ved feilfylling maksimalt 5 000 kr."]]),
  ...iff(type, "MOT2-2", 19, "8.5.3–8.5.6", [
    ["brann.egenandel", "8 000 kr hvis ikke annet fremgår av særvilkår eller forsikringsbevis", "standard"], ["tyveri.egenandel", "8 000 kr hvis ikke annet fremgår av særvilkår eller forsikringsbevis", "standard"],
    ["glass.egenandel", "3 000 kr ved bytte hvis ikke annet er avtalt", "standard"], ["glass.reparasjon.egenandel", "0 kr ved reparasjon", "standard"], ["veihjelp.egenandel", "750 kr hvis ikke annet er avtalt", "standard"],
  ]), ...iff(type, "MOT2-2", 18, "8.4.2", [
    ["nyverdi.dekning", "Fabrikknytt kjøretøy ved dekningsmessig totalskade når alle nyverdibetingelsene er oppfylt"],
    ["nyverdi.alder", "Innen ett år etter registrering som fabrikkny"], ["nyverdi.km", "Ikke kjørt mer enn 15 000 km"],
    ["nyverdi.skadegrad", "Reparasjonskostnad over 80 % av kjøpesummen som ny inkludert fastmontert utstyr"],
    ["nyverdi.begrensning", "Ikke leaset, drosje-, skole- eller utleiekjøretøy, prøvekjennemerke eller særskilte turist-/eksport-/diplomatskilt. Dokumentasjons- og gjenkjøpskrav gjelder; kontantoppgjør er mulig."],
  ])];
}
function ifKasko(type: Vehicle) {
  return [...iff(type, "MOT2-2", 6, "4.8", [["kasko.dekning", "Sammenstøt, utforkjøring, velt, feilfylling eller annen tilfeldig, plutselig ytre hendelse"]]),
    ...iff(type, "MOT2-2", 19, "8.5.5", [["kasko.egenandel", "8 000 kr hvis ikke annet fremgår av særvilkår eller forsikringsbevis", "standard"]])];
}
const ifMcDelkasko = combine(ifBase("mc"), ifPhysical("mc"), iff("mc", "SV692", 1, "1", [
  ["mc.kjoreutstyr.dekning", "Personlig kjøreutstyr: hjelm, kjøredress, hansker, kjørestøvler, ryggskinne og airbagvest/-jakke/-dress"],
]), iff("mc", "SV692", 3, "3.1, 4.1", [
  ["mc.kjoreutstyr.begrensning", "Verneutstyr skal være nedlåst i fastlåst/fastboltet bagasje eller fastlåst til kjøretøyet; nøkkel oppbevares separat"],
  ["tyveri.begrensning", "Tyveriegenandel reduseres 2 000 kr når godkjent FG-tilleggslås var i bruk og korrekt montert"],
]), rows(sourceId("if", "mc", "if-mc-product.html"), 1, "Dette dekker MC-forsikring – Kjøreutstyr", [["mc.kjoreutstyr.grense", "Ubegrenset sum for dokumentert personlig kjøreutstyr"]]));
product("if", "mc", "Ansvar", "ansvar", "MOT2-2", ifBase("mc"));
product("if", "mc", "Delkasko", "delkasko", "MOT2-2", ifMcDelkasko);
product("if", "mc", "Kasko", "kasko", "MOT2-2", combine(ifMcDelkasko, ifKasko("mc")));
addOn("if", "mc", "Motor- og girskade", "motor-gir", "SV692", ["Kasko"], [
  ...iff("mc", "SV692", 1, "2–2.1", [["maskinskade.dekning", "Valgfritt til Kasko for mellomtung/tung motorsykkel; plutselig uforutsett skade på oppregnede motor-, gir-, drivlinje- og elektriske komponenter"]]),
  ...iff("mc", "SV692", 2, "2.2–2.7", [
    ["maskinskade.alder", "Opphører når motorsykkelen er åtte år; alder beregnes fra 1. januar året etter kjøp som ny"],
    ["maskinskade.egenandel", "4 000 kr etter aldersfradrag", "coverage"],
    ["maskinskade.aldersfradrag", "10 % under fem år; 15 % til og med fem år; 20 % til og med seks år; 30 % til og med sju år"],
    ["maskinskade.begrensning", "Kun mellomtung/tung MC. Slitasje, korrosjon/varmgang, drivstoff etter lagring, trimming, konstruksjonsfeil og oppregnede slitedeler er unntatt; reparasjon begrenset til gjenanskaffelsesverdi før fradrag."],
  ]), ...iff("mc", "mc-ipid", 1, "Hvilken forsikring er dette?", [["maskinskade.kjopsalder", "Kan kjøpes før motorsykkelen er sju år; bare mellomtung/tung MC med Kasko"]]),
]);

const ifBobilDelkasko = combine(ifBase("bobil"), ifPhysical("bobil"), iff("bobil", "SV707", 2, "1", [["bobil.fortelt.dekning", "Annen bygningskonstruksjon brukt som tilbygg til campingvogn eller bobil"], ["bobil.fortelt.grense", "40 000 kr"]]), iff("bobil", "SV707", 3, "4", [["bobil.fortelt.begrensning", "Ikke tyveri av løst utstyr/personlige eiendeler fra fortelt av duk"], ["bobil.losore.begrensning", "Penger/verdipapir og tyveri fra fortelt av duk er unntatt"]]));
const ifBobilKasko = combine(ifBobilDelkasko, ifKasko("bobil"), iff("bobil", "SV707", 4, "4", [["kasko.begrensning", "Ikke frost/snøtyngde, utett isolerglass eller vibrasjon/vridning ved ujevn vei. Løst utstyr ved annen plutselig ytre hendelse krever samtidig skade på bobilen."]]));
const ifBobilSuper = combine(ifBobilKasko,
  iff("bobil", "MOT2-2", 11, "4.11–4.11.1 (innlemmet av SV707 §3.3)", [
    ["nyverdi.dekning", "Super totalskadegaranti når vilkårenes samlede betingelser er oppfylt"], ["nyverdi.alder", "Innen tre år etter registrering som fabrikkny"], ["nyverdi.km", "Før 60 000 km"],
    ["nyverdi.skadegrad", "Reparasjonsomkostningene må overstige gjenanskaffelsesverdien"],
    ["nyverdi.begrensning", "Ny bil gjelder ikke leaset kjøretøy; leaset kjøretøy har forholdsmessig startleiedekning. Super gjelder ikke drosje-, skole-/utleiebil, ikke-godkjent effektøkning eller skade med prøvekjennemerke."],
  ]), iff("bobil", "MOT2-2", 12, "4.11.2–4.11.7 (innlemmet av SV707 §3.3)", [
    ["nokkel.dekning", "Ny nøkkel/programmering/omkoding ved tilfeldig plutselig skade, tap eller tyveri; tid og årsak må kunne knyttes til hendelsen"], ["nokkel.egenandel", "1 000 kr", "coverage"], ["nokkel.grense", "20 000 kr samlet for uhells- og parkeringsskade per skadetilfelle"],
    ["feilfylling.dekning", "Skade direkte som følge av fylling av feil væske"], ["feilfylling.egenandel", "1 000 kr", "coverage"], ["feilfylling.grense", "20 000 kr samlet for uhells- og parkeringsskade per skadetilfelle"],
    ["parkering.dekning", "Skade fra annet ukjent kjøretøy mens bobilen er parkert; bestemt tid/sted må angis og skaden meldes straks"], ["parkering.grense", "20 000 kr samlet for uhells- og parkeringsskade per skadetilfelle"], ["parkering.egenandel", "Valgt Kasko-egenandel", "reference"], ["parkering.bonus", "Ingen bonustap for skader innen denne dekningen"],
  ]), iff("bobil", "SV707", 2, "3.3.1", [
    ["bobil.vann.dekning", "Lekkasje fra boenhetens røranlegg for ferskvann/avløp og varmesystem"], ["bobil.vann.begrensning", "Krever ikke fuktkontroll; bobilen må være nyere enn 15 år fra produksjonsår. Frost/snøtyngde er unntatt."],
    ["bobil.fukt.alder", "Nyere enn 15 år fra produksjonsår"],
  ]), iff("bobil", "SV707", 3, "3.3.1–3.3.4", [
    ["bobil.fukt.dekning", "Andre fuktskader enn lekkasje fra boenhetens røranlegg etter godkjent/bestått fuktkontroll"], ["bobil.fukt.kontroll", "Autorisert caravanforhandler eller Viking kontroll; dekning inntil ett år etter kontroll, deretter ny kontroll"], ["bobil.fukt.begrensning", "Frost og snøtyngde, også som medvirkende årsak, er unntatt"],
    ["bobil.feriegaranti.dekning", "Utgifter til alternativ overnatting eller leiebil etter erstatningsmessig skade på påbegynt ferie"], ["bobil.feriegaranti.dagsbelop", "Inntil 1 500 kr per dag"], ["bobil.feriegaranti.dager", "Resterende planlagt ferie, maksimalt 15 dager"], ["bobil.feriegaranti.begrensning", "Faktura/kvittering kreves; kunden skaffer selv overnatting/leiebil"],
    ["utstyr.grense", "100 000 kr samlet med bagasje"], ["bobil.losore.grense", "100 000 kr samlet med tilleggsutstyr"],
    ["bobil.skadedyr.dekning", "Uforutsett skade på bobilen fra insekter og gnagere"], ["bobil.skadedyr.begrensning", "Bagasje/tilleggsutstyr bare ved samtidig skade på bobilen. Dører, vinduer og luker skal være lukket under lagring."],
  ]));
product("if", "bobil", "Ansvar", "ansvar", "MOT2-2", ifBase("bobil"));
product("if", "bobil", "Delkasko", "delkasko", "MOT2-2", ifBobilDelkasko);
product("if", "bobil", "Kasko", "kasko", "MOT2-2", ifBobilKasko);
product("if", "bobil", "Super", "super", "SV707", ifBobilSuper);
addOn("if", "bobil", "Leiebil", "leiebil", "SV707", ["Kasko", "Super"], [
  ...iff("bobil", "SV707", 2, "3.2", [["leiebil.dekning", "Valgfri leiebilforsikring ved dekningsmessig skade"], ["leiebil.dager", "Inntil 45 dager ved reparasjon, kondemnasjon eller tyveri"]]),
  ...iff("bobil", "MOT2-2", 10, "4.10.1–4.10.5", [["leiebil.dagsgrense", "Inntil 500 kr per dag inkludert merverdiavgift"], ["leiebil.begrensning", "Ikke glasskade alene eller når ytelsen dekkes av lov/mobilitetsgaranti; vilkåret har et særskilt unntak på inntil sju dager. Uten behov for leiebil: 200 kr per dag, maksimalt 15 dager."]]),
]);
addOn("if", "bobil", "Motor- og girskade", "motor-gir", "SV707", ["Kasko", "Super"], [
  ...iff("bobil", "SV707", 2, "3.1", [["maskinskade.dekning", "Valgfritt til Kasko; oppregnede plutselige og uforutsette motor-/gir-/elektronikkskader etter MOT2-2 §4.9"]]),
  ...iff("bobil", "MOT2-2", 8, "4.9.3", [["maskinskade.km", "Dekker ikke skade som oppstår etter at kjøretøyet er kjørt mer enn 200 000 km"]]),
  ...iff("bobil", "MOT2-2", 9, "4.9.3–4.9.6", [["maskinskade.egenandel", "8 000 kr etter kilometerfradrag", "coverage"], ["maskinskade.kilometerfradrag", "Ingen før 100 000 km; 10 % etter 100 000 km; 20 % etter 150 000 km; 30 % etter 175 000 km"], ["maskinskade.begrensning", "Skade før kjøp, slitasje/korrosjon/varmgang, ikke-godkjent tuning og garanti-/konstruksjons-/produksjons-/softwarefeil er unntatt; fabrikantens servicekrav må følges."]]),
  ...rows(sourceId("if", "bobil", "if-bobil-product.html"), 1, "Motor- og girskadeforsikring", [["maskinskade.kjopsalder", "Kan kjøpes før bobilen er 15 år"], ["maskinskade.kjopskm", "Kan kjøpes før bobilen har kjørt 150 000 km"]]),
]);

export const trygIfMcBobilCatalog = buildMcBobilCatalog(sources, definitions, additions);
