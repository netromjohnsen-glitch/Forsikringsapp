import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const dental = "person.ulykke.utgifter.tannbehandling";
const treatment = "person.ulykke.utgifter";
const combatSports = "person.ulykke.unntak.kampsport";
const nitoGrunn = "tryg-nito-ulykke-grunn";
const nitoUtvidet = "tryg-nito-ulykke-utvidet";
const klp = "klp-person-ulykke";

function product(id, catalog = market) {
  const found = catalog.products.find(entry => entry.productId === id);
  assert.ok(found, id);
  return found;
}

function aligned(first, second, key) {
  function row(a, b) {
    const rows = compareCatalogProducts(product(a), product(b), market)
      .sections.flatMap(section => section.rows).filter(entry => entry.key === key);
    assert.equal(rows.length, 1, a + " / " + b + " / " + key);
    return rows[0];
  }
  const direct = row(first, second);
  const reverse = row(second, first);
  assert.equal(direct.label, reverse.label);
  assert.deepEqual(direct.first, reverse.second);
  assert.deepEqual(direct.second, reverse.first);
  return direct;
}

test("ulykke aligns deferred dental treatment and distinguishes treatment and settlement deadlines", () => {
  const threeYears = /under 18 år.*mer enn tre år.*Oppgjøret skjer innen tre år.*til forsikrede fyller 18 år/u;
  const tenYears = /under 18 år.*utover to år.*forhåndsgodkjenne.*ti år etter utgangen av skadeåret/u;
  for (const [id, route, pages, clause] of [
    ["tryg-person-ulykke", "tryg/ulykkesforsikring-skade", [2, 3], threeYears],
    ["tryg-person-familieulykke", "tryg/familieulykke", [3], threeYears],
    ["if-person-ulykke", "if/ulykkesforsikring", [5], tenYears],
    ["gjensidige-person-ulykke", "gjensidige/ulykkesforsikring", [8],
      /toårsfristen.*innen utgangen av kalenderåret forsikrede fyller 25 år.*det offentlige ikke dekker.*500 kr/u],
    ["storebrand-person-ulykke", "storebrand/ulykkesforsikring", [3], tenYears],
    ["frende-person-ulykke", "frende/ulykke-2026-11-20", [5],
      /under 18 år.*mer enn tre år.*Oppgjøret skal skje innen tre år.*tygging eller biting er unntatt/u],
    ["watercircles-person-ulykke", "watercircles/ulykkesforsikring", [5], tenYears],
    [nitoUtvidet, "tryg/nito-ulykke-utvidet", [6], threeYears],
  ]) {
    const answer = aligned(id, klp, dental);
    assert.equal(answer.label, "Utsatt permanent tannbehandling etter ulykke");
    assert.equal(answer.first.state, "included", id);
    assert.match(answer.first.text, clause, id);
    assert.deepEqual(answer.first.sources.map(termsSourceHref), pages.map(page => "/api/vilkar/" + route + "#page=" + page), id);
    assert.ok(answer.first.sources.every(source => source.sourceType === "full_terms"), id);
    assert.ok(!materializeCatalogProduct(product(id, raw), raw).facts.some(fact => fact.key === dental), id);
  }
  assert.match(aligned("if-person-ulykke", klp, dental).second.text, /utover tre år/u);
});

test("NITO Ulykke keeps the dental exception in Utvidet while both variants cite ordinary expense conditions", () => {
  const result = aligned(nitoGrunn, nitoUtvidet, dental);
  assert.equal(result.first.state, "unavailable");
  assert.equal(result.second.state, "included");
  assert.match(result.first.text, /ordinære treårsfristen.*ingen særregel/u);
  assert.deepEqual(result.first.sources.map(source => source.page), [5, 6]);
  assert.ok([...result.first.sources, ...result.second.sources].every(source => source.agreementScope === "nito"));

  const expenses = aligned(nitoGrunn, nitoUtvidet, treatment);
  for (const [cell, reference] of [[expenses.first, 6], [expenses.second, 7]]) {
    assert.match(cell.text, /innen tre år fra ulykken.*5 %.*500 kr.*fra annet hold.*mer enn tolv måneder.*nordisk folketrygd/u);
    assert.deepEqual(cell.sources.map(source => source.page), [2, reference]);
  }
});

test("NITO combat-sport exclusions retain the exception for unrelated accidents", () => {
  const mate = aligned(nitoGrunn, nitoUtvidet, combatSports);
  for (const cell of [mate.first, mate.second]) {
    assert.match(cell.text, /boksing, bryting, judo, karate.*unntatt.*uten å skyldes den/u);
    assert.ok(cell.sources.every(source => source.agreementScope === "nito"));
  }
  assert.deepEqual(mate.first.sources.map(source => source.page), [2, 3]);
  assert.deepEqual(mate.second.sources.map(source => source.page), [3]);
  assert.equal(aligned(nitoGrunn, "tryg-person-ulykke", combatSports).second.state, "unknown");
});
