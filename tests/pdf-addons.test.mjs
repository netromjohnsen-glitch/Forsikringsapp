import assert from "node:assert/strict";
import test from "node:test";
import { includePdfAddOnTerms } from "../lib/pdf-addons.ts";

test("PDF-analyse beholder flere tillegg på samme bil og gjør alle vilkår sammenlignbare", () => {
  const insurance = includePdfAddOnTerms({
    type: "Bil", productName: "Kasko", annualPremium: null, deductible: null,
    importantTerms: [{ name: "Glass", value: "3 000 kr" }],
    addOns: [
      { name: "Bil Ekstra", annualPremium: null, deductible: null, importantTerms: [{ name: "Leiebil", value: "60 dager" }] },
      { name: "Maskinskade", annualPremium: null, deductible: null, importantTerms: [{ name: "Maskinskade", value: "200 000 km" }] },
      { name: "Fører- og Passasjerulykke", annualPremium: null, deductible: null, importantTerms: [{ name: "Medisinsk invaliditet", value: "200 000 kr" }] },
    ],
  });
  assert.equal(insurance.addOns.length, 3);
  assert.deepEqual(insurance.importantTerms.map((term) => term.name),
    ["Glass", "Leiebil", "Maskinskade", "Medisinsk invaliditet"]);
  assert.equal(insurance.annualPremium, null);
  assert.equal(insurance.deductible, null);
});

test("PDF-analyse fungerer også med null eller ett tillegg", () => {
  const base = { importantTerms: [{ name: "Brann", value: "Dekket" }] };
  assert.deepEqual(includePdfAddOnTerms(base).addOns, []);
  assert.equal(includePdfAddOnTerms({ ...base, addOns: [
    { name: "Maskinskade", annualPremium: null, deductible: null, importantTerms: [{ name: "Alder", value: "10 år" }] },
  ] }).importantTerms.length, 2);
});
