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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/gjensidige/innbo");
const product = (company, name) => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === "Innbo" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (company, name, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Innbo", productName: name,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { groups, terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};
const pdfText = async (filename) => {
  const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
};

test("offisielle Gjensidige Innbo-kilder er lokale, uendrede og kildeidentifisert", async () => {
  const expected = {
    "Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf": "df7af2a169d293e22df138e6561c4c34da854d4923596a828e14bcea7f28cf20",
    "Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf": "4e10857cb9b7832b5661d48089a6024c3622a499d66156b6122f2010574787a1",
    "Gjensidige_IPID_Innbo_EAP02.pdf": "7610a939488c74d4cf0162b0945cc1825779b0d7765847bf522f0c651d6dcf6f",
  };
  for (const [filename, sha256] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), sha256);
  }
  const standard = await pdfText("Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf");
  const plus = await pdfText("Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf");
  const ipid = await pdfText("Gjensidige_IPID_Innbo_EAP02.pdf");
  assert.equal(standard.total, 16);
  assert.equal(plus.total, 18);
  assert.match(ipid.text, /EAP02/);
  assert.match(ipid.text, /Innbo Standard og Innbo Pluss/);
  assert.match(ipid.text, /Pluss dekker i tillegg/);
  assert.match(plus.text, /Innbo og løsøre\s+Ubegrenset/);
  assert.doesNotMatch(standard.pages[0].text, /Innbosum\s+500\s*000/i);
});

test("UI bruker Innbo og Innbo Pluss, mens Innbo Ung holdes utenfor ordinær katalog", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Gjensidige", "Innbo"), ["Innbo", "Innbo Pluss"]);
  assert.equal(productCatalog.products.some((entry) =>
    entry.company === "Gjensidige" && entry.insuranceType === "Innbo" && /ung/iu.test(entry.name)), false);
  assert.deepEqual(resolveProductComponentIds(product("Gjensidige", "Innbo")),
    ["gjInnboShared", "gjInnboStandard"]);
  assert.deepEqual(resolveProductComponentIds(product("Gjensidige", "Innbo Pluss")),
    ["gjInnboShared", "gjInnboStandard", "gjInnboPlus"]);
  assert.deepEqual(productSuggestions(productCatalog, "Gjensidige", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Pluss"]);
});

test("forsikringssum og base/effective følger dagens alminnelige dokumenter", () => {
  const standard = resolveCatalogFacts(product("Gjensidige", "Innbo"), []);
  const plus = resolveCatalogFacts(product("Gjensidige", "Innbo Pluss"), []);
  assert.match(fact(standard, "innbo.forsikringssum").value, /ikke oppgitt/);
  assert.equal(fact(standard, "innbo.forsikringssum").deductibleClassification, "reference");
  assert.match(fact(plus, "innbo.forsikringssum").value, /Ubegrenset/);
  assert.equal(fact(plus, "innbo.verdigjenstander.grense").value,
    "500 000 kr for hver angitt kategori og per øvrig enkeltgjenstand eller samling");
  assert.equal(fact(standard, "tyveri.fellesbod.grense").value, "30 000 kr");
  assert.match(fact(plus, "tyveri.fellesbod.grense").value, /ubegrenset innbosum/);
  const detail = manual("Gjensidige", "Innbo Pluss").insuranceData.insurances[0].importantTerms;
  assert.match(fact(detail, "innbo.forsikringssum").overriddenBase[0].value, /ikke oppgitt/);
  assert.equal(fact(detail, "innbo.forsikringssum").source.documentId, "gjInnboPlus");
});

test("brann, vann, natur, ansvar, rettshjelp og bygningsglass har kilder og riktige grenser", () => {
  const terms = resolveCatalogFacts(product("Gjensidige", "Innbo"), []);
  for (const key of ["brann.dekning", "vann.dekning", "naturskade.dekning", "ansvar.dekning",
    "rettshjelp.dekning", "glass.sanitaer.dekning"]) assert.ok(fact(terms, key), key);
  assert.equal(fact(terms, "ansvar.grense").value, "5 000 000 kr per skadetilfelle");
  assert.equal(fact(terms, "ansvar.egenandel").value, "4 000 kr per skadetilfelle");
  assert.match(fact(terms, "rettshjelp.grense").value, /250 000 kr for 3–10/);
  assert.match(fact(terms, "rettshjelp.grense").value, /1 000 000 kr for minst 50/);
  assert.equal(fact(terms, "glass.sanitaer.egenandel").value, "3 000 kr");
});

test("Innbo Pluss strukturerer uhell, sykkel, mobil, skadedyr, flytting og ID-tyveri", () => {
  const plus = resolveCatalogFacts(product("Gjensidige", "Innbo Pluss"), []);
  assert.match(fact(plus, "uhell.dekning").value, /30 000 kr i hele verden/);
  assert.equal(fact(plus, "sykkel.uhell.grense").value,
    "30 000 kr i Norden; ritt, løp og konkurranse er unntatt");
  assert.match(fact(plus, "sykkel.veihjelp.dekning").value, /offentlig vei/);
  assert.equal(fact(plus, "sykkel.veihjelp.egenandel").value, "500 kr");
  assert.equal(fact(plus, "mobil.skjerm.egenandel").value,
    "1 000 kr ved bruk av samarbeidspartner; 3 000 kr ellers");
  assert.equal(fact(plus, "skadedyr.grense").value, "150 000 kr per skade");
  assert.match(fact(plus, "flytting.transport.grense").value, /ny bolig i Norge/);
  assert.match(fact(plus, "idtyveri.grense").value, /Ingen økonomisk forsikringssum/);
});

test("utleie og høyere sykkelsum er valg, ikke ubetinget Pluss-dekning", () => {
  const plus = product("Gjensidige", "Innbo Pluss");
  assert.deepEqual(availableAddOns(plus).map((entry) => entry.id),
    ["gj-innbo-utleie", "gj-innbo-sykkel-hoyere-sum"]);
  const without = resolveCatalogFacts(plus, []);
  assert.equal(fact(without, "utleie.dekning"), undefined);
  const withRental = resolveCatalogFacts(plus, ["gj-innbo-utleie"]);
  assert.match(fact(withRental, "utleie.dekning").value, /bare når utleie er angitt/);
  assert.equal(fact(withRental, "utleie.husleietap.grense").value,
    "Inntil 6 måneders husleie, én gang per leietaker");
  assert.equal(fact(withRental, "utleie.utkastelse.grense").value, "20 000 kr");
  assert.equal(fact(withRental, "utleie.egenandel").value,
    "10 000 kr ved misligholdt husleie og skadeverk utført av leietaker");
  const bicycle = resolveCatalogFacts(plus, ["gj-innbo-sykkel-hoyere-sum"]);
  assert.match(fact(bicycle, "sykkel.tyveri.grense").value, /må kontrolleres i forsikringsbeviset/);
});

test("egenandelene er klassifisert uten å blande generell og særskilt verdi", () => {
  const evidence = resolveCatalogEvidence(product("Gjensidige", "Innbo Pluss"), ["gj-innbo-utleie"]);
  assert.equal(fact(evidence, "innbo.egenandel").deductibleClassification, "standard");
  assert.equal(fact(evidence, "naturskade.egenandel").deductibleClassification, "override");
  assert.equal(fact(evidence, "mobil.skjerm.egenandel").deductibleClassification, "override");
  assert.equal(fact(evidence, "utleie.egenandel").deductibleClassification, "override");
  assert.ok(fact(evidence, "sikkerhet.sykkel"));
  assert.ok(fact(evidence, "sikkerhet.transport"));
});

test("Tryg Innbo mot Gjensidige Innbo sammenligner dokumenterte fellesbegreper", () => {
  const result = compare(manual("Tryg", "Innbo"), manual("Gjensidige", "Innbo"));
  for (const key of ["innbo.forsikringssum", "innbo.yrkeslosore.grense", "innbo.datalager.grense",
    "sykkel.tyveri.grense", "ansvar.dekning", "rettshjelp.grense"]) {
    assert.ok(fact(result.terms, key), key);
    assert.ok(fact(result.terms, key).first, key);
    assert.ok(fact(result.terms, key).second, key);
  }
  assert.equal(fact(result.terms, "sykkel.tyveri.grense").second,
    "30 000 kr per sykkel eller sykkeltilhenger utenfor bygning på forsikringsstedet eller bebodd bolig");
});

test("Tryg Innbo Ekstra mot Gjensidige Pluss beholder reelle forskjeller", () => {
  const result = compare(manual("Tryg", "Innbo Ekstra"), manual("Gjensidige", "Innbo Pluss"));
  assert.match(fact(result.terms, "innbo.forsikringssum").second, /Ubegrenset/);
  assert.equal(fact(result.terms, "skadedyr.grense").first, "150 000 kr per skadetilfelle");
  assert.equal(fact(result.terms, "skadedyr.grense").second, "150 000 kr per skade");
  assert.equal(fact(result.terms, "sykkel.tyveri.grense").first, "40 000 kr per gjenstand");
  assert.match(fact(result.terms, "sykkel.tyveri.grense").second, /30 000 kr/);
  assert.ok(fact(result.terms, "mobil.skjerm.dekning").second);
  assert.ok(result.shown.some((entry) => entry.termKey === "innbo.forsikringssum"));
});

test("If Basis mot Gjensidige Innbo bruker samme ansvar- og rettshjelpsnøkler", () => {
  const result = compare(manual("If", "Basis"), manual("Gjensidige", "Innbo"));
  assert.equal(fact(result.terms, "ansvar.grense").first,
    "5 000 000 kr per skadetilfelle; saksomkostninger dekkes i tillegg");
  assert.equal(fact(result.terms, "ansvar.grense").second, "5 000 000 kr per skadetilfelle");
  assert.match(fact(result.terms, "rettshjelp.grense").first, /250 000 kr/);
  assert.match(fact(result.terms, "rettshjelp.grense").second, /250 000 kr/);
  assert.ok(fact(result.terms, "tyveri.fellesbod.grense").first);
  assert.ok(fact(result.terms, "tyveri.fellesbod.grense").second);
});

test("If Utvidet og Super mot Gjensidige Pluss holder delvis overlappende konsepter adskilt", () => {
  for (const ifLevel of ["Utvidet", "Super"]) {
    const result = compare(manual("If", ifLevel), manual("Gjensidige", "Innbo Pluss"));
    for (const key of ["uhell.dekning", "tyveri.utenforhjem.grense", "skadedyr.grense",
      "flytting.transport.grense", "idtyveri.dekning"]) {
      assert.ok(fact(result.terms, key)?.first, `${ifLevel}:${key}:first`);
      assert.ok(fact(result.terms, key)?.second, `${ifLevel}:${key}:second`);
    }
    assert.ok(fact(result.terms, "mobil.skjerm.dekning").second);
  }
});

test("UI-formet runtime beholder Pluss, utleie, effective/base og presentasjon", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Innbo", productName: "Innbo Ekstra", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "tryg", productId: "tryg-innbo-ekstra", version: "2026-07-01" }, addOnIds: ["tryg-innbo-utleie"],
  }] }));
  form.set("offerManual", JSON.stringify({ company: "Gjensidige", totalAnnualPremium: "", products: [{
    type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "gjensidige", productId: "gj-innbo-pluss", version: null }, addOnIds: ["gj-innbo-utleie"],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right);
  assert.equal(right.insuranceData.insurances[0].catalogReference.productId, "gj-innbo-pluss");
  assert.deepEqual(right.insuranceData.insurances[0].addOnIds, ["gj-innbo-utleie"]);
  assert.equal(fact(result.terms, "utleie.utkastelse.grense").second, "20 000 kr");
  assert.match(fact(result.terms, "innbo.forsikringssum").second, /Ubegrenset/);
  assert.ok(result.shown.length > 0);
});

test("Innbo-hovedvisningen prioriterer sentrale dekninger og utleie foran rettshjelp", () => {
  const result = compare(
    manual("Tryg", "Innbo Ekstra", ["tryg-innbo-utleie"]),
    manual("Gjensidige", "Innbo Pluss", ["gj-innbo-utleie"]),
  );
  const highlights = result.shown
    .filter((difference) => difference.insuranceKey === "innbo" && difference.type !== "price")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
  const keys = highlights.map((difference) => difference.termKey);

  assert.equal(keys[0], "innbo.forsikringssum");
  for (const key of ["uhell.dekning", "tyveri.utenforhjem.grense", "sykkel.tyveri.grense",
    "tyveri.uteareal.grense", "utleie.egenandel"]) {
    assert.ok(keys.includes(key), `${key} mangler i hovedvisningen: ${keys.join(", ")}`);
  }
  assert.ok(!keys.some((key) => key?.startsWith("rettshjelp.")));
  assert.ok(result.shown.some((difference) => difference.termKey === "rettshjelp.grense"));
  assert.ok(result.shown.some((difference) => difference.termKey === "rettshjelp.egenandel"));
});

test("Bil og Innbo på begge sider har ingen provider-, tillegg- eller kildelekkasje", () => {
  const left = normalizeManualAgreement({ company: "If", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["if-leiebil"] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  const right = normalizeManualAgreement({ company: "Gjensidige", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["gj-punktering"] },
    { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["gj-innbo-utleie"] },
  ] });
  const [car, contents] = right.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "gj-bil-pluss");
  assert.deepEqual(car.addOnIds, ["gj-punktering"]);
  assert.equal(contents.catalogReference.productId, "gj-innbo-pluss");
  assert.deepEqual(contents.addOnIds, ["gj-innbo-utleie"]);
  assert.ok(car.importantTerms.some((entry) => entry.key === "punktering.dekning"));
  assert.equal(car.importantTerms.some((entry) => entry.key === "utleie.dekning"), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "utleie.dekning"));
  assert.equal(contents.importantTerms.some((entry) => entry.key === "punktering.dekning"), false);
  assert.ok(contents.importantTerms.every((entry) => entry.source.company === "Gjensidige"));
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  assert.deepEqual(groups.map((group) => group.key).sort(), ["bil", "innbo"]);
});
