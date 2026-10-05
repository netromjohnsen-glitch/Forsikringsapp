import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { canonicalCoverage, coverageStatusFromText } from '../lib/coverage-status.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { product, facts, fact, documentPriority, sourceHash, date } from './helpers/wave3-catalog-gate.mjs';

// B-072 / RC-048 / SCRC-059: ordinary Fremtind Katt, own frozen sources.
// Explicit three-root authority adds only two existing locator corrections
// and the reviewed complete negative rehabilitation declaration.
const id = 'sparebank1-fremtind-katt-veterin-r';
const lifeId = 'sparebank1-fremtind-katt-liv';
const vetSource = 'boat-pet:sparebank1-fremtind:katt';
const lifeSource = `${vetSource}:life`;
const pageSource = `${vetSource}:product`;
const rehabKey = 'dyr.rehabilitering.dekning';
const rehabText = 'Ikke dekket. Veterinærutgifter Katt omfatter ikke fysioterapi, rehabilitering, kiropraktikk eller alternativ behandling.';
const sourceDefinitions = [
  [vetSource, 'catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf', '91385b8b466923a5ca1c37d8f53781c5af3f63e3f6e037afae367f4399b75286', 'PBK-231.300-002'],
  [lifeSource, 'catalog/sources/boat-pet/fremtind-cat-life-terms.pdf', '9b9b295ff51687c8361c1e2fb8fc192fb26fbc0112d5e78b4e569b9d6c4c27ac', 'PBK-231.310-002'],
  [pageSource, 'catalog/sources/boat-pet/fremtind-sb1-cat-product.html', '5b962b11a638938059382c92afd678406585edc9c97b74de7f659286441d217b', 'Katteforsikring – produktoversikt'],
];
const bindings = [
  ['c14f16d5f2c54bc4', 'GAP-5611', 'SF-7958', id, ['dyr.veterinar.dekning', 'dyr.medisin.dekning']],
  ['e1aaf36beb7865b2', 'GAP-5617', 'SF-7965', id, [rehabKey, 'dyr.veterinar.begrensning']],
  ['c5a5b1479b343ceb', 'GAP-5619', 'SF-7967', id, ['dyr.veterinar.egenandel.fast', 'dyr.veterinar.egenandel.prosent', 'dyr.veterinar.egenandel.periode']],
  ['aa0a2321b859ba06', 'GAP-5622', 'SF-7970', lifeId, ['dyr.liv.dekning']],
  ['d11b00a10ce34cb6', 'GAP-5624', 'SF-7972', lifeId, ['dyr.liv.reduksjon.start', 'dyr.liv.reduksjon.sats', 'dyr.liv.opphor']],
  ['2c5ae7ef5a62b71f', 'GAP-5625', 'SF-7973', lifeId, ['dyr.liv.forsvinning', 'dyr.liv.tyveri']],
  ['64deacae233837b5', 'GAP-5628', 'SF-7976', lifeId, ['dyr.liv.begrensning']],
];
const definitions = {
  'dyr.veterinar.dekning': [1, '7 Veterinærutgifter', [/Nødvendige veterinærutgifter/, /sykdom eller ulykkesskade/, /vaksinasjon eller kastrering\/sterilisering/, /valgt forsikringssum per forsikringsår/]],
  'dyr.medisin.dekning': [1, '7 Veterinærutgifter', [/reseptbelagte medisiner/, /valgt forsikringssum per forsikringsår/]],
  [rehabKey]: [2, '7 Veterinærutgifter – Kostnader til', [/^Ikke dekket\./, /fysioterapi, rehabilitering, kiropraktikk eller alternativ behandling/]],
  'dyr.veterinar.begrensning': [2, '7 Veterinærutgifter – kostnader', [/transport, reiseutgifter og hjemmebesøk/, /gebyrer, attester, salgsartikler, kosttilskudd eller fôr selv om anbefalt av veterinær/, /forebyggende undersøkelser eller behandlinger dekkes ikke/]],
  'dyr.veterinar.egenandel.fast': [2, '8 Erstatningsregler', [/^Valg mellom 1 300, 2 000 eller 4 000 kr$/]],
  'dyr.veterinar.egenandel.prosent': [2, '8 Erstatningsregler', [/20 % av resterende veterinærutgifter etter fast egenandel/]],
  'dyr.veterinar.egenandel.periode': [2, '8 Erstatningsregler', [/135 dager fra og med første veterinærutgift/, /kun én fast egenandel i perioden/]],
  'dyr.liv.dekning': [1, 'Død/tap katt – dekker og dekker ikke', [/Valgfri separat dekning for rasekatt/, /ulykke eller sykdom dekket av veterinærforsikringen/, /forsvinning og tyveri/, /Sykdommer\/lidelser og kostnader.*unntatt/, /valgt forsikringssum i kundens forsikringsbevis/]],
  'dyr.liv.reduksjon.start': [1, 'Erstatningsregler', [/hovedforfall etter at katten har fylt 7 år/]],
  'dyr.liv.reduksjon.sats': [1, 'Erstatningsregler', [/20 % per år av den totale erstatningen/, /forsikringssummen blir ikke satt lavere enn 1 500 kr/]],
  'dyr.liv.opphor': [1, 'Opphør av forsikringen', [/Død, tyveri og forsvinning/, /hovedforfall etter at katten har fylt 12 år/]],
  'dyr.liv.forsvinning': [1, 'Erstatningsregler – forsvinning og tyveri', [/Inkludert når Liv er valgt/, /politiet og etterlyses ved annonsering/, /tidligst 3 måneder etter at hendelsen er meldt til oss og politiet/]],
  'dyr.liv.tyveri': [1, 'Erstatningsregler – forsvinning og tyveri', [/Inkludert når Liv er valgt/, /politiet og etterlyses ved annonsering/, /tidligst 3 måneder etter at hendelsen er meldt til oss og politiet/]],
  'dyr.liv.begrensning': [1, 'SB1matrix/IPID – død/avliving og tap/tyveri', [/død\/avliving og tap\/tyveri gjelder kun rasekatt/]],
};
const policy = (terms = []) => ({
  type: 'Katt', productName: 'Veterinær', agreementScope: 'ordinary',
  annualPremium: null, deductible: null, coverageSummary: null, importantTerms: terms, addOns: [],
});
const documentTerm = (key, value, name = key === rehabKey ? 'Rehabilitering' : 'Liv, død og tap') => ({ name, canonicalKey: key, value });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Fremtind', totalAnnualPremium: null, insurances: [policy(terms)] }, date).insurances[0];
const coverage = (insurance, key = rehabKey) => {
  const result = canonicalCoverage(insurance, 'Katt', key);
  assert.ok(result, key);
  return result;
};
const effective = selected => resolveCatalogFacts(product(id), selected ? [lifeId] : [], date);
const jsonShape = value => JSON.parse(JSON.stringify(value));

for (const [sourceId, file, hash, termsNumber] of sourceDefinitions) test(`R-072-SOURCE-${sourceId}: exact frozen identity/hash`, () => {
  sourceHash(file, hash);
  const source = productCatalog.sources[sourceId];
  assert.equal(source.sha256, hash);
  assert.equal(source.providerId, 'sparebank1-fremtind');
  assert.equal(source.company, 'Fremtind');
  assert.equal(source.insuranceType, 'Katt');
  assert.equal(source.agreementScope, 'ordinary');
  assert.equal(source.termsNumber, termsNumber);
  assert.equal(source.url, 'https://www.sparebank1.no/nb/bank/privat/forsikring/katteforsikring.html');
  assert.equal(source.sourceType, sourceId === pageSource ? 'product_page' : 'full_terms');
  assert.equal(source.effectiveFrom, sourceId === pageSource ? '' : '2025-08-07');
  assert.equal(source.version, sourceId === pageSource ? '' : '2025-08-07');
});

test('R-072-SOURCE-CONTEXT: exact complete source clauses and original seven binding owners', async () => {
  const batch = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json', import.meta.url))).batches.find(b => b.batch_id === 'B-072');
  assert.deepEqual(batch.signature_ids.sort(), bindings.map(b => b[0]).sort());
  assert.deepEqual(batch.P2_piggyback_signatures, []);
  assert.deepEqual(batch.evidence.flatMap(e => e.finding_ids.map((gap, i) => [gap, e.source_fact_ids[i]])).sort(), bindings.map(b => [b[1], b[2]]).sort());
  PDFParse.setWorker(getPath());
  for (const file of [sourceDefinitions[0][1], sourceDefinitions[1][1]]) {
    const parser = new PDFParse({ data: readFileSync(new URL('../' + file, import.meta.url)) });
    try {
      const pdf = await parser.getText();
      const page = n => pdf.pages[n - 1].text.replace(/\s+/gu, ' ');
      if (file.includes('-vet-')) {
        assert.equal(pdf.pages.length, 2);
        assert.match(page(1), /MR\/CT \(samlet\) begrenset til 15 000 kroner per forsikringsår/);
        assert.match(page(1), /Dekker ikke/);
        assert.match(page(2), /fysioterapi\/rehabilitering, kiropraktikk og alternativ behandling/);
        assert.match(page(2), /fra og med første veterinærutgift/);
        assert.match(page(2), /kun én egenandel på 1 300, 2 000 eller 4 000 kroner/);
        assert.match(page(2), /20% av resterende veterinærutgifter/);
      } else {
        assert.equal(pdf.pages.length, 1);
        assert.match(page(1), /20 prosent per år.*totale erstatningen/);
        assert.match(page(1), /hovedforfall etter at katten har fylt 7/);
        assert.match(page(1), /Forsikringssummen blir ikke satt lavere enn 1 500/);
        assert.match(page(1), /hovedforfall etter katten har fylt 12/);
        assert.match(page(1), /meldes til politiet og etterlyses ved annonsering/);
        assert.match(page(1), /tidligst 3 måneder etter at hendelsen er meldt til oss og politiet/);
      }
    } finally { await parser.destroy(); }
  }
  const html = readFileSync(new URL('../' + sourceDefinitions[2][1], import.meta.url), 'utf8');
  assert.ok(html.includes('Dekkes kun for rasekatt'));
});

for (const [signature, gap, sf, owner, keys] of bindings) test(`R-072-${signature}: ${gap}/${sf} complete dimensions and provenance`, () => {
  assert.equal(product(id).version, '2025-08-07');
  assert.equal(product(id).company, 'Fremtind');
  for (const key of keys) {
    const rows = productCatalog.facts[owner].filter(f => f.key === key);
    assert.equal(rows.length, 1, owner + '/' + key);
    const f = rows[0];
    const [page, section, patterns] = definitions[key];
    for (const pattern of patterns) assert.match(f.value, pattern);
    const expectedSource = key === 'dyr.liv.begrensning' ? pageSource : owner === id ? vetSource : lifeSource;
    assert.equal(f.source.documentId, expectedSource);
    assert.equal(f.source.page, page);
    assert.equal(f.source.section, section);
    assert.equal(f.source.company, 'Fremtind');
    assert.equal(f.source.agreementScope, 'ordinary');
    assert.equal(f.source.version, expectedSource === pageSource ? '' : '2025-08-07');
    assert.equal(f.coverageAvailability, undefined);
    assert.equal(f.replacesBase, undefined);
  }
});

test('PC-2196: customer-chosen annual sum remains unknown, not a universal menu maximum', () => {
  assert.equal(fact(id, 'dyr.veterinar.sum.valgbar').value, 'Valgt forsikringssum gjelder per forsikringsår');
  const customer = enrich([]);
  assert.equal(customer.annualPremium, null);
  assert.equal(customer.deductible, null);
  assert.ok(facts(id).every(f => !/^premie\./u.test(f.key)));
  assert.deepEqual(customer.addOnIds, []);
});

test('PC-2197: MR/CT combined annual value unchanged, exact physical page 1 §7', () => {
  const f = fact(id, 'dyr.diagnostikk.grense');
  assert.equal(f.value, 'MR/CT samlet inntil 15 000 kr per forsikringsår');
  assert.equal(f.source.page, 1);
  assert.equal(f.source.section, 'Veterinærutgifter');
  assert.equal(f.source.documentId, vetSource);
});

test('PC-2198: LOfavør pricing/home/travel context never becomes ordinary veterinarian coverage', () => {
  const html = readFileSync(new URL('../' + sourceDefinitions[2][1], import.meta.url), 'utf8');
  assert.ok(html.includes('LOfavør') && html.includes('5 %'));
  for (const f of effective(true)) {
    assert.doesNotMatch(f.key, /^(?:premie|innbo|reise)\./u);
    assert.doesNotMatch(f.value, /LOfavør|medlemsrabatt/iu);
  }
});

test('R-072-FIXED: only locator changes; fixed values and reference classification preserved', () => {
  const f = fact(id, 'dyr.veterinar.egenandel.fast');
  assert.equal(f.value, 'Valg mellom 1 300, 2 000 eller 4 000 kr');
  assert.equal(f.deductibleClassification, 'reference');
  assert.equal(f.source.page, 2);
  assert.equal(f.source.section, '8 Erstatningsregler');
  assert.equal(f.label, 'Veterinærbehandling – fast egenandel');
  assert.equal(enrich([]).deductible, null);
});

test('R-072-REHAB: complete source negative works without new parser/availability flags', () => {
  assert.equal(fact(id, rehabKey).value, rehabText);
  assert.equal(coverageStatusFromText(rehabText), 'not_selected');
  assert.equal(materializeCatalogProduct(product(id)).facts.find(f => f.key === rehabKey).state, 'unavailable');
  assert.ok(availableAddOns(product(id), date).every(a => a.id === lifeId));
  assert.deepEqual(effective(false).filter(f => f.key === rehabKey), effective(true).filter(f => f.key === rehabKey));
  const raw = fact(id, rehabKey);
  assert.deepEqual(Object.keys(raw).sort(), ['key', 'label', 'source', 'value']);
});

for (const rehab of ['silent', 'unknown', 'refused', 'selected', 'conflict']) {
  for (const life of ['none', 'selected', 'refused']) test(`R-072-CUSTOMER-${rehab}-${life}: document priority and independent Liv`, () => {
    const terms = [];
    if (rehab === 'unknown') terms.push(documentTerm(rehabKey, 'Ikke dokumentert'));
    if (rehab === 'refused' || rehab === 'conflict') terms.push(documentTerm(rehabKey, 'Ikke valgt'));
    if (rehab === 'selected' || rehab === 'conflict') terms.push(documentTerm(rehabKey, 'Valgt'));
    if (life !== 'none') terms.push(documentTerm('dyr.liv.dekning', life === 'selected' ? 'Valgt' : 'Ikke valgt'));
    const customer = enrich(terms);
    assert.equal(coverage(customer).status, rehab === 'selected' ? 'selected' : rehab === 'conflict' ? 'unknown' : 'not_selected');
    assert.equal(coverage(customer).conflict, rehab === 'conflict');
    assert.equal(customer.addOnIds.includes(lifeId), life === 'selected');
    assert.equal(coverage(customer, 'dyr.liv.dekning').status, life === 'selected' ? 'selected' : life === 'refused' ? 'not_selected' : 'unknown');
    if (rehab === 'selected' || rehab === 'refused') assert.equal(customer.importantTerms.find(t => t.key === rehabKey).coverageOrigin, 'document');
  });
}

test('R-072-UNCONFIRMED: catalog definition does not assert a confirmed customer negative', () => {
  const f = fact(id, rehabKey);
  const insurance = { ...policy([{ name: f.label, key: f.key, value: f.value, coverageOrigin: 'catalog', source: f.source }]), catalogSelectionConfirmed: false };
  assert.equal(coverage(insurance).status, 'unknown');
  assert.equal(coverage(insurance).evidence[0].kind, 'catalog_definition');
});

test('R-072-LIV-GUARD: supporting age and pedigree conditions alone never choose Liv', () => {
  for (const key of ['dyr.liv.reduksjon.start', 'dyr.liv.reduksjon.sats', 'dyr.liv.opphor', 'dyr.liv.begrensning']) {
    const f = productCatalog.facts[lifeId].find(f => f.key === key);
    const customer = enrich([documentTerm(key, f.value, f.label)]);
    assert.deepEqual(customer.addOnIds, []);
    assert.equal(coverage(customer, 'dyr.liv.dekning').status, 'unknown');
    assert.equal(coverage(customer).status, 'not_selected');
  }
});

test('R-072-QUALIFICATION: own Life primary and pedigree product-page source survive conversion', () => {
  const f = effective(true).find(f => f.key === 'dyr.liv.dekning');
  assert.equal(f.source.documentId, lifeSource);
  assert.equal(f.qualificationSource.documentId, pageSource);
  assert.equal(f.qualificationSource.effectiveFrom, '');
  const customer = enrich([documentTerm('dyr.liv.dekning', 'Valgt')]);
  const qualification = customer.importantTerms.find(t => t.key === 'dyr.liv.begrensning');
  assert.equal(qualification.source.documentId, pageSource);
  assert.match(qualification.value, /kun rasekatt/);
  assert.equal(coverage(customer, 'dyr.liv.dekning').status, 'selected');
});

for (const selected of [false, true]) test(`R-072-MANUAL-${selected}: negative rehabilitation and complete sources/JSON`, () => {
  const customer = normalizeManualAgreement({ company: 'Fremtind', totalAnnualPremium: '', products: [{ type: 'Katt', productName: 'Veterinær', agreementScope: 'ordinary', annualPremium: '', deductible: '', coverageSummary: '', importantTerms: [], addOnIds: selected ? [lifeId] : [] }] }).insuranceData.insurances[0];
  assert.equal(coverage(customer).status, 'not_selected');
  assert.equal(coverage(customer, 'dyr.liv.dekning').status, selected ? 'selected' : 'unknown');
  for (const f of effective(selected)) {
    const term = customer.importantTerms.find(t => t.key === f.key);
    assert.ok(term, f.key);
    assert.equal(term.value, f.value);
    assert.ok(term.sources.some(s => s.documentId === f.source.documentId && s.page === f.source.page && s.section === f.source.section));
    if (f.qualificationSource) assert.ok(term.sources.some(s => s.documentId === f.qualificationSource.documentId && s.page === f.qualificationSource.page && s.section === f.qualificationSource.section));
  }
  const serialized = jsonShape(customer);
  assert.equal(coverage(serialized).status, 'not_selected');
  assert.deepEqual(serialized.addOnIds, customer.addOnIds);
});

for (const peer of productCatalog.products.filter(p => p.insuranceType === 'Katt')) test(`R-072-COMPARE-${peer.productId}: same product/both directions and optional ≠ selected`, () => {
  const forward = compareCatalogProducts(product(id), peer).sections.flatMap(s => s.rows);
  const reverse = compareCatalogProducts(peer, product(id)).sections.flatMap(s => s.rows);
  assert.equal(forward.find(r => r.key === rehabKey).first.state, 'unavailable');
  assert.equal(forward.find(r => r.key === 'dyr.liv.dekning').first.state, 'optional');
  for (const row of forward) {
    const swapped = reverse.find(r => r.key === row.key);
    assert.deepEqual(row.first, swapped.second);
    assert.deepEqual(row.second, swapped.first);
    if (peer.productId === id) assert.equal(row.different, false);
  }
});

test('R-072-PRIORITY-ISOLATION: document values win; exact provider/species/scope/version boundaries', () => {
  for (const f of facts(id)) documentPriority(id, f.key, 'Kundens dokumenterte særvilkår');
  const p = product(id);
  for (const [provider, type, scope, version] of [['tryg', 'Katt', 'ordinary', p.version], [p.providerId, 'Hund', 'ordinary', p.version], [p.providerId, 'Katt', 'nito', p.version], [p.providerId, 'Katt', 'ordinary', 'invented']]) assert.equal(findCatalogProduct(provider, id, version, { insuranceType: type, agreementScope: scope }), null);
  assert.ok(effective(false).every(f => !f.key.startsWith('dyr.liv.')));
  assert.ok(productCatalog.facts['sparebank1-fremtind-hund-veterin-r'].every(f => f.key !== rehabKey));
  assert.ok(productCatalog.facts['sparebank1-fremtind-hund-topp'].some(f => f.key === rehabKey));
});
