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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/frende");
const fact = (items, key) => items.find((item) => item.key === key);
const level = (name) => productCatalog.products.find((item) => item.company === "Frende" && item.name === name);
const manual = (company, productName, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName, annualPremium: "",
    deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};

test("offisielle Frende-kilder har kontrollert hash, dato og dokumentankere", async () => {
  const expected = {
    "Vilkar_kjoretoyforsikring.pdf": "088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88",
    "IPID_Personbil.pdf": "4c2dca2923583ba1d46dea924730335b064d8e94cd4cb1df544a520ed2683b8d",
    "Generelle_vilkar-01012026.pdf": "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b",
  };
  for (const [filename, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), hash);
  }
  const parser = new PDFParse({ data: await readFile(path.join(root, "Vilkar_kjoretoyforsikring.pdf")) });
  try {
    const pdf = await parser.getText();
    assert.equal(pdf.total, 15);
    assert.match(pdf.text, /Vilkår av 01\. januar 2026/);
    assert.match(pdf.text, /12 år\s+eller inntil bilen har kjørt 200 000 kilometer/);
    assert.match(pdf.text, /31 dager/);
    assert.match(pdf.text, /erstatning ved hver tvist er 100 000 kroner/);
  } finally { await parser.destroy(); }
});

test("Frende har dokumentert Ansvar → Delkasko → Kasko → Utvidet-arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Frende", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Utvidet"]);
  assert.deepEqual(resolveProductComponentIds(level("Utvidet")),
    ["frendeAnsvar", "frendeDelkasko", "frendeKasko", "frendeUtvidet"]);
  const effective = resolveCatalogFacts(level("Utvidet"), []);
  assert.match(fact(effective, "nyverdi.alder").value, /3 år/);
  assert.match(fact(effective, "nyverdi.km").value, /60 000 km/);
  const evidence = resolveCatalogEvidence(level("Utvidet"), []);
  assert.equal(evidence.filter((item) => item.key === "nyverdi.alder").length, 2);
  const detail = manual("Frende", "Utvidet").insuranceData.insurances[0].importantTerms;
  assert.match(fact(detail, "nyverdi.alder").overriddenBase[0].value, /1 år/);
  assert.match(fact(detail, "nyverdi.km").overriddenBase[0].value, /15 000 km/);
});

test("Leiebil og Maskinskade er uavhengige tillegg på Kasko og Utvidet", () => {
  assert.deepEqual(availableAddOns(level("Ansvar")), []);
  assert.deepEqual(availableAddOns(level("Delkasko")), []);
  for (const name of ["Kasko", "Utvidet"]) {
    assert.deepEqual(availableAddOns(level(name)).map((item) => item.id), ["frende-leiebil", "frende-maskinskade"]);
  }
  const agreement = manual("Frende", "Utvidet", ["frende-leiebil", "frende-maskinskade"]);
  const terms = agreement.insuranceData.insurances[0].importantTerms;
  assert.match(fact(terms, "leiebil.bilklasse").value, /Klasse C/);
  assert.match(fact(terms, "leiebil.kondemnasjon").value, /31 dager/);
  assert.match(fact(terms, "maskinskade.alder").value, /12 år/);
  assert.match(fact(terms, "maskinskade.km").value, /200 000 km/);
  assert.equal(fact(terms, "maskinskade.km").source.documentId, "frendeMaskinskade");
  assert.deepEqual(agreement.insuranceData.insurances[0].addOnIds, ["frende-leiebil", "frende-maskinskade"]);
});

test("egenandeler beholder standard-, referanse- og særskilt klassifisering", () => {
  const terms = manual("Frende", "Utvidet", ["frende-maskinskade"]).insuranceData.insurances[0].importantTerms;
  assert.equal(fact(terms, "kasko.egenandel").deductibleClassification, "reference");
  assert.equal(fact(terms, "brann.egenandel").deductibleClassification, "standard");
  assert.equal(fact(terms, "glass.egenandel.bytte").deductibleClassification, "coverage");
  assert.equal(fact(terms, "glass.egenandel.reparasjon").value, "0 kr");
  assert.equal(fact(terms, "veihjelp.egenandel").value, "750 kr");
  assert.equal(fact(terms, "maskinskade.egenandel.0-99999").deductibleClassification, "override");
  assert.ok(fact(terms, "bonus.kasko"));
  assert.ok(fact(terms, "bonus.parkert"));
});

test("UI-runtime beholder begge Frende-tillegg til sammenligning mot Tryg", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company: "Frende", totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Utvidet", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "frende", productId: "frende-bil-utvidet", version: "2026-01-01" },
    addOnIds: ["frende-leiebil", "frende-maskinskade"],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const result = compare(left, manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade"]));
  assert.deepEqual(left.insuranceData.insurances[0].addOnIds, ["frende-leiebil", "frende-maskinskade"]);
  assert.match(fact(result.terms, "nyverdi.km").first, /60 000 km/);
  assert.match(fact(result.terms, "nyverdi.km").second, /60 000 km/);
  assert.match(fact(result.terms, "maskinskade.alder").first, /12 år/);
  assert.match(fact(result.terms, "maskinskade.alder").second, /10 år/);
  assert.ok(result.shown.some((item) => item.termKey === "maskinskade.alder" || item.title === "Maskinskade"));
});

test("Frende sammenlignes kildeisolert mot Fremtind og If", () => {
  const fremtind = compare(manual("Frende", "Utvidet", ["frende-leiebil", "frende-maskinskade"]),
    normalizeManualAgreement({ company: "Fremtind", distributionChannel: "SpareBank 1", totalAnnualPremium: "", products: [{
      type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [],
      addOnIds: ["fremtind-sb1-leiebil", "fremtind-sb1-maskinskade"],
    }] }));
  assert.match(fact(fremtind.terms, "leiebil.kondemnasjon").first, /31 dager/);
  assert.match(fact(fremtind.terms, "maskinskade.alder").first, /12 år/);
  assert.match(fact(fremtind.terms, "maskinskade.alder").second, /10 år/);
  assert.equal(fact(fremtind.terms, "maskinskade.alder").firstSources[0].company, "Frende");
  assert.equal(fact(fremtind.terms, "maskinskade.alder").secondSources[0].company, "Fremtind");

  const againstIf = compare(manual("Frende", "Utvidet", ["frende-leiebil", "frende-maskinskade"]),
    manual("If", "Super", ["if-leiebil", "if-motor-gir"]));
  assert.match(fact(againstIf.terms, "maskinskade.km").first, /200 000 km/);
  assert.match(fact(againstIf.terms, "maskinskade.km").second, /200 000 km/);
  assert.match(fact(againstIf.terms, "leiebil.dager").first, /Hele reparasjonstiden/);
  assert.match(fact(againstIf.terms, "leiebil.dager").second, /90 dager/);
  assert.match(fact(againstIf.terms, "leiebil.kondemnasjon").first, /31 dager/);
  assert.match(fact(againstIf.terms, "leiebil.kondemnasjon").second, /10 dager/);
});
