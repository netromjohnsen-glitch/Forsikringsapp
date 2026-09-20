import type { CatalogSource } from "./product-catalog.ts";
const source = (id:string, filename:string, documentName:string, termsNumber:string, effectiveFrom:string, url:string, sha256:string, appliesTo:string[]):CatalogSource => ({
  id, filename, documentName, termsNumber, productCode:termsNumber, version:termsNumber, effectiveFrom, appliesTo,
  company:"Storebrand", insuranceType:"Reise", url, sha256, ...(!effectiveFrom ? {updatedAt:"Kontrollert 20.09.2026"}:{})
});
export const storebrandReiseSources:Record<string,CatalogSource> = {
  storebrandReiseTerms: source("storebrandReiseTerms","reise10-vilkar-reiseforsikring.pdf","Vilkår for reiseforsikring","reise10","2025-06-01","https://www.storebrand.no/privat/forsikring/reiseforsikring/_/attachment/inline/d834efe9-3dd1-4ac5-b81a-e88b9e4aa8d9:e889200271f53a0b6bf8059b3aff6bd43f442696/vilkar-reiseforsikring.pdf","d44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414",["Standard","Super"]),
  storebrandReiseGeneral: source("storebrandReiseGeneral","gener07-generelle-vilkar.pdf","Generelle vilkår","gener07","2026-09-01","https://www.storebrand.no/privat/forsikring/reiseforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf","4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",["Standard","Super"]),
  storebrandReiseIpid: source("storebrandReiseIpid","IPID-reiseforsikring.pdf","IPID Storebrand helårs reiseforsikring","17104f 05/2025","","https://www.storebrand.no/privat/forsikring/ipid/_/attachment/inline/88d587de-09cf-4a37-b43d-2fb3035bcc63:4c436d66b5aab46e7567b78683038a724ee11edb/ipid-reiseforsikring.pdf","1a8fb745305aaa2edf9fa9230c7e157c6e3f3e65130de063615f07232e319d37",["Produktstruktur","Varighetsvalg"]),
  storebrandReiseProductPage: source("storebrandReiseProductPage","Reiseforsikring-produktside.html","Reiseforsikring – produktside","Ikke oppgitt","","https://www.storebrand.no/privat/forsikring/reiseforsikring","fc65e95caadecb0ad10d557b276e8befaf39fe5da9ebb40f70c8d3d87ce2636d",["Produktoversikt","Tjenester"]),
};
