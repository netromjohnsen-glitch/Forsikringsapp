import assert from "node:assert/strict";
import test from "node:test";
import {
  conditionalBenefitAudits, conditionalBenefits, conceptForFactKey, conceptsForInsurance, presentationEvidence,
} from "../lib/presentation-catalog.ts";

test("presentation catalog har stabile konsepter for Bil, Innbo, Hus og Reise", () => {
  for (const type of ["bil", "innbo", "bolig", "reise"]) {
    const concepts = conceptsForInsurance(type);
    assert.ok(concepts.length >= 9, type);
    assert.equal(new Set(concepts.map((entry) => entry.id)).size, concepts.length, type);
    assert.ok(concepts.every((entry) => entry.insuranceType === type), type);
  }
  assert.equal(conceptForFactKey("bil", "maskinskade.km").id, "bil.maskinskade");
  assert.equal(conceptForFactKey("innbo", "uhell.geografi").id, "innbo.uhell");
  assert.equal(conceptForFactKey("bolig", "hus.takvegg.folgeskade").id, "hus.vann-fukt");
  assert.equal(conceptForFactKey("bolig", "hus.vatrom.folgeskade").id, "hus.vatrom");
  assert.equal(conceptForFactKey("bolig", "hus.handverker.folgeskade").id, "hus.handverker");
  assert.equal(conceptForFactKey("reise", "reise.varighet.maks").id, "reise.rammer");
});

test("tjenester og betingede fordeler har egne presentation-typer", () => {
  assert.deepEqual(conceptForFactKey("reise", "reise.tjeneste.legehjelp").factTypes, ["service"]);
  assert.deepEqual(conceptForFactKey("bolig", "hus.service.boligsjekk").factTypes, ["service"]);
  const benefit = conditionalBenefits.find((entry) => entry.id === "gjensidige-ovelseskjoring");
  assert.equal(benefit.type, "conditional-benefit");
  assert.match(benefit.facts.find((fact) => fact.label === "Krav").value, /2 000/);
  assert.match(benefit.facts.find((fact) => fact.label === "Startbonus").value, /70 %/);
  assert.match(benefit.facts.find((fact) => fact.label === "Ungførerfordel").value, /under 23 år/);
});

test("Tryg vei til lappen har kildebelagte separate vilkår og virkninger", () => {
  const benefit = conditionalBenefits.find((entry) => entry.id === "tryg-vei-til-lappen");
  assert.equal(benefit.providerId, "tryg");
  assert.equal(benefit.distributionChannel, "Tryg");
  assert.match(benefit.facts.find((fact) => fact.label === "Krav").value, /2 000 km.*appen/s);
  assert.match(benefit.facts.find((fact) => fact.label === "Startbonus").value, /70 %.*første bilforsikring/s);
  assert.match(benefit.facts.find((fact) => fact.label === "Ungførerfordel").value, /under 23 år/s);
  assert.match(benefit.facts.find((fact) => fact.label === "Egenandelsregel").value, /5 000 kr/s);
  const evidence = presentationEvidence.find((entry) => entry.id === benefit.evidenceId);
  assert.equal(evidence.checkedAt, "2026-09-21");
  assert.match(evidence.url, /^https:\/\/www\.tryg\.no\//);
  assert.ok(evidence.supportingSources.some((source) => /PAU25205/.test(source.url)));
});

test("Gjensidige beholder appkrav, startbonus, ungførerregel og egenandelsunntak separat", () => {
  const benefit = conditionalBenefits.find((entry) => entry.id === "gjensidige-ovelseskjoring");
  assert.match(benefit.facts.find((fact) => fact.label === "Krav").value, /før bestått førerprøve/);
  assert.match(benefit.facts.find((fact) => fact.label === "Startbonus").value, /70 %/);
  assert.match(benefit.facts.find((fact) => fact.label === "Ungførerfordel").value, /betaler ekstra/);
  assert.match(benefit.facts.find((fact) => fact.label === "Egenandelsregel").value, /15 000 kr/);
});

test("alle etterspurte providers og Fremtind-kanaler har eksplisitt auditstatus", () => {
  assert.deepEqual(new Set(conditionalBenefitAudits.map((audit) => audit.providerId)), new Set([
    "tryg", "if", "gjensidige", "storebrand", "sparebank1-fremtind", "dnb-fremtind", "eika-fremtind", "frende",
  ]));
  assert.equal(conditionalBenefitAudits.find((audit) => audit.providerId === "eika-fremtind").status, "not-documented");
  assert.ok(conditionalBenefitAudits.every((audit) => audit.checkedAt === "2026-09-21"));
  assert.ok(conditionalBenefitAudits.every((audit) => audit.officialUrls.every((url) => /^https:\/\//.test(url))));
});

test("Fremtind-fordeler er eksplisitt kanalspesifikke", () => {
  const benefits = conditionalBenefits.filter((benefit) => benefit.providerName === "Fremtind");
  assert.deepEqual(new Set(benefits.map((benefit) => benefit.providerId)), new Set([
    "sparebank1-fremtind", "dnb-fremtind",
  ]));
  assert.equal(benefits.some((benefit) => benefit.providerId === "eika-fremtind"), false);
  assert.deepEqual(new Set(benefits.map((benefit) => benefit.distributionChannel)), new Set(["SpareBank 1", "DNB"]));
});

test("Gjensidige øvelseskjøring har separat presentation provenance", () => {
  const evidence = presentationEvidence.find((entry) => entry.id === "gjensidige-bil-ovelseskjoring-2026-09-21");
  assert.equal(evidence.providerId, "gjensidige");
  assert.equal(evidence.insuranceType, "bil");
  assert.ok(evidence.classifications.includes("conditional-benefit"));
  assert.equal(evidence.checkedAt, "2026-09-21");
  assert.match(evidence.url, /^https:\/\/www\.gjensidige\.no\//);
});

test("Tryg Bil-arv har separat IPID-evidence mens faktaene beholder vilkårsprovenance", () => {
  const evidence = presentationEvidence.find((entry) => entry.id === "tryg-bil-levels-2026-09-21");
  assert.equal(evidence.providerId, "tryg");
  assert.deepEqual(evidence.productLevels, ["Ansvar", "Delkasko", "Kasko", "Bil Ekstra"]);
  assert.match(evidence.url, /IPID-Bilforsikring\.pdf$/);
  assert.match(evidence.note, /Kasko som Delkasko pluss/);
});

test("presentation evidence er metadata og finnes ikke i canonical product catalog", async () => {
  const { productCatalog } = await import("../lib/product-catalog.ts");
  assert.equal(Object.keys(productCatalog.facts).some((id) => id.includes("ovelseskjoring")), false);
  assert.equal(Object.values(productCatalog.facts).flat().some((fact) => fact.key === "bil.ovelseskjoring"), false);
  assert.ok(conditionalBenefits.every((benefit) => !("termKey" in benefit)));
});
