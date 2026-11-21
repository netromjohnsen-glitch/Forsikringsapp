import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonProducts(marketProductCatalog);
const product = (id) => {
  const result = products.find(candidate => candidate.productId === id);
  assert.ok(result, id);
  return result;
};

const delayed = "reise.bagasje.forsinket";
const delayedLimit = "reise.bagasje.forsinket_sum";
const transit = "reise.bagasje.transitt";
const transitLimit = "reise.bagasje.transitt_sum";

function fact(id, key) {
  const rows = materializeCatalogProduct(product(id), marketProductCatalog).facts.filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " " + key);
  return rows[0];
}

test("forsinket og utilgjengelig bagasje har egne sammenligningsrader og beløpsgrenser", () => {
  for (const [id, ordinary, overnight] of [
    ["fremtind-reise", "5 000", "500"],
    ["if-reise-standard", "5 000", "1 000"],
    ["if-reise-super", "5 000", "1 000"],
    ["storebrand-reise-standard", "3 000", "500"],
    ["storebrand-reise-super", "6 000", "500"],
    ["frende-reiseforsikring", "6 000", "500"],
    ["landkreditt-reise", "6 000", "1 000"],
    ["tryg-reise", "2 000", "500"],
    ["tryg-reise-ekstra", "5 000", "500"],
    ["tryg-reise-premium", "5 000", "500"],
    ["tryg-nito-reise-enkeltperson", "6 000", "1 000"],
    ["tryg-nito-reise-familie", "6 000", "1 000"],
    ["tryg-utdanningsforbundet-reise-en-person", "6 000", "500"],
    ["tryg-utdanningsforbundet-reise-familie", "6 000", "500"],
  ]) {
    assert.doesNotMatch(fact(id, delayed).value, /transitt|overnatting/u);
    assert.match(fact(id, transit).value, /overnatting/u);
    assert.ok(fact(id, delayedLimit).value.startsWith("Inntil " + ordinary + " kr"), id);
    assert.ok(fact(id, transitLimit).value.startsWith("Inntil " + overnight + " kr"), id);
  }
  assert.match(fact("fremtind-reise", delayed).value, /fire timers forsinkelse, unntatt ved jobbreise/u);
  assert.match(fact("tryg-reise", delayed).value, /forbyttet bagasje ikke kommer til rette innen fire timer/u);
  assert.equal(fact("if-reise-basis", transit).state, "unavailable");
  assert.match(fact("landkreditt-reise", "reise.forsinkelse.bagasje_spesial").value, /kjøp eller leie.*25 000/u);
});

test("bagasjeradene vises toveis med riktig fysisk PDF-side for vilkår og sum", () => {
  const storebrand = product("storebrand-reise-standard");
  const fremtind = product("fremtind-reise");
  for (const [first, second] of [[storebrand, fremtind], [fremtind, storebrand]]) {
    const result = compareCatalogProducts(first, second, marketProductCatalog);
    const rows = result.sections.flatMap(section => section.rows);
    for (const key of [delayed, delayedLimit, transit, transitLimit]) {
      const row = rows.find(candidate => candidate.key === key);
      assert.ok(row, key);
      assert.equal(row.first.facts.length, 1, key);
      assert.equal(row.second.facts.length, 1, key);
      assert.equal(row.first.state, "included", key);
      assert.equal(row.second.state, "included", key);
      const displayed = productComparisonView(result).flatMap(section => section.groups).flatMap(group => [
        ...group.rows.flatMap(displayedRow => [...displayedRow.first.facts, ...displayedRow.second.facts]),
        ...group.details.first, ...group.details.second,
        ...group.models.flatMap(model => [...model.first, ...model.second]),
      ]);
      assert.ok(displayed.some(displayedFact => displayedFact.key === key), key);
    }
  }
  for (const [id, key, expectedDocument, page] of [
    ["storebrand-reise-standard", delayed, "storebrandReiseTerms", 10],
    ["storebrand-reise-standard", delayedLimit, "storebrandReiseTerms", 8],
    ["storebrand-reise-standard", transit, "storebrandReiseTerms", 10],
    ["storebrand-reise-standard", transitLimit, "storebrandReiseTerms", 8],
    ["fremtind-reise", delayed, "fremtindReiseUnifiedTerms", 5],
    ["fremtind-reise", transit, "fremtindReiseUnifiedTerms", 6],
    ["tryg-reise-premium", transit, "trygReisePremium", 3],
    ["tryg-nito-reise-enkeltperson", transit, "tryg-nito-reise-enkeltperson-terms", 10],
    ["tryg-utdanningsforbundet-reise-en-person", transitLimit, "tryg-utdanningsforbundet-reise-en-person-terms", 2],
  ]) {
    const source = fact(id, key).sources[0];
    assert.equal(source.documentId, expectedDocument);
    assert.equal(source.page, page);
    assert.match(termsSourceHref(source), new RegExp("#page=" + page + "$", "u"));
  }
});

test("Tryg NITO Bil Ansvar viser hver PAU25003-klausul én gang uten å miste beløp og vilkårsreferanse", () => {
  const id = "tryg-nito-bil-ansvar";
  const original = marketProductCatalog.sources[id + "-terms"];
  const shared = marketProductCatalog.sources["tryg-nito-bil-market-ansvar"];
  assert.equal(original.sha256, shared.sha256);
  assert.equal(original.termsNumber, "PAU25003");
  assert.equal(original.effectiveFrom, shared.effectiveFrom);
  const counterpart = products.find(p => p.productId === "tryg-nito-bil-delkasko");
  const rows = compareCatalogProducts(product(id), counterpart, marketProductCatalog).sections.flatMap(section => section.rows);
  for (const [key, contents] of [
    ["ansvar.dekning", /ubegrenset.*100 millioner.*høyere erstatning/u],
    ["rettshjelp.dekning", /PGE91500/u],
  ]) {
    const left = rows.find(row => row.key === key).first;
    assert.equal(left.facts.length, 1);
    assert.equal(left.sources.length, 1);
    assert.equal(left.sources[0].termsNumber, "PAU25003");
    assert.match(termsSourceHref(left.sources[0]), /#page=1$/u);
    assert.match(left.text, contents);
  }
  assert.match(fact(id, "ansvar.ting.grense").value, /100 000 000/u);
  assert.ok(productCatalog.facts[id + "-terms"].some(row => row.key === "bil.ansvar"));
});

test("WaterCircles skiller Standard fra Elite og bevarer begge sidene av hotellvilkåret", () => {
  const standard = product("watercircles-reise-standard");
  const elite = product("watercircles-reise-elite");
  const hotel = "reise.forsinkelse.hotell_arrangement";
  const sports = "reise.bagasje.forsinket_utstyr";
  const oldCombined = "reise.forsinkelse.tapte_utgifter";
  const rows = (first, second) => new Map(compareCatalogProducts(first, second, marketProductCatalog)
    .sections.flatMap(section => section.rows).map(row => [row.key, row]));
  const forward = rows(standard, elite);
  const reverse = rows(elite, standard);
  for (const key of [hotel, sports]) {
    const row = forward.get(key);
    assert.equal(row.first.state, "unavailable");
    assert.equal(row.second.state, "included");
    assert.deepEqual(reverse.get(key).first, row.second);
    assert.deepEqual(reverse.get(key).second, row.first);
  }
  assert.equal(forward.has(oldCombined), false);
  assert.ok(materializeCatalogProduct(standard, productCatalog).facts.some(row => row.key === oldCombined));
  assert.match(forward.get(hotel).second.text, /minst åtte timer.*én forhåndsbetalt hotellovernatting.*ett arrangement/u);
  assert.deepEqual(forward.get(hotel).first.sources.map(termsSourceHref), [
    "/api/vilkar/watercircles/reise-2-17#page=7", "/api/vilkar/watercircles/reise-2-17#page=6",
  ]);
  assert.match(forward.get(hotel + "_sum").second.text, /5 000 kr per person/u);
  assert.match(forward.get(sports).second.text, /6 000 kr per person og 20 000 kr per familie/u);
  assert.match(forward.get(delayedLimit).first.text,
    /Privatreise.*6 000 kr per person og 20 000 kr per familie.*Tjenestereise.*6 000 kr per person/u);
});

test("KLPs to reisevarianter skiller bagasje, utstyrsleie, tapt hotell og kansellert bil- eller MC-leie", () => {
  for (const [id, route] of [["klp-reise", "reise"], ["klp-reise-maks", "reise-maks"]]) {
    const base = "/api/vilkar/klp/" + route + "#page=";
    for (const [key, value, page] of [
      [delayed, /minst fire timer.*Hjemreise er unntatt/u, 1],
      [delayedLimit, /5 000 kr per person til klær og toalettsaker/u, 1],
      ["reise.bagasje.forsinket_utstyr", /leie av sykkel, ski, barnevogn.*forsinket med fly.*5 000 kr per person/u, 1],
      ["reise.forsinkelse.hotell_arrangement", /minst én overnatting.*minst åtte timer/u, 2],
      ["reise.forsinkelse.hotell_arrangement_sum", /6 000 kr per person/u, 2],
      ["reise.forsinkelse.leiebilavtale", /1,5 time.*privatbil eller motorsykkel.*kansellert/u, 2],
      ["reise.forsinkelse.leiebilavtale_sum", /10 000 kr/u, 2],
    ]) {
      const hit = fact(id, key);
      assert.match(hit.value, value, key);
      assert.equal(termsSourceHref(hit.sources[0]), base + page);
    }
    const sourceProduct = product(id);
    assert.ok(materializeCatalogProduct(sourceProduct, productCatalog).facts.some(row => row.key === "reise.forsinkelse.tapte_utgifter"));
    assert.ok(!materializeCatalogProduct(sourceProduct, marketProductCatalog).facts.some(row => row.key === "reise.forsinkelse.tapte_utgifter"));
  }
});
