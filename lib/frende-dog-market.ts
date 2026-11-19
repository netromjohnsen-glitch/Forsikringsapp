import { boatPetFacts } from "./boat-pet-catalog.ts";
import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const productId = "frende-hund-veterin-r";
const summary = {
  id: "boat-pet:frende:hund:ipid",
  filename: "frende-dog-ipid.pdf",
  termsNumber: "IPID Hundeforsikring",
  effectiveFrom: "2025-01-01",
  providerId: "frende",
  company: "Frende",
  insuranceType: "Hund",
  agreementScope: "ordinary",
  sourceType: "ipid",
  url: "https://www.frende.no/documents/229/IPID_Hund.pdf",
  sha256: "4d86c2f09d6da801191ce9cfc0d5f92a7cff5924f2c8ae4d5e6568ba23d1751a",
  physicalPages: [1, 2],
  productIds: [productId],
} satisfies CatalogSource;

const facts: CatalogFact[] = boatPetFacts[productId].map(fact =>
  fact.key === "dyr.veterinar.sum.valgbar"
    ? {
        ...fact,
        value: "Valgfri sum inntil 50 000 kr per skadetilfelle og samlet per forsikringsår. Den avtalte summen står i forsikringsbeviset. Summen begrenser også samlet erstatning for veterinær- og medisinutgifter for samme skadetilfelle over flere forsikringsår.",
        source: {
          documentId: summary.id,
          filename: summary.filename,
          termsNumber: summary.termsNumber,
          effectiveFrom: summary.effectiveFrom,
          company: summary.company,
          agreementScope: summary.agreementScope,
          url: summary.url,
          section: "Hvilken forsikring er dette?",
          page: 1,
        },
        qualificationSource: fact.source,
      }
    : fact,
);

export const frendeDogMarket = {
  replacesProductIds: [] as string[],
  products: [] as CatalogProduct[],
  sources: { [summary.id]: summary },
  facts: { [productId]: facts },
  addOns: [] as CatalogAddOn[],
};

export const frendeDogMarketArchives = [{
  provider: "frende",
  slug: "hund-ipid",
  archivePath: "catalog/sources/boat-pet/frende-dog-ipid.pdf",
  sources: [[summary.id, summary.effectiveFrom, summary.url] as const],
}];
