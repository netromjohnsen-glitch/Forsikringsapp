import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog, productSuggestions, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/frende/reise");
const product = productCatalog.products.find((p) => p.company === "Frende" && p.insuranceType === "Reise" && p.name === "Reiseforsikring");
const facts = () => resolveCatalogFacts(product, []);
const fact = (items, key) => { const item = items.find((entry) => entry.key === key); assert.ok(item, `Mangler ${key}`); return item; };
const manual = (company, name) => normalizeManualAgreement({ company, totalAnnualPremium: "", products: [{ type: "Reise", productName: name, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] });

test("åtte offisielle Frende Reise-kilder er lokale og hashverifiserte", async () => {
  assert.equal((await readdir(root)).length, 8);
  const sources = Object.values(productCatalog.sources).filter((source) => source.id.startsWith("frendeReise"));
  assert.equal(sources.length, 8);
  for (const source of sources) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, source.filename))).digest("hex"), source.sha256);
    assert.equal(source.company, "Frende");
  }
  assert.equal(productCatalog.sources.frendeReiseTerms.effectiveFrom, "2026-03-01");
  assert.equal(productCatalog.sources.frendeReiseIpid.updatedAt, "2026-06-01");
  assert.match(productCatalog.sources.frendeReiseReplacedTerms2020.version, /erstattet av 01\.03\.2026/);
  assert.equal(resolveProductComponentIds(product).includes("frendeReiseReplacedTerms2020"), false);
});

test("Frende har ett ordinært Reise-produkt uten kunstig arv", () => {
  assert.ok(product);
  assert.equal(product.providerId, "frende");
  assert.deepEqual(productSuggestions(productCatalog, "Frende", "Reise"), ["Reiseforsikring"]);
  assert.equal(product.inheritsProductId, undefined);
  assert.deepEqual(resolveProductComponentIds(product), ["frendeReiseIpid", "frendeReiseGeneral", "frendeReiseCoverage", "frendeReiseServices"]);
});

test("forsikringsbevis personkrets og reiseomfang er bevart", () => {
  const items = facts();
  assert.match(fact(items, "reise.avtale.forbehold").value, /Forsikringsbeviset.*familie.*fortsettelsesforsikring/);
  assert.match(fact(items, "reise.personer.omfang").value, /folketrygden.*barn.*21 år.*barnebarn\/oldebarn/);
  assert.match(fact(items, "reise.omrade.verden").value, /fritid.*ferie.*tjenestereise.*hele verden.*bostedsadressen/i);
});

test("75 dager og kundespesifikk fortsettelsesforsikring er separate", () => {
  const items = facts();
  assert.match(fact(items, "reise.varighet.maks").value, /^75 dager/);
  assert.match(fact(items, "reise.varighet.utvidelse").value, /før avreise.*én reise.*Norden, Europa eller hele verden.*ikke et eget hovedprodukt/i);
});

test("risikoområder bevarer Svalbard-unntaket og 6000 meter", () => {
  const items = facts();
  assert.match(fact(items, "reise.omrade.ud").value, /Arktis.*Svalbard.*Antarktis.*Grønland.*UD/);
  assert.match(fact(items, "reise.aktivitet.unntak").value, /6 000.*polar.*Grønland/);
});

test("ubegrenset reisegods betyr ikke ubegrenset enkeltgjenstand", () => {
  const items = facts();
  assert.match(fact(items, "reise.bagasje.total").value, /Ingen generell samlet øvre sum/);
  assert.match(fact(items, "reise.bagasje.per_gjenstand").value, /40 000/);
  assert.match(fact(items, "reise.bagasje.verdisaker").value, /40 000.*enkeltgjenstand/);
  assert.match(fact(items, "reise.bagasje.sportsutstyr").value, /40 000.*enkeltgjenstand/);
});

test("kategori-, uhells- og forsinket bagasjegrenser er dokumentert", () => {
  const items = facts();
  assert.match(fact(items, "reise.bagasje.kontanter").value, /10 000/);
  assert.match(fact(items, "reise.bagasje.pass_billetter").value, /20 000/);
  assert.match(fact(items, "reise.bagasje.nokler").value, /4 000/);
  assert.match(fact(items, "reise.bagasje.uhell").value, /plutselig.*ytre.*8 000.*forsikringsår/i);
  assert.match(fact(items, "reise.bagasje.forsinket").value, /utreise.*6 000.*PIR.*500/);
});

test("veggedyr og leiebil har egne vilkår og egenandeler", () => {
  const items = facts();
  assert.match(fact(items, "reise.skadedyr.dekning").value, /VIS.*50 000.*to tilfeller/);
  assert.match(fact(items, "reise.skadedyr.egenandel").value, /2 000.*500/);
  assert.match(fact(items, "reise.leiebil.egenandel").value, /Ingen generell.*personbil\/motorsykkel.*overnatting.*privatleie.*bildeling.*leasing/);
});

test("avbestilling transportforsinkelse og streik holdes separate", () => {
  const items = facts();
  assert.match(fact(items, "reise.avbestilling.dekning").value, /Ingen generell.*ikke-refunderbare.*bonuspoeng/);
  assert.match(fact(items, "reise.forsinkelse.rute").value, /1,5.*24 timer.*6 000/);
  assert.match(fact(items, "reise.forsinkelse.hotell_arrangement").value, /åtte timer.*6 000.*tjenestereise/);
  assert.match(fact(items, "reise.forsinkelse.unntak").value, /streik.*lockout.*personalmangel.*konkurs/);
});

test("sykdom kjent sykdom graviditet og tannbehandling er presise", () => {
  const items = facts();
  assert.match(fact(items, "reise.medisinsk.behandling").value, /Ingen generell.*5 000.*sykehus/);
  assert.match(fact(items, "reise.medisinsk.kjent").value, /Falck.*plutselig og uventet.*planlagt/);
  assert.match(fact(items, "reise.medisinsk.graviditet").value, /før uke 36.*etter 36/);
  assert.match(fact(items, "reise.medisinsk.tann").value, /5 000.*1 000/);
});

test("hjemtransport tilkalling hjemkalling og reiseavbrudd er separate", () => {
  const items = facts();
  assert.match(fact(items, "reise.hjemtransport").value, /forhåndsgodkjent.*40 000.*14 dager/);
  assert.match(fact(items, "reise.sykeledsagelse").value, /inntil to.*Norden/);
  assert.match(fact(items, "reise.hjemkallelse").value, /nærmeste familie.*bolig.*bedrift/);
  assert.match(fact(items, "reise.reiseavbrudd").value, /Ingen generell.*to forhåndsbetalte.*fortsettelsesforsikring/);
});

test("integrert reiseulykke har riktige summer og aldersregler", () => {
  const items = facts();
  assert.match(fact(items, "reise.ulykke.dekning").value, /reisen.*80 år/);
  assert.match(fact(items, "reise.ulykke.invaliditet").value, /500 000.*700 000.*75 år.*100 000.*80 år.*uten progressiv/);
  assert.match(fact(items, "reise.ulykke.dodsfall").value, /500 000.*150 000.*75 år.*100 000.*80 år/);
  assert.match(fact(items, "reise.ulykke.behandling").value, /tre år.*5 %.*Ingen egenandel/);
});

test("ansvar rettshjelp evakuering sport og sikkerhet er kildeisolert", () => {
  const items = facts();
  assert.match(fact(items, "reise.ansvar.sum").value, /15 000 000/);
  assert.match(fact(items, "reise.ansvar.egenandel").value, /Ingen/);
  assert.match(fact(items, "reise.rettshjelp.sum").value, /100 000/);
  assert.match(fact(items, "reise.rettshjelp.egenandel").value, /4 000.*20 %/);
  assert.match(fact(items, "reise.evakuering").value, /seks uker.*UD.*forhåndsgodkjent/);
  assert.match(fact(items, "reise.sikkerhet.reisegods").value, /tilsyn.*safe.*innsjekket.*sykkel/);
  assert.equal(items.every((entry) => entry.source.company === "Frende"), true);
});

test("Falck og Eyr er tjenester, ikke forsikringssummer", () => {
  const items = facts();
  assert.match(fact(items, "reise.tjeneste.alarm").value, /Døgnåpen.*Tjeneste|Døgnåpen.*informasjonstjeneste/i);
  assert.match(fact(items, "reise.tjeneste.legehjelp").value, /gyldig Frende reiseforsikring.*Tjeneste/);
});

test("Frende Ung og hendelsesspesifikke 2026-tiltak lekker ikke inn", () => {
  const items = facts();
  assert.equal(productCatalog.products.some((p) => p.company === "Frende" && p.insuranceType === "Reise" && p.name === "Frende Ung"), false);
  assert.equal(items.some((entry) => /Frende Ung|Midtøsten|alternativ hjemreise|10 000 kroner per person|psykologisk førstehjelp/u.test(entry.value)), false);
  assert.ok(productCatalog.sources.frendeReiseMiddleEast2026.appliesTo[0].includes("ikke canonical"));
});

test("cross-company mot fem topprodukter gir forskjeller uten provenanslekkasje", () => {
  const left = manual("Frende", "Reiseforsikring");
  for (const [company, name] of [["Tryg", "Reise Premium"], ["If", "Super"], ["Storebrand", "Super"], ["Gjensidige", "Reise Pluss"], ["Fremtind", "Reise Pluss"]]) {
    const right = manual(company, name);
    const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
    const differences = createDifferences(left, right, groups, null);
    assert.ok(presentImportantDifferences(differences, groups, null, "Frende", company).length > 0);
    assert.equal(left.insuranceData.insurances[0].importantTerms.some((entry) => entry.source?.company === company), false);
  }
});

test("FormData-runtime støtter ett Frende-produkt uten arv", () => {
  const form = new FormData();
  form.set("offerManual", JSON.stringify({ company: "Frende", totalAnnualPremium: "", products: [{ type: "Reise", productName: "Reiseforsikring", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] }] }));
  const normalized = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const terms = normalized.insuranceData.insurances[0].importantTerms;
  assert.ok(terms.length > 40);
  assert.equal(terms.every((entry) => entry.key.startsWith("reise.")), true);
  assert.equal(terms.every((entry) => entry.source.company === "Frende"), true);
});

test("Frende-avtale med Bil Innbo Hus og Reise har ingen typelekkasje", () => {
  const normalized = normalizeManualAgreement({ company: "Frende", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Utvidet", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Innbo", productName: "Standard", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Hus", productName: "Utvidet", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
    { type: "Reise", productName: "Reiseforsikring", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  assert.equal(normalized.insuranceData.insurances[3].importantTerms.every((entry) => entry.key.startsWith("reise.")), true);
  assert.equal(normalized.insuranceData.insurances.slice(0, 3).some((insurance) => insurance.importantTerms.some((entry) => entry.key.startsWith("reise."))), false);
});
