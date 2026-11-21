import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const diabetes = "person.barn.diagnose.diabetes_insulin";
const survival = "person.barn.diagnose.overlevelse";
const diagnosis = "person.barn.diagnose";
const ifSuper = "if-person-barn-super";
const trygExtra = "tryg-person-barn-ekstra";
const trygAccident = "tryg-person-barn-ulykke";
const frendeBra = "frende-person-barn-bra";
const frendeBest = "frende-person-barn-best";
const storebrandSuper = "storebrand-person-barn-super";
const landkreditt = "landkreditt-person-barn";

function product(id, catalog) {
  const product = catalog.products.find(product => product.productId === id);
  assert.ok(product, id);
  return product;
}

function facts(id, catalog = marketProductCatalog) {
  return materializeCatalogProduct(product(id, catalog), catalog).facts;
}

function fact(id, key) {
  const matches = facts(id).filter(fact => fact.key === key);
  assert.equal(matches.length, 1, id + " / " + key);
  return matches[0];
}

function alignedRow(first, second, key) {
  const catalog = marketProductCatalog;
  const rows = (a, b) => compareCatalogProducts(product(a, catalog), product(b, catalog), catalog)
    .sections.flatMap(section => section.rows).filter(row => row.key === key);
  const direct = rows(first, second);
  const reverse = rows(second, first);
  assert.equal(direct.length, 1, first + " / " + second + " / " + key);
  assert.equal(reverse.length, 1, first + " / " + second + " / " + key);
  assert.equal(direct[0].label, reverse[0].label);
  assert.deepEqual(direct[0].first, reverse[0].second);
  assert.deepEqual(direct[0].second, reverse[0].first);
  return direct[0];
}

test("insulin-dependent diabetes appears on one row with each insurer's diagnostic criteria", () => {
  const e10 = /E10.*spesialist i barnesykdommer eller indremedisin.*fastende blodsukker.*7 mmol\/l/u;
  const otherGj = ["basis", "medium", "pluss"].map(tier => [
    "gjensidige-person-barn-" + tier, 10, /kode E10 eller E11.*spesialist/u,
  ]);
  for (const [id, page, clause] of [
    [trygExtra, 6, e10],
    ["if-person-barn-standard", 6, e10],
    [ifSuper, 6, e10],
    ...otherGj,
    ["storebrand-person-barn-standard", 10, /type 1-diabetes diagnostisert ved sykehus/u],
    [storebrandSuper, 10, /type 1-diabetes diagnostisert ved sykehus/u],
    [frendeBra, 8, /HbA1c på minst 48 mmol\/mol.*6,5 %.*spesialist/u],
    [frendeBest, 8, /HbA1c på minst 48 mmol\/mol.*6,5 %.*spesialist/u],
    ["fremtind-person-barn", 3, /diagnostisert av barnelege eller indremedisiner/u],
    ["klp-person-barn", 2, /Type 1-diabetes.*oppførte alvorlige sykdommene/u],
    ["klp-person-barn-maks", 2, /Type 1-diabetes.*oppførte alvorlige sykdommene/u],
    [landkreditt, 8, /fastende prøver.*over 8 mmol\/l.*insulin i mer enn tre måneder/u],
  ]) {
    const comparison = alignedRow(id, id === ifSuper ? landkreditt : ifSuper, diabetes);
    assert.equal(comparison.label, "Insulinkrevende diabetes");
    assert.equal(comparison.first.state, "included", id);
    assert.match(comparison.first.text, clause, id);
    assert.equal(comparison.first.sources[0].page, page, id);
    assert.match(termsSourceHref(comparison.first.sources[0]), new RegExp("#page=" + page + "$", "u"));
    assert.ok(!facts(id, productCatalog).some(fact => fact.key === diabetes), id);
  }
  const absent = alignedRow(trygAccident, trygExtra, diabetes);
  assert.equal(absent.first.state, "unavailable");
  assert.match(absent.first.text, /ikke oppført.*engangsutbetaling i tillegget Utvalgte sykdommer/u);
  assert.equal(termsSourceHref(absent.first.sources[0]), "/api/vilkar/tryg/barn-utvalgte-sykdommer#page=1");
});

test("survival is a shared term while selected diseases on child accident remains optional", () => {
  for (const [id, state, page, expected] of [
    [trygExtra, "included", 5, /30 dager.*diagnosen er endelig stilt/u],
    [trygAccident, "optional", 2, /tillegget Utvalgte sykdommer.*30 dager/u],
    ["if-person-barn-standard", "included", 5, /24 timer etter forsikringstilfellet.*behandlingen er gjennomført/u],
    [ifSuper, "included", 5, /24 timer etter forsikringstilfellet.*behandlingen er gjennomført/u],
    ["storebrand-person-barn-standard", "included", 12, /24 timer.*diagnosen er endelig stilt/u],
    [storebrandSuper, "included", 12, /24 timer.*diagnosen er endelig stilt/u],
    [frendeBra, "included", 6, /30 dager.*diagnosen er endelig stilt/u],
    [frendeBest, "included", 6, /30 dager.*diagnosen er endelig stilt/u],
    ["klp-person-barn", "included", 7, /30 dager.*gjennomført operasjon eller registrering på venteliste/u],
    ["klp-person-barn-maks", "included", 7, /30 dager.*gjennomført operasjon eller registrering på venteliste/u],
    [landkreditt, "included", 4, /30 dager.*vilkårene er oppfylt/u],
  ]) {
    const comparison = alignedRow(id, id === ifSuper ? trygExtra : ifSuper, survival);
    assert.equal(comparison.label, "Krav om overlevelse ved diagnoseutbetaling");
    assert.equal(comparison.first.state, state, id);
    assert.match(comparison.first.text, expected, id);
    assert.equal(comparison.first.sources[0].page, page, id);
    assert.ok(!facts(id, productCatalog).some(fact => fact.key === survival), id);
  }
  assert.deepEqual(fact(trygAccident, survival).addOnNames, ["Utvalgte sykdommer"]);
  assert.equal(alignedRow("gjensidige-person-barn-basis", ifSuper, survival).first.state, "unknown");
  assert.equal(alignedRow("fremtind-person-barn", ifSuper, survival).first.state, "unknown");
  assert.match(fact(frendeBra, diagnosis).value, /30 dager etter endelig diagnose/u);
  assert.match(fact("klp-person-barn", diagnosis).value, /30 dager etter endelig diagnose/u);
  assert.match(fact(storebrandSuper, diagnosis).value, /24 timer etter endelig diagnose/u);
});

test("Frende Bra and Best keep distinct offer limits and identify the policy certificate", () => {
  for (const [key, bra, best, page] of [
    ["person.barn.sykdom", /10 G for Bra/u, /20 G for Best/u, 3],
    ["person.barn.invaliditet", /10 G for Bra/u, /20 G for Best/u, 3],
    ["person.barn.uforepensjon", /0,5 G per år for Bra/u, /1 G per år for Best/u, 5],
  ]) {
    const comparison = alignedRow(frendeBra, frendeBest, key);
    assert.equal(comparison.different, true);
    assert.match(comparison.first.text, bra);
    assert.match(comparison.second.text, best);
    for (const cell of [comparison.first, comparison.second]) {
      assert.match(cell.text, /Avtalt sum står i forsikringsbeviset/u);
      assert.deepEqual(cell.sources.map(source => [source.page, source.sourceType]), [
        [page, "full_terms"], [0, "product_page"],
      ]);
      assert.equal(termsSourceHref(cell.sources[1]), "https://www.frende.no/forsikringer/barneforsikring/");
    }
  }
  for (const id of [frendeBra, frendeBest]) {
    assert.match(fact(id, diagnosis).value, /3 G per oppført diagnose/u);
    assert.match(fact(id, "person.barn.ulykkesutgifter").value, /2 G.*1 000 kr/u);
    const housing = fact(id, "person.barn.boligtilpasning");
    assert.match(housing.value, /4 G.*10 000 kr.*innen tre år/u);
    assert.equal(termsSourceHref(housing.sources[0]), "/api/vilkar/frende/barneforsikring#page=6");
    assert.match(fact(id, "person.barn.opphor").value, /100 000 kr.*ny helseerklæring.*Reservasjoner.*utbetalingen opphører/u);
  }
});

test("KLP and Landkreditt identify which cover can continue and which date starts the limit", () => {
  const expiry = "person.barn.opphor";
  const standard = alignedRow("klp-person-barn", ifSuper, expiry).first;
  const maks = alignedRow("klp-person-barn-maks", ifSuper, expiry).first;
  assert.match(standard.text, /dødsfall og medisinsk invaliditet ved ulykke.*samme summer og reservasjoner.*uten ny helsevurdering.*kontaktopplysninger/u);
  assert.doesNotMatch(standard.text, /uførepensjon/u);
  assert.match(maks.text, /uførepensjon, dødsfall og medisinsk invaliditet ved ulykke/u);
  assert.equal(termsSourceHref(standard.sources[0]), "/api/vilkar/klp/barneforsikring#page=9");
  assert.equal(termsSourceHref(maks.sources[0]), "/api/vilkar/klp/barn-maks#page=10");

  const land = alignedRow(landkreditt, ifSuper, expiry).first;
  assert.match(land.text, /døds- og uføredekningen.*samme forsikringssum innen seks måneder uten nye helseopplysninger/u);
  assert.deepEqual(land.sources.map(source => source.page), [13, 12]);
  const capital = fact(landkreditt, "person.barn.uforekapital");
  assert.match(capital.value, /begynte i forsikringstiden.*samme ulykke eller sykdom.*fem år etter opphør/u);
  assert.deepEqual(capital.sources.map(source => source.page), [4, 8]);
});

test("Tryg long-term illness relief and Fremtind's capital remain independent benefits", () => {
  const key = "person.barn.langvarig_sykdom";
  const comparison = alignedRow(trygExtra, "fremtind-person-barn", key);
  assert.match(comparison.first.text, /1 000 kr per dag fra første dag.*mer enn ni sammenhengende dager.*20 år.*365 dager.*pleiepenger eller omsorgspenger.*tre år etter første innleggelse eller sykedag/u);
  assert.deepEqual(comparison.first.sources.map(source => source.page), [4, 3]);
  assert.equal(comparison.second.state, "unknown");
  assert.match(fact(trygExtra, "person.barn.sykehus").value, /sykehus i Norden/u);

  const fremtind = "fremtind-person-barn";
  const injured = fact(fremtind, "person.barn.invaliditet");
  assert.match(injured.value, /5 % eller lavere.*100 % utbetales 25 G/u);
  assert.equal(injured.sources[0].page, 2);
  const diagnosisPayment = fact(fremtind, diagnosis);
  assert.match(diagnosisPayment.value, /4 G.*G på diagnosetidspunktet.*én gang.*trekkes fra eventuell invaliditetserstatning/u);
  assert.equal(diagnosisPayment.sources[0].page, 3);
});
