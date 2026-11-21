import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const nitoBasic = "tryg-nito-ulykke-grunn";
const nitoExtended = "tryg-nito-ulykke-utvidet";
const frendeAccident = "frende-person-ulykke";
const gjAccident = "gjensidige-person-ulykke";
const gjBarn = ["basis", "medium", "pluss"].map(level => "gjensidige-person-barn-" + level);
const klpAccident = ["klp-person-ulykke", "klp-person-ulykke-maks"];

function product(id, catalogue) {
  const record = catalogue.products.find(product => product.productId === id);
  assert.ok(record, id);
  return record;
}

function facts(id, catalogue = marketProductCatalog) {
  return materializeCatalogProduct(product(id, catalogue), catalogue).facts;
}

function marketFact(id, key) {
  const matches = facts(id).filter(fact => fact.key === key);
  assert.equal(matches.length, 1, id + " / " + key);
  assert.ok(!facts(id, productCatalog).some(fact => fact.key === key), id + " / " + key);
  return matches[0];
}

function sharedRow(first, second, key) {
  function comparison(left, right) {
    const records = [left, right].map(id => product(id, marketProductCatalog));
    const result = compareCatalogProducts(...records, marketProductCatalog);
    const rows = result.sections.flatMap(section => section.rows).filter(row => row.key === key);
    assert.equal(rows.length, 1, left + " / " + right + " / " + key);
    return rows[0];
  }
  const direct = comparison(first, second);
  const reverse = comparison(second, first);
  assert.deepEqual(direct.first, reverse.second);
  assert.deepEqual(direct.second, reverse.first);
  assert.equal(direct.label, reverse.label);
  return direct;
}

function assertArchived(source, id, page) {
  const registered = marketProductCatalog.sources[source.documentId];
  assert.ok(registered.productIds.includes(id), id);
  assert.equal(source.agreementScope, registered.agreementScope, id);
  assert.equal(source.page, page, id);
  const path = termsSourceHref(source);
  assert.match(path, /^\/api\/vilkar\/[a-z-]+\/[a-z0-9-]+#page=\d+$/u, id);
  const [, , , provider, slug] = path.split("#")[0].split("/");
  const doc = termsArchiveDocuments.find(doc => doc.provider === provider && doc.slug === slug);
  assert.ok(doc, id);
  const bytes = readFileSync(new URL("../" + doc.archivePath, import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), registered.sha256, id);
}

test("NITO accident benefits retain variant scope, amounts, and coverage states", () => {
  const hospital = "person.ulykke.sykehus";
  const fracture = "person.ulykke.brudd";
  const hospitalComparison = sharedRow(nitoBasic, nitoExtended, hospital);
  const fractureComparison = sharedRow(nitoExtended, nitoBasic, fracture);
  assert.equal(hospitalComparison.label, "Dagpenger ved sykehusopphold");
  assert.equal(fractureComparison.label, "Engangsutbetaling ved benbrudd");
  for (const comparison of [hospitalComparison, fractureComparison]) {
    assert.equal(comparison.first.state, "included");
    assert.equal(comparison.second.state, "unavailable");
  }

  const cash = marketFact(nitoBasic, hospital);
  assert.match(cash.value, /Norden.*mer enn fem sammenhengende dager.*400 kr per dag.*dag seks.*kontinuerlig koma.*800 kr per dag.*første innleggelsesdag.*365 dager.*Ny innleggelse.*innen tre år/u);
  assertArchived(cash.sources[0], nitoBasic, 6);
  assertArchived(cash.sources[1], nitoBasic, 2);

  const brokenBone = marketFact(nitoExtended, fracture);
  assert.match(brokenBone.value, /Hofte og bekken gir 10 000 kr.*7 500 kr eller 5 000 kr.*flere brudd i samme ben eller brusk gir én utbetaling/u);
  assertArchived(brokenBone.sources[0], nitoExtended, 7);
  assertArchived(brokenBone.sources[1], nitoExtended, 2);

  assertArchived(marketFact(nitoBasic, fracture).sources[0], nitoBasic, 2);
  assertArchived(marketFact(nitoExtended, hospital).sources[0], nitoExtended, 2);
  assert.equal(sharedRow(nitoBasic, "tryg-person-ulykke", hospital).second.state, "unknown");
});

test("accident notice deadlines share one row and retain each document's reporting rule", () => {
  const key = "person.ulykke.meldefrist";
  for (const [id, page, value] of [
    [gjAccident, 1, /ett år etter.*fikk vite om skaden.*falle bort/u],
    [nitoBasic, 3, /så snart som mulig.*ett år etter.*kjennskap/u],
    [nitoExtended, 3, /så snart som mulig.*ett år etter.*kjennskap/u],
    ["landkreditt-person-ulykke", 6, /uten ugrunnet opphold.*ett år etter.*kunnskap/u],
    ["if-person-ulykke", 7, /omgående/u],
    ["storebrand-person-ulykke", 5, /omgående/u],
    ["watercircles-person-ulykke", 6, /omgående/u],
  ]) {
    const comparison = sharedRow(id, frendeAccident, key);
    assert.equal(comparison.label, "Frist for å melde krav");
    assert.match(comparison.first.text, value, id);
    assertArchived(marketFact(id, key).sources[0], id, page);
    assert.equal(comparison.first.state, "included", id);
  }
});

test("the accident exclusions preserve the named sports, age limit, and code scope", () => {
  const key = "person.ulykke.unntak.kampsport";
  for (const [id, page, expected] of [
    [gjAccident, 2, /^Skader ved boksing er uttrykkelig unntatt\.$/u],
    ["fremtind-person-ulykke", 1, /boksing, bryting, judo, karate og annen kamp- eller selvforsvarssport/u],
    ["storebrand-person-ulykke", 4, /over 16 år.*boksing, bryting, judo, karate/u],
    ["watercircles-person-ulykke", 6, /boksing, bryting, judo, karate og annen kamp- eller selvforsvarssport/u],
    ...klpAccident.map(id => [id, 1, /boksing og annen kamp- eller selvforsvarssport/u]),
  ]) {
    const comparison = sharedRow(id, frendeAccident, key);
    assert.equal(comparison.label, "Kampsport – unntak");
    assert.match(comparison.first.text, expected, id);
    assertArchived(marketFact(id, key).sources[0], id, page);
  }
  for (const id of klpAccident) {
    const psych = "person.ulykke.psykisk_invaliditet";
    const comparison = sharedRow(id, gjAccident, psych);
    assert.equal(comparison.first.state, "unavailable");
    assert.match(comparison.first.text, /ICD-10 F00–F99/u);
    assert.equal(comparison.second.state, "included");
    assertArchived(marketFact(id, psych).sources[0], id, 1);
  }
});

test("Gjensidige has matching notice terms in the relevant product categories only", () => {
  for (const id of gjBarn) {
    const key = "person.barn.meldefrist";
    const comparison = sharedRow(id, "if-person-barn-super", key);
    assert.match(comparison.first.text, /ett år etter.*gjelder ikke ved uførhet eller dødsfall/u);
    assertArchived(marketFact(id, key).sources[0], id, 1);
  }
  for (const [id, key, counterpart] of [
    ["gjensidige-person-behandling", "person.behandling.meldefrist", "gjensidige-person-helse-55"],
    ["gjensidige-person-helse-55", "person.behandling.meldefrist", "gjensidige-person-behandling"],
    ["gjensidige-person-alvorlig-sykdom", "person.sykdom.meldefrist", "if-person-kritisk"],
  ]) {
    const comparison = sharedRow(id, counterpart, key);
    assert.match(comparison.first.text, /ett år etter.*fikk vite om skaden.*falle bort/u);
    assert.doesNotMatch(comparison.first.text, /uførhet eller dødsfall/u);
    assertArchived(marketFact(id, key).sources[0], id, 1);
  }
  assert.ok(!facts("gjensidige-person-uforepensjon").some(fact => fact.key.endsWith(".meldefrist")));
});

test("Storebrand Gravid compares its acceptance date and the benefits subject to two weeks", () => {
  const id = "storebrand-person-gravid";
  const key = "person.gravid.oppstart";
  const comparison = sharedRow(id, "if-person-gravid-super", key);
  assert.equal(comparison.label, "Når forsikringen begynner å gjelde");
  assert.equal(comparison.first.state, "included");
  assert.match(comparison.first.text, /ansvar begynner når.*godtatt.*For ytelsen ved dødfødsel eller dødsfall.*psykologisk førstehjelp.*to uker/u);
  const term = marketFact(id, key);
  assertArchived(term.sources[0], id, 12);
  assertArchived(term.sources[1], id, 3);
  assert.match(term.sources[1].section, /s\. 3–4/u);
});

test("Uførepensjon records the Gjensidige payment trigger and Fremtind's psychological treatment", () => {
  const gj = "gjensidige-person-uforepensjon";
  const wait = "person.ufore.pensjon.karenstid";
  const comparison = sharedRow(gj, "if-person-uforepensjon", wait);
  assert.match(comparison.first.text, /18 år.*40 %.*arbeidsavklaringspenger eller uføretrygd.*i kraft.*folketrygd.*innen seks måneder etter at utbetalingen opphørte.*40 %/u);
  assertArchived(marketFact(gj, wait).sources[0], gj, 7);

  const fremtind = "fremtind-person-uforepensjon";
  const counseling = "person.ufore.pensjon.psykolog";
  const therapy = sharedRow(fremtind, gj, counseling);
  assert.match(therapy.first.text, /fem videokonsultasjoner.*seks sammenhengende måneder.*50 %.*innen utløpet av karenstiden.*forhåndsgodkjennes.*Henvisning kreves ikke/u);
  assert.equal(therapy.second.state, "unknown");
  assertArchived(marketFact(fremtind, counseling).sources[0], fremtind, 3);
});

test("treatment symptom clauses share a row and differ from guarantees and expiry", () => {
  const key = "person.behandling.symptom";
  const ifHealth = "if-person-helse";
  const storebrand = "storebrand-person-helse";
  const fremtind = "fremtind-person-behandling";
  for (const [id, page, clause] of [
    [ifHealth, 8, /90 dagene etter at If mottok fullstendig helseerklæring.*godkjent flytting.*minst tolv måneder/u],
    ["gjensidige-person-behandling", 3, /tre måneder etter at Gjensidige mottok.*signerte helseerklæringen.*minst tolv måneder.*økt dekning eller forsikringssum/u],
    ["gjensidige-person-helse-55", 3, /tre måneder etter at Gjensidige mottok.*signerte helseerklæringen.*minst tolv måneder.*økt dekning eller forsikringssum/u],
    [fremtind, 3, /tre måneder etter at forsikrede godtok avtalen.*minst tolv måneder.*økt dekning eller forsikringssum/u],
    ["landkreditt-person-behandling", 4, /første 90 dagene etter at forsikringen begynte å gjelde/u],
    [storebrand, 5, /individuell forsikring er kjøpt med karens.*90 dager.*mellom signert søknad og ikrafttredelse/u],
  ]) {
    const comparison = sharedRow(id, id === ifHealth ? storebrand : ifHealth, key);
    assert.equal(comparison.label, "Symptomklausul ved oppstart");
    assert.match(comparison.first.text, clause, id);
    assertArchived(marketFact(id, key).sources[0], id, page);
  }
  const expiry = "person.behandling.opphor";
  const postExpiry = "person.behandling.etter_opphor";
  const lifetime = sharedRow(storebrand, ifHealth, expiry);
  assert.match(lifetime.first.text, /individuelle forsikringen kan gjelde livet ut/u);
  assertArchived(marketFact(storebrand, expiry).sources[0], storebrand, 3);

  const ongoing = sharedRow(fremtind, storebrand, postExpiry);
  assert.match(ongoing.first.text, /godkjente og bestilte mens forsikringen var i kraft.*tre måneder etter/u);
  assertArchived(marketFact(fremtind, postExpiry).sources[0], fremtind, 4);
  assert.equal(sharedRow(fremtind, storebrand, expiry).first.state, "unknown");
});
