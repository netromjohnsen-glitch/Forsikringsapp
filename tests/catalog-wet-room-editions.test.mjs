import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = new Map(productComparisonProducts(market).map(product => [product.productId, product]));
const consequences = "vatrom.folgeskade";
const ownRoom = "vatrom.selverommet";

function rows(first, second) {
  assert.ok(products.has(first), first);
  assert.ok(products.has(second), second);
  return compareCatalogProducts(products.get(first), products.get(second), market).sections.flatMap(section => section.rows);
}

function row(result, key) {
  const matches = result.filter(candidate => candidate.key === key);
  assert.equal(matches.length, 1, key);
  return matches[0];
}

function checkPair(prefix, left, right, cases) {
  const forward = rows(left, right);
  const reverse = rows(right, left);
  for (const [keySuffix, first, second] of cases) {
    const key = prefix + "." + keySuffix;
    const item = row(forward, key);
    const reversed = row(reverse, key);
    for (const [side, otherSide, expected] of [["first", "second", first], ["second", "first", second]]) {
      const [state, documentId, page, text] = expected;
      const cell = item[side];
      assert.equal(cell.state, state, `${key}, ${side}`);
      assert.equal(cell.sources[0]?.documentId, documentId, `${key}, ${side}`);
      assert.equal(cell.sources[0]?.page, page, `${key}, ${side}`);
      assert.ok(termsSourceHref(cell.sources[0])?.endsWith(`#page=${page}`), documentId);
      const label = state === "unavailable" ? /Ikke inkludert/u : /^(?!Ikke inkludert)/u;
      assert.match(cell.text, label, `${key}, ${side}`);
      if (text) assert.match(cell.text, text, `${key}, ${side}`);
      assert.deepEqual(cell, reversed[otherSide], key);
    }
  }
  return forward;
}

test("base house variants show exact wet-room exclusions while extras retain their own terms", () => {
  checkPair("hus", "tryg-hus", "tryg-hus-ekstra", [
    [consequences, ["unavailable", "trygHus", 3, /unntatt/u], ["included", "trygHusExtra", 3, /tilstøtende/u]],
    [ownRoom, ["unavailable", "trygHus", 3, /bjelkelag/u], ["included", "trygHusExtra", 3, /10 år/u]],
  ]);
  checkPair("hus", "gjensidige-hus", "fremtind-hus-standard", [
    [consequences, ["included", "gjensidigeHusStandard", 3], ["included", "fremtindHusStandard", 4]],
    [ownRoom, ["unavailable", "gjensidigeHusStandard", 3], ["unavailable", "fremtindHusStandard", 4]],
  ]);
  checkPair("hus", "frende-hus-standard", "frende-hus-utvidet", [
    [consequences, ["unavailable", "frendeHusStandard:2026-11-20", 4], ["included", "frendeHusExtended:2026-11-20", 12]],
    [ownRoom, ["unavailable", "frendeHusStandard:2026-11-20", 4], ["included", "frendeHusExtended:2026-11-20", 12]],
  ]);
});

test("If Basis, Utvidet and Super keep distinct wet-room conditions in both building types", () => {
  for (const [prefix, documentId] of [["hus", "ifHusTerms"], ["hytte", "cabin:if:building"]]) {
    checkPair(prefix, `if-${prefix}-basis`, `if-${prefix}-utvidet`, [
      [consequences, ["unavailable", documentId, 8, /Basis/u], ["included", documentId, 8]],
      [ownRoom, ["unavailable", documentId, 8, /oppforing/u], ["unavailable", documentId, 8, /oppforing/u]],
    ]);
    checkPair(prefix, `if-${prefix}-utvidet`, `if-${prefix}-super`, [
      [consequences, ["included", documentId, 8], ["included", documentId, 8]],
      [ownRoom, ["unavailable", documentId, 8], ["included", documentId, 13, /faktura.*reklamasjonstiden.*konkurs/u]],
    ]);
  }
});

test("Storebrand links the actual wet-room clauses and WaterCircles limits Elite to other rooms", () => {
  for (const [prefix, documentId] of [["hus", "storebrandHusTerms"], ["hytte", "cabin:storebrand:building"]]) {
    checkPair(prefix, `storebrand-${prefix}-standard`, `storebrand-${prefix}-super`, [
      [consequences, ["unavailable", documentId, 11], ["included", documentId, 36]],
      [ownRoom, ["unavailable", documentId, 11], ["included", documentId, 36, /autorisert/u]],
    ]);
  }
  const documentId = "new-private:watercircles-hus.pdf";
  checkPair("hus", "watercircles-hus-standard", "watercircles-hus-elite", [
    [consequences, ["unavailable", documentId, 6], ["included", documentId, 14, /andre rom/u]],
    [ownRoom, ["unavailable", documentId, 6], ["unavailable", documentId, 14, /andre rom/u]],
  ]);
});

test("cabin policies compare own-room workmanship coverage on the same row as the standard exclusions", () => {
  const pairs = [
    ["tryg-hytte-standard", "tryg-hytte-ekstra", "cabin:tryg:building", "cabin:tryg:extra", "cabin:tryg:extra", 3, 3],
    ["gjensidige-hytte-standard", "gjensidige-hytte-pluss", "cabin:gjensidige:standard", "cabin:gjensidige:pluss", "cabin:gjensidige:pluss", 3, 5],
    ["fremtind-hytte-standard", "fremtind-hytte-topp", "cabin:fremtind:standard", "cabin:fremtind:standard", "cabin:fremtind:topp", 4, 1],
    ["frende-hytte-standard", "frende-hytte-utvidet", "cabin:frende:building:2026-11-20", "cabin:frende:building:2026-11-20", "cabin:frende:building:2026-11-20", 4, 12],
  ];
  for (const [left, right, base, consequenceDocument, ownDocument, basePage, ownPage] of pairs) {
    const standardConsequences = left.startsWith("tryg") || left.startsWith("frende") ? "unavailable" : "included";
    const ownRoomState = right.startsWith("tryg") ? "unavailable" : "included";
    const consequencePage = right.startsWith("frende") ? 12 : basePage;
    const result = checkPair("hytte", left, right, [
      [consequences, [standardConsequences, base, basePage], ["included", consequenceDocument, consequencePage]],
      [ownRoom, ["unavailable", base, basePage], [ownRoomState, ownDocument, ownPage]],
    ]);
    assert.ok(result.every(candidate => candidate.key !== "hytte.handverker.vatrom"), right);
  }
});
