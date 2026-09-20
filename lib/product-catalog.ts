import { trygAddOns, trygFacts, trygProducts, trygSources } from "./tryg-catalog.ts";
import { ifAddOns, ifFacts, ifProducts, ifSources } from "./if-catalog.ts";
import { gjensidigeAddOns, gjensidigeFacts, gjensidigeProducts, gjensidigeSources } from "./gjensidige-catalog.ts";
import { storebrandAddOns, storebrandFacts, storebrandProducts, storebrandSources } from "./storebrand-catalog.ts";
import { sparebank1FremtindAddOns, sparebank1FremtindFacts, sparebank1FremtindProducts,
  sparebank1FremtindSources } from "./sparebank1-fremtind-catalog.ts";
import { dnbFremtindAddOns, dnbFremtindFacts, dnbFremtindProducts,
  dnbFremtindSources } from "./dnb-fremtind-catalog.ts";
import { eikaFremtindAddOns, eikaFremtindFacts, eikaFremtindProducts,
  eikaFremtindSources } from "./eika-fremtind-catalog.ts";
import { fremtindAddOns, fremtindFacts, fremtindProducts, fremtindSources } from "./fremtind-catalog.ts";
import { frendeAddOns, frendeFacts, frendeProducts, frendeSources } from "./frende-catalog.ts";
import { trygInnboAddOns, trygInnboFacts, trygInnboProducts, trygInnboSources } from "./tryg-innbo-catalog.ts";
import { ifInnboFacts, ifInnboProducts, ifInnboSources } from "./if-innbo-catalog.ts";
import { gjensidigeInnboAddOns, gjensidigeInnboFacts, gjensidigeInnboProducts,
  gjensidigeInnboSources } from "./gjensidige-innbo-catalog.ts";
import { storebrandInnboFacts, storebrandInnboProducts, storebrandInnboSources } from "./storebrand-innbo-catalog.ts";
import { fremtindInnboFacts, fremtindInnboProducts, fremtindInnboSources } from "./fremtind-innbo-catalog.ts";
import { frendeInnboAddOns, frendeInnboFacts, frendeInnboProducts, frendeInnboSources } from "./frende-innbo-catalog.ts";
import { trygHusAddOns, trygHusFacts, trygHusProducts, trygHusSources } from "./tryg-hus-catalog.ts";
import { ifHusAddOns, ifHusFacts, ifHusProducts, ifHusSources } from "./if-hus-catalog.ts";
import { storebrandHusAddOns, storebrandHusFacts, storebrandHusProducts, storebrandHusSources } from "./storebrand-hus-catalog.ts";
import { gjensidigeHusAddOns, gjensidigeHusFacts, gjensidigeHusProducts, gjensidigeHusSources } from "./gjensidige-hus-catalog.ts";
import { fremtindHusAddOns, fremtindHusFacts, fremtindHusProducts, fremtindHusSources } from "./fremtind-hus-catalog.ts";
import { frendeHusAddOns, frendeHusFacts, frendeHusProducts, frendeHusSources } from "./frende-hus-catalog.ts";
import { trygReiseAddOns, trygReiseFacts, trygReiseProducts, trygReiseSources } from "./tryg-reise-catalog.ts";
import { ifReiseAddOns, ifReiseFacts, ifReiseProducts, ifReiseSources } from "./if-reise-catalog.ts";
import { storebrandReiseAddOns, storebrandReiseFacts, storebrandReiseProducts, storebrandReiseSources } from "./storebrand-reise-catalog.ts";
import { gjensidigeReiseAddOns, gjensidigeReiseFacts, gjensidigeReiseProducts, gjensidigeReiseSources } from "./gjensidige-reise-catalog.ts";
import { fremtindReiseAddOns, fremtindReiseFacts, fremtindReiseProducts, fremtindReiseSources } from "./fremtind-reise-catalog.ts";
import { frendeReiseAddOns, frendeReiseFacts, frendeReiseProducts, frendeReiseSources } from "./frende-reise-catalog.ts";
import type { BuildingFactData } from "./building-facts.ts";

export type CatalogSource = {
  id: string; filename: string; termsNumber: string; effectiveFrom: string;
  company?: string; url?: string; sha256?: string;
  productCode?: string; version?: string;
  distributionChannels?: string[];
  documentName?: string; insuranceType?: string; updatedAt?: string;
  appliesTo?: string[];
};
export type CatalogFact = {
  key: string;
  label: string;
  value: string;
  structuredValue?: BuildingFactData;
  replacesBase?: boolean;
  // standard: avtalen kan endre verdien; coverage: særskilt skadetype, men
  // forrang over avtalt generell egenandel er ikke dokumentert; override:
  // uttrykkelig forrang; reference: beløpet står i forsikringsbeviset.
  deductibleClassification?: "standard" | "coverage" | "override" | "reference";
  qualificationSource?: CatalogFact["source"];
  source: { documentId: string; section: string; page: number; filename: string; termsNumber: string; effectiveFrom: string; company?: string; url?: string; note?: string; productCode?: string; version?: string };
};
export type CatalogProduct = {
  company: string;
  insuranceType: string;
  name: string;
  providerId: string;
  productId: string;
  version: string | null;
  sourceId?: string;
  componentIds?: string[];
  inheritsProductId?: string;
};
export type CatalogAddOn = {
  id: string;
  name: string;
  componentId: string;
  providerId: string;
  // null: vedlagte vilkår fastslår ikke hvilket hovednivå som kreves.
  requiresLevel: string[] | null;
  insuranceTypes?: string[];
  // Dokumenterte alternative varianter av ett tillegg kan ikke velges sammen.
  exclusiveGroup?: string;
  distributionChannels?: string[];
  excludeDistributionChannels?: string[];
};

export type ProductCatalog = {
  companies: string[];
  insuranceTypes: string[];
  products: CatalogProduct[];
  addOns?: CatalogAddOn[];
  sources?: Record<string, CatalogSource>;
  facts?: Record<string, CatalogFact[]>;
};

export const productCatalog: ProductCatalog = {
  companies: ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende"],
  insuranceTypes: ["Bil", "Hus", "Innbo", "Reise", "Ulykke", "Båt", "MC", "Hund", "Katt", "Barn", "Liv"],
  products: [...trygProducts, ...ifProducts, ...gjensidigeProducts, ...storebrandProducts,
    ...sparebank1FremtindProducts, ...dnbFremtindProducts, ...eikaFremtindProducts, ...fremtindProducts, ...frendeProducts,
    ...trygInnboProducts, ...ifInnboProducts, ...gjensidigeInnboProducts, ...storebrandInnboProducts,
    ...fremtindInnboProducts, ...frendeInnboProducts, ...trygHusProducts, ...ifHusProducts, ...storebrandHusProducts,
    ...gjensidigeHusProducts, ...fremtindHusProducts, ...frendeHusProducts, ...trygReiseProducts, ...ifReiseProducts, ...storebrandReiseProducts, ...gjensidigeReiseProducts, ...fremtindReiseProducts, ...frendeReiseProducts],
  addOns: [...trygAddOns, ...ifAddOns, ...gjensidigeAddOns, ...storebrandAddOns,
    ...sparebank1FremtindAddOns, ...dnbFremtindAddOns, ...eikaFremtindAddOns, ...fremtindAddOns, ...frendeAddOns,
    ...trygInnboAddOns, ...gjensidigeInnboAddOns, ...frendeInnboAddOns, ...trygHusAddOns, ...ifHusAddOns, ...storebrandHusAddOns,
    ...gjensidigeHusAddOns, ...fremtindHusAddOns, ...frendeHusAddOns, ...trygReiseAddOns, ...ifReiseAddOns, ...storebrandReiseAddOns, ...gjensidigeReiseAddOns, ...fremtindReiseAddOns, ...frendeReiseAddOns],
  sources: { ...trygSources, ...ifSources, ...gjensidigeSources, ...storebrandSources,
    ...sparebank1FremtindSources, ...dnbFremtindSources, ...eikaFremtindSources, ...fremtindSources, ...frendeSources,
    ...trygInnboSources, ...ifInnboSources, ...gjensidigeInnboSources, ...storebrandInnboSources,
    ...fremtindInnboSources, ...frendeInnboSources, ...trygHusSources, ...ifHusSources, ...storebrandHusSources,
    ...gjensidigeHusSources, ...fremtindHusSources, ...frendeHusSources, ...trygReiseSources, ...ifReiseSources, ...storebrandReiseSources, ...gjensidigeReiseSources, ...fremtindReiseSources, ...frendeReiseSources },
  facts: { ...trygFacts, ...ifFacts, ...gjensidigeFacts, ...storebrandFacts,
    ...sparebank1FremtindFacts, ...dnbFremtindFacts, ...eikaFremtindFacts, ...fremtindFacts, ...frendeFacts,
    ...trygInnboFacts, ...ifInnboFacts, ...gjensidigeInnboFacts, ...storebrandInnboFacts,
    ...fremtindInnboFacts, ...frendeInnboFacts, ...trygHusFacts, ...ifHusFacts, ...storebrandHusFacts,
    ...gjensidigeHusFacts, ...fremtindHusFacts, ...frendeHusFacts, ...trygReiseFacts, ...ifReiseFacts, ...storebrandReiseFacts, ...gjensidigeReiseFacts, ...fremtindReiseFacts, ...frendeReiseFacts },
};

export function productSuggestions(catalog: ProductCatalog, company: string, insuranceType: string): string[] {
  if (!company.trim() || !insuranceType.trim()) return [];
  return catalog.products
    .filter((product) =>
      product.company.toLocaleLowerCase("nb-NO") === company.trim().toLocaleLowerCase("nb-NO") &&
      product.insuranceType.toLocaleLowerCase("nb-NO") === insuranceType.trim().toLocaleLowerCase("nb-NO")
    )
    .map((product) => product.name);
}

export function findCatalogProduct(providerId: string, productId: string, version: string | null) {
  return productCatalog.products.find((product) =>
    product.providerId === providerId && product.productId === productId && product.version === version
  ) ?? null;
}

// Brukes også når klienten har mistet katalogreferansen etter feltendringer.
// Ingen fuzzy matching: flere mulige versjoner gir ingen automatisk kobling.
export function findCatalogProductBySelection(company: string, insuranceType: string, name: string) {
  const selected = productCatalog.products.filter((product) =>
    product.company.toLocaleLowerCase("nb-NO") === company.trim().toLocaleLowerCase("nb-NO") &&
    product.insuranceType.toLocaleLowerCase("nb-NO") === insuranceType.trim().toLocaleLowerCase("nb-NO") &&
    product.name.toLocaleLowerCase("nb-NO") === name.trim().toLocaleLowerCase("nb-NO")
  );
  return selected.length === 1 ? selected[0] : null;
}

export function availableAddOns(product: CatalogProduct, asOf = new Date(), distributionChannel: string | null = null): CatalogAddOn[] {
  return (productCatalog.addOns ?? []).filter((addOn) => {
    const effective = productCatalog.sources?.[addOn.componentId]?.effectiveFrom;
    return addOn.providerId === product.providerId &&
      (!addOn.insuranceTypes || addOn.insuranceTypes.includes(product.insuranceType)) &&
      (!addOn.distributionChannels || Boolean(distributionChannel && addOn.distributionChannels.includes(distributionChannel))) &&
      (!addOn.excludeDistributionChannels || !distributionChannel || !addOn.excludeDistributionChannels.includes(distributionChannel)) &&
      (!addOn.requiresLevel || addOn.requiresLevel.includes(product.productId)) &&
      (!effective || !/^\d{4}-\d{2}(?:-\d{2})?$/u.test(effective) || effective <= asOf.toISOString().slice(0, 10));
  });
}

export function resolveProductComponentIds(product: CatalogProduct): string[] {
  const visited = new Set<string>();
  const collect = (current: CatalogProduct): string[] => {
    if (visited.has(current.productId)) throw new Error("Syklisk produktarv.");
    visited.add(current.productId);
    const parent = current.inheritsProductId
      ? productCatalog.products.find((candidate) =>
        candidate.productId === current.inheritsProductId &&
        candidate.providerId === current.providerId &&
        candidate.insuranceType === current.insuranceType &&
        candidate.version === current.version)
      : null;
    if (current.inheritsProductId && !parent) throw new Error("Ukjent overordnet katalogprodukt.");
    return [...(parent ? collect(parent) : []), ...(current.componentIds ?? [])];
  };
  return collect(product);
}

function selectedComponents(product: CatalogProduct, addOnIds: string[], asOf: Date, distributionChannel: string | null): { base: string[]; additions: string[] } {
  const today = asOf.toISOString().slice(0, 10);
  const base = resolveProductComponentIds(product);
  if (base.some((id) => {
    const effective = productCatalog.sources?.[id]?.effectiveFrom ?? "";
    return /^\d{4}-\d{2}(?:-\d{2})?$/u.test(effective) && effective > today;
  })) {
    throw new Error("Produktvilkåret er ennå ikke gyldig.");
  }
  const addOns = availableAddOns(product, asOf, distributionChannel);
  const uniqueIds = [...new Set(addOnIds)];
  if (uniqueIds.length !== addOnIds.length || uniqueIds.some((id) => !addOns.some((addOn) => addOn.id === id))) {
    throw new Error("Ugyldig eller ikke gyldig tilleggsdekning.");
  }
  const groups = uniqueIds.map((id) => addOns.find((addOn) => addOn.id === id)?.exclusiveGroup).filter(Boolean);
  if (new Set(groups).size !== groups.length) throw new Error("Alternative tilleggsvarianter kan ikke velges samtidig.");
  return {
    base,
    additions: uniqueIds.map((id) => addOns.find((addOn) => addOn.id === id)!.componentId),
  };
}

export function resolveCatalogEvidence(product: CatalogProduct, addOnIds: string[], asOf = new Date(), distributionChannel: string | null = null): CatalogFact[] {
  const components = selectedComponents(product, addOnIds, asOf, distributionChannel);
  return [...components.base, ...components.additions].flatMap((component) => productCatalog.facts?.[component] ?? []);
}

export function resolveCatalogFacts(product: CatalogProduct, addOnIds: string[], asOf = new Date(), distributionChannel: string | null = null): CatalogFact[] {
  const components = selectedComponents(product, addOnIds, asOf, distributionChannel);
  const result = new Map<string, CatalogFact[]>();
  for (const component of components.base) {
    for (const entry of productCatalog.facts?.[component] ?? []) {
      const previous = result.get(entry.key) ?? [];
      result.set(entry.key, entry.replacesBase ? [entry] : [...previous, entry]);
    }
  }
  const addOnKeys = new Set<string>();
  for (const component of components.additions) {
    for (const entry of productCatalog.facts?.[component] ?? []) {
      // Bare uttrykkelig dokumenterte utvidelser erstatter grunnverdien.
      // Flere tillegg med samme nøkkel beholdes begge: kildene gir ikke
      // grunnlag for å avgjøre hvilket tillegg som skal ha forrang.
      result.set(entry.key, entry.replacesBase && !addOnKeys.has(entry.key)
        ? [entry]
        : [...(result.get(entry.key) ?? []), entry]);
      addOnKeys.add(entry.key);
    }
  }
  return [...result.values()].flat();
}
