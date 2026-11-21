import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const uf = "person.ufore.";
const gj = "gjensidige-person-uforekapital";
const gjPension = "gjensidige-person-uforepensjon";
const fremtind = "fremtind-person-uforekapital-forskudd";
const fremtindBasic = "fremtind-person-uforekapital";
const udfs = ["medlem", "ektefelle"].map(variant => "tryg-utdanningsforbundet-ufore-" + variant);

function product(id, catalog = market) {
  const result = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(result, id);
  return result;
}

function row(a, b, key) {
  const select = (firstId, secondId) => compareCatalogProducts(product(firstId), product(secondId), market)
    .sections.flatMap(section => section.rows).filter(term => term.key === uf + key);
  const forward = select(a, b);
  const reverse = select(b, a);
  assert.equal(forward.length, 1, a + " and " + b + " / " + key);
  assert.equal(reverse.length, 1);
  assert.equal(forward[0].label, reverse[0].label);
  assert.deepEqual(forward[0].first, reverse[0].second);
  assert.deepEqual(forward[0].second, reverse[0].first);
  return forward[0];
}

function source(cell, productId, page, section) {
  const id = product(productId).sourceId;
  const found = cell.sources.find(ref => ref.documentId === id && ref.page === page);
  assert.ok(found, id + " / " + page);
  assert.equal(found.sourceType, "full_terms");
  assert.match(found.section, section);
  assert.ok(termsSourceHref(found).endsWith("#page=" + page));
}

test("Utdanningsforbundet separates lump-sum eligibility from advance timing and cites both editions", () => {
  for (const id of udfs) {
    const capitalWait = row(id, gj, "kapital.ventetid");
    assert.match(capitalWait.first.text, /datoen NAV fatter vedtak.*første dag.*forsikringstiden hos Tryg/iu);
    assert.match(capitalWait.second.text, /minst to år/iu);
    source(capitalWait.first, id, 7, /§ 8.2 c/u);
    source(capitalWait.first, id, 6, /§ 8.1 a/u);
    const advanceWait = row(id, gj, "forskudd.karenstid");
    assert.match(advanceWait.first.text, /15 måneder/u);
    assert.match(advanceWait.second.text, /tidligst ved fylte 18 år.*får innvilget arbeidsavklaringspenger eller uføretrygd/u);
    source(advanceWait.second, gj, 7, /§ 1.1/u);

    const benefit = row(id, gj, "kapital");
    assert.match(benefit.first.text, /100 % arbeidsuførhet.*graderes utbetalingen.*Tidligere forskudd trekkes fra.*høyere uføregrad gir en tilleggsutbetaling/u);
    assert.match(benefit.second.text, /Hele forsikringssummen.*med fradrag for tidligere månedsbeløp/u);
    source(benefit.first, id, 6, /§§ 8.1 a og 8.2 a/u);
    source(benefit.second, gj, 7, /§§ 2.1–2.3/u);
  }
});

test("monthly advances retain each product's rate, NAV requirement, and end conditions", () => {
  const advance = row(fremtind, gj, "forskudd");
  assert.match(advance.first.text, /1 % av forsikringssummen/u);
  assert.match(advance.second.text, /Ved 100 % arbeidsuførhet.*1 %.*forholdsmessig ved delvis/u);
  source(advance.first, fremtind, 2, /§ 3.2.2/u);
  source(advance.second, gj, 7, /§§ 1.1 og 1.3/u);

  const publicBenefits = row(fremtind, gj, "forskudd.nav");
  assert.match(publicBenefits.first.text, /folkeregistrert bosted i Norge.*norsk folketrygd.*ikke et eget vilkår for forskudd/u);
  assert.match(publicBenefits.second.text, /må være innvilget arbeidsavklaringspenger eller uføretrygd/u);
  source(publicBenefits.first, fremtind, 1, /§§ 3 og 3.2.1/u);
  assert.equal(row(fremtindBasic, fremtind, "forskudd.nav").first.state, "unknown");

  const duration = row(fremtind, gj, "forskudd.varighet").first;
  assert.match(duration.text, /60 måneders forskudd.*fradrag.*samme årsak innen seks måneder.*Fremtind betaler premien/u);
  source(duration, fremtind, 2, /§§ 3.2.3–3.2.6/u);
});

test("pension claims differentiate NAV decisions, social insurance, and pension in payment abroad", () => {
  const ifPension = "if-person-uforepensjon";
  const fremtindPension = "fremtind-person-uforepensjon";
  const ifResult = row(ifPension, gjPension, "pensjon.nav");
  assert.match(ifResult.first.text, /ikke et eget vilkår.*Norge eller Norden.*norsk folketrygd/u);
  assert.match(ifResult.second.text, /må være innvilget arbeidsavklaringspenger eller uføretrygd/u);
  source(ifResult.first, ifPension, 3, /§ 4.1/u);
  source(ifResult.first, ifPension, 2, /§ 2/u);

  const fremtindResult = row(fremtindPension, gjPension, "pensjon.nav");
  assert.match(fremtindResult.first.text, /ikke et eget vilkår.*folkeregistrert bosted i Norge.*utlandet under utbetaling i inntil tre år.*NAV-ytelsene opprettholdes/u);
  source(fremtindResult.first, fremtindPension, 2, /§§ 2–2.2/u);
  source(fremtindResult.first, fremtindPension, 3, /§ 5 /u);
});

test("Landkreditt and KLP separate qualifying time from the insurance sum and keep the raw catalog compatible", () => {
  const land = "landkreditt-person-ufore";
  const klp = "klp-person-ufore";
  const wait = row(land, klp, "kapital.ventetid");
  assert.match(wait.first.text, /Minst to år.*Etter fem år.*yrkesmessig attføring eller medisinsk rehabilitering eller utredning/u);
  assert.match(wait.second.text, /Mer enn to års.*startet før fylte 55 år/u);
  source(wait.first, land, 5, /§ 7.2/u);

  const amount = row(klp, land, "kapital.sum");
  assert.match(amount.first.text, /G-reguleres årlig frem til fylte 45 år.*10 % per år.*50/u);
  source(amount.first, klp, 4, /Indeksregulering/u);
  source(amount.first, klp, 8, /Aldersreduksjon/u);
  assert.equal(amount.second.state, "unknown");
  assert.match(row(klp, land, "kapital.opphor").first.text, /på avtalt opphørsdato.*samme årsak.*innen to år/u);

  const rawKlp = materializeCatalogProduct(product(klp, productCatalog), productCatalog).facts;
  assert.equal(rawKlp.some(term => term.key.startsWith(uf + "kapital")), false);
  const rawGjensidige = materializeCatalogProduct(product(gj, productCatalog), productCatalog).facts;
  assert.equal(rawGjensidige.some(term => term.key === uf + "forskudd.karenstid"), false);
  assert.equal(rawGjensidige.find(term => term.key === uf + "kapital").value,
    "Engangsutbetaling ved minst 50 % sammenhengende arbeidsuførhet i to år, vurdert som varig i alle yrker.");
});
