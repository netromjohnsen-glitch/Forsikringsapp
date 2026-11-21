import test from "node:test";
import assert from "node:assert/strict";
import { parseExtractionResponse } from "../lib/analysis-output.ts";
import { enrichBatch, mergeBatchResults } from "../lib/analysis-merge.ts";
import { createAnalysisTelemetry } from "../lib/analysis-telemetry.ts";
import { planExtractionBatches } from "../lib/analysis-batching.ts";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";

function customerDocument(side, productPremium, agreementPremium = productPremium) {
  const [batch] = planExtractionBatches([{ side, documentIndex: 0, text: "Syntetisk kundeavtale", pages: 1 }]);
  const extraction = {
    company: "If",
    totalAnnualPremium: agreementPremium,
    totalAnnualPremiumScope: "entire_agreement",
    insurances: [{
      type: "Reise",
      productName: "Standard",
      canonicalProductName: null,
      annualPremium: productPremium,
      deductible: null,
      coverageSummary: null,
      documentRole: "individual_agreement",
      documentIndices: [1],
      importantTerms: [],
      addOns: [],
    }],
  };
  const telemetry = createAnalysisTelemetry("00000000-0000-0000-0000-000000000000");
  const agreement = enrichBatch(parseExtractionResponse({ output_text: JSON.stringify(extraction) }), batch, telemetry);
  return mergeBatchResults([{ batch, agreement }], side, false);
}

function priceDifferences(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  assert.equal(groups[0].objectMatch.status, "matched");
  return createDifferences(first, second, groups, null).filter(difference => difference.type === "price");
}

test("product and agreement prices reject other bases without rewriting the PDF values", () => {
  const annualOffer = customerDocument("offer", "1 209,98 kr per år");
  for (const unfit of ["100 kr per måned", "500 SEK", "Kunderabatt 500 kr", "500–800 kr", "500 kr per kvartal"]) {
    const existing = customerDocument("existing", unfit);
    assert.equal(existing.insuranceData.totalAnnualPremium, unfit);
    assert.equal(existing.insuranceData.insurances[0].annualPremium, unfit);
    assert.deepEqual(priceDifferences(existing, annualOffer), [], unfit);
    assert.deepEqual(priceDifferences(annualOffer, existing), [], unfit);
  }
});

test("the two annual price comparisons validate the agreement and product independently", () => {
  const offer = customerDocument("offer", "1 210,03 kr per år");
  const unclearAgreement = customerDocument("existing", "1 209,98 kr. per år", "100 kr per måned");
  const unclearProduct = customerDocument("existing", "100 kr per måned", "1 209,98 kr. per år");
  for (const [existing, title] of [[unclearAgreement, "Pris"], [unclearProduct, "Totalpris"]]) {
    const differences = priceDifferences(existing, offer);
    assert.deepEqual(differences.map(difference => difference.title), [title]);
    assert.match(differences[0].text, /0,05 kr billigere per år[.]/u);
  }
});

test("equal annual values with formatting differences produce no price difference", () => {
  const first = customerDocument("existing", "1.209,98 kr");
  const second = customerDocument("offer", "1209,98 kroner årlig");
  assert.deepEqual(priceDifferences(first, second), []);
});

test("explicit NOK amounts retain the same annual comparison as kr", () => {
  const existing = customerDocument("existing", "NOK 1 209,98");
  const offer = customerDocument("offer", "1 210,03 NOK per år");
  const differences = priceDifferences(existing, offer);
  assert.deepEqual(differences.map(difference => difference.title), ["Totalpris", "Pris"]);
  assert.ok(differences.every(difference => /0,05 kr billigere per år[.]/u.test(difference.text)));
});
