import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { addStorebrandBoatBobilMarketEvidence } from "../lib/storebrand-boat-bobil-market-evidence.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";

const market = marketProductCatalog;
const choices = productComparisonProducts(market);
const boatSourceId = "boat-pet:storebrand:båt";
const bobilSourceId = "storebrand:motor10:bobil";
const boatLevels = ["delkasko", "kasko", "super"];
const factsFor = productId => materializeCatalogProduct(market.products.find(product => product.productId === productId), market).facts;
const boatId = level => "storebrand-bat-" + level;
const bobilId = level => "storebrand-bobil-" + level + "-motor10";

function fact(productId, key) {
  const rows = factsFor(productId).filter(row => row.key === key);
  assert.equal(rows.length, 1, productId + " " + key);
  return rows[0];
}

function compareRows(first, second) {
  return compareCatalogProducts(
    choices.find(product => product.productId === first), choices.find(product => product.productId === second), market,
  ).sections.flatMap(section => section.rows);
}

function assertArchiveSource(row, documentId, slug, page) {
  const source = row.sources[0];
  assert.equal(source.documentId, documentId);
  assert.equal(source.page, page);
  assert.equal(termsSourceHref(source), "/api/vilkar/storebrand/" + slug + "#page=" + page);
}

const assertBoatSource = (row, page) => assertArchiveSource(row, boatSourceId, "bat", page);

test("Storebrand Båt viser ulykkesdekning og satser på samme rader som If", () => {
  for (const level of boatLevels) {
    const id = boatId(level);
    assert.match(fact(id, "bat.ulykke.dekning").value, /eierens tillatelse.*direkte årsaken.*utleie/u);
    assert.match(fact(id, "bat.ulykke.dod").value, /100 000 kr per forsikret/u);
    assert.match(fact(id, "bat.ulykke.grense").value, /1 000 000 kr samlet per skadetilfelle/u);
    const rows = compareRows(id, "if-bat-" + level);
    const invalidity = rows.find(row => row.key === "bat.ulykke.invaliditet");
    assert.match(invalidity.first.text, /200 000 kr per voksen og 500 000 kr per barn under 18 år/u);
    assert.match(invalidity.second.text, /200 000 kr/u);
    assertBoatSource(invalidity.first, 20);
    const treatment = rows.find(row => row.key === "bat.ulykke.behandling");
    assert.equal(treatment.first.state, "unavailable");
    assertBoatSource(treatment.first, 20);
    const therapy = fact(id, "bat.kriseterapi.dekning");
    assert.equal(therapy.state, "included");
    assert.match(therapy.value, /10 behandlingstimer.*12 måneder/u);
    assertBoatSource(therapy, 8);
  }
});

test("Storebrand Båt skiller verkstedtransport, skade under transport, bergelønn og vrakfjerning", () => {
  for (const level of boatLevels) {
    const id = boatId(level);
    const delkasko = level === "delkasko";
    const repairTransport = fact(id, "bat.transport.dekning");
    assert.equal(repairTransport.state, "included");
    assert.match(repairTransport.value, delkasko ? /Gjelder etter dekket brann- eller tyveriskade/u : /eller annen dekket skade/u);
    assertBoatSource(repairTransport, 8);
    const damageDuringTransport = fact(id, "bat.transport.skade.dekning");
    assert.equal(damageDuringTransport.state, delkasko ? "unavailable" : "included");
    assertBoatSource(damageDuringTransport, 9);
    const salvage = fact(id, "bat.redning.bergelonn");
    assert.match(salvage.value, /vellykket berging.*reglene om berging i sjøloven/u);
    assertBoatSource(salvage, 8);
    assert.match(fact(id, "bat.redning.egenandel").value, /750/u);
    const wreck = fact(id, "bat.vrakfjerning.grense");
    assert.match(wreck.value, /Ingen særskilt beløpsgrense.*til sjenanse eller skjemmende.*offentlig myndighet/u);
    assertBoatSource(wreck, 16);
  }
  const crossProviderTransport = compareRows(boatId("kasko"), "if-bat-kasko").find(row => row.key === "bat.transport.dekning");
  assert.equal(crossProviderTransport.first.state, "included");
  assert.equal(crossProviderTransport.second.state, "included");
});

test("Storebrand Båt viser riktige ansvarsgrenser, satser og egenandeler på alle tre nivåer", () => {
  for (const level of boatLevels) {
    const id = boatId(level);
    const liability = fact(id, "bat.ansvar.grense");
    assert.match(liability.value, /3 020 000 SDR ved personskade og 1 510 000 SDR ved tingskade/u);
    assertBoatSource(liability, 16);
    assertBoatSource(fact(id, "bat.ansvar.egenandel"), 17);
    const legal = fact(id, "bat.rettshjelp.grense");
    assert.match(legal.value, /100 000 kr.*250 000 kr.*500 000 kr.*750 000 kr.*1 000 000 kr/u);
    assertBoatSource(legal, 19);
    assert.match(fact(id, "bat.rettshjelp.egenandel").value, /4 000 kr pluss 20 %.*én egenandel per tvist/u);
    assert.match(fact(id, "bat.brann.egenandel").value, /6 000 kr.*forsikringsbeviset/u);
    assert.match(fact(id, "bat.tyveri.egenandel").value, /6 000 kr.*4 000 kr.*FG-godkjent.*Securmark/u);
    const bags = fact(id, "bat.losore.grense");
    assert.match(bags.value, level === "super" ? /100 000 kr/u : /50 000 kr/u);
    assertBoatSource(bags, 7);
    const engine = fact(id, "bat.maskinskade.dekning");
    assert.equal(engine.state, "unavailable");
    assert.match(engine.value, /Ingen egen maskinskadedekning|ingen egen maskinskadedekning/u);
    assert.match(engine.value, /sammenstøt.*valgt nivå/u);
    assertBoatSource(engine, 11);
  }
  assert.ok(factsFor(boatId("delkasko")).every(row => row.key !== "bat.kasko.egenandel"));
  for (const level of ["kasko", "super"]) {
    assert.match(fact(boatId(level), "bat.kasko.egenandel").value, /8 000 kr.*forsikringsbeviset/u);
    assert.match(fact(boatId(level), "bat.kasko.dekning").value, /Kontroll av skroget inngår etter grunnstøting/u);
  }
});

test("Storebrand Båt Super holder sesong, dagsbeløp, varighet og totalskadeterskel adskilt", () => {
  const id = boatId("super");
  const daily = compareRows(id, "if-bat-super").find(row => row.key === "bat.ferieavbrudd.dagsbelop");
  assert.match(daily.first.text, /2 promille \(0,2 %\) av båtens forsikringssum per dag/u);
  assert.match(daily.second.text, /2 000 kr/u);
  assertBoatSource(daily.first, 10);
  assert.match(fact(id, "bat.ferieavbrudd.dekning").value, /15. april til 15. september.*sjøudyktig/u);
  assert.match(fact(id, "bat.ferieavbrudd.dager").value, /30 dager.*totalskade/u);
  assert.match(fact(id, "bat.ferieavbrudd.grense").value, /60 000/u);
  const threshold = fact(id, "bat.totalskade.skadegrad");
  assert.match(threshold.value, /kjøpt som ny.*tapt.*mer enn 80 % av importørens listepris/u);
  assertBoatSource(threshold, 10);
  assert.match(fact(id, "bat.totalskade.alder").value, /tre år.*kjøpt ny.*bruktbåt.*tre år fra kjøpsdatoen/u);
  assert.match(fact(id, "bat.totalskade.dekning").value, /For bruktbåt gjelder egne oppgjørsregler/u);
  for (const level of ["delkasko", "kasko"]) {
    assert.ok(factsFor(boatId(level)).every(row => !row.key.startsWith("bat.ferieavbrudd.") && !row.key.startsWith("bat.totalskade.")));
  }
});

test("Storebrand Bobil binder redusert egenandel ved dyrepåkjørsel til Kasko og Super", () => {
  const rows = compareRows(bobilId("kasko"), bobilId("super"));
  const reduction = rows.find(row => row.key === "kasko.egenandel.dyr");
  for (const side of [reduction.first, reduction.second]) {
    assert.match(side.text, /reduseres med 6 000 kr.*dyr som går løse på veien.*politiet eller viltnemnda.*umiddelbart/u);
    assertArchiveSource(side, bobilSourceId, "motor10", 13);
  }
  assert.match(fact(bobilId("super"), "kasko.egenandel").value, /forsikringsbeviset/u);
  for (const level of ["ansvar", "delkasko"]) {
    assert.ok(factsFor(bobilId(level)).every(row => row.key !== "kasko.egenandel.dyr"));
  }
});

test("Storebrand-rettingene kontrollerer utgave og oppdaterer kun markedskatalogen", () => {
  for (const [sourceId, productId, key] of [
    [boatSourceId, boatId("super"), "bat.ferieavbrudd.dagsbelop"],
    [bobilSourceId, bobilId("kasko"), "kasko.egenandel.dyr"],
  ]) {
    const source = market.sources[sourceId];
    const reference = fact(productId, key).sources[0];
    const archive = termsArchiveDocuments.find(entry =>
      termsSourceHref(reference) === "/api/vilkar/" + entry.provider + "/" + entry.slug + "#page=" + reference.page);
    assert.ok(archive);
    assert.equal(createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex"), source.sha256);
    assert.ok((productCatalog.facts[productId] ?? []).every(row => row.key !== key));

    const newEditionSources = { ...market.sources, [sourceId]: { ...source, sha256: "ny-utgave" } };
    const rawFacts = { ...productCatalog.facts };
    addStorebrandBoatBobilMarketEvidence(newEditionSources, rawFacts, market.products);
    assert.equal(rawFacts[productId], productCatalog.facts[productId]);
  }
});
