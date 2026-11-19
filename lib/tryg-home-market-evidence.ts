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

function currentSummary(source: CatalogFact["source"], document: keyof typeof summaries): CatalogFact["source"] {
  const { id, filename, url } = summaries[document];
  return {
    ...source, documentId: id, filename, url, termsNumber: "IPID", version: issued,
    effectiveFrom: issued,
  };
}

const facts: Record<string, CatalogFact[]> = {
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

export const trygHomeMarketArchives = Object.values(summaries).map(({ id, slug, filename, url }) => ({
  provider: "tryg",
  slug,
  archivePath: "catalog/sources/tryg/current-20260901/" + filename,
  sources: [[id, issued, url] as const],
}));
