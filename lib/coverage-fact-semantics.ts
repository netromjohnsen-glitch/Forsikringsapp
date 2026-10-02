// These canonical detail roles qualify coverage; their existence is not
// evidence that the customer selected, or the product includes, that coverage.
const nonAssertingSegments = new Set(["unntak", "begrensning", "begrensninger"]);

export function isNonAssertingCoverageDetail(key: string): boolean {
  return key === "parkering.bonus" || key.split(".").some((segment) => nonAssertingSegments.has(segment));
}
