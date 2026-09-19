import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";

function uiAgreement(company, productId, version, addOnIds, deductible, annualPremium) {
  return {
    company,
    totalAnnualPremium: "",
    products: [{
      type: "Bil",
      productName: "Super",
      annualPremium,
      deductible,
      coverageSummary: "",
      importantTerms: [],
      catalogReference: {
        providerId: company.toLocaleLowerCase("nb-NO"),
        productId,
        version,
      },
      addOnIds,
    }],
  };
}

test("UI-formet If–Storebrand-request beholder alle tillegg til toppsekslisten", () => {
  const formData = new FormData();
  formData.set("existingMode", "manual");
  formData.set("offerMode", "manual");
  formData.set("existingManual", JSON.stringify(uiAgreement(
    "If", "if-bil-super", "MOT2-2", ["if-leiebil", "if-motor-gir"], "6000", "14000",
  )));
  formData.set("offerManual", JSON.stringify(uiAgreement(
    "Storebrand", "sb-bil-super", "motor09", ["sb-leiebil"], "8000", "17000",
  )));

  // Samme JSON-grense som UI -> FormData -> API-ruten bruker.
  const existing = normalizeManualAgreement(JSON.parse(formData.get("existingManual")));
  const offer = normalizeManualAgreement(JSON.parse(formData.get("offerManual")));

  assert.deepEqual(existing.insuranceData.insurances[0].addOnIds, ["if-leiebil", "if-motor-gir"]);
  assert.deepEqual(offer.insuranceData.insurances[0].addOnIds, ["sb-leiebil"]);
  assert.ok(existing.insuranceData.insurances[0].importantTerms.some((term) =>
    term.key === "leiebil.dager" && /90 dager/.test(term.value)));
  assert.ok(offer.insuranceData.insurances[0].importantTerms.some((term) =>
    term.key === "leiebil.dager" && /60 dager/.test(term.value)));

  const groups = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null);
  const differences = createDifferences(existing, offer, groups, null);
  const topSix = presentImportantDifferences(
    differences, groups, null, "If", "Storebrand",
  ).filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  assert.deepEqual(topSix.map((difference) => difference.title), [
    "Egenandel",
    "Leiebil – normal reparasjonstid",
    "Parkeringsskade – erstatningsgrense",
    "Leiebil – kondemnasjon",
    "Leiebil – kontantkompensasjon",
    "Totalskadegaranti – unntak",
  ]);
});
