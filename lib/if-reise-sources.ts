import type { CatalogSource } from "./product-catalog.ts";

const checked = "2026-09-20";
const source = (id: string, filename: string, documentName: string, termsNumber: string,
  effectiveFrom: string, url: string, sha256: string, appliesTo: string[]): CatalogSource => ({
  id, filename, documentName, termsNumber, productCode: termsNumber, version: termsNumber,
  effectiveFrom, appliesTo, company: "If", insuranceType: "Reise", url, sha256,
  ...(!effectiveFrom ? { updatedAt: `Kontrollert ${checked}` } : {}),
});

export const ifReiseSources: Record<string, CatalogSource> = {
  ifReiseTerms: source("ifReiseTerms", "Helars-reiseforsikring-vilkar.pdf", "Helårs reiseforsikring – forsikringsvilkår",
    "ERA3-4", "2025-03-22", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Hel%C3%A5rs_reiseforsikring",
    "1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566", ["Basis", "Standard", "Super"]),
  ifReiseIpid: source("ifReiseIpid", "Helars-reiseforsikring-IPID.pdf", "Helårs reiseforsikring – IPID",
    "Ikke oppgitt", "", "https://if.no/apps/vilkarsbasendokument/IPID?ipid=Hel%C3%A5rs_reiseforsikring",
    "99af2fa444b91b46907dea5d331506d80519f3cce304913b9aebe68041782ea9", ["Produktstruktur", "45/90 dager", "Norge"]),
  ifReiseProductPage: source("ifReiseProductPage", "Reiseforsikring-produktside.html", "Helårs reiseforsikring – produktside",
    "Ikke oppgitt", "", "https://www.if.no/privat/forsikring/reise/reiseforsikring",
    "f389d97d9b9ddd9b05ba6273128eef5b36be9fa741af822fc4d2293d636b3be6", ["Produktoversikt", "Tjenester"]),
  ifReiseOverview: source("ifReiseOverview", "Reiseoversikt.html", "Reiseforsikringer – oversikt",
    "Ikke oppgitt", "", "https://www.if.no/privat/forsikring/reise",
    "4e80060915d293e6eec5a46b6f979db4de81d56b99f35a0d9427aa65bbde4e3c", ["Reiseoversikt"]),
  ifReiseSmartDelay: source("ifReiseSmartDelay", "SmartDelay.html", "SmartDelay+ ved flyforsinkelser",
    "Ikke oppgitt", "", "https://www.if.no/privat/forsikring/kundefordeler/smartdelay",
    "6c4cd2f73c6e7b3fcf8eb6e54a8e17eddc793e4757a140aaf0c32a3a8e87d1d4", ["Super-tjeneste"]),
  ifReiseHelp: source("ifReiseHelp", "Reisehjelp.html", "If reisehjelp",
    "Ikke oppgitt", "", "https://www.if.no/privat/forsikring/reise/reisehjelp",
    "85c4e9a9ab34526abeee3980adf03db51fe4feb8cdd0facdc5394801442e38a5", ["Assistansetjeneste", "Digital legetime", "Helsesjekk"]),
};
