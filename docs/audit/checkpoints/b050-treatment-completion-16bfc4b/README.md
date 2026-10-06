# B-050 Behandling — CURRENT_COMPLETION PASS

New independent implementation from frozen originals, tested against committed
base 16bfc4bd5db0b9dbfa9b8646f4aae902ba5d8d90 plus the exact three candidate file
hashes and diff in [candidate-identity.json](candidate-identity.json). The unavailable
ee227f3 candidate and its reported tests/receipts were not used.

- [authorization.md](authorization.md): user's exact bounded approval.
- [authorization.json](authorization.json): initial scope, binding and budget snapshot.
- [campaign-policy.json](campaign-policy.json): completed scope 3/3, campaign 9/12;
  historical reported 19/16 and 10/8 unchanged, no later scope authorized.
- [root ledger](prospective-root-ledger.csv): previous six roots plus M07/M08/M09.
- [root-M07.json](root-M07.json): native undefined versus JSON inventory representation.
- [root-M08.json](root-M08.json): exact original registry column signature_id.
- [root-M09.json](root-M09.json): explicit B-043 parser in complete remediation manifest.
- [original excerpts](source-review.json): original PDF1–3 / printed5–7.
- [source/reverse audit](source-reverse-audit.json): five authorized rows in one component;
  317 other components, metadata, existing sources and eight prior receipts unchanged.
- [actual gates](gate-results.json), [test manifest](test-manifest.json) and compressed
  logs: every one of 145 test files executed individually, 3919/3919 PASS;
  47 remediation files including the 85-test B-043 parser, 1775/1775 PASS.
- [summary.json](summary.json): B-050 68/68, TypeScript/typegen, lint 0 errors/22 archival
  warnings, webpack production build and 22 synthetic HTTP/PDF checks PASS.
- [exact campaign set](campaign-signature-set.json): eight preserved receipts plus four
  new receipts, 12 unique signatures; global resolved/open remain UNKNOWN.
- [receipt-4165f79344a7d572.json](receipt-4165f79344a7d572.json): GAP-2868/SF-4017 period ceilings.
- [receipt-fbe23495ae09afb3.json](receipt-fbe23495ae09afb3.json): GAP-2875/SF-4025 medicines/materials.
- [receipt-48393aac0a200fe5.json](receipt-48393aac0a200fe5.json): GAP-2880/SF-4031 dental contract.
- [receipt-c5ccc4f26fd475ae.json](receipt-c5ccc4f26fd475ae.json): GAP-2907/SF-4060 definitions.

Frozen treatment PDF admitted only as boat-pet:gjensidige:hund:treatment,
full_terms/Gjensidige/Hund/ordinary, with manifest URL. Terms number, version and
effectiveFrom are unknown (empty fields); descriptive title is not used as a number.
Original boat-pet:gjensidige:hund remains IPID EAP32, including sum-choice qualification.
Dental safety refers explicitly to PDF1 in the PDF2 source section, with the separately
verified product FAQ as qualification source. Definitions are veterinary restrictions,
not a universal eligibility parent and not part of sum.valgbar.

The new audit's first failure is retained in initial-targeted-failure.log.gz, separate
from final green logs. The current final candidate, not historical reported passes,
is the source of completion evidence. All failed preliminary checks are distinguished
from final passing gates. No build exception was used and no deployment was performed.

Reproduce from repo root:

    python docs/audit/checkpoints/b050-treatment-completion-16bfc4b/verify.py
    python docs/audit/checkpoints/b050-treatment-completion-16bfc4b/verify-audits.py

run-gates.py records new actual executions; changing those records requires updating
checksums and candidate/revision receipts honestly. It is not needed for receipt-only
integrity verification. Authorization does not extend to deductible remediation,
diagnostic mapping, rehabilitation/SC-035, Katt or shared engine/selection changes.
The historical admission blocker is preserved unchanged and resolved by the new approval.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
