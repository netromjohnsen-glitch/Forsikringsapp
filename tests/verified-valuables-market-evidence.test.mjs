import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedValuablesMarketEvidence } from "../lib/verified-valuables-market-evidence.ts";

const choices = productComparisonProducts(market);
const product = id => market.products.find(entry => entry.productId === id);
const theftKey = "verdisak.tyveri";
const lossKey = "verdisak.tap";
const limitKey = "verdisak.grense.biltyveri";
const trygSafetyId = "private-valuables:tryg:safety";

function fact(id, key) {
  const rows = materializeCatalogProduct(product(id), market).facts.filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " " + key);
  return rows[0];
}

function compareRow(first, second, key) {
  return compareCatalogProducts(
    choices.find(entry => entry.productId === first),
    choices.find(entry => entry.productId === second), market,
  ).sections.flatMap(section => section.rows).find(row => row.key === key);
}

function assertPdfSource(source, sourceId, page) {
  assert.equal(source.documentId, sourceId);
  assert.equal(source.page, page);
  assert.equal(termsSourceHref(source), market.sources[sourceId].url + "#page=" + page);
}

test("Verdisak viser tyveri på samme rad hos If, Tryg, Fremtind og Gjensidige", () => {
  for (const [id, page, value, url] of [
    ["if-verdisak", 5, /skal meldes til politiet/u, "https://www.if.no/privat/forsikring/bolig/verdisakforsikring"],
    ["tryg-verdisak", 1, /Sikkerhetsforskriftene gjelder/u, "https://www.tryg.no/forsikringer/bolig-og-innbo/verdigjenstandsforsikring"],
    ["fremtind-verdisak", 1, /skadeårsaken er kjent.*bestemt tidspunkt/u],
  ]) {
    const row = compareRow(id, "gjensidige-verdisak-standard", theftKey);
    assert.equal(row.first.state, "included");
    assert.equal(row.second.state, "included");
    assert.match(row.first.text, value);
    assertPdfSource(row.first.sources[0], product(id).sourceId, page);
    if (url) {
      const source = row.first.sources[1];
      assert.equal(source.page, 0);
      assert.equal(market.sources[source.documentId].sourceType, "product_page");
      assert.equal(termsSourceHref(source), url);
    }
    assert.ok(productCatalog.facts[product(id).sourceId].every(entry => entry.key !== theftKey));
  }
});

test("Tryg skiller tap av verdisak fra tyveri og viser tilsynskravet samtidig", () => {
  const row = compareRow("tryg-verdisak", "gjensidige-verdisak-standard", lossKey);
  assert.equal(row.first.state, "included");
  assert.equal(row.second.state, "unavailable");
  assert.match(row.first.text, /mistet eller gjenglemt.*tilsyn eller innlåsing.*skadeforløpet og skyldgraden/u);
  const [sales, safety] = row.first.sources;
  assert.equal(sales.page, 0);
  assert.equal(market.sources[sales.documentId].sourceType, "product_page");
  assertPdfSource(safety, trygSafetyId, 1);
  assert.equal(compareRow("tryg-verdisak", "frende-verdisak", lossKey).second.state, "unknown");
});

test("Fremtind og Storebrand viser når biltyveri har grense på 10 000 kr per skadetilfelle", () => {
  const first = "fremtind-verdisak";
  const second = "storebrand-verdisak";
  const row = compareRow(first, second, limitKey);
  for (const side of [row.first, row.second]) {
    assert.match(side.text, /10 000 kr per skadetilfelle.*kupé om natten.*mer enn ett døgn/u);
  }
  assertPdfSource(row.first.sources[0], product(first).sourceId, 1);
  assertPdfSource(row.second.sources[0], product(second).sourceId, 4);
  assert.equal(fact(first, theftKey).state, "included");
  assert.equal(fact(second, theftKey).state, "included");
});

test("Verdisakrettingene er bundet til gjeldende PDF-utgaver og markedskomponenter", () => {
  for (const [id, key] of [
    ["if-verdisak", theftKey], ["tryg-verdisak", theftKey], ["fremtind-verdisak", theftKey], ["storebrand-verdisak", limitKey],
  ]) {
    const component = product(id).sourceId;
    const document = market.sources[component];
    const path = "catalog/sources/private-valuables/" + document.filename;
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), document.sha256);
    const facts = { ...productCatalog.facts };
    const sources = { ...market.sources, [component]: { ...document, sha256: "annen-utgave" } };
    addVerifiedValuablesMarketEvidence(sources, facts, market.products);
    assert.equal(facts[component], productCatalog.facts[component]);
    assert.equal(fact(id, key).sources[0].documentId, component);
  }

  const safety = market.sources[trygSafetyId];
  const path = "catalog/sources/private-valuables/" + safety.filename;
  assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), safety.sha256);
  const sources = { ...market.sources, [safety.id]: { ...safety, sha256: "annen-utgave" } };
  const facts = { ...productCatalog.facts };
  addVerifiedValuablesMarketEvidence(sources, facts, market.products);
  assert.equal(facts[product("tryg-verdisak").sourceId], productCatalog.facts[product("tryg-verdisak").sourceId]);
});
