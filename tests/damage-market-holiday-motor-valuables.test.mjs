import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const product = (id, catalog = marketProductCatalog) => catalog.products.find(entry => entry.productId === id);
const facts = (id, catalog = marketProductCatalog) => materializeCatalogProduct(product(id, catalog), catalog).facts;
const fact = (id, key) => {
  const matches = facts(id).filter(entry => entry.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
};
const compare = (a, b, key) => compareCatalogProducts(product(a), product(b), marketProductCatalog).sections
  .flatMap(section => section.rows).find(row => row.key === key);

const trygStandard = "tryg-innbo-fritidsbolig-standard";
const trygEkstra = "tryg-innbo-fritidsbolig-ekstra";
const wcStandard = "watercircles-innbo-fritidsbolig-standard";
const wcElite = "watercircles-innbo-fritidsbolig-elite";
const sbStandard = "sb-innbo-fritidsbolig-standard";
const sbSuper = "sb-innbo-fritidsbolig-super";

function assertPdf(id, path) {
  const source = marketProductCatalog.sources[product(id).sourceId];
  assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), source.sha256, id);
}

test("Tryg MC Ekstra viser sykehuskompensasjon, reservedelsfrakt og transport ved ferge eller tog", () => {
  const id = "tryg-mc-mc-ekstra";
  const route = "https://www.tryg.no/odpdf?vilkNr=05PAU27010&vilk=Ekstra-MC#page=";
  const hospital = fact(id, "ulykke.sykehus");
  assert.equal(hospital.state, "included");
  assert.deepEqual(hospital.addOnNames, []);
  assert.match(hospital.value, /5 000 kr per skadetilfelle.*48 sammenhengende timer.*ulykkesskade/u);
  assert.equal(termsSourceHref(hospital.sources[0]), route + 2);
  assert.equal(fact(id, "ulykke.invaliditet").state, "optional");
  assert.equal(compare(id, "tryg-mc-kasko", "ulykke.sykehus").second.state, "unknown");

  const delivery = fact(id, "mc.langtur.transport.dekning");
  assert.match(delivery.value, /lever(e|ing av) reservedeler.*hindrer videre ferdsel.*tre timers reisetid/u);
  assert.equal(termsSourceHref(delivery.sources[0]), route + 1);
  assert.equal(fact(id, "mc.langtur.transport.grense").value, "Inntil 3 000 kr.");
  assert.equal(fact(id, "mc.langtur.transport.egenandel").value, "Ingen egenandel.");
  const ferry = fact(id, "mc.transport.bonustap");
  assert.match(ferry.value, /ferge eller tog.*uten bonustap/u);
  assert.equal(termsSourceHref(ferry.sources[0]), route + 1);
  assert.match(fact(id, "mc.parkert.dekning").value, /velteskade.*ukjent/u);
  assertPdf(id, "catalog/sources/mc-bobil/tryg-05PAU27010.pdf");
});

test("Bonustapsfritaket vises for MC Ekstra og Bobil Ekstra på sine egne vilkår", () => {
  for (const [kind, termsNumber, publicSlug] of [["mc", "PAU27010", "Ekstra-MC"], ["bobil", "PAU27007", "Ekstra-bobil"]]) {
    const id = "tryg-" + kind + "-" + kind + "-ekstra";
    const key = "avtale.bonus.fritak";
    const bonus = fact(id, key);
    assert.match(bonus.value, /bare under .* Ekstra medfører ikke bonustap/u);
    assert.equal(termsSourceHref(bonus.sources[0]), "https://www.tryg.no/odpdf?vilkNr=05" + termsNumber + "&vilk=" + publicSlug + "#page=2");
    assert.equal(compare(id, "tryg-" + kind + "-kasko", key).second.state, "unknown");
    assert.ok(facts(id, productCatalog).every(row => row.key !== key));
    assertPdf(id, "catalog/sources/mc-bobil/tryg-05" + termsNumber + ".pdf");
  }
  assert.ok(facts("tryg-bobil-bobil-ekstra").every(row => row.key !== "mc.transport.bonustap" && row.key !== "ulykke.sykehus"));
});

test("Tryg Fritidsinnbo Standard plasserer frysevarene på samme rader som WaterCircles", () => {
  const scope = compare(trygStandard, wcStandard, "innbo.fryserinnhold.dekning");
  const cap = compare(trygStandard, wcStandard, "innbo.fryserinnhold.grense");
  assert.equal(scope.first.state, "included");
  assert.equal(scope.second.state, "included");
  assert.match(scope.first.text, /svikt i strømforsyningen eller frysesystemet/u);
  assert.match(cap.first.text, /15 000 kr samlet/u);
  assert.match(cap.second.text, /10 000 kr/u);
  assert.equal(termsSourceHref(cap.first.sources[0]), "/api/vilkar/tryg/innbo-fritidsbolig-ppk32013-2026-07#page=4");
  assert.equal(compare(trygEkstra, trygStandard, "innbo.fryserinnhold.grense").first.state, "unknown");
});

test("Tryg og WaterCircles Fritidsinnbo binder beløpsgrenser til riktig nivå og PDF-side", () => {
  const levels = [trygStandard, trygEkstra, wcStandard, wcElite];
  const wcRoute = "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=";
  for (const [key, amounts, wcPages] of [
    ["innbo.yrkeslosore.grense", ["50 000", "100 000", "25 000", "100 000"], [5, 9]],
    ["innbo.datalager.grense", ["10 000", "50 000", "10 000", "50 000"], [5, 9]],
    ["innbo.vaesketap.grense", ["10 000", "40 000", "10 000", "20 000"], [3, 9]],
    ["innbo.smabygg.grense", ["30 000", "30 000", "20 000", "40 000"], [5, 9]],
    ["innbo.tilhenger.grense", ["20 000", "40 000", "20 000", "40 000"], [5, 9]],
  ]) {
    for (const [index, id] of levels.entries()) {
      const value = fact(id, key);
      assert.ok(value.value.includes(amounts[index] + " kr"), id + " " + key);
      assert.equal(value.sources[0].page, index < 2 ? 1 : wcPages[index - 2], id + " " + key);
    }
    assert.equal(compare(trygEkstra, wcElite, key).first.state, "included");
    assert.equal(compare(trygEkstra, wcElite, key).second.state, "included");
  }
  for (const [id, cap, page] of [[wcStandard, "20 000", 5], [wcElite, "40 000", 10]]) {
    const pool = fact(id, "innbo.basseng.grense");
    assert.match(pool.value, new RegExp(cap + " kr.*frittstående.*forsikringsstedet", "u"));
    assert.equal(termsSourceHref(pool.sources[0]), wcRoute + page);
    assert.match(fact(id, "innbo.tilhenger.grense").value, /per tilhenger.*unntatt ved naturskade/u);
  }
  for (const id of [trygStandard, trygEkstra]) for (const key of ["innbo.fritidsbat.grense", "innbo.tilhenger.grense"]) {
    assert.match(fact(id, key).value, /brann og tyveri på forsikringsstedet/u);
  }
});

test("Fritidsinnbo viser eksplisitte unntak med riktig variant og scope", () => {
  for (const [storebrand, gjensidige] of [[sbStandard, "gjensidige-innbo-hytte"], [sbSuper, "gjensidige-innbo-hytte-pluss"]]) {
    const adaptation = compare(storebrand, gjensidige, "innbo.ombygging.grense");
    assert.equal(adaptation.first.state, "unavailable");
    assert.equal(adaptation.second.state, "included");
    assert.match(adaptation.first.text, /rullestolbruker.*hytte eller annen fritidsbolig/u);
    assert.equal(termsSourceHref(adaptation.first.sources[0]), "/api/vilkar/storebrand/innbo-fritidsbolig-innbo10#page=19");
  }
  for (const [watercircles, storebrand] of [[wcStandard, sbStandard], [wcElite, sbSuper]]) {
    const stay = compare(watercircles, storebrand, "innbo.opphold.dekning");
    assert.equal(stay.first.state, "unavailable");
    assert.equal(stay.second.state, "included");
    assert.match(stay.first.text, /fast bopel.*erstatningshytte/u);
    assert.equal(termsSourceHref(stay.first.sources[0]), "/api/vilkar/watercircles/innbo-fritidsbolig-105#page=5");
  }
  const cash = "innbo.penger.dekning";
  assert.equal(compare(wcStandard, trygStandard, cash).first.state, "unavailable");
  assert.equal(compare(wcStandard, trygStandard, cash).second.state, "included");
  assert.equal(compare(wcElite, trygStandard, cash).first.state, "unknown");
});

test("Gjensidige Verdisak Pluss skiller tyveri fra bortkomst og viser begge kildene", () => {
  const id = "gjensidige-verdisak-pluss";
  const standard = "gjensidige-verdisak-standard";
  const theft = compare(id, standard, "verdisak.tyveri");
  assert.equal(theft.first.state, "included");
  assert.equal(theft.second.state, "included");
  assert.match(theft.first.text, /årsaken og tidspunktet må være kjent/iu);
  assert.deepEqual(theft.first.sources.map(termsSourceHref), [
    "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Verdigjenstand-Pluss-alminnelige-vilkar.pdf#page=2",
    "https://www.gjensidige.no/forsikring/verdigjenstandsforsikring",
  ]);
  assert.equal(compare(id, standard, "verdisak.tap").second.state, "unavailable");
  assert.equal(compare("frende-verdisak", id, "verdisak.tap").first.state, "unknown");
  assert.ok(facts(id, productCatalog).every(row => row.key !== "verdisak.tyveri"));
  assertPdf(id, "catalog/sources/private-valuables/gjensidige-verdisak-pluss.pdf");
});
