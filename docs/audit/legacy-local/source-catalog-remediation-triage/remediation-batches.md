# Endelige remediation-batcher

205 avgrensede operasjoner, ikke 205 påviste motorfeil. De 56 tidligere forslagene blandet provider/type/scope, bekreftede feil, usikre kilder og uavklart nøkkelvalg. Planen beholder én forfatterpakke per provider/type/scope og separat readiness-gate; den splitter ikke etter hvert enkelt produktnivå eller hver forekomst. 113 operasjonelle rotårsaksområder gjenbrukes på tvers av de 205 batchene.

En IMPLEMENTATION_READY-batch har tilstrekkelig kildegrunnlag for sine oppførte dimensjoner. Den er ikke allerede implementert, testet eller autorisert. En CANONICAL_REVIEW_FIRST-batch betyr at nøkkelplasseringen ikke er besluttet; den beviser ikke behov for en ny schema-dimensjon.

Eksakt produkt-/komponent-/versjon-/kildemetadata og alle signaturer finnes per batch i triage.json. Henvisninger til auditdata er uforanderlige.

## B-001 · Avgrens Gjensidige MC ferie-leie til dokumenterte nivåer

**PURPOSE:** Fjern de tre ubetingede ferie-leie-påstandene fra Delkasko. Bevar Kasko-støtten. Fravær av støtte skal ikke omskrives til eksplisitt ikke-dekket.

**EVIDENCE:** GAP-2361 / SF-3395: catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf — PDF3–4; complete IPID/product package. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-001].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer MC; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","mc","ordinary","gjensidige-mc-delkasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-101, fra SCRC-031. Lag: SCOPE.

**WHAT MUST CHANGE:** Fjern de tre ubetingede ferie-leie-påstandene fra Delkasko. Bevar Kasko-støtten. Fravær av støtte skal ikke omskrives til eksplisitt ikke-dekket.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Delkasko får ikke Kasko-regelen; Kasko beholder sin 15-dagersregel og ordinær redning.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-002 · Fjern kunstnerisk utsmykning fra Fremtind Hus Standard

**PURPOSE:** Modeller Standards uttrykkelige unntak; bevar Topps dokumenterte dekning.

**EVIDENCE:** GAP-5106 / SF-7311: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Topp§1.1s1;Standard§3.1s3. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-002].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Hus; scope ordinary. 1 eksakte produktidentiteter: ["fremtind","bolig","ordinary","fremtind-hus-standard","PBK-200.100-015+PBK-200.200-010"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-095, fra SCRC-053. Lag: SCOPE.

**WHAT MUST CHANGE:** Modeller Standards uttrykkelige unntak; bevar Topps dokumenterte dekning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard negativ og Topp positiv med egne kilder; ingen endring av kundedokument.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-003 · Korriger If Båt aldersgrener for motor/gir-egenandel

**PURPOSE:** Representer kildens faste og prosentbaserte aldersgrener i eksisterende egenandelsfaktum uten universell minstegrense.

**EVIDENCE:** GAP-3706 / SF-5313: catalog/sources/boat-pet/if-boat-terms.pdf — 6 §4.9.5. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-003].evidence`.

**AFFECTED SCOPE:** Providers if; typer Båt; scope ordinary. 2 eksakte produktidentiteter: ["if","båt","ordinary","if-bat-kasko","2023-02-01"]; ["if","båt","ordinary","if-bat-super","2023-02-01"]. Tilleggskomponenter: if-bat-motor-gir.

**ROOT CAUSE:** RC-097, fra SCRC-041. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Representer kildens faste og prosentbaserte aldersgrener i eksisterende egenandelsfaktum uten universell minstegrense.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; 4 000 til og med fem år; eldre grener beholder egne terskler; valgfri status bevares.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-004 · Korriger If Reise sykdoms- og ulykkesutløser

**PURPOSE:** Fjern ubegrunnet alvorlighetskrav for ulykkesskade. Skill samtidig Basis fra sikkerhetsforskrifter som bare gjelder Standard/Super.

**EVIDENCE:** GAP-3553 / SF-5085: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 13 pkt5.1; GAP-5714 / SF-8104: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 2 nivåtabell;8 §3;11 §4.4. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-004].evidence`.

**AFFECTED SCOPE:** Providers if; typer Reise; scope ordinary. 3 eksakte produktidentiteter: ["if","reise","ordinary","if-reise-basis","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-standard","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-super","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-099, fra SCRC-040. Lag: SCOPE.

**WHAT MUST CHANGE:** Fjern ubegrunnet alvorlighetskrav for ulykkesskade. Skill samtidig Basis fra sikkerhetsforskrifter som bare gjelder Standard/Super.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Akutt sykdomsregel og kjent sykdomsforbehold bevares. Basis får ikke nye bagasje-/forsinkelsesdekninger.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 3 forekomster; 1 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-005 · Fjern udokumentert gjenstandsgrense i Storebrand Innbo Super

**PURPOSE:** Erstatt den udokumenterte 50 000-grensen med kildekorrekt henvisning til avtalt sum og relevant hendelsesbetinget særregel; ikke innfør ny ubetinget tallgrense.

**EVIDENCE:** GAP-0931 / SF-1432: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 20, C.1.5. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-005].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["storebrand","innbo","ordinary","sb-innbo-super","innbo09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-102, fra SCRC-013. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Erstatt den udokumenterte 50 000-grensen med kildekorrekt henvisning til avtalt sum og relevant hendelsesbetinget særregel; ikke innfør ny ubetinget tallgrense.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Flytting bevares; C.1.2s hendelsesbetingede regel må ikke bli universell grense; Standard endres ikke.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-006 · Korriger Frende Bil parkeringsbonusvilkår

**PURPOSE:** Fjern påstått alders- og politivilkår uten kildestøtte; behold de dokumenterte parkering-, tids- og ukjent-kjøretøyvilkårene.

**EVIDENCE:** GAP-1401 / SF-2052: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF10punkt11.13.3. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-006].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Bil; scope ordinary. 2 eksakte produktidentiteter: ["frende","bil","ordinary","frende-bil-kasko","2026-01-01"]; ["frende","bil","ordinary","frende-bil-utvidet","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-104, fra SCRC-017. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Fjern påstått alders- og politivilkår uten kildestøtte; behold de dokumenterte parkering-, tids- og ukjent-kjøretøyvilkårene.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kasko/Utvidet samme dokumenterte bonusregel; MC arver ikke Bil-regel; kundens bonus endres ikke.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-007 · Avgrens Gjensidige Hus rørservice til dokumentert tining

**PURPOSE:** Fjern tilleggspåstanden om oppspyling; behold dokumentert tining med egen kilde.

**EVIDENCE:** GAP-2132 / SF-3062: catalog/sources/gjensidige/hus/Husforsikring-produktside.html — HTML Brann-, vann- og naturskader. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-007].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","bolig","ordinary","gjensidige-hus","Alminnelige vilkår"]; ["gjensidige","bolig","ordinary","gjensidige-hus-pluss","Alminnelige vilkår"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-105, fra SCRC-026. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Fjern tilleggspåstanden om oppspyling; behold dokumentert tining med egen kilde.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Begge Hus-nivåer beholder tining. Ingen negativ påstand om oppspyling uten kilde.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-008 · Gjenopprett Storebrand Båt Super opplagsutstyr

**PURPOSE:** Bevar Kaskos dokumenterte opplagsutstyr i Super og egen grense. Endre eksakt produktkomposisjon, ikke alle boatCore-nivåer.

**EVIDENCE:** GAP-0085 / SF-0128: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 9, 5.2 Dekningstabell. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-008].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Båt; scope ordinary. 1 eksakte produktidentiteter: ["storebrand","båt","ordinary","storebrand-bat-super","2024-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-089, fra SCRC-003. Lag: INHERITANCE.

**WHAT MUST CHANGE:** Bevar Kaskos dokumenterte opplagsutstyr i Super og egen grense. Endre eksakt produktkomposisjon, ikke alle boatCore-nivåer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Delkasko beholder sin dokumenterte scope; Super/Kasko matcher på denne deldekningen uten at alle øvrige ytelser arves.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-009 · Korriger Fremtind Hund base/Topp for allergi og diagnostikk

**PURPOSE:** Gjenopprett dokumentert basisallergi og årlig MR/CT-sublimit, med Topps dokumenterte utvidelse som valgfri.

**EVIDENCE:** GAP-5582 / SF-7925: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1; GAP-5584 / SF-7927: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-009].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-090, fra SCRC-059. Lag: ADDON.

**WHAT MUST CHANGE:** Gjenopprett dokumentert basisallergi og årlig MR/CT-sublimit, med Topps dokumenterte utvidelse som valgfri.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Livstidsgrense skilles fra årsgrense og valgt veterinærsum. Katt og kundevalgt Topp bevares.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-010 · Bevar Fremtind Hund rasegrupper ved livsfradrag

**PURPOSE:** Ta inn den manglende niårsgruppen, gulv og hovedforfallsvilkår uten å velge side i den separate web-/fullvilkårskonflikten.

**EVIDENCE:** GAP-5601 / SF-7944: catalog/sources/boat-pet/fremtind-dog-life-terms.pdf — Død/tap s1tabeller. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-010].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: sparebank1-fremtind-hund-liv.

**ROOT CAUSE:** RC-091, fra SCRC-059. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Ta inn den manglende niårsgruppen, gulv og hovedforfallsvilkår uten å velge side i den separate web-/fullvilkårskonflikten.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rasegruppe, reduksjonsstart og opphør forblir ulike dimensjoner. Eksakt grensedato krever separat kildeavklaring.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-011 · Korriger Tryg Innbo Ekstras arv av fellesbodgrense

**PURPOSE:** La Ekstras egne sted-/gjenstandsregler erstatte den feilaktig arvede grunnnivågrensen. Bevar skillet privat bod/fellesadkomst/ekstern bod/andre steder.

**EVIDENCE:** GAP-4431 / SF-6299: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s3–4 §2.4; Ekstra s3–4; exact Ekstra clause controls. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-011].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-092, fra SCRC-048. Lag: INHERITANCE.

**WHAT MUST CHANGE:** La Ekstras egne sted-/gjenstandsregler erstatte den feilaktig arvede grunnnivågrensen. Bevar skillet privat bod/fellesadkomst/ekstern bod/andre steder.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Vanlig Innbo beholder egne grenser. Ingen erstatning av alle bodbegreper med én grense.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-012 · Knytt Gjensidige Bobil skadedyr til Kasko

**PURPOSE:** La Kasko få den uttrykkelig dokumenterte dekningen og dens egne vilkår; Pluss beholder den.

**EVIDENCE:** GAP-2487 / SF-3551: catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf — PDF3; own product HTML160 confirms. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-012].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bobil; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","bobil","ordinary","gjensidige-bobil-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-094, fra SCRC-032. Lag: INHERITANCE.

**WHAT MUST CHANGE:** La Kasko få den uttrykkelig dokumenterte dekningen og dens egne vilkår; Pluss beholder den.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Delkasko får ikke skadedyr. Kilde, parent/detail og sidebytte kontrolleres.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-013 · Korriger Storebrand Hus aldersfradragets materialomfang

**PURPOSE:** Bevar satser men avgrens rør til dokumentert materiale. Ta den nærliggende P2-badeinnretningslabelen med i samme tabellrevisjon.

**EVIDENCE:** GAP-0976 / SF-1502: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 29, B.6.4.11; GAP-5699 / SF-8060: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — B.6.4.11 fysisk s29. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-013].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","bolig","ordinary","storebrand-hus-standard","2025-08-15"]; ["storebrand","bolig","ordinary","storebrand-hus-super","2025-08-15"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-096, fra SCRC-014. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Bevar satser men avgrens rør til dokumentert materiale. Ta den nærliggende P2-badeinnretningslabelen med i samme tabellrevisjon.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Plastrør og andre rør skilles; badeinnretningens elektriske delvilkår utvides ikke til hele kategorien.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 2 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-014 · Korriger Gjensidige Innbo geografi, sted og egenandel

**PURPOSE:** Korriger de seks avgrensede kilde-/scopefeilene i eksisterende facts. Hver regel beholder egen hendelse, sted, nivå og proveniens.

**EVIDENCE:** GAP-1986 / SF-2860: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3; GAP-2030 / SF-2915: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 3; GAP-2017 / SF-2897: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 1,6–7; GAP-2070 / SF-2967: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 1,8–9; GAP-2077 / SF-2975: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 4–5. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-014].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","innbo","ordinary","gj-innbo",null]; ["gjensidige","innbo","ordinary","gj-innbo-pluss",null]. Tilleggskomponenter: gj-innbo-utleie.

**ROOT CAUSE:** RC-100, fra SCRC-024. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Korriger de seks avgrensede kilde-/scopefeilene i eksisterende facts. Hver regel beholder egen hendelse, sted, nivå og proveniens.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Europa privatansvar, verdensomspennende sykkeluhell, fellesbod og misligholdt husleie må ikke blandes.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-015 · Skill Tryg Innbo flyttetyveri fra generell transportskade

**PURPOSE:** Knytt den dokumenterte regelen til tyveri/skadeverk under flytting. Velg eksisterende eksakt hendelsesnøkkel eller avgrenset provider-detalj.

**EVIDENCE:** GAP-4435 / SF-6305: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s3–4 §2.4. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-015].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-103, fra SCRC-048. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Knytt den dokumenterte regelen til tyveri/skadeverk under flytting. Velg eksisterende eksakt hendelsesnøkkel eller avgrenset provider-detalj.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Privat flytting og generell transportskade må ikke få den profesjonelle flyttingens tyverigrense.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-254.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-016 · Korriger Gjensidige Reise Pluss enkeltgjenstands-overstyring

**PURPOSE:** Legg dokumentert Pluss-overstyring på eksisterende bagasje.per_gjenstand. Bevar korrekt totalgrense og Standard.

**EVIDENCE:** GAP-2256 / SF-3252: catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf — PDF 1,6. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-016].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","reise","ordinary","gjensidige-reise-pluss","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-106, fra SCRC-029. Lag: INHERITANCE.

**WHAT MUST CHANGE:** Legg dokumentert Pluss-overstyring på eksisterende bagasje.per_gjenstand. Bevar korrekt totalgrense og Standard.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; TRIVIAL_DATA; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard 20 000; Pluss 40 000; totalgrense og kundeavtalt dokumentverdi uendret.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.

## B-017 · Skill Fremtind Reise avgang, innhenting og transittutgift

**PURPOSE:** Skill den dokumenterte avgangsregelen fra fremmøte/innhenting; behold 24-timersvilkåret og klær/toalett under riktig hendelse.

**EVIDENCE:** GAP-5157 / SF-7385: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §8.2 s5–6. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-017].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["fremtind","reise","ordinary","fremtind-reise","PRE-450.200-015"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-107, fra SCRC-054. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Skill den dokumenterte avgangsregelen fra fremmøte/innhenting; behold 24-timersvilkåret og klær/toalett under riktig hendelse.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kundeutgifter og produktmaks holdes ulike; ikke importer historisk Eika.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-382.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-018 · Samle dokumentert brukstap under Frende Hund Tap

**PURPOSE:** Knytt brukstapsfakta til den kildebestemte Tap-komponenten. Unngå en selvstendig valgmulighet som dokumentasjonen ikke støtter.

**EVIDENCE:** GAP-1284 / SF-1902: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside3–4 punkt7/8.4. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-018].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["frende","hund","ordinary","frende-hund-veterin-r","2026-01-01"]. Tilleggskomponenter: frende-hund-bruksverdi.

**ROOT CAUSE:** RC-108, fra SCRC-016. Lag: ADDON.

**WHAT MUST CHANGE:** Knytt brukstapsfakta til den kildebestemte Tap-komponenten. Unngå en selvstendig valgmulighet som dokumentasjonen ikke støtter.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tap alene får riktig deldekning; separat Bruksverdi kan ikke skape udokumentert produkt; kundens Tap-valg må ikke antas.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-162.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-019 · Representer Storebrand Reise dagstur på korrekt overnattingsdimensjon

**PURPOSE:** Bruk eksplisitt kildebundet reise.overnatting for generell reisedefinisjon. Ingen UI- eller runtime-utledning fra geografitekst. Avklar at Trygs sammensatte ordlyd ikke overfører tjenestereise.

**EVIDENCE:** GAP-1642 / SF-2412: catalog/sources/storebrand/reise/canonical/Reiseforsikring-produktside.html — HTMLFAQ Når gjelder reiseforsikringen?. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-019].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-109, fra SCRC-020. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Bruk eksplisitt kildebundet reise.overnatting for generell reisedefinisjon. Ingen UI- eller runtime-utledning fra geografitekst. Avklar at Trygs sammensatte ordlyd ikke overfører tjenestereise.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard versus Tryg Ekstra/Premium begge veier; avbestilling/leiebil beholder egne overnattingskrav.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-394.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-020 · Bevar Gjensidige Hus gnagerfakta ved råte-/insektutvidelse

**PURPOSE:** Avgrens komponentenes semantiske identiteter slik at insektutvidelse ikke erstatter gjeldende gnagerskade/bekjempelse. Vurder lokale fakta først, ikke global endring av replacesBase.

**EVIDENCE:** GAP-2134 / SF-3064: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF3; GAP-2147 / SF-3082: catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf — PDF 3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-020].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","bolig","ordinary","gjensidige-hus","Alminnelige vilkår"]; ["gjensidige","bolig","ordinary","gjensidige-hus-pluss","Alminnelige vilkår"]. Tilleggskomponenter: gjensidige-hus-rate-insekter.

**ROOT CAUSE:** RC-110, fra SCRC-027. Lag: INHERITANCE.

**WHAT MUST CHANGE:** Avgrens komponentenes semantiske identiteter slik at insektutvidelse ikke erstatter gjeldende gnagerskade/bekjempelse. Vurder lokale fakta først, ikke global endring av replacesBase.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard med/uten tillegg og Pluss beholder mus/rotter, lukt/isolasjon samt egne insektvilkår.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-230, CR-231.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-021 · Skill Storebrand forsinket avgang fra fremmøte

**PURPOSE:** Skill ytelsene før tallkorrigering: avgang med transportørens 24-timersgren er ikke samme hendelse som forsinket fremmøte.

**EVIDENCE:** GAP-1057 / SF-1627: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 8,9, B.3.1.2. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-021].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-111, fra SCRC-015. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Skill ytelsene før tallkorrigering: avgang med transportørens 24-timersgren er ikke samme hendelse som forsinket fremmøte.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; 1 500/20 000-grenene må ikke kryssmates; Standard/Super og hotellskillene bevares.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-381.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-022 · Avklar Gjensidige Bruk som avhengig tillegg til Liv

**PURPOSE:** Avklar minste eksplisitte avhengighetsrepresentasjon. Dagens requiresLevel gjelder hovedprodukt, ikke valgt annet tillegg. Katt Bruk må ha egen artsnøkkel/proveniens.

**EVIDENCE:** GAP-2900 / SF-4052: catalog/sources/boat-pet/gjensidige-dog-product.html — Liv/Bruk; GAP-2936 / SF-4091: catalog/sources/boat-pet/gjensidige-cat-product.html — Liv/Bruk. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-022].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hund, Katt; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]; ["gjensidige","katt","ordinary","gjensidige-katt-behandling",null]. Tilleggskomponenter: gjensidige-hund-bruk.

**ROOT CAUSE:** RC-112, fra SCRC-035. Lag: ADDON.

**WHAT MUST CHANGE:** Avklar minste eksplisitte avhengighetsrepresentasjon. Dagens requiresLevel gjelder hovedprodukt, ikke valgt annet tillegg. Katt Bruk må ha egen artsnøkkel/proveniens.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts), [lib/product-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts), [lib/manual-product-selection.ts](/Users/morten/Documents/forsikringsapp/lib/manual-product-selection.ts), [lib/catalog-enrichment.ts](/Users/morten/Documents/forsikringsapp/lib/catalog-enrichment.ts), [lib/catalog-product-comparison.ts](/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Bruk uten Liv avvises eller vises avhengig uten å velge Liv automatisk; Hund/Katt forblir isolert.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-160, CR-292.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-023 · Materialiser Fremtind MC ordinær nyverdi

**PURPOSE:** Bruk MC-spesifikk Minikasko-regel og Kaskos henvisning med alder, km, skadegrad, eierskap og tidligere skade. Ingen overføring til Snøscooter eller annen kanal.

**EVIDENCE:** GAP-0131 / SF-0243: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — PDF side 6, Minikasko3.3.1;Kasko8/2 viser til Mini3; GAP-5351 / SF-7623: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — Mini§3.3.1s6MC. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-023].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer MC; scope ordinary-sparebank1. 2 eksakte produktidentiteter: ["fremtind","mc","ordinary-sparebank1","fremtind-mc-delkasko",null]; ["fremtind","mc","ordinary-sparebank1","fremtind-mc-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-093, fra SCRC-006, SCRC-056. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Bruk MC-spesifikk Minikasko-regel og Kaskos henvisning med alder, km, skadegrad, eierskap og tidligere skade. Ingen overføring til Snøscooter eller annen kanal.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Mini/Kasko får bare den MC-spesifikke regelen; dokumentets nyverdi og kjørelengde overstyrer ikke hverandre.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-024 · Materialiser If Campingvogn Supers dokumenterte ytelser

**PURPOSE:** Utvid bare Super med SV707s dokumenterte fukt-, ferie-, løsøre-, skadedyr- og nyverdiregler. Supergaranti med manglende fullvilkår holdes utenfor.

**EVIDENCE:** GAP-3288 / SF-4631: catalog/sources/mc-bobil/if-SV707.pdf — 2 pkt3.3.1; GAP-3289 / SF-4632: catalog/sources/mc-bobil/if-SV707.pdf — 2 pkt3.3.1; GAP-3290 / SF-4633: catalog/sources/mc-bobil/if-SV707.pdf — 3 pkt3.3.1; GAP-3291 / SF-4634: catalog/sources/mc-bobil/if-SV707.pdf — 3 pkt3.3.1; GAP-3292 / SF-4635: catalog/sources/mc-bobil/if-SV707.pdf — 3 pkt3.3.2. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-024].evidence`.

**AFFECTED SCOPE:** Providers if; typer Campingvogn; scope ordinary. 1 eksakte produktidentiteter: ["if","campingvogn","ordinary","if-campingvogn-super","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-098, fra SCRC-037. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utvid bare Super med SV707s dokumenterte fukt-, ferie-, løsøre-, skadedyr- og nyverdiregler. Supergaranti med manglende fullvilkår holdes utenfor.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kasko/Delkasko får ikke Superytelser; fuktkontroll, alder og kildehenvisning må følge ytelsen.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-025 · eika-fremtind · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5300 / SF-7559: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§2.3/3.5.1/4.2s2–4; GAP-5301 / SF-7560: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§2.4/4.3s2/4; GAP-5321 / SF-7581: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Kasko§1.3s5. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-025].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-kasko","2024-03-21"]; ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-minikasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-001, fra SCRC-056. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Glass / limits (GAP-5300); Redning / scope (GAP-5301); Fukt / conditions (GAP-5321)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 5 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-026 · eika-fremtind · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5265 / SF-7515: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — FF003s8–10snø/s9–11MC; GAP-5274 / SF-7526: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — PMO357.110§1s3–4snø/s4–5MC; GAP-5297 / SF-7555: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — Kasko§3s7–8snø/s8–9MC. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-026].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-ansvar","2023-10-29"]; ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-kasko","2023-10-29"]; ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-minikasko","2023-10-29"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-002, fra SCRC-056. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / limits (GAP-5265); Minikasko / object (GAP-5274); Kasko / deductible (GAP-5297)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-027 · eika-fremtind · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5324 / SF-7586: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§2.4/4.3s2/4. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-027].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Tilhenger; scope ordinary. 1 eksakte produktidentiteter: ["eika-fremtind","tilhenger","ordinary","eika-fremtind-tilhenger-kasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-003, fra SCRC-056. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Redning / scope (GAP-5324)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-028 · fremtind · Bobil · ordinary-dnb: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0133 / SF-0251: catalog/sources/mc-bobil/fremtind-bobil-topp.pdf — PDF side 10, Toppkasko3.1; GAP-5384 / SF-7667: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s4–5§4–5; GAP-5405 / SF-7696: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5§2.4.2; GAP-5407 / SF-7698: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s6§3.2.2; GAP-5433 / SF-7731: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5§2.4.2. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-028].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Bobil; scope ordinary-dnb. 4 eksakte produktidentiteter: ["fremtind","bobil","ordinary-dnb","fremtind-bobil-ansvar","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-kasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-minikasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-topp","2025-09-18"]. Tilleggskomponenter: fremtind-bobil-maskinskade.

**ROOT CAUSE:** RC-004, fra SCRC-006, SCRC-057. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Startleie / oppgjørsmodell (GAP-0133); Rettshjelp / sums (GAP-5384); Feilfylling / emptying (GAP-5405); Leasing / start_rent (GAP-5407); Feilfylling / emptying (GAP-5433); Leasing / start_rent (GAP-5435); Kasko / deductible (GAP-5442); Maskinskade / components (GAP-5444)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 14 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-029 · fremtind · Hus · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5074 / SF-7265: catalog/sources/fremtind/hus/canonical/IPID_Hus.pdf — IPID s1; GAP-5076 / SF-7268: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Standard §3.1 s3;Topp §1 s1; GAP-5079 / SF-7272: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Standard §3.4 s3;§5.5.3 s7; GAP-5084 / SF-7277: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Standard §4.4 s4; GAP-5085 / SF-7278: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Standard §4.5 s4;Natur s12–13. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-029].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["fremtind","bolig","ordinary","fremtind-hus-standard","PBK-200.100-015+PBK-200.200-010"]; ["fremtind","bolig","ordinary","fremtind-hus-topp","PBK-200.100-015+PBK-200.200-010"]. Tilleggskomponenter: fremtind-hus-rate-insekter.

**ROOT CAUSE:** RC-005, fra SCRC-053. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Bygning / eligibility (GAP-5074); Bygning / scope (GAP-5076); Riving/rydding / limits (GAP-5079); Annen skade / scope (GAP-5084); Natur / extension (GAP-5085); Fullverdi / conditions (GAP-5087); Boligkjøp etter totalskade / limits (GAP-5088); Aldersfradrag / table (GAP-5090); Naturskade / limits (GAP-5099); Råte/sopp / exclusions (GAP-5100); Egenandel / choice (GAP-5104); Dyr/skadedyr / scope (GAP-5134); Håndverker våtrom / conditions (GAP-5135)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-002.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 24 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-030 · fremtind · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5003 / SF-7179: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — §3.1s1;IPIDs1; GAP-5035 / SF-7217: catalog/sources/fremtind/innbo/canonical/Vilkar_Topp_Innbo.pdf — §3.1s1;IPIDs1; GAP-5004 / SF-7183: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — §3.1.1s2; GAP-5036 / SF-7221: catalog/sources/fremtind/innbo/canonical/Vilkar_Topp_Innbo.pdf — §3.1.1s2; GAP-5007 / SF-7186: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — §3.1.2s2. Alle 19 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-030].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["fremtind","innbo","ordinary","fremtind-innbo-standard","2025-01-01"]; ["fremtind","innbo","ordinary","fremtind-innbo-topp","2025-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-006, fra SCRC-052. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Objektgrenser / valuables (GAP-5003); Ting / small_objects (GAP-5004); Leid/sameid bolig / fixtures (GAP-5007); Glass/porcelain / scope (GAP-5013); Vind/snø / coverage (GAP-5014); Egenandel / prevention (GAP-5024); Egenandel / special (GAP-5025); Ansvar / special_objects (GAP-5028); Vann / ingress (GAP-5045); Flytting / exclusions (GAP-5054); Uhell / excluded_objects (GAP-5056); Uhell / excluded_causes (GAP-5057)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 19 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-031 · fremtind · MC · ordinary-sparebank1: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5334 / SF-7599: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — FF003s8–10snø/s9–11MC; GAP-5350 / SF-7622: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — Mini§2.4.1s5–6MC; GAP-5367 / SF-7647: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — Kasko§3s7–8snø/s8–9MC. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-031].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer MC; scope ordinary-sparebank1. 3 eksakte produktidentiteter: ["fremtind","mc","ordinary-sparebank1","fremtind-mc-ansvar",null]; ["fremtind","mc","ordinary-sparebank1","fremtind-mc-delkasko",null]; ["fremtind","mc","ordinary-sparebank1","fremtind-mc-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-007, fra SCRC-056. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / limits (GAP-5334); Personreise / limits (GAP-5350); Kasko / deductible (GAP-5367)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-023.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-032 · fremtind · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5144 / SF-7365: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §1 s1; GAP-5145 / SF-7369: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §2 s1; GAP-5150 / SF-7374: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §7.1 s3; GAP-5159 / SF-7389: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §10.1 s6–7; GAP-5169 / SF-7401: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §11.1 s9. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-032].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["fremtind","reise","ordinary","fremtind-reise","PRE-450.200-015"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-008, fra SCRC-054. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / eligibility (GAP-5144); Geografi / exclusions (GAP-5145); Reisegods / valuables (GAP-5150); Medisinsk / exclusions (GAP-5159); Ulykke / sports (GAP-5169); Avbestilling / triggers (GAP-5173)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-017.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-033 · fremtind-four-bil-ids · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4548 / SF-6583: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s2–3FMO002; GAP-4551 / SF-6587: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s4–5§4–5; GAP-4568 / SF-6609: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s4§1.3; GAP-4569 / SF-6611: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s4§2.2; GAP-4570 / SF-6612: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s4§2.3;s6§3.5. Alle 49 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-033].evidence`.

**AFFECTED SCOPE:** Providers dnb-fremtind, eika-fremtind, fremtind, sparebank1-fremtind; typer Bil; scope ordinary. 16 eksakte produktidentiteter: ["dnb-fremtind","bil","ordinary","dnb-bil-ansvar","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-delkasko","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-kasko","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-topp","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-ansvar","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-delkasko","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-kasko","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-topp","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-ansvar","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-delkasko","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-kasko","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-topp","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-ansvar","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-delkasko","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-kasko","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-toppkasko","PMO-357.001-004"]. Tilleggskomponenter: dnb-maskinskade; eika-maskinskade; fremtind-maskinskade; fremtind-sb1-maskinskade; sb1-maskinskade.

**ROOT CAUSE:** RC-009, fra SCRC-051. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Førerpassasjer / scope (GAP-4548); Rettshjelp / sums (GAP-4551); Personlige eiendeler / sum_exclusions (GAP-4568); Tyveri/hærverk / trigger (GAP-4569); Glass / scope (GAP-4570); Redning / persons (GAP-4571); Leasing / start_rent (GAP-4576); Reparasjon / guarantee (GAP-4577); Tyveri / waiting_key (GAP-4579); Kasko / exclusions (GAP-4611); Maskinskade / components (GAP-4612); Leasing / expanded (GAP-4648); Førerpassasjer / scope (GAP-4661); Rettshjelp / sums (GAP-4664); Personlige eiendeler / sum_exclusions (GAP-4681); Tyveri/hærverk / trigger (GAP-4682); Glass / scope (GAP-4683); Redning / persons (GAP-4684); Leasing / start_rent (GAP-4689); Reparasjon / guarantee (GAP-4690); Tyveri / waiting_key (GAP-4692); Kasko / exclusions (GAP-4724); Maskinskade / components (GAP-4725); Leasing / expanded (GAP-4761); Førerpassasjer / scope (GAP-4774); Rettshjelp / sums (GAP-4777); Personlige eiendeler / sum_exclusions (GAP-4794); Tyveri/hærverk / trigger (GAP-4795); Glass / scope (GAP-4796); Redning / persons (GAP-4797); Leasing / start_rent (GAP-4802); Reparasjon / guarantee (GAP-4803); Tyveri / waiting_key (GAP-4805); Kasko / exclusions (GAP-4837); Maskinskade / components (GAP-4838); Leasing / expanded (GAP-4874); Førerpassasjer / scope (GAP-4887); Rettshjelp / sums (GAP-4890); Personlige eiendeler / sum_exclusions (GAP-4907); Tyveri/hærverk / trigger (GAP-4908); Glass / scope (GAP-4909); Redning / persons (GAP-4910); Leasing / start_rent (GAP-4915); Reparasjon / guarantee (GAP-4916); Tyveri / waiting_key (GAP-4918); Kasko / exclusions (GAP-4950); Maskinskade / components (GAP-4951); Leasing / expanded (GAP-4991)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 48 P1-signaturer / 134 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-034 · frende · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1304 / SF-1927: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside2punkt2; GAP-1309 / SF-1933: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10punkt11.13; GAP-1311 / SF-1936: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10,11punkt12.3; GAP-1313 / SF-1938: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11punkt13.1; GAP-1314 / SF-1939: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11,12punkt14.1. Alle 20 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-034].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["frende","bil","ordinary","frende-bil-ansvar","2026-01-01"]; ["frende","bil","ordinary","frende-bil-delkasko","2026-01-01"]; ["frende","bil","ordinary","frende-bil-kasko","2026-01-01"]; ["frende","bil","ordinary","frende-bil-utvidet","2026-01-01"]. Tilleggskomponenter: frende-leiebil; frende-maskinskade.

**ROOT CAUSE:** RC-010, fra SCRC-017. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / omfang (GAP-1304); Bonus / fritak (GAP-1309); Ulykke / invaliditet (GAP-1311); Ansvar / utenombilansvar (GAP-1313); Rettshjelp / scope (GAP-1314); Rettshjelp / utgifter/unntak (GAP-1315); Rettshjelp / sum (GAP-1316); Ekstrautstyr / sum (GAP-1328); Brann / hendelser/unntak (GAP-1330); Tyveri / hendelser/unntak (GAP-1331); Veihjelp / hendelser/sted (GAP-1332); Egenandel / brann/tyveri (GAP-1338); Bonus / fritak (GAP-1343); Bilnøkkel / basis (GAP-1369); Nyverdi / basisgrense (GAP-1370); Leiebil / valgfri/klasse (GAP-1372); Maskinskade / tilgjengelighet (GAP-1373); Maskinskade / komponenter (GAP-1374); Maskinskade / unntak (GAP-1375); Egenandel / brann/tyveri (GAP-1381)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-006.

**EXPECTED LEVERAGE:** 20 P1-signaturer / 53 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-035 · frende · Bobil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1525 / SF-2240: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF6punkt9.3; GAP-1526 / SF-2241: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF5–6punkt9.1–9.3; GAP-1530 / SF-2251: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF4–5punkt8.3; GAP-1531 / SF-2252: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF5punkt8.6; GAP-1537 / SF-2262: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10punkt11.13. Alle 19 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-035].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["frende","bobil","ordinary","frende-bobil-ansvar","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-delkasko","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-kasko","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-utvidet","2026-01-01"]. Tilleggskomponenter: frende-bobil-maskinskade.

**ROOT CAUSE:** RC-011, fra SCRC-019. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Maskinskade / garantiunntak (GAP-1525); Maskinskade / komponentscope (GAP-1526); Ladekabel / Utvidetdekning (GAP-1530); Leasing / startleie (GAP-1531); Bonus / fritak (GAP-1537); Ulykke / scope (GAP-1538); Ulykke / invaliditet (GAP-1539); Ansvar / utenombilansvar (GAP-1541); Rettshjelp / scope (GAP-1542); Rettshjelp / utgifter/unntak (GAP-1543); Rettshjelp / sum (GAP-1544); Brann / hendelser/unntak (GAP-1553); Tyveri / hendelser/unntak (GAP-1554); Veihjelp / hendelser/sted (GAP-1555); Hjemtransport / personer (GAP-1556); Hjemtransport / kjøretøy (GAP-1557); Bilnøkkel / basis (GAP-1586); Nyverdi / basisgrense (GAP-1587); Kasko / unntak (GAP-1588)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 19 P1-signaturer / 53 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-036 · frende · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1156 / SF-1751: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 2, punkt 2; GAP-1157 / SF-1753: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 2, punkt 3.2; GAP-1159 / SF-1756: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 3, punkt 4.1–2; GAP-1160 / SF-1757: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 3, punkt 4; GAP-1161 / SF-1758: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 3, punkt 4.1.4. Alle 27 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-036].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["frende","båt","ordinary","frende-bat-brann-og-tyveri","2026-01-01"]; ["frende","båt","ordinary","frende-bat-kasko","2026-01-01"]; ["frende","båt","ordinary","frende-bat-utvidet","2026-01-01"]. Tilleggskomponenter: frende-bat-maskinskade; frende-bat-ulykke.

**ROOT CAUSE:** RC-012, fra SCRC-003. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fartsområde / grunn/utvidelse (GAP-1156); Jolle / sum/dimensjon (GAP-1157); Brann / omfang (GAP-1159); Tyveri / omfang/unntak (GAP-1160); Bergelønn / branntyveri (GAP-1161); Ulykke / valg/omfang (GAP-1167); Ulykke / død (GAP-1168); Ulykke / invalid (GAP-1169); Ulykke / unntak (GAP-1170); Ansvar / rolle/sum (GAP-1171); Ansvar / unntak (GAP-1172); Rettshjelp / område/rolle (GAP-1173); Rettshjelp / sum/egenandel (GAP-1174); Rettshjelp / utgifter/unntak (GAP-1175); Bergelønn / branntyveri (GAP-1187); Kasko / omfang (GAP-1188); Kasko / unntak (GAP-1189); Redning / utløser (GAP-1190); Redning / tiltak (GAP-1191); Hjemtransportbåt / område/sum (GAP-1192); Redning / egenandel (GAP-1193); Maskin / valg/omfang (GAP-1194); Maskin / unntak (GAP-1195); Maskin / oppgjør (GAP-1196); Maskin / egenandelalder (GAP-1197); Jolle / sum/dimensjon (GAP-1219); Løsøre / sum/applicability (GAP-1220)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 27 P1-signaturer / 63 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-037 · frende · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0112 / SF-0185: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF side 12, 14.4; GAP-0116 / SF-0195: catalog/sources/vehicle-extensions/frende-campingvognforsikring.html — Dekningsmatrise Forsikringssum løsøre; GAP-1720 / SF-2504: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF 11–12 §14.1; GAP-1721 / SF-2505: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF 12 §14.2–3; GAP-1722 / SF-2506: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF 12–13 §14.4. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-037].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["frende","campingvogn","ordinary","frende-campingvogn-brann-og-tyveri","2026-01-01"]; ["frende","campingvogn","ordinary","frende-campingvogn-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-013, fra SCRC-004, SCRC-021. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum og egenandel (GAP-0112); Løsøre / gjenstandsgrense (GAP-0116); Rettshjelp / personkrets/tvist (GAP-1720); Rettshjelp / utgifter/unntak (GAP-1721); Rettshjelp / sum (GAP-1722); Rettshjelp / egenandel (GAP-1723); Brann / hendelser/unntak (GAP-1724); Tyveri / hendelser/unntak (GAP-1725); Løsøre / valg/objektgrense (GAP-1735); Løsøre / tyveristed (GAP-1736); Kasko / hendelser (GAP-1758); Kasko / unntak (GAP-1759); Fukt / årlig kontroll og utbedring (GAP-1770); Naturskade / dekning (GAP-1771)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 24 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-038 · frende · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1257 / SF-1872: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2punkt4.1; GAP-1258 / SF-1873: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2,3punkt4.1/4.2; GAP-1262 / SF-1877: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2,3punkt4.2; GAP-1263 / SF-1878: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2,3punkt4.2; GAP-1268 / SF-1883: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside3punkt5.1. Alle 11 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-038].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["frende","hund","ordinary","frende-hund-veterin-r","2026-01-01"]. Tilleggskomponenter: frende-hund-bruksverdi; frende-hund-medisin; frende-hund-tann; frende-hund-tap.

**ROOT CAUSE:** RC-014, fra SCRC-016. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / omfang (GAP-1257); Allergi / sum/vilkår (GAP-1258); Veterinær / unntak (GAP-1262); Karenstid / tid/økning (GAP-1263); Tannsykdom / tillegg/sum (GAP-1268); Tannsykdom / unntak/tid (GAP-1269); Medisin / tillegg/sum (GAP-1270); Forsikringssum / samordning (GAP-1271); Tap / hendelser (GAP-1272); Tap / unntak (GAP-1273); Brukshund / ytelse (GAP-1277)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-018.

**EXPECTED LEVERAGE:** 11 P1-signaturer / 11 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-039 · frende · Hus · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0295 / SF-0506: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 5, 5.6; GAP-0296 / SF-0509: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 7, 6.6; GAP-0297 / SF-0512: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 6, 6.5; GAP-0298 / SF-0513: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 7, 6.7 og side9/6.16; GAP-0302 / SF-0525: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 12, 8.4. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-039].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["frende","bolig","ordinary","frende-hus-standard","2026-09-01"]; ["frende","bolig","ordinary","frende-hus-utvidet","2026-09-01"]. Tilleggskomponenter: frende-hus-utleie.

**ROOT CAUSE:** RC-015, fra SCRC-009. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard / viktige unntak (GAP-0295); Offentlig påbud / vilkår/unntak (GAP-0296); Førsterisiko / oppgjør (GAP-0297); Gjenoppføring / femårsfrist/annen eier (GAP-0298); Rettshjelp / sum/egenandel (GAP-0302); Utleie / leietap etter skade (GAP-0304); Utvidet håndverker / unntak (GAP-0319)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 13 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-040 · frende · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0275 / SF-0452: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 4, 5.1; GAP-0278 / SF-0460: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 5, 5.3; GAP-0282 / SF-0470: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 7, 7.3; GAP-0283 / SF-0472: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 8, 8.1–8.2; 2.2; GAP-0284 / SF-0473: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 10, 9.4. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-040].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["frende","innbo","ordinary","frende-innbo-standard","2026-09-01"]. Tilleggskomponenter: frende-innbo-uhell.

**ROOT CAUSE:** RC-016, fra SCRC-008. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Vann / inntrenging (GAP-0275); Borteboing / merutgifter (GAP-0278); Skadedyr / unntak (GAP-0282); Ansvar / privat rolle/vesentlige unntak (GAP-0283); Rettshjelp / summer (GAP-0284); Rettshjelp / vesentlige unntak (GAP-0286); ID/nettmisbruk / viktige begrensninger (GAP-0287); Uhell / skadeunntak og kildeforskjell (GAP-0288)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-041 · frende · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1286 / SF-1905: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2punkt4.1; GAP-1287 / SF-1906: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2,3punkt4.1/4.2; GAP-1291 / SF-1910: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2,3punkt4.2; GAP-1292 / SF-1911: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2,3punkt4.2; GAP-1293 / SF-1912: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside3punktHund6/Katt5. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-041].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["frende","katt","ordinary","frende-katt-veterin-r","2026-01-01"]. Tilleggskomponenter: frende-katt-medisin; frende-katt-tap.

**ROOT CAUSE:** RC-017, fra SCRC-016. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / omfang (GAP-1286); Allergi / sum/vilkår (GAP-1287); Veterinær / unntak (GAP-1291); Karenstid / tid/økning (GAP-1292); Medisin / tillegg/sum (GAP-1293); Forsikringssum / samordning (GAP-1294); Tap / unntak (GAP-1295)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-042 · frende · MC · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1451 / SF-2121: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10punkt11.13; GAP-1452 / SF-2122: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10punkt12.1; GAP-1453 / SF-2124: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10,11punkt12.3; GAP-1455 / SF-2126: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11punkt13.1; GAP-1456 / SF-2127: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11,12punkt14.1. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-042].evidence`.

**AFFECTED SCOPE:** Providers frende; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["frende","mc","ordinary","frende-mc-ansvar","2026-01-01"]; ["frende","mc","ordinary","frende-mc-delkasko","2026-01-01"]; ["frende","mc","ordinary","frende-mc-kasko","2026-01-01"]. Tilleggskomponenter: frende-mc-ulykke.

**ROOT CAUSE:** RC-018, fra SCRC-018. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Bonus / fritak (GAP-1451); Ulykke / scope (GAP-1452); Ulykke / invaliditet (GAP-1453); Ansvar / utenombilansvar (GAP-1455); Rettshjelp / scope (GAP-1456); Rettshjelp / utgifter/unntak (GAP-1457); Rettshjelp / sum (GAP-1458); Brann / hendelser/unntak (GAP-1467); Tyveri / hendelser/unntak (GAP-1468); Veihjelp / hendelser/sted (GAP-1469); Hjemtransport / personer (GAP-1470); Hjemtransport / kjøretøy (GAP-1471); Kasko / unntak (GAP-1500)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 32 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-043 · frende · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0325 / SF-0594: catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf — PDF side2, 1; GAP-0326 / SF-0599: catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf — PDF side3, 3.1–3.2; GAP-0328 / SF-0601: catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf — PDF side3, 3.1; GAP-0329 / SF-0602: catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf — PDF side3, 3.3; GAP-0331 / SF-0604: catalog/sources/frende/reise/Vilkar-reiseforsikring-01032026.pdf — PDF side4, 4.1. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-043].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["frende","reise","ordinary","frende-reiseforsikring","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-019, fra SCRC-010. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; SAFE_FOR_SUBAGENT. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / familie (GAP-0325); Avbestilling / årsak (GAP-0326); Avbestilling / økonomisk omfang (GAP-0328); Avbestilling / unntak (GAP-0329); Forsinkelse / viderereise (GAP-0331); Reisegods / hvem/hendelser (GAP-0333); Reisegods / unntak (GAP-0334); Sykdom / andre unntak (GAP-0335); Sykdom / utgifter (GAP-0336); Ulykke / dødsbegunstigelse (GAP-0340); Ulykke / unntak (GAP-0341); Rettshjelp / område/rolle (GAP-0342)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-044 · frende · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0099 / SF-0164: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF side 12, 14.4; GAP-0106 / SF-0179: catalog/sources/vehicle-extensions/frende-snoscooterforsikring.html — Dekningsmatrise fører/passasjerulykke + vilkår pkt12; GAP-1644 / SF-2415: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF 11–12 §14.1; GAP-1645 / SF-2416: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF 12 §14.2–3; GAP-1646 / SF-2417: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF 12–13 §14.4. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-044].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["frende","snøscooter","ordinary","frende-snoscooter-ansvar","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-brann-og-tyveri","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-020, fra SCRC-004, SCRC-021. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum og egenandel (GAP-0099); Ulykke / valgfri tilgjengelighet (GAP-0106); Rettshjelp / personkrets/tvist (GAP-1644); Rettshjelp / utgifter/unntak (GAP-1645); Rettshjelp / sum (GAP-1646); Rettshjelp / egenandel (GAP-1647); Ansvar / lovbestemt/ulovfestet (GAP-1650); Fører/passasjerulykke / valgfri tilgjengelighet (GAP-1651); Brann / hendelser/unntak (GAP-1664); Tyveri / hendelser/unntak (GAP-1665); Egenandel / brann/tyveri (GAP-1683); Kasko / hendelser (GAP-1700); Kasko / unntak (GAP-1701)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 32 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-045 · frende · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0122 / SF-0202: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF side 12, 14.4; GAP-1776 / SF-2576: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 11–12 §14.1; GAP-1777 / SF-2577: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 12 §14.2–3; GAP-1778 / SF-2578: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 12–13 §14.4; GAP-1779 / SF-2579: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 13 §14.4. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-045].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["frende","tilhenger","ordinary","frende-tilhenger-brann-og-tyveri","2026-01-01"]; ["frende","tilhenger","ordinary","frende-tilhenger-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-021, fra SCRC-004, SCRC-021. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum og egenandel (GAP-0122); Rettshjelp / personkrets/tvist (GAP-1776); Rettshjelp / utgifter/unntak (GAP-1777); Rettshjelp / sum (GAP-1778); Rettshjelp / egenandel (GAP-1779); Brann / hendelser/unntak (GAP-1780); Tyveri / hendelser/unntak (GAP-1781); Frakoblet tilhenger / skadeomfang (GAP-1791); Kasko / hendelser (GAP-1810); Kasko / unntak (GAP-1811)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 18 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-046 · gjensidige · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1822 / SF-2637: catalog/sources/gjensidige/bil-ansvar-alminnelige-vilkar.pdf — PDF 1/9; GAP-1845 / SF-2665: catalog/sources/gjensidige/Bil-Delkasko-alminnelige-vilkar.pdf — PDF 1/9; GAP-1883 / SF-2715: catalog/sources/gjensidige/Bil-Kasko-alminnelige-vilkar.pdf — PDF 1/9; GAP-1932 / SF-2781: catalog/sources/gjensidige/Bil-Pluss-alminnelige-vilkar.pdf — PDF 1/9; GAP-1831 / SF-2648: catalog/sources/gjensidige/bil-ansvar-alminnelige-vilkar.pdf — PDF 4. Alle 72 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-046].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["gjensidige","bil","ordinary","gj-bil-ansvar",null]; ["gjensidige","bil","ordinary","gj-bil-delkasko",null]; ["gjensidige","bil","ordinary","gj-bil-kasko",null]; ["gjensidige","bil","ordinary","gj-bil-pluss",null]. Tilleggskomponenter: gj-punktering.

**ROOT CAUSE:** RC-022, fra SCRC-022. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / grunnsum (GAP-1822); Ulykke / hendelser (GAP-1831); Ulykke / dødsfall vilkår (GAP-1832); Ulykke / invaliditet (GAP-1833); Ulykke / vesentlige unntak (GAP-1834); Rettshjelp / omfang (GAP-1835); Rettshjelp / kostnader (GAP-1836); Rettshjelp / begrensninger (GAP-1838); Rettshjelp / flerpart/sum (GAP-1839); Glass / sum og egenandel (GAP-1857); Veihjelp / hendelser/transport (GAP-1858); Veihjelp / hjemtransport/hotell (GAP-1859); Veihjelp / unntak (GAP-1860); Bonus / skadefritak (GAP-1877); Reparasjonsgaranti / Delkasko anvendelighet (GAP-1881); Nøkkel / hendelser/frekvens (GAP-1901); Leiebil / reparasjon (GAP-1902); Leiebil / totalskade/tyveri (GAP-1903); Leiebil / unntak (GAP-1904); Reparasjonsgaranti / åtteår (GAP-1907); Totalskadegaranti / utløsende/erstatning (GAP-1908); Punktering / valgfri (GAP-1913); Punktering / kontroll (GAP-1914); Punktering / følgeskade (GAP-1915); Leiebil / bare veihjelp (GAP-1930); Maskinskade / unntak (GAP-1961); Bonus / skadefritak (GAP-1977)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 27 P1-signaturer / 72 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-047 · gjensidige · Bobil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2405 / SF-3452: catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf — 1; GAP-2428 / SF-3479: catalog/sources/mc-bobil/gjensidige-bobil-delkasko-vilkar.pdf — 1; GAP-2467 / SF-3525: catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf — 1; GAP-2507 / SF-3578: catalog/sources/mc-bobil/gjensidige-bobil-pluss-vilkar.pdf — 1; GAP-2406 / SF-3453: catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf — 1;PDF6–8. Alle 71 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-047].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["gjensidige","bobil","ordinary","gjensidige-bobil-ansvar",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-delkasko",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-kasko",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-023, fra SCRC-030. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / sum/egenandel (GAP-2405); Rettshjelp / sum/egenandel (GAP-2406); Ulykke / sum/egenandel (GAP-2407); Geografi / områder (GAP-2408); Ulykke / hendelser (GAP-2415); Ulykke / dødsfall vilkår (GAP-2416); Ulykke / invaliditet (GAP-2417); Ulykke / vesentlige unntak (GAP-2418); Rettshjelp / omfang (GAP-2419); Rettshjelp / begrensninger (GAP-2422); Rettshjelp / flerpart/sum (GAP-2423); Objekt / ekstrahjul/verdier (GAP-2438); Glass / sum/egenandel (GAP-2439); Glass / solcelle (GAP-2440); Løsøre / sum/valg (GAP-2441); Tilvalg / fortelt/utleie (GAP-2442); Veihjelp / status/egenandel (GAP-2443); Veihjelp / tauing (GAP-2444); Veihjelp / hjemtransport/hotell (GAP-2445); Veihjelp / begrensninger (GAP-2446); Fysisk skade / unntak (GAP-2486); Maskinskade / unntak (GAP-2527); Maskinskade / service (GAP-2528)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-012.

**EXPECTED LEVERAGE:** 23 P1-signaturer / 75 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-048 · gjensidige · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2736 / SF-3870: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — PDF2; GAP-2772 / SF-3911: catalog/sources/boat-pet/gjensidige-boat-kasko-terms.pdf — PDF2; GAP-2814 / SF-3958: catalog/sources/boat-pet/gjensidige-boat-plus-terms.pdf — PDF3; GAP-2739 / SF-3873: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — PDF2; GAP-2775 / SF-3914: catalog/sources/boat-pet/gjensidige-boat-kasko-terms.pdf — PDF2. Alle 63 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-048].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","båt","ordinary","gjensidige-bat-delkasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-kasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-024, fra SCRC-003. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / område (GAP-2736); Objekt / fastutstyr/jolle (GAP-2739); Løst utstyr/løsøre / sum (GAP-2740); Brann/tyveri / egenandel (GAP-2742); Tyveri / egenandelsfritak (GAP-2743); Redning / utløser (GAP-2744); Redning / transport/reparasjon (GAP-2745); Redning / person/hotell (GAP-2746); Redning / egenandel (GAP-2747); Ansvar / sum/egenandel (GAP-2756); Ansvar / omfang (GAP-2757); Ansvar / unntak (GAP-2758); Ulykke / person/trigger (GAP-2760); Ulykke / død/invaliditetsbegrensninger (GAP-2762); Ulykke / unntak (GAP-2763); Rettshjelp / sum/egenandel/geografi (GAP-2764); Rettshjelp / unntak (GAP-2767); Redning / utløser (GAP-2780); Redning / transport/reparasjon (GAP-2781); Redning / person/hotell (GAP-2782); Kasko / risiko (GAP-2789); Transport/opplag / dekning (GAP-2790); Fysisk skade / unntak (GAP-2794); Motorskade / komponenter (GAP-2839); Motorskade / unntak (GAP-2842); Motorskade / sikkerhet (GAP-2843); Feriegaranti / sum/varighet (GAP-2844); Opplagsutstyr / omfang/sum (GAP-2845); Totalskade / terskel (GAP-2846); Totalskade / alder/basis (GAP-2847); Totalskade / oppgjør (GAP-2848)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 31 P1-signaturer / 65 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-049 · gjensidige · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2640 / SF-3750: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf — 1;PDF3; GAP-2660 / SF-3775: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf — 1;PDF3–4; GAP-2682 / SF-3802: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Pluss-alminnelige-vilkar.pdf — 1;PDF3–4; GAP-2641 / SF-3751: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf — 1,3; GAP-2661 / SF-3776: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf — 1,3. Alle 23 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-049].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-delkasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-kasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-025, fra SCRC-033. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Brann/tyveri / hendelser/egenandel (GAP-2640); Fastmontert ekstrautstyr / sum (GAP-2641); Løsøre / sum/valg (GAP-2642); Naturskade / unntak (GAP-2646); Veihjelp / omfang/egenandel (GAP-2649); Veihjelp / hjemtransport (GAP-2650); Veihjelp / begrensninger (GAP-2651); Glass / sum/egenandel (GAP-2665); Naturskade / hendelser/egenandel (GAP-2667); Kasko / omfang/egenandel (GAP-2668); Fukt / alder/condition (GAP-2692); Feriegaranti / sum/dager/condition (GAP-2693)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 27 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-050 · gjensidige · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2868 / SF-4017: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2869 / SF-4018: catalog/sources/boat-pet/gjensidige-dog-product.html — Behandling; GAP-2872 / SF-4021: catalog/sources/boat-pet/gjensidige-dog-product.html — Egenandel; GAP-2875 / SF-4025: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2876 / SF-4027: catalog/sources/boat-pet/gjensidige-dog-product.html — MRogCT. Alle 16 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-050].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]. Tilleggskomponenter: gjensidige-hund-bruk; gjensidige-hund-liv.

**ROOT CAUSE:** RC-026, fra SCRC-001. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / omfang/periodetak (GAP-2868); Veterinær / sumvalg (GAP-2869); Egenandel / formel/periode (GAP-2872); Medisiner / omfang (GAP-2875); MR/CT / sum/periodetak (GAP-2876); Tann / karies/emalje (GAP-2880); Diagnostikk ledd/rygg / sum/selvskadenunntatt (GAP-2884); Rehabilitering / frist/sted (GAP-2893); Liv / død/tyveri (GAP-2894); Liv / karens/tilstand (GAP-2896); Liv / opphør/raser (GAP-2897); Tyveri/bortkomst / venteperiode (GAP-2899); Bruk / tap/avl (GAP-2901); Bruk / arbeidshund (GAP-2902); Bruk / gjenverdi (GAP-2904); Definisjoner / skadetid/sammesykdom (GAP-2907)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022.

**EXPECTED LEVERAGE:** 16 P1-signaturer / 16 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-051 · gjensidige · Hus · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2082 / SF-2985: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 3; GAP-2136 / SF-3069: catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2083 / SF-2986: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 3; GAP-2137 / SF-3070: catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2086 / SF-2989: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 4. Alle 69 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-051].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","bolig","ordinary","gjensidige-hus","Alminnelige vilkår"]; ["gjensidige","bolig","ordinary","gjensidige-hus-pluss","Alminnelige vilkår"]. Tilleggskomponenter: gjensidige-hus-rate-insekter; gjensidige-hus-smart; gjensidige-hus-utleie.

**ROOT CAUSE:** RC-027, fra SCRC-025. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Hage / omfang (GAP-2082); Brygge / sum/årsaker (GAP-2083); Bygging / begrensninger (GAP-2086); Brann / hendelser (GAP-2087); Vann / hendelser (GAP-2088); Utleie / valg/hendelser (GAP-2089); Utleie / begrensninger (GAP-2090); Utleie / kontrakt/tid (GAP-2091); Skadedyr / skade og bekjempelse (GAP-2092); Skadedyr / avgrensninger (GAP-2093); Andreunntak / årsaker (GAP-2094); Hage/basseng/brygge / vær/dyr (GAP-2095); Snø / glasshagestue (GAP-2096); Drensledning / årsaker (GAP-2097); Rullestol / sum/frister (GAP-2098); Brukstap / egen bolig (GAP-2100); Råte / unntak (GAP-2101); Insekter / bekjempelse (GAP-2102); Ansvar / unntak (GAP-2104); Rettshjelp / grunndimensjoner (GAP-2105); Rettshjelp / tvistgrener (GAP-2106); Rettshjelp / unntak (GAP-2107); Helsehjelp / hvem/hvor (GAP-2108); Helsehjelp / unntak (GAP-2109); Førsterisiko / oppgjør (GAP-2111); Manglende gjenoppføring / oppgjør (GAP-2112); Brukstap / varighet (GAP-2116); Aldersfradrag / utvendigerør (GAP-2117); Aldersfradrag / fritak/beregningsbasis (GAP-2118); Naturskade / nytomt (GAP-2119); Offentlig påbud / vilkår (GAP-2120); Smart / utrykning (GAP-2126); Smart / ansvarsgrense (GAP-2128); Vann / utett bygning (GAP-2143); Håndverkerfeil våtrom / utløser/tid (GAP-2153); Håndverkerfeil våtrom / begrensninger (GAP-2154); Håndverkerfeil øvrig / utløser/tid (GAP-2155); Håndverkerfeil øvrig / begrensninger (GAP-2156); Håndverker / klageforutsetning (GAP-2183)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-007, B-020.

**EXPECTED LEVERAGE:** 39 P1-signaturer / 71 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-052 · gjensidige · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1982 / SF-2853: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3; GAP-2025 / SF-2908: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 3; GAP-1983 / SF-2854: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3; GAP-2026 / SF-2909: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 3; GAP-1988 / SF-2863: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3. Alle 50 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-052].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","innbo","ordinary","gj-innbo",null]; ["gjensidige","innbo","ordinary","gj-innbo-pluss",null]. Tilleggskomponenter: gj-innbo-utleie.

**ROOT CAUSE:** RC-028, fra SCRC-023. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / ting (GAP-1982); Geografi / særting (GAP-1983); Brann / hendelser (GAP-1988); Vann / hendelser (GAP-1989); Tyveri / hjem/bebodd (GAP-1991); Tyveri / andre steder (GAP-1992); Tyveri / stedunntak (GAP-1993); Ran/veskenapping / omfang (GAP-1994); Glass/sanitær / brudd (GAP-1998); Rullestol / sum/tid (GAP-2000); Etter skade / rydding/flytting/rekonstruksjon (GAP-2001); Opphold / periode (GAP-2002); Opphold / adkomst/natur (GAP-2003); Sikkerhet / sykkel/verdier (GAP-2007); Sikkerhet / bolig (GAP-2008); Ansvar / tillegg/unntak (GAP-2018); Rettshjelp / sum/egenandel (GAP-2019); Rettshjelp / område/scope (GAP-2020); Rettshjelp / mekling (GAP-2021); Rettshjelp / begrensning (GAP-2022); Innbosum / ubegrenset med grenser (GAP-2027); Tyveri / Norden (GAP-2036); Mobilskjerm / unntak/oppgjør (GAP-2049); Uhell borte / sum/område (GAP-2050); Uhell/flytting/utleie / unntak (GAP-2051); Sykkel veihjelp / omfang (GAP-2052); Skadeinsekter / arter/sum (GAP-2053); Skadeinsekter / begrensninger (GAP-2054); ID-tyveri / advokat (GAP-2055); ID-tyveri / unntak (GAP-2056); Utleie / valg/sum/hendelser (GAP-2057); Utleie / begrensninger (GAP-2058)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-014.

**EXPECTED LEVERAGE:** 32 P1-signaturer / 50 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-053 · gjensidige · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2909 / SF-4063: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2910 / SF-4064: catalog/sources/boat-pet/gjensidige-cat-product.html — Behandling; GAP-2913 / SF-4067: catalog/sources/boat-pet/gjensidige-cat-product.html — Egenandel; GAP-2915 / SF-4069: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2916 / SF-4071: catalog/sources/boat-pet/gjensidige-cat-ipid.pdf — 1. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-053].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","katt","ordinary","gjensidige-katt-behandling",null]. Tilleggskomponenter: gjensidige-katt-liv.

**ROOT CAUSE:** RC-029, fra SCRC-001. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / omfang/periodetak (GAP-2909); Veterinær / sumvalg (GAP-2910); Egenandel / formel/periode (GAP-2913); Medisiner / omfang (GAP-2915); Allergi / livstidsperiode/vilkår (GAP-2916); MR/CT / sum/periodetak (GAP-2917); Rehabilitering / unntak (GAP-2920); Liv / død/tyveri (GAP-2930); Liv / karens/tilstand (GAP-2932); Liv / opphør (GAP-2933); Tyveri/bortkomst / venteperiode (GAP-2935); Definisjoner / skadetid/sammesykdom (GAP-2942)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-054 · gjensidige · MC · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2292 / SF-3314: catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf — 1; GAP-2319 / SF-3346: catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf — 1; GAP-2362 / SF-3397: catalog/sources/mc-bobil/gjensidige-mc-kasko-vilkar.pdf — 1; GAP-2293 / SF-3315: catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf — 1;PDF6–8; GAP-2320 / SF-3347: catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf — 1;PDF7–9. Alle 48 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-054].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","mc","ordinary","gjensidige-mc-ansvar",null]; ["gjensidige","mc","ordinary","gjensidige-mc-delkasko",null]; ["gjensidige","mc","ordinary","gjensidige-mc-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-030, fra SCRC-030. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / sum/egenandel (GAP-2292); Rettshjelp / sum/egenandel (GAP-2293); Ulykke / sum/egenandel (GAP-2294); Geografi / områder (GAP-2295); Ulykke / hendelser (GAP-2305); Ulykke / dødsfall vilkår (GAP-2306); Ulykke / invaliditet (GAP-2307); Ulykke / vesentlige unntak (GAP-2308); Rettshjelp / omfang (GAP-2309); Rettshjelp / begrensninger (GAP-2312); Rettshjelp / flerpart/sum (GAP-2313); Objekt / ekstrahjul/verdier (GAP-2330); Glass / sum/egenandel (GAP-2332); Ekstrautstyr / sum/valg (GAP-2333); Veihjelp / status/egenandel (GAP-2334); Veihjelp / tauing (GAP-2335); Veihjelp / hjemtransport/hotell (GAP-2336); Veihjelp / begrensninger (GAP-2337); Fysisk skade / unntak (GAP-2382); Ladekabel / omfang/egenandel (GAP-2383)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-001.

**EXPECTED LEVERAGE:** 20 P1-signaturer / 49 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-055 · gjensidige · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2194 / SF-3155: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 3; GAP-2239 / SF-3230: catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2195 / SF-3156: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 3,8; GAP-2240 / SF-3231: catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf — PDF 3,9; GAP-2199 / SF-3162: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 1,4. Alle 66 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-055].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Reise; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","reise","ordinary","gjensidige-reise","2026-09-20-canonical"]; ["gjensidige","reise","ordinary","gjensidige-reise-pluss","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-031, fra SCRC-028. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / barn/barnebarn (GAP-2194); Reisested / hjemme/arbeid (GAP-2195); Sykdom / behandling (GAP-2199); Sykdom / godkjenning (GAP-2200); Ledsager/tilkalling / personantall (GAP-2201); Sykdom / kjent/behandling unntak (GAP-2202); Feriekompensasjon / vilkår/dager (GAP-2204); Feriekompensasjon / sum (GAP-2205); Ferieavbrudd / sum (GAP-2206); Reisefølge / én medreisende (GAP-2209); Bagasje / hendelser (GAP-2210); Bagasje / kontanter (GAP-2211); Bagasje / unntak (GAP-2213); Sykkel / sum/geografi (GAP-2214); Leid sportsutstyr / sum/vilkår (GAP-2215); Mobil / hendelser (GAP-2216); Forsinket transport / sum/utgift (GAP-2217); Evakuering / hendelser/godkjenning (GAP-2218); Evakuering / tapteferiedager (GAP-2219); Avbestilling / sykdomskrets (GAP-2220); Avbestilling / andretrigger (GAP-2221); Avbestilling / tid/kontinuitet (GAP-2222); Avbestilling / unntak (GAP-2223); Ansvar / leietbygning (GAP-2224); Ansvar / unntak (GAP-2225); Rettshjelp / sum/geografi (GAP-2226); Rettshjelp / unntak/HTU (GAP-2228); Aldersfradrag / maks/annet (GAP-2230); Reisevarighet utvidelse / periode/valg (GAP-2232); Ekspedisjon tilvalg / valg/grenser (GAP-2233); Onlinelege / tjeneste (GAP-2235); Forsinket leiebil / sum/vilkår (GAP-2264); Forsinket ankomst / sum/tid (GAP-2265); Leiebilegenandel / sum/krav (GAP-2272); Leiebilegenandel / begrensninger (GAP-2273); Ulykke / hendelsesdefinisjon (GAP-2279); Ulykke / begrensninger (GAP-2280); Ulykke / invaliditet/dødsfrist (GAP-2281)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-016.

**EXPECTED LEVERAGE:** 38 P1-signaturer / 69 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-056 · gjensidige · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2555 / SF-3654: catalog/sources/vehicle-extensions/gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf — 1; GAP-2577 / SF-3678: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Delkasko-alminnelige-vilkar.pdf — 1; GAP-2607 / SF-3712: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Kasko-alminnelige-vilkar.pdf — 1; GAP-2556 / SF-3655: catalog/sources/vehicle-extensions/gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf — 1; GAP-2578 / SF-3679: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Delkasko-alminnelige-vilkar.pdf — 1. Alle 42 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-056].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-ansvar",null]; ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-delkasko",null]; ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-032, fra SCRC-033. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / sum/egenandel (GAP-2555); Ulykke / sum/egenandel (GAP-2556); Rettshjelp / sum/geografi/egenandel (GAP-2557); Geografi / område (GAP-2558); Ulykke / hendelser (GAP-2564); Ulykke / dødsfall vilkår (GAP-2565); Ulykke / invaliditet (GAP-2566); Ulykke / vesentlige unntak (GAP-2567); Rettshjelp / omfang (GAP-2568); Rettshjelp / begrensninger (GAP-2571); Rettshjelp / flerpart/sum (GAP-2572); Rettshjelp / egenandel (GAP-2573); Brann/tyveri / hendelser/egenandel (GAP-2586); Løsøre / sum/condition (GAP-2587); Ekstrautstyr / sum/valg (GAP-2588); Kasko / omfang/egenandel (GAP-2620)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 16 P1-signaturer / 43 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-057 · gjensidige · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2707 / SF-3832: catalog/sources/vehicle-extensions/gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf — 1;PDF2; GAP-2722 / SF-3852: catalog/sources/vehicle-extensions/gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf — 1;PDF2–3; GAP-2708 / SF-3834: catalog/sources/vehicle-extensions/gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf — PDF2; GAP-2723 / SF-3854: catalog/sources/vehicle-extensions/gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf — PDF2–3; GAP-2709 / SF-3835: catalog/sources/vehicle-extensions/gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf — PDF2. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-057].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-delkasko",null]; ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-033, fra SCRC-033. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Brann/tyveri / hendelser/egenandel (GAP-2707); Veihjelp / omfang/egenandel (GAP-2708); Veihjelp / hjemtransport (GAP-2709); Veihjelp / begrensninger (GAP-2710); Kasko / omfang/egenandel (GAP-2727)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-058 · if · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-2944 / SF-4103: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 4 pkt4.1;19 pkt8.5.1; GAP-2947 / SF-4107: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 24 pkt12; GAP-2948 / SF-4108: catalog/sources/if/innbo/If_Generelle_vilkar_GEN2-9.pdf — 10–11 pkt23.2–23.3; GAP-2961 / SF-4131: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 6 pkt4.7; GAP-2963 / SF-4135: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 18 pkt8.4.2. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-058].evidence`.

**AFFECTED SCOPE:** Providers if; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["if","bil","ordinary","if-bil-ansvar","MOT2-2"]; ["if","bil","ordinary","if-bil-delkasko","MOT2-2"]; ["if","bil","ordinary","if-bil-kasko","MOT2-2"]; ["if","bil","ordinary","if-bil-super","MOT2-2"]. Tilleggskomponenter: if-leiebil.

**ROOT CAUSE:** RC-034, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / rettslig mekanisme (GAP-2944); Rettshjelp / rolle og etteropphør (GAP-2947); Rettshjelp / sum og flerpart (GAP-2948); Veihjelp / hjemtransport og sum (GAP-2961); Nyverdi standard / alder/km/terskel (GAP-2963); Nyverdi standard / forutsetninger (GAP-2964); Reparasjonstrygghet / varighet/omfang (GAP-2985); Leiebil / maskinskade/utenfor Norden (GAP-2989); Nyverdi Super / gjenkjøp/tyveri (GAP-3010)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 24 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-059 · if · Bobil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3075 / SF-4326: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 24 pkt12; GAP-3076 / SF-4327: catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf — 10–11 pkt23.2–23.3; GAP-3093 / SF-4356: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 18 pkt8.4.2; GAP-3094 / SF-4357: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 13 pkt5.2; GAP-3099 / SF-4364: catalog/sources/mc-bobil/if-SV707.pdf — 5 pkt6.2.1. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-059].evidence`.

**AFFECTED SCOPE:** Providers if; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["if","bobil","ordinary","if-bobil-ansvar","2024-03"]; ["if","bobil","ordinary","if-bobil-delkasko","2024-03"]; ["if","bobil","ordinary","if-bobil-kasko","2024-03"]; ["if","bobil","ordinary","if-bobil-super","2022-06"]. Tilleggskomponenter: if-bobil-leiebil; if-bobil-motor-gir.

**ROOT CAUSE:** RC-035, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / rolle og etteropphør (GAP-3075); Rettshjelp / sum og flerpart (GAP-3076); Nyverdi standard / forutsetninger (GAP-3093); Viktige unntak / vær/slitasje/tuning (GAP-3094); Utleie / egenandel (GAP-3099); Viktige unntak / vær/slitasje/tuning (GAP-3115); Maskinskade / komponenter (GAP-3118); Maskinskade / vedlikehold og oppgjør (GAP-3120); Leiebil / maskinskade/utenfor Norden (GAP-3124); Nyverdi Super / gjenkjøp/tyveri (GAP-3152)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 23 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-060 · if · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3657 / SF-5256: catalog/sources/boat-pet/if-boat-terms.pdf — 2 §2; GAP-3658 / SF-5257: catalog/sources/boat-pet/if-boat-terms.pdf — 2 §2; GAP-3660 / SF-5260: catalog/sources/boat-pet/if-boat-terms.pdf — 3 §3.1; GAP-3662 / SF-5264: catalog/sources/boat-pet/if-boat-terms.pdf — 3 §4.1;IPID1; GAP-3664 / SF-5266: catalog/sources/boat-pet/if-boat-terms.pdf — 4 §4.5. Alle 28 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-060].evidence`.

**AFFECTED SCOPE:** Providers if; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["if","båt","ordinary","if-bat-delkasko","2023-02-01"]; ["if","båt","ordinary","if-bat-kasko","2023-02-01"]; ["if","båt","ordinary","if-bat-super","2023-02-01"]. Tilleggskomponenter: if-bat-motor-gir.

**ROOT CAUSE:** RC-036, fra SCRC-041. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / radius/overfart (GAP-3657); Bruk / transport/regatta (GAP-3658); Bagasje / sum (GAP-3660); Ansvar/rettshjelp/ulykke / avtale (GAP-3662); Transport / skadetilfelle (GAP-3664); Bergelønn / sum/trigger (GAP-3665); Vrakfjerning / sum/trigger (GAP-3666); Skade / hovedunntak (GAP-3667); Ny båt / alder/skadegrad/form (GAP-3676); Egenandel / struktur (GAP-3677); Brann/tyveri / egenandel (GAP-3678); Ansvar / sum/rolle (GAP-3680); Ulykke / person/sum (GAP-3682); Rettshjelp / scope/kildehenvisning (GAP-3684); Bagasje / sum (GAP-3690); Opplagsutstyr / sum (GAP-3691); Jolle / grenser (GAP-3692); Kasko / utløser (GAP-3696); Transport / skadetilfelle (GAP-3698); Bergelønn / sum/trigger (GAP-3699); Vrakfjerning / sum/trigger (GAP-3700); Assistanse / utløser (GAP-3701); Motor/gir / opphørsalder (GAP-3703); Skade / hovedunntak (GAP-3708); Kasko/jolle / egenandel (GAP-3721); Ferieavbrudd / dag/sesong (GAP-3748); Totalskadegaranti / alder/form (GAP-3750); Opplagsutstyr / sum/egenandel (GAP-3751)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-003.

**EXPECTED LEVERAGE:** 28 P1-signaturer / 55 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-061 · if · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3221 / SF-4546: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 3 pkt2; GAP-3222 / SF-4548: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 24 pkt12; GAP-3223 / SF-4549: catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf — 10–11 pkt23.2–23.3; GAP-3225 / SF-4552: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 4–5 pkt4.2/4.5; GAP-3228 / SF-4556: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 3 pkt3. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-061].evidence`.

**AFFECTED SCOPE:** Providers if; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["if","campingvogn","ordinary","if-campingvogn-delkasko","2024-03"]; ["if","campingvogn","ordinary","if-campingvogn-kasko","2024-03"]; ["if","campingvogn","ordinary","if-campingvogn-super","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-037, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / område (GAP-3221); Rettshjelp / rolle og etteropphør (GAP-3222); Rettshjelp / sum og flerpart (GAP-3223); Brann/natur / utløsning (GAP-3225); Fastmontert utstyr/bagasje / sum og samlet mekanisme (GAP-3228); Frigjøring/transport / sum og scope (GAP-3236); Utstyr/bagasje / valgbar høyere sum (GAP-3241)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-024.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-062 · if · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0024 / SF-0039: catalog/sources/boat-pet/if-dog-terms.pdf — PDF side 4, 5.1.2; GAP-0027 / SF-0042: catalog/sources/boat-pet/if-dog-terms.pdf — PDF side 4, 5.1.1; GAP-0028 / SF-0043: catalog/sources/boat-pet/if-dog-terms.pdf — PDF side 4, 5.1.3; GAP-0029 / SF-0044: catalog/sources/boat-pet/if-dog-terms.pdf — PDF side 4, 5.1.4; GAP-0030 / SF-0045: catalog/sources/boat-pet/if-dog-terms.pdf — PDF side 5, 5.1.9. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-062].evidence`.

**AFFECTED SCOPE:** Providers if; typer Hund; scope ordinary. 3 eksakte produktidentiteter: ["if","hund","ordinary","if-hund-basis","2022-12-01"]; ["if","hund","ordinary","if-hund-standard","2022-12-01"]; ["if","hund","ordinary","if-hund-super","2022-12-01"]. Tilleggskomponenter: if-hund-liv.

**ROOT CAUSE:** RC-038, fra SCRC-002, SCRC-042. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tannulykke / dekning (GAP-0024); Medisin / behandlingssted (GAP-0027); Tannsykdom / livstidsgrense (GAP-0028); Allergibehandling / livstidsgrense (GAP-0029); Rollover / kvalifiserende vilkår (GAP-0030); Karenstid / sykdom (GAP-0031); Veterinær / opphør (GAP-0034); Liv / aldersmodell (GAP-3779); Tannsykdom / grense/årsak (GAP-3821)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 17 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-063 · if · Hus · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3458 / SF-4878: catalog/sources/if/hus/Bygningsforsikring.pdf — 7 pkt4.3; GAP-3461 / SF-4884: catalog/sources/if/hus/Bygningsforsikring.pdf — 9 pkt4.7; GAP-3466 / SF-4892: catalog/sources/if/hus/Bygningsforsikring.pdf — 14 pkt4.13.1; GAP-3467 / SF-4893: catalog/sources/if/hus/Bygningsforsikring.pdf — 14–15 pkt4.13.2–3; GAP-3468 / SF-4894: catalog/sources/if/hus/Bygningsforsikring.pdf — 15 pkt4.13.4. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-063].evidence`.

**AFFECTED SCOPE:** Providers if; typer Hus; scope ordinary. 3 eksakte produktidentiteter: ["if","bolig","ordinary","if-hus-basis","2023-09"]; ["if","bolig","ordinary","if-hus-super","2023-09"]; ["if","bolig","ordinary","if-hus-utvidet","2023-09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-039, fra SCRC-039. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Snø/is / unntak/rydding (GAP-3458); Annen skade / unntak (GAP-3461); Bygging / ting/sum (GAP-3466); Bygging / risiko (GAP-3467); Bygging / ansvarsutvidelse (GAP-3468); Utvendig rør / aldersfradrag (GAP-3474); Boligtilpasning / sum/utløser (GAP-3490); Skadedyr / utvidelse (GAP-3492); Håndverker våtrom / vilkår (GAP-3527); Håndverker følgeskade / vilkår (GAP-3528); Håndverker / fellesunntak (GAP-3529); Tryggere Hjem / alarm/egenandel (GAP-3547)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 26 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-064 · if · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3338 / SF-4695: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 6 pkt3.4; GAP-3346 / SF-4705: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 5 pkt3.2.2; GAP-3354 / SF-4717: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 7 pkt4.5.1; GAP-3386 / SF-4761: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 7–8 pkt4.5.2; GAP-3391 / SF-4767: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 9 pkt4.10. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-064].evidence`.

**AFFECTED SCOPE:** Providers if; typer Innbo; scope ordinary. 3 eksakte produktidentiteter: ["if","innbo","ordinary","if-innbo-basis","IBO2-1"]; ["if","innbo","ordinary","if-innbo-super","IBO2-1"]; ["if","innbo","ordinary","if-innbo-utvidet","IBO2-1"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-040, fra SCRC-038. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ubegrenset sum / særgrenser (GAP-3338); Ubeboelig bolig / opphold (GAP-3346); Leietakertyveri / basisgrense (GAP-3354); Ran / geografi (GAP-3386); Uhell / ting unntatt (GAP-3391); Uhell / årsaker unntatt (GAP-3392); Utleie / egenandel og frister (GAP-3395); Boligtilpasning / sum/utløser (GAP-3396); Frysevarer / sum/utløsning (GAP-3433)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-065 · if · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0042 / SF-0069: catalog/sources/boat-pet/if-cat-terms.pdf — PDF side 4, 5.1.2; GAP-0045 / SF-0072: catalog/sources/boat-pet/if-cat-terms.pdf — PDF side 4, 5.1.1; GAP-0046 / SF-0073: catalog/sources/boat-pet/if-cat-terms.pdf — PDF side 4, 5.1.3; GAP-0047 / SF-0074: catalog/sources/boat-pet/if-cat-terms.pdf — PDF side 4, 5.1.4; GAP-0048 / SF-0075: catalog/sources/boat-pet/if-cat-terms.pdf — PDF side 5, 5.1.9. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-065].evidence`.

**AFFECTED SCOPE:** Providers if; typer Katt; scope ordinary. 3 eksakte produktidentiteter: ["if","katt","ordinary","if-katt-basis","2022-12-01"]; ["if","katt","ordinary","if-katt-standard","2022-12-01"]; ["if","katt","ordinary","if-katt-super","2022-12-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-041, fra SCRC-002. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tannulykke / dekning (GAP-0042); Medisin / behandlingssted (GAP-0045); Tannsykdom / livstidsgrense (GAP-0046); Allergibehandling / livstidsgrense (GAP-0047); Rollover / kvalifiserende vilkår (GAP-0048); Karenstid / sykdom (GAP-0049); Veterinær / opphør (GAP-0052); Tannresorpsjon / årlig undergrense (GAP-0057)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 14 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-066 · if · MC · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3017 / SF-4234: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 24 pkt12; GAP-3018 / SF-4235: catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf — 10–11 pkt23.2–23.3; GAP-3038 / SF-4267: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 18 pkt8.4.2; GAP-3039 / SF-4268: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 13 pkt5.2; GAP-3044 / SF-4276: catalog/sources/mc-bobil/if-mc-product.html — Kjøreutstyr, bagasje og fastmontert utstyr. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-066].evidence`.

**AFFECTED SCOPE:** Providers if; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["if","mc","ordinary","if-mc-ansvar","2024-03"]; ["if","mc","ordinary","if-mc-delkasko","2024-03"]; ["if","mc","ordinary","if-mc-kasko","2024-03"]. Tilleggskomponenter: if-mc-motor-gir.

**ROOT CAUSE:** RC-042, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / rolle og etteropphør (GAP-3017); Rettshjelp / sum og flerpart (GAP-3018); Nyverdi standard / forutsetninger (GAP-3038); Viktige unntak / vær/slitasje/tuning (GAP-3039); Bagasje og utstyr / web-sum/utstyrstype (GAP-3044); Maskinskade MC / komponenter (GAP-3064)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 13 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-067 · if · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3557 / SF-5091: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 14 pkt5.2.4; GAP-3565 / SF-5099: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 17 pkt6; GAP-3580 / SF-5135: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 7–8 pkt3.1; GAP-3648 / SF-5237: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 21–22 pkt10.1. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-067].evidence`.

**AFFECTED SCOPE:** Providers if; typer Reise; scope ordinary. 3 eksakte produktidentiteter: ["if","reise","ordinary","if-reise-basis","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-standard","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-super","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-043, fra SCRC-040. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Hjemkallelse / omfang (GAP-3557); Evakuering / sum/utløser (GAP-3565); Forsinkelse / transport/overnatting (GAP-3580); Leid transportmiddel / sum/utløser (GAP-3648)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-004.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-068 · if · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3160 / SF-4468: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 3 pkt2; GAP-3161 / SF-4470: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 4 pkt4.1;19 pkt8.5.1; GAP-3165 / SF-4474: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 24 pkt12; GAP-3166 / SF-4475: catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf — 10–11 pkt23.2–23.3; GAP-3181 / SF-4494: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 4–5 pkt4.2/4.5. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-068].evidence`.

**AFFECTED SCOPE:** Providers if; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["if","snøscooter","ordinary","if-snoscooter-ansvar","2024-03"]; ["if","snøscooter","ordinary","if-snoscooter-delkasko","2024-03"]; ["if","snøscooter","ordinary","if-snoscooter-kasko","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-044, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / område (GAP-3160); Ansvar / rettslig mekanisme (GAP-3161); Rettshjelp / rolle og etteropphør (GAP-3165); Rettshjelp / sum og flerpart (GAP-3166); Brann/natur / utløsning (GAP-3181); Fastmontert utstyr/bagasje / sum og samlet mekanisme (GAP-3183); Utstyr/bagasje / web-sum (GAP-3195)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 18 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-069 · if · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3303 / SF-4647: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 3 pkt2; GAP-3304 / SF-4649: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 24 pkt12; GAP-3305 / SF-4650: catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf — 10–11 pkt23.2–23.3; GAP-3307 / SF-4653: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 4–5 pkt4.2/4.5. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-069].evidence`.

**AFFECTED SCOPE:** Providers if; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["if","tilhenger","ordinary","if-tilhenger-delkasko","2024-03"]; ["if","tilhenger","ordinary","if-tilhenger-kasko","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-045, fra SCRC-036. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / område (GAP-3303); Rettshjelp / rolle og etteropphør (GAP-3304); Rettshjelp / sum og flerpart (GAP-3305); Brann/natur / utløsning (GAP-3307)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-070 · sparebank1-fremtind · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5491 / SF-7812: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§1.3s1–2; GAP-5493 / SF-7816: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§2.4s2; GAP-5494 / SF-7817: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§2.5–6s2/4.2s4; GAP-5505 / SF-7829: catalog/sources/boat-pet/fremtind-boat-terms.pdf — PMO380481§1–3s8; GAP-5507 / SF-7831: catalog/sources/boat-pet/fremtind-boat-terms.pdf — FFE003s9–12. Alle 15 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-070].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-delkasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-kasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-toppkasko","2024-06-10"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-046, fra SCRC-058. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ulykke / scope (GAP-5491); Transport / trigger (GAP-5493); Redning / trigger (GAP-5494); Ulykke / limits (GAP-5505); Rettshjelp / limits (GAP-5507); Transport / trigger (GAP-5518); Redning / trigger (GAP-5519); Kasko løsøre/jolle / limits (GAP-5530); Kasko / trigger (GAP-5531); Ferieavbrudd / limits (GAP-5533); Topp løsøre / sum (GAP-5564); Topp ferie / limits (GAP-5565); Motor/seil / coverage (GAP-5567); Motor/seil / deductible_depreciation (GAP-5570); Nyverdi / threshold (GAP-5571)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 15 P1-signaturer / 25 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-071 · sparebank1-fremtind · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5581 / SF-7924: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1; GAP-5590 / SF-7933: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s2; GAP-5592 / SF-7935: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §8s2; GAP-5595 / SF-7938: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — Topp§dekker s3; GAP-5596 / SF-7939: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — Topp§dekker s3. Alle 11 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-071].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: sparebank1-fremtind-hund-bruk; sparebank1-fremtind-hund-liv; sparebank1-fremtind-hund-topp.

**ROOT CAUSE:** RC-047, fra SCRC-059. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / coverage (GAP-5581); Kostnader / excluded (GAP-5590); Egenandel / structure (GAP-5592); Topp allergi / limit_override (GAP-5595); Topp MR/CT / limit_override (GAP-5596); Topp tann / condition (GAP-5597); Topp rehab / duration (GAP-5598); Liv / trigger (GAP-5599); Liv / disappearance (GAP-5602); Bruksverdi / trigger (GAP-5603); Bruksverdi / threshold (GAP-5604)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-009, B-010.

**EXPECTED LEVERAGE:** 11 P1-signaturer / 11 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-072 · sparebank1-fremtind · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-5611 / SF-7958: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s1; GAP-5617 / SF-7965: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s2; GAP-5619 / SF-7967: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §8s2; GAP-5622 / SF-7970: catalog/sources/boat-pet/fremtind-cat-life-terms.pdf — Død/tap s1; GAP-5624 / SF-7972: catalog/sources/boat-pet/fremtind-cat-life-terms.pdf — Død/tap s1. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-072].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","katt","ordinary","sparebank1-fremtind-katt-veterin-r","2025-08-07"]. Tilleggskomponenter: sparebank1-fremtind-katt-liv.

**ROOT CAUSE:** RC-048, fra SCRC-059. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / coverage (GAP-5611); Kostnader / excluded (GAP-5617); Egenandel / structure (GAP-5619); Liv / trigger (GAP-5622); Katt liv / age (GAP-5624); Liv / disappearance (GAP-5625); Liv katt / eligibility (GAP-5628)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-073 · storebrand · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0347 / SF-0653: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side6 (trykt5), 3 og6.1; GAP-0351 / SF-0660: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side27 (trykt26), 12.1–12.3; GAP-0354 / SF-0663: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side30 (trykt29), 13.1–13.3,31; GAP-0355 / SF-0664: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side32 (trykt31), 13.5–13.6; GAP-0359 / SF-0674: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side10 (trykt9), 6.2.2. Alle 28 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-073].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["storebrand","bil","ordinary","sb-bil-ansvar","motor09"]; ["storebrand","bil","ordinary","sb-bil-delkasko","motor09"]; ["storebrand","bil","ordinary","sb-bil-kasko","motor09"]; ["storebrand","bil","ordinary","sb-bil-super","motor09"]. Tilleggskomponenter: sb-leiebil; sb-leiebil-utvidet.

**ROOT CAUSE:** RC-049, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / registrering (GAP-0347); Ulykke / avtale/rolle/sum (GAP-0351); Rettshjelp / rolle/geografi (GAP-0354); Rettshjelp / sum/egenandel (GAP-0355); Tyveri / omfang (GAP-0359); Veihjelp / årsaker (GAP-0364); Veihjelp / hjemtransporttak (GAP-0365); Naturskade / dekning/egenandel (GAP-0367); Bagasje / Bil (GAP-0385); Kasko / egenandel/dyr (GAP-0393); Nyverdi / ordinærpersonbil (GAP-0394); Leiebil / valg/årsaker (GAP-0395); Leiebil / klasse (GAP-0397); Leiebil / reparasjon (GAP-0399); Leiebil / kontant (GAP-0401); Leiebil / totalskade/tyveri (GAP-0403); Nyverdi / Super (GAP-0433); Startleie / Super (GAP-0434); Maskinskade / komponenter (GAP-0435); Maskinskade / unntak (GAP-0436); Maskinskade / årsaksunntak/service (GAP-0437); Bilnøkkel / sum/egenandel (GAP-0438); Bilnøkkel / unntak (GAP-0439)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 23 P1-signaturer / 60 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-074 · storebrand · Bobil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0611 / SF-0999: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side6 (trykt5), 3 og6.1; GAP-0612 / SF-1001: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side9 (trykt8), 6.1; GAP-0616 / SF-1006: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side27 (trykt26), 12.1–12.3; GAP-0619 / SF-1009: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side30 (trykt29), 13.1–13.3,31; GAP-0620 / SF-1010: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side32 (trykt31), 13.5–13.6. Alle 27 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-074].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["storebrand","bobil","ordinary","storebrand-bobil-ansvar","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-delkasko","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-kasko","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-super","motor09"]. Tilleggskomponenter: storebrand-bobil-leiebil; storebrand-bobil-utvidet-leiebil.

**ROOT CAUSE:** RC-050, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / registrering (GAP-0611); Ansvar / sum (GAP-0612); Ulykke / avtale/rolle/sum (GAP-0616); Rettshjelp / rolle/geografi (GAP-0619); Rettshjelp / sum/egenandel (GAP-0620); Brann / årsak/unntak (GAP-0625); Tyveri / omfang (GAP-0626); Tyveri / egenandel (GAP-0627); Veihjelp / årsaker (GAP-0632); Veihjelp / hjemtransporttak (GAP-0633); Kasko / egenandel/dyr (GAP-0660); Leiebil / valg/årsaker (GAP-0661); Leiebil / klasse (GAP-0663); Leiebil / reparasjon (GAP-0665); Leiebil / kontant (GAP-0667); Leiebil / totalskade/tyveri (GAP-0669); Startleie / Super (GAP-0699); Maskinskade / alder/km (GAP-0700); Maskinskade / komponenter (GAP-0701); Maskinskade / unntak (GAP-0702); Maskinskade / årsaksunntak/service (GAP-0703); Bilnøkkel / unntak (GAP-0704)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 22 P1-signaturer / 63 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-075 · storebrand · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0058 / SF-0094: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 16, 9.1 Ansvar; GAP-0059 / SF-0095: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 19, 10.5 og 10.6; GAP-0060 / SF-0096: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 20, 11.2; GAP-0061 / SF-0097: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 6, 4 Forsikrede ting;side7/5.1.1–2;side10/5.3.2;side11/6.10; GAP-0062 / SF-0098: catalog/sources/boat-pet/storebrand-boat-terms.pdf — PDF side 8, 5.1.3 Båtredning, presisering1 og egenandel. Alle 16 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-075].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","båt","ordinary","storebrand-bat-delkasko","2024-09-01"]; ["storebrand","båt","ordinary","storebrand-bat-kasko","2024-09-01"]; ["storebrand","båt","ordinary","storebrand-bat-super","2024-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-051, fra SCRC-003, SCRC-060. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / person- og tingsum (GAP-0058); Rettshjelp / sum og egenandel (GAP-0059); Fører/passasjerulykke / dekning og summer (GAP-0060); Bagasje / sum per hendelse (GAP-0061); Redning / egenandel (GAP-0062); Redning / dekningsmekanisme (GAP-0063); Brann/tyveri / egenandel (GAP-0065); Redning / dekningsmekanisme (GAP-0071); Opplagsutstyr / grense (GAP-0082); Rigg / dekning (GAP-0083); Ferieavbrudd / dagssats og sesong (GAP-0088); Totalskade / ny/brukt og terskel (GAP-0089); Jolle / størrelse og motor (GAP-0090); Unntak / isolert motor og seil (GAP-5637); Bagasje / per gjenstand og unntak (GAP-5648); Transport / vilkår (GAP-5656)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-008.

**EXPECTED LEVERAGE:** 16 P1-signaturer / 35 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-076 · storebrand · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0733 / SF-1165: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 8 (trykt 7), 7/17–20; GAP-0734 / SF-1166: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5; GAP-0739 / SF-1171: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 5 (trykt 4), 6.1.1; GAP-0740 / SF-1172: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 6 (trykt 5), 6.1.2; GAP-0741 / SF-1173: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 6 (trykt 5), 6.1.3 +4. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-076].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","campingvogn","ordinary","storebrand-campingvogn-brann-og-tyveri","2026-03-01"]; ["storebrand","campingvogn","ordinary","storebrand-campingvogn-kasko","2026-03-01"]; ["storebrand","campingvogn","ordinary","storebrand-campingvogn-super","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-052, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fortelt/spikertelt / avgrensning (GAP-0733); Løsøre / sum/pergjenstand (GAP-0734); Brann / omfang/egenandel (GAP-0739); Tyveri / omfang/egenandel (GAP-0740); Veihjelp / nivå/geografi (GAP-0741); Veihjelp / faststed/egenandel (GAP-0742); Frost/snø/utetthet / unntak (GAP-0744); Løsøre / unntak (GAP-0745); Rettshjelp / rolle/geografi (GAP-0749); Rettshjelp / sum (GAP-0750); Kasko / årsaker (GAP-0767); Feriegaranti / Super (GAP-0792); Frost/snø/utetthet / unntak (GAP-0794); Løsøre / unntak (GAP-0795)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 32 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-077 · storebrand · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0139 / SF-0261: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1; GAP-0140 / SF-0262: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.1; GAP-0141 / SF-0263: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.1; GAP-0142 / SF-0264: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1 / 1 – Unntak; GAP-0145 / SF-0267: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 5, B.4.1.3. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-077].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Hund; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","hund","ordinary","storebrand-hund-d-dsfall","2025-02-01"]; ["storebrand","hund","ordinary","storebrand-hund-veterin-r","2025-02-01"]; ["storebrand","hund","ordinary","storebrand-hund-veterin-r-og-d-dsfall","2025-02-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-053, fra SCRC-007. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / medisiner og behandlingsmateriell (GAP-0139); Tenner / ulykke (GAP-0140); Tenner / melketenner/bitt (GAP-0141); Tenner / sykdomsunntak (GAP-0142); Allergi / utredning (GAP-0145); Allergi / behandling og medisiner (GAP-0146); Rehabilitering / sum og vilkår (GAP-0147); Bildediagnostikk / sum og frist (GAP-0148); Veterinær / sykdomskarens (GAP-0152); Forsvinning/tyveri / ventetid og vilkår (GAP-0195); Bruksverdi / erstatningsgrense (GAP-0196); Bruksverdi / alder og engangsgrense (GAP-0197); Bruksverdi / arbeidsevne fremfor avl/utstilling (GAP-0198)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 26 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-078 · storebrand · Hus · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0945 / SF-1459: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 5,6, B.3.1; GAP-0946 / SF-1462: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 6, B.3.3; GAP-0947 / SF-1466: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 7,8, B.4.1; GAP-0948 / SF-1468: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 8, B.4.2; GAP-0949 / SF-1469: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 9, B.4.3. Alle 45 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-078].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","bolig","ordinary","storebrand-hus-standard","2025-08-15"]; ["storebrand","bolig","ordinary","storebrand-hus-super","2025-08-15"]. Tilleggskomponenter: storebrand-hus-utleie.

**ROOT CAUSE:** RC-054, fra SCRC-014. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-hus-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Bygning / omfang (GAP-0945); Hage / areal/omfang (GAP-0946); Brann / omfang (GAP-0947); Elektrisk / omfang (GAP-0948); Snø / omfang (GAP-0949); Snø / eldrebygg/rydding (GAP-0950); Rørbrudd / unntak (GAP-0951); Vann / omfang (GAP-0952); Vann / unntak (GAP-0953); Tyveri / omfang/unntak (GAP-0954); Plutselig / hovedomfang (GAP-0955); Plutselig / unntak (GAP-0956); Psykolog / timer/vilkår (GAP-0957); Natur / omfang/tomt (GAP-0958); Natur / unntak/egenandel (GAP-0959); Oppføring / omfang (GAP-0960); Oppføring / utløser/unntak (GAP-0961); Skadedyr / bekjempelse (GAP-0962); Gnagere / skade/lukt (GAP-0963); Skadedyr / unntak (GAP-0964); Rullestol / sum/krav (GAP-0965); Bokostnader / beregning (GAP-0966); Husleietap / skade (GAP-0967); Fullverdi / krav (GAP-0969); Førsterisiko/andrebygg / verdiøkning (GAP-0970); Kjøpannenbolig / oppgjør (GAP-0972); Påbud / sum/vilkår (GAP-0974); Aldersfradrag / grunnlag (GAP-0977); Egenandel / samordning (GAP-0978); Egenandel / tillegg8000 (GAP-0979); Utleiebruk / bevis/næring (GAP-0980); Ansvar / unntak (GAP-0982); Rettshjelp / sum (GAP-0983); Rettshjelp / omfang (GAP-0984); Rettshjelp / unntak (GAP-0985); Utleie / leietap (GAP-0986); Utleie / skadeverk (GAP-0987); Utleie / frister (GAP-0988); Takvann / omfang/alder (GAP-1028); Dyr/insekter / skade/unntak (GAP-1029); Sopp/råte / bygningsdelunntak (GAP-1030); Sopp/råte / kostunntak (GAP-1031); Håndverker / vilkår (GAP-1032); Håndverker / reklamasjon/feil (GAP-1033); Håndverker / unntak (GAP-1034)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-013.

**EXPECTED LEVERAGE:** 45 P1-signaturer / 83 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-079 · storebrand · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0844 / SF-1303: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 4, B.2; GAP-0845 / SF-1305: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 5, B.3; GAP-0850 / SF-1314: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 5,6, B.3; GAP-0853 / SF-1317: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 6, B.4.1; GAP-0854 / SF-1318: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 6, B.4.1. Alle 28 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-079].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","innbo","ordinary","sb-innbo-standard","innbo09"]; ["storebrand","innbo","ordinary","sb-innbo-super","innbo09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-055, fra SCRC-012. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / midlertidig (GAP-0844); Småbåt / sum/omfang (GAP-0845); Glass/sanitær / brudd (GAP-0850); Brann / omfang (GAP-0853); Brann / alarmegenandel (GAP-0854); Natur / omfang/unntak (GAP-0855); Vann / omfang (GAP-0856); Fellesbod / sum/verdiforskrift (GAP-0858); Sykkel / teknisk/lås (GAP-0861); Tyveri / person/unntak (GAP-0863); Tyveri / egenandel (GAP-0864); Psykolog / timer/vilkår (GAP-0866); Lagring / varighet/årsaker (GAP-0867); Lagring / unntak (GAP-0868); Midlertidig bolig / sum/vilkår (GAP-0870); Tilleggsinnredning / sum/vilkår (GAP-0873); Droneansvar / sum/virkeområde (GAP-0881); Rettshjelp / sum (GAP-0884); Rettshjelp / rolle/geografi (GAP-0885); Uflaks / årsak (GAP-0927); Uflaks / unntak (GAP-0928); Rullestol / sum (GAP-0929); Rullestol / frister (GAP-0930); Flytting / unntak (GAP-0932); Skadedyr / bekjempelse (GAP-0933); Skadedyr / unntak (GAP-0934); ID-tyveri / summer (GAP-0935); ID-tyveri / avgrensning (GAP-0936)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-005.

**EXPECTED LEVERAGE:** 28 P1-signaturer / 47 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-080 · storebrand · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0168 / SF-0297: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1; GAP-0169 / SF-0298: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.1; GAP-0170 / SF-0299: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.1; GAP-0171 / SF-0300: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1 / 1 – Unntak; GAP-0173 / SF-0302: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 5, B.4.1.3. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-080].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Katt; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","katt","ordinary","storebrand-katt-d-dsfall","2025-02-01"]; ["storebrand","katt","ordinary","storebrand-katt-veterin-r","2025-02-01"]; ["storebrand","katt","ordinary","storebrand-katt-veterin-r-og-d-dsfall","2025-02-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-056, fra SCRC-007. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / medisiner og behandlingsmateriell (GAP-0168); Tenner / ulykke (GAP-0169); Tenner / melketenner/bitt (GAP-0170); Tenner / sykdomsunntak (GAP-0171); Allergi / utredning (GAP-0173); Allergi / behandling og medisiner (GAP-0174); Rehabilitering / sum og vilkår (GAP-0175); Bildediagnostikk / sum og frist (GAP-0176); Veterinær / sykdomskarens (GAP-0179); Forsvinning/tyveri / ventetid og vilkår (GAP-0240)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-081 · storebrand · MC · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0541 / SF-0902: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side6 (trykt5), 3 og6.1; GAP-0542 / SF-0904: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side9 (trykt8), 6.1; GAP-0546 / SF-0909: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side27 (trykt26), 12.1–12.3; GAP-0549 / SF-0912: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side30 (trykt29), 13.1–13.3,31; GAP-0550 / SF-0913: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side32 (trykt31), 13.5–13.6. Alle 11 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-081].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","mc","ordinary","storebrand-mc-ansvar","motor09"]; ["storebrand","mc","ordinary","storebrand-mc-delkasko","motor09"]; ["storebrand","mc","ordinary","storebrand-mc-kasko","motor09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-057, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / registrering (GAP-0541); Ansvar / sum (GAP-0542); Ulykke / avtale/rolle/sum (GAP-0546); Rettshjelp / rolle/geografi (GAP-0549); Rettshjelp / sum/egenandel (GAP-0550); Brann / årsak/unntak (GAP-0558); Tyveri / omfang (GAP-0559); Tyveri / egenandel (GAP-0560); Veihjelp / årsaker (GAP-0563); Veihjelp / hjemtransporttak (GAP-0564); Kasko / egenandel/dyr (GAP-0593)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 11 P1-signaturer / 26 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-082 · storebrand · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-1044 / SF-1612: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 2,4, A/B.1+HTML+IPID1; GAP-1045 / SF-1614: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 4, B.1.1; GAP-1046 / SF-1615: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 4,5, B.1.2–3; GAP-1047 / SF-1616: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 5, B.1.3; GAP-1048 / SF-1617: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 5, B.1.3.6. Alle 47 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-082].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Reise; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]; ["storebrand","reise","ordinary","storebrand-reise-super","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-058, fra SCRC-015. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Varighet / standard/valg (GAP-1044); Personkrets / familie (GAP-1045); Geografi / hverdagsreise (GAP-1046); Geografi / risikoreiser (GAP-1047); Sykkeltyveri / lokalområde (GAP-1048); Avbestilling / ventetid (GAP-1050); Avbestilling / arrangement (GAP-1051); Avbestilling / sykdomspersonkrets (GAP-1052); Avbestilling / andreutløsere (GAP-1053); Avbestilling / utgiftsunntak (GAP-1054); Avbestilling / årsaksunntak (GAP-1055); Forsinkelse / mistettransport (GAP-1056); Forsinkelse / vilkår/unntak (GAP-1058); Bagasjeforsinkelse / sum/utløser (GAP-1059); Reisegods / omfang (GAP-1060); Reisegods / årsaker (GAP-1061); Reisegods / skadeunntak (GAP-1062); Reisegods / gjenstandsunntak (GAP-1063); Reisegods / sikkerhet (GAP-1064); Reisegods / aldersfradrag (GAP-1065); Reisesyke / sum/tid (GAP-1067); Hjemtransport / vilkår (GAP-1069); Hjemkallelse / vilkår (GAP-1070); Tilkallelse / krets/utløser (GAP-1071); Ledsagelse / omfang (GAP-1072); Reiseavbrudd / sum/vilkår (GAP-1074); Reisesyke / utgiftsunntak (GAP-1078); Reisesyke / aktivitetsunntak (GAP-1079); Reisesyke / godkjenning (GAP-1080); Ulykke / gyldighet (GAP-1081); Ulykke / behandling (GAP-1082); Ulykke / unntak (GAP-1083); Evakuering / omfang (GAP-1085); Evakuering / avbrudd/unntak (GAP-1086); Skadeinsekter / sum/egenandel (GAP-1087); Ansvar / sum/geografi (GAP-1089); Ansvar / unntak (GAP-1090); Rettshjelp / sum/geografi (GAP-1091); Rettshjelp / utløser/unntak (GAP-1092); Rettshjelp / egenandel (GAP-1093); Forsinkelse / avgang (GAP-1109); Leiebilegenandel / omfang (GAP-1141); Leiebilegenandel / unntak (GAP-1142); Uhell / sum/utløser (GAP-1144); Kjæledyr / sum/vilkår (GAP-1145); Taptreise / hotellarrangement (GAP-1146); Taptreise / leiebil (GAP-1147)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-019, B-021.

**EXPECTED LEVERAGE:** 47 P1-signaturer / 87 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-083 · storebrand · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0467 / SF-0817: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side6 (trykt5), 3 og6.1; GAP-0468 / SF-0818: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side6 (trykt5), 4; GAP-0469 / SF-0819: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side9 (trykt8), 6.1; GAP-0473 / SF-0824: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side27 (trykt26), 12.1–12.3; GAP-0476 / SF-0827: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side30 (trykt29), 13.1–13.3,31. Alle 17 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-083].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","snøscooter","ordinary","storebrand-snoscooter-ansvar","2025-04-01"]; ["storebrand","snøscooter","ordinary","storebrand-snoscooter-delkasko","2025-04-01"]; ["storebrand","snøscooter","ordinary","storebrand-snoscooter-kasko","2025-04-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-059, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / registrering (GAP-0467); Geografi / hovedregel (GAP-0468); Ansvar / sum (GAP-0469); Ulykke / avtale/rolle/sum (GAP-0473); Rettshjelp / rolle/geografi (GAP-0476); Rettshjelp / sum/egenandel (GAP-0477); Brann / årsak/unntak (GAP-0484); Brann / egenandel (GAP-0485); Tyveri / omfang (GAP-0486); Tyveri / egenandel (GAP-0487); Sikkerhetsutstyr / MC/Snøscooter (GAP-0489); Fastmontert utstyr / sum/relativt tak (GAP-0490); Glass / tak/egenandel (GAP-0493); Naturskade / dekning/egenandel (GAP-0494); Ulykke / avtale/rolle/sum (GAP-0502); Kasko / årsaker (GAP-0524); Kasko / egenandel/dyr (GAP-0525)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 17 P1-signaturer / 36 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-084 · storebrand · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0810 / SF-1259: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 5 (trykt 4), 6.1.1; GAP-0811 / SF-1260: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 6 (trykt 5), 6.1.2; GAP-0812 / SF-1261: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 6 (trykt 5), 6.1.3 +4; GAP-0818 / SF-1269: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 12 (trykt 11), 10.1–10.3,13; GAP-0819 / SF-1270: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 14 (trykt 13), 10.5. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-084].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","tilhenger","ordinary","storebrand-tilhenger-brann-og-tyveri","2026-03-01"]; ["storebrand","tilhenger","ordinary","storebrand-tilhenger-kasko","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-060, fra SCRC-011. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Brann / omfang/egenandel (GAP-0810); Tyveri / omfang/egenandel (GAP-0811); Veihjelp / nivå/geografi (GAP-0812); Rettshjelp / rolle/geografi (GAP-0818); Rettshjelp / sum (GAP-0819); Kasko / årsaker (GAP-0832)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 11 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-085 · tryg · Bil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3907 / SF-5549: catalog/sources/tryg/hus/05PGE91500.pdf — 5 §6.2; GAP-3908 / SF-5550: catalog/sources/tryg/hus/05PGE91500.pdf — 1 §3.1;2–3 §5.3; GAP-3922 / SF-5580: catalog/sources/tryg/Bilforsikring-Delkasko.pdf — 2–3§3.2; GAP-3936 / SF-5610: catalog/sources/tryg/Bilforsikring-Kasko.pdf — 3§3.2; GAP-3942 / SF-5624: catalog/sources/tryg/Bilforsikring-BilEkstra.pdf — 1 §1. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-085].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Bil; scope ordinary. 3 eksakte produktidentiteter: ["tryg","bil","ordinary","bil-ansvar","PAU25003"]; ["tryg","bil","ordinary","bil-delkasko","PAU25835"]; ["tryg","bil","ordinary","bil-kasko","PAU25205"]. Tilleggskomponenter: bil-ekstra; elbil-ekstra; maskinskade.

**ROOT CAUSE:** RC-061, fra SCRC-043. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / egenandel (GAP-3907); Rettshjelp / område/rolle (GAP-3908); Garanti / reparasjon (GAP-3922); Leiebil / kondemnasjon/tyveri (GAP-3942); Maskinskade / unntak (GAP-3949)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 11 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-086 · tryg · Bobil · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4029 / SF-5773: catalog/sources/tryg/hus/05PGE91500.pdf — 2–5 §5.3/6; GAP-4030 / SF-5774: catalog/sources/tryg/hus/05PGE91500.pdf — 2–4 §5.3/5.5; GAP-4039 / SF-5791: catalog/sources/mc-bobil/tryg-05PAU25335.pdf — 1§2.2; GAP-4056 / SF-5819: catalog/sources/mc-bobil/tryg-05PAU25305.pdf — 2§2.3; GAP-4040 / SF-5793: catalog/sources/mc-bobil/tryg-05PAU25335.pdf — 1–2§2.4. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-086].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["tryg","bobil","ordinary","tryg-bobil-ansvar","2026-07-01"]; ["tryg","bobil","ordinary","tryg-bobil-bobil-ekstra","2026-07-01"]; ["tryg","bobil","ordinary","tryg-bobil-delkasko","2026-01-01"]; ["tryg","bobil","ordinary","tryg-bobil-kasko","2026-01-01"]. Tilleggskomponenter: tryg-bobil-maskinskade.

**ROOT CAUSE:** RC-062, fra SCRC-044. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum/egenandel (GAP-4029); Rettshjelp / hovedunntak (GAP-4030); Tyveri / fortelt/rental (GAP-4039); Redning / utløsere (GAP-4040); Oppgjør / form (GAP-4042); Verkstedgaranti / varighet (GAP-4043); Dyr/vær / egenandel (GAP-4062); Maskinskade / komponenter/unntak (GAP-4064); Fukt / vilkår/unntak (GAP-4082); Fukt / Avara alternativ (GAP-4084)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 26 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-087 · tryg · Båt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4254 / SF-6091: catalog/sources/boat-pet/tryg-boat-inboard-terms.pdf — 1 §3; GAP-4258 / SF-6096: catalog/sources/boat-pet/tryg-boat-accident-terms.pdf — 1 §1/2; GAP-4261 / SF-6101: catalog/sources/tryg/hus/05PGE91500.pdf — 2–5 §5.3/6; GAP-4267 / SF-6108: catalog/sources/boat-pet/tryg-boat-ipid.pdf — 1; GAP-4279 / SF-6123: catalog/sources/boat-pet/tryg-boat-ipid.pdf — 1. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-087].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Båt; scope ordinary. 5 eksakte produktidentiteter: ["tryg","båt","ordinary","tryg-bat-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-bat-ekstra","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-tyveri-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-kasko-ansvar","2024-07-01"]. Tilleggskomponenter: tryg-bat-maskinskade; tryg-bat-ulykke.

**ROOT CAUSE:** RC-063, fra SCRC-046. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / omfang (GAP-4254); Ulykke / valgfri/rolle (GAP-4258); Rettshjelp / sum/egenandel (GAP-4261); Brann / utløser (GAP-4267); Tyveri / utløser (GAP-4279); Redning / assistanse (GAP-4296); Maskinskade / utløser/omfang (GAP-4298); Maskinskade / egenandel (GAP-4299); Maskinskade / unntak (GAP-4300); Ekstra / egenandelreduksjon (GAP-4317); Småbåt/motor / grenser (GAP-4321); Transport/opphold/hjemreise / utløser (GAP-4322); Ferieavbrudd / beløp/tid/utløser (GAP-4323); Transport/ferie / samlettak (GAP-4324)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 35 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-088 · tryg · Campingvogn · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4136 / SF-5932: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — 1 §1.1;naturskade; GAP-4151 / SF-5952: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — 1 §1.1;naturskade; GAP-4168 / SF-5975: catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf — 1 §1.1;naturskade; GAP-4137 / SF-5933: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — 1 §1.1;siste §3.4; GAP-4152 / SF-5953: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — 1 §1.1;siste §3.4. Alle 21 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-088].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Campingvogn; scope ordinary. 4 eksakte produktidentiteter: ["tryg","campingvogn","ordinary","tryg-campingvogn-brann","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-brann-og-tyveri","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-campingvogn-ekstra","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-064, fra SCRC-045. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fortelt/terrasse / omfang (GAP-4136); Løsøre / grense/egenandel (GAP-4137); Brann / egenandel (GAP-4138); Naturskade / omfang/egenandel (GAP-4139); Rettshjelp / sum/egenandel (GAP-4146); Tyveri / egenandel/omfang (GAP-4154); Glass / egenandel (GAP-4177); Tyveri / forteltunntak (GAP-4190); Skadedyr / omfang (GAP-4203); Fukt / vilkår/unntak (GAP-4204); Ferieavbrudd / sum/tid/vilkår (GAP-4205)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 11 P1-signaturer / 26 forekomster; 3 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-089 · tryg · Hund · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0001 / SF-0001: catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf — PDF side 1, 3 Egenandel; GAP-0002 / SF-0002: catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf — PDF side 2, 4 Erstatningsberegning; GAP-0003 / SF-0004: catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf — PDF side 1, 3 Utgifter; GAP-0006 / SF-0008: catalog/sources/boat-pet/tryg-dog-product-terms.pdf — PDF side 1, 4 Varighet; GAP-0009 / SF-0014: catalog/sources/boat-pet/tryg-dog-life-terms.pdf — PDF side 2, 3 Erstatning. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-089].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["tryg","hund","ordinary","tryg-hund-behandling","2026-09-01"]. Tilleggskomponenter: tryg-hund-dod; tryg-hund-ekstra.

**ROOT CAUSE:** RC-065, fra SCRC-001, SCRC-047. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / egenandel per sykdom/ulykke (GAP-0001); Veterinær / sumperioder (GAP-0002); Diagnostikk / CT og MR (GAP-0003); Veterinær / opphør (GAP-0006); Liv / aldersreduksjon (GAP-0009); Tenner / ulykkesskade (GAP-4341); Fødselshjelp / kvalifikasjon (GAP-4342); Rehabilitering / unavailable (GAP-4345); Tenner / vilkår (GAP-4350); Liv / tilvalg/utløser (GAP-4352); Liv / leddvilkår (GAP-4353); Liv / opphør (GAP-4360)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-090 · tryg · Innbo · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4395 / SF-6251: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s2 §1.2,s5–6 §3; Ekstra s2,6; GAP-4424 / SF-6292: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s2 §1.2,s5–6 §3; Ekstra s2,6; exact Ekstra clause controls; GAP-4396 / SF-6252: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s2 §1.2; Ekstra s2; GAP-4425 / SF-6293: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s2 §1.2; Ekstra s2; exact Ekstra clause controls; GAP-4400 / SF-6256: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s3 §2.3; Ekstra s3. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-090].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo","2026-07-01"]; ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-066, fra SCRC-048. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Midlertidig bosted / sum_duration_conditions (GAP-4395); Leietakers påkostning / sum_trigger (GAP-4396); Vann / covered_triggers (GAP-4400); Vann / level_specific (GAP-4401); Andre skader / deductibles (GAP-4407); Plutselig uforutsett skade / conditions_exclusions (GAP-4436); Plutselig uforutsett skade / deductible (GAP-4437); Skadedyr / sum_scope (GAP-4438)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-011, B-015.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-091 · tryg · Katt · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-0010 / SF-0016: catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf — PDF side 1, 3 Egenandel; GAP-0011 / SF-0017: catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf — PDF side 2, 4 Erstatningsberegning; GAP-0012 / SF-0019: catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf — PDF side 1, 3 Utgifter; GAP-0015 / SF-0023: catalog/sources/boat-pet/tryg-dog-product-terms.pdf — PDF side 1, 4 Varighet; GAP-0018 / SF-0029: catalog/sources/boat-pet/tryg-cat-life-terms.pdf — PDF side 1, 3 Erstatning. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-091].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["tryg","katt","ordinary","tryg-katt-behandling","2026-09-01"]. Tilleggskomponenter: tryg-katt-dod; tryg-katt-ekstra.

**ROOT CAUSE:** RC-067, fra SCRC-001, SCRC-047. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veterinær / egenandel per sykdom/ulykke (GAP-0010); Veterinær / sumperioder (GAP-0011); Diagnostikk / CT og MR (GAP-0012); Veterinær / opphør (GAP-0015); Liv / aldersreduksjon (GAP-0018); Tannresorpsjon / årlig undergrense (GAP-0019); Tenner / ulykkesskade (GAP-4369); Fødselshjelp / kvalifikasjon (GAP-4370); Tenner / vilkår (GAP-4377); Liv / tilvalg/utløser (GAP-4379); Liv / leddvilkår (GAP-4380); Liv / opphør (GAP-4385)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 12 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-092 · tryg · MC · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-3960 / SF-5670: catalog/sources/tryg/hus/05PGE91500.pdf — 2–5 §5.3/6; GAP-3961 / SF-5671: catalog/sources/tryg/hus/05PGE91500.pdf — 2–4 §5.3/5.5; GAP-3972 / SF-5688: catalog/sources/mc-bobil/tryg-05PAU25935.pdf — 1–2§2.4; GAP-3990 / SF-5713: catalog/sources/mc-bobil/tryg-05PAU25405.pdf — 2§2.5; GAP-3974 / SF-5690: catalog/sources/mc-bobil/tryg-05PAU25935.pdf — 2–3§3. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-092].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer MC; scope ordinary. 4 eksakte produktidentiteter: ["tryg","mc","ordinary","tryg-mc-ansvar","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-delkasko","2026-01-01"]; ["tryg","mc","ordinary","tryg-mc-kasko","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-mc-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-068, fra SCRC-044. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum/egenandel (GAP-3960); Rettshjelp / hovedunntak (GAP-3961); Redning / utløsere (GAP-3972); Oppgjør / form (GAP-3974); Verkstedgaranti / varighet (GAP-3975); Tyverialarm / egenandel (GAP-3977)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-093 · tryg · Reise · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4466 / SF-6433: catalog/sources/tryg/reise/canonical/IPID-Reiseforsikring.pdf — s1;webFAQ; GAP-4467 / SF-6435: catalog/sources/tryg/reise/canonical/Reiseforsikring-produktside.html — FAQhvorlenge; GAP-4468 / SF-6438: catalog/sources/tryg/reise/canonical/PRF46000-Produktvilkar.pdf — s2§4;PRF46001s1§2.1; GAP-4470 / SF-6441: catalog/sources/tryg/reise/canonical/PRF46001-Reise-Reise-Ekstra.pdf — s2§2; GAP-4519 / SF-6533: catalog/sources/tryg/reise/canonical/PRF46003-Reise-Premium.pdf — s2§2. Alle 19 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-093].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Reise; scope ordinary. 3 eksakte produktidentiteter: ["tryg","reise","ordinary","tryg-reise","2026-09-20-canonical"]; ["tryg","reise","ordinary","tryg-reise-ekstra","2026-09-20-canonical"]; ["tryg","reise","ordinary","tryg-reise-premium","2026-09-20-canonical"]. Tilleggskomponenter: tryg-reise-ulykke; tryg-reise-ulykke-ekstra.

**ROOT CAUSE:** RC-069, fra SCRC-050. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / eligibility (GAP-4466); Reiselengde / optional_extension (GAP-4467); Avbestilling / timing (GAP-4468); Avbestilling / exclusions (GAP-4470); Reisegods / scope (GAP-4473); Reisesyke / exclusions (GAP-4479); Ulykke / threshold_death (GAP-4483); Ulykke / exclusions (GAP-4484); Ulykke / occupation (GAP-4485); Tryg Legehjelp / service (GAP-4507)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 28 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-094 · tryg · Snøscooter · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4094 / SF-5880: catalog/sources/vehicle-extensions/tryg-odpdf-2001c3a6.pdf — 1–2; GAP-4095 / SF-5881: catalog/sources/vehicle-extensions/tryg-odpdf-56716918.pdf — 1–2; GAP-4098 / SF-5884: catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf — §5.3/6; GAP-4104 / SF-5893: catalog/sources/vehicle-extensions/tryg-odpdf-0d60de94.pdf — 1 §1; GAP-4120 / SF-5912: catalog/sources/vehicle-extensions/tryg-odpdf-5a0a847f.pdf — 1 §1. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-094].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["tryg","snøscooter","ordinary","tryg-snoscooter-ansvar",null]; ["tryg","snøscooter","ordinary","tryg-snoscooter-brann-og-tyveri",null]; ["tryg","snøscooter","ordinary","tryg-snoscooter-kasko",null]. Tilleggskomponenter: tryg-snoscooter-forerulykke; tryg-snoscooter-ulykke.

**ROOT CAUSE:** RC-070, fra SCRC-045. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Førerulykke / valgfri/sum (GAP-4094); Rettshjelp / sum/egenandel (GAP-4098); Utstyr / sum/omfang (GAP-4104); Brann/tyveri / sum/egenandel (GAP-4105); Redning / unavailable (GAP-4106); Kasko / omfang (GAP-4122)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 15 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-095 · tryg · Tilhenger · ordinary: Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler

**PURPOSE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**EVIDENCE:** GAP-4211 / SF-6032: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — 1 §2.1; GAP-4224 / SF-6051: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — 1 §2.1; GAP-4239 / SF-6072: catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf — 2 §2.2; GAP-4219 / SF-6042: catalog/sources/vehicle-extensions/tryg-odpdf-d8d47def.pdf — §5.3/6; GAP-4225 / SF-6052: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — 1–2 §2.2. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-095].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Tilhenger; scope ordinary. 3 eksakte produktidentiteter: ["tryg","tilhenger","ordinary","tryg-tilhenger-brann","2026-01-01"]; ["tryg","tilhenger","ordinary","tryg-tilhenger-brann-og-tyveri","2026-01-01"]; ["tryg","tilhenger","ordinary","tryg-tilhenger-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-071, fra SCRC-045. Lag: CATALOG_DATA.

**WHAT MUST CHANGE:** Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** IMPLEMENTATION_READY. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; DATA_BATCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Brann / egenandel (GAP-4211); Rettshjelp / sum/egenandel (GAP-4219); Tyveri / egenandel/omfang (GAP-4225)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL HIGH.

## B-096 · eika-fremtind · Campingvogn · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5303 / SF-7562: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§3.2s2; GAP-5320 / SF-7580: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Kasko§1.2s4–5. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-096].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-kasko","2024-03-21"]; ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-minikasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-001, fra SCRC-056. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Nyverdi / conditions (GAP-5303); Ferieavbrudd / limits (GAP-5320)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-122, CR-126.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-097 · eika-fremtind · Campingvogn · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5305 / SF-7564: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§3.5.3–4s3; GAP-5306 / SF-7565: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§3.5.4s3; GAP-5307 / SF-7566: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§4.1s4. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-097].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-kasko","2024-03-21"]; ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-minikasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-001, fra SCRC-056. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Aldersfradrag / objects (GAP-5305); Tilbygg / rigging (GAP-5306); Alarm / deductible (GAP-5307)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-114, CR-116, CR-134.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-098 · eika-fremtind · Snøscooter · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5262 / SF-7512: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — FMO001§1–2s1–2snø/s2–3MC; GAP-5263 / SF-7513: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — FMO002§1–2s2snø/s3MC; GAP-5276 / SF-7530: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — Mini§2.4.2s5/4.3s7snø/s6/8MC. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-098].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-ansvar","2023-10-29"]; ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-kasko","2023-10-29"]; ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-minikasko","2023-10-29"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-002, fra SCRC-056. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / limits (GAP-5262); Ulykke / sums (GAP-5263); Redning kjøretøy / scope (GAP-5276)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-414, CR-434, CR-443.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-099 · eika-fremtind · Snøscooter · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5277 / SF-7531: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — Mini§2.4.2s5snø/s6MC;IPID; GAP-5280 / SF-7534: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf — Mini§4.1s7snø/s8MC. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-099].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Snøscooter; scope ordinary. 2 eksakte produktidentiteter: ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-kasko","2023-10-29"]; ["eika-fremtind","snøscooter","ordinary","eika-fremtind-snoscooter-minikasko","2023-10-29"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-002, fra SCRC-056. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Feilfylling / limits (GAP-5277); Alarm / deductible (GAP-5280)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-412, CR-421.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-100 · eika-fremtind · Tilhenger · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5326 / SF-7588: catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf — Mini§3.2s2. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-100].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Tilhenger; scope ordinary. 1 eksakte produktidentiteter: ["eika-fremtind","tilhenger","ordinary","eika-fremtind-tilhenger-kasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-003, fra SCRC-056. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Nyverdi / conditions (GAP-5326)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-458.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-101 · fremtind · Bobil · ordinary-dnb: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5403 / SF-7694: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5§2.4.1; GAP-5446 / SF-7747: catalog/sources/sparebank1-fremtind/Vilkar_maskinskade.pdf — s1§2.1. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-101].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Bobil; scope ordinary-dnb. 3 eksakte produktidentiteter: ["fremtind","bobil","ordinary-dnb","fremtind-bobil-kasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-minikasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-topp","2025-09-18"]. Tilleggskomponenter: fremtind-bobil-maskinskade.

**ROOT CAUSE:** RC-004, fra SCRC-057. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Redning leiebil / conditional (GAP-5403); Maskinskade / battery_deduction (GAP-5446)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-048, CR-051.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 5 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-102 · fremtind · Hus · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5091 / SF-7285: catalog/sources/fremtind/hus/canonical/Vilkar_Topp_Hus.pdf — Standard §5.3 s6. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-102].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["fremtind","bolig","ordinary","fremtind-hus-standard","PBK-200.100-015+PBK-200.200-010"]; ["fremtind","bolig","ordinary","fremtind-hus-topp","PBK-200.100-015+PBK-200.200-010"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-005, fra SCRC-053. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Aldersfradrag / trigger (GAP-5091)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-002, CR-222.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-103 · fremtind · Innbo · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5001 / SF-7176: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — §1s1; GAP-5033 / SF-7214: catalog/sources/fremtind/innbo/canonical/Vilkar_Topp_Innbo.pdf — §1s1; GAP-5009 / SF-7188: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — §3.2s2; GAP-5041 / SF-7226: catalog/sources/fremtind/innbo/canonical/Vilkar_Topp_Innbo.pdf — §3.2s2; GAP-5022 / SF-7202: catalog/sources/fremtind/innbo/canonical/Vilkar_Standard_Innbo.pdf — Standard§5.3.1s5;Topp§5.3.1s7. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-103].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["fremtind","innbo","ordinary","fremtind-innbo-standard","2025-01-01"]; ["fremtind","innbo","ordinary","fremtind-innbo-topp","2025-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-006, fra SCRC-052. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / eligibility (GAP-5001); Merutgifter / removal (GAP-5009); Aldersfradrag / table (GAP-5022); Yrkesskade / limits (GAP-5026)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-245, CR-263, CR-264, CR-281.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-104 · fremtind · MC · ordinary-sparebank1: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5345 / SF-7617: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — Mini§2.4.2s5snø/s6MC;IPID; GAP-5348 / SF-7620: catalog/sources/mc-bobil/fremtind-mc-terms.pdf — Mini§4.1s7snø/s8MC. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-104].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer MC; scope ordinary-sparebank1. 2 eksakte produktidentiteter: ["fremtind","mc","ordinary-sparebank1","fremtind-mc-delkasko",null]; ["fremtind","mc","ordinary-sparebank1","fremtind-mc-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-007, fra SCRC-056. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Feilfylling / limits (GAP-5345); Alarm / deductible (GAP-5348)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-023, CR-343, CR-352.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-105 · fremtind · Reise · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5147 / SF-7371: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §4 s2; GAP-5149 / SF-7373: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §7.1 s3; GAP-5151 / SF-7375: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §7.1 s3; GAP-5155 / SF-7381: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §7.5.1 s4; GAP-5160 / SF-7390: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — §10.1 s7. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-105].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["fremtind","reise","ordinary","fremtind-reise","PRE-450.200-015"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-008, fra SCRC-054. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Generelle unntak / risk (GAP-5147); Reisegods / sublimits (GAP-5149); Reisegods / excluded_objects (GAP-5151); Aldersfradrag / table (GAP-5155); Psykolog / sum (GAP-5160); Innhenting etter sykdom / sum (GAP-5161); Eneste medreisende / sum (GAP-5163); Ulykke / other_exclusions (GAP-5170)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-017, CR-371, CR-376, CR-384, CR-387, CR-391, CR-396, CR-397, CR-409.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-106 · fremtind-four-bil-ids · Bil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-4543 / SF-6578: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s1§5; GAP-4572 / SF-6614: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5§2.4.1; GAP-4656 / SF-6724: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s1§5; GAP-4685 / SF-6760: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5§2.4.1; GAP-4769 / SF-6870: catalog/sources/sparebank1-fremtind/Vilkar_ansvar_bil.pdf — s1§5. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-106].evidence`.

**AFFECTED SCOPE:** Providers dnb-fremtind, eika-fremtind, fremtind, sparebank1-fremtind; typer Bil; scope ordinary. 16 eksakte produktidentiteter: ["dnb-fremtind","bil","ordinary","dnb-bil-ansvar","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-delkasko","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-kasko","PMO-357.001-004"]; ["dnb-fremtind","bil","ordinary","dnb-bil-topp","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-ansvar","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-delkasko","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-kasko","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-topp","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-ansvar","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-delkasko","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-kasko","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-topp","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-ansvar","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-delkasko","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-kasko","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-toppkasko","PMO-357.001-004"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-009, fra SCRC-051. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avregistrering / transition (GAP-4543); Redning leiebil / conditional (GAP-4572); Avregistrering / transition (GAP-4656); Redning leiebil / conditional (GAP-4685); Avregistrering / transition (GAP-4769); Redning leiebil / conditional (GAP-4798); Avregistrering / transition (GAP-4882); Redning leiebil / conditional (GAP-4911)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-003, CR-024.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 28 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-107 · frende · Bil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1305 / SF-1929: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside9,11punkt11.11/13.2; GAP-1310 / SF-1934: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside10punkt12.1; GAP-1312 / SF-1937: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11punkt12.4; GAP-1317 / SF-1943: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside13,14punkt16; GAP-1325 / SF-1953: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside2punkt3.2–3. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-107].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["frende","bil","ordinary","frende-bil-ansvar","2026-01-01"]; ["frende","bil","ordinary","frende-bil-delkasko","2026-01-01"]; ["frende","bil","ordinary","frende-bil-kasko","2026-01-01"]; ["frende","bil","ordinary","frende-bil-utvidet","2026-01-01"]. Tilleggskomponenter: frende-maskinskade.

**ROOT CAUSE:** RC-010, fra SCRC-017. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-1305); Ulykke / scope (GAP-1310); Ulykke / unntak (GAP-1312); Bruksbegrensninger / aktivitet (GAP-1317); Utstyr / hjul (GAP-1325); Elbil / batteri/ladekabel (GAP-1326); Utstyr / sikkerhet (GAP-1327); Kontanter / unntak (GAP-1329); Hjemtransport / personer (GAP-1333); Hjemtransport / kjøretøy (GAP-1334); Kasko / unntak (GAP-1371); Maskinskade / oppgjør (GAP-1376); Egenandel / dyr (GAP-1382)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-006, CR-005, CR-006, CR-009, CR-010, CR-015, CR-016, CR-017, CR-018, CR-021, CR-030, CR-031, CR-032, CR-033.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 40 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-108 · frende · Bobil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1523 / SF-2232: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDF9punkt11.11; GAP-1533 / SF-2258: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside9,11punkt11.11/13.2; GAP-1540 / SF-2266: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11punkt12.4; GAP-1545 / SF-2272: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside13,14punkt16; GAP-1549 / SF-2278: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside2punkt3.2–3. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-108].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["frende","bobil","ordinary","frende-bobil-ansvar","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-delkasko","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-kasko","2026-01-01"]; ["frende","bobil","ordinary","frende-bobil-utvidet","2026-01-01"]. Tilleggskomponenter: frende-bobil-maskinskade.

**ROOT CAUSE:** RC-011, fra SCRC-019. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utleie / tilleggsegenandel (GAP-1523); Egenandel / ungfører (GAP-1533); Ulykke / unntak (GAP-1540); Bruksbegrensninger / aktivitet (GAP-1545); Utstyr / hjul (GAP-1549); Elbil / batteri/ladekabel (GAP-1550); Utstyr / sikkerhet (GAP-1551); Kontanter / unntak (GAP-1552); Maskinskade / oppgjør (GAP-1589); Egenandel / dyr (GAP-1594)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-038, CR-039, CR-040, CR-041, CR-045, CR-049, CR-056, CR-058, CR-060, CR-061.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 31 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-109 · frende · Båt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-1255 / SF-1869: catalog/sources/boat-pet/frende-boat-terms.pdf — PDFside5 punkt7.5. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-109].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Båt; scope ordinary. 1 eksakte produktidentiteter: ["frende","båt","ordinary","frende-bat-utvidet","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-012, fra SCRC-003. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Totalskadegaranti / sikkertomfang/alder (GAP-1255)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-095.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-110 · frende · Båt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1158 / SF-1755: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 2, punkt 3; GAP-1162 / SF-1761: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 6, punkt 10.3–4; GAP-1163 / SF-1762: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 7, punkt 10.5; GAP-1164 / SF-1763: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 7, punkt 10.6; GAP-1165 / SF-1765: catalog/sources/boat-pet/frende-boat-terms.pdf — PDF side 7, punkt 10.7. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-110].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["frende","båt","ordinary","frende-bat-brann-og-tyveri","2026-01-01"]; ["frende","båt","ordinary","frende-bat-kasko","2026-01-01"]; ["frende","båt","ordinary","frende-bat-utvidet","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-012, fra SCRC-003. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utstyrsavgrensning / unntak (GAP-1158); Oppgjør / kontant (GAP-1162); Oppgjør / totaltap (GAP-1163); Aldersfradrag / tabell (GAP-1164); Egenandel / ung/vinter (GAP-1165); Egenandel / tyverifritak (GAP-1166); Bruk / utleiekonkurranse (GAP-1176); Sikkerhet / vinter/fortøyning (GAP-1177); Tegning / HTML (GAP-1180); Ferieavbrudd / sum/vilkår (GAP-1235)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-062, CR-065, CR-070, CR-071, CR-072, CR-083, CR-084, CR-090, CR-093, CR-111.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 28 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-111 · frende · Campingvogn · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-1737 / SF-2525: catalog/sources/vehicle-extensions/frende-campingvognforsikring.html — HTML FAQ egenandel; GAP-1738 / SF-2526: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF9 §11.11. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-111].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["frende","campingvogn","ordinary","frende-campingvogn-brann-og-tyveri","2026-01-01"]; ["frende","campingvogn","ordinary","frende-campingvogn-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-013, fra SCRC-021. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / valgbare nivåer (GAP-1737); Utleie / ekstra egenandel (GAP-1738)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-120, CR-140.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-112 · frende · Campingvogn · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0118 / SF-0198: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF side 9, 11.11 Utleid bobil/campingvogn; GAP-1731 / SF-2515: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF 7–8 §11.6; GAP-1732 / SF-2516: catalog/sources/vehicle-extensions/frende-CaravanInsurance.pdf — PDF 13–14 §16. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-112].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["frende","campingvogn","ordinary","frende-campingvogn-brann-og-tyveri","2026-01-01"]; ["frende","campingvogn","ordinary","frende-campingvogn-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-013, fra SCRC-004, SCRC-021. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utleie / tilleggsegenandel (GAP-0118); Oppgjør / markedsverdi/tap (GAP-1731); Bruksbegrensninger / aktivitet (GAP-1732)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-119, CR-128, CR-141.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-113 · frende · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1256 / SF-1871: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2punkt2; GAP-1259 / SF-1874: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2punkt4.1; GAP-1260 / SF-1875: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2punkt4.1; GAP-1261 / SF-1876: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2,3punkt4.2; GAP-1264 / SF-1879: catalog/sources/boat-pet/frende-dog-terms.pdf — PDFside2punkt4.1.2. Alle 15 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-113].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["frende","hund","ordinary","frende-hund-veterin-r","2026-01-01"]. Tilleggskomponenter: frende-hund-tap.

**ROOT CAUSE:** RC-014, fra SCRC-016. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / verden (GAP-1256); Kastrering / diagnoser (GAP-1259); Avliving / sum/vilkår (GAP-1260); Tannulykke / omfang (GAP-1261); Medfødt / ledd (GAP-1264); Korsbånd / vilkår (GAP-1265); Keisersnitt / antall/raser (GAP-1266); Rasesykdom / unntak (GAP-1267); Tap / aldersfradrag (GAP-1274); Tap / egenandel (GAP-1275); Tap / oppgjør (GAP-1276); Tegning / alder (GAP-1279); IDmerking / krav (GAP-1280); Veterinær / opphørsalder (GAP-1282); Ansvar / ikkeomfattet (GAP-1283)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-018, CR-150, CR-154, CR-176, CR-183, CR-186, CR-188, CR-192, CR-199, CR-203, CR-207, CR-208, CR-209, CR-210, CR-211, CR-221.

**EXPECTED LEVERAGE:** 15 P1-signaturer / 15 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-114 · frende · Hus · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0299 / SF-0514: catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf — PDF side 7, 6.10, fortsetter side8. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-114].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["frende","bolig","ordinary","frende-hus-standard","2026-09-01"]; ["frende","bolig","ordinary","frende-hus-utvidet","2026-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-015, fra SCRC-009. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenbrukstap / beregning (GAP-0299)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-223.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-115 · frende · Innbo · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0277 / SF-0458: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 5, 5.2; GAP-0280 / SF-0463: catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf — PDF side 6, 6.3 og 6.5. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-115].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["frende","innbo","ordinary","frende-innbo-standard","2026-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-016, fra SCRC-008. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/frende-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/frende-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Standard / viktige skadeunntak (GAP-0277); Aldersfradrag / oppgjørsregel (GAP-0280)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-242, CR-275.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-116 · frende · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1285 / SF-1904: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2punkt2; GAP-1288 / SF-1907: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2punkt4.1; GAP-1289 / SF-1908: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2punkt4.1; GAP-1290 / SF-1909: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside2,3punkt4.2; GAP-1296 / SF-1918: catalog/sources/boat-pet/frende-cat-terms.pdf — PDFside3,5punktHund8.5/Katt7.5. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-116].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["frende","katt","ordinary","frende-katt-veterin-r","2026-01-01"]. Tilleggskomponenter: frende-katt-tap.

**ROOT CAUSE:** RC-017, fra SCRC-016. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / verden (GAP-1285); Kastrering / diagnoser (GAP-1288); Avliving / sum/vilkår (GAP-1289); Tannulykke / omfang (GAP-1290); Tap / aldersfradrag (GAP-1296); Tap / egenandel (GAP-1297); Tap / oppgjør (GAP-1298); Tegning / alder (GAP-1300); IDmerking / krav (GAP-1301)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-286, CR-304, CR-308, CR-311, CR-330, CR-331, CR-332, CR-333, CR-334.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-117 · frende · MC · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1447 / SF-2117: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside9,11punkt11.11/13.2; GAP-1454 / SF-2125: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside11punkt12.4; GAP-1459 / SF-2131: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside13,14punkt16; GAP-1462 / SF-2137: catalog/sources/mc-bobil/frende-mc-page.html — HTMLFAQ; GAP-1465 / SF-2143: catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf — PDFside2punkt3.2–3. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-117].evidence`.

**AFFECTED SCOPE:** Providers frende; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["frende","mc","ordinary","frende-mc-ansvar","2026-01-01"]; ["frende","mc","ordinary","frende-mc-delkasko","2026-01-01"]; ["frende","mc","ordinary","frende-mc-kasko","2026-01-01"]. Tilleggskomponenter: frende-mc-ulykke.

**ROOT CAUSE:** RC-018, fra SCRC-018. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-1447); Ulykke / unntak (GAP-1454); Bruksbegrensninger / aktivitet (GAP-1459); Leiesykkel / ikkeinkludert (GAP-1462); Utstyr / hjul (GAP-1465); Kontanter / unntak (GAP-1466); Egenandel / dyr (GAP-1505)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-348, CR-350, CR-351, CR-357, CR-359, CR-366, CR-370.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 17 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-118 · frende · Snøscooter · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-1652 / SF-2424: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF10–11 §12.2–3; GAP-1681 / SF-2457: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF2 §3.5 / PDF15 §18.2.9; GAP-1714 / SF-2494: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF2 §3.9 / PDF3–4 §6.1.3. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-118].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["frende","snøscooter","ordinary","frende-snoscooter-ansvar","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-brann-og-tyveri","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-020, fra SCRC-021. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fører/passasjerulykke / sum og vilkår ved valg (GAP-1652); Kjøreutstyr / objekter/sikring (GAP-1681); Løsøre / sum/tyveri (GAP-1714)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-424, CR-427, CR-429.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-119 · frende · Snøscooter · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0104 / SF-0177: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF side 8, 11.6 Snøscooter; GAP-1648 / SF-2419: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF 13–14 §16; GAP-1653 / SF-2425: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF10–11 §12.1/12.4; GAP-1671 / SF-2446: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF 7–8 §11.6; GAP-1682 / SF-2458: catalog/sources/vehicle-extensions/frende-SnowmobileInsurance.pdf — PDF8 §11.6. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-119].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["frende","snøscooter","ordinary","frende-snoscooter-ansvar","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-brann-og-tyveri","2026-01-01"]; ["frende","snøscooter","ordinary","frende-snoscooter-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-020, fra SCRC-004, SCRC-021. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tyverioppgjør / gjenanskaffelsesvilkår (GAP-0104); Bruksbegrensninger / aktivitet (GAP-1648); Fører/passasjerulykke / unntak ved valg (GAP-1653); Oppgjør / markedsverdi/tap (GAP-1671); Tyverioppgjør / gjenanskaffelse (GAP-1682); Egenandel / dyr/ung fører (GAP-1715)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-418, CR-419, CR-425, CR-433, CR-441, CR-442.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 13 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-120 · frende · Tilhenger · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1787 / SF-2587: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 7–8 §11.6; GAP-1788 / SF-2588: catalog/sources/vehicle-extensions/frende-TrailerInsurance.pdf — PDF 13–14 §16. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-120].evidence`.

**AFFECTED SCOPE:** Providers frende; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["frende","tilhenger","ordinary","frende-tilhenger-brann-og-tyveri","2026-01-01"]; ["frende","tilhenger","ordinary","frende-tilhenger-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-021, fra SCRC-021. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Oppgjør / markedsverdi/tap (GAP-1787); Bruksbegrensninger / aktivitet (GAP-1788)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-449, CR-460.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-121 · gjensidige · Bil · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-1905 / SF-2748: catalog/sources/gjensidige/Bil-Kasko-alminnelige-vilkar.pdf — PDF 4; GAP-1953 / SF-2813: catalog/sources/gjensidige/Bil-Pluss-alminnelige-vilkar.pdf — PDF 4. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-121].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bil; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","bil","ordinary","gj-bil-kasko",null]; ["gjensidige","bil","ordinary","gj-bil-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-022, fra SCRC-022. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Leiebil / utlandet (GAP-1905)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-020.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-122 · gjensidige · Bil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1826 / SF-2642: catalog/sources/gjensidige/bil-ansvar-alminnelige-vilkar.pdf — PDF 1–2; GAP-1849 / SF-2670: catalog/sources/gjensidige/Bil-Delkasko-alminnelige-vilkar.pdf — PDF 1–2; GAP-1887 / SF-2720: catalog/sources/gjensidige/Bil-Kasko-alminnelige-vilkar.pdf — PDF 1–2; GAP-1936 / SF-2786: catalog/sources/gjensidige/Bil-Pluss-alminnelige-vilkar.pdf — PDF 1–2; GAP-1827 / SF-2643: catalog/sources/gjensidige/bil-ansvar-alminnelige-vilkar.pdf — PDF 1–2. Alle 21 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-122].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["gjensidige","bil","ordinary","gj-bil-ansvar",null]; ["gjensidige","bil","ordinary","gj-bil-delkasko",null]; ["gjensidige","bil","ordinary","gj-bil-kasko",null]; ["gjensidige","bil","ordinary","gj-bil-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-022, fra SCRC-022. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ung fører (GAP-1826); Egenandel / triller uten fører (GAP-1827); Rettshjelp / mekling (GAP-1837); Fysisk skade / begrensninger (GAP-1861); Fysisk skade / batteri/unntak (GAP-1862); Egenandel / dyr (GAP-1866); Maskinskade / vedlikehold (GAP-1962)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-006, CR-007, CR-008, CR-012, CR-013, CR-022, CR-025.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 21 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-123 · gjensidige · Bobil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2409 / SF-3456: catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf — 3; GAP-2432 / SF-3483: catalog/sources/mc-bobil/gjensidige-bobil-delkasko-vilkar.pdf — 3; GAP-2471 / SF-3529: catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf — 3; GAP-2511 / SF-3582: catalog/sources/mc-bobil/gjensidige-bobil-pluss-vilkar.pdf — 3; GAP-2410 / SF-3457: catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf — 1;PDF10–13. Alle 18 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-123].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["gjensidige","bobil","ordinary","gjensidige-bobil-ansvar",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-delkasko",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-kasko",null]; ["gjensidige","bobil","ordinary","gjensidige-bobil-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-023, fra SCRC-030. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / sikrede (GAP-2409); Registrering / opphør (GAP-2410); Uten fører / egenandel (GAP-2411); Lagring / avregistrering (GAP-2414); Fysisk skade / unntak (GAP-2447); Utstyr / aldersfradrag (GAP-2451); Tegning / alder (GAP-2529)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-012, CR-043, CR-046, CR-050, CR-052, CR-055, CR-057, CR-059.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 21 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-124 · gjensidige · Båt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2748 / SF-3882: catalog/sources/boat-pet/gjensidige-boat-ipid.pdf — IPID2;FAQ; GAP-2759 / SF-3894: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — 1; GAP-2801 / SF-3941: catalog/sources/boat-pet/gjensidige-boat-kasko-terms.pdf — 1; GAP-2855 / SF-4001: catalog/sources/boat-pet/gjensidige-boat-plus-terms.pdf — 1; GAP-2761 / SF-3896: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — PDF4–5. Alle 17 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-124].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","båt","ordinary","gjensidige-bat-delkasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-kasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-024, fra SCRC-003. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utleie / valg/varighet (GAP-2748); Ulykke / sum/egenandel (GAP-2759); Ulykke / behandling (GAP-2761); Seilregatta / dekning/egenandel (GAP-2791); Drivstoff / skadeomfang (GAP-2792); Frost/is / unntak/carveout (GAP-2793); Frost / landstrøm (GAP-2837); Tæring / særutvidelse (GAP-2838); Motorskade / aldersfradrag (GAP-2840); Motorskade / montering (GAP-2841)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-068, CR-074, CR-075, CR-079, CR-080, CR-089, CR-097, CR-099, CR-101, CR-109.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 19 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-125 · gjensidige · Båt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2737 / SF-3871: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — PDF2; GAP-2773 / SF-3912: catalog/sources/boat-pet/gjensidige-boat-kasko-terms.pdf — PDF2; GAP-2815 / SF-3959: catalog/sources/boat-pet/gjensidige-boat-plus-terms.pdf — PDF3; GAP-2749 / SF-3883: catalog/sources/boat-pet/gjensidige-boat-ipid.pdf — 2; GAP-2755 / SF-3890: catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf — PDF15. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-125].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","båt","ordinary","gjensidige-bat-delkasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-kasko",null]; ["gjensidige","båt","ordinary","gjensidige-bat-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-024, fra SCRC-003. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reisevarighet / periode (GAP-2737); Tillegg / fartsområde/bygging (GAP-2749); Tap/totalskade / markedsverdi (GAP-2755); Registrering / tegning (GAP-2768)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-087, CR-088, CR-092, CR-094.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-126 · gjensidige · Campingvogn · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2644 / SF-3755: catalog/sources/vehicle-extensions/gjensidige-campingvognforsikring.html — FAQutleie. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-126].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-delkasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-kasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-025, fra SCRC-033. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utleie / valg (GAP-2644)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-142.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-127 · gjensidige · Campingvogn · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2643 / SF-3754: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf — PDF8; GAP-2663 / SF-3779: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf — PDF9; GAP-2685 / SF-3806: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Pluss-alminnelige-vilkar.pdf — PDF9; GAP-2647 / SF-3758: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf — 3; GAP-2669 / SF-3785: catalog/sources/vehicle-extensions/gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf — 3. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-127].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-delkasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-kasko",null]; ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-025, fra SCRC-033. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tilbygg / riving/rydding (GAP-2643); Fysisk skade / unntak (GAP-2647); Tegning / alder (GAP-2694)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-124, CR-132, CR-135.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-128 · gjensidige · Hund · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2871 / SF-4020: catalog/sources/boat-pet/gjensidige-dog-product.html — Opphør3;FAQ; GAP-2874 / SF-4023: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2877 / SF-4028: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2878 / SF-4029: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2879 / SF-4030: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-128].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]. Tilleggskomponenter: gjensidige-hund-bruk; gjensidige-hund-liv.

**ROOT CAUSE:** RC-026, fra SCRC-001. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Varighet / opphør (GAP-2871); Karens / 20d/kjente (GAP-2874); Medfødt/ledd / eligibility (GAP-2877); Korsbånd / eligibility (GAP-2878); Tann / melketann/bitt (GAP-2879); Tann / fraktur/unntak (GAP-2881); Avliving/kremering / sum/aldersvilkår (GAP-2882); Keisersnitt / antall/karens (GAP-2883); Komplikasjon / carveout (GAP-2885); Online veterinær / service (GAP-2888); Tegning / aldersvindu (GAP-2891); Liv / sum/egenandel (GAP-2895); Liv / aldersfradrag (GAP-2898); Bruk / opphør (GAP-2903)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022, CR-156, CR-161, CR-184, CR-187, CR-190, CR-191, CR-196, CR-197, CR-200, CR-202, CR-205, CR-206, CR-212, CR-215.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 14 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-129 · gjensidige · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2886 / SF-4038: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2; GAP-2887 / SF-4039: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf — 2–3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-129].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-026, fra SCRC-001. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Behandlingsunntak / hormon/organ (GAP-2886); Andre unntak / materielle (GAP-2887)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022, CR-149, CR-159.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-130 · gjensidige · Hus · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2081 / SF-2982: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 3; GAP-2135 / SF-3066: catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2115 / SF-3033: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 2,17; GAP-2174 / SF-3120: catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf — PDF 2,18; GAP-2121 / SF-3048: catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf — PDF 1. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-130].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","bolig","ordinary","gjensidige-hus","Alminnelige vilkår"]; ["gjensidige","bolig","ordinary","gjensidige-hus-pluss","Alminnelige vilkår"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-027, fra SCRC-025. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / sikrede (GAP-2081); Fullverdi / underforsikring (GAP-2115); Sikkerhet / frost/bygningsvern (GAP-2121); Fraflyttet / dekning (GAP-2122)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-007, B-020, CR-224, CR-226, CR-228, CR-229.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-131 · gjensidige · Innbo · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1981 / SF-2852: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3; GAP-2024 / SF-2907: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 3; GAP-1987 / SF-2861: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3; GAP-2031 / SF-2916: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf — PDF 3; GAP-1990 / SF-2865: catalog/sources/gjensidige/innbo/Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf — PDF 3. Alle 20 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-131].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","innbo","ordinary","gj-innbo",null]; ["gjensidige","innbo","ordinary","gj-innbo-pluss",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-028, fra SCRC-023. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / husstand (GAP-1981); Tilhenger / sum/sted (GAP-1987); Generelle skadeunntak / årsaker (GAP-1990); Dyr / skade (GAP-1996); Aldersfradrag / datamobil (GAP-2010); Aldersfradrag / hvitevarelydbilde (GAP-2011); Aldersfradrag / kamera/øvrigelektronikk (GAP-2012); Aldersfradrag / sykkel (GAP-2013); Aldersfradrag / briller/dekk (GAP-2014); Aldersfradrag / annetinnbo (GAP-2015)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-014, CR-237, CR-238, CR-239, CR-240, CR-241, CR-243, CR-253, CR-257, CR-265, CR-276.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-132 · gjensidige · Katt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2912 / SF-4066: catalog/sources/boat-pet/gjensidige-cat-product.html — Opphør3;FAQ; GAP-2914 / SF-4068: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2918 / SF-4073: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2919 / SF-4074: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2921 / SF-4076: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 1–3. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-132].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","katt","ordinary","gjensidige-katt-behandling",null]. Tilleggskomponenter: gjensidige-katt-liv.

**ROOT CAUSE:** RC-029, fra SCRC-001. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Varighet / opphør (GAP-2912); Karens / 20d/kjente (GAP-2914); Medfødt / unntak (GAP-2918); Tann / fraktur/unntak (GAP-2919); Avliving/kremering / sum/aldersvilkår (GAP-2921); Keisersnitt / antall/karens (GAP-2922); Komplikasjon / carveout (GAP-2923); Online veterinær / service (GAP-2926); Tegning / aldersvindu (GAP-2929); Liv / sum/egenandel (GAP-2931); Liv / aldersfradrag (GAP-2934); Bruk / tap/avl (GAP-2937); Bruk / opphør (GAP-2938); Bruk / gjenverdi (GAP-2939)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022, CR-288, CR-293, CR-294, CR-295, CR-309, CR-315, CR-317, CR-321, CR-322, CR-324, CR-326, CR-329, CR-335, CR-337.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 14 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-133 · gjensidige · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2924 / SF-4079: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2; GAP-2925 / SF-4080: catalog/sources/boat-pet/gjensidige-cat-treatment-terms.pdf — 2–3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-133].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","katt","ordinary","gjensidige-katt-behandling",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-029, fra SCRC-001. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Behandlingsunntak / organ (GAP-2924); Andre unntak / materielle (GAP-2925)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-022, CR-283, CR-291.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-134 · gjensidige · MC · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2296 / SF-3318: catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf — 3; GAP-2323 / SF-3350: catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf — 3; GAP-2366 / SF-3401: catalog/sources/mc-bobil/gjensidige-mc-kasko-vilkar.pdf — 3; GAP-2297 / SF-3319: catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf — 1;PDF10–13; GAP-2324 / SF-3351: catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf — 1;PDF11–14. Alle 21 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-134].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","mc","ordinary","gjensidige-mc-ansvar",null]; ["gjensidige","mc","ordinary","gjensidige-mc-delkasko",null]; ["gjensidige","mc","ordinary","gjensidige-mc-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-030, fra SCRC-030. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personkrets / sikrede (GAP-2296); Registrering / opphør (GAP-2297); Ung fører / egenandel (GAP-2298); Uten fører / egenandel (GAP-2299); Bane/hastighet / unntak/carveout (GAP-2302); Lagring / avregistrering (GAP-2304); MC sidevogn/tilhenger / omfang (GAP-2331); Fysisk skade / unntak (GAP-2339); Utstyr / aldersfradrag (GAP-2344)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-001, CR-346, CR-354, CR-358, CR-360, CR-362, CR-363, CR-367, CR-368, CR-369.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 23 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-135 · gjensidige · Reise · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2196 / SF-3157: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 3; GAP-2241 / SF-3232: catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2197 / SF-3160: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 3; GAP-2242 / SF-3235: catalog/sources/gjensidige/reise/reise-pluss-alminnelige-vilkar.pdf — PDF 3; GAP-2203 / SF-3169: catalog/sources/gjensidige/reise/reise-alminnelige-vilkar.pdf — PDF 1. Alle 11 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-135].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Reise; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","reise","ordinary","gjensidige-reise","2026-09-20-canonical"]; ["gjensidige","reise","ordinary","gjensidige-reise-pluss","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-031, fra SCRC-028. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/gjensidige-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/gjensidige-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reisestart / avtaletid (GAP-2196); Generelle reiseunntak / hendelser/utgift (GAP-2197); Telefon / sykdomssum (GAP-2203); Returreise / sum/tid (GAP-2208); Bagasje / lånt/pass (GAP-2212); Reise / tegning/alder (GAP-2234)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-016, CR-373, CR-383, CR-393, CR-399, CR-401, CR-406.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-136 · gjensidige · Snøscooter · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2559 / SF-3658: catalog/sources/vehicle-extensions/gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf — 1; GAP-2581 / SF-3682: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Delkasko-alminnelige-vilkar.pdf — 1; GAP-2611 / SF-3716: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Kasko-alminnelige-vilkar.pdf — 1; GAP-2561 / SF-3660: catalog/sources/vehicle-extensions/gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf — 1;websommer; GAP-2583 / SF-3684: catalog/sources/vehicle-extensions/gjensidige-Snoscooter-Delkasko-alminnelige-vilkar.pdf — 1;websommer. Alle 11 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-136].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-ansvar",null]; ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-delkasko",null]; ["gjensidige","snøscooter","ordinary","gjensidige-snoscooter-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-032, fra SCRC-033. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ung fører / rabatt/egenandel (GAP-2559); Registrering / opphør/lagring (GAP-2561); Bane/utmark / unntak (GAP-2562); Fysisk skade / unntak (GAP-2590)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-416, CR-422, CR-435, CR-445.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 11 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-137 · gjensidige · Tilhenger · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2711 / SF-3837: catalog/sources/vehicle-extensions/gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf — 1,2;PDF7; GAP-2726 / SF-3857: catalog/sources/vehicle-extensions/gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf — 1,2;PDF8. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-137].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-delkasko",null]; ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-033, fra SCRC-033. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Forsikret objekt / sum/dekk (GAP-2711)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-453.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-138 · gjensidige · Tilhenger · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-2712 / SF-3838: catalog/sources/vehicle-extensions/gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf — 2; GAP-2728 / SF-3859: catalog/sources/vehicle-extensions/gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf — 2. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-138].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-delkasko",null]; ["gjensidige","tilhenger","ordinary","gjensidige-tilhenger-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-033, fra SCRC-033. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fysisk skade / unntak (GAP-2712)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-455.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-139 · if · Bil · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-2965 / SF-4137: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 13 pkt5.2; GAP-2987 / SF-4174: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 9–10 pkt4.9.4–4.9.7; GAP-3012 / SF-4223: catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf — 12 pkt4.11.3/4.11.6/4.11.7. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-139].evidence`.

**AFFECTED SCOPE:** Providers if; typer Bil; scope ordinary. 3 eksakte produktidentiteter: ["if","bil","ordinary","if-bil-delkasko","MOT2-2"]; ["if","bil","ordinary","if-bil-kasko","MOT2-2"]; ["if","bil","ordinary","if-bil-super","MOT2-2"]. Tilleggskomponenter: if-motor-gir.

**ROOT CAUSE:** RC-034, fra SCRC-036. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Viktige unntak / vær/slitasje/tuning (GAP-2965); Maskinskade / vedlikehold og oppgjør (GAP-2987); Uhell / sum/egenandel/bonus (GAP-3012)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-023, CR-029, CR-034.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-140 · if · Bobil · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3159 / SF-4467: catalog/sources/mc-bobil/if-bobil-product.html — Supergaranti. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-140].evidence`.

**AFFECTED SCOPE:** Providers if; typer Bobil; scope ordinary. 1 eksakte produktidentiteter: ["if","bobil","ordinary","if-bobil-super","2022-06"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-035, fra SCRC-036. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Supergaranti / service/varighet (GAP-3159)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-054.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-141 · if · Båt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-3670 / SF-5272: catalog/sources/boat-pet/if-boat-terms.pdf — 8 §5.2; GAP-3697 / SF-5303: catalog/sources/boat-pet/if-boat-terms.pdf — 4 §4.4;14 §7; GAP-3752 / SF-5366: catalog/sources/boat-pet/if-boat-terms.pdf — 7 §4.10.7. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-141].evidence`.

**AFFECTED SCOPE:** Providers if; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["if","båt","ordinary","if-bat-delkasko","2023-02-01"]; ["if","båt","ordinary","if-bat-kasko","2023-02-01"]; ["if","båt","ordinary","if-bat-super","2023-02-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-036, fra SCRC-041. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Utleie/bruk / vilkår (GAP-3670); Grunnstøting / undersøkelse (GAP-3697); Uhell / sum/egenandel (GAP-3752)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-003, CR-077, CR-098, CR-110.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-142 · if · Campingvogn · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3230 / SF-4558: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 5–6 pkt4.7; GAP-3232 / SF-4560: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 19 pkt8.5.6;20 pkt9.4; GAP-3240 / SF-4571: catalog/sources/mc-bobil/if-SV707.pdf — 5 pkt6.2.1; GAP-3260 / SF-4597: catalog/sources/mc-bobil/if-SV707.pdf — 2 pkt1; GAP-3267 / SF-4604: catalog/sources/vehicle-extensions/if-campingvognforsikring.html — Tilleggsdekning for spikertelt og tilbygg. Alle 5 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-142].evidence`.

**AFFECTED SCOPE:** Providers if; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["if","campingvogn","ordinary","if-campingvogn-delkasko","2024-03"]; ["if","campingvogn","ordinary","if-campingvogn-kasko","2024-03"]; ["if","campingvogn","ordinary","if-campingvogn-super","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-037, fra SCRC-036. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Veihjelp / utløsning (GAP-3230); Veihjelp / egenandel (GAP-3232); Utleie / egenandel (GAP-3240); Tilbygg / sum og nivåspørsmål (GAP-3260); Tilbygg / valgbar høyere sum (GAP-3267)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-024, CR-136, CR-137, CR-139, CR-145, CR-146.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 13 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-143 · if · Hund · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3775 / SF-5392: catalog/sources/boat-pet/if-dog-terms.pdf — 5 §5.1.6; GAP-3776 / SF-5393: catalog/sources/boat-pet/if-dog-terms.pdf — 5 §5.1.7; GAP-3777 / SF-5394: catalog/sources/boat-pet/if-dog-terms.pdf — 5 §5.1.8; GAP-3782 / SF-5399: catalog/sources/boat-pet/if-dog-terms.pdf — 6 §5.2.2; GAP-3783 / SF-5400: catalog/sources/boat-pet/if-dog-terms.pdf — 6 §5.2.3. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-143].evidence`.

**AFFECTED SCOPE:** Providers if; typer Hund; scope ordinary. 3 eksakte produktidentiteter: ["if","hund","ordinary","if-hund-basis","2022-12-01"]; ["if","hund","ordinary","if-hund-standard","2022-12-01"]; ["if","hund","ordinary","if-hund-super","2022-12-01"]. Tilleggskomponenter: if-hund-liv.

**ROOT CAUSE:** RC-038, fra SCRC-042. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fødselshjelp / raser/avl (GAP-3775); Medfødt / kvalifikasjon (GAP-3776); Avlivning / aldersgrense (GAP-3777); Kremering / sum (GAP-3782); Forsvinning / ID/tid (GAP-3783); Bruksverdi / andel/alder/definisjon (GAP-3784)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-157, CR-163, CR-172, CR-175, CR-193, CR-198.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 18 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-144 · if · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-3786 / SF-5403: catalog/sources/boat-pet/if-dog-terms.pdf — 7 §6.1.3; GAP-3793 / SF-5410: catalog/sources/boat-pet/if-dog-terms.pdf — 9 §6.3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-144].evidence`.

**AFFECTED SCOPE:** Providers if; typer Hund; scope ordinary. 3 eksakte produktidentiteter: ["if","hund","ordinary","if-hund-basis","2022-12-01"]; ["if","hund","ordinary","if-hund-standard","2022-12-01"]; ["if","hund","ordinary","if-hund-super","2022-12-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-038, fra SCRC-042. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; HD/AD / artsspesifiktunntak (GAP-3786); Raseunntak / luftvei/øyelokk/hud (GAP-3793)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-178, CR-204.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-145 · if · Hus · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3459 / SF-4879: catalog/sources/if/hus/Bygningsforsikring.pdf — 7–8 pkt4.4; GAP-3460 / SF-4881: catalog/sources/if/hus/Bygningsforsikring.pdf — 8 pkt4.4; GAP-3475 / SF-4906: catalog/sources/if/hus/Bygningsforsikring.pdf — 19 pkt5.7.2; GAP-3477 / SF-4913: catalog/sources/if/hus/Bygningsforsikring.pdf — 21–22 pkt6.1.1. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-145].evidence`.

**AFFECTED SCOPE:** Providers if; typer Hus; scope ordinary. 3 eksakte produktidentiteter: ["if","bolig","ordinary","if-hus-basis","2023-09"]; ["if","bolig","ordinary","if-hus-super","2023-09"]; ["if","bolig","ordinary","if-hus-utvidet","2023-09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-039, fra SCRC-039. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Vann / utløser (GAP-3459); Vann / unntak (GAP-3460); Innvendig rør / ekstrafradrag (GAP-3475); Fraflyttet / restriksjon (GAP-3477)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-225, CR-227, CR-235, CR-236.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-146 · if · Innbo · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3340 / SF-4699: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 4–5 pkt3.1; GAP-3341 / SF-4700: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 4 pkt3.1; GAP-3343 / SF-4702: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 4 pkt3.1; GAP-3345 / SF-4704: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 5 pkt3.2; GAP-3353 / SF-4716: catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf — 7 pkt4.5.1. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-146].evidence`.

**AFFECTED SCOPE:** Providers if; typer Innbo; scope ordinary. 3 eksakte produktidentiteter: ["if","innbo","ordinary","if-innbo-basis","IBO2-1"]; ["if","innbo","ordinary","if-innbo-super","IBO2-1"]; ["if","innbo","ordinary","if-innbo-utvidet","IBO2-1"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-040, fra SCRC-038. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kjøretøydeler / sum/omfang (GAP-3340); Småbåt/tilhenger / sum/omfang (GAP-3341); Hobbybygg/basseng / sum (GAP-3343); Rydding/flytting / utover sum (GAP-3345); Innbrudd / bygningssum (GAP-3353); Skadedyr / ingen fysisk skade (GAP-3399)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-259, CR-260, CR-261, CR-269, CR-271, CR-274.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 17 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-147 · if · Katt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3847 / SF-5476: catalog/sources/boat-pet/if-cat-terms.pdf — 5 §5.1.7; GAP-3848 / SF-5477: catalog/sources/boat-pet/if-cat-terms.pdf — 5 §5.1.8; GAP-3851 / SF-5480: catalog/sources/boat-pet/if-cat-terms.pdf — 5 §5.2.2; GAP-3852 / SF-5481: catalog/sources/boat-pet/if-cat-terms.pdf — 6 §5.2.3. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-147].evidence`.

**AFFECTED SCOPE:** Providers if; typer Katt; scope ordinary. 3 eksakte produktidentiteter: ["if","katt","ordinary","if-katt-basis","2022-12-01"]; ["if","katt","ordinary","if-katt-standard","2022-12-01"]; ["if","katt","ordinary","if-katt-super","2022-12-01"]. Tilleggskomponenter: if-katt-liv.

**ROOT CAUSE:** RC-041, fra SCRC-042. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Medfødt / kvalifikasjon (GAP-3847); Avlivning / aldersgrense (GAP-3848); Kremering / sum (GAP-3851); Forsvinning / ID/tid (GAP-3852)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-289, CR-302, CR-318, CR-323.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-148 · if · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-3854 / SF-5483: catalog/sources/boat-pet/if-cat-terms.pdf — 6 §6.1.3; GAP-3861 / SF-5490: catalog/sources/boat-pet/if-cat-terms.pdf — 8 §6.3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-148].evidence`.

**AFFECTED SCOPE:** Providers if; typer Katt; scope ordinary. 3 eksakte produktidentiteter: ["if","katt","ordinary","if-katt-basis","2022-12-01"]; ["if","katt","ordinary","if-katt-standard","2022-12-01"]; ["if","katt","ordinary","if-katt-super","2022-12-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-041, fra SCRC-042. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; HD/AD / artsspesifiktunntak (GAP-3854); Raseunntak / luftvei (GAP-3861)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-306, CR-328.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-149 · if · Reise · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3550 / SF-5080: catalog/sources/if/reise/canonical/Reiseforsikring-produktside.html — FAQ varighet; GAP-3552 / SF-5084: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 5 pkt1.5–6; GAP-3556 / SF-5090: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 14 pkt5.2.3; GAP-3559 / SF-5093: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 15 pkt5.2.8; GAP-3560 / SF-5094: catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf — 15 pkt5.2.9. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-149].evidence`.

**AFFECTED SCOPE:** Providers if; typer Reise; scope ordinary. 3 eksakte produktidentiteter: ["if","reise","ordinary","if-reise-basis","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-standard","2026-09-20-canonical"]; ["if","reise","ordinary","if-reise-super","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-043, fra SCRC-040. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/if-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/if-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reisedager / ekstra (GAP-3550); Arbeidskonflikt / unntak (GAP-3552); Tilkallelse / personer (GAP-3556); Tapt turisttjeneste / sykdomstak (GAP-3559); Eneste medreisende / sum (GAP-3560); Psykologisk førstehjelp / timer/vilkår (GAP-3561); Sykdom / unntak (GAP-3562); Sykdom / behandlingsperiode (GAP-3563); ID-tyveri / juridisk førstelinje (GAP-3569); Egenandel / standard (GAP-3570); Reisegods / tingunntak (GAP-3584); Pass / gjenanskaffelse (GAP-3589); Familie / barnebarn (GAP-3610); Leid transportmiddel / vilkår (GAP-3649)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-004, CR-372, CR-375, CR-377, CR-379, CR-386, CR-389, CR-390, CR-392, CR-395, CR-398, CR-403, CR-404, CR-405, CR-407.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 36 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-150 · if · Snøscooter · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3162 / SF-4471: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 21–22 pkt11.2–11.5; GAP-3186 / SF-4500: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 18 pkt8.4.2; GAP-3187 / SF-4501: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 18 pkt8.4.2; GAP-3191 / SF-4506: catalog/sources/mc-bobil/if-SV692.pdf — 1 pkt1. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-150].evidence`.

**AFFECTED SCOPE:** Providers if; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["if","snøscooter","ordinary","if-snoscooter-ansvar","2024-03"]; ["if","snøscooter","ordinary","if-snoscooter-delkasko","2024-03"]; ["if","snøscooter","ordinary","if-snoscooter-kasko","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-044, fra SCRC-036. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fører/passasjer / personkrets og sum (GAP-3162); Nyverdi standard / alder/km/terskel (GAP-3186); Nyverdi standard / forutsetninger (GAP-3187); Kjøreutstyr / omfang (GAP-3191)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-423, CR-428, CR-430, CR-431.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-151 · if · Tilhenger · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3309 / SF-4655: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 3 pkt3; GAP-3311 / SF-4657: catalog/sources/vehicle-extensions/if-Vilkaar-4103ea25.pdf — 5–6 pkt4.7. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-151].evidence`.

**AFFECTED SCOPE:** Providers if; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["if","tilhenger","ordinary","if-tilhenger-delkasko","2024-03"]; ["if","tilhenger","ordinary","if-tilhenger-kasko","2024-03"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-045, fra SCRC-036. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Fastmontert utstyr/bagasje / sum og samlet mekanisme (GAP-3309); Veihjelp / utløsning (GAP-3311)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-451, CR-468.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-152 · sparebank1-fremtind · Båt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5489 / SF-7809: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§1.1s1; GAP-5492 / SF-7814: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§2.2s2; GAP-5495 / SF-7818: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§2.7s2; GAP-5500 / SF-7824: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§3.10s4/Kasko§2.1s5; GAP-5509 / SF-7833: catalog/sources/boat-pet/fremtind-sb1-boat-product.html — SB1Leieut. Alle 5 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-152].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-delkasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-kasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-toppkasko","2024-06-10"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-046, fra SCRC-058. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Forsikrede ting / limits (GAP-5489); Natur / trigger (GAP-5492); Vrak / trigger (GAP-5495); Utleie / condition (GAP-5500); Utleie / channel (GAP-5509)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-073, CR-081, CR-107, CR-108, CR-113.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 15 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-153 · sparebank1-fremtind · Båt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5499 / SF-7823: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§3.7s4; GAP-5501 / SF-7825: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§4.1s4; GAP-5534 / SF-7865: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Kasko§4.1s6; GAP-5566 / SF-7905: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Topp§2.2s7; GAP-5569 / SF-7908: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Topp§2.4s7. Alle 5 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-153].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-delkasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-kasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-toppkasko","2024-06-10"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-046, fra SCRC-058. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Aldersfradrag / table (GAP-5499); Gjenfinning / deductible (GAP-5501); Ung fører / deductible (GAP-5534); Avbrutt båttur / trigger (GAP-5566); Opplagsutstyr / coverage (GAP-5569)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-063, CR-064, CR-076, CR-086, CR-104.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 10 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-154 · sparebank1-fremtind · Hund · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5580 / SF-7922: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §5s1; GAP-5586 / SF-7929: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1; GAP-5606 / SF-7950: catalog/sources/boat-pet/fremtind-sb1-dog-product.html — SB1Online;IPID. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-154].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-047, fra SCRC-059. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Karenstid / days (GAP-5580); Hund tann / negative (GAP-5586); FirstVet / service (GAP-5606)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-009, B-010, CR-170, CR-182, CR-185.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-155 · sparebank1-fremtind · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5583 / SF-7926: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1; GAP-5585 / SF-7928: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s1; GAP-5587 / SF-7930: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s2; GAP-5588 / SF-7931: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s2; GAP-5591 / SF-7934: catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf — §7s2. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-155].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-047, fra SCRC-059. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Artrose / lifetime (GAP-5583); Avliving / sum (GAP-5585); Medfødte ledd / condition (GAP-5587); Hund keisersnitt / condition (GAP-5588); Hund raser / exclusions (GAP-5591); Varighet / termination (GAP-5594); Kjøp / eligibility (GAP-5605)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-009, B-010, CR-151, CR-153, CR-180, CR-181, CR-189, CR-201, CR-216.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-156 · sparebank1-fremtind · Katt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5610 / SF-7956: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §5s1; GAP-5613 / SF-7961: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s1; GAP-5627 / SF-7975: catalog/sources/boat-pet/fremtind-sb1-cat-product.html — SB1Online;IPID. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-156].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","katt","ordinary","sparebank1-fremtind-katt-veterin-r","2025-08-07"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-048, fra SCRC-059. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Karenstid / days (GAP-5610); Katt tann / coverage (GAP-5613); FirstVet / service (GAP-5627)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-300, CR-310, CR-314.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-157 · sparebank1-fremtind · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5612 / SF-7960: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s1; GAP-5614 / SF-7962: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s2; GAP-5615 / SF-7963: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s2; GAP-5618 / SF-7966: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §7s2; GAP-5621 / SF-7969: catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf — §8s2;webvarighet. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-157].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","katt","ordinary","sparebank1-fremtind-katt-veterin-r","2025-08-07"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-048, fra SCRC-059. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avliving / sum (GAP-5612); Medfødte ledd / condition (GAP-5614); Katt keisersnitt / condition (GAP-5615); Katt raser / exclusions (GAP-5618); Varighet / termination (GAP-5621); Kjøp / eligibility (GAP-5626)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-285, CR-312, CR-313, CR-316, CR-325, CR-338.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-158 · storebrand · Bil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0348 / SF-0656: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side21 (trykt20), 9.1; GAP-0352 / SF-0661: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side28 (trykt27), 12.4; GAP-0356 / SF-0665: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side31 (trykt30), 13.4,32; GAP-0362 / SF-0680: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side8 (trykt7), 5; GAP-0363 / SF-0681: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — PDF fysisk side8 (trykt7), 5 – tabell. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-158].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["storebrand","bil","ordinary","sb-bil-ansvar","motor09"]; ["storebrand","bil","ordinary","sb-bil-delkasko","motor09"]; ["storebrand","bil","ordinary","sb-bil-kasko","motor09"]; ["storebrand","bil","ordinary","sb-bil-super","motor09"]. Tilleggskomponenter: sb-leiebil; sb-leiebil-utvidet.

**ROOT CAUSE:** RC-049, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-0348); Ulykke / unntak (GAP-0352); Rettshjelp / unntak (GAP-0356); Aldersfradrag / utstyr/dekk (GAP-0362); Aldersfradrag / bagasje (GAP-0363); Generelle unntak / bane/is/trim (GAP-0368); Bruk / utleie/næring (GAP-0369); Leiebil / maskin/veibrudd (GAP-0405); Tegningsalder / BilSuper (GAP-0465)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-001, CR-002, CR-004, CR-009, CR-014, CR-019, CR-027, CR-028, CR-031.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 29 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-159 · storebrand · Bobil · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0613 / SF-1002: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side21 (trykt20), 9.1; GAP-0617 / SF-1007: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side28 (trykt27), 12.4; GAP-0621 / SF-1011: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side31 (trykt30), 13.4,32; GAP-0630 / SF-1026: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side8 (trykt7), 5; GAP-0631 / SF-1027: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side8 (trykt7), 5 – tabell. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-159].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["storebrand","bobil","ordinary","storebrand-bobil-ansvar","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-delkasko","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-kasko","motor09"]; ["storebrand","bobil","ordinary","storebrand-bobil-super","motor09"]. Tilleggskomponenter: storebrand-bobil-leiebil; storebrand-bobil-utvidet-leiebil.

**ROOT CAUSE:** RC-050, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-0613); Ulykke / unntak (GAP-0617); Rettshjelp / unntak (GAP-0621); Aldersfradrag / utstyr/dekk (GAP-0630); Aldersfradrag / bagasje (GAP-0631); Generelle unntak / bane/is/trim (GAP-0635); Bruk / utleie/næring (GAP-0636); Leiebil / maskin/veibrudd (GAP-0671)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-035, CR-036, CR-037, CR-040, CR-044, CR-047, CR-053, CR-056.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 28 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-160 · storebrand · Båt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-5633 / SF-7983: catalog/sources/boat-pet/storebrand-boat-terms.pdf — §4 fysisk s6; GAP-5635 / SF-7986: catalog/sources/boat-pet/storebrand-boat-terms.pdf — §5.1.3 fysisk s8; GAP-5636 / SF-7987: catalog/sources/boat-pet/storebrand-boat-terms.pdf — §6 fysisk s11; GAP-5638 / SF-7989: catalog/sources/boat-pet/storebrand-boat-terms.pdf — §6 fysisk s11; GAP-5641 / SF-7993: catalog/sources/boat-pet/storebrand-boat-terms.pdf — §8.3 fysisk s15. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-160].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","båt","ordinary","storebrand-bat-delkasko","2024-09-01"]; ["storebrand","båt","ordinary","storebrand-bat-kasko","2024-09-01"]; ["storebrand","båt","ordinary","storebrand-bat-super","2024-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-051, fra SCRC-060. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / mekanisme (GAP-5633); Transport / vilkår (GAP-5635); Unntak / vær og gradvis (GAP-5636); Unntak / bruksområde (GAP-5638); Aldersfradrag / tabell (GAP-5641); Ulykke / vilkår (GAP-5645); Ulykke / samlet tak og behandling (GAP-5651); Super reisekostnader / utløser (GAP-5680)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-008, CR-062, CR-069, CR-091, CR-096, CR-100, CR-103, CR-105, CR-106.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 20 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-161 · storebrand · Campingvogn · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0729 / SF-1159: catalog/sources/vehicle-extensions/storebrand-campingvognforsikring.html — Produktsider/FAQ; GAP-0731 / SF-1162: catalog/sources/vehicle-extensions/storebrand-campingvognforsikring.html — Produktside FAQ; GAP-0732 / SF-1163: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5; GAP-0735 / SF-1167: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5 +produktside; GAP-0736 / SF-1168: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5. Alle 10 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-161].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Campingvogn; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","campingvogn","ordinary","storebrand-campingvogn-brann-og-tyveri","2026-03-01"]; ["storebrand","campingvogn","ordinary","storebrand-campingvogn-kasko","2026-03-01"]; ["storebrand","campingvogn","ordinary","storebrand-campingvogn-super","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-052, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tegning / forutsetning (GAP-0729); Ansvar / trekkvogn (GAP-0731); Utstyr / fastmontert (GAP-0732); Løsøre / sumutvidelse (GAP-0735); Aldersfradrag / utstyr (GAP-0736); Aldersfradrag / bagasje (GAP-0737); Utleie/næring / særavtale (GAP-0743); Oppgjør / kosmetikk/reparasjon (GAP-0748); Rettshjelp / egenandel (GAP-0751); Rettshjelp / unntak (GAP-0752)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-115, CR-117, CR-118, CR-125, CR-127, CR-130, CR-131, CR-133, CR-143, CR-144.

**EXPECTED LEVERAGE:** 10 P1-signaturer / 30 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-162 · storebrand · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0136 / SF-0255: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 3, B.1; GAP-0137 / SF-0256: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 3, B.1.2; GAP-0138 / SF-0257: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1; GAP-0143 / SF-0265: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.2; GAP-0144 / SF-0266: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 8, Raseavhengige begrensninger. Alle 15 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-162].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Hund; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","hund","ordinary","storebrand-hund-d-dsfall","2025-02-01"]; ["storebrand","hund","ordinary","storebrand-hund-veterin-r","2025-02-01"]; ["storebrand","hund","ordinary","storebrand-hund-veterin-r-og-d-dsfall","2025-02-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-053, fra SCRC-007. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Gyldighet / ID-merking (GAP-0136); Veterinær / geografisk omfang (GAP-0137); Veterinær / behandlingssted (GAP-0138); Fødsel / keisersnitt (GAP-0143); Fødsel / raseunntak keisersnitt (GAP-0144); Valpekull / sum og omfang (GAP-0149); Avliving / vilkår og alder (GAP-0150); Veterinær / komplikasjoner (GAP-0153); Veterinær / kastrering/sterilisering (GAP-0154); Arvelige/medfødte lidelser / unntak og kvalifikasjon (GAP-0156); HD/AD / egen kvalifikasjon (GAP-0157); Andre leddlidelser / egen kvalifikasjon (GAP-0158); Dødsfall / geografisk omfang (GAP-0193); Dødsfall / egenandel (GAP-0194); Dødsfall / sykdomsunntak og kvalifikasjoner (GAP-0199)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-148, CR-152, CR-155, CR-166, CR-167, CR-168, CR-173, CR-174, CR-177, CR-179, CR-214, CR-217, CR-218, CR-219, CR-220.

**EXPECTED LEVERAGE:** 15 P1-signaturer / 31 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-163 · storebrand · Hus · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0981 / SF-1509: catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf — PDF fysisk side 33, B.8.2.8; GAP-0989 / SF-1526: catalog/sources/storebrand/hus/Vilkar-utleieforsikring-UTLEI03.pdf — PDF side5–7, A.6; GAP-1039 / SF-1598: catalog/sources/storebrand/hus/Husforsikring-produktside.html — HTML FAQ, Produktside FAQ. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-163].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Hus; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","bolig","ordinary","storebrand-hus-standard","2025-08-15"]; ["storebrand","bolig","ordinary","storebrand-hus-super","2025-08-15"]. Tilleggskomponenter: storebrand-hus-utleie.

**ROOT CAUSE:** RC-054, fra SCRC-014. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-hus-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-hus-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ubebodd / reduksjon (GAP-0981); Utleie / oppgjør (GAP-0989); Tegning / Superkrav (GAP-1039)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-013, CR-232, CR-233, CR-234.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 5 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-164 · storebrand · Innbo · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-0857 / SF-1324: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 8, B.4.4; GAP-0859 / SF-1328: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 9, B.4.5; GAP-0862 / SF-1333: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 9, B.4.5; GAP-0877 / SF-1349: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 14, B.6.2. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-164].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","innbo","ordinary","sb-innbo-standard","innbo09"]; ["storebrand","innbo","ordinary","sb-innbo-super","innbo09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-055, fra SCRC-012. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Vann / egenandelfritak (GAP-0857); Arbeidsplass / tyveri (GAP-0859); Ran/napping / sum/geografi (GAP-0862); Aldersfradrag / tabell (GAP-0877)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-005, CR-244, CR-250, CR-266, CR-279.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-165 · storebrand · Innbo · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0842 / SF-1301: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 4, B.1; GAP-0843 / SF-1302: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 4, B.1; GAP-0851 / SF-1315: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 5,9, B.3/B.4.5; GAP-0852 / SF-1316: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 6, B.3; GAP-0865 / SF-1336: catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf — PDF fysisk side 10, B.4.6. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-165].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","innbo","ordinary","sb-innbo-standard","innbo09"]; ["storebrand","innbo","ordinary","sb-innbo-super","innbo09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-055, fra SCRC-012. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Sikrede / husstand (GAP-0842); Andres ting / sum/rolle (GAP-0843); Små elektriske kjøretøy / løsøre/ansvar (GAP-0851); Generelle gjenstandsunntak / omfang (GAP-0852); Bygningsfølgeskade / omfang (GAP-0865); Trygghetsgaranti / nyanskaffelser (GAP-0875); Aldersfradrag / verdi/brukt (GAP-0878); Utleie / forhåndsavtale (GAP-0879); Fraflyttet / reduksjon (GAP-0880); Droneansvar / unntak (GAP-0882); Ansvar / unntak (GAP-0883); Rettshjelp / boligskifte (GAP-0886); Rettshjelp / unntak (GAP-0887)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-005, CR-246, CR-248, CR-249, CR-251, CR-252, CR-255, CR-256, CR-267, CR-268, CR-270, CR-273, CR-277, CR-278.

**EXPECTED LEVERAGE:** 13 P1-signaturer / 26 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-166 · storebrand · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0165 / SF-0291: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 3, B.1; GAP-0166 / SF-0292: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 3, B.1.2; GAP-0167 / SF-0293: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1; GAP-0172 / SF-0301: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 4, B.4.1.2; GAP-0177 / SF-0306: catalog/sources/boat-pet/storebrand-pet-terms.pdf — PDF side 6, B.4.1.7. Alle 14 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-166].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Katt; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","katt","ordinary","storebrand-katt-d-dsfall","2025-02-01"]; ["storebrand","katt","ordinary","storebrand-katt-veterin-r","2025-02-01"]; ["storebrand","katt","ordinary","storebrand-katt-veterin-r-og-d-dsfall","2025-02-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-056, fra SCRC-007. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Gyldighet / ID-merking (GAP-0165); Veterinær / geografisk omfang (GAP-0166); Veterinær / behandlingssted (GAP-0167); Fødsel / keisersnitt (GAP-0172); Avliving / vilkår og alder (GAP-0177); Veterinær / komplikasjoner (GAP-0180); Veterinær / kastrering/sterilisering (GAP-0181); Arvelige/medfødte lidelser / unntak og kvalifikasjon (GAP-0183); HD/AD / egen kvalifikasjon (GAP-0184); Andre leddlidelser / egen kvalifikasjon (GAP-0185); Rasebegrensninger / katt gane/luftveier (GAP-0189); Dødsfall / geografisk omfang (GAP-0238); Dødsfall / egenandel (GAP-0239); Dødsfall / sykdomsunntak og kvalifikasjoner (GAP-0241)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-282, CR-284, CR-287, CR-296, CR-297, CR-298, CR-303, CR-305, CR-307, CR-327, CR-339, CR-340, CR-341, CR-342.

**EXPECTED LEVERAGE:** 14 P1-signaturer / 29 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-167 · storebrand · MC · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0543 / SF-0905: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side21 (trykt20), 9.1; GAP-0547 / SF-0910: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side28 (trykt27), 12.4; GAP-0551 / SF-0914: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side31 (trykt30), 13.4,32; GAP-0552 / SF-0916: catalog/sources/vehicle-extensions/storebrand-mc-forsikring.html — MCwebFAQ; GAP-0554 / SF-0918: catalog/sources/vehicle-extensions/storebrand-mc-forsikring.html — MCwebFAQ. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-167].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer MC; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","mc","ordinary","storebrand-mc-ansvar","motor09"]; ["storebrand","mc","ordinary","storebrand-mc-delkasko","motor09"]; ["storebrand","mc","ordinary","storebrand-mc-kasko","motor09"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-057, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-gjensidige-storebrand-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-gjensidige-storebrand-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-0543); Ulykke / unntak (GAP-0547); Rettshjelp / unntak (GAP-0551); Tegning / MC/scooter (GAP-0552); Egenandel / MCene-fører (GAP-0554); Aldersfradrag / utstyr/dekk (GAP-0562); Generelle unntak / bane/is/trim (GAP-0566); Bruk / utleie/næring (GAP-0567); Oppgjør / kosmetikkMC/Scooter (GAP-0570)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-344, CR-347, CR-349, CR-351, CR-356, CR-361, CR-364, CR-365, CR-366.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 23 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-168 · storebrand · Reise · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-1049 / SF-1618: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 5, B.1.4–5; GAP-1068 / SF-1643: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 15,19, B.5.1.3/B.5.3; GAP-1073 / SF-1648: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 16, B.5.1.8; GAP-1075 / SF-1650: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 17, B.5.1.10; GAP-1077 / SF-1652: catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf — PDF fysisk side 17, B.5.1.12. Alle 8 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-168].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Reise; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]; ["storebrand","reise","ordinary","storebrand-reise-super","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-058, fra SCRC-015. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/storebrand-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/storebrand-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Generelleunntak / tap (GAP-1049); Reisesyke / reiseutsettelse (GAP-1068); Enestereiseledsager / sum (GAP-1073); Utflukt / sykdom (GAP-1075); Krisehjelp / timer/tid (GAP-1077); Ulykke / oppgjør (GAP-1084); Skadeinsekter / vilkår/unntak (GAP-1088); Utstyrsleie / sum/vilkår (GAP-1143)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-019, B-021, CR-378, CR-385, CR-388, CR-400, CR-402, CR-408, CR-410, CR-411.

**EXPECTED LEVERAGE:** 8 P1-signaturer / 15 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-169 · storebrand · Snøscooter · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-5697 / SF-8058: catalog/sources/storebrand/vilkar-motorvognforsikring-motor09.pdf — s1 felles anvendelse; s3–4/7 tabeller; §6.4.6s17. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-169].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Snøscooter; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","snøscooter","ordinary","storebrand-snoscooter-delkasko","2025-04-01"]; ["storebrand","snøscooter","ordinary","storebrand-snoscooter-kasko","2025-04-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-059, fra SCRC-011. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Bagasje / ordinær grense og hendelser (GAP-5697)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-415.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-170 · storebrand · Snøscooter · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0470 / SF-0820: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side21 (trykt20), 9.1; GAP-0474 / SF-0825: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side28 (trykt27), 12.4; GAP-0478 / SF-0829: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side31 (trykt30), 13.4,32; GAP-0479 / SF-0831: catalog/sources/vehicle-extensions/storebrand-mc-forsikring.html — MCwebFAQ; GAP-0491 / SF-0845: catalog/sources/vehicle-extensions/storebrand-vilkar-motorvognforsikring.pdf — PDF fysisk side8 (trykt7), 5. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-170].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["storebrand","snøscooter","ordinary","storebrand-snoscooter-ansvar","2025-04-01"]; ["storebrand","snøscooter","ordinary","storebrand-snoscooter-delkasko","2025-04-01"]; ["storebrand","snøscooter","ordinary","storebrand-snoscooter-kasko","2025-04-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-059, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Egenandel / ungfører (GAP-0470); Ulykke / unntak (GAP-0474); Rettshjelp / unntak (GAP-0478); Tegning / MC/scooter (GAP-0479); Aldersfradrag / utstyr/dekk (GAP-0491); Transport / Snøscootersærregel (GAP-0492); Generelle unntak / bane/is/trim (GAP-0495); Bruk / utleie/næring (GAP-0496); Oppgjør / kosmetikkMC/Scooter (GAP-0499)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-413, CR-417, CR-420, CR-426, CR-432, CR-437, CR-438, CR-440, CR-444.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 22 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-171 · storebrand · Tilhenger · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-0814 / SF-1265: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 8 (trykt 7), 7/21–24,fortsetter9. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-171].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","tilhenger","ordinary","storebrand-tilhenger-brann-og-tyveri","2026-03-01"]; ["storebrand","tilhenger","ordinary","storebrand-tilhenger-kasko","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-060, fra SCRC-011. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Frost/snø/utetthet / unntak (GAP-0814)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-454.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-172 · storebrand · Tilhenger · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0803 / SF-1251: catalog/sources/vehicle-extensions/storebrand-tilhengerforsikring.html — Produktsider/FAQ; GAP-0805 / SF-1254: catalog/sources/vehicle-extensions/storebrand-tilhengerforsikring.html — Produktside FAQ; GAP-0806 / SF-1255: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5; GAP-0807 / SF-1256: catalog/sources/vehicle-extensions/storebrand-tilhengerforsikring.html — Tilhengerproduktside/FAQ; GAP-0808 / SF-1257: catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf — PDF fysisk side 4 (trykt 3), 5. Alle 9 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-172].evidence`.

**AFFECTED SCOPE:** Providers storebrand; typer Tilhenger; scope ordinary. 2 eksakte produktidentiteter: ["storebrand","tilhenger","ordinary","storebrand-tilhenger-brann-og-tyveri","2026-03-01"]; ["storebrand","tilhenger","ordinary","storebrand-tilhenger-kasko","2026-03-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-060, fra SCRC-011. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Tegning / forutsetning (GAP-0803); Ansvar / trekkvogn (GAP-0805); Utstyr / fastmontert (GAP-0806); Last / tilhenger (GAP-0807); Aldersfradrag / utstyr (GAP-0808); Utleie/næring / særavtale (GAP-0813); Oppgjør / kosmetikk/reparasjon (GAP-0817); Rettshjelp / egenandel (GAP-0820); Rettshjelp / unntak (GAP-0821)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-447, CR-448, CR-457, CR-459, CR-462, CR-463, CR-464, CR-466, CR-467.

**EXPECTED LEVERAGE:** 9 P1-signaturer / 18 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-173 · tryg · Bil · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-3906 / SF-5548: catalog/sources/tryg/hus/05PGE91500.pdf — 4 §6.1; GAP-3923 / SF-5581: catalog/sources/tryg/Bilforsikring-Delkasko.pdf — 3§3.3. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-173].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Bil; scope ordinary. 3 eksakte produktidentiteter: ["tryg","bil","ordinary","bil-ansvar","PAU25003"]; ["tryg","bil","ordinary","bil-delkasko","PAU25835"]; ["tryg","bil","ordinary","bil-kasko","PAU25205"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-061, fra SCRC-043. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Rettshjelp / sum (GAP-3906); Elektronikk / aldersfradrag (GAP-3923)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-011, CR-026.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-174 · tryg · Bobil · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4044 / SF-5797: catalog/sources/mc-bobil/tryg-05PAU25335.pdf — 3§3.3. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-174].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Bobil; scope ordinary. 1 eksakte produktidentiteter: ["tryg","bobil","ordinary","tryg-bobil-delkasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-062, fra SCRC-044. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Elektronikk / aldersfradrag (GAP-4044)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-042.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-175 · tryg · Båt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4259 / SF-6097: catalog/sources/boat-pet/tryg-boat-accident-terms.pdf — 1–2 §3; GAP-4295 / SF-6142: catalog/sources/boat-pet/tryg-boat-product.html — Reparasjon/skifteavdrev; GAP-4318 / SF-6168: catalog/sources/boat-pet/tryg-boat-extra-terms.pdf — 1 §1.2; GAP-4319 / SF-6169: catalog/sources/boat-pet/tryg-boat-extra-terms.pdf — 1 §1.3; GAP-4320 / SF-6170: catalog/sources/boat-pet/tryg-boat-extra-terms.pdf — 1 §1.4. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-175].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Båt; scope ordinary. 5 eksakte produktidentiteter: ["tryg","båt","ordinary","tryg-bat-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-bat-ekstra","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-tyveri-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-kasko-ansvar","2024-07-01"]. Tilleggskomponenter: tryg-bat-ulykke.

**ROOT CAUSE:** RC-063, fra SCRC-046. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ulykke / sum/grad (GAP-4259); Drev / nydelsoppgjør (GAP-4295); Løsøre / sum/vilkår (GAP-4318); Dieseldyr / sum/egenandel (GAP-4319); Opplagsmateriell / sum/egenandel (GAP-4320); Vannscooterplattform / sum/egenandel (GAP-4325); Nyverdi / alder/terskel/form (GAP-4326)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-066, CR-067, CR-078, CR-082, CR-085, CR-102, CR-112.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 12 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-176 · tryg · Campingvogn · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4141 / SF-5937: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — §3.2; GAP-4158 / SF-5960: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — §3.2; GAP-4178 / SF-5986: catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf — §3.2; GAP-4143 / SF-5940: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — §3.3; GAP-4160 / SF-5963: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — §3.3. Alle 12 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-176].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Campingvogn; scope ordinary. 4 eksakte produktidentiteter: ["tryg","campingvogn","ordinary","tryg-campingvogn-brann","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-brann-og-tyveri","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-campingvogn-ekstra","2026-01-01"]; ["tryg","campingvogn","ordinary","tryg-campingvogn-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-064, fra SCRC-045. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reparasjon / oppgjør (GAP-4141); Elektronikk / fradrag (GAP-4143); Fjerning / utoversum (GAP-4144); Underslag / avtaltutleie (GAP-4155); Vær / egenandel (GAP-4176)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-121, CR-123, CR-129, CR-138, CR-147.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 17 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-177 · tryg · Hund · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4340 / SF-6192: catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf — 1 §3; GAP-4343 / SF-6195: catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf — 1 §3; GAP-4351 / SF-6203: catalog/sources/boat-pet/tryg-dog-extra-terms.pdf — 1 §2; GAP-4354 / SF-6206: catalog/sources/boat-pet/tryg-dog-life-terms.pdf — 1 §2; GAP-4357 / SF-6209: catalog/sources/boat-pet/tryg-dog-life-terms.pdf — 1–2 §2. Alle 7 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-177].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["tryg","hund","ordinary","tryg-hund-behandling","2026-09-01"]. Tilleggskomponenter: tryg-hund-dod; tryg-hund-ekstra.

**ROOT CAUSE:** RC-065, fra SCRC-047. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avlivning / behandling (GAP-4340); Ledd/skjelett / kvalifikasjon (GAP-4343); Valp/kattunge / sum/periode (GAP-4351); Kremering / sum (GAP-4354); Bruksverdi / vilkår (GAP-4357); Bruksverdi / sum (GAP-4358); FirstVet / tilgang (GAP-4361)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-158, CR-164, CR-165, CR-171, CR-194, CR-195, CR-213.

**EXPECTED LEVERAGE:** 7 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-178 · tryg · Hund · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0008 / SF-0012: catalog/sources/boat-pet/tryg-dog-extra-terms.pdf — PDF side 1, Egenandeler. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-178].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["tryg","hund","ordinary","tryg-hund-behandling","2026-09-01"]. Tilleggskomponenter: tryg-hund-ekstra.

**ROOT CAUSE:** RC-065, fra SCRC-001. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ekstra / egenandel (GAP-0008)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-169.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-179 · tryg · Innbo · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4391 / SF-6247: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s1 §1.1; Ekstra s1; GAP-4420 / SF-6288: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s1 §1.1; Ekstra s1; exact Ekstra clause controls; GAP-4394 / SF-6250: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s2 §1.2; Ekstra s2; GAP-4423 / SF-6291: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — s2 §1.2; Ekstra s2; exact Ekstra clause controls; GAP-4405 / SF-6265: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — s4 §2.5. Alle 6 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-179].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo","2026-07-01"]; ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-066, fra SCRC-048. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Små bygninger / area_sum (GAP-4391); Merutgifter / moving_storage (GAP-4394); Andre skader / specified_perils (GAP-4405); Glass/sanitær/integrerte hvitevarer / scope_trigger (GAP-4439)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-011, B-015, CR-247, CR-258, CR-262, CR-272.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-180 · tryg · Innbo · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0127 / SF-0220: catalog/sources/tryg/innbo/Innbo_og_losore_PPK13301.pdf — PDF side 3, 2.3 Vann; GAP-0129 / SF-0224: catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf — PDF side 3, 2.3 Vann. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-180].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo","2026-07-01"]; ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-066, fra SCRC-005. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Vann / terreng-egenandel (GAP-0127)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** B-011, B-015, CR-280.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-181 · tryg · Katt · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4368 / SF-6221: catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf — 1 §3; GAP-4371 / SF-6224: catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf — 1 §3; GAP-4378 / SF-6231: catalog/sources/boat-pet/tryg-cat-extra-terms.pdf — 1 §2; GAP-4381 / SF-6234: catalog/sources/boat-pet/tryg-cat-life-terms.pdf — 1 §2; GAP-4386 / SF-6239: catalog/sources/boat-pet/tryg-cat-product.html — FirstVet. Alle 5 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-181].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["tryg","katt","ordinary","tryg-katt-behandling","2026-09-01"]. Tilleggskomponenter: tryg-katt-dod; tryg-katt-ekstra.

**ROOT CAUSE:** RC-067, fra SCRC-047. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avlivning / behandling (GAP-4368); Ledd/skjelett / kvalifikasjon (GAP-4371); Valp/kattunge / sum/periode (GAP-4378); Kremering / sum (GAP-4381); FirstVet / tilgang (GAP-4386)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-290, CR-301, CR-319, CR-320, CR-336.

**EXPECTED LEVERAGE:** 5 P1-signaturer / 5 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-182 · tryg · Katt · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-0017 / SF-0027: catalog/sources/boat-pet/tryg-cat-extra-terms.pdf — PDF side 1, Egenandeler. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-182].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["tryg","katt","ordinary","tryg-katt-behandling","2026-09-01"]. Tilleggskomponenter: tryg-katt-ekstra.

**ROOT CAUSE:** RC-067, fra SCRC-001. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/boat-pet-registry.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ekstra / egenandel (GAP-0017)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-299.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-183 · tryg · MC · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-3955 / SF-5662: catalog/sources/mc-bobil/tryg-05PAU20900.pdf — 1 §4; GAP-3958 / SF-5666: catalog/sources/mc-bobil/tryg-05000PA209.pdf — 1–2; GAP-4016 / SF-5750: catalog/sources/mc-bobil/tryg-05PAU27010.pdf — 1 §1. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-183].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer MC; scope ordinary. 4 eksakte produktidentiteter: ["tryg","mc","ordinary","tryg-mc-ansvar","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-delkasko","2026-01-01"]; ["tryg","mc","ordinary","tryg-mc-kasko","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-mc-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-068, fra SCRC-044. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/mc-bobil-registry.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avregistrering / videreføring (GAP-3955); Fører/bruk / avgrensning (GAP-3958); Ferge/tog / bonustap (GAP-4016)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-345, CR-353, CR-355.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 9 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-184 · tryg · Reise · ordinary: Avklar semantisk plassering før P1-dimensjoner materialiseres

**PURPOSE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**EVIDENCE:** GAP-4476 / SF-6455: catalog/sources/tryg/reise/canonical/PRF46001-Reise-Reise-Ekstra.pdf — s6§5.2; GAP-4525 / SF-6550: catalog/sources/tryg/reise/canonical/PRF46003-Reise-Premium.pdf — s6§5.2; GAP-4481 / SF-6463: catalog/sources/tryg/reise/canonical/Reiseforsikring-produktside.html — FAQegenandel. Alle 3 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-184].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Reise; scope ordinary. 3 eksakte produktidentiteter: ["tryg","reise","ordinary","tryg-reise","2026-09-20-canonical"]; ["tryg","reise","ordinary","tryg-reise-ekstra","2026-09-20-canonical"]; ["tryg","reise","ordinary","tryg-reise-premium","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-069, fra SCRC-050. Lag: CANONICAL_MODEL_REVIEW.

**WHAT MUST CHANGE:** Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-reise-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/insurance-normalization.ts](/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts).

**SOURCE READINESS:** CANONICAL_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Familie syk på reisemål / duration (GAP-4476); Egenandel / selected_options (GAP-4481)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-374, CR-380.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-185 · tryg · Snøscooter · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4111 / SF-5900: catalog/sources/vehicle-extensions/tryg-odpdf-0d60de94.pdf — §3.2; GAP-4128 / SF-5921: catalog/sources/vehicle-extensions/tryg-odpdf-5a0a847f.pdf — §3.2; GAP-4113 / SF-5902: catalog/sources/vehicle-extensions/tryg-odpdf-0d60de94.pdf — §3.3; GAP-4130 / SF-5923: catalog/sources/vehicle-extensions/tryg-odpdf-5a0a847f.pdf — §3.3; GAP-4123 / SF-5916: catalog/sources/vehicle-extensions/tryg-odpdf-5a0a847f.pdf — 3 §3.6. Alle 5 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-185].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Snøscooter; scope ordinary. 2 eksakte produktidentiteter: ["tryg","snøscooter","ordinary","tryg-snoscooter-brann-og-tyveri",null]; ["tryg","snøscooter","ordinary","tryg-snoscooter-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-070, fra SCRC-045. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reparasjon / oppgjør (GAP-4111); Totalskade / marked (GAP-4113); Vær / egenandel (GAP-4123)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-436, CR-439, CR-446.

**EXPECTED LEVERAGE:** 3 P1-signaturer / 5 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-186 · tryg · Tilhenger · ordinary: Avklar typegyldige nøkler og detaljkobling

**PURPOSE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**EVIDENCE:** GAP-4214 / SF-6035: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — §3.2; GAP-4229 / SF-6056: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — §3.2; GAP-4247 / SF-6080: catalog/sources/vehicle-extensions/tryg-odpdf-03ff0533.pdf — §3.2; GAP-4216 / SF-6038: catalog/sources/vehicle-extensions/tryg-odpdf-543856fa.pdf — §3.3; GAP-4231 / SF-6059: catalog/sources/vehicle-extensions/tryg-odpdf-05b2538c.pdf — §3.3. Alle 13 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-186].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Tilhenger; scope ordinary. 3 eksakte produktidentiteter: ["tryg","tilhenger","ordinary","tryg-tilhenger-brann","2026-01-01"]; ["tryg","tilhenger","ordinary","tryg-tilhenger-brann-og-tyveri","2026-01-01"]; ["tryg","tilhenger","ordinary","tryg-tilhenger-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-071, fra SCRC-045. Lag: CANONICAL_MAPPING.

**WHAT MUST CHANGE:** Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: [lib/vehicle-object-registry.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts).

**SOURCE READINESS:** MAPPING_REVIEW_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SMALL_CODE; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reparasjon / oppgjør (GAP-4214); Elektronikk / fradrag (GAP-4216); Fjerning / utoversum (GAP-4217); Underslag / avtaltutleie (GAP-4226); Vær / egenandel (GAP-4245); Glass / egenandel (GAP-4246)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** CR-450, CR-452, CR-456, CR-461, CR-465, CR-469.

**EXPECTED LEVERAGE:** 6 P1-signaturer / 13 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-187 · Avklar behandlingsscope før Gjensidige rehabilitering flyttes

**PURPOSE:** Flytt ikke hele fysikalsk-behandlingstemaet blindt. Avklar SC-035s grense mellom basisbehandling og valgfri rehabilitering; deretter korrekt optional-komponent.

**EVIDENCE:** GAP-2892 / SF-4044: catalog/sources/boat-pet/gjensidige-dog-ipid.pdf — IPID1;webRehabilitering. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-187].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-113, fra SCRC-035. Lag: ADDON.

**WHAT MUST CHANGE:** Flytt ikke hele fysikalsk-behandlingstemaet blindt. Avklar SC-035s grense mellom basisbehandling og valgfri rehabilitering; deretter korrekt optional-komponent.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** MEDIUM; SOURCE_RESEARCH; NOT_SAFE_FOR_PARALLEL_EXECUTION. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; 5 000-grensen må ikke antyde ubetinget valgt dekning, og dokumentert basisakupunktur må ikke forsvinne.

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** HR-003, SR-031.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-188 · eika-fremtind · Campingvogn · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5308 / SF-7567: catalog/sources/vehicle-extensions/fremtind-IPID_Tilhenger_Campingvogn.pdf — IPIDV103s1;fullpakke. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-188].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Campingvogn; scope ordinary. 2 eksakte produktidentiteter: ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-kasko","2024-03-21"]; ["eika-fremtind","campingvogn","ordinary","eika-fremtind-campingvogn-minikasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-079, fra SCRC-056. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar/ulykke/rettshjelp / conflict (GAP-5308)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-012.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-189 · eika-fremtind · Tilhenger · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5329 / SF-7591: catalog/sources/vehicle-extensions/fremtind-IPID_Tilhenger_Campingvogn.pdf — IPIDV103s1;fullpakke. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-189].evidence`.

**AFFECTED SCOPE:** Providers eika-fremtind; typer Tilhenger; scope ordinary. 1 eksakte produktidentiteter: ["eika-fremtind","tilhenger","ordinary","eika-fremtind-tilhenger-kasko","2024-03-21"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-079, fra SCRC-056. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar/ulykke/rettshjelp / conflict (GAP-5329)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-012.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-190 · fremtind · Bobil · ordinary-dnb: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5386 / SF-7670: catalog/sources/mc-bobil/fremtind-dnb-bobil-page.html — DNBpage/fullPMO2025/IPIDV106; GAP-5406 / SF-7697: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5–6§3.2; GAP-5414 / SF-7705: catalog/sources/mc-bobil/fremtind-dnb-bobil-page.html — Mini§3.2s5/DNBmatrix; GAP-5448 / SF-7750: catalog/sources/mc-bobil/fremtind-dnb-bobil-page.html — DNB Leieut og Hvaikkedekket;Kasko§1.1. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-190].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Bobil; scope ordinary-dnb. 4 eksakte produktidentiteter: ["fremtind","bobil","ordinary-dnb","fremtind-bobil-ansvar","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-kasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-minikasko","2025-09-18"]; ["fremtind","bobil","ordinary-dnb","fremtind-bobil-topp","2025-09-18"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-076, fra SCRC-057. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-fremtind-frende-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-fremtind-frende-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kanal-versjon / conflict (GAP-5386); Totalskade / market_settlement (GAP-5406); Minikasko nyverdi / level_conflict (GAP-5414); Utleie / channel_rule (GAP-5448)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-006.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 10 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-191 · fremtind · Innbo · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5032 / SF-7213: catalog/sources/fremtind/innbo/canonical/IPID_Innbo.pdf — s1Begrensninger. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-191].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Innbo; scope ordinary. 2 eksakte produktidentiteter: ["fremtind","innbo","ordinary","fremtind-innbo-standard","2025-01-01"]; ["fremtind","innbo","ordinary","fremtind-innbo-topp","2025-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-075, fra SCRC-052. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Kunst / source_conflict (GAP-5032)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-005.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-192 · fremtind · Reise · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5178 / SF-7412: catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf — s4–5§7.5.6/§8;IPID s2. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-192].evidence`.

**AFFECTED SCOPE:** Providers fremtind; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["fremtind","reise","ordinary","fremtind-reise","PRE-450.200-015"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-080, fra SCRC-054. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Sikkerhetsforskrifter / source_support (GAP-5178)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-013.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-193 · fremtind-four-bil-ids · Bil · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4575 / SF-6617: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5–6§3.2; GAP-4688 / SF-6763: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5–6§3.2; GAP-4801 / SF-6909: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5–6§3.2; GAP-4914 / SF-7055: catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf — s5–6§3.2. Alle 4 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-193].evidence`.

**AFFECTED SCOPE:** Providers dnb-fremtind, eika-fremtind, fremtind, sparebank1-fremtind; typer Bil; scope ordinary. 4 eksakte produktidentiteter: ["dnb-fremtind","bil","ordinary","dnb-bil-delkasko","PMO-357.001-004"]; ["eika-fremtind","bil","ordinary","eika-bil-delkasko","PMO-357.001-004"]; ["fremtind","bil","ordinary","fremtind-bil-delkasko","PMO-357.001-004"]; ["sparebank1-fremtind","bil","ordinary","sb1-bil-delkasko","PMO-357.001-004"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-073, fra SCRC-051. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Totalskade / market_settlement (GAP-4575); Totalskade / market_settlement (GAP-4688); Totalskade / market_settlement (GAP-4801); Totalskade / market_settlement (GAP-4914)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-003.

**EXPECTED LEVERAGE:** 4 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-194 · gjensidige · Campingvogn · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-2645 / SF-3756: catalog/sources/vehicle-extensions/gjensidige-MOT07.pdf — IPID1. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-194].evidence`.

**AFFECTED SCOPE:** Providers gjensidige; typer Campingvogn; scope ordinary. 1 eksakte produktidentiteter: ["gjensidige","campingvogn","ordinary","gjensidige-campingvogn-delkasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-081, fra SCRC-034. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Glass / source conflict (GAP-2645)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-028.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-195 · sparebank1-fremtind · Båt · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5502 / SF-7826: catalog/sources/boat-pet/fremtind-boat-terms.pdf — Mini§5.1s4; GAP-5511 / SF-7835: catalog/sources/boat-pet/fremtind-sb1-boat-product.html — SB1FAQ/IPIDV103. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-195].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Båt; scope ordinary. 3 eksakte produktidentiteter: ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-delkasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-kasko","2024-06-10"]; ["sparebank1-fremtind","båt","ordinary","sparebank1-fremtind-bat-toppkasko","2024-06-10"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-078, fra SCRC-058. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Ansvar / sum_ambiguity (GAP-5502); Kanal / conflicts (GAP-5511)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-011.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 6 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-196 · sparebank1-fremtind · Hund · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5607 / SF-7951: catalog/sources/boat-pet/fremtind-sb1-dog-product.html — SB1Valpeforsikring FAQ/IPID; GAP-5608 / SF-7953: catalog/sources/boat-pet/fremtind-sb1-dog-product.html — SB1varighet/fullDød-tap. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-196].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","hund","ordinary","sparebank1-fremtind-hund-veterin-r","2025-08-07"]. Tilleggskomponenter: sparebank1-fremtind-hund-liv; sparebank1-fremtind-hund-valpekull.

**ROOT CAUSE:** RC-077, fra SCRC-059. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Valpekull / optional (GAP-5607); Liv kildekonflikt / boundary (GAP-5608)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-009, SR-010.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-197 · sparebank1-fremtind · Katt · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-5629 / SF-7977: catalog/sources/boat-pet/fremtind-sb1-cat-product.html — §8s2/SB1Egenandel; GAP-5630 / SF-7978: catalog/sources/boat-pet/fremtind-sb1-cat-product.html — SB1varighet/fullDød-tap. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-197].evidence`.

**AFFECTED SCOPE:** Providers sparebank1-fremtind; typer Katt; scope ordinary. 1 eksakte produktidentiteter: ["sparebank1-fremtind","katt","ordinary","sparebank1-fremtind-katt-veterin-r","2025-08-07"]. Tilleggskomponenter: sparebank1-fremtind-katt-liv.

**ROOT CAUSE:** RC-074, fra SCRC-059. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Katt kildekonflikt / deductible (GAP-5629); Liv kildekonflikt / boundary (GAP-5630)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-004, SR-009.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 2 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-198 · tryg · Bobil · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4025 / SF-5765: catalog/sources/mc-bobil/tryg-05PAU18800.pdf — 1 §4; GAP-4028 / SF-5770: catalog/sources/mc-bobil/tryg-bobil-product.html — FAQ avregistrering. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-198].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Bobil; scope ordinary. 4 eksakte produktidentiteter: ["tryg","bobil","ordinary","tryg-bobil-ansvar","2026-07-01"]; ["tryg","bobil","ordinary","tryg-bobil-bobil-ekstra","2026-07-01"]; ["tryg","bobil","ordinary","tryg-bobil-delkasko","2026-01-01"]; ["tryg","bobil","ordinary","tryg-bobil-kasko","2026-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-086, fra SCRC-044. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avregistrering / videreføring (GAP-4025); Avregistrering / nettside konflikt (GAP-4028)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-068.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 8 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-199 · tryg · Båt · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4262 / SF-6102: catalog/sources/boat-pet/tryg-boat-inboard-terms.pdf — 1 §2; GAP-4297 / SF-6144: catalog/sources/boat-pet/tryg-boat-machinery-terms.pdf — 1 §1. Alle 2 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-199].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Båt; scope ordinary. 5 eksakte produktidentiteter: ["tryg","båt","ordinary","tryg-bat-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-bat-ekstra","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-brann-tyveri-ansvar","2024-07-01"]; ["tryg","båt","ordinary","tryg-bat-kasko-ansvar","2024-07-01"]. Tilleggskomponenter: tryg-bat-maskinskade.

**ROOT CAUSE:** RC-082, fra SCRC-046. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Generelt / kildetilgang (GAP-4262); Maskinskade / valgfri/alder (GAP-4297)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-059, SR-060.

**EXPECTED LEVERAGE:** 2 P1-signaturer / 7 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-200 · tryg · Hund · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4363 / SF-6215: catalog/sources/boat-pet/tryg-dog-product.html — FAQ dekkesikke. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-200].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Hund; scope ordinary. 1 eksakte produktidentiteter: ["tryg","hund","ordinary","tryg-hund-behandling","2026-09-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-084, fra SCRC-047. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/boat-pet-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/boat-pet-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avlivning / kildekonflikt (GAP-4363)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-065.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-201 · tryg · Innbo · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4449 / SF-6324: catalog/sources/tryg/innbo/IPID_Innbo.pdf — s1. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-201].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Innbo; scope ordinary. 1 eksakte produktidentiteter: ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-083, fra SCRC-048. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-innbo-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-innbo-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; IPID/fullvilkår / conflict_candidate (GAP-4449)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-064.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-202 · tryg · MC · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-3959 / SF-5667: catalog/sources/mc-bobil/tryg-mc-product.html — FAQ Hvor gjelder. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-202].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer MC; scope ordinary. 4 eksakte produktidentiteter: ["tryg","mc","ordinary","tryg-mc-ansvar","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-delkasko","2026-01-01"]; ["tryg","mc","ordinary","tryg-mc-kasko","2026-07-01"]; ["tryg","mc","ordinary","tryg-mc-mc-ekstra","2026-07-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-085, fra SCRC-044. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/mc-bobil-tryg-if-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/mc-bobil-tryg-if-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Geografi / nettside konflikt (GAP-3959)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-067.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 4 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-203 · tryg · Reise · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4490 / SF-6477: catalog/sources/tryg/reise/canonical/Reiseforsikring-produktside.html — Reisedager;FAQbackpacking/borteboendebarn. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-203].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Reise; scope ordinary. 1 eksakte produktidentiteter: ["tryg","reise","ordinary","tryg-reise-ekstra","2026-09-20-canonical"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-088, fra SCRC-050. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/tryg-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/tryg-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Reiselengde / standard_conflict (GAP-4490)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-070.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 1 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-204 · tryg · Snøscooter · ordinary: Avklar konflikt eller kildepakke før berørte påstander endres

**PURPOSE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**EVIDENCE:** GAP-4091 / SF-5877: catalog/sources/vehicle-extensions/tryg-odpdf-dbf5be98.pdf — 1 §4;IPID2;FAQ. Alle 1 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-204].evidence`.

**AFFECTED SCOPE:** Providers tryg; typer Snøscooter; scope ordinary. 3 eksakte produktidentiteter: ["tryg","snøscooter","ordinary","tryg-snoscooter-ansvar",null]; ["tryg","snøscooter","ordinary","tryg-snoscooter-brann-og-tyveri",null]; ["tryg","snøscooter","ordinary","tryg-snoscooter-kasko",null]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-087, fra SCRC-045. Lag: SOURCE_AUTHORITY.

**WHAT MUST CHANGE:** Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/vehicle-object-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/vehicle-object-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** SOURCE_RESEARCH_FIRST. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** HIGH; SOURCE_RESEARCH; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Avregistrering / regelkonflikt (GAP-4091)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** SR-069.

**EXPECTED LEVERAGE:** 1 P1-signaturer / 3 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 ASTRA EXTRA HIGH.

## B-205 · fremtind-eika-legacy · Reise · ordinary: Historisk Eika: behold separat utbedringsplan

**PURPOSE:** Ingen endring i aktiv pilotbatch. P10/P15 må avklares/rettes før disse historiske kundeproduktene sammenlignes; avgrensningen er ikke en friskmelding av historisk PDF-flyt.

**EVIDENCE:** GAP-5179 / SF-7414: catalog/sources/fremtind/reise/canonical/reise-vilkar-p10.pdf — §1.2 s4; GAP-5181 / SF-7417: catalog/sources/fremtind/reise/canonical/reise-vilkar-p10.pdf — §1.3 s5;P15.14s27; GAP-5183 / SF-7419: catalog/sources/fremtind/reise/canonical/reise-vilkar-p10.pdf — §2.3s6;P15.1–5s27; GAP-5194 / SF-7432: catalog/sources/fremtind/reise/canonical/reise-vilkar-p10.pdf — §3.4s12; GAP-5200 / SF-7439: catalog/sources/fremtind/reise/canonical/reise-vilkar-p10.pdf — §6.3s18;P15.9s27. Alle 21 produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[B-205].evidence`.

**AFFECTED SCOPE:** Providers fremtind-eika-legacy; typer Reise; scope ordinary. 2 eksakte produktidentiteter: ["fremtind-eika-legacy","reise","ordinary","eika-reise-p10","P10-P10P-2025-01-01"]; ["fremtind-eika-legacy","reise","ordinary","eika-reise-pluss-p10","P10-P10P-2025-01-01"]. Tilleggskomponenter: ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt.

**ROOT CAUSE:** RC-072, fra SCRC-055. Lag: HISTORICAL_SCOPE.

**WHAT MUST CHANGE:** Ingen endring i aktiv pilotbatch. P10/P15 må avklares/rettes før disse historiske kundeproduktene sammenlignes; avgrensningen er ikke en friskmelding av historisk PDF-flyt.

**WHAT MUST NOT CHANGE:** document > catalog; optional availability != customer selected; unknown != not covered; provider/type/scope/version isolation; product level and add-on boundaries; side-swap symmetry without invented equivalents; age start/reduction/expiry and object age kept distinct; annual/accumulated/coverage mileage kept distinct; per event/year/lifetime/selected sum kept distinct; source page/hash and fact-specific provenance; same object identity and pricing/TFA are not catalog eligibility

**FILES:** [lib/fremtind-reise-catalog.ts](/Users/morten/Documents/forsikringsapp/lib/fremtind-reise-catalog.ts). Betinget, bare etter eksplisitt behov: ingen.

**SOURCE READINESS:** DEFERRED. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.

**IMPLEMENTATION RISK:** LOW; DEFERRED; MAIN_AGENT_REVIEW_REQUIRED. Delte filer: se file-collisions.csv.

**TEST REQUIREMENTS:** Own-source exact subject/value/unit/period/conditions with page/hash; Exact base, inherited, optional and unavailable product-level combinations; Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate; Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected; Cross-provider/type/scope/version negatives; no customer object/pricing changes; Personer / eligibility (GAP-5179); Evakuering / limits (GAP-5181); Reisegods / sublimits (GAP-5183); Eneste ledsager / sum (GAP-5194); Forsinket fremmøte / limits (GAP-5200); Forsinket fremmøte sykdom / limits (GAP-5201); Forsinket avgang / limits (GAP-5202); Forsinket bagasje / limits (GAP-5203); Avbestilling / limits (GAP-5204); Avbestilling / triggers (GAP-5205); Ulykke / sums (GAP-5208); Ulykke behandling / limits (GAP-5211); Historisk produktisolasjon / reise.personer.omfang (GAP-5212); Historisk produktisolasjon / reise.bagasje.mobil (GAP-5213); Historisk produktisolasjon / reise.bagasje.mobil_egenandel (GAP-5214); Historisk produktisolasjon / reise.omrade.ud (GAP-5215); Avbestilling / group (GAP-5250); Historisk produktisolasjon / reise.rettshjelp.egenandel (GAP-5256); Historisk produktisolasjon / reise.ulykke.behandling (GAP-5257); Historisk produktisolasjon / reise.ulykke.behandling_egenandel (GAP-5258); Historisk produktisolasjon / reise.ulykke.tann_egenandel (GAP-5259)

**POST-FIX AUDIT:** Compare before/after exact scoped products against independent source-fact inventory; Reverse-check changed claims for support and wrong-level leakage; Re-run linked false-unknown controls with own-source oracle; inspect sources and details; Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls; Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation.

**DEPENDENCIES:** Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves.

**EXPECTED LEVERAGE:** 21 P1-signaturer / 37 forekomster; 0 tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.

**CUSTOMER/PDF IMPACT:** LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen extraction-endring er bevist nødvendig.

**MODEL RECOMMENDATION:** GPT-6 SOL MEDIUM.
