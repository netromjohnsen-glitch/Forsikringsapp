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
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/storebrand/innbo");
const product = (company, name, type = "Innbo") => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === type && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (company, name, type = "Innbo", addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type, productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const raw = createDifferences(left, right, groups, null);
  return { groups, terms: groupTerms(groups.find((group) => group.key === "innbo"), null), raw,
    shown: presentImportantDifferences(raw, groups, null, left.insuranceData.company, right.insuranceData.company) };
};
const pdfText = async (filename) => {
  const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
};

test("offisielle Storebrand Innbo-kilder er lokale, uendrede og versjonerte", async () => {
  const expected = {
    "Storebrand_Innbo_innbo09.pdf": "926c4b93a76b49868bc596784fac9133613f80dc2487d96ab608eb73cfa90776",
    "Storebrand_Generelle_gener07.pdf": "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",
    "Storebrand_IPID_Innboforsikring.pdf": "d79f80e2f81dfe7590adeee132c3f5b2a0a75848078d93b5e9563aded7d0ba96",
  };
  for (const [filename, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  }
  const terms = await pdfText("Storebrand_Innbo_innbo09.pdf");
  const general = await pdfText("Storebrand_Generelle_gener07.pdf");
  const ipid = await pdfText("Storebrand_IPID_Innboforsikring.pdf");
  assert.equal(terms.total, 30);
  assert.equal(general.total, 11);
  assert.equal(ipid.total, 2);
  assert.match(terms.text, /innbo09/);
  assert.match(terms.text, /Gjelder fra 02\.07\.2024/);
  assert.match(general.text, /gener07/);
  assert.match(general.text, /Gjelder fra 01\.09\.2026/);
  assert.match(ipid.text, /17102b/);
  assert.match(ipid.text, /01\/2024/);
});

test("Storebrand tilbyr Standard og Super med dokumentert arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Storebrand", "Innbo"), ["Standard", "Super"]);
  assert.deepEqual(resolveProductComponentIds(product("Storebrand", "Standard")), ["sbInnboStandard"]);
  assert.deepEqual(resolveProductComponentIds(product("Storebrand", "Super")), ["sbInnboStandard", "sbInnboSuper"]);
  assert.deepEqual(productSuggestions(productCatalog, "Storebrand", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Super"]);
  assert.deepEqual(availableAddOns(product("Storebrand", "Super")), []);
});

test("forsikringssum er kundestyrt og Super beholder Standard som base", () => {
  const standard = resolveCatalogFacts(product("Storebrand", "Standard"), []);
  const superFacts = resolveCatalogFacts(product("Storebrand", "Super"), []);
  assert.match(fact(standard, "innbo.forsikringssum").value, /forsikringsbeviset/);
  assert.equal(fact(standard, "innbo.forsikringssum").deductibleClassification, "reference");
  assert.equal(fact(superFacts, "innbo.forsikringssum").value, fact(standard, "innbo.forsikringssum").value);
  const detail = manual("Storebrand", "Super").insuranceData.insurances[0].importantTerms;
  assert.equal(fact(detail, "tyveri.fellesbod.grense").value.startsWith("Avtalt forsikringssum"), true);
  assert.equal(fact(detail, "tyveri.fellesbod.grense").overriddenBase[0].value.startsWith("100 000 kr"), true);
  assert.equal(fact(detail, "tyveri.fellesbod.grense").source.company, "Storebrand");
});

test("Standard og Super har kildebaserte særgrenser", () => {
  const standard = resolveCatalogFacts(product("Storebrand", "Standard"), []);
  const superFacts = resolveCatalogFacts(product("Storebrand", "Super"), []);
  for (const [key, base, effective] of [
    ["innbo.yrkeslosore.grense", "50 000 kr", "200 000 kr"],
    ["innbo.penger.grense", "20 000 kr", "30 000 kr"],
    ["innbo.fritidsbat.grense", "40 000 kr", "60 000 kr"],
    ["innbo.smabygg.grense", "50 000 kr", "200 000 kr"],
    ["tyveri.uteareal.grense", "40 000 kr", "100 000 kr"],
    ["sykkel.tyveri.grense", "40 000 kr", "50 000 kr"],
  ]) {
    assert.match(fact(standard, key).value, new RegExp(base.replace(" ", "\\s")), key);
    assert.match(fact(superFacts, key).value, new RegExp(effective.replace(" ", "\\s")), key);
  }
});

test("brann, elektrisk, vann og naturskade er separate sammenlignbare konsepter", () => {
  const standard = resolveCatalogFacts(product("Storebrand", "Standard"), []);
  assert.match(fact(standard, "brann.dekning").value, /Brann og eksplosjon/);
  assert.match(fact(standard, "elektrisk.dekning").value, /kortslutning/);
  assert.match(fact(standard, "vann.dekning").value, /akvarium/);
  assert.equal(fact(standard, "innbo.vaesketap.grense").value.startsWith("40 000 kr"), true);
  assert.match(fact(standard, "naturskade.dekning").value, /meteorittnedslag/);
  assert.equal(fact(standard, "naturskade.egenandel").deductibleClassification, "override");
});

test("midlertidig oppbevaring, krise og boligkostnader følger fullvilkåret", () => {
  const standard = resolveCatalogFacts(product("Storebrand", "Standard"), []);
  const superFacts = resolveCatalogFacts(product("Storebrand", "Super"), []);
  assert.match(fact(standard, "innbo.lagring.tid").value, /3 år/);
  assert.match(fact(standard, "innbo.lagring.grense").value, /100 000 kr/);
  assert.match(fact(standard, "krise.psykolog.timer").value, /10 behandlingstimer/);
  assert.match(fact(standard, "innbo.opphold.grense").value, /hotell begrenset til 100 000 kr/);
  assert.match(fact(superFacts, "innbo.opphold.grense").value, /også hotell/);
});

test("Super strukturerer uhell, tyveri ute, flytting, skadedyr, ID-tyveri og boligtilpasning", () => {
  const superFacts = resolveCatalogFacts(product("Storebrand", "Super"), []);
  assert.match(fact(superFacts, "uhell.dekning").value, /100 000 kr/);
  assert.match(fact(superFacts, "tyveri.utenforhjem.grense").value, /50 000 kr/);
  assert.match(fact(superFacts, "flytting.transport.grense").value, /50 000 kr per gjenstand/);
  assert.equal(fact(superFacts, "skadedyr.grense").value, "150 000 kr per skadetilfelle");
  assert.match(fact(superFacts, "idtyveri.grense").value, /1 000 000 kr/);
  assert.match(fact(superFacts, "ulykke.boligtilpasning.grense").value, /300 000 kr/);
});

test("egenandeler skiller avtalt, myndighetsfastsatt og særskilt verdi", () => {
  const evidence = resolveCatalogEvidence(product("Storebrand", "Super"), []);
  assert.equal(fact(evidence, "innbo.egenandel").deductibleClassification, "reference");
  for (const key of ["naturskade.egenandel", "tyveri.egenandel", "uhell.egenandel",
    "sykkel.uhell.egenandel", "skadedyr.egenandel", "idtyveri.egenandel", "ansvar.egenandel",
    "rettshjelp.egenandel"]) assert.equal(fact(evidence, key).deductibleClassification, "override", key);
});

test("ansvar, rettshjelp og betinget privat yrkesskade bevarer omfanget", () => {
  const facts = resolveCatalogFacts(product("Storebrand", "Standard"), []);
  assert.match(fact(facts, "ansvar.grense").value, /5 000 000 kr/);
  assert.match(fact(facts, "ansvar.geografi").value, /droneansvar gjelder i Europa/);
  assert.match(fact(facts, "rettshjelp.grense").value, /1 000 000 kr/);
  assert.equal(fact(facts, "rettshjelp.geografi").value, "Norden");
  assert.match(fact(facts, "yrkesskade.privat.dekning").value, /når sikrede som privatperson er arbeidsgiver/);
});

test("Tryg Innbo og Innbo Ekstra sammenlignes mot Storebrand Standard og Super", () => {
  for (const [left, right] of [["Innbo", "Standard"], ["Innbo Ekstra", "Super"]]) {
    const result = compare(manual("Tryg", left), manual("Storebrand", right));
    for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "tyveri.fellesbod.grense",
      "tyveri.uteareal.grense", "sykkel.tyveri.grense", "ansvar.dekning", "rettshjelp.grense"]) {
      assert.ok(fact(result.terms, key)?.first, `${left}:${key}:first`);
      assert.ok(fact(result.terms, key)?.second, `${right}:${key}:second`);
    }
  }
});

test("If Basis og Super sammenlignes mot Storebrand Standard og Super", () => {
  for (const [left, right] of [["Basis", "Standard"], ["Super", "Super"]]) {
    const result = compare(manual("If", left), manual("Storebrand", right));
    for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "tyveri.fellesbod.grense",
      "tyveri.uteareal.grense", "ansvar.grense", "rettshjelp.grense"]) {
      assert.ok(fact(result.terms, key)?.first, `${left}:${key}:first`);
      assert.ok(fact(result.terms, key)?.second, `${right}:${key}:second`);
    }
    if (left === "Super") for (const key of ["uhell.dekning", "flytting.transport.grense", "skadedyr.grense",
      "idtyveri.grense", "ulykke.boligtilpasning.grense"]) assert.ok(fact(result.terms, key)?.second, key);
  }
});

test("Gjensidige Innbo og Pluss sammenlignes mot Storebrand Standard og Super", () => {
  for (const [left, right] of [["Innbo", "Standard"], ["Innbo Pluss", "Super"]]) {
    const result = compare(manual("Gjensidige", left), manual("Storebrand", right));
    for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "tyveri.fellesbod.grense",
      "tyveri.uteareal.grense", "sykkel.tyveri.grense", "ansvar.grense", "rettshjelp.grense"]) {
      assert.ok(fact(result.terms, key)?.first, `${left}:${key}:first`);
      assert.ok(fact(result.terms, key)?.second, `${right}:${key}:second`);
    }
  }
});

test("UI-formet runtime beholder Storebrand Super gjennom comparison og presentation", () => {
  for (const [company, name] of [["Tryg", "Innbo Ekstra"], ["If", "Super"], ["Gjensidige", "Innbo Pluss"]]) {
    const form = new FormData();
    form.set("existingManual", JSON.stringify({ company, totalAnnualPremium: "", products: [{ type: "Innbo",
      productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] }));
    form.set("offerManual", JSON.stringify({ company: "Storebrand", totalAnnualPremium: "", products: [{ type: "Innbo",
      productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [],
      catalogReference: { providerId: "storebrand", productId: "sb-innbo-super", version: "innbo09" }, addOnIds: [] }] }));
    const result = compare(normalizeManualAgreement(JSON.parse(form.get("existingManual"))),
      normalizeManualAgreement(JSON.parse(form.get("offerManual"))));
    assert.ok(fact(result.terms, "uhell.dekning").second, company);
    assert.ok(result.shown.some((entry) => entry.insuranceKey === "innbo"), company);
  }
});

test("Bil og Innbo i samme Storebrand-avtale holder produkt, state og kilder adskilt", () => {
  const agreement = normalizeManualAgreement({ company: "Storebrand", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "",
      importantTerms: [], addOnIds: ["sb-leiebil"] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "",
      importantTerms: [], addOnIds: [] },
  ] });
  const [car, contents] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "sb-bil-super");
  assert.equal(contents.catalogReference.productId, "sb-innbo-super");
  assert.ok(car.importantTerms.some((entry) => entry.key === "leiebil.dager"));
  assert.equal(car.importantTerms.some((entry) => entry.key === "skadedyr.grense"), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "skadedyr.grense"));
  assert.equal(contents.importantTerms.some((entry) => entry.key === "leiebil.dager"), false);
  assert.ok(contents.importantTerms.every((entry) => entry.source.company === "Storebrand"));
});

test("Innbo-prioriteringen lar sentrale Super-forskjeller gå foran ansvar og rettshjelp", () => {
  const result = compare(manual("Gjensidige", "Innbo Pluss"), manual("Storebrand", "Super"));
  const highlights = result.shown.filter((entry) => entry.insuranceKey === "innbo")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  assert.ok(highlights.some((entry) => entry.termKey === "innbo.forsikringssum"));
  assert.ok(highlights.some((entry) => entry.termKey?.startsWith("sykkel.")));
  assert.ok(!highlights.some((entry) => entry.termKey?.startsWith("rettshjelp.")));
  assert.ok(result.shown.some((entry) => entry.termKey === "rettshjelp.grense"));
});
