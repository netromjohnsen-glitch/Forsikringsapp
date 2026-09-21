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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/sparebank1-fremtind");
const company = "SpareBank 1 / Fremtind";
const level = (name) => productCatalog.products.find((product) => product.company === company && product.name === name);
const fact = (items, key) => items.find((item) => item.key === key);
const manual = (selectedCompany, productName, addOnIds = [], deductible = "") => normalizeManualAgreement({
  company: selectedCompany, totalAnnualPremium: "", products: [{ type: "Bil", productName,
    annualPremium: "", deductible, coverageSummary: "", importantTerms: [], addOnIds }],
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

test("offisielle SpareBank 1/Fremtind-kilder har kontrollert identitet, versjon og dato", async () => {
  const sources = Object.values(productCatalog.sources).filter((source) => source.id.startsWith("sp1"));
  assert.equal(sources.length, 10);
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
    assert.match(source.url, /^https:\/\/dokument\.fremtind\.no\//);
  }

  const top = await pdf(productCatalog.sources.sp1Toppkasko);
  const leiebil = await pdf(productCatalog.sources.sp1Leiebil);
  const maskin = await pdf(productCatalog.sources.sp1Maskinskade);
  const ipid = await pdf(productCatalog.sources.sp1Ipid);
  assert.equal(top.total, 12);
  assert.equal(leiebil.total, 1);
  assert.equal(maskin.total, 2);
  assert.equal(ipid.total, 2);
  assert.match(top.pages[0].text, /PMO-357\.001-004 av 18\.09\.2025/);
  assert.match(top.pages[7].text, /PMO-350\.200-016 av 18\.09\.2025/);
  assert.match(leiebil.pages[0].text, /PMO-350\.402-003 av 18\.09\.2025/);
  assert.match(maskin.pages[0].text, /PMO-350\.201-001 av 18\.09\.2025/);
  assert.match(ipid.pages[0].text, /V\.106/);
});

test("PDF-ankere dokumenterer produktarv og sentrale bilgrenser", async () => {
  const top = await pdf(productCatalog.sources.sp1Toppkasko);
  const leiebil = await pdf(productCatalog.sources.sp1Leiebil);
  const maskin = await pdf(productCatalog.sources.sp1Maskinskade);
  const ipid = await pdf(productCatalog.sources.sp1Ipid);
  for (const [page, anchor] of [
    [2, /Personskade med ubegrenset beløp/],
    [3, /100 000 kroner per person ved død/],
    [4, /Fastmontert tilleggsutstyr inntil 50 000 kroner/],
    [5, /ikke har vært kjørt over 15 000 kilometer/],
    [8, /Kaskoforsikring Vilkårs id: PMO-357\.220-007/],
    [9, /ikke har vært kjørt over 100 000 kilometer/],
  ]) assert.match(top.pages[page - 1].text, anchor, `Toppkasko side ${page}`);
  assert.match(leiebil.pages[0].text, /normal reparasjonstid, inntil 45\s+dager/);
  assert.match(maskin.pages[0].text, /blitt 10 år eller til 200 000 km/);
  assert.match(maskin.pages[1].text, /Inntil 99 999 km\s+10 000 kroner/);
  assert.match(ipid.pages[0].text, /Minikasko dekker i tillegg/);
  assert.match(ipid.pages[0].text, /Valgfri tilleggsdekning på kasko/);
  assert.match(ipid.pages[0].text, /Topp dekker i tillegg/);
});

test("fire SpareBank 1-nivåer har dokumentert arv og effektiv base/utvidelse", () => {
  assert.deepEqual(productSuggestions(productCatalog, company, "Bil"), ["Ansvar", "Delkasko", "Kasko", "Toppkasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Ansvar")), ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp"]);
  assert.deepEqual(resolveProductComponentIds(level("Delkasko")), ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp", "sp1Delkasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Kasko")), ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp", "sp1Delkasko", "sp1Kasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Toppkasko")), ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp", "sp1Delkasko", "sp1Kasko", "sp1Toppkasko"]);

  assert.equal(fact(resolveCatalogFacts(level("Ansvar"), []), "brann.dekning"), undefined);
  assert.equal(fact(resolveCatalogFacts(level("Delkasko"), []), "kasko.dekning"), undefined);
  const effective = resolveCatalogFacts(level("Toppkasko"), []);
  assert.match(fact(effective, "nyverdi.alder").value, /3 år/);
  assert.match(fact(effective, "nyverdi.km").value, /100 000 km/);
  const evidence = resolveCatalogEvidence(level("Toppkasko"), []);
  assert.equal(evidence.filter((item) => item.key === "nyverdi.alder").length, 2);
  const detail = manual(company, "Toppkasko").insuranceData.insurances[0].importantTerms;
  assert.match(fact(detail, "nyverdi.alder").overriddenBase[0].value, /1 år/);
  assert.match(fact(detail, "nyverdi.km").overriddenBase[0].value, /15 000 km/);
  assert.equal(fact(detail, "nyverdi.alder").source.company, "Fremtind");
});

test("Leiebil og Maskinskade er uavhengige tillegg bare på Kasko og Toppkasko", () => {
  assert.deepEqual(availableAddOns(level("Ansvar")), []);
  assert.deepEqual(availableAddOns(level("Delkasko")), []);
  for (const name of ["Kasko", "Toppkasko"]) {
    assert.deepEqual(availableAddOns(level(name)).map((addOn) => addOn.id), ["sb1-leiebil", "sb1-maskinskade"]);
    assert.equal(fact(resolveCatalogFacts(level(name), []), "leiebil.dager"), undefined);
    assert.equal(fact(resolveCatalogFacts(level(name), []), "maskinskade.alder"), undefined);
    const selected = resolveCatalogFacts(level(name), ["sb1-leiebil", "sb1-maskinskade"]);
    assert.match(fact(selected, "leiebil.dager").value, /45 dager/);
    assert.match(fact(selected, "maskinskade.alder").value, /10 år/);
    assert.match(fact(selected, "maskinskade.km").value, /200 000 km/);
  }
});

test("SpareBank 1 Toppkasko med tillegg sammenlignes kildeisolert mot Tryg", () => {
  const result = compare(
    manual(company, "Toppkasko", ["sb1-leiebil", "sb1-maskinskade"]),
    manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"]),
  );
  assert.match(fact(result.terms, "nyverdi.km").first, /100 000 km/);
  assert.match(fact(result.terms, "nyverdi.km").second, /60 000 km/);
  assert.match(fact(result.terms, "leiebil.dager").first, /45 dager/);
  assert.match(fact(result.terms, "leiebil.dager").second, /60 dager/);
  assert.deepEqual(fact(result.terms, "maskinskade.alder").firstSources.map((source) => source.company), ["Fremtind"]);
  assert.deepEqual(fact(result.terms, "maskinskade.alder").secondSources.map((source) => source.company), ["Tryg"]);
  assert.ok(result.shown.some((item) => item.conceptId === "bil.totalskade" &&
    item.items.some((detail) => detail.termKey === "nyverdi.km")));
});

test("Brann mot Tryg beholdes som kildebasert uvisshet når åpen flamme bare er uttrykkelig på én side", () => {
  const result = compare(
    manual(company, "Toppkasko"),
    manual("Tryg", "Kasko", ["bil-ekstra"]),
  );
  const fire = fact(result.terms, "brann.dekning");
  assert.equal(fire.first, "Brann, lynnedslag og eksplosjon");
  assert.equal(fire.second, "Åpen flamme, eksplosjon og lynnedslag");
  assert.equal(fire.firstSources[0].termsNumber, "PMO-357.210-012");
  assert.equal(fire.firstSources[0].section, "2.1");
  assert.equal(fire.firstSources[0].page, 4);
  assert.equal(fire.secondSources[0].termsNumber, "PAU25205");
  assert.equal(fire.secondSources[0].section, "2.2");
  assert.equal(fire.secondSources[0].page, 2);
  assert.ok(result.raw.some((difference) => difference.termKey === "brann.dekning"));
});

test("SpareBank 1 Toppkasko med tillegg sammenlignes mot If uten å oppfinne If-alder", () => {
  const result = compare(
    manual(company, "Toppkasko", ["sb1-leiebil", "sb1-maskinskade"]),
    manual("If", "Super", ["if-leiebil", "if-motor-gir"]),
  );
  assert.match(fact(result.terms, "leiebil.dager").first, /45 dager/);
  assert.match(fact(result.terms, "leiebil.dager").second, /90 dager/);
  assert.match(fact(result.terms, "maskinskade.alder").first, /10 år/);
  assert.equal(fact(result.terms, "maskinskade.alder").second, null);
  assert.equal(fact(result.terms, "maskinskade.alder").secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.match(fact(result.terms, "ulykke.dod").first, /1 år/);
  assert.match(fact(result.terms, "ulykke.dod").second, /2 år/);
});

test("SpareBank 1 Toppkasko med tillegg sammenlignes mot Gjensidige", () => {
  const result = compare(
    manual(company, "Toppkasko", ["sb1-leiebil", "sb1-maskinskade"]),
    manual("Gjensidige", "Pluss"),
  );
  assert.match(fact(result.terms, "nyverdi.alder").first, /3 år/);
  assert.match(fact(result.terms, "nyverdi.alder").second, /1 år/);
  assert.match(fact(result.terms, "leiebil.dager").first, /45 dager/);
  assert.match(fact(result.terms, "leiebil.dager").second, /60 dager/);
  assert.match(fact(result.terms, "maskinskade.alder").first, /10 år/);
  assert.match(fact(result.terms, "maskinskade.alder").second, /12 år/);
  assert.equal(fact(result.terms, "ansvar.ting.grense").firstSources[0].termsNumber, "FMO-001.100-007");
  assert.equal(fact(result.terms, "rettshjelp.grense").firstSources[0].termsNumber, "FFE-003.001-003");
});

test("SpareBank 1 Toppkasko med tillegg sammenlignes mot Storebrand", () => {
  const result = compare(
    manual(company, "Toppkasko", ["sb1-leiebil", "sb1-maskinskade"], "6 000 kr"),
    manual("Storebrand", "Super", ["sb-leiebil"], "4 000 kr"),
  );
  assert.match(fact(result.terms, "nyverdi.km").first, /100 000 km/);
  assert.match(fact(result.terms, "nyverdi.km").second, /60 000 km/);
  assert.match(fact(result.terms, "leiebil.dager").first, /45 dager/);
  assert.match(fact(result.terms, "leiebil.dager").second, /60 dager/);
  assert.match(fact(result.terms, "maskinskade.alder").first, /10 år/);
  assert.match(fact(result.terms, "maskinskade.alder").second, /12 år/);
  assert.ok(result.raw.some((item) => item.kind === "deductible" && /kundespesifikk/.test(item.text)));
  assert.equal(fact(result.terms, "kasko.egenandel").firstDeductibleClassifications[0], "reference");
});

test("UI-formet manuell request beholder begge SpareBank 1-tillegg gjennom presentasjonen", () => {
  const reference = { providerId: "sparebank1-fremtind", productId: "sb1-bil-toppkasko", version: "PMO-357.001-004" };
  const formData = new FormData();
  formData.set("existingManual", JSON.stringify({ company, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Toppkasko", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: reference, addOnIds: ["sb1-leiebil", "sb1-maskinskade"],
  }] }));
  formData.set("offerManual", JSON.stringify({ company: "If", totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "if", productId: "if-bil-super", version: "MOT2-2" },
    addOnIds: ["if-leiebil", "if-motor-gir"],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(formData.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(formData.get("offerManual")));
  assert.deepEqual(left.insuranceData.insurances[0].addOnIds, ["sb1-leiebil", "sb1-maskinskade"]);
  const result = compare(left, right);
  assert.ok(result.shown.some((item) => item.conceptId === "bil.mobilitet" &&
    item.items.some((detail) => detail.termKey === "leiebil.dager")));
  assert.match(fact(result.terms, "maskinskade.alder").first, /10 år/);
  assert.equal(fact(result.terms, "maskinskade.alder").second, null);
  assert.equal(fact(result.terms, "leiebil.dager").firstSources[0].documentId, "sp1Leiebil");
  assert.equal(fact(result.terms, "maskinskade.alder").firstSources[0].documentId, "sp1Maskinskade");
});
