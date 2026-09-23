// Aliasgrupper er hele betegnelser. Delord og likhetsgrad brukes ikke til matching.
const insuranceAliases: Record<string, readonly string[]> = {
  bil: ["bil", "personbil", "privatbil", "motorvogn"],
  bolig: ["bolig", "hus", "hus bolig"],
  innbo: ["innbo"],
  reise: ["reise"],
  båt: ["båt", "småbåt"],
  mc: ["mc", "motorsykkel"],
  bobil: ["bobil"],
  campingvogn: ["campingvogn", "caravan"],
  moped: ["moped"],
  atv: ["atv"],
  snøscooter: ["snøscooter", "snescooter"],
  traktor: ["traktor"],
  varebil: ["varebil"],
  lastebil: ["lastebil"],
  hund: ["hund", "hunde"],
  katt: ["katt", "katte"],
  barn: ["barn", "barne"],
  ulykke: ["ulykke", "ulykkes"],
  liv: ["liv", "livs"],
  // Fritidsbolig er et annet objekt enn vanlig bolig.
  fritidsbolig: ["fritidsbolig", "hytte"],
};

const termAliases: Record<string, readonly string[]> = {
  erstatningsbil: ["erstatningsbil", "leiebil"],
  kaskoegenandel: ["kaskoegenandel", "kasko egenandel", "egenandel kaskoskade"],
  reisegods: ["reisegods", "bagasje", "bagasje og personlige eiendeler"],
  uhell: ["uhell", "uhellsskade", "uhellsskader", "skade ved uhell"],
  glass: ["glass", "glasskade", "glasskader"],
  reisevarighet: [
    "reiselengde",
    "reisevarighet",
    "maksimal reiselengde",
    "maks reiselengde",
    "maksimal varighet per reise",
    "maks varighet per reise",
    "maksimal reisevarighet",
  ],
};

// Samme ord kan bety noe annet i en annen forsikringstype.
const contextualTermAliases: Record<string, Record<string, readonly string[]>> = {
  bil: {
    "ansvar.dekning": ["ansvar", "ansvarsdekning"],
    "glass.dekning": ["glass", "glasskade", "glasskader"],
    "veihjelp.dekning": ["veihjelp", "redning", "assistanse", "redning og assistanse"],
    "maskinskade.dekning": ["maskinskade", "maskin og elektronikkdekning", "maskin og elektronikk dekning"],
    "maskinskade.alder": [
      "maskinskade alder", "maskinskade aldersgrense", "aldersgrense maskinskade",
      "motor og girskade alder", "motor og girskade aldersgrense",
    ],
    "maskinskade.km": [
      "maskinskade kilometer", "maskinskade kilometergrense", "kilometergrense maskinskade",
      "motor og girskade kilometer", "motor og girskade kilometergrense",
    ],
    "bilnokkel.dekning": ["bilnøkkel", "bilnøkkeldekning", "nøkkeldekning"],
    "bilnokkel.grense": [
      "bilnøkkel forsikringssum", "bilnøkkel beløpsgrense", "bilnøkkel erstatningsgrense",
    ],
    "bilnokkel.egenandel": ["bilnøkkel egenandel"],
    "nyverdi.alder": [
      "totalskadegaranti alder", "totalskadegaranti aldersgrense",
      "nyverdierstatning alder", "nyverdierstatning aldersgrense",
    ],
    "nyverdi.km": [
      "totalskadegaranti kilometer", "totalskadegaranti kilometergrense",
      "nyverdierstatning kilometer", "nyverdierstatning kilometergrense",
    ],
    "kjoretoy.forstegangsregistrering": [
      "første gang registrert", "førstegangsregistrert", "førstegangsregistrering",
      "første registreringsdato",
    ],
    "kjoretoy.kjorelengde": ["kjørelengde", "årlig kjørelengde"],
    "kjoretoy.kilometerstand": ["kilometerstand"],
    "parkering.alder": ["parkeringsskade alder", "parkeringsskade aldersgrense"],
    "parkering.grense": ["parkeringsskade forsikringssum", "parkeringsskade beløpsgrense"],
    "ladekabel.dekning": ["ladekabel", "ladekabeldekning"],
    "punktering.dekning": ["punktering", "punkteringsskade", "punkteringsdekning"],
  },
  innbo: {
    "uhell.dekning": ["uhell", "uhellsdekning", "uhellsskade", "uhellsskader"],
    "tyveri.dekning": ["tyveri", "tyveridekning"],
    "rettshjelp.dekning": ["rettshjelp", "rettshjelpsdekning"],
  },
  reise: {
    "reise.bagasje.dekning": ["reisegods", "bagasje", "bagasje og personlige eiendeler"],
    "reise.bagasje.uhell": ["uhell", "uhellsskade", "uhellsskader", "skade ved uhell"],
    "reise.avbestilling.dekning": ["avbestilling", "avbestillingsdekning"],
    "reise.rettshjelp.dekning": ["rettshjelp", "rettshjelpsdekning"],
  },
  båt: {
    berging: ["redning og berging", "berging og assistanse"],
  },
  hund: {
    veterinær: [
      "veterinærutgifter",
      "veterinærkostnader",
      "veterinærdekning",
      "utgifter til veterinær",
      "veterinærbehandling",
    ],
  },
};

export type TermContext = {
  insuranceType?: string | null;
  insuredValueConfirmed?: boolean;
  relatedCoverageParentKeys?: readonly string[];
  structuredCoverageContext?: boolean;
  termValue?: string | null;
};

export type InsuranceTypeContext = {
  productName?: string | null;
  coverageSummary?: string | null;
};

function normalizeWords(value: string | null): string {
  return (value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("nb-NO")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasLookup(groups: Record<string, readonly string[]>): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [canonical, aliases] of Object.entries(groups)) {
    for (const alias of [canonical, ...aliases]) {
      lookup.set(normalizeWords(alias), canonical);
    }
  }
  return lookup;
}

const insuranceLookup = aliasLookup(insuranceAliases);
export const isKnownInsuranceType = (key: string): boolean => Object.hasOwn(insuranceAliases, key);
const termLookup = aliasLookup(termAliases);
const contextualTermLookups = new Map(
  Object.entries(contextualTermAliases).map(([type, aliases]) => [type, aliasLookup(aliases)]),
);
const insuredValueLookup = aliasLookup({ forsikringsverdi: ["forsikringssum", "forsikringsverdi"] });

const canonicalInsuranceTypeLabels: Record<string, string> = {
  bil: "Bil",
  bolig: "Hus",
  innbo: "Innbo",
  reise: "Reise",
  båt: "Båt",
  mc: "MC",
  bobil: "Bobil",
  campingvogn: "Campingvogn",
  moped: "Moped",
  atv: "ATV",
  snøscooter: "Snøscooter",
  traktor: "Traktor",
  varebil: "Varebil",
  lastebil: "Lastebil",
  hund: "Hund",
  katt: "Katt",
  barn: "Barn",
  ulykke: "Ulykke",
  liv: "Liv",
  fritidsbolig: "Fritidsbolig",
};

const nonPassengerVehicleAliases: Record<string, readonly string[]> = {
  mc: insuranceAliases.mc,
  bobil: insuranceAliases.bobil,
  campingvogn: insuranceAliases.campingvogn,
  moped: insuranceAliases.moped,
  atv: insuranceAliases.atv,
  snøscooter: insuranceAliases.snøscooter,
  traktor: insuranceAliases.traktor,
  varebil: insuranceAliases.varebil,
  lastebil: insuranceAliases.lastebil,
};

function explicitVehicleType(context: InsuranceTypeContext): string | null {
  const words = ` ${normalizeWords([context.productName, context.coverageSummary].filter(Boolean).join(" "))} `;
  if (words === "  ") return null;
  for (const [canonical, aliases] of Object.entries(nonPassengerVehicleAliases)) {
    if (aliases.some((alias) => words.includes(` ${normalizeWords(alias)} `))) return canonical;
  }
  return null;
}

export function normalizeInsuranceType(value: string | null, context: InsuranceTypeContext = {}): string {
  let name = normalizeWords(value);
  // Bare et rent produktord fjernes. Andre ord i sammensatte produkter beholdes.
  name = name.replace(/^forsikring(?:en)? for /u, "");
  name = name.replace(/\s*forsikring(?:en|er|ene)?$/u, "").trim();
  const explicitMotorVehicle = explicitVehicleType({
    productName: [name, context.productName].filter(Boolean).join(" "),
    coverageSummary: context.coverageSummary,
  });
  if (explicitMotorVehicle && name.split(" ").includes("motorvogn")) return explicitMotorVehicle;
  const canonical = insuranceLookup.get(name) || name;
  // «Motorvogn» brukes om personbil i flere dokumenter, men et eksplisitt
  // kjøretøy i produktnavn/sammendrag skal alltid beholde sin egen type.
  return canonical === "bil" && name === "motorvogn"
    ? explicitMotorVehicle || canonical
    : canonical;
}

export function canonicalInsuranceTypeLabel(value: string | null, context: InsuranceTypeContext = {}): string {
  const key = normalizeInsuranceType(value, context);
  return canonicalInsuranceTypeLabels[key] || (value || "").trim();
}

export type RelatedCoverageDetail = {
  key: string;
  keyPrefix?: string;
  summaryLabel: string;
  aliases?: readonly string[];
  contextualAliases?: readonly string[];
  requiredValueAliases?: readonly string[];
};

export type RelatedCoverage = {
  parentKey: string;
  label: string;
  aliases?: readonly string[];
  details: readonly RelatedCoverageDetail[];
};

// Relasjonene beskriver bare eksplisitt godkjente hoveddekninger og detaljfelt.
// De brukes verken som fuzzy matching eller som bevis for dekning på tvers av
// forsikringstyper. Nye familier kan legges til uten leverandørspesialtilfeller.
const relatedCoverages: Record<string, readonly RelatedCoverage[]> = {
  bil: [
    {
      parentKey: "leiebil.dekning",
      label: "Leiebil",
      aliases: ["leiebil", "erstatningsbil"],
      details: [
        {
          key: "leiebil.dager",
          summaryLabel: "ved reparasjon",
          aliases: ["leiebil ved reparasjon", "erstatningsbil ved reparasjon", "ved reparasjon"],
          requiredValueAliases: ["leiebil", "erstatningsbil"],
        },
        {
          key: "leiebil.kondemnasjon",
          summaryLabel: "ved totalskade eller tyveri",
          aliases: [
            "leiebil ved kondemnasjon",
            "leiebil ved kondemnasjon eller tyveri",
            "leiebil ved totalskade eller tyveri",
            "ved kondemnasjon",
            "ved kondemnasjon eller tyveri",
            "ved totalskade eller tyveri",
            "totalskade eller tyveri",
          ],
          requiredValueAliases: ["leiebil", "erstatningsbil"],
        },
        {
          key: "leiebil.tyveri",
          summaryLabel: "ved tyveri",
          aliases: ["leiebil ved tyveri", "ved tyveri"],
          requiredValueAliases: ["leiebil", "erstatningsbil"],
        },
        {
          key: "leiebil.teknisk",
          summaryLabel: "ved tekniske problemer i Norden",
          aliases: [
            "leiebil ved tekniske problemer", "leiebil ved tekniske problemer i norden",
            "ved tekniske problemer", "ved tekniske problemer i norden",
            "tekniske problemer i norden", "veihjelp i norden",
          ],
          requiredValueAliases: ["leiebil", "erstatningsbil"],
        },
        {
          key: "leiebil.feriereise",
          summaryLabel: "ved feriereise utenfor Norden",
          aliases: ["leiebil ved feriereise", "feriereise utenfor norden"],
          requiredValueAliases: ["leiebil", "erstatningsbil"],
        },
      ],
    },
    {
      parentKey: "maskinskade.dekning",
      label: "Maskinskade",
      aliases: ["maskinskade", "maskin og elektronikkdekning", "maskin og elektronikk dekning"],
      details: [
        {
          key: "maskinskade.varighet",
          summaryLabel: "varighet",
          aliases: ["maskinskade varighet"],
          contextualAliases: ["varighet", "varighet og kilometergrense", "alder og kilometergrense"],
        },
        {
          key: "maskinskade.komponenter",
          summaryLabel: "omfattede deler",
          aliases: ["maskinskade omfattede deler"],
          contextualAliases: ["omfattede deler"],
        },
        {
          key: "maskinskade.fossil",
          summaryLabel: "deler for bensin- og dieselbil",
        },
        {
          key: "maskinskade.el",
          summaryLabel: "elbilkomponenter",
          aliases: ["maskinskade elbilkomponenter"],
          contextualAliases: ["elbilkomponenter"],
        },
        {
          key: "maskinskade.drivverk",
          summaryLabel: "gir og drivverk",
        },
        {
          key: "maskinskade.alder",
          summaryLabel: "aldersgrense",
        },
        {
          key: "maskinskade.km",
          summaryLabel: "kilometergrense",
        },
        {
          key: "maskinskade.egenandel.kilometer",
          keyPrefix: "maskinskade.egenandel.",
          summaryLabel: "egenandel etter kilometerstand",
          aliases: ["maskinskade egenandel etter kilometerstand"],
          contextualAliases: ["egenandel etter kilometerstand"],
        },
      ],
    },
    { parentKey: "glass.dekning", label: "Glass", details: [] },
    { parentKey: "veihjelp.dekning", label: "Veihjelp", details: [] },
    {
      parentKey: "bilnokkel.dekning",
      label: "Bilnøkkel",
      details: [
        { key: "bilnokkel.grense", summaryLabel: "forsikringssum" },
        { key: "bilnokkel.egenandel", summaryLabel: "egenandel" },
      ],
    },
    { parentKey: "ladekabel.dekning", label: "Ladekabel", details: [] },
    { parentKey: "punktering.dekning", label: "Punkteringsskade", details: [] },
  ],
  innbo: [
    {
      parentKey: "uhell.dekning",
      label: "Uhell",
      aliases: ["uhell", "uhellsdekning", "uhellsskade", "uhellsskader"],
      details: [
        { key: "uhell.grense", summaryLabel: "grense" },
        { key: "uhell.geografi", summaryLabel: "geografi" },
        { key: "uhell.egenandel", keyPrefix: "uhell.egenandel.", summaryLabel: "egenandel" },
      ],
    },
    { parentKey: "tyveri.dekning", label: "Tyveri", details: [] },
    { parentKey: "rettshjelp.dekning", label: "Rettshjelp", details: [] },
  ],
  reise: [
    {
      parentKey: "reise.bagasje.dekning",
      label: "Reisegods",
      details: [
        { key: "reise.bagasje.sum", keyPrefix: "reise.bagasje.", summaryLabel: "reisegods" },
      ],
    },
    { parentKey: "reise.avbestilling.dekning", label: "Avbestilling", details: [] },
    { parentKey: "reise.rettshjelp.dekning", label: "Rettshjelp", details: [] },
  ],
};

export function relatedCoveragesForInsuranceType(insuranceType: string | null): readonly RelatedCoverage[] {
  return relatedCoverages[normalizeInsuranceType(insuranceType)] ?? [];
}

function hasWholeValueAlias(value: string | null | undefined, aliases: readonly string[]): boolean {
  const words = ` ${normalizeWords(value || null)} `;
  return aliases.some((alias) => words.includes(` ${normalizeWords(alias)} `));
}

function relatedCoverageDetailKey(name: string, context: TermContext, type: string): string | null {
  for (const coverage of relatedCoverages[type] ?? []) {
    for (const detail of coverage.details) {
      const standalone = detail.aliases?.some((alias) => normalizeWords(alias) === name);
      const parentConfirmed = context.relatedCoverageParentKeys?.includes(coverage.parentKey) === true;
      const contextual = detail.contextualAliases?.some((alias) => normalizeWords(alias) === name) && parentConfirmed;
      if (!standalone && !contextual) continue;
      // En eksplisitt tilleggs-/dekningskontekst er sterkere enn ordlyden i
      // selve verdien. Uten slik kontekst kreves fortsatt et helt, godkjent
      // leiebil-/erstatningsbilord for å unngå kryssdekning.
      if (detail.requiredValueAliases && !context.structuredCoverageContext &&
          !hasWholeValueAlias(context.termValue, detail.requiredValueAliases)) continue;
      return detail.key;
    }
  }
  return null;
}

export function isUndocumentedTermValue(value: string | null | undefined): boolean {
  const normalized = normalizeWords(value || null);
  return [
    "ikke dokumentert",
    "ikke dokumentert kan ikke avgjøres",
    "kan ikke avgjøres",
    "ikke oppgitt",
    "ukjent",
  ].includes(normalized);
}

export function normalizeTermName(value: string | null, context: TermContext = {}): string {
  const name = normalizeWords(value).replace(/\bpr\b/gu, "per");
  const type = normalizeInsuranceType(context.insuranceType || null);
  if (type && context.insuredValueConfirmed) {
    const insuredValue = insuredValueLookup.get(name);
    if (insuredValue) return insuredValue;
  }
  const relatedDetail = relatedCoverageDetailKey(name, context, type);
  if (relatedDetail) return relatedDetail;
  const contextual = contextualTermLookups.get(type)?.get(name);
  if (contextual) return contextual;
  if (type === "bil" && ["leiebil", "erstatningsbil"].includes(name)) return "leiebil.dekning";
  return termLookup.get(name) || name;
}

// Kataloger kan bruke en kort nøkkel for en dekning og en mer spesifikk
// feltnøkkel for samme opplysning. Match bare eksplisitt godkjente hele nøkler.
// Original nøkkel, tekst og kilde beholdes på CatalogFact/ImportantTerm.
const catalogTermKeyAliases: Record<string, string> = {
  rettshjelp: "rettshjelp.dekning",
  "ansvar.annen.grense": "ansvar.ting.grense",
  "kasko.ungforer": "kasko.egenandel.ung",
  "nyverdi.utloser": "nyverdi.skadegrad",
  "veihjelp.grense": "veihjelp.transport.grense",
  "hus.vann.gjentakelse.egenandel": "hus.vann.egenandel.gjentatt_vann",
  "hus.solceller.dekning": "hus.teknisk.solceller",
};

export function normalizeCatalogTermKey(key: string): string {
  return catalogTermKeyAliases[key] ?? key;
}

type NamedValue = { name: string; value: string };

export function hasComparableInsuredValue(
  first: readonly NamedValue[],
  second: readonly NamedValue[],
  firstPolicyCount: number,
  secondPolicyCount: number,
): boolean {
  if (firstPolicyCount !== 1 || secondPolicyCount !== 1) return false;
  const isInsuredValue = (term: NamedValue) => insuredValueLookup.has(normalizeWords(term.name));
  return first.filter(isInsuredValue).some((left) =>
    second.filter(isInsuredValue).some((right) =>
      Boolean(normalizeWords(left.value)) && normalizeWords(left.value) === normalizeWords(right.value)
    )
  );
}
