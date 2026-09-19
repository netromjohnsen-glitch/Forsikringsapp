import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogFacts } from "../lib/product-catalog.ts";

const fact = (items, key) => items.find((item) => item.key === key);
const level = (name) => productCatalog.products.find((item) =>
  item.company === "Fremtind" && item.insuranceType === "Bil" && item.name === name);
const request = (distributionChannel, productName = "Topp", addOnIds = []) => ({
  company: "Fremtind", distributionChannel, totalAnnualPremium: "", products: [{
    type: "Bil", productName, annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: null, addOnIds,
  }],
});

test("normal katalog viser én kanonisk Fremtind-identitet og fire hovednivåer", () => {
  assert.ok(productCatalog.companies.includes("Fremtind"));
  assert.equal(productCatalog.companies.includes("SpareBank 1 / Fremtind"), false);
  assert.equal(productCatalog.companies.includes("DNB / Fremtind"), false);
  assert.equal(productCatalog.companies.includes("Eika / Fremtind"), false);
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Topp"]);
});

test("Topp bruker effektiv 3 år / 100 000 km og beholder Kasko-base på samme side", () => {
  const agreement = normalizeManualAgreement(request("DNB"));
  const terms = agreement.insuranceData.insurances[0].importantTerms;
  assert.match(fact(terms, "nyverdi.alder").value, /3 år/);
  assert.match(fact(terms, "nyverdi.km").value, /100 000 km/);
  assert.match(fact(terms, "nyverdi.alder").overriddenBase[0].value, /1 år/);
  assert.match(fact(terms, "nyverdi.km").overriddenBase[0].value, /15 000 km/);
  assert.equal(agreement.insuranceData.distributionChannel, "DNB");
});

test("distribusjonskanal isolerer dokumenterte SpareBank 1-tillegg", () => {
  const top = level("Topp");
  assert.deepEqual(availableAddOns(top, new Date("2026-09-19"), "SpareBank 1").map((item) => item.id),
    ["fremtind-sb1-leiebil", "fremtind-sb1-maskinskade"]);
  for (const channel of [null, "DNB", "Eika"]) {
    assert.deepEqual(availableAddOns(top, new Date("2026-09-19"), channel).map((item) => item.id),
      ["fremtind-leiebil", "fremtind-maskinskade"]);
    const selected = resolveCatalogFacts(top, ["fremtind-leiebil", "fremtind-maskinskade"], new Date("2026-09-19"), channel);
    assert.equal(fact(selected, "leiebil.dager"), undefined);
    assert.equal(fact(selected, "maskinskade.km"), undefined);
  }
  const sb1 = normalizeManualAgreement(request("SpareBank 1", "Topp",
    ["fremtind-sb1-leiebil", "fremtind-sb1-maskinskade"]));
  const terms = sb1.insuranceData.insurances[0].importantTerms;
  assert.match(fact(terms, "leiebil.dager").value, /45 dager/);
  assert.match(fact(terms, "maskinskade.alder").value, /10 år/);
  assert.match(fact(terms, "maskinskade.km").value, /200 000 km/);
  assert.equal(fact(terms, "leiebil.dager").source.documentId, "sp1Leiebil");
});

test("UI-formet Fremtind-request beholder kanal og tillegg gjennom presentasjonen", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify(request("SpareBank 1", "Topp", ["fremtind-sb1-leiebil"])));
  form.set("offerManual", JSON.stringify(request("DNB", "Topp", ["fremtind-leiebil"])));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  assert.deepEqual(left.insuranceData.insurances[0].addOnIds, ["fremtind-sb1-leiebil"]);
  assert.deepEqual(right.insuranceData.insurances[0].addOnIds, ["fremtind-leiebil"]);
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  assert.match(fact(terms, "leiebil.dager").first, /45 dager/);
  assert.equal(fact(terms, "leiebil.dager").second, null);
  const raw = createDifferences(left, right, groups, null);
  assert.ok(raw.some((item) => item.kind === "add_on" && item.title === "Leiebil"));
  assert.doesNotThrow(() => presentImportantDifferences(raw, groups, null, "Fremtind", "Fremtind"));
});

test("katalogreferanse fra en annen Fremtind-distribusjon kan ikke lekke inn", () => {
  const input = request("DNB");
  input.products[0].catalogReference = {
    providerId: "sparebank1-fremtind", productId: "sb1-bil-toppkasko", version: "PMO-357.001-004",
  };
  assert.throws(() => normalizeManualAgreement(input), /stemmer ikke med selskap/);
});
