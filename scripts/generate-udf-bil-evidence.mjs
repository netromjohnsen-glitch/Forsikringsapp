#!/usr/bin/env node
/**
 * Generates Utdanningsforbundet bil facts in utdanningsforbundet-evidence.json.
 * Run after: pdftotext -layout on udf-bil-*.pdf into /tmp/tryg-bil-pdf/.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMemberBilEvidence } from "./lib/tryg-member-bil-evidence-core.mjs";
import { appendedFacts, legacyKeys, overrides } from "./lib/tryg-member-bil-overrides-udf.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfDir = "/tmp/tryg-bil-pdf";

console.log(
  JSON.stringify(
    generateMemberBilEvidence({
      evidencePath: path.join(root, "catalog/tryg-member-agreements/utdanningsforbundet-evidence.json"),
      products: ["bil-delkasko", "bil-ekstra", "elbil-ekstra"],
      pdfPaths: {
        "bil-delkasko": `${pdfDir}/udf-bil-delkasko-2026-07.txt`,
        "bil-ekstra": `${pdfDir}/udf-bil-ekstra.txt`,
        "elbil-ekstra": `${pdfDir}/udf-elbil-ekstra-2026-08.txt`,
      },
      overrides,
      appendedFacts,
      legacyKeys,
      pages: {
        "bil-delkasko": 4,
        "bil-ekstra": 3,
        "elbil-ekstra": 3,
      },
    }),
  ),
);