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
import { productCatalog, productSuggestions, resolveCatalogEvidence, resolveCatalogFacts,
  resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/fremtind/innbo/canonical");
const product = (name, type = "Innbo") => productCatalog.products.find((entry) =>
  entry.company === "Fremtind" && entry.insuranceType === type && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const input = (company, name, distributionChannel = "", type = "Innbo", addOnIds = []) => ({
  company, distributionChannel, totalAnnualPremium: "", products: [{ type, productName: name,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const manual = (company, name, channel = "") => normalizeManualAgreement(input(company, name, channel));
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

test("offisielle Fremtind Innbo-kilder er lokale, uendrede og versjonerte", async () => {
  const expected = {
    "Vilkar_Standard_Innbo.pdf": "eddc6ba67d46495fce5925679fc75a92bfdb3af7aa4f7ed5ebb0d0592032fced",
    "Vilkar_Topp_Innbo.pdf": "d051745eb18921707f85bf42c130b780af4c65a0427207390bff6eea17257547",
    "IPID_Innbo.pdf": "5df50f82167bd89c97e7b9d4e8a3de6280878fd288e1ea01c993d42057cf55dd",
  };
  for (const [filename, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  }
  const standard = await pdfText("Vilkar_Standard_Innbo.pdf");
  const topp = await pdfText("Vilkar_Topp_Innbo.pdf");
  const ipid = await pdfText("IPID_Innbo.pdf");
  assert.equal(standard.total, 11);
  assert.equal(topp.total, 14);
  assert.equal(ipid.total, 2);
  assert.match(standard.text, /PBK-210\.100-014 av 01\.01\.2025/);
  assert.match(topp.text, /PBK-210\.200-013 av 01\.01\.2025/);
  assert.match(ipid.text, /V\.104/);
  assert.match(ipid.text, /Standard dekker/);
  assert.match(ipid.text, /Topp dekker i tillegg/);
});

test("Fremtind er én provider med Innbo og Innbo Pluss i UI og Standard/Topp i kilden", () => {
  assert.equal(productCatalog.companies.filter((item) => item === "Fremtind").length, 1);
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Innbo"), ["Innbo", "Innbo Pluss"]);
  assert.deepEqual(resolveProductComponentIds(product("Innbo")), ["fremtindInnboStandard"]);
  assert.deepEqual(resolveProductComponentIds(product("Innbo Pluss")),
    ["fremtindInnboStandard", "fremtindInnboTopp"]);
});

test("Eika, SpareBank 1, DNB og ukjent kanal løser samme dokumenterte canonical fakta", () => {
  const baseline = resolveCatalogFacts(product("Innbo Pluss"), [], new Date("2026-09-19"), null);
  for (const channel of ["Eika", "SpareBank 1", "DNB"]) {
    const current = resolveCatalogFacts(product("Innbo Pluss"), [], new Date("2026-09-19"), channel);
    assert.deepEqual(current.map(({ key, value }) => ({ key, value })), baseline.map(({ key, value }) => ({ key, value })));
  }
  for (const sourceId of ["fremtindInnboStandard", "fremtindInnboTopp", "fremtindInnboIpid"]) {
    assert.deepEqual(productCatalog.sources[sourceId].distributionChannels, ["Eika", "SpareBank 1", "DNB"]);
  }
});

test("forsikringssum og generell egenandel er forsikringsbevisstyrt", () => {
  const standard = resolveCatalogFacts(product("Innbo"), []);
  assert.match(fact(standard, "innbo.forsikringssum").value, /forsikringsbeviset/);
  assert.equal(fact(standard, "innbo.forsikringssum").deductibleClassification, "reference");
  assert.match(fact(standard, "innbo.egenandel").value, /forsikringsbeviset/);
  assert.equal(fact(standard, "innbo.egenandel").deductibleClassification, "reference");
  assert.equal(standard.some((item) => /500 000 kr per voksen/u.test(item.value)), false);
});

test("Innbo har kildebaserte særgrenser, skadeårsaker og spesialegenandeler", () => {
  const standard = resolveCatalogFacts(product("Innbo"), []);
  for (const [key, pattern] of [
    ["innbo.penger.grense", /15 000 kr/], ["innbo.yrkeslosore.grense", /50 000 kr/],
    ["innbo.tilhenger.grense", /20 000 kr/], ["tyveri.fellesbod.grense", /100 000 kr/],
    ["tyveri.uteareal.grense", /50 000 kr/], ["sykkel.tyveri.grense", /20 000 kr/],
    ["brann.dekning", /spenningsfeil/], ["vann.dekning", /akvarium/],
  ]) assert.match(fact(standard, key).value, pattern, key);
  for (const key of ["sykkel.egenandel", "glass.sanitaer.egenandel", "naturskade.egenandel",
    "ansvar.egenandel", "rettshjelp.egenandel"]) {
    assert.equal(fact(standard, key).deductibleClassification, "override", key);
  }
});

test("Innbo Pluss bruker effektive Topp-verdier og beholder Standard-base", () => {
  const agreement = manual("Fremtind", "Innbo Pluss", "Eika");
  const terms = agreement.insuranceData.insurances[0].importantTerms;
  assert.equal(fact(terms, "innbo.penger.grense").value, "30 000 kr");
  assert.equal(fact(terms, "innbo.penger.grense").overriddenBase[0].value, "15 000 kr");
  assert.equal(fact(terms, "tyveri.fellesbod.grense").value, "350 000 kr");
  assert.equal(fact(terms, "tyveri.fellesbod.grense").overriddenBase[0].value, "100 000 kr");
  assert.equal(fact(terms, "innbo.penger.grense").source.documentId, "fremtindInnboTopp");
  assert.equal(agreement.insuranceData.distributionChannel, "Eika");
});

test("Innbo Pluss strukturerer uhell, flytting, skadedyr, ID-tyveri og boligtilpasning", () => {
  const topp = resolveCatalogFacts(product("Innbo Pluss"), []);
  assert.match(fact(topp, "uhell.dekning").value, /tilfeldig og plutselig/iu);
  assert.equal(fact(topp, "uhell.grense").value, "50 000 kr");
  assert.match(fact(topp, "flytting.transport.grense").value, /Norden/);
  assert.match(fact(topp, "skadedyr.dekning").value, /veg(?:g)?edyr|veggedyr/iu);
  assert.match(fact(topp, "skadedyr.grense").value, /150 000 kr/);
  assert.equal(fact(topp, "idtyveri.grense").value, "1 000 000 kr");
  assert.match(fact(topp, "ulykke.boligtilpasning.grense").value, /300 000 kr/);
});

test("ansvar og rettshjelp bevarer dokumenterte summer, geografi og kilder", () => {
  const standard = resolveCatalogFacts(product("Innbo"), []);
  assert.match(fact(standard, "ansvar.grense").value, /forsikringsbeviset/);
  assert.match(fact(standard, "ansvar.geografi").value, /Norden/);
  assert.match(fact(standard, "rettshjelp.grense").value, /100 000 kr/);
  assert.match(fact(standard, "rettshjelp.grense").value, /250 000 kr/);
  assert.equal(fact(standard, "rettshjelp.grense").source.termsNumber, "PBK-210.100-014");
});

test("alle effektive fakta har komplett kildeproveniens", () => {
  const evidence = resolveCatalogEvidence(product("Innbo Pluss"), []);
  assert.ok(evidence.length > 50);
  for (const item of evidence) {
    assert.equal(item.source.company, "Fremtind");
    assert.ok(item.source.documentId);
    assert.ok(item.source.filename);
    assert.ok(item.source.termsNumber);
    assert.ok(item.source.section);
    assert.ok(item.source.page > 0);
    assert.ok(item.source.url?.startsWith("https://dokument.fremtind.no/"));
  }
});

test("fem selskapers grunn- og toppnivå kan sammenlignes på felles Innbo-nøkler", () => {
  for (const [company, base, top] of [
    ["Tryg", "Innbo", "Innbo Ekstra"], ["If", "Basis", "Super"],
    ["Gjensidige", "Innbo", "Innbo Pluss"], ["Storebrand", "Standard", "Super"],
  ]) {
    for (const [other, fremtind] of [[base, "Innbo"], [top, "Innbo Pluss"]]) {
      const result = compare(manual(company, other), manual("Fremtind", fremtind, "Eika"));
      for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "tyveri.fellesbod.grense",
        "tyveri.uteareal.grense", "ansvar.dekning", "rettshjelp.grense"]) {
        assert.ok(fact(result.terms, key)?.first, `${company}:${other}:${key}:first`);
        assert.ok(fact(result.terms, key)?.second, `${company}:${other}:${key}:second`);
      }
      assert.ok(fact(result.terms, "sykkel.tyveri.grense")?.second, `${company}:${other}:sykkel:second`);
    }
  }
});

test("toppnivåer sammenligner dokumenterte uhell, flytting, skadedyr, ID og boligtilpasning", () => {
  for (const [company, name] of [["Tryg", "Innbo Ekstra"], ["If", "Super"],
    ["Gjensidige", "Innbo Pluss"], ["Storebrand", "Super"]]) {
    const result = compare(manual(company, name), manual("Fremtind", "Innbo Pluss", "Eika"));
    for (const key of ["uhell.dekning", "flytting.transport.grense", "skadedyr.grense",
      "idtyveri.grense", "ulykke.boligtilpasning.grense"]) assert.ok(fact(result.terms, key)?.second, `${company}:${key}`);
  }
});

test("Innbo-prioriteringen beholdes generell for Fremtind", () => {
  const result = compare(manual("Gjensidige", "Innbo Pluss"), manual("Fremtind", "Innbo Pluss", "Eika"));
  const highlights = result.shown.filter((entry) => entry.insuranceKey === "innbo")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  assert.ok(highlights.some((entry) => entry.termKey === "innbo.forsikringssum"));
  assert.ok(highlights.some((entry) => entry.termKey?.startsWith("sykkel.")));
  assert.ok(!highlights.some((entry) => entry.termKey?.startsWith("rettshjelp.")));
  assert.ok(result.shown.some((entry) => entry.termKey === "rettshjelp.grense"));
});

test("UI-formet runtime beholder kanal, produkt, effective/base og presentasjon", () => {
  for (const [company, name] of [["Tryg", "Innbo Ekstra"], ["Storebrand", "Super"]]) {
    const form = new FormData();
    form.set("existingManual", JSON.stringify(input(company, name)));
    form.set("offerManual", JSON.stringify({ ...input("Fremtind", "Innbo Pluss", "Eika"), products: [{
      ...input("Fremtind", "Innbo Pluss", "Eika").products[0], catalogReference: {
        providerId: "fremtind", productId: "fremtind-innbo-topp", version: "2025-01-01",
      },
    }] }));
    const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
    const result = compare(normalizeManualAgreement(JSON.parse(form.get("existingManual"))), right);
    assert.equal(right.insuranceData.distributionChannel, "Eika");
    assert.equal(right.insuranceData.insurances[0].catalogReference.productId, "fremtind-innbo-topp");
    assert.equal(fact(right.insuranceData.insurances[0].importantTerms, "innbo.penger.grense").overriddenBase[0].value, "15 000 kr");
    assert.ok(result.shown.some((entry) => entry.insuranceKey === "innbo"));
  }
});

test("Fremtind Bil og Innbo i samme avtale holder type, kilder og tillegg adskilt", () => {
  const agreement = normalizeManualAgreement({ company: "Fremtind", distributionChannel: "SpareBank 1",
    totalAnnualPremium: "", products: [
      { ...input("Fremtind", "Topp", "SpareBank 1", "Bil", ["fremtind-sb1-leiebil"]).products[0] },
      { ...input("Fremtind", "Innbo Pluss", "SpareBank 1").products[0] },
    ] });
  const [car, contents] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "fremtind-bil-topp");
  assert.equal(contents.catalogReference.productId, "fremtind-innbo-topp");
  assert.ok(car.importantTerms.some((entry) => entry.key === "leiebil.dager"));
  assert.equal(car.importantTerms.some((entry) => entry.key === "skadedyr.grense"), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "skadedyr.grense"));
  assert.equal(contents.importantTerms.some((entry) => entry.key === "leiebil.dager"), false);
  assert.ok(contents.importantTerms.every((entry) => entry.source.company === "Fremtind"));
});

test("katalogreferanse fra annen type eller provider kan ikke lekke inn", () => {
  const wrongType = input("Fremtind", "Innbo Pluss", "Eika");
  wrongType.products[0].catalogReference = { providerId: "fremtind", productId: "fremtind-bil-topp", version: "PMO-357.001-004" };
  assert.throws(() => normalizeManualAgreement(wrongType), /stemmer ikke med selskap/);
  const wrongProvider = input("Fremtind", "Innbo Pluss", "Eika");
  wrongProvider.products[0].catalogReference = { providerId: "storebrand", productId: "sb-innbo-super", version: "innbo09" };
  assert.throws(() => normalizeManualAgreement(wrongProvider), /stemmer ikke med selskap/);
});
