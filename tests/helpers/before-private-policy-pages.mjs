import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const receipt = JSON.parse(readFileSync(new URL("../../docs/audit/checkpoints/private-policy-pages-20261119/source-changes.json", import.meta.url), "utf8"));
const editsByComponent = new Map();
for (const { component, key, edits } of receipt.changes) {
  const facts = editsByComponent.get(component) ?? new Map();
  facts.set(key, edits);
  editsByComponent.set(component, facts);
}

const transportCorrection = JSON.parse(readFileSync(new URL("../../docs/audit/checkpoints/private-policy-pages-followup-20261119/source-changes.json", import.meta.url), "utf8"));
const transportChanges = new Map(transportCorrection.changes.map(change => [change.component, change]));

export function beforeTransportSourceCorrection(componentId, fact) {
  const change = transportChanges.get(componentId);
  if (!change || change.key !== fact.key) return fact;
  assert.deepEqual(fact.source, change.after, componentId);
  return { ...fact, source: structuredClone(change.before) };
}

export function beforePrivatePolicyPageFact(componentId, fact) {
  fact = beforeTransportSourceCorrection(componentId, fact);
  const edits = editsByComponent.get(componentId)?.get(fact.key);
  if (!edits) return fact;

  const restored = structuredClone(fact);
  for (const { field, property, before, after } of edits) {
    const target = property ? restored[field] : restored;
    const key = property ?? field;
    assert.deepEqual(target?.[key], after, [componentId, fact.key, field, property].filter(Boolean).join(" "));
    if (before === undefined) delete target[key];
    else target[key] = structuredClone(before);
  }
  return restored;
}

// Historical checks retain their original inputs. Only exact verified citation
// changes are reversed on this test-only view of the live catalogue.
export function beforePrivatePolicyPages(catalog) {
  const sources = { ...catalog.sources };
  for (const [id, source] of Object.entries(transportCorrection.addedSources)) {
    assert.deepEqual(sources[id], source, id);
    delete sources[id];
  }
  return {
    ...catalog,
    sources,
    facts: Object.fromEntries(Object.entries(catalog.facts).map(([componentId, facts]) => [
      componentId,
      (editsByComponent.has(componentId) || transportChanges.has(componentId)) ? facts.map(fact => beforePrivatePolicyPageFact(componentId, fact)) : facts,
    ])),
  };
}
