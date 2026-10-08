// Separate current correctness decision for the two original product bindings.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { productCatalog } from '../../../../lib/product-catalog.ts';
import { deriveCanonicalCoverages } from '../../../../lib/coverage-status.ts';
import { documentPipeline } from '../../../../tests/helpers/supporting-terms.mjs';
const auth = JSON.parse(readFileSync(new URL('authorization.json', import.meta.url)));
const root = new URL('../../../../', import.meta.url);
for (const source of auth.sources) assert.equal(createHash('sha256').update(readFileSync(new URL(source.path, root))).digest('hex'), source.sha256);
const oracle = JSON.parse(readFileSync(new URL('../b051-rot-77db841/proposal.json', import.meta.url)));
const key = 'hus.rate.dekning', addon = 'gjensidige-hus-rate-insekter';
assert.equal(productCatalog.facts.gjensidigeHusPluss.find(f => f.key === key).value, oracle.value);
assert.equal(productCatalog.facts.gjensidigeHusRotOption.find(f => f.key === key).value, oracle.value);
const results = auth.bindings.map(binding => {
  const p = productCatalog.products.find(product => product.productId === binding.product);
  const scenarios = [
    [[], binding.product === 'gjensidige-hus' ? 'unknown' : 'selected', false],
    [['Valgt'], 'selected', false], [['Ikke valgt'], 'not_selected', false],
    [['Valgt', 'Ikke valgt'], 'unknown', true],
  ].map(([values, expected, conflict]) => {
    const doc = { company: 'Gjensidige', type: 'Hus', productName: p.name, canonicalProductName: p.name,
      agreementScope: 'ordinary', annualPremium: null, deductible: null, coverageSummary: null,
      agreementPeriod: null, objectIdentifiers: [], documentIndices: [1], documentRole: 'individual_agreement',
      importantTerms: values.map(value => ({ name: 'Råte og sopp', value, documentIndices: [1] })), addOns: [] };
    const insurance = documentPipeline([[doc]], 'existing').insuranceData.insurances[0];
    const coverage = deriveCanonicalCoverages(insurance, 'Hus').find(c => c.id === key);
    assert.equal(coverage.status, expected); assert.equal(coverage.conflict, conflict);
    assert.deepEqual(insurance.addOnIds, binding.product === 'gjensidige-hus' && values.length === 1 && values[0] === 'Valgt' ? [addon] : []);
    return { values, status: coverage.status, conflict: coverage.conflict, addOnIds: insurance.addOnIds };
  });
  return { ...binding, source_meaning: 'PASS_UNCHANGED_SOURCE_VERIFIED_FULL_ROT_TEXT', scenarios, document_selection_requirements: 'PASS' };
});
const continuation = JSON.parse(readFileSync(new URL('repeat-choice-candidate.json', import.meta.url)));
assert.deepEqual(continuation.repeated.addOnIds, []);
console.log(JSON.stringify({ classification: 'CURRENT_ORIGINAL_SIGNATURE_REVALIDATION_NOT_COMPLETION',
  signature: auth.signature, tested_revision: auth.baseline, results,
  documented_choice_and_silent_optional: 'PASS',
  manual_choice_continuation: 'FAIL_SEPARATE_BASELINE_FINDING', original_signature_status: 'OPEN',
  completion_receipt_created: false, signature_credit: 0, global_resolved_open: 'UNKNOWN', P2_credit: 0,
}, null, 2));
