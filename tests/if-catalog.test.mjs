import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { IF_TERMS_URL } from "../lib/if-catalog.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { availableAddOns, productCatalog, productSuggestions, resolveCatalogEvidence,
  resolveCatalogFacts, resolveProductComponentIds } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());
const sourcePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf");
const level = (name) => productCatalog.products.find((product) =>
  product.company === "If" && product.insuranceType === "Bil" && product.name === name);
const fact = (facts, key) => facts.find((item) => item.key === key);
const manual = (company, name, addOnIds = []) => normalizeManualAgreement({
  company, totalAnnualPremium: "",
  products: [{ type: "Bil", productName: name, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
});

test("MOT2-2 er lagret som offisiell kilde med månedspresis gyldighet og sporbart avsnitt", async () => {
  const parser = new PDFParse({ data: await readFile(sourcePath) });
  const extracted = await parser.getText();
  await parser.destroy();
  assert.equal(extracted.total, 26);
  for (const anchor of [
    /Forsikringsvilkår MOT2-2/i, /Gjelder fra mars 2024/i,
    /dersom ikke annen\s+egenandel fremgår av særvilkår eller av forsikringsbeviset/i,
    /Delkaskoforsikring Alt under Ansvarsforsikring/i,
    /Kaskoforsikring Alt under Delkaskoforsikring/i,
    /Forsikringssummen er 200 000 kroner/i,
    /begrenset inntil 90 dager/i,
    /mer enn 200 000 km/i,
  ]) assert.match(extracted.text, anchor);
  const motorStart = extracted.text.indexOf("4.9. Motor- og girskadeforsikring");
  const motorEnd = extracted.text.indexOf("4.10. Leiebilforsikring", motorStart);
  assert.ok(motorStart >= 0 && motorEnd > motorStart);
  const motorTerms = extracted.text.slice(motorStart, motorEnd);
  assert.match(motorTerms, /mer enn 200 000 km/i);
  assert.doesNotMatch(motorTerms, /aldersgrense|10 år|førstegangsregistrering/i);
  assert.equal(fact(resolveCatalogFacts(level("Kasko"), ["if-motor-gir"]), "maskinskade.alder"), undefined);
  for (const source of Object.values(productCatalog.sources).filter((item) =>
    item.company === "If" && item.url === IF_TERMS_URL)) {
    assert.equal(source.termsNumber, "MOT2-2");
    assert.equal(source.effectiveFrom, "2024-03");
    assert.equal(source.url, IF_TERMS_URL);
    for (const item of productCatalog.facts[source.id]) {
      assert.equal(item.source.company, "If");
      assert.equal(item.source.termsNumber, "MOT2-2");
      assert.equal(item.source.url, IF_TERMS_URL);
      assert.equal(item.source.filename, source.filename);
      assert.ok(item.source.page >= 1 && item.source.page <= extracted.total);
      assert.ok(item.source.section);
    }
  }
});

test("If tilbyr fire egne nivåer med dokumentert produktarv og inkludert ulykkesdekning", () => {
  assert.deepEqual(productSuggestions(productCatalog, "If", "Bil"), ["Ansvar", "Delkasko", "Kasko", "Super"]);
  assert.deepEqual(resolveProductComponentIds(level("Ansvar")), ["ifAnsvar"]);
  assert.deepEqual(resolveProductComponentIds(level("Delkasko")), ["ifAnsvar", "ifDelkasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Kasko")), ["ifAnsvar", "ifDelkasko", "ifKasko"]);
  assert.deepEqual(resolveProductComponentIds(level("Super")), ["ifAnsvar", "ifDelkasko", "ifKasko", "ifSuper"]);
  for (const name of ["Ansvar", "Delkasko", "Kasko", "Super"]) {
    const facts = resolveCatalogFacts(level(name), []);
    assert.equal(fact(facts, "ulykke.invaliditet").value, "Inntil 200 000 kr per forsikret");
    assert.equal(fact(facts, "ulykke.invaliditet").source.termsNumber, "MOT2-2");
  }
  assert.equal(fact(resolveCatalogFacts(level("Ansvar"), []), "brann.dekning"), undefined);
  assert.ok(fact(resolveCatalogFacts(level("Delkasko"), []), "brann.dekning"));
  assert.equal(fact(resolveCatalogFacts(level("Delkasko"), []), "kasko.dekning"), undefined);
  assert.ok(fact(resolveCatalogFacts(level("Kasko"), []), "kasko.dekning"));
  assert.equal(fact(resolveCatalogFacts(level("Kasko"), []), "nyverdi.alder"), undefined);
  assert.equal(fact(resolveCatalogFacts(level("Super"), []), "nyverdi.alder").value, "Innen 3 år etter registrering som fabrikkny");
});

test("Leiebil og Motor- og girskade er valgfri for Kasko/Super og kan velges samtidig", () => {
  for (const name of ["Ansvar", "Delkasko"]) assert.deepEqual(availableAddOns(level(name)), []);
  for (const name of ["Kasko", "Super"]) {
    assert.deepEqual(availableAddOns(level(name)).map((addOn) => addOn.id), ["if-leiebil", "if-motor-gir"]);
    assert.equal(fact(resolveCatalogFacts(level(name), []), "leiebil.dager"), undefined);
    assert.equal(fact(resolveCatalogFacts(level(name), ["if-leiebil"]), "leiebil.dager").value, "Inntil 90 dager ved reparasjon");
    const both = resolveCatalogFacts(level(name), ["if-leiebil", "if-motor-gir"]);
    assert.equal(fact(both, "maskinskade.km").source.section, "4.9.3");
    assert.equal(fact(both, "leiebil.dager").source.section, "4.10.5");
  }
  assert.equal(availableAddOns(productCatalog.products.find((product) => product.company === "Tryg" && product.name === "Kasko"))
    .some((addOn) => addOn.providerId === "if"), false);
  assert.throws(() => resolveCatalogFacts(level("Kasko"), ["bil-ekstra"]));
});

test("If Super erstatter egen Kasko-grunnverdi uten å overføre den til den andre siden", () => {
  const kasko = manual("If", "Kasko");
  const superAgreement = manual("If", "Super", ["if-leiebil", "if-motor-gir"]);
  assert.equal(kasko.insuranceData.totalAnnualPremium, null);
  assert.equal(superAgreement.insuranceData.insurances[0].deductible, null);
  assert.deepEqual(superAgreement.insuranceData.insurances[0].addOnIds, ["if-leiebil", "if-motor-gir"]);
  const term = superAgreement.insuranceData.insurances[0].importantTerms.find((item) => item.key === "feilfylling.egenandel");
  assert.equal(term.value, "1 000 kr under Uhellsforsikring");
  assert.equal(term.source.section, "4.11.3");
  assert.equal(term.overriddenBase[0].value, "Ordinær kaskoegenandel: 8 000 kr hvis ikke annet er avtalt");
  assert.equal(term.overriddenBase[0].source.section, "4.8, 8.5.5");
  assert.ok(resolveCatalogEvidence(level("Super"), []).some((item) =>
    item.key === "feilfylling.egenandel" && item.value.includes("8 000 kr")));
  const groups = groupInsurances(superAgreement.insuranceData.insurances, kasko.insuranceData.insurances, null);
  const compared = groupTerms(groups[0], null).find((item) => item.key === "feilfylling.egenandel");
  assert.equal(compared.first, "1 000 kr under Uhellsforsikring");
  assert.match(compared.second, /8 000 kr/);
  assert.equal(compared.firstBaseFacts[0].source.company, "If");
  assert.deepEqual(compared.secondBaseFacts, []);
});

test("Tryg mot If sammenligner dokumenterte effektive verdier og holder kildene adskilt", () => {
  const existing = manual("Tryg", "Kasko");
  const offer = manual("If", "Super", ["if-leiebil", "if-motor-gir"]);
  const groups = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null);
  assert.equal(groups.length, 1);
  const terms = groupTerms(groups[0], null);
  const differences = createDifferences(existing, offer, groups, null);
  for (const key of ["brann.dekning", "glass.egenandel.bytte", "glass.egenandel.reparasjon", "veihjelp.egenandel"]) {
    const term = terms.find((item) => item.key === key);
    assert.equal(term.first, term.second, key);
    assert.ok(!differences.some((difference) => difference.title === term.label), key);
  }
  const age = differences.find((difference) => difference.title === "Nyverdierstatning – alder");
  const distance = differences.find((difference) => difference.title === "Nyverdierstatning – kilometer");
  assert.match(age?.text ?? "", /1 år.*3 år/);
  assert.match(distance?.text ?? "", /15 000 km.*60 000 km/);
  const oneSided = terms.find((item) => item.key === "parkering.dekning");
  assert.equal(oneSided.first, null);
  assert.ok(oneSided.second);
  assert.equal(oneSided.firstMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.equal(terms.find((item) => item.key === "nyverdi.skadegrad").second, null);
  assert.equal(terms.find((item) => item.key === "nyverdi.utloser").first, null);
  const maskin = terms.find((item) => item.key === "maskinskade.dekning");
  assert.equal(maskin.first, null);
  assert.equal(maskin.secondSources[0].company, "If");
  assert.equal(maskin.secondSources[0].termsNumber, "MOT2-2");
  assert.equal(maskin.firstMissingLabel, "Ikke dokumentert / kan ikke avgjøres");
  assert.equal(terms.find((item) => item.key === "nyverdi.alder").firstSources[0].termsNumber, "PAU25205");
  assert.equal(terms.find((item) => item.key === "nyverdi.alder").secondSources[0].url, IF_TERMS_URL);
  assert.equal(offer.insuranceData.insurances[0].annualPremium, null);
  assert.equal(offer.insuranceData.insurances[0].deductible, null);
});

test("Ansvar og Rettshjelp følger bare dokumentert arv i Tryg Kasko mot If Super", async () => {
  const existing = manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke"]);
  const offer = manual("If", "Super", ["if-leiebil", "if-motor-gir"]);
  const parser = new PDFParse({ data: await readFile(path.resolve(sourcePath, "../../tryg/Bilforsikring-Kasko.pdf")) });
  const trygKaskoText = (await parser.getText()).text;
  await parser.destroy();
  assert.match(trygKaskoText, /hærverk, feilfylling av drivstoff/i);
  assert.doesNotMatch(trygKaskoText, /rettshjelp|bilansvarsloven/i);
  const terms = groupTerms(groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null)[0], null);
  for (const [key, section] of [["ansvar.dekning", "4.1"], ["rettshjelp.dekning", "12.1"]]) {
    const term = terms.find((item) => item.key === key);
    assert.equal(term.first, null, key);
    assert.equal(term.firstMissingLabel, "Ikke dokumentert / kan ikke avgjøres", key);
    assert.equal(term.secondSources[0].termsNumber, "MOT2-2", key);
    assert.equal(term.secondSources[0].section, section, key);
    assert.deepEqual(term.firstSources, [], key);
  }
  for (const [key, section] of [["haerverk.dekning", "4.4"], ["feilfylling.dekning", "4.11.2"]]) {
    const term = terms.find((item) => item.key === key);
    assert.ok(term.first && term.second, key);
    assert.equal(term.firstSources[0].termsNumber, "PAU25205", key);
    assert.equal(term.firstSources[0].section, "2.1", key);
    assert.equal(term.secondSources[0].section, section, key);
  }
  const differences = createDifferences(existing, offer,
    groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null), null);
  for (const key of ["ansvar.dekning", "rettshjelp.dekning"]) {
    assert.match(differences.find((item) => item.termKey === key)?.text ?? "", /ikke funnet i vilkårene/);
  }
  assert.ok(!differences.some((item) =>
    ["haerverk.dekning", "feilfylling.dekning"].includes(item.termKey) && /ikke funnet/i.test(item.text)));
});

test("eksplisitt valgt Tryg Ansvar deler sammenligningsnøkler med If Ansvar uten å miste opprinnelsen", () => {
  const existing = manual("Tryg", "Ansvar");
  const offer = manual("If", "Ansvar");
  const original = existing.insuranceData.insurances[0].importantTerms.find((item) => item.name === "Rettshjelp");
  assert.equal(original.key, "rettshjelp");
  assert.equal(original.source.termsNumber, "PAU25003");
  const terms = groupTerms(groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null)[0], null);
  for (const [key, trygSection, ifSection] of [
    ["ansvar.dekning", "1.1", "4.1"], ["rettshjelp.dekning", "1.2", "12.1"],
  ]) {
    const term = terms.find((item) => item.key === key);
    assert.equal(terms.filter((item) => item.key === key).length, 1);
    assert.ok(term.first && term.second, key);
    assert.equal(term.firstSources[0].termsNumber, "PAU25003", key);
    assert.equal(term.firstSources[0].section, trygSection, key);
    assert.equal(term.secondSources[0].termsNumber, "MOT2-2", key);
    assert.equal(term.secondSources[0].section, ifSection, key);
  }
  assert.match(terms.find((item) => item.key === "rettshjelp.dekning").first, /ikke vedlagt vilkår/i);
  assert.equal(terms.find((item) => item.key === "rettshjelp.egenandel").first, null);
  assert.equal(terms.find((item) => item.key === "ansvar.person.grense").second, null);
  const differences = createDifferences(existing, offer,
    groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null), null);
  assert.ok(!differences.some((item) =>
    ["ansvar.dekning", "rettshjelp.dekning"].includes(item.termKey) && /ikke funnet/i.test(item.text)));
});

test("ulike navn på samme dokumenterte motor-/girdekning samles i ett datapunkt", () => {
  const existing = manual("Tryg", "Kasko", ["maskinskade"]);
  const offer = manual("If", "Kasko", ["if-motor-gir"]);
  const group = groupInsurances(existing.insuranceData.insurances, offer.insuranceData.insurances, null)[0];
  const terms = groupTerms(group, null);
  const coverage = terms.filter((item) => item.key === "maskinskade.dekning");
  assert.equal(coverage.length, 1);
  assert.match(coverage[0].first, /motor-/i);
  assert.match(coverage[0].second, /motor-/i);
  assert.equal(coverage[0].firstSources[0].termsNumber, "PAU27110");
  assert.equal(coverage[0].secondSources[0].termsNumber, "MOT2-2");
  assert.deepEqual(offer.insuranceData.insurances[0].addOnIds, ["if-motor-gir"]);
  assert.equal(offer.insuranceData.totalAnnualPremium, null);
  assert.equal(offer.insuranceData.insurances[0].deductible, null);
});
