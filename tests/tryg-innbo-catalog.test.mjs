import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/tryg/innbo");
const product = (name) => productCatalog.products.find((entry) =>
  entry.company === "Tryg" && entry.insuranceType === "Innbo" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, addOnIds = []) => normalizeManualAgreement({
  company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Innbo", productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds,
  }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { groups, terms, raw, shown: presentImportantDifferences(raw, groups, null, "Tryg", "Tryg") };
};

test("offisielle Tryg Innbo-kilder er lokale, uendrede og versjonerte", async () => {
  const expected = {
    "Innbo_og_losore_PPK13301.pdf": "dc1232e8506616af03a937c97a381ccc962eccca61bbd9544bf55b86b8effb39",
    "Innbo_og_losore_Ekstra_PPK13302.pdf": "4cffa3b051f329da0fe178b20243a0920d2b5928e9995d485c35b58a48f1f810",
    "Utleie_PPK13306.pdf": "fd832414658149b9816267cd50b01d04a02723022f2d16d05cad763296f11c79",
    "Produktvilkar_PPK13300.pdf": "37407dcab9274909eebe7d220d302132e9b0a6c7042dc246ad6ccf92d5f184d0",
    "Sikkerhetsforskrifter_PF133.pdf": "7da2036f15e872921970058117ebbc84dc38d6025bcbf2543f19777e93023e5d",
    "Generelle_vilkar_PGE91000.pdf": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320",
    "Privatansvar_PGE90020.pdf": "c75dcb29b61d990dd95869e884fb64f59dd839717f9cb88fa9d85f0618d000df",
    "Rettshjelp_PGE91500.pdf": "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
    "Naturskade_PGE90010.pdf": "11439a7669131319396db7c2caa6f28ac140389e3e11408bb75badea0fdccef6",
    "IPID_Innbo.pdf": "b354221fc37cf96e5b9725e19d29dd77073b15543099135642603463df403a54",
  };
  for (const [filename, sha256] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), sha256, filename);
  }
  const parser = new PDFParse({ data: await readFile(path.join(root, "Innbo_og_losore_Ekstra_PPK13302.pdf")) });
  try {
    const pdf = await parser.getText();
    assert.equal(pdf.total, 7);
    assert.match(pdf.text, /Vilkår PPK13302 gjelder fra 01\.07\.2026/);
    assert.match(pdf.text, /Samlet erstatning per skadetilfelle er inntil 150\.000 kroner/);
  } finally { await parser.destroy(); }
});

test("Tryg tilbyr Innbo og Innbo Ekstra med dokumentert arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Innbo"), ["Innbo", "Innbo Ekstra"]);
  assert.deepEqual(resolveProductComponentIds(product("Innbo")), ["trygInnboShared", "trygInnbo"]);
  assert.deepEqual(resolveProductComponentIds(product("Innbo Ekstra")),
    ["trygInnboShared", "trygInnbo", "trygInnboExtra"]);
  assert.deepEqual(productSuggestions(productCatalog, "Tryg", "Bil"), ["Ansvar", "Delkasko", "Kasko"]);
});

test("forsikringssum er kundestyrt og Innbo Ekstra beholder effektive og underliggende grenser", () => {
  const base = resolveCatalogFacts(product("Innbo"), []);
  assert.match(fact(base, "innbo.forsikringssum").value, /forsikringsbeviset/);
  assert.equal(fact(base, "innbo.forsikringssum").deductibleClassification, "reference");
  assert.equal(fact(base, "innbo.yrkeslosore.grense").value, "50 000 kr samlet");
  const effective = resolveCatalogFacts(product("Innbo Ekstra"), []);
  assert.equal(fact(effective, "innbo.yrkeslosore.grense").value, "100 000 kr samlet");
  assert.equal(fact(effective, "innbo.datalager.grense").value, "50 000 kr samlet");
  assert.equal(fact(effective, "innbo.vaesketap.grense").value,
    "40 000 kr samlet ved plutselig utstrømming fra rørledning");
  const detail = manual("Innbo Ekstra").insuranceData.insurances[0].importantTerms;
  assert.equal(fact(detail, "innbo.yrkeslosore.grense").overriddenBase[0].value, "50 000 kr samlet");
  assert.equal(fact(detail, "innbo.datalager.grense").overriddenBase[0].value, "10 000 kr samlet");
});

test("tyveri, sykkel, uhell, skadedyr, ansvar og rettshjelp er strukturert med kilder", () => {
  const base = resolveCatalogFacts(product("Innbo"), []);
  const extra = resolveCatalogFacts(product("Innbo Ekstra"), []);
  assert.equal(fact(base, "sykkel.tyveri.grense").value,
    "20 000 kr per gjenstand utenfor angitte oppbevaringssteder");
  assert.equal(fact(extra, "sykkel.tyveri.grense").value, "40 000 kr per gjenstand");
  assert.equal(fact(extra, "tyveri.fellesbod.grense").value, "350 000 kr");
  assert.ok(fact(extra, "uhell.dekning"));
  assert.equal(fact(extra, "uhell.egenandel").value, "2 000 kr per skadetilfelle");
  assert.equal(fact(extra, "skadedyr.grense").value, "150 000 kr per skadetilfelle");
  assert.equal(fact(extra, "skadedyr.egenandel").deductibleClassification, "override");
  assert.ok(fact(extra, "ansvar.dekning"));
  assert.equal(fact(extra, "rettshjelp.grense").value,
    "100 000 kr per tvist; 250 000 kr når minst tre parter står på samme side");
  assert.equal(fact(extra, "rettshjelp.egenandel").source.termsNumber, "PGE91500");
});

test("Utleieforsikring er et valgfritt tillegg på begge nivåer med egne grenser", () => {
  for (const name of ["Innbo", "Innbo Ekstra"]) {
    assert.deepEqual(availableAddOns(product(name)).map((entry) => entry.id), ["tryg-innbo-utleie"]);
  }
  const selected = resolveCatalogFacts(product("Innbo Ekstra"), ["tryg-innbo-utleie"]);
  assert.equal(fact(selected, "utleie.skadeverk.grense").value, "500 000 kr per skadetilfelle");
  assert.equal(fact(selected, "utleie.tyveri.grense").value, "500 000 kr");
  assert.equal(fact(selected, "utleie.husleietap.grense").value, "Inntil 6 måneders husleie, én gang per leietaker");
  assert.equal(fact(selected, "utleie.utkastelse.grense").value, "20 000 kr per skadetilfelle");
  assert.equal(fact(selected, "utleie.husleietap.egenandel").value, "3 måneders husleie, minimum 10 000 kr");
});

test("fremtidig privatansvarsvilkår aktiveres ikke og NITO-data lekker ikke", () => {
  const asOf = new Date("2026-09-19T12:00:00Z");
  const facts = resolveCatalogEvidence(product("Innbo Ekstra"), [], asOf);
  assert.equal(facts.some((entry) => entry.source.documentId === "trygInnboLiabilityFuture"), false);
  assert.equal(facts.some((entry) => /NITO/iu.test(`${entry.label} ${entry.value}`)), false);
  assert.equal(productCatalog.products.some((entry) =>
    entry.company === "Tryg" && entry.insuranceType === "Innbo" && /NITO/iu.test(entry.name)), false);
  assert.equal(productCatalog.sources.trygInnboLiabilityFuture.effectiveFrom, "2026-10-01");
});

test("sikkerhetsforskrifter beholdes som kildefakta uten å dominere hovedvisningen", () => {
  const result = compare(manual("Innbo"), manual("Innbo Ekstra"));
  const allTerms = result.terms.map((entry) => entry.key);
  assert.ok(allTerms.includes("sikkerhet.brann"));
  assert.ok(allTerms.includes("sikkerhet.transport"));
  const top = result.shown.filter((entry) => entry.kind === "term")
    .sort((a, b) => b.priority - a.priority).slice(0, 6);
  assert.equal(top.some((entry) => entry.termKey?.startsWith("sikkerhet.")), false);
});

test("runtime-kjeden viser dokumenterte forbedringer fra Innbo til Innbo Ekstra", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company:"Tryg", totalAnnualPremium:"", products:[{
    type:"Innbo", productName:"Innbo", annualPremium:"", deductible:"", coverageSummary:"",
    importantTerms:[], catalogReference:{ providerId:"tryg", productId:"tryg-innbo", version:"2026-07-01" }, addOnIds:[],
  }] }));
  form.set("offerManual", JSON.stringify({ company:"Tryg", totalAnnualPremium:"", products:[{
    type:"Innbo", productName:"Innbo Ekstra", annualPremium:"", deductible:"", coverageSummary:"",
    importantTerms:[], catalogReference:{ providerId:"tryg", productId:"tryg-innbo-ekstra", version:"2026-07-01" },
    addOnIds:["tryg-innbo-utleie"],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right);
  assert.deepEqual(right.insuranceData.insurances[0].addOnIds, ["tryg-innbo-utleie"]);
  assert.equal(fact(result.terms, "sykkel.tyveri.grense").first,
    "20 000 kr per gjenstand utenfor angitte oppbevaringssteder");
  assert.equal(fact(result.terms, "sykkel.tyveri.grense").second, "40 000 kr per gjenstand");
  assert.equal(fact(result.terms, "uhell.dekning").first, null);
  assert.ok(result.raw.some((entry) => entry.termKey === "uhell.dekning"));
  assert.ok(result.shown.some((entry) => entry.termKey === "sykkel.tyveri.grense"));
});

test("én avtale kan inneholde Bil og Innbo uten katalog- eller kildemiks", () => {
  const agreement = normalizeManualAgreement({ company:"Tryg", totalAnnualPremium:"", products:[
    { type:"Bil", productName:"Kasko", annualPremium:"", deductible:"", coverageSummary:"", importantTerms:[], addOnIds:["bil-ekstra"] },
    { type:"Innbo", productName:"Innbo Ekstra", annualPremium:"", deductible:"", coverageSummary:"", importantTerms:[], addOnIds:["tryg-innbo-utleie"] },
  ] });
  const [car, contents] = agreement.insuranceData.insurances;
  assert.equal(car.catalogReference.productId, "bil-kasko");
  assert.equal(contents.catalogReference.productId, "tryg-innbo-ekstra");
  assert.ok(car.importantTerms.some((entry) => entry.key === "nyverdi.km"));
  assert.equal(car.importantTerms.some((entry) => entry.key === "skadedyr.grense"), false);
  assert.ok(contents.importantTerms.some((entry) => entry.key === "skadedyr.grense"));
  assert.equal(contents.importantTerms.some((entry) => entry.key === "nyverdi.km"), false);
  assert.equal(contents.importantTerms.find((entry) => entry.key === "utleie.tyveri.grense").source.termsNumber, "PPK13306");
});
