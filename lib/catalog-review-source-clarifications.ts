import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const frendeEdition = "2026-11-20";
const frendeTermsId = "private-valuables:frende:" + frendeEdition;
const watercirclesTermsId = "watercircles-innbo-fritidsbolig-terms";

const frendeProductPage: CatalogSource = {
  id: "frende-verdisak-bortkomst-produktside",
  company: "Frende", providerId: "frende", agreementScope: "ordinary", insuranceType: "Verdisak",
  productIds: ["frende-verdisak"],
  filename: "Frende – Dekker alle typer skader", termsNumber: "", effectiveFrom: "",
  url: "https://www.frende.no/forsikringer/verdigjenstandsforsikring/dekker-alle-typer-skader/",
  sourceType: "product_page",
};

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  const { id, company, agreementScope, effectiveFrom, filename, termsNumber, url } = source;
  return { documentId: id, company, agreementScope, effectiveFrom, filename, termsNumber, page, section, url };
}

export function addReviewedSourceClarifications(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  const frende = products.find(product => product.productId === "frende-verdisak" &&
    product.version === frendeEdition && product.componentIds?.includes(frendeTermsId));
  const frendeTerms = sources[frendeTermsId];
  if (frende && frendeTerms?.sha256 === "638f9e3e8b57413993b19b6894814275cdbbbae902a3191fa77b6e8c17f57d9a") {
    sources[frendeProductPage.id] = frendeProductPage;
    facts[frendeTermsId] = [
      ...(facts[frendeTermsId] ?? []).filter(fact => fact.key !== "verdisak.tap"),
      {
        key: "verdisak.tap", label: "Tap av gjenstand", requiresSourceClarification: true,
        value: "Vilkårets punkt 4 angir tyveri og plutselig skade. Frendes produktside omtaler også bortkomst. Be Frende avklare ren bortkomst for den aktuelle avtalen.",
        source: cite(frendeTerms, 2, "4 Hvilke skader som dekkes"),
        qualificationSource: cite(frendeProductPage, 0, "Dekker alle typer skader"),
      },
    ];
  }

  const eliteId = "watercircles-innbo-fritidsbolig-elite";
  const elite = products.find(product => product.productId === eliteId && product.sourceId === watercirclesTermsId &&
    product.componentIds?.includes(eliteId));
  const eliteTerms = sources[watercirclesTermsId];
  if (elite && eliteTerms?.sha256 === "751079b0621201da359bed6b4290da48897fc45e65cbc28b4f8346605e7fe924") {
    const note = {
      value: "Grunnvilkåret unntar penger og verdipapirer for innbo i fritidsbolig. Elite-tabellen angir 20 000 kr, uten å si om fritidsboligunntaket oppheves. Be WaterCircles avklare hvilken regel som gjelder for avtalen.",
      requiresSourceClarification: true,
      source: cite(eliteTerms, 5, "A.2.2 nr. 1 Penger og verdipapirer"),
      qualificationSource: cite(eliteTerms, 9, "B.2 nr. 1 Penger og verdipapirer"),
    } as const;
    facts[eliteId] = [
      ...(facts[eliteId] ?? []).filter(fact => !["innbo.penger.dekning", "innbo.penger.grense"].includes(fact.key)),
      { ...note, key: "innbo.penger.dekning", label: "Penger og verdipapirer" },
      { ...note, key: "innbo.penger.grense", label: "Penger og verdipapirer – grense" },
    ];
  }
}
