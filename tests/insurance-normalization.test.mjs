import assert from "node:assert/strict";
import test from "node:test";
import { groupInsurances, groupTerms } from "../lib/comparison.ts";
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

const comparedBilTerms = (firstTerms, secondTerms, matchingPlan = null) => {
  const policy = (terms) => ({
    type: "Bil", productName: "Kasko", annualPremium: null, deductible: null,
    coverageSummary: null, importantTerms: terms,
  });
  const group = groupInsurances([policy(firstTerms)], [policy(secondTerms)], null)[0];
  return groupTerms(group, matchingPlan);
};

test("Leiebil dokumenteres av eksplisitte underfelter uten at detaljene fjernes", () => {
  const terms = comparedBilTerms(
    [{ name: "Leiebil", value: "Inntil 45 dager" }],
    [
      { name: "Leiebil", value: "Ikke dokumentert" },
      { name: "Ved reparasjon", value: "Leiebil av inntil samme størrelse som forsikret bil i inntil 60 dager" },
      { name: "Ved kondemnasjon eller tyveri", value: "Leiebil dekkes i inntil 30 dager" },
      { name: "Feriereise utenfor Norden", value: "Leiebil dekkes i inntil 15 dager" },
    ],
  );
  const parent = terms.find((term) => term.key === "leiebil.dekning");
  assert.equal(parent?.secondCoverage?.status, "selected");
  assert.match(parent.secondCoverage.summary, /60 dager/);
  assert.match(parent.secondCoverage.summary, /30 dager/);
  assert.match(parent.secondCoverage.summary, /15 dager/);
  assert.ok(terms.find((term) => term.key === "leiebil.dager")?.second);
  assert.ok(terms.find((term) => term.key === "leiebil.kondemnasjon")?.second);
  assert.ok(terms.find((term) => term.key === "leiebil.feriereise")?.second);
});

test("Maskinskade dokumenteres av varighet, komponenter og egenandelsdetaljer", () => {
  const terms = comparedBilTerms(
    [{ name: "Maskinskade", value: "Inkludert" }],
    [
      { name: "Maskinskade", value: "Ikke dokumentert / kan ikke avgjøres" },
      { name: "Varighet", value: "10 år / 200 000 km" },
      { name: "Omfattede deler", value: "Motor, gir og drivverk" },
      { name: "Elbilkomponenter", value: "Høyvoltbatteri og fabrikkmontert lader" },
      { name: "Egenandel etter kilometerstand", value: "10 000–20 000 kr" },
    ],
  );
  const parent = terms.find((term) => term.key === "maskinskade.dekning");
  assert.equal(parent?.secondCoverage?.status, "selected");
  assert.match(parent.secondCoverage.summary, /10 år \/ 200 000 km/);
  assert.match(parent.secondCoverage.summary, /Motor, gir og drivverk/);
  assert.match(parent.secondCoverage.summary, /Høyvoltbatteri/);
  assert.match(parent.secondCoverage.summary, /10 000–20 000 kr/);
  for (const key of ["maskinskade.varighet", "maskinskade.komponenter", "maskinskade.el",
    "maskinskade.egenandel.kilometer"]) {
    assert.ok(terms.find((term) => term.key === key)?.second, key);
  }
});

test("manglende hovedfelt forblir uavklart når ingen relaterte underfelter dokumenterer dekningen", () => {
  const terms = comparedBilTerms(
    [{ name: "Leiebil", value: "Inntil 45 dager" }],
    [{ name: "Leiebil", value: "Ikke dokumentert" }],
  );
  const parent = terms.find((term) => term.key === "leiebil.dekning");
  assert.equal(parent?.second, null);
  assert.equal(parent?.secondCoverage?.status, "unknown");
  assert.equal(parent?.secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
});

test("generisk reparasjonstekst uten leiebilbevis kobles ikke til leiebildekningen", () => {
  const terms = comparedBilTerms(
    [{ name: "Leiebil", value: "Inntil 45 dager" }],
    [
      { name: "Leiebil", value: "Ikke dokumentert" },
      { name: "Ved reparasjon", value: "Glass repareres uten egenandel" },
    ],
  );
  const parent = terms.find((term) => term.key === "leiebil.dekning");
  assert.equal(parent?.second, null);
  assert.equal(parent?.secondCoverage?.status, "unknown");
  assert.ok(terms.find((term) => term.key === "ved reparasjon")?.second);
});

test("semantisk hovedmatch kollapser ikke eksplisitte detaljrader", () => {
  const matchingPlan = {
    insuranceMatches: [], assessments: [],
    termMatches: [{
      leftTypeKey: "bil", rightTypeKey: "bil", leftKey: "maskinskade.dekning",
      rightKeys: ["maskinskade.alder", "maskinskade.km"], confidence: 0.99, reason: "Samme dekningsfamilie",
    }],
  };
  const terms = comparedBilTerms(
    [{ name: "Maskinskade", value: "Inkludert" }],
    [
      { key: "maskinskade.alder", name: "Maskinskade – alder", value: "10 år" },
      { key: "maskinskade.km", name: "Maskinskade – kilometer", value: "200 000 km" },
    ],
    matchingPlan,
  );
  assert.equal(terms.find((term) => term.key === "maskinskade.dekning")?.secondCoverage?.status, "selected");
  assert.ok(terms.find((term) => term.key === "maskinskade.alder")?.second);
  assert.ok(terms.find((term) => term.key === "maskinskade.km")?.second);
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
