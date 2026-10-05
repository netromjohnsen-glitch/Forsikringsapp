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

// B-089-SOURCE-CLEAR: frozen source oracles; held base rehabilitation and late-breed age remain unresolved.
const sources = [
  {
    "file": "catalog/sources/boat-pet/tryg-dog-extra-terms.pdf",
    "hash": "10972b0580b3cc804419621d3c5193d9be3e8bc24e8bafb58519e6e0a203af2c",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-dog-life-terms.pdf",
    "hash": "5d5e22fa589538a2708b87616b339eec0c3f0a27c5b322fa48d1b4582e013fcc",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-dog-product-terms.pdf",
    "hash": "a7936fd27cd305b1a6eeb8153d8289dffff5c075e0e50ffbd9590f8bb2d83318",
    "pages": 1
  },
  {
    "file": "catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf",
    "hash": "63af7ce2b7ce309879d3e97cdfca3014ba249f1dc7347eef44bd7c768fd162d3",
    "pages": 2
  },
  {
    "file": "catalog/sources/boat-pet/tryg-pet-ipid.pdf",
    "hash": "41843abc16ad8ee39782e70f29d8cbb115463bcebe28882cca42078ce07fd824",
    "pages": 2
  }
];
const bindings = [
  {
    "signature": "99c87c51318645c1",
    "gap": "GAP-0001",
    "sf": "SF-0001",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.veterinar.egenandel.fast"
    ]
  },
  {
    "signature": "54ae4b12e928dd11",
    "gap": "GAP-0002",
    "sf": "SF-0002",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.veterinar.sum.valgbar"
    ]
  },
  {
    "signature": "adb1ec0451b913cb",
    "gap": "GAP-0003",
    "sf": "SF-0004",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.diagnostikk.dekning"
    ]
  },
  {
    "signature": "86f0e4763bb31394",
    "gap": "GAP-0006",
    "sf": "SF-0008",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.veterinaralder.opphor"
    ]
  },
  {
    "signature": "8a3ce8f8c8e0ea33",
    "gap": "GAP-0009",
    "sf": "SF-0014",
    "owner": "tryg-hund-dod",
    "keys": [
      "dyr.liv.reduksjon.start",
      "dyr.liv.reduksjon.sats"
    ]
  },
  {
    "signature": "299ccea7e173719d",
    "gap": "GAP-4341",
    "sf": "SF-6193",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.tannskade.dekning"
    ]
  },
  {
    "signature": "86c9b328d112f3d7",
    "gap": "GAP-4342",
    "sf": "SF-6194",
    "owner": "tryg-hund-behandling",
    "keys": [
      "dyr.fodsel.dekning"
    ]
  },
  {
    "signature": "2f82551a65922fef",
    "gap": "GAP-4350",
    "sf": "SF-6202",
    "owner": "tryg-hund-ekstra",
    "keys": [
      "dyr.tannsykdom.begrensning"
    ]
  },
  {
    "signature": "16bed2bb40b8f90c",
    "gap": "GAP-4352",
    "sf": "SF-6204",
    "owner": "tryg-hund-dod",
    "keys": [
      "dyr.liv.dekning"
    ]
  },
  {
    "signature": "0c85ee2d283e39b1",
    "gap": "GAP-4353",
    "sf": "SF-6205",
    "owner": "tryg-hund-dod",
    "keys": [
      "dyr.liv.begrensning"
    ]
  },
  {
    "signature": "e2d135320216be8b",
    "gap": "GAP-4360",
    "sf": "SF-6212",
    "owner": "tryg-hund-dod",
    "keys": [
      "dyr.liv.opphor"
    ]
  }
];
const rows = [
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.veterinar.egenandel.fast",
    "value": "2 500 kr per sykdom og per ulykkestilfelle",
    "source": "boat-pet:tryg:hund:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – Egenandel",
    "deductibleClassification": "coverage"
  },
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.veterinar.sum.valgbar",
    "value": "Kundens valgte forsikringssum fremgår av forsikringsbeviset. Utgifter per sykdom og per ulykkesskade erstattes inntil summen på skadedagen; besøk og utgifter fra samme sykdom eller ulykke regnes som én skade. Samlede utgifter ved flere sykdommer eller ulykkesskader er også begrenset til forsikringssummen per forsikringsår.",
    "source": "boat-pet:tryg:hund:treatment",
    "page": 2,
    "section": "4 Slik beregnes erstatningen",
    "qualificationSource": {
      "source": "boat-pet:tryg:hund:treatment",
      "page": 1,
      "section": "1 HVA FORSIKRINGEN OMFATTER"
    }
  },
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.diagnostikk.dekning",
    "value": "CT og MR rekvirert og ordinert av veterinær ved sykdom eller ulykkesskade i forsikringstiden",
    "source": "boat-pet:tryg:hund:treatment",
    "page": 1,
    "section": "2–3 Tilfeller og utgifter"
  },
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.veterinaralder.opphor",
    "value": "Hund Behandling og Hund Ekstra kan beholdes hele dyrets levetid",
    "source": "boat-pet:tryg:hund:product",
    "page": 1,
    "section": "4 Når forsikringen gjelder"
  },
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.tannskade.dekning",
    "value": "Trekking av ulykkesskadde tenner ved tannfraktur dekkes. Annen behandling av tannskade og behandling av tann- og tannkjøttsykdommer er unntatt fra Hund Behandling.",
    "source": "boat-pet:tryg:hund:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – tannfraktur og unntak"
  },
  {
    "owner": "tryg-hund-behandling",
    "key": "dyr.fodsel.dekning",
    "value": "Fødselshjelp uavhengig av årsak dekkes kun etter at hunden har fylt 18 måneder, når veterinær har bekreftet at hundens liv er i fare. Keisersnitt hos Engelsk og Fransk Bulldog, Boston Terrier, Chihuahua og Pomeranian er unntatt; for blandingsrasehund gjelder unntaket når hunden er blandet av rase med unntak.",
    "source": "boat-pet:tryg:hund:treatment",
    "page": 1,
    "section": "3 Hvilke utgifter som erstattes – fødselshjelp og unntak"
  },
  {
    "owner": "tryg-hund-ekstra",
    "key": "dyr.tannsykdom.begrensning",
    "value": "Fjerning av tannstein erstattes kun ved påvist periodontitt. Trekking av tilbakeholdte melketenner eller behandling av tannstillingsfeil som medfører medisinske problemer krever sammenhengende forsikring med dekning for dette i Tryg eller annet selskap fra før 4 måneders alder.",
    "source": "boat-pet:tryg:hund:extra",
    "page": 1,
    "section": "2 Tann- og tannkjøttsykdommer"
  },
  {
    "owner": "tryg-hund-dod",
    "key": "dyr.liv.dekning",
    "value": "Valgfri separat dekning for hunden i forsikringsbeviset: død eller avliving som følge av sykdom eller ulykkesskade, samt hund som blir borte eller bortført. Avliving må være nødvendig av dyrevernmessige hensyn og anbefalt av veterinær; avliving dekkes ikke dersom alternativ behandling eller medisin gir god prognose. Valgt forsikringssum fremgår av forsikringsbeviset og er begrenset til gjenanskaffelsespris for tilsvarende hund av samme rase.",
    "source": "boat-pet:tryg:hund:life",
    "page": 1,
    "section": "1–3 Hund død – omfang, utløsere og erstatning",
    "qualificationSource": {
      "source": "boat-pet:tryg:hund:life",
      "page": 2,
      "section": "3 Slik beregnes erstatningen – gjenanskaffelsespris"
    }
  },
  {
    "owner": "tryg-hund-dod",
    "key": "dyr.liv.begrensning",
    "value": "Død eller avliving som følge av hofteleddsdysplasi (HD), albueleddsdysplasi (AD), albueleddsartrose (AA), Osteochondrose (OCD), patellaluksasjon, short ulna eller Calvé-Legg-Perthes krever sammenhengende forsikring med dekning for dette i Tryg eller annet selskap fra før 4 måneders alder.",
    "source": "boat-pet:tryg:hund:life",
    "page": 1,
    "section": "2 Tilleggsbestemmelser – død og avlivning"
  },
  {
    "owner": "tryg-hund-dod",
    "key": "dyr.liv.reduksjon.start",
    "value": "Startalder avhenger av hunderase; startalderen for sen rasegruppe er uavklart i kildegrunnlaget.",
    "source": "boat-pet:tryg:hund:life",
    "page": 2,
    "section": "3 Slik beregnes erstatningen – raseavhengig startalder"
  },
  {
    "owner": "tryg-hund-dod",
    "key": "dyr.liv.reduksjon.sats",
    "value": "Erstatningen reduseres med 20 % per år i aldersfradrag; minste erstatning etter aldersfradrag er 50 % av forsikringssummen, minimum 5 000 kr. Startalderen avhenger av rasegruppe og er ikke fastsatt her.",
    "source": "boat-pet:tryg:hund:life",
    "page": 2,
    "section": "3 Slik beregnes erstatningen – aldersfradrag og minste erstatning"
  },
  {
    "owner": "tryg-hund-dod",
    "key": "dyr.liv.opphor",
    "value": "Hund død opphører ved første forfall etter at hunden har oppnådd maksimal alder på 12 år.",
    "source": "boat-pet:tryg:hund:product",
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
      "CT, MR, medisin, legemidler, spesialsjampo og spesialfôr må være rekvirert og ordinert av veterinær."
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
      "Trekking av ulykkesskadde tenner dekkes ved fraktur."
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
      "I tillegg dekkes utgifter til fødselshjelp uavhengig av årsak. Slike utgifter dekkes kun etter at hunden har fylt 18 måneder, og hvis veterinær har bekreftet at hundens liv er i fare."
    ],
    [
      1,
      "keisersnitt hos rasene Engelsk og Fransk Bulldog, Boston Terrier, Chihuahua og Pomeranian"
    ],
    [
      1,
      "For blandingsrasehund gjelder unntak hvis hund er blandet av rase med unntak."
    ]
  ],
  "dyr.tannsykdom.begrensning": [
    [
      1,
      "tannstillingsfeil som medfører medisinske problemer."
    ],
    [
      1,
      "Fjerning av tannstein erstattes kun når det er påvist periodontitt."
    ],
    [
      1,
      "For dekning av utgifter til trekking av tilbakeholdte melketenner eller behandling av tannstillingsfeil, må hunden ha vært forsikret med dekning for dette i Tryg eller annet selskap sammenhengende fra før 4 måneders alder."
    ]
  ],
  "dyr.liv.dekning": [
    [
      1,
      "Forsikringen omfatter hunden som er nevnt i forsikringsbeviset."
    ],
    [
      1,
      "Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder."
    ],
    [
      1,
      "hund som dør eller blir avlivet som følge av sykdom eller ulykkesskade"
    ],
    [
      1,
      "hund som blir borte eller blir bortført"
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
      2,
      "Forsikret hund erstattes med forsikringssummen, men begrenset til gjenanskaffelsespris for tilsvarende hund av samme rase."
    ]
  ],
  "dyr.liv.begrensning": [
    [
      1,
      "For dekning av død eller avlivning som følge av hofteleddsdysplasi (HD), albueleddsdysplasi (AD), albueleddsartrose (AA), Osteochondrose (OCD), patellaluksasjon, short ulna eller Calvé-Legg-Perthes, må hunden ha vært forsikret med dekning for dette i Tryg eller annet selskap sammenhengende fra før 4 måneders alder."
    ]
  ],
  "dyr.liv.reduksjon.start": [
    [
      2,
      "Fra hunden er blitt 7 år reduseres erstatningen med 20 prosent per år i aldersfradrag, med unntak av hunderasene som er nevnt nedenfor."
    ]
  ],
  "dyr.liv.reduksjon.sats": [
    [
      2,
      "Fra hunden er blitt 7 år reduseres erstatningen med 20 prosent per år i aldersfradrag"
    ],
    [
      2,
      "Minste erstatning etter aldersfradrag vil være 50 prosent av forsikringssummen, minimum 5.000 kroner."
    ]
  ],
  "dyr.liv.opphor": [
    [
      1,
      "dekningene Hund død og Katt død kan beholdes til dyret fyller 12 år."
    ],
    [
      1,
      "Dekninger som opphører på grunn av alder, opphører ved første forfall etter at dyret har oppnådd maksimal alder."
    ]
  ]
};
const id = 'tryg-hund-behandling';
const extraId = 'tryg-hund-ekstra';
const lifeId = 'tryg-hund-dod';
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
  const c = canonicalCoverage(policy, 'Hund', key);
  assert.ok(c, key);
  return c;
};
const term = (key, value) => ({ name: boatPetFactLabel('hund', key), canonicalKey: key, value });
const enrich = terms => enrichExtractedAgreementWithCatalog({ company: 'Tryg', totalAnnualPremium: null,
  insurances: [{ type: 'Hund', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: null,
    deductible: null, coverageSummary: null, importantTerms: terms, addOns: [] }] }, date).insurances[0];
const manual = ids => normalizeManualAgreement({ company: 'Tryg', totalAnnualPremium: '', products: [{
  type: 'Hund', productName: 'Behandling', agreementScope: 'ordinary', annualPremium: '', deductible: '',
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

for (const source of sources) test(`R-089-SOURCE: ${source.file}`, async () => {
  sourceHash(source.file, source.hash);
  const text = await pages(source.file);
  assert.equal(text.length, source.pages);
});

test('R-089-IDENTITY: eleven source-clear bindings and twelve owner/key facts', () => {
  assert.equal(bindings.length, 11);
  assert.equal(new Set(bindings.map(b => b.signature)).size, 11);
  assert.equal(new Set(bindings.map(b => b.gap)).size, 11);
  assert.equal(new Set(bindings.map(b => b.sf)).size, 11);
  assert.equal(rows.length, 12);
  assert.equal(new Set(rows.map(r => r.owner + '/' + r.key)).size, 12);
  const batches = JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json', import.meta.url)));
  const batch = batches.batches.find(b => b.batch_id === 'B-089');
  assert.ok(batch);
  assert.deepEqual(batch.signature_ids.filter(id => id !== 'b11e6b335ac516e3').sort(), bindings.map(b => b.signature).sort());
  assert.deepEqual(batch.P2_piggyback_signatures, []);
  assert.deepEqual(batch.evidence.flatMap(e => e.finding_ids.map((gap, i) => [gap, e.source_fact_ids[i]])).filter(([gap]) => gap !== 'GAP-4345').sort(), bindings.map(b => [b.gap, b.sf]).sort());
  assert.equal(p.providerId, 'tryg'); assert.equal(p.company, 'Tryg');
  assert.equal(p.insuranceType, 'Hund'); assert.equal(p.agreementScope, 'ordinary');
  assert.equal(p.name, 'Behandling'); assert.equal(p.version, '2026-09-01');
  assert.deepEqual(availableAddOns(p, date).map(a => a.id).sort(), [extraId, lifeId].sort());
});

for (const binding of bindings) test(`R-089-${binding.signature}: ${binding.gap}/${binding.sf} full source and catalog contract`, async () => {
  for (const key of binding.keys) {
    const expected = rows.find(r => r.owner === binding.owner && r.key === key);
    assert.ok(expected, key);
    const f = raw(expected.owner, key);
    assert.equal(f.value, expected.value);
    assert.equal(f.key, key); assert.equal(f.label, boatPetFactLabel('hund', key));
    assert.equal(f.source.documentId, expected.source);
    assert.equal(f.source.page, expected.page); assert.equal(f.source.section, expected.section);
    const source = productCatalog.sources[expected.source];
    assert.equal(source.providerId, 'tryg'); assert.equal(source.company, 'Tryg');
    assert.equal(source.insuranceType, 'Hund'); assert.equal(source.agreementScope, 'ordinary');
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

test('R-089-PROVENANCE: sum and Life ceiling retain their exact page roles', () => {
  assert.deepEqual(catalogFactSources(raw(id, 'dyr.veterinar.sum.valgbar')).map(s => [s.documentId, s.page, s.section]), [
    ['boat-pet:tryg:hund:treatment', 2, '4 Slik beregnes erstatningen'],
    ['boat-pet:tryg:hund:treatment', 1, '1 HVA FORSIKRINGEN OMFATTER'],
  ]);
  assert.deepEqual(catalogFactSources(raw(lifeId, 'dyr.liv.dekning')).map(s => s.page), [1, 2]);
  assert.equal(productCatalog.sources['boat-pet:tryg:hund:treatment'].effectiveFrom, '2026-01-01');
  assert.equal(productCatalog.sources['boat-pet:tryg:hund:product'].effectiveFrom, '2026-05-10');
  assert.equal(p.version, '2026-09-01');
  assert.match(raw(id, 'dyr.veterinar.sum.valgbar').value, /per sykdom og per ulykkesskade/);
  assert.match(raw(id, 'dyr.veterinar.sum.valgbar').value, /samme sykdom eller ulykke regnes som én skade/);
  assert.match(raw(id, 'dyr.veterinar.sum.valgbar').value, /Samlede utgifter.*per forsikringsår/);
  assert.doesNotMatch(raw(id, 'dyr.veterinar.sum.valgbar').value, /\d+\s*kr/);
});

test('R-089-EXPIRY-AND-REDUCTION: first forfall after twelve; disputed start age remains unresolved', () => {
  assert.equal(raw(lifeId, 'dyr.liv.opphor').value, 'Hund død opphører ved første forfall etter at hunden har oppnådd maksimal alder på 12 år.');
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.opphor').value, /hovedforfall|12-årsdagen|kalenderår/);
  assert.match(raw(lifeId, 'dyr.liv.reduksjon.start').value, /rase.*uavklart/);
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.reduksjon.start').value, /\b(?:5|7|9|10)\s*år/);
  assert.match(raw(lifeId, 'dyr.liv.reduksjon.sats').value, /20 % per år.*50 % av forsikringssummen, minimum 5 000 kr/);
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.reduksjon.sats').value, /40 %|\b(?:9|10)\s*år/);
});

test('R-089-BIRTH: after eighteen months, vet-confirmed danger, five breed exclusions and mixtures', () => {
  const value = raw(id, 'dyr.fodsel.dekning').value;
  assert.match(value, /uavhengig av årsak.*kun etter at hunden har fylt 18 måneder.*veterinær.*liv er i fare/);
  for (const breed of ['Engelsk', 'Fransk Bulldog', 'Boston Terrier', 'Chihuahua', 'Pomeranian']) assert.ok(value.includes(breed));
  assert.match(value, /Keisersnitt.*unntatt.*blandingsrasehund.*blandet av rase med unntak/);
  assert.doesNotMatch(raw('tryg-katt-behandling', 'dyr.fodsel.dekning').value, /18 måneder|Bulldog|Chihuahua/);
});

for (const rehab of ['silent', 'selected', 'refused']) for (const life of ['silent', 'selected', 'refused']) {
  test(`R-089-CUSTOMER-${rehab}-${life}: independent parent choice and refusal`, () => {
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
  test(`R-089-CONFLICT-${key}: explicit inconsistent choice remains unknown`, () => {
    const c = enrich([term(key, 'Valgt'), term(key, 'Ikke valgt')]);
    assert.equal(coverage(c, key).status, 'unknown'); assert.equal(coverage(c, key).conflict, true);
    assert.deepEqual(c.addOnIds, []);
  });
  test(`R-089-UNKNOWN-${key}: unknown is not explicit refusal`, () => {
    const c = enrich([term(key, 'Ikke dokumentert')]);
    assert.equal(coverage(c, key).status, 'unknown'); assert.deepEqual(c.addOnIds, []);
  });
}
for (const key of ['dyr.tannsykdom.begrensning', 'dyr.liv.begrensning', 'dyr.liv.reduksjon.start', 'dyr.liv.reduksjon.sats', 'dyr.liv.opphor']) {
  test(`R-089-SUPPORT-${key}: qualification and age rule alone never select the parent`, () => {
    const r = rows.find(r => r.key === key); const c = enrich([term(key, r.value)]);
    assert.deepEqual(c.addOnIds, []);
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
    assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'unknown');
  });
}
test('R-089-EXISTING-POSITIVE-DETAIL: documented dental amount can select only its unique Extra component', () => {
  const c = enrich([term('dyr.tannsykdom.grense', raw(extraId, 'dyr.tannsykdom.grense').value)]);
  assert.deepEqual(c.addOnIds, [extraId]);
  assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'selected');
  assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
});

for (const [key, value] of [['dyr.veterinar.egenandel.fast', '3 000 kr per sykdom og per ulykkestilfelle'], ['dyr.veterinar.sum.valgbar', '40 000 kr per forsikringsår'], ['dyr.liv.reduksjon.start', 'Ukjent'], ['dyr.liv.opphor', 'Ukjent']]) {
  test(`R-089-DOCUMENT-${key}: explicit document overrides catalog without selecting Life`, () => {
    const c = enrich([term(key, value)]); const t = c.importantTerms.find(t => t.key === key);
    assert.ok(t); assert.equal(t.value, value); assert.equal(t.coverageOrigin, 'document');
    assert.deepEqual(c.addOnIds, []); assert.equal(c.deductible, null);
    assert.equal(coverage(c, 'dyr.liv.dekning').status, 'unknown');
  });
}
for (const ids of [[], [extraId], [lifeId], [extraId, lifeId]]) {
  test(`R-089-MANUAL-${ids.join('+') || 'none'}: exact choice, multi-source propagation and JSON`, () => {
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
for (const peer of productCatalog.products.filter(p => p.insuranceType === 'Hund')) {
  test(`R-089-COMPARISON-${peer.productId}: same product and both directions`, () => {
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

test('R-089-ISOLATION: frozen Dog-specific sources do not become Cat or other provider references', () => {
  const own = new Set([id, extraId, lifeId]);
  for (const [owner, fs] of Object.entries(productCatalog.facts)) for (const f of fs) {
    if (catalogFactSources(f).some(s => ['boat-pet:tryg:hund:treatment', 'boat-pet:tryg:hund:product'].includes(s.documentId))) assert.ok(own.has(owner), owner);
  }
  assert.ok(productCatalog.products.filter(p => p.insuranceType === 'Hund').length > 0);
  assert.ok(productCatalog.products.filter(p => p.insuranceType === 'Hund' && p.providerId !== 'tryg').length > 0);
});

test('FU-02 / SF-0004: own-source diagnostics no longer falsely unknown in either direction', () => {
  const peer = productCatalog.products.find(p => p.productId === 'sparebank1-fremtind-hund-veterin-r');
  assert.ok(peer);
  for (const [left, right, side] of [[p, peer, 'first'], [peer, p, 'second']]) {
    const row = compareCatalogProducts(left, right).sections.flatMap(s => s.rows).find(r => r.key === 'dyr.diagnostikk.dekning');
    assert.ok(row); assert.equal(row[side].state, 'included'); assert.match(row[side].text, /CT og MR/);
  }
});

test('PC-0001 / SF-0003: certificate sum remains customer-specific', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf');
  assert.ok(text[0].includes('Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder.'));
  const c = enrich([]); assert.equal(c.annualPremium, null); assert.equal(c.deductible, null);
  assert.doesNotMatch(raw(id, 'dyr.veterinar.sum.valgbar').value, /\d+\s*kr/);
});
test('PC-0002 / SF-0005: prescribed medicine identity remains included', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf');
  assert.ok(text[0].includes('medisin og legemidler'));
  assert.ok(text[0].includes('må være rekvirert og ordinert av veterinær'));
  assert.equal(raw(id, 'dyr.medisin.dekning').value, 'Inkludert');
});
test('PC-0003 / SF-0010: Extra rehabilitation keeps its own 10000 event cap', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-dog-extra-terms.pdf');
  assert.ok(text[0].includes('10.000 kroner per sykdom og per ulykkesskade.'));
  assert.equal(raw(extraId, 'dyr.rehabilitering.grense').value, '10 000 kr per sykdom eller ulykkesskade');
  assert.equal(raw(extraId, 'dyr.rehabilitering.dekning').value, 'Valgfritt tillegg');
});
test('PC-0004 / SF-0011: concurrent dental case and annual caps remain 30000', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-dog-extra-terms.pdf');
  assert.ok(text[0].includes('Erstatningen er begrenset til 30.000 kroner per sykdom og per ulykkesskade, og begrenset til maksimalt 30.000 kroner per forsikringsår.'));
  assert.equal(raw(extraId, 'dyr.tannsykdom.grense').value, '30 000 kr per sykdom eller ulykkesskade og per forsikringsår');
  assert.doesNotMatch(raw(extraId, 'dyr.tannsykdom.grense').value, /tannresorpsjon|5 000/);
});
test('PC-0005 / SF-0013: chosen Life sum and replacement ceiling are not a fabricated amount', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-dog-life-terms.pdf');
  assert.ok(text[0].includes('Det fremgår av forsikringsbeviset hvilken forsikringssum som gjelder.'));
  assert.ok(text[1].includes('Forsikret hund erstattes med forsikringssummen, men begrenset til gjenanskaffelsespris for tilsvarende hund av samme rase.'));
  assert.match(raw(lifeId, 'dyr.liv.dekning').value, /Valgt forsikringssum.*gjenanskaffelsespris.*samme rase/);
  assert.doesNotMatch(raw(lifeId, 'dyr.liv.dekning').value, /\d+\s*kr/);
});
test('PC-0006 / SF-0015: IPID cancellation stays administrative', async () => {
  const text = await pages('catalog/sources/boat-pet/tryg-pet-ipid.pdf');
  assert.ok(text[1].includes('Du kan si opp forsikringen ved å kontakte oss på telefon eller e-post.'));
});
test('PC-1713 / SF-6216: no puppy/parrot expansion; IPID and certificate precedence preserved', async () => {
  const text = (await pages('catalog/sources/boat-pet/tryg-pet-ipid.pdf')).join(' ');
  assert.match(text, /Hund, Katt eller Papegøye/); assert.match(text, /Valpekull/);
  assert.equal(productCatalog.sources['boat-pet:tryg:hund'].sourceType, 'ipid');
  for (const r of rows) assert.doesNotMatch(r.key + ' ' + r.value, /valpekull|papegøye/iu);
});
test('R-089-HOLD: base rehabilitation exclusion remains unimplemented, optional Extra remains available', () => {
  assert.equal(productCatalog.facts[id].some(f => f.key === 'dyr.rehabilitering.dekning'), false);
  assert.equal(raw(extraId, 'dyr.rehabilitering.dekning').value, 'Valgfritt tillegg');
  const c = enrich([]); assert.equal(coverage(c, 'dyr.rehabilitering.dekning').status, 'unknown');
  const row = compareCatalogProducts(p, p).sections.flatMap(s => s.rows).find(r => r.key === 'dyr.rehabilitering.dekning');
  assert.ok(row); assert.equal(row.first.state, 'optional'); assert.equal(row.second.state, 'optional');
});
