import assert from "node:assert/strict";
import test from "node:test";
import { buildMatchingBatch, runHybridMatching } from "../lib/hybrid-matching.ts";

const policy = (type, terms = [], productName = "Standard") => ({
  type, productName, coverageSummary: "Dekning oppgitt i dokumentet", importantTerms: terms,
});
const term = (name, value = "Dekket") => ({ name, value });
const decision = (kind, scopeId, leftId, rightIds, decisionValue = "match", confidence = 0.98) => ({
  kind, scopeId, leftId, rightIds, decision: decisionValue, confidence, reason: "Samme hoveddekning og forsikringsobjekt i oppgitt kontekst.",
});

test("deterministisk match gir ingen AI-kall", async () => {
  let calls = 0;
  const plan = await runHybridMatching(
    [policy("Personbil", [term("Glass")])],
    [policy("Bilforsikring", [term("Glasskade")])],
    async () => { calls++; return { decisions: [] }; },
  );
  assert.equal(calls, 0);
  assert.deepEqual(plan.insuranceMatches, []);
  assert.deepEqual(plan.termMatches, []);
});

test("bare unmatched vilkår sendes med kontekst", () => {
  const batch = buildMatchingBatch(
    [policy("Bil", [term("Glass"), term("Dekning ved tapt nøkkel", "Inntil 5 000 kr")], "Bil Pluss")],
    [policy("Bilforsikring", [term("Glasskade"), term("Nøkkeltap", "Inntil 4 000 kr")], "Bil Topp")],
  );
  assert.equal(batch.typeCandidates.length, 0);
  assert.equal(batch.termScopes.length, 1);
  assert.deepEqual(batch.termScopes[0].leftTerms.map((item) => item.name), ["Dekning ved tapt nøkkel"]);
  assert.deepEqual(batch.termScopes[0].rightTerms.map((item) => item.name), ["Nøkkeltap"]);
  assert.equal(batch.termScopes[0].leftProductName, "Bil Pluss");
  assert.equal(batch.termScopes[0].leftTerms[0].value, "Inntil 5 000 kr");
});

test("tydelig semantisk forsikringstype kan godkjennes", async () => {
  const plan = await runHybridMatching(
    [policy("Elbil premium")], [policy("Elektrisk personbil")],
    async (batch) => ({ decisions: [decision("insurance", "types", batch.typeCandidates[0].leftId, [batch.typeCandidates[0].rightId])] }),
  );
  assert.equal(plan.insuranceMatches.length, 1);
  assert.equal(plan.assessments[0].accepted, true);
});

test("lav confidence og uncertain blir ikke automatisk match", async () => {
  const left = [policy("Bil", [term("Nøkkelbeskyttelse")])];
  const right = [policy("Bil", [term("Tap av bilnøkkel")])];
  for (const [outcome, confidence] of [["match", 0.80], ["uncertain", 0.99], ["no_match", 0.99]]) {
    const plan = await runHybridMatching(left, right, async (batch) => ({
      decisions: [decision("term", batch.termScopes[0].id, batch.termScopes[0].leftTerms[0].id,
        [batch.termScopes[0].rightTerms[0].id], outcome, confidence)],
    }));
    assert.equal(plan.termMatches.length, 0);
    assert.equal(plan.assessments[0].accepted, false);
  }
});

test("åpenbart ulike typer og sammensatt hus/fritidsbolig sendes ikke til AI", async () => {
  for (const [leftType, rightType] of [["Bil", "Bolig"], ["Bil ekstra", "Båt pluss"], ["Hus og fritidsbolig", "Boligforsikring"]]) {
    let calls = 0;
    const plan = await runHybridMatching([policy(leftType)], [policy(rightType)], async () => {
      calls++; return { decisions: [] };
    });
    assert.equal(calls, 0);
    assert.equal(plan.insuranceMatches.length, 0);
  }
});

test("én glassopplysning kan matches mot skifte og reparasjon samlet", async () => {
  const plan = await runHybridMatching(
    [policy("Bil", [term("Glass", "3 000 kr ved skifte; 0 kr ved reparasjon")])],
    [policy("Bil", [term("Glasskade ved utskifting", "2 500 kr"), term("Glasskade ved reparasjon", "0 kr")])],
    async (batch) => ({ decisions: [decision("term", batch.termScopes[0].id,
      batch.termScopes[0].leftTerms[0].id, batch.termScopes[0].rightTerms.map((item) => item.id))] }),
  );
  assert.equal(plan.termMatches.length, 1);
  assert.equal(plan.termMatches[0].rightKeys.length, 2);
});

test("én-til-flere krever høyere confidence og felles dekningsrot", async () => {
  const left = [policy("Bil", [term("Glass")])];
  const right = [policy("Bil", [term("Glasskade ved skifte"), term("Glasskade ved reparasjon")])];
  const low = await runHybridMatching(left, right, async (batch) => ({ decisions: [decision("term", batch.termScopes[0].id,
    batch.termScopes[0].leftTerms[0].id, batch.termScopes[0].rightTerms.map((item) => item.id), "match", 0.96)] }));
  assert.equal(low.termMatches.length, 0);
  const unrelated = await runHybridMatching(
    left, [policy("Bil", [term("Glasskade ved skifte"), term("Veihjelp ved stans")])],
    async (batch) => ({ decisions: [decision("term", batch.termScopes[0].id,
      batch.termScopes[0].leftTerms[0].id, batch.termScopes[0].rightTerms.map((item) => item.id))] }),
  );
  assert.equal(unrelated.termMatches.length, 0);
});

test("konflikter og feil respons faller tilbake uten krasj", async () => {
  const left = [policy("Bil", [term("Glass")])];
  const right = [policy("Bil", [term("Glasskade ved skifte"), term("Glasskade ved reparasjon")])];
  const invalid = await runHybridMatching(left, right, async () => ({ decisions: [{ bad: true }] }));
  assert.deepEqual(invalid.termMatches, []);
  const invented = await runHybridMatching(left, right, async (batch) => ({ decisions: [decision(
    "term", batch.termScopes[0].id, batch.termScopes[0].leftTerms[0].id, ["r:oppdiktet"])] }));
  assert.deepEqual(invented.termMatches, []);
  const failed = await runHybridMatching(left, right, async () => { throw new Error("API unavailable"); });
  assert.deepEqual(failed.termMatches, []);
  const ambiguous = await runHybridMatching(left, right, async (batch) => ({ decisions: [
    decision("term", batch.termScopes[0].id, batch.termScopes[0].leftTerms[0].id, [batch.termScopes[0].rightTerms[0].id]),
    decision("term", batch.termScopes[0].id, batch.termScopes[0].leftTerms[0].id, [batch.termScopes[0].rightTerms[1].id]),
  ] }));
  assert.equal(ambiguous.termMatches.length, 0);
});
