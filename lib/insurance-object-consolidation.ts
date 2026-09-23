import { consolidationGroups, type AgreementPeriod, type ConsolidationInfo, type ConsolidationIssue, type DocumentRole } from "./object-consolidation.ts";
import { objectIdentity } from "./object-matching.ts";
import { defaultIdentifierStrategies, type IdentifierStrategies } from "./object-identity-strategies.ts";
import { canonicalProviderId, findCatalogProductBySelection } from "./product-catalog.ts";
import { normalizeCatalogTermKey, normalizeInsuranceType, normalizeTermName, relatedCoveragesForInsuranceType } from "./insurance-normalization.ts";
import { normalizeDocumentFacts, type DocumentFact } from "./document-fact-normalization.ts";
import type { ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import type { FactSource } from "./comparison.ts";

export type DocumentTerm = ExtractedTerm & { key?: string; coverageOrigin?: "document" | "catalog"; sources?: FactSource[]; source?: FactSource };
export type DocumentObjectRecord = Omit<ExtractedInsurance, "importantTerms"> & {
  company: string | null;
  analysisObjectId: string;
  documentReferences: { side: "existing" | "offer"; documentIndex: number }[];
  documentSources: FactSource[];
  importantTerms: DocumentTerm[];
};
export type ConsolidatedDocumentObject = DocumentObjectRecord & {
  consolidation: ConsolidationInfo;
  recordEvidence: { productName: string | null; company: string | null; documentRole: DocumentRole; agreementPeriod: AgreementPeriod | null; annualPremium: string | null; deductible: string | null; sources: FactSource[]; importantTerms: DocumentTerm[] }[];
};
type Candidate = { fact: DocumentFact; role: DocumentRole };
const textIdentity = (value: string) => value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("nb-NO");
const unique = <T>(items: readonly T[], key: (item: T) => string): T[] => [...new Map(items.map(item => [key(item), item])).entries()].sort(([a], [b]) => a.localeCompare(b, "en")).map(([, item]) => item);
const sourcesOf = (term: { source?: FactSource; sources?: FactSource[] }) => [...(term.source ? [term.source] : []), ...(term.sources ?? [])];
const sourceKey = (source: FactSource) => JSON.stringify([source.documentId, source.page, source.section, source.url, source.documentRole]);
const uniqueSources = (sources: FactSource[]) => unique(sources, sourceKey);
const factKey = (term: DocumentTerm, type: string) => normalizeCatalogTermKey(term.key ?? normalizeTermName(term.name, { insuranceType: type, termValue: term.value }));

function providerIdentity(record: DocumentObjectRecord): string | null {
  return record.company ? canonicalProviderId(record.company) ?? textIdentity(record.company) : null;
}
function productIdentity(record: DocumentObjectRecord, company: string | null): string | null {
  const name = record.canonicalProductName === undefined ? record.productName : record.canonicalProductName;
  if (!name) return null;
  const product = company && findCatalogProductBySelection(company, record.type, name);
  return product ? `${product.providerId}:${product.productId}:${product.version ?? ""}` : textIdentity(name);
}
export function insuranceConsolidationIssues(records: readonly DocumentObjectRecord[]): ConsolidationIssue[] {
  const issues: ConsolidationIssue[] = [];
  const providers = new Set(records.map(providerIdentity).filter(Boolean));
  if (providers.size > 1) issues.push("provider_conflict");
  const company = records.find(record => record.company)?.company ?? null;
  if (new Set(records.map(record => productIdentity(record, company)).filter(Boolean)).size > 1) issues.push("product_conflict");
  if (["from", "to"].some(key => new Set(records.map(record => record.agreementPeriod?.[key as keyof AgreementPeriod]).filter(Boolean)).size > 1)) issues.push("temporal_conflict");
  return issues;
}

// Only a documented individual agreement outranks documented general terms.
// Unknown document roles do NOT receive an invented lower priority.
function preferred<T extends { role: DocumentRole }>(items: T[]): T[] {
  return items.some(item => item.role === "individual_agreement") ? items.filter(item => item.role !== "general_terms") : items;
}
function resolveFacts(records: readonly DocumentObjectRecord[]) {
  const type = records[0].type;
  const candidates: Candidate[] = records.flatMap(record => normalizeDocumentFacts({
    ...record,
    importantTerms: record.importantTerms.filter(term => term.coverageOrigin !== "catalog"),
  }).map(fact => ({ fact: { ...fact, sources: uniqueSources(sourcesOf(fact).length ? sourcesOf(fact) : record.documentSources) }, role: record.documentRole ?? "unknown" })));
  const definitions = relatedCoveragesForInsuranceType(type);
  const byKey = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const key = factKey(candidate.fact, type);
    byKey.set(key, [...(byKey.get(key) ?? []), candidate]);
  }
  const conflicts: { key: string; values: string[] }[] = [];
  const terms: DocumentFact[] = [];
  for (const [key, all] of [...byKey].sort(([a], [b]) => a.localeCompare(b, "en"))) {
    let kept = preferred(all);
    // A generic coverage assertion cannot defeat concrete agreement evidence
    // merely because it is a parent key and the concrete evidence is a detail.
    const definition = definitions.find(definition => definition.parentKey === key);
    if (definition && candidates.some(candidate => candidate.role === "individual_agreement" && definition.details.some(detail => detail.key === factKey(candidate.fact, type)))) {
      kept = kept.filter(candidate => candidate.role !== "general_terms");
    }
    const groups = new Map<string, Candidate[]>();
    for (const candidate of kept) {
      const value = textIdentity(candidate.fact.value);
      groups.set(value, [...(groups.get(value) ?? []), candidate]);
    }
    if (groups.size > 1) conflicts.push({ key, values: [...groups.values()].map(items => items[0].fact.value).sort() });
    for (const items of groups.values()) {
      const fact = [...items].sort((a,b) => a.fact.name.localeCompare(b.fact.name, "en") || a.fact.value.localeCompare(b.fact.value, "en"))[0].fact;
      const lower = all.filter(candidate => !kept.includes(candidate));
      terms.push({ ...fact, sources: uniqueSources(items.flatMap(item => sourcesOf(item.fact))),
        ...(lower.length ? { overriddenBase: lower.flatMap(item => sourcesOf(item.fact).map(source => ({ value: item.fact.value, source }))) } : {}),
      });
    }
  }
  return { terms, conflicts };
}
function scalar(records: readonly DocumentObjectRecord[], field: "annualPremium" | "deductible") {
  const candidates = records.flatMap(record => record[field] ? [{ value: record[field]!, role: record.documentRole ?? "unknown" }] : []);
  const values = unique(preferred(candidates), item => textIdentity(item.value)).map(item => item.value);
  return { value: values.length ? values.join(" · ") : null, conflict: values.length > 1 ? { key: field, values } : null };
}
function mergeRecords(records: readonly DocumentObjectRecord[]): ConsolidatedDocumentObject {
  records = [...records].sort((a,b) => JSON.stringify([a.documentReferences, a.productName, a.importantTerms]).localeCompare(JSON.stringify([b.documentReferences, b.productName, b.importantTerms]), "en"));
  const first = records[0];
  const resolved = resolveFacts(records);
  const premium = scalar(records, "annualPremium"), deductible = scalar(records, "deductible");
  const conflicts = [...resolved.conflicts, ...[premium.conflict, deductible.conflict].filter((conflict): conflict is NonNullable<typeof conflict> => conflict !== null)];
  const canonicalNames = unique(records.flatMap(record => record.canonicalProductName ? [record.canonicalProductName] : []), textIdentity);
  const displayNames = unique(records.flatMap(record => record.productName ? [record.productName] : []), textIdentity);
  const companies = unique(records.flatMap(record => record.company ? [record.company] : []), textIdentity);
  const identifiers = new Map<string, NonNullable<ExtractedInsurance["objectIdentifiers"]>[number]>();
  for (const record of records) for (const id of record.objectIdentifiers ?? []) {
    const key = JSON.stringify([id.type, textIdentity(id.value)]);
    const previous = identifiers.get(key);
    identifiers.set(key, { type: id.type, value: id.value, sources: uniqueSources([...(previous?.sources ?? []), ...(id.sources ?? [])]) });
  }
  const addOns = new Map<string, ExtractedInsurance["addOns"][number]>();
  for (const record of records) for (const addon of record.addOns) {
    const key = normalizeTermName(addon.name, { insuranceType: first.type });
    const previous = addOns.get(key);
    // Coverage status is resolved from the merged canonical evidence below;
    // deduplication of addon names must never turn an explicit refusal selected.
    addOns.set(key, {
      ...addon,
      annualPremium: unique([previous?.annualPremium, addon.annualPremium].filter((v): v is string => Boolean(v)), textIdentity).join(" · ") || null,
      deductible: unique([previous?.deductible, addon.deductible].filter((v): v is string => Boolean(v)), textIdentity).join(" · ") || null,
      importantTerms: [...(previous?.importantTerms ?? []), ...addon.importantTerms],
    });
  }
  const from = records.find(record => record.agreementPeriod?.from)?.agreementPeriod?.from ?? null;
  const to = records.find(record => record.agreementPeriod?.to)?.agreementPeriod?.to ?? null;
  return {
    ...first,
    type: normalizeInsuranceType(first.type, first),
    productName: displayNames.length === 1 ? displayNames[0] : canonicalNames[0] ?? (displayNames.join(" · ") || null),
    canonicalProductName: canonicalNames[0] ?? first.canonicalProductName,
    company: companies[0] ?? null,
    annualPremium: conflicts.some(conflict => conflict.key === "premie.total") ? null : premium.value,
    deductible: deductible.value,
    coverageSummary: unique(records.flatMap(record => record.coverageSummary ? [record.coverageSummary] : []), textIdentity).join("\n") || null,
    documentRole: records.every(record => record.documentRole === first.documentRole) ? first.documentRole : "unknown",
    agreementPeriod: from || to ? { from, to } : null,
    documentIndices: undefined,
    objectIdentifiers: [...identifiers.values()],
    documentReferences: unique(records.flatMap(record => record.documentReferences), reference => `${reference.side}:${reference.documentIndex}`),
    documentSources: uniqueSources(records.flatMap(record => record.documentSources)),
    importantTerms: resolved.terms,
    addOns: [...addOns.values()].sort((a,b) => a.name.localeCompare(b.name, "en")),
    consolidation: { status: "consolidated", recordCount: records.length, issues: [], factConflicts: conflicts },
    recordEvidence: records.map(record => ({ productName: record.productName, company: record.company, documentRole: record.documentRole ?? "unknown", agreementPeriod: record.agreementPeriod ?? null, annualPremium: record.annualPremium, deductible: record.deductible, sources: record.documentSources, importantTerms: record.importantTerms })),
  };
}

// Returned indices refer only to same-side input records. They are not identity.
export function consolidateInsuranceRecords(records: readonly DocumentObjectRecord[], strategies: IdentifierStrategies = defaultIdentifierStrategies) {
  const sides = new Set(records.flatMap(record => record.documentReferences.map(reference => reference.side)));
  if (sides.size > 1) throw new Error("Object consolidation requires records from one side only.");
  const groups = consolidationGroups(records, insuranceConsolidationIssues, strategies);
  const output = groups.flatMap<{ record: ConsolidatedDocumentObject; indices: number[] }>(group => {
    if (group.status === "consolidated") return [{ record: mergeRecords(group.indices.map(index => records[index])), indices: group.indices }];
    return group.indices.map(index => ({ record: {
      ...records[index],
      consolidation: { status: group.status, recordCount: 1, issues: group.issues },
      recordEvidence: [{ productName: records[index].productName, company: records[index].company, documentRole: records[index].documentRole ?? "unknown", agreementPeriod: records[index].agreementPeriod ?? null, annualPremium: records[index].annualPremium, deductible: records[index].deductible, sources: records[index].documentSources, importantTerms: records[index].importantTerms }],
    } satisfies ConsolidatedDocumentObject, indices: [index] }));
  });
  if (!groups.some(group => group.status === "consolidated")) return output;
  return output.sort((a,b) => {
    const key = (record: DocumentObjectRecord) => {
      const identity = objectIdentity(record, strategies);
      return JSON.stringify([identity.insuranceType, [...identity.keys].sort()]);
    };
    return key(a.record).localeCompare(key(b.record), "en") || a.indices[0] - b.indices[0];
  });
}
