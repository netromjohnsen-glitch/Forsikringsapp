import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { catalogFactSources, enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { boatPetFactLabel } from '../lib/boat-pet-registry.ts';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { groupAddOnNames } from '../lib/comparison.ts';
import { sourceHash } from './helpers/wave3-catalog-gate.mjs';

// B-071-SOURCE-CLEAR: ten approved signatures; held base rehabilitation is intentionally unchanged.
const sources = [
  {
    "source_artifact": "catalog/sources/boat-pet/fremtind-dog-life-terms.pdf",
    "expected_sha256": "8445f2c6faede5cfe1c6054e58cc880fc4cea1bbc31321ddc76fdbd035dcf43d",
    "actual_sha256": "8445f2c6faede5cfe1c6054e58cc880fc4cea1bbc31321ddc76fdbd035dcf43d",
    "scopes": [
      "B-071"
    ],
    "roles": [
      "TARGET"
    ],
    "references": [
      "GAP-5599/SF-7942",
      "GAP-5602/SF-7945"
    ],
    "status": "PASS_FROZEN_BYTES"
  },
  {
    "source_artifact": "catalog/sources/boat-pet/fremtind-dog-use-terms.pdf",
    "expected_sha256": "456a1c4f38b4c3934bf0b4c9ed1167e805d5238fb1960115d9cb1e2e65aafcc2",
    "actual_sha256": "456a1c4f38b4c3934bf0b4c9ed1167e805d5238fb1960115d9cb1e2e65aafcc2",
    "scopes": [
      "B-071"
    ],
    "roles": [
      "TARGET",
      "CONTROL"
    ],
    "references": [
      "GAP-5603/SF-7946",
      "GAP-5604/SF-7947",
      "PC-2192"
    ],
    "status": "PASS_FROZEN_BYTES"
  },
  {
    "source_artifact": "catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf",
    "expected_sha256": "5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7",
    "actual_sha256": "5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7",
    "scopes": [
      "B-071"
    ],
    "roles": [
      "TARGET",
      "CONTROL"
    ],
    "references": [
      "GAP-5581/SF-7924",
      "GAP-5590/SF-7933",
      "GAP-5592/SF-7935",
      "GAP-5595/SF-7938",
      "GAP-5596/SF-7939",
      "GAP-5597/SF-7940",
      "GAP-5598/SF-7941",
      "PC-2191"
    ],
    "status": "PASS_FROZEN_BYTES"
  },
  {
    "source_artifact": "catalog/sources/boat-pet/fremtind-sb1-dog-product.html",
    "expected_sha256": "d1df53466581b99a17579ccb9b24dd92b22aa7c5ec905f8b827b21c4590548f4",
    "actual_sha256": "d1df53466581b99a17579ccb9b24dd92b22aa7c5ec905f8b827b21c4590548f4",
    "scopes": [
      "B-071"
    ],
    "roles": [
      "CONTROL"
    ],
    "references": [
      "PC-2193",
      "PC-2194",
      "PC-2195"
    ],
    "status": "PASS_FROZEN_BYTES"
  }
];
const bindings = [
  {
    "signature": "2b078b058bc63967",
    "gap": "GAP-5581",
    "sf": "SF-7924",
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "keys": [
      "dyr.veterinar.dekning",
      "dyr.medisin.dekning"
    ]
  },
  {
    "signature": "1ee41770b0470c78",
    "gap": "GAP-5592",
    "sf": "SF-7935",
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "keys": [
      "dyr.veterinar.egenandel.fast",
      "dyr.veterinar.egenandel.prosent",
      "dyr.veterinar.egenandel.periode"
    ]
  },
  {
    "signature": "dc3e04a5fcce2317",
    "gap": "GAP-5595",
    "sf": "SF-7938",
    "owner": "sparebank1-fremtind-hund-topp",
    "keys": [
      "dyr.allergi.dekning",
      "dyr.allergi.grense"
    ]
  },
  {
    "signature": "0da02a8dae8fd373",
    "gap": "GAP-5596",
    "sf": "SF-7939",
    "owner": "sparebank1-fremtind-hund-topp",
    "keys": [
      "dyr.diagnostikk.dekning",
      "dyr.diagnostikk.grense"
    ]
  },
  {
    "signature": "688cc5923342804d",
    "gap": "GAP-5597",
    "sf": "SF-7940",
    "owner": "sparebank1-fremtind-hund-topp",
    "keys": [
      "dyr.tannsykdom.dekning"
    ]
  },
  {
    "signature": "6e5f3830ca4701d4",
    "gap": "GAP-5598",
    "sf": "SF-7941",
    "owner": "sparebank1-fremtind-hund-topp",
    "keys": [
      "dyr.rehabilitering.dekning"
    ]
  },
  {
    "signature": "6f0ac8fe783a963d",
    "gap": "GAP-5599",
    "sf": "SF-7942",
    "owner": "sparebank1-fremtind-hund-liv",
    "keys": [
      "dyr.liv.dekning"
    ]
  },
  {
    "signature": "1982ee310e18279c",
    "gap": "GAP-5602",
    "sf": "SF-7945",
    "owner": "sparebank1-fremtind-hund-liv",
    "keys": [
      "dyr.liv.forsvinning",
      "dyr.liv.tyveri"
    ]
  },
  {
    "signature": "0f51d1c0374f1f1f",
    "gap": "GAP-5603",
    "sf": "SF-7946",
    "owner": "sparebank1-fremtind-hund-bruk",
    "keys": [
      "hund.bruksverdi.dekning"
    ]
  },
  {
    "signature": "03cff9fe5cfbf518",
    "gap": "GAP-5604",
    "sf": "SF-7947",
    "owner": "sparebank1-fremtind-hund-bruk",
    "keys": [
      "hund.bruksverdi.begrensning"
    ]
  }
];
const rows = [
  {
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "key": "dyr.veterinar.dekning",
    "value": "Inkludert: nødvendige veterinærutgifter som følge av sykdom eller ulykkesskade, og komplikasjoner som følge av vaksinasjon eller kastrering/sterilisering, innenfor valgt forsikringssum per forsikringsår.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 1,
    "section": "7 Veterinærutgifter",
    "quotes": [
      [
        1,
        "nødvendige veterinærutgifter som følge av sykdom eller ulykkesskade"
      ],
      [
        1,
        "komplikasjoner som følge av vaksinasjon eller kastrering/sterilisering"
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "key": "dyr.medisin.dekning",
    "value": "Inkludert: utgifter til reseptbelagte medisiner innenfor valgt forsikringssum per forsikringsår.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 1,
    "section": "7 Veterinærutgifter – reseptbelagte medisiner",
    "quotes": [
      [
        1,
        "utgifter til reseptbelagte medisiner"
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "key": "dyr.veterinar.egenandel.fast",
    "value": "Valg mellom 1 300, 2 000 eller 3 500 kr: kun én valgt fast egenandel i en egenandelsperiode på 135 dager regnet fra og med første veterinærutgift.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 2,
    "section": "8 Erstatningsregler – egenandel",
    "quotes": [
      [
        2,
        "I denne perioden trekker vi kun én egenandel på 1 300, 2 000 eller 3 500 kroner avhengig av hva du har valgt."
      ]
    ],
    "deductibleClassification": "reference"
  },
  {
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "key": "dyr.veterinar.egenandel.prosent",
    "value": "20 % av resterende veterinærutgifter etter den valgte faste egenandelen.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 2,
    "section": "8 Erstatningsregler – egenandel",
    "quotes": [
      [
        2,
        "I tillegg betaler du 20% av resterende veterinærutgifter."
      ]
    ],
    "deductibleClassification": "coverage"
  },
  {
    "owner": "sparebank1-fremtind-hund-veterin-r",
    "key": "dyr.veterinar.egenandel.periode",
    "value": "135 dager regnet fra og med første veterinærutgift; kun én valgt fast egenandel i perioden.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 2,
    "section": "8 Erstatningsregler – egenandel",
    "quotes": [
      [
        2,
        "Ved skade eller sykdom er det en egenandelsperiode på 135 dager som regnes fra og med første veterinærutgift."
      ]
    ],
    "deductibleClassification": "coverage"
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.allergi.dekning",
    "value": "Valgfri utvidelse: utredning, behandling og medisiner til atopi/allergi innenfor valgt forsikringssum per forsikringsår og med valgt egenandel.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter – atopi/allergi",
    "quotes": [
      [
        3,
        "utredning, behandling og medisiner til atopi/allergi"
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    },
    "replacesBase": true
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.allergi.grense",
    "value": "Innenfor valgt forsikringssum per forsikringsår og med valgt egenandel; ingen egen livstidsgrense på 15 000 kr når Topp er valgt.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter – atopi/allergi",
    "quotes": [
      [
        3,
        "Utvidelsen gjelder innenfor forsikringssummen i forsikringsbeviset med valgt egenandel."
      ],
      [
        3,
        "utredning, behandling og medisiner til atopi/allergi"
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    },
    "replacesBase": true
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.diagnostikk.dekning",
    "value": "Valgfri utvidelse: MR/CT innenfor valgt forsikringssum per forsikringsår og med valgt egenandel.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter – MR/CT",
    "quotes": [
      [
        3,
        "MR/ CT"
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    },
    "replacesBase": true
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.diagnostikk.grense",
    "value": "MR/CT innenfor valgt forsikringssum per forsikringsår og med valgt egenandel; ingen egen årsgrense på 15 000 kr når Topp er valgt.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter – MR/CT",
    "quotes": [
      [
        3,
        "MR/ CT"
      ],
      [
        3,
        "Utvidelsen gjelder innenfor forsikringssummen i forsikringsbeviset med valgt egenandel."
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    },
    "replacesBase": true
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.tannsykdom.dekning",
    "value": "Valgfri utvidelse: tannbehandling for karies, emaljedefekt og tannresorpsjon. Tilbakeholdte melketenner, tanncyster, tannstilling- og bittfeil dekkes dersom det er medisinsk nødvendig og hunden er forsikret før fire måneders alder. Ved korrigering av tannstilling- og bittfeil kreves veterinærattest fra hunden er mellom syv uker og fire måneders alder, uten anmerking på tenner/bitt. Innenfor valgt forsikringssum per forsikringsår og med valgt egenandel.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter – tannbehandling",
    "quotes": [
      [
        3,
        "tannbehandling for karies, emaljedefekt og tannresorpsjon"
      ],
      [
        3,
        "tilbakeholdte melketenner, tanncyster, tannstilling- og bittfeil dersom det er medisinsk nødvendig og hunden er forsikret før fire måneders alder."
      ],
      [
        3,
        "Ved korrigering av tannstilling- og bittfeil må det finnes en veterinærattest fra hunden er mellom syv uker og fire måneders alder som er uten anmerking på tenner/bitt"
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    }
  },
  {
    "owner": "sparebank1-fremtind-hund-topp",
    "key": "dyr.rehabilitering.dekning",
    "value": "Valgfri utvidelse. Fysioterapi, rehabilitering og kiropraktikk utført i løpet av 6 måneder etter bestilling fra behandlende veterinær, innenfor valgt forsikringssum per forsikringsår og med valgt egenandel.",
    "source": "boat-pet:sparebank1-fremtind:hund",
    "page": 3,
    "section": "Topp veterinærutgifter",
    "quotes": [
      [
        3,
        "fysioterapi/rehabilitering og kiropraktikk utført i løpet av 6 måneder etter det ble bestilt av behandlende veterinær"
      ]
    ],
    "qualificationSource": {
      "source": "boat-pet:sparebank1-fremtind:hund",
      "page": 1,
      "section": "6 Forsikringssum og egenandel"
    }
  },
  {
    "owner": "sparebank1-fremtind-hund-liv",
    "key": "dyr.liv.dekning",
    "value": "Valgfri separat dekning for hunden i forsikringsbeviset inntil valgt forsikringssum: hundens verdi hvis hunden dør eller må avlives i forsikringstiden som følge av ulykke eller sykdom som er dekket av veterinærforsikringen, samt forsvinning og tyveri. Sykdommer, lidelser og kostnader som ikke er dekket av veterinærforsikringen er unntatt. Erstatningen er gjenanskaffelseskostnad for tilsvarende hund på skadedagen, begrenset til valgt forsikringssum.",
    "source": "boat-pet:sparebank1-fremtind:hund:life",
    "page": 1,
    "section": "Død/tap hund – dekning og erstatningsregler",
    "quotes": [
      [
        1,
        "Forsikringen gjelder for hunden som er navngitt i forsikringsbeviset inntil valgt forsikringssum."
      ],
      [
        1,
        "hundens verdi hvis hunden dør eller må avlives i forsikringstiden som følge av ulykke eller sykdom som er dekket i forsikringen for veterinærutgifter."
      ],
      [
        1,
        "sykdommer/lidelser og kostnader som ikke er dekket i forsikringen for veterinærutgifter."
      ],
      [
        1,
        "Vi beregner erstatningen ved død/forsvunnet hund til hva det på skadedagen koster å kjøpe en tilsvarende hund, begrenset til forsikringssummen som kommer frem av forsikringsbeviset."
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-liv",
    "key": "dyr.liv.forsvinning",
    "value": "Inkludert når livsdekningen er valgt: stjålet/forsvunnet hund skal meldes til politiet og etterlyses ved annonsering. Erstatningen utbetales tidligst 3 måneder etter at hendelsen er meldt til selskapet og politiet.",
    "source": "boat-pet:sparebank1-fremtind:hund:life",
    "page": 1,
    "section": "Død/tap hund – stjålet/forsvunnet hund",
    "quotes": [
      [
        1,
        "Stjålet/forsvunnet hund skal meldes til politiet og etterlyses ved annonsering. Erstatningen utbetales tidligst 3 måneder etter at hendelsen er meldt til oss og politiet."
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-liv",
    "key": "dyr.liv.tyveri",
    "value": "Inkludert når livsdekningen er valgt: stjålet/forsvunnet hund skal meldes til politiet og etterlyses ved annonsering. Erstatningen utbetales tidligst 3 måneder etter at hendelsen er meldt til selskapet og politiet.",
    "source": "boat-pet:sparebank1-fremtind:hund:life",
    "page": 1,
    "section": "Død/tap hund – stjålet/forsvunnet hund",
    "quotes": [
      [
        1,
        "Stjålet/forsvunnet hund skal meldes til politiet og etterlyses ved annonsering. Erstatningen utbetales tidligst 3 måneder etter at hendelsen er meldt til oss og politiet."
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-bruk",
    "key": "hund.bruksverdi.dekning",
    "value": "Valgfri separat dekning: varig tap av bruksverdi som følge av ulykke eller sykdom som er dekket av veterinærforsikringen, inntil valgt forsikringssum. Tapet må dokumenteres av veterinær etter utredning, behandling og tilstrekkelig lang hvileperiode. Dokumentert praktisk arbeid eller offisiell konkurransevirksomhet de siste 12 månedene før sykdom eller skade oppsto er påkrevd.",
    "source": "boat-pet:sparebank1-fremtind:hund:use",
    "page": 1,
    "section": "Tap av bruksverdi hund – dekning og dokumentasjon",
    "quotes": [
      [
        1,
        "varig tap av bruksverdi som følge av ulykke eller sykdom som er dekket i forsikringen for veterinærutgifter."
      ],
      [
        1,
        "Tapet av bruksverdi må være dokumentert av veterinær og hunden må være utredet, behandlet og fått tilstrekkelig lang hvileperiode."
      ],
      [
        1,
        "Det må dokumenteres at hunden har vært brukt i praktisk arbeid eller offisiell konkurransevirksomhet de siste 12 månedene før sykdom eller skade oppstod."
      ]
    ]
  },
  {
    "owner": "sparebank1-fremtind-hund-bruk",
    "key": "hund.bruksverdi.begrensning",
    "value": "Jakthund, gjeterhund og tjenestehund må være trent for og regelmessig brukt til formålet, med minst 50 % redusert bruksegenskap. Avlshund må ha mistet avlsevnen 100 %: hannhund må være far til minst ett kull siste to år, og tispe må ha født minst ett kull på normal måte siste to år før sykdom/skade; parringen/kullene må være registrert i Norsk Kennel Klubb. Tap av utstillingsevner og andre bruksområder enn avl, jakt, gjeting og tjeneste er unntatt, samt sykdommer, lidelser og kostnader som ikke dekkes av veterinærforsikringen.",
    "source": "boat-pet:sparebank1-fremtind:hund:use",
    "page": 1,
    "section": "Tap av bruksverdi hund – forutsetninger og unntak",
    "quotes": [
      [
        1,
        "jakthund, gjeterhund og tjenestehund som er trent for og regelmessig brukt til formålet, og hvor bruksegenskapen er minst 50 prosent redusert."
      ],
      [
        1,
        "avlshund som har mistet avlsevnen 100 prosent."
      ],
      [
        1,
        "Hannhund må være far til minst 1 kull siste 2 år, og tispe må ha født minst 1 kull på normal måte siste 2 år, før sykdommen/skaden oppsto."
      ],
      [
        1,
        "Parringen/kullene må være registrert i Norsk Kennel Klubb."
      ]
    ]
  }
];
const sourceContracts = {
  "boat-pet:sparebank1-fremtind:hund": {
    "id": "boat-pet:sparebank1-fremtind:hund",
    "filename": "fremtind-dog-vet-terms.pdf",
    "providerId": "sparebank1-fremtind",
    "company": "Fremtind",
    "insuranceType": "Hund",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PBK-231.200-004",
    "effectiveFrom": "2025-08-07",
    "version": "2025-08-07",
    "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
    "sha256": "5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7",
    "documentName": "PBK-231.200-004"
  },
  "boat-pet:sparebank1-fremtind:hund:use": {
    "id": "boat-pet:sparebank1-fremtind:hund:use",
    "filename": "fremtind-dog-use-terms.pdf",
    "providerId": "sparebank1-fremtind",
    "company": "Fremtind",
    "insuranceType": "Hund",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PBK-231.220-002",
    "effectiveFrom": "2025-08-07",
    "version": "2025-08-07",
    "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
    "sha256": "456a1c4f38b4c3934bf0b4c9ed1167e805d5238fb1960115d9cb1e2e65aafcc2",
    "documentName": "PBK-231.220-002"
  },
  "boat-pet:sparebank1-fremtind:hund:life": {
    "id": "boat-pet:sparebank1-fremtind:hund:life",
    "filename": "fremtind-dog-life-terms.pdf",
    "providerId": "sparebank1-fremtind",
    "company": "Fremtind",
    "insuranceType": "Hund",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PBK-231.210-002",
    "effectiveFrom": "2025-08-07",
    "version": "2025-08-07",
    "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
    "sha256": "8445f2c6faede5cfe1c6054e58cc880fc4cea1bbc31321ddc76fdbd035dcf43d",
    "documentName": "PBK-231.210-002"
  }
};
const untouched = {
  "sparebank1-fremtind-hund-veterin-r": [
    {
      "key": "dyr.veterinar.sum.valgbar",
      "label": "Veterinærbehandling – valgbar forsikringssum",
      "value": "Valgt forsikringssum gjelder per forsikringsår",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund",
        "filename": "fremtind-dog-vet-terms.pdf",
        "termsNumber": "PBK-231.200-004",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "Veterinærbehandling",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.allergi.dekning",
      "label": "Allergi og atopi",
      "value": "Utredning, behandling og medisiner til atopi/allergi",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund",
        "filename": "fremtind-dog-vet-terms.pdf",
        "termsNumber": "PBK-231.200-004",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "7 Veterinærutgifter",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.allergi.grense",
      "label": "Allergi og atopi – grense",
      "value": "Inntil 15 000 kr i løpet av hundens liv, innenfor valgt forsikringssum",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund",
        "filename": "fremtind-dog-vet-terms.pdf",
        "termsNumber": "PBK-231.200-004",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "7 Veterinærutgifter",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.diagnostikk.dekning",
      "label": "Diagnostikk",
      "value": "MR/CT inkludert",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund",
        "filename": "fremtind-dog-vet-terms.pdf",
        "termsNumber": "PBK-231.200-004",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "7 Veterinærutgifter",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.diagnostikk.grense",
      "label": "Diagnostikk – grense",
      "value": "MR/CT samlet inntil 15 000 kr per forsikringsår, innenfor valgt forsikringssum",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund",
        "filename": "fremtind-dog-vet-terms.pdf",
        "termsNumber": "PBK-231.200-004",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "7 Veterinærutgifter",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    }
  ],
  "sparebank1-fremtind-hund-topp": [],
  "sparebank1-fremtind-hund-liv": [
    {
      "key": "dyr.liv.reduksjon.start",
      "label": "Liv, død og tap – aldersreduksjon starter",
      "value": "Fullvilkåret oppgir hovedforfall etter fylte 5 år for berner sennenhund, grand danois, irsk ulvehund, leonberger, newfoundlandshund, pyrenéerhund, napolitansk mastiff og sanktbernhardshund; 7 år for øvrige raser og blandingshund; 9 år for bichon havanais, border terrier, cairn terrier, chihuahua, chinese crested, dvergschnauzer, finsk lapphund, finsk spets, foxterrier, islandsk fårehund, jack russel terrier, lhasa apso, toy-, dverg- og mellompuddel, kleiner og grosser münsterländer, norrbottenspets, norsk buhund, papillon, phalène, schnauzer, shih tzu, softcoated wheaten terrier, tibetansk spaniel, tibetansk terrier, västgötaspets, welsh springer spaniel, west highland white terrier, whippet",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund:life",
        "filename": "fremtind-dog-life-terms.pdf",
        "termsNumber": "PBK-231.210-002",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "Erstatningsregler",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.liv.reduksjon.sats",
      "label": "Liv, død og tap – årlig reduksjon",
      "value": "20 % per år av total erstatning; forsikringssummen settes ikke lavere enn 1 500 kr",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund:life",
        "filename": "fremtind-dog-life-terms.pdf",
        "termsNumber": "PBK-231.210-002",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "Erstatningsregler",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    },
    {
      "key": "dyr.liv.opphor",
      "label": "Liv, død og tap – opphørsalder",
      "value": "Fullvilkåret oppgir opphør ved hovedforfall etter fylte 8 år for berner sennenhund, grand danois, irsk ulvehund, leonberger, newfoundlandshund, pyrenéerhund, napolitansk mastiff og sanktbernhardshund; 10 år for øvrige raser og blandingshund; 12 år for bichon havanais, border terrier, cairn terrier, chihuahua, chinese crested, dvergschnauzer, finsk lapphund, finsk spets, foxterrier, islandsk fårehund, jack russel terrier, lhasa apso, toy-, dverg- og mellompuddel, kleiner og grosser münsterländer, norrbottenspets, norsk buhund, papillon, phalène, schnauzer, shih tzu, softcoated wheaten terrier, tibetansk spaniel, tibetansk terrier, västgötaspets, welsh springer spaniel, west highland white terrier, whippet",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund:life",
        "filename": "fremtind-dog-life-terms.pdf",
        "termsNumber": "PBK-231.210-002",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "Opphør",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    }
  ],
  "sparebank1-fremtind-hund-bruk": [
    {
      "key": "hund.bruksverdi.alder",
      "label": "Bruksverdi – aldersgrense",
      "value": "Opphører ved hovedforfall etter fylte 8 år",
      "source": {
        "documentId": "boat-pet:sparebank1-fremtind:hund:use",
        "filename": "fremtind-dog-use-terms.pdf",
        "termsNumber": "PBK-231.220-002",
        "effectiveFrom": "2025-08-07",
        "version": "2025-08-07",
        "agreementScope": "ordinary",
        "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html",
        "company": "Fremtind",
        "page": 1,
        "section": "Opphør",
        "note": "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg."
      }
    }
  ]
};

const id = 'sparebank1-fremtind-hund-veterin-r';
const topId = 'sparebank1-fremtind-hund-topp';
const lifeId = 'sparebank1-fremtind-hund-liv';
const useId = 'sparebank1-fremtind-hund-bruk';
const date = new Date('2026-10-05T12:00:00Z');
const p = productCatalog.products.find(p => p.productId === id);
assert.ok(p);
const clone = x => JSON.parse(JSON.stringify(x));
function raw(owner, key) { const fs = productCatalog.facts[owner].filter(f => f.key === key); assert.equal(fs.length, 1, owner + '/' + key); return fs[0]; }
function variant(expected) {
  const addon = expected.owner === id ? null : productCatalog.addOns.find(a => a.componentId === expected.owner);
  if (addon) {
    assert.equal(addon.providerId, p.providerId); assert.equal(addon.agreementScope, p.agreementScope);
    assert.deepEqual(addon.insuranceTypes, ['Hund']); assert.deepEqual(addon.requiresLevel, [id]);
  }
  const fs = materializeCatalogProduct(p).facts.filter(f => f.key === expected.key && f.value === expected.value &&
    JSON.stringify(f.addOnNames) === JSON.stringify(addon ? [addon.name] : []));
  assert.equal(fs.length, 1, expected.owner + '/' + expected.key); return fs[0];
}
const term = (key, value) => ({ name: boatPetFactLabel('hund', key), canonicalKey: key, value });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Fremtind', totalAnnualPremium: null,
  insurances: [{ type: 'Hund', productName: 'Veterinær', agreementScope: 'ordinary', annualPremium: null,
    deductible: null, coverageSummary: null, importantTerms: terms, addOns: [] }] }, date).insurances[0];
const coverage = (c, key) => { const x = canonicalCoverage(c, 'Hund', key); assert.ok(x, key); return x; };
const manual = ids => normalizeManualAgreement({ company: 'Fremtind', totalAnnualPremium: '', products: [{
  type: 'Hund', productName: 'Veterinær', agreementScope: 'ordinary', annualPremium: '', deductible: '',
  coverageSummary: '', importantTerms: [], addOnIds: ids }] }).insuranceData.insurances[0];
const pdfPages = new Map();
const whitespace = x => x.replace(/\s+/gu, ' ').trim();
async function pages(file) {
  if (!pdfPages.has(file)) {
    PDFParse.setWorker(getPath());
    const parser = new PDFParse({ data: readFileSync(new URL('../' + file, import.meta.url)) });
    try { pdfPages.set(file, (await parser.getText()).pages.map(p => whitespace(p.text))); }
    finally { await parser.destroy(); }
  }
  return pdfPages.get(file);
}
const website = () => whitespace(readFileSync(new URL('../catalog/sources/boat-pet/fremtind-sb1-dog-product.html', import.meta.url), 'utf8')
  .replace(/<[^>]*>/gu, ' ').replace(/&nbsp;/gu, ' '));
for (const source of sources) test(`R-071-SOURCE: ${source.source_artifact}`, async () => {
  sourceHash(source.source_artifact, source.expected_sha256);
  if (source.source_artifact.endsWith('.pdf')) assert.equal((await pages(source.source_artifact)).length,
    source.source_artifact.endsWith('vet-terms.pdf') ? 3 : 1);
});
test('R-071-IDENTITY: exact ten owned P1/GAP/SF contracts and sixteen fact tuples', () => {
  assert.equal(bindings.length, 10); assert.equal(new Set(bindings.map(b => b.signature)).size, 10);
  assert.equal(new Set(bindings.map(b => b.gap)).size, 10); assert.equal(new Set(bindings.map(b => b.sf)).size, 10);
  assert.equal(rows.length, 16); assert.equal(new Set(rows.map(r => r.owner + '/' + r.key)).size, 16);
  const batch = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json', import.meta.url))).batches.find(b => b.batch_id === 'B-071');
  assert.ok(batch); assert.deepEqual(batch.signature_ids.filter(s => s !== '5f31ff4946a666b5').sort(), bindings.map(b => b.signature).sort());
  assert.deepEqual(batch.P2_piggyback_signatures, []);
  assert.deepEqual(batch.evidence.flatMap(e => e.finding_ids.map((gap, i) => [gap, e.source_fact_ids[i]])).filter(([gap]) => gap !== 'GAP-5590').sort(), bindings.map(b => [b.gap, b.sf]).sort());
  assert.equal(p.providerId, 'sparebank1-fremtind'); assert.equal(p.company, 'Fremtind'); assert.equal(p.insuranceType, 'Hund');
  assert.equal(p.agreementScope, 'ordinary'); assert.equal(p.name, 'Veterinær'); assert.equal(p.version, '2025-08-07');
  assert.deepEqual(availableAddOns(p, date).map(a => a.id).sort(), [topId, lifeId, useId].sort());
  for (const [id, source] of Object.entries(sourceContracts)) assert.deepEqual(productCatalog.sources[id], source);
});
for (const binding of bindings) test(`R-071-${binding.signature}: ${binding.gap}/${binding.sf} complete source-backed dimensions`, async () => {
  for (const key of binding.keys) {
    const expected = rows.find(r => r.owner === binding.owner && r.key === key); assert.ok(expected);
    const f = raw(expected.owner, key); assert.equal(f.value, expected.value); assert.equal(f.label, boatPetFactLabel('hund', key));
    assert.equal(f.deductibleClassification, expected.deductibleClassification); assert.equal(f.replacesBase, expected.replacesBase);
    assert.equal(f.coverageAvailability, undefined);
    for (const [field, r] of [['source', expected], ['qualificationSource', expected.qualificationSource]]) {
      if (!r) { assert.equal(f[field], undefined); continue; }
      const s = sourceContracts[r.source]; assert.ok(s); const ref = f[field]; assert.ok(ref);
      assert.equal(ref.documentId, r.source); assert.equal(ref.page, r.page); assert.equal(ref.section, r.section);
      for (const field of ['filename', 'termsNumber', 'effectiveFrom', 'version', 'agreementScope', 'url', 'company']) assert.equal(ref[field], s[field]);
      assert.equal(s.providerId, 'sparebank1-fremtind'); assert.equal(s.insuranceType, 'Hund'); assert.equal(s.agreementScope, 'ordinary'); assert.equal(s.sourceType, 'full_terms');
    }
    const v = variant(expected); assert.equal(v.state, expected.owner === id ? 'included' : 'optional');
    for (const ref of catalogFactSources(f)) assert.equal(v.sources.filter(s => s.documentId === ref.documentId && s.page === ref.page && s.section === ref.section).length, 1);
    const text = await pages('catalog/sources/boat-pet/' + sourceContracts[expected.source].filename);
    for (const [page, quote] of expected.quotes) assert.ok(text[page - 1].includes(whitespace(quote)), key + ': ' + quote);
  }
});
for (const key of ['dyr.allergi.dekning', 'dyr.allergi.grense', 'dyr.diagnostikk.dekning', 'dyr.diagnostikk.grense']) {
  test(`R-071-BASE-TOPP-${key}: included base coexists with optional Topp`, () => {
    const fs = materializeCatalogProduct(p).facts;
    const base = fs.filter(f => f.key === key && f.value === raw(id, key).value && f.addOnNames.length === 0);
    const top = fs.filter(f => f.key === key && f.value === raw(topId, key).value && f.addOnNames.includes('Topp veterinærutgifter'));
    assert.equal(base.length, 1); assert.equal(top.length, 1); assert.equal(base[0].state, 'included'); assert.equal(top[0].state, 'optional');
    assert.equal(base[0].sources[0].page, 1); assert.equal(top[0].sources[0].page, 3); assert.equal(raw(topId, key).replacesBase, true);
    assert.deepEqual(resolveCatalogFacts(p, [], date).find(f => f.key === key), raw(id, key));
    assert.deepEqual(resolveCatalogFacts(p, [topId], date).find(f => f.key === key), raw(topId, key));
  });
}
test('R-071-DEDUCTIBLE: one chosen fixed amount per135days THEN20percent remainder', () => {
  assert.match(raw(id, 'dyr.veterinar.egenandel.fast').value, /1 300, 2 000 eller 3 500 kr.*kun én.*135 dager.*fra og med første veterinærutgift/u);
  assert.equal(raw(id, 'dyr.veterinar.egenandel.fast').deductibleClassification, 'reference');
  assert.match(raw(id, 'dyr.veterinar.egenandel.prosent').value, /20 %.*resterende.*etter.*faste egenandelen/u);
  assert.match(raw(id, 'dyr.veterinar.egenandel.periode').value, /135 dager.*fra og med første veterinærutgift.*kun én/u);
  assert.equal(enrich([]).deductible, null);
});
for (const topp of ['silent', 'selected', 'refused']) for (const life of ['silent', 'selected', 'refused']) for (const use of ['silent', 'selected', 'refused']) {
  test(`R-071-CUSTOMER-${topp}-${life}-${use}: independent options and explicit refusal`, () => {
    const options = [['dyr.rehabilitering.dekning', topp, topId], ['dyr.liv.dekning', life, lifeId], ['hund.bruksverdi.dekning', use, useId]];
    const terms = options.filter(([, choice]) => choice !== 'silent').map(([key, choice]) => term(key, choice === 'selected' ? 'Valgt' : 'Ikke valgt'));
    const c = enrich(terms);
    for (const [key, choice] of options) assert.equal(coverage(c, key).status, choice === 'silent' ? 'unknown' : choice === 'selected' ? 'selected' : 'not_selected');
    assert.deepEqual(c.addOnIds.sort(), options.filter(([, choice]) => choice === 'selected').map(([, , id]) => id).sort());
    assert.equal(c.deductible, null);
  });
}
for (const key of ['dyr.rehabilitering.dekning', 'dyr.liv.dekning', 'hund.bruksverdi.dekning']) {
  test(`R-071-CONFLICT-${key}: contradictory document choices remain unknown`, () => {
    const c = enrich([term(key, 'Valgt'), term(key, 'Ikke valgt')]); assert.equal(coverage(c, key).status, 'unknown');
    assert.equal(coverage(c, key).conflict, true); assert.deepEqual(c.addOnIds, []);
  });
  test(`R-071-UNKNOWN-${key}: unknown is not explicit refusal`, () => {
    const c = enrich([term(key, 'Ikke dokumentert')]); assert.equal(coverage(c, key).status, 'unknown'); assert.deepEqual(c.addOnIds, []);
  });
}
for (const key of ['hund.bruksverdi.begrensning', 'dyr.liv.reduksjon.start', 'dyr.liv.reduksjon.sats', 'dyr.liv.opphor', 'hund.bruksverdi.alder']) {
  test(`R-071-SUPPORT-${key}: qualification/age alone does not select a parent`, () => {
    const owner = key.startsWith('hund.') ? useId : lifeId; const c = enrich([term(key, raw(owner, key).value)]);
    assert.deepEqual(c.addOnIds, []); assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
    assert.equal(coverage(c, 'hund.bruksverdi.dekning').status, 'unknown'); assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'unknown');
  });
}
for (const [key, value] of [['dyr.veterinar.sum.valgbar', '40 000 kr per forsikringsår'], ['dyr.veterinar.egenandel.fast', '2 000 kr per135dager'], ['dyr.allergi.grense', '18 000 kr i hundens liv'], ['dyr.diagnostikk.grense', '24 000 kr per forsikringsår']]) {
  test(`R-071-DOCUMENT-${key}: explicit document value wins`, () => {
    const c = enrich([term(key, value)]); const t = c.importantTerms.find(t => t.key === key); assert.ok(t);
    assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown'); assert.equal(coverage(c, 'hund.bruksverdi.dekning').status, 'unknown');
  });
}
for (const ids of [[], [topId], [lifeId], [useId], [topId, lifeId], [topId, useId], [lifeId, useId], [topId, lifeId, useId]]) {
  test(`R-071-MANUAL-${ids.join('+') || 'none'}: selected facts and exact multi-source propagation`, () => {
    const c = clone(manual(ids)); assert.deepEqual(c.addOnIds.sort(), [...ids].sort());
    for (const [key, option] of [['dyr.rehabilitering.dekning', topId], ['dyr.liv.dekning', lifeId], ['hund.bruksverdi.dekning', useId]]) assert.equal(coverage(c, key).status, ids.includes(option) ? 'selected' : 'unknown');
    const effective = resolveCatalogFacts(p, ids, date);
    for (const r of rows.filter(r => r.owner === id || ids.includes(r.owner))) {
      const f = effective.find(f => f.key === r.key); assert.ok(f); const t = c.importantTerms.find(t => t.key === r.key); assert.ok(t, r.key);
      assert.equal(t.value, r.value);
      for (const ref of catalogFactSources(f)) assert.ok(t.sources.some(s => s.documentId === ref.documentId && s.page === ref.page && s.section === ref.section), r.owner + '/' + r.key);
    }
  });
}
for (const peer of productCatalog.products.filter(p => p.insuranceType === 'Hund')) {
  test(`R-071-COMPARISON-${peer.productId}: same product and symmetric directions`, () => {
    const a = compareCatalogProducts(p, peer).sections.flatMap(s => s.rows), b = compareCatalogProducts(peer, p).sections.flatMap(s => s.rows);
    assert.equal(a.length, b.length);
    for (const r of a) { const reversed = b.find(s => s.key === r.key); assert.ok(reversed); assert.deepEqual(r.first, reversed.second); assert.deepEqual(r.second, reversed.first); if (peer.productId === id) assert.equal(r.different, false); }
    const baseKeys = new Set(productCatalog.facts[id].map(f => f.key));
    for (const r of rows) {
      const row = a.find(f => f.key === r.key); assert.ok(row);
      assert.equal(row.first.state, baseKeys.has(r.key) ? 'included' : 'optional');
      assert.equal(variant(r).state, r.owner === id ? 'included' : 'optional');
    }
  });
}
test('R-071-UNTOUCHED: baseline caps, life ages and other owner facts remain exact', () => {
  for (const [owner, facts] of Object.entries(untouched)) for (const f of facts) assert.deepEqual(raw(owner, f.key), f);
  const own = new Set([id, topId, lifeId, useId]);
  for (const [owner, fs] of Object.entries(productCatalog.facts)) if (!own.has(owner)) for (const f of fs)
    assert.equal(catalogFactSources(f).some(s => Object.hasOwn(sourceContracts, s.documentId)), false, owner + '/' + f.key);
  assert.equal(productCatalog.facts[id].some(f => f.key === 'dyr.rehabilitering.dekning'), false);
  assert.equal(raw(topId, 'dyr.rehabilitering.dekning').replacesBase, undefined);
});
test('PC-2191 / SF-7923: chosen certificate annual sum remains customer-specific', async () => {
  assert.ok((await pages('catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf'))[0].includes('Forsikringssum og egenandel som er valgt finner du i forsikringsbeviset.'));
  assert.ok(website().includes('30-, 40-, 50- eller 75.000 kr'));
  assert.equal(raw(id, 'dyr.veterinar.sum.valgbar').value, 'Valgt forsikringssum gjelder per forsikringsår');
  const c = enrich([]); assert.equal(c.deductible, null); assert.equal(c.annualPremium, null);
});
test('PC-2192 / SF-7948: independent Bruksverdi ends at renewal after eight', async () => {
  const text = (await pages('catalog/sources/boat-pet/fremtind-dog-use-terms.pdf'))[0];
  assert.ok(text.includes('Dekning for tap av avls-/bruksegenskaper opphører ved hovedforfall etter at hunden har fylt 8 år.'));
  assert.ok(text.includes('Forsikringen opphører hvis hunden dør, bytter eier eller ved oppsigelse.'));
  assert.equal(raw(useId, 'hund.bruksverdi.alder').value, 'Opphører ved hovedforfall etter fylte 8 år');
});
test('PC-2193 / SF-7951: documented puppy option is not expanded without own full terms', () => {
  const text = website(); assert.ok(text.includes('Høyeste erstatningssum er 6.000 kroner per valp, i tillegg til tispas forsikringssum.'));
  assert.ok(text.includes('Forsikringen dekker inntil to valpekull i løpet av tispas liv.')); assert.ok(text.includes('maks 3 måneder'));
  assert.ok(text.includes('Valpen(e) ikke er født')); assert.ok(text.includes('Norsk Kennel Klubbs etiske regler for hundeavl'));
  assert.equal(availableAddOns(p, date).some(a => /valp/iu.test(a.name)), false);
});
test('PC-2194 / SF-7952: Topp is an optional extension; Life remains independently selectable', async () => {
  assert.ok((await pages('catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf'))[2].includes('og er en utvidelse av veterinærutgifter.'));
  assert.ok(website().includes('Livsforsikringen kan også kjøpes separat')); assert.deepEqual(enrich([]).addOnIds, []);
  assert.deepEqual(enrich([term('dyr.liv.dekning', 'Valgt')]).addOnIds, [lifeId]);
});
test('PC-2195 / SF-7954: LO discount and Innbo/Reise FAQ are not ordinary veterinary coverage', () => {
  const text = website(); assert.ok(text.includes('Du får 5 % rabatt på hundeforsikringen.'));
  assert.ok(text.includes('Dekker innboforsikringen ansvar?'));
  assert.equal(p.agreementScope, 'ordinary');
  for (const owner of [id, topId, lifeId, useId]) for (const f of productCatalog.facts[owner]) assert.doesNotMatch(f.key + ' ' + f.value, /LOfavør|prisrabatt|privatansvar/u);
});

// Explicitly reviewed B-071 decision: this exact age key is a condition,
// not proof of purchase. Other positive detail contracts remain unchanged.
const useAgeKey = 'hund.bruksverdi.alder';
const useParentKey = 'hund.bruksverdi.dekning';
const customerSource = product => ({
  documentId: `synthetic-b071-customer:${product.productId}`, filename: 'kundebevis.pdf',
  termsNumber: 'Syntetisk kundebevis', company: product.company,
  agreementScope: product.agreementScope, version: product.version,
  page: 3, section: 'Kundens avtalte dekninger og vilkår',
});
const customerTerm = (product, key, value) => ({
  name: boatPetFactLabel(product.insuranceType.toLowerCase(), key), canonicalKey: key,
  value, source: customerSource(product),
});
const customerEnrich = (product, importantTerms) => enrichExtractedAgreementWithCatalog({
  company: product.company, totalAnnualPremium: null, insurances: [{
    company: product.company, type: product.insuranceType, productName: product.name,
    agreementScope: product.agreementScope, annualPremium: null, deductible: null,
    coverageSummary: null, importantTerms, addOns: [],
  }],
}, date).insurances[0];

for (const [name, choices, status, conflict] of [
  ['age only', [], 'unknown', false],
  ['explicit choice', ['Valgt'], 'selected', false],
  ['explicit refusal', ['Ikke valgt'], 'not_selected', false],
  ['explicit conflict', ['Valgt', 'Ikke valgt'], 'unknown', true],
  ['undocumented choice', ['Ikke dokumentert'], 'unknown', false],
]) {
  test(`R-071-AGE-${name}: preserve age/provenance without overriding explicit choice`, () => {
    const age = customerTerm(p, useAgeKey, raw(useId, useAgeKey).value);
    const c = customerEnrich(p, [...choices.map(value => customerTerm(p, useParentKey, value)), age]);
    const state = coverage(c, useParentKey);
    assert.equal(state.status, status); assert.equal(state.conflict, conflict);
    assert.deepEqual(c.addOnIds, status === 'selected' ? [useId] : []);
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
    const detail = state.details.find(d => d.key === useAgeKey); assert.ok(detail);
    assert.equal(detail.value, age.value); assert.deepEqual(detail.sources, [age.source]);
    const document = c.importantTerms.find(t => t.key === useAgeKey); assert.ok(document);
    assert.equal(document.coverageOrigin, 'document'); assert.deepEqual(document.source, age.source);
    assert.ok(state.evidence.some(e => e.kind === 'restriction' && e.status === 'unknown' && e.origin === 'document'));
    if (status !== 'selected') assert.equal(groupAddOnNames([c], 'Hund'), null);
  });
}
test('R-071-AGE-SILENT: missing facts remain unknown and do not select an addon', () => {
  const c = customerEnrich(p, []);
  assert.equal(coverage(c, useParentKey).status, 'unknown'); assert.deepEqual(c.addOnIds, []);
});
test('R-071-AGE-PRIORITY: customer age beats catalog age through repeated enrichment', () => {
  const value = 'Opphører ved hovedforfall etter fylte 7 år';
  let c = customerEnrich(p, [customerTerm(p, useParentKey, 'Valgt'), customerTerm(p, useAgeKey, value)]);
  for (let pass = 0; pass < 2; pass++) {
    assert.equal(coverage(c, useParentKey).status, 'selected');
    const terms = c.importantTerms.filter(t => t.key === useAgeKey); assert.equal(terms.length, 1);
    assert.equal(terms[0].value, value); assert.equal(terms[0].coverageOrigin, 'document');
    const detail = coverage(c, useParentKey).details.find(d => d.key === useAgeKey); assert.ok(detail);
    assert.equal(detail.value, value); assert.deepEqual(detail.sources, [customerSource(p)]);
    c = enrichExtractedAgreementWithCatalog({ company: p.company, totalAnnualPremium: null, insurances: [c] }, date).insurances[0];
  }
  assert.equal(raw(useId, useAgeKey).value, 'Opphører ved hovedforfall etter fylte 8 år');
  const addon = productCatalog.addOns.find(a => a.id === useId); assert.ok(addon);
  assert.equal(addon.requiresAddOnIds, undefined);
});
test('R-071-AGE-FRENDE: age cannot select Tap; child refusal retains the rest of Tap', () => {
  const product = productCatalog.products.find(p => p.productId === 'frende-hund-veterin-r'); assert.ok(product);
  const tap = productCatalog.addOns.find(a => a.id === 'frende-hund-tap'); assert.ok(tap);
  assert.deepEqual(tap.selectionEvidenceKeys, ['dyr.liv.dekning']);
  const ageValue = productCatalog.facts[tap.componentId].find(f => f.key === useAgeKey).value;
  const ageOnly = customerEnrich(product, [customerTerm(product, useAgeKey, ageValue)]);
  assert.deepEqual(ageOnly.addOnIds, []); assert.equal(coverage(ageOnly, useParentKey).status, 'unknown');
  assert.equal(coverage(ageOnly, 'dyr.liv.dekning').status, 'unknown');
  const refused = customerEnrich(product, [customerTerm(product, 'dyr.liv.dekning', 'Valgt'),
    customerTerm(product, useParentKey, 'Ikke valgt'), customerTerm(product, useAgeKey, ageValue)]);
  assert.deepEqual(refused.addOnIds, [tap.id]); assert.equal(coverage(refused, useParentKey).status, 'not_selected');
  assert.equal(coverage(refused, 'dyr.liv.dekning').status, 'selected');
  for (const key of ['dyr.liv.opphor', 'dyr.liv.forsvinning'])
    assert.ok(refused.importantTerms.some(t => t.key === key && t.coverageOrigin === 'catalog'));
});
test('R-071-AGE-GJENSIDIGE: Bruk still requires separate explicit Liv for both species', () => {
  for (const type of ['hund', 'katt']) {
    const product = productCatalog.products.find(p => p.productId === `gjensidige-${type}-behandling`); assert.ok(product);
    const useKey = `${type}.bruksverdi.dekning`, useId = `gjensidige-${type}-bruk`, lifeId = `gjensidige-${type}-liv`;
    const addon = productCatalog.addOns.find(a => a.id === useId); assert.ok(addon);
    assert.deepEqual(addon.selectionEvidenceKeys, [useKey]); assert.deepEqual(addon.requiresAddOnIds, [lifeId]);
    const childOnly = customerEnrich(product, [customerTerm(product, useKey, 'Valgt')]);
    assert.deepEqual(childOnly.addOnIds, []);
    const both = customerEnrich(product, [customerTerm(product, useKey, 'Valgt'), customerTerm(product, 'dyr.liv.dekning', 'Valgt')]);
    assert.deepEqual([...both.addOnIds].sort(), [useId, lifeId].sort());
  }
});
test('R-071-AGE-STOREBRAND: Bruksverdi remains included in the selected Dødsfall product', () => {
  const product = productCatalog.products.find(p => p.providerId === 'storebrand' && p.insuranceType === 'Hund' && p.name === 'Dødsfall'); assert.ok(product);
  assert.ok(resolveCatalogFacts(product, [], date).some(f => f.key === useParentKey));
  const c = normalizeManualAgreement({ company: product.company, totalAnnualPremium: '', products: [{
    type: 'Hund', productName: product.name, agreementScope: product.agreementScope,
    annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [], addOnIds: [],
  }] }).insuranceData.insurances[0];
  assert.equal(coverage(c, useParentKey).status, 'selected'); assert.deepEqual(c.addOnIds, []);
});
test('R-071-AGE-ISOLATION: the exact guard preserves legitimate positive details and customer Liv sum', () => {
  assert.equal(isNonAssertingCoverageDetail(useAgeKey), true);
  for (const key of ['katt.bruksverdi.alder', 'bat.maskinskade.alder', 'hund.bruksverdi.grense',
    'maskinskade.alder', 'maskinskade.km', 'leiebil.dager', 'dyr.liv.sum.valgbar'])
    assert.equal(isNonAssertingCoverageDetail(key), false, key);
  for (const [type, key, value, parent] of [
    ['Bil', 'maskinskade.alder', '10 år', 'maskinskade.dekning'],
    ['Bil', 'maskinskade.km', '200 000 km', 'maskinskade.dekning'],
    ['Bil', 'leiebil.dager', 'Leiebil inntil 60 dager', 'leiebil.dekning'],
  ]) assert.equal(canonicalCoverage({ importantTerms: [{ key, name: key, value, coverageOrigin: 'document' }] }, type, parent).status, 'selected', key);
  const product = productCatalog.products.find(p => p.productId === 'if-hund-basis'); assert.ok(product);
  const c = customerEnrich(product, [customerTerm(product, 'dyr.liv.sum.valgbar', 'Kundens avtalte Liv-sum 25 000 kr')]);
  assert.equal(coverage(c, 'dyr.liv.dekning').status, 'selected'); assert.ok(c.addOnIds.includes('if-hund-liv'));
});
