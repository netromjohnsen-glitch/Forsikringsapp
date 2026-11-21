import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct, productComparisonProducts } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { addVehicleExtensionMarketEvidence } from "../lib/vehicle-extension-market-evidence.ts";

const marketProducts = productComparisonProducts(marketProductCatalog);
const findProduct = (id, catalog = marketProductCatalog) => catalog.products.find(product => product.productId === id);
const factsFor = (id, catalog = marketProductCatalog) => materializeCatalogProduct(findProduct(id, catalog), catalog).facts;
function fact(id, key) {
  const matches = factsFor(id).filter(row => row.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
}
function row(first, second, key) {
  const left = marketProducts.find(product => product.productId === first);
  const right = marketProducts.find(product => product.productId === second);
  return compareCatalogProducts(left, right, marketProductCatalog)
    .sections.flatMap(section => section.rows).find(row => row.key === key);
}

test("Gjensidige tilhenger viser både verkstedtransport og egne egenandeler", () => {
  for (const tier of ["delkasko", "kasko"]) {
    const id = "gjensidige-tilhenger-" + tier;
    const peer = "storebrand-tilhenger-" + (tier === "delkasko" ? "brann-og-tyveri" : "kasko");
    const rescue = row(id, peer, "tilhenger.redning.dekning");
    const deductible = row(id, peer, "tilhenger.redning.egenandel");
    assert.equal(rescue.first.state, "included");
    assert.match(rescue.first.text, /tauing til nærmeste verksted.*utelåsing.*hjemtransport/u);
    assert.equal(deductible.first.state, "included");
    assert.equal(deductible.second.state, "included");
    assert.match(deductible.first.text, /750 kr/u);
    assert.match(fact(id, "tilhenger.brann.egenandel").value, /4 000 kr/u);
    assert.match(fact(id, "tilhenger.tyveri.egenandel").value, /4 000 kr/u);
    const archive = "/api/vilkar/gjensidige/tilhenger-" + tier + "#page=";
    assert.equal(termsSourceHref(deductible.first.sources[0]), archive + 1);
    assert.equal(termsSourceHref(rescue.first.sources[0]), archive + 2);
  }
  assert.match(fact("gjensidige-tilhenger-kasko", "tilhenger.kasko.egenandel").value, /6 000 kr/u);
  assert.ok(factsFor("gjensidige-tilhenger-delkasko").every(row => row.key !== "tilhenger.kasko.egenandel"));
});

test("Gjensidige og Storebrand campingvogn viser veihjelpsegenandelen på samme rad", () => {
  for (const [gjensidige, storebrand] of [["delkasko", "brann-og-tyveri"], ["kasko", "kasko"], ["pluss", "super"]]) {
    const first = "gjensidige-campingvogn-" + gjensidige;
    const second = "storebrand-campingvogn-" + storebrand;
    const deductible = row(first, second, "campingvogn.redning.egenandel");
    assert.equal(deductible.first.state, "included");
    assert.equal(deductible.second.state, "included");
    assert.match(deductible.first.text, /750 kr/u);
    assert.match(deductible.second.text, /750 kr/u);
    assert.equal(termsSourceHref(deductible.first.sources[0]),
      "/api/vilkar/gjensidige/campingvogn-" + gjensidige + "#page=1");
    assert.equal(termsSourceHref(deductible.second.sources[0]),
      "/api/vilkar/storebrand/campingvogn-tilhenger-camp02#page=6");
    const towing = fact(first, "campingvogn.redning.dekning");
    assert.match(towing.value, /nærmeste verksted.*står på vei og var kjørbar før skaden/u);
    assert.equal(termsSourceHref(towing.sources[0]), "/api/vilkar/gjensidige/campingvogn-" + gjensidige + "#page=3");
  }
});

test("Gjensidige campingvogn skiller Delkasko fra Kasko og Pluss for glass", () => {
  const delkasko = "gjensidige-campingvogn-delkasko";
  for (const tier of ["kasko", "pluss"]) {
    const id = "gjensidige-campingvogn-" + tier;
    const glass = row(delkasko, id, "campingvogn.glass.dekning");
    assert.equal(glass.first.state, "unavailable");
    assert.equal(glass.second.state, "included");
    assert.match(glass.first.text, /ingen egen dekning/u);
    assert.match(glass.second.text, /Bruddskade på ruter og takluker/u);
    assert.match(fact(id, "campingvogn.glass.grense").value, /1 000 kr ved reparasjon/u);
    assert.match(fact(id, "campingvogn.glass.egenandel").value, /0 kr ved reparasjon; 3 000 kr ved skifte/u);
    assert.equal(termsSourceHref(fact(id, "campingvogn.glass.grense").sources[0]),
      "/api/vilkar/gjensidige/campingvogn-" + tier + "#page=1");
  }
  assert.ok(factsFor(delkasko).every(row => !["campingvogn.glass.grense", "campingvogn.glass.egenandel"].includes(row.key)));
  const raw = factsFor(delkasko, productCatalog).find(row => row.key === "campingvogn.glass.dekning");
  assert.equal(raw.value, "Inkludert i produktnivået");
});

test("Storebrand snøscooter viser særregelen for transport og riktige nivåer", () => {
  for (const tier of ["ansvar", "delkasko", "kasko"]) {
    const id = "storebrand-snoscooter-" + tier + "-motor10";
    assert.match(fact(id, "snoscooter.avtale.geografi").value, /Europa.*Kosovo.*Rettshjelp gjelder i Norden/u);
    assert.match(fact(id, "snoscooter.rettshjelp.egenandel").value, /4 000 kr pluss 20 %/u);
    assert.match(fact(id, "snoscooter.rettshjelp.grense").value, /100 000 kr per tvist.*minst tre.*250 000 kr/u);
    assert.equal(termsSourceHref(fact(id, "snoscooter.rettshjelp.egenandel").sources[0]), "/api/vilkar/storebrand/motor10#page=33");
    assert.match(fact(id, "snoscooter.ulykke.grense").value, /100 000 kr ved dødsfall innen to år.*200 000.*500 000/u);
    assert.match(fact(id, "snoscooter.ulykke.dekning").value, /må stå i forsikringsbeviset/u);
    if (tier === "ansvar") {
      assert.ok(factsFor(id).every(row => !row.key.startsWith("snoscooter.redning.")));
      continue;
    }
    assert.match(fact(id, "snoscooter.brann.egenandel").value, /8 000 kr/u);
    assert.match(fact(id, "snoscooter.tyveri.egenandel").value, /8 000 kr/u);
    assert.match(fact(id, "snoscooter.redning.geografi").value, tier === "delkasko" ? /Norden/u : /Europa/u);
    const limits = fact(id, "snoscooter.redning.begrensning");
    assert.match(limits.value, /50 %.*halvparten.*Andre transportutgifter/u);
    assert.equal(termsSourceHref(limits.sources[0]), "/api/vilkar/storebrand/motor10#page=11");
    assert.equal(termsSourceHref(fact(id, "snoscooter.redning.egenandel").sources[0]), "/api/vilkar/storebrand/motor10#page=12");
  }
});

test("Fremtind/Eika snøscooter viser dødsfallssum og vilkårets to invaliditetsledd", () => {
  for (const tier of ["ansvar", "minikasko", "kasko"]) {
    const id = "eika-fremtind-snoscooter-" + tier;
    const sum = fact(id, "snoscooter.ulykke.grense");
    assert.match(sum.value, /100 000 kr ved dødsfall.*ellers 50 000 kr.*innen ett år/u);
    assert.match(sum.value, /punkt 2 200 000 kr for voksne og 1 000 000 kr for barn under 20 år.*punkt 5.2.*uten å gjenta/u);
    assert.equal(termsSourceHref(sum.sources[0]), "/api/vilkar/fremtind/kasko-snoscooter#page=2");
    assert.ok(factsFor(id, productCatalog).every(row => row.key !== "snoscooter.ulykke.grense"));
  }
});

test("Kjøretøyrettingene er utgavebundne og lenker til eksakte arkivutgaver", () => {
  for (const [id, key] of [
    ["gjensidige-tilhenger-delkasko", "tilhenger.redning.egenandel"],
    ["gjensidige-tilhenger-kasko", "tilhenger.redning.egenandel"],
    ["gjensidige-campingvogn-delkasko", "campingvogn.redning.egenandel"],
    ["gjensidige-campingvogn-kasko", "campingvogn.glass.grense"],
    ["gjensidige-campingvogn-pluss", "campingvogn.glass.grense"],
    ["storebrand-campingvogn-super", "campingvogn.redning.egenandel"],
    ["storebrand-snoscooter-kasko-motor10", "snoscooter.redning.begrensning"],
    ["eika-fremtind-snoscooter-kasko", "snoscooter.ulykke.grense"],
  ]) {
    const source = fact(id, key).sources[0];
    const archive = termsArchiveDocuments.find(entry =>
      termsSourceHref(source) === "/api/vilkar/" + entry.provider + "/" + entry.slug + "#page=" + source.page);
    assert.ok(archive, id);
    const actualHash = createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex");
    assert.equal(actualHash, marketProductCatalog.sources[source.documentId].sha256, id);
  }

  const id = "gjensidige-tilhenger-delkasko";
  const sourceId = findProduct(id).sourceId;
  const sources = { ...marketProductCatalog.sources, [sourceId]: { ...marketProductCatalog.sources[sourceId], sha256: "ny-utgave" } };
  const facts = { ...productCatalog.facts };
  addVehicleExtensionMarketEvidence(sources, facts, marketProductCatalog.products);
  assert.equal(facts[id], productCatalog.facts[id]);

  const counterparty = "gjensidige-tilhenger-kasko";
  const previous = facts[counterparty].find(row => row.key === "tilhenger.redning.dekning").value;
  addVehicleExtensionMarketEvidence(sources, facts, marketProductCatalog.products);
  assert.equal(facts[counterparty].find(row => row.key === "tilhenger.redning.dekning").value, previous);
});
