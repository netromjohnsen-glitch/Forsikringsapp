import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog } from "../lib/product-catalog.ts";

const kasko = productCatalog.products.find((product) => product.name === "Kasko");
function agreement(addOnIds, deductible = "", withReference = true) {
  return normalizeManualAgreement({
    company: "Tryg", totalAnnualPremium: "",
    products: [{
      type: "Bil", productName: "Kasko", annualPremium: "", deductible,
      coverageSummary: "", importantTerms: [], addOnIds,
      catalogReference: withReference
        ? { providerId: kasko.providerId, productId: kasko.productId, version: kasko.version }
        : null,
    }],
  });
}

function compare(left, right) {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  return { groups, terms: groupTerms(groups[0], null), differences: createDifferences(left, right, groups, null) };
}

test("Kasko og Bil Ekstra er identiske på begge sider selv når bare én side har flere tillegg", () => {
  const left = agreement(["bil-ekstra", "maskinskade", "forer-passasjerulykke"]);
  // Simuler tapt katalogreferanse fra skjemaet. Eksakt valg løses på serveren.
  const right = agreement(["bil-ekstra"], "", false);
  assert.equal(right.insuranceData.insurances[0].catalogReference.productId, "bil-kasko");
  const result = compare(left, right);
  for (const key of ["kasko.dekning", "kasko.egenandel", "kasko.egenandel.ung", "kasko.unntak",
    "kasko.dyr", "kasko.var", "bonus.kasko", "leiebil.dager"]) {
    const term = result.terms.find((entry) => entry.key === key);
    assert.ok(term?.first && term?.second, key);
    assert.equal(term.first, term.second, key);
    assert.ok(term.firstSources.length > 0 && term.secondSources.length > 0, key);
    assert.ok(!result.differences.some((difference) => difference.title === term.label), key);
  }
  assert.deepEqual(result.differences.filter((difference) => difference.kind === "add_on")
    .map((difference) => difference.title), ["Maskinskade", "Fører- og Passasjerulykke"]);
  const accessory = left.insuranceData.insurances[0].importantTerms.find((term) => term.key === "tilbehor.grense");
  assert.deepEqual(accessory.sources.map((source) => source.termsNumber), ["PAU27002"]);
  assert.deepEqual(accessory.overriddenBase.map((base) => base.source.termsNumber), ["PAU25205"]);
  assert.ok(left.insuranceData.insurances[0].catalogFacts.some((fact) =>
    fact.key === "tilbehor.grense" && fact.source.termsNumber === "PAU25205"));
  const youngDriver = left.insuranceData.insurances[0].importantTerms.find((term) => term.key === "kasko.egenandel.ung");
  assert.match(youngDriver.value, /5 000 kr.*hovedeier.*ektefelle.*samboer.*2 000 km.*Tryg vei til lappen/s);
  assert.equal(youngDriver.source.page, 1);
  assert.equal(result.differences.some((difference) => difference.kind === "price"), false);
  assert.equal(result.differences.some((difference) => difference.title === "Bonus ved tilleggsskade"), false);
});

test("kundespesifikk egenandel vises når begge sider har ulik verdi", () => {
  const result = compare(
    agreement(["bil-ekstra"], "5 000 kr"),
    agreement(["bil-ekstra"], "3 000 kr"),
  );
  assert.equal(result.differences.filter((difference) => difference.kind === "deductible").length, 1);
  assert.match(result.differences.find((difference) => difference.kind === "deductible").text, /2\s000 kr/);
});

test("ikke valgt tillegg skilles fra ikke dokumentert dekning", () => {
  const result = compare(
    agreement(["bil-ekstra", "maskinskade"]),
    agreement(["bil-ekstra"]),
  );
  const maskin = result.terms.find((term) => term.key === "maskinskade.km");
  assert.equal(maskin.secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres (tillegget er ikke valgt)");
  assert.equal(maskin.firstSources[0].termsNumber, "PAU27110");

  const pdf = {
    insuranceData: {
      company: "Annet selskap", totalAnnualPremium: null,
      insurances: [{
        type: "Bil", productName: "Ukjent", annualPremium: null, deductible: null,
        coverageSummary: null, importantTerms: [{ name: "Ukjent tilleggsdekning", value: "Oppgitt" }],
      }],
    },
  };
  const mixed = compare(agreement(["bil-ekstra"]), pdf);
  const unknown = mixed.terms.find((term) => term.label === "Ukjent tilleggsdekning");
  assert.equal(unknown.firstMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.ok(!mixed.differences.some((difference) => difference.title === unknown.label));
});

test("hovedvisningen prioriterer effektiv dekning for Kasko med flere tillegg mot Delkasko", () => {
  const existing = agreement(["bil-ekstra", "maskinskade", "forer-passasjerulykke"], "6 000 kr");
  const offer = normalizeManualAgreement({
    company: "Tryg", totalAnnualPremium: "",
    products: [{ type: "Bil", productName: "Delkasko", annualPremium: "8 000 kr", deductible: "4 000 kr",
      coverageSummary: "", importantTerms: [], addOnIds: ["forer-passasjerulykke"] }],
  });
  const result = compare(existing, offer);
  const highlights = result.differences.filter((difference) => difference.insuranceKey && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  const kaskoCoverage = highlights.find((difference) => difference.title === "Kaskoskade");
  assert.match(kaskoCoverage?.text ?? "", /Sammenstøt, utforkjøring, velt/);
  assert.match(kaskoCoverage.text, /ikke funnet i vilkårene/);
  const accessory = highlights.find((difference) => difference.title === "Fastmontert tilbehør og ekstra hjul");
  assert.match(accessory?.text ?? "", /50 000 kr/);
  assert.match(accessory.text, /10 000 kr/);
  const bilEkstra = highlights.find((difference) => difference.title === "Bil Ekstra");
  assert.match(bilEkstra?.text ?? "", /3 år/);
  assert.match(bilEkstra.text, /60 000 km/);
  const machine = highlights.find((difference) => difference.title === "Maskinskade");
  assert.match(machine?.text ?? "", /10 år/);
  assert.match(machine.text, /200 000 km/);
  const deductible = highlights.find((difference) => difference.title === "Egenandel");
  assert.match(deductible?.text ?? "", /6 000 kr/);
  assert.match(deductible.text, /4 000 kr/);
  assert.match(deductible.text, /2\s000 kr lavere/);
  assert.ok(!highlights.some((difference) => /Fører- og Passasjerulykke/.test(difference.title)));
  assert.ok(!highlights.some((difference) => difference.title === "Brann"));
  const accessoryDetail = result.terms.find((term) => term.key === "tilbehor.grense");
  assert.deepEqual(accessoryDetail.firstSources.map((source) => source.termsNumber), ["PAU27002"]);
  assert.deepEqual(accessoryDetail.firstBaseFacts.map((base) => base.source.termsNumber), ["PAU25205"]);
  assert.equal(accessoryDetail.secondSources[0].termsNumber, "PAU25835");
  assert.ok(result.terms.find((term) => term.key === "ulykke.invaliditet")?.firstSources.length);
  assert.ok(result.terms.find((term) => term.key === "ulykke.invaliditet")?.secondSources.length);
});

test("tilleggets effektive totalskadegrenser sammenlignes med motpartens grunnprodukt", () => {
  const result = compare(agreement(["bil-ekstra"]), agreement([]));
  const age = result.differences.find((difference) => difference.title === "Totalskadegaranti – alder");
  const distance = result.differences.find((difference) => difference.title === "Totalskadegaranti – kilometer");
  assert.match(age?.text ?? "", /3 år/);
  assert.match(age.text, /1 år/);
  assert.match(distance?.text ?? "", /60 000 km/);
  assert.match(distance.text, /15 000 km/);
  assert.equal(result.terms.find((term) => term.key === "nyverdi.alder")?.firstSources[0].termsNumber, "PAU27002");
  assert.equal(result.terms.find((term) => term.key === "nyverdi.alder")?.secondSources[0].termsNumber, "PAU25205");
});

test("grunnverdi og utvidelse forblir på samme side når motparten mangler datapunktet", () => {
  const existing = agreement(["bil-ekstra", "maskinskade", "forer-passasjerulykke"]);
  const offer = normalizeManualAgreement({
    company: "Tryg", totalAnnualPremium: "",
    products: [{ type: "Bil", productName: "Delkasko", annualPremium: "", deductible: "",
      coverageSummary: "", importantTerms: [], addOnIds: ["forer-passasjerulykke"] }],
  });
  const result = compare(existing, offer);
  for (const [key, effective, baseValue] of [
    ["nyverdi.alder", "Innen 3 år", "Innen 1 år"],
    ["nyverdi.km", "60 000 km", "15 000 km"],
  ]) {
    const term = result.terms.find((entry) => entry.key === key);
    assert.match(term.first, new RegExp(effective));
    assert.equal(term.second, null);
    assert.match(term.firstBaseFacts[0].value, new RegExp(baseValue));
    assert.deepEqual(term.secondBaseFacts, []);
    assert.equal(term.firstSources[0].termsNumber, "PAU27002");
    assert.equal(term.firstBaseFacts[0].source.termsNumber, "PAU25205");
    assert.equal(term.secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres (tillegget er ikke valgt)");
  }
  const mainText = result.differences.map((difference) => difference.text).join(" ");
  assert.match(mainText, /3 år/);
  assert.match(mainText, /60 000 km/);
  assert.match(mainText, /Tilsvarende verdi er ikke dokumentert/);
  assert.doesNotMatch(mainText, /1 år|15 000 km/);
});

test("grunnverdier kan ikke bli motpartens effektive verdier for andre selskaper", () => {
  const source = (documentId) => ({ documentId, filename: `${documentId}.pdf`, termsNumber: documentId,
    effectiveFrom: "2026-01-01", page: 1, section: "1" });
  const insurance = (value, overriddenBase = []) => ({
    type: "Båt", productName: "Variant", annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: value ? [{ name: "Erstatningsgrense", key: "dekning.grense", value,
      sources: [source(value)], overriddenBase }] : [],
  });
  const left = { insuranceData: { company: "Selskap A", totalAnnualPremium: null,
    insurances: [insurance("300 000 kr", [{ value: "100 000 kr", source: source("base-a") }])] } };
  const rightMissing = { insuranceData: { company: "Selskap B", totalAnnualPremium: null,
    insurances: [insurance(null)] } };
  const missing = compare(left, rightMissing);
  const term = missing.terms.find((entry) => entry.key === "dekning.grense");
  assert.equal(term.first, "300 000 kr");
  assert.equal(term.second, null);
  assert.equal(term.firstBaseFacts[0].value, "100 000 kr");
  assert.deepEqual(term.secondBaseFacts, []);
  assert.equal(term.secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.ok(!missing.differences.some((difference) => difference.title === "Erstatningsgrense"));

  const rightDocumented = { insuranceData: { company: "Selskap B", totalAnnualPremium: null,
    insurances: [insurance("200 000 kr", [{ value: "150 000 kr", source: source("base-b") }])] } };
  const documented = compare(left, rightDocumented);
  assert.match(documented.differences.find((difference) => difference.title === "Erstatningsgrense")?.text ?? "", /300 000 kr.*200 000 kr/);
  const documentedTerm = documented.terms.find((entry) => entry.key === "dekning.grense");
  assert.equal(documentedTerm.firstBaseFacts[0].value, "100 000 kr");
  assert.equal(documentedTerm.secondBaseFacts[0].value, "150 000 kr");
});
