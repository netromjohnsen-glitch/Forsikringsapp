import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import {
  compareCatalogProducts, materializeCatalogProduct, productComparisonProducts,
} from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const market = marketProductCatalog;
const eligible = productComparisonProducts(market);
const find = (id) => {
  const product = eligible.find((entry) => entry.productId === id);
  assert.ok(product, id);
  return product;
};
const byKey = (result) => new Map(result.sections.flatMap((section) => section.rows).map((row) => [row.key, row]));

test("Utdanningsforbundet Delkasko shares documented dimension rows and preserves its own variant values", () => {
  const member = find("tryg-utdanningsforbundet-bil-delkasko");
  assert.equal(member.version, "2026-07-01");
  const peer = find("if-bil-delkasko");
  const rows = byKey(compareCatalogProducts(member, peer, market));
  const reverse = byKey(compareCatalogProducts(peer, member, market));
  const sourceRoot = "/api/vilkar/tryg/utdanningsforbundet-bil-delkasko-2026-07";
  for (const [key, pattern, pages] of [
    ["brann.dekning", /åpen flamme, eksplosjon eller lynnedslag/u, [1]],
    ["tyveri.dekning", /brukstyveri.*tyveriforsøk/u, [1]],
    ["glass.dekning", /glassruter, inkludert glasstak.*avtaleverksteder/u, [1]],
    ["veihjelp.dekning", /hjemreise for fører, passasjerer og bagasje.*tomt drivstoff eller batteri/u, [1, 2]],
    ["natur.dekning", /stormflo.*meteorittnedslag.*vulkanutbrudd/u, [2]],
  ]) {
    const row = rows.get(key);
    assert.equal(row.first.state, "included", key);
    assert.equal(row.second.state, "included", key);
    assert.match(row.first.text, pattern, key);
    assert.deepEqual(row.first.sources.map(termsSourceHref), pages.map((page) => sourceRoot + "#page=" + page), key);
    assert.ok(row.first.sources.every((source) => source.agreementScope === "utdanningsforbundet" &&
      source.termsNumber === "PAU25945" && source.effectiveFrom === "2026-07-01"), key);
    assert.deepEqual(reverse.get(key).first, row.second, key);
    assert.deepEqual(reverse.get(key).second, row.first, key);
  }
  assert.ok(!rows.has("bil.naturskade"), "old UDF-only row is replaced");
  for (const [key, amount] of [["glass.egenandel.bytte", "3 000 kr"], ["glass.egenandel.reparasjon", "0 kr"]]) {
    assert.equal(rows.get(key).first.text, amount, key);
    assert.deepEqual(rows.get(key).first.sources.map(termsSourceHref), [sourceRoot + "#page=1"], key);
  }
  assert.ok(!rows.get("glass.egenandel")?.first.facts.length);
  assert.match(rows.get("glass.unntak").first.text, /ripete til å bli godkjent ved EU-kontroll/u);
  assert.match(rows.get("veihjelp.egenandel").first.text, /500 kr/u);
  assert.match(rows.get("veihjelp.transport.grense").first.text, /50 % av kjøretøyets verdi/u);
});

test("the active UDF evidence stays in its market component and does not alter the raw customer lookup", () => {
  const member = find("tryg-utdanningsforbundet-bil-delkasko");
  const documentId = "tryg-utdanningsforbundet-bil-delkasko-terms";
  const raw = materializeCatalogProduct(member, productCatalog).facts;
  assert.ok(raw.some((fact) => fact.key === "bil.naturskade"));
  assert.ok(!raw.some((fact) => fact.key === "glass.dekning"));
  for (const id of ["bil-delkasko", "tryg-nito-bil-delkasko"]) {
    const product = find(id);
    const comparison = materializeCatalogProduct(product, market);
    assert.ok(!comparison.facts.some((fact) => fact.sources.some((source) => source.documentId === documentId)), id);
  }
});

test("multiple source controls for one If rider state their individual pages before expansion", async () => {
  const require = createRequire(import.meta.url);
  const componentPath = new URL("../app/components/product-comparison.tsx", import.meta.url);
  const root = new URL("../", import.meta.url);
  const source = readFileSync(componentPath, "utf8");
  const compiled = ts.transpileModule(source + "\nexport { ProductResult };", { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const resolved = compiled.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_match, specifier) =>
    "from " + JSON.stringify(specifier.startsWith("@/")
      ? new URL(specifier.slice(2) + ".ts", root).href : pathToFileURL(require.resolve(specifier)).href));
  const { ProductResult } = await import("data:text/javascript;base64," + Buffer.from(resolved).toString("base64"));
  const result = compareCatalogProducts(find("if-person-kritisk"), find("tryg-person-kritisk"), market);
  const html = renderToStaticMarkup(React.createElement(ProductResult, { result }));
  const controls = [...html.matchAll(/<summary aria-label="(Vis kilde: Beregning av uførekapital ved kritisk sykdom – Produkt A[^"]*)"[^>]*>([^<]+)<\/summary>/gu)];
  assert.equal(controls.length, 2);
  assert.notEqual(controls[0][1], controls[1][1]);
  assert.ok(controls.every(control => !/punkt punkt/iu.test(control[1])));
  for (const page of [4, 9]) {
    assert.ok(controls.some((control) => control[1].includes("side " + page) &&
      control[2] === "Vis kilde · Offentlig vilkår · side " + page), String(page));
  }
});
