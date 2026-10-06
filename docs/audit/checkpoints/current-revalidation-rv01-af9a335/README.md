# CURRENT_REVALIDATION RV01 — three signatures, PASS

Tested committed revision: `af9a3354f483d2a60775c043b8c6497e16605161` in clean detached worktree `/workspace/Forsikringsapp-rv01`. This evidence proves present correctness at that revision. It does **not** reconstruct historical closure or infer a current global resolved/open ledger. Subsequent receipt/publication commits are documentation only; no application gate is claimed for changed application content.

Exact independently revalidated set:

- `0a6b5f6f535df685` — GAP-2904/SF-4056, residual value minimum 5,000 kr and corresponding Død sum change, non-assertive `hund.bruksverdi.grense`.
- `1f56c194d413f97d` — GAP-2901/SF-4053, complete breeding qualifications, permanent loss within insured use due to illness/accident, veterinarian evidence, 100% physical loss and source-specific litter requirements.
- `8e9d297cb0d1bd0e` — GAP-2902/SF-4054, trained/regular working use, at least 50% loss, investigation, adequate treatment and sufficient convalescence, with the main insured-use/veterinarian qualifications.

The raw frozen Liv/Bruk PDF was read at PDF2/printed6 and PDF8/printed13. Extracted public page text is retained, with full raw source hashes and exact fact/component/provenance references in source-audit and individual receipts. Product HTML supplies the separate optional Bruk/Liv dependence. The treatment PDF stays audit-only, not production-admitted. Frozen IPID is an unchanged registered control, not the primary target source. Retrieval date does not become a terms version.

B-050 24/24; B-022 12/12; B-018 9/9; B-071 97/97; shared Bruk guard 30/30; Liv guard 103/103; supporting terms 43/43. All remediation gates, including B-043 status parser: 1,731/1,731. Full existing suite: 145 files, 3,875/3,875 tests. TypeScript PASS after required route-type generation, ESLint 0 errors/22 historical archive warnings, webpack production build PASS, synthetic HTTP/PDF runtime 22/22 PASS, diff check PASS. No build exception was used. Source/page/provenance, optional-versus-selected, explicit choice/refusal/conflict, customer 17,000 kr precedence, same product/both comparison directions and provider/Hund/Katt isolation passed.

One authorized mechanical gate-harness root, M01: the fresh worktree did not contain Next-generated LayoutProps. Installed Next 16.3.5 docs explicitly require `next typegen` before `tsc`. The original TypeScript failure log is retained, then generation and the retry passed. No tracked application, test, config, canonical, source or engine file changed. Next generated ignored files only. Complete equivalence proof and consumption are in `mechanical-root-M01.json`: scope 1/3, named campaign 1/12. No other scope is authorized by remaining capacity.

`campaign-policy.json` activates only the user's named campaign rules. Reported historical budgets 19/16 mechanical and 10/8 semantic remain unreconstructed and unchanged. The earlier pending R-050-SUM-MANUAL exception remains unused and unbooked. Global current resolved/open/active/excluded counts remain UNKNOWN; reported 414 is not incremented by these three. The old partial ledger and 21 historical DEFER_SAFE entries are unchanged.

`gate-results.json` records actual commands, times, tested SHA, outputs and hashes. `logs/` contains deterministic gzip logs, including the initial TypeScript failure. Per-file fullsuite command was `node --test-reporter=tap tests/<file>.test.mjs`, each executed sequentially. Final gates were `npx --no-install next typegen`, `npx --no-install tsc --noEmit --incremental false`, `node node_modules/eslint/bin/eslint.js . --format json`, `npx --no-install next build --webpack`, `node scripts/verify-analysis-http.mjs` and `git diff --check`. Build/runtime used process-local `XDG_CONFIG_HOME=/tmp/rv01-build-config` for generated tool state, no project environment/secret/config modification. Runtime used the repo's local mock server and synthetic temporary credentials, not production services or deployment.

Reverse audit serialized the entire native JSON catalog, including replacesBase and all enumerable fact/metadata fields: 204 products and 4,147 facts; identical before/after digest. Tracked application/test/catalog equality to the tested revision was checked separately. Main-worktree sum-choice candidate file/diff hashes were checked before and after validation; no candidate file was staged or edited.

Verify with `python docs/audit/checkpoints/current-revalidation-rv01-af9a335/verify.py` and `sha256sum -c docs/audit/checkpoints/current-revalidation-rv01-af9a335/SHA256SUMS`. The verifier checks saved evidence; it does not rerun application gates or certify a different revision. Actual gate commands/logs establish reproducibility without relying on disappeared prior /tmp files.

Next safe step requires a new explicit scope authorization. Neither pending sum-choice correction/closure nor RV02/later scope is started here.

`CATALOG_PILOT_GATE = REMEDIATION_REQUIRED`
