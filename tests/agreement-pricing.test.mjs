import assert from "node:assert/strict";
import test from "node:test";
import { finalizeAgreementPricing } from "../lib/agreement-pricing.ts";

test("hovedtotal og separat tillegg dobbelttelles ikke", () => {
  const extracted = {
    totalAnnualPremium: "34 649 kr",
    totalAnnualPremiumScope: "partial_or_unclear",
    insurances: [
      { type: "Hovedavtale", annualPremium: "34 649 kr" },
      { type: "NITO Uføreforsikring Ekstra", annualPremium: "1 867 kr" },
    ],
  };
  const result = finalizeAgreementPricing(extracted);
  assert.equal(result.totalAnnualPremium, null);
  assert.equal(result.insurances.length, 2);
  assert.equal(result.insurances[1].annualPremium, "1 867 kr");
});

test("uttrykkelig total for hele avtalen beholdes uten å legge til enkeltpremier", () => {
  const result = finalizeAgreementPricing({
    totalAnnualPremium: "36 516 kr",
    totalAnnualPremiumScope: "entire_agreement",
    insurances: [{ annualPremium: "1 867 kr" }],
  });
  assert.equal(result.totalAnnualPremium, "36 516 kr");
});

test("én PDF beholder totalpris når den dekker hele avtalen", () => {
  const result = finalizeAgreementPricing({
    totalAnnualPremium: "34 649 kr",
    totalAnnualPremiumScope: "entire_agreement",
  });
  assert.equal(result.totalAnnualPremium, "34 649 kr");
});

test("uklar total skjules også ved én PDF", () => {
  const result = finalizeAgreementPricing({
    totalAnnualPremium: "34 649 kr",
    totalAnnualPremiumScope: "partial_or_unclear",
  });
  assert.equal(result.totalAnnualPremium, null);
});
