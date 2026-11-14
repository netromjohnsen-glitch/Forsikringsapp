import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, productComparisonOptions, productComparisonProviders } from "../lib/catalog-product-comparison.ts";
import { normalizeInsuranceType, normalizeTermName } from "../lib/insurance-normalization.ts";
import { manualProductOptions } from "../lib/manual-product-selection.ts";
import { cabinProducts, cabinSources } from "../lib/private-cabin-catalog.ts";
import { valuablesProducts, valuablesSources } from "../lib/private-valuables-catalog.ts";
import { newMotorHomeProducts, newMotorHomeSources } from "../lib/new-private-motor-home-catalog.ts";
import { newContentsTravelProducts, newContentsTravelSources } from "../lib/new-private-contents-travel-catalog.ts";
import { availableAddOns, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

const asOf = new Date("2026-11-14T12:00:00Z");
const original = ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende"];
const newCompanies = ["KLP", "Landkreditt", "WaterCircles"];
const newTypes = ["Bil", "Hus", "Innbo", "Reise"];
const ordinary = "ordinary";

test("Hytte and Verdisak are available for every original insurer without sharing Hus or Innbo identity", () => {
  for (const type of ["Hytte", "Verdisak"]) {
    assert.deepEqual(productComparisonProviders(type), original);
    for (const company of original) {
      assert.ok(manualProductOptions(company, type).length > 0, company + " – " + type);
    }
  }
  assert.equal(normalizeInsuranceType("Fritidshusforsikring"), "fritidsbolig");
  assert.equal(normalizeInsuranceType("Verdigjenstandsforsikring"), "verdisak");
  assert.equal(normalizeTermName("Brannskade", { insuranceType: "Hytte" }), "hytte.brann.dekning");
  assert.notEqual(normalizeTermName("Brannskade", { insuranceType: "Hus" }), "hytte.brann.dekning");
  assert.throws(() => compareCatalogProducts(
    productComparisonOptions("Hytte", "If", ordinary)[0],
    productComparisonOptions("Hus", "If", ordinary)[0],
  ), /samme forsikringstype/i);
});

test("the new insurer names and legal names lead to the same four private product catalogs", () => {
  const legalNames = ["KLP Skadeforsikring AS", "Landkreditt Forsikring AS", "WaterCircles Forsikring ASA"];
  for (const [index, company] of newCompanies.entries()) {
    assert.ok(productCatalog.companies.includes(company));
    for (const type of newTypes) {
      const products = productComparisonOptions(type, company, ordinary);
      assert.ok(products.length > 0, company + " – " + type);
      assert.deepEqual(manualProductOptions(legalNames[index], type).map(option => option.product), products);
    }
  }
  for (const product of [...newMotorHomeProducts, ...newContentsTravelProducts]) {
    assert.ok(newTypes.includes(product.insuranceType));
    assert.ok(newCompanies.includes(product.company));
    assert.ok(resolveCatalogFacts(product, [], asOf).length > 0, product.productId);
  }
});

test("every new base coverage is attributable to the correct product and an archived source", () => {
  const archives = [
    [cabinProducts, cabinSources, ""],
    [valuablesProducts, valuablesSources, "private-valuables/"],
    [newMotorHomeProducts, newMotorHomeSources, "new-private-motor-home/"],
    [newContentsTravelProducts, newContentsTravelSources, "new-private-contents-travel/"],
  ];
  for (const [products, sources, folder] of archives) {
    for (const source of Object.values(sources)) {
      const bytes = readFileSync(new URL("../catalog/sources/" + folder + source.filename, import.meta.url));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
      if (source.physicalPages) assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    }
    for (const product of products) {
      const facts = resolveCatalogFacts(product, [], asOf);
      assert.ok(facts.length >= 4, product.productId);
      assert.equal(new Set(facts.map(fact => fact.key)).size, facts.length, product.productId);
      for (const fact of facts) {
        const source = sources[fact.source.documentId];
        assert.equal(source.providerId, product.providerId);
        assert.equal(source.insuranceType, product.insuranceType);
        assert.ok(source.productIds.includes(product.productId), product.productId);
        assert.ok(fact.source.section);
        if (source.physicalPages) {
          assert.ok(fact.source.page >= source.physicalPages[0] && fact.source.page <= source.physicalPages[1], source.id);
        }
      }
    }
  }
});

test("travel levels compare the same duration row with source and preserve direction", () => {
  const [klp, klpMaks] = productComparisonOptions("Reise", "KLP", ordinary);
  const row = (first, second) => compareCatalogProducts(first, second).sections
    .flatMap(section => section.rows).find(item => item.key === "varighet.maks");
  const forward = row(klp, klpMaks);
  const reverse = row(klpMaks, klp);
  assert.match(forward.first.text, /50 sammenhengende dager/u);
  assert.match(forward.second.text, /70 sammenhengende dager/u);
  assert.equal(forward.first.text, reverse.second.text);
  assert.equal(forward.second.text, reverse.first.text);
  assert.equal(forward.first.sources[0].sourceType, "product_page");
});

test("Gjensidige Verdisak Standard and Pluss preserve distinct terms when compared in either order", () => {
  const products = productComparisonOptions("Verdisak", "Gjensidige", ordinary);
  const standard = products.find(product => product.productId === "gjensidige-verdisak-standard");
  const pluss = products.find(product => product.productId === "gjensidige-verdisak-pluss");
  assert.ok(standard && pluss);
  assert.notEqual(standard.sourceId, pluss.sourceId);
  const row = (first, second) => compareCatalogProducts(first, second).sections
    .flatMap(section => section.rows).find(item => item.key === "verdisak.tap");
  const forward = row(standard, pluss);
  const reverse = row(pluss, standard);
  assert.equal(forward.first.state, "unavailable");
  assert.equal(forward.second.state, "included");
  assert.deepEqual(forward.first, reverse.second);
  assert.deepEqual(forward.second, reverse.first);
  assert.match(forward.first.sources[0].filename, /-standard\.pdf$/u);
  assert.match(forward.second.sources[0].filename, /-pluss\.pdf$/u);
});

test("an optional cover remains separate from the selected insurance level", () => {
  const options = productComparisonOptions("Bil", "Landkreditt", ordinary);
  const kasko = options.find(product => product.name === "Kasko");
  const leiebil = availableAddOns(kasko, asOf).find(addOn => addOn.name === "Leiebil");
  assert.ok(leiebil);
  assert.equal(resolveCatalogFacts(kasko, [], asOf).some(fact => fact.key === "leiebil.dekning"), false);
  assert.ok(resolveCatalogFacts(kasko, [leiebil.id], asOf).some(fact => fact.key === "leiebil.dekning"));
  const ansvar = options.find(product => product.name === "Ansvar");
  assert.equal(availableAddOns(ansvar, asOf).some(addOn => addOn.id === leiebil.id), false);

  const cabin = productComparisonOptions("Hytte", "Tryg", ordinary)[0];
  const pests = availableAddOns(cabin, asOf).find(addOn => addOn.name === "Råte og skadedyr");
  assert.ok(pests);
  assert.equal(resolveCatalogFacts(cabin, [], asOf).some(fact => fact.key === "hytte.rate.dekning"), false);
  assert.ok(resolveCatalogFacts(cabin, [pests.id], asOf).some(fact => fact.key === "hytte.rate.dekning"));
  const compared = compareCatalogProducts(cabin, cabin).sections.flatMap(section => section.rows);
  assert.equal(compared.find(row => row.key === "hytte.rate.dekning").first.state, "optional");
});
