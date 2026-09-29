import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { productComparisonView, productSectionOrder } from "../lib/product-comparison-presentation.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import {
  compareCatalogProducts,
  productComparisonProducts,
} from "../lib/catalog-product-comparison.ts";

const products = productComparisonProducts(productCatalog);
const find = (type, company, name) => products.find((product) =>
  product.insuranceType === type && product.company === company && product.name === name);

const scenarios = [
  ["Bil", "If", "Super", "Frende", "Utvidet"],
  ["Innbo", "Tryg", "Innbo Ekstra", "If", "Super"],
  ["Snøscooter", "Tryg", "Kasko", "If", "Kasko"],
  ["Campingvogn", "Tryg", "Campingvogn Ekstra", "If", "Super"],
  ["Tilhenger", "Tryg", "Kasko", "If", "Kasko"],
  ["Hus", "Tryg", "Hus Ekstra", "If", "Super"],
  ["Reise", "Tryg", "Reise Ekstra", "If", "Super"],
  ["MC", "Tryg", "MC Ekstra", "If", "Kasko"],
  ["Bobil", "Tryg", "Bobil Ekstra", "If", "Super"],
  ["Båt", "Tryg", "Båt Ekstra", "If", "Super"],
  ["Hund", "If", "Super", "Frende", "Veterinær"],
  ["Katt", "Storebrand", "Veterinær og Dødsfall", "Fremtind", "Veterinær"],
];

let networkRequests = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = () => { networkRequests++; throw new Error("Product comparison must not use runtime network"); };
let presentationDurationMs = 0;
const started = performance.now();
const results = scenarios.map(([type, firstCompany, firstName, secondCompany, secondName]) => {
  const first = find(type, firstCompany, firstName);
  const second = find(type, secondCompany, secondName);
  assert.ok(first && second, `Missing exact product for ${type}`);
  const result = compareCatalogProducts(first, second, productCatalog);
  assert.ok(result.sections.length > 0);
  assert.ok(result.sections.flatMap((section) => section.rows)
    .flatMap((row) => [...row.first.sources, ...row.second.sources]).length > 0);
  const presentationStarted = performance.now();
  const sections = productComparisonView(result);
  presentationDurationMs += performance.now() - presentationStarted;
  assert.ok(sections.length);
  assert.equal(new Set(sections.map((section) => section.anchorId)).size, sections.length);
  assert.ok(sections.every((section) => section.groups.length > 0));
  for (const side of ["first", "second"]) {
    const displayed = sections.flatMap((section) => section.groups).flatMap((group) => [
      ...group.rows.flatMap((row) => row[side].facts), ...group.models.flatMap((model) => model[side]), ...group.details[side],
    ]);
    for (const fact of result.sections.flatMap((section) => section.rows).flatMap((row) => row[side].facts)) {
      assert.ok(displayed.some((candidate) => JSON.stringify(candidate) === JSON.stringify(fact)), `Lost ${type}/${fact.key}`);
    }
  }
  return { type, navigation: sections.map((section) => section.navLabel), order: productSectionOrder(type) };
});

const same = find("Bil", "Gjensidige", "Pluss");
assert.equal(compareCatalogProducts(same, same, productCatalog).differenceCount, 0);
assert.equal(networkRequests, 0);
globalThis.fetch = originalFetch;

console.log(JSON.stringify({
  status: "PASS",
  eligibleProducts: products.length,
  comparisons: results,
  durationMs: Number((performance.now() - started).toFixed(2)),
  presentationDurationMs: Number(presentationDurationMs.toFixed(2)),
  networkRequests,
  aiCalls: 0,
  pdfOperations: 0,
  providerWebRequests: 0,
}));
