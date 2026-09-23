import assert from "node:assert/strict";
import test from "node:test";

import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { canonicalCoverage, coverageStatusLabel } from "../lib/coverage-status.ts";
import { groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeDocumentFacts } from "../lib/document-fact-normalization.ts";
import { EXTRACTION_INSTRUCTIONS } from "../lib/analysis-output.ts";

const agreement = (company, productName, importantTerms = [], coverageSummary = null, extra = {}) => ({
  company,
  totalAnnualPremium: null,
  totalAnnualPremiumScope: "partial_or_unclear",
  insurances: [{
    type: "Bil",
    productName,
    annualPremium: null,
    deductible: null,
    coverageSummary,
    importantTerms,
    addOns: [],
    ...extra,
  }],
});

const enrich = (company, productName, importantTerms = [], coverageSummary = null, extra = {}) =>
  enrichExtractedAgreementWithCatalog(
    agreement(company, productName, importantTerms, coverageSummary, extra),
    new Date("2026-09-23T12:00:00Z"),
  ).insurances[0];

const values = (insurance, key) => insurance.importantTerms.filter((term) => term.key === key);

test("uttrekksinstruksen prioriterer kundens forsikringsbevis foran generelle produktvilkår", () => {
  assert.match(EXTRACTION_INSTRUCTIONS, /forsikringsbevis.*generelle produktvilkår.*konkrete verdien i forsikringsbeviset/is);
});

test("sammensatt dokumentverdi for maskinskade slår katalogens alder", () => {
  const insurance = enrich("Gjensidige", "Pluss", [{
    name: "Maskinskade",
    value: "Til første hovedforfall etter at bilen er 10 år eller 200 000 km, det som inntreffer først",
  }]);
  assert.deepEqual(values(insurance, "maskinskade.alder").map((term) => term.value), ["10 år"]);
  assert.equal(values(insurance, "maskinskade.alder")[0].coverageOrigin, "document");
  assert.equal(insurance.importantTerms.some((term) =>
    term.key === "maskinskade.alder" && /12 år/u.test(term.value)), false);
});

test("sammensatt dokumentverdi beholder 200 000 km uten katalogduplikat", () => {
  const insurance = enrich("Gjensidige", "Pluss", [{
    name: "Maskinskade",
    value: "Gjelder til 10 år eller 200 000 km",
  }]);
  assert.deepEqual(values(insurance, "maskinskade.km").map((term) => term.value), ["200 000 km"]);
  assert.equal(values(insurance, "maskinskade.km")[0].coverageOrigin, "document");
});

test("eksplisitt negativ leiebilstatus i dekningssammendrag blir not_selected", () => {
  const insurance = enrich("Gjensidige", "Kasko", [], "Kjøretøydekninger. Leiebil er ikke valgt.");
  const coverage = canonicalCoverage(insurance, "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "not_selected");
  assert.equal(coverageStatusLabel(coverage.status), "❌ Ikke valgt");
  assert.equal(insurance.importantTerms.some((term) => term.key?.startsWith("leiebil.") &&
    term.coverageOrigin === "catalog"), false);
});

test("eksplisitt valgt leiebilstatus i annet dokumentfelt blir selected", () => {
  const insurance = enrich("Gjensidige", "Pluss", [{
    name: "Valgte dekninger",
    value: "Leiebil er valgt",
  }]);
  assert.equal(canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.status, "selected");
});

test("manglende leiebilinformasjon for valgfri dekning forblir unknown", () => {
  const insurance = enrich("Gjensidige", "Kasko");
  assert.equal(canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.status, "unknown");
});

test("førstegangsregistrering flyttes fra sammendrag til canonical dokumentfelt", () => {
  const insurance = enrich("Gjensidige", "Pluss", [], "Nissan LEAF. Første gang registrert: 2014.");
  assert.deepEqual(values(insurance, "kjoretoy.forstegangsregistrering").map((term) => term.value), ["2014"]);
  assert.equal(values(insurance, "kjoretoy.forstegangsregistrering")[0].coverageOrigin, "document");
});

test("sammendrag med eksplisitte maskin-, nøkkel- og totalskadegrenser får canonical dokumentforrang", () => {
  const insurance = enrich("Gjensidige", "Pluss", [],
    "Maskinskade: 10 år / 200 000 km. Bilnøkkel: 15 000 kr. Totalskadegaranti: 3 år / 60 000 km.");
  assert.deepEqual(values(insurance, "maskinskade.alder").map((term) => term.value), ["10 år"]);
  assert.deepEqual(values(insurance, "maskinskade.km").map((term) => term.value), ["200 000 km"]);
  assert.deepEqual(values(insurance, "bilnokkel.grense").map((term) => term.value), ["15 000 kr"]);
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["3 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["60 000 km"]);
  for (const key of ["maskinskade.alder", "maskinskade.km", "bilnokkel.grense", "nyverdi.alder", "nyverdi.km"]) {
    assert.equal(values(insurance, key)[0].coverageOrigin, "document", key);
  }
});

test("sammendragsparser krysser ikke fra én dekning til en annen", () => {
  const insurance = enrich("Gjensidige", "Pluss", [],
    "Maskinskade er omtalt uten grenser. Totalskadegaranti: 3 år / 60 000 km.");
  assert.ok(values(insurance, "maskinskade.alder").some((term) => /12 år/u.test(term.value) &&
    term.coverageOrigin === "catalog"));
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["3 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["60 000 km"]);
});

test("eksplisitt førstegangsregistreringsfelt bruker samme canonical key", () => {
  const insurance = enrich("Gjensidige", "Kasko", [
    { name: "Første gang registrert", value: "2013" },
  ]);
  assert.deepEqual(values(insurance, "kjoretoy.forstegangsregistrering").map((term) => term.value), ["2013"]);
});

test("Kasko beholder dokumentert bilnøkkelsum på 7 500 kr", () => {
  const insurance = enrich("Gjensidige", "Kasko", [
    { name: "Bilnøkkel", value: "7 500 kr" },
  ]);
  assert.deepEqual(values(insurance, "bilnokkel.grense").map((term) => term.value), ["7 500 kr"]);
  assert.equal(values(insurance, "bilnokkel.grense")[0].coverageOrigin, "document");
});

test("Pluss beholder dokumentert bilnøkkelsum på 15 000 kr", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Bilnøkkel forsikringssum", value: "15 000 kr" },
  ]);
  assert.deepEqual(values(insurance, "bilnokkel.grense").map((term) => term.value), ["15 000 kr"]);
});

test("Kasko totalskadegaranti bruker dokumentets 1 år og 15 000 km", () => {
  const insurance = enrich("Gjensidige", "Kasko", [
    { name: "Totalskadegaranti", value: "1 år / 15 000 km" },
  ]);
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["1 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["15 000 km"]);
  assert.equal(insurance.importantTerms.some((term) => term.key === "nyverdi.km" && /20 000/u.test(term.value)), false);
});

test("Pluss totalskadegaranti bruker dokumentets 3 år og 60 000 km", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Totalskadegaranti", value: "3 år / 60 000 km" },
  ]);
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["3 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["60 000 km"]);
});

test("katalogen supplerer fortsatt canonical felt som dokumentet mangler", () => {
  const insurance = enrich("Gjensidige", "Kasko", [
    { name: "Totalskadegaranti – kilometer", value: "15 000 km" },
  ]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["15 000 km"]);
  assert.equal(values(insurance, "nyverdi.alder")[0].coverageOrigin, "catalog");
});

test("ulike rå etiketter med samme canonical felt gir dokumentforrang", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Motor- og girskade – aldersgrense", value: "10 år" },
  ]);
  assert.deepEqual(values(insurance, "maskinskade.alder").map((term) => term.value), ["10 år"]);
});

test("forskjellige semantiske felt beholdes selv om begge gjelder maskinskade", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Maskinskade – alder", value: "10 år" },
  ]);
  assert.equal(values(insurance, "maskinskade.alder").length, 1);
  assert.ok(values(insurance, "maskinskade.km").length === 1);
  assert.ok(values(insurance, "maskinskade.fossil").length === 1);
});

test("ukjent nesten-lik etikett fuzzy-matches ikke til canonical detail", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Maskinskadevurdering", value: "10 år" },
  ]);
  assert.ok(insurance.importantTerms.some((term) => term.name === "Maskinskadevurdering" && !term.key));
  assert.ok(values(insurance, "maskinskade.alder").some((term) => /12 år/u.test(term.value) &&
    term.coverageOrigin === "catalog"));
});

test("dokumentforrang er providernøytral og virker for Tryg Bil", () => {
  const insurance = enrich("Tryg", "Kasko", [
    { name: "Nyverdierstatning", value: "2 år / 30 000 km" },
  ]);
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["2 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["30 000 km"]);
  assert.equal(values(insurance, "nyverdi.alder")[0].coverageOrigin, "document");
});

test("Gjensidige Kasko og Pluss beholder sikre katalogreferanser", () => {
  assert.equal(enrich("Gjensidige", "Kasko").catalogReference?.productId, "gj-bil-kasko");
  assert.equal(enrich("Gjensidige Forsikring ASA", "Pluss").catalogReference?.productId, "gj-bil-pluss");
});

test("dokument- og katalogprovenance forblir atskilt etter sammenslåing", () => {
  const insurance = enrich("Gjensidige", "Pluss", [
    { name: "Maskinskade", value: "10 år eller 200 000 km" },
  ]);
  assert.equal(values(insurance, "maskinskade.alder")[0].coverageOrigin, "document");
  assert.equal(values(insurance, "maskinskade.fossil")[0].coverageOrigin, "catalog");
  assert.equal(values(insurance, "maskinskade.fossil")[0].source?.documentId, "gjPluss");
});

test("reelt Kasko/Pluss-case beholder kundeverdier gjennom comparison", () => {
  const kasko = enrich("Gjensidige", "Kasko", [
    { name: "Første gang registrert", value: "2013" },
    { name: "Kjørelengde", value: "20 000 km" },
    { name: "Kilometerstand", value: "178 697" },
    { name: "Bonus", value: "75 % 3. år" },
    { name: "Bilnøkkel", value: "7 500 kr" },
    { name: "Totalskadegaranti", value: "1 år / 15 000 km" },
  ], "Leiebil er ikke valgt. Punkteringsskade er ikke valgt.", {
    annualPremium: "14 786 kr", deductible: "6 000 kr",
  });
  const pluss = enrich("Gjensidige", "Pluss", [
    { name: "Første gang registrert", value: "2014" },
    { name: "Kjørelengde", value: "20 000 km" },
    { name: "Kilometerstand", value: "164 000" },
    { name: "Bonus", value: "75 % mer enn 3 år" },
    { name: "Bilnøkkel", value: "15 000 kr" },
    { name: "Maskinskade", value: "10 år eller 200 000 km" },
    { name: "Totalskadegaranti", value: "3 år / 60 000 km" },
  ], "Leiebil er valgt. Punkteringsskade er ikke valgt.", {
    annualPremium: "12 788 kr", deductible: "6 000 kr",
  });
  const group = groupInsurances([kasko], [pluss], null)[0];
  const terms = groupTerms(group, null);
  const fact = (key) => terms.find((term) => term.key === key);
  assert.equal(group.first[0].annualPremium, "14 786 kr");
  assert.equal(group.second[0].annualPremium, "12 788 kr");
  assert.equal(fact("kjoretoy.forstegangsregistrering")?.first, "2013");
  assert.equal(fact("kjoretoy.forstegangsregistrering")?.second, "2014");
  assert.equal(fact("bilnokkel.grense")?.first, "7 500 kr");
  assert.equal(fact("bilnokkel.grense")?.second, "15 000 kr");
  assert.equal(fact("nyverdi.km")?.first, "15 000 km");
  assert.equal(fact("nyverdi.km")?.second, "60 000 km");
  assert.equal(canonicalCoverage(kasko, "Bil", "leiebil.dekning")?.status, "not_selected");
  assert.equal(canonicalCoverage(pluss, "Bil", "leiebil.dekning")?.status, "selected");
});

test("normalisering er forsikringstypeavgrenset", () => {
  const facts = normalizeDocumentFacts({
    type: "Innbo", productName: "Standard", annualPremium: null, deductible: null,
    coverageSummary: null, addOns: [],
    importantTerms: [{ name: "Maskinskade", value: "10 år eller 200 000 km" }],
  });
  assert.equal(facts.some((term) => term.key === "maskinskade.alder"), false);
  assert.equal(facts.some((term) => term.key === "maskinskade.km"), false);
});
