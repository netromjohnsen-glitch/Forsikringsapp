import type { FactSource, TermGroup } from "./comparison.ts";
import { coverageStatusLabel } from "./coverage-status.ts";

export type DetailRow = { key: string; label: string; first: string; second: string };
export type CoverageDetailPresentation = {
  hasAdditional: boolean;
  compact: DetailRow[];
  additional: DetailRow[];
  sources: { side: "first" | "second"; source: FactSource }[];
};

export function hasMeaningfulAdditionalDetails(model: Pick<CoverageDetailPresentation, "compact" | "additional">): boolean {
  const shown = new Set(model.compact.map(row => row.key));
  return model.additional.some(row => !shown.has(row.key));
}

// Input is already resolved, ordered and scoped to one concept of one object
// pair. No catalog lookup, textual inference or status resolution occurs here.
export function coverageDetailPresentation(terms: TermGroup[]): CoverageDetailPresentation {
  const compact: DetailRow[] = [], additional: DetailRow[] = [];
  const sources: CoverageDetailPresentation["sources"] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    if (seen.has(term.key)) continue;
    seen.add(term.key);
    for (const side of ["first", "second"] as const) {
      for (const source of term[`${side}Sources`]) {
        if (!sources.some(item => item.side === side && JSON.stringify(item.source) === JSON.stringify(source))) sources.push({ side, source });
      }
    }
    const coverage = term.firstCoverage || term.secondCoverage;
    if (coverage) {
      compact.push({ key: `${term.key}:status`, label: term.label,
        first: coverageStatusLabel(term.firstCoverage?.status ?? "unknown"),
        second: coverageStatusLabel(term.secondCoverage?.status ?? "unknown") });
      // summary is synthesized from details when they exist. Never render that
      // second representation as another fact. A direct effective summary with
      // no structured details remains intact, without parsing it into subfacts.
      const direct = (side: "first" | "second") => {
        const value = term[`${side}Coverage`];
        return value?.status === "selected" && !value.details.length ? value.summary : null;
      };
      if (direct("first") || direct("second")) additional.push({ key: `${term.key}:description`, label: term.label,
        first: direct("first") || term.firstMissingLabel, second: direct("second") || term.secondMissingLabel });
      continue;
    }
    if (!term.first && !term.second) continue;
    const row = { key: term.key, label: term.label, first: term.first || term.firstMissingLabel, second: term.second || term.secondMissingLabel };
    // Canonical identities, not rendered text or length, determine compactness.
    const isLimit = /(?:^|\.)(?:sum|grense|total|per_gjenstand|alder|km|dager|varighet)(?:\.|$)/u.test(term.key);
    (isLimit ? compact : additional).push(row);
  }
  // A concept without a coverage status/limit still has a useful compact fact.
  if (!compact.length && additional.length) compact.push(additional.shift()!);
  return { compact, additional, sources, hasAdditional: hasMeaningfulAdditionalDetails({ compact, additional }) };
}
