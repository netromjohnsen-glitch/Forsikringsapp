import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExtractionResponse, sanitizeAnalysisDocumentForClient } from '../lib/analysis-output.ts';
import { includePdfAddOnTerms } from '../lib/pdf-addons.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { groupAddOnNames, groupInsurances } from '../lib/comparison.ts';
import { pdfAddonSelection } from './helpers/pdf-addon-selection.mjs';
function pipeline(options) {
  const extracted = parseExtractionResponse({ status: 'completed', output_text: JSON.stringify(pdfAddonSelection(options)) });
  const enriched = enrichExtractedAgreementWithCatalog({ ...extracted, insurances: extracted.insurances.map(includePdfAddOnTerms) }, new Date('2026-09-23'));
  // API JSON serialization + client sanitizer, then the same grouping and row selector as page.tsx.
  const client = JSON.parse(JSON.stringify(sanitizeAnalysisDocumentForClient({ source: 'pdf', insuranceData: enriched })));
  const insurance = client.insuranceData.insurances[0];
  const group = groupInsurances([insurance], [], null)[0];
  return { insurance, value: groupAddOnNames(group.first, group.key) };
}
const fact = (name, canonicalKey, value) => ({ name, canonicalKey, value });
const addon = { name: 'Leiebil', annualPremium: null, deductible: null, importantTerms: [] };
test('PDF details produce selected effective addons even without addOns or explicit status wording', () => {
  const { insurance, value } = pipeline();
  assert.deepEqual(insurance.addOns, []);
  for (const id of ['leiebil.dekning', 'maskinskade.dekning']) {
    const coverage = canonicalCoverage(insurance, 'Bil', id);
    assert.equal(coverage.status, 'selected');
    assert.ok(coverage.evidence.some((e) => e.origin === 'document' && e.kind === 'detail'));
    assert.ok(!coverage.evidence.some((e) => e.origin === 'document' && e.kind === 'explicit_status'));
  }
  assert.equal(value, 'Leiebil · Maskinskade');
});
test('document main_value is also an effective selection, without literal Valgt', () => {
  assert.equal(pipeline({ importantTerms: [fact('Leiebil', 'leiebil.dekning', 'Erstatningsbil ved verkstedreparasjon')] }).value, 'Leiebil');
});
test('explicit document rejection wins over details and addon entry', () => {
  assert.equal(pipeline({ productName: 'Kasko', addOns: [addon], importantTerms: [
    fact('Leiebil', 'leiebil.dekning', 'Ikke valgt'), fact('Leiebil ved reparasjon', 'leiebil.dager', '60 dager'),
  ] }).value, null);
});
test('unknown addon status is not a chosen addon', () => {
  assert.equal(pipeline({ importantTerms: [fact('Leiebil', 'leiebil.dekning', 'Ikke dokumentert')] }).value, null);
});
test('catalog availability without any document coverage does not select addons', () => {
  assert.equal(pipeline({ importantTerms: [] }).value, null);
});
test('selected standard coverages do not acquire addon role', () => {
  assert.equal(pipeline({ productName: 'Kasko', importantTerms: ['Ansvar', 'Rettshjelp', 'Ulykke', 'Brann', 'Tyveri', 'Glass', 'Veihjelp', 'Bilnøkkel', 'Ladekabel', 'Fastmontert ekstrautstyr', 'Løsøre'].map((name) => fact(name, null, 'Valgt')) }).value, null);
});
test('explicit document addon entry is preserved', () => {
  assert.equal(pipeline({ addOns: [addon], importantTerms: [] }).value, 'Leiebil');
});
test('explicit addon and effective detail evidence deduplicate by canonical identity', () => {
  assert.equal(pipeline({ addOns: [addon] }).value, 'Leiebil · Maskinskade');
});
test('distinct canonical addon IDs both survive', () => {
  assert.equal(pipeline({ importantTerms: [fact('Leiebil', 'leiebil.dekning', 'Valgt'), fact('Maskinskade', 'maskinskade.dekning', 'Valgt')] }).value, 'Leiebil · Maskinskade');
});
test('empty catalog-linked selection retains existing missing-row behavior', () => {
  const { insurance, value } = pipeline({ importantTerms: [], productName: 'Kasko' });
  assert.ok(insurance.catalogReference);
  assert.equal(value ?? (insurance.catalogReference ? 'Ingen tillegg valgt' : 'Ikke dokumentert'), 'Ingen tillegg valgt');
});
test('Tryg uses the same PDF detail selection path', () => {
  const { insurance, value } = pipeline({ company: 'Tryg', productName: 'Kasko' });
  assert.equal(insurance.catalogReference.providerId, 'tryg');
  assert.equal(value, 'Leiebil · Maskinskade');
});
test('catalog selected evidence without document selection is insufficient', () => {
  const { insurance } = pipeline({ importantTerms: [] });
  insurance.importantTerms.push({ name: 'Leiebil', key: 'leiebil.dekning', value: 'Valgt', coverageOrigin: 'catalog' });
  assert.equal(canonicalCoverage(insurance, 'Bil', 'leiebil.dekning').status, 'selected');
  assert.equal(groupAddOnNames([insurance], 'Bil'), null);
});
