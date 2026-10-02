import type { RelatedCoverage } from "./insurance-normalization.ts";

export const boatPetTypes = ["båt", "hund", "katt"] as const;
export type BoatPetType = typeof boatPetTypes[number];

type Detail = readonly [suffix: string, label: string, aliases?: readonly string[]];
const limit: Detail = ["grense", "grense", ["forsikringssum", "maksimal erstatning"]];
const deductible: Detail = ["egenandel", "egenandel"];
const restriction: Detail = ["begrensning", "begrensninger", ["unntak", "begrensning"]];
const age: Detail = ["alder", "aldersgrense", ["alder"]];

function coverage(
  family: string,
  label: string,
  aliases: readonly string[],
  details: readonly Detail[],
  supplemental = false,
): RelatedCoverage {
  const names = [label, ...aliases];
  return {
    parentKey: `${family}.dekning`, label, aliases: names, supplemental,
    details: details.map(([suffix, summaryLabel, other = []]) => ({
      key: `${family}.${suffix}`,
      summaryLabel,
      aliases: names.flatMap((name) => [summaryLabel, ...other].map((detail) => `${name} ${detail}`)),
      contextualAliases: [summaryLabel, ...other],
    })),
  };
}

const boat: readonly RelatedCoverage[] = [
  coverage("bat.kasko", "Skade på egen båt", ["kasko", "båtskade"], [deductible, restriction]),
  coverage("bat.totalskade", "Totalskade og ny båt", ["totalskade", "ny båt"], [
    age, ["eiertid", "maksimal eiertid"], ["skadegrad", "skadegrad"], ["oppgjor", "erstatningsmodell"], restriction,
  ]),
  coverage("bat.maskinskade", "Motor- og maskinskade", ["maskinskade", "motor- og girskade", "motor og girskade"], [
    age, ["batalder", "båtens aldersgrense"], ["motortype", "motortype"], deductible, restriction,
  ], true),
  coverage("bat.redning", "Redning og berging", ["redning", "berging", "assistanse", "berging og assistanse"], [limit, deductible, ["geografi", "geografi"], restriction]),
  coverage("bat.ferieavbrudd", "Ferieavbrudd", ["avbrutt båttur", "ferieavbrudd"], [["dager", "antall dager"], ["dagsbelop", "beløp per dag"], limit, restriction]),
  coverage("bat.losore", "Løsøre og bagasje", ["løsøre", "personlig løsøre", "bagasje"], [limit, restriction]),
  coverage("bat.fastutstyr", "Fastmontert utstyr", ["fastmontert utstyr", "tilbehør"], [limit, restriction]),
  coverage("bat.opplagsutstyr", "Opplagsutstyr", ["utstyr til bruk under opplag", "opplagsutstyr"], [limit, restriction]),
  coverage("bat.rigg", "Seil, mast, bom og rigg", ["seil og rigg", "mast og bom", "rigg"], [limit, restriction]),
  coverage("bat.jolle", "Jolle og ekstra motor", ["slepejolle", "jolle", "ekstra motor"], [limit, restriction]),
  coverage("bat.transport", "Transport, sjøsetting og opptak", ["transport", "sjøsetting", "opptak"], [limit, restriction]),
  coverage("bat.opplag", "Opplag", ["opplag", "lagring"], [["sesong", "sesong"], restriction]),
  coverage("bat.ulykke", "Fører- og passasjerulykke", ["fører- og passasjerulykke", "ulykke"], [["dod", "dødsfall"], ["invaliditet", "medisinsk invaliditet"], restriction], true),
  coverage("bat.brann", "Brann", ["brannskade"], [deductible, restriction]),
  coverage("bat.tyveri", "Tyveri", ["tyveriskade"], [deductible, restriction]),
  coverage("bat.haerverk", "Hærverk", ["hærverkskade"], [deductible, restriction]),
  coverage("bat.ansvar", "Ansvar", ["ansvarsdekning"], [limit, restriction]),
  coverage("bat.rettshjelp", "Rettshjelp", ["rettshjelpsdekning"], [limit, deductible, restriction]),
  coverage("bat.geografi", "Geografisk område", ["geografi", "forsikringens geografiske område"], [["omrade", "område"], restriction]),
];

const veterinary: readonly RelatedCoverage[] = [
  coverage("dyr.veterinar", "Veterinærbehandling", ["veterinærutgifter", "veterinærdekning", "behandling"], [
    ["sum.per_ar", "forsikringssum per forsikringsår"],
    ["sum.per_hendelse", "forsikringssum per skadetilfelle"],
    ["sum.valgbar", "valgbar forsikringssum"],
    ["rollover", "overføring av ubrukt forsikringssum"],
    ["egenandel.fast", "fast egenandel"],
    ["egenandel.prosent", "prosentandel"],
    ["egenandel.periode", "egenandelsperiode"], restriction,
  ]),
  coverage("dyr.medisin", "Medisiner", ["medisinutgifter", "reseptbelagt medisin"], [limit, restriction]),
  coverage("dyr.diagnostikk", "Diagnostikk", ["mr", "ct", "diagnostikk"], [limit, restriction]),
  coverage("dyr.tannskade", "Tannskade ved ulykke", ["tannskade", "tannfraktur"], [limit, restriction]),
  coverage("dyr.tannsykdom", "Tannsykdom", ["tann- og tannkjøttsykdom", "tannsykdom"], [limit, restriction]),
  coverage("dyr.rehabilitering", "Rehabilitering", ["rehabilitering", "fysioterapi"], [limit, restriction]),
  coverage("dyr.allergi", "Allergi og atopi", ["allergi", "atopi"], [limit, restriction]),
  coverage("dyr.fodsel", "Drektighet og fødsel", ["fødsel", "keisersnitt", "drektighet"], [limit, restriction]),
  coverage("dyr.karenstid", "Karenstid", ["ventetid", "karenstid"], [["sykdom", "sykdom"], ["ulykke", "ulykke"], restriction]),
  coverage("dyr.inntaksalder", "Nytegningsalder", ["inntaksalder", "nytegningsalder"], [["min", "minste alder"], ["maks", "høyeste alder"], restriction]),
  coverage("dyr.veterinaralder", "Veterinærdekningens varighet", ["veterinærdekningens opphørsalder"], [["opphor", "opphørsalder"], restriction]),
  coverage("dyr.liv", "Liv, død og tap", ["livsforsikring", "dødsfall", "tap av dyret"], [
    ["sum.valgbar", "valgbar livsforsikringssum"], ["forsvinning", "forsvinning"], ["tyveri", "tyveri"],
    ["reduksjon.start", "aldersreduksjon starter"], ["reduksjon.sats", "årlig reduksjon"], ["opphor", "opphørsalder"], restriction,
  ], true),
];

const dogOnly: readonly RelatedCoverage[] = [
  coverage("hund.bruksverdi", "Bruksverdi", ["tap av bruksverdi", "nedsatt bruksverdi", "bruk"], [limit, age, restriction], true),
];

export function boatPetCoverages(type: string): readonly RelatedCoverage[] {
  if (type === "båt") return boat;
  if (type === "hund") return [...veterinary, ...dogOnly];
  if (type === "katt") return [...veterinary,
    coverage("katt.bruksverdi", "Bruksverdi", ["tap av bruksverdi", "nedsatt bruksverdi", "bruk"], [age, restriction], true),
  ];
  return [];
}

export function boatPetFactKeysForType(type: string): string[] {
  if (!boatPetTypes.some((id) => id === type)) return [];
  return [...new Set([
    ...boatPetCoverages(type).flatMap((entry) => [entry.parentKey, ...entry.details.map((detail) => detail.key)]),
    "premie.total",
  ])];
}

export type BoatPetFactKey = string;
export const boatPetFactKeys = [...new Set(boatPetTypes.flatMap(boatPetFactKeysForType))] as BoatPetFactKey[];
export function boatPetKeyApplies(type: string, key: string): boolean {
  return boatPetFactKeysForType(type).includes(key);
}
export function boatPetFactLabel(type: string, key: string): string | null {
  const entry = boatPetCoverages(type).find((candidate) => candidate.parentKey === key || candidate.details.some((detail) => detail.key === key));
  if (!entry) return null;
  const detail = entry.details.find((candidate) => candidate.key === key);
  return `${entry.label}${detail ? ` – ${detail.summaryLabel}` : ""}`;
}
