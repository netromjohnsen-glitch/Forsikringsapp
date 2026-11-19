import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { privateHolidayContentsArchives, privateHolidayContentsMarket } from "../lib/private-holiday-contents-gjensidige-watercircles.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonProducts(marketProductCatalog);
const fact = (id, key) => {
  const product = products.find(item => item.productId === id);
  assert.ok(product);
  return materializeCatalogProduct(product, marketProductCatalog).facts.find(item => item.key === key);
};

test("Gjensidige and WaterCircles cabin contents products appear in their ordinary private scope", () => {
  for (const expected of privateHolidayContentsMarket.products) {
    const found = products.find(product => product.productId === expected.productId);
    assert.equal(found.insuranceType, "Innbo fritidsbolig");
    assert.equal(found.agreementScope, "ordinary");
    assert.equal(found.name, expected.name);
    assert.ok(!productCatalog.products.some(product => product.productId === expected.productId));
  }
});

test("Gjensidige publishes differently scoped Standard and Pluss risks with physical PDF pages", () => {
  assert.equal(fact("gjensidige-innbo-hytte", "uhell.dekning").state, "unavailable");
  const water = fact("gjensidige-innbo-hytte", "vann.dekning");
  assert.equal(termsSourceHref(water.sources[0]), "/api/vilkar/gjensidige/innbo-hytte#page=2");
  const uhell = fact("gjensidige-innbo-hytte-pluss", "uhell.dekning");
  assert.equal(uhell.state, "included");
  assert.equal(termsSourceHref(uhell.sources[0]), "/api/vilkar/gjensidige/innbo-hytte-pluss#page=3");
  const pests = fact("gjensidige-innbo-hytte-pluss", "skadedyr.grense");
  assert.match(pests.value, /150 000 kr/);
  assert.equal(termsSourceHref(pests.sources[0]), "/api/vilkar/gjensidige/innbo-hytte-pluss#page=5");
  const rent = fact("gjensidige-innbo-hytte-pluss", "utleie.vilkar");
  assert.equal(rent.role, "term");
  assert.match(rent.value, /Når utleie står i forsikringsbeviset/);
});

test("WaterCircles cites the published WtCIBF 1.05 terms for bicycle limits", () => {
  const standard = fact("watercircles-innbo-fritidsbolig-standard", "sykkel.tyveri.grense");
  assert.match(standard.value, /20 000 kr/);
  assert.equal(termsSourceHref(standard.sources[0]), "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=4");
  assert.equal(standard.sources[0].effectiveFrom, "2026-01-01");
  const elite = fact("watercircles-innbo-fritidsbolig-elite", "sykkel.tyveri.grense");
  assert.match(elite.value, /40 000 kr.*50 000 kr/);
  assert.equal(termsSourceHref(elite.sources[0]), "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=9");
  const legal = fact("watercircles-innbo-fritidsbolig-elite", "rettshjelp.dekning");
  assert.equal(legal.state, "unavailable");
  assert.equal(termsSourceHref(legal.sources[0]), "/api/vilkar/watercircles/innbo-fritidsbolig-ipid#page=1");
  assert.equal(fact("watercircles-innbo-fritidsbolig-elite", "skadedyr.dekning"), undefined);
});

test("private holiday contents archive retains all four original PDFs", async () => {
  for (const archive of privateHolidayContentsArchives) {
    const source = privateHolidayContentsMarket.sources[archive.sources[0][0]];
    const data = await readFile(new URL("../" + archive.archivePath, import.meta.url));
    assert.equal(data.subarray(0, 5).toString(), "%PDF-");
    assert.equal(createHash("sha256").update(data).digest("hex"), source.sha256);
  }
});
