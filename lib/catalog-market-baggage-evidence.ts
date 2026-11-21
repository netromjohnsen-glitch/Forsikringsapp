import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

type Document = readonly [id: string, sha256: string];
type Clause = readonly [page: number, section: string];

const documents = {
  fremtind: ["fremtindReiseUnifiedTerms", "2e410ce7bb27c5d355f564d4fd44c88e28e5199448cb691f139440cacc8d4267"],
  if: ["ifReiseTerms", "1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566"],
  storebrand: ["storebrandReiseTerms", "d44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414"],
  frende: ["frendeReiseTerms", "a15cb9cf2a1cba6c17eb62f3793cc5f664724f66780ebb692b93775f3f922509"],
  landkreditt: ["landkreditt-reise", "40de3aee9b92e86e7362d1dad246887f53c9feb2ad2ee2c49b97123f02152e88"],
  klp: ["klp-reise", "73a8d7c5471634ec6fbc229d0dae056a28034aff41dbf57fcbe70a4360074729"],
  klpMaks: ["klp-reise-maks", "7e8f7cfe8a86bf83a7d0a26590fb080c908246a41807c1221c750729d4f9681b"],
  waterCircles: ["watercircles-reise", "70291d41311f5d5e5f407866b91ed1eb0291a36e1cfc1ea190aa127261756128"],
  trygBase: ["trygReiseBase", "eef499eb1f5d9c26fae8928ca6e8ea240a80dda3d64a774d13b7d78946ff1606"],
  trygPremium: ["trygReisePremium", "a97b0d836b6465ff1c79a49441306f5cc1c77cc656c17870a5a3e04d836a475b"],
  trygSums: ["trygReiseSums", "5a94ffb15f362a736ee1f6d8378f29a4b991633aabe1e1919d7f277eac621f6d"],
  nitoSingle: ["tryg-nito-reise-enkeltperson-terms", "28ea69381919a6102214026c7b07820bc52c2e7067784040b67e16758627f8b5"],
  nitoFamily: ["tryg-nito-reise-familie-terms", "a94ca59ede62ea3eb1752e407cfec26374f9585f52aca4880b46cca4c7b3f590"],
  udfSingle: ["tryg-utdanningsforbundet-reise-en-person-terms", "473d3b7713f86937fbe15bdf62319fe4ecc341da2c261ec5332767978fa04a83"],
  udfFamily: ["tryg-utdanningsforbundet-reise-familie-terms", "473d3b7713f86937fbe15bdf62319fe4ecc341da2c261ec5332767978fa04a83"],
} as const satisfies Record<string, Document>;

const headings = {
  "reise.bagasje.forsinket": "Forsinket bagasje",
  "reise.bagasje.forsinket_sum": "Forsinket bagasje – sum",
  "reise.bagasje.transitt": "Utilgjengelig bagasje ved ufrivillig overnatting",
  "reise.bagasje.transitt_sum": "Utilgjengelig bagasje ved ufrivillig overnatting – sum",
  "reise.bagasje.forsinket_utstyr": "Leie av utstyr ved forsinket bagasje",
  "reise.forsinkelse.hotell_arrangement": "Tapt hotell og arrangement ved forsinkelse",
  "reise.forsinkelse.hotell_arrangement_sum": "Tapt hotell og arrangement ved forsinkelse – sum",
  "reise.forsinkelse.leiebilavtale": "Tapt leiebilavtale ved forsinkelse",
  "reise.forsinkelse.leiebilavtale_sum": "Tapt leiebilavtale ved forsinkelse – sum",
  "reise.forsinkelse.bagasje_spesial": "Forsinket spesialbagasje",
} as const;

type Row = readonly [key: keyof typeof headings, value: string, clause: Clause];

const transittClothes = "Nødvendige innkjøp av klær og toalettsaker når flyforsinkelse fører til ufrivillig transitt med overnatting og innsjekket bagasje er utilgjengelig.";
const transportDocumentation = "PIR-rapport fra transportør og originalkvitteringer kreves.";
const trygExpenses = "Nødvendige innkjøp av klær og toalettsaker samt leie av nødvendig forsinket utstyr. " + transportDocumentation;
const trygDelayed = "Når innsjekket bagasje ikke ankommer med samme transportmiddel, eller forbyttet bagasje ikke kommer til rette innen fire timer. " + trygExpenses;
const trygTransit = "Når flyforsinkelse fører til ufrivillig transitt med overnatting og innsjekket bagasje er utilgjengelig. " + trygExpenses;
const trygExclusions = " Forsinkelse til siste flyplass på vei til fast eller midlertidig bosted, streik og lockout er unntatt, samt utgifter andre skal erstatte.";

function cite(source: CatalogSource, [page, section]: Clause): CatalogFact["source"] {
  const { id, filename, termsNumber, effectiveFrom, url, company, agreementScope } = source;
  return { documentId: id, filename, termsNumber, effectiveFrom, url, company, agreementScope, page, section };
}

export function addReviewedTravelBaggageFacts(
  sources: Readonly<Record<string, CatalogSource>>,
  facts: Record<string, CatalogFact[]>,
) {
  const verified = ([id, digest]: Document) => sources[id]?.sha256 === digest ? sources[id] : undefined;

  function setRows(component: string, source: CatalogSource, rows: readonly Row[],
    options: { replacesBase?: boolean; unavailable?: boolean; qualification?: Clause; remove?: string[] } = {}) {
    if (!facts[component]) return;
    const keys = new Set<string>([...rows.map(([key]) => key), ...(options.remove ?? [])]);
    const reviewed: CatalogFact[] = rows.map(([key, value, clause]) => ({
      key, label: headings[key], value, source: cite(source, clause),
      ...(options.replacesBase && { replacesBase: true }),
      ...(options.unavailable && { coverageAvailability: "unavailable" }),
      ...(options.qualification && { qualificationSource: cite(source, options.qualification) }),
    }));
    facts[component] = [...facts[component].filter(fact => !keys.has(fact.key)), ...reviewed];
  }

  const fremtind = verified(documents.fremtind);
  if (fremtind) setRows("fremtindReiseActiveTerms", fremtind, [
    ["reise.bagasje.forsinket", "Rimelige og nødvendige utgifter til klær, toalettsaker og leie av relevant utstyr mens innsjekket bagasje er savnet. Minst fire timers forsinkelse, unntatt ved jobbreise. PIR-rapport kreves. Hjemreise og utgifter andre har ansvaret for, er unntatt.", [5, "8.1"]],
    ["reise.bagasje.forsinket_sum", "Inntil 5 000 kr per person.", [5, "8.1"]],
    ["reise.bagasje.transitt", "Nødvendige og dokumenterte merutgifter til klær og toalettsaker når forsinkelsen medfører overnatting og flyselskapet ikke gir tilgang til ekspedert bagasje.", [6, "8.2"]],
    ["reise.bagasje.transitt_sum", "Inntil 500 kr per person.", [6, "8.2"]],
  ]);

  const ifTerms = verified(documents.if);
  if (ifTerms) {
    setRows("ifReiseStandard", ifTerms, [
      ["reise.bagasje.forsinket", "Rimelige og nødvendige utgifter til kjøp eller leie av klær, toalettsaker og andre nødvendige reiseartikler mens innsjekket bagasje er forsinket eller forbyttet. " + transportDocumentation + " Innkjøp på hjemreise eller etter hjemkomst er unntatt.", [9, "3.3"]],
      ["reise.bagasje.forsinket_sum", "Inntil 5 000 kr per person og 25 000 kr per familie.", [9, "3.3.1"]],
      ["reise.bagasje.transitt", transittClothes + " " + transportDocumentation, [9, "3.3.1–3.3.3"]],
      ["reise.bagasje.transitt_sum", "Inntil 1 000 kr per person og 5 000 kr per familie.", [9, "3.3.1"]],
    ], { replacesBase: true });
    setRows("ifReiseBasis", ifTerms, [
      ["reise.bagasje.transitt", "Utilgjengelig bagasje ved ufrivillig overnatting dekkes bare av Standard og Super.", [9, "3.3"]],
    ], { unavailable: true });
  }

  const storebrand = verified(documents.storebrand);
  if (storebrand) {
    for (const [component, amount] of [["storebrandReiseStandard", "3 000"], ["storebrandReiseSuper", "6 000"]]) {
      setRows(component, storebrand, [
        ["reise.bagasje.forsinket", "Nødvendige innkjøp av klær og toalettsaker mens innsjekket bagasje er forsinket på utreise. " + transportDocumentation + " Innkjøp på hjemreise eller etter hjemkomst er unntatt.", [10, "B.3.2"]],
        ["reise.bagasje.forsinket_sum", "Inntil " + amount + " kr per person per hendelse.", [8, "B.3 Forsikringssummer"]],
        ["reise.bagasje.transitt", transittClothes + " " + transportDocumentation, [10, "B.3.3"]],
        ["reise.bagasje.transitt_sum", "Inntil 500 kr per person per hendelse.", [8, "B.3 Forsikringssummer"]],
      ], { replacesBase: true });
    }
  }

  const frende = verified(documents.frende);
  if (frende) setRows("frendeReiseCoverage", frende, [
    ["reise.bagasje.forsinket", "På utreise dekkes nødvendige klær og toalettsaker, samt leie av blant annet ski-, golf- og fiskeutstyr, mens innsjekket gods er savnet eller forbyttet. Forsinkelsen må bekreftes med PIR-rapport. Arbeidskonflikt, personalmangel og konkurs er unntatt.", [6, "5.4"]],
    ["reise.bagasje.forsinket_sum", "Inntil 6 000 kr per person.", [6, "5.4"]],
    ["reise.bagasje.transitt", transittClothes, [6, "5.4"]],
    ["reise.bagasje.transitt_sum", "Inntil 500 kr per person.", [6, "5.4"]],
  ]);

  const landkreditt = verified(documents.landkreditt);
  if (landkreditt) setRows("landkreditt-reise", landkreditt, [
    ["reise.bagasje.forsinket", "Dokumenterte og nødvendige klær og toalettsaker når innsjekket bagasje er forsinket i mer enn fire timer. Transportør må bekrefte forsinkelsen. Forsinkelse til siste flyplass på hjemreise er unntatt. Spesialbagasje har en egen utgiftsdekning.", [6, "5.1"]],
    ["reise.bagasje.forsinket_sum", "Inntil 6 000 kr per sikret, med mindre annet er avtalt i forsikringsbeviset.", [6, "5.1"]],
    ["reise.bagasje.transitt", transittClothes, [6, "5.1"]],
    ["reise.bagasje.transitt_sum", "Inntil 1 000 kr per person.", [6, "5.1"]],
    ["reise.forsinkelse.bagasje_spesial", "Ved forsinket spesialbagasje dekkes rimelige og nødvendige kjøp eller leie med ytterligere inntil 5 000 kr per person og 25 000 kr per familie.", [6, "5.1"]],
  ]);

  for (const document of [documents.klp, documents.klpMaks]) {
    const source = verified(document);
    if (!source) continue;
    setRows(source.id, source, [
      ["reise.bagasje.forsinket", "Klær og toalettsaker til bruk mens innsjekket bagasje er savnet på feriestedet, ved minst fire timers forsinkelse. Hjemreise er unntatt.", [1, "Forsinkelse – Forsinket bagasje"]],
      ["reise.bagasje.forsinket_sum", "Inntil 5 000 kr per person til klær og toalettsaker.", [1, "Forsinkelse – Forsinket bagasje"]],
      ["reise.bagasje.forsinket_utstyr", "I tillegg dekkes leie av sykkel, ski, barnevogn eller annet sportsutstyr når utstyret er forsinket med fly, inntil 5 000 kr per person.", [1, "Forsinkelse – Forsinket bagasje"]],
      ["reise.forsinkelse.hotell_arrangement", "Ved dekket forsinkelse på ferie- eller fritidsreise med minst én overnatting, og minst åtte timers sen ankomst til endelig reisemål, dekkes én forhåndsbestilt overnatting og ubenyttede billetter til et arrangement eller utflukter.", [2, "Forsinkelse – Tapte utgifter til hotell og arrangementer"]],
      ["reise.forsinkelse.hotell_arrangement_sum", "Inntil 6 000 kr per person.", [2, "Forsinkelse – Tapte utgifter til hotell og arrangementer"]],
      ["reise.forsinkelse.leiebilavtale", "Ved dekket forsinkelse på ferie- eller fritidsreise, minst 1,5 time for sen henting av privatbil eller motorsykkel og leieavtale kansellert på grunn av forsinkelsen, erstattes forhåndsbetalt leie.", [2, "Forsinkelse – Tapte utgifter til leiebil"]],
      ["reise.forsinkelse.leiebilavtale_sum", "Inntil 10 000 kr.", [2, "Forsinkelse – Tapte utgifter til leiebil"]],
    ], { remove: ["reise.forsinkelse.tapte_utgifter"] });
  }

  const waterCircles = verified(documents.waterCircles);
  if (waterCircles) {
    for (const component of ["watercircles-reise-standard", "watercircles-reise-elite"]) {
      setRows(component, waterCircles, [
        ["reise.bagasje.forsinket", "På privatreise dekkes nødvendige klær og toalettsaker mens bagasjen er savnet, ved minst fire timers forsinkelse til reisemålet. På tjenestereise oppgir punkt 3.6 ingen firetimersfrist. Hjemreise og kjøp etter hjemkomst er unntatt.", [6, "3.5 Forsinket bagasje privatreise og 3.6 Forsinket bagasje tjenestereise"]],
        ["reise.bagasje.forsinket_sum", "Privatreise: Inntil 6 000 kr per person og 20 000 kr per familie. Tjenestereise: Inntil 6 000 kr per person. Medreisende ektefelle, samboer og barn følger privatregelen.", [6, "3.5 Forsinket bagasje privatreise og 3.6 Forsinket bagasje tjenestereise"]],
      ], { remove: ["reise.forsinkelse.tapte_utgifter"] });
    }
    setRows("watercircles-reise-standard", waterCircles, [
      ["reise.bagasje.forsinket_utstyr", "Leie ved forsinket sportsutstyr omfattes av Reise Elite.", [6, "3.5 Forsinket bagasje privatreise"]],
    ], { unavailable: true });
    setRows("watercircles-reise-elite", waterCircles, [
      ["reise.bagasje.forsinket_utstyr", "Leie av sykkel, barnevogn, ski eller annet sportsutstyr ved forsinkelse til reisemålet på privatreise. Inntil 6 000 kr per person og 20 000 kr per familie.", [6, "3.5 Forsinket bagasje privatreise"]],
    ]);

    const hotelScope = [6, "Reise Elite – innledningen til 3.7"] as const;
    const hotelClause = [7, "3.7 Tapte hotellutgifter og arrangement ved forsinket reise"] as const;
    setRows("watercircles-reise-standard", waterCircles, [
      ["reise.forsinkelse.hotell_arrangement", "Erstatning for tapt hotell og arrangement ved forsinkelse omfattes av Reise Elite.", hotelClause],
    ], { unavailable: true, qualification: hotelScope });
    setRows("watercircles-reise-elite", waterCircles, [
      ["reise.forsinkelse.hotell_arrangement", "Ved minst åtte timers forsinket ankomst av en dekket årsak erstattes én forhåndsbetalt hotellovernatting og billetter til ett arrangement som ikke kunne brukes. Jobbreiser, refunderbare utgifter og billetter overdratt til andre er unntatt.", hotelClause],
      ["reise.forsinkelse.hotell_arrangement_sum", "Inntil 5 000 kr per person.", hotelClause],
    ], { qualification: hotelScope });
  }

  const trygBase = verified(documents.trygBase);
  const trygPremium = verified(documents.trygPremium);
  const trygSums = verified(documents.trygSums);
  if (trygBase && trygPremium && trygSums) {
    for (const source of [trygBase, trygPremium]) setRows(source.id, source, [
      ["reise.bagasje.forsinket", trygDelayed + trygExclusions, [3, "4.1 Forsinket bagasje"]],
      ["reise.bagasje.transitt", trygTransit + trygExclusions, [3, "4.1 Forsinket bagasje ved transitt"]],
    ], { replacesBase: true, qualification: [4, "4.1 Unntak og 4.2 Erstatning"] });
    setRows("trygReiseBaseSums", trygSums, [
      ["reise.bagasje.forsinket_sum", "Inntil 2 000 kr per sikret.", [1, "Forsinket bagasje"]],
      ["reise.bagasje.transitt_sum", "Inntil 500 kr.", [1, "Forsinket bagasje – transitt"]],
    ], { replacesBase: true });
    setRows("trygReiseExtraSums", trygSums, [
      ["reise.bagasje.forsinket_sum", "Inntil 5 000 kr per sikret.", [1, "Forsinket bagasje"]],
    ], { replacesBase: true });
  }

  for (const [document, nito] of [
    [documents.nitoSingle, true], [documents.nitoFamily, true],
    [documents.udfSingle, false], [documents.udfFamily, false],
  ] as const) {
    const source = verified(document);
    if (!source) continue;
    const delayed = nito ? trygDelayed + trygExclusions : trygDelayed;
    const page = nito ? 10 : 12;
    setRows(source.id, source, [
      ["reise.bagasje.forsinket", delayed, [page, "10.1 Forsinket bagasje"]],
      ["reise.bagasje.transitt", trygTransit, [page, "10.1 Forsinket bagasje ved transitt"]],
    ], { qualification: [nito ? 11 : 12, "10.2 Erstatning"] });
    setRows(source.id, source, [
      ["reise.bagasje.forsinket_sum", "Inntil 6 000 kr per sikret.", [2, "Forsinket bagasje"]],
      ["reise.bagasje.transitt_sum", nito ? "Inntil 1 000 kr per sikret." : "Inntil 500 kr per sikret.", [2, "Forsinket bagasje – mellomlanding"]],
    ]);
  }
}
