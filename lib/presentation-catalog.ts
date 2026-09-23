import { vehicleObjectTypes, vehicleObjectCoverages } from "./vehicle-object-registry.ts";
export type PresentationInsuranceType = "bil" | "innbo" | "bolig" | "reise" | "snøscooter" | "campingvogn" | "tilhenger";
export type PresentationTier = "primary" | "secondary" | "detail";
export type PresentationFactType =
  | "coverage"
  | "limit"
  | "deductible"
  | "restriction"
  | "service"
  | "conditional-benefit";
export type ImportanceReason =
  | "economic-risk"
  | "level-difference"
  | "misunderstanding-risk"
  | "frequently-highlighted"
  | "customer-specific";

export type PresentationConcept = {
  id: string;
  insuranceType: PresentationInsuranceType;
  label: string;
  group: string;
  factKeyPatterns: readonly RegExp[];
  defaultTier: PresentationTier;
  importanceReasons: readonly ImportanceReason[];
  factTypes: readonly PresentationFactType[];
};

export type PresentationEvidence = {
  id: string;
  providerId: string;
  distributionChannel?: string;
  insuranceType: PresentationInsuranceType;
  productLevels: readonly string[];
  conceptId: string;
  status: PresentationTier | "not-highlighted";
  classifications: readonly (
    | "coverage"
    | "limit"
    | "restriction"
    | "service"
    | "conditional-benefit"
    | "marketing"
    | "level-difference"
  )[];
  url: string;
  supportingSources?: readonly { label: string; url: string }[];
  checkedAt: string;
  note?: string;
};

export type ConditionalBenefitFact = {
  label: "Krav" | "Startbonus" | "Ungførerfordel" | "Egenandelsregel" | "Annen fordel";
  value: string;
};

export type ConditionalBenefit = {
  id: string;
  providerId: string;
  providerName: string;
  distributionChannel: string;
  insuranceType: PresentationInsuranceType;
  conceptId: string;
  label: string;
  type: "conditional-benefit";
  facts: readonly ConditionalBenefitFact[];
  audience: string;
  evidenceId: string;
};

export type ConditionalBenefitAudit = {
  providerId: string;
  providerName: string;
  distributionChannel: string;
  insuranceType: PresentationInsuranceType;
  conceptId: string;
  status: "documented" | "not-documented";
  checkedAt: string;
  officialUrls: readonly string[];
  classifications: readonly ("conditional-benefit" | "ordinary-bonus" | "coverage" | "discount-campaign" | "service-app")[];
  note: string;
};

const concept = (
  id: string,
  insuranceType: PresentationInsuranceType,
  label: string,
  factKeyPatterns: readonly RegExp[],
  defaultTier: PresentationTier,
  importanceReasons: readonly ImportanceReason[],
  factTypes: readonly PresentationFactType[] = ["coverage", "limit", "deductible", "restriction"],
): PresentationConcept => ({
  id, insuranceType, label, group: label, factKeyPatterns, defaultTier, importanceReasons, factTypes,
});

// Rekkefølgen er en eksplisitt, kuratert presentasjonsrekkefølge. Den er ikke
// en produktpoengsum og sier ikke hvilket produkt som er best.
export const presentationConcepts: readonly PresentationConcept[] = [
  ...vehicleObjectTypes.flatMap(({ id }) => vehicleObjectCoverages(id).map((coverage) =>
    concept(`${id}.${coverage.parentKey.split(".")[1]}`, id, coverage.label,
      [new RegExp(`^${coverage.parentKey.slice(0, -"dekning".length).replaceAll(".", "\\.")}`, "u")],
      "primary", ["economic-risk", "level-difference"]))),
  concept("bil.egen-bil", "bil", "Skade på egen bil", [
    /^(?:kasko|parkering|haerverk|feilfylling|reparasjon|tilbehor|bilnokkel|bagasje|leasing)\./u,
  ], "primary", ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("bil.maskinskade", "bil", "Maskinskade", [/^maskinskade\./u], "primary",
    ["economic-risk", "level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("bil.totalskade", "bil", "Totalskade og nybil", [/^(?:nyverdi|totalskade)\./u], "primary",
    ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("bil.mobilitet", "bil", "Mobilitet", [/^(?:leiebil|veihjelp|transport)\./u], "primary",
    ["level-difference", "frequently-highlighted"]),
  concept("bil.ovelseskjoring", "bil", "Øvelseskjøring og ung fører", [], "secondary",
    ["customer-specific", "misunderstanding-risk", "frequently-highlighted"], ["conditional-benefit"]),
  concept("bil.glass-redning", "bil", "Glass og redning", [/^glass\./u], "secondary",
    ["frequently-highlighted"]),
  concept("bil.elbil", "bil", "Elbil", [/^(?:ladekabel|ladeutstyr|batteri)\./u], "secondary",
    ["level-difference"]),
  concept("bil.forer-passasjer", "bil", "Fører og passasjer", [/^ulykke\./u], "secondary",
    ["economic-risk", "level-difference"]),
  concept("bil.ansvar-rettshjelp", "bil", "Ansvar og rettshjelp", [/^(?:ansvar|rettshjelp)\./u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("bil.bonus-ung-forer", "bil", "Bonus og ung fører", [/^bonus\./u], "secondary",
    ["customer-specific", "misunderstanding-risk"], ["limit", "conditional-benefit"]),
  concept("bil.ovrig", "bil", "Andre bilvilkår", [/.+/u], "detail", ["misunderstanding-risk"]),

  concept("innbo.forsikringssum", "innbo", "Forsikringssum", [
    /^innbo\.(?:forsikringssum|andres|basseng|datalager|fritidsbat|fritidsbattilbehor|hobbyveksthus|kjoretoytilbehor|kunst|luftvannsport|motorredskap|penger|samling|smabygg|tilhenger|tilleggsinnredning|vaesketap|verdigjenstander|yrkeslosore)\b/u,
  ], "primary", ["economic-risk", "misunderstanding-risk", "frequently-highlighted"]),
  concept("innbo.uhell", "innbo", "Uhell", [/^uhell\./u], "primary",
    ["economic-risk", "level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("innbo.tyveri", "innbo", "Tyveri", [/^(?:tyveri|ran)\./u], "primary",
    ["economic-risk", "frequently-highlighted"]),
  concept("innbo.sykkel-verdi", "innbo", "Sykkel og verdigjenstander", [
    /^(?:sykkel|mobil|bunad)\./u, /^innbo\.verdigjenstander\./u,
  ], "primary", ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("innbo.brann-vann-natur", "innbo", "Brann, vann og natur", [/^(?:brann|vann|naturskade|elektrisk)\./u], "primary",
    ["economic-risk", "frequently-highlighted"]),
  concept("innbo.skadedyr", "innbo", "Skadedyr", [/^skadedyr\./u], "secondary",
    ["level-difference", "frequently-highlighted"]),
  concept("innbo.flytting-bosted", "innbo", "Flytting og midlertidig bosted", [
    /^flytting\./u, /^innbo\.(?:lagring|opphold)\./u,
  ], "secondary", ["economic-risk", "level-difference"]),
  concept("innbo.ansvar-rettshjelp", "innbo", "Ansvar og rettshjelp", [/^(?:ansvar|rettshjelp)\./u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("innbo.id-tjenester", "innbo", "ID- og netthjelp", [/^(?:idtyveri|nettmisbruk|krise)\./u], "secondary",
    ["level-difference"], ["coverage", "limit", "service"]),
  concept("innbo.ovrig", "innbo", "Andre innbovilkår", [/.+/u], "detail", ["misunderstanding-risk"]),

  concept("hus.gjenoppforing", "bolig", "Gjenoppføring og totalskade", [
    /^hus\.(?:forsikringsform|forsikringssum|gjenoppforing|pabud|rydding|brukstap)\b/u,
  ], "primary", ["economic-risk", "misunderstanding-risk", "frequently-highlighted"]),
  concept("hus.vann-fukt", "bolig", "Vann og fukt", [
    /^hus\.(?:vann|vannoverflate|ror|takvegg)\./u,
    /^hus\.aldersfradrag\.(?:bereder_pumpe|oppvarming_vvs|tanker|tanker_kummer|utvendige_ledninger|utvendige_ledninger_tanker|utvendige_ror|varmekabler_bereder|varmtvannsbereder_pumper)\b/u,
  ], "primary", ["economic-risk", "level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("hus.vatrom", "bolig", "Våtrom", [
    /^hus\.vatrom\./u, /^hus\.aldersfradrag\.(?:badeinnretning|tak_vatrom)\b/u,
  ], "primary", ["economic-risk", "level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("hus.handverker", "bolig", "Håndverker- og konstruksjonsfeil", [/^hus\.handverker\./u], "primary",
    ["economic-risk", "level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("hus.plutselig", "bolig", "Plutselig skade", [/^hus\.plutselig\./u], "primary",
    ["economic-risk", "level-difference", "misunderstanding-risk"]),
  concept("hus.vaer-natur", "bolig", "Vær og natur", [/^hus\.(?:vaer|naturskade|snovejr)\./u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("hus.rate-skadedyr", "bolig", "Råte og skadedyr", [/^hus\.(?:rate|skadedyr)\./u], "primary",
    ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("hus.utleie-bosted", "bolig", "Utleie og midlertidig bosted", [/^hus\.(?:utleie|leietap)\./u], "secondary",
    ["economic-risk", "customer-specific"]),
  concept("hus.ansvar-rettshjelp", "bolig", "Ansvar og rettshjelp", [/^hus\.(?:ansvar|rettshjelp)\./u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("hus.tjenester", "bolig", "Boligtjenester", [/^hus\.service\./u], "secondary",
    ["level-difference"], ["service"]),
  concept("hus.aldersfradrag", "bolig", "Aldersfradrag", [/^hus\.aldersfradrag\./u], "detail",
    ["economic-risk", "misunderstanding-risk"], ["deductible", "restriction"]),
  concept("hus.ovrig", "bolig", "Andre husvilkår", [/.+/u], "detail", ["misunderstanding-risk"]),

  concept("reise.rammer", "reise", "Reisens rammer", [
    /^reise\.(?:varighet|omrade|overnatting|tjenestereise|personer)\b/u,
  ], "primary", ["level-difference", "misunderstanding-risk", "frequently-highlighted"]),
  concept("reise.avbestilling", "reise", "Avbestilling", [/^reise\.avbestilling\./u], "primary",
    ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("reise.sykdom-hjemtransport", "reise", "Sykdom og hjemtransport", [
    /^reise\.(?:medisinsk|hjemtransport|sykeledsagelse|hjemkallelse)\b/u,
  ], "primary", ["economic-risk", "misunderstanding-risk", "frequently-highlighted"]),
  concept("reise.bagasje", "reise", "Bagasje", [/^reise\.bagasje\./u], "primary",
    ["economic-risk", "level-difference", "frequently-highlighted"]),
  concept("reise.forsinkelse", "reise", "Forsinkelse", [/^reise\.forsinkelse\./u], "secondary",
    ["level-difference", "frequently-highlighted"]),
  concept("reise.reiseavbrudd", "reise", "Reiseavbrudd", [/^reise\.reiseavbrudd\b/u], "secondary",
    ["economic-risk", "level-difference"]),
  concept("reise.ulykke", "reise", "Ulykke", [/^reise\.ulykke\./u], "secondary",
    ["economic-risk", "level-difference"]),
  concept("reise.leiebil", "reise", "Leiebil", [/^reise\.leiebil\./u], "secondary",
    ["economic-risk", "level-difference"]),
  concept("reise.evakuering", "reise", "Evakuering og UD", [/^reise\.(?:evakuering|omrade\.ud)\b/u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("reise.ansvar-rettshjelp", "reise", "Ansvar og rettshjelp", [/^reise\.(?:ansvar|rettshjelp)\./u], "secondary",
    ["economic-risk", "misunderstanding-risk"]),
  concept("reise.tjenester", "reise", "Reisetjenester", [/^reise\.tjeneste\./u], "secondary",
    ["level-difference"], ["service"]),
  concept("reise.ovrig", "reise", "Andre reisevilkår", [/.+/u], "detail", ["misunderstanding-risk"]),
];

export const presentationEvidence: readonly PresentationEvidence[] = [
  {
    id: "tryg-bil-ovelseskjoring-2026-09-21",
    providerId: "tryg",
    distributionChannel: "Tryg",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Bil Ekstra"],
    conceptId: "bil.ovelseskjoring",
    status: "primary",
    classifications: ["conditional-benefit", "service"],
    url: "https://www.tryg.no/privat/tryg-vei-til-lappen/sporsmal-og-svar-om-appen",
    supportingSources: [
      { label: "Tryg vei til lappen", url: "https://www.tryg.no/privat/tryg-vei-til-lappen" },
      { label: "Kasko PAU25205", url: "https://www.tryg.no/odpdf?vilk=Bilforsikring-Kasko&vilkNr=05PAU25205" },
    ],
    checkedAt: "2026-09-21",
    note: "2 000 km i appen gir fordelskode, 70 % startbonus, ungførerfordel og unntak fra 5 000 kr utvidet kaskoegenandel.",
  },
  {
    id: "gjensidige-bil-ovelseskjoring-2026-09-21",
    providerId: "gjensidige",
    distributionChannel: "Gjensidige",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Pluss"],
    conceptId: "bil.ovelseskjoring",
    status: "primary",
    classifications: ["conditional-benefit"],
    url: "https://www.gjensidige.no/forsikring/bilforsikring/ovelseskjoring",
    supportingSources: [
      { label: "Bil Kasko-vilkår", url: "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bil-Kasko-alminnelige-vilkar.pdf" },
    ],
    checkedAt: "2026-09-21",
    note: "Fordelen krever 2 000 registrerte kilometer før bestått førerprøve.",
  },
  {
    id: "if-bil-ovelseskjoring-2026-09-21",
    providerId: "if",
    distributionChannel: "If",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Super"],
    conceptId: "bil.ovelseskjoring",
    status: "primary",
    classifications: ["conditional-benefit", "service", "marketing"],
    url: "https://www.if.no/privat/forsikring/bilforsikring/bruksbasert-bilforsikring/ovelseskjoring",
    supportingSources: [
      { label: "Brukervilkår", url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bruksbasert_%C3%B8velseskj%C3%B8ring" },
    ],
    checkedAt: "2026-09-21",
    note: "Aktive brukervilkår krever bruk av appen under øvelseskjøring, men setter ingen minimumsgrense for kilometer.",
  },
  {
    id: "sparebank1-fremtind-bil-ovelseskjoring-2026-09-21",
    providerId: "sparebank1-fremtind",
    distributionChannel: "SpareBank 1",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Toppkasko"],
    conceptId: "bil.ovelseskjoring",
    status: "primary",
    classifications: ["conditional-benefit", "marketing"],
    url: "https://www.sparebank1.no/nb/bank/privat/forsikring/bilforsikring/rabatt-ovelseskjoring-app.html",
    checkedAt: "2026-09-21",
    note: "Kanalspesifikk side dokumenterer 2 000 km i valgfri øvelseskjøringsapp, 70 % startbonus og rabatt på ung-sjåfør-tillegget.",
  },
  {
    id: "dnb-fremtind-bil-ovelseskjoring-2026-09-21",
    providerId: "dnb-fremtind",
    distributionChannel: "DNB",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Topp"],
    conceptId: "bil.ovelseskjoring",
    status: "primary",
    classifications: ["conditional-benefit", "marketing"],
    url: "https://www.dnb.no/forsikring/bilforsikring/ovelseskjoring",
    checkedAt: "2026-09-21",
    note: "Kanalspesifikk side dokumenterer 2 000 km, bestått førerprøve, 70 % startbonus og rabatt på ung-sjåfør-tillegget.",
  },
  {
    id: "storebrand-bil-ovelseskjoring-2026-09-21",
    providerId: "storebrand",
    distributionChannel: "Storebrand",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Super"],
    conceptId: "bil.ovelseskjoring",
    status: "secondary",
    classifications: ["conditional-benefit", "coverage"],
    url: "https://www.storebrand.no/privat/forsikring/bilforsikring/ovelseskjoring-og-forsikring",
    supportingSources: [
      { label: "Motorvognvilkår", url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f%3Acbfd16debeefe146886097a6ea0ef4bcf9324d2b/vilkar-motorvognforsikring.pdf" },
    ],
    checkedAt: "2026-09-21",
    note: "Ingen app- eller kilometerfordel funnet; Storebrand dokumenterer i stedet at skade under lovlig øvelseskjøring ikke gir bonustap.",
  },
  {
    id: "frende-bil-ovelseskjoring-2026-09-21",
    providerId: "frende",
    distributionChannel: "Frende",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Utvidet"],
    conceptId: "bil.ovelseskjoring",
    status: "secondary",
    classifications: ["conditional-benefit", "marketing"],
    url: "https://www.frende.no/forsikringer/bilforsikring/",
    checkedAt: "2026-09-21",
    note: "Ingen app- eller kilometerfordel funnet; bileieren beholder rabatten for førere over 23 år under lovlig øvelseskjøring.",
  },
  {
    id: "tryg-bil-levels-2026-09-21",
    providerId: "tryg",
    insuranceType: "bil",
    productLevels: ["Ansvar", "Delkasko", "Kasko", "Bil Ekstra"],
    conceptId: "bil.ansvar-rettshjelp",
    status: "secondary",
    classifications: ["coverage", "level-difference"],
    url: "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Bilforsikring.pdf",
    checkedAt: "2026-09-21",
    note: "IPID viser Ansvar med Rettshjelp, Delkasko og Kasko som Delkasko pluss kaskodekning.",
  },
  {
    id: "tryg-innbo-uhell-2026-09-21",
    providerId: "tryg",
    insuranceType: "innbo",
    productLevels: ["Innbo Ekstra"],
    conceptId: "innbo.uhell",
    status: "primary",
    classifications: ["coverage", "restriction", "level-difference"],
    url: "https://www.tryg.no/forsikringer/bolig-og-innbo/innboforsikring/hva-dekker-innboforsikringen",
    checkedAt: "2026-09-21",
    note: "Produktsiden fremhever Uhell i og utenfor hjemmet i hele Norden.",
  },
];

export const conditionalBenefits: readonly ConditionalBenefit[] = [
  {
    id: "tryg-vei-til-lappen",
    providerId: "tryg",
    providerName: "Tryg",
    distributionChannel: "Tryg",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "Tryg vei til lappen",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "2 000 km registrert i «Tryg vei til lappen»; den som øvelseskjører bruker appen og oppgir fordelskoden til Tryg" },
      { label: "Startbonus", value: "70 % på den første bilforsikringen hos Tryg" },
      { label: "Ungførerfordel", value: "Fører under 23 år kan kjøre en Tryg-forsikret bil uten ekstra ungførerkostnad" },
      { label: "Egenandelsregel", value: "5 000 kr utvidet kaskoegenandel for fører under 23 år gjelder ikke etter 2 000 km med appen" },
    ],
    audience: "Den som øvelseskjører; startbonusen gjelder førstegangseier av bilforsikring, og ungførerfordelene gjelder kvalifisert fører under 23 år",
    evidenceId: "tryg-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "gjensidige-ovelseskjoring",
    providerId: "gjensidige",
    providerName: "Gjensidige",
    distributionChannel: "Gjensidige",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "Gjensidige Øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "2 000 km registrert i Gjensidiges øvelseskjøringsapp før bestått førerprøve" },
      { label: "Startbonus", value: "70 % på den første bilforsikringen hos Gjensidige" },
      { label: "Ungførerfordel", value: "Kan låne en Gjensidige-forsikret bil uten at bileieren betaler ekstra selv om føreren er under 23 år" },
      { label: "Egenandelsregel", value: "15 000 kr forhøyet egenandel ved uregistrert fører under 23 år gjelder ikke når føreren har gjennomført programmet" },
    ],
    audience: "Ny bilforsikringskunde som har fullført øvelseskjøringskravet",
    evidenceId: "gjensidige-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "if-bruksbasert-ovelseskjoring",
    providerId: "if",
    providerName: "If",
    distributionChannel: "If",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "Bruksbasert øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "Bruk Ifs app under øvelseskjøringen; aktive brukervilkår har ingen minimumsgrense for kilometer" },
      { label: "Startbonus", value: "70 % på øvelseskjørerens første fremtidige bilforsikring hos If; kan brukes innen 8 år etter registrering" },
      { label: "Ungførerfordel", value: "If-kunder kan låne bort bilen til appbrukeren uten ekstra gebyr for ung fører; gebyret faller uansett bort ved 23 år" },
    ],
    audience: "Alle som øvelseskjører; verken øvelseskjører eller ledsager trenger å være If-kunde under opptjeningen",
    evidenceId: "if-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "sparebank1-fremtind-ovelseskjoring",
    providerId: "sparebank1-fremtind",
    providerName: "Fremtind",
    distributionChannel: "SpareBank 1",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "SpareBank 1 øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "Minst 2 000 km registrert i en øvelseskjøringsapp" },
      { label: "Startbonus", value: "70 % når det er første gang øvelseskjøreren kjøper bilforsikring" },
      { label: "Ungførerfordel", value: "Inntil 2 000 kr rabatt per år på bileierens tillegg for sjåfør under 23 år" },
    ],
    audience: "Førstegangskjøper av bilforsikring og bileier som låner bilen til kvalifisert fører under 23 år",
    evidenceId: "sparebank1-fremtind-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "dnb-fremtind-ovelseskjoring",
    providerId: "dnb-fremtind",
    providerName: "Fremtind",
    distributionChannel: "DNB",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "DNB øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "2 000 km dokumentert øvelseskjøring og bestått førerprøve; kontakt DNB for å få fordelene" },
      { label: "Startbonus", value: "70 % på den første bilforsikringen hos DNB" },
      { label: "Ungførerfordel", value: "Inntil 2 000 kr rabatt på ung-sjåfør-tillegget når bilen lånes til kvalifisert fører under 23 år" },
    ],
    audience: "Førstegangskjøper av bilforsikring og bileier som låner bilen til kvalifisert fører under 23 år",
    evidenceId: "dnb-fremtind-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "storebrand-ovelseskjoring-bonus",
    providerId: "storebrand",
    providerName: "Storebrand",
    distributionChannel: "Storebrand",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "Storebrand øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "Lovlig øvelseskjøring med ledsager; ingen app- eller kilometergrense er dokumentert" },
      { label: "Annen fordel", value: "Skade under øvelseskjøring gir ikke bonustap, og egenandelen er den samme" },
    ],
    audience: "Bileier med Storebrand-forsikring under øvelseskjøring; etter bestått førerprøve må fører under 23 år meldes inn",
    evidenceId: "storebrand-bil-ovelseskjoring-2026-09-21",
  },
  {
    id: "frende-ovelseskjoring-ungforer",
    providerId: "frende",
    providerName: "Frende",
    distributionChannel: "Frende",
    insuranceType: "bil",
    conceptId: "bil.ovelseskjoring",
    label: "Frende øvelseskjøring",
    type: "conditional-benefit",
    facts: [
      { label: "Krav", value: "Lovlig øvelseskjøring; ingen app- eller kilometergrense er dokumentert" },
      { label: "Ungførerfordel", value: "Bileieren beholder rabatten for at alle bilførere er over 23 år mens den som øvelseskjører er under aldersgrensen" },
    ],
    audience: "Bileier med Frende-forsikring under øvelseskjøring",
    evidenceId: "frende-bil-ovelseskjoring-2026-09-21",
  },
];

export const conditionalBenefitAudits: readonly ConditionalBenefitAudit[] = [
  {
    providerId: "tryg", providerName: "Tryg", distributionChannel: "Tryg", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.tryg.no/privat/tryg-vei-til-lappen", "https://www.tryg.no/odpdf?vilk=Bilforsikring-Kasko&vilkNr=05PAU25205"],
    classifications: ["conditional-benefit", "ordinary-bonus", "service-app"],
    note: "Appfordel med startbonus, ungførerfordel og egenandelsunntak; ordinær startbonus er separat.",
  },
  {
    providerId: "if", providerName: "If", distributionChannel: "If", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.if.no/privat/forsikring/bilforsikring/bruksbasert-bilforsikring/ovelseskjoring", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bruksbasert_%C3%B8velseskj%C3%B8ring"],
    classifications: ["conditional-benefit", "ordinary-bonus", "discount-campaign", "service-app"],
    note: "Appbruk gir forsikringsfordeler; trafikkskolerabatt og mulig fremtidig kjørescorerabatt er holdt utenfor sammenligningen.",
  },
  {
    providerId: "gjensidige", providerName: "Gjensidige", distributionChannel: "Gjensidige", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.gjensidige.no/forsikring/bilforsikring/ovelseskjoring", "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bil-Kasko-alminnelige-vilkar.pdf"],
    classifications: ["conditional-benefit", "ordinary-bonus", "service-app"],
    note: "Appfordel med startbonus, ungførerfordel og unntak fra forhøyet egenandel; Ungdomsavtalen er en annen ordning.",
  },
  {
    providerId: "storebrand", providerName: "Storebrand", distributionChannel: "Storebrand", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.storebrand.no/privat/forsikring/bilforsikring/ovelseskjoring-og-forsikring", "https://www.storebrand.no/privat/forsikring/bilforsikring"],
    classifications: ["conditional-benefit", "ordinary-bonus", "coverage"],
    note: "Ingen appfordel funnet; dokumentert fordel gjelder bonustap og egenandel under selve øvelseskjøringen.",
  },
  {
    providerId: "sparebank1-fremtind", providerName: "Fremtind", distributionChannel: "SpareBank 1", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.sparebank1.no/nb/bank/privat/forsikring/bilforsikring/rabatt-ovelseskjoring-app.html"],
    classifications: ["conditional-benefit", "ordinary-bonus", "discount-campaign", "service-app"],
    note: "Kanalspesifikk fordel; er ikke brukt som bevis for DNB eller Eika.",
  },
  {
    providerId: "dnb-fremtind", providerName: "Fremtind", distributionChannel: "DNB", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.dnb.no/forsikring/bilforsikring/ovelseskjoring", "https://www.dnb.no/forsikring/bilforsikring/bonus-bilforsikring"],
    classifications: ["conditional-benefit", "ordinary-bonus", "discount-campaign", "service-app"],
    note: "Kanalspesifikk fordel; er ikke arvet fra SpareBank 1-metadata.",
  },
  {
    providerId: "eika-fremtind", providerName: "Fremtind", distributionChannel: "Eika", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "not-documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.eikaforsikring.no/alle-forsikringer/vilkar", "https://www.eikaforsikring.no/kundeservice/sporsmal-og-svar/bil-og-andre-kjoretoy/bil"],
    classifications: ["ordinary-bonus", "coverage"],
    note: "Aktive nytegningskilder dokumenterer bonusregler og lovkrav ved øvelseskjøring, men ikke en tilsvarende kilometer-, startbonus- eller ungførerfordel.",
  },
  {
    providerId: "frende", providerName: "Frende", distributionChannel: "Frende", insuranceType: "bil",
    conceptId: "bil.ovelseskjoring", status: "documented", checkedAt: "2026-09-21",
    officialUrls: ["https://www.frende.no/forsikringer/bilforsikring/", "https://www.frende.no/forsikringer/bilforsikring/bonus/"],
    classifications: ["conditional-benefit", "ordinary-bonus"],
    note: "Ingen appfordel funnet; dokumentert fordel er at over-23-rabatten beholdes under selve øvelseskjøringen.",
  },
];

export function conceptsForInsurance(insuranceType: string): readonly PresentationConcept[] {
  return presentationConcepts.filter((entry) => entry.insuranceType === insuranceType);
}

export function conceptForFactKey(insuranceType: string, key: string): PresentationConcept | null {
  return conceptsForInsurance(insuranceType).find((entry) =>
    entry.factKeyPatterns.some((pattern) => pattern.test(key))
  ) ?? null;
}

export function evidenceById(id: string): PresentationEvidence | null {
  return presentationEvidence.find((entry) => entry.id === id) ?? null;
}
