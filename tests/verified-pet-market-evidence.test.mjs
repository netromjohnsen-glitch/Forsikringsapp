import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const products = new Map(productComparisonProducts(marketProductCatalog).map(product => [product.productId, product]));
const materialize = (id, catalog = marketProductCatalog) => materializeCatalogProduct(products.get(id), catalog).facts;
function fact(id, key) {
  const match = materialize(id).filter(entry => entry.key === key);
  assert.equal(match.length, 1, id + " " + key);
  return match[0];
}
function hrefs(entry) {
  return entry.sources.map(termsSourceHref);
}
function compare(a, b, key) {
  return compareCatalogProducts(products.get(a), products.get(b), marketProductCatalog)
    .sections.flatMap(section => section.rows).find(row => row.key === key);
}

test("Veterinærbehandling sammenligner geografi uten å blande behandling og skadested", () => {
  const key = "dyr.veterinar.geografi";
  for (const species of ["hund", "katt"]) {
    const storebrand = "storebrand-" + species + "-veterin-r";
    const sparebank = "sparebank1-fremtind-" + species + "-veterin-r";
    const item = fact(storebrand, key);
    assert.match(item.value, /oppstå i Europa.*Behandling dekkes i Norge.*Ved akutte/u);
    assert.deepEqual(hrefs(item), ["/api/vilkar/storebrand/dyr#page=3", "/api/vilkar/storebrand/dyr#page=4"]);
    assert.equal(fact(sparebank, key).value, "Hele verden.");
    for (const [a, b] of [[storebrand, sparebank], [sparebank, storebrand]]) {
      const row = compare(a, b, key);
      assert.match(row.label, /Veterinærforsikring – område/u);
      assert.deepEqual([row.first.state, row.second.state], ["included", "included"]);
      assert.deepEqual(row.first.facts, [fact(a, key)]);
      assert.deepEqual(row.second.facts, [fact(b, key)]);
    }
    assert.ok(!materialize("storebrand-" + species + "-d-dsfall").some(entry => entry.key === key));
    assert.equal(fact("tryg-" + species + "-behandling", key).value, "Europa.");
  }
  assert.deepEqual(hrefs(fact("gjensidige-katt-behandling", key)), ["/api/vilkar/gjensidige/ipid-katt#page=2"]);
  assert.deepEqual(hrefs(fact("gjensidige-hund-behandling", key)), ["/api/vilkar/gjensidige/hund-behandling#page=2"]);
});

test("Ifs Basis skiller medisiner hos veterinæren fra separat kjøp med Standard og Super", () => {
  for (const species of ["hund", "katt"]) {
    for (const level of ["basis", "standard", "super"]) {
      const id = "if-" + species + "-" + level;
      const item = fact(id, "dyr.medisin.dekning");
      assert.match(item.value, /behandlingen hos veterinæren, innenfor valgt veterinærsum/u);
      assert.match(item.value, level === "basis" ? /Separat kjøp.*krever Standard eller Super/u : /Omfatter også separat kjøp/u);
      assert.deepEqual(hrefs(item), ["/api/vilkar/if/" + species + "-veterinar#page=4"]);
      assert.equal(fact(id, "dyr.liv.geografi").state, "optional");
      assert.equal(fact(id, "dyr.fodsel.kull.geografi").state, "optional");
      assert.equal(fact(id, "dyr.veterinar.geografi").state, "included");
      assert.ok(!materialize(id, productCatalog).some(entry => entry.key === "dyr.veterinar.geografi"));
    }
  }
});

test("Fremtind skiller karenstidene og bevarer kattens eksisterende egenandeler", () => {
  const cat = "sparebank1-fremtind-katt-veterin-r";
  const dog = "sparebank1-fremtind-hund-veterin-r";
  for (const id of [cat, dog]) {
    assert.match(fact(id, "dyr.karenstid.sykdom").value, /20 dager.*bare ulykkesskade.*flytting/u);
    assert.match(fact(id, "dyr.karenstid.allergi").value, /60 dager.*allergi, hud- og øreproblemer/u);
    assert.match(fact(id, "dyr.fodsel.dekning").value, /Ett keisersnitt.*minst ett år/u);
  }
  assert.match(fact(cat, "dyr.veterinar.egenandel.fast").value, /4 000/u);
  assert.match(fact(dog, "dyr.veterinar.egenandel.fast").value, /3 500/u);
  for (const [key, value] of [
    ["dyr.veterinar.egenandel.prosent", /20 %.*etter fast egenandel/u],
    ["dyr.veterinar.egenandel.periode", /135 dager.*kun én fast egenandel/u],
  ]) {
    const item = fact(cat, key);
    assert.match(item.value, value);
    assert.deepEqual(hrefs(item), ["/api/vilkar/fremtind/katt-behandling#page=2"]);
    assert.equal(item.value, materialize(cat, productCatalog).find(entry => entry.key === key).value);
  }
});

test("Gjensidige viser ulykkestann, rehabilitering og fødselshjelp på egne hunderader", () => {
  const dog = "gjensidige-hund-behandling";
  const dental = fact(dog, "dyr.tannskade.dekning");
  assert.match(dental.value, /tannfraktur.*ulykke/u);
  assert.doesNotMatch(fact(dog, "dyr.tannsykdom.dekning").value, /ulykke/u);
  assert.match(fact(dog, "dyr.fodsel.dekning").value, /20 måneder.*minst ett år/u);
  const rehabilitation = fact(dog, "dyr.rehabilitering.dekning");
  assert.match(rehabilitation.value, /tre måneder.*henviser til/u);
  assert.deepEqual(hrefs(rehabilitation), ["/api/vilkar/gjensidige/hund-behandling#page=3", "/api/vilkar/gjensidige/hund-behandling#page=8"]);
  assert.equal(fact("gjensidige-katt-behandling", "dyr.rehabilitering.dekning").state, "unavailable");
});

test("Tryg gir eksakte behandlingsgrenser for begge arter", () => {
  for (const species of ["hund", "katt"]) {
    const id = "tryg-" + species + "-behandling";
    const medicines = fact(id, "dyr.medisin.dekning");
    assert.match(medicines.value, /rekvirert og ordinert av veterinær/u);
    assert.match(fact(id, "dyr.inntaksalder.min").value, /35 dager/u);
    assert.match(fact(id, "dyr.veterinar.spesialfor.grense").value, /50 %.*spesialfôr og spesialsjampo/u);
    assert.match(fact(id, "dyr.veterinar.avliving").value, /Kremering er unntatt fra Behandling/u);
    assert.deepEqual(hrefs(medicines), ["/api/vilkar/tryg/" + species + "-behandling#page=1"]);
  }
});
