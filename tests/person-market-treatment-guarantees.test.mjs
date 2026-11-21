import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const firstCare = "person.behandling.forste_helsehjelp";
const specialistOnly = "person.behandling.ventetid";
const insuredPerson = "person.behandling.hvem";
const gj = "gjensidige-person-behandling";
const gj55 = "gjensidige-person-helse-55";
const fremtind = "fremtind-person-behandling";
const land = "landkreditt-person-behandling";
const ifHealth = "if-person-helse";
const storebrand = "storebrand-person-helse";

function product(id, catalog = market) {
  const entry = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(entry, id);
  return entry;
}

function rows(a, b) {
  return compareCatalogProducts(product(a), product(b), market).sections.flatMap(section => section.rows);
}

function row(a, b, key) {
  const direct = rows(a, b).filter(value => value.key === key);
  const reverse = rows(b, a).filter(value => value.key === key);
  assert.equal(direct.length, 1, a + " / " + b + " / " + key);
  assert.equal(reverse.length, 1, b + " / " + a + " / " + key);
  assert.equal(direct[0].label, reverse[0].label);
  assert.deepEqual(direct[0].first, reverse[0].second);
  assert.deepEqual(direct[0].second, reverse[0].first);
  return direct[0];
}

function pdf(term, id, page, section) {
  const source = term.sources.find(candidate => candidate.documentId === "person:" + id && candidate.page === page);
  assert.ok(source, id + " / " + page);
  assert.equal(source.sourceType, "full_terms");
  assert.match(source.section, section);
  assert.ok(termsSourceHref(source).endsWith("#page=" + page));
}

function originalFacts(id) {
  return materializeCatalogProduct(product(id, productCatalog), productCatalog).facts;
}

test("first treatment and specialist guarantees occupy one common row in the market comparison", () => {
  for (const [id, other, page, section, detail] of [
    [gj, storebrand, 9, /§ 3\.1/u, /henvisning fra allmennlege eller annen dokumentasjon/u],
    [gj55, "tryg-person-behandling-55", 8, /§ 1\.2/u, /henvisning fra allmennlege eller annen dokumentasjon/u],
    [fremtind, ifHealth, 1, /§ 4\.1/u, /forhåndsgodkjent.*henvisning der den kreves.*fullmakt og nødvendig medisinsk dokumentasjon/u],
  ]) {
    const compared = row(id, other, firstCare);
    assert.equal(compared.label, "Frist for første konsultasjon, undersøkelse eller behandling");
    assert.equal(compared.first.state, "included");
    assert.equal(compared.second.state, "included");
    assert.match(compared.first.text, /legespesialist innen 10 virkedager/u);
    assert.match(compared.first.text, detail, id);
    pdf(compared.first, id, page, section);
    assert.ok(!rows(id, other).some(item => item.key === specialistOnly));
    assert.ok(originalFacts(id).some(term => term.key === specialistOnly));
    assert.ok(!originalFacts(id).some(term => term.key === firstCare));
  }
  pdf(row(fremtind, ifHealth, firstCare).first, fremtind, 5, /§ 5\.5/u);
  const surgery = row(gj, fremtind, "person.behandling.operasjon");
  assert.match(surgery.first.text, /10 virkedager.*sykehusbehandling/u);
  assert.match(surgery.second.text, /sykehusbehandling innen 15 virkedager/u);
  assert.match(row(gj55, gj, "person.behandling.dagkirurgifrist").first.text, /10 virkedager/u);
  assert.match(row(gj, fremtind, "person.behandling.garantikompensasjon").first.text, /500 kr per påbegynt døgn/u);
});

test("the insured-person row records eligibility and dates only where the product terms state them", () => {
  for (const [id, page, section, detail] of [
    [ifHealth, 2, /§ 1/u, /forsikringsbeviset.*Ved forsikringstilfellet.*Norden.*norsk folketrygd.*norske offentlig finansierte helsevesenet/u],
    [gj, 2, /Hvem forsikringen omfatter/u, /forsikringsbeviset.*norsk folketrygd/u],
    [gj55, 2, /Hvem forsikringen omfatter/u, /forsikringsbeviset.*norsk folketrygd/u],
    [fremtind, 1, /§ 2/u, /Forsikringsbeviset angir hvem/u],
    [land, 3, /§ 2\.2/u, /norsk folketrygd.*fra fylte 18 år/u],
    [storebrand, 3, /§ 1\.4\.1/u, /Individuell avtale.*Norden.*nordisk lands trygdesystem.*fra fødselen.*dagen før forsikrede fyller 67 år/u],
  ]) {
    const cell = row(id, id === ifHealth ? gj : ifHealth, insuredPerson).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, detail, id);
    pdf(cell, id, page, section);
    assert.ok(!originalFacts(id).some(term => term.key === insuredPerson));
  }
  assert.doesNotMatch(row(gj55, ifHealth, insuredPerson).first.text, /55 år/u);
});

test("Landkreditt cites the public waiting-time prerequisite and If links the exact aftercare page", () => {
  const landTerm = row(land, gj, firstCare).first;
  assert.match(landTerm.text, /10 virkedager fra Falck mottar gyldig henvisning og signert samtykke.*første henvisning.*forsikringstiden.*ventetiden i det offentlige helsevesenet må overstige garantitiden/u);
  pdf(landTerm, land, 4, /§ 6\.3/u);
  pdf(landTerm, land, 3, /§ 6\.1/u);
  const aftercare = row(ifHealth, gj, "person.behandling.etterkontroll").first;
  assert.match(aftercare.text, /samme diagnose dekkes samlet i inntil ni måneder.*oppstart av dekket primærbehandling.*uavhengig av antall forsikringstilfeller/u);
  pdf(aftercare, ifHealth, 4, /§ 5\.6/u);
  assert.match(row(ifHealth, gj, firstCare).first.text, /står i forsikringsbeviset/u);
});
