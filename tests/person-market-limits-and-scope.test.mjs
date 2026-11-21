import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const udf = "tryg-utdanningsforbundet-";
const expiry = "person.ufore.kapital.opphor";
const patientCapital = "person.ufore.kapital";
const capitalSum = "person.ufore.kapital.sum";
const geography = "person.sykdom.geografi";
const notice = "person.sykdom.meldefrist";
const gjCritical = "gjensidige-person-alvorlig-sykdom";
const ifCritical = "if-person-kritisk";
const fremtind = "fremtind-person-kritisk";
const frende = "frende-person-kritisk";
const landkreditt = "landkreditt-person-kritisk";

function product(id, catalog = market) {
  const entry = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(entry, id);
  return entry;
}

function facts(id, catalog = market) {
  return materializeCatalogProduct(product(id, catalog), catalog).facts;
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

function pdf(cell, documentId, page, section, sourceType = "full_terms") {
  const source = cell.sources.find(candidate => candidate.documentId === documentId && candidate.page === page);
  assert.ok(source, documentId + " / " + page);
  assert.equal(source.sourceType, sourceType);
  assert.match(source.section, section);
  assert.ok(termsSourceHref(source).endsWith("#page=" + page));
}

test("both Utdanningsforbundet life policies show the complete fallback order and cohabitant requirements", () => {
  const member = udf + "liv-medlem";
  for (const id of [member, udf + "liv-ektefelle"]) {
    const key = "person.liv.mottaker";
    const cell = row(id, "tryg-nito-liv", key).first;
    assert.match(cell.text, /livsarvinger, så testamentarvinger og til slutt arvinger etter loven/u);
    assert.match(cell.text, /dødsfallstidspunktet.*skilt, separert eller har flyttet.*samme folkeregistrerte adresse i to år.*felles bopel og barn.*Hinder for ekteskap.*oppnevnes særskilt/u);
    pdf(cell, id + "-terms", 5, /§ 10\.1/u);
    pdf(cell, id + "-terms", 6, /Arvinger etter loven og samboerkrav/u);
    assert.doesNotMatch(facts(id, productCatalog).find(term => term.key === key).value, /arvinger etter loven/u);
  }
});

test("Utdanningsforbundet disability expiry differs by insured role and NITO keeps its year-end timing", () => {
  const member = udf + "ufore-medlem";
  const spouse = udf + "ufore-ektefelle";
  const pair = row(member, spouse, expiry);
  for (const [id, cell] of [[member, pair.first], [spouse, pair.second]]) {
    assert.match(cell.text, /60 år.*første dag i den siste sammenhengende sykmeldingsperioden.*utgangen av det året/iu);
    assert.match(cell.text, /ved utbetaling av hele forsikringssummen/u);
    pdf(cell, id + "-terms", 5, /§§ 6–7/u);
    assert.doesNotMatch(facts(id, productCatalog).find(term => term.key === expiry).value, /utmeldingsdatoen/u);
  }
  assert.match(pair.first.text, /når medlemmets dødsfall registreres.*to måneder etter utmeldingsdatoen/u);
  assert.doesNotMatch(pair.first.text, /samlivsbrudd/u);
  assert.match(pair.second.text, /to måneder etter at meldingen om dødsfallet er registrert.*to måneder etter utmeldingsdatoen.*perioden det er betalt premie for.*folkeregistrert adresseendring/u);
  const nito = row("tryg-nito-ufore-ekstra", spouse, expiry).first;
  assert.match(nito.text, /31\. desember.*første hovedforfall.*utgangen av året medlemskapet i NITO tar slutt.*forsikringen sies opp/u);
  pdf(nito, "tryg-nito-ufore-ekstra-product-terms", 2, /Forsikringens opphør/u);
  pdf(nito, "tryg-nito-ufore-ekstra-product-terms", 3, /Oppsigelse/u);
  assert.match(row(spouse, member, "person.ufore.fortsettelse").first.text, /seks måneder/u);
});

test("Storebrand UF03 capital uses both 40 percent thresholds and keeps sum rules on the optional component", () => {
  const id = "storebrand-person-ufore";
  const other = udf + "ufore-medlem";
  const addOn = "person:" + id + ":tillegg:engangsutbetaling";
  const expected = [
    [patientCapital, 6, /§ B\.2\.2/u, /minst 40 % uføretrygd fra NAV.*minst 40 % sammenhengende arbeidsuførhet i fire år.*hele forsikringssummen/u],
    ["person.ufore.kapital.minstegrad", 6, /§ B\.2\.2/u, /40 % sammenhengende.*vedtak om minst 40 % uføretrygd/u],
    [expiry, 6, /§ B\.1\.3/u, /første sykedag.*innen forsikrede fyller 62 år/iu],
    [capitalSum, 7, /§§ B\.2\.3 og B\.2\.5/u, /G-reguleres årlig frem til 52 år.*stanser under utbetaling av uførepensjon.*under 40 %.*neste fornyelse uten etterregulering.*etter fylte 52 år.*prosentsatsen som står i forsikringsbeviset/u],
  ];
  const company = product(id);
  const optional = resolveCatalogFacts(company, [addOn], new Date(), null, market);
  const base = resolveCatalogFacts(company, [], new Date(), null, market);
  for (const [key, page, section, detail] of expected) {
    const cell = row(id, other, key).first;
    assert.equal(cell.state, "optional", key);
    assert.deepEqual(facts(id).find(term => term.key === key).addOnNames, ["Engangsutbetaling"]);
    assert.match(cell.text, detail);
    pdf(cell, "person:" + id, page, section);
    assert.ok(!base.some(term => term.key === key));
    assert.match(optional.find(term => term.key === key).value, detail);
  }
  assert.ok(!facts(id, productCatalog).some(term => term.key === capitalSum));
});

test("Frende advances retain their two-year limit, one-year after-cover and payment on death", () => {
  const id = "frende-person-uforekapital";
  const key = "person.ufore.forskudd.varighet";
  const { first, second } = row(id, "gjensidige-person-uforekapital", key);
  assert.match(first.text, /samme årsak innen ett år etter opphørsdatoen.*forsikringssummen ved opphør.*to år.*ti års sammenhengende forskudd/u);
  assert.match(first.text, /til og med måneden etter dødsfallet.*før forsikringstilfellet inntreffer/u);
  assert.match(second.text, /60 måneder/u);
  assert.doesNotMatch(second.text, /måneden etter dødsfallet/u);
  pdf(first, "person:" + id, 3, /§ 4\.4/u);
  pdf(first, "person:" + id, 2, /§ 3\.2/u);
});

test("Storebrand emotional support is a cash payment and Gjensidige keeps the G adjustment conditional", () => {
  const support = "person.sykdom.emosjonell_stotte.utbetaling";
  const storebrand = "storebrand-person-kritisk";
  const cash = row(storebrand, ifCritical, support);
  assert.equal(cash.first.state, "included");
  assert.equal(cash.second.state, "unknown");
  assert.match(cash.first.text, /10 000 kr.*samtidig med innvilget erstatning.*ingen dokumentasjon av faktiske utgifter/u);
  pdf(cash.first, "person:" + storebrand, 7, /A\.1\.26/u);
  assert.equal(row(storebrand, ifCritical, "person.sykdom.krisepsykolog").first.state, "unknown");
  const sum = row(gjCritical, storebrand, "person.sykdom.sum").first;
  assert.match(sum.text, /Hvis G-regulering er avtalt.*hovedforfall.*gjelder ikke den faste ytelsen ved langvarig sykehusopphold/u);
  pdf(sum, "person:" + gjCritical, 9, /G-regulering/u);
  const limit = row(gjCritical, storebrand, "person.sykdom.utbetalingsgrense").first;
  assert.match(limit.text, /ett forsikringstilfelle.*opphører etter utbetaling av erstatning/u);
  pdf(limit, "person:" + gjCritical, 9, /§ 6/u);
});

test("geographic scope aligns across critical illness variants while eligibility remains a separate fact", () => {
  for (const [id, documentId, page, sourceType, detail] of [
    [gjCritical, "person:" + gjCritical, 2, "full_terms", /hele verden.*sykehuset være i Norge/u],
    [ifCritical, "person:" + ifCritical, 3, "full_terms", /utenfor Norden.*inntil 12 måneder.*norsk folketrygd.*Lengre midlertidige opphold.*utenrikstjeneste.*student eller au pair/u],
    [fremtind, "person:" + fremtind + ":kritisk-ipid", 1, "ipid", /hele verden.*venteliste i Norden/u],
    ...["medlem", "ektefelle"].map(variant => {
      const id = udf + "kritisk-sykdom-" + variant;
      return [id, id + "-terms", 4, "full_terms", /gjelder i hele verden/u];
    }),
  ]) {
    const cell = row(id, id === gjCritical ? ifCritical : gjCritical, geography).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, detail);
    pdf(cell, documentId, page, /[hH]vor|utenfor Norden/u, sourceType);
    assert.ok(!facts(id, productCatalog).some(term => term.key === geography));
  }
  assert.equal(row(gjCritical, landkreditt, geography).second.state, "unknown");
  const eligibility = row(landkreditt, gjCritical, "person.sykdom.hvem").first;
  assert.match(eligibility.text, /Folkeregisteret de siste fem årene.*norsk folketrygd.*godkjenne helseerklæringen før forsikringen er gyldig/u);
  pdf(eligibility, "person:" + landkreditt, 3, /Tegningsbestemmelser|tegningsbestemmelser/u);
});

test("all five additional critical variants cite the actual claim notice deadline", () => {
  for (const [id, sourceId, page, clause, detail] of [
    [frende, "person:" + frende, 4, /§ 3/u, /ett år etter at kravstilleren fikk kunnskap.*fri for ansvar/u],
    [fremtind, "person:" + fremtind + ":kritisk-generelle", 4, /§ 11\.1/u, /ett år.*kunnskap.*med mindre dekningsvilkåret angir noe annet/u],
    [landkreditt, "person:" + landkreditt, 7, /§ 7\.1/u, /uten ugrunnet opphold.*ett år etter at den berettigede fikk kunnskap/u],
    ...["medlem", "ektefelle"].map(variant => {
      const id = udf + "kritisk-sykdom-" + variant;
      return [id, id + "-terms", 3, /Vær rask med å melde skade/u, /så snart som mulig.*kan falle bort.*ett år.*fikk kjennskap/u];
    }),
  ]) {
    const cell = row(id, gjCritical, notice).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, detail);
    pdf(cell, sourceId, page, clause);
    assert.ok(!facts(id, productCatalog).some(term => term.key === notice));
  }
});
