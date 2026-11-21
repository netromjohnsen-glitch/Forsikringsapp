import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { availableAddOns, productCatalog, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const active = new Map(productComparisonProducts(marketProductCatalog).map(product => [product.productId, product]));
const get = (id, key) => materializeCatalogProduct(active.get(id), marketProductCatalog).facts.find(fact => fact.key === key);
const compare = (a, b) => compareCatalogProducts(active.get(a), active.get(b), marketProductCatalog)
  .sections.flatMap(section => section.rows);

test("Gjensidige cat terms fill the comparison from the actual Behandling PDF", () => {
  const rows = compare("gjensidige-katt-behandling", "tryg-katt-behandling");
  for (const [key, state, value] of [
    ["dyr.diagnostikk.dekning", "included", /MR og CT/u],
    ["dyr.medisin.dekning", "included", /journal eller attest/u],
    ["dyr.tannskade.dekning", "included", /permanente.*brudd/u],
    ["dyr.fodsel.dekning", "included", /ett år/u],
    ["dyr.karenstid.sykdom", "included", /20 dagene/u],
    ["dyr.rehabilitering.dekning", "unavailable", /unntatt/u],
  ]) {
    const row = rows.find(entry => entry.key === key);
    assert.equal(row.first.state, state, key);
    assert.match(row.first.text, value);
    assert.equal(termsSourceHref(row.first.sources[0]), "/api/vilkar/gjensidige/katt-behandling#page=2");
  }
  assert.ok(!resolveCatalogFacts(active.get("gjensidige-katt-behandling"), []).some(f => f.key === "dyr.medisin.dekning"));
});

test("If terms preserve the species, tier and optional status", () => {
  for (const species of ["hund", "katt"]) for (const level of ["basis", "standard", "super"]) {
    const id = "if-" + species + "-" + level;
    const birth = get(id, "dyr.fodsel.dekning");
    assert.match(birth.value, /ett år/u);
    assert.equal(birth.value.includes("Norsk Kennel Klubbs"), species === "hund");
    assert.equal(termsSourceHref(birth.sources[0]), "/api/vilkar/if/" + species + "-veterinar#page=5");
    const litter = get(id, "dyr.fodsel.kull.dekning");
    assert.equal(litter.state, "optional");
    assert.equal(litter.value.includes("før kattemoren fyller seks"), species === "katt");
    assert.ok(!availableAddOns(active.get(id), new Date(), null, productCatalog)
      .some(addOn => addOn.id === "if-katt-kattunge" || addOn.id === "if-hund-valpekull"));
  }
  const cap = get("if-katt-super", "dyr.tannsykdom.grense");
  assert.match(cap.value, /Tannresorpsjon.*5 000 kr per år/u);
  assert.equal(termsSourceHref(cap.sources[0]), "/api/vilkar/if/katt-veterinar#page=4");
  assert.ok(!get("if-hund-super", "dyr.tannsykdom.grense").value.includes("5 000"));
});

test("Tryg dog age and litter benefits keep their separate components", () => {
  const age = get("tryg-hund-behandling", "dyr.liv.reduksjon.start");
  assert.match(age.value, /7 år.*5 år.*9 år/u);
  assert.equal(age.state, "optional");
  assert.equal(termsSourceHref(age.sources[0]), "/api/vilkar/tryg/hund-liv#page=2");
  assert.equal(get("tryg-hund-behandling", "hund.bruksverdi.grense").state, "optional");
  const litter = get("tryg-katt-behandling", "dyr.fodsel.kull.grense");
  assert.match(litter.value, /5 000 kr per kattunge og 10 000 kr per kull/u);
  assert.deepEqual(litter.addOnNames, ["Ekstra"]);
});
