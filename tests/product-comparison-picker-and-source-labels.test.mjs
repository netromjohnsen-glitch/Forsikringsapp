import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import {
  compareCatalogProducts, findProductComparisonProduct, prepareProductComparisonPicker, productComparisonInsuranceTypes,
  productComparisonOptions, productComparisonProducts, productComparisonProviders, productComparisonScopes,
} from "../lib/catalog-product-comparison.ts";
import { comparisonDocumentLinkLabel, comparisonSourcePresentation, comparisonSourceReferences } from "../lib/catalog-source-presentation.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { catalogProductIdentity } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function product(id) {
  const result = market.products.find(product => product.productId === id);
  assert.ok(result, id);
  return result;
}

function ownRow(id, key) {
  const entry = product(id);
  const row = compareCatalogProducts(entry, entry, market).sections.flatMap(section => section.rows)
    .find(candidate => candidate.key === key);
  assert.ok(row, key);
  return row;
}

const worktree = new URL("../", import.meta.url);

async function comparisonComponents() {
  const require = createRequire(import.meta.url);
  const path = new URL("app/components/product-comparison.tsx", worktree);
  const source = readFileSync(path, "utf8") + "\nexport { ProductSelector, ProductResult, TrygMemberOfferings };";
  const compiled = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const resolved = compiled.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_match, specifier) =>
    "from " + JSON.stringify(specifier.startsWith("@/")
      ? new URL(specifier.slice(2) + ".ts", worktree).href
      : pathToFileURL(require.resolve(specifier)).href));
  return import("data:text/javascript;base64," + Buffer.from(resolved).toString("base64"));
}

test("multiple documented options explicitly pair each limit with the product option that provides it", () => {
  const disability = ownRow("bil-ansvar", "ulykke.invaliditet");
  assert.equal(disability.first.state, "optional");
  assert.equal(disability.different, false);
  assert.deepEqual(disability.first.text.split("\n"), [
    "Tilgjengelig som tillegg",
    "Fører- og Passasjerulykke – Inntil 200 000 kr",
    "Fører- og Passasjerulykke Ekstra – Inntil 500 000 kr",
  ]);
  assert.deepEqual(disability.first.sources.map(termsSourceHref), [
    "/api/vilkar/tryg/bil-forer-passasjerulykke-pau28003#page=2",
    "/api/vilkar/tryg/bil-forer-passasjerulykke-ekstra-pau28013#page=2",
  ]);
  const rental = ownRow("bil-kasko", "leiebil.dager");
  assert.equal(rental.first.state, "optional");
  assert.deepEqual(rental.first.text.split("\n"), [
    "Tilgjengelig som tillegg",
    "Bil Ekstra / Elbil Ekstra – Inntil 60 dager",
    "Leiebil – Inntil 10 dager",
  ]);
  assert.deepEqual(rental.first, rental.second);
  const standalone = ownRow("bil-ansvar", "leiebil.dager");
  assert.equal(standalone.first.text, "Tilgjengelig som tillegg (Leiebil) – Inntil 10 dager");
});

test("same-page sources are distinguishable by their document or clause while keeping original links", async () => {
  const disability = ownRow("bil-ansvar", "ulykke.invaliditet").first;
  assert.deepEqual(comparisonSourceReferences(disability.sources), ["side 2 · PAU28003", "side 2 · PAU28013"]);
  const caravan = ownRow("tryg-campingvogn-brann-og-tyveri", "campingvogn.naturskade.begrensning").first;
  assert.deepEqual(comparisonSourceReferences(caravan.sources), ["side 2 · punkt 2.3", "side 2 · punkt 2.3 – unntak og egenandel"]);
  const { ProductResult } = await comparisonComponents();
  const entry = product("bil-ansvar");
  const html = renderToStaticMarkup(React.createElement(ProductResult, { result: compareCatalogProducts(entry, entry, market) }));
  assert.match(html, /Vis kilde · Offentlig vilkår · side 2 · PAU28003/u);
  assert.match(html, /Vis kilde · Offentlig vilkår · side 2 · PAU28013/u);
  for (const filename of ["pau28003", "pau28013"]) assert.ok(html.includes(filename + "#page=2"));
});

test("result cites the NITO clause once and retains distinct same-page clauses", async () => {
  const { ProductResult } = await comparisonComponents();
  const entry = product("tryg-nito-bil-ansvar");
  const result = compareCatalogProducts(entry, entry, market);
  const html = renderToStaticMarkup(React.createElement(ProductResult, { result }));
  for (const [key, name] of [["ansvar.dekning", "Ansvar"], ["rettshjelp.dekning", "Rettshjelp"]]) {
    const row = result.sections.flatMap(section => section.rows).find(candidate => candidate.key === key);
    assert.equal(row.first.sources.length, 1, "comparison cites the exact clause once");
    const actualDigest = market.sources[row.first.sources[0].documentId].sha256;
    assert.ok(actualDigest);
    assert.equal(actualDigest, market.sources["tryg-nito-bil-ansvar-terms"].sha256);
    assert.equal(actualDigest, market.sources["tryg-nito-bil-market-ansvar"].sha256);
    const disclosures = html.split('aria-label="Vis kilde: ' + name + ' – Produkt A');
    assert.equal(disclosures.length, 2, name);
    const [location] = disclosures[1].split("</details>");
    assert.match(location, /href="\/api\/vilkar\/tryg\/nito-bil-ansvar-pau25003#page=1"/u);
  }
  const caravan = product("tryg-campingvogn-brann-og-tyveri");
  const distinctClauses = renderToStaticMarkup(React.createElement(ProductResult, { result: compareCatalogProducts(caravan, caravan, market) }));
  assert.equal(distinctClauses.split('aria-label="Vis kilde: Naturskade – begrensninger – Produkt A').length, 3);
});

test("picker calls the HTML page a product page, an IPID a product sheet and links the exact member PDF", async () => {
  const { ProductSelector } = await comparisonComponents();
  const selectionCatalog = prepareProductComparisonPicker(market, new Date());
  const render = (id, insuranceType, side = "A") => {
    const entry = product(id);
    return renderToStaticMarkup(React.createElement(ProductSelector, {
      side, insuranceType, selectionCatalog,
      selection: { company: entry.company, agreementScope: entry.agreementScope ?? "ordinary", productIdentity: catalogProductIdentity(entry) },
      onChange() {}, onInvalidate() {},
    }));
  };
  const accident = render("gjensidige-person-ulykke", "Ulykke");
  assert.match(accident, /href="https:\/\/www\.gjensidige\.no\/forsikring\/personforsikring\/ulykkesforsikring"[^>]+>Åpne produktsiden<\/a>/u);
  assert.match(accident, /Åpne vilkår \(PDF\)/u);
  const health = render("if-person-helse", "Behandling");
  assert.match(health, /href="\/api\/vilkar\/if\/helseforsikring-produktark"[^>]+>Åpne produktark \(IPID\)<\/a>/u);
  const member = render("tryg-utdanningsforbundet-barneforsikring", "Barn", "B");
  assert.match(member, /aria-label="Vilkår for produkt B"/u);
  assert.match(member, /href="\/api\/vilkar\/tryg\/utdanningsforbundet-barneforsikring"[^>]+>Åpne vilkår \(PDF\)/u);
  assert.doesNotMatch(member, /href="\/api\/vilkar\/if\/barneforsikring"/u);
});

test("picker distinguishes the two Gjensidige child PDFs and surfaces both registered NITO base documents", async () => {
  const { ProductSelector } = await comparisonComponents();
  const selectionCatalog = prepareProductComparisonPicker(market, new Date());
  function render(id) {
    const entry = product(id);
    return renderToStaticMarkup(React.createElement(ProductSelector, {
      side: "A", insuranceType: entry.insuranceType, selectionCatalog,
      selection: { company: entry.company, agreementScope: entry.agreementScope ?? "ordinary", productIdentity: catalogProductIdentity(entry) },
      onChange() {}, onInvalidate() {},
    }));
  }
  for (const level of ["basis", "medium", "pluss"]) {
    const child = render("gjensidige-person-barn-" + level);
    assert.match(child, /href="\/api\/vilkar\/gjensidige\/barneforsikring"[^>]+>Åpne vilkår \(PDF\) · Barneforsikring<\/a>/u);
    assert.match(child, /href="\/api\/vilkar\/gjensidige\/uforepensjon-barn"[^>]+>Åpne vilkår \(PDF\) · Uførepensjon Barn<\/a>/u);
  }
  for (const [id, individualTerms] of [["tryg-nito-liv", "UUL41513"], ["tryg-nito-ufore-ekstra", "UUL41514"]]) {
    const member = render(id);
    assert.ok(member.includes("Åpne vilkår (PDF) · " + individualTerms));
    assert.match(member, /href="\/api\/vilkar\/tryg\/nito-person-produkt"[^>]+>Åpne vilkår \(PDF\) · UUL41847 · Felles produktvilkår<\/a>/u);
  }
  const otherAgreement = render("tryg-utdanningsforbundet-liv-medlem");
  assert.match(otherAgreement, /href="\/api\/vilkar\/tryg\/udf-liv-medlem"/u);
  assert.doesNotMatch(otherAgreement, /nito-person-produkt|UUL41847/u);
});

test("picker snapshot preserves identities, ordinary and member scopes, and eligibility on different dates", () => {
  const current = prepareProductComparisonPicker(market, new Date());
  const old = prepareProductComparisonPicker(market, new Date("2025-12-31"));
  assert.deepEqual(productComparisonProducts(current), productComparisonProducts(market));
  assert.deepEqual(productComparisonInsuranceTypes(current), productComparisonInsuranceTypes(market));
  assert.deepEqual(productComparisonProviders("Barn", current), productComparisonProviders("Barn", market));
  assert.deepEqual(productComparisonScopes("Barn", "Tryg", current), productComparisonScopes("Barn", "Tryg", market));
  const member = product("tryg-utdanningsforbundet-barneforsikring");
  const identity = catalogProductIdentity(member);
  assert.deepEqual(productComparisonOptions("Barn", "Tryg", "utdanningsforbundet", current), [member]);
  assert.deepEqual(findProductComparisonProduct(identity, current), member);
  assert.equal(findProductComparisonProduct(identity, old), null);
});

test("external and archived member terms preserve the product comparison tab", async () => {
  const { TrygMemberOfferings } = await comparisonComponents();
  const html = renderToStaticMarkup(React.createElement(TrygMemberOfferings));
  assert.match(html, /href="https:\/\/www\.tryg\.no\/odpdf\?vilk=nito-bil-kasko&amp;vilkNr=05PAU25205" target="_blank" rel="noopener noreferrer"/u);
  assert.match(html, /href="\/api\/vilkar\/tryg\/nito-reise-familie" target="_blank" rel="noopener noreferrer"/u);
});

test("legacy product sheets are labelled as IPID and open on the cited physical PDF page", async () => {
  const examples = [
    ["gj-bil-ansvar", "tilbehor.utvidelse", "gjUtvidetUtstyr", 1],
    ["frende-bil-kasko", "maskinskade.unntak", "frendeIpid", 2],
    ["if-innbo-super", "garanti.super", "ifInnboIpid", 1],
    ["if-hus-basis", "hus.avtale.ipid", "ifHusIpid", 1],
    ["storebrand-hus-standard", "hus.avtale.ipid", "storebrandHusIpid", 1],
    ["gjensidige-hus", "hus.avtale.ipid", "gjensidigeHusIpid", 1],
    ["fremtind-hus-standard", "hus.avtale.ipid", "fremtindHusIpid", 1],
    ["frende-hus-standard", "hus.avtale.ipid", "frendeHusIpid", 1],
    ["fremtind-reise", "reise.varighet.maks", "fremtindReiseUnifiedIpid", 2],
    ["frende-reiseforsikring", "reise.avtale.ipid", "frendeReiseIpid", 1],
    ["eika-fremtind-snoscooter-ansvar", "snoscooter.ansvar.dekning", "vehicle:fremtind-IPID_Snoscooter.pdf", 1],
  ];
  for (const [productId, key, documentId, page] of examples) {
    const citation = ownRow(productId, key).first.sources.find(source => source.documentId === documentId);
    assert.ok(citation, documentId);
    assert.equal(comparisonSourcePresentation(citation).label, "IPID / produktark", documentId);
    assert.equal(comparisonSourcePresentation(citation).page, `side ${page}`, documentId);
    const href = termsSourceHref(citation);
    assert.ok(href.endsWith(`#page=${page}`), href);
    assert.equal(comparisonDocumentLinkLabel(citation, href), "Åpne produktark (IPID)", documentId);
  }

  const { ProductResult } = await comparisonComponents();
  const entry = product("if-innbo-super");
  const html = renderToStaticMarkup(React.createElement(ProductResult, { result: compareCatalogProducts(entry, entry, market) }));
  assert.match(html, /Vis kilde · IPID \/ produktark<\/summary>/u);
  assert.ok(html.includes("https://if.no/apps/vilkarsbasendokument/IPID?ipid=Innboforsikring#page=1"));
});

test("Inkludert-status gjentas ikke i samme celle, og fakta og kilde beholdes", () => {
  const row = ownRow("storebrand-mc-kasko-motor10", "rettshjelp.dekning");
  for (const cell of [row.first, row.second]) {
    assert.equal(cell.state, "included");
    assert.equal(cell.text, "✓ Inkludert");
    assert.ok(cell.facts.some(fact => fact.value === "Inkludert"));
    assert.ok(cell.sources.some(source => source.page > 0 && termsSourceHref(source)));
  }
  assert.equal(row.different, false);
});
