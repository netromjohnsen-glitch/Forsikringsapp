import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { productCatalog, productSuggestions, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";

const product = (name) => productCatalog.products.find((p) => p.company === "Gjensidige" && p.insuranceType === "Reise" && p.name === name);
const fact = (items, key) => { const item = items.find((entry) => entry.key === key); assert.ok(item, `Mangler ${key}`); return item; };

test("åtte offisielle Gjensidige Reise-kilder er lokale og hashverifiserte", async () => {
  const sources = Object.values(productCatalog.sources).filter((source) => source.id.startsWith("gjensidigeReise"));
  assert.equal(sources.length, 8);
  for (const source of sources) {
    const bytes = await readFile(new URL(`../catalog/sources/gjensidige/reise/${source.filename}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.match(source.url, /^https:\/\/www\.gjensidige\.no\//u);
  }
});

test("Gjensidige Reise har to dokumenterte nivåer med arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Gjensidige", "Reise"), ["Reise", "Reise Pluss"]);
  assert.equal(product("Reise Pluss").inheritsProductId, "gjensidige-reise");
  assert.ok(resolveProductComponentIds(product("Reise Pluss")).includes("gjensidigeReise"));
});

test("forsikringsbevis personkrets geografi og 70 dager er bevart", () => {
  const items = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(items, "reise.avtale.forbehold").value, /Forsikringsbeviset/);
  assert.match(fact(items, "reise.personer.omfang").value, /6 måneder.*folketrygd.*barnebarn.*oldebarn/);
  assert.match(fact(items, "reise.omrade.verden").value, /yrkesreiser.*dagsturer.*uten overnatting/);
  assert.match(fact(items, "reise.varighet.maks").value, /70 dager.*både Reise og Reise Pluss/);
});

test("varighetsutvidelse er kundespesifikk og ikke produktnivå", () => {
  for (const name of ["Reise", "Reise Pluss"])
    assert.match(fact(resolveCatalogFacts(product(name), []), "reise.varighet.enkeltreise_utvidelse").value, /42 ekstra uker.*295.*før avreise.*ikke.*underveis/);
});

test("Reise Pluss forbedrer reisegods gjennom effective base", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.bagasje.total").value, /100 000/);
  assert.match(fact(plus, "reise.bagasje.total").value, /Ingen generell/);
  assert.match(fact(plus, "reise.bagasje.verdisaker").value, /40 000/);
  assert.equal(fact(plus, "reise.bagasje.total").replacesBase, true);
});

test("mobil har presist skadeomfang og egenandel", () => {
  const items = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(items, "reise.bagasje.mobil").value, /skjerm\/bakside.*tyveri.*mistet\/bortkommet.*unntatt/);
  assert.match(fact(items, "reise.bagasje.mobil_egenandel").value, /1 000.*3 000/);
});

test("avbestilling sykdom og tapt ferie er separate", () => {
  const items = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(items, "reise.avbestilling.dekning").value, /UD-advarsel.*72 timer.*bonuspoeng/);
  assert.match(fact(items, "reise.medisinsk.behandling").value, /uten generell øvre sum/);
  assert.match(fact(items, "reise.reiseavbrudd").value, /2 000.*20 000/);
  assert.match(fact(items, "reise.reiseavbrudd.sum").value, /100 000/);
});

test("hjemtransport hjemkalling og tilkalling er separate", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.hjemtransport").value, /Forhåndsgodkjent.*50 000/);
  assert.match(fact(items, "reise.hjemkallelse").value, /nærmeste familie.*bolig\/forretning/);
  assert.match(fact(items, "reise.sykeledsagelse").value, /inntil to personer/);
});

test("forsinket bagasje og transport har nivåforskjeller", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.bagasje.forsinket_sum").value, /3 000/);
  assert.match(fact(plus, "reise.bagasje.forsinket_sum").value, /5 000/);
  assert.match(fact(plus, "reise.forsinkelse.rute_sum").value, /25 000/);
  assert.match(fact(plus, "reise.forsinkelse.hotell_arrangement").value, /5 000.*åtte timer/);
});

test("evakuering UD og aktivitet er presist avgrenset", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.evakuering").value, /Forhåndsgodkjent.*krig.*terror.*pandemi/);
  assert.match(fact(items, "reise.omrade.ud").value, /særskilt utvidelse/);
  assert.match(fact(items, "reise.aktivitet.unntak").value, /basehopp.*40 meter.*Arktis\/Antarktis/);
});

test("ansvar og rettshjelp følger Gjensidige-kildene", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.ansvar.sum").value, /15 000 000/);
  assert.match(fact(items, "reise.rettshjelp.sum").value, /100 000.*1 000 000/);
  assert.match(fact(items, "reise.rettshjelp.egenandel").value, /Ingen egenandel.*forsikringsbeviset/);
  assert.equal(items.every((entry) => entry.source.company === "Gjensidige"), true);
});

test("Reise Pluss har ulykkeskapital og leiebilegenandel", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.equal(base.some((entry) => entry.key === "reise.ulykke.invaliditet"), false);
  assert.match(fact(plus, "reise.ulykke.invaliditet").value, /300 000.*500 000/);
  assert.match(fact(plus, "reise.ulykke.dodsfall").value, /100 000/);
  assert.match(fact(plus, "reise.leiebil.egenandel").value, /Ubegrenset/);
});

test("alarmsentral og Dr.Dropin er tjenester", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.tjeneste.alarm").value, /Døgnåpen.*Tjeneste/);
  assert.match(fact(items, "reise.tjeneste.legehjelp").value, /Dr.Dropin.*utlandet.*Tjeneste/);
});

test("SmartDelay+ er ikke aktiv per 20.09.2026", () => {
  for (const name of ["Reise", "Reise Pluss"])
    assert.equal(resolveCatalogFacts(product(name), []).some((entry) => entry.key === "reise.tjeneste.lounge" || /SmartDelay/u.test(entry.value)), false);
});

test("cross-company beholder uavhengig varighet og provenance", () => {
  const gj = resolveCatalogFacts(product("Reise Pluss"), []);
  for (const [company, name, key] of [["Tryg", "Reise Premium", "reise.varighet.maks"], ["If", "Super", "reise.varighet.valg"], ["Storebrand", "Super", "reise.varighet.maks"]]) {
    const other = productCatalog.products.find((p) => p.company === company && p.insuranceType === "Reise" && p.name === name);
    assert.ok(other);
    assert.notEqual(fact(resolveCatalogFacts(other, []), key).value, fact(gj, "reise.varighet.maks").value);
  }
});

test("runtime støtter Gjensidige Reise og fire forsikringstyper uten lekkasje", () => {
  for (const name of ["Reise", "Reise Pluss"]) {
    const normalized = normalizeManualAgreement({ company: "Gjensidige", totalAnnualPremium: "", products: [{ type: "Reise", productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] });
    assert.equal(normalized.insuranceData.insurances[0].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  }
  const normalized = normalizeManualAgreement({ company: "Gjensidige", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Kasko", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Hus Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Reise Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  assert.equal(normalized.insuranceData.insurances[3].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  assert.equal(normalized.insuranceData.insurances.slice(0, 3).some((insurance) => insurance.importantTerms.some((entry) => entry.key.startsWith("reise."))), false);
});
