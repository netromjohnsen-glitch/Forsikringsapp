import assert from "node:assert/strict";
import test from "node:test";
import { groupInsurances } from "../lib/comparison.ts";
import { buildMatchingBatch } from "../lib/hybrid-matching.ts";
import { canonicalInsuranceTypeLabel, hasComparableInsuredValue, normalizeCatalogTermKey, normalizeInsuranceType, normalizeTermName } from "../lib/insurance-normalization.ts";

test("katalogfelt matches bare med godkjente semantiske feltnøkler", () => {
  assert.equal(normalizeCatalogTermKey("rettshjelp"), "rettshjelp.dekning");
  assert.equal(normalizeCatalogTermKey("rettshjelp.dekning"), "rettshjelp.dekning");
  assert.equal(normalizeCatalogTermKey("rettshjelp.egenandel"), "rettshjelp.egenandel");
  assert.notEqual(normalizeCatalogTermKey("ansvar.person.grense"), normalizeCatalogTermKey("ansvar.dekning"));
});

test("sikre produktvarianter får samme nøkkel", () => {
  for (const [left, right] of [
    ["Personbil", "Bilforsikring"],
    ["Personbilforsikringen", "Forsikring for bil"],
    ["Småbåt", "Båtforsikring"],
    ["Motorsykkel-forsikringen", "MC"],
    ["Hus/bolig", "Boligforsikring"],
    ["Hund", "Hundeforsikring"],
  ]) {
    assert.equal(normalizeInsuranceType(left), normalizeInsuranceType(right));
  }
});

test("personbilbetegnelser får samme eksplisitte type og presentasjonsnavn", () => {
  for (const value of [
    "Bil", "Bilforsikring", "Personbil", "Personbilforsikring", "Motorvogn", "Motorvognforsikring",
  ]) {
    assert.equal(normalizeInsuranceType(value), "bil", value);
    assert.equal(canonicalInsuranceTypeLabel(value), "Bil", value);
  }
});

test("Motorvognforsikring og Bilforsikring grupperes side om side uten semantisk matching", () => {
  const policy = (type, productName = "Kasko") => ({
    type, productName, annualPremium: null, deductible: null,
    coverageSummary: "Dekning for personbil", importantTerms: [],
  });
  const existing = policy("Motorvognforsikring");
  const offer = policy("Bilforsikring");
  const groups = groupInsurances([existing], [offer], null);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].key, "bil");
  assert.equal(groups[0].label, "Bil");
  assert.deepEqual(groups[0].first, [existing]);
  assert.deepEqual(groups[0].second, [offer]);
  assert.deepEqual(buildMatchingBatch([existing], [offer]).typeCandidates, []);
});

test("andre motorvognprodukter holdes eksplisitt adskilt fra personbil", () => {
  for (const value of ["MC", "Motorsykkelforsikring", "Bobilforsikring", "Campingvognforsikring", "Mopedforsikring"]) {
    assert.notEqual(normalizeInsuranceType(value), "bil", value);
  }
  assert.equal(normalizeInsuranceType("Motorvognforsikring", { productName: "MC Kasko" }), "mc");
  assert.equal(normalizeInsuranceType("Motorvognforsikring", { productName: "Bobil Kasko" }), "bobil");
  assert.equal(normalizeInsuranceType("Motorvognforsikring", { coverageSummary: "Forsikring for campingvogn" }), "campingvogn");
  assert.equal(normalizeInsuranceType("Motorvogn MC-forsikring"), "mc");

  const vehicle = {
    type: "Motorvognforsikring", productName: "MC Kasko", annualPremium: null, deductible: null,
    coverageSummary: null, importantTerms: [],
  };
  const car = { ...vehicle, type: "Bilforsikring", productName: "Kasko" };
  const groups = groupInsurances([vehicle], [car], null);
  assert.equal(groups.length, 2);
  assert.deepEqual(new Set(groups.map((group) => group.key)), new Set(["mc", "bil"]));
  assert.equal(buildMatchingBatch([vehicle], [car]).typeCandidates.length, 0);
});

test("sammensatte og ulike forsikringsobjekter holdes separate", () => {
  assert.notEqual(normalizeInsuranceType("Hus og fritidsbolig"), normalizeInsuranceType("Boligforsikring"));
  assert.notEqual(normalizeInsuranceType("Fritidsboligforsikring"), normalizeInsuranceType("Boligforsikring"));
  assert.notEqual(normalizeInsuranceType("Bolig og innbo"), normalizeInsuranceType("Boligforsikring"));
  assert.notEqual(normalizeInsuranceType("Båtansvar"), normalizeInsuranceType("Båtforsikring"));
});

test("tydelige vilkårssynonymer matches", () => {
  for (const [left, right] of [
    ["Uhellsskade", "Uhell"],
    ["Reiselengde", "Maksimal varighet per reise"],
    ["Maks varighet pr reise", "Reisevarighet"],
    ["Leiebil", "Erstatningsbil"],
    ["Glass", "Glasskade"],
  ]) {
    assert.equal(normalizeTermName(left), normalizeTermName(right));
  }
});

test("kontekstavhengige vilkår matches innen riktig forsikring", () => {
  for (const [left, right, insuranceType] of [
    ["Maskin- og elektronikkdekning", "Maskinskade", "Personbil"],
    ["Veihjelp", "Redning og assistanse", "Bilforsikring"],
    ["Redning og berging", "Berging og assistanse", "Småbåt"],
    ["Veterinærutgifter", "Veterinærdekning", "Hund"],
  ]) {
    assert.equal(
      normalizeTermName(left, { insuranceType }),
      normalizeTermName(right, { insuranceType }),
    );
  }
});

test("kontekstavhengige aliaser brukes ikke globalt eller på feil type", () => {
  for (const [left, right, wrongType] of [
    ["Maskin- og elektronikkdekning", "Maskinskade", "bolig"],
    ["Veihjelp", "Redning og assistanse", "båt"],
    ["Redning og berging", "Berging og assistanse", "bil"],
    ["Veterinærutgifter", "Veterinærdekning", "katt"],
  ]) {
    assert.notEqual(normalizeTermName(left), normalizeTermName(right));
    assert.notEqual(
      normalizeTermName(left, { insuranceType: wrongType }),
      normalizeTermName(right, { insuranceType: wrongType }),
    );
  }
});

test("forsikringssum og forsikringsverdi krever bekreftet objekt/verdi", () => {
  assert.notEqual(normalizeTermName("Forsikringssum"), normalizeTermName("Forsikringsverdi"));
  assert.notEqual(
    normalizeTermName("Forsikringssum", { insuranceType: "båt" }),
    normalizeTermName("Forsikringsverdi", { insuranceType: "båt" }),
  );
  assert.equal(
    normalizeTermName("Forsikringssum", { insuranceType: "båt", insuredValueConfirmed: true }),
    normalizeTermName("Forsikringsverdi", { insuranceType: "båt", insuredValueConfirmed: true }),
  );
});

test("verdialias krever én forsikring på hver side og samme oppgitte verdi", () => {
  const sum = [{ name: "Forsikringssum", value: "1 000 000 kr" }];
  const value = [{ name: "Forsikringsverdi", value: "1.000.000 kr" }];
  assert.equal(hasComparableInsuredValue(sum, value, 1, 1), true);
  assert.equal(hasComparableInsuredValue(sum, value, 2, 1), false);
  assert.equal(hasComparableInsuredValue(sum, [{ ...value[0], value: "800 000 kr" }], 1, 1), false);
  assert.equal(hasComparableInsuredValue(sum, [{ name: "Egenandel", value: "1 000 000 kr" }], 1, 1), false);
});

test("ulike vilkår holdes separate", () => {
  assert.notEqual(normalizeTermName("Uhell"), normalizeTermName("Ulykke"));
  assert.notEqual(normalizeTermName("Veterinærdekning"), normalizeTermName("Ansvar for dyr"));
  assert.notEqual(normalizeTermName("Reiselengde"), normalizeTermName("Reisegods"));
});
