import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonProducts(marketProductCatalog);
const interruption = "reise.reiseavbrudd";

function product(id) {
  const match = products.find(candidate => candidate.productId === id);
  assert.ok(match, id);
  return match;
}

function fact(id, key) {
  const matches = materializeCatalogProduct(product(id), marketProductCatalog).facts.filter(row => row.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
}

test("Tryg Reise Premium uses its own policy and the included accident coverage", () => {
  const id = "tryg-reise-premium";
  const premium = materializeCatalogProduct(product(id), marketProductCatalog);
  assert.equal(premium.facts.flatMap(row => row.sources)
    .filter(source => ["trygReiseBase", "trygReiseExtra"].includes(source.documentId)).length, 0);
  for (const [key, page] of [
    ["reise.avbestilling.dekning", 1],
    ["reise.forsinkelse.rute", 2],
    ["reise.forsinkelse.hotell_arrangement", 3],
    ["reise.bagasje.uhell_begrensning", 4],
    ["reise.medisinsk.graviditet", 5],
    ["reise.sykeledsagelse.tilkalling", 6],
    [interruption, 7],
    ["reise.leiebil.egenandel", 8],
  ]) {
    const source = fact(id, key).sources[0];
    assert.equal(source.documentId, "trygReisePremium", key);
    assert.equal(source.page, page, key);
    assert.match(termsSourceHref(source), new RegExp("05PRF46003#page=" + page + "$", "u"), key);
  }
  const dental = fact(id, "reise.medisinsk.tann");
  assert.match(dental.value, /den inkluderte Ulykke Premium/u);
  assert.deepEqual(dental.sources.map(source => [source.documentId, source.page]),
    [["trygReisePremium", 8], ["trygReiseAccidentPremium", 2]]);
  const knownIllness = fact(id, "reise.medisinsk.kjent");
  assert.match(knownIllness.value, /lege før avreise skriftlig bekrefte/u);
  assert.deepEqual(knownIllness.sources.map(source => [source.documentId, source.page]),
    [["trygReisePremium", 8], ["trygReiseSafety", 2]]);
  assert.match(fact(id, "reise.overnatting").value, /^Reise Premium.*med og uten overnatting/u);
  assert.deepEqual(fact(id, "reise.tjenestereise").sources.map(source => source.documentId),
    ["trygReiseProductPage", "trygReisePremium"]);
  assert.match(fact("tryg-reise-ekstra", "reise.overnatting").value, /^Reise Ekstra/u);
  assert.equal(fact("tryg-reise", interruption).state, "unavailable");
});

test("trip interruption separates qualifying events, limits and prepaid excursions", () => {
  for (const [id, document, sumPage, daily, excursions] of [
    ["fremtind-reise", "fremtindReiseUnifiedTerms", 8, /2 000.*750/u, /5 000/u],
    ["if-reise-standard", "ifReiseTerms", 14, /første syke- eller avbruddsdag/u, /5 000.*Utbetales ikke i tillegg/u],
    ["if-reise-super", "ifReiseTerms", 14, /første syke- eller avbruddsdag/u, /5 000.*Utbetales ikke i tillegg/u],
    ["storebrand-reise-standard", "storebrandReiseTerms", 16, /2 000.*20 000.*50 000/u, /6 000/u],
    ["storebrand-reise-super", "storebrandReiseTerms", 16, /2 000.*reisens pris/u, /6 000/u],
    ["klp-reise", "klp-reise", 5, /1 500.*150 000/u, /10 000/u],
    ["klp-reise-maks", "klp-reise-maks", 5, /1 500.*150 000/u, /10 000/u],
    ["watercircles-reise-standard", "watercircles-reise", 11, /2 000.*150 000.*200 000/u, /2 000 kr per person/u],
    ["watercircles-reise-elite", "watercircles-reise", 11, /2 000.*reisens pris/u, /reisens pris.*betalt sammen med reisen/u],
    ["landkreditt-reise", "landkreditt-reise", 9, /2 000.*reisens pris/u, /perioden ferien ble avbrutt/u],
  ]) {
    assert.match(fact(id, interruption).value, /sykehus/iu, id);
    const sum = fact(id, interruption + ".sum");
    assert.match(sum.value, daily, id);
    assert.equal(sum.sources[0].documentId, document, id);
    assert.match(termsSourceHref(sum.sources[0]), new RegExp("#page=" + sumPage + "$", "u"), id);
    const event = fact(id, interruption + ".arrangement");
    assert.match(event.value, excursions, id);
    assert.equal(event.sources[0].documentId, document, id);
  }
  assert.doesNotMatch(fact("storebrand-reise-super", interruption + ".sum").value, /20 000|50 000/u);
  assert.doesNotMatch(fact("watercircles-reise-elite", interruption + ".sum").value, /150 000|200 000/u);
  assert.match(fact("if-reise-standard", "reise.avbestilling.sum").value, /Ubegrenset.*før første innbetaling/u);
  assert.equal(fact("if-reise-basis", interruption).state, "unavailable");
});

test("travel interruption facts stay aligned in both comparison orientations and presentation", () => {
  const storebrand = product("storebrand-reise-standard");
  const klp = product("klp-reise-maks");
  for (const [first, second] of [[storebrand, klp], [klp, storebrand]]) {
    const result = compareCatalogProducts(first, second, marketProductCatalog);
    const rawRows = result.sections.flatMap(section => section.rows);
    const presentedFacts = productComparisonView(result).flatMap(section => section.groups).flatMap(group => [
      ...group.rows.flatMap(row => [...row.first.facts, ...row.second.facts]),
      ...group.details.first, ...group.details.second,
      ...group.models.flatMap(model => [...model.first, ...model.second]),
    ]);
    for (const key of [interruption, interruption + ".sum", interruption + ".arrangement"]) {
      const row = rawRows.find(row => row.key === key);
      assert.ok(row, key);
      assert.equal(row.first.facts.length, 1, key);
      assert.equal(row.second.facts.length, 1, key);
      assert.equal(row.first.state, "included", key);
      assert.equal(row.second.state, "included", key);
      assert.ok(presentedFacts.some(fact => fact.key === key), key);
    }
  }
});
