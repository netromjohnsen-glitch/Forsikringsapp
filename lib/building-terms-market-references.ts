import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

type PageReference = readonly [page: number, section?: string];
type FactPages = Readonly<Record<string, PageReference>>;

const storebrandStandardPages: FactPages = {
  "bygninger.dekning": [6],
  "bygninger.tilbehor": [6],
  "teknisk.solceller": [6],
  "ror.utvendig": [6],
  "hage.objekter": [6],
  "bygninger.utsmykning": [5],
  "andrebygninger.endring": [7],
  "elektrisk.dekning": [8],
  "vaer.dekning": [9],
  "ror.brudd": [9],
  "vann.utstromming": [10],
  "vann.terreng": [10],
  "takvegg.folgeskade": [34],
  "vatrom.folgeskade": [11],
  "vatrom.selverommet": [11],
  "tyveri.dekning": [11],
  "plutselig.dekning": [12],
  "handverker.folgeskade": [12],
  "rate.dekning": [12],
  "skadedyr.bekjempelse": [16],
  "skadedyr.bygningsskade": [16],
  "tilpasning.grense": [17],
  "rydding.dekning": [18],
  "brukstap.dekning": [18],
  "pabud.grense": [25],
  "gjenoppforing.hovedregel": [21, "B.6.2.1.1"],
  "gjenoppforing.markedsverdi": [22],
  "naturskade.dekning": [13],
  "egenandel.generell": [30],
  "naturskade.egenandel": [30],
  "vann.egenandel.alder_frost_vannforhold": [30],
  "skadedyr.egenandel": [30],
  "byggunderoppforing": [15],
  "ansvar.dekning": [38],
  "ansvar.grense": [40],
  "ansvar.egenandel": [40],
  "rettshjelp.dekning": [42],
  "rettshjelp.grense": [41],
  "rettshjelp.egenandel": [45],
  "service.psykolog": [13],
};

const storebrandSuperPages: FactPages = {
  "takvegg.folgeskade": [34],
  "skadedyr.bygningsskade": [34],
  "rate.dekning": [35],
  "vatrom.folgeskade": [36],
  "handverker.folgeskade": [36],
  "vatrom.selverommet": [36],
  "vann.vannstopper": [37],
};

const fremtindStandardPages: FactPages = {
  "andrebygninger.endring": [5, "5.2.2"],
  "ror.utvendig": [3],
  "hage.objekter": [3],
  "hage.basseng": [3],
  "hage.brygge": [3],
  "pabud.dekning": [3],
  "brukstap.dekning": [6],
  "vann.utstromming": [4],
  "vann.terreng": [4],
  "vatrom.folgeskade": [4],
  "vatrom.selverommet": [4],
  "takvegg.folgeskade": [4],
  "ror.brudd": [4],
  "ror.tining": [4],
  "rate.dekning": [4],
  "naturskade.egenandel": [8],
};
const storebrandEditionHash = "d69c9ec3fc2edfd71c625dfcf9d19dc801dadfb3f627bc0105a78891a3eacd61";
const fremtindEditionHash = "6c77bd57259d8d01390bccaf415f14f6b245e45345b597b6f651574ebaeebec3";

const storebrandHouseId = "storebrandHusTerms";
const storebrandCabinId = "cabin:storebrand:building";
const fremtindStandardId = "fremtindHusStandard";
const fremtindToppId = "fremtindHusTopp";
const additionsKey = "hus.andrebygninger.endring";

const accessibleHome = "Inntil 500 000 kroner samlet, også med både hus- og innboforsikring i Storebrand. Gjelder ved rullestolbehov etter ulykke i forsikringstiden eller når sikrede får et barn i forsikringstiden som trenger rullestol. Det kreves minst 50 % medisinsk invaliditet og dokumenterte utgifter innen fem år etter ulykken eller fødselen. Ved medfødt skade eller sykdom må varig medisinsk invaliditet fastslås innen to år etter fødselen. Gjelder egen bolig, ikke hytte.";
const fremtindStandardAdditions = "Tilbygg og andre verdiøkende endringer skal meldes for å unngå underforsikring. Ved uanmeldte endringer erstattes den andelen av skaden som svarer til forholdet mellom bygningens verdi før og etter endringen.";
const fremtindToppAdditions = "Bygningsmessige forandringer og påkostninger i avtaleperioden omfattes. Verdiøkningen må meldes til Fremtind senest innen utløpet av avtaleperioden.";

const fremtindContinuations: FactPages = {
  "pabud.dekning": [6, "5.5.1 Merutgifter ved offentlig påbud"],
  "leietap.skade": [7, "5.5.2 Tapt husleieinntekt (fortsettelse)"],
};

function withPage(source: CatalogFact["source"], [page, section = source.section]: PageReference): CatalogFact["source"] {
  return { ...source, page, section };
}

function correctReferences(fact: CatalogFact, pages: FactPages, continuations?: FactPages): CatalogFact {
  const key = fact.key.slice("hus.".length);
  const page = pages[key];
  const continuation = continuations?.[key];
  if (!page && !continuation) return fact;
  return {
    ...fact,
    ...(page && { source: withPage(fact.source, page) }),
    ...(continuation && { qualificationSource: withPage(fact.source, continuation) }),
  };
}

function correctStorebrandAgeReference(fact: CatalogFact): CatalogFact {
  return fact.key.includes(".aldersfradrag.") && fact.source.page === 29 && fact.source.section === "B.6.5"
    ? { ...fact, source: withPage(fact.source, [29, "B.6.4.11"]) }
    : fact;
}

function verifiedEdition(source: CatalogSource | undefined, sha256: string, date: string): boolean {
  return source?.sha256 === sha256 && source.effectiveFrom === date;
}

export function correctMarketBuildingReferences(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>) {
  // Keep the raw catalogue references used by earlier agreement analyses reproducible.
  if (verifiedEdition(sources[storebrandHouseId], storebrandEditionHash, "2025-08-15")) {
    facts.storebrandHusStandard = facts.storebrandHusStandard.map(fact => {
      if (fact.source.documentId !== storebrandHouseId) return fact;
      const corrected = correctStorebrandAgeReference(correctReferences(fact, storebrandStandardPages));
      return corrected.key === "hus.tilpasning.grense" ? { ...corrected, value: accessibleHome } : corrected;
    });
    facts.storebrandHusSuper = facts.storebrandHusSuper.map(fact =>
      fact.source.documentId === storebrandHouseId ? correctReferences(fact, storebrandSuperPages) : fact);
  }

  if (verifiedEdition(sources[storebrandCabinId], storebrandEditionHash, "2025-08-15")) {
    for (const id of ["storebrand-hytte-standard", "storebrand-hytte-super"]) {
      facts[id] = facts[id].map(fact =>
        fact.source.documentId === storebrandCabinId ? correctStorebrandAgeReference(fact) : fact);
    }
  }

  if (!verifiedEdition(sources[fremtindStandardId], fremtindEditionHash, "2024-01-01")) return;
  facts.fremtindHusStandard = facts.fremtindHusStandard.map(fact => {
    if (fact.source.documentId !== fremtindStandardId) return fact;
    const corrected = correctReferences(fact, fremtindStandardPages, fremtindContinuations);
    return corrected.key === additionsKey ? { ...corrected, value: fremtindStandardAdditions } : corrected;
  });

  const topp = sources[fremtindToppId];
  const additions = facts.fremtindHusStandard.find(fact => fact.key === additionsKey && fact.source.documentId === fremtindStandardId);
  if (topp && additions && verifiedEdition(topp, fremtindEditionHash, "2023-03-15")) {
    facts.fremtindHusTopp = [...facts.fremtindHusTopp.filter(fact => fact.key !== additionsKey), {
      ...additions,
      value: fremtindToppAdditions,
      replacesBase: true,
      source: {
        ...additions.source,
        documentId: topp.id, filename: topp.filename, termsNumber: topp.termsNumber, effectiveFrom: topp.effectiveFrom,
        version: topp.version, productCode: topp.productCode, url: topp.url, page: 1, section: "1.1 Bygning",
      },
    }];
  }
}
