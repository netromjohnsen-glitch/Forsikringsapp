#!/usr/bin/env node
/**
 * Generates NITO bil product facts in nito-evidence.json.
 * Run after: pdftotext -layout on nito-bil-*.pdf into /tmp/tryg-bil-pdf/.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMemberBilEvidence } from "./lib/tryg-member-bil-evidence-core.mjs";
import { appendedFacts, legacyKeys, overrides } from "./lib/tryg-member-bil-overrides-nito.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfDir = "/tmp/tryg-bil-pdf";

console.log(
  JSON.stringify(
    generateMemberBilEvidence({
      evidencePath: path.join(root, "catalog/tryg-member-agreements/nito-evidence.json"),
      products: ["bil-ansvar", "bil-delkasko", "bil-kasko", "bil-ekstra", "elbil-ekstra"],
      pdfPaths: {
        "bil-ansvar": `${pdfDir}/nito-bil-ansvar.txt`,
        "bil-delkasko": `${pdfDir}/nito-bil-delkasko.txt`,
        "bil-kasko": `${pdfDir}/nito-bil-kasko.txt`,
        "bil-ekstra": `${pdfDir}/nito-bil-ekstra.txt`,
        "elbil-ekstra": `${pdfDir}/nito-elbil-ekstra.txt`,
      },
      overrides,
      appendedFacts,
      legacyKeys,
      pages: {
        "bil-ansvar": 1,
        "bil-delkasko": 3,
        "bil-kasko": 4,
        "bil-ekstra": 2,
        "elbil-ekstra": 2,
      },
    }),
  ),
);