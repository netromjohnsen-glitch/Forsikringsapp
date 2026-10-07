import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { productCatalog, resolveCatalogFacts, resolveProductComponentIds } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog, catalogFactSources } from '../lib/catalog-enrichment.ts';
import { deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { groupInsurances, groupTerms } from '../lib/comparison.ts';
import { documentPipeline } from './helpers/supporting-terms.mjs';
import { baselineCatalog, expectedCatalog, sourceOracle } from '../docs/audit/checkpoints/b051-events-buildings-19ce85d/expected-catalog.mjs';

const audit = new URL('../docs/audit/checkpoints/b051-events-buildings-19ce85d/', import.meta.url);
const authorization = JSON.parse(readFileSync(new URL('authorization.json', audit)));
const ids = ['gjensidige-hus', 'gjensidige-hus-pluss'];
const keys = Object.keys(sourceOracle);
const date = new Date('2026-10-06T12:00:00Z');
const json = x => JSON.parse(JSON.stringify(x));
const product = id => productCatalog.products.find(p => p.productId === id);
const reference = (owner, page, section) => {
  const level = owner === 'gjensidigeHusStandard' ? 'Standard' : 'Pluss';
  return { documentId: owner, filename: `Hus-${level}-alminnelige-vilkar.pdf`, termsNumber: `Hus ${level}`,
    effectiveFrom: '', company: 'Gjensidige', url: `https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-${level}-alminnelige-vilkar.pdf`,
    section, page, version: 'Alminnelige vilkår', productCode: undefined };
};
const sources = key => { const o = sourceOracle[key]; return [reference(o.owner, ...o.primary), ...(o.qualification ? [reference(o.owner, ...o.qualification)] : [])]; };
const expectedFact = key => { const o = sourceOracle[key]; return { key, label: o.label, value: o.value,
  ...(o.owner === 'gjensidigeHusPluss' ? { replacesBase: true } : {}), source: sources(key)[0],
  ...(o.qualification ? { qualificationSource: sources(key)[1] } : {}) }; };
// Independently retain the unchanged Standard layer displaced by Pluss.
// resolveCatalogFacts has replacesBase; catalogTerm creates overriddenBase.
const expectedOverriddenBase = key => {
  if (key !== 'hus.takvegg.folgeskade') return [];
  const rows = baselineCatalog.facts.gjensidigeHusStandard.filter(f => f.key === key);
  assert.equal(rows.length, 1);
  const base = rows[0];
  const source = reference('gjensidigeHusStandard', 3, 'Hus – Dekkes ikke');
  assert.deepEqual(json(source), base.source);
  assert.equal(base.value, 'Vann gjennom utett bygning er ikke særskilt omfattet på Hus utover ordinære dekningshendelser.');
  return [{ value: base.value, source }];
};
const customerSource = { documentId: 'synthetic-b051-events-customer', filename: 'customer.pdf', termsNumber: 'Kundebevis',
  effectiveFrom: '', company: 'Gjensidige', url: 'https://example.invalid/customer', page: 2, section: 'Avtalte bygningsvilkår' };
const input = (id, terms = []) => ({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [{ company: 'Gjensidige',
  type: 'Hus', productName: product(id).name, annualPremium: null, deductible: null, coverageSummary: null,
  addOns: [], importantTerms: terms }] });
const term = (key, value) => ({ name: sourceOracle[key].label, canonicalKey: key, value, source: customerSource });
const enrich = (id, terms = [], catalog = productCatalog) => enrichExtractedAgreementWithCatalog(input(id, terms), date, undefined, undefined, catalog).insurances[0];
const pick = (i, key) => i.importantTerms.filter(t => t.key === key);
const record = (id, role, entries) => ({ ...input(id).insurances[0], canonicalProductName: product(id).name,
  documentRole: role, agreementPeriod: null, objectIdentifiers: [], documentIndices: [1],
  importantTerms: entries.map(([key, value]) => ({ name: sourceOracle[key].label, value, documentIndices: [1] })) });
const manual = (id, custom = false, catalog = productCatalog) => normalizeManualAgreement({ company: 'Gjensidige',
  totalAnnualPremium: '', products: [{ type: 'Hus', productName: custom ? 'Syntetisk spesialprodukt' : product(id).name,
    annualPremium: '', deductible: '', coverageSummary: '', addOnIds: [],
    importantTerms: [{ name: 'Snø, is og vær', value: 'Kundevilkår 73 000 kr' }] }] }, catalog).insuranceData.insurances[0];
const actualKeys = id => keys.filter(key => key !== 'hus.takvegg.folgeskade' || id === 'gjensidige-hus-pluss');

test('R-051-EVENTS-BINDINGS: five original signatures, nine exact ordinary/version/provider identities', () => {
  const expected = { '49adf65854171146': [['GAP-2087', 'SF-2990'], ['GAP-2141', 'SF-3074']],
    '416dfaab0492ce1b': [['GAP-2097', 'SF-3006'], ['GAP-2152', 'SF-3089']],
    'bb47646cd8b17f20': [['GAP-2096', 'SF-3005'], ['GAP-2151', 'SF-3088']],
    '86992ec620da2894': [['GAP-2086', 'SF-2989'], ['GAP-2140', 'SF-3073']],
    '7ba0298883905c58': [['GAP-2143', 'SF-3076']] };
  assert.deepEqual(authorization.signatures.map(s => s.signature).sort(), Object.keys(expected).sort());
  for (const [sig, pairs] of Object.entries(expected)) {
    const s = authorization.signatures.find(s => s.signature === sig);
    assert.equal(s.original_binding.final_batch_id, 'B-051'); assert.equal(s.original_binding.P2_occurrences, '0');
    assert.deepEqual(s.original_source_evidence.map(e => [e.finding_id, e.source_fact_id]), pairs);
    assert.deepEqual(s.original_source_evidence.map(e => JSON.parse(e.product_identity)),
      (pairs.length === 1 ? [ids[1]] : ids).map(id => ['gjensidige', 'bolig', 'ordinary', id, 'Alminnelige vilkår']));
  }
});

for (const [level, digest] of [['Standard', 'd237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc'],
  ['Pluss', '79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792']]) {
  test('R-051-EVENTS-SOURCE ' + level + ': original columns and continued building exclusions', () => {
    const filename = `Hus-${level}-alminnelige-vilkar.pdf`, path = new URL('../catalog/sources/gjensidige/hus/' + filename, import.meta.url);
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), digest);
    const s = productCatalog.sources['gjensidigeHus' + level];
    assert.equal(s.sha256, digest); assert.equal(s.filename, filename); assert.equal(s.termsNumber, 'Hus ' + level);
    assert.equal(s.company, 'Gjensidige'); assert.equal(s.insuranceType, 'Hus');
    assert.equal(s.version, 'Alminnelige vilkår'); assert.equal(s.effectiveFrom, ''); assert.equal(Object.hasOwn(s, 'sourceType'), false);
    const page = n => execFileSync('pdftotext', ['-raw', '-f', String(n), '-l', String(n), path.pathname, '-']).toString().replace(/\s+/gu, ' ').trim();
    const p3 = page(3), p4 = page(4), p5 = page(5);
    for (const phrase of ['Plutselig og uforutsett skade ved:', 'Brannskade og skade som følge av lynnedslag, eksplosjon, nedsoting og elektriske fenomen',
      'Svimerker og gnistskader som ikke skyldes brann', 'Utvendige ledninger med tilknyttet utstyr fram til spredeledning eller offentlig ledning',
      'Brønn eller borehull', 'For bygg under oppføring, rehabilitering, tilbygg og påbygg gjelder også på forsikringsstedet:',
      'Materialer til bygget', 'Brakker, lagerskur og containere']) assert.ok(p3.includes(phrase), level + ': ' + phrase);
    for (const phrase of ['Skade som skyldes snø- og istyngde på hagestue og andre utestuer av glass',
      'Annen skade på drensledning enn brann- og naturskade', 'For bygg under oppføring, rehabilitering, tilbygg og påbygg:',
      'Tyveri av materialer ute']) assert.ok(p4.includes(phrase), level + ': ' + phrase);
    assert.ok((level === 'Pluss' ? p5 : p4).includes('Skade som skyldes snøtyngde eller vind svakere enn storm når utvendige byggearbeider ikke er ferdige'));
    if (level === 'Pluss') {
      for (const phrase of ['Vannskade som følge av vanninntrengning gjennom utett bygning over bakkeplan, men ikke utbedring av selve feilen/mangelen',
        'Vann som trenger inn gjennom utett tak som er eldre enn 50 år', 'Vann som trenger inn gjennom utett bygning når bygningen ikke er fullverdiforsikret',
        'Ved vanninntrenging gjennom utett bygning dekkes ikke skade på selve taket/veggen. Med dette menes alle sjikt utenfor takstol/-sperre eller stenderverk/bærende konstruksjoner']) assert.ok(p3.includes(phrase), phrase);
      assert.ok(p5.includes('Skade som skyldes utett bygning når utvendige byggearbeider ikke er ferdige'));
    }
  });
}

for (const key of keys) test('R-051-EVENTS-FACT ' + key + ': exact complete row, provenance, role and inheritance', () => {
  const o = sourceOracle[key];
  assert.deepEqual(productCatalog.facts[o.owner].filter(f => f.key === key), [expectedFact(key)]);
  for (const id of ids) {
    const f = resolveCatalogFacts(product(id), [], date).find(f => f.key === key);
    assert.ok(f); assert.deepEqual(resolveProductComponentIds(product(id)), resolveProductComponentIds(baselineCatalog.products.find(p => p.productId === id), baselineCatalog));
    if (key === 'hus.takvegg.folgeskade' && id === ids[0]) {
      assert.deepEqual(json(f), resolveCatalogFacts(baselineCatalog.products.find(p => p.productId === id), [], date, null, baselineCatalog).find(f => f.key === key));
      continue;
    }
    assert.equal(f.value, o.value); assert.deepEqual(catalogFactSources(f), sources(key));
    const m = materializeCatalogProduct(product(id)).facts.find(f => f.key === key);
    assert.equal(m.state, 'included'); assert.equal(m.role, ['hus.brann.dekning', 'hus.vaer.dekning'].includes(key) ? 'coverage' : 'term');
    assert.equal(m.value, o.value); assert.deepEqual(m.sources, sources(key).map(s => ({ ...s, sourceType: undefined })));
    if (o.owner === 'gjensidigeHusStandard') assert.equal(productCatalog.facts.gjensidigeHusPluss.some(f => f.key === key), false);
    else {
      assert.deepEqual(f, expectedFact(key));
      assert.equal(f.replacesBase, true);
      assert.equal(Object.hasOwn(f, 'overriddenBase'), false);
      const enriched = pick(enrich(id), key);
      assert.equal(enriched.length, 1);
      assert.deepEqual(enriched[0].overriddenBase, expectedOverriddenBase(key));
    }
  }
});

test('R-051-EVENTS-REVERSE: six authorized rows only, 316 components/4152 facts/202 products and old eight protected', () => {
  execFileSync('node', [new URL('catalog-audit.mjs', audit).pathname], { stdio: 'pipe' });
  const combinations = [[], ['gjensidige-hus-utleie'], ['gjensidige-hus-smart'], ['gjensidige-hus-utleie', 'gjensidige-hus-smart']];
  for (const id of ids) for (const addons of [...combinations, ...(id === ids[0] ? [['gjensidige-hus-rate-insekter']] : [])]) {
    const actual = resolveCatalogFacts(product(id), addons, date);
    const expected = resolveCatalogFacts(expectedCatalog.products.find(p => p.productId === id), addons, date, null, expectedCatalog);
    assert.deepEqual(json(actual), expected);
  }
  assert.deepEqual(productCatalog.facts.gjensidigeHusStandard.filter(f => f.key === 'hus.elektrisk.dekning').map(json), baselineCatalog.facts.gjensidigeHusStandard.filter(f => f.key === 'hus.elektrisk.dekning'));
});

for (const id of ids) for (const key of actualKeys(id)) test('R-051-EVENTS-DOCUMENT ' + id + ' ' + key + ': priority, explicit states, conflicts and repeated full fields', () => {
  for (const values of [[], ['Valgt'], ['Ikke valgt'], ['Ukjent'], ['Valgt', 'Ikke valgt'], ['Kundevilkår 73 000 kr']]) {
    const ts = values.map(v => term(key, v)), actual = enrich(id, ts), independent = enrich(id, ts, expectedCatalog);
    assert.deepEqual(json(actual), json(independent)); assert.deepEqual(actual.addOnIds, []);
    assert.deepEqual(json(deriveCanonicalCoverages(actual, 'Hus')), json(deriveCanonicalCoverages(independent, 'Hus')));
    // Compare unchanged selection semantics to the actual pre-implementation baseline.
    const status = c => deriveCanonicalCoverages(c, 'Hus').map(c => ({ id: c.id, status: c.status, conflict: c.conflict }));
    assert.deepEqual(status(actual), status(enrich(id, ts, baselineCatalog)));
    const fallback = !values.length || values[0] === 'Ukjent';
    assert.deepEqual(pick(actual, key).map(t => t.value), fallback ? [sourceOracle[key].value] : values);
    for (const t of pick(actual, key)) {
      assert.equal(t.coverageOrigin, fallback ? 'catalog' : 'document'); assert.deepEqual(t.source, fallback ? sources(key)[0] : customerSource);
      if (fallback) assert.deepEqual(t.sources, sources(key)); else assert.equal(Object.hasOwn(t, 'sources'), false);
    }
    if (['hus.brann.dekning', 'hus.vaer.dekning'].includes(key)) {
      const c = deriveCanonicalCoverages(actual, 'Hus').find(c => c.id === key);
      const expectedStatus = values.length === 2 ? 'unknown' : values[0] === 'Ikke valgt' ? 'not_selected' : 'selected';
      assert.equal(c.status, expectedStatus); assert.equal(c.conflict, values.length === 2);
    }
    const again = enrichExtractedAgreementWithCatalog({ company: 'Gjensidige', totalAnnualPremium: null, insurances: [actual] }, date).insurances[0];
    const first = fallback ? [{ name: sourceOracle[key].label, value: sourceOracle[key].value, key, coverageOrigin: 'catalog',
      structuredValue: undefined, deductibleClassification: undefined, source: sources(key)[0], sources: sources(key),
      overriddenBase: expectedOverriddenBase(key) }]
      : values.map(value => ({ name: sourceOracle[key].label, value, key, coverageOrigin: 'document', source: customerSource }));
    assert.deepEqual(pick(actual, key), first);
    assert.deepEqual(pick(again, key), fallback ? [{ name: sourceOracle[key].label, value: sourceOracle[key].value, key,
      coverageOrigin: 'document', source: sources(key)[0], sources: sources(key) }] : first);
    const baselineFirst = enrich(id, ts, baselineCatalog);
    const repeat = (insurance, catalog) => enrichExtractedAgreementWithCatalog({ company: 'Gjensidige',
      totalAnnualPremium: null, insurances: [insurance] }, date, undefined, undefined, catalog).insurances[0];
    const baselineAgain = repeat(baselineFirst, baselineCatalog);
    const independentAgain = repeat(independent, expectedCatalog);
    // Full canonical values/evidence/provenance use the independent six-row oracle;
    // compare the existing alias transition at the same pass on unchanged baseline.
    assert.deepEqual(json(deriveCanonicalCoverages(again, 'Hus')), json(deriveCanonicalCoverages(independentAgain, 'Hus')));
    assert.deepEqual(status(again), status(baselineAgain));
    const transition = (before, after) => {
      const a = status(before), b = status(after);
      assert.equal(new Set(a.map(c => c.id)).size, a.length);
      assert.equal(new Set(b.map(c => c.id)).size, b.length);
      assert.deepEqual(b.filter(c => a.some(d => d.id === c.id)), a);
      assert.deepEqual(a.filter(c => !b.some(d => d.id === c.id)), []);
      return b.filter(c => !a.some(d => d.id === c.id));
    };
    const approvedAlias = [{ id: 'rettshjelp.dekning', status: 'selected', conflict: false }];
    assert.deepEqual(transition(baselineFirst, baselineAgain), approvedAlias);
    assert.deepEqual(transition(actual, again), approvedAlias);
    assert.deepEqual(again.addOnIds, []);
  }
});

for (const id of ids) for (const role of ['individual_agreement', 'unknown', 'general_terms']) test('R-051-EVENTS-PIPELINE ' + id + ' ' + role + ': valid extraction and exact source-array contract', () => {
  const out = documentPipeline([[record(id, role, actualKeys(id).map(key => [key, 'Kundevilkår 73 000 kr']))]]).insuranceData;
  const references = [{ documentId: 'pdf:existing:0', filename: 'Dokument 1', termsNumber: 'Ikke oppgitt', effectiveFrom: '',
    page: 0, section: 'Dokumentopplysninger; side/punkt ikke identifisert', documentRole: role }];
  assert.equal(out.insurances.length, role === 'general_terms' ? 0 : 1);
  assert.equal(out.supportingEvidence?.length ?? 0, role === 'general_terms' ? 1 : 0);
  for (const key of actualKeys(id)) {
    const rows = role === 'general_terms' ? out.supportingEvidence[0].importantTerms.filter(t => t.name === sourceOracle[key].label) : pick(out.insurances[0], key);
    assert.deepEqual(rows, [{ name: sourceOracle[key].label, value: 'Kundevilkår 73 000 kr', key: role === 'general_terms' ? undefined : key,
      coverageOrigin: role === 'general_terms' ? 'catalog' : 'document', sources: references }]);
  }
  if (role !== 'general_terms') assert.deepEqual(out.insurances[0].addOnIds, []);
});

for (const id of ids) test('R-051-EVENTS-SUPPORT/MANUAL ' + id + ': supporting role, known mode and custom null reference', () => {
  const out = documentPipeline([[record(id, 'individual_agreement', [['hus.vaer.dekning', 'Kundevilkår 73 000 kr']])],
    [record(id, 'general_terms', [['hus.byggunderoppforing', 'Generelt byggevilkår']])]]).insuranceData;
  assert.equal(out.insurances.length, 1); assert.equal(out.supportingEvidence.length, 1);
  assert.equal(pick(out.insurances[0], 'hus.vaer.dekning')[0].value, 'Kundevilkår 73 000 kr'); assert.deepEqual(out.insurances[0].addOnIds, []);
  const known = manual(id); assert.deepEqual(json(known), json(manual(id, false, expectedCatalog)));
  for (const key of actualKeys(id)) {
    const t = pick(known, key)[0]; assert.equal(t.value, sourceOracle[key].value); assert.equal(t.coverageOrigin, 'catalog');
    assert.deepEqual(t.sources, sources(key).map((s, i) => ({ ...s, note: i ? 'Supplerende kilde for faktumets anvendelse' : key === 'hus.takvegg.folgeskade' ? 'Effektiv verdi fra dokumentert utvidelse eller tillegg' : undefined })));
  }
  const custom = manual(id, true);
  assert.equal(custom.catalogReference, null); assert.equal(custom.catalogSelectionConfirmed, false); assert.equal(custom.catalogFacts, null);
  assert.deepEqual(custom.importantTerms, [{ name: 'Snø, is og vær', value: 'Kundevilkår 73 000 kr' }]); assert.deepEqual(custom.addOnIds, []);
});

test('R-051-EVENTS-COMPARISON: same product, both directions and separate customer values/provenance', () => {
  for (const id of ids) {
    for (const other of [...ids, 'if-hus-basis', 'storebrand-hus-standard']) {
      const f = compareCatalogProducts(product(id), product(other)), r = compareCatalogProducts(product(other), product(id));
      if (id === other) assert.equal(f.differenceCount, 0);
      for (const key of actualKeys(id)) {
        const a = f.sections.flatMap(s => s.rows).find(r => r.key === key), b = r.sections.flatMap(s => s.rows).find(r => r.key === key);
        assert.deepEqual(a.first, b.second); assert.deepEqual(a.second, b.first);
        assert.equal(a.first.state, 'included'); assert.ok(a.first.text.includes(sourceOracle[key].value));
        assert.deepEqual(a.first.sources, sources(key).map(s => ({ ...s, sourceType: undefined })));
        if (!ids.includes(other)) assert.equal(a.second.sources.some(s => ['gjensidigeHusStandard', 'gjensidigeHusPluss'].includes(s.documentId)), false);
      }
    }
    for (const key of actualKeys(id)) {
      const customer = enrich(id, [term(key, 'Kundevilkår 73 000 kr')]), catalog = manual(id);
      for (const [a, b, side] of [[customer, catalog, 'first'], [catalog, customer, 'second']]) {
        const row = groupTerms(groupInsurances([a], [b], null)[0], null).find(r => r.key === key);
        assert.equal(row[side], 'Kundevilkår 73 000 kr'); assert.deepEqual(row[side + 'Sources'], [customerSource]);
      }
    }
  }
});
