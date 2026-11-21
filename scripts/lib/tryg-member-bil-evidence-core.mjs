/**
 * Generates Tryg member bil evidence from tryg-catalog fact keys, with PDF-verified overrides.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { trygFacts } from "../../lib/tryg-catalog.ts";

const legacyKeyByFact = {
  "ansvar.dekning": "bil.ansvar",
  "rettshjelp.dekning": "bil.rettshjelp",
  "brann.dekning": "bil.brann",
  "glass.dekning": "bil.glass",
  "kasko.dekning": "bil.kollisjon",
  "bonus.parkert": "bil.parkeringsskade",
  "ladekabel.dekning": "bil.ladekabel",
  "maskinskade.alder": "bil.maskinskade",
};

export const productRecipes = {
  "bil-ansvar": { componentIds: ["ansvar"] },
  "bil-delkasko": { componentIds: ["ansvar", "delkasko"] },
  "bil-kasko": { componentIds: ["ansvar", "kasko"] },
  "bil-ekstra": { componentIds: ["bilEkstra"] },
  "elbil-ekstra": { componentIds: ["elbilEkstra"] },
};

export function loadPdfText(paths) {
  return Object.fromEntries(
  Object.entries(paths).map(([kind, file]) => [
      kind,
      formatAmounts(readFileSync(file, "utf8").replace(/\s+/gu, " ")),
    ]),
  );
}

function factKeyForEvidence(key, { useLegacyKeys, legacyKeyMap, productId }) {
  if (legacyKeyMap[productId]?.[key]) return legacyKeyMap[productId][key];
  if (useLegacyKeys && legacyKeyByFact[key]) return legacyKeyByFact[key];
  return key;
}

export function formatAmounts(value) {
  return value
    .replace(/\b(\d{1,3})\.(\d{3})\b/gu, "$1 $2")
    .replace(/\b(\d{1,3}) (\d{3})\.(\d{3})\b/gu, "$1 $2 $3")
    .replace(/(\d) kr\b/gu, "$1 kroner");
}

function patchFact(fact, componentId, productId, overrides) {
  const productPatch = overrides[productId]?.[fact.key] ?? {};
  const componentPatch = overrides[componentId]?.[fact.key] ?? {};
  const o = { ...componentPatch, ...productPatch };
  return o;
}

export function toEvidenceFacts({
  componentIds,
  productId,
  overrides = {},
  appended = [],
  legacyKeys = [],
  useLegacyKeys = true,
  legacyKeyMap = {},
}) {
  const mapped = componentIds.flatMap((componentId) =>
    (trygFacts[componentId] ?? []).map((fact) => {
      const o = patchFact(fact, componentId, productId, overrides);
      const evidenceKey = factKeyForEvidence(fact.key, { useLegacyKeys, legacyKeyMap, productId });
      const entry = {
        key: evidenceKey,
        label: o.label ?? fact.label,
        value: formatAmounts(o.value ?? fact.value),
        page: o.page ?? fact.source.page,
        section: o.section ?? fact.source.section,
      };
      const availability = o.coverageAvailability ?? fact.coverageAvailability;
      if (availability === "included" || availability === "unavailable") entry.coverageAvailability = availability;
      if (fact.deductibleClassification && !o.stripDeductibleClassification) {
        entry.deductibleClassification = fact.deductibleClassification;
      }
      return entry;
    }),
  );

  const byKey = new Map();
  for (const entry of mapped) {
    const existing = byKey.get(entry.key);
    if (!existing) byKey.set(entry.key, entry);
    else byKey.set(entry.key, { ...existing, ...entry });
  }
  for (const entry of appended) {
    byKey.set(entry.key, { ...byKey.get(entry.key), ...entry, value: formatAmounts(entry.value) });
  }
  for (const entry of legacyKeys.filter((row) => !byKey.has(row.key))) {
    byKey.set(entry.key, { ...entry, value: formatAmounts(entry.value) });
  }
  return [...byKey.values()];
}

export function assertInPdf(pdfText, productId, facts, overrides, componentIds) {
  const pdf = pdfText[productId];
  if (!pdf) return;
  const failures = [];
  for (const fact of facts) {
    const canonical =
      Object.entries(legacyKeyByFact).find(([, legacy]) => legacy === fact.key)?.[0] ?? fact.key;
    const patched =
      overrides[productId]?.[canonical] ??
      overrides[productId]?.[fact.key] ??
      componentIds.flatMap((id) => [overrides[id]?.[canonical], overrides[id]?.[fact.key]]).find(Boolean);
    if (!patched) continue;
    const snippet = fact.value.replace(/\s+/gu, " ").slice(0, 48).trim();
    if (snippet.length < 12) continue;
    const probe = snippet.slice(0, Math.min(24, snippet.length));
    if (!pdf.toLowerCase().includes(probe.toLowerCase())) failures.push({ key: fact.key, probe });
  }
  if (failures.length) {
    console.error(`PDF validation failed for ${productId}:`, failures);
    process.exit(1);
  }
}

/**
 * @param {object} opts
 * @param {string} opts.evidencePath
 * @param {string[]} opts.products
 * @param {Record<string, string>} opts.pdfPaths keyed by evidence product id
 * @param {object} opts.overrides keyed by component id and/or product id
 * @param {Record<string, object[]>} [opts.appendedFacts]
 * @param {Record<string, object[]>} [opts.legacyKeys]
 * @param {Record<string, number>} [opts.pages]
 * @param {boolean} [opts.useLegacyKeys]
 * @param {Record<string, Record<string, string>>} [opts.legacyKeyMap]
 */
export function generateMemberBilEvidence(opts) {
  const pdfText = loadPdfText(opts.pdfPaths);
  const evidence = JSON.parse(readFileSync(opts.evidencePath, "utf8"));
  const stats = {};

  for (const productId of opts.products) {
    const recipe = productRecipes[productId];
    if (!recipe) throw new Error(`Mangler oppskrift for ${productId}`);
    const before = evidence[productId]?.facts?.length ?? 0;
    const facts = toEvidenceFacts({
      ...recipe,
      productId,
      overrides: opts.overrides,
      appended: opts.appendedFacts?.[productId] ?? [],
      legacyKeys: opts.legacyKeys?.[productId] ?? [],
      useLegacyKeys: opts.useLegacyKeys ?? true,
      legacyKeyMap: opts.legacyKeyMap ?? {},
    });
    assertInPdf(pdfText, productId, facts, opts.overrides, recipe.componentIds);
    evidence[productId].facts = facts;
    if (opts.pages?.[productId]) evidence[productId].pages = opts.pages[productId];
    stats[productId] = { before, after: facts.length };
  }

  writeFileSync(opts.evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  return stats;
}