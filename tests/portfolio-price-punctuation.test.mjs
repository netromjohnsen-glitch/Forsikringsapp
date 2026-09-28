import test from 'node:test';
import assert from 'node:assert/strict';
import { annualAmount, vehiclePrices, differentVehiclePriceBasis, vehiclePriceDifferences } from '../lib/vehicle-price-presentation.ts';
import { portfolioPrice, portfolioPriceDifference } from '../lib/portfolio-price-presentation.ts';
import { groupInsurances, createDifferences } from '../lib/comparison.ts';
import { presentImportantDifferences } from '../lib/comparison-presentation.ts';
import { readAnalysisResponse } from '../lib/analysis-client.ts';
import { pipeline } from './helpers/pilot-quality.mjs';

const keys = ['premie.ekskl_tfa', 'premie.tfa', 'premie.total'];
const labels = ['Forsikringspris', 'Trafikkforsikringsavgift', 'Totalpris'];
// Deliberately independent explicit totals: never derive them from premium + TFA.
const amounts = [[8641, 1359, 10321], [7263, 2047, 9527]];
const records = (period = false, values = amounts) => values.map((prices, index) => ({
  type: 'Bil', company: 'Syntetisk selskap', productName: 'Kasko', canonicalProductName: 'Kasko',
  annualPremium: null, deductible: null, coverageSummary: null, addOns: [],
  documentRole: 'individual_agreement', documentIndices: [1],
  objectIdentifiers: [{ type: 'registration', value: `ZZ8100${index + 1}`, documentIndices: [1] }],
  importantTerms: prices.flatMap((amount, i) => amount === null ? [] : [{
    name: labels[i], canonicalKey: keys[i], documentIndices: [1],
    value: `${new Intl.NumberFormat('nb-NO').format(amount)} kr${period ? '.' : ''}`,
  }]),
}));
const state = price => price.components.map(c => ({
  key: c.key, completeness: c.completeness, expected: c.expected, priced: c.priced, amount: c.amount,
}));
function accepted(document, values = amounts) {
  const observed = [];
  const before = JSON.stringify(document);
  const price = portfolioPrice(document, 0, (objectIndex, input) => observed.push({ objectIndex, ...input }));
  assert.equal(JSON.stringify(document), before, 'price interpretation must preserve raw values and provenance');
  assert.equal(price.objectCount, 2);
  assert.equal(price.compatible, true);
  assert.equal(price.conflict, false);
  assert.deepEqual(state(price), keys.map((key, i) => ({
    key, completeness: 'complete', expected: 2, priced: 2,
    amount: values.reduce((sum, row) => sum + row[i] * 100, 0),
  })));
  assert.equal(observed.length, 6);
  assert.ok(observed.every(p => p.state === 'present' && p.annualBasis === 'canonical_annual' && p.comparable && p.reason === 'CONTRIBUTION_ACCEPTED'));
  return price;
}

for (const key of keys) {
  test(`currency punctuation yields the same annual amount for ${key}`, () => {
    for (const [plain, dotted] of [['12 457 kr', '12 457 kr.'], ['8 641,25 kr', '8 641,25 kr.'], ['7\u202f263 kr per år', '7\u202f263 kr. per år']]) {
      assert.notEqual(annualAmount(plain, key), null);
      assert.equal(annualAmount(dotted, key), annualAmount(plain, key));
    }
  });
}

for (const swapped of [false, true]) {
  for (const reversed of [false, true]) {
    test(`complete 2+2 portfolio survives price formatting, side swap=${swapped}, reversed order=${reversed}`, async () => {
      const inputs = [records(true), records()];
      if (swapped) inputs.reverse();
      if (reversed) inputs[1].reverse();
      const documents = inputs.map((rows, side) => pipeline(rows, side ? 'offer' : 'existing', side === 1));
      // Exercise the real NDJSON response reader, then the actual client price calculations.
      const response = new Response(JSON.stringify({ type: 'result', data: { documents } }) + '\n', { headers: { 'content-type': 'application/x-ndjson' } });
      const received = (await readAnalysisResponse(response, () => {})).documents;
      const prices = received.map(d => accepted(d));
      assert.deepEqual(state(prices[0]), state(prices[1]));
      const groups = groupInsurances(...received.map(d => d.insuranceData.insurances), null);
      assert.equal(groups.length, 2);
      assert.ok(groups.every(g => g.objectMatch.status === 'matched'));
      assert.equal(portfolioPriceDifference(prices[0], prices[1], groups), null);
      for (const group of groups) {
        assert.equal(differentVehiclePriceBasis(group.first[0], group.second[0]), false);
        assert.deepEqual(vehiclePriceDifferences(group.first[0], group.second[0]), []);
      }
      assert.ok(!presentImportantDifferences(createDifferences(...received, groups, null), groups, null).some(d => d.type === 'price'));
    });
  }
}

test('alternative portfolio amounts and an explicit zero are not pilot-specific', () => {
  const values = [[3100, 0, 3300], [4600, 1700, 6400]];
  for (const side of ['existing', 'offer']) accepted(pipeline(records(true, values), side), values);
});
test('missing explicit total stays partial without inferring it from complete premium and TFA', () => {
  const values = structuredClone(amounts); values[1][2] = null;
  const price = portfolioPrice(pipeline(records(true, values)));
  assert.deepEqual(price.components.map(c => c.completeness), ['complete', 'complete', 'partial']);
  assert.equal(price.components[2].priced, 1);
  assert.equal(price.components[2].expected, 2);
  assert.equal(price.components[2].amount, amounts[0][2] * 100);
});
test('document failure keeps otherwise complete price contributions partial', () => {
  assert.ok(portfolioPrice(pipeline(records(true)), 1).components.every(c => c.completeness === 'partial'));
});
test('duplicate cross-batch records with currency punctuation count once after existing consolidation', () => {
  const document = pipeline([...records(true), ...records()], 'existing', true);
  assert.equal(document.insuranceData.insurances.length, 2);
  accepted(document);
  assert.ok(document.insuranceData.insurances.every(o => o.consolidation.recordCount === 2));
});
test('genuinely conflicting duplicate prices remain conflicting', () => {
  const changed = structuredClone(amounts); changed[0][2] += 500;
  const price = portfolioPrice(pipeline([...records(true), ...records(false, changed)]));
  assert.equal(price.components[2].completeness, 'conflicting');
  assert.equal(price.components[2].amount, null);
});
test('punctuation does not accept monthly amounts, ranges, prose, extra numbers or malformed decimals', () => {
  for (const value of ['8 641 kr. per måned', '8 641 kr. /mnd', '8 641–9 527 kr.', 'fra 8 641 kr.', '8 641 kr. eller 9 527 kr.', '8 641 kr..', '8 641 kr. Ikke endelig', '8641.25 kr.', '8.641.', '8 641, kr.']) {
    assert.equal(annualAmount(value, 'premie.total'), null, value);
  }
  assert.equal(annualAmount('8 641 kr. ekskl. trafikkforsikringsavgift', 'premie.total'), null);
  assert.equal(annualAmount('8 641 kr. inklusive trafikkforsikringsavgift', 'premie.ekskl_tfa'), null);
});
test('formatted object price stays document-backed and preserves original text', () => {
  const document = pipeline(records(true));
  for (const object of document.insuranceData.insurances) {
    for (const price of vehiclePrices(object)) {
      assert.match(price.value, /kr\.$/u);
      assert.notEqual(price.amount, null);
      assert.ok(price.sources.some(s => s.documentId.startsWith('pdf:')));
    }
  }
});
