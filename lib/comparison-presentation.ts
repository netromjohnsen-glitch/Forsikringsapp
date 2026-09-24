import type { Difference, InsuranceGroup, TermGroup } from "./comparison.ts";
import { groupTerms } from "./comparison.ts";
import { coverageDetailPresentation, type CoverageDetailPresentation } from "./coverage-detail-presentation.ts";
import type { MatchingPlan } from "./hybrid-matching.ts";
import {
  conditionalBenefitAudits, conditionalBenefits, conceptForFactKey, conceptsForInsurance, evidenceById,
} from "./presentation-catalog.ts";
import type {
  ConditionalBenefit, PresentationConcept, PresentationFactType, PresentationTier,
} from "./presentation-catalog.ts";

export type PresentationSource = {
  side: "first" | "second";
  providerId: string;
  distributionChannel: string;
  url: string;
  label: string;
  checkedAt: string;
};

export type PresentedDifference = Difference & {
  details?: CoverageDetailPresentation;
  limitPair?: { first: string; second: string };
  conceptId?: string;
  presentationTier?: PresentationTier;
  presentationType?: PresentationFactType;
  items?: Difference[];
  presentationSource?: { url: string; label: string; checkedAt: string };
  presentationSources?: PresentationSource[];
};

const provenanceOnlyKey = /(?:^|\.)avtale\.(?:forbehold|ipid|generelle|generellevilkar|produktside)$/u;

function conceptFamily(key: string): string {
  const parts = key.split(".");
  if (["hus", "innbo", "reise"].includes(parts[0])) return parts.slice(0, 2).join(".");
  return parts[0];
}

function detailRank(key: string): number {
  if (/\.(?:dekning|folgeskade|selverommet|skadearsak|brudd|utstromming|terreng)$/u.test(key)) return 0;
  if (/(?:^|\.)(?:sum|grense)(?:\.|$)/u.test(key)) return 1;
  if (key.endsWith(".alder")) return 2;
  if (key.endsWith(".km")) return 3;
  if (/(?:^|\.)(?:dager|varighet|valg|maks)(?:\.|$)/u.test(key)) return 4;
  if (key.endsWith(".geografi") || key.includes(".omrade.")) return 5;
  if (/(?:^|\.)egenandel(?:\.|$)/u.test(key) || key.includes("_egenandel")) return 6;
  if (/(?:^|\.)(?:begrensning|unntak)(?:\.|$)/u.test(key)) return 8;
  if (/(?:^|\.)sikkerhet(?:\.|$)/u.test(key)) return 9;
  return 7;
}

// Beholder rekkefølgen mellom dekningsfamilier, men samler og ordner fakta
// innen samme familie. Ingen verdier eller sammenligningssemantikk endres.
export function sortDetailedTerms(terms: TermGroup[]): TermGroup[] {
  const familyOrder = new Map<string, number>();
  for (const term of terms) {
    const family = conceptFamily(term.key);
    if (!familyOrder.has(family)) familyOrder.set(family, familyOrder.size);
  }
  return terms.map((term, index) => ({ term, index, family: conceptFamily(term.key) }))
    .sort((a, b) => (familyOrder.get(a.family)! - familyOrder.get(b.family)!) ||
      (detailRank(a.term.key) - detailRank(b.term.key)) || (a.index - b.index))
    .map(({ term }) => term);
}

const tierOrder: Record<PresentationTier, number> = { primary: 0, secondary: 1, detail: 2 };

function mappedConcept(difference: Difference): PresentationConcept | null {
  if (!difference.insuranceKey) return null;
  if (difference.termKey) {
    const entry = conceptForFactKey(difference.insuranceKey, difference.termKey);
    return entry?.id.endsWith(".ovrig") ? null : entry;
  }
  if (difference.kind === "deductible") return {
    id: `${difference.insuranceKey}.generell-egenandel`,
    insuranceType: difference.insuranceKey as PresentationConcept["insuranceType"],
    label: "Egenandel",
    group: "Egenandel",
    factKeyPatterns: [],
    defaultTier: "secondary",
    importanceReasons: ["economic-risk", "customer-specific"],
    factTypes: ["deductible"],
  };
  const candidates = (difference.relatedTermKeys ?? []).flatMap((key) => {
    const entry = conceptForFactKey(difference.insuranceKey!, key);
    return entry && !entry.id.endsWith(".ovrig") ? [entry] : [];
  });
  if (!candidates.length) return null;
  const counts = new Map<string, { concept: PresentationConcept; count: number }>();
  for (const entry of candidates) {
    const current = counts.get(entry.id);
    counts.set(entry.id, { concept: entry, count: (current?.count ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0].concept;
}

function differenceDetailRank(difference: Difference): number {
  if (difference.kind === "add_on") return 0;
  if (!difference.termKey) return 7;
  return detailRank(difference.termKey);
}

function selectFamilyItems(items: Difference[]): Difference[] {
  const ordered = [...items].sort((a, b) =>
    differenceDetailRank(a) - differenceDetailRank(b) || b.priority - a.priority
  );
  const firstCoverageStatus = ordered.find((item) => item.coverageStatusDifference);
  const remaining = ordered.filter((item) => !item.coverageStatusDifference);
  return firstCoverageStatus ? [firstCoverageStatus, ...remaining].slice(0, 4) : remaining.slice(0, 4);
}

function shouldPresent(concept: PresentationConcept, items: Difference[]): boolean {
  if (concept.defaultTier !== "detail") return true;
  // Eksisterende sammenligningsmotor løfter store, direkte sammenlignbare
  // tallforskjeller over 128. En slik detalj kan vises, men uten ny poengmodell.
  return items.some((item) => item.priority >= 128);
}

function providerIds(insurances: InsuranceGroup["first"]): Set<string> {
  return new Set(insurances.flatMap((insurance) =>
    insurance.catalogReference?.providerId ? [insurance.catalogReference.providerId] : []
  ));
}

function benefitText(benefits: readonly ConditionalBenefit[]): string {
  return benefits.map((benefit) => [
    ...benefit.facts.map((fact) => `${fact.label}: ${fact.value}`),
    `Målgruppe: ${benefit.audience}`,
  ].join("\n")).join("\n\n");
}

function missingBenefitText(providers: Set<string>, conceptId: string): string {
  if (!providers.size) return "Betinget fordel kan ikke avgjøres uten katalogkobling.";
  const audits = [...providers].map((providerId) => conditionalBenefitAudits.find((audit) =>
    audit.providerId === providerId && audit.conceptId === conceptId
  ));
  return audits.every((audit) => audit?.status === "not-documented")
    ? "Tilsvarende betinget fordel er ikke dokumentert etter kontroll av aktive offisielle kilder."
    : "Tilsvarende betinget fordel er ikke kontrollert for dette katalogproduktet.";
}

function benefitSources(benefits: readonly ConditionalBenefit[], side: PresentationSource["side"]): PresentationSource[] {
  return benefits.flatMap((benefit) => {
    const evidence = evidenceById(benefit.evidenceId);
    if (!evidence) return [];
    return [
      { label: `Vis hovedkilde for ${benefit.distributionChannel}`, url: evidence.url },
      ...(evidence.supportingSources ?? []),
    ].map((source) => ({
      side,
      providerId: benefit.providerId,
      distributionChannel: benefit.distributionChannel,
      url: source.url,
      label: source.label.startsWith("Vis ")
        ? source.label
        : `${benefit.distributionChannel}: ${source.label}`,
      checkedAt: evidence.checkedAt,
    }));
  });
}

function groupDifferences(group: InsuranceGroup, differences: Difference[]): PresentedDifference[] {
  const configured = conceptsForInsurance(group.key);
  const configuredOrder = new Map(configured.map((entry, index) => [entry.id, index]));
  const families = new Map<string, { concept: PresentationConcept; items: Difference[] }>();
  let fallbackIndex = 0;

  for (const difference of differences) {
    const concept = mappedConcept(difference);
    const fallback: PresentationConcept = {
      id: `${group.key}.ufordelt.${fallbackIndex++}`,
      insuranceType: group.key as PresentationConcept["insuranceType"],
      label: difference.title,
      group: difference.title,
      factKeyPatterns: [],
      defaultTier: difference.kind === "add_on" ? "secondary" : "detail",
      importanceReasons: ["misunderstanding-risk"],
      factTypes: [difference.kind === "deductible" ? "deductible" : "coverage"],
    };
    const selected = concept ?? fallback;
    const family = families.get(selected.id);
    if (family) family.items.push(difference);
    else families.set(selected.id, { concept: selected, items: [difference] });
  }

  const presented: PresentedDifference[] = [...families.values()]
    .filter(({ concept, items }) => shouldPresent(concept, items))
    .sort((a, b) =>
      tierOrder[a.concept.defaultTier] - tierOrder[b.concept.defaultTier] ||
      (configuredOrder.get(a.concept.id) ?? Number.MAX_SAFE_INTEGER) -
        (configuredOrder.get(b.concept.id) ?? Number.MAX_SAFE_INTEGER)
    )
    .map(({ concept, items }) => {
      const selectedItems = selectFamilyItems(items);
      return {
        ...selectedItems[0],
        title: concept.label,
        text: selectedItems[0].text,
        termKey: selectedItems.length === 1 ? selectedItems[0].termKey : undefined,
        conceptId: concept.id,
        presentationTier: concept.defaultTier,
        presentationType: concept.factTypes.length === 1 ? concept.factTypes[0] : "coverage",
        items: selectedItems,
        priority: Math.max(...selectedItems.map((item) => item.priority)),
      };
    });

  if (group.key === "bil") {
    const firstProviders = providerIds(group.first);
    const secondProviders = providerIds(group.second);
    const conceptIds = [...new Set(conditionalBenefits.filter((benefit) =>
      benefit.insuranceType === group.key
    ).map((benefit) => benefit.conceptId))];
    for (const conceptId of conceptIds) {
      const firstBenefits = conditionalBenefits.filter((benefit) =>
        benefit.insuranceType === group.key && benefit.conceptId === conceptId && firstProviders.has(benefit.providerId)
      );
      const secondBenefits = conditionalBenefits.filter((benefit) =>
        benefit.insuranceType === group.key && benefit.conceptId === conceptId && secondProviders.has(benefit.providerId)
      );
      if (!firstBenefits.length && !secondBenefits.length) continue;
      const firstText = firstBenefits.length ? benefitText(firstBenefits) : missingBenefitText(firstProviders, conceptId);
      const secondText = secondBenefits.length ? benefitText(secondBenefits) : missingBenefitText(secondProviders, conceptId);
      const item: Difference = {
        title: conceptsForInsurance(group.key).find((concept) => concept.id === conceptId)?.label ?? "Betinget fordel",
        text: `Eksisterende: ${firstText}. Nytt tilbud: ${secondText}`,
        type: "tradeoff",
        insuranceKey: group.key,
        kind: "term",
        priority: 0,
      };
      presented.push({
        ...item,
        conceptId,
        presentationTier: "secondary",
        presentationType: "conditional-benefit",
        items: [item],
        presentationSources: [
          ...benefitSources(firstBenefits, "first"),
          ...benefitSources(secondBenefits, "second"),
        ],
      });
    }
  }

  return presented.sort((a, b) => {
    const firstConcept = configured.find((entry) => entry.id === a.conceptId);
    const secondConcept = configured.find((entry) => entry.id === b.conceptId);
    const firstTier = a.presentationTier ?? firstConcept?.defaultTier ?? "detail";
    const secondTier = b.presentationTier ?? secondConcept?.defaultTier ?? "detail";
    return tierOrder[firstTier] - tierOrder[secondTier] ||
      (configuredOrder.get(a.conceptId || "") ?? Number.MAX_SAFE_INTEGER) -
        (configuredOrder.get(b.conceptId || "") ?? Number.MAX_SAFE_INTEGER);
  });
}

// Bare visningslaget slår sammen rader. groupTerms og detaljvisningen beholder
// separate effektive verdier, grunnverdier og kildehenvisninger per datapunkt.
export function presentImportantDifferences(
  differences: Difference[],
  groups: InsuranceGroup[],
  matchingPlan: MatchingPlan | null,
): PresentedDifference[] {
  const prices = differences.filter((difference) => difference.kind === "price");
  const filtered = differences.filter((difference) => difference.kind !== "price" && (
    difference.kind !== "term" || !difference.termKey || !provenanceOnlyKey.test(difference.termKey))
  );
  const result: PresentedDifference[] = [...prices, ...filtered.filter((difference) => !difference.insuranceKey)];
  for (const group of groups) {
    const scoped = filtered.filter(difference => difference.insuranceKey === group.key && difference.objectScope === group.scopeId);
    result.push(...scoped.filter(difference => difference.kind === "object"));
    const families = groupDifferences(group, scoped.filter(difference => difference.kind !== "object"));
    families.forEach(family => { family.objectScope = group.scopeId; });
    const effectiveTerms = sortDetailedTerms(groupTerms(group, matchingPlan));
    for (const family of families) {
      if (family.presentationType === "service" || family.presentationType === "conditional-benefit") continue;
      const terms = effectiveTerms.filter(term => !provenanceOnlyKey.test(term.key) &&
        conceptForFactKey(group.key, term.key)?.id === family.conceptId);
      if (terms.length) family.details = coverageDetailPresentation(terms);
    }
    const totalskade = families.find((family) => family.conceptId === "bil.totalskade");
    if (totalskade) {
      // Read effective canonical facts, including limits that are equal on both
      // sides and therefore absent from the list of differences. Preserve full
      // wording and leave source/base facts in the existing detailed view.
      const terms = groupTerms(group, matchingPlan);
      const limits = ["nyverdi.alder", "nyverdi.km"].map((key) => terms.find((term) => term.key === key));
      const value = (side: "first" | "second") => limits
        .flatMap((term) => term?.[side] ? [term[side]!.replace(/\.\s*$/u, "")] : [])
        .join(" / ");
      const first = value("first");
      const second = value("second");
      if (first || second) totalskade.limitPair = {
        first: first || "Ikke dokumentert / kan ikke avgjøres",
        second: second || "Ikke dokumentert / kan ikke avgjøres",
      };
    }
    result.push(...families);
  }
  return result;
}
