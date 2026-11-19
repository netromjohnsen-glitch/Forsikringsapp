import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { newMotorHomeProducts, newMotorHomeFacts, newMotorHomeSources, newMotorHomeAddOns } from '../lib/new-private-motor-home-catalog.ts';
import { productCatalog, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';

const ids = [
  'klp-bil-ansvar', 'klp-bil-delkasko', 'klp-bil-kasko', 'klp-bil-kasko-maks',
  'klp-hus-hus', 'klp-hus-utvidet-rate-og-insektskader', 'klp-hus-hus-maks',
  'landkreditt-bil-ansvar', 'landkreditt-bil-delkasko', 'landkreditt-bil-kasko', 'landkreditt-bil-kasko-pluss',
  'landkreditt-hus-standard', 'landkreditt-hus-utvidet',
  'watercircles-bil-ansvar', 'watercircles-bil-delkasko', 'watercircles-bil-kasko', 'watercircles-bil-elite',
  'watercircles-hus-standard', 'watercircles-hus-elite',
];
const product = id => newMotorHomeProducts.find(item => item.productId === id);
const facts = id => resolveCatalogFacts(product(id), [], new Date('2026-11-19T12:00:00Z'));
const fact = (id, key) => facts(id).find(item => item.key === key);

// These checks are tied to independent full-PDF paragraphs, not generated row counts.
test('Bil/Hus completion preserves the exact nineteen product and four optional contracts', () => {
  assert.deepEqual(newMotorHomeProducts.map(item => item.productId), ids);
  assert.deepEqual(newMotorHomeAddOns.map(item => item.id), [
    'landkreditt-bil-leiebil', 'landkreditt-bil-maskinskade', 'landkreditt-hus-utleie', 'watercircles-hus-utleie',
  ]);
  for (const id of ids) {
    const prefix = product(id).insuranceType === 'Hus' ? 'hus.' : '';
    for (const suffix of ['avtale.personvern', 'oppgjor.skademelding', 'rettshjelp.grense']) {
      assert.ok(fact(id, prefix + suffix), `${id}: ${suffix}`);
    }
    assert.equal(compareCatalogProducts(product(id), product(id)).differenceCount, 0);
  }
});

test('all source bytes and every fact provenance stay within the actual archived product/type source', () => {
  for (const source of Object.values(newMotorHomeSources)) {
    const path = source.filename.includes('/') ? source.filename : `new-private-motor-home/${source.filename}`;
    const bytes = readFileSync(new URL(`../catalog/sources/${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.id);
    assert.ok(bytes.subarray(0, 5).equals(Buffer.from('%PDF-')), source.id);
    assert.equal(source.sourceType, 'full_terms');
  }
  for (const [componentId, entries] of Object.entries(newMotorHomeFacts)) {
    assert.equal(new Set(entries.map(item => item.key)).size, entries.length, componentId);
    const selected = product(componentId) ?? newMotorHomeAddOns.find(item => item.id === componentId);
    assert.ok(selected, componentId);
    for (const entry of entries) {
      const source = newMotorHomeSources[entry.source.documentId];
      assert.ok(source, `${componentId}: ${entry.key}`);
      assert.ok(entry.source.page >= source.physicalPages[0] && entry.source.page <= source.physicalPages[1], `${source.id}: ${entry.key}`);
      assert.equal(entry.source.filename, source.filename);
      assert.equal(entry.source.url, source.url);
      assert.equal(source.providerId, selected.providerId);
      if (product(componentId)) assert.equal(source.insuranceType, selected.insuranceType);
      assert.ok(entry.source.section);
      assert.equal(entry.source.agreementScope, 'ordinary');
    }
  }
});

test('KLP accident child increase and special settlement clauses are scoped to the documented level', () => {
  assert.equal(fact('klp-bil-kasko-maks', 'ulykke.invaliditet.barn').source.page, 15);
  assert.match(fact('klp-bil-kasko-maks', 'ulykke.invaliditet.barn').value, /1 million/);
  assert.equal(fact('klp-bil-kasko', 'ulykke.invaliditet.barn'), undefined);
  assert.equal(fact('klp-hus-hus-maks', 'hus.takvegg.egenandel').source.page, 13);
  assert.match(fact('klp-hus-hus-maks', 'hus.takvegg.egenandel').value, /20 000/);
  assert.equal(fact('klp-hus-hus', 'hus.takvegg.egenandel'), undefined);
  assert.equal(fact('klp-hus-hus-maks', 'hus.utleie.vilkar').source.page, 4);
  assert.match(fact('klp-hus-hus-maks', 'hus.utleie.vilkar').value, /2 måneders/);
});

test('Landkreditt legal sum is certificate-dependent, machine damage stays optional and its table is complete', () => {
  const legal = fact('landkreditt-bil-ansvar', 'rettshjelp.grense');
  assert.equal(legal.source.page, 9);
  assert.match(legal.value, /forsikringsbeviset/);
  assert.doesNotMatch(legal.value, /100 000/);
  const selected = product('landkreditt-bil-kasko-pluss');
  assert.equal(fact(selected.productId, 'maskinskade.dekning'), undefined);
  assert.ok(availableAddOns(selected).some(item => item.id === 'landkreditt-bil-maskinskade'));
  const withOption = resolveCatalogFacts(selected, ['landkreditt-bil-maskinskade']);
  assert.match(withOption.find(item => item.key === 'maskinskade.egenandel.150000-174999').value, /30 prosent/);
  assert.match(withOption.find(item => item.key === 'maskinskade.egenandel.175000-200000').value, /40 prosent/);
});

test('WaterCircles common legal source and Elite/VIS limitations are separate from standard', () => {
  const legal = fact('watercircles-bil-ansvar', 'rettshjelp.grense');
  assert.equal(legal.source.documentId, 'new-private:motor-home:watercircles-general:bil');
  assert.equal(legal.source.page, 7);
  assert.match(fact('watercircles-bil-ansvar', 'avtale.krigatom').value, /Jordskjelv/);
  assert.match(fact('watercircles-hus-standard', 'hus.avtale.krigatom').value, /naturskade/);
  assert.match(legal.value, /250 000/);
  assert.equal(fact('watercircles-hus-standard', 'hus.skadedyr.vannfradrag'), undefined);
  assert.equal(fact('watercircles-hus-elite', 'hus.skadedyr.vannfradrag').source.page, 26);
  assert.match(fact('watercircles-hus-elite', 'hus.skadedyr.vannfradrag').value, /30 år/);
  assert.match(fact('watercircles-hus-elite', 'hus.skadedyr.vanngrense').value, /600 000/);
  assert.equal(fact('watercircles-hus-elite', 'hus.utleie.sikkerhet'), undefined);
  const option = resolveCatalogFacts(product('watercircles-hus-elite'), ['watercircles-hus-utleie']);
  assert.match(option.find(item => item.key === 'hus.utleie.sikkerhet').value, /6 uker/);
  assert.ok(newMotorHomeSources['new-private:motor-home:watercircles-general:hus'].productIds.every(id => product(id).insuranceType === 'Hus'));
  assert.ok(productCatalog.products.some(item => item.productId === 'watercircles-hus-elite'));
});


test('published bonus rules remain visible in product comparison without exposing personal bonus data', () => {
  for (const id of ['klp-bil-kasko-maks', 'landkreditt-bil-kasko-pluss', 'watercircles-bil-elite']) {
    const result = compareCatalogProducts(product(id), product(id));
    const publicRule = result.first.facts.find(item => item.key === 'avtale.bonus.ordning');
    assert.ok(publicRule, id);
    assert.ok(publicRule.sources.length);
    assert.ok(result.sections.some(section => section.rows.some(row => row.key === 'avtale.bonus.ordning')));
  }
  assert.ok(fact('klp-bil-kasko-maks', 'bonus.parkert'));
  assert.ok(compareCatalogProducts(product('watercircles-bil-elite'), product('watercircles-bil-elite')).first.facts.some(item => item.key === 'avtale.bonus.maskinskade'));
});
