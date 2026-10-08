import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const out = fileURLToPath(new URL('.', import.meta.url));
const auth = JSON.parse(readFileSync(out + '/authorization.json'));
const mode = process.argv[2];
assert.ok(['baseline', 'candidate'].includes(mode));
if (mode === 'baseline') registerHooks({ load(url, context, next) {
  const result = next(url, context);
  const path = auth.production_files.find(path => url === new URL(path, 'file://' + root).href);
  return path ? { ...result, source: execFileSync('git', ['show', auth.baseline + ':' + path], { cwd: root }) } : result;
} });
const { normalizeManualAgreement } = await import(root + '/lib/manual-agreement.ts');
const { enrichExtractedAgreementWithCatalog } = await import(root + '/lib/catalog-enrichment.ts');
const { productCatalog, availableAddOns } = await import(root + '/lib/product-catalog.ts');
const { groupInsurances, groupTerms, groupAddOnNames } = await import(root + '/lib/comparison.ts');
const { deriveCanonicalCoverages } = await import(root + '/lib/coverage-status.ts');
const { materializeCatalogProduct, compareCatalogProducts, productComparisonProducts } = await import(root + '/lib/catalog-product-comparison.ts');
const date = new Date('2026-10-08T12:00:00Z');
const tree = x => x === undefined ? ['undefined'] : x === null ? ['null'] : Array.isArray(x) ? ['array', x.map(tree)] :
  typeof x === 'object' ? ['object', Object.keys(x).map(key => [key, tree(x[key])])] : [typeof x, x];
const hash = x => createHash('sha256').update(JSON.stringify(tree(x))).digest('hex');
const chain = (value, company) => {
  const values = [value];
  for (let i = 0; i < 3; i++) values.push(enrichExtractedAgreementWithCatalog({
    company, totalAnnualPremium: null, insurances: [values.at(-1)],
  }, date).insurances[0]);
  return values.map(insurance => ({ insurance, names: groupAddOnNames([insurance], insurance.type),
    same: groupTerms(groupInsurances([insurance], [insurance], null)[0], null) }));
};
const manual = (product, ids = []) => normalizeManualAgreement({ company: product.company, products: [{
  type: product.insuranceType, productName: product.name, importantTerms: [], addOnIds: ids,
}] }).insuranceData.insurances[0];
const products = [], addons = [];
for (const product of productCatalog.products) {
  if (product.productId === 'gjensidige-hus') continue;
  products.push({ product: product.productId, hash: hash(chain(manual(product), product.company)) });
  for (const addon of availableAddOns(product, date, null, productCatalog)) {
    if (product.insuranceType === 'Hus' && addon.selectionEvidenceKeys?.length) continue;
    let value;
    try { value = manual(product, [addon.id]); }
    catch (error) { addons.push({ product: product.productId, addon: addon.id, blocked: error.message }); continue; }
    addons.push({ product: product.productId, addon: addon.id, hash: hash(chain(value, product.company)) });
  }
}
const materialized = productComparisonProducts().map(product => ({ product: product.productId,
  hash: hash({ facts: materializeCatalogProduct(product), same: compareCatalogProducts(product, product) }) }));
const result = { mode, tested_revision: auth.baseline, raw_catalog_hash: hash(productCatalog), products, addons, materialized };
const standard = productCatalog.products.find(product => product.productId === 'gjensidige-hus');
result.manual_choice = chain(manual(standard, ['gjensidige-hus-rate-insekter']), standard.company).map(({ insurance, names }) => ({
  ids: insurance.addOnIds, status: deriveCanonicalCoverages(insurance, 'Hus').find(coverage => coverage.id === 'hus.rate.dekning').status,
  names, marker: insurance.addOns[0].manualSelection ?? null,
}));
assert.deepEqual(result.manual_choice.map(row => row.status), mode === 'baseline'
  ? ['selected', 'unknown', 'unknown', 'unknown'] : ['selected', 'selected', 'selected', 'selected']);
if (mode === 'candidate') {
  const before = JSON.parse(readFileSync(out + '/isolation-baseline.json'));
  for (const field of ['raw_catalog_hash', 'products', 'addons', 'materialized']) assert.deepEqual(result[field], before[field], field);
  assert.equal(products.length, 203); assert.equal(addons.filter(x => x.hash).length, 157);
  assert.equal(addons.length, 159); assert.equal(materialized.length, 202);
  result.status = 'PASS';
}
writeFileSync(out + '/isolation-' + mode + '.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ mode, status: 'PASS', products: products.length,
  valid_addons: addons.filter(x => x.hash).length, blocked_addons: addons.filter(x => x.blocked).length, materialized: materialized.length }));
