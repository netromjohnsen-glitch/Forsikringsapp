import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import {
  compareCatalogProducts,
  materializeCatalogProduct,
  productComparisonProducts,
} from "../lib/catalog-product-comparison.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedMcBobilMarketEvidence } from "../lib/verified-mc-bobil-market-evidence.ts";

const vehicles = productComparisonProducts(market).filter(({insuranceType}) => ["Bobil", "MC"].includes(insuranceType));
const products = new Map(vehicles.map(product => [product.productId, product]));
const towing = "veihjelp.dekning";
const vehicle = "veihjelp.hjemtransport.dekning";
const persons = "veihjelp.hjemreise.dekning";
const abroad = "veihjelp.ferieutland.leiebil";
const pipes = "bobil.fukt.ror.dekning";

function facts(id, catalog = market) {
  const product = catalog === market ? products.get(id) : catalog.products.find(product => product.productId === id);
  assert.ok(product, id);
  return materializeCatalogProduct(product, catalog).facts;
}

function rows(left, right) {
  return compareCatalogProducts(products.get(left), products.get(right), market)
    .sections.flatMap(section => section.rows);
}

function exactFact(id, key) {
  const matches = facts(id).filter(fact => fact.key === key);
  assert.equal(matches.length, 1, id + ": " + key);
  assert.ok(termsSourceHref(matches[0].sources[0]), id + ": " + key);
  return matches[0];
}

test("roadside towing, vehicle return and passenger travel are separate rows in all insured MC and Bobil tiers", () => {
  const withRoadside = vehicles.filter(({productId}) => facts(productId).some(fact => fact.key === towing));
  assert.equal(vehicles.length, 43);
  assert.equal(withRoadside.length, 31);
  for (const {productId} of vehicles) {
    if (withRoadside.some(product => product.productId === productId)) {
      const assistance = exactFact(productId, towing);
      assert.match(assistance.value, /verksted/u);
      assert.doesNotMatch(assistance.value, /hjemreis|hjemtransport/u);
      assert.equal(exactFact(productId, vehicle).state, "included");
      assert.equal(exactFact(productId, persons).state, "included");
    } else {
      assert.ok(!facts(productId).some(fact => [vehicle, persons].includes(fact.key)), productId);
    }
  }
  const a = "gjensidige-bobil-pluss", b = "frende-bobil-utvidet";
  for (const [left, right] of [[a, b], [b, a]]) {
    const comparison = compareCatalogProducts(products.get(left), products.get(right), market);
    const shown = productComparisonView(comparison).flatMap(s => s.groups).flatMap(g => g.rows);
    for (const key of [towing, vehicle, persons]) {
      assert.equal(shown.filter(row => row.key === key).length, 1, key);
    }
  }
  const result = new Map(rows(a, b).map(row => [row.key, row]));
  assert.match(result.get(vehicle).first.text, /innen to virkedager.*reparert/u);
  assert.match(result.get(vehicle).second.text, /reiseutgifter for én person.*markedsverdi/u);
  assert.match(result.get(persons).second.text, /ikke kan repareres samme dag/u);
  assert.match(termsSourceHref(result.get(vehicle).first.sources[0]), /bobil-pluss#page=4$/u);
  assert.match(termsSourceHref(result.get(vehicle).second.sources[0]), /#page=3$/u);
});

test("foreign-holiday assistance rental is distinct from regular replacement rental and respects tiers", () => {
  const gjBobil = "gjensidige-bobil-pluss";
  const gjMc = "gjensidige-mc-kasko";
  const fk = "fremtind-bobil-kasko-marked-20260924";
  const fm = "fremtind-mc-kasko";
  assert.match(exactFact(gjBobil, abroad + ".dekning").value, /tre virkedager/u);
  assert.match(exactFact(gjMc, abroad + ".dekning").value, /to virkedager/u);
  assert.match(exactFact(gjBobil, abroad + ".dager").value, /15 dager/u);
  assert.match(exactFact(fk, abroad + ".dagsgrense").value, /600 kr/u);
  assert.match(exactFact(fk, abroad + ".dager").value, /45 dager/u);
  assert.match(exactFact(fm, abroad + ".dagsgrense").value, /350 kr/u);
  assert.match(exactFact(fm, abroad + ".dager").value, /30 dager/u);
  assert.match(exactFact(fm, abroad + ".dekning").value, /Driftsstans alene gir ikke dekning/u);
  assert.equal(exactFact(fm, abroad + ".dekning").sources[0].page, 5);
  assert.equal(exactFact(fm, vehicle).sources[0].page, 6);
  assert.equal(exactFact(fk, "leiebil.dekning").state, "optional");
  for (const id of ["gjensidige-bobil-delkasko", "gjensidige-mc-delkasko"]) {
    assert.ok(!facts(id).some(fact => fact.key.startsWith(abroad)));
  }
  for (const [left, right] of [[fm, gjMc], [gjMc, fm]]) {
    const result = rows(left, right);
    for (const key of [abroad + ".dekning", "leiebil.dekning"]) {
      const row = result.find(row => row.key === key);
      assert.ok(row);
      assert.equal(row.first.state, left === fm || key.startsWith(abroad) ? "included" : "unknown");
      assert.equal(row.second.state, right === fm || key.startsWith(abroad) ? "included" : "unknown");
    }
  }
});

test("If Super tube leakage is included without a moisture inspection, and two other exact editions exclude it", () => {
  const a = "if-bobil-super", b = "tryg-bobil-bobil-ekstra", c = "frende-bobil-utvidet";
  assert.match(exactFact(a, pipes).value, /ferskvann, avløp eller varmesystem.*ingen fuktkontroll/u);
  assert.equal(exactFact(a, pipes).sources[0].page, 2);
  for (const id of [b, c]) {
    const forward = rows(a, id).find(row => row.key === pipes);
    const reverse = rows(id, a).find(row => row.key === pipes);
    assert.deepEqual([forward.first.state, forward.second.state], ["included", "unavailable"]);
    assert.deepEqual([reverse.first.state, reverse.second.state], ["unavailable", "included"]);
    assert.match(exactFact(id, pipes).value, /rørbrudd/u);
  }
  assert.ok(!facts("if-bobil-kasko").some(fact => fact.key === pipes));
  assert.ok(!facts("storebrand-bobil-super-motor10").some(fact => fact.key === pipes));
});

test("Tryg MC Ekstra has replacement hire and a separate long-trip spare-parts reimbursement", () => {
  const id = "tryg-mc-mc-ekstra";
  assert.match(exactFact(id, "leiebil.dekning").value, /bil eller motorsykkel.*Faktura/u);
  assert.match(exactFact(id, "leiebil.dagsgrense").value, /500 kr per dag/u);
  assert.match(exactFact(id, "leiebil.dager").value, /10 dager/u);
  assert.match(exactFact(id, "veihjelp.reservedeler.grense").value, /3 000 kr.*tre timers reisetid.*Ingen egenandel/u);
  assert.equal(exactFact(id, "leiebil.dager").sources[0].termsNumber, "PAU27010");
  assert.equal(exactFact(id, persons).sources[0].termsNumber, "PAU25405");
  assert.equal(exactFact("tryg-bobil-kasko", persons).sources[0].termsNumber, "PAU25305");
  assert.ok(!facts("tryg-mc-kasko").some(fact => fact.key === "leiebil.dekning"));
});

test("exact source guards and raw contract remain isolated", () => {
  const id = "if-bobil-super";
  const component = structuredClone(raw.facts[id]);
  const sourceId = "mcb:if:bobil:if-SV707.pdf";
  const sources = { ...market.sources, [sourceId]: { ...market.sources[sourceId], sha256: "changed" } };
  const candidate = { [id]: component };
  addVerifiedMcBobilMarketEvidence(sources, candidate, [products.get(id)]);
  assert.deepEqual(candidate[id], component);
  assert.ok(!facts(id, raw).some(fact => [vehicle, persons, pipes].includes(fact.key)));
  assert.ok(!facts("tryg-mc-mc-ekstra", raw).some(fact => fact.key === "leiebil.dekning"));
  const rooted = new Map([
    [sourceId, "mc-bobil/if-SV707.pdf"],
    ["mcb:tryg:mc:tryg-05PAU27010.pdf", "mc-bobil/tryg-05PAU27010.pdf"],
    ["mcb:tryg:mc:tryg-05PAU25405.pdf", "mc-bobil/tryg-05PAU25405.pdf"],
    ["mcb-ff-fremtind-mc-terms-mini", "mc-bobil/fremtind-mc-terms.pdf"],
    ["mc-bobil:gjensidige-bobil-pluss-vilkar.pdf:bobil", "mc-bobil/gjensidige-bobil-pluss-vilkar.pdf"],
    ["storebrand:motor10:bobil", "storebrand/vilkar-motorvognforsikring-motor10.pdf"],
    ["mcb-ff-frende-bobil-terms:2026-11-20", "frende/2026-11-20/Vilkar_kjoretoyforsikring_20112026.pdf"],
    ["topp-mcb-ff-fremtind-bobil-topp-mini-marked-20260924", "fremtind/current-20260924/bobil-topp.pdf"],
  ]);
  for (const [id, file] of rooted) {
    const digest = createHash("sha256").update(readFileSync(new URL("../catalog/sources/" + file, import.meta.url))).digest("hex");
    assert.equal(digest, market.sources[id].sha256, id);
  }
});
