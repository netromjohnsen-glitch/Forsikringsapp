import {
  canonicalInsuranceTypeLabel,
  comparisonTermIdentities,
  hasComparableInsuredValue,
  isUndocumentedTermValue,
  normalizeInsuranceType,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
} from "./insurance-normalization.ts";
import {
  coverageStatusLabel,
  deriveCanonicalCoverages,
  type CanonicalCoverage,
  type CoverageStatus,
} from "./coverage-status.ts";
import type { MatchingPlan } from "./hybrid-matching.ts";
import { materiallyEquivalentValues } from "./value-equivalence.ts";
import type { BuildingFactData } from "./building-facts.ts";

export type FactSource = {
  documentId: string;
  filename: string;
  termsNumber: string;
  effectiveFrom: string;
  page: number;
  section: string;
  note?: string;
  company?: string;
  url?: string;
};
export type BaseFact = { value: string; source: FactSource };
export type InsuranceTerm = {
  name: string;
  value: string;
  key?: string;
  coverageOrigin?: "document" | "catalog";
  deductibleClassification?: "standard" | "coverage" | "override" | "reference";
  structuredValue?: BuildingFactData;
  source?: FactSource;
  sources?: FactSource[];
  // Grunnverdier som er erstattet av dette effektive vilkåret, alltid på samme side.
  overriddenBase?: BaseFact[];
};
export type ComparedInsurance = {
  type: string;
  productName: string | null;
  canonicalProductName?: string | null;
  annualPremium: string | null;
  deductible: string | null;
  deductibleOrigin?: "customer" | "document" | "unknown";
  coverageSummary: string | null;
  importantTerms: InsuranceTerm[];
  catalogReference?: { providerId: string; productId: string; version: string | null } | null;
  // Settes bare når et eksakt katalogprodukt er eksplisitt valgt eller sikkert
  // identifisert. Katalogfakta uten denne bekreftelsen kan ikke bestemme dekning.
  catalogSelectionConfirmed?: boolean;
  addOnIds?: string[];
  addOns?: {
    id?: string;
    name: string;
    importantTerms: InsuranceTerm[];
    source?: { id: string } | null;
    coverageOrigin?: "document" | "catalog";
    classification?: "standard" | "add_on";
  }[];
};
export type ComparedDocument = {
  insuranceData: {
    company: string | null;
    totalAnnualPremium: string | null;
    insurances: ComparedInsurance[];
  };
};
export type InsuranceGroup = {
  key: string;
  label: string;
  first: ComparedInsurance[];
  second: ComparedInsurance[];
  leftKey: string | null;
  rightKey: string | null;
};
export type TermGroup = {
  key: string;
  label: string;
  first: string | null;
  second: string | null;
  firstValueCount: number;
  secondValueCount: number;
  firstSources: FactSource[];
  secondSources: FactSource[];
  firstBaseFacts: BaseFact[];
  secondBaseFacts: BaseFact[];
  firstDeductibleClassifications: string[];
  secondDeductibleClassifications: string[];
  firstMissingLabel: string;
  secondMissingLabel: string;
  firstCoverage: CanonicalCoverage | null;
  secondCoverage: CanonicalCoverage | null;
};
export type Difference = {
  title: string;
  text: string;
  type: "price" | "advantage" | "tradeoff";
  insuranceKey?: string;
  termKey?: string;
  kind: "price" | "deductible" | "add_on" | "term";
  priority: number;
  relatedTermKeys?: string[];
  coverageStatusDifference?: boolean;
};

type CollectedTerm = {
  label: string;
  first: string[];
  second: string[];
  firstSources: FactSource[];
  secondSources: FactSource[];
  firstBaseFacts: BaseFact[];
  secondBaseFacts: BaseFact[];
  firstDeductibleClassifications: string[];
  secondDeductibleClassifications: string[];
};

type CoveragePair = { first: CanonicalCoverage | null; second: CanonicalCoverage | null };

const normalize = (value: string | null) => (value || "").trim().toLocaleLowerCase("nb-NO");
export function parseNumber(value: string | null) {
  if (!value) return null;
  const amounts = value.match(/\d+(?:[ .]\d{3})*(?:,\d+)?/g);
  if (amounts?.length !== 1 || value.includes("%")) return null;
  const amount = Number(amounts[0].replace(/[ .]/g, "").replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
}
const formatPrice = (value: number) => `${new Intl.NumberFormat("nb-NO").format(value)} kr`;

export function groupInsurances(first: ComparedInsurance[], second: ComparedInsurance[], matchingPlan: MatchingPlan | null): InsuranceGroup[] {
  const groups = new Map<string, InsuranceGroup>();
  const semanticTypes = new Map(matchingPlan?.insuranceMatches.map((match) => [match.rightKey, match.leftKey]) || []);
  for (const [side, insurances] of [["first", first], ["second", second]] as const) {
    for (const insurance of insurances) {
      const typeContext = { productName: insurance.productName, coverageSummary: insurance.coverageSummary };
      const originalKey = normalizeInsuranceType(insurance.type, typeContext) || "ukjent forsikring";
      const key = side === "second" ? semanticTypes.get(originalKey) || originalKey : originalKey;
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          label: canonicalInsuranceTypeLabel(insurance.type, typeContext) || "Ukjent forsikring",
          first: [], second: [], leftKey: null, rightKey: null,
        };
        groups.set(key, group);
      }
      group[side].push(insurance);
      if (side === "first") group.leftKey = originalKey;
      else group.rightKey = originalKey;
    }
  }
  return [...groups.values()];
}

export function groupValue(insurances: ComparedInsurance[], field: "productName" | "annualPremium" | "deductible" | "coverageSummary") {
  const values = insurances.map((insurance) => {
    const value = insurance[field]?.trim();
    if (field !== "annualPremium" || !value) return value;
    if (insurance.importantTerms.some((term) => term.key === "premie.total" && term.value.trim() === value)) {
      return /trafikkforsikringsavgift/iu.test(value) ? value : `${value} inkl. trafikkforsikringsavgift`;
    }
    if (insurance.importantTerms.some((term) => term.key === "premie.ekskl_tfa" && term.value.trim() === value)) {
      return /trafikkforsikringsavgift/iu.test(value) ? value : `${value} ekskl. trafikkforsikringsavgift`;
    }
    return value;
  }).filter((value): value is string => Boolean(value));
  return [...new Set(values)].join(" · ") || null;
}

function selectedAddOns(insurance: ComparedInsurance, insuranceType: string) {
  const coverages = new Map(deriveCanonicalCoverages(insurance, insuranceType)
    .map((coverage) => [coverage.id, coverage]));
  return (insurance.addOns ?? []).filter((addOn) => {
    if (addOn.classification === "standard") return false;
    const key = normalizeTermName(addOn.name, { insuranceType });
    const coverage = coverages.get(key);
    return !coverage || coverage.status === "selected";
  });
}

export function groupAddOnNames(insurances: ComparedInsurance[], insuranceType: string): string | null {
  const addonDefinitions = relatedCoveragesForInsuranceType(insuranceType)
    .filter((definition) => definition.supplemental === true);
  const names = insurances.flatMap((insurance) => {
    const explicit = selectedAddOns(insurance, insuranceType);
    const keys = new Set(explicit.map((addon) => normalizeTermName(addon.name, { insuranceType })));
    // Reuse the coverage engine's effective selection, including documented
    // main values/details. Metadata establishes addon role; catalog alone
    // cannot establish the customer's selection.
    const effective = deriveCanonicalCoverages(insurance, insuranceType).filter((coverage) =>
      !keys.has(coverage.id) && addonDefinitions.some((definition) => definition.parentKey === coverage.id) &&
      coverage.status === "selected" && coverage.evidence.some((evidence) =>
        evidence.origin === "document" && evidence.status === "selected"));
    return [...explicit.map((addon) => addon.name), ...effective.map((coverage) => coverage.label)];
  });
  return [...new Set(names)].join(" · ") || null;
}

function knownAbsentAddOn(group: InsuranceGroup, presentSide: "first" | "second", source: FactSource): boolean {
  const present = group[presentSide];
  const missing = group[presentSide === "first" ? "second" : "first"];
  if (present.length !== 1 || missing.length !== 1 ||
      !present[0].catalogReference || !missing[0].catalogReference ||
      present[0].catalogReference.providerId !== missing[0].catalogReference.providerId) return false;
  return Boolean(present[0].addOns?.some((addOn) => addOn.source?.id === source.documentId)) &&
    !missing[0].addOns?.some((addOn) => addOn.source?.id === source.documentId);
}

function mergeCanonicalCoverages(items: CanonicalCoverage[]): CanonicalCoverage {
  if (items.length === 1) return items[0];
  const withEvidence = items.filter((item) => item.evidence.length > 0);
  const asserted = withEvidence.filter((item) => item.status !== "unknown");
  const statuses = new Set(asserted.map((item) => item.status));
  const status: CoverageStatus = statuses.size === 1 ? asserted[0].status : "unknown";
  const unique = <T>(values: T[], key: (value: T) => string) =>
    values.filter((value, index) => values.findIndex((candidate) => key(candidate) === key(value)) === index);
  return {
    id: items[0].id,
    label: items[0].label,
    status,
    summary: status === "selected"
      ? unique(withEvidence.flatMap((item) => item.summary ? [item.summary] : []), (value) => value).join(" · ") || null
      : null,
    details: unique(items.flatMap((item) => item.details), (detail) => `${detail.key}\u0000${detail.value}`),
    sources: unique(items.flatMap((item) => item.sources), (source) =>
      `${source.documentId}\u0000${source.section}\u0000${source.page}`),
    evidence: items.flatMap((item) => item.evidence),
    conflict: statuses.size > 1 || items.some((item) => item.conflict),
  };
}

function coverageMap(insurances: ComparedInsurance[], insuranceType: string): Map<string, CanonicalCoverage> {
  const grouped = new Map<string, CanonicalCoverage[]>();
  for (const insurance of insurances) {
    for (const coverage of deriveCanonicalCoverages(insurance, insuranceType)) {
      const existing = grouped.get(coverage.id) ?? [];
      existing.push(coverage);
      grouped.set(coverage.id, existing);
    }
  }
  return new Map([...grouped].map(([key, items]) => [key, mergeCanonicalCoverages(items)]));
}

function coveragePairs(group: InsuranceGroup): Map<string, CoveragePair> {
  const first = coverageMap(group.first, group.key);
  const second = coverageMap(group.second, group.key);
  const pairs = new Map<string, CoveragePair>();
  for (const key of new Set([...first.keys(), ...second.keys()])) {
    let left = first.get(key) ?? null;
    let right = second.get(key) ?? null;
    if (!(left?.evidence.length || right?.evidence.length)) continue;
    const unknown = (template: CanonicalCoverage): CanonicalCoverage => ({
      id: template.id, label: template.label, status: "unknown", summary: null,
      details: [], sources: [], evidence: [], conflict: false,
    });
    if (!left && right) left = unknown(right);
    if (!right && left) right = unknown(left);
    pairs.set(key, { first: left, second: right });
  }
  return pairs;
}

export function groupTerms(group: InsuranceGroup, matchingPlan: MatchingPlan | null): TermGroup[] {
  const terms = new Map<string, CollectedTerm>();
  const canonicalCoverages = coveragePairs(group);
  const semanticTerms = new Map<string, string>();
  if (group.leftKey && group.rightKey) {
    for (const match of matchingPlan?.termMatches || []) {
      if (match.leftTypeKey !== group.leftKey || match.rightTypeKey !== group.rightKey) continue;
      for (const rightKey of match.rightKeys) semanticTerms.set(rightKey, match.leftKey);
    }
  }
  const insuredValueConfirmed = hasComparableInsuredValue(
    group.first.flatMap((insurance) => insurance.importantTerms || []),
    group.second.flatMap((insurance) => insurance.importantTerms || []),
    group.first.length,
    group.second.length,
  );
  for (const side of ["first", "second"] as const) {
    for (const insurance of group[side]) {
      for (const { term, key: normalizedKey } of comparisonTermIdentities(insurance.importantTerms || [], {
        insuranceType: group.key, insuredValueConfirmed,
      })) {
        const semanticKey = side === "second" ? semanticTerms.get(normalizedKey) : undefined;
        const mapsDetailToParent = semanticKey && relatedCoveragesForInsuranceType(group.key).some((coverage) =>
          coverage.parentKey === semanticKey && coverage.details.some((detail) =>
            detail.key === normalizedKey || (detail.keyPrefix ? normalizedKey.startsWith(detail.keyPrefix) : false)
          )
        );
        // Semantisk én-til-flere-matching kan dokumentere sammenheng, men skal
        // ikke kollapse eksplisitte detaljfelt inn i hovedraden.
        const key = semanticKey && !mapsDetailToParent ? semanticKey : normalizedKey;
        const value = term.value?.trim();
        if (!key) continue;
        let entry = terms.get(key);
        if (!entry) {
          entry = {
            label: term.name, first: [], second: [], firstSources: [], secondSources: [],
            firstBaseFacts: [], secondBaseFacts: [],
            firstDeductibleClassifications: [], secondDeductibleClassifications: [],
          };
          terms.set(key, entry);
        }
        // En eksplisitt statusverdi er ikke dokumentasjon av selve dekningen.
        // Behold raden, slik at manglende-statusen fortsatt vises når ingen
        // godkjente detaljfelt kan dokumentere hoveddekningen.
        if (!value || isUndocumentedTermValue(value)) continue;
        if (!entry[side].some((existing) => normalize(existing) === normalize(value))) entry[side].push(value);
        if (isDeductibleKey(key)) {
          const classes = entry[`${side}DeductibleClassifications`];
          const classification = term.deductibleClassification || "unknown";
          if (!classes.includes(classification)) classes.push(classification);
        }
        for (const source of term.sources ?? (term.source ? [term.source] : [])) {
          if (!entry[`${side}Sources`].some((existing) =>
            existing.documentId === source.documentId && existing.section === source.section && existing.page === source.page
          )) entry[`${side}Sources`].push(source);
        }
        for (const base of term.overriddenBase ?? []) {
          if (!entry[`${side}BaseFacts`].some((existing) =>
            existing.value === base.value && existing.source.documentId === base.source.documentId &&
            existing.source.section === base.source.section && existing.source.page === base.source.page
          )) entry[`${side}BaseFacts`].push(base);
        }
      }
    }
  }
  for (const [key, pair] of canonicalCoverages) {
    let entry = terms.get(key);
    if (!entry) {
      entry = {
        label: pair.first?.label || pair.second?.label || key,
        first: [], second: [], firstSources: [], secondSources: [],
        firstBaseFacts: [], secondBaseFacts: [],
        firstDeductibleClassifications: [], secondDeductibleClassifications: [],
      };
      terms.set(key, entry);
    }
    for (const side of ["first", "second"] as const) {
      for (const source of pair[side]?.sources ?? []) {
        if (!entry[`${side}Sources`].some((existing) =>
          existing.documentId === source.documentId && existing.section === source.section && existing.page === source.page
        )) entry[`${side}Sources`].push(source);
      }
    }
  }
  const unknown = "Ikke dokumentert / kan ikke avgjøres";
  const unknownWithoutAddOn = `${unknown} (tillegget er ikke valgt)`;
  return [...terms].map(([key, entry]) => ({
    key,
    label: entry.label,
    first: entry.first.join(" · ") || null,
    second: entry.second.join(" · ") || null,
    firstValueCount: entry.first.length,
    secondValueCount: entry.second.length,
    firstSources: entry.firstSources,
    secondSources: entry.secondSources,
    firstBaseFacts: entry.firstBaseFacts,
    secondBaseFacts: entry.secondBaseFacts,
    firstDeductibleClassifications: entry.firstDeductibleClassifications,
    secondDeductibleClassifications: entry.secondDeductibleClassifications,
    firstMissingLabel: entry.secondSources.some((source) => knownAbsentAddOn(group, "second", source))
      ? unknownWithoutAddOn : unknown,
    secondMissingLabel: entry.firstSources.some((source) => knownAbsentAddOn(group, "first", source))
      ? unknownWithoutAddOn : unknown,
    firstCoverage: canonicalCoverages.get(key)?.first ?? null,
    secondCoverage: canonicalCoverages.get(key)?.second ?? null,
  })).filter((term) => {
    if (!["egenandel", "kaskoegenandel"].includes(term.key)) return true;
    return (["first", "second"] as const).some((side) =>
      term[side] && normalize(term[side]) !== normalize(groupValue(group[side], "deductible"))
    );
  });
}

function importance(key: string): number {
  if (/(nyverdi|totalskade|forsikringssum|erstatningsgrense)/u.test(key)) return 100;
  if (/(alder|\.km|kilometer|dager)/u.test(key)) return 90;
  if (/(invaliditet|dod|egenandel|\.grense)/u.test(key)) return 80;
  if (/(dekning|grense|leiebil|maskinskade|veihjelp)/u.test(key)) return 60;
  if (/(unntak|begrensning)/u.test(key)) return 35;
  return 20;
}

const isDeductibleKey = (key: string) => /(?:^|\.)(?:egenandel|kaskoegenandel)(?:\.|$)/u.test(key);

function directlyComparableSpecialDeductible(term: TermGroup): boolean {
  // «coverage» angir et særskilt vilkårsbeløp, men dokumenterer ikke at det
  // overstyrer kundens avtale. Bare en uttrykkelig «override» er sikker her.
  return term.firstDeductibleClassifications.length === 1 &&
    term.secondDeductibleClassifications.length === 1 &&
    term.firstDeductibleClassifications[0] === "override" &&
    term.secondDeductibleClassifications[0] === "override";
}

// Tallene brukes bare til å rangere dokumenterte forskjeller. Vi trekker
// ingen konklusjon om dekning når en verdi mangler eller ordlyden er ulik.
function comparableQuantities(value: string): Map<string, number[]> {
  const quantities = new Map<string, number[]>();
  for (const match of value.matchAll(/(\d[\d\s.,]*)\s*(kroner|kr|kilometer|km|dager|dag|år|prosent|%)(?!\p{L})/giu)) {
    const amount = Number(match[1].replace(/[\s.]/gu, "").replace(",", "."));
    if (!Number.isFinite(amount)) continue;
    const unit = ({ kroner: "kr", kilometer: "km", dager: "dag", prosent: "%" } as Record<string, string>)[match[2].toLowerCase()] || match[2].toLowerCase();
    quantities.set(unit, [...new Set([...(quantities.get(unit) || []), amount])].sort((a, b) => a - b));
  }
  return quantities;
}

function comparablePriority(term: TermGroup): number {
  const first = comparableQuantities(term.first || "");
  const second = comparableQuantities(term.second || "");
  const sharedUnits = [...first.keys()].filter((unit) => second.has(unit));
  if (sharedUnits.some((unit) => JSON.stringify(first.get(unit)) !== JSON.stringify(second.get(unit)))) {
    return 120 + importance(term.key) / 10;
  }
  // Like mål kan fortsatt ha ulike vilkår (for eksempel «før»/«høyst»).
  // De vises i detaljene, men får ikke samme plass som ulike tallgrenser.
  return (sharedUnits.length ? 90 : 101) + importance(term.key) / 10;
}

function isCoverageStatusDifference(term: TermGroup): boolean {
  const first = term.firstCoverage;
  const second = term.secondCoverage;
  if (!first || !second) return false;
  if (first.status !== second.status) return !(first.status === "unknown" && second.status === "unknown");
  if (first.status !== "selected" || !first.summary || !second.summary) return false;
  return !materiallyEquivalentValues(first.summary, second.summary);
}

function coverageDifferencePriority(term: TermGroup): number {
  const first = term.firstCoverage!.status;
  const second = term.secondCoverage!.status;
  if (new Set([first, second]).has("unknown")) return 85;
  if (first !== second) return 140;
  return 125 + importance(term.key) / 10;
}

function addOnSummary(
  addOn: NonNullable<ComparedInsurance["addOns"]>[number],
  comparedKeys: Set<string>,
  otherDocumentedKeys: Set<string>,
): string {
  const candidates = addOn.importantTerms.filter((term) =>
    term.value && term.key && !comparedKeys.has(term.key) && !isDeductibleKey(term.key) &&
    !/(?:^|\.)(?:unntak|bonus|kostnader)$/.test(term.key)
  );
  // Grenser for samme dekning hører sammen, for eksempel alder og kilometer.
  const paired = candidates.find((term) => term.key?.endsWith(".alder") &&
    candidates.some((other) => other.key === `${term.key?.slice(0, -".alder".length)}.km`));
  const selected = paired
    ? [paired, candidates.find((term) => term.key === `${paired.key?.slice(0, -".alder".length)}.km`)!]
    : [...candidates].sort((a, b) => importance(b.key || b.name) - importance(a.key || a.name)).slice(0, 2);
  if (!selected.length) return "";
  const missingOnOtherSide = selected.some((term) => term.key && !otherDocumentedKeys.has(term.key));
  return ` Dokumenterte vilkår: ${selected.map((term) => `${term.name}: ${term.value}`).join("; ")}.` +
    (missingOnOtherSide ? " Tilsvarende verdi er ikke dokumentert på motpartens side." : "");
}

export function createDifferences(first: ComparedDocument, second: ComparedDocument, groups: InsuranceGroup[], matchingPlan: MatchingPlan | null): Difference[] {
  const differences: Difference[] = [];
  const sameCompany = first.insuranceData.company && second.insuranceData.company &&
    normalize(first.insuranceData.company) === normalize(second.insuranceData.company);
  const firstCompany = sameCompany ? `Eksisterende avtale hos ${first.insuranceData.company}` : first.insuranceData.company || "Eksisterende avtale";
  const secondCompany = sameCompany ? `Nytt tilbud fra ${second.insuranceData.company}` : second.insuranceData.company || "Nytt tilbud";
  const firstTotal = parseNumber(first.insuranceData.totalAnnualPremium);
  const secondTotal = parseNumber(second.insuranceData.totalAnnualPremium);
  if (firstTotal !== null && secondTotal !== null && firstTotal !== secondTotal) differences.push({
    title: "Totalpris", text: `${firstTotal < secondTotal ? firstCompany : secondCompany} er ${formatPrice(Math.abs(firstTotal - secondTotal))} billigere per år.`,
    type: "price", kind: "price", priority: 0,
  });

  for (const group of groups) {
    if (!group.first.length || !group.second.length) {
      differences.push({
        title: group.label,
        text: group.first.length
          ? `Registrert i ${firstCompany}; tilsvarende forsikring er ikke dokumentert i ${secondCompany}.`
          : `Registrert i ${secondCompany}; tilsvarende forsikring er ikke dokumentert i ${firstCompany}.`,
        type: "tradeoff", insuranceKey: group.key, kind: "term", priority: 70,
      });
      continue;
    }
    if (group.first.length === 1 && group.second.length === 1) {
      const firstPrice = parseNumber(group.first[0].annualPremium);
      const secondPrice = parseNumber(group.second[0].annualPremium);
      if (firstPrice !== null && secondPrice !== null && firstPrice !== secondPrice) differences.push({
        title: "Pris", text: `${firstPrice < secondPrice ? firstCompany : secondCompany} er ${formatPrice(Math.abs(firstPrice - secondPrice))} billigere per år.`,
        type: "price", insuranceKey: group.key, kind: "price", priority: 0,
      });
    }
    const terms = groupTerms(group, matchingPlan);
    const coverageDifferences = terms.filter(isCoverageStatusDifference);
    const comparableDifferences = terms
      .filter((term) => !term.firstCoverage && !term.secondCoverage &&
        term.first && term.second && term.firstValueCount === 1 && term.secondValueCount === 1 &&
        !materiallyEquivalentValues(term.first, term.second) &&
        (!isDeductibleKey(term.key) || directlyComparableSpecialDeductible(term)))
      .sort((a, b) => importance(b.key) - importance(a.key));
    const comparedKeys = new Set([...coverageDifferences, ...comparableDifferences].map((term) => term.key));
    const firstDocumentedKeys = new Set(terms.filter((term) => term.first ||
      (term.firstCoverage && term.firstCoverage.status !== "unknown")).map((term) => term.key));
    const secondDocumentedKeys = new Set(terms.filter((term) => term.second ||
      (term.secondCoverage && term.secondCoverage.status !== "unknown")).map((term) => term.key));
    // Samme dokumenterte vilkår kan ha ulike nøkkelnavn etter semantisk matching.
    for (const match of matchingPlan?.termMatches ?? []) {
      if (match.leftTypeKey !== group.leftKey || match.rightTypeKey !== group.rightKey) continue;
      for (const keys of [firstDocumentedKeys, secondDocumentedKeys]) {
        if (keys.has(match.leftKey)) match.rightKeys.forEach((key) => keys.add(key));
      }
    }
    const firstDeductible = groupValue(group.first, "deductible");
    const secondDeductible = groupValue(group.second, "deductible");
    if (firstDeductible && secondDeductible && normalize(firstDeductible) !== normalize(secondDeductible)) {
      const left = parseNumber(firstDeductible);
      const right = parseNumber(secondDeductible);
      const customerSpecific = group.first.length === 1 && group.second.length === 1 &&
        ["customer", "document"].includes(group.first[0].deductibleOrigin || "") &&
        ["customer", "document"].includes(group.second[0].deductibleOrigin || "");
      differences.push({
        title: "Egenandel",
        text: customerSpecific
          ? `Oppgitt generell egenandel – eksisterende: ${firstDeductible}; nytt tilbud: ${secondDeductible}. ` +
            (left !== null && right !== null
              ? `${left < right ? firstCompany : secondCompany} har ${formatPrice(Math.abs(left - right))} lavere kundespesifikk egenandel. ` : "") +
            "Særskilte egenandeler kan gjelde for enkelte skadetyper."
          : `${firstCompany}: ${firstDeductible}. ${secondCompany}: ${secondDeductible}. ` +
            "Egenandelenes grunnlag er ikke bekreftet som kundespesifikt; se detaljene.",
        type: "advantage", insuranceKey: group.key, kind: "deductible", priority: customerSpecific ? 135 : 75,
      });
    }
    const bothCatalog = group.first.length === 1 && group.second.length === 1 &&
      group.first[0].catalogReference && group.second[0].catalogReference &&
      group.first[0].catalogReference.providerId === group.second[0].catalogReference.providerId;
    const summarizedSources = new Set<string>();
    if (bothCatalog) {
      const leftAddOns = new Map(selectedAddOns(group.first[0], group.key).map((addOn) => [addOn.id, addOn]));
      const rightAddOns = new Map(selectedAddOns(group.second[0], group.key).map((addOn) => [addOn.id, addOn]));
      for (const [id, addOn] of leftAddOns) {
        if (!rightAddOns.has(id)) {
          if (addOn.source?.id) summarizedSources.add(addOn.source.id);
          differences.push({
          title: addOn.name,
          text: `${firstCompany} har tillegget ${addOn.name}; det er ikke valgt i ${secondCompany}.${addOnSummary(addOn, comparedKeys, secondDocumentedKeys)}`,
          type: "tradeoff", insuranceKey: group.key, kind: "add_on", priority: 90,
          relatedTermKeys: addOn.importantTerms.flatMap((term) => term.key ? [term.key] : []),
          });
        }
      }
      for (const [id, addOn] of rightAddOns) {
        if (!leftAddOns.has(id)) {
          if (addOn.source?.id) summarizedSources.add(addOn.source.id);
          differences.push({
          title: addOn.name,
          text: `${secondCompany} har tillegget ${addOn.name}; det er ikke valgt i ${firstCompany}.${addOnSummary(addOn, comparedKeys, firstDocumentedKeys)}`,
          type: "tradeoff", insuranceKey: group.key, kind: "add_on", priority: 90,
          relatedTermKeys: addOn.importantTerms.flatMap((term) => term.key ? [term.key] : []),
          });
        }
      }
    }
    for (const term of coverageDifferences) differences.push({
      title: term.label,
      text: `Eksisterende: ${coverageStatusLabel(term.firstCoverage!.status, term.firstCoverage!.summary)}. ` +
        `Nytt tilbud: ${coverageStatusLabel(term.secondCoverage!.status, term.secondCoverage!.summary)}.`,
      type: "tradeoff", insuranceKey: group.key, termKey: term.key, kind: "term",
      priority: coverageDifferencePriority(term),
      coverageStatusDifference: true,
    });
    for (const term of comparableDifferences) differences.push({
      title: term.label,
      text: `Eksisterende: ${term.first}. Nytt tilbud: ${term.second}.`,
      type: "tradeoff", insuranceKey: group.key, termKey: term.key, kind: "term", priority: comparablePriority(term),
    });
    // Fravær av tekst er ikke bevis for at en dekning mangler. Fremhev bare
    // dokumentert dekning som ikke finnes i motpartens valgte vilkår.
    const oneSidedCoverage = terms.filter((term) =>
      !term.firstCoverage && !term.secondCoverage && Boolean(term.first) !== Boolean(term.second) &&
      /(?:^|\.)(?:dekning|omfang)$/.test(term.key) &&
      ![...term.firstSources, ...term.secondSources].some((source) => summarizedSources.has(source.documentId))
    ).slice(0, 2);
    for (const term of oneSidedCoverage) differences.push({
      title: term.label,
      text: term.first
        ? `Eksisterende: ${term.first}. Tilsvarende dekning er ikke funnet i vilkårene for nytt tilbud.`
        : `Nytt tilbud: ${term.second}. Tilsvarende dekning er ikke funnet i vilkårene for eksisterende avtale.`,
      type: "tradeoff", insuranceKey: group.key, termKey: term.key, kind: "term", priority: 80,
    });
  }
  return differences;
}
