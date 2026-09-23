import type { ConsolidationInfo } from "./object-consolidation.ts";
import { canonicalInsuranceTypeLabel, isKnownInsuranceType, normalizeInsuranceType } from "./insurance-normalization.ts";
import { defaultIdentifierStrategies, type ObjectIdentifier, type IdentifierStrategies } from "./object-identity-strategies.ts";
export { normalizeObjectIdentifier, type ObjectIdentifier, type IdentifierStrategies } from "./object-identity-strategies.ts";

export type IdentifiedObject = { consolidation?: ConsolidationInfo; type: string; productName?: string | null; coverageSummary?: string | null; objectIdentifiers?: ObjectIdentifier[] };
export type ObjectMatch = { scopeId: string; insuranceType: string; label: string } & (
  | { status: "matched"; reason: "EXACT_OBJECT_ID" | "UNIQUE_TYPE_PAIR"; existing: [number]; offer: [number] }
  | { status: "unmatched_existing" | "unmatched_offer"; reason: "MISSING_TYPE" | "MISSING_OBJECT"; existing: number[]; offer: number[] }
  | { status: "ambiguous"; reason: "INSUFFICIENT_IDENTITY" | "IDENTITY_CONFLICT" | "CONSOLIDATION_CONFLICT"; existing: number[]; offer: number[] }
);
type MatchDetails<T = ObjectMatch> = T extends ObjectMatch ? Omit<T, "scopeId" | "insuranceType" | "label"> : never;
export type MissingEvidence = "CONFIRMED_ABSENT_FROM_ANALYZED_SET" | "NOT_FOUND_WITH_PARTIAL_FAILURE";
export type ObjectComparisonContext = { failedExisting?: number; failedOffer?: number };

// Extensions register exact normalizers per canonical type; the matching core
// knows neither vehicle categories nor registration-number formats.
export function objectIdentity(object: IdentifiedObject, strategies: IdentifierStrategies) {
  const insuranceType = normalizeInsuranceType(object.type, object);
  const tokens: [string, string][] = [];
  const keys = new Map<string, string>(); let invalid = object.consolidation?.status === "unresolved";
  for (const entry of object.objectIdentifiers ?? []) {
    const value = strategies[insuranceType]?.[entry.type]?.(entry.value) ?? null;
    if (value) tokens.push([entry.type, value]);
    if (!value || (keys.has(entry.type) && keys.get(entry.type) !== value)) invalid = true;
    else keys.set(entry.type, value);
  }
  return { insuranceType, keys, tokens, invalid, provided: Boolean(object.objectIdentifiers?.length) };
}
function relation(a: ReturnType<typeof objectIdentity>, b: ReturnType<typeof objectIdentity>) {
  const common = [...a.keys.keys()].filter(k => b.keys.has(k));
  const equal = common.some(k => a.keys.get(k) === b.keys.get(k));
  const conflict = common.some(k => a.keys.get(k) !== b.keys.get(k));
  return { exact: equal && !conflict && !a.invalid && !b.invalid, conflict: equal && conflict,
    ruledOut: conflict && !equal && !a.invalid && !b.invalid };
}
export function matchObjects(existing: readonly IdentifiedObject[], offer: readonly IdentifiedObject[], strategies: IdentifierStrategies = defaultIdentifierStrategies, context: ObjectComparisonContext = {}): ObjectMatch[] {
  const sides = [existing, offer];
  const types = sides.map(items => items.map(i => normalizeInsuranceType(i.type, i)));
  const identities = sides.map(items => items.map(item => objectIdentity(item, strategies)));
  const result: ObjectMatch[] = [];
  const push = (type: string, match: MatchDetails) => {
    result.push({ ...match, insuranceType: type, label: canonicalInsuranceTypeLabel(type), scopeId: `object:${result.length}` });
  };
  for (const type of new Set(types.flat())) {
    const left = types[0].flatMap((t,i) => t === type ? [i] : []), right = types[1].flatMap((t,i) => t === type ? [i] : []);
    if (!left.length || !right.length) {
      for (const i of left) push(type, existing[i].consolidation?.status === "unresolved" ? { status:"ambiguous", reason:"CONSOLIDATION_CONFLICT", existing:[i], offer:[] } : { status:"unmatched_existing", reason:"MISSING_TYPE", existing:[i], offer:[] });
      for (const i of right) push(type, offer[i].consolidation?.status === "unresolved" ? { status:"ambiguous", reason:"CONSOLIDATION_CONFLICT", existing:[], offer:[i] } : { status:"unmatched_offer", reason:"MISSING_TYPE", existing:[], offer:[i] });
      continue;
    }
    if (!context.failedExisting && !context.failedOffer && left.length === 1 && right.length === 1 && isKnownInsuranceType(type) &&
      !identities[0][left[0]].provided && !identities[1][right[0]].provided && !identities[0][left[0]].invalid && !identities[1][right[0]].invalid) {
      push(type,{ status:"matched", reason:"UNIQUE_TYPE_PAIR", existing:[left[0]], offer:[right[0]] }); continue;
    }
    const edges = left.flatMap(l => right.map(r => ({l,r,...relation(identities[0][l],identities[1][r])})));
    const unsafeL = new Set(edges.filter(e=>e.conflict).map(e=>e.l)), unsafeR = new Set(edges.filter(e=>e.conflict).map(e=>e.r));
    const exact = edges.filter(e=>e.exact);
    // A duplicated identifier is ambiguous even if another identifier could be
    // used to select one record. Do not resolve contradictory document bundles.
    const pairs = exact.filter(e=>!unsafeL.has(e.l) && !unsafeR.has(e.r) && exact.filter(x=>x.l===e.l).length===1 && exact.filter(x=>x.r===e.r).length===1);
    for (const e of pairs) push(type,{status:"matched",reason:"EXACT_OBJECT_ID",existing:[e.l],offer:[e.r]});
    const remainingL=left.filter(i=>!pairs.some(e=>e.l===i)), remainingR=right.filter(i=>!pairs.some(e=>e.r===i));
    const uncertainL=remainingL.filter(l=>remainingR.some(r=>!edges.find(e=>e.l===l&&e.r===r)!.ruledOut));
    const uncertainR=remainingR.filter(r=>remainingL.some(l=>!edges.find(e=>e.l===l&&e.r===r)!.ruledOut));
    for(const l of remainingL.filter(i=>!uncertainL.includes(i)))push(type,{status:"unmatched_existing",reason:"MISSING_OBJECT",existing:[l],offer:[]});
    for(const r of remainingR.filter(i=>!uncertainR.includes(i)))push(type,{status:"unmatched_offer",reason:"MISSING_OBJECT",existing:[],offer:[r]});
    if(uncertainL.length||uncertainR.length)push(type,{status:"ambiguous",reason:[...uncertainL.map(i=>existing[i]),...uncertainR.map(i=>offer[i])].some(i=>i.consolidation?.status==="unresolved")?"CONSOLIDATION_CONFLICT":edges.some(e=>e.conflict)||[...uncertainL.map(i=>identities[0][i]),...uncertainR.map(i=>identities[1][i])].some(i=>i.invalid)?"IDENTITY_CONFLICT":"INSUFFICIENT_IDENTITY",existing:uncertainL,offer:uncertainR});
  }
  return result;
}
export function objectDisplayLabel(object: IdentifiedObject, fallback: string, strategies: IdentifierStrategies = defaultIdentifierStrategies): string {
  const normalizers = strategies[normalizeInsuranceType(object.type, object)];
  const id = object.objectIdentifiers?.find(i => normalizers?.[i.type]?.(i.value));
  return id ? `${canonicalInsuranceTypeLabel(object.type,object)} – ${id.value.trim()}` : fallback;
}
export function missingEvidence(match: Pick<ObjectMatch, "status">, context: ObjectComparisonContext = {}): MissingEvidence | null {
  if (match.status !== "unmatched_existing" && match.status !== "unmatched_offer") return null;
  return (match.status === "unmatched_existing" ? context.failedOffer : context.failedExisting)
    ? "NOT_FOUND_WITH_PARTIAL_FAILURE" : "CONFIRMED_ABSENT_FROM_ANALYZED_SET";
}
export function objectWarning(match: Pick<ObjectMatch,"status"|"reason">, context: ObjectComparisonContext = {}) {
  if(match.status==="matched")return null;
  if(match.status==="ambiguous" && match.reason==="CONSOLIDATION_CONFLICT") return "Dokumentposter på samme side har motstridende objektidentitet, selskap, produkt eller avtaleperiode. De er ikke slått sammen eller sammenlignet mot et antatt objekt. Se dokumentene i detaljvisningen.";
  if(match.status==="ambiguous")return match.reason==="IDENTITY_CONFLICT"
    ? "Objektidentiteten er motstridende. Objektene sammenlignes ikke mot hverandre."
    : "Dokumentene inneholder ikke nok sikker objektinformasjon til å avgjøre hvilke objekter som tilsvarer hverandre. Ingen objektpar er antatt.";
  const missingOffer=match.status==="unmatched_existing";
  const partial=missingOffer?context.failedOffer:context.failedExisting;
  return `${missingOffer?"Finnes i eksisterende avtale, men tilsvarende objekt ble ikke funnet i de analyserte tilbudsdokumentene.":"Finnes i nytt tilbud, men tilsvarende objekt ble ikke funnet i de analyserte eksisterende avtaledokumentene."}${partial?" Dokumenter på denne siden kunne ikke analyseres, så sammenligningen kan være ufullstendig.":" Dette betyr ikke nødvendigvis at objektet er uforsikret."}`;
}
export function objectMatchingCounts(matches: readonly ObjectMatch[]) {
  return { exactMatches:matches.filter(m=>m.status==="matched"&&m.reason==="EXACT_OBJECT_ID").length,
    uniqueTypePairs:matches.filter(m=>m.status==="matched"&&m.reason==="UNIQUE_TYPE_PAIR").length,
    unmatchedExisting:matches.filter(m=>m.status==="unmatched_existing").length,
    unmatchedOffer:matches.filter(m=>m.status==="unmatched_offer").length,
    ambiguous:matches.filter(m=>m.status==="ambiguous").length };
}
