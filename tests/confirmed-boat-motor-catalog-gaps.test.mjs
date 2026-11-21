import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addBoatMotorMarketEvidence } from "../lib/boat-motor-market-evidence.ts";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";

const products = productComparisonProducts(marketProductCatalog);
const factList = (productId, catalog = marketProductCatalog) =>
  materializeCatalogProduct(catalog.products.find(product => product.productId === productId), catalog).facts;
const fact = (productId, key) => {
  const matches = factList(productId).filter(row => row.key === key);
  assert.equal(matches.length, 1, productId + " " + key);
  return matches[0];
};
const compareRow = (first, second, key) => compareCatalogProducts(
  products.find(product => product.productId === first),
  products.find(product => product.productId === second),
  marketProductCatalog,
).sections.flatMap(section => section.rows).find(row => row.key === key);

test("Båtmarkedet holder fører- og passasjerulykke på samme rader med nivåets vilkår", () => {
  for (const [ifTier, gjensidigeTier, accidentPage, legalPage] of [
    ["delkasko", "delkasko", 4, 10], ["kasko", "kasko", 5, 11], ["super", "pluss", 6, 12],
  ]) {
    const first = "if-bat-" + ifTier;
    const second = "gjensidige-bat-" + gjensidigeTier;
    const gjensidigeRoute = "/api/vilkar/gjensidige/bat-" + gjensidigeTier + "#page=";
    const invalidity = compareRow(first, second, "bat.ulykke.invaliditet");
    assert.equal(invalidity.first.state, "included");
    assert.equal(invalidity.second.state, "included");
    assert.match(invalidity.first.text, /200 000 kr per forsikret/u);
    assert.match(invalidity.second.text, /500 000 kr/u);
    assert.equal(termsSourceHref(invalidity.first.sources[0]), "/api/vilkar/if/bat-bat2-1#page=17");
    assert.equal(termsSourceHref(invalidity.second.sources[0]), gjensidigeRoute + 1);
    assert.equal(termsSourceHref(fact(second, "bat.ulykke.dekning").sources[0]), gjensidigeRoute + accidentPage);
    assert.match(fact(first, "bat.ulykke.dod").value, /100 000 kr/u);
    assert.match(fact(second, "bat.ulykke.dod").value, /100 000 kr/u);
    assert.match(fact(second, "bat.ulykke.behandling").value, /15 000 kr/u);
    assert.match(fact(first, "bat.rettshjelp.egenandel").value, /4 000 kr pluss 20 %/u);
    assert.match(fact(second, "bat.rettshjelp.grense").value, /100 000 kr per tvist med 1–2 parter.*50 eller flere.*1 000 000 kr/u);
    assert.equal(termsSourceHref(fact(second, "bat.rettshjelp.grense").sources[0]), gjensidigeRoute + legalPage);
    assert.equal(termsSourceHref(fact(first, "bat.haerverk.dekning").sources[0]), "/api/vilkar/if/bat-bat2-1#page=3");
  }
});

test("Gjensidige Delkasko har redning, og If skiller bergelønn fra slep ved driftsstans", () => {
  const row = compareRow("gjensidige-bat-delkasko", "if-bat-delkasko", "bat.redning.dekning");
  assert.equal(row.first.state, "included");
  assert.match(row.first.text, /driftsstans/u);
  assert.equal(row.second.state, "unknown");
  assert.equal(termsSourceHref(row.first.sources[0]), "/api/vilkar/gjensidige/bat-delkasko#page=2");
  const ifSalvage = fact("if-bat-delkasko", "bat.redning.bergelonn");
  assert.match(ifSalvage.value, /fare forsikringen dekker/u);
  assert.equal(termsSourceHref(ifSalvage.sources[0]), "/api/vilkar/if/bat-bat2-1#page=4");
  assert.match(fact("if-bat-delkasko", "bat.vrakfjerning.grense").value, /10 %.*offentlig pålagt/u);
  assert.match(fact("if-bat-kasko", "bat.redning.egenandel").value, /Ingen/u);
  for (const tier of ["delkasko", "kasko", "pluss"]) {
    const id = "gjensidige-bat-" + tier;
    assert.match(fact(id, "bat.redning.egenandel").value, /750 kr; 0 kr/u);
    assert.match(fact(id, "bat.redning.hjemtransport.geografi").value, /Hjemtransport.*Skandinavia/u);
    assert.match(fact(id, "bat.losore.grense").value, tier === "pluss" ? /Ubegrenset/u : /50 000 kr/u);
  }
});

test("If Super og Gjensidige Pluss viser egne dagsbeløp, varighet og grenser for båten", () => {
  const first = "if-bat-super";
  const second = "gjensidige-bat-pluss";
  const daily = compareRow(first, second, "bat.ferieavbrudd.dagsbelop");
  const days = compareRow(first, second, "bat.ferieavbrudd.dager");
  assert.match(daily.first.text, /2 000 kr/u);
  assert.match(daily.second.text, /1 500 kr/u);
  assert.match(days.first.text, /21/u);
  assert.match(days.second.text, /14/u);
  assert.equal(termsSourceHref(days.first.sources[0]), "/api/vilkar/if/bat-bat2-1#page=7");
  assert.equal(termsSourceHref(days.second.sources[0]), "/api/vilkar/gjensidige/bat-pluss#page=4");
  assert.match(fact(first, "bat.ferieavbrudd.dekning").value, /1. mai til og med 31. august/u);
  assert.match(fact(first, "bat.totalskade.alder").value, /tre år.*første gang ble solgt som ny/u);
  assert.match(fact(first, "bat.totalskade.dekning").value, /gjenanskaffelsesverdi.*begrenset til avtalt forsikringssum/u);
  assert.match(fact(first, "bat.opplagsutstyr.grense").value, /Ingen særskilt beløpsgrense/u);
  assert.match(fact(second, "bat.maskinskade.alder").value, /første hovedforfall.*fylt ti år/u);
  assert.ok(factList("if-bat-kasko").every(row => row.key !== "bat.ferieavbrudd.dager"));
  assert.ok(factList("gjensidige-bat-kasko").every(row => row.key !== "bat.ferieavbrudd.dager"));
});

test("Gjensidige MC og Bobil skiller glassreparasjon fra glassbytte og MC-ladekabel", () => {
  for (const tier of ["mc-delkasko", "mc-kasko", "bobil-delkasko", "bobil-kasko", "bobil-pluss"]) {
    const id = "gjensidige-" + tier;
    const repair = fact(id, "glass.reparasjon.grense");
    assert.match(repair.value, /1 000 kr/u);
    assert.equal(termsSourceHref(repair.sources[0]), "/api/vilkar/gjensidige/" + tier + "#page=1");
    assert.match(fact(id, "glass.skifte.grense").value, /Ubegrenset/u);
    assert.match(fact(id, "glass.reparasjon.egenandel").value, /Ingen egenandel/u);
    if (tier.startsWith("bobil-")) {
      assert.match(fact(id, "glass.dekning").value, /glasstak/u);
      assert.match(fact(id, "glass.begrensning").value, /Solcellepanel/u);
    }
  }
  const cable = fact("gjensidige-mc-kasko", "ladekabel.dekning");
  assert.match(cable.value, /Tyveri av eller ytre skade.*el-motorsykkel/u);
  assert.match(fact("gjensidige-mc-kasko", "ladekabel.egenandel").value, /2 000 kr/u);
  assert.equal(termsSourceHref(cable.sources[0]), "/api/vilkar/gjensidige/mc-kasko#page=1");
  for (const id of ["gjensidige-mc-delkasko", "gjensidige-bobil-kasko", "gjensidige-bobil-pluss"]) {
    assert.ok(factList(id).every(row => row.key !== "ladekabel.dekning"));
  }
  for (const id of ["gjensidige-mc-ansvar", "gjensidige-bobil-ansvar"]) {
    assert.ok(factList(id).every(row => row.key !== "glass.reparasjon.grense"));
  }
});

test("Båt- og motorrettingene bruker eksakte PDF-biter og går ikke inn i rå katalog", () => {
  const evidence = [
    ["if-bat-super", "bat.ferieavbrudd.dagsbelop"],
    ["gjensidige-bat-delkasko", "bat.redning.dekning"],
    ["gjensidige-bat-kasko", "bat.ulykke.dekning"],
    ["gjensidige-bat-pluss", "bat.ferieavbrudd.dagsbelop"],
    ["gjensidige-mc-delkasko", "glass.reparasjon.grense"],
    ["gjensidige-mc-kasko", "ladekabel.egenandel"],
    ["gjensidige-bobil-delkasko", "glass.reparasjon.grense"],
    ["gjensidige-bobil-kasko", "glass.reparasjon.grense"],
    ["gjensidige-bobil-pluss", "glass.reparasjon.grense"],
  ];
  for (const [id, key] of evidence) {
    assert.ok(factList(id, productCatalog).every(row => row.key !== key));
    const source = fact(id, key).sources[0];
    const archive = termsArchiveDocuments.find(entry =>
      termsSourceHref(source) === "/api/vilkar/" + entry.provider + "/" + entry.slug + "#page=" + source.page);
    assert.ok(archive, id + " " + key);
    const bytes = readFileSync(archive.archivePath);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    assert.equal(sha256, marketProductCatalog.sources[source.documentId].sha256, id + " " + key);
  }

  const sources = { ...productCatalog.sources };
  const facts = { ...productCatalog.facts };
  const id = "boat-pet:if:båt";
  sources[id] = { ...sources[id], sha256: "ny-utgave" };
  addBoatMotorMarketEvidence(sources, facts, productCatalog.products);
  assert.equal(facts["if-bat-super"], productCatalog.facts["if-bat-super"]);
});

test("båter sammenligner verkstedtransport, skade under transport, hjemtransport og bergelønn hver for seg", () => {
  const ifBasic = "if-bat-delkasko";
  const gjBasic = "gjensidige-bat-delkasko";
  const fremtindBasic = "sparebank1-fremtind-bat-delkasko";
  const frendeBasic = "frende-bat-brann-og-tyveri";
  const key = "bat.transport.dekning";
  for (const [id, page] of [[ifBasic, 4], [gjBasic, 2], [fremtindBasic, 2], ["frende-bat-kasko", 3]]) {
    const workshop = fact(id, key);
    assert.match(workshop.value, /nærmeste verksted/u);
    assert.equal(workshop.sources[0].page, page);
    assert.ok(termsSourceHref(workshop.sources[0]).endsWith("#page=" + page), id);
  }
  const ifHull = "if-bat-kasko";
  const trygHull = "tryg-marked-bat-kasko-ansvar";
  const inTransit = compareRow(ifHull, trygHull, "bat.transport.skade.dekning");
  assert.equal(inTransit.label, "Skade på båten under transport");
  assert.match(inTransit.first.text, /transport til lands og til vanns/u);
  assert.match(inTransit.second.text, /motor- og seilbåt.*slipp eller løft/u);
  assert.equal(inTransit.second.sources[0].page, 2);
  assert.equal(compareRow(trygHull, ifHull, inTransit.key).label, inTransit.label);
  const salvage = compareRow(frendeBasic, ifBasic, "bat.redning.bergelonn");
  assert.equal(salvage.first.state, "included");
  assert.equal(salvage.second.state, "included");
  assert.equal(compareRow(frendeBasic, gjBasic, "bat.redning.dekning").first.state, "unavailable");

  const home = "bat.redning.hjemtransport.dekning";
  const recovery = compareRow(gjBasic, fremtindBasic, home);
  assert.match(recovery.first.text, /sykdom, ulykke eller dødsfall/u);
  assert.match(recovery.second.text, /funnet igjen etter et tyveri/u);
  assert.equal(compareRow(gjBasic, fremtindBasic, "bat.redning.geografi").first.state, "unknown");
  assert.equal(compareRow(gjBasic, fremtindBasic, "bat.redning.hjemtransport.geografi").second.state, "unknown");
  assert.match(fact("storebrand-bat-super", home).value, /fast havn/u);
  assert.equal(fact("storebrand-bat-super", home).sources[0].page, 8);
  assert.match(fact("storebrand-bat-delkasko", "bat.redning.bergelonn").value, /reglene om berging i sjøloven/u);
});

test("Frende Utvidet, Storebrand Super og Fremtind viser dokumenterte feriegrenser på riktig nivå", () => {
  const frende = "frende-bat-utvidet";
  const storebrand = "storebrand-bat-super";
  const eligibility = compareRow(frende, storebrand, "bat.ferieavbrudd.dekning");
  assert.match(eligibility.first.text, /1. mai til 31. august.*minst sju dager/u);
  assert.equal(termsSourceHref(eligibility.first.sources[0]), "/api/vilkar/frende/bat-2026-11-20#page=4");
  assert.match(compareRow(frende, storebrand, "bat.ferieavbrudd.dagsbelop").first.text, /1 500 kr/u);
  assert.match(compareRow(frende, storebrand, "bat.ferieavbrudd.dager").first.text, /14 dager/u);
  assert.match(fact(storebrand, "bat.ferieavbrudd.grense").value, /60 000 kr samlet/u);
  assert.match(fact(frende, "bat.redning.hjemtransport.grense").value, /verdi.*50 000 kr/u);
  assert.match(fact(frende, "bat.vrakfjerning.grense").value, /10 %/u);
  for (const id of ["sparebank1-fremtind-bat-kasko", "sparebank1-fremtind-bat-toppkasko"]) {
    const terms = fact(id, "bat.ferieavbrudd.dekning");
    assert.match(terms.value, /mer enn tre dager.*normal reparasjonstid.*godkjennes på forhånd/u);
    assert.equal(terms.sources[0].page, 6);
  }
  assert.equal(compareRow(frende, "frende-bat-kasko", "bat.ferieavbrudd.dekning").second.state, "unknown");
});
