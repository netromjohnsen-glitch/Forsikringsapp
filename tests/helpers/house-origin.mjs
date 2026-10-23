import assert from 'node:assert/strict';

// Exact authorized delta for historical manual snapshots. Both arguments come
// from frozen before evidence, never from the implementation under test.
export function withHouseCatalogOrigin(beforeRepeat, frozenFirst) {
  const expected = structuredClone(beforeRepeat), reference = frozenFirst.catalogReference;
  if (reference?.providerId !== 'gjensidige' || !['gjensidige-hus','gjensidige-hus-pluss'].includes(reference.productId) ||
      reference.version !== 'Alminnelige vilkår' || (reference.agreementScope ?? 'ordinary') !== 'ordinary') return expected;
  assert.ok(frozenFirst.importantTerms.every(t=>t.coverageOrigin==='catalog'));
  const core = terms=>terms.map(t=>JSON.stringify([t.key,t.name,t.value,t.source,t.sources])).sort();
  assert.deepEqual(core(expected.importantTerms),core(frozenFirst.importantTerms), 'Only origin/metadata/order may change; every value and full source must already match');
  expected.importantTerms=expected.importantTerms.map(t=>structuredClone(frozenFirst.importantTerms.find(f=>f.key===t.key&&f.name===t.name&&f.value===t.value)));
  assert.equal(new Set(expected.importantTerms.map(t=>t.key)).size,expected.importantTerms.length);
  const rank=t=>expected.catalogFacts.findIndex(f=>f.key===t.key);
  assert.ok(expected.importantTerms.every(t=>rank(t)>=0));
  expected.importantTerms.sort((a,b)=>rank(a)-rank(b));
  return expected;
}
