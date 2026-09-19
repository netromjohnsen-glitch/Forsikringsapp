import type { CatalogAddOn, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { SPAREBANK1_FREMTIND_URLS } from "./sparebank1-fremtind-catalog.ts";

// Eikas sider for nye produkter fra 13.10.2025 lenker de samme byte-identiske
// Bil- og IPID-filene som SpareBank 1 og DNB. Hoveddekningen gjenbruker derfor
// de kanoniske Fremtind-komponentene. Den separate M05P-IPID-en beskriver en
// Pluss-struktur, men er ikke lenket som gjeldende nyprodukt fra disse sidene.
export const EIKA_FREMTIND_TERMS_URL = "https://www.eikaforsikring.no/alle-forsikringer/vilkar";
export const EIKA_FREMTIND_IPID_URL = "https://www.eikaforsikring.no/alle-forsikringer/produktinformasjon";
export const EIKA_FREMTIND_URLS = {
  bil: SPAREBANK1_FREMTIND_URLS.toppkasko,
  ipid: SPAREBANK1_FREMTIND_URLS.ipid,
} as const;

export const eikaFremtindSources: Record<string, CatalogSource> = {
  eikaOptionalCoverages: {
    id: "eikaOptionalCoverages",
    company: "Eika / Fremtind",
    filename: "IPID_Bil.pdf",
    termsNumber: "V.106",
    effectiveFrom: "2025-10-13",
    url: EIKA_FREMTIND_URLS.ipid,
    sha256: "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94",
  },
};

const version = "PMO-357.001-004";
export const eikaFremtindProducts: CatalogProduct[] = [
  { company: "Eika / Fremtind", insuranceType: "Bil", name: "Ansvar", providerId: "eika-fremtind", productId: "eika-bil-ansvar", version, sourceId: "sp1Ipid", componentIds: ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp"] },
  { company: "Eika / Fremtind", insuranceType: "Bil", name: "Delkasko", providerId: "eika-fremtind", productId: "eika-bil-delkasko", version, sourceId: "sp1Ipid", inheritsProductId: "eika-bil-ansvar", componentIds: ["sp1Delkasko"] },
  { company: "Eika / Fremtind", insuranceType: "Bil", name: "Kasko", providerId: "eika-fremtind", productId: "eika-bil-kasko", version, sourceId: "sp1Ipid", inheritsProductId: "eika-bil-delkasko", componentIds: ["sp1Kasko"] },
  { company: "Eika / Fremtind", insuranceType: "Bil", name: "Topp", providerId: "eika-fremtind", productId: "eika-bil-topp", version, sourceId: "sp1Ipid", inheritsProductId: "eika-bil-kasko", componentIds: ["sp1Toppkasko"] },
];

export const eikaFremtindAddOns: CatalogAddOn[] = [
  { id: "eika-leiebil", name: "Leiebil", componentId: "eikaOptionalCoverages", providerId: "eika-fremtind", requiresLevel: ["eika-bil-kasko", "eika-bil-topp"] },
  { id: "eika-maskinskade", name: "Maskinskade", componentId: "eikaOptionalCoverages", providerId: "eika-fremtind", requiresLevel: ["eika-bil-kasko", "eika-bil-topp"] },
];

export const eikaFremtindFacts = { eikaOptionalCoverages: [] };
