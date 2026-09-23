import type { ExtractedAgreement, ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
} from "./insurance-normalization.ts";
import { canonicalCoverage } from "./coverage-status.ts";
import { normalizeDocumentFacts } from "./document-fact-normalization.ts";
import {
  findCatalogProductBySelection,
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
): CatalogEnrichedInsurance {
  const product = company && insurance.productName
    ? findCatalogProductBySelection(company, insurance.type, insurance.productName)
    : null;
  const documentTerms = normalizeDocumentFacts(insurance);
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
  const documentCoverageStatuses = new Map(coverageDefinitions.map((definition) => [
    definition.parentKey,
    canonicalCoverage({ ...insurance, importantTerms: documentTerms }, insurance.type, definition.parentKey),
  ]));
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

  return {
    ...insurance,
    importantTerms: [...documentTerms, ...supplementalTerms],
    catalogReference: {
      providerId: product.providerId,
      productId: product.productId,
      version: product.version,
    },
    // Eksakt produktnivå bekrefter produktets ubetingede base. Valgfrie
    // dekninger uten dokumentevidens er filtrert bort over.
    catalogSelectionConfirmed: true,
    catalogFacts,
    addOnIds: [],
  };
}

export function enrichExtractedAgreementWithCatalog(
  agreement: ExtractedAgreement,
  asOf = new Date(),
): CatalogEnrichedAgreement {
  return {
    ...agreement,
    insurances: agreement.insurances.map((insurance) =>
      enrichInsurance(agreement.company, insurance, asOf)),
  };
}
