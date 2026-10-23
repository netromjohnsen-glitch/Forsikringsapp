# Frost og bygningsvern – validert B-130-bolk

Basis/fersk main: `8422e39214aadff2dd31292e84ee4ca9cf818b30`.
Kandidaten er validert på denne basisen. Publiseringsrevisjonen er committen som
inneholder bolken; publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt](publication-authorization.md), [førkontroll](publication-preflight.json)
og [publiseringsintegritet](publication-integrity.json). Ingen installasjon eller deploy.

[Fullmakt](authorization.json), [forutgående avklaring](../b130-frost-review-8422e39/decision-ce90710821e28a97.json),
[kildekontrakt](source-oracle.json), [receipt](completion-receipt-ce90710821e28a97.json),
[validering](validation-summary.json), [checkpoint](checkpoint.json),
[kandidatidentitet](candidate-identity.json) og [source/reverse-audit](source-and-reverse-audit.json).

CR-229 / ce90710821e28a97 er implementert for Hus Standard GAP-2121/SF-3048 og
Hus Pluss GAP-2180/SF-3135, bare Gjensidige / bolig / ordinary / Alminnelige vilkår.
Én produksjonsfil legger til to kildebundne fakta for hus.sikkerhet.begrensning.
Begge har egen original-PDF, side 1; Pluss erstatter arvet samme-nøkkel-rad og
beholder komplett baseevidens. Hele den avklarte teksten med ni generelle plikter,
ektefelle/samboer og betinget helt/delvis bortfall av erstatningsretten er beholdt.

Oppvarmingsplikten står selvstendig. Stoppekran og åpning av vannkran for å tømme
rørene krever både ikke fast bebodd bygning og fravær på mer enn tre døgn.
Ingen kundeetterlevelse, bosituasjon eller automatisk dekningsavgjørelse utledes.
Tolvmåneders fraflytting, Trygs énmånedsregel, skadehendelser, tining, egenandels-
fordeler og Utleies betalingsplikter er egne uendrede kontrakter. Dokumentforrang,
kilder/noter, katalogopprinnelse og JSON/gjentakelser bevares. General_terms blir
fortsatt evidens/katalog. Ingen schema-, alias-, motor-, normalizer- eller UI-endring.

63 nye kontrakttester; 2389/2389 målrettede og 6081/6081 fullsuite i 167 filer,
uten skip. Typegen/TypeScript, webpack-bygg, ESLint 0 feil / 27 eksakt uendrede
warnings og lokal syntetisk HTTP/PDF-runtime 22/22 PASS. Alle åtte sluttgater er
bundet til samme endelige kode-/testidentitet. Tidlige runs er beholdt med egne
identiteter, kommandoer og eksakte komprimerte logger.

[Før-baseline](baseline-identity.json) ble fanget før produksjonsendring. Alle
214 manuelle input og 144 faktiske dokumentforløp bevarer samtlige tidligere felt;
hele katalogen er nøyaktig før-katalogen pluss de to uavhengig kildekontrollerte
fakta. Nye rader og full metadata kontrolleres separat før strengt avgrenset
projeksjon mot eldre snapshots. Historiske bevis og kildeoriginaler er uendret.
[Mekanisk logg](autonomous-mechanical-corrections.json) fører én avgrenset rot:
eksakte eldre forventninger og fem bokstavelige radtellere oppdateres bare for
den autoriserte to-radsdifferansen. Alle testsaker/negative kontroller beholdes.

[Beskyttet status](protected-status-verification.json), [prior-integritet](prior-packets-integrity.json)
og [samlet integritet](integrity-verification.json). 51 filer i den publiserte
fraflyttingspakken og forutgående lokale avklaringen er byte-identiske.
Basis-main har 64 publiserte kampanjesignaturer; 65 inklusive denne ene
originalsignaturen med begge bindinger gjelder etter bekreftelse av den
inneholdende committen på remote main. Globalt resolved/open
forblir UNKNOWN, P2-kreditt 0, B-051 37/0/1/1 og REMEDIATION_REQUIRED består.
Alle HOLD, inkludert HTU, bekjempelsesunntak og fysisk insektegenandel, beholdes.
Fullverdi/personkrets står åpne. Sikkerhet/GDPR/P3-A05 med uavklart identitet/merge,
person/pilotscope, kritisk UX, feedback og operativ rådgiveraksept er fortsatt synlige.
NITO og Sentralbord venter; ingen ny arbeidsstrøm. Commit/push er eksplisitt autorisert.

Opprinnelig kandidatidentitet, main-verification, integritetsrapport og protected-
status-verification beskriver lokal validering før publiseringsfullmakten og er
uendret. [Publiseringsførkontrollen](publication-preflight.json) bevarer alle
32 opprinnelige filhasher og prosjektstatusens hash før metadataoppdateringen.
Den forutgående tre-fils avklaringen publiseres uten byteendring.
Gjeldende SHA256SUMS forsegler alle pakkefiler unntatt selve checksumfilen og
publication-integrity.json. Sistnevnte kontrollerer checksumfilen og er selv
bundet av Git-commit og kontrollert staging; slik unngås sirkulære hasher.
