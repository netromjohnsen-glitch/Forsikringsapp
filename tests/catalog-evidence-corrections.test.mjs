import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { comparisonRowHeading } from "../lib/catalog-comparison-row-alignment.ts";
import { findCatalogProductBySelection, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";

PDFParse.setWorker(getPath());

const pageCache = new Map();

function pdfForSource(filename, sha256) {
  const base = path.basename(filename);
  const stack = ["catalog/sources"];
  const hits = [];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) stack.push(full);
      else if (entry === base) hits.push(full);
    }
  }
  if (!sha256) return hits[0];
  return hits.find((file) => createHash("sha256").update(readFileSync(file)).digest("hex") === sha256);
}

function foldThousands(text) {
  let folded = text.replace(/\u00a0/g, " ");
  let previous;
  do {
    previous = folded;
    folded = folded.replace(/(\d)[ .](\d{3})(?!\d)/g, "$1$2");
  } while (folded !== previous);
  return folded;
}

function kronerAmounts(value) {
  return [...foldThousands(value).matchAll(/\d{3,}/g)].map((match) => match[0]);
}

async function pageText(file, page) {
  if (!pageCache.has(file)) {
    const parser = new PDFParse({ data: readFileSync(file) });
    pageCache.set(file, (await parser.getText()).pages);
  }
  return foldThousands(pageCache.get(file).find((entry) => entry.num === page)?.text ?? "");
}

const asOf = new Date("2026-11-21T12:00:00Z");

test("versjonsløst oppslag velger utgaven som gjelder på datoen og beholder historikken", () => {
  const scope = "utdanningsforbundet";
  const editions = productCatalog.products.filter((product) => product.productId === "tryg-utdanningsforbundet-bil-delkasko");
  assert.deepEqual(editions.map((product) => product.version).sort(), ["2026-01-01", "2026-07-01"]);
  assert.equal(findCatalogProductBySelection("Tryg", "Bil", "Delkasko", scope, productCatalog, undefined, asOf)?.version, "2026-07-01");
  assert.equal(findCatalogProductBySelection("Tryg", "Bil", "Delkasko", scope, productCatalog, undefined, new Date("2026-03-01T12:00:00Z"))?.version, "2026-01-01");
  assert.equal(findCatalogProductBySelection("Tryg", "Bil", "Delkasko", scope, productCatalog, "2026-01-01", asOf)?.version, "2026-01-01");
});

test("sammenligningsoverskrift beholder egenandel selv om den andre etiketten er kortere", () => {
  assert.equal(comparisonRowHeading("bil", "glass.egenandel.reparasjon", "Glass – reparasjon", "Glass – egenandel ved reparasjon"), "Glass – egenandel ved reparasjon");
  assert.equal(comparisonRowHeading("bolig", "hus.takvegg.egenandel", "Utett tak/vegg – tillegg", "Tak eller yttervegg – egenandel"), "Tak eller yttervegg – egenandel");
});

test("samme nøkkel i ett produkt har ikke to ulike verdier", () => {
  const reise = findCatalogProductBySelection("Fremtind", "Reise", "Reise");
  const reiseFacts = resolveCatalogFacts(reise, [], asOf);
  const delayed = reiseFacts.filter((fact) => fact.key === "reise.bagasje.forsinket");
  assert.equal(delayed.length, 1);
  assert.match(delayed[0].value, /5 000 kr/);
  const transit = reiseFacts.find((fact) => fact.key === "reise.bagasje.utilgjengelig");
  assert.match(transit.value, /500 kr/);
  assert.equal(transit.source.page, 6);

  const kasko = findCatalogProductBySelection("Frende", "Bil", "Kasko");
  const machine = resolveCatalogFacts(kasko, ["frende-maskinskade"], asOf);
  const limits = machine.filter((fact) => fact.key === "maskinskade.unntak");
  assert.equal(limits.length, 1);
  assert.equal(machine.filter((fact) => fact.key === "maskinskade.leasing").length, 1);
});

test("Utdanningsforbundet Delkasko og Innbo har beløpene fra beviset", () => {
  const car = findCatalogProductBySelection("Tryg", "Bil", "Delkasko", "utdanningsforbundet", productCatalog, undefined, asOf);
  const carFacts = resolveCatalogFacts(car, [], asOf);
  assert.equal(carFacts.find((fact) => fact.key === "brann.egenandel").value, "Egenandelen er 3 000 kroner.");
  assert.equal(carFacts.find((fact) => fact.key === "tyveri.egenandel").value, "Egenandelen er 3 000 kroner.");
  assert.match(carFacts.find((fact) => fact.key === "glass.egenandel.bytte").value, /3 000 kroner ved bytte av rute/);
  assert.match(carFacts.find((fact) => fact.key === "glass.egenandel.reparasjon").value, /Ingen egenandel ved reparasjon/);
  assert.equal(carFacts.find((fact) => fact.key === "veihjelp.egenandel").value, "Egenandelen er 500 kroner.");
  assert.equal(carFacts.find((fact) => fact.key === "veihjelp.egenandel").source.page, 2);

  const contents = findCatalogProductBySelection("Tryg", "Innbo", "Innboforsikring", "utdanningsforbundet", productCatalog, undefined, asOf);
  const contentsFacts = resolveCatalogFacts(contents, [], asOf);
  assert.equal(contentsFacts.find((fact) => fact.key === "ansvar.grense").value, "5 000 000 kroner.");
  assert.equal(contentsFacts.find((fact) => fact.key === "rettshjelp.grense").value, "100 000 kroner.");
  assert.match(contentsFacts.find((fact) => fact.key === "naturskade.egenandel").value, /8 000 kroner/);
  assert.match(contentsFacts.find((fact) => fact.key === "sykkel.egenandel").value, /4 000 kroner/);
});

test("Tryg reiseulykke og Gjensidige katt peker på dokumentet som inneholder beløpet", () => {
  const premium = findCatalogProductBySelection("Tryg", "Reise", "Reise Premium");
  const invalidity = resolveCatalogFacts(premium, [], asOf).find((fact) => fact.key === "reise.ulykke.invaliditet");
  assert.equal(invalidity.source.documentId, "trygReiseSums");
  assert.equal(invalidity.source.filename, "Forsikringssummer-08.2026.pdf");
  assert.equal(invalidity.source.page, 3);

  const cat = findCatalogProductBySelection("Gjensidige", "Katt", "Behandling");
  const allergy = resolveCatalogFacts(cat, [], asOf).find((fact) => fact.key === "dyr.allergi.grense");
  assert.equal(allergy.source.documentId, "boat-pet:gjensidige:katt:treatment");
  assert.equal(allergy.source.filename, "gjensidige-cat-treatment-terms.pdf");
  assert.match(allergy.value, /5 000 kr/);
});

test("Gjensidige snøscooter-egenandel står på dekningsoversikten", () => {
  const product = findCatalogProductBySelection("Gjensidige", "Snøscooter", "Delkasko");
  const fire = resolveCatalogFacts(product, [], asOf).find((fact) => fact.key === "snoscooter.brann.dekning");
  assert.equal(fire.source.page, 1);
  assert.match(fire.value, /6 000 kr/);
});

test("Gjensidige hus bruker allmennlege i katalogteksten", () => {
  const help = productCatalog.products
    .filter((entry) => entry.providerId === "gjensidige" && entry.insuranceType === "Hus")
    .flatMap((product) => resolveCatalogFacts(product, [], asOf))
    .find((fact) => fact.key === "hus.service.helsehjelp");
  assert.ok(help);
  assert.match(help.value, /allmennlege/);
  assert.doesNotMatch(help.value, /allmenlege/u);
});

test("ett produkt har ikke to ulike verdier på samme nøkkel", () => {
  const addOns = productCatalog.addOns ?? [];
  for (const product of productCatalog.products) {
    const selections = [[]];
    for (const addOn of addOns) {
      if (addOn.providerId !== product.providerId) continue;
      if ((addOn.agreementScope ?? "ordinary") !== (product.agreementScope ?? "ordinary")) continue;
      if (addOn.insuranceTypes && !addOn.insuranceTypes.includes(product.insuranceType)) continue;
      if (addOn.requiresLevel && !addOn.requiresLevel.includes(product.productId)) continue;
      selections.push([addOn.id]);
    }
    for (const selected of selections) {
      let facts;
      try {
        facts = resolveCatalogFacts(product, selected, asOf);
      } catch {
        continue;
      }
      const values = new Map();
      for (const fact of facts) {
        const previous = values.get(fact.key);
        if (previous !== undefined && previous !== fact.value) {
          assert.fail(`${product.productId} +[${selected}] ${fact.key}`);
        }
        values.set(fact.key, fact.value);
      }
    }
  }
});

test("korrigerte sidefelt inneholder beløpet i den hash-verifiserte PDF-en", async () => {
  const checked = [
    ["tryg-utdanningsforbundet-bil-delkasko", "2026-07-01", "brann.egenandel"],
    ["tryg-utdanningsforbundet-bil-delkasko", "2026-07-01", "veihjelp.egenandel"],
    ["tryg-utdanningsforbundet-innbo", null, "ansvar.grense"],
    ["tryg-utdanningsforbundet-innbo", null, "rettshjelp.egenandel"],
    ["tryg-reise-premium", null, "reise.ulykke.invaliditet"],
    ["tryg-reise-premium", null, "reise.ulykke.behandling"],
    ["gjensidige-katt-behandling", null, "dyr.allergi.grense"],
    ["sb1-bil-toppkasko", null, "bilnokkel.egenandel"],
    ["fremtind-innbo-topp", null, "idtyveri.egenandel"],
    ["gj-innbo", null, "rettshjelp.egenandel"],
    ["gjensidige-reise", null, "reise.reiseavbrudd"],
  ];
  for (const [productId, version, key] of checked) {
    const product = productCatalog.products.find((entry) => entry.productId === productId && (version == null || entry.version === version));
    assert.ok(product, productId);
    const fact = resolveCatalogFacts(product, [], asOf).find((entry) => entry.key === key);
    assert.ok(fact, `${productId} ${key}`);
    const source = productCatalog.sources[fact.source.documentId];
    const file = pdfForSource(fact.source.filename, source?.sha256);
    assert.ok(file, fact.source.filename);
    const text = await pageText(file, fact.source.page);
    const missing = kronerAmounts(fact.value).filter((amount) => !text.includes(amount));
    assert.deepEqual(missing, [], `${productId} ${key} side ${fact.source.page} mangler ${missing.join(", ")}`);
  }
});
