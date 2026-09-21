import type { CatalogAddOn, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { SPAREBANK1_FREMTIND_URLS } from "./sparebank1-fremtind-catalog.ts";

// DNB lenker de samme fem byte-identiske Fremtind-dokumentene som SpareBank 1
// for hovednivåene. De kanoniske komponentene gjenbrukes derfor. DNB-siden og
// IPID V.106 dokumenterer at Leiebil og Maskinskade kan velges på Kasko/Topp,
// men DNB lenker ikke de separate tilleggsvilkårene. Tilleggene får derfor ikke
// SpareBank 1s detaljerte fakta før en DNB-kilde dokumenterer dem.
export const DNB_FREMTIND_PRODUCT_URL = "https://www.dnb.no/forsikring/bilforsikring";
export const DNB_FREMTIND_URLS = {
  ansvar: SPAREBANK1_FREMTIND_URLS.ansvar,
  delkasko: SPAREBANK1_FREMTIND_URLS.delkasko,
  kasko: SPAREBANK1_FREMTIND_URLS.kasko,
  topp: SPAREBANK1_FREMTIND_URLS.toppkasko,
  ipid: SPAREBANK1_FREMTIND_URLS.ipid,
} as const;

export const dnbFremtindSources: Record<string, CatalogSource> = {
  dnbOptionalCoverages: {
    id: "dnbOptionalCoverages",
    company: "DNB / Fremtind",
    filename: "IPID_Bil.pdf",
    termsNumber: "V.106",
    effectiveFrom: "",
    url: SPAREBANK1_FREMTIND_URLS.ipid,
    sha256: "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94",
  },
};

const version = "PMO-357.001-004";
export const dnbFremtindProducts: CatalogProduct[] = [
  { company: "DNB / Fremtind", insuranceType: "Bil", name: "Ansvar", providerId: "dnb-fremtind", productId: "dnb-bil-ansvar", version, sourceId: "sp1Ipid", componentIds: ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp"] },
  { company: "DNB / Fremtind", insuranceType: "Bil", name: "Delkasko", providerId: "dnb-fremtind", productId: "dnb-bil-delkasko", version, sourceId: "sp1Ipid", inheritsProductId: "dnb-bil-ansvar", componentIds: ["sp1Delkasko"] },
  { company: "DNB / Fremtind", insuranceType: "Bil", name: "Kasko", providerId: "dnb-fremtind", productId: "dnb-bil-kasko", version, sourceId: "sp1Ipid", inheritsProductId: "dnb-bil-delkasko", componentIds: ["sp1Kasko"] },
  { company: "DNB / Fremtind", insuranceType: "Bil", name: "Topp", providerId: "dnb-fremtind", productId: "dnb-bil-topp", version, sourceId: "sp1Ipid", inheritsProductId: "dnb-bil-kasko", componentIds: ["sp1Toppkasko"] },
];

export const dnbFremtindAddOns: CatalogAddOn[] = [
  { id: "dnb-leiebil", name: "Leiebil", componentId: "sp1Leiebil", providerId: "dnb-fremtind", requiresLevel: ["dnb-bil-kasko", "dnb-bil-topp"] },
  { id: "dnb-maskinskade", name: "Maskinskade", componentId: "sp1Maskinskade", providerId: "dnb-fremtind", requiresLevel: ["dnb-bil-kasko", "dnb-bil-topp"] },
];

export const dnbFremtindFacts = { dnbOptionalCoverages: [] };
