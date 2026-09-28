import type { CatalogSource } from "./product-catalog.ts";
import { buildMcBobilCatalog, type McBobilProductDefinition, type McBobilAddOnDefinition, type McBobilRow } from "./mc-bobil-catalog-builder.ts";

// Public originals and exact document dates: catalog/sources/mc-bobil/fremtind-frende-manifest.json.
// Insurer, distribution scope and type are separate; shared bytes never imply shared applicability.
const sources: Record<string, CatalogSource> = {
  "mcb-ff-fremtind-sb1-mc-page": {
    "id": "mcb-ff-fremtind-sb1-mc-page",
    "filename": "fremtind-sb1-mc-page.html",
    "termsNumber": "",
    "effectiveFrom": "",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "MC",
    "agreementScope": "ordinary-sparebank1",
    "sourceType": "product_page",
    "url": "https://www.sparebank1.no/nb/bank/privat/forsikring/mc-motorsykkelforsikring.html",
    "sha256": "4c3eb533846f629dbccfeec1aa0ad08bd0465ee8bfe44598f392f00f39bc0d2e",
    "distributionChannels": [
      "SpareBank 1"
    ],
    "documentName": "fremtind-sb1-mc-page.html"
  },
  "mcb-ff-fremtind-mc-terms": {
    "id": "mcb-ff-fremtind-mc-terms",
    "filename": "fremtind-mc-terms.pdf",
    "termsNumber": "PMO-357.000-006",
    "effectiveFrom": "2023-10-29",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "MC",
    "agreementScope": "ordinary-sparebank1",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_MC.pdf",
    "sha256": "2698b98c7ed2b19e82ba8df52a7b14b97d94cbf98c48d55629a72d2e0a89da7e",
    "distributionChannels": [
      "SpareBank 1"
    ],
    "documentName": "fremtind-mc-terms.pdf",
    "version": "PMO-357.000-006"
  },
  "mcb-ff-fremtind-mc-ipid": {
    "id": "mcb-ff-fremtind-mc-ipid",
    "filename": "fremtind-mc-ipid.pdf",
    "termsNumber": "V.104",
    "effectiveFrom": "",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "MC",
    "agreementScope": "ordinary-sparebank1",
    "sourceType": "ipid",
    "url": "https://dokument.fremtind.no/ipid/IPID_Motorsykkel.pdf",
    "sha256": "8306f5ea20f0cc727f1f6159b17deedd26790487cc404c0a86a6a5aa777813a8",
    "distributionChannels": [
      "SpareBank 1"
    ],
    "documentName": "fremtind-mc-ipid.pdf",
    "version": "V.104"
  },
  "mcb-ff-fremtind-dnb-bobil-page": {
    "id": "mcb-ff-fremtind-dnb-bobil-page",
    "filename": "fremtind-dnb-bobil-page.html",
    "termsNumber": "",
    "effectiveFrom": "",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "product_page",
    "url": "https://www.dnb.no/forsikring/kjoretoy/bobilforsikring",
    "sha256": "c87918d37d27b8ac4eb191d8cd445bbd992e212a804eadb1e719720030080908",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-dnb-bobil-page.html"
  },
  "mcb-ff-fremtind-bobil-ansvar": {
    "id": "mcb-ff-fremtind-bobil-ansvar",
    "filename": "Vilkar_ansvar_bil.pdf",
    "termsNumber": "PMO-357.001-004",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_ansvar_bil.pdf",
    "sha256": "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-ansvar.pdf",
    "version": "PMO-357.001-004"
  },
  "mcb-ff-fremtind-bobil-minikasko": {
    "id": "mcb-ff-fremtind-bobil-minikasko",
    "filename": "Vilkar_Minikasko_Bil.pdf",
    "termsNumber": "PMO-357.210-012",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Minikasko_Bil.pdf",
    "sha256": "8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-minikasko.pdf",
    "version": "PMO-357.210-012"
  },
  "mcb-ff-fremtind-bobil-kasko": {
    "id": "mcb-ff-fremtind-bobil-kasko",
    "filename": "Vilkar_Kasko_Bil.pdf",
    "termsNumber": "PMO-357.220-007",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Bil.pdf",
    "sha256": "87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-kasko.pdf",
    "version": "PMO-357.220-007"
  },
  "mcb-ff-fremtind-bobil-topp": {
    "id": "mcb-ff-fremtind-bobil-topp",
    "filename": "fremtind-bobil-topp.pdf",
    "termsNumber": "PMO-350.210-011",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf",
    "sha256": "6264e379da1b2bb8f943fb15dae8ec295572f2650863d57be818a3cd29464a0a",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-topp.pdf",
    "version": "PMO-350.210-011"
  },
  "mcb-ff-fremtind-bobil-ipid": {
    "id": "mcb-ff-fremtind-bobil-ipid",
    "filename": "IPID_Bil.pdf",
    "termsNumber": "V.106",
    "effectiveFrom": "",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "ipid",
    "url": "https://dokument.fremtind.no/ipid/IPID_Bil.pdf",
    "sha256": "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-ipid.pdf",
    "version": "V.106"
  },
  "mcb-ff-frende-mc-page": {
    "id": "mcb-ff-frende-mc-page",
    "filename": "frende-mc-page.html",
    "termsNumber": "",
    "effectiveFrom": "",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "url": "https://www.frende.no/forsikringer/mc-forsikring/",
    "sha256": "eb47ef1e8c57e579891464eb8a264047ddcefcbc4b2113c0c4585700fb43c221",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-mc-page.html"
  },
  "mcb-ff-frende-bobil-page": {
    "id": "mcb-ff-frende-bobil-page",
    "filename": "frende-bobil-page.html",
    "termsNumber": "",
    "effectiveFrom": "",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "url": "https://www.frende.no/forsikringer/bobilforsikring/",
    "sha256": "c68e0697e9408b220fc115200fa15f674aac238dcf8f4b8c627c3a8c48bcbc52",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-bobil-page.html"
  },
  "mcb-ff-frende-mc-terms": {
    "id": "mcb-ff-frende-mc-terms",
    "filename": "Vilkar_kjoretoyforsikring.pdf",
    "termsNumber": "",
    "effectiveFrom": "2026-01-01",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "url": "https://api.frende.no/documents/terms/public/pnc/MotorcycleInsurance",
    "sha256": "088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-mc-terms.pdf"
  },
  "mcb-ff-frende-bobil-terms": {
    "id": "mcb-ff-frende-bobil-terms",
    "filename": "Vilkar_kjoretoyforsikring.pdf",
    "termsNumber": "",
    "effectiveFrom": "2026-01-01",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "url": "https://api.frende.no/documents/terms/public/pnc/MotorHomeInsurance",
    "sha256": "088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-bobil-terms.pdf"
  },
  "mcb-ff-frende-mc-ipid": {
    "id": "mcb-ff-frende-mc-ipid",
    "filename": "frende-mc-ipid.pdf",
    "termsNumber": "",
    "effectiveFrom": "2026-01-01",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "url": "https://www.frende.no/documents/204/IPID_Motorsykkel.pdf",
    "sha256": "11b4f8c1c73d2177ce49d7349ed1fd23151c63dbaaa77f15179b4b83496044eb",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-mc-ipid.pdf"
  },
  "mcb-ff-frende-bobil-ipid": {
    "id": "mcb-ff-frende-bobil-ipid",
    "filename": "frende-bobil-ipid.pdf",
    "termsNumber": "",
    "effectiveFrom": "2026-01-01",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "url": "https://www.frende.no/documents/200/IPID_Bobil.pdf",
    "sha256": "4b160a93fe10ccf41413702a2432f49da20ca892ce78491dde4bbb76036c0ace",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-bobil-ipid.pdf"
  },
  "mcb-ff-fremtind-bobil-leiebil": {
    "id": "mcb-ff-fremtind-bobil-leiebil",
    "filename": "Vilkar_leiebil.pdf",
    "termsNumber": "PMO-350.402-003",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_leiebil.pdf",
    "sha256": "fa207fd6d1d8a4f02b6245362bd932bbe70408202d486afa25fd3d9edae1726c",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-leiebil.pdf",
    "version": "PMO-350.402-003"
  },
  "mcb-ff-fremtind-bobil-maskinskade": {
    "id": "mcb-ff-fremtind-bobil-maskinskade",
    "filename": "Vilkar_maskinskade.pdf",
    "termsNumber": "PMO-350.201-001",
    "effectiveFrom": "2025-09-18",
    "company": "Fremtind",
    "providerId": "fremtind",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary-dnb",
    "sourceType": "full_terms",
    "url": "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_maskinskade.pdf",
    "sha256": "0ad5c24b9dca610189dfcd9f10ee6a56a37fa977ed4b1da00a1725baa05d63db",
    "distributionChannels": [
      "DNB"
    ],
    "documentName": "fremtind-bobil-maskinskade.pdf",
    "version": "PMO-350.201-001"
  },
  "mcb-ff-frende-mc-mileage": {
    "id": "mcb-ff-frende-mc-mileage",
    "filename": "frende-mc-mileage.html",
    "termsNumber": "",
    "effectiveFrom": "",
    "company": "Frende",
    "providerId": "frende",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "url": "https://www.frende.no/forsikringer/mc-forsikring/du-velger-kjorelengden/",
    "sha256": "0a4453a90ae2b0e2d5fd1f7af1e7e13b87206e526f9883a7536c60702eb50b12",
    "distributionChannels": [
      "Frende"
    ],
    "documentName": "frende-mc-mileage.html"
  }
};

const fm = "mcb-ff-fremtind-mc-terms";
const fb = "mcb-ff-fremtind-bobil-topp";
const rm = "mcb-ff-frende-mc-terms";
const rb = "mcb-ff-frende-bobil-terms";
function component(id: string, parent: string, termsNumber: string, date: string) {
  sources[id] = { ...sources[parent], id, termsNumber, version: termsNumber, effectiveFrom: date };
}
component(`${fm}-mini`, fm, "PMO-357.110-013", "2023-07-10");
component(`${fm}-kasko`, fm, "PMO-357.120-010", "2024-01-22");
component(`${fb}-mini`, fb, "PMO-357.210-012", "2025-09-18");
component(`${fb}-kasko`, fb, "PMO-357.220-007", "2025-09-18");
for (const id of [fm, fb]) {
  component(`${id}-ansvar`, id, "FMO-001.100-007", "2023-10-29");
  component(`${id}-ulykke`, id, "FMO-002.401-003", "2019-04-01");
  component(`${id}-rettshjelp`, id, "FFE-003.001-003", "2025-01-01");
}

type Entry = [key: string, value: string, deductible?: McBobilRow["deductibleClassification"]];
const rows = (sourceId: string, page: number, section: string, entries: Entry[]): McBobilRow[] =>
  entries.map(([key, value, deductibleClassification]) => ({ key, value, sourceId, page, section,
    ...(deductibleClassification ? { deductibleClassification } : {}) }));
// Explicit product-level refinement, not inferred inheritance from tier names.
const combine = (...groups: McBobilRow[][]): McBobilRow[] => [...new Map(groups.flat().map(row => [row.key, row])).values()];

const fremtindBase = (type: "mc" | "bobil") => {
  const id = type === "mc" ? fm : fb;
  return [
    ...rows(id, 1, "2. Hvor forsikringen gjelder", [["avtale.geografi", type === "mc"
      ? "Europa, Tyrkia og Israel" : "Europa, unntatt Tyrkia, Kosovo, Russland og Belarus"]]),
    ...rows(`${id}-ansvar`, 2, "Ansvar 1.1 og 2.1", [
      ["ansvar.dekning", "Ansvar etter bilansvarsloven; norske regler innen EØS når de gir høyere erstatning"],
      ["ansvar.person.grense", "Ubegrenset"], ["ansvar.ting.grense", "Inntil 100 000 000 kr per skadetilfelle"],
    ]),
    ...rows(`${id}-ulykke`, 3, "Fører- og passasjerulykke 1 og 2", [
      ["ulykke.dekning", "Ulykkesskade på fører og passasjerer i, på eller utenfor kjøretøyet når kjøretøyet er direkte årsak til skaden"],
      ["ulykke.invaliditet", "200 000 kr ved 100 % livsvarig medisinsk invaliditet for voksne; 1 000 000 kr for barn under 20 år"],
      ["ulykke.dod", "100 000 kr med ektefelle/samboer eller barn under 20 år; ellers 50 000 kr"],
    ]),
    ...rows(`${id}-rettshjelp`, type === "mc" ? 9 : 10, "Rettshjelp 1–4", [
      ["rettshjelp.dekning", "Rimelige og nødvendige utgifter til juridisk bistand ved tvist som eier eller rettmessig bruker av kjøretøyet"],
      ["rettshjelp.geografi", "Norden"],
    ]),
    ...rows(`${id}-rettshjelp`, type === "mc" ? 10 : 12, "Rettshjelp 5.1", [["rettshjelp.grense", "Inntil 100 000 kr per tvist; inntil 250 000 kr ved minst tre parter på samme side"]]),
    ...rows(`${id}-rettshjelp`, type === "mc" ? 10 : 12, "Rettshjelp 5.2", [["rettshjelp.egenandel", "Avtalt egenandel i forsikringsbeviset, i tillegg 20 % av advokat- og sakkyndigutgifter", "reference"]]),
  ];
};
const fremtindMcMini = combine(fremtindBase("mc"),
  rows(`${fm}-mini`, 4, "Minikasko 1.2", [
    ["utstyr.dekning", "Fastmontert tilleggsutstyr"], ["utstyr.grense", "Inntil 10 000 kr"],
    ["mc.kjoreutstyr.dekning", "Kjøreutstyr for motorsykkel omfattes som tilleggsutstyr"],
  ]),
  rows(`${fm}-mini`, 5, "Minikasko 1.3, 2.1–2.2", [
    ["mc.bagasje.dekning", "Løsøre i påmontert låsbar boks eller veske på motorsykkelen"], ["mc.bagasje.grense", "Inntil 5 000 kr samlet"],
    ["mc.bagasje.begrensning", "Gjelder sikredes faste husstand; penger, smykker og klokker omfattes ikke"],
    ["brann.dekning", "Brann, lynnedslag og eksplosjon"], ["tyveri.dekning", "Tyveri, brukstyveri, tyveriforsøk og hærverk"],
  ]),
  rows(`${fm}-mini`, 6, "Minikasko 2.4", [["veihjelp.dekning", "Transport til nærmeste verksted og nødvendig persontransport ved dekket skade eller upåregnelig driftsstans; assistanse også hjemme"],
    ["veihjelp.begrensning", "Driftsstans i terreng dekkes ikke; transport begrenset til 50 % av markedsverdi, men grensen gjelder ikke ved erstatningsmessig skade"]]),
  rows(`${fm}-mini`, 7, "Minikasko 4.3", [["veihjelp.egenandel", "500 kr", "coverage"]]));
const fremtindMcKasko = combine(fremtindMcMini,
  rows(`${fm}-kasko`, 8, "Kasko 1.1–1.2 og 3.1", [
    ["kasko.dekning", "Sammenstøt, utforkjøring, velting eller annen tilfeldig, plutselig ytre påvirkning"],
    ["kasko.egenandel", "Fremgår av forsikringsbeviset", "reference"],
    ["kasko.begrensning", "Maskinskade omfattes ikke; utleie og erverv omfattes ikke"],
    ["leiebil.dekning", "Leiebil etter erstatningsmessig skade på motorsykkel; bruk og leverandør må forhåndsgodkjennes"],
    ["leiebil.dager", "Normal reparasjonstid, maksimalt 15 dager"], ["leiebil.dagsgrense", "350 kr per dag"],
  ]));

const fremtindBobilMini = combine(fremtindBase("bobil"),
  rows(`${fb}-mini`, 4, "Minikasko 1.2–1.3 og 2.1–2.3", [
    ["utstyr.dekning", "Fastmontert tilleggsutstyr"], ["utstyr.grense", "Inntil 50 000 kr, eller beløpet i forsikringsbeviset"],
    ["bobil.fortelt.dekning", "Fortelt eller annen bygningsdel som brukes som tilbygg til bobil"], ["bobil.fortelt.grense", "Inntil 50 000 kr"],
    ["bobil.fortelt.begrensning", "Tyveri av fortelt, tilbygg eller terrasse omfattes ikke når bobilen er fjernet"],
    ["bobil.losore.dekning", "Personlige eiendeler i bobilen"], ["bobil.losore.grense", "Inntil 40 000 kr"], ["bobil.losore.gjenstand", "Maksimalt 10 000 kr per gjenstand"],
    ["bobil.losore.begrensning", "Penger, gavekort, verdipapirer, smykker og klokker omfattes ikke; tyveri fra fortelt/tilbygg omfattes ikke når bobilen er fjernet"],
    ["brann.dekning", "Brann, lynnedslag og eksplosjon"], ["tyveri.dekning", "Tyveri, tyveriforsøk og hærverk; underslag ved prøvekjøring i forbindelse med offentlig annonsert salg"],
    ["glass.dekning", "Reparasjon eller skifte av rute, glasstak og takluke ved bruddskade; solcellepanel omfattes ikke"],
  ]), rows(`${fb}-mini`, 5, "Minikasko 2.4", [["veihjelp.dekning", "Transport til nærmeste verksted ved dekket skade eller upåregnelig driftsstans; assistanse også på bostedsadresse"]]));
const fremtindBobilKasko = combine(fremtindBobilMini,
  rows(`${fb}-mini`, 5, "Minikasko 3.2.1, anvendt ved dekningsmessig kaskoskade", [
    ["nyverdi.dekning", "Ny bil av tilsvarende modell, type og årsmodell ved dekningsmessig totalskade"],
    ["nyverdi.alder", "Innen 1 år etter registrering som fabrikkny"], ["nyverdi.km", "Ikke kjørt over 15 000 km"],
    ["nyverdi.skadegrad", "Reparasjonskostnad over 80 % av nyanskaffelsesverdi"], ["nyverdi.begrensning", "Gjelder ikke leaset bil; leasing har egen startleieregel"],
  ]), rows(`${fb}-kasko`, 8, "Kasko 1.1 og 3.1", [
    ["kasko.dekning", "Sammenstøt, utforkjøring, velting, feilfylling eller annen tilfeldig, plutselig ytre påvirkning"],
    ["kasko.egenandel", "Fremgår av forsikringsbeviset", "reference"], ["feilfylling.dekning", "Skade ved feilfylling av drivstoff"],
    ["kasko.begrensning", "Maskinskade og leiebil krever egen tilleggsdekning; utleie krever at forsikringsbeviset uttrykkelig omfatter det"],
  ]));
const fremtindBobilTopp = combine(fremtindBobilKasko,
  rows(fb, 8, "Toppkasko Bobil 1.1", [["bobil.losore.grense", "Inntil 100 000 kr"]]),
  rows(fb, 9, "Toppkasko Bobil 2.1.1, 2.1.4, 2.1.6–2.1.7", [
    ["nokkel.dekning", "Mistet, stjålet eller skadet nøkkel; ny nøkkel, programmering og omkoding"], ["nokkel.grense", "Inntil 15 000 kr"],
    ["parkering.dekning", "Parkeringsskade uten bonustap ved ukjent skadevolder når tid og sted er kjent"], ["parkering.alder", "Til første hovedforfall etter at bobilen har blitt 6 år"],
    ["bobil.feriegaranti.dekning", "Utgifter til alternativ overnatting når påbegynt ferie avbrytes av dekningsmessig skade på bobilen"],
    ["bobil.feriegaranti.dagsbelop", "Inntil 1 500 kr per dag i dokumenterte overnattingsutgifter"], ["bobil.feriegaranti.dager", "Resterende planlagt ferie, inntil 15 dager"],
    ["bobil.fukt.dekning", "Fuktskade i tak, vegger og gulv"], ["bobil.fukt.alder", "Bobilen kan ikke være eldre enn 15 år fra registrering som fabrikkny"],
    ["bobil.fukt.kontroll", "Bestått fuktkontroll hos autorisert caravanforhandler; dekning inntil ett år etter kontrollen"],
    ["bobil.fukt.begrensning", "Skader oppstått utenfor forsikringsperioden omfattes ikke"],
  ]), rows(fb, 10, "Toppkasko Bobil 3.1 og 4", [
    ["nyverdi.alder", "Innen 3 år etter registrering som fabrikkny"], ["nyverdi.km", "Ikke kjørt over 100 000 km"],
    ["nokkel.egenandel", "1 000 kr", "coverage"], ["feilfylling.egenandel", "1 000 kr; bonustap ved bruk av forsikringen", "coverage"],
  ]));

const frendeBase = (id: string) => [
  ...rows(id, 2, "2. Hvor og når forsikringen gjelder", [["avtale.geografi", "Europa unntatt Russland, Tyrkia og Belarus"]]),
  ...rows(id, 11, "13. Bilansvar og 14. Rettshjelp", [["ansvar.dekning", "Erstatningsansvar etter bilansvarsloven"], ["rettshjelp.dekning", "Juridisk bistand ved tvist som privat eier eller rettmessig bruker av kjøretøyet"]]),
  ...rows(id, 12, "14.2 og 14.4", [["rettshjelp.geografi", "Norden"], ["rettshjelp.grense", "Inntil 100 000 kr per tvist; inntil 250 000 kr ved tre eller flere parter på samme side"]]),
  ...rows(id, 13, "14.4", [["rettshjelp.egenandel", "4 000 kr pluss 20 % av øvrige kostnader", "coverage"]]),
];
const frendeAccident = (id: string) => rows(id, 10, "12.1–12.3", [
  ["ulykke.dekning", "Ulykkesskade på fører og passasjerer ved lovlig bruk av kjøretøyet"],
  ["ulykke.invaliditet", "200 000 kr ved 100 % livsvarig medisinsk invaliditet; forholdsmessig ved lavere invaliditet"],
  ["ulykke.dod", "100 000 kr hvis avdøde etterlot ektefelle, samboer eller barn, eller var under 21 år"],
]);
const frendeMini = (id: string) => combine(frendeBase(id),
  rows(id, 2, "3.7", [["utstyr.dekning", "Fastmontert ekstrautstyr, lakk utover original lakk, lakkbeskyttelse og foliering av skadet område"], ["utstyr.grense", "Inntil 20 000 kr"]]),
  rows(id, 3, "4–5", [["brann.dekning", "Brann eller lynnedslag"], ["tyveri.dekning", "Tyveri eller tyveriforsøk av kjøretøyet"],
    ["veihjelp.dekning", "Berging til nærmeste verksted, hjemtransport eller rimeligere hotellopphold; også ved driftsstans hjemme"]]),
  rows(id, 9, "11.11", [["veihjelp.egenandel", "750 kr", "coverage"],
    ["brann.egenandel", "6 000 kr med mindre lavere egenandel står i forsikringsbeviset", "standard"],
    ["tyveri.egenandel", "6 000 kr med mindre lavere egenandel står i forsikringsbeviset; ingen egenandel hvis tyverialarm fungerte", "standard"]]));
const frendeMcMini = combine(frendeMini(rm), rows(rm, 2, "3.5", [
  ["mc.kjoreutstyr.dekning", "Kjøredress, hansker, støvler og hjelm omfattes ved forsikring av motorsykkel"],
]));
const frendeMcKasko = combine(frendeMcMini, rows(rm, 3, "6.1", [
  ["kasko.dekning", "Plutselig og uforutsett skade ved sammenstøt, utforkjøring, velt, hærverk og feilfylling"],
  ["feilfylling.dekning", "Skade ved feilfylling av drivstoff"],
  ["mc.bagasje.dekning", "Tyveri av løse ting og bagasje"], ["mc.bagasje.grense", "Inntil 10 000 kr"],
]), rows(rm, 4, "6.2", [["kasko.begrensning", "Maskinskade, slitasje, rust, frost, fukt og underslag omfattes ikke etter kaskodekningen"],
  ["kasko.egenandel", "Fremgår av forsikringsbeviset", "reference"]]));
const frendeBobilBase = combine(frendeBase(rb), frendeAccident(rb));
const frendeBobilMini = combine(frendeMini(rb), frendeAccident(rb), rows(rb, 2, "3.9–3.10", [
  ["bobil.losore.dekning", "Løse ting og bagasje i bobilen"], ["bobil.losore.grense", "Inntil 20 000 kr, eller forsikringssummen i forsikringsbeviset"],
  ["bobil.fortelt.dekning", "Fortelt ved forsikring av bobil"],
]), rows(rb, 3, "4.1.3 og 5.1", [["bobil.losore.begrensning", "Tyveri fra bobil og tilkoblet fortelt av tre eller glassfiber omfattes med inntil 20 000 kr"],
  ["glass.dekning", "Bruddskade på glassruter og glasstak ved tilfeldig, plutselig ytre påvirkning"]]),
  rows(rb, 9, "11.11", [["glass.egenandel", "3 000 kr", "coverage"], ["glass.reparasjon.egenandel", "Ingen egenandel ved reparasjon", "coverage"]]));
const frendeBobilKasko = combine(frendeBobilMini, rows(rb, 3, "6.1", [
  ["kasko.dekning", "Plutselig og uforutsett skade ved sammenstøt, utforkjøring, velt, hærverk eller feilfylling"], ["feilfylling.dekning", "Skade ved feilfylling av drivstoff"],
]), rows(rb, 4, "6.1–6.2", [
  ["nyverdi.dekning", "Ny bobil ved dekningsmessig totalskade etter vilkårets oppgjørsregler"], ["nyverdi.alder", "Ikke eldre enn 1 år på skadedato"],
  ["nyverdi.km", "Kjørt under 15 000 km"], ["nyverdi.skadegrad", "Reparasjon koster mer enn 80 % av prisen for ny bil"],
  ["kasko.begrensning", "Maskinskade krever egen tilleggsdekning. Fukt- og råteskade på bobil krever Utvidet; campingvognens kaskoregel gjelder ikke bobil"],
  ["kasko.egenandel", "Fremgår av forsikringsbeviset", "reference"],
]));
const frendeBobilExtended = combine(frendeBobilKasko, rows(rb, 4, "8.1–8.2", [
  ["nyverdi.alder", "Ikke eldre enn 3 år på skadedato"], ["nyverdi.km", "Kjørt under 60 000 km"],
  ["nyverdi.begrensning", "Utvidet nybilerstatning gjelder ikke leaset bobil eller bobil som ikke kommer til rette etter tyveri"],
  ["nokkel.dekning", "Skadet, stjålet eller mistet nøkkel eller fjernkontroll"], ["nokkel.grense", "Inntil 20 000 kr"], ["nokkel.egenandel", "Ingen egenandel eller bonustap", "coverage"],
]), rows(rb, 5, "8.4, 8.7–8.8", [
  ["utstyr.grense", "Inntil 50 000 kr"], ["bobil.losore.grense", "Inntil 100 000 kr"],
  ["bobil.losore.begrensning", "Utvidet sum gjelder skade på eller tyveri av innbo og løse ting i bobil"],
  ["bobil.fukt.dekning", "Fukt- og råteskade i bobil"], ["bobil.fukt.kontroll", "Godkjent fukttest må vise at skaden oppstod i løpet av siste 12 måneder"],
  ["bobil.fukt.begrensning", "Reparasjon av selve lekkasjen og fukt/råte som skyldes rørbrudd eller lekkasje fra rør/ledninger omfattes ikke"],
  ["kasko.begrensning", "Maskinskade og leiebil krever egne tilleggsdekninger; Utvidet omfatter særskilt fukt- og råteskade etter punkt 8.7"],
]), rows(rb, 9, "11.11", [["bobil.fukt.egenandel", "Samme egenandel som ved kaskoskade", "reference"]]));

const products: McBobilProductDefinition[] = [];
function tiers(providerId: string, company: string, type: "mc" | "bobil", agreementScope: string, sourceId: string,
  version: string | null, levels: [string, string, McBobilRow[]][]) {
  for (const [suffix, name, tierRows] of levels) products.push({ providerId, company, type, agreementScope,
    productId: `${providerId}-${type}-${suffix}`, name, version, sourceId, rows: tierRows });
}
tiers("fremtind", "Fremtind", "mc", "ordinary-sparebank1", fm, null, [
  ["ansvar", "Ansvar", fremtindBase("mc")], ["delkasko", "Delkasko", fremtindMcMini], ["kasko", "Kasko", fremtindMcKasko],
]);
tiers("fremtind", "Fremtind", "bobil", "ordinary-dnb", fb, "2025-09-18", [
  ["ansvar", "Ansvar", fremtindBase("bobil")], ["minikasko", "Minikasko", fremtindBobilMini], ["kasko", "Kasko", fremtindBobilKasko], ["topp", "Topp", fremtindBobilTopp],
]);
tiers("frende", "Frende", "mc", "ordinary", rm, "2026-01-01", [
  ["ansvar", "Ansvar", frendeBase(rm)], ["delkasko", "Delkasko", frendeMcMini], ["kasko", "Kasko", frendeMcKasko],
]);
tiers("frende", "Frende", "bobil", "ordinary", rb, "2026-01-01", [
  ["ansvar", "Ansvar", frendeBobilBase], ["delkasko", "Delkasko", frendeBobilMini], ["kasko", "Kasko", frendeBobilKasko], ["utvidet", "Utvidet", frendeBobilExtended],
]);

const additions: McBobilAddOnDefinition[] = [
  { id: "frende-mc-ulykke", providerId: "frende", company: "Frende", type: "mc", agreementScope: "ordinary",
    name: "Fører- og passasjerulykke", requiresLevel: ["frende-mc-ansvar", "frende-mc-delkasko", "frende-mc-kasko"], sourceId: rm, rows: frendeAccident(rm) },
  { id: "fremtind-bobil-leiebil", providerId: "fremtind", company: "Fremtind", type: "bobil", agreementScope: "ordinary-dnb",
    name: "Leiebil", requiresLevel: ["fremtind-bobil-kasko", "fremtind-bobil-topp"], sourceId: "mcb-ff-fremtind-bobil-leiebil",
    rows: rows("mcb-ff-fremtind-bobil-leiebil", 1, "1.1 og 2.1", [
      ["leiebil.dekning", "Leiebil ved dekningsmessig skade; bruk og leverandør må godkjennes"], ["leiebil.dager", "Normal reparasjonstid, inntil 45 dager"],
      ["leiebil.dagsgrense", "Inntil 600 kr per dag"], ["leiebil.bilklasse", "Tilsvarende biltype som den forsikrede bilen"],
      ["leiebil.begrensning", "Ikke ved kun glasskade. Totalskade/tyveri: maksimalt 45 dager og inntil 15 dager etter erstatningstilbud"],
    ]) },
  { id: "fremtind-bobil-maskinskade", providerId: "fremtind", company: "Fremtind", type: "bobil", agreementScope: "ordinary-dnb",
    name: "Maskinskade", requiresLevel: ["fremtind-bobil-kasko", "fremtind-bobil-topp"], sourceId: "mcb-ff-fremtind-bobil-maskinskade",
    rows: [...rows("mcb-ff-fremtind-bobil-maskinskade", 1, "1.1", [
      ["maskinskade.dekning", "Tilfeldig og plutselig skade på de oppregnede komponentene i motor, gir, styring og kraftoverføring"],
      ["maskinskade.alder", "Til første hovedforfall etter at bobilen har blitt 10 år"], ["maskinskade.km", "Inntil 200 000 km; alder eller kilometer, det som inntreffer først"],
      ["maskinskade.begrensning", "Slitasje, gradvis utviklet skade, varmgang, frost, irr og fukt omfattes ikke"],
    ]), ...rows("mcb-ff-fremtind-bobil-maskinskade", 2, "3. Egenandel", [["maskinskade.egenandel.kilometer", "Til 99 999 km: 10 000 kr; 100 000–149 999 km: 15 000 kr; 150 000–200 000 km: 20 000 kr", "coverage"]])] },
  { id: "frende-bobil-leiebil", providerId: "frende", company: "Frende", type: "bobil", agreementScope: "ordinary",
    name: "Leiebil / ferieavbrudd", requiresLevel: ["frende-bobil-kasko", "frende-bobil-utvidet"], sourceId: rb,
    rows: rows(rb, 4, "7. Leiebil", [
      ["leiebil.dekning", "Leiebil ved brann, tyveri, kasko- eller maskinskade som omfattes"], ["leiebil.bilklasse", "Klasse C"],
      ["leiebil.dager", "Hele reparasjonstiden; maksimalt 31 dager ved innløsning eller tyveri"],
      ["leiebil.begrensning", "Kan erstattes med 250 kr per dag i inntil 31 dager dersom leiebil ikke trengs"],
      ["bobil.feriegaranti.dekning", "Alternativ til leiebil: refusjon av overnattings- og transportutgifter hvis bobilen ikke kan brukes på ferietur"],
      ["bobil.feriegaranti.dagsbelop", "Inntil 1 500 kr per dag"], ["bobil.feriegaranti.dager", "Resten av ferien, maksimalt 15 dager"],
    ]) },
  { id: "frende-bobil-maskinskade", providerId: "frende", company: "Frende", type: "bobil", agreementScope: "ordinary",
    name: "Maskinskade", requiresLevel: ["frende-bobil-kasko", "frende-bobil-utvidet"], sourceId: rb,
    rows: [...rows(rb, 5, "9.1", [
      ["maskinskade.dekning", "Plutselig og uforutsett skade på oppregnede komponenter som gjør at kjøretøyet ikke kan kjøres"],
      ["maskinskade.alder", "Punkt 9.1: ut forsikringsåret bobilen blir 12 år; punkt 11.11 avgrenser også mot bil eldre enn 12 år"],
      ["maskinskade.km", "Inntil 200 000 km"], ["maskinskade.begrensning", "Serviceintervall må være fulgt; motor skal ikke være chippet eller trimmet; gradvis slitasje og garantidekket skade omfattes ikke"],
    ]), ...rows(rb, 9, "11.11", [["maskinskade.egenandel.kilometer", "Inntil 100 000 km: 10 000 kr; inntil 150 000 km: 15 000 kr; inntil 200 000 km: 20 000 kr", "coverage"]])] },
];

// Restrict every evidence record to the exact tier(s) or eligible add-on tiers
// for which the verified rows are used, including shared physical PDFs.
for (const definition of products) {
  for (const id of new Set([definition.sourceId, ...definition.rows.map(row => row.sourceId)])) {
    sources[id].productIds = [...new Set([...(sources[id].productIds ?? []), definition.productId])];
  }
}
for (const definition of additions) {
  for (const id of new Set([definition.sourceId, ...definition.rows.map(row => row.sourceId)])) {
    sources[id].productIds = [...new Set([...(sources[id].productIds ?? []), ...definition.requiresLevel])];
  }
}

export const fremtindFrendeMcBobilCatalog = buildMcBobilCatalog(sources, products, additions);
