import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { productCatalog, productSuggestions, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";

const product = (name) => productCatalog.products.find((p) => p.company === "Fremtind" && p.insuranceType === "Reise" && p.name === name);
const fact = (items, key) => { const item = items.find((entry) => entry.key === key); assert.ok(item, `Mangler ${key}`); return item; };

test("sju offisielle Fremtind Reise-kilder er lokale og hashverifiserte", async () => {
  const sources = Object.values(productCatalog.sources).filter((source) => source.id.startsWith("fremtindReise"));
  assert.equal(sources.length, 7);
  for (const source of sources) {
    const bytes = await readFile(new URL(`../catalog/sources/fremtind/reise/${source.filename}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.equal(source.company, "Fremtind");
  }
});

test("Fremtind er provider og Eika er kanal med Reise til Reise Pluss-arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Reise"), ["Reise", "Reise Pluss"]);
  assert.equal(product("Reise").providerId, "fremtind");
  assert.equal(product("Reise Pluss").inheritsProductId, "fremtind-reise");
  assert.ok(resolveProductComponentIds(product("Reise Pluss")).includes("fremtindReiseStandard"));
  assert.equal(productCatalog.companies.includes("Eika Forsikring"), false);
});

test("forsikringsbevis personkrets geografi og 77 dager er bevart", () => {
  const items = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(items, "reise.avtale.forbehold").value, /Forsikringsbeviset/);
  assert.match(fact(items, "reise.personer.omfang").value, /registrert partner.*21 år.*Barnebarn.*oldebarn/);
  assert.match(fact(items, "reise.omrade.verden").value, /hele verden.*Ingen krav til overnatting.*utenfor Norden/);
  assert.match(fact(items, "reise.varighet.maks").value, /77.*både Reise og Reise Pluss/);
});

test("utvidet reisetid er kundespesifikk og ikke eget produkt", () => {
  assert.match(fact(resolveCatalogFacts(product("Reise"), []), "reise.varighet.utvidelse").value, /Kundespesifikt.*forsikringsbeviset.*Ikke et eget/);
  assert.deepEqual(productSuggestions(productCatalog, "Fremtind", "Reise"), ["Reise", "Reise Pluss"]);
});

test("Reise Pluss forbedrer reisegods gjennom effective base", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.bagasje.total").value, /40 000.*120 000/);
  assert.match(fact(plus, "reise.bagasje.total").value, /Ingen generell/);
  assert.match(fact(plus, "reise.bagasje.per_gjenstand").value, /40 000/);
  assert.equal(fact(plus, "reise.bagasje.total").replacesBase, true);
});

test("uhell og mobil holdes separate", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.bagasje.uhell").value, /Ikke omfattet/);
  assert.match(fact(plus, "reise.bagasje.uhell").value, /Plutselig.*ytre.*6 000/);
  assert.match(fact(plus, "reise.bagasje.mobil").value, /plutselig.*ytre.*kosmetisk/);
  assert.match(fact(plus, "reise.bagasje.mobil_egenandel").value, /2 000.*forsikringsbevis/);
});

test("forsinket bagasje bruker fire timer og 6 000 kroner", () => {
  for (const name of ["Reise", "Reise Pluss"])
    assert.match(fact(resolveCatalogFacts(product(name), []), "reise.bagasje.forsinket").value, /fire timers.*6 000.*PIR.*hjemreise.*ikke/);
});

test("avbestilling og reiseavbrudd har dokumenterte nivåforskjeller", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.avbestilling.sum").value, /50 000.*100 000/);
  assert.match(fact(plus, "reise.avbestilling.sum").value, /Ingen generell/);
  assert.match(fact(base, "reise.reiseavbrudd.sum").value, /1 600.*3 200/);
  assert.match(fact(plus, "reise.reiseavbrudd.sum").value, /Ingen generell/);
});

test("sykdom graviditet hjemtransport hjemkalling og tilkalling er separate", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.medisinsk.behandling").value, /60 dager/);
  assert.match(fact(items, "reise.medisinsk.graviditet").value, /før uke 36.*fra og med uke 36/);
  assert.match(fact(items, "reise.hjemtransport").value, /kiste\/urne.*godkjenne/);
  assert.match(fact(items, "reise.hjemkallelse").value, /familie.*bolig.*forretning/);
  assert.match(fact(items, "reise.sykeledsagelse").value, /inntil to.*SOS International/);
});

test("ulykkeskapital er integrert og Pluss øker summer", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(base, "reise.ulykke.invaliditet").value, /400 000.*300 000.*500 000/);
  assert.match(fact(plus, "reise.ulykke.invaliditet").value, /700 000/);
  assert.match(fact(plus, "reise.ulykke.dodsfall").value, /300 000.*500 000.*150 000/);
  assert.match(fact(plus, "reise.ulykke.behandling").value, /5 %.*1 000.*500/);
});

test("Pluss har dokumentert leiebil og utvidede aktiviteter", () => {
  const base = resolveCatalogFacts(product("Reise"), []), plus = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.equal(base.some((entry) => entry.key === "reise.leiebil.egenandel"), false);
  assert.match(fact(plus, "reise.leiebil.egenandel").value, /Ubegrenset.*kaskoforsikret.*bilpool.*unntatt/);
  assert.match(fact(plus, "reise.aktivitet.utvidet").value, /fjellklatring.*off-piste.*kiting.*downhill/i);
});

test("ansvar rettshjelp evakuering og sikkerhet er kildeisolert", () => {
  const items = resolveCatalogFacts(product("Reise Pluss"), []);
  assert.match(fact(items, "reise.ansvar.sum").value, /15 000 000/);
  assert.match(fact(items, "reise.rettshjelp.sum").value, /100 000.*250 000/);
  assert.match(fact(items, "reise.evakuering").value, /krig.*terror.*pandemi.*nærmeste sikre/);
  assert.match(fact(items, "reise.sikkerhet.reisegods").value, /tilsyn.*låst.*innsjekket.*sykkel/);
  assert.equal(items.every((entry) => entry.source.company === "Fremtind"), true);
});

test("SOS International er tjeneste og ingen udokumentert digital lege finnes", () => {
  const items = resolveCatalogFacts(product("Reise"), []);
  assert.match(fact(items, "reise.tjeneste.alarm").value, /Døgnåpen.*Tjeneste/);
  assert.equal(items.some((entry) => entry.key === "reise.tjeneste.legehjelp"), false);
});

test("Eika Pluss-pakken og andre forsikringstyper lekker ikke inn", () => {
  for (const name of ["Reise", "Reise Pluss"]) {
    const items = resolveCatalogFacts(product(name), []);
    assert.equal(items.some((entry) => /Innbo Pluss|Eika Pluss/u.test(entry.value)), false);
    assert.equal(items.every((entry) => entry.key.startsWith("reise.")), true);
  }
  assert.equal(productCatalog.products.some((p) => p.insuranceType === "Reise" && p.name === "Eika Pluss"), false);
});

test("cross-company holder varighet og provenance adskilt", () => {
  const top = resolveCatalogFacts(product("Reise Pluss"), []);
  for (const [company, name] of [["Tryg", "Reise Premium"], ["If", "Super"], ["Storebrand", "Super"], ["Gjensidige", "Reise Pluss"]]) {
    const other = productCatalog.products.find((p) => p.company === company && p.insuranceType === "Reise" && p.name === name);
    assert.ok(other);
    assert.equal(resolveCatalogFacts(other, []).some((entry) => entry.source.company === "Fremtind"), false);
    assert.equal(top.some((entry) => entry.source.company === company), false);
  }
});

test("runtime støtter begge Fremtind-nivåer og fire forsikringstyper", () => {
  for (const name of ["Reise", "Reise Pluss"]) {
    const normalized = normalizeManualAgreement({ company: "Fremtind", distributionChannel: "Eika", totalAnnualPremium: "", products: [{ type: "Reise", productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] });
    assert.equal(normalized.insuranceData.distributionChannel, "Eika");
    assert.equal(normalized.insuranceData.insurances[0].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  }
  const normalized = normalizeManualAgreement({ company: "Fremtind", distributionChannel: "Eika", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Innbo Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Topp", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Reise Pluss", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  assert.equal(normalized.insuranceData.insurances[3].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  assert.equal(normalized.insuranceData.insurances.slice(0, 3).some((insurance) => insurance.importantTerms.some((entry) => entry.key.startsWith("reise."))), false);
});
