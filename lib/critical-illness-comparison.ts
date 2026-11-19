import data from "../catalog/critical-illness-diagnoses.json" with { type: "json" };
import { catalogAgreementScope } from "./agreement-scope.ts";
import { sourceDateApplies } from "./catalog-source-resolution.ts";
import type { ProductComparisonFact, ProductComparisonSource, ProductComparisonValue } from "./catalog-product-comparison.ts";
import type { CatalogProduct, CatalogSource } from "./product-catalog.ts";

type PageReference = { page: number; section: string };
type Diagnosis = PageReference & { value: string; qualification?: PageReference };
type DiagnosisList = PageReference & { sha256: string; diagnoses: Record<string, Diagnosis> };

const { labels, products }: {
  labels: Readonly<Record<string, string>>;
  products: Readonly<Record<string, DiagnosisList>>;
} = data;

const diagnosisPrefix = "person.sykdom.diagnose.";

export function isCriticalIllnessDiagnosisKey(key: string): boolean {
  return key.startsWith(diagnosisPrefix) && Object.hasOwn(labels, key.slice(diagnosisPrefix.length));
}

export function criticalIllnessComparisonDiagnoses(
  product: CatalogProduct,
  source: CatalogSource | undefined,
  date: Date,
): { facts: ProductComparisonFact[]; listSource: ProductComparisonSource } | undefined {
  const list = products[product.productId];
  if (!list || !source || source.id !== product.sourceId || source.sha256 !== list.sha256 ||
      source.providerId !== product.providerId || !source.productIds?.includes(product.productId) ||
      catalogAgreementScope(source) !== catalogAgreementScope(product) ||
      (source.productVersion && source.productVersion !== product.version) ||
      !sourceDateApplies(source, date.toISOString().slice(0, 10))) return;

  const cite = ({ page, section }: PageReference): ProductComparisonSource => ({
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    company: source.company, url: source.url, effectiveFrom: source.effectiveFrom,
    version: source.version ?? source.productVersion, agreementScope: source.agreementScope,
    sourceType: source.sourceType, page, section,
  });
  const facts: ProductComparisonFact[] = Object.entries(list.diagnoses).map(([id, diagnosis]) => ({
    key: diagnosisPrefix + id, label: labels[id], value: diagnosis.value,
    state: "included", role: "coverage", addOnNames: [],
    sources: diagnosis.qualification ? [cite(diagnosis), cite(diagnosis.qualification)] : [cite(diagnosis)],
  }));
  return { facts, listSource: cite(list) };
}

export function diagnosisNotListed(
  key: string,
  source: ProductComparisonSource | undefined,
): ProductComparisonValue | undefined {
  if (!source || !isCriticalIllnessDiagnosisKey(key)) return;
  const text = "Ingen egen oppføring for denne diagnosen eller behandlingen i vilkårenes liste.";
  const fact: ProductComparisonFact = {
    key, label: labels[key.slice(diagnosisPrefix.length)], value: text,
    state: "unavailable", role: "coverage", addOnNames: [], sources: [source],
  };
  return { state: fact.state, text, facts: [fact], sources: fact.sources };
}
