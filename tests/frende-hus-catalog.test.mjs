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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/frende/hus/canonical");
const product = (name, company = "Frende") => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === "Hus" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, company = "Frende", addOnIds = []) => normalizeManualAgreement({ company,
  totalAnnualPremium: "", products: [{ type: "Hus", productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }] });

test("fem offisielle Frende Hus-filer er lokale, uendrede og korrekt datert", async () => {
  assert.deepEqual((await readdir(root)).sort(), ["Generelle-vilkar-01012026.pdf",
    "Husforsikring-produktside.html", "IPID-Hus.pdf", "Rate-og-skadedyr-produktside.html",
    "Vilkar-husforsikring.pdf"]);
  const hashes = {
    "Generelle-vilkar-01012026.pdf": "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b",
    "Husforsikring-produktside.html": "5aec68ed77a059586988b8d715a7cc0e3d962ea926dff9ae3069956953ed685b",
    "IPID-Hus.pdf": "c2f5202eba21c605240cb9831a79be976f958135c066e6023ba9635a4fe33eaf",
    "Rate-og-skadedyr-produktside.html": "4f59805fcebb0e379af8c10760f7ea477e9b3a75f339f27f5f2a878741fc1739",
    "Vilkar-husforsikring.pdf": "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7",
  };
  for (const [filename, hash] of Object.entries(hashes))
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  const parser = new PDFParse({ data: await readFile(path.join(root, "Vilkar-husforsikring.pdf")) });
  try {
    const result = await parser.getText();
    assert.equal(result.total, 16);
    assert.match(result.text, /Vilkår av 1\. september 2026/);
    assert.match(result.text, /Hvis du har valgt standard bygningsforsikring[\s\S]*Utvidet bygningsforsikring/);
  } finally { await parser.destroy(); }
});

test("Frende Hus har Standard og dokumentert arvet Utvidet", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Frende", "Hus"), ["Standard", "Utvidet"]);
  assert.equal(product("Utvidet").inheritsProductId, "frende-hus-standard");
  assert.deepEqual(resolveProductComponentIds(product("Utvidet")),
    ["frendeHusIpid", "frendeHusGeneral", "frendeHusStandard", "frendeHusExtended"]);
  assert.equal(product("Utvidet").providerId, "frende");
});

test("begge nivåer tilbyr nøyaktig råte/skadedyr og utleie og kan kombinere dem", () => {
  for (const name of ["Standard", "Utvidet"])
    assert.deepEqual(availableAddOns(product(name)).map((entry) => entry.id),
      ["frende-hus-rate-skadedyr", "frende-hus-utleie"]);
  const both = resolveCatalogFacts(product("Utvidet"), ["frende-hus-rate-skadedyr", "frende-hus-utleie"]);
  assert.match(fact(both, "hus.rate.dekning").value, /råtesopper/);
  assert.match(fact(both, "hus.utleie.skadeverk").value, /500 000/);
  assert.equal(availableAddOns(product("Utvidet")).some((entry) => /oppføring/i.test(entry.name)), false);
});

test("Standard modellerer forsikringsbevis, form, bygninger og uteobjekter", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.avtale.forbehold").value, /forsikringsbeviset/i);
  assert.deepEqual(fact(items, "hus.forsikringsform").structuredValue.forms, ["full_value", "first_loss"]);
  assert.match(fact(items, "hus.bygninger.dekning").value, /10 m²/);
  assert.match(fact(items, "hus.ror.utvendig").value, /offentlig/);
  assert.match(fact(items, "hus.hage.objekter").value, /fem dekar/);
  assert.match(fact(items, "hus.hage.brygge").value, /100 000.*flytebrygge/);
});

test("brann, elektrisk, plutselig skade, vann og terrengvann er separate fakta", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.brann.dekning").value, /Svimerker.*unntatt/);
  for (const key of ["hus.elektrisk.dekning", "hus.eksplosjon.dekning", "hus.plutselig.dekning",
    "hus.vann.utstromming", "hus.vann.terreng", "hus.ror.brudd"]) assert.ok(fact(items, key), key);
  assert.match(fact(items, "hus.vann.terreng").value, /nedbør.*snøsmelting.*kjøving/);
});

test("gjeldende fullvilkår legger tining i Standard til tross for produktsiden", () => {
  const standard = resolveCatalogFacts(product("Standard"), []);
  const extended = resolveCatalogFacts(product("Utvidet"), []);
  assert.match(fact(standard, "hus.ror.tining").value, /50 000.*fullvilkår.*Standard/);
  assert.equal(extended.filter((entry) => entry.key === "hus.ror.tining").length, 1);
  assert.equal(fact(extended, "hus.ror.tining").source.documentId, "frendeHusStandard");
});

test("Utvidet erstatter Standard presist for tak, våtrom og håndverkerfeil", () => {
  const items = resolveCatalogFacts(product("Utvidet"), []);
  assert.match(fact(items, "hus.takvegg.folgeskade").value, /innvendig følgeskade.*Selve taket\/veggen/iu);
  assert.match(fact(items, "hus.vatrom.folgeskade").value, /andre rom/);
  assert.match(fact(items, "hus.vatrom.selverommet").value, /selve håndverkerfeilen på våtrommet/);
  assert.match(fact(items, "hus.handverker.folgeskade").value, /10 000 000.*Selve feilen dekkes bare på våtrom/);
  const normalized = manual("Utvidet").insuranceData.insurances[0].importantTerms;
  assert.ok(fact(normalized, "hus.takvegg.folgeskade").overriddenBase.length);
  assert.ok(fact(normalized, "hus.vatrom.selverommet").overriddenBase.length);
});

test("grunnskadedyr og råtetillegg har ulike scope uten duplikat", () => {
  const base = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(base, "hus.skadedyr.bygningsskade").value, /dyr.*insekter.*unntatt/iu);
  assert.match(fact(base, "hus.skadedyr.bekjempelse").value, /mus og rotter/);
  const added = resolveCatalogFacts(product("Standard"), ["frende-hus-rate-skadedyr"]);
  assert.match(fact(added, "hus.rate.dekning").value, /vannskade.*mer enn ett år/);
  assert.match(fact(added, "hus.skadedyr.bekjempelse").value, /skadeinsekter.*mus-\/rottebekjempelse/);
  assert.match(fact(added, "hus.skadedyr.bekjempelse").value, /stokkmaur.*husbukk.*veggedyr/);
  assert.equal(fact(added, "hus.skadedyr.bekjempelse").qualificationSource.documentId, "frendeHusPestPage");
  assert.equal(added.filter((entry) => entry.key === "hus.rate.dekning").length, 1);
  assert.match(fact(added, "hus.rate.egenandel").value, /6 000.*2 000/);
});

test("utleietillegget dokumenterer bare skadeverk og holder leietap separat", () => {
  const items = resolveCatalogFacts(product("Standard"), ["frende-hus-utleie"]);
  assert.match(fact(items, "hus.utleie.skadeverk").value, /500 000.*12 måneder/);
  assert.match(fact(items, "hus.utleie.vilkar").value, /forsikringsbeviset.*husleieavtale/);
  assert.match(fact(items, "hus.leietap.skade").value, /normal reparasjons/);
  for (const key of ["hus.utleie.tyveri", "hus.utleie.mislighold", "hus.utleie.utkastelse"])
    assert.equal(items.some((entry) => entry.key === key), false);
});

test("naturskade, boligtilpasning, gjenoppføring og påbud har dokumenterte grenser", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.naturskade.dekning").value, /flodbølge.*meteoritt/);
  assert.match(fact(items, "hus.tilpasning.grense").value, /250 000.*fem år.*NAV/);
  assert.match(fact(items, "hus.gjenoppforing.hovedregel").value, /fem år.*ikke en ubegrenset kontantsum/);
  assert.match(fact(items, "hus.gjenoppforing.annetsted").value, /40 %.*samme kommune/);
  assert.match(fact(items, "hus.pabud.dekning").value, /1 000 000.*25 %.*250 000/);
});

test("egenandeler og Frendes egen aldersfradragstabell er klassifisert", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.equal(fact(items, "hus.egenandel.generell").deductibleClassification, "reference");
  assert.match(fact(items, "hus.egenandel.gjentatt_skade").value, /20 000.*24 måneder/);
  assert.match(fact(items, "hus.naturskade.egenandel").value, /8 000/);
  const pipe = fact(items, "hus.aldersfradrag.utvendige_ledninger_tanker").structuredValue;
  assert.deepEqual({ freeYears: pipe.freeYears, annualPercent: pipe.annualPercent, maximumPercent: pipe.maximumPercent },
    { freeYears: 20, annualPercent: 5, maximumPercent: 80 });
  const glass = fact(resolveCatalogFacts(product("Utvidet"), []), "hus.glass.isolerglass_punktering").structuredValue;
  assert.deepEqual({ freeYears: glass.freeYears, annualPercent: glass.annualPercent }, { freeYears: 10, annualPercent: 10 });
});

test("ansvar, rettshjelp og bygg under oppføring holdes korrekt adskilt", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "hus.ansvar.grense").value, /5 000 000/);
  assert.match(fact(items, "hus.ansvar.egenandel").value, /6 000/);
  assert.match(fact(items, "hus.rettshjelp.grense").value, /100 000.*250 000.*1 000 000/);
  assert.match(fact(items, "hus.rettshjelp.egenandel").value, /6 000.*20 %.*Mekle/);
  const building = productCatalog.facts.frendeHusConstruction;
  assert.match(fact(building, "hus.byggherre.ansvar").value, /graving.*sprengning.*spunting.*riving/);
  assert.equal(items.some((entry) => entry.key.startsWith("hus.byggunderoppforing")), false);
});

test("provenance og effective/base bevarer både hovedkilde og overstyrt grunnlag", () => {
  const evidence = resolveCatalogEvidence(product("Utvidet"), ["frende-hus-rate-skadedyr"]);
  assert.ok(evidence.some((entry) => entry.source.documentId === "frendeHusStandard"));
  assert.ok(evidence.some((entry) => entry.source.documentId === "frendeHusExtended"));
  assert.ok(evidence.some((entry) => entry.source.documentId === "frendeHusRot"));
  assert.equal(evidence.some((entry) => entry.source.effectiveFrom > "2026-09-20"), false);
  const normalized = manual("Utvidet", "Frende", ["frende-hus-rate-skadedyr"])
    .insuranceData.insurances[0].importantTerms;
  assert.equal(fact(normalized, "hus.rate.dekning").source.documentId, "frendeHusRot");
  assert.equal(fact(normalized, "hus.rate.dekning").overriddenBase[0].source.documentId, "frendeHusStandard");
});

test("Frende sammenlignes mot alle fem Hus-selskaper uten selskapslekkasje", () => {
  for (const [company, name] of [["Tryg", "Hus Ekstra"], ["If", "Super"], ["Storebrand", "Super"],
    ["Gjensidige", "Hus Pluss"], ["Fremtind", "Topp"]]) {
    const left = manual(name, company);
    const right = manual("Utvidet");
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    const terms = groupTerms(groups[0], null);
    const roof = fact(terms, "hus.takvegg.folgeskade");
    assert.equal(roof.firstSources[0].company, company);
    assert.equal(roof.secondSources[0].company, "Frende");
    assert.equal(terms.some((entry) => entry.firstSources.some((source) => source.company === "Frende")), false);
    assert.ok(createDifferences(left, right, groups, null).length > 0);
  }
});

test("runtime håndterer fire tilleggskombinasjoner og Frende Bil, Innbo og Hus sammen", () => {
  for (const ids of [[], ["frende-hus-rate-skadedyr"], ["frende-hus-utleie"],
    ["frende-hus-rate-skadedyr", "frende-hus-utleie"]]) {
    const agreement = manual("Utvidet", "Frende", ids);
    assert.deepEqual(agreement.insuranceData.insurances[0].addOnIds, ids);
    const groups = groupInsurances(manual("Hus Ekstra", "Tryg").insuranceData.insurances,
      agreement.insuranceData.insurances, null);
    assert.ok(presentImportantDifferences(createDifferences(manual("Hus Ekstra", "Tryg"), agreement, groups, null),
      groups, null, "Tryg", "Frende").some((entry) => entry.termKey?.startsWith("hus.")));
  }
  const agreement = normalizeManualAgreement({ company: "Frende", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Utvidet", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Standard", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["frende-innbo-uhell"] },
    { type: "Hus", productName: "Utvidet", annualPremium: "", deductible: "6000", coverageSummary: "", importantTerms: [], addOnIds: ["frende-hus-utleie"] },
  ] });
  const [car, contents, house] = agreement.insuranceData.insurances;
  assert.equal(car.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(contents.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(house.importantTerms.some((entry) => !entry.key?.startsWith("hus.")), false);
  assert.equal(house.deductibleOrigin, "customer");
});
