import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { additionalFactKinds, additionalPersonFacts } from "../lib/person-insurance-terms.ts";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonOptions, productComparisonProviders } from "../lib/catalog-product-comparison.ts";
import { enrichBatch, mergeBatchResults } from "../lib/analysis-merge.ts";
import { createAnalysisTelemetry } from "../lib/analysis-telemetry.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { applyManualProductSelection, manualProductOptions } from "../lib/manual-product-selection.ts";
import { personInsuranceProducts } from "../lib/person-insurance-catalog.ts";
import { availableAddOns, productCatalog, resolveAddOnPackage, resolveCatalogFacts } from "../lib/product-catalog.ts";

const asOf = new Date("2026-11-14");
const ordinary = "ordinary";
const option = (company, type, name) => {
  const result = productComparisonOptions(type, company, ordinary).find(product => product.name === name);
  assert.ok(result, `${company} – ${type} – ${name}`);
  return result;
};

test("all nine existing insurers have selectable person products where public terms are available", () => {
  const providers = ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende", "KLP", "Landkreditt"];
  assert.deepEqual(new Set(productComparisonProviders("Ulykke")), new Set([...providers, "WaterCircles"]));
  for (const type of ["Barn", "Kritisk sykdom"]) {
    assert.deepEqual(new Set(productComparisonProviders(type)), new Set(providers));
  }
  assert.deepEqual(productComparisonOptions("Liv", "WaterCircles", ordinary), []);
  assert.deepEqual(productComparisonOptions("Behandling", "WaterCircles", ordinary), []);
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
  const death = rows.find(row => row.key === "person.ulykke.dodsfall").first;
  assert.match(death.text, /Ved avtalt dødsfallsdekning/u);
  assert.doesNotMatch(death.text, /Inkludert/u);
  assert.equal(death.sources[0].termsNumber, "UUL41502");

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

test("If Super retains the Standard help benefit with the Super exception on the same row", () => {
  const standard = option("If", "Barn", "Standard Barneforsikring");
  const superProduct = option("If", "Barn", "Super Barneforsikring");
  const rows = (a, b) => productComparisonView(compareCatalogProducts(a, b))
    .flatMap(section => section.groups.flatMap(group => group.rows))
    .filter(row => row.key === "person.barn.hjelpestonad");
  const forward = rows(standard, superProduct);
  const reverse = rows(superProduct, standard);
  assert.equal(forward.length, 1);
  assert.equal(reverse.length, 1);
  const [row] = forward;
  assert.equal(row.different, true);
  assert.deepEqual(row.first, reverse[0].second);
  assert.deepEqual(row.second, reverse[0].first);
  const locations = value => value.sources.map(source => [source.termsNumber, source.page, source.section]);

  for (const side of [row.first, row.second]) {
    assert.equal(side.state, "included");
    assert.match(side.text, /før fylte 18 år.*innvilget og utbetalt hjelpestønad fra NAV/u);
    assert.match(side.text, /50 000, 75 000, 275 000 og 912 500 kr/u);
    assert.match(side.text, /samordnes med økonomisk førstehjelp/u);
  }
  assert.match(row.first.text, /psykiske lidelser.*§ 6\.1\.1 gjelder\./u);
  assert.match(row.second.text, /opphever Super unntaket.*psykiske lidelser.*§ 6\.1\.1/u);
  assert.match(row.second.text, /Individuelle reservasjoner/u);
  assert.deepEqual(locations(row.first), [["BAF2-4", 8, "§ 5.4"], ["BAF2-4", 11, "§ 6.1.1"]]);
  assert.deepEqual(locations(row.second), [["BAF2-4", 8, "§ 5.4"], ["SUB1-5", 4, "§ 4.3"]]);
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

test("new insurers align like-for-like benefits and preserve variant-specific sources", () => {
  const accident = compareCatalogProducts(
    option("KLP", "Ulykke", "Fritidsulykke Maks"),
    option("WaterCircles", "Ulykke", "Ulykkesforsikring"),
  ).sections.flatMap(section => section.rows);
  const progressive = accident.find(row => row.key === "person.ulykke.progressiv");
  assert.match(progressive.first.text, /140 %/);
  assert.match(progressive.second.text, /Avtalt dobbel erstatning/);
  const expenses = accident.find(row => row.key === "person.ulykke.utgifter");
  assert.match(expenses.first.text, /tre årene/);
  assert.match(expenses.second.text, /to årene/);
  assert.equal(expenses.first.sources[0].page, 2);
  assert.equal(expenses.second.sources[0].termsNumber, "WtCULY-2.12");

  const children = compareCatalogProducts(
    option("KLP", "Barn", "Barn Maks"),
    option("Landkreditt", "Barn", "Barneulykke"),
  ).sections.flatMap(section => section.rows);
  const pension = children.find(row => row.key === "person.barn.uforepensjon");
  assert.equal(pension.first.sources[0].filename, "klp-person-barn-maks.pdf");
  assert.equal(pension.second.state, "unknown");
  const death = children.find(row => row.key === "person.barn.ulykkesdodsfall");
  assert.equal(death.first.state, "unknown");
  assert.match(death.second.text, /begravelsesutgifter/);

  const health = compareCatalogProducts(
    option("Landkreditt", "Behandling", "Helseforsikring – privat"),
    option("Gjensidige", "Behandling", "Behandlingsforsikring"),
  ).sections.flatMap(section => section.rows);
  assert.equal(health.find(row => row.key === "person.behandling.ventetid").first.state, "unknown");
  const firstCare = health.find(row => row.key === "person.behandling.forste_helsehjelp");
  assert.match(firstCare.first.text, /10 virkedager/);
  assert.equal(firstCare.second.state, "unknown");
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


test("terms from each original PDF survive catalogue comparison with exact source and availability", () => {
  const products = new Map(personInsuranceProducts.map(product => [product.productId, product]));
  assert.equal(Object.keys(additionalPersonFacts).length, products.size);
  assert.equal(new Set(Object.values(additionalFactKinds).map(kind => kind.key)).size, Object.keys(additionalFactKinds).length);
  const fileHashes = new Map();

  for (const [productId, definitions] of Object.entries(additionalPersonFacts)) {
    const product = products.get(productId);
    assert.ok(product, productId);
    assert.ok(definitions.length > 0, productId);
    const materialized = materializeCatalogProduct(product).facts;
    const comparison = compareCatalogProducts(product, product);
    assert.equal(comparison.differenceCount, 0, productId);
    const rows = productComparisonView(comparison).flatMap(section => section.groups.flatMap(group => group.rows));
    assert.equal(rows.length, new Set(rows.map(row => row.key)).size, productId);

    for (const definition of definitions) {
      const kind = additionalFactKinds[definition.kind];
      const expectedId = `person:${productId}`;
      const fact = materialized.find(candidate => candidate.value === definition.value && candidate.label === (kind?.label ?? candidate.label)
        && candidate.sources[0].page === definition.page && candidate.sources[0].section === definition.section);
      assert.ok(fact, `${productId} ${definition.kind}`);
      if (kind?.term) assert.equal(fact.role, "term", `${productId} ${kind.key}`);
      assert.deepEqual(rows.find(row => row.key === fact.key)?.first.facts.find(visible => visible.value === fact.value),
        fact, `${productId} ${fact.key}`);
      const source = productCatalog.sources[fact.sources[0].documentId];
      assert.ok(source.id === expectedId || source.id.startsWith(`${expectedId}:`), productId);
      assert.deepEqual(source.productIds, [productId]);
      assert.ok(definition.page >= source.physicalPages[0] && definition.page <= source.physicalPages[1]);
      if (!fileHashes.has(source.filename)) {
        const hash = createHash("sha256").update(readFileSync(new URL(`../catalog/sources/person/${source.filename}`, import.meta.url))).digest("hex");
        fileHashes.set(source.filename, hash);
      }
      assert.equal(fileHashes.get(source.filename), source.sha256, source.filename);

      if (definition.addOn) {
        assert.equal(fact.state, "optional", `${productId} ${definition.kind}`);
        const addOn = availableAddOns(product, asOf).find(candidate => candidate.name === definition.addOn);
        assert.ok(addOn, `${productId} ${definition.addOn}`);
        assert.ok(!resolveCatalogFacts(product, [], asOf).some(entry => entry.value === fact.value));
        const packageIds = resolveAddOnPackage(product, addOn.id, asOf);
        assert.ok(resolveCatalogFacts(product, packageIds, asOf).some(entry => entry.value === fact.value));
      }
    }
  }
});

test("the same contractual condition uses the same row in both comparison directions", () => {
  const first = option("If", "Liv", "Livsforsikring");
  const second = option("Landkreditt", "Liv", "Livsforsikring");
  const row = (a, b) => compareCatalogProducts(a, b).sections.flatMap(section => section.rows)
    .find(candidate => candidate.key === "person.liv.opphor");
  const forward = row(first, second);
  const reverse = row(second, first);
  assert.equal(forward.label, "Opphørsalder");
  assert.match(forward.first.text, /Ut forsikringsåret/);
  assert.match(forward.second.text, /første hovedforfall/);
  assert.deepEqual(forward.first, reverse.second);
  assert.deepEqual(forward.second, reverse.first);
});
