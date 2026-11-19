import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { storebrandMotorMarket, storebrandMotorMarketArchives } from "../lib/storebrand-motor-market.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const market = storebrandMotorMarket;
const route = "/api/vilkar/storebrand/motor10";
const fact = (component, key) => market.facts[component + "-motor10"].find(row => row.key === key);

test("Storebrand motor10 has an ordinary current-market replacement for each motor09 level and rental choice", () => {
  assert.equal(market.replacesProductIds.length, 14);
  assert.equal(market.addOns.length, 4);
  for (const originalId of market.replacesProductIds) {
    const old = productCatalog.products.find(product => product.productId === originalId);
    const current = marketProductCatalog.products.find(product => product.productId === originalId + "-motor10");
    assert.ok(old && current, originalId);
    assert.equal(marketProductCatalog.products.some(product => product.productId === originalId), false, originalId);
    assert.equal(current.version, "motor10");
    assert.equal(current.name, old.name);
    assert.equal(current.insuranceType, old.insuranceType);
    assert.deepEqual(current.componentIds, old.componentIds.map(component => component + "-motor10"));
    if (old.inheritsProductId) assert.equal(current.inheritsProductId, old.inheritsProductId + "-motor10");
  }
  for (const addOn of market.addOns) {
    assert.ok(marketProductCatalog.addOns.some(option => option.id === addOn.id), addOn.id);
    assert.ok(addOn.requiresLevel.every(level => market.products.some(product => product.productId === level)), addOn.id);
  }
  assert.equal(productCatalog.facts.sbSuper.find(row => row.key === "parkering.grense").value, "Inntil 25 000 kr");
  assert.equal(productCatalog.facts["storebrand-bobil-super"].find(row => row.key === "bobil.fukt.alder").value, "Nyere enn 8 år fra produksjonsår");
});

test("every Storebrand motor10 fact opens its exact immutable PDF and bounded physical page", () => {
  const [document] = storebrandMotorMarketArchives;
  const bytes = readFileSync(new URL("../" + document.archivePath, import.meta.url));
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  for (const source of Object.values(market.sources)) assert.equal(source.sha256, sha256);
  for (const [component, rows] of Object.entries(market.facts)) {
    for (const row of rows) {
      for (const source of [row.source, row.qualificationSource].filter(Boolean)) {
        assert.ok(source.page >= 1 && source.page <= 33, component + " " + row.key);
        assert.equal(source.effectiveFrom, "2026-11-15", component + " " + row.key);
        assert.equal(termsSourceHref(source), route + "#page=" + source.page, component + " " + row.key);
      }
    }
  }
});

test("motor10 market displays changed terms and correct physical source pages", () => {
  const cases = [
    ["sbAnsvar", "geografi.dekning", /Europa.*reiseadvarsel/, 6],
    ["sbKasko", "veihjelp.geografi", /Europa.*reiseadvarsel/, 6],
    ["sbDelkasko", "ladekabel.egenandel", /1 000 kr/, 10],
    ["sbDelkasko", "glass.dekning", /ytre hendelse.*Slitasje og riper/, 12],
    ["sbDelkasko", "natur.dekning", /Direkte.*stasjonære/, 12],
    ["sbSuper", "parkering.grense", /Ubegrenset beløp/, 13],
    ["sbSuper", "maskinskade.egenandel.150000-200000", /20 000 kr/, 17],
    ["sbSuper", "maskinskade.komponenter", /multifunksjonsratt.*infotainmentsystemet/, 15],
    ["sbLeiebilUtvidet", "leiebil.unntak", /garanti eller reklamasjonsrett/, 19],
    ["storebrand-bobil-super", "bobil.fukt.alder", /12 år/, 18],
    ["storebrand-bobil-super", "bobil.fukt.kontroll", /årlige kontroller fra bobilen var ny/, 18],
    ["storebrand-bobil-super", "bobil.fukt.begrensning", /snøtyngde/, 18],
    ["storebrand-mc-kasko", "rettshjelp.egenandel", /4 000 kr/, 33],
    ["storebrand-snoscooter-kasko", "snoscooter.rettshjelp.grense", /100 000 kr/, 33],
  ];
  for (const [component, key, value, page] of cases) {
    const row = fact(component, key);
    assert.ok(row, component + " " + key);
    assert.match(row.value, value);
    assert.equal(row.source.page, page);
  }
  assert.equal(fact("sbSuper", "parkering.grense").qualificationSource.page, 17);
  assert.equal(fact("sbSuper", "maskinskade.dekning").qualificationSource.page, 16);
  assert.equal(fact("sbDelkasko", "ladekabel.egenandel").qualificationSource.page, 13);
});
