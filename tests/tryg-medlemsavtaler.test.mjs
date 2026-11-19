import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { matchTrygMemberProduct, trygMemberInventories } from '../lib/tryg-member-catalog.ts';

const scopes = ['nito', 'utdanningsforbundet'];
const categories = [
  ['Bil', 'member', 'member'],
  ['Reise', 'member', 'member'],
  ['Innbo', 'member', 'member'],
  ['Ulykke', 'member', 'discount'],
  ['Hus', 'member', 'member'],
  ['Innbo fritidsbolig', 'member', 'discount'],
];

const inventoryFor = agreementScope => trygMemberInventories.find(entry => entry.agreementScope === agreementScope);
const match = (agreementScope, { insuranceType, name }) => matchTrygMemberProduct({
  agreementScope, insuranceType, productName: name,
});

test('begge medlemsavtaler har Tryg som forsikringsgiver for de aktive medlemsproduktene', () => {
  assert.deepEqual(trygMemberInventories.map(entry => entry.agreementScope).sort(), scopes);
  for (const agreementScope of scopes) {
    const inventory = inventoryFor(agreementScope);
    assert.equal(inventory.providerId, 'tryg');
    assert.ok(inventory.products.some(product => product.kind === 'member'));
    assert.ok(inventory.products.some(product => product.kind === 'discount'));
    assert.equal(new Set(inventory.products.map(product => product.id)).size, inventory.products.length);
    for (const product of inventory.products) {
      assert.ok(product.name && product.insuranceType, product.id);
      assert.ok(product.sources.length > 0, product.id);
      for (const source of product.sources) {
        assert.equal(new URL(source.url).protocol, 'https:', product.id);
        assert.ok(source.role, product.id);
      }
      if (product.kind === 'historical' || product.kind === 'other-insurer') {
        assert.equal(match(agreementScope, product), null, product.id);
      }
    }
  }
});

for (const [insuranceType, nitoKind, udfKind] of categories) {
  test(`${insuranceType} matches på riktig avtale med dokumentert produktslag`, () => {
    for (const [agreementScope, expectedKind] of [[scopes[0], nitoKind], [scopes[1], udfKind]]) {
      const candidates = inventoryFor(agreementScope).products.filter(product =>
        product.insuranceType === insuranceType && product.kind === expectedKind);
      assert.ok(candidates.length > 0, `${agreementScope}: ${insuranceType}`);
      for (const product of candidates) {
        assert.equal(match(agreementScope, product)?.id, product.id);
        assert.equal(match(agreementScope, product)?.kind, expectedKind);
        assert.equal(match(agreementScope, { ...product, name: product.name.toLocaleUpperCase('nb-NO') })?.id, product.id);
        assert.equal(match(null, product), null);
        assert.equal(match('ordinary', product), null);
        assert.equal(match(agreementScope, { ...product, name: `${product.name} Syntetisk` }), null);
      }
    }
  });
}

test('katalogoppslag krysskobler verken navn, forsikringstype eller avtale', () => {
  const nitoFritidsinnbo = inventoryFor('nito').products.find(product => product.insuranceType === 'Innbo fritidsbolig');
  assert.ok(nitoFritidsinnbo);
  assert.equal(match('nito', { ...nitoFritidsinnbo, insuranceType: 'Innbo' }), null);
  assert.equal(match('utdanningsforbundet', nitoFritidsinnbo), null);
  const udfBil = inventoryFor('utdanningsforbundet').products.find(product => product.insuranceType === 'Bil' &&
    !match('nito', product));
  assert.ok(udfBil);
  assert.equal(match('nito', udfBil), null);
  assert.equal(match('uavklart-avtale', udfBil), null);
});


test('arkiverte NITO-vilkår har original PDF og kontrollsum for alle dokumentroller', () => {
  const inventory = inventoryFor('nito');
  const sources = new Map();
  for (const product of inventory.products) {
    if (product.kind === 'discount') {
      assert.ok(product.sources.some(source => source.role === 'ordinary_terms_index'), product.id);
      assert.ok(product.sources.some(source => source.role === 'ordinary_terms' && source.archive), product.id);
    }
    if (product.kind === 'member' && product.id !== 'behandling-enkel') {
      assert.ok(product.sources.some(source => source.role.includes('terms') && source.archive), product.id);
    }
    for (const { archive, role } of product.sources) {
      if (!archive) continue;
      if (role === 'ordinary_terms') assert.equal(product.kind, 'discount', product.id);
      assert.match(archive.path, /^tryg\/(?:[^/.][^/]*\/)*[^/.][^/]*\.pdf$/u);
      assert.match(archive.sha256, /^[a-f0-9]{64}$/u);
      assert.ok(Number.isInteger(archive.pages) && archive.pages > 0, archive.path);
      const previous = sources.get(archive.path);
      if (previous) assert.deepEqual(archive, previous);
      sources.set(archive.path, archive);
    }
  }
  for (const { path, sha256 } of sources.values()) {
    const pdf = readFileSync(new URL('../catalog/sources/' + path.split('/').map(encodeURIComponent).join('/'), import.meta.url));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', path);
    assert.equal(createHash('sha256').update(pdf).digest('hex'), sha256, path);
  }
  const behandling = inventory.products.find(product => product.id === 'behandling-enkel');
  assert.ok(behandling.sources.some(source => source.role === 'ipid' && source.archive));
  assert.ok(behandling.sources.every(source => !source.role.includes('terms')));
});
