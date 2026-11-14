import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Row = readonly [
  key: string, label: string, value: string, section: string, page: number,
  availability?: CatalogFact["coverageAvailability"],
  deductible?: CatalogFact["deductibleClassification"],
];

type Document = {
  url: string;
  sha256: string;
  pages: number;
  termsNumber?: string;
  effectiveFrom?: string;
};

const documents: Record<string, Document> = {
  "klp-innbo": {
    url: "https://www.klp.no/media/forsikring/Vilkar-Innbo.pdf",
    sha256: "9661463326aa675b91b541ced693b9c5a3bcf9b92813f60abde5e34a55aa1b4a", pages: 15,
  },
  "klp-innbo-maks": {
    url: "https://www.klp.no/media/forsikring/Vilkar-Innbo-Maks.pdf",
    sha256: "7e44a5f33916d244b3c358a5d0a6b2fd07ade423b579ef404402742012785a1f", pages: 20,
  },
  "klp-reise": {
    url: "https://www.klp.no/media/forsikring/Reise.pdf",
    sha256: "73a8d7c5471634ec6fbc229d0dae056a28034aff41dbf57fcbe70a4360074729", pages: 22,
  },
  "klp-reise-maks": {
    url: "https://www.klp.no/media/forsikring/Vilkar-Reise-Maks.pdf",
    sha256: "7e8f7cfe8a86bf83a7d0a26590fb080c908246a41807c1221c750729d4f9681b", pages: 22,
  },
  "klp-reise-oversikt": {
    url: "https://www.klp.no/forsikring/reiseforsikring",
    sha256: "0cecb7a02ca6d2a629c0fe6d9795c322933ecac9406023d25238b61234719f0f", pages: 0,
  },
  "landkreditt-innbo": {
    url: "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-innbo.pdf",
    sha256: "33e1be7a9dfea8f82e04b96ff78d28d102017752071262a0c07389a5f32ce6e5", pages: 24,
    effectiveFrom: "2026-08-01",
  },
  "landkreditt-reise": {
    url: "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-reise.pdf",
    sha256: "40de3aee9b92e86e7362d1dad246887f53c9feb2ad2ee2c49b97123f02152e88", pages: 22,
    effectiveFrom: "2026-05-01",
  },
  "watercircles-innbo": {
    url: "https://www.watercircles.no/wp-content/uploads/2025/12/WaterCircles-Innbo-og-losore-vilkar-WtCIBO-2.17-01.01.26.pdf",
    sha256: "9e1ea298ce19a346766c27710077e72adc39d342ccf7b81621d0ad26789e3783", pages: 19,
    termsNumber: "WtCIBO-2.17", effectiveFrom: "2026-01-01",
  },
  "watercircles-reise": {
    url: "https://www.watercircles.no/wp-content/uploads/2026/06/WaterCircles-Reise-vilkar-WtCREI-2.17-01.08.2026.pdf",
    sha256: "70291d41311f5d5e5f407866b91ed1eb0291a36e1cfc1ea190aa127261756128", pages: 19,
    termsNumber: "WtCREI-2.17", effectiveFrom: "2026-08-01",
  },
  "watercircles-reise-oversikt": {
    url: "https://www.watercircles.no/privat/privatforsikringer/reise/",
    sha256: "453eed596c07105b86444e68e999066d43fe34d6dc9a85a43efe74a402ce3fbe", pages: 0,
  },
};

const klpInnbo: readonly Row[] = [
  ["innbo.forsikringssum", "Samlet forsikringssum", "Valgt forsikringssum står i forsikringsbeviset.", "Hva forsikringen omfatter", 1],
  ["brann.dekning", "Brann", "Plutselig og uforutsett brann, nedsoting, lynnedslag og eksplosjon.", "Standard dekning – Innbo", 1],
  ["vann.dekning", "Vannskade", "Dekker blant annet vann fra terreng når det står synlig vann over laveste gulv, og inntrenging gjennom utetthet etter en plutselig dekket bygningsskade.", "Standard dekning – Innbo", 2],
  ["naturskade.dekning", "Naturskade", "Naturskade i samsvar med naturskadeforsikringsloven.", "Standard dekning – Innbo", 2],
  ["tyveri.dekning", "Tyveri", "Tyveri fra boligen og nærmere angitte steder, med særgrenser utenfor boligen.", "Standard dekning – Innbo", 2],
];

const klpReise: readonly Row[] = [
  ["bagasje.forsinket", "Forsinket bagasje", "Ved minst 4 timers forsinkelse dekkes klær og toalettsaker med inntil 5 000 kr per person på feriestedet. Leie av forsinket sportsutstyr m.m. har en egen grense på 5 000 kr per person.", "Forsinkelse", 1],
  ["avbestilling.dekning", "Avbestilling", "Forhåndsbetalt reise og opphold ved angitte hendelser, blant annet akutt sykdom, ulykke eller dødsfall. Sykdom eller skade må dokumenteres av lege.", "Avbestilling", 2],
  ["medisinsk.behandling", "Akutt sykdom og skade på reise", "Nødvendige merutgifter ved uventet og akutt sykdom, ulykkesskade eller uventet akutt forverring av sykdom.", "Sykeutgifter", 4],
  ["hjemtransport.dekning", "Hjemtransport", "Nødvendige merutgifter til fremskyndet hjemreise i Norge, blant annet ved egen akutt sykdom, ulykkesskade eller dødsfall.", "Hjemtransport", 5],
];

const landkredittInnbo: readonly Row[] = [
  ["brann.dekning", "Brann", "Plutselig og uforutsett brann, nedsoting, lynnedslag eller annet elektrisk fenomen.", "4.1 a", 5],
  ["vann.dekning", "Vannskade", "Blant annet utilsiktet væske fra bygningsrør eller plutselig overflatevann som gir vannspeil over laveste gulv.", "4.1 c", 5],
  ["tyveri.dekning", "Tyveri", "Tyveri på de stedene vilkåret angir, med egne beløpsgrenser ved flere oppbevaringssteder.", "4.1 d", 5],
  ["sykkel.tyveri.grense", "Sykkel og elsykkel – tyverigrense", "30 000 kr per gjenstand utenfor låst bygning, med mindre forsikringsbeviset angir annet.", "4.1 d viii", 6],
  ["egenandel.standard", "Generell egenandel", "Trekkes etter beløpet i forsikringsbeviset.", "5.2", 8, undefined, "reference"],
];

const watercirclesInnbo: readonly Row[] = [
  ["brann.dekning", "Brann", "Brann, plutselig nedsoting og eksplosjon. Svi- og gnistskader uten brann er unntatt.", "A.1.1", 3],
  ["vann.dekning", "Vannskade", "Blant annet utstrømming fra rørledning ved brudd eller lekkasje, og plutselig inntrenging fra terreng med synlig frittstående vann over laveste gulv.", "A.1.4", 4],
  ["innbo.forsikringssum", "Samlet forsikringssum", "Forsikringsbeviset angir innbosummen. Innenfor den gjelder blant annet en særgrense på 500 000 kr for enkeltgjenstander og samlinger, med mulighet for økt avtalt sum.", "A.2.1", 5],
  ["egenandel.standard", "Generell egenandel", "Avtalt egenandel i forsikringsbeviset, med mindre vilkårene angir en særskilt egenandel.", "A.6.3", 7, undefined, "reference"],
];

const watercirclesReise: readonly Row[] = [
  ["varighet.avtalt", "Avtalt reisevarighet", "Forsikringsbeviset angir reisevarigheten. Perioden regnes fra man forlater registrert bostedsadresse til retur dit.", "1.1", 3],
  ["bagasje.forsinket", "Forsinket bagasje", "Utgifter til klær og toalettsaker når innsjekket bagasje er minst 4 timer forsinket til reisemålet, inntil 6 000 kr per person og 20 000 kr per familie. Hjemreise er unntatt.", "3.5", 6],
  ["medisinsk.behandling", "Akutt sykdom og skade på reise", "Dekker dokumenterte merutgifter til medisinsk behandling ved uventet akutt sykdom eller ulykkesskade på reisen.", "5.2", 9],
  ["hjemtransport.dekning", "Hjemtransport", "Etter forhåndsgodkjenning dekkes angitt syketransport til behandlingssted eller hjemsted. Hjemreisen må være medisinsk forsvarlig.", "5.5 d", 10],
];

type ProductDefinition = {
  company: string;
  providerId: string;
  type: "Innbo" | "Reise";
  id: string;
  name: string;
  document: string;
  rows: readonly Row[];
  duration?: { document: string; value: string; section: string };
};

const definitions: ProductDefinition[] = [
  { company: "KLP", providerId: "klp", type: "Innbo", id: "klp-innbo", name: "Innbo", document: "klp-innbo", rows: klpInnbo },
  { company: "KLP", providerId: "klp", type: "Innbo", id: "klp-innbo-maks", name: "Innbo Maks", document: "klp-innbo-maks", rows: [
    ...klpInnbo,
    ["uhell.dekning", "Uhell", "Plutselige og uforutsette skader på eiendeler hjemme. Utenfor hjemmet gjelder dekningen i hele verden ved plutselig ytre årsak, med særvilkår og sum i beviset.", "Utvidet dekning – Innbo Maks", 3],
    ["flytting.dekning", "Flytteforsikring", "Inntil 100 000 kr ved dokumentert skade eller tyveri under egen flytting til ny bolig i Norge, innenfor vilkårets transport- og bærevilkår.", "Utvidet dekning – Innbo Maks", 3],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av skadeinsekter, mus og rotter gjennom VIS opp til summen i forsikringsbeviset.", "Skadedyrbekjempelse", 7],
  ] },
  { company: "KLP", providerId: "klp", type: "Reise", id: "klp-reise", name: "Reise", document: "klp-reise", rows: klpReise,
    duration: { document: "klp-reise-oversikt", value: "50 sammenhengende dager fra avreise fra hjemmeadressen.", section: "Hvor mange dager gjelder reiseforsikringen?" } },
  { company: "KLP", providerId: "klp", type: "Reise", id: "klp-reise-maks", name: "Reise Maks", document: "klp-reise-maks", rows: [
    ...klpReise,
    ["leiebil.egenandel", "Leiebilegenandel", "Dokumentert egenandel ved ytre kaskoskade eller tyveri av leiebil eller leid motorsykkel på feriereise med minst én overnatting.", "Egenandel for leiebil", 6, "included"],
    ["bagasje.uhell", "Uhell på eiendeler", "Plutselig fysisk skade på personlige eiendeler med kjent ytre årsak og identifiserbart tidspunkt. Beløpsgrensen står i forsikringsbeviset.", "Uhellskader", 6],
  ], duration: { document: "klp-reise-oversikt", value: "70 sammenhengende dager fra avreise fra hjemmeadressen.", section: "Hvor mange dager gjelder reiseforsikringen?" } },
  { company: "Landkreditt", providerId: "landkreditt", type: "Innbo", id: "landkreditt-innbo-standard", name: "Innbo Standard", document: "landkreditt-innbo", rows: landkredittInnbo },
  { company: "Landkreditt", providerId: "landkreditt", type: "Innbo", id: "landkreditt-innbo-utvidet", name: "Innbo Utvidet", document: "landkreditt-innbo", rows: [
    ...landkredittInnbo,
    ["uhell.dekning", "Uhell", "Uflaksforsikringen omfatter angitte plutselige og uforutsette skader på eiendeler, med egne unntak for skader og gjenstander.", "9.1", 15],
    ["flytting.dekning", "Flytteforsikring", "Ved egen flytting i Norge dekkes angitte transportskader, tyveri fra låst bil/tilhenger og plutselig skade ved inn- og utbæring.", "10.1–10.2", 16],
    ["flytting.grense", "Flytting – grense", "100 000 kr.", "10.2", 17],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Skadedyrforsikring gjennom VIS er del av utvidet dekning. Bokollektiv og leietakere er unntatt.", "11–11.1", 17],
  ] },
  { company: "Landkreditt", providerId: "landkreditt", type: "Reise", id: "landkreditt-reise", name: "Reise", document: "landkreditt-reise", rows: [
    ["varighet.maks", "Maksimal reisevarighet", "Inntil 90 dager fra bostedsadressen i Norge, med mindre forsikringsbeviset sier noe annet.", "3", 5],
    ["bagasje.dekning", "Personlige eiendeler", "Reisegods, også ting lånt eller leid før avreise, dekkes opp til avtalt sum ved blant annet tyveri, skadeverk, naturskade og transportørbekreftet tap.", "4–4.1", 5],
    ["bagasje.per_gjenstand", "Enkeltgjenstander – grense", "50 000 kr med tilbehør per skadetilfelle innenfor forsikringssummen.", "4.3 a", 5],
    ["bagasje.forsinket", "Forsinket bagasje", "Ved transportørbekreftet forsinkelse over 4 timer dekkes klær og toalettsaker inntil 6 000 kr per sikret, med mindre annet er avtalt. Spesialbagasje kan gi en egen utgiftsdekning.", "5.1", 6],
    ["avbestilling.dekning", "Avbestilling", "Dokumenterte avbestillingskostnader før avreise ved angitte hendelser. Reise må være betalt før avreisedatoen.", "6.1–6.2", 7],
    ["leiebil.egenandel", "Leiebilegenandel", "Avtalt egenandel ved skade på eller tyveri av leiebil på fritidsreise med minst én overnatting. Kasko og gyldig førerkort kreves.", "7.1", 8, "included"],
    ["hjemtransport.dekning", "Hjemtransport", "Medisinsk nødvendig hjemtransport ved egen akutt sykdom eller ulykke, etter forhåndsgodkjenning fra Landkreditt eller SOS.", "9–9.1", 9],
    ["medisinsk.behandling", "Akutt sykdom og skade på reise", "Rimelige og nødvendige dokumenterte utgifter ved blant annet ulykke, akutt sykdom eller akutt forverring av kronisk lidelse. For lege og sykehus i Norden gjelder særregler om offentlig behandling.", "10.1–10.3", 10],
  ] },
  { company: "WaterCircles", providerId: "watercircles", type: "Innbo", id: "watercircles-innbo-standard", name: "Innbo Standard", document: "watercircles-innbo", rows: [
    ...watercirclesInnbo,
    ["sykkel.tyveri.grense", "Sykkel – tyverigrense", "20 000 kr for sykkel og sykkeltilhenger etter reglene om sykkeltyveri.", "A.1.5.4", 4],
  ] },
  { company: "WaterCircles", providerId: "watercircles", type: "Innbo", id: "watercircles-innbo-elite", name: "Innbo Elite", document: "watercircles-innbo", rows: [
    ...watercirclesInnbo,
    ["sykkel.tyveri.grense", "Sykkel – tyverigrense", "40 000 kr per sykkel etter de utvidede beløpsgrensene.", "E.2.2", 13],
    ["uhell.dekning", "Uhell", "Annen fysisk skade ved plutselig ytre årsak. Årsaken må være kjent, tidfestet og gjenstanden må kunne vises frem.", "E.1.3", 12],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av skadeinsekter, mus og rotter opp til 150 000 kr per skade. Dekker bekjempelse på forsikringsstedet, med unntak for blant annet bokollektiv og leietakere.", "F.1–4.1", 16],
  ] },
  { company: "WaterCircles", providerId: "watercircles", type: "Reise", id: "watercircles-reise-standard", name: "Reise Standard", document: "watercircles-reise", rows: [
    ...watercirclesReise,
    ["avbestilling.dekning", "Avbestilling", "Inntil 40 000 kr per person og 100 000 kr per familie ved de hendelsene vilkåret angir.", "2.3.1", 5],
  ], duration: { document: "watercircles-reise-oversikt", value: "Inntil 45 dager i hele verden. Avtalt varighet står i forsikringsbeviset.", section: "Du kan velge mellom" } },
  { company: "WaterCircles", providerId: "watercircles", type: "Reise", id: "watercircles-reise-elite", name: "Reise Elite", document: "watercircles-reise", rows: [
    ...watercirclesReise,
    ["avbestilling.dekning", "Avbestilling", "Inntil reisens pris ved de hendelsene vilkåret angir.", "2.3.1", 5],
    ["leiebil.egenandel", "Leiebilegenandel", "Refunderer egenandel etter leiekontrakten ved skade eller tyveri på feriereise med minst én overnatting. Blant annet leasing, helårs privatleie og bildeling er unntatt.", "1.10", 4, "included"],
  ], duration: { document: "watercircles-reise-oversikt", value: "Inntil 75 dager i hele verden. Avtalt varighet står i forsikringsbeviset.", section: "Du kan velge mellom" } },
];

export const newContentsTravelProducts: CatalogProduct[] = [];
export const newContentsTravelSources: Record<string, CatalogSource> = {};
export const newContentsTravelFacts: Record<string, CatalogFact[]> = {};

function registerSource(product: CatalogProduct, documentId: string, document: Document): CatalogSource {
  const source = newContentsTravelSources[documentId] ??= {
    id: documentId,
    filename: `${documentId}.${document.pages ? "pdf" : "html"}`,
    sourceType: document.pages ? "full_terms" : "product_page",
    providerId: product.providerId,
    company: product.company,
    insuranceType: product.insuranceType,
    termsNumber: document.termsNumber ?? "",
    effectiveFrom: document.effectiveFrom ?? "",
    url: document.url,
    sha256: document.sha256,
    ...(document.pages ? { physicalPages: [1, document.pages] } : {}),
    productIds: [],
  };
  source.productIds!.push(product.productId);
  return source;
}

function fact(source: CatalogSource, row: Row): CatalogFact {
  const [key, label, value, section, page, coverageAvailability, deductibleClassification] = row;
  return {
    key, label, value, coverageAvailability, deductibleClassification,
    source: {
      documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, section, page,
    },
  };
}

for (const definition of definitions) {
  const doc = documents[definition.document];
  const product: CatalogProduct = {
    company: definition.company, providerId: definition.providerId, insuranceType: definition.type,
    productId: definition.id, name: definition.name, sourceId: definition.document, componentIds: [definition.id],
    version: doc.termsNumber ?? doc.effectiveFrom ?? null,
  };
  newContentsTravelProducts.push(product);
  const source = registerSource(product, definition.document, doc);
  const rows = definition.rows.map((row) => fact(source, row));
  if (definition.duration) {
    const duration = definition.duration;
    const overview = registerSource(product, duration.document, documents[duration.document]);
    rows.push(fact(overview, ["varighet.maks", "Maksimal reisevarighet", duration.value, duration.section, 0]));
  }
  newContentsTravelFacts[product.productId] = rows;
}
