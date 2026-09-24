import type { MeasureSync } from "./analysis-telemetry.ts";
import type { TraceObjectObserver } from "./production-trace.ts";
import type { ExtractedAgreement, ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
  isUndocumentedTermValue,
} from "./insurance-normalization.ts";
import { deriveCanonicalCoverages } from "./coverage-status.ts";
import { normalizeDocumentFacts, type DocumentFact } from "./document-fact-normalization.ts";
import {
  findCatalogProductBySelection,
  availableAddOns,
  resolveCatalogEvidence,
  resolveCatalogFacts,
  type CatalogFact,
} from "./product-catalog.ts";

type EnrichedTerm = ExtractedTerm & {
  key?: string;
  coverageOrigin?: "document" | "catalog";
  source?: CatalogFact["source"];
  sources?: CatalogFact["source"][];
  deductibleClassification?: CatalogFact["deductibleClassification"];
  structuredValue?: CatalogFact["structuredValue"];
  overriddenBase?: { value: string; source: CatalogFact["source"] }[];
};

export type CatalogEnrichedInsurance = Omit<ExtractedInsurance, "importantTerms"> & {
  importantTerms: EnrichedTerm[];
  addOns: (ExtractedInsurance["addOns"][number] & { classification?: "standard" | "add_on" })[];
  catalogReference?: { providerId: string; productId: string; version: string | null } | null;
  catalogSelectionConfirmed?: boolean;
  catalogFacts?: CatalogFact[] | null;
  addOnIds?: string[];
};

export type CatalogEnrichedAgreement = Omit<ExtractedAgreement, "insurances"> & {
  insurances: CatalogEnrichedInsurance[];
};

function catalogTerm(fact: CatalogFact, allFacts: readonly CatalogFact[]): EnrichedTerm {
  return {
    name: fact.label,
    value: fact.value,
    key: fact.key,
    coverageOrigin: "catalog",
    structuredValue: fact.structuredValue,
    deductibleClassification: fact.deductibleClassification,
    source: fact.source,
    sources: [fact.source],
    overriddenBase: fact.replacesBase
      ? allFacts.filter((base) => base.key === fact.key && base !== fact)
        .map((base) => ({ value: base.value, source: base.source }))
      : [],
  };
}

const normalizeLabel = (value: string) => value.normalize("NFKC")
  .toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

function enrichInsurance(
  company: string | null,
  insurance: ExtractedInsurance,
  asOf: Date,
  measure: MeasureSync,
  resolvedDocumentTerms?: DocumentFact[],
  trace?: TraceObjectObserver,
): CatalogEnrichedInsurance {
  // undefined betyr et eldre internt kall uten feltet; null fra dagens schema
  // betyr uttrykkelig at produktnivået ikke kunne identifiseres sikkert.
  const productIdentity = insurance.canonicalProductName === undefined
    ? insurance.productName
    : insurance.canonicalProductName;
  const product = measure("catalogLookup", () => company && productIdentity
    ? findCatalogProductBySelection(company, insurance.type, productIdentity)
    : null);
  trace?.product(insurance, product);
  let documentTerms = resolvedDocumentTerms ?? measure("documentNormalization", () => {
    const normalized = normalizeDocumentFacts(insurance);
    trace?.normalization(insurance, normalized);
    return normalized;
  });
  const documentedTotals = [...new Set(documentTerms
    .filter((term) => term.key === "premie.total").map((term) => term.value))];
  // Bare en entydig, eksplisitt objekttotal kan erstatte det eldre premiefeltet.
  insurance = {
    ...insurance,
    annualPremium: documentedTotals.length === 1 ? documentedTotals[0] : insurance.annualPremium,
  };
  if (!product) {
    trace?.catalog({ documentTerms, effectiveFacts: [], catalogFacts: [], supplementalTerms: [], effectiveTerms: documentTerms, blockedKeys: [], product: null });
    return { ...insurance, importantTerms: documentTerms, catalogReference: null };
  }

  const effectiveFacts = resolveCatalogFacts(product, [], asOf, null);
  const catalogFacts = resolveCatalogEvidence(product, [], asOf, null);
  // An exact, unambiguous label from this identified product can establish a
  // fact identity. Previously it only suppressed the catalog fact, leaving
  // the document value stranded on a separate display-name row.
  documentTerms = documentTerms.map(term => {
    if (term.key) return term;
    const keys = new Set(effectiveFacts.filter(fact => normalizeLabel(fact.label) === normalizeLabel(term.name))
      .map(fact => normalizeCatalogTermKey(fact.key)));
    return keys.size === 1 ? { ...term, key: [...keys][0] } : term;
  });
  const documentedKeys = new Set(documentTerms.filter(term => !isUndocumentedTermValue(term.value)).map((term) => normalizeCatalogTermKey(
    term.key ?? normalizeTermName(term.name, { insuranceType: insurance.type, termValue: term.value }),
  )));
  for (const addOn of insurance.addOns) {
    documentedKeys.add(normalizeTermName(addOn.name, { insuranceType: insurance.type }));
  }
  const factKeys = new Set(effectiveFacts.map((fact) => normalizeCatalogTermKey(fact.key)));
  const coverageDefinitions = relatedCoveragesForInsuranceType(insurance.type);
  // Resolve the document's coverage set once, rather than re-deriving the
  // entire set once for every individual coverage definition.
  const documentCoverageStatuses = new Map(deriveCanonicalCoverages(
    { ...insurance, importantTerms: documentTerms }, insurance.type,
  ).map((coverage) => [coverage.id, coverage]));
  const coverageForFact = (fact: CatalogFact) => {
    const key = normalizeCatalogTermKey(fact.key);
    return coverageDefinitions.find((definition) => definition.parentKey === key ||
      (definition.parentKey.endsWith(".dekning") &&
        key.startsWith(definition.parentKey.slice(0, -"dekning".length))) ||
      definition.details.some((detail) => detail.key === key ||
        Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix))));
  };
  const blockedKeys: string[] = [];
  const traceDecisions: { key: string; decision: string }[] = [];
  const supplementalTerms = effectiveFacts
    .filter((fact) => {
      const definition = coverageForFact(fact);
      const documentCoverage = definition && documentCoverageStatuses.get(definition.parentKey);
      // Et eksplisitt avslag eller en dokumentert konflikt skal ikke få
      // katalogdetaljer presentert som kundens effektive vilkår.
      if (documentCoverage?.status === "not_selected" || documentCoverage?.conflict) {
        if (trace) {
          blockedKeys.push(normalizeCatalogTermKey(fact.key));
          traceDecisions.push({ key: normalizeCatalogTermKey(fact.key), decision: documentCoverage.conflict ? "CATALOG_CONFLICT" : "CATALOG_BLOCKED_BY_STATUS" });
        }
        return false;
      }
      // Detaljer uten en tilhørende hoveddekning beskriver bare en mulig
      // variant. De berikes først når kundedokumentet faktisk omtaler den.
      const included = !definition || factKeys.has(definition.parentKey) ||
        [...documentedKeys].some((key) => key === definition.parentKey ||
          definition.details.some((detail) => detail.key === key ||
            Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix))));
      if (trace && !included) traceDecisions.push({ key: normalizeCatalogTermKey(fact.key), decision: "CATALOG_NOT_APPLIED_OTHER_RULE" });
      return included;
    })
    .filter((fact) => {
      const included = !documentedKeys.has(normalizeCatalogTermKey(fact.key));
      if (trace) traceDecisions.push({ key: normalizeCatalogTermKey(fact.key), decision: included ? "CATALOG_APPLIED" : "DOCUMENT_PRESENT_SKIP_CATALOG" });
      return included;
    })
    .map((fact) => catalogTerm(fact, catalogFacts));

  const effectiveTerms = [...documentTerms.filter(term => !isUndocumentedTermValue(term.value) ||
    !supplementalTerms.some(fact => fact.key === term.key)), ...supplementalTerms].filter((term, index, terms) => {
    const key = normalizeCatalogTermKey(
      term.key ?? normalizeTermName(term.name, { insuranceType: insurance.type, termValue: term.value }),
    );
    if (term.coverageOrigin === "catalog" && terms.some((candidate) => {
      const candidateKey = normalizeCatalogTermKey(candidate.key ?? normalizeTermName(candidate.name, {
        insuranceType: insurance.type,
        termValue: candidate.value,
      }));
      return candidate.coverageOrigin === "document" && candidateKey === key;
    })) return false;
    return terms.findIndex((candidate) => {
      const candidateKey = normalizeCatalogTermKey(candidate.key ?? normalizeTermName(candidate.name, {
        insuranceType: insurance.type,
        termValue: candidate.value,
      }));
      return candidate.coverageOrigin === term.coverageOrigin && candidateKey === key &&
        normalizeLabel(candidate.value) === normalizeLabel(term.value);
    }) === index;
  });
  trace?.catalog({ documentTerms, effectiveFacts, catalogFacts, supplementalTerms, effectiveTerms, blockedKeys, product, decisions: traceDecisions });

  return {
    ...insurance,
    // Dette er den eneste effektive faktalisten som comparison og coverage-
    // sammendrag skal konsumere. catalogFacts under beholdes som evidens/audit.
    importantTerms: effectiveTerms,
    catalogReference: {
      providerId: product.providerId,
      productId: product.productId,
      version: product.version,
    },
    // Eksakt produktnivå bekrefter produktets ubetingede base. Valgfrie
    // dekninger uten dokumentevidens er filtrert bort over.
    catalogSelectionConfirmed: true,
    catalogFacts,
    // Model addOns are evidence of coverage, not sufficient proof of product
    // role. Preserve every term, but separate documented base from additions.
    addOns: insurance.addOns.map((addOn) => {
      const key = normalizeTermName(addOn.name, { insuranceType: insurance.type });
      const definition = coverageDefinitions.find((entry) => entry.parentKey === key);
      const knownAddOn = availableAddOns(product, asOf, null).some((entry) =>
        normalizeTermName(entry.name, { insuranceType: insurance.type }) === key);
      const baseKeys = definition?.details.map((detail) => detail.key) ?? [];
      // Ulykkens scope is explicit; no free-text prefix/substring matching.
      if (key === "ulykke.dekning") baseKeys.push("ulykke.invaliditet", "ulykke.dod", "ulykke.omfang");
      const standard = !definition?.supplemental && !knownAddOn &&
        effectiveFacts.some((fact) => normalizeCatalogTermKey(fact.key) === key || baseKeys.includes(fact.key));
      return { ...addOn, classification: standard ? "standard" as const : "add_on" as const };
    }),
    addOnIds: [],
  };
}

export function enrichExtractedAgreementWithCatalog(
  agreement: ExtractedAgreement,
  asOf = new Date(),
  measure: MeasureSync = (_stage, work) => work(),
  trace?: TraceObjectObserver,
): CatalogEnrichedAgreement {
  return {
    ...agreement,
    insurances: agreement.insurances.map((insurance) =>
      enrichInsurance(agreement.company, insurance, asOf, measure, undefined, trace)),
  };
}

// Consolidation has already normalized and resolved same-side document evidence.
// Reuse the established catalog policy without re-deriving lower-priority facts
// from a combined free-text summary or reclassifying catalog evidence as document.
export function enrichConsolidatedInsurance(company: string | null, insurance: ExtractedInsurance, terms: DocumentFact[], asOf = new Date(), trace?: TraceObjectObserver): CatalogEnrichedInsurance {
  return enrichInsurance(company, insurance, asOf, (_stage, work) => work(), terms, trace);
}
