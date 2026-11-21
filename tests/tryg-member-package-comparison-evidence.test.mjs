import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { addTrygMemberPackageComparisonFacts } from "../lib/tryg-member-package-comparison-evidence.ts";

const market = marketProductCatalog;
function find(id) {
  const result = market.products.find(product => product.productId === id);
  assert.ok(result, id);
  return result;
}

const rowsByKey = (result) => new Map(result.sections.flatMap((section) => section.rows).map((row) => [row.key, row]));

const travelCases = [
  ["tryg-nito-reise-enkeltperson", "nito-reise-enkeltperson", "nito", false],
  ["tryg-nito-reise-familie", "nito-reise-familie", "nito", true],
  ["tryg-utdanningsforbundet-reise-en-person", "utdanningsforbundet-reise-2026", "utdanningsforbundet", false],
  ["tryg-utdanningsforbundet-reise-familie", "utdanningsforbundet-reise-2026", "utdanningsforbundet", true],
];

for (const [id, archiveSlug, scope, family] of travelCases) {
  test(id + " uses the same comparison rows as ordinary Tryg travel and retains exact member sources", () => {
    const member = find(id);
    const premium = find("tryg-reise-premium");
    const rows = rowsByKey(compareCatalogProducts(member, premium, market));
    const reverse = rowsByKey(compareCatalogProducts(premium, member, market));
    const nito = scope === "nito";
    for (const [key, pattern, page = 2, qualificationPage] of [
      ["reise.personer.omfang", family ? /samme folkeregistrerte adresse.*21 år/u : /medlem.*(?:enkeltperson|én person)/u, 6],
      ["reise.forsinkelse.avgang_sum", nito ? /5 000 kr per sikret/u : /4 000 kr per sikret.*3 000 kr per natt.*fem netter/u],
      ["reise.bagasje.forsinket_sum", /6 000 kr per sikret/u],
      ["reise.bagasje.transitt_sum", nito ? /1 000 kr per sikret/u : /500 kr per sikret/u],
      ["reise.medisinsk.sum", /Ubegrenset.*enkelte utgiftsbegrensninger/u],
      ["reise.hjemtransport.sum", /Ubegrenset.*én medreisende/u],
      ["reise.evakuering.sum", /Ubegrenset/u],
      ["reise.leiebil.egenandel_sum", nito ? /ubegrenset forsikringssum for leiebilegenandel.*leiebil og leid sykkel eller elsykkel.*minst én overnatting/u : /Ubegrenset.*leiebil og leid sykkel eller elsykkel/u, nito ? 19 : 2, nito ? 2 : undefined],
      ["reise.ulykke.dekning", nito ? /behandlingsutgifter.*forsikringsåret.*80 år/u : /grunnforsikring eller 70\+.*au pair/u, nito ? 20 : 6, nito ? 6 : 25],
      ["reise.ulykke.invaliditet", nito ? /500 000 kr.*70 år.*71 år.*80 år.*100 000 kr/u : /500 000 kr.*kalenderåret.*75 år/u, nito ? 21 : 25, nito ? 2 : 6],
      ["reise.ulykke.dodsfall", nito ? /500 000.*100 000.*innen ett år/u : /0,5 G.*kalenderåret.*70 år/u, nito ? 22 : 26, nito ? 21 : 7],
      ["reise.ansvar.sum", /15 000 000 kr per skadetilfelle/u],
      ["reise.bagasje.per_gjenstand", /40 000 kr per enkeltgjenstand/u],
      ["reise.reiseavbrudd.sum", /1 500 kr per døgn per sikret/u],
      ["reise.rettshjelp.sum", /100 000 kr per tvist/u],
    ]) {
      const row = rows.get(key);
      assert.equal(row.first.state, "included", key);
      assert.equal(row.second.state, "included", key);
      assert.match(row.first.text, pattern, key);
      const pages = qualificationPage ? [page, qualificationPage] : [page];
      assert.deepEqual(row.first.sources.map(termsSourceHref), pages.map(value => "/api/vilkar/tryg/" + archiveSlug + "#page=" + value), key);
      assert.ok(row.first.sources.every(source => source.documentId === id + "-terms" &&
        source.agreementScope === scope && source.effectiveFrom === member.version), key);
      assert.ok(row.second.sources.every(source => source.documentId !== id + "-terms"), key);
      assert.deepEqual(reverse.get(key).first, row.second, key);
      assert.deepEqual(reverse.get(key).second, row.first, key);
    }
    assert.equal(rows.get("reise.bagasje.forsinket_sum").first.text, "Inntil 6 000 kr per sikret.");
    assert.equal(rows.get("reise.bagasje.transitt_sum").first.text,
      nito ? "Inntil 1 000 kr per sikret." : "Inntil 500 kr per sikret.");
    const treatment = rows.get("reise.ulykke.behandling").first;
    if (nito) {
      assert.match(treatment.text, /5 %.*tre år/u);
      assert.equal(treatment.state, "included");
      assert.deepEqual(treatment.sources.map(termsSourceHref), ["/api/vilkar/tryg/" + archiveSlug + "#page=" + (family ? 22 : 21)]);
      assert.equal(rows.get("reise.ulykke.invaliditet").first.text.includes("Medforsikrede barn har 500 000 kr"), family);
      assert.equal(rows.get("reise.ulykke.dodsfall").first.text.includes("Medforsikrede barn har 100 000 kr"), family);
    } else {
      assert.equal(treatment.state, "unknown");
      assert.deepEqual(treatment.sources, []);
    }
    const scopeRow = rows.get("reise.personer.omfang").first.text;
    assert.equal(scopeRow.includes("oldebarn"), !nito && family);
    assert.ok(!rows.has("reise.avbestilling") && !rows.has("reise.varighet") && !rows.has("reise.hvem"));

    const raw = materializeCatalogProduct(member, productCatalog).facts;
    assert.ok(raw.some(fact => fact.key === "reise.avbestilling"));
    assert.ok(!raw.some(fact => fact.key === "reise.forsinkelse.avgang_sum"));
  });
}

test("UDF 70+ compares innbo, reise and the distinct ulykkes tiers with the same policy pages", () => {
  const single = find("tryg-utdanningsforbundet-70-pluss-en-person");
  const family = find("tryg-utdanningsforbundet-70-pluss-familie");
  const result = compareCatalogProducts(single, family, market);
  assert.deepEqual(productComparisonView(result).map(section => section.label), [
    "Innboforsikring", "Reiseforsikring", "Ulykkesforsikring",
  ]);
  const rows = rowsByKey(result);
  for (const [key, value, page] of [
    ["innbo.forsikringssum", /3 000 000 kr per skade/u, 2],
    ["innbo.egenandel", /2 000 kr/u, 2],
    ["reise.varighet.maks", /90 dager.*Norden.*uten overnatting/u, 2],
    ["reise.bagasje.forsinket_sum", /6 000 kr.*500 kr/u, 3],
    ["reise.leiebil.egenandel_sum", /leiebil og leid sykkel eller elsykkel/u, 3],
    ["person.ulykke.utgifter", /5 %.*tre år.*500 kr/u, 47],
  ]) {
    const row = rows.get(key);
    assert.match(row.first.text, value);
    assert.equal(row.first.text, row.second.text);
    for (const source of [...row.first.sources, ...row.second.sources]) {
      assert.equal(source.agreementScope, "utdanningsforbundet");
      assert.equal(termsSourceHref(source), "/api/vilkar/tryg/utdanningsforbundet-70-pluss-2026#page=" + page);
    }
  }
  const cancellation = rows.get("reise.avbestilling.sum");
  for (const cell of [cancellation.first, cancellation.second]) {
    assert.match(cell.text, /ubegrenset forsikringssum.*100 000 kr for samme hendelse eller reise.*gjelder foran vilkårene/u);
    assert.deepEqual(cell.sources.map(termsSourceHref), [
      "/api/vilkar/tryg/utdanningsforbundet-70-pluss-2026#page=2",
      "/api/vilkar/tryg/utdanningsforbundet-70-pluss-2026#page=29",
    ]);
  }
  const accidents = rows.get("ulykke.forsikringssum");
  assert.match(accidents.first.text, /10 G.*5 G.*75 år eller eldre/u);
  assert.match(accidents.second.text, /5 G.*2,5 G.*75 år eller eldre/u);
  const beneficiaries = rows.get("reise.personer.omfang");
  assert.doesNotMatch(beneficiaries.first.text, /ektefelle|samboer|oldebarn/u);
  assert.match(beneficiaries.second.text, /samboer.*21 år.*oldebarn/u);
  assert.ok(materializeCatalogProduct(single, productCatalog).facts.every(fact => !fact.key.startsWith("innbo.")));
});

test("UDF Grunnforsikring shows the family death sum separately from the member's own, age expiry and accident expenses", () => {
  const product = find("tryg-utdanningsforbundet-grunnforsikring");
  const result = compareCatalogProducts(product, product, market);
  assert.deepEqual(productComparisonView(result).map(section => section.label), [
    "Livsforsikring og dødsfall i familien", "Ulykkesforsikring",
  ]);
  const rows = rowsByKey(result);
  assert.match(rows.get("liv.forsikringssum").first.text, /5 G.*2,5 G/u);
  for (const [key, value, page] of [
    ["person.liv.familiedod", /0,5 G.*familiemedlems død/u, 2],
    ["person.liv.opphor", /kalenderåret.*70 år/u, 2],
    ["person.liv.familiedod.omfang", /uansett årsak.*uke 22/u, 6],
    ["person.ulykke.utgifter", /5 %.*500 kr/u, 11],
  ]) {
    const row = rows.get(key);
    assert.match(row.first.text, value, key);
    assert.equal(row.first.state, "included", key);
    assert.deepEqual(row.first.sources.map(termsSourceHref), ["/api/vilkar/tryg/utdanningsforbundet-grunnforsikring-2026#page=" + page], key);
  }
  assert.ok(!materializeCatalogProduct(product, productCatalog).facts.some(fact => fact.key === "person.liv.familiedod"));
});

const contentsCases = [
  ["tryg-nito-innbo", "nito-innbo", "tryg-innbo-ekstra", "ansvar.sum", /50 000/u, 2],
  ["tryg-nito-innbo-student", "nito-innbo-student", "tryg-innbo-ekstra", "ansvar.sum", /50 000.*utenfor boligen/u, 2],
  ["tryg-nito-innbo-fritidsbolig", "nito-innbo-fritidsbolig", "tryg-innbo-fritidsbolig-ekstra", "ansvar.grense", /50 000/u, 2],
  ["tryg-utdanningsforbundet-innbo", "utdanningsforbundet-innbo-2026", "tryg-innbo-ekstra", "ansvar.sum", /40 000/u, 9],
];

for (const [id, archiveSlug, comparable, liabilityKey, bikeAmount, bikePage] of contentsCases) {
  test(id + " aligns contents terms on common rows with the member edition", () => {
    const member = find(id);
    const other = find(comparable);
    const rows = rowsByKey(compareCatalogProducts(member, other, market));
    const reverse = rowsByKey(compareCatalogProducts(other, member, market));
    for (const [key, value, page] of [
      ["sykkel.tyveri.grense", bikeAmount, bikePage],
      ["skadedyr.dekning", /fast(?:e)? bosted i Norge/u, id.startsWith("tryg-nito-") ? 9 : 11],
      [liabilityKey, /5 000 000 kr/u, 2],
      ["rettshjelp.grense", /100 000 kr/u, 2],
      ["naturskade.egenandel", /8 000 kr/u, 2],
    ]) {
      const row = rows.get(key);
      assert.ok(row, key);
      assert.match(row.first.text, value, key);
      assert.deepEqual(row.first.sources.map(termsSourceHref), ["/api/vilkar/tryg/" + archiveSlug + "#page=" + page], key);
      assert.deepEqual(reverse.get(key).second, row.first, key);
    }
  });
}

test("member comparison evidence fails closed if the PDF changes and points to byte-identical local archives", () => {
  const ids = [...travelCases.map(([id]) => id), ...contentsCases.map(([id]) => id), "tryg-utdanningsforbundet-70-pluss-en-person",
    "tryg-utdanningsforbundet-70-pluss-familie", "tryg-utdanningsforbundet-grunnforsikring", "tryg-utdanningsforbundet-student"];
  const incompatibleSources = { ...productCatalog.sources };
  for (const id of ids) {
    const product = find(id);
    const source = market.sources[product.sourceId];
    const archive = termsArchiveDocuments.find(entry => entry.sources.some(([docId, date, url]) =>
      docId === source.id && date === source.effectiveFrom && url === source.url));
    assert.ok(archive, id);
    const pdf = readFileSync(new URL("../" + archive.archivePath, import.meta.url));
    assert.equal(createHash("sha256").update(pdf).digest("hex"), source.sha256, id);
    incompatibleSources[source.id] = { ...source, sha256: "different-pdf" };
  }
  const unchanged = { ...productCatalog.facts };
  addTrygMemberPackageComparisonFacts(incompatibleSources, unchanged);
  assert.deepEqual(unchanged, productCatalog.facts);
});
