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

test("DNB markets both covers as included in Bobil Topp, with separate applicable Fremtind terms", () => {
  for (const [key, slug, termsNumber] of [
    ["leiebil.dekning", "leiebil", "PMO-350.402-004"],
    ["maskinskade.dekning", "maskinskade", "PMO-350.201-002"],
  ]) {
    const topp = fact("Topp", key);
    assert.equal(topp.state, "included");
    assert.deepEqual(topp.addOnNames, []);
    assert.equal(topp.sources[0].termsNumber, termsNumber);
    assert.equal(termsSourceHref(topp.sources[0]), "/api/vilkar/fremtind/bobil-" + slug + "-20260924#page=1");
    const offer = topp.sources[1];
    assert.equal(offer.sourceType, "product_page");
    assert.equal(offer.company, "DNB");
    assert.equal(termsSourceHref(offer), "https://www.dnb.no/forsikring/kjoretoy/bobilforsikring");
    const kasko = fact("Kasko", key);
    assert.equal(kasko.state, "optional");
    assert.equal(kasko.sources.length, 1);
    assert.equal(fact("Minikasko", key), undefined);
  }
  assert.equal(fact("Topp", "leiebil.dager").value, "Normal reparasjonstid, inntil 45 dager");
  assert.equal(fact("Topp", "leiebil.dagsgrense").value, "Inntil 600 kr per dag");
  assert.match(fact("Topp", "maskinskade.begrensning").value, /fører til eller skyldes forhøyet oljeforbruk/);
  assert.equal(termsSourceHref(fact("Topp", "maskinskade.egenandel.kilometer").sources[0]), "/api/vilkar/fremtind/bobil-maskinskade-20260924#page=2");
  assert.match(fact("Topp", "maskinskade.km").value, /200 000 km/);
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
