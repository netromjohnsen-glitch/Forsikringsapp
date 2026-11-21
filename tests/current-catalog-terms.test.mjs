import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const byId = new Map(productComparisonProducts(marketProductCatalog).map(product => [product.productId, product]));
const rows = (first, second) => compareCatalogProducts(byId.get(first), byId.get(second), marketProductCatalog)
  .sections.flatMap(section => section.rows);

test("equivalent motor, cabin and house terms share a row without absorbing different terms", () => {
  const cases = [
    ["bil-ansvar", "if-bil-ansvar", "geografi.rettshjelp", /Norden/u, /Norden/u],
    ["gjensidige-hytte-standard", "storebrand-hytte-standard", "hytte.krav.meldefrist", /ett år/u, /ett år/u],
    ["gjensidige-hytte-pluss", "storebrand-hytte-super", "hytte.krav.meldefrist", /ett år/u, /ett år/u],
    ["gjensidige-hus", "landkreditt-hus-standard", "hus.gjenoppforing.hovedregel", /innen fem år/u, /innen 5 år/u],
    ["gjensidige-hus-pluss", "landkreditt-hus-utvidet", "hus.gjenoppforing.hovedregel", /innen fem år/u, /innen 5 år/u],
  ];
  for (const [first, second, key, a, b] of cases) {
    const row = rows(first, second).filter(row => row.key === key);
    assert.equal(row.length, 1, key);
    assert.match(row[0].first.text, a);
    assert.match(row[0].second.text, b);
    const reverse = rows(second, first).find(row => row.key === key);
    assert.deepEqual(reverse.first, row[0].second);
    assert.deepEqual(reverse.second, row[0].first);
  }
  const cabin = rows("gjensidige-hytte-standard", "storebrand-hytte-standard");
  assert.match(cabin.find(row => row.key === "hytte.avtale.meldefrist").second.text, /så raskt som mulig/u);
  assert.match(cabin.find(row => row.key === "hytte.avtale.meldefrist").label, /politianmeldelse/u);
});

test("Tryg uses direct official documents and still resolves the old citation identity", () => {
  for (const [suffix, slug, number] of [
    ["katt:treatment", "katt-behandling", "PLB52006"],
    ["katt:extra", "katt-ekstra", "PLB52004"],
    ["katt:life", "katt-liv", "PLB52005"],
    ["båt:machinery", "bat-maskinskade", "PFB36910"],
    ["båt:accident", "bat-ulykke", "PFB38900"],
  ]) {
    const documentId = "boat-pet:tryg:" + suffix;
    const { url, effectiveFrom, previousUrl } = marketProductCatalog.sources[documentId];
    assert.ok(previousUrl);
    assert.ok(url.includes("vilkNr=05" + number), url);
    for (const citationUrl of [url, previousUrl]) {
      assert.equal(termsSourceHref({ documentId, effectiveFrom, page: 1, url: citationUrl }),
        "/api/vilkar/tryg/" + slug + "#page=1");
    }
  }
});

test("Frende uses the November edition by product and keeps the previous archived editions addressable", () => {
  for (const [id, key, page, slug, oldPage] of [
    ["frende-innbo-standard", "skadedyr.grense", 6, "innbo", 7],
    ["frende-hus-standard", "hus.ansvar.grense", 9, "hus", 10],
    ["frende-hus-utvidet", "hus.ansvar.grense", 9, "hus", 10],
    ["frende-hytte-standard", "hytte.ansvar.dekning", 9, "hytte", 10],
    ["frende-hytte-utvidet", "hytte.ansvar.dekning", 9, "hytte", 10],
    ["frende-person-ulykke", "person.ulykke.dodsfall", 3, "ulykke", 3],
    ["frende-verdisak", "verdisak.sikkerhet.instrument", 3, "verdisak", 4],
  ]) {
    const product = byId.get(id);
    assert.equal(product?.version, "2026-11-20", id);
    const current = materializeCatalogProduct(product, marketProductCatalog).facts.find(fact => fact.key === key);
    assert.ok(current, key);
    const match = current.sources.find(source => source.page === page && source.effectiveFrom === "2026-11-20");
    assert.ok(match, key);
    assert.equal(termsSourceHref(match), "/api/vilkar/frende/" + slug + "-2026-11-20#page=" + page);
    const previous = productCatalog.products.find(product => product.productId === id);
    const archived = resolveCatalogFacts(previous, []).find(fact => fact.key === key && fact.source.page === oldPage);
    assert.ok(archived, key);
    assert.equal(termsSourceHref(archived.source), "/api/vilkar/frende/" + slug + "#page=" + oldPage);
  }
  const valuables = materializeCatalogProduct(byId.get("frende-verdisak"), marketProductCatalog).facts;
  assert.match(valuables.find(fact => fact.key === "verdisak.oppgjor.metode").value, /laveste.*markedsverdien/u);
  assert.ok(!valuables.some(fact => fact.key === "verdisak.oppgjor.brukt" || fact.key === "verdisak.oppgjor.utbetaling"));
  const house = materializeCatalogProduct(byId.get("frende-hus-standard"), marketProductCatalog).facts;
  assert.equal(house.find(fact => fact.key === "hus.skadedyr.verdibegrensning").sources[0].page, 5);
  assert.match(house.find(fact => fact.key === "hus.skadedyr.verdibegrensning").value, /tap i markedsverdi/u);
});

test("all 18 Frende vehicle products compare the November terms and January citations stay archival", () => {
  const versions = {
    bil: ["ansvar", "delkasko", "kasko", "utvidet"],
    mc: ["ansvar", "delkasko", "kasko"],
    bobil: ["ansvar", "delkasko", "kasko", "utvidet"],
    snoscooter: ["ansvar", "brann-og-tyveri", "kasko"],
    campingvogn: ["brann-og-tyveri", "kasko"],
    tilhenger: ["brann-og-tyveri", "kasko"],
  };
  const seenVehicleKinds = new Set();
  for (const [kind, levels] of Object.entries(versions)) {
    for (const level of levels) {
      const id = "frende-" + kind + "-" + level;
      const product = byId.get(id);
      assert.equal(product?.version, "2026-11-20", id);
      const model = materializeCatalogProduct(product, marketProductCatalog);
      const sources = model.facts.flatMap(fact => fact.sources)
        .filter(source => /(?:Car|Motorcycle|MotorHome|Snowmobile|Caravan|Trailer)Insurance$/u.test(source.url ?? ""));
      assert.ok(sources.length, id);
      for (const source of sources) {
        assert.equal(source.effectiveFrom, "2026-11-20", id);
        assert.ok(source.page <= 14 && source.page > 0, id);
        assert.equal(termsSourceHref(source), "/api/vilkar/frende/" + kind + "-2026-11-20#page=" + source.page, id);
      }

      const original = productCatalog.products.find(product => product.productId === id);
      assert.equal(original?.version, "2026-01-01", id);
      const old = resolveCatalogFacts(original, []).map(fact => fact.source)
        .find(source => /(?:Car|Motorcycle|MotorHome|Snowmobile|Caravan|Trailer)Insurance$/u.test(source.url ?? ""));
      assert.equal(termsSourceHref(old), "/api/vilkar/frende/kjoretoy-2026-01-01#page=" + old.page, id);

      if (level !== "kasko") continue;
      const exclusionKey = ["bil", "bobil", "mc"].includes(kind) ? "kasko.begrensning" : kind + ".kasko.begrensning";
      const exclusion = model.facts.find(fact => fact.key === exclusionKey && fact.value.includes("varmesystemer"));
      assert.ok(exclusion, id);
      assert.match(exclusion.value, /hjuloppheng.*chipping.*godkjennes/u);
      assert.equal(exclusion.sources[0].page, 4, id);
      seenVehicleKinds.add(kind);
    }
  }
  assert.equal(seenVehicleKinds.size, 6);

  const camping = materializeCatalogProduct(byId.get("frende-campingvogn-kasko"), marketProductCatalog).facts;
  assert.match(camping.find(fact => fact.key === "campingvogn.fukt.begrensning").value, /maksimalt 12 måneder/u);
  const bobil = materializeCatalogProduct(byId.get("frende-bobil-utvidet"), marketProductCatalog).facts;
  assert.equal(bobil.find(fact => fact.key === "bobil.fukt.sikkerhet").sources[0].page, 14);
  for (const level of ["brann-og-tyveri", "kasko"]) {
    const snow = materializeCatalogProduct(byId.get("frende-snoscooter-" + level), marketProductCatalog).facts;
    const settlement = snow.find(fact => fact.key === "snoscooter.tyveri.oppgjor");
    assert.match(settlement.value, /60 dager.*60 %.*30 dager/u);
    assert.equal(settlement.sources[0].page, 7);
  }
});

test("the four newly confirmed dimensions align in both directions with their own source values", () => {
  for (const [first, second, key, oldKey, firstPattern, secondPattern] of [
    ["bil-ansvar", "if-bil-ansvar", "avtale.geografi", "geografi.dekning", /Tyrkia/u, /europeisk del/u],
    ["tryg-innbo", "if-innbo-basis", "ansvar.sum", "ansvar.grense", /5 000 000/u, /saksomkostninger/u],
    ["klp-bil-kasko", "tryg-nito-bil-ekstra", "leiebil.dekning", "bil.leiebil", /godkjenning/u, /60 dager/u],
  ]) {
    const list = rows(first, second);
    assert.ok(!list.some(row => row.key === oldKey), oldKey);
    const match = list.filter(row => row.key === key);
    assert.equal(match.length, 1, key);
    const [row] = match;
    assert.match(row.first.text, firstPattern);
    assert.match(row.second.text, secondPattern);
    const reverse = rows(second, first).find(row => row.key === key);
    assert.deepEqual(row.first, reverse.second);
    assert.deepEqual(row.second, reverse.first);
  }
  for (const [first, second] of [
    ["gjensidige-hytte-standard", "frende-hytte-standard"],
    ["gjensidige-hytte-pluss", "frende-hytte-utvidet"],
  ]) {
    const list = rows(first, second);
    const deadline = list.find(row => row.key === "hytte.krav.meldefrist");
    const procedure = list.find(row => row.key === "hytte.avtale.meldefrist");
    assert.match(deadline.first.text, /ett år/u);
    assert.match(deadline.second.text, /ett år/u);
    assert.equal(termsSourceHref(deadline.second.sources[0]), "/api/vilkar/frende/hytte-2026-11-20#page=15");
    assert.match(procedure.second.text, /politiet/u);
    assert.ok(!procedure.second.text.includes("ett år"));
    assert.equal(termsSourceHref(procedure.second.sources[0]), "/api/vilkar/frende/hytte-2026-11-20#page=5");
    assert.deepEqual(rows(second, first).find(row => row.key === deadline.key).first, deadline.second);
  }
});

test("Tryg's cabin deadline aligns while the prompt reporting obligation remains a separate term", () => {
  for (const [first, second] of [
    ["gjensidige-hytte-standard", "tryg-hytte-standard"],
    ["gjensidige-hytte-pluss", "tryg-hytte-ekstra"],
  ]) {
    const list = rows(first, second);
    const deadline = list.find(row => row.key === "hytte.krav.meldefrist");
    const report = list.find(row => row.key === "hytte.avtale.meldefrist");
    assert.match(deadline.first.text, /ett år/u);
    assert.match(deadline.second.text, /ett år/u);
    assert.match(report.second.text, /uten ugrunnet opphold/u);
    assert.equal(termsSourceHref(deadline.second.sources[0]), "/api/vilkar/tryg/hytte-sikkerhetsforskrift#page=3");
  }
});
