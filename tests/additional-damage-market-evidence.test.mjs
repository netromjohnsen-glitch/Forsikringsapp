import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsArchiveDocuments } from "../lib/terms-archive-documents.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const product = (id, catalog = marketProductCatalog) => catalog.products.find(entry => entry.productId === id);
const facts = (id, catalog = marketProductCatalog) => materializeCatalogProduct(product(id, catalog), catalog).facts;
const fact = (id, key, catalog) => {
  const matches = facts(id, catalog).filter(entry => entry.key === key);
  assert.equal(matches.length, 1, id + " " + key);
  return matches[0];
};
const compare = (a, b, key) => compareCatalogProducts(product(a), product(b), marketProductCatalog).sections
  .flatMap(section => section.rows).find(row => row.key === key);

const edition = "2026-11-20";
const frendePet = species => "frende-" + species + "-veterin-r";

test("Frende Hund og Katt bruker novemberutgaven og beholder gamle arkivhenvisninger", () => {
  for (const [species, pages, hash] of [
    ["hund", 5, "f3d8705de77e48544b28a1939950ebababdd86eb3450bd33260fd73080bd1657"],
    ["katt", 4, "72a9cc4d780af483eec974a6787cf96f7fa0281803fd7d68eb74c0bc723fc467"],
  ]) {
    const id = frendePet(species);
    const current = product(id);
    assert.equal(current.version, edition);
    const source = marketProductCatalog.sources[current.sourceId];
    assert.deepEqual(source.physicalPages, [1, pages]);
    const route = "/api/vilkar/frende/" + species + "-" + edition + "#page=";
    const archive = termsArchiveDocuments.find(doc => doc.provider === "frende" && doc.slug === species + "-" + edition);
    assert.equal(createHash("sha256").update(readFileSync(archive.archivePath)).digest("hex"), hash);
    assert.equal(source.sha256, hash);
    for (const citation of facts(id).flatMap(row => row.sources).filter(cite => cite.sourceType === "full_terms")) {
      assert.equal(citation.documentId, source.id);
      assert.ok(citation.page >= 1 && citation.page <= pages);
      assert.equal(termsSourceHref(citation), route + citation.page);
    }
    const prior = fact(id, "dyr.veterinar.dekning", productCatalog).sources[0];
    assert.equal(prior.effectiveFrom, "2026-01-01");
    assert.equal(termsSourceHref(prior), "/api/vilkar/frende/" + species + "#page=2");

    const euthanasia = compare(id, "if-" + species + "-standard", "dyr.veterinar.avliving");
    assert.equal(euthanasia.first.state, "included");
    assert.equal(euthanasia.second.state, "included");
    assert.match(euthanasia.first.text, /2 000 kr.*høyst 10 år.*Frende har erstattet/u);
    assert.match(fact(id, "dyr.allergi.dekning").value, /20 dagene.*tre måneder/u);
    const medicine = fact(id, "dyr.medisin.grense");
    assert.equal(medicine.state, "optional");
    assert.deepEqual(medicine.addOnNames, ["Medisin"]);
    assert.match(medicine.value, /20 000 kr per skadetilfelle og samlet per forsikringsår/u);
    const loss = fact(id, "dyr.liv.reduksjon.sats");
    assert.equal(loss.state, "optional");
    assert.deepEqual(loss.addOnNames, ["Tap"]);
    assert.match(loss.value, /20 %.*hvert hele år.*eldre enn 7 år/u);
    assert.equal(termsSourceHref(loss.sources[0]), route + pages);
  }
  const dogLimit = fact(frendePet("hund"), "dyr.veterinar.sum.valgbar");
  assert.deepEqual(dogLimit.sources.map(termsSourceHref), [
    "/api/vilkar/frende/hund-ipid#page=1", "/api/vilkar/frende/hund-2026-11-20#page=2",
  ]);
  assert.match(fact(frendePet("katt"), "dyr.veterinar.sum.valgbar").value, /per skadetilfelle og samlet per forsikringsår.*over flere år/u);
});

test("Tyveri og forsvinning vises med produktets dokumenterte vilkår", () => {
  const dog = compare(frendePet("hund"), "storebrand-hund-d-dsfall", "dyr.liv.forsvinning");
  assert.equal(dog.first.state, "optional");
  assert.match(dog.first.text, /tre måneder.*Frende og politiet/u);
  assert.equal(dog.second.state, "included");
  assert.match(dog.second.text, /annonsering.*3 måneder/u);
  const cat = compare(frendePet("katt"), "storebrand-katt-veterin-r-og-d-dsfall", "dyr.liv.forsvinning");
  assert.equal(cat.first.state, "unknown");
  assert.match(cat.second.text, /annonsering.*6 måneder/u);
  assert.match(fact(frendePet("katt"), "dyr.liv.dekning").value, /tyveri ved innbrudd/u);
  const catLimits = fact(frendePet("katt"), "dyr.liv.begrensning");
  assert.match(catLimits.value, /7\.4.*tre måneder.*uavklart.*6\.1/u);
  assert.equal(termsSourceHref(catLimits.sources[0]), "/api/vilkar/frende/katt-2026-11-20#page=3");

  for (const species of ["hund", "katt"]) {
    for (const level of ["d-dsfall", "veterin-r-og-d-dsfall"]) {
      const id = "storebrand-" + species + "-" + level;
      assert.equal(termsSourceHref(fact(id, "dyr.liv.forsvinning").sources[0]), "/api/vilkar/storebrand/dyr#page=9");
      assert.match(fact(id, "dyr.liv.geografi").value, /Hele verden/u);
      assert.match(fact(id, "dyr.liv.egenandel").value, /Ingen egenandel/u);
      if (species === "hund") {
        assert.match(fact(id, "hund.bruksverdi.alder").value, /fyller 7 år/u);
        assert.match(fact(id, "hund.bruksverdi.begrensning").value, /veterinær.*én gang/u);
      }
      assert.equal(facts(id).some(row => row.key === "dyr.veterinar.geografi"), level === "veterin-r-og-d-dsfall");
    }
    const vet = "storebrand-" + species + "-veterin-r";
    assert.match(fact(vet, "dyr.veterinar.geografi").value, /Europa/u);
    assert.ok(facts(vet).every(row => !/^dyr\.liv\.(forsvinning|geografi|egenandel)$/u.test(row.key)));
  }
});

test("Frende nybilerstatning, kaskoegenandel og rettshjelp viser riktig side og aldersgrense", () => {
  for (const motor of ["bil", "bobil"]) for (const level of ["kasko", "utvidet"]) {
    const id = "frende-" + motor + "-" + level;
    const kasko = level === "kasko";
    const route = "/api/vilkar/frende/" + motor + "-" + edition + "#page=";
    const age = fact(id, "nyverdi.alder");
    assert.match(age.value, kasko ? /Ikke eldre enn 1 år/u : /Ikke eldre enn 3 år/u);
    assert.match(fact(id, "nyverdi.km").value, kasko ? /15 000 km/u : /60 000 km/u);
    assert.equal(termsSourceHref(age.sources[0]), route + (kasko ? 3 : 4));
    assert.match(fact(id, "nyverdi.skadegrad").value, /mer enn 80 % av listeprisen/u);
    assert.equal(termsSourceHref(fact(id, "kasko.egenandel").sources[0]), route + 8);
  }
  for (const motor of ["mc", "bobil"]) {
    const route = "/api/vilkar/frende/" + motor + "-" + edition + "#page=";
    for (const level of ["ansvar", "delkasko", "kasko"]) {
      const legal = fact("frende-" + motor + "-" + level, "rettshjelp.geografi");
      assert.match(legal.value, /Norden/u);
      assert.equal(termsSourceHref(legal.sources[0]), route + 2);
    }
    assert.equal(termsSourceHref(fact("frende-" + motor + "-kasko", "kasko.egenandel").sources[0]), route + 8);
  }
  assert.equal(fact("frende-bil-kasko", "nyverdi.alder", productCatalog).value, "Under 1 år");
});

test("Gjensidige Hytte Standard og Pluss har én sammenligningsrad hver for omfang og beløpsgrense", () => {
  const standard = "gjensidige-hytte-standard";
  const pluss = "gjensidige-hytte-pluss";
  for (const [key, expected] of [
    ["hytte.tilpasning.dekning", /boligen.*varig rullestolbruker.*medfødt/u],
    ["hytte.tilpasning.grense", /250 000 kr samlet.*ti år.*20 år/u],
  ]) {
    const row = compare(standard, pluss, key);
    assert.equal(row.first.state, "included");
    assert.equal(row.second.state, "included");
    assert.match(row.first.text, expected);
    assert.match(row.second.text, expected);
    assert.equal(termsSourceHref(row.first.sources[0]), "/api/vilkar/gjensidige/hytte-standard-alminnelige#page=5");
    assert.equal(termsSourceHref(row.second.sources[0]), "/api/vilkar/gjensidige/hytte-pluss-alminnelige#page=5");
  }
});

test("If Reise viser at egenandel for leid transportmiddel kun inngår i Super", () => {
  const key = "reise.leiebil.egenandel";
  for (const level of ["basis", "standard"]) {
    const row = compare("if-reise-" + level, "if-reise-super", key);
    assert.equal(row.first.state, "unavailable");
    assert.match(row.first.text, /bare i Super/u);
    assert.equal(row.second.state, "included");
    assert.match(row.second.text, /tyveri eller ytre skade.*bobil inntil 7 500 kg.*over 50 cm³.*overnatting/u);
    assert.equal(termsSourceHref(row.second.sources[0]), "/api/vilkar/if/helars-reise-era3-4#page=21");
  }
  const cap = fact("if-reise-super", "reise.leiebil.egenandel_sum");
  assert.match(cap.value, /Ingen generell øvre forsikringssum/u);
  assert.equal(termsSourceHref(cap.sources[0]), "/api/vilkar/if/helars-reise-era3-4#page=22");
});
