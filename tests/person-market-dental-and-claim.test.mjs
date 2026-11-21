import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const childDental = "person.barn.ulykkesutgifter.tannbehandling";
const accidentDental = "person.ulykke.utgifter.tannbehandling";
const childExpenses = "person.barn.ulykkesutgifter";
const childNotice = "person.barn.meldefrist";
const healthNotice = "person.behandling.meldefrist";
const ifSuper = "if-person-barn-super";
const gjChild = "gjensidige-person-barn-basis";

function product(id, catalog = market) {
  const entry = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(entry, id);
  return entry;
}

function rawFact(id, key) {
  return materializeCatalogProduct(product(id, productCatalog), productCatalog).facts.find(term => term.key === key);
}

function row(a, b, key) {
  const find = (first, second) => compareCatalogProducts(product(first), product(second), market)
    .sections.flatMap(section => section.rows).filter(item => item.key === key);
  const direct = find(a, b);
  const swapped = find(b, a);
  assert.equal(direct.length, 1, a + " / " + b + " / " + key);
  assert.equal(swapped.length, 1, b + " / " + a + " / " + key);
  assert.equal(direct[0].label, swapped[0].label);
  assert.deepEqual(direct[0].first, swapped[0].second);
  assert.deepEqual(direct[0].second, swapped[0].first);
  return direct[0];
}

function pdf(cell, documentId, page, section) {
  const source = cell.sources.find(candidate => candidate.documentId === documentId && candidate.page === page);
  assert.ok(source, documentId + " / " + page);
  assert.equal(source.sourceType, "full_terms");
  assert.match(source.section, section);
  assert.ok(termsSourceHref(source).endsWith("#page=" + page));
}

test("child policies share one deferred-dental row and keep each treatment or settlement limit", () => {
  const storebrand = /mer enn to år.*Oppgjøret skal skje innen to år.*kostnadsoverslag/u;
  const frende = /barnets alder.*gjennomføres innen forsikrede fyller 26 år.*vilkårene på skadetidspunktet/u;
  const klp = /under 18 år.*barnet fyller 22 år.*behandlingsbehov som forelå/u;
  const landkreditt = /barn under 18 år.*forsikrede fyller 20 år.*behandlingsbehov som forelå/iu;
  const ifDental = /forhåndsgodkjenne.*under 18 år.*senest ti år etter utgangen av skadeåret/u;
  for (const [id, documentId, page, section, pattern] of [
    ["tryg-person-barn-ekstra", "person:tryg-person-barn-ekstra", 5, /§ 7/u, /mer enn tre år.*uavklart prognose.*fyller 18 år.*rimeligste alternativet/u],
    ["tryg-person-barn-ulykke", "person:tryg-person-barn-ulykke", 3, /Permanent tannbehandling/u, /mer enn tre år.*Oppgjøret skal skje innen tre år.*overveiende sannsynlighet.*fyller 18 år/u],
    ["if-person-barn-standard", "person:if-person-barn-standard", 8, /§ 5\.3/u, ifDental],
    [ifSuper, "person:if-person-barn-super:barn", 8, /§ 5\.3/u, ifDental],
    ...["standard", "super"].map(tier => ["storebrand-person-barn-" + tier, "person:storebrand-person-barn-" + tier, 16, /H\.3\.2/u, storebrand]),
    ...["bra", "best"].map(tier => ["frende-person-barn-" + tier, "person:frende-person-barn-" + tier, 8, /§ 4\.8\.1/u, frende]),
    ["fremtind-person-barn", "person:fremtind-person-barn", 5, /§ 8\.2/u, /Tannlege eller lege.*Både behandling og oppgjør.*før forsikrede fyller 26 år/u],
    ...["", "-maks"].map(suffix => ["klp-person-barn" + suffix, "person:klp-person-barn" + suffix, 7, /Første permanente tannbehandling/u, klp]),
    ["landkreditt-person-barn", "person:landkreditt-person-barn", 6, /§ 4\.2/u, landkreditt],
    ["landkreditt-person-barn-ulykke", "person:landkreditt-person-barn-ulykke", 5, /§ 4\.2/u, landkreditt],
  ]) {
    const compared = row(id, id === ifSuper ? gjChild : ifSuper, childDental);
    assert.equal(compared.label, "Utsatt permanent tannbehandling etter ulykke", id);
    assert.equal(compared.first.state, "included", id);
    assert.match(compared.first.text, pattern, id);
    pdf(compared.first, documentId, page, section);
    assert.equal(rawFact(id, childDental), undefined);
  }
  for (const id of [gjChild, "klp-person-spedbarn", "fremtind-person-barn-ulykke"]) {
    assert.equal(row(ifSuper, id, childDental).second.state, "unknown", id);
  }
  const baseTerms = row("tryg-person-barn-ekstra", "tryg-person-barn-ulykke", childExpenses);
  assert.match(baseTerms.first.text, /100 000 kr/u);
  assert.match(baseTerms.second.text, /5 %.*1 000 kr i egenandel/u);
});

test("both KLP child variants show the stated per-accident deductible on the expense row", () => {
  for (const id of ["klp-person-barn", "klp-person-barn-maks"]) {
    const cell = row(id, ifSuper, childExpenses).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, /tre år.*NAV.*Forsikringsbeviset angir maksimal sum.*1 000 kr i egenandel per ulykkestilfelle/u);
    pdf(cell, "person:" + id, 3, /Behandlingsutgifter etter ulykke/u);
    pdf(cell, "person:" + id, 7, /Egenandel ved behandlingsutgifter/u);
    assert.doesNotMatch(rawFact(id, childExpenses).value, /1 000 kr/u);
  }
});

test("KLP accident variants cite the approved deferred dental expenses for insured children", () => {
  for (const id of ["klp-person-ulykke", "klp-person-ulykke-maks"]) {
    const cell = row(id, "tryg-person-ulykke", accidentDental).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, /under 18 år.*utover tre år.*KLP må godkjenne.*senest ti år etter utgangen av skadeåret.*tygging eller biting/u);
    pdf(cell, "person:" + id, 2, /Tannskader hos barn/u);
    assert.equal(rawFact(id, accidentDental), undefined);
  }
});

test("Frende child and Storebrand health policies show the source-specific one-year claim deadlines", () => {
  for (const tier of ["bra", "best"]) {
    const id = "frende-person-barn-" + tier;
    const { first, second } = row(id, gjChild, childNotice);
    assert.match(first.text, /ett år etter at kravstilleren fikk kunnskap.*dødsfall knyttet til sykdom.*uføreerstatning.*foreldelse/u);
    assert.match(second.text, /ikke ved uførhet eller dødsfall/u);
    pdf(first, "person:" + id, 9, /§ 5/u);
    assert.equal(rawFact(id, childNotice), undefined);
  }
  const id = "storebrand-person-helse";
  const cell = row(id, "gjensidige-person-behandling", healthNotice).first;
  assert.equal(cell.state, "included");
  assert.match(cell.text, /ett år etter at den som har rett til utbetaling fikk kunnskap.*fri for ansvar/u);
  pdf(cell, "person:" + id, 7, /§ 10\.1/u);
  assert.equal(rawFact(id, healthNotice), undefined);
});
