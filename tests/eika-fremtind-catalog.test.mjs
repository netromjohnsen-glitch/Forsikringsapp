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
import { EIKA_FREMTIND_URLS } from "../lib/eika-fremtind-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogFacts,
  resolveProductComponentIds } from "../lib/product-catalog.ts";
import { SPAREBANK1_FREMTIND_URLS } from "../lib/sparebank1-fremtind-catalog.ts";

PDFParse.setWorker(getPath());
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoot = path.join(workspace, "catalog/sources/sparebank1-fremtind");
const eikaRoot = path.join(workspace, "catalog/sources/eika-fremtind");
const eikaCompany = "Eika / Fremtind";
const sb1Company = "SpareBank 1 / Fremtind";
const dnbCompany = "DNB / Fremtind";
const level = (company, name) => productCatalog.products.find((product) => product.company === company && product.name === name);
const fact = (items, key) => items.find((item) => item.key === key);
const manual = (company, productName, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};
async function pdf(filename, root = canonicalRoot) {
  const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
}

test("Eikas gjeldende Bil og IPID er byte-identiske kanoniske Fremtind-kilder", async () => {
  assert.equal(EIKA_FREMTIND_URLS.bil, SPAREBANK1_FREMTIND_URLS.toppkasko);
  assert.equal(EIKA_FREMTIND_URLS.ipid, SPAREBANK1_FREMTIND_URLS.ipid);
  for (const [filename, hash] of [
    ["Vilkar_Toppkasko_Bil.pdf", "cc9af96bd2f91dffe76dced3d58481007d3036ba452e695f4f2b4a9489e01781"],
    ["IPID_Bil.pdf", "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94"],
  ]) {
    assert.equal(createHash("sha256").update(await readFile(path.join(canonicalRoot, filename))).digest("hex"), hash);
  }
  const terms = await pdf("Vilkar_Toppkasko_Bil.pdf");
  const ipid = await pdf("IPID_Bil.pdf");
  assert.match(terms.pages[7].text, /PMO-350\.200-016 av 18\.09\.2025/);
  assert.match(ipid.pages[0].text, /V\.106/);
  assert.match(ipid.pages[0].text, /ansvar, minikasko, kasko, og topp/i);
});

test("M05P dokumenterer en annen Pluss-struktur og aktiveres ikke som dagens Topp", async () => {
  const bytes = await readFile(path.join(eikaRoot, "IPID_Bil_M05P.pdf"));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "c61cbb28ca62e2e7840b1513e6d38f2ea85116a27bbc9e5942d29062684ecadb");
  const legacy = await pdf("IPID_Bil_M05P.pdf", eikaRoot);
  assert.match(legacy.text, /Pluss \(4\)/);
  assert.match(legacy.text, /Maskinskade inntil 6 år \/ 60 000km/);
  assert.match(legacy.text, /Parkeringsbulk uten bonustap inntil\s+kr 40 000/);
  assert.match(legacy.text, /Totalskadegaranti 3 år \/ 100 000 km/);
  assert.deepEqual(productSuggestions(productCatalog, eikaCompany, "Bil"), ["Ansvar", "Delkasko", "Kasko", "Topp"]);
  assert.equal(productSuggestions(productCatalog, eikaCompany, "Bil").includes("Pluss"), false);
});

test("Eika Topp gjenbruker hele hovedproduktet, med effective/base og Parkeringsskade", () => {
  const eika = level(eikaCompany, "Topp");
  const sb1 = level(sb1Company, "Toppkasko");
  const dnb = level(dnbCompany, "Topp");
  assert.deepEqual(resolveProductComponentIds(eika), resolveProductComponentIds(sb1));
  assert.deepEqual(resolveProductComponentIds(eika), resolveProductComponentIds(dnb));
  const facts = resolveCatalogFacts(eika, []);
  assert.match(fact(facts, "nyverdi.alder").value, /3 år/);
  assert.match(fact(facts, "nyverdi.km").value, /100 000 km/);
  assert.ok(fact(facts, "parkering.dekning"));
  assert.ok(fact(facts, "ansvar.dekning"));
  assert.ok(fact(facts, "rettshjelp.dekning"));
  assert.ok(fact(facts, "brann.dekning"));
  assert.ok(fact(facts, "glass.dekning"));
  assert.ok(fact(facts, "veihjelp.dekning"));
  const detailed = manual(eikaCompany, "Topp").insuranceData.insurances[0].importantTerms;
  assert.match(fact(detailed, "nyverdi.alder").overriddenBase[0].value, /1 år/);
  assert.match(fact(detailed, "nyverdi.km").overriddenBase[0].value, /15 000 km/);
});

test("Eika har samme hoveddekning som SpareBank 1 og DNB, men separat auditert øvelseskjøringsfordel", () => {
  for (const other of [manual(sb1Company, "Toppkasko"), manual(dnbCompany, "Topp")]) {
    const result = compare(manual(eikaCompany, "Topp"), other);
    assert.equal(result.raw.filter((item) => item.kind === "term").length, 0);
    assert.equal(result.shown.length, 1);
    assert.equal(result.shown[0].conceptId, "bil.ovelseskjoring");
    assert.equal(result.shown[0].presentationType, "conditional-benefit");
    assert.match(result.shown[0].text, /^Eksisterende: Tilsvarende betinget fordel er ikke dokumentert etter kontroll/);
  }
});

test("Eika-tillegg bruker de aktive felles Fremtind-vilkårene", () => {
  assert.deepEqual(availableAddOns(level(eikaCompany, "Ansvar")), []);
  assert.deepEqual(availableAddOns(level(eikaCompany, "Delkasko")), []);
  for (const name of ["Kasko", "Topp"]) {
    const product = level(eikaCompany, name);
    assert.deepEqual(availableAddOns(product).map((item) => item.id), ["eika-leiebil", "eika-maskinskade"]);
    const facts = resolveCatalogFacts(product, ["eika-leiebil", "eika-maskinskade"]);
    assert.match(fact(facts, "leiebil.dager").value, /45 dager/);
    assert.match(fact(facts, "maskinskade.alder").value, /10 år/);
    assert.match(fact(facts, "maskinskade.km").value, /200 000 km/);
  }
  const result = compare(
    manual(sb1Company, "Toppkasko", ["sb1-leiebil", "sb1-maskinskade"]),
    manual(eikaCompany, "Topp", ["eika-leiebil", "eika-maskinskade"]),
  );
  for (const key of ["nyverdi.alder", "nyverdi.km", "parkering.dekning"]) {
    assert.equal(fact(result.terms, key).first, fact(result.terms, key).second);
    assert.equal(result.raw.some((item) => item.termKey === key), false);
  }
  assert.equal(fact(result.terms, "leiebil.dager").first, fact(result.terms, "leiebil.dager").second);
  assert.equal(fact(result.terms, "maskinskade.km").first, fact(result.terms, "maskinskade.km").second);
  assert.equal(result.raw.some((item) => ["leiebil.dager", "maskinskade.km"].includes(item.termKey)), false);
});

test("Eika Topp sammenlignes kildeisolert mot Tryg", () => {
  const result = compare(manual(eikaCompany, "Topp"), manual("Tryg", "Kasko", ["bil-ekstra"]));
  assert.match(fact(result.terms, "nyverdi.km").first, /100 000 km/);
  assert.match(fact(result.terms, "nyverdi.km").second, /60 000 km/);
  assert.ok(result.shown.some((item) => item.conceptId === "bil.totalskade" &&
    item.items.some((detail) => detail.termKey === "nyverdi.km")));
});

test("UI-runtime beholder Eika-identitet, arv og begge valgte tillegg", () => {
  const formData = new FormData();
  formData.set("existingMode", "manual");
  formData.set("offerMode", "manual");
  formData.set("existingManual", JSON.stringify({ company: eikaCompany, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "eika-fremtind", productId: "eika-bil-topp", version: "PMO-357.001-004" },
    addOnIds: ["eika-leiebil", "eika-maskinskade"],
  }] }));
  formData.set("offerManual", JSON.stringify({ company: dnbCompany, totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "dnb-fremtind", productId: "dnb-bil-topp", version: "PMO-357.001-004" },
    addOnIds: ["dnb-leiebil", "dnb-maskinskade"],
  }] }));
  const eika = normalizeManualAgreement(JSON.parse(formData.get("existingManual")));
  const dnb = normalizeManualAgreement(JSON.parse(formData.get("offerManual")));
  const insurance = eika.insuranceData.insurances[0];
  assert.equal(insurance.catalogReference.providerId, "eika-fremtind");
  assert.deepEqual(insurance.addOnIds, ["eika-leiebil", "eika-maskinskade"]);
  assert.match(fact(insurance.importantTerms, "nyverdi.alder").value, /3 år/);
  assert.ok(fact(insurance.importantTerms, "parkering.dekning"));
  const result = compare(eika, dnb);
  assert.equal(result.shown.length, 1);
  assert.equal(result.shown[0].conceptId, "bil.ovelseskjoring");
  assert.match(result.shown[0].text, /Nytt tilbud: Krav: 2 000 km/);
});
