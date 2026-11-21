import assert from "node:assert/strict";
import test from "node:test";
import { mergeBatchResults } from "../lib/analysis-merge.ts";
import { applyProgress, emptyProgress } from "../lib/analysis-progress.ts";
import { createAnalysisTelemetry } from "../lib/analysis-telemetry.ts";
import { analyzePdfBatches } from "../lib/pdf-analysis-pipeline.ts";
import { PdfSecurityError } from "../lib/pdf-upload-security.ts";

const telemetry = () => createAnalysisTelemetry("synthetic-unattributed-pdf");
const files = count => Array.from({ length: count }, (_, index) => ({ data: Uint8Array.of(index) }));
const policy = (documentIndices, overrides = {}) => ({
  type: "Reise", company: "Syntetisk forsikringsgiver", productName: "Test",
  canonicalProductName: "Test", documentRole: "individual_agreement",
  annualPremium: null, deductible: null, coverageSummary: null, addOns: [], importantTerms: [],
  documentIndices, ...overrides,
});
const response = (insurances, totalAnnualPremium = null) => ({
  company: "Syntetisk forsikringsgiver", totalAnnualPremium, insurances,
  totalAnnualPremiumScope: totalAnnualPremium ? "entire_agreement" : "partial_or_unclear",
});

async function analyze(sides, extract, events = []) {
  return analyzePdfBatches({
    sides, extract, controller: new AbortController(), telemetry: telemetry(), emit: event => events.push(event),
    parse: async () => ({ text: "Dette er et syntetisk dokument.", pages: 1, parseMs: 1, textMs: 1 }),
  });
}

test("a readable PDF omitted from extraction leaves a partial result with precise document numbers", async () => {
  const events = [];
  const result = await analyze([
    { side: "existing", files: files(3) },
    { side: "offer", files: files(1) },
  ], async batch => batch.side === "existing"
    ? response([policy([1]), policy([3])], "2 100 kr")
    : response([policy([1])], "1 300 kr"), events);

  assert.equal(result.partialSuccess, true);
  assert.equal(result.successfulDocuments, 3);
  assert.deepEqual(result.failures, [{ side: "existing", documentIndex: 1, code: "no_insurance_data" }]);
  const state = events.reduce(applyProgress, emptyProgress());
  assert.deepEqual(state.documents.map(({ side, documentIndex, status }) => [side, documentIndex, status]), [
    ["existing", 0, "completed"], ["existing", 1, "failed"], ["existing", 2, "completed"], ["offer", 0, "completed"],
  ]);
  assert.equal(state.documents[1].error, "no_insurance_data");
  const merge = side => mergeBatchResults(result.results, side, result.failures.some(failure => failure.side === side));
  const old = merge("existing"), offer = merge("offer");
  assert.deepEqual(old.insuranceData.insurances.map(record => record.documentReferences[0].documentIndex), [0, 2]);
  assert.equal(old.insuranceData.totalAnnualPremium, null);
  assert.equal(offer.insuranceData.totalAnnualPremium, "1 300 kr");
});

test("recognized supporting terms still count as read but do not become customer objects", async () => {
  const result = await analyze([{ side: "existing", files: files(2) }], async () =>
    response([policy([1]), policy([2], { documentRole: "general_terms" })]));
  assert.equal(result.partialSuccess, false);
  assert.equal(result.successfulDocuments, 2);
  const merged = mergeBatchResults(result.results, "existing", false);
  assert.equal(merged.insuranceData.insurances.length, 1);
  assert.equal(merged.insuranceData.supportingEvidence.length, 1);
  assert.deepEqual(merged.insuranceData.supportingEvidence[0].documentReferences, [{ side: "existing", documentIndex: 1 }]);
  assert.ok(merged.insuranceData.insurances[0].recordEvidence.some(record =>
    record.documentRole === "general_terms" && record.sources[0].documentId === "pdf:existing:1"));
});

test("empty extraction cannot succeed and uses the same document failure as an explicit no-data result", async () => {
  for (const extract of [async () => response([]), async () => {
    throw new PdfSecurityError(422, "no_insurance_data", "Fant ingen forsikringsopplysninger i PDF-en.");
  }]) {
    const events = [];
    await assert.rejects(analyze([{ side: "existing", files: files(1) }], extract, events), { code: "side_analysis_failed" });
    assert.equal(events.at(-1).status, "failed");
    assert.equal(events.at(-1).error, "no_insurance_data");
  }
});
