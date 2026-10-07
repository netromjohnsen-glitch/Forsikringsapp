# Two explicitly authorized mechanical exceptions

Before correction, the stopped candidate/checksum verification passed. The exact
unchanged production hashes and baseline revision are in resume-input-integrity.json.
The original stopped package is retained byte-for-byte, including failed logs.

1. RAW_RESOLVED_VS_ENRICHED_INHERITANCE_METADATA: resolveCatalogFacts retains
replacesBase without overriddenBase. catalog-enrichment.ts catalogTerm creates the
full overriddenBase array from the Standard layer. The corrected test builds this
reference independently from the frozen Standard baseline with explicit productCode:
undefined, and asserts all effective raw fields, full enriched references and values.
No candidate data is used as expected inheritance metadata.

2. REPEATED_ENRICHMENT_GLOBAL_CANONICAL_SET_IDEMPOTENCE_ASSUMPTION: the original
baseline probe reproduced the additional rettshjelp.dekning alias on repeat. The test
now requires exactly that alias/status/conflict transition on both baseline and
candidate, preserves all previous identities/status/conflicts and prohibits duplicates.
Complete second-pass canonical evidence/value/provenance is compared to the independent
baseline plus six source-reviewed transforms. All affected raw fields are compared.
No alias, mapping, selection or enrichment production code has changed.

New targeted gate30/30 PASS. The two roots are charged once:16/12 →18/12,
this scope2/6. Limit12 is retained, with no further correction capacity. Previously
planned source/fingerprint/reverse/Garden changes remain authorized scope work,
charge0. Historical counters are unchanged. This is not a semantic budget increase.
