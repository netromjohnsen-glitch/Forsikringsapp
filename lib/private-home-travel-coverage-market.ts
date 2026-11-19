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
  "landkreditt-reise": ["reise", "new-private-contents-travel/landkreditt-reise.pdf"],
  "watercircles-reise": ["reise-2-17", "new-private-contents-travel/watercircles-reise.pdf"],
  "watercircles-innbo": ["innbo-2-17", "new-private-contents-travel/watercircles-innbo.pdf"],
  "cabin:gjensidige:standard": ["hytte-standard-alminnelige", "private-cabin/gjensidige-hytte.pdf"],
  "cabin:gjensidige:pluss": ["hytte-pluss-alminnelige", "private-cabin/gjensidige-hytte-pluss.pdf"],
} as const;

type SourceId = keyof typeof documents;

function withTerms(productId: string, sourceId: SourceId, rows: readonly Row[]): CatalogFact[] {
  const source = baseSources[sourceId];
  const replaced = new Set(rows.map(([key]) => key));
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

const waterCirclesContents: readonly Row[] = [
  ["sykkel.egenandel", "Sykkeltyveri – egenandel ved godkjent registrering",
    "Halvparten av avtalt egenandel når sykkelen er registrert i et godkjent sykkelregister og abonnementet er betalt og løpende.", 7, "A.5.6, spesielle egenandeler, punkt 4", "override"],
];

const gjensidigeCabin: readonly Row[] = [
  ["hytte.naturskade.egenandel", "Naturskade – egenandel",
    "8 000 kr.", 1, "Forsikringsoversikt – Naturskade", "coverage"],
  ["hytte.glass.egenandel", "Bygningsglass – egenandel",
    "Publisert forsikringsoversikt oppgir 3 000 kr.", 1, "Forsikringsoversikt – Bygningsglass", "coverage"],
];

const facts: Record<string, CatalogFact[]> = {
  "landkreditt-reise": withTerms("landkreditt-reise", "landkreditt-reise", landkredittTravel),
  "watercircles-reise-standard": withTerms("watercircles-reise-standard", "watercircles-reise", waterCirclesTravel(false)),
  "watercircles-reise-elite": withTerms("watercircles-reise-elite", "watercircles-reise", waterCirclesTravel(true)),
  "watercircles-innbo-standard": withTerms("watercircles-innbo-standard", "watercircles-innbo", [
    ...waterCirclesContents,
    ["innbo.frysevarer", "Matvarer i fryser", "Inntil 10 000 kr ved dekket skade.", 7, "A.5.4 punkt 1"],
  ]),
  "watercircles-innbo-elite": withTerms("watercircles-innbo-elite", "watercircles-innbo", waterCirclesContents),
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
