import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { addConfirmedNonmemberDamageMarketEvidence } from "../lib/confirmed-nonmember-damage-market-evidence.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const product = (id, catalog = marketProductCatalog) => catalog.products.find(item => item.productId === id);
const facts = (id, catalog = marketProductCatalog) => materializeCatalogProduct(product(id, catalog), catalog).facts;
const find = (id, key, catalog) => facts(id, catalog).filter(row => row.key === key);
const fact = (id, key, catalog) => {
  const matches = find(id, key, catalog);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
};
const compare = (a, b, key) => compareCatalogProducts(product(a), product(b), marketProductCatalog).sections
  .flatMap(section => section.rows).find(row => row.key === key);

function assertBoundPdf(id, filename) {
  const source = marketProductCatalog.sources[product(id).sourceId];
  assert.equal(createHash("sha256").update(readFileSync(filename)).digest("hex"), source.sha256, id);
}

test("Fremtind Hytte Topp viser avtalt egenandel ved håndverkerfeil på riktig kilde", () => {
  const id = "fremtind-hytte-topp";
  const key = "hytte.handverker.egenandel";
  const current = fact(id, key);
  assert.match(current.value, /forsikringsbeviset.*Standard-vilkårets punkt 6/u);
  assert.doesNotMatch(current.value, /5 000/u);
  assert.deepEqual(current.sources.map(source => [source.termsNumber, source.page]), [
    ["PBK-200.200-010", 2], ["PBK-200.100-015", 7],
  ]);
  assert.match(termsSourceHref(current.sources[0]), /Vilkar_Topp_Fritidshus\.pdf#page=2$/u);
  assertBoundPdf(id, "catalog/sources/private-cabin/fremtind-hytte.pdf");
});

test("Gjensidige Hytteinnbo viser avgrensede delsummer og krypto på begge nivåer", () => {
  for (const [id, filename] of [["gjensidige-innbo-hytte", "gjensidige-standard.pdf"], ["gjensidige-innbo-hytte-pluss", "gjensidige-pluss.pdf"]]) {
    const expected = [
      ["innbo.penger.grense", /20 000 kr/u],
      ["innbo.yrkeslosore.grense", /100 000 kr.*foretak.*bygning på forsikringsstedet/u],
      ["innbo.tilhenger.grense", /30 000 kr.*person- eller varebil på forsikringsstedet/u],
      ["innbo.kjoretoytilbehor.grense", /30 000 kr/u],
      ["innbo.hobbyveksthus.grense", /300 000 kr.*brann eller naturskade/u],
      ["innbo.bikuber.grense", /100 000 kr/u],
    ];
    for (const [key, value] of expected) {
      const row = fact(id, key);
      assert.match(row.value, value);
      assert.equal(row.sources[0].documentId, id);
      assert.equal(row.sources[0].page, 2);
    }
    assert.equal(fact(id, "innbo.penger.dekning").state, "included");
    assert.equal(fact(id, "innbo.kryptoeiendeler.dekning").state, "unavailable");
    assert.equal(compare(id, "watercircles-innbo-fritidsbolig-standard", "innbo.tilhenger.grense").second.state, "included");
    assertBoundPdf(id, "catalog/sources/private-holiday-contents/" + filename);
  }
});

test("Frende Hytte viser at ombyggingsvilkåret gjelder fast bolig", () => {
  const key = "hytte.tilpasning.dekning";
  for (const level of ["standard", "utvidet"]) {
    const id = "frende-hytte-" + level;
    const row = compare(id, "gjensidige-hytte-pluss", key);
    assert.equal(row.first.state, "unavailable");
    assert.match(row.first.text, /boligen sikrede bor fast i/u);
    assert.equal(row.second.state, "included");
    assert.equal(termsSourceHref(row.first.sources[0]), "/api/vilkar/frende/hytte-2026-11-20#page=4");
    assertBoundPdf(id, "catalog/sources/frende/2026-11-20/Vilkar-husforsikring-20112026.pdf");
  }
});

test("Forsinket avgang hos Frende holdes adskilt fra forsinket fremmøte", () => {
  const id = "frende-reiseforsikring";
  const row = fact(id, "reise.forsinkelse.avgang_sum");
  assert.match(row.value, /Ingen beløpsgrense.*6 000 kr per person.*forhåndsbestilt offentlig transport.*vær eller teknisk feil.*24 timer/u);
  assert.equal(termsSourceHref(row.sources[0]), "https://api.frende.no/documents/terms/public/pnc/TravelInsurance#page=4");
  assert.match(row.sources[0].section, /4\.2/u);
  assert.match(fact(id, "reise.forsinkelse.rute").sources[0].section, /4\.1/u);
  assertBoundPdf(id, "catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf");
});

test("Reisedokumenter og pass vises på samme rad med riktig omfang og If-nivå", () => {
  const key = "reise.bagasje.pass_billetter";
  for (const id of ["if-reise-standard", "if-reise-super"]) {
    const row = fact(id, key);
    assert.equal(row.state, "included");
    assert.match(row.value, /skadet eller tapt pass.*fastlagt reiserute.*4\.2\.1–4\.2\.6/u);
    assert.equal(termsSourceHref(row.sources[0]), "/api/vilkar/if/helars-reise-era3-4#page=10");
    const basis = compare(id, "if-reise-basis", key).second;
    assert.equal(basis.state, "unavailable");
    assert.equal(termsSourceHref(basis.sources[0]), "/api/vilkar/if/helars-reise-era3-4#page=2");
  }
  for (const [id, doc] of [["gjensidige-reise", "gjensidigeReiseTerms"], ["gjensidige-reise-pluss", "gjensidigeReisePlussTerms"]]) {
    const row = compare(id, "if-reise-super", key).first;
    assert.equal(row.state, "included");
    assert.match(row.text, /reisedokumenter eller pass på reisen.*merutgifter.*forhåndsbetalt reise/u);
    assert.deepEqual(row.sources.map(source => [source.documentId, source.page]), [[doc, 5]]);
  }
});

test("WaterCircles Reise viser utgifter til behandling i Norge etter ulykke på begge nivåer", () => {
  const key = "reise.ulykke.behandling";
  for (const level of ["standard", "elite"]) {
    const id = "watercircles-reise-" + level;
    const row = compare(id, "klp-reise-maks", key).first;
    assert.equal(row.state, "included");
    assert.match(row.text, /Norge de første to årene.*5 %.*70 år.*5 000 kr.*under 18 år.*ti år/u);
    assert.equal(termsSourceHref(row.sources[0]), "/api/vilkar/watercircles/reise-2-17#page=12");
    assertBoundPdf(id, "catalog/sources/new-private-contents-travel/watercircles-reise.pdf");
  }
});

test("Gjensidige Snøscooter skiller egenandeler og viser gradert sum for rettshjelp", () => {
  for (const [level, legalPage] of [["ansvar", 7], ["delkasko", 8], ["kasko", 8]]) {
    const id = "gjensidige-snoscooter-" + level;
    const sum = fact(id, "snoscooter.rettshjelp.grense");
    assert.match(sum.value, /forsikret i Gjensidige på samme side.*250 000 kr for 3–10.*1 000 000 kr ved minst 50/u);
    assert.equal(sum.sources[0].page, legalPage);
    const deductible = fact(id, "snoscooter.rettshjelp.egenandel");
    assert.match(deductible.value, /4 000 kr pluss 20 %.*Mekle.no.*0 kr/u);
    assert.equal(deductible.sources[0].page, legalPage);
    for (const peril of ["brann", "tyveri"]) {
      const key = "snoscooter." + peril + ".egenandel";
      if (level === "ansvar") assert.deepEqual(find(id, key), []);
      else {
        const row = fact(id, key);
        assert.match(row.value, /6 000 kr.*offentlige vilkårseksempelet/u);
        assert.equal(row.sources[0].page, 1);
      }
    }
  }
});

test("Fremtind Campingvogn og Tilhenger viser tyverioppgjøret og vilkårene for lasteskade", () => {
  for (const [kind, level] of [["campingvogn", "minikasko"], ["campingvogn", "kasko"], ["tilhenger", "kasko"]]) {
    const id = "eika-fremtind-" + kind + "-" + level;
    const row = fact(id, kind + ".tyveri.oppgjor");
    assert.match(row.value, /etter 21 dager.*markedsverdien.*før utbetaling.*tilbakebetaling innen 21 dager/u);
    assert.equal(row.sources[0].page, 3);
    assertBoundPdf(id, "catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf");
  }
  const id = "eika-fremtind-tilhenger-kasko";
  assert.match(fact(id, "tilhenger.kasko.dekning").value, /sammenstøt.*utforkjøring.*velt/u);
  const limits = fact(id, "tilhenger.kasko.begrensning");
  assert.match(limits.value, /ervervsmessig bruk er unntatt.*gods.*annen erstatningsmessig skade/iu);
  assert.equal(limits.sources[0].page, 4);
});

test("Fremtind Båt holder bergelønn, vrakfjerning og rettshjelp adskilt fra slep", () => {
  for (const level of ["delkasko", "kasko", "toppkasko"]) {
    const id = "sparebank1-fremtind-bat-" + level;
    const root = "/api/vilkar/fremtind/bat#page=";
    const salvage = compare(id, "if-bat-delkasko", "bat.redning.bergelonn");
    assert.equal(salvage.first.state, "included");
    assert.equal(salvage.second.state, "included");
    assert.match(salvage.first.text, /beregner etter gjeldende lovverk/u);
    assert.equal(termsSourceHref(salvage.first.sources[0]), root + 2);
    assert.match(fact(id, "bat.redning.dekning").value, /slep til nærmeste trygge fortøyningssted/u);
    assert.match(fact(id, "bat.vrakfjerning.grense").value, /dekket skade.*pålagt av offentlig myndighet/u);
    assert.match(fact(id, "bat.rettshjelp.grense").value, /100 000 kr.*tre parter.*250 000 kr/u);
    const deductible = fact(id, "bat.rettshjelp.egenandel");
    assert.match(deductible.value, /forsikringsbeviset pluss 20 %.*advokat og sakkyndig/u);
    assert.equal(termsSourceHref(deductible.sources[0]), root + 11);
  }
});

test("Storebrand og Fremtind viser avliving som veterinærutgift på riktig nivå", () => {
  for (const species of ["hund", "katt"]) {
    for (const tier of ["veterin-r", "veterin-r-og-d-dsfall"]) {
      const id = "storebrand-" + species + "-" + tier;
      const key = "dyr.veterinar.avliving";
      const row = compare(id, "frende-" + species + "-veterin-r", key);
      assert.equal(row.first.state, "included");
      assert.match(row.first.text, /Veterinæranbefalt avliving.*forsikringsåret dyret fyller 10 år/u);
      assert.equal(termsSourceHref(row.first.sources[0]), "/api/vilkar/storebrand/dyr#page=6");
      assert.match(fact(id, "dyr.veterinar.kremering.grense").value, /erstatningsmessig dødsfall.*separat kremering.*1 500 kr/u);
      const birth = fact(id, "dyr.fodsel.dekning");
      assert.match(birth.value, /én gang i dyrets liv.*minst ett år.*to eller flere keisersnitt/u);
      assert.equal(termsSourceHref(birth.sources[0]), "/api/vilkar/storebrand/dyr#page=4");
    }
    const deathOnly = "storebrand-" + species + "-d-dsfall";
    assert.deepEqual(find(deathOnly, "dyr.veterinar.avliving"), []);
    assert.deepEqual(find(deathOnly, "dyr.fodsel.dekning"), []);
    const id = "sparebank1-fremtind-" + species + "-veterin-r";
    const row = fact(id, "dyr.veterinar.avliving");
    assert.match(row.value, /2 000 kr samlet.*avliving og kremering.*Veterinærattest/u);
    assert.equal(row.state, "included");
    const root = "/api/vilkar/fremtind/" + species + "-behandling#page=";
    assert.deepEqual(row.sources.map(termsSourceHref), [root + 1, root + 2]);
  }
});

test("Sammenligningsrettingene gjelder de verifiserte utgavene og bevarer dokumentkatalogen", () => {
  const id = "fremtind-hytte-topp";
  const key = "hytte.handverker.egenandel";
  assert.match(fact(id, key, productCatalog).value, /5 000 kr/u);
  const c = { ...marketProductCatalog, sources: { ...marketProductCatalog.sources }, facts: { ...marketProductCatalog.facts } };
  const source = c.sources["cabin:fremtind:standard"];
  c.sources[source.id] = { ...source, sha256: "different-edition" };
  c.facts[id] = productCatalog.facts[id];
  addConfirmedNonmemberDamageMarketEvidence(c.sources, c.facts, c.products);
  assert.equal(c.facts[id], productCatalog.facts[id]);
  assert.deepEqual(find("if-reise-standard", "reise.bagasje.pass_billetter", productCatalog), []);
  assert.deepEqual(find("sparebank1-fremtind-bat-kasko", "bat.redning.bergelonn", productCatalog), []);
});
