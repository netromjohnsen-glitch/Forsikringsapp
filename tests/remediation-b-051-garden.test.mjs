import {applyRot, transformRotStatusAddOns} from './helpers/b051-rot.mjs';
import {applyLegal} from './helpers/b051-legal.mjs';
import {applySmart} from './helpers/b051-smart.mjs';
import {applyHealthHelp} from './helpers/b051-health-help.mjs';
import { applyLiability } from './helpers/b051-liability.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { productCatalog, resolveCatalogFacts, resolveProductComponentIds, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog, catalogFactSources } from '../lib/catalog-enrichment.ts';
import { deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { groupInsurances, groupTerms } from '../lib/comparison.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { expectedCatalog as previousEventsCatalog } from '../docs/audit/checkpoints/b051-events-buildings-19ce85d/expected-catalog.mjs';

import { applySettlement } from '../docs/audit/checkpoints/b051-settlement-age-0bcd250/expected-catalog.mjs';
import { applyRecovery } from '../docs/audit/checkpoints/b051-recovery-benefits-69c71dc/expected-catalog.mjs';
import { applyPhysical } from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';
const approvedEventsCatalog = applyRot(applyLegal(applySmart(applyHealthHelp(applyLiability(applyPhysical(applyRecovery(applySettlement(previousEventsCatalog)), {jsonSnapshot:true}))))));
const audit = new URL('../docs/audit/checkpoints/b051-garden-pier-64dd3cb/', import.meta.url);
const oracle = JSON.parse(readFileSync(new URL('source-oracle.json', audit)));
const authorization = JSON.parse(readFileSync(new URL('authorization.json', audit)));
const baseline = JSON.parse(gunzipSync(readFileSync(new URL('baseline-catalog.json.gz', audit))));
const keys = ['hus.hage.objekter', 'hus.hage.brygge'];
const ids = ['gjensidige-hus', 'gjensidige-hus-pluss'];
const date = new Date('2026-10-06T12:00:00Z');
const product = id => productCatalog.products.find(p => p.productId === id);
const reference = (page, section) => ({ documentId: 'gjensidigeHusStandard', filename: 'Hus-Standard-alminnelige-vilkar.pdf',
  termsNumber: 'Hus Standard', effectiveFrom: '', company: 'Gjensidige',
  url: 'https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Standard-alminnelige-vilkar.pdf',
  section, page, version: 'Alminnelige vilkår', productCode: undefined });
const sources = key => [reference(...oracle[key].primary), reference(...oracle[key].qualification)];
const customerSource = { documentId: 'synthetic-b051-garden-customer', filename: 'customer.pdf', termsNumber: 'Kundebevis',
  effectiveFrom: '', company: 'Gjensidige', url: 'https://example.invalid/customer', page: 2, section: 'Avtalte hagevilkår' };
const input = (id, terms = []) => ({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [{ company: 'Gjensidige',
  type: 'Hus', productName: product(id).name, annualPremium: null, deductible: null, coverageSummary: null,
  addOns: [], importantTerms: terms }] });
const term = (key, value) => ({ name: oracle[key].label, canonicalKey: key, value, source: customerSource });
const enrich = (id, terms, catalog = productCatalog) => enrichExtractedAgreementWithCatalog(input(id, terms), date, undefined, undefined, catalog).insurances[0];
const pick = (i, key) => i.importantTerms.filter(t => t.key === key);
const json = x => JSON.parse(JSON.stringify(x));
const manual = (id, custom = false, catalog = productCatalog) => normalizeManualAgreement({ company: 'Gjensidige',
  totalAnnualPremium: '', products: [{ type: 'Hus', productName: custom ? 'Syntetisk spesialprodukt' : product(id).name,
    annualPremium: '', deductible: '', coverageSummary: '', addOnIds: [],
    importantTerms: [{ name: 'Hage og uteområde', value: 'Kundevilkår 73 000 kr' }] }] }, catalog).insuranceData.insurances[0];
// Extraction schema accepts name/value, not arbitrary canonicalKey/source fields.
const record = (id, role, entries) => ({ ...input(id).insurances[0], canonicalProductName: product(id).name,
  documentRole: role, agreementPeriod: null, objectIdentifiers: [], documentIndices: [1],
  importantTerms: entries.map(([key, value]) => ({ name: oracle[key].label, value, documentIndices: [1] })) });

test('R-051-GARDEN-BINDINGS: exact three signatures, six GAP/SF identities, ordinary/version/provider', () => {
  const expected = { '403c9b3f0e9aa19f': [['GAP-2082', 'SF-2985'], ['GAP-2136', 'SF-3069']],
    '6ceaaaf84f1dc597': [['GAP-2095', 'SF-3004'], ['GAP-2150', 'SF-3087']],
    'a7561c0d03ede572': [['GAP-2083', 'SF-2986'], ['GAP-2137', 'SF-3070']] };
  assert.deepEqual(authorization.signatures.map(s => s.signature).sort(), Object.keys(expected).sort());
  for (const [signature, pairs] of Object.entries(expected)) {
    const s = authorization.signatures.find(s => s.signature === signature);
    assert.equal(s.original_binding.final_batch_id, 'B-051');
    assert.equal(s.original_binding.P2_occurrences, '0');
    assert.deepEqual(s.original_source_evidence.map(e => [e.finding_id, e.source_fact_id]), pairs);
    assert.deepEqual(s.original_source_evidence.map(e => JSON.parse(e.product_identity)), ids.map(id =>
      ['gjensidige', 'bolig', 'ordinary', id, 'Alminnelige vilkår']));
  }
});

for (const [level, digest] of [['Standard', 'd237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],
  ['Pluss', '79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792']]) {
  test('R-051-GARDEN-SOURCE ' + level + ': complete object/exclusion clauses and frozen registered bytes', () => {
    const filename = `Hus-${level}-alminnelige-vilkar.pdf`;
    const path = new URL('../catalog/sources/gjensidige/hus/' + filename, import.meta.url);
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), digest);
    const s = productCatalog.sources['gjensidigeHus' + level];
    assert.equal(s.filename, filename); assert.equal(s.sha256, digest);
    assert.equal(s.company, 'Gjensidige'); assert.equal(s.insuranceType, 'Hus');
    assert.equal(s.version, 'Alminnelige vilkår'); assert.equal(s.effectiveFrom, '');
    assert.equal(Object.hasOwn(s, 'sourceType'), false);
    // Content-stream order keeps each original column's paragraph together;
    // coordinate sorting interleaves Hobbyveksthus from the adjacent column.
    const page = n => execFileSync('pdftotext', ['-raw', '-f', String(n), '-l', String(n), path.pathname, '-']).toString().replace(/\s+/gu, ' ').trim();
    const objects = page(3), exclusions = page(4);
    for (const phrase of ['Hageanlegg inntil 5 dekar, inkludert utvendig badekilde/-basseng',
      'Fast brygge tilhørende forsikret bygning inntil kr 100 000, begrenset til brann og naturskade',
      'Molo/bølgebryter, også når dette fungerer som fundament for brygge', 'Flytebrygge og landgang']) {
      assert.ok(objects.includes(phrase), level + ': ' + phrase);
    }
    assert.ok(exclusions.includes('Skade på hageanlegg, utvendig badekilde/-basseng og brygge forårsaket av dyr, insekter, frost, sjøgang eller andre klimatiske forhold. Likevel dekkes skader som skyldes en flomlignende situasjon'));
    assert.ok(exclusions.includes('Dekkes ikke'));
  });
}

for (const key of keys) test('R-051-GARDEN-FACT ' + key + ': exact full fields, ordered provenance and inherited term identity', () => {
  const o = oracle[key];
  assert.deepEqual(productCatalog.facts.gjensidigeHusStandard.filter(f => f.key === key), [{ key, label: o.label,
    value: o.value, source: sources(key)[0], qualificationSource: sources(key)[1] }]);
  assert.equal(productCatalog.facts.gjensidigeHusPluss.some(f => f.key === key), false);
  for (const id of ids) {
    const f = resolveCatalogFacts(product(id), [], date).filter(f => f.key === key);
    assert.equal(f.length, 1); assert.equal(f[0].value, o.value);
    assert.deepEqual(catalogFactSources(f[0]), sources(key));
    const presented = materializeCatalogProduct(product(id)).facts.filter(f => f.key === key);
    assert.equal(presented.length, 1); assert.equal(presented[0].state, 'included'); assert.equal(presented[0].role, 'term');
    assert.equal(presented[0].value, o.value);
    assert.deepEqual(presented[0].sources, sources(key).map(s => ({ ...s, sourceType: undefined })));
    assert.deepEqual(resolveProductComponentIds(product(id)), resolveProductComponentIds(baseline.products.find(p => p.productId === id), baseline));
  }
  assert.doesNotMatch(o.value, /utvidet sum kan avtales/u);
  if (key === 'hus.hage.brygge') assert.match(o.value, /100 000 kroner, begrenset til brann og naturskade/u);
});

test('R-051-GARDEN-REVERSE: revision-bound six-row events transform; approved garden/rental/pests unchanged', () => {
  execFileSync('node', [new URL('./helpers/b051-liability.mjs', import.meta.url).pathname,'--audit'], { stdio: 'pipe' });
});

for (const id of ids) for (const key of keys) test('R-051-GARDEN-DOCUMENT ' + id + ' ' + key + ': values/refusal/conflicts/Ukjent preserved without a new parent', () => {
  for (const values of [[], ['Valgt'], ['Ikke valgt'], ['Ukjent'], ['Valgt', 'Ikke valgt'], ['Kundevilkår 73 000 kr']]) {
    const ts = values.map(v => term(key, v)), actual = enrich(id, ts), old = enrich(id, ts, approvedEventsCatalog);
    assert.deepEqual(actual.addOnIds, []);
    assert.deepEqual(json(deriveCanonicalCoverages(actual, 'Hus')), json(deriveCanonicalCoverages(old, 'Hus')));
    assert.equal(deriveCanonicalCoverages(actual, 'Hus').some(c => c.id.startsWith('hus.hage.')), false);
    const fallback = !values.length || values[0] === 'Ukjent';
    assert.deepEqual(pick(actual, key).map(t => t.value), fallback ? [oracle[key].value] : values);
    for (const t of pick(actual, key)) {
      assert.equal(t.coverageOrigin, fallback ? 'catalog' : 'document');
      assert.deepEqual(t.source, fallback ? sources(key)[0] : customerSource);
      if (fallback) assert.deepEqual(t.sources, sources(key));
      else assert.equal(Object.hasOwn(t, 'sources'), false);
    }
    const otherKey = keys.find(k => k !== key);
    assert.equal(pick(actual, otherKey)[0].value, oracle[otherKey].value);
    const again = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [actual] }, date).insurances[0];
    // Passing enriched terms back as extracted input follows extractedTerm's
    // existing document representation, not catalogTerm's raw metadata shape.
    // Full-field assertions account individually for every changed field.
    const expectedFirst = fallback
      ? [{ name: oracle[key].label, value: oracle[key].value, key, coverageOrigin: 'catalog',
        structuredValue: undefined, deductibleClassification: undefined,
        source: sources(key)[0], sources: sources(key), overriddenBase: [] }]
      : values.map(value => ({ name: oracle[key].label, value, key, coverageOrigin: 'document', source: customerSource }));
    const expectedAgain = fallback
      ? [{ name: oracle[key].label, value: oracle[key].value, key, coverageOrigin: 'document',
        source: sources(key)[0], sources: sources(key) }]
      : expectedFirst;
    assert.deepEqual(pick(actual, key), expectedFirst);
    assert.deepEqual(pick(again, key), expectedAgain);
    // No provenance/value is dropped, nor does another catalog rule regain priority.
    assert.deepEqual(pick(again, key).map(t => [t.name, t.key, t.value, t.source, t.sources]),
      pick(actual, key).map(t => [t.name, t.key, t.value, t.source, t.sources]));
    const oldAgain = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [old] }, date, undefined, undefined, approvedEventsCatalog).insurances[0];
    assert.deepEqual(json(deriveCanonicalCoverages(again, 'Hus')), json(deriveCanonicalCoverages(oldAgain, 'Hus')));
    for (const first of deriveCanonicalCoverages(actual, 'Hus')) {
      const second = deriveCanonicalCoverages(again, 'Hus').find(c => c.id === first.id);
      assert.ok(second, first.id); assert.equal(second.status, first.status); assert.equal(second.conflict, first.conflict);
    }
    assert.deepEqual(again.addOnIds, []);
  }
});

for (const id of ids) for (const role of ['individual_agreement', 'unknown', 'general_terms']) {
  test('R-051-GARDEN-PIPELINE ' + id + ' ' + role + ': valid raw schema and role-specific evidence', () => {
    const entries = keys.map(k => [k, 'Dokumentert kundevilkår 73 000 kr']);
    const out = documentPipeline([[record(id, role, entries)]]).insuranceData;
    const expectedSources = [{ documentId: 'pdf:existing:0', filename: 'Dokument 1',
      termsNumber: 'Ikke oppgitt', effectiveFrom: '', page: 0,
      section: 'Dokumentopplysninger; side/punkt ikke identifisert', documentRole: role }];
    if (role === 'general_terms') {
      assert.equal(out.insurances.length, 0); assert.equal(out.supportingEvidence.length, 1);
      const support = out.supportingEvidence[0];
      for (const key of keys) {
        const t = support.importantTerms.find(t => t.name === oracle[key].label);
        assert.deepEqual(t, { name: oracle[key].label, value: 'Dokumentert kundevilkår 73 000 kr',
          key: undefined, coverageOrigin: 'catalog', sources: expectedSources });
        assert.equal(Object.hasOwn(t, 'source'), false);
      }
    } else {
      assert.equal(out.insurances.length, 1); assert.deepEqual(out.insurances[0].addOnIds, []);
      for (const key of keys) {
        const ts = pick(out.insurances[0], key); assert.equal(ts.length, 1);
        assert.equal(ts[0].value, 'Dokumentert kundevilkår 73 000 kr'); assert.equal(ts[0].coverageOrigin, 'document');
        assert.deepEqual(ts[0], { name: oracle[key].label, value: 'Dokumentert kundevilkår 73 000 kr',
          key, coverageOrigin: 'document', sources: expectedSources });
        assert.equal(Object.hasOwn(ts[0], 'source'), false);
        assert.equal(deriveCanonicalCoverages(out.insurances[0], 'Hus').some(c => c.id.startsWith('hus.hage.')), false);
        const row = groupTerms(groupInsurances(out.insurances, out.insurances, null)[0], null).find(r => r.key === key);
        assert.equal(row.first, 'Dokumentert kundevilkår 73 000 kr');
        assert.deepEqual(row.firstSources, expectedSources); assert.deepEqual(row.secondSources, expectedSources);
      }
    }
  });
}

for (const id of ids) test('R-051-GARDEN-SUPPORT ' + id + ': actual customer and general terms stay separate', () => {
  const out = documentPipeline([[record(id, 'individual_agreement', [[keys[0], 'Kundevilkår 73 000 kr']])],
    [record(id, 'general_terms', [[keys[1], 'Generelt bryggevilkår']])]]).insuranceData;
  assert.equal(out.insurances.length, 1); assert.equal(out.supportingEvidence.length, 1);
  assert.equal(pick(out.insurances[0], keys[0])[0].value, 'Kundevilkår 73 000 kr');
  assert.deepEqual(out.insurances[0].addOnIds, []);
  assert.equal(deriveCanonicalCoverages(out.insurances[0], 'Hus').some(c => c.id.startsWith('hus.hage.')), false);
});

for (const id of ids) test('R-051-GARDEN-MANUAL ' + id + ': known catalog mode, custom mode and provenance', () => {
  const known = manual(id), old = manual(id, false, approvedEventsCatalog);
  assert.deepEqual(known.addOnIds, []);
  assert.deepEqual(json(deriveCanonicalCoverages(known, 'Hus')), json(deriveCanonicalCoverages(old, 'Hus')));
  for (const key of keys) {
    const t = pick(known, key)[0]; assert.equal(t.value, oracle[key].value); assert.equal(t.coverageOrigin, 'catalog');
    assert.deepEqual(t.sources, [{ ...sources(key)[0], note: undefined }, { ...sources(key)[1], note: 'Supplerende kilde for faktumets anvendelse' }]);
  }
  const custom = manual(id, true);
  assert.equal(custom.importantTerms.find(t => t.name === 'Hage og uteområde').value, 'Kundevilkår 73 000 kr');
  assert.equal(custom.catalogReference, null); assert.equal(pick(custom, keys[1]).length, 0);
  assert.equal(custom.catalogSelectionConfirmed, false); assert.equal(custom.catalogFacts, null);
  assert.deepEqual(custom.importantTerms, [{ name: 'Hage og uteområde', value: 'Kundevilkår 73 000 kr' }]);
  assert.deepEqual(custom.addOnIds, []); assert.deepEqual(custom.addOns, []);
});

test('R-051-GARDEN-COMPARISON: same product, both directions, unchanged provider boundaries and full presentation provenance', () => {
  for (const a of ids) for (const b of [...ids, 'if-hus-basis', 'storebrand-hus-standard']) {
    const forward = compareCatalogProducts(product(a), product(b)), reverse = compareCatalogProducts(product(b), product(a));
    if (a === b) assert.equal(forward.differenceCount, 0);
    for (const key of keys) {
      const f = forward.sections.flatMap(s => s.rows).find(r => r.key === key);
      const r = reverse.sections.flatMap(s => s.rows).find(r => r.key === key);
      assert.deepEqual(f.first, r.second); assert.deepEqual(f.second, r.first);
      assert.equal(f.first.state, 'included'); assert.ok(f.first.text.includes(oracle[key].value));
      assert.deepEqual(f.first.sources, sources(key).map(s => ({ ...s, sourceType: undefined })));
      if (!ids.includes(b)) assert.equal(f.second.sources.some(s => s.documentId === 'gjensidigeHusStandard'), false);
    }
  }
});

test('R-051-GARDEN-CUSTOMER-COMPARISON: each document overrides only its key in both directions', () => {
  for (const id of ids) for (const key of keys) {
    const customer = enrich(id, [term(key, 'Kundevilkår 73 000 kr')]), catalog = manual(id);
    for (const [a, b, side] of [[customer, catalog, 'first'], [catalog, customer, 'second']]) {
      const row = groupTerms(groupInsurances([a], [b], null)[0], null).find(r => r.key === key);
      assert.equal(row[side], 'Kundevilkår 73 000 kr'); assert.deepEqual(row[side + 'Sources'], [customerSource]);
    }
  }
});

test('R-051-GARDEN-SCOPE: no new type/channel/version/parent/addon or source admission', () => {
  for (const id of ids) {
    const p = product(id);
    assert.equal(findCatalogProduct('gjensidige', id, p.version, { agreementScope: 'ordinary', insuranceType: 'Hus' }), p);
    assert.equal(findCatalogProduct('gjensidige', id, p.version, { agreementScope: 'nito', insuranceType: 'Hus' }), null);
    assert.equal(findCatalogProduct('gjensidige', id, p.version, { insuranceType: 'Katt' }), null);
    assert.equal(findCatalogProduct('gjensidige', id, '2026-10-06', { insuranceType: 'Hus' }), null);
  }
  assert.deepEqual(json(productCatalog.sources), baseline.sources);
  assert.deepEqual(json(productCatalog.products), baseline.products);
  assert.deepEqual(json(productCatalog.addOns), transformRotStatusAddOns(baseline.addOns));
});
