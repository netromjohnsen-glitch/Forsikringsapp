import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences, sortDetailedTerms } from "../lib/comparison-presentation.ts";
import { conceptForFactKey, conceptsForInsurance } from "../lib/presentation-catalog.ts";
import { mcBobilCoverages, mcBobilFactLabel } from "../lib/mc-bobil-registry.ts";
import { trygIfMcBobilCatalog as catalog } from "../lib/mc-bobil-tryg-if-catalog.ts";
import { catalogReferenceForProduct, findCatalogProductBySelection, resolveCatalogFacts } from "../lib/product-catalog.ts";

const asOf = new Date("2026-09-28T12:00:00Z");
const source = (side, key) => ({ documentId: `synthetic-${side}-${key}`, filename: `synthetic-${side}.pdf`,
  termsNumber: "SYNTHETIC", effectiveFrom: "2026-09", page: 1, section: key });
function synthetic(type, rows, side) {
  return { insuranceData: { company: `Synthetic ${side}`, totalAnnualPremium: null, insurances: [{
    type, productName: "Synthetic", annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: rows.map(([key, value]) => ({ key, name: mcBobilFactLabel(type.toLowerCase(), key) ?? key,
      value, coverageOrigin: "document", source: source(side, key) })),
  }] } };
}
function product(company, type, level, addOns = []) {
  const selection = findCatalogProductBySelection(company, type, level, "ordinary", catalog);
  assert.ok(selection);
  return { insuranceData: { company, totalAnnualPremium: null, insurances: [{
    type, productName: level, annualPremium: null, deductible: null, coverageSummary: null,
    catalogReference: catalogReferenceForProduct(selection), catalogSelectionConfirmed: true,
    importantTerms: resolveCatalogFacts(selection, addOns, asOf, null, catalog).map(fact => ({
      key: fact.key, name: fact.label, value: fact.value, source: fact.source,
      deductibleClassification: fact.deductibleClassification, coverageOrigin: "catalog",
    })),
  }] } };
}
function present(first, second, groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null)) {
  const raw = createDifferences(first, second, groups, null);
  return { raw, groups, shown: presentImportantDifferences(raw, groups, null) };
}
const family = (result, id) => result.shown.find(row => row.conceptId === id);
const allRows = entry => [...entry.details.compact, ...entry.details.additional];

for (const type of ["mc", "bobil"]) {
  test(`${type}: registered coverages have curated concepts with distinct scoped identities`, () => {
    const concepts = conceptsForInsurance(type);
    assert.equal(new Set(concepts.map(row => row.id)).size, concepts.length);
    for (const coverage of mcBobilCoverages(type)) {
      const parent = conceptForFactKey(type, coverage.parentKey);
      assert.ok(parent && !parent.id.endsWith(".ovrig"), coverage.parentKey);
      for (const detail of coverage.details) assert.equal(conceptForFactKey(type, detail.key)?.id, parent.id);
    }
    assert.equal(conceptForFactKey(type, "premie.total")?.defaultTier, "detail");
    assert.equal(conceptForFactKey(type, "kjoretoy.kilometerstand")?.defaultTier, "detail");
    assert.equal(conceptForFactKey(type, "unknown.extension")?.defaultTier, "detail");
  });
  test(`${type}: same effective facts are not differences or invented provider rankings`, () => {
    const first = product("If", type === "mc" ? "MC" : "Bobil", "Kasko");
    const before = structuredClone(first);
    const result = present(first, structuredClone(first));
    assert.equal(result.shown.length, 0);
    assert.deepEqual(first, before);
  });
  test(`${type}: source-backed provider differences are grouped without changing original facts`, () => {
    const label = type === "mc" ? "MC" : "Bobil";
    const first = product("Tryg", label, type === "mc" ? "MC Ekstra" : "Bobil Ekstra");
    const second = product("If", label, type === "mc" ? "Kasko" : "Super");
    const before = structuredClone([first, second]);
    const result = present(first, second);
    const rows = result.shown.filter(row => row.details);
    assert.ok(rows.length > 0);
    assert.ok(rows.every(row => row.items.length <= 4));
    assert.ok(rows.every(row => !/best|vinner/iu.test(row.title)));
    assert.ok(rows.length < result.raw.filter(row => row.kind === "term").length);
    const effective = groupTerms(result.groups[0], null);
    for (const entry of rows) for (const ref of entry.details.sources) {
      const rawKey = ref.key.replace(/:description$/u, "");
      const term = effective.find(row => row.key === rawKey);
      assert.ok(term, rawKey);
      assert.ok(term[`${ref.side}Sources`].some(item => item.documentId === ref.source.documentId), rawKey);
      assert.equal(ref.source.company, ref.side === "first" ? "Tryg" : "If");
      assert.equal(ref.origin, "catalog");
    }
    assert.deepEqual([first, second], before);
  });
  test(`${type}: coverage limits and deductible intervals remain separate in compact and details`, () => {
    const label = type === "mc" ? "MC" : "Bobil";
    const result = present(synthetic(label, [
      ["maskinskade.dekning", "Valgt"], ["maskinskade.km", "180 000 km"],
      ["maskinskade.egenandel.kilometer", "Syntetisk egenandel: 120 000–160 000 km: 15 000 kr"],
      ["maskinskade.begrensning", "Syntetisk, fullstendig begrensning som ikke skal forkortes."],
      ["nyverdi.km", "30 000 km"], ["kjoretoy.kjorelengde", "8 000 km"],
    ], "first"), synthetic(label, [
      ["maskinskade.dekning", "Valgt"], ["maskinskade.km", "200 000 km"],
      ["maskinskade.egenandel.kilometer", "Syntetisk egenandel: 120 000–160 000 km: 20 000 kr"],
      ["nyverdi.km", "60 000 km"], ["kjoretoy.kjorelengde", "12 000 km"],
    ], "second"));
    const entry = family(result, `${type}.maskinskade`);
    assert.ok(entry);
    const cap = entry.details.compact.find(row => row.key === "maskinskade.km");
    assert.equal(cap.first, "180 000 km");
    assert.equal(cap.second, "200 000 km");
    assert.ok(entry.details.additional.some(row => row.key === "maskinskade.egenandel.kilometer"));
    assert.ok(entry.details.additional.some(row => row.first === "Syntetisk, fullstendig begrensning som ikke skal forkortes."));
    assert.ok(entry.details.hasAdditional);
    assert.ok(allRows(entry).every(row => !/^nyverdi\.|^kjoretoy\./u.test(row.key)));
  });
  test(`${type}: selected, not selected and undocumented status survive presentation`, () => {
    const label = type === "mc" ? "MC" : "Bobil";
    const selected = synthetic(label, [["maskinskade.dekning", "Valgt"]], "first");
    const rejected = synthetic(label, [["maskinskade.dekning", "Ikke valgt"]], "second");
    const missing = synthetic(label, [], "second");
    const negative = family(present(selected, rejected), `${type}.maskinskade`).details.compact;
    const unknown = family(present(selected, missing), `${type}.maskinskade`).details.compact;
    assert.equal(negative[0].first, "✓ Valgt");
    assert.equal(negative[0].second, "❌ Ikke valgt");
    assert.equal(unknown[0].second, "— Ikke dokumentert");
  });
  test(`${type}: price differences pass through unchanged and are not duplicated as coverage concepts`, () => {
    const first = synthetic(type, [], "first"), second = synthetic(type, [], "second");
    const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
    const price = { kind: "price", type: "price", insuranceKey: type, title: "Syntetisk pris", text: "Uendret prispresentasjon", priority: 200 };
    assert.deepEqual(presentImportantDifferences([price], groups, null), [price]);
  });
}

test("MC: equipment, baggage and fixed equipment use separate concepts and full detail values", () => {
  const result = present(product("Tryg", "MC", "MC Ekstra"), product("If", "MC", "Kasko"));
  const equipment = family(result, "mc.kjoreutstyr");
  const baggage = family(result, "mc.bagasje");
  assert.ok(equipment?.details.hasAdditional);
  assert.ok(baggage?.details.hasAdditional);
  assert.ok(allRows(equipment).every(row => /^mc\.(?:kjoreutstyr|hjelm)\./u.test(row.key)));
  assert.ok(allRows(baggage).every(row => /^mc\.bagasje\./u.test(row.key)));
  assert.ok(baggage.details.additional.some(row => /40 000.*samlet/u.test(row.second)));
  assert.equal(conceptForFactKey("mc", "utstyr.grense").id, "mc.fastmontert-utstyr");
});
test("Bobil: daily cash allowance and actual-expense reimbursement never share a concept", () => {
  const result = present(synthetic("Bobil", [
    ["bobil.ferieavbrudd.dekning", "Valgt"], ["bobil.ferieavbrudd.dagsbelop", "500 kr"],
    ["bobil.feriegaranti.dekning", "Valgt"], ["bobil.feriegaranti.dagsbelop", "2 000 kr"],
  ], "first"), synthetic("Bobil", [
    ["bobil.ferieavbrudd.dekning", "Ikke valgt"],
    ["bobil.feriegaranti.dekning", "Valgt"], ["bobil.feriegaranti.dagsbelop", "1 500 kr"],
  ], "second"));
  for (const id of ["bobil.ferieavbrudd", "bobil.feriegaranti"]) {
    const entry = family(result, id);
    assert.ok(entry?.details);
    assert.ok(allRows(entry).every(row => row.key.startsWith(`${id}.`)));
  }
});
test("Bobil: moisture checks and exclusions stay in details and retain exact provider wording", () => {
  const result = present(product("Tryg", "Bobil", "Bobil Ekstra"), product("If", "Bobil", "Super"));
  const entry = family(result, "bobil.fukt-vann");
  const effective = groupTerms(result.groups[0], null).find(row => row.key === "bobil.fukt.kontroll");
  assert.ok(entry.details.hasAdditional);
  assert.ok(entry.details.additional.some(row => row.key === "bobil.fukt.kontroll" && row.second === effective.second));
  assert.ok(entry.details.additional.some(row => row.key === "bobil.fukt.begrensning"));
  assert.ok(entry.details.sources.some(row => row.key === "bobil.fukt.kontroll" && row.side === "second"));
});
test("MC/Bobil concept lookup never promotes foreign type facts", () => {
  for (const [type, key] of [["mc", "bobil.fukt.alder"], ["bobil", "mc.kjoreutstyr.grense"], ["bil", "bobil.losore.grense"]]) {
    assert.ok(conceptForFactKey(type, key).id.endsWith(".ovrig"));
  }
});
test("MC/Bobil nested detail ordering keeps each family together instead of pooling all limits", () => {
  for (const type of ["mc", "bobil"]) {
    const families = type === "mc" ? ["mc.kjoreutstyr", "mc.bagasje"] : ["bobil.fukt", "bobil.vann"];
    const [a, b] = families;
    const terms = [`${a}.begrensning`, `${b}.begrensning`, `${a}.dekning`, `${b}.dekning`, `${a}.grense`, `${b}.grense`]
      .map(key => ({ key, first: key, second: null }));
    const before = structuredClone(terms);
    assert.deepEqual(sortDetailedTerms(terms).map(row => row.key),
      [`${a}.dekning`, `${a}.grense`, `${a}.begrensning`, `${b}.dekning`, `${b}.grense`, `${b}.begrensning`]);
    assert.deepEqual(terms, before);
  }
});
test("MC: two object scopes do not share detailed values or sources", () => {
  const firstA = synthetic("MC", [["mc.bagasje.dekning", "Valgt"], ["mc.bagasje.grense", "11 000 kr"]], "first-A");
  const secondA = synthetic("MC", [["mc.bagasje.dekning", "Valgt"], ["mc.bagasje.grense", "12 000 kr"]], "second-A");
  const firstB = synthetic("MC", [["mc.bagasje.dekning", "Valgt"], ["mc.bagasje.grense", "21 000 kr"]], "first-B");
  const secondB = synthetic("MC", [["mc.bagasje.dekning", "Valgt"], ["mc.bagasje.grense", "22 000 kr"]], "second-B");
  const groups = [[firstA, secondA, "A"], [firstB, secondB, "B"]].map(([left, right, scopeId]) => ({
    ...groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null)[0], scopeId,
  }));
  const first = { insuranceData: { company: "Synthetic first", totalAnnualPremium: null, insurances: [...firstA.insuranceData.insurances, ...firstB.insuranceData.insurances] } };
  const second = { insuranceData: { company: "Synthetic second", totalAnnualPremium: null, insurances: [...secondA.insuranceData.insurances, ...secondB.insuranceData.insurances] } };
  const entries = present(first, second, groups).shown.filter(row => row.conceptId === "mc.bagasje");
  assert.equal(entries.length, 2);
  for (const entry of entries) {
    assert.ok(entry.details.sources.every(row => row.source.documentId.includes(`-${entry.objectScope}-`)));
    const limit = entry.details.additional.find(row => row.key === "mc.bagasje.grense");
    assert.equal(limit.first, entry.objectScope === "A" ? "11 000 kr" : "21 000 kr");
  }
});
test("presentation neither creates missing detail rows nor discards one-sided information", () => {
  const result = present(synthetic("Bobil", [
    ["bobil.fukt.dekning", "Valgt"], ["bobil.fukt.kontroll", "Syntetisk kontrollkrav"],
  ], "first"), synthetic("Bobil", [["bobil.fukt.dekning", "Ikke valgt"]], "second"));
  const entry = family(result, "bobil.fukt-vann");
  assert.ok(entry.details.additional.some(row => row.key === "bobil.fukt.kontroll"));
  assert.ok(allRows(entry).every(row => !["bobil.vann.dekning", "bobil.fukt.alder"].includes(row.key)));
});
