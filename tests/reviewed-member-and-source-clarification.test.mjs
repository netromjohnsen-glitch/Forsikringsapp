import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const catalog = marketProductCatalog;
const products = new Map(productComparisonProducts(catalog).map(product => [product.productId, product]));
const rows = (first, second = first) => new Map(compareCatalogProducts(products.get(first), products.get(second), catalog)
  .sections.flatMap(section => section.rows).map(row => [row.key, row]));

const paths = (cell) => cell.sources.map(termsSourceHref);
const travelCases = [
  ["tryg-nito-reise-enkeltperson", "nito-reise-enkeltperson", 7, 12, 13, 11],
  ["tryg-nito-reise-familie", "nito-reise-familie", 8, 12, 13, 11],
  ["tryg-utdanningsforbundet-reise-en-person", "utdanningsforbundet-reise-2026", 9, 15, 16, 14],
  ["tryg-utdanningsforbundet-reise-familie", "utdanningsforbundet-reise-2026", 9, 15, 16, 14],
];

test("member travel coverage uses the ordinary coverage rows and each policy's physical pages", () => {
  for (const [id, slug, cancellation, medical, companion, cash] of travelCases) {
    const regular = "tryg-reise-premium";
    const compared = rows(id, regular);
    const reverse = rows(regular, id);
    for (const [key, value, page] of [
      ["reise.avbestilling.dekning", /akutt sykdom.*alvorlig ulykkesskade/u, cancellation],
      ["reise.medisinsk.behandling", /behandlingsutgifter.*ulykkesskade/u, medical],
      ["reise.hjemtransport", /medisinsk nødvendig.*forhåndsgodkjennes/u, companion],
      ["reise.sykeledsagelse.tilkalling", /to nærstående.*på forhånd/u, companion],
      ["reise.bagasje.kontanter", /6 000 kr per skadetilfelle/u, cash],
    ]) {
      assert.equal(compared.get(key).first.state, "included", id + " " + key);
      assert.notEqual(compared.get(key).second.state, "unknown", id + " " + key);
      assert.match(compared.get(key).first.text, value, key);
      assert.deepEqual(paths(compared.get(key).first), ["/api/vilkar/tryg/" + slug + "#page=" + page]);
      assert.deepEqual(reverse.get(key).second, compared.get(key).first);
    }
    for (const key of ["reise.reiseavbrudd", "reise.evakuering", "reise.ansvar.dekning", "reise.rettshjelp.dekning", "reise.leiebil.egenandel"]) {
      assert.equal(compared.get(key).first.state, "included", id + " " + key);
    }
    const dental = compared.get("reise.medisinsk.tann").first;
    if (id.startsWith("tryg-nito-")) {
      assert.equal(dental.state, "unavailable");
      assert.match(dental.text, /Separat ulykkesdekning/u);
    } else {
      assert.equal(dental.state, "included");
      assert.match(dental.text, /5 000 kr ved ulykke.*1 000 kr/u);
    }
    assert.ok(!resolveCatalogFacts(products.get(id), [], undefined, null, productCatalog)
      .some(fact => fact.key === "reise.sykeledsagelse.tilkalling"), id);
  }
});

test("Student and 70+ use their own cash limits and student transport stays separate", () => {
  const student = "tryg-utdanningsforbundet-student";
  const distinct = rows(student).get("reise.hjemtransport.studiested").first;
  assert.match(distinct.text, /10 000 kr.*ikke er på reise/u);
  assert.deepEqual(paths(distinct), [
    "/api/vilkar/tryg/utdanningsforbundet-student-2026#page=40",
    "/api/vilkar/tryg/utdanningsforbundet-student-2026#page=3",
  ]);
  assert.match(rows(student).get("reise.hjemtransport.sum").first.text, /Ubegrenset/u);
  for (const [id, slug, page] of [
    [student, "utdanningsforbundet-student", 36],
    ["tryg-utdanningsforbundet-70-pluss-en-person", "utdanningsforbundet-70-pluss", 33],
    ["tryg-utdanningsforbundet-70-pluss-familie", "utdanningsforbundet-70-pluss", 33],
  ]) {
    const cash = rows(id).get("reise.bagasje.kontanter").first;
    assert.match(cash.text, /3 000 kr/u);
    assert.deepEqual(paths(cash), ["/api/vilkar/tryg/" + slug + "-2026#page=" + page]);
  }
});

test("new vehicle guarantees use the correct edition, tier, mileage and coverage amount", () => {
  const regular = "if-bil-super";
  for (const [id, years, mileage, document, page] of [
    ["tryg-nito-bil-kasko", "ett", "15 000", "PAU25205", 4],
    ["tryg-nito-bil-ekstra", "tre", "60 000", "PAU27012", 1],
    ["tryg-nito-elbil-ekstra", "tre", "60 000", "PAU27015", 1],
    ["tryg-utdanningsforbundet-bil-ekstra", "tre", "60 000", "PAU25245", 4],
    ["tryg-utdanningsforbundet-elbil-ekstra", "tre", "60 000", "PAU25245", 4],
  ]) {
    const compared = rows(id, regular);
    assert.match(compared.get("nyverdi.alder").first.text, new RegExp("Innen " + years + " år", "u"));
    assert.match(compared.get("nyverdi.km").first.text, new RegExp(mileage, "u"));
    assert.match(compared.get("nyverdi.skadegrad").first.text, /overstige 80 %/u);
    for (const key of ["nyverdi.alder", "nyverdi.km", "nyverdi.skadegrad"]) {
      const cell = compared.get(key).first;
      assert.deepEqual(cell.sources.map(source => [source.termsNumber, source.page]), [[document, page]], id);
      assert.deepEqual(rows(regular, id).get(key).second, cell);
    }
  }
  assert.ok(!rows("tryg-nito-bil-delkasko").has("nyverdi.alder"));
  assert.ok(!rows("tryg-utdanningsforbundet-bil-delkasko").has("nyverdi.alder"));
});

test("the two member motor agreements keep distinct legal geography, limits and PDFs", () => {
  const nito = "tryg-nito-bil-ekstra";
  const udf = "tryg-utdanningsforbundet-elbil-ekstra";
  const compared = rows(nito, udf);
  const geography = compared.get("geografi.rettshjelp");
  assert.equal(geography.first.text, "Norden.");
  assert.match(geography.second.text, /EU\/EØS.*Tvist som selger.*Norden/u);
  const limits = compared.get("rettshjelp.grense");
  assert.match(limits.first.text, /100 000 kr.*250 000 kr.*20 000 kr/u);
  assert.match(limits.second.text, /100 000 kr/u);
  assert.doesNotMatch(limits.second.text, /250 000 kr/u);
  assert.match(compared.get("avtale.geografi").second.text, /unntatt Russland, Belarus og Tyrkia/u);
  const udfSource = limits.second.sources[0];
  assert.equal(udfSource.termsNumber, "PAU25005");
  assert.deepEqual(paths(limits.second), ["/api/vilkar/tryg/utdanningsforbundet-bil-ansvar-pau25005#page=1"]);
  const bytes = readFileSync(new URL("../catalog/sources/tryg/member-agreements/udf-05pau25005.pdf", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), catalog.sources[udfSource.documentId].sha256);
});

test("all three source disagreements remain unresolved with both sources and exact scope", () => {
  const frende = rows("frende-verdisak").get("verdisak.tap").first;
  const elite = rows("watercircles-innbo-fritidsbolig-elite");
  const standard = rows("watercircles-innbo-fritidsbolig-standard").get("innbo.penger.dekning").first;
  const nito = rows("tryg-nito-bil-kasko", "tryg-utdanningsforbundet-bil-ekstra").get("ulykke.geografi");
  for (const cell of [frende, elite.get("innbo.penger.dekning").first, elite.get("innbo.penger.grense").first, nito.first]) {
    assert.equal(cell.state, "unknown");
    assert.match(cell.text, /^Uavklart i kildene/u);
    assert.equal(cell.sources.length, 2);
  }
  assert.equal(standard.state, "unavailable");
  assert.equal(nito.second.state, "unknown");
  assert.deepEqual(nito.second.sources, []);
  assert.deepEqual(paths(frende), [
    "/api/vilkar/frende/verdisak-2026-11-20#page=2",
    "https://www.frende.no/forsikringer/verdigjenstandsforsikring/dekker-alle-typer-skader/",
  ]);
  assert.deepEqual(paths(elite.get("innbo.penger.dekning").first), [
    "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=5",
    "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=9",
  ]);
  assert.deepEqual(paths(nito.first), [
    "/api/vilkar/tryg/nito-trafikkulykke-person-pau28006#page=2",
    "https://www.tryg.no/partnere/nito/nito-bilforsikring",
  ]);
});
