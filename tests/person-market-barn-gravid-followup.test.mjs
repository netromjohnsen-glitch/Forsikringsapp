import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function product(id, catalog) {
  const record = catalog.products.find(product => product.productId === id);
  assert.ok(record, id);
  return record;
}

function facts(id, catalog = marketProductCatalog) {
  return materializeCatalogProduct(product(id, catalog), catalog).facts;
}

function fact(id, key) {
  const matches = facts(id).filter(fact => fact.key === key);
  assert.equal(matches.length, 1, id + " / " + key);
  return matches[0];
}

function compare(first, second) {
  return compareCatalogProducts(...[first, second].map(id => product(id, marketProductCatalog)), marketProductCatalog);
}

function row(first, second, key) {
  const lookup = result => result.sections.flatMap(section => section.rows).filter(row => row.key === key);
  const direct = lookup(compare(first, second));
  const reverse = lookup(compare(second, first));
  assert.equal(direct.length, 1, first + " / " + second + " / " + key);
  assert.equal(reverse.length, 1, second + " / " + first + " / " + key);
  assert.equal(direct[0].label, reverse[0].label);
  assert.deepEqual(direct[0].first, reverse[0].second);
  assert.deepEqual(direct[0].second, reverse[0].first);
  return direct[0];
}

test("Gjensidige child disability payment distinguishes the public options and the individual terms", () => {
  const key = "person.barn.uforepensjon";
  const providerPage = "https://www.gjensidige.no/forsikring/barneforsikring";
  for (const [level, offer] of [
    ["basis", /Basis gir 0,8 G per år.*inntil ti år/u],
    ["medium", /Medium gir 0,4 G per år.*fylte 67 år/u],
    ["pluss", /Pluss gir 0,8 G per år.*fylte 67 år/u],
  ]) {
    const id = "gjensidige-person-barn-" + level;
    const pension = fact(id, key);
    assert.match(pension.value, offer);
    assert.match(pension.value, /månedlig etterskuddsvis.*18 år.*50 %.*arbeidsavklaringspenger eller uføretrygd.*forsikringsbeviset/u);
    assert.deepEqual(pension.sources.map(source => [source.documentId, source.page, source.sourceType]), [
      ["person:" + id + ":barn-uforepensjon", 2, "full_terms"],
      ["person:gjensidige-person-barn:pakkeoversikt", 0, "product_page"],
    ]);
    assert.equal(termsSourceHref(pension.sources[1]), providerPage);
    assert.doesNotMatch(facts(id, productCatalog).find(fact => fact.key === key).value, offer);
  }
  assert.equal(row("gjensidige-person-barn-basis", "gjensidige-person-barn-pluss", key).different, true);
  assert.equal(row("gjensidige-person-barn-medium", "gjensidige-person-barn-pluss", key).different, true);
});

test("child care allowances document coordination, exact award rates, and the conditional deadline", () => {
  const key = "person.barn.hjelpestonad";
  for (const tier of ["basis", "medium", "pluss"]) {
    const id = "gjensidige-person-barn-" + tier;
    const clause = row(id, "storebrand-person-barn-super", key);
    assert.match(clause.first.text, /inntil 8 G.*samme forhold.*engangsutbetaling.*trekkes den erstatningen fra/u);
    assert.deepEqual(fact(id, key).sources.map(source => source.page), [9, 1]);
    assert.match(clause.second.text, /10 %, 20 %, 50 % eller 100 %.*inntil fem år.*ett år etter første NAV-vedtak.*fortsatt er gyldig/iu);
  }
  assert.deepEqual(fact("storebrand-person-barn-super", key).sources.map(source => source.page), [9, 10]);
  assert.equal(fact("storebrand-person-barn-standard", key).state, "unavailable");
});

test("child coverage distinguishes a digital psychologist, a named diagnosis, and accident-only disability", () => {
  const psychology = "person.barn.digital_psykisk_helsehjelp";
  const disease = "person.barn.sykdom";
  const diagnosis = "person.barn.diagnose.cystisk_fibrose";
  for (const level of ["standard", "super"]) {
    const id = "storebrand-person-barn-" + level;
    const comparison = row(id, "gjensidige-person-barn-basis", psychology);
    assert.match(comparison.first.text, /14 år.*fem digitale psykologkonsultasjoner.*kalenderår uten legehenvisning.*Etter fylte 18 år/u);
    assert.match(comparison.second.text, /12 til 15 år.*fra fylte 16 år/iu);
    assert.equal(fact(id, psychology).sources[0].page, 20);
    assert.doesNotMatch(fact(id, "person.barn.helserad").value, /psykolog/u);
  }
  for (const id of [
    "gjensidige-person-barn-basis", "gjensidige-person-barn-medium", "gjensidige-person-barn-pluss",
    "storebrand-person-barn-standard", "storebrand-person-barn-super",
  ]) {
    const comparison = row(id, "if-person-barn-super", diagnosis);
    assert.equal(comparison.first.state, "unavailable");
    assert.equal(comparison.second.state, "included");
    assert.match(comparison.first.text, /ikke oppført som egen diagnose/u);
    assert.equal(fact(id, diagnosis).sources[0].page, 10);
  }
  for (const [id, page] of [
    ["fremtind-person-barn-ulykke", 1], ["landkreditt-person-barn-ulykke", 3], ["klp-person-spedbarn", 1],
  ]) {
    const comparison = row(id, "if-person-barn-super", disease);
    assert.equal(comparison.first.state, "unavailable");
    assert.equal(comparison.second.state, "included");
    assert.match(comparison.first.text, /invaliditet som skyldes ulykkesskade/u);
    assert.equal(fact(id, disease).sources[0].page, page);
  }
});

test("pregnancy payments retain their own limits and trigger conditions", () => {
  const storebrand = "storebrand-person-gravid";
  const ifSuper = "if-person-gravid-super";
  const ifBasis = "if-person-gravid-basis";
  const trygGratis = "tryg-person-gravid-gratis";
  const trygPremium = "tryg-person-gravid-premium";
  const stay = row(storebrand, ifSuper, "person.gravid.sykehus");
  assert.match(stay.first.text, /600 kr per natt fra første natt.*sju sammenhengende.*Norden.*14 netter.*prematur fødsel.*én gang.*flerfødsel.*to ukene/u);
  assert.deepEqual(fact(storebrand, stay.key).sources.map(source => source.page), [5, 4]);

  const costs = row(storebrand, trygPremium, "person.gravid.ulykkesutgifter");
  assert.match(costs.first.text, /50 000 kr.*barnets.*to årene.*1 000 kr/u);
  assert.equal(fact(storebrand, costs.key).sources[0].page, 9);
  assert.match(costs.second.text, /tre år.*5 %/u);

  const disability = row(ifBasis, trygGratis, "person.gravid.ulykke");
  assert.match(disability.first.text, /500 000 kr for hver.*dobles ved minst 51 %.*akutt behov for forløsning.*tre år/u);
  assert.match(disability.second.text, /500 000 kr for hver.*fra 1 % invaliditet.*akutt behov for forløsning/u);

  const complication = "person.gravid.komplikasjoner";
  for (const tier of ["gratis", "ekstra", "premium"]) {
    const comparison = row(ifSuper, "tryg-person-gravid-" + tier, complication);
    assert.match(comparison.first.text, /5 000 kr per dekket.*maksimalt to.*akutt keisersnitt.*1,5 liter.*grad 3 eller 4/u);
    assert.equal(comparison.second.state, "unavailable");
  }
  assert.match(fact(ifSuper, "person.gravid.medfodt").value, /500 000 kr.*tretten.*14 dager.*bare én utbetaling per barn/u);
});

test("pregnancy compares the thirteen diagnoses on shared rows with physical source anchors", () => {
  const prefix = "person.gravid.medfodt.";
  const ifSuper = "if-person-gravid-super";
  const ifRows = facts(ifSuper).filter(fact => fact.key.startsWith(prefix));
  assert.equal(ifRows.length, 13);
  assert.ok(ifRows.every(fact => fact.state === "included"));
  assert.equal(fact(ifSuper, prefix + "downs_syndrom").sources[0].page, 4);
  assert.match(fact(ifSuper, prefix + "alvorlig_fodselsasfyksi").value, /Apgar 0–3.*HIE grad II eller III.*nyfødtintensiv/u);

  for (const tier of ["ekstra", "premium", "gratis"]) {
    const id = "tryg-person-gravid-" + tier;
    const diagnoses = facts(id).filter(fact => fact.key.startsWith(prefix));
    assert.equal(diagnoses.length, 13);
    assert.equal(diagnoses.filter(fact => fact.state === "included").length, tier === "gratis" ? 0 : 10);
    const spina = row(ifSuper, id, prefix + "ryggmargsbrokk");
    assert.equal(spina.label, "Ryggmargsbrokk (spina bifida)");
    assert.equal(spina.conceptTier, "detail");
    if (tier !== "gratis") assert.equal(spina.first.facts[0].value, spina.second.facts[0].value);
    const hernia = row(ifSuper, id, prefix + "medfodt_mellomgulvsbrokk");
    assert.equal(hernia.first.state, "included");
    assert.equal(hernia.second.state, "unavailable");
    assert.deepEqual(hernia.first.sources.map(source => [source.page, source.section]), [[5, "§ 4.2 bokstav m"]]);
    assert.equal(hernia.second.sources[0].page, tier === "gratis" ? 1 : 4);
    assert.match(termsSourceHref(hernia.first.sources[0]), /\/if\/gravid-super#page=5$/u);
    assert.equal(facts(id, productCatalog).filter(fact => fact.key.startsWith(prefix)).length, 0);
  }
  for (const id of ["if-person-gravid-basis", "storebrand-person-gravid"]) {
    assert.ok(facts(id).filter(fact => fact.key.startsWith(prefix)).every(fact => fact.state === "unavailable"));
    assert.equal(row(ifSuper, id, prefix + "downs_syndrom").second.state, "unavailable");
  }
});

test("NITO Uføre Ekstra keeps the monthly percentage and restart separate from capital", () => {
  const id = "tryg-nito-ufore-ekstra";
  const rate = "person.ufore.forskudd";
  const duration = "person.ufore.forskudd.varighet";
  assert.match(fact(id, rate).value, /12 måneder.*50 %.*100 % arbeidsuførhet betales 0,5 %.*alder og G.*ikke av G-endringer/u);
  assert.deepEqual(fact(id, rate).sources.map(source => [source.documentId, source.page, source.agreementScope]), [
    [id + "-terms", 1, "nito"],
    [id + "-terms", 2, "nito"],
  ]);
  const comparison = row(id, "gjensidige-person-uforekapital", duration);
  assert.match(comparison.first.text, /på tvers av forsikringstilfeller.*innen seks måneder gjenopptas.*nytt forsikringstilfelle.*fradrag for tidligere forskudd/u);
  assert.equal(fact(id, duration).sources[0].page, 2);
  assert.doesNotMatch(fact(id, "person.ufore.kapital").value, /0,5 %|seks måneder/u);
  assert.doesNotMatch(facts(id, productCatalog).find(fact => fact.key === rate).value, /0,5 %/u);
});
