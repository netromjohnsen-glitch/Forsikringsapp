#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMemberHusEvidence } from "./lib/tryg-member-hus-evidence-core.mjs";
import {
  appendedReferenceFacts,
  legacyKeys,
  overrides,
} from "./lib/tryg-member-hus-overrides-nito.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log(
  JSON.stringify(
    generateMemberHusEvidence({
      evidencePath: path.join(root, "catalog/tryg-member-agreements/nito-evidence.json"),
      pdfPaths: {
        standard: "/tmp/nito-hus.txt",
        extra: "/tmp/nito-hus-ekstra.txt",
      },
      overrides,
      appendedReferenceFacts,
      legacyKeys,
      pages: { hus: 9, "hus-ekstra": 10 },
      extraValidateKeys: ["hus.kunstnerisk_utsmykning"],
    }),
  ),
);