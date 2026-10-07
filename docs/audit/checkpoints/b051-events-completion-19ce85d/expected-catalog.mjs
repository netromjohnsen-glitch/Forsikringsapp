import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
export const baselineCatalog = JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz', import.meta.url))));
export const sourceOracle = JSON.parse(readFileSync(new URL('source-oracle.json', import.meta.url)));
export const expectedCatalog = structuredClone(baselineCatalog);
for (const [key, o] of Object.entries(sourceOracle)) {
  const rows = expectedCatalog.facts[o.owner].filter(f => f.key === key);
  assert.equal(rows.length, 1);
  const f = rows[0];
  assert.equal(f.label, o.label);
  assert.equal(f.value, o.previous_value);
  assert.deepEqual([f.source.page, f.source.section], o.previous_primary);
  assert.equal(Object.hasOwn(f, 'qualificationSource'), false);
  f.value = o.value;
  f.source.page = o.primary[0];
  f.source.section = o.primary[1];
  if (o.qualification) f.qualificationSource = { ...f.source, page: o.qualification[0], section: o.qualification[1] };
}
