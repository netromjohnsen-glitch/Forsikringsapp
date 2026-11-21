import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { alignComparisonRow } from "../lib/catalog-comparison-row-alignment.ts";
import { resolveCatalogFacts } from "../lib/product-catalog.ts";
import { trygHusFacts } from "../lib/tryg-hus-catalog.ts";

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

test("NITO Hus Ekstra har minst like mange hus-sammenligningsnøkler som Tryg Hus Ekstra bygningsvilkår", () => {
  const nitoKeys = alignedKeys("tryg-nito-hus-ekstra");
  const trygBuildingKeys = new Set(trygHusFacts.trygHusExtra.map((fact) => fact.key));
  const comparable = [...nitoKeys].filter((key) => key.startsWith("hus."));
  assert.ok(
    comparable.length >= trygHusFacts.trygHusExtra.length,
    `NITO Ekstra ${comparable.length} sammenlignbare nøkler, Tryg bygningskatalog ${trygHusFacts.trygHusExtra.length}`,
  );
  const missing = [...trygBuildingKeys].filter((key) => !nitoKeys.has(key));
  assert.deepEqual(missing.sort(), ["hus.ror.frost"].sort());
});

test("NITO Hus Ekstra mot Landkreditt hus har dokumenterte kjernerader", () => {
  const comparison = rows("tryg-nito-hus-ekstra", "landkreditt-hus-standard");
  const byKey = new Map(comparison.map((row) => [row.key, row]));
  const requireBoth = [
    "hus.brann.dekning",
    "hus.naturskade.dekning",
    "hus.ansvar.dekning",
    "hus.rettshjelp.dekning",
    "hus.egenandel.generell",
  ];
  for (const key of requireBoth) {
    const row = byKey.get(key);
    assert.ok(row, key);
    assert.notEqual(row.first.state, "unknown", `NITO ${key}`);
    assert.notEqual(row.second.state, "unknown", `Landkreditt ${key}`);
  }
  const vannKey = ["hus.vann.utstromming", "hus.vann.terreng", "hus.ror.brudd"].find(
    (key) => byKey.get(key)?.first.state !== "unknown" && byKey.get(key)?.second.state !== "unknown",
  );
  assert.ok(vannKey, "Forventer minst én dokumentert vannskaderad på begge sider");
});

test("NITO Hus Ekstra materialisering inkluderer forsikringsform og brann", () => {
  const facts = materializeCatalogProduct(product("tryg-nito-hus-ekstra"), marketProductCatalog).facts;
  assert.ok(facts.length >= 60, `Faktatelling ${facts.length}`);
  assert.ok(facts.some((fact) => fact.key === "hus.forsikringsform"));
  assert.ok(facts.some((fact) => fact.key === "hus.brann.dekning"));
});