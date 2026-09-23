import { productCatalog } from "./product-catalog.ts";
import { canonicalTermIdsForType, isKnownInsuranceType, normalizeInsuranceType } from "./insurance-normalization.ts";

const registry = new Map<string, Set<string>>();
function knownKeys(type: string) {
  let keys = registry.get(type);
  if (!keys) {
    keys = new Set(canonicalTermIdsForType(type));
    for (const product of productCatalog.products.filter((entry) => normalizeInsuranceType(entry.insuranceType) === type)) {
      for (const component of product.componentIds ?? []) for (const fact of productCatalog.facts?.[component] ?? []) keys.add(fact.key);
    }
    for (const addOn of productCatalog.addOns ?? []) {
      const types = addOn.insuranceTypes ?? productCatalog.products.filter((product) => product.providerId === addOn.providerId).map((product) => product.insuranceType);
      if (types.some((entry) => normalizeInsuranceType(entry) === type)) for (const fact of productCatalog.facts?.[addOn.componentId] ?? []) keys.add(fact.key);
    }
    registry.set(type, keys);
  }
  return keys;
}
const reasons = ["NO_SAFE_DETERMINISTIC_MATCH", "NO_EXPLICIT_ALIAS", "DIFFERENT_CANONICAL_SCOPE", "NO_COUNTERPART", "CANDIDATE_LIMIT", "SENT_TO_SEMANTIC", "SEMANTIC_ACCEPTED", "SEMANTIC_REJECTED", "NO_DECISION", "INVALID_RESPONSE", "REQUEST_FAILED", "LOW_CONFIDENCE", "PARTICIPANT_CONFLICT", "COVERAGE_ROOT_MISMATCH", "TYPE_MATCH_REQUIRED", "MODEL_NO_MATCH", "MODEL_UNCERTAIN", "RESPONSE_PROCESSED"] as const;
type Reason = typeof reasons[number];
export type AuditCandidate = {
  index: number; scope: number; kind: "term" | "insurance"; side: "left" | "right";
  insuranceType: string; identity: "known" | "unknown"; coverageId: string; detailId: string;
  stage: "CANONICAL_KEY" | "EXPLICIT_ALIAS" | "UNRESOLVED";
  resolutionReason: "NO_SAFE_DETERMINISTIC_MATCH" | "NO_EXPLICIT_ALIAS";
  reason: Reason; sent: boolean; proposedMatch: boolean; accepted: boolean;
};
type AuditDecision = { left: number; right: number[]; proposedMatch: boolean; accepted: boolean; reason: Reason };
export type SemanticAudit = { candidates: AuditCandidate[]; decisions: AuditDecision[]; omitted: number; outcome: Reason };
const safeType = (type: string) => isKnownInsuranceType(type) ? type : "unknown";
function identity(type: string, key: string) {
  const known = knownKeys(type).has(key);
  return { identity: known ? "known" as const : "unknown" as const,
    coverageId: known && key.includes(".") ? key.split(".")[0] : "unknown",
    detailId: known ? key : "unknown" };
}
// Revalidate at the logging boundary: no caller-supplied strings, prefixes or hashes are trusted.
export function sanitizeSemanticAudit(input: SemanticAudit): SemanticAudit {
  return {
    candidates: input.candidates.slice(0, 240).map((item, index) => {
      const insuranceType = safeType(item.insuranceType);
      const ids = identity(insuranceType, item.detailId);
      return { index, scope: Number.isSafeInteger(item.scope) && item.scope >= 0 && item.scope < 240 ? item.scope : 0, kind: item.kind === "insurance" ? "insurance" : "term",
        side: item.side === "right" ? "right" : "left", insuranceType, ...ids,
        stage: ids.identity === "unknown" ? "UNRESOLVED" : item.stage === "EXPLICIT_ALIAS" ? "EXPLICIT_ALIAS" : "CANONICAL_KEY",
        resolutionReason: ids.identity === "unknown" ? "NO_EXPLICIT_ALIAS" : "NO_SAFE_DETERMINISTIC_MATCH",
        reason: reasons.includes(item.reason) ? item.reason : "NO_SAFE_DETERMINISTIC_MATCH",
        sent: item.sent === true, proposedMatch: item.proposedMatch === true, accepted: item.accepted === true };
    }),
    decisions: input.decisions.slice(0, 120).filter((item) => Number.isSafeInteger(item.left) && item.left >= 0 && item.left < Math.min(input.candidates.length, 240)).map((item) => ({
      left: item.left, right: item.right.filter((index) => Number.isSafeInteger(index) && index >= 0 && index < Math.min(input.candidates.length, 240)).slice(0, 3),
      proposedMatch: item.proposedMatch === true, accepted: item.accepted === true,
      reason: reasons.includes(item.reason) ? item.reason : "SEMANTIC_REJECTED",
    })),
    omitted: Number.isSafeInteger(input.omitted) && input.omitted >= 0 ? input.omitted : 0,
    outcome: reasons.includes(input.outcome) ? input.outcome : "INVALID_RESPONSE",
  };
}
export function createSemanticAudit() {
  const candidates: AuditCandidate[] = [];
  const decisions: AuditDecision[] = [];
  const scopes = new Map<string, number>();
  // Raw lookup handles stay in memory only and never cross the logging boundary.
  const handles = new Map<string, AuditCandidate>();
  let omitted = 0;
  let outcome: Reason = "NO_DECISION";
  return {
    add(scope: string, id: string, type: string, key: string, explicit: boolean, reason: Reason, kind: "term" | "insurance" = "term") {
      const handle = `${scope}\0${id}`;
      if (handles.has(handle)) return;
      if (candidates.length >= 240) { omitted++; return; }
      const insuranceType = safeType(normalizeInsuranceType(type));
      const ids = identity(insuranceType, key);
      if (!scopes.has(scope)) scopes.set(scope, scopes.size);
      const item: AuditCandidate = { index: candidates.length, scope: scopes.get(scope)!, kind, side: id.startsWith("r:") ? "right" : "left",
        insuranceType, ...ids, stage: ids.identity === "unknown" ? "UNRESOLVED" : explicit ? "CANONICAL_KEY" : "EXPLICIT_ALIAS",
        resolutionReason: ids.identity === "unknown" ? "NO_EXPLICIT_ALIAS" : "NO_SAFE_DETERMINISTIC_MATCH",
        reason, sent: false, proposedMatch: false, accepted: false };
      handles.set(handle, item); candidates.push(item);
    },
    sent(scope: string, id: string) { const item = handles.get(`${scope}\0${id}`); if (item) { item.sent = true; item.reason = "SENT_TO_SEMANTIC"; } },
    decision(scope: string, ids: string[], proposed: boolean, accepted: boolean, reason: Reason) {
      const left = handles.get(`${scope}\0${ids[0]}`);
      if (left && decisions.length < 120) decisions.push({ left: left.index,
        right: ids.slice(1).flatMap((id) => { const item = handles.get(`${scope}\0${id}`); return item ? [item.index] : []; }),
        proposedMatch: proposed, accepted, reason });
      for (const id of ids) { const item = handles.get(`${scope}\0${id}`); if (item) {
        item.proposedMatch ||= proposed; item.accepted ||= accepted;
        item.reason = item.accepted ? "SEMANTIC_ACCEPTED" : "SEMANTIC_REJECTED";
      } }
    },
    outcome(reason: Reason) { outcome = reason; },
    snapshot(): SemanticAudit { return sanitizeSemanticAudit({ candidates, decisions, omitted, outcome }); },
  };
}
export type SemanticAuditCollector = ReturnType<typeof createSemanticAudit>;
