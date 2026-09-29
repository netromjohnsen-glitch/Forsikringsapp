import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { compareCatalogProducts, productComparisonProducts } from '../lib/catalog-product-comparison.ts';
import { catalogDisplayLabel, catalogDisplayValue, productComparisonView } from '../lib/product-comparison-presentation.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { traceCoverages, sanitizeTraceEvent } from '../lib/production-trace.ts';

const products = productComparisonProducts();
const find = (type, company, name) => {
  const product = products.find(p => p.insuranceType === type && p.company === company && p.name === name);
  assert.ok(product, `${type}/${company}/${name}`);
  return product;
};
const rows = result => result.sections.flatMap(s => s.rows);
const displayRows = result => productComparisonView(result).flatMap(s => s.groups).flatMap(g => g.rows);
const facts = (view, side) => view.flatMap(s => s.groups).flatMap(g => [
  ...g.rows.flatMap(r => r[side].facts), ...g.models.flatMap(m => m[side]), ...g.details[side],
]);
const require = createRequire(import.meta.url);
const ui = fs.readFileSync(new URL('../app/components/product-comparison.tsx', import.meta.url), 'utf8');
let js = ts.transpileModule(ui + '\nexport { ProductResult };', {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
js = js.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_m, spec) => `from ${JSON.stringify(
  spec.startsWith('@/') ? pathToFileURL(path.resolve(spec.slice(2) + '.ts')).href : pathToFileURL(require.resolve(spec)).href,
)}`);
const { ProductResult } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const render = result => renderToStaticMarkup(React.createElement(ProductResult, { result }));

test('Tryg Kasko rescue restriction renders as the documented restriction, not included coverage', () => {
  const result = compareCatalogProducts(find('Snøscooter', 'Tryg', 'Kasko'), find('Snøscooter', 'If', 'Kasko'));
  const row = rows(result).find(r => r.key === 'snoscooter.redning.begrensning');
  assert.equal(row.first.text, 'Utgifter til redning/veihjelp er unntatt');
  assert.equal(row.first.facts[0].role, 'term');
  assert.equal(row.first.sources[0].section, 'Begrensninger – Kasko');
  assert.doesNotMatch(row.first.text, /Inkludert|Valgt/u);
  assert.ok(render(result).includes(row.first.text));
});

for (const level of ['Utvidet', 'Super']) test(`If Hus ${level}: covered consequence and excluded defect coexist without contradictory status`, () => {
  const result = compareCatalogProducts(find('Hus', 'If', level), find('Hus', 'Storebrand', 'Standard'));
  const row = rows(result).find(r => r.key === 'hus.takvegg.folgeskade');
  assert.equal(row.first.state, 'included');
  assert.equal(row.first.facts[0].role, 'coverage');
  assert.match(row.first.text, /^✓ Inkludert/u);
  assert.match(row.first.text, /Selve utettheten er ikke dekket/u);
  assert.equal(row.first.sources[0].documentId, 'ifHusTerms');
  assert.equal(row.first.sources[0].page, 8);
  assert.equal(row.second.state, 'unavailable');
  assert.match(row.second.text, /Ikke omfattet på Standard/u);
});

function synthetic(providerId = 'frende', type = 'Campingvogn') {
  const source = { documentId: 'synthetic-scope', filename: 'synthetic.pdf', termsNumber: 'TEST',
    page: 1, section: '1', effectiveFrom: '2099-01-01', agreementScope: 'ordinary' };
  const product = { company: providerId, providerId, insuranceType: type, productId: 'synthetic-level',
    name: 'Synthetic level', version: '2099', agreementScope: 'ordinary', componentIds: ['synthetic-component'] };
  const catalog = { companies: [providerId], insuranceTypes: [type], products: [product], addOns: [],
    sources: { 'synthetic-scope': { id: 'synthetic-scope', ...source } }, facts: { 'synthetic-component': [
      { key: 'campingvogn.vann.folgeskade', label: 'Følgeskade', value: 'Følgeskaden omfattes. Selve feilen er ikke dekket.',
        coverageAvailability: 'included', source },
      { key: 'campingvogn.vann.begrensning', label: 'Begrensning', value: 'Reparasjon av feil er unntatt', source },
    ] } };
  return { product, catalog };
}

for (const provider of ['frende', 'gjensidige']) test(`${provider}: explicit source-backed subject metadata is generic, not an If patch`, () => {
  const { product, catalog } = synthetic(provider);
  const result = compareCatalogProducts(product, product, catalog);
  const consequence = rows(result).find(r => r.key.endsWith('.folgeskade'));
  const restriction = rows(result).find(r => r.key.endsWith('.begrensning'));
  assert.equal(consequence.first.state, 'included');
  assert.match(consequence.first.text, /^✓ Inkludert/u);
  assert.equal(restriction.first.text, 'Reparasjon av feil er unntatt');
  assert.equal(result.differenceCount, 0);
});

for (const concept of ['forerulykke', 'ulykke']) test(`Tryg ${concept} remains optional in product presentation, never customer selected`, () => {
  const product = find('Snøscooter', 'Tryg', 'Kasko');
  const result = compareCatalogProducts(product, product);
  const row = rows(result).find(r => r.key === `snoscooter.${concept}.dekning`);
  assert.equal(row.first.state, 'optional');
  assert.match(row.first.text, /^Tilgjengelig som tillegg/u);
  assert.doesNotMatch(row.first.text, /Inkludert i produktnivået|✓ Valgt/u);
  assert.deepEqual(row.first, row.second);
});

const scenarios = [
  ['Bil', 'If', 'Super', 'Frende', 'Utvidet'], ['Hus', 'Tryg', 'Hus Ekstra', 'If', 'Super'],
  ['Innbo', 'Tryg', 'Innbo Ekstra', 'If', 'Super'], ['Reise', 'Tryg', 'Reise Ekstra', 'If', 'Super'],
  ['Snøscooter', 'Tryg', 'Kasko', 'If', 'Kasko'], ['Campingvogn', 'Tryg', 'Campingvogn Ekstra', 'If', 'Super'],
  ['Tilhenger', 'Tryg', 'Kasko', 'If', 'Kasko'], ['MC', 'Tryg', 'MC Ekstra', 'If', 'Kasko'],
  ['Bobil', 'Tryg', 'Bobil Ekstra', 'If', 'Super'],
];
for (const [type, ac, an, bc, bn] of scenarios) test(`${type}: only exactly duplicate headings suppressed; every fact, source and side survives`, () => {
  const result = compareCatalogProducts(find(type, ac, an), find(type, bc, bn));
  const before = JSON.stringify(result);
  const view = productComparisonView(result);
  for (const section of view) for (const group of section.groups) {
    assert.equal(group.showHeading, group.label !== section.label);
    const lead = group.rows.find(r => !r.first.parentLabel && !r.second.parentLabel && /\.(?:dekning|alder|km)$/u.test(r.key));
    for (const row of group.rows) {
      const hidden = group.hiddenRowLabels.includes(row.key);
      if (hidden) {
        assert.ok(row.label === group.label || (!group.showHeading && row.label === section.label));
        assert.equal(row.first.parentLabel, undefined);
        assert.equal(row.second.parentLabel, undefined);
      }
      if (lead && group.rows[0] === lead && row !== lead) assert.equal(hidden, false);
    }
  }
  for (const side of ['first', 'second']) for (const fact of rows(result).flatMap(r => r[side].facts)) {
    assert.ok(facts(view, side).some(f => JSON.stringify(f) === JSON.stringify(fact)), fact.key);
  }
  const swap = compareCatalogProducts(result.second.product, result.first.product);
  for (const row of displayRows(result)) {
    const swapped = displayRows(swap).find(r => r.key === row.key);
    assert.deepEqual(row.first, swapped.second);
    assert.deepEqual(row.second, swapped.first);
  }
  render(result);
  assert.equal(JSON.stringify(result), before);
});

test('rendered Kasko hierarchy contains one Kasko heading while preserving product cells and source controls', () => {
  const product = find('Snøscooter', 'Tryg', 'Kasko');
  const html = render(compareCatalogProducts(product, product));
  assert.equal((html.match(/<h[456][^>]*>Kasko<\/h[456]>/gu) ?? []).length, 1);
  assert.doesNotMatch(html, /<p class="mb-2 text-sm font-medium text-slate-800">Kasko<\/p>/u);
  assert.match(html, /Produkt A/u); assert.match(html, /Produkt B/u); assert.match(html, /Vis kilde/u);
});

test('a repeated label separated from its group heading by other facts remains visible', () => {
  const result = compareCatalogProducts(find('Hus', 'If', 'Super'), find('Hus', 'Storebrand', 'Standard'));
  const group = productComparisonView(result).flatMap(s => s.groups).find(g => g.label === 'Prisstigning etter skade');
  assert.ok(group.rows.length > 1);
  const priceIncrease = group.rows.find(r => r.label === group.label);
  assert.ok(priceIncrease);
  assert.notEqual(group.rows[0], priceIncrease);
  assert.equal(group.hiddenRowLabels.includes(priceIncrease.key), false);
  assert.match(render(result), /<p class="mb-2 text-sm font-medium text-slate-800">Prisstigning etter skade<\/p>/u);
});

for (const [part, label] of [['geografi', 'Geografisk område'], ['sesong', 'Sesong / sesongvilkår'],
  ['egenandel', 'Egenandel'], ['forsikringssum', 'Forsikringssum']]) test(`human label ${part} leaves canonical identity intact`, () => {
  const fact = { key: `snoscooter.avtale.${part}`, label: `avtale – ${part}` };
  const before = JSON.stringify(fact);
  assert.equal(catalogDisplayLabel(fact), label);
  assert.equal(JSON.stringify(fact), before);
  assert.equal(catalogDisplayLabel({ key: `snoscooter.avtale.${part}.custom`, label: 'Original' }), 'Original');
});

test('unqualified policy references are clarified without manufacturing a deductible or amount', () => {
  for (const key of ['kasko.egenandel', 'snoscooter.avtale.forsikringssum', 'innbo.forsikringssum.sum']) {
    const fact = { key, value: 'Fremgår av forsikringsbeviset' };
    assert.equal(catalogDisplayValue(fact), 'Individuelt avtalt. Fremgår av forsikringsbeviset');
    assert.equal(fact.value, 'Fremgår av forsikringsbeviset');
  }
});
test('fixed, conditional, minimum and ambiguous references remain completely verbatim', () => {
  for (const value of ['6 000 kr', 'Avtalt egenandel, minst 6 000 kr', 'Fremgår av forsikringsbeviset ved utleie',
    'Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret', 'Fremgår av forsikringsbeviset; 100 000 kr ved brann']) {
    assert.equal(catalogDisplayValue({ key: 'kasko.egenandel', value }), value);
  }
  assert.equal(catalogDisplayValue({ key: 'kasko.dekning', value: 'Fremgår av forsikringsbeviset' }), 'Fremgår av forsikringsbeviset');
});
test('real customer-specific reference preserves original catalog source and raw value', () => {
  const result = compareCatalogProducts(find('Bil', 'Frende', 'Kasko'), find('Bil', 'If', 'Kasko'));
  const original = rows(result).find(r => r.key === 'kasko.egenandel').first;
  const displayed = displayRows(result).find(r => r.key === 'kasko.egenandel').first;
  assert.match(displayed.text, /Individuelt avtalt/u);
  assert.ok(displayed.text.includes(original.facts[0].value));
  assert.deepEqual(displayed.facts, original.facts);
  assert.deepEqual(displayed.sources, original.sources);
});

test('true unknowns and asymmetric provider details remain conservative', () => {
  const result = compareCatalogProducts(find('Bil', 'If', 'Super'), find('Bil', 'Frende', 'Utvidet'));
  const view = productComparisonView(result);
  const age = displayRows(result).find(r => r.key === 'maskinskade.alder');
  assert.equal(age.first.state, 'unknown');
  assert.equal(age.first.text, 'Ikke dokumentert i kataloggrunnlaget');
  const group = view.flatMap(s => s.groups).find(g => g.id === 'maskinskade');
  assert.ok(group.details.first.some(f => f.key === 'maskinskade.fossil'));
  assert.equal(group.details.second.length, 0);
});

test('new restriction evidence stays within existing privacy-safe trace vocabulary', () => {
  for (const selected of [false, true]) {
    const record = { type: 'Bil', importantTerms: [
      { key: 'maskinskade.egenandel.begrensning', name: 'Maskinskade – egenandelsbegrensning', value: 'synthetic private restriction', coverageOrigin: 'document' },
      ...(selected ? [{ key: 'maskinskade.dekning', name: 'Maskinskade', value: 'Valgt', coverageOrigin: 'document' }] : []),
    ] };
    assert.ok(canonicalCoverage(record, 'Bil', 'maskinskade.dekning').evidence.some(e => e.kind === 'restriction'));
    const coverages = traceCoverages(record);
    const machine = coverages.find(c => c.key === 'maskinskade.dekning');
    assert.equal(machine.status, selected ? 'selected' : 'unknown');
    assert.equal(machine.reason, selected ? 'explicit_status' : 'NO_EVIDENCE');
    assert.ok(sanitizeTraceEvent({ stage: 'coverage', coverages }));
    assert.doesNotMatch(JSON.stringify(coverages), /synthetic private restriction|maskinskade.egenandel.begrensning/u);
  }
});
