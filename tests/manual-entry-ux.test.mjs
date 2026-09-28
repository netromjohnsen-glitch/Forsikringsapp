import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement, ManualAgreementError } from "../lib/manual-agreement.ts";
import {
  applyManualProductSelection,
  CUSTOM_PRODUCT_SELECTION,
  manualProductOptions,
  manualProductSelection,
  transitionManualProductScope,
} from "../lib/manual-product-selection.ts";

const emptyProduct = (overrides = {}) => ({
  type: "Bil", productName: "", annualPremium: "", deductible: "", coverageSummary: "",
  importantTerms: [], annualMileage: "", customProduct: false, catalogReference: null, addOnIds: [],
  ...overrides,
});

const manual = (company, products) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products,
});

const pdf = (value) => ({
  source: "pdf",
  filename: "syntetisk.pdf",
  insuranceData: {
    company: "Syntetisk",
    totalAnnualPremium: null,
    insurances: [{
      type: "Bil", productName: "Ukjent", annualPremium: null, deductible: null,
      coverageSummary: null,
      importantTerms: value === null ? [] : [{
        key: "kjoretoy.kjorelengde", name: "Årlig kjørelengde", value,
        coverageOrigin: "document",
      }],
    }],
  },
});

function mileageTerms(result) {
  return result.insuranceData.insurances.map((insurance) =>
    insurance.importantTerms.filter((term) => term.key === "kjoretoy.kjorelengde"));
}

function mileageDifferences(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  return {
    groups,
    terms: groupTerms(groups[0], null),
    differences: createDifferences(first, second, groups, null),
  };
}

test("produktvalg bruker bare eksakt katalogscope for provider og forsikringstype", () => {
  const bil = manualProductOptions("Gjensidige", "Bil");
  assert.deepEqual(bil.map((option) => option.label), ["Ansvar", "Delkasko", "Kasko", "Pluss"]);
  assert.ok(bil.every((option) => option.product.company === "Gjensidige" && option.product.insuranceType === "Bil"));
  assert.deepEqual(manualProductOptions("Gjensidige", "Hus").map((option) => option.label), ["Hus", "Hus Pluss"]);
  assert.deepEqual(manualProductOptions("Ukjent selskap", "Bil"), []);
});

test("katalogvalg bruker stabil produktidentitet og eksisterende kjent verdi velges automatisk", () => {
  const product = emptyProduct({ productName: "Kasko" });
  const selection = manualProductSelection(product, "Gjensidige", "Bil");
  const option = manualProductOptions("Gjensidige", "Bil").find((candidate) => candidate.label === "Kasko");
  assert.equal(selection, option.value);
  const selected = applyManualProductSelection(product, "Gjensidige", "Bil", selection);
  assert.deepEqual(selected.catalogReference, {
    providerId: option.product.providerId,
    productId: option.product.productId,
    version: option.product.version,
  });
});

test("ukjent produkt bevares eksplisitt som custom uten fuzzy matching", () => {
  const unknown = emptyProduct({ productName: "Kaskoo" });
  assert.equal(manualProductSelection(unknown, "Gjensidige", "Bil"), CUSTOM_PRODUCT_SELECTION);
  const transitioned = transitionManualProductScope(unknown, "Gjensidige", "Bil");
  assert.equal(transitioned.productName, "Kaskoo");
  assert.equal(transitioned.customProduct, true);
  assert.equal(transitioned.catalogReference, null);
  const normalized = manual("Gjensidige", [transitioned]);
  assert.equal(normalized.insuranceData.insurances[0].catalogReference, null);
});

test("eksplisitt Annet-valg viser custom state og kan ikke katalogkobles ved navnelikhet", () => {
  const kasko = manualProductOptions("Gjensidige", "Bil").find((option) => option.label === "Kasko");
  const selected = applyManualProductSelection(emptyProduct(), "Gjensidige", "Bil", kasko.value);
  const custom = applyManualProductSelection(selected, "Gjensidige", "Bil", CUSTOM_PRODUCT_SELECTION);
  assert.equal(custom.customProduct, true);
  assert.equal(custom.productName, "");
  assert.equal(manualProductSelection({ ...custom, productName: "Kasko" }, "Gjensidige", "Bil"), CUSTOM_PRODUCT_SELECTION);
  assert.equal(manual("Gjensidige", [{ ...custom, productName: "Kasko" }])
    .insuranceData.insurances[0].catalogReference, null);
});

test("provider- og typebytte oppdaterer alternativer deterministisk uten ugyldig katalogreferanse", () => {
  const pluss = manualProductOptions("Gjensidige", "Bil").find((option) => option.label === "Pluss");
  const selected = applyManualProductSelection(emptyProduct(), "Gjensidige", "Bil", pluss.value);
  const house = transitionManualProductScope({ ...selected, type: "Hus" }, "Gjensidige", "Hus");
  assert.equal(house.productName, "");
  assert.equal(house.catalogReference, null);
  const tryg = transitionManualProductScope(selected, "Tryg", "Bil");
  assert.equal(tryg.productName, "");
  assert.equal(tryg.catalogReference, null);
  assert.deepEqual(manualProductOptions("Tryg", "Bil").map((option) => option.label), ["Ansvar", "Delkasko", "Kasko"]);
});

test("scope uten katalogprodukter faller tilbake til Annet og bevarer manuell tekst", () => {
  const product = transitionManualProductScope(emptyProduct({ productName: "Min variant" }), "Ukjent selskap", "Bil");
  assert.equal(manualProductSelection(product, "Ukjent selskap", "Bil"), CUSTOM_PRODUCT_SELECTION);
  assert.equal(product.productName, "Min variant");
  assert.equal(product.customProduct, true);
});

test("manuell årlig kjørelengde bruker canonical Bil-fact og lesbart format", () => {
  const result = manual("Ukjent selskap", [emptyProduct({ productName: "Produkt", customProduct: true, annualMileage: "20000" })]);
  const [term] = mileageTerms(result)[0];
  assert.equal(term.key, "kjoretoy.kjorelengde");
  assert.equal(term.name, "Årlig kjørelengde");
  assert.equal(term.value, "20 000 km/år");
  assert.equal(term.coverageOrigin, "document");
});

test("tom kjørelengde oppretter ikke fact, mens ugyldig og ikke-Bil input avvises", () => {
  const empty = manual("Ukjent selskap", [emptyProduct({ productName: "Produkt", customProduct: true })]);
  assert.deepEqual(mileageTerms(empty)[0], []);
  for (const annualMileage of ["-1", "NaN", "tjue tusen", "12.5"]) {
    assert.throws(() => manual("Ukjent selskap", [emptyProduct({
      productName: "Produkt", customProduct: true, annualMileage,
    })]), ManualAgreementError);
  }
  assert.throws(() => manual("Ukjent selskap", [emptyProduct({
    type: "Snøscooter", productName: "Produkt", customProduct: true, annualMileage: "20000",
  })]), /bare registreres for Bil/u);
});

test("manuell kjørelengde erstatter samme catalog fact med dokumentprioritet", () => {
  const option = manualProductOptions("Gjensidige", "Bil").find((candidate) => candidate.label === "Kasko");
  const product = applyManualProductSelection(emptyProduct(), "Gjensidige", "Bil", option.value);
  const result = manual("Gjensidige", [{ ...product, annualMileage: "23456" }]);
  const terms = mileageTerms(result)[0];
  assert.equal(terms.length, 1);
  assert.equal(terms[0].value, "23 456 km/år");
  assert.equal(terms[0].coverageOrigin, "document");
});

test("PDF og manuell årlig kjørelengde er lik ved samme tall i begge retninger", () => {
  const registered = manual("Ukjent selskap", [emptyProduct({
    productName: "Produkt", customProduct: true, annualMileage: "20000",
  })]);
  for (const [first, second] of [[pdf("Inntil 20 000 km per forsikringsår"), registered], [registered, pdf("20 000 km/år")]]) {
    const compared = mileageDifferences(first, second);
    assert.equal(compared.differences.some((difference) => difference.termKey === "kjoretoy.kjorelengde"), false);
    assert.ok(compared.terms.some((term) => term.key === "kjoretoy.kjorelengde"));
  }
});

test("ulik årlig kjørelengde er en reell forskjell for hybrid og manuell sammenligning", () => {
  const fifteen = manual("Ukjent selskap", [emptyProduct({ productName: "Produkt", customProduct: true, annualMileage: "15000" })]);
  const twenty = manual("Annet selskap", [emptyProduct({ productName: "Produkt", customProduct: true, annualMileage: "20000" })]);
  for (const [first, second] of [[pdf("20 000 km/år"), fifteen], [twenty, fifteen]]) {
    assert.ok(mileageDifferences(first, second).differences
      .some((difference) => difference.termKey === "kjoretoy.kjorelengde"));
  }
  assert.equal(mileageDifferences(twenty, manual("Tredje selskap", [emptyProduct({
    productName: "Produkt", customProduct: true, annualMileage: "20000",
  })])).differences.some((difference) => difference.termKey === "kjoretoy.kjorelengde"), false);
});

test("flere manuelle Bil-objekter beholder egne kjørelengdefacts og rekkefølge", () => {
  const products = ["20000", "10000"].map((annualMileage, index) => emptyProduct({
    productName: `Bil ${index + 1}`, customProduct: true, annualMileage,
  }));
  for (const input of [products, products.toReversed()]) {
    const values = mileageTerms(manual("Ukjent selskap", input)).map(([term]) => term.value);
    assert.deepEqual(values, input.map((product) => `${Number(product.annualMileage).toLocaleString("nb-NO")} km/år`));
  }
});

test("årlig kjørelengde lekker ikke til andre kilometeridentiteter", () => {
  const [insurance] = manual("Ukjent selskap", [emptyProduct({
    productName: "Produkt", customProduct: true, annualMileage: "20000",
  })]).insuranceData.insurances;
  const keys = insurance.importantTerms.map((term) => term.key);
  assert.deepEqual(keys, ["kjoretoy.kjorelengde"]);
  for (const forbidden of [
    "kjoretoy.kilometerstand", "kjoretoy.avtalt_maks_kilometerstand", "nyverdi.km",
    "maskinskade.km", "maskinskade.egenandel", "maskinskade.egenandel.intervall",
  ]) assert.equal(keys.includes(forbidden), false);
});

test("manglende manuell kjørelengde forblir udokumentert i hybrid sammenligning", () => {
  const registered = manual("Ukjent selskap", [emptyProduct({ productName: "Produkt", customProduct: true })]);
  const compared = mileageDifferences(pdf("20 000 km/år"), registered);
  const mileage = compared.terms.find((term) => term.key === "kjoretoy.kjorelengde");
  assert.equal(mileage.first, "20 000 km/år");
  assert.equal(mileage.second, null);
  assert.equal(compared.differences.some((difference) => difference.termKey === "kjoretoy.kjorelengde"), false);
});

test("manuell UI bruker native katalogselect, eksplisitt customfelt og Bil-avgrenset numerisk kjørelengde", () => {
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /<label htmlFor=\{selectId\}>Produkt\/variant<\/label>/u);
  assert.match(source, /<select\s+[\s\S]*?id=\{selectId\}/u);
  assert.match(source, /Annet \/ ikke på listen/u);
  assert.match(source, /<label htmlFor=\{customId\}/u);
  assert.match(source, /normalizeInsuranceType\(product\.type\) === "bil"/u);
  assert.match(source, /Årlig kjørelengde[\s\S]*type="number"[\s\S]*min="0"[\s\S]*step="1"/u);
  assert.match(source, /km\/år/u);
});
