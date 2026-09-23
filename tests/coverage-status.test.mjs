import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalCoverage,
  coverageStatusLabel,
} from "../lib/coverage-status.ts";
import {
  createDifferences,
  groupAddOnNames,
  groupInsurances,
  groupTerms,
} from "../lib/comparison.ts";
import { normalizeInsuranceType } from "../lib/insurance-normalization.ts";

const policy = (type = "Bil", importantTerms = [], addOns = [], extra = {}) => ({
  type,
  productName: "Testprodukt",
  annualPremium: null,
  deductible: null,
  coverageSummary: null,
  importantTerms,
  addOns,
  ...extra,
});

const document = (insurance) => ({
  insuranceData: { company: "Testselskap", totalAnnualPremium: null, insurances: [insurance] },
});

const comparison = (first, second) => {
  const groups = groupInsurances([first], [second], null);
  return {
    groups,
    terms: groupTerms(groups[0], null),
    differences: createDifferences(document(first), document(second), groups, null),
  };
};

test("eksplisitt inkludert dekning blir selected og får korrekt UI-tekst", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { name: "Leiebil", value: "Leiebil er inkludert" },
  ]), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "selected");
  assert.equal(coverageStatusLabel(coverage.status), "✓ Valgt");
});

test("eksplisitt ikke valgt dekning blir not_selected og får korrekt UI-tekst", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { name: "Leiebil", value: "Leiebil er ikke valgt" },
  ]), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "not_selected");
  assert.equal(coverageStatusLabel(coverage.status), "❌ Ikke valgt");
});

test("manglende dekning blir unknown og aldri not_selected", () => {
  const coverage = canonicalCoverage(policy(), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "unknown");
  assert.equal(coverageStatusLabel(coverage.status), "— Ikke dokumentert");
});

test("ikke dokumentert og kan ikke avgjøres blir unknown", () => {
  for (const value of ["Ikke dokumentert", "Kan ikke avgjøres", "Ikke dokumentert / kan ikke avgjøres"]) {
    const coverage = canonicalCoverage(policy("Bil", [{ name: "Leiebil", value }]), "Bil", "leiebil.dekning");
    assert.equal(coverage?.status, "unknown", value);
  }
});

test("eksplisitt leiebildetalj kan dokumentere hoveddekningen", () => {
  const source = {
    documentId: "customer-document", filename: "forsikringsbevis.pdf", termsNumber: "Ikke oppgitt",
    effectiveFrom: "Ikke oppgitt", page: 2, section: "Leiebil",
  };
  const coverage = canonicalCoverage(policy("Bil", [
    { name: "Ved reparasjon", value: "Leiebil inntil 60 dager", source },
  ]), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "selected");
  assert.match(coverage.summary ?? "", /60 dager/);
  assert.equal(coverage.details[0].key, "leiebil.dager");
  assert.deepEqual(coverage.sources, [source]);
});

test("eksplisitt ikke valgt slår generisk tilleggsopplisting", () => {
  const insurance = policy("Bil", [
    { name: "Leiebil", value: "Leiebil er ikke valgt" },
  ], [{ name: "Leiebil", importantTerms: [] }]);
  const coverage = canonicalCoverage(insurance, "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "not_selected");
  assert.equal(coverage.conflict, false);
  assert.equal(groupAddOnNames([insurance], "Bil"), null);
});

test("maskinskadedetaljer kan dokumentere hoveddekningen", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { key: "maskinskade.alder", name: "Maskinskade – alder", value: "10 år" },
    { key: "maskinskade.km", name: "Maskinskade – kilometer", value: "200 000 km" },
  ]), "Bil", "maskinskade.dekning");
  assert.equal(coverage?.status, "selected");
  assert.match(coverage.summary ?? "", /10 år/);
  assert.match(coverage.summary ?? "", /200 000 km/);
});

test("manglende maskinskadeinformasjon blir unknown", () => {
  assert.equal(canonicalCoverage(policy(), "Bil", "maskinskade.dekning")?.status, "unknown");
});

test("statusmodellen virker også for Innbo", () => {
  const coverage = canonicalCoverage(policy("Innbo", [
    { name: "Uhellsdekning", value: "Inkludert" },
  ]), "Innbo", "uhell.dekning");
  assert.equal(coverage?.status, "selected");
});

test("personbilvariantene beholder samme kanoniske forsikringstype", () => {
  for (const value of ["Bil", "Bilforsikring", "Personbil", "Motorvognforsikring"]) {
    assert.equal(normalizeInsuranceType(value), "bil", value);
  }
});

test("detaljrader beholdes etter at hovedstatus er utledet", () => {
  const result = comparison(
    policy("Bil", [{ name: "Leiebil", value: "Ikke valgt" }]),
    policy("Bil", [
      { name: "Ved reparasjon", value: "Leiebil inntil 60 dager" },
      { name: "Ved kondemnasjon", value: "Leiebil inntil 30 dager" },
    ]),
  );
  assert.equal(result.terms.find((term) => term.key === "leiebil.dekning")?.secondCoverage?.status, "selected");
  assert.ok(result.terms.find((term) => term.key === "leiebil.dager")?.second);
  assert.ok(result.terms.find((term) => term.key === "leiebil.kondemnasjon")?.second);
});

test("ubekreftet katalogdata alene velger ikke kundedekning", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { key: "leiebil.dekning", name: "Leiebil", value: "Inkludert", coverageOrigin: "catalog" },
  ]), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "unknown");
  assert.equal(coverage?.evidence[0].kind, "catalog_definition");
});

test("eksplisitt dokumentstatus overstyrer bekreftet katalogdata", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { key: "leiebil.dekning", name: "Leiebil", value: "Inkludert", coverageOrigin: "catalog" },
    { name: "Leiebil", value: "Leiebil er ikke valgt", coverageOrigin: "document" },
  ], [], { catalogSelectionConfirmed: true }), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "not_selected");
});

test("uløst konflikt på samme evidensnivå blir unknown", () => {
  const coverage = canonicalCoverage(policy("Bil", [
    { name: "Leiebil", value: "Leiebil er inkludert" },
    { name: "Leiebil", value: "Leiebil er ikke valgt" },
  ]), "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "unknown");
  assert.equal(coverage?.conflict, true);
  assert.equal(coverage?.evidence.length, 2);
});

test("unknown mot unknown blir ikke en viktig forskjell", () => {
  const result = comparison(
    policy("Bil", [{ name: "Leiebil", value: "Ikke dokumentert" }]),
    policy("Bil", [{ name: "Leiebil", value: "Kan ikke avgjøres" }]),
  );
  assert.equal(result.differences.some((difference) => difference.title === "Leiebil"), false);
});

test("selected mot not_selected blir en viktig statusforskjell", () => {
  const result = comparison(
    policy("Bil", [{ name: "Leiebil", value: "Leiebil er ikke valgt" }]),
    policy("Bil", [{ name: "Leiebil", value: "Leiebil er inkludert" }]),
  );
  const difference = result.differences.find((item) => item.title === "Leiebil");
  assert.match(difference?.text ?? "", /Eksisterende: ❌ Ikke valgt/);
  assert.match(difference?.text ?? "", /Nytt tilbud: ✓ Valgt/);
});
