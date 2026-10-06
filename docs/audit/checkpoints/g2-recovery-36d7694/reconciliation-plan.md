# G2 reconciliation plan — proposal, not execution authorization

## Evidence matrix and targeted investigation

`evidence-matrix.csv` covers all 1,589 original P1 signatures and retains their exact registry bindings. Categories describe available evidence, not current execution status. Every current status remains NOT_RECOVERED.

| Category | Count | Meaning |
| --- | ---: | --- |
| 1 Complete current closure receipt | 0 | No complete current source/gate/revision/closure receipt was recovered. |
| 2 Reviewed implemented contract assertions, receipt missing | 13 | Three named B-050 contracts plus ten explicit B-071 signature/GAP/SF contracts. |
| 3 Historical/conversation status only | 26 | The archived exact 22 plus four protected/reported OPEN identities, disjoint from category 2. |
| 4 Current status unknown | 1,529 | Includes potential test/history leads that have not been individually established. |
| 5 Historical DEFER_SAFE | 21 | Exact historical Eika Reise identities; later status evidence separately absent. |

The historical 22 resolutions are supported by the archived accounting and the B-019 PASS audit. This is historical checkpoint evidence, not a complete closure receipt on today's revision. The empty category 1 does not disprove old closures.

A new concrete lead was the committed `tests/remediation-b-071.test.mjs` table: it has ten exact identities with GAP/SF bindings, ownership, canonical keys, source hashes/pages/sections and sixteen fact tuples, with registry and provenance assertions. These were checked against the original registry. The three B-050 contracts have explicit signature/source/product controls in the committed baseline test. Full runtime gate receipts are missing for both groups.

A targeted scan of committed test blobs at `36d7694f214ee7f36156f96b42385c21b1c97151` found 299 distinct registry identities mentioned in tests. Exact file/line/revision pointers are recorded in the matrix. A mention, even inside a passing test or commit, is not closure. These remaining pointers are leads for individual contract review, not an automatically eligible signature set. The immutable B-019 audit was read for historical context; there was no repeat broad archive search.

## Minimum proposed revalidation: RV-01, three already implemented B-050 contracts

Exact set:

- `0a6b5f6f535df685` — GAP-2904/SF-4056.
- `1f56c194d413f97d` — GAP-2901/SF-4053.
- `8e9d297cb0d1bd0e` — GAP-2902/SF-4054.

This is revalidation of the reported prior closures, not reopening them or proving lost historical execution. It excludes `3f4b9eff50404590`, the preserved sum-choice candidate and the other B-050 findings. Use an isolated clean checkout of the committed application revision (or its documentation-only descendant) so the uncommitted failing R-050-SUM-MANUAL does not enter the evidence revision. Creation/use of that checkout and application validation belong to a separately authorized execution task; none was performed here.

`revalidation-packets.json` gives exact bindings and frozen source SHA-256 values. Verify complete Liv/Bruk paragraphs: PDF2/printed6 breeding/working-dog qualifications and PDF8/printed13 residual-value/Død consequence, plus the product page's optional Bruk/Liv dependence. Treatment PDF stays audit-only. Preserve the existing registered-source provenance and supplemental refs, sourceType serialization, selection/conflict/document priority, shared exact non-assertive limit guard and customer 17,000 kr precedence.

Proposed closure gates on the final clean revision:

1. Source hashes and source-to-catalog audit for every bound clause; reverse audit of untouched facts/metadata and source registry, including legitimate replacesBase inheritance.
2. Committed B-050 baseline gate; B-022, B-018, B-071, shared guard, Liv guard and supporting-terms gates. Exact source/page/section/product/provider/component/canonical/value and availability-versus-selection controls.
3. Relevant Hund/Katt, provenance, manual known-product versus document pipeline, enrichment/selection, document priority, product/customer comparison, same product and both directions, provider/product isolation.
4. All existing remediation gates and full suite; TypeScript, ESLint zero errors, production webpack build and synthetic HTTP/PDF runtime using the repo's actual scripts. Read scripts/package metadata first; do not infer successful commands from old log claims. Existing historical lint warnings may be reported without editing archive files.
5. Diff, tracked/untracked file scope, source/archive hashes, exact signature uniqueness/bindings and repository integrity. No signature outside the packet receives credit.

No execution waiver is inferred from the missing coordinator. Confirm actual build/runtime settings before execution; unavailable old environment-workaround receipts cannot be silently recreated as proof. New build/runtime failures require diagnosis.

## Next proposed grouped revalidation: RV-02, ten B-071 source-clear identities

Exact set and individual GAP/SF/key ownership are in `revalidation-packets.json`: `2b078b058bc63967`, `1ee41770b0470c78`, `dc3e04a5fcce2317`, `0da02a8dae8fd373`, `688cc5923342804d`, `6e5f3830ca4701d4`, `6f0ac8fe783a963d`, `1982ee310e18279c`, `0f51d1c0374f1f1f`, `03cff9fe5cfbf518`.

Use the four frozen Fremtind Hund sources and their exact locations from the committed gate. Check all sixteen owned fact tuples, Topp replacement versus base coexistence, optional levels, age detail non-assertion, Liv guard, B-018 parent/subcoverage contract, document precedence and isolation. Apply the same full closure gate pattern as RV-01. Held `5f31ff4946a666b5`/rehabilitation remains outside the packet. A shared fact can be checked jointly but each identity needs its own complete clause-to-fact proof.

## Remaining individual review and holds

The other category 3 entries require present-day source/contract review before regrouping by actual shared root. Category 4's 1,529 entries must be inspected against their source/product/version/scope and canonical semantics; even the 299 test references do not justify automatic closure. Missing/ambiguous mappings, source conflicts and partially remediated B-034/B-035/B-084/B-089 dimensions need separate decisions. Protected OPEN identities remain protected.

The 21 DEFER_SAFE entries may be jointly checked against historical product status and exclusion criteria, but each retains its exact binding. Do not relabel them as RESOLVED or treat absence from active products as a closure. A new explicit current exclusion receipt/decision is required before using them in current active/excluded totals.

## New receipts and global accounting

New receipts must say CURRENT_REVALIDATION, never RECOVERED_HISTORICAL_CLOSURE. Store under a new revision-bound audit/checkpoint directory: execution revision, isolated tree hash, signature set, exact GAP/SF tuples, source hashes/pages/clauses, fact and provenance identities, before/after isolation fingerprints, test commands with exit/count/log hashes, exception references, timestamp, reviewer/authorization and individual verdict. Do not mutate the immutable archive or this partial historical evidence.

Until reconciliation covers the whole universe, report: universe=1,589 verified; historical resolved set=22 at the archived checkpoint; reported resolved=414 (not reconstructed); current globally verified resolved/open/active/excluded totals=UNKNOWN. Report only the exact newly revalidated set and its count separately. Do not add these identities to 414 or subtract them from 1,175: they may already be counted. Deduplicate all sets and reconcile holds before any new global arithmetic.

## Required decision

Approve RV-01 only, its clean-checkout gate specification, the new-receipt classification and the proposed future governance policy if desired. This does not approve the pending sum-choice correction or closure. If policy is not approved, any newly discovered correction stops for instruction. No application revalidation or policy activation is performed in this documentation task.
