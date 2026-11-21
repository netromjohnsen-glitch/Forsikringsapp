import type { ProductComparisonFact } from "./catalog-product-comparison.ts";
import type { CatalogFact } from "./product-catalog.ts";

type ReviewedExclusion = readonly [key: string, page: number, text: string];

const trygRot: ReviewedExclusion = ["hus.rate.dekning", 4,
  "Sopp og råte er unntatt i ordinær bygningsdekning. Separat råte- og skadedyrdekning må være avtalt."];
const exclusions: Readonly<Record<string, readonly [effectiveFrom: string, rows: readonly ReviewedExclusion[]]>> = {
  trygHus: ["2026-01-01", [trygRot]],
  trygHusExtra: ["2026-01-01", [trygRot]],
  ifHusTerms: ["2023-09", [
    ["hus.rate.dekning", 9, "Sopp og råte er unntatt på Basis."],
  ]],
  fremtindHusStandard: ["2024-01-01", [
    ["hus.rate.dekning", 4, "Sopp, råte og bakterier er unntatt uten valgfri tilleggsforsikring."],
    ["hus.skadedyr.bygningsskade", 4, "Skade fra dyr og insekter er unntatt på Standard."],
  ]],
  "frendeHusStandard:2026-11-20": ["2026-11-20", [
    ["hus.rate.dekning", 4, "Sopp, råte, heksesot og bakterier er unntatt uten valgt råte- og skadedyrsforsikring."],
    ["hus.utleie.skadeverk", 3, "Ikke aktiv uten at boligen er registrert helt eller delvis utleid i forsikringsbeviset. Ordinær Standard unntar leietakers tyveri, hærverk og slitasje."],
  ]],
};

// These base terms document exclusions for the exact row, before a separately chosen
// add-on. Keep the recognition tied to the reviewed public edition and wording.
export function isReviewedMarketExclusion(fact: CatalogFact): boolean {
  const evidence = exclusions[fact.source.documentId];
  return Boolean(evidence && evidence[0] === fact.source.effectiveFrom &&
    evidence[1].some(([key, page, text]) => key === fact.key && page === fact.source.page && text === fact.value));
}

type RentalLimitEvidence = readonly [documentId: string, effectiveFrom: string, page: number, value: string];

const ifRentalLimit: RentalLimitEvidence = ["ifReiseTerms", "2025-03-22", 2, "Dekningen inngår bare i Super."];
const rentalLimitExclusions: Readonly<Record<string, RentalLimitEvidence>> = {
  "tryg-reise": ["trygReiseBase", "2026-01-01", 9, "Ikke omfattet på Reise."],
  "if-reise-basis": ifRentalLimit,
  "if-reise-standard": ifRentalLimit,
  "storebrand-reise-standard": ["storebrandReiseTerms", "2025-06-01", 25, "Ikke omfattet i Standard."],
  "watercircles-reise-standard": ["watercircles-reise", "2026-08-01", 4,
    "Refusjon av egenandel ved skade på eller tyveri av leiebil er del av Reise Elite."],
};

// These exact editions exclude this benefit altogether. The amount row can
// therefore cite the exclusion when a compared product supplies a limit.
export function reviewedRentalLimitExclusion(
  productId: string, key: string, facts: readonly ProductComparisonFact[],
): ProductComparisonFact | undefined {
  const evidence = rentalLimitExclusions[productId];
  if (key !== "reise.leiebil.egenandel_sum" || !evidence) return undefined;
  const [documentId, effectiveFrom, page, value] = evidence;
  const parent = facts.filter((fact) => fact.key === "reise.leiebil.egenandel");
  if (parent.length !== 1) return undefined;
  const fact = parent[0];
  if (fact.state !== "unavailable" || fact.value !== value || !fact.sources.some((source) =>
    source.documentId === documentId && source.effectiveFrom === effectiveFrom && source.page === page)) return undefined;
  return { ...fact, key, label: "Leiebilegenandel – sum", role: "term" };
}
