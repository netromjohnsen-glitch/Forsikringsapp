import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { alignComparisonRow } from "../lib/catalog-comparison-row-alignment.ts";
import { resolveCatalogFacts } from "../lib/product-catalog.ts";
import { trygFacts } from "../lib/tryg-catalog.ts";

const catalog = new Map(productComparisonProducts(marketProductCatalog).map((entry) => [entry.productId, entry]));
const product = (id) => {
  const entry = catalog.get(id);
  assert.ok(entry, id);
  return entry;
};
const rows = (first, second) =>
  compareCatalogProducts(product(first), product(second), marketProductCatalog).sections.flatMap((section) => section.rows);
const alignedKeys = (id) => {
  const variant = product(id);
  return new Set(
    resolveCatalogFacts(variant, []).map((fact) => alignComparisonRow(variant, { key: fact.key, label: fact.label }).key),
  );
};
const trygDelkaskoKeys = new Set(
  [...trygFacts.ansvar, ...trygFacts.delkasko].map((fact) => fact.key),
);
const trygKaskoKeys = new Set(trygFacts.kasko.map((fact) => fact.key));

test("NITO Bil Delkasko har minst like mange sammenligningsnøkler som Tryg Delkasko", () => {
  const nitoKeys = alignedKeys("tryg-nito-bil-delkasko");
  assert.ok(
    nitoKeys.size >= trygDelkaskoKeys.size,
    `NITO Delkasko ${nitoKeys.size} nøkler, Tryg ${trygDelkaskoKeys.size}`,
  );
});

test("NITO Bil Kasko har minst like mange sammenligningsnøkler som Tryg Kasko", () => {
  const nitoKeys = alignedKeys("tryg-nito-bil-kasko");
  assert.ok(
    nitoKeys.size >= trygKaskoKeys.size,
    `NITO Kasko ${nitoKeys.size} nøkler, Tryg ${trygKaskoKeys.size}`,
  );
});

test("NITO Bil Delkasko mot Landkreditt bil har dokumenterte kjernerader", () => {
  const comparison = rows("tryg-nito-bil-delkasko", "landkreditt-bil-delkasko");
  const byKey = new Map(comparison.map((row) => [row.key, row]));
  const requireBoth = [
    "ansvar.dekning",
    "brann.dekning",
    "tyveri.dekning",
    "glass.dekning",
    "brann.egenandel",
    "veihjelp.dekning",
  ];
  for (const key of requireBoth) {
    const row = byKey.get(key);
    assert.ok(row, key);
    assert.notEqual(row.first.state, "unknown", `NITO ${key}`);
    assert.notEqual(row.second.state, "unknown", `Landkreditt ${key}`);
  }
});

test("NITO Bil Kasko mot If bil har dokumentert kasko og egenandel", () => {
  const comparison = rows("tryg-nito-bil-kasko", "if-bil-kasko");
  const byKey = new Map(comparison.map((row) => [row.key, row]));
  for (const key of ["kasko.dekning", "kasko.egenandel", "brann.dekning", "veihjelp.dekning"]) {
    const row = byKey.get(key);
    assert.ok(row, key);
    assert.notEqual(row.first.state, "unknown", `NITO ${key}`);
    assert.notEqual(row.second.state, "unknown", `If ${key}`);
  }
});

test("Utdanningsforbundet Bil Delkasko har minst like mange sammenlignbare nøkler som Tryg Delkasko", () => {
  const udfKeys = alignedKeys("tryg-utdanningsforbundet-bil-delkasko");
  assert.ok(
    udfKeys.size >= trygDelkaskoKeys.size,
    `UDF Delkasko ${udfKeys.size}, Tryg ${trygDelkaskoKeys.size}`,
  );
});

test("Utdanningsforbundet Bil Delkasko mot Landkreditt bil har dokumenterte kjernerader", () => {
  const comparison = rows("tryg-utdanningsforbundet-bil-delkasko", "landkreditt-bil-delkasko");
  const byKey = new Map(comparison.map((row) => [row.key, row]));
  for (const key of ["ansvar.dekning", "brann.dekning", "tyveri.dekning", "glass.dekning", "veihjelp.dekning"]) {
    const row = byKey.get(key);
    assert.ok(row, key);
    assert.notEqual(row.first.state, "unknown", `UDF ${key}`);
    assert.notEqual(row.second.state, "unknown", `Landkreditt ${key}`);
  }
});

test("NITO Bil Ekstra materialisering inkluderer parkeringsskade og leiebil", () => {
  const facts = materializeCatalogProduct(product("tryg-nito-bil-ekstra"), marketProductCatalog).facts;
  assert.ok(facts.length >= 20, `Faktatelling ${facts.length}`);
  assert.ok(facts.some((fact) => fact.key === "bil.parkeringsskade" || fact.key === "bonus.parkert"));
  assert.ok(facts.some((fact) => fact.key === "bil.leiebil" || fact.key.startsWith("leiebil.")));
});