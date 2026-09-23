import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMatchingBatch, runHybridMatching } from '../lib/hybrid-matching.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { createDifferences, groupInsurances, groupTerms, groupAddOnNames } from '../lib/comparison.ts';
import { presentImportantDifferences } from '../lib/comparison-presentation.ts';
import { includePdfAddOnTerms } from '../lib/pdf-addons.ts';
import { pilotPolicy, rentalScenarios, addon } from './helpers/pilot-comparison.mjs';
const term = (name, key, value = 'Valgt') => ({ name, key, value });
const policy = (terms, type = 'Bil') => ({ type, productName: null, coverageSummary: null, importantTerms: terms });
async function match(left, right, response = () => ({ decisions: [] })) {
  let calls = 0, sent, metrics;
  const plan = await runHybridMatching([left], [right], async (batch) => { calls++; sent = batch; return response(batch); }, (m) => { metrics = m; });
  return { calls, sent, metrics, plan };
}
function accept(scope, leftId, rightIds) {
  return { kind: 'term', scopeId: scope.id, leftId, rightIds, decision: 'match', confidence: 1, reason: 'Synthetic test' };
}

test('canonical keys and catalog key aliases require zero semantic calls', async () => {
  const r = await match(policy([term('A', 'rettshjelp')]), policy([term('B', 'rettshjelp.dekning')]));
  assert.equal(r.calls, 0); assert.equal(r.metrics.invoked, false); assert.equal(r.metrics.deterministicMatches, 2);
});
test('explicit type-scoped aliases require zero semantic calls', async () => {
  const r = await match(policy([term('Redning')]), policy([term('Veihjelp')]));
  assert.equal(r.calls, 0);
});
test('related detail context is shared with comparison before fallback', async () => {
  const left = policy([term('Maskinskade'), term('Varighet', undefined, '10 år')]);
  const right = policy([term('Maskinskade'), term('Grense', 'maskinskade.varighet', '12 år')]);
  const r = await match(left, right); assert.equal(r.calls, 0);
  const rows = groupTerms(groupInsurances([left], [right], null)[0], null);
  assert.equal(rows.find((row) => row.key === 'maskinskade.varighet').first, '10 år');
});
test('a genuinely unresolved label pair still invokes semantic fallback once', async () => {
  const r = await match(policy([term('Nøkkelbeskyttelse')]), policy([term('Tap av bilnøkkel')]));
  assert.equal(r.calls, 1); assert.equal(r.metrics.semanticCandidatesSent, 2);
});
test('only unresolved candidates are sent; deterministic aliases and canonical matches stay out', async () => {
  const r = await match(policy([term('Glass'), term('A', 'nyverdi.alder'), term('Nøkkelbeskyttelse')]),
    policy([term('Glasskade'), term('B', 'nyverdi.alder'), term('Tap av bilnøkkel')]));
  assert.deepEqual(r.sent.termScopes[0].leftTerms.map((t) => t.name), ['Nøkkelbeskyttelse']);
  assert.deepEqual(r.sent.termScopes[0].rightTerms.map((t) => t.name), ['Tap av bilnøkkel']);
});
test('AI cannot override a safe canonical match by returning an excluded id', async () => {
  const r = await match(policy([term('A', 'nyverdi.alder'), term('Nøkkelbeskyttelse')]),
    policy([term('B', 'nyverdi.alder'), term('Tap av bilnøkkel')]),
    (batch) => ({ decisions: [accept(batch.termScopes[0], 'l:nyverdi.alder', ['r:nyverdi.alder'])] }));
  assert.deepEqual(r.plan.termMatches, []);
});
test('different canonical coverages and different details are not semantic candidates', async () => {
  for (const keys of [['maskinskade.alder', 'parkering.alder'], ['leiebil.dager', 'leiebil.feriereise']]) {
    const r = await match(policy([term('Alder', keys[0])]), policy([term('Alder', keys[1])]));
    assert.equal(r.calls, 0); assert.deepEqual(r.plan.termMatches, []);
  }
});
test('mixed unresolved scope cannot authorize AI to collapse different canonical fields', async () => {
  const r = await match(policy([term('Alder', 'maskinskade.alder'), term('Ukjent A')]),
    policy([term('Alder', 'parkering.alder'), term('Ukjent B')]),
    (batch) => ({ decisions: [accept(batch.termScopes[0], 'l:maskinskade.alder', ['r:parkering.alder'])] }));
  assert.equal(r.calls, 1); assert.deepEqual(r.plan.termMatches, []);
});
test('known different insurance types remain isolated even with identical detail keys', async () => {
  assert.equal((await match(policy([term('A', 'maskinskade.alder')]), policy([term('A', 'maskinskade.alder')], 'Hus'))).calls, 0);
});
test('similar spellings do not become deterministic aliases', async () => {
  assert.equal((await match(policy([term('Maskinskadex alder')]), policy([term('Maskinskadey alder')]))).calls, 1);
});
test('semantic metrics whitelist counts, duration and usage without labels or response text', async () => {
  const telemetry = createAnalysisTelemetry(crypto.randomUUID());
  await runHybridMatching([policy([term('PRIVATE_LABEL_A')])], [policy([term('PRIVATE_LABEL_B')])], async (batch) => {
    telemetry.usage('semantic', 2, true, { output_text: 'PRIVATE_RESPONSE', usage: { input_tokens: 10, output_tokens: 3 } });
    return { decisions: [accept(batch.termScopes[0], batch.termScopes[0].leftTerms[0].id, [batch.termScopes[0].rightTerms[0].id])] };
  }, (metrics) => telemetry.semanticMatcher({ ...metrics, label: 'PRIVATE_LABEL', customer: 'PRIVATE_CUSTOMER' }));
  const snapshot = telemetry.snapshot(200);
  assert.equal(snapshot.semanticMatcher.semanticMatchesAccepted, 1);
  assert.equal(snapshot.semanticMatcher.inputTokens, 10); assert.equal(snapshot.semanticMatcher.outputTokens, 3);
  assert.doesNotMatch(JSON.stringify(snapshot), /PRIVATE|Synthetic test/);
});
test('zero semantic candidates records zero invocation and zero tokens', async () => {
  const telemetry = createAnalysisTelemetry(crypto.randomUUID());
  await runHybridMatching([policy([term('Glass')])], [policy([term('Glass')])], () => assert.fail('No API request'), telemetry.semanticMatcher);
  assert.equal(telemetry.snapshot(200).semanticMatcher.inputTokens, 0);
  assert.equal(telemetry.snapshot(200).semanticMatcher.semanticCandidatesSent, 0);
});
test('generic same-label terms cannot inherit an unrelated canonical identity', async () => {
  const a = policy([term('Særgrense', 'a.grense'), term('Særgrense', undefined, '200 kr')]);
  const b = policy([term('Særgrense', 'a.grense')]);
  const rows = groupTerms(groupInsurances([a], [b], null)[0], null);
  assert.equal(rows.find((row) => row.key === 'særgrense').first, '200 kr');
  assert.equal(rows.find((row) => row.key === 'a.grense').first, 'Valgt');
  const batch = buildMatchingBatch([policy([term('A', 'a.grense')])], [policy([term('A', 'b.grense')])]);
  assert.equal(batch.termScopes.length, 0);
});
test('synthetic Gjensidige Kasko/Pluss catalog regression resolves without semantic AI', async () => {
  const r = await match(pilotPolicy('Kasko'), pilotPolicy('Pluss'));
  assert.equal(r.calls, 0); assert.equal(r.metrics.semanticCandidatesSent, 0);
});
test('canonical fallback pruning also works for another provider', async () => {
  const r = await match(pilotPolicy('Kasko', { company: 'Tryg' }), pilotPolicy('Kasko', { company: 'Tryg', addOns: [addon('Maskinskade', [term('Maskinskade alder', undefined, '8 år')])] }));
  assert.equal(r.calls, 0);
});

test('four rental scenarios recover explicit scoped labels from a repeated generic extraction key', () => {
  const insurance = pilotPolicy('Pluss');
  const coverage = canonicalCoverage(insurance, 'Bil', 'leiebil.dekning');
  for (const [key, , days] of rentalScenarios) {
    assert.deepEqual(coverage.details.filter((d) => d.key === key).map((d) => d.value), [`Leiebil i inntil ${days} dager`]);
  }
  assert.doesNotMatch(coverage.summary, /ved reparasjon:[^;]*(?:30|15) dager/);
  assert.match(coverage.summary, /ved tekniske problemer i Norden: Leiebil i inntil 30 dager/);
  assert.match(coverage.summary, /ved feriereise utenfor Norden: Leiebil i inntil 15 dager/);
});
test('canonical identity preserves same-label same-value separate rental details', () => {
  const terms = rentalScenarios.map(([canonicalKey,,days]) => ({ name: 'Varighet', canonicalKey, value: `${days} dager` }));
  assert.equal(includePdfAddOnTerms({ importantTerms: terms }).importantTerms.length, 4);
});
test('important differences and detailed comparison retain the same four rental identities', () => {
  const left = pilotPolicy('Kasko'), right = pilotPolicy('Pluss');
  const groups = groupInsurances([left], [right], null);
  const doc = (insurance) => ({ insuranceData: { company: 'Gjensidige', totalAnnualPremium: null, insurances: [insurance] } });
  const shown = presentImportantDifferences(createDifferences(doc(left), doc(right), groups, null), groups, null);
  const rental = JSON.stringify(shown.find((entry) => entry.conceptId === 'bil.mobilitet'));
  assert.ok(rental);
  for (const expected of ['ved reparasjon', 'ved totalskade eller tyveri', 'ved tekniske problemer i Norden', 'ved feriereise utenfor Norden']) assert.ok(rental.includes(expected));
  const rows = groupTerms(groups[0], null);
  for (const [key,,days] of rentalScenarios) assert.equal(rows.find((row) => row.key === key).second, `Leiebil i inntil ${days} dager`);
});
test('Kasko standard coverages mistakenly extracted as addons retain data but not addon classification', () => {
  const names = ['Veihjelp', 'Ulykke – fører og passasjerer', 'Rettshjelp', 'Bilnøkkel', 'Trafikkulykke – ulykkesdekning'];
  const insurance = pilotPolicy('Kasko', { addOns: names.map((name) => addon(name, [term(name, undefined, 'Valgt')])) });
  assert.equal(groupAddOnNames([insurance], 'Bil'), null);
  assert.equal(insurance.addOns.length, names.length);
  for (const name of names) assert.ok(insurance.addOns.find((entry) => entry.name === name).importantTerms.some((t) => t.name === name));
  for (const key of ['veihjelp.dekning', 'ulykke.dekning', 'rettshjelp.dekning', 'bilnokkel.dekning']) assert.ok(insurance.importantTerms.some((t) => t.key === key));
});
test('selected documented Pluss add-ons remain Leiebil and Maskinskade', () => {
  assert.equal(groupAddOnNames([pilotPolicy('Pluss')], 'Bil'), 'Leiebil · Maskinskade');
});
test('explicit negative status beats a modeled rental addon', () => {
  assert.equal(groupAddOnNames([pilotPolicy('Kasko', { addOns: [addon('Leiebil')] })], 'Bil'), null);
});
test('catalog standard coverage alone never creates a customer addon', () => {
  assert.equal(groupAddOnNames([pilotPolicy('Kasko')], 'Bil'), null);
});
test('pilot document precedence, prices, keys and limits survive', () => {
  for (const product of ['Kasko', 'Pluss']) {
    const insurance = pilotPolicy(product); const plus = product === 'Pluss';
    const value = (key) => insurance.importantTerms.find((t) => t.key === key)?.value;
    assert.equal(insurance.catalogReference.productId, plus ? 'gj-bil-pluss' : 'gj-bil-kasko');
    assert.equal(value('nyverdi.alder'), plus ? '3 år' : '1 år');
    assert.equal(value('nyverdi.km'), plus ? '60 000 km' : '15 000 km');
    assert.equal(value('bilnokkel.grense'), plus ? '15 000 kr' : '7 500 kr');
    assert.equal(value('premie.total'), plus ? '12 788 kr' : '14 786 kr');
    assert.equal(canonicalCoverage(insurance, 'Bil', 'leiebil.dekning').status, plus ? 'selected' : 'not_selected');
    if (plus) {
      assert.equal(value('maskinskade.alder'), '10 år'); assert.equal(value('maskinskade.km'), '200 000 km');
      assert.equal(value('premie.ekskl_tfa'), '9 518 kr'); assert.equal(value('premie.tfa'), '3 270 kr');
    }
  }
});

test('rental labels never depend on the particular day limits', () => {
  const insurance = pilotPolicy('Pluss', { addOns: [addon('Leiebil', rentalScenarios.map(([key, name], index) => ({
    name, canonicalKey: key, value: `Leiebil i inntil ${[45, 20, 10, 7][index]} dager`,
  })))] });
  const summary = canonicalCoverage(insurance, 'Bil', 'leiebil.dekning').summary;
  assert.match(summary, /ved reparasjon: Leiebil i inntil 45 dager/);
  assert.match(summary, /ved totalskade eller tyveri: Leiebil i inntil 20 dager/);
  assert.match(summary, /ved tekniske problemer i Norden: Leiebil i inntil 10 dager/);
  assert.match(summary, /ved feriereise utenfor Norden: Leiebil i inntil 7 dager/);
});
test('document selected status and canonical addon metadata restore addon overview', () => {
  const insurance = pilotPolicy('Pluss', { addOns: [] });
  assert.equal(canonicalCoverage(insurance, 'Bil', 'leiebil.dekning').status, 'selected');
  assert.equal(groupAddOnNames([insurance], 'Bil'), 'Leiebil · Maskinskade');
});
test('failed semantic fallback records invocation without inventing accepted matches or tokens', async () => {
  const telemetry = createAnalysisTelemetry(crypto.randomUUID());
  await runHybridMatching([policy([term('PRIVATE_LEFT')])], [policy([term('PRIVATE_RIGHT')])],
    async () => { throw new Error('PRIVATE_FAILURE'); }, telemetry.semanticMatcher);
  const result = telemetry.snapshot(200).semanticMatcher;
  assert.equal(result.invoked, true); assert.equal(result.semanticMatchesAccepted, 0);
  assert.equal(result.inputTokens, null); assert.doesNotMatch(JSON.stringify(result), /PRIVATE/);
});
test('detail context retains document and catalog provenance after matching', () => {
  const insurance = pilotPolicy('Pluss');
  const details = canonicalCoverage(insurance, 'Bil', 'leiebil.dekning').details;
  assert.equal(insurance.importantTerms.find((t) => t.key === 'leiebil.teknisk').coverageOrigin, 'document');
  assert.equal(details.find((d) => d.key === 'leiebil.teknisk').value, 'Leiebil i inntil 30 dager');
  assert.ok(insurance.catalogFacts.some((fact) => fact.source.documentId));
});
