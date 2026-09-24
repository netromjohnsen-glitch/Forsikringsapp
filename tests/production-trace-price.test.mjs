import assert from 'node:assert/strict';
import test from 'node:test';
import {portfolioPrice} from '../lib/portfolio-price-presentation.ts';

const fact = value => ({name: 'Totalpris', key: 'premie.total', value, coverageOrigin: 'document', sources: []});
const document = (changes = {}) => ({source: 'pdf', insuranceData: {totalAnnualPremium: null, insurances: [{type: 'Bil', importantTerms: [fact('18 432 kr')], ...changes}]}});
function trace(doc) {
  const inputs = [];
  const result = portfolioPrice(doc, 0, (objectIndex, input) => inputs.push({objectIndex, input}));
  assert.deepEqual(result, portfolioPrice(doc));
  assert.deepEqual(portfolioPrice(doc, 0, () => {throw new Error('Synthetic observer failure');}), result);
  for (const row of inputs) {
    assert.deepEqual(Object.keys(row.input).sort(), ['annualBasis','comparable','key','reason','state']);
  }
  assert.doesNotMatch(JSON.stringify(inputs), /18 432|18432|99 999|99999|private\.pdf|Synthetic Person/);
  return inputs;
}
const total = rows => rows.find(row => row.input.key === 'premie.total').input;
test('actual portfolio observer leaves accepted canonical/qualified amounts and returned result unchanged', () => {
  for (const value of ['18 432 kr', 'kr 18 432 etter rabatter, inklusive trafikkforsikringsavgift']) {
    assert.deepEqual(total(trace(document({importantTerms: [fact(value)]}))), {
      key: 'premie.total', state: 'present', annualBasis: 'canonical_annual', comparable: true, reason: 'CONTRIBUTION_ACCEPTED',
    });
  }
});
test('actual unresolved-consolidation rejection is observable even when the object amount parses', () => {
  const result = total(trace(document({consolidation: {status: 'unresolved', recordCount: 2, issues: ['product_conflict']}})));
  assert.equal(result.state, 'conflict');
  assert.equal(result.reason, 'CONSOLIDATION_UNRESOLVED');
  assert.equal(result.annualBasis, 'canonical_annual');
  assert.equal(result.comparable, false);
});
test('actual conflicting source prices and multiple direct amounts have distinct reasons', () => {
  assert.equal(total(trace(document({consolidation: {status: 'consolidated', recordCount: 2, issues: [], factConflicts: [{key:'premie.total', values: ['18 432 kr','99 999 kr']}]}}))).reason, 'CONSOLIDATION_FACT_CONFLICT');
  assert.equal(total(trace(document({importantTerms: [fact('18 432 kr'), fact('99 999 kr')]}))).reason, 'MULTIPLE_DOCUMENT_AMOUNTS');
});
test('format-only conflict metadata remains accepted by the unchanged portfolio branch', () => {
  const row = total(trace(document({consolidation: {status: 'consolidated', recordCount: 2, issues: [], factConflicts: [{key:'premie.total', values: ['18432 kr','18 432 kr']}]}})));
  assert.equal(row.state, 'present'); assert.equal(row.reason, 'CONTRIBUTION_ACCEPTED');
});
test('actual unparseable, missing, unsupported and optional-TFA branches remain distinct', () => {
  assert.equal(total(trace(document({importantTerms: [fact('18 432 kr per måned')]}))).reason, 'PRICE_UNPARSEABLE');
  assert.equal(total(trace(document({importantTerms: []}))).reason, 'PRICE_MISSING');
  assert.equal(total(trace(document({type: 'Hus'}))).reason, 'PRICE_TYPE_UNSUPPORTED');
  const tfa = trace(document({type: 'Tilhenger'})).find(row => row.input.key === 'premie.tfa').input;
  assert.equal(tfa.state, 'not_required'); assert.equal(tfa.reason, 'OPTIONAL_TFA_NOT_REQUIRED'); assert.equal(tfa.comparable, false);
});
