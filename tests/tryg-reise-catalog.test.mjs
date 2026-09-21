import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/tryg/reise/canonical");
const product = (name) => productCatalog.products.find((entry) =>
  entry.company === "Tryg" && entry.insuranceType === "Reise" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, addOnIds = []) => normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "",
  products: [{ type: "Reise", productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }] });

test("tretten offisielle Tryg Reise-kildefiler er lokale og uendrede", async () => {
  assert.equal((await readdir(root)).length, 13);
  const expected = Object.values(productCatalog.sources).filter((source) =>
    source.company === "Tryg" && source.insuranceType === "Reise");
  assert.equal(expected.length, 14, "Reise/Reise Ekstra er to logiske kilder i samme dokument");
  for (const source of expected) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
  }
  assert.equal(productCatalog.sources.trygReiseProduct.termsNumber, "PRF46000");
  assert.equal(productCatalog.sources.trygReiseLiabilityFuture.effectiveFrom, "2026-10-01");
});

test("PDF-ene dokumenterer datoer, nivåer og separat personforsikring", async () => {
  const readPdf = async (filename) => {
    const parser = new PDFParse({ data: await readFile(path.join(root, filename)) });
    try { return (await parser.getText()).text; } finally { await parser.destroy(); }
  };
  assert.match(await readPdf("PRF46000-Produktvilkar.pdf"), /PRF46000 gjelder fra 01\.01\.2026[\s\S]*del B, personforsikring/u);
  assert.match(await readPdf("PRF46001-Reise-Reise-Ekstra.pdf"), /Reise Ekstra omfatter i tillegg/u);
  assert.match(await readPdf("PRF46003-Reise-Premium.pdf"), /ID-tyveriforsikring/u);
  assert.match(await readPdf("PRF46012-Ulykke-Premium.pdf"), /ULYKKE PREMIUM/u);
});

test("produktstruktur og arv er Reise til Ekstra til Premium", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Reise"), ["Reise", "Reise Ekstra", "Reise Premium"]);
  assert.equal(product("Reise Ekstra").inheritsProductId, "tryg-reise");
  assert.equal(product("Reise Premium").inheritsProductId, "tryg-reise-ekstra");
  const ids = resolveProductComponentIds(product("Reise Premium"));
  assert.ok(ids.includes("trygReiseBase"));
  assert.ok(ids.includes("trygReiseExtra"));
  assert.ok(ids.includes("trygReisePremium"));
  assert.ok(ids.includes("trygReiseAccidentPremium"));
});

test("Ulykke og Ulykke Ekstra er nivåbundne valg mens Premium inkluderer Premium", () => {
  assert.deepEqual(availableAddOns(product("Reise")).map((entry) => entry.id), ["tryg-reise-ulykke"]);
  assert.deepEqual(availableAddOns(product("Reise Ekstra")).map((entry) => entry.id), ["tryg-reise-ulykke-ekstra"]);
  assert.deepEqual(availableAddOns(product("Reise Premium")), []);
  assert.match(fact(resolveCatalogFacts(product("Reise Premium"), []), "reise.ulykke.invaliditet").value, /750 000/);
});

test("forsikringsbevis, personer, verden og reisevarighet er konservativt modellert", () => {
  const base = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(base, "reise.avtale.forbehold").value, /går foran vilkårene/);
  assert.match(fact(base, "reise.personer.omfang").value, /fremgår av forsikringsbeviset.*ikke.*fylles inn/);
  assert.match(fact(base, "reise.omrade.verden").value, /hele verden.*ikke.*bosted/);
  assert.match(fact(base, "reise.varighet.maks").value, /45 dager/);
  assert.match(fact(resolveCatalogFacts(product("Reise Premium"), []), "reise.varighet.maks").value, /70 dager/);
});

test("overnatting, tjenestereise og effective/base følger nivåene", () => {
  assert.match(fact(resolveCatalogFacts(product("Reise"), []), "reise.overnatting").value, /bare fritidsreiser med overnatting/);
  const extra = manual("Reise Ekstra").insuranceData.insurances[0].importantTerms;
  assert.match(fact(extra, "reise.overnatting").value, /med og uten overnatting/);
  assert.match(fact(extra, "reise.tjenestereise").value, /også tjenestereiser/);
  assert.ok(fact(extra, "reise.overnatting").overriddenBase.length);
});

test("avbestilling og UD skiller årsak, sum og bestillingstidspunkt", () => {
  const base = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(base, "reise.avbestilling.dekning").value, /akutt sykdom.*naturkatastrofe.*UD/);
  assert.match(fact(base, "reise.avbestilling.ud").value, /ikke hvis advarselen forelå ved bestilling/);
  assert.match(fact(base, "reise.avbestilling.sum").value, /20 000/);
  assert.match(fact(resolveCatalogFacts(product("Reise Ekstra"), []), "reise.avbestilling.sum").value, /Ingen øvre.*begrensninger/);
});

test("forsinkelse, bagasje og reisegods har separate summer og kategorier", () => {
  const base = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(base, "reise.forsinkelse.rute").value, /teknisk feil.*vær.*terror/);
  assert.match(fact(base, "reise.bagasje.forsinket").value, /fire timer.*transitt/);
  assert.match(fact(base, "reise.bagasje.total").value, /20 000/);
  assert.match(fact(base, "reise.bagasje.per_gjenstand").value, /6 000/);
  assert.match(fact(base, "reise.bagasje.kontanter").value, /3 000/);
  const extra = resolveCatalogFacts(product("Reise Ekstra"), []);
  assert.match(fact(extra, "reise.bagasje.total").value, /Ingen øvre samlet/);
  assert.match(fact(extra, "reise.bagasje.per_gjenstand").value, /40 000/);
  assert.match(fact(extra, "reise.bagasje.forsinket_sum").value, /5 000/);
});

test("Ekstra skiller uhell, reiseavbrudd, hotell og leiebilytelser", () => {
  const extra = resolveCatalogFacts(product("Reise Ekstra"), []);
  assert.match(fact(extra, "reise.bagasje.uhell").value, /fremvises.*mistet\/gjenglemt/);
  assert.match(fact(extra, "reise.bagasje.uhell_begrensning").value,
    /Sykkelskade.*kosmetisk.*arbeidsgivers.*leid løsøre.*motoriserte.*elektriske/s);
  assert.equal(fact(extra, "reise.bagasje.uhell_begrensning").source.page, 4);
  assert.match(fact(extra, "reise.bagasje.uhell_sum").value, /8 000/);
  assert.match(fact(extra, "reise.bagasje.uhell_egenandel").value, /1 500/);
  assert.match(fact(extra, "reise.reiseavbrudd.sum").value, /1 500.*per døgn/);
  assert.match(fact(extra, "reise.forsinkelse.hotell_arrangement_sum").value, /5 000/);
  assert.match(fact(extra, "reise.forsinkelse.leiebilavtale").value, /1,5 times/);
  assert.match(fact(extra, "reise.leiebil.egenandel_sum").value, /40 000/);
});

test("reisesyke, kjent sykdom, hjemtransport og evakuering er egne fakta", () => {
  const base = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(base, "reise.medisinsk.behandling").value, /sykehus inntil 60 døgn/);
  assert.match(fact(base, "reise.medisinsk.kjent").value, /objektiv medisinsk vurdering.*legeerklæring/);
  assert.match(fact(base, "reise.medisinsk.graviditet").value, /uke 37/);
  assert.match(fact(base, "reise.hjemtransport").value, /medisinsk nødvendig.*godkjenne/);
  assert.match(fact(base, "reise.evakuering").value, /Norden.*UD-evakueringsråd/);
});

test("ansvar og rettshjelp bevarer gjeldende kildegrenser og fremtidig vilkår er inaktivt", () => {
  const base = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(base, "reise.ansvar.sum").value, /4 000 000/);
  assert.match(fact(resolveCatalogFacts(product("Reise Ekstra"), []), "reise.ansvar.sum").value, /15 000 000/);
  assert.equal(fact(base, "reise.rettshjelp.dekning").source.documentId, "trygReiseLegal");
  assert.match(fact(base, "reise.rettshjelp.sum").value, /100 000.*250 000/);
  assert.match(fact(base, "reise.rettshjelp.egenandel").value, /Ingen egenandel/);
  assert.equal(resolveCatalogEvidence(product("Reise"), []).some((entry) =>
    entry.source.documentId === "trygReiseLiabilityFuture"), false);
});

test("Premium tilfører ID, lounge, legehjelp og inkludert ulykkesdekning", () => {
  const items = resolveCatalogFacts(product("Reise Premium"), []);
  assert.match(fact(items, "reise.idtyveri.juridisk").value, /25 000.*Økonomisk tap.*dekkes ikke/);
  assert.match(fact(items, "reise.tjeneste.lounge").value, /mer enn én time.*fem medreisende.*40 euro/);
  assert.match(fact(items, "reise.tjeneste.legehjelp").value, /365 dager.*Tjeneste/);
  assert.match(fact(items, "reise.ulykke.dodsfall").value, /750 000/);
  assert.equal(fact(items, "reise.tjeneste.lounge").source.documentId, "trygReiseProductPage");
});

test("ulykkevalg har alder, summer og behandling uten å bli reisegods", () => {
  const basic = resolveCatalogFacts(product("Reise"), ["tryg-reise-ulykke"]);
  const extended = resolveCatalogFacts(product("Reise Ekstra"), ["tryg-reise-ulykke-ekstra"]);
  assert.match(fact(basic, "reise.ulykke.invaliditet").value, /300 000.*70–80 år.*100 000/);
  assert.match(fact(basic, "reise.ulykke.dodsfall").value, /50 000.*150 000/);
  assert.match(fact(extended, "reise.ulykke.invaliditet").value, /500 000/);
  assert.match(fact(extended, "reise.ulykke.behandling").value, /5 %.*tre år.*tannlege/);
  assert.equal(fact(extended, "reise.ulykke.dekning").source.documentId, "trygReiseAccident");
});

test("sikkerhetskrav og aktiviteter er begrensninger med provenance", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.sikkerhet.reisegods").value, /24–06/);
  assert.match(fact(items, "reise.sikkerhet.sykdom").value, /5 000.*forhåndsgodkjenning/);
  assert.match(fact(items, "reise.aktivitet.unntak").value, /base-\/strikkhopp.*motorsport.*1 G.*ekspedisjoner/);
  assert.match(fact(items, "reise.aktivitet.dykking").value, /PADI.*CMAS.*NAUI/);
  assert.equal(fact(items, "reise.aktivitet.unntak").source.documentId, "trygReiseSafety");
});

test("runtime, presentasjonsprioritet og Bil Innbo Hus Reise har ingen typelekkasje", () => {
  for (const [name, addOnIds] of [["Reise", []], ["Reise", ["tryg-reise-ulykke"]],
    ["Reise Ekstra", ["tryg-reise-ulykke-ekstra"]], ["Reise Premium", []]]) {
    const form = new FormData();
    form.set("offerManual", JSON.stringify({ company: "Tryg", totalAnnualPremium: "", products: [{ type: "Reise",
      productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }] }));
    const agreement = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
    assert.equal(agreement.insuranceData.insurances[0].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  }
  const left = manual("Reise");
  const right = manual("Reise Premium");
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const shown = presentImportantDifferences(createDifferences(left, right, groups, null), groups, null, "Tryg", "Tryg");
  assert.ok(shown.find((entry) => entry.termKey === "reise.varighet.maks").priority >
    shown.find((entry) => entry.termKey === "reise.forsinkelse.leiebilavtale").priority);
  assert.equal(shown.some((entry) => entry.termKey === "reise.tjeneste.lounge"), false,
    "tjenestefordelen fortrenger ikke materielle forskjeller i hovedutvalget");

  const all = normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Kasko", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Innbo Ekstra", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Hus Ekstra", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Reise Premium", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  const [car, contents, house, travel] = all.insuranceData.insurances;
  assert.equal(car.importantTerms.some((entry) => entry.key.startsWith("reise.")), false);
  assert.equal(contents.importantTerms.some((entry) => entry.key.startsWith("reise.")), false);
  assert.equal(house.importantTerms.some((entry) => entry.key.startsWith("reise.")), false);
  assert.equal(travel.importantTerms.some((entry) => !entry.key.startsWith("reise.")), false);
});
