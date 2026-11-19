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

async function pipeline(modelResponse) {
  const output = JSON.parse(modelResponse.output_text);
  const controller = new AbortController();
  let extractionCalls = 0;
  const result = await analyzePdfBatches({
    sides: [{ side: "existing", files: output.insurances.map((_, i) => ({ data: new Uint8Array([i + 1]) })) }],
    controller,
    telemetry: createAnalysisTelemetry("00000000-0000-0000-0000-000000000000"),
    emit: () => {},
    parse: async (file) => {
      const item = output.insurances[file.data[0] - 1];
      return {
        text: `Individuelt forsikringsbevis - syntetisk\nForsikringsselskap: ${item.company}\nProdukt: ${item.productName}\nVilkårsutgave: 2026-01-01`,
        pages: 1, parseMs: 0, textMs: 0,
      };
    },
    extract: async (batch) => {
      extractionCalls++;
      assert.equal(batch.documents.length, output.insurances.length);
      return parseExtractionResponse(modelResponse);
    },
  });
  assert.equal(extractionCalls, 1);
  assert.equal(result.partialSuccess, false);
  assert.equal(result.successfulDocuments, output.insurances.length);
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
