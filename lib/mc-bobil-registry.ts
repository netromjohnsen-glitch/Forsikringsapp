import type { RelatedCoverage } from "./insurance-normalization.ts";

// Semantic identity only; no provider values, selections, or object identity.
export const mcBobilTypes = ["mc", "bobil"] as const;
export type McBobilType = typeof mcBobilTypes[number];
type Detail = readonly [suffix: string, label: string, aliases?: readonly string[]];
const limit: Detail = ["grense", "forsikringssum", ["grense", "beløpsgrense", "maksimal erstatning"]];
const deductible: Detail = ["egenandel", "egenandel"];
const restriction: Detail = ["begrensning", "begrensninger", ["unntak", "begrensning"]];
const age: Detail = ["alder", "aldersgrense", ["alder"]];
const km: Detail = ["km", "kilometergrense", ["kilometer"]];
const geography: Detail = ["geografi", "geografisk område", ["geografi"]];
const days: Detail = ["dager", "antall dager", ["dager", "varighet"]];
const scope: Detail = ["omfang", "omfang", ["omfattede gjenstander"]];

function coverage(family: string, label: string, aliases: readonly string[], details: readonly Detail[], supplemental = false): RelatedCoverage {
  const names = [label, ...aliases];
  return {
    parentKey: `${family}.dekning`, label, aliases: names, supplemental,
    details: details.map(([suffix, summaryLabel, other = []]) => ({
      key: `${family}.${suffix}`, summaryLabel,
      ...(suffix === "egenandel.kilometer" ? { keyPrefix: `${family}.egenandel.` } : {}),
      aliases: names.flatMap(name => [summaryLabel, ...other].map(detail => `${name} ${detail}`)),
      contextualAliases: [summaryLabel, ...other],
    })),
  };
}

// These facts have the same semantic identity as their vehicle counterparts.
// Only source-backed, type-applicable catalog components supply their values.
const shared: RelatedCoverage[] = [
  coverage("ansvar", "Ansvar", ["ansvarsdekning"], [
    ["person.grense", "personskade"], ["ting.grense", "tingskade"], restriction,
  ]),
  coverage("rettshjelp", "Rettshjelp", ["rettshjelpsdekning"], [limit, deductible, geography, restriction]),
  coverage("brann", "Brann", ["brannskade"], [deductible, restriction]),
  coverage("naturskade", "Naturskade", ["naturskader"], [deductible, restriction]),
  coverage("tyveri", "Tyveri", ["tyveriskade"], [deductible, restriction]),
  coverage("kasko", "Kasko", ["kaskoskade", "skade på eget kjøretøy"], [deductible, restriction]),
  coverage("glass", "Glass", ["glasskade", "glasskader"], [scope, deductible, ["reparasjon.egenandel", "egenandel ved reparasjon"], restriction]),
  coverage("veihjelp", "Veihjelp", ["redning", "redning og assistanse"], [scope, geography, deductible, restriction]),
  coverage("ulykke", "Fører- og passasjerulykke", ["fører og passasjerulykke", "ulykkesdekning"], [
    ["dod", "dødsfall"], ["invaliditet", "medisinsk invaliditet", ["invaliditet"]], scope, restriction,
  ]),
  coverage("utstyr", "Fastmontert utstyr", ["fastmontert ekstrautstyr", "fastmontert tilbehør"], [limit, scope, restriction]),
  coverage("nokkel", "Nøkkel", ["nøkkeldekning", "bilnøkkel", "tapt nøkkel"], [limit, deductible, restriction]),
  coverage("feilfylling", "Feilfylling", ["feilfylling av drivstoff"], [scope, limit, deductible, restriction]),
  coverage("maskinskade", "Maskinskade", ["motor- og girskade", "motor og girskade", "motor og gir", "maskin og elektronikkdekning"], [
    age, km, ["varighet", "alder og kilometergrense", ["varighet og kilometergrense"]],
    ["komponenter", "omfattede deler", ["komponenter"]], deductible,
    ["egenandel.kilometer", "egenandel etter kilometerstand"],
    ["aldersfradrag", "aldersfradrag"], ["kilometerfradrag", "kilometerfradrag"],
    ["kjopsalder", "alder ved kjøp"], ["kjopskm", "kilometerstand ved kjøp"], restriction,
  ], true),
  coverage("nyverdi", "Totalskadegaranti", ["nyverdierstatning", "nytt kjøretøy ved totalskade", "ny bobil ved totalskade", "ny MC ved totalskade"], [age, km, ["grenser", "alder og kilometergrense"], ["skadegrad", "skadegrad", ["utløser"]], ["oppgjor", "erstatningsform"], restriction]),
];
const mc: RelatedCoverage[] = [
  coverage("mc.kjoreutstyr", "Kjøreutstyr", ["personlig kjøreutstyr", "hjelm og kjøreutstyr"], [limit, scope, deductible, restriction]),
  coverage("mc.hjelm", "Hjelm", ["styrthjelm"], [limit, deductible, restriction]),
  coverage("mc.bagasje", "Bagasje", ["personlige eiendeler", "løsøre"], [limit, scope, deductible, restriction]),
  coverage("mc.leiekjoretoy", "Leie-MC", ["leiemotorsykkel", "leie motorsykkel", "leie-MC eller leiebil"], [days, scope, limit, ["dagsbelop", "beløp per dag"], restriction], true),
  coverage("mc.parkert", "Parkert MC", ["skade på parkert motorsykkel"], [age, deductible, restriction]),
];
const bobil: RelatedCoverage[] = [
  coverage("bobil.losore", "Løsøre og personlige eiendeler", ["løsøre", "personlige eiendeler", "bagasje", "bagasje og løsøre"], [limit, ["gjenstand", "grense per gjenstand"], scope, deductible, restriction]),
  coverage("bobil.fortelt", "Fortelt", ["fortelt og terrasse"], [limit, scope, deductible, restriction]),
  coverage("bobil.fukt", "Fukt", ["fuktskade", "fukt og råte"], [age, deductible, ["kontroll", "fuktkontroll", ["kontrollkrav", "vedlikeholdskrav"]], restriction]),
  coverage("bobil.vann", "Vann", ["vannskade", "vannskade i bobil"], [scope, deductible, restriction]),
  coverage("bobil.skadedyr", "Skadedyr", ["insekter og gnagere", "skade fra skadedyr"], [limit, deductible, restriction]),
  // A daily cash allowance and reimbursement of actual expenses are separate
  // benefits even when marketed under the same "feriegaranti" heading.
  coverage("bobil.ferieavbrudd", "Ferieavbrudd – dagskompensasjon", ["ferieavbrudd", "avbrutt ferie"], [["dagsbelop", "beløp per dag"], days, limit, restriction]),
  coverage("bobil.feriegaranti", "Feriegaranti – ekstrautgifter", ["feriegaranti", "feriegaranti ekstrautgifter"], [scope, ["dagsbelop", "maksimale ekstrautgifter per dag"], days, limit, restriction]),
  coverage("bobil.utleie", "Privat utleie", ["utleie", "utleiedekning"], [deductible, restriction], true),
  coverage("parkering", "Parkeringsskade", ["parkeringsdekning"], [age, limit, deductible, ["bonus", "bonustap"], restriction]),
];
const rental = coverage("leiebil", "Leiebil", ["erstatningsbil"], [days, ["dagsgrense", "maksimal døgnpris"], ["bilklasse", "bilklasse"], restriction], true);

export function mcBobilCoverages(type: string): readonly RelatedCoverage[] {
  return type === "mc" ? [...shared, rental, ...mc] : type === "bobil" ? [...shared, rental, ...bobil] : [];
}

export const mcBobilVehicleAliases: Readonly<Record<string, readonly string[]>> = {
  "kjoretoy.kjorelengde": ["årlig kjørelengde", "kjørelengde", "avtalt årlig kjørelengde"],
  "kjoretoy.kilometerstand": ["kilometerstand", "faktisk kilometerstand", "avlest kilometerstand"],
  "kjoretoy.avtalt_maks_kilometerstand": ["avtalt maksimal kilometerstand", "avtalt maksimal kilometerstand i forsikringsperioden"],
  "kjoretoy.forstegangsregistrering": ["førstegangsregistrering", "førstegangsregistrert", "første registreringsdato"],
  "avtale.geografi": ["geografisk område", "forsikringens geografiske område"],
};

// Standalone bonus consequences, not coverage parents or selection evidence.
export const bobilBonusLabels = {
  "bonus.delkasko": "Bonus – kildebundne fritak",
  "bonus.parkert": "Bonus – parkert kjøretøy",
} as const;

export function mcBobilFactKeysForType(type: string): string[] {
  if (!mcBobilTypes.some(id => id === type)) return [];
  return [...mcBobilCoverages(type).flatMap(c => [c.parentKey, ...c.details.map(d => d.key)]),
    ...Object.keys(mcBobilVehicleAliases), ...Object.keys(bobilBonusLabels),
    "premie.total", "premie.ekskl_tfa", "premie.tfa"];
}
type SharedFamily = "ansvar" | "rettshjelp" | "brann" | "naturskade" | "tyveri" | "kasko" | "glass" | "veihjelp" | "ulykke" | "utstyr" | "nokkel" | "feilfylling" | "maskinskade" | "nyverdi" | "leiebil" | "parkering";
type ScopedFamily = `mc.${"kjoreutstyr" | "hjelm" | "bagasje" | "leiekjoretoy" | "parkert"}` | `bobil.${"losore" | "fortelt" | "fukt" | "vann" | "skadedyr" | "ferieavbrudd" | "feriegaranti" | "utleie"}`;
type DetailSuffix = "dekning" | "person.grense" | "ting.grense" | "grense" | "egenandel" | "begrensning" | "alder" | "km" | "geografi" | "dager" | "omfang" | "reparasjon.egenandel" | "dod" | "invaliditet" | "varighet" | "komponenter" | "egenandel.kilometer" | "aldersfradrag" | "kilometerfradrag" | "kjopsalder" | "kjopskm" | "grenser" | "skadegrad" | "oppgjor" | "dagsgrense" | "bilklasse" | "dagsbelop" | "gjenstand" | "kontroll" | "bonus";
export type McBobilFactKey = `${SharedFamily | ScopedFamily}.${DetailSuffix}` | `kjoretoy.${"kjorelengde" | "kilometerstand" | "avtalt_maks_kilometerstand" | "forstegangsregistrering"}` | "avtale.geografi" | `premie.${"total" | "ekskl_tfa" | "tfa"}` | keyof typeof bobilBonusLabels;
// Compile-time union plus the exact runtime registry above; no arbitrary string
// widens the extraction schema's CanonicalDocumentFactKey type.
export const mcBobilFactKeys = [...new Set(mcBobilTypes.flatMap(mcBobilFactKeysForType))] as McBobilFactKey[];
export function mcBobilKeyApplies(type: string, key: string): boolean {
  return mcBobilFactKeysForType(type).includes(key) ||
    (mcBobilTypes.some(id => id === type) && /^maskinskade\.egenandel\.\d+-\d+$/u.test(key));
}
export function mcBobilFactLabel(type: string, key: string): string | null {
  if (key === "avtale.geografi") return "Geografisk område";
  if (mcBobilTypes.some(id => id === type) && Object.hasOwn(bobilBonusLabels, key)) return bobilBonusLabels[key as keyof typeof bobilBonusLabels];
  const coverage = mcBobilCoverages(type).find(c => c.parentKey === key || c.details.some(d => d.key === key));
  if (!coverage) return null;
  const detail = coverage.details.find(d => d.key === key);
  return `${coverage.label}${detail ? ` – ${detail.summaryLabel}` : ""}`;
}
