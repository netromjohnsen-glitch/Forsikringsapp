import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms, groupAddOnNames } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { deriveCanonicalCoverages } from "../lib/coverage-status.ts";

function uiAgreement(company, productId, version, addOnIds, deductible, annualPremium) {
  return {
    company,
    totalAnnualPremium: "",
    products: [{
      type: "Bil",
      productName: "Super",
      annualPremium,
      deductible,
      coverageSummary: "",
      importantTerms: [],
      catalogReference: {
        providerId: company.toLocaleLowerCase("nb-NO"),
        productId,
        version,
      },
      addOnIds,
    }],
  };
}

test("UI-formet If–Storebrand-request beholder alle tillegg til toppsekslisten", () => {
  const formData = new FormData();
  formData.set("existingMode", "manual");
  formData.set("offerMode", "manual");
  formData.set("existingManual", JSON.stringify(uiAgreement(
    "If", "if-bil-super", "MOT2-2", ["if-leiebil", "if-motor-gir"], "6000", "14000",
  )));
  formData.set("offerManual", JSON.stringify(uiAgreement(
    "Storebrand", "sb-bil-super", "motor09", ["sb-leiebil"], "8000", "17000",
  )));

  // Samme JSON-grense som UI -> FormData -> API-ruten bruker.
  const existing = normalizeManualAgreement(JSON.parse(formData.get("existingManual")));
  const offer = normalizeManualAgreement(JSON.parse(formData.get("offerManual")));

  assert.deepEqual(existing.insuranceData.insurances[0].addOnIds, ["if-leiebil", "if-motor-gir"]);
  assert.deepEqual(offer.insuranceData.insurances[0].addOnIds, ["sb-leiebil"]);
  assert.ok(existing.insuranceData.insurances[0].importantTerms.some((term) =>
    term.key === "leiebil.dager" && /90 dager/.test(term.value)));
  assert.ok(offer.insuranceData.insurances[0].importantTerms.some((term) =>
    term.key === "leiebil.dager" && /60 dager/.test(term.value)));

  const groups = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null);
  const differences = createDifferences(existing, offer, groups, null);
  const topFive = presentImportantDifferences(
    differences, groups, null, "If", "Storebrand",
  ).filter((difference) => difference.insuranceKey && difference.type !== "price")
    .slice(0, 5);

  assert.deepEqual(topFive.map((difference) => difference.title), [
    "Skade på egen bil",
    "Maskinskade",
    "Totalskade og nybil",
    "Mobilitet",
    "Øvelseskjøring og ung fører",
  ]);
  assert.ok(topFive.find((difference) => difference.conceptId === "bil.mobilitet").items
    .some((item) => item.termKey === "leiebil.dager"));
  assert.equal(topFive.at(-1).presentationType, "conditional-benefit");
  assert.match(topFive.at(-1).text, /Bruk Ifs app.*Skade under øvelseskjøring gir ikke bonustap/s);
});

test("UI-formet råtevalg bevares ved repeat og fjernes bare fra nytt manuelt input", () => {
  const addon = "gjensidige-hus-rate-insekter", key = "hus.rate.dekning";
  const raw = { company: "Gjensidige", products: [{ type: "Hus", productName: "Hus", importantTerms: [], addOnIds: [addon] }] };
  const submit = input => {
    const form = new FormData(); form.set("existingMode", "manual"); form.set("existingManual", JSON.stringify(input));
    return normalizeManualAgreement(JSON.parse(form.get("existingManual"))).insuranceData.insurances[0];
  };
  const repeat = insurance => enrichExtractedAgreementWithCatalog({ company: "Gjensidige", totalAnnualPremium: null, insurances: [insurance] }).insurances[0];
  const state = insurance => deriveCanonicalCoverages(insurance, "Hus").find(coverage => coverage.id === key);
  const selected = submit(raw), quiet = submit({ ...raw, products: [{ ...raw.products[0], addOnIds: [] }] });
  let current = selected;
  for (let n = 0; n < 4; n++) {
    assert.equal(state(current).status, "selected"); assert.deepEqual(current.addOnIds, [addon]);
    assert.deepEqual(current.addOns[0].manualSelection, { origin: "manual", catalogReference: {
      providerId: "gjensidige", productId: "gjensidige-hus", version: "Alminnelige vilkår",
    } });
    for (const [first, second, side] of [[current, quiet, "first"], [quiet, current, "second"], [current, current, "first"]]) {
      const row = groupTerms(groupInsurances([first], [second], null)[0], null).find(row => row.key === key);
      assert.equal(row[side + "Coverage"].status, "selected");
      assert.deepEqual(row[side + "Sources"], selected.importantTerms.find(term => term.key === key).sources);
    }
    current = repeat(current);
  }
  // This is the actual checkbox contract: remove the ID from raw input and
  // resubmit the whole agreement; never mutate an old enriched result as input.
  raw.products[0].addOnIds = raw.products[0].addOnIds.filter(id => id !== addon);
  let removed = submit(raw);
  for (let n = 0; n < 4; n++) {
    assert.equal(state(removed).status, "unknown"); assert.deepEqual(removed.addOnIds, []);
    assert.deepEqual(removed.addOns, []); assert.equal(groupAddOnNames([removed], "Hus"), null);
    removed = repeat(removed);
  }
  let custom = submit({ ...raw, products: [{ ...raw.products[0], customProduct: true, productName: "Syntetisk eget produkt",
    importantTerms: [{ name: "Råte og sopp", value: "Manuell særtekst" }] }] });
  for (let n = 0; n < 4; n++) {
    assert.equal(custom.catalogReference, null); assert.deepEqual(custom.addOnIds, []); assert.deepEqual(custom.addOns, []);
    assert.equal(custom.importantTerms[0].value, "Manuell særtekst");
    assert.equal(custom.importantTerms.some(term => term.coverageOrigin === "catalog"), false);
    custom = repeat(custom);
  }
});
