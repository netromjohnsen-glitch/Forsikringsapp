import { catalogAgreementScope, type AgreementScopeId } from "./agreement-scope.ts";
import { catalogFactSources, catalogSourceIdentity } from "./catalog-enrichment.ts";
import { alignComparisonRow, comparisonRowHeading, comparisonRowKey } from "./catalog-comparison-row-alignment.ts";
import { coverageStatusFromText } from "./coverage-status.ts";
import { isReviewedMarketExclusion, reviewedRentalLimitExclusion } from "./catalog-market-coverage-exclusions.ts";
import { isNonAssertingCoverageDetail } from "./coverage-fact-semantics.ts";
import { expandReviewedMarketRow } from "./catalog-reviewed-row-dimensions.ts";
import { criticalIllnessComparisonDiagnoses, diagnosisNotListed, isCriticalIllnessDiagnosisKey } from "./critical-illness-comparison.ts";
import { canonicalInsuranceTypeLabel, normalizeInsuranceType } from "./insurance-normalization.ts";
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
  state: ProductCoverageState;
  // Presence in a base component does not make a condition/exclusion a cover.
  role: "coverage" | "term";
  addOnNames: string[];
  sources: ProductComparisonSource[];
};

type ComparisonValueDescription = {
  text: string;
  facts: ProductComparisonFact[];
  sources: ProductComparisonSource[];
};

export type ProductComparisonValue = ComparisonValueDescription & {
  state: ProductCoverageState;
  optionalAlternative?: ComparisonValueDescription;
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
  diagnosisListSource?: ProductComparisonSource;
};

export type CatalogProductComparison = {
  insuranceType: string;
  first: MaterializedCatalogProduct;
  second: MaterializedCatalogProduct;
  sections: ProductComparisonSection[];
  importantSections: ProductComparisonSection[];
  differenceCount: number;
  stableHeadings?: true;
};

const customerSpecificKey = /^(?:premie\.|bonus\.|kjoretoy\.(?:kjorelengde|kilometerstand|registreringsnummer|vin)\b|objekt\.)/u;
const historicalMarker = /(?:historisk|utgatt|utgått|legacy)/iu;

const normalizeText = (value: string) => value.normalize("NFKC")
  .toLocaleLowerCase("nb-NO").replace(/\s+/gu, " ").trim();

function uniqueSources(sources: readonly ProductComparisonSource[]): ProductComparisonSource[] {
  return sources.filter((source, index) => sources.findIndex((candidate) =>
    catalogSourceIdentity(candidate) === catalogSourceIdentity(source)
  ) === index);
}

function factIdentity(fact: CatalogFact): string {
  return JSON.stringify([fact.key, normalizeText(fact.value), fact.source.documentId,
    fact.source.page, fact.source.section]);
}

function sourcesForFact(fact: CatalogFact, catalog: ProductCatalog): ProductComparisonSource[] {
  return catalogFactSources(fact).map((source) => {
    const registered = catalog.sources?.[source.documentId];
    const currentUrl = registered?.previousUrl && source.url === registered.previousUrl &&
      source.effectiveFrom === registered.effectiveFrom ? registered.url : undefined;
    return {
      ...source,
      ...(currentUrl && { url: currentUrl }),
      sourceType: registered?.sourceType,
    };
  });
}

function productFact(
  fact: CatalogFact,
  state: Exclude<ProductCoverageState, "unknown">,
  catalog: ComparisonCatalog,
  addOnNames: string[] = [],
): ProductComparisonFact {
  const unresolved = catalog.alignComparisonRows && fact.requiresSourceClarification;
  return { key: fact.key, label: fact.label, value: fact.value, state: unresolved ? "unknown" : state, addOnNames,
    role: !unresolved && !isNonAssertingCoverageDetail(fact.key) &&
      (fact.coverageAvailability || fact.key.endsWith(".dekning")) ? "coverage" : "term",
    sources: sourcesForFact(fact, catalog) };
}

export const unresolvedProductCoverageLabel = "Uavklart i kildene";

export function productCoverageStateLabel(state: ProductCoverageState): string {
  if (state === "included") return "✓ Inkludert";
  if (state === "optional") return "Tilgjengelig som tillegg";
  if (state === "unavailable") return "Ikke inkludert / ikke tilgjengelig";
  return "Ikke dokumentert i kataloggrunnlaget";
}

export function isHistoricalCatalogProduct(product: CatalogProduct): boolean {
  return historicalMarker.test(`${product.name} ${product.productId}`);
}

type ComparisonCatalog = ProductCatalog & {
  alignComparisonRows?: boolean;
  eligibleComparisonProducts?: CatalogProduct[];
};

function canMaterialize(product: CatalogProduct, catalog: ProductCatalog, asOf = new Date()): boolean {
  if (isHistoricalCatalogProduct(product)) return false;
  try {
    const facts = resolveCatalogFacts(product, [], asOf, null, catalog);
    return facts.length > 0 && facts.every((fact) => Boolean(fact.source.documentId));
  } catch {
    return false;
  }
}

export function productComparisonProducts(catalog: ComparisonCatalog = productCatalog): CatalogProduct[] {
  return catalog.eligibleComparisonProducts ?? catalog.products.filter((product) => canMaterialize(product, catalog));
}

// The interactive picker uses one eligibility snapshot. Comparing the selected
// policies still resolves the full catalogue with current source validity.
export function prepareProductComparisonPicker(catalog: ComparisonCatalog, asOf: Date): ComparisonCatalog {
  return { ...catalog, eligibleComparisonProducts: catalog.products.filter((product) => canMaterialize(product, catalog, asOf)) };
}

export function productComparisonInsuranceTypes(catalog: ComparisonCatalog = productCatalog): string[] {
  const available = new Set(productComparisonProducts(catalog).map((product) =>
    normalizeInsuranceType(product.insuranceType)));
  return catalog.insuranceTypes.filter((type, index, types) =>
    available.has(normalizeInsuranceType(type)) &&
    types.findIndex((candidate) => normalizeInsuranceType(candidate) === normalizeInsuranceType(type)) === index);
}

export function productComparisonProviders(
  insuranceType: string,
  catalog: ComparisonCatalog = productCatalog,
): string[] {
  const canonicalType = normalizeInsuranceType(insuranceType);
  return [...new Set(productComparisonProducts(catalog)
    .filter((product) => normalizeInsuranceType(product.insuranceType) === canonicalType)
    .map((product) => product.company))];
}

export function productComparisonScopes(
  insuranceType: string,
  company: string,
  catalog: ComparisonCatalog = productCatalog,
): { id: AgreementScopeId; name: string }[] {
  const eligible = new Set(productComparisonProducts(catalog).map(catalogProductIdentity));
  return catalogAgreementScopeOptions({ ...catalog,
    products: catalog.products.filter((product) => eligible.has(catalogProductIdentity(product))) }, company, insuranceType);
}

export function productComparisonOptions(
  insuranceType: string,
  company: string,
  agreementScope?: AgreementScopeId | null,
  catalog: ComparisonCatalog = productCatalog,
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
  catalog: ComparisonCatalog = productCatalog,
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
  catalog: ComparisonCatalog = productCatalog,
): MaterializedCatalogProduct {
  if (!canMaterialize(product, catalog)) throw new Error("Katalogproduktet kan ikke sammenlignes sikkert.");
  const date = new Date();
  const source = product.sourceId ? catalog.sources?.[product.sourceId] : undefined;
  const diagnoses = criticalIllnessComparisonDiagnoses(product, source, date);
  const baseFacts = resolveCatalogFacts(product, [], date, null, catalog)
    .filter((fact) => !customerSpecificKey.test(fact.key));
  const baseIdentities = new Set(baseFacts.map(factIdentity));
  const facts: ProductComparisonFact[] = baseFacts
    .filter(fact => !(diagnoses && isCriticalIllnessDiagnosisKey(fact.key)))
    .map((fact) => productFact(
    fact,
    fact.coverageAvailability ?? (catalog.alignComparisonRows && isReviewedMarketExclusion(fact) ? "unavailable" :
      isNonAssertingCoverageDetail(fact.key) ? "included" :
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
      const option = productFact(fact, "optional", catalog, [addOn.name]);
      const existing = facts.find((candidate) => candidate.key === option.key &&
        normalizeText(candidate.value) === normalizeText(option.value) && candidate.state === option.state);
      if (existing) {
        if (!existing.addOnNames.includes(addOn.name)) existing.addOnNames.push(addOn.name);
        existing.sources = uniqueSources([...existing.sources, ...option.sources]);
      } else {
        facts.push(option);
      }
    }
  }
  if (diagnoses) facts.push(...diagnoses.facts);
  return {
    product,
    facts: catalog.alignComparisonRows ? facts.flatMap(fact => expandReviewedMarketRow(product, fact)).map(fact => alignComparisonRow(product, fact)) : facts,
    ...(diagnoses && { diagnosisListSource: diagnoses.listSource }),
  };
}

function describeOptionalChoices(facts: ProductComparisonFact[]): string | null {
  const groups = new Map<string, { names: string[]; values: Set<string> }>();
  const optionalValues = new Set<string>();
  for (const fact of facts) {
    const value = fact.value.trim();
    if (fact.state !== "optional" || !fact.addOnNames.length || !value) continue;
    const key = JSON.stringify([...new Set(fact.addOnNames)].sort());
    const group = groups.get(key) ?? { names: fact.addOnNames, values: new Set<string>() };
    group.values.add(value);
    groups.set(key, group);
    optionalValues.add(value);
  }
  if (groups.size < 2 || optionalValues.size < 2) return null;
  const otherValues = [...new Set(facts.filter((fact) => fact.state !== "optional" || !fact.addOnNames.length)
    .map((fact) => fact.value.trim()).filter(Boolean))];
  return [productCoverageStateLabel("optional"),
    ...Array.from(groups.values(), ({ names, values }) => names.join(" / ") + " – " + [...values].join(" · ")),
    ...otherValues,
  ].join("\n");
}

function describeFacts(
  facts: ProductComparisonFact[],
  state: ProductCoverageState,
  preserveOptions = false,
): ComparisonValueDescription {
  // A condition does not independently assert that its subject is included.
  const isTerm = facts.every((fact) => fact.role === "term");
  const distinctValues = [...new Set(facts.map((fact) => fact.value.trim()).filter(Boolean))];
  const values = state === "included" && !isTerm
    ? distinctValues.filter(value => normalizeText(value) !== "inkludert")
    : distinctValues;
  const addOns = [...new Set(facts.flatMap((fact) => fact.addOnNames))];
  const suffix = values.length ? ` – ${values.join(" · ")}` : "";
  const addOnSuffix = state === "optional" && addOns.length ? ` (${addOns.join(" / ")})` : "";
  const options = state === "optional" && preserveOptions ? describeOptionalChoices(facts) : null;
  const text = options ?? (isTerm && state === "included" ? values.join(" · ") :
    `${state === "unknown" ? unresolvedProductCoverageLabel : productCoverageStateLabel(state)}${addOnSuffix}${suffix}`);
  return { text, facts, sources: uniqueSources(facts.flatMap((fact) => fact.sources)) };
}

function valueForKey(facts: ProductComparisonFact[], preferOptional: boolean, preserveOptions: boolean): ProductComparisonValue {
  if (!facts.length) return { state: "unknown", text: productCoverageStateLabel("unknown"), facts: [], sources: [] };
  const unresolved = facts.filter((fact) => fact.state === "unknown");
  if (unresolved.length) return { state: "unknown", ...describeFacts(unresolved, "unknown") };
  const included = facts.filter((fact) => fact.state === "included");
  const unavailable = facts.filter((fact) => fact.state === "unavailable");
  const optional = facts.filter((fact) => fact.state === "optional");
  if (included.length) {
    const standardValues = new Set(included.map((fact) => normalizeText(fact.value)));
    const alternatives = preserveOptions ? optional.filter((fact) => !standardValues.has(normalizeText(fact.value))) : [];
    return { state: "included", ...describeFacts(included, "included"),
      ...(alternatives.length && { optionalAlternative: describeFacts(alternatives, "optional", preserveOptions) }) };
  }
  if (optional.length && (preserveOptions || preferOptional || !unavailable.length)) {
    return { state: "optional", ...describeFacts([...optional, ...unavailable], "optional", preserveOptions) };
  }
  return { state: "unavailable", ...describeFacts(unavailable, "unavailable") };
}

function comparisonValue(
  product: MaterializedCatalogProduct,
  key: string,
  facts: ProductComparisonFact[],
  preferOptional: boolean,
  preserveOptions: boolean,
): ProductComparisonValue {
  if (!facts.length) {
    const notListed = diagnosisNotListed(key, product.diagnosisListSource);
    if (notListed) return notListed;
    const exclusion = preserveOptions ? reviewedRentalLimitExclusion(product.product.productId, key, product.facts) : undefined;
    if (exclusion) {
      return { state: "unavailable", text: "Gjelder ikke. " + exclusion.value, facts: [exclusion], sources: exclusion.sources };
    }
  }
  return valueForKey(facts, preferOptional, preserveOptions);
}

function comparableFacts(facts: ProductComparisonFact[], preserveOptions: boolean) {
  const terms = [...new Set(facts.map((fact) => normalizeText(fact.value)))].sort();
  const names = [...new Set(facts.flatMap((fact) => fact.addOnNames.map(normalizeText)))].sort();
  const assignments = preserveOptions ? [...new Set(facts.flatMap((fact) =>
    fact.addOnNames.map((name) => JSON.stringify([normalizeText(name), normalizeText(fact.value)]))))].sort() : [];
  return [terms, names, assignments];
}

function comparableValue(value: ProductComparisonValue, preserveOptions: boolean): string {
  return JSON.stringify([value.state, comparableFacts(value.facts, preserveOptions),
    value.optionalAlternative && comparableFacts(value.optionalAlternative.facts, preserveOptions)]);
}

export function compareCatalogProducts(
  firstProduct: CatalogProduct,
  secondProduct: CatalogProduct,
  catalog: ComparisonCatalog = productCatalog,
): CatalogProductComparison {
  const firstType = normalizeInsuranceType(firstProduct.insuranceType);
  const secondType = normalizeInsuranceType(secondProduct.insuranceType);
  if (firstType !== secondType) throw new Error("Produktene må ha samme forsikringstype.");
  const first = materializeCatalogProduct(firstProduct, catalog);
  const second = materializeCatalogProduct(secondProduct, catalog);
  const optionalKeys = (product: CatalogProduct) => new Set(
    availableAddOns(product, new Date(), null, catalog).flatMap(addOn =>
      (addOn.selectionEvidenceKeys ?? []).map(key => catalog.alignComparisonRows ? comparisonRowKey(product, key) : key)),
  );
  const preserveOptions = catalog.alignComparisonRows === true;
  const leftOptionalKeys = preserveOptions ? new Set<string>() : optionalKeys(firstProduct);
  const rightOptionalKeys = preserveOptions ? new Set<string>() : optionalKeys(secondProduct);
  const keys = [...new Set([...first.facts, ...second.facts].map((fact) => fact.key))];
  if (catalog.alignComparisonRows) keys.sort();
  const rows = keys.map((key): ProductComparisonRow => {
    const leftFacts = first.facts.filter((fact) => fact.key === key);
    const rightFacts = second.facts.filter((fact) => fact.key === key);
    const left = comparisonValue(first, key, leftFacts, leftOptionalKeys.has(key), preserveOptions);
    const right = comparisonValue(second, key, rightFacts, rightOptionalKeys.has(key), preserveOptions);
    const concept = conceptForFactKey(firstType, key);
    const leftLabel = leftFacts[0]?.label;
    const rightLabel = rightFacts[0]?.label;
    const label = catalog.alignComparisonRows
      ? comparisonRowHeading(firstType, key, leftLabel, rightLabel)
      : leftLabel ?? rightLabel ?? key;
    return {
      key,
      label,
      conceptId: concept?.id ?? `${firstType}.ufordelt.${key}`,
      conceptLabel: concept?.label ?? label,
      conceptTier: concept?.defaultTier ?? "detail",
      first: left,
      second: right,
      different: comparableValue(left, preserveOptions) !== comparableValue(right, preserveOptions),
    };
  });
  const conceptOrder = new Map(conceptsForInsurance(firstType).map((concept, index) => [concept.id, index]));
  const sections = [...new Set(rows.map((row) => row.conceptId))].map((id) => {
    const sectionRows = rows.filter((row) => row.conceptId === id);
    return { id, label: sectionRows[0].conceptLabel, tier: sectionRows[0].conceptTier, rows: sectionRows };
  }).sort((a, b) => (conceptOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
    (conceptOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER));
  return {
    insuranceType: catalog.alignComparisonRows
      ? canonicalInsuranceTypeLabel(firstProduct.insuranceType)
      : firstProduct.insuranceType,
    ...(catalog.alignComparisonRows && { stableHeadings: true }),
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
