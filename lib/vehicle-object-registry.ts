// Explicit identities for objects with their own insurance terms. The existing
// Norwegian snøscooter type ID is retained; fact namespaces use ASCII.
export const vehicleObjectTypes = [
  { id: "snøscooter", prefix: "snoscooter", label: "Snøscooter" },
  { id: "campingvogn", prefix: "campingvogn", label: "Campingvogn" },
  { id: "tilhenger", prefix: "tilhenger", label: "Tilhenger" },
] as const;
export const vehicleObjectType = (type: string) => vehicleObjectTypes.find((entry) => entry.id === type);

const common = [
  ["brann", "Brann", ["brannskade"]],
  ["tyveri", "Tyveri", ["tyveriskade"]],
  ["kasko", "Kasko", ["skade på eget kjøretøy", "kaskoskade"]],
  ["rettshjelp", "Rettshjelp", ["rettshjelpsdekning"]],
  ["redning", "Redning", ["berging", "veihjelp"]],
  ["utstyr", "Fastmontert utstyr", ["fastmontert ekstrautstyr", "fastmontert tilbehør"]],
  ["naturskade", "Naturskade", []],
] as const;
const details = [
  ["grense", "forsikringssum", ["forsikringssum", "grense", "beløpsgrense"]],
  ["egenandel", "egenandel", ["egenandel"]],
  ["alder", "aldersgrense", ["alder", "aldersgrense"]],
  ["geografi", "geografisk område", ["geografi", "geografisk område"]],
  ["begrensning", "begrensninger", ["begrensning", "unntak"]],
] as const;
export function vehicleObjectCoverages(type: string) {
  const entry = vehicleObjectType(type);
  if (!entry) return [];
  const families: readonly (readonly [string, string, readonly string[]])[] = [
    ...common,
    ...(type === "snøscooter" ? [
      ["ansvar", "Ansvar", ["ansvarsdekning"]],
      ["ulykke", "Fører- og passasjerulykke", ["fører og passasjerulykke"]],
      ["forerulykke", "Førerulykke", []],
      ["losore", "Løsøre", ["bagasje", "løst utstyr"]],
    ] as const : []),
    ...(type === "campingvogn" ? [
      ["losore", "Løsøre", ["bagasje", "innbo i campingvogn", "løst utstyr"]],
      ["nyverdi", "Ny campingvogn ved totalskade", ["totalskadegaranti"]],
      ["fortelt", "Fortelt", []], ["fukt", "Fuktskade", ["fukt", "fukt og råte"]],
      ["skadedyr", "Skadedyr", ["insekter og gnagere"]],
      ["ferie", "Avbrutt ferie", ["feriegaranti", "ferieavbrudd"]],
      ["glass", "Glass", ["glasskade"]],
    ] as const : []),
  ];
  return families.map(([id, label, aliases]) => ({
    parentKey: `${entry.prefix}.${id}.dekning`, label, aliases: [label, ...aliases],
    details: details.map(([key, summaryLabel, detailAliases]) => ({
      key: `${entry.prefix}.${id}.${key}`, summaryLabel,
      aliases: [label, ...aliases].flatMap((name) => detailAliases.map((detail) => `${name} ${detail}`)),
      contextualAliases: [...detailAliases],
    })),
  }));
}
type VehicleObjectPrefix = typeof vehicleObjectTypes[number]["prefix"];
type VehicleCoverageFamily = typeof common[number][0] | "ansvar" | "ulykke" | "forerulykke" | "losore" | "nyverdi" | "fortelt" | "fukt" | "skadedyr" | "ferie" | "glass";
export type VehicleObjectFactKey = `${VehicleObjectPrefix}.${VehicleCoverageFamily}.${"dekning" | typeof details[number][0]}` |
  `${VehicleObjectPrefix}.avtale.${"geografi" | "sikkerhet" | "sesong" | "forsikringssum" | "egenandel"}`;
export const vehicleObjectFactKeys = vehicleObjectTypes.flatMap(({ id, prefix }) => [
  ...vehicleObjectCoverages(id).flatMap((coverage) => [coverage.parentKey, ...coverage.details.map((detail) => detail.key)]),
  `${prefix}.avtale.geografi`, `${prefix}.avtale.sikkerhet`, `${prefix}.avtale.sesong`,
  `${prefix}.avtale.forsikringssum`, `${prefix}.avtale.egenandel`,
]) as VehicleObjectFactKey[];
