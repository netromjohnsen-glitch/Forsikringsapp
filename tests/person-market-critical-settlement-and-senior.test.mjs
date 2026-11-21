import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const ifCritical = "if-person-kritisk";
const storebrand = "storebrand-person-kritisk";
const senior = "if-person-godt-voksen";
const recipient = "person.sykdom.mottaker";

function product(id, catalog = market) {
  const result = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(result, id);
  return result;
}

function fact(id, key, catalog = market) {
  const matches = materializeCatalogProduct(product(id, catalog), catalog).facts.filter(term => term.key === key);
  assert.equal(matches.length, 1, id + " / " + key);
  return matches[0];
}

function row(first, second, key) {
  const result = compareCatalogProducts(product(first), product(second), market);
  const matches = result.sections.flatMap(section => section.rows).filter(term => term.key === key);
  assert.equal(matches.length, 1, first + " / " + second + " / " + key);
  return matches[0];
}

function sourcesAs(cell, expected) {
  assert.deepEqual(cell.sources.map(source => [source.documentId, source.page, source.agreementScope]), expected);
  for (const source of cell.sources) {
    assert.equal(source.sourceType, "full_terms");
    assert.ok(termsSourceHref(source).endsWith("#page=" + source.page));
  }
}

test("Kritisk sykdom sammenligner mottaker og begunstigelse på samme rad", () => {
  const direct = row(ifCritical, storebrand, recipient);
  const reverse = row(storebrand, ifCritical, recipient);
  assert.equal(direct.label, "Hvem får utbetalingen?");
  assert.equal(direct.label, reverse.label);
  assert.deepEqual(direct.first, reverse.second);
  assert.deepEqual(direct.second, reverse.first);
  assert.match(direct.first.text, /den forsikrede\./u);
  assert.match(direct.second.text, /forsikringstakeren.*§ 15-1.*særskilt begunstiget/u);
  sourcesAs(direct.first, [["person:if-person-kritisk", 10, "ordinary"]]);
  sourcesAs(direct.second, [["person:storebrand-person-kritisk", 8, "ordinary"]]);

  const fremtind = row("fremtind-person-kritisk", "landkreditt-person-kritisk", recipient);
  assert.match(fremtind.first.text, /den forsikrede.*dør etter.*§ 15-1/u);
  assert.match(fremtind.second.text, /sykdomsdiagnosen.*forsikringstakeren/u);
  sourcesAs(fremtind.first, [["person:fremtind-person-kritisk", 2, "ordinary"]]);
  sourcesAs(fremtind.second, [["person:landkreditt-person-kritisk", 7, "ordinary"]]);
  assert.ok(!materializeCatalogProduct(product(ifCritical, raw), raw).facts.some(term => term.key === recipient));
});

test("Mottaker for medlemsdekning og ektefelledekning har riktig avtale, og Gjensidige følger forsikringsbevisets forrang", () => {
  const member = "tryg-utdanningsforbundet-kritisk-sykdom-medlem";
  const spouse = "tryg-utdanningsforbundet-kritisk-sykdom-ektefelle";
  const employeeAgreement = row(member, spouse, recipient);
  assert.match(employeeAgreement.first.text, /det forsikrede medlemmet/u);
  assert.match(employeeAgreement.second.text, /den forsikrede ektefellen eller samboeren/u);
  sourcesAs(employeeAgreement.first, [[member + "-terms", 8, "utdanningsforbundet"]]);
  sourcesAs(employeeAgreement.second, [[spouse + "-terms", 8, "utdanningsforbundet"]]);

  const external = row("gjensidige-person-alvorlig-sykdom", spouse, recipient);
  assert.equal(external.first.state, "included");
  assert.match(external.first.text, /den forsikrede.*den aktuelle avtalen går foran vilkårene/u);
  assert.equal(external.second.state, "included");
  sourcesAs(external.first, [
    ["person:gjensidige-person-alvorlig-sykdom", 1, "ordinary"],
    ["person:gjensidige-person-alvorlig-sykdom", 3, "ordinary"],
  ]);
});

test("KLPs aldersreduksjon og Ifs meldefrist har egne rader i kritisk sykdom", () => {
  const klp = "klp-person-alvorlige-sykdommer";
  const reduction = row(klp, ifCritical, "person.sykdom.sum.aldersreduksjon");
  assert.match(reduction.first.text, /10 % per år fra fylte 60 år/u);
  assert.equal(reduction.second.state, "unknown");
  sourcesAs(reduction.first, [["person:klp-person-alvorlige-sykdommer", 6, "ordinary"]]);

  const notice = row(ifCritical, "landkreditt-person-kritisk", "person.sykdom.meldefrist");
  assert.match(notice.first.text, /meldes til If omgående/u);
  assert.match(notice.second.text, /innen ett år/u);
  sourcesAs(notice.first, [["person:if-person-kritisk", 9, "ordinary"]]);
});

test("Godt voksen viser helsekrav, oppgjør, mottaker og grensen ved flere brudd", () => {
  const source = "person:if-person-godt-voksen";
  const screening = fact(senior, "person.senior.helsevurdering");
  assert.match(screening.value, /enkel helsevurdering.*avslag.*Daglig røyking gir pristillegg/u);
  sourcesAs(screening, [[source, 3, "ordinary"], [source, 2, "ordinary"]]);

  const settlement = fact(senior, "person.senior.oppgjor");
  assert.match(settlement.value, /til If omgående.*mottatt kravet med nødvendig dokumentasjon/u);
  sourcesAs(settlement, [[source, 5, "ordinary"]]);
  const payment = fact(senior, "person.senior.mottaker");
  assert.match(payment.value, /den forsikrede/u);
  sourcesAs(payment, [[source, 5, "ordinary"]]);

  const fracture = fact(senior, "person.senior.brudd");
  assert.match(fracture.value, /30 000 kr.*tre skadetilfeller.*samme hendelse teller som ett/u);
  sourcesAs(fracture, [[source, 4, "ordinary"]]);
  assert.doesNotMatch(fact(senior, "person.senior.brudd", raw).value, /samme hendelse/u);
});
