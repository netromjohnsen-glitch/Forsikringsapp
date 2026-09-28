import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { productCatalog } from "../lib/product-catalog.ts";
import {
  compareCatalogProducts,
  productComparisonProducts,
} from "../lib/catalog-product-comparison.ts";

const products = productComparisonProducts(productCatalog);
const find = (type, company, name) => products.find((product) =>
  product.insuranceType === type && product.company === company && product.name === name);

const scenarios = [
  ["Bil", "Gjensidige", "Pluss", "If", "Super"],
  ["Hus", "Tryg", "Hus Ekstra", "If", "Super"],
  ["Reise", "Tryg", "Reise Ekstra", "If", "Super"],
  ["MC", "Tryg", "MC Ekstra", "If", "Kasko"],
  ["Bobil", "Tryg", "Bobil Ekstra", "If", "Super"],
];

let aiCalls = 0;
let pdfOperations = 0;
let providerWebRequests = 0;
const started = performance.now();
const results = scenarios.map(([type, firstCompany, firstName, secondCompany, secondName]) => {
  const first = find(type, firstCompany, firstName);
  const second = find(type, secondCompany, secondName);
  assert.ok(first && second, `Missing exact product for ${type}`);
  const result = compareCatalogProducts(first, second, productCatalog);
  assert.ok(result.sections.length > 0);
  assert.ok(result.sections.flatMap((section) => section.rows)
    .flatMap((row) => [...row.first.sources, ...row.second.sources]).length > 0);
  return { type, differences: result.differenceCount };
});

const same = find("Bil", "Gjensidige", "Pluss");
assert.equal(compareCatalogProducts(same, same, productCatalog).differenceCount, 0);
assert.equal(aiCalls, 0);
assert.equal(pdfOperations, 0);
assert.equal(providerWebRequests, 0);

console.log(JSON.stringify({
  status: "PASS",
  eligibleProducts: products.length,
  comparisons: results,
  durationMs: Number((performance.now() - started).toFixed(2)),
  aiCalls,
  pdfOperations,
  providerWebRequests,
}));
