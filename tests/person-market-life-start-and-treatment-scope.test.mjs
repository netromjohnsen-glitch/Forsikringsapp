import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const lifeIf = "if-person-liv";
const lifeLand = "landkreditt-person-liv";
const lifeGj = "gjensidige-person-liv";
const healthIf = "if-person-helse";
const healthGj = "gjensidige-person-behandling";
const healthLand = "landkreditt-person-behandling";
const healthStorebrand = "storebrand-person-helse";

function product(id, catalog = market) {
  const result = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(result, id);
  return result;
}

function fact(id, key, catalog = market) {
  const facts = materializeCatalogProduct(product(id, catalog), catalog).facts.filter(term => term.key === key);
  assert.equal(facts.length, 1, id + " / " + key);
  return facts[0];
}

function row(a, b, key) {
  const lookup = (left, right) => {
    const result = compareCatalogProducts(product(left), product(right), market);
    const matches = result.sections.flatMap(section => section.rows).filter(term => term.key === key);
    assert.equal(matches.length, 1, left + " / " + right + " / " + key);
    return matches[0];
  };
  const direct = lookup(a, b);
  const reverse = lookup(b, a);
  assert.equal(direct.label, reverse.label);
  assert.deepEqual(direct.first, reverse.second);
  assert.deepEqual(direct.second, reverse.first);
  return direct;
}

function sourcesAs(cell, expected) {
  assert.deepEqual(cell.sources.map(source => [source.documentId, source.page]), expected);
  assert.ok(cell.sources.every(source => source.sourceType === "full_terms"));
  for (const source of cell.sources) assert.ok(termsSourceHref(source).endsWith("#page=" + source.page));
}

test("Liv skiller ordinær oppstart fra kjernen i If og Landkreditts midlertidige dekning", () => {
  const eligibility = row(lifeIf, lifeLand, "person.liv.hvem");
  assert.match(eligibility.first.text, /folkeregistrert bosted i Norge.*norsk folketrygd når forsikringstilfellet inntreffer/u);
  assert.match(eligibility.second.text, /forsikringstakeren.*Norden de siste fem årene.*norsk folketrygd/u);
  assert.match(fact("klp-person-liv", "person.liv.hvem").value, /folkeregistrert adresse i Norge.*folketrygd de siste fem årene/u);

  const start = row(lifeIf, lifeLand, "person.liv.ikrafttredelse");
  assert.match(start.first.text, /godkjenne skriftlig helseerklæring/u);
  assert.match(start.second.text, /godkjent helseerklæring.*også ved økning/u);
  sourcesAs(start.second, [["person:landkreditt-person-liv", 3], ["person:landkreditt-person-liv", 5]]);

  const pending = row(lifeIf, lifeLand, "person.liv.midlertidig");
  assert.match(pending.first.text, /bare ved forsikringstilfeller som skyldes ulykkeshendelser/u);
  assert.match(pending.second.text, /aksept av tilbudet.*de første tre månedene.*helsetilstanden da den midlertidige dekningen startet/u);
  sourcesAs(pending.first, [["person:if-person-liv", 3]]);
  sourcesAs(pending.second, [["person:landkreditt-person-liv", 5]]);
  assert.ok(!materializeCatalogProduct(product(lifeIf, raw), raw).facts.some(term => term.key === pending.key));

  const sum = row(lifeLand, "fremtind-person-liv", "person.liv.sum");
  assert.match(sum.first.text, /forsikringsbeviset.*grunnbeløp på dødsfallstidspunktet/u);
  assert.match(sum.second.text, /avtalte forsikringssummen som et engangsbeløp/u);
});

test("Liv viser geografisk dekning med egne norske unntak og eksakt medlemsavtale", () => {
  const geo = row(lifeIf, lifeGj, "person.liv.geografi");
  assert.match(geo.first.text, /utenfor Norden.*tolv måneder.*norsk utenrikstjeneste.*au pair/u);
  assert.match(geo.second.text, /hele verden.*krig og alvorlig uro/u);
  sourcesAs(geo.first, [["person:if-person-liv", 2], ["person:if-person-liv", 3]]);
  sourcesAs(geo.second, [["person:gjensidige-person-liv", 2], ["person:gjensidige-person-liv", 3]]);

  for (const [id, document, page, scope] of [
    ["tryg-nito-liv", "tryg-nito-liv-product-terms", 2, "nito"],
    ["tryg-utdanningsforbundet-liv-medlem", "tryg-utdanningsforbundet-liv-medlem-terms", 4, "utdanningsforbundet"],
    ["tryg-utdanningsforbundet-liv-ektefelle", "tryg-utdanningsforbundet-liv-ektefelle-terms", 4, "utdanningsforbundet"],
  ]) {
    const geography = row(id, lifeIf, geo.key).first;
    assert.match(geography.text, /hele verden/u);
    const memberStart = row(id, lifeIf, "person.liv.ikrafttredelse").first;
    assert.match(memberStart.text, /fra Tryg mottok søknad med fullstendige helseopplysninger.*økning.*ny helseerklæring/iu);
    for (const cell of [geography, memberStart]) {
      sourcesAs(cell, [[document, page]]);
      assert.equal(cell.sources[0].agreementScope, scope);
    }
  }

  const expiry = fact("storebrand-person-liv", "person.liv.opphor");
  assert.equal(expiry.value, "Forsikringen opphører senest 31. desember i året forsikrede fyller 89 år.");
  assert.equal(expiry.sources[0].termsNumber, "Liv01");
  assert.match(expiry.sources[0].section, /A.1.3/u);
  sourcesAs(expiry, [["person:storebrand-person-liv", 2]]);
});

test("Behandling sammenligner opphør og vilkår for ventetid som egne rader", () => {
  const after = row(healthIf, healthGj, "person.behandling.etter_opphor");
  assert.equal(after.first.state, "unavailable");
  assert.equal(after.second.state, "included");
  assert.match(after.first.text, /datoen forsikringen avsluttes/u);
  assert.match(after.second.text, /startet mens forsikringen gjaldt.*ikke dekkes av det offentlige.*inntil seks måneder/u);
  sourcesAs(after.first, [["person:if-person-helse", 2]]);
  sourcesAs(after.second, [["person:gjensidige-person-behandling", 8]]);
  assert.ok(!materializeCatalogProduct(product(healthIf, raw), raw).facts.some(term => term.key === after.key));

  const waiting = row(healthIf, healthLand, "person.behandling.offentlig_ventetid");
  assert.match(waiting.first.text, /ventetiden i det offentlige overstiger behandlingsgarantien i forsikringsbeviset/u);
  assert.match(waiting.second.text, /ventetiden i det offentlige overstiger garantitiden på ti virkedager/u);
  const referral = fact(healthIf, "person.behandling.henvisning");
  assert.match(referral.value, /norsk autorisasjon.*norskautorisert legespesialist.*etter karenstiden.*tolv måneder/u);
  sourcesAs(referral, [["person:if-person-helse", 3]]);
});

test("Behandling viser hva som betales for operasjon og legemidler hos de konkrete produktene", () => {
  const surgery = row(healthStorebrand, "tryg-person-behandling", "person.behandling.operasjon");
  assert.match(surgery.first.text, /Ved avtalt dekning.*overnatting på privat sykehus.*legehenvisning og forhåndsgodkjenning/u);
  assert.match(surgery.second.text, /ti virkedager.*dagen etter Tryg har mottatt.*tidligst dagen etter mottatt henvisning/u);
  sourcesAs(surgery.first, [["person:storebrand-person-helse", 10]]);
  sourcesAs(surgery.second, [["person:tryg-person-behandling", 3], ["person:tryg-person-behandling", 6]]);

  const medicines = row(healthLand, "tryg-person-behandling-55", "person.behandling.medisin");
  assert.match(medicines.first.text, /brukes under spesialistbehandlingen.*skriver ut på resept, dekkes ikke/u);
  assert.match(medicines.second.text, /brukt på behandlingsstedet.*innleggelse eller operasjon/u);
  sourcesAs(medicines.first, [["person:landkreditt-person-behandling", 5]]);
  sourcesAs(medicines.second, [["person:tryg-person-behandling-55", 2]]);
  assert.match(fact(healthLand, "person.behandling.etterkontroll").value, /tolv måneder fra innmeldingsdatoen/u);
});
