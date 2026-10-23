# Manuelt Utleie-valg gjennom gjentatt beriking

23. oktober 2026. Basis/fersk main: `d53c2a1d60c907e71ad8f626a4a788d29f5ba203`.
Publisering med commit og push er autorisert i [fullmakten](publication-authorization.md).
Publiseringsrevisjonen er committen som inneholder pakken; publisert status gjelder
etter bekreftelse på remote main. Testet basis-SHA og kandidatfilidentitet beholdes
separat. Ingen installasjon eller deployhandling.

Eksplisitt manuelt Utleie-valg for Hus Standard/Hus Pluss, ordinary / Alminnelige vilkår,
bevares med addon-/provider-/produkt-/versjonsbundet bevis. ID og fem eksisterende
hus.utleie.*-rader beholder komplette verdier, kilder/noter, override og katalogopprinnelse
på gjentatt beriking og JSON. Avvalg via ny manuell registrering fjerner beviset.
Et manuelt valg dokumenterer registrering, ikke oppfyllelse av forsikringsbevisets krav.

Eksplisitt dokumentstatus i manuell kontekst kan avslå valget eller gi konflikt/ukjent.
Katalogen lager ingen dokumentert Valgt-rad. Detaljvilkår er ikke foreldervalg;
kundeverdier og kilder beholdes, også uttrykkelig ukjent detalj uten katalogfallback.
Bare selected velger komponent/viser valgt tillegg. Rå-ID/navn/tilgjengelighet eller
feil valgbevis er ikke valg. Bare Utleie-valg, og Valg/Valgstatus/Status/Dekning inne i
et dokumentert Utleie-tillegg, er lokale valghoder; ingen ny global alias eller enum.
Ren dokumentpipeline uten manuell/katalogkontekst er uendret. Dette inkluderer dokument-
opprinnelige tillegg med egne kildepekere. Hele dokumentbaserte Utleie-valgregelen gis
ingen lukking; dette er ikke full kundemodus eller pilotklarering.

[Fullmakt](authorization.md), [fersk main](main-verification.json),
[kilde/kontrakt](source-and-contract-preflight.json), [før-baseline](baseline-identity.json),
[kandidatidentitet](candidate-identity.json), [kontrakttestoppdateringer](test-contract-updates.json),
[receipt](completion-receipt-manual-rental-choice.json), [validering](validation-summary.json),
[alle gateforsøk](gate-results.json), [testmanifest](test-manifest.json),
[checkpoint](checkpoint.json), [aktuelle funn](rental-customer-findings.json) og
[beskyttet status](protected-status-verification.json),
[publiseringskontroll](publication-preflight.json) og
[eksakt publiseringsmanifest](publish-files.json).

44 nye tester; 593/593 målrettet; 5766/5766 fullsuite i 163 filer uten skip.
Typegen, TypeScript, ESLint (0 feil / 27 eksakt uendrede warnings), webpack-bygg og
lokal syntetisk HTTP/PDF-runtime 22/22 består. Åtte sluttgater er bundet til samme
åtte applikasjons-/testfilhasher. Tidlig targeted-kjøring har egen eldre filidentitet
og teller ikke som sluttgate. Simulert AI og syntetiske data i runtime.

Før-baseline ble fanget før produksjonsendring på ren basis: 202 andre produkter,
seks ikke-Utleie-kontroller, seks manuelle Utleie-kombinasjoner og 144 faktiske
rene dokumentforløp. Baseline og historiske auditpakker endres ikke. Bare det
nye Utleie-beviset endrer initialoutput; ID, katalogfakta og fem eksakte opprinnelige
rader endrer repeat. Eldre aktive Smart/råte-forventninger tillater bare denne eksakte
differansen. Ingen negative kontroller fjernes eller tester hoppes over.

Runneren er gjenbrukt fra forrige bolk. `run-final-gates.py` støtter targeted/full/
quality/runtime, krever samme HEAD og uendrede kandidatfiler og lagrer uforanderlige
loggnavn. Gjentatt kjøring krever nytt loggnavn/beviskontekst. Poppler må være på PATH;
HTTP/PDF bruker lokale testporter. Ingen kommando her publiserer eller deployer.

HTU og alle øvrige HOLD beholdes. Ingen kilde-/katalog-, pris- eller generell
motor-/schemaendring; hus.leietap.skade og hus.rettshjelp.dekning er uendret.
B-051 37/0/1/1; kampanje 63; global UNKNOWN; P2-kreditt 0;
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED. SC-020/SR-032 er fysisk insektegenandel,
separat fra dette valget. NITO/Sentralbord venter; sikkerhet/GDPR/P3-A05, pilotscope,
UX, feedback og rådgiveraksept står på vent. Ingen ny arbeidsstrøm eller originalsignaturkreditt.
