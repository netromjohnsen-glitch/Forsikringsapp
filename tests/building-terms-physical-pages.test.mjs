import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
import { materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

PDFParse.setWorker(getPath());

function catalogFact(productId, key, catalog) {
  const entry = catalog.products.find(product => product.productId === productId);
  assert.ok(entry, productId);
  const fact = catalog === marketProductCatalog
    ? materializeCatalogProduct(entry, catalog).facts.find(candidate => candidate.key === key)
    : resolveCatalogFacts(entry, [], new Date("2026-11-20"), null, catalog).find(candidate => candidate.key === key);
  assert.ok(fact, `${productId}/${key}`);
  return fact;
}

async function checkPages(file, examples) {
  const data = await readFile(new URL("../catalog/sources/" + file, import.meta.url));
  const parser = new PDFParse({ data });
  try {
    const { pages } = await parser.getText();
    for (const [productId, key, page, content, value] of examples) {
      const market = catalogFact(productId, key, marketProductCatalog);
      assert.equal(market.sources[0].page, page, `${productId}/${key} comparison`);
      assert.match(termsSourceHref(market.sources[0]), new RegExp(`#page=${page}$`, "u"));
      assert.match(pages[page - 1].text.replace(/\s+/gu, " "), content, `${file} p${page}`);
      if (value) assert.match(market.value, value, `${productId}/${key}`);
    }
  } finally {
    await parser.destroy();
  }
}

test("shared Storebrand building terms open the actual clause for both houses and cabins", async () => {
  await checkPages("storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf", [
    ["storebrand-hus-standard", "hus.bygninger.tilbehor", 6, /grunnmur, fundamenter, innvendige rør/iu],
    ["storebrand-hus-standard", "hus.elektrisk.dekning", 8, /B\.4\.2 Lynnedslag og elektrisk fenomen/iu],
    ["storebrand-hus-standard", "hus.tyveri.dekning", 11, /B\.4\.6 Tyveri og skadeverk/iu],
    ["storebrand-hus-standard", "hus.brukstap.dekning", 18, /B\.5\.2 Ekstra boutgifter og tapt leieinntekt/iu],
    ["storebrand-hus-standard", "hus.ansvar.grense", 40, /5 000 000 kr ved hvert skadetilfelle/iu],
    ["storebrand-hus-standard", "hus.rettshjelp.grense", 41, /250 000 kroner/iu],
    ["storebrand-hus-super", "hus.takvegg.folgeskade", 34, /C\.1\.1 Følgeskader ved vanninntrengning/iu],
    ["storebrand-hus-super", "hus.handverker.folgeskade", 36, /C\.1\.5 Håndverkerfeil/iu],
    ["storebrand-hus-super", "hus.vann.vannstopper", 37, /C\.1\.6 Skadeforebyggende tiltak/iu],
    ["storebrand-hytte-super", "hytte.vatrom.selverommet", 36, /våtrommet er utett.*oppstått en lekkasje/iu],
    ["storebrand-hytte-standard", "hytte.gjenoppforing.markedsverdi", 22, /B\.6\.3\.3 Kjøp av annen bolig/iu],
    ["storebrand-hus-standard", "hus.tilpasning.grense", 17, /maksimalt 500 000 kroner.*både hus- og innboforsikring/iu,
      /500 000 kroner samlet.*50 %.*fem år.*to år/u],
  ]);
});

test("Fremtind distinguishes Standard and Topp references and links continuation clauses", async () => {
  assert.equal(catalogFact("fremtind-hus-standard", "hus.ror.tining", productCatalog).source.page, 3);
  assert.equal(catalogFact("storebrand-hus-standard", "hus.elektrisk.dekning", productCatalog).source.page, 7);
  await checkPages("fremtind/hus/canonical/Vilkar_Topp_Hus.pdf", [
    ["fremtind-hus-standard", "hus.hage.basseng", 3, /basseng og boblebad.*200 000 kroner/iu],
    ["fremtind-hus-standard", "hus.ror.tining", 4, /50 000 kroner/iu],
    ["fremtind-hus-standard", "hus.naturskade.egenandel", 8, /6\.7 Naturskade.*8 000 kroner/iu],
    ["fremtind-hus-standard", "hus.andrebygninger.endring", 5, /forholdet mellom bygningens verdi før og etter/iu,
      /andelen av skaden.*forholdet mellom bygningens verdi før og etter/u],
    ["fremtind-hus-topp", "hus.andrebygninger.endring", 1, /Verdiøkningen skal meldes/iu, /utløpet av avtaleperioden/u],
  ]);
  for (const [key, pages] of [["hus.pabud.dekning", [3, 6]], ["hus.leietap.skade", [6, 7]]]) {
    const fact = catalogFact("fremtind-hus-standard", key, marketProductCatalog);
    assert.deepEqual(fact.sources.map(source => source.page), pages, key);
  }
});
