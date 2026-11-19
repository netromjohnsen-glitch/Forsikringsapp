import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { valuablesProducts, valuablesSources } from "../lib/private-valuables-catalog.ts";
import { compareCatalogProducts } from "../lib/catalog-product-comparison.ts";
import { resolveCatalogFacts } from "../lib/product-catalog.ts";

const date = new Date("2026-11-19T12:00:00Z");
const expectedIds = [
  "tryg-verdisak", "if-verdisak", "gjensidige-verdisak-standard", "gjensidige-verdisak-pluss",
  "storebrand-verdisak", "fremtind-verdisak", "frende-verdisak",
];

const product = id => valuablesProducts.find(item => item.productId === id);
const facts = id => resolveCatalogFacts(product(id), [], date);
const row = (id, key) => facts(id).find(item => item.key === "verdisak." + key);

test("the seven valuables variants retain distinct identities and source scope for every expanded clause", () => {
  assert.deepEqual(valuablesProducts.map(item => item.productId), expectedIds);
  for (const id of expectedIds) {
    const selected = product(id);
    const entries = facts(id);
    assert.ok(row(id, "sikrede"), id);
    assert.ok(row(id, "oppgjor.metode"), id);
    assert.equal(new Set(entries.map(item => item.key)).size, entries.length, id);
    for (const entry of entries) {
      assert.ok(entry.label, entry.key);
      for (const reference of [entry.source, entry.qualificationSource].filter(Boolean)) {
        const source = valuablesSources[reference.documentId];
        assert.equal(source.providerId, selected.providerId, id);
        assert.equal(source.insuranceType, "Verdisak");
        assert.deepEqual(source.productIds, [id]);
        assert.ok(reference.section, entry.key);
        assert.ok(reference.page >= source.physicalPages[0] && reference.page <= source.physicalPages[1], entry.key);
        assert.equal(reference.url, source.url);
        assert.equal(reference.termsNumber, source.termsNumber);
        assert.equal(reference.effectiveFrom, source.effectiveFrom);
        if (source.sourceType === "ipid") assert.equal(entry.key, "verdisak.omrade");
      }
    }
  }
  for (const source of Object.values(valuablesSources)) {
    const archive = source.filename.includes("/") ? source.filename : "private-valuables/" + source.filename;
    const bytes = readFileSync(new URL("../catalog/sources/" + archive, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.id);
  }
});

test("separately referenced general terms reuse exact archives with product-specific qualifications", () => {
  const currentIf = valuablesSources["private-valuables:if:general"];
  assert.equal(currentIf.termsNumber, "GEN2-9");
  assert.equal(currentIf.effectiveFrom, "2025-06");
  assert.equal(currentIf.filename, "if/innbo/If_Generelle_vilkar_GEN2-9.pdf");
  assert.equal(facts("if-verdisak").some(item => /rettshjelp/u.test(item.key)), false);
  assert.doesNotMatch(row("if-verdisak", "unntak.terror").value, /50 000 000|50 millioner|EUR/u);
  const natural = row("storebrand-verdisak", "unntak.jordskjelv");
  assert.match(natural.value, /B\.4\.3 omfatter lovbestemt naturskade/u);
  assert.equal(natural.qualificationSource.documentId, "private-valuables:storebrand");
  assert.equal(natural.qualificationSource.page, 4);
  assert.equal(row("storebrand-verdisak", "naturskade").coverageAvailability, "included");
  assert.match(row("storebrand-verdisak", "krav.soksmalsfrist").value, /seks måneder.*samtidig opplyser/u);
  assert.match(row("tryg-verdisak", "unntak.krig").value, /én måned/u);
  assert.match(row("frende-verdisak", "unntak.krig").value, /seks uker/u);
  assert.match(row("frende-verdisak", "unntak.cyber_generelt").value, /Verdisakvilkårets eget unntak/u);
  assert.equal(row("frende-verdisak", "unntak.cyber_generelt").qualificationSource.page, 2);
});

test("Gjensidige named-event Standard and accidental-damage Pluss keep their own original wording", () => {
  const standard = "gjensidige-verdisak-standard";
  const pluss = "gjensidige-verdisak-pluss";
  assert.equal(row(standard, "brann").coverageAvailability, "included");
  assert.match(row(standard, "vann").value, /vannspeil over laveste gulv/u);
  assert.match(row(standard, "unntak.bedrageri").value, /Underslag/u);
  assert.equal(row(standard, "tap").coverageAvailability, "unavailable");
  assert.equal(row(pluss, "tap").coverageAvailability, "included");
  assert.equal(row(pluss, "brann"), undefined);
  assert.match(row(pluss, "unntak.data").value, /rooting, jailbreaking/u);
  for (const id of [standard, pluss]) {
    assert.match(row(id, "sikrede").source.note, /eksempelbevis/u);
    assert.equal(row(id, "sikrede").source.page, 2);
    assert.equal(row(id, "oppgjor.metode").source.note, undefined);
    assert.match(row(id, "oppgjor.metode").source.filename, id === standard ? /standard\.pdf$/u : /pluss\.pdf$/u);
    assert.equal(valuablesSources[row(id, "avtale.sanksjoner").source.documentId].sourceType, "full_terms");
    assert.equal(row(id, "avtale.sanksjoner").source.page, 4);
  }
});

test("Fremtind's appended natural-damage clauses carry their own terms identity and Norwegian scope", () => {
  const source = valuablesSources["private-valuables:fremtind:natural"];
  assert.equal(source.termsNumber, "FFE-001.001-006");
  assert.equal(source.effectiveFrom, "2023-01-01");
  assert.deepEqual(source.physicalPages, [2, 3]);
  const territory = row("fremtind-verdisak", "naturskade.omrade");
  assert.equal(territory.source.documentId, source.id);
  assert.match(territory.value, /brannforsikrede objekter i Norge/u);
  assert.equal(row("fremtind-verdisak", "omrade").value, "Hele verden.");
  assert.equal(row("fremtind-verdisak", "naturskade.egenandel"), undefined);
  assert.equal(row("fremtind-verdisak", "sikkerhet"), undefined);
});

test("Storebrand object-specific benefits and dated natural-damage values retain their qualifications", () => {
  const id = "storebrand-verdisak";
  assert.match(row(id, "golf.hole_in_one").value, /Når forsikringsdokumentet viser at golfutstyr er forsikret/u);
  assert.match(row(id, "golf.hole_in_one").value, /4 000 kroner/u);
  assert.equal(row(id, "golf.hole_in_one").source.page, 9);
  assert.match(row(id, "gjenstand.sykkel").value, /25 km\/t/u);
  assert.match(row(id, "aldersfradrag.horeapparat").value, /tre fradragsfrie år.*20 prosent/u);
  assert.match(row(id, "aldersfradrag.lite_slitasje").value, /75 prosent/u);
  assert.match(row(id, "naturskade.egenandel").value, /8 000 kroner per 1\. januar 2024/u);
  assert.equal(row(id, "naturskade.egenandel").deductibleClassification, "override");
  assert.match(row(id, "egenandel").value, /1 000 kr/u);
});

test("private-use and lending restrictions preserve each provider's distinct permitted parties", () => {
  assert.match(row("tryg-verdisak", "vilkar.utleie").value, /familiemedlemmer/u);
  assert.match(row("tryg-verdisak", "vilkar.kamera").value, /ikke brukes under vann/u);
  assert.match(row("tryg-verdisak", "oppgjor.eget_arbeid").value, /300 kroner per time/u);
  assert.match(row("if-verdisak", "sikrede.annen_eier").value, /datert og signert avtale/u);
  assert.match(row("if-verdisak", "sikrede.annen_eier").value, /lån eller leie mellom privatpersoner omfattes ikke/u);
  assert.match(row("frende-verdisak", "vilkar.utleie").value, /leid eller lånt ut/u);
  assert.equal(row("frende-verdisak", "krav.frist").source.page, 4);
  assert.match(row("frende-verdisak", "sikkerhet.instrument").value, /hard koffert/u);
  assert.equal(row("frende-verdisak", "sikkerhet.instrument").source.page, 4);
});

test("expanded clauses resolve through normal product comparison in both directions", () => {
  for (const first of valuablesProducts) {
    for (const second of valuablesProducts) {
      const forward = compareCatalogProducts(first, second).sections.flatMap(section => section.rows);
      const reverse = compareCatalogProducts(second, first).sections.flatMap(section => section.rows);
      for (const key of ["verdisak.sikrede", "verdisak.oppgjor.metode", "verdisak.oppgjor.brukt"]) {
        const a = forward.find(item => item.key === key);
        const b = reverse.find(item => item.key === key);
        assert.ok(a && b, first.productId + " / " + second.productId + " / " + key);
        assert.deepEqual(a.first, b.second);
        assert.deepEqual(a.second, b.first);
      }
    }
  }
});

test("original PDF pages independently substantiate the new exceptional sums and attached terms", () => {
  const page = (filename, number) => execFileSync("pdftotext", [
    "-layout", "-f", String(number), "-l", String(number),
    new URL("../catalog/sources/private-valuables/" + filename, import.meta.url).pathname, "-",
  ], { encoding: "utf8" }).replace(/\s+/gu, " ");
  assert.match(page("storebrand-verdisak.pdf", 9), /Hole in one.*4 000 kr/u);
  assert.match(page("storebrand-verdisak.pdf", 5), /Høreapparat 3 20%/u);
  assert.match(page("fremtind-verdisak.pdf", 2), /Naturskade Vilkårs id: FFE-001\.001-006 av 01\.01\.2023/u);
  assert.match(page("tryg-verdisak-dekning.pdf", 2), /300 kroner per time/u);
  assert.match(page("frende-verdisak.pdf", 4), /hard koffert beregnet for transport av instrumentet/u);
  assert.match(page("gjensidige-verdisak-standard.pdf", 2), /Skade under transport/u);
});
