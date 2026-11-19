import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { basename } from "node:path";
import { boatPetFacts } from "../lib/boat-pet-catalog.ts";
import { canonicalCoverage } from "../lib/coverage-status.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { compareCatalogProducts } from "../lib/catalog-product-comparison.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { beforeBoatWordingCorrection, beforePrivatePolicyPageFact, beforeTransportSourceCorrection } from "./helpers/before-private-policy-pages.mjs";

const receipt = JSON.parse(readFileSync(new URL("../docs/audit/checkpoints/private-policy-pages-20261119/source-changes.json", import.meta.url), "utf8"));
const scope = JSON.parse(readFileSync(new URL("../docs/audit/checkpoints/private-policy-pages-20261119/scope.json", import.meta.url), "utf8"));

test("all eight immutable archives use bounded physical-page anchors", () => {
  const files = new Map(receipt.documents.map(document => [basename(document.path), document]));
  for (const [filename, document] of files) {
    const bytes = readFileSync(new URL("../" + document.path, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), document.sha256, filename);
  }
  const counts = new Map();
  for (const facts of Object.values(boatPetFacts)) {
    for (const fact of facts) {
      for (const source of [fact.source, fact.qualificationSource]) {
        if (!scope.documents.includes(source?.filename)) continue;
        const document = files.get(source.filename);
        assert.ok(source.page >= 1 && source.page <= document.pages, source.documentId + " " + fact.key);
        const archive = termsArchiveDocuments.find(item => item.archivePath === document.path);
        assert.ok(archive, document.path);
        assert.equal(termsSourceHref(source), "/api/vilkar/" + archive.provider + "/" + archive.slug + "#page=" + source.page);
        counts.set(source.filename, (counts.get(source.filename) ?? 0) + 1);
      }
    }
  }
  const expected = { ...receipt.after_reference_counts };
  expected["gjensidige-boat-ipid.pdf"] -= 2;
  assert.deepEqual(Object.fromEntries(counts), expected);
  assert.equal(counts.size, 8);
});

test("each audited fact matches the recorded correction and historical checks retain their exact prior inputs", () => {
  for (const { component, key, edits } of receipt.changes) {
    const fact = boatPetFacts[component].find(entry => entry.key === key);
    assert.ok(fact, component + " " + key);
    const afterOriginalCorrection = beforeTransportSourceCorrection(component, beforeBoatWordingCorrection(component, fact));
    const original = beforePrivatePolicyPageFact(component, fact);
    for (const { field, property, after, before } of edits) {
      assert.deepEqual(property ? afterOriginalCorrection[field][property] : afterOriginalCorrection[field], after);
      assert.deepEqual(property ? original[field][property] : original[field], before);
    }
  }
});

test("geography, boat trip interruption and deductibles open the pages that state them", () => {
  const citations = [
    ["tryg-bat-kasko-ansvar", "bat.geografi.omrade", "/api/vilkar/tryg/ipid-bat#page=2"],
    ["gjensidige-bat-kasko", "bat.geografi.omrade", "/api/vilkar/gjensidige/ipid-bat#page=2"],
    ["sparebank1-fremtind-bat-toppkasko", "bat.ferieavbrudd.dager", "/api/vilkar/fremtind/bat#page=7"],
    ["storebrand-bat-super", "bat.ferieavbrudd.dager", "/api/vilkar/storebrand/bat#page=10"],
    ["storebrand-hund-veterin-r", "dyr.veterinar.dekning", "/api/vilkar/storebrand/dyr#page=4"],
    ["frende-hund-veterin-r", "dyr.veterinar.egenandel.fast", "/api/vilkar/frende/hund#page=5"],
    ["frende-katt-veterin-r", "dyr.veterinar.egenandel.fast", "/api/vilkar/frende/katt#page=4"],
  ];
  for (const [id, key, expected] of citations) {
    assert.equal(termsSourceHref(boatPetFacts[id].find(fact => fact.key === key).source), expected, id);
  }
  const behandling = boatPetFacts["gjensidige-hund-behandling"];
  const annualSum = behandling.find(fact => fact.key === "dyr.veterinar.sum.valgbar");
  assert.equal(termsSourceHref(annualSum.qualificationSource), "/api/vilkar/gjensidige/ipid-hund#page=1");
  for (const [key, page] of [["dyr.allergi.grense", 2], ["dyr.rehabilitering.grense", 3]]) {
    const limit = behandling.find(fact => fact.key === key);
    assert.equal(termsSourceHref(limit.source), "/api/vilkar/gjensidige/hund-behandling#page=1");
    assert.equal(termsSourceHref(limit.qualificationSource), "/api/vilkar/gjensidige/hund-behandling#page=" + page);
  }
});

test("transport after damage links to the Kasko and Pluss full terms on physical pages 3 and 4", () => {
  for (const [variant, page, printedPage] of [["kasko", 3, 7], ["pluss", 4, 8]]) {
    const component = "gjensidige-bat-" + variant;
    const fact = boatPetFacts[component].find(entry => entry.key === "bat.transport.dekning");
    assert.equal(fact.value, "Inkludert ved dekningsmessig skade");
    assert.equal(fact.source.agreementScope, "ordinary");
    assert.equal(fact.source.page, page);
    assert.equal(fact.source.section, "Fritidsbåt – Hvilke skader? – Redningskostnader");
    assert.equal(termsSourceHref(fact.source), "/api/vilkar/gjensidige/bat-" + variant + "#page=" + page, "trykt side " + printedPage);
    assert.equal(beforeTransportSourceCorrection(component, fact).source.documentId, "boat-pet:gjensidige:båt");
  }
});

test("Tryg Brann/Ansvar keeps the 2024 evidence gap visible without asserting that fire is covered", () => {
  const ids = ["tryg-bat-brann-ansvar", "tryg-bat-brann-tyveri-ansvar"];
  const products = ids.map(id => productCatalog.products.find(product => product.productId === id));
  const rows = compareCatalogProducts(...products).sections.flatMap(section => section.rows);
  assert.equal(rows.find(row => row.key === "bat.brann.dekning").first.state, "unknown");
  assert.equal(rows.find(row => row.key === "bat.brann.dekning").second.state, "included");
  const explanation = rows.find(row => row.key === "bat.brann.begrensning").first;
  assert.match(explanation.text, /Brann\/Ansvar er ikke spesifisert/u);
  assert.doesNotMatch(explanation.text, /✓ Inkludert/u);
  assert.equal(explanation.sources[0].effectiveFrom, "2024-07-01");
  assert.equal(termsSourceHref(explanation.sources[0]), "/api/vilkar/tryg/ipid-bat#page=1");
  const agreement = normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Båt", productName: "Brann/Ansvar", agreementScope: "ordinary", annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds: [],
  }] }).insuranceData.insurances[0];
  assert.equal(canonicalCoverage(agreement, "Båt", "bat.brann.dekning").status, "unknown");
});

test("Tryg transport distinguishes private 2024 inboard terms from the common overview and the Extra listing", () => {
  const kasko = boatPetFacts["tryg-bat-kasko-ansvar"].find(fact => fact.key === "bat.transport.dekning");
  const extra = boatPetFacts["tryg-bat-bat-ekstra"].find(fact => fact.key === "bat.transport.dekning");
  const ipid = "/api/vilkar/tryg/ipid-bat#page=1";
  const fullTerms = "/api/vilkar/tryg/bat-kasko-innenbord-2024-07#page=3";
  for (const fact of [kasko, extra]) {
    assert.match(fact.value, /brann eller tyveri/u);
    assert.match(fact.value, /innenbordsmotor/u);
    assert.match(fact.value, /punkt 2\.1/u);
    assert.equal(fact.source.effectiveFrom, "2024-07-01");
    assert.equal(fact.qualificationSource.effectiveFrom, "2024-07-01");
  }
  assert.equal(kasko.source.termsNumber, "PFB33100");
  assert.equal(termsSourceHref(kasko.source), fullTerms);
  assert.equal(termsSourceHref(kasko.qualificationSource), ipid);
  assert.match(extra.value, /Produktarket oppgir også hjemtransport av båten/u);
  assert.equal(termsSourceHref(extra.source), ipid);
  assert.equal(termsSourceHref(extra.qualificationSource), fullTerms);
});

test("Storebrand geography specifies the countries, seasons and crossings for all three tiers from båt03", () => {
  for (const tier of ["delkasko", "kasko", "super"]) {
    const fact = boatPetFacts["storebrand-bat-" + tier].find(fact => fact.key === "bat.geografi.omrade");
    assert.match(fact.value, /Hele året i Norge, Sverige, Danmark og Finland/u);
    assert.match(fact.value, /12 nautiske mil fra grunnlinjen/u);
    assert.match(fact.value, /Skagerrak øst for linjen mellom Lindesnes og Hirtshals/u);
    assert.match(fact.value, /1\. april til 30\. september/u);
    assert.match(fact.value, /200 nautiske mil fra fastlandets grunnlinje/u);
    assert.match(fact.value, /Svalbard, Island, Storbritannia, Madeira, Azorene og Kanariøyene/u);
    assert.match(fact.value, /Rettshjelp gjelder bare i Norden/u);
    assert.doesNotMatch(fact.value, /dokumenterte overfarter/u);
    assert.equal(fact.source.termsNumber, "båt03");
    assert.equal(fact.source.effectiveFrom, "2024-09-01");
    assert.equal(fact.source.section, "3 Hvor og når forsikringen gjelder");
    assert.equal(termsSourceHref(fact.source), "/api/vilkar/storebrand/bat#page=5");
  }
});
