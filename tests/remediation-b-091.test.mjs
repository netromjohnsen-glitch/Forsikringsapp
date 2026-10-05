import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';
import { getPath } from 'pdf-parse/worker';
import { productCatalog, resolveCatalogFacts, availableAddOns } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { catalogFactSources, enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { boatPetFactLabel } from '../lib/boat-pet-registry.ts';
import { sourceHash } from './helpers/wave3-catalog-gate.mjs';

// B-091: Tryg Katt ordinary; exact reviewed source oracles, not values inferred from implementation.
// The two explicit roots preserve sum primary/qualification roles and first forfall AFTER attained twelve.
const sources = [
  {
    "file": "catalog/sources/boat-pet/tryg-cat-extra-terms.pdf",
    "hash": "f4267143ea6f0643341503cf60ce50ce7036cf83af21b3ec29f514d1a7738972",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-cat-life-terms.pdf",
    "hash": "8024b9853d3ff80259f939418f31f03e332d280bfca612d613390a7699e5eb3c",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf",
    "hash": "fa7297b2b37cab3f8e8d51151643bcd4293fc7fbb0a33f77de86108af16bf9dc",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-dog-product-terms.pdf",
    "hash": "a7936fd27cd305b1a6eeb8153d8289dffff5c075e0e50ffbd9590f8bb2d83318",
    "pages": 1
  },
  {
    "file": "catalog/sources/boat-pet/tryg-pet-ipid.pdf",
    "hash": "41843abc16ad8ee39782e70f29d8cbb115463bcebe28882cca42078ce07fd824",
    "pages": 2
  }
];
const bindings = [
  {
    "signature": "6694fdccb6c7b37d",
    "gap": "GAP-0010",
    "sf": "SF-0016",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.veterinar.egenandel.fast"
    ]
  },
  {
    "signature": "2828771d4baf4ac2",
    "gap": "GAP-0011",
    "sf": "SF-0017",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.veterinar.sum.valgbar"
    ]
  },
  {
    "signature": "e7ae996fe7dc4716",
    "gap": "GAP-0012",
    "sf": "SF-0019",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.diagnostikk.dekning"
    ]
  },
  {
    "signature": "866f73f728048a94",
    "gap": "GAP-0015",
    "sf": "SF-0023",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.veterinaralder.opphor"
    ]
  },
  {
    "signature": "01ac0a38f55c121b",
    "gap": "GAP-0018",
    "sf": "SF-0029",
    "owner": "tryg-katt-dod",
    "keys": [
      "dyr.liv.reduksjon.start",
      "dyr.liv.reduksjon.sats"
    ]
  },
  {
    "signature": "e14fd27a12c11449",
    "gap": "GAP-0019",
    "sf": "SF-0031",
    "owner": "tryg-katt-ekstra",
    "keys": [
      "dyr.tannsykdom.grense"
    ]
  },
  {
    "signature": "aef5e515cfbd157e",
    "gap": "GAP-4369",
    "sf": "SF-6222",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.tannskade.dekning"
    ]
  },
  {
    "signature": "ab0b2da355a320f7",
    "gap": "GAP-4370",
    "sf": "SF-6223",
    "owner": "tryg-katt-behandling",
    "keys": [
      "dyr.fodsel.dekning"
    ]
  },
  {
    "signature": "d4005cb74cd96b23",
    "gap": "GAP-4377",
    "sf": "SF-6230",
    "owner": "tryg-katt-ekstra",
    "keys": [
      "dyr.tannsykdom.begrensning"
    ]
  },
  {
    "signature": "b191f12a403c27ee",
    "gap": "GAP-4379",
    "sf": "SF-6232",
    "owner": "tryg-katt-dod",
    "keys": [
      "dyr.liv.dekning"
    ]
  },
  {
    "signature": "7ea53e9c446fab07",
    "gap": "GAP-4380",
    "sf": "SF-6233",
    "owner": "tryg-katt-dod",
    "keys": [
      "dyr.liv.begrensning"
    ]
  },
  {
    "signature": "58cc53938359edf5",
    "gap": "GAP-4385",
    "sf": "SF-6238",
    "owner": "tryg-katt-dod",
    "keys": [
      "dyr.liv.opphor"
    ]
  }
];
const rows = [
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.veterinar.egenandel.fast",
    "value": "2 500 kr per sykdom og per ulykkestilfelle",
    "source": "boat-pet:tryg:katt:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – Egenandel",
    "deductibleClassification": "coverage"
  },
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.veterinar.sum.valgbar",
    "value": "Kundens valgte forsikringssum fremgår av forsikringsbeviset. Utgifter per sykdom og per ulykkesskade erstattes inntil summen på skadedagen; besøk og utgifter fra samme sykdom eller ulykke regnes som én skade. Samlede utgifter ved flere sykdommer eller ulykkesskader er også begrenset til forsikringssummen per forsikringsår.",
    "source": "boat-pet:tryg:katt:treatment",
    "page": 2,
    "section": "4 Slik beregnes erstatningen",
    "qualificationSource": {
      "source": "boat-pet:tryg:katt:treatment",
      "page": 1,
      "section": "1 HVA FORSIKRINGEN OMFATTER"
    }
  },
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.diagnostikk.dekning",
    "value": "CT og MR rekvirert og ordinert av veterinær ved sykdom eller ulykkesskade i forsikringstiden",
    "source": "boat-pet:tryg:katt:treatment",
    "page": 1,
    "section": "2–3 Tilfeller og utgifter"
  },
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.veterinaralder.opphor",
    "value": "Katt Behandling og Katt Ekstra kan beholdes hele dyrets levetid",
    "source": "boat-pet:tryg:katt:product",
    "page": 1,
    "section": "4 Når forsikringen gjelder"
  },
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.tannskade.dekning",
    "value": "Trekking av ulykkesskadde tenner ved tannfraktur dekkes. Annen behandling av tannskade og behandling av tann- og tannkjøttsykdommer er unntatt fra Katt Behandling.",
    "source": "boat-pet:tryg:katt:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – tannfraktur og unntak"
  },
  {
    "owner": "tryg-katt-behandling",
    "key": "dyr.fodsel.dekning",
    "value": "Fødselshjelp uavhengig av årsak når veterinær har bekreftet at kattens liv er i fare",
    "source": "boat-pet:tryg:katt:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – fødselshjelp"
  },
  {
    "owner": "tryg-katt-ekstra",
    "key": "dyr.tannsykdom.grense",
    "value": "30 000 kr per sykdom og per ulykkesskade, og maksimalt 30 000 kr samlet per forsikringsår. Innenfor denne tannrammen er behandling av tannresorpsjon begrenset til 5 000 kr per forsikringsår.",
    "source": "boat-pet:tryg:katt:extra",
    "page": 1,
    "section": "2 Tann- og tannkjøttsykdommer"
  },
  {
    "owner": "tryg-katt-ekstra",
    "key": "dyr.tannsykdom.begrensning",
    "value": "Fjerning av tannstein erstattes kun ved påvist periodontitt. Trekking av tilbakeholdte melketenner eller behandling av tannstillingsfeil som medfører medisinske problemer krever sammenhengende forsikring med dekning for dette i Tryg eller annet selskap fra før 4 måneders alder.",
    "source": "boat-pet:tryg:katt:extra",
    "page": 1,
    "section": "2 Tann- og tannkjøttsykdommer"
  },
  {
    "owner": "tryg-katt-dod",
    "key": "dyr.liv.dekning",
    "value": "Valgfri separat dekning for rasekatten i forsikringsbeviset: død eller avliving som følge av sykdom eller ulykkesskade, samt katt som blir borte eller bortført. Avliving må være nødvendig av dyrevernmessige hensyn og anbefalt av veterinær; avliving dekkes ikke dersom alternativ behandling eller medisin gir god prognose. Valgt forsikringssum fremgår av beviset og er begrenset til gjenanskaffelsespris for tilsvarende katt av samme rase.",
    "source": "boat-pet:tryg:katt:life",
    "page": 1,
    "section": "1–3 Rasekatt død – omfang, utløsere og erstatning"
  },
  {
    "owner": "tryg-katt-dod",
    "key": "dyr.liv.begrensning",
    "value": "Død eller avliving som følge av hofteleddsdysplasi (HD) eller Calvé-Legg-Perthes krever sammenhengende forsikring med dekning for dette i Tryg eller annet selskap fra før 4 måneders alder.",
    "source": "boat-pet:tryg:katt:life",
    "page": 1,
    "section": "2 Tilleggsbestemmelser – død og avlivning"
  },
  {
    "owner": "tryg-katt-dod",
    "key": "dyr.liv.reduksjon.start",
    "value": "Fra katten er blitt 7 år",
    "source": "boat-pet:tryg:katt:life",
    "page": 1,
    "section": "3 Slik beregnes erstatningen"
  },
  {
    "owner": "tryg-katt-dod",
    "key": "dyr.liv.reduksjon.sats",
    "value": "Erstatningen reduseres med 20 % per år i aldersfradrag; minste erstatning etter aldersfradrag er 40 % av forsikringssummen.",
    "source": "boat-pet:tryg:katt:life",
    "page": 1,
    "section": "3 Slik beregnes erstatningen",
    "qualificationSource": {
      "source": "boat-pet:tryg:katt:life",
      "page": 2,
      "section": "3 Slik beregnes erstatningen – minste erstatning"
    }
  },
  {
    "owner": "tryg-katt-dod",
    "key": "dyr.liv.opphor",
    "value": "Rasekatt død opphører ved første forfall etter at katten har oppnådd maksimal alder på 12 år.",
    "source": "boat-pet:tryg:katt:product",
    "page": 1,
    "section": "4 Når forsikringen gjelder – maksimal alder og første forfall"
  }
];
const quotes = {
  "dyr.veterinar.egenandel.fast": [
    [
      1,
      "Det trekkes en egenandel på 2.500 kroner per sykdom og per ulykkestilfelle."
    ]
  ],
  "dyr.veterinar.sum.valgbar": [
    [
      1,
      "Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder."
    ],
    [
      2,
      "Utgifter per sykdom og per ulykkesskade erstattes opp til den forsikringssummen som gjelder på skadedagen."
    ],
    [
      2,
      "Veterinærbesøk og utgifter som skyldes samme sykdom eller ulykke, anses som én og samme skade."
    ],
    [
      2,
      "Ved flere sykdommer og/eller ulykkesskader innenfor samme forsikringsår, erstattes samlede utgifter opp til forsikringssummen."
    ]
  ],
  "dyr.diagnostikk.dekning": [
    [
      1,
      "Forsikringen dekker sykdom og ulykkesskade som inntreffer i forsikringstiden."
    ],
    [
      1,
      "undersøkelse og behandling hos veterinær, inkludert CT og MR"
    ],
    [
      1,
      "CT, MR, medisin, legemidler, spesialsjampo og spesialfor må være rekvirert og ordinert av veterinær."
    ]
  ],
  "dyr.veterinaralder.opphor": [
    [
      1,
      "Dekningene Hund behandling, Hund Ekstra, Katt behandling og Katt Ekstra kan beholdes hele dyrets levetid"
    ]
  ],
  "dyr.tannskade.dekning": [
    [
      1,
      "Trekking av ulykkesskadde tenner dekkes ved tannfraktur."
    ],
    [
      1,
      "behandling av tann- og tannkjøttsykdommer"
    ],
    [
      1,
      "behandling av tannskade. Likevel dekkes trekking av tenner hvor tannfraktur (brudd) er forårsaket av en ulykke"
    ]
  ],
  "dyr.fodsel.dekning": [
    [
      1,
      "I tillegg dekkes utgifter til fødselshjelp uavhengig av årsak."
    ],
    [
      1,
      "Slike utgifter dekkes hvis veterinær har bekreftet at kattens liv er i fare."
    ]
  ],
  "dyr.tannsykdom.grense": [
    [
      1,
      "Erstatningen er begrenset til 30.000 kroner per sykdom og per ulykkesskade og begrenset til maksimalt 30.000 kroner per forsikringsår."
    ],
    [
      1,
      "I tillegg er utgifter til behandling av tannresorpsjon, nedbrytning av tann, begrenset til 5.000 kroner per forsikringsår."
    ]
  ],
  "dyr.tannsykdom.begrensning": [
    [
      1,
      "Fjerning av tannstein erstattes kun når det er påvist periodontitt."
    ],
    [
      1,
      "For dekning av utgifter til trekking av tilbakeholdte melketenner eller behandling av tannstillingsfeil, må katten ha vært forsikret med dekning for dette i Tryg eller annet selskap sammenhengende fra før 4 måneders alder."
    ],
    [
      1,
      "tannstillingsfeil som medfører medisinske problemer."
    ]
  ],
  "dyr.liv.dekning": [
    [
      1,
      "Forsikringen omfatter rasekatten som er nevnt i forsikringsbeviset."
    ],
    [
      1,
      "rasekatt som dør eller blir avlivet som følge av sykdom eller ulykkesskade"
    ],
    [
      1,
      "rasekatt som blir borte eller blir bortført"
    ],
    [
      1,
      "Avlivning må være nødvendig av dyrevernmessige hensyn og anbefalt av veterinær."
    ],
    [
      1,
      "Avlivning dekkes ikke dersom alternativ behandling eller medisin gir god prognose."
    ],
    [
      1,
      "Forsikret katt erstattes med forsikringssummen, inntil gjenanskaffelsespris for tilsvarende katt av samme rase."
    ]
  ],
  "dyr.liv.begrensning": [
    [
      1,
      "For dekning av død eller avlivning som følge av hofteleddsdysplasi (HD) eller Calvé-Legg-Perthes, må katten ha vært forsikret med dekning for dette i Tryg eller annet selskap sammenhengende fra før 4 måneders alder."
    ]
  ],
  "dyr.liv.reduksjon.start": [
    [
      1,
      "Fra katten er blitt 7 år reduseres erstatningen med 20 prosent per år i aldersfradrag."
    ]
  ],
  "dyr.liv.reduksjon.sats": [
    [
      1,
      "Fra katten er blitt 7 år reduseres erstatningen med 20 prosent per år i aldersfradrag."
    ],
    [
      2,
      "Minste erstatning etter aldersfradrag vil være 40 prosent av forsikringssummen."
    ]
  ],
  "dyr.liv.opphor": [
    [
      1,
      "mens dekningene Hund død og Katt død kan beholdes til dyret fyller 12 år."
    ],
    [
      1,
      "Dekninger som opphører på grunn av alder, opphører ved første forfall etter at dyret har oppnådd maksimal alder."
    ]
  ]
};

const id = 'tryg-katt-behandling';
const extraId = 'tryg-katt-ekstra';
const lifeId = 'tryg-katt-dod';
const date = new Date('2026-10-05T12:00:00Z');
const p = productCatalog.products.find(p => p.productId === id);
assert.ok(p);
const clone = x => JSON.parse(JSON.stringify(x));
const raw = (owner, key) => {
  const matches = productCatalog.facts[owner].filter(f => f.key === key);
  assert.equal(matches.length, 1, owner + '/' + key);
  return matches[0];
};
const coverage = (policy, key) => {
  const c = canonicalCoverage(policy, 'Katt', key);
  assert.ok(c, key);
  return c;
};
const term = (key, value) => ({ name: boatPetFactLabel('katt', key), canonicalKey: key, value });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Tryg', totalAnnualPremium: null,
  insurances: [{ type: 'Katt', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: null,
    deductible: null, coverageSummary: null, importantTerms: terms, addOns: [] }] }, date).insurances[0];
const manual = ids => normalizeManualAgreement({ company: 'Tryg', totalAnnualPremium: '', products: [{
  type: 'Katt', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: '', deductible: '',
  coverageSummary: '', importantTerms: [], addOnIds: ids }] }).insuranceData.insurances[0];
const pdfPages = new Map();
const whitespace = x => x.replace(/\s+/gu, ' ').trim();
async function pages(file) {
  if (!pdfPages.has(file)) {
    PDFParse.setWorker(getPath());
    const parser = new PDFParse({ data: readFileSync(new URL('../' + file, import.meta.url)) });
    try { pdfPages.set(file, (await parser.getText()).pages.map(p => whitespace(p.text))); }
    finally { await parser.destroy(); }
  }
  return pdfPages.get(file);
}

for (const source of sources) test(`R-091-SOURCE: ${source.file}`, async () => {
  sourceHash(source.file, source.hash);
  const text = await pages(source.file);
  assert.equal(text.length, source.pages);
});

test('R-091-IDENTITY: original twelve P1 bindings, thirteen distinct owner/key facts', () => {
  assert.equal(bindings.length, 12);
  assert.equal(new Set(bindings.map(b => b.signature)).size, 12);
  assert.equal(new Set(bindings.map(b => b.gap)).size, 12);
  assert.equal(new Set(bindings.map(b => b.sf)).size, 12);
  assert.equal(rows.length, 13);
  assert.equal(new Set(rows.map(r => r.owner + '/' + r.key)).size, 13);
  const batches = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json', import.meta.url)));
  const batch = batches.batches.find(b => b.batch_id === 'B-091');
  assert.ok(batch);
  assert.deepEqual([...batch.signature_ids].sort(), bindings.map(b => b.signature).sort());
  assert.deepEqual(batch.P2_piggyback_signatures, []);
  assert.deepEqual(batch.evidence.flatMap(e => e.finding_ids.map((gap, i) => [gap, e.source_fact_ids[i]])).sort(), bindings.map(b => [b.gap, b.sf]).sort());
  assert.equal(p.providerId, 'tryg'); assert.equal(p.company, 'Tryg');
  assert.equal(p.insuranceType, 'Katt'); assert.equal(p.agreementScope, 'ordinary');
  assert.equal(p.name, 'Behandling'); assert.equal(p.version, '2026-09-01');
  assert.deepEqual(availableAddOns(p, date).map(a => a.id).sort(), [extraId, lifeId].sort());
});

for (const binding of bindings) test(`R-091-${binding.signature}: ${binding.gap}/${binding.sf} full source and catalog contract`, async () => {
  for (const key of binding.keys) {
    const expected = rows.find(r => r.owner === binding.owner && r.key === key);
    assert.ok(expected, key);
    const f = raw(expected.owner, key);
    assert.equal(f.value, expected.value);
    assert.equal(f.key, key); assert.equal(f.label, boatPetFactLabel('katt', key));
    assert.equal(f.source.documentId, expected.source);
    assert.equal(f.source.page, expected.page); assert.equal(f.source.section, expected.section);
    const source = productCatalog.sources[expected.source];
    assert.equal(source.providerId, 'tryg'); assert.equal(source.company, 'Tryg');
    assert.equal(source.insuranceType, 'Katt'); assert.equal(source.agreementScope, 'ordinary');
    assert.equal(source.sourceType, 'full_terms'); assert.equal(f.source.company, 'Tryg');
    assert.equal(f.source.agreementScope, 'ordinary'); assert.equal(f.source.version, source.version);
    assert.equal(f.source.effectiveFrom, source.effectiveFrom);
    assert.equal(f.source.termsNumber, source.termsNumber); assert.equal(f.source.url, source.url);
    assert.equal(f.source.filename, source.filename);
    assert.equal(f.deductibleClassification, expected.deductibleClassification);
    assert.equal(f.coverageAvailability, undefined); assert.equal(f.replacesBase, undefined);
    if (expected.qualificationSource) {
      assert.equal(f.qualificationSource.documentId, expected.qualificationSource.source);
      assert.equal(f.qualificationSource.page, expected.qualificationSource.page);
      assert.equal(f.qualificationSource.section, expected.qualificationSource.section);
    } else assert.equal(f.qualificationSource, undefined);
    const materialized = materializeCatalogProduct(p).facts.find(f => f.key === key);
    assert.ok(materialized, key);
    assert.equal(materialized.state, expected.owner === id ? 'included' : 'optional');
    const text = await pages('catalog/sources/boat-pet/' + source.filename);
    for (const [page, quote] of quotes[key]) assert.ok(text[page - 1].includes(whitespace(quote)), key + '/' + page + ': ' + quote);
  }
});

test('R-091-PROVENANCE: primary/qualification roles remain distinct within the same PDF', () => {
  const sum = raw(id, 'dyr.veterinar.sum.valgbar');
  assert.deepEqual(catalogFactSources(sum).map(s => [s.documentId, s.page, s.section]), [
    ['boat-pet:tryg:katt:treatment', 2, '4 Slik beregnes erstatningen'],
    ['boat-pet:tryg:katt:treatment', 1, '1 HVA FORSIKRINGEN OMFATTER'],
  ]);
  const reduction = raw(lifeId, 'dyr.liv.reduksjon.sats');
  assert.deepEqual(catalogFactSources(reduction).map(s => s.page), [1, 2]);
  assert.equal(productCatalog.sources[sum.source.documentId].effectiveFrom, '2026-07-01');
  assert.equal(productCatalog.sources['boat-pet:tryg:katt:product'].effectiveFrom, '2026-05-10');
  assert.equal(p.version, '2026-09-01');
  assert.match(sum.value, /per sykdom og per ulykkesskade/);
  assert.match(sum.value, /samme sykdom eller ulykke regnes som én skade/);
  assert.match(sum.value, /Samlede utgifter.*per forsikringsår/);
  assert.doesNotMatch(sum.value, /\d+\s*kr/);
});

test('R-091-EXPIRY: cat first forfall after attained twelve; compensation reduction separate', () => {
  assert.equal(raw(lifeId, 'dyr.liv.opphor').value, 'Rasekatt død opphører ved første forfall etter at katten har oppnådd maksimal alder på 12 år.');
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.opphor').value, /hovedforfall|12-årsdagen|kalenderår/);
  assert.equal(raw(lifeId, 'dyr.liv.reduksjon.start').value, 'Fra katten er blitt 7 år');
  assert.match(raw(lifeId, 'dyr.liv.reduksjon.sats').value, /Erstatningen reduseres med 20 % per år.*40 % av forsikringssummen/);
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.reduksjon.sats').value, /50 %|5 000/);
});

for (const rehab of ['silent', 'selected', 'refused']) for (const life of ['silent', 'selected', 'refused']) {
  test(`R-091-CUSTOMER-${rehab}-${life}: independent parent choice and refusal`, () => {
    const terms = [];
    if (rehab !== 'silent') terms.push(term('dyr.rehabilitering.dekning', rehab === 'selected' ? 'Valgt' : 'Ikke valgt'));
    if (life !== 'silent') terms.push(term('dyr.liv.dekning', life === 'selected' ? 'Valgt' : 'Ikke valgt'));
    const customer = enrich(terms);
    assert.equal(coverage(customer, 'dyr.rehabilitering.dekning').status, rehab === 'selected' ? 'selected' : rehab === 'refused' ? 'not_selected' : 'unknown');
    assert.equal(coverage(customer, 'dyr.liv.dekning').status, life === 'selected' ? 'selected' : life === 'refused' ? 'not_selected' : 'unknown');
    assert.deepEqual(customer.addOnIds.sort(), [ ...(rehab === 'selected' ? [extraId] : []), ...(life === 'selected' ? [lifeId] : []) ].sort());
    assert.equal(customer.deductible, null);
  });
}
for (const key of ['dyr.liv.dekning', 'dyr.rehabilitering.dekning']) {
  test(`R-091-CONFLICT-${key}: explicit inconsistent choice remains unknown`, () => {
    const c = enrich([term(key, 'Valgt'), term(key, 'Ikke valgt')]);
    assert.equal(coverage(c, key).status, 'unknown'); assert.equal(coverage(c, key).conflict, true);
    assert.deepEqual(c.addOnIds, []);
  });
  test(`R-091-UNKNOWN-${key}: unknown is not explicit refusal`, () => {
    const c = enrich([term(key, 'Ikke dokumentert')]);
    assert.equal(coverage(c, key).status, 'unknown'); assert.deepEqual(c.addOnIds, []);
  });
}
for (const key of ['dyr.tannsykdom.begrensning', 'dyr.liv.begrensning', 'dyr.liv.reduksjon.start', 'dyr.liv.reduksjon.sats', 'dyr.liv.opphor']) {
  test(`R-091-SUPPORT-${key}: qualification and age rule alone never select the parent`, () => {
    const r = rows.find(r => r.key === key); const c = enrich([term(key, r.value)]);
    assert.deepEqual(c.addOnIds, []);
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
    assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'unknown');
  });
}
test('R-091-EXISTING-POSITIVE-DETAIL: documented dental amount can select only its unique Extra component', () => {
  const c = enrich([term('dyr.tannsykdom.grense', raw(extraId, 'dyr.tannsykdom.grense').value)]);
  assert.deepEqual(c.addOnIds, [extraId]);
  assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'selected');
  assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
});

for (const [key, value] of [['dyr.veterinar.egenandel.fast', '3 000 kr per sykdom og per ulykkestilfelle'], ['dyr.veterinar.sum.valgbar', '40 000 kr per forsikringsår'], ['dyr.liv.reduksjon.start', 'Ukjent'], ['dyr.liv.opphor', 'Ukjent']]) {
  test(`R-091-DOCUMENT-${key}: explicit document overrides catalog without selecting Life`, () => {
    const c = enrich([term(key, value)]); const t = c.importantTerms.find(t => t.key === key);
    assert.ok(t); assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
    assert.deepEqual(c.addOnIds, []); assert.equal(c.deductible, null);
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
  });
}
for (const ids of [[], [extraId], [lifeId], [extraId, lifeId]]) {
  test(`R-091-MANUAL-${ids.join('+') || 'none'}: exact choice, multi-source propagation and JSON`, () => {
    const customer = clone(manual(ids));
    assert.deepEqual(customer.addOnIds.sort(), [...ids].sort());
    assert.equal(coverage(customer, 'dyr.liv.dekning').status, ids.includes(lifeId) ? 'selected' : 'unknown');
    assert.equal(coverage(customer, 'dyr.rehabilitering.dekning').status, ids.includes(extraId) ? 'selected' : 'unknown');
    assert.equal(customer.deductible, null);
    const effective = resolveCatalogFacts(p, ids, date);
    for (const r of rows.filter(r => r.owner === id || ids.includes(r.owner))) {
      const f = effective.find(f => f.key === r.key); assert.ok(f);
      const t = customer.importantTerms.find(t => t.key === r.key); assert.ok(t, r.key);
      assert.equal(t.value, r.value);
      for (const ref of catalogFactSources(f)) assert.ok(t.sources.some(s => s.documentId === ref.documentId && s.page === ref.page && s.section === ref.section), r.key + '/source');
    }
  });
}
for (const peer of productCatalog.products.filter(p => p.insuranceType === 'Katt')) {
  test(`R-091-COMPARISON-${peer.productId}: same product and both directions`, () => {
    const forward = compareCatalogProducts(p, peer).sections.flatMap(s => s.rows);
    const reverse = compareCatalogProducts(peer, p).sections.flatMap(s => s.rows);
    assert.equal(forward.length, reverse.length);
    for (const r of forward) {
      const other = reverse.find(s => s.key === r.key); assert.ok(other);
      assert.deepEqual(r.first, other.second); assert.deepEqual(r.second, other.first);
      if (peer.productId === id) assert.equal(r.different, false);
    }
    for (const r of rows) {
      const comparison = forward.find(f => f.key === r.key); assert.ok(comparison, r.key);
      assert.equal(comparison.first.state, r.owner === id ? 'included' : 'optional');
    }
  });
}

test('R-091-ISOLATION: frozen Cat-specific sources do not become Dog or other provider references', () => {
  const own = new Set([id, extraId, lifeId]);
  for (const [owner, fs] of Object.entries(productCatalog.facts)) for (const f of fs) {
    if (catalogFactSources(f).some(s => ['boat-pet:tryg:katt:treatment', 'boat-pet:tryg:katt:product'].includes(s.documentId))) assert.ok(own.has(owner), owner);
  }
  assert.ok(productCatalog.products.filter(p => p.insuranceType === 'Hund').length > 0);
  assert.ok(productCatalog.products.filter(p => p.insuranceType === 'Katt' && p.providerId !== 'tryg').length > 0);
});

test('PC-0007 / SF-0018: certificate sum remains customer-specific', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf');
  assert.ok(text[0].includes('Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder.'));
  const c = enrich([]); assert.equal(c.annualPremium, null); assert.equal(c.deductible, null);
  assert.doesNotMatch(raw(id, 'dyr.veterinar.sum.valgbar').value, /\d+\s*kr/);
});
test('PC-0008 / SF-0020: prescribed medicine remains covered without changing its identity', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf');
  assert.ok(text[0].includes('medisin og legemidler'));
  assert.ok(text[0].includes('må være rekvirert og ordinert av veterinær'));
  assert.equal(raw(id, 'dyr.medisin.dekning').value, 'Inkludert');
});
test('PC-0009 / SF-0025: Extra rehabilitation keeps the 10000 per disease/accident cap', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-cat-extra-terms.pdf');
  assert.ok(text[0].includes('10.000 kroner per sykdom og per ulykkesskade.'));
  assert.equal(raw(extraId, 'dyr.rehabilitering.grense').value, '10 000 kr per sykdom eller ulykkesskade');
  assert.equal(raw(extraId, 'dyr.rehabilitering.dekning').value, 'Valgfritt tillegg');
});
test('PC-0010 / SF-0026: dental caps are concurrent with TR sublimit inside the same frame', () => {
  const t = raw(extraId, 'dyr.tannsykdom.grense').value;
  assert.match(t, /30 000 kr per sykdom og per ulykkesskade.*30 000 kr samlet per forsikringsår/);
  assert.match(t, /Innenfor denne tannrammen.*tannresorpsjon.*5 000 kr per forsikringsår/);
  assert.doesNotMatch(t, /35 000/);
});
test('PC-0011 / SF-0028: chosen Life sum and same-breed replacement ceiling, no invented amount', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-cat-life-terms.pdf');
  assert.ok(text[0].includes('Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder.'));
  assert.ok(text[0].includes('inntil gjenanskaffelsespris for tilsvarende katt av samme rase.'));
  assert.match(raw(lifeId, 'dyr.liv.dekning').value, /Valgt forsikringssum.*gjenanskaffelsespris.*samme rase/);
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.dekning').value, /\d+\s*kr/);
});
test('PC-0012 / SF-0030: IPID cancellation is administrative, not a new coverage', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-pet-ipid.pdf');
  assert.ok(text[1].includes('Du kan si opp forsikringen ved å kontakte oss på telefon eller e-post.'));
});
test('PC-1714 / SF-6241: security/product information preserved; no puppy/parrot scope promotion', async () => {
  const text = (await pages('catalog/sources/boat-pet/tryg-pet-ipid.pdf')).join(' ');
  assert.match(text, /Hund, Katt eller Papegøye/); assert.match(text, /Valpekull/);
  assert.equal(productCatalog.sources['boat-pet:tryg:katt'].sourceType, 'ipid');
  for (const r of rows) assert.doesNotMatch(r.key + ' ' + r.value, /valpekull|papegøye/iu);
});
