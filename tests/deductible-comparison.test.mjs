import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";

const manual = (company, productName, addOnIds, deductible = "") => normalizeManualAgreement({
  company, totalAnnualPremium: "",
  products: [{ type: "Bil", productName, annualPremium: "", deductible,
    coverageSummary: "", importantTerms: [], addOnIds }],
});

function compare(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const differences = createDifferences(first, second, groups, null);
  const highlighted = presentImportantDifferences(differences, groups, null,
    first.insuranceData.company, second.insuranceData.company)
    .filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  return { terms, differences, highlighted };
}

const tryg = (deductible = "") => manual("Tryg", "Kasko",
  ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"], deductible);
const ifSuper = (deductible = "") => manual("If", "Super", ["if-motor-gir", "if-leiebil"], deductible);

test("kundespesifikk verdi gjør ikke standardegenandel med forbehold til kundens verdi", () => {
  const result = compare(tryg("6 000 kr"), ifSuper());
  assert.equal(result.differences.some((item) => item.kind === "deductible"), false);
  assert.ok(!result.differences.some((item) => ["brann.egenandel", "tyveri.egenandel", "kasko.egenandel"]
    .includes(item.termKey)));
  const fire = result.terms.find((item) => item.key === "brann.egenandel");
  assert.deepEqual(fire.firstDeductibleClassifications, ["standard"]);
  assert.deepEqual(fire.secondDeductibleClassifications, ["standard"]);
  assert.match(fire.second, /8 000 kr.*forsikringsbevis/);
  assert.equal(fire.secondSources.find((source) => source.section === "8.5")?.page, 18);
});

test("to manuelt registrerte generelle egenandeler sammenlignes uten å overstyre skadetyper", () => {
  const result = compare(tryg("6 000 kr"), ifSuper("4 000 kr"));
  const agreed = result.highlighted.find((item) => item.kind === "deductible");
  assert.match(agreed?.text ?? "", /6 000 kr.*4 000 kr/);
  assert.match(agreed.text, /2\s000 kr lavere kundespesifikk egenandel/);
  assert.match(agreed.text, /Særskilte egenandeler kan gjelde/);
  for (const key of ["brann.egenandel", "tyveri.egenandel"]) {
    assert.ok(!result.differences.some((item) => item.termKey === key));
  }
});

test("to uttrykkelig overstyrende særskilte egenandeler kan sammenlignes direkte", () => {
  const make = (company, amount) => ({ insuranceData: { company, totalAnnualPremium: null, insurances: [{
    type: "Båt", productName: "Produkt", annualPremium: null, deductible: null,
    coverageSummary: null, importantTerms: [{
      key: "berging.egenandel", name: "Berging – egenandel", value: `${amount} kr`,
      deductibleClassification: "override",
      source: { documentId: company, filename: `${company}.pdf`, termsNumber: company,
        effectiveFrom: "2026-01-01", section: "Særskilt egenandel i stedet for avtalt generell egenandel", page: 1 },
    }],
  }] } });
  const result = compare(make("A", "1 000"), make("B", "2 000"));
  const special = result.differences.find((item) => item.termKey === "berging.egenandel");
  assert.match(special?.text ?? "", /1 000 kr.*2 000 kr/);
  assert.ok(result.highlighted.some((item) => item.termKey === "berging.egenandel"));
  assert.equal(result.terms.find((item) => item.key === "berging.egenandel").firstSources[0].section,
    "Særskilt egenandel i stedet for avtalt generell egenandel");
  const ambiguous = make("A", "1 000");
  ambiguous.insuranceData.insurances[0].importantTerms.push({
    ...ambiguous.insuranceData.insurances[0].importantTerms[0], deductibleClassification: undefined,
  });
  assert.equal(compare(ambiguous, make("B", "2 000")).differences
    .some((item) => item.termKey === "berging.egenandel"), false);
});

test("manglende kundespesifikk egenandel gjør ikke katalogstandard til sikker forskjell", () => {
  const result = compare(tryg(), ifSuper());
  assert.equal(result.differences.some((item) => item.kind === "deductible"), false);
  assert.ok(!result.highlighted.some((item) => /egenandel/i.test(item.title)));
  assert.equal(result.terms.find((item) => item.key === "tyveri.egenandel").firstSources[0].termsNumber, "PAU25205");
});

test("standard- og skadetypeverdier med alle kilder blir i detaljvisningen", () => {
  const result = compare(tryg("6 000 kr"), ifSuper("4 000 kr"));
  const fire = result.terms.find((item) => item.key === "brann.egenandel");
  assert.match(fire.first, /6 000 kr.*forsikringsbevis/);
  assert.match(fire.second, /8 000 kr.*forsikringsbevis/);
  assert.equal(fire.firstSources[0].termsNumber, "PAU25205");
  assert.equal(fire.secondSources.find((source) => source.section === "8.5.3")?.page, 19);
  assert.equal(fire.secondSources.find((source) => source.section === "8.5")?.page, 18);
  assert.match(fire.secondSources.find((source) => source.section === "8.5.3")?.note ?? "", /Standardegenandel/);
  const glass = result.terms.find((item) => item.key === "glass.egenandel.bytte");
  assert.deepEqual(glass.firstDeductibleClassifications, ["coverage"]);
  assert.deepEqual(glass.secondDeductibleClassifications, ["standard"]);
  assert.match(glass.firstSources[0].note ?? "", /forrang.*ikke dokumentert/i);
  assert.equal(glass.secondSources.find((source) => source.section === "8.5")?.page, 18);
});

test("ukjent opphav til PDF-egenandel gir ingen sikker kundespesifikk konklusjon", () => {
  const make = (company, deductible) => ({ insuranceData: { company, totalAnnualPremium: null, insurances: [{
    type: "Bil", productName: null, annualPremium: null, deductible,
    coverageSummary: null, importantTerms: [],
  }] } });
  const result = compare(make("A", "6 000 kr"), make("B", "4 000 kr"));
  const difference = result.differences.find((item) => item.kind === "deductible");
  assert.match(difference?.text ?? "", /grunnlag er ikke bekreftet som kundespesifikt/);
  assert.doesNotMatch(difference.text, /lavere kundespesifikk/);
});
