# Temporary production trace

Purpose: locate the first structural divergence in one real 2+2 pilot analysis. This instrumentation does not fix the production symptoms or select a root-cause hypothesis. No private documents were opened for its implementation.

## Activation and removal

- Default **off**. Set `PILOT_TRACE_ENABLED=true` manually on the existing Railway service when this code has been separately approved and deployed. Other values leave it off.
- Reads the flag at runtime. Do not set `NEXT_PUBLIC_*` flags or put values in `.env.local` for this task.
- Existing pilot authentication and `PILOT_SESSION_SECRET` protect the temporary client receipt. No new secret is required.
- Run the intended pilot analysis once, wait for the result to render, then remove the flag or set it to `false`. Apply the service's ordinary redeploy/restart flow as needed.
- No Railway settings, commit or push are performed by this implementation task.
- Removal is localized: delete `production-trace*`, the receipt route and observer calls/optional parameters; remove the optional `analysis.trace` response metadata and client effect. There is no database or external tracing provider.

## Correlation and identity

Every request uses its existing random UUID v4 request ID as `traceId`. `ANALYSIS_METRICS.requestId` and `ANALYSIS_TRACE.traceId` correlate. Each structured trace line has `phase` (`server` or `client`), a phase-local `sequence`, and `stage`.

`doc_N`, `batch_N` and `object_N` are counters scoped to this request. Object handles live in request-local WeakMaps; document counters use only side and request-local index. No identifier, identifier digest or link to a customer is retained. Safe identity flags are obtained with the existing type-specific identifier strategies; the normalized identifier itself is never projected. Refs describe records, not assumed identity: accepted consolidation records explicitly link input refs to an output ref; actual comparison groups link left/right refs.

Provider/product IDs must exactly belong to the application's static product metadata whitelist. Instrumentation consumes the **actual already-selected** catalog product and already-resolved facts; it does not repeat catalog lookup, source loading or fact resolution. `productIdentityState` distinguishes `PRESENT`, `EXPLICIT_UNKNOWN`, `LEGACY_FALLBACK`, and `MISSING` without logging product text. A consolidation record may deliberately have no catalog reference; `applicabilityObserved=false` marks that point. The next actual lookup event reports the resulting selection.

## Event field inventory

All fields are validated against a closed schema before logging. Optional fields absent from a stage are omitted.

| Stage | Permitted fields beyond envelope |
| --- | --- |
| `document` | `side`, `docRef`, `batchRef`, `parsed`, `extractedObjects`, `objectRefs`, `insuranceTypes` |
| `extraction` | `side`, `objectRef`, `batchRef`, `documentRefs`, `insuranceType`, `keys`, `coverageKeys`, `providerPresent`, `productPresent`, `productIdentityState`, `identityProvided`, `identityInvalid`, `identityPresent`; failed extraction uses `reason=EXTRACTION_FAILED` without relabeling successful PDF parsing as failed |
| `normalization`, `repeated_normalization` | `side`, `objectRef`, `beforeKeys`, `keys`, `addedKeys`, `removedKeys`, `reason` |
| `consolidation` | `side`, `objectRef`, `inputRefs`, `documentRefs`, `accepted`, `reason`, `issues`, `beforeProductIds`, `providerId`, `productId`, `productIdentityState`, `applicabilityObserved`, `beforeKeys`, `keys`, `conflictKeys` |
| `product` | `side`, `objectRef`, `insuranceType`, `providerId`, `productId`, `applicabilityObserved`, `applicable`, `providerPresent`, `productPresent`, `productIdentityState`, `reason` |
| `catalog` | `side`, `objectRef`, `providerId`, `productId`, `decisions[]: {key, decision}` |
| `effective`, `sanitizer` | `side`, `objectRef`, `insuranceType` where available, `providerId`, `productId`, `facts[]: {key, present, origin}` |
| `coverage` | `side`, `objectRef`, `coverages[]: {key, status, origin, reason}` |
| `client_result` | `side`, `objectRef` or `objectRefs`, `insuranceType`, `providerId`, `productId`, `facts`, `coverages`; final receipt summary uses `reason`, `eventCount`, `droppedEvents`, `observerFailures` |
| `price_input` | `side`, `objectRef`, `prices[]: {key, state, annualBasis, comparable, reason}` |
| `portfolio` | `side`, `objectCount`, `failedDocuments`, `compatible`, `conflict`, `components[]: {key, completeness, expected, priced}`, `branch`, `reason` |
| `comparison`, `presentation` | `leftRefs`, `rightRefs`, `comparisons[]: {key, leftPresent, rightPresent, leftOrigin, rightOrigin, state}` |
| `complete` | `eventCount`, `droppedEvents`, `observerFailures`, `durationMs` (observer time, excluding stdout transport) |

`keys` are exact members of `traceKeys` in `lib/production-trace.ts`: the targeted totalskade, vehicle mileage, premium, maskinskade, leiebil, roadside assistance, legal assistance, fire/theft, keys, glass and coverage identities. An arbitrary key sharing a known prefix is rejected. Unknown labels/identities are not logged. Extraction observes schema-validated output, before document-fact normalization; it never serializes raw model output. Raw key presence is distinct from `facts.present`, which excludes blank/undocumented values. Key-set differences do **not** prove a rename; the normalizer has no explicit rename map, so the reason is `NO_EXPLICIT_RENAME_MAP`.

Origins: `document`, `catalog`, `derived`, `conflict`, `unknown`; an origin is not invented when unavailable. Coverage status uses the existing resolver's result and its strongest evidence, including explicit conflict, not the mere existence of document/catalog evidence. Client detailed coverage rows use their actual resolved coverage objects.

Catalog decisions observe existing filter branches: `DOCUMENT_PRESENT_SKIP_CATALOG`, `CATALOG_BLOCKED_BY_STATUS`, `CATALOG_CONFLICT`, `CATALOG_NOT_APPLIED_OTHER_RULE`, `CATALOG_APPLIED`; missing candidates use `CATALOG_NOT_AVAILABLE`. No selected product is recorded as `NO_CATALOG_SELECTION`, not an invented product mismatch. `CATALOG_FILL_DOCUMENT_SILENT` is a supported projection code; it is not substituted for the observed decision. Effective output is observed separately after filtering.

Price states: `present`, `missing`, `conflict`, `unparseable`, `not_required`. Actual contribution reasons: `OPTIONAL_TFA_NOT_REQUIRED`, `CONSOLIDATION_UNRESOLVED`, `CONSOLIDATION_FACT_CONFLICT`, `MULTIPLE_DOCUMENT_AMOUNTS`, `CONTRIBUTION_ACCEPTED`, `PRICE_UNPARSEABLE`, `PRICE_MISSING`, `PRICE_TYPE_UNSUPPORTED`. `annualBasis` is `canonical_annual` or `unresolved`; no price/amount/delta is emitted. Portfolio completeness is the existing `complete`, `partial`, `unavailable`, or `conflicting`. Branch is the exact `portfolio`, `vehicle`, or `legacy` branch used by JSX, with no changed condition.

## What is never logged

No registration/VIN/serial identifier, identity hash, customer name, address, email, phone, filename, PDF text, raw extraction/model response, prompt, label, free-form error, coverage value, price, amount, mileage, sum insured, deductible, source excerpt or source URL. No session cookie, access code, signing secret, API key or signed receipt ticket. Numbers are restricted to bounded counts, sequence/counter refs and measured diagnostic duration. The receipt endpoint rejects unknown fields including nested fields, rather than silently accepting raw analysis objects.

## Actual browser observation and security

Comparison, detailed rows, presented differences, contribution decisions and the price branch are captured from the real React calculations used by the result view. No server-side shadow comparison is presented as browser evidence. One receipt is sent for the currently accepted result generation; stale/cancelled results cannot send it. No retry, user-visible error, delay of the result or new AI request is introduced.

`POST /api/analysis-trace` requires the runtime flag, valid pilot session, same origin and a five-minute HMAC-signed request ticket using the existing session secret with a separate signing domain. Body limit: 256 KiB, 256 events, five-second deadline, strict schemas, no-store. The client limits its projected event payload to 200 KiB/255 events plus a truncation summary. Server buffer: 1024 events plus summary. Receipt replay tracking stores random trace IDs only, max 2048, five-minute expiry, per process (not globally across replicas). Browser receipts are authenticated diagnostic observations, not cryptographic proof against a compromised client.

Projection/logging failures are isolated from analysis. A nonzero `observerFailures`/`droppedEvents`, a missing final summary, or an absent client receipt makes that part of the trace incomplete; it is not proof that a fact was missing.

## Reading the next real request

1. Find the latest relevant `ANALYSIS_METRICS` by timestamp; filter `ANALYSIS_TRACE` to its identical random `traceId`.
2. Require the server completion summary and the client receipt completion marker. Check failure/truncation counters.
3. Use the client comparison group's `leftRefs`/`rightRefs` to identify the actual matched records. Follow consolidation `inputRefs` backward to extraction and document/batch assignment. Do not pair records by sequence or counter number.
4. Follow the targeted canonical key through validated extraction → first/repeated normalization → consolidation → actual product selection → catalog filter → effective facts → sanitizer → client result → actual detailed row/presentation.
5. For price symptoms inspect actual per-object contribution reasons, then aggregate completeness and JSX branch. For Maskinskade inspect status plus winning origin/reason and actual detailed coverage row.
6. Report the earliest **observed structural** difference; only a later task may implement a correction.

Privacy deliberately prevents proving equality of two present document values. If both sides retain the same key and origin but differ numerically, this trace shows the existing emitted-difference state without revealing values. It does not prove which extraction value is correct. `NO_DIFFERENCE_EMITTED` is not a claim of value equality. Presentation state reports whether the existing presentation pipeline produced an item, not that a collapsed detail was opened by the user. The client detailed rows are those rendered in the initial result view; tab interactions are not repeatedly reported.

## Validation and measured overhead

Tests cover strict top-level/nested privacy boundaries, unknown canonical-prefix injection, source/identifier canaries, default off, ticket/receipt security, cancellation/stale responses, concurrent request isolation, real observed rows/contribution branches, cross-batch consolidation and ON/OFF equality with unchanged extraction-call counts. Synthetic HTTP/PDF uses only locally generated PDFs, ephemeral process credentials and a local mock AI service. No private pilot documents are fixtures.

Local 2+2 benchmark: 20 warmups, 80 alternating measurements per mode over normalization, catalog enrichment, consolidation, sanitization, comparison, presentation and pricing. OFF median 20.306 ms (p90 21.016); ON median 23.927 ms (p90 24.718): +3.621 ms median. Collector self-measurement median 2.393 ms, 57 server events. No PDF worker or AI latency and no Railway stdout/network overhead are represented by this local benchmark. The next real request is required for production evidence.

Final local validation: **1257/1257 tests passed** (baseline 1211, 46 new instrumentation tests); `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack`, and `git diff --check` passed. `node scripts/verify-analysis-http.mjs` passed against the production build with synthetic PDFs and trace enabled, including signed client receipt, server/client refs, private-field/ticket/replay rejection, existing 10+10/object/consolidation flows, partial failures, security and unchanged AI-call counts. No commit or push was performed.
