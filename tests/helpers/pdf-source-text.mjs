import assert from "node:assert/strict";

// These tests also verify the complete PDF hash. Poppler versions break and
// pad the same source text differently, especially in PDF navigation headers.
export function assertPdfSourceText(actual, expected) {
  const normalize = text => text
    .replace(/^(\d+\.)[ \t]*(?=Ved\b)/gmu, "$1 ")
    .replace(/\s+/gu, " ").trim();
  assert.equal(normalize(actual), normalize(expected));
}
