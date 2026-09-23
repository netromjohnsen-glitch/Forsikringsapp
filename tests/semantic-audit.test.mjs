import assert from 'node:assert/strict';
import test from 'node:test';
import { runHybridMatching } from '../lib/hybrid-matching.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { canonicalDocumentFactKeys, buildExtractionRequest } from '../lib/analysis-output.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { normalizeTermName } from '../lib/insurance-normalization.ts';
import { groupAddOnNames, groupInsurances, groupTerms } from '../lib/comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
const term = (name, key, value = 'PRIVATE_VALUE_829') => ({ name, key, value });
const policy = (terms, extra = {}) => ({ type: 'Bil', productName: 'PRIVATE_PRODUCT_AB12345', coverageSummary: 'PRIVATE_TEXT', importantTerms: terms, ...extra });
async function audit(left, right, answer = () => ({ decisions: [] })) {
  const telemetry = createAnalysisTelemetry('00000000-0000-0000-0000-000000000000');
  let batch;
  const plan = await runHybridMatching([left], [right], async (b) => { batch = b; return answer(b); }, telemetry.semanticMatcher);
  return { metrics: telemetry.snapshot(200).semanticMatcher, batch, plan };
}
function response(batch, confidence = 1, decision = 'match') {
  const scope = batch.termScopes[0];
  return { decisions: [{ kind: 'term', scopeId: scope.id, leftId: scope.leftTerms[0].id,
    rightIds: [scope.rightTerms[0].id], confidence, decision, reason: 'PRIVATE_MODEL_RESPONSE_PROMPT' }] };
}
test('audit logs exact known canonical IDs and opaque unknown nodes; accepted edges link only local ordinals', async () => {
  const result = await audit(policy([term('PRIVATE_LABEL', 'nyverdi.km')]), policy([term('PRIVATE_OTHER_LABEL')]), response);
  const { candidates, decisions } = result.metrics.audit;
  assert.equal(candidates[0].detailId, 'nyverdi.km');
  assert.equal(candidates[0].coverageId, 'nyverdi');
  assert.equal(candidates[1].identity, 'unknown');
  assert.equal(candidates[1].detailId, 'unknown');
  assert.equal(decisions[0].accepted, true);
  assert.equal(decisions[0].reason, 'SEMANTIC_ACCEPTED');
  assert.deepEqual(decisions[0].right, [1]);
  assert.equal(result.plan.termMatches.length, 1);
});
for (const [label, marker, extras] of [
  ['raw label', 'PRIVATE_LABEL', {}], ['value', 'PRIVATE_VALUE_829', {}],
  ['document text', 'PRIVATE_TEXT', {}], ['filename', 'PRIVATE_CUSTOMER.pdf', { filename: 'PRIVATE_CUSTOMER.pdf' }],
  ['product display name and registration', 'PRIVATE_PRODUCT_AB12345', {}],
  ['source text', 'PRIVATE_SOURCE', { sources: [{ text: 'PRIVATE_SOURCE' }] }],
  ['model response and prompt fragment', 'PRIVATE_MODEL_RESPONSE_PROMPT', {}],
]) test(`audit blocks ${label}`, async () => {
  const result = await audit(policy([term('PRIVATE_LABEL', 'nyverdi.km')], extras), policy([term('PRIVATE_OTHER')]), response);
  assert.ok(!JSON.stringify(result.metrics).includes(marker));
});
test('forged canonical key and forged log fields cannot bypass the logging allowlist', async () => {
  const result = await audit(policy([term('PRIVATE_LABEL', 'nyverdi.PRIVATE_CUSTOMER')]), policy([term('Unknown detail')]), response);
  assert.doesNotMatch(JSON.stringify(result.metrics), /PRIVATE/);
  const telemetry = createAnalysisTelemetry('invalid');
  const malicious = structuredClone(result.metrics);
  Object.assign(malicious.audit.candidates[0], { insuranceType: 'PRIVATE_TYPE', detailId: 'nyverdi.PRIVATE_ID', reason: 'PRIVATE_REASON', filename: 'PRIVATE_FILE', coverageId: 'PRIVATE_COVERAGE' });
  malicious.audit.decisions[0].reason = 'PRIVATE_REASON';
  telemetry.semanticMatcher(malicious);
  assert.doesNotMatch(JSON.stringify(telemetry.snapshot(200)), /PRIVATE/);
});
test('audit records low-confidence rejection without model reason', async () => {
  const result = await audit(policy([term('Left unknown')]), policy([term('Right unknown')]), (b) => response(b, .5));
  assert.equal(result.metrics.audit.decisions[0].reason, 'LOW_CONFIDENCE');
  assert.equal(result.metrics.audit.decisions[0].accepted, false);
});
test('audit distinguishes explicit alias from an explicit canonical key', async () => {
  const result = await audit(policy([term('Faktisk kilometerstand')]), policy([term('Unknown odometer')]), response);
  assert.equal(result.metrics.audit.candidates[0].stage, 'EXPLICIT_ALIAS');
  assert.equal(result.metrics.audit.candidates[0].detailId, 'kjoretoy.kilometerstand');
});
test('unresolved count and bounded candidates remain explainable without dropping fallback', async () => {
  const result = await audit(policy(Array.from({ length: 25 }, (_, i) => term(`Left unknown ${i}`))),
    policy(Array.from({ length: 4 }, (_, i) => term(`Right unknown ${i}`))));
  assert.equal(result.metrics.unresolvedCandidates, 29);
  assert.equal(result.metrics.semanticCandidatesSent, 16);
  assert.equal(result.metrics.audit.candidates.filter((c) => !c.sent && c.reason === 'CANDIDATE_LIMIT').length, 13);
  assert.equal(result.metrics.audit.candidates.filter((c) => c.sent).length, 16);
});
test('invalid semantic response and request failure log only fixed outcomes', async () => {
  const a = policy([term('Left unknown')]), b = policy([term('Right unknown')]);
  const invalid = await audit(a, b, () => ({ PRIVATE_PAYLOAD: true }));
  assert.equal(invalid.metrics.audit.outcome, 'INVALID_RESPONSE');
  const failed = await audit(a, b, () => { throw new Error('PRIVATE_FAILURE'); });
  assert.equal(failed.metrics.audit.outcome, 'REQUEST_FAILED');
  assert.doesNotMatch(JSON.stringify([invalid.metrics, failed.metrics]), /PRIVATE/);
});
const kmKeys = ['nyverdi.km', 'kjoretoy.kilometerstand', 'maskinskade.km', 'kjoretoy.avtalt_maks_kilometerstand'];
for (let i = 0; i < kmKeys.length; i++) for (let j = i + 1; j < kmKeys.length; j++) {
  test(`semantic numeric isolation: ${kmKeys[i]} != ${kmKeys[j]}`, async () => {
    const result = await audit(policy([term('Kilometergrense', kmKeys[i], '87 000 km')]), policy([term('Kilometergrense', kmKeys[j], '87 000 km')]));
    assert.equal(result.metrics.invoked, false);
    assert.equal(result.metrics.audit.candidates[0].reason, 'DIFFERENT_CANONICAL_SCOPE');
  });
}
test('semantic response cannot cross canonical kilometer scopes even when unknown candidates keep the scope open', async () => {
  const result = await audit(policy([term('Limit', 'nyverdi.km'), term('Left unknown')]),
    policy([term('Limit', 'kjoretoy.kilometerstand'), term('Right unknown')]), response);
  assert.equal(result.metrics.audit.outcome, 'INVALID_RESPONSE');
  assert.equal(result.plan.termMatches.length, 0);
});
test('precise vehicle labels override a mis-tagged model key without interpreting numbers', () => {
  const input = policy([
    { name: 'Totalskadegaranti kilometer', canonicalKey: 'nyverdi.km', value: '73 000 km' },
    { name: 'Faktisk kilometerstand', canonicalKey: 'nyverdi.km', value: '182 500 km' },
    { name: 'Maskinskade kilometer', canonicalKey: 'maskinskade.km', value: '215 000 km' },
    { name: 'Avtalt maksimal kilometerstand', canonicalKey: 'nyverdi.km', value: '198 000 km' },
  ]);
  const facts = normalizeDocumentFacts(input);
  for (const [key, value] of [['nyverdi.km', '73 000 km'], ['kjoretoy.kilometerstand', '182 500 km'], ['maskinskade.km', '215 000 km'], ['kjoretoy.avtalt_maks_kilometerstand', '198 000 km']]) {
    assert.deepEqual(facts.filter((f) => f.key === key).map((f) => f.value), [value]);
  }
  const insurance = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', insurances: [{ ...input, productName: 'Pluss', canonicalProductName: 'Pluss', addOns: [] }] }, new Date('2026-09-23')).insurances[0];
  const rows = groupTerms(groupInsurances([insurance], [insurance], null)[0], null);
  assert.equal(rows.find((r) => r.key === 'nyverdi.km').first, '73 000 km');
  assert.equal(rows.find((r) => r.key === 'kjoretoy.kilometerstand').first, '182 500 km');
});
test('vehicle aliases are explicit and Bil-scoped', () => {
  assert.equal(normalizeTermName('Avlest kilometerstand', { insuranceType: 'Bil' }), 'kjoretoy.kilometerstand');
  assert.notEqual(normalizeTermName('Avlest kilometerstand', { insuranceType: 'Reise' }), 'kjoretoy.kilometerstand');
});
for (const [status, expected] of [['Valgt', 'Leiebil · Maskinskade'], ['Ikke valgt', null], ['Ikke dokumentert', null]]) {
  test(`metadata + document status ${status} governs addon overview`, () => {
    const insurance = policy(['Leiebil', 'Maskinskade'].map((name) => ({ name, value: status, coverageOrigin: 'document' })), { productName: 'Pluss', coverageSummary: null, addOns: [] });
    assert.equal(groupAddOnNames([insurance], 'Bil'), expected);
  });
}
test('catalog-only addon status and arbitrary selected coverages do not create chosen addons', () => {
  for (const terms of [
    [{ name: 'Leiebil', key: 'leiebil.dekning', value: 'Valgt', coverageOrigin: 'catalog' }],
    ['Veihjelp', 'Rettshjelp', 'Ulykke', 'Bilnøkkel', 'Brann', 'Glass', 'Ukjent dekning'].map((name) => ({ name, value: 'Valgt', coverageOrigin: 'document' })),
  ]) assert.equal(groupAddOnNames([policy(terms, { coverageSummary: null, addOns: [] })], 'Bil'), null);
});

test('extraction schema and instructions preserve separate vehicle fields', () => {
  for (const key of [...kmKeys, 'kjoretoy.kjorelengde']) assert.ok(canonicalDocumentFactKeys.includes(key));
  const request = buildExtractionRequest('Synthetic PDF');
  assert.match(JSON.stringify(request), /kjoretoy\.avtalt_maks_kilometerstand/);
});
test('unknown insurance type cannot leak a customer label through audit type or scope IDs', async () => {
  const result = await audit(policy([term('PRIVATE_LEFT')], { type: 'PRIVATE_TYPE_LEFT' }), policy([term('PRIVATE_RIGHT')], { type: 'PRIVATE_TYPE_RIGHT' }));
  assert.equal(result.metrics.invoked, true);
  assert.ok(result.metrics.audit.candidates.every((candidate) => candidate.insuranceType === 'unknown'));
  assert.doesNotMatch(JSON.stringify(result.metrics), /PRIVATE/);
});
test('audit is bounded and reports omissions instead of logging unlimited source-derived nodes', async () => {
  const result = await audit(policy(Array.from({ length: 250 }, (_, i) => term(`PRIVATE_LEFT ${i}`))), policy([term('PRIVATE_RIGHT')]));
  assert.equal(result.metrics.audit.candidates.length, 240);
  assert.equal(result.metrics.audit.omitted, 11);
  assert.doesNotMatch(JSON.stringify(result.metrics), /PRIVATE/);
});
