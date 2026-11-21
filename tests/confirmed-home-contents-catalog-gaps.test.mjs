import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = productComparisonProducts(marketProductCatalog);
const product = (id) => products.find((entry) => entry.productId === id);
const facts = (id, catalog = marketProductCatalog) =>
  materializeCatalogProduct(catalog.products.find((entry) => entry.productId === id), catalog).facts;
const fact = (id, key) => {
  const matches = facts(id).filter((entry) => entry.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
};
const row = (first, second, key) => compareCatalogProducts(product(first), product(second), marketProductCatalog)
  .sections.flatMap((section) => section.rows).find((row) => row.key === key);

test("Tryg Hus og Innbo viser privatansvar fra riktig utgave og avtalescope", () => {
  const groups = [
    { ids: ["tryg-hus", "tryg-hus-ekstra"], sourceId: "tryg:market:hus:privatansvar-2026-10",
      key: "hus.ansvar", limit: "hus.ansvar.grense", peer: "if-hus-basis", covered: /eier eller fester/u },
    { ids: ["tryg-innbo", "tryg-innbo-ekstra"], sourceId: "tryg:market:innbo:privatansvar-2026-10",
      key: "ansvar", limit: "ansvar.sum", peer: "watercircles-innbo-standard", covered: /som privatperson/u },
  ];
  for (const { ids, sourceId, key, limit, peer, covered } of groups) {
    for (const id of ids) {
      const coverage = fact(id, key + ".dekning");
      assert.match(coverage.value, covered);
      assert.match(coverage.value, /person- og tingskade i Norden/u);
      const sum = row(id, peer, limit);
      assert.equal(sum.first.state, "included");
      assert.equal(sum.second.state, "included");
      assert.match(sum.first.text, /5 000 000 kr ved én og samme hendelse/u);
      assert.match(fact(id, key + ".egenandel").value, /4 000 kr per skadetilfelle/u);
      for (const [key_, page] of [[key + ".dekning", 1], [limit, 2], [key + ".egenandel", 2]]) {
        const source = fact(id, key_).sources[0];
        assert.equal(source.documentId, sourceId);
        assert.equal(source.agreementScope, "ordinary");
        assert.equal(termsSourceHref(source), "/api/vilkar/tryg/hus-innbo-privatansvar-2026-10#page=" + page);
      }
      const before = resolveCatalogFacts(product(id), [], new Date("2026-09-30"), null, marketProductCatalog);
      const active = resolveCatalogFacts(product(id), [], new Date("2026-10-01"), null, marketProductCatalog);
      assert.ok(before.every((f) => f.source.documentId !== sourceId));
      assert.equal(active.filter((f) => f.source.documentId === sourceId).length, 3);
      assert.ok(facts(id, productCatalog).every((f) => f.sources.every((source) => source.documentId !== sourceId)));
    }
  }
  for (const id of ["tryg-nito-hus", "tryg-nito-hus-ekstra", "tryg-reise", "tryg-reise-premium"]) {
    assert.ok(facts(id).every((f) => f.sources.every((source) => !source.documentId.startsWith("tryg:market:")
      || !source.documentId.endsWith(":privatansvar-2026-10"))), id);
  }
});

test("Landkreditt Innbo viser midlertidig bosted og fryseskade for begge nivåer", () => {
  for (const id of ["landkreditt-innbo-standard", "landkreditt-innbo-utvidet"]) {
    const lodging = row(id, "watercircles-innbo-standard", "flytting.midlertidig_bosted");
    assert.equal(lodging.first.state, "included");
    assert.equal(lodging.second.state, "included");
    assert.match(lodging.first.text, /normal reparasjonstid.*markedsleie/u);
    const freezer = row(id, "sb-innbo-standard-innbo10", "innbo.fryserinnhold.dekning");
    assert.equal(freezer.first.state, "included");
    assert.equal(freezer.second.state, "included");
    assert.match(freezer.first.text, /luktskade.*oppbevar/u);
    assert.equal(termsSourceHref(freezer.first.sources[0]), "/api/vilkar/landkreditt/innbo#page=6");
    assert.equal(termsSourceHref(lodging.first.sources[0]), "/api/vilkar/landkreditt/innbo#page=6");
  }
});

test("WaterCircles og KLP viser frysevarer på samme rad og beholder separate vilkårsgrenser", () => {
  for (const id of ["watercircles-innbo-standard", "watercircles-innbo-elite", "klp-innbo", "klp-innbo-maks"]) {
    const coverage = row(id, "sb-innbo-standard-innbo10", "innbo.fryserinnhold.dekning");
    assert.equal(coverage.first.state, "included");
    assert.equal(coverage.second.state, "included");
    assert.match(coverage.first.text, /utilsiktet temperaturstigning i fryser/u);
    assert.ok(facts(id).every((fact) => fact.key !== "innbo.frysevarer"));
    assert.ok(facts(id, productCatalog).some((fact) => fact.key === "innbo.frysevarer"));
  }
  const limit = row("watercircles-innbo-standard", "watercircles-innbo-elite", "innbo.fryserinnhold.grense");
  assert.match(limit.first.text, /10 000 kr/u);
  assert.match(limit.second.text, /ingen særskilt beløpsgrense/iu);
  assert.equal(termsSourceHref(limit.first.sources[0]), "/api/vilkar/watercircles/innbo-2-17#page=5");
  assert.equal(termsSourceHref(limit.second.sources[0]), "/api/vilkar/watercircles/innbo-2-17#page=13");
});

test("KLP viser egne naturskade- og sykkeltyveriegenandeler og avgrenser uhellsregelen", () => {
  for (const [id, slug, page] of [["klp-innbo", "innbo", 8], ["klp-innbo-maks", "innbo-maks", 12]]) {
    const natural = row(id, "sb-innbo-standard-innbo10", "naturskade.egenandel");
    assert.equal(natural.first.state, "included");
    assert.equal(natural.second.state, "included");
    assert.match(natural.first.text, /8 000 kr/u);
    const bike = row(id, "watercircles-innbo-standard", "sykkel.egenandel");
    assert.equal(bike.first.state, "included");
    assert.equal(bike.second.state, "included");
    assert.match(bike.first.text, /4 000 kr.*1 000 kr ved registrering i et FG-godkjent/u);
    for (const source of [natural.first.sources[0], bike.first.sources[0]]) {
      assert.equal(source.documentId, id);
      assert.equal(termsSourceHref(source), "/api/vilkar/klp/" + slug + "#page=" + page);
    }
  }
  assert.match(fact("klp-innbo-maks", "uhell.egenandel").value, /2 000 kr per gjenstand ved uhell utenfor hjemmet/u);
});
