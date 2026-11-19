import { additionalFactKinds } from "./person-insurance-terms.ts";

const personConditionKeys = new Set<string>(Object.values(additionalFactKinds)
  .filter((kind) => "term" in kind && kind.term).map((kind) => kind.key));

// These canonical detail roles qualify coverage; their existence is not
// evidence that the customer selected, or the product includes, that coverage.
const nonAssertingSegments = new Set(["unntak", "begrensning", "begrensninger"]);
const nonAssertingKeys = new Set([
  "parkering.bonus",
  "dyr.liv.reduksjon.start",
  "dyr.liv.reduksjon.sats",
  "dyr.liv.opphor",
  "hund.bruksverdi.alder",
  "hund.bruksverdi.grense",
  "dyr.diagnostikk.grense",
]);

export function isNonAssertingCoverageDetail(key: string): boolean {
  return personConditionKeys.has(key) || nonAssertingKeys.has(key) || key.split(".").some((segment) => nonAssertingSegments.has(segment));
}
