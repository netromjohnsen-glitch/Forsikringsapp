import type { CatalogAddOn, CatalogProduct, CatalogSource } from "./product-catalog.ts";

export const fremtindSources: Record<string, CatalogSource> = {
  fremtindOptionalCoverages: {
    id: "fremtindOptionalCoverages", company: "Fremtind", filename: "IPID_Bil.pdf",
    termsNumber: "V.106", effectiveFrom: "", url: "https://dokument.fremtind.no/ipid/IPID_Bil.pdf",
    sha256: "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94",
  },
};

const version = "PMO-357.001-004";
export const fremtindProducts: CatalogProduct[] = [
  { company: "Fremtind", insuranceType: "Bil", name: "Ansvar", providerId: "fremtind", productId: "fremtind-bil-ansvar", version, sourceId: "sp1Ipid", componentIds: ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp"] },
  { company: "Fremtind", insuranceType: "Bil", name: "Delkasko", providerId: "fremtind", productId: "fremtind-bil-delkasko", version, sourceId: "sp1Ipid", inheritsProductId: "fremtind-bil-ansvar", componentIds: ["sp1Delkasko"] },
  { company: "Fremtind", insuranceType: "Bil", name: "Kasko", providerId: "fremtind", productId: "fremtind-bil-kasko", version, sourceId: "sp1Ipid", inheritsProductId: "fremtind-bil-delkasko", componentIds: ["sp1Kasko"] },
  { company: "Fremtind", insuranceType: "Bil", name: "Topp", providerId: "fremtind", productId: "fremtind-bil-topp", version, sourceId: "sp1Ipid", inheritsProductId: "fremtind-bil-kasko", componentIds: ["sp1Toppkasko"] },
];

export const fremtindAddOns: CatalogAddOn[] = [
  { id: "fremtind-leiebil", name: "Leiebil", componentId: "sp1Leiebil", providerId: "fremtind", requiresLevel: ["fremtind-bil-kasko", "fremtind-bil-topp"], excludeDistributionChannels: ["SpareBank 1"] },
  { id: "fremtind-maskinskade", name: "Maskinskade", componentId: "sp1Maskinskade", providerId: "fremtind", requiresLevel: ["fremtind-bil-kasko", "fremtind-bil-topp"], excludeDistributionChannels: ["SpareBank 1"] },
  { id: "fremtind-sb1-leiebil", name: "Leiebil", componentId: "sp1Leiebil", providerId: "fremtind", requiresLevel: ["fremtind-bil-kasko", "fremtind-bil-topp"], distributionChannels: ["SpareBank 1"] },
  { id: "fremtind-sb1-maskinskade", name: "Maskinskade", componentId: "sp1Maskinskade", providerId: "fremtind", requiresLevel: ["fremtind-bil-kasko", "fremtind-bil-topp"], distributionChannels: ["SpareBank 1"] },
];

export const fremtindFacts = { fremtindOptionalCoverages: [] };
