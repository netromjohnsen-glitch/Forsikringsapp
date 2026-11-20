import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonProducts(marketProductCatalog);
const product = (id) => products.find((entry) => entry.productId === id);
const facts = (id, catalog = marketProductCatalog) =>
  materializeCatalogProduct(catalog.products.find((entry) => entry.productId === id), catalog).facts;
const fact = (id, key) => {
  const entries = facts(id).filter((entry) => entry.key === key);
  assert.equal(entries.length, 1, id + " " + key);
  return entries[0];
};
const rows = (first, second) => compareCatalogProducts(product(first), product(second), marketProductCatalog)
  .sections.flatMap((section) => section.rows);

test("Båt sammenligner jolle, opplagsutstyr og redning med samme vilkårsdimensjon", () => {
  assert.match(fact("storebrand-bat-kasko", "bat.opplagsutstyr.grense").value, /20 000 kr/u);
  assert.equal(termsSourceHref(fact("storebrand-bat-kasko", "bat.opplagsutstyr.grense").sources[0]), "/api/vilkar/storebrand/bat#page=9");
  assert.match(fact("sparebank1-fremtind-bat-toppkasko", "bat.opplagsutstyr.dekning").value, /stativ, presenning og krybbe/u);
  for (const tier of ["kasko", "toppkasko"]) {
    const comparison = rows("storebrand-bat-super", "sparebank1-fremtind-bat-" + tier);
    const coverage = comparison.find((row) => row.key === "bat.jolle.dekning");
    assert.match(coverage.first.text, /4 meter.*10 hk/u);
    assert.match(coverage.second.text, /12 fot.*15 hk/u);
    const limit = comparison.find((row) => row.key === "bat.jolle.grense");
    assert.match(limit.first.text, /forsikringssummen/u);
    assert.match(limit.second.text, /50 000 kr/u);
    assert.equal(termsSourceHref(limit.second.sources[0]), "/api/vilkar/fremtind/bat#page=5");
  }
  for (const id of ["storebrand-bat-delkasko", "storebrand-bat-kasko", "storebrand-bat-super",
    "sparebank1-fremtind-bat-delkasko", "sparebank1-fremtind-bat-kasko", "sparebank1-fremtind-bat-toppkasko"]) {
    assert.equal(fact(id, "bat.redning.dekning").state, "included");
    assert.match(fact(id, "bat.redning.egenandel").value, /750 kr/u);
  }
  assert.equal(facts("storebrand-bat-delkasko", productCatalog).some((item) => item.key === "bat.redning.dekning"), false);
});

test("If Campingvogn arver felles vilkår med riktig grense og tilbygg per nivå", () => {
  for (const tier of ["delkasko", "kasko", "super"]) {
    const id = "if-campingvogn-" + tier;
    assert.equal(fact(id, "campingvogn.redning.dekning").state, "included");
    assert.match(fact(id, "campingvogn.redning.egenandel").value, /750 kr/u);
    const legal = fact(id, "campingvogn.rettshjelp.grense");
    assert.match(legal.value, /100 000 kr per tvist.*250 000 kr samlet/u);
    assert.deepEqual(legal.sources.map(termsSourceHref), [
      "/api/vilkar/if/kjoretoy-mot2-2#page=25",
      "/api/vilkar/if/generelle-vilkar-gen2-9#page=11",
    ]);
    const cap = fact(id, "campingvogn.losore.grense");
    assert.match(cap.value, tier === "super" ? /100 000 kr samlet/u : /40 000 kr samlet.*50 %/u);
    assert.equal(fact(id, "campingvogn.fortelt.dekning").state, tier === "delkasko" ? "unavailable" : "included");
    if (tier !== "delkasko") assert.match(fact(id, "campingvogn.fortelt.grense").value, /40 000 kr/u);
  }
  const fixedSite = fact("if-campingvogn-super", "campingvogn.redning.grense");
  assert.match(fixedSite.value, /5 000 kr samlet.*frigjøre.*kjørbar vei/u);
  assert.equal(termsSourceHref(fixedSite.sources[0]), "/api/vilkar/if/campingvogn-bobil-sv707#page=2");
});

test("If Bobil skiller rettshjelpsgrense fra en betinget utleieegenandel", () => {
  for (const tier of ["ansvar", "delkasko", "kasko", "super"]) {
    const id = "if-bobil-" + tier;
    const legal = fact(id, "rettshjelp.grense");
    assert.match(legal.value, /100 000 kr per tvist.*250 000 kr samlet/u);
    assert.deepEqual(legal.sources.map(termsSourceHref), [
      "/api/vilkar/if/kjoretoy-mot2-2#page=25",
      "/api/vilkar/if/generelle-vilkar-gen2-9#page=11",
    ]);
    if (tier === "ansvar") {
      assert.equal(facts(id).some((item) => item.key === "bobil.utleie.egenandel"), false);
    } else {
      const rental = fact(id, "bobil.utleie.egenandel");
      assert.equal(rental.role, "term");
      assert.match(rental.value, /10 000 kr.*utleid.*avtalt med If på forhånd/u);
      assert.equal(termsSourceHref(rental.sources[0]), "/api/vilkar/if/campingvogn-bobil-sv707#page=5");
      assert.equal(facts(id).some((item) => item.key === "bobil.utleie.dekning"), false);
    }
  }
});

test("Storebrand Tilhenger viser 750 kr ved veihjelp på egen rad mot Fremtind", () => {
  for (const tier of ["brann-og-tyveri", "kasko"]) {
    const id = "storebrand-tilhenger-" + tier;
    const comparison = rows(id, "eika-fremtind-tilhenger-kasko");
    const rescue = comparison.find((row) => row.key === "tilhenger.redning.egenandel");
    assert.equal(rescue.first.text, "750 kr.");
    assert.equal(rescue.second.text, "500 kr");
    assert.equal(termsSourceHref(rescue.first.sources[0]), "/api/vilkar/storebrand/campingvogn-tilhenger-camp02#page=6");
  }
});

test("Reise plasserer kontanter, reisedokumenter, nøkler og verdisaker på egne rader", () => {
  const standard = "watercircles-reise-standard";
  const elite = "watercircles-reise-elite";
  const land = "landkreditt-reise";
  assert.match(fact(standard, "reise.bagasje.kontanter").value, /3 000 kr per skadetilfelle/u);
  assert.match(fact(elite, "reise.bagasje.kontanter").value, /10 000 kr per skadetilfelle/u);
  assert.match(fact(standard, "reise.bagasje.pass_billetter").value, /10 000 kr per person.*50 000 kr per familie/u);
  assert.match(fact(elite, "reise.bagasje.pass_billetter").value, /15 000 kr per skadetilfelle.*75 000 kr per familie/u);
  for (const id of [standard, elite]) {
    assert.match(fact(id, "reise.bagasje.nokler").value, /5 000 kr per skadetilfelle/u);
    assert.match(fact(id, "reise.bagasje.verdisaker").value, /150 000 kr per skadetilfelle.*300 000 kr per familie/u);
    assert.doesNotMatch(fact(id, "reise.bagasje.per_gjenstand").value, /150 000|300 000/u);
  }
  assert.match(fact(land, "reise.bagasje.kontanter").value, /5 000 kr per sikret.*gavekort og verdipapirer er unntatt/u);
  assert.match(fact(land, "reise.bagasje.pass_billetter").value, /20 000 kr per sikret/u);
  assert.match(fact(land, "reise.bagasje.nokler").value, /4 000 kr ved tap av nøkler/u);
  for (const id of [standard, elite, land]) {
    const comparison = rows(id, "frende-reiseforsikring");
    for (const key of ["reise.bagasje.kontanter", "reise.bagasje.pass_billetter", "reise.bagasje.nokler"]) {
      const row = comparison.find((entry) => entry.key === key);
      assert.equal(row.first.state, "included");
      assert.equal(row.second.state, "included");
    }
  }
});

test("KLP Reise og Reise Maks har den dokumenterte passgrensen på samme rad som Landkreditt", () => {
  const key = "reise.bagasje.pass_billetter";
  for (const [id, slug] of [["klp-reise", "reise"], ["klp-reise-maks", "reise-maks"]]) {
    const row = rows(id, "landkreditt-reise").find((entry) => entry.key === key);
    assert.equal(row.first.state, "included");
    assert.equal(row.second.state, "included");
    assert.match(row.first.text, /10 000 kr per person/u);
    assert.match(row.second.text, /20 000 kr per sikret/u);
    assert.equal(row.first.sources.length, 1);
    assert.equal(row.first.sources[0].documentId, id);
    assert.equal(termsSourceHref(row.first.sources[0]), `/api/vilkar/klp/${slug}#page=3`);
    assert.ok(facts(id, productCatalog).every((entry) => entry.key !== key));
  }
  assert.match(fact("klp-reise-maks", "reise.leiebil.vilkar").value, /bilkollektiv/u);
});

test("Reise skiller tilleggsdekning fra vilkår for eksisterende leiebildekning", () => {
  const standard = "watercircles-reise-standard";
  const elite = "watercircles-reise-elite";
  const delayKey = "reise.forsinkelse.hotell_arrangement";
  assert.equal(fact(standard, delayKey).state, "unavailable");
  assert.equal(fact(elite, delayKey).state, "included");
  assert.match(fact(elite, delayKey).value, /5 000 kr per person.*minst åtte timer/u);
  assert.equal(termsSourceHref(fact(elite, delayKey).sources[0]), "/api/vilkar/watercircles/reise-2-17#page=7");
  assert.equal(fact(standard, "reise.leiebil.egenandel").state, "unavailable");
  assert.equal(fact(elite, "reise.leiebil.egenandel").state, "included");
  const land = fact("landkreditt-reise", "reise.leiebil.vilkar");
  assert.match(land.value, /gyldig førerkort.*hastighetsløp.*bilpool.*verksted/u);
  assert.equal(fact("landkreditt-reise", "reise.leiebil.egenandel").state, "included");
  const klp = fact("klp-reise-maks", "reise.leiebil.vilkar");
  assert.match(klp.value, /godkjent utleiefirma.*Andre kjøretøy enn bil og motorsykkel.*bilkollektiv/u);
  assert.equal(termsSourceHref(klp.sources[0]), "/api/vilkar/klp/reise-maks#page=6");
  assert.equal(fact("klp-reise-maks", "reise.leiebil.egenandel").state, "included");
});
