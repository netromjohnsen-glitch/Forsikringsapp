import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { storebrandHolidayContentsArchives, storebrandHolidayContentsMarket } from "../lib/holiday-contents-storebrand-market.ts";
import { productCatalog } from "../lib/product-catalog.ts";

const { products, sources, facts } = storebrandHolidayContentsMarket;
const catalog = { ...productCatalog, products, sources, facts, addOns: [] };
const [standard, superProduct] = products.map(product => materializeCatalogProduct(product, catalog));

function fact(level, key) {
  return level.facts.find(row => row.key === key);
}

test("Storebrand's permanent holiday contents use the agreed address, sum, and holiday rent limits", () => {
  for (const [level, rent] of [[standard, "40 000"], [superProduct, "80 000"]]) {
    assert.equal(level.product.insuranceType, "Innbo fritidsbolig");
    assert.equal(level.product.agreementScope, "ordinary");
    assert.equal(fact(level, "innbo.forsikringssted").sources[0].page, 4);
    assert.match(fact(level, "innbo.forsikringssum").value, /summen du velger/);
    const rentLimit = fact(level, "innbo.opphold.grense");
    assert.equal(rentLimit.value, "Inntil " + rent + " kr.");
    assert.deepEqual(rentLimit.sources.map(source => source.page), [12, 13]);
    assert.match(fact(level, "innbo.opphold.dekning").value, /avtales.*på forhånd/);
  }
});

test("Storebrand's holiday exclusions and Super extensions resolve at the exact tier and page", () => {
  for (const [key, page] of [
    ["innbo.penger.dekning", 5],
    ["ansvar.dekning", 24],
    ["rettshjelp.dekning", 27],
    ["idtyveri.dekning", 22],
  ]) {
    for (const level of [standard, superProduct]) {
      assert.equal(fact(level, key).state, "unavailable");
      assert.equal(fact(level, key).sources[0].page, page);
    }
  }
  for (const [key, page] of [
    ["tyveri.utenforhjem.dekning", 17],
    ["uhell.dekning", 18],
    ["skadedyr.dekning", 21],
    ["innbo.gnagerskade.dekning", 22],
  ]) {
    assert.equal(fact(standard, key).state, "unavailable");
    assert.equal(fact(superProduct, key).state, "included");
    assert.equal(fact(superProduct, key).sources[0].page, page);
    assert.equal(superProduct.facts.filter(row => row.key === key).length, 1);
  }
});

test("Storebrand holiday sources point only at the two holiday tiers and the verified innbo10 bytes", () => {
  const [archive] = storebrandHolidayContentsArchives;
  const [source] = Object.values(sources);
  assert.deepEqual(archive.sources, [[source.id, "2026-09-20", source.url]]);
  assert.equal(source.sha256, createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex"));
  assert.deepEqual(source.productIds, products.map(product => product.productId));
  assert.equal(productCatalog.products.some(product => source.productIds.includes(product.productId)), false);
  for (const level of [standard, superProduct]) {
    for (const row of level.facts) {
      for (const reference of row.sources) {
        assert.equal(reference.documentId, source.id);
        assert.equal(reference.url, source.url);
        assert.ok(reference.page >= 1 && reference.page <= 31);
      }
    }
  }
});
