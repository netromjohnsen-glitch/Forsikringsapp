import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  productCatalog, canonicalProviderId, catalogProductIdentity, catalogReferenceForProduct,
  findCatalogProduct, findCatalogProductBySelection, catalogProductsForSelection,
  catalogProductMatchesSelection, catalogAgreementScopeOptions, availableAddOns,
  resolveProductComponentIds, resolveCatalogFacts, resolveCatalogEvidence, catalogConnectionStatus,
} from '../lib/product-catalog.ts';
import { isRegisteredAgreementScope } from '../lib/agreement-scope.ts';
import { resolveCatalogSources } from '../lib/catalog-source-resolution.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { manualProductOptions, manualProductSelection, applyManualProductSelection, changeManualAgreementScope, CUSTOM_PRODUCT_SELECTION } from '../lib/manual-product-selection.ts';
import { buildExtractionRequest, validateAnalysisOutput, EXTRACTION_INSTRUCTIONS } from '../lib/analysis-output.ts';
import { providerDisplayName, agreementScopeDisplayName } from '../lib/provider-presentation.ts';
import { groupInsurances, createDifferences } from '../lib/comparison.ts';
import { presentImportantDifferences } from '../lib/comparison-presentation.ts';
import { matchObjects } from '../lib/object-matching.ts';
import { deriveCanonicalCoverages } from '../lib/coverage-status.ts';
import { documentPipeline, batchDocuments } from './helpers/supporting-terms.mjs';
import { sanitizeTraceEvent } from '../lib/production-trace.ts';

const date = new Date('2026-09-28');
const member = 'synthetic-member';
const source = (id, agreementScope, extra = {}) => ({ id, filename: `${id}.pdf`, termsNumber: id,
  effectiveFrom: '2026-01-01', sourceType: 'full_terms', ...(agreementScope ? { agreementScope } : {}), ...extra });
const fact = (id, value, key = 'nyverdi.km', agreementScope) => ({ key, label: key, value,
  source: { documentId: id, filename: `${id}.pdf`, termsNumber: id, effectiveFrom: '2026-01-01', page: 1,
    section: 'Synthetic', ...(agreementScope ? { agreementScope } : {}) } });
const product = (providerId, company, agreementScope, productId = `${agreementScope}-kasko`, extra = {}) => ({
  company, providerId, insuranceType: 'Bil', name: 'Kasko', productId, version: '2026',
  ...(agreementScope !== 'ordinary' ? { agreementScope } : {}),
  componentIds: [agreementScope === 'ordinary' ? 'ordinary' : 'member'], ...extra,
});
function fixture() {
  return { companies: ['Tryg', 'If'], insuranceTypes: ['Bil'],
    agreementScopes: [{ id: member, providerId: 'tryg', name: 'Syntetisk medlemsavtale' },
      { id: member, providerId: 'if', name: 'Syntetisk If-avtale' }],
    products: [product('tryg', 'Tryg', 'ordinary'), product('tryg', 'Tryg', member),
      product('if', 'If', 'ordinary'), product('if', 'If', member)],
    sources: { ordinary: source('ordinary'), member: source('member', member), addon: source('addon', member) },
    facts: { ordinary: [fact('ordinary', '18 000 km')], member: [fact('member', '26 000 km', 'nyverdi.km', member)],
      addon: [fact('addon', '7 dager', 'leiebil.dager', member)] },
    addOns: [{ id: 'member-rental', providerId: 'tryg', agreementScope: member, name: 'Leiebil', componentId: 'addon', requiresLevel: null, insuranceTypes: ['Bil'] }],
  };
}
const manualInput = (extra = {}) => ({ type: 'Bil', productName: 'Kasko', annualPremium: '', deductible: '',
  coverageSummary: '', importantTerms: [], addOnIds: [], ...extra });
const rawRecord = (agreementScope = member, extra = {}) => ({ company: 'Tryg', type: 'Bil', productName: 'Kasko', canonicalProductName: 'Kasko',
  ...(agreementScope !== undefined ? { agreementScope } : {}), documentRole: 'individual_agreement', agreementPeriod: null,
  objectIdentifiers: [{ type: 'registration', value: 'ZZ90001', documentIndices: [1] }],
  annualPremium: null, deductible: null, coverageSummary: null, importantTerms: [], addOns: [], ...extra });
const agreement = (...insurances) => ({ company: 'Tryg', totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear', insurances });
function withCatalog(catalog, work) {
  const saved = { ...productCatalog };
  Object.assign(productCatalog, catalog);
  try { return work(); } finally {
    for (const key of Object.keys(productCatalog)) if (!(key in saved)) delete productCatalog[key];
    Object.assign(productCatalog, saved);
  }
}
const lookup = (catalog, scope, company = 'Tryg', name = 'Kasko') => findCatalogProductBySelection(company, 'Bil', name, scope, catalog);

for (const company of ['Tryg', 'If']) test(`exact ordinary/member lookup works generically for ${company}`, () => {
  const catalog = fixture();
  assert.equal(lookup(catalog, 'ordinary', company).productId, 'ordinary-kasko');
  assert.equal(lookup(catalog, member, company).agreementScope, member);
  assert.equal(lookup(catalog, null, company), null);
  assert.equal(lookup(catalog, 'Synthetic-member', company), null);
  assert.equal(lookup(catalog, 'synthetic-membe', company), null);
});
test('unknown scope fails closed even when a name only exists in one of several scopes', () => {
  const catalog = fixture(); catalog.products[1].name = 'Member Kasko';
  assert.equal(lookup(catalog, null, 'Tryg', 'Member Kasko'), null);
  assert.equal(lookup(catalog, null), null);
  assert.deepEqual(catalogProductsForSelection(catalog, 'Tryg', 'Bil'), []);
});
test('one unambiguous member scope may be resolved without arbitrary ordinary default', () => {
  const catalog = fixture(); catalog.products = [catalog.products[1]];
  assert.equal(lookup(catalog, null).agreementScope, member);
  assert.equal(lookup(catalog, 'ordinary'), null);
});
test('identity includes provider, type, scope, product and version independently', () => {
  const a = fixture().products[0];
  const variants = [a, { ...a, agreementScope: member }, { ...a, insuranceType: 'Hus' },
    { ...a, providerId: 'if' }, { ...a, productId: 'other' }, { ...a, version: '2027' }];
  assert.equal(new Set(variants.map(catalogProductIdentity)).size, 6);
  assert.equal(catalogProductIdentity(a), catalogProductIdentity({ ...a, agreementScope: 'ordinary', insuranceType: 'Personbil' }));
});
test('ID lookup fails closed for reused IDs across scopes and types', () => {
  const catalog = fixture(); const ordinary = catalog.products[0];
  catalog.products = [ordinary, { ...ordinary, agreementScope: member }, { ...ordinary, insuranceType: 'Hus' }];
  assert.equal(findCatalogProduct('tryg', ordinary.productId, '2026', {}, catalog), null);
  assert.equal(findCatalogProduct('tryg', ordinary.productId, '2026', { agreementScope: 'ordinary' }, catalog), null);
  assert.equal(findCatalogProduct('tryg', ordinary.productId, '2026', { insuranceType: 'Bil', agreementScope: member }, catalog).agreementScope, member);
});
test('versions stay distinct inside one scope; name lookup never picks an arbitrary version', () => {
  const catalog = fixture(), p = catalog.products[1]; catalog.products.push({ ...p, version: '2027' });
  assert.equal(lookup(catalog, member), null);
  assert.equal(findCatalogProduct('tryg', p.productId, '2026', p, catalog).version, '2026');
  assert.equal(findCatalogProduct('tryg', p.productId, '2027', p, catalog).version, '2027');
});
test('all 121 existing products keep their exact lookup and component resolution', () => {
  // Preserve the original compatibility control while adding new typed catalogs.
  const originalProducts = productCatalog.products.filter(p => !['MC', 'Bobil'].includes(p.insuranceType));
  assert.equal(originalProducts.length, 121);
  for (const p of originalProducts) {
    assert.equal(findCatalogProduct(p.providerId, p.productId, p.version), p);
    assert.equal(findCatalogProductBySelection(p.company, p.insuranceType, p.name), p);
    assert.equal(findCatalogProductBySelection(p.company, p.insuranceType, p.name, 'ordinary'), p);
    assert.deepEqual(resolveCatalogFacts(p, [], date), resolveCatalogFacts({ ...p, agreementScope: 'ordinary' }, [], date));
  }
});
test('scope does not create a provider or change legal provider aliases', () => {
  const catalog = fixture(); assert.equal(canonicalProviderId('Tryg', catalog), 'tryg');
  assert.equal(canonicalProviderId('Syntetisk medlemsavtale', catalog), null);
  assert.equal(canonicalProviderId('Gjensidige Forsikring ASA'), 'gjensidige');
});
test('catalog identity references carry member scope and canonical type', () => {
  const p = fixture().products[1];
  assert.deepEqual(catalogReferenceForProduct(p), { providerId: 'tryg', productId: p.productId, version: '2026', insuranceType: 'bil', agreementScope: member });
});
test('product inheritance cannot cross scope or version', () => {
  const catalog = fixture(); const child = { ...catalog.products[1], inheritsProductId: 'ordinary-kasko' };
  assert.throws(() => resolveProductComponentIds(child, catalog), /overordnet/);
  const parent = { ...catalog.products[1], productId: 'member-parent' }; catalog.products.push(parent);
  assert.ok(resolveProductComponentIds({ ...child, inheritsProductId: parent.productId }, catalog).length);
  assert.throws(() => resolveProductComponentIds({ ...child, inheritsProductId: parent.productId, version: '2027' }, catalog), /overordnet/);
});
for (const scope of ['ordinary', member]) test(`source resolution isolates ${scope}, including legacy source metadata`, () => {
  const catalog = fixture(), p = lookup(catalog, scope);
  const candidates = [...catalog.facts.ordinary, ...catalog.facts.member];
  for (const sourceType of ['full_terms', undefined]) {
    const sources = Object.fromEntries(Object.entries(catalog.sources).map(([id, s]) => [id, { ...s, sourceType }]));
    const result = resolveCatalogSources(candidates, sources, p, date);
    assert.equal(result.facts.length, 1);
    assert.equal(result.facts[0].source.documentId, scope === 'ordinary' ? 'ordinary' : 'member');
  }
});
test('unscoped or contradictory source cannot enrich member product', () => {
  const catalog = fixture(), p = catalog.products[1];
  assert.deepEqual(resolveCatalogSources([fact('missing', '1')], {}, p, date).facts, []);
  assert.deepEqual(resolveCatalogSources([fact('member', '1', 'nyverdi.km', 'ordinary')], catalog.sources, p, date).facts, []);
});
test('qualification evidence from another agreement cannot change a member fact', () => {
  const catalog = fixture();
  const candidate = { ...catalog.facts.member[0], qualificationSource: catalog.facts.ordinary[0].source };
  assert.deepEqual(resolveCatalogSources([candidate], catalog.sources, catalog.products[1], date).facts, []);
});
test('cross-scope replacesBase cannot erase correct facts or enter enrichment evidence', () => {
  const catalog = fixture(), p = { ...catalog.products[1], componentIds: ['member', 'ordinary'] };
  catalog.facts.ordinary[0].replacesBase = true;
  assert.deepEqual(resolveCatalogFacts(p, [], date, null, catalog).map(f => f.value), ['26 000 km']);
  assert.deepEqual(resolveCatalogEvidence(p, [], date, null, catalog).map(f => f.source.documentId), ['member']);
});
test('source validity and source version still apply inside agreement scope', () => {
  const catalog = fixture(), p = catalog.products[1];
  for (const patch of [{ productVersion: '2027' }, { effectiveFrom: '2027-01-01' }, { validTo: '2025-12-31' }, { providerId: 'if' }, { insuranceType: 'Hus' }]) {
    const sources = { ...catalog.sources, member: { ...catalog.sources.member, ...patch } };
    assert.deepEqual(resolveCatalogSources(catalog.facts.member, sources, p, date).facts, []);
  }
});
test('member-only add-on is unavailable to ordinary and other providers', () => {
  const catalog = fixture();
  assert.deepEqual(availableAddOns(catalog.products[0], date, null, catalog), []);
  assert.equal(availableAddOns(catalog.products[1], date, null, catalog)[0].id, 'member-rental');
  assert.deepEqual(availableAddOns(catalog.products[3], date, null, catalog), []);
  assert.throws(() => resolveCatalogFacts(catalog.products[0], ['member-rental'], date, null, catalog), /tilleggsdekning/);
});
test('ordinary legacy add-on does not become universally available to member product', () => {
  const catalog = fixture(); catalog.addOns.push({ id: 'ordinary-only', name: 'Legacy', providerId: 'tryg', componentId: 'ordinary', requiresLevel: null });
  assert.deepEqual(availableAddOns(catalog.products[1], date, null, catalog).map(a => a.id), ['member-rental']);
});
test('member add-on with an ordinary source is not selectable', () => {
  const catalog = fixture(); delete catalog.sources.addon.agreementScope;
  assert.deepEqual(availableAddOns(catalog.products[1], date, null, catalog), []);
  assert.throws(() => resolveCatalogFacts(catalog.products[1], ['member-rental'], date, null, catalog), /tilleggsdekning/);
});
test('manual dropdown has exact scope and same-name choices have different identities', () => {
  const catalog = fixture();
  const ordinary = manualProductOptions('Tryg', 'Bil', catalog, 'ordinary');
  const scoped = manualProductOptions('Tryg', 'Bil', catalog, member);
  assert.equal(ordinary.length, 1); assert.equal(scoped.length, 1);
  assert.notEqual(ordinary[0].value, scoped[0].value);
  assert.deepEqual(manualProductOptions('Tryg', 'Bil', catalog), []);
  assert.deepEqual(catalogAgreementScopeOptions(catalog, 'Tryg', 'Bil').map(s => s.id), ['ordinary', member]);
  assert.deepEqual(catalogAgreementScopeOptions(catalog, 'Tryg', 'Hus'), []);
});
test('manual unknown scope stays custom/unresolved; explicit member selection persists', () => {
  const catalog = fixture();
  assert.equal(manualProductSelection(manualInput(), 'Tryg', 'Bil', catalog), CUSTOM_PRODUCT_SELECTION);
  const option = manualProductOptions('Tryg', 'Bil', catalog, member)[0];
  const selected = applyManualProductSelection(manualInput({ agreementScope: member }), 'Tryg', 'Bil', option.value, catalog);
  const result = normalizeManualAgreement({ company: 'Tryg', products: [selected] }, catalog).insuranceData.insurances[0];
  assert.equal(result.agreementScope, member); assert.equal(result.catalogReference.agreementScope, member);
  assert.equal(result.importantTerms.find(f => f.key === 'nyverdi.km').value, '26 000 km');
});
test('manual scope switch clears previous product and add-ons; custom name survives', () => {
  const catalog = fixture();
  const selected = changeManualAgreementScope(manualInput({ agreementScope: member, catalogReference: catalogReferenceForProduct(catalog.products[1]), addOnIds: ['member-rental'] }), 'Tryg', 'Bil', 'ordinary', catalog);
  assert.deepEqual(selected.addOnIds, []); assert.equal(selected.catalogReference.productId, 'ordinary-kasko');
  const unknown = changeManualAgreementScope(selected, 'Tryg', 'Bil', null, catalog);
  assert.equal(unknown.catalogReference, null); assert.equal(unknown.productName, '');
  const custom = changeManualAgreementScope(manualInput({ customProduct: true, productName: 'Syntetisk egen variant' }), 'Tryg', 'Bil', member, catalog);
  assert.equal(custom.productName, 'Syntetisk egen variant'); assert.equal(custom.customProduct, true);
});
test('custom with stale reference never acquires catalog facts', () => {
  const catalog = fixture();
  const result = normalizeManualAgreement({ company: 'Tryg', products: [manualInput({ agreementScope: member, customProduct: true, catalogReference: catalogReferenceForProduct(catalog.products[1]) })] }, catalog);
  assert.equal(result.insuranceData.insurances[0].catalogReference, null);
});
test('forged manual reference cannot cross scope or type', () => {
  const catalog = fixture();
  for (const ref of [{ ...catalogReferenceForProduct(catalog.products[1]) }, { ...catalogReferenceForProduct(catalog.products[0]), insuranceType: 'Hus' }]) {
    assert.throws(() => normalizeManualAgreement({ company: 'Tryg', products: [manualInput({ agreementScope: 'ordinary', catalogReference: ref })] }, catalog));
  }
});
test('manual version choice remains exact even when names repeat', () => {
  const catalog = fixture(); catalog.products.push({ ...catalog.products[1], version: '2027' });
  const options = manualProductOptions('Tryg', 'Bil', catalog, member);
  assert.equal(options.length, 2); assert.notEqual(options[0].value, options[1].value);
  assert.deepEqual(options.map(option => option.label), ['Kasko (2026)', 'Kasko (2027)']);
  const p = applyManualProductSelection(manualInput({ agreementScope: member }), 'Tryg', 'Bil', options[1].value, catalog);
  assert.equal(normalizeManualAgreement({ company: 'Tryg', products: [p] }, catalog).insuranceData.insurances[0].catalogReference.version, '2027');
});
test('manual annual mileage and multiple products remain separate within member scope', () => {
  const catalog = fixture();
  const result = normalizeManualAgreement({ company: 'Tryg', products: [9000, 17000].map(n => manualInput({ agreementScope: member, annualMileage: String(n) })) }, catalog);
  assert.equal(result.insuranceData.insurances.length, 2);
  assert.notEqual(...result.insuranceData.insurances.map(p => p.importantTerms.find(f => f.key === 'kjoretoy.kjorelengde').value));
});
test('extraction contract is unchanged for a catalog without agreement definitions', () => {
  const request = buildExtractionRequest('Synthetic', undefined, { ...productCatalog, agreementScopes: [] });
  assert.equal(request.instructions, EXTRACTION_INSTRUCTIONS);
  assert.equal(request.text.format.schema.properties.insurances.items.properties.agreementScope, undefined);
});
test('future extraction uses a closed nullable catalog enum and preserves exact scope', () => {
  const catalog = fixture(), schema = buildExtractionRequest('Synthetic', 1, catalog).text.format.schema.properties.insurances.items;
  assert.deepEqual(schema.properties.agreementScope.enum, [null, 'ordinary', member]);
  assert.ok(schema.required.includes('agreementScope'));
  const result = validateAnalysisOutput(agreement(rawRecord()), catalog);
  assert.equal(result.insurances[0].agreementScope, member);
  assert.equal(validateAnalysisOutput(agreement(rawRecord(null)), catalog).insurances[0].agreementScope, null);
});
for (const value of ['NITO', 'member@example.invalid', '12345678901', 'member-number-123', { id: member }, ' synthetic-member']) {
  test(`scope boundary rejects unregistered/PII-shaped input ${typeof value === 'object' ? 'object' : value}`, () => {
    const catalog = fixture(); assert.equal(isRegisteredAgreementScope(value, catalog.agreementScopes), false);
    assert.throws(() => validateAnalysisOutput(agreement(rawRecord(value)), catalog), /avtalescope/);
    assert.throws(() => normalizeManualAgreement({ company: 'Tryg', products: [manualInput({ agreementScope: value })] }, catalog), /avtalescope/);
  });
}
test('registered scope for another provider is rejected at input boundary', () => {
  const catalog = fixture(); catalog.agreementScopes = catalog.agreementScopes.filter(s => s.providerId === 'if');
  assert.throws(() => validateAnalysisOutput(agreement(rawRecord()), catalog), /avtalescope/);
});
for (const documentValue of ['12 000 km', '31 000 km']) test(`document value wins inside exact member catalog: ${documentValue}`, () => {
  const catalog = fixture();
  const result = enrichExtractedAgreementWithCatalog(agreement(rawRecord(member, { importantTerms: [{ name: 'Totalskadegaranti kilometer', canonicalKey: 'nyverdi.km', value: documentValue }] })), date, undefined, undefined, catalog).insurances[0];
  assert.equal(result.importantTerms.find(f => f.key === 'nyverdi.km').value, documentValue);
  assert.equal(result.catalogReference.agreementScope, member);
  assert.deepEqual(result.catalogFacts.map(f => f.source.documentId), ['member']);
});
test('unknown ambiguous extraction remains document-only', () => {
  const catalog = fixture();
  const r = enrichExtractedAgreementWithCatalog(agreement(rawRecord(null)), date, undefined, undefined, catalog).insurances[0];
  assert.equal(r.catalogReference, null); assert.deepEqual(r.importantTerms, []);
});
test('optional member add-on never implies selected while explicit refusal survives', () => {
  const catalog = fixture();
  for (const terms of [[], [{ name: 'Leiebil', value: 'Ikke valgt', canonicalKey: 'leiebil.dekning' }]]) {
    const result = enrichExtractedAgreementWithCatalog(agreement(rawRecord(member, { importantTerms: terms })), date, undefined, undefined, catalog).insurances[0];
    const rental = deriveCanonicalCoverages(result, 'Bil').find(c => c.id === 'leiebil.dekning');
    assert.equal(rental.status, terms.length ? 'not_selected' : 'unknown');
  }
});
test('supporting terms attach only within exact scope, preserving evidence provenance', () => withCatalog(fixture(), () => {
  const customer = rawRecord();
  const terms = scope => rawRecord(scope, { documentRole: 'general_terms', objectIdentifiers: [], importantTerms: [{ name: `Synthetic ${scope}`, value: 'Synthetic rule' }] });
  const result = documentPipeline([[customer], [terms('ordinary')], [terms(member)]]).insuranceData;
  assert.equal(result.insurances.length, 1);
  assert.equal(result.supportingEvidence.length, 2);
  const attached = result.insurances[0].recordEvidence.filter(r => r.documentRole === 'general_terms');
  assert.equal(attached.length, 1); assert.equal(attached[0].agreementScope, member);
  assert.ok(result.insurances[0].importantTerms.some(t => t.name === `Synthetic ${member}`));
  assert.ok(!result.insurances[0].importantTerms.some(t => t.name === 'Synthetic ordinary'));
}));
test('ambiguous unknown customer/terms cannot attach through matching free-text product names', () => withCatalog(fixture(), () => {
  const result = documentPipeline([[rawRecord(null)], [rawRecord(null, { documentRole: 'general_terms', objectIdentifiers: [], importantTerms: [{ name: 'Synthetic terms', value: 'Synthetic rule' }] })]]).insuranceData;
  assert.equal(result.insurances[0].recordEvidence.filter(r => r.documentRole === 'general_terms').length, 0);
}));
test('two cars with same member product stay distinct and match reordered offer by object ID', () => withCatalog(fixture(), () => {
  const a = rawRecord(), b = rawRecord(member, { objectIdentifiers: [{ type: 'registration', value: 'ZZ90002' }] });
  const left = documentPipeline([[a], [b]]).insuranceData.insurances;
  const right = documentPipeline([[b], [a]], 'offer').insuranceData.insurances;
  assert.equal(left.length, 2); assert.equal(right.length, 2);
  assert.ok(matchObjects(left, right).every(m => m.reason === 'EXACT_OBJECT_ID'));
}));
test('changing agreement across sides never changes customer-object identity', () => withCatalog(fixture(), () => {
  assert.equal(matchObjects([rawRecord('ordinary')], [rawRecord(member)])[0].reason, 'EXACT_OBJECT_ID');
}));
test('same-side scope conflict prevents merging terms from different agreements', () => withCatalog(fixture(), () => {
  const result = documentPipeline([[rawRecord('ordinary')], [rawRecord(member)]]).insuranceData.insurances;
  assert.equal(result.length, 2);
  assert.ok(result.every(i => i.consolidation.status === 'unresolved' && i.consolidation.issues.includes('product_conflict')));
}));
test('same-side and cross-batch consolidation preserve member product scope', () => withCatalog(fixture(), () => {
  for (const split of [false, true]) {
    const result = documentPipeline([[rawRecord()], [rawRecord()]], 'existing', split, true).insuranceData.insurances;
    assert.equal(result.length, 1); assert.equal(result[0].agreementScope, member);
    assert.equal(result[0].catalogReference.agreementScope, member);
    assert.ok(result[0].recordEvidence.every(r => r.agreementScope === member));
  }
}));
test('scope survives extraction, role boundary and record retention', () => withCatalog(fixture(), () => {
  const result = batchDocuments([[rawRecord(), rawRecord(member, { documentRole: 'general_terms', objectIdentifiers: [] })]])[0].agreement;
  assert.equal(result.insurances.length, 1);
  assert.ok(result.documentRecords.every(r => r.agreementScope === member));
}));
test('supporting terms cannot bypass unresolved catalog versions through name fallback', () => {
  const catalog = fixture(); catalog.products.push({ ...catalog.products[1], version: '2027' });
  withCatalog(catalog, () => {
    const result = documentPipeline([[rawRecord()], [rawRecord(member, { documentRole: 'general_terms', objectIdentifiers: [] })]]).insuranceData;
    assert.equal(result.insurances[0].catalogReference, null);
    assert.equal(result.insurances[0].recordEvidence.filter(r => r.documentRole === 'general_terms').length, 0);
  });
});
test('provider presentation remains insurer and agreement is a separate catalog label', () => {
  const catalog = fixture(), reference = catalogReferenceForProduct(catalog.products[1]);
  assert.equal(providerDisplayName('Tryg', reference, catalog), 'Tryg');
  assert.equal(agreementScopeDisplayName({ company: 'Tryg', agreementScope: member, catalogReference: reference }, catalog), 'Syntetisk medlemsavtale');
  assert.equal(agreementScopeDisplayName({ company: 'Tryg', agreementScope: 'ordinary' }, catalog), null);
});
test('ordinary presentation benefits never leak into member agreements', () => withCatalog(fixture(), () => {
  const doc = scope => documentPipeline([[rawRecord(scope)]]);
  const first = doc(member), second = doc(member);
  second.insuranceData.insurances[0].catalogReference = null;
  const groups = groupInsurances(first.insuranceData.insurances, second.insuranceData.insurances, null);
  const presented = presentImportantDifferences(createDifferences(first, second, groups, null), groups, null);
  assert.ok(!presented.some(p => p.presentationType === 'conditional-benefit'));
}));
test('scope is excluded from existing telemetry event vocabulary', () => {
  assert.equal(sanitizeTraceEvent({ stage: 'extraction', agreementScope: member }), null);
});
test('current UI remains free from empty agreement selectors, with native future selector semantics', () => {
  for (const p of productCatalog.products.filter(p => !['MC', 'Bobil'].includes(p.insuranceType))) assert.ok(!catalogAgreementScopeOptions(productCatalog, p.company, p.insuranceType).some(s => s.id !== 'ordinary'));
  const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /if \(!scopes\.some\(scope => scope\.id !== "ordinary"\)\) return null/);
  assert.match(page, /Avtale \/ medlemsavtale\s*<select/);
  assert.match(page, /changeManualAgreementScope/);
});
test('catalog status remains positive for exact member reference and conservative for unknown', () => withCatalog(fixture(), () => {
  assert.match(catalogConnectionStatus([{ catalogReference: catalogReferenceForProduct(productCatalog.products[1]) }]), /Koblet til Tryg Bil Kasko/);
  assert.match(catalogConnectionStatus([{ catalogReference: null }]), /Ikke koblet/);
}));
test('exact selection guard rejects cross-scope product even with identical name', () => {
  const catalog = fixture();
  assert.equal(catalogProductMatchesSelection(catalog.products[1], 'Tryg', 'Bil', 'Kasko', 'ordinary', catalog), false);
});
test('standalone product predicate retains unknown-scope ambiguity protection', () => {
  const catalog = fixture(); const standalone = { ...catalog.products[0], productId: 'standalone' };
  assert.equal(catalogProductMatchesSelection(standalone, 'Tryg', 'Bil', 'Kasko', null, catalog), false);
  assert.equal(catalogProductMatchesSelection(standalone, 'Tryg', 'Bil', 'Kasko', 'ordinary', catalog), true);
});
