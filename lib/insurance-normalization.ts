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
  },
  reise: {
    "reise.bagasje.dekning": ["reisegods", "bagasje", "bagasje og personlige eiendeler"],
    "reise.bagasje.uhell": ["uhell", "uhellsskade", "uhellsskader", "skade ved uhell"],
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

export function normalizeTermName(value: string | null, context: TermContext = {}): string {
  const name = normalizeWords(value).replace(/\bpr\b/gu, "per");
  const type = normalizeInsuranceType(context.insuranceType || null);
  if (type && context.insuredValueConfirmed) {
    const insuredValue = insuredValueLookup.get(name);
    if (insuredValue) return insuredValue;
  }
  const contextual = contextualTermLookups.get(type)?.get(name);
  if (contextual) return contextual;
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
