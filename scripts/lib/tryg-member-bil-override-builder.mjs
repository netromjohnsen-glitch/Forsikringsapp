/** Build per-key PDF overrides from tryg-catalog fact lists. */
import { trygFacts } from "../../lib/tryg-catalog.ts";

/**
 * @param {string} componentId
 * @param {{ values?: Record<string, string>, meta?: Record<string, object>, pages?: Record<string, { page: number, section: string }> }} opts
 */
export function componentOverrides(componentId, { values = {}, meta = {}, pages = {}, skipKeys = [] } = {}) {
  const skip = new Set(skipKeys);
  return Object.fromEntries(
    (trygFacts[componentId] ?? []).filter((fact) => !skip.has(fact.key)).map((fact) => {
      const page = pages[fact.key]?.page ?? fact.source.page;
      const section = pages[fact.key]?.section ?? fact.source.section;
      return [
        fact.key,
        {
          value: values[fact.key] ?? fact.value,
          page,
          section,
          ...(meta[fact.key] ?? {}),
        },
      ];
    }),
  );
}

export function mergeOverrides(...layers) {
  const out = {};
  for (const layer of layers) {
    for (const [scope, keys] of Object.entries(layer)) {
      out[scope] = { ...(out[scope] ?? {}), ...keys };
    }
  }
  return out;
}