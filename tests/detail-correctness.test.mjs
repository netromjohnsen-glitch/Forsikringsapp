import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDocumentFacts } from "../lib/document-fact-normalization.ts";
import { groupInsurances, groupTerms } from "../lib/comparison.ts";

const term = (name, value, canonicalKey = null) => ({ name, value, canonicalKey });
const insurance = (importantTerms, type = "Bil") => ({
  type, company: "Synthetic", productName: "Test", canonicalProductName: "Test",
  annualPremium: null, deductible: null, coverageSummary: null,
  documentRole: "individual_agreement", agreementPeriod: null, documentIndices: [0],
  objectIdentifiers: [], addOns: [], importantTerms,
});
const normalized = (terms, type = "Bil") => normalizeDocumentFacts(insurance(terms, type));
const keyed = (terms) => new Map(terms.filter(item => item.key).map(item => [item.key, item.value]));
const compared = (terms) => {
  const policy = { ...insurance([]), importantTerms: terms };
  return groupTerms(groupInsurances([policy], [policy], null)[0], null);
};

test("Maskinskade maximum and deductible band keep separate canonical identities", () => {
  const result = normalized([
    term("Maskinskade – kilometer", "180 000 km", "maskinskade.km"),
    term("Maskinskade – egenandel 0–99 999 km", "10 000 kr", "maskinskade.km"),
  ]);
  assert.equal(keyed(result).get("maskinskade.km"), "180 000 km");
  assert.equal(keyed(result).get("maskinskade.egenandel.0-99999"), "10 000 kr");
  const presentationTerms = new Map(compared(result).map(item => [item.key, item]));
  assert.equal(presentationTerms.get("maskinskade.km").first, "180 000 km");
  assert.equal(presentationTerms.get("maskinskade.egenandel.0-99999").first, "10 000 kr");
  assert.doesNotMatch(presentationTerms.get("maskinskade.km").first, /99 999/u);
});

test("alternative Maskinskade ranges are parsed from semantic labels, not pilot values", () => {
  const result = keyed(normalized([
    term("Maskinskade – kilometergrense", "175 000 km", "maskinskade.km"),
    term("Maskinskade – egenandel 100 000–139 999 km", "12 500 kr", "maskinskade.km"),
    term("Maskinskade – egenandel 140 000 til 175 000 kilometer", "17 500 kr", "maskinskade.km"),
  ]));
  assert.equal(result.get("maskinskade.km"), "175 000 km");
  assert.equal(result.get("maskinskade.egenandel.100000-139999"), "12 500 kr");
  assert.equal(result.get("maskinskade.egenandel.140000-175000"), "17 500 kr");
});

test("reversing Maskinskade extraction order preserves identities", () => {
  const input = [
    term("Maskinskade – egenandel 0–88 888 km", "8 000 kr", "maskinskade.km"),
    term("Maskinskade – kilometer", "166 666 km", "maskinskade.km"),
    term("Maskinskade – egenandel 88 889–166 666 km", "16 000 kr", "maskinskade.km"),
  ];
  const snapshot = (items) => normalized(items).map(({ key, value }) => [key, value]).sort();
  assert.deepEqual(snapshot(input), snapshot(input.toReversed()));
});

test("other mileage facts never become Maskinskade mileage", () => {
  const result = normalized([
    term("Årlig kjørelengde", "22 222 km", "maskinskade.km"),
    term("Kilometerstand", "133 333 km", "maskinskade.km"),
    term("Avtalt maksimal kilometerstand", "177 777 km", "maskinskade.km"),
    term("Totalskadegaranti – kilometer", "55 555 km", "maskinskade.km"),
    term("Maskinskade – kilometer", "188 888 km", "maskinskade.km"),
  ]);
  const facts = keyed(result);
  assert.equal(facts.get("kjoretoy.kjorelengde"), "22 222 km");
  assert.equal(facts.get("kjoretoy.kilometerstand"), "133 333 km");
  assert.equal(facts.get("kjoretoy.avtalt_maks_kilometerstand"), "177 777 km");
  assert.equal(facts.get("nyverdi.km"), "55 555 km");
  assert.equal(facts.get("maskinskade.km"), "188 888 km");
});

test("compound Maskinskade wording stops the coverage limit before deductible bands", () => {
  const result = normalized([term("Maskinskade", "Gjelder i 9 år og til 170 000 km. Egenandel 0–89 999 km: 8 000 kr; 90 000–170 000 km: 16 000 kr", "maskinskade.dekning")]);
  assert.deepEqual(result.filter(item => item.key === "maskinskade.km").map(item => item.value), ["170 000 km"]);
});

const siblingInput = (values = ["Ladekabeltekst", "21 111 kr", "Maksimalt 151 111 kr"]) => [
  term("Ladekabel", values[0], "ladekabel.dekning"),
  term("Parkeringsskade – forsikringssum", values[1], "ladekabel.dekning"),
  term("Leasing – startleie", values[2], "ladekabel.dekning"),
];

test("Ladekabel is isolated from Parkeringsskade", () => {
  const result = keyed(normalized(siblingInput().slice(0, 2)));
  assert.equal(result.get("ladekabel.dekning"), "Ladekabeltekst");
  assert.equal(result.get("parkering.grense"), "21 111 kr");
});

test("Ladekabel is isolated from Startleie", () => {
  const result = keyed(normalized([siblingInput()[0], siblingInput()[2]]));
  assert.equal(result.get("ladekabel.dekning"), "Ladekabeltekst");
  assert.equal(result.get("leasing.startleie"), "Maksimalt 151 111 kr");
});

for (const [name, order] of [["A/B/C", [0, 1, 2]], ["C/A/B", [2, 0, 1]], ["B/C/A", [1, 2, 0]]]) {
  test(`sibling coverage grouping is order independent ${name}`, () => {
    const input = siblingInput(), result = keyed(normalized(order.map(index => input[index])));
    assert.deepEqual([...result.entries()].sort(), [
      ["ladekabel.dekning", "Ladekabeltekst"],
      ["leasing.startleie", "Maksimalt 151 111 kr"],
      ["parkering.grense", "21 111 kr"],
    ]);
  });
}

test("missing sibling does not change the other canonical identities", () => {
  const result = keyed(normalized(siblingInput().filter((_, index) => index !== 1)));
  assert.equal(result.has("parkering.grense"), false);
  assert.equal(result.get("ladekabel.dekning"), "Ladekabeltekst");
  assert.equal(result.get("leasing.startleie"), "Maksimalt 151 111 kr");
});

test("alternative sibling values stay attached to their own facts through comparison", () => {
  const terms = normalized(siblingInput(["Kun kabel", "23 456 kr", "Maksimalt 176 543 kr"]));
  const groups = new Map(compared(terms).map(item => [item.key, item]));
  assert.equal(groups.get("ladekabel.dekning").first, "Kun kabel");
  assert.equal(groups.get("parkering.grense").first, "23 456 kr");
  assert.equal(groups.get("leasing.startleie").first, "Maksimalt 176 543 kr");
  assert.doesNotMatch(groups.get("ladekabel.dekning").first, /23 456|176 543/u);
});

test("generic precise-label repair also isolates non-Bil sibling coverages", () => {
  const result = keyed(normalized([
    term("Rettshjelp", "Valgt", "uhell.dekning"),
    term("Uhell", "Ikke valgt", "uhell.dekning"),
  ], "Innbo"));
  assert.equal(result.get("rettshjelp.dekning"), "Valgt");
  assert.equal(result.get("uhell.dekning"), "Ikke valgt");
});
