import type { CatalogSource } from "./product-catalog.ts";

// Kontrollert mot offisielle originalfiler 20.09.2026; aktiv skjæringsdato 19.09.2026.
// Tom effectiveFrom betyr ikke oppgitt. IPID oppgir versjonsdato, ikke gyldighetsdato.
export const trygHusSources: Record<string, CatalogSource> = {
  "trygHus": {
    "id": "trygHus",
    "filename": "05PPK11501.pdf",
    "documentName": "Bygning",
    "termsNumber": "PPK11501",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK11501&vilk=Husforsikring-Bygning",
    "sha256": "72bb9ff83a56790bfd1e84e6444d9e7316071f583f1913b238b0f4f145a24182",
    "appliesTo": [
      "Hus"
    ]
  },
  "trygHusExtra": {
    "id": "trygHusExtra",
    "filename": "05PPK11502.pdf",
    "documentName": "Bygning Ekstra",
    "termsNumber": "PPK11502",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK11502&vilk=Husforsikring-Bygning-Ekstra",
    "sha256": "14e342abbccb445c16a4e448a24ff6ac3588d8a12567a698dd2fb0cba88bf68f",
    "appliesTo": [
      "Hus Ekstra"
    ]
  },
  "trygHusRental": {
    "id": "trygHusRental",
    "filename": "05PPK11506.pdf",
    "documentName": "Utleie",
    "termsNumber": "PPK11506",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK11506&vilk=Utleieforsikring-Hus",
    "sha256": "7291f82a98a75c3ada8c2f9a34f03a9031dcb55abe7bb6cf8805ab6f130bdf3b",
    "appliesTo": [
      "Hus/Hus Ekstra med Utleieforsikring"
    ]
  },
  "trygHusConstruction": {
    "id": "trygHusConstruction",
    "filename": "05PPK11503.pdf",
    "documentName": "Bygg under oppføring",
    "termsNumber": "PPK11503",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK11503&vilk=Husforsikring-Bygg-under-oppfoering",
    "sha256": "08d184e30d4099a79dd79406d354b267903b69fd5e9834996adf4f05da73da62",
    "appliesTo": [
      "Bygg under oppføring (utenfor ordinær Hus-MVP)"
    ]
  },
  "trygHusRot": {
    "id": "trygHusRot",
    "filename": "05PPK40502.pdf",
    "documentName": "Råte og skadedyr Hus",
    "termsNumber": "PPK40502",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK40502&vilk=Hussoppforskring-Hus",
    "sha256": "97b0dafe4c6b5a1a4e051b2b5847effbe535e9ce2bbcdefd54c894106f156e22",
    "appliesTo": [
      "Hus/Hus Ekstra med Råte- og skadedyr"
    ]
  },
  "trygHusProduct": {
    "id": "trygHusProduct",
    "filename": "05PPK11500.pdf",
    "documentName": "Hus – produktvilkår",
    "termsNumber": "PPK11500",
    "effectiveFrom": "2025-07-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK11500&vilk=Husforsikring-Produkt",
    "sha256": "7d8b5e3498b215d46b19addcfd58fa86dbe507c869849a468a3f912950c7acd7",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusRotProduct": {
    "id": "trygHusRotProduct",
    "filename": "05PPK40501.pdf",
    "documentName": "Råte og skadedyr – produktvilkår",
    "termsNumber": "PPK40501",
    "effectiveFrom": "2025-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PPK40501&vilk=Hussoppforskring-Produkt",
    "sha256": "0082c8839f3e852ced102781984e028c56e4596a9458b970f349e99c949e497b",
    "appliesTo": [
      "Hus/Hus Ekstra med Råte- og skadedyr"
    ]
  },
  "trygHusSafety": {
    "id": "trygHusSafety",
    "filename": "05000PF115.pdf",
    "documentName": "Hus – sikkerhetsforskrifter",
    "termsNumber": "PF115",
    "effectiveFrom": "",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PF115&vilk=Husforsikring-Sikkerhetsforskrift-Hus",
    "sha256": "a24ec3a7a9378b450f39424dc2f2327a695387fb0873832f29c796ee4658e4c7",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusConstructionSafety": {
    "id": "trygHusConstructionSafety",
    "filename": "05000PF118.pdf",
    "documentName": "Bygg under oppføring – sikkerhetsforskrifter",
    "termsNumber": "PF118",
    "effectiveFrom": "",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PF118&vilk=Husforsikring-Sikkerhetsforskrift-bygg-under-oppfoering",
    "sha256": "9a30fb543469d556daf4275a2bfdbc2a1e26f9f1e53dcbb429ce4c5ecaf53c54",
    "appliesTo": [
      "Bygg under oppføring (utenfor ordinær Hus-MVP)"
    ]
  },
  "trygHusRentalSafety": {
    "id": "trygHusRentalSafety",
    "filename": "05000PF121.pdf",
    "documentName": "Utleie – sikkerhetsforskrifter",
    "termsNumber": "PF121",
    "effectiveFrom": "",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PF121&vilk=Husforsikring-Sikkerhetsforskrift-utleie",
    "sha256": "63b30f74942357e9850fc6e4a23d9c2b9c8926ec13e48ce7da24d48a7608acdc",
    "appliesTo": [
      "Hus/Hus Ekstra med Utleieforsikring"
    ]
  },
  "trygHusRotSafety": {
    "id": "trygHusRotSafety",
    "filename": "05000PF405.pdf",
    "documentName": "Råte og skadedyr – sikkerhetsforskrifter",
    "termsNumber": "PF405",
    "effectiveFrom": "",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05000PF405&vilk=Hussoppforskring-Sikkerhetsforskrift",
    "sha256": "12d5272ef00573be27b313bdb206a29e1e551842fc79a7324c772858ab48ebda",
    "appliesTo": [
      "Hus/Hus Ekstra med Råte- og skadedyr"
    ]
  },
  "trygHusGeneral": {
    "id": "trygHusGeneral",
    "filename": "05PGE91000.pdf",
    "documentName": "Generelle vilkår",
    "termsNumber": "PGE91000",
    "effectiveFrom": "2024-07-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Fellesvilkaar-Generelle",
    "sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusLiabilityFuture": {
    "id": "trygHusLiabilityFuture",
    "filename": "05PGE90020.pdf",
    "documentName": "Privatansvar (fremtidig)",
    "termsNumber": "PGE90020",
    "effectiveFrom": "2026-10-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE90020&vilk=Fellesvilkaar-Privat",
    "sha256": "c75dcb29b61d990dd95869e884fb64f59dd839717f9cb88fa9d85f0618d000df",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusLegal": {
    "id": "trygHusLegal",
    "filename": "05PGE91500.pdf",
    "documentName": "Rettshjelp",
    "termsNumber": "PGE91500",
    "effectiveFrom": "2026-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Fellesvilkaar-Rettshjelp",
    "sha256": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusNatural": {
    "id": "trygHusNatural",
    "filename": "05PGE90010.pdf",
    "documentName": "Naturskade",
    "termsNumber": "PGE90010",
    "effectiveFrom": "2025-01-01",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PGE90010&vilk=Fellesvilkaar-Naturskade",
    "sha256": "11439a7669131319396db7c2caa6f28ac140389e3e11408bb75badea0fdccef6",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ]
  },
  "trygHusIpid": {
    "id": "trygHusIpid",
    "filename": "IPID-Hus.pdf",
    "documentName": "IPID Husforsikring",
    "termsNumber": "Ikke oppgitt",
    "effectiveFrom": "",
    "company": "Tryg",
    "insuranceType": "Hus",
    "url": "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Hus.pdf",
    "sha256": "eda4c8f477db870f4a15b7c7342eb4b39d252b169ae285ae437b71a88da43390",
    "appliesTo": [
      "Hus",
      "Hus Ekstra"
    ],
    "version": "01.07.2022"
  }
};
