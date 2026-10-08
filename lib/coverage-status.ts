import {
  isUndocumentedTermValue,
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
  type RelatedCoverage,
  type RelatedCoverageDetail,
} from "./insurance-normalization.ts";
import { isNonAssertingCoverageDetail } from "./coverage-fact-semantics.ts";

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
  coverageAvailability?: "included" | "unavailable";
  // Internal catalog-term assertion override; extraction cannot supply it.
  catalogSelectionConfirmed?: boolean;
  source?: CoverageSource;
  sources?: CoverageSource[];
};

export type CoverageInsurance = {
  importantTerms: CoverageTerm[];
  productName?: string | null;
  catalogProductName?: string;
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
  kind: "explicit_status" | "main_value" | "detail" | "restriction" | "add_on" | "catalog_definition";
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

type CoverageDetailCandidate = CoverageDetail & {
  evidence: CoverageEvidence;
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

export type CoverageStatusContext = {
  subject?: string;
  subjectAliases?: readonly string[];
  productName?: string;
};

function relativeStatusClauses(clause: string, context: CoverageStatusContext): string[] {
  const subjects = new Set(["dekningen", "forsikringen", context.subject ?? "", ...(context.subjectAliases ?? [])]
    .map(normalizeWords).filter(Boolean));
  return [clause, ...[...subjects].flatMap(subject =>
    clause.startsWith(`${subject} `) ? [clause.slice(subject.length + 1)] : [])];
}

function knownProductScope(scope: string, productName?: string): boolean {
  if (!productName) return false;
  const words = normalizeWords(productName).split(" ").filter(Boolean);
  return words.some((_, index) => {
    const product = words.slice(0, index + 1).join(" ");
    if (scope === product) return true;
    if (!scope.startsWith(`${product} `)) return false;
    const remainder = scope.slice(product.length + 1);
    return /^utover\s+.+$/u.test(remainder) ||
      /^uten\s+at\s+.+\s+(?:er\s+)?valgt(?:\s+og\s+.+)?$/u.test(remainder);
  });
}

function explicitStatusClause(clause: string, context: CoverageStatusContext): CoverageStatus | null {
  for (const relative of relativeStatusClauses(clause, context)) {
    if (["nei", "uten dekning", "ingen dekning"].includes(relative) ||
        /^(?:(?:er\s+)?ikke\s+|ikke\s+er\s+)(?:valgt|inkludert|omfattet|dekket|gjeldende)$/u.test(relative) ||
        /^(?:gjelder|dekker|dekkes|omfattes)\s+ikke$/u.test(relative)) return "not_selected";
    if (relative === "ja" || /^(?:er\s+)?(?:valgt|inkludert|omfattet|dekket|gjeldende)$/u.test(relative) ||
        /^(?:gjelder|dekkes|omfattes)$/u.test(relative)) return "selected";
    const scoped = /^(?:(?:er\s+)?ikke\s+(?:inkludert|omfattet|dekket|gjeldende)|(?:dekkes|omfattes)\s+ikke)\s+(?:i|på|av|under)\s+(.+)$/u.exec(relative);
    if (scoped && knownProductScope(scoped[1], context.productName)) return "not_selected";
  }
  return null;
}

export function coverageStatusFromText(
  value: string | null | undefined,
  context: CoverageStatusContext = {},
): CoverageStatus | null {
  if (!value?.trim() || isUndocumentedTermValue(value)) return "unknown";
  const fullStatus = explicitStatusClause(normalizeWords(value), context);
  if (fullStatus) return fullStatus;
  // Only a complete leading declaration can assert status. Negative wording
  // about geography, another object, or an exception remains descriptive text.
  const leading = value.split(/[;:!?]|\.(?:\s|$)/u)[0];
  const leadingStatus = explicitStatusClause(normalizeWords(leading), context);
  if (leadingStatus) return leadingStatus;
  // A field heading may precede a status, e.g. "Leiebil: Ikke valgt".
  const sentence = value.split(/[;!?]|\.(?:\s|$)/u)[0];
  return explicitStatusClause(normalizeWords(sentence), context);
}

function conditionalCoverageStatus(value: string, context: CoverageStatusContext): boolean {
  const leading = normalizeWords(value.split(/[,;!?]|\.(?:\s|$)/u)[0]);
  const conditional = /^(?:hvis|dersom|når|om|forutsatt\s+at)\s+(.+)$/u.exec(leading);
  return Boolean(conditional && relativeStatusClauses(conditional[1], context).some(clause =>
    /^(?:(?:er\s+)?(?:ikke\s+)?|ikke\s+er\s+)(?:valgt|inkludert|omfattet|dekket|gjeldende)(?:\s|$)/u.test(clause) ||
    /^(?:gjelder|dekker|dekkes|omfattes)(?:\s|$)/u.test(clause)));
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

function statusContext(term: CoverageTerm, insurance: CoverageInsurance, definition: RelatedCoverage): CoverageStatusContext {
  return {
    subject: term.name,
    subjectAliases: [definition.label, ...(definition.aliases ?? [])],
    productName: insurance.catalogProductName ?? insurance.productName ?? undefined,
  };
}

function mainEvidence(term: CoverageTerm, insurance: CoverageInsurance, definition: RelatedCoverage): CoverageEvidence {
  const origin = evidenceOrigin(term);
  const context = statusContext(term, insurance, definition);
  const parsed = coverageStatusFromText(term.value, context);
  const catalogCanAssert = origin === "document" || (term.catalogSelectionConfirmed ?? insurance.catalogSelectionConfirmed) === true;
  // Availability describes this catalog subject only after product selection
  // is confirmed. Customer evidence keeps its existing higher priority.
  const availability = origin === "catalog" && catalogCanAssert ? term.coverageAvailability : undefined;
  const status = !catalogCanAssert ? "unknown" : availability ?
    (availability === "included" ? "selected" : "not_selected") :
    parsed === "unknown" || conditionalCoverageStatus(term.value, context) ? "unknown" : parsed ?? "selected";
  const explicit = !availability && (parsed === "selected" || parsed === "not_selected");
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

function detailEvidence(term: CoverageTerm, key: string, insurance: CoverageInsurance, definition: RelatedCoverage): CoverageEvidence {
  const origin = evidenceOrigin(term);
  const context = statusContext(term, insurance, definition);
  const parsed = coverageStatusFromText(term.value, context);
  const catalogCanAssert = origin === "document" || insurance.catalogSelectionConfirmed === true;
  const availability = origin === "catalog" && catalogCanAssert ? term.coverageAvailability : undefined;
  const restriction = isNonAssertingCoverageDetail(key);
  const status = !restriction && catalogCanAssert && (availability ? availability === "included" :
    parsed !== "unknown" && parsed !== "not_selected" && !conditionalCoverageStatus(term.value, context)) ? "selected" : "unknown";
  return {
    status,
    kind: !catalogCanAssert ? "catalog_definition" : restriction ? "restriction" : "detail",
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

function effectiveCoverageDetails(details: CoverageDetailCandidate[]): CoverageDetail[] {
  const byKey = new Map<string, CoverageDetailCandidate[]>();
  for (const detail of details) {
    const candidates = byKey.get(detail.key) ?? [];
    candidates.push(detail);
    byKey.set(detail.key, candidates);
  }
  return [...byKey.values()].flatMap((candidates) => {
    // Precedence avgjøres én gang per canonical detaljnøkkel. Evidens fra
    // lavere prioritet beholdes i coverage.evidence, men blir ikke en effektiv
    // kundeverdi eller del av sammendraget.
    const highestPriority = Math.max(...candidates.map((candidate) => candidate.evidence.priority));
    return candidates
      .filter((candidate) => candidate.evidence.priority === highestPriority &&
        (candidate.evidence.status === "selected" ||
          (candidate.evidence.kind === "restriction" && !isUndocumentedTermValue(candidate.value))))
      .filter((candidate, index, selected) => selected.findIndex((item) =>
        item.key === candidate.key && normalizeWords(item.value) === normalizeWords(candidate.value)
      ) === index)
      .map((candidate) => ({
        key: candidate.key,
        label: candidate.label,
        value: candidate.value,
        sources: candidate.sources,
      }));
  });
}

function resolveCoverage(
  definition: RelatedCoverage,
  evidence: CoverageEvidence[],
  detailCandidates: CoverageDetailCandidate[],
): CanonicalCoverage {
  const assertions = evidence.filter((item) => item.status !== "unknown");
  const highestPriority = assertions.length ? Math.max(...assertions.map((item) => item.priority)) : 0;
  const strongest = assertions.filter((item) => item.priority === highestPriority);
  const statuses = new Set(strongest.map((item) => item.status));
  const conflict = statuses.size > 1;
  const status: CoverageStatus = !strongest.length || conflict ? "unknown" : strongest[0].status;
  const details = effectiveCoverageDetails(detailCandidates);
  const summaryParts = details.slice(0, 4).map((detail) => {
    const relation = relationDetail(definition, detail.key);
    return `${relation?.summaryLabel || detail.label}: ${detail.value}`;
  });
  const directSummary = strongest.find((item) => item.status === "selected" &&
    item.kind === "main_value" && !isPureStatusValue(item.value))?.value;
  const summary = status === "selected" ? summaryParts.join("; ") || directSummary || null : null;
  const supporting = conflict ? strongest : [
    ...strongest,
    ...details.flatMap((detail) =>
      detailCandidates.filter((candidate) => candidate.key === detail.key &&
        normalizeWords(candidate.value) === normalizeWords(detail.value) &&
        (status === "selected" || candidate.evidence.kind === "restriction")).map((candidate) => candidate.evidence)
    ),
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
    const details: CoverageDetailCandidate[] = [];
    for (const { term, key } of terms) {
      if (key === definition.parentKey) evidence.push(mainEvidence(term, insurance, definition));
      const relation = relationDetail(definition, key);
      if (!relation) continue;
      const item = detailEvidence(term, key, insurance, definition);
      evidence.push(item);
      details.push({ key, label: term.name, value: term.value, sources: item.sources, evidence: item });
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
