import { vehicleObjectProducts, vehicleObjectFacts, vehicleObjectAddOns, vehicleObjectSources } from "./vehicle-object-catalog.ts";
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
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { resolveCatalogSources } from "./catalog-source-resolution.ts";
import { catalogFactScopeApplies } from "./catalog-source-resolution.ts";
import { catalogAgreementScope, isRegisteredAgreementScope, productsInAgreementScope, type AgreementScopeId, type AgreementScopeDefinition } from "./agreement-scope.ts";

export type CatalogSource = {
  agreementScope?: AgreementScopeId;
  id: string; filename: string; termsNumber: string; effectiveFrom: string;
  company?: string; url?: string; sha256?: string;
  productCode?: string; version?: string;
  distributionChannels?: string[];
  documentName?: string; insuranceType?: string; updatedAt?: string;
  appliesTo?: string[];
  // Unlike legacy appliesTo (display names), these are canonical product IDs.
  productIds?: string[];
  sourceType?: "full_terms" | "ipid" | "product_page";
  validTo?: string;
  providerId?: string;
  productVersion?: string;
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
  source: { documentId: string; section: string; page: number; filename: string; termsNumber: string; effectiveFrom: string; company?: string; url?: string; note?: string; productCode?: string; version?: string; agreementScope?: AgreementScopeId };
};
export type CatalogProduct = {
  agreementScope?: AgreementScopeId;
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
  agreementScope?: AgreementScopeId;
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
  agreementScopes?: AgreementScopeDefinition[];
  companies: string[];
  insuranceTypes: string[];
  products: CatalogProduct[];
  addOns?: CatalogAddOn[];
  sources?: Record<string, CatalogSource>;
  facts?: Record<string, CatalogFact[]>;
};

export const productCatalog: ProductCatalog = {
  companies: ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende"],
  insuranceTypes: ["Snøscooter", "Campingvogn", "Tilhenger", "Bil", "Hus", "Innbo", "Reise", "Ulykke", "Båt", "MC", "Hund", "Katt", "Barn", "Liv"],
  products: [...trygProducts, ...ifProducts, ...gjensidigeProducts, ...storebrandProducts,
    ...sparebank1FremtindProducts, ...dnbFremtindProducts, ...eikaFremtindProducts, ...fremtindProducts, ...frendeProducts,
    ...trygInnboProducts, ...ifInnboProducts, ...gjensidigeInnboProducts, ...storebrandInnboProducts,
    ...fremtindInnboProducts, ...frendeInnboProducts, ...trygHusProducts, ...ifHusProducts, ...storebrandHusProducts,
    ...gjensidigeHusProducts, ...fremtindHusProducts, ...frendeHusProducts, ...trygReiseProducts, ...ifReiseProducts, ...storebrandReiseProducts, ...gjensidigeReiseProducts, ...fremtindReiseProducts, ...frendeReiseProducts, ...vehicleObjectProducts],
  addOns: [...vehicleObjectAddOns, ...trygAddOns, ...ifAddOns, ...gjensidigeAddOns, ...storebrandAddOns,
    ...sparebank1FremtindAddOns, ...dnbFremtindAddOns, ...eikaFremtindAddOns, ...fremtindAddOns, ...frendeAddOns,
    ...trygInnboAddOns, ...gjensidigeInnboAddOns, ...frendeInnboAddOns, ...trygHusAddOns, ...ifHusAddOns, ...storebrandHusAddOns,
    ...gjensidigeHusAddOns, ...fremtindHusAddOns, ...frendeHusAddOns, ...trygReiseAddOns, ...ifReiseAddOns, ...storebrandReiseAddOns, ...gjensidigeReiseAddOns, ...fremtindReiseAddOns, ...frendeReiseAddOns],
  sources: { ...vehicleObjectSources, ...trygSources, ...ifSources, ...gjensidigeSources, ...storebrandSources,
    ...sparebank1FremtindSources, ...dnbFremtindSources, ...eikaFremtindSources, ...fremtindSources, ...frendeSources,
    ...trygInnboSources, ...ifInnboSources, ...gjensidigeInnboSources, ...storebrandInnboSources,
    ...fremtindInnboSources, ...frendeInnboSources, ...trygHusSources, ...ifHusSources, ...storebrandHusSources,
    ...gjensidigeHusSources, ...fremtindHusSources, ...frendeHusSources, ...trygReiseSources, ...ifReiseSources, ...storebrandReiseSources, ...gjensidigeReiseSources, ...fremtindReiseSources, ...frendeReiseSources },
  facts: { ...vehicleObjectFacts, ...trygFacts, ...ifFacts, ...gjensidigeFacts, ...storebrandFacts,
    ...sparebank1FremtindFacts, ...dnbFremtindFacts, ...eikaFremtindFacts, ...fremtindFacts, ...frendeFacts,
    ...trygInnboFacts, ...ifInnboFacts, ...gjensidigeInnboFacts, ...storebrandInnboFacts,
    ...fremtindInnboFacts, ...frendeInnboFacts, ...trygHusFacts, ...ifHusFacts, ...storebrandHusFacts,
    ...gjensidigeHusFacts, ...fremtindHusFacts, ...frendeHusFacts, ...trygReiseFacts, ...ifReiseFacts, ...storebrandReiseFacts, ...gjensidigeReiseFacts, ...fremtindReiseFacts, ...frendeReiseFacts },
};

const normalizeIdentity = (value: string) => value.normalize("NFKC")
  .toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

// Juridiske navn kobles eksplisitt til katalogens presentasjonsnavn. Vi
// fjerner ikke selskapsendelser generelt, fordi det kan gi usikre treff.
const companyAliases: Readonly<Record<string, string>> = {
  "gjensidige forsikring asa": "gjensidige",
  "eika": "eika fremtind",
};

function canonicalCompanyIdentity(value: string): string {
  const normalized = normalizeIdentity(value);
  return companyAliases[normalized] ?? normalized;
}

export function canonicalProviderId(company: string, catalog: ProductCatalog = productCatalog): string | null {
  const companyIdentity = canonicalCompanyIdentity(company);
  const providerIds = new Set(catalog.products
    .filter((product) => canonicalCompanyIdentity(product.company) === companyIdentity)
    .map((product) => product.providerId));
  return providerIds.size === 1 ? [...providerIds][0] : null;
}

export function agreementScopeAllowed(company: string | null, scope: unknown, catalog: ProductCatalog = productCatalog): scope is AgreementScopeId {
  if (scope === "ordinary") return true;
  if (!company) return false;
  return catalog.products.some(product => canonicalCompanyIdentity(product.company) === canonicalCompanyIdentity(company) &&
    isRegisteredAgreementScope(scope, catalog.agreementScopes, product.providerId));
}

export function catalogAgreementScopeOptions(catalog: ProductCatalog, company: string, insuranceType: string): { id: AgreementScopeId; name: string }[] {
  const products = catalog.products.filter(product => canonicalCompanyIdentity(product.company) === canonicalCompanyIdentity(company) &&
    normalizeInsuranceType(product.insuranceType) === normalizeInsuranceType(insuranceType));
  return [...new Set(products.map(catalogAgreementScope))].flatMap(id => {
    if (id === "ordinary") return [{ id, name: "Ordinær privatavtale" }];
    const definition = catalog.agreementScopes?.find(scope => scope.id === id && products.some(product => product.providerId === scope.providerId && product.agreementScope === id));
    return definition && isRegisteredAgreementScope(id, [definition]) ? [{ id, name: definition.name }] : [];
  });
}

// For compatibility checks between document records (not catalog enrichment).
// Uncatalogued legacy products retain their prior ordinary compatibility;
// providers/types with several scopes require explicit document scope.
export function resolvedAgreementScope(company: string | null, insuranceType: string, agreementScope?: AgreementScopeId | null, catalog: ProductCatalog = productCatalog): AgreementScopeId | null {
  if (agreementScope != null) return agreementScopeAllowed(company, agreementScope, catalog) ? agreementScope : null;
  const scopes = company ? catalogAgreementScopeOptions(catalog, company, insuranceType) : [];
  return scopes.length > 1 ? null : scopes[0]?.id ?? "ordinary";
}

export function catalogProductMatchesSelection(
  product: CatalogProduct,
  company: string,
  insuranceType: string,
  name: string,
  agreementScope?: AgreementScopeId | null,
  catalog: ProductCatalog = productCatalog,
): boolean {
  // This predicate also accepts standalone catalog records. Include the record
  // without bypassing ambiguity checks against other registered scopes.
  return catalogProductsForSelection({ ...catalog, products: [...catalog.products, product] }, company,
    normalizeInsuranceType(insuranceType, { productName: name }), agreementScope)
    .includes(product) &&
    normalizeIdentity(product.name) === normalizeIdentity(name);
}

export function productSuggestions(catalog: ProductCatalog, company: string, insuranceType: string, agreementScope?: AgreementScopeId | null): string[] {
  return [...new Set(catalogProductsForSelection(catalog, company, insuranceType, agreementScope)
    .map((product) => product.name))];
}

export function catalogProductsForSelection(
  catalog: ProductCatalog,
  company: string,
  insuranceType: string,
  agreementScope?: AgreementScopeId | null,
): CatalogProduct[] {
  if (!company.trim() || !insuranceType.trim()) return [];
  const candidates = catalog.products
    .filter((product) => canonicalCompanyIdentity(product.company) === canonicalCompanyIdentity(company) &&
      normalizeInsuranceType(product.insuranceType, { productName: product.name }) ===
        normalizeInsuranceType(insuranceType));
  return productsInAgreementScope(candidates.filter(product =>
    isRegisteredAgreementScope(catalogAgreementScope(product), catalog.agreementScopes, product.providerId)), agreementScope);
}

export type CatalogProductReference = {
  providerId: string; productId: string; version: string | null;
  insuranceType?: string;
  agreementScope?: AgreementScopeId | null;
};
export type CatalogLookupScope = Pick<CatalogProductReference, "insuranceType" | "agreementScope">;

export function catalogProductIdentity(product: CatalogProduct): string {
  return JSON.stringify([product.providerId, normalizeInsuranceType(product.insuranceType),
    catalogAgreementScope(product), product.productId, product.version]);
}

export function catalogReferenceForProduct(product: CatalogProduct): CatalogProductReference {
  return { providerId: product.providerId, productId: product.productId, version: product.version,
    ...(product.agreementScope !== undefined ? { insuranceType: normalizeInsuranceType(product.insuranceType), agreementScope: product.agreementScope } : {}) };
}

export function findCatalogProduct(providerId: string, productId: string, version: string | null, scope: CatalogLookupScope = {}, catalog: ProductCatalog = productCatalog) {
  const candidates = catalog.products.filter(product => product.providerId === providerId && product.productId === productId &&
    product.version === version && (!scope.insuranceType || normalizeInsuranceType(product.insuranceType) === normalizeInsuranceType(scope.insuranceType)) &&
    isRegisteredAgreementScope(catalogAgreementScope(product), catalog.agreementScopes, providerId));
  const selected = productsInAgreementScope(candidates, scope.agreementScope);
  return selected.length === 1 ? selected[0] : null;
}

// Brukes også når klienten har mistet katalogreferansen etter feltendringer.
// Ingen fuzzy matching: flere mulige versjoner gir ingen automatisk kobling.
export function findCatalogProductBySelection(company: string, insuranceType: string, name: string, agreementScope?: AgreementScopeId | null, catalog: ProductCatalog = productCatalog) {
  if (!company.trim() || !insuranceType.trim() || !name.trim()) return null;
  const selected = catalogProductsForSelection(catalog, company, normalizeInsuranceType(insuranceType, { productName: name }), agreementScope)
    .filter(product => normalizeIdentity(product.name) === normalizeIdentity(name));
  return selected.length === 1 ? selected[0] : null;
}

const disconnectedCatalogStatus =
  "Ikke koblet til vilkårskatalogen – sammenligningen bygger bare på registrerte opplysninger og kan være ufullstendig";

export function catalogConnectionStatus(insurances: readonly {
  catalogReference?: CatalogProductReference | null;
}[]): string {
  if (insurances.length === 0) return disconnectedCatalogStatus;
  const products = insurances.map((insurance) => insurance.catalogReference
    ? findCatalogProduct(
      insurance.catalogReference.providerId,
      insurance.catalogReference.productId,
      insurance.catalogReference.version,
      insurance.catalogReference,
    )
    : null);
  if (products.some((product) => product === null)) return disconnectedCatalogStatus;
  const labels = [...new Set(products.map((product) =>
    `${product!.company} ${product!.insuranceType} ${product!.name}`))];
  return labels.length === 1
    ? `✓ Koblet til ${labels[0]}`
    : "✓ Koblet til vilkårskatalogen";
}

export function availableAddOns(product: CatalogProduct, asOf = new Date(), distributionChannel: string | null = null, catalog: ProductCatalog = productCatalog): CatalogAddOn[] {
  return (catalog.addOns ?? []).filter((addOn) => {
    const source = catalog.sources?.[addOn.componentId];
    const effective = source?.effectiveFrom;
    return addOn.providerId === product.providerId &&
      catalogAgreementScope(addOn) === catalogAgreementScope(product) &&
      (!source || catalogAgreementScope(source) === catalogAgreementScope(product)) &&
      (!addOn.insuranceTypes || addOn.insuranceTypes.includes(product.insuranceType)) &&
      (!addOn.distributionChannels || Boolean(distributionChannel && addOn.distributionChannels.includes(distributionChannel))) &&
      (!addOn.excludeDistributionChannels || !distributionChannel || !addOn.excludeDistributionChannels.includes(distributionChannel)) &&
      (!addOn.requiresLevel || addOn.requiresLevel.includes(product.productId)) &&
      (!effective || !/^\d{4}-\d{2}(?:-\d{2})?$/u.test(effective) || effective <= asOf.toISOString().slice(0, 10));
  });
}

export function resolveProductComponentIds(product: CatalogProduct, catalog: ProductCatalog = productCatalog): string[] {
  const visited = new Set<string>();
  const collect = (current: CatalogProduct): string[] => {
    const identity = catalogProductIdentity(current);
    if (visited.has(identity)) throw new Error("Syklisk produktarv.");
    visited.add(identity);
    const parents = current.inheritsProductId
      ? catalog.products.filter((candidate) =>
        candidate.productId === current.inheritsProductId &&
        candidate.providerId === current.providerId &&
        normalizeInsuranceType(candidate.insuranceType) === normalizeInsuranceType(current.insuranceType) &&
        catalogAgreementScope(candidate) === catalogAgreementScope(current) &&
        candidate.version === current.version)
      : [];
    const parent = parents.length === 1 ? parents[0] : null;
    if (current.inheritsProductId && !parent) throw new Error("Ukjent overordnet katalogprodukt.");
    return [...(parent ? collect(parent) : []), ...(current.componentIds ?? [])];
  };
  return collect(product);
}

function selectedComponents(product: CatalogProduct, addOnIds: string[], asOf: Date, distributionChannel: string | null, catalog: ProductCatalog): { base: string[]; additions: string[] } {
  const today = asOf.toISOString().slice(0, 10);
  const base = resolveProductComponentIds(product, catalog);
  if (base.some((id) => {
    const effective = catalog.sources?.[id]?.effectiveFrom ?? "";
    return /^\d{4}-\d{2}(?:-\d{2})?$/u.test(effective) && effective > today;
  })) {
    throw new Error("Produktvilkåret er ennå ikke gyldig.");
  }
  const addOns = availableAddOns(product, asOf, distributionChannel, catalog);
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

export function resolveCatalogEvidence(product: CatalogProduct, addOnIds: string[], asOf = new Date(), distributionChannel: string | null = null, catalog: ProductCatalog = productCatalog): CatalogFact[] {
  const components = selectedComponents(product, addOnIds, asOf, distributionChannel, catalog);
  return [...components.base, ...components.additions].flatMap((component) => catalog.facts?.[component] ?? [])
    .filter(fact => catalogFactScopeApplies(fact, catalog.sources ?? {}, product));
}

export function resolveCatalogFacts(product: CatalogProduct, addOnIds: string[], asOf = new Date(), distributionChannel: string | null = null, catalog: ProductCatalog = productCatalog): CatalogFact[] {
  const components = selectedComponents(product, addOnIds, asOf, distributionChannel, catalog);
  const result = new Map<string, CatalogFact[]>();
  for (const component of components.base) {
    for (const entry of catalog.facts?.[component] ?? []) {
      if (!catalogFactScopeApplies(entry, catalog.sources ?? {}, product)) continue;
      const previous = result.get(entry.key) ?? [];
      result.set(entry.key, entry.replacesBase ? [entry] : [...previous, entry]);
    }
  }
  const addOnKeys = new Set<string>();
  for (const component of components.additions) {
    for (const entry of catalog.facts?.[component] ?? []) {
      if (!catalogFactScopeApplies(entry, catalog.sources ?? {}, product)) continue;
      // Bare uttrykkelig dokumenterte utvidelser erstatter grunnverdien.
      // Flere tillegg med samme nøkkel beholdes begge: kildene gir ikke
      // grunnlag for å avgjøre hvilket tillegg som skal ha forrang.
      result.set(entry.key, entry.replacesBase && !addOnKeys.has(entry.key)
        ? [entry]
        : [...(result.get(entry.key) ?? []), entry]);
      addOnKeys.add(entry.key);
    }
  }
  return resolveCatalogSources([...result.values()].flat(), catalog.sources ?? {}, product, asOf).facts;
}
