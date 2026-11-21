import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { productComparisonView, productSectionOrder } from "../lib/product-comparison-presentation.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
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

const marketScenarios = [
  {
    type: "Båt",
    products: [["tryg-marked-bat-ekstra", "2026-09-01"], ["frende-bat-utvidet", "2026-11-20"]],
    rows: {
      "bat.transport.dekning": [["boat-pet:tryg:båt:market:extra", 1], ["boat-pet:frende:båt:2026-11-20", 3]],
      "bat.transport.skade.dekning": [["boat-pet:tryg:båt:market:kaskoOutboard", 2], ["boat-pet:frende:båt:2026-11-20", 3]],
      "bat.redning.hjemtransport.dekning": [["boat-pet:tryg:båt:market:extra", 1], ["boat-pet:frende:båt:2026-11-20", 4]],
      "bat.ferieavbrudd.dekning": [["boat-pet:tryg:båt:market:extra", 2], ["boat-pet:frende:båt:2026-11-20", 4]],
    },
  },
  {
    type: "Snøscooter",
    products: [["tryg-snoscooter-kasko-marked", "2026-10-01"], ["eika-fremtind-snoscooter-kasko", "2023-10-29"]],
    rows: {
      "snoscooter.redning.dekning": [
        ["tryg:snoscooter:market:kasko", 2, "unavailable"], ["vehicle:fremtind-Vilkar_Kasko_Snoscooter.pdf", 5],
      ],
    },
  },
  {
    type: "Barn",
    products: [["storebrand-person-barn-super", "Barneforsikring01 2026-10-08"], ["landkreditt-person-barn", "2022-10-01"]],
    rows: {
      "person.barn.hjelpestonad": [["person:storebrand-person-barn-super", 9], ["person:landkreditt-person-barn", 9]],
      "person.barn.opphor": [["person:storebrand-person-barn-super", 3], ["person:landkreditt-person-barn", 13]],
    },
  },
  {
    type: "Kritisk sykdom",
    products: [["tryg-person-kritisk", "UUL41901"], ["gjensidige-person-alvorlig-sykdom", null]],
    rows: {
      "person.sykdom.overlevelse": [["person:tryg-person-kritisk", 1], ["person:gjensidige-person-alvorlig-sykdom", 8]],
      "person.sykdom.sykehus": [["person:tryg-person-kritisk", 3, "unavailable"], ["person:gjensidige-person-alvorlig-sykdom", 8]],
    },
  },
];

let networkRequests = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = () => { networkRequests++; throw new Error("Product comparison must not use runtime network"); };
let presentationDurationMs = 0;
const started = performance.now();
function verifyPair(type, first, second, catalog) {
  assert.ok(first && second, `Missing exact product for ${type}`);
  const result = compareCatalogProducts(first, second, catalog);
  assert.ok(result.sections.length > 0);
  const rows = result.sections.flatMap(section => section.rows);
  assert.ok(rows.some(row => row.first.sources.length > 0 || row.second.sources.length > 0));
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
    for (const fact of rows.flatMap(row => row[side].facts)) {
      assert.ok(displayed.some((candidate) => JSON.stringify(candidate) === JSON.stringify(fact)), `Lost ${type}/${fact.key}`);
    }
  }
  return {
    rows,
    differenceCount: result.differenceCount,
    receipt: { type, navigation: sections.map(section => section.navLabel), order: productSectionOrder(type) },
  };
}

const results = scenarios.map(([type, firstCompany, firstName, secondCompany, secondName]) =>
  verifyPair(type, find(type, firstCompany, firstName), find(type, secondCompany, secondName), productCatalog).receipt);
const same = find("Bil", "Gjensidige", "Pluss");
assert.equal(compareCatalogProducts(same, same, productCatalog).differenceCount, 0);

const marketProducts = productComparisonProducts(marketProductCatalog);
const marketResults = marketScenarios.map(({ type, products: editions, rows: expectedRows }) => {
  const [first, second] = editions.map(([productId, version]) => {
    const activeProduct = marketProducts.find(product => product.productId === productId && product.version === version);
    assert.ok(activeProduct, `Missing active market product ${productId} (${version})`);
    return activeProduct;
  });
  const forward = verifyPair(type, first, second, marketProductCatalog);
  const reverse = verifyPair(type, second, first, marketProductCatalog);
  const forwardRows = new Map(forward.rows.map(row => [row.key, row]));
  const reverseRows = new Map(reverse.rows.map(row => [row.key, row]));
  assert.equal(forwardRows.size, forward.rows.length, `Duplicate market rows for ${type}`);
  assert.equal(reverseRows.size, reverse.rows.length, `Duplicate reverse market rows for ${type}`);
  assert.equal(forwardRows.size, reverseRows.size, `Different market row count for ${type}`);
  assert.equal(forward.differenceCount, reverse.differenceCount, `Different market difference count for ${type}`);
  for (const row of forward.rows) {
    assert.deepEqual(reverseRows.get(row.key), { ...row, first: row.second, second: row.first }, `Asymmetric ${type}/${row.key}`);
  }
  for (const [key, [firstSource, secondSource]] of Object.entries(expectedRows)) {
    const row = forwardRows.get(key);
    assert.ok(row, `Missing market row ${type}/${key}`);
    for (const [side, [documentId, page, state = "included"]] of [["first", firstSource], ["second", secondSource]]) {
      const cell = row[side];
      assert.equal(cell.state, state, `Wrong market coverage state for ${type}/${key} (${side})`);
      assert.ok(cell.sources.some(source => source.documentId === documentId && source.page === page),
        `Wrong market source for ${type}/${key} (${side})`);
    }
  }
  return { ...forward.receipt, editions, verifiedRows: Object.keys(expectedRows) };
});

assert.equal(networkRequests, 0);
globalThis.fetch = originalFetch;

console.log(JSON.stringify({
  status: "PASS",
  eligibleProducts: products.length,
  comparisons: results,
  market: { eligibleProducts: marketProducts.length, comparisons: marketResults, directions: marketResults.length * 2 },
  durationMs: Number((performance.now() - started).toFixed(2)),
  presentationDurationMs: Number(presentationDurationMs.toFixed(2)),
  networkRequests,
  aiCalls: 0,
  pdfOperations: 0,
  providerWebRequests: 0,
}));
