import assert from "node:assert/strict";
import test from "node:test";
import { mergeBatchResults } from "../lib/analysis-merge.ts";
import { createAnalysisTelemetry } from "../lib/analysis-telemetry.ts";
import { buildExtractionRequest, parseExtractionResponse, validateAnalysisOutput } from "../lib/analysis-output.ts";
import { analyzePdfBatches } from "../lib/pdf-analysis-pipeline.ts";

const VIS = "VIS Forsikring (Norsk Hussopp Forsikring)";
const AMTRUST = "AmTrust International Underwriters DAC";
const NITO_CABIN_CONTENTS = "NITO Innboforsikring Fritidsbolig";

function insurance(company, agreementScope, productName, type, documentIndex) {
  return {
    company, agreementScope, type, productName, canonicalProductName: productName,
    documentIndices: [documentIndex], documentRole: "individual_agreement",
    agreementPeriod: { from: "2026-09-01", to: "2027-08-31" },
    annualPremium: null, deductible: null, coverageSummary: null,
    objectIdentifiers: [], addOns: [],
    importantTerms: [{ name: "Dokumentmerknad", value: `Syntetisk dokumentfaktum ${documentIndex}`,
      canonicalKey: null, documentIndices: [documentIndex] }],
  };
}

function response(company, insurances) {
  return {
    status: "completed",
    output_text: JSON.stringify({ company, totalAnnualPremium: null, totalAnnualPremiumScope: "partial_or_unclear", insurances }),
  };
}

async function pipeline(modelResponse, documents) {
  if (!documents) {
    const { insurances } = JSON.parse(modelResponse.output_text);
    documents = insurances.map(item =>
      `Individuelt forsikringsbevis - syntetisk\nForsikringsselskap: ${item.company}\nProdukt: ${item.productName}\nVilkårsutgave: 2026-01-01`);
  }
  const controller = new AbortController();
  let extractionCalls = 0;
  const result = await analyzePdfBatches({
    sides: [{ side: "existing", files: documents.map((_, i) => ({ data: new Uint8Array([i + 1]) })) }],
    controller,
    telemetry: createAnalysisTelemetry("00000000-0000-0000-0000-000000000000"),
    emit: () => {},
    parse: async (file) => ({ text: documents[file.data[0] - 1], pages: 1, parseMs: 0, textMs: 0 }),
    extract: async (batch) => {
      extractionCalls++;
      assert.equal(batch.documents.length, documents.length);
      return parseExtractionResponse(modelResponse);
    },
  });
  assert.equal(extractionCalls, 1);
  assert.equal(result.partialSuccess, false);
  assert.equal(result.successfulDocuments, documents.length);
  return mergeBatchResults(result.results, "existing", result.partialSuccess).insuranceData.insurances;
}

const groups = [
  { name: "VIS og AmTrust med NITO-scope", company: null, records: [
    insurance(VIS, "nito", "Råte og skadedyr til NITO Husforsikring", "Hus", 1),
    insurance(AMTRUST, "nito", "NITO Inntektsforsikring", "Inntekt", 2),
  ] },
  { name: "to AmTrust-bevis med NITO-scope", company: AMTRUST, records: [
    insurance(AMTRUST, "nito", "NITO Inntektsforsikring 5 000", "Inntekt", 1),
    insurance(AMTRUST, "nito", "NITO Advokatforsikring", "Advokat", 2),
  ] },
  { name: "AmTrust og VIS med tomt scope", company: null, records: [
    insurance(AMTRUST, null, "NITO Inntektsforsikring 10 000", "Inntekt", 1),
    insurance(VIS, null, "Råte og skadedyr til Utdanningsforbundets husforsikring", "Hus", 2),
  ] },
];

for (const { name, company, records } of groups) {
  test(`${name} beholder begge bevis og den dokumenterte forsikringsgiveren`, async () => {
    const insurances = await pipeline(response(company, records));
    assert.equal(insurances.length, 2);
    for (const [index, original] of records.entries()) {
      const result = insurances.find(item => item.documentReferences.some(ref => ref.documentIndex === index));
      assert.ok(result);
      assert.equal(result.company, original.company);
      assert.equal(result.agreementScope, null);
      assert.equal(result.catalogReference, null);
      assert.equal(result.catalogFacts?.length ?? 0, 0);
      const fact = result.importantTerms.find(term => term.value === `Syntetisk dokumentfaktum ${index + 1}`);
      assert.equal(fact?.coverageOrigin, "document");
      assert.deepEqual(fact?.sources.map(source => source.documentId), [`pdf:existing:${index}`]);
    }
  });
}

test("en ekte Tryg-medlemsavtale i samme batch beholder scope og vilkårsoppslag", async () => {
  const [member, external] = await pipeline(response(null, [
    insurance("Tryg", "nito", NITO_CABIN_CONTENTS, "Innbo fritidsbolig", 1),
    insurance("VIS Forsikring", "utdanningsforbundet", "Råte og skadedyr", "Hus", 2),
  ]));
  assert.equal(member.agreementScope, "nito");
  assert.equal(member.catalogReference?.productId, "tryg-nito-innbo-fritidsbolig");
  assert.ok(member.catalogFacts?.length);
  assert.equal(external.company, "VIS Forsikring");
  assert.equal(external.agreementScope, null);
  assert.equal(external.catalogReference, null);
});

function memberCertificate({
  company = "Tryg", scope = "NITO", productName = NITO_CABIN_CONTENTS, version = "2026-01-01", termsNumber,
} = {}) {
  const lines = [
    "Individuelt forsikringsbevis - syntetisk",
    `Forsikringsselskap: ${company}`,
    `Medlemsavtale: ${scope}`,
    `Produkt: ${productName}`,
    "Forsikringsperiode: 01.09.2026 - 31.08.2027",
  ];
  if (version) lines.push(`Vilkårsutgave: ${version}`);
  if (termsNumber) {
    const [year, month, day] = version.split("-");
    lines.push(`Vilkår ${termsNumber} gjelder fra ${day}.${month}.${year}.`);
  }
  return lines.join("\n");
}

test("fem Tryg-bevis i samme batch gjenfinner medlemsavtale og utgave fra eget dokument", async () => {
  const expected = [
    { productName: "NITO Elbil Ekstra", type: "Bil", id: "tryg-nito-elbil-ekstra", version: "2026-07-01", termsNumber: "PAU27015" },
    { productName: NITO_CABIN_CONTENTS, type: "Innbo", id: "tryg-nito-innbo-fritidsbolig", version: "2026-01-01" },
    { productName: "NITO Husforsikring", type: "Hus", id: "tryg-nito-hus", version: "2026-01-01", termsNumber: "PPK11507" },
    { productName: "NITO Uføreforsikring etter studentmedlemskap", type: "Uføre", id: "tryg-nito-ufore-etter-studiet", version: "2026-01-01", termsNumber: "54712" },
    { productName: "Utdanningsforbundet Studentforsikring", type: "Studentforsikring", id: "tryg-utdanningsforbundet-student", version: "2026", scope: "Utdanningsforbundet" },
  ];
  const model = response("Tryg", expected.map((item, index) =>
    insurance("Tryg", null, item.productName, item.type, index + 1)));
  const results = await pipeline(model, expected.map(item => memberCertificate(item)));
  assert.equal(results.length, expected.length);
  for (const [index, item] of expected.entries()) {
    const record = results.find(result => result.documentReferences.some(ref => ref.documentIndex === index));
    const scope = item.scope?.toLowerCase() ?? "nito";
    assert.ok(record, item.productName);
    assert.equal(record.agreementScope, scope, item.productName);
    assert.equal(record.catalogReference?.productId, item.id, item.productName);
    assert.equal(record.catalogReference?.version, item.version, item.productName);
    assert.ok(record.catalogFacts?.length, item.productName);
  }
});

const unprovenMemberScopes = [
  ["annen forsikringsgiver", memberCertificate({ company: VIS })],
  ["motstridende forsikringsgivere", memberCertificate() + `\nForsikringsselskap: ${AMTRUST}`],
  ["motstridende medlemsavtaler", memberCertificate() + "\nMedlemsavtale: Utdanningsforbundet"],
  ["medlemsorganisasjon", memberCertificate().replace("Medlemsavtale:", "Medlemsorganisasjon:")],
  ["manglende vilkårsutgave", memberCertificate({ version: null })],
  ["ukjent vilkårsutgave", memberCertificate({ version: "2099-01-01" })],
  ["annet produkt i beviset", memberCertificate({ productName: "NITO Husforsikring" })],
];

for (const [reason, document] of unprovenMemberScopes) {
  test(`manglende scope beholdes ved ${reason}`, async () => {
    const raw = insurance("Tryg", null, NITO_CABIN_CONTENTS, "Innbo fritidsbolig", 1);
    const [result] = await pipeline(response("Tryg", [raw]), [document]);
    assert.equal(result.agreementScope, null);
    assert.equal(result.catalogReference, null);
    assert.equal(result.catalogFacts?.length ?? 0, 0);
  });
}

test("to poster på samme PDF kan ikke gjenopprette medlemsavtalen fra dokumentet", async () => {
  const records = [
    insurance("Tryg", null, NITO_CABIN_CONTENTS, "Innbo fritidsbolig", 1),
    insurance("Tryg", null, "NITO Husforsikring", "Hus", 1),
  ];
  const results = await pipeline(response("Tryg", records), [memberCertificate()]);
  assert.equal(results.length, records.length);
  for (const result of results) {
    assert.equal(result.agreementScope, null);
    assert.equal(result.catalogReference, null);
  }
});

test("direkte validering, ukjent scope og manglende eller ikke godkjent forsikringsgiver er fortsatt strenge", () => {
  const known = insurance(AMTRUST, "nito", "NITO Inntektsforsikring", "Inntekt", 1);
  assert.throws(() => validateAnalysisOutput(JSON.parse(response(AMTRUST, [known]).output_text)), /Ugyldig avtalescope/u);
  for (const change of [
    { company: undefined }, { company: null }, { company: "If" }, { company: "Ukjent forsikring" },
    { agreementScope: "ikke-registrert" }, { agreementScope: "medlem@example.invalid" },
  ]) {
    assert.throws(() => parseExtractionResponse(response(AMTRUST, [{ ...known, ...change }])), /Ugyldig avtalescope/u);
  }
});

test("ekstraksjonsinstruksen knytter avtalescope til forsikringsgiver per post", () => {
  const { instructions } = buildExtractionRequest("Syntetiske forsikringsdokumenter", 2);
  assert.match(instructions, /flere separate forsikringsavtaler/u);
  assert.match(instructions, /den tilhører forsikringsgiveren for posten/u);
  assert.match(instructions, /faktiske forsikringsgiveren som company per forsikringsobjekt/u);
});
