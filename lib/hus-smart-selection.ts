import { catalogAgreementScope } from "./agreement-scope.ts";
import { coverageStatusFromText, type CoverageSource, type CoverageStatus, type CoverageTerm } from "./coverage-status.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { availableAddOns, catalogReferenceForProduct, productCatalog,
  type CatalogAddOn, type CatalogProduct, type ProductCatalog } from "./product-catalog.ts";

export const HOUSE_SMART_ADDON = "gjensidige-hus-smart";
export const HOUSE_SMART_PARENT = "hus.service.smart";
const keys = [HOUSE_SMART_PARENT, "hus.service.smart.avtale", "hus.sikkerhet.egenandelsreduksjon"];
type SmartTerm = CoverageTerm & { canonicalKey?: string | null };
type SmartAddOn = {
  name: string;
  id?: string;
  coverageOrigin?: "document" | "catalog";
  source?: unknown;
  manualSelection?: unknown;
  importantTerms: readonly SmartTerm[];
};
type SmartInsurance = {
  type: string;
  documentRole?: string;
  importantTerms: readonly SmartTerm[];
  addOns?: readonly SmartAddOn[];
};
export type HouseSmartDocumentSelection = {
  status: CoverageStatus;
  conflict: boolean;
  viaAddOn: boolean;
  sources: CoverageSource[];
};
export type HouseSmartSelection = HouseSmartDocumentSelection & { origin: "document" | "manual" | "catalog" };

const words = (value: string) => value.normalize("NFKC").toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/gu, " ");

export function isHouseSmartProduct(product: CatalogProduct): boolean {
  return product.providerId === "gjensidige" &&
    ["gjensidige-hus", "gjensidige-hus-pluss"].includes(product.productId) &&
    normalizeInsuranceType(product.insuranceType) === "bolig" &&
    catalogAgreementScope(product) === "ordinary" && product.version === "Alminnelige vilkår";
}

// Only the normalized manual boundary emits this marker. A catalog ID/name
// alone is availability, not proof that this customer chose the service.
export function validatedHouseSmartManualSelection(
  product: CatalogProduct,
  input: unknown,
  asOf = new Date(),
  catalog: ProductCatalog = productCatalog,
): CatalogAddOn | null {
  if (!isHouseSmartProduct(product) || !input || typeof input !== "object" || Array.isArray(input)) return null;
  const entry = input as Record<string, unknown>;
  if (entry.id !== HOUSE_SMART_ADDON || entry.coverageOrigin !== "catalog") return null;
  const marker = entry.manualSelection;
  if (!marker || typeof marker !== "object" || Array.isArray(marker)) return null;
  const selection = marker as Record<string, unknown>;
  if (Object.keys(selection).length !== 3 || selection.origin !== "manual" ||
    selection.addOnId !== HOUSE_SMART_ADDON ||
    !["origin", "addOnId", "catalogReference"].every(field => Object.hasOwn(selection, field))) return null;
  const reference = selection.catalogReference;
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) return null;
  const actual = reference as Record<string, unknown>, expected = catalogReferenceForProduct(product);
  const fields = Object.keys(expected) as (keyof typeof expected)[];
  if (Object.keys(actual).length !== fields.length || !fields.every(field =>
    Object.hasOwn(actual, field) && actual[field] === expected[field])) return null;
  return availableAddOns(product, asOf, null, catalog).find(addOn => addOn.id === HOUSE_SMART_ADDON) ?? null;
}

// This identity is used only after exact product resolution. It is not a global
// alias or a new extraction enum. Explicit unrelated identities always win.
export function houseSmartTermKey(term: SmartTerm): string | null {
  const explicit = term.canonicalKey || term.key;
  if (explicit) return keys.includes(explicit) ? explicit : null;
  switch (words(term.name)) {
    case "hus smart":
    case "hus smart alarmtjeneste": return HOUSE_SMART_PARENT;
    case "alarmtjenestens avtalevilkår": return "hus.service.smart.avtale";
    case "hus smart redusert egenandel": return "hus.sikkerhet.egenandelsreduksjon";
    default: return null;
  }
}

export function isHouseSmartAddOn(addOn: { name: string }): boolean {
  return words(addOn.name) === "hus smart";
}

function documentTerm(term: SmartTerm): boolean {
  const sources = term.sources ?? (term.source ? [term.source] : []);
  return term.coverageOrigin !== "catalog" && !(sources.length && sources.every(source =>
    (source as CoverageSource & { documentRole?: string }).documentRole === "general_terms"));
}

export function houseSmartDocumentAddOns(insurance: SmartInsurance): SmartAddOn[] {
  if (insurance.documentRole === "general_terms") return [];
  return (insurance.addOns ?? []).filter(addOn => isHouseSmartAddOn(addOn) &&
    !Object.hasOwn(addOn, "manualSelection") &&
    (!addOn.importantTerms.length || addOn.importantTerms.some(documentTerm)) &&
    (addOn.coverageOrigin === "document" ||
      (!addOn.coverageOrigin && !addOn.id && !addOn.source)));
}

export function houseSmartDocumentAddOnTerms(insurance: SmartInsurance): SmartTerm[] {
  return houseSmartDocumentAddOns(insurance).flatMap(addOn => addOn.importantTerms.filter(documentTerm).map(term =>
    !term.key && !term.canonicalKey && ["valg", "valgstatus", "status", "dekning"].includes(words(term.name))
      ? { ...term, key: HOUSE_SMART_PARENT, coverageOrigin: "document" as const } : term));
}

export function resolveHouseSmartDocumentSelection(
  product: CatalogProduct,
  insurance: SmartInsurance,
): HouseSmartDocumentSelection | null {
  if (!isHouseSmartProduct(product) || normalizeInsuranceType(insurance.type) !== "bolig") return null;
  const addOns = houseSmartDocumentAddOns(insurance);
  const supporting = insurance.documentRole === "general_terms";
  const terms = supporting ? [] : [...insurance.importantTerms, ...houseSmartDocumentAddOnTerms(insurance)]
    .filter(term => documentTerm(term) && houseSmartTermKey(term));
  const parents = terms.filter(term => houseSmartTermKey(term) === HOUSE_SMART_PARENT);
  const parsed = parents.map(term => coverageStatusFromText(term.value, {
    subject: term.name, subjectAliases: ["Hus Smart", "Hus Smart – alarmtjeneste"], productName: product.name,
  }));
  const statuses = new Set(parsed.filter(status => status === "selected" || status === "not_selected"));
  const uncertain = parsed.includes("unknown");
  // The existing manual normalization/re-enrichment contract is a separate
  // scope. Catalog IDs/terms do not become new document choice evidence.
  const catalogChoice = (insurance.addOns ?? []).some(addOn => (isHouseSmartAddOn(addOn) || addOn.id === HOUSE_SMART_ADDON) &&
    (addOn.coverageOrigin === "catalog" || Boolean(addOn.id || addOn.source)));
  if (!addOns.length && !statuses.size && !uncertain && catalogChoice) return null;
  const mentioned = insurance.importantTerms.some(term => houseSmartTermKey(term)) ||
    (insurance.addOns ?? []).some(isHouseSmartAddOn);
  if (!terms.length && !addOns.length && !supporting && !mentioned) return null;
  const conflict = statuses.size > 1;
  const viaAddOn = !statuses.size && !uncertain && addOns.length > 0;
  const status: CoverageStatus = conflict ? "unknown" : statuses.has("not_selected") ? "not_selected" :
    statuses.has("selected") || viaAddOn ? "selected" : "unknown";
  const evidence = [...parents, ...addOns.flatMap(addOn => addOn.importantTerms).filter(documentTerm)];
  const sources = evidence.flatMap(term => term.sources ?? (term.source ? [term.source] : []));
  return { status, conflict, viaAddOn, sources: sources.filter((source, index) =>
    sources.findIndex(other => JSON.stringify(other) === JSON.stringify(source)) === index) };
}

export function resolveHouseSmartSelection(
  product: CatalogProduct,
  insurance: SmartInsurance,
  asOf = new Date(),
  catalog: ProductCatalog = productCatalog,
): HouseSmartSelection | null {
  if (!isHouseSmartProduct(product) || normalizeInsuranceType(insurance.type) !== "bolig") return null;
  const document = resolveHouseSmartDocumentSelection(product, insurance);
  if (document) return { ...document, origin: "document" };
  const manual = (insurance.addOns ?? []).some(addOn => validatedHouseSmartManualSelection(product, addOn, asOf, catalog));
  if (manual) return { status: "selected", conflict: false, viaAddOn: false, sources: [], origin: "manual" };
  if ((insurance.addOns ?? []).some(addOn => (isHouseSmartAddOn(addOn) || addOn.id === HOUSE_SMART_ADDON) &&
      (addOn.id || addOn.source || addOn.coverageOrigin === "catalog" || Object.hasOwn(addOn, "manualSelection")))) {
    return { status: "unknown", conflict: false, viaAddOn: false, sources: [], origin: "catalog" };
  }
  return null;
}
