import assert from "node:assert/strict";
import test from "node:test";
import { groupInsurances, groupTerms } from "../lib/comparison.ts";
import { sortDetailedTerms } from "../lib/comparison-presentation.ts";
import { normalizeCatalogTermKey, normalizeTermName } from "../lib/insurance-normalization.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { catalogConnectionStatus, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

const product = (company, type, name) => {
  const result = productCatalog.products.find((item) =>
    item.company === company && item.insuranceType === type && item.name === name
  );
  assert.ok(result, `${company} ${type} ${name}`);
  return result;
};
const keys = (company, type, name) =>
  new Set(resolveCatalogFacts(product(company, type, name), []).map((fact) => fact.key));

const catalogAgreement = (company, type, productName, addOnIds = []) =>
  normalizeManualAgreement({ company, totalAnnualPremium: "", products: [{
    type, productName, annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], addOnIds,
  }] });

const comparedTerms = (left, right) => groupTerms(groupInsurances(
  left.insuranceData.insurances, right.insuranceData.insurances, null,
)[0], null);

test("manuelle Bil-begreper normaliseres deterministisk til katalogens hovedkeys", () => {
  for (const [label, expected] of [
    ["Ansvar", "ansvar.dekning"],
    ["Maskinskade", "maskinskade.dekning"],
    ["Redning og assistanse", "veihjelp.dekning"],
    ["Glasskade", "glass.dekning"],
  ]) assert.equal(normalizeTermName(label, { insuranceType: "Bil" }), expected);
  assert.notEqual(normalizeTermName("Glass", { insuranceType: "Hus" }), "glass.dekning");
});

test("manuell Ansvar og Maskinskade samles med katalogfacts på én key", () => {
  const manual = normalizeManualAgreement({ company: "Ukjent", totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Egen variant", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [{ name: "Ansvar", value: "Omfattet" }, { name: "Maskinskade", value: "Omfattet" }],
  }] });
  const catalog = normalizeManualAgreement({ company: "Gjensidige", totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Pluss", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [],
  }] });
  const terms = groupTerms(groupInsurances(
    manual.insuranceData.insurances, catalog.insuranceData.insurances, null,
  )[0], null);
  for (const key of ["ansvar.dekning", "maskinskade.dekning"]) {
    const term = terms.find((item) => item.key === key);
    assert.ok(term?.first && term.second, key);
    assert.equal(terms.filter((item) => item.key === key).length, 1);
  }
});

test("Reise holder sykeledsagelse samlet og tre varighetskonsepter separate", () => {
  for (const [company, name] of [["Tryg", "Reise Premium"], ["Gjensidige", "Reise Pluss"],
    ["Storebrand", "Super"], ["Fremtind", "Reise"], ["Frende", "Reiseforsikring"]]) {
    assert.ok(keys(company, "Reise", name).has("reise.sykeledsagelse"), company);
  }
  assert.ok(keys("Tryg", "Reise", "Reise Premium").has("reise.varighet.automatisk_forlengelse"));
  assert.ok(keys("Fremtind", "Reise", "Reise").has("reise.varighet.valg"));
  assert.ok(keys("Gjensidige", "Reise", "Reise Pluss").has("reise.varighet.enkeltreise_utvidelse"));
  assert.ok(keys("Frende", "Reise", "Reiseforsikring").has("reise.varighet.enkeltreise_utvidelse"));
  assert.ok(!keys("Tryg", "Reise", "Reise Premium").has("reise.varighet.valg"));
  assert.match(resolveCatalogFacts(product("Fremtind", "Reise", "Reise"), [])
    .find((fact) => fact.key === "reise.varighet.maks").value, /70/);
  assert.match(resolveCatalogFacts(product("Fremtind", "Reise", "Eika Reise (P10 – historisk)"), [])
    .find((fact) => fact.key === "reise.varighet.maks").value, /77/);
});

test("Reise skiller eget og leid sportsutstyr samt ordinær og gjentatt mobilegenandel", () => {
  assert.ok(keys("Tryg", "Reise", "Reise Premium").has("reise.bagasje.sportsutstyr"));
  assert.ok(keys("Frende", "Reise", "Reiseforsikring").has("reise.bagasje.sportsutstyr"));
  assert.ok(keys("Gjensidige", "Reise", "Reise Pluss").has("reise.bagasje.leid_sportsutstyr"));
  assert.ok(!keys("Gjensidige", "Reise", "Reise Pluss").has("reise.bagasje.sportsutstyr"));
  assert.ok(keys("Tryg", "Reise", "Reise Premium").has("reise.bagasje.mobil_egenandel.gjentatt"));
  assert.ok(keys("Storebrand", "Reise", "Super").has("reise.bagasje.mobil_egenandel.gjentatt"));
  assert.ok(keys("Gjensidige", "Reise", "Reise").has("reise.bagasje.mobil_egenandel"));
  assert.ok(keys("Fremtind", "Reise", "Reise").has("reise.bagasje.mobil_egenandel"));
});

test("historisk Eika flykompensasjon holdes fra hotell- og arrangementsrefusjon", () => {
  const historical = keys("Fremtind", "Reise", "Eika Reise Pluss (P10/P10P – historisk)");
  assert.ok(historical.has("reise.forsinkelse.fly_kompensasjon"));
  assert.ok(!historical.has("reise.forsinkelse.hotell_arrangement"));
  assert.ok(keys("Tryg", "Reise", "Reise Premium").has("reise.forsinkelse.hotell_arrangement"));
});

test("Hus holder ulike egenandelsutløsere og gjenoppføringsytelser separate", () => {
  assert.ok(keys("Tryg", "Hus", "Hus Ekstra").has("hus.vann.egenandel.terreng_grunnvann"));
  assert.ok(keys("Storebrand", "Hus", "Super").has("hus.vann.egenandel.alder_frost_vannforhold"));
  assert.ok(keys("Fremtind", "Hus", "Topp").has("hus.vann.egenandel.gjentatt_vann"));
  assert.ok(keys("Frende", "Hus", "Utvidet").has("hus.egenandel.gjentatt_skade"));
  assert.ok(keys("Storebrand", "Hus", "Super").has("hus.gjenoppforing.klima_sikkerhet"));
  assert.ok(keys("Gjensidige", "Hus", "Hus Pluss").has("hus.gjenoppforing.svanemerket"));
});

test("sikre Hus- og Bil-P1-keys er standardisert", () => {
  for (const company of ["Tryg", "If"]) {
    const bil = new Set(resolveCatalogFacts(product(company, "Bil", company === "Tryg" ? "Kasko" : "Super"),
      company === "Tryg" ? ["bil-ekstra"] : []).map((fact) => fact.key));
    assert.ok(bil.has("ladekabel.dekning"), `${company} ladekabel`);
    assert.ok(bil.has("bilnokkel.dekning"), `${company} bilnøkkel`);
  }
  for (const [company, name] of [["If", "Super"], ["Fremtind", "Topp"], ["Frende", "Utvidet"]]) {
    assert.ok(keys(company, "Hus", name).has("hus.ror.tining"), company);
  }
  for (const [company, name] of [["Tryg", "Hus Ekstra"], ["If", "Super"], ["Storebrand", "Super"],
    ["Gjensidige", "Hus Pluss"], ["Fremtind", "Topp"]]) {
    assert.ok(keys(company, "Hus", name).has("hus.aldersfradrag.integrerte_hvitevarer"), company);
  }
  assert.ok(keys("Tryg", "Hus", "Hus Ekstra").has("hus.glass.isolerglass_punktering"));
  assert.ok(keys("Frende", "Hus", "Utvidet").has("hus.glass.isolerglass_punktering"));
});

test("Innbo bruker separate målepunkter for verdigjenstander", () => {
  assert.ok(keys("If", "Innbo", "Super").has("innbo.verdigjenstander.sammensatte_grenser"));
  assert.ok(keys("Gjensidige", "Innbo", "Innbo Pluss").has("innbo.verdigjenstander.sammensatte_grenser"));
  assert.ok(keys("Fremtind", "Innbo", "Innbo Pluss").has("innbo.verdigjenstander.smykker_edelmetall.grense"));
  assert.ok(keys("Frende", "Innbo", "Standard").has("innbo.verdigjenstander.enkeltgjenstand.grense"));
  assert.equal(["If", "Gjensidige", "Fremtind", "Frende"].some((company) =>
    productCatalog.products.filter((item) => item.company === company && item.insuranceType === "Innbo")
      .some((item) => keys(company, "Innbo", item.name).has("innbo.verdigjenstander.grense"))), false);
});

test("ukjent manuelt produkt beholder fakta uten fuzzy katalogkobling og UI viser status", () => {
  const agreement = normalizeManualAgreement({ company: "DNB / Fremtind", totalAnnualPremium: "", products: [{
    type: "Reise", productName: "Reise", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [{ name: "Avbestilling", value: "Oppgitt manuelt" }],
  }] });
  const insurance = agreement.insuranceData.insurances[0];
  assert.equal(insurance.catalogReference, null);
  assert.equal(insurance.importantTerms[0].value, "Oppgitt manuelt");
  assert.match(catalogConnectionStatus([insurance]), /sammenligningen bygger bare på registrerte opplysninger/);
});

test("detaljfakta samles per familie med hoveddekning før støttefakta", () => {
  const make = (key) => ({ key, label: key, first: "a", second: "b", firstValueCount: 1,
    secondValueCount: 1, firstSources: [], secondSources: [], firstBaseFacts: [], secondBaseFacts: [],
    firstDeductibleClassifications: [], secondDeductibleClassifications: [],
    firstMissingLabel: "", secondMissingLabel: "" });
  const sorted = sortDetailedTerms([
    make("maskinskade.unntak"), make("glass.dekning"), make("maskinskade.egenandel"),
    make("maskinskade.dekning"), make("maskinskade.km"),
  ]).map((term) => term.key);
  assert.deepEqual(sorted, ["maskinskade.dekning", "maskinskade.km", "maskinskade.egenandel",
    "maskinskade.unntak", "glass.dekning"]);
});

test("Maskinskade beholder reelt ulike eller uklare kilometerintervaller separate", () => {
  const terms = comparedTerms(
    catalogAgreement("Tryg", "Bil", "Kasko", ["maskinskade"]),
    catalogAgreement("Gjensidige", "Bil", "Pluss"),
  );
  const intervals = terms.filter((term) => term.key.startsWith("maskinskade.egenandel."));
  assert.deepEqual(intervals.map((term) => term.key).sort(), [
    "maskinskade.egenandel.0-119999",
    "maskinskade.egenandel.120",
    "maskinskade.egenandel.120000-159999",
    "maskinskade.egenandel.160",
    "maskinskade.egenandel.160000-200000",
    "maskinskade.egenandel.200",
  ]);
  assert.ok(intervals.every((term) => Boolean(term.first) !== Boolean(term.second)));
});

test("sikre Bil-underfakta samles på samme rad uten å endre provenance", () => {
  const terms = comparedTerms(
    catalogAgreement("Tryg", "Bil", "Kasko", ["bil-ekstra", "maskinskade"]),
    catalogAgreement("Gjensidige", "Bil", "Pluss"),
  );
  for (const key of ["nyverdi.skadegrad", "bilnokkel.dekning", "bilnokkel.grense",
    "bilnokkel.egenandel", "ladekabel.egenandel", "maskinskade.fossil", "maskinskade.el",
    "maskinskade.drivverk"]) {
    const term = terms.find((entry) => entry.key === key);
    assert.ok(term?.first && term.second, key);
    assert.ok(term.firstSources.some((source) => source.company === "Tryg"), `${key} Tryg provenance`);
    assert.ok(term.secondSources.some((source) => source.company === "Gjensidige"), `${key} Gjensidige provenance`);
  }
  assert.equal(terms.some((term) => term.key === "nyverdi.utloser"), false);
  const trygIf = comparedTerms(
    catalogAgreement("Tryg", "Bil", "Kasko"),
    catalogAgreement("If", "Bil", "Super"),
  );
  assert.ok(trygIf.find((term) => term.key === "veihjelp.transport.grense")?.first);
  assert.ok(trygIf.find((term) => term.key === "veihjelp.transport.grense")?.second);
  assert.equal(trygIf.some((term) => term.key === "veihjelp.grense"), false);
  const trygFremtind = comparedTerms(
    catalogAgreement("Tryg", "Bil", "Kasko", ["bil-ekstra"]),
    catalogAgreement("Fremtind", "Bil", "Topp"),
  );
  for (const key of ["bilnokkel.dekning", "ladekabel.dekning"]) {
    assert.ok(trygFremtind.find((term) => term.key === key)?.first, key);
    assert.ok(trygFremtind.find((term) => term.key === key)?.second, key);
  }
});

test("Bil bruker felles canonical keys for ansvar, rettshjelp og ung fører", () => {
  const trygAnsvar = keys("Tryg", "Bil", "Ansvar");
  assert.ok(trygAnsvar.has("ansvar.ting.grense"));
  assert.ok(trygAnsvar.has("rettshjelp.dekning"));
  assert.equal(trygAnsvar.has("ansvar.annen.grense"), false);
  assert.equal(trygAnsvar.has("rettshjelp"), false);
  const trygKasko = new Set(resolveCatalogFacts(product("Tryg", "Bil", "Kasko"), [])
    .map((fact) => fact.key));
  assert.ok(trygKasko.has("kasko.egenandel.ung"));
  assert.equal(trygKasko.has("kasko.ungforer"), false);
});

test("tidligere sikre katalognøkler normaliseres eksplisitt uten tekstmatching", () => {
  for (const [oldKey, newKey] of [
    ["ansvar.annen.grense", "ansvar.ting.grense"],
    ["kasko.ungforer", "kasko.egenandel.ung"],
    ["nyverdi.utloser", "nyverdi.skadegrad"],
    ["veihjelp.grense", "veihjelp.transport.grense"],
    ["hus.vann.gjentakelse.egenandel", "hus.vann.egenandel.gjentatt_vann"],
    ["hus.solceller.dekning", "hus.teknisk.solceller"],
  ]) assert.equal(normalizeCatalogTermKey(oldKey), newKey);
  assert.equal(normalizeCatalogTermKey("hus.aldersfradrag.oppvarming"),
    "hus.aldersfradrag.oppvarming");
});

test("Hus samler gjentatt vannskade og sikre like objektgrupper", () => {
  const terms = comparedTerms(
    catalogAgreement("Tryg", "Hus", "Hus Ekstra"),
    catalogAgreement("Fremtind", "Hus", "Topp"),
  );
  const repeatedWater = terms.find((term) => term.key === "hus.vann.egenandel.gjentatt_vann");
  assert.ok(repeatedWater?.first && repeatedWater.second);
  assert.equal(terms.some((term) => term.key === "hus.vann.gjentakelse.egenandel"), false);
  const frende = keys("Frende", "Hus", "Utvidet");
  assert.ok(frende.has("hus.teknisk.solceller"));
  assert.ok(frende.has("hus.aldersfradrag.oppvarming_kjoling"));
  assert.equal(frende.has("hus.solceller.dekning"), false);
  assert.ok(keys("Tryg", "Hus", "Hus Ekstra").has("hus.aldersfradrag.oppvarming_kjoling"));
  assert.ok(keys("Storebrand", "Hus", "Super").has("hus.aldersfradrag.oppvarming"));
});

test("ekte one-sided Innbo- og Reise-fakta forblir separate", () => {
  const innbo = comparedTerms(
    catalogAgreement("Tryg", "Innbo", "Innbo Ekstra"),
    catalogAgreement("Gjensidige", "Innbo", "Innbo Pluss"),
  );
  assert.ok(innbo.find((term) => term.key === "uhell.begrensning")?.first);
  assert.equal(innbo.find((term) => term.key === "uhell.begrensning")?.second, null);
  const reise = comparedTerms(
    catalogAgreement("Tryg", "Reise", "Reise Premium"),
    catalogAgreement("Gjensidige", "Reise", "Reise Pluss"),
  );
  assert.ok(reise.find((term) => term.key === "reise.bagasje.sportsutstyr")?.first);
  assert.equal(reise.find((term) => term.key === "reise.bagasje.sportsutstyr")?.second, null);
  assert.equal(reise.find((term) => term.key === "reise.bagasje.leid_sportsutstyr")?.first, null);
  assert.ok(reise.find((term) => term.key === "reise.bagasje.leid_sportsutstyr")?.second);
});
