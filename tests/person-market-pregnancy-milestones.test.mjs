import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const tryg = "tryg-person-gravid-";
const ifBasis = "if-person-gravid-basis";
const ifSuper = "if-person-gravid-super";
const storebrand = "storebrand-person-gravid";
const geography = "person.gravid.geografi";
const stay = "person.gravid.sykehus";
const expense = "person.gravid.ulykkesutgifter";
const invalidity = "person.gravid.ulykke";
const crisis = "person.gravid.psykologisk_forstehjelp";

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

test("each Tryg pregnancy tier cites shared territory with its own product source identity", () => {
  for (const tier of ["gratis", "ekstra", "premium"]) {
    const id = tryg + tier;
    const term = row(id, ifSuper, geography);
    assert.equal(term.first.state, "included");
    assert.match(term.first.text, /Norge.*utenlandsopphold.*barnet er seks måneder.*fortsatt er i kraft/u);
    pdf(term.first, id + ":gravid-produktvilkar", 2, /§ 3/u);
    assert.equal(term.second.state, "unknown");
    assert.equal(raw(id, geography), undefined);
  }
});

test("hospital payments retain different qualifying days, prematurity and simultaneous stays", () => {
  for (const tier of ["ekstra", "premium"]) {
    const paid = row(tryg + tier, ifSuper, stay);
    assert.match(paid.first.text, /300 kr per døgn.*30 dager.*offentlig godkjent sykehus i Norden.*mer enn fem.*mer enn ti.*prematur fødsel.*samtidig innleggelse av mor og barn.*bare for én/u);
    assert.match(paid.second.text, /1 000 kr per dag.*Hvert opphold må vare minst sju.*fødselsdagen.*før fylte tre måneder.*prematur fødsel.*samtidig innleggelse av flere barn.*1 000 kr per dag og 30 dager totalt/u);
    pdf(paid.first, tryg + tier, 5, /§ 2\.7/u);
    pdf(paid.second, ifSuper, 6, /4\.3\.1–4\.3\.2/u);
  }
  assert.equal(row(ifBasis, ifSuper, stay).first.state, "unavailable");
  assert.equal(row(tryg + "gratis", ifSuper, stay).first.state, "unavailable");
  const store = row(storebrand, ifSuper, stay).first;
  assert.match(store.text, /600 kr.*14 netter.*én gang samlet.*flerfødsel/u);
});

test("expense reimbursement and maternal complication payment retain their distinct availability", () => {
  for (const [id, page] of [[ifBasis, 3], [ifSuper, 6]]) {
    const compensation = row(id, tryg + "ekstra", expense);
    assert.equal(compensation.first.state, "unavailable");
    assert.equal(compensation.second.state, "included");
    assert.match(compensation.first.text, /ingen egen refusjonsdekning.*varig medisinsk invaliditet/u);
    pdf(compensation.first, id, 2, /Dekningene i produktet/u);
    pdf(compensation.first, id, page, /Medisinsk invaliditet/u);
    assert.equal(raw(id, expense), undefined);
    assert.equal(row(id, storebrand, invalidity).first.state, "included");
  }
  const complication = row(storebrand, ifSuper, "person.gravid.komplikasjoner");
  assert.equal(complication.first.state, "unavailable");
  assert.equal(complication.second.state, "included");
  assert.match(complication.first.text, /ingen egen engangsutbetaling.*Sykehusopphold har en egen ytelse/u);
  pdf(complication.first, storebrand, 1, /Kjøp under graviditet og etter fødsel/u);
  assert.equal(raw(storebrand, "person.gravid.komplikasjoner"), undefined);
});

test("paid Tryg and If Super retain their different medical invalidity thresholds and crisis triggers", () => {
  for (const [tier, sum] of [["ekstra", "1 million kr"], ["premium", "2 millioner kr"]]) {
    const id = tryg + tier;
    const accident = row(id, ifSuper, invalidity);
    assert.ok(accident.first.text.includes(sum));
    assert.match(accident.first.text, /fra 1 %.*akutt behov for forløsning.*fødselskomplikasjoner/u);
    assert.match(accident.second.text, /dobles ved minst 51 %.*akutt behov for forløsning.*fastsettes innen tre år.*fødselskomplikasjoner/u);
    pdf(accident.first, id, 2, /medisinsk invaliditetsgrad/u);
    pdf(accident.second, ifSuper, 6, /4\.4–4\.5/u);
    const support = row(id, ifSuper, crisis);
    assert.match(support.first.text, /ti behandlinger.*barnefar eller partner.*alvorlig diagnose eller skade.*alvorlig ulykke eller dør.*tolv måneder.*Ingen egenandel/u);
    assert.doesNotMatch(support.first.text, /alvorlige fødselskomplikasjoner/u);
    assert.match(support.second.text, /ti timer for mor eller barnefar.*akutte og alvorlige fødselskomplikasjoner.*direkte tilknytning.*bare én/u);
    pdf(support.first, id, 5, /§ 2\.6/u);
    pdf(support.second, ifSuper, 7, /§ 4\.7\.2/u);
  }
});
