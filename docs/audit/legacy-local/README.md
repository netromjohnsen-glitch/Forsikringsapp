# Historical local audit archive

This directory preserves non-secret, non-reproducible project context that formerly existed only on a local Mac. Future Wave 1/Wave 2 work should use this repository archive rather than the old `/tmp` paths. Those paths were local to that Mac; they are not Cloud dependencies.

The subdirectories mirror these original directories:

| Archive directory | Historical purpose |
| --- | --- |
| `source-catalog-completeness-audit/` | Source-to-catalog fact inventory, gap/signature ledgers, source hashes, reviews and audit decisions |
| `source-catalog-remediation-triage/` | Batch definitions, P1/P2 triage, regression controls, source policy and remediation plan |
| `nito-catalog-remediation-evening/` | Wave 1 batch snapshots, ledgers, diagnostics, gates and resume state |
| `nito-wave2-semantic-resolution/` | Wave 2 canonical mapping decisions, dependencies and test plan |
| `insurance-catalog-wave2-completion/` | B-019/B-017 historical work state, ledgers, checks and stop-point diagnostics |
| `nito-prepilot-audit/` | Pre-pilot security, GDPR and product-readiness audit context |
| `forsikringsassistent-product-audit/` | Product comparison audit and reports |
| `product-hardening-audit-before-visible/`, `product-hardening-audit-after-visible/`, `product-hardening-audit-after/` | Historical before/after product-hardening evidence |
| `boat-pet-prepublish-audit/` | Boat/pet source and product pre-publish audit |
| `codex-attachments/` | Relevant user-provided audit/remediation task instructions |

`MANIFEST.csv` lists every included original path, repository path, byte size, SHA-256 before and after archival, and storage format. Large JSON/CSV files use deterministic, lossless `.gz` compression so individual Git files stay below GitHub's normal size limit. Decompress them with `gzip -dc`; the `original_sha256` column verifies the restored bytes. Smaller files were copied byte-for-byte. These are **historical audit snapshots**, not a statement that every finding still applies to current `main`. In particular, Cloud work after the local Wave 2 checkpoint resolved B-017 and B-021; consult current code, tests and commit history before acting on an older blocked-state report.

`EXCLUSIONS.csv` lists the omitted local files and the reason. Excluded categories are reproducible extracted PDF/HTML text, rendered page images and document previews, copied historical project checkouts already recoverable from Git, Python bytecode/cache, and disposable HTTP response captures. Local build output, `node_modules`, `.next`, credentials, `.env.local`, private customer documents and unrelated Downloads were not copied. Public catalog source originals remain in their existing versioned source locations; this archive does not duplicate them.

This archive contains decisions and evidence only. It is not imported by the application and does not change production behavior, catalogs or tests. Secrets must be configured separately through the approved deployment environment; `.env.local` remains outside Git.
