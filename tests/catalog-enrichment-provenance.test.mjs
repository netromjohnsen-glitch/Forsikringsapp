import assert from "node:assert/strict";
import test from "node:test";
import { enrichExtractedAgreementWithCatalog } from "../lib/catalog-enrichment.ts";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { canonicalCoverage } from "../lib/coverage-status.ts";
import { normalizeManualAgreement } from "../lib/manual-agreement.ts";
import { productCatalog, resolveCatalogFacts, resolveAddOnPackage, catalogProductIdentity, catalogReferenceForProduct } from "../lib/product-catalog.ts";

const asOf = new Date("2026-10-03T00:00:00Z");
const registered = productCatalog.products.find(p => p.productId === "tryg-bobil-kasko");
const registeredAddOn = productCatalog.addOns.find(a => a.id === "tryg-bobil-maskinskade");
assert.ok(registered);
assert.ok(registeredAddOn);
const setup = (variant = "distinct") => {
  const product = { ...registered, sourceId: "provenance-base", componentIds: ["provenance-base"] };
  const source = (id, sourceType = "full_terms") => ({ id, filename: `${id}.pdf`, termsNumber: "PROVENANCE-SYNTHETIC", effectiveFrom: "2026-01-01",
    company: product.company, providerId: product.providerId, insuranceType: product.insuranceType,
    agreementScope: "ordinary", productIds: [product.productId], productVersion: product.version, sourceType });
  const sources = { "provenance-base": source("provenance-base"), "provenance-addon": source("provenance-addon"), "provenance-web": source("provenance-web", "product_page") };
  const reference = id => ({ documentId: id, filename: sources[id].filename, termsNumber: sources[id].termsNumber,
    effectiveFrom: sources[id].effectiveFrom, company: product.company, agreementScope: "ordinary", page: 1, section: "Coverage",
    url: `https://example.invalid/${id}`, productCode: "TEST", version: "1", note: `Original note ${id}; SHA-256 ${"a".repeat(64)}` });
  const primary = reference("provenance-base");
  const qualifier = variant === "identical" ? { ...primary } : variant === "location" ? { ...primary, page: 2, section: "Qualification" }
    : variant === "metadata" ? { ...primary, version: "2", note: "Distinct qualification note" } : reference("provenance-web");
  const fact = (key, label, value, source = primary) => ({ key, label, value, coverageAvailability: "included", source,
    ...(variant === "single" ? {} : { qualificationSource: qualifier }) });
  const base = fact("leiebil.dekning", "Leiebil", "Erstatningsbil ved verkstedreparasjon");
  const addon = fact("maskinskade.dekning", "Maskinskade", "Inkludert", reference("provenance-addon"));
  const addOn = { ...registeredAddOn, componentId: "provenance-addon", requiresLevel: [product.productId] };
  const catalog = { companies: [product.company], insuranceTypes: [product.insuranceType], products: [product], sources, addOns: [addOn],
    facts: { "provenance-base": [base], "provenance-addon": [addon] } };
  return { product, catalog, base, addon, addOn };
};
const enrich = ({ product, catalog }, importantTerms = []) => enrichExtractedAgreementWithCatalog({
  company: product.company, totalAnnualPremium: null, insurances: [{ type: product.insuranceType, productName: product.name,
    agreementScope: product.agreementScope, annualPremium: null, deductible: null, coverageSummary: null, importantTerms, addOns: [] }],
}, asOf, undefined, undefined, catalog).insurances[0];
const manual = ({ product, catalog }, addOnIds = []) => normalizeManualAgreement({ company: product.company, totalAnnualPremium: "",
  products: [{ type: product.insuranceType, productName: product.name, agreementScope: product.agreementScope, annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], addOnIds }],
}, catalog).insuranceData.insurances[0];
const union = f => f.qualificationSource && JSON.stringify(f.source) !== JSON.stringify(f.qualificationSource) ? [f.source, f.qualificationSource] : [f.source];
const withoutNotes = sources => sources.map(({ note: _note, sourceType: _sourceType, ...rest }) => rest);
const freeze = obj => { Object.freeze(obj); for (const x of Object.values(obj)) if (x && typeof x === "object" && !Object.isFrozen(x)) freeze(x); return obj; };

for (const variant of ["distinct", "single", "identical", "location", "metadata"]) {
  test(`multi-source ${variant}: customer, product and manual preserve exact ordered references and semantics`, () => {
    const s = freeze(setup(variant)), before = JSON.stringify(s);
    const customer = enrich(s), term = customer.importantTerms.find(t => t.key === s.base.key);
    assert.deepEqual(term.sources, union(s.base));
    assert.deepEqual(term.source, s.base.source);
    assert.equal(term.value, s.base.value);
    assert.equal(term.coverageOrigin, "catalog");
    assert.equal(term.coverageAvailability, "included");
    assert.equal(canonicalCoverage(customer, "Bobil", s.base.key).status, "selected");
    const productTerm = materializeCatalogProduct(s.product, s.catalog).facts.find(f => f.key === s.base.key);
    assert.equal(productTerm.state, "included");
    assert.deepEqual(productTerm.sources, union(s.base).map(source => ({ ...source, sourceType: s.catalog.sources[source.documentId].sourceType })));
    const manualTerm = manual(s).importantTerms.find(t => t.key === s.base.key);
    assert.deepEqual(withoutNotes(manualTerm.sources), withoutNotes(union(s.base)));
    for (const [i, source] of union(s.base).entries()) if (source.note) assert.ok(manualTerm.sources[i].note.includes(source.note));
    assert.deepEqual(enrich(s), customer);
    assert.deepEqual(materializeCatalogProduct(s.product, s.catalog).facts.find(f => f.key === s.base.key), productTerm);
    assert.equal(JSON.stringify(s), before);
  });
}

test("qualification provenance does not select an available add-on, but explicit selection preserves both manual lists and customer sources", () => {
  const s = setup();
  const silent = enrich(s);
  assert.deepEqual(silent.addOnIds, []);
  assert.equal(canonicalCoverage(silent, "Bobil", "maskinskade.dekning").status, "unknown");
  const product = materializeCatalogProduct(s.product, s.catalog).facts.find(f => f.key === s.addon.key);
  assert.equal(product.state, "optional");
  assert.deepEqual(product.sources, union(s.addon).map(source => ({ ...source, sourceType: s.catalog.sources[source.documentId].sourceType })));
  const chosen = enrich(s, [{ name: "Maskinskade", canonicalKey: "maskinskade.dekning", value: "Valgt" }]);
  assert.deepEqual(chosen.addOnIds, [s.addOn.id]);
  const registered = manual(s, [s.addOn.id]);
  const main = registered.importantTerms.find(t => t.key === s.addon.key);
  const nested = registered.addOns[0].importantTerms.find(t => t.key === s.addon.key);
  assert.deepEqual(nested.sources, union(s.addon));
  assert.deepEqual(withoutNotes(main.sources), withoutNotes(union(s.addon)));
  assert.ok(main.sources[1].note.includes(s.addon.qualificationSource.note));
  assert.equal(canonicalCoverage(registered, "Bobil", s.addon.key).status, "selected");
});

test("explicit customer rejection stays authoritative over primary and qualification sources", () => {
  const s = setup(), insurance = enrich(s, [{ name: "Leiebil", canonicalKey: "leiebil.dekning", value: "Ikke valgt" }]);
  assert.equal(canonicalCoverage(insurance, "Bobil", s.base.key).status, "not_selected");
  assert.deepEqual(insurance.importantTerms.filter(t => t.key === s.base.key).map(t => [t.coverageOrigin, t.value]), [["document", "Ikke valgt"]]);
  assert.deepEqual(insurance.addOnIds, []);
});

test("optional merges retain both qualification locations without changing names, values or optional state", () => {
  const s = setup(), other = { ...s.addOn, id: "provenance-other", name: "Maskinskade alternativ", componentId: "provenance-other" };
  s.catalog.addOns.push(other);
  s.catalog.facts[other.componentId] = [{ ...s.addon, qualificationSource: { ...s.addon.qualificationSource, page: 2, section: "Other qualification" } }];
  const f = materializeCatalogProduct(s.product, s.catalog).facts.find(f => f.key === s.addon.key);
  assert.equal(f.state, "optional");
  assert.equal(f.value, s.addon.value);
  assert.deepEqual(f.addOnNames, [s.addOn.name, other.name]);
  assert.deepEqual(f.sources.map(({ sourceType: _sourceType, ...source }) => source), [s.addon.source, s.addon.qualificationSource, s.catalog.facts[other.componentId][0].qualificationSource]);
});

test("same-product and both directions keep source union without creating differences", () => {
  const s = setup(), second = { ...s.product, productId: "provenance-second", name: "Equivalent" };
  s.catalog.products.push(second);
  s.addOn.requiresLevel.push(second.productId);
  for (const source of Object.values(s.catalog.sources)) source.productIds.push(second.productId);
  for (const [a,b] of [[s.product,s.product],[s.product,second],[second,s.product]]) {
    const result = compareCatalogProducts(a,b,s.catalog);
    assert.equal(result.differenceCount, 0);
    const row = result.sections.flatMap(s => s.rows).find(r => r.key === s.base.key);
    assert.ok(row);
    assert.equal(row.first.state, "included");
    assert.equal(row.second.state, "included");
    assert.deepEqual(row.first.sources, row.second.sources);
    assert.equal(row.first.sources.length, 2);
  }
});

for (const productId of ["if-bil-kasko", "fremtind-hus-standard", "frende-snoscooter-kasko", "gjensidige-hund-behandling", "frende-hund-veterin-r", "tryg-innbo-ekstra"]) {
  test(`held-out ${productId}: every effective qualified fact survives product/manual and eligible customer conversion`, () => {
    const product = productCatalog.products.find(p => p.productId === productId);
    assert.ok(product);
    const available = productCatalog.addOns.filter(a => a.requiresLevel?.includes(productId));
    const sets = [[], ...available.map(a => resolveAddOnPackage(product, a.id, asOf))];
    let count = 0;
    for (const ids of sets) {
      const qualified = resolveCatalogFacts(product, ids, asOf).filter(f => f.qualificationSource);
      const input = { company: product.company, totalAnnualPremium: "", products: [{ type: product.insuranceType, productName: product.name,
        agreementScope: product.agreementScope, annualPremium: "", deductible: "", coverageSummary: "", importantTerms: [],
        catalogReference: catalogReferenceForProduct(product), addOnIds: ids }] };
      const registered = normalizeManualAgreement(input).insuranceData.insurances[0];
      const materialized = materializeCatalogProduct(product);
      for (const fact of qualified) {
        count++;
        const main = registered.importantTerms.find(t => t.key === fact.key && t.source.section === fact.source.section);
        assert.ok(main, catalogProductIdentity(product));
        for (const source of union(fact)) {
          assert.ok(main.sources.some(s => s.documentId === source.documentId && s.page === source.page && s.section === source.section && (!source.note || s.note.includes(source.note))));
          assert.ok(materialized.facts.filter(f => f.key === fact.key).flatMap(f => f.sources).some(s => s.documentId === source.documentId && s.page === source.page && s.section === source.section && s.note === source.note));
        }
        if (!ids.length) {
          const customer = enrich({ product, catalog: productCatalog });
          const term = customer.importantTerms.find(t => t.key === fact.key && t.source?.section === fact.source.section);
          if (productId === "gjensidige-hund-behandling" && fact.key === "dyr.diagnostikk.begrensning") {
            // A base product detail is available, not proof that this silent
            // customer has the coverage. Keep the original negative fixture.
            assert.equal(term, undefined);
            assert.deepEqual(customer.importantTerms.filter(t => t.key?.startsWith("dyr.diagnostikk.")), []);
            assert.equal(canonicalCoverage(customer, "Hund", "dyr.diagnostikk.dekning").status, "unknown");
          } else {
            assert.ok(term);
            assert.deepEqual(term.sources, union(fact));
          }
        }
      }
    }
    assert.ok(count > 0, "held-out must exercise qualified sources");
  });
}


test("Gjensidige Hund diagnostics: silent customer stays unknown; explicit parent and independent document branches preserve exact provenance", () => {
  const product = productCatalog.products.find(p => p.productId === "gjensidige-hund-behandling");
  const reference = (kind, page, section, primary = false) => ({
    documentId: `boat-pet:gjensidige:hund:${kind}`,
    filename: kind === "product" ? "gjensidige-dog-product.html" : "gjensidige-dog-treatment-terms.pdf",
    termsNumber: kind === "product" ? "Hundeforsikring – produktoversikt" : "",
    effectiveFrom: "", version: "", agreementScope: "ordinary",
    url: "https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring", company: "Gjensidige", page, section,
    ...(primary ? { note: "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg." } : {}),
  });
  const expected = [
    { key: "dyr.diagnostikk.grense", value: "Innenfor forsikringssummen du har valgt, får du dekket utgifter til MR-undersøkelser og CT-undersøkelser med opptil 5 000 kroner per år eller skadetilfelle.",
      label: "MR/CT – grense", sources: [reference("product", 1, "Behandling – MR og CT", true)] },
    { key: "dyr.diagnostikk.begrensning", value: "Innenfor valgt forsikringssum: Undersøkelse av sykdom eller skade i ledd eller rygg frem til diagnose blir stilt, selv om skaden ikke er dekket, med inntil 3 000 kr. Fullvilkåret viser til summen angitt i forsikringsbeviset.",
      label: "Undersøkelse ledd/rygg frem til diagnose", sources: [reference("treatment", 1, "Forsikringen dekker – Behandling (trykt side 5)", true),
        reference("treatment", 3, "Undersøkelse av sykdom eller skade i ledd eller rygg (trykt side 7)")] },
  ];
  const definition = "dyr.diagnostikk.dekning";
  const s = { product, catalog: productCatalog };
  const silent = enrich(s);
  assert.deepEqual(silent.importantTerms.filter(t => expected.some(e => e.key === t.key)), []);
  assert.equal(canonicalCoverage(silent, "Hund", definition).status, "unknown");
  const chosen = enrich(s, [{ name: "Diagnostikk", canonicalKey: definition, value: "Valgt" }]);
  assert.equal(canonicalCoverage(chosen, "Hund", definition).status, "selected");
  for (const e of expected) {
    const matches = chosen.importantTerms.filter(t => t.key === e.key); assert.equal(matches.length, 1);
    assert.equal(matches[0].value, e.value); assert.equal(matches[0].coverageOrigin, "catalog");
    assert.deepEqual(matches[0].source, e.sources[0]); assert.deepEqual(matches[0].sources, e.sources);
  }
  const customerSource = { documentId: "diagnostics-customer", filename: "customer.pdf", company: "Gjensidige", page: 2, section: "Avtalt diagnostikk" };
  for (const [index, e] of expected.entries()) {
    const customerValue = index === 0 ? "4 200 kr" : "2 700 kr";
    const customer = enrich(s, [{ name: e.label, canonicalKey: e.key, value: customerValue, source: customerSource }]);
    assert.equal(canonicalCoverage(customer, "Hund", definition).status, "unknown");
    assert.equal(canonicalCoverage(customer, "Hund", definition).conflict, false);
    assert.deepEqual(customer.addOnIds, []);
    for (const [i, branch] of expected.entries()) {
      const matches = customer.importantTerms.filter(t => t.key === branch.key); assert.equal(matches.length, 1);
      assert.equal(matches[0].value, i === index ? customerValue : branch.value);
      assert.equal(matches[0].coverageOrigin, i === index ? "document" : "catalog");
      assert.deepEqual(matches[0].source, i === index ? customerSource : branch.sources[0]);
      if (i === index) {
        // Raw enrichment preserves the fixture's single-source representation;
        // canonical coverage exposes its exact singleton provenance list.
        assert.equal(Object.hasOwn(matches[0], "sources"), false);
        assert.equal(matches[0].sources, undefined);
        const details = canonicalCoverage(customer, "Hund", definition).details.filter(d => d.key === branch.key);
        assert.equal(details.length, 1);
        assert.equal(details[0].value, customerValue);
        assert.deepEqual(details[0].sources, [customerSource]);
      } else {
        assert.deepEqual(matches[0].sources, branch.sources);
      }
    }
  }
});
