import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { basename } from "node:path";
import { boatPetFacts } from "../lib/boat-pet-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { beforePrivatePolicyPageFact } from "./helpers/before-private-policy-pages.mjs";

const receipt = JSON.parse(readFileSync(new URL("../docs/audit/checkpoints/private-policy-pages-20261119/source-changes.json", import.meta.url), "utf8"));
const scope = JSON.parse(readFileSync(new URL("../docs/audit/checkpoints/private-policy-pages-20261119/scope.json", import.meta.url), "utf8"));

test("all eight immutable archives use bounded physical-page anchors", () => {
  const files = new Map(receipt.documents.map(document => [basename(document.path), document]));
  for (const [filename, document] of files) {
    const bytes = readFileSync(new URL("../" + document.path, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), document.sha256, filename);
  }
  const counts = new Map();
  for (const facts of Object.values(boatPetFacts)) {
    for (const fact of facts) {
      for (const source of [fact.source, fact.qualificationSource]) {
        if (!scope.documents.includes(source?.filename)) continue;
        const document = files.get(source.filename);
        assert.ok(source.page >= 1 && source.page <= document.pages, source.documentId + " " + fact.key);
        const archive = termsArchiveDocuments.find(item => item.archivePath === document.path);
        assert.ok(archive, document.path);
        assert.equal(termsSourceHref(source), "/api/vilkar/" + archive.provider + "/" + archive.slug + "#page=" + source.page);
        counts.set(source.filename, (counts.get(source.filename) ?? 0) + 1);
      }
    }
  }
  assert.deepEqual(Object.fromEntries(counts), receipt.after_reference_counts);
  assert.equal(counts.size, 8);
});

test("each audited fact matches the recorded correction and historical checks retain their exact prior inputs", () => {
  for (const { component, key, edits } of receipt.changes) {
    const fact = boatPetFacts[component].find(entry => entry.key === key);
    assert.ok(fact, component + " " + key);
    const original = beforePrivatePolicyPageFact(component, fact);
    for (const { field, property, after, before } of edits) {
      assert.deepEqual(property ? fact[field][property] : fact[field], after);
      assert.deepEqual(property ? original[field][property] : original[field], before);
    }
  }
});

test("geography, boat trip interruption and deductibles open the pages that state them", () => {
  const citations = [
    ["tryg-bat-kasko-ansvar", "bat.geografi.omrade", "/api/vilkar/tryg/ipid-bat#page=2"],
    ["gjensidige-bat-kasko", "bat.geografi.omrade", "/api/vilkar/gjensidige/ipid-bat#page=2"],
    ["sparebank1-fremtind-bat-toppkasko", "bat.ferieavbrudd.dager", "/api/vilkar/fremtind/bat#page=7"],
    ["storebrand-bat-super", "bat.ferieavbrudd.dager", "/api/vilkar/storebrand/bat#page=10"],
    ["storebrand-hund-veterin-r", "dyr.veterinar.dekning", "/api/vilkar/storebrand/dyr#page=4"],
    ["frende-hund-veterin-r", "dyr.veterinar.egenandel.fast", "/api/vilkar/frende/hund#page=5"],
    ["frende-katt-veterin-r", "dyr.veterinar.egenandel.fast", "/api/vilkar/frende/katt#page=4"],
  ];
  for (const [id, key, expected] of citations) {
    assert.equal(termsSourceHref(boatPetFacts[id].find(fact => fact.key === key).source), expected, id);
  }
  const behandling = boatPetFacts["gjensidige-hund-behandling"];
  const annualSum = behandling.find(fact => fact.key === "dyr.veterinar.sum.valgbar");
  assert.equal(termsSourceHref(annualSum.qualificationSource), "/api/vilkar/gjensidige/ipid-hund#page=1");
  for (const [key, page] of [["dyr.allergi.grense", 2], ["dyr.rehabilitering.grense", 3]]) {
    const limit = behandling.find(fact => fact.key === key);
    assert.equal(termsSourceHref(limit.source), "/api/vilkar/gjensidige/hund-behandling#page=1");
    assert.equal(termsSourceHref(limit.qualificationSource), "/api/vilkar/gjensidige/hund-behandling#page=" + page);
  }
});
