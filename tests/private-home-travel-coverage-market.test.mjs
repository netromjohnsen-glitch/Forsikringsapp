import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { privateHomeTravelCoverageArchives } from "../lib/private-home-travel-coverage-market.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const product = id => marketProductCatalog.products.find(item => item.productId === id);
const compare = (first, second, key) => compareCatalogProducts(product(first), product(second), marketProductCatalog)
  .sections.flatMap(section => section.rows).find(row => row.key === key);
const fact = (id, key, catalog = marketProductCatalog) =>
  materializeCatalogProduct(product(id), catalog).facts.find(item => item.key === key);
const sourceLink = entry => termsSourceHref(entry.sources[0]);

test("the private travel market compares mobile-phone, cancellation and interrupted-travel limits", () => {
  const standard = "watercircles-reise-standard";
  const elite = "watercircles-reise-elite";
  const mobile = compare(standard, elite, "reise.bagasje.mobil");
  assert.match(mobile.first.text, /5 000 kr/u);
  assert.match(mobile.second.text, /40 000 kr/u);
  assert.equal(sourceLink(mobile.first), "/api/vilkar/watercircles/reise-2-17#page=8");
  const cancellation = compare(standard, elite, "reise.avbestilling.sum");
  assert.match(cancellation.first.text, /40 000 kr per person og 100 000 kr per familie/u);
  assert.match(cancellation.second.text, /reisens pris/u);
  assert.equal(sourceLink(cancellation.second), "/api/vilkar/watercircles/reise-2-17#page=5");

  const landkreditt = "landkreditt-reise";
  const deductible = fact(landkreditt, "reise.bagasje.mobil_egenandel");
  assert.match(deductible.value, /1 000 kr/u);
  assert.equal(sourceLink(deductible), "/api/vilkar/landkreditt/reise#page=5");
  assert.match(fact(landkreditt, "reise.reiseavbrudd.medreisende").value, /35 000 kr/u);
  assert.equal(sourceLink(fact(landkreditt, "reise.reiseavbrudd.medreisende")), "/api/vilkar/landkreditt/reise#page=11");
  assert.equal(sourceLink(fact(landkreditt, "reise.rettshjelp.sum")), "/api/vilkar/landkreditt/reise#page=16");
  assert.equal(fact(landkreditt, "reise.bagasje.mobil_egenandel", productCatalog), undefined);
});

test("the private contents and cabin market keeps higher-tier benefits scoped", () => {
  const freezer = compare("watercircles-innbo-standard", "watercircles-innbo-elite", "innbo.fryserinnhold.grense");
  assert.match(freezer.first.text, /10 000 kr/u);
  assert.match(freezer.second.text, /ingen særskilt beløpsgrense/iu);
  assert.equal(sourceLink(freezer.first), "/api/vilkar/watercircles/innbo-2-17#page=5");
  assert.equal(sourceLink(freezer.second), "/api/vilkar/watercircles/innbo-2-17#page=13");

  const cabin = "gjensidige-hytte-standard";
  const plus = "gjensidige-hytte-pluss";
  for (const [id, slug] of [[cabin, "hytte-standard-alminnelige"], [plus, "hytte-pluss-alminnelige"]]) {
    assert.equal(sourceLink(fact(id, "hytte.naturskade.egenandel")), "/api/vilkar/gjensidige/" + slug + "#page=1");
  }
  const rot = compare(cabin, plus, "hytte.rate.egenandel");
  assert.equal(rot.first.state, "unknown");
  assert.match(rot.second.text, /6 000 kr/u);
  assert.equal(sourceLink(rot.second), "/api/vilkar/gjensidige/hytte-pluss-alminnelige#page=1");
  assert.equal(fact(plus, "hytte.rate.egenandel", productCatalog), undefined);
});

test("registered market archive routes use existing exact PDF bytes", () => {
  assert.equal(privateHomeTravelCoverageArchives.length, 9);
  for (const { archivePath, sources } of privateHomeTravelCoverageArchives) {
    const bytes = readFileSync(new URL("../" + archivePath, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), productCatalog.sources[sources[0][0]].sha256);
  }
});
