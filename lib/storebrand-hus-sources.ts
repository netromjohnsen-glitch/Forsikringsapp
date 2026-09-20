import type { CatalogSource } from "./product-catalog.ts";

const root = "https://www.storebrand.no/privat/forsikring";

export const storebrandHusSources: Record<string, CatalogSource> = {
  storebrandHusTerms: {
    id: "storebrandHusTerms", filename: "Vilkar-hus-og-hytte-HUS10.pdf", termsNumber: "HUS10 / 45511h",
    documentName: "Vilkår for hus- og hytteforsikring", version: "HUS10", effectiveFrom: "2025-08-15",
    company: "Storebrand", insuranceType: "Hus", appliesTo: ["Standard", "Super"],
    url: `${root}/husforsikring/_/attachment/inline/bed0c667-5e49-4a74-a9fe-3fee13bb9393:4249e68c81c5f5b48d1fd01bb4aabb347f4d1976/vilkar-husforsikring.pdf`,
    sha256: "d69c9ec3fc2edfd71c625dfcf9d19dc801dadfb3f627bc0105a78891a3eacd61",
  },
  storebrandHusGeneral: {
    id: "storebrandHusGeneral", filename: "Generelle-vilkar-GENER07.pdf", termsNumber: "GENER07",
    documentName: "Generelle vilkår", version: "GENER07", effectiveFrom: "2026-09-01",
    company: "Storebrand", insuranceType: "Hus", appliesTo: ["Standard", "Super"],
    url: `${root}/forsikringsvilkar/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf`,
    sha256: "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",
  },
  storebrandHusIpid: {
    id: "storebrandHusIpid", filename: "IPID-Husforsikring.pdf", termsNumber: "17099",
    documentName: "IPID Husforsikring", version: "08/2019", effectiveFrom: "2019-08",
    company: "Storebrand", insuranceType: "Hus", appliesTo: ["Standard", "Super"],
    url: `${root}/ipid/_/attachment/inline/60414f6c-a7bd-432a-8702-846c0222cdcd:442c0277347c45cc5f655d18f4527ee61f590d3f/ipid-husforsikring.pdf`,
    sha256: "c4794af12026c190fc72e8213cea620080a9ea50370a26e068e1df8fc8481261",
  },
  storebrandHusRental: {
    id: "storebrandHusRental", filename: "Vilkar-utleieforsikring-UTLEI03.pdf", termsNumber: "UTLEI03 / 45529B",
    documentName: "Vilkår Utleieforsikring", version: "10/2025", effectiveFrom: "2025-10-15",
    company: "Storebrand", insuranceType: "Hus", appliesTo: ["Valgfritt tillegg"],
    url: `${root}/forsikringsvilkar/_/attachment/inline/c2115f67-e0ea-4b6b-891d-b4cf7431e441:12789f5d912a022509bb2a6c2f0724285c66b28f/vilkar-utleieforsikring.pdf`,
    sha256: "a328ed4ed879dc20e65cbd4912fb2eee8f46722ee16ff02219acf7fdc1a2ef18",
  },
  storebrandHusProduct: {
    id: "storebrandHusProduct", filename: "Husforsikring-produktside.html", termsNumber: "Produktside Husforsikring",
    documentName: "Husforsikring", version: "Kontrollert 20.09.2026", effectiveFrom: "2026-09-20",
    updatedAt: "2026-09-20", company: "Storebrand", insuranceType: "Hus", appliesTo: ["Standard", "Super"],
    url: `${root}/husforsikring`, sha256: "7121604b2aba25d4dba3ae4dcfa4b744f7e4ac30ced4e3ef4483c1b27cb28689",
  },
};
