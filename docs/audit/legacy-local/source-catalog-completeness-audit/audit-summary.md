# SOURCE_CATALOG_COMPLETENESS_AUDIT



**COMPLETE — revisjonen av det avgrensede lokale kildegrunnlaget er fullført.**



**Katalogens pilotport: REMEDIATION_REQUIRED.** På spørsmålet om en NITO-rådgiver kan stole på hele produktsammenligningen som beslutningsstøtte: **NEI – REMEDIERING KREVES.** Det finnes samtidig mange korrekte detaljer som må beskyttes. Fullført revisjon betyr ikke at kildene er konfliktfrie eller katalogen klar.


## VERSION


Revisjon `SC-AUDIT-2026-09-29-d3a3798`, avsluttet 2026-10-01T14:05:53.443679+00:00. Branch `main`; HEAD `d3a37985fce4ada65fa2f7a88462d8834e4677af`. Frosset katalogtidspunkt: `2026-09-29T10:52:14.812Z`; ikke oppdatert vilkårlig til dagens dato.

Katalogfingeravtrykk: `914eec32721689370076ec28a5c5417e792c27ec3791926df8c9d15aa42da744`. Kildefingeravtrykk: `c519373bef7ea53a3e9c1e80e3ec52578657e7e6d60c6502ced52b9da88e9823`.


## SCOPE


204 eksakte produktidentiteter: 202 aktive/valgbare og 2 historiske. 84 registrerte tillegg, 3819 komponentfakta, 12 familier, 10 provider-ID-er og 3 agreement scopes. Provider-ID-er er ikke ti uavhengige forsikringsgivere. Identitet beholdes som provider × type × scope × produkt × versjon; ukjent versjon forblir ukjent.


## AUDIT METHOD


**REASONABLE.** 45 uavhengige kildeinventarer, tidligere kontrollerte kildepunkter og eksakte produktsupplementer ble brukt. Fullvilkår, tabeller, IPID, produktsider, tillegg og generelle bestemmelser ble undersøkt utover eksisterende canonical keys. Deretter ble kilderegler sammenholdt med faktisk verdi, label, structuredValue, inheritance, komponenter og tilgjengelige tillegg. Til slutt ble katalogens egne påstander kontrollert tilbake mot kildene.

8104 kilderegel-forekomster / 3852 unike kilde-/sted-/semantikkregler. 7773 er rådgiverrelevante forekomster. 4922 basepåstander; 5646 base+tillegg-påstander er reverskontrollert. 5435 materialiserte aktive fakta er en annen nevner, ikke et avvik.

En forekomst er en regel på et eksakt produkt/tillegg. En funnsignatur samler provider/type/scope/konsept/dimensjon/klasse på tvers av nivåer. En rotårsakspost grupperer en dokumentert mekanisme. Disse tallene er ikke antall uavhengige bugs, en statistisk fullstendighetsprosent eller en rangering av selskapene.


## PRODUCT COVERAGE


204/204 lokalt ferdig gjennomgått; 0 delvis; 0 ikke startet. Alle202 aktive er med; de2 historiske Eika-produktene ble også gjennomgått, uten å aktivere dem. Produktberedskap: REMEDIATION_REQUIRED: 202, REVIEW_REQUIRED: 2. De2 REVIEW_REQUIRED er Tryg Hus-nivåer med P2-detaljer og kildeanvendelsesspørsmål; ikke2 uferdige revisjoner.

Fremdrift siden denne fortsettelsens checkpoint: +188 ferdige produkter, +68 ferdige tillegg, +5693 regel-forekomster, +4073 funnforekomster.


## ADD-ON COVERAGE


84/84 registrerte tillegg har avsluttet lokal vurdering av tilgjengelighet, nivå, valgfrihet, grenser, vilkår og proveniens. Beredskap: REMEDIATION_REQUIRED: 60, READY: 2, READY_WITH_MINOR_GAPS: 9, REVIEW_REQUIRED: 11, SOURCE_INSUFFICIENT: 2. 2 SOURCE_INSUFFICIENT gjelder Gjensidige Bobil Utleie/Fortelt. Oppførte kildebehov og usikker nivåtilgjengelighet er ikke konvertert til sikkert standardinnhold. Tryg separat Leiebil er tidsstyrt; fravær i29.09-snapshot er ikke en kildefeil.


## SOURCE COVERAGE


322 originaler:246PDF og76HTML;291 unike SHA-256,31 duplikatstier,1437 sider i unike PDF-er. Alle er lesbare. 356 runtime-kildereferanser løser lokalt;338 har oppgitt hash i runtime-metadata,18 uten slik tidligere oppgitt hash er hashberegnet uavhengig i revisjonen. Ingen integritetsfeil.

314 originalstier er lest med eksakt produktvurdering,6 øvrige er byte-identiske kopier av allerede vurdert innhold,1 er gjennomgått selskapskontekst og1 er erstattet Frende Reise2020 som ikke brukes av et aktivt produkt. Den historiske originalen er identifisert, ikke påstått fullstendig detaljrevidert. Identiske byte beviser ikke identiske sluttprodukter.

[source-package-matrix.csv](/tmp/source-catalog-completeness-audit/source-package-matrix.csv) inneholder76 faktiske provider/familie-pakker. Fem eldre Tryg Bil-originaler mangler nedlastings-URL i lokale metadata;26 funn bruker disse. Lokal fil, vilkårsnummer, dato og hash er bevart. Ingen URL er oppfunnet.


## BLINDSPOT VALIDATION


**CONFIRMED.** At katalogen ikke har et faktum er ikke bevis for at kilden mangler det. Revisjonen fant både manglende kildeopplysninger og kunnskap som er plassert under en annen semantisk nøkkel. 29 synlige falske unknowns er bekreftet med lesende katalog-/presentasjonsprober; øvrige mangler er ikke automatisk telt som observerte UI-feil.


## GLOBAL CATALOG STATUS


**REMEDIATION_REQUIRED**, med samtidige avgrensede SOURCE_RESEARCH_REQUIRED-områder. Ingen bred omskriving av comparison-motor/schema er bevist nødvendig.


## CATALOG PILOT GATE


**REMEDIATION_REQUIRED.** Verifiserte P1-forhold må håndteres før en generell tillitspåstand for NITO-pilot. Materiale kildekonflikter må få korrekt usikker tilstand eller autoritativ avklaring. P2/P3 kan prioriteres etter konkret risiko. Den separate sikkerhets-/GDPR-revisjonen er fortsatt gjeldende og urørt.


## FAMILY RESULTS


|Familie|Produkter lokalt ferdige|Tillegg ferdige|P1 forekomster|P2 forekomster|Produkter med kildeavklaring|
|---|---|---|---|---|---|
|Bil|35/35|26|490|512|11|
|Innbo|12/12|4|259|221|12|
|Hus|13/13|10|253|171|11|
|Reise|14/14|2|334|198|10|
|Snøscooter|18/18|2|233|157|6|
|Campingvogn|17/17|0|235|154|8|
|Tilhenger|12/12|0|102|105|9|
|MC|19/19|4|230|210|11|
|Bobil|24/24|12|360|313|16|
|Båt|20/20|5|417|207|17|
|Hund|10/10|12|206|96|7|
|Katt|10/10|7|162|89|6|

Alle12 familiecheckpoint er COMPLETE. Tilleggene telles i sine registrerte familier. Historiske Eika Reise er med i Reise-tallene.

**Bil:** Ifs ordinære nyverdiregel mangler i Bil, selv om samme lokale hovedvilkår er brukt for MC/Bobil. Frende har parkeringsbonusvilkår uten kildegrunnlag. Fremtind-kanalregler holdes adskilt fra felles hovedvilkår.

**Innbo:** Tryg Ekstra arver en fellesbod/fellesgarasjegrense fra feil nivå. Storebrand Super har en udokumentert flyttegrense per gjenstand. Beløp, uhellsbegrensninger og oppgjør må vurderes hver for seg.

**Hus:** Gjensidige råte/insekt-utvidelse erstatter fortsatt relevante mus/rotter-fakta. Fremtind Standard har utsmyknings-/fradragsspørsmål. Tryg er en detaljrik positiv kontroll; gjenværende P2 og kildeversjonsspørsmål er separate.

**Reise:** Gjensidige Pluss arver ordinær enkeltgjenstandsgrense. Storebrands dagsturdekning ligger i geografitekst og blir ukjent på den eksplisitte overnattingsraden. Behandlingsperiode, tilkallelse og reisevarighet må holdes semantisk adskilt.

**Snøscooter:** Sparse hovedrader mangler blant annet rettshjelpsgrenser, kjøreutstyr og typebestemte oppgjør. Ingen Bil-nyverdi, vanlig leiebil eller maskinskade importeres uten egen anvendelig kilde.

**Campingvogn:** If Super har samme resolverte hovedsett som Kasko og utelater lokale Super-ytelser. Trygs uttrykkelige naturskade og flere fukt-/ferie-/forteltvilkår mangler. Kildekonflikt om andre selskapers nivåer er ikke normalisert bort.

**Tilhenger:** Brann/tyveri/Kasko, utstyr, egenandel og rettshjelp er ofte for grovt representert. Campingvognfukt/ferie og trekkbilens regler skal ikke overføres automatisk.

**MC:** Gjensidige ferie-leieutvidelse er lagt på Delkasko uten støtte i egen pakke. Fremtind MC har dokumentert ordinær nyverdi som mangler. Tryg1år/10000km er en positiv kontroll.

**Bobil:** Gjensidige Kasko utelater dokumentert skadedyr. Utvidede nivåer har konkrete fukt-, ferie-, løsøre- og leasingbetingelser som ikke alle er modellert. DNB/fullvilkår/IPID-konflikter er egne spørsmål.

**Båt:** Grove Included-rader skjuler ansvarssummer, egenandeler, alder, geografi, løsøre og ulykkesvilkår. Rekonstruerte toppnivåer mister enkelte grunnfakta. Trygs ordinære hovedvilkår er delvis fraværende lokalt.

**Hund:** Veterinærperioder, prosentegenandeler, rase-/aldersvilkår, liv og brukstap er ikke fullstendig modellert. Valgfri rehabilitering/livsavhengighet må bevares som tilvalg, ikke kundens valg.

**Katt:** Artsbestemte sykdoms-, tann-, medisin-, ventetids- og livsregler må skilles fra Hund. Frende2025IPID versus2026fullvilkår om forsvinning er fortsatt uavklart.


## P0 FINDINGS


0 dokumenterte P0. Det er ikke et bevis for at alle ukjente feil er fraværende.


## P1 FINDINGS


3281 forekomster / 1589 signaturer ved høyeste alvorlighet. Alle har eksakt produktidentitet, kildefil/hash/sted, kilde- og katalogbevis, materiell dimensjon, rotårsak og manuell semantisk revisjonsdisposisjon.37 P1-forekomster gjelder historiske Eika-produkter;3244 gjelder aktive produkter. Ikke alle forekomster trenger hver sin retting.

Alle P1 er bevart i [gap-findings.csv](/tmp/source-catalog-completeness-audit/gap-findings.csv); ingen er skjult bak hovedeksemplene. Fordeling per familie/provider/rot/batch finnes i [priority-breakdown.csv](/tmp/source-catalog-completeness-audit/priority-breakdown.csv). Foreslåtte eksakte regresjonskonsepter: [proposed-regressions.csv](/tmp/source-catalog-completeness-audit/proposed-regressions.csv).


## P2 / P3 SUMMARY


P2: 2433 forekomster / 1019 signaturer telt eksklusivt ved høyeste alvorlighet. P3:0. Én signatur har både P1 og P2 på ulike nivåer og telles én gang som P1. Totalt 5714 forekomster / 2608 signaturer. Enkeltpostene beholder opprinnelig alvorlighet. Proveniensobservasjoner PROV-001/002 er supplerende og skal ikke legges til forekomsttallet uten egen klassifisering.


## VERIFIED CATALOG FALSE UNKNOWNS


29 verifiserte synlige cases med egne kilder og kontrollert produktidentitet. Fullstendig liste: [verified-false-unknowns.json](/tmp/source-catalog-completeness-audit/verified-false-unknowns.json) og audit.json/blindspot_validation.

Det særskilte Reise-eksemplet er bekreftet: Storebrand Standard dekker generelt dagstur uten krav om overnatting. Dette står både i kilden og i katalogens geografitekst, men den eksplisitte raden `reise.overnatting` blir unknown. Det er en strukturell mappingmangel. Egne overnattingskrav for bestemte avbestillings-/leiebilytelser gjelder fortsatt; tjenestereise kan ikke utledes fra Tryg.


## TOO-COARSE FACTS


2910 inventerte forekomster av CATALOG_FACT_TOO_COARSE. Typiske tap er vilkår bak en hovedsum, per-hendelse versus per-år, sum per gjenstand, særskilt egenandel, alder/km og unntak som bare omtales som «etter vilkårene». Dette er kunnskapshull; det betyr ikke at alt må vises i standardoversikten.


## UNSUPPORTED CATALOG CLAIMS


8 strengt verifiserte påstander uten støtte i anvendelig lokal pakke. Disse holdes separat fra44 påstander med semantikk-/scope-/grensefeil og fra uavklart kildestøtte.

|Produkt|Påstand|Kontroll|
|---|---|---|
|frende-bil-kasko|bonus.parkert|CC-01260|
|frende-bil-utvidet|bonus.parkert|CC-01298|
|sb-innbo-super|flytting.transport.grense|CC-01726|
|gjensidige-hus|hus.ror.tining|CC-02455|
|gjensidige-hus-pluss|hus.ror.tining|CC-02523|
|gjensidige-mc-delkasko|mc.leiekjoretoy.dekning|CC-04481|
|gjensidige-mc-delkasko|mc.leiekjoretoy.dager|CC-04482|
|gjensidige-mc-delkasko|mc.leiekjoretoy.begrensning|CC-04483|

Dette omfatter Storebrand Innbo Super flytting, Frende Bil parkeringsbonus, Gjensidige Hus oppspyling og Gjensidige MC Delkasko ferie-leie. Hele tilgjengelige lokale pakker ble kontrollert; kildekonflikt alene er ikke ført som bevist udokumentert påstand.


## SEMANTIC MISMATCHES


38 kildefunn-forekomster er klassifisert semantisk feilkoblet;5 er strukturelle mappinggap. Reversregisterets44 semantikk-/scope-påstander er en annen, overlappende nevner. Viktige eksempler er feil arvet nivågrense, valgfri rehabilitering i base, sykdom versus ulykkesskadens alvorlighetskrav, og If Basis-sikkerhetsforskrift fra andre nivåer.


## POSITIVE CONTROLS


Korrekte verdier ble undersøkt uavhengig av mangellistene: Tryg MC1år/10000km, kildebestemte nivåunntak i If Hus/Reise, material-/årsaksavgrensninger som allerede ligger i Frende Hus structuredValue, korrekt kundevalgte summer, valgfri komponentstatus, og fakta bevart i barn/foreldre. Storebrand Båt «gjenstand med verdi over15000 unntatt» er kontrollert som objektunntak, ikke et utbetalingstak. SC-005 er løst av egne fullvilkår og er ikke et aktivt avvik.

2227 positive/akseptable/kundespesifikke kontrollforekomster er bevart i audit.json/positive_controls;182 er kundespesifikke kilderegler. [manual-review.md](/tmp/source-catalog-completeness-audit/manual-review.md) dokumenterer falske positiver og alle produktgjennomganger.


## SOURCE PACKAGE GAPS


19 produkter har minst én uttrykkelig SOURCE_PACKAGE_GAP i en dimensjon eller et tillegg.124 produkter har minst ett dokumentert kilde-/anvendelsesspørsmål. Det betyr ikke at hele deres øvrige produktinnhold er ukjent. De primære beredskapsstatusene kan samtidig være REMEDIATION_REQUIRED.

Konkrete mangler gjelder blant annet ordinære Tryg Båt hoveddekninger, Gjensidige Bobil/Fortelt/Utleie-ridere, If høyverdi-/sykkeltillegg og riktig generell Hus-versjon, samt Fremtind Campingvogn/Tilhenger-komponenter som IPID omtaler uten tilsvarende fullvilkår. Kanaloriginaler og garantivilkår er egne avklaringer.


## SOURCE CONFLICTS


70 konflikt-/anvendelsesposter:68 fortsatt åpne,1 løst lokalt,1 foreldet sammendrag. Av de68 er56 eksplisitte motstridsobservasjoner og12 scope-/tolkningsspørsmål; de er ikke68 beviste gjensidige vilkårsmotsetninger. Eksakte kilder/versjoner og handling er bevart i [source-conflicts.csv](/tmp/source-catalog-completeness-audit/source-conflicts.csv).

Eksempler: Storebrand MC bagasje, Storebrand Campingvogn Super løsøre, Tryg dato-/alders- og geografiregler, Fremtind kanal-/IPID-avvik, Frende Bobil nivå/utleie og Frende Katt forsvinning. Ingen regel er valgt bare fordi den er enklest å modellere.


## CANONICAL MODEL GAPS


0 beviste brede schema-/engine-blokkere. 2373 funn er kandidater til liten registry-/mapping-/provider-detail-utvidelse; dette er ikke bevis for at alle krever kode. 3341 er kandidater til dataendring i eksisterende strukturer. Hver ny dimensjon må først sjekkes mot eksisterende modell, og ingen semantisk ulikhet skal skjules ved å gjenbruke feil nøkkel.


## PRESENTATION GAPS


0 uavhengige presentasjonsfeil er bevist som egen UI-root-cause her. De29 synlige false unknowns stammer fra katalog-/mappinglaget. UI-et skal ikke tolke vilkår eller geografitekst for å reparere dem. Fremtidig kuratering kan vise begrensninger som detaljer uten å fjerne kunnskapen fra katalogen.


## ROOT CAUSE CANDIDATES


60 stabile rotårsaksposter fordelt på56 foreslåtte batcher. Dette er provider-/familieavgrensede mekanismer, ikke60 uavhengige motorfeil. [root-cause-candidates.csv](/tmp/source-catalog-completeness-audit/root-cause-candidates.csv) inneholder alle bevis og berørte produktidentiteter.

|Primær mekanisme|Funnforekomster|P1|P2|
|---|---|---|---|
|TIER_COMPONENT_COMPOSITION|308|247|61|
|CANONICAL_SEMANTIC_ALIGNMENT|9|9|0|
|UNSUPPORTED_EXACT_CLAIM_OR_SCOPE|4|4|0|
|SOURCE_CONFLICT_HANDLING|1|1|0|
|SOURCE_TO_CATALOG_DIMENSION_OMISSION|5392|3020|2372|

Hovedmekanismen er ufullstendig kilde-til-katalog-forfatting. Mer avgrensede mekanismer er toppnivå som rekonstruerer base ufullstendig, replacesBase som fjerner fortsatt gyldige detaljer, feil arvet undergrense, tilvalg i feil scope og en semantisk dimensjon lagret under feil nøkkel. Dette sier hvor feilen finnes; det beviser ikke hvorfor en tidligere utvikler valgte løsningen.


## PDF / CUSTOMER IMPACT


5664 forekomster er klassifisert LIKELY_SHARED_WITH_CUSTOMER_MODE fordi katalog/fallback eller vilkårsinformasjon også kan brukes der. Dette er en potensiell delt effekt, ikke et observert tap i en reell kunde-PDF. Ingen kundedokumenter er åpnet. Ingen nye extractionkrav eller AI-kall er bevist nødvendig.

Alle fremtidige rettinger må beskytte document > catalog, unknown versus not_selected, valgfritt versus valgt, samme-side consolidation, objektidentitet, type/scope/versjonsisolasjon og kildeopprinnelse. Kundevalgte priser, egenandeler og summer må ikke gjøres om til standard produktverdier.


## REMEDIATION BATCHES


Første lille, trygge kandidat etter menneskelig godkjenning: **RB-11 / SCRC-013**, den udokumenterte50000-per-gjenstand-påstanden ved Storebrand Innbo Super flytting. Én P1, eksisterende struktur, klart lokalt grunnlag. Deretter kan avgrensede nivå-/mappinggrupper prioriteres: SCRC-020 overnatting, SCRC-027 skadedyr, SCRC-029 Reise Pluss, SCRC-031 MC Delkasko, SCRC-035 tilvalg og SCRC-037 Campingvogn Super. Disse skal ikke blandes med kildeavklaringer eller brede automatiske massefyllinger.

[remediation-batches.csv](/tmp/source-catalog-completeness-audit/remediation-batches.csv) oppgir antall funn og produkter per batch. [proposed-regressions.csv](/tmp/source-catalog-completeness-audit/proposed-regressions.csv) har ett konkret testkonsept per P0/P1-forekomst med eksakt identitet, dimensjon, kilde og negativ kontroll. Testene er ikke implementert.


## SOURCE RESEARCH QUEUE


115 bevarte køposter:110 åpne,3 lukket lokalt,2 aliaser til konfliktposter. Åpne poster overlapper i tema og skal ikke tolkes som110 uavhengige kildepakker eller nedlastinger. [source-research-queue.csv](/tmp/source-catalog-completeness-audit/source-research-queue.csv) angir det konkrete dokument-/nivå-/versjonsspørsmålet. Lokalt avgjort Tryg Innbo-kandidat og gammelt «resten ikke lest» er lukket. Ingen ny research ble utført.


## DEEP REVIEW


204 eksakte produktgjennomganger, minst2 i hver av12 familier; kravet om minst24 er oppfylt. Kildepakker og manuelle begrunnelser finnes per produkt i audit.json/manual_review og manual-review.md. Store delte vilkår gjenbrukes som innhold, mens anvendelsen vurderes separat for hvert produkt. Tillegg og arv inngår i vurderingen.


## AUDIT QUALITY CHECK


A–J-kontrollene er dokumentert i manual-review.md og quality-check.json. Sluttvalideringen kontrollerer JSON/CSV, stabile og unike ID-er, referanser, produktidentiteter, kildehash, prioritet/signaturtelling, eksplisitte kildeusikkerheter, sluttstatus og uendret repository. Alle P0/P1 har final semantisk revisjonsdisposisjon; menneskelig godkjenning av rettinger er fortsatt nødvendig. Maskinell konsistenskontroll alene er ikke semantisk bevis.


## REPO INTEGRITY


HEAD før/etter: `d3a37985fce4ada65fa2f7a88462d8834e4677af`. Branchmain; working tree clean; staged0før/etter. Status-/tracked-/staged-diff-fingeravtrykk før/etter:`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Untracked-fingeravtrykk før/etter:`44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`. Full arbeidskopi-fingeravtrykk:`fb06c74a3a797e9ee00d11b1b4fd8d24b55dc09414aab0dd2389411e5b28c2b0`. Alle baselinefiler og322 originaler er kontrollert. Endelig kontroll: [repo-integrity.json](/tmp/source-catalog-completeness-audit/repo-integrity.json).

Ingen kode, canonical data, kataloger, manifests, originalkilder, tester eller prosjektfiler er endret. Ingen envverdier lest/skrevet, Git-mutering, commit/push, reset/revert/stash, Railway, production tracing eller private dokumenter. Kun auditfiler under /tmp/source-catalog-completeness-audit/ er skrevet; /tmp/nito-prepilot-audit/ er urørt.


## OUTPUT FILES


- [audit-summary.md](/tmp/source-catalog-completeness-audit/audit-summary.md)

- [audit.json](/tmp/source-catalog-completeness-audit/audit.json)

- [product-ledger.csv](/tmp/source-catalog-completeness-audit/product-ledger.csv)

- [addon-ledger.csv](/tmp/source-catalog-completeness-audit/addon-ledger.csv)

- [gap-findings.csv](/tmp/source-catalog-completeness-audit/gap-findings.csv)

- [source-fact-inventory.csv](/tmp/source-catalog-completeness-audit/source-fact-inventory.csv)

- [family-summary.csv](/tmp/source-catalog-completeness-audit/family-summary.csv)

- [root-cause-candidates.csv](/tmp/source-catalog-completeness-audit/root-cause-candidates.csv)

- [manual-review.md](/tmp/source-catalog-completeness-audit/manual-review.md)

- [catalog-fact-support.csv](/tmp/source-catalog-completeness-audit/catalog-fact-support.csv)

- [source-package-matrix.csv](/tmp/source-catalog-completeness-audit/source-package-matrix.csv)

- [source-artifact-ledger.csv](/tmp/source-catalog-completeness-audit/source-artifact-ledger.csv)

- [source-record-ledger.csv](/tmp/source-catalog-completeness-audit/source-record-ledger.csv)

- [source-conflicts.csv](/tmp/source-catalog-completeness-audit/source-conflicts.csv)

- [source-research-queue.csv](/tmp/source-catalog-completeness-audit/source-research-queue.csv)

- [remediation-batches.csv](/tmp/source-catalog-completeness-audit/remediation-batches.csv)

- [proposed-regressions.csv](/tmp/source-catalog-completeness-audit/proposed-regressions.csv)

- [priority-breakdown.csv](/tmp/source-catalog-completeness-audit/priority-breakdown.csv)

- [unsupported-catalog-facts.csv](/tmp/source-catalog-completeness-audit/unsupported-catalog-facts.csv)

- [catalog-semantic-mismatches.csv](/tmp/source-catalog-completeness-audit/catalog-semantic-mismatches.csv)

- [verified-false-unknowns.json](/tmp/source-catalog-completeness-audit/verified-false-unknowns.json)

- [reise-overnatting-control.json](/tmp/source-catalog-completeness-audit/reise-overnatting-control.json)

- [quality-check.json](/tmp/source-catalog-completeness-audit/quality-check.json)

- [repo-integrity.json](/tmp/source-catalog-completeness-audit/repo-integrity.json)

- [resume.json](/tmp/source-catalog-completeness-audit/resume.json)


## LIMITATIONS


Only frozen local official corpus; no new web research or freshness verification.

COMPLETE means scope reviewed and findings/dispositions persisted, not gap-free catalogs. Missing full riders, ambiguous applicability and conflicting documents require separate research.

Model-based semantic/manual review is not mathematical proof, a claims decision or independent human legal review.

Source/finding counts are occurrences; signature/root counts separate. No insurer ranking or coverage percentage.

No private customer documents, production run, deployment, repository edits or app tests/build. Read-only catalog/view probes used cached public data.

NITO security/GDPR audit remains separately pending and untouched.


## RECOMMENDATION


Godkjenn ikke katalogen generelt som pilotklar ennå. Gå gjennom de kildebeviste P1-gruppene med en fagperson, prioriter konkrete feilpåstander og nivåfeil, og bestill bare den kildeavklaringen som trengs for de blokkerte dimensjonene. Bevar korrekte eksisterende verdier og usikkerhetssemantikken. Ingen generell motorombygging er begrunnet.


## NEXT STEP


**A — menneskelig gjennomgang av P0/P1, deretter en avgrenset remediation-oppgave.** Kildeavklaringer tas separat der nødvendig. Etter retting: målrettet kilde-til-katalog-kontroll, produktcompare-bulkaudit, full regresjon, rådgiverkontroll og gjenstående sikkerhets/GDPR-tiltak. Ingen av disse stegene er startet.



**SOURCE_CATALOG_COMPLETENESS_AUDIT_COMPLETE**
