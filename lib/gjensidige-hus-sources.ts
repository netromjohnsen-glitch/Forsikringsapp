import type { CatalogSource } from "./product-catalog.ts";

const root = "https://www.gjensidige.no";
const checked = "2026-09-20";

export const gjensidigeHusSources: Record<string, CatalogSource> = {
  gjensidigeHusStandard: {
    id: "gjensidigeHusStandard", filename: "Hus-Standard-alminnelige-vilkar.pdf",
    documentName: "Alminnelige vilkår Hus Standard", termsNumber: "Hus Standard",
    version: "Alminnelige vilkår", effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus"],
    url: `${root}/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Standard-alminnelige-vilkar.pdf`,
    sha256: "d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc",
  },
  gjensidigeHusPluss: {
    id: "gjensidigeHusPluss", filename: "Hus-Pluss-alminnelige-vilkar.pdf",
    documentName: "Alminnelige vilkår Hus Pluss", termsNumber: "Hus Pluss",
    version: "Alminnelige vilkår", effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus Pluss", "Råte og skadeinsekter"],
    url: `${root}/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Pluss-alminnelige-vilkar.pdf`,
    sha256: "79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792",
  },
  gjensidigeHusIpid: {
    id: "gjensidigeHusIpid", filename: "IPID-Husforsikring-EAP01.pdf",
    documentName: "IPID Husforsikring", termsNumber: "EAP01", productCode: "EAP01",
    version: "EAP01", effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus", "Hus Pluss", "Valgfrie utvidelser"],
    url: `${root}/ipid/gfno/EAP01`,
    sha256: "5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9",
  },
  gjensidigeHusProduct: {
    id: "gjensidigeHusProduct", filename: "Husforsikring-produktside.html",
    documentName: "Husforsikring – produktside", termsNumber: "Produktside Husforsikring",
    version: `Kontrollert ${checked}`, effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus", "Hus Pluss", "Valgfrie utvidelser"],
    url: `${root}/forsikring/boligforsikring/husforsikring`,
    sha256: "32d491a3f2648199545134ff68994615f45b25f48d169bd3ff43ea61b9bad534",
  },
  gjensidigeHusSmart: {
    id: "gjensidigeHusSmart", filename: "Hus-Smart-produktside.html",
    documentName: "Hus Smart – produktside", termsNumber: "Produktside Hus Smart",
    version: `Kontrollert ${checked}`, effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus Smart"],
    url: `${root}/forsikring/boligforsikring/smart`,
    sha256: "a9fcfb36a45ff72352913882955d26fe119b57427532562be1634f274855c530",
  },
  gjensidigeHusSmartTerms: {
    id: "gjensidigeHusSmartTerms", filename: "Hus-Smart-alarmvilkar.html",
    documentName: "Avtalevilkår for alarmtjenester", termsNumber: "Kundeavtale Hus Smart",
    version: `Kontrollert ${checked}`, effectiveFrom: "", updatedAt: checked,
    company: "Gjensidige", insuranceType: "Hus", appliesTo: ["Hus Smart"],
    url: `${root}/forsikring/boligforsikring/smart/kundeavtale`,
    sha256: "ac113a34392ed290b3a2cac50ebb18fae44bbecf301db0ca1ce253794b969414",
  },
};
