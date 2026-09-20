import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogFacts,
  resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/gjensidige/hus");
const product = (name, company = "Gjensidige") => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === "Hus" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, company = "Gjensidige", addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Hus", productName: name,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});

test("seks offisielle Gjensidige Hus-kilder er lokale, uendrede og registrert", async () => {
  const files = (await readdir(root)).sort();
  assert.deepEqual(files, ["Hus-Pluss-alminnelige-vilkar.pdf", "Hus-Smart-alarmvilkar.html",
    "Hus-Smart-produktside.html", "Hus-Standard-alminnelige-vilkar.pdf",
    "Husforsikring-produktside.html", "IPID-Husforsikring-EAP01.pdf"]);
  const sources = Object.values(productCatalog.sources).filter((source) =>
    source.company === "Gjensidige" && source.insuranceType === "Hus");
  assert.equal(sources.length, 6);
  assert.deepEqual(sources.map((source) => source.filename).sort(), files);
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.filename);
    assert.ok(source.documentName && source.termsNumber && source.url);
    assert.equal(source.effectiveFrom, "", "ukjent ikrafttredelsesdato skal ikke konstrueres");
  }
});

test("originaldokumentene bekrefter nivåer, arv og valgfrie utvidelser", async () => {
  const parser = new PDFParse({ data: await readFile(path.join(root, "IPID-Husforsikring-EAP01.pdf")) });
  try {
    const result = await parser.getText();
    assert.equal(result.total, 2);
    assert.match(result.text, /Hus Pluss dekker i tillegg/u);
    assert.match(result.text, /Hus standard kan utvides med dekning\s*for sopp, råte og skadeinsekter/u);
    assert.match(result.text, /Misligholdt husleie inntil 6 måneder/u);
  } finally { await parser.destroy(); }
});

test("Gjensidige viser Hus og Hus Pluss med dokumentert arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Gjensidige", "Hus"), ["Hus", "Hus Pluss"]);
  assert.deepEqual(resolveProductComponentIds(product("Hus")),
    ["gjensidigeHusIpid", "gjensidigeHusProduct", "gjensidigeHusStandard"]);
  assert.deepEqual(resolveProductComponentIds(product("Hus Pluss")),
    ["gjensidigeHusIpid", "gjensidigeHusProduct", "gjensidigeHusStandard", "gjensidigeHusPluss"]);
  assert.equal(product("Hus Pluss").inheritsProductId, "gjensidige-hus");
});

test("nivå- og tilleggsmatrisen håndheves", () => {
  assert.deepEqual(availableAddOns(product("Hus")).map((entry) => entry.id),
    ["gjensidige-hus-utleie", "gjensidige-hus-rate-insekter", "gjensidige-hus-smart"]);
  assert.deepEqual(availableAddOns(product("Hus Pluss")).map((entry) => entry.id),
    ["gjensidige-hus-utleie", "gjensidige-hus-smart"]);
  assert.throws(() => resolveCatalogFacts(product("Hus Pluss"), ["gjensidige-hus-rate-insekter"]),
    /Ugyldig/);
});

test("Hus har sentrale objekter, skader, ansvar, rettshjelp og tjenester", () => {
  const items = resolveCatalogFacts(product("Hus"), []);
  assert.deepEqual(fact(items, "hus.forsikringsform").structuredValue.forms, ["full_value", "first_loss"]);
  assert.match(fact(items, "hus.bygninger.dekning").value, /10 m²/);
  assert.match(fact(items, "hus.hage.brygge").value, /100 000/);
  for (const key of ["hus.brann.dekning", "hus.elektrisk.dekning", "hus.vann.utstromming",
    "hus.ror.brudd", "hus.ror.tining", "hus.vann.terreng", "hus.naturskade.dekning"]) assert.ok(fact(items, key), key);
  assert.match(fact(items, "hus.tilpasning.grense").value, /250 000/);
  assert.match(fact(items, "hus.gjenoppforing.totalskade").value, /75 %/);
  assert.match(fact(items, "hus.ansvar.grense").value, /5 000 000/);
  assert.match(fact(items, "hus.rettshjelp.grense").value, /100 000.*250 000/);
  assert.match(fact(items, "hus.rettshjelp.egenandel").value, /4 000.*20 %.*Mekle.no/);
  assert.match(fact(items, "hus.service.helsehjelp").value, /videolege/);
});

test("Hus Pluss erstatter grunnverdier for tak, våtrom, håndverkerfeil og råte", () => {
  const items = resolveCatalogFacts(product("Hus Pluss"), []);
  assert.match(fact(items, "hus.takvegg.folgeskade").value, /50 år/);
  assert.match(fact(items, "hus.vatrom.selverommet").value, /ti år/);
  assert.match(fact(items, "hus.handverker.folgeskade").value, /faglært/);
  assert.match(fact(items, "hus.rate.dekning").value, /råtesopper/);
  for (const key of ["hus.takvegg.folgeskade", "hus.vatrom.selverommet",
    "hus.handverker.folgeskade", "hus.rate.dekning"]) assert.equal(fact(items, key).replacesBase, true);
  const normalized = manual("Hus Pluss").insuranceData.insurances[0].importantTerms;
  assert.match(fact(normalized, "hus.rate.dekning").overriddenBase[0].value, /unntatt/);
});

test("råteutvidelsen på Hus har presis kvalifikasjonskilde og samme effektive dekning", () => {
  const items = resolveCatalogFacts(product("Hus"), ["gjensidige-hus-rate-insekter"]);
  const rot = fact(items, "hus.rate.dekning");
  assert.match(rot.value, /råtesopper/);
  assert.equal(rot.source.termsNumber, "Hus Pluss");
  assert.equal(rot.qualificationSource.termsNumber, "EAP01");
  assert.equal(rot.replacesBase, true);
});

test("utleie skiller betalingsmislighold fra leietap etter bygningsskade", () => {
  const items = resolveCatalogFacts(product("Hus"), ["gjensidige-hus-utleie"]);
  assert.match(fact(items, "hus.utleie.mislighold").value, /seks måneder/);
  assert.match(fact(items, "hus.utleie.utkastelse").value, /20 000/);
  assert.match(fact(items, "hus.utleie.egenandel").value, /10 000/);
  assert.match(fact(items, "hus.leietap.skade").value, /skilt fra betalingsmislighold/);
  assert.equal(items.some((entry) => entry.key === "hus.utleie.tyveri"), false);
});

test("Hus Smart er tilleggstjeneste med egen abonnementslogikk", () => {
  assert.equal(productSuggestions(productCatalog, "Gjensidige", "Hus").includes("Hus Smart"), false);
  const items = resolveCatalogFacts(product("Hus Pluss"), ["gjensidige-hus-smart"]);
  assert.match(fact(items, "hus.service.smart").value, /separat løpende tjenestepris/);
  assert.match(fact(items, "hus.sikkerhet.egenandelsreduksjon").value, /8 000/);
  assert.match(fact(items, "hus.service.smart.avtale").value, /leies/);
});

test("aldersfradrag er strukturert og unntak er bevart", () => {
  const items = resolveCatalogFacts(product("Hus"), []);
  const pipes = fact(items, "hus.aldersfradrag.utvendige_ledninger").structuredValue;
  assert.deepEqual({ freeYears: pipes.freeYears, annualPercent: pipes.annualPercent,
    maximumPercent: pipes.maximumPercent, yearBasis: pipes.yearBasis },
  { freeYears: 20, annualPercent: 5, maximumPercent: 80, yearBasis: "started_year" });
  assert.deepEqual(fact(items, "hus.aldersfradrag.integrerte_hvitevarer").structuredValue.exceptions,
    ["Ingen fradrag ved reparasjon"]);
});

test("Gjensidige Hus sammenlignes med Tryg, If og Storebrand uten kildelekkasje", () => {
  for (const [company, name, gjensidigeName] of [
    ["Tryg", "Hus", "Hus"], ["Tryg", "Hus Ekstra", "Hus Pluss"],
    ["If", "Basis", "Hus"], ["If", "Super", "Hus Pluss"],
    ["Storebrand", "Standard", "Hus"], ["Storebrand", "Super", "Hus Pluss"],
  ]) {
    const left = manual(name, company);
    const right = manual(gjensidigeName);
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    const terms = groupTerms(groups[0], null);
    const key = fact(terms, "hus.rate.dekning");
    assert.equal(key.firstSources[0].company, company);
    assert.equal(key.secondSources[0].company, "Gjensidige");
    assert.equal(terms.some((entry) => entry.firstSources.some((source) => source.company === "Gjensidige")), false);
    assert.ok(createDifferences(left, right, groups, null).length > 0);
  }
});

test("ingen fremtidige kilder er aktivert og Pluss dupliserer ikke råtetillegget", () => {
  const asOf = new Date("2026-09-20T12:00:00Z");
  const items = resolveCatalogFacts(product("Hus Pluss"), [], asOf);
  assert.equal(items.filter((entry) => entry.key === "hus.rate.dekning").length, 1);
  assert.equal(items.some((entry) => entry.source.effectiveFrom > "2026-09-20"), false);
  assert.equal(availableAddOns(product("Hus Pluss"), asOf).some((entry) =>
    entry.id === "gjensidige-hus-rate-insekter"), false);
});

test("runtime-kjeden beholder katalogreferanse, effective/base og provenance", () => {
  const form = new FormData();
  form.set("offerManual", JSON.stringify({ company: "Gjensidige", totalAnnualPremium: "", products: [{
    type: "Hus", productName: "Hus Pluss", annualPremium: "", deductible: "8000",
    coverageSummary: "", importantTerms: [], addOnIds: ["gjensidige-hus-smart"],
    catalogReference: { providerId: "gjensidige", productId: "gjensidige-hus-pluss", version: "Alminnelige vilkår" },
  }] }));
  const result = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const insurance = result.insuranceData.insurances[0];
  assert.equal(insurance.catalogReference.productId, "gjensidige-hus-pluss");
  assert.equal(insurance.deductible, "8000");
  assert.equal(insurance.deductibleOrigin, "customer");
  const rot = fact(insurance.importantTerms, "hus.rate.dekning");
  assert.equal(rot.sources[0].company, "Gjensidige");
  assert.equal(rot.overriddenBase[0].source.company, "Gjensidige");
  assert.ok(fact(insurance.importantTerms, "hus.service.smart"));
});

test("Bil, Innbo og Hus sameksisterer for Gjensidige", () => {
  const agreement = normalizeManualAgreement({ company: "Gjensidige", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Hus Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["gjensidige-hus-smart"] },
  ] });
  const [car, contents, house] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId.startsWith("gjensidige-hus"), false);
  assert.equal(contents.catalogReference.productId.startsWith("gjensidige-hus"), false);
  assert.equal(house.catalogReference.productId, "gjensidige-hus-pluss");
  assert.ok(fact(house.importantTerms, "hus.service.smart"));
});
