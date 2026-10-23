import { catalogAgreementScope } from "./agreement-scope.ts";
import { coverageStatusFromText, type CoverageSource, type CoverageStatus, type CoverageTerm } from "./coverage-status.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { availableAddOns, catalogReferenceForProduct, productCatalog,
  type CatalogAddOn, type CatalogProduct, type ProductCatalog } from "./product-catalog.ts";

export const HOUSE_RENTAL_ADDON = "gjensidige-hus-utleie";
export const HOUSE_RENTAL_KEYS = ["hus.utleie.vilkar", "hus.utleie.mislighold", "hus.utleie.utkastelse",
  "hus.utleie.skadeverk", "hus.utleie.egenandel"] as const;
type RentalTerm = CoverageTerm & { canonicalKey?: string | null };
type RentalAddOn = { name: string; id?: string; coverageOrigin?: string; source?: unknown;
  manualSelection?: unknown; importantTerms: readonly RentalTerm[] };
type RentalInsurance = { type: string; documentRole?: string; importantTerms: readonly RentalTerm[];
  addOns?: readonly RentalAddOn[]; addOnIds?: readonly string[] };
export type HouseRentalSelection = { status: CoverageStatus; conflict: boolean; sources: CoverageSource[] };
const words = (value: string) => value.normalize("NFKC").toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/gu, " ");

export function isHouseRentalProduct(product: CatalogProduct): boolean {
  return product.providerId === "gjensidige" &&
    ["gjensidige-hus", "gjensidige-hus-pluss"].includes(product.productId) &&
    normalizeInsuranceType(product.insuranceType) === "bolig" &&
    catalogAgreementScope(product) === "ordinary" && product.version === "Alminnelige vilkår";
}

export function isHouseRentalAddOn(addOn: { name: string; id?: string }): boolean {
  return addOn.id === HOUSE_RENTAL_ADDON || words(addOn.name) === "utleie";
}

export function houseRentalTermKey(term: RentalTerm): string | null {
  const explicit = term.canonicalKey || term.key;
  if (explicit) return HOUSE_RENTAL_KEYS.find(key => key === explicit) ?? null;
  const labels = ["utleie avtalevilkår", "utleie betalingsmislighold", "utleie utkastelse",
    "utleie skadeverk", "utleie egenandel"];
  const index = labels.indexOf(words(term.name));
  return index < 0 ? null : HOUSE_RENTAL_KEYS[index];
}

// The addon binding prevents reusing a rot/Smart marker on a different choice.
export function validatedHouseRentalManualSelection(product: CatalogProduct, input: unknown,
  asOf = new Date(), catalog: ProductCatalog = productCatalog): CatalogAddOn | null {
  if (!isHouseRentalProduct(product) || !input || typeof input !== "object" || Array.isArray(input)) return null;
  const entry = input as Record<string, unknown>, marker = entry.manualSelection;
  if (entry.id !== HOUSE_RENTAL_ADDON || entry.coverageOrigin !== "catalog" || !marker ||
    typeof marker !== "object" || Array.isArray(marker)) return null;
  const selection = marker as Record<string, unknown>;
  if (Object.keys(selection).length !== 3 || selection.origin !== "manual" || selection.addOnId !== HOUSE_RENTAL_ADDON ||
    !["origin", "addOnId", "catalogReference"].every(field => Object.hasOwn(selection, field))) return null;
  const reference = selection.catalogReference;
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) return null;
  const actual = reference as Record<string, unknown>, expected = catalogReferenceForProduct(product);
  const fields = Object.keys(expected) as (keyof typeof expected)[];
  if (Object.keys(actual).length !== fields.length || !fields.every(field =>
    Object.hasOwn(actual, field) && actual[field] === expected[field])) return null;
  return availableAddOns(product, asOf, null, catalog).find(addOn => addOn.id === HOUSE_RENTAL_ADDON) ?? null;
}

function documentTerm(term: RentalTerm): boolean {
  const sources = term.sources ?? (term.source ? [term.source] : []);
  return term.coverageOrigin !== "catalog" && !(sources.length && sources.every(source =>
    (source as CoverageSource & { documentRole?: string }).documentRole === "general_terms"));
}

function choiceHeading(term: RentalTerm, inAddOn = false): boolean {
  // The five detail keys are never a parent selection, even when named Utleie.
  if (term.canonicalKey || (term.key && words(term.key) !== "utleie")) return false;
  return words(term.name) === "utleie" || (inAddOn &&
    ["valg", "valgstatus", "status", "dekning"].includes(words(term.name)));
}

export function resolveHouseRentalManualSelection(product: CatalogProduct, insurance: RentalInsurance,
  asOf = new Date(), catalog: ProductCatalog = productCatalog): HouseRentalSelection | null {
  if (!isHouseRentalProduct(product) || normalizeInsuranceType(insurance.type) !== "bolig") return null;
  const entries = insurance.addOns ?? [];
  // Pure document pipelines keep their existing contract. A raw catalog ID or
  // malformed internal marker is in scope for rejection, not proof of a choice.
  if (!insurance.addOnIds?.includes(HOUSE_RENTAL_ADDON) && !entries.some(entry => isHouseRentalAddOn(entry) &&
      (entry.coverageOrigin === "catalog" || Object.hasOwn(entry, "manualSelection") ||
        (entry.coverageOrigin !== "document" && (entry.id || entry.source))))) return null;
  const manual = entries.some(entry => validatedHouseRentalManualSelection(product, entry, asOf, catalog));
  const documentAddOns = entries.filter(entry => words(entry.name) === "utleie" &&
    !Object.hasOwn(entry, "manualSelection") && (entry.coverageOrigin === "document" ||
      (!entry.coverageOrigin && !entry.id && !entry.source)));
  const terms = insurance.documentRole === "general_terms" ? [] : [
    ...insurance.importantTerms.filter(term => choiceHeading(term)),
    ...documentAddOns.flatMap(entry => entry.importantTerms.filter(term => choiceHeading(term, true))),
  ].filter(documentTerm);
  const parsed = terms.map(term => coverageStatusFromText(term.value, { subject: "Utleie", productName: product.name }));
  const statuses = new Set(parsed.filter(status => status === "selected" || status === "not_selected"));
  const conflict = statuses.size > 1;
  // null is descriptive text. Only an explicit unknown status blocks fallback.
  const status: CoverageStatus = conflict ? "unknown" : statuses.has("not_selected") ? "not_selected" :
    parsed.includes("unknown") && !statuses.has("selected") ? "unknown" : manual ? "selected" : "unknown";
  const sources = terms.flatMap(term => term.sources ?? (term.source ? [term.source] : []));
  return { status, conflict, sources: sources.filter((source, index) =>
    sources.findIndex(other => JSON.stringify(other) === JSON.stringify(source)) === index) };
}
