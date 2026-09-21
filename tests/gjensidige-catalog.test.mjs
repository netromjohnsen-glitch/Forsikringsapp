import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/gjensidige");
const level = (name) => productCatalog.products.find((p) =>
  p.company === "Gjensidige" && p.insuranceType === "Bil" && p.name === name);
const fact = (facts, key) => facts.find((f) => f.key === key);
const manual = (company, name, addOnIds = [], deductible = "") => normalizeManualAgreement({
  company, totalAnnualPremium: "", products: [{ type: "Bil", productName: name,
    annualPremium: "", deductible, coverageSummary: "", importantTerms: [], addOnIds }],
});
const compare = (left, right) => {
  const groups = groupInsurances(left.insuranceData.insurances, right.insuranceData.insurances, null);
  return { terms: groupTerms(groups[0], null), differences: createDifferences(left, right, groups, null) };
};

async function pdf(source) {
  const parser = new PDFParse({ data: await readFile(path.join(root, source.filename)) });
  try { return await parser.getText(); } finally { await parser.destroy(); }
}

test("offisielle PDF-øyeblikksbilder er bevart og produktarket dokumenterer arv", async () => {
  for (const source of ["gjIpid", "gjAnsvar", "gjDelkasko", "gjKasko", "gjPluss"]
    .map((id) => productCatalog.sources[id])) {
    const bytes = await readFile(path.join(root, source.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.match(source.url, /^https:\/\/www\.gjensidige\.no\//);
  }
  const ipid = await pdf(productCatalog.sources.gjIpid);
  assert.equal(ipid.total, 2);
  for (const text of ["MOT01", "Alt nevnt i Ansvar", "Alt nevnt i Delkasko", "Alt nevnt i Kasko", "Punkteringsskade uten bonustap"])
    assert.ok(ipid.text.includes(text), text);
  for (const [id, pages] of [["gjAnsvar", 14], ["gjDelkasko", 16], ["gjKasko", 16], ["gjPluss", 16]]) {
    const source = productCatalog.sources[id];
    assert.equal((await pdf(source)).total, pages);
    assert.equal(source.effectiveFrom, "");
    assert.equal(source.termsNumber, "Ikke oppgitt");
    for (const f of productCatalog.facts[id]) {
      assert.equal(f.source.company, "Gjensidige");
      assert.equal(f.source.filename, source.filename);
      assert.ok(f.source.section && f.source.page >= 1 && f.source.page <= pages);
      assert.match(f.source.note, /forsikringsbevis/);
    }
  }
});

test("PDF-ankere underbygger sentrale summer, grenser og skadevilkår", async () => {
  const compact = (text) => text.replace(/\s+/gu, "").toLocaleLowerCase("nb-NO");
  const docs = Object.fromEntries(await Promise.all(["gjAnsvar", "gjDelkasko", "gjKasko", "gjPluss"]
    .map(async (id) => [id, compact((await pdf(productCatalog.sources[id])).text)])));
  for (const [id, anchors] of Object.entries({
    gjAnsvar: ["100mill", "rettshjelp100000", "ulykke"],
    gjDelkasko: ["fastmontertekstrautstyr10000", "veihjelp750", "glasstak"],
    gjKasko: ["fastmontertekstrautstyr50000", "bilnøkkel7500", "inntil30dager", "inntil20000km"],
    gjPluss: ["bilnøkkel15000", "inntil60dager", "200000", "120000-159999", "2500kronerperdekk"],
  })) for (const anchor of anchors) assert.ok(docs[id].includes(compact(anchor)), `${id}: ${anchor}`);
});

test("fire Gjensidige-nivåer har dokumentert arv og effektive verdier med samme sides grunnverdi", () => {
  assert.deepEqual(productSuggestions(productCatalog, "Gjensidige", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Pluss"]);
  assert.deepEqual(resolveProductComponentIds(level("Pluss")), ["gjAnsvar", "gjDelkasko", "gjKasko", "gjPluss"]);
  assert.equal(fact(resolveCatalogFacts(level("Ansvar"), []), "brann.dekning"), undefined);
  assert.equal(fact(resolveCatalogFacts(level("Delkasko"), []), "nyverdi.alder"), undefined);
  const pluss = resolveCatalogFacts(level("Pluss"), []);
  assert.equal(fact(pluss, "leiebil.dager").value, "Inntil 60 dager ved normal reparasjonstid");
  assert.equal(fact(pluss, "bilnokkel.grense").value, "15 000 kr");
  assert.equal(fact(pluss, "maskinskade.alder").value, "Til første hovedforfall etter 12 år fra førstegangsregistrering");
  assert.equal(fact(pluss, "maskinskade.km").value, "Til 200 000 km; det som inntreffer først");
  assert.equal(fact(pluss, "nyverdi.km").value, "Inntil 20 000 km");
  assert.equal(fact(resolveCatalogEvidence(level("Pluss"), []), "leiebil.dager").source.documentId, "gjKasko");
  const agreement = manual("Gjensidige", "Pluss");
  const term = agreement.insuranceData.insurances[0].importantTerms.find((t) => t.key === "leiebil.dager");
  assert.equal(term.overriddenBase[0].value, "Inntil 30 dager ved normal reparasjonstid");
  assert.equal(term.overriddenBase[0].source.documentId, "gjKasko");
  assert.equal(term.source.documentId, "gjPluss");
});

test("tillegg velges uavhengig, og kilder og ukjente beløp beholdes", () => {
  const ids = availableAddOns(level("Pluss")).map((a) => a.id);
  assert.deepEqual(ids, ["gj-punktering", "gj-utvidet-utstyr", "gj-spesiallakk", "gj-funksjonsutstyr"]);
  const base = resolveCatalogFacts(level("Pluss"), []);
  assert.equal(fact(base, "punktering.grense"), undefined);
  const all = resolveCatalogFacts(level("Pluss"), ids);
  assert.equal(fact(all, "punktering.grense").value, "2 500 kr per dekk");
  assert.equal(fact(all, "punktering.grense").source.documentId, "gjPunktering");
  assert.match(fact(all, "tilbehor.utvidelse").value, /bekreftes i forsikringsbevis/);
  assert.equal(fact(all, "spesiallakk.dekning").source.termsNumber, "MOT01");
  assert.equal(fact(all, "funksjonsutstyr.dekning").source.page, 1);
  assert.throws(() => resolveCatalogFacts(level("Ansvar"), ["gj-punktering"]));
  assert.throws(() => resolveCatalogFacts(level("Pluss"), ["if-leiebil"]));
  assert.equal(availableAddOns(level("Pluss")).some((a) => a.providerId === "if" || a.providerId === "tryg"), false);
});

test("Gjensidige mot Tryg bevarer sammenlignbare nøkkelverdier, kilder og dokumentasjonshull", () => {
  const left = manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade"]);
  const right = manual("Gjensidige", "Pluss");
  const { terms, differences } = compare(left, right);
  const age = fact(terms, "nyverdi.alder");
  assert.ok(age.first && age.second);
  assert.equal(age.secondSources[0].company, "Gjensidige");
  assert.equal(age.firstSources[0].company, "Tryg");
  assert.equal(fact(terms, "leiebil.dager").second, "Inntil 60 dager ved normal reparasjonstid");
  const machine = fact(terms, "maskinskade.alder");
  assert.ok(machine.first && machine.second);
  assert.equal(machine.secondSources[0].documentId, "gjPluss");
  assert.equal(fact(terms, "nyverdi.alder").secondBaseFacts.length, 0);
  assert.ok(differences.some((d) => d.termKey === "nyverdi.alder"));
  const unknown = fact(terms, "rettshjelp.dekning");
  assert.equal(unknown.first, "Omfattet; detaljer i ikke vedlagt vilkår PGE91500");
  assert.equal(unknown.firstSources[0].termsNumber, "PAU25003");
  assert.equal(unknown.firstSources[0].section, "1.2");
});

test("Gjensidige mot If sammenligner nivåer, uten å oppfinne Ifs aldersgrense", () => {
  const left = manual("If", "Super", ["if-leiebil", "if-motor-gir"]);
  const right = manual("Gjensidige", "Pluss");
  const { terms, differences } = compare(left, right);
  assert.equal(fact(terms, "maskinskade.alder").first, null);
  assert.equal(fact(terms, "maskinskade.alder").firstMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.ok(fact(terms, "maskinskade.km").first && fact(terms, "maskinskade.km").second);
  assert.equal(fact(terms, "leiebil.dager").firstSources[0].company, "If");
  assert.equal(fact(terms, "leiebil.dager").secondSources[0].company, "Gjensidige");
  assert.ok(differences.some((d) => d.termKey === "leiebil.dager"));
  assert.equal(fact(terms, "haerverk.dekning").second, null);
  assert.equal(fact(terms, "haerverk.dekning").secondMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.equal(fact(terms, "geografi.rettshjelp").first, "Norden");
  assert.equal(fact(terms, "geografi.rettshjelp").second, "Norden");
  assert.equal(differences.some((d) => d.termKey === "geografi.rettshjelp"), false);
  const deductible = fact(terms, "brann.egenandel");
  assert.deepEqual(deductible.firstDeductibleClassifications, ["standard"]);
  assert.deepEqual(deductible.secondDeductibleClassifications, ["standard"]);
  assert.equal(differences.some((d) => d.termKey === "brann.egenandel"), false);
});

test("kundens egenandel og pris forblir uavhengige av offentlige standardverdier", () => {
  const left = manual("Gjensidige", "Kasko", [], "6 000 kr");
  const right = manual("If", "Kasko", [], "4 000 kr");
  assert.equal(left.insuranceData.totalAnnualPremium, null);
  assert.equal(left.insuranceData.insurances[0].deductible, "6 000 kr");
  const { terms, differences } = compare(left, right);
  assert.equal(right.insuranceData.insurances[0].deductible, "4 000 kr");
  assert.ok(differences.some((d) => d.kind === "deductible"));
  const standard = fact(terms, "brann.egenandel");
  assert.ok(standard.first && standard.second);
  assert.equal(standard.firstSources[0].documentId, "gjDelkasko");
  assert.equal(differences.some((d) => d.termKey === "brann.egenandel"), false);
});
