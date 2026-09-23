import { objectIdentity, type IdentifiedObject } from "./object-matching.ts";
import { defaultIdentifierStrategies, type IdentifierStrategies } from "./object-identity-strategies.ts";

export type DocumentRole = "individual_agreement" | "general_terms" | "unknown";
export type AgreementPeriod = { from: string | null; to: string | null };
export type ConsolidationIssue = "identity_conflict" | "provider_conflict" | "product_conflict" | "temporal_conflict";
export type ConsolidationInfo = {
  status: "standalone" | "consolidated" | "unresolved";
  recordCount: number;
  issues: ConsolidationIssue[];
  factConflicts?: { key: string; values: string[] }[];
};
export type ConsolidationGroup = { indices: number[]; status: ConsolidationInfo["status"]; issues: ConsolidationIssue[] };

// Same-side only. Index exact typed identifiers, then examine each connected
// component as a whole: a conflicting bridge must never produce a partial merge.
// Product/fact policy is supplied separately from this general identity layer.
export function consolidationGroups<T extends IdentifiedObject>(
  records: readonly T[],
  compatible: (records: readonly T[]) => ConsolidationIssue[] = () => [],
  strategies: IdentifierStrategies = defaultIdentifierStrategies,
): ConsolidationGroup[] {
  const identities = records.map(record => objectIdentity(record, strategies));
  const parent = records.map((_, index) => index);
  const root = (index: number): number => {
    while (parent[index] !== index) { parent[index] = parent[parent[index]]; index = parent[index]; }
    return index;
  };
  const index = new Map<string, number>();
  identities.forEach((identity, position) => {
    for (const [kind, value] of identity.tokens) {
      const key = JSON.stringify([identity.insuranceType, kind, value]);
      const prior = index.get(key);
      if (prior === undefined) index.set(key, position);
      else parent[root(position)] = root(prior);
    }
  });
  const components = new Map<number, number[]>();
  records.forEach((_, position) => {
    const component = root(position);
    components.set(component, [...(components.get(component) ?? []), position]);
  });
  return [...components.values()].map(indices => {
    if (indices.length === 1) return { indices, status: "standalone", issues: [] };
    const values = new Map<string, Set<string>>();
    for (const position of indices) for (const [kind, value] of identities[position].tokens) {
      const set = values.get(kind) ?? new Set<string>(); set.add(value); values.set(kind, set);
    }
    const issues: ConsolidationIssue[] = [];
    if (indices.some(i => identities[i].invalid) || [...values.values()].some(values => values.size > 1)) issues.push("identity_conflict");
    issues.push(...compatible(indices.map(i => records[i])));
    return { indices, status: issues.length ? "unresolved" : "consolidated", issues: [...new Set(issues)] };
  });
}
