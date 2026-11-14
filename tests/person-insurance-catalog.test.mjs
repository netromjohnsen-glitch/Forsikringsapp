import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, productComparisonOptions, productComparisonProviders } from "../lib/catalog-product-comparison.ts";
import { enrichBatch, mergeBatchResults } from "../lib/analysis-merge.ts";
import { createAnalysisTelemetry } from "../lib/analysis-telemetry.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { applyManualProductSelection, manualProductOptions } from "../lib/manual-product-selection.ts";
import { personInsuranceProducts } from "../lib/person-insurance-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

const asOf = new Date("2026-11-14");
const ordinary = "ordinary";
const option = (company, type, name) => {
  const result = productComparisonOptions(type, company, ordinary).find(product => product.name === name);
  assert.ok(result, `${company} – ${type} – ${name}`);
  return result;
};

test("all six existing insurers have selectable accident, child and critical illness products", () => {
  for (const type of ["Ulykke", "Barn", "Kritisk sykdom"]) {
    assert.deepEqual(new Set(productComparisonProviders(type)), new Set([
      "Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende",
    ]));
  }
  assert.deepEqual(productComparisonOptions("Liv", "Tryg", ordinary), []);
  assert.deepEqual(productComparisonOptions("Behandling", "Frende", ordinary), []);
  assert.equal(productComparisonOptions("Liv", "Fremtind", ordinary).length, 1);
});

test("every new product resolves to scope-specific sources with physical pages", () => {
  for (const product of personInsuranceProducts) {
    const facts = resolveCatalogFacts(product, [], asOf);
    assert.ok(facts.length > 0, product.productId);
    assert.equal(new Set(facts.map(fact => fact.key)).size, facts.length, product.productId);
    for (const fact of facts) {
      const source = productCatalog.sources[fact.source.documentId];
      assert.equal(source.providerId, product.providerId);
      assert.equal(source.insuranceType, product.insuranceType);
      assert.deepEqual(source.productIds, [product.productId]);
      assert.equal(source.agreementScope, ordinary);
      assert.match(source.sha256, /^[0-9a-f]{64}$/);
      assert.match(source.url, /^https:\/\//);
      assert.ok(fact.source.page >= source.physicalPages[0] && fact.source.page <= source.physicalPages[1]);
      assert.ok(fact.source.section.trim());
    }
  }
});

test("optional accident coverage stays conditional and shared sources do not activate a different variant", () => {
  const tryg = option("Tryg", "Ulykke", "Ulykkesforsikring");
  const frende = option("Frende", "Ulykke", "Ulykkesforsikring");
  const comparison = compareCatalogProducts(tryg, frende);
  const rows = comparison.sections.flatMap(section => section.rows);
  const invalidity = rows.find(row => row.key === "person.ulykke.invaliditet");
  assert.match(invalidity.first.text, /Inkludert/);
  assert.match(invalidity.second.text, /Forsikringsbeviset/);
  assert.doesNotMatch(invalidity.second.text, /Inkludert/);
  assert.equal(rows.find(row => row.key === "person.ulykke.dodsfall").first.state, "unknown");

  const standard = option("If", "Barn", "Standard Barneforsikring");
  const superProduct = option("If", "Barn", "Super Barneforsikring");
  const childRows = compareCatalogProducts(standard, superProduct).sections.flatMap(section => section.rows);
  const disability = childRows.find(row => row.key === "person.barn.uforepensjon");
  assert.equal(disability.first.state, "unknown");
  assert.equal(disability.second.sources[0].termsNumber, "SUB1-5");
  const invaliditySource = childRows.find(row => row.key === "person.barn.invaliditet").second.sources[0];
  assert.equal(invaliditySource.termsNumber, "BAF2-4");
  const childCapital = childRows.find(row => row.key === "person.barn.uforekapital");
  assert.match(childCapital.first.text, /40 %.*to år/);
  assert.match(childCapital.second.text, /40 %.*to år/);
  assert.deepEqual(childCapital.second.sources.map(source => source.termsNumber), ["BAF2-4", "SUB1-5"]);
});

test("child accident payouts and treatment deadlines align only with the same benefit or milestone", () => {
  const child = compareCatalogProducts(
    option("Fremtind", "Barn", "Barneulykkesforsikring"),
    option("If", "Barn", "Standard Barneforsikring"),
  );
  const childRows = child.sections.flatMap(section => section.rows);
  const firstChild = key => childRows.find(row => row.key === key).first;
  assert.doesNotMatch(firstChild("person.barn.invaliditet").text, /dødsfall|behandlingsutgifter/u);
  assert.match(firstChild("person.barn.ulykkesutgifter").text, /1 G.*500 kr/u);
  assert.match(firstChild("person.barn.ulykkesdodsfall").text, /1 G/u);

  const treatment = compareCatalogProducts(
    option("Gjensidige", "Behandling", "Behandlingsforsikring"),
    option("Fremtind", "Behandling", "Behandlingsforsikring"),
  );
  const consultation = treatment.sections.flatMap(section => section.rows)
    .find(row => row.key === "person.behandling.ventetid");
  assert.match(consultation.first.text, /10 virkedager/u);
  assert.match(consultation.second.text, /10 virkedager/u);

  const ergo = compareCatalogProducts(
    option("Gjensidige", "Behandling", "Behandlingsforsikring"),
    option("Storebrand", "Behandling", "Helseforsikring (ERGO)"),
  );
  const rows = ergo.sections.flatMap(section => section.rows);
  assert.equal(rows.find(row => row.key === "person.behandling.ventetid").second.state, "unknown");
  const firstTreatment = rows.find(row => row.key === "person.behandling.forste_behandling");
  assert.equal(firstTreatment.first.state, "unknown");
  assert.match(firstTreatment.second.text, /10 virkedager/u);
});

test("manual product selection resolves the chosen person's product facts and preserves price input", () => {
  const options = manualProductOptions("Fremtind", "Uføreforsikring");
  const chosen = options.find(item => item.label === "Uførekapital med forskuttering");
  assert.ok(chosen);
  const input = applyManualProductSelection({
    type: "Uføreforsikring", productName: "", annualPremium: "2 400 kr", deductible: "",
    importantTerms: [], coverageSummary: "",
  }, "Fremtind", "Uføreforsikring", chosen.value);
  const result = normalizeManualAgreement({ company: "Fremtind", products: [input] });
  const product = result.insuranceData.insurances[0];
  assert.equal(product.catalogReference.providerId, "fremtind");
  assert.equal(product.catalogReference.insuranceType, "uføre");
  assert.equal(product.annualPremium, "2 400 kr");
  assert.ok(product.importantTerms.some(term => term.key === "person.ufore.forskudd" && term.source.page === 1));
});

test("a personal policy PDF keeps document facts and does not inherit public catalogue terms by name", () => {
  const batch = {
    side: "offer", batchIndex: 0, documents: [{
      side: "offer", documentIndex: 0, pageTexts: [{ num: 1, text: "Livsforsikring\nÅrspremie\n2 400 kr" }],
    }],
  };
  const agreement = {
    company: "If", totalAnnualPremium: null, insurances: [{
      type: "Livsforsikring", productName: "Livsforsikring", canonicalProductName: "Livsforsikring",
      documentRole: "individual_agreement", annualPremium: "2400", deductible: null, coverageSummary: null,
      importantTerms: [{ name: "Avtalt forsikringssum", value: "Et beløp fra kundens avtale", canonicalKey: null }],
      addOns: [],
    }],
  };
  const extracted = enrichBatch(agreement, batch, createAnalysisTelemetry("test"));
  const [product] = mergeBatchResults([{ batch, agreement: extracted }], "offer", false).insuranceData.insurances;
  assert.equal(product.catalogReference, null);
  assert.equal(product.catalogFacts, undefined);
  assert.equal(product.annualPremium, "2400");
  assert.ok(product.importantTerms.some(term => term.value === "Et beløp fra kundens avtale"));
  assert.ok(product.importantTerms.every(term => term.coverageOrigin === "document"));
});
