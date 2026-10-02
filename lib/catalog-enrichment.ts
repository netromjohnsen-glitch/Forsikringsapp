import type { MeasureSync } from "./analysis-telemetry.ts";
import type { TraceObjectObserver } from "./production-trace.ts";
import type { ExtractedAgreement, ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
  isUndocumentedTermValue,
  normalizeInsuranceType,
} from "./insurance-normalization.ts";
import { mcBobilTypes } from "./mc-bobil-registry.ts";
import { boatPetTypes } from "./boat-pet-registry.ts";
import { coverageStatusFromText, deriveCanonicalCoverages } from "./coverage-status.ts";
import { normalizeDocumentFacts, type DocumentFact } from "./document-fact-normalization.ts";
import {
  findCatalogProductBySelection,
  availableAddOns,
  resolveCatalogEvidence,
  resolveCatalogFacts,
  type CatalogFact,
  type CatalogProduct,
  type CatalogProductReference,
  type ProductCatalog,
  productCatalog,
  catalogReferenceForProduct,
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
  catalogReference?: CatalogProductReference | null;
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

// Older document facts can cover an unsplit condition. Preserve them without
// guessing their amounts or filling more precise, potentially conflicting terms.
const broadDocumentCatalogBlocks: Record<string, Record<string, readonly string[]>> = {
  bolig: {
    "hus.skadedyr.bekjempelse": ["hus.skadedyr.dyr.bekjempelse", "hus.skadedyr.insekter.bekjempelse"],
    "hus.skadedyr.bygningsskade": ["hus.skadedyr.dyr.bygningsskade", "hus.skadedyr.insekter.bygningsskade"],
    "hus.skadedyr.egenandel": ["hus.skadedyr.insekter.egenandel"],
  },
  innbo: {
    "flytting.transport.grense": ["flytting.tyveri_skadeverk.grense"],
  },
  reise: {
    "reise.forsinkelse.rute": ["reise.forsinkelse.fremmote_sum", "reise.forsinkelse.avgang_sum"],
  },
};

function selectedScopedAddOns(
  product: CatalogProduct,
  insurance: ExtractedInsurance,
  documentTerms: DocumentFact[],
  asOf: Date,
  catalog: ProductCatalog,
): string[] {
  if (![...mcBobilTypes, ...boatPetTypes].some(type => type === normalizeInsuranceType(insurance.type))) return [];
  const definitions = relatedCoveragesForInsuranceType(insurance.type);
  const allowed = availableAddOns(product, asOf, null, catalog).map(addOn => {
    const namedKey = normalizeTermName(addOn.name, { insuranceType: insurance.type });
    const parents = addOn.selectionEvidenceKeys ?? definitions.filter(definition =>
      (catalog.facts?.[addOn.componentId] ?? []).some(fact =>
        normalizeCatalogTermKey(fact.key) === definition.parentKey)).map(definition => definition.parentKey);
    return { addOn, namedKey, parents, specific: !parents.includes(namedKey) };
  });
  const isSpecificName = (name: string) => allowed.some(candidate => candidate.specific &&
    normalizeLabel(candidate.addOn.name) === normalizeLabel(name));
  const documentAddOns = insurance.addOns.filter(addOn => {
    const evidence = addOn as typeof addOn & { id?: string; source?: unknown; coverageOrigin?: string };
    return evidence.coverageOrigin === "document" || (!evidence.coverageOrigin && !evidence.id && !evidence.source);
  });
  // A named variant is evidence for that variant, not every alternative in
  // its coverage family. Family-level rejection still blocks every variant.
  const familyStatuses = new Map(deriveCanonicalCoverages({
    importantTerms: documentTerms.filter(term => !isSpecificName(term.name)),
    addOns: documentAddOns.filter(addOn => !isSpecificName(addOn.name)),
  }, insurance.type).map(coverage => [coverage.id, coverage]));
  const candidates = allowed.map(candidate => {
    const { addOn, parents } = candidate;
    const exactTerms = documentTerms.filter(term => normalizeLabel(term.name) === normalizeLabel(addOn.name));
    const statuses = new Set(exactTerms.map(term => coverageStatusFromText(term.value))
      .filter(status => status === "selected" || status === "not_selected"));
    const namedSelection = statuses.has("selected") || documentAddOns.some(entry =>
      normalizeLabel(entry.name) === normalizeLabel(addOn.name));
    const blocked = statuses.has("not_selected") || parents.some(parent => {
      const state = familyStatuses.get(parent);
      return state?.status === "not_selected" || state?.conflict;
    });
    // A generic selected family can choose a sole component, or one explicitly
    // named standard component among alternatives. It cannot choose a variant
    // by array order or by words contained inside a longer product name.
    const genericSelection = parents.some(parent => {
      const state = familyStatuses.get(parent);
      if (state?.status !== "selected" || state.conflict || !state.evidence.some(evidence =>
        evidence.origin === "document" && evidence.status === "selected" &&
        ["explicit_status", "add_on", "detail"].includes(evidence.kind))) return false;
      const alternatives = allowed.filter(other => other.parents.includes(parent));
      const standards = alternatives.filter(other => other.namedKey === parent);
      return alternatives.length === 1 || (standards.length === 1 && standards[0].addOn.id === addOn.id);
    });
    return { ...candidate, conflict: statuses.size > 1, selected: !blocked && (namedSelection || genericSelection),
      namedSpecificSelection: !blocked && candidate.specific && namedSelection };
  });
  const selectedIds = new Set(candidates.filter(candidate => {
    if (!candidate.selected) return false;
    const group = candidate.addOn.exclusiveGroup;
    if (!group) return true;
    if (candidates.some(other => other.addOn.exclusiveGroup === group && other.conflict)) return false;
    const listed = candidates.filter(other => other.addOn.exclusiveGroup === group && documentAddOns.some(entry =>
      normalizeLabel(entry.name) === normalizeLabel(other.addOn.name)));
    if (listed.length > 1) return false;
    const selected = candidates.filter(other => other.selected && other.addOn.exclusiveGroup === group);
    const named = selected.filter(other => other.namedSpecificSelection);
    return named.length ? named.length === 1 && named[0].addOn.id === candidate.addOn.id : selected.length === 1;
  }).map(candidate => candidate.addOn.id));
  // Missing or rejected prerequisites block only conditional catalog facts.
  // Preserve the original document and never infer an additional selection.
  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of candidates) {
      if (selectedIds.has(candidate.addOn.id) && candidate.addOn.requiresAddOnIds?.some(id => !selectedIds.has(id))) {
        selectedIds.delete(candidate.addOn.id);
        changed = true;
      }
    }
  }
  return [...selectedIds];
}

function enrichInsurance(
  company: string | null,
  insurance: ExtractedInsurance,
  asOf: Date,
  measure: MeasureSync,
  resolvedDocumentTerms?: DocumentFact[],
  trace?: TraceObjectObserver,
  catalog: ProductCatalog = productCatalog,
): CatalogEnrichedInsurance {
  // undefined betyr et eldre internt kall uten feltet; null fra dagens schema
  // betyr uttrykkelig at produktnivået ikke kunne identifiseres sikkert.
  const productIdentity = insurance.canonicalProductName === undefined
    ? insurance.productName
    : insurance.canonicalProductName;
  const product = measure("catalogLookup", () => company && productIdentity
    ? findCatalogProductBySelection(company, insurance.type, productIdentity, insurance.agreementScope, catalog)
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

  // MC/Bobil optional components remain separate from the base. Only an
  // explicit document-backed coverage selection can activate an applicable
  // component; catalog availability and document silence cannot select it.
  const selectedAddOnIds = selectedScopedAddOns(product, insurance, documentTerms, asOf, catalog);
  const effectiveFacts = resolveCatalogFacts(product, selectedAddOnIds, asOf, null, catalog);
  const catalogFacts = resolveCatalogEvidence(product, selectedAddOnIds, asOf, null, catalog);
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
  const overlapRules = broadDocumentCatalogBlocks[normalizeInsuranceType(insurance.type)] ?? {};
  const overlapBlockedKeys = new Set(documentTerms.flatMap(term =>
    term.coverageOrigin === "document" && term.value.trim() && !isUndocumentedTermValue(term.value)
      ? overlapRules[normalizeCatalogTermKey(term.key ?? normalizeTermName(term.name, { insuranceType: insurance.type }))] ?? []
      : []));
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
      if (overlapBlockedKeys.has(normalizeCatalogTermKey(fact.key))) {
        if (trace) {
          blockedKeys.push(normalizeCatalogTermKey(fact.key));
          traceDecisions.push({ key: normalizeCatalogTermKey(fact.key), decision: "CATALOG_NOT_APPLIED_OTHER_RULE" });
        }
        return false;
      }
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
          (!(normalizeInsuranceType(insurance.type) === "bobil" &&
            definition.parentKey === "parkering.dekning" && key === "parkering.bonus") &&
            definition.details.some((detail) => detail.key === key ||
              Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix)))));
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
    catalogReference: catalogReferenceForProduct(product),
    // Eksakt produktnivå bekrefter produktets ubetingede base. Valgfrie
    // dekninger uten dokumentevidens er filtrert bort over.
    catalogSelectionConfirmed: true,
    catalogFacts,
    // Model addOns are evidence of coverage, not sufficient proof of product
    // role. Preserve every term, but separate documented base from additions.
    addOns: insurance.addOns.map((addOn) => {
      const key = normalizeTermName(addOn.name, { insuranceType: insurance.type });
      const definition = coverageDefinitions.find((entry) => entry.parentKey === key);
      const knownAddOn = availableAddOns(product, asOf, null, catalog).some((entry) =>
        normalizeTermName(entry.name, { insuranceType: insurance.type }) === key);
      const baseKeys = definition?.details.map((detail) => detail.key) ?? [];
      // Ulykkens scope is explicit; no free-text prefix/substring matching.
      if (key === "ulykke.dekning") baseKeys.push("ulykke.invaliditet", "ulykke.dod", "ulykke.omfang");
      const standard = !definition?.supplemental && !knownAddOn &&
        effectiveFacts.some((fact) => normalizeCatalogTermKey(fact.key) === key || baseKeys.includes(fact.key));
      return { ...addOn, classification: standard ? "standard" as const : "add_on" as const };
    }),
    addOnIds: selectedAddOnIds,
  };
}

export function enrichExtractedAgreementWithCatalog(
  agreement: ExtractedAgreement,
  asOf = new Date(),
  measure: MeasureSync = (_stage, work) => work(),
  trace?: TraceObjectObserver,
  catalog: ProductCatalog = productCatalog,
): CatalogEnrichedAgreement {
  return {
    ...agreement,
    insurances: agreement.insurances.map((insurance) =>
      enrichInsurance(insurance.company === undefined ? agreement.company : insurance.company, insurance, asOf, measure, undefined, trace, catalog)),
  };
}

// Consolidation has already normalized and resolved same-side document evidence.
// Reuse the established catalog policy without re-deriving lower-priority facts
// from a combined free-text summary or reclassifying catalog evidence as document.
export function enrichConsolidatedInsurance(company: string | null, insurance: ExtractedInsurance, terms: DocumentFact[], asOf = new Date(), trace?: TraceObjectObserver): CatalogEnrichedInsurance {
  return enrichInsurance(company, insurance, asOf, (_stage, work) => work(), terms, trace);
}
