import assert from "node:assert/strict";
import test from "node:test";
import { catalogProductIdentity, findCatalogProduct, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { compareCatalogProducts, findProductComparisonProduct, productComparisonOptions } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const scopes = { insuranceType: "Båt", agreementScope: "ordinary" };
const market = productComparisonOptions("Båt", "Tryg", "ordinary", marketProductCatalog);
const forEdition = name => market.find(product => product.name === name);

test("the current private market lists Tryg's four advertised products and retains exact archived agreement lookup", () => {
  assert.deepEqual(market.map(product => product.name), ["Ansvar", "Brann/Tyveri/Ansvar", "Kasko/Ansvar", "Båt Ekstra"]);
  for (const product of market) {
    assert.equal(product.version, "2026-09-01");
    assert.deepEqual(findProductComparisonProduct(catalogProductIdentity(product), marketProductCatalog), product);
  }
  const previous = findCatalogProduct("tryg", "tryg-bat-kasko-ansvar", "2024-07-01", scopes);
  assert.ok(previous);
  assert.equal(findProductComparisonProduct(catalogProductIdentity(previous), marketProductCatalog), null);
  const oldTransport = resolveCatalogFacts(previous, []).find(fact => fact.key === "bat.transport.dekning");
  assert.equal(termsSourceHref(oldTransport.source), "/api/vilkar/tryg/bat-kasko-innenbord-2024-07#page=3");
  for (const product of productCatalog.products.filter(product => product.insuranceType === "Båt" && (product.providerId !== "tryg" || product.agreementScope !== "ordinary"))) {
    assert.ok(marketProductCatalog.products.includes(product));
  }
});

test("current Tryg transport and optional conditions display their exact current PDF editions and pages", () => {
  const comparison = compareCatalogProducts(forEdition("Kasko/Ansvar"), forEdition("Båt Ekstra"), marketProductCatalog);
  const rows = comparison.sections.flatMap(section => section.rows);
  const transport = rows.find(row => row.key === "bat.transport.dekning");
  assert.equal(transport.first.state, "included");
  assert.match(transport.first.text, /nærmeste verksted/u);
  assert.match(transport.second.text, /henting eller transport hvis båten må etterlates/u);
  assert.deepEqual(transport.first.sources.map(termsSourceHref), [
    "/api/vilkar/tryg/bat-kasko-innenbord#page=3", "/api/vilkar/tryg/bat-kasko-robat#page=2",
  ]);
  assert.deepEqual(transport.second.sources.map(termsSourceHref), [
    "/api/vilkar/tryg/bat-ekstra#page=1", "/api/vilkar/tryg/bat-kasko-innenbord#page=3",
  ]);
  const limit = rows.find(row => row.key === "bat.transport.grense").second;
  assert.match(limit.text, /20 % .*100 000 kr/u);
  assert.equal(termsSourceHref(limit.sources[0]), "/api/vilkar/tryg/bat-ekstra#page=2");
  const deductible = rows.find(row => row.key === "bat.redning.egenandel").first;
  assert.match(deductible.text, /500 kr/u);
  assert.ok(deductible.sources.every(source => source.page === 3));
  assert.equal(rows.find(row => row.key === "bat.maskinskade.dekning").first.state, "optional");
  assert.equal(rows.find(row => row.key === "bat.ulykke.dekning").second.state, "optional");
  assert.ok(rows.flatMap(row => [...row.first.sources, ...row.second.sources])
    .every(source => source.agreementScope === "ordinary" && source.effectiveFrom !== "2024-07-01" && termsSourceHref(source).startsWith("/api/vilkar/")));
});

test("base market products link to the current September IPID and Storebrand retains the official båt03 source", () => {
  const ansvar = forEdition("Ansvar");
  const brann = forEdition("Brann/Tyveri/Ansvar");
  const comparison = compareCatalogProducts(ansvar, brann, marketProductCatalog);
  const rows = comparison.sections.flatMap(section => section.rows);
  assert.equal(rows.find(row => row.key === "bat.brann.dekning").first.state, "unknown");
  const fire = rows.find(row => row.key === "bat.brann.dekning").second;
  assert.equal(fire.state, "included");
  assert.equal(fire.sources[0].effectiveFrom, "2026-09-01");
  assert.equal(termsSourceHref(fire.sources[0]), "/api/vilkar/tryg/bat-ipid-2026-09#page=1");
  for (const product of productComparisonOptions("Båt", "Storebrand", "ordinary", marketProductCatalog)) {
    const geography = resolveCatalogFacts(product, [], new Date(), null, marketProductCatalog).find(fact => fact.key === "bat.geografi.omrade");
    assert.equal(geography.source.effectiveFrom, "2024-09-01");
    assert.equal(termsSourceHref(geography.source), "/api/vilkar/storebrand/bat#page=5");
  }
});
