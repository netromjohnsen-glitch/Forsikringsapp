import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Row = readonly [
  key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "coverageAvailability" | "qualificationSource">,
];

const included = { coverageAvailability: "included" } as const;
const areaLabel = "Veterinærforsikring – område";
const petDocuments = [
  {
    species: "hund", type: "Hund", ifHash: "d2372736a4d99d4c434ac87ea068c5051908742ae03e454220b6b1cc1d436c75",
    fremtindHash: "5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7",
    trygTreatmentDate: "2026-01-01", trygTreatmentHash: "63af7ce2b7ce309879d3e97cdfca3014ba249f1dc7347eef44bd7c768fd162d3",
  },
  {
    species: "katt", type: "Katt", ifHash: "bcd631394fbfe7d0a6f0de3d7e79dc82aee2f5d5bb16d4a0b7192e177716abe7",
    fremtindHash: "91385b8b466923a5ca1c37d8f53781c5af3f63e3f6e037afae367f4399b75286",
    trygTreatmentDate: "2026-07-01", trygTreatmentHash: "fa7297b2b37cab3f8e8d51151643bcd4293fc7fbb0a33f77de86108af16bf9dc",
  },
] as const;

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
    company: source.company, url: source.url, version: source.version, agreementScope: source.agreementScope, page, section,
  };
}

export function addVerifiedPetMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>,
  products: CatalogProduct[], addOns: CatalogAddOn[],
) {
  function productIsExact(productId: string, sourceId: string, version: string | null) {
    return products.some(product => product.productId === productId && product.sourceId === sourceId &&
      product.agreementScope === "ordinary" && product.version === version && product.componentIds?.includes(productId));
  }

  function document(id: string, date: string, sha256: string) {
    const source = sources[id];
    if (source?.sha256 === sha256 && source.effectiveFrom === date && source.agreementScope === "ordinary") return source;
  }

  function upsert(component: string, source: CatalogSource, rows: Row[]) {
    const keys = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...(facts[component] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, page, section, options]) => ({ key, label, value, source: cite(source, page, section), ...options })),
    ];
  }

  for (const { species, type, ifHash, fremtindHash, trygTreatmentDate, trygTreatmentHash } of petDocuments) {
    const dog = species === "hund";
    const ifId = "boat-pet:if:" + species;
    const ifTerms = document(ifId, "2022-12-01", ifHash);
    const ifLevels = ["basis", "standard", "super"].filter(level => productIsExact("if-" + species + "-" + level, ifId, "2022-12-01"));
    if (ifTerms) {
      for (const level of ifLevels) {
        const medicines = "Medisiner, bandasjemateriell, body, halskrage og potesokk som brukes som del av behandlingen hos veterinæren, innenfor valgt veterinærsum. " +
          (level === "basis"
            ? "Separat kjøp etter konsultasjonen eller operasjonen krever Standard eller Super."
            : "Omfatter også separat kjøp som er en del av behandlingen etter konsultasjonen eller operasjonen.");
        upsert("if-" + species + "-" + level, ifTerms, [
          ["dyr.veterinar.geografi", areaLabel, "Europa.", 3, "3 Hvor forsikringen gjelder", included],
          ["dyr.medisin.dekning", "Medisiner", medicines, 4, "5.1.1 Medisiner, bandasjemateriell og lignende", included],
        ]);
      }
      if (ifLevels.length === 3) {
        const life = "if-" + species + "-liv";
        const litter = dog ? "if-hund-valpekull" : "if-katt-kattunge";
        const addOnMatches = (id: string) => addOns.some(addOn => addOn.id === id && addOn.componentId === id &&
          addOn.providerId === "if" && addOn.agreementScope === "ordinary" && addOn.insuranceTypes?.includes(type) &&
          ifLevels.every(level => addOn.requiresLevel?.includes("if-" + species + "-" + level)));
        if (addOnMatches(life)) upsert(life, ifTerms, [
          ["dyr.liv.geografi", "Dødsfall og tap av dyret – område", "Hele verden.", 3, "3 Hvor forsikringen gjelder"],
        ]);
        if (addOnMatches(litter)) upsert(litter, ifTerms, [
          ["dyr.fodsel.kull.geografi", "Forsikring av kull – område", "Europa.", 3, "3 Hvor forsikringen gjelder"],
        ]);
      }
    }

    const trygId = "boat-pet:tryg:" + species;
    const trygProduct = "tryg-" + species + "-behandling";
    if (productIsExact(trygProduct, trygId, "2026-09-01") &&
      document(trygId, "2026-09-01", "41843abc16ad8ee39782e70f29d8cbb115463bcebe28882cca42078ce07fd824")) {
      const general = document(trygId + ":product", "2026-05-10", "a7936fd27cd305b1a6eeb8153d8289dffff5c075e0e50ffbd9590f8bb2d83318");
      if (general) upsert(trygProduct, general, [
        ["dyr.veterinar.geografi", areaLabel, "Europa.", 1, "3 Hvor forsikringen gjelder", included],
        ["dyr.inntaksalder.min", "Nytegningsalder – minste alder", "Hunden eller katten kan forsikres fra den er 35 dager gammel.",
          1, "4 Når forsikringen gjelder"],
      ]);
      const treatment = document(trygId + ":treatment", trygTreatmentDate, trygTreatmentHash);
      if (treatment) upsert(trygProduct, treatment, [
        ["dyr.medisin.dekning", "Medisiner", "Medisin og legemidler som er rekvirert og ordinert av veterinær for en dekket sykdom eller ulykkesskade.",
          1, "3 Hvilke utgifter som erstattes", included],
        ["dyr.veterinar.spesialfor.grense", "Spesialfôr og spesialsjampo – erstatning",
          "50 % av kostnadene til spesialfôr og spesialsjampo som er rekvirert og ordinert av veterinær.",
          1, "3 Hvilke utgifter som erstattes", included],
        ["dyr.veterinar.avliving", "Avliving – veterinærdekning", "Avliving som er anbefalt av veterinær. Kremering er unntatt fra Behandling.",
          1, "3 Hvilke utgifter som erstattes – Dekning og unntak", included],
      ]);
    }

    const fremtindId = "boat-pet:sparebank1-fremtind:" + species;
    const fremtindProduct = "sparebank1-fremtind-" + species + "-veterin-r";
    const fremtind = document(fremtindId, "2025-08-07", fremtindHash);
    if (fremtind && productIsExact(fremtindProduct, fremtindId, "2025-08-07")) {
      upsert(fremtindProduct, fremtind, [
        ["dyr.veterinar.geografi", areaLabel, "Hele verden.", 1, "3 Hvor gjelder forsikringen?", included],
        ["dyr.karenstid.sykdom", "Karenstid – sykdom",
          "20 dager fra kjøpstidspunktet. I perioden dekkes bare ulykkesskade. Karenstiden gjelder også ved økt forsikringssum eller utvidet dekning, med unntak ved flytting av tilsvarende dekning.",
          1, "5 Når gjelder forsikringen?"],
        ["dyr.karenstid.allergi", "Karenstid – allergi, hud og ører",
          "60 dager fra kjøpstidspunktet for allergi, hud- og øreproblemer. Gjelder også ved økt forsikringssum eller utvidet dekning, med unntak ved flytting av tilsvarende dekning.",
          1, "5 Når gjelder forsikringen?"],
        ...(dog ? [
          ["dyr.fodsel.dekning", "Drektighet og fødsel",
            "Ett keisersnitt eller én fødselshjelp i hundens levetid. Hunden må ha fylt 20 måneder, hatt sammenhengende veterinærdekning i minst ett år og vært paret etter NKKs etiske avlsregler. Engelsk bulldog, fransk bulldog, cavalier king charles spaniel, mops, boston terrier, chihuahua, pomeranian og blandinger med disse rasene er unntatt.",
            2, "7 Veterinærutgifter – Forutsetninger og rasespesifikke unntak", included],
        ] as const : [
          ["dyr.fodsel.dekning", "Drektighet og fødsel",
            "Ett keisersnitt eller én fødselshjelp i kattens levetid. Katten må ha hatt sammenhengende veterinærdekning i minst ett år ved behandling og kan ikke ha hatt to eller flere tidligere keisersnitt.",
            2, "7 Veterinærutgifter – Forutsetninger", included],
        ] as const),
      ]);
    }

    const gjensidigeId = "boat-pet:gjensidige:" + species;
    const gjensidigeProduct = "gjensidige-" + species + "-behandling";
    if (productIsExact(gjensidigeProduct, gjensidigeId, null)) {
      if (dog) {
        const terms = document(gjensidigeId + ":treatment", "", "8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6");
        if (terms) upsert(gjensidigeProduct, terms, [
          ["dyr.veterinar.geografi", areaLabel, "Hele verden.", 2, "Forsikringsbevis – Hva er forsikret?", included],
          ["dyr.tannskade.dekning", "Tannskade ved ulykke",
            "Behandling av tannfraktur eller tannbrudd forårsaket av en ulykke.",
            2, "Forsikringsbevis – For veterinærutgifter gjelder i tillegg", included],
          ["dyr.tannsykdom.dekning", "Tannsykdom",
            "Behandling av karies og emaljedefekter. Trekking av tilbakeholdte melketenner eller tenner med bittfeil eller feilstilling som gir medisinske problemer omfattes ved sammenhengende veterinærdekning fra før fire måneders alder. For bittfeil og feilstilte tenner kreves også attest uten anmerkning på tannstilling eller bitt, utstedt mellom sju uker og fire måneder.",
            2, "Forsikringsbevis – Hvilke skader/hendelser og For veterinærutgifter gjelder i tillegg", included],
          ["dyr.fodsel.dekning", "Drektighet og fødsel",
            "Ett keisersnitt i hundens levetid. Hunden må ha fylt 20 måneder og hatt sammenhengende dekning for veterinærutgifter i minst ett år på behandlingstidspunktet.",
            2, "Forsikringsbevis – For veterinærutgifter gjelder i tillegg", included],
          ["dyr.allergi.dekning", "Allergi og atopi", "Behandling av allergi og atopi innenfor grensen i forsikringsbeviset.",
            2, "Forsikringsbevis – For veterinærutgifter gjelder i tillegg", included],
          ["dyr.rehabilitering.dekning", "Rehabilitering",
            "Rehabilitering og fysikalsk behandling innenfor grensen i forsikringsbeviset. Behandlingen må gjøres innen tre måneder etter at veterinæren foreskrev den, på en veterinærklinikk eller et behandlingssted veterinæren henviser til.",
            3, "Forsikringsbevis – For veterinærutgifter gjelder i tillegg",
            { ...included, qualificationSource: cite(terms, 8, "Erstatningsregler – Rehabilitering") }],
          ["dyr.veterinar.online", "Videokonsultasjon med veterinær",
            "Videokonsultasjon med online veterinær omfattes. Gjensidige trekker ingen egenandel hos veterinær de har avtale med.",
            3, "Forsikringsbevis – Online veterinær", included],
        ]);
      } else {
        const ipid = document(gjensidigeId, "", "314d266136da6b7b5aec994b70d45591e687bd5baac203fe0609437e7fdc4ee8");
        if (ipid) upsert(gjensidigeProduct, ipid, [
          ["dyr.veterinar.geografi", areaLabel, "Hele verden.", 2, "Hvor gjelder forsikringen?", included],
        ]);
        const terms = document(gjensidigeId + ":treatment", "", "6e16b50107c236ed60203df36371b3140b950eff03773e885b9f62ddb9069921");
        if (terms) upsert(gjensidigeProduct, terms, [
          ["dyr.allergi.dekning", "Allergi og atopi",
            "Behandling av allergi og atopi innenfor grensen i forsikringsbeviset. Katten kan ikke ha vist symptomer på øre- eller hudlidelser før tegning eller i karenstiden.",
            2, "Forsikringsbevis – Hvilke skader/hendelser og For veterinærutgifter gjelder i tillegg", included],
        ]);
      }
    }

    const storebrandId = "boat-pet:storebrand:" + species;
    const storebrand = document(storebrandId, "2025-02-01", "b236f856380b8010c7439765ea72a88d076e5d387d4653a7f033980892732591");
    if (storebrand) for (const tier of ["veterin-r", "veterin-r-og-d-dsfall"]) {
      const productId = "storebrand-" + species + "-" + tier;
      if (productIsExact(productId, storebrandId, "2025-02-01")) upsert(productId, storebrand, [
        ["dyr.veterinar.geografi", areaLabel,
          "Sykdom og ulykke må oppstå i Europa. Behandling dekkes i Norge. Ved akutte skader og hendelser dekkes også behandling i landet der skaden oppsto, innenfor Europa.",
          3, "B.1.2 Hvor forsikringen gjelder",
          { ...included, qualificationSource: cite(storebrand, 4, "B.4.1 Hva forsikringen dekker") }],
      ]);
    }
  }
}
