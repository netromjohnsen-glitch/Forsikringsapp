# Båt, Hund og Katt – validation record

## Baseline and scope

Baseline was clean `main` at `0a4f6924192288213cb0a3ddec88c67ebb064367`, with 164 catalog products and 1959 passing tests. The extension adds 40 products: 20 Båt, 10 Hund and 10 Katt. It adds 24 optional components and 27 runtime source records. Final catalog totals are 204 products, 84 add-ons and 356 runtime sources.

## Correctness controls

- All 18 provider/family packages have source, scope and provenance tests.
- 54 explicit numeric/conditional source-to-catalog checks pass.
- Annual, per-event and selectable veterinarian sums have distinct keys.
- Fixed, percentage and period deductibles have distinct keys.
- New-entry age, reduction start, reduction rate, life end and veterinary duration have distinct keys.
- Optional life, machine and accident components materialize as optional in product mode and do not become customer-selected.
- A customer document value wins over a catalog value.
- Hund-only use value does not enter Katt; Båt facts do not reuse Bil/MC/Bobil keys.
- Same-product comparisons create no false differences; side swaps preserve the semantic difference key set.
- Two Båt objects can match by exact serial in the generic registry. Multiple pets without a secure ID remain ambiguous. Hund + Katt remain type-isolated.

## Human comparison review

The reviewed pairs were Tryg Båt Ekstra vs If Super, If Båt Kasko vs Frende Kasko, Gjensidige Pluss vs Storebrand Super; Tryg Hund Behandling vs If Super, If Hund Super vs Frende Veterinær, Gjensidige Hund Behandling vs Storebrand Veterinær/Dødsfall; and the corresponding Katt comparisons including Storebrand vs Fremtind.

The review checked inclusion, optional status, customer-specific wording, comparable alignment, provider-specific details, honest unknowns, source placement, section order, duplicate labels and semantic ambiguity. Optional components were visually distinct, customer selections were not implied, provider-specific mechanisms remained nested/detail facts, and no internal canonical keys or price/customer language appeared in product mode.

## Runtime properties

`scripts/verify-product-comparison.mjs` covers all 12 eligible families, including Båt, Hund and Katt. The script forbids runtime network and reports zero AI calls, zero PDF operations and zero provider web requests. The existing synthetic HTTP/PDF verification remains the customer-flow control.

## Final validation

The final counts and command outcomes are recorded in the task report after running the focused tests, relevant targeted suites, pre-existing tests, complete suite, TypeScript, ESLint, webpack production build, runtime checks, desktop/mobile/accessibility review and `git diff --check`.
