import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { DNB_FREMTIND_URLS } from "../lib/dnb-fremtind-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogFacts,
  resolveProductComponentIds } from "../lib/product-catalog.ts";
import { SPAREBANK1_FREMTIND_URLS } from "../lib/sparebank1-fremtind-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/sparebank1-fremtind");
const dnbCompany = "DNB / Fremtind";
const sb1Company = "SpareBank 1 / Fremtind";
const level = (company, name) => productCatalog.products.find((product) => product.company === company && product.name === name);
const fact = (items, key) => items.find((item) => item.key === key);
const manual = (company, productName, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};

test("DNBs fem hoveddokumenter er de samme kanoniske Fremtind-filene som SpareBank 1", async () => {
  assert.deepEqual(DNB_FREMTIND_URLS, {
    ansvar: SPAREBANK1_FREMTIND_URLS.ansvar,
    delkasko: SPAREBANK1_FREMTIND_URLS.delkasko,
    kasko: SPAREBANK1_FREMTIND_URLS.kasko,
    topp: SPAREBANK1_FREMTIND_URLS.toppkasko,
    ipid: SPAREBANK1_FREMTIND_URLS.ipid,
  });
  const expected = {
    "Vilkar_ansvar_bil.pdf": "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568",
    "Vilkar_Minikasko_Bil.pdf": "8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818",
    "Vilkar_Kasko_Bil.pdf": "87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739",
    "Vilkar_Toppkasko_Bil.pdf": "cc9af96bd2f91dffe76dced3d58481007d3036ba452e695f4f2b4a9489e01781",
    "IPID_Bil.pdf": "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94",
  };
  for (const [filename, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  }
});

test("DNB er egen distribusjon med samme dokumenterte hovednivåer og effektiv dekning", () => {
  assert.deepEqual(productSuggestions(productCatalog, dnbCompany, "Bil"), ["Ansvar", "Delkasko", "Kasko", "Topp"]);
  const dnb = level(dnbCompany, "Topp");
  const sb1 = level(sb1Company, "Toppkasko");
  assert.notEqual(dnb.providerId, sb1.providerId);
  assert.deepEqual(resolveProductComponentIds(dnb), resolveProductComponentIds(sb1));
  assert.deepEqual(resolveCatalogFacts(dnb, []), resolveCatalogFacts(sb1, []));
  assert.equal(fact(resolveCatalogFacts(dnb, []), "nyverdi.alder").source.company, "Fremtind");
});

test("DNB-tillegg er valgbare på Kasko og Topp uten lekkasje av SpareBank 1-detaljer", () => {
  assert.deepEqual(availableAddOns(level(dnbCompany, "Ansvar")), []);
  assert.deepEqual(availableAddOns(level(dnbCompany, "Delkasko")), []);
  for (const name of ["Kasko", "Topp"]) {
    const product = level(dnbCompany, name);
    assert.deepEqual(availableAddOns(product).map((item) => item.id), ["dnb-leiebil", "dnb-maskinskade"]);
    const selected = resolveCatalogFacts(product, ["dnb-leiebil", "dnb-maskinskade"]);
    assert.equal(fact(selected, "leiebil.dager"), undefined);
    assert.equal(fact(selected, "maskinskade.alder"), undefined);
    assert.equal(fact(selected, "maskinskade.km"), undefined);
  }
});

test("DNB og SpareBank 1 gir ingen forskjeller for samme hovednivå uten tillegg", () => {
  const dnb = manual(dnbCompany, "Topp");
  const sb1 = manual(sb1Company, "Toppkasko");
  const dnbTerms = dnb.insuranceData.insurances[0].importantTerms;
  const sb1Terms = sb1.insuranceData.insurances[0].importantTerms;
  for (const terms of [dnbTerms, sb1Terms]) {
    assert.match(fact(terms, "nyverdi.alder").value, /3 år/);
    assert.match(fact(terms, "nyverdi.km").value, /100 000 km/);
    assert.match(fact(terms, "nyverdi.alder").overriddenBase[0].value, /1 år/);
    assert.match(fact(terms, "nyverdi.km").overriddenBase[0].value, /15 000 km/);
    assert.ok(fact(terms, "parkering.dekning"));
  }
  const result = compare(sb1, dnb);
  assert.equal(result.raw.filter((item) => item.kind === "term").length, 0);
  assert.equal(result.shown.some((item) => ["Totalskadegaranti", "Parkeringsskade"].includes(item.title)), false);
});

test("UI-runtime med tillegg beholder identisk hoveddekning og bare dokumenterte tilleggsavvik", () => {
  const formData = new FormData();
  formData.set("existingMode", "manual");
  formData.set("offerMode", "manual");
  formData.set("existingManual", JSON.stringify({ company: sb1Company, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Toppkasko", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "sparebank1-fremtind", productId: "sb1-bil-toppkasko", version: "PMO-357.001-004" },
    addOnIds: ["sb1-leiebil", "sb1-maskinskade"],
  }] }));
  formData.set("offerManual", JSON.stringify({ company: dnbCompany, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "dnb-fremtind", productId: "dnb-bil-topp", version: "PMO-357.001-004" },
    addOnIds: ["dnb-leiebil", "dnb-maskinskade"],
  }] }));

  const sb1 = normalizeManualAgreement(JSON.parse(formData.get("existingManual")));
  const dnb = normalizeManualAgreement(JSON.parse(formData.get("offerManual")));
  assert.deepEqual(sb1.insuranceData.insurances[0].addOnIds, ["sb1-leiebil", "sb1-maskinskade"]);
  assert.deepEqual(dnb.insuranceData.insurances[0].addOnIds, ["dnb-leiebil", "dnb-maskinskade"]);
  const result = compare(sb1, dnb);
  for (const key of ["nyverdi.alder", "nyverdi.km", "parkering.dekning"]) {
    const term = fact(result.terms, key);
    assert.equal(term.first, term.second, key);
    assert.equal(result.raw.some((item) => item.termKey === key), false, key);
  }
  assert.ok(fact(result.terms, "leiebil.dager").first);
  assert.equal(fact(result.terms, "leiebil.dager").second, null);
  assert.ok(fact(result.terms, "maskinskade.km").first);
  assert.equal(fact(result.terms, "maskinskade.km").second, null);
  assert.ok(result.raw.every((item) => !item.termKey || !["nyverdi.alder", "nyverdi.km", "parkering.dekning"].includes(item.termKey)));
});

test("DNB Topp kan sammenlignes kildeisolert mot Tryg", () => {
  const result = compare(manual(dnbCompany, "Topp"), manual("Tryg", "Kasko", ["bil-ekstra"]));
  assert.match(fact(result.terms, "nyverdi.km").first, /100 000 km/);
  assert.match(fact(result.terms, "nyverdi.km").second, /60 000 km/);
  assert.equal(fact(result.terms, "nyverdi.km").firstSources[0].company, "Fremtind");
  assert.equal(fact(result.terms, "nyverdi.km").secondSources[0].company, "Tryg");
  assert.ok(result.shown.some((item) => item.title === "Totalskadegaranti"));
});

test("UI-formet DNB-request beholder distribusjonsidentitet og valgte tillegg", () => {
  const agreement = normalizeManualAgreement({ company: dnbCompany, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "dnb-fremtind", productId: "dnb-bil-topp", version: "PMO-357.001-004" },
    addOnIds: ["dnb-leiebil", "dnb-maskinskade"],
  }] });
  const insurance = agreement.insuranceData.insurances[0];
  assert.equal(agreement.insuranceData.company, dnbCompany);
  assert.equal(insurance.catalogReference.providerId, "dnb-fremtind");
  assert.deepEqual(insurance.addOnIds, ["dnb-leiebil", "dnb-maskinskade"]);
  assert.deepEqual(insurance.addOns.map((item) => item.source.id), ["dnbOptionalCoverages", "dnbOptionalCoverages"]);
  assert.equal(fact(insurance.importantTerms, "leiebil.dager"), undefined);
});
