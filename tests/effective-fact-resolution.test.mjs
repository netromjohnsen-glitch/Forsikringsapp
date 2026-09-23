import assert from "node:assert/strict";
import test from "node:test";

import { buildExtractionRequest, parseExtractionResponse } from "../lib/analysis-output.ts";
import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { createDifferences, groupInsurances, groupTerms, groupValue, groupAddOnNames } from "../lib/comparison.ts";
import { canonicalCoverage, coverageStatusLabel } from "../lib/coverage-status.ts";
import { catalogConnectionStatus } from "../lib/product-catalog.ts";

const asOf = new Date("2026-09-23T12:00:00Z");

function agreement(company, insurance) {
  return {
    company,
    totalAnnualPremium: null,
    totalAnnualPremiumScope: "partial_or_unclear",
    insurances: [insurance],
  };
}

function policy({
  company = "Gjensidige",
  productName,
  canonicalProductName = productName,
  importantTerms = [],
  coverageSummary = null,
  addOns = [],
}) {
  const insurance = {
    type: "Bil",
    productName,
    canonicalProductName,
    annualPremium: null,
    deductible: null,
    coverageSummary,
    importantTerms: [...importantTerms, ...addOns.flatMap((addOn) => addOn.importantTerms)],
    addOns,
  };
  return enrichExtractedAgreementWithCatalog(agreement(company, insurance), asOf).insurances[0];
}

const maskinskade = (value = "Til første hovedforfall etter 10 år eller 200 000 km") => ({
  name: "Maskinskade",
  annualPremium: null,
  deductible: null,
  importantTerms: [{ name: "Varighet og kilometergrense", value }],
});

const leiebil = () => ({
  name: "Leiebil",
  annualPremium: null,
  deductible: null,
  importantTerms: [
    { name: "Ved reparasjon", value: "Leiebil i inntil 60 dager" },
    { name: "Ved totalskade eller tyveri", value: "Leiebil i inntil 30 dager" },
    { name: "Tekniske problemer i Norden", value: "Leiebil i inntil 30 dager" },
    { name: "Feriereise utenfor Norden", value: "Leiebil i inntil 15 dager" },
  ],
});

const value = (insurance, key) => insurance.importantTerms.find((term) => term.key === key)?.value;
const values = (insurance, key) => insurance.importantTerms.filter((term) => term.key === key);

function compared(first, second) {
  const groups = groupInsurances([first], [second], null);
  const firstDocument = { insuranceData: { company: "Eksisterende", totalAnnualPremium: null, insurances: [first] } };
  const secondDocument = { insuranceData: { company: "Nytt tilbud", totalAnnualPremium: null, insurances: [second] } };
  const differences = createDifferences(firstDocument, secondDocument, groups, null);
  return {
    groups,
    terms: groupTerms(groups[0], null),
    differences,
    presented: presentImportantDifferences(differences, groups, null),
  };
}

test("dokumentets maskinskadealder er den eneste effektive verdien", () => {
  const insurance = policy({ productName: "Pluss", addOns: [maskinskade()] });
  assert.deepEqual(values(insurance, "maskinskade.alder").map((term) => term.value), ["10 år"]);
  assert.equal(values(insurance, "maskinskade.alder")[0].coverageOrigin, "document");
});

test("dokumentets maskinskadekilometer vinner også når katalogverdien er lik", () => {
  const insurance = policy({ productName: "Pluss", addOns: [maskinskade()] });
  assert.deepEqual(values(insurance, "maskinskade.km").map((term) => term.value), ["200 000 km"]);
  assert.equal(values(insurance, "maskinskade.km")[0].coverageOrigin, "document");
});

test("canonical Maskinskade-sammendrag bruker 10 år og lekker ikke 12 år", () => {
  const insurance = policy({ productName: "Pluss", addOns: [maskinskade()] });
  const coverage = canonicalCoverage(insurance, "Bil", "maskinskade.dekning");
  assert.match(coverage?.summary ?? "", /10 år/u);
  assert.match(coverage?.summary ?? "", /200 000 km/u);
  assert.doesNotMatch(coverage?.summary ?? "", /12 år/u);
});

test("Kasko totalskadegaranti bruker dokumentets 15 000 km fremfor katalogens 20 000 km", () => {
  const insurance = policy({
    productName: "Kasko",
    importantTerms: [{ name: "Totalskadegaranti", value: "1 år / 15 000 km" }],
  });
  assert.equal(value(insurance, "nyverdi.alder"), "1 år");
  assert.equal(value(insurance, "nyverdi.km"), "15 000 km");
  assert.equal(insurance.importantTerms.some((term) => term.key === "nyverdi.km" && /20 000/u.test(term.value)), false);
});

test("Pluss totalskadegaranti beholder dokumentets separate 3 år og 60 000 km", () => {
  const insurance = policy({
    productName: "Pluss",
    importantTerms: [{ name: "Totalskadegaranti", value: "3 år / 60 000 km" }],
  });
  assert.equal(value(insurance, "nyverdi.alder"), "3 år");
  assert.equal(value(insurance, "nyverdi.km"), "60 000 km");
});

test("generisk totalskadeetikett får sikkert scope fra modellens canonical fact-ID", () => {
  const insurance = policy({
    productName: "Kasko",
    importantTerms: [{
      name: "Varighet og kilometergrense",
      value: "1 år / 15 000 km",
      canonicalKey: "nyverdi.grenser",
    }],
  });
  assert.equal(value(insurance, "nyverdi.alder"), "1 år");
  assert.equal(value(insurance, "nyverdi.km"), "15 000 km");
  assert.equal(insurance.importantTerms.some((term) => term.key === "maskinskade.alder" &&
    term.coverageOrigin === "document"), false);
});

test("leiebilens fire varigheter får separate canonical nøkler", () => {
  const insurance = policy({ productName: "Pluss", coverageSummary: "Leiebil er valgt", addOns: [leiebil()] });
  assert.equal(value(insurance, "leiebil.dager"), "Leiebil i inntil 60 dager");
  assert.equal(value(insurance, "leiebil.kondemnasjon"), "Leiebil i inntil 30 dager");
  assert.equal(value(insurance, "leiebil.teknisk"), "Leiebil i inntil 30 dager");
  assert.equal(value(insurance, "leiebil.feriereise"), "Leiebil i inntil 15 dager");
});

test("leiebilsammendrag bruker 30 dager ved tekniske problemer, ikke katalogens 15", () => {
  const insurance = policy({ productName: "Pluss", coverageSummary: "Leiebil er valgt", addOns: [leiebil()] });
  const summary = canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.summary ?? "";
  assert.match(summary, /tekniske problemer i Norden: Leiebil i inntil 30 dager/u);
  assert.doesNotMatch(summary, /tekniske problemer i Norden:[^;]*15 dager/u);
});

test("fullt leiebilsammendrag beholder reparasjon, totalskade, teknisk problem og feriereise", () => {
  const insurance = policy({ productName: "Pluss", coverageSummary: "Leiebil er valgt", addOns: [leiebil()] });
  const summary = canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.summary ?? "";
  for (const expected of ["60 dager", "totalskade", "tekniske problemer i Norden", "feriereise utenfor Norden", "15 dager"]) {
    assert.match(summary, new RegExp(expected, "u"), expected);
  }
});

test("Kia Kasko beholder eksplisitt ikke valgt Leiebil", () => {
  const insurance = policy({
    productName: "Kasko – Kia SPORTAGE, BS 75746",
    canonicalProductName: "Kasko",
    coverageSummary: "Leiebil er ikke valgt",
  });
  const coverage = canonicalCoverage(insurance, "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "not_selected");
  assert.equal(coverageStatusLabel(coverage.status), "❌ Ikke valgt");
});

test("Kia-displaynavn katalogmatches med separat canonical Kasko-identitet", () => {
  const insurance = policy({
    productName: "Kasko – Kia SPORTAGE, BS 75746",
    canonicalProductName: "Kasko",
  });
  assert.equal(insurance.productName, "Kasko – Kia SPORTAGE, BS 75746");
  assert.equal(insurance.catalogReference?.productId, "gj-bil-kasko");
  assert.equal(catalogConnectionStatus([insurance]), "✓ Koblet til Gjensidige Bil Kasko");
});

test("Leaf-displaynavn katalogmatches med separat canonical Pluss-identitet", () => {
  const insurance = policy({
    productName: "Pluss – Nissan LEAF, EK 74503",
    canonicalProductName: "Pluss",
  });
  assert.equal(insurance.productName, "Pluss – Nissan LEAF, EK 74503");
  assert.equal(insurance.catalogReference?.productId, "gj-bil-pluss");
  assert.equal(catalogConnectionStatus([insurance]), "✓ Koblet til Gjensidige Bil Pluss");
});

test("ukjent canonical produktidentitet fuzzy-matches ikke via et Kasko-lignende displaynavn", () => {
  const insurance = policy({
    productName: "Kasko – eksempelbil",
    canonicalProductName: "Ukjent produktnivå",
  });
  assert.equal(insurance.catalogReference, null);
});

test("eksplisitt ukjent canonical produktidentitet faller ikke tilbake til displaynavnet", () => {
  const insurance = policy({
    productName: "Kasko",
    canonicalProductName: null,
  });
  assert.equal(insurance.catalogReference, null);
});

test("katalogmatch er uavhengig av bilmodell og registreringsnummer i displaynavnet", () => {
  for (const productName of ["Kasko – bil A, AA 10000", "Kasko – bil B, BB 20000"]) {
    assert.equal(policy({ productName, canonicalProductName: "Kasko" }).catalogReference?.productId, "gj-bil-kasko");
  }
});

test("konfliktende catalogFacts beholdes som audit selv når dokumentverdien vinner", () => {
  const insurance = policy({ productName: "Pluss", addOns: [maskinskade()] });
  assert.ok(insurance.catalogFacts?.some((fact) => fact.key === "maskinskade.alder" && /12 år/u.test(fact.value)));
  assert.equal(value(insurance, "maskinskade.alder"), "10 år");
});

test("presentation får ikke den konfliktende katalogalderen som kundeverdi", () => {
  const first = policy({ productName: "Kasko" });
  const second = policy({ productName: "Pluss", addOns: [maskinskade()] });
  const result = compared(first, second);
  assert.doesNotMatch(JSON.stringify(result.presented), /12 år/u);
  assert.match(JSON.stringify(result.presented), /10 år/u);
});

test("Viktigste forskjeller bruker effektive totalskadeverdier", () => {
  const first = policy({ productName: "Kasko", importantTerms: [{ name: "Totalskadegaranti", value: "1 år / 15 000 km" }] });
  const second = policy({ productName: "Pluss", importantTerms: [{ name: "Totalskadegaranti", value: "3 år / 60 000 km" }] });
  const shown = JSON.stringify(compared(first, second).presented);
  assert.match(shown, /15 000 km/u);
  assert.match(shown, /60 000 km/u);
  assert.doesNotMatch(shown, /20 000 km/u);
});

test("detaljert sammenligning bruker effektive canonical kundeverdier", () => {
  const first = policy({ productName: "Kasko", importantTerms: [{ name: "Totalskadegaranti", value: "1 år / 15 000 km" }] });
  const second = policy({ productName: "Pluss", addOns: [maskinskade()] });
  const terms = compared(first, second).terms;
  assert.equal(terms.find((term) => term.key === "nyverdi.km")?.first, "15 000 km");
  assert.equal(terms.find((term) => term.key === "maskinskade.alder")?.second, "10 år");
});

test("katalogkilde vises fortsatt når katalogen supplerer et manglende felt", () => {
  const insurance = policy({
    productName: "Kasko",
    importantTerms: [{ name: "Totalskadegaranti – kilometer", value: "15 000 km" }],
  });
  const age = values(insurance, "nyverdi.alder")[0];
  assert.equal(age.coverageOrigin, "catalog");
  assert.equal(age.source?.documentId, "gjKasko");
});

test("samme resolution-path fungerer for Tryg uten providerspesialregel", () => {
  const insurance = policy({
    company: "Tryg",
    productName: "Kasko – Volvo XC40",
    canonicalProductName: "Kasko",
    importantTerms: [{ name: "Nyverdierstatning", value: "2 år / 30 000 km" }],
  });
  assert.equal(insurance.catalogReference?.providerId, "tryg");
  assert.equal(value(insurance, "nyverdi.alder"), "2 år");
  assert.equal(value(insurance, "nyverdi.km"), "30 000 km");
});

test("feriereiseverdien kan ikke lekke til tekniske problemer", () => {
  const insurance = policy({
    productName: "Pluss",
    coverageSummary: "Leiebil er valgt",
    addOns: [{ ...leiebil(), importantTerms: [
      { name: "Tekniske problemer i Norden", value: "Leiebil i inntil 30 dager" },
      { name: "Feriereise utenfor Norden", value: "Leiebil i inntil 15 dager" },
    ] }],
  });
  assert.equal(value(insurance, "leiebil.teknisk"), "Leiebil i inntil 30 dager");
  assert.equal(value(insurance, "leiebil.feriereise"), "Leiebil i inntil 15 dager");
});

test("maskinskadealder kolliderer ikke med parkerings- eller totalskadealder", () => {
  const insurance = policy({
    productName: "Pluss",
    importantTerms: [{ name: "Totalskadegaranti", value: "3 år / 60 000 km" }],
    addOns: [maskinskade()],
  });
  assert.equal(value(insurance, "maskinskade.alder"), "10 år");
  assert.equal(value(insurance, "nyverdi.alder"), "3 år");
  assert.match(value(insurance, "parkering.alder") ?? "", /10 år/u);
});

test("modell-schema krever separat canonical produktidentitet", () => {
  const insuranceSchema = buildExtractionRequest("dokument").text.format.schema
    .properties.insurances.items;
  assert.ok(insuranceSchema.required.includes("canonicalProductName"));
  assert.deepEqual(insuranceSchema.properties.canonicalProductName.type, ["string", "null"]);
  assert.ok(insuranceSchema.properties.importantTerms.items.required.includes("canonicalKey"));
  assert.ok(insuranceSchema.properties.importantTerms.items.properties.canonicalKey.enum.includes("nyverdi.grenser"));
});

test("Pluss totalskadegrense splittes også når uttrekket plasserer paret på aldersnøkkelen", () => {
  const insurance = policy({ productName: "Pluss", importantTerms: [{
    name: "Totalskadegaranti – alder", canonicalKey: "nyverdi.alder", value: "3 år / 60 000 km",
  }] });
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["3 år"]);
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["60 000 km"]);
  assert.ok(insurance.catalogFacts.some((fact) => fact.key === "nyverdi.km" && /20 000/u.test(fact.value)));
  assert.equal(values(insurance, "nyverdi.km")[0].coverageOrigin, "document");
});

test("sammensatt totalskadealias normaliseres uten fuzzy matching", () => {
  for (const kilometer of ["60000", "60\u00a0000", "60\u202f000"]) {
    const insurance = policy({ productName: "Pluss", importantTerms: [{
      name: "Totalskadegaranti – alder og kilometer", value: `3 år / ${kilometer} km`,
    }] });
    assert.equal(value(insurance, "nyverdi.alder"), "3 år");
    assert.equal(value(insurance, "nyverdi.km"), `${kilometer} km`);
  }
});

test("generisk aldersgrense tolkes ikke som totalskadegaranti", () => {
  const insurance = policy({ productName: "Pluss", importantTerms: [{ name: "Alder", value: "3 år / 60 000 km" }] });
  assert.equal(values(insurance, "nyverdi.alder").some((term) => term.coverageOrigin === "document"), false);
});

test("varierende dokumentgrenser hardkodes ikke til pilotens 3 år og 60 000 km", () => {
  const insurance = policy({ company: "Tryg", productName: "Kasko", importantTerms: [{
    name: "Nyverdierstatning", canonicalKey: "nyverdi.km", value: "4 år / 80000 km",
  }] });
  assert.deepEqual(values(insurance, "nyverdi.km").map((term) => term.value), ["80000 km"]);
  assert.equal(value(insurance, "nyverdi.alder"), "4 år");
});

function pricedPolicy(company, productName, excluding, tax, total) {
  const terms = [
    { name: "Premie etter rabatter uten trafikkforsikringsavgift", value: excluding },
    { name: "Trafikkforsikringsavgift", value: tax },
    ...(total ? [{ name: "Total premie inklusive trafikkforsikringsavgift", value: total }] : []),
  ];
  return enrichExtractedAgreementWithCatalog({
    company, totalAnnualPremium: total, totalAnnualPremiumScope: "entire_agreement",
    insurances: [{
      type: "Bil", productName, annualPremium: excluding, deductible: null,
      coverageSummary: null, importantTerms: terms, addOns: [],
    }],
  }, asOf);
}

for (const [product, excluding, tax, total] of [
  ["Pluss", "9 518 kr", "3 270 kr", "12 788 kr"],
  ["Kasko", "12 457 kr", "2 329 kr", "14 786 kr"],
]) {
  test(product + " beholder tre separate dokumenterte premiefakta og konsistent objekttotal", () => {
    const data = pricedPolicy("Gjensidige", product, excluding, tax, total);
    const insurance = data.insurances[0];
    assert.equal(value(insurance, "premie.total"), total);
    assert.equal(value(insurance, "premie.ekskl_tfa"), excluding);
    assert.equal(value(insurance, "premie.tfa"), tax);
    assert.equal(insurance.annualPremium, data.totalAnnualPremium);
    assert.equal(groupValue([insurance], "annualPremium"), total + " inkl. trafikkforsikringsavgift");
    const terms = compared(insurance, insurance).terms;
    assert.equal(terms.find((term) => term.key === "premie.ekskl_tfa").first, excluding);
    assert.equal(terms.find((term) => term.key === "premie.tfa").first, tax);
  });
}

test("Tryg-premie bruker samme generelle TFA-normalisering", () => {
  const insurance = pricedPolicy("Tryg", "Kasko", "8 000 kr", "2 000 kr", "10 000 kr").insurances[0];
  assert.equal(insurance.catalogReference.providerId, "tryg");
  assert.equal(groupValue([insurance], "annualPremium"), "10 000 kr inkl. trafikkforsikringsavgift");
});

test("manglende total beregnes ikke fra ekskl-premie og avgift", () => {
  const insurance = pricedPolicy("Gjensidige", "Kasko", "8 000 kr", "2 000 kr", null).insurances[0];
  assert.equal(value(insurance, "premie.total"), undefined);
  assert.equal(groupValue([insurance], "annualPremium"), "8 000 kr ekskl. trafikkforsikringsavgift");
});

test("avtaletotal overføres ikke til hvert kjøretøy", () => {
  const raw = pricedPolicy("Ukjent", "Ukjent", "8 000 kr", "2 000 kr", null);
  raw.totalAnnualPremium = "99 000 kr";
  assert.equal(enrichExtractedAgreementWithCatalog(raw, asOf).insurances[0].annualPremium, "8 000 kr");
});

test("valgt dekningsstatus uten dokumentert add-on blir ikke automatisk et tillegg", () => {
  const insurance = policy({ productName: "Pluss", coverageSummary: "Leiebil er valgt. Maskinskade er valgt." });
  assert.equal(groupAddOnNames([insurance], "Bil"), null);
});

test("ikke valgt leiebil listes aldri som valgt tillegg", () => {
  const insurance = policy({ productName: "Kasko", coverageSummary: "Leiebil er ikke valgt" });
  assert.doesNotMatch(groupAddOnNames([insurance], "Bil") ?? "", /Leiebil/u);
});

test("standarddekninger og katalog alene skaper ikke dokumenterte tillegg", () => {
  const insurance = policy({ productName: "Pluss", importantTerms: [
    { name: "Ansvar", value: "Valgt" }, { name: "Glass", value: "Valgt" }, { name: "Brann", value: "Valgt" },
  ] });
  assert.equal(groupAddOnNames([insurance], "Bil"), null);
});

test("Tryg dokumentert Leiebil-tillegg vises gjennom samme tilleggsoversikt", () => {
  const insurance = policy({ company: "Tryg", productName: "Kasko", coverageSummary: "Leiebil er valgt", addOns: [leiebil()] });
  assert.equal(groupAddOnNames([insurance], "Bil"), "Leiebil");
});

test("bilnøkkel og førstegangsregistrering beholdes under korrekthetsoppryddingen", () => {
  for (const [productName, year, amount] of [["Kasko", "2013", "7 500 kr"], ["Pluss", "2014", "15 000 kr"]]) {
    const insurance = policy({ productName, coverageSummary: "Førstegangsregistrert: " + year,
      importantTerms: [{ name: "Bilnøkkel", value: amount }] });
    assert.equal(value(insurance, "bilnokkel.grense"), amount);
    assert.equal(value(insurance, "kjoretoy.forstegangsregistrering"), year);
  }
});

test("JSON-uttrekk med canonical premium keys går gjennom validering, enrichment og presentasjon", () => {
  const raw = {
    company: "Gjensidige", totalAnnualPremium: "12 788 kr", totalAnnualPremiumScope: "entire_agreement",
    insurances: [{
      type: "Motorvognforsikring", productName: "Pluss", canonicalProductName: "Pluss",
      annualPremium: "9 518 kr", deductible: null, coverageSummary: null, addOns: [],
      importantTerms: [
        { name: "Total", canonicalKey: "premie.total", value: "12 788 kr" },
        { name: "Premie", canonicalKey: "premie.ekskl_tfa", value: "9 518 kr" },
        { name: "Avgift", canonicalKey: "premie.tfa", value: "3 270 kr" },
        { name: "Nybil", canonicalKey: "nyverdi.alder", value: "3 år / 60000 km, det som inntreffer først" },
      ],
    }],
  };
  const data = enrichExtractedAgreementWithCatalog(parseExtractionResponse({
    status: "completed", output_text: JSON.stringify(raw),
  }), asOf);
  const insurance = data.insurances[0];
  assert.equal(insurance.type, "Bil");
  assert.equal(groupValue([insurance], "annualPremium"), "12 788 kr inkl. trafikkforsikringsavgift");
  assert.equal(value(insurance, "nyverdi.grenser"), "3 år / 60000 km, det som inntreffer først");
  assert.equal(value(insurance, "nyverdi.alder"), "3 år");
  assert.equal(value(insurance, "nyverdi.km"), "60000 km");
  for (const key of ["premie.total", "premie.ekskl_tfa", "premie.tfa"]) {
    assert.equal(values(insurance, key)[0].coverageOrigin, "document");
  }
});

test("motstridende eksplisitte premietotaler velges ikke vilkårlig", () => {
  const raw = agreement("Gjensidige", {
    type: "Bil", productName: "Kasko", annualPremium: null, deductible: null,
    coverageSummary: null, addOns: [], importantTerms: [
      { name: "Total", canonicalKey: "premie.total", value: "10 000 kr" },
      { name: "Total", canonicalKey: "premie.total", value: "12 000 kr" },
    ],
  });
  const insurance = enrichExtractedAgreementWithCatalog(raw, asOf).insurances[0];
  assert.equal(insurance.annualPremium, null);
  assert.equal(values(insurance, "premie.total").length, 2);
});

test("tilleggsoversikten dupliserer ikke addOns og effektive statuser", () => {
  const insurance = policy({ productName: "Pluss",
    coverageSummary: "Leiebil er valgt. Maskinskade er valgt.", addOns: [leiebil(), maskinskade()],
  });
  assert.equal(groupAddOnNames([insurance], "Bil"), "Leiebil · Maskinskade");
});

test("separat totalskadealder beholder hele dokumentformuleringen uten konkurrerende kortverdi", () => {
  const insurance = policy({ productName: "Pluss", importantTerms: [{
    name: "Totalskadegaranti – alder", canonicalKey: "nyverdi.alder",
    value: "Til første hovedforfall etter 3 år",
  }] });
  assert.deepEqual(values(insurance, "nyverdi.alder").map((term) => term.value), ["Til første hovedforfall etter 3 år"]);
});
