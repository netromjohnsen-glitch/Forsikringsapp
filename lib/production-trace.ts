import { productCatalog } from "./product-catalog.ts";
import { normalizeInsuranceType, isUndocumentedTermValue } from "./insurance-normalization.ts";
import { deriveCanonicalCoverages, type CanonicalCoverage } from "./coverage-status.ts";
import type { ComparedDocument, ComparedInsurance, Difference, InsuranceGroup, TermGroup } from "./comparison.ts";
import type { PortfolioPrice, PortfolioPriceInput } from "./portfolio-price-presentation.ts";
import { vehiclePrices } from "./vehicle-price-presentation.ts";

// Temporary diagnostic vocabulary. Exact code-defined identities only, never a
// customer-controlled prefix, label, value, source, identifier or identifier hash.
export const traceKeys = [
  "nyverdi.dekning", "nyverdi.alder", "nyverdi.km", "nyverdi.grenser",
  "kjoretoy.kjorelengde", "kjoretoy.kilometerstand", "premie.ekskl_tfa", "premie.tfa", "premie.total",
  "maskinskade.dekning", "maskinskade.alder", "maskinskade.km", "maskinskade.varighet", "maskinskade.egenandel",
  "leiebil.dekning", "leiebil.dager", "leiebil.kondemnasjon", "leiebil.teknisk", "leiebil.feriereise",
  "veihjelp.dekning", "veihjelp.egenandel", "veihjelp.omfang", "veihjelp.geografi",
  "rettshjelp.dekning", "rettshjelp.grense", "rettshjelp.egenandel", "kasko.dekning",
  "brann.dekning", "tyveri.dekning", "brann_tyveri.dekning", "glass.dekning", "bilnokkel.dekning", "bilnokkel.grense",
  "ulykke.dekning", "ansvar.dekning", "parkering.dekning", "punktering.dekning",
] as const;
const keys = new Set<string>(traceKeys);
const types = ["bil", "hus", "bolig", "innbo", "reise", "snøscooter", "campingvogn", "tilhenger", "unknown"];
// Metadata already imported by the application; no source reads or fact resolution.
const providers = new Set(productCatalog.products.map(p => p.providerId));
const products = new Set(productCatalog.products.map(p => p.productId));
const stages = ["document", "extraction", "normalization", "repeated_normalization", "consolidation", "product", "catalog", "effective", "sanitizer", "coverage", "client_result", "price_input", "portfolio", "comparison", "presentation", "complete"];
const origins = ["document", "catalog", "derived", "conflict", "unknown"];
const reasons = ["UNOBSERVED", "KEY_SET_OBSERVED", "NO_EXPLICIT_RENAME_MAP", "EXACT_CATALOG_SELECTION", "NO_CATALOG_SELECTION", "STANDALONE", "CONSOLIDATED", "UNRESOLVED", "CONFLICT", "NO_EVIDENCE", "explicit_status", "main_value", "detail", "add_on", "catalog_definition", "ANNUAL_PARSED", "MISSING", "UNPARSEABLE_OR_CONFLICT", "PORTFOLIO_BRANCH", "VEHICLE_BRANCH", "LEGACY_BRANCH", "DOCUMENT_PRESENT_SKIP_CATALOG", "CATALOG_FILL_DOCUMENT_SILENT", "CATALOG_BLOCKED_BY_STATUS", "CATALOG_PRODUCT_MISMATCH", "CATALOG_CONFLICT", "CATALOG_NOT_AVAILABLE", "CATALOG_APPLIED", "CATALOG_NOT_APPLIED_OTHER_RULE", "CLIENT_RECEIPT_COMPLETE", "EXTRACTION_FAILED", "OPTIONAL_TFA_NOT_REQUIRED", "CONSOLIDATION_UNRESOLVED", "CONSOLIDATION_FACT_CONFLICT", "MULTIPLE_DOCUMENT_AMOUNTS", "CONTRIBUTION_ACCEPTED", "PRICE_UNPARSEABLE", "PRICE_MISSING", "PRICE_TYPE_UNSUPPORTED"];
const decisions = reasons.filter(r => r.startsWith("CATALOG_") || r === "DOCUMENT_PRESENT_SKIP_CATALOG");
type Origin = "document" | "catalog" | "derived" | "conflict" | "unknown";
type SafeFact = { key: string; present: boolean; origin: Origin };
type SafeCoverage = { key: string; status: "selected" | "not_selected" | "unknown"; origin: Origin; reason: string };
export type ClientTraceContext = { traceId: string; objectRefs: { left: string[]; right: string[] }; ticket: string };
export type PriceBranch = "portfolio" | "vehicle" | "legacy";
export type TraceEvent = {
  stage: string; side?: "left" | "right"; objectRef?: string; docRef?: string; batchRef?: string;
  objectRefs?: string[]; inputRefs?: string[]; documentRefs?: string[]; leftRefs?: string[]; rightRefs?: string[];
  keys?: string[]; beforeKeys?: string[]; addedKeys?: string[]; removedKeys?: string[]; conflictKeys?: string[]; coverageKeys?: string[];
  insuranceType?: string; insuranceTypes?: string[]; providerId?: string | null; productId?: string | null; beforeProductIds?: string[];
  providerPresent?: boolean; productPresent?: boolean; identityPresent?: boolean; identityProvided?: boolean; identityInvalid?: boolean; productIdentityState?: string; applicabilityObserved?: boolean; applicable?: boolean; issues?: string[];
  parsed?: boolean; extractedObjects?: number; accepted?: boolean; reason?: string;
  facts?: SafeFact[]; decisions?: { key: string; decision: string }[]; coverages?: SafeCoverage[];
  prices?: { key: string; state: string; annualBasis: string; comparable: boolean; reason: string }[];
  components?: { key: string; completeness: string; expected: number; priced: number }[];
  objectCount?: number; failedDocuments?: number; compatible?: boolean; conflict?: boolean; branch?: PriceBranch;
  comparisons?: { key: string; leftPresent: boolean; rightPresent: boolean; leftOrigin: Origin; rightOrigin: Origin; state: string }[];
  eventCount?: number; droppedEvents?: number; observerFailures?: number; durationMs?: number;
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const oneOf = (values: readonly string[]) => (value: unknown) => typeof value === "string" && values.includes(value);
const count = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 10000;
const bool = (value: unknown) => typeof value === "boolean";
const ref = (prefix: string) => (value: unknown) => typeof value === "string" && new RegExp(`^${prefix}_(?:0|[1-9][0-9]{0,2})$`).test(value);
const key = (value: unknown) => typeof value === "string" && keys.has(value);
const list = (check: (value: unknown) => boolean, max = 64) => (value: unknown) => Array.isArray(value) && value.length <= max && value.every(check);
const shape = (fields: Record<string, (value: unknown) => boolean>) => (value: unknown) => {
  const record = object(value);
  return Object.keys(record).length === Object.keys(fields).length && Object.entries(fields).every(([k, check]) => check(record[k]));
};
const factShape = shape({ key, present: bool, origin: oneOf(origins) });
const validators: Record<keyof TraceEvent, (value: unknown) => boolean> = {
  stage: oneOf(stages), side: oneOf(["left", "right"]), objectRef: ref("object"), docRef: ref("doc"), batchRef: ref("batch"),
  objectRefs: list(ref("object")), inputRefs: list(ref("object")), documentRefs: list(ref("doc")), leftRefs: list(ref("object")), rightRefs: list(ref("object")),
  keys: list(key), beforeKeys: list(key), addedKeys: list(key), removedKeys: list(key), conflictKeys: list(key), coverageKeys: list(key),
  insuranceType: oneOf(types), insuranceTypes: list(oneOf(types)), providerId: v => v === null || typeof v === "string" && providers.has(v),
  productId: v => v === null || typeof v === "string" && products.has(v), beforeProductIds: list(v => typeof v === "string" && products.has(v)),
  providerPresent: bool, productPresent: bool, identityPresent: bool, identityProvided: bool, identityInvalid: bool, productIdentityState: oneOf(["PRESENT", "EXPLICIT_UNKNOWN", "LEGACY_FALLBACK", "MISSING"]), applicabilityObserved: bool, applicable: bool, issues: list(oneOf(["identity_conflict", "provider_conflict", "product_conflict", "temporal_conflict"])), parsed: bool, extractedObjects: count, accepted: bool, reason: oneOf(reasons),
  facts: list(factShape), decisions: list(shape({ key, decision: oneOf(decisions) })),
  coverages: list(shape({ key, status: oneOf(["selected", "not_selected", "unknown"]), origin: oneOf(origins), reason: oneOf(reasons) })),
  prices: list(shape({ key: oneOf(["premie.ekskl_tfa", "premie.tfa", "premie.total"]), state: oneOf(["present", "missing", "conflict_or_unparseable", "conflict", "unparseable", "not_required"]), annualBasis: oneOf(["canonical_annual", "unresolved"]), comparable: bool, reason: oneOf(reasons) })),
  components: list(shape({ key: oneOf(["premie.ekskl_tfa", "premie.tfa", "premie.total"]), completeness: oneOf(["complete", "partial", "unavailable", "conflicting"]), expected: count, priced: count })),
  objectCount: count, failedDocuments: count, compatible: bool, conflict: bool, branch: oneOf(["portfolio", "vehicle", "legacy"]),
  comparisons: list(shape({ key, leftPresent: bool, rightPresent: bool, leftOrigin: oneOf(origins), rightOrigin: oneOf(origins), state: oneOf(["DIFFERENCE_EMITTED", "NO_DIFFERENCE_EMITTED", "PRESENTATION_ITEM_PRODUCED", "NO_PRESENTATION_ITEM"]) })),
  eventCount: count, droppedEvents: count, observerFailures: count,
  durationMs: value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 300000,
};
// Fail closed, including unknown/deep fields. This is also the HTTP logging boundary.
export function sanitizeTraceEvent(input: unknown): TraceEvent | null {
  const record = object(input);
  if (!validators.stage(record.stage) || Object.keys(record).some(k => !Object.hasOwn(validators, k) || !validators[k as keyof TraceEvent](record[k]))) return null;
  return JSON.parse(JSON.stringify(record)) as TraceEvent;
}
export function safeTraceType(record: object): string {
  const item = object(record);
  const type = normalizeInsuranceType(typeof item.type === "string" ? item.type : "");
  return types.includes(type) ? type : "unknown";
}
export function safeTraceProduct(input: unknown): { providerId: string | null; productId: string | null } {
  const item = object(input);
  return { providerId: typeof item.providerId === "string" && providers.has(item.providerId) ? item.providerId : null,
    productId: typeof item.productId === "string" && products.has(item.productId) ? item.productId : null };
}
export function traceProductIdentityState(input: object): string {
  const record = object(input);
  return record.canonicalProductName === null ? "EXPLICIT_UNKNOWN" : record.canonicalProductName ? "PRESENT" :
    record.canonicalProductName === undefined && record.productName ? "LEGACY_FALLBACK" : "MISSING";
}
export function traceTerms(input: unknown): Record<string, unknown>[] {
  const item = object(input);
  return (Array.isArray(input) ? input : [...array(item.importantTerms), ...array(item.addOns).flatMap(a => array(object(a).importantTerms))]).map(object);
}
export function traceKeySet(input: unknown): string[] {
  return [...new Set(traceTerms(input).map(t => t.key ?? t.canonicalKey).filter((k): k is string => key(k)))].sort();
}
export function traceFacts(input: unknown): SafeFact[] {
  const terms = traceTerms(input), conflicts = array(object(object(input).consolidation).factConflicts).map(c => object(c).key);
  return traceKeys.map(key => {
    const found = terms.filter(t => (t.key ?? t.canonicalKey) === key && typeof t.value === "string" && t.value.trim() && !isUndocumentedTermValue(t.value));
    const origin: Origin = conflicts.includes(key) ? "conflict" : !found.length ? "unknown" : found.some(t => t.coverageOrigin !== "catalog") ? "document" : "catalog";
    return { key, present: found.length > 0, origin };
  });
}
export function traceCoverages(record: object): SafeCoverage[] {
  const item = object(record);
  if (!Array.isArray(item.importantTerms) || typeof item.type !== "string") return [];
  return deriveCanonicalCoverages(record as ComparedInsurance, safeTraceType(record)).filter(c => keys.has(c.id)).map(traceCoverage);
}
function traceCoverage(c: CanonicalCoverage): SafeCoverage {
    const assertions = c.evidence.filter(e => e.status !== "unknown");
    const max = Math.max(0, ...assertions.map(e => e.priority));
    const winners = assertions.filter(e => e.priority === max);
    const origin: Origin = c.conflict ? "conflict" : !winners.length ? "unknown" : winners.every(e => e.origin === "catalog") ? "catalog" : "document";
    return { key: c.id, status: c.status, origin, reason: c.conflict ? "CONFLICT" : winners[0]?.kind ?? "NO_EVIDENCE" };
}
export type TraceObjectObserver = {
  normalization(before: object, after: readonly object[]): void;
  product(input: object, selected: object | null): void;
  catalog(input: { documentTerms: readonly object[]; effectiveFacts: readonly object[]; catalogFacts: readonly object[]; supplementalTerms: readonly object[]; effectiveTerms: readonly object[]; blockedKeys: readonly string[]; product: object | null; decisions?: readonly { key: string; decision: string }[] }): void;
  effective(stage: "effective" | "sanitizer", record: object): void;
};

export function clientTraceEvents(input: {
  documents: ComparedDocument[]; groups: InsuranceGroup[]; differences: Difference[]; portfolioPrices: PortfolioPrice[];
  context: ClientTraceContext; priceBranches: PriceBranch[];
  details?: { group: InsuranceGroup; terms: TermGroup[] }[]; presentedDifferences?: Difference[];
  priceInputs?: { objectIndex: number; input: PortfolioPriceInput }[][];
}): TraceEvent[] {
  const events: TraceEvent[] = [], refs = new WeakMap<object, string>();
  input.documents.forEach((doc, sideIndex) => {
    const side = sideIndex === 0 ? "left" : "right";
    doc.insuranceData.insurances.forEach((record, index) => {
      const objectRef = input.context.objectRefs[side][index];
      refs.set(record, objectRef);
      events.push({ stage: "client_result", side, objectRef, insuranceType: safeTraceType(record), ...safeTraceProduct(record.catalogReference), facts: traceFacts(record), coverages: traceCoverages(record) });
      const observed = input.priceInputs?.[sideIndex]?.filter(p => p.objectIndex === index).map(p => p.input);
      const prices = observed ? null : vehiclePrices(record);
      events.push({ stage: "price_input", side, objectRef, prices: observed ?? (prices ?? []).map(p => ({ key: p.key, state: p.amount !== null ? "present" : p.value ? "conflict_or_unparseable" : "missing", annualBasis: p.amount !== null ? "canonical_annual" : "unresolved", comparable: p.amount !== null, reason: p.amount !== null ? "ANNUAL_PARSED" : p.value ? "UNPARSEABLE_OR_CONFLICT" : "MISSING" })) });
    });
    const price = input.portfolioPrices[sideIndex], branch = input.priceBranches[sideIndex];
    events.push({ stage: "portfolio", side, objectCount: price.objectCount, failedDocuments: price.failedDocuments, compatible: price.compatible, conflict: price.conflict,
      components: price.components.map(c => ({ key: c.key, completeness: c.completeness, expected: c.expected, priced: c.priced })), branch,
      reason: branch === "portfolio" ? "PORTFOLIO_BRANCH" : branch === "vehicle" ? "VEHICLE_BRANCH" : "LEGACY_BRANCH" });
  });
  for (const { group, terms } of input.details ?? []) {
    const leftRefs = group.first.flatMap(r => refs.get(r) ? [refs.get(r)!] : []), rightRefs = group.second.flatMap(r => refs.get(r) ? [refs.get(r)!] : []);
    const rowOrigin = (term: TermGroup, side: "first" | "second"): Origin => {
      const coverage = term[`${side}Coverage`];
      if (coverage) return traceCoverage(coverage).origin;
      if (group[side].some(r => r.consolidation?.factConflicts?.some(c => c.key === term.key))) return "conflict";
      const sources = term[`${side}SourceOrigins`] ?? [];
      if (sources.some(s => s.origin === "document")) return "document";
      if (sources.length && sources.every(s => s.origin === "catalog")) return "catalog";
      return "unknown"; // No source evidence is not proof of document origin.
    };
    const matches = (difference: Difference, key: string): boolean => difference.insuranceKey === group.key && difference.objectScope === group.scopeId &&
      (difference.termKey === key || Boolean(difference.relatedTermKeys?.includes(key)));
    const comparisons = terms.filter(t => keys.has(t.key)).map(term => ({
      key: term.key,
      leftPresent: term.firstCoverage ? term.firstCoverage.status !== "unknown" : Boolean(term.first) && !isUndocumentedTermValue(term.first!), rightPresent: term.secondCoverage ? term.secondCoverage.status !== "unknown" : Boolean(term.second) && !isUndocumentedTermValue(term.second!),
      leftOrigin: rowOrigin(term, "first"), rightOrigin: rowOrigin(term, "second"),
      state: input.differences.some(d => matches(d, term.key)) ? "DIFFERENCE_EMITTED" : "NO_DIFFERENCE_EMITTED",
    }));
    events.push({ stage: "comparison", leftRefs, rightRefs, comparisons });
    for (const side of ["first", "second"] as const) {
      events.push({ stage: "client_result", side: side === "first" ? "left" : "right", objectRefs: side === "first" ? leftRefs : rightRefs,
        coverages: terms.flatMap(t => t[`${side}Coverage`] && keys.has(t.key) ? [traceCoverage(t[`${side}Coverage`]!)] : []) });
    }
    events.push({ stage: "presentation", leftRefs, rightRefs, comparisons: comparisons.map(c => ({ ...c,
      state: (input.presentedDifferences ?? []).some(d => matches(d, c.key) || ((d as Difference & { items?: Difference[] }).items ?? []).some(item => matches(item, c.key))) ? "PRESENTATION_ITEM_PRODUCED" : "NO_PRESENTATION_ITEM", })) });
  }
  const valid = events.map(sanitizeTraceEvent).filter((e): e is TraceEvent => e !== null);
  const retained: TraceEvent[] = [];
  let bytes = 0;
  for (const event of valid) {
    const size = new TextEncoder().encode(JSON.stringify(event)).byteLength;
    if (retained.length >= 255 || bytes + size > 200 * 1024) break;
    retained.push(event); bytes += size;
  }
  retained.push({ stage: "client_result", reason: "CLIENT_RECEIPT_COMPLETE", eventCount: retained.length, droppedEvents: Math.min(10000, valid.length - retained.length), observerFailures: events.length - valid.length });
  return retained;
}
