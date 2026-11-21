import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const basis = "if-person-gravid-basis";
const superId = "if-person-gravid-super";
const gratis = "tryg-person-gravid-gratis";
const ekstra = "tryg-person-gravid-ekstra";
const premium = "tryg-person-gravid-premium";
const storebrand = "storebrand-person-gravid";
const recipient = "person.gravid.mottaker";
const scarring = "person.gravid.ulykke.begrensning.arr";
const congenital = "person.gravid.dodsfall.begrensning.medfodt";
const geography = "person.gravid.geografi";
const expenses = "person.gravid.ulykkesutgifter";

function product(id, catalog = market) {
  const result = catalog.products.find(entry => entry.productId === id);
  assert.ok(result, id);
  return result;
}

function comparisonRow(left, right, key) {
  const rows = (a, b) => compareCatalogProducts(product(a), product(b), market).sections
    .flatMap(section => section.rows).filter(entry => entry.key === key);
  const direct = rows(left, right);
  const reverse = rows(right, left);
  assert.equal(direct.length, 1, key);
  assert.equal(reverse.length, 1, key);
  assert.equal(direct[0].label, reverse[0].label);
  assert.deepEqual(direct[0].first, reverse[0].second);
  assert.deepEqual(direct[0].second, reverse[0].first);
  return direct[0];
}

function assertPdf(cell, productId, page, section) {
  const source = cell.sources.find(candidate => candidate.documentId === "person:" + productId && candidate.page === page);
  assert.ok(source, productId + " / " + page);
  assert.equal(source.sourceType, "full_terms");
  assert.match(source.section, section);
  assert.match(termsSourceHref(source), new RegExp("#page=" + page + "$", "u"));
}

test("pregnancy products identify the exact recipient without mixing mother and child benefits", () => {
  for (const [id, page] of [[basis, 7], [superId, 10], [gratis, 3], [ekstra, 5], [premium, 5], [storebrand, 8]]) {
    const counterpart = id === storebrand ? gratis : storebrand;
    const { first, second } = comparisonRow(id, counterpart, recipient);
    assert.equal(first.state, "included");
    assert.match(first.text, /[Bb]arnets? (?:egen )?invaliditetserstatning tilfaller barnet/u);
    assertPdf(first, id, page, id === storebrand ? /E\.3/u : /Hvem utbetalingen går til/u);
    assert.equal(first.facts[0].role, "term");
    if (id.startsWith("tryg")) {
      assert.match(first.text, /mors død.*ektefellen.*arvingene etter lov eller testament.*annet er avtalt/iu);
      assert.equal(first.text.includes("dagpenger ved sykehusopphold"), id !== gratis);
    }
    if (id === storebrand) assertPdf(first, id, 6, /D\.3/u);
    else assert.match(second.text, /barnets dødsfall tilfaller forsikringstakeren/u);
  }
});

test("scar restrictions and coordination after congenital diagnosis are attached to their own rows", () => {
  for (const [id, page] of [[basis, 5], [superId, 8]]) {
    for (const candidate of [gratis, ekstra, premium]) {
      const { first, second } = comparisonRow(id, candidate, scarring);
      assert.match(first.text, /invaliditetsgrad under 15 %/u);
      assert.match(second.text, /utenfor ansiktet er unntatt/u);
      assert.equal(first.facts[0].role, "term");
      assert.equal(second.facts[0].role, "term");
      assertPdf(first, id, page, /§ 5\.6/u);
      assertPdf(second, candidate, 1, /§ 2\.1/u);
    }
  }
  for (const candidate of [ekstra, premium]) {
    const { first, second } = comparisonRow(superId, candidate, congenital);
    for (const cell of [first, second]) assert.match(cell.text, /før.*forfaller.*dødsfallsdekningen.*etter forfall.*bare engangsbeløpet/u);
    assertPdf(first, superId, 10, /§ 6\.2\.5/u);
    assertPdf(first, superId, 9, /§ 6\.2\.2/u);
    assertPdf(second, candidate, 3, /§ 2\.2/u);
    assertPdf(second, candidate, 4, /§ 2\.4/u);
    assert.equal(comparisonRow(gratis, candidate, congenital).first.state, "unknown");
  }
});

test("Storebrand's residence conditions, Nordic scope and future application remain distinct", () => {
  const territory = comparisonRow(storebrand, premium, geography);
  assert.equal(territory.first.text, "Norden. Psykologisk førstehjelp gjennomføres hos psykolog i Norge.");
  assertPdf(territory.first, storebrand, 11, /I\.1\.4/u);
  assertPdf(territory.first, storebrand, 4, /B\.2\.1/u);
  assert.match(territory.second.text, /utenlandsopphold.*seks måneder/u);
  const who = comparisonRow(storebrand, premium, "person.gravid.hvem").first;
  assert.match(who.text, /mor eller verge.*fast bopel i Norge.*ikke er nordisk statsborger.*de siste fem årene/u);
  assertPdf(who, storebrand, 2, /Definisjoner/u);
  assertPdf(who, storebrand, 11, /I\.1\.3/u);
  const next = comparisonRow(storebrand, premium, "person.gravid.videre.barneforsikring").first;
  assert.match(next.text, /søke.*opphører.*tre måneder.*helseerklæring/u);
  assertPdf(next, storebrand, 10, /G\.2/u);
});

test("treatment requirements retain their benefit limits and verified archive bindings", () => {
  for (const id of [ekstra, premium]) {
    const { first, second } = comparisonRow(storebrand, id, expenses);
    assert.match(first.text, /50 000 kr.*to årene.*1 000 kr.*transport fra skadestedet.*privat sykehus/iu);
    assert.match(second.text, /tre år.*5 %.*offentlig sykehus.*skriftlig anbefalt.*3,50 kr per kilometer/u);
    assertPdf(first, storebrand, 9, /F\.2/u);
    assertPdf(second, id, 3, /§ 2\.3/u);
  }
  for (const id of [basis, superId, gratis, ekstra, premium, storebrand]) {
    const source = market.sources["person:" + id];
    const content = readFileSync(new URL("../catalog/sources/person/" + source.filename, import.meta.url));
    assert.equal(createHash("sha256").update(content).digest("hex"), source.sha256);
    const rawFacts = materializeCatalogProduct(product(id, raw), raw).facts;
    for (const key of [recipient, scarring, congenital, "person.gravid.videre.barneforsikring"]) {
      assert.ok(!rawFacts.some(fact => fact.key === key), id + " / " + key);
    }
  }
});
