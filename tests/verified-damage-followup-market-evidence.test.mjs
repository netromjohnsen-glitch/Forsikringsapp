import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedDamageFollowupMarketEvidence } from "../lib/verified-damage-followup-market-evidence.ts";

const klpHouses = ["klp-hus-hus", "klp-hus-utvidet-rate-og-insektskader", "klp-hus-hus-maks"];
const landkredittHouses = ["landkreditt-hus-standard", "landkreditt-hus-utvidet"];
const waterCirclesHouses = ["watercircles-hus-standard", "watercircles-hus-elite"];
const product = id => market.products.find(entry => entry.productId === id);
const options = productComparisonProducts(market);

function fact(id, key) {
  const rows = materializeCatalogProduct(product(id), market).facts.filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " " + key);
  return rows[0];
}

function comparisonRows(first, second) {
  return compareCatalogProducts(
    options.find(entry => entry.productId === first),
    options.find(entry => entry.productId === second), market,
  ).sections.flatMap(section => section.rows);
}

function assertPage(row, id, page) {
  const source = row.sources[0];
  const document = market.sources[product(id).sourceId];
  assert.equal(source.documentId, document.id);
  assert.equal(source.page, page);
  assert.equal(termsSourceHref(source), document.url + "#page=" + page);
}

test("KLP Hus viser vilkåret om forsikringsbevis for små tilleggsbygg på hvert nivå", () => {
  for (const id of klpHouses) {
    const row = fact(id, "hus.bygninger.tilbehor");
    assert.match(row.value, /10 m² har brann- og naturskadedekning når bygget står i forsikringsbeviset og ikke har egen forsikring/u);
    assert.match(row.value, /250 000 kr ved avtaler inngått før 17. november 2018.*forsikres særskilt og stå i forsikringsbeviset/u);
    assertPage(row, id, 1);
    assert.match(productCatalog.facts[id].find(entry => entry.key === row.key).value, /uten egen forsikring/u);
  }
});

test("Skade i selve våtrommet får egen rad og riktig dekningstrinn hos KLP og Landkreditt", () => {
  const self = "hus.vatrom.selverommet";
  for (const id of klpHouses.slice(0, 2)) {
    const row = fact(id, self);
    assert.equal(row.state, "unavailable");
    assertPage(row, id, 2);
  }
  const [standard, extended] = landkredittHouses;
  const rows = comparisonRows(standard, extended);
  const ownRoom = rows.find(row => row.key === self);
  assert.equal(ownRoom.first.state, "unavailable");
  assert.match(ownRoom.first.text, /utetthet er unntatt/u);
  assert.equal(ownRoom.second.state, "included");
  assert.match(ownRoom.second.text, /innenfor våtrommets bjelkelag og stenderverk.*prosjekteringsfeil.*forsikringstiden.*ti år/u);
  assertPage(ownRoom.first, standard, 4);
  assertPage(ownRoom.second, extended, 17);
  const otherRooms = rows.find(row => row.key === "hus.vatrom.folgeskade");
  assert.match(otherRooms.first.text, /tilstøtende rom.*unntatt/u);
  assert.match(otherRooms.second.text, /Følgeskade i tilstøtende rom dekkes/u);
  const aligned = comparisonRows(klpHouses[2], extended).find(row => row.key === self);
  assert.equal(aligned.first.state, "included");
  assert.equal(aligned.second.state, "included");
  assertPage(aligned.first, klpHouses[2], 4);
});

test("Landkreditt Hus knytter fritaket til tyveri med aktiv alarm på skadetidspunktet", () => {
  for (const id of landkredittHouses) {
    const row = fact(id, "hus.egenandel.fritak");
    assert.match(row.value, /ved tyveri når innbruddsalarm.*alarmsentral eller vaktselskap.*i bruk på skadetidspunktet/u);
    assert.match(row.value, /innvendig vannledning.*hele byggets rørsystem.*bare rammer overspenningsvern/u);
    assertPage(row, id, 8);
    assert.match(row.sources[0].section, /PDF-side 9/u);
  }
});

test("WaterCircles Villa viser trebryggens undergrense på samme rad som Landkreditt", () => {
  for (const [id, limit, page] of [
    [waterCirclesHouses[0], "150 000", 6],
    [waterCirclesHouses[1], "2 000 000", 14],
  ]) {
    const row = comparisonRows(id, landkredittHouses[0]).find(entry => entry.key === "hus.hage.brygge");
    assert.match(row.first.text, /100 000 kr for fast trebrygge/u);
    assert.ok(row.first.text.includes("samlede grensen på " + limit + " kr"));
    assert.match(row.first.text, /Andre typer brygger og kaianlegg omfattes ikke/u);
    assert.match(row.second.text, /Brann\/naturskade.*100 000 kroner/u);
    assertPage(row.first, id, page);
    assertPage(row.second, landkredittHouses[0], 3);
    assert.match(fact(id, "hus.hage.objekter").value, /100 000/u);
    assert.ok(productCatalog.facts[id].every(entry => entry.key !== "hus.hage.brygge"));
  }
});

test("Husrettingene er avgrenset til verifiserte PDF-versjoner og markedet", () => {
  for (const id of [...klpHouses, ...landkredittHouses, ...waterCirclesHouses]) {
    const document = market.sources[product(id).sourceId];
    const path = "catalog/sources/new-private-motor-home/" + document.filename;
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), document.sha256);
    const sources = { ...market.sources, [document.id]: { ...document, sha256: "annen-versjon" } };
    const facts = { ...productCatalog.facts };
    addVerifiedDamageFollowupMarketEvidence(sources, facts, market.products);
    assert.equal(facts[id], productCatalog.facts[id]);
  }
});
