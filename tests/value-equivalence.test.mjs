import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { materiallyEquivalentValues } from "../lib/value-equivalence.ts";

const source = (id) => ({ documentId: id, filename: `${id}.pdf`, termsNumber: id,
  effectiveFrom: "2026-01", page: 1, section: "1" });
const synthetic = (company, value) => ({ insuranceData: { company, totalAnnualPremium: null,
  insurances: [{ type: "Bil", productName: "Produkt", annualPremium: null, deductible: null,
    coverageSummary: null, importantTerms: [{ key: "test.dekning", name: "Testdekning", value,
      source: source(company) }] }] } });
const manual = (company, productName, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName, annualPremium: "",
    deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
function compare(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  const raw = createDifferences(first, second, groups, null);
  return { details: groupTerms(groups[0], null), raw,
    shown: presentImportantDifferences(raw, groups, null, first.insuranceData.company, second.insuranceData.company) };
}

test("samme enkle liste i forskjellig rekkefølge er lik", () => {
  assert.equal(materiallyEquivalentValues("A, B og C", "A, C og B"), true);
  assert.equal(compare(synthetic("A", "A, B og C"), synthetic("B", "A, C og B"))
    .raw.some((difference) => difference.termKey === "test.dekning"), false);
});

test("komma, og, trivial tegnsetting og mellomrom endrer ikke en enkel liste", () => {
  assert.equal(materiallyEquivalentValues("  A, B og C. ", "C, A, B"), true);
  assert.equal(materiallyEquivalentValues("A og B, C", "A, C og B"), true);
  assert.equal(materiallyEquivalentValues("Åpen flamme, eksplosjon og lynnedslag.",
    "Åpen flamme, lynnedslag og eksplosjon"), true);
});

test("ett forskjellig eller ekstra element er en reell forskjell", () => {
  assert.equal(materiallyEquivalentValues("A, B og C", "A, B og D"), false);
  assert.equal(materiallyEquivalentValues("A, B og C", "A, B, C og D"), false);
  for (const value of ["A, B og D", "A, B, C og D"]) {
    assert.ok(compare(synthetic("A", "A, B og C"), synthetic("B", value))
      .raw.some((difference) => difference.termKey === "test.dekning"));
  }
});

test("materielle forbehold, beløp og tidsgrenser blir ikke filtrert", () => {
  for (const value of [
    "A, B og C; unntatt D", "A, B og C med egenandel 2 000 kr",
    "A, B og C. Gjelder kun innen 3 år", "A, B og C, men ikke D",
  ]) assert.equal(materiallyEquivalentValues("A, B og C", value), false, value);
  assert.equal(materiallyEquivalentValues("A, B og C", "A, C og B med egenandel 2 000 kr"), false);
  assert.equal(materiallyEquivalentValues("A, B og C", "A, B og C, inntil 30 dager"), false);
});

test("Tryg mot Gjensidige filtrerer Brann fra hovedvisningen og bevarer originaltekst og kilder", () => {
  const result = compare(
    manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"]),
    manual("Gjensidige", "Pluss"),
  );
  const fire = result.details.find((term) => term.key === "brann.dekning");
  assert.equal(fire.first, "Åpen flamme, eksplosjon og lynnedslag");
  assert.equal(fire.second, "Åpen flamme, lynnedslag og eksplosjon");
  assert.equal(fire.firstSources[0].company, "Tryg");
  assert.equal(fire.secondSources[0].company, "Gjensidige");
  assert.equal(result.raw.some((difference) => difference.termKey === "brann.dekning"), false);
  const highlighted = result.shown.filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  assert.equal(highlighted.some((difference) => difference.termKey === "brann.dekning"), false);
  assert.equal(highlighted[4].termKey, "tyveri.dekning");
  assert.equal(highlighted[5].termKey, "glass.dekning");
});

test("eksisterende Tryg mot If beholder reelle forskjeller og ignorerer identisk Brann", () => {
  const result = compare(manual("Tryg", "Kasko", ["bil-ekstra"]), manual("If", "Super"));
  assert.equal(result.raw.some((difference) => difference.termKey === "brann.dekning"), false);
  assert.ok(result.raw.some((difference) => difference.termKey === "nyverdi.alder"));
  assert.ok(result.shown.some((difference) => difference.title === "Totalskadegaranti"));
});
