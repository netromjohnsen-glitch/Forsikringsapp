import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const who = "person.barn.hvem";
const start = "person.barn.oppstart";
const expiry = "person.barn.opphor";
const death = "person.barn.dodsfall";
const ifStandard = "if-person-barn-standard";
const ifSuper = "if-person-barn-super";
const land = "landkreditt-person-barn";
const trygExtra = "tryg-person-barn-ekstra";

function product(id, catalog = market) {
  const entry = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(entry, id);
  return entry;
}

function raw(id, key) {
  return materializeCatalogProduct(product(id, productCatalog), productCatalog).facts.find(term => term.key === key);
}

function row(a, b, key) {
  const find = (first, second) => compareCatalogProducts(product(first), product(second), market)
    .sections.flatMap(section => section.rows).filter(item => item.key === key);
  const direct = find(a, b);
  const reversed = find(b, a);
  assert.equal(direct.length, 1, a + " / " + b + " / " + key);
  assert.equal(reversed.length, 1, b + " / " + a + " / " + key);
  assert.equal(direct[0].label, reversed[0].label);
  assert.deepEqual(direct[0].first, reversed[0].second);
  assert.deepEqual(direct[0].second, reversed[0].first);
  return direct[0];
}

function pdf(cell, id, page, section) {
  const source = cell.sources.find(candidate => candidate.documentId === "person:" + id && candidate.page === page);
  assert.ok(source, id + " / " + page);
  assert.equal(source.sourceType, "full_terms");
  assert.match(source.section, section);
  assert.ok(termsSourceHref(source).endsWith("#page=" + page));
}

test("the same child eligibility row reflects each policy's age, residence, and social-insurance rules", () => {
  const tryg = /norsk folketrygd.*opphører ved utmelding.*behandlingstillegget.*Danmark.*Færøyene og Grønland.*tilsvarende ordning/u;
  const frende = /før barnets 16-årsdag.*tre måneder.*folkeregistrert adresse i Norge.*norsk folketrygd.*helsestasjon eller lege i Norge.*fylte 18 år/u;
  const storebrand = /forelder eller verge med fast bopel.*ikke er nordisk statsborger.*minst fem år.*norsk folketrygd.*første fornyelse etter fylte 18 år/u;
  const klp = /folkeregistrert bosted i Norge.*norsk folketrygd.*automatisk forsikringstaker ved fylte 18 år/u;
  for (const [id, sourceId, page, section, detail] of [
    ...["ekstra", "ulykke"].map(tier => {
      const id = "tryg-person-barn-" + tier;
      return [id, id + ":barn-produktvilkar", 1, /§ 1/u, tryg];
    }),
    [ifStandard, ifStandard, 4, /§ 2/u, /Norge eller Norden.*norsk folketrygd.*foreldre, verge eller fosterforeldre.*barnet selv.*Folkeregisteret/u],
    [ifSuper, ifSuper, 3, /§ 2/u, /Ved forsikringstilfellet.*Norge eller Norden.*norsk folketrygd.*Ved kjøp.*Folkeregisteret/u],
    ...["bra", "best"].map(tier => {
      const id = "frende-person-barn-" + tier;
      return [id, id, 2, /§ 1/u, frende];
    }),
    ...["standard", "super"].map(tier => {
      const id = "storebrand-person-barn-" + tier;
      return [id, id, 3, /A\.3–A\.4\.1/u, storebrand];
    }),
    ...["", "-maks"].map(suffix => {
      const id = "klp-person-barn" + suffix;
      return [id, id, 1, /Hvem forsikringen gjelder/u, klp];
    }),
    [land, land, 3, /§§ 1 og 3/u, /tre måneder.*norsk folketrygd.*helsestasjon eller hos lege.*nordisk statsborger.*sammenhengende de siste fem årene/u],
  ]) {
    const term = row(id, id === ifStandard ? land : ifStandard, who).first;
    assert.equal(term.state, "included", id);
    assert.match(term.text, detail, id);
    pdf(term, sourceId, page, section);
    assert.equal(raw(id, who), undefined);
  }
  assert.equal(row(land, land + "-ulykke", who).second.state, "unknown");
});

test("entry into force stays separate from age at expiry and symptom exclusions", () => {
  for (const [id, sourceId, page, section, detail] of [
    [trygExtra, trygExtra + ":barn-produktvilkar", 2, /§ 4/u, /godkjent søknad.*fullstendige helseopplysninger.*begrensninger.*Ved avslag.*ulykkesdekning.*avslaget sendes/u],
    [ifStandard, ifStandard, 4, /§ 4/u, /skriftlig helseerklæring.*godkjent og karenstiden.*bare.*ulykkeshendelser.*opphører hvis helseerklæringen ikke sendes/u],
    [ifSuper, ifSuper, 3, /§ 3\.1/u, /mottatt anmodningen.*skriftlig helseerklæring.*godkjent og karenstiden.*ulykkeshendelser/u],
    ["klp-person-barn", "klp-person-barn", 1, /Avtaleinngåelse/u, /fra avtalen inngås/u],
    ["klp-person-barn-maks", "klp-person-barn-maks", 1, /Avtaleinngåelse/u, /fra avtalen inngås/u],
    ["klp-person-spedbarn", "klp-person-spedbarn", 1, /Hvor og når/u, /fra den dagen KLP har mottatt bestillingen/u],
    [land, land, 12, /§§ 8 og 10/u, /Ulykkesforsikringen gjelder fra tegning.*fullstendig utfylt helseerklæring.*midlertidig dekning.*punkt 10.*avslått/u],
  ]) {
    const term = row(id, id === ifSuper ? land : ifSuper, start).first;
    assert.equal(term.state, "included", id);
    assert.match(term.text, detail, id);
    pdf(term, sourceId, page, section);
    assert.equal(raw(id, start), undefined);
  }
  assert.equal(row(trygExtra, "tryg-person-barn-ulykke", start).second.state, "unknown");
  assert.match(row(ifStandard, trygExtra, "person.barn.symptom").first.text, /90 dagene/u);
  assert.match(row("klp-person-spedbarn", ifStandard, expiry).first.text, /ni måneder/u);
});

test("Storebrand child benefit changes take effect at renewal after age 18", () => {
  for (const tier of ["standard", "super"]) {
    const id = "storebrand-person-barn-" + tier;
    const term = row(id, ifSuper, expiry).first;
    assert.match(term.text, /første fornyelse etter fylte 18 år.*utvidet hjelpestønad.*Utvalgte sykdommer erstattes.*Kritisk sykdom.*67 år.*60 år.*89 år.*uførepensjon til 67 år/u);
    pdf(term, id, 3, /A\.4\.3–A\.4\.4/u);
    pdf(term, id, 4, /Videreføring av avtalt uførepensjon/u);
    assert.match(raw(id, expiry).value, /opphører ved 18 år/u);
  }
});

test("Landkreditt full Barn shows disease funeral cover and the four evidenced NAV rates", () => {
  const claim = row(land, ifStandard, death).first;
  assert.equal(claim.state, "included");
  assert.match(claim.text, /begravelsesutgifter.*sykdom innen ett år etter at sykdommen ble konstatert.*ulykkesskade.*ett år fra ulykken/u);
  pdf(claim, land, 10, /§ 6\.8/u);
  pdf(claim, land, 6, /§ 5\.3/u);
  assert.equal(row(land, land + "-ulykke", death).second.state, "unknown");
  assert.match(row(land + "-ulykke", land, "person.barn.ulykkesdodsfall").first.text, /begravelsesutgifter.*ulykkesskaden/u);
  const help = row(land, ifStandard, "person.barn.hjelpestonad").first;
  assert.match(help.text, /inntil fem år.*NAV-sats 1, 2, 3 og 4.*10 %, 30 %, 60 % og 100 %.*maksimal sum per år.*sats og periode/u);
  pdf(help, land, 9, /§ 6\.6/u);
  assert.equal(raw(land, death), undefined);
});
