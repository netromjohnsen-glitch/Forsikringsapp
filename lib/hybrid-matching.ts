import {
  hasComparableInsuredValue,
  isKnownInsuranceType,
  normalizeInsuranceType,
  normalizeTermName,
} from "./insurance-normalization.ts";

export type InsuranceForMatching = {
  type: string;
  productName: string | null;
  coverageSummary: string | null;
  importantTerms: { name: string; value: string; key?: string }[];
};

type CandidateTerm = { id: string; name: string; value: string };
type TypeCandidate = {
  leftId: string;
  rightId: string;
  leftKey: string;
  rightKey: string;
  left: { type: string; productName: string; coverageSummary: string };
  right: { type: string; productName: string; coverageSummary: string };
};
type TermScope = {
  id: string;
  leftTypeKey: string;
  rightTypeKey: string;
  insuranceType: string;
  leftProductName: string;
  rightProductName: string;
  leftTerms: CandidateTerm[];
  rightTerms: CandidateTerm[];
};

export type MatchingBatch = { typeCandidates: TypeCandidate[]; termScopes: TermScope[] };
export type MatchDecision = {
  kind: "insurance" | "term";
  scopeId: string;
  leftId: string;
  rightIds: string[];
  decision: "match" | "no_match" | "uncertain";
  confidence: number;
  reason: string;
};
export type MatchAssessment = MatchDecision & { accepted: boolean };
export type MatchingPlan = {
  insuranceMatches: { leftKey: string; rightKey: string; confidence: number; reason: string }[];
  termMatches: { leftTypeKey: string; rightTypeKey: string; leftKey: string; rightKeys: string[]; confidence: number; reason: string }[];
  assessments: MatchAssessment[];
};

export const MATCH_CONFIDENCE_THRESHOLD = 0.95;
const MULTI_TERM_THRESHOLD = 0.97;
const emptyPlan = (): MatchingPlan => ({ insuranceMatches: [], termMatches: [], assessments: [] });
const short = (value: string | null, max: number) => (value || "").trim().slice(0, max);

function indexByType(insurances: readonly InsuranceForMatching[]) {
  const map = new Map<string, InsuranceForMatching[]>();
  for (const insurance of insurances) {
    const key = normalizeInsuranceType(insurance.type, {
      productName: insurance.productName,
      coverageSummary: insurance.coverageSummary,
    });
    if (!key) continue;
    const existing = map.get(key) || [];
    existing.push(insurance);
    map.set(key, existing);
  }
  return map;
}

function protectedCompound(key: string): boolean {
  // Et kombinert hus/fritidsbolig-produkt kan ikke likestilles med bare bolig.
  return key.includes("fritidsbolig") && (key.includes("hus") || key.includes("bolig"));
}

function mayCompareTypes(leftKey: string, rightKey: string): boolean {
  if (leftKey === rightKey) return true;
  if (protectedCompound(leftKey) || protectedCompound(rightKey)) return false;
  if (isKnownInsuranceType(leftKey) && isKnownInsuranceType(rightKey)) return false;
  const families = (key: string) => new Set(key.split(" ").map((part) => normalizeInsuranceType(part)).filter(isKnownInsuranceType));
  const leftFamilies = families(leftKey);
  const rightFamilies = families(rightKey);
  if (leftFamilies.size && rightFamilies.size && ![...leftFamilies].some((family) => rightFamilies.has(family))) return false;
  return true;
}

function groupedTerms(insurances: InsuranceForMatching[], typeKey: string, insuredValueConfirmed: boolean, prefix: "l" | "r") {
  const grouped = new Map<string, CandidateTerm>();
  for (const insurance of insurances) {
    for (const term of insurance.importantTerms || []) {
      const key = term.key || normalizeTermName(term.name, { insuranceType: typeKey, insuredValueConfirmed });
      if (!key || !term.value?.trim()) continue;
      const current = grouped.get(key);
      if (current) {
        if (!current.value.includes(term.value.trim())) current.value += ` · ${short(term.value, 220)}`;
      } else {
        grouped.set(key, { id: `${prefix}:${key}`, name: short(term.name, 100), value: short(term.value, 220) });
      }
    }
  }
  return grouped;
}

function termScope(leftKey: string, rightKey: string, left: InsuranceForMatching[], right: InsuranceForMatching[]): TermScope | null {
  // Flere objekter av samme type gir ikke nok kontekst for semantisk vilkårsmatching.
  if (left.length !== 1 || right.length !== 1) return null;
  const insuredValueConfirmed = hasComparableInsuredValue(
    left[0].importantTerms || [], right[0].importantTerms || [], 1, 1,
  );
  const leftTerms = groupedTerms(left, leftKey, insuredValueConfirmed, "l");
  const rightTerms = groupedTerms(right, leftKey, insuredValueConfirmed, "r");
  for (const key of leftTerms.keys()) {
    if (rightTerms.has(key)) {
      leftTerms.delete(key);
      rightTerms.delete(key);
    }
  }
  if (!leftTerms.size || !rightTerms.size) return null;
  return {
    id: `terms:${leftKey}|${rightKey}`,
    leftTypeKey: leftKey,
    rightTypeKey: rightKey,
    insuranceType: left[0].type,
    leftProductName: short(left[0].productName, 100),
    rightProductName: short(right[0].productName, 100),
    leftTerms: Array.from(leftTerms.values()).slice(0, 12),
    rightTerms: Array.from(rightTerms.values()).slice(0, 12),
  };
}

export function buildMatchingBatch(left: readonly InsuranceForMatching[], right: readonly InsuranceForMatching[]): MatchingBatch {
  const leftTypes = indexByType(left);
  const rightTypes = indexByType(right);
  const typeCandidates: TypeCandidate[] = [];
  const termScopes: TermScope[] = [];

  for (const [leftKey, leftItems] of leftTypes) {
    const deterministicRight = rightTypes.get(leftKey);
    if (deterministicRight) {
      const scope = termScope(leftKey, leftKey, leftItems, deterministicRight);
      if (scope) termScopes.push(scope);
      continue;
    }
    for (const [rightKey, rightItems] of rightTypes) {
      if (leftTypes.has(rightKey) || !mayCompareTypes(leftKey, rightKey)) continue;
      if (leftItems.length !== 1 || rightItems.length !== 1) continue;
      typeCandidates.push({
        leftId: `l:${leftKey}`, rightId: `r:${rightKey}`, leftKey, rightKey,
        left: { type: short(leftItems[0].type, 100), productName: short(leftItems[0].productName, 100), coverageSummary: short(leftItems[0].coverageSummary, 240) },
        right: { type: short(rightItems[0].type, 100), productName: short(rightItems[0].productName, 100), coverageSummary: short(rightItems[0].coverageSummary, 240) },
      });
      const scope = termScope(leftKey, rightKey, leftItems, rightItems);
      if (scope) termScopes.push(scope);
      if (typeCandidates.length >= 12) break;
    }
  }
  const boundedScopes: TermScope[] = [];
  let remainingTerms = 80;
  for (const scope of termScopes) {
    if (boundedScopes.length >= 12 || remainingTerms < 2) break;
    const perSide = Math.floor(remainingTerms / 2);
    const bounded = { ...scope, leftTerms: scope.leftTerms.slice(0, perSide), rightTerms: scope.rightTerms.slice(0, perSide) };
    if (!bounded.leftTerms.length || !bounded.rightTerms.length) continue;
    boundedScopes.push(bounded);
    remainingTerms -= bounded.leftTerms.length + bounded.rightTerms.length;
  }
  return { typeCandidates, termScopes: boundedScopes };
}

function validDecision(value: unknown, batch: MatchingBatch): value is MatchDecision {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (item.kind !== "insurance" && item.kind !== "term") return false;
  if (item.decision !== "match" && item.decision !== "no_match" && item.decision !== "uncertain") return false;
  if (typeof item.scopeId !== "string" || typeof item.leftId !== "string") return false;
  if (!Array.isArray(item.rightIds) || item.rightIds.length > 3 || !item.rightIds.every((id) => typeof id === "string")) return false;
  if (new Set(item.rightIds).size !== item.rightIds.length) return false;
  const rightIds = item.rightIds as string[];
  if (typeof item.confidence !== "number" || !Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1) return false;
  if (typeof item.reason !== "string" || !item.reason.trim() || item.reason.length > 300) return false;
  if (item.kind === "insurance") {
    if (item.scopeId !== "types" || rightIds.length > 1) return false;
    return batch.typeCandidates.some((candidate) => candidate.leftId === item.leftId &&
      (rightIds.length === 0 || candidate.rightId === rightIds[0]));
  }
  const scope = batch.termScopes.find((entry) => entry.id === item.scopeId);
  return Boolean(scope && scope.leftTerms.some((term) => term.id === item.leftId) &&
    rightIds.every((id) => scope.rightTerms.some((term) => term.id === id)));
}

function sharesCoverageRoot(left: string, rights: string[]): boolean {
  const root = left.toLocaleLowerCase("nb-NO").match(/[\p{L}]{5,}/u)?.[0];
  return Boolean(root && rights.every((right) => right.toLocaleLowerCase("nb-NO").includes(root)));
}

export async function runHybridMatching(
  left: readonly InsuranceForMatching[],
  right: readonly InsuranceForMatching[],
  requestSemantic: (batch: MatchingBatch) => Promise<unknown>,
): Promise<MatchingPlan> {
  const batch = buildMatchingBatch(left, right);
  if (!batch.typeCandidates.length && !batch.termScopes.length) return emptyPlan();

  try {
    const response = await requestSemantic(batch);
    if (!response || typeof response !== "object" || !Array.isArray((response as { decisions?: unknown }).decisions)) return emptyPlan();
    const decisions: unknown[] = (response as { decisions: unknown[] }).decisions;
    if (decisions.length > 120 || !decisions.every((item) => validDecision(item, batch))) return emptyPlan();
    const validated = decisions as MatchDecision[];
    const usage = new Map<string, number>();
    for (const item of validated) {
      const participant = `${item.kind}:${item.scopeId}:${item.leftId}`;
      usage.set(participant, (usage.get(participant) || 0) + 1);
      for (const id of item.rightIds) {
        const rightParticipant = `${item.kind}:${item.scopeId}:${id}`;
        usage.set(rightParticipant, (usage.get(rightParticipant) || 0) + 1);
      }
    }
    const assessments: MatchAssessment[] = validated.map((item) => {
      const threshold = item.rightIds.length > 1 ? MULTI_TERM_THRESHOLD : MATCH_CONFIDENCE_THRESHOLD;
      let accepted = item.decision === "match" && item.rightIds.length > 0 && item.confidence >= threshold &&
        usage.get(`${item.kind}:${item.scopeId}:${item.leftId}`) === 1 &&
        item.rightIds.every((id) => usage.get(`${item.kind}:${item.scopeId}:${id}`) === 1);
      if (accepted && item.kind === "term" && item.rightIds.length > 1) {
        const scope = batch.termScopes.find((entry) => entry.id === item.scopeId)!;
        const leftName = scope.leftTerms.find((term) => term.id === item.leftId)!.name;
        const rightNames = item.rightIds.map((id) => scope.rightTerms.find((term) => term.id === id)!.name);
        accepted = sharesCoverageRoot(leftName, rightNames);
      }
      return { ...item, accepted };
    });

    const insuranceMatches = assessments.filter((item) => item.accepted && item.kind === "insurance").map((item) => {
      const candidate = batch.typeCandidates.find((entry) => entry.leftId === item.leftId && entry.rightId === item.rightIds[0])!;
      return { leftKey: candidate.leftKey, rightKey: candidate.rightKey, confidence: item.confidence, reason: item.reason };
    });
    const termMatches = assessments.filter((item) => item.accepted && item.kind === "term").flatMap((item) => {
      const scope = batch.termScopes.find((entry) => entry.id === item.scopeId)!;
      if (scope.leftTypeKey !== scope.rightTypeKey &&
          !insuranceMatches.some((match) => match.leftKey === scope.leftTypeKey && match.rightKey === scope.rightTypeKey)) return [];
      return [{
        leftTypeKey: scope.leftTypeKey,
        rightTypeKey: scope.rightTypeKey,
        leftKey: item.leftId.slice(2),
        rightKeys: item.rightIds.map((id) => id.slice(2)),
        confidence: item.confidence,
        reason: item.reason,
      }];
    });
    return { insuranceMatches, termMatches, assessments };
  } catch {
    return emptyPlan();
  }
}
