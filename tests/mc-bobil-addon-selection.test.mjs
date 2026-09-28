import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { productCatalog } from '../lib/product-catalog.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';

const term = (name, value, canonicalKey = null) => ({ name, value, canonicalKey });
const addOn = name => ({ name, annualPremium: null, deductible: null, importantTerms: [] });
const policy = (terms = [], additions = [], overrides = {}) => ({
  company: 'Storebrand', type: 'Bobil', productName: 'Kasko', canonicalProductName: 'Kasko',
  annualPremium: null, deductible: null, coverageSummary: null, importantTerms: terms,
  addOns: additions, ...overrides,
});
const enrich = (insurance, catalog = productCatalog) => enrichExtractedAgreementWithCatalog({
  company: insurance.company, totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear', insurances: [insurance],
}, new Date('2026-09-28'), undefined, undefined, catalog).insurances[0];
const ids = output => output.addOnIds ?? [];
const rentalClass = output => output.importantTerms.filter(f => f.key === 'leiebil.bilklasse').map(f => f.value);
const source = { documentId: 'pdf:existing:0', filename: 'synthetic', page: 1, section: 'Synthetic', termsNumber: '', effectiveFrom: '' };

for (const canonicalKey of [null, 'leiebil.dekning']) test(`exact extended rental variant selects correct component (key ${canonicalKey})`, () => {
  const out = enrich(policy([{ ...term('Utvidet leiebil', 'Valgt', canonicalKey), source }]));
  assert.deepEqual(ids(out), ['storebrand-bobil-utvidet-leiebil']);
  assert.deepEqual(rentalClass(out), ['Klasse I / Intermediate, inntil stasjonsvogn']);
  assert.equal(canonicalCoverage(out, 'Bobil', 'leiebil.dekning').status, 'selected');
  assert.ok(out.importantTerms.some(f => f.name === 'Utvidet leiebil' && f.coverageOrigin === 'document' && f.source.documentId === source.documentId));
  assert.ok(out.importantTerms.filter(f => f.key === 'leiebil.bilklasse').every(f => f.coverageOrigin === 'catalog'));
});
test('document add-on list can select exact extended variant', () => {
  assert.deepEqual(ids(enrich(policy([], [addOn('Utvidet leiebil')]))), ['storebrand-bobil-utvidet-leiebil']);
});
test('generic rental selects only the unambiguous standard component', () => {
  const out = enrich(policy([term('Leiebil', 'Valgt')]));
  assert.deepEqual(ids(out), ['storebrand-bobil-leiebil']);
  assert.deepEqual(rentalClass(out), ['Klasse C / Compact']);
});
test('named extended choice refines generic selected family without selecting both alternatives', () => {
  const out = enrich(policy([term('Leiebil', 'Valgt'), term('Utvidet leiebil', 'Valgt')]));
  assert.deepEqual(ids(out), ['storebrand-bobil-utvidet-leiebil']);
});
for (const state of ['Ikke valgt', 'Ikke dokumentert', 'Kan velges']) test(`exact extended ${state} does not activate catalog component`, () => {
  const out = enrich(policy([term('Utvidet leiebil', state)]));
  assert.deepEqual(ids(out), []);
  assert.deepEqual(rentalClass(out), []);
  assert.ok(out.importantTerms.some(f => f.name === 'Utvidet leiebil' && f.value === state));
});
test('document silence leaves every optional rental component unselected', () => {
  const out = enrich(policy());
  assert.deepEqual(ids(out), []);
  assert.equal(canonicalCoverage(out, 'Bobil', 'leiebil.dekning').status, 'unknown');
});
test('generic rental availability is not an explicit selection', () => {
  assert.deepEqual(ids(enrich(policy([term('Leiebil', 'Kan velges')]))), []);
});
test('explicit family rejection blocks named variant and add-on-list inference', () => {
  const out = enrich(policy([term('Leiebil', 'Ikke valgt'), term('Utvidet leiebil', 'Valgt')], [addOn('Utvidet leiebil')]));
  assert.deepEqual(ids(out), []);
  assert.equal(canonicalCoverage(out, 'Bobil', 'leiebil.dekning').status, 'not_selected');
  assert.deepEqual(rentalClass(out), []);
});
test('conflicting family selection remains conflict and cannot select addon', () => {
  const out = enrich(policy([term('Leiebil', 'Valgt'), term('Leiebil', 'Ikke valgt')]));
  assert.deepEqual(ids(out), []);
  assert.equal(canonicalCoverage(out, 'Bobil', 'leiebil.dekning').conflict, true);
});
test('conflicting named selection cannot silently fall back to standard variant', () => {
  const out = enrich(policy([term('Leiebil', 'Valgt'), term('Utvidet leiebil', 'Valgt'), term('Utvidet leiebil', 'Ikke valgt')]));
  assert.deepEqual(ids(out), []);
});
test('two explicitly listed alternative addons cannot select an arbitrary variant', () => {
  assert.deepEqual(ids(enrich(policy([], [addOn('Leiebil'), addOn('Utvidet leiebil')]))), []);
});
test('explicit extended rejection is not overridden by its add-on-list entry', () => {
  assert.deepEqual(ids(enrich(policy([term('Utvidet leiebil', 'Ikke valgt')], [addOn('Utvidet leiebil')]))), []);
});
test('catalog-origin add-on availability cannot select a customer addon', () => {
  assert.deepEqual(ids(enrich(policy([], [{ ...addOn('Utvidet leiebil'), id: 'storebrand-bobil-utvidet-leiebil', coverageOrigin: 'catalog' }]))), []);
});
test('unrecognized similar rental name never fuzzy-matches an addon', () => {
  assert.deepEqual(ids(enrich(policy([term('Utvidett leiebil', 'Valgt')], [addOn('Utvidett leiebil')]))), []);
});
for (const overrides of [{ type: 'MC' }, { canonicalProductName: 'Ansvar', productName: 'Ansvar' }, { agreementScope: 'synthetic-unknown' }, { company: 'Gjensidige' }]) {
  test(`named addon cannot escape applicable product (${JSON.stringify(overrides)})`, () => {
    assert.deepEqual(ids(enrich(policy([term('Utvidet leiebil', 'Valgt')], [], overrides))), []);
  });
}
for (const type of ['MC', 'Bobil']) test(`${type}: existing If optional motor selection and rejection stay intact`, () => {
  for (const [value, expected] of [['Valgt', true], ['Ikke valgt', false], ['Ikke dokumentert', false]]) {
    const out = enrich(policy([term('Motor- og girskade', value)], [], { company: 'If', type }));
    assert.equal(ids(out).includes(`if-${type.toLowerCase()}-motor-gir`), expected);
    assert.equal(out.importantTerms.some(f => f.key === 'maskinskade.egenandel' && f.coverageOrigin === 'catalog'), expected);
  }
});
test('Frende named bundled addition selects only its scoped component', () => {
  const out = enrich(policy([term('Leiebil / ferieavbrudd', 'Valgt')], [], { company: 'Frende' }));
  assert.deepEqual(ids(out), ['frende-bobil-leiebil']);
  assert.ok(out.importantTerms.some(f => f.key === 'bobil.feriegaranti.dager' && f.coverageOrigin === 'catalog'));
});
test('customer detail remains authoritative after named variant selection', () => {
  const out = enrich(policy([term('Utvidet leiebil', 'Valgt'), { ...term('Leiebil bilklasse', 'Syntetisk avtalt klasse'), source }]));
  assert.deepEqual(rentalClass(out), ['Syntetisk avtalt klasse']);
  assert.equal(out.importantTerms.find(f => f.key === 'leiebil.bilklasse').coverageOrigin, 'document');
});
const variantCatalog = (names) => ({ ...productCatalog, addOns: productCatalog.addOns.map(addition => {
  const index = ['storebrand-bobil-leiebil', 'storebrand-bobil-utvidet-leiebil'].indexOf(addition.id);
  return index < 0 ? addition : { ...addition, name: names[index] };
}) });
test('generic selection cannot choose between two distinctly named variants with no standard', () => {
  assert.deepEqual(ids(enrich(policy([term('Leiebil', 'Valgt')]), variantCatalog(['Leiebil Alternativ A', 'Leiebil Alternativ B']))), []);
});
test('exact variant selection is generic and not hardcoded to Storebrand names', () => {
  const catalog = variantCatalog(['Leiebil Alternativ A', 'Leiebil Alternativ B']);
  assert.deepEqual(ids(enrich(policy([term('Leiebil Alternativ B', 'Valgt')]), catalog)), ['storebrand-bobil-utvidet-leiebil']);
});
test('two explicit mutually exclusive variants remain ambiguous', () => {
  const catalog = variantCatalog(['Leiebil Alternativ A', 'Leiebil Alternativ B']);
  assert.deepEqual(ids(enrich(policy([term('Leiebil Alternativ A', 'Valgt'), term('Leiebil Alternativ B', 'Valgt')]), catalog)), []);
});
test('existing Bil enrichment does not activate the new MC/Bobil addon path', () => {
  assert.deepEqual(ids(enrich(policy([term('Leiebil', 'Valgt')], [], { type: 'Bil' }))), []);
});
