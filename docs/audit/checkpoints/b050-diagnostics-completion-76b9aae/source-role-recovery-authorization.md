# B-050: two exact source/role harness corrections

Explicit user authorization, 2026-10-06. Base: 76b9aae7c49a924ec1fc7edd1d9b49eb43b485da.

A: Decode frozen HTML &nbsp; to U+00A0, explicitly normalize U+00A0 to ordinary space, and retain the exact complete MR/CT sentence, all qualifications and frozen-byte hashes.
B: Correct general_terms-only expectations to zero customer objects and exact supportingEvidence; preserve unknown-role, explicit selection/refusal/conflict and valid customer attachment tests.

Only tests/remediation-b-050.test.mjs may change for these two roots. No production/source change. Mechanical campaign 14/12 -> 16/12 only after verified corrections; ordinary limit remains 12. Semantic scope remains 2/2. No capacity for other roots. Historical reported counters remain unchanged.

After targeted PASS, complete all previously authorized B/C closure gates, receipts for only 7b2587a3bbc0c772 and b5792662cc2fa9f8, checkpoint and publication using secured publish.py. Any new independent root stops before correction; diagnose all safely observable failures together. No deployment or later scope. Global current resolved/open remains UNKNOWN. Preserve all 13 prior receipts and rehabilitation/SC-035.
