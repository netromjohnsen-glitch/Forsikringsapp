import type { FactSource } from "./comparison.ts";

export type ObjectIdentifier = {
  type: string;
  value: string;
  documentIndices?: number[];
  sources?: FactSource[];
};
// Identifier-type-specific exact formatting only. No OCR correction, similarity,
// provider/product guesses or identifiers inferred from free text.
export function normalizeObjectIdentifier(identifier: ObjectIdentifier): string | null {
  const raw = identifier.value.trim();
  if (identifier.type === "registration") {
    const value = raw.toUpperCase().replace(/\s/gu, "");
    return /^[A-ZÆØÅ]{1,3}\d{2,6}$/u.test(value) ? value : null;
  }
  if (identifier.type === "vin") {
    const value = raw.toUpperCase();
    return /^[A-HJ-NPR-Z0-9]{17}$/u.test(value) ? value : null;
  }
  return identifier.type === "serial" && /^[A-Za-z0-9][A-Za-z0-9-]{5,63}$/u.test(raw) ? raw : null;
}
export type IdentifierStrategies = Readonly<Record<string, Readonly<Record<string, (value: string) => string | null>>>>;
const vehicleStrategies = Object.fromEntries(["registration", "vin", "serial"].map(type => [type, (value: string) => normalizeObjectIdentifier({ type, value })]));
export const defaultIdentifierStrategies: IdentifierStrategies = Object.fromEntries(
  ["bil", "mc", "bobil", "snøscooter", "campingvogn", "tilhenger"].map(type => [type, vehicleStrategies]),
);
