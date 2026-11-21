import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedTrailerMarketEvidence } from "../lib/verified-trailer-market-evidence.ts";

const options = productComparisonProducts(market);
const product = id => market.products.find(entry => entry.productId === id);
const facts = id => materializeCatalogProduct(product(id), market).facts;
const ifUrl = "https://www.if.no/privat/forsikring/kjoretoy/tilhengerforsikring";
const storebrandUrl = "https://www.storebrand.no/privat/forsikring/tilhengerforsikring";
const trygUrl = "https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring";

function fact(id, key) {
  const rows = facts(id).filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " " + key);
  return rows[0];
}

function compareRow(first, second, key) {
  return compareCatalogProducts(
    options.find(plan => plan.productId === first), options.find(plan => plan.productId === second), market,
  ).sections.flatMap(section => section.rows).find(row => row.key === key);
}

function assertOwnTerms(source, id, page, href) {
  assert.equal(source.documentId, product(id).sourceId);
  assert.equal(source.page, page);
  const url = href ?? market.sources[source.documentId].url;
  assert.equal(termsSourceHref(source), url + "#page=" + page);
}

function assertProductPage(source, id, url) {
  const document = market.sources[source.documentId];
  assert.equal(source.page, 0);
  assert.equal(document.sourceType, "product_page");
  assert.equal(document.providerId, product(id).providerId);
  assert.ok(document.productIds.includes(id));
  assert.equal(termsSourceHref(source), url);
}

test("Tryg Tilhenger bruker riktig naturskadevilkår for hvert nivå, og Kasko viser værfritaket", () => {
  for (const [suffix, coveragePage, deductiblePage] of [
    ["brann", 1, 2], ["brann-og-tyveri", 2, 2], ["kasko", 2, 3],
  ]) {
    const id = "tryg-tilhenger-" + suffix;
    const coverage = fact(id, "tilhenger.naturskade.dekning");
    assert.match(coverage.value, /Brannforsikret tilhenger.*stormflo.*vulkanutbrudd/u);
    assertOwnTerms(coverage.sources[0], id, coveragePage);
    const deductible = fact(id, "tilhenger.naturskade.egenandel");
    assert.match(deductible.value, /8 000 kr/u);
    assertOwnTerms(deductible.sources[0], id, deductiblePage);
    assert.match(fact(id, "tilhenger.hjul.dekning").value, /ekstra dekk og felger/u);
    if (suffix !== "kasko") {
      assert.ok(facts(id).every(row => row.key !== "tilhenger.kasko.vaer.egenandel"));
    }
  }
  const id = "tryg-tilhenger-kasko";
  const deductible = fact(id, "tilhenger.kasko.egenandel");
  assert.match(deductible.value, /forsikringsbeviset.*fra 4 000 kr/u);
  assertOwnTerms(deductible.sources[0], id, 2);
  assertProductPage(deductible.sources[1], id, trygUrl);
  const weather = fact(id, "tilhenger.kasko.vaer.egenandel");
  assert.match(weather.value, /Ingen egenandel ved dekket værrelatert kaskoskade.*parkert innendørs/u);
  assertOwnTerms(weather.sources[0], id, 2);
  assert.match(fact(id, "tilhenger.kasko.dekning").value, /sammenstøt, utforkjøring, velt, hærverk/u);
});

test("Gjensidige viser ekstra hjulsett og det private tillegget ved rulling uten fører", () => {
  for (const level of ["delkasko", "kasko"]) {
    const id = "gjensidige-tilhenger-" + level;
    const url = "/api/vilkar/gjensidige/tilhenger-" + level;
    const row = compareRow(id, "tryg-tilhenger-kasko", "tilhenger.hjul.dekning");
    assert.match(row.first.text, /Ett sett ekstra dekk og felger/u);
    assert.match(row.second.text, /ekstra dekk og felger/u);
    assertOwnTerms(row.first.sources[0], id, 2, url);
    const rolling = fact(id, "tilhenger.rulling.egenandel");
    assert.match(rolling.value, /triller uten fører.*5 000 kr for privatforsikringer.*ellers ikke utløser egenandel/u);
    assertOwnTerms(rolling.sources[0], id, 1, url);
  }
});

test("If Tilhenger skiller produktsatsene fra fellesvilkåret og viser veihjelp på begge nivåer uten dubletter", () => {
  const path = "/api/vilkar/if/kjoretoy-mot2-2";
  for (const level of ["delkasko", "kasko"]) {
    const id = "if-tilhenger-" + level;
    for (const tag of level === "kasko" ? ["brann", "tyveri", "kasko"] : ["brann", "tyveri"]) {
      const row = fact(id, "tilhenger." + tag + ".egenandel");
      assert.match(row.value, /2 000 eller 4 000 kr.*8 000 kr.*Forsikringsbeviset avgjør/u);
      assertProductPage(row.sources[0], id, ifUrl);
      assertOwnTerms(row.sources[1], id, 19, path);
    }
    const theft = fact(id, "tilhenger.tyveri.dekning");
    assert.match(theft.value, /tyveri, tyveriforsøk og innbrudd/u);
    assertOwnTerms(theft.sources[0], id, 5, path);
    const rescue = compareRow(id, "gjensidige-tilhenger-" + level, "tilhenger.redning.dekning");
    assert.equal(rescue.first.state, "included");
    assert.equal(rescue.second.state, "included");
    assert.match(rescue.first.text, /assistanse på stedet eller nødvendig transport/u);
    assertOwnTerms(rescue.first.sources[0], id, 5, path);
    const deductible = fact(id, "tilhenger.redning.egenandel");
    assert.match(deductible.value, /500 kr.*750 kr.*forsikringsbeviset/u);
    assertProductPage(deductible.sources[0], id, ifUrl);
    assertOwnTerms(deductible.sources[1], id, 19, path);
  }
});

test("Storebrand viser tilhengerens oppgitte pris sammen med camp02 og riktig dekningstrinn", () => {
  const archive = "/api/vilkar/storebrand/campingvogn-tilhenger-camp02";
  for (const [level, key] of [["brann-og-tyveri", "brann"], ["kasko", "tyveri"]]) {
    const id = "storebrand-tilhenger-" + level;
    const deductible = fact(id, "tilhenger." + key + ".egenandel");
    assert.match(deductible.value, /1 000 kr.*8 000 kr.*Forsikringsbeviset/u);
    assertProductPage(deductible.sources[0], id, storebrandUrl);
    assertOwnTerms(deductible.sources[1], id, key === "brann" ? 5 : 6, archive);
    assert.match(fact(id, "tilhenger.hjul.dekning").value, /samme standard.*justert for alder/u);
  }
  const kasko = "storebrand-tilhenger-kasko";
  assertOwnTerms(fact(kasko, "tilhenger.kasko.egenandel").sources[0], kasko, 7, archive);
  assertOwnTerms(fact(kasko, "tilhenger.naturskade.dekning").sources[0], kasko, 6, archive);
  assert.ok(facts("storebrand-tilhenger-brann-og-tyveri").every(row => row.key !== "tilhenger.naturskade.dekning"));
});

test("Tilhengerrettingene holder seg til registrert PDF-utgave, ordinært marked og riktige produktvalg", () => {
  for (const [id, key] of [
    ["tryg-tilhenger-kasko", "tilhenger.kasko.vaer.egenandel"],
    ["gjensidige-tilhenger-kasko", "tilhenger.rulling.egenandel"],
    ["if-tilhenger-delkasko", "tilhenger.redning.dekning"],
    ["storebrand-tilhenger-kasko", "tilhenger.naturskade.dekning"],
  ]) {
    const document = market.sources[product(id).sourceId];
    const path = "catalog/sources/vehicle-extensions/" + document.filename;
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), document.sha256);
    assert.ok(productCatalog.facts[id].every(row => row.key !== key));
    const candidate = { ...productCatalog.facts };
    const sources = { ...market.sources, [document.id]: { ...document, sha256: "annen-utgave" } };
    addVerifiedTrailerMarketEvidence(sources, candidate, market.products);
    assert.equal(candidate[id], productCatalog.facts[id]);
  }
  assert.ok(facts("tryg-campingvogn-kasko").every(row => !row.key.startsWith("tilhenger.")));
  assert.ok(facts("frende-tilhenger-kasko").every(row => row.key !== "tilhenger.rulling.egenandel"));
});
