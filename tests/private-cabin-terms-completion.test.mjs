import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { cabinAddOns, cabinProducts, cabinSources } from "../lib/private-cabin-catalog.ts";
import { compareCatalogProducts } from "../lib/catalog-product-comparison.ts";
import { emptyManualProduct, normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { catalogReferenceForProduct, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { conceptForFactKey } from "../lib/presentation-catalog.ts";

const asOf = new Date("2026-11-19T12:00:00Z");
const product = id => {
  const found = cabinProducts.find(item => item.productId === id);
  assert.ok(found, id);
  return found;
};
const facts = (id, addOns = []) => resolveCatalogFacts(product(id), addOns, asOf);
const fact = (id, key) => {
  const found = facts(id).find(item => item.key === key);
  assert.ok(found, id + "/" + key);
  return found;
};
const page = (source, number) => execFileSync("pdftotext", [
  "-layout", "-f", String(number), "-l", String(number),
  new URL("../catalog/sources/" + source.filename, import.meta.url).pathname, "-",
], { encoding: "utf8" });

test("the thirteen ordinary cabin levels and seven existing options retain their identities", () => {
  assert.deepEqual(cabinProducts.map(item => item.productId), [
    "tryg-hytte-standard", "tryg-hytte-ekstra", "if-hytte-basis", "if-hytte-utvidet", "if-hytte-super",
    "gjensidige-hytte-standard", "gjensidige-hytte-pluss", "storebrand-hytte-standard",
    "storebrand-hytte-super", "fremtind-hytte-standard", "fremtind-hytte-topp",
    "frende-hytte-standard", "frende-hytte-utvidet",
  ]);
  assert.equal(cabinAddOns.length, 7);
  assert.ok(cabinProducts.every(item => item.insuranceType === "Hytte" && item.agreementScope === "ordinary"));
});

for (const selected of cabinProducts) {
  test(selected.productId + " exposes sourced objects, settlement, common limits and safety", () => {
    const rows = facts(selected.productId);
    assert.ok(rows.length >= 50);
    for (const key of ["hytte.bygninger.dekning", "hytte.gjenoppforing.hovedregel",
      "hytte.rettshjelp.grense", "hytte.naturskade.dekning"]) {
      assert.ok(rows.some(item => item.key === key), key);
    }
    if (selected.providerId === "gjensidige") {
      assert.match(rows.find(item => item.key === "hytte.ansvar.dekning").value, /5 000 000/);
    } else {
      assert.ok(rows.some(item => item.key === "hytte.ansvar.grense"));
    }
    assert.equal(new Set(rows.map(item => item.key)).size, rows.length);
    for (const item of rows) {
      const source = cabinSources[item.source.documentId];
      assert.ok(source, item.key);
      assert.equal(source.sourceType, "full_terms");
      assert.equal(source.providerId, selected.providerId);
      assert.equal(source.insuranceType, "Hytte");
      assert.ok(source.productIds.includes(selected.productId));
      assert.ok(Number.isInteger(item.source.page) && item.source.page >= source.physicalPages[0] &&
        item.source.page <= source.physicalPages[1], item.key + " page");
      assert.ok(item.source.section);
      assert.ok(item.key.startsWith("hytte."));
      if (item.qualificationSource) {
        const qualification = cabinSources[item.qualificationSource.documentId];
        assert.equal(qualification.providerId, selected.providerId);
        assert.ok(qualification.productIds.includes(selected.productId));
      }
    }
  });
}

test("all registered cabin source files retain their exact original PDF bytes", () => {
  for (const source of Object.values(cabinSources)) {
    const bytes = readFileSync(new URL("../catalog/sources/" + source.filename, import.meta.url));
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
  }
  assert.equal(cabinSources["cabin:if:general"].termsNumber, "GEN2-9");
  assert.equal(cabinSources["cabin:if:general"].filename, "if/innbo/If_Generelle_vilkar_GEN2-9.pdf");
});

test("Tryg cabin Standard and Ekstra keep their own original limits and pages", () => {
  const standard = fact("tryg-hytte-standard", "hytte.hage.grense");
  const extra = fact("tryg-hytte-ekstra", "hytte.hage.grense");
  assert.match(standard.value, /500 000/);
  assert.match(extra.value, /1 000 000/);
  assert.match(page(cabinSources[standard.source.documentId], standard.source.page), /500.000/);
  assert.match(page(cabinSources[extra.source.documentId], extra.source.page), /1.000.000/);
  assert.equal(fact("tryg-hytte-standard", "hytte.utett.dekning").coverageAvailability, "unavailable");
  assert.equal(fact("tryg-hytte-ekstra", "hytte.utett.dekning").coverageAvailability, "included");
  assert.match(fact("tryg-hytte-standard", "hytte.feriegaranti.dekning").value, /30 000/);
  assert.match(fact("tryg-hytte-ekstra", "hytte.feriegaranti.dekning").value, /50 000/);
});

test("Storebrand cabin settlement uses the cabin paragraph and physical PDF page", () => {
  for (const id of ["storebrand-hytte-standard", "storebrand-hytte-super"]) {
    const settlement = fact(id, "hytte.gjenoppforing.hovedregel");
    assert.match(settlement.value, /40 prosent/);
    assert.equal(settlement.source.page, 21);
    assert.match(settlement.source.section, /B\.6\.2\.1\.2/);
    const original = page(cabinSources[settlement.source.documentId], 21);
    assert.match(original, /Andre bygninger \(garasje, hytte m\.m\.\)/);
    assert.match(original, /40 %/);
    assert.equal(fact(id, "hytte.aldersfradrag.utvendige_ror").source.page, 29);
  }
  assert.match(fact("storebrand-hytte-super", "hytte.bygninger.dekning").value, /ikke er omfattet med Super/);
  assert.equal(fact("storebrand-hytte-super", "hytte.dyr.egenandel.tillegg").source.page, 30);
});

test("Gjensidige preserves the opposing HTU passages without granting a positive benefit", () => {
  for (const [id, positive, negative] of [
    ["gjensidige-hytte-standard", 8, 9], ["gjensidige-hytte-pluss", 9, 10],
  ]) {
    const source = cabinSources[product(id).sourceId];
    assert.match(page(source, positive), /husleietvistutvalget/i);
    assert.match(page(source, negative), /kan behandles Husleietvistutvalget/);
    assert.match(fact(id, "hytte.rettshjelp.unntak").value, /motstridende HTU-regelen/);
    assert.equal(fact(id, "hytte.rettshjelp.unntak").coverageAvailability, undefined);
    assert.equal(facts(id).some(item => /rettshjelp.*htu/.test(item.key)), false);
  }
});

test("existing optional protections remain absent until that option is explicitly selected", () => {
  const cases = [
    ["tryg-hytte-standard", "cabin:tryg:pests:optional", "hytte.rate.egenandel"],
    ["tryg-hytte-standard", "cabin:tryg:rental:optional", "hytte.utleie.egenandel"],
    ["gjensidige-hytte-standard", "cabin:gjensidige:standard:utleie", "hytte.utleie.vilkar"],
    ["storebrand-hytte-standard", "cabin:storebrand:building:optional", "hytte.utleie.egenandel"],
    ["fremtind-hytte-standard", "cabin:fremtind:pests:optional", "hytte.rate.egenandel"],
    ["frende-hytte-standard", "cabin:frende:building:optional", "hytte.rate.egenandel"],
  ];
  for (const [id, addOn, key] of cases) {
    assert.equal(facts(id).some(item => item.key === key), false, id);
    assert.equal(facts(id, [addOn]).some(item => item.key === key), true, id);
  }
  assert.throws(() => facts("if-hytte-basis", ["cabin:tryg:pests:optional"]));
});

test("manual selection includes completed terms and preserves customer premium and deductible", () => {
  const selected = product("tryg-hytte-standard");
  const manual = normalizeManualAgreement({
    company: "Tryg", totalAnnualPremium: "",
    products: [{ ...emptyManualProduct(), type: "Hytte", productName: selected.name,
      catalogReference: catalogReferenceForProduct(selected), annualPremium: "12345", deductible: "7890",
      addOnIds: ["cabin:tryg:pests:optional"] }],
  });
  const insurance = manual.insuranceData.insurances[0];
  assert.equal(insurance.annualPremium, "12345");
  assert.equal(insurance.deductible, "7890");
  assert.equal(insurance.deductibleOrigin, "customer");
  const detail = insurance.importantTerms.find(item => item.key === "hytte.rate.egenandel");
  assert.equal(detail.source.documentId, "cabin:tryg:pests");
  assert.match(detail.value, /6 000/);
  assert.ok(insurance.importantTerms.some(item => item.key === "hytte.gjenoppforing.hovedregel"));
});

test("completed cabin comparisons preserve direction and named coverage groups", () => {
  const first = product("tryg-hytte-standard");
  const second = product("tryg-hytte-ekstra");
  const forward = compareCatalogProducts(first, second);
  const reverse = compareCatalogProducts(second, first);
  const row = (result, key) => result.sections.flatMap(section => section.rows).find(item => item.key === key);
  for (const key of ["hytte.hage.grense", "hytte.gjenoppforing.hovedregel", "hytte.utett.dekning"]) {
    assert.deepEqual(row(forward, key).first, row(reverse, key).second);
    assert.deepEqual(row(forward, key).second, row(reverse, key).first);
  }
  assert.equal(conceptForFactKey("fritidsbolig", "hytte.gjenoppforing.hovedregel").id, "fritidsbolig.oppgjor");
  assert.equal(conceptForFactKey("fritidsbolig", "hytte.rate.egenandel").id, "fritidsbolig.rate-skadedyr");
  assert.throws(() => compareCatalogProducts(first, { ...second, insuranceType: "Hus" }));
});
