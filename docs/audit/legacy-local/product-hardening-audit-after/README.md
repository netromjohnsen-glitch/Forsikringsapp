# Forsikringsassistenten product comparison audit

This temporary, read-only audit package was generated against git HEAD `e8b7acb4dc9bed9cbcc1b80e691b78de39158c01` and working-tree fingerprint `d212a2e81caa7d4a9915a7145f2303e3f744db4a8440a46a631070fbb5a9adda`. It is not production code.

The matrix uses one content-rich anchor product against each other provider, two non-anchor variation pairs, one same-provider level comparison per family, plus side-swap and same-product controls. Selection is diagnostic and must not be read as product ranking.

Outputs:
- `product-comparison-audit.json`: full structured evidence.
- `root-cause-input.json`: deduplicated review queue.
- `product-comparison-matrix.csv`: one row per execution.
- `product-comparison-findings.csv`: one row per flagged occurrence.
- `audit-matrix-manifest.json`: stable replay manifest.
- `product-comparison-audit.md`: human-readable technical report.
- `Forsikringsassistenten-produkt-audit.docx`: human-readable review report.

Reason codes are closed audit classifications. They identify review candidates and do not prove that insurance semantics are wrong. Re-run the manifest after a separately approved root-cause change to compare issue signatures, unknown classifications and presentation patterns.
