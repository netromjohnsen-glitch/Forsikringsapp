import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { trygHusFacts } from "./tryg-hus-catalog.ts";
import { trygInnboFacts } from "./tryg-innbo-catalog.ts";

const issued = "2026-09-01";
const summaries = {
  Hus: {
    id: "tryg:market:hus:ipid-2026-09",
    filename: "IPID-Hus-2026-09.pdf",
    slug: "hus-ipid-2026-09",
    url: "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Hus.pdf",
    sha256: "1f0bf31d28fee7253d87a8bf8d943f654618410956770dcb76e932e548aed409",
  },
  Innbo: {
    id: "tryg:market:innbo:ipid-2026-09",
    filename: "IPID-Innbo-2026-09.pdf",
    slug: "innbo-ipid-2026-09",
    url: "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Innbo.pdf",
    sha256: "bbd5d215b330a443b0a615f1dbc28d3ef302315d44f8fcf6a4fe1c940ac560d0",
  },
};

const liability = {
  filename: "05PGE90020.pdf",
  termsNumber: "PGE90020",
  effectiveFrom: "2026-10-01",
  url: "https://www.tryg.no/odpdf?vilkNr=05PGE90020&vilk=Fellesvilkaar-Privat",
  sha256: "c75dcb29b61d990dd95869e884fb64f59dd839717f9cb88fa9d85f0618d000df",
};

const liabilityScopes = {
  Hus: {
    id: "tryg:market:hus:privatansvar-2026-10",
    type: "Hus",
    productIds: ["tryg-hus", "tryg-hus-ekstra"],
    productVersion: "2026-01-01",
    key: "hus.ansvar",
    sumKey: "hus.ansvar.grense",
    insured: "som eier eller fester av den forsikrede eiendommen",
  },
  Innbo: {
    id: "tryg:market:innbo:privatansvar-2026-10",
    type: "Innbo",
    productIds: ["tryg-innbo", "tryg-innbo-ekstra"],
    productVersion: "2026-07-01",
    key: "ansvar",
    sumKey: "ansvar.sum",
    insured: "som privatperson",
  },
};

const sources: Record<string, CatalogSource> = Object.fromEntries(
  Object.entries(summaries).map(([insuranceType, { id, filename, url, sha256 }]) => [
    id,
    {
      id, filename, url, sha256, company: "Tryg", providerId: "tryg", insuranceType,
      agreementScope: "ordinary", sourceType: "ipid", termsNumber: "IPID",
      version: issued, effectiveFrom: issued, physicalPages: [1, 2],
    },
  ]),
);

for (const { id, type, productIds, productVersion } of Object.values(liabilityScopes)) {
  sources[id] = {
    ...liability, id, productIds, productVersion, insuranceType: type, providerId: "tryg",
    company: "Tryg", agreementScope: "ordinary", sourceType: "full_terms", physicalPages: [1, 3],
    documentName: "Tryg Privatansvar",
  };
}

function withCurrentLiability(baseFacts: CatalogFact[], type: keyof typeof liabilityScopes): CatalogFact[] {
  const { id, key, sumKey, insured } = liabilityScopes[type];
  const coverageKey = key + ".dekning";
  const { filename, termsNumber, effectiveFrom, url } = liability;
  const reference = {
    documentId: id, filename, termsNumber, effectiveFrom, url, company: "Tryg", agreementScope: "ordinary",
  } as const;
  const section = { ...reference, page: 2, section: "Punkt 3.3 for hus, hytte og innbo" };
  return [
    ...baseFacts.filter(fact => fact.key !== coverageKey),
    {
      key: coverageKey, label: "Privatansvar",
      value: `Rettslig erstatningsansvar ${insured} for person- og tingskade i Norden. Skaden må være konstatert i forsikringstiden.`,
      source: { ...reference, page: 1, section: "Punkt 1, 2 og 3.1" },
    },
    {
      key: sumKey, label: "Ansvar – forsikringssum", value: "Inntil 5 000 000 kr ved én og samme hendelse.",
      source: section,
    },
    {
      key: key + ".egenandel", label: "Ansvar – egenandel", value: "4 000 kr per skadetilfelle.",
      deductibleClassification: "coverage", source: section,
    },
  ];
}

function currentSummary(source: CatalogFact["source"], document: keyof typeof summaries): CatalogFact["source"] {
  const { id, filename, url } = summaries[document];
  return {
    ...source, documentId: id, filename, url, termsNumber: "IPID", version: issued,
    effectiveFrom: issued,
  };
}

const facts: Record<string, CatalogFact[]> = {
  trygHus: withCurrentLiability(trygHusFacts.trygHus, "Hus"),
  trygHusExtra: withCurrentLiability(trygHusFacts.trygHusExtra, "Hus"),
  trygInnboShared: withCurrentLiability(trygInnboFacts.trygInnboShared, "Innbo"),
  trygHusIpid: trygHusFacts.trygHusIpid.map(fact =>
    fact.key === "hus.bygninger.tilbehor" && fact.source.documentId === "trygHusIpid"
      ? { ...fact, source: currentSummary(fact.source, "Hus") }
      : fact),
  trygInnboExtra: trygInnboFacts.trygInnboExtra.map(fact =>
    fact.key === "uhell.geografi" && fact.qualificationSource?.documentId === "trygInnboIpid"
      ? { ...fact, qualificationSource: currentSummary(fact.qualificationSource, "Innbo") }
      : fact),
};

export const trygHomeMarketEvidence = {
  replacesProductIds: [] as string[],
  products: [] as CatalogProduct[],
  sources,
  facts,
  addOns: [] as CatalogAddOn[],
};

export const trygHomeMarketArchives = [
  ...Object.values(summaries).map(({ id, slug, filename, url }) => ({
    provider: "tryg",
    slug,
    archivePath: "catalog/sources/tryg/current-20260901/" + filename,
    sources: [[id, issued, url] as const],
  })),
  {
    provider: "tryg",
    slug: "hus-innbo-privatansvar-2026-10",
    archivePath: "catalog/sources/tryg/hus/" + liability.filename,
    sources: Object.values(liabilityScopes).map(({ id }) => [id, liability.effectiveFrom, liability.url] as const),
  },
];
