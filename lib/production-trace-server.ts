import { objectIdentity, type IdentifiedObject } from "./object-matching.ts";
import { defaultIdentifierStrategies } from "./object-identity-strategies.ts";
import type { AnalysisSide } from "./analysis-progress.ts";
import type { ExtractionBatch } from "./analysis-batching.ts";
import type { ConsolidationTraceHooks } from "./insurance-object-consolidation.ts";
import { isUndocumentedTermValue } from "./insurance-normalization.ts";
import { sanitizeTraceEvent, traceProductIdentityState, safeTraceProduct, safeTraceType, traceCoverages, traceFacts, traceKeySet, traceKeys, traceTerms, type TraceEvent, type TraceObjectObserver } from "./production-trace.ts";

type Scope = { ref: string; side: "left" | "right"; documents: string[]; product: ReturnType<typeof safeTraceProduct>; normalizations: number; observer: TraceObjectObserver };
const item = (value: object) => value as Record<string, unknown>;
const sideName = (side: AnalysisSide) => side === "existing" ? "left" as const : "right" as const;

// Per-request only. Raw object handles never enter the retained event buffer.
export function createProductionTrace(traceId: string, enabled = process.env.PILOT_TRACE_ENABLED === "true",
  sink: (line: string) => void = line => console.info("ANALYSIS_TRACE", line)) {
  if (!enabled || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(traceId)) return undefined;
  const events: TraceEvent[] = [], scopes = new WeakMap<object, Scope>();
  const documents = new Map<string, string>(), batches = new WeakMap<object, string>();
  let objectCounter = 0, batchCounter = 0, dropped = 0, failures = 0, overhead = 0, depth = 0;
  const guard = (work: () => void) => {
    const start = performance.now();
    depth++;
    try { work(); } catch { failures++; } finally { if (--depth === 0) overhead += performance.now() - start; }
  };
  const emit = (event: TraceEvent) => {
    const safe = sanitizeTraceEvent(event);
    if (!safe) { failures++; return; }
    if (events.length < 1024) events.push(safe); else dropped++;
  };
  const docRef = (side: AnalysisSide, index: number) => {
    const key = `${side}:${index}`;
    if (!documents.has(key)) documents.set(key, `doc_${documents.size}`);
    return documents.get(key)!;
  };
  const batchRef = (batch: ExtractionBatch) => {
    if (!batches.has(batch)) batches.set(batch, `batch_${batchCounter++}`);
    return batches.get(batch)!;
  };
  function makeScope(side: "left" | "right", docs: string[]): Scope {
    const scope: Scope = { ref: `object_${objectCounter++}`, side, documents: docs, product: { providerId: null, productId: null }, normalizations: 0, observer: {} as TraceObjectObserver };
    const base = () => ({ side, objectRef: scope.ref });
    scope.observer = {
      normalization(before, after) { guard(() => {
        const beforeKeys = traceKeySet(before), afterKeys = traceKeySet(after);
        emit({ ...base(), stage: scope.normalizations++ ? "repeated_normalization" : "normalization", beforeKeys, keys: afterKeys,
          addedKeys: afterKeys.filter(k => !beforeKeys.includes(k)), removedKeys: beforeKeys.filter(k => !afterKeys.includes(k)), reason: "NO_EXPLICIT_RENAME_MAP" });
      }); },
      product(input, selected) { guard(() => {
        scope.product = safeTraceProduct(selected);
        emit({ ...base(), stage: "product", insuranceType: safeTraceType(input), ...scope.product, applicabilityObserved: true, applicable: selected !== null, productIdentityState: traceProductIdentityState(input),
          providerPresent: Boolean(scope.product.providerId), productPresent: Boolean(item(input).canonicalProductName || item(input).productName),
          reason: selected ? "EXACT_CATALOG_SELECTION" : "NO_CATALOG_SELECTION" });
      }); },
      catalog(input) { guard(() => {
        const docKeys = traceKeySet(input.documentTerms.filter(t => typeof item(t).value === "string" && !isUndocumentedTermValue(item(t).value as string)));
        const catalogKeys = traceKeySet(input.effectiveFacts), applied = traceKeySet(input.supplementalTerms), final = traceKeySet(input.effectiveTerms);
        emit({ ...base(), stage: "catalog", ...safeTraceProduct(input.product), decisions: traceKeys.map(key => ({ key, decision: input.decisions?.find(d => d.key === key)?.decision ?? (
          docKeys.includes(key) ? "DOCUMENT_PRESENT_SKIP_CATALOG" : input.blockedKeys.includes(key) ? "CATALOG_BLOCKED_BY_STATUS" :
            applied.includes(key) && final.includes(key) ? "CATALOG_FILL_DOCUMENT_SILENT" :
              !catalogKeys.includes(key) ? "CATALOG_NOT_AVAILABLE" : "CATALOG_NOT_APPLIED_OTHER_RULE") })) });
        emit({ ...base(), stage: "effective", facts: traceFacts(input.effectiveTerms), ...safeTraceProduct(input.product) });
      }); },
      effective(stage, record) { guard(() => {
        emit({ ...base(), stage, facts: traceFacts(record), insuranceType: safeTraceType(record), ...safeTraceProduct(item(record).catalogReference) });
        emit({ ...base(), stage: "coverage", coverages: traceCoverages(record) });
      }); },
    };
    return scope;
  }
  const hooks: ConsolidationTraceHooks = {
    forRecord: record => scopes.get(record)?.observer,
    consolidated(input, output, status, issues) { guard(() => {
      const previous = input.flatMap(r => scopes.get(r) ? [scopes.get(r)!] : []);
      if (!previous.length) return;
      const scope = status === "consolidated" ? makeScope(previous[0].side, [...new Set(previous.flatMap(s => s.documents))]) : previous[0];
      scopes.set(output, scope);
      const conflicts = item(output).consolidation as { factConflicts?: { key: string }[] } | undefined;
      emit({ stage: "consolidation", side: scope.side, objectRef: scope.ref, inputRefs: previous.map(s => s.ref), documentRefs: scope.documents,
        accepted: status === "consolidated", issues: issues.filter(i => ["identity_conflict", "provider_conflict", "product_conflict", "temporal_conflict"].includes(i)), productIdentityState: traceProductIdentityState(output), applicabilityObserved: false, reason: status === "consolidated" ? "CONSOLIDATED" : status === "unresolved" ? "UNRESOLVED" : "STANDALONE",
        beforeProductIds: [...new Set(previous.flatMap(s => s.product.productId ? [s.product.productId] : []))], ...safeTraceProduct(item(output).catalogReference),
        beforeKeys: traceKeySet(input.flatMap(traceTerms)), keys: traceKeySet(output), conflictKeys: (conflicts?.factConflicts ?? []).map(c => c.key).filter(k => traceKeys.includes(k as typeof traceKeys[number])) });
    }); },
  };
  return {
    hooks,
    document(side: AnalysisSide, index: number, parsed: boolean) { guard(() => emit({ stage: "document", side: sideName(side), docRef: docRef(side, index), parsed })); },
    batch(batch: ExtractionBatch) { guard(() => { for (const doc of batch.documents) emit({ stage: "document", side: sideName(batch.side), docRef: docRef(doc.side, doc.documentIndex), batchRef: batchRef(batch), parsed: true }); }); },
    extracted(record: object, batch: ExtractionBatch, indices: readonly number[], company: string | null) {
      guard(() => {
        const refs = indices.map(index => docRef(batch.side, index));
        const scope = makeScope(sideName(batch.side), refs); scopes.set(record, scope);
        const identity = objectIdentity(record as IdentifiedObject, defaultIdentifierStrategies);
        emit({ stage: "extraction", side: scope.side, objectRef: scope.ref, batchRef: batchRef(batch), documentRefs: refs,
          insuranceType: safeTraceType(record), keys: traceKeySet(record), coverageKeys: traceKeySet(record).filter(k => k.endsWith(".dekning")),
          providerPresent: Boolean(company), productPresent: Boolean(item(record).canonicalProductName || item(record).productName),
          productIdentityState: traceProductIdentityState(record), identityProvided: identity.provided, identityInvalid: identity.invalid, identityPresent: identity.keys.size > 0 && !identity.invalid });
      });
      return scopes.get(record)?.observer;
    },
    extractionFailed(batch: ExtractionBatch) { guard(() => emit({ stage: "extraction", side: sideName(batch.side), batchRef: batchRef(batch),
      documentRefs: batch.documents.map(d => docRef(d.side, d.documentIndex)), reason: "EXTRACTION_FAILED" })); },
    assignment(batch: ExtractionBatch, records: readonly object[]) { guard(() => {
      for (const doc of batch.documents) {
        const ref = docRef(doc.side, doc.documentIndex);
        const assigned = records.filter(r => scopes.get(r)?.documents.includes(ref));
        emit({ stage: "document", side: sideName(doc.side), docRef: ref, batchRef: batchRef(batch), parsed: true,
          extractedObjects: assigned.length, objectRefs: assigned.flatMap(r => scopes.get(r) ? [scopes.get(r)!.ref] : []), insuranceTypes: [...new Set(assigned.map(safeTraceType))] });
      }
    }); },
    bind(from: object, to: object) { const scope = scopes.get(from); if (scope) scopes.set(to, scope); },
    observer(record: object) { return scopes.get(record)?.observer; },
    final(side: AnalysisSide, records: readonly object[], sanitized: readonly object[]) {
      const refs: string[] = [];
      guard(() => { records.forEach((record, index) => {
        const scope = scopes.get(record) ?? makeScope(sideName(side), []);
        scopes.set(record, scope); refs.push(scope.ref);
        scope.observer.effective("effective", record);
        if (sanitized[index]) scope.observer.effective("sanitizer", sanitized[index]);
      }); });
      return refs;
    },
    flush() {
      for (const [sequence, event] of events.entries()) {
        try { sink(JSON.stringify({ traceId, phase: "server", sequence, ...event })); } catch { failures++; }
      }
      try { sink(JSON.stringify({ traceId, phase: "server", sequence: events.length, stage: "complete", eventCount: events.length, droppedEvents: Math.min(10000, dropped), observerFailures: Math.min(10000, failures), durationMs: Math.round(overhead * 1000) / 1000 })); } catch { /* Logging must never change analysis. */ }
    },
  };
}
export type ProductionTrace = NonNullable<ReturnType<typeof createProductionTrace>>;
