# SOURCE_CATALOG_COMPLETENESS_AUDIT



**PARTIAL — CONTINUATION CHECKPOINT**



Run: `SC-AUDIT-2026-09-29-d3a3798`; checkpoint: 2026-10-01T14:00:05.060768+00:00

HEAD: `d3a37985fce4ada65fa2f7a88462d8834e4677af`; branch main; repository read-only.

Catalog fingerprint `914eec32721689370076ec28a5c5417e792c27ec3791926df8c9d15aa42da744`.

Source corpus fingerprint `c519373bef7ea53a3e9c1e80e3ec52578657e7e6d60c6502ced52b9da88e9823`.



## Progress

Products: 204 complete, 0 partial, 0 not started, of204. Complete means review closure, not gap-free catalog.

Add-ons: 84 complete, 0 partial, 0 not started, of84.

Since original checkpoint: +7851 checked source-fact occurrences; +5579 finding occurrences.

8104 source-fact occurrences / 3851 unique source semantic rules; 7774 advisor-relevant occurrences. The total unreviewed semantic denominator is unknown.



## Family progress



|Family|Complete|Partial|Not started|P1 occurrences|P2 occurrences|

|---|---:|---:|---:|---:|---:|

|Bil|35|0|0|490|512|

|Innbo|12|0|0|259|221|

|Hus|13|0|0|253|171|

|Reise|14|0|0|334|198|

|Snøscooter|18|0|0|233|157|

|Campingvogn|17|0|0|235|154|

|Tilhenger|12|0|0|102|105|

|MC|19|0|0|230|210|

|Bobil|24|0|0|360|313|

|Båt|20|0|0|417|207|

|Hund|10|0|0|206|96|

|Katt|10|0|0|162|89|



## Findings

5714 occurrences, 2608 deduplicated signatures. P0 0 (0 unique); P1 3281 (1589 unique); P2 2433 (1020 unique); P3 0. Shared-source repetitions are not independent root causes.

Verified visible false unknowns: 29; further catalog omissions do not count as UI-verified without a probe.

Missing: 2661; too coarse: 2910; mismapped: 38; unsupported source claims: 44 proven, 0 candidates.

Source conflicts: 70; no arbitrary source precedence chosen.



## Root causes / proposed remediation

- SCRC-001 / RB-01: Basismodellen bygger på et kort IPID-utvalg; rike behandlings-/produktvilkår er lokale, men flere presise regler er aldri ført inn. Liv/Ekstra har også sparsomme håndskrevne facts. Gjensidige Hund/Katt har samme kildeutnyttelsesgap: 4–5 basisrader og ett fakta per Liv/Bruk-modul, mens egne behandlings- og livsvilkår er tilgjengelige lokalt. (93 occurrences; DATA_ONLY).

- SCRC-002 / RB-01: Eksplisitte nivåtabeller er modellert som 3/6/8 hovedfacts. Felles veterinærpunkter og betingelser som livstidsperiode, skadefri opptjening og TR-undergrense mangler i raddefinisjonene. (37 occurrences; DATA_ONLY).

- SCRC-003 / RB-02: Felles boatCore/boatFire/boatKasko gir grove Included-foreldre. Super rekonstruerer basis i stedet for å inkludere Kaskoens opplagsutstyrsrad. Kildens felles begrensninger og ytelser er ikke ført inn. Frende bruker samme grove boatCore/Fire/Kasko-funksjoner. Utvidet rekonstruerer Kasko uten dens løsørerad; to optional-komponenter har kun én tilgjengelighetsrad hver. Gjensidige bruker samme IPID-baserte boatFire/Kasko-hjelpere; Delkasko mister redning selv om egen IPID/fullkilde dokumenterer den, og lokale fullvilkår er ikke utnyttet for materielle grenser/vilkår. (266 occurrences; SMALL_CODE).

- SCRC-004 / RB-03: Typebestemt skjelett over felles kjøretøyvilkår har dekning/geografi/utstyr, men mangler felles rettshjelp-dimensjoner og uttrykkelige snøscooter-/campingvognregler. Valgfri førerulykke mangler også som komponent. (27 occurrences; SMALL_CODE).

- SCRC-005 / RB-04: Kontrollerte hovedmekanismer er riktige, men enkelte uttrykkelige egenandels-/oppgjørs-/tjenesteregler finnes bare i lokale fullvilkår. Årsak utover utelatte katalograder er ikke bevist. (13 occurrences; DATA_ONLY).

- SCRC-006 / RB-05: MC Mini/Kasko-radsett utelater uttrykkelig MC-nyverdi fra felles vilkår; Bobil Topp henviser til startleieregel uten innhold og utelater egne mindre tilleggsytelser. Scope er bevart; ingen kanal-sammenblanding påvist. (5 occurrences; DATA_ONLY).

- SCRC-007 / RB-06: Storebrand Hund/Katt er håndskrevet som veterinærbasens tre facts pluss opphørsalder og et kort dødsfallssett. Dyr04s detaljerte veterinær-, forsvinnings- og brukstapsregler er ikke ført inn. Kombinasjonsproduktet gjentar samme begrensede rader; runtime mister dem ikke. (138 occurrences; SMALL_CODE).

- SCRC-008 / RB-07: Frende Innbo har et rikt og stort sett kildekorrekt radsett, men utelater enkelte standardhendelser, oppgjørsregler og konkrete vilkår bak generelle referanser. Uhell modellerer objektunntak, men ikke skadeårsaksunntak. Ingen runtime-tap av allerede definerte facts funnet. (20 occurrences; SMALL_CODE).

- SCRC-009 / RB-08: Frende Hus har detaljert og stort sett korrekt basemodell. Enkelte oppgjørsvilkår, indeksprisstigning/egenbrukstap og konkrete unntak er ikke representert; dette er utelatte forfatterrader, ikke tap i inheritance. Aldersfradragets årsaksbegrensning finnes allerede i structuredValue, og materialunntaket i label; de er IKKE katalogmangler. (31 occurrences; SMALL_CODE).

- SCRC-010 / RB-09: Frende Reise har en omfattende base, men enkelte eksplisitte avgrensninger og sekundærytelser er utelatt fra forfatterradene: blant annet familiekrav, avbestillingsvilkår, reisesykeunntak, innhenting av reiserute og dødsbegunstigelse. Ingen bevis for tap i motoren. (22 occurrences; DATA_ONLY).

- SCRC-011 / RB-10: Storebrands identiske motor09-kilde er manuelt avkortet forskjellig i Bil, MC/Bobil og Snøscooter. Storebrand Bil bevarer flere detaljer enn de nyere typekatalogene; Snøscooter har bare3–7facts. Samme fullvilkår dokumenterer flere summer, egenandeler, vilkår og tilleggsytelser. Ingen bevis for runtime/inheritance-tap. Campingvogn/Tilhenger i samme vehicle-object-katalogfunksjon bevarer korte hoveddekninger, men utelater konkrete camp02-dimensjoner. Kildekonflikter skilles fra påviste utelatelser. (498 occurrences; SMALL_CODE).

- SCRC-012 / RB-11: Storebrand Innbo innbo09-radene lagrer mange beløp, men utelater konkrete grensevilkår, aldersfradrag og enkelte egne ytelser. Manglene finnes i kilde-til-katalogforfattingen, ikke ved tap av resolverte facts. (101 occurrences; DATA_ONLY).

- SCRC-013 / RB-11: Flytting i Storebrand Innbo Super har en eksplisitt grense50000pergjenstand i katalogen som ikke støttes av den komplette lokale innbo09-pakken. Feilen er i katalogens tallpåstand, ikke comparison. (1 occurrences; DATA_ONLY).

- SCRC-014 / RB-12: Storebrand Hus HUS10/UTLEI03 har detaljert lokal dokumentasjon som delvis er utelatt eller grovere i håndskrevne katalogfacts; aldersfradrag for utvendige rør mangler materialavgrensning. Kildemotstrid behandles separat. (102 occurrences; DATA_ONLY).

- SCRC-015 / RB-13: Storebrand Reise reise10-katalogen er en hovedsum-/oversiktsmodell: flere selvstendige ytelser, utløsere, aldersfradrag og viktige unntak fra fullvilkåret mangler. Standard forsinkelse slår sammen fremmøte og avgang med ulik transportgrense. (111 occurrences; DATA_ONLY).

- SCRC-016 / RB-14: Frende pet packages encode six base facts and sparse optional components; source-documented limits, diagnosis conditions, settlement restrictions and services are absent or overly broad. Exact optional dependency of Bruksverdi on Tap is expressed in prose but not component membership. (47 occurrences; SMALL_CODE).

- SCRC-017 / RB-15: Frende Bil preserves many exact limits but omits source-documented conditions, events and settlement rules. Fire/theft deductibles are attached only to Kasko despite Delkasko applicability. Parking-bonus text introduces unsupported age/police conditions and omits exact parking/time/vehicle qualifiers. (143 occurrences; DATA_ONLY).

- SCRC-018 / RB-16: Frende MC correct type-specific catalog avoids Bil newvalue and optional machine/rental leakage, but material shared-terms detail and source-documented mileage options remain absent/coarse. Independent package reviewed before matching; Bil parking error not inherited by MC. (77 occurrences; DATA_ONLY).

- SCRC-019 / RB-17: Frende Bobil lacks several independently documented Utvidet subcoverages while preserving other scoped terms correctly. Full package comparison is unfinished; do not extrapolate Bil omissions to Bobil or resolve conflicting web/IPID scopes. (131 occurrences; DATA_ONLY).

- SCRC-020 / RB-18: An overnight/day-trip dimension is present inside Storebrand geography free text but is absent from the explicit overnight comparison key. Key-based comparison legitimately does not reinterpret narrative; advisor sees an avoidable unknown alongside known equivalent information in another row. Tryg overnight text also combines journey purpose, which must not be inferred for Storebrand. (1 occurrences; SMALL_CODE).

- SCRC-021 / RB-19: Frende Snøscooter/Campingvogn/Tilhenger share applicable vehicle terms but their catalog mostly preserves included status and a few sums. Exact type-specific benefits, optional accident availability, legal limits, settlement and qualifying conditions are absent. No Bil-only new-value, machine or rental cover is inferred. (178 occurrences; DATA_ONLY).

- SCRC-022 / RB-20: Gjensidige Bil preserves exact main sums, detailed machine components and public-template qualifications, but omits material sublimits, family conditions, settlement, mobility branches and legal/bonus dimensions. Shared generic terms must remain scoped to named product levels. (160 occurrences; DATA_ONLY).

- SCRC-023 / RB-21: Gjensidige Innbo source-backed material family, settlement, age deduction, safety, legal, ID and ancillary coverage dimensions are absent or compressed into vague clauses. (92 occurrences; DATA_ONLY).

- SCRC-024 / RB-21: Gjensidige Innbo catalog incorrectly narrows or moves source dimensions between territory, location and deductible scopes. (8 occurrences; DATA_ONLY).

- SCRC-025 / RB-22: Gjensidige Hus keeps many precise sums and structured age exceptions, but omits material loss-of-use, safety, pest, liability, legal and service qualifications. Catalog source-page references often use Pluss offsets against Standard files. (109 occurrences; DATA_ONLY).

- SCRC-026 / RB-22: Gjensidige Hus pipe service claim adds flushing without explicit support from complete local source package. (2 occurrences; DATA_ONLY).

- SCRC-027 / RB-23: Gjensidige Hus Pluss insect extension uses replacesBase on the rodent coverage keys, erasing still-applicable base rodent meanings in resolved product facts. Standard selected rot/insect option uses same replacement. (2 occurrences; SMALL_CODE).

- SCRC-028 / RB-24: Gjensidige Reise represents many exact sums but loses material sublimits, eligibility and coverage conditions in broad parent text; service detail and precise source locators also incomplete. (97 occurrences; DATA_ONLY).

- SCRC-029 / RB-25: Gjensidige Reise Pluss inherits the standard single-item baggage limit because its component lacks the documented Pluss override. (1 occurrences; DATA_ONLY).

- SCRC-030 / RB-26: Gjensidige MC/Bobil catalogs retain core limits but omit material full-terms conditions, sublimits, services and customer-choice structures. (261 occurrences; DATA_ONLY).

- SCRC-031 / RB-27: Gjensidige MC holiday rental is applied to every non-Ansvar tier even though the supplied Delkasko package does not support the Kasko-only extension. (1 occurrences; DATA_ONLY).

- SCRC-032 / RB-28: Gjensidige Bobil skadedyr is authored only inside the Pluss block although own Kasko full terms explicitly include it. (1 occurrences; DATA_ONLY).

- SCRC-033 / RB-29: Gjensidige vehicle-extension catalogs use very sparse inclusion parents and omit source-backed sums, deductibles, eligibility, optional choices and payout conditions. (180 occurrences; DATA_ONLY).

- SCRC-034 / RB-30: Gjensidige Campingvogn Delkasko glass claim follows IPID but own full terms and HTML tier table do not include glass; source conflict not surfaced. (1 occurrences; DATA_ONLY).

- SCRC-035 / RB-31: Gjensidige optional pet benefits lack safe component scope: rehabilitation limit is stored in unconditional base; Hund Bruk does not require Liv; Katt Bruk is absent. (3 occurrences; SMALL_CODE).

- SCRC-036 / RB-32: Ifs lokale felles- og særvilkår inneholder rådgiverrelevante detaljer som mangler eller er for grovt representert i eksakte kjøretøyprodukter. Bil mangler blant annet ordinær nyverdi, mens MC/Bobil har denne fra samme hovedvilkår. (384 occurrences; DATA_ONLY).

- SCRC-037 / RB-33: If Campingvogn Super har ingen selvstendige Super-fakta: generatoren gir samme faktasett som Kasko og leser ikke den lokale SV707-/webpakken for campingvogn. (9 occurrences; DATA_ONLY).

- SCRC-038 / RB-34: If Innbo har rikt strukturert kjerneinnhold, men flere lokale materielle særgrenser, skadeutløsere og begrensninger mangler eller er forkortet til generelle henvisninger. (119 occurrences; DATA_ONLY).

- SCRC-039 / RB-35: If Hus har omfattende korrekt detaljmodellering, men enkelte vilkårsforutsetninger, oppgjørsgrener og utbyggingsregler er fortsatt bare omtalt generelt eller mangler. (92 occurrences; DATA_ONLY).

- SCRC-040 / RB-36: If Reise-kilden er rikere enn de korte hovedfaktaene: blant annet30dagers behandlingsgrense, tilkallelse, psykologhjelp og leiebilvilkår mangler. Medisinsk kjernepåstand legger også til et ikke-kildestøttet alvorlighetskrav for ulykkesskade. (109 occurrences; DATA_ONLY).

- SCRC-041 / RB-37: If Båt representerer et lite utvalg hoveddekninger, men utelater materielle summer, egenandeler, nybåt- og Superytelser. Motor/gir-egenandelens minste8k-påstand overser dokumentert4kgren. (118 occurrences; DATA_ONLY).

- SCRC-042 / RB-38: If Hund/Katt hovednivåer og Liv har bare delvis materialisert fullvilkårets sykdoms-/alders-/sumperiode- og særvilkår. Basisutredning, fødsel/medfødt, artsbestemte leddkrav og Livsytelser går tapt bak få hovedfakta. (131 occurrences; DATA_ONLY).

- SCRC-043 / RB-39: Tryg Bil har detaljert og stort sett korrekt tallmodell, men enkelte viktige kvalifikasjoner og felles rettshjelpsvilkår er ikke materialisert. Datoporten for separatLeiebil skiller snapshot29sep fra1okt;ingen manglende kilde skal antas på grunn av fravær i gammel snapshot. (48 occurrences; DATA_ONLY).

- SCRC-044 / RB-40: Tryg MC/Bobil har korrekt nivåseparasjon og de fleste sentrale tall, men sikkerhetsvilkår, noen ytelser og oppgjørsregler mangler. Kildekonflikter og overlappende aldersformuleringer skal ikke glatt normaliseres. (137 occurrences; DATA_ONLY).

- SCRC-045 / RB-41: Tryg kjøretøyutvidelser beholder nivånavn, men utelater materielle tall/vilkår. Campingvogn mister naturskade som finnes eksplisitt i egne kilder; tillegg og grunnprodukter må ha type/nivåspesifikke tall. (164 occurrences; DATA_ONLY).

- SCRC-046 / RB-42: Tryg Båt modellerer rike Ekstra-/Maskin-/ulykkesvilkår hovedsakelig som inkludert/valgfritt og taper summer, vilkår og perioder; motoralder er komprimert feil. Grunnvilkårspakken er ufullstendig lokalt. (82 occurrences; DATA_ONLY).

- SCRC-047 / RB-43: Tryg dyr har hovedsummer fra valgstruktur og noen Ekstra-beløp, men utelater diagnoser/utløsere, livsvilkår og tjenester. Tidligere tidlig-auditfunn videreføres uten duplisering. (52 occurrences; DATA_ONLY).

- SCRC-048 / RB-44: Tryg Innbo har kontrollerte hovedbeløp, men mangler materielle utløsere, gjenstandsgrenser og oppgjørsregler; Ekstra arver en fellesbodgrense fra feil fullvilkår og flytte-tyveri benevnes transportskade. (62 occurrences; DATA_ONLY).

- SCRC-049 / RB-45: Tryg Hus er en detaljrik positiv kontroll. Få gjenværende oppgjørsdetaljer er ikke materialisert: eldste del/hele kostnaden, arbeidsvederlag og enkelte spesialvilkår; ingen udokumentert innføring av bygg-under-oppføring. (16 occurrences; DATA_ONLY).

- SCRC-050 / RB-46: Tryg Reise har gode summer og mange vilkårsdimensjoner, men Tryg Legehjelp mangler på Ekstra, valgfrie/general egenandeler og ulykkesbegrensninger er ufullstendige. Lokale web/IPID-konflikter må avklares uten å erstatte bevisvalg. (75 occurrences; DATA_ONLY).

- SCRC-051 / RB-47: Fremtind Bil deler detaljerte kjernekomponenter på tvers av fire registrerte provider-IDer. Materiale om veihjelpens betingede leiebil, leasing, oppgjør og kvalifikasjoner er utelatt; kanalspesifikke kilder må bekreftes separat fra generiske vilkår. (460 occurrences; DATA_ONLY).

- SCRC-052 / RB-48: Fremtind Innbo har mange presise summer, men arvet vanntekst mister Topp-inntrengning over terreng. Personkrets, alderstabell, flere objektytelser og store uhellsbegrensninger er ikke representert. (73 occurrences; DATA_ONLY).

- SCRC-053 / RB-49: Fremtind Hus har bredt representerte summer og tillegg, men Standard har feil positiv kunstnerisk utsmykning og aldersfradrag mangler material-/hendelsesavgrensning. Flere materielle oppgjørs- og dekningsvilkår er komprimert bort. (70 occurrences; DATA_ONLY).

- SCRC-054 / RB-50: Aktiv Fremtind Reise mister flere eksplisitte beløp og kvalifikasjoner fra eget fullvilkår. Forsinkelse samler fremmøte og forsinket avgang under ulikt innhentingstak; sikkerhetsfaktum har kildepunkt7.6 som ikke finnes i arkivert gjeldende pakke. (35 occurrences; DATA_ONLY).

- SCRC-055 / RB-51: Historisk Eika P10/P15 beholder nye Fremtind-mobil- og personkretsregler uten historisk støtte; Pluss arver flere standardegenandeler. Eksplisitte forsinkelsegrenser og gamle aldersregler er for grove. (81 occurrences; SMALL_CODE).

- SCRC-056 / RB-52: Fremtind lette kjøretøy har typeavgrensede vilkår som er redusert til foreldredekninger eller utelatt: MC nyverdi, campingfukt/ferie/nyverdi og snøscooter summer/redning. Tilhenger skal ikke arve camping- eller MC-regler. (114 occurrences; DATA_ONLY).

- SCRC-057 / RB-53: Fremtind Bobil har presise hovedsummer og Topp fukt/ferie, men mangler veihjelpens separate leiebilytelse, leasingberegning, oppgjør og flere tilleggsdetaljer. DNB-nettsidens motstridende sum/nivå/utleieregler må avklares separat. (113 occurrences; DATA_ONLY).

- SCRC-058 / RB-54: Fremtind Båt minikasko har svært få facts selv om fullvilkår dokumenterer redning, natur, løsøre, utstyr og ulykke. Kasko/Topp mangler detaljerte summer, kvalifikasjoner og aldersfradrag. (92 occurrences; DATA_ONLY).

- SCRC-059 / RB-55: Fremtind dyr har foreldrefacts som utelater prosentegenandel, ventetid, sublimits og sykdomsvilkår. Hund base/Topp er ikke tilstrekkelig dimensjonert; MR/CT årsgrense feilaktig presentert som valgt sum, allergi bare tilvalg, og livsfradrag mangler niårsgruppe. (52 occurrences; SMALL_CODE).

- SCRC-060 / RB-56: Storebrand Båt has sparse base rules and incomplete level inheritance; full båt03 terms contain material qualifications and benefits absent from resolved catalog. Source conflicts are retained separately. (66 occurrences; DATA_ONLY).



Remediation is not authorized. No broad engine/schema blocker has been proven; exact missing dimensions may need small registry extensions. Do not invent peer symmetry or customer selection.



## Positive controls / method

Local full terms are read independently before exact catalog comparisons where recorded. All values/labels/structured fields/inherited and available optional facts are considered, not only missing keys. Full-source and catalog-to-source review are distinct from page parsing. Table ambiguities are rendered where needed. Online freshness was not researched.

Existing explicit customer data > catalog; optional availability != selected. Declared source ambiguity, customer-specific sums, and provider-specific detail are kept separate.



## Next resume point

OUTPUT_QUALITY_AND_ROOT_CAUSE_RECONCILIATION / all / `FINAL_INTEGRITY_AND_REPORT`; addon `None`.

Last: Reverse ledger closed; exact unresolved source scope retained; no UNREVIEWED catalog claims

Continue audit from resume.json; do not restart extraction/enumeration or begin remediation.



## Integrity / outputs

No repo/code/catalog/source/test/docs changes; no Git writes, deployment, env access, private files or web research. Latest full file/hash check is in continuation-integrity.json. /tmp/nito-prepilot-audit is untouched.



Canonical current evidence: audit.json, source-facts.json, product-ledger.csv, addon-ledger.csv, gap-findings.csv, catalog-fact-support.csv, root-cause-candidates.csv, remediation-batches.csv, source-research-queue.csv, quality-check.json and resume.json.



**Catalog pilot gate: REMEDIATION_REQUIRED. Overall semantic audit remains PARTIAL.**
