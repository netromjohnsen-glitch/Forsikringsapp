// Characterization of a separate, pre-existing manual continuation defect.
// This is diagnostic evidence, never a completion gate or approval of that behavior.
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../../../../', import.meta.url);
const authorization = JSON.parse(readFileSync(new URL('authorization.json', import.meta.url)));
const mode = process.argv[2];
if (!['baseline', 'candidate'].includes(mode)) throw new Error('baseline or candidate required');
const hashes = {}, originals = new Map();
for (const path of authorization.production_files) {
  const bytes = mode === 'baseline'
    ? execFileSync('git', ['show', authorization.baseline + ':' + path], { cwd: root })
    : readFileSync(new URL(path, root));
  hashes[path] = createHash('sha256').update(bytes).digest('hex');
  originals.set(new URL(path, root).href, bytes.toString());
}
if (mode === 'baseline') registerHooks({ load(url, context, next) {
  const result = next(url, context);
  return originals.has(url) ? { ...result, source: originals.get(url) } : result;
} });
const { normalizeManualAgreement } = await import(new URL('lib/manual-agreement.ts', root));
const { enrichExtractedAgreementWithCatalog } = await import(new URL('lib/catalog-enrichment.ts', root));
const { deriveCanonicalCoverages } = await import(new URL('lib/coverage-status.ts', root));
const key = 'hus.rate.dekning';
const input = { company: 'Gjensidige', products: [{ type: 'Hus', productName: 'Hus', importantTerms: [],
  addOnIds: ['gjensidige-hus-rate-insekter'] }] };
const first = normalizeManualAgreement(input).insuranceData.insurances[0];
const second = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', insurances: [first], totalAnnualPremium: null }).insurances[0];
const view = insurance => ({ addOnIds: insurance.addOnIds, catalogReference: insurance.catalogReference,
  coverage: deriveCanonicalCoverages(insurance, 'Hus').find(c => c.id === key),
  terms: insurance.importantTerms.filter(t => t.key === key) });
console.log(JSON.stringify({ mode, baseline: authorization.baseline, production_hashes: hashes,
  input, first: view(first), repeated: view(second),
  classification: 'SEPARATE_UNRESOLVED_MANUAL_CONTINUATION_FINDING_NOT_COMPLETION',
}, null, 2));
