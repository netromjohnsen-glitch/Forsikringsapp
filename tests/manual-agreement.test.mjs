import assert from "node:assert/strict";
import test from "node:test";
import { ManualAgreementError, normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { runHybridMatching } from "../lib/hybrid-matching.ts";
import { annualPremiumLabel } from "../lib/agreement-pricing.ts";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";

const manual = (company, type, terms = []) => ({
  company,
  totalAnnualPremium: "",
  products: [{
    type, productName: "Standard", annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: terms, catalogReference: null,
  }],
});

test("to manuelle avtaler uten pris beholder vilkår og kan matches", async () => {
  const existing = normalizeManualAgreement(manual("Selskap A", "Bil", [
    { name: "Leiebil", value: "30 dager" },
  ]));
  const offer = normalizeManualAgreement(manual("Selskap B", "Bilforsikring", [
    { name: "Erstatningsbil", value: "45 dager" },
  ]));
  assert.equal(existing.insuranceData.totalAnnualPremium, null);
  assert.equal(existing.insuranceData.insurances[0].annualPremium, null);
  assert.equal(existing.insuranceData.insurances[0].importantTerms[0].value, "30 dager");
  let calls = 0;
  await runHybridMatching(existing.insuranceData.insurances, offer.insuranceData.insurances, async () => {
    calls++;
    return { decisions: [] };
  });
  assert.equal(calls, 0);
});

test("én manuell forsikring med pris får riktig total", () => {
  const input = manual("Selskap A", "Bil");
  input.products[0].annualPremium = "12 000 kr";
  const result = normalizeManualAgreement(input);
  assert.equal(result.insuranceData.totalAnnualPremium, "12 000 kr");
  assert.equal(annualPremiumLabel(result.insuranceData), "12 000 kr");
});

test("flere manuelle produkter med pris summeres til en komplett total", () => {
  const input = manual("Selskap A", "Bil");
  input.products[0].annualPremium = "12 000 kr";
  input.products.push({ ...input.products[0], type: "Innbo", annualPremium: "3 000 kr" });
  input.products.push({ ...input.products[0], type: "Reise", annualPremium: "2 000 kr" });
  const result = normalizeManualAgreement(input);
  assert.equal(result.insuranceData.insurances.length, 3);
  assert.equal(result.insuranceData.totalAnnualPremium, "17 000 kr");
  assert.equal(result.insuranceData.priceSummary.missingCount, 0);
});

test("manglende produktpris gir bare merket kjent delsum", () => {
  const input = manual("Selskap A", "Bil");
  input.products[0].annualPremium = "12 000 kr";
  input.products.push({ ...input.products[0], type: "Innbo", annualPremium: "3 000 kr" });
  input.products.push({ ...input.products[0], type: "Reise", annualPremium: "" });
  const result = normalizeManualAgreement(input);
  assert.equal(result.insuranceData.totalAnnualPremium, null);
  assert.equal(result.insuranceData.priceSummary.knownAnnualPremium, "15 000 kr");
  assert.equal(annualPremiumLabel(result.insuranceData), "Kjent årspremie: 15 000 kr – pris mangler for 1 forsikring");
});

test("begge manuelle sider bruker produktprisene til total og prisforskjell", () => {
  const existingInput = manual("Tryg", "Bil");
  existingInput.products[0].annualPremium = "12 000 kr";
  const offerInput = manual("Tryg", "Bil");
  offerInput.products[0].annualPremium = "8 000 kr";
  const existing = normalizeManualAgreement(existingInput);
  const offer = normalizeManualAgreement(offerInput);
  const groups = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null);
  const differences = createDifferences(existing, offer, groups, null);
  assert.equal(existing.insuranceData.totalAnnualPremium, "12 000 kr");
  assert.equal(offer.insuranceData.totalAnnualPremium, "8 000 kr");
  assert.equal(differences.find((difference) => difference.title === "Totalpris")?.text, "Nytt tilbud fra Tryg er 4 000 kr billigere per år.");
  assert.equal(differences.find((difference) => difference.title === "Pris")?.text, "Nytt tilbud fra Tryg er 4 000 kr billigere per år.");
});

test("eksplisitt nullpris teller som oppgitt pris", () => {
  const input = manual("Selskap A", "Bil");
  input.products[0].annualPremium = "0";
  const result = normalizeManualAgreement(input);
  assert.equal(result.insuranceData.totalAnnualPremium, "0 kr");
  assert.equal(result.insuranceData.priceSummary.missingCount, 0);
});

test("ufullstendig total brukes ikke til prisforskjell", () => {
  const existingInput = manual("Selskap A", "Bil");
  existingInput.products[0].annualPremium = "12 000 kr";
  existingInput.products.push({ ...existingInput.products[0], type: "Reise", annualPremium: "" });
  const offerInput = manual("Selskap B", "Bil");
  offerInput.products[0].annualPremium = "8 000 kr";
  const existing = normalizeManualAgreement(existingInput);
  const offer = normalizeManualAgreement(offerInput);
  const groups = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null);
  assert.equal(createDifferences(existing, offer, groups, null).find((difference) => difference.title === "Totalpris"), undefined);
});

test("manglende selskap, type og ufullstendige vilkår avvises", () => {
  assert.throws(() => normalizeManualAgreement(manual("", "Bil")), ManualAgreementError);
  assert.throws(() => normalizeManualAgreement(manual("Selskap A", "")), ManualAgreementError);
  assert.throws(() => normalizeManualAgreement(manual("Selskap A", "Bil", [{ name: "Leiebil", value: "" }])), ManualAgreementError);
});

test("ukjent katalogreferanse brukes ikke som dekning", () => {
  const input = manual("Selskap A", "Båt");
  input.products[0].catalogReference = { providerId: "x", productId: "y", version: null };
  const result = normalizeManualAgreement(input);
  assert.equal(result.insuranceData.insurances[0].catalogReference, null);
  assert.deepEqual(result.insuranceData.insurances[0].importantTerms, []);
});
