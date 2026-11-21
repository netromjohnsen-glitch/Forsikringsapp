import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const ifAccident = "if-person-ulykke";
const frendeAccident = "frende-person-ulykke";
const nitoHealth = "tryg-nito-behandling-enkel";
const ifHealth = "if-person-helse";
const trygHealth = "tryg-person-behandling";
const gjHealth = "gjensidige-person-behandling";

function item(id, catalog) {
  const product = catalog.products.find(product => product.productId === id);
  assert.ok(product, id);
  return product;
}

function facts(id, catalog = marketProductCatalog) {
  return materializeCatalogProduct(item(id, catalog), catalog).facts;
}

function fact(id, key) {
  const matches = facts(id).filter(fact => fact.key === key);
  assert.equal(matches.length, 1, id + " / " + key);
  return matches[0];
}

function alignedRow(first, second, key) {
  const catalog = marketProductCatalog;
  const rows = (a, b) => compareCatalogProducts(item(a, catalog), item(b, catalog), catalog)
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

test("accident policies share one psychiatric invalidity row and keep different requirements", () => {
  const key = "person.ulykke.psykisk_invaliditet";
  const ptsd = /PTSD.*samtidig med en ulykkesskade.*ICD-10 F43\.1.*psykiater eller klinisk psykolog/u;
  for (const [id, page, state, clause] of [
    ["tryg-person-familieulykke", 1, "included", ptsd],
    ["tryg-nito-ulykke-grunn", 5, "included", ptsd],
    ["tryg-nito-ulykke-utvidet", 6, "included", ptsd],
    [frendeAccident, 3, "included", /PTSD.*F43\.1.*fysisk skade som gir livsvarig medisinsk invaliditet/u],
    ["fremtind-person-ulykke", 2, "included", /samtidig.*fysisk skade.*medisinsk invaliditet eller uførhet/u],
    ["landkreditt-person-ulykke", 6, "included", /samtidig.*fysisk skade.*varig og erstatningsmessig medisinsk invaliditet/u],
    ["storebrand-person-ulykke", 4, "unavailable", /ICD-10 F00–F99.*unntatt/u],
    ["watercircles-person-ulykke", 5, "unavailable", /ICD-10 F00–F99.*unntatt/u],
  ]) {
    const comparison = alignedRow(id, ifAccident, key);
    assert.equal(comparison.label, "Medisinsk invaliditet ved psykisk skade");
    assert.equal(comparison.first.state, state, id);
    assert.match(comparison.first.text, clause, id);
    assert.equal(fact(id, key).sources[0].page, page);
    assert.ok(!facts(id, productCatalog).some(fact => fact.key === key), id);
  }
  assert.equal(termsSourceHref(fact("tryg-person-familieulykke", key).sources[0]), "/api/vilkar/tryg/familieulykke#page=1");
  assert.equal(fact(frendeAccident, key).sources[0].documentId, "person:frende-person-ulykke:2026-11-20");
  assert.equal(fact("tryg-nito-ulykke-grunn", key).sources[0].agreementScope, "nito");
});

test("invalidity payment after death is compared separately from death coverage", () => {
  const key = "person.ulykke.invaliditet.ved_dodsfall";
  for (const [id, page, clause] of [
    ["tryg-person-ulykke", 2, /innen ett år etter ulykken.*sannsynlig/u],
    ["tryg-person-familieulykke", 2, /innen ett år etter ulykken.*sannsynlig/u],
    ["tryg-nito-ulykke-grunn", 5, /innen ett år etter ulykken.*sannsynlig/u],
    ["tryg-nito-ulykke-utvidet", 7, /innen ett år etter ulykken.*sannsynlig/u],
    ["gjensidige-person-ulykke", 8, /innen ett år etter skaden.*ingen invaliditetserstatning/u],
    ["fremtind-person-ulykke", 3, /innen ett år etter ulykken.*sannsynlig.*Tidligere utbetalt/u],
    ["klp-person-ulykke", 5, /annen årsak innen ett år.*invaliditetsgraden/u],
    ["klp-person-ulykke-maks", 5, /annen årsak innen ett år.*invaliditetsgraden/u],
    ["landkreditt-person-ulykke", 5, /annen årsak innen ett år.*varig medisinsk invaliditet/u],
    ["storebrand-person-ulykke", 5, /annen årsak innen to år.*graden ulykkesskaden ville medført/u],
    ["watercircles-person-ulykke", 7, /annen årsak innen to år.*graden ulykkesskaden ville medført/u],
    [ifAccident, 8, /annen årsak innen to år.*graden ulykkesskaden ville medført/u],
    [frendeAccident, 4, /før invaliditetsgraden er fastsatt.*dødsfallsdekning.*trekkes fra/u],
  ]) {
    const comparison = alignedRow(id, id === ifAccident ? frendeAccident : ifAccident, key);
    assert.equal(comparison.first.state, "included", id);
    assert.match(comparison.first.text, clause, id);
    assert.equal(fact(id, key).sources[0].page, page, id);
  }
  assert.ok(facts(ifAccident).some(fact => fact.key === "person.ulykke.dodsfall"));
});

test("all sourced treatment networks share a geography row without expanding regions", () => {
  const key = "person.behandling.geografi";
  for (const [id, page, region] of [
    [trygHealth, 3, /Norden.*øvrige Europa/u],
    ["tryg-person-behandling-enkel", 1, /klinikker og sykehus i Norge/u],
    ["tryg-person-behandling-55", 1, /Norge.*Norden for øvrig/u],
    [ifHealth, 2, /behandling i Norge/u],
    [gjHealth, 2, /Norden.*institusjoner i Europa/u],
    ["gjensidige-person-helse-55", 2, /Norge.*institusjoner i Norden/u],
    ["storebrand-person-helse", 4, /Norden.*sykdom eller skade.*må praktisere i Norden.*øvrige Europa/u],
    ["fremtind-person-behandling", 1, /Norge, Sverige eller Danmark.*særskilte diagnoser.*Europa/u],
    ["landkreditt-person-behandling", 3, /Norge, forhåndsgodkjent av Falck.*Falcks nettverk/u],
    [nitoHealth, 2, /klinikker eller sykehus i Norge/u],
  ]) {
    const comparison = alignedRow(id, id === ifHealth ? gjHealth : ifHealth, key);
    assert.equal(comparison.first.state, "included", id);
    assert.match(comparison.first.text, region, id);
    assert.equal(fact(id, key).sources[0].page, page, id);
    assert.ok(!facts(id, productCatalog).some(fact => fact.key === key), id);
  }
  assert.equal(fact(nitoHealth, key).sources[0].sourceType, "ipid");
});

test("first-treatment guarantees and continued treatment after expiry stay distinct", () => {
  const storebrand = "storebrand-person-helse";
  const first = alignedRow(storebrand, trygHealth, "person.behandling.forste_helsehjelp");
  assert.match(first.first.text, /10 virkedager fra mottak.*godkjent, dekket behandling.*første behandling/u);
  assert.match(first.second.text, /10 virkedager.*dagen etter/u);
  assert.equal(first.first.sources[0].page, 7);
  assert.ok(!facts(storebrand).some(fact => fact.key === "person.behandling.forste_behandling"));
  assert.ok(facts(storebrand, productCatalog).some(fact => fact.key === "person.behandling.forste_behandling"));
  const continued = "person.behandling.etter_opphor";
  for (const [id, page, months] of [
    [trygHealth, 6, 12],
    ["tryg-person-behandling-enkel", 1, 3],
    ["tryg-person-behandling-55", 1, 12],
  ]) {
    const after = alignedRow(id, "fremtind-person-behandling", continued);
    assert.match(after.first.text, new RegExp("inntil " + months + " måneder.*meldt og godkjent", "u"));
    assert.match(after.second.text, /godkjente og bestilte.*tre måneder/u);
    assert.equal(after.first.sources[0].page, page);
  }
});

test("medicines and aids keep their reimbursement limits and relevant treatment site", () => {
  const medicine = "person.behandling.medisin";
  const aids = "person.behandling.hjelpemidler";
  for (const [id, key, page, expected, label] of [
    [trygHealth, medicine, 4, /på behandlingsstedet.*kreftbehandling dekkes ikke etter denne bestemmelsen/u, "Medisiner i forbindelse med behandling"],
    [gjHealth, medicine, 8, /legespesialist.*tre måneder etter første behandling/u, "Medisiner i forbindelse med behandling"],
    ["gjensidige-person-helse-55", medicine, 8, /på behandlingsstedet ved innleggelse og operasjon/u, "Medisiner i forbindelse med behandling"],
    [trygHealth, aids, 4, /5 000 kr per skadetilfelle.*nødvendig.*behandlende lege/u, "Medisinske og tekniske hjelpemidler"],
    [gjHealth, aids, 8, /nødvendige medisinske hjelpemidler.*dekningsmessig behandling/iu, "Medisinske og tekniske hjelpemidler"],
  ]) {
    const comparison = alignedRow(id, ifHealth, key);
    assert.match(comparison.first.text, expected, id);
    assert.equal(comparison.label, label);
    assert.equal(comparison.first.sources[0].page, page);
    assert.equal(comparison.first.state, "included");
    assert.equal(comparison.second.state, "included");
  }
  assert.match(fact(ifHealth, medicine).value, /refunderer egenandelen/u);
  assert.match(fact(ifHealth, aids).value, /10 000 kr/u);
});

test("NITO Enkel shows its distinct product information with the IPID and NITO scope", () => {
  const symptom = fact(nitoHealth, "person.behandling.symptom");
  assert.match(symptom.value, /første 90 dagene etter at forsikringen begynte å gjelde.*gjelder ikke for Tryg Legehjelp og mentale selvhjelpsprogrammer/u);
  assert.deepEqual(symptom.sources.map(source => [source.sourceType, source.agreementScope, source.page]), [
    ["ipid", "nito", 1], ["product_page", "nito", 0],
  ]);
  const first = alignedRow(nitoHealth, "tryg-person-behandling-enkel", "person.behandling.forste_helsehjelp");
  assert.match(first.first.text, /produktoversikt.*10 virkedager/u);
  assert.equal(first.first.sources[0].sourceType, "product_page");
  assert.match(termsSourceHref(first.first.sources[0]), /\/nito-behandling-enkel$/u);

  assert.match(fact(nitoHealth, "person.behandling.helserad").value, /Tryg Legehjelp/u);
  assert.match(fact(nitoHealth, "person.behandling.mental_selvhjelp").value, /digitale selvhjelpsprogrammer/u);
  assert.match(fact(nitoHealth, "person.behandling.garantikompensasjon").value, /500 kr per dag.*10 000 kr/u);
  assert.match(fact(nitoHealth, "person.behandling.dagkirurgi").value, /35 000 kr/u);
  assert.match(fact(nitoHealth, "person.behandling.fysikalsk").value, /tolv behandlinger.*250 kr/u);
  assert.match(fact(nitoHealth, "person.behandling.tilgang").value, /inntil tre konsultasjoner/u);
  assert.ok(!facts("tryg-person-behandling-enkel").some(fact => fact.sources.some(source => source.agreementScope === "nito")));
});

test("life sums and disability advance restart follow the exact distinct scopes", () => {
  const life = "person.liv.sum";
  const duration = "person.ufore.forskudd.varighet";
  const indexation = alignedRow("storebrand-person-liv", "if-person-liv", life);
  assert.match(indexation.first.text, /produktreglene.*avtalens årsdag.*grunnbeløp året før/u);
  assert.equal(termsSourceHref(indexation.first.sources[0]), "/api/vilkar/storebrand/livsforsikring#page=4");
  for (const level of ["medlem", "ektefelle"]) {
    const lifeId = "tryg-utdanningsforbundet-liv-" + level;
    const compare = alignedRow(lifeId, "if-person-liv", life);
    assert.match(compare.first.text, /51 til og med 60 år.*5 % av den opprinnelige.*50 %.*ikke lenger/u);
    assert.equal(termsSourceHref(compare.first.sources[0]), "/api/vilkar/tryg/udf-liv-" + level + "#page=2");
    assert.equal(compare.first.sources[0].agreementScope, "utdanningsforbundet");

    const disabilityId = "tryg-utdanningsforbundet-ufore-" + level;
    const term = fact(disabilityId, duration);
    assert.match(term.value, /maksimalt fem år.*falt under 50 %.*innen seks måneder.*samme årsak.*nytt vedtak fra NAV.*nytt forsikringstilfelle/u);
    assert.equal(termsSourceHref(term.sources[0]), "/api/vilkar/tryg/udf-ufore-" + level + "#page=6");
    assert.equal(term.sources[0].documentId, disabilityId + "-terms");
    assert.doesNotMatch(facts(disabilityId, productCatalog).find(fact => fact.key === duration).value, /nytt vedtak/u);
  }
});
