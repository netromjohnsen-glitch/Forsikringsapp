import { newContentsTravelFacts, newContentsTravelSources } from "./new-private-contents-travel-catalog.ts";
import { cabinFacts, cabinSources } from "./private-cabin-catalog.ts";
import type { CatalogFact } from "./product-catalog.ts";

const baseFacts = { ...newContentsTravelFacts, ...cabinFacts };
const baseSources = { ...newContentsTravelSources, ...cabinSources };

type Row = readonly [
  key: string,
  label: string,
  value: string,
  page: number,
  section: string,
  deductible?: CatalogFact["deductibleClassification"],
];

const documents = {
  "klp-innbo": ["innbo", "new-private-contents-travel/klp-innbo.pdf"],
  "klp-innbo-maks": ["innbo-maks", "new-private-contents-travel/klp-innbo-maks.pdf"],
  "landkreditt-innbo": ["innbo", "new-private-contents-travel/landkreditt-innbo.pdf"],
  "landkreditt-reise": ["reise", "new-private-contents-travel/landkreditt-reise.pdf"],
  "watercircles-reise": ["reise-2-17", "new-private-contents-travel/watercircles-reise.pdf"],
  "watercircles-innbo": ["innbo-2-17", "new-private-contents-travel/watercircles-innbo.pdf"],
  "cabin:tryg:safety": ["hytte-sikkerhetsforskrift", "private-cabin/tryg-hytte-sikkerhetsforskrift.pdf"],
  "cabin:gjensidige:standard": ["hytte-standard-alminnelige", "private-cabin/gjensidige-hytte.pdf"],
  "cabin:gjensidige:pluss": ["hytte-pluss-alminnelige", "private-cabin/gjensidige-hytte-pluss.pdf"],
} as const;

type SourceId = keyof typeof documents;

function withTerms(productId: string, sourceId: SourceId, rows: readonly Row[],
  removedKeys: readonly string[] = []): CatalogFact[] {
  const source = baseSources[sourceId];
  const replaced = new Set([...removedKeys, ...rows.map(([key]) => key)]);
  return [
    ...baseFacts[productId].filter(fact => !replaced.has(fact.key)),
    ...rows.map(([key, label, value, page, section, deductibleClassification]) => ({
      key, label, value, deductibleClassification,
      source: {
        documentId: source.id, company: source.company, filename: source.filename,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
        agreementScope: source.agreementScope, version: source.version, url: source.url, page, section,
      },
    })),
  ];
}

const landkredittTravel: readonly Row[] = [
  ["reise.bagasje.mobil", "Mobiltelefon – erstatningsgrense",
    "Verdien av tilsvarende merke og modell innenfor forsikringssummen.", 5, "4.3 g"],
  ["reise.bagasje.mobil_egenandel", "Mobiltelefon – egenandel",
    "1 000 kr ved dekket skade eller tap av mobiltelefon.", 5, "4.3 g", "coverage"],
  ["reise.bagasje.sykkel", "Sykkel og sykkeltilhenger",
    "Inntil 40 000 kr per låst sykkel ved dekket skade eller tyveri. Tyveri i hjemkommunen eller på arbeids- eller undervisningsstedet er unntatt.", 5, "4.2 c og 4.3 f"],
  ["reise.reiseavbrudd.medreisende", "Reiseavbrudd ved hendelse hos nødvendig reiseledsager",
    "Inntil 35 000 kr ved reiseavbrudd eller forsinket hjemreise grunnet akutt sykdom, alvorlig skade eller dødsfall hos en nødvendig reiseledsager eller dennes nærmeste familie bosatt i Norge. Rimelige og nødvendige merutgifter til kost, losji, innhenting av reiseruten eller hjemtransport. Vilkåret avgrenser til én person over 20 år og eventuelle barn under 20 år.", 11, "11.1–11.2, vilkår for reiseledsager på side 10"],
  ["reise.rettshjelp.sum", "Rettshjelp – forsikringssum",
    "Inntil 100 000 kr per tvist.", 16, "16.1"],
];

function waterCirclesTravel(elite: boolean): readonly Row[] {
  return [
    ["reise.avbestilling.dekning", "Avbestilling",
      "Avbestillingskostnader ved angitte hendelser som gjør at reisen ikke kan gjennomføres.", 5, "2.4"],
    ["reise.avbestilling.sum", "Avbestilling – forsikringssum",
      elite ? "Inntil reisens pris, begrenset til det reelle økonomiske tapet."
        : "Inntil 40 000 kr per person og 100 000 kr per familie, begrenset til det reelle økonomiske tapet.", 5, "2.4 og 2.6 c"],
    ["reise.bagasje.mobil", "Mobiltelefon med tilbehør – erstatningsgrense",
      elite ? "Inntil 40 000 kr per skadetilfelle." : "Inntil 5 000 kr per skadetilfelle.", 8, "4.5 f"],
  ];
}

const freezerCoverage = "innbo.fryserinnhold.dekning";
const freezerLimit = "innbo.fryserinnhold.grense";
const legacyFreezerRows = ["innbo.frysevarer"];

const landkredittContents: readonly Row[] = [
  [freezerCoverage, "Matvarer ved temperaturstigning",
    "Ved utilsiktet temperaturstigning i fryser dekkes matskade og luktskade på fryseren. Meld skaden straks og oppbevar de skadde matvarene til besiktigelse.", 6, "4.1 h"],
  ["flytting.midlertidig_bosted", "Midlertidig bosted etter skade",
    "Nødvendige merutgifter til opphold utenfor hjemmet når det er ubeboelig etter en dekket skade. Utgiftene dekkes i normal reparasjonstid etter avtale med Landkreditt. Tapt husleie eller markedsleie trekkes fra.", 6, "4.1.1 g"],
];

function klpContents(deductiblePage: number): readonly Row[] {
  return [
    [freezerCoverage, "Matvarer ved temperaturstigning",
      "Ved utilsiktet temperaturstigning i fryser dekkes matskade og luktskade på fryseren.", 2, "Standard dekning – fryser"],
    ["naturskade.egenandel", "Naturskade – egenandel",
      "8 000 kr etter vilkåret.", deductiblePage, "Spesielle egenandeler – Naturskader", "coverage"],
    ["sykkel.egenandel", "Sykkeltyveri – egenandel",
      "4 000 kr ved dekket sykkeltyveri. Egenandelen reduseres med 1 000 kr ved registrering i et FG-godkjent sykkelregister.", deductiblePage, "Spesielle egenandeler – Tyveri av sykkel", "coverage"],
  ];
}

const waterCirclesContents: readonly Row[] = [
  [freezerCoverage, "Matvarer ved temperaturstigning",
    "Skade på matvarer ved utilsiktet temperaturstigning i fryser.", 5, "A.1.7"],
  ["sykkel.egenandel", "Sykkeltyveri – egenandel ved godkjent registrering",
    "Halvparten av avtalt egenandel når sykkelen er registrert i et godkjent sykkelregister og abonnementet er betalt og løpende.", 7, "A.5.6, spesielle egenandeler, punkt 4", "override"],
];

const trygCabinClaim: readonly Row[] = [
  ["hytte.avtale.meldefrist", "Skademelding", "Skade meldes til Tryg uten ugrunnet opphold.", 3, "4 Frist for å melde skade"],
  ["hytte.krav.meldefrist", "Frist for skademelding",
    "Retten til erstatning tapes hvis kravet ikke meldes innen ett år etter at sikrede fikk kunnskap om forholdene som begrunner kravet.",
    3, "4 Frist for å melde skade"],
];

const gjensidigeCabin: readonly Row[] = [
  ["hytte.naturskade.egenandel", "Naturskade – egenandel",
    "8 000 kr.", 1, "Forsikringsoversikt – Naturskade", "coverage"],
  ["hytte.glass.egenandel", "Bygningsglass – egenandel",
    "Publisert forsikringsoversikt oppgir 3 000 kr.", 1, "Forsikringsoversikt – Bygningsglass", "coverage"],
];

const facts: Record<string, CatalogFact[]> = {
  "klp-innbo": withTerms("klp-innbo", "klp-innbo", klpContents(8), legacyFreezerRows),
  "klp-innbo-maks": withTerms("klp-innbo-maks", "klp-innbo-maks", [
    ...klpContents(12),
    ["uhell.egenandel", "Uhell – egenandel",
      "2 000 kr per gjenstand ved uhell utenfor hjemmet, begrenset til avtalt egenandel i forsikringsbeviset.", 12, "Spesielle egenandeler – Uhell utenfor hjemmet", "coverage"],
  ], legacyFreezerRows),
  "landkreditt-innbo-standard": withTerms("landkreditt-innbo-standard", "landkreditt-innbo", landkredittContents),
  "landkreditt-innbo-utvidet": withTerms("landkreditt-innbo-utvidet", "landkreditt-innbo", landkredittContents),
  "landkreditt-reise": withTerms("landkreditt-reise", "landkreditt-reise", landkredittTravel),
  "watercircles-reise-standard": withTerms("watercircles-reise-standard", "watercircles-reise", waterCirclesTravel(false)),
  "watercircles-reise-elite": withTerms("watercircles-reise-elite", "watercircles-reise", waterCirclesTravel(true)),
  "watercircles-innbo-standard": withTerms("watercircles-innbo-standard", "watercircles-innbo", [
    ...waterCirclesContents,
    [freezerLimit, "Matvarer ved temperaturstigning – beløpsgrense", "Inntil 10 000 kr.", 5, "A.1.7"],
  ], legacyFreezerRows),
  "watercircles-innbo-elite": withTerms("watercircles-innbo-elite", "watercircles-innbo", [
    ...waterCirclesContents,
    [freezerLimit, "Matvarer ved temperaturstigning – beløpsgrense",
      "Ingen særskilt beløpsgrense for matvarer i fryser.", 13, "E.2.16"],
  ], legacyFreezerRows),
  "tryg-hytte-standard": withTerms("tryg-hytte-standard", "cabin:tryg:safety", trygCabinClaim),
  "tryg-hytte-ekstra": withTerms("tryg-hytte-ekstra", "cabin:tryg:safety", trygCabinClaim),
  "gjensidige-hytte-standard": withTerms("gjensidige-hytte-standard", "cabin:gjensidige:standard", gjensidigeCabin),
  "gjensidige-hytte-pluss": withTerms("gjensidige-hytte-pluss", "cabin:gjensidige:pluss", [
    ...gjensidigeCabin,
    ["hytte.rate.egenandel", "Råte og skadeinsekter – egenandel",
      "6 000 kr ved dekket skade fra råte eller skadeinsekter.", 1, "Forsikringsoversikt – Råte og skadeinsekter", "coverage"],
    ["hytte.skadedyr.egenandel", "Bekjempelse av skadeinsekter – egenandel",
      "2 000 kr ved dekket bekjempelse av skadeinsekter.", 1, "Forsikringsoversikt – Bekjempelse av skadeinsekter", "coverage"],
  ]),
};

export const privateHomeTravelCoverageMarket = {
  replacesProductIds: [],
  products: [],
  sources: {},
  facts,
  addOns: [],
};

export const privateHomeTravelCoverageArchives = (Object.keys(documents) as SourceId[]).map(id => {
  const [slug, filename] = documents[id];
  const { providerId, effectiveFrom, url } = baseSources[id];
  return {
    provider: providerId!,
    slug,
    archivePath: "catalog/sources/" + filename,
    sources: [[id, effectiveFrom, url!]] as const,
  };
});
