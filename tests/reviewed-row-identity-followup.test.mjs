import assert from "node:assert/strict";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { productComparisonView } from "../lib/product-comparison-presentation.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

function getProduct(catalog, id) {
  const product = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(product, id);
  return product;
}

function view(first, second, catalog = market) {
  const result = compareCatalogProducts(getProduct(catalog, first), getProduct(catalog, second), catalog);
  return productComparisonView(result).flatMap(section => section.groups.flatMap(group => group.rows));
}

function row(rows, key) {
  const result = rows.find(candidate => candidate.key === key);
  assert.ok(result, key);
  return result;
}

function verifySource(side, documentId, physicalPage, section) {
  assert.deepEqual(side.sources.map(source => [source.documentId, source.page, source.section]),
    [[documentId, physicalPage, section]]);
}

const collisionDeductible = "kasko.egenandel.dyr";
const collisionBonus = "kasko.dyr.bonus";
const pestDamage = "kasko.skadedyr.dekning";
const waterCircles = "new-private:watercircles-bil.pdf";
const noDocumentation = "Ikke dokumentert i kataloggrunnlaget";

test("animal collision deductible and bonus align without treating pest damage as a collision", () => {
  for (const id of ["watercircles-bil-kasko", "watercircles-bil-elite"]) {
    const compared = view("bil-kasko", id);
    const reversed = view(id, "bil-kasko");
    const deductible = row(compared, collisionDeductible);
    assert.equal(deductible.label, "Påkjørsel av dyr – egenandel");
    assert.match(deductible.first.text, /2 000 kr ved erstatningsmessig kaskoskade/u);
    assert.doesNotMatch(deductible.first.text, /bonustap/u);
    assert.match(deductible.second.text, /Ingen egenandel.*omgående meldes til politi eller viltnemnd.*over 8 000 kr.*reduseres den med 8 000 kr/u);
    verifySource(deductible.first, "kasko", 1, "2.1");
    verifySource(deductible.second, waterCircles, 9, "7.4.5");
    assert.deepEqual(row(reversed, collisionDeductible).second, deductible.first);

    const bonus = row(compared, collisionBonus);
    assert.match(bonus.first.text, /Ingen bonustap.*så snart som mulig.*dokumenteres/u);
    assert.match(bonus.second.text, /Ingen bonustap.*politi eller viltnemnd/u);
    verifySource(bonus.second, waterCircles, 10, "9");

    const pests = row(compared, pestDamage);
    assert.match(pests.second.text, /uforutsett skade.*insekter, gnagere og andre skadedyr/u);
    assert.doesNotMatch(pests.second.text, /bygningsuavhengig|påkjørsel/u);
    assert.equal(pests.first.text, noDocumentation);
    verifySource(pests.second, waterCircles, 4, "3.2.4");
    assert.deepEqual(row(reversed, pestDamage).first, pests.second);
    assert.ok(!compared.some(r => r.key === "kasko.dyr"));
  }

  for (const peer of ["fremtind-bil-kasko", "klp-bil-kasko"]) {
    const deductible = row(view("bil-kasko", peer), collisionDeductible);
    assert.match(deductible.first.text, /2 000 kr/u);
    assert.doesNotMatch(deductible.second.text, /Ikke dokumentert/u);
  }

  const raw = row(view("bil-kasko", "watercircles-bil-kasko", productCatalog), "kasko.dyr");
  assert.match(raw.first.text, /Ingen bonustap.*egenandel 2 000 kr/u);
  assert.match(raw.second.text, /skadedyr/u);
});

test("WaterCircles Delkasko does not inherit the Kasko animal-collision deductible", () => {
  const result = view("bil-kasko", "watercircles-bil-delkasko");
  const deductible = row(result, collisionDeductible);
  assert.equal(deductible.second.state, "unavailable");
  assert.match(deductible.second.text, /Ordinær skade på egen bil ved påkjørsel av dyr inngår i Kasko/u);
  assert.doesNotMatch(deductible.second.text, /Ingen egenandel/u);
  verifySource(deductible.second, waterCircles, 4, "3.2.3–3.2.4");
  assert.ok(!result.some(r => r.key === pestDamage));
  assert.equal(row(result, collisionBonus).second.text, noDocumentation);
  const liability = materializeCatalogProduct(getProduct(market, "watercircles-bil-ansvar"), market);
  assert.ok(!liability.facts.some(fact => fact.key === collisionDeductible || fact.key === collisionBonus));
});

test("official general terms share one house row while document priority remains its own dimension", () => {
  for (const storebrand of ["storebrand-hus-standard", "storebrand-hus-super"]) {
    for (const frende of ["frende-hus-standard", "frende-hus-utvidet"]) {
      const result = view(storebrand, frende);
      const general = row(result, "hus.avtale.generelle");
      assert.equal(general.label, "Generelle avtalevilkår");
      assert.equal(result.filter(r => r.label === general.label).length, 1);
      verifySource(general.first, "storebrandHusGeneral", 1, "Generelle vilkår");
      verifySource(general.second, "frendeHusGeneral", 1, "Generelle vilkår");
      assert.deepEqual(row(view(frende, storebrand), general.key).second, general.first);
    }
  }
  const result = view("klp-hus-hus", "landkreditt-hus-standard");
  const rank = row(result, "hus.avtale.dokumentrang");
  assert.equal(rank.label, "Avtaledokumentenes rang");
  assert.match(rank.first.text, /beviset går foran vilkår og sikkerhetsforskrifter/u);
  assert.match(rank.second.text, /Bevis går foran vilkår\/sikkerhetsforskrifter/u);
  assert.ok(!result.some(r => r.key === "hus.avtale.generelle"));
});

test("delayed arrival shows three distinct benefits and preserves Landkreditt's daily amount", () => {
  const result = view("fremtind-reise", "landkreditt-reise");
  const holiday = row(result, "reise.forsinkelse.ankomst_tapt_ferie");
  const services = row(result, "reise.forsinkelse.ankomst_turisttjenester");
  const accommodation = row(result, "reise.forsinkelse.ankomst_kost_losji");
  assert.deepEqual([holiday.label, services.label, accommodation.label], [
    "Forsinket ankomst – tapt ferie", "Forsinket ankomst – ubenyttede turisttjenester", "Forsinket ankomst – kost og losji",
  ]);
  assert.match(holiday.first.text, /500 kr per påbegynt døgn per sikret, maksimalt 5 000 kr per person/u);
  assert.match(services.first.text, /Forhåndsbetalte utflukter.*5 000 kr per skadetilfelle/u);
  for (const benefit of [holiday, services]) {
    assert.match(benefit.first.text, /forsinkelse over åtte timer.*Reisearrangøren må dokumentere forsinkelsen skriftlig/u);
    assert.equal(benefit.second.text, noDocumentation);
    verifySource(benefit.first, "fremtindReiseUnifiedTerms", 6, "8.2");
  }
  assert.equal(accommodation.first.text, noDocumentation);
  assert.match(accommodation.second.text, /1 000 kr per person per påbegynt døgn.*reisearrangørens rutetabell/u);
  assert.deepEqual(accommodation.second.sources.map(termsSourceHref), ["/api/vilkar/landkreditt/reise#page=6"]);
  assert.deepEqual(row(view("landkreditt-reise", "fremtind-reise"), accommodation.key).first, accommodation.second);
  assert.ok(!result.some(r => r.key === "reise.forsinkelse.ankomst" || r.key === "reise.forsinkelse.ankomst_sum"));
});
