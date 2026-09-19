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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/storebrand");
const level = (name) => productCatalog.products.find((p) =>
  p.company === "Storebrand" && p.insuranceType === "Bil" && p.name === name);
const bilSourceIds = ["sbAnsvar", "sbDelkasko", "sbKasko", "sbSuper", "sbLeiebil", "sbLeiebilUtvidet", "sbGenerelle"];
const fact = (items, key) => items.find((item) => item.key === key);
const manual = (company, productName, addOnIds = [], deductible = "") => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName, annualPremium: "",
    deductible, coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};
async function pdf(source) {
  const parser = new PDFParse({ data: await readFile(path.join(root, source.filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
}

test("Storebrands lokalt lagrede offisielle vilkår har kontrollert identitet, dato og kilde", async () => {
  for (const source of bilSourceIds.map((id) => productCatalog.sources[id])) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.match(source.url, /^https:\/\/www\.storebrand\.no\//);
  }
  const motor = await pdf(productCatalog.sources.sbAnsvar);
  const general = await pdf(productCatalog.sources.sbGenerelle);
  assert.equal(motor.total, 33);
  assert.equal(general.total, 11);
  assert.match(motor.pages[0].text, /17032q Vilkår motorvogn/);
  assert.match(motor.pages[0].text, /motor09/);
  assert.match(motor.pages[0].text, /Gjelder fra 1\. april 2025/);
  assert.match(general.pages[0].text, /gener07/);
  assert.match(general.pages[0].text, /Gjelder fra 01\.09\.2026/);
  assert.match(motor.pages[0].text, /forsikringsbeviset foran/);
  for (const [id, facts] of Object.entries(productCatalog.facts).filter(([id]) => bilSourceIds.includes(id))) {
    for (const item of facts) {
      assert.equal(item.source.documentId, id);
      assert.equal(item.source.company, "Storebrand");
      assert.equal(item.source.termsNumber, "motor09");
      assert.equal(item.source.effectiveFrom, "2025-04-01");
      assert.ok(item.source.page >= 1 && item.source.page <= 33);
      assert.ok(item.source.section);
    }
  }
});

test("PDF-ankere støtter produktarv, reelle grenser, tillegg og egenandelsforbehold", async () => {
  const motor = await pdf(productCatalog.sources.sbAnsvar);
  const anchors = [
    [3, /Delkasko Kasko Super/], [9, /6\.1 Ansvarsforsikring/],
    [12, /i tillegg til\s+punkt 6\.2 Delkaskoforsikring/],
    [13, /i tillegg til punkt 6\.2/], [13, /1 år\/15\.000 km/],
    [13, /3 år \/ 60\.000 km/], [14, /inntil 200\.000 km og fram til bilen er 12 år/],
    [16, /0 – 99\.999 km/], [18, /Når det fremgår av Forsikringsbeviset at det er avtalt dekning av leiebilkostnader/],
    [19, /Ved reparasjon betales leiebil i inntil 60 dager/],
    [10, /Hvis ikke annet framgår av forsikringsbeviset er egenandelen for brann 8\.000 kroner/],
  ];
  for (const [page, anchor] of anchors) assert.match(motor.pages[page - 1].text, anchor, `side ${page}`);
});

test("fire nivåer og dokumentert arv gir riktige effektive verdier og grunnverdier", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Storebrand", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Super"]);
  assert.deepEqual(resolveProductComponentIds(level("Ansvar")), ["sbAnsvar"]);
  assert.deepEqual(resolveProductComponentIds(level("Delkasko")), ["sbAnsvar", "sbDelkasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Kasko")), ["sbAnsvar", "sbDelkasko", "sbKasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Super")), ["sbAnsvar", "sbDelkasko", "sbKasko", "sbSuper"]);
  assert.equal(fact(resolveCatalogFacts(level("Ansvar"), []), "brann.dekning"), undefined);
  assert.equal(fact(resolveCatalogFacts(level("Delkasko"), []), "nyverdi.alder"), undefined);
  assert.equal(fact(resolveCatalogFacts(level("Kasko"), []), "maskinskade.alder"), undefined);
  const superFacts = resolveCatalogFacts(level("Super"), []);
  assert.equal(fact(superFacts, "nyverdi.alder").value, "Innen 3 år etter registrering som fabrikkny");
  assert.equal(fact(superFacts, "nyverdi.km").value, "Høyst 60 000 km");
  assert.equal(fact(superFacts, "tilbehor.grense").source.documentId, "sbSuper");
  assert.equal(fact(superFacts, "bagasje.grense").source.documentId, "sbSuper");
  const evidence = resolveCatalogEvidence(level("Super"), []);
  assert.equal(evidence.filter((item) => item.key === "nyverdi.alder").length, 2);
  const detail = manual("Storebrand", "Super").insuranceData.insurances[0].importantTerms;
  for (const [key, base, effective] of [
    ["nyverdi.alder", /1 år/, /3 år/], ["nyverdi.km", /15 000 km/, /60 000 km/],
    ["tilbehor.grense", /20 000 kr/, /50 000 kr/],
  ]) {
    assert.match(fact(detail, key).value, effective);
    assert.match(fact(detail, key).overriddenBase[0].value, base);
    assert.equal(fact(detail, key).overriddenBase[0].source.company, "Storebrand");
    assert.equal(fact(detail, key).source.documentId, "sbSuper");
  }
});

test("leiebil er valgfritt på Kasko/Super med to dokumenterte, alternative klasser", () => {
  assert.deepEqual(availableAddOns(level("Ansvar")), []);
  assert.deepEqual(availableAddOns(level("Delkasko")), []);
  for (const name of ["Kasko", "Super"]) {
    const ids = availableAddOns(level(name)).map((item) => item.id);
    assert.deepEqual(ids, ["sb-leiebil", "sb-leiebil-utvidet"]);
    assert.equal(fact(resolveCatalogFacts(level(name), []), "leiebil.dager"), undefined);
    assert.match(fact(resolveCatalogFacts(level(name), ["sb-leiebil"]), "leiebil.bilklasse").value, /klasse C/);
    assert.match(fact(resolveCatalogFacts(level(name), ["sb-leiebil-utvidet"]), "leiebil.bilklasse").value, /klasse I/);
    assert.throws(() => resolveCatalogFacts(level(name), ids), /Alternative/);
  }
  assert.throws(() => resolveCatalogFacts(level("Super"), ["if-leiebil"]));
  assert.throws(() => resolveCatalogFacts(level("Kasko"), ["maskinskade"]));
  assert.equal(manual("Storebrand", "Super", ["sb-leiebil"]).insuranceData.insurances[0].addOnIds[0], "sb-leiebil");
});

test("Storebrand Super mot Tryg Kasko med tillegg sammenligner dokumenterte grenser uten sidellekkasje", () => {
  const { terms, raw, shown } = compare(
    manual("Storebrand", "Super", ["sb-leiebil-utvidet"]),
    manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"]),
  );
  assert.equal(fact(terms, "maskinskade.alder").firstSources[0].termsNumber, "motor09");
  assert.equal(fact(terms, "maskinskade.alder").secondSources[0].termsNumber, "PAU27110");
  assert.match(fact(terms, "maskinskade.alder").first, /12 år/);
  assert.match(fact(terms, "maskinskade.alder").second, /10 år/);
  assert.ok(raw.some((item) => item.termKey === "maskinskade.alder"));
  assert.ok(shown.some((item) => item.title === "Motor/gir/kraftoverføring"));
  assert.equal(raw.some((item) => item.termKey === "brann.dekning"), false);
  assert.ok(raw.some((item) => item.termKey === "leiebil.dager"));
  assert.match(fact(terms, "leiebil.vilkar.etter30").first, /30 dager/);
  assert.equal(fact(terms, "leiebil.vilkar.etter30").secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.equal(fact(terms, "nyverdi.alder").firstBaseFacts[0].source.documentId, "sbKasko");
  assert.deepEqual(fact(terms, "nyverdi.alder").secondBaseFacts.map((item) => item.source.company), ["Tryg"]);
  assert.equal(fact(terms, "rettshjelp.dekning").secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
});

test("Storebrand Super mot If Super beholder 60 mot 90 dager og usikker If-alder", () => {
  const { terms, raw, shown } = compare(
    manual("Storebrand", "Super", ["sb-leiebil"]),
    manual("If", "Super", ["if-motor-gir", "if-leiebil"]),
  );
  assert.match(fact(terms, "leiebil.dager").first, /60 dager/);
  assert.match(fact(terms, "leiebil.dager").second, /90 dager/);
  assert.equal(fact(terms, "leiebil.dager").firstSources[0].company, "Storebrand");
  assert.equal(fact(terms, "leiebil.dager").secondSources[0].company, "If");
  assert.ok(shown.some((item) => item.termKey === "leiebil.dager"));
  assert.equal(fact(terms, "maskinskade.alder").second, null);
  assert.equal(fact(terms, "maskinskade.alder").secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.ok(!raw.some((item) => item.termKey === "ulykke.dod"));
  assert.equal(raw.some((item) => item.termKey === "brann.dekning"), false);
});

test("Storebrand Super mot Gjensidige Pluss beholder nyverdi- og dødsfallsforskjeller", () => {
  const { terms, raw, shown } = compare(manual("Storebrand", "Super", ["sb-leiebil-utvidet"]), manual("Gjensidige", "Pluss"));
  assert.match(fact(terms, "nyverdi.alder").first, /3 år/);
  assert.match(fact(terms, "nyverdi.alder").second, /1 år/);
  assert.match(fact(terms, "nyverdi.km").first, /60 000 km/);
  assert.match(fact(terms, "nyverdi.km").second, /20 000 km/);
  assert.ok(shown.some((item) => item.title === "Totalskadegaranti"));
  assert.match(fact(terms, "ulykke.dod").first, /2 år/);
  assert.match(fact(terms, "ulykke.dod").second, /1 år/);
  assert.ok(raw.some((item) => item.termKey === "ulykke.dod"));
  assert.equal(raw.some((item) => item.termKey === "brann.dekning"), false);
  assert.equal(fact(terms, "maskinskade.alder").firstSources[0].company, "Storebrand");
  assert.equal(fact(terms, "maskinskade.alder").secondSources[0].company, "Gjensidige");
});

test("egenandelsklasser lar avtalt kundeverdi stå separat fra standard og særskilt vilkår", () => {
  const left = manual("Storebrand", "Super", [], "6 000 kr");
  const right = manual("If", "Super", [], "4 000 kr");
  const { terms, raw } = compare(left, right);
  assert.equal(left.insuranceData.insurances[0].deductible, "6 000 kr");
  assert.equal(right.insuranceData.insurances[0].deductible, "4 000 kr");
  assert.ok(raw.some((item) => item.kind === "deductible" && /kundespesifikk/.test(item.text)));
  const standard = fact(terms, "brann.egenandel");
  assert.deepEqual(standard.firstDeductibleClassifications, ["standard"]);
  assert.deepEqual(standard.secondDeductibleClassifications, ["standard"]);
  assert.equal(raw.some((item) => item.termKey === "brann.egenandel"), false);
  assert.equal(standard.firstSources[0].documentId, "sbDelkasko");
  assert.equal(fact(terms, "glass.egenandel.bytte").firstDeductibleClassifications[0], "coverage");
  assert.equal(fact(terms, "maskinskade.egenandel.0-99999").firstSources[0].page, 16);
  assert.equal(left.insuranceData.totalAnnualPremium, null);
});
