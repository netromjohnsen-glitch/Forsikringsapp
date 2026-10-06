import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { productCatalog, resolveCatalogFacts } from '../../../../lib/product-catalog.ts';

const dir = new URL('./', import.meta.url);
const before = JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz', dir))));
const actual = JSON.parse(JSON.stringify(productCatalog));
// Source-reviewed expectations recorded before production edits, never read from the candidate.
const oracle = JSON.parse(readFileSync(new URL('source-oracle.json', dir)));
const expected = structuredClone(before);
const changes = [];
for (const [key, o] of Object.entries(oracle)) {
  const rows = expected.facts[o.owner].filter(f => f.key === key);
  assert.equal(rows.length, 1, key);
  const f = rows[0], original = structuredClone(f);
  assert.equal(f.label, o.label);
  assert.deepEqual([f.source.page, f.source.section], o.previous_primary);
  assert.equal(Object.hasOwn(f, 'qualificationSource'), false);
  f.value = o.value;
  f.source.page = o.primary[0];
  f.qualificationSource = { ...f.source, page: o.qualification[0], section: o.qualification[1] };
  const candidate = actual.facts[o.owner].filter(f => f.key === key);
  assert.equal(candidate.length, 1);
  assert.deepEqual(candidate[0], f, key);
  changes.push({ owner: o.owner, key, before: original, after: f,
    changed_fields: Object.keys(f).filter(k => JSON.stringify(f[k]) !== JSON.stringify(original[k])) });
}
assert.deepEqual(actual, expected, 'Every field, row/order/component and metadata must equal the independent two-row transformation');
const protectedRows = c => Object.entries(c.facts).flatMap(([owner, rows]) =>
  rows.filter(f => owner !== 'gjensidigeHusStandard' || !Object.hasOwn(oracle, f.key)));
assert.equal(Object.keys(actual.facts).length, 318);
assert.equal(protectedRows(actual).length, 4156);
assert.deepEqual(protectedRows(actual), protectedRows(before));
const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fingerprints = [];
for (const [id, addons] of [['gjensidige-hus', []], ['gjensidige-hus', ['gjensidige-hus-rate-insekter']], ['gjensidige-hus-pluss', []]]) {
  const product = productCatalog.products.find(p => p.productId === id);
  const date = new Date('2026-09-29T10:52:14.812Z');
  const old = resolveCatalogFacts(before.products.find(p => p.productId === id), addons, date, null, before);
  const current = resolveCatalogFacts(product, addons, date);
  const other = rows => rows.filter(f => !Object.hasOwn(oracle, f.key));
  assert.deepEqual(JSON.parse(JSON.stringify(other(current))), other(old));
  const pestFilter = rows => rows.filter(f => !f.key.startsWith('hus.skadedyr.') && f.key !== 'hus.rate.dekning');
  fingerprints.push({ product: id, addons, before: digest(pestFilter(old)), after: digest(pestFilter(current)),
    authorized_effective_delta: Object.keys(oracle) });
}
// Provider/product isolation through actual effective-fact resolution, not just raw rows.
for (const p of productCatalog.products.filter(p => !['gjensidige-hus', 'gjensidige-hus-pluss'].includes(p.productId))) {
  const date = new Date('2026-10-06T12:00:00Z');
  assert.deepEqual(JSON.parse(JSON.stringify(resolveCatalogFacts(p, [], date))),
    resolveCatalogFacts(before.products.find(b => b.productId === p.productId), [], date, null, before), p.productId);
}
const report = { status: 'PASS', baseline_revision: '64dd3cb12116c725b600e53af7da1f13fa9cf3bf',
  catalog_components: 318, entirely_unchanged_components: 317, protected_raw_facts: 4156,
  all_metadata_unchanged: true, old_six_B051_and_B020_pest_facts_unchanged: true, changes, fingerprints };
if (process.argv.includes('--write')) writeFileSync(new URL('catalog-delta.json', dir), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, changes: changes.map(c => ({ key: c.key, changed_fields: c.changed_fields })) }, null, 2));
