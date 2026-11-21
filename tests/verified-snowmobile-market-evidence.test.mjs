import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { addVerifiedSnowmobileMarketEvidence } from "../lib/verified-snowmobile-market-evidence.ts";

const choices = productComparisonProducts(market);
const product = id => market.products.find(entry => entry.productId === id);
const facts = id => materializeCatalogProduct(product(id), market).facts;
const accident = "snoscooter.ulykke.grense";
const theftDeductible = "snoscooter.tyveri.egenandel";
const rescue = "snoscooter.redning.dekning";
const looseGear = "snoscooter.losore.dekning";
const drivingGear = "snoscooter.kjoreutstyr.dekning";
const ifMot2 = "/api/vilkar/if/kjoretoy-mot2-2";
const fremtindTerms = "/api/vilkar/fremtind/kasko-snoscooter";
const ifSv692 = "https://if.no/apps/vilkarsbasendokument/Vilkaar?dt=2020-11-07&vilkaar=SV692";

function fact(id, key) {
  const rows = facts(id).filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " " + key);
  return rows[0];
}

function compareRow(first, second, key) {
  return compareCatalogProducts(
    choices.find(plan => plan.productId === first), choices.find(plan => plan.productId === second), market,
  ).sections.flatMap(section => section.rows).find(row => row.key === key);
}

function assertPage(source, page, href) {
  assert.equal(source.page, page);
  assert.equal(termsSourceHref(source), href + "#page=" + page);
}

test("If viser fører- og passasjerulykkens satser på alle snøscooternivåer", () => {
  for (const level of ["ansvar", "delkasko", "kasko"]) {
    const own = fact("if-snoscooter-" + level, accident);
    assert.equal(own.state, "included");
    assert.match(own.value, /100 000 kr per forsikret ved dødsfall.*200 000 kr per forsikret/u);
    assertPage(own.sources[0], 22, ifMot2);
  }
  const row = compareRow("if-snoscooter-ansvar", "tryg-snoscooter-ansvar-marked", accident);
  assert.equal(row.first.state, "included");
  assert.equal(row.second.state, "optional");
});

test("If bruker snøscooterens eksakte særvilkår for tilleggslås på begge nivåer uten dublett", () => {
  for (const level of ["delkasko", "kasko"]) {
    const id = "if-snoscooter-" + level;
    const row = fact(id, theftDeductible);
    assert.match(row.value, /forsikringsbeviset.*2 000 kr reduksjon.*FG-godkjent tilleggslås.*godkjent alarm i tillegg/u);
    assertPage(row.sources[0], 3, ifSv692);
    const terms = market.sources[row.sources[0].documentId];
    assert.equal(terms.insuranceType, "Snøscooter");
    assert.ok(terms.productIds.includes(id));
    assert.equal(termsSourceHref(row.sources[1]), "https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring");
    const theft = fact(id, "snoscooter.tyveri.dekning");
    assert.match(theft.value, /tyveri, tyveriforsøk eller innbrudd/u);
    assertPage(theft.sources[0], 5, ifMot2);
  }
  assert.ok(facts("if-snoscooter-ansvar").every(row => row.key !== theftDeductible));
});

test("Fremtind og Tryg sammenlignes på samme redningsrad med hver sine vilkår", () => {
  for (const [fremtindLevel, trygLevel, slug, page] of [
    ["minikasko", "brann-og-tyveri", "snoscooter-brann-tyveri-2026-10", 1],
    ["kasko", "kasko", "snoscooter-kasko-2026-10", 2],
  ]) {
    const fremtind = "eika-fremtind-snoscooter-" + fremtindLevel;
    const tryg = "tryg-snoscooter-" + trygLevel + "-marked";
    const row = compareRow(fremtind, tryg, rescue);
    assert.equal(row.first.state, "included");
    assert.match(row.first.text, /nærmeste verksted.*Driftsstans alene.*unntatt/u);
    assertPage(row.first.sources[0], 5, fremtindTerms);
    assert.equal(row.second.state, "unavailable");
    assert.match(row.second.text, /transport av snøscooteren til nærmeste reparasjonsverksted/u);
    assertPage(row.second.sources[0], page, "/api/vilkar/tryg/" + slug);
    const excess = fact(fremtind, "snoscooter.redning.egenandel");
    assert.match(excess.value, /500 kr/u);
    assertPage(excess.sources[0], 7, fremtindTerms);
    assert.match(fact(fremtind, "snoscooter.brann.dekning").value, /brann, lynnedslag eller eksplosjon/u);
    const theftCoverage = fact(fremtind, "snoscooter.tyveri.dekning");
    assert.match(theftCoverage.value, /brukstyveri.*husstand eller er ansatt sjåfør/u);
    assertPage(theftCoverage.sources[0], 4, fremtindTerms);
    const theft = fact(fremtind, theftDeductible);
    assert.match(theft.value, /inntil 4 000 kr.*FG-godkjent eller fabrikkmontert alarm.*søke- og gjenfinningssystem/u);
    assertPage(theft.sources[0], 7, fremtindTerms);
  }
});

test("Snøscooter viser personlig kjøreutstyr adskilt fra vanlig bagasje", () => {
  const first = "if-snoscooter-delkasko";
  const second = "eika-fremtind-snoscooter-minikasko";
  const gear = compareRow(first, second, drivingGear);
  assert.match(gear.first.text, /hjelm, kjøredress, hansker.*fastlåst/u);
  assertPage(gear.first.sources[0], 1, ifSv692);
  assert.match(gear.second.text, /Kjøreutstyr for snøscooter er omfattet/u);
  assertPage(gear.second.sources[0], 4, fremtindTerms);
  const bags = compareRow(first, second, looseGear);
  assert.equal(bags.first.state, "included");
  assert.equal(bags.second.state, "unavailable");
  const tryg = fact("tryg-snoscooter-kasko-marked", drivingGear);
  assert.match(tryg.value, /Hjelm omfattes/u);
  assertPage(tryg.sources[0], 1, "/api/vilkar/tryg/snoscooter-kasko-2026-10");
});

test("Rettelsene bruker eksakte snøscooterdokumenter og favner bare valgte utgaver", () => {
  for (const [id, key] of [
    ["if-snoscooter-ansvar", accident], ["eika-fremtind-snoscooter-minikasko", rescue], ["tryg-snoscooter-kasko-marked", rescue],
  ]) {
    const source = market.sources[product(id).sourceId];
    const reference = fact(id, key).sources[0];
    const href = termsSourceHref(reference);
    const archive = termsArchiveDocuments.find(entry =>
      href === "/api/vilkar/" + entry.provider + "/" + entry.slug + "#page=" + reference.page);
    assert.ok(archive);
    assert.equal(createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex"), source.sha256);
    assert.ok((productCatalog.facts[id] ?? []).every(row => row.key !== key));
    const rawFacts = { ...productCatalog.facts };
    const sources = { ...market.sources, [source.id]: { ...source, sha256: "annen-utgave" } };
    addVerifiedSnowmobileMarketEvidence(sources, rawFacts, market.products);
    assert.equal(rawFacts[id], productCatalog.facts[id]);
  }
  assert.ok(facts("if-campingvogn-kasko").every(row => !row.key.startsWith("snoscooter.")));
});
