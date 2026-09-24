import type { FactSource, TermGroup } from "./comparison.ts";
import { coverageStatusLabel, type CanonicalCoverage } from "./coverage-status.ts";

export type DetailRow = { key: string; label: string; first: string; second: string;
  firstDescription?: string; secondDescription?: string };
export type CoverageDetailPresentation = {
  hasAdditional: boolean;
  compact: DetailRow[];
  additional: DetailRow[];
  sources: { side: "first" | "second"; key: string; label: string; value: string; source: FactSource; origin?: "document" | "catalog" }[];
};

export function hasMeaningfulAdditionalDetails(model: Pick<CoverageDetailPresentation, "compact" | "additional">): boolean {
  const shown = new Set(model.compact.map(row => row.key));
  return model.additional.some(row => !shown.has(row.key));
}

const sourceIdentity = (source: FactSource) => JSON.stringify([source.documentId, source.filename, source.page, source.section, source.documentRole ?? null]);
const plain = (value: string) => value.toLocaleLowerCase("nb-NO").replace(/\s+/gu, " ").trim();
// Lossless display factoring, not extraction: remove a semicolon-separated
// suffix ONLY if it consists entirely of literal existing detail labels/values.
// Any unrepresented qualifier keeps the entire original text in the details.
function description(coverage: CanonicalCoverage | null) {
  if (coverage?.status !== "selected") return null;
  const main = coverage.evidence.filter(item => item.kind === "main_value" && item.status === "selected");
  const priority = Math.max(...main.map(item => item.priority));
  const chosen = main.filter(item => item.priority === priority);
  const text = [...new Set(chosen.map(item => item.value))].join(" · ");
  if (!text) return null;
  if (!coverage.details.length) return { text, compact: true, evidence: chosen };
  const separator = text.indexOf(";");
  if (separator >= 0) {
    let rest = plain(text.slice(separator + 1));
    const fragments = coverage.details.flatMap(detail => {
      const label = detail.label.split(/\s+[–-]\s+/u).at(-1)!;
      return [`${label} ${detail.value}`, `${label}: ${detail.value}`, detail.value].map(plain);
    }).sort((a,b) => b.length - a.length);
    for (const fragment of fragments) rest = rest.split(fragment).join("");
    if (!rest.replace(/(?:\bog\b)|[\s;,.]/gu, "")) return { text: text.slice(0, separator).trim(), compact: true, evidence: chosen };
  }
  // A genuine main description without literal repetitions is already distinct
  // from structured values; don't use the engine's synthesized detail summary.
  const repeats = coverage.details.some(detail => plain(text).includes(plain(detail.value)));
  return { text, compact: !repeats, evidence: chosen };
}

// Input is already resolved and scoped to one concept of one object pair.
// Sources follow fact identity; no lookup, new facts or coverage decisions.
export function coverageDetailPresentation(terms: TermGroup[]): CoverageDetailPresentation {
  const compact: DetailRow[] = [], additional: DetailRow[] = [];
  const sources: CoverageDetailPresentation["sources"] = [];
  const seen = new Set<string>();
  const addSource = (entry: CoverageDetailPresentation["sources"][number]) => {
    if (!sources.some(item => item.side === entry.side && item.key === entry.key && sourceIdentity(item.source) === sourceIdentity(entry.source))) sources.push(entry);
  };
  for (const term of terms) {
    if (seen.has(term.key)) continue;
    seen.add(term.key);
    const coverage = term.firstCoverage || term.secondCoverage;
    const descriptions = { first: description(term.firstCoverage), second: description(term.secondCoverage) };
    for (const side of ["first", "second"] as const) {
      const own = term[`${side}Coverage`];
      if (own) {
        const matching = own.evidence.filter(item => item.status === own.status && own.status !== "unknown");
        const strongest = Math.max(...matching.map(item => item.priority ?? 0));
        for (const evidence of matching.filter(item => (item.priority ?? 0) === strongest)) for (const source of evidence.sources) {
          addSource({ side, key: term.key, label: own.label, value: coverageStatusLabel(own.status), source, origin: evidence.origin });
        }
        for (const evidence of descriptions[side]?.evidence ?? []) for (const source of evidence.sources) {
          addSource({ side, key: descriptions[side]?.compact ? term.key : `${term.key}:description`, label: own.label,
            value: descriptions[side]!.text, source, origin: evidence.origin });
        }
      } else if (term[side]) for (const source of term[`${side}Sources`]) {
        const origin = term[`${side}SourceOrigins`]?.find(item => sourceIdentity(item.source) === sourceIdentity(source))?.origin;
        addSource({ side, key: term.key, label: term.label, value: term[side]!, source, origin });
      }
    }
    if (coverage) {
      compact.push({ key: `${term.key}:status`, label: coverage.label,
        first: coverageStatusLabel(term.firstCoverage?.status ?? "unknown"),
        second: coverageStatusLabel(term.secondCoverage?.status ?? "unknown"),
        firstDescription: descriptions.first?.compact ? descriptions.first.text : undefined,
        secondDescription: descriptions.second?.compact ? descriptions.second.text : undefined });
      if (descriptions.first?.compact === false || descriptions.second?.compact === false) additional.push({ key: `${term.key}:description`, label: coverage.label,
        first: descriptions.first?.compact === false ? descriptions.first.text : term.firstMissingLabel,
        second: descriptions.second?.compact === false ? descriptions.second.text : term.secondMissingLabel });
      continue;
    }
    if (!term.first && !term.second) continue;
    const row = { key: term.key, label: term.label, first: term.first || term.firstMissingLabel, second: term.second || term.secondMissingLabel };
    // Keep age/km as compact anchors. Monetary limits, durations, exclusions,
    // counts and deductibles belong in the existing detail level.
    const anchor = /\.(?:alder|km)$/u.test(term.key);
    (anchor ? compact : additional).push(row);
  }
  if (!compact.length && additional.length) compact.push(additional.shift()!);
  return { compact, additional, sources, hasAdditional: hasMeaningfulAdditionalDetails({ compact, additional }) };
}
