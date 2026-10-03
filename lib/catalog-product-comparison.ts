import { catalogAgreementScope, type AgreementScopeId } from "./agreement-scope.ts";
import { coverageStatusFromText } from "./coverage-status.ts";
import { isNonAssertingCoverageDetail } from "./coverage-fact-semantics.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { conceptForFactKey, conceptsForInsurance } from "./presentation-catalog.ts";
import {
  availableAddOns,
  catalogAgreementScopeOptions,
  catalogProductIdentity,
  findCatalogProduct,
  productCatalog,
  resolveCatalogFacts,
  resolveAddOnPackage,
  type CatalogFact,
  type CatalogProduct,
  type CatalogSource,
  type ProductCatalog,
} from "./product-catalog.ts";

export type ProductCoverageState = "included" | "optional" | "unavailable" | "unknown";

export type ProductComparisonSource = CatalogFact["source"] & {
  sourceType?: CatalogSource["sourceType"];
};

export type ProductComparisonFact = {
  key: string;
  label: string;
  value: string;
  state: Exclude<ProductCoverageState, "unknown">;
  // Presence in a base component does not make a condition/exclusion a cover.
  role: "coverage" | "term";
  addOnNames: string[];
  sources: ProductComparisonSource[];
};

export type ProductComparisonValue = {
  state: ProductCoverageState;
  text: string;
  facts: ProductComparisonFact[];
  sources: ProductComparisonSource[];
};

export type ProductComparisonRow = {
  key: string;
  label: string;
  conceptId: string;
  conceptLabel: string;
  conceptTier: "primary" | "secondary" | "detail";
  first: ProductComparisonValue;
  second: ProductComparisonValue;
  different: boolean;
};

export type ProductComparisonSection = {
  id: string;
  label: string;
  tier: "primary" | "secondary" | "detail";
  rows: ProductComparisonRow[];
};

export type MaterializedCatalogProduct = {
  product: CatalogProduct;
  facts: ProductComparisonFact[];
};

export type CatalogProductComparison = {
  insuranceType: string;
  first: MaterializedCatalogProduct;
  second: MaterializedCatalogProduct;
  sections: ProductComparisonSection[];
  importantSections: ProductComparisonSection[];
  differenceCount: number;
};

const customerSpecificKey = /^(?:premie\.|bonus\.|kjoretoy\.(?:kjorelengde|kilometerstand|registreringsnummer|vin)\b|objekt\.)/u;
const historicalMarker = /(?:historisk|utgatt|utgått|legacy)/iu;

const normalizeText = (value: string) => value.normalize("NFKC")
  .toLocaleLowerCase("nb-NO").replace(/\s+/gu, " ").trim();

function uniqueSources(sources: readonly ProductComparisonSource[]): ProductComparisonSource[] {
  return sources.filter((source, index) => sources.findIndex((candidate) =>
    candidate.documentId === source.documentId && candidate.page === source.page &&
    candidate.section === source.section
  ) === index);
}

function factIdentity(fact: CatalogFact): string {
  return JSON.stringify([fact.key, normalizeText(fact.value), fact.source.documentId,
    fact.source.page, fact.source.section]);
}

function sourceForFact(fact: CatalogFact, catalog: ProductCatalog): ProductComparisonSource {
  return { ...fact.source, sourceType: catalog.sources?.[fact.source.documentId]?.sourceType };
}

function productFact(
  fact: CatalogFact,
  state: Exclude<ProductCoverageState, "unknown">,
  catalog: ProductCatalog,
  addOnNames: string[] = [],
): ProductComparisonFact {
  return { key: fact.key, label: fact.label, value: fact.value, state, addOnNames,
    role: !isNonAssertingCoverageDetail(fact.key) && (fact.coverageAvailability || fact.key.endsWith(".dekning")) ? "coverage" : "term",
    sources: [sourceForFact(fact, catalog)] };
}

export function productCoverageStateLabel(state: ProductCoverageState): string {
  if (state === "included") return "✓ Inkludert";
  if (state === "optional") return "Tilgjengelig som tillegg";
  if (state === "unavailable") return "Ikke inkludert / ikke tilgjengelig";
  return "Ikke dokumentert i kataloggrunnlaget";
}

export function isHistoricalCatalogProduct(product: CatalogProduct): boolean {
  return historicalMarker.test(`${product.name} ${product.productId}`);
}

function canMaterialize(product: CatalogProduct, catalog: ProductCatalog): boolean {
  if (isHistoricalCatalogProduct(product)) return false;
  try {
    const facts = resolveCatalogFacts(product, [], new Date(), null, catalog);
    return facts.length > 0 && facts.every((fact) => Boolean(fact.source.documentId));
  } catch {
    return false;
  }
}

export function productComparisonProducts(catalog: ProductCatalog = productCatalog): CatalogProduct[] {
  return catalog.products.filter((product) => canMaterialize(product, catalog));
}

export function productComparisonInsuranceTypes(catalog: ProductCatalog = productCatalog): string[] {
  const available = new Set(productComparisonProducts(catalog).map((product) =>
    normalizeInsuranceType(product.insuranceType)));
  return catalog.insuranceTypes.filter((type, index, types) =>
    available.has(normalizeInsuranceType(type)) &&
    types.findIndex((candidate) => normalizeInsuranceType(candidate) === normalizeInsuranceType(type)) === index);
}

export function productComparisonProviders(
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): string[] {
  const canonicalType = normalizeInsuranceType(insuranceType);
  return [...new Set(productComparisonProducts(catalog)
    .filter((product) => normalizeInsuranceType(product.insuranceType) === canonicalType)
    .map((product) => product.company))];
}

export function productComparisonScopes(
  insuranceType: string,
  company: string,
  catalog: ProductCatalog = productCatalog,
): { id: AgreementScopeId; name: string }[] {
  const eligible = new Set(productComparisonProducts(catalog).map(catalogProductIdentity));
  return catalogAgreementScopeOptions({ ...catalog,
    products: catalog.products.filter((product) => eligible.has(catalogProductIdentity(product))) }, company, insuranceType);
}

export function productComparisonOptions(
  insuranceType: string,
  company: string,
  agreementScope?: AgreementScopeId | null,
  catalog: ProductCatalog = productCatalog,
): CatalogProduct[] {
  const canonicalType = normalizeInsuranceType(insuranceType);
  const candidates = productComparisonProducts(catalog).filter((product) =>
    normalizeInsuranceType(product.insuranceType) === canonicalType && product.company === company);
  const scopes = new Set(candidates.map(catalogAgreementScope));
  if (agreementScope == null && scopes.size !== 1) return [];
  const scope = agreementScope ?? [...scopes][0];
  return candidates.filter((product) => catalogAgreementScope(product) === scope);
}

export function findProductComparisonProduct(
  identity: string,
  catalog: ProductCatalog = productCatalog,
): CatalogProduct | null {
  const product = productComparisonProducts(catalog).find((candidate) =>
    catalogProductIdentity(candidate) === identity);
  if (!product) return null;
  return findCatalogProduct(product.providerId, product.productId, product.version, {
    insuranceType: product.insuranceType,
    agreementScope: catalogAgreementScope(product),
  }, catalog);
}

export function materializeCatalogProduct(
  product: CatalogProduct,
  catalog: ProductCatalog = productCatalog,
): MaterializedCatalogProduct {
  if (!canMaterialize(product, catalog)) throw new Error("Katalogproduktet kan ikke sammenlignes sikkert.");
  const baseFacts = resolveCatalogFacts(product, [], new Date(), null, catalog)
    .filter((fact) => !customerSpecificKey.test(fact.key));
  const baseIdentities = new Set(baseFacts.map(factIdentity));
  const facts: ProductComparisonFact[] = baseFacts.map((fact) => productFact(
    fact,
    fact.coverageAvailability ?? (isNonAssertingCoverageDetail(fact.key) ? "included" :
      coverageStatusFromText(fact.value, { subject: fact.label, productName: product.name }) === "not_selected"
        ? "unavailable" : "included"),
    catalog,
  ));

  for (const addOn of availableAddOns(product, new Date(), null, catalog)) {
    const packageIds = resolveAddOnPackage(product, addOn.id, new Date(), null, catalog);
    const withAddOn = resolveCatalogFacts(product, packageIds, new Date(), null, catalog);
    const ownIdentities = addOn.requiresAddOnIds?.length
      ? new Set((catalog.facts?.[addOn.componentId] ?? []).map(factIdentity)) : null;
    for (const fact of withAddOn) {
      if (ownIdentities && !ownIdentities.has(factIdentity(fact))) continue;
      if (customerSpecificKey.test(fact.key) || baseIdentities.has(factIdentity(fact))) continue;
      const existing = facts.find((candidate) => candidate.key === fact.key &&
        normalizeText(candidate.value) === normalizeText(fact.value) && candidate.state === "optional");
      if (existing) {
        if (!existing.addOnNames.includes(addOn.name)) existing.addOnNames.push(addOn.name);
        existing.sources = uniqueSources([...existing.sources, sourceForFact(fact, catalog)]);
      } else {
        facts.push(productFact(fact, "optional", catalog, [addOn.name]));
      }
    }
  }
  return { product, facts };
}

function valueForKey(facts: ProductComparisonFact[]): ProductComparisonValue {
  if (!facts.length) return { state: "unknown", text: productCoverageStateLabel("unknown"), facts: [], sources: [] };
  const included = facts.filter((fact) => fact.state === "included");
  const unavailable = facts.filter((fact) => fact.state === "unavailable");
  const optional = facts.filter((fact) => fact.state === "optional");
  const selected = included.length ? included : unavailable.length ? unavailable : optional;
  const state: ProductCoverageState = included.length ? "included" : unavailable.length ? "unavailable" : "optional";
  const values = [...new Set(selected.map((fact) => fact.value.trim()).filter(Boolean))];
  const addOns = [...new Set(selected.flatMap((fact) => fact.addOnNames))];
  const suffix = values.length ? ` – ${values.join(" · ")}` : "";
  const addOnSuffix = state === "optional" && addOns.length ? ` (${addOns.join(" / ")})` : "";
  // Conditions retain their original wording; they are not presented as an
  // independent assertion that the subject coverage is included. Explicit negative
  // and optional states retain their established presentation.
  const isTerm = selected.every((fact) => fact.role === "term");
  const text = isTerm && state === "included" ? values.join(" · ") :
    `${productCoverageStateLabel(state)}${addOnSuffix}${suffix}`;
  return { state, text,
    facts: selected, sources: uniqueSources(selected.flatMap((fact) => fact.sources)) };
}

function comparableValue(value: ProductComparisonValue): string {
  return JSON.stringify([value.state, [...new Set(value.facts.map((fact) => normalizeText(fact.value)))].sort(),
    [...new Set(value.facts.flatMap((fact) => fact.addOnNames.map(normalizeText)))].sort()]);
}

export function compareCatalogProducts(
  firstProduct: CatalogProduct,
  secondProduct: CatalogProduct,
  catalog: ProductCatalog = productCatalog,
): CatalogProductComparison {
  const firstType = normalizeInsuranceType(firstProduct.insuranceType);
  const secondType = normalizeInsuranceType(secondProduct.insuranceType);
  if (firstType !== secondType) throw new Error("Produktene må ha samme forsikringstype.");
  const first = materializeCatalogProduct(firstProduct, catalog);
  const second = materializeCatalogProduct(secondProduct, catalog);
  const keys = [...new Set([...first.facts, ...second.facts].map((fact) => fact.key))];
  const rows = keys.map((key): ProductComparisonRow => {
    const leftFacts = first.facts.filter((fact) => fact.key === key);
    const rightFacts = second.facts.filter((fact) => fact.key === key);
    const left = valueForKey(leftFacts);
    const right = valueForKey(rightFacts);
    const concept = conceptForFactKey(firstType, key);
    return {
      key,
      label: leftFacts[0]?.label ?? rightFacts[0]?.label ?? key,
      conceptId: concept?.id ?? `${firstType}.ufordelt.${key}`,
      conceptLabel: concept?.label ?? leftFacts[0]?.label ?? rightFacts[0]?.label ?? key,
      conceptTier: concept?.defaultTier ?? "detail",
      first: left,
      second: right,
      different: comparableValue(left) !== comparableValue(right),
    };
  });
  const conceptOrder = new Map(conceptsForInsurance(firstType).map((concept, index) => [concept.id, index]));
  const sections = [...new Set(rows.map((row) => row.conceptId))].map((id) => {
    const sectionRows = rows.filter((row) => row.conceptId === id);
    return { id, label: sectionRows[0].conceptLabel, tier: sectionRows[0].conceptTier, rows: sectionRows };
  }).sort((a, b) => (conceptOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
    (conceptOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER));
  return {
    insuranceType: firstProduct.insuranceType,
    first,
    second,
    sections,
    importantSections: sections.flatMap((section) => {
      const differences = section.rows.filter((row) => row.different);
      return differences.length && section.tier !== "detail" ? [{ ...section, rows: differences }] : [];
    }),
    differenceCount: rows.filter((row) => row.different).length,
  };
}
