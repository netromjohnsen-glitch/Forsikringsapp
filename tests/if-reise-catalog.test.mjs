import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog, productSuggestions, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/if/reise/canonical");
const product = (name) => productCatalog.products.find((p) => p.company === "If" && p.insuranceType === "Reise" && p.name === name);
const fact = (items, key) => items.find((f) => f.key === key);
const manual = (company, name) => normalizeManualAgreement({ company, totalAnnualPremium: "", products: [{ type: "Reise",
  productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] });

test("seks offisielle If Reise-kilder er lokale, registrert og uendrede", async () => {
  assert.equal((await readdir(root)).length, 6);
  const sources = Object.values(productCatalog.sources).filter((s) => s.company === "If" && s.insuranceType === "Reise");
  assert.equal(sources.length, 6);
  for (const source of sources) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
  }
  assert.equal(productCatalog.sources.ifReiseTerms.termsNumber, "ERA3-4");
  assert.equal(productCatalog.sources.ifReiseTerms.effectiveFrom, "2025-03-22");
});

test("If har Basis Standard Super med dokumentert kumulativ arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "If", "Reise"), ["Basis", "Standard", "Super"]);
  assert.equal(product("Standard").inheritsProductId, "if-reise-basis");
  assert.equal(product("Super").inheritsProductId, "if-reise-standard");
  assert.deepEqual(resolveProductComponentIds(product("Super")), ["ifReiseCommon", "ifReiseServices", "ifReiseBasis", "ifReiseStandard", "ifReiseSuper", "ifReiseSmartDelay"]);
});

test("forsikringsbevis personkrets område og varighet er kundestyrt", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(items, "reise.avtale.forbehold").value, /går foran/);
  assert.match(fact(items, "reise.personer.omfang").value, /samme folkeregistrerte adresse.*under 21/);
  assert.match(fact(items, "reise.omrade.verden").value, /Norden eller hele verden/);
  assert.match(fact(items, "reise.varighet.valg").value, /45 eller 90.*Historisk 180.*ikke aktiv/);
  assert.match(fact(items, "reise.varighet.norge").value, /Ubegrenset/);
});

test("Basis har behandling og evakuering men ikke avbestilling bagasje eller tapt ferie", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(items, "reise.medisinsk.behandling").value, /Ingen generell øvre sum.*ingen egenandel/);
  assert.match(fact(items, "reise.evakuering").value, /ingen generell øvre sum/i);
  for (const key of ["reise.avbestilling.dekning", "reise.bagasje.dekning", "reise.reiseavbrudd"])
    assert.match(fact(items, key).value, /Ikke inkludert/);
});

test("Standard overstyrer Basis med avbestilling forsinkelse og reisegods", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "reise.avbestilling.dekning").value, /Ubegrenset.*Ingen egenandel/);
  assert.ok(fact(manual("If", "Standard").insuranceData.insurances[0].importantTerms,
    "reise.avbestilling.dekning").overriddenBase.length);
  assert.match(fact(items, "reise.forsinkelse.rute").value, /3 000 kr per person/);
  assert.match(fact(items, "reise.bagasje.dekning").value, /Tyveri.*hærverk.*transportør/);
});

test("forsinket bagasje har person familie transitt og dokumentasjonsgrenser", () => {
  const item = fact(resolveCatalogFacts(product("Standard"), []), "reise.bagasje.forsinket");
  assert.match(item.value, /5 000.*25 000.*1 000\/5 000.*PIR.*hjemreise/);
});

test("reisegods skiller samlet sum enkeltgjenstand penger og smykker", () => {
  const items = resolveCatalogFacts(product("Standard"), []);
  assert.match(fact(items, "reise.bagasje.total").value, /Ingen samlet øvre sum/);
  assert.match(fact(items, "reise.bagasje.per_gjenstand").value, /40 000.*5 000.*10 000.*30 000/);
});

test("Super tilfører uhell turisttjeneste forsinkelsesytelser og leiebil", () => {
  const items = resolveCatalogFacts(product("Super"), []);
  assert.match(fact(items, "reise.avbestilling.turisttjeneste").value, /5 000.*25 000.*refusjon fra leverandør/);
  assert.match(fact(items, "reise.bagasje.uhell").value, /Plutselig.*ytre årsak.*fremvises/);
  assert.match(fact(items, "reise.bagasje.uhell_egenandel").value, /3 000/);
  assert.match(fact(items, "reise.forsinkelse.hotell_arrangement").value, /åtte timer.*5 000/);
  assert.match(fact(items, "reise.forsinkelse.leiebilavtale").value, /1,5.*10 000/);
  assert.match(fact(items, "reise.leiebil.egenandel_sum").value, /Ingen generell øvre/);
});

test("sykdom hjemtransport kjent sykdom og tapt ferie er presist skilt", () => {
  const basis = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(basis, "reise.medisinsk.tann").value, /5 000/);
  assert.match(fact(basis, "reise.hjemtransport").value, /forhåndsgodkjent.*kiste eller urne/);
  assert.match(fact(basis, "reise.medisinsk.kjent").value, /før avreise.*før reisen ble betalt/);
  assert.match(fact(resolveCatalogFacts(product("Standard"), []), "reise.reiseavbrudd").value, /tapte og planlagte dager/);
});

test("ansvar rettshjelp og Super-grense beholder provenance", () => {
  const basis = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(basis, "reise.ansvar.sum").value, /10 000 000/);
  assert.match(fact(resolveCatalogFacts(product("Super"), []), "reise.ansvar.sum").value, /15 000 000/);
  assert.match(fact(basis, "reise.rettshjelp.sum").value, /100 000.*250 000/);
  assert.match(fact(basis, "reise.rettshjelp.egenandel").value, /ingen særskilt egenandel.*forsikringsbeviset/i);
  assert.equal(fact(basis, "reise.rettshjelp.sum").source.documentId, "ifReiseTerms");
});

test("SmartDelay digital lege og Reisehjelp er tjenester", () => {
  const superItems = resolveCatalogFacts(product("Super"), []);
  assert.match(fact(superItems, "reise.tjeneste.lounge").value, /24 timer.*én time.*fire medreisende.*40 euro/);
  assert.match(fact(superItems, "reise.tjeneste.legehjelp").value, /Kostnadsfri.*07–22.*Tjeneste/);
  assert.match(fact(superItems, "reise.tjeneste.alarm").value, /Døgnåpen.*10 000/);
  assert.equal(fact(superItems, "reise.tjeneste.lounge").source.documentId, "ifReiseSmartDelay");
});

test("If har behandlingsdekning ved ulykke men ingen ulykkeskapital", () => {
  const item = fact(resolveCatalogFacts(product("Super"), []), "reise.ulykke.dekning");
  assert.match(item.value, /Ikke inkludert.*ikke.*kapitalutbetaling.*invaliditet eller dødsfall/);
  assert.equal(resolveCatalogFacts(product("Super"), []).some((f) => f.key === "reise.ulykke.invaliditet"), false);
});

test("sport UD og sikkerhetskrav kommer fra If og ikke Tryg", () => {
  const items = resolveCatalogFacts(product("Basis"), []);
  assert.match(fact(items, "reise.aktivitet.unntak").value, /dykking.*tandemhopp.*Ekspedisjoner/);
  assert.match(fact(items, "reise.omrade.ud").value, /72 timer/);
  assert.match(fact(items, "reise.sikkerhet.reisegods").value, /tilsyn.*låst.*innsjekket/);
  assert.equal(items.every((f) => f.source.company === "If"), true);
});

test("If kan sammenlignes semantisk med Tryg uten varighets- eller ulykkeslekkasje", () => {
  for (const [leftName, rightName] of [["Basis", "Reise"], ["Standard", "Reise Ekstra"], ["Super", "Reise Premium"]]) {
    const left = manual("If", leftName); const right = manual("Tryg", rightName);
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    const shown = presentImportantDifferences(createDifferences(left, right, groups, null), groups, null, "If", "Tryg");
    assert.ok(shown.length > 0);
  }
  const ifSuper = resolveCatalogFacts(product("Super"), []);
  assert.equal(ifSuper.some((f) => /750 000/.test(f.value)), false);
  assert.match(fact(ifSuper, "reise.varighet.valg").value, /45 eller 90/);
});

test("runtime støtter If Basis Standard Super og isolerer Bil Innbo Hus Reise", () => {
  for (const name of ["Basis", "Standard", "Super"]) {
    const form = new FormData();
    form.set("offerManual", JSON.stringify({ company: "If", totalAnnualPremium: "", products: [{ type: "Reise",
      productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] }));
    const agreement = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
    assert.equal(agreement.insuranceData.insurances[0].importantTerms.every((f) => f.key.startsWith("reise.")), true);
  }
  const agreement = normalizeManualAgreement({ company: "If", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Kasko", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  const travel = agreement.insuranceData.insurances[3];
  assert.equal(travel.importantTerms.every((f) => f.key.startsWith("reise.")), true);
  assert.equal(agreement.insuranceData.insurances.slice(0, 3).some((i) => i.importantTerms.some((f) => f.key.startsWith("reise."))), false);
});
