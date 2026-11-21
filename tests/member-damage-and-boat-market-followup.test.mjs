import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";

const market = marketProductCatalog;
const products = new Map(productComparisonProducts(market).map(product => [product.productId, product]));
function compare(a, b) {
  return compareCatalogProducts(products.get(a), products.get(b), market);
}
function row(result, key) {
  const match = result.sections.flatMap(section => section.rows).find(row => row.key === key);
  assert.ok(match, key);
  return match;
}

test("Utdanningsforbundet Student shows travel, accident and disability under distinct parts of the exact certificate", () => {
  const id = "tryg-utdanningsforbundet-student";
  const result = compare(id, id);
  assert.deepEqual(productComparisonView(result).map(section => section.label), [
    "Innboforsikring", "Reiseforsikring", "Ulykkesforsikring", "Uføreforsikring", "Andre vilkår",
  ]);
  for (const [key, pattern, page] of [
    ["innbo.forsikringssum", /500 000 kr/u, 2],
    ["reise.varighet.maks", /90 dager/u, 3],
    ["reise.studieopphold.varighet", /180 dager.*én gang/u, 4],
    ["reise.bagasje.forsinket_sum", /6 000.*500/u, 3],
    ["person.ufore.sum", /400 000.*50 %/u, 2],
    ["person.ufore.forskudd", /1 500 kr per måned.*fem år/u, 4],
    ["person.ulykke.brudd", /5 000 kr/u, 51],
  ]) {
    const { first, second } = row(result, key);
    assert.equal(first.state, "included", key);
    assert.match(first.text, pattern, key);
    assert.deepEqual(first, second, key);
    assert.deepEqual(first.sources.map(termsSourceHref), ["/api/vilkar/tryg/utdanningsforbundet-student-2026#page=" + page], key);
  }
  const cancellation = row(result, "reise.avbestilling.sum").first;
  assert.match(cancellation.text, /ubegrenset forsikringssum.*100 000 kr for samme hendelse eller reise.*gjelder foran vilkårene/u);
  assert.deepEqual(cancellation.sources.map(termsSourceHref), [
    "/api/vilkar/tryg/utdanningsforbundet-student-2026#page=3",
    "/api/vilkar/tryg/utdanningsforbundet-student-2026#page=33",
  ]);
  assert.equal(resolveCatalogFacts(products.get(id), [], new Date("2026-11-20"), null, productCatalog).length, 2);
});

for (const [scope, slug, control] of [
  ["nito", "nito-bil-kasko-pakke-2026", "tryg-nito-bil-kasko"],
  ["utdanningsforbundet", "utdanningsforbundet-bil-kasko-2026", "tryg-utdanningsforbundet-bil-delkasko"],
]) {
  for (const variant of ["bil-ekstra", "elbil-ekstra"]) {
    const id = `tryg-${scope}-${variant}`;
    test(id + " includes its own Kasko and preserves the source of package-specific overrides", () => {
      const result = compare(control, id);
      const reverse = compare(id, control);
      for (const [key, pattern, page] of [
        ["kasko.dekning", /sammenstøt/iu, 1],
        ["brann.dekning", /brann med åpen flamme/iu, scope === "nito" ? 2 : 1],
        ["glass.egenandel.bytte", /3 000 kr/u, 2],
        ["glass.egenandel.reparasjon", /0 kr/u, 2],
        ["veihjelp.dekning", /berging/u, 2],
        ["veihjelp.transport.grense", /50 %/u, 2],
        ["veihjelp.egenandel", scope === "nito" ? /750 kr/u : /500 kr/u, scope === "nito" ? 3 : 2],
      ]) {
        const { second } = row(result, key);
        assert.equal(second.state, "included", key);
        assert.match(second.text, pattern, key);
        assert.deepEqual(second.sources.map(termsSourceHref), ["/api/vilkar/tryg/" + slug + "#page=" + page]);
        assert.deepEqual(row(reverse, key).first, second, key);
      }
      const { second } = row(result, "tilbehor.grense");
      assert.match(second.text, /50 000 kr/u);
      assert.doesNotMatch(second.text, /10 000 kr/u);
      assert.equal(second.sources[0].termsNumber, scope === "nito"
        ? variant === "bil-ekstra" ? "PAU27012" : "PAU27015" : "PAU25245");
      const sourceIds = resolveCatalogFacts(products.get(id), [], new Date("2026-11-20"), null, productCatalog)
        .map(fact => fact.source.documentId);
      assert.ok(sourceIds.every(sourceId => !sourceId.includes("market-kasko")));
    });
  }
}

test("member cars show included accident coverage without changing ordinary product or contract enrichment", () => {
  for (const [scope, variants, slug, terms, benefitPage, control] of [
    ["nito", ["bil-ansvar", "bil-delkasko", "bil-kasko", "bil-ekstra", "elbil-ekstra"],
      "nito-trafikkulykke-person-pau28006", "PAU28006", 3, "tryg-utdanningsforbundet-bil-delkasko"],
    ["utdanningsforbundet", ["bil-delkasko", "bil-ekstra", "elbil-ekstra"],
      "utdanningsforbundet-forer-passasjerulykke-pau28004", "PAU28004", 2, "tryg-nito-bil-kasko"],
  ]) {
    for (const variant of variants) {
      const id = "tryg-" + scope + "-" + variant;
      const result = compare(id, control);
      const reversed = compare(control, id);
      for (const [key, pattern, pages] of [
        ["ulykke.dekning", /invaliditet.*dødsfall.*sykehuskompensasjon/u, [1]],
        ["ulykke.omfang", scope === "nito" ? /hjemmeboende barn under 21 år.*buss, drosje/u : /utenfor kjøretøyet.*direkte årsaken/u, [1]],
        ["ulykke.invaliditet", /500 000 kr.*1 000 000 kr/u, [2]],
        ["ulykke.dod", /100 000 kr.*innen ett år/u, [benefitPage, 1]],
        ["ulykke.sykehus", /5 000 kr.*48 sammenhengende timer/u, [benefitPage, 1]],
      ]) {
        const { first, second } = row(result, key);
        assert.equal(first.state, "included", id + " " + key);
        assert.match(first.text, pattern, key);
        assert.deepEqual(first.sources.map(termsSourceHref), pages.map(page => "/api/vilkar/tryg/" + slug + "#page=" + page), key);
        assert.ok(first.sources.every(source => source.agreementScope === scope && source.termsNumber === terms), key);
        assert.ok(second.sources.every(source => source.agreementScope !== scope), key);
        assert.deepEqual(row(reversed, key).second, first, key);
      }
      const raw = resolveCatalogFacts(products.get(id), [], new Date("2026-11-20"), null, productCatalog);
      assert.ok(raw.every(fact => fact.source.termsNumber !== terms), id);
    }
    const archive = termsArchiveDocuments.find(entry => entry.slug === slug);
    assert.ok(archive, slug);
    const source = market.sources[archive.sources[0][0]];
    const pdf = readFileSync(new URL("../" + archive.archivePath, import.meta.url));
    assert.equal(createHash("sha256").update(pdf).digest("hex"), source.sha256, terms);
  }
  for (const variant of ["bil-ekstra", "elbil-ekstra"]) {
    const id = "tryg-utdanningsforbundet-" + variant;
    const { first, second } = row(compare(id, "tryg-utdanningsforbundet-bil-delkasko"), "natur.dekning");
    assert.equal(first.state, "included");
    assert.equal(second.state, "included");
    assert.match(first.text, /naturulykke.*flom/u);
    assert.equal(first.sources[0].sourceType, "product_page");
  }
});

test("NITO and Utdanningsforbundet keep the exact edition and sale qualification for wet rooms and rot", () => {
  const nito = compare("tryg-nito-hus", "tryg-nito-hus-ekstra");
  const udf = compare("tryg-utdanningsforbundet-hus", "tryg-utdanningsforbundet-hus-ekstra");
  for (const result of [nito, udf]) {
    const wetroom = row(result, "hus.vatrom.selverommet");
    assert.equal(wetroom.first.state, "unavailable");
    assert.equal(wetroom.second.state, "included");
    assert.match(wetroom.second.text, /innen ti år/u);
  }
  const nitoRot = row(nito, "hus.rate.dekning");
  assert.equal(nitoRot.first.state, "optional");
  assert.equal(nitoRot.second.state, "included");
  assert.match(nitoRot.second.text, /nysalg etter 14\. september 2026/u);
  assert.ok(nitoRot.second.sources.some(source => source.sourceType === "product_page" && source.page === 0));
  const udfRot = row(udf, "hus.rate.dekning").second;
  assert.equal(udfRot.state, "included");
  assert.deepEqual(udfRot.sources.map(source => source.termsNumber), ["PPK11603", "PPK11602"]);
  const contractor = row(udf, "hus.handverker.konkurs").second;
  assert.match(contractor.text, /100 000 kr.*konkurs/u);
  assert.equal(contractor.sources[0].page, 9);
});

test("Frende Båt uses November pages for base and optional facts while keeping the January archive", () => {
  for (const variant of ["brann-og-tyveri", "kasko", "utvidet"]) {
    const id = "frende-bat-" + variant;
    const product = products.get(id);
    assert.equal(product.version, "2026-11-20");
    const model = materializeCatalogProduct(product, market);
    for (const [key, page] of [
      ["bat.konkurranse.begrensning", 11],
      ["bat.ansvar.grense", 9],
      ["bat.rettshjelp.grense", 10],
      ["bat.ulykke.dekning", 7],
      ...(variant === "utvidet" ? [["bat.redning.hjemtransport.grense", 4]] : []),
    ]) {
      const fact = model.facts.find(fact => fact.key === key);
      assert.ok(fact, key);
      assert.equal(termsSourceHref(fact.sources[0]), "/api/vilkar/frende/bat-2026-11-20#page=" + page);
    }
    const race = model.facts.find(fact => fact.key === "bat.konkurranse.begrensning");
    assert.match(race.value, /seilbåt eller båt uten motor/u);
    const old = productCatalog.products.find(product => product.productId === id);
    const liability = resolveCatalogFacts(old, []).find(fact => fact.key === "bat.ansvar.grense");
    if (liability) assert.equal(termsSourceHref(liability.source), "/api/vilkar/frende/bat#page=10");
  }
});
