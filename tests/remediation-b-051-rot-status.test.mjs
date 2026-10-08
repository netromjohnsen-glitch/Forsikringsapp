import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deserialize } from 'node:v8';
import { gunzipSync } from 'node:zlib';
import { productCatalog, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { enrichExtractedAgreementWithCatalog, catalogFactSources } from '../lib/catalog-enrichment.ts';
import { materializeCatalogProduct, compareCatalogProducts, productComparisonProducts } from '../lib/catalog-product-comparison.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { groupInsurances, groupTerms } from '../lib/comparison.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { applyRotStatus, transformRotStatusRows, transformRotStatusAddOns } from './helpers/b051-rot.mjs';
import { expectedCatalog } from './helpers/b051-liability.mjs';

const audit = new URL('../docs/audit/checkpoints/b051-rot-status-469b485/', import.meta.url);
const metadata = JSON.parse(readFileSync(new URL('baseline-snapshot.json', audit)));
const bytes = readFileSync(new URL(metadata.snapshot, audit));
assert.equal(createHash('sha256').update(bytes).digest('hex'), metadata.sha256);
const baseline = deserialize(gunzipSync(bytes));
const key = 'hus.rate.dekning', addon = 'gjensidige-hus-rate-insekter';
const standard = 'gjensidige-hus', plus = 'gjensidige-hus-pluss';
const date = new Date('2026-10-08T12:00:00Z');
const product = (id, catalog = productCatalog) => catalog.products.find(p => p.productId === id);
const raw = (owner, catalog = productCatalog) => catalog.facts[owner].find(f => f.key === key);
const state = insurance => deriveCanonicalCoverages(insurance, 'Hus').find(c => c.id === key);
const terms = insurance => insurance.importantTerms.filter(t => t.key === key);
const record = (id, values = [], role = 'individual_agreement', name = 'Råte og sopp') => ({
  company: 'Gjensidige', type: 'Hus', agreementScope: 'ordinary',
  productName: product(id).name, canonicalProductName: product(id).name,
  annualPremium: null, deductible: null, coverageSummary: null,
  agreementPeriod: null, objectIdentifiers: [], documentIndices: [1], documentRole: role,
  importantTerms: values.map(value => ({ name, value, documentIndices: [1] })), addOns: [],
});
const pipe = (docs, side = 'existing') => documentPipeline(docs, side).insuranceData;
const repeat = insurance => enrichExtractedAgreementWithCatalog({
  company: 'Gjensidige', totalAnnualPremium: null, insurances: [insurance],
}, date).insurances[0];
const docSource = (side, role) => ({
  documentId: `pdf:${side}:0`, filename: 'Dokument 1', termsNumber: 'Ikke oppgitt',
  effectiveFrom: '', page: 0, section: 'Dokumentopplysninger; side/punkt ikke identifisert', documentRole: role,
});
const cases = [
  [[], 'unknown', false, false], [['Ukjent'], 'unknown', false, false],
  [['Valgt'], 'selected', false, true], [['Ikke valgt'], 'not_selected', false, false],
  [['Valgt', 'Ikke valgt'], 'unknown', true, false],
  [['Kundens råtevillkår 17 000 kr'], 'selected', false, false],
];
for (const id of [standard, plus]) for (const role of ['individual_agreement', 'unknown']) {
  for (const side of ['existing', 'offer']) for (const [values, expected, conflict, selects] of cases) {
    test(`R-051-ROT-STATUS document/${id}/${role}/${side}/${values}`, () => {
      const insurance = pipe([[record(id, values, role)]], side).insurances[0];
      const status = id === plus && (!values.length || values[0] === 'Ukjent') ? 'selected' : expected;
      assert.equal(state(insurance).status, status); assert.equal(state(insurance).conflict, conflict);
      assert.deepEqual(insurance.addOnIds, id === standard && selects ? [addon] : []);
      const documentTerms = terms(insurance).filter(t => t.coverageOrigin === 'document');
      for (const term of documentTerms) {
        assert.ok(values.includes(term.value)); assert.equal(Object.hasOwn(term, 'source'), false);
        assert.deepEqual(term.sources, [docSource(side, role)]);
      }
      if (id === standard && !values.length) {
        const term = terms(insurance)[0], fact = raw('gjensidigeHusStandard');
        assert.equal(term.value, fact.value); assert.equal(term.catalogSelectionConfirmed, false);
        assert.deepEqual(term.source, fact.source); assert.deepEqual(term.sources, catalogFactSources(fact));
        assert.deepEqual(state(insurance).evidence[0].sources, catalogFactSources(fact));
      }
      const twice = repeat(insurance), thrice = repeat(twice);
      for (const repeated of [twice, thrice]) {
        assert.equal(state(repeated).status, status); assert.equal(state(repeated).conflict, conflict);
        assert.deepEqual(repeated.addOnIds, insurance.addOnIds);
        assert.deepEqual(repeated.catalogReference, insurance.catalogReference);
        for (const term of terms(repeated).filter(t => t.coverageOrigin === 'document')) {
          // Established Pluss base normalization retains its catalog references
          // on repeat; only actual customer terms carry the document fixture source.
          const original = terms(insurance).find(t => t.name === term.name && t.value === term.value);
          assert.ok(original); assert.deepEqual(term.sources, original.sources);
          if (original.coverageOrigin === 'document') assert.deepEqual(term.sources, [docSource(side, role)]);
          else {
            assert.equal(id, plus); assert.equal(original.coverageOrigin, 'catalog');
            assert.deepEqual(original.sources, catalogFactSources(raw('gjensidigeHusPluss')));
          }
        }
      }
    });
  }
}
for (const name of ['Råte og sopp', 'Sopp, råte og skadeinsekter']) {
  for (const values of [['Valgt'], ['Ikke valgt'], ['Valgt', 'Ikke valgt']]) {
    test(`R-051-ROT-STATUS exact-label/${name}/${values}`, () => {
      const insurance = pipe([[record(standard, values, 'individual_agreement', name)]]).insurances[0];
      assert.equal(terms(insurance).filter(t => t.coverageOrigin === 'document').length, values.length);
      assert.deepEqual(insurance.addOnIds, values.length === 1 && values[0] === 'Valgt' ? [addon] : []);
      assert.deepEqual(repeat(insurance).addOnIds, insurance.addOnIds);
    });
  }
  test(`R-051-ROT-STATUS general-terms/${name}`, () => {
    const general = record(standard, ['Valgt'], 'general_terms', name);
    const only = pipe([[general]]); assert.deepEqual(only.insurances, []);
    assert.equal(only.supportingEvidence.length, 1);
    const combined = pipe([[record(standard)], [general]]);
    assert.equal(combined.supportingEvidence.length, 1);
    const insurance = combined.insurances[0];
    const supporting = insurance.importantTerms.find(t => t.sources?.some(s => s.documentRole === 'general_terms'));
    assert.ok(supporting); assert.equal(supporting.value, 'Valgt');
    for (const instance of [insurance, repeat(insurance), repeat(repeat(insurance))]) {
      assert.equal(state(instance).status, 'unknown'); assert.deepEqual(instance.addOnIds, []);
      const retained = instance.importantTerms.find(t => t.name === name && t.sources?.some(s => s.documentRole === 'general_terms'));
      assert.ok(retained); assert.equal(retained.value, supporting.value);
      assert.equal(retained.coverageOrigin, 'catalog'); assert.deepEqual(retained.sources, supporting.sources);
    }
  });
}
test('R-051-ROT-STATUS deductible and generic text cannot select an addon', () => {
  for (const [name, value] of [['Råte og sopp – egenandel', '6 000 kr'], ['Andre vilkår', 'Råte omtalt generelt']]) {
    const insurance = pipe([[record(standard, [value], 'individual_agreement', name)]]).insurances[0];
    assert.equal(state(insurance).status, 'unknown'); assert.deepEqual(insurance.addOnIds, []);
    const term = insurance.importantTerms.find(t => t.coverageOrigin === 'document' && t.name === name);
    assert.ok(term); assert.equal(term.value, value); assert.deepEqual(term.sources, [docSource('existing', 'individual_agreement')]);
  }
});
test('R-051-ROT-STATUS supporting terms preserve documented customer priority', () => {
  const result = pipe([[record(standard, ['Kundens råtevillkår 17 000 kr'])], [record(standard, ['Valgt'], 'general_terms')]]);
  const insurance = result.insurances[0], term = terms(insurance).find(t => t.coverageOrigin === 'document');
  assert.equal(term.value, 'Kundens råtevillkår 17 000 kr'); assert.equal(state(insurance).status, 'selected');
  assert.deepEqual(term.sources, [docSource('existing', 'individual_agreement')]);
  assert.deepEqual(insurance.addOnIds, []); assert.equal(result.supportingEvidence.length, 1);
});
for (const id of [standard, plus]) for (const custom of [false, true]) {
  for (const additions of [[], ...(!custom && id === standard ? [[addon], [addon, 'gjensidige-hus-utleie'], [addon, 'gjensidige-hus-smart']] : [])]) {
    test(`R-051-ROT-STATUS manual/${id}/${custom}/${additions}`, () => {
      const insurance = normalizeManualAgreement({ company: 'Gjensidige', products: [{
        type: 'Hus', productName: custom ? 'Syntetisk eget produkt' : product(id).name, customProduct: custom,
        importantTerms: [{ name: 'Råte og sopp', value: 'Manuell særtekst' }], addOnIds: additions,
      }] }).insuranceData.insurances[0];
      if (custom) {
        assert.equal(insurance.catalogReference, null); assert.equal(insurance.catalogFacts, null);
        assert.equal(insurance.importantTerms[0].value, 'Manuell særtekst');
        assert.equal(insurance.importantTerms.some(t => t.coverageOrigin === 'catalog'), false);
      } else {
        assert.equal(state(insurance).status, id === plus || additions.includes(addon) ? 'selected' : 'unknown');
        assert.deepEqual(insurance.addOnIds, additions);
        const fact = resolveCatalogFacts(product(id), additions, date).find(f => f.key === key), term = terms(insurance)[0];
        assert.equal(term.value, fact.value); assert.equal(term.coverageOrigin, 'catalog');
        assert.deepEqual(term.source, fact.source);
        assert.deepEqual(term.sources, catalogFactSources(fact).map((s, index) => ({ ...s,
          note: index ? 'Supplerende kilde for faktumets anvendelse' : fact.replacesBase ? 'Effektiv verdi fra dokumentert utvidelse eller tillegg' : undefined,
        })));
      }
    });
  }
}
test('R-051-ROT-STATUS product presentation retains optional and excluded context', () => {
  const result = compareCatalogProducts(product(standard), product(plus));
  const row = result.sections.flatMap(s => s.rows).find(r => r.key === key);
  assert.equal(row.first.state, 'optional'); assert.equal(row.second.state, 'included');
  assert.deepEqual(row.first.facts.map(f => f.state), ['optional', 'unavailable']);
  for (const owner of ['gjensidigeHusStandard', 'gjensidigeHusRotOption']) {
    assert.ok(row.first.facts.some(f => f.value === raw(owner).value));
    for (const source of catalogFactSources(raw(owner))) assert.ok(row.first.sources.some(s => s.documentId === source.documentId && s.page === source.page && s.section === source.section));
  }
  assert.equal(row.first.sources.length, 3);
  const inverse = compareCatalogProducts(product(plus), product(standard)).sections.flatMap(s => s.rows).find(r => r.key === key);
  assert.deepEqual(inverse.first, row.second); assert.deepEqual(inverse.second, row.first);
  for (const id of [standard, plus]) assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
});
test('R-051-ROT-STATUS customer comparison retains value and full source in both directions', () => {
  const customer = pipe([[record(standard, ['Kundens råtevillkår 17 000 kr'])]]).insurances[0];
  const quiet = pipe([[record(standard)]]).insurances[0];
  for (const [first, second, side] of [[customer, quiet, 'first'], [quiet, customer, 'second']]) {
    const row = groupTerms(groupInsurances([first], [second], null)[0], null).find(r => r.key === key);
    assert.equal(row[side], 'Kundens råtevillkår 17 000 kr'); assert.deepEqual(row[side + 'Sources'], terms(customer)[0].sources);
  }
});
test('R-051-ROT-STATUS only two independently authorized catalog metadata changes', () => {
  assert.deepEqual(productCatalog, applyRotStatus(baseline));
  assert.deepEqual(JSON.parse(JSON.stringify(productCatalog)), JSON.parse(JSON.stringify(expectedCatalog)));
  for (const field of ['products', 'sources', 'insuranceTypes', 'agreementScopes']) assert.deepEqual(productCatalog[field], baseline[field]);
  let protectedFacts = 0, protectedComponents = 0;
  for (const [owner, facts] of Object.entries(baseline.facts)) {
    const rows = owner === 'gjensidigeHusStandard' ? facts.filter(f => f.key !== key) : facts;
    assert.deepEqual(productCatalog.facts[owner].filter(f => owner !== 'gjensidigeHusStandard' || f.key !== key), rows);
    protectedFacts += rows.length; if (owner !== 'gjensidigeHusStandard') protectedComponents++;
  }
  assert.equal(protectedFacts, 4158); assert.equal(protectedComponents, 317);
});
test('R-051-ROT-STATUS 13 products/six providers and 201 other comparable products isolated', () => {
  const inventory = baseline.products.filter(p => resolveCatalogFacts(p, [], date, null, baseline).some(f => f.key === key) ||
    availableAddOns(p, date, null, baseline).some(a => baseline.facts[a.componentId]?.some(f => f.key === key)));
  assert.equal(inventory.length, 13); assert.equal(new Set(inventory.map(p => p.providerId)).size, 6);
  for (const p of inventory) {
    const input = { ...record(standard), company: p.company, productName: p.name, canonicalProductName: p.name, agreementScope: p.agreementScope };
    const insurance = pipe([[input]]).insurances[0];
    if (p.productId === standard) assert.equal(state(insurance).status, 'unknown');
    else assert.equal(state(insurance).status, 'selected');
  }
  const others = productComparisonProducts(baseline).filter(p => p.productId !== standard);
  assert.equal(others.length, 201);
  for (const p of others) {
    assert.deepEqual(materializeCatalogProduct(product(p.productId), productCatalog), materializeCatalogProduct(p, baseline), p.productId);
    assert.deepEqual(compareCatalogProducts(product(p.productId), product(p.productId)), compareCatalogProducts(p, p, baseline));
  }
  for (const [id, untouchedKey] of [['tryg-hus', 'hus.skadedyr.bygningsskade'], ['fremtind-hus-standard', 'hus.skadedyr.bekjempelse'], ['tryg-reise', 'reise.ulykke.dekning'], ['tryg-reise-ekstra', 'reise.ulykke.dekning']]) {
    const current = compareCatalogProducts(product(id), product(id)).sections.flatMap(s => s.rows).find(r => r.key === untouchedKey);
    const before = compareCatalogProducts(product(id, baseline), product(id, baseline), baseline).sections.flatMap(s => s.rows).find(r => r.key === untouchedKey);
    assert.deepEqual(current, before); assert.equal(current.first.state, 'unavailable');
  }
});
test('R-051-ROT-STATUS metadata opt-in and expectation negative controls', () => {
  for (const remove of ['coverageAvailability', 'selectionEvidenceKeys']) {
    const catalog = applyRotStatus(baseline);
    if (remove === 'coverageAvailability') delete raw('gjensidigeHusStandard', catalog)[remove];
    else delete catalog.addOns.find(a => a.id === addon)[remove];
    assert.notDeepEqual(catalog, productCatalog);
  }
  for (const invalid of [[], [{ key, label: 'Råte og sopp', value: 'Invalid' }]]) assert.throws(() => transformRotStatusRows(invalid, 'gjensidigeHusStandard'));
  assert.throws(() => transformRotStatusAddOns([]));
  const other = product('tryg-hus');
  assert.deepEqual(availableAddOns(other).map(a => a.selectionEvidenceKeys), availableAddOns(product('tryg-hus', baseline), date, null, baseline).map(a => a.selectionEvidenceKeys));
});

test('R-051-ROT-STATUS documented addon object retains choice and identity on repeat', () => {
  const input = record(standard);
  input.addOns = [{ name: 'Sopp, råte og skadeinsekter', annualPremium: null, deductible: null, importantTerms: [] }];
  const insurance = pipe([[input]]).insurances[0];
  for (const current of [insurance, repeat(insurance), repeat(repeat(insurance))]) {
    assert.equal(state(current).status, 'selected'); assert.deepEqual(current.addOnIds, [addon]);
    assert.deepEqual(current.catalogReference, insurance.catalogReference);
    assert.equal(current.catalogFacts.some(f => f.key === key && f.source.documentId === 'gjensidigeHusPluss'), true);
  }
});
test('R-051-ROT-STATUS explicit term assertion override preserves document priority', () => {
  const fact = raw('gjensidigeHusStandard');
  const term = { name: fact.label, value: fact.value, key, coverageOrigin: 'catalog', source: fact.source,
    sources: [fact.source], coverageAvailability: 'unavailable', catalogSelectionConfirmed: false };
  const insurance = { importantTerms: [term], addOns: [], catalogSelectionConfirmed: true };
  assert.equal(state(insurance).status, 'unknown');
  for (const [value, expected] of [['Valgt', 'selected'], ['Ikke valgt', 'not_selected']]) {
    const documented = { ...insurance, importantTerms: [{ ...term, value, coverageOrigin: 'document' }] };
    assert.equal(state(documented).status, expected); assert.deepEqual(state(documented).evidence[0].sources, [fact.source]);
  }
  const main = { ...insurance, importantTerms: [{ ...term, catalogSelectionConfirmed: true }] };
  assert.equal(state(main).status, 'not_selected');
});
