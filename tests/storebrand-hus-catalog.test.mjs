import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/storebrand/hus");
const product = (name) => productCatalog.products.find((p) => p.company === "Storebrand" && p.insuranceType === "Hus" && p.name === name);
const fact = (items, key) => items.find((f) => f.key === key);
const manual = (company, name, addOnIds = [], deductible = "") => normalizeManualAgreement({ company,
  totalAnnualPremium: "", products: [{ type: "Hus", productName: name, annualPremium: "", deductible,
    coverageSummary: "", importantTerms: [], addOnIds }] });
const compare = (left, right) => { const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const raw = createDifferences(left, right, groups, null); return { terms: groupTerms(groups[0], null), raw,
    shown: presentImportantDifferences(raw, groups, null, left.insuranceData.company, right.insuranceData.company) }; };

test("fem offisielle Storebrand Hus-kilder er lokale, uendrede og registrert", async () => {
  const files = (await readdir(root)).sort();
  assert.deepEqual(files, ["Generelle-vilkar-GENER07.pdf", "Husforsikring-produktside.html", "IPID-Husforsikring.pdf",
    "Vilkar-hus-og-hytte-HUS10.pdf", "Vilkar-utleieforsikring-UTLEI03.pdf"]);
  const sources = Object.values(productCatalog.sources).filter((s) => s.company === "Storebrand" && s.insuranceType === "Hus");
  assert.equal(sources.length, 5);
  for (const source of sources) assert.equal(createHash("sha256").update(await readFile(path.join(root, source.filename))).digest("hex"), source.sha256);
  assert.equal(productCatalog.sources.storebrandHusTerms.effectiveFrom, "2025-08-15");
  assert.equal(productCatalog.sources.storebrandHusGeneral.effectiveFrom, "2026-09-01");
});

test("HUS10 bekrefter gjeldende dato og at Super er tillegg til Standard", async () => {
  const parser = new PDFParse({ data: await readFile(path.join(root, "Vilkar-hus-og-hytte-HUS10.pdf")) });
  try { const result = await parser.getText(); assert.equal(result.total, 49); assert.match(result.text, /Gjelder fra 15 august 2025/u);
    assert.match(result.text, /del A og B over, med de utvidelsen som følger av del C/u); assert.match(result.text, /HUS10/u); }
  finally { await parser.destroy(); }
});

test("Standard og Super vises med dokumentert arv og valgfri utleie", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Storebrand", "Hus"), ["Standard", "Super"]);
  assert.deepEqual(resolveProductComponentIds(product("Super")), ["storebrandHusGeneral", "storebrandHusIpid", "storebrandHusProduct", "storebrandHusStandard", "storebrandHusSuper"]);
  assert.equal(product("Super").inheritsProductId, "storebrand-hus-standard");
  assert.deepEqual(availableAddOns(product("Standard")).map((a) => a.id), ["storebrand-hus-utleie"]);
});

test("forsikringsform, bygninger, installasjoner og uteområde er strukturert", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.deepEqual(fact(items, "hus.forsikringsform").structuredValue.forms, ["full_value", "first_loss"]);
  assert.match(fact(items, "hus.bygninger.dekning").value, /forsikringsbeviset.*10 m²/);
  assert.match(fact(items, "hus.teknisk.solceller").value, /privat strømforbruk/);
  assert.match(fact(items, "hus.hage.brygge").value, /100 000/);
  assert.match(fact(items, "hus.bygninger.utsmykning").value, /500 000/);
});

test("Standard dekker brann, elektrisk, vann, rør, vær og naturskade separat", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  for (const key of ["hus.brann.dekning", "hus.elektrisk.dekning", "hus.vann.utstromming", "hus.ror.brudd",
    "hus.vann.terreng", "hus.vaer.dekning", "hus.naturskade.dekning"]) assert.ok(fact(items, key), key);
  assert.match(fact(items, "hus.vann.terreng").value, /snøsmelting/);
  assert.equal(fact(items, "hus.naturskade.egenandel").deductibleClassification, "override");
});

test("Super erstatter Standard for tak, våtrom, håndverkerfeil, råte og fysisk skadedyrskade", () => {
  const items = resolveCatalogFacts(product("Super"), []);
  for (const key of ["hus.takvegg.folgeskade", "hus.vatrom.folgeskade", "hus.vatrom.selverommet",
    "hus.handverker.folgeskade", "hus.rate.dekning", "hus.skadedyr.bygningsskade"]) assert.equal(fact(items, key).replacesBase, true, key);
  assert.match(fact(items, "hus.takvegg.folgeskade").value, /50 år/);
  assert.match(fact(items, "hus.handverker.folgeskade").value, /ti år/);
  assert.match(fact(items, "hus.vann.vannstopper").value, /6 000/);
});

test("effective/base beholder Storebrands underliggende Standard-fakta", () => {
  const terms = manual("Storebrand", "Super").insuranceData.insurances[0].importantTerms;
  for (const key of ["hus.takvegg.folgeskade", "hus.vatrom.folgeskade", "hus.handverker.folgeskade", "hus.rate.dekning"]) {
    assert.ok(fact(terms, key).overriddenBase.length > 0, key);
    assert.equal(fact(terms, key).overriddenBase.every((b) => b.source.company === "Storebrand"), true);
  }
});

test("bekjempelse og fysisk skade er separate, og utleie krever valgt tillegg", () => {
  const base = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(base, "hus.skadedyr.bekjempelse").value, /skjeggkre/);
  assert.match(fact(base, "hus.skadedyr.bygningsskade").value, /rotter og mus/);
  assert.equal(fact(base, "hus.utleie.mislighold"), undefined);
  const selected = resolveCatalogFacts(product("Super"), ["storebrand-hus-utleie"]);
  assert.match(fact(selected, "hus.utleie.mislighold").value, /seks måneders/);
  assert.match(fact(selected, "hus.utleie.tyveri").value, /500 000/);
  assert.match(fact(selected, "hus.utleie.vilkar").value, /forsikringsbeviset/);
  assert.match(fact(selected, "hus.leietap.skade").value, /Skilles fra.*betalingsmislighold/);
});

test("kundens egenandel, særregler og aldersfradrag holdes separate", () => {
  const insurance = manual("Storebrand", "Super", [], "12000").insuranceData.insurances[0];
  assert.equal(insurance.deductible, "12000"); assert.equal(insurance.deductibleOrigin, "customer");
  assert.equal(fact(insurance.importantTerms, "hus.egenandel.generell").deductibleClassification, "reference");
  assert.equal(fact(insurance.importantTerms, "hus.vann.egenandel").deductibleClassification, "override");
  const age = fact(insurance.importantTerms, "hus.aldersfradrag.utvendige_ror").structuredValue;
  assert.deepEqual({ freeYears: age.freeYears, annualPercent: age.annualPercent, maximumPercent: age.maximumPercent }, { freeYears: 20, annualPercent: 5, maximumPercent: 80 });
});

test("gjenoppføring, påbud, klimatiltak og boligtilpasning har dokumenterte grenser", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.gjenoppforing.hovedregel").value, /fem år/);
  assert.match(fact(items, "hus.gjenoppforing.markedsverdi").value, /1 000 000/);
  assert.match(fact(items, "hus.pabud.grense").value, /1 000 000/);
  assert.match(fact(items, "hus.gjenoppforing.klima").value, /150 000.*75 %/);
  assert.match(fact(items, "hus.tilpasning.grense").value, /500 000.*50 %/);
});

test("ansvar og rettshjelp har geografi, summer, trinn og egenandeler", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.ansvar.dekning").value, /Norden/); assert.match(fact(items, "hus.ansvar.grense").value, /5 000 000/);
  assert.match(fact(items, "hus.ansvar.egenandel").value, /4 000/);
  assert.match(fact(items, "hus.rettshjelp.grense").value, /250 000.*500 000.*750 000.*1 000 000/);
  assert.match(fact(items, "hus.rettshjelp.egenandel").value, /4 000.*20 %/);
});

test("bygg under oppføring og tjenester er reelle fakta uten kunstig tillegg", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.byggunderoppforing").value, /50 000.*100 000.*3 millioner/);
  assert.match(fact(items, "hus.service.psykolog").value, /10 behandlingstimer/);
  assert.match(fact(items, "hus.service.vilkarsgaranti").value, /to år/);
  assert.equal(availableAddOns(product("Standard")).some((a) => /bygg/iu.test(a.name)), false);
});

test("ingen fremtidige kilder aktiveres per skjæringsdato", () => {
  const evidence = resolveCatalogEvidence(product("Super"), ["storebrand-hus-utleie"], new Date("2026-09-20T12:00:00Z"));
  assert.equal(evidence.some((e) => e.source.effectiveFrom > "2026-09-20"), false);
  assert.equal(evidence.some((e) => e.source.documentId === "storebrandHusRental"), true);
});

for (const [leftCompany, leftName, rightName] of [["Tryg", "Hus", "Standard"], ["Tryg", "Hus Ekstra", "Super"],
  ["If", "Basis", "Standard"], ["If", "Super", "Super"]]) {
  test(`${leftCompany} ${leftName} sammenlignes kildeisolert mot Storebrand ${rightName}`, () => {
    const result = compare(manual(leftCompany, leftName), manual("Storebrand", rightName));
    const water = fact(result.terms, "hus.vann.utstromming");
    assert.equal(water.firstSources.every((s) => s.company === leftCompany), true);
    assert.equal(water.secondSources.every((s) => s.company === "Storebrand"), true);
    assert.equal(result.terms.some((t) => t.firstSources.some((s) => s.company === "Storebrand")), false);
    assert.equal(result.terms.some((t) => t.secondSources.some((s) => s.company === leftCompany)), false);
    assert.ok(result.shown.some((d) => d.termKey?.startsWith("hus.")));
  });
}

test("runtime-kjeden beholder produkt, tillegg, effective/base og provenance", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company: "Storebrand", totalAnnualPremium: "", products: [{ type: "Hus", productName: "Standard", annualPremium: "", deductible: "10000", coverageSummary: "", importantTerms: [], addOnIds: [] }] }));
  form.set("offerManual", JSON.stringify({ company: "Storebrand", totalAnnualPremium: "", products: [{ type: "Hus", productName: "Super", annualPremium: "", deductible: "8000", coverageSummary: "", importantTerms: [], addOnIds: ["storebrand-hus-utleie"] }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual"))); const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right); const house = right.insuranceData.insurances[0];
  assert.equal(house.catalogReference.productId, "storebrand-hus-super"); assert.deepEqual(house.addOnIds, ["storebrand-hus-utleie"]);
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").secondSources[0].termsNumber, "HUS10 / 45511h");
  assert.ok(fact(result.terms, "hus.vatrom.folgeskade").secondBaseFacts.length > 0);
  assert.ok(result.shown.some((d) => d.termKey === "hus.vatrom.folgeskade"));
});

test("Bil, Innbo og Hus sameksisterer uten katalog- eller tilleggsmiks", () => {
  const a = normalizeManualAgreement({ company: "Storebrand", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["storebrand-hus-utleie"] },
  ] });
  const [car, contents, house] = a.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "sb-bil-super"); assert.equal(contents.catalogReference.productId, "sb-innbo-super");
  assert.equal(house.catalogReference.productId, "storebrand-hus-super"); assert.equal(car.importantTerms.some((t) => t.key?.startsWith("hus.")), false);
  assert.equal(contents.importantTerms.some((t) => t.key?.startsWith("hus.")), false); assert.equal(house.importantTerms.some((t) => !t.key?.startsWith("hus.")), false);
});
