import type { DocumentRole } from "./object-consolidation.ts";
import { consolidateInsuranceRecords, type DocumentObjectRecord } from "./insurance-object-consolidation.ts";
import { enrichConsolidatedInsurance } from "./catalog-enrichment.ts";
import type { DocumentFact } from "./document-fact-normalization.ts";
import { AnalysisOutputError, type ExtractedAgreement, type ExtractedTerm } from "./analysis-output.ts";
import { type ExtractionBatch, MAX_JOB_PRODUCTS } from "./analysis-batching.ts";
import { includePdfAddOnTerms } from "./pdf-addons.ts";
import { enrichExtractedAgreementWithCatalog } from "./catalog-enrichment.ts";
import { finalizeAgreementPricing } from "./agreement-pricing.ts";
import type { AnalysisTelemetry } from "./analysis-telemetry.ts";
import { PdfSecurityError } from "./pdf-upload-security.ts";
import type { AnalysisSide } from "./analysis-progress.ts";

export function enrichBatch(agreement: ExtractedAgreement, batch: ExtractionBatch, telemetry: AnalysisTelemetry) {
  const sourceIds = (indices?: number[]) => {
    // Legacy one-document results are unambiguous. Multi-document results fail closed on missing attribution.
    const actual = indices ?? (batch.documents.length === 1 ? [1] : []);
    if (!actual.length || actual.some((i) => !Number.isInteger(i) || i < 1 || i > batch.documents.length)) throw new AnalysisOutputError("Ugyldig dokumentreferanse.");
    return [...new Set(actual)].map((i) => batch.documents[i-1]);
  };
  const sources = (indices?: number[]) => sourceIds(indices).map((doc) => ({
    documentId: `pdf:${doc.side}:${doc.documentIndex}`, filename: `Dokument ${doc.documentIndex+1}`,
    termsNumber: "Ikke oppgitt", effectiveFrom: "", page: 0, section: "Dokumentopplysninger; side/punkt ikke identifisert",
  }));
  const attach = (term: ExtractedTerm, role: DocumentRole = "unknown") => ({ ...term, coverageOrigin: "document" as const, sources: sources(term.documentIndices).map(source => ({ ...source, documentRole: role })) });
  // Validate the entire batch before publishing product events or mutating any result.
  for (const product of agreement.insurances) {
    const documents = new Set(sourceIds(product.documentIndices));
    for (const term of [...(product.objectIdentifiers ?? []), ...product.importantTerms, ...product.addOns.flatMap((addon) => addon.importantTerms)]) {
      if (sourceIds(term.documentIndices).some((doc) => !documents.has(doc))) throw new AnalysisOutputError("Faktareferanse utenfor produktets dokumenter.");
    }
  }
  const documentRecords: DocumentObjectRecord[] = [];
  return {
    ...agreement,
    documentRecords,
    insurances: agreement.insurances.map((product, productIndex) => {
      const productSources = sources(product.documentIndices).map(source => ({ ...source, documentRole: product.documentRole ?? "unknown" }));
      const attached = { ...product, objectIdentifiers: product.objectIdentifiers?.map(id => ({ ...id, sources: sources(id.documentIndices) })), importantTerms: product.importantTerms.map(term => attach(term, product.documentRole)), addOns: product.addOns.map((addon) => ({ ...addon, importantTerms: addon.importantTerms.map(term => attach(term, product.documentRole)) })) };
      const all = [...attached.importantTerms, ...attached.addOns.flatMap((addon) => addon.importantTerms)];
      // Keep all source references even when the established addon flattener deduplicates identical terms.
      for (const term of all) {
        const same = all.filter((candidate) => candidate.canonicalKey === term.canonicalKey && candidate.name.trim().toLocaleLowerCase("nb-NO") === term.name.trim().toLocaleLowerCase("nb-NO") && candidate.value.trim().toLocaleLowerCase("nb-NO") === term.value.trim().toLocaleLowerCase("nb-NO"));
        term.sources = [...new Map(same.flatMap((candidate) => candidate.sources).map((source) => [source.documentId, source])).values()];
      }
      const withTerms = includePdfAddOnTerms(attached);
      const company = product.company === undefined ? agreement.company : product.company;
      documentRecords.push({ ...withTerms, company, analysisObjectId: `${batch.side}:${batch.batchIndex}:${productIndex}`,
        documentReferences: sourceIds(product.documentIndices).map(doc => ({ side: doc.side, documentIndex: doc.documentIndex })), documentSources: productSources });
      const enriched = telemetry.measureSync("catalogEnrichment", () => enrichExtractedAgreementWithCatalog({ ...agreement, company, insurances: [withTerms] }, new Date(), telemetry.measureSync)).insurances[0];
      return { ...enriched, company, analysisObjectId: `${batch.side}:${batch.batchIndex}:${productIndex}`,
        documentReferences: sourceIds(product.documentIndices).map((doc) => ({ side: doc.side, documentIndex: doc.documentIndex })),
        importantTerms: enriched.importantTerms.map((term) => term.coverageOrigin === "document" && !term.sources?.length && !term.source ? { ...term, sources: productSources } : term) };
    }),
  };
}
export type BatchResult = { batch: ExtractionBatch; agreement: ReturnType<typeof enrichBatch> };
export function mergeBatchResults(results: readonly BatchResult[], side: AnalysisSide, partial: boolean) {
  const ordered = results.filter((r) => r.batch.side === side).sort((a,b) => a.batch.batchIndex-b.batch.batchIndex);
  const original = ordered.flatMap((r) => r.agreement.insurances);
  if (original.length > MAX_JOB_PRODUCTS) throw new PdfSecurityError(413, "too_many_products", "For mange produkter i én sammenligning.");
  const records = ordered.flatMap(result => result.agreement.documentRecords);
  const insurances = consolidateInsuranceRecords(records).map(({ record, indices }) => {
    if (record.consolidation.status !== "consolidated") return { ...original[indices[0]], consolidation: record.consolidation, recordEvidence: record.recordEvidence };
    const enriched = enrichConsolidatedInsurance(record.company, record, record.importantTerms as DocumentFact[]);
    return { ...record, ...enriched };
  });
  const companies = new Set(insurances.map((p) => p.company));
  const single = ordered.length === 1 && !partial;
  // Same-side consolidation is complete before callers perform cross-side matching.
  // Agreement totals are still never summed across documents or batches.
  return { source: "pdf" as const, filename: `${ordered.reduce((n,r) => n+r.batch.documents.length,0)} PDF-dokumenter`, insuranceData: finalizeAgreementPricing({
    company: companies.size === 1 ? [...companies][0] : null,
    totalAnnualPremium: single ? ordered[0].agreement.totalAnnualPremium : null,
    totalAnnualPremiumScope: single ? ordered[0].agreement.totalAnnualPremiumScope : "partial_or_unclear" as const,
    insurances,
  }) };
}
