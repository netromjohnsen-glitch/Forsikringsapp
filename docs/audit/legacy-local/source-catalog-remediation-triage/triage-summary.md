# NITO_CATALOG_REMEDIATION_TRIAGE

## STATUS

**TRIAGE_COMPLETE.** Planen er ferdig. Katalogens pilotgate er fortsatt **REMEDIATION_REQUIRED**. Ingen rettelser er implementert eller autorisert av denne triagen.

63/63 egne plan-/integritetskontroller bestått. Dette er ikke kjøring av applikasjonens testsuite og erstatter ikke framtidig validering.

## BASELINE

- Branch `main`; HEAD `d3a37985fce4ada65fa2f7a88462d8834e4677af`.
- Frosset katalog: 29.09.2026 (`2026-09-29T10:52:14.812Z`). Ingen ny materialisering ved dagens dato.
- Fullført audit 01.10.2026: 204 produkter (202 aktive, 2 historiske), 84 tillegg, 12 familier, 10 provider-ID-er og 3 agreement scopes.
- 322 originaler (246 PDF / 76 HTML), 291 unike hashes, 356 runtime-kildereferanser.
- 8 104 kilde-regelforekomster / 3 852 kilde-semantiske regler; 5 646 reverse-checked katalogpåstander.
- 5 714 funn / 2 608 signaturer. P0/P3 = 0. Auditens eksisterende 73/73-kvalitetskontroller er referert, ikke kjørt på nytt.

## P1 RECONCILIATION

Hver av de **1 589** P1-signaturene har nøyaktig én sluttdisposisjon; alle **3 281** P1-forekomster kan følges via signaturen.

| Sluttdisposisjon | Signaturer |
| --- | --- |
| CANONICAL_REVIEW_FIRST | 317 |
| FIX_BEFORE_NITO | 1055 |
| MAPPING_REVIEW_FIRST | 166 |
| SOURCE_RESEARCH_FIRST | 29 |
| DEFER_SAFE | 21 |
| DUPLICATE / COVERED_BY_OTHER_BATCH | 1 |
| HUMAN_DOMAIN_REVIEW | 0 |
| FALSE_POSITIVE_AFTER_RECHECK | 0 |


Én duplikatsignatur: den tidlige Fremtind MC-nyverdikontrollen GAP-0131 dekkes av samme kilde-/produktregel i senere GAP-5370. Begge audit-ID-ene beholdes; telleren reduseres ikke i skjul. Ingen funn er erklært falskt positivt. 21 utsatte P1-signaturer gjelder historisk Eika; alle aktive P1 beholdes i minimumssettet. De fem fagvurderingene er avhengigheter til kilde-/mappingbeslutninger, ikke fem ekstra P1-disposisjoner.

Se [p1-triage.csv](/tmp/source-catalog-remediation-triage/p1-triage.csv).

## FINAL ROOT CAUSES

Alle **60** gamle rotårsaksposter er vurdert. **113** avgrensede implementeringsområder + **1** P2-backlogområde gir **114** rader i rotregisteret. **11** endelige områder samler flere gamle poster; **33** gamle poster er splittet. **93** implementeringsområder har minst én uavklart kilde-/semantisk gate.

Dette er ikke 113/114 påviste motorfeil. Felles symptom er ikke tilstrekkelig til å slå sammen ulike provider-kataloger. Vi observerer utelatelse, feil forfatting, nivåbetingelse og komponenter som erstatter feil betydning; opprinnelig utviklerhensikt og en generell engine-feil er ikke bevist. SCRC-049/Tryg Hus har bare P2 og får ikke en kunstig aktiv pilotbatch.

[root-cause-triage.csv](/tmp/source-catalog-remediation-triage/root-cause-triage.csv) og [root-cause-reconciliation.md](/tmp/source-catalog-remediation-triage/root-cause-reconciliation.md) viser sammenslåinger, splittelser, kodebevis og tilbakekoblinger.

## FINAL REMEDIATION BATCHES

Alle **56** tidligere grupper er gjennomgått. Sluttplan: **205** atomiske batcher.

| Status | Batcher |
| --- | --- |
| IMPLEMENTATION_READY | 88 |
| MAPPING_REVIEW_FIRST | 43 |
| CANONICAL_REVIEW_FIRST | 55 |
| SOURCE_RESEARCH_FIRST | 18 |
| DEFERRED | 1 |


Dermed er 88 kildeklare, 18 krever kilder først, 98 krever canonical/mapping-beslutning, 0 har bare human-review som primær gate, og 1 er historisk utsatt. Førstnevnte betyr implementerbar etter godkjenning, ikke allerede testet/lukket.

Avgrensningen er provider × type × scope × forfatteroperasjon/readiness. Samme pakke materialiseres samlet; vi lager ikke én batch per produktforekomst. Særskilte feilaktige påstander/arv er egne små førstebatcher. Flere av de 205 deler samme rotårsak og samme fil og må derfor kjøres sekvensielt. Dette er sikrere enn de 56 opprinnelige blandingsgruppene eller én global katalogendring.

[remediation-plan.csv](/tmp/source-catalog-remediation-triage/remediation-plan.csv) gir maskinlesbart register; [remediation-batches.md](/tmp/source-catalog-remediation-triage/remediation-batches.md) har formål, bevis, scope, endringsgrense, tester, audit, avhengigheter og modell for hver batch.

## REMEDIATION WAVES

| Bølge | Formål | Batcher | P1-signaturer |
| --- | --- | --- | --- |
| 1 | Fjern bekreftede feilaktige positive/innsnevrende påstander | 7 | 7 |
| 2 | Korriger avgrenset arv, scope og kjente semantiske koblinger | 15 | 23 |
| 3 | Materialiser dokumentert P1-kunnskap med eksisterende dimensjoner | 73 | 1035 |
| 4 | Avklar og implementer de resterende typebestemte semantiske dimensjonene | 91 | 474 |
| 5 | Lukk berørte kilde-/domeneavhengigheter og implementer sikre konklusjoner | 18 | 29 |
| 6 | Full re-audit, menneskelig pilotgate og historisk avgrensning | 1 | 21 |


Bølge 6 omfatter avsluttende full audit og historisk avgrensning; de 21 historiske signaturene telles for avstemming, men historisk retting er ikke nødvendig for den uttrykkelig avgrensede aktive piloten. Kildereview kan foregå uavhengig fra bølge 1. CR/SR/HR må være avgjort før den tilknyttede implementasjonsbatchen; ingen parallelle writes til samme fil. Se [remediation-waves.md](/tmp/source-catalog-remediation-triage/remediation-waves.md).

## PILOT MINIMUM SET

**204 aktive batcher + 65 kildeavklaringsoppgaver + 5 fagvurderinger + 469 konkrete canonical/mapping-spørsmål.** Spørsmålene er koordinert innen 98 review-gated batcher; dette er ikke 469 nye kodeprosjekter eller nøkler. 200 aktive produkter har P1; de to øvrige aktive Tryg Hus-produktene har P2 og beholdes som positive kontroller. Alle 202 aktive produkter omfattes av slutt-auditen.

Et kildeverdict kan være dokumentert regel, eller et ekte uløst spørsmål med bevist konservativ representasjon og eksplisitt godkjent pilotbegrensning. Ingen slike unntak er godkjent her. Kildeklare P1-utelatelser kan ikke unntas ved generell ansvarsfraskrivelse.

**FULL_PREPILOT_QUALITY_SET:** samme 204 batcher, alle **70** kildeoppgaver, samme 5/469 vurderinger, samt **2** uavhengige P2-piggyback-signaturer (**3** forekomster). Ytterligere 3 P2-forekomster følger en signatur som allerede er P1; de telles ikke som nye P2-signaturer. Øvrige P2 er eksplisitt beholdt som DEFER_POST_PILOT/DEFER_UNTIL_RELEVANT. Full quality betyr ikke at alle 2 433 P2 må bygges inn i første pilot.

[pilot-minimum-set.csv](/tmp/source-catalog-remediation-triage/pilot-minimum-set.csv) · [full-prepilot-quality-set.csv](/tmp/source-catalog-remediation-triage/full-prepilot-quality-set.csv) · [pilot-known-limitations.csv](/tmp/source-catalog-remediation-triage/pilot-known-limitations.csv).

## SOURCE RESEARCH

**110** åpne poster → **70** unike koordinerte oppgaver. **65** må få et verdict før full aktiv pilotgate; **5** ligger utenfor minimumet. Alle **115** råposter (110 åpne / 3 lukkede / 2 alias) er avstemt uten tap av spørsmål.

70 konfliktposter: 68 åpne, 1 eldre/stale IPID (SC-003), 1 allerede avklart positiv kontroll (SC-005). Ingen ny avklaring er påstått. Kildearbeidet skal svare per type/kanal/produkt selv når innhenting samordnes. 65 pilotavhengigheter betyr ikke 65 påviste feil eller 65 obligatoriske nye nedlastinger.

Kritiske temaer: feil dato/versjon, tillegg versus basis, type-/nivåanvendelse, grensoperatorer, egenandelsgren, enheter og kanalregler. Blant annet kan felles Fremtind-forsikringsgiver ikke bevise felles sluttprodukt. Gjensidiges ukjente datoer holdes ukjente.

[source-research-plan.csv](/tmp/source-catalog-remediation-triage/source-research-plan.csv) · [source-research-reconciliation.csv](/tmp/source-catalog-remediation-triage/source-research-reconciliation.csv) · [source-conflict-triage.csv](/tmp/source-catalog-remediation-triage/source-conflict-triage.csv).

## HUMAN REVIEW

**5** eksplisitte fagspørsmål: Frende tilhenger-egenandel, Frende båt transport/sjøsetting/opptak, Gjensidige Hund behandlingsmodalitet/rehabilitering, Storebrand MC/Bobil-anvendelse og Storebrand Reise kjøp under påbegynt reise/overføring. Kildekonflikter avgjøres ikke ved flertall eller modellens intuisjon.

[human-review-queue.csv](/tmp/source-catalog-remediation-triage/human-review-queue.csv).

## CANONICAL / MAPPING REVIEW

**317** P1-signaturer trenger semantic placement review; **166** trenger mapping review. Dette er **469** unike type-/konsept-/dimensjonsspørsmål etter forsiktig samordning. Eksisterende nøkler og type-register er kontrollert read-only. Fravær av foreslått nøkkel i den opprinnelige auditen beviser ikke schema-gap.

Konkrete strukturelle forhold: Storebrand dagstur trenger eksplisitt generell overnattingsdimensjon; Gjensidige gnager/insekt må unngå tap fra same-key/replacesBase; Gjensidige Bruk krever Liv, mens dagens requiresLevel gjelder hovedprodukt. Frende brukstap hører til Tap-komponenten. Forsinket avgang må ikke likestilles med forsinket fremmøte. Et nytt felt vurderes bare når eksakt gjenbruk/provider-detalj gir tap eller falsk ekvivalens. Ingen generell schema-/engine-rewrite er begrunnet.

[canonical-review-queue.csv](/tmp/source-catalog-remediation-triage/canonical-review-queue.csv) · [source-and-semantic-policy.md](/tmp/source-catalog-remediation-triage/source-and-semantic-policy.md).

## TOP LEVERAGE BATCHES

| Batch | Mål | P1-signaturer | Risiko / gate |
| --- | --- | --- | --- |
| B-001 | Avgrens Gjensidige MC ferie-leie til dokumenterte nivåer | 1 | LOW / IMPLEMENTATION_READY |
| B-005 | Fjern udokumentert gjenstandsgrense i Storebrand Innbo Super | 1 | LOW / IMPLEMENTATION_READY |
| B-006 | Korriger Frende Bil parkeringsbonusvilkår | 1 | LOW / IMPLEMENTATION_READY |
| B-007 | Avgrens Gjensidige Hus rørservice til dokumentert tining | 1 | LOW / IMPLEMENTATION_READY |
| B-024 | Materialiser If Campingvogn Supers dokumenterte ytelser | 9 | MEDIUM / IMPLEMENTATION_READY |
| B-023 | Materialiser Fremtind MC ordinær nyverdi | 2 | LOW / IMPLEMENTATION_READY |
| B-019 | Representer Storebrand Reise dagstur på korrekt overnattingsdimensjon | 1 | MEDIUM / MAPPING_REVIEW_FIRST |
| B-020 | Bevar Gjensidige Hus gnagerfakta ved råte-/insektutvidelse | 2 | MEDIUM / MAPPING_REVIEW_FIRST |


Disse rangerer vårt rettingsarbeid, ikke forsikringsselskaper. Materiell positiv feil, sikker kilde, tydelig scope og regresjonsflate teller mer enn rå forekomsttall. [top-leverage.csv](/tmp/source-catalog-remediation-triage/top-leverage.csv).

## FIRST RECOMMENDED IMPLEMENTATION BATCH

**B-001: Gjensidige MC Delkasko ferie-leie.** Ett P1-funn/signatur dekker tre uriktige leie-MC-påstander. Kasko-kildens utvidelse legges i dag på alle ikke-Ansvar-nivåer. Begrens akkurat disse radene; behold bagasje, ordinær veihjelp og Kasko. Ikke gjør fravær av kildebevis til eksplisitt negativ dekning. MC har ikke Pluss i denne katalogen.

Lav risiko, kildeklar lokal forfattergren, **GPT-6 SOL MEDIUM**. Verifiser Delkasko/Kasko/Ansvar/Bobil, egne kilder, sidebytte, dokumentforrang og optional-status, så full validering og reverse-check. Ingen implementering nå. [first-recommended-batch.md](/tmp/source-catalog-remediation-triage/first-recommended-batch.md) inneholder eksakte funn, scope, fil, kilde/hash og gate.

## PARALLELIZATION

**1 SAFE_FOR_SUBAGENT, 100 MAIN_AGENT_REVIEW_REQUIRED, 104 NOT_SAFE_FOR_PARALLEL_EXECUTION.** Det ene selvstendige området er B-043/Frende Reise. Dette er konservative statusklasser: samme katalogfil brukes ofte av flere providers eller typer. Kildeinnhenting kan senere delegeres read-only; kodereview eller ulike brancher opphever ikke fil-/semantikkavhengigheter. Ingen subagenter er startet.

[parallel-safe.csv](/tmp/source-catalog-remediation-triage/parallel-safe.csv) · [sequential-review.csv](/tmp/source-catalog-remediation-triage/sequential-review.csv) · [file-collisions.csv](/tmp/source-catalog-remediation-triage/file-collisions.csv).

## PDF / CUSTOMER IMPACT

205 batcher: **LIKELY_SHARED_WITH_CUSTOMER_MODE**. PRODUCT_MODE_ONLY / CATALOG_ENRICHMENT_ONLY / PDF_EXTRACTION_IMPACT / UNKNOWN: **0** hver. Katalogkunnskapen kan påvirke berettiget enrichment; ingen faktisk ekstraksjonsfeil eller nødvendig promptendring er bevist. Ingen private PDF-er brukt.

Dokument X vinner over katalog Y; valgfritt tilgjengelig blir ikke valgt; dokumenterte valg og separate objekter holdes adskilt. Fremtidig dokumentert pris-/risikoforutsetningsoversikt og source-first personforsikring er bare prosessråd i [future-process-notes.md](/tmp/source-catalog-remediation-triage/future-process-notes.md).

## REGRESSION STRATEGY

Alle **29** false-unknown-kontroller, separat dagsturkontroll og **2 227** positive kontroller er bevart i registeret, inkludert **182** kundespesifikke positive unknowns. Alle **8** strengt unsupported claims, **44** reverse semantic/boundary-claims og alle **38** semantiske feilforekomster + **5** strukturelle forekomster er rutet. Disse er overlappende tellere og skal ikke summeres til uavhengige feil.

Hver batch krever egne source-led semantic oracles, nøyaktig nivå/scope, optional- og dokumentforrang, type-/kanalnegativer, sidebytte, kilde/detail og held-out positive controls. Konflikttester skal ikke låse én side av en uløst konflikt. [regression-control-registry.csv](/tmp/source-catalog-remediation-triage/regression-control-registry.csv) · [reverse-claim-triage.csv](/tmp/source-catalog-remediation-triage/reverse-claim-triage.csv) · [future-ci-candidates.csv](/tmp/source-catalog-remediation-triage/future-ci-candidates.csv).

## FINAL RE-AUDIT STRATEGY

Målrettet uavhengig audit etter hver bølge; deretter full source→independent inventory→catalog→comparison og reverse support audit, full bulk-sammenligning, source hashes, alle aktive produkter/tillegg, named controls og syntetisk PDF/customer-regresjon. Eksakte signaturer må lukkes eller ha et gyldig godkjent unntak før menneskelig pilotgate. Grønne tester alene er ikke kompletthetsbevis. [regression-and-reaudit-plan.md](/tmp/source-catalog-remediation-triage/regression-and-reaudit-plan.md).

## REPO INTEGRITY

Baseline og slutt-HEAD: `d3a37985fce4ada65fa2f7a88462d8834e4677af`. Main clean, 0 staged, diff-check PASS. **595/595** sporede filhashes og **851/851** auditfiler uendret, ingen nye filer i auditkatalogen. Ingen repo-/katalog-/schema-/source-/testendring. .env ble ikke lest eller endret. Ingen Git-mutasjon, Railway, web research, private kundedokumenter eller remediation. Nye filer finnes bare under `/tmp/source-catalog-remediation-triage/`.

[repo-integrity.json](/tmp/source-catalog-remediation-triage/repo-integrity.json) · [quality-check.json](/tmp/source-catalog-remediation-triage/quality-check.json).

## OUTPUT FILES

- [triage-summary.md](/tmp/source-catalog-remediation-triage/triage-summary.md)
- [triage.json](/tmp/source-catalog-remediation-triage/triage.json)
- [remediation-plan.csv](/tmp/source-catalog-remediation-triage/remediation-plan.csv)
- [remediation-batches.md](/tmp/source-catalog-remediation-triage/remediation-batches.md)
- [remediation-waves.md](/tmp/source-catalog-remediation-triage/remediation-waves.md)
- [p1-triage.csv](/tmp/source-catalog-remediation-triage/p1-triage.csv)
- [root-cause-triage.csv](/tmp/source-catalog-remediation-triage/root-cause-triage.csv)
- [source-research-plan.csv](/tmp/source-catalog-remediation-triage/source-research-plan.csv)
- [human-review-queue.csv](/tmp/source-catalog-remediation-triage/human-review-queue.csv)
- [canonical-review-queue.csv](/tmp/source-catalog-remediation-triage/canonical-review-queue.csv)
- [p2-piggyback.csv](/tmp/source-catalog-remediation-triage/p2-piggyback.csv)
- [quality-check.json](/tmp/source-catalog-remediation-triage/quality-check.json)
- [pilot-known-limitations.csv](/tmp/source-catalog-remediation-triage/pilot-known-limitations.csv)
- [regression-control-registry.csv](/tmp/source-catalog-remediation-triage/regression-control-registry.csv)
- [future-ci-candidates.csv](/tmp/source-catalog-remediation-triage/future-ci-candidates.csv)

Tillegg: root-cause-reconciliation.md, original-batch-review.csv, source-conflict-triage.csv, source-research-reconciliation.csv, reverse-claim-triage.csv, pilot-minimum-set.csv, full-prepilot-quality-set.csv, first-recommended-batch.md, top-leverage.csv, file-collisions.csv, parallel-safe.csv, sequential-review.csv, source-and-semantic-policy.md, regression-and-reaudit-plan.md, future-process-notes.md, repo-integrity.json og read-only analyse-/genereringshjelpere. CSV/JSON er parsekontrollert. Originale funn/forekomster forblir i auditkatalogen og nås via stabile ID-er; de er ikke skrevet om.

## NEXT STEP

**Menneskelig gjennomgang av triagen og eksplisitt godkjenning av B-001 som første batch.** Ikke start implementasjonen automatisk.

Begrensninger: triagen bygger primært på ferdige auditbevis og målrettet read-only kodeinspeksjon. Ingen ny web research, ingen lukking av uløste kildekonflikter, ingen remediation, ingen reelle kundedokumenter og ingen juridisk godkjenning. Kilders aktualitet etter det frosne korpuset er ikke bevist.

Har vi nå en trygg og konkret plan for å korrigere den fullførte source→catalog-auditen uten å rette tusenvis av funn tilfeldig én etter én?

**JA, MEN NOEN BATCHES KREVER KILDE-/DOMENEVURDERING FØRST.**

NITO_CATALOG_REMEDIATION_TRIAGE_COMPLETE
