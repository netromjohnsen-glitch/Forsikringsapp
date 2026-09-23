import type { ExtractedAgreement, ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
} from "./insurance-normalization.ts";
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

function documentTermKey(term: ExtractedTerm, insurance: ExtractedInsurance): string {
  return normalizeCatalogTermKey(normalizeTermName(term.name, {
    insuranceType: insurance.type,
    termValue: term.value,
  }));
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
  const documentTerms: EnrichedTerm[] = insurance.importantTerms.map((term) => ({
    ...term,
    coverageOrigin: "document",
  }));
  if (!product) return { ...insurance, importantTerms: documentTerms, catalogReference: null };

  const effectiveFacts = resolveCatalogFacts(product, [], asOf, null);
  const catalogFacts = resolveCatalogEvidence(product, [], asOf, null);
  const documentedKeys = new Set(insurance.importantTerms.map((term) => documentTermKey(term, insurance)));
  for (const term of insurance.importantTerms) {
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
  const coverageForFact = (fact: CatalogFact) => {
    const key = normalizeCatalogTermKey(fact.key);
    return coverageDefinitions.find((definition) => definition.parentKey === key ||
      definition.details.some((detail) => detail.key === key ||
        Boolean(detail.keyPrefix && key.startsWith(detail.keyPrefix))));
  };
  const supplementalTerms = effectiveFacts
    .filter((fact) => {
      const definition = coverageForFact(fact);
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
