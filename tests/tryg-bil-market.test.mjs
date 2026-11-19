import assert from "node:assert/strict";
import test from "node:test";
import { materializeCatalogProduct, productComparisonOptions } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonOptions("Bil", "Tryg", "ordinary", marketProductCatalog);
const materialized = new Map(products.map(product => [product.name, materializeCatalogProduct(product, marketProductCatalog).facts]));
const sourceUrl = (tier, key) => termsSourceHref(materialized.get(tier).find(fact => fact.key === key).sources[0]);

test("each ordinary Tryg Bil comparison condition has an exact page-bound local policy source", () => {
  assert.deepEqual(products.map(product => product.name), ["Ansvar", "Delkasko", "Kasko"]);
  for (const [tier, rows] of materialized) {
    for (const { sources } of rows) {
      assert.ok(sources.length > 0, tier);
      for (const source of sources) {
        assert.match(termsSourceHref(source), /^\/api\/vilkar\/tryg\/[a-z0-9-]+#page=\d+$/u);
        const registered = marketProductCatalog.sources[source.documentId];
        assert.equal(registered.effectiveFrom, source.effectiveFrom);
        assert.equal(registered.termsNumber, source.termsNumber);
        assert.ok(source.page > 0 && source.page <= registered.physicalPages[1], source.documentId);
      }
    }
  }
  const kasko = "/api/vilkar/tryg/bil-kasko-pau25205#page=";
  for (const key of ["tyveri.dekning", "tyveri.egenandel", "glass.dekning", "glass.egenandel.bytte", "glass.unntak", "veihjelp.dekning"]) {
    assert.equal(sourceUrl("Kasko", key), kasko + "2", key);
  }
  assert.equal(sourceUrl("Kasko", "veihjelp.egenandel"), kasko + "3");
  assert.equal(sourceUrl("Delkasko", "veihjelp.egenandel"), "/api/vilkar/tryg/bil-delkasko-pau25835#page=2");
});

test("geography, legal cover and repair guarantee are scoped to the current ordinary product facts", () => {
  for (const tier of materialized.keys()) {
    assert.equal(sourceUrl(tier, "avtale.geografi"), "/api/vilkar/tryg/bil-produkt-pau14000#page=1");
    assert.equal(sourceUrl(tier, "rettshjelp.grense"), "/api/vilkar/tryg/bil-rettshjelp-pge91500#page=4");
    const legalDeductible = materialized.get(tier).find(fact => fact.key === "rettshjelp.egenandel");
    assert.match(legalDeductible.value, /4 000 kr pluss 20 %/u);
    assert.equal(legalDeductible.sources[0].section, "6.2");
    assert.equal(termsSourceHref(legalDeductible.sources[0]), "/api/vilkar/tryg/bil-rettshjelp-pge91500#page=5");
  }
  assert.match(materialized.get("Kasko").find(fact => fact.key === "reparasjon.garanti").value, /8 år/u);
  assert.equal(sourceUrl("Kasko", "reparasjon.garanti"), "/api/vilkar/tryg/bil-kasko-pau25205#page=3");
  assert.equal(materialized.get("Delkasko").some(fact => fact.key === "reparasjon.garanti"), false);
  assert.equal(productCatalog.facts.kasko.find(fact => fact.key === "tyveri.dekning").source.url, undefined);
  assert.equal(productCatalog.facts.ansvar.some(fact => fact.key === "rettshjelp.egenandel"), false);
});
