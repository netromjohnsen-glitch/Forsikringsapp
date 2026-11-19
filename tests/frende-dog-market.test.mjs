import assert from "node:assert/strict";
import test from "node:test";
import { materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

test("Frende dog market displays the current veterinary ceiling with official PDF page and separate contractual limit", () => {
  const product = marketProductCatalog.products.find(({ productId }) => productId === "frende-hund-veterin-r");
  assert.equal(product.version, "2026-01-01");
  const current = materializeCatalogProduct(product, marketProductCatalog).facts.find(({ key }) => key === "dyr.veterinar.sum.valgbar");
  assert.match(current.value, /50 000 kr per skadetilfelle og samlet per forsikringsår/);
  assert.match(current.value, /samlet erstatning for veterinær- og medisinutgifter/);
  assert.deepEqual(current.sources.map(termsSourceHref), ["/api/vilkar/frende/hund-ipid#page=1", "/api/vilkar/frende/hund#page=4"]);
  assert.equal(current.sources[0].sourceType, "ipid");

  const contract = materializeCatalogProduct(product, productCatalog).facts.find(({ key }) => key === "dyr.veterinar.sum.valgbar");
  assert.doesNotMatch(contract.value, /50 000/);
  assert.deepEqual(contract.sources.map(termsSourceHref), ["/api/vilkar/frende/hund#page=4"]);
});
