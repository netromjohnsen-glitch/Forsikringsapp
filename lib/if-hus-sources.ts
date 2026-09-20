import type { CatalogSource } from "./product-catalog.ts";

const fullTermsUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bygningsforsikring";
const liabilityUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV006";
const productUrl = "https://www.if.no/privat/forsikring/bolig/husforsikring";

export const ifHusSources: Record<string, CatalogSource> = {
  ifHusTerms: {
    id: "ifHusTerms", filename: "Bygningsforsikring.pdf", termsNumber: "BGN1-0",
    documentName: "Bygningsforsikring", version: "September 2023", effectiveFrom: "2023-09",
    company: "If", insuranceType: "Hus", url: fullTermsUrl,
    sha256: "9d2d36695c5677aea3e92ff8d395a9c5403f3d7d2afedb8e3447d9af21f526fe",
    appliesTo: ["Basis", "Utvidet", "Super"],
  },
  ifHusLiability: {
    id: "ifHusLiability", filename: "Rettshjelp-og-ansvarsforsikring.pdf", termsNumber: "S-006 / SV006",
    documentName: "Rettshjelp- og ansvarsforsikring", version: "Juni 2021", effectiveFrom: "2021-06",
    company: "If", insuranceType: "Hus", url: liabilityUrl,
    sha256: "7edf14be25afedc260ad602f87ddc7ba6c58c038bcbeaacc0bbf6301a0f15ceb",
    appliesTo: ["Basis", "Utvidet", "Super"],
  },
  ifHusIpid: {
    id: "ifHusIpid", filename: "IPID-Husforsikring.pdf", termsNumber: "IPID Husforsikring",
    documentName: "Husforsikring - dokument med opplysninger om forsikringsproduktet",
    effectiveFrom: "", company: "If", insuranceType: "Hus",
    url: "https://www.if.no/globalassets/no/privat/pdf/ipid/husforsikring.pdf",
    sha256: "3fe4b557872a18229909a733213f3e1216d5bea3731dba692bc66c8b1c6b0028",
    appliesTo: ["Basis", "Utvidet", "Super"],
  },
  ifHusGeneral: {
    id: "ifHusGeneral", filename: "Generelle-vilkar-privat.pdf", termsNumber: "Generelle vilkår",
    documentName: "Generelle vilkår", version: "Utstedt 14. september 2020", effectiveFrom: "2020-09-14",
    company: "If", insuranceType: "Hus",
    url: "https://www.if.no/globalassets/no/privat/pdf/forsikringsvilkar-privatperson.pdf",
    sha256: "54e98b9553cc98f6f8d469dedcc345852a5d5cc7d437a6fce4fad181a1647471",
    appliesTo: ["Basis", "Utvidet", "Super"],
  },
  ifHusProductPage: {
    id: "ifHusProductPage", filename: "Husforsikring-produktside.html", termsNumber: "Produktside Husforsikring",
    documentName: "Husforsikring - sjekk din pris her", version: "Kontrollert 20.09.2026",
    effectiveFrom: "2026-09-20", updatedAt: "2026-09-20", company: "If", insuranceType: "Hus",
    url: productUrl, sha256: "884b2b641c4defa1ed1db627de5ba4c12dba2fe6927deb919b8e5eef9cfb4e0b",
    appliesTo: ["Basis", "Utvidet", "Super"],
  },
};
