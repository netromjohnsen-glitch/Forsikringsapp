import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExtractionRequest, parseExtractionResponse } from '../lib/analysis-output.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { includePdfAddOnTerms } from '../lib/pdf-addons.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { productCatalog } from '../lib/product-catalog.ts';
import { pipeline } from './helpers/pilot-quality.mjs';

const term = (name, value, canonicalKey = null) => ({ name, value, canonicalKey, documentIndices: [1] });
const record = (product = 'Kasko', company = 'Gjensidige') => ({
  type: 'Bil', company, productName: product, canonicalProductName: product,
  annualPremium: null, deductible: null, coverageSummary: null,
  documentRole: 'individual_agreement', agreementPeriod: null, documentIndices: [1],
  objectIdentifiers: [{ type: 'registration', value: product === 'Kasko' ? 'ZZ10001' : 'ZZ10002', documentIndices: [1] }],
  importantTerms: [term('Årlig kjørelengde', '20 000 km', 'kjoretoy.kjorelengde')], addOns: [],
});
const parse = r => parseExtractionResponse({ status: 'completed', output_text: JSON.stringify({
  company: r.company, totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear', insurances: [r],
}) }).insurances[0];
const normalized = r => normalizeDocumentFacts(includePdfAddOnTerms(parse(r)));
const values = (terms, key) => terms.filter(t => t.key === key).map(t => t.value);
const expectLimits = (terms, age, km) => {
  assert.deepEqual(values(terms, 'nyverdi.alder'), age ? [age] : []);
  assert.deepEqual(values(terms, 'nyverdi.km'), km ? [km] : []);
};
function represented(product, company, age, km, shape) {
  const r = record(product, company), label = `Totalskadegaranti – ${product}`;
  const sentence = `Gjelder for kjøretøy inntil ${age} fra første registreringsdato og inntil ${km}.`;
  if (shape === 'canonical') r.importantTerms.push(term('Dokumentert aldersgrense', age, 'nyverdi.alder'), term('Dokumentert kilometergrense', km, 'nyverdi.km'));
  if (shape === 'compound') r.importantTerms.push(term(label, sentence));
  if (shape === 'qualified-details') r.importantTerms.push(term(`${label} – alder`, age), term(`${label} – kilometer`, km));
  if (shape === 'embedded') r.importantTerms.push(term('Viktige vilkår', `${label}: ${sentence}`));
  if (shape === 'summary-lines') r.coverageSummary = `${label}:\nAldersgrense: ${age}\nKilometergrense: ${km}.\nÅrlig kjørelengde: 20 000 km.`;
  if (shape === 'summary-semicolon') r.coverageSummary = `${label}: ${age}; ${km}. Årlig kjørelengde: 20 000 km.`;
  if (shape === 'addon') r.addOns.push({ name: 'Dokumenterte utvidelser', annualPremium: null, deductible: null, importantTerms: [term('Vilkår', `${label}:\n${age} / ${km}.`)] });
  return r;
}

for (const [product, company, age, km] of [
  ['Kasko', 'Gjensidige', '1 år', '15 000 km'],
  ['Pluss', 'Gjensidige', '3 år', '60 000 km'],
  ['Kasko', 'Tryg', '2 år', '17 321 km'],
  ['Super', 'If', '4 år', '45 678 km'],
]) for (const shape of ['canonical', 'compound', 'qualified-details', 'embedded', 'summary-lines', 'summary-semicolon', 'addon']) {
  test(`A: explicit ${company}/${product} limits recover from ${shape}`, () => {
    const input = represented(product, company, age, km, shape), result = normalized(input);
    expectLimits(result, age, km);
    assert.deepEqual(values(result, 'kjoretoy.kjorelengde'), ['20 000 km']);
    assert.ok(result.filter(t => t.key?.startsWith('nyverdi.')).every(t => t.coverageOrigin === 'document'));
    assert.deepEqual(normalizeDocumentFacts({ ...input, importantTerms: result }), result);
  });
}

for (const [text, age, km] of [
  ['Totalskadegaranti: inntil 2 år.', '2 år', null],
  ['Nybilgaranti: inntil 17 321 km.', null, '17 321 km'],
  ['Nyverdierstatning – Kasko:\n2 år / 17 321 km.', '2 år', '17 321 km'],
  ['Kasko inkluderer totalskadegaranti 2 år / 17 321 km.', '2 år', '17 321 km'],
  ['Dekninger: totalskadegaranti 2 år / 17 321 km.', '2 år', '17 321 km'],
  ['Totalskadegaranti Kasko 2 år / 17 321 km.', '2 år', '17 321 km'],
]) test(`A: independently documented limits: ${text}`, () => {
  const r = record(); r.coverageSummary = text; expectLimits(normalized(r), age, km);
});

for (const text of [
  'Årlig kjørelengde: 20 000 km.',
  'Kilometerstand: 164 000 km. Avtalt maksimal kilometerstand: 184 000 km.',
  'Maskinskade: 10 år / 200 000 km.',
  'Kilometergrense: 15 000 km.',
  'Totalskadegaranti – Pluss: 3 år / 60 000 km.',
  'Totalskadegaranti – Ukjent produkt: 3 år / 60 000 km.',
  'Totalskadegaranti – Kasko:\nEgenandel: 5 000 kr. Maskinskade: 10 år / 200 000 km.',
  'Totalskadegaranti: Gjelder ikke fordi bilen er 8 år og har kjørt 150 000 km.',
  'Pluss inkluderer totalskadegaranti 3 år / 60 000 km.',
]) test(`B or unsafe context never invents totalskade limits: ${text}`, () => {
  const r = record(); r.coverageSummary = text; r.importantTerms.push(term('Vilkår', text));
  expectLimits(normalized(r), null, null);
});

test('B: complete model omission stays absent in document facts even with a catalog product', () => {
  const r = record(); expectLimits(normalized(r), null, null);
  const enriched = enrichExtractedAgreementWithCatalog({ company: r.company, insurances: [parse(r)] }).insurances[0];
  assert.ok(enriched.importantTerms.filter(t => ['nyverdi.alder', 'nyverdi.km'].includes(t.key)).every(t => t.coverageOrigin === 'catalog'));
});

for (const field of ['Årlig kjørelengde', 'Kilometerstand', 'Avtalt maksimal kilometerstand', 'Maskinskade']) {
  test(`explicit totalskade context ends before ${field}`, () => {
    const r = record(); r.coverageSummary = `Totalskadegaranti – Kasko: 2 år. ${field}: 10 år / 200 000 km.`;
    expectLimits(normalized(r), '2 år', null);
    r.importantTerms.push(term('Totalskadegaranti – Kasko', `Inntil 2 år. ${field}: 10 år / 200 000 km.`));
    expectLimits(normalized(r), '2 år', null);
  });
}
test('all five kilometer identities stay distinct', () => {
  const r = represented('Kasko', 'Gjensidige', '1 år', '15 000 km', 'embedded');
  r.importantTerms.push(term('Kilometerstand', '164 000 km', 'kjoretoy.kilometerstand'),
    term('Avtalt maksimal kilometerstand', '184 000 km', 'kjoretoy.avtalt_maks_kilometerstand'),
    term('Maskinskade', '10 år / 200 000 km', 'maskinskade.varighet'));
  const result = normalized(r);
  for (const [key, value] of Object.entries({ 'nyverdi.km': '15 000 km', 'kjoretoy.kjorelengde': '20 000 km',
    'kjoretoy.kilometerstand': '164 000 km', 'kjoretoy.avtalt_maks_kilometerstand': '184 000 km', 'maskinskade.km': '200 000 km' })) assert.deepEqual(values(result, key), [value]);
});
for (const suffix of ['per forsikringsår', 'per år', 'pr. år', 'årlig', '/år']) {
  test(`annual mileage suffix ends totalskade kilometer inference: ${suffix}`, () => {
    const r = record(); r.coverageSummary = `Totalskadegaranti: 1 år.\n20 000 km ${suffix}.`;
    expectLimits(normalized(r), '1 år', null);
    r.coverageSummary = null; r.importantTerms.push(term('Vilkår', `Totalskadegaranti: 1 år.\n20 000 km ${suffix}.`));
    expectLimits(normalized(r), '1 år', null);
  });
}
for (const shape of ['embedded', 'summary-lines']) test(`no first-number selection for ambiguous ${shape}`, () => {
  const r = record(), text = 'Totalskadegaranti: 1 år / 15 000 km eller 3 år / 60 000 km.';
  if (shape === 'embedded') r.importantTerms.push(term('Vilkår', text)); else r.coverageSummary = text;
  expectLimits(normalized(r), null, null);
});
test('ambiguous compound totalskade does not select the first limit pair', () => {
  const r = record(); r.importantTerms.push(term('Totalskadegaranti', '1 år / 15 000 km eller 3 år / 60 000 km.'));
  expectLimits(normalized(r), null, null);
});
test('explicit wrong-product context cannot be recovered from its term value', () => {
  const r = record(); r.importantTerms.push(term('Totalskadegaranti – Pluss', '3 år / 60 000 km.'));
  expectLimits(normalized(r), null, null);
  r.importantTerms.at(-1).value = 'Totalskadegaranti: 3 år / 60 000 km.';
  expectLimits(normalized(r), null, null);
});
test('non-Bil types never receive personbil totalskade facts from text recovery', () => {
  const r = represented('Kasko', 'Gjensidige', '1 år', '15 000 km', 'embedded'); r.type = 'Tilhenger';
  expectLimits(normalized(r), null, null);
});
test('structured document limits beat secondary summary and source evidence survives recovery', () => {
  const r = represented('Kasko', 'Gjensidige', '2 år', '17 321 km', 'embedded');
  r.coverageSummary = 'Totalskadegaranti: 3 år / 60 000 km.';
  const source = { documentId: 'synthetic:document', filename: 'Synthetic', page: 2, section: 'Synthetic limits', termsNumber: '', effectiveFrom: '' };
  r.importantTerms.at(-1).sources = [source];
  const result = normalizeDocumentFacts(r); expectLimits(result, '2 år', '17 321 km');
  for (const t of result.filter(t => ['nyverdi.alder', 'nyverdi.km'].includes(t.key))) assert.deepEqual(t.sources, [source]);
});
for (const [company, x, y] of [['Gjensidige', '17 321 km', '28 765 km'], ['Tryg', '18 765 km', '29 876 km']]) {
  test(`recovered document X beats catalog Y for ${company}`, () => {
    const saved = productCatalog.facts;
    try {
      productCatalog.facts = Object.fromEntries(Object.entries(saved).map(([key, list]) => [key, list.map(f => f.key === 'nyverdi.km' ? { ...f, value: y } : f)]));
      const r = represented('Kasko', company, '2 år', x, 'embedded');
      const result = enrichExtractedAgreementWithCatalog({ company, insurances: [parse(r)] }).insurances[0];
      assert.deepEqual(values(result.importantTerms, 'nyverdi.km'), [x]);
      assert.equal(result.importantTerms.find(t => t.key === 'nyverdi.km').coverageOrigin, 'document');
      assert.ok(result.catalogFacts.some(t => t.key === 'nyverdi.km' && t.value === y));
    } finally { productCatalog.facts = saved; }
  });
}
for (const side of ['existing', 'offer']) for (const reverse of [false, true]) for (const completion of [false, true]) {
  test(`same content stays canonical: ${side}, reversed documents=${reverse}, batches=${completion}`, () => {
    const records = [represented('Kasko', 'Gjensidige', '1 år', '15 000 km', 'embedded'),
      represented('Pluss', 'Gjensidige', '3 år', '60 000 km', 'summary-lines')];
    const result = pipeline(reverse ? records.toReversed() : records, side, completion);
    assert.equal(result.insuranceData.insurances.length, 2);
    for (const r of result.insuranceData.insurances) {
      const [age, km] = r.canonicalProductName === 'Kasko' ? ['1 år', '15 000 km'] : ['3 år', '60 000 km'];
      expectLimits(r.importantTerms, age, km);
      assert.ok(r.importantTerms.filter(t => ['nyverdi.alder', 'nyverdi.km'].includes(t.key)).every(t => t.coverageOrigin === 'document'));
      assert.deepEqual(values(r.importantTerms, 'kjoretoy.kjorelengde'), ['20 000 km']);
    }
  });
}
test('extraction contract requires separate explicit totalskade facts, never summary-only guessing', () => {
  const request = buildExtractionRequest('Synthetic document', 2);
  assert.match(request.instructions, /For hvert Bil-objekt[^\n]*nyverdi\.alder[^\n]*nyverdi\.km/u);
  assert.match(request.instructions, /Ikke la disse grensene bare stå i coverageSummary/u);
  assert.match(request.instructions, /Ikke opprett manglende grenser/u);
  const schema = request.text.format.schema.properties.insurances.items;
  assert.ok(schema.properties.importantTerms.items.properties.canonicalKey.enum.includes('nyverdi.km'));
  assert.equal(request.store, false);
});
