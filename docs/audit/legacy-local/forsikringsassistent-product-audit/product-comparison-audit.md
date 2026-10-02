# Forsikringsassistenten Produktsammenligning Audit

Audit gjennomført 2026-09-29T06:27:27.729Z mot git HEAD `e8b7acb4dc9bed9cbcc1b80e691b78de39158c01`. Arbeidskopien var ren ved start.

## Executive summary

Auditen kjørte 75 primære sammenligninger og 18 kontrollkjøringer på 84 av 162 eligible katalogprodukter. Alle 9 produktfamilier og alle eligible providers i hver familie ble representert. Katalogen inneholder 164 produkter; to historiske Eika Reise-produkter ble korrekt utelatt.

Detektoren registrerte 522 forekomster fordelt på 156 dedupliserte issue signatures. De største mønstrene gjelder gjentatt visningshierarki, kundespesifikke referanser og produktspesifikke detaljer. 40 forekomster er klassifisert som mulige delte problemstillinger for produkt- og PDF-/avtalesammenligning; dette er en arkitekturprioritering, ikke en bekreftet feil.

Alle ti determinismekontroller og alle ni sidebytter var stabile. De ti representative UI-krysskontrollene brukte den faktiske React-komponenten via server-side rendering og samsvarte med runtime-dataene. Auditen utløste null AI-kall, PDF-operasjoner eller runtime-nettverkskall.

Auditflaggene er review candidates. Rapporten fastslår ikke hvilken forsikringsfortolkning som er riktig, og den rangerer ikke produkter eller selskaper.

## Audit matrix

| Familie | Eligible produkter | Providers testet | Primære | Kontroller | Flagg |
| --- | --- | --- | --- | --- | --- |
| Bil | 35 | 9/9 | 11 | 2 | 80 |
| Hus | 13 | 6/6 | 8 | 2 | 32 |
| Innbo | 12 | 6/6 | 8 | 2 | 23 |
| Reise | 12 | 6/6 | 8 | 2 | 20 |
| Snøscooter | 18 | 6/6 | 8 | 2 | 112 |
| Campingvogn | 17 | 6/6 | 8 | 2 | 111 |
| Tilhenger | 12 | 6/6 | 8 | 2 | 72 |
| MC | 19 | 6/6 | 8 | 2 | 40 |
| Bobil | 24 | 6/6 | 8 | 2 | 32 |

Planlagt: 93. Fullført: 93. Feilet: 0. Utvalget overrepresenterer innholdsrike produkter, kryssleverandørpar og kjente positive kontroller.

## Aggregate findings

| Måling | Antall |
| --- | --- |
| Rendererte fakta | 7 907 |
| Unknown-celler | 2 261 |
| Unike side-lokale unknown-signaturer | 1 648 |
| Produktspesifikke detaljer | 81 |
| Flaggforekomster | 522 |
| Dedupliserte issue signatures | 156 |

## Findings by reason code

| Reason code | Forekomster |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 264 |
| CUSTOMER_SPECIFIC_REFERENCE | 120 |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | 53 |
| INTERNAL_LABEL_LEAK | 45 |
| OPTIONAL_INCLUDED_CONFLICT | 14 |
| POSSIBLE_DUPLICATE_CONCEPT | 7 |
| STATUS_TEXT_CONTRADICTION | 7 |
| PARENT_CONTAINS_CHILD_CANDIDATE | 4 |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | 4 |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | 4 |

## Root cause cluster candidates

Klyngene angir et sannsynlig teknisk undersøkelseslag. De beviser ikke root cause.

| Lag | Unike signaturer | Forekomster | Familier | PDF-relevans |
| --- | --- | --- | --- | --- |
| PRESENTATION_HIERARCHY | 43 | 264 | Hus, Innbo, Reise, Snøscooter, Campingvogn, Tilhenger, MC, Bobil | PRODUCT_MODE_ONLY: 43 |
| PRODUCT_MODE_ONLY_PRESENTATION | 98 | 218 | Bil, Hus, Innbo, Reise, Snøscooter, Campingvogn, Tilhenger, MC, Bobil | PRODUCT_MODE_ONLY: 98 |
| CANONICAL_SEMANTICS | 6 | 15 | Bil, Snøscooter | LIKELY_SHARED: 6 |
| CATALOG_MATERIALIZATION | 4 | 14 | Snøscooter | LIKELY_SHARED: 4 |
| STATUS_RESOLUTION | 5 | 11 | Hus, Snøscooter | LIKELY_SHARED: 5 |

## Potential relevance for agreement and PDF comparison

| Klassifisering | Forekomster |
| --- | --- |
| LIKELY_SHARED | 40 |
| PRODUCT_MODE_ONLY | 482 |

LIKELY_SHARED omfatter mønstre rundt statusoppløsning, canonical identitet, parent/child-relasjoner, tilleggstilstand og mulig konseptoverlapp. PRODUCT_MODE_ONLY omfatter særlig visningshierarki, interne etiketter, produktspesifikke detaljblokker og kundespesifikke referanser i ren produktmodus.

## Ikke dokumentert analyse

Runtime viste 1 992 unknown-forekomster og 1 648 unike side-lokale signaturer. Detektoren fyller aldri en manglende verdi fra en annen leverandør.

| Klassifisering | Antall |
| --- | --- |
| INSUFFICIENT_EVIDENCE | 1016 |
| PROVIDER_SPECIFIC_COUNTERPART_NOT_REQUIRED | 658 |
| LIKELY_TRUE_UNKNOWN | 236 |
| CUSTOMER_SPECIFIC_VALUE_NOT_EXPECTED | 82 |

INSUFFICIENT_EVIDENCE betyr at dagens katalog ikke gir nok grunnlag for sikker auditklassifisering. LIKELY_TRUE_UNKNOWN er en katalog-/presentasjonsdiagnose, ikke en påstand om at dekningen mangler i forsikringen.

## Known positive controls

| Kontroll | Surfaced | Reason code |
| --- | --- | --- |
| Tryg Snøscooter Redning included-looking status og eksklusjonsordlyd | JA | STATUS_TEXT_CONTRADICTION |
| Tryg Snøscooter valgfritt tillegg og Inkludert i produktnivået | JA | OPTIONAL_INCLUDED_CONFLICT |
| Tryg Snøscooter Førerulykke og Fører/passasjerulykke mulig overlapp | JA | POSSIBLE_DUPLICATE_CONCEPT |
| Gjentatt Kasko → Kasko → Kasko-hierarki | JA | DUPLICATE_DISPLAY_LABEL |
| Interne avtaleetiketter | JA | INTERNAL_LABEL_LEAK |
| Bil If/Frende parent/child og strukturell asymmetri | JA | PARENT_CONTAINS_CHILD_CANDIDATE |
| Hus vann gjennom tak/yttervegg følgeskade og defektunntak | JA | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION |

Detektorkvalitet etter manuell, stratifisert sample review: **REASONABLE**. Det ble kontrollert 20 flaggede funn, 12 uflaggede rader, 8 unknown-klassifiseringer, 5 produktspesifikke kandidater og 9 provenance-kjeder.

## Source and provenance

6 349 fact/source-koblinger ble kontrollert. Det ble ikke funnet kandidatavvik for provider, forsikringstype, agreement scope, product ID, version eller manglende source record.

| Kildetype | Fact-koblinger |
| --- | --- |
| IPID / produktark | 3 |
| Offentlig vilkår | 6334 |
| Produktside | 12 |

## Customer-specific references

120 forekomster viser fakta der hovedverdien er utsatt til forsikringsbeviset eller kundens avtalte verdi. Dette kan være nyttig i PDF-/avtalesammenligning, men er en review candidate i ren produktsammenligning.

## Presentation and navigation

264 forekomster viser tre like nivåer i seksjon, gruppe og rad. 45 forekomster viser interne etiketter som «avtale – geografi» eller «avtale – sesong». Alle navigasjonsmål var unike og alle representative React-krysskontroller matchet runtimevisningen.

## Status and text requiring review

### STATUS_TEXT_CONTRADICTION ISS-8ebdde76f9685b8a

Forekomster: 6. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__primary`
- Seksjon og label: Redning / Redning – begrensninger
- Rå visning: included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt
- Kilde: vehicle:tryg-IPID-Snoscooter.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary`
- Seksjon og label: Redning / Redning – begrensninger
- Rå visning: included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt
- Kilde: vehicle:tryg-IPID-Snoscooter.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__storebrand__ordinary__storebrand-snoscooter-kasko__2025-04-01__primary`
- Seksjon og label: Redning / Redning – begrensninger
- Rå visning: included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt
- Kilde: vehicle:tryg-IPID-Snoscooter.pdf

### OPTIONAL_INCLUDED_CONFLICT ISS-ba323b6fbe07792a

Forekomster: 6. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__primary`
- Seksjon og label: Fører- og passasjerulykke / Fører- og passasjerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-56716918.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary`
- Seksjon og label: Fører- og passasjerulykke / Fører- og passasjerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-56716918.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__storebrand__ordinary__storebrand-snoscooter-kasko__2025-04-01__primary`
- Seksjon og label: Fører- og passasjerulykke / Fører- og passasjerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-56716918.pdf

### OPTIONAL_INCLUDED_CONFLICT ISS-85ff6542766f8307

Forekomster: 6. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__primary`
- Seksjon og label: Førerulykke / Førerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-2001c3a6.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary`
- Seksjon og label: Førerulykke / Førerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-2001c3a6.pdf

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__storebrand__ordinary__storebrand-snoscooter-kasko__2025-04-01__primary`
- Seksjon og label: Førerulykke / Førerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-2001c3a6.pdf

### POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION ISS-aaa9c65e93359d5b

Forekomster: 2. Familier: Hus. Providers: If. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `hus__if__ordinary__if-hus-super__2023-09__vs__frende__ordinary__frende-hus-utvidet__2026-09-01__primary`
- Seksjon og label: Vann og fukt / Vann gjennom tak og yttervegg
- Rå visning: unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.
- Kilde: ifHusTerms

- Comparison: `hus__if__ordinary__if-hus-super__2023-09__vs__if__ordinary__if-hus-utvidet__2023-09__primary`
- Seksjon og label: Vann og fukt / Vann gjennom tak og yttervegg
- Rå visning: unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.
- Kilde: ifHusTerms

### POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION ISS-ce1643a4e8fa94b0

Forekomster: 1. Familier: Hus. Providers: If. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__if__ordinary__if-hus-super__2023-09__primary`
- Seksjon og label: Vann og fukt / Vann gjennom tak og yttervegg
- Rå visning: unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.
- Kilde: ifHusTerms

### POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION ISS-9175f4a25c8b4179

Forekomster: 1. Familier: Hus. Providers: If. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `hus__if__ordinary__if-hus-super__2023-09__vs__if__ordinary__if-hus-utvidet__2023-09__primary`
- Seksjon og label: Vann og fukt / Vann gjennom tak og yttervegg
- Rå visning: unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.
- Kilde: ifHusTerms

### STATUS_TEXT_CONTRADICTION ISS-e980d7d07e05ac7e

Forekomster: 1. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-brann-og-tyveri__null__primary`
- Seksjon og label: Redning / Redning – begrensninger
- Rå visning: included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt
- Kilde: vehicle:tryg-IPID-Snoscooter.pdf

### OPTIONAL_INCLUDED_CONFLICT ISS-9903ef9575456a2a

Forekomster: 1. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-brann-og-tyveri__null__primary`
- Seksjon og label: Fører- og passasjerulykke / Fører- og passasjerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-56716918.pdf

### OPTIONAL_INCLUDED_CONFLICT ISS-6e2ed0255ef75485

Forekomster: 1. Familier: Snøscooter. Providers: Tryg. Mulig PDF-relevans: LIKELY_SHARED.

- Comparison: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-brann-og-tyveri__null__primary`
- Seksjon og label: Førerulykke / Førerulykke
- Rå visning: optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået
- Kilde: vehicle:tryg-odpdf-2001c3a6.pdf

## Possible overlapping concepts

Disse funnene krever kontroll av canonical struktur og kildegrunnlag. Rapporten konkluderer ikke med at fakta er like.

- **SAME_CONCEPT_DIFFERENT_STRUCTURE** ISS-46814b5273aeeb71: 2 forekomster; Tryg / Frende, If / Frende; Feilfylling / Feilfylling.

- **PARENT_CONTAINS_CHILD_CANDIDATE** ISS-9e52942abdd19d17: 2 forekomster; Frende; Feilfylling / Feilfylling.

- **SAME_CONCEPT_DIFFERENT_STRUCTURE** ISS-ded8aa776d61af8e: 2 forekomster; Tryg / Frende, If / Frende; Hærverk / Hærverk.

- **PARENT_CONTAINS_CHILD_CANDIDATE** ISS-645eb89e2730122c: 2 forekomster; Frende; Hærverk / Hærverk.

- **POSSIBLE_DUPLICATE_CONCEPT** ISS-691de319e114fae3: 6 forekomster; Tryg; Fører- og passasjerulykke / Førerulykke / Fører- og passasjerulykke / Førerulykke / Fører- og passasjerulykke / Førerulykke.

- **POSSIBLE_DUPLICATE_CONCEPT** ISS-6c6034fb20e71653: 1 forekomster; Tryg; Fører- og passasjerulykke / Førerulykke.

## Product-specific details

53 forekomster ble beholdt som én-sidige produktspesifikke detaljer. Dette er en presentasjonshypotese: detaljene kan være rådgivernyttige uten at systemet tvinger frem en misvisende tom motpart.

## Bil

Providers testet: Tryg, If, Gjensidige, Storebrand, SpareBank 1 / Fremtind, DNB / Fremtind, Eika / Fremtind, Fremtind, Frende. Produkter i eligible katalog: 35. Primære sammenligninger: 11. Kontrollkjøringer: 2. Flaggforekomster: 80.

| Reason code | Antall |
| --- | --- |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | 53 |
| CUSTOMER_SPECIFIC_REFERENCE | 19 |
| PARENT_CONTAINS_CHILD_CANDIDATE | 4 |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | 4 |

### Tryg Kasko mot If Super

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__if__ordinary__if-bil-super__mot2-2__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 126. Direkte rader: 41. Én-sidige rader: 38. Unknown-celler: 38. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Utstyr og eiendeler | Utstyr og eiendeler | first | Produktspesifikk detalj – Fastmontert tilbehør: Inntil 10 000 kr; annen avtalt sum kan stå i forsikringsbeviset · Bagasje ved tyveri: Inntil 10 000 kr samlet og 5 000 kr per gjenstand; egenandel 1 000 kr |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Utstyr og eiendeler | Utstyr og eiendeler | second | Produktspesifikk detalj – Ettermontert utstyr og bagasje – samlet grense: Inntil 40 000 kr samlet, høyst 50 % av kjøretøyets gjenanskaffelsesverdi; avtalt sum kan utvides · Utstyr og bagasje – unntak: Penger/verdipapir og fastmontert ladestasjon i bygning er ikke inkludert |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | second | Produktspesifikk detalj – Fører/passasjer – avtalevilkår: Den avtalte ulykkesdekningen skal fremgå av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Brann, tyveri og natur | Brann | second | Produktspesifikk detalj – Brann – begrensning: Batterier og elektroniske enheter krever åpen ild på utsiden av enheten |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Andre bilvilkår | Super | second | Produktspesifikk detalj – Super – unntak: Gjelder ikke drosje, trafikkskole- eller utleiebil, ikke godkjent effektøkning eller skade ved prøvekjennemerke |

### Tryg Kasko mot Gjensidige Pluss

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__gjensidige__ordinary__gj-bil-pluss__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 130. Direkte rader: 42. Én-sidige rader: 40. Unknown-celler: 40. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – transportgrense: 50 % av kjøretøyets verdi på skadedagen · Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Utstyr og eiendeler | Utstyr og eiendeler | first | Produktspesifikk detalj – Bagasje ved tyveri: Inntil 10 000 kr samlet og 5 000 kr per gjenstand; egenandel 1 000 kr |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |

### Tryg Kasko mot Storebrand Super

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__storebrand__ordinary__sb-bil-super__motor09__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 133. Direkte rader: 41. Én-sidige rader: 43. Unknown-celler: 43. Flagg: 9.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – ulykkessted: I eller på kjøretøyet; også utenfor når kjøretøyet er direkte skadeårsak · Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | second | Produktspesifikk detalj – Fører/passasjer – avtalevilkår: Valgt ulykkesdekning må fremgå av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Brann, tyveri og natur | Brann | second | Produktspesifikk detalj – Brann – begrensning: Skade i batterier alene, kortslutning eller oppheting uten åpen ild omfattes ikke |

### Tryg Kasko mot SpareBank 1 / Fremtind Toppkasko

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__sparebank-1-fremtind__ordinary__sb1-bil-toppkasko__pmo-357-001-004__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 125. Direkte rader: 37. Én-sidige rader: 45. Unknown-celler: 45. Flagg: 8.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem · Maskinskade – gir og kraftoverføring: Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |
| CUSTOMER_SPECIFIC_REFERENCE | Andre bilvilkår | Delkasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |

### Tryg Kasko mot DNB / Fremtind Topp

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__dnb-fremtind__ordinary__dnb-bil-topp__pmo-357-001-004__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 125. Direkte rader: 37. Én-sidige rader: 45. Unknown-celler: 45. Flagg: 8.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem · Maskinskade – gir og kraftoverføring: Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |
| CUSTOMER_SPECIFIC_REFERENCE | Andre bilvilkår | Delkasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |

### Tryg Kasko mot Eika / Fremtind Topp

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__eika-fremtind__ordinary__eika-bil-topp__pmo-357-001-004__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 125. Direkte rader: 37. Én-sidige rader: 45. Unknown-celler: 45. Flagg: 8.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem · Maskinskade – gir og kraftoverføring: Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |
| CUSTOMER_SPECIFIC_REFERENCE | Andre bilvilkår | Delkasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |

### Tryg Kasko mot Fremtind Topp

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__fremtind__ordinary__fremtind-bil-topp__pmo-357-001-004__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 125. Direkte rader: 37. Én-sidige rader: 45. Unknown-celler: 45. Flagg: 8.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem · Maskinskade – gir og kraftoverføring: Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |
| CUSTOMER_SPECIFIC_REFERENCE | Andre bilvilkår | Delkasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |

### Tryg Kasko mot Frende Utvidet

Comparison ID: `bil__tryg__ordinary__bil-kasko__pau25205__vs__frende__ordinary__frende-bil-utvidet__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 110. Direkte rader: 35. Én-sidige rader: 30. Unknown-celler: 30. Flagg: 11.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | Skade på egen bil | Feilfylling | both | included / included – ✓ Inkludert – Skade på eget kjøretøy ved feilfylling av drivstoff \|\| ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| PARENT_CONTAINS_CHILD_CANDIDATE | Skade på egen bil | Feilfylling | second | included – ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | Skade på egen bil | Hærverk | both | included / included – ✓ Inkludert – Skade på eget kjøretøy ved hærverk \|\| ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| PARENT_CONTAINS_CHILD_CANDIDATE | Skade på egen bil | Hærverk | second | included – ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Maskinskade – diesel/bensin: Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem · Maskinskade – elbil/hybrid: Motor, høyvoltbatteri og høyspentkabel inkl. ladekontakt, batterikjøling/-styring, spenningsomformer og fabrikkmontert lader · Maskinskade – gir og kraftoverføring: Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – unntak: Ikke ved bare glasskade, tapt/skadet nøkkel eller kontantoppgjør uten totalskade/innløsning · Leiebil – utløser: Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – transportgrense: 50 % av kjøretøyets verdi på skadedagen · Veihjelp – unntak: Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: For slitt eller ripet til EU-godkjenning før skaden: ikke dekket |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – ulykkessted: I eller på kjøretøyet; også utenfor når kjøretøyet er direkte skadeårsak · Fører/passasjer – unntak: Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1 |

### If Super mot Frende Utvidet

Comparison ID: `bil__if__ordinary__if-bil-super__mot2-2__vs__frende__ordinary__frende-bil-utvidet__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION, KNOWN_POSITIVE_CONTROL. Seksjoner: 11. Rendererte fakta: 98. Direkte rader: 34. Én-sidige rader: 19. Unknown-celler: 19. Flagg: 14.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | Skade på egen bil | Feilfylling | both | included / included – ✓ Inkludert – Skade direkte som følge av fylling av feil væske \|\| ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| PARENT_CONTAINS_CHILD_CANDIDATE | Skade på egen bil | Feilfylling | second | included – ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| SAME_CONCEPT_DIFFERENT_STRUCTURE | Skade på egen bil | Hærverk | both | included / included – ✓ Inkludert – Forsettlig hærverk på kjøretøyet \|\| ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| PARENT_CONTAINS_CHILD_CANDIDATE | Skade på egen bil | Hærverk | second | included – ✓ Inkludert – Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på egen bil | Kasko – avtalt egenandel | second | included – Fremgår av forsikringsbeviset |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Maskinskade | Maskinskade / motor- og girskade | first | Produktspesifikk detalj – Motor- og girskade – diesel/bensin: Motor, topplokk, turbo/EGR, AdBlue og innsprøytningssystem etter oppregning · Motor- og girskade – elbil/hybrid: Høyvoltbatteri, høyspentkabel og ladekontakt, batterikjøling/-overvåking, omformer og fabrikkmontert lader · Motor- og girskade – gir og kraftoverføring: Girkasse, fordelingskasse, vinkeldrev og oppregnede aksler og clutchdeler |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Leiebil | first | Produktspesifikk detalj – Leiebil – utløser: Dekket skade eller tyveri; ved motor-/girskade inntil 7 dager mens dekning vurderes · Leiebil – unntak: Ingen leiebil ved ren glasskade eller når leiebil dekkes etter lov eller mobilitetsgaranti. Likevel dekkes inntil 7 dager når forhandler eller verksted er ansvarlig etter lov/forskrift, skaden ellers ville vært dekningsmessig og overstiger aktuell egenandel. |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Mobilitet | Veihjelp | first | Produktspesifikk detalj – Veihjelp – transportgrense: Transportkostnader høyst 50 % av kjøretøyets verdi på transporttidspunktet · Veihjelp – unntak: Verkstedreparasjon og ytelser fra abonnement eller garanti dekkes ikke |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Glass og redning | Glass | first | Produktspesifikk detalj – Glass – begrensning: Lykter og slitasjeskader ved normal bruk dekkes ikke |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Utstyr og eiendeler | Utstyr og eiendeler | first | Produktspesifikk detalj – Ettermontert utstyr og bagasje – samlet grense: Inntil 40 000 kr samlet, høyst 50 % av kjøretøyets gjenanskaffelsesverdi; avtalt sum kan utvides · Utstyr og bagasje – unntak: Penger/verdipapir og fastmontert ladestasjon i bygning er ikke inkludert |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Utstyr og eiendeler | Utstyr og eiendeler | second | Produktspesifikk detalj – Fastmontert tilleggsutstyr – forsikringssum: Inntil 50 000 kr · Personlige eiendeler – forsikringssum: Inntil 20 000 kr |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – ulykkessted: I eller på motorvognen; fører også utenfor når motorvognen er direkte skadeårsak · Fører/passasjer – avtalevilkår: Den avtalte ulykkesdekningen skal fremgå av forsikringsbeviset · Fører/passasjer – unntak: Blant annet psykiske lidelser/atferdsforstyrrelser og tannskade ved invaliditet |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Brann, tyveri og natur | Brann | first | Produktspesifikk detalj – Brann – begrensning: Batterier og elektroniske enheter krever åpen ild på utsiden av enheten |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Andre bilvilkår | Super | first | Produktspesifikk detalj – Super – unntak: Gjelder ikke drosje, trafikkskole- eller utleiebil, ikke godkjent effektøkning eller skade ved prøvekjennemerke |

### Gjensidige Ansvar mot Storebrand Ansvar

Comparison ID: `bil__gjensidige__ordinary__gj-bil-ansvar__null__vs__storebrand__ordinary__sb-bil-ansvar__motor09__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 4. Rendererte fakta: 28. Direkte rader: 10. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | first | Produktspesifikk detalj – Fører/passasjer – ulykkessted: I, på eller ved motorvognen når den eller tilkoblet utstyr er direkte skadeårsak |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Fører og passasjer | Fører- og passasjerulykke | second | Produktspesifikk detalj – Fører/passasjer – avtalevilkår: Valgt ulykkesdekning må fremgå av forsikringsbeviset |

### If Super mot If Kasko

Comparison ID: `bil__if__ordinary__if-bil-super__mot2-2__vs__if__ordinary__if-bil-kasko__mot2-2__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 11. Rendererte fakta: 102. Direkte rader: 44. Én-sidige rader: 12. Unknown-celler: 12. Flagg: 1.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| PROVIDER_SPECIFIC_NOT_COMPARABLE | Andre bilvilkår | Super | first | Produktspesifikk detalj – Super – unntak: Gjelder ikke drosje, trafikkskole- eller utleiebil, ikke godkjent effektøkning eller skade ved prøvekjennemerke |

## Hus

Providers testet: Tryg, If, Storebrand, Gjensidige, Fremtind, Frende. Produkter i eligible katalog: 13. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 32.

| Reason code | Antall |
| --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | 27 |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | 4 |
| DUPLICATE_DISPLAY_LABEL | 1 |

### Tryg Hus Ekstra mot If Super

Comparison ID: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__if__ordinary__if-hus-super__2023-09__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 182. Direkte rader: 53. Én-sidige rader: 76. Unknown-celler: 76. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Riving, rydding og bortkjøring | first | included – Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | Vann og fukt | Vann gjennom tak og yttervegg | second | unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Forsikringsbevisets forrang | second | included – Forsikringsbevisets spesifikasjoner og valgte dekning gjelder foran vilkårene. Beviset fastslår blant annet nivå, bygninger, forsikringssted og avtalt egenandel. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Råte/skadedyr – sum | first | optional – Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen. |

### Tryg Hus Ekstra mot Storebrand Super

Comparison ID: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__storebrand__ordinary__storebrand-hus-super__2025-08-15__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 170. Direkte rader: 49. Én-sidige rader: 72. Unknown-celler: 72. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Riving, rydding og bortkjøring | first | included – Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Tapt leieinntekt etter bygningsskade | second | included – Når utleie er avtalt og står i forsikringsbeviset: tapt leieinntekt fra skadedato til normal reparasjon, begrenset til tidligere leieinntekt. Skilles fra leietakers betalingsmislighold. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Råte/skadedyr – sum | first | optional – Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen. |

### Tryg Hus Ekstra mot Gjensidige Hus

Comparison ID: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__gjensidige__ordinary__gjensidige-hus__alminnelige-vilkår__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 172. Direkte rader: 39. Én-sidige rader: 94. Unknown-celler: 94. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Forsikringsform | second | included – Fullverdi gir gjenoppføring etter vilkårsreglene uten fast sum. Førsterisiko er begrenset til avtalt forsikringssum. Forsikringsbeviset avgjør formen. |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Riving, rydding og bortkjøring | first | included – Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Råte/skadedyr – sum | first | optional – Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen. |

### Tryg Hus Ekstra mot Fremtind Topp

Comparison ID: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__fremtind__ordinary__fremtind-hus-topp__pbk-200-100-015-pbk-200-200-010__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 170. Direkte rader: 43. Én-sidige rader: 84. Unknown-celler: 84. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Forsikringsform | second | included – Fullverdi dekker kostnaden ved tilsvarende eller vesentlig tilsvarende gjenoppføring etter oppgjørsreglene. Førsterisiko er begrenset til avtalt sum i forsikringsbeviset. |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Riving, rydding og bortkjøring | first | included – Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Råte/skadedyr – sum | first | optional – Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen. |

### Tryg Hus Ekstra mot Frende Utvidet

Comparison ID: `hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__frende__ordinary__frende-hus-utvidet__2026-09-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 11. Rendererte fakta: 166. Direkte rader: 38. Én-sidige rader: 90. Unknown-celler: 90. Flagg: 7.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Forsikringsform | second | included – Fullverdi er et reparasjons-/gjenoppføringsprinsipp uten fast forsikringssum. Førsterisiko er begrenset til avtalt sum i forsikringsbeviset. |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Riving, rydding og bortkjøring | first | included – Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. |
| DUPLICATE_DISPLAY_LABEL | Håndverker- og konstruksjonsfeil | Håndverker- og konstruksjonsfeil | both | Håndverker- og konstruksjonsfeil → Håndverker- og konstruksjonsfeil → Håndverker- og konstruksjonsfeil |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Tapt leieinntekt etter bygningsskade | second | included – Avtalt leie i normal reparasjons-/gjenoppføringstid når utleie står i forsikringsbeviset; leiekontrakten må dokumentere partene, pris, varighet, depositum/garanti og opphør. |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Utleie – egenandel | second | optional – Ingen egen særandel er oppgitt i fullvilkåret; avtalt egenandel i forsikringsbeviset gjelder. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Råte/skadedyr – sum | first | optional – Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Egenandelsfritak | second | included – Ingen egenandel ved aktiv varslet innbruddsalarm eller skade som bare rammer overspenningsvern/brann-/innbruddsalarm. Når aldersfradrag minst tilsvarer avtalt egenandel trekkes ikke egenandel. |

### If Super mot Frende Utvidet

Comparison ID: `hus__if__ordinary__if-hus-super__2023-09__vs__frende__ordinary__frende-hus-utvidet__2026-09-01__primary`. Valggrunn: NON_ANCHOR_VARIATION, KNOWN_POSITIVE_CONTROL. Seksjoner: 12. Rendererte fakta: 134. Direkte rader: 42. Én-sidige rader: 50. Unknown-celler: 50. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Forsikringsform | second | included – Fullverdi er et reparasjons-/gjenoppføringsprinsipp uten fast forsikringssum. Førsterisiko er begrenset til avtalt sum i forsikringsbeviset. |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | Vann og fukt | Vann gjennom tak og yttervegg | first | unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt. |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Tapt leieinntekt etter bygningsskade | second | included – Avtalt leie i normal reparasjons-/gjenoppføringstid når utleie står i forsikringsbeviset; leiekontrakten må dokumentere partene, pris, varighet, depositum/garanti og opphør. |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Utleie – egenandel | second | optional – Ingen egen særandel er oppgitt i fullvilkåret; avtalt egenandel i forsikringsbeviset gjelder. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Forsikringsbevisets forrang | first | included – Forsikringsbevisets spesifikasjoner og valgte dekning gjelder foran vilkårene. Beviset fastslår blant annet nivå, bygninger, forsikringssted og avtalt egenandel. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Egenandelsfritak | second | included – Ingen egenandel ved aktiv varslet innbruddsalarm eller skade som bare rammer overspenningsvern/brann-/innbruddsalarm. Når aldersfradrag minst tilsvarer avtalt egenandel trekkes ikke egenandel. |

### Gjensidige Hus Pluss mot Storebrand Standard

Comparison ID: `hus__gjensidige__ordinary__gjensidige-hus-pluss__alminnelige-vilkår__vs__storebrand__ordinary__storebrand-hus-standard__2025-08-15__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 12. Rendererte fakta: 127. Direkte rader: 46. Én-sidige rader: 35. Unknown-celler: 35. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Gjenoppføring og totalskade | Forsikringsform | first | included – Fullverdi gir gjenoppføring etter vilkårsreglene uten fast sum. Førsterisiko er begrenset til avtalt forsikringssum. Forsikringsbeviset avgjør formen. |
| CUSTOMER_SPECIFIC_REFERENCE | Utleie og midlertidig bosted | Tapt leieinntekt etter bygningsskade | second | included – Når utleie er avtalt og står i forsikringsbeviset: tapt leieinntekt fra skadedato til normal reparasjon, begrenset til tidligere leieinntekt. Skilles fra leietakers betalingsmislighold. |

### If Super mot If Utvidet

Comparison ID: `hus__if__ordinary__if-hus-super__2023-09__vs__if__ordinary__if-hus-utvidet__2023-09__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 12. Rendererte fakta: 142. Direkte rader: 67. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | Vann og fukt | Vann gjennom tak og yttervegg | first | unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt. |
| POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | Vann og fukt | Vann gjennom tak og yttervegg | second | unavailable – Ikke inkludert / ikke tilgjengelig – Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Forsikringsbevisets forrang | first | included – Forsikringsbevisets spesifikasjoner og valgte dekning gjelder foran vilkårene. Beviset fastslår blant annet nivå, bygninger, forsikringssted og avtalt egenandel. |
| CUSTOMER_SPECIFIC_REFERENCE | Andre husvilkår | Forsikringsbevisets forrang | second | included – Forsikringsbevisets spesifikasjoner og valgte dekning gjelder foran vilkårene. Beviset fastslår blant annet nivå, bygninger, forsikringssted og avtalt egenandel. |

## Innbo

Providers testet: Tryg, If, Gjensidige, Storebrand, Fremtind, Frende. Produkter i eligible katalog: 12. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 23.

| Reason code | Antall |
| --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | 21 |
| DUPLICATE_DISPLAY_LABEL | 2 |

### Tryg Innbo Ekstra mot If Super

Comparison ID: `innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__if__ordinary__if-innbo-super__ibo2-1__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 10. Rendererte fakta: 105. Direkte rader: 37. Én-sidige rader: 31. Unknown-celler: 31. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Velges av forsikringstaker og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | second | included – Forsikringssummen fremgår av forsikringsbeviset; ubegrenset forsikringssum gjelder bare når dette er avtalt |

### Tryg Innbo Ekstra mot Gjensidige Innbo Pluss

Comparison ID: `innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__gjensidige__ordinary__gj-innbo-pluss__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 10. Rendererte fakta: 99. Direkte rader: 32. Én-sidige rader: 35. Unknown-celler: 35. Flagg: 1.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Velges av forsikringstaker og står i forsikringsbeviset |

### Tryg Innbo Ekstra mot Storebrand Super

Comparison ID: `innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__storebrand__ordinary__sb-innbo-super__innbo09__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 10. Rendererte fakta: 107. Direkte rader: 34. Én-sidige rader: 39. Unknown-celler: 39. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Tyveri | Tyveri fra privat bod i fellesrom – grense | second | included – Avtalt forsikringssum; særlig tyveriutsatte og verdifulle gjenstander har oppbevaringsbegrensninger |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Velges av forsikringstaker og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | second | included – Forsikringssummen velges av forsikringstakeren og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Hobbyveksthus – grense | second | included – Avtalt forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre innbovilkår | Generell egenandel | second | included – Egenandelen står i forsikringsbeviset og gjelder når vilkåret ikke angir en annen egenandel |

### Tryg Innbo Ekstra mot Fremtind Innbo Pluss

Comparison ID: `innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__fremtind__ordinary__fremtind-innbo-topp__2025-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 10. Rendererte fakta: 100. Direkte rader: 30. Én-sidige rader: 40. Unknown-celler: 40. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Velges av forsikringstaker og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | second | included – Avtalt forsikringssum står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Ansvar og rettshjelp | Privatansvar – forsikringssum | second | included – Forsikringssummen står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Andre innbovilkår | Generell egenandel | second | included – Egenandelen står i forsikringsbeviset |

### Tryg Innbo Ekstra mot Frende Standard

Comparison ID: `innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__frende__ordinary__frende-innbo-standard__2026-09-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 10. Rendererte fakta: 108. Direkte rader: 33. Én-sidige rader: 42. Unknown-celler: 42. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Velges av forsikringstaker og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Andre innbovilkår | Generell egenandel | second | included – Egenandelen står i forsikringsbeviset |

### If Super mot Frende Standard

Comparison ID: `innbo__if__ordinary__if-innbo-super__ibo2-1__vs__frende__ordinary__frende-innbo-standard__2026-09-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 10. Rendererte fakta: 123. Direkte rader: 37. Én-sidige rader: 49. Unknown-celler: 49. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Uhell | Uhell | both | Uhell → Uhell → Uhell |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Forsikringssummen fremgår av forsikringsbeviset; ubegrenset forsikringssum gjelder bare når dette er avtalt |
| CUSTOMER_SPECIFIC_REFERENCE | Andre innbovilkår | Generell egenandel | second | included – Egenandelen står i forsikringsbeviset |

### Gjensidige Innbo mot Storebrand Standard

Comparison ID: `innbo__gjensidige__ordinary__gj-innbo__null__vs__storebrand__ordinary__sb-innbo-standard__innbo09__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 8. Rendererte fakta: 79. Direkte rader: 28. Én-sidige rader: 23. Unknown-celler: 23. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Forsikringssummen er ikke oppgitt i det alminnelige vilkåret og må kontrolleres i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | second | included – Forsikringssummen velges av forsikringstakeren og står i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Andre innbovilkår | Generell egenandel | second | included – Egenandelen står i forsikringsbeviset og gjelder når vilkåret ikke angir en annen egenandel |

### If Super mot If Utvidet

Comparison ID: `innbo__if__ordinary__if-innbo-super__ibo2-1__vs__if__ordinary__if-innbo-utvidet__ibo2-1__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 10. Rendererte fakta: 112. Direkte rader: 52. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Uhell | Uhell | both | Uhell → Uhell → Uhell |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | first | included – Forsikringssummen fremgår av forsikringsbeviset; ubegrenset forsikringssum gjelder bare når dette er avtalt |
| CUSTOMER_SPECIFIC_REFERENCE | Forsikringssum | Samlet forsikringssum | second | included – Forsikringssummen fremgår av forsikringsbeviset; ubegrenset forsikringssum gjelder bare når dette er avtalt |

## Reise

Providers testet: Tryg, If, Storebrand, Gjensidige, Fremtind, Frende. Produkter i eligible katalog: 12. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 20.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 14 |
| CUSTOMER_SPECIFIC_REFERENCE | 6 |

### Tryg Reise Premium mot If Super

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__if__ordinary__if-reise-super__2026-09-20-canonical__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 111. Direkte rader: 38. Én-sidige rader: 35. Unknown-celler: 35. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |

### Tryg Reise Premium mot Storebrand Super

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__storebrand__ordinary__storebrand-reise-super__2026-09-20-canonical__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 117. Direkte rader: 42. Én-sidige rader: 33. Unknown-celler: 33. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |

### Tryg Reise Premium mot Gjensidige Reise Pluss

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__gjensidige__ordinary__gjensidige-reise-pluss__2026-09-20-canonical__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 116. Direkte rader: 38. Én-sidige rader: 40. Unknown-celler: 40. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |
| CUSTOMER_SPECIFIC_REFERENCE | Ansvar og rettshjelp | Rettshjelp – egenandel | second | included – Ingen egenandel for Reiseforsikring dersom ikke annet fremgår av forsikringsbeviset. |

### Tryg Reise Premium mot Fremtind Reise

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__fremtind__ordinary__fremtind-reise__pre-450-200-015__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 108. Direkte rader: 31. Én-sidige rader: 46. Unknown-celler: 46. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Reisens rammer | Avtalt reisevarighet | second | included – Avtalt antall reisedøgn står i forsikringsbeviset. Andre varigheter enn standard er kundespesifikke avtalevalg, ikke automatisk canonical dekning. |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |
| CUSTOMER_SPECIFIC_REFERENCE | Ansvar og rettshjelp | Privatansvar – egenandel | second | included – Fremgår av forsikringsbeviset eller vilkårene. |
| CUSTOMER_SPECIFIC_REFERENCE | Ansvar og rettshjelp | Privatansvar – sum | second | included – Forsikringssummen fremgår av forsikringsbeviset. |

### Tryg Reise Premium mot Frende Reiseforsikring

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__frende__ordinary__frende-reiseforsikring__2026-03-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 123. Direkte rader: 40. Én-sidige rader: 43. Unknown-celler: 43. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |

### If Super mot Frende Reiseforsikring

Comparison ID: `reise__if__ordinary__if-reise-super__2026-09-20-canonical__vs__frende__ordinary__frende-reiseforsikring__2026-03-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 12. Rendererte fakta: 98. Direkte rader: 31. Én-sidige rader: 36. Unknown-celler: 36. Flagg: 1.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |

### Gjensidige Reise mot Storebrand Standard

Comparison ID: `reise__gjensidige__ordinary__gjensidige-reise__2026-09-20-canonical__vs__storebrand__ordinary__storebrand-reise-standard__2026-09-20-canonical__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 12. Rendererte fakta: 86. Direkte rader: 34. Én-sidige rader: 18. Unknown-celler: 18. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| CUSTOMER_SPECIFIC_REFERENCE | Ansvar og rettshjelp | Rettshjelp – egenandel | first | included – Ingen egenandel for Reiseforsikring dersom ikke annet fremgår av forsikringsbeviset. |

### Tryg Reise Premium mot Tryg Reise Ekstra

Comparison ID: `reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__tryg__ordinary__tryg-reise-ekstra__2026-09-20-canonical__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 12. Rendererte fakta: 132. Direkte rader: 64. Én-sidige rader: 4. Unknown-celler: 4. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Avbestilling | Avbestilling | both | Avbestilling → Avbestilling → Avbestilling |
| DUPLICATE_DISPLAY_LABEL | Reiseavbrudd | Reiseavbrudd | both | Reiseavbrudd → Reiseavbrudd → Reiseavbrudd |
| CUSTOMER_SPECIFIC_REFERENCE | Ulykke | Ulykkesdekning | second | unavailable – Ikke inkludert i Reise uten at Ulykke er valgt og står i forsikringsbeviset. |

## Snøscooter

Providers testet: Tryg, Gjensidige, Frende, Storebrand, If, Eika / Fremtind. Produkter i eligible katalog: 18. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 112.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 55 |
| CUSTOMER_SPECIFIC_REFERENCE | 15 |
| INTERNAL_LABEL_LEAK | 14 |
| OPTIONAL_INCLUDED_CONFLICT | 14 |
| POSSIBLE_DUPLICATE_CONCEPT | 7 |
| STATUS_TEXT_CONTRADICTION | 7 |

### Tryg Kasko mot Gjensidige Kasko

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER, KNOWN_POSITIVE_CONTROL. Seksjoner: 11. Rendererte fakta: 26. Direkte rader: 9. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 17.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

### Tryg Kasko mot Frende Kasko

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER, KNOWN_POSITIVE_CONTROL. Seksjoner: 10. Rendererte fakta: 21. Direkte rader: 6. Én-sidige rader: 9. Unknown-celler: 9. Flagg: 16.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

### Tryg Kasko mot Storebrand Kasko

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__storebrand__ordinary__storebrand-snoscooter-kasko__2025-04-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER, KNOWN_POSITIVE_CONTROL. Seksjoner: 9. Rendererte fakta: 20. Direkte rader: 6. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 15.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

### Tryg Kasko mot If Kasko

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__if__ordinary__if-snoscooter-kasko__2024-03__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER, KNOWN_POSITIVE_CONTROL. Seksjoner: 9. Rendererte fakta: 22. Direkte rader: 6. Én-sidige rader: 10. Unknown-celler: 10. Flagg: 15.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

### Tryg Kasko mot Eika / Fremtind Kasko

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__eika-fremtind__ordinary__eika-fremtind-snoscooter-kasko__2023-10-29__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER, KNOWN_POSITIVE_CONTROL. Seksjoner: 9. Rendererte fakta: 22. Direkte rader: 8. Én-sidige rader: 6. Unknown-celler: 6. Flagg: 17.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – egenandel | both | avtale – egenandel |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – egenandel | second | included – Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

### If Kasko mot Frende Kasko

Comparison ID: `snøscooter__if__ordinary__if-snoscooter-kasko__2024-03__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 8. Rendererte fakta: 17. Direkte rader: 5. Én-sidige rader: 7. Unknown-celler: 7. Flagg: 8.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |

### Gjensidige Ansvar mot Storebrand Ansvar

Comparison ID: `snøscooter__gjensidige__ordinary__gjensidige-snoscooter-ansvar__null__vs__storebrand__ordinary__storebrand-snoscooter-ansvar__2025-04-01__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 3. Rendererte fakta: 8. Direkte rader: 2. Én-sidige rader: 4. Unknown-celler: 4. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |

### Tryg Kasko mot Tryg Brann og tyveri

Comparison ID: `snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-brann-og-tyveri__null__primary`. Valggrunn: SAME_PROVIDER_LEVEL, KNOWN_POSITIVE_CONTROL. Seksjoner: 9. Rendererte fakta: 25. Direkte rader: 12. Én-sidige rader: 1. Unknown-celler: 1. Flagg: 21.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | first | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| STATUS_TEXT_CONTRADICTION | Redning | Redning – begrensninger | second | included – ✓ Inkludert – Utgifter til redning/veihjelp er unntatt |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | first | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| OPTIONAL_INCLUDED_CONFLICT | Fører- og passasjerulykke | Fører- og passasjerulykke | second | optional – Tilgjengelig som tillegg (Fører- og passasjerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Fører- og passasjerulykke | Fører- og passasjerulykke – forsikringssum | second | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Førerulykke | Førerulykke | both | Førerulykke → Førerulykke → Førerulykke |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | first | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| OPTIONAL_INCLUDED_CONFLICT | Førerulykke | Førerulykke | second | optional – Tilgjengelig som tillegg (Førerulykke) – Inkludert i produktnivået |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | first | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Førerulykke | Førerulykke – forsikringssum | second | optional – Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Ansvar | Ansvar | both | Ansvar → Ansvar → Ansvar |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – sesong | both | avtale – sesong |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | first | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |
| POSSIBLE_DUPLICATE_CONCEPT | Fører- og passasjerulykke | Fører- og passasjerulykke / Førerulykke | second | optional / optional – Inkludert i produktnivået \|\| Inkludert i produktnivået |

## Campingvogn

Providers testet: Tryg, Gjensidige, Frende, Storebrand, If, Eika / Fremtind. Produkter i eligible katalog: 17. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 111.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 87 |
| INTERNAL_LABEL_LEAK | 15 |
| CUSTOMER_SPECIFIC_REFERENCE | 9 |

### Tryg Campingvogn Ekstra mot Gjensidige Pluss

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__gjensidige__ordinary__gjensidige-campingvogn-pluss__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 36. Direkte rader: 11. Én-sidige rader: 14. Unknown-celler: 14. Flagg: 15.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Campingvogn Ekstra mot Frende Kasko

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__frende__ordinary__frende-campingvogn-kasko__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 35. Direkte rader: 12. Én-sidige rader: 11. Unknown-celler: 11. Flagg: 14.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Campingvogn Ekstra mot Storebrand Super

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__storebrand__ordinary__storebrand-campingvogn-super__2026-03-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 14. Rendererte fakta: 40. Direkte rader: 11. Én-sidige rader: 18. Unknown-celler: 18. Flagg: 16.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Ny campingvogn ved totalskade | Ny campingvogn ved totalskade | both | Ny campingvogn ved totalskade → Ny campingvogn ved totalskade → Ny campingvogn ved totalskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Campingvogn Ekstra mot If Kasko

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__if__ordinary__if-campingvogn-kasko__2024-03__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 33. Direkte rader: 7. Én-sidige rader: 19. Unknown-celler: 19. Flagg: 15.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Campingvogn Ekstra mot Eika / Fremtind Kasko

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__eika-fremtind__ordinary__eika-fremtind-campingvogn-kasko__2024-03-21__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 34. Direkte rader: 7. Én-sidige rader: 20. Unknown-celler: 20. Flagg: 18.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| CUSTOMER_SPECIFIC_REFERENCE | Fortelt | Fortelt – begrensninger | second | included – Fortelt/tilbygg må inngå i avtalt forsikringssum |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – egenandel | both | avtale – egenandel |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – egenandel | second | included – Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### If Kasko mot Frende Kasko

Comparison ID: `campingvogn__if__ordinary__if-campingvogn-kasko__2024-03__vs__frende__ordinary__frende-campingvogn-kasko__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 11. Rendererte fakta: 22. Direkte rader: 4. Én-sidige rader: 14. Unknown-celler: 14. Flagg: 11.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |

### Gjensidige Delkasko mot Storebrand Brann og tyveri

Comparison ID: `campingvogn__gjensidige__ordinary__gjensidige-campingvogn-delkasko__null__vs__storebrand__ordinary__storebrand-campingvogn-brann-og-tyveri__2026-03-01__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 8. Rendererte fakta: 16. Direkte rader: 5. Én-sidige rader: 6. Unknown-celler: 6. Flagg: 7.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |

### Tryg Campingvogn Ekstra mot Tryg Kasko

Comparison ID: `campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__tryg__ordinary__tryg-campingvogn-kasko__2026-01-01__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 12. Rendererte fakta: 38. Direkte rader: 15. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 15.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fuktskade | Fuktskade | both | Fuktskade → Fuktskade → Fuktskade |
| DUPLICATE_DISPLAY_LABEL | Avbrutt ferie | Avbrutt ferie | both | Avbrutt ferie → Avbrutt ferie → Avbrutt ferie |
| DUPLICATE_DISPLAY_LABEL | Løsøre | Løsøre | both | Løsøre → Løsøre → Løsøre |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Fortelt | Fortelt | both | Fortelt → Fortelt → Fortelt |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Glass | Glass | both | Glass → Glass → Glass |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | second | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

## Tilhenger

Providers testet: Tryg, Gjensidige, Frende, Storebrand, If, Eika / Fremtind. Produkter i eligible katalog: 12. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 72.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 48 |
| INTERNAL_LABEL_LEAK | 16 |
| CUSTOMER_SPECIFIC_REFERENCE | 8 |

### Tryg Kasko mot Gjensidige Kasko

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__gjensidige__ordinary__gjensidige-tilhenger-kasko__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 8. Rendererte fakta: 18. Direkte rader: 4. Én-sidige rader: 10. Unknown-celler: 10. Flagg: 10.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Kasko mot Frende Kasko

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__frende__ordinary__frende-tilhenger-kasko__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 7. Rendererte fakta: 21. Direkte rader: 8. Én-sidige rader: 5. Unknown-celler: 5. Flagg: 9.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Kasko mot Storebrand Kasko

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__storebrand__ordinary__storebrand-tilhenger-kasko__2026-03-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 8. Rendererte fakta: 21. Direkte rader: 6. Én-sidige rader: 9. Unknown-celler: 9. Flagg: 10.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Kasko mot If Kasko

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__if__ordinary__if-tilhenger-kasko__2024-03__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 7. Rendererte fakta: 21. Direkte rader: 7. Én-sidige rader: 7. Unknown-celler: 7. Flagg: 9.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### Tryg Kasko mot Eika / Fremtind Kasko

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__eika-fremtind__ordinary__eika-fremtind-tilhenger-kasko__2024-03-21__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 8. Rendererte fakta: 19. Direkte rader: 4. Én-sidige rader: 11. Unknown-celler: 11. Flagg: 12.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – egenandel | both | avtale – egenandel |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – egenandel | second | included – Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

### If Kasko mot Frende Kasko

Comparison ID: `tilhenger__if__ordinary__if-tilhenger-kasko__2024-03__vs__frende__ordinary__frende-tilhenger-kasko__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 6. Rendererte fakta: 16. Direkte rader: 4. Én-sidige rader: 8. Unknown-celler: 8. Flagg: 7.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |

### Gjensidige Delkasko mot Storebrand Brann og tyveri

Comparison ID: `tilhenger__gjensidige__ordinary__gjensidige-tilhenger-delkasko__null__vs__storebrand__ordinary__storebrand-tilhenger-brann-og-tyveri__2026-03-01__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 5. Rendererte fakta: 11. Direkte rader: 4. Én-sidige rader: 3. Unknown-celler: 3. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Redning | Redning | both | Redning → Redning → Redning |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |

### Tryg Kasko mot Tryg Brann og tyveri

Comparison ID: `tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__tryg__ordinary__tryg-tilhenger-brann-og-tyveri__2026-01-01__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 7. Rendererte fakta: 22. Direkte rader: 9. Én-sidige rader: 4. Unknown-celler: 4. Flagg: 10.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Kasko | Kasko | both | Kasko → Kasko → Kasko |
| DUPLICATE_DISPLAY_LABEL | Fastmontert utstyr | Fastmontert utstyr | both | Fastmontert utstyr → Fastmontert utstyr → Fastmontert utstyr |
| DUPLICATE_DISPLAY_LABEL | Brann | Brann | both | Brann → Brann → Brann |
| DUPLICATE_DISPLAY_LABEL | Tyveri | Tyveri | both | Tyveri → Tyveri → Tyveri |
| DUPLICATE_DISPLAY_LABEL | Naturskade | Naturskade | both | Naturskade → Naturskade → Naturskade |
| DUPLICATE_DISPLAY_LABEL | Rettshjelp | Rettshjelp | both | Rettshjelp → Rettshjelp → Rettshjelp |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – geografi | both | avtale – geografi |
| INTERNAL_LABEL_LEAK | Andre vilkår | avtale – forsikringssum | both | avtale – forsikringssum |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | first | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |
| CUSTOMER_SPECIFIC_REFERENCE | Andre vilkår | avtale – forsikringssum | second | included – Avtalt forsikringssum; ved totalskade begrenset til markedsverdien |

## MC

Providers testet: Tryg, If, Gjensidige, Storebrand, Fremtind, Frende. Produkter i eligible katalog: 19. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 40.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 29 |
| CUSTOMER_SPECIFIC_REFERENCE | 11 |

### Tryg MC Ekstra mot If Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__if__ordinary__if-mc-kasko__2024-03__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 95. Direkte rader: 35. Én-sidige rader: 25. Unknown-celler: 25. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg MC Ekstra mot Gjensidige Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__gjensidige__ordinary__gjensidige-mc-kasko__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 12. Rendererte fakta: 83. Direkte rader: 31. Én-sidige rader: 21. Unknown-celler: 21. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg MC Ekstra mot Storebrand Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__storebrand__ordinary__storebrand-mc-kasko__motor09__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 85. Direkte rader: 26. Én-sidige rader: 33. Unknown-celler: 33. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg MC Ekstra mot Fremtind Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__fremtind__ordinary-sparebank1__fremtind-mc-kasko__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 80. Direkte rader: 24. Én-sidige rader: 32. Unknown-celler: 32. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg MC Ekstra mot Frende Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__frende__ordinary__frende-mc-kasko__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 76. Direkte rader: 23. Én-sidige rader: 30. Unknown-celler: 30. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### If Kasko mot Frende Kasko

Comparison ID: `mc__if__ordinary__if-mc-kasko__2024-03__vs__frende__ordinary__frende-mc-kasko__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 12. Rendererte fakta: 67. Direkte rader: 21. Én-sidige rader: 25. Unknown-celler: 25. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Gjensidige Ansvar mot Storebrand Ansvar

Comparison ID: `mc__gjensidige__ordinary__gjensidige-mc-ansvar__null__vs__storebrand__ordinary__storebrand-mc-ansvar__motor09__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 3. Rendererte fakta: 22. Direkte rader: 11. Én-sidige rader: 0. Unknown-celler: 0. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg MC Ekstra mot Tryg Kasko

Comparison ID: `mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__tryg__ordinary__tryg-mc-kasko__2026-07-01__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 12. Rendererte fakta: 87. Direkte rader: 35. Én-sidige rader: 17. Unknown-celler: 17. Flagg: 6.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | first | included – Avtalt egenandel fremgår av forsikringsbeviset |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på MC | Kasko – egenandel | second | included – Avtalt egenandel fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Bagasje | Bagasje | both | Bagasje → Bagasje → Bagasje |
| DUPLICATE_DISPLAY_LABEL | Parkert MC | Parkert MC | both | Parkert MC → Parkert MC → Parkert MC |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

## Bobil

Providers testet: Tryg, If, Gjensidige, Storebrand, Fremtind, Frende. Produkter i eligible katalog: 24. Primære sammenligninger: 8. Kontrollkjøringer: 2. Flaggforekomster: 32.

| Reason code | Antall |
| --- | --- |
| DUPLICATE_DISPLAY_LABEL | 28 |
| CUSTOMER_SPECIFIC_REFERENCE | 4 |

### Tryg Bobil Ekstra mot If Super

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__if__ordinary__if-bobil-super__2022-06__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 14. Rendererte fakta: 126. Direkte rader: 47. Én-sidige rader: 32. Unknown-celler: 32. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Parkeringsskade | Parkeringsskade | both | Parkeringsskade → Parkeringsskade → Parkeringsskade |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg Bobil Ekstra mot Gjensidige Pluss

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__gjensidige__ordinary__gjensidige-bobil-pluss__null__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 14. Rendererte fakta: 112. Direkte rader: 43. Én-sidige rader: 26. Unknown-celler: 26. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Privat utleie | Privat utleie | both | Privat utleie → Privat utleie → Privat utleie |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg Bobil Ekstra mot Storebrand Super

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__storebrand__ordinary__storebrand-bobil-super__motor09__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 14. Rendererte fakta: 123. Direkte rader: 43. Én-sidige rader: 36. Unknown-celler: 36. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på bobil | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Parkeringsskade | Parkeringsskade | both | Parkeringsskade → Parkeringsskade → Parkeringsskade |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg Bobil Ekstra mot Fremtind Topp

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__fremtind__ordinary-dnb__fremtind-bobil-topp__2025-09-18__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 14. Rendererte fakta: 111. Direkte rader: 42. Én-sidige rader: 27. Unknown-celler: 27. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på bobil | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Parkeringsskade | Parkeringsskade | both | Parkeringsskade → Parkeringsskade → Parkeringsskade |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg Bobil Ekstra mot Frende Utvidet

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__frende__ordinary__frende-bobil-utvidet__2026-01-01__primary`. Valggrunn: ANCHOR_CROSS_PROVIDER. Seksjoner: 13. Rendererte fakta: 107. Direkte rader: 42. Én-sidige rader: 23. Unknown-celler: 23. Flagg: 4.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på bobil | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### If Super mot Frende Utvidet

Comparison ID: `bobil__if__ordinary__if-bobil-super__2022-06__vs__frende__ordinary__frende-bobil-utvidet__2026-01-01__primary`. Valggrunn: NON_ANCHOR_VARIATION. Seksjoner: 14. Rendererte fakta: 123. Direkte rader: 47. Én-sidige rader: 29. Unknown-celler: 29. Flagg: 5.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| CUSTOMER_SPECIFIC_REFERENCE | Skade på bobil | Kasko – egenandel | second | included – Fremgår av forsikringsbeviset |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Parkeringsskade | Parkeringsskade | both | Parkeringsskade → Parkeringsskade → Parkeringsskade |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Gjensidige Ansvar mot Storebrand Ansvar

Comparison ID: `bobil__gjensidige__ordinary__gjensidige-bobil-ansvar__null__vs__storebrand__ordinary__storebrand-bobil-ansvar__motor09__primary`. Valggrunn: LOWER_LEVEL_SPOT_CHECK. Seksjoner: 3. Rendererte fakta: 22. Direkte rader: 11. Én-sidige rader: 0. Unknown-celler: 0. Flagg: 2.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

### Tryg Bobil Ekstra mot Tryg Kasko

Comparison ID: `bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__tryg__ordinary__tryg-bobil-kasko__2026-01-01__primary`. Valggrunn: SAME_PROVIDER_LEVEL. Seksjoner: 12. Rendererte fakta: 95. Direkte rader: 40. Én-sidige rader: 15. Unknown-celler: 15. Flagg: 3.

| Flagg | Seksjon | Synlig label | Side | Rå evidens |
| --- | --- | --- | --- | --- |
| DUPLICATE_DISPLAY_LABEL | Skadedyr | Skadedyr | both | Skadedyr → Skadedyr → Skadedyr |
| DUPLICATE_DISPLAY_LABEL | Fører- og passasjerulykke | Fører- og passasjerulykke | both | Fører- og passasjerulykke → Fører- og passasjerulykke → Fører- og passasjerulykke |
| DUPLICATE_DISPLAY_LABEL | Geografisk område | Geografisk område | both | Geografisk område → Geografisk område → Geografisk område |

## Cross-family patterns

- **PRESENTATION_HIERARCHY**: 43 unike signaturer, 264 forekomster, familier Hus, Innbo, Reise, Snøscooter, Campingvogn, Tilhenger, MC, Bobil. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.

- **PRODUCT_MODE_ONLY_PRESENTATION**: 98 unike signaturer, 218 forekomster, familier Bil, Hus, Innbo, Reise, Snøscooter, Campingvogn, Tilhenger, MC, Bobil. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.

- **CANONICAL_SEMANTICS**: 6 unike signaturer, 15 forekomster, familier Bil, Snøscooter. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.

- **CATALOG_MATERIALIZATION**: 4 unike signaturer, 14 forekomster, familier Snøscooter. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.

- **STATUS_RESOLUTION**: 5 unike signaturer, 11 forekomster, familier Hus, Snøscooter. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.

## Representative comparisons

### Bil Tryg Kasko mot If Super

Seksjonsrekkefølge: Skade på egen bil → Maskinskade → Totalskade og nybil → Mobilitet → Glass og redning → Elbil → Utstyr og eiendeler → Fører og passasjer → Brann, tyveri og natur → Ansvar og rettshjelp → Andre bilvilkår.

- Skade på egen bil / Feilfylling
- Produkt A: ✓ Inkludert – Skade på eget kjøretøy ved feilfylling av drivstoff
- Produkt B: ✓ Inkludert – Skade direkte som følge av fylling av feil væske
- Kildetyper: Offentlig vilkår 

- Skade på egen bil / Rens etter feilfylling
- Produkt A: Tilgjengelig som tillegg (Bil Ekstra) – Inntil 15 000 kr; egenandel 1 000 kr
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Skade på egen bil / Hærverk
- Produkt A: ✓ Inkludert – Skade på eget kjøretøy ved hærverk
- Produkt B: ✓ Inkludert – Forsettlig hærverk på kjøretøyet
- Kildetyper: Offentlig vilkår 

- Skade på egen bil / Kaskoskade
- Produkt A: ✓ Inkludert – Sammenstøt, utforkjøring, velt, hærverk, feilfylling og plutselig, uventet ytre påvirkning
- Produkt B: ✓ Inkludert – Sammenstøt, utforkjøring, velt, feilfylling og annen tilfeldig, plutselig ytre hendelse
- Kildetyper: Offentlig vilkår 

- Skade på egen bil / Påkjørsel av dyr
- Produkt A: ✓ Inkludert – Ingen bonustap ved dokumentert varsling til politi/viltnemnd; egenandel 2 000 kr
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

### Hus Tryg Hus Ekstra mot If Super

Seksjonsrekkefølge: Plutselig skade → Gjenoppføring og totalskade → Vann og fukt → Våtrom → Råte og skadedyr → Håndverker- og konstruksjonsfeil → Vær og natur → Utleie og midlertidig bosted → Ansvar og rettshjelp → Boligtjenester → Aldersfradrag → Andre husvilkår.

- Plutselig skade / Annen plutselig og uforutsett bygningsskade
- Produkt A: ✓ Inkludert – Andre plutselige og uforutsette skader enn brann, elektrisk, vann, rørbrudd og tyveri. Følgeskade av håndverkerfeil kan omfattes når fagfolk utførte arbeidet og skaden oppdages innen 10 år; selve feilen og unødvendig tilkomst utbedres ikke.
- Produkt B: ✓ Inkludert – Andre plutselige og uforutsette skader, med uttrykkelige unntak for blant annet frost, tele, setninger, konstruksjons-/materialfeil, kondens, sopp/råte og skadedyr.
- Kildetyper: Offentlig vilkår 

- Plutselig skade / Bygningsskade – slitasje og vedlikehold
- Produkt A: ✓ Inkludert – Slitasje, tæring, forbruk, alder, ødeleggelse av tingen selv og kosmetiske skader er unntatt. Naturulykke og skadetyper i 2.1–2.5 behandles uttømmende i sine respektive dekninger.
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Gjenoppføring og totalskade / Ubeboelig bolig etter skade
- Produkt A: ✓ Inkludert – Normal reparasjons-/gjenoppføringstid, basert på markedsleie for umøblerte rom; fradrag for innsparte utgifter og renter. Ved kjøp av annen bolig senest til overtakelse.
- Produkt B: ✓ Inkludert – Nødvendige dokumenterte boutgifter i normal reparasjons-/gjenoppføringstid, inntil beregnet markedspris for tilsvarende umøblerte rom. Uten dokumenterte boutgifter: 50 % av markedspris.
- Kildetyper: Offentlig vilkår 

- Gjenoppføring og totalskade / Forsikringsform
- Produkt A: ✓ Inkludert – Fullverdi: gjenoppføring til samme eller vesentlig samme stand før skaden, med vilkårets begrensninger. Forsikringsbeviset har forrang.
- Produkt B: ✓ Inkludert – Fullverdi er hovedformen. Vilkåret har også egne oppgjørsregler for førsterisikoforsikret bygning; forsikringsbeviset avgjør formen og eventuell sum.
- Kildetyper: Offentlig vilkår 

- Gjenoppføring og totalskade / Gjenoppføring – annet sted eller formål
- Produkt A: ✓ Inkludert – Annet sted i Norge: fradrag for omsetningsverdiøkning over 40 %. Annet formål: hele verdiøkningen trekkes fra. Ved myndighetsforbud og gjenoppføring i samme kommune gjelder hovedregelen.
- Produkt B: ✓ Inkludert – Annet sted er bare likestilt når myndighetene krever flytting innen samme kommune. Ellers, ved annet formål eller annen byggherre, begrenses erstatningen til omsetningsverdifallet.
- Kildetyper: Offentlig vilkår 

### Innbo Tryg Innbo Ekstra mot If Super

Seksjonsrekkefølge: Uhell → Tyveri → Brann, vann og natur → Sykkel og verdigjenstander → Forsikringssum → Skadedyr → Flytting og midlertidig bosted → Ansvar og rettshjelp → ID- og netthjelp → Andre innbovilkår.

- Uhell / Plutselige og uforutsette skader
- Produkt A: ✓ Inkludert – Skader som består i annet enn at tingen er borte
- Produkt B: ✓ Inkludert – Annen fysisk skade ved plutselig ytre årsak; utenfor forsikringsstedet inntil 40 000 kr per skadetilfelle
- Kildetyper: Offentlig vilkår 

- Uhell / Uhell – geografisk område
- Produkt A: ✓ Inkludert – Norden når tingen er midlertidig borte fra forsikringsstedet
- Produkt B: ✓ Inkludert – Norden
- Kildetyper: Offentlig vilkår 

- Uhell / Uhell – egenandel
- Produkt A: ✓ Inkludert – 2 000 kr per skadetilfelle
- Produkt B: ✓ Inkludert – 2 000 kr per skadet gjenstand, maksimalt 4 000 kr per skadetilfelle
- Kildetyper: Offentlig vilkår 

- Uhell / Uhell – sentrale begrensninger
- Produkt A: ✓ Inkludert – Ukjent skadeårsak, kosmetiske skader, garanti eller selgers ansvar, slitasje, alder eller egenødeleggelse, frost, insekter, bakterier, sopp eller råte og skade fra kjæledyr er unntatt. Sykkel og elsykkel over 40 000 kr og skade under ritt, løp eller konkurranse er også unntatt.
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Tyveri / Tyveri, skadeverk og ran
- Produkt A: ✓ Inkludert – Ran, overfall og dokumenterte tyveri- og skadeverkstilfeller
- Produkt B: ✓ Inkludert – Tyveri på forsikringsstedet, ran/overfall på forsikringsstedet og forsettlig skadeverk
- Kildetyper: Offentlig vilkår 

### Reise Tryg Reise Premium mot If Super

Seksjonsrekkefølge: Reisens rammer → Avbestilling → Sykdom og hjemtransport → Bagasje → Forsinkelse → Reiseavbrudd → Ulykke → Leiebil → Evakuering og UD → Ansvar og rettshjelp → Reisetjenester → Andre reisevilkår.

- Reisens rammer / UD-reiseadvarsel
- Produkt A: Ikke inkludert / ikke tilgjengelig – Forsikringen gjelder ikke for reise til område med gyldig offisiell UD-reiseadvarsel på reisetidspunktet; hele reisen er ugyldig selv om advarselen senere oppheves.
- Produkt B: ✓ Inkludert – Områder med offisielt UD-reiseråd er unntatt etter vilkårets tidsregler. Avbestilling krever at rådet fortsatt gjelder 72 timer før avreise; evakuering har egne hendelsesvilkår.
- Kildetyper: Offentlig vilkår 

- Reisens rammer / Geografisk område
- Produkt A: ✓ Inkludert – Reiser i hele verden, men ikke fast/midlertidig bosted eller fast arbeids-/skole-/undervisningssted. Fritidsarrangement på slike steder er unntatt fra stedsbegrensningen.
- Produkt B: Ikke inkludert / ikke tilgjengelig – Valgt område er Norden eller hele verden. Gjelder ikke hjemme, på undervisningssted eller jobb. Ansvar og rettshjelp krever verdensdekning og reise utenfor Norden.
- Kildetyper: Offentlig vilkår 

- Reisens rammer / Reise med eller uten overnatting
- Produkt A: ✓ Inkludert – Reise Ekstra gjelder fritids- og tjenestereiser med og uten overnatting.
- Produkt B: ✓ Inkludert – Forsikringen gjelder fra du forlater hjemmet; ordinær reise krever ikke overnatting, men enkelte Super-dekninger krever feriereise med minst én overnatting.
- Kildetyper: Offentlig vilkår 

- Reisens rammer / Hvem forsikringen gjelder for
- Produkt A: ✓ Inkludert – Personene fremgår av forsikringsbeviset. Det aktive produktvilkåret definerer ikke en generell familie-, samboer-, fosterbarn- eller barnealdersgruppe som kan fylles inn i katalogen.
- Produkt B: ✓ Inkludert – Kan velges for forsikringstaker alene eller familie. Familie omfatter ektefelle/samboer med samme folkeregistrerte adresse og barn under 21 år; forsikringsbeviset avgjør personkretsen.
- Kildetyper: Offentlig vilkår 

- Reisens rammer / Tjenestereise
- Produkt A: ✓ Inkludert – Reise Ekstra gjelder også tjenestereiser, men avbestilling, tjenestereiseutgifter og reiseavbrudd har uttrykkelige unntak i dekningsvilkåret.
- Produkt B: Ikke inkludert / ikke tilgjengelig – Ordinært reiseomfang kan gjelde uten at reisen er ferie, men avbestilling, tapt ferie og enkelte Super-ytelser gjelder ikke jobbreiser.
- Kildetyper: Offentlig vilkår 

### Snøscooter Tryg Kasko mot Gjensidige Kasko

Seksjonsrekkefølge: Kasko → Fastmontert utstyr → Løsøre → Redning → Fører- og passasjerulykke → Førerulykke → Brann → Tyveri → Ansvar → Rettshjelp → Andre vilkår.

- Kasko / Kasko
- Produkt A: ✓ Inkludert – Inkludert i produktnivået
- Produkt B: ✓ Inkludert – Inkludert i produktnivået
- Kildetyper: Offentlig vilkår 

- Fastmontert utstyr / Fastmontert utstyr
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – Omfattes ved skade som dekkes av valgt produktnivå
- Kildetyper: Offentlig vilkår 

- Fastmontert utstyr / Fastmontert utstyr – forsikringssum
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – 10 000 kr
- Kildetyper: Offentlig vilkår 

- Løsøre / Løsøre
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – Omfattes ved skade som dekkes av valgt produktnivå
- Kildetyper: Offentlig vilkår 

- Løsøre / Løsøre – forsikringssum
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – 5 000 kr
- Kildetyper: Offentlig vilkår 

### Campingvogn Tryg Campingvogn Ekstra mot Gjensidige Pluss

Seksjonsrekkefølge: Kasko → Fuktskade → Avbrutt ferie → Løsøre → Fastmontert utstyr → Fortelt → Skadedyr → Redning → Glass → Brann → Tyveri → Rettshjelp → Andre vilkår.

- Kasko / Kasko
- Produkt A: ✓ Inkludert – Inkludert i produktnivået
- Produkt B: ✓ Inkludert – Inkludert i produktnivået
- Kildetyper: Offentlig vilkår 

- Kasko / Kasko – begrensninger
- Produkt A: ✓ Inkludert – Frost, strømbrudd og konstruksjonssprekker er unntatt
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Fuktskade / Fuktskade
- Produkt A: ✓ Inkludert – Inkludert i produktnivået
- Produkt B: ✓ Inkludert – Inkludert i produktnivået
- Kildetyper: Offentlig vilkår 

- Fuktskade / Fuktskade – aldersgrense
- Produkt A: ✓ Inkludert – Innen 10 år etter første registrering som fabrikkny
- Produkt B: ✓ Inkludert – Ikke eldre enn 15 år fra produksjonsdato
- Kildetyper: Offentlig vilkår 

- Fuktskade / Fuktskade – egenandel
- Produkt A: ✓ Inkludert – 8 000 kr inntil 5 år; deretter 25 %, minst 8 000 kr
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

### Tilhenger Tryg Kasko mot Gjensidige Kasko

Seksjonsrekkefølge: Kasko → Fastmontert utstyr → Redning → Brann → Tyveri → Naturskade → Rettshjelp → Andre vilkår.

- Kasko / Kasko
- Produkt A: ✓ Inkludert – Inkludert i produktnivået
- Produkt B: ✓ Inkludert – Inkludert i produktnivået
- Kildetyper: Offentlig vilkår 

- Kasko / Kasko – begrensninger
- Produkt A: ✓ Inkludert – Frost, strømbrudd, konstruksjonssprekker og insekter/gnagere er unntatt
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Fastmontert utstyr / Fastmontert utstyr
- Produkt A: ✓ Inkludert – Omfattes ved skade som dekkes av valgt produktnivå
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Fastmontert utstyr / Fastmontert utstyr – forsikringssum
- Produkt A: ✓ Inkludert – 10 000 kr
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Redning / Redning
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – Inkludert i produktnivået
- Kildetyper: Offentlig vilkår 

### MC Tryg MC Ekstra mot If Kasko

Seksjonsrekkefølge: Skade på MC → Maskinskade → Totalskade og nyverdi → Kjøreutstyr og hjelm → Fastmontert utstyr → Bagasje → Parkert MC → Veihjelp og leiekjøretøy → Fører- og passasjerulykke → Glass, nøkkel og feilfylling → Brann, tyveri og natur → Ansvar og rettshjelp → Geografisk område.

- Skade på MC / Kasko
- Produkt A: ✓ Inkludert – Sammenstøt, utforkjøring, velt, hærverk, feilfylling eller plutselig, uventet ytre påvirkning
- Produkt B: ✓ Inkludert – Sammenstøt, utforkjøring, velt, feilfylling eller annen tilfeldig, plutselig ytre hendelse
- Kildetyper: Offentlig vilkår 

- Skade på MC / Kasko – egenandel
- Produkt A: ✓ Inkludert – Avtalt egenandel fremgår av forsikringsbeviset
- Produkt B: ✓ Inkludert – 8 000 kr hvis ikke annet fremgår av særvilkår eller forsikringsbevis
- Kildetyper: Offentlig vilkår 

- Skade på MC / Kasko – begrensninger
- Produkt A: ✓ Inkludert – Maskinbrudd og frost unntatt; godkjent ferdighetskurs på is-/hastighetsbane øker egenandelen med 20 000 kr
- Produkt B: Ikke dokumentert i kataloggrunnlaget
- Kildetyper: Offentlig vilkår 

- Maskinskade / Maskinskade
- Produkt A: ✓ Inkludert – Plutselig og uforutsett mekanisk skade på motor, girkasse og kraftoverføring med elektroniske styreenheter
- Produkt B: Tilgjengelig som tillegg (Motor- og girskade) – Valgfritt til Kasko for mellomtung/tung motorsykkel; plutselig uforutsett skade på oppregnede motor-, gir-, drivlinje- og elektriske komponenter
- Kildetyper: Offentlig vilkår 

- Maskinskade / Maskinskade – alder ved kjøp
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: Tilgjengelig som tillegg (Motor- og girskade) – Kan kjøpes før motorsykkelen er sju år; bare mellomtung/tung MC med Kasko
- Kildetyper: IPID / produktark 

### Bobil Tryg Bobil Ekstra mot If Super

Seksjonsrekkefølge: Skade på bobil → Fukt og vann → Feriegaranti – ekstrautgifter → Maskinskade → Totalskade og nyverdi → Løsøre, utstyr og fortelt → Skadedyr → Parkeringsskade → Veihjelp og leiebil → Fører- og passasjerulykke → Glass, nøkkel og feilfylling → Brann, tyveri og natur → Ansvar og rettshjelp → Geografisk område.

- Skade på bobil / Kasko
- Produkt A: ✓ Inkludert – Skade på kjøretøy, deler, fortelt og terrasse ved sammenstøt, utforkjøring, velt, hærverk, feilfylling eller plutselig uventet ytre påvirkning
- Produkt B: ✓ Inkludert – Sammenstøt, utforkjøring, velt, feilfylling eller annen tilfeldig, plutselig ytre hendelse
- Kildetyper: Offentlig vilkår 

- Skade på bobil / Kasko – egenandel
- Produkt A: ✓ Inkludert – Avtalt egenandel i forsikringsbeviset; økes 5 000 kr ved fører under 23 år, unntatt når føreren er forsikringstaker
- Produkt B: ✓ Inkludert – 8 000 kr hvis ikke annet fremgår av særvilkår eller forsikringsbevis
- Kildetyper: Offentlig vilkår 

- Skade på bobil / Kasko – begrensninger
- Produkt A: ✓ Inkludert – Maskinbrudd, frost og strømbrudd er unntatt
- Produkt B: ✓ Inkludert – Ikke frost/snøtyngde, utett isolerglass eller vibrasjon/vridning ved ujevn vei. Løst utstyr ved annen plutselig ytre hendelse krever samtidig skade på bobilen.
- Kildetyper: Offentlig vilkår 

- Fukt og vann / Fukt
- Produkt A: ✓ Inkludert – Fuktskade i bobilens tak, vegger og gulv oppstått i forsikringstiden
- Produkt B: ✓ Inkludert – Andre fuktskader enn lekkasje fra boenhetens røranlegg etter godkjent/bestått fuktkontroll
- Kildetyper: Offentlig vilkår 

- Fukt og vann / Fukt – fuktkontroll
- Produkt A: Ikke dokumentert i kataloggrunnlaget
- Produkt B: ✓ Inkludert – Autorisert caravanforhandler eller Viking kontroll; dekning inntil ett år etter kontroll, deretter ny kontroll
- Kildetyper: Offentlig vilkår 

## Technical appendix

### Issue signatures

| Signature | Reason | Forekomster | Familier | Providers | Lag | PDF-relevans |
| --- | --- | --- | --- | --- | --- | --- |
| ISS-c8ebd60d23fdc28c | CUSTOMER_SPECIFIC_REFERENCE | 8 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-ff4bc98408da2845 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 2 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-6860394e88ad971e | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b16a49e44512f37b | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8f51bc6ab402cb05 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8ac4b0cdeec6d28f | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-24f452e7680e39be | PROVIDER_SPECIFIC_NOT_COMPARABLE | 7 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-c42396b040848289 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 7 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-5c6557d5ddb52f1f | PROVIDER_SPECIFIC_NOT_COMPARABLE | 7 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-167eb128df8850f0 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-0aaa6959d1f10200 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 6 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-34a2e8b4f386a31e | PROVIDER_SPECIFIC_NOT_COMPARABLE | 6 | Bil | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-660b54c6751050e3 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-16c6f96217c3540d | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-c6d9d1bd25f03523 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | SpareBank 1 / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-7e8ac5543f504325 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | SpareBank 1 / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-234bb3ec6b55b23f | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | DNB / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a1f2bbb5470a8f51 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | DNB / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-dc5a58ceac691b27 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-0d887c12faf7f431 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-2baa209383515d23 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-98f240d54c79dee5 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bil | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-46814b5273aeeb71 | SAME_CONCEPT_DIFFERENT_STRUCTURE | 2 | Bil | Tryg / Frende, If / Frende | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-9e52942abdd19d17 | PARENT_CONTAINS_CHILD_CANDIDATE | 2 | Bil | Frende | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-ded8aa776d61af8e | SAME_CONCEPT_DIFFERENT_STRUCTURE | 2 | Bil | Tryg / Frende, If / Frende | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-645eb89e2730122c | PARENT_CONTAINS_CHILD_CANDIDATE | 2 | Bil | Frende | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-f7dcbfdf42466952 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Bil | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-57398d1e51b7b09b | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-0de23c1b6ed8281a | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-9e756e45786bc33d | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b94ebf2715498a70 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-caf01119a981ee6e | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-849bfd0e688dfb0e | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-f40dfaec9b021b4f | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-dc8923799261d92f | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-844f88681a7d8fcd | PROVIDER_SPECIFIC_NOT_COMPARABLE | 2 | Bil | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-6916e3707ec31851 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-652711b1ba5837b0 | PROVIDER_SPECIFIC_NOT_COMPARABLE | 1 | Bil | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-be465d10fb3d1540 | CUSTOMER_SPECIFIC_REFERENCE | 5 | Hus | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-ce1643a4e8fa94b0 | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | 1 | Hus | If | STATUS_RESOLUTION | LIKELY_SHARED |
| ISS-4674306f711d4cfd | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-7bfd4483af3392fe | CUSTOMER_SPECIFIC_REFERENCE | 5 | Hus | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-85fa2985890ed63f | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-22f77d85e0c81bea | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-699c414d09a8c01f | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-9429a154b0c43501 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Hus | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-2684ba6fb638ae79 | DUPLICATE_DISPLAY_LABEL | 1 | Hus | Tryg / Frende | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-8e6641ac9898b077 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Hus | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8181fd23140c1f8a | CUSTOMER_SPECIFIC_REFERENCE | 2 | Hus | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a8b11484ef76eda0 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Hus | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-aaa9c65e93359d5b | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | 2 | Hus | If | STATUS_RESOLUTION | LIKELY_SHARED |
| ISS-e7b83d0e1efc433a | CUSTOMER_SPECIFIC_REFERENCE | 2 | Hus | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b98e0d26eb55749a | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-f535449408072037 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-9175f4a25c8b4179 | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | 1 | Hus | If | STATUS_RESOLUTION | LIKELY_SHARED |
| ISS-6b2caa8aaf1698eb | CUSTOMER_SPECIFIC_REFERENCE | 1 | Hus | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-5b3bb52662c7e39d | CUSTOMER_SPECIFIC_REFERENCE | 5 | Innbo | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-17d774740415f837 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-fbbe54cf94bf796b | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8b65b25984c183be | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-4a171e975b2b1fcb | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b56469fe754f1bfc | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-230e82a407451eb8 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-006a22f8ddc485b7 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-ff027752b830a01e | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b259c64c80079815 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Innbo | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8a0f212ef7f03fb1 | DUPLICATE_DISPLAY_LABEL | 2 | Innbo | If / Frende, If / If | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-b3a5ee869e8812aa | CUSTOMER_SPECIFIC_REFERENCE | 2 | Innbo | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-bdc11ca4245e83a4 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-2bdbc8ca276dbc42 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-1a8b8cc2c0a2347f | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-04e5b2d3df205ba3 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Innbo | If | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-19b98d37cdb13cfc | DUPLICATE_DISPLAY_LABEL | 8 | Reise | Tryg / If, Tryg / Storebrand, Tryg / Gjensidige, Tryg / Fremtind, Tryg / Frende, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-3055ad68f491eb31 | DUPLICATE_DISPLAY_LABEL | 6 | Reise | Tryg / If, Tryg / Storebrand, Tryg / Gjensidige, Tryg / Fremtind, Tryg / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-1040c94b44bbac61 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-d491573c37c6d560 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-90644b0daea6aed8 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-92f43d5c681bfa4a | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-02989fbf01eb740d | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Gjensidige | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a09661f8fe86677f | CUSTOMER_SPECIFIC_REFERENCE | 1 | Reise | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-60bf652ede84670e | DUPLICATE_DISPLAY_LABEL | 7 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-03d6c5671f97f1d6 | DUPLICATE_DISPLAY_LABEL | 3 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, If / Frende | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-e5c9f388656c01cc | DUPLICATE_DISPLAY_LABEL | 1 | Snøscooter | Tryg / Gjensidige | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-8ebdde76f9685b8a | STATUS_TEXT_CONTRADICTION | 6 | Snøscooter | Tryg | STATUS_RESOLUTION | LIKELY_SHARED |
| ISS-a350256dcabd9f30 | DUPLICATE_DISPLAY_LABEL | 8 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-ba323b6fbe07792a | OPTIONAL_INCLUDED_CONFLICT | 6 | Snøscooter | Tryg | CATALOG_MATERIALIZATION | LIKELY_SHARED |
| ISS-b69e8e82b97a3ffc | CUSTOMER_SPECIFIC_REFERENCE | 6 | Snøscooter | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-55241672e9e5763a | DUPLICATE_DISPLAY_LABEL | 6 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-85ff6542766f8307 | OPTIONAL_INCLUDED_CONFLICT | 6 | Snøscooter | Tryg | CATALOG_MATERIALIZATION | LIKELY_SHARED |
| ISS-eb9290d783804519 | CUSTOMER_SPECIFIC_REFERENCE | 6 | Snøscooter | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-19abcf6023656cc5 | DUPLICATE_DISPLAY_LABEL | 7 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-edda8dc257dfb48f | DUPLICATE_DISPLAY_LABEL | 7 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-0d8adf12a4a262a4 | DUPLICATE_DISPLAY_LABEL | 8 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-4f4ba8b0a20667ae | DUPLICATE_DISPLAY_LABEL | 8 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-5c500e343f8d78c7 | INTERNAL_LABEL_LEAK | 7 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-c450b19584482b87 | INTERNAL_LABEL_LEAK | 6 | Snøscooter | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-691de319e114fae3 | POSSIBLE_DUPLICATE_CONCEPT | 6 | Snøscooter | Tryg | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-a399ed8031a5bbcc | INTERNAL_LABEL_LEAK | 1 | Snøscooter | Tryg / Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-d7f498cc95a85b7b | CUSTOMER_SPECIFIC_REFERENCE | 1 | Snøscooter | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-e980d7d07e05ac7e | STATUS_TEXT_CONTRADICTION | 1 | Snøscooter | Tryg | STATUS_RESOLUTION | LIKELY_SHARED |
| ISS-9903ef9575456a2a | OPTIONAL_INCLUDED_CONFLICT | 1 | Snøscooter | Tryg | CATALOG_MATERIALIZATION | LIKELY_SHARED |
| ISS-836a5c81006ae497 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Snøscooter | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-6e2ed0255ef75485 | OPTIONAL_INCLUDED_CONFLICT | 1 | Snøscooter | Tryg | CATALOG_MATERIALIZATION | LIKELY_SHARED |
| ISS-0ecc6b4c750f74c4 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Snøscooter | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-6c6034fb20e71653 | POSSIBLE_DUPLICATE_CONCEPT | 1 | Snøscooter | Tryg | CANONICAL_SEMANTICS | LIKELY_SHARED |
| ISS-b6a861fa45368229 | DUPLICATE_DISPLAY_LABEL | 7 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-939c16856777c623 | DUPLICATE_DISPLAY_LABEL | 7 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-339b2dc292d3f4fc | DUPLICATE_DISPLAY_LABEL | 6 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-410b677e4149f1bc | DUPLICATE_DISPLAY_LABEL | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-bada59e1c456aed7 | DUPLICATE_DISPLAY_LABEL | 7 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-1ae032667749eaae | DUPLICATE_DISPLAY_LABEL | 7 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-bbd64a9627b6753e | DUPLICATE_DISPLAY_LABEL | 6 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-c24fa6b8f0fbf68f | DUPLICATE_DISPLAY_LABEL | 4 | Campingvogn | Tryg / Gjensidige, Tryg / Storebrand, Tryg / Eika / Fremtind, Gjensidige / Storebrand | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-62cd73da6b0f36e2 | DUPLICATE_DISPLAY_LABEL | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-018695238683e3f9 | DUPLICATE_DISPLAY_LABEL | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-519fa46e47c82538 | DUPLICATE_DISPLAY_LABEL | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-35aedcefdb7cee1e | DUPLICATE_DISPLAY_LABEL | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-1ec28e9f769800eb | INTERNAL_LABEL_LEAK | 8 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-4be34245f917eb55 | INTERNAL_LABEL_LEAK | 6 | Campingvogn | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a46bff1ae5461a06 | CUSTOMER_SPECIFIC_REFERENCE | 6 | Campingvogn | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-9524b557aa9eb357 | DUPLICATE_DISPLAY_LABEL | 1 | Campingvogn | Tryg / Storebrand | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-655f02d2b5ca206d | DUPLICATE_DISPLAY_LABEL | 2 | Campingvogn | Tryg / If, If / Frende | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-e45d8072f6ce23b3 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Campingvogn | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-1c0fa41c0f2f3f1d | INTERNAL_LABEL_LEAK | 1 | Campingvogn | Tryg / Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-9d944240d2b9739d | CUSTOMER_SPECIFIC_REFERENCE | 1 | Campingvogn | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-f256958914060073 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Campingvogn | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-8110f04f3d3add85 | DUPLICATE_DISPLAY_LABEL | 7 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-e7a7377c4ef812d6 | DUPLICATE_DISPLAY_LABEL | 7 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-126cd199af0494e5 | DUPLICATE_DISPLAY_LABEL | 4 | Tilhenger | Tryg / Gjensidige, Tryg / Storebrand, Tryg / Eika / Fremtind, Gjensidige / Storebrand | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-94ce2493024451a6 | DUPLICATE_DISPLAY_LABEL | 8 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-d26fec4fda8d6e6b | DUPLICATE_DISPLAY_LABEL | 8 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-571000a3c0fcd37a | DUPLICATE_DISPLAY_LABEL | 6 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-b89088f55b6bb0ef | DUPLICATE_DISPLAY_LABEL | 8 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-19e5866acbc28a51 | INTERNAL_LABEL_LEAK | 8 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-58672fca34a6133c | INTERNAL_LABEL_LEAK | 7 | Tilhenger | Tryg / Gjensidige, Tryg / Frende, Tryg / Storebrand, Tryg / If, Tryg / Eika / Fremtind, If / Frende, Tryg / Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-2e5c42c0f9160a2b | CUSTOMER_SPECIFIC_REFERENCE | 6 | Tilhenger | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-b63db90fe2dfb445 | INTERNAL_LABEL_LEAK | 1 | Tilhenger | Tryg / Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-cf4cf88c8283a6cb | CUSTOMER_SPECIFIC_REFERENCE | 1 | Tilhenger | Eika / Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-da19ba92b9baa163 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Tilhenger | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-fa2adf5d1cd28e97 | CUSTOMER_SPECIFIC_REFERENCE | 6 | MC | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-d285cff0a36db08f | DUPLICATE_DISPLAY_LABEL | 7 | MC | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-e38985d2e62be236 | DUPLICATE_DISPLAY_LABEL | 6 | MC | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-cd934435cca2a02b | DUPLICATE_DISPLAY_LABEL | 8 | MC | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-dce9a26fddd20c8a | DUPLICATE_DISPLAY_LABEL | 8 | MC | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-2f775303d73373bd | CUSTOMER_SPECIFIC_REFERENCE | 1 | MC | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a19f9d8e8e329b88 | CUSTOMER_SPECIFIC_REFERENCE | 1 | MC | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-873315e5a85c8b7b | CUSTOMER_SPECIFIC_REFERENCE | 2 | MC | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-fe8edfaa28cf0a6a | CUSTOMER_SPECIFIC_REFERENCE | 1 | MC | Tryg | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-eee45806f17dbba2 | DUPLICATE_DISPLAY_LABEL | 7 | Bobil | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-60d5541cbca15643 | DUPLICATE_DISPLAY_LABEL | 4 | Bobil | Tryg / If, Tryg / Storebrand, Tryg / Fremtind, If / Frende | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-3a41758c766d796a | DUPLICATE_DISPLAY_LABEL | 8 | Bobil | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-f4d2dc9178b55cdc | DUPLICATE_DISPLAY_LABEL | 8 | Bobil | Tryg / If, Tryg / Gjensidige, Tryg / Storebrand, Tryg / Fremtind, Tryg / Frende, If / Frende, Gjensidige / Storebrand, Tryg / Tryg | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-f58bc28117eeec4b | DUPLICATE_DISPLAY_LABEL | 1 | Bobil | Tryg / Gjensidige | PRESENTATION_HIERARCHY | PRODUCT_MODE_ONLY |
| ISS-24c1a6352550225d | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bobil | Storebrand | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-a0a7c2afafe038b7 | CUSTOMER_SPECIFIC_REFERENCE | 1 | Bobil | Fremtind | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |
| ISS-25b71dbbf781bea8 | CUSTOMER_SPECIFIC_REFERENCE | 2 | Bobil | Frende | PRODUCT_MODE_ONLY_PRESENTATION | PRODUCT_MODE_ONLY |

### Full comparison log

| Comparison ID | Familie | Produkt A | Produkt B | Type | Status | Flagg |
| --- | --- | --- | --- | --- | --- | --- |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__if__ordinary__if-bil-super__mot2-2__primary | Bil | Tryg Kasko | If Super | PRIMARY | COMPLETED | 6 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__gjensidige__ordinary__gj-bil-pluss__null__primary | Bil | Tryg Kasko | Gjensidige Pluss | PRIMARY | COMPLETED | 5 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__storebrand__ordinary__sb-bil-super__motor09__primary | Bil | Tryg Kasko | Storebrand Super | PRIMARY | COMPLETED | 9 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__sparebank-1-fremtind__ordinary__sb1-bil-toppkasko__pmo-357-001-004__primary | Bil | Tryg Kasko | SpareBank 1 / Fremtind Toppkasko | PRIMARY | COMPLETED | 8 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__dnb-fremtind__ordinary__dnb-bil-topp__pmo-357-001-004__primary | Bil | Tryg Kasko | DNB / Fremtind Topp | PRIMARY | COMPLETED | 8 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__eika-fremtind__ordinary__eika-bil-topp__pmo-357-001-004__primary | Bil | Tryg Kasko | Eika / Fremtind Topp | PRIMARY | COMPLETED | 8 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__fremtind__ordinary__fremtind-bil-topp__pmo-357-001-004__primary | Bil | Tryg Kasko | Fremtind Topp | PRIMARY | COMPLETED | 8 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__frende__ordinary__frende-bil-utvidet__2026-01-01__primary | Bil | Tryg Kasko | Frende Utvidet | PRIMARY | COMPLETED | 11 |
| bil__if__ordinary__if-bil-super__mot2-2__vs__frende__ordinary__frende-bil-utvidet__2026-01-01__primary | Bil | If Super | Frende Utvidet | PRIMARY | COMPLETED | 14 |
| bil__gjensidige__ordinary__gj-bil-ansvar__null__vs__storebrand__ordinary__sb-bil-ansvar__motor09__primary | Bil | Gjensidige Ansvar | Storebrand Ansvar | PRIMARY | COMPLETED | 2 |
| bil__if__ordinary__if-bil-super__mot2-2__vs__if__ordinary__if-bil-kasko__mot2-2__primary | Bil | If Super | If Kasko | PRIMARY | COMPLETED | 1 |
| bil__if__ordinary__if-bil-super__mot2-2__vs__tryg__ordinary__bil-kasko__pau25205__side-swap-control | Bil | If Super | Tryg Kasko | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| bil__tryg__ordinary__bil-kasko__pau25205__vs__tryg__ordinary__bil-kasko__pau25205__same-product-control | Bil | Tryg Kasko | Tryg Kasko | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__if__ordinary__if-hus-super__2023-09__primary | Hus | Tryg Hus Ekstra | If Super | PRIMARY | COMPLETED | 4 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__storebrand__ordinary__storebrand-hus-super__2025-08-15__primary | Hus | Tryg Hus Ekstra | Storebrand Super | PRIMARY | COMPLETED | 3 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__gjensidige__ordinary__gjensidige-hus__alminnelige-vilkår__primary | Hus | Tryg Hus Ekstra | Gjensidige Hus | PRIMARY | COMPLETED | 3 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__fremtind__ordinary__fremtind-hus-topp__pbk-200-100-015-pbk-200-200-010__primary | Hus | Tryg Hus Ekstra | Fremtind Topp | PRIMARY | COMPLETED | 3 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__frende__ordinary__frende-hus-utvidet__2026-09-01__primary | Hus | Tryg Hus Ekstra | Frende Utvidet | PRIMARY | COMPLETED | 7 |
| hus__if__ordinary__if-hus-super__2023-09__vs__frende__ordinary__frende-hus-utvidet__2026-09-01__primary | Hus | If Super | Frende Utvidet | PRIMARY | COMPLETED | 6 |
| hus__gjensidige__ordinary__gjensidige-hus-pluss__alminnelige-vilkår__vs__storebrand__ordinary__storebrand-hus-standard__2025-08-15__primary | Hus | Gjensidige Hus Pluss | Storebrand Standard | PRIMARY | COMPLETED | 2 |
| hus__if__ordinary__if-hus-super__2023-09__vs__if__ordinary__if-hus-utvidet__2023-09__primary | Hus | If Super | If Utvidet | PRIMARY | COMPLETED | 4 |
| hus__if__ordinary__if-hus-super__2023-09__vs__tryg__ordinary__tryg-hus-ekstra__2026-01-01__side-swap-control | Hus | If Super | Tryg Hus Ekstra | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| hus__tryg__ordinary__tryg-hus-ekstra__2026-01-01__vs__tryg__ordinary__tryg-hus-ekstra__2026-01-01__same-product-control | Hus | Tryg Hus Ekstra | Tryg Hus Ekstra | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__if__ordinary__if-innbo-super__ibo2-1__primary | Innbo | Tryg Innbo Ekstra | If Super | PRIMARY | COMPLETED | 2 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__gjensidige__ordinary__gj-innbo-pluss__null__primary | Innbo | Tryg Innbo Ekstra | Gjensidige Innbo Pluss | PRIMARY | COMPLETED | 1 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__storebrand__ordinary__sb-innbo-super__innbo09__primary | Innbo | Tryg Innbo Ekstra | Storebrand Super | PRIMARY | COMPLETED | 5 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__fremtind__ordinary__fremtind-innbo-topp__2025-01-01__primary | Innbo | Tryg Innbo Ekstra | Fremtind Innbo Pluss | PRIMARY | COMPLETED | 4 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__frende__ordinary__frende-innbo-standard__2026-09-01__primary | Innbo | Tryg Innbo Ekstra | Frende Standard | PRIMARY | COMPLETED | 2 |
| innbo__if__ordinary__if-innbo-super__ibo2-1__vs__frende__ordinary__frende-innbo-standard__2026-09-01__primary | Innbo | If Super | Frende Standard | PRIMARY | COMPLETED | 3 |
| innbo__gjensidige__ordinary__gj-innbo__null__vs__storebrand__ordinary__sb-innbo-standard__innbo09__primary | Innbo | Gjensidige Innbo | Storebrand Standard | PRIMARY | COMPLETED | 3 |
| innbo__if__ordinary__if-innbo-super__ibo2-1__vs__if__ordinary__if-innbo-utvidet__ibo2-1__primary | Innbo | If Super | If Utvidet | PRIMARY | COMPLETED | 3 |
| innbo__if__ordinary__if-innbo-super__ibo2-1__vs__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__side-swap-control | Innbo | If Super | Tryg Innbo Ekstra | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| innbo__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__vs__tryg__ordinary__tryg-innbo-ekstra__2026-07-01__same-product-control | Innbo | Tryg Innbo Ekstra | Tryg Innbo Ekstra | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__if__ordinary__if-reise-super__2026-09-20-canonical__primary | Reise | Tryg Reise Premium | If Super | PRIMARY | COMPLETED | 2 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__storebrand__ordinary__storebrand-reise-super__2026-09-20-canonical__primary | Reise | Tryg Reise Premium | Storebrand Super | PRIMARY | COMPLETED | 2 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__gjensidige__ordinary__gjensidige-reise-pluss__2026-09-20-canonical__primary | Reise | Tryg Reise Premium | Gjensidige Reise Pluss | PRIMARY | COMPLETED | 3 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__fremtind__ordinary__fremtind-reise__pre-450-200-015__primary | Reise | Tryg Reise Premium | Fremtind Reise | PRIMARY | COMPLETED | 5 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__frende__ordinary__frende-reiseforsikring__2026-03-01__primary | Reise | Tryg Reise Premium | Frende Reiseforsikring | PRIMARY | COMPLETED | 2 |
| reise__if__ordinary__if-reise-super__2026-09-20-canonical__vs__frende__ordinary__frende-reiseforsikring__2026-03-01__primary | Reise | If Super | Frende Reiseforsikring | PRIMARY | COMPLETED | 1 |
| reise__gjensidige__ordinary__gjensidige-reise__2026-09-20-canonical__vs__storebrand__ordinary__storebrand-reise-standard__2026-09-20-canonical__primary | Reise | Gjensidige Reise | Storebrand Standard | PRIMARY | COMPLETED | 2 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__tryg__ordinary__tryg-reise-ekstra__2026-09-20-canonical__primary | Reise | Tryg Reise Premium | Tryg Reise Ekstra | PRIMARY | COMPLETED | 3 |
| reise__if__ordinary__if-reise-super__2026-09-20-canonical__vs__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__side-swap-control | Reise | If Super | Tryg Reise Premium | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| reise__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__vs__tryg__ordinary__tryg-reise-premium__2026-09-20-canonical__same-product-control | Reise | Tryg Reise Premium | Tryg Reise Premium | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__primary | Snøscooter | Tryg Kasko | Gjensidige Kasko | PRIMARY | COMPLETED | 17 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary | Snøscooter | Tryg Kasko | Frende Kasko | PRIMARY | COMPLETED | 16 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__storebrand__ordinary__storebrand-snoscooter-kasko__2025-04-01__primary | Snøscooter | Tryg Kasko | Storebrand Kasko | PRIMARY | COMPLETED | 15 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__if__ordinary__if-snoscooter-kasko__2024-03__primary | Snøscooter | Tryg Kasko | If Kasko | PRIMARY | COMPLETED | 15 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__eika-fremtind__ordinary__eika-fremtind-snoscooter-kasko__2023-10-29__primary | Snøscooter | Tryg Kasko | Eika / Fremtind Kasko | PRIMARY | COMPLETED | 17 |
| snøscooter__if__ordinary__if-snoscooter-kasko__2024-03__vs__frende__ordinary__frende-snoscooter-kasko__2026-01-01__primary | Snøscooter | If Kasko | Frende Kasko | PRIMARY | COMPLETED | 8 |
| snøscooter__gjensidige__ordinary__gjensidige-snoscooter-ansvar__null__vs__storebrand__ordinary__storebrand-snoscooter-ansvar__2025-04-01__primary | Snøscooter | Gjensidige Ansvar | Storebrand Ansvar | PRIMARY | COMPLETED | 3 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-brann-og-tyveri__null__primary | Snøscooter | Tryg Kasko | Tryg Brann og tyveri | PRIMARY | COMPLETED | 21 |
| snøscooter__gjensidige__ordinary__gjensidige-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-kasko__null__side-swap-control | Snøscooter | Gjensidige Kasko | Tryg Kasko | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| snøscooter__tryg__ordinary__tryg-snoscooter-kasko__null__vs__tryg__ordinary__tryg-snoscooter-kasko__null__same-product-control | Snøscooter | Tryg Kasko | Tryg Kasko | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__gjensidige__ordinary__gjensidige-campingvogn-pluss__null__primary | Campingvogn | Tryg Campingvogn Ekstra | Gjensidige Pluss | PRIMARY | COMPLETED | 15 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__frende__ordinary__frende-campingvogn-kasko__2026-01-01__primary | Campingvogn | Tryg Campingvogn Ekstra | Frende Kasko | PRIMARY | COMPLETED | 14 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__storebrand__ordinary__storebrand-campingvogn-super__2026-03-01__primary | Campingvogn | Tryg Campingvogn Ekstra | Storebrand Super | PRIMARY | COMPLETED | 16 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__if__ordinary__if-campingvogn-kasko__2024-03__primary | Campingvogn | Tryg Campingvogn Ekstra | If Kasko | PRIMARY | COMPLETED | 15 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__eika-fremtind__ordinary__eika-fremtind-campingvogn-kasko__2024-03-21__primary | Campingvogn | Tryg Campingvogn Ekstra | Eika / Fremtind Kasko | PRIMARY | COMPLETED | 18 |
| campingvogn__if__ordinary__if-campingvogn-kasko__2024-03__vs__frende__ordinary__frende-campingvogn-kasko__2026-01-01__primary | Campingvogn | If Kasko | Frende Kasko | PRIMARY | COMPLETED | 11 |
| campingvogn__gjensidige__ordinary__gjensidige-campingvogn-delkasko__null__vs__storebrand__ordinary__storebrand-campingvogn-brann-og-tyveri__2026-03-01__primary | Campingvogn | Gjensidige Delkasko | Storebrand Brann og tyveri | PRIMARY | COMPLETED | 7 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__tryg__ordinary__tryg-campingvogn-kasko__2026-01-01__primary | Campingvogn | Tryg Campingvogn Ekstra | Tryg Kasko | PRIMARY | COMPLETED | 15 |
| campingvogn__gjensidige__ordinary__gjensidige-campingvogn-pluss__null__vs__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__side-swap-control | Campingvogn | Gjensidige Pluss | Tryg Campingvogn Ekstra | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| campingvogn__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__vs__tryg__ordinary__tryg-campingvogn-campingvogn-ekstra__2026-01-01__same-product-control | Campingvogn | Tryg Campingvogn Ekstra | Tryg Campingvogn Ekstra | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__gjensidige__ordinary__gjensidige-tilhenger-kasko__null__primary | Tilhenger | Tryg Kasko | Gjensidige Kasko | PRIMARY | COMPLETED | 10 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__frende__ordinary__frende-tilhenger-kasko__2026-01-01__primary | Tilhenger | Tryg Kasko | Frende Kasko | PRIMARY | COMPLETED | 9 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__storebrand__ordinary__storebrand-tilhenger-kasko__2026-03-01__primary | Tilhenger | Tryg Kasko | Storebrand Kasko | PRIMARY | COMPLETED | 10 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__if__ordinary__if-tilhenger-kasko__2024-03__primary | Tilhenger | Tryg Kasko | If Kasko | PRIMARY | COMPLETED | 9 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__eika-fremtind__ordinary__eika-fremtind-tilhenger-kasko__2024-03-21__primary | Tilhenger | Tryg Kasko | Eika / Fremtind Kasko | PRIMARY | COMPLETED | 12 |
| tilhenger__if__ordinary__if-tilhenger-kasko__2024-03__vs__frende__ordinary__frende-tilhenger-kasko__2026-01-01__primary | Tilhenger | If Kasko | Frende Kasko | PRIMARY | COMPLETED | 7 |
| tilhenger__gjensidige__ordinary__gjensidige-tilhenger-delkasko__null__vs__storebrand__ordinary__storebrand-tilhenger-brann-og-tyveri__2026-03-01__primary | Tilhenger | Gjensidige Delkasko | Storebrand Brann og tyveri | PRIMARY | COMPLETED | 5 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__tryg__ordinary__tryg-tilhenger-brann-og-tyveri__2026-01-01__primary | Tilhenger | Tryg Kasko | Tryg Brann og tyveri | PRIMARY | COMPLETED | 10 |
| tilhenger__gjensidige__ordinary__gjensidige-tilhenger-kasko__null__vs__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__side-swap-control | Tilhenger | Gjensidige Kasko | Tryg Kasko | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| tilhenger__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__vs__tryg__ordinary__tryg-tilhenger-kasko__2026-01-01__same-product-control | Tilhenger | Tryg Kasko | Tryg Kasko | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__if__ordinary__if-mc-kasko__2024-03__primary | MC | Tryg MC Ekstra | If Kasko | PRIMARY | COMPLETED | 5 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__gjensidige__ordinary__gjensidige-mc-kasko__null__primary | MC | Tryg MC Ekstra | Gjensidige Kasko | PRIMARY | COMPLETED | 5 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__storebrand__ordinary__storebrand-mc-kasko__motor09__primary | MC | Tryg MC Ekstra | Storebrand Kasko | PRIMARY | COMPLETED | 6 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__fremtind__ordinary-sparebank1__fremtind-mc-kasko__null__primary | MC | Tryg MC Ekstra | Fremtind Kasko | PRIMARY | COMPLETED | 6 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__frende__ordinary__frende-mc-kasko__2026-01-01__primary | MC | Tryg MC Ekstra | Frende Kasko | PRIMARY | COMPLETED | 6 |
| mc__if__ordinary__if-mc-kasko__2024-03__vs__frende__ordinary__frende-mc-kasko__2026-01-01__primary | MC | If Kasko | Frende Kasko | PRIMARY | COMPLETED | 4 |
| mc__gjensidige__ordinary__gjensidige-mc-ansvar__null__vs__storebrand__ordinary__storebrand-mc-ansvar__motor09__primary | MC | Gjensidige Ansvar | Storebrand Ansvar | PRIMARY | COMPLETED | 2 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__tryg__ordinary__tryg-mc-kasko__2026-07-01__primary | MC | Tryg MC Ekstra | Tryg Kasko | PRIMARY | COMPLETED | 6 |
| mc__if__ordinary__if-mc-kasko__2024-03__vs__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__side-swap-control | MC | If Kasko | Tryg MC Ekstra | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| mc__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__vs__tryg__ordinary__tryg-mc-mc-ekstra__2026-07-01__same-product-control | MC | Tryg MC Ekstra | Tryg MC Ekstra | SAME_PRODUCT_CONTROL | COMPLETED | 0 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__if__ordinary__if-bobil-super__2022-06__primary | Bobil | Tryg Bobil Ekstra | If Super | PRIMARY | COMPLETED | 4 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__gjensidige__ordinary__gjensidige-bobil-pluss__null__primary | Bobil | Tryg Bobil Ekstra | Gjensidige Pluss | PRIMARY | COMPLETED | 4 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__storebrand__ordinary__storebrand-bobil-super__motor09__primary | Bobil | Tryg Bobil Ekstra | Storebrand Super | PRIMARY | COMPLETED | 5 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__fremtind__ordinary-dnb__fremtind-bobil-topp__2025-09-18__primary | Bobil | Tryg Bobil Ekstra | Fremtind Topp | PRIMARY | COMPLETED | 5 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__frende__ordinary__frende-bobil-utvidet__2026-01-01__primary | Bobil | Tryg Bobil Ekstra | Frende Utvidet | PRIMARY | COMPLETED | 4 |
| bobil__if__ordinary__if-bobil-super__2022-06__vs__frende__ordinary__frende-bobil-utvidet__2026-01-01__primary | Bobil | If Super | Frende Utvidet | PRIMARY | COMPLETED | 5 |
| bobil__gjensidige__ordinary__gjensidige-bobil-ansvar__null__vs__storebrand__ordinary__storebrand-bobil-ansvar__motor09__primary | Bobil | Gjensidige Ansvar | Storebrand Ansvar | PRIMARY | COMPLETED | 2 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__tryg__ordinary__tryg-bobil-kasko__2026-01-01__primary | Bobil | Tryg Bobil Ekstra | Tryg Kasko | PRIMARY | COMPLETED | 3 |
| bobil__if__ordinary__if-bobil-super__2022-06__vs__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__side-swap-control | Bobil | If Super | Tryg Bobil Ekstra | SIDE_SWAP_CONTROL | COMPLETED | 0 |
| bobil__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__vs__tryg__ordinary__tryg-bobil-bobil-ekstra__2026-07-01__same-product-control | Bobil | Tryg Bobil Ekstra | Tryg Bobil Ekstra | SAME_PRODUCT_CONTROL | COMPLETED | 0 |

## Limitations

- Auditflagg er review candidates, ikke bekreftede forsikringsfeil.
- Ingen ekstern kildeverifisering ble utført.
- Matrisen er et deterministisk utvalg, ikke alle eligible produkter parvis.
- Antall funn sier ikke noe om leverandør- eller produktkvalitet.
- Resultatene gjelder gjeldende lokale HEAD; arbeidskopien var ren ved start.
- React SSR ble brukt som representativ UI-krysskontroll; ingen visuell nettleserinspeksjon av alle comparisons.

Auditen vurderer programvarerepresentasjonen. Den sertifiserer ikke fullstendig juridisk dekningsfortolkning. De 162 eligible produktene er heller ikke alle mulige norske forsikringsprodukter.

## Next analysis input

Bruk `root-cause-input.json` sammen med denne rapporten i en separat GPT-6 root-cause- og correctness-oppgave. Neste oppgave bør først kontrollere dedupliserte signaturer mot kode og katalogkilder, og deretter avgjøre hvilke representative funn som trenger regresjonstester. Denne auditen gjør ingen rettelser.
