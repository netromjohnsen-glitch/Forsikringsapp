import { trygIfMcBobilCatalog } from "./mc-bobil-tryg-if-catalog.ts";
import { gjensidigeStorebrandMcBobilCatalog } from "./mc-bobil-gjensidige-storebrand-catalog.ts";
import { fremtindFrendeMcBobilCatalog } from "./mc-bobil-fremtind-frende-catalog.ts";
import type { AgreementScopeDefinition } from "./agreement-scope.ts";

const catalogs = [trygIfMcBobilCatalog, gjensidigeStorebrandMcBobilCatalog, fremtindFrendeMcBobilCatalog];
export const mcBobilProducts = catalogs.flatMap(catalog => catalog.products);
export const mcBobilAddOns = catalogs.flatMap(catalog => catalog.addOns);
export const mcBobilFacts = Object.assign({}, ...catalogs.map(catalog => catalog.facts)) as typeof trygIfMcBobilCatalog.facts;
export const mcBobilSources = Object.assign({}, ...catalogs.map(catalog => catalog.sources)) as typeof trygIfMcBobilCatalog.sources;
export const mcBobilAgreementScopes: AgreementScopeDefinition[] = [
  { id: "ordinary-sparebank1", providerId: "fremtind", name: "Ordinær avtale via SpareBank 1" },
  { id: "ordinary-dnb", providerId: "fremtind", name: "Ordinær avtale via DNB" },
];
