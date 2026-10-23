# Manuelt Smart-valg gjennom gjentatt beriking

23. oktober 2026. Basis er fersk remote main `24dfac79717f3efeab7302ce4fa8010de64da3d2`.
Publisering med commit og push er autorisert i [fullmakten](publication-authorization.md).
Publiseringsrevisjonen er committen som inneholder pakken; publisert status gjelder
etter bekreftelse på remote main. Ingen deployhandling. Testet basis-SHA og
kandidatfilidentitet beholdes separat fra publiseringsrevisjonen.

Eksplisitt manuelt Smart-valg på Hus Standard/Hus Pluss, ordinary / Alminnelige vilkår,
får et strengt valgbevis bundet til Smart-tillegget og katalogens provider/produkt/versjon.
Det beholder Smart-ID, tre eksisterende nøkler og katalogverdier med komplette kilder
på gjentatt beriking og JSON-roundtrip. Avvalg via ny manuell registrering fjerner
beviset. Dokumentvalg/avslag/konflikt/uttrykkelig ukjent beholder eksisterende prioritet.
Ingen ny Valgt-dokumentrad fremstilles fra katalogen. Tilgjengelighet og rå-ID er ikke valg.

[Fullmakt](authorization.md), [fersk main](main-verification.json),
[kilde- og kontraktgrunnlag](source-and-contract-preflight.json),
[før-baseline](baseline-identity.json), [kandidatidentitet](candidate-identity.json),
[aktive kontrakttestoppdateringer](test-contract-updates.json),
[receipt](completion-receipt-manual-smart-choice.json),
[validering](validation-summary.json), [gatelogger](gate-results.json),
[testmanifest](test-manifest.json), [checkpoint](checkpoint.json) og
[beskyttet status](protected-status-verification.json),
[publiseringskontroll](publication-preflight.json) og
[eksakt publiseringsmanifest](publish-files.json).

28 nye tester; målrettet 507/507; fullsuite 5722/5722 i 162 filer uten skip.
Typegen, TypeScript, ESLint (0 feil / 27 eksakt uendrede warnings), webpack-bygg og
lokal syntetisk HTTP/PDF-runtime 22/22 består. Samme åtte applikasjons-/testfilhasher
ligger bak alle sluttgater. Ingen pakker er installert. Runtime bruker simulert AI.

Før-baseline ble fanget på ren main før produksjonsendringene: 202 andre manuelle
produkter, ni manuelle målproduktvalg og 96 faktiske dokumentforløp. Baseline er
uendret og kontrolleres mot SHA-256 i permanente tester. Bare de fire positive
manuelle Smart-valgenes markør og videreføring endres; de fem øvrige kontrollvalgene
og 96 dokumentforløp er eksakt uendret. Eldre dokumentvalg-baseline beholdes; aktive
assertions beskriver bare den autoriserte differansen. Rå DATA_ONLY-kildeorakel
forblir frosset. Tidlige testforsøk og rettingene er bevart i separat logg.

Sluttgatene kan gjentas med `run-final-gates.py` og targeted/full/quality/runtime.
Runneren er gjenbrukt fra eksisterende kontrollverktøy; den krever basis-HEAD og
uforandrede kandidatfiler. Loggnavn er uforanderlige: velg en ny beviskontekst for
ny kjøring. Poppler må finnes på PATH, og lokal runtime trenger lokale testporter.
Ingen kommando i denne pakken publiserer eller deployer.

B-051 er fortsatt 37/0/1/1; kampanje 63; global status UNKNOWN; P2-kreditt 0;
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED. HTU og alle andre HOLD beholdes.
SC-020/SR-032 gjelder fysisk insektegenandel, separat fra Smart. Valg bekrefter ikke
alarmaktivering eller oppfylte vilkår for egenandelsreduksjon. Katalog, kildebytes,
prisberegning og øvrige manuelle tilleggsregler er uendret. NITO og Sentralbord venter;
sikkerhet/GDPR/P3-A05, pilotscope, kritisk UX, feedback og rådgiveraksept er synlige
på vent. Denne pakken gir ingen ny originalsignaturkreditt eller pilotklarering.
