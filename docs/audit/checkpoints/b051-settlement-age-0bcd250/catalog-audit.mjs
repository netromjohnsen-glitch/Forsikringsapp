import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { productCatalog, resolveCatalogFacts } from '../../../../lib/product-catalog.ts';
import { baselineCatalog, expectedCatalog, sourceOracle } from './expected-catalog.mjs';

assert.deepEqual(productCatalog, expectedCatalog, 'Exact independent eight-row transform, including own undefined fields');
const keys = Object.keys(sourceOracle);
const protectedRows = c => Object.entries(c.facts).flatMap(([owner, rows]) =>
  rows.filter(f => owner !== 'gjensidigeHusStandard' || !keys.includes(f.key)));
assert.equal(Object.keys(productCatalog.facts).length, 318);
assert.equal(protectedRows(productCatalog).length, 4150);
assert.deepEqual(protectedRows(productCatalog), protectedRows(baselineCatalog));
assert.equal(Object.entries(productCatalog.facts).filter(([owner, rows]) =>
  JSON.stringify(rows) !== JSON.stringify(baselineCatalog.facts[owner])).length, 1);
const otherProducts = productCatalog.products.filter(p => !['gjensidige-hus','gjensidige-hus-pluss'].includes(p.productId));
assert.equal(otherProducts.length, 202);
for (const p of otherProducts) {
  const date = new Date('2026-10-07T12:00:00Z');
  assert.deepEqual(resolveCatalogFacts(p, [], date),
    resolveCatalogFacts(baselineCatalog.products.find(b => b.productId === p.productId), [], date, null, baselineCatalog), p.productId);
}
const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fingerprints = [];
for (const [id, addons] of [['gjensidige-hus', []], ['gjensidige-hus', ['gjensidige-hus-rate-insekter']], ['gjensidige-hus-pluss', []]]) {
  const date = new Date('2026-09-29T10:52:14.812Z');
  const before = resolveCatalogFacts(baselineCatalog.products.find(p => p.productId === id), addons, date, null, baselineCatalog);
  const after = resolveCatalogFacts(productCatalog.products.find(p => p.productId === id), addons, date);
  const protectedFacts = rows => rows.filter(f => !keys.includes(f.key));
  assert.deepEqual(protectedFacts(after), protectedFacts(before));
  const pests = rows => rows.filter(f => !f.key.startsWith('hus.skadedyr.') && f.key !== 'hus.rate.dekning');
  fingerprints.push({ product: id, addons, before: digest(pests(before)), after: digest(pests(after)) });
}
const changes = keys.map(key => ({ owner: 'gjensidigeHusStandard', key,
  before: baselineCatalog.facts.gjensidigeHusStandard.find(f => f.key === key),
  after: expectedCatalog.facts.gjensidigeHusStandard.find(f => f.key === key) }));
const report = { status: 'PASS', baseline_revision: '0bcd250944853607a01066c2c9566bed0c7118af',
  catalog_components: 318, entirely_unchanged_components: 317, protected_raw_facts: 4150,
  other_products_unchanged: 202, all_metadata_unchanged: true,
  previous_18_B051_and_B020_pests_unchanged: true, changes, fingerprints };
if (process.argv.includes('--write')) writeFileSync(new URL('catalog-delta.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, changes: changes.map(c => ({ owner: c.owner, key: c.key })) }, null, 2));
