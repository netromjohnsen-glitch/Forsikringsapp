import assert from "node:assert/strict";
import test from "node:test";
import { materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { fremtindBobilMarket } from "../lib/fremtind-bobil-market.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const current = productComparisonProducts(marketProductCatalog).filter(product => product.agreementScope === "ordinary-dnb");

function fact(tier, key) {
  const product = current.find(product => product.name === tier);
  return materializeCatalogProduct(product, marketProductCatalog).facts.find(fact => fact.key === key);
}

test("DNB's market packages use their own official PDFs and physical PDF pages", () => {
  assert.equal(current.length, 4);
  for (const [tier, key, name, page] of [
    ["Ansvar", "rettshjelp.egenandel", "ansvar", 6],
    ["Minikasko", "glass.dekning", "minikasko", 4],
    ["Minikasko", "nyverdi.begrensning", "minikasko", 6],
    ["Kasko", "kasko.dekning", "kasko", 7],
    ["Kasko", "kasko.egenandel", "kasko", 8],
    ["Topp", "parkering.dekning", "topp", 8],
    ["Topp", "bobil.fukt.dekning", "topp", 9],
    ["Topp", "nyverdi.alder", "topp", 9],
    ["Topp", "nokkel.egenandel", "topp", 10],
  ]) {
    assert.equal(termsSourceHref(fact(tier, key).sources[0]), "/api/vilkar/fremtind/bobil-" + name + "-20260924#page=" + page, tier + " " + key);
  }
  assert.equal(fact("Minikasko", "glass.dekning").sources[0].termsNumber, "PMO-357.210-013");
});

test("DNB's revised Maskinskade and Leiebil still require optional coverage", () => {
  for (const tier of ["Kasko", "Topp"]) {
    const exclusion = fact(tier, "maskinskade.begrensning");
    assert.equal(exclusion.state, "optional");
    assert.match(exclusion.value, /fører til eller skyldes forhøyet oljeforbruk/);
    assert.equal(termsSourceHref(exclusion.sources[0]), "/api/vilkar/fremtind/bobil-maskinskade-20260924#page=1");
    const rentals = fact(tier, "leiebil.dager");
    assert.equal(rentals.state, "optional");
    assert.equal(rentals.sources[0].termsNumber, "PMO-350.402-004");
  }
  assert.equal(fact("Minikasko", "maskinskade.begrensning"), undefined);
});

test("DNB's earlier exact products, sources and versions remain resolvable", () => {
  for (const id of fremtindBobilMarket.replacesProductIds) {
    const earlier = productCatalog.products.find(product => product.productId === id);
    assert.ok(earlier);
    assert.equal(earlier.version, "2025-09-18");
    assert.ok(productCatalog.facts[id].every(fact => !fact.source.documentId.endsWith("-marked-20260924")));
    assert.ok(!current.some(product => product.productId === id));
  }
});
