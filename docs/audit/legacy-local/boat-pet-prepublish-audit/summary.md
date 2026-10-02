# Båt/Hund/Katt pre-publish bulk audit

## AUDIT SCOPE

- 36 comparisons across Båt, Hund and Katt.
- Six eligible providers per family.
- No AI, PDF operations or provider web requests.

## MATRIX

- Båt:Tryg/Båt Ekstra::If/Super (primary): 17 rows, 7 differences
- Båt:If/Super::Tryg/Båt Ekstra (swap): 17 rows, 7 differences
- Båt:Tryg/Båt Ekstra::Gjensidige/Pluss (primary): 16 rows, 7 differences
- Båt:Tryg/Båt Ekstra::Storebrand/Super (primary): 19 rows, 10 differences
- Båt:Tryg/Båt Ekstra::Fremtind/Toppkasko (primary): 19 rows, 10 differences
- Båt:Tryg/Båt Ekstra::Frende/Utvidet (primary): 16 rows, 6 differences
- Båt:If/Super::Frende/Utvidet (cross-provider): 18 rows, 9 differences
- Båt:Gjensidige/Pluss::Storebrand/Super (cross-provider): 16 rows, 6 differences
- Båt:Fremtind/Toppkasko::Gjensidige/Pluss (cross-provider): 16 rows, 6 differences
- Båt:If/Kasko::If/Super (level): 16 rows, 4 differences
- Båt:Storebrand/Kasko::Storebrand/Super (level): 15 rows, 6 differences
- Båt:Tryg/Båt Ekstra::Tryg/Båt Ekstra (same-product): 15 rows, 0 differences
- Hund:Tryg/Behandling::If/Super (primary): 17 rows, 15 differences
- Hund:If/Super::Tryg/Behandling (swap): 17 rows, 15 differences
- Hund:Tryg/Behandling::Gjensidige/Behandling (primary): 14 rows, 12 differences
- Hund:Tryg/Behandling::Storebrand/Veterinær og Dødsfall (primary): 18 rows, 17 differences
- Hund:Tryg/Behandling::Fremtind/Veterinær (primary): 21 rows, 20 differences
- Hund:Tryg/Behandling::Frende/Veterinær (primary): 16 rows, 14 differences
- Hund:If/Super::Frende/Veterinær (cross-provider): 20 rows, 19 differences
- Hund:Gjensidige/Behandling::Storebrand/Veterinær og Dødsfall (cross-provider): 13 rows, 12 differences
- Hund:Fremtind/Veterinær::If/Super (cross-provider): 20 rows, 19 differences
- Hund:If/Basis::If/Super (level): 13 rows, 5 differences
- Hund:Storebrand/Veterinær::Storebrand/Veterinær og Dødsfall (level): 11 rows, 7 differences
- Hund:Tryg/Behandling::Tryg/Behandling (same-product): 12 rows, 0 differences
- Katt:Tryg/Behandling::If/Super (primary): 17 rows, 15 differences
- Katt:If/Super::Tryg/Behandling (swap): 17 rows, 15 differences
- Katt:Tryg/Behandling::Gjensidige/Behandling (primary): 13 rows, 11 differences
- Katt:Tryg/Behandling::Storebrand/Veterinær og Dødsfall (primary): 16 rows, 15 differences
- Katt:Tryg/Behandling::Fremtind/Veterinær (primary): 17 rows, 16 differences
- Katt:Tryg/Behandling::Frende/Veterinær (primary): 14 rows, 12 differences
- Katt:If/Super::Frende/Veterinær (cross-provider): 17 rows, 16 differences
- Katt:Gjensidige/Behandling::Storebrand/Veterinær og Dødsfall (cross-provider): 10 rows, 9 differences
- Katt:Fremtind/Veterinær::If/Super (cross-provider): 17 rows, 16 differences
- Katt:If/Basis::If/Super (level): 13 rows, 5 differences
- Katt:Storebrand/Veterinær::Storebrand/Veterinær og Dødsfall (level): 9 rows, 5 differences
- Katt:Tryg/Behandling::Tryg/Behandling (same-product): 12 rows, 0 differences

## BÅT

12 comparisons; 28 flag occurrences.

## HUND

12 comparisons; 103 flag occurrences.

## KATT

12 comparisons; 94 flag occurrences.

## UNKNOWN ANALYSIS

{
  "CUSTOMER_SPECIFIC_VALUE_NOT_EXPECTED": 27,
  "LIKELY_TRUE_UNKNOWN": 110,
  "PROVIDER_SPECIFIC_COUNTERPART_NOT_REQUIRED": 13,
  "SAME_CONCEPT_DIFFERENT_STRUCTURE": 101
}

## SEMANTIC FINDINGS

{
  "CUSTOMER_SPECIFIC_REFERENCE": 124,
  "SAME_CONCEPT_DIFFERENT_STRUCTURE": 101
}

## PRESENTATION FINDINGS

Customer-specific references are review candidates in product mode; they are not customer data. Duplicate labels and internal label leaks are listed separately.

Manual review covered 18 flagged findings, 12 unflagged rows and 18 unknowns. The detector is OVER_SENSITIVE because presentation concepts intentionally contain distinct canonical child facts. No material semantic or presentation error was confirmed.

## SOURCE / PROVENANCE

All 18 provider/family packages are covered by the existing source-package and hash validation. The bulk audit found no cross-type key leakage.

## PDF/CUSTOMER RELEVANCE

{
  "LIKELY_SHARED": 38,
  "PRODUCT_MODE_ONLY": 16
}

## KNOWN GAPS

Gjensidige source version/effective dates remain unknown. Customer-selected sums remain customer-specific. Multiple same-species pets without secure structured identity remain ambiguous.

## RECOMMENDATION

READY_TO_PUBLISH. Six rendered comparisons were checked on desktop, and one comparison per family at 390 px. No material correctness, status, source, applicability or privacy issue was discovered.
