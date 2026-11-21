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

test("Utdanningsforbundet Hus har minst like mange hus-sammenligningsnøkler som Tryg Hus bygningsvilkår", () => {
  const udfKeys = alignedKeys("tryg-utdanningsforbundet-hus");
  const trygBuildingKeys = new Set(trygHusFacts.trygHus.map((fact) => fact.key));
  const comparable = [...udfKeys].filter((key) => key.startsWith("hus."));
  assert.ok(
    comparable.length >= trygHusFacts.trygHus.length - 1,
    `UDF Hus ${comparable.length} sammenlignbare nøkler, Tryg bygningskatalog ${trygHusFacts.trygHus.length}`,
  );
  const missing = [...trygBuildingKeys].filter((key) => !udfKeys.has(key) && key !== "hus.forsikringssum");
  assert.deepEqual(missing, []);
});

test("Utdanningsforbundet Hus Ekstra har minst like mange hus-sammenligningsnøkler som Tryg Hus Ekstra", () => {
  const udfKeys = alignedKeys("tryg-utdanningsforbundet-hus-ekstra");
  const trygBuildingKeys = new Set(trygHusFacts.trygHusExtra.map((fact) => fact.key));
  const comparable = [...udfKeys].filter((key) => key.startsWith("hus."));
  assert.ok(
    comparable.length >= trygHusFacts.trygHusExtra.length - 2,
    `UDF Ekstra ${comparable.length} sammenlignbare nøkler, Tryg bygningskatalog ${trygHusFacts.trygHusExtra.length}`,
  );
  const missing = [...trygBuildingKeys].filter(
    (key) => !udfKeys.has(key) && !["hus.ror.frost", "hus.forsikringsform", "hus.forsikringssum"].includes(key),
  );
  assert.deepEqual(missing.sort(), []);
});

test("Utdanningsforbundet Hus Ekstra mot Landkreditt hus har dokumenterte kjernerader", () => {
  const comparison = rows("tryg-utdanningsforbundet-hus-ekstra", "landkreditt-hus-standard");
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
    assert.notEqual(row.first.state, "unknown", `UDF ${key}`);
    assert.notEqual(row.second.state, "unknown", `Landkreditt ${key}`);
  }
  const vannKey = ["hus.vann.utstromming", "hus.vann.terreng", "hus.ror.brudd"].find(
    (key) => byKey.get(key)?.first.state !== "unknown" && byKey.get(key)?.second.state !== "unknown",
  );
  assert.ok(vannKey, "Forventer minst én dokumentert vannskaderad på begge sider");
});

test("Utdanningsforbundet Hus Ekstra materialisering inkluderer brann og klimatiltak", () => {
  const facts = materializeCatalogProduct(product("tryg-utdanningsforbundet-hus-ekstra"), marketProductCatalog).facts;
  assert.ok(facts.length >= 58, `Faktatelling ${facts.length}`);
  assert.ok(facts.some((fact) => fact.key === "hus.brann.dekning"));
  assert.ok(facts.some((fact) => fact.key === "hus.gjenoppforing.klimatiltak"));
});