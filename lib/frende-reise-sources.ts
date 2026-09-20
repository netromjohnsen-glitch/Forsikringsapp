import type { CatalogSource } from "./product-catalog.ts";

export const FRENDE_REISE_TERMS_URL = "https://api.frende.no/documents/terms/public/pnc/TravelInsurance";
export const FRENDE_REISE_IPID_URL = "https://www.frende.no/documents/195/Produktark_-_IPID_Reise_2026.pdf";
export const FRENDE_REISE_GENERAL_URL = "https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf";
export const FRENDE_REISE_PRODUCT_URL = "https://www.frende.no/forsikringer/reiseforsikring/";
export const FRENDE_REISE_TERMS_PAGE_URL = "https://www.frende.no/forsikringer/reiseforsikring/vilkar-reiseforsikring/";
export const FRENDE_REISE_DOCTOR_URL = "https://www.frende.no/aktuelt/legetime-mobilen/";
export const FRENDE_REISE_MIDDLE_EAST_URL = "https://www.frende.no/aktuelt/reiseforsikring-midtosten/";
export const FRENDE_REISE_REPLACED_TERMS_URL = "https://www.frende.no/documents/18/Frende_Reise.pdf";

const common = { company: "Frende", insuranceType: "Reise" };

export const frendeReiseSources: Record<string, CatalogSource> = {
  frendeReiseTerms: {
    id: "frendeReiseTerms", filename: "Vilkar-reiseforsikring-01032026.pdf",
    documentName: "Vilkår for reiseforsikring", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Vilkår av 01. mars 2026", effectiveFrom: "2026-03-01",
    appliesTo: ["Reiseforsikring"], url: FRENDE_REISE_TERMS_URL,
    sha256: "a15cb9cf2a1cba6c17eb62f3793cc5f664724f66780ebb692b93775f3f922509", ...common,
  },
  frendeReiseIpid: {
    id: "frendeReiseIpid", filename: "IPID-Reise-2026.pdf",
    documentName: "Reiseforsikring – dokument med opplysninger om forsikringsproduktet",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Sist oppdatert 01.06.2026",
    effectiveFrom: "", updatedAt: "2026-06-01", appliesTo: ["Reiseforsikring"], url: FRENDE_REISE_IPID_URL,
    sha256: "cfb814acf0536c5f1b2e8469d0c50f978623c0370959123446dc00f3aebcab35", ...common,
  },
  frendeReiseGeneral: {
    id: "frendeReiseGeneral", filename: "Generelle-vilkar-01012026.pdf",
    documentName: "Generelle vilkår for alle skadeforsikringer i Frende", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Ikke oppgitt", effectiveFrom: "2026-01-01",
    appliesTo: ["Alle dekninger"], url: FRENDE_REISE_GENERAL_URL,
    sha256: "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b", ...common,
  },
  frendeReiseProductPage: {
    id: "frendeReiseProductPage", filename: "Reiseforsikring-produktside.html",
    documentName: "Frende reiseforsikring – produktside", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Kontrollert 20.09.2026", effectiveFrom: "",
    updatedAt: "2026-09-20", appliesTo: ["Produktstruktur", "Fortsettelsesforsikring", "Tjenester"],
    url: FRENDE_REISE_PRODUCT_URL, sha256: "b718593b3c52ac1d6561c736e48984c278a88484456c8b9d07604329c0d1926b", ...common,
  },
  frendeReiseTermsPage: {
    id: "frendeReiseTermsPage", filename: "Reiseforsikring-vilkarsside.html",
    documentName: "Frende – vilkårsside for reiseforsikring", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Kontrollert 20.09.2026", effectiveFrom: "",
    updatedAt: "2026-09-20", appliesTo: ["Gjeldende dokumentlenker"], url: FRENDE_REISE_TERMS_PAGE_URL,
    sha256: "db2694e50365bdd535631ca422bb0025d15b5456b1805ed3781d3a3302bfafe4", ...common,
  },
  frendeReiseDoctor: {
    id: "frendeReiseDoctor", filename: "Legetime-pa-mobilen.html",
    documentName: "Gratis legetime på mobilen", termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt",
    version: "Kontrollert 20.09.2026", effectiveFrom: "", updatedAt: "2026-09-20",
    appliesTo: ["Digital legetjeneste"], url: FRENDE_REISE_DOCTOR_URL,
    sha256: "b5c65e0c4e4de119c296034507cc468778531541df21af712dcad08b19e1ba67", ...common,
  },
  frendeReiseMiddleEast2026: {
    id: "frendeReiseMiddleEast2026", filename: "Reiseforsikring-Midtosten-2026.html",
    documentName: "Reiseforsikring: Midtøsten", termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt",
    version: "Publisert 28.02.2026; kontrollert 20.09.2026", effectiveFrom: "", updatedAt: "2026-02-28",
    appliesTo: ["Hendelsesspesifikt råd – ikke canonical produktdekning"], url: FRENDE_REISE_MIDDLE_EAST_URL,
    sha256: "f6045f81b02e7f7623eae4a5e79cf8fc975e9b6220153335040b803ad9202f7f", ...common,
  },
  frendeReiseReplacedTerms2020: {
    id: "frendeReiseReplacedTerms2020", filename: "Vilkar-reiseforsikring-01042020-erstattet.pdf",
    documentName: "Vilkår for reiseforsikring – erstattet historisk versjon", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Vilkår av 1. april 2020 – erstattet av 01.03.2026",
    effectiveFrom: "2020-04-01", appliesTo: ["Historisk kontrollkilde – ikke aktiv canonical dekning"],
    url: FRENDE_REISE_REPLACED_TERMS_URL,
    sha256: "98f0c04616a914f2d0d85cf5af4ec700998ce342e48743549d653288a1c83079", ...common,
  },
};
