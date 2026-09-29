import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { canonicalCoverage } from "../lib/coverage-status.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, findCatalogProductBySelection, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const sourceRoot = new URL("../catalog/sources/vehicle-extensions/", import.meta.url);
const product = (name = "Kasko") => findCatalogProductBySelection("Tryg", "Snøscooter", name);
const variants = [
  { family: "forerulykke", name: "Førerulykke", file: "tryg-odpdf-2001c3a6.pdf", number: "PAU28002", date: "2025-01-01",
    hash: "3ae14967e4d91e4c4a9c8541161206b86dda0c1bc1a7315ca9695f1c1da3c585",
    scope: "Skade på fører; også passasjer dersom kjøretøyet er registrert for flere personer" },
  { family: "ulykke", name: "Fører- og passasjerulykke", file: "tryg-odpdf-56716918.pdf", number: "PAU28003", date: "2024-07-01",
    hash: "d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52",
    scope: "Skade på fører og passasjer" },
];
const addonId = (variant) => `tryg-snoscooter-${variant.family}`;
const key = (variant, suffix = "dekning") => `snoscooter.${variant.family}.${suffix}`;
const manual = (addOnIds, importantTerms = []) => normalizeManualAgreement({
  company: "Tryg", totalAnnualPremium: "", products: [{ type: "Snøscooter", productName: "Kasko",
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms, addOnIds }],
}).insuranceData.insurances[0];
const extracted = (importantTerms) => enrichExtractedAgreementWithCatalog({
  company: "Tryg", totalAnnualPremium: null, totalAnnualPremiumScope: "partial_or_unclear",
  insurances: [{ type: "Snøscooter", productName: "Kasko", canonicalProductName: "Kasko",
    annualPremium: null, deductible: null, coverageSummary: null, importantTerms, addOns: [] }],
}).insurances[0];

for (const variant of variants) {
  test(`${variant.number}: unchanged original proves accident scope and fixed sums`, async () => {
    const bytes = await readFile(new URL(variant.file, sourceRoot));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), variant.hash);
    const parser = new PDFParse({ data: bytes });
    try {
      const text = (await parser.getText()).text.replace(/\s+/gu, " ");
      assert.match(text, /3\.1\. VARIG SKADE PÅ PERSON.*erstattes med inntil 200\.000 kroner/u);
      assert.match(text, /3\.2\. DØDSFALL Dødsfall erstattes med 100\.000 kroner/u);
      if (variant.family === "forerulykke") {
        assert.match(text, /Forsikringen omfatter skade på fører\. Dersom kjøretøyet er registrert for flere personer vil forsikringen også omfatte skade på passasjer/u);
      } else {
        assert.match(text, /Forsikringen omfatter skade på fører og passasjer/u);
      }
    } finally { await parser.destroy(); }
  });

  test(`${variant.number}: canonical addon scope and amounts retain exact source references`, () => {
    const rows = resolveCatalogFacts(product(), [addonId(variant)]);
    const parent = rows.find(fact => fact.key === key(variant));
    const limit = rows.find(fact => fact.key === key(variant, "grense"));
    assert.equal(parent.value, variant.scope);
    assert.equal(parent.source.page, 1);
    assert.equal(parent.source.section, "1");
    assert.equal(limit.value, "Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr");
    assert.equal(limit.source.page, 2);
    assert.equal(limit.source.section, "3.1 og 3.2");
    for (const fact of [parent, limit]) {
      assert.equal(fact.source.documentId, `vehicle:${variant.file}`);
      assert.equal(fact.source.termsNumber, variant.number);
      assert.equal(fact.source.effectiveFrom, variant.date);
    }
  });

  for (const level of ["Ansvar", "Brann og tyveri", "Kasko"]) {
    test(`${level}: ${variant.name} remains optional with no base inclusion claim`, () => {
      const selectedProduct = product(level);
      assert.equal(resolveCatalogFacts(selectedProduct, []).some(fact => fact.key === key(variant)), false);
      const fact = materializeCatalogProduct(selectedProduct).facts.find(fact => fact.key === key(variant));
      assert.equal(fact.state, "optional");
      assert.equal(fact.value, variant.scope);
      assert.deepEqual(fact.addOnNames, [variant.name]);
      assert.doesNotMatch(fact.value, /Inkludert i produktnivået/u);
    });
  }

  test(`${variant.name}: explicit manual choice selects only its own canonical concept`, () => {
    const insurance = manual([addonId(variant)]);
    assert.equal(canonicalCoverage(insurance, "Snøscooter", key(variant)).status, "selected");
    assert.equal(canonicalCoverage(insurance, "Snøscooter", key(variants.find(other => other !== variant))).status, "unknown");
    assert.deepEqual(insurance.addOnIds, [addonId(variant)]);
  });

  test(`${variant.name}: PDF silence remains unknown and explicit document status wins`, () => {
    assert.equal(canonicalCoverage(extracted([]), "Snøscooter", key(variant)).status, "unknown");
    for (const [value, status] of [["Valgt", "selected"], ["Ikke valgt", "not_selected"]]) {
      const insurance = extracted([{ name: variant.name, canonicalKey: key(variant), value }]);
      const coverage = canonicalCoverage(insurance, "Snøscooter", key(variant));
      assert.equal(coverage.status, status);
      assert.ok(coverage.evidence.some(evidence => evidence.origin === "document" && evidence.status === status));
    }
  });

  test(`${variant.name}: explicit document limit is preserved separately from catalog limits`, () => {
    for (const value of ["Invaliditet inntil 350 000 kr", "Invaliditet inntil 425 000 kr"]) {
      const insurance = extracted([{ name: `${variant.name} – forsikringssum`, canonicalKey: key(variant, "grense"), value }]);
      const fact = insurance.importantTerms.find(fact => fact.key === key(variant, "grense"));
      assert.equal(fact.value, value);
      assert.equal(fact.coverageOrigin, "document");
      assert.equal(resolveCatalogFacts(product(), [addonId(variant)]).find(fact => fact.key === key(variant, "grense")).value,
        "Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr");
    }
  });

  test(`${variant.name}: document limit and explicit rejection outrank an activated catalog component`, () => {
    const catalogBacked = manual([addonId(variant)]);
    const value = "Medisinsk invaliditet inntil 375 000 kr; dødsfall 125 000 kr";
    const withDocumentLimit = { ...catalogBacked, importantTerms: [...catalogBacked.importantTerms,
      { name: `${variant.name} – forsikringssum`, key: key(variant, "grense"), value, coverageOrigin: "document" }] };
    const coverage = canonicalCoverage(withDocumentLimit, "Snøscooter", key(variant));
    assert.equal(coverage.details.find(detail => detail.key === key(variant, "grense")).value, value);
    assert.equal(catalogBacked.catalogFacts.find(fact => fact.key === key(variant, "grense")).value,
      "Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr");
    const withDocumentRejection = { ...withDocumentLimit, importantTerms: [...withDocumentLimit.importantTerms,
      { name: variant.name, key: key(variant), value: "Ikke valgt", coverageOrigin: "document" }] };
    assert.equal(canonicalCoverage(withDocumentRejection, "Snøscooter", key(variant)).status, "not_selected");
  });
}

test("accident concepts remain separate and the existing alternative selection guard is preserved", () => {
  const addons = availableAddOns(product());
  assert.deepEqual(addons.map(addon => addon.id).sort(), variants.map(addonId).sort());
  assert.deepEqual(new Set(addons.map(addon => addon.exclusiveGroup)), new Set(["tryg-snoscooter-ulykke"]));
  assert.throws(() => resolveCatalogFacts(product(), variants.map(addonId)), /Alternative tilleggsvarianter/u);
  const facts = materializeCatalogProduct(product()).facts;
  assert.notEqual(facts.find(fact => fact.key === key(variants[0])).value, facts.find(fact => fact.key === key(variants[1])).value);
});

test("accident additions do not cross provider, insurance type or agreement scope", () => {
  for (const selection of [
    findCatalogProductBySelection("If", "Snøscooter", "Kasko"),
    findCatalogProductBySelection("Tryg", "Campingvogn", "Kasko"),
    { ...product(), agreementScope: "unregistered-test-scope" },
  ]) {
    for (const variant of variants) {
      assert.equal(availableAddOns(selection).some(addon => addon.id === addonId(variant)), false);
      assert.throws(() => resolveCatalogFacts(selection, [addonId(variant)]));
    }
  }
});

test("IPID Kasko rescue expense limitation is not copied to unknown lower levels", () => {
  for (const level of ["Ansvar", "Brann og tyveri"]) {
    const facts = resolveCatalogFacts(product(level), []);
    assert.equal(facts.some(fact => fact.key.startsWith("snoscooter.redning.")), false);
  }
  const kasko = resolveCatalogFacts(product(), []).filter(fact => fact.key.startsWith("snoscooter.redning."));
  assert.equal(kasko.length, 1);
  assert.equal(kasko[0].key, "snoscooter.redning.begrensning");
  assert.equal(kasko[0].value, "Utgifter til redning/veihjelp er unntatt");
  assert.equal(kasko[0].source.section, "Begrensninger – Kasko");
  assert.equal(kasko[0].source.page, 1);
  assert.equal(kasko[0].source.documentId, "vehicle:tryg-IPID-Snoscooter.pdf");
});

test("corrected vehicle usage metadata refers to exact level and source pages without altering originals", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.json", sourceRoot), "utf8"));
  for (const variant of variants) {
    const doc = manifest.documents.find(doc => doc.filename === variant.file);
    assert.equal(doc.sha256, variant.hash);
    const usage = doc.catalogUsage.find(usage => usage.factKey === key(variant, "grense"));
    assert.equal(usage.addOnId, addonId(variant));
    assert.equal(usage.page, 2);
    assert.equal(usage.section, "3.1 og 3.2");
  }
  const rescue = manifest.documents.find(doc => doc.filename === "tryg-IPID-Snoscooter.pdf")
    .catalogUsage.filter(usage => usage.factKey === "snoscooter.redning.begrensning");
  assert.deepEqual(rescue, [{ providerId: "tryg", insuranceType: "Snøscooter", productId: "tryg-snoscooter-kasko",
    factKey: "snoscooter.redning.begrensning", page: 1, section: "Begrensninger – Kasko" }]);
});

test("If roof consequential damage has scoped affirmative evidence without removing its defect exclusion", async () => {
  const source = productCatalog.sources.ifHusTerms;
  const bytes = await readFile(new URL("../catalog/sources/if/hus/Bygningsforsikring.pdf", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
  const key = "hus.takvegg.folgeskade";
  const expected = "Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.";
  for (const level of ["Utvidet", "Super"]) {
    const facts = resolveCatalogFacts(findCatalogProductBySelection("If", "Hus", level), []).filter(fact => fact.key === key);
    assert.equal(facts.length, 1);
    assert.equal(facts[0].coverageAvailability, "included");
    assert.equal(facts[0].value, expected);
    assert.equal(facts[0].source.documentId, "ifHusTerms");
    assert.equal(facts[0].source.page, 8);
    assert.equal(facts[0].source.section, "4.4");
    assert.equal(facts[0].source.version, "September 2023");
    assert.equal(facts[0].replacesBase, true);
  }
  const basis = resolveCatalogFacts(findCatalogProductBySelection("If", "Hus", "Basis"), []).find(fact => fact.key === key);
  assert.equal(basis.coverageAvailability, undefined);
  assert.match(basis.value, /^Ikke dokumentert som egen Basis-utvidelse/u);
});
