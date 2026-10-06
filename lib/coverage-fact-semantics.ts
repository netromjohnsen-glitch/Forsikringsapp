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
  return nonAssertingKeys.has(key) || key.split(".").some((segment) => nonAssertingSegments.has(segment));
}
