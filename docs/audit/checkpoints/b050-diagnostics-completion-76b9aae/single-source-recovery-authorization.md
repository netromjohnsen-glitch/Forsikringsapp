# Explicit source-only positive provenance fixture correction

User authorization 2026-10-06, base 76b9aae7c49a924ec1fc7edd1d9b49eb43b485da. Correct only new positive raw sources assumption in tests/catalog-enrichment-provenance.test.mjs. Preserve fixture source only, exact raw reference, absence of raw sources, canonical singleton sources, value/key/provenance and unknown status. Keep silent negative and all other positives. No production or fixture mode change.

D10_POSITIVE_SINGLE_SOURCE_RAW_SOURCES_EXPECTATION: mechanical campaign18/12 ->19/12 only after verified correction. Ordinary limit12, semantic2/2 and historical counters unchanged. No capacity for any other root.

Review all new diagnostic fixture contracts; run targeted, complete remediation manifest and fullsuite to collect failures without corrections. If PASS, run typegen/tsc, ESLint, webpack production build, HTTP/PDF runtime, source/reverse/receipt/checksum/integrity gates; individual receipts only for 7b2587a3bbc0c772 GAP-2876/SF-4027 and b5792662cc2fa9f8 GAP-2884/SF-4036. Preserve thirteen prior receipts, global counts UNKNOWN, P2=0 and SC035 hold. Atomic commit/push through secured publish.py authorized only after complete PASS. No deployment or later scope.
