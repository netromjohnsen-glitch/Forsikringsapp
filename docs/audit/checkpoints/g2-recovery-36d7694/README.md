# G2 recovery checkpoint — PARTIAL_RECOVERY — NOT_AUTHORITATIVE_EXECUTION_LEDGER

Recorded 2026-10-06 against revision `36d7694f214ee7f36156f96b42385c21b1c97151`, branch `work`, repository `netromjohnsen-glitch/Forsikringsapp`. The recovery is a new documentation snapshot under `docs/audit/checkpoints/`; the historical `docs/audit/legacy-local/` archive remains immutable. No B-050 implementation, closure or budget charge is performed by this recovery.

## Evidence and accounting

The archived `source-catalog-remediation-triage/p1-triage.csv` establishes 1,589 distinct P1 identities and their original GAP/SF, product and batch bindings. `insurance-catalog-wave2-completion/p1-accounting.json` provides the latest available archived exact closure set: 21 prior resolutions plus B-019's `0def48b35239d8dc`, totaling 22 resolved and 1,567 remaining **at that historical snapshot**. The archive was committed in `b231c20c87d2f5bc64c175b3a413aed87c01b854`. It describes B-017 blocked, not current main. No later version-controlled execution ledger, exact complete closure set or correction root ledger was found. Git history for the audit archive has one archival commit; application/test commits cannot substitute for the missing ledger and gate receipts.

The registry's 21 `DEFER_SAFE` entries all belong to historical `fremtind-eika-legacy` Reise. Their exact identities and bindings are retained in `partial-ledger.csv`. This establishes the historical hold scope, **not fresh evidence that every entry has today's HISTORICAL_EXCLUDED status**. The archived accounting explicitly has an empty `deferred_historical_not_resolved` list, so its historical disposition and today's reported excluded-state convention must remain separate.

Conversation evidence states 414/1,589 resolved, 1,175 open = 1,154 active + 21 historical excluded. These numbers are arithmetically consistent but the full current exact signature set is not recovered. Do not treat the historical count 22 as today's resolved count, or subtract it to create guessed OPEN statuses. All 1,589 `current_execution_status` entries are `NOT_RECOVERED`.

Three B-050 closures are conversation-attested: `0a6b5f6f535df685`, `1f56c194d413f97d`, `8e9d297cb0d1bd0e`. Their exact original bindings are verified in the registry. Committed catalog/test changes at `2d44dda308595408fc52ab2b6d0ed123b09ec76a` and `36d7694f214ee7f36156f96b42385c21b1c97151` corroborate the residual-value and breeding/working-dog contracts. The latter contains explicit signature-bound assertions, frozen-source checks and optional/product/selection controls. These are stronger than commit-message claims but do not recover missing full closure receipts. No additional closure set is applied to the historical ledger.

`3f4b9eff50404590` remains conversation-attested OPEN, bound exactly to GAP-2869/SF-4018. Its sum-choice candidate remains uncommitted. Protected OPEN instructions also cover `7767772472433807`, `26668a6c81e5b5d9` and `e2f70dda0093e9e4`; no closure is inferred for them. No P2 credit is reconstructed.

## Budgets and policy evidence

Reported mechanical consumption is 19/16 and semantic consumption 10/8, under precise earlier exceptions. These are conversation evidence, not a freshly reconciled root ledger. `budget-evidence.csv` records the four identifiable recent mechanical exceptions separately from the unrecovered prior 15 mechanical roots and complete semantic root history. The R-022-01 authorization explicitly required avoiding double counting; actual independent-root booking cannot be recovered, so this file is **not a replacement correction ledger**.

The conditional R-050-SUM-MANUAL exception permits a future 19/16 → 20/16 only after baseline/root verification. It is authorized but unused and unbooked. No counter was reset or incremented. `policy-evidence.md` distinguishes preserved explicit user restrictions and historical source policy from missing coordinator rules. Numeric counters do not establish unspecified LEVEL_3 correction categories, skip rules, gate cadence, root aggregation or authorization rules.

## Candidate and integrity

The only tracked dirty files remain:

- `lib/boat-pet-catalog.ts`
- `tests/remediation-b-050.test.mjs`

`checkpoint.json` freezes SHA-256 for both files and their binary Git diff, rather than copying or staging the candidate. The sum-choice fact and current failing R-050-SUM-MANUAL assertion are preserved. The shared fix for exact `hund.bruksverdi.grense` is not modified. `coverage-fact-semantics.ts` at its committed shared revision is recorded in the evidence manifest.

Run `python docs/audit/checkpoints/g2-recovery-36d7694/verify.py` from the repository. It verifies identity uniqueness, exact original bindings, historical resolution/hold sets, every archived manifest entry (including decompressed original hashes), evidence hashes, candidate equality, staged=0 and `git diff --check`. It does not execute application gates or confer closure. It allows documentation-only descendants of the recorded revision and fails if application content or the preserved candidate changes; create a new checkpoint for a later application state.

## Missing evidence and next permitted step

Recover either the former current execution-ledger/resume and correction ledger, or a complete chain of exact closure sets and receipts linking the archived baseline to this revision. Also recover the G2 V2 coordinator's actual policy/gate definitions and independent-root bookings, including precise earlier exceptions. Then reconcile unique signature sets, holds and budgets without treating conversation totals as set membership. If those artifacts cannot be recovered, an explicit new reconciliation decision is needed for the gaps; this partial file cannot authorize B-050 continuation by itself.

The subsequent user instruction explicitly authorizes publication of this **partial** recovery as a separate documentation commit. This changes only publication permission: it does not approve an execution ledger, activate the proposed future policy, grant signature closure or book a correction. Stage only the recovery files; preserve both dirty candidate files. The recorded evidence revision remains the application baseline, independent of the later documentation commit. Remote verification is read-only; no deployment is performed.

`CATALOG_PILOT_GATE = REMEDIATION_REQUIRED`
