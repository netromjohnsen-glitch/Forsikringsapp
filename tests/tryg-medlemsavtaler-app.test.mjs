import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExtractionRequest, parseExtractionResponse } from '../lib/analysis-output.ts';
import { mergeBatchResults } from '../lib/analysis-merge.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { applyManualProductSelection, manualProductOptions } from '../lib/manual-product-selection.ts';
import { normalizeInsuranceType } from '../lib/insurance-normalization.ts';
import { analyzePdfBatches } from '../lib/pdf-analysis-pipeline.ts';
import { preparePdf } from '../lib/pdf-upload-security.ts';
import { hasDocumentCatalogVersion } from '../lib/pdf-page-evidence.ts';
import { availableAddOns, catalogAgreementScopeOptions, catalogProductIdentity, findCatalogProductBySelection, productCatalog, resolveCatalogFacts } from '../lib/product-catalog.ts';
import { trygMemberAgreementScopes, trygMemberProducts } from '../lib/tryg-member-catalog.ts';

const scopes = ['nito', 'utdanningsforbundet'];
const namedTypes = ['Bil', 'Reise', 'Innbo', 'Ulykke', 'Hus', 'Innbo fritidsbolig'];
const otherScope = agreementScope => scopes.find(scope => scope !== agreementScope);
const productsFor = (agreementScope, insuranceType) => trygMemberProducts.filter(product =>
  product.agreementScope === agreementScope && product.insuranceType === insuranceType);
const inputFor = ({ insuranceType, agreementScope, name }) => ({
  type: insuranceType, agreementScope, productName: name, annualPremium: '', deductible: '',
  coverageSummary: '', importantTerms: [], addOnIds: [],
});

test('Trygs avtalevelger får begge medlemsavtalene uten å endre forsikringsgiver', () => {
  assert.deepEqual(trygMemberAgreementScopes.map(scope => scope.id).sort(), scopes);
  assert.ok(trygMemberAgreementScopes.every(scope => scope.providerId === 'tryg'));
  assert.equal(new Set(trygMemberProducts.map(catalogProductIdentity)).size, trygMemberProducts.length);
  assert.ok(trygMemberProducts.some(product => product.version === null));
  assert.ok(trygMemberProducts.some(product => typeof product.version === 'string'));
  const bilScopes = catalogAgreementScopeOptions(productCatalog, 'Tryg', 'Bil');
  assert.deepEqual(bilScopes.map(scope => scope.id).sort(), ['nito', 'ordinary', 'utdanningsforbundet']);
  assert.deepEqual(catalogAgreementScopeOptions(productCatalog, 'If', 'Bil').map(scope => scope.id), ['ordinary']);
  const schema = buildExtractionRequest('Syntetisk', 1).text.format.schema.properties.insurances.items;
  assert.ok(scopes.every(scope => schema.properties.agreementScope.enum.includes(scope)));
});

for (const insuranceType of namedTypes) {
  test(`manuelt valg beholder riktig avtale og produkt for ${insuranceType}`, () => {
    for (const agreementScope of scopes) {
      const products = productsFor(agreementScope, insuranceType);
      if (agreementScope === 'utdanningsforbundet' && ['Ulykke', 'Innbo fritidsbolig'].includes(insuranceType)) {
        assert.deepEqual(products, []);
        assert.deepEqual(manualProductOptions('Tryg', insuranceType, productCatalog, agreementScope), []);
        continue;
      }
      assert.ok(products.length, `${agreementScope}: ${insuranceType}`);
      const options = manualProductOptions('Tryg', insuranceType, productCatalog, agreementScope);
      for (const product of products) {
        const option = options.find(option => option.product === product);
        assert.ok(option, product.productId);
        const selected = applyManualProductSelection(inputFor(product), 'Tryg', insuranceType, option.value);
        const { insuranceData } = normalizeManualAgreement({ company: 'Tryg', products: [selected] });
        assert.equal(insuranceData.company, 'Tryg');
        const [result] = insuranceData.insurances;
        assert.equal(result.agreementScope, agreementScope);
        assert.equal(result.catalogReference?.productId, product.productId);
        assert.equal(result.catalogReference?.version, product.version);
        if (product.version) {
          assert.ok(result.catalogFacts?.length, `Mangler katalogfakta for ${product.productId}`);
          assert.ok(result.catalogFacts.every(fact => fact.source.agreementScope === agreementScope));
        } else {
          assert.ok(!result.catalogFacts?.length);
        }
        assert.equal(findCatalogProductBySelection('Tryg', insuranceType, product.name, null), null);
        assert.ok(!manualProductOptions('Tryg', insuranceType, productCatalog, otherScope(agreementScope))
          .some(option => option.product.productId === product.productId));
      }
    }
  });
}

test('ordinært Tryg-produkt og ukjent avtale får ulike katalogvalg', () => {
  const ordinary = findCatalogProductBySelection('Tryg', 'Bil', 'Kasko', 'ordinary');
  assert.ok(ordinary);
  const [known, unknown] = ['ordinary', null].map(agreementScope => normalizeManualAgreement({
    company: 'Tryg', products: [inputFor({ ...ordinary, agreementScope })],
  }).insuranceData.insurances[0]);
  assert.equal(known.catalogReference?.productId, ordinary.productId);
  assert.equal(unknown.catalogReference, null);
});

test('tidligere manuelle avtaler beholder et eksakt ordinært katalogvalg', () => {
  const ordinary = findCatalogProductBySelection('Tryg', 'Bil', 'Kasko', 'ordinary');
  assert.ok(ordinary);
  const legacy = {
    ...inputFor(ordinary),
    catalogReference: { providerId: ordinary.providerId, productId: ordinary.productId, version: ordinary.version },
    addOnIds: ['maskinskade'],
  };
  const normalize = product => normalizeManualAgreement({ company: 'Tryg', products: [product] }).insuranceData.insurances[0];
  const saved = normalize(legacy);
  assert.equal(saved.agreementScope, undefined);
  assert.equal(saved.catalogReference?.productId, ordinary.productId);
  assert.ok(saved.catalogFacts.some(fact => fact.key.startsWith('maskinskade.')));
  assert.throws(() => normalize({ ...legacy, agreementScope: null }), /katalogprodukt/u);
  assert.throws(() => normalize({ ...legacy, productName: 'Delkasko' }), /katalogprodukt/u);
  const refreshed = normalize({ ...legacy, catalogReference: { ...legacy.catalogReference, version: '2099-01-01' } });
  assert.equal(refreshed.catalogReference?.version, ordinary.version);
  assert.equal(refreshed.catalogReference?.productId, ordinary.productId);
  assert.equal(normalize({ ...inputFor(ordinary), catalogReference: null }).catalogReference?.productId, ordinary.productId);
  assert.equal(normalize({ ...inputFor(ordinary), agreementScope: null, catalogReference: null }).catalogReference, null);
});

test('hytteinnbo gir et eget manuelt produktvalg uten treff i ordinær innbotype', () => {
  const product = productsFor('nito', 'Innbo fritidsbolig')[0];
  assert.ok(product);
  assert.deepEqual(findCatalogProductBySelection('Tryg', 'Hytteinnbo', product.name, 'nito'), product);
  assert.equal(findCatalogProductBySelection('Tryg', 'Innbo', product.name, 'nito'), null);
});

function pdfLiteral(text) {
  return [...text].map(character => {
    if ('()\\'.includes(character)) return `\\${character}`;
    const code = character.codePointAt(0);
    if (code < 128) return character;
    if (code <= 255) return `\\${code.toString(8).padStart(3, '0')}`;
    return ' ';
  }).join('');
}

function insurancePdf(lines) {
  const content = `BT /F1 12 Tf 50 750 Td (${lines.map(pdfLiteral).join(') Tj 0 -16 Td (')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  let pdf = '%PDF-1.7\n';
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

async function runPdfCases(cases) {
  const files = await Promise.all(cases.map(async ({ product, agreementScope, edition, name, heading }, index) => {
    const lines = [`Syntetisk forsikringsbevis ${index + 1}`, 'Tryg Forsikring', agreementScope ?? 'Avtale ikke oppgitt', name ?? product.name];
    if (heading) lines.push(...heading);
    if (edition) lines.push(`Vilkårsutgave: ${edition}`);
    return preparePdf(new File([insurancePdf(lines)], `syntetisk-${index + 1}.pdf`, { type: 'application/pdf' }));
  }));
  const result = await analyzePdfBatches({
    sides: [{ side: 'existing', files }],
    controller: new AbortController(),
    telemetry: createAnalysisTelemetry('syntetiske-tryg-medlemsavtaler'),
    emit: () => {},
    extract: async batch => {
      const insurances = batch.documents.map((document, index) => {
        assert.match(document.text, new RegExp(`Syntetisk forsikringsbevis ${document.documentIndex + 1}`));
        const { product, agreementScope, edition, name, documentRole, importantTerms, agreementPeriod, company } = cases[document.documentIndex];
        if (edition) assert.ok(document.text.includes(`Vilkårsutgave: ${edition}`));
        return {
          company: company ?? 'Tryg', type: product.insuranceType, productName: name ?? product.name,
          canonicalProductName: name ?? product.name, agreementScope, documentRole: documentRole ?? 'individual_agreement',
          agreementPeriod: agreementPeriod ?? null, objectIdentifiers: [], documentIndices: [index + 1],
          annualPremium: null, deductible: null, coverageSummary: null,
          importantTerms: (importantTerms ?? []).map(term => ({ ...term, canonicalKey: null, documentIndices: [index + 1] })),
          addOns: [],
        };
      });
      return parseExtractionResponse({ output_text: JSON.stringify({
        company: 'Tryg', totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear', insurances,
      }) });
    },
  });
  assert.deepEqual(result.failures, []);
  assert.equal(result.successfulDocuments, cases.length);
  const merged = mergeBatchResults(result.results, 'existing', result.partialSuccess);
  const customers = cases.flatMap((item, index) => item.documentRole === 'general_terms' ? [] : [index]);
  assert.equal(merged.insuranceData.insurances.length, customers.length);
  if (customers.length !== cases.length) return merged.insuranceData;
  return customers.map(documentIndex => {
    const record = merged.insuranceData.insurances.find(insurance =>
      insurance.documentReferences.some(reference => reference.documentIndex === documentIndex));
    assert.ok(record, `PDF ${documentIndex + 1} mangler i resultatet`);
    return record;
  });
}

test('syntetiske PDF-er knytter riktig Tryg-produkt til hver medlemsavtale', async () => {
  const cases = scopes.flatMap(agreementScope => {
    const types = agreementScope === 'nito' ? namedTypes : ['Bil', 'Reise', 'Innbo', 'Hus'];
    return types.map(insuranceType => {
      const product = productsFor(agreementScope, insuranceType).find(product => product.version);
      assert.ok(product, `Mangler verifisert vilkårsutgave for ${agreementScope}: ${insuranceType}`);
      return { product, agreementScope, edition: product.version };
    });
  });
  const results = await runPdfCases(cases);
  for (const [index, { product, agreementScope }] of cases.entries()) {
    const result = results[index];
    assert.equal(normalizeInsuranceType(result.type), normalizeInsuranceType(product.insuranceType));
    assert.equal(result.agreementScope, agreementScope);
    assert.equal(result.catalogReference?.productId, product.productId);
    assert.equal(result.catalogReference?.version, product.version);
    assert.ok(result.catalogFacts?.length, `Mangler katalogfakta for ${product.productId}`);
    assert.ok(result.catalogFacts.every(fact => fact.source.agreementScope === agreementScope));
  }
});

test('syntetiske PDF-er uten dokumentert avtale eller vilkårsutgave forblir dokumentbaserte', async () => {
  const product = trygMemberProducts.find(product => product.agreementScope === 'nito' && product.version);
  assert.ok(product, 'minst ett NITO-produkt har verifisert vilkårsutgave');
  const accident = productsFor('nito', 'Ulykke')[0];
  assert.ok(accident);
  const annualEdition = trygMemberProducts.find(product => product.agreementScope === 'utdanningsforbundet' &&
    product.version && /^\d{4}$/u.test(product.version));
  assert.ok(annualEdition, 'minst én Utdanningsforbundet-utgave identifiseres bare med årstall');
  const unversioned = trygMemberProducts.find(product => product.productId === 'tryg-nito-behandling-enkel');
  assert.equal(unversioned.version, null, 'produktarkets dato er ikke en vilkårsutgave');
  const cases = [
    { product, agreementScope: null, edition: product.version },
    { product, agreementScope: 'nito' },
    { product, agreementScope: 'nito', edition: '2000-01-01' },
    { product, agreementScope: 'nito', edition: product.version.slice(0, 4) },
    { product, agreementScope: 'utdanningsforbundet', edition: product.version },
    { product: accident, agreementScope: null, edition: accident.version },
    { product: annualEdition, agreementScope: 'utdanningsforbundet', edition: `${annualEdition.version}-01-01` },
    { product: unversioned, agreementScope: unversioned.agreementScope },
    { product: unversioned, agreementScope: unversioned.agreementScope, edition: '2026-09-01' },
  ];
  const results = await runPdfCases(cases);
  for (const result of results) {
    assert.equal(result.catalogReference, null);
    assert.ok(!result.catalogFacts?.length);
  }
});

test('ordinær Tryg-PDF beholder vanlig vilkårskatalog når ordinær avtale er oppgitt', async () => {
  const product = findCatalogProductBySelection('Tryg', 'Bil', 'Kasko', 'ordinary');
  assert.ok(product);
  const cases = [
    { product, agreementScope: 'ordinary' },
    { product, agreementScope: null },
  ];
  const [known, unknown] = await runPdfCases(cases);
  assert.equal(known.catalogReference?.productId, product.productId);
  assert.ok(known.catalogFacts.length > 0);
  assert.equal(unknown.catalogReference, null);
});

test('utleietillegget bidrar med vilkår bare etter eksplisitt valg under riktig avtale', () => {
  const date = new Date('2026-11-14T12:00:00Z');
  for (const agreementScope of scopes) {
    const house = productsFor(agreementScope, 'Hus')[0];
    const options = availableAddOns(house, date);
    const rental = options.find(addOn => addOn.id === `tryg-${agreementScope}-hus-utleie`);
    assert.ok(rental, agreementScope);
    assert.ok(options.every(addOn => addOn.agreementScope === agreementScope));
    assert.ok(!resolveCatalogFacts(house, [], date).some(fact => fact.source.documentId === rental.componentId));
    const rentalFacts = resolveCatalogFacts(house, [rental.id], date).filter(fact => fact.source.documentId === rental.componentId);
    assert.ok(rentalFacts.length);
    assert.ok(rentalFacts.every(fact => fact.source.agreementScope === agreementScope));
  }
});

test('utgående NITO-studentavtaler har kildebelegg fram til overgangsdatoen', () => {
  const students = productsFor('nito', 'Studentforsikring').filter(product => product.productId.endsWith('-legacy'));
  assert.equal(students.length, 2);
  for (const product of students) {
    assert.equal(findCatalogProductBySelection('Tryg', 'Studentforsikring', product.name, 'nito'), product);
    assert.ok(resolveCatalogFacts(product, [], new Date('2026-12-31')).length);
    assert.deepEqual(resolveCatalogFacts(product, [], new Date('2027-01-01')), []);
  }
});

test('PDF-matching bruker publiserte produktnavn og vilkårsoverskrifter i riktig medlemsavtale', async () => {
  const kasko = productsFor('nito', 'Bil').find(product => product.productId === 'tryg-nito-bil-kasko');
  const house = productsFor('nito', 'Hus').find(product => product.productId === 'tryg-nito-hus');
  const innbo = productsFor('utdanningsforbundet', 'Innbo')[0];
  const cases = [
    { product: kasko, agreementScope: 'nito', name: 'KASKO', company: 'Tryg Forsikring A/S',
      heading: ['Vilkår PAU25205 gjelder fra 01.07.2026. Avløser vilkår av 01.01.2026.'] },
    { product: house, agreementScope: 'nito', name: 'NITO BYGNING',
      heading: ['Vilkår PPK11507 gjelder fra 01.01.2026. Avløser vilkår av 01.07.2025.'] },
    { product: innbo, agreementScope: 'utdanningsforbundet', name: 'Innboforsikring',
      heading: ['Bevis og vilkår', '2026'] },
    { product: kasko, agreementScope: 'nito', name: 'KASKO', heading: ['Vilkår PAU25945 gjelder fra 01.07.2026.'] },
  ];
  const results = await runPdfCases(cases);
  for (let i = 0; i < 3; i++) {
    assert.equal(results[i].catalogReference?.productId, cases[i].product.productId);
    assert.equal(results[i].catalogReference?.version, cases[i].product.version);
  }
  assert.equal(results[3].catalogReference, null);
  assert.equal(findCatalogProductBySelection('Tryg', 'Bil', 'KASKO', null), null);
  assert.equal(findCatalogProductBySelection('Tryg', 'Hus', 'NITO BYGNING', 'utdanningsforbundet'), null);
});

test('medlemsvilkår må ha samme selvstendig dokumenterte utgave som forsikringsbeviset', async () => {
  const product = productsFor('nito', 'Bil').find(product => product.productId === 'tryg-nito-bil-kasko');
  const individual = { product, agreementScope: 'nito', edition: product.version, name: 'Kasko' };
  const support = { product, agreementScope: 'nito', name: product.name, documentRole: 'general_terms' };
  const result = await runPdfCases([
    individual,
    { ...support, edition: '2025-01-01', importantTerms: [{ name: 'Tidligere vilkårseksempel', value: '75 dager' }] },
    { ...support, edition: '2027-01-01', importantTerms: [{ name: 'Senere vilkårseksempel', value: '85 dager' }] },
    { ...support, importantTerms: [{ name: 'Udatert vilkårseksempel', value: '95 dager' }] },
    { ...support, heading: ['Vilkår PAU25205 gjelder fra 01.07.2026.'], importantTerms: [{ name: 'Gjeldende vilkårseksempel', value: '65 dager' }] },
  ]);
  const [customer] = result.insurances;
  assert.equal(customer.catalogReference?.version, product.version);
  const values = customer.importantTerms.map(term => term.value);
  assert.ok(values.includes('65 dager'));
  assert.ok(['75 dager', '85 dager', '95 dager'].every(value => !values.includes(value)));
  assert.equal(result.supportingEvidence.length, 4);
  assert.equal(customer.recordEvidence.filter(record => record.documentRole === 'general_terms').length, 1);
});

test('årsmerkede medlemsvilkår brukes tidligst i det trykte vilkårsåret', () => {
  const product = productsFor('utdanningsforbundet', 'Innbo')[0];
  assert.equal(product.version, '2026');
  assert.deepEqual(resolveCatalogFacts(product, [], new Date('2025-12-31')), []);
  assert.ok(resolveCatalogFacts(product, [], new Date('2026-01-01')).length > 0);
});


test('Utdanningsforbundets Delkasko beholder januar- og juliutgaven hver for seg', async () => {
  const agreementScope = 'utdanningsforbundet';
  const name = 'Delkasko';
  const delkasko = productsFor(agreementScope, 'Bil').filter(product =>
    product.productId === 'tryg-utdanningsforbundet-bil-delkasko');
  assert.deepEqual(delkasko.map(product => product.version).sort(), ['2026-01-01', '2026-07-01']);
  assert.equal(findCatalogProductBySelection('Tryg', 'Bil', name, agreementScope, productCatalog, undefined, new Date('2026-11-21T12:00:00Z'))?.version, '2026-07-01');
  assert.equal(findCatalogProductBySelection('Tryg', 'Bil', name, agreementScope, productCatalog, undefined, new Date('2026-03-01T12:00:00Z'))?.version, '2026-01-01');
  assert.equal(findCatalogProductBySelection('Tryg', 'Bil', name, agreementScope, productCatalog, '2026-01-01')?.version, '2026-01-01');
  const cases = delkasko.map(product => {
    const start = product.version === '2026-01-01' ? '01.01.2026' : '01.07.2026';
    return {
      product, name, agreementScope,
      heading: ['Vilkår PAU25945 gjelder fra ' + start + '.'],
      agreementPeriod: { from: product.version, to: null },
    };
  });
  const results = await runPdfCases(cases);
  for (const [index, { product }] of cases.entries()) {
    const result = results[index];
    assert.equal(result.catalogReference?.version, product.version);
    assert.ok(result.catalogFacts.length > 0);
    assert.ok(result.catalogFacts.every(fact => fact.source.version === product.version));
  }
});


test('motstridende medlemsutgave og avtaleperiode bevarer dokumentopplysningene uten katalogkobling', async () => {
  const agreementScope = 'utdanningsforbundet';
  const delkasko = productsFor(agreementScope, 'Bil').filter(product =>
    product.productId === 'tryg-utdanningsforbundet-bil-delkasko');
  const cases = [
    { product: delkasko.find(product => product.version === '2026-07-01'), from: '2026-04-01' },
    { product: delkasko.find(product => product.version === '2026-01-01'), from: '2026-07-01' },
  ].map(({ product, from }) => ({
    product, agreementScope, edition: product.version, agreementPeriod: { from, to: null },
    importantTerms: [{ name: 'Syntetisk merknad', value: '45 dager' }],
  }));
  const results = await runPdfCases(cases);
  for (const result of results) {
    assert.equal(result.catalogReference, null);
    assert.ok(!result.catalogFacts?.length);
    assert.ok(result.importantTerms.some(term => term.value === '45 dager'));
  }
});


test('en vilkårsoverskrift kan ikke få sin verdi fra en annen PDF-side', () => {
  assert.equal(hasDocumentCatalogVersion('Bevis og vilkår\r\n2026', '2026'), true);
  assert.equal(hasDocumentCatalogVersion('Bevis og vilkår\n\n2026', '2026'), false);
  assert.equal(hasDocumentCatalogVersion('Vilkårsutgave\n2026-01-01', '2026-01-01'), true);
  assert.equal(hasDocumentCatalogVersion('Vilkårsutgave\n\n2026-01-01', '2026-01-01'), false);
});
