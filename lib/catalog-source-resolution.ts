import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";

export type CatalogSourceDecision = {
  key: string;
  reason: "legacy" | "source_priority" | "agreement" | "conflict" | "inapplicable";
  winners: CatalogFact[];
  evidence: CatalogFact[];
};

// Only explicitly classified sources participate. Undeclared legacy sources
// retain their existing component/inheritance policy; authority is never
// inferred from filenames, company names, numeric values or array order.
const authority = { full_terms: 3, ipid: 2, product_page: 1 } as const;
export function resolveCatalogSources(
  candidates: readonly CatalogFact[], sources: Readonly<Record<string, CatalogSource>>,
  product: CatalogProduct, asOf: Date,
): { facts: CatalogFact[]; decisions: CatalogSourceDecision[] } {
  const groups = new Map<string, CatalogFact[]>();
  for (const fact of candidates) groups.set(fact.key, [...(groups.get(fact.key) ?? []), fact]);
  const decisions: CatalogSourceDecision[] = [];
  const date = asOf.toISOString().slice(0, 10);
  for (const [key, entries] of groups) {
    const evidence = [...entries].sort((a, b) =>
      JSON.stringify([a.source.documentId, a.value, a.source]).localeCompare(JSON.stringify([b.source.documentId, b.value, b.source])));
    const applicable = evidence.filter(fact => {
      const source = sources[fact.source.documentId];
      if (!source?.sourceType) return true;
      return (!source.providerId || source.providerId === product.providerId) &&
        (!source.insuranceType || normalizeInsuranceType(source.insuranceType) === normalizeInsuranceType(product.insuranceType)) &&
        (!source.productIds || source.productIds.includes(product.productId)) &&
        (!source.productVersion || source.productVersion === product.version) &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(source.effectiveFrom) || source.effectiveFrom <= date) &&
        (!source.validTo || source.validTo >= date);
    });
    if (!applicable.length) { decisions.push({ key, reason: "inapplicable", winners: [], evidence }); continue; }
    if (applicable.some(fact => !sources[fact.source.documentId]?.sourceType)) {
      decisions.push({ key, reason: "legacy", winners: entries.filter(fact => applicable.includes(fact)), evidence });
      continue;
    }
    const rank = (fact: CatalogFact) => authority[sources[fact.source.documentId].sourceType!];
    const best = Math.max(...applicable.map(rank));
    let strongest = applicable.filter(fact => rank(fact) === best);
    // Exact product scope can refine a general source at the same authority.
    // Version strings never imply chronology. Overlapping versions conflict.
    const scoped = strongest.filter(fact => sources[fact.source.documentId].productIds?.includes(product.productId));
    if (scoped.length) strongest = scoped;
    const conflict = new Set(strongest.map(fact => fact.value)).size > 1;
    decisions.push({ key, reason: conflict ? "conflict" : strongest.length < applicable.length ? "source_priority" : "agreement",
      winners: conflict ? [] : strongest, evidence });
  }
  return { facts: decisions.flatMap(decision => decision.winners), decisions };
}
