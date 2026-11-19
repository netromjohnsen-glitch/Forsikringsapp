import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { trygHolidayContentsArchives, trygHolidayContentsMarket } from "../lib/holiday-contents-tryg-market.ts";
import { productCatalog } from "../lib/product-catalog.ts";

const { products, sources, facts } = trygHolidayContentsMarket;
const catalog = { ...productCatalog, products, sources, facts, addOns: [] };
const [standard, extra] = products.map(product => materializeCatalogProduct(product, catalog));
const fact = (level, key) => level.facts.find(row => row.key === key);

test("Tryg's public holiday contents alternatives are bundled with a hytte policy and are ordinary market choices", () => {
  for (const [level, version] of [[standard, "PPK32013"], [extra, "PPK32014"]]) {
    assert.equal(level.product.agreementScope, "ordinary");
    const requirement = fact(level, "innbo.kjopskrav");
    assert.match(requirement.value, /Kjøpes sammen med Trygs hytteforsikring/);
    assert.deepEqual(requirement.sources.map(source => [source.termsNumber, source.page]), [["PPK32000", 1], ["Produktside", 0]]);
    assert.equal(requirement.sources[1].sourceType, "product_page");
    const amount = fact(level, "innbo.forsikringssum");
    assert.deepEqual(amount.sources.map(source => [source.termsNumber, source.page]), [[version, 1]]);
    assert.equal(fact(level, "innbo.opphold.dekning").state, "unavailable");
    assert.equal(fact(level, "innbo.opphold.dekning").sources[0].page, 2);
  }
});

test("Tryg's holiday contents distinguish sudden damage and actual hytte pest scope", () => {
  assert.equal(fact(standard, "uhell.dekning").state, "unavailable");
  const mishap = fact(extra, "uhell.dekning");
  assert.equal(mishap.state, "included");
  assert.equal(mishap.sources[0].page, 4);
  const pest = fact(extra, "skadedyr.dekning");
  assert.equal(pest.state, "unavailable");
  assert.match(pest.value, /faste bosted i Norge/);
  assert.equal(pest.sources[0].page, 4);
  assert.deepEqual([standard, extra].map(level => fact(level, "innbo.fritidsbat.grense").value.match(/\d+ 000/u)[0]), ["20 000", "40 000"]);
});

test("Tryg market tiers retain separate archived versions and established hybrid references", () => {
  for (const archive of trygHolidayContentsArchives) {
    const [id, effectiveFrom, url] = archive.sources[0];
    const source = sources[id];
    assert.equal(source.sha256, createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex"));
    assert.equal(source.effectiveFrom, effectiveFrom);
    assert.equal(source.url, url);
  }

  const productIds = products.map(product => product.productId);
  assert.ok(productIds.every(id => !id.includes("nito")));
  assert.ok(productCatalog.products.every(product => !productIds.includes(product.productId)));
  assert.deepEqual(products.map(product => sources[product.sourceId].physicalPages), [[1, 5], [1, 6]]);
});
