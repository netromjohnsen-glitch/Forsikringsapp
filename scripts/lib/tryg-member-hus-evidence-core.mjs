/**
 * Shared helpers for generating Tryg member hus / hus-ekstra evidence from tryg-hus-catalog
 * keys with PDF-verified overrides.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { trygHusFacts } from "../../lib/tryg-hus-catalog.ts";

export const dropPrefixes = ["hus.sikkerhet.", "hus.avtale.", "hus.geografi", "hus.bygninger.tilbehor"];
export const dropKeys = new Set([
  "hus.naturskade.egenandel",
  "hus.naturskade.hage",
  "hus.naturskade.relokalisering",
  "hus.rettshjelp.grense",
  "hus.rettshjelp.egenandel",
]);

export function loadPdfText(paths) {
  return {
    standard: readFileSync(paths.standard, "utf8").replace(/\s+/gu, " "),
    extra: readFileSync(paths.extra, "utf8").replace(/\s+/gu, " "),
  };
}

export function toEvidence(facts, kind, { overrides, appendedReferenceFacts, legacyKeys }) {
  const patch = overrides[kind] ?? {};
  const mapped = facts.map(({ key, label, value, source, coverageAvailability }) => {
    const o = patch[key] ?? {};
    const entry = {
      key,
      label: o.label ?? label,
      value: o.value ?? value,
      page: o.page ?? source.page,
      section: o.section ?? source.section,
    };
    const availability = o.coverageAvailability ?? coverageAvailability;
    if (availability === "included" || availability === "unavailable") entry.coverageAvailability = availability;
    return entry;
  });
  const byKey = new Map(mapped.map((entry) => [entry.key, entry]));
  for (const entry of appendedReferenceFacts[kind] ?? []) {
    byKey.set(entry.key, { ...byKey.get(entry.key), ...entry });
  }
  return [...byKey.values(), ...(legacyKeys[kind] ?? []).filter((entry) => !byKey.has(entry.key))];
}

export function assertInPdf(pdfText, kind, facts, overrides, extraValidateKeys = []) {
  const pdf = pdfText[kind];
  const patch = overrides[kind] ?? {};
  const failures = [];
  for (const fact of facts) {
    if (!patch[fact.key] && !extraValidateKeys.includes(fact.key)) continue;
    const snippet = fact.value.replace(/\s+/gu, " ").slice(0, 48).trim();
    if (snippet.length < 18) continue;
    const probe = snippet.slice(0, Math.min(20, snippet.length));
    if (!pdf.toLowerCase().includes(probe.toLowerCase())) failures.push({ key: fact.key, probe });
  }
  if (failures.length) {
    console.error(`PDF validation failed for ${kind}:`, failures);
    process.exit(1);
  }
}

export function filterFacts(facts, extraDrop = []) {
  return facts.filter(
    (f) =>
      !dropPrefixes.some((p) => f.key.startsWith(p) || f.key === p) &&
      !dropKeys.has(f.key) &&
      !extraDrop.includes(f.key),
  );
}

/**
 * @param {object} opts
 * @param {string} opts.evidencePath
 * @param {{ standard: string; extra: string }} opts.pdfPaths
 * @param {object} opts.overrides
 * @param {object} opts.appendedReferenceFacts
 * @param {object} opts.legacyKeys
 * @param {{ hus: number; "hus-ekstra": number }} opts.pages
 * @param {string[]} [opts.standardDrop]
 * @param {string[]} [opts.extraDrop]
 * @param {string[]} [opts.extraValidateKeys]
 */
export function generateMemberHusEvidence(opts) {
  const pdfText = loadPdfText(opts.pdfPaths);
  const standardFacts = toEvidence(trygHusFacts.trygHus, "standard", opts);
  const extraFacts = toEvidence(trygHusFacts.trygHusExtra, "extra", opts);

  const husFacts = filterFacts(standardFacts, opts.standardDrop ?? []);
  const husEkstraFacts = filterFacts(extraFacts, [
    ...(opts.extraDrop ?? []),
    "hus.ror.frost",
    "hus.sprengning.egenandel",
  ]);

  assertInPdf(pdfText, "standard", husFacts, opts.overrides);
  assertInPdf(pdfText, "extra", husEkstraFacts, opts.overrides, opts.extraValidateKeys ?? []);

  const evidence = JSON.parse(readFileSync(opts.evidencePath, "utf8"));
  const before = { hus: evidence.hus.facts.length, "hus-ekstra": evidence["hus-ekstra"].facts.length };
  evidence.hus.facts = husFacts;
  evidence["hus-ekstra"].facts = husEkstraFacts;
  evidence.hus.pages = opts.pages.hus;
  evidence["hus-ekstra"].pages = opts.pages["hus-ekstra"];
  writeFileSync(opts.evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  return {
    hus: { before: before.hus, after: husFacts.length },
    "hus-ekstra": { before: before["hus-ekstra"], after: husEkstraFacts.length },
  };
}