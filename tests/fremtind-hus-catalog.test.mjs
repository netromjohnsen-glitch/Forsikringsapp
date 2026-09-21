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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/fremtind/hus/canonical");
const product = (name, company = "Fremtind") => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === "Hus" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, company = "Fremtind", distributionChannel = "", addOnIds = []) =>
  normalizeManualAgreement({ company, distributionChannel, totalAnnualPremium: "", products: [{ type: "Hus",
    productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }] });

test("fire produktfiler og tre kanaloversikter er lokale, uendrede og registrert", async () => {
  const files = (await readdir(root)).sort();
  assert.deepEqual(files, ["DNB-husforsikring.html", "Eika-vilkarsoversikt.html", "IPID_Hus.pdf",
    "SpareBank1-husforsikring.html", "Vilkar_Sopp_og_Rate_valgbar.pdf",
    "Vilkar_Topp_Hus.pdf", "Vilkar_Utleie_valgbar.pdf"]);
  const sources = Object.values(productCatalog.sources).filter((source) =>
    source.company === "Fremtind" && source.insuranceType === "Hus");
  assert.equal(sources.length, 8, "standard og topp er separate logiske kilder i samme PDF");
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
    assert.ok(source.distributionChannels?.length);
  }
  assert.equal(productCatalog.sources.fremtindHusStandard.termsNumber, "PBK-200.100-015");
  assert.equal(productCatalog.sources.fremtindHusTopp.termsNumber, "PBK-200.200-010");
  assert.equal(productCatalog.sources.fremtindHusIpid.termsNumber, "V.103");
  assert.equal(productCatalog.sources.fremtindHusEikaChannel.effectiveFrom, "2025-10-13");
});

test("fullvilkår og IPID dokumenterer Standard, Topp og arv", async () => {
  const parser = new PDFParse({ data: await readFile(path.join(root, "Vilkar_Topp_Hus.pdf")) });
  try {
    const result = await parser.getText();
    assert.equal(result.total, 13);
    assert.match(result.text, /Topp bygningsforsikring Vilkårs id: PBK-200\.200-010/u);
    assert.match(result.text, /I tillegg til standardvilkårets punkt 4\.2/u);
    assert.match(result.text, /Standard bygningsforsikring Vilkårs id: PBK-200\.100-015/u);
  } finally { await parser.destroy(); }
});

test("Fremtind er provider og kanalene lager ikke dupliserte Hus-produkter", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Hus"), ["Standard", "Topp"]);
  assert.equal(productCatalog.products.some((entry) => entry.insuranceType === "Hus" &&
    ["Eika / Fremtind", "DNB / Fremtind", "SpareBank 1 / Fremtind"].includes(entry.company)), false);
  assert.deepEqual(resolveProductComponentIds(product("Topp")),
    ["fremtindHusIpid", "fremtindHusStandard", "fremtindHusTopp"]);
  assert.equal(product("Topp").inheritsProductId, "fremtind-hus-standard");
});

test("Eika, SpareBank 1, DNB og ukjent kanal løser samme canonical produkt", () => {
  const fingerprints = ["Eika", "SpareBank 1", "DNB", ""].map((channel) =>
    manual("Topp", "Fremtind", channel).insuranceData.insurances[0].importantTerms
      .map((entry) => `${entry.key}:${entry.value}`).sort());
  for (const current of fingerprints.slice(1)) assert.deepEqual(current, fingerprints[0]);
  for (const channel of ["Eika", "SpareBank 1", "DNB", ""]) {
    assert.deepEqual(availableAddOns(product("Topp"), new Date("2026-09-20T12:00:00Z"), channel || null)
      .map((entry) => entry.id), ["fremtind-hus-rate-insekter", "fremtind-hus-utleie"]);
  }
});

test("Standard modellerer forsikringsbevis, form, objekter og grunnskader", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.avtale.forbehold").value, /forsikringsbeviset/i);
  assert.deepEqual(fact(items, "hus.forsikringsform").structuredValue.forms, ["full_value", "first_loss"]);
  assert.match(fact(items, "hus.bygninger.dekning").value, /10 m².*brann- og naturskade/);
  assert.match(fact(items, "hus.hage.basseng").value, /200 000/);
  assert.match(fact(items, "hus.hage.brygge").value, /100 000/);
  for (const key of ["hus.brann.dekning", "hus.elektrisk.dekning", "hus.vann.utstromming",
    "hus.ror.brudd", "hus.ror.tining", "hus.vann.terreng", "hus.naturskade.dekning"]) assert.ok(fact(items, key), key);
});

test("Topp erstatter Standard for tak, våtrom, håndverkerfeil og skadedyr", () => {
  const items = resolveCatalogFacts(product("Topp"), []);
  assert.match(fact(items, "hus.takvegg.folgeskade").value, /50 år/);
  assert.match(fact(items, "hus.vatrom.selverommet").value, /ti år/);
  assert.match(fact(items, "hus.handverker.folgeskade").value, /konkurs/);
  assert.match(fact(items, "hus.skadedyr.bygningsskade").value, /svekket isolasjonsevne/);
  assert.match(fact(items, "hus.skadedyr.bekjempelse").value, /velger metode/);
  for (const key of ["hus.takvegg.folgeskade", "hus.vatrom.selverommet",
    "hus.handverker.folgeskade", "hus.skadedyr.bygningsskade"]) assert.equal(fact(items, key).replacesBase, true);
  const normalized = manual("Topp").insuranceData.insurances[0].importantTerms;
  assert.match(fact(normalized, "hus.takvegg.folgeskade").overriddenBase[0].value, /unntatt/);
});

test("råte/insekter er ett separat tillegg på begge nivåer uten å duplisere Topp-skadedyr", () => {
  for (const name of ["Standard", "Topp"]) {
    const items = resolveCatalogFacts(product(name), ["fremtind-hus-rate-insekter"]);
    assert.match(fact(items, "hus.rate.dekning").value, /ekte hussopp/);
    assert.match(fact(items, "hus.skadedyr.bygningsskade").value, /insekter/);
    assert.equal(items.filter((entry) => entry.key === "hus.skadedyr.bygningsskade").length, 1);
    assert.match(fact(items, "hus.rate.egenandel").value, /15 000/);
    assert.match(fact(items, "hus.skadedyr.egenandel").value, /2 000/);
  }
});

test("utleietillegget skiller mislighold fra ordinært bygningsskadeleietap", () => {
  const items = resolveCatalogFacts(product("Topp"), ["fremtind-hus-utleie"]);
  assert.match(fact(items, "hus.utleie.mislighold").value, /seks måneders/);
  assert.match(fact(items, "hus.utleie.utkastelse").value, /20 000/);
  assert.match(fact(items, "hus.utleie.skadeverk").value, /500 000/);
  assert.match(fact(items, "hus.utleie.egenandel").value, /Tre måneders.*30 000/);
  assert.match(fact(items, "hus.leietap.skade").value, /bygningsskade/);
  assert.equal(items.some((entry) => entry.key === "hus.utleie.tyveri"), false);
});

test("gjenoppføring, påbud og Topp-totalskade har dokumenterte grenser", () => {
  const standard = resolveCatalogFacts(product("Standard"), []);
  const topp = resolveCatalogFacts(product("Topp"), []);
  assert.match(fact(standard, "hus.gjenoppforing.hovedregel").value, /fem år/);
  assert.match(fact(standard, "hus.gjenoppforing.markedsverdi").value, /1 000 000/);
  assert.match(fact(standard, "hus.pabud.dekning").value, /20 %/);
  assert.match(fact(topp, "hus.gjenoppforing.totalskade").value, /75 %.*to år/);
  assert.equal(topp.some((entry) => entry.key === "hus.tilpasning.grense"), false,
    "boligtilpasning etter personskade er ikke dokumentert i Hus-kilden");
});

test("egenandeler og aldersfradrag er klassifisert separat", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.equal(fact(items, "hus.egenandel.generell").deductibleClassification, "reference");
  assert.match(fact(items, "hus.vann.egenandel.gjentatt_vann").value, /20 000.*24 måneder/);
  assert.match(fact(items, "hus.naturskade.egenandel").value, /8 000/);
  const solar = fact(items, "hus.aldersfradrag.solceller").structuredValue;
  assert.deepEqual({ freeYears: solar.freeYears, annualPercent: solar.annualPercent,
    maximumPercent: solar.maximumPercent, yearBasis: solar.yearBasis },
  { freeYears: 20, annualPercent: 5, maximumPercent: 80, yearBasis: "started_year" });
  assert.equal(fact(items, "hus.aldersfradrag.solceller").deductibleClassification, undefined);
});

test("ansvar og rettshjelp har riktig rolle, summer og egenandeler", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.ansvar.dekning").value, /eier/);
  assert.match(fact(items, "hus.ansvar.grense").value, /5 000 000.*forsikringsbevis/);
  assert.match(fact(items, "hus.ansvar.egenandel").value, /4 000/);
  assert.match(fact(items, "hus.rettshjelp.grense").value, /100 000.*250 000/);
  assert.match(fact(items, "hus.rettshjelp.egenandel").value, /4 000.*20 %/);
});

test("ingen fremtidige kilder eller udokumenterte kanaloverrides aktiveres", () => {
  const evidence = resolveCatalogEvidence(product("Topp"), ["fremtind-hus-utleie"],
    new Date("2026-09-20T12:00:00Z"), "Eika");
  assert.equal(evidence.some((entry) => /^\d{4}-\d{2}/u.test(entry.source.effectiveFrom) &&
    entry.source.effectiveFrom > "2026-09-20"), false);
  assert.equal(productCatalog.addOns.some((entry) => entry.providerId === "fremtind" &&
    entry.insuranceTypes?.includes("Hus") && entry.distributionChannels), false);
  assert.equal(availableAddOns(product("Topp")).some((entry) => /bygg/i.test(entry.name)), false);
});

test("Fremtind sammenlignes mot alle fire eksisterende Hus-selskaper uten kildemiks", () => {
  for (const [company, name] of [["Tryg", "Hus Ekstra"], ["If", "Super"],
    ["Storebrand", "Super"], ["Gjensidige", "Hus Pluss"]]) {
    const left = manual(name, company);
    const right = manual("Topp", "Fremtind", "SpareBank 1");
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    const terms = groupTerms(groups[0], null);
    const roof = fact(terms, "hus.takvegg.folgeskade");
    assert.equal(roof.firstSources[0].company, company);
    assert.equal(roof.secondSources[0].company, "Fremtind");
    assert.equal(terms.some((entry) => entry.firstSources.some((source) => source.company === "Fremtind")), false);
    assert.ok(createDifferences(left, right, groups, null).length > 0);
  }
});

test("runtime flyter gjennom kanal, tillegg, effective/base og presentasjon", () => {
  const form = new FormData();
  form.set("offerManual", JSON.stringify({ company: "Fremtind", distributionChannel: "Eika",
    totalAnnualPremium: "", products: [{ type: "Hus", productName: "Topp", annualPremium: "",
      deductible: "6000", coverageSummary: "", importantTerms: [],
      addOnIds: ["fremtind-hus-rate-insekter", "fremtind-hus-utleie"],
      catalogReference: { providerId: "fremtind", productId: "fremtind-hus-topp",
        version: "PBK-200.100-015+PBK-200.200-010" } }] }));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const left = manual("Hus", "Gjensidige");
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const differences = createDifferences(left, right, groups, null);
  const shown = presentImportantDifferences(differences, groups, null, "Gjensidige", "Fremtind");
  const insurance = right.insuranceData.insurances[0];
  assert.equal(right.insuranceData.distributionChannel, "Eika");
  assert.equal(insurance.catalogReference.productId, "fremtind-hus-topp");
  assert.equal(insurance.deductibleOrigin, "customer");
  assert.ok(fact(insurance.importantTerms, "hus.rate.dekning"));
  assert.ok(fact(insurance.importantTerms, "hus.takvegg.folgeskade").overriddenBase.length);
  assert.ok(shown.some((entry) => entry.termKey?.startsWith("hus.")));
});

test("Fremtind Bil, Innbo og Hus beholder kanal og typeisolasjon", () => {
  const agreement = normalizeManualAgreement({ company: "Fremtind", distributionChannel: "DNB",
    totalAnnualPremium: "", products: [
      { type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
      { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
      { type: "Hus", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["fremtind-hus-utleie"] },
    ] });
  const [car, contents, house] = agreement.insuranceData.insurances;
  assert.equal(agreement.insuranceData.distributionChannel, "DNB");
  assert.equal(car.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(contents.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(house.importantTerms.some((entry) => !entry.key?.startsWith("hus.")), false);
  assert.deepEqual(house.addOnIds, ["fremtind-hus-utleie"]);
});
