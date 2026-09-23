import assert from "node:assert/strict";
import test from "node:test";

import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { canonicalCoverage } from "../lib/coverage-status.ts";
import { groupInsurances } from "../lib/comparison.ts";
import { normalizeInsuranceType } from "../lib/insurance-normalization.ts";
import {
  canonicalProviderId,
  catalogConnectionStatus,
  findCatalogProductBySelection,
} from "../lib/product-catalog.ts";

const agreement = (company, type, productName, importantTerms = [], addOns = []) => ({
  company,
  totalAnnualPremium: null,
  totalAnnualPremiumScope: "partial_or_unclear",
  insurances: [{
    type,
    productName,
    annualPremium: null,
    deductible: null,
    coverageSummary: null,
    importantTerms,
    addOns,
  }],
});

const enrich = (...args) => enrichExtractedAgreementWithCatalog(
  agreement(...args),
  new Date("2026-09-23T12:00:00Z"),
).insurances[0];

test("Gjensidige Pluss og juridisk Gjensidige-navn Kasko matches deterministisk", () => {
  const pluss = findCatalogProductBySelection("Gjensidige", "Bil", "Pluss");
  const kasko = findCatalogProductBySelection("Gjensidige Forsikring ASA", "Bil", "Kasko");
  assert.equal(pluss?.productId, "gj-bil-pluss");
  assert.equal(kasko?.productId, "gj-bil-kasko");
  assert.equal(pluss?.providerId, "gjensidige");
  assert.equal(kasko?.providerId, "gjensidige");
  assert.equal(canonicalProviderId("Gjensidige"), "gjensidige");
  assert.equal(canonicalProviderId("Gjensidige Forsikring ASA"), "gjensidige");
});

test("ukjent Gjensidige-produkt kobles ikke til Kasko eller Pluss", () => {
  assert.equal(findCatalogProductBySelection("Gjensidige", "Bil", "Ukjent variant"), null);
  const insurance = enrich("Gjensidige", "Bil", "Ukjent variant");
  assert.equal(insurance.catalogReference, null);
  assert.equal(catalogConnectionStatus([insurance]),
    "Ikke koblet til vilkårskatalogen – sammenligningen bygger bare på registrerte opplysninger og kan være ufullstendig");
});

test("PDF-berikelse kobler Pluss og Kasko og viser presis positiv katalogstatus", () => {
  const pluss = enrich("Gjensidige", "Bil", "Pluss");
  const kasko = enrich("Gjensidige Forsikring ASA", "Bilforsikring", "Kasko");
  assert.deepEqual(pluss.catalogReference, {
    providerId: "gjensidige", productId: "gj-bil-pluss", version: null,
  });
  assert.deepEqual(kasko.catalogReference, {
    providerId: "gjensidige", productId: "gj-bil-kasko", version: null,
  });
  assert.equal(catalogConnectionStatus([pluss]), "✓ Koblet til Gjensidige Bil Pluss");
  assert.equal(catalogConnectionStatus([kasko]), "✓ Koblet til Gjensidige Bil Kasko");
  const groups = groupInsurances([pluss], [kasko], null);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].key, "bil");
  assert.equal(groups[0].first[0].productName, "Pluss");
  assert.equal(groups[0].second[0].productName, "Kasko");
});

test("dokumentert valgt Leiebil for Pluss forblir selected etter katalogberikelse", () => {
  const insurance = enrich("Gjensidige", "Bil", "Pluss", [
    { name: "Maskinskade – alder", value: "Til første hovedforfall etter 10 år" },
  ], [{
    name: "Leiebil", annualPremium: null, deductible: null,
    importantTerms: [{ name: "Ved reparasjon", value: "Inntil 60 dager" }],
  }]);
  assert.equal(canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.status, "selected");
  assert.equal(insurance.importantTerms.some((term) =>
    term.key === "maskinskade.alder" && /12 år/u.test(term.value)), false);
  assert.ok(insurance.importantTerms.some((term) =>
    term.name === "Maskinskade – alder" && /10 år/u.test(term.value) && term.coverageOrigin === "document"));
});

test("dokumentert ikke valgt Leiebil for Kasko har forrang over katalogdefinisjon", () => {
  const insurance = enrich("Gjensidige Forsikring ASA", "Motorvognforsikring", "Kasko", [
    { name: "Leiebil", value: "Leiebil er ikke valgt" },
  ]);
  assert.equal(canonicalCoverage(insurance, "Bil", "leiebil.dekning")?.status, "not_selected");
});

test("valgfri dekning som ikke er nevnt blir unknown selv om katalogen beskriver muligheten", () => {
  const insurance = enrich("Gjensidige", "Bil", "Kasko");
  const coverage = canonicalCoverage(insurance, "Bil", "leiebil.dekning");
  assert.equal(coverage?.status, "unknown");
  assert.equal(coverage?.evidence.length, 0);
  assert.ok(insurance.catalogFacts?.some((fact) => fact.key === "leiebil.dager"));
  assert.equal(insurance.catalogSelectionConfirmed, true);
});

test("ubetinget basefaktum fra eksakt produktnivå berikes som valgt med katalogkilde", () => {
  const insurance = enrich("Gjensidige", "Bil", "Kasko");
  const veihjelp = insurance.importantTerms.find((term) => term.key === "veihjelp.dekning");
  assert.equal(veihjelp?.coverageOrigin, "catalog");
  assert.equal(veihjelp?.source?.documentId, "gjDelkasko");
  assert.equal(canonicalCoverage(insurance, "Bil", "veihjelp.dekning")?.status, "selected");
});

test("matchinglaget er generelt for Tryg og bruker canonical type uten cross-provider-treff", () => {
  const tryg = findCatalogProductBySelection("Tryg", "Personbilforsikring", "Kasko");
  const gjensidige = findCatalogProductBySelection("Gjensidige", "Bil", "Kasko");
  assert.equal(tryg?.productId, "bil-kasko");
  assert.equal(tryg?.providerId, "tryg");
  assert.equal(gjensidige?.productId, "gj-bil-kasko");
  assert.notEqual(tryg?.providerId, gjensidige?.providerId);
  assert.equal(findCatalogProductBySelection("Ukjent Selskap", "Bil", "Kasko"), null);
});

test("samme produktnavn isoleres på forsikringstype", () => {
  const car = findCatalogProductBySelection("Storebrand", "Bil", "Super");
  const contents = findCatalogProductBySelection("Storebrand", "Innbo", "Super");
  assert.equal(car?.productId, "sb-bil-super");
  assert.equal(contents?.productId, "sb-innbo-super");
  assert.notEqual(car?.productId, contents?.productId);
});

test("personbilaliaser matches, mens eksplisitte andre kjøretøy ikke matches som Bil", () => {
  for (const type of ["Bil", "Bilforsikring", "Personbil", "Personbilforsikring", "Motorvogn", "Motorvognforsikring"]) {
    assert.equal(normalizeInsuranceType(type), "bil", type);
    assert.equal(findCatalogProductBySelection("Gjensidige", type, "Kasko")?.productId, "gj-bil-kasko", type);
  }
  for (const [type, productName] of [
    ["Motorvognforsikring", "MC Kasko"],
    ["Motorvognforsikring", "Bobil Kasko"],
    ["Motorvognforsikring", "Campingvogn Kasko"],
  ]) {
    assert.equal(findCatalogProductBySelection("Gjensidige", type, productName), null, productName);
  }
});

test("katalogfakta og kundedokument beholder forskjellig provenance", () => {
  const insurance = enrich("Gjensidige", "Bil", "Pluss", [
    { name: "Leiebil", value: "Leiebil er valgt" },
  ]);
  const documentTerm = insurance.importantTerms.find((term) => term.name === "Leiebil");
  const catalogTerm = insurance.importantTerms.find((term) => term.key === "maskinskade.km");
  assert.equal(documentTerm?.coverageOrigin, "document");
  assert.equal(documentTerm?.source, undefined);
  assert.equal(catalogTerm?.coverageOrigin, "catalog");
  assert.equal(catalogTerm?.source?.documentId, "gjPluss");
});
