#!/usr/bin/env node
/**
 * Generates Utdanningsforbundet hus / hus-ekstra facts in utdanningsforbundet-evidence.json.
 * Run after: pdftotext -layout catalog/sources/tryg/member-agreements/udf-hus.pdf /tmp/udf-hus.txt
 * and udf-hus-ekstra.pdf likewise.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMemberHusEvidence } from "./lib/tryg-member-hus-evidence-core.mjs";
import {
  appendedReferenceFacts,
  extraDrop,
  legacyKeys,
  overrides,
  standardDrop,
} from "./lib/tryg-member-hus-overrides-udf.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** UDF PDFs bundle several documents; isolate PPK11601/PPK11602 building terms for validation. */
function sliceBuildingTerms(raw, termsNumber) {
  const flat = raw.replace(/\s+/gu, " ");
  const start = flat.indexOf(`Vilkår ${termsNumber} gjelder`);
  if (start < 0) throw new Error(`Fant ikke ${termsNumber} i PDF-tekst`);
  const end = flat.indexOf("Vilkår PGE", start + 20);
  return flat.slice(start, end > start ? end : undefined);
}

const standardBuilding = "/tmp/udf-hus-bygning.txt";
const extraBuilding = "/tmp/udf-hus-ekstra-bygning.txt";
writeFileSync(standardBuilding, sliceBuildingTerms(readFileSync("/tmp/udf-hus.txt", "utf8"), "PPK11601"));
writeFileSync(extraBuilding, sliceBuildingTerms(readFileSync("/tmp/udf-hus-ekstra.txt", "utf8"), "PPK11602"));

console.log(
  JSON.stringify(
    generateMemberHusEvidence({
      evidencePath: path.join(root, "catalog/tryg-member-agreements/utdanningsforbundet-evidence.json"),
      pdfPaths: {
        standard: standardBuilding,
        extra: extraBuilding,
      },
      overrides,
      appendedReferenceFacts,
      legacyKeys,
      pages: { hus: 8, "hus-ekstra": 10 },
      standardDrop,
      extraDrop,
      extraValidateKeys: ["hus.kunstnerisk_utsmykning"],
    }),
  ),
);