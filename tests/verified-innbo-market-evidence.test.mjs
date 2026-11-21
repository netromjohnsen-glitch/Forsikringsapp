import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { addVerifiedInnboMarketEvidence } from "../lib/verified-innbo-market-evidence.ts";

const freezer = "innbo.fryserinnhold.dekning";
const freezerCap = "innbo.fryserinnhold.grense";
const move = "flytting.dekning";
const theftCap = "flytting.tyveri.grense";

const find = id => market.products.find(product => product.productId === id);
function rows(first, second) {
  const result = compareCatalogProducts(find(first), find(second), market);
  return new Map(result.sections.flatMap(section => section.rows).map(row => [row.key, row]));
}

test("ordinary frozen-food coverage separates triggers, limits and If product levels", () => {
  for (const tier of ["tryg-innbo", "tryg-innbo-ekstra"]) {
    const comparison = rows(tier, "if-innbo-super");
    const coverage = comparison.get(freezer);
    assert.equal(coverage.first.state, "included");
    assert.equal(coverage.second.state, "included");
    assert.match(coverage.first.text, /fryseskap eller fryseboks.*plutselig svikt i strømforsyningen eller frysesystemet/u);
    assert.match(coverage.second.text, /strømbrudd, kortslutning, lysbue, overslag eller overspenning/u);
    const cap = comparison.get(freezerCap);
    assert.match(cap.first.text, /15 000 kr samlet/u);
    assert.match(cap.second.text, /40 000 kr/u);
    assert.equal(termsSourceHref(cap.first.sources[0]), "https://www.tryg.no/odpdf?vilk=Hjemforsikring-Dekningsvilkaar&vilkNr=05PPK13301#page=4");
    assert.equal(termsSourceHref(cap.second.sources[0]), "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Innboforsikring#page=8");
    assert.deepEqual(rows("if-innbo-super", tier).get(freezer).second, coverage.first);
  }
  for (const tier of ["if-innbo-basis", "if-innbo-utvidet"]) {
    const coverage = rows(tier, "if-innbo-super").get(freezer).first;
    assert.equal(coverage.state, "unavailable");
    assert.match(coverage.text, /bare med Super/u);
    assert.equal(coverage.sources[0].page, 8);
  }
});

test("fridge/freezer treatment follows the exact Gjensidige, Fremtind and Storebrand terms", () => {
  for (const id of ["gj-innbo", "gj-innbo-pluss"]) {
    const gj = rows(id, "fremtind-innbo-standard").get(freezer).first;
    assert.match(gj.text, /luktskade på fryser eller kjøleskap/u);
    assert.equal(gj.sources.length, 1);
    assert.equal(gj.sources[0].page, 4);
  }
  for (const [tier, cap] of [["standard", "20 000"], ["topp", "50 000"]]) {
    const comparison = rows("fremtind-innbo-" + tier, "sb-innbo-super-innbo10");
    assert.match(comparison.get(freezer).first.text, /fryser eller kjøleskap.*straks.*besiktigelse/u);
    assert.match(comparison.get(freezerCap).first.text, new RegExp(cap + " kr for matvarer", "u"));
    assert.match(comparison.get(freezerCap).second.text, /avtalt forsikringssum/u);
    assert.equal(termsSourceHref(comparison.get(freezerCap).second.sources[0]), "/api/vilkar/storebrand/innbo-innbo10#page=5");
  }
});

test("relocation damage and distinct amounts align without enabling Frende's optional extension", () => {
  const gjIf = rows("gj-innbo-pluss", "if-innbo-super");
  const general = gjIf.get(move);
  assert.match(general.first.text, /bolig i Norge.*tyveri fra transportmiddel.*emballeres/u);
  assert.deepEqual(general.first.sources.map(source => source.page), [5, 1]);
  assert.match(general.second.text, /innbæring og utbæring.*bolig eller fritidsbolig/u);
  assert.equal(gjIf.get("flytting.unntak").second.sources[0].page, 9);
  assert.ok(!gjIf.has("flytting.transport.grense"));
  assert.equal(rows("if-innbo-basis", "gj-innbo-pluss").get(move).first.state, "unavailable");

  const toppSuper = rows("fremtind-innbo-topp", "sb-innbo-super-innbo10");
  assert.match(toppSuper.get(move).first.text, /bolig i Norden.*bygning eller container/u);
  assert.match(toppSuper.get(theftCap).first.text, /100 000 kr ved tyveri under transport/u);
  assert.match(toppSuper.get(theftCap).second.text, /100 000 kr ved tyveri fra transportmiddel/u);
  assert.equal(termsSourceHref(toppSuper.get(theftCap).second.sources[0]), "/api/vilkar/storebrand/innbo-innbo10#page=20");
  assert.match(toppSuper.get("flytting.enkeltgjenstand.grense").first.text, /100 000 kr per enkeltgjenstand eller samling/u);
  assert.equal(rows("sb-innbo-standard-innbo10", "if-innbo-super").get(move).first.state, "unavailable");

  const frende = rows("frende-innbo-standard", "landkreditt-innbo-utvidet");
  assert.equal(frende.get(move).first.state, "optional");
  assert.match(frende.get(move).first.text, /egen flytting.*Norden.*sett hendelsen/u);
  assert.equal(frende.get("flytting.grense").first.state, "optional");
  assert.match(frende.get("flytting.grense").first.text, /100 000 kr samlet/u);
  assert.equal(termsSourceHref(frende.get(move).first.sources[0]), "/api/vilkar/frende/innbo-2026-11-20#page=12");
});

test("registered originals match the audit and raw product facts stay independent", () => {
  const files = [
    ["trygInnbo", "tryg/innbo/Innbo_og_losore_PPK13301.pdf"],
    ["ifInnboSuper", "if/innbo/If_Innboforsikring_IBO2-1.pdf"],
    ["gjInnboStandard", "gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf"],
    ["gjInnboPlus", "gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf"],
    ["storebrand:market:innbo:innbo10", "storebrand/innbo/Storebrand_Innbo_innbo10.pdf"],
    ["fremtindInnboStandard", "fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf"],
    ["fremtindInnboTopp", "fremtind/innbo/canonical/Vilkar_Topp_Innbo.pdf"],
    ["frendeInnboUhell:2026-11-20", "frende/2026-11-20/Vilkar_innboforsikring_20112026.pdf"],
  ];
  for (const [id, path] of files) {
    const bytes = readFileSync(new URL("../catalog/sources/" + path, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), market.sources[id].sha256);
  }
  const baseline = materializeCatalogProduct(raw.products.find(product => product.productId === "tryg-innbo"), raw).facts;
  assert.ok(baseline.every(fact => fact.key !== freezer && fact.key !== freezerCap));
  const facts = { trygInnbo: [...raw.facts.trygInnbo] };
  const sources = { ...market.sources, trygInnbo: { ...market.sources.trygInnbo, sha256: "stale" } };
  addVerifiedInnboMarketEvidence(sources, facts, market.products, []);
  assert.deepEqual(facts.trygInnbo, raw.facts.trygInnbo);
});
