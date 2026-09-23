import {
  isUndocumentedTermValue,
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
  type RelatedCoverage,
  type RelatedCoverageDetail,
} from "./insurance-normalization.ts";

export type CoverageStatus = "selected" | "not_selected" | "unknown";

export type CoverageSource = {
  documentId: string;
  filename: string;
  termsNumber: string;
  effectiveFrom: string;
  page: number;
  section: string;
  note?: string;
  company?: string;
  url?: string;
};

export type CoverageTerm = {
  name: string;
  value: string;
  key?: string;
  coverageOrigin?: "document" | "catalog";
  source?: CoverageSource;
  sources?: CoverageSource[];
};

export type CoverageInsurance = {
  importantTerms: CoverageTerm[];
  addOns?: {
    id?: string;
    name: string;
    importantTerms: CoverageTerm[];
    source?: { id: string } | null;
    coverageOrigin?: "document" | "catalog";
  }[];
  catalogSelectionConfirmed?: boolean;
};

export type CoverageEvidence = {
  status: CoverageStatus;
  kind: "explicit_status" | "main_value" | "detail" | "add_on" | "catalog_definition";
  origin: "document" | "catalog";
  priority: number;
  label: string;
  value: string;
  sources: CoverageSource[];
};

export type CoverageDetail = {
  key: string;
  label: string;
  value: string;
  sources: CoverageSource[];
};

export type CanonicalCoverage = {
  id: string;
  label: string;
  status: CoverageStatus;
  summary: string | null;
  details: CoverageDetail[];
  sources: CoverageSource[];
  evidence: CoverageEvidence[];
  conflict: boolean;
};

const normalizeWords = (value: string) => value.normalize("NFKC").toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/gu, " ").trim();

const negativeStatus = /\b(?:er\s+)?ikke\s+(?:valgt|inkludert|omfattet|dekket|gjeldende)\b/u;
const positiveStatus = /\b(?:er\s+)?(?:valgt|inkludert|omfattet|dekket)\b/u;

export function coverageStatusFromText(value: string | null | undefined): CoverageStatus | null {
  if (!value?.trim() || isUndocumentedTermValue(value)) return "unknown";
  const normalized = normalizeWords(value);
  if (normalized === "nei" || normalized === "uten dekning" || negativeStatus.test(normalized) ||
      /\b(?:gjelder|dekker)\s+ikke\b/u.test(normalized)) return "not_selected";
  if (normalized === "ja" || positiveStatus.test(normalized) || normalized === "gjelder") return "selected";
  return null;
}

export function coverageStatusLabel(status: CoverageStatus, summary?: string | null): string {
  if (status === "selected") return `✓ Valgt${summary ? ` – ${summary}` : ""}`;
  if (status === "not_selected") return "❌ Ikke valgt";
  return "— Ikke dokumentert";
}

function sources(term: CoverageTerm): CoverageSource[] {
  return term.sources ?? (term.source ? [term.source] : []);
}

function sameSource(first: CoverageSource, second: CoverageSource): boolean {
  return first.documentId === second.documentId && first.section === second.section && first.page === second.page;
}

function uniqueSources(items: readonly CoverageSource[]): CoverageSource[] {
  return items.filter((source, index) => items.findIndex((candidate) => sameSource(candidate, source)) === index);
}

function relationDetail(definition: RelatedCoverage, key: string): RelatedCoverageDetail | null {
  return definition.details.find((detail) => detail.key === key ||
    (detail.keyPrefix ? key.startsWith(detail.keyPrefix) : false)) ?? null;
}

function normalizedTerms(insurance: CoverageInsurance, insuranceType: string) {
  const definitions = relatedCoveragesForInsuranceType(insuranceType);
  const parentKeys = insurance.importantTerms.flatMap((term) => {
    const key = term.key ? normalizeCatalogTermKey(term.key) : normalizeTermName(term.name, { insuranceType });
    return definitions.some((definition) => definition.parentKey === key) ? [key] : [];
  });
  return insurance.importantTerms.map((term) => ({
    term,
    key: term.key ? normalizeCatalogTermKey(term.key) : normalizeTermName(term.name, {
      insuranceType,
      relatedCoverageParentKeys: parentKeys,
      termValue: term.value,
    }),
  }));
}

function inferredDefinitions(
  definitions: readonly RelatedCoverage[],
  terms: ReturnType<typeof normalizedTerms>,
): RelatedCoverage[] {
  const result = [...definitions];
  for (const { key, term } of terms) {
    if (!/(?:^|\.)dekning$/u.test(key) || result.some((definition) => definition.parentKey === key)) continue;
    result.push({ parentKey: key, label: term.name, details: [] });
  }
  return result;
}

function evidenceOrigin(term: CoverageTerm): CoverageEvidence["origin"] {
  return term.coverageOrigin ?? "document";
}

function mainEvidence(term: CoverageTerm, insurance: CoverageInsurance): CoverageEvidence {
  const origin = evidenceOrigin(term);
  const parsed = coverageStatusFromText(term.value);
  const catalogCanAssert = origin === "document" || insurance.catalogSelectionConfirmed === true;
  const status = catalogCanAssert ? (parsed === "unknown" ? "unknown" : parsed ?? "selected") : "unknown";
  const explicit = parsed === "selected" || parsed === "not_selected";
  return {
    status,
    kind: !catalogCanAssert ? "catalog_definition" : explicit ? "explicit_status" : "main_value",
    origin,
    priority: !catalogCanAssert ? 0 : origin === "document" ? (explicit ? 400 : 280) : 200,
    label: term.name,
    value: term.value,
    sources: sources(term),
  };
}

function detailEvidence(term: CoverageTerm, insurance: CoverageInsurance): CoverageEvidence {
  const origin = evidenceOrigin(term);
  const parsed = coverageStatusFromText(term.value);
  const catalogCanAssert = origin === "document" || insurance.catalogSelectionConfirmed === true;
  const status = catalogCanAssert && parsed !== "unknown" && parsed !== "not_selected" ? "selected" : "unknown";
  return {
    status,
    kind: !catalogCanAssert ? "catalog_definition" : "detail",
    origin,
    priority: !catalogCanAssert ? 0 : origin === "document" ? 250 : 180,
    label: term.name,
    value: term.value,
    sources: sources(term),
  };
}

function definitionForAddOn(name: string, insuranceType: string, definitions: readonly RelatedCoverage[]) {
  const key = normalizeTermName(name, { insuranceType });
  return definitions.find((definition) => definition.parentKey === key ||
    definition.aliases?.some((alias) => normalizeWords(alias) === normalizeWords(name))) ?? null;
}

function isPureStatusValue(value: string): boolean {
  const normalized = normalizeWords(value);
  return normalized === "ja" || normalized === "gjelder" ||
    /^(?:.+\s+)?(?:er\s+)?(?:valgt|inkludert|omfattet|dekket)$/u.test(normalized);
}

function resolveCoverage(definition: RelatedCoverage, evidence: CoverageEvidence[], details: CoverageDetail[]): CanonicalCoverage {
  const assertions = evidence.filter((item) => item.status !== "unknown");
  const highestPriority = assertions.length ? Math.max(...assertions.map((item) => item.priority)) : 0;
  const strongest = assertions.filter((item) => item.priority === highestPriority);
  const statuses = new Set(strongest.map((item) => item.status));
  const conflict = statuses.size > 1;
  const status: CoverageStatus = !strongest.length || conflict ? "unknown" : strongest[0].status;
  const selectedDetails = details.filter((detail) =>
    evidence.some((item) => item.kind === "detail" && item.status === "selected" &&
      item.label === detail.label && item.value === detail.value)
  );
  const summaryParts = selectedDetails.slice(0, 4).map((detail) => {
    const relation = relationDetail(definition, detail.key);
    return `${relation?.summaryLabel || detail.label}: ${detail.value}`;
  });
  const directSummary = strongest.find((item) => item.status === "selected" &&
    item.kind === "main_value" && !isPureStatusValue(item.value))?.value;
  const summary = status === "selected" ? summaryParts.join("; ") || directSummary || null : null;
  const supporting = conflict ? strongest : [
    ...strongest,
    ...(status === "selected" ? evidence.filter((item) => item.kind === "detail" && item.status === "selected") : []),
  ];
  return {
    id: definition.parentKey,
    label: definition.label,
    status,
    summary,
    details,
    sources: uniqueSources(supporting.flatMap((item) => item.sources)),
    evidence,
    conflict,
  };
}

export function deriveCanonicalCoverages(insurance: CoverageInsurance, insuranceType: string): CanonicalCoverage[] {
  const terms = normalizedTerms(insurance, insuranceType);
  const definitions = inferredDefinitions(relatedCoveragesForInsuranceType(insuranceType), terms);
  return definitions.map((definition) => {
    const evidence: CoverageEvidence[] = [];
    const details: CoverageDetail[] = [];
    for (const { term, key } of terms) {
      if (key === definition.parentKey) evidence.push(mainEvidence(term, insurance));
      const relation = relationDetail(definition, key);
      if (!relation) continue;
      const item = detailEvidence(term, insurance);
      evidence.push(item);
      details.push({ key, label: term.name, value: term.value, sources: item.sources });
    }
    for (const addOn of insurance.addOns ?? []) {
      if (definitionForAddOn(addOn.name, insuranceType, definitions)?.parentKey !== definition.parentKey) continue;
      const origin = addOn.coverageOrigin ?? (addOn.id || addOn.source ? "catalog" : "document");
      const catalogCanAssert = origin === "document" || insurance.catalogSelectionConfirmed === true;
      evidence.push({
        status: catalogCanAssert ? "selected" : "unknown",
        kind: catalogCanAssert ? "add_on" : "catalog_definition",
        origin,
        priority: catalogCanAssert ? 300 : 0,
        label: addOn.name,
        value: addOn.name,
        sources: [],
      });
    }
    return resolveCoverage(definition, evidence, details);
  });
}

export function canonicalCoverage(
  insurance: CoverageInsurance,
  insuranceType: string,
  coverageId: string,
): CanonicalCoverage | null {
  return deriveCanonicalCoverages(insurance, insuranceType).find((coverage) => coverage.id === coverageId) ?? null;
}
