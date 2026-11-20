import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { availableAddOns, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const catalog = new Map(productComparisonProducts(marketProductCatalog).map(candidate => [candidate.productId, candidate]));
const product = id => {
  const entry = catalog.get(id);
  assert.ok(entry, id);
  return entry;
};
const rows = (first, second) => compareCatalogProducts(product(first), product(second), marketProductCatalog)
  .sections.flatMap(section => section.rows);
const fact = (id, key) => {
  const result = materializeCatalogProduct(product(id), marketProductCatalog).facts.find(entry => entry.key === key);
  assert.ok(result, `${id} ${key}`);
  return result;
};

test("equivalent property coverage shares a row and keeps its source and scope in either direction", () => {
  const cases = [
    ["tryg-nito-bil-delkasko", "bil-delkasko", "bil.brann", "brann.dekning", "included"],
    ["tryg-nito-bil-delkasko", "bil-delkasko", "bil.glass", "glass.dekning", "included"],
    ["tryg-nito-bil-ansvar", "bil-ansvar", "bil.rettshjelp", "rettshjelp.dekning", "included"],
    ["tryg-nito-hus", "tryg-hus", "hus.utvendige_ror", "hus.ror.utvendig", "included"],
    ["tryg-nito-hus-ekstra", "tryg-hus-ekstra", "hus.kunstnerisk_utsmykning", "hus.bygninger.utsmykning", "included"],
    ["tryg-nito-hus", "tryg-utdanningsforbundet-hus", "hus.utleie_husleie", "hus.utleie.tapt-leie", "optional"],
    ["watercircles-innbo-standard", "tryg-innbo", "rettshjelp.sum", "rettshjelp.grense", "included"],
    ["fremtind-innbo-standard", "klp-innbo", "ran.dekning", "tyveri.ran", "included"],
    ["klp-innbo", "fremtind-innbo-standard", "innbo.glass", "glass.sanitaer.dekning", "included"],
    ["tryg-nito-reise-enkeltperson", "tryg-reise", "reise.hvem", "reise.personer.omfang", "included"],
    ["landkreditt-bil-delkasko", "sb-bil-delkasko-motor10", "veihjelp.omfang", "veihjelp.geografi", "included"],
    ["gjensidige-hytte-standard", "tryg-hytte-standard", "hytte.avtale.krig", "hytte.unntak.krig", "included"],
  ];

  for (const [first, second, oldKey, key, state] of cases) {
    const comparison = rows(first, second);
    assert.equal(comparison.filter(row => row.key === key).length, 1, key);
    assert.ok(!comparison.some(row => row.key === oldKey), oldKey);
    const row = comparison.find(candidate => candidate.key === key);
    assert.equal(row.first.state, state, key);
    assert.notEqual(row.second.state, "unknown", key);
    const reverse = rows(second, first).find(candidate => candidate.key === key);
    assert.deepEqual(row.first, reverse.second, key);
    assert.deepEqual(row.second, reverse.first, key);
    if (first.startsWith("tryg-nito-")) {
      assert.equal(row.first.sources[0].agreementScope, "nito", key);
      if (state === "included") {
        assert.ok(resolveCatalogFacts(product(first), []).some(entry => entry.key === oldKey), oldKey);
      }
    }
  }

  const house = rows("tryg-nito-hus", "tryg-nito-hus-ekstra");
  const art = house.find(row => row.key === "hus.bygninger.utsmykning");
  assert.equal(art.first.state, "unavailable");
  assert.equal(art.second.state, "included");
  assert.equal(house.find(row => row.key === "hus.ror.utvendig").second.state, "included");
});

test("coverage limits, claim deadlines and settlement rules keep separate rows", () => {
  const house = new Map(rows("tryg-hus-ekstra", "klp-hus-hus").map(row => [row.key, row]));
  assert.match(house.get("hus.gjenoppforing.fullverdigaranti").first.text, /Ingen fradrag/u);
  assert.notEqual(house.get("hus.gjenoppforing.hovedregel").first.state, "unknown");
  const cabin = new Map(rows("tryg-hytte-standard", "storebrand-hytte-standard").map(row => [row.key, row]));
  assert.match(cabin.get("hytte.utleie.skadeverk.grense").first.text, /500 000/u);
  assert.match(cabin.get("hytte.utleie.skadeverk").second.text, /Forsettlig skadeverk/u);
  assert.match(cabin.get("hytte.krav.meldefrist").second.text, /innen ett år/u);
  assert.notEqual(cabin.get("hytte.avtale.meldefrist").second.state, "unknown");
});

test("treatment facts align payments, ages and restrictions without inheriting another variant", () => {
  const pair = rows("tryg-person-behandling-55", "gjensidige-person-helse-55");
  const byKey = key => pair.find(row => row.key === "person.behandling." + key);
  const help = byKey("hjelpebehov_hjemme");
  assert.match(help.first.text, /tre sammenhengende måneder.*120 000 kr/u);
  assert.match(help.second.text, /30 000 kr.*120 000 kr.*Én utbetaling per vedtak/u);
  assert.deepEqual([help.first, help.second].map(side => side.sources[0].page), [3, 8]);
  assert.equal(termsSourceHref(help.first.sources[0]), "/api/vilkar/tryg/behandling-55#page=3");
  assert.match(byKey("opphor").first.text, /første hovedforfall.*80 år/u);
  assert.match(byKey("opphor").second.text, /senest ved fylte 80 år/iu);
  assert.equal(byKey("rehabilitering").first.state, "unavailable");
  assert.equal(byKey("rehabilitering").second.state, "included");
  assert.equal(byKey("kreftbehandling").first.state, "unavailable");
  assert.equal(byKey("kreftbehandling").second.state, "unavailable");
  assert.equal(fact("tryg-person-behandling", "person.behandling.kreftbehandling").state, "included");
  assert.equal(fact("if-person-helse", "person.behandling.opphor").sources[0].sourceType, "ipid");
  assert.ok(!materializeCatalogProduct(product("tryg-nito-behandling-enkel"), marketProductCatalog).facts
    .some(entry => entry.key === "person.behandling.opphor"));
});

test("new person facts keep contractual amounts, variant sources, and optional scope", () => {
  const cystic = "person.barn.diagnose.cystisk_fibrose";
  const pair = rows("if-person-barn-standard", "tryg-person-barn-ekstra");
  const common = pair.filter(row => row.key === cystic);
  assert.equal(common.length, 1);
  assert.equal(common[0].first.sources[0].page, 6);
  assert.match(common[0].second.text, /klorid/u);
  assert.match(pair.find(row => row.key === "person.barn.diagnose").first.text, /4 G/u);
  assert.equal(fact("tryg-person-barn-ulykke", cystic).state, "optional");
  assert.equal(fact("tryg-utdanningsforbundet-barneforsikring", cystic).sources[0].agreementScope, "utdanningsforbundet");
  for (const variant of ["ekstra", "premium"]) {
    const condition = fact("tryg-person-gravid-" + variant, "person.gravid.medfodt");
    assert.match(condition.value, /200 000 kr/u);
    assert.ok(condition.sources.some(source => source.page === 3));
  }
  const klp = product("klp-person-ufore");
  const capital = "person.ufore.kapital";
  assert.ok(!resolveCatalogFacts(klp, []).some(entry => entry.key === capital));
  assert.equal(fact(klp.productId, capital).state, "optional");
  const addOn = availableAddOns(klp, new Date(), null, marketProductCatalog).find(entry => entry.name === "Varig uførhet – engangserstatning");
  assert.ok(addOn);
  assert.ok(resolveCatalogFacts(klp, [addOn.id], new Date(), null, marketProductCatalog).some(entry => entry.key === capital));
  const student = fact("tryg-nito-ufore-etter-studiet", "person.ufore.kapital.opphor");
  assert.match(student.value, /60 år/u);
  assert.equal(student.sources[0].agreementScope, "nito");
  const accident = fact("gjensidige-person-ulykke", "person.ulykke.arbeid");
  assert.equal(accident.sources[0].sourceType, "product_page");
  assert.equal(accident.sources[0].page, 0);
});

test("source-backed limits and distinctions are visible across property and travel levels", () => {
  for (const name of ["ansvar", "delkasko", "kasko", "super"]) {
    const right = fact("if-bil-" + name, "rettshjelp.grense");
    assert.match(right.value, /100 000 kr.*250 000 kr/u);
    assert.ok(right.sources.some(source => source.termsNumber === "GEN2-9" && source.page === 11));
  }

  const assistance = "reise.sykeledsagelse.tilkalling";
  const cash = "reise.bagasje.kontanter";
  for (const level of ["standard", "super"]) {
    const id = "if-reise-" + level;
    const cashRow = rows(id, "frende-reiseforsikring").find(row => row.key === cash);
    assert.match(cashRow.first.text, /5 000 kr per person.*10 000 kr per familie/u);
    assert.equal(cashRow.first.sources[0].page, 11);
    assert.equal(cashRow.second.state, "included");
    assert.match(fact(id, "reise.bagasje.verdisaker").value, /30 000 kr/u);
    assert.match(fact(id, "reise.bagasje.per_gjenstand").value, /40 000 kr/u);
    assert.match(fact(id, "reise.forsinkelse.avgang_sum").value, /3 000 kr per person.*24 timer/u);
  }
  const basic = rows("if-reise-basis", "frende-reiseforsikring");
  assert.equal(basic.find(row => row.key === assistance).second.state, "included");
  assert.match(basic.find(row => row.key === assistance).first.text, /inntil tre nære familiemedlemmer/u);
  assert.notEqual(basic.find(row => row.key === cash).first.state, "included");

  const freezer = "innbo.fryserinnhold.dekning";
  const adaptation = "innbo.ombygging.grense";
  for (const id of ["gjensidige-innbo-hytte", "gjensidige-innbo-hytte-pluss"]) {
    assert.match(fact(id, freezer).value, /utilsiktet temperaturstigning.*luktskade/u);
    const common = rows(id, "watercircles-innbo-fritidsbolig-elite").find(row => row.key === adaptation);
    assert.equal(common.second.state, "included");
    assert.match(common.first.text, /250 000 kr.*medfødt funksjonsnedsettelse/u);
  }
});

test("veterinary facts require a veterinary plan and cite its conditions", () => {
  for (const species of ["hund", "katt"]) {
    for (const level of ["veterin-r", "veterin-r-og-d-dsfall"]) {
      const id = "storebrand-" + species + "-" + level;
      const imaging = fact(id, "dyr.diagnostikk.grense");
      assert.match(imaging.value, /5 000 kr/u);
      assert.equal(imaging.sources[0].page, 5);
      assert.match(imaging.sources[0].url, /vilkar-hund-og-katteforsikring\.pdf$/u);
      assert.match(fact(id, "dyr.veterinar.dekning").sources[0].url, /vilkar-hund-og-katteforsikring\.pdf$/u);
    }
    const lifeOnly = "storebrand-" + species + "-d-dsfall";
    for (const key of ["dyr.diagnostikk.dekning", "dyr.diagnostikk.grense",
      "dyr.rehabilitering.dekning", "dyr.rehabilitering.grense"]) {
      const excluded = fact(lifeOnly, key);
      assert.equal(excluded.state, "unavailable", key);
      assert.match(excluded.value, /krever veterinærforsikring/u);
      assert.equal(excluded.sources[0].sourceType, "ipid");
      assert.equal(termsSourceHref(excluded.sources[0]), "/api/vilkar/storebrand/dyr-produktark#page=1");
      assert.ok(!resolveCatalogFacts(product(lifeOnly), []).some(row => row.key === key));
    }
  }
});

test("catalog evidence does not change the terms retrieved for uploaded agreements", () => {
  const keys = [
    ["tryg-nito-ufore-etter-studiet", "person.ufore.kapital.opphor"],
    ["tryg-utdanningsforbundet-barneforsikring", "person.barn.diagnose.cystisk_fibrose"],
    ["if-reise-standard", "reise.bagasje.kontanter"],
  ];
  for (const [id, key] of keys) {
    assert.ok(!resolveCatalogFacts(product(id), []).some(row => row.key === key), id);
    assert.ok(fact(id, key).sources.length, id);
  }
});

test("NITO Delkasko aligns legal-expenses coverage and limits with distinct own-scope sources", () => {
  const id = "tryg-nito-bil-delkasko";
  const comparison = new Map(rows(id, "if-bil-delkasko").map(row => [row.key, row]));
  const scope = comparison.get("rettshjelp.dekning");
  assert.match(scope.first.text, /Norden når ansvar er avtalt/u);
  const limit = comparison.get("rettshjelp.grense");
  assert.match(limit.first.text, /100 000 kr.*250 000 kr.*20 000 kr/u);
  assert.doesNotMatch(limit.first.text, /ID-tyveri/u);
  assert.match(limit.second.text, /100 000 kr/u);
  assert.deepEqual(limit.first.sources.map(termsSourceHref), [
    "/api/vilkar/tryg/nito-bil-rettshjelp-pge91500#page=4",
    "/api/vilkar/tryg/nito-bil-produkt-pau14000#page=1",
  ]);
  for (const row of [scope, limit]) {
    assert.ok(row.first.sources.every(source => source.agreementScope === "nito"));
    const reverse = rows("if-bil-delkasko", id).find(candidate => candidate.key === row.key);
    assert.deepEqual(reverse.second, row.first);
  }
  assert.ok(!resolveCatalogFacts(product(id), []).some(row => row.key === "rettshjelp.grense"));
  assert.ok(!materializeCatalogProduct(product("tryg-nito-bil-ansvar"), marketProductCatalog).facts
    .some(row => row.sources.some(source => source.documentId.startsWith(id + ":"))));
});

test("market row and group headings describe shared subjects in either direction", () => {
  const view = (a, b) => productComparisonView(compareCatalogProducts(product(a), product(b), marketProductCatalog));
  const dog = "gjensidige-hund-behandling";
  const pet = "storebrand-hund-veterin-r";
  for (const [first, second] of [[dog, pet], [pet, dog]]) {
    const group = view(first, second).flatMap(section => section.groups).find(group => group.id === "dyr.diagnostikk");
    assert.equal(group.label, "Diagnostikk");
    const cap = group.rows.find(row => row.key === "dyr.diagnostikk.grense");
    assert.equal(cap.label, "Diagnostikk – grense");
    assert.match((first === pet ? cap.first : cap.second).text, /scintigrafi/u);
  }
  const a = "tryg-nito-hus";
  const b = "tryg-utdanningsforbundet-hus";
  for (const [first, second] of [[a, b], [b, a]]) {
    assert.ok(view(first, second).flatMap(section => section.groups)
      .some(group => group.id === "hus.utleie" && group.label === "Utleie"));
  }
});

test("market results use the same canonical type when legacy Barn names are swapped", () => {
  const a = [...catalog.values()].find(product => product.insuranceType === "Barn");
  const b = [...catalog.values()].find(product => product.insuranceType === "Barneforsikring");
  assert.ok(a && b);
  assert.equal(compareCatalogProducts(a, b, marketProductCatalog).insuranceType, "Barn");
  assert.equal(compareCatalogProducts(b, a, marketProductCatalog).insuranceType, "Barn");
});


test("Tryg Premium SmartDelay uses the Collinson certificate and its 2026 edition", () => {
  const lounge = "reise.tjeneste.lounge";
  const loungeFact = (level, date) =>
    resolveCatalogFacts(product("tryg-reise-" + level), [], new Date(date), null, marketProductCatalog)
      .find(row => row.key === lounge);
  const premium = loungeFact("premium", "2026-11-20");
  assert.match(premium.value, /minst 60 minutter.*inntil fire medreisende.*minst 24 timer.*40 euro/u);
  assert.deepEqual([premium.source, premium.qualificationSource].map(termsSourceHref), [
    "/api/vilkar/tryg/reise-smartdelay-2026#page=1",
    "/api/vilkar/tryg/reise-smartdelay-2026#page=7",
  ]);
  assert.equal(loungeFact("ekstra", "2026-11-20"), undefined);
  assert.equal(loungeFact("premium", "2027-01-01"), undefined);
});


test("Tryg Reise aligns the October liability terms and each tier's deductible on separate rows", () => {
  const asOf = new Date("2026-10-01");
  const key = "reise.ansvar.";
  const pge = "/api/vilkar/tryg/reise-privatansvar-2026-10";
  const variants = [
    ["tryg-reise", "4 000 000 kr", /1 000 kr per skadetilfelle/u],
    ["tryg-reise-ekstra", "15 000 000 kr", /Ingen egenandel, med mindre 1 000 kr er valgt i forsikringsbeviset/u],
    ["tryg-reise-premium", "15 000 000 kr", /Ingen egenandel, med mindre 1 000 kr er valgt i forsikringsbeviset/u],
  ];
  for (const [id, amount, deductible] of variants) {
    const variant = product(id);
    const facts = resolveCatalogFacts(variant, [], asOf, null, marketProductCatalog);
    const coverage = facts.filter(entry => entry.key === key + "dekning");
    const amounts = facts.filter(entry => entry.key === key + "sum");
    const deductibles = facts.filter(entry => entry.key === key + "egenandel");
    const exclusions = facts.find(entry => entry.key === key + "unntak");
    assert.deepEqual([coverage.length, amounts.length, deductibles.length], [1, 1, 1]);
    assert.match(coverage[0].value, /privatperson.*person- eller tingskade.*utenfor Norden.*forsikringstiden/u);
    assert.match(exclusions.value, /nærmeste familie.*leid bolig.*rørledning/u);
    assert.ok(amounts[0].value.startsWith(amount));
    assert.match(deductibles[0].value, deductible);
    assert.deepEqual([coverage[0], exclusions, deductibles[0]].map(entry => termsSourceHref(entry.source)),
      [pge + "#page=1", pge + "#page=2", pge + "#page=3"]);
    assert.ok(!resolveCatalogFacts(variant, [], new Date("2026-09-30"), null, marketProductCatalog)
      .some(entry => entry.source.documentId === "trygReiseLiability202610"));
    assert.ok(!resolveCatalogFacts(variant, [], asOf)
      .some(entry => entry.key === key + "egenandel" || entry.source.documentId === "trygReiseLiability202610"));
  }
  const comparison = rows("tryg-reise", "tryg-reise-premium");
  const shared = comparison.filter(entry => entry.key === key + "egenandel");
  assert.equal(shared.length, 1);
  assert.match(shared[0].first.text, /1 000 kr per skadetilfelle/u);
  assert.match(shared[0].second.text, /Ingen egenandel/u);
});


test("the six pregnancy products use one expiry row with edition-specific dates and sources", () => {
  const key = "person.gravid.opphor";
  const compareWith = "storebrand-person-gravid";
  const products = [
    ["tryg-person-gravid-gratis", /6 måneder etter termindato.*kan ikke fornyes.*utvidelse til Ekstra eller Premium/u, "tryg/gravid-produktvilkar#page=2"],
    ["tryg-person-gravid-ekstra", /6 måneder etter termindato.*kan ikke fornyes/u, "tryg/gravid-produktvilkar#page=2"],
    ["tryg-person-gravid-premium", /6 måneder etter termindato.*kan ikke fornyes/u, "tryg/gravid-produktvilkar#page=2"],
    ["if-person-gravid-basis", /3 måneder etter oppgitt termindato.*utvidelse til Super/u, "if/gravid-basis#page=3"],
    ["if-person-gravid-super", /3 måneder etter oppgitt termindato/u, "if/gravid-super#page=3"],
    [compareWith, /før fødselen.*4 måneder etter beregnet termindato.*etter fødselen.*barnet er 4 måneder/u, "storebrand/gravid-spedbarn#page=10"],
  ];

  for (const [id, expiry, href] of products) {
    const forward = rows(id, compareWith).filter(row => row.key === key);
    assert.equal(forward.length, 1, id);
    assert.equal(forward[0].label, "Når forsikringen opphører");
    assert.match(forward[0].first.text, expiry);
    assert.equal(termsSourceHref(forward[0].first.sources[0]), "/api/vilkar/" + href);
    const reverse = rows(compareWith, id).find(row => row.key === key);
    assert.deepEqual(forward[0].first, reverse.second);
    assert.deepEqual(forward[0].second, reverse.first);
    assert.ok(!resolveCatalogFacts(product(id), []).some(entry => entry.key === key));
  }
});
