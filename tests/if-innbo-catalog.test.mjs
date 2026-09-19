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
import { productCatalog, productSuggestions, resolveCatalogEvidence, resolveCatalogFacts,
  resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/if/innbo");
const product = (company, name) => productCatalog.products.find((entry) =>
  entry.company === company && entry.insuranceType === "Innbo" && entry.name === name);
const fact = (items, key) => items.find((entry) => entry.key === key);
const manual = (company, name, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Innbo", productName: name,
    annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  const terms = groupTerms(groups[0], null);
  const raw = createDifferences(left, right, groups, null);
  return { groups, terms, raw, shown: presentImportantDifferences(raw, groups, null,
    left.insuranceData.company, right.insuranceData.company) };
};

test("offisielle If Innbo-kilder er lokale, uendrede og versjonerte", async () => {
  const expected = {
    "If_Innboforsikring_IBO2-1.pdf": "0d5aaf3702020ca458bb9af64c0a089b488a41f11198e07368699ff2d57ec270",
    "If_Ansvar_Rettshjelp_SV006.pdf": "7edf14be25afedc260ad602f87ddc7ba6c58c038bcbeaacc0bbf6301a0f15ceb",
    "If_IPID_Innboforsikring.pdf": "03af9f3bbd86afddb11e78fb1706f140492af668efcf374089edd2ef03492100",
    "If_Generelle_vilkar_GEN2-9.pdf": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046",
  };
  for (const [filename, sha256] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(root, filename))).digest("hex"), sha256);
  }
  const parser = new PDFParse({ data: await readFile(path.join(root, "If_Innboforsikring_IBO2-1.pdf")) });
  try {
    const pdf = await parser.getText();
    assert.equal(pdf.total, 18);
    assert.match(pdf.text, /Forsikringsvilkår IBO2-1/);
    assert.match(pdf.text, /Gjelder fra juni 2022/);
    assert.match(pdf.text, /Basis-, Utvidet- og Superforsikring/);
  } finally { await parser.destroy(); }
});

test("If tilbyr Basis, Utvidet og Super med dokumentert arv", () => {
  assert.deepEqual(productSuggestions(productCatalog, "If", "Innbo"), ["Basis", "Utvidet", "Super"]);
  assert.deepEqual(resolveProductComponentIds(product("If", "Basis")), ["ifInnboShared", "ifInnboBasis"]);
  assert.deepEqual(resolveProductComponentIds(product("If", "Utvidet")),
    ["ifInnboShared", "ifInnboBasis", "ifInnboUtvidet"]);
  assert.deepEqual(resolveProductComponentIds(product("If", "Super")),
    ["ifInnboShared", "ifInnboBasis", "ifInnboUtvidet", "ifInnboSuper"]);
  assert.deepEqual(productSuggestions(productCatalog, "If", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Super"]);
});

test("forsikringssum og sentrale Basis-grenser følger vilkåret uten å anta ubegrenset sum", () => {
  const basis = resolveCatalogFacts(product("If", "Basis"), []);
  assert.match(fact(basis, "innbo.forsikringssum").value, /bare når dette er avtalt/);
  assert.equal(fact(basis, "innbo.forsikringssum").deductibleClassification, "reference");
  assert.match(fact(basis, "innbo.verdigjenstander.grense").value, /500 000 kr/);
  assert.equal(fact(basis, "tyveri.fellesbod.grense").value, "100 000 kr per hendelse");
  assert.equal(fact(basis, "innbo.datalager.grense").value, "40 000 kr samlet");
  assert.equal(fact(basis, "ansvar.grense").value,
    "5 000 000 kr per skadetilfelle; saksomkostninger dekkes i tillegg");
  assert.equal(fact(basis, "rettshjelp.grense").source.termsNumber, "S-006 / SV006");
});

test("Utvidet inkluderer uhell, tyveri ute, flytting, skadedyr, boligtilpasning og utleie", () => {
  const extended = resolveCatalogFacts(product("If", "Utvidet"), []);
  assert.match(fact(extended, "innbo.geografi").value, /inntil 2 år/);
  assert.match(fact(extended, "uhell.dekning").value, /40 000 kr/);
  assert.equal(fact(extended, "tyveri.utenforhjem.grense").value,
    "40 000 kr per hendelse på dokumenterte steder i Norden");
  assert.match(fact(extended, "flytting.transport.grense").value, /inn- og utbæring/);
  assert.equal(fact(extended, "sykkel.tyveri.grense").value,
    "40 000 kr per sykkel eller barnevogn utenfor forsikringsstedet");
  assert.equal(fact(extended, "skadedyr.grense").value, "150 000 kr per skadetilfelle");
  assert.match(fact(extended, "ulykke.boligtilpasning.grense").value, /250 000 kr/);
  assert.equal(fact(extended, "utleie.husleietap.grense").value,
    "Inntil 6 måneders husleie, én gang per leietaker");
  assert.equal(fact(extended, "utleie.utkastelse.grense").value, "20 000 kr");
  assert.match(fact(extended, "utleie.sikkerhetskrav").value, /minst 2 måneders leie/);
});

test("Super forbedrer effektive verdier og bevarer grunnverdier med egne kilder", () => {
  const effective = resolveCatalogFacts(product("If", "Super"), []);
  assert.match(fact(effective, "innbo.opphold.grense").value, /uten sumbegrensning/);
  assert.equal(fact(effective, "uhell.egenandel").value,
    "2 000 kr per skadet gjenstand, maksimalt 4 000 kr per skadetilfelle");
  assert.equal(fact(effective, "bunad.grense").value, "500 000 kr");
  assert.equal(fact(effective, "bunad.geografi").value, "Hele verden");
  assert.equal(fact(effective, "innbo.hvitevarer.integrert.grense").value, "40 000 kr per hendelse");
  assert.equal(fact(effective, "innbo.fryserinnhold.grense").value,
    "40 000 kr ved dokumentert utilsiktet temperaturstigning");
  const detail = manual("If", "Super").insuranceData.insurances[0].importantTerms;
  assert.match(fact(detail, "uhell.egenandel").overriddenBase[0].value, /4 000 kr/);
  assert.equal(fact(detail, "uhell.egenandel").source.documentId, "ifInnboSuper");
  assert.equal(fact(detail, "uhell.egenandel").overriddenBase[0].source.documentId, "ifInnboUtvidet");
});

test("egenandeler har konservativ klassifisering og standardverdien beholdes", () => {
  const evidence = resolveCatalogEvidence(product("If", "Super"), []);
  assert.equal(fact(evidence, "innbo.egenandel").deductibleClassification, "standard");
  assert.equal(fact(evidence, "naturskade.egenandel").deductibleClassification, "override");
  assert.equal(fact(evidence, "skadedyr.egenandel").deductibleClassification, "override");
  assert.equal(fact(evidence, "bunad.egenandel").value, "500 kr");
  assert.equal(fact(evidence, "rettshjelp.egenandel").value,
    "4 000 kr pluss 20 % av det overskytende");
});

test("Tryg Innbo mot If Basis viser dokumenterte grenser og ikke antatt manglende dekning", () => {
  const result = compare(manual("Tryg", "Innbo"), manual("If", "Basis"));
  assert.equal(fact(result.terms, "tyveri.fellesbod.grense").first, "50 000 kr");
  assert.equal(fact(result.terms, "tyveri.fellesbod.grense").second, "100 000 kr per hendelse");
  assert.match(fact(result.terms, "innbo.forsikringssum").first, /forsikringsbeviset/);
  assert.match(fact(result.terms, "innbo.forsikringssum").second, /forsikringsbeviset/);
  assert.equal(fact(result.terms, "ansvar.grense").first, null);
  assert.equal(fact(result.terms, "ansvar.grense").second,
    "5 000 000 kr per skadetilfelle; saksomkostninger dekkes i tillegg");
});

test("Tryg Innbo Ekstra mot If Utvidet sammenligner like begreper med samme nøkkel", () => {
  const result = compare(manual("Tryg", "Innbo Ekstra"), manual("If", "Utvidet"));
  for (const key of ["uhell.dekning", "tyveri.utenforhjem.grense", "sykkel.tyveri.grense",
    "flytting.transport.grense", "skadedyr.grense", "rettshjelp.grense"]) {
    const row = fact(result.terms, key);
    assert.ok(row, key);
    assert.ok(row.first, key);
    assert.ok(row.second, key);
  }
  assert.equal(fact(result.terms, "skadedyr.grense").first, "150 000 kr per skadetilfelle");
  assert.equal(fact(result.terms, "skadedyr.grense").second, "150 000 kr per skadetilfelle");
  assert.equal(result.raw.some((entry) => entry.termKey === "skadedyr.grense"), false);
});

test("Tryg Innbo Ekstra mot If Super beholder reelle Super-forskjeller", () => {
  const result = compare(manual("Tryg", "Innbo Ekstra"), manual("If", "Super"));
  for (const key of ["bunad.grense", "innbo.hvitevarer.integrert.grense", "innbo.fryserinnhold.grense"]) {
    assert.equal(fact(result.terms, key).first, null);
    assert.ok(fact(result.terms, key).second);
  }
  assert.ok(result.raw.some((entry) => entry.termKey === "uhell.egenandel"));
  assert.ok(fact(result.terms, "uhell.egenandel").first);
  assert.ok(fact(result.terms, "uhell.egenandel").second);
});

test("Tryg utleietillegg sammenlignes mot Ifs innebygde utleiedekning", () => {
  const result = compare(manual("Tryg", "Innbo Ekstra", ["tryg-innbo-utleie"]), manual("If", "Super"));
  assert.equal(fact(result.terms, "utleie.husleietap.grense").first,
    "Inntil 6 måneders husleie, én gang per leietaker");
  assert.equal(fact(result.terms, "utleie.husleietap.grense").second,
    "Inntil 6 måneders husleie, én gang per leietaker");
  assert.equal(result.raw.some((entry) => entry.termKey === "utleie.husleietap.grense"), false);
  assert.ok(fact(result.terms, "utleie.utkastelse.grense").first);
  assert.ok(fact(result.terms, "utleie.utkastelse.grense").second);
  assert.equal(fact(result.terms, "utleie.egenandel").first, "6 000 kr per skadetilfelle");
  assert.match(fact(result.terms, "utleie.egenandel").second, /3 måneders husleie/);
});

test("UI-formet runtime-data beholder If-produktet gjennom hele sammenligningskjeden", () => {
  const form = new FormData();
  form.set("existingManual", JSON.stringify({ company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Innbo", productName: "Innbo Ekstra", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "tryg", productId: "tryg-innbo-ekstra", version: "2026-07-01" },
    addOnIds: ["tryg-innbo-utleie"],
  }] }));
  form.set("offerManual", JSON.stringify({ company: "If", totalAnnualPremium: "", products: [{
    type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], catalogReference: { providerId: "if", productId: "if-innbo-super", version: "IBO2-1" }, addOnIds: [],
  }] }));
  const left = normalizeManualAgreement(JSON.parse(form.get("existingManual")));
  const right = normalizeManualAgreement(JSON.parse(form.get("offerManual")));
  const result = compare(left, right);
  assert.equal(right.insuranceData.insurances[0].catalogReference.productId, "if-innbo-super");
  assert.equal(fact(result.terms, "bunad.grense").second, "500 000 kr");
  assert.equal(fact(result.terms, "utleie.husleietap.grense").second,
    "Inntil 6 måneders husleie, én gang per leietaker");
  assert.ok(result.shown.length > 0);
});

test("Bil og Innbo på begge sider holder produkt-, tillegg- og kildedata adskilt", () => {
  const left = normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Kasko", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["bil-ekstra"] },
    { type: "Innbo", productName: "Innbo Ekstra", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["tryg-innbo-utleie"] },
  ] });
  const right = normalizeManualAgreement({ company: "If", totalAnnualPremium: "", products: [
    { type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: ["if-leiebil"] },
    { type: "Innbo", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [], addOnIds: [] },
  ] });
  const [ifCar, ifContents] = right.insuranceData.insurances;
  assert.equal(ifCar.catalogReference.productId, "if-bil-super");
  assert.deepEqual(ifCar.addOnIds, ["if-leiebil"]);
  assert.equal(ifContents.catalogReference.productId, "if-innbo-super");
  assert.deepEqual(ifContents.addOnIds, []);
  assert.ok(ifCar.importantTerms.some((entry) => entry.key === "leiebil.dager"));
  assert.equal(ifCar.importantTerms.some((entry) => entry.key === "bunad.grense"), false);
  assert.ok(ifContents.importantTerms.some((entry) => entry.key === "bunad.grense"));
  assert.equal(ifContents.importantTerms.some((entry) => entry.key === "leiebil.dager"), false);
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map((group) => group.key).sort(), ["bil", "innbo"]);
});
