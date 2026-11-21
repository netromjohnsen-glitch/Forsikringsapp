import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedBilAccessoryMarketEvidence } from "../lib/verified-bil-accessory-market-evidence.ts";

const cable = "ladekabel.dekning";
const cableDeductible = "ladekabel.egenandel";
const keyCoverage = "bilnokkel.dekning";
const keyCap = "bilnokkel.grense";
const keyDeductible = "bilnokkel.egenandel";
const date = new Date("2026-11-21T12:00:00Z");

function product(id, catalog = market) {
  const result = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(result, "Expected product " + id);
  return result;
}

function comparison(first, second) {
  return new Map(compareCatalogProducts(product(first), product(second), market).sections
    .flatMap(section => section.rows).map(row => [row.key, row]));
}

function facts(id, key, catalog = market) {
  return resolveCatalogFacts(product(id, catalog), [], date, null, catalog).filter(fact => fact.key === key);
}

test("ordinary car charging cable rows respect coverage level and align across providers", () => {
  const variants = [
    ["if-bil-delkasko", /brann eller tyveri/u, 3, 5],
    ["if-bil-kasko", /brann, tyveri eller kaskoskade/u, 3, 6],
    ["if-bil-super", /plutselig ytre skade, tyveri eller hærverk/u, 12, 12],
    ["klp-bil-delkasko", /brann, tyveri eller tyveriforsøk/u, 1, 8],
    ["klp-bil-kasko", /Kasko omfatter også dekket plutselig ytre skade/u, 1, 8],
    ["klp-bil-kasko-maks", /Kasko omfatter også dekket plutselig ytre skade/u, 1, 9],
    ["watercircles-bil-delkasko", /Tyveri av ladekabel til motorvognen/u, 4],
    ["watercircles-bil-kasko", /Tyveri av ladekabel til motorvognen/u, 4],
    ["watercircles-bil-elite", /Tyveri av ladekabel til motorvognen/u, 4],
    ["frende-bil-kasko", /elbil eller hybridbil.*dekket skade eller tyveri/u, 2, 9],
    ["frende-bil-utvidet", /Skadet eller stjålet ladekabel.*uten bonustap/u, 4],
  ];
  for (const [id, text, page, qualifier] of variants) {
    const [fact, ...duplicates] = facts(id, cable);
    assert.ok(fact, id);
    assert.deepEqual(duplicates, [], id);
    assert.equal(fact.source.page, page, id);
    assert.equal(fact.qualificationSource?.page, qualifier, id);
    const row = comparison(id, "landkreditt-bil-kasko-pluss").get(cable);
    assert.equal(row.first.state, "included", id);
    assert.match(row.first.text, text, id);
    assert.equal(row.second.state, "included", id);
    assert.deepEqual(comparison("landkreditt-bil-kasko-pluss", id).get(cable).second, row.first, id);
  }

  for (const id of ["if-bil-ansvar", "klp-bil-ansvar", "watercircles-bil-ansvar", "frende-bil-ansvar", "landkreditt-bil-ansvar"]) {
    assert.deepEqual(facts(id, cable), [], id);
    assert.deepEqual(facts(id, cableDeductible), [], id);
  }
});

test("key and cable deductibles and key caps retain the terms' scope", () => {
  const deductibles = [
    ["if-bil-super", /^1 000 kr/u, 12],
    ["landkreditt-bil-kasko-pluss", /^1 000 kr/u, 14],
    ["frende-bil-kasko", /^Avtalt kaskoegenandel/u, 9],
    ["frende-bil-utvidet", /^Ingen egenandel/u, 4],
  ];
  for (const [id, value, page] of deductibles) {
    for (const key of [keyDeductible, cableDeductible]) {
      const entries = facts(id, key);
      assert.equal(entries.length, 1, id + " " + key);
      assert.equal(entries[0].deductibleClassification, "coverage");
      assert.equal(entries[0].source.page, page);
      const row = comparison(id, "klp-bil-kasko-maks").get(key);
      assert.equal(row.first.state, "included");
      assert.match(row.first.text, value);
      assert.match(row.second.text, /750/u);
    }
  }

  const caps = comparison("klp-bil-kasko-maks", "watercircles-bil-elite").get(keyCap);
  assert.match(caps.first.text, /12 000 kr/u);
  assert.match(caps.second.text, /20 000 kr/u);
  assert.equal(termsSourceHref(caps.first.sources[0]), "https://www.klp.no/media/forsikring/Privatbil-Kasko-maks.pdf#page=3");
  assert.equal(termsSourceHref(caps.second.sources[0]), "https://www.watercircles.no/wp-content/uploads/2026/02/WaterCircles-Bil-vilkar-WtCBil-2.19-01.03.26.pdf#page=14");

  const limits = comparison("if-bil-super", "landkreditt-bil-kasko-pluss");
  assert.equal(limits.has(keyCap), false);
  assert.match(limits.get("parkering.grense").first.text, /20 000 kr per skadetilfelle/u);
  assert.match(limits.get("parkering.grense").second.text, /25 000 kroner samlet.*ett tilfelle per år/u);
  assert.equal(termsSourceHref(limits.get(cableDeductible).first.sources[0]), "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=MOT2-2#page=12");
  assert.equal(termsSourceHref(limits.get(cableDeductible).second.sources[0]), "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-motorvogn.pdf#page=14");

  const coverage = comparison("frende-bil-utvidet", "sb-bil-super-motor10").get(keyCoverage);
  assert.match(coverage.first.text, /fjernkontroll til motor og kupévarmer/u);
  assert.match(coverage.second.text, /Gjenglemte nøkler.*unntatt/u);
  assert.equal(termsSourceHref(coverage.first.sources[0]), "/api/vilkar/frende/bil-2026-11-20#page=4");
  assert.equal(termsSourceHref(coverage.second.sources[0]), "/api/vilkar/storebrand/motor10#page=17");
  assert.deepEqual(facts("sb-bil-kasko-motor10", keyCoverage), []);
});

test("new facts bind to the verified ordinary product and exact archived document", () => {
  const archive = [
    ["ifSuper", "if/Kjoretoyforsikring-MOT2-2.pdf"],
    ["frendeKasko:2026-11-20", "frende/2026-11-20/Vilkar_kjoretoyforsikring_20112026.pdf"],
    ["new-private:klp-bil-delkasko.pdf", "new-private-motor-home/klp-bil-delkasko.pdf"],
    ["new-private:klp-bil-kasko.pdf", "new-private-motor-home/klp-bil-kasko.pdf"],
    ["new-private:klp-bil-kasko-maks.pdf", "new-private-motor-home/klp-bil-kasko-maks.pdf"],
    ["new-private:watercircles-bil.pdf", "new-private-motor-home/watercircles-bil.pdf"],
    ["new-private:landkreditt-bil.pdf", "new-private-motor-home/landkreditt-bil.pdf"],
    ["storebrand:motor10:bil", "storebrand/vilkar-motorvognforsikring-motor10.pdf"],
  ];
  for (const [id, path] of archive) {
    const file = new URL("../catalog/sources/" + path, import.meta.url);
    assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), market.sources[id].sha256, id);
  }

  const ifSuper = product("if-bil-super");
  const existing = { ifSuper: raw.facts.ifSuper };
  const wrongSource = { ifSuper: { ...market.sources.ifSuper, sha256: "another PDF" } };
  addVerifiedBilAccessoryMarketEvidence(wrongSource, existing, [ifSuper]);
  assert.equal(existing.ifSuper, raw.facts.ifSuper);
  for (const mismatch of [{ version: "another version" }, { agreementScope: "member" }]) {
    addVerifiedBilAccessoryMarketEvidence(market.sources, existing, [{ ...ifSuper, ...mismatch }]);
    assert.equal(existing.ifSuper, raw.facts.ifSuper);
  }
  assert.deepEqual(facts("if-bil-super", cableDeductible, raw), []);
});
