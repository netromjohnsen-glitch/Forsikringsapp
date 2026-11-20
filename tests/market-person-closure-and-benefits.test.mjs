import assert from "node:assert/strict";
import test from "node:test";
import {
  compareCatalogProducts,
  materializeCatalogProduct,
} from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const lookup = (id) => marketProductCatalog.products.find((product) => product.productId === id);
const compare = (firstId, secondId) => new Map(
  compareCatalogProducts(lookup(firstId), lookup(secondId), marketProductCatalog)
    .sections.flatMap((section) => section.rows.map((row) => [row.key, row])),
);
const sourceLinks = (side) => side.sources.map(termsSourceHref);

test("If Helse compares medicine copay and technical aids as separate source-backed rows", () => {
  const rows = compare("if-person-helse", "gjensidige-person-behandling");
  const medicine = rows.get("person.behandling.medisin");
  const aids = rows.get("person.behandling.hjelpemidler");
  assert.equal(medicine.first.state, "included");
  assert.equal(aids.first.state, "included");
  assert.match(medicine.first.text, /egenandelen for reseptbelagte medisiner.*tre måneders forbruk fra første uttak/u);
  assert.match(aids.first.text, /10 000 kr totalt.*rett til tilsvarende hjelpemidler fra det offentlige/u);
  assert.deepEqual(sourceLinks(medicine.first), ["/api/vilkar/if/helseforsikring#page=4"]);
  assert.deepEqual(sourceLinks(aids.first), ["/api/vilkar/if/helseforsikring#page=5"]);
});

test("KLP income coordination belongs to monthly disability pension and preserves the floor exception", () => {
  const comparison = compare("klp-person-ufore", "tryg-nito-ufore-etter-studiet");
  const rule = comparison.get("person.ufore.pensjon.inntektsreduksjon");
  assert.equal(rule.first.state, "included");
  assert.equal(rule.first.facts[0].role, "term");
  assert.match(rule.first.text, /uførepensjon fra private forsikringer, trygd og lønn under sykdom overstiger 90 %/u);
  assert.match(rule.first.text, /de siste tre årene.*under 10 000 kr i måneden/u);
  assert.deepEqual(sourceLinks(rule.first), ["/api/vilkar/klp/personforsikring#page=7"]);
  assert.equal(comparison.get("person.ufore.kapital").first.state, "optional");
});

test("Utdanningsforbundet Kritisk sykdom separates membership and household end events", () => {
  const ids = [
    "tryg-utdanningsforbundet-kritisk-sykdom-medlem",
    "tryg-utdanningsforbundet-kritisk-sykdom-ektefelle",
  ];
  const rows = compare(...ids);
  const death = rows.get("person.sykdom.opphor.dod");
  const withdrawal = rows.get("person.sykdom.opphor.utmelding");
  const payout = rows.get("person.sykdom.opphor.utbetaling");
  const breakup = rows.get("person.sykdom.opphor.samlivsbrudd");
  assert.match(death.first.text, /opphører når dødsfallet er registrert hos Utdanningsforbundet/u);
  assert.match(death.second.text, /to måneder etter at meldingen om medlemmets dødsfall er registrert/u);
  assert.match(withdrawal.first.text, /to måneder etter utmeldingsdatoen/u);
  assert.match(withdrawal.second.text, /to måneder etter medlemmets utmeldingsdato/u);
  assert.match(payout.first.text, /opphører ved utbetaling av forsikringssummen/u);
  assert.equal(payout.second.text, payout.first.text);
  assert.equal(breakup.first.state, "unknown");
  assert.match(breakup.second.text, /utløpet av perioden det er betalt premie for.*avsagt dom eller gitt bevilling.*Folkeregisteret/u);
  assert.match(rows.get("person.sykdom.opphor").first.text, /utgangen av kalenderåret.*70 år/u);
  assert.match(rows.get("person.sykdom.opphor").second.text, /utgangen av kalenderåret.*70 år/u);
  assert.deepEqual(sourceLinks(death.first), ["/api/vilkar/tryg/utdanningsforbundet-kritisk-sykdom-medlem#page=5"]);
  assert.deepEqual(sourceLinks(death.second), ["/api/vilkar/tryg/utdanningsforbundet-kritisk-sykdom-ektefelle#page=5"]);
  assert.equal(death.first.sources[0].agreementScope, "utdanningsforbundet");
  assert.equal(death.second.sources[0].agreementScope, "utdanningsforbundet");
  assert.equal(compare("tryg-person-kritisk", ids[1]).get(breakup.key).first.state, "unknown");
});

test("If Kritisk sykdom keeps rider thresholds and benefit calculations optional and distinct", () => {
  const found = compare("if-person-kritisk", "tryg-person-kritisk");
  const rule = found.get("person.sykdom.ufore");
  const cutoff = found.get("person.sykdom.ufore.ventetid_ved_opphor");
  const payment = found.get("person.sykdom.ufore.beregning");
  const causes = found.get("person.sykdom.ufore.andre_arsaker");
  const age = found.get("person.sykdom.ufore.regulering");
  for (const row of [rule, cutoff, payment, causes, age]) assert.equal(row.first.state, "optional", row.key);
  assert.match(rule.first.text, /minst 40 % sammenhengende arbeidsufør i to år.*varig/u);
  assert.match(cutoff.first.text, /utgangen av forsikringsåret.*60 år.*toårsperioden.*har startet/u);
  assert.match(payment.first.text, /100 % uførhet står i forsikringsbeviset.*vilkårene for uføreerstatning var oppfylt.*reduksjonen i arbeidsevnen/u);
  assert.match(causes.first.text, /alene medføre mer enn 40 % arbeidsuførhet/u);
  assert.match(age.first.text, /fyller 50 år.*folketrygdens grunnbeløp.*10 % av forrige forsikringsårs sum/u);
  assert.deepEqual(sourceLinks(cutoff.first), ["/api/vilkar/if/kritisk-sykdom#page=4", "/api/vilkar/if/kritisk-sykdom#page=3"]);
  assert.deepEqual(sourceLinks(payment.first), ["/api/vilkar/if/kritisk-sykdom#page=9", "/api/vilkar/if/kritisk-sykdom#page=4"]);
  assert.deepEqual(sourceLinks(causes.first), ["/api/vilkar/if/kritisk-sykdom#page=10"]);
});

test("these market corrections do not alter how uploaded agreements resolve terms", () => {
  for (const [id, key] of [
    ["if-person-helse", "person.behandling.medisin"],
    ["klp-person-ufore", "person.ufore.pensjon.inntektsreduksjon"],
    ["tryg-utdanningsforbundet-kritisk-sykdom-ektefelle", "person.sykdom.opphor.samlivsbrudd"],
    ["if-person-kritisk", "person.sykdom.ufore.andre_arsaker"],
  ]) {
    const product = productCatalog.products.find((candidate) => candidate.productId === id);
    assert.ok(product, id);
    assert.equal(materializeCatalogProduct(product, productCatalog).facts.some((fact) => fact.key === key), false, id);
  }
});
