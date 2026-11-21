import assert from "node:assert/strict";
import test from "node:test";
import { reviewedRentalLimitExclusion } from "../lib/catalog-market-coverage-exclusions.ts";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const rentalLimit = "reise.leiebil.egenandel_sum";
const noDocumentation = "Ikke dokumentert i kataloggrunnlaget";

function product(id, catalog = market) {
  const p = catalog.products.find(p => p.productId === id);
  assert.ok(p, id);
  return p;
}

function compare(a, b, catalog = market) {
  return compareCatalogProducts(product(a, catalog), product(b, catalog), catalog);
}

const rows = (result) => new Map(result.sections.flatMap(section => section.rows).map(row => [row.key, row]));

test("published exclusions make only the five reviewed travel variants' leiebil amount inapplicable", () => {
  const peer = "tryg-reise-ekstra";
  for (const [id, documentId, physicalPage, wording] of [
    ["tryg-reise", "trygReiseBase", 9, /Ikke omfattet på Reise/u],
    ["if-reise-basis", "ifReiseTerms", 2, /inngår bare i Super/u],
    ["if-reise-standard", "ifReiseTerms", 2, /inngår bare i Super/u],
    ["storebrand-reise-standard", "storebrandReiseTerms", 25, /Ikke omfattet i Standard/u],
    ["watercircles-reise-standard", "watercircles-reise", 4, /er del av Reise Elite/u],
  ]) {
    const row = rows(compare(id, peer)).get(rentalLimit);
    assert.equal(row.first.state, "unavailable", id);
    assert.match(row.first.text, /^Gjelder ikke\./u, id);
    assert.match(row.first.text, wording, id);
    assert.deepEqual(row.first.sources.map(source => [source.documentId, source.page]), [[documentId, physicalPage]], id);
    assert.match(row.second.text, /40 000 kr/u);
    assert.deepEqual(rows(compare(peer, id)).get(rentalLimit).second, row.first, id);
    assert.equal(rows(compare(id, id)).has(rentalLimit), false, "there is no amount to compare");
  }
  assert.equal(rows(compare("if-reise-basis", peer, productCatalog)).get(rentalLimit).first.text, noDocumentation);
  const context = materializeCatalogProduct(product("if-reise-basis"), market).facts;
  assert.equal(reviewedRentalLimitExclusion("if-reise-basis", "reise.ulykke.invaliditet", context), undefined);
  const changed = context.map(fact => fact.key === "reise.leiebil.egenandel"
    ? { ...fact, sources: fact.sources.map(source => ({ ...source, page: 3 })) } : fact);
  assert.equal(reviewedRentalLimitExclusion("if-reise-basis", rentalLimit, changed), undefined);
  assert.equal(reviewedRentalLimitExclusion("tryg-nito-reise-familie", rentalLimit, context), undefined);
});

test("ordinary house and cabin public orders align their coverage, keeping documented limits separate", () => {
  for (const [first, second, prefix, firstPage] of [
    ["if-hus-basis", "storebrand-hus-standard", "hus", 6],
    ["if-hytte-basis", "storebrand-hytte-standard", "hytte", 6],
    ["frende-hytte-standard", "storebrand-hytte-standard", "hytte", 6],
    ["if-hus-basis", "gjensidige-hus", "hus", 6],
    ["tryg-hytte-standard", "gjensidige-hytte-standard", "hytte", 7],
  ]) {
    const result = rows(compare(first, second));
    const scope = result.get(prefix + ".pabud.dekning");
    assert.equal(scope.label, "Offentlige påbud – dekning");
    assert.equal(scope.first.state, "included");
    assert.equal(scope.second.state, "included");
    assert.equal(scope.first.sources[0].page, firstPage);
    assert.doesNotMatch(scope.second.text, /1 000 000 kroner/u);
    assert.equal(result.has(prefix + ".pabud.vilkar"), false);
    if (second.startsWith("storebrand-")) {
      const limit = result.get(prefix + ".pabud.grense");
      assert.equal(limit.label, "Offentlige påbud – beløpsgrense");
      assert.match(limit.second.text, /1 000 000 kroner ved skade på fredet eller verneverdig bygning/u);
      assert.equal(limit.second.sources[0].page, 25);
      assert.equal(scope.second.sources[0].page, 25);
    }
  }
  const frende = rows(compare("frende-hytte-standard", "storebrand-hytte-standard")).get("hytte.pabud.grense");
  assert.match(frende.first.text, /førsterisiko inntil 25 %.*250 000 kr/u);
  assert.deepEqual(frende.first.sources.map(termsSourceHref), ["/api/vilkar/frende/hytte-2026-11-20#page=4"]);
  const distinct = rows(compare("klp-hus-hus", "storebrand-hus-standard"));
  assert.match(distinct.get("hus.pabud.vilkar").first.text, /opprettholdelse av opprinnelig innvendig areal/u);
});

test("rental insurance deductibles align while If ordinary theft and vandalism retain their distinct deductible", () => {
  const result = rows(compare("if-hus-basis", "storebrand-hus-standard"));
  const common = result.get("hus.utleie.egenandel");
  assert.match(common.first.text, /Under If Utleieforsikring.*tre måneders husleie/u);
  assert.doesNotMatch(common.first.text, /10 000/u);
  assert.equal(common.first.sources[0].page, 20);
  assert.equal(common.second.state, "optional");
  assert.match(common.second.text, /tre måneders husleie.*minst depositum\/betalingsgaranti/iu);
  assert.equal(common.second.sources[0].page, 4);
  const ordinary = result.get("hus.utleie.tyveri_skadeverk.egenandel");
  assert.match(ordinary.first.text, /ordinært tyveri eller skadeverk.*10 000 kroner/u);
  assert.equal(ordinary.second.text, noDocumentation);
  assert.equal(result.has("hus.utleie.mislighold.egenandel"), false);
  const tryg = rows(compare("if-hus-basis", "tryg-hus"));
  assert.match(tryg.get("hus.utleie.mislighold.egenandel").second.text, /minimum 10 000 kr/u);
});

test("Tryg and KLP share a remote doctor's assistance row without converting the service to an expense limit", () => {
  for (const id of ["klp-reise", "klp-reise-maks"]) {
    const result = rows(compare("tryg-reise-premium", id));
    const row = result.get("reise.tjeneste.legehjelp");
    assert.equal(row.label, "Digital legehjelp");
    assert.match(row.first.text, /Telefonisk tilgang.*365 dager.*Tjeneste, ikke behandlingssum/u);
    assert.match(row.second.text, /Digital lege.*utenfor Norge/u);
    assert.equal(row.second.sources[0].page, 4);
    assert.equal(result.has("reise.medisinsk.online"), false);
  }
});

test("a sourced market clarification remains on the row and is distinct from empty unknown", () => {
  const entry = product("klp-reise");
  const key = "reise.medisinsk.online";
  const component = entry.componentIds.find(id => market.facts[id]?.some(fact => fact.key === key));
  assert.ok(component);
  const original = market.facts[component].find(fact => fact.key === key);
  const annotated = {
    ...original,
    value: "Opplysningene om tilgangen til nettlege må avklares.",
    coverageAvailability: "included",
    requiresSourceClarification: true,
  };
  const scoped = {
    ...market,
    facts: { ...market.facts, [component]: market.facts[component].map(fact => fact === original ? annotated : fact) },
  };
  const result = compare("klp-reise", "tryg-reise", scoped);
  const row = rows(result).get("reise.tjeneste.legehjelp");
  assert.equal(row.first.state, "unknown");
  assert.match(row.first.text, /^Uavklart i kildene.*nettlege/u);
  assert.equal(row.first.facts[0].role, "term");
  assert.deepEqual(row.first.sources.map(termsSourceHref), ["/api/vilkar/klp/reise#page=4"]);
  assert.equal(row.second.text, noDocumentation);
  assert.deepEqual(row.second.sources, []);
  const displayed = productComparisonView(result).flatMap(section => section.groups.flatMap(group => group.rows))
    .find(candidate => candidate.key === "reise.tjeneste.legehjelp");
  assert.deepEqual(displayed.first, row.first);
  const raw = materializeCatalogProduct(entry, { ...scoped, alignComparisonRows: false }).facts;
  assert.ok(raw.some(fact => fact.value === annotated.value && fact.state === "included"));
});
