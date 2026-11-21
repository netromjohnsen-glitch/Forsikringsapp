import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function product(id, catalog = market) {
  const entry = catalog.products.find(product => product.productId === id);
  assert.ok(entry, id);
  return entry;
}

const byKey = (result) => new Map(result.sections.flatMap(section => section.rows).map(row => [row.key, row]));

function comparison(idA, idB) {
  const first = product(idA);
  const second = product(idB);
  const result = compareCatalogProducts(first, second, market);
  const reverse = compareCatalogProducts(second, first, market);
  const rows = byKey(result);
  const swapped = byKey(reverse);
  const visible = new Set(productComparisonView(result)
    .flatMap(section => section.groups.flatMap(group => group.rows.map(row => row.key))));
  return {
    rows,
    assertRow(key, stateA, textA, pageA, stateB, textB, pageB) {
      const row = rows.get(key);
      assert.ok(row, key);
      assert.ok(visible.has(key), key);
      assert.equal(row.first.state, stateA, key);
      assert.equal(row.second.state, stateB, key);
      assert.match(row.first.text, textA, key);
      assert.match(row.second.text, textB, key);
      assert.deepEqual(row.first.sources.map(source => source.page), [pageA], key);
      assert.deepEqual(row.second.sources.map(source => source.page), [pageB], key);
      assert.equal(row.label, swapped.get(key).label, key);
      assert.deepEqual(row.first, swapped.get(key).second, key);
      assert.deepEqual(row.second, swapped.get(key).first, key);
      return row;
    },
  };
}

test("If Hus Basis retains its documented exclusion on the same row as Utvidet and Super cover", () => {
  for (const id of ["if-hus-utvidet", "if-hus-super"]) {
    const row = comparison("if-hus-basis", id).assertRow(
      "hus.rate.dekning", "unavailable", /^Ikke inkludert \/ ikke tilgjengelig.*Sopp og råte er unntatt på Basis\.$/u, 9,
      "included", /^✓ Inkludert.*Ekte hussopp/u, 12,
    );
    assert.deepEqual(row.first.sources.map(termsSourceHref), [
      "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bygningsforsikring#page=9",
    ]);
  }
});

test("both Tryg Delkasko scopes show 3 000 kr for replacement and 0 kr for repair, on the same two rows", () => {
  const result = comparison("bil-delkasko", "tryg-utdanningsforbundet-bil-delkasko");
  for (const [key, amount] of [["glass.egenandel.bytte", /^3 000 kr$/u], ["glass.egenandel.reparasjon", /^0 kr$/u]]) {
    const row = result.assertRow(key, "included", amount, 1, "included", amount, 1);
    assert.equal(row.different, false, key);
    assert.deepEqual(row.first.sources.map(termsSourceHref), ["/api/vilkar/tryg/bil-delkasko-pau25835#page=1"], key);
    assert.deepEqual(row.second.sources.map(termsSourceHref), ["/api/vilkar/tryg/utdanningsforbundet-bil-delkasko-2026-07#page=1"], key);
    assert.ok(row.second.sources.every(source => source.agreementScope === "utdanningsforbundet"), key);
  }
  assert.ok(!result.rows.has("glass.egenandel"));
});

test("Frende and Landkreditt share separate travel-pest cover and deductible rows", () => {
  const result = comparison("frende-reiseforsikring", "landkreditt-reise");
  result.assertRow("reise.tjeneste.skadedyr", "included", /50 000 kr/u, 6, "included", /50 000 kr/u, 19);
  const deductible = result.assertRow("reise.tjeneste.skadedyr.egenandel", "included", /2 000 kr.*500 kr/u, 10,
    "included", /500 kr.*2 000 kr om ikke annet står i beviset/u, 20);
  assert.deepEqual(deductible.second.sources.map(termsSourceHref), ["/api/vilkar/landkreditt/reise#page=20"]);
  assert.ok(!result.rows.has("reise.skadedyr.egenandel"));
  const distinct = materializeCatalogProduct(product("if-reise-super"), market).facts;
  assert.ok(distinct.some(fact => fact.key === "reise.skadedyr.dekning" && /utenlandsreise/u.test(fact.label)));
});

test("Storebrand and KLP place each edition's prepaid excursion cancellation terms together", () => {
  for (const [storebrand, klp, text] of [
    ["storebrand-reise-standard", "klp-reise", /1 000 kr per person/u],
    ["storebrand-reise-super", "klp-reise-maks", /innen avbestillingsrammen/u],
  ]) {
    const result = comparison(storebrand, klp);
    const row = result.assertRow("reise.avbestilling.arrangement", "included", text, 6,
      "included", /10 000 kr per person ved dekket avbestilling/u, 3);
    assert.equal(row.label, "Avbestilling – forhåndsbetalte utflukter og arrangementer");
    assert.ok(!result.rows.has("reise.avbestilling.aktivitet"));
  }
});

test("the Tryg and Storebrand holiday property rental options align theft, vandalism and eviction without mixing them", () => {
  for (const [tryg, storebrand] of [
    ["tryg-hytte-standard", "storebrand-hytte-standard"],
    ["tryg-hytte-ekstra", "storebrand-hytte-super"],
  ]) {
    const result = comparison(tryg, storebrand);
    result.assertRow("hytte.utleie.tyveri", "optional", /500 000 kroner per skadetilfelle.*leietaker eller gjester/u, 1,
      "optional", /leietaker eller husstandsmedlem.*500 000 kroner/u, 47);
    result.assertRow("hytte.utleie.skadeverk", "optional", /500 000 kroner.*Slitasje/u, 1,
      "optional", /Forsettlig skadeverk.*Slitasje/u, 47);
    result.assertRow("hytte.utleie.utkastelse", "optional", /20 000 kroner/u, 1, "optional", /20 000 kroner/u, 47);
    for (const dimension of ["tyveri", "skadeverk", "utkastelse"]) {
      assert.ok(!result.rows.has("hytte.utleie." + dimension + ".grense"), dimension);
    }
  }
});

test("Tryg and Fremtind age reductions share equipment rows while keeping each policy's scope", () => {
  for (const [tryg, fremtind] of [["tryg-hus", "fremtind-hus-standard"], ["tryg-hus-ekstra", "fremtind-hus-topp"]]) {
    const result = comparison(tryg, fremtind);
    result.assertRow("hus.aldersfradrag.luftvarmepumpe", "included",
      /Luft-til-luft- og luft-til-vann-varmepumper.*5 år.*maksimalt 100 %/u, 7, "included",
      /Luft-til-luft- og luft-til-væske-varmepumper.*5 år.*maksimalt 80 %/u, 6);
    result.assertRow("hus.aldersfradrag.tanker_kummer", "included",
      /uansett materiale.*20 år.*maksimalt 100 %/u, 7, "included",
      /annet materiale enn plast eller glassfiber.*20 år.*maksimalt 80 %/u, 6);
    assert.ok(result.rows.has("hus.aldersfradrag.berg_jordvarmepumpe"));
    assert.ok(!result.rows.has("hus.aldersfradrag.varmepumpe"));
  }
  const landkreditt = materializeCatalogProduct(product("landkreditt-hus-standard"), market).facts;
  assert.ok(landkreditt.some(fact => fact.key === "hus.aldersfradrag.varmepumpe" && fact.label === "Varme- og vannpumper"));
});

test("the same car liability choice of law keeps both source records and stays separate from contents geography", () => {
  const result = comparison("sb-bil-ansvar-motor10", "watercircles-bil-ansvar");
  const row = result.assertRow("ansvar.geografi", "included", /Skadestedets bilansvarslov.*EØS.*høyere erstatning/u, 9,
    "included", /Skadestedets lov.*EØS.*høyere dekning/u, 3);
  assert.equal(row.label, "Lovvalg ved trafikkulykke utenfor Norge");
  assert.ok(!result.rows.has("ansvar.utland"));
  const contents = materializeCatalogProduct(product("if-innbo-basis"), market).facts;
  assert.ok(contents.some(fact => fact.key === "ansvar.geografi" && fact.label === "Privatansvar – geografisk område"));
});

test("the document and customer catalog keeps its original field identities", () => {
  for (const [id, key] of [
    ["frende-reiseforsikring", "reise.skadedyr.egenandel"],
    ["storebrand-reise-standard", "reise.avbestilling.aktivitet"],
    ["tryg-hus", "hus.aldersfradrag.varmepumpe"],
    ["fremtind-hus-standard", "hus.aldersfradrag.tanker_kummer"],
  ]) {
    const facts = materializeCatalogProduct(product(id, raw), raw).facts;
    assert.ok(facts.some(fact => fact.key === key), id);
  }
});
