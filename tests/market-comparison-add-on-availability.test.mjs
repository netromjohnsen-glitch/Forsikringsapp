import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { isReviewedMarketExclusion } from "../lib/catalog-market-coverage-exclusions.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function product(id, catalog = market) {
  const match = catalog.products.find(p => p.productId === id);
  assert.ok(match, id);
  return match;
}

function row(result, key) {
  const match = result.sections.flatMap(section => section.rows).find(candidate => candidate.key === key);
  assert.ok(match, key);
  return match;
}

const get = (id, key, catalog = market) => {
  const entry = product(id, catalog);
  return row(compareCatalogProducts(entry, entry, catalog), key).first;
};
const documents = (value) => value.sources.map(({ documentId, page }) => [documentId, page]);

for (const [id, addOn, doc, page, extraDoc, extraPage] of [
  ["tryg-hus", "Råte- og skadedyr", "trygHus", 4, "trygHusRot", 1],
  ["tryg-hus-ekstra", "Råte- og skadedyr", "trygHusExtra", 4, "trygHusRot", 1],
  ["fremtind-hus-standard", "Sopp, råte og insekter", "fremtindHusStandard", 4, "fremtindHusRot", 1],
  ["fremtind-hus-topp", "Sopp, råte og insekter", "fremtindHusStandard", 4, "fremtindHusRot", 1],
  ["frende-hus-standard", "Råte- og skadedyrsforsikring", "frendeHusStandard:2026-11-20", 4, "frendeHusRot:2026-11-20", 13],
  ["frende-hus-utvidet", "Råte- og skadedyrsforsikring", "frendeHusStandard:2026-11-20", 4, "frendeHusRot:2026-11-20", 13],
]) {
  test(id + " keeps the exclusion in the base policy and names the documented add-on", () => {
    const value = get(id, "hus.rate.dekning");
    assert.equal(value.state, "optional");
    assert.equal(value.text.split(" – ")[0], "Tilgjengelig som tillegg (" + addOn + ")");
    assert.match(value.text, /(?:råtesopp|ekte hussopp).*unntatt/iu);
    assert.doesNotMatch(value.text, /^✓ Inkludert/u);
    assert.deepEqual(documents(value), [[extraDoc, extraPage], [doc, page]]);
    assert.deepEqual(value.facts.map(f => f.state), ["optional", "unavailable"]);
    const before = get(id, "hus.rate.dekning", raw);
    assert.equal(before.state, "included");
    assert.match(before.text, /^✓ Inkludert.*unntatt/u, "historical raw contract remains stable");
  });
}

test("market comparison exposes relevant pest, rental and travel accident add-ons without implying selection", () => {
  for (const [id, key, details, addOnDoc] of [
    ["tryg-hus", "hus.skadedyr.bygningsskade", /Bygningsskade fra dyr/, "trygHusRot"],
    ["fremtind-hus-standard", "hus.skadedyr.bekjempelse", /Bekjempelse av insekter/, "fremtindHusRot"],
    ["fremtind-hus-standard", "hus.skadedyr.bygningsskade", /fysisk skade.*lukt fra insekter/iu, "fremtindHusRot"],
    ["frende-hus-standard", "hus.utleie.skadeverk", /500 000 kr samlet per 12 måneder/, "frendeHusRental:2026-11-20"],
    ["frende-hus-utvidet", "hus.utleie.skadeverk", /500 000 kr samlet per 12 måneder/, "frendeHusRental:2026-11-20"],
    ["tryg-reise", "reise.ulykke.dekning", /Tilgjengelig som tillegg \(Ulykke\).*medisinsk invaliditet/, "trygReiseAccident"],
    ["tryg-reise-ekstra", "reise.ulykke.dekning", /Tilgjengelig som tillegg \(Ulykke Ekstra\).*medisinsk invaliditet/, "trygReiseAccident"],
  ]) {
    const value = get(id, key);
    assert.equal(value.state, "optional", id);
    assert.match(value.text, details, id);
    assert.deepEqual(value.facts.map(f => f.state), ["optional", "unavailable"], id);
    assert.equal(value.sources[0].documentId, addOnDoc, id);
  }
  assert.equal(get("tryg-reise-premium", "reise.ulykke.dekning").state, "included");
  assert.equal(get("tryg-reise", "reise.ulykke.dekning", raw).state, "unavailable");
  assert.equal(get("if-reise-basis", "reise.leiebil.egenandel").state, "unavailable");
  assert.equal(get("gjensidige-hus", "hus.rate.dekning").state, "optional");
});

test("different base and optional coverage on the same row keeps both values, source sets and comparison differences", () => {
  for (const [id, key, baseAmount, optionAmount, optionDocs] of [
    ["bil-kasko", "tilbehor.grense", /10 000 kr/, /50 000 kr/, [["bilEkstra", 1], ["elbilEkstra", 1]]],
    ["bil-kasko", "nyverdi.alder", /Innen 1 år/, /Innen 3 år/, [["bilEkstra", 2], ["elbilEkstra", 2]]],
    ["bil-kasko", "nyverdi.km", /15 000 km/, /60 000 km/, [["bilEkstra", 2], ["elbilEkstra", 2]]],
    ["gj-innbo-pluss", "sykkel.tyveri.grense", /30 000 kr/, /Høyere forsikringssum kan velges/, [["gjInnboSykkelUtvidelse", 1]]],
    ["sparebank1-fremtind-hund-veterin-r", "dyr.diagnostikk.grense", /15 000 kr per forsikringsår/, /ingen egen årsgrense/, [
      ["boat-pet:sparebank1-fremtind:hund", 3], ["boat-pet:sparebank1-fremtind:hund", 1],
    ]],
    ["sparebank1-fremtind-hund-veterin-r", "dyr.allergi.grense", /15 000 kr i løpet av hundens liv/, /ingen egen livstidsgrense/, [
      ["boat-pet:sparebank1-fremtind:hund", 3], ["boat-pet:sparebank1-fremtind:hund", 1],
    ]],
    ["fremtind-hus-topp", "hus.skadedyr.bekjempelse", /påvist aktivitet/, /Bekjempelse av insekter/, [["fremtindHusRot", 1]]],
    ["frende-hus-utvidet", "hus.skadedyr.bekjempelse", /mus og rotter/, /Bekjempelse av skadeinsekter/, [
      ["frendeHusRot:2026-11-20", 3], ["frendeHusPestPage", 1],
    ]],
  ]) {
    const value = get(id, key);
    assert.equal(value.state, "included", key);
    assert.match(value.text, baseAmount, key);
    assert.match(value.optionalAlternative.text, /^Tilgjengelig som tillegg/u, key);
    assert.match(value.optionalAlternative.text, optionAmount, key);
    assert.deepEqual(documents(value.optionalAlternative), optionDocs, key);
  }
  assert.equal(get("bil-kasko", "nyverdi.skadegrad").optionalAlternative, undefined,
    "the same 80% criterion is not repeated");
  const standard = product("gj-innbo");
  const plus = product("gj-innbo-pluss");
  const first = row(compareCatalogProducts(plus, standard, market), "sykkel.tyveri.grense");
  const second = row(compareCatalogProducts(standard, plus, market), "sykkel.tyveri.grense");
  assert.equal(first.first.text, first.second.text, "identical base terms");
  assert.equal(first.different, true, "the optional higher limit is a product difference");
  assert.deepEqual(first.first, second.second);
  assert.deepEqual(first.second, second.first);
});

test("reviewed market exclusion requires the exact original terms wording and locator", () => {
  const fact = raw.facts.trygHus.find(f => f.key === "hus.rate.dekning");
  assert.equal(isReviewedMarketExclusion(fact), true);
  assert.equal(isReviewedMarketExclusion({ ...fact, value: "Ny versjon av vilkåret." }), false);
  assert.equal(isReviewedMarketExclusion({ ...fact, source: { ...fact.source, effectiveFrom: "2027-01-01" } }), false);
  assert.equal(isReviewedMarketExclusion({ ...fact, source: { ...fact.source, page: 5 } }), false);
  const other = materializeCatalogProduct(product("tryg-hus-ekstra"), market).facts.find(f =>
    f.key === "hus.skadedyr.bygningsskade" && f.sources[0].documentId === "trygHusExtra");
  assert.equal(other.state, "included", "a positive base coverage with qualified exceptions stays included");
});

test("the renderer shows the selected base and sourced optional terms together on the same row", async () => {
  const require = createRequire(import.meta.url);
  const componentFile = new URL("../app/components/product-comparison.tsx", import.meta.url);
  const workspace = new URL("../", import.meta.url);
  const source = readFileSync(componentFile, "utf8") + "\nexport { ProductResult };";
  const compiled = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const resolved = compiled.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_match, specifier) =>
    "from " + JSON.stringify(specifier.startsWith("@/")
      ? new URL(specifier.slice(2) + ".ts", workspace).href
      : pathToFileURL(require.resolve(specifier)).href));
  const { ProductResult } = await import("data:text/javascript;base64," + Buffer.from(resolved).toString("base64"));
  const kasko = product("bil-kasko");
  const result = compareCatalogProducts(kasko, kasko, market);
  const display = productComparisonView(result).flatMap(section => section.groups.flatMap(group => group.rows));
  const km = display.find(entry => entry.key === "nyverdi.km");
  const html = renderToStaticMarkup(React.createElement(ProductResult, { result }));
  assert.match(html, /Høyst 15 000 km[\s\S]*Tilgjengelig som tillegg \(Bil Ekstra \/ Elbil Ekstra\) – Høyst 60 000 km/u);
  for (const source of km.first.optionalAlternative.sources) assert.ok(html.includes(termsSourceHref(source)));
  assert.ok(html.includes("– Produkt A – tillegg"));
});
