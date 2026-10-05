import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  compareCatalogProducts,
  materializeCatalogProduct,
  productComparisonInsuranceTypes,
  productComparisonOptions,
  productComparisonProviders,
} from "../lib/catalog-product-comparison.ts";
import { enrichConsolidatedInsurance } from "../lib/catalog-enrichment.ts";
import { normalizeInsuranceType, normalizeTermName } from "../lib/insurance-normalization.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { boatPetKeyApplies } from "../lib/boat-pet-registry.ts";
import { manualProductOptions } from "../lib/manual-product-selection.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { canonicalDocumentFactKeys, parseExtractionResponse } from "../lib/analysis-output.ts";

const packages = [
  ["tryg", "Tryg"], ["if", "If"], ["gjensidige", "Gjensidige"], ["storebrand", "Storebrand"],
  ["sparebank1-fremtind", "Fremtind"], ["frende", "Frende"],
];
const types = ["Båt", "Hund", "Katt"];
const products = (providerId, type) => productCatalog.products.filter((product) => product.providerId === providerId && product.insuranceType === type);
const addons = (providerId, type) => (productCatalog.addOns ?? []).filter((addon) => addon.providerId === providerId && addon.insuranceTypes?.includes(type));
const facts = (product) => resolveCatalogFacts(product, [], new Date("2026-09-29"), null, productCatalog);
const option = (type, company, name) => productComparisonOptions(type, company, "ordinary").find((product) => product.name === name);

// Coordinator-cleared B-091 provenance tuples; no arbitrary Tryg/Katt sources.
const b091SourceContracts = {
  "boat-pet:tryg:katt:treatment": {
    "id": "boat-pet:tryg:katt:treatment",
    "filename": "tryg-cat-treatment-terms.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Katt",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PLB52006",
    "effectiveFrom": "2026-07-01",
    "version": "2026-07-01",
    "url": "https://www.tryg.no/forsikringer/dyreforsikring/katteforsikring",
    "sha256": "fa7297b2b37cab3f8e8d51151643bcd4293fc7fbb0a33f77de86108af16bf9dc",
    "documentName": "PLB52006"
  },
  "boat-pet:tryg:katt:product": {
    "id": "boat-pet:tryg:katt:product",
    "filename": "tryg-dog-product-terms.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Katt",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PLB52000",
    "effectiveFrom": "2026-05-10",
    "version": "2026-05-10",
    "url": "https://www.tryg.no/forsikringer/dyreforsikring/hundeforsikring",
    "sha256": "a7936fd27cd305b1a6eeb8153d8289dffff5c075e0e50ffbd9590f8bb2d83318",
    "documentName": "PLB52000"
  },
  "boat-pet:tryg:katt:extra": {
    "id": "boat-pet:tryg:katt:extra",
    "filename": "tryg-cat-extra-terms.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Katt",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PLB52004",
    "effectiveFrom": "2025-07-01",
    "version": "2025-07-01",
    "url": "https://www.tryg.no/forsikringer/katteforsikring",
    "sha256": "f4267143ea6f0643341503cf60ce50ce7036cf83af21b3ec29f514d1a7738972",
    "documentName": "PLB52004"
  },
  "boat-pet:tryg:katt:life": {
    "id": "boat-pet:tryg:katt:life",
    "filename": "tryg-cat-life-terms.pdf",
    "providerId": "tryg",
    "company": "Tryg",
    "insuranceType": "Katt",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "PLB52005",
    "effectiveFrom": "2026-01-01",
    "version": "2026-01-01",
    "url": "https://www.tryg.no/forsikringer/katteforsikring",
    "sha256": "8024b9853d3ff80259f939418f31f03e332d280bfca612d613390a7699e5eb3c",
    "documentName": "PLB52005"
  }
};
const b091ProvenanceBindings = [
  ["tryg-katt-behandling", "dyr.veterinar.egenandel.fast", "boat-pet:tryg:katt:treatment", 1, "3 Hvilke utgifter som erstattes – Egenandel", null],
  ["tryg-katt-behandling", "dyr.veterinar.sum.valgbar", "boat-pet:tryg:katt:treatment", 2, "4 Slik beregnes erstatningen", {"source": "boat-pet:tryg:katt:treatment", "page": 1, "section": "1 HVA FORSIKRINGEN OMFATTER"}],
  ["tryg-katt-behandling", "dyr.diagnostikk.dekning", "boat-pet:tryg:katt:treatment", 1, "2–3 Tilfeller og utgifter", null],
  ["tryg-katt-behandling", "dyr.veterinaralder.opphor", "boat-pet:tryg:katt:product", 1, "4 Når forsikringen gjelder", null],
  ["tryg-katt-behandling", "dyr.tannskade.dekning", "boat-pet:tryg:katt:treatment", 1, "3 Hvilke utgifter som erstattes – tannfraktur og unntak", null],
  ["tryg-katt-behandling", "dyr.fodsel.dekning", "boat-pet:tryg:katt:treatment", 1, "3 Hvilke utgifter som erstattes – fødselshjelp", null],
  ["tryg-katt-ekstra", "dyr.tannsykdom.grense", "boat-pet:tryg:katt:extra", 1, "2 Tann- og tannkjøttsykdommer", null],
  ["tryg-katt-ekstra", "dyr.tannsykdom.begrensning", "boat-pet:tryg:katt:extra", 1, "2 Tann- og tannkjøttsykdommer", null],
  ["tryg-katt-dod", "dyr.liv.dekning", "boat-pet:tryg:katt:life", 1, "1–3 Rasekatt død – omfang, utløsere og erstatning", null],
  ["tryg-katt-dod", "dyr.liv.begrensning", "boat-pet:tryg:katt:life", 1, "2 Tilleggsbestemmelser – død og avlivning", null],
  ["tryg-katt-dod", "dyr.liv.reduksjon.start", "boat-pet:tryg:katt:life", 1, "3 Slik beregnes erstatningen", null],
  ["tryg-katt-dod", "dyr.liv.reduksjon.sats", "boat-pet:tryg:katt:life", 1, "3 Slik beregnes erstatningen", {"source": "boat-pet:tryg:katt:life", "page": 2, "section": "3 Slik beregnes erstatningen – minste erstatning"}],
  ["tryg-katt-dod", "dyr.liv.opphor", "boat-pet:tryg:katt:product", 1, "4 Når forsikringen gjelder – maksimal alder og første forfall", null]
];
const b091ReferenceFields = ["documentId", "filename", "termsNumber", "effectiveFrom", "version", "agreementScope", "url", "company", "page", "section"];
const b091Reference = (sourceId, page, section) => {
  const source = b091SourceContracts[sourceId];
  return Object.fromEntries(b091ReferenceFields.map((field) => [field,
    field === "documentId" ? sourceId : field === "page" ? page : field === "section" ? section : source[field],
  ]));
};
const b091ActualReference = (reference) => Object.fromEntries(b091ReferenceFields.map((field) => [field, reference[field]]));
const assertB091Provenance = (fact, binding) => {
  const [, key, sourceId, page, section, qualification] = binding;
  assert.equal(fact.key, key);
  assert.deepEqual(productCatalog.sources[sourceId], b091SourceContracts[sourceId]);
  assert.deepEqual(b091ActualReference(fact.source), b091Reference(sourceId, page, section));
  if (qualification) {
    assert.ok(fact.qualificationSource, `${key}: missing qualification source`);
    assert.deepEqual(productCatalog.sources[qualification.source], b091SourceContracts[qualification.source]);
    assert.deepEqual(b091ActualReference(fact.qualificationSource), b091Reference(qualification.source, qualification.page, qualification.section));
  } else {
    assert.equal(fact.qualificationSource, undefined);
  }
};

test("Båt/Hund/Katt gir tolv dynamiske produktfamilier", () => {
  assert.deepEqual(productComparisonInsuranceTypes(), [
    "Snøscooter", "Campingvogn", "Tilhenger", "Bil", "Hus", "Innbo", "Reise", "Båt", "MC", "Bobil", "Hund", "Katt",
  ]);
  for (const type of types) assert.deepEqual(productComparisonProviders(type), packages.map((entry) => entry[1]));
});

for (const [providerId, company] of packages) {
  for (const type of types) {
    test(`${company} ${type} har source-backed produktpakke`, () => {
      const source = productCatalog.sources[`boat-pet:${providerId}:${type.toLocaleLowerCase("nb-NO")}`];
      assert.ok(source);
      assert.equal(source.providerId, providerId);
      assert.equal(source.insuranceType, type);
      assert.equal(source.agreementScope, "ordinary");
      assert.match(source.sha256, /^[a-f0-9]{64}$/u);
      const packageProducts = products(providerId, type);
      assert.ok(packageProducts.length > 0);
      const packageFacts = packageProducts.flatMap(facts);
      assert.ok(packageFacts.length >= 3);
      if (providerId === "tryg" && type === "Katt") {
        assert.equal(packageProducts.length, 1);
        assert.equal(packageProducts[0].productId, "tryg-katt-behandling");
        assert.equal(packageProducts[0].version, "2026-09-01");
        const baseBindings = b091ProvenanceBindings.filter(([owner]) => owner === "tryg-katt-behandling");
        assert.equal(baseBindings.length, 6);
        for (const binding of baseBindings) {
          const matches = packageFacts.filter((fact) => fact.key === binding[1]);
          assert.equal(matches.length, 1);
          assertB091Provenance(matches[0], binding);
        }
        for (const fact of packageFacts.filter((fact) => !baseBindings.some(([, key]) => key === fact.key))) {
          assert.equal(fact.source.documentId, source.id);
        }
        assert.deepEqual(packageFacts.filter((fact) => !baseBindings.some(([, key]) => key === fact.key)).map((fact) => fact.key).sort(),
          ["dyr.karenstid.sykdom", "dyr.medisin.dekning", "dyr.veterinar.dekning"]);
        for (const binding of b091ProvenanceBindings.filter(([owner]) => owner !== "tryg-katt-behandling")) {
          const addon = addons(providerId, type).find((candidate) => candidate.componentId === binding[0]);
          assert.ok(addon);
          assert.equal(addon.agreementScope, "ordinary");
          assert.deepEqual(addon.insuranceTypes, ["Katt"]);
          assert.deepEqual(addon.requiresLevel, ["tryg-katt-behandling"]);
          const matches = productCatalog.facts[binding[0]].filter((fact) => fact.key === binding[1]);
          assert.equal(matches.length, 1);
          assertB091Provenance(matches[0], binding);
        }
      } else {
        assert.equal(packageFacts.every((fact) => fact.source.documentId === source.id), true);
      }
      assert.equal(packageFacts.every((fact) => fact.source.agreementScope === "ordinary"), true);
    });
  }
}

test("65 offentlige originaler har verifiserbare SHA-256 hashes", () => {
  const manifest = JSON.parse(fs.readFileSync("catalog/sources/boat-pet/manifest.json", "utf8"));
  assert.equal(manifest.documents.length, 65);
  assert.equal(manifest.sourcePackages.length, 18);
  assert.equal(new Set(manifest.sourcePackages.map((entry) => `${entry.providerId}:${entry.insuranceType}`)).size, 18);
  for (const document of manifest.documents) {
    assert.equal(document.publicOfficialArtifact, true);
    assert.match(document.url, /^https:\/\//u);
    assert.equal(document.agreementScope, "ordinary");
    const bytes = fs.readFileSync(document.localPath);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), document.sha256);
  }
  for (const source of Object.values(productCatalog.sources).filter((entry) => entry.id.startsWith("boat-pet:"))) {
    let artifact = manifest.documents.find((entry) => entry.filename === source.filename && entry.providerId === source.providerId && entry.insuranceTypes.includes(source.insuranceType.toLocaleLowerCase("nb-NO")));
    // B091_EXPLICIT_DYR_KATT_TEST_SOURCE_ADMISSION_EXCEPTION:
    // Frozen PLB52000 §4 explicitly covers Katt; preserve the historical Hund-only manifest.
    // Admit only GAP-0015/SF-0023 and GAP-4385/SF-6238, never future versions or other facts.
    if (source.id === "boat-pet:tryg:katt:product") {
      assert.deepEqual(source, b091SourceContracts[source.id]);
      artifact = manifest.documents.find((entry) => entry.filename === "tryg-dog-product-terms.pdf" && entry.providerId === "tryg");
      assert.deepEqual(artifact, {
      "providerId": "tryg",
      "filename": "tryg-dog-product-terms.pdf",
      "insuranceTypes": [
            "hund"
      ],
      "agreementScope": "ordinary",
      "documentType": "full_terms",
      "sha256": "a7936fd27cd305b1a6eeb8153d8289dffff5c075e0e50ffbd9590f8bb2d83318",
      "url": "https://www.tryg.no/forsikringer/dyreforsikring/hundeforsikring",
      "retrievedAt": "2026-09-29",
      "localPath": "catalog/sources/boat-pet/tryg-dog-product-terms.pdf",
      "publicOfficialArtifact": true
});
      const expectedBindings = b091ProvenanceBindings.filter(([, , sourceId]) => sourceId === source.id);
      assert.deepEqual(expectedBindings.map(([owner, key]) => [owner, key]).sort(), [
        ["tryg-katt-behandling", "dyr.veterinaralder.opphor"],
        ["tryg-katt-dod", "dyr.liv.opphor"],
      ]);
      const uses = Object.entries(productCatalog.facts).flatMap(([owner, ownerFacts]) => ownerFacts
        .filter((fact) => fact.source.documentId === source.id || fact.qualificationSource?.documentId === source.id)
        .map((fact) => ({ owner, fact })));
      assert.deepEqual(uses.map(({ owner, fact }) => [owner, fact.key]).sort(), expectedBindings.map(([owner, key]) => [owner, key]).sort());
      for (const { owner, fact } of uses) {
        assertB091Provenance(fact, expectedBindings.find(([expectedOwner, key]) => expectedOwner === owner && key === fact.key));
      }
    }
    assert.ok(artifact, `Mangler manifestkobling for ${source.id}`);
    assert.equal(source.sha256, artifact.sha256);
  }
  assert.equal(manifest.documents.filter((document) => document.filename.endsWith(".pdf")).length, 51);
  assert.equal(manifest.documents.filter((document) => document.filename.endsWith(".html")).length, 14);
});

test("Båtproduktstruktur er provider-tro", () => {
  assert.deepEqual(products("tryg", "Båt").map((product) => product.name), ["Ansvar", "Brann/Ansvar", "Brann/Tyveri/Ansvar", "Kasko/Ansvar", "Båt Ekstra"]);
  assert.deepEqual(products("if", "Båt").map((product) => product.name), ["Delkasko", "Kasko", "Super"]);
  assert.deepEqual(products("gjensidige", "Båt").map((product) => product.name), ["Delkasko", "Kasko", "Pluss"]);
  assert.deepEqual(products("storebrand", "Båt").map((product) => product.name), ["Delkasko", "Kasko", "Super"]);
  assert.deepEqual(products("sparebank1-fremtind", "Båt").map((product) => product.name), ["Delkasko", "Kasko", "Toppkasko"]);
  assert.deepEqual(products("frende", "Båt").map((product) => product.name), ["Brann og tyveri", "Kasko", "Utvidet"]);
});

test("valgfrie Båt-komponenter forblir valgfrie i produktmodus", () => {
  const comparison = compareCatalogProducts(option("Båt", "Tryg", "Kasko/Ansvar"), option("Båt", "Gjensidige", "Kasko"));
  const rows = comparison.sections.flatMap((section) => section.rows);
  const machine = rows.find((row) => row.key === "bat.maskinskade.dekning");
  assert.equal(machine.first.state, "optional");
  assert.equal(machine.second.state, "unknown");
  assert.doesNotMatch(`${machine.first.text} ${machine.second.text}`, /Valgt/u);
});

test("Storebrand dyr kan velges som Veterinær, Dødsfall eller kombinasjon", () => {
  for (const type of ["Hund", "Katt"]) {
    assert.deepEqual(products("storebrand", type).map((product) => product.name), ["Veterinær", "Dødsfall", "Veterinær og Dødsfall"]);
    const life = materializeCatalogProduct(option(type, "Storebrand", "Dødsfall"));
    assert.equal(life.facts.some((fact) => fact.key === "dyr.liv.dekning" && fact.state === "included"), true);
    assert.equal(life.facts.some((fact) => fact.key === "dyr.veterinar.dekning"), false);
  }
});

test("Hund-spesifikk bruksverdi lekker ikke til Katt", () => {
  assert.ok(addons("gjensidige", "Hund").some((addon) => addon.name === "Bruk"));
  // B-022 adds source-verified Katt Bruk; it must use its own species keys.
  assert.ok(addons("gjensidige", "Katt").some((addon) => addon.name === "Bruk"));
  assert.equal(productCatalog.facts["gjensidige-katt-bruk"].some(fact => fact.key.startsWith("hund.")), false);
  // B-018 includes conditional Bruksverdi in Tap, never as a separate purchase.
  assert.equal(addons("frende", "Hund").some((addon) => addon.name === "Bruksverdi"), false);
  assert.ok(productCatalog.facts["frende-hund-tap"].some(fact => fact.key === "hund.bruksverdi.dekning"));
  assert.equal(addons("frende", "Katt").some((addon) => addon.name === "Bruksverdi"), false);
  const catFacts = productCatalog.products.filter((product) => product.insuranceType === "Katt").flatMap(facts);
  assert.equal(catFacts.some((fact) => fact.key.startsWith("hund.")), false);
});

test("årlig, hendelsesbasert og valgbar veterinærsum er separate identiteter", () => {
  assert.notEqual(normalizeTermName("Veterinærbehandling forsikringssum per forsikringsår", { insuranceType: "Hund" }), normalizeTermName("Veterinærbehandling forsikringssum per skadetilfelle", { insuranceType: "Hund" }));
  const frende = materializeCatalogProduct(option("Hund", "Frende", "Veterinær"));
  assert.equal(frende.facts.some((fact) => fact.key === "dyr.veterinar.sum.valgbar" && /per skadetilfelle.*per forsikringsår/iu.test(fact.value)), true);
});

test("fast egenandel og prosentandel beholder separate canonical facts", () => {
  const frende = materializeCatalogProduct(option("Hund", "Frende", "Veterinær"));
  assert.equal(frende.facts.some((fact) => fact.key === "dyr.veterinar.egenandel.fast"), true);
  assert.equal(frende.facts.some((fact) => fact.key === "dyr.veterinar.egenandel.prosent"), true);
});

test("nytegningsalder, reduksjonsalder og opphørsalder er separate identiteter", () => {
  for (const key of ["dyr.inntaksalder.maks", "dyr.liv.reduksjon.start", "dyr.liv.opphor"]) {
    assert.equal(boatPetKeyApplies("hund", key), true);
  }
  assert.equal(new Set(["dyr.inntaksalder.maks", "dyr.liv.reduksjon.start", "dyr.liv.opphor"]).size, 3);
});

test("Båt aliases normaliseres eksakt uten å bli Bil", () => {
  for (const alias of ["Båt", "Båtforsikring", "Småbåt", "Småbåtforsikring"]) assert.equal(normalizeInsuranceType(alias), "båt");
  assert.notEqual(normalizeInsuranceType("Båt"), normalizeInsuranceType("Bil"));
});

test("54 representative source-to-catalog checks preserve numeric and conditional semantics", () => {
  const checks = {
    "tryg:Båt": [["bat.geografi.omrade", /200 nautiske mil/u], ["bat.maskinskade.alder", /15 år/u], ["bat.ulykke.dekning", /Valgfritt/u]],
    "tryg:Hund": [["dyr.karenstid.sykdom", /20 dager/u], ["dyr.liv.opphor", /12 år/u], ["dyr.veterinar.sum.valgbar", /forsikringsbeviset/u]],
    "tryg:Katt": [["dyr.karenstid.sykdom", /20 dager/u], ["dyr.liv.opphor", /12 år/u], ["dyr.veterinar.egenandel.fast", /^2 500 kr per sykdom og per ulykkestilfelle$/u]],
    "if:Båt": [["bat.geografi.omrade", /200 nautiske mil/u], ["bat.losore.grense", /50 000 kr/u], ["bat.maskinskade.egenandel", /8 000 kr/u]],
    "if:Hund": [["dyr.tannsykdom.grense", /15 000 kr/u], ["dyr.veterinar.rollover", /10 000 kr/u], ["dyr.liv.reduksjon.sats", /20 %/u]],
    "if:Katt": [["dyr.tannsykdom.grense", /5 000 kr/u], ["dyr.veterinar.rollover", /dobbelte/u], ["dyr.liv.opphor", /13 år/u]],
    "gjensidige:Båt": [["bat.geografi.omrade", /200 nautiske mil/u], ["bat.maskinskade.alder", /10 år/u], ["bat.totalskade.dekning", /Inkludert/u]],
    "gjensidige:Hund": [["dyr.rehabilitering.grense", /5 000 kr/u], ["dyr.allergi.grense", /5 000 kr/u], ["hund.bruksverdi.dekning", /Valgfri/u]],
    "gjensidige:Katt": [["dyr.allergi.grense", /5 000 kr/u], ["dyr.liv.dekning", /Valgfri/u], ["dyr.veterinar.sum.valgbar", /forsikringsbeviset/u]],
    "storebrand:Båt": [["bat.ferieavbrudd.dager", /30 dager/u], ["bat.ferieavbrudd.grense", /60 000 kr/u], ["bat.totalskade.alder", /3 år/u]],
    "storebrand:Hund": [["dyr.veterinar.egenandel.fast", /2 500 kr/u], ["dyr.liv.reduksjon.start", /8 år/u], ["hund.bruksverdi.grense", /50 %/u]],
    "storebrand:Katt": [["dyr.veterinaralder.opphor", /livet ut/u], ["dyr.liv.reduksjon.sats", /90 %.*75 %.*60 %/u], ["dyr.liv.opphor", /10 år/u]],
    "sparebank1-fremtind:Båt": [["bat.ferieavbrudd.dager", /15 dager/u], ["bat.ferieavbrudd.dagsbelop", /1 500 kr/u], ["bat.maskinskade.egenandel", /4 000 kr/u]],
    "sparebank1-fremtind:Hund": [["dyr.veterinar.egenandel.periode", /135 dager/u], ["dyr.liv.reduksjon.start", /hovedforfall etter fylte 5 år.*7 år.*9 år/u], ["hund.bruksverdi.alder", /8 år/u]],
    "sparebank1-fremtind:Katt": [["dyr.diagnostikk.grense", /15 000 kr/u], ["dyr.liv.reduksjon.sats", /20 %/u], ["dyr.liv.opphor", /12 år/u]],
    "frende:Båt": [["bat.geografi.omrade", /200 nautiske mil/u], ["bat.losore.grense", /10 000 kr/u], ["bat.jolle.grense", /20 000 kr/u]],
    "frende:Hund": [["dyr.veterinar.egenandel.fast", /1 000 kr/u], ["dyr.veterinar.egenandel.prosent", /25 %/u], ["hund.bruksverdi.grense", /50 %/u]],
    "frende:Katt": [["dyr.allergi.grense", /15 000 kr/u], ["dyr.karenstid.sykdom", /20 dager/u], ["dyr.veterinar.sum.valgbar", /alle veterinærutgifter og alle medisinutgifter per skadetilfelle.*forsikringssummen i forsikringsbeviset.*samme skadetilfelle.*over flere forsikringsår/iu]],
  };
  assert.equal(Object.values(checks).flat().length, 54);
  for (const [identity, expected] of Object.entries(checks)) {
    const [providerId, type] = identity.split(":");
    const productFacts = products(providerId, type).flatMap((product) => productCatalog.facts[product.productId] ?? []);
    const addOnFacts = addons(providerId, type).flatMap((addon) => productCatalog.facts[addon.componentId] ?? []);
    const packageFacts = [...productFacts, ...addOnFacts];
    for (const [key, pattern] of expected) {
      const fact = packageFacts.find((candidate) => candidate.key === key && pattern.test(candidate.value));
      assert.ok(fact, `${identity} mangler kontrollen ${key}`);
      assert.equal(productCatalog.sources[fact.source.documentId].providerId, providerId);
      assert.equal(productCatalog.sources[fact.source.documentId].insuranceType, type);
    }
  }
});

test("manual product selection is exact for every provider and new family", () => {
  for (const [providerId, company] of packages) for (const type of types) {
    const options = manualProductOptions(company, type);
    assert.deepEqual(options.map((entry) => entry.product.productId), products(providerId, type).map((entry) => entry.productId));
    assert.ok(options.every((entry) => entry.product.agreementScope === "ordinary"));
  }
  const unknown = normalizeManualAgreement({ company: "Tryg", totalAnnualPremium: "", products: [{
    type: "Hund", productName: "Historisk spesialprodukt", customProduct: true, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds: [], catalogReference: null,
  }] });
  assert.equal(unknown.insuranceData.insurances[0].productName, "Historisk spesialprodukt");
  assert.equal(unknown.insuranceData.insurances[0].catalogReference, null);
});

test("extraction schema accepts exact new-family facts and rejects arbitrary keys", () => {
  for (const canonicalKey of ["bat.geografi.omrade", "dyr.veterinar.sum.per_ar", "dyr.veterinar.sum.per_hendelse", "dyr.liv.opphor", "hund.bruksverdi.dekning"]) {
    assert.ok(canonicalDocumentFactKeys.includes(canonicalKey));
    const type = canonicalKey.startsWith("bat.") ? "Båt" : canonicalKey.startsWith("hund.") ? "Hund" : "Katt";
    const output = { company: "Syntetisk", totalAnnualPremium: null, totalAnnualPremiumScope: "partial_or_unclear", insurances: [{
      type, company: "Syntetisk", productName: "Syntetisk", canonicalProductName: null, annualPremium: null,
      deductible: null, coverageSummary: null, addOns: [], documentIndices: [1],
      importantTerms: [{ name: "Syntetisk dokumentert faktum", value: "Dokumentert", canonicalKey, documentIndices: [1] }],
    }] };
    assert.equal(parseExtractionResponse({ output_text: JSON.stringify(output) }).insurances[0].importantTerms[0].canonicalKey, canonicalKey);
  }
  assert.equal(canonicalDocumentFactKeys.includes("dyr.ukjent"), false);
});

test("new-family product comparisons are symmetric and same-product safe", () => {
  const scenarios = [
    ["Båt", "Tryg", "Båt Ekstra", "If", "Super"],
    ["Hund", "If", "Super", "Frende", "Veterinær"],
    ["Katt", "Storebrand", "Veterinær og Dødsfall", "Fremtind", "Veterinær"],
  ];
  for (const [type, companyA, nameA, companyB, nameB] of scenarios) {
    const a = option(type, companyA, nameA); const b = option(type, companyB, nameB);
    assert.equal(compareCatalogProducts(a, a).differenceCount, 0);
    const forward = compareCatalogProducts(a, b).sections.flatMap((section) => section.rows).filter((row) => row.different).map((row) => row.key).sort();
    const reverse = compareCatalogProducts(b, a).sections.flatMap((section) => section.rows).filter((row) => row.different).map((row) => row.key).sort();
    assert.deepEqual(forward, reverse);
  }
});

test("canonical fact families stay isolated across species and vehicle types", () => {
  for (const key of ["hund.bruksverdi.dekning", "hund.bruksverdi.grense"]) {
    assert.equal(boatPetKeyApplies("hund", key), true);
    assert.equal(boatPetKeyApplies("katt", key), false);
  }
  assert.equal(boatPetKeyApplies("båt", "maskinskade.km"), false);
  assert.equal(boatPetKeyApplies("hund", "bat.maskinskade.alder"), false);
  assert.notEqual(normalizeTermName("Båt maskinskade aldersgrense", { insuranceType: "Bil" }), "bat.maskinskade.alder");
  assert.notEqual(normalizeTermName("Bruksverdi", { insuranceType: "Katt" }), "hund.bruksverdi.dekning");
});

test("kundedokument vinner over katalog og katalogvalg velger ikke valgfritt liv", () => {
  const insurance = {
    company: "Tryg", type: "Hund", productName: "Behandling", canonicalProductName: "Behandling",
    annualPremium: null, deductible: null, coverageSummary: null, addOns: [],
    importantTerms: [{ name: "Veterinærbehandling forsikringssum per forsikringsår", value: "37 000 kr", canonicalKey: "dyr.veterinar.sum.per_ar" }],
  };
  const enriched = enrichConsolidatedInsurance("Tryg", insurance);
  const sum = enriched.importantTerms.find((fact) => fact.key === "dyr.veterinar.sum.per_ar");
  assert.equal(sum.value, "37 000 kr");
  assert.equal(sum.coverageOrigin, "document");
  assert.equal(enriched.addOnIds?.includes("tryg-hund-dod") ?? false, false);
  assert.equal(enriched.importantTerms.some((fact) => fact.key === "dyr.liv.dekning"), false);
});

test("eksplisitt valgt tillegg kan aktiveres uten å endre dokumentverdi", () => {
  const insurance = {
    company: "Tryg", type: "Hund", productName: "Behandling", canonicalProductName: "Behandling",
    annualPremium: null, deductible: null, coverageSummary: null,
    importantTerms: [{ name: "Liv, død og tap", value: "Valgt", canonicalKey: "dyr.liv.dekning" }],
    addOns: [{ name: "Hund død", annualPremium: null, deductible: null, importantTerms: [] }],
  };
  const enriched = enrichConsolidatedInsurance("Tryg", insurance);
  assert.ok(enriched.addOnIds?.includes("tryg-hund-dod"));
  assert.equal(enriched.importantTerms.find((fact) => fact.key === "dyr.liv.dekning").coverageOrigin, "document");
});

test("produktpresentasjon bruker kuratert Båt- og dyrehierarki", () => {
  const boat = productComparisonView(compareCatalogProducts(option("Båt", "Storebrand", "Super"), option("Båt", "Fremtind", "Toppkasko")));
  assert.ok(boat.some((section) => section.label === "Totalskade og ny båt"));
  assert.ok(boat.some((section) => section.label === "Ferieavbrudd"));
  const dog = productComparisonView(compareCatalogProducts(option("Hund", "If", "Super"), option("Hund", "Frende", "Veterinær")));
  assert.ok(dog.some((section) => section.label === "Veterinærbehandling"));
  assert.ok(dog.some((section) => section.label === "Tann"));
});

test("Båt bruker sikker serienummerstrategi, mens dyr uten sikker ID behandles konservativt", async () => {
  const { groupInsurances } = await import("../lib/comparison.ts");
  const object = (type, productName, serial) => ({ company: "Tryg", type, productName, canonicalProductName: productName, annualPremium: null, deductible: null, coverageSummary: null, importantTerms: [], addOns: [], objectIdentifiers: serial ? [{ type: "serial", value: serial, documentIndices: [1] }] : [] });
  const boats = groupInsurances([object("Båt", "Kasko/Ansvar", "BOAT-A"), object("Båt", "Båt Ekstra", "BOAT-B")], [object("Båt", "Båt Ekstra", "BOAT-B"), object("Båt", "Kasko/Ansvar", "BOAT-A")], null);
  assert.equal(boats.length, 2);
  const dogs = groupInsurances([object("Hund", "Behandling", null), object("Hund", "Behandling", null)], [object("Hund", "Behandling", null), object("Hund", "Behandling", null)], null);
  assert.equal(dogs.length, 1);
  assert.equal(dogs[0].objectMatch.status, "ambiguous");
  assert.equal(dogs[0].objectMatch.reason, "INSUFFICIENT_IDENTITY");
  const species = groupInsurances([object("Hund", "Behandling", "PET-A"), object("Katt", "Behandling", "PET-B")], [object("Katt", "Behandling", "PET-B"), object("Hund", "Behandling", "PET-A")], null);
  assert.equal(species.length, 2);
  assert.deepEqual(new Set(species.map((group) => normalizeInsuranceType(group.label))), new Set(["hund", "katt"]));
});
