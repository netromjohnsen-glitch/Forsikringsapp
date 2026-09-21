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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/if/hus");
const product = (name) => productCatalog.products.find((entry) =>
  entry.company === "If" && entry.insuranceType === "Hus" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, deductible = "", company = "If", addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Hus", productName: name,
    annualPremium: "", deductible, coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  return { groups, terms: groupTerms(groups[0], null), raw: createDifferences(left, right, groups, null),
    shown: presentImportantDifferences(createDifferences(left, right, groups, null), groups, null,
      left.insuranceData.company, right.insuranceData.company) };
};

test("fem offisielle If Hus-kilder er lokale, uendrede og registrert", async () => {
  const files = (await readdir(root)).sort();
  assert.deepEqual(files, ["Bygningsforsikring.pdf", "Generelle-vilkar-privat.pdf",
    "Husforsikring-produktside.html", "IPID-Husforsikring.pdf", "Rettshjelp-og-ansvarsforsikring.pdf"]);
  const sources = Object.values(productCatalog.sources).filter((source) =>
    source.company === "If" && source.insuranceType === "Hus");
  assert.equal(sources.length, 5);
  assert.deepEqual(sources.map((source) => source.filename).sort(), files);
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.filename);
    assert.ok(source.documentName && source.termsNumber && source.url);
  }
  assert.equal(productCatalog.sources.ifHusTerms.effectiveFrom, "2023-09");
  assert.equal(productCatalog.sources.ifHusLiability.effectiveFrom, "2021-06");
});

test("fullvilkåret bekrefter nivåarv og sentrale nivåforskjeller", async () => {
  const parser = new PDFParse({ data: await readFile(path.join(root, "Bygningsforsikring.pdf")) });
  try {
    const result = await parser.getText();
    assert.equal(result.total, 25);
    assert.match(result.text, /Utvidet og Super er dekningsnivåer som dekker mer enn\s*Basis/u);
    assert.match(result.text, /Sopp og råte \(kun for Utvidet og Super\)/u);
    assert.match(result.text, /Skade som følge av håndverkerfeil \(kun for Super\)/u);
    assert.match(result.text, /Gjelder fra september 2023/u);
  } finally { await parser.destroy(); }
});

test("If viser Basis, Utvidet og Super med dokumentert arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "If", "Hus"), ["Basis", "Utvidet", "Super"]);
  assert.deepEqual(resolveProductComponentIds(product("Basis")),
    ["ifHusGeneral", "ifHusIpid", "ifHusLiability", "ifHusBasis"]);
  assert.deepEqual(resolveProductComponentIds(product("Utvidet")),
    ["ifHusGeneral", "ifHusIpid", "ifHusLiability", "ifHusBasis", "ifHusExtended"]);
  assert.deepEqual(resolveProductComponentIds(product("Super")),
    ["ifHusGeneral", "ifHusIpid", "ifHusLiability", "ifHusBasis", "ifHusExtended", "ifHusSuper"]);
  assert.equal(product("Utvidet").inheritsProductId, "if-hus-basis");
  assert.equal(product("Super").inheritsProductId, "if-hus-utvidet");
  assert.deepEqual(availableAddOns(product("Super")), []);
});

test("Basis strukturerer bygning, fullverdi/førsterisiko og sentrale skader", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  assert.deepEqual(fact(items, "hus.forsikringsform").structuredValue.forms, ["full_value", "first_loss"]);
  assert.match(fact(items, "hus.bygninger.dekning").value, /10 m²/);
  assert.match(fact(items, "hus.hage.brygge").value, /100 000/);
  for (const key of ["hus.brann.dekning", "hus.elektrisk.dekning", "hus.naturskade.dekning",
    "hus.vann.utstromming", "hus.ror.brudd", "hus.vann.terreng", "hus.tyveri.dekning"]) {
    assert.ok(fact(items, key), key);
  }
});

test("Basis har konkrete værbegrensninger med korrekt kilde", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  const limitation = fact(items, "hus.vaer.begrensning");
  assert.match(limitation.value, /råte.*svak eller feil konstruksjon.*antenner.*veksthus.*hageanlegg.*50 år/s);
  assert.equal(limitation.source.section, "4.3");
  assert.equal(limitation.source.page, 7);
});

test("Utvidet erstatter Basis for tak, våtrom, råte og skadedyr", () => {
  const items = resolveCatalogFacts(product("Utvidet"), []);
  assert.match(fact(items, "hus.takvegg.folgeskade").value, /eldre enn 50 år/);
  assert.match(fact(items, "hus.vatrom.folgeskade").value, /omfattes/);
  assert.match(fact(items, "hus.rate.dekning").value, /treødeleggende/);
  assert.match(fact(items, "hus.skadedyr.bekjempelse").value, /skjeggkre, veggedyr og kakerlakker/);
  for (const key of ["hus.takvegg.folgeskade", "hus.vatrom.folgeskade", "hus.rate.dekning",
    "hus.skadedyr.bygningsskade", "hus.skadedyr.bekjempelse"]) assert.equal(fact(items, key).replacesBase, true);
  assert.match(fact(items, "hus.tilpasning.grense").value, /250 000/);
});

test("Super beholder Utvidet og legger til håndverkerfeil, våtrom og tjenester", () => {
  const items = resolveCatalogFacts(product("Super"), []);
  assert.match(fact(items, "hus.vatrom.selverommet").value, /autoriser.*mindre enn ti år/iu);
  assert.match(fact(items, "hus.handverker.folgeskade").value, /Selve feilen/);
  assert.match(fact(items, "hus.handverker.juridisk").value, /15 000/);
  assert.match(fact(items, "hus.service.boligsjekk").value, /hvert fjerde år/);
  assert.match(fact(items, "hus.service.juridisk").value, /To timer/);
  assert.match(fact(items, "hus.service.supergaranti").value, /to år/);
  assert.match(fact(items, "hus.service.supergaranti").value, /ikke modellert som automatisk/);
  assert.match(fact(items, "hus.service.tryggere_hjem").value, /alarmtjenesten/);
});

test("effective/base bevarer samme sides underliggende nivåer", () => {
  const terms = manual("Super").insuranceData.insurances[0].importantTerms;
  assert.match(fact(terms, "hus.vatrom.folgeskade").value, /omfattes/);
  assert.match(fact(terms, "hus.vatrom.folgeskade").overriddenBase[0].value, /unntatt/);
  assert.match(fact(terms, "hus.vatrom.selverommet").value, /autoriser/);
  assert.match(fact(terms, "hus.vatrom.selverommet").overriddenBase[0].value, /unntatt/);
  assert.match(fact(terms, "hus.egenandel.standard").value, /8 000/);
  assert.match(fact(terms, "hus.egenandel.standard").overriddenBase[0].value, /10 000/);
});

test("kundens egenandel er separat fra publisert produktstandard", () => {
  const insurance = manual("Super", "12000").insuranceData.insurances[0];
  assert.equal(insurance.deductible, "12000");
  assert.equal(insurance.deductibleOrigin, "customer");
  assert.equal(fact(insurance.importantTerms, "hus.egenandel.standard").deductibleClassification, "standard");
  assert.match(fact(insurance.importantTerms, "hus.egenandel.generell").value, /forsikringsbeviset/);
});

test("utleie er innebygd og skiller mislighold fra bygningsskadens leietap", () => {
  for (const name of ["Basis", "Utvidet", "Super"]) {
    const items = resolveCatalogFacts(product(name), []);
    assert.match(fact(items, "hus.utleie.mislighold").value, /seks måneders/);
    assert.match(fact(items, "hus.utleie.utkastelse").value, /20 000/);
    assert.match(fact(items, "hus.utleie.vilkar").value, /to måneders/);
    assert.match(fact(items, "hus.leietap.skade").value, /adskilt fra betalingsmislighold/);
  }
});

test("aldersfradrag er strukturert og holdt separat fra egenandeler", () => {
  const items = resolveCatalogFacts(product("Super"), []);
  const pipes = fact(items, "hus.aldersfradrag.utvendige_ror");
  assert.deepEqual({ freeYears: pipes.structuredValue.freeYears, annualPercent: pipes.structuredValue.annualPercent,
    maximumPercent: pipes.structuredValue.maximumPercent, yearBasis: pipes.structuredValue.yearBasis },
  { freeYears: 20, annualPercent: 5, maximumPercent: 80, yearBasis: "started_year" });
  const roof = fact(items, "hus.aldersfradrag.tak_vatrom");
  assert.equal(roof.structuredValue.olderThanYears, 30);
  assert.equal(roof.structuredValue.fixedDeductionNok, 8000);
  assert.equal(roof.deductibleClassification, undefined);
});

test("ansvar og rettshjelp har dokumenterte summer, geografi og egenandeler", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(items, "hus.ansvar.dekning").value, /Norden/);
  assert.match(fact(items, "hus.ansvar.grense").value, /5 000 000/);
  assert.match(fact(items, "hus.ansvar.egenandel").value, /4 000/);
  assert.match(fact(items, "hus.rettshjelp.grense").value, /100 000.*250 000/);
  assert.match(fact(items, "hus.rettshjelp.egenandel").value, /4 000.*20 %/);
});

test("rettshjelpens hovedbegrensninger har provenance på side 2", () => {
  for (const name of ["Basis", "Utvidet", "Super"]) {
    const limitation = fact(resolveCatalogFacts(product(name), []), "hus.rettshjelp.begrensning");
    assert.match(limitation.value, /familie.*arv.*yrke.*annen fast eiendom.*kjøretøy.*forvaltningsvedtak/s);
    assert.equal(limitation.source.section, "1.5.3");
    assert.equal(limitation.source.page, 2);
  }
});

test("ingen fremtidig kilde eller valgbart Hus-tillegg aktiveres", () => {
  const evidence = resolveCatalogEvidence(product("Super"), [], new Date("2026-09-20T12:00:00Z"));
  assert.ok(evidence.length > 0);
  assert.equal(evidence.some((entry) => entry.source.effectiveFrom > "2026-09-20"), false);
  assert.deepEqual(availableAddOns(product("Basis"), new Date("2026-09-20T12:00:00Z")), []);
  assert.equal(productCatalog.addOns.some((entry) => entry.providerId === "if" &&
    entry.insuranceTypes?.includes("Hus")), false);
});

test("Tryg Hus og If Hus sammenlignes på felles nøkler uten kildelekkasje", () => {
  const result = compare(manual("Hus", "", "Tryg"), manual("Utvidet"));
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").firstSources[0].company, "Tryg");
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").secondSources[0].company, "If");
  assert.equal(fact(result.terms, "hus.naturskade.dekning").firstSources[0].company, "Tryg");
  assert.equal(fact(result.terms, "hus.naturskade.dekning").secondSources[0].company, "If");
  assert.equal(result.terms.some((entry) => entry.firstSources.some((source) => source.company === "If")), false);
  assert.equal(result.terms.some((entry) => entry.secondSources.some((source) => source.company === "Tryg")), false);
  assert.ok(result.shown.some((entry) => entry.termKey === "hus.vatrom.folgeskade"));
});

test("høyere nivåer sammenligner effective/base uten å flytte base til motparten", () => {
  const result = compare(manual("Hus Ekstra", "", "Tryg", ["tryg-hus-rate-skadedyr"]), manual("Super"));
  const rot = fact(result.terms, "hus.rate.dekning");
  assert.equal(rot.firstSources[0].company, "Tryg");
  assert.equal(rot.secondSources[0].company, "If");
  assert.ok(rot.firstBaseFacts.length > 0);
  assert.ok(rot.secondBaseFacts.length > 0);
  assert.equal(rot.firstBaseFacts.every((entry) => entry.source.company === "Tryg"), true);
  assert.equal(rot.secondBaseFacts.every((entry) => entry.source.company === "If"), true);
});

test("runtime-kjeden beholder nivåarv, provenance og Hus-prioritering", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company: "If", totalAnnualPremium: "", products: [{
    type: "Hus", productName: "Basis", annualPremium: "", deductible: "10000", coverageSummary: "",
    importantTerms: [], addOnIds: [], catalogReference: { providerId: "if", productId: "if-hus-basis", version: "2023-09" },
  }] }));
  form.set("offerManual", JSON.stringify({ company: "If", totalAnnualPremium: "", products: [{
    type: "Hus", productName: "Super", annualPremium: "", deductible: "8000", coverageSummary: "",
    importantTerms: [], addOnIds: [], catalogReference: { providerId: "if", productId: "if-hus-super", version: "2023-09" },
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right);
  assert.equal(right.insuranceData.insurances[0].catalogReference.productId, "if-hus-super");
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").secondSources[0].termsNumber, "BGN1-0");
  assert.ok(fact(result.terms, "hus.vatrom.folgeskade").secondBaseFacts.length > 0);
  const sorted = result.shown.filter((entry) => entry.kind === "term").sort((a, b) => b.priority - a.priority);
  assert.ok(sorted.some((entry) => entry.termKey === "hus.vatrom.folgeskade"));
  assert.ok(fact(right.insuranceData.insurances[0].importantTerms, "hus.service.boligsjekk"));
  assert.equal(sorted.some((entry) => entry.termKey === "hus.service.boligsjekk"), false,
    "Tjenesten skal ikke fortrenge sentrale bygningsforskjeller i hovedvisningen");
});

test("Bil, Innbo og Hus kan sameksistere uten tillegg- eller faktakollisjon", () => {
  const agreement = normalizeManualAgreement({ company: "If", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["if-motor-gir"] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  const [car, contents, house] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "if-bil-super");
  assert.equal(contents.catalogReference.productId, "if-innbo-super");
  assert.equal(house.catalogReference.productId, "if-hus-super");
  assert.equal(car.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(contents.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.equal(house.importantTerms.some((entry) => !entry.key?.startsWith("hus.")), false);
  assert.deepEqual(house.addOnIds, []);
});
