import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  compareCatalogProducts,
  findProductComparisonProduct,
  isHistoricalCatalogProduct,
  materializeCatalogProduct,
  productComparisonInsuranceTypes,
  productComparisonOptions,
  productComparisonProducts,
  productComparisonProviders,
  productComparisonScopes,
} from "../lib/catalog-product-comparison.ts";
import { catalogProductIdentity, productCatalog } from "../lib/product-catalog.ts";

const eligible = productComparisonProducts();
const find = (type, company, name) => eligible.find((product) =>
  product.insuranceType === type && product.company === company && product.name === name);

test("catalog eligibility is derived from the current source-backed catalog", () => {
  assert.equal(productCatalog.products.length, 164);
  assert.equal(eligible.length, 162);
  assert.deepEqual(productComparisonInsuranceTypes(), [
    "Snøscooter", "Campingvogn", "Tilhenger", "Bil", "Hus", "Innbo", "Reise", "MC", "Bobil",
  ]);
  assert.equal(eligible.some(isHistoricalCatalogProduct), false);
  assert.equal(productCatalog.products.filter(isHistoricalCatalogProduct).length, 2);
});

test("providers and products are filtered by exact insurance type", () => {
  assert.deepEqual(productComparisonProviders("MC"), ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende"]);
  assert.equal(productComparisonOptions("MC", "Tryg", "ordinary").length, 4);
  assert.equal(productComparisonOptions("Hus", "Tryg", "ordinary").some((product) => product.insuranceType !== "Hus"), false);
  assert.equal(productComparisonOptions("MC", "Unknown", "ordinary").length, 0);
});

test("agreement scope is exact and channel-aware", () => {
  assert.deepEqual(productComparisonScopes("MC", "Fremtind").map((scope) => scope.id), ["ordinary-sparebank1"]);
  assert.deepEqual(productComparisonScopes("Bobil", "Fremtind").map((scope) => scope.id), ["ordinary-dnb"]);
  assert.equal(productComparisonOptions("MC", "Fremtind", "ordinary-dnb").length, 0);
  assert.equal(productComparisonOptions("Bobil", "Fremtind", "ordinary-sparebank1").length, 0);
});

test("exact product identity is required and unknown IDs fail closed", () => {
  const product = find("Bil", "Gjensidige", "Pluss");
  assert.equal(findProductComparisonProduct(catalogProductIdentity(product)), product);
  assert.equal(findProductComparisonProduct("gjensidige-pluss-ish"), null);
});

test("materialization excludes customer price and actual mileage facts", () => {
  const product = materializeCatalogProduct(find("Bil", "Gjensidige", "Pluss"));
  assert.equal(product.facts.some((fact) => fact.key.startsWith("premie.")), false);
  assert.equal(product.facts.some((fact) => fact.key === "kjoretoy.kjorelengde"), false);
  assert.equal(product.facts.every((fact) => fact.sources.length > 0), true);
});

test("included and optional coverage remain different product-level states", () => {
  const result = compareCatalogProducts(find("MC", "Tryg", "MC Ekstra"), find("MC", "If", "Kasko"));
  const row = result.sections.flatMap((section) => section.rows).find((candidate) => candidate.key === "maskinskade.dekning");
  assert.equal(row.first.state, "included");
  assert.equal(row.second.state, "optional");
  assert.match(row.first.text, /Inkludert/u);
  assert.match(row.second.text, /Tilgjengelig som tillegg/u);
  assert.doesNotMatch(`${row.first.text} ${row.second.text}`, /Valgt/u);
});

test("missing catalog evidence stays unknown instead of becoming unavailable", () => {
  const result = compareCatalogProducts(find("Bil", "Gjensidige", "Pluss"), find("Bil", "If", "Super"));
  const row = result.sections.flatMap((section) => section.rows).find((candidate) =>
    candidate.first.state === "unknown" || candidate.second.state === "unknown");
  assert.ok(row);
  const unknown = row.first.state === "unknown" ? row.first : row.second;
  assert.equal(unknown.text, "Ikke dokumentert i kataloggrunnlaget");
  assert.doesNotMatch(unknown.text, /ikke dekket/iu);
});

test("explicit negative catalog evidence becomes unavailable", () => {
  const result = compareCatalogProducts(find("Reise", "If", "Basis"), find("Reise", "If", "Super"));
  const row = result.sections.flatMap((section) => section.rows).find((candidate) =>
    candidate.first.state === "unavailable");
  assert.ok(row);
  assert.match(row.first.text, /Ikke inkludert \/ ikke tilgjengelig/u);
});

test("same exact product has no false meaningful differences", () => {
  const product = find("Bil", "Gjensidige", "Pluss");
  const result = compareCatalogProducts(product, product);
  assert.equal(result.differenceCount, 0);
  assert.equal(result.importantSections.length, 0);
});

test("side swap preserves the semantic difference set", () => {
  const first = find("Bil", "Gjensidige", "Pluss");
  const second = find("Bil", "If", "Super");
  const forward = compareCatalogProducts(first, second);
  const reverse = compareCatalogProducts(second, first);
  const keys = (result) => result.sections.flatMap((section) => section.rows).filter((row) => row.different).map((row) => row.key).sort();
  assert.deepEqual(keys(forward), keys(reverse));
  assert.equal(forward.differenceCount, reverse.differenceCount);
});

test("cross-type comparisons are rejected without fallback", () => {
  assert.throws(() => compareCatalogProducts(find("Bil", "Gjensidige", "Pluss"), find("Hus", "Tryg", "Hus Ekstra")),
    /samme forsikringstype/u);
});

for (const [type, firstCompany, firstName, secondCompany, secondName] of [
  ["Bil", "Gjensidige", "Pluss", "If", "Super"],
  ["Hus", "Tryg", "Hus Ekstra", "If", "Super"],
  ["Innbo", "Tryg", "Innbo Ekstra", "If", "Super"],
  ["Reise", "Tryg", "Reise Ekstra", "If", "Super"],
  ["Snøscooter", "Tryg", "Kasko", "If", "Kasko"],
  ["Campingvogn", "Tryg", "Campingvogn Ekstra", "If", "Super"],
  ["Tilhenger", "Tryg", "Kasko", "If", "Kasko"],
  ["MC", "Tryg", "MC Ekstra", "If", "Kasko"],
  ["Bobil", "Tryg", "Bobil Ekstra", "If", "Super"],
]) test(`${type} uses one generic source-backed product comparison path`, () => {
  const result = compareCatalogProducts(find(type, firstCompany, firstName), find(type, secondCompany, secondName));
  assert.equal(result.insuranceType, type);
  assert.ok(result.sections.length > 0);
  assert.equal(result.sections.flatMap((section) => section.rows).flatMap((row) => [...row.first.sources, ...row.second.sources])
    .every((source) => source.documentId && source.url), true);
});

test("same-provider levels compare without provider-name differences", () => {
  const result = compareCatalogProducts(find("Bil", "Gjensidige", "Kasko"), find("Bil", "Gjensidige", "Pluss"));
  assert.ok(result.differenceCount > 0);
  assert.equal(result.sections.flatMap((section) => section.rows).some((row) => /selskap|produktnavn/iu.test(row.label)), false);
});

function syntheticCatalog() {
  const fact = (scope, value) => ({ key: "hus.plutselig.dekning", label: "Plutselig skade", value,
    source: { documentId: `source-${scope}`, section: "1", page: 1, filename: "public.pdf", termsNumber: "T1",
      effectiveFrom: "2026-01-01", company: "Tryg", url: "https://www.tryg.no/public.pdf", agreementScope: scope } });
  return {
    agreementScopes: [{ id: "member-test", providerId: "tryg", name: "Medlemsavtale" }],
    companies: ["Tryg"], insuranceTypes: ["Hus"], addOns: [],
    products: [
      { company: "Tryg", insuranceType: "Hus", name: "Standard", providerId: "tryg", productId: "ordinary", version: "1", agreementScope: "ordinary", componentIds: ["ordinary-component"] },
      { company: "Tryg", insuranceType: "Hus", name: "Standard medlem", providerId: "tryg", productId: "member", version: "1", agreementScope: "member-test", componentIds: ["member-component"] },
    ],
    sources: {
      "source-ordinary": { id: "source-ordinary", filename: "public.pdf", termsNumber: "T1", effectiveFrom: "2026-01-01", agreementScope: "ordinary" },
      "source-member-test": { id: "source-member-test", filename: "public.pdf", termsNumber: "T1", effectiveFrom: "2026-01-01", agreementScope: "member-test" },
    },
    facts: { "ordinary-component": [fact("ordinary", "Ordinær dekning")], "member-component": [fact("member-test", "Medlemsdekning")] },
  };
}

test("synthetic member scope stays isolated without provider-specific code", () => {
  const catalog = syntheticCatalog();
  const products = productComparisonProducts(catalog);
  assert.equal(products.length, 2);
  assert.deepEqual(productComparisonScopes("Hus", "Tryg", catalog).map((scope) => scope.id), ["ordinary", "member-test"]);
  const result = compareCatalogProducts(products[0], products[1], catalog);
  const row = result.sections.flatMap((section) => section.rows)[0];
  assert.equal(row.first.text.includes("Ordinær dekning"), true);
  assert.equal(row.second.text.includes("Medlemsdekning"), true);
  assert.equal(row.first.sources.some((source) => source.agreementScope === "member-test"), false);
  assert.equal(row.second.sources.some((source) => source.agreementScope === "ordinary"), false);
});

test("catalog additions are discovered and removed products cannot remain selectable", () => {
  const catalog = syntheticCatalog();
  const added = { ...catalog.products[0], productId: "new", name: "Nytt nivå", componentIds: ["ordinary-component"] };
  const extended = { ...catalog, products: [...catalog.products, added] };
  assert.equal(productComparisonOptions("Hus", "Tryg", "ordinary", extended).some((product) => product.productId === "new"), true);
  const identity = catalogProductIdentity(added);
  assert.ok(findProductComparisonProduct(identity, extended));
  assert.equal(findProductComparisonProduct(identity, catalog), null);
});

test("product mode renders its own labels without customer, price, object, PDF or analysis language", () => {
  const ui = fs.readFileSync(new URL("../app/components/product-comparison.tsx", import.meta.url), "utf8");
  assert.match(ui, /Sammenlign produkter/u);
  assert.match(ui, /Sammenlign dekninger/u);
  for (const forbidden of ["Eksisterende avtale", "Nytt tilbud", "Årspremie", "TFA", "registreringsnummer", "Last opp", "Analyserer dokumenter"])
    assert.doesNotMatch(ui, new RegExp(forbidden, "iu"));
});

test("product mode has no API, AI, PDF, object matching or runtime provider fetch path", () => {
  const core = fs.readFileSync(new URL("../lib/catalog-product-comparison.ts", import.meta.url), "utf8");
  const ui = fs.readFileSync(new URL("../app/components/product-comparison.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(core + ui, /OpenAI|\/api\/analyze|pdf-reader|matchObjects|consolidat|fetch\s*\(/u);
});

test("fact-specific sources are retained without local source paths", () => {
  const result = compareCatalogProducts(find("Bobil", "Tryg", "Bobil Ekstra"), find("Bobil", "If", "Super"));
  const sources = result.sections.flatMap((section) => section.rows).flatMap((row) => [...row.first.sources, ...row.second.sources]);
  assert.ok(sources.length > 0);
  assert.equal(sources.every((source) => source.url?.startsWith("https://")), true);
  assert.equal(sources.some((source) => source.url?.includes("catalog/sources")), false);
});
