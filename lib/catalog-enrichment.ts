import type { MeasureSync } from "./analysis-telemetry.ts";
import type { ExtractedAgreement, ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
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
): CatalogEnrichedInsurance {
  // undefined betyr et eldre internt kall uten feltet; null fra dagens schema
  // betyr uttrykkelig at produktnivået ikke kunne identifiseres sikkert.
  const productIdentity = insurance.canonicalProductName === undefined
    ? insurance.productName
    : insurance.canonicalProductName;
  const product = measure("catalogLookup", () => company && productIdentity
    ? findCatalogProductBySelection(company, insurance.type, productIdentity)
    : null);
  const documentTerms = resolvedDocumentTerms ?? measure("documentNormalization", () => normalizeDocumentFacts(insurance));
  const documentedTotals = [...new Set(documentTerms
    .filter((term) => term.key === "premie.total").map((term) => term.value))];
  // Bare en entydig, eksplisitt objekttotal kan erstatte det eldre premiefeltet.
  insurance = {
    ...insurance,
    annualPremium: documentedTotals.length === 1 ? documentedTotals[0] : insurance.annualPremium,
  };
  if (!product) return { ...insurance, importantTerms: documentTerms, catalogReference: null };

  const effectiveFacts = resolveCatalogFacts(product, [], asOf, null);
  const catalogFacts = resolveCatalogEvidence(product, [], asOf, null);
  const documentedKeys = new Set(documentTerms.map((term) => normalizeCatalogTermKey(
    term.key ?? normalizeTermName(term.name, { insuranceType: insurance.type, termValue: term.value }),
  )));
  for (const term of documentTerms) {
    const label = normalizeLabel(term.name);
    for (const fact of effectiveFacts) {
      if (normalizeLabel(fact.label) === label) documentedKeys.add(normalizeCatalogTermKey(fact.key));
    }
  }
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
  const supplementalTerms = effectiveFacts
    .filter((fact) => {
      const definition = coverageForFact(fact);
      const documentCoverage = definition && documentCoverageStatuses.get(definition.parentKey);
      // Et eksplisitt avslag eller en dokumentert konflikt skal ikke få
      // katalogdetaljer presentert som kundens effektive vilkår.
      if (documentCoverage?.evidence.length && documentCoverage.status !== "selected") return false;
      // Detaljer uten en tilhørende hoveddekning beskriver bare en mulig
      // variant. De berikes først når kundedokumentet faktisk omtaler den.
      return !definition || factKeys.has(definition.parentKey) ||
        [...documentedKeys].some((key) => key === definition.parentKey ||
          definition.details.some((detail) => detail.key === key ||
            Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix))));
    })
    .filter((fact) => !documentedKeys.has(normalizeCatalogTermKey(fact.key)))
    .map((fact) => catalogTerm(fact, catalogFacts));

  const effectiveTerms = [...documentTerms, ...supplementalTerms].filter((term, index, terms) => {
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
): CatalogEnrichedAgreement {
  return {
    ...agreement,
    insurances: agreement.insurances.map((insurance) =>
      enrichInsurance(agreement.company, insurance, asOf, measure)),
  };
}

// Consolidation has already normalized and resolved same-side document evidence.
// Reuse the established catalog policy without re-deriving lower-priority facts
// from a combined free-text summary or reclassifying catalog evidence as document.
export function enrichConsolidatedInsurance(company: string | null, insurance: ExtractedInsurance, terms: DocumentFact[], asOf = new Date()): CatalogEnrichedInsurance {
  return enrichInsurance(company, insurance, asOf, (_stage, work) => work(), terms);
}
