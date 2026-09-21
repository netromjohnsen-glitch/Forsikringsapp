import assert from "node:assert/strict";
import test from "node:test";
import { createDifferences, groupInsurances, groupTerms } from "../lib/comparison.ts";
import { presentImportantDifferences } from "../lib/comparison-presentation.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";

const manual = (company, productName, addOnIds = [], type = "Bil") => normalizeManualAgreement({
  company, totalAnnualPremium: "",
  products: [{ type, productName, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
});

function presented(first, second) {
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  const raw = createDifferences(first, second, groups, null);
  return { groups, raw, shown: presentImportantDifferences(raw, groups, null) };
}

const family = (result, conceptId) => result.shown.find((entry) => entry.conceptId === conceptId);
const keys = (entry) => entry?.items?.flatMap((item) => item.termKey ? [item.termKey] : []) ?? [];

test("Totalskade presenteres som én familie mens canonical alder og kilometer forblir separate", () => {
  const result = presented(manual("Tryg", "Kasko", ["bil-ekstra"]), manual("If", "Super"));
  assert.ok(result.raw.some((difference) => difference.termKey === "nyverdi.alder"));
  assert.ok(result.raw.some((difference) => difference.termKey === "nyverdi.km"));
  const summary = family(result, "bil.totalskade");
  assert.ok(summary);
  assert.equal(result.shown.filter((entry) => entry.conceptId === "bil.totalskade").length, 1);
  assert.ok(keys(summary).includes("nyverdi.alder"));
  assert.ok(keys(summary).includes("nyverdi.km"));

  const details = groupTerms(result.groups[0], null);
  const age = details.find((term) => term.key === "nyverdi.alder");
  const distance = details.find((term) => term.key === "nyverdi.km");
  assert.notEqual(age, distance);
  for (const term of [age, distance]) {
    assert.equal(term.firstSources[0].termsNumber, "PAU27002");
    assert.equal(term.secondSources[0].termsNumber, "MOT2-2");
    assert.equal(term.secondSources[0].company, "If");
    assert.equal(term.firstBaseFacts[0].source.termsNumber, "PAU25205");
  }
});

test("Maskinskade og Mobilitet bruker én topp-plass hver med flere underforskjeller", () => {
  const result = presented(
    manual("Tryg", "Kasko", ["bil-ekstra", "maskinskade", "forer-passasjerulykke-ekstra"]),
    manual("If", "Super", ["if-motor-gir", "if-leiebil"]),
  );
  const machine = family(result, "bil.maskinskade");
  const mobility = family(result, "bil.mobilitet");
  assert.ok(machine);
  assert.ok(mobility);
  assert.equal(result.shown.filter((entry) => entry.conceptId === "bil.maskinskade").length, 1);
  assert.equal(result.shown.filter((entry) => entry.conceptId === "bil.mobilitet").length, 1);
  assert.ok(keys(machine).some((key) => key.startsWith("maskinskade.")));
  assert.ok(keys(mobility).some((key) => key.startsWith("leiebil.")));
  assert.ok(result.raw.some((difference) => difference.termKey === "leiebil.dager"));
});

const source = (id) => ({ documentId: id, filename: `${id}.pdf`, termsNumber: id,
  effectiveFrom: "2026-01", page: 1, section: "1" });
function synthetic(terms, company, type = "Bil") {
  return { insuranceData: { company, totalAnnualPremium: null, insurances: [{
    type, productName: "Variant", annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: terms.map(([key, name, value, deductibleClassification]) => ({
      key, name, value, source: source(`${company}-${key}`), deductibleClassification,
    })),
  }] } };
}

test("bare faktiske Maskinskade-forskjeller tas med i familien", () => {
  const result = presented(synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["maskinskade.km", "Maskinskade – kilometer", "200 000 km"],
  ], "Selskap A"), synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["maskinskade.km", "Maskinskade – kilometer", "150 000 km"],
  ], "Selskap B"));
  const summary = family(result, "bil.maskinskade");
  assert.deepEqual(keys(summary), ["maskinskade.km"]);
  assert.match(summary.items[0].text, /200 000 km.*150 000 km/);
});

test("alder og kilometer fra ulike dekninger havner i ulike familier", () => {
  const result = presented(synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "10 år"],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "60 000 km"],
  ], "Selskap A"), synthetic([
    ["maskinskade.alder", "Maskinskade – alder", "8 år"],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "30 000 km"],
  ], "Selskap B"));
  assert.deepEqual(keys(family(result, "bil.maskinskade")), ["maskinskade.alder"]);
  assert.deepEqual(keys(family(result, "bil.totalskade")), ["nyverdi.km"]);
});

test("ukjente nøkler grupperes ikke sammen bare fordi de har lik teknisk stamme", () => {
  const result = presented(synthetic([
    ["ukjent.alder", "Maskinskade – alder", "10 år"],
    ["ukjent.km", "Totalskadegaranti – kilometer", "60 000 km"],
  ], "Selskap A"), synthetic([
    ["ukjent.alder", "Maskinskade – alder", "8 år"],
    ["ukjent.km", "Totalskadegaranti – kilometer", "30 000 km"],
  ], "Selskap B"));
  const shown = result.shown.filter((entry) => entry.insuranceKey === "bil");
  assert.equal(shown.length, 2);
  assert.notEqual(shown[0].conceptId, shown[1].conceptId);
});

test("Uhell samler dekning, geografi, grense og egenandel i én familie", () => {
  const first = synthetic([
    ["uhell.dekning", "Uhell", "Ja"], ["uhell.geografi", "Uhell – geografi", "Norden"],
    ["uhell.grense", "Uhell – grense", "40 000 kr"], ["uhell.egenandel", "Uhell – egenandel", "2 000 kr", "override"],
  ], "Selskap A", "Innbo");
  const second = synthetic([
    ["uhell.dekning", "Uhell", "Bare hjemme"], ["uhell.geografi", "Uhell – geografi", "Forsikringsstedet"],
    ["uhell.grense", "Uhell – grense", "20 000 kr"], ["uhell.egenandel", "Uhell – egenandel", "4 000 kr", "override"],
  ], "Selskap B", "Innbo");
  const result = presented(first, second);
  const summary = family(result, "innbo.uhell");
  assert.equal(result.shown.filter((entry) => entry.conceptId === "innbo.uhell").length, 1);
  assert.deepEqual(new Set(keys(summary)), new Set(["uhell.dekning", "uhell.geografi", "uhell.grense", "uhell.egenandel"]));
});

test("Hus holder Vann og fukt, Våtrom og Håndverkerfeil som egne familier", () => {
  const first = synthetic([
    ["hus.ror.brudd", "Rørbrudd", "Ja"], ["hus.takvegg.folgeskade", "Tak/vegg", "Ja"],
    ["hus.vatrom.folgeskade", "Våtrom", "Ja"], ["hus.handverker.folgeskade", "Håndverker", "10 år"],
    ["hus.aldersfradrag.utvendige_ror", "Rør – aldersfradrag", "20 år"],
  ], "Selskap A", "Hus");
  const second = synthetic([
    ["hus.ror.brudd", "Rørbrudd", "Begrenset"], ["hus.takvegg.folgeskade", "Tak/vegg", "Nei"],
    ["hus.vatrom.folgeskade", "Våtrom", "Nei"], ["hus.handverker.folgeskade", "Håndverker", "5 år"],
    ["hus.aldersfradrag.utvendige_ror", "Rør – aldersfradrag", "10 år"],
  ], "Selskap B", "Hus");
  const result = presented(first, second);
  assert.ok(family(result, "hus.vann-fukt"));
  assert.ok(family(result, "hus.vatrom"));
  assert.ok(family(result, "hus.handverker"));
  assert.ok(keys(family(result, "hus.vann-fukt")).includes("hus.aldersfradrag.utvendige_ror"));
});

test("Reisens rammer samler varighet, geografi og overnatting uten å slå facts sammen", () => {
  const result = presented(synthetic([
    ["reise.varighet.maks", "Varighet", "45 dager"], ["reise.omrade.verden", "Område", "Hele verden"],
    ["reise.overnatting", "Overnatting", "Kreves"],
  ], "Selskap A", "Reise"), synthetic([
    ["reise.varighet.maks", "Varighet", "75 dager"], ["reise.omrade.verden", "Område", "Norden"],
    ["reise.overnatting", "Overnatting", "Kreves ikke"],
  ], "Selskap B", "Reise"));
  const summary = family(result, "reise.rammer");
  assert.equal(result.shown.filter((entry) => entry.conceptId === "reise.rammer").length, 1);
  assert.deepEqual(new Set(keys(summary)), new Set(["reise.varighet.maks", "reise.omrade.verden", "reise.overnatting"]));
});

test("Tryg og Gjensidige øvelseskjøring vises samlet og kildebelagt uten canonical termKey", () => {
  const result = presented(manual("Tryg", "Kasko"), manual("Gjensidige", "Pluss"));
  const benefit = family(result, "bil.ovelseskjoring");
  assert.equal(benefit.presentationType, "conditional-benefit");
  assert.equal(benefit.termKey, undefined);
  assert.equal(result.shown.filter((entry) => entry.conceptId === "bil.ovelseskjoring").length, 1);
  assert.match(benefit.text, /Eksisterende: Krav: 2 000 km.*Startbonus: 70 %.*Nytt tilbud: Krav: 2 000 km.*Startbonus: 70 %/s);
  assert.match(benefit.text, /Egenandelsregel: 5 000 kr.*Egenandelsregel: 15 000 kr/s);
  assert.deepEqual(new Set(benefit.presentationSources.map((source) => source.providerId)), new Set(["tryg", "gjensidige"]));
  assert.equal(result.raw.some((entry) => /øvelseskjøringsapp/.test(entry.text)), false);
});

test("betingelsene beholdes på riktig side i Tryg mot Gjensidige", () => {
  const benefit = family(presented(manual("Tryg", "Kasko"), manual("Gjensidige", "Pluss")), "bil.ovelseskjoring");
  const [existing, offered] = benefit.text.split(" Nytt tilbud: ");
  assert.match(existing, /Tryg vei til lappen/);
  assert.doesNotMatch(existing, /Gjensidiges øvelseskjøringsapp/);
  assert.match(offered, /Gjensidiges øvelseskjøringsapp/);
  assert.doesNotMatch(offered, /fordelskoden til Tryg/);
});

test("conditional-benefit påvirker ikke motorens missing coverage", () => {
  const result = presented(manual("Tryg", "Kasko"), manual("Gjensidige", "Pluss"));
  const rawMissingCount = result.raw.filter((entry) => /Tilsvarende dekning er ikke funnet/.test(entry.text)).length;
  assert.equal(result.raw.some((entry) => entry.termKey === "bil.ovelseskjoring"), false);
  assert.equal(result.raw.some((entry) => /betinget fordel/i.test(entry.text)), false);
  assert.equal(rawMissingCount, result.raw.filter((entry) => /Tilsvarende dekning er ikke funnet/.test(entry.text)).length);
});

test("fordeler lekker ikke mellom providers", () => {
  const benefit = family(presented(manual("Tryg", "Kasko"), manual("Storebrand", "Super")), "bil.ovelseskjoring");
  assert.match(benefit.text, /Tryg vei til lappen/);
  assert.match(benefit.text, /Skade under øvelseskjøring gir ikke bonustap/);
  assert.doesNotMatch(benefit.text, /Gjensidiges øvelseskjøringsapp/);
  assert.doesNotMatch(benefit.text, /2 000 kr rabatt/);
});

test("Fremtind-fordeler lekker ikke mellom SpareBank 1, DNB og Eika", () => {
  const sparebankDnb = family(presented(
    manual("SpareBank 1 / Fremtind", "Toppkasko"), manual("DNB / Fremtind", "Topp"),
  ), "bil.ovelseskjoring");
  assert.match(sparebankDnb.text, /en øvelseskjøringsapp/);
  assert.match(sparebankDnb.text, /bestått førerprøve/);
  assert.deepEqual(new Set(sparebankDnb.presentationSources.map((source) => source.distributionChannel)), new Set(["SpareBank 1", "DNB"]));

  const eikaDnb = family(presented(
    manual("Eika / Fremtind", "Topp"), manual("DNB / Fremtind", "Topp"),
  ), "bil.ovelseskjoring");
  assert.match(eikaDnb.text, /^Eksisterende: Tilsvarende betinget fordel er ikke dokumentert etter kontroll/);
  assert.match(eikaDnb.text, /Nytt tilbud: Krav: 2 000 km/);
  assert.equal(eikaDnb.presentationSources.some((source) => source.providerId === "eika-fremtind"), false);
});

test("provider uten dokumentert fordel får ikke oppdiktet verdi", () => {
  const benefit = family(presented(
    manual("Eika / Fremtind", "Kasko"), manual("Tryg", "Kasko"),
  ), "bil.ovelseskjoring");
  assert.match(benefit.text, /^Eksisterende: Tilsvarende betinget fordel er ikke dokumentert etter kontroll/);
  assert.doesNotMatch(benefit.text.split(" Nytt tilbud: ")[0], /Startbonus:|Ungførerfordel:|Egenandelsregel:/);
});

test("ukjent fritekstprovider blir ikke feilaktig merket som kontrollert uten fordel", () => {
  const benefit = family(presented(
    manual("Ukjent selskap", "Ukjent produkt"), manual("Tryg", "Kasko"),
  ), "bil.ovelseskjoring");
  assert.match(benefit.text, /^Eksisterende: Betinget fordel kan ikke avgjøres uten katalogkobling/);
  assert.doesNotMatch(benefit.text.split(" Nytt tilbud: ")[0], /ikke dokumentert etter kontroll/);
});

test("presentasjonskilder følger riktig side, provider og kanal", () => {
  const benefit = family(presented(
    manual("If", "Super"), manual("SpareBank 1 / Fremtind", "Toppkasko"),
  ), "bil.ovelseskjoring");
  assert.deepEqual(new Set(benefit.presentationSources.map((source) =>
    `${source.side}:${source.providerId}:${source.distributionChannel}`
  )), new Set([
    "first:if:If", "second:sparebank1-fremtind:SpareBank 1",
  ]));
  assert.ok(benefit.presentationSources.every((source) => source.checkedAt === "2026-09-21"));
  assert.ok(benefit.presentationSources.every((source) => source.url.includes(source.providerId === "if" ? "if.no" : "sparebank1.no")));
});

test("tjenester klassifiseres separat fra coverage", () => {
  const result = presented(synthetic([
    ["reise.tjeneste.legehjelp", "Digital lege", "Inkludert"],
  ], "Selskap A", "Reise"), synthetic([
    ["reise.tjeneste.legehjelp", "Digital lege", "Ikke inkludert"],
  ], "Selskap B", "Reise"));
  const service = family(result, "reise.tjenester");
  assert.equal(service.presentationType, "service");
  assert.notEqual(service.presentationType, "coverage");
});
