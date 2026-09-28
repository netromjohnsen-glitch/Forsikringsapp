import type { DocumentRole } from "./object-consolidation.ts";
import type { DocumentObjectRecord, ConsolidatedDocumentObject } from "./insurance-object-consolidation.ts";
import type { CatalogEnrichedInsurance } from "./catalog-enrichment.ts";
import type { FactSource } from "./comparison.ts";
import { normalizeDocumentFacts } from "./document-fact-normalization.ts";
import { canonicalProviderId, findCatalogProductBySelection, catalogProductIdentity, resolvedAgreementScope, catalogProductsForSelection, productCatalog } from "./product-catalog.ts";
import { normalizeInsuranceType, normalizeTermName, relatedCoveragesForInsuranceType, isUndocumentedTermValue } from "./insurance-normalization.ts";
import { objectIdentity } from "./object-matching.ts";
import { defaultIdentifierStrategies } from "./object-identity-strategies.ts";
import { deriveCanonicalCoverages } from "./coverage-status.ts";
import type { SupportingAttachmentObserver } from "./production-trace.ts";

// Role is explicit extraction metadata for this record, not a filename/title
// heuristic. Unknown records remain eligible, including unpriced/no-ID policies.
export function isCustomerObject(record: { documentRole?: DocumentRole }): boolean {
  return record.documentRole !== "general_terms";
}

type Customer = CatalogEnrichedInsurance & {
  documentReferences?: DocumentObjectRecord["documentReferences"];
  documentSources?: FactSource[];
  recordEvidence?: ConsolidatedDocumentObject["recordEvidence"];
};
const words = (value: string) => value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("nb-NO");
const sourceKey = (source: FactSource) => JSON.stringify(source);
const uniqueSources = (sources: FactSource[]) => [...new Map(sources.map(s => [sourceKey(s), s])).values()];
const known = (value: string | null | undefined) => Boolean(value?.trim() && !isUndocumentedTermValue(value));

function productScope(record: Customer | DocumentObjectRecord) {
  const name = record.canonicalProductName === undefined ? record.productName : record.canonicalProductName;
  if (!record.company || !name) return null;
  const provider = canonicalProviderId(record.company) ?? words(record.company);
  const type = normalizeInsuranceType(record.type, record);
  const agreementScope = resolvedAgreementScope(record.company, record.type, record.agreementScope);
  if (agreementScope === null) return null;
  const product = findCatalogProductBySelection(record.company, record.type, name, record.agreementScope);
  // A known name with unresolved catalog versions is not an uncatalogued
  // product. Do not fall back to raw-name attachment across those versions.
  if (!product && catalogProductsForSelection(productCatalog, record.company, type, agreementScope)
    .some(candidate => words(candidate.name) === words(name))) return null;
  return JSON.stringify([provider, type, agreementScope, product ? catalogProductIdentity(product) : words(name)]);
}

export function supportingTermsApply(customer: Customer, terms: DocumentObjectRecord, side?: "existing" | "offer"): boolean {
  if (terms.documentRole !== "general_terms" || !isCustomerObject(customer)) return false;
  const scope = productScope(customer);
  if (!scope || scope !== productScope(terms)) return false;
  if (!customer.documentReferences?.length && !side) return false;
  const sides = new Set([...(side ? [side] : []), ...[...(customer.documentReferences ?? []), ...terms.documentReferences].map(r => r.side)]);
  if (sides.size > 1) return false;
  // A recorded object ID narrows applicability; product identity never creates
  // an object ID. An unscoped terms record may support several exact products.
  const identity = objectIdentity(terms, defaultIdentifierStrategies), target = objectIdentity(customer, defaultIdentifierStrategies);
  if (identity.invalid || target.invalid) return false;
  if (identity.tokens.length && (!target.tokens.length || identity.tokens.some(([kind, value]) =>
    !target.tokens.some(([targetKind, targetValue]) => kind === targetKind && value === targetValue)))) return false;
  for (const bound of ["from", "to"] as const) {
    const period = terms.agreementPeriod?.[bound];
    if (period && period !== customer.agreementPeriod?.[bound]) return false;
  }
  const customerSources = customer.documentSources ?? customer.recordEvidence?.flatMap(r => r.sources) ?? [];
  const customerNumbers = new Set(customerSources.map(s => s.termsNumber).filter(known));
  const termsNumbers = new Set(terms.documentSources.map(s => s.termsNumber).filter(known));
  if (termsNumbers.size && (!customerNumbers.size || [...termsNumbers].some(n => !customerNumbers.has(n)))) return false;
  // Never presume a dated uploaded version applies to an undated agreement.
  // Keep it as unattached evidence instead of inventing version chronology.
  for (const source of terms.documentSources) if (source.effectiveFrom) {
    const targetDate = customer.agreementPeriod?.from;
    if (!targetDate || source.effectiveFrom > targetDate) return false;
    if (!customerSources.some(s => s.effectiveFrom === source.effectiveFrom) && !termsNumbers.size) return false;
    if (customerSources.some(s => s.effectiveFrom && s.effectiveFrom !== source.effectiveFrom)) return false;
  }
  return true;
}

export function supportingEvidence(record: DocumentObjectRecord) {
  const sources = record.documentSources.map(source => ({ ...source, documentRole: "general_terms" as const }));
  const importantTerms = normalizeDocumentFacts(record).map(term => ({
    ...term, coverageOrigin: "catalog" as const,
    sources: uniqueSources((term.sources?.length ? term.sources : term.source ? [term.source] : sources)
      .map(source => ({ ...source, documentRole: "general_terms" as const }))),
  }));
  return { ...record, documentSources: sources, importantTerms };
}

// Runs after customer-only consolidation and its established catalog policy.
// Uploaded terms remain separate evidence; they cannot establish customer
// choices, prices, object identity, or replace effective agreement facts.
export function attachSupportingTerms<T extends Customer>(customer: T, records: readonly DocumentObjectRecord[], side?: "existing" | "offer", observe?: SupportingAttachmentObserver): T {
  const accepted = records.filter(record => supportingTermsApply(customer, record, side));
  const applicable = accepted.map(supportingEvidence);
  const blockedPrices = observe ? new Set<object>() : undefined;
  const observed = (result: T): T => {
    if (observe) for (const supporting of records) {
      const index = accepted.indexOf(supporting), normalizedSupporting = applicable[index];
      try { observe({ supporting, normalizedSupporting, customer, result, attached: index >= 0,
        priceBlocked: Boolean(normalizedSupporting && blockedPrices?.has(normalizedSupporting)) }); }
      catch { /* Optional diagnostics cannot affect supporting evidence or customer facts. */ }
    }
    return result;
  };
  if (!applicable.length) return observed(customer);
  const keyOf = (term: T["importantTerms"][number]) => term.key ?? normalizeTermName(term.name, { insuranceType: customer.type, termValue: term.value });
  const existing = new Set(customer.importantTerms.filter(t => !isUndocumentedTermValue(t.value)).map(keyOf));
  const coverages = new Map(deriveCanonicalCoverages(customer, customer.type).map(c => [c.id, c]));
  const definitions = relatedCoveragesForInsuranceType(customer.type);
  const candidates = new Map<string, typeof applicable[number]["importantTerms"]>();
  for (const record of applicable) for (const term of record.importantTerms) {
    const key = keyOf(term);
    // Customer values/scalars are never imported from generic examples.
    if (existing.has(key) || /^(?:premie|kjoretoy)\./u.test(key) || ["egenandel", "forsikringssum"].includes(key)) {
      if (key === "premie.ekskl_tfa" || key === "premie.tfa" || key === "premie.total") blockedPrices?.add(record);
      continue;
    }
    const coverage = definitions.find(d => d.parentKey === key || d.details.some(detail => detail.key === key || Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix))) ||
      (d.parentKey.endsWith(".dekning") && key.startsWith(d.parentKey.slice(0, -"dekning".length))));
    // Only already established coverage can receive generic limits. A possible
    // addon in terms must never turn an undocumented customer choice selected.
    if (coverage && (coverages.get(coverage.parentKey)?.status !== "selected" || coverages.get(coverage.parentKey)?.conflict)) continue;
    if (!coverage && /(?:^|\.)dekning$/u.test(key)) continue;
    if (isUndocumentedTermValue(term.value)) continue;
    candidates.set(key, [...(candidates.get(key) ?? []), term]);
  }
  const additions = [...candidates].sort(([a],[b]) => a.localeCompare(b)).flatMap(([, terms]) => {
    // Conflicting generic rules remain available as evidence, not an arbitrary
    // effective winner or an invented customer-level conflict.
    if (new Set(terms.map(t => words(t.value))).size !== 1) return [];
    return [{ ...terms[0], sources: uniqueSources(terms.flatMap(t => t.sources)) }];
  });
  const evidence = applicable.map(record => ({ productName: record.productName, company: record.company,
    ...(record.agreementScope !== undefined ? { agreementScope: record.agreementScope } : {}),
    documentRole: "general_terms" as const, agreementPeriod: record.agreementPeriod ?? null,
    annualPremium: record.annualPremium, deductible: record.deductible,
    sources: record.documentSources, importantTerms: record.importantTerms,
  })).sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return observed({ ...customer, importantTerms: [...customer.importantTerms.filter(t =>
    !isUndocumentedTermValue(t.value) || !additions.some(a => keyOf(a) === keyOf(t))), ...additions],
    recordEvidence: [...(customer.recordEvidence ?? []), ...evidence] });
}
