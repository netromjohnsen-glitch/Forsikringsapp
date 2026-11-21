import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function product(id, catalog = marketProductCatalog) {
  const item = catalog.products.find(product => product.productId === id);
  assert.ok(item, id);
  return item;
}

function facts(id, catalog = marketProductCatalog) {
  return materializeCatalogProduct(product(id, catalog), catalog).facts;
}

function fact(id, key, catalog = marketProductCatalog) {
  const rows = facts(id, catalog).filter(row => row.key === key);
  assert.equal(rows.length, 1, id + " / " + key);
  return rows[0];
}

function compareRow(left, right, key) {
  const comparison = compareCatalogProducts(product(left), product(right), marketProductCatalog);
  const rows = comparison.sections.flatMap(section => section.rows).filter(row => row.key === key);
  assert.equal(rows.length, 1, left + " / " + right + " / " + key);
  return rows[0];
}

test("If Liv keeps beneficiary priority and documents the separation and unnamed cohabitant rules", () => {
  const key = "person.liv.mottaker";
  const id = "if-person-liv";
  const term = fact(id, key);
  assert.match(term.value, /begunstiget som er avtalt med If.*Var avdøde selv forsikringstaker.*ektefelle eller registrert partner.*arvinger etter lov eller testament/u);
  assert.match(term.value, /dom eller bevilling om separasjon eller skilsmisse før dødsfallet.*ikke er rettskraftig eller endelig/u);
  assert.match(term.value, /ikke navngitt.*ekteskapslignende.*folkeregistrerte bolig de siste to årene.*felles barn og felles bolig.*tidligere samlivsbrudd/u);
  assert.deepEqual(term.sources.map(({ documentId, page, section }) => [documentId, page, section]), [
    ["person:if-person-liv", 5, "§ 6.3 – Hvem utbetalingen går til"],
  ]);
  const frende = "frende-person-liv";
  assert.deepEqual(compareRow(id, frende, key).first, compareRow(frende, id, key).second);
  assert.doesNotMatch(fact(id, key, productCatalog).value, /separasjon eller skilsmisse/u);
});

test("the five sourced Uførepensjon income rules share a row and keep their distinct caps and exceptions", () => {
  const key = "person.ufore.pensjon.inntektsreduksjon";
  const klp = "klp-person-ufore";
  const cases = [
    ["if-person-uforepensjon", 5, "§ 6.4", /annen pensjon og trygd.*gjennomsnittlig månedlig arbeidsinntekt de siste tre årene/u, /90 %/u],
    ["gjensidige-person-uforepensjon", 7, "Erstatningsregler § 1.3", /90 %.*tre årene før uførheten.*mindre enn 100 000 kr lavere.*før fylte 30 år som barn, elev, student eller vernepliktig.*høyst 1 G/u],
    ["storebrand-person-ufore", 4, "§ A.2.4", /90 %.*brutto arbeidsinntekt eller netto næringsinntekt de siste to årene.*inntil 10 000 kr per måned.*inntektsnedgang på inntil 100 000 kr/u],
    ["frende-person-uforepensjon", 2, "§ 3", /utbetaling fra arbeidsgiver samlet overstiger gjennomsnittlig arbeidsinntekt de siste tre årene før uførheten/u, /90 %/u],
  ];
  for (const [id, page, section, expected, excluded] of cases) {
    const direct = compareRow(id, klp, key);
    const reverse = compareRow(klp, id, key);
    assert.equal(direct.label, "Reduksjon av uførepensjon ved annen inntekt");
    assert.equal(direct.first.state, "included");
    assert.match(direct.first.text, expected, id);
    if (excluded) assert.doesNotMatch(direct.first.text, excluded, id);
    assert.match(direct.second.text, /90 %.*tre årene.*under 10 000 kr/u);
    assert.deepEqual(direct.first, reverse.second, id);
    assert.deepEqual(direct.first.sources.map(source => [source.documentId, source.page, source.section]), [
      ["person:" + id, page, section],
    ]);
    assert.ok(!facts(id, productCatalog).some(term => term.key === key), id);
  }
});

test("Gjensidige monthly advances have a one-year age-expiry exception separate from the two-year capital exception", () => {
  const id = "gjensidige-person-uforekapital";
  const duration = fact(id, "person.ufore.forskudd.varighet");
  const capital = fact(id, "person.ufore.kapital.opphor");
  assert.match(duration.value, /stopper senest to år etter opphørsdatoen.*samlet forskudd tilsvarer forsikringssummen.*60 måneder/u);
  assert.match(duration.value, /minst 50 % arbeidsufør mens forsikringen gjaldt.*samme sykdom eller ulykke.*innen ett år etter opphørsdatoen/u);
  assert.match(capital.value, /samme årsak innen to år etter opphør/u);
  assert.deepEqual(duration.sources.map(({ page, section }) => [page, section]), [
    [7, "Erstatningsregler § 1.4"],
    [8, "Erstatningsregler § 3.5"],
  ]);
  assert.doesNotMatch(fact(id, duration.key, productCatalog).value, /innen ett år/u);
});

test("all Gjensidige Barn levels document services and continuation without treating digital support as crisis cover", () => {
  const ifBarn = "if-person-barn-standard";
  for (const level of ["basis", "medium", "pluss"]) {
    const id = "gjensidige-person-barn-" + level;
    const term = fact(id, "person.barn.opphor");
    const helpline = fact(id, "person.barn.helserad");
    const digital = fact(id, "person.barn.digital_psykisk_helsehjelp");
    assert.match(term.value, /omsorgsbehov opphører når barnet fyller 18 år.*videreføres ved første hovedforfall etter fylte 26 år.*1 000 000 kr.*individuell uførepensjon/u);
    assert.deepEqual(term.sources.map(s => [s.documentId, s.page]), [
      ["person:" + id, 4], ["person:" + id + ":barn-uforepensjon", 2],
    ]);
    assert.match(helpline.value, /Helsehjelp 24\/7.*alle i samme husstand/u);
    assert.match(digital.value, /Foreldre.*uansett hvor gammelt barnet er.*12 til 15 år.*Fra fylte 16 år.*Ungt liv/u);
    for (const entry of [helpline, digital]) {
      assert.equal(entry.sources[0].page, 1);
      assert.ok(!facts(id, productCatalog).some(row => row.key === entry.key));
    }
    assert.equal(compareRow(id, ifBarn, "person.barn.helserad").second.state, "included");
    assert.equal(compareRow(id, ifBarn, "person.barn.psykologisk_forstehjelp").first.state, "unknown");
    assert.doesNotMatch(fact(id, term.key, productCatalog).value, /1 000 000 kr/u);
  }
});

test("the new market references retain the scoped PDF editions and archived routes", () => {
  const bindings = [
    ["person:if-person-liv", "if/livsforsikring", 5],
    ["person:if-person-uforepensjon", "if/uforepensjon", 5],
    ["person:gjensidige-person-uforepensjon", "gjensidige/uforepensjon", 7],
    ["person:gjensidige-person-uforekapital", "gjensidige/uforekapital-med-forskudd", 8],
    ["person:storebrand-person-ufore", "storebrand/uforeforsikring-uf03", 4],
    ["person:frende-person-uforepensjon", "frende/uforepensjon", 2],
    ...["basis", "medium", "pluss"].flatMap(level => [
      ["person:gjensidige-person-barn-" + level, "gjensidige/barneforsikring", 4],
      ["person:gjensidige-person-barn-" + level + ":barn-uforepensjon", "gjensidige/uforepensjon-barn", 2],
    ]),
  ];
  for (const [id, route, page] of bindings) {
    const source = marketProductCatalog.sources[id];
    assert.ok(source, id);
    assert.equal(source.agreementScope, "ordinary", id);
    assert.equal(source.sourceType, "full_terms", id);
    const url = new URL("../catalog/sources/person/" + source.filename, import.meta.url);
    const checksum = createHash("sha256").update(readFileSync(url)).digest("hex");
    assert.equal(checksum, source.sha256, id);
    assert.equal(termsSourceHref({ documentId: id, effectiveFrom: source.effectiveFrom, url: source.url, page }),
      "/api/vilkar/" + route + "#page=" + page, id);
  }
});
