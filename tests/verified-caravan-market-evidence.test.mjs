import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedCaravanMarketEvidence } from "../lib/verified-caravan-market-evidence.ts";

const product = (id, catalog = marketProductCatalog) => catalog.products.find(p => p.productId === id);
const facts = (id, catalog = marketProductCatalog) => materializeCatalogProduct(product(id, catalog), catalog).facts;
const fact = (id, key) => {
  const matches = facts(id).filter(f => f.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
};
const compared = (a, b) => compareCatalogProducts(product(a), product(b), marketProductCatalog)
  .sections.flatMap(section => section.rows);
const row = (a, b, key) => compared(a, b).find(row => row.key === key);
const towing = "campingvogn.redning.dekning";
const recovery = "campingvogn.redning.hjemtransport.dekning";
const fixedSite = "campingvogn.redning.fast_plass.grense";

test("Campingvogn skiller berging til verksted fra hjemtransport før og etter reparasjon", () => {
  for (const [gjTier, ifTier, gjPage] of [["delkasko", "delkasko", 3], ["kasko", "kasko", 4], ["pluss", "super", 3]]) {
    const gj = "gjensidige-campingvogn-" + gjTier;
    const iff = "if-campingvogn-" + ifTier;
    const work = row(gj, iff, towing);
    assert.match(work.first.text, /nærmeste verksted.*står på vei og var kjørbar/u);
    assert.match(work.second.text, /nærmeste egnede verksted.*normalt fremkommelig/u);
    assert.doesNotMatch(work.first.text + work.second.text, /hjemtransport/iu);
    const home = row(gj, iff, recovery);
    assert.equal(home.label, "Hjemtransport av campingvognen");
    assert.equal(home.first.state, "included");
    assert.equal(home.second.state, "included");
    assert.match(home.first.text, /gjenfunnet etter tyveri.*to virkedager/u);
    assert.match(home.second.text, /etter ferdig reparasjon.*trafikksikker stand innen tre dager/u);
    assert.equal(termsSourceHref(home.first.sources[0]), "/api/vilkar/gjensidige/campingvogn-" + gjTier + "#page=" + gjPage);
    assert.equal(termsSourceHref(home.second.sources[0]), "/api/vilkar/if/kjoretoy-mot2-2#page=6");
    assert.equal(row(iff, gj, recovery).first.text, home.second.text);
    const gjException = fact(gj, "campingvogn.redning.hjemtransport.begrensning");
    assert.match(gjException.value, /fører eller passasjer kan kjøre hjem.*trekkvognens veihjelp/u);
    assert.equal(gjException.sources[0].page, gjTier === "delkasko" ? 3 : 4);
  }
});

test("Campingvogn sammenligner frigjøring fra fast plass som egen beløpsgrense", () => {
  const iff = "if-campingvogn-super";
  for (const tier of ["brann-og-tyveri", "kasko", "super"]) {
    const storebrand = "storebrand-campingvogn-" + tier;
    const amount = row(iff, storebrand, fixedSite);
    for (const value of [amount.first, amount.second]) {
      assert.equal(value.state, "included");
      assert.match(value.text, /5 000 kr samlet.*frigjøre.*kjørbar vei/u);
    }
    assert.equal(termsSourceHref(amount.first.sources[0]), "/api/vilkar/if/campingvogn-bobil-sv707#page=2");
    assert.equal(termsSourceHref(amount.second.sources[0]), "/api/vilkar/storebrand/campingvogn-tilhenger-camp02#page=6");
    const transport = row(iff, storebrand, "campingvogn.redning.grense");
    assert.match(transport.first.text, /50 % av campingvognens verdi/u);
    assert.doesNotMatch(fact(storebrand, towing).value, /5 000 kr/u);
  }
  assert.ok(facts("if-campingvogn-kasko").every(f => f.key !== fixedSite));
});

test("Ferieavbrudd sammenligner dagsbeløp og varighet hver for seg for alle fire garantier", () => {
  const gg = "gjensidige-campingvogn-pluss";
  const amountKey = "campingvogn.ferie.dagsbelop";
  const daysKey = "campingvogn.ferie.dager";
  for (const [id, days, sourcePage] of [
    [gg, 14, "/api/vilkar/gjensidige/campingvogn-pluss#page=4"],
    ["tryg-campingvogn-campingvogn-ekstra", 14, "https://www.tryg.no/odpdf?vilkNr=05PAU27016&vilk=campingvogn-ekstra#page=1"],
    ["if-campingvogn-super", 15, "/api/vilkar/if/campingvogn-bobil-sv707#page=3"],
    ["storebrand-campingvogn-super", 15, "/api/vilkar/storebrand/campingvogn-tilhenger-camp02#page=8"],
  ]) {
    assert.match(row(gg, id, amountKey).second.text, /1 500 kr per dag/u);
    assert.match(row(gg, id, daysKey).second.text, new RegExp(String(days) + " dager", "u"));
    assert.equal(termsSourceHref(fact(id, amountKey).sources[0]), sourcePage);
    assert.equal(termsSourceHref(fact(id, daysKey).sources[0]), sourcePage);
    assert.ok(facts(id).every(f => f.key !== "campingvogn.ferie.grense"));
    assert.ok(facts(id, productCatalog).some(f => f.key === "campingvogn.ferie.grense"));
  }
  assert.equal(row(gg, "tryg-campingvogn-kasko", daysKey).second.state, "unknown");
  assert.equal(row("storebrand-campingvogn-super", "storebrand-campingvogn-brann-og-tyveri",
    "campingvogn.naturskade.dekning").first.state, "included");
});

test("Avvikende utgave av Ifs særvilkår endrer ikke de eksisterende Super-feltene", () => {
  const id = "if-campingvogn-super";
  const sourceId = "vehicle:if-SV707.pdf";
  const sources = { ...marketProductCatalog.sources,
    [sourceId]: { ...marketProductCatalog.sources[sourceId], sha256: "endret" } };
  const existing = [...productCatalog.facts[id]];
  const components = { [id]: existing };
  addVerifiedCaravanMarketEvidence(sources, components, [product(id)]);
  assert.equal(components[id], existing);
});
