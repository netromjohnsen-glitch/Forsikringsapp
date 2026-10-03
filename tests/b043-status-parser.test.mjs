import assert from "node:assert/strict";
import test from "node:test";

import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { canonicalCoverage, coverageStatusFromText } from "../lib/coverage-status.ts";
import { normalizeDocumentFacts } from "../lib/document-fact-normalization.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

const asOf = new Date("2026-10-01T12:00:00Z");
const rentalSubject = { subject: "Leiebil", subjectAliases: ["Erstatningsbil"] };
const policy = (importantTerms = [], extra = {}) => ({
  type: "Bobil", productName: "Kasko", annualPremium: null, deductible: null,
  coverageSummary: null, importantTerms, addOns: [], ...extra,
});
const rental = (value, extra = {}) => ({ key: "leiebil.dekning", name: "Leiebil", value, ...extra });
const coverage = (insurance, key = "leiebil.dekning") => {
  const result = canonicalCoverage(insurance, insurance.type, key);
  assert.ok(result, key);
  return result;
};

for (const value of [
  "Nei", "Uten dekning", "Ikke valgt", "Ikke inkludert", "Ikke omfattet", "Ikke dekket",
  "Ikke gjeldende", "Ingen dekning", "Dekkes ikke", "Omfattes ikke", "Dekningen gjelder ikke.",
  "Leiebil er ikke valgt.", "Erstatningsbil er ikke inkludert.", "  LEIEBIL:  IKKE VALGT!  ",
  "Leiebil er\nikke valgt.",
]) test(`B043 direct represented-coverage rejection is preserved: ${value}`, () => {
  assert.equal(coverageStatusFromText(value, rentalSubject), "not_selected");
  assert.equal(coverage(policy([rental(value)])).status, "not_selected");
});

for (const value of ["Ja", "Valgt", "Inkludert", "Leiebil er valgt.", "Erstatningsbil er inkludert."])
  test(`B043 direct positive status is preserved: ${value}`, () => {
    assert.equal(coverageStatusFromText(value, rentalSubject), "selected");
    assert.equal(coverage(policy([rental(value)])).status, "selected");
  });

for (const value of [undefined, null, "", "  ", "Ikke dokumentert", "Kan ikke avgjøres", "Ikke oppgitt", "Ukjent"])
  test(`B043 exact unknown remains distinct from rejection: ${String(value)}`, () => {
    assert.equal(coverageStatusFromText(value, rentalSubject), "unknown");
    assert.equal(coverage(policy([rental(value ?? "")])).status, "unknown");
  });

for (const value of [
  "Dekningen gjelder ikke utenfor Norden.", "Dekningen gjelder ikke fellesareal.",
  "Dekningen gjelder ikke brann og naturskade.", "Unntaket gjelder ikke bruddskade på glass.",
  "10 000 kr; gjelder ikke fellesareal.", "Leiebil er ikke valgt ved reiser utenfor Norden.",
  "Leiebil er ikke valgt\nved reiser utenfor Norden.",
  "Hvis Leiebil er valgt, gjelder en annen egenandel.",
  "Hvis Leiebil ikke er valgt, gjelder en annen egenandel.",
  "Maskinskade er ikke valgt.", "Maskinskade er valgt.", "Leiebil er ikke valgtest.",
]) test(`B043 qualifications and other subjects do not become explicit statuses: ${value}`, () => {
  assert.equal(coverageStatusFromText(value, rentalSubject), null);
});

test("B043 package-scope absence is exact to the represented product", () => {
  assert.equal(coverageStatusFromText("Ikke inkludert i Basis", { ...rentalSubject, productName: "Basis" }), "not_selected");
  assert.equal(coverageStatusFromText("Ikke inkludert i Basis", { ...rentalSubject, productName: "Super" }), null);
  assert.equal(coverageStatusFromText("Ikke inkludert i Basis Pluss", { ...rentalSubject, productName: "Basis" }), null);
  assert.equal(coverageStatusFromText("Ikke inkludert i Basis utenfor Norden", { ...rentalSubject, productName: "Basis" }), null);
});

test("B043 positive main value keeps its descriptive fallback and useful detail", () => {
  const value = "Erstatningsbil ved verkstedreparasjon";
  assert.equal(coverageStatusFromText(value, rentalSubject), null);
  const result = coverage(policy([rental(value)]));
  assert.equal(result.status, "selected");
  assert.equal(result.summary, value);
  assert.equal(result.evidence[0].kind, "main_value");
});

test("B043 positive main fact with a subordinate exception remains selected", () => {
  const value = "10 000 kr for bruddskade på glass. Unntaket gjelder ikke bruddskade på glass.";
  assert.equal(coverageStatusFromText(value, rentalSubject), null);
  assert.equal(coverage(policy([rental(value)])).status, "selected");
});

test("B043 positive status and a qualified negative sentence remain selected", () => {
  const value = "Leiebil er inkludert. Dekningen gjelder ikke utenfor Norden.";
  assert.equal(coverageStatusFromText(value, rentalSubject), "selected");
  assert.equal(coverage(policy([rental(value)])).status, "selected");
});

test("B043 restriction alone cannot select or reject its parent", () => {
  for (const value of ["Dekningen gjelder ikke utenfor Norden.", "Inkludert når verkstedet er godkjent"] ) {
    const result = coverage(policy([{ key: "leiebil.begrensning", name: "Leiebil – begrensninger", value }]));
    assert.equal(result.status, "unknown");
    assert.equal(result.evidence[0].kind, "restriction");
    assert.equal(result.evidence[0].status, "unknown");
    assert.equal(result.details[0].value, value);
  }
});

test("B043 main positive with supporting negative qualification preserves both dimensions", () => {
  const limitation = { key: "leiebil.begrensning", name: "Leiebil – begrensninger", value: "Gjelder ikke utenfor Norden" };
  const result = coverage(policy([rental("Valgt"), limitation]));
  assert.equal(result.status, "selected");
  assert.equal(result.details[0].value, limitation.value);
});

test("B043 supporting positive detail cannot resurrect explicit main rejection", () => {
  const result = coverage(policy([rental("Ikke valgt"),
    { key: "leiebil.dager", name: "Leiebil – antall dager", value: "60 dager" }]));
  assert.equal(result.status, "not_selected");
  assert.equal(result.conflict, false);
});

for (const text of [
  "Hvis Leiebil ikke er valgt, gjelder en annen egenandel.",
  "Hvis Leiebil er ikke valgt, gjelder en annen egenandel.",
  "Hvis Leiebil er valgt, gjelder en annen egenandel.",
  "Hvis Erstatningsbil er valgt, gjelder en annen egenandel.",
  "Hvis Leiebil er valgt,\ngjelder en annen egenandel.",
  "Hvis Leiebil\ner valgt, gjelder en annen egenandel.",
]) test(`B043 conditional named statement supplies no independent selection: ${text}`, () => {
  assert.equal(coverageStatusFromText(text, rentalSubject), null);
  for (const insurance of [
    policy([{ name: "Vilkår for egenandel", value: text }]),
    policy([], { coverageSummary: text }),
  ]) {
    const terms = normalizeDocumentFacts(insurance);
    assert.equal(terms.some(term => term.key === "leiebil.dekning"), false);
    assert.equal(coverage({ ...insurance, importantTerms: terms }).status, "unknown");
  }
  assert.equal(coverage(policy([rental(text)])).status, "unknown");
});

test("B043 subject names only provide status under exact context", () => {
  assert.equal(coverageStatusFromText("Leiebil er ikke valgt."), null);
  assert.equal(coverageStatusFromText("Dekningen gjelder ikke."), "not_selected");
  assert.equal(coverageStatusFromText("Erstatningsbil er ikke valgt.", { subject: "Leiebil" }), null);
  assert.equal(coverageStatusFromText("Erstatningsbil er ikke valgt.", rentalSubject), "not_selected");
});

test("B043 neighboring direct sentence still provides status after a conditional clause", () => {
  const terms = normalizeDocumentFacts(policy([], {
    coverageSummary: "Hvis Leiebil er valgt, gjelder en annen egenandel. Leiebil er ikke valgt.",
  }));
  assert.deepEqual(terms.filter(term => term.key === "leiebil.dekning").map(term => term.value), ["Leiebil er ikke valgt"]);
  assert.equal(coverage(policy(terms)).status, "not_selected");
});

test("B043 complete named declarations preserve independent subjects and conflicting evidence", () => {
  const terms = normalizeDocumentFacts(policy([], {
    coverageSummary: "Leiebil er valgt; Maskinskade er ikke valgt. Leiebil er ikke valgt.",
  }));
  assert.deepEqual(terms.filter(term => term.key === "leiebil.dekning").map(term => term.value), ["Leiebil er valgt", "Leiebil er ikke valgt"]);
  const rentalResult = coverage(policy(terms));
  assert.equal(rentalResult.status, "unknown");
  assert.equal(rentalResult.conflict, true);
  assert.equal(coverage(policy(terms), "maskinskade.dekning").status, "not_selected");
});

test("B043 Bobil bonus consequences retain the existing selection guard", () => {
  const value = "Hvis Parkeringsskade er valgt, gjelder ikke bonusreduksjon.";
  const terms = normalizeDocumentFacts(policy([{
    name: "Bonus – parkert kjøretøy", canonicalKey: "bonus.parkert", value,
  }]));
  assert.deepEqual(terms.map(term => [term.key, term.value]), [["bonus.parkert", value]]);
  assert.equal(coverage(policy(terms), "parkering.dekning").status, "unknown");
});

test("B043 unconfirmed catalog availability never selects customer coverage", () => {
  for (const coverageAvailability of ["included", "unavailable"]) {
    const result = coverage(policy([rental("Inkludert", { coverageOrigin: "catalog", coverageAvailability })]));
    assert.equal(result.status, "unknown");
    assert.equal(result.evidence[0].kind, "catalog_definition");
  }
});

test("B043 explicit customer evidence outranks opposite catalog availability", () => {
  for (const [coverageAvailability, value, status] of [
    ["included", "Ikke valgt", "not_selected"], ["unavailable", "Valgt", "selected"],
    ["unavailable", "Erstatningsbil ved verkstedreparasjon", "selected"],
  ]) {
    const result = coverage(policy([
      rental("Generelle produktvilkår", { coverageOrigin: "catalog", coverageAvailability }),
      rental(value, { coverageOrigin: "document" }),
    ], { catalogSelectionConfirmed: true }));
    assert.equal(result.status, status);
    assert.equal(result.conflict, false);
  }
});

test("B043 equal customer evidence conflict remains unknown despite included catalog metadata", () => {
  const result = coverage(policy([
    rental("Valgt", { coverageOrigin: "document" }), rental("Ikke valgt", { coverageOrigin: "document" }),
    rental("Inkludert", { coverageOrigin: "catalog", coverageAvailability: "included" }),
  ], { catalogSelectionConfirmed: true }));
  assert.equal(result.status, "unknown");
  assert.equal(result.conflict, true);
});

// The fixture keeps registered product/add-on identities and company/type/scope.
// Synthetic sources isolate availability propagation without changing real catalog rows.
const registered = productCatalog.products.find(product => product.productId === "tryg-bobil-kasko");
const registeredAddOn = productCatalog.addOns.find(addOn => addOn.id === "tryg-bobil-maskinskade");
assert.ok(registered);
assert.ok(registeredAddOn);
const fixture = (coverageAvailability) => {
  const product = { ...registered, sourceId: "b043-fixture-base", componentIds: ["b043-fixture-base"] };
  const source = id => ({ id, filename: `${id}.pdf`, termsNumber: "B043-SYNTHETIC", effectiveFrom: "2026-01-01",
    company: product.company, providerId: product.providerId, insuranceType: product.insuranceType,
    agreementScope: "ordinary", productIds: [product.productId], productVersion: product.version, sourceType: "full_terms" });
  const sources = { "b043-fixture-base": source("b043-fixture-base"), "b043-fixture-addon": source("b043-fixture-addon") };
  const fact = (key, label, value, availability, id = "b043-fixture-base") => ({
    key, label, value, ...(availability ? { coverageAvailability: availability } : {}),
    source: { documentId: id, filename: sources[id].filename, termsNumber: sources[id].termsNumber,
      effectiveFrom: sources[id].effectiveFrom, company: product.company, agreementScope: "ordinary", page: 1, section: label },
  });
  const catalog = { companies: [product.company], insuranceTypes: [product.insuranceType], products: [product], sources,
    addOns: [{ ...registeredAddOn, componentId: "b043-fixture-addon", requiresLevel: [product.productId] }],
    facts: {
      "b043-fixture-base": [fact("leiebil.dekning", "Leiebil", coverageAvailability === "unavailable"
        ? "Erstatningsbil ved verkstedreparasjon" : "Dekningen gjelder ikke utenfor Norden.", coverageAvailability)],
      "b043-fixture-addon": [
        fact("maskinskade.dekning", "Maskinskade", "Inkludert. Dekningen gjelder ikke utenfor Norden.", "included", "b043-fixture-addon"),
        fact("maskinskade.km", "Maskinskade – kilometergrense", "200 000 km", "included", "b043-fixture-addon"),
      ],
    } };
  return { product, catalog };
};
const enrichFixture = ({ product, catalog }, importantTerms = []) => enrichExtractedAgreementWithCatalog({
  company: product.company, totalAnnualPremium: null, insurances: [policy(importantTerms, {
    type: product.insuranceType, productName: product.name, agreementScope: product.agreementScope,
  })],
}, asOf, undefined, undefined, catalog).insurances[0];
const manualFixture = ({ product, catalog }, addOnIds = []) => normalizeManualAgreement({
  company: product.company, totalAnnualPremium: "", products: [{ type: product.insuranceType, productName: product.name,
    agreementScope: product.agreementScope, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
}, catalog).insuranceData.insurances[0];

for (const [availability, state, status] of [["included", "included", "selected"], ["unavailable", "unavailable", "not_selected"]])
  test(`B043 ${availability} metadata survives product, enrichment and manual conversion`, () => {
    const setup = fixture(availability);
    const original = resolveCatalogFacts(setup.product, [], asOf, null, setup.catalog).find(fact => fact.key === "leiebil.dekning");
    assert.equal(original.coverageAvailability, availability);
    const materialized = materializeCatalogProduct(setup.product, setup.catalog).facts.find(fact => fact.key === original.key);
    assert.equal(materialized.state, state);
    assert.equal(materialized.value, original.value);
    assert.equal(materialized.sources[0].documentId, original.source.documentId);
    for (const insurance of [enrichFixture(setup), manualFixture(setup)]) {
      const term = insurance.importantTerms.find(term => term.key === original.key);
      assert.equal(term.coverageAvailability, availability);
      assert.equal(term.coverageOrigin, "catalog");
      assert.equal(term.value, original.value);
      assert.equal(term.source.documentId, original.source.documentId);
      assert.equal(coverage(insurance).status, status);
    }
  });

test("B043 enrichment blocks positive catalog facts after explicit customer rejection", () => {
  const insurance = enrichFixture(fixture("included"), [{ name: "Leiebil", canonicalKey: "leiebil.dekning", value: "Ikke valgt" }]);
  assert.equal(coverage(insurance).status, "not_selected");
  assert.deepEqual(insurance.importantTerms.filter(term => term.key === "leiebil.dekning").map(term => [term.coverageOrigin, term.value]), [["document", "Ikke valgt"]]);
});

test("B043 enrichment preserves positive customer value over unavailable catalog metadata", () => {
  const value = "Erstatningsbil ved verkstedreparasjon";
  const insurance = enrichFixture(fixture("unavailable"), [{ name: "Leiebil", canonicalKey: "leiebil.dekning", value }]);
  assert.equal(coverage(insurance).status, "selected");
  assert.deepEqual(insurance.importantTerms.filter(term => term.key === "leiebil.dekning").map(term => [term.coverageOrigin, term.value]), [["document", value]]);
});

test("B043 available add-on stays optional in product mode and unknown under customer silence", () => {
  const setup = fixture("included");
  const fact = materializeCatalogProduct(setup.product, setup.catalog).facts.find(fact => fact.key === "maskinskade.dekning");
  assert.equal(fact.state, "optional");
  assert.deepEqual(fact.addOnNames, [registeredAddOn.name]);
  for (const insurance of [enrichFixture(setup), manualFixture(setup)]) {
    assert.deepEqual(insurance.addOnIds, []);
    assert.equal(coverage(insurance, "maskinskade.dekning").status, "unknown");
    assert.equal(insurance.importantTerms.some(term => term.key === "maskinskade.dekning"), false);
  }
});

test("B043 chosen add-on metadata survives enrichment and both manual term lists", () => {
  const setup = fixture("included");
  const enriched = enrichFixture(setup, [{ name: "Maskinskade – aldersgrense", canonicalKey: "maskinskade.alder", value: "9 år" }]);
  const manual = manualFixture(setup, [registeredAddOn.id]);
  for (const insurance of [enriched, manual]) {
    assert.deepEqual(insurance.addOnIds, [registeredAddOn.id]);
    const term = insurance.importantTerms.find(term => term.key === "maskinskade.dekning");
    assert.equal(term.coverageAvailability, "included");
    assert.equal(term.source.documentId, "b043-fixture-addon");
    assert.equal(coverage(insurance, "maskinskade.dekning").status, "selected");
  }
  assert.equal(manual.addOns[0].importantTerms.find(term => term.key === "maskinskade.dekning").coverageAvailability, "included");
});

test("B043 manual customer input retains direct status under the supported custom-product path", () => {
  for (const [value, status] of [["Valgt", "selected"], ["Ikke valgt", "not_selected"]]) {
    const insurance = normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "", products: [{
      type: "Bobil", productName: "Kasko", customProduct: true, annualPremium: "", deductible: "", coverageSummary: "",
      importantTerms: [{ name: "Leiebil", value }], addOnIds: [],
    }] }).insuranceData.insurances[0];
    assert.equal(insurance.catalogReference, null);
    assert.equal(coverage(insurance).status, status);
  }
});

test("B043 legacy availability absence keeps safe descriptive and direct-negative fallback", () => {
  const setup = fixture(undefined);
  assert.equal(materializeCatalogProduct(setup.product, setup.catalog).facts.find(fact => fact.key === "leiebil.dekning").state, "included");
  for (const insurance of [enrichFixture(setup), manualFixture(setup)]) {
    assert.equal(insurance.importantTerms.find(term => term.key === "leiebil.dekning").coverageAvailability, undefined);
    assert.equal(coverage(insurance).status, "selected");
  }
  setup.catalog.facts["b043-fixture-base"][0].value = "Dekningen gjelder ikke.";
  assert.equal(materializeCatalogProduct(setup.product, setup.catalog).facts.find(fact => fact.key === "leiebil.dekning").state, "unavailable");
});

// Explicit source-backed absence belongs to the represented dimension. These
// controls also ensure higher-level own replacements do not inherit that absence.
for (const [id, key, state, sourceId, section, page, wording] of [
  ["tryg-hus", "hus.skadedyr.bygningsskade", "unavailable", "trygHus", "2.6", 4,
    /^Dyr, insekter, bakterier, sopp og råte er unntatt; unntaket gjelder ikke bruddskade på glass\.$/u],
  ["if-hus-basis", "hus.vatrom.selverommet", "unavailable", "ifHusTerms", "4.4", 8,
    /Skade i våtrom.*er unntatt på Basis\. Feil uten skade er ikke dekket\./u],
  ["if-hus-utvidet", "hus.vatrom.selverommet", "unavailable", "ifHusTerms", "4.4", 8,
    /Skade i våtrom.*er unntatt på Basis\. Feil uten skade er ikke dekket\./u],
  ["if-hus-super", "hus.vatrom.selverommet", "included", "ifHusTerms", "4.12.1", 13,
    /^Ved konstatert følgeskade dekkes skade på gulv og vegger i våtrommet/u],
  ["tryg-reise", "reise.tjenestereise", "unavailable", "trygReiseBase", "2.2, 3.3 og 5.5", 2,
    /^Tjenestereiser er ikke omfattet av Reise;/u],
  ["tryg-reise-ekstra", "reise.tjenestereise", "included", "trygReiseExtra", "2.2, 3.3 og 5.5", 2,
    /^Reise Ekstra gjelder også tjenestereiser,/u],
]) test(`B043 exact source-backed negative and own-replacement control: ${id} ${key}`, () => {
  const product = productCatalog.products.find(product => product.productId === id);
  assert.ok(product, id);
  const original = resolveCatalogFacts(product, [], asOf).find(fact => fact.key === key);
  assert.ok(original, key);
  assert.match(original.value, wording);
  assert.equal(original.coverageAvailability, state === "unavailable" ? "unavailable" : undefined);
  assert.equal(original.source.documentId, sourceId);
  assert.equal(original.source.section, section);
  assert.equal(original.source.page, page);
  const materialized = materializeCatalogProduct(product).facts.find(fact => fact.key === key);
  assert.equal(materialized.state, state);
  assert.equal(materialized.value, original.value);
  assert.equal(materialized.sources[0].documentId, sourceId);
  if (state === "unavailable") assert.equal(materialized.role, "coverage");
});

test("B043 actual Frende accident exception remains included and selected with provenance", () => {
  const product = productCatalog.products.find(product => product.productId === "frende-reiseforsikring");
  assert.ok(product);
  const original = resolveCatalogFacts(product, [], asOf).find(fact => fact.key === "reise.ulykke.dekning");
  assert.ok(original);
  assert.match(original.value, /unntaket gjelder ikke/iu);
  assert.equal(materializeCatalogProduct(product).facts.find(fact => fact.key === original.key).state, "included");
  const enriched = enrichExtractedAgreementWithCatalog({ company: product.company, totalAnnualPremium: null,
    insurances: [policy([], { type: product.insuranceType, productName: product.name, agreementScope: product.agreementScope })],
  }, asOf).insurances[0];
  const manual = normalizeManualAgreement({ company: product.company, totalAnnualPremium: "", products: [{
    type: product.insuranceType, productName: product.name, agreementScope: product.agreementScope,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [],
  }] }).insuranceData.insurances[0];
  for (const insurance of [enriched, manual]) {
    assert.equal(coverage(insurance, original.key).status, "selected");
    const term = insurance.importantTerms.find(term => term.key === original.key);
    assert.equal(term.value, original.value);
    assert.equal(term.source.documentId, "frendeReiseTerms");
    assert.equal(term.source.page, 11);
  }
});

test("B043 corrected Frende comparisons stay deterministic under same product and side swap", () => {
  const first = productCatalog.products.find(product => product.productId === "frende-reiseforsikring");
  const peer = productCatalog.products.find(product => product.productId === "fremtind-reise");
  assert.ok(first);
  assert.ok(peer);
  for (const second of [first, peer]) {
    const forward = compareCatalogProducts(first, second).sections.flatMap(section => section.rows);
    const reverse = compareCatalogProducts(second, first).sections.flatMap(section => section.rows);
    const row = forward.find(row => row.key === "reise.ulykke.dekning");
    const swapped = reverse.find(row => row.key === "reise.ulykke.dekning");
    assert.ok(row);
    assert.ok(swapped);
    assert.equal(row.first.state, "included");
    assert.deepEqual(row.first, swapped.second);
    assert.deepEqual(row.second, swapped.first);
    if (second === first) assert.equal(row.different, false);
  }
});

// Recovery: ERA3-4's product overview excludes rental deductible reimbursement
// in Basis and Standard; section 10 expressly covers it in Super. Standard
// inherits the exact Basis fact, while Super supplies its own replacement.
const ifRentalKey = "reise.leiebil.egenandel";
const ifTier = tier => {
  const product = productCatalog.products.find(product => product.productId === `if-reise-${tier}`);
  assert.ok(product, tier);
  return product;
};
const ifRentalFact = tier => {
  const fact = resolveCatalogFacts(ifTier(tier), [], asOf).find(fact => fact.key === ifRentalKey);
  assert.ok(fact, tier);
  return fact;
};
const ifEnriched = (tier, importantTerms = []) => {
  const product = ifTier(tier);
  return enrichExtractedAgreementWithCatalog({ company: product.company, totalAnnualPremium: null,
    insurances: [policy(importantTerms, { type: product.insuranceType, productName: product.name })],
  }, asOf).insurances[0];
};
const ifManual = tier => {
  const product = ifTier(tier);
  return normalizeManualAgreement({ company: product.company, totalAnnualPremium: "", products: [{
    type: product.insuranceType, productName: product.name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds: [],
  }] }).insuranceData.insurances[0];
};

for (const tier of ["basis", "standard"]) test(`B043 If recovery: ${tier} exact structured absence survives inheritance`, () => {
  const product = ifTier(tier);
  const fact = ifRentalFact(tier);
  assert.equal(fact.value, "Ikke inkludert i Basis.");
  assert.equal(fact.coverageAvailability, "unavailable");
  assert.equal(fact.source.documentId, "ifReiseTerms");
  assert.equal(fact.source.termsNumber, "ERA3-4");
  assert.equal(fact.source.section, "Produktoversikt");
  assert.equal(fact.source.page, 2);
  assert.equal(fact.source.company, "If");
  assert.equal(fact.replacesBase, undefined);
  if (tier === "standard") {
    assert.equal(product.inheritsProductId, "if-reise-basis");
    assert.deepEqual(fact, ifRentalFact("basis"));
    assert.equal(productCatalog.facts.ifReiseStandard.some(fact => fact.key === ifRentalKey), false);
  }
  const materialized = materializeCatalogProduct(product).facts.find(fact => fact.key === ifRentalKey);
  assert.equal(materialized.state, "unavailable");
  assert.equal(materialized.value, fact.value);
  assert.equal(materialized.sources[0].documentId, fact.source.documentId);
});

test("B043 If recovery: Super owns the source-backed included replacement", () => {
  const product = ifTier("super");
  const fact = ifRentalFact("super");
  assert.equal(product.inheritsProductId, "if-reise-standard");
  assert.equal(fact.replacesBase, true);
  assert.equal(fact.coverageAvailability, undefined);
  assert.match(fact.value, /^Egenandel ved skade på leid bil, motorsykkel, sykkel eller elsykkel/u);
  assert.match(fact.value, /feriereise med minst én overnatting og dokumentert leieavtale/u);
  assert.equal(fact.source.documentId, "ifReiseTerms");
  assert.equal(fact.source.termsNumber, "ERA3-4");
  assert.equal(fact.source.section, "10");
  assert.equal(fact.source.page, 21);
  const materialized = materializeCatalogProduct(product).facts.find(fact => fact.key === ifRentalKey);
  assert.equal(materialized.state, "included");
  assert.equal(materialized.value, fact.value);
  assert.equal(materialized.sources[0].page, 21);
});

test("B043 If recovery: raw Basis mention cannot negate Standard or Super", () => {
  const value = "Ikke inkludert i Basis.";
  const subject = ifRentalFact("basis").label;
  assert.equal(coverageStatusFromText(value, { subject, productName: ifTier("basis").name }), "not_selected");
  for (const tier of ["standard", "super"]) {
    assert.equal(coverageStatusFromText(value, { subject, productName: ifTier(tier).name }), null);
  }
});

test("B043 If recovery: same-product comparisons retain exact tier states", () => {
  for (const [tier, state] of [["basis", "unavailable"], ["standard", "unavailable"], ["super", "included"]]) {
    const product = ifTier(tier);
    const comparison = compareCatalogProducts(product, product);
    const row = comparison.sections.flatMap(section => section.rows).find(row => row.key === ifRentalKey);
    assert.ok(row, tier);
    assert.equal(row.first.state, state);
    assert.equal(row.second.state, state);
    assert.equal(row.different, false);
    assert.equal(comparison.differenceCount, 0);
  }
});

test("B043 If recovery: lower-tier versus Super remains correct in both directions", () => {
  for (const tier of ["basis", "standard"]) {
    const rows = (first, second) => compareCatalogProducts(ifTier(first), ifTier(second))
      .sections.flatMap(section => section.rows);
    const forward = rows(tier, "super").find(row => row.key === ifRentalKey);
    const reverse = rows("super", tier).find(row => row.key === ifRentalKey);
    assert.ok(forward, tier);
    assert.ok(reverse, tier);
    assert.equal(forward.first.state, "unavailable");
    assert.equal(forward.second.state, "included");
    assert.equal(forward.different, true);
    assert.deepEqual(forward.first, reverse.second);
    assert.deepEqual(forward.second, reverse.first);
  }
});

test("B043 If recovery: enrichment and manual preserve exact inherited metadata and Super replacement", () => {
  for (const tier of ["basis", "standard", "super"]) {
    const fact = ifRentalFact(tier);
    for (const insurance of [ifEnriched(tier), ifManual(tier)]) {
      const terms = insurance.importantTerms.filter(term => term.key === ifRentalKey);
      assert.equal(terms.length, 1, tier);
      assert.equal(terms[0].coverageAvailability, tier === "super" ? undefined : "unavailable");
      assert.equal(terms[0].coverageOrigin, "catalog");
      assert.equal(terms[0].value, fact.value);
      assert.equal(terms[0].source.documentId, fact.source.documentId);
      assert.equal(terms[0].source.section, fact.source.section);
      assert.equal(terms[0].source.page, fact.source.page);
      assert.equal(insurance.catalogProductName, ifTier(tier).name);
      assert.deepEqual(insurance.addOnIds, []);
    }
  }
});

test("B043 If recovery: explicit positive customer fact wins over lower-tier catalog absence", () => {
  const value = "Kundens dokumenterte leiebilegenandel dekkes inntil 17 777 kr";
  for (const tier of ["basis", "standard"]) {
    const insurance = ifEnriched(tier, [{ name: ifRentalFact(tier).label, value }]);
    const terms = insurance.importantTerms.filter(term => term.key === ifRentalKey);
    assert.deepEqual(terms.map(term => [term.coverageOrigin, term.value]), [["document", value]]);
    assert.equal(terms[0].coverageAvailability, undefined);
    assert.equal(insurance.catalogFacts.find(fact => fact.key === ifRentalKey).coverageAvailability, "unavailable");
    assert.equal(materializeCatalogProduct(ifTier(tier)).facts.find(fact => fact.key === ifRentalKey).state, "unavailable");
  }
});

test("B043 If recovery: explicit customer rejection wins over Super's positive catalog fact", () => {
  const insurance = ifEnriched("super", [{ name: ifRentalFact("super").label, value: "Ikke valgt" }]);
  const terms = insurance.importantTerms.filter(term => term.key === ifRentalKey);
  assert.deepEqual(terms.map(term => [term.coverageOrigin, term.value]), [["document", "Ikke valgt"]]);
  assert.equal(terms[0].coverageAvailability, undefined);
  assert.deepEqual(insurance.catalogFacts.find(fact => fact.key === ifRentalKey && fact.replacesBase), ifRentalFact("super"));
  assert.equal(materializeCatalogProduct(ifTier("super")).facts.find(fact => fact.key === ifRentalKey).state, "included");
});
