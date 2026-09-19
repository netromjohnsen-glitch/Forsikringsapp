import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/frende/innbo");
const product = (company, name, type = "Innbo") => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === type && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const input = (company, name, type = "Innbo", addOnIds = []) => ({
  company, totalAnnualPremium: "", products: [{ type, productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
});
const manual = (company, name, type = "Innbo", addOnIds = []) =>
  normalizeManualAgreement(input(company, name, type, addOnIds));
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const raw = createDifferences(left, right, groups, null);
  return { groups, raw, terms: groupTerms(groups.find((group) => group.key === "innbo"), null),
    shown: presentImportantDifferences(raw, groups, null, left.insuranceData.company, right.insuranceData.company) };
};
const pdfText = async (filename) => {
  const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
};

test("offisielle Frende Innbo-kilder er lokale, uendrede og har korrekt datosemantikk", async () => {
  const expected = {
    "Vilkar_innboforsikring_01092026.pdf": "608a09ff2513ac8756bd3cb12736a4d04e3dce51b87ca4a986c47b5ab2bc12db",
    "IPID_Innbo.pdf": "9aef7acd6b6f80c8ebea822ec9a8a9613e37a0d67e2bb37a5fbb665c53ae5057",
    "Generelle_vilkar-01012026.pdf": "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b",
  };
  for (const [filename, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  }
  const terms = await pdfText("Vilkar_innboforsikring_01092026.pdf");
  const ipid = await pdfText("IPID_Innbo.pdf");
  const general = await pdfText("Generelle_vilkar-01012026.pdf");
  assert.equal(terms.total, 14);
  assert.match(terms.text, /Vilkår av 1\. september 2026/);
  assert.match(ipid.text, /Sist oppdatert: 01\.01\.2025/);
  assert.match(general.text, /Vilkår av 01\. januar 2026/);
  assert.equal(productCatalog.sources.frendeInnboIpid.effectiveFrom, "Ikke oppgitt");
  assert.equal(productCatalog.sources.frendeInnboIpid.updatedAt, "2025-01-01");
  assert.equal(productCatalog.sources.frendeInnboStandard.termsNumber, "Ikke oppgitt");
});

test("Frende Innbo er Standard med Uhellsdekning som valgfritt tillegg", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Frende", "Innbo"), ["Standard"]);
  const standard = product("Frende", "Standard");
  assert.deepEqual(availableAddOns(standard).map((entry) => entry.id), ["frende-innbo-uhell"]);
  assert.deepEqual(availableAddOns(product("Frende", "Utvidet", "Bil")).map((entry) => entry.id),
    ["frende-leiebil", "frende-maskinskade"]);
  assert.equal(availableAddOns(standard).some((entry) => entry.id.startsWith("frende-") && !entry.id.startsWith("frende-innbo")), false);
});

test("forsikringssum representerer både ubegrenset og kundespesifikt valg uten å fjerne særgrenser", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "innbo.forsikringssum").value, /Ubegrenset/);
  assert.match(fact(standard, "innbo.forsikringssum").value, /forsikringsbeviset/);
  assert.equal(fact(standard, "innbo.forsikringssum").deductibleClassification, "reference");
  for (const [key, value] of [["innbo.penger.grense", "20 000 kr"],
    ["innbo.fritidsbat.grense", "40 000 kr"], ["innbo.kjoretoytilbehor.grense", "40 000 kr"],
    ["innbo.verdigjenstander.grense", "500 000 kr"]]) assert.match(fact(standard, key).value, new RegExp(value));
});

test("husstand, geografi og midlertidig oppbevaring følger fullvilkåret", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "innbo.forsikrede").value, /leietakere og bokollektiv er unntatt/);
  assert.match(fact(standard, "innbo.geografi").value, /Norden/);
  assert.match(fact(standard, "innbo.geografi").value, /12 måneder/);
  assert.match(fact(standard, "innbo.lagring.tid").value, /12 måneder/);
  assert.equal(fact(standard, "ansvar.geografi").value, "Norden");
  assert.equal(fact(standard, "rettshjelp.geografi").value, "Norden");
});

test("brann, vann, natur, tyveri, bod og uteareal er separate kildebaserte konsepter", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "brann.dekning").value, /nedsoting/);
  assert.match(fact(standard, "vann.dekning").value, /terreng/);
  assert.match(fact(standard, "naturskade.dekning").value, /meteorittnedslag/);
  assert.match(fact(standard, "tyveri.dekning").value, /oppbevaringsavhengige grenser/);
  assert.equal(fact(standard, "tyveri.fellesbod.grense").value, "100 000 kr");
  assert.equal(fact(standard, "tyveri.uteareal.grense").value, "40 000 kr");
});

test("sykkel og liten elektrisk motorvogn holdes faglig adskilt", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "sykkel.tyveri.grense").value, /40 000 kr per sykkel/);
  assert.match(fact(standard, "sykkel.tyveri.grense").value, /Ubegrenset i bygning/);
  assert.match(fact(standard, "elsparkesykkel.unntak").value, /ikke omfattet som innbo/);
  assert.equal(fact(standard, "sykkel.egenandel").deductibleClassification, "coverage");
});

test("skadedyr, ID-sikring og nettmisbruk bevarer ulik semantikk", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "skadedyr.dekning").value, /rotter og mus/);
  assert.equal(fact(standard, "skadedyr.grense").value, "150 000 kr per skadetilfelle");
  assert.equal(fact(standard, "skadedyr.egenandel").value, "2 000 kr per skade");
  assert.match(fact(standard, "idtyveri.dekning").value, /økonomisk tap.*unntatt/);
  assert.match(fact(standard, "nettmisbruk.dekning").value, /falske profiler/);
  assert.notEqual(fact(standard, "idtyveri.dekning").key, fact(standard, "nettmisbruk.dekning").key);
});

test("Uhellsdekning gir hjemme-, ute- og flytteverdier uten å oppfinne sykkeluhell", () => {
  const withAddOn = resolveCatalogFacts(product("Frende", "Standard"), ["frende-innbo-uhell"]);
  assert.match(fact(withAddOn, "uhell.hjem.grense").value, /Ubegrenset/);
  assert.equal(fact(withAddOn, "uhell.grense").value, "40 000 kr");
  assert.match(fact(withAddOn, "uhell.geografi").value, /Hele verden/);
  assert.match(fact(withAddOn, "flytting.transport.grense").value, /100 000 kr/);
  assert.match(fact(withAddOn, "uhell.unntak").value, /sykkel\/elsykkel/);
  assert.equal(fact(withAddOn, "sykkel.uhell.grense"), undefined);
});

test("Uhell er en ny effektiv dekning og alle base- og tilleggskilder beholdes", () => {
  const agreement = manual("Frende", "Standard", "Innbo", ["frende-innbo-uhell"]);
  const insurance = agreement.insuranceData.insurances[0];
  assert.deepEqual(insurance.addOnIds, ["frende-innbo-uhell"]);
  assert.equal(insurance.addOns[0].name, "Uhellsdekning");
  assert.equal(fact(insurance.importantTerms, "uhell.grense").source.documentId, "frendeInnboUhell");
  assert.deepEqual(fact(insurance.importantTerms, "uhell.grense").overriddenBase, []);
  assert.equal(fact(insurance.importantTerms, "innbo.forsikringssum").source.documentId, "frendeInnboStandard");
});

test("ansvar, rettshjelp, merutgifter og data har dokumenterte grenser", () => {
  const standard = resolveCatalogFacts(product("Frende", "Standard"), []);
  assert.match(fact(standard, "ansvar.grense").value, /5 000 000 kr/);
  assert.equal(fact(standard, "ansvar.egenandel").value, "6 000 kr per skadetilfelle");
  assert.match(fact(standard, "rettshjelp.grense").value, /1 000 000 kr/);
  assert.match(fact(standard, "rettshjelp.egenandel").value, /20 %/);
  assert.match(fact(standard, "innbo.opphold.grense").value, /normal reparasjons-/);
  assert.equal(fact(standard, "innbo.datalager.grense").value, "30 000 kr");
});

test("egenandeler skiller bevisstyrt verdi og sikre særverdier", () => {
  const evidence = resolveCatalogEvidence(product("Frende", "Standard"), ["frende-innbo-uhell"]);
  assert.equal(fact(evidence, "innbo.egenandel").deductibleClassification, "reference");
  for (const key of ["naturskade.egenandel", "skadedyr.egenandel", "ansvar.egenandel",
    "rettshjelp.egenandel", "uhell.egenandel"]) assert.equal(fact(evidence, key).deductibleClassification, "override", key);
  assert.equal(fact(evidence, "sykkel.egenandel").deductibleClassification, "coverage");
});

test("Frende kan sammenlignes mot fem andre Innbo-kataloger uten selskapsspesifikk motor", () => {
  for (const [company, base, top] of [["Tryg", "Innbo", "Innbo Ekstra"], ["If", "Basis", "Super"],
    ["Gjensidige", "Innbo", "Innbo Pluss"], ["Storebrand", "Standard", "Super"],
    ["Fremtind", "Innbo", "Innbo Pluss"]]) {
    for (const [name, addOns] of [[base, []], [top, ["frende-innbo-uhell"]]]) {
      const result = compare(manual(company, name), manual("Frende", "Standard", "Innbo", addOns));
      for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "tyveri.fellesbod.grense",
        "tyveri.uteareal.grense", "ansvar.dekning", "rettshjelp.grense"]) {
        assert.ok(fact(result.terms, key)?.first, `${company}:${name}:${key}:first`);
        assert.ok(fact(result.terms, key)?.second, `${company}:${name}:${key}:second`);
      }
      assert.ok(result.shown.some((entry) => entry.insuranceKey === "innbo"), `${company}:${name}:presentation`);
    }
  }
});

test("UI-formet runtime beholder Uhell gjennom katalog, comparison og presentation", () => {
  for (const [company, name] of [["Tryg", "Innbo Ekstra"], ["Storebrand", "Super"],
    ["Fremtind", "Innbo Pluss"]]) {
    const form = new FormData();
    form.set("existingManual", JSON.stringify(input(company, name)));
    const offer = input("Frende", "Standard", "Innbo", ["frende-innbo-uhell"]);
    offer.products[0].catalogReference = { providerId: "frende", productId: "frende-innbo-standard",
      version: "2026-09-01" };
    form.set("offerManual", JSON.stringify(offer));
    const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
    const result = compare(normalizeManualAgreement(JSON.parse(form.get("existingManual"))), right);
    assert.deepEqual(right.insuranceData.insurances[0].addOnIds, ["frende-innbo-uhell"]);
    assert.equal(fact(result.terms, "uhell.grense").second, "40 000 kr");
    assert.ok(result.shown.some((entry) => entry.insuranceKey === "innbo"));
  }
});

test("Frende Bil og Innbo i samme avtale holder produkter, tillegg og kilder adskilt", () => {
  const agreement = normalizeManualAgreement({ company: "Frende", totalAnnualPremium: "", products: [
    input("Frende", "Utvidet", "Bil", ["frende-leiebil"]).products[0],
    input("Frende", "Standard", "Innbo", ["frende-innbo-uhell"]).products[0],
  ] });
  const [car, contents] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "frende-bil-utvidet");
  assert.equal(contents.catalogReference.productId, "frende-innbo-standard");
  assert.ok(car.importantTerms.some((entry) => entry.key === "leiebil.dager"));
  assert.equal(car.importantTerms.some((entry) => entry.key === "uhell.grense"), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "uhell.grense"));
  assert.equal(contents.importantTerms.some((entry) => entry.key === "leiebil.dager"), false);
  assert.ok(contents.importantTerms.every((entry) => entry.source.company === "Frende"));
});

test("Innbo-prioritering fremhever materielle grenser uten å skjule ansvar og rettshjelp", () => {
  const result = compare(manual("Gjensidige", "Innbo Pluss"),
    manual("Frende", "Standard", "Innbo", ["frende-innbo-uhell"]));
  const top = result.shown.filter((entry) => entry.insuranceKey === "innbo")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  assert.ok(top.some((entry) => entry.termKey === "innbo.forsikringssum"));
  assert.ok(top.some((entry) => entry.termKey?.startsWith("uhell.")));
  assert.ok(!top.some((entry) => entry.termKey?.startsWith("rettshjelp.")));
  assert.ok(result.shown.some((entry) => entry.termKey === "rettshjelp.grense"));
});
