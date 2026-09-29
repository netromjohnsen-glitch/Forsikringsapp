import assert from 'node:assert/strict';
import test from 'node:test';
import { isNonAssertingCoverageDetail } from '../lib/coverage-fact-semantics.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { findCatalogProductBySelection, resolveCatalogFacts } from '../lib/product-catalog.ts';

const source = (id) => ({ documentId: id, filename: `${id}.pdf`, termsNumber: 'synthetic',
  effectiveFrom: '', page: 1, section: 'Synthetic coverage evidence' });
const policy = (type, productName, importantTerms = [], extra = {}) => ({ type, productName,
  canonicalProductName: productName, annualPremium: null, deductible: null, coverageSummary: null,
  importantTerms, addOns: [], ...extra });
const enrich = (company, type, productName, importantTerms = []) => enrichExtractedAgreementWithCatalog({
  company, totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear',
  insurances: [policy(type, productName, importantTerms)],
}, new Date('2026-09-29')).insurances[0];
const rescueKey = 'snoscooter.redning.dekning';
const restrictionKey = 'snoscooter.redning.begrensning';
const restriction = (value, extra = {}) => ({ key: restrictionKey, name: 'Redning – begrensninger', value,
  coverageOrigin: 'document', source: source('synthetic-document'), ...extra });
const coverage = (terms, extra = {}) => canonicalCoverage(policy('Snøscooter', 'Synthetic', terms, extra),
  'Snøscooter', rescueKey);

test('non-asserting roles use exact canonical segments, not text or fuzzy matching', () => {
  for (const key of ['snoscooter.redning.begrensning', 'glass.unntak', 'reise.ulykke.begrensninger',
    'bobil.kasko.begrensning.terreng']) assert.equal(isNonAssertingCoverageDetail(key), true, key);
  for (const key of ['maskinskade.km', 'maskinskade.alder', 'leiebil.grense', 'redning.dekning',
    'redning.utenbegrensning', 'redning.begrensningstekst']) {
    assert.equal(isNonAssertingCoverageDetail(key), false, key);
  }
});

test('actual Tryg rescue limitation survives enrichment without asserting selected', () => {
  const catalogFact = resolveCatalogFacts(findCatalogProductBySelection('Tryg', 'Snøscooter', 'Kasko'), [])
    .find(fact => fact.key === restrictionKey);
  const input = { name: catalogFact.label, canonicalKey: catalogFact.key, value: catalogFact.value,
    source: source('synthetic-document') };
  const insurance = enrich('Tryg', 'Snøscooter', 'Kasko', [input]);
  const result = canonicalCoverage(insurance, 'Snøscooter', rescueKey);
  assert.equal(result.status, 'unknown');
  assert.equal(result.summary, null);
  assert.equal(result.details.find(detail => detail.key === restrictionKey).value, catalogFact.value);
  assert.equal(result.evidence.find(item => item.kind === 'restriction').origin, 'document');
  assert.equal(insurance.importantTerms.find(term => term.key === restrictionKey).coverageOrigin, 'document');
});

test('actual Tryg silent PDF remains unknown and does not acquire a limitation-only selection', () => {
  const insurance = enrich('Tryg', 'Snøscooter', 'Kasko');
  assert.equal(canonicalCoverage(insurance, 'Snøscooter', rescueKey).status, 'unknown');
  assert.equal(insurance.importantTerms.some(term => term.key === restrictionKey), false);
});

test('a synthetic Frende campingvogn restriction is equally non-asserting after enrichment', () => {
  const insurance = enrich('Frende', 'Campingvogn', 'Kasko', [{
    name: 'Redning – begrensninger', canonicalKey: 'campingvogn.redning.begrensning',
    value: 'Synthetic documented terrain limitation', source: source('synthetic-other-provider'),
  }]);
  const result = canonicalCoverage(insurance, 'Campingvogn', 'campingvogn.redning.dekning');
  assert.equal(result.status, 'unknown');
  assert.equal(result.details[0].key, 'campingvogn.redning.begrensning');
  assert.equal(result.details[0].value, 'Synthetic documented terrain limitation');
});

for (const text of ['Utgifter til redning/veihjelp er unntatt', 'Redning utenfor Norden er ikke dekket',
  'Særvilkår er inkludert i avtalen']) {
  test(`restriction prose never asserts parent selection: ${text}`, () => {
    const term = restriction(text);
    const result = coverage([term]);
    assert.equal(result.status, 'unknown');
    assert.equal(result.conflict, false);
    assert.equal(result.details[0].value, text);
    assert.deepEqual(result.details[0].sources, [term.source]);
    assert.deepEqual(result.sources, [term.source]);
    assert.equal(result.evidence[0].status, 'unknown');
    assert.equal(result.evidence[0].kind, 'restriction');
  });
}

for (const [value, status] of [['Valgt', 'selected'], ['Ikke valgt', 'not_selected'],
  ['Ikke dokumentert', 'unknown']]) {
  test(`explicit parent ${status} is not contradicted by a restriction`, () => {
    const term = restriction('Terreng er ikke dekket');
    const result = coverage([{ name: 'Redning', key: rescueKey, value }, term]);
    assert.equal(result.status, status);
    assert.equal(result.conflict, false);
    assert.equal(result.details[0].value, term.value);
    assert.deepEqual(result.details[0].sources, [term.source]);
  });
}

test('explicit PDF rejection continues to block catalog evidence after enrichment', () => {
  const insurance = enrich('Tryg', 'Snøscooter', 'Kasko', [{ name: 'Redning',
    canonicalKey: rescueKey, value: 'Ikke valgt' }]);
  assert.equal(canonicalCoverage(insurance, 'Snøscooter', rescueKey).status, 'not_selected');
  assert.equal(insurance.importantTerms.some(term => term.key === restrictionKey), false);
});

test('explicit PDF selection is preserved alongside catalog restriction evidence', () => {
  const insurance = enrich('Tryg', 'Snøscooter', 'Kasko', [{ name: 'Redning',
    canonicalKey: rescueKey, value: 'Valgt' }]);
  const result = canonicalCoverage(insurance, 'Snøscooter', rescueKey);
  assert.equal(result.status, 'selected');
  assert.equal(result.evidence.find(item => item.kind === 'explicit_status').origin, 'document');
  assert.equal(result.evidence.find(item => item.kind === 'restriction').status, 'unknown');
  assert.ok(result.details.find(detail => detail.key === restrictionKey));
});

test('document restriction X beats catalog restriction Y without losing their audit evidence', () => {
  const document = restriction('Document restriction X');
  const catalog = restriction('Catalog restriction Y', { coverageOrigin: 'catalog', source: source('synthetic-catalog') });
  for (const terms of [[document, catalog], [catalog, document]]) {
    const result = coverage(terms, { catalogSelectionConfirmed: true });
    assert.equal(result.status, 'unknown');
    assert.deepEqual(result.details.map(detail => detail.value), ['Document restriction X']);
    assert.deepEqual(result.sources, [document.source]);
    assert.equal(result.evidence.length, 2);
    assert.ok(result.evidence.some(item => item.value === 'Catalog restriction Y' && item.origin === 'catalog'));
  }
});

test('enrichment keeps document restriction X instead of the matching catalog Y', () => {
  const insurance = enrich('Tryg', 'Snøscooter', 'Kasko', [{ name: 'Redning – begrensninger',
    canonicalKey: restrictionKey, value: 'Document restriction X', source: source('synthetic-document') }]);
  assert.equal(insurance.importantTerms.filter(term => term.key === restrictionKey).length, 1);
  assert.equal(insurance.importantTerms.find(term => term.key === restrictionKey).value, 'Document restriction X');
  assert.notEqual(insurance.catalogFacts.find(fact => fact.key === restrictionKey).value, 'Document restriction X');
  assert.equal(canonicalCoverage(insurance, 'Snøscooter', rescueKey).details[0].value, 'Document restriction X');
});

test('unconfirmed catalog restrictions remain evidence, not effective customer details', () => {
  const result = coverage([restriction('Catalog restriction', { coverageOrigin: 'catalog' })]);
  assert.equal(result.status, 'unknown');
  assert.equal(result.details.length, 0);
  assert.equal(result.evidence[0].kind, 'catalog_definition');
  assert.equal(result.evidence[0].value, 'Catalog restriction');
});

test('undocumented restriction placeholders do not become effective details', () => {
  const result = coverage([restriction('Ikke dokumentert')]);
  assert.equal(result.status, 'unknown');
  assert.equal(result.details.length, 0);
  assert.equal(result.evidence.length, 1);
});

test('documented age and mileage details still establish selected machine coverage', () => {
  const result = canonicalCoverage(policy('Bil', 'Synthetic', [
    { key: 'maskinskade.alder', name: 'Maskinskade – alder', value: '12 år' },
    { key: 'maskinskade.km', name: 'Maskinskade – kilometer', value: '180 000 km' },
  ]), 'Bil', 'maskinskade.dekning');
  assert.equal(result.status, 'selected');
  assert.deepEqual(result.details.map(detail => detail.key), ['maskinskade.alder', 'maskinskade.km']);
});

test('a documented sum remains positive detail evidence with a separate restriction', () => {
  const result = coverage([{ key: 'snoscooter.redning.grense', name: 'Redning – forsikringssum',
    value: '17 000 kr', coverageOrigin: 'document' }, restriction('Terreng er ikke dekket')]);
  assert.equal(result.status, 'selected');
  assert.equal(result.details.length, 2);
  assert.equal(result.evidence.find(item => item.kind === 'detail').status, 'selected');
  assert.equal(result.evidence.find(item => item.kind === 'restriction').status, 'unknown');
});

test('manual catalog registration cannot select rescue from limitation alone', () => {
  const manual = normalizeManualAgreement({ company: 'Tryg', totalAnnualPremium: '', products: [{
    type: 'Snøscooter', productName: 'Kasko', annualPremium: '', deductible: '', coverageSummary: '',
    importantTerms: [], addOnIds: [],
  }] });
  const result = canonicalCoverage(manual.insuranceData.insurances[0], 'Snøscooter', rescueKey);
  assert.equal(result.status, 'unknown');
  assert.ok(result.details.some(detail => detail.key === restrictionKey));
  assert.ok(result.sources.some(item => item.documentId === 'vehicle:tryg-IPID-Snoscooter.pdf'));
});

test('manual explicit optional choice remains selected', () => {
  const manual = normalizeManualAgreement({ company: 'Tryg', totalAnnualPremium: '', products: [{
    type: 'Snøscooter', productName: 'Kasko', annualPremium: '', deductible: '', coverageSummary: '',
    importantTerms: [], addOnIds: ['tryg-snoscooter-forerulykke'],
  }] });
  assert.equal(canonicalCoverage(manual.insuranceData.insurances[0], 'Snøscooter',
    'snoscooter.forerulykke.dekning').status, 'selected');
});
