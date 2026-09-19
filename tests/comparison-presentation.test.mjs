import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";

const manual = (company, productName, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "",
  products: [{ type: "Bil", productName, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
});

function presented(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  const raw = createDifferences(first, second, groups, null);
  return {
    groups,
    raw,
    shown: presentImportantDifferences(raw, groups, null, first.insuranceData.company, second.insuranceData.company),
  };
}

test("Tryg mot If viser totalskadealder og kilometer som ett hovedpunkt med begge kilder i detaljene", () => {
  const result = presented(manual("Tryg", "Kasko", ["bil-ekstra"]), manual("If", "Super"));
  assert.ok(result.raw.some((difference) => difference.termKey === "nyverdi.alder"));
  assert.ok(result.raw.some((difference) => difference.termKey === "nyverdi.km"));
  const summary = result.shown.filter((difference) => difference.title === "Totalskadegaranti");
  assert.equal(summary.length, 1);
  assert.match(summary[0].text, /Tryg:.*3 år.*60 000 km mot If:.*3 år.*60 000 km/);
  assert.ok(!result.shown.some((difference) => difference.termKey === "nyverdi.alder" || difference.termKey === "nyverdi.km"));

  const details = groupTerms(result.groups[0], null);
  const age = details.find((term) => term.key === "nyverdi.alder");
  const distance = details.find((term) => term.key === "nyverdi.km");
  assert.notEqual(age, distance);
  for (const term of [age, distance]) {
    assert.equal(term.firstSources[0].termsNumber, "PAU27002");
    assert.equal(term.secondSources[0].termsNumber, "MOT2-2");
    assert.equal(term.secondSources[0].company, "If");
    assert.ok(term.firstBaseFacts[0].source.termsNumber === "PAU25205");
  }
});

test("reelle beløps- og varighetsforskjeller prioriteres foran manglende dokumentasjon", () => {
  const result = presented(
    manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"]),
    manual("If", "Super", ["if-motor-gir", "if-leiebil"]),
  );
  const highlights = result.shown.filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  for (const [key, left, right] of [
    ["leiebil.dager", /60 dager/, /90 dager/],
    ["ulykke.invaliditet", /500 000 kr/, /200 000 kr/],
    ["ulykke.dod", /100 000 kr.*1 år/, /100 000 kr.*2 år/],
  ]) {
    const difference = highlights.find((item) => item.termKey === key);
    assert.match(difference?.text ?? "", left, key);
    assert.match(difference.text, right, key);
  }
  assert.ok(!highlights.some((difference) => /ikke funnet i vilkårene/i.test(difference.text)));
  assert.ok(result.raw.some((difference) => difference.termKey === "ansvar.dekning" &&
    /ikke funnet i vilkårene/i.test(difference.text)));

  const details = groupTerms(result.groups[0], null);
  for (const [key, trygTerms, ifSection] of [
    ["leiebil.dager", "PAU27002", "4.10.5"],
    ["ulykke.invaliditet", "PAU28013", "4, 11.5.1"],
    ["ulykke.dod", "PAU28013", "11.5.2, 11.7.2.2"],
  ]) {
    const term = details.find((item) => item.key === key);
    assert.equal(term.firstSources[0].termsNumber, trygTerms, key);
    assert.equal(term.secondSources[0].termsNumber, "MOT2-2", key);
    assert.equal(term.secondSources[0].section, ifSection, key);
  }
  const age = details.find((item) => item.key === "maskinskade.alder");
  assert.match(age.first, /10 år/);
  assert.equal(age.second, null);
  assert.equal(age.secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.deepEqual(age.secondSources, []);
  const distance = details.find((item) => item.key === "maskinskade.km");
  assert.match(distance.first, /200 000 km/);
  assert.match(distance.second, /200 000 km/);
  assert.ok(!highlights.some((difference) => difference.termKey === "maskinskade.km"));
});

const source = (id) => ({ documentId: id, filename: `${id}.pdf`, termsNumber: id,
  effectiveFrom: "2026-01", page: 1, section: "1" });
function synthetic(terms, company) {
  return { insuranceData: { company, totalAnnualPremium: null, insurances: [{
    type: "Bil", productName: "Variant", annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: terms.map(([key, name, value]) => ({ key, name, value, source: source(`${company}-${key}`) })),
  }] } };
}

test("samme regel grupperer Maskinskade alder og kilometer selv når bare kilometer er forskjellig", () => {
  const first = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["maskinskade.km", "Maskinskade – kilometer", "200 000 km"],
  ], "Selskap A");
  const second = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["maskinskade.km", "Maskinskade – kilometer", "150 000 km"],
  ], "Selskap B");
  const result = presented(first, second);
  const summary = result.shown.find((difference) => difference.title === "Maskinskade");
  assert.match(summary?.text ?? "", /Selskap A: 10 år \/ 200 000 km mot Selskap B: 10 år \/ 150 000 km/);
  assert.equal(result.shown.filter((difference) => difference.insuranceKey && difference.kind === "term").length, 1);
});

test("alder og kilometer fra ulike dekninger grupperes ikke", () => {
  const first = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "60 000 km"],
  ], "Selskap A");
  const second = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "8 år"],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "30 000 km"],
  ], "Selskap B");
  const result = presented(first, second);
  assert.ok(!result.shown.some((difference) => difference.title === "Maskinskade" || difference.title === "Totalskadegaranti"));
  assert.deepEqual(result.shown.filter((difference) => difference.termKey).map((difference) => difference.termKey).sort(),
    ["maskinskade.alder", "nyverdi.km"]);
});

test("lik teknisk nøkkelstamme er ikke nok når etikettene beskriver ulike dekninger", () => {
  const first = synthetic([
    ["ukjent.alder", "Maskinskade – alder", "10 år"],
    ["ukjent.km", "Totalskadegaranti – kilometer", "60 000 km"],
  ], "Selskap A");
  const second = synthetic([
    ["ukjent.alder", "Maskinskade – alder", "8 år"],
    ["ukjent.km", "Totalskadegaranti – kilometer", "30 000 km"],
  ], "Selskap B");
  const result = presented(first, second);
  assert.equal(result.shown.filter((difference) => difference.termKey).length, 2);
});

test("manglende verdi på én side kombineres ikke med et annet dokumentert datapunkt", () => {
  const first = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["maskinskade.km", "Maskinskade – kilometer", "200 000 km"],
  ], "Selskap A");
  const second = synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "8 år"],
  ], "Selskap B");
  const result = presented(first, second);
  assert.ok(!result.shown.some((difference) => difference.title === "Maskinskade"));
  assert.ok(result.shown.some((difference) => difference.termKey === "maskinskade.alder"));
  assert.equal(groupTerms(result.groups[0], null).find((term) => term.key === "maskinskade.km").second, null);
});
