import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { trygSnowMarket as market, trygSnowMarketArchives as archives } from "../lib/tryg-snow-market.ts";

const fact = (tier, key) => market.facts["tryg-snoscooter-" + tier + "-marked"].find(row => row.key === "snoscooter." + key);

test("ordinary market has the three Tryg snowmobile levels and preserves historical choices", () => {
  const choose = catalog => catalog.products.filter(product => product.providerId === "tryg" && product.insuranceType === "Snøscooter");
  assert.deepEqual(choose(marketProductCatalog).map(product => product.name), ["Ansvar", "Brann og tyveri", "Kasko"]);
  assert.deepEqual(choose(marketProductCatalog).map(product => product.version), ["2026-09-01", "2026-10-01", "2026-10-01"]);
  assert.deepEqual(choose(productCatalog).map(product => product.productId), market.replacesProductIds);
  assert.deepEqual(choose(productCatalog).map(product => product.version), [null, null, null]);
  for (const current of choose(marketProductCatalog)) {
    const old = choose(productCatalog).find(product => product.name === current.name);
    const active = resolveCatalogFacts(current, [], new Date("2026-11-19"), null, marketProductCatalog);
    const activeKeys = new Set(active.map(row => row.key));
    for (const legacy of resolveCatalogFacts(old, [], new Date("2026-11-19"), null, productCatalog)) {
      assert.ok(activeKeys.has(legacy.key), current.productId + " " + legacy.key);
    }
    const deductibles = active.filter(row => row.key === "snoscooter.brann.egenandel").map(row => row.value);
    assert.deepEqual(deductibles, current.name === "Ansvar" ? [] : [current.name === "Kasko" ? "4 000 kr" : "6 000 kr"]);
  }
  assert.equal(market.addOns.length, 2);
  for (const option of market.addOns) {
    assert.ok(marketProductCatalog.addOns.some(addOn => addOn.id === option.id));
    assert.deepEqual(option.requiresLevel, market.products.map(product => product.productId));
  }
});

test("Tryg snowmobile market routes every citation to the evidence edition and physical page", () => {
  const bySource = new Map(archives.map(archive => [archive.sources[0][0], archive]));
  for (const [id, source] of Object.entries(market.sources)) {
    const bytes = readFileSync(new URL("../" + bySource.get(id).archivePath, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, id);
  }
  for (const rows of Object.values(market.facts)) {
    for (const row of rows) {
      const { source } = row;
      const archive = bySource.get(source.documentId);
      assert.ok(archive, row.key);
      assert.ok(source.page >= 1 && source.page <= market.sources[source.documentId].physicalPages[1], row.key);
      assert.equal(termsSourceHref(source), "/api/vilkar/tryg/" + archive.slug + "#page=" + source.page, row.key);
    }
  }
});

test("October snowmobile terms give different fire and theft deductibles by tier and update fitted accessory cover", () => {
  for (const cause of ["brann", "tyveri"]) {
    const fire = fact("brann-og-tyveri", cause + ".egenandel");
    assert.equal(fire.value, "6 000 kr");
    assert.equal(fire.source.termsNumber, "PAU26320");
    assert.equal(fire.source.page, 1);
    const kasko = fact("kasko", cause + ".egenandel");
    assert.equal(kasko.value, "4 000 kr");
    assert.equal(kasko.source.termsNumber, "PAU25505");
    assert.equal(kasko.source.page, 1);
  }
  assert.match(fact("kasko", "utstyr.grense").value, /10 000 kr/);
  assert.match(fact("kasko", "redning.begrensning").value, /redning\/veihjelp er unntatt/);
  assert.equal(fact("kasko", "redning.begrensning").source.effectiveFrom, "2026-09-01");
  assert.equal(fact("kasko", "redning.begrensning").source.page, 1);
});
