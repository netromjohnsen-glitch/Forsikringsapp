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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/tryg/hus");
const product = (name) => productCatalog.products.find((entry) =>
  entry.company === "Tryg" && entry.insuranceType === "Hus" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, addOnIds = [], deductible = "") => normalizeManualAgreement({
  company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Hus", productName: name, annualPremium: "", deductible,
    coverageSummary: "", importantTerms: [], addOnIds,
  }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  const shown = presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company);
  return { groups, terms, raw, shown };
};

test("alle 16 offisielle Tryg Hus-kilder er lokale, uendrede og registrert", async () => {
  const files = (await readdir(root)).filter((name) => name.endsWith(".pdf")).sort();
  assert.equal(files.length, 16);
  const sources = Object.values(productCatalog.sources).filter((source) =>
    source.company === "Tryg" && source.insuranceType === "Hus");
  assert.equal(sources.length, 16);
  assert.deepEqual(sources.map((source) => source.filename).sort(), files);
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.filename);
    assert.ok(source.documentName, source.filename);
    assert.ok(source.termsNumber, source.filename);
    assert.ok(Array.isArray(source.appliesTo) && source.appliesTo.length > 0, source.filename);
  }
  assert.equal(productCatalog.sources.trygHusLiabilityFuture.effectiveFrom, "2026-10-01");
  assert.equal(productCatalog.sources.trygHusIpid.version, "01.07.2022");
  assert.equal(productCatalog.sources.trygHusIpid.effectiveFrom, "");
});

test("fullvilkårene bekrefter produktnivåer, våtrom og råte som separat dekning", async () => {
  const parse = async (filename) => {
    const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
    try { return await parser.getText(); } finally { await parser.destroy(); }
  };
  const base = await parse("05PPK11501.pdf");
  const extra = await parse("05PPK11502.pdf");
  const rot = await parse("05PPK40502.pdf");
  assert.equal(base.total, 8);
  assert.equal(extra.total, 9);
  assert.match(base.text, /Bygning kan være en fullverdi- eller førsterisikoforsikring/);
  assert.match(base.text, /skade ved vann fra utett våtrom/);
  assert.match(extra.text, /Bygning Ekstra er en fullverdiforsikring/);
  assert.match(extra.text, /Våtromsdekning/);
  assert.match(extra.text, /konstatert innen\s*10 år/u);
  assert.match(rot.text, /kostnader til bygningsskader og bekjempelse har ubegrenset forsikringssum/u);
  assert.match(rot.text, /Ved skadedyrsbekjempelse er egenandel 2000/u);
});

test("Tryg tilbyr Hus og Hus Ekstra som separate komplette fullvilkår", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Hus"), ["Hus", "Hus Ekstra"]);
  assert.deepEqual(resolveProductComponentIds(product("Hus")),
    ["trygHusProduct", "trygHusIpid", "trygHusGeneral", "trygHusNatural", "trygHusLegal", "trygHusSafety", "trygHus"]);
  assert.deepEqual(resolveProductComponentIds(product("Hus Ekstra")),
    ["trygHusProduct", "trygHusIpid", "trygHusGeneral", "trygHusNatural", "trygHusLegal", "trygHusSafety", "trygHusExtra"]);
  assert.equal(product("Hus Ekstra").inheritsProductId, undefined);
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Bil"), ["Ansvar", "Delkasko", "Kasko"]);
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Innbo"), ["Innbo", "Innbo Ekstra"]);
});

test("forsikringsform skiller fullverdi fra førsterisiko uten å kalle fullverdi ubegrenset sum", () => {
  const base = fact(resolveCatalogFacts(product("Hus"), []), "hus.forsikringsform");
  const extra = fact(resolveCatalogFacts(product("Hus Ekstra"), []), "hus.forsikringsform");
  assert.deepEqual(base.structuredValue.forms, ["full_value", "first_loss"]);
  assert.equal(base.structuredValue.defaultForm, "full_value");
  assert.match(base.value, /Førsterisiko begrenser erstatningen til avtalt sum/);
  assert.doesNotMatch(base.value, /ubegrenset forsikringssum/iu);
  assert.deepEqual(extra.structuredValue.forms, ["full_value"]);
  assert.match(fact(resolveCatalogFacts(product("Hus"), []), "hus.forsikringssum").value,
    /brukes til prisberegning, ikke som ubetinget erstatningstak/);
});

test("bygninger, uteanlegg, tekniske installasjoner og endringer er strukturert", () => {
  const base = resolveCatalogFacts(product("Hus"), []);
  assert.match(fact(base, "hus.bygninger.dekning").value, /forsikringsbeviset/);
  assert.match(fact(base, "hus.bygninger.tilbehor").value, /faste bygningsdeler og faste installasjoner/i);
  assert.match(fact(base, "hus.bygninger.tilbehor").value, /ladeboks er ikke særskilt omtalt/i);
  assert.match(fact(base, "hus.andrebygninger.endring").value, /Garasje, naust, uthus, tilbygg og påbygg/);
  assert.match(fact(base, "hus.hage.grense").value, /500 000 kr/);
  assert.match(fact(base, "hus.hage.brygge").value, /100 000 kr/);
  assert.match(fact(base, "hus.aldersfradrag.varmepumpe").value, /5 år.*10 %.*100 %/);
  assert.match(fact(base, "hus.aldersfradrag.solceller").value, /20 år.*10 %.*80 %/);
});

test("brann, elektrisk, vann og rør holder følgeskade og skadeårsak adskilt", () => {
  const base = resolveCatalogFacts(product("Hus"), []);
  for (const key of ["hus.brann.dekning", "hus.elektrisk.dekning", "hus.vann.utstromming",
    "hus.vann.terreng", "hus.ror.brudd"]) assert.ok(fact(base, key), key);
  assert.match(fact(base, "hus.vann.utstromming").value, /Følgeskade og reparasjon av røret er separate/);
  assert.match(fact(base, "hus.takvegg.skadearsak").value, /Ingen egen dekning/);
});

test("Hus Ekstra dokumenterer forbedret tak-, våtroms- og håndverkerfeildekning", () => {
  const base = resolveCatalogFacts(product("Hus"), []);
  const extra = resolveCatalogFacts(product("Hus Ekstra"), []);
  assert.match(fact(base, "hus.vatrom.folgeskade").value, /unntatt/);
  assert.match(fact(extra, "hus.vatrom.folgeskade").value, /omfattes/);
  assert.match(fact(extra, "hus.vatrom.selverommet").value, /innen 10 år/);
  assert.match(fact(extra, "hus.takvegg.folgeskade").value, /over bakkeplan/);
  assert.match(fact(extra, "hus.takvegg.skadearsak").value, /Selve taket\/veggen.*unntatt/);
  assert.match(fact(extra, "hus.plutselig.dekning").value, /Følgeskade av håndverkerfeil/);
  assert.ok(fact(extra, "hus.glass.isolerglass_punktering"));
});

test("naturskade og ordinært vær er separate Hus-konsepter", () => {
  const items = resolveCatalogFacts(product("Hus Ekstra"), []);
  const base = resolveCatalogFacts(product("Hus"), []);
  assert.match(fact(items, "hus.naturskade.dekning").value, /skred, storm, flom/);
  assert.match(fact(items, "hus.naturskade.dekning").value, /snøtyngde.*ikke naturskade/);
  assert.match(fact(items, "hus.vaer.dekning").value, /vind svakere enn storm, snøtyngde/iu);
  assert.match(fact(base, "hus.vaer.begrensning").value, /fundamentering.*material.*dyr.*sopp/s);
  assert.match(fact(items, "hus.vaer.begrensning").value, /kjæledyr.*håndverkerfeilen.*10 år/is);
  assert.notEqual(fact(base, "hus.vaer.begrensning").value, fact(items, "hus.vaer.begrensning").value);
  for (const terms of [base, items]) {
    assert.equal(fact(terms, "hus.vaer.dekning").source.page, 4);
    assert.equal(fact(terms, "hus.vaer.egenandel").source.page, 5);
    assert.equal(fact(terms, "hus.vaer.egenandel").value, "Minimum 8 000 kr");
  }
  assert.equal(fact(items, "hus.naturskade.egenandel").deductibleClassification, "override");
});

test("risikoendring konkretiserer utleie og fraflytting uten kundespesifikke valg", () => {
  for (const name of ["Hus", "Hus Ekstra"]) {
    const risk = fact(resolveCatalogFacts(product(name), []), "hus.sikkerhet.risiko");
    assert.match(risk.value, /utleie.*foreldre.*søsken.*barn.*barnebarn.*fraflytting.*brann og naturskade/s);
    assert.equal(risk.source.section, "2.1–2.2");
    assert.equal(risk.source.page, 2);
  }
});

test("aldersfradrag er strukturert separat fra egenandeler", () => {
  const items = resolveCatalogFacts(product("Hus Ekstra"), []);
  const solar = fact(items, "hus.aldersfradrag.solceller");
  assert.deepEqual(solar.structuredValue, {
    kind: "age_deduction", component: "solceller", scope: "building", freeYears: 20,
    annualPercent: 10, maximumPercent: 80, minimumCompensationPercent: 20,
    yearBasis: "year", exceptions: ["fire", "natural_damage", "total_loss_full_value"],
    calculationBasis: "Hele reparasjonskostnaden; eldste skadde del; isolerglass bare ved punktering",
  });
  assert.equal(solar.deductibleClassification, undefined);
  assert.equal(fact(items, "hus.vann.egenandel.terreng_grunnvann").structuredValue, undefined);
  assert.equal(fact(items, "hus.vann.egenandel.terreng_grunnvann").deductibleClassification, "override");
});

test("råte og skadedyr er valgbart, effektivt og beholder basefaktum", () => {
  for (const name of ["Hus", "Hus Ekstra"]) {
    assert.deepEqual(availableAddOns(product(name)).map((entry) => entry.id),
      ["tryg-hus-rate-skadedyr", "tryg-hus-utleie"]);
  }
  const selected = resolveCatalogFacts(product("Hus Ekstra"), ["tryg-hus-rate-skadedyr"]);
  assert.match(fact(selected, "hus.rate.dekning").value, /råtesopper omfattes/);
  assert.equal(fact(selected, "hus.rate.dekning").replacesBase, true);
  assert.match(fact(selected, "hus.skadedyr.bekjempelse").value, /mus og rotter/);
  assert.match(fact(selected, "hus.rate_skadedyr.vann.grense").value, /200 000 kr.*600 000 kr/);
  const threshold = fact(selected, "hus.aldersfradrag.rate_skadedyr.terskel.vatrom");
  assert.equal(threshold.structuredValue.olderThanYears, 20);
  assert.equal(threshold.structuredValue.deductionPercent, 50);
  assert.equal(threshold.structuredValue.maximumCompensationNok, 200000);
  const detail = manual("Hus Ekstra", ["tryg-hus-rate-skadedyr"]).insuranceData.insurances[0].importantTerms;
  assert.match(fact(detail, "hus.rate.dekning").overriddenBase[0].value, /unntatt/);
});

test("Utleieforsikring skiller betalingsmislighold fra leietap etter bygningsskade", () => {
  const items = resolveCatalogFacts(product("Hus"), ["tryg-hus-utleie"]);
  assert.match(fact(items, "hus.leietap.skade").value, /erstatningsmessig skade/);
  assert.match(fact(items, "hus.utleie.mislighold").value, /6 måneders husleie/);
  assert.match(fact(items, "hus.utleie.skadeverk").value, /500 000 kr/);
  assert.match(fact(items, "hus.utleie.utkastelse").value, /20 000 kr/);
  assert.equal(fact(items, "hus.utleie.mislighold.egenandel").deductibleClassification, "override");
  assert.match(fact(items, "hus.sikkerhet.utleie").value, /depositum.*3 måneders/);
});

test("gjenoppføring, påbud, rydding og brukstap bevarer materielle oppgjørsregler", () => {
  const base = resolveCatalogFacts(product("Hus"), []);
  assert.match(fact(base, "hus.pabud.grense").value, /2 000 000 kr/);
  assert.match(fact(base, "hus.rydding.dekning").value, /20 % av forsikringssummen/);
  assert.match(fact(base, "hus.gjenoppforing.hovedregel").value, /innen 5 år/);
  assert.match(fact(base, "hus.gjenoppforing.annetsted").value, /40 %/);
  assert.match(fact(base, "hus.gjenoppforing.markedsverdi").value, /samme fylke innen 2 år/);
  assert.match(fact(base, "hus.brukstap.dekning").value, /markedsleie/);
  assert.match(fact(base, "hus.leietap.skade").value, /korttidsutleie er unntatt/);
});

test("Bygg under oppføring er bevart som separat kilde og ikke ordinært UI-produkt eller tillegg", () => {
  const construction = productCatalog.sources.trygHusConstruction;
  assert.equal(construction.termsNumber, "PPK11503");
  assert.match(construction.appliesTo[0], /utenfor ordinær Hus-MVP/);
  assert.equal(productCatalog.products.some((entry) => entry.productId === "tryg-hus-bygg-under-oppforing"), false);
  assert.equal(productCatalog.addOns.some((entry) => entry.componentId === "trygHusConstruction"), false);
});

test("fremtidig ansvarsvilkår og NITO Hus kobles ikke automatisk", () => {
  const asOf = new Date("2026-09-19T12:00:00Z");
  const evidence = resolveCatalogEvidence(product("Hus Ekstra"), [], asOf);
  assert.equal(evidence.some((entry) => entry.source.documentId === "trygHusLiabilityFuture"), false);
  assert.equal(productCatalog.products.some((entry) => entry.company === "Tryg" &&
    entry.insuranceType === "Hus" && /NITO/iu.test(entry.name)), false);
  const nito = normalizeManualAgreement({ company:"Tryg", totalAnnualPremium:"", products:[{
    type:"Hus", productName:"NITO Hus", annualPremium:"", deductible:"", coverageSummary:"",
    importantTerms:[{ name:"Dekning", value:"Ukjent NITO-vilkår" }], addOnIds:[],
  }] }).insuranceData.insurances[0];
  assert.equal(nito.catalogReference, null);
  assert.equal(nito.catalogFacts, null);
  assert.deepEqual(nito.addOnIds, []);
});

test("Hus-prioritering løfter materielle dekninger foran sikkerhet og rettshjelp", () => {
  const result = compare(manual("Hus"), manual("Hus Ekstra", ["tryg-hus-rate-skadedyr", "tryg-hus-utleie"]));
  const sorted = result.shown.filter((entry) => entry.kind === "term");
  const index = (conceptId) => sorted.findIndex((entry) => entry.conceptId === conceptId);
  assert.ok(index("hus.plutselig") >= 0);
  assert.ok(index("hus.vatrom") >= 0);
  assert.ok(index("hus.rate-skadedyr") >= 0);
  assert.ok(index("hus.plutselig") < index("hus.rate-skadedyr"));
  assert.ok(index("hus.vatrom") < index("hus.rate-skadedyr"));
  assert.ok(result.raw.some((entry) => entry.termKey?.startsWith("hus.rettshjelp.")) === false,
    "Identisk rettshjelp skal ikke konstrueres som forskjell");
  const synthetic = ["hus.forsikringsform", "hus.vatrom.folgeskade", "hus.rate.dekning",
    "hus.utleie.mislighold", "hus.sikkerhet.vann", "hus.rettshjelp.grense"].map((termKey) => ({
      title: termKey, text: termKey, type:"tradeoff", kind:"term", insuranceKey:"bolig",
      termKey, priority: 100,
    }));
  const syntheticGroups = [{ key: "bolig", label: "Hus", first: [], second: [] }];
  const presented = presentImportantDifferences(synthetic, syntheticGroups, null, "A", "B");
  const ids = presented.map((entry) => entry.conceptId);
  assert.ok(ids.indexOf("hus.gjenoppforing") < ids.indexOf("hus.vatrom"));
  assert.ok(ids.indexOf("hus.vatrom") < ids.indexOf("hus.rate-skadedyr"));
  assert.ok(ids.indexOf("hus.rate-skadedyr") < ids.indexOf("hus.utleie-bosted"));
});

test("runtime-kjeden viser Hus mot Hus Ekstra med effektive tillegg og kilder", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company:"Tryg", totalAnnualPremium:"", products:[{
    type:"Hus", productName:"Hus", annualPremium:"", deductible:"6000", coverageSummary:"",
    importantTerms:[], catalogReference:{ providerId:"tryg", productId:"tryg-hus", version:"2026-01-01" }, addOnIds:[],
  }] }));
  form.set("offerManual", JSON.stringify({ company:"Tryg", totalAnnualPremium:"", products:[{
    type:"Hus", productName:"Hus Ekstra", annualPremium:"", deductible:"10000", coverageSummary:"",
    importantTerms:[], catalogReference:{ providerId:"tryg", productId:"tryg-hus-ekstra", version:"2026-01-01" },
    addOnIds:["tryg-hus-rate-skadedyr", "tryg-hus-utleie"],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right);
  assert.deepEqual(right.insuranceData.insurances[0].addOnIds,
    ["tryg-hus-rate-skadedyr", "tryg-hus-utleie"]);
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").firstSources[0].termsNumber, "PPK11501");
  assert.equal(fact(result.terms, "hus.vatrom.folgeskade").secondSources[0].termsNumber, "PPK11502");
  assert.equal(fact(result.terms, "hus.rate.dekning").secondSources[0].termsNumber, "PPK40502");
  assert.ok(fact(result.terms, "hus.rate.dekning").secondBaseFacts.length > 0);
  assert.ok(result.shown.some((entry) => entry.conceptId === "hus.vatrom" &&
    entry.items.some((detail) => detail.termKey === "hus.vatrom.folgeskade")));
});

test("én avtale kan inneholde Bil, Innbo og Hus med isolerte tillegg og kilder", () => {
  const agreement = normalizeManualAgreement({ company:"Tryg", totalAnnualPremium:"", products:[
    { type:"Bil", productName:"Kasko", annualPremium:"", deductible:"", coverageSummary:"", importantTerms:[], addOnIds:["bil-ekstra"] },
    { type:"Innbo", productName:"Innbo Ekstra", annualPremium:"", deductible:"", coverageSummary:"", importantTerms:[], addOnIds:["tryg-innbo-utleie"] },
    { type:"Hus", productName:"Hus Ekstra", annualPremium:"", deductible:"", coverageSummary:"", importantTerms:[], addOnIds:["tryg-hus-rate-skadedyr", "tryg-hus-utleie"] },
  ] });
  const [car, contents, house] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "bil-kasko");
  assert.equal(contents.catalogReference.productId, "tryg-innbo-ekstra");
  assert.equal(house.catalogReference.productId, "tryg-hus-ekstra");
  assert.ok(car.importantTerms.some((entry) => entry.key === "nyverdi.km"));
  assert.equal(car.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "sykkel.tyveri.grense"));
  assert.equal(contents.importantTerms.some((entry) => entry.key?.startsWith("hus.")), false);
  assert.ok(house.importantTerms.some((entry) => entry.key === "hus.vatrom.folgeskade"));
  assert.equal(house.importantTerms.some((entry) => entry.key === "nyverdi.km" || entry.key === "sykkel.tyveri.grense"), false);
  assert.deepEqual(car.addOnIds, ["bil-ekstra"]);
  assert.deepEqual(contents.addOnIds, ["tryg-innbo-utleie"]);
  assert.deepEqual(house.addOnIds, ["tryg-hus-rate-skadedyr", "tryg-hus-utleie"]);
});
