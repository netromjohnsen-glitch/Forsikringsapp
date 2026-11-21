import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const market = marketProductCatalog;
const products = new Map(productComparisonProducts(market).map(product => [product.productId, product]));

function comparisonRows(firstId, secondId) {
  const result = compareCatalogProducts(products.get(firstId), products.get(secondId), market);
  return new Map(result.sections.flatMap(section => section.rows).map(row => [row.key, row]));
}

function expectTerms(firstId, secondId, expectations) {
  const forward = comparisonRows(firstId, secondId);
  const reverse = comparisonRows(secondId, firstId);
  for (const [key, value, documentId, pages, scope, counterpartyState = "included"] of expectations) {
    const row = forward.get(key);
    assert.ok(row, `${firstId} ${key}`);
    assert.equal(row.first.state, "included", key);
    assert.equal(row.second.state, counterpartyState, key);
    assert.match(row.first.text, value, key);
    assert.deepEqual(row.first.sources.map(source => [source.documentId, source.page, source.agreementScope]),
      pages.map(page => [documentId, page, scope]), key);
    assert.ok(row.first.sources.every(source => termsSourceHref(source).endsWith(`#page=${source.page}`)), key);
    assert.deepEqual(row.first, reverse.get(key).second, key);
  }
}

for (const [scope, variant, sourceId, deductible] of [
  ["nito", "bil-kasko", "tryg-nito-bil-kasko-terms", /2 000 kr/u],
  ["nito", "bil-ekstra", "tryg-nito-bil-market-kasko", /2 000 kr/u],
  ["nito", "elbil-ekstra", "tryg-nito-bil-market-kasko", /2 000 kr/u],
  ["utdanningsforbundet", "bil-ekstra", "tryg-utdanningsforbundet-bil-market-kasko", /0 kr.*dokumenteres/u],
  ["utdanningsforbundet", "elbil-ekstra", "tryg-utdanningsforbundet-bil-market-kasko", /0 kr.*dokumenteres/u],
]) {
  const id = `tryg-${scope}-${variant}`;
  test(id + " compares its actual Kasko deductible and bonus on the ordinary collision rows", () => {
    expectTerms(id, "bil-kasko", [
      ["kasko.egenandel.dyr", deductible, sourceId, [1], scope],
      ["kasko.dyr.bonus", /Ingen bonustap.*politi eller viltnemnd.*dokumenteres/u, sourceId, [1], scope],
    ]);
    const rows = comparisonRows(id, "bil-kasko");
    assert.ok(!rows.has("kasko.dyr") && !rows.has("kasko.skadedyr.dekning"));
    assert.ok(!comparisonRows(`tryg-${scope}-bil-delkasko`, `tryg-${scope}-bil-delkasko`).has("kasko.egenandel.dyr"));
  });
}

for (const [scope, ordersPage, standardLimitPage, usePage, extraAdaptationPage] of [
  ["nito", 2, 2, 2, 2],
  ["utdanningsforbundet", 5, 6, 6, 9],
]) {
  for (const extra of [false, true]) {
    const variant = extra ? "hus-ekstra" : "hus";
    const id = `tryg-${scope}-${variant}`;
    const sourceId = id + "-terms";
    test(id + " aligns public orders, loss of use and variant-specific terms", () => {
      const expectations = [
        ["hus.brukstap.dekning", /ubeboelig.*tapt husleie.*normal/u, sourceId, [usePage], scope],
        ["hus.pabud.dekning", /reparasjon eller gjenoppføring.*unntatt/u, sourceId, scope === "nito" ? [2] : [5, 6], scope],
        ["hus.pabud.grense", extra ? /1 000 000 kr for fredede bygninger/u : /2 000 000 kr.*førsterisiko.*20 %/u,
          sourceId, [extra ? ordersPage : standardLimitPage], scope],
      ];
      if (extra) expectations.push(
        ["hus.tilpasning.grense", /250 000 kr.*50 %.*barn/u, sourceId, [extraAdaptationPage], scope],
        ["hus.brann.dekning", /brann der ild er kommet løs/u, sourceId, [scope === "nito" ? 3 : 6], scope],
      );
      expectTerms(id, "tryg-" + variant, expectations);
      if (!extra) assert.ok(!comparisonRows(id, id).has("hus.tilpasning.grense"));
    });
  }
}

for (const [scope, variant, money, glassPages, lodgingPage] of [
  ["nito", "innbo", /40 000 kr/u, [9, 10], 7],
  ["nito", "innbo-student", /40 000 kr/u, [9], 7],
  ["nito", "innbo-fritidsbolig", /40 000 kr/u, [9], 7],
  ["utdanningsforbundet", "innbo", /20 000 kr.*bare ved veskenapping/u, [11], 8],
]) {
  const id = `tryg-${scope}-${variant}`;
  const sourceId = id + "-terms";
  const holiday = variant === "innbo-fritidsbolig";
  const control = holiday ? "tryg-innbo-fritidsbolig-ekstra" : "if-innbo-super";
  test(id + " aligns documented amounts and repair-time lodging under its own policy", () => {
    const expectations = [
      ["innbo.penger.grense", money, sourceId, scope === "nito" ? [7] : [7, 9], scope],
      ["innbo.datalager.grense", /50 000 kr.*manuskripter/u, sourceId, [6], scope],
      [holiday ? "innbo.opphold.dekning" : "innbo.opphold.grense",
        holiday ? /utenfor fritidsboligen.*reparasjonstid.*én uke/u : /utenfor hjemmet.*reparasjonstid.*én uke/u,
        sourceId, [lodgingPage], scope, holiday ? "unavailable" : "included"],
    ];
    expectTerms(id, control, expectations);
    expectTerms(id, id, [
      ["glass.sanitaer.dekning", /bruddskade.*sanitærporselen.*integrerte hvitevarer/u, sourceId, glassPages, scope],
    ]);
    if (scope === "utdanningsforbundet") expectTerms(id, id, [
      ["innbo.ombygging.grense", /250 000 kr.*egen eid bolig.*50 %/u, sourceId, [13], scope],
    ]);
  });
}
