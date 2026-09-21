// Aliasgrupper er hele betegnelser. Delord og likhetsgrad brukes ikke til matching.
const insuranceAliases: Record<string, readonly string[]> = {
  bil: ["bil", "personbil", "privatbil"],
  bolig: ["bolig", "hus", "hus bolig"],
  innbo: ["innbo"],
  reise: ["reise"],
  båt: ["båt", "småbåt"],
  mc: ["mc", "motorsykkel"],
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

export function normalizeInsuranceType(value: string | null): string {
  let name = normalizeWords(value);
  // Bare et rent produktord fjernes. Andre ord i sammensatte produkter beholdes.
  name = name.replace(/^forsikring(?:en)? for /u, "");
  name = name.replace(/\s*forsikring(?:en|er|ene)?$/u, "").trim();
  return insuranceLookup.get(name) || name;
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
