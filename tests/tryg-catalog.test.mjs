import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances } from "../lib/comparison.ts";
import { availableAddOns, productCatalog, resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { runHybridMatching } from "../lib/hybrid-matching.ts";

PDFParse.setWorker(getPath());
const sourceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/tryg");
const level = (name) => productCatalog.products.find((product) => product.name === name);
const item = (items, key) => items.find((entry) => entry.key === key);
const manual = (name, addOnIds = []) => ({
  company: "Tryg", totalAnnualPremium: "",
  products: [{
    type: "Bil", productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [],
    catalogReference: {
      providerId: level(name).providerId,
      productId: level(name).productId,
      version: level(name).version,
    },
    addOnIds,
  }],
});

test("alle katalogkilder finnes og oppgir registrert vilkårsnummer og gyldighetsdato", async () => {
  const anchors = {
    ansvar: /inntil 100 millioner kroner/i,
    delkasko: /3\.000 kroner ved bytte av rute, ingen egenandel ved reparasjon/i,
    kasko: /ikke ha kjørt mer enn 15\.000 kilometer/i,
    bilEkstra: /ikke ha kjørt mer enn 60\.000 kilometer/i,
    elbilEkstra: /ikke ha kjørt mer enn 60\.000 kilometer/i,
    leiebil: /inntil 10 dager/i,
    maskinskade: /kilometerstand er 200\.000/i,
    ulykke: /inntil 200\.000 kroner/i,
    ulykkeEkstra: /engangserstatning på 5\.000 kroner/i,
  };
  for (const source of Object.values(productCatalog.sources).filter((entry) => entry.id in anchors)) {
    const bytes = await readFile(path.join(sourceDir, source.filename));
    const parser = new PDFParse({ data: bytes });
    const extracted = await parser.getText();
    await parser.destroy();
    const date = source.effectiveFrom.split("-").reverse().join(".");
    assert.match(extracted.text, new RegExp(`Vilkår ${source.termsNumber} gjelder fra ${date.replaceAll(".", "\\.")}`));
    assert.match(extracted.text, anchors[source.id]);
    for (const fact of productCatalog.facts[source.id]) {
      assert.equal(fact.source.termsNumber, source.termsNumber);
      assert.equal(fact.source.effectiveFrom, source.effectiveFrom);
      assert.equal(fact.source.filename, source.filename);
      assert.ok(fact.source.page >= 1 && fact.source.page <= extracted.total);
    }
  }
});

test("sentrale bilgrenser er strukturert etter kildedokumentene", () => {
  const ansvar = resolveCatalogFacts(level("Ansvar"), []);
  const delkasko = resolveCatalogFacts(level("Delkasko"), []);
  const kasko = resolveCatalogFacts(level("Kasko"), []);
  assert.equal(item(ansvar, "ansvar.ting.grense").value, "Inntil 100 000 000 kr");
  assert.equal(item(ansvar, "ansvar.dekning").source.section, "1.1");
  assert.equal(item(ansvar, "rettshjelp.dekning").source.section, "1.2");
  assert.equal(item(delkasko, "glass.egenandel.bytte").value, "3 000 kr");
  assert.equal(item(delkasko, "glass.egenandel.reparasjon").value, "0 kr");
  assert.equal(item(kasko, "nyverdi.km").value, "Høyst 15 000 km");
  assert.equal(item(kasko, "nyverdi.alder").source.termsNumber, "PAU25205");
  for (const key of ["haerverk.dekning", "feilfylling.dekning"]) {
    assert.equal(item(kasko, key).source.section, "2.1");
    assert.equal(item(kasko, key).source.page, 1);
  }
  const ekstra = resolveCatalogFacts(level("Kasko"), ["bil-ekstra"]);
  assert.equal(item(ekstra, "tilbehor.grense").value, "Samlet inntil 50 000 kr per skadetilfelle");
  assert.equal(item(ekstra, "leiebil.dager").value, "Inntil 60 dager");
  assert.equal(item(ekstra, "nyverdi.km").value, "Høyst 60 000 km");
  assert.equal(item(ekstra, "nyverdi.km").source.termsNumber, "PAU27002");
  assert.equal(item(resolveCatalogFacts(level("Kasko"), ["maskinskade"]), "maskinskade.egenandel.200").value, "18 000 kr");
  assert.equal(item(resolveCatalogFacts(level("Kasko"), ["forer-passasjerulykke-ekstra"]), "ulykke.sykehus").value,
    "5 000 kr per skadetilfelle ved minst 48 timer sammenhengende innleggelse");
});

test("Delkasko og Kasko komponerer dokumentert Ansvar og Rettshjelp uten duplikater", () => {
  assert.deepEqual(resolveProductComponentIds(level("Ansvar")), ["ansvar"]);
  assert.deepEqual(resolveProductComponentIds(level("Delkasko")), ["ansvar", "delkasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Kasko")), ["ansvar", "kasko"]);
  for (const name of ["Ansvar", "Delkasko", "Kasko"]) {
    const effective = resolveCatalogFacts(level(name), []);
    for (const key of ["ansvar.dekning", "ansvar.person.grense", "ansvar.ting.grense", "rettshjelp.dekning"]) {
      const matching = effective.filter((entry) => entry.key === key);
      assert.equal(matching.length, 1, `${name}:${key}`);
      assert.equal(matching[0].source.termsNumber, "PAU25003", `${name}:${key}`);
    }
  }

  const tryg = normalizeManualAgreement(manual("Kasko"));
  const other = normalizeManualAgreement({ company: "If", totalAnnualPremium: "", products: [{
    type: "Bil", productName: "Super", annualPremium: "", deductible: "", coverageSummary: "",
    importantTerms: [], addOnIds: [],
  }] });
  const groups = groupInsurances(tryg.insuranceData.insurances, other.insuranceData.insurances, null);
  const differences = createDifferences(tryg, other, groups, null);
  assert.equal(differences.some((entry) =>
    ["ansvar.dekning", "rettshjelp.dekning"].includes(entry.termKey) && /ikke funnet i vilkårene/i.test(entry.text)
  ), false);
});

test("fremtidig leiebilvilkår tas ikke inn før gyldighetsdato", () => {
  const asOf = new Date("2026-09-18T12:00:00Z");
  assert.equal(availableAddOns(level("Kasko"), asOf).some((addOn) => addOn.id === "leiebil"), false);
  assert.throws(() => resolveCatalogFacts(level("Kasko"), ["leiebil"], asOf));
  assert.equal(availableAddOns(level("Kasko"), new Date("2026-10-01T12:00:00Z")).some((addOn) => addOn.id === "leiebil"), true);
  assert.equal(resolveCatalogFacts(level("Kasko"), ["bil-ekstra", "elbil-ekstra"], asOf)
    .filter((fact) => fact.key === "leiebil.dager").length, 2);
  assert.equal(availableAddOns(level("Ansvar"), asOf).some((addOn) => addOn.id === "maskinskade"), false);
});

test("to manuelt valgte katalogprodukter sammenlignes uten PDF eller pris", async () => {
  const existing = normalizeManualAgreement(manual("Delkasko"));
  const offer = normalizeManualAgreement(manual("Kasko", ["bil-ekstra"]));
  assert.equal(existing.insuranceData.totalAnnualPremium, null);
  assert.equal(offer.insuranceData.insurances[0].annualPremium, null);
  assert.ok(offer.insuranceData.insurances[0].importantTerms.some((term) => term.key === "leiebil.dager"));
  assert.ok(offer.insuranceData.insurances[0].catalogFacts.every((fact) => fact.source.termsNumber && fact.source.effectiveFrom));
  const plan = await runHybridMatching(
    existing.insuranceData.insurances,
    offer.insuranceData.insurances,
    async () => ({ decisions: [] }),
  );
  assert.ok(plan);
});

test("0, 1 og flere tillegg lagres som lister med kilde og uten pris eller kundespesifikk egenandel", () => {
  const none = normalizeManualAgreement(manual("Kasko")).insuranceData.insurances[0];
  const one = normalizeManualAgreement(manual("Kasko", ["maskinskade"])).insuranceData.insurances[0];
  const many = normalizeManualAgreement(manual("Kasko", [
    "bil-ekstra", "maskinskade", "forer-passasjerulykke",
  ])).insuranceData.insurances[0];
  assert.deepEqual(none.addOnIds, []);
  assert.deepEqual(none.addOns, []);
  assert.deepEqual(one.addOnIds, ["maskinskade"]);
  assert.equal(one.addOns[0].source.termsNumber, "PAU27110");
  assert.deepEqual(many.addOnIds, ["bil-ekstra", "maskinskade", "forer-passasjerulykke"]);
  assert.equal(many.addOns.length, 3);
  assert.equal(many.annualPremium, null);
  assert.equal(many.deductible, null);
  for (const key of ["leiebil.dager", "maskinskade.km", "ulykke.invaliditet"]) {
    const term = many.importantTerms.find((entry) => entry.key === key);
    assert.ok(term, key);
    assert.ok(term.source.filename && term.source.termsNumber && term.source.effectiveFrom);
    assert.ok(term.source.page >= 1 && term.source.section);
  }
});

test("flere tillegg med samme datapunkt beholder begge verdier og begge kilder", () => {
  const facts = resolveCatalogFacts(level("Kasko"), ["bil-ekstra", "elbil-ekstra"]);
  assert.deepEqual(facts.filter((fact) => fact.key === "leiebil.dager")
    .map((fact) => fact.source.termsNumber), ["PAU27002", "PAU27013"]);
  const agreement = normalizeManualAgreement(manual("Kasko", ["bil-ekstra", "elbil-ekstra"]));
  const values = agreement.insuranceData.insurances[0].importantTerms
    .filter((term) => term.key === "leiebil.dager").map((term) => term.value);
  assert.deepEqual(values, ["PAU27002: Inntil 60 dager", "PAU27013: Inntil 60 dager"]);
});

test("ulike hovednivåer og tillegg kan sammenlignes uten pris eller egenandel", async () => {
  const left = normalizeManualAgreement(manual("Kasko", [
    "bil-ekstra", "maskinskade", "forer-passasjerulykke",
  ]));
  const right = normalizeManualAgreement(manual("Delkasko", ["forer-passasjerulykke-ekstra"]));
  const leftInsurance = left.insuranceData.insurances[0];
  const rightInsurance = right.insuranceData.insurances[0];
  assert.equal(leftInsurance.annualPremium, null);
  assert.equal(rightInsurance.deductible, null);
  assert.ok(leftInsurance.importantTerms.some((term) => term.key === "maskinskade.km"));
  assert.ok(rightInsurance.importantTerms.some((term) => term.key === "ulykke.sykehus"));
  const plan = await runHybridMatching([leftInsurance], [rightInsurance], async () => ({ decisions: [] }));
  assert.ok(plan);
});
