import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

// Independent committed-baseline capture made before implementation. Restore
// own undefined fields explicitly; JSON alone cannot preserve this contract.
export const baselineCatalog = JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz', import.meta.url))));
for (const path of JSON.parse(gunzipSync(readFileSync(new URL('baseline-undefined-paths.json.gz', import.meta.url))))) {
  let object = baselineCatalog;
  for (const key of path.slice(0, -1)) object = object[key];
  object[path.at(-1)] = undefined;
}
export const sourceOracle = JSON.parse(readFileSync(new URL('source-oracle.json', import.meta.url)));
export const reference = (id, page, section) => {
  const s = baselineCatalog.sources[id];
  return { documentId: s.id, filename: s.filename, termsNumber: s.termsNumber,
    effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, section, page,
    version: s.version, productCode: s.productCode };
};
export function transformCraftRows(rows, owner) {
  const changes = Object.entries(sourceOracle).filter(([, o]) => o.owner === owner);
  for (const [key] of changes) assert.equal(rows.filter(f => f.key === key).length, 1);
  return rows.map(f => {
    const o = changes.find(([key]) => key === f.key)?.[1];
    if (!o) return f;
    assert.equal(f.label, o.label);
    assert.equal(f.value, o.previous_value);
    assert.deepEqual([f.source.page, f.source.section], o.previous_primary);
    assert.equal(f.replacesBase, true);
    assert.equal(Object.hasOwn(f, 'qualificationSource'), false);
    // The independent baseline row identifies its representation: raw refs
    // own productCode even when undefined; retained JSON snapshots omit it.
    // Transform only this new reference field, never the compared snapshots.
    const rawReference = o.qualification ? reference(...o.qualification) : null;
    const qualificationSource = rawReference && !Object.hasOwn(f.source, 'productCode')
      && rawReference.productCode === undefined
      ? { documentId: rawReference.documentId, filename: rawReference.filename,
        termsNumber: rawReference.termsNumber, effectiveFrom: rawReference.effectiveFrom,
        company: rawReference.company, url: rawReference.url, section: rawReference.section,
        page: rawReference.page, version: rawReference.version }
      : rawReference;
    return { ...f, value: o.value, source: { ...f.source, page: o.primary[0], section: o.primary[1] },
      ...(o.qualification ? { qualificationSource } : {}) };
  });
}
export function applyCraftsmanship(catalog) {
  const expected = structuredClone(catalog);
  expected.facts.gjensidigeHusPluss = transformCraftRows(expected.facts.gjensidigeHusPluss, 'gjensidigeHusPluss');
  return expected;
}
export const expectedCatalog = applyCraftsmanship(baselineCatalog);
