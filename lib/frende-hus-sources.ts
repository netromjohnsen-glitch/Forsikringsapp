import type { CatalogSource } from "./product-catalog.ts";

export const FRENDE_HUS_TERMS_URL = "https://api.frende.no/documents/terms/public/pnc/HomeInsurance";
export const FRENDE_HUS_IPID_URL = "https://www.frende.no/documents/192/IPID_Hus.pdf";
export const FRENDE_HUS_GENERAL_URL = "https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf";
export const FRENDE_HUS_PRODUCT_URL = "https://www.frende.no/forsikringer/husforsikring/";
export const FRENDE_HUS_PEST_URL = "https://www.frende.no/forsikringer/husforsikring/skadedyrforsikring-hus/";

const common = { company: "Frende", insuranceType: "Hus" };

export const frendeHusSources: Record<string, CatalogSource> = {
  frendeHusStandard: {
    id: "frendeHusStandard", filename: "Vilkar-husforsikring.pdf",
    documentName: "Vilkår for hus- og hytteforsikring", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Ikke oppgitt", effectiveFrom: "2026-09-01",
    appliesTo: ["Standard", "Utvidet", "Råte- og skadedyrsforsikring", "Utleie", "Bygg under oppføring"],
    url: FRENDE_HUS_TERMS_URL, sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7", ...common,
  },
  frendeHusExtended: {
    id: "frendeHusExtended", filename: "Vilkar-husforsikring.pdf",
    documentName: "Vilkår for hus- og hytteforsikring – Utvidet bygningsforsikring",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", appliesTo: ["Utvidet"], url: FRENDE_HUS_TERMS_URL,
    sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7", ...common,
  },
  frendeHusRot: {
    id: "frendeHusRot", filename: "Vilkar-husforsikring.pdf",
    documentName: "Vilkår for hus- og hytteforsikring – Råte- og skadedyrsforsikring",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", appliesTo: ["Tilvalg til Standard og Utvidet"],
    url: FRENDE_HUS_TERMS_URL, sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7", ...common,
  },
  frendeHusRental: {
    id: "frendeHusRental", filename: "Vilkar-husforsikring.pdf",
    documentName: "Vilkår for hus- og hytteforsikring – Skadeverk ved utleie",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", appliesTo: ["Tilvalg til Standard og Utvidet"],
    url: FRENDE_HUS_TERMS_URL, sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7", ...common,
  },
  frendeHusConstruction: {
    id: "frendeHusConstruction", filename: "Vilkar-husforsikring.pdf",
    documentName: "Vilkår for hus- og hytteforsikring – Bygg under oppføring",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", appliesTo: ["Avtalt risikosituasjon"],
    url: FRENDE_HUS_TERMS_URL, sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7", ...common,
  },
  frendeHusIpid: {
    id: "frendeHusIpid", filename: "IPID-Hus.pdf",
    documentName: "Husforsikring – dokument med opplysninger om forsikringsproduktet",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "", updatedAt: "2025-01-01", appliesTo: ["Standard", "Utvidet", "Tilvalg"],
    url: FRENDE_HUS_IPID_URL, sha256: "c2f5202eba21c605240cb9831a79be976f958135c066e6023ba9635a4fe33eaf", ...common,
  },
  frendeHusGeneral: {
    id: "frendeHusGeneral", filename: "Generelle-vilkar-01012026.pdf",
    documentName: "Generelle vilkår for alle skadeforsikringer i Frende",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-01-01", appliesTo: ["Alle dekninger"], url: FRENDE_HUS_GENERAL_URL,
    sha256: "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b", ...common,
  },
  frendeHusProductPage: {
    id: "frendeHusProductPage", filename: "Husforsikring-produktside.html",
    documentName: "Frende husforsikring – produktside", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Kontrollert 20.09.2026", effectiveFrom: "",
    updatedAt: "2026-09-20", appliesTo: ["Produktstruktur", "Tilvalg", "Korttidsutleie"],
    url: FRENDE_HUS_PRODUCT_URL, sha256: "5aec68ed77a059586988b8d715a7cc0e3d962ea926dff9ae3069956953ed685b", ...common,
  },
  frendeHusPestPage: {
    id: "frendeHusPestPage", filename: "Rate-og-skadedyr-produktside.html",
    documentName: "Råte- og skadedyrforsikring – produktside", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Kontrollert 20.09.2026", effectiveFrom: "",
    updatedAt: "2026-09-20", appliesTo: ["Tilvalg til Standard og Utvidet"],
    url: FRENDE_HUS_PEST_URL, sha256: "4f59805fcebb0e379af8c10760f7ea477e9b3a75f339f27f5f2a878741fc1739", ...common,
  },
};
