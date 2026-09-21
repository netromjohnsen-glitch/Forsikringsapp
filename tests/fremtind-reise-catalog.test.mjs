import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { includePdfAddOnTerms } from "../lib/pdf-addons.ts";
import { productCatalog, productSuggestions, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

const product = (name) => productCatalog.products.find((p) => p.company === "Fremtind" && p.insuranceType === "Reise" && p.name === name);
const active = () => product("Reise");
const historical = () => product("Eika Reise (P10 – historisk)");
const historicalPlus = () => product("Eika Reise Pluss (P10/P10P – historisk)");
const fact = (items, key) => { const item = items.find((entry) => entry.key === key); assert.ok(item, `Mangler ${key}`); return item; };
const manual = (name, distributionChannel = "Eika", reference = null, importantTerms = []) => normalizeManualAgreement({
  company: "Fremtind", distributionChannel, totalAnnualPremium: "", products: [{ type: "Reise", productName: name,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms, catalogReference: reference, addOnIds: [] }],
});

test("sju offisielle Fremtind Reise-kilder er lokale og hashverifiserte", async () => {
  const sources = Object.values(productCatalog.sources).filter((source) => source.id.startsWith("fremtindReise"));
  assert.equal(sources.length, 7);
  for (const source of sources) {
    const bytes = await readFile(new URL(`../catalog/sources/fremtind/reise/${source.filename}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.equal(source.company, "Fremtind");
  }
});

test("aktiv Fremtind Reise er én produktgenerasjon og historisk Eika er eksplisitt separat", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Reise"), [
    "Reise", "Eika Reise (P10 – historisk)", "Eika Reise Pluss (P10/P10P – historisk)",
  ]);
  assert.equal(active().providerId, "fremtind");
  assert.equal(active().productId, "fremtind-reise");
  assert.equal(active().version, "PRE-450.200-015");
  assert.equal(active().sourceId, "fremtindReiseUnifiedTerms");
  assert.equal(historical().providerId, "fremtind-eika-legacy");
  assert.equal(historical().productId, "eika-reise-p10");
  assert.equal(historicalPlus().productId, "eika-reise-pluss-p10");
  assert.equal(historicalPlus().inheritsProductId, "eika-reise-p10");
  assert.ok(resolveProductComponentIds(historicalPlus()).includes("fremtindReiseHistoricalStandard"));
});

test("aktive kilder er PRE-450.200-015 og IPID V.104 for alle tre kanaler", () => {
  const terms = productCatalog.sources.fremtindReiseUnifiedTerms;
  const ipid = productCatalog.sources.fremtindReiseUnifiedIpid;
  assert.equal(terms.termsNumber, "PRE-450.200-015");
  assert.equal(terms.effectiveFrom, "2025-03-17");
  assert.equal(ipid.termsNumber, "V.104");
  assert.deepEqual(terms.distributionChannels, ["SpareBank 1", "DNB", "Eika"]);
  assert.deepEqual(ipid.distributionChannels, ["SpareBank 1", "DNB", "Eika"]);
});

test("aktiv generasjon har ett nivå uten historiske plusstillegg", () => {
  assert.deepEqual(active().componentIds, ["fremtindReiseActiveTerms", "fremtindReiseActiveIpid"]);
  assert.deepEqual(active().addOnIds ?? [], []);
  assert.equal(productSuggestions(productCatalog, "Fremtind", "Reise").filter((name) => name === "Reise").length, 1);
});

test("historiske kilder og produkter er tydelig avgrenset til Eika-generasjonen", () => {
  for (const sourceId of ["fremtindReiseTerms", "fremtindReiseIpid", "fremtindReiseFaq", "fremtindReiseProvider", "fremtindReiseClaims"]) {
    assert.deepEqual(productCatalog.sources[sourceId].distributionChannels, ["Eika"]);
    assert.match(productCatalog.sources[sourceId].appliesTo.join(" "), /historisk/i);
  }
  assert.equal(historical().providerId, historicalPlus().providerId);
  assert.equal(historical().version, historicalPlus().version);
});

test("alle aktive fakta peker bare på aktivt hovedvilkår eller IPID", () => {
  const allowed = new Set(["fremtindReiseUnifiedTerms", "fremtindReiseUnifiedIpid"]);
  for (const entry of resolveCatalogFacts(active(), [])) assert.equal(allowed.has(entry.source.documentId), true, entry.key);
});

test("aktiv standard er 70 dager og andre varigheter er bare kundespesifikke valg", () => {
  const items = resolveCatalogFacts(active(), []);
  assert.match(fact(items, "reise.varighet.maks").value, /^70 dager/);
  assert.match(fact(items, "reise.varighet.valg").value, /forsikringsbeviset.*kundespesifikke/i);
  const values = items.map((entry) => entry.value).join(" ");
  assert.doesNotMatch(values, /90|120|180/);
  assert.equal(fact(items, "reise.varighet.maks").source.documentId, "fremtindReiseUnifiedIpid");
  assert.equal(fact(items, "reise.varighet.maks").source.termsNumber, "V.104");
});

test("SpareBank 1 DNB og Eika nytegning velger samme aktive katalogreferanse", () => {
  for (const channel of ["SpareBank 1", "DNB", "Eika"]) {
    const insurance = manual("Reise", channel).insuranceData.insurances[0];
    assert.deepEqual(insurance.catalogReference, { providerId: "fremtind", productId: "fremtind-reise", version: "PRE-450.200-015" });
    assert.match(fact(insurance.importantTerms, "reise.varighet.maks").value, /^70 dager/);
  }
});

test("historisk Eika P10 og P10P beholder 77 dager og Reise Pluss-arv", () => {
  for (const entry of [historical(), historicalPlus()]) {
    const items = resolveCatalogFacts(entry, []);
    assert.match(fact(items, "reise.varighet.maks").value, /77/);
    assert.equal(fact(items, "reise.varighet.maks").source.documentId, "fremtindReiseTerms");
    assert.equal(fact(items, "reise.varighet.maks").source.termsNumber, "P10");
  }
  assert.match(fact(resolveCatalogFacts(historicalPlus(), []), "reise.bagasje.total").value, /Ingen generell/);
});

test("aktiv og historisk provenance og fakta lekker ikke mellom generasjoner", () => {
  const current = resolveCatalogFacts(active(), []);
  const old = resolveCatalogFacts(historicalPlus(), []);
  assert.equal(current.some((entry) => ["P10", "P10P"].includes(entry.source.termsNumber)), false);
  assert.equal(old.some((entry) => ["PRE-450.200-015", "V.104"].includes(entry.source.termsNumber)), false);
  assert.match(fact(current, "reise.bagasje.forsinket").value, /5 000/);
  assert.match(fact(old, "reise.bagasje.forsinket").value, /6 000/);
});

test("aktive reisegods forsinkelse leiebil og sykdomsfakta følger nytt vilkår", () => {
  const items = resolveCatalogFacts(active(), []);
  assert.match(fact(items, "reise.bagasje.verdisaker").value, /40 000/);
  assert.match(fact(items, "reise.bagasje.uhell").value, /2 500/);
  assert.match(fact(items, "reise.bagasje.mobil_egenandel").value, /2 000/);
  assert.match(fact(items, "reise.bagasje.forsinket").value, /fire timers.*5 000.*hjemreise/i);
  assert.match(fact(items, "reise.forsinkelse.rute").value, /6 000.*ubegrenset/);
  assert.match(fact(items, "reise.leiebil.egenandel").value, /kaskoforsikret.*bilpool.*unntatt/i);
  assert.match(fact(items, "reise.medisinsk.behandling").value, /30 døgn/);
  assert.match(fact(items, "reise.medisinsk.tann").value, /5 000.*1 000/);
});

test("aktiv reiseavbrudd avbestilling ulykke og rettshjelp følger nytt vilkår", () => {
  const items = resolveCatalogFacts(active(), []);
  assert.match(fact(items, "reise.reiseavbrudd").value, /2 000.*750.*ti dager/);
  assert.match(fact(items, "reise.avbestilling.dekning").value, /ikke-refunderbare.*72 timer/);
  assert.match(fact(items, "reise.ulykke.invaliditet").value, /700 000.*500 000.*100 000/);
  assert.match(fact(items, "reise.ulykke.dodsfall").value, /150 000.*500 000.*100 000/);
  assert.match(fact(items, "reise.rettshjelp.sum").value, /100 000.*250 000/);
  assert.match(fact(items, "reise.rettshjelp.egenandel").value, /forsikringsbeviset.*20 %/);
  assert.equal(items.some((entry) => entry.key === "reise.avbestilling.sum"), false);
});

test("manual flow krever eksplisitt historisk navn og stabil katalogreferanse", () => {
  const activeInsurance = manual("Reise", "Eika").insuranceData.insurances[0];
  const oldInsurance = manual("Eika Reise (P10 – historisk)", "Eika", {
    providerId: "fremtind-eika-legacy", productId: "eika-reise-p10", version: "P10-P10P-2025-01-01",
  }).insuranceData.insurances[0];
  assert.equal(activeInsurance.catalogReference.productId, "fremtind-reise");
  assert.equal(oldInsurance.catalogReference.productId, "eika-reise-p10");
  assert.match(fact(activeInsurance.importantTerms, "reise.varighet.maks").value, /70/);
  assert.match(fact(oldInsurance.importantTerms, "reise.varighet.maks").value, /77/);
  const ambiguous = manual("Reise Pluss", "Eika").insuranceData.insurances[0];
  assert.equal(ambiguous.catalogReference, null);
});

test("feil katalogreferanse kan ikke bytte aktiv og historisk generasjon", () => {
  assert.throws(() => manual("Reise", "Eika", {
    providerId: "fremtind-eika-legacy", productId: "eika-reise-p10", version: "P10-P10P-2025-01-01",
  }), /stemmer ikke/);
});

test("kundedokumentets avtalte reisevarighet kan beholdes uten automatisk katalogkobling", () => {
  const insurance = manual("Kundens reiseavtale", "Eika", null, [{ name: "Reisevarighet", value: "120 dager avtalt i forsikringsbeviset" }]).insuranceData.insurances[0];
  assert.equal(insurance.catalogReference, null);
  assert.deepEqual(insurance.importantTerms, [{ name: "Reisevarighet", value: "120 dager avtalt i forsikringsbeviset" }]);
});

test("PDF-uttrekk bevarer eksplisitt produktgenerasjon og avtalt varighet uten automatisk remapping", () => {
  for (const extracted of [
    { productName: "Fremtind Reise PRE-450.200-015", duration: "70 dager" },
    { productName: "Eika Reise Pluss P10/P10P", duration: "77 dager" },
  ]) {
    const insurance = includePdfAddOnTerms({ type: "Reise", productName: extracted.productName,
      annualPremium: null, deductible: null, coverageSummary: null,
      importantTerms: [{ name: "Reisevarighet", value: extracted.duration }], addOns: [] });
    assert.equal(insurance.productName, extracted.productName);
    assert.deepEqual(insurance.importantTerms, [{ name: "Reisevarighet", value: extracted.duration }]);
    assert.equal("catalogReference" in insurance, false);
  }
});

test("aktiv mot historisk viser reell 70 mot 77-dagers forskjell", () => {
  const left = manual("Eika Reise (P10 – historisk)", "Eika");
  const right = manual("Reise", "Eika");
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const duration = terms.find((entry) => entry.key === "reise.varighet.maks");
  assert.match(duration.first, /77/);
  assert.match(duration.second, /70/);
  assert.ok(createDifferences(left, right, groups, null).some((entry) => entry.termKey === "reise.varighet.maks"));
});

test("SpareBank 1 mot DNB aktiv Reise gir ingen falsk varighetsforskjell", () => {
  const left = manual("Reise", "SpareBank 1");
  const right = manual("Reise", "DNB");
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  assert.equal(createDifferences(left, right, groups, null).some((entry) => entry.termKey === "reise.varighet.maks"), false);
});

test("fire forsikringstyper for Fremtind er fortsatt isolert", () => {
  const normalized = normalizeManualAgreement({ company: "Fremtind", distributionChannel: "Eika", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Reise", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  assert.match(fact(normalized.insuranceData.insurances[3].importantTerms, "reise.varighet.maks").value, /70/);
  assert.equal(normalized.insuranceData.insurances.slice(0, 3).some((insurance) => insurance.importantTerms.some((entry) => entry.key?.startsWith("reise."))), false);
});
