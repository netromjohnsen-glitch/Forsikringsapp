# Båt, Hund og Katt – kildeaudit

## Kildepolicy og artefakter

Kildepakken inneholder 65 offentlige originaler hentet fra de seks selskapenes egne domener: 51 PDF-er og 14 HTML-sider. `catalog/sources/boat-pet/manifest.json` registrerer provider, forsikringstype, `ordinary` scope, dokumenttype, offisiell side, hentetidspunkt, lokal original og SHA-256. Ingen innloggede sider, cookies, sesjonsdata eller sporingsparametre er lagret.

Runtime-katalogen bruker 27 kildeposter. De 18 hovedpostene dekker provider × familie. Seks separate Tryg-poster holder Båt Maskinskade/ulykke og Hund/Katt Ekstra/liv knyttet til sine faktiske vilkår. Tre ekstra Fremtind-poster gjør det samme for Hund liv, Katt liv og Hund bruksverdi.

| Provider | Båt | Hund | Katt | Status / kjent gap |
|---|---|---|---|---|
| Tryg | IPID Fritidsbåt 2024-07-01 | IPID Dyr 2026-09-01 | IPID Dyr 2026-09-01 | READY for implemented major coverage and optional components; detailed full-terms-only facts remain unknown |
| If | BÅT2-1, 2023-02-01 | Hundeforsikring, 2022-12-01 | Katteforsikring, 2022-12-01 | READY; Super rollover and species-specific life ages retained |
| Gjensidige | EAP14 + level terms | EAP32 + treatment/life terms | EAP30 + treatment/life terms | READY for implemented facts; source version/effective date is unknown and is not replaced by retrieval date |
| Storebrand | båt03, 2024-09-01 | dyr04, 2025-02-01 | dyr04, 2025-02-01 | READY; independently selectable Veterinær/Dødsfall is represented explicitly |
| SpareBank 1 / Fremtind | PMO-380.000-004, 2024-06-10 | PBK-231.200/210/220, 2025-08-07 | PBK-231.300/310, 2025-08-07 | READY in SpareBank 1 scope only; DNB is intentionally absent |
| Frende | Båtforsikring, 2026-01-01 | Hundeforsikring, 2026-01-01 | Katteforsikring, 2026-01-01 | READY; mixed 25 %, minimum 1 000 kr deductible retained as two dimensions |

## Representative source-to-catalog controls

The automated audit performs 54 explicit checks: three for every provider/family package. The set includes geography/duration, amounts, percentages, ages, days, annual/per-event wording, deductibles and optional modules. Representative controls include:

- Tryg Båt: 200 nautical mile geography, different engine age conditions, optional accident.
- If Båt: 50,000 kr equipment limit and minimum 8,000 kr Motor/gear deductible.
- Gjensidige Båt: Delkasko/Kasko/Pluss and 10-year machine limitation.
- Storebrand Båt: 30 days/60,000 kr interruption and 3-year total loss rule.
- Fremtind Båt: 15 days/1,500 kr per day and 4,000 kr machine deductible wording.
- Frende Båt: 10,000 kr loose property and 20,000 kr dinghy limit.
- Tryg pets: 20-day waiting period and separate optional death coverage.
- If pets: different dental limits, explicit rollover, 20% life reduction and species-specific termination.
- Gjensidige pets: separate Behandling/Liv/Bruk modules; Bruk exists only for Hund.
- Storebrand pets: 2,500 kr deductible per claim, lifetime veterinary duration, stepwise life reduction and Hund-only reduced-use value.
- Fremtind pets: 135-day deductible period, species-specific selectable deductibles, separate life/use sources and breed-dependent Hund ages.
- Frende pets: per-claim and annual sum semantics, 25% with minimum 1,000 kr, 15,000 kr allergy and Hund-only 50% use value.

Every checked catalog fact resolves back to a runtime source with the same provider, canonical type and scope. SHA-256 validation covers every manifest artifact. Source originals are not transformed or edited.

## Unknowns and conservative choices

- Gjensidige artifact versions/effective dates are not exposed reliably in the acquired documents, so catalog versions are `null` and runtime dates are empty.
- Customer-selected sums, deductibles, animal value and boat value remain customer-specific; product mode states the choice/range rather than inventing a selection.
- Detailed breed tables remain in the original terms. The catalog reports that age varies by documented group and retains the source; it does not invent one universal Hund age.
- Marketing pages do not override precise full terms. IPID silence does not become a negative coverage assertion.
- Litter products are adjacent products and excluded from this ordinary comparison scope.
