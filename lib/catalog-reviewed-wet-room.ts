import type { CatalogProduct } from "./product-catalog.ts";
import type { ProductComparisonFact } from "./catalog-product-comparison.ts";

const consequence = "vatrom.folgeskade";
const ownRoom = "vatrom.selverommet";
const workmanship = "hytte.handverker.vatrom";

type ReviewedEdition = readonly [id: string, date: string];
type Exclusion = readonly [edition: ReviewedEdition, page: number, rows: readonly string[]];

const standardExclusions: Readonly<Record<string, Exclusion>> = {
  "tryg-hus": [["trygHus", "2026-01-01"], 3, [consequence, ownRoom]],
  "gjensidige-hus": [["gjensidigeHusStandard", ""], 3, [ownRoom]],
  "fremtind-hus-standard": [["fremtindHusStandard", "2024-01-01"], 4, [ownRoom]],
  "storebrand-hus-standard": [["storebrandHusTerms", "2025-08-15"], 11, [consequence, ownRoom]],
  "storebrand-hytte-standard": [["cabin:storebrand:building", "2025-08-15"], 11, [consequence, ownRoom]],
  "frende-hus-standard": [["frendeHusStandard:2026-11-20", "2026-11-20"], 4, [consequence, ownRoom]],
  "frende-hytte-standard": [["cabin:frende:building:2026-11-20", "2026-11-20"], 4, [consequence, ownRoom]],
};

const ifEditions: Readonly<Record<string, ReviewedEdition>> = {
  "if-hus-basis": ["ifHusTerms", "2023-09"],
  "if-hus-utvidet": ["ifHusTerms", "2023-09"],
  "if-hus-super": ["ifHusTerms", "2023-09"],
  "if-hytte-basis": ["cabin:if:building", "2023-09"],
  "if-hytte-utvidet": ["cabin:if:building", "2023-09"],
  "if-hytte-super": ["cabin:if:building", "2023-09"],
};

type CabinConsequence = readonly [
  edition: ReviewedEdition, page: number, state: "included" | "unavailable", addOwnRoomExclusion: boolean,
];

const cabinConsequences: Readonly<Record<string, CabinConsequence>> = {
  "tryg-hytte-standard": [["cabin:tryg:building", "2026-01-01"], 3, "unavailable", true],
  "tryg-hytte-ekstra": [["cabin:tryg:extra", "2026-01-01"], 3, "included", true],
  "gjensidige-hytte-standard": [["cabin:gjensidige:standard", ""], 3, "included", true],
  "gjensidige-hytte-pluss": [["cabin:gjensidige:pluss", ""], 3, "included", false],
  "fremtind-hytte-standard": [["cabin:fremtind:standard", "2024-01-01"], 4, "included", true],
  "fremtind-hytte-topp": [["cabin:fremtind:standard", "2024-01-01"], 4, "included", false],
};

const cabinWorkmanship: Readonly<Record<string, readonly [ReviewedEdition, number]>> = {
  "gjensidige-hytte-pluss": [["cabin:gjensidige:pluss", ""], 5],
  "fremtind-hytte-topp": [["cabin:fremtind:topp", "2023-03-15"], 1],
};

function reviewedSource(fact: ProductComparisonFact, [id, date]: ReviewedEdition, page: number): boolean {
  const source = fact.sources[0];
  return source?.documentId === id && (source.effectiveFrom ?? "") === date && source.page === page;
}

function coverage(fact: ProductComparisonFact, state: "included" | "unavailable", value = fact.value): ProductComparisonFact {
  return { ...fact, state, role: "coverage", value };
}

const roomExclusion = "Skade på selve våtrommet på grunn av utetthet er unntatt. Vilkåret regner bygningsdeler innenfor våtrommets bjelkelag og stenderverk som del av våtrommet.";
const consequencesIncluded = "Vannskade i tilstøtende rom som følge av utett våtrom omfattes.";
const ifSuperRoom = "Ved konstatert følgeskade kan skade på gulv og vegger i våtrommet dekkes når skaden direkte skyldes monterings-, material-, konstruksjons- eller prosjekteringsfeil. Arbeidet må være utført av autorisert håndverker for mindre enn ti år siden og dokumenteres med faktura. Skaden må være oppdaget etter reklamasjonstiden, eller innenfor hvis den ansvarlige for arbeidet er konkurs.";

export function reviewedWetRoomRows(product: CatalogProduct, fact: ProductComparisonFact): ProductComparisonFact[] | undefined {
  const key = fact.key.startsWith("hus.") ? fact.key.slice(4)
    : fact.key.startsWith("hytte.") ? fact.key.slice(6) : undefined;
  const id = product.productId;

  if (fact.key === workmanship) {
    const edition = cabinWorkmanship[id];
    if (edition && reviewedSource(fact, ...edition)) {
      return [coverage({ ...fact, key: "hytte." + ownRoom, label: "Våtrom – selve rommet" }, "included")];
    }
  }
  if (key !== consequence && key !== ownRoom) return undefined;

  const exclusion = standardExclusions[id];
  if (exclusion && exclusion[2].includes(key) && reviewedSource(fact, exclusion[0], exclusion[1])) {
    return [coverage(fact, "unavailable")];
  }

  const ifEdition = ifEditions[id];
  if (ifEdition) {
    if (reviewedSource(fact, ifEdition, 8)) {
      if (key === ownRoom) {
        return [coverage(fact, "unavailable",
          "Skade på gulv og vegger som skal tåle vann, og på oppforing rundt sluk, er unntatt. Feil uten skade er heller ikke dekket.")];
      }
      if (id.endsWith("-basis")) return [coverage(fact, "unavailable")];
    }
    if (key === ownRoom && id.endsWith("-super") && reviewedSource(fact, ifEdition, 13)) {
      return [coverage(fact, "included", ifSuperRoom)];
    }
  }

  const cabin = cabinConsequences[id];
  if (key === consequence && cabin && reviewedSource(fact, cabin[0], cabin[1])) {
    const [, , state, addOwnRoomExclusion] = cabin;
    const value = state === "unavailable" ? "Vannskade fra utett våtrom, inkludert sluk og oppforing rundt sluk, er unntatt."
      : id === "tryg-hytte-ekstra" ? "Vannskade i tilstøtende og underliggende rom som følge av utett våtrom omfattes."
        : consequencesIncluded;
    const updated = coverage(fact, state, value);
    if (!addOwnRoomExclusion) return [updated];
    return [updated, coverage({ ...fact, key: "hytte." + ownRoom, label: "Våtrom – selve rommet" }, "unavailable", roomExclusion)];
  }
  return undefined;
}
