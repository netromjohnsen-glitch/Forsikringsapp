# Publiseringsfullmakt – frost og bygningsvern

Brukerens instruks 23. oktober 2026:

> Publiser den validerte bolken for ce90710821e28a97 til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Fullmakten tillater én samlet commit og ordinær push til main av den validerte
frost-/bygningsvernbolken, tilhørende kontroller, receipt og prosjektstatus.
Den erstatter bare manglende commit/push-fullmakt i [implementeringsfullmakten](authorization.json).
Ingen nye kode-/testendringer, installasjon eller deployhandling utføres.
Den tre filer store forutgående avklaringen publiseres byte-identisk som nødvendig
kilde-/beslutningsbevis for denne bolken; ingen ny historisk lukking opprettes.

[Førkontrollen](publication-preflight.json) bekrefter fersk GitHub-main, hentet
origin/main og HEAD lik testet basis 8422e39214aadff2dd31292e84ee4ca9cf818b30,
tom staging, 19 identiske kode-/testfiler, åtte sluttgater PASS, ti eksakte
gatelogger, begge originalkilder og 51 uendrede filer i tidligere bevispakker.
Kode og tester er uendret; appsuiten gjentas derfor ikke for publiseringsmetadata alene.

[Filmanifest](publish-files.json) avgrenser staging til nøyaktig 59 filer.
[Publiseringsintegritet](publication-integrity.json) dokumenterer også innholdskontroll:
alle komprimerte bevis er lest ut, V8-baselinen er dekodet, ingen nøkkel-/tokenfunn,
og eneste e-postmønster er syntetisk example.invalid. Alle 214 manuelle input,
144 dokumentinput og 12 tilleggskonfigurasjoner er identiske med publiserte fixtures.
Pakken består av godkjent kode/test, offentlige vilkår/katalogdata, syntetiske
kontroller og nødvendige auditmetadata. Ingen kundedatafiler eller miljøfiler inngår.

Etablert sikret [publiseringsskript](../b050-diagnostics-integrity-3c5e869/publish.py)
kontrollerer eksakt staging, forventet HEAD/fersk remote main, begge diffkontroller
og exit-status før commit og ordinær push. Ingen force. Remote-fremdrift stopper
publiseringen. Etterpå kontrolleres HEAD = origin/main = GitHub-main, ren arbeidskopi,
og rettelse/receipt/prosjektstatus leses tilbake på den konkrete publiseringsrevisjonen.

Publiseringsrevisjonen er Git-committen som inneholder bolken. Publisert status
og 65 dokumenterte kampanjesignaturer gjelder etter bekreftelse av denne committen
på remote main; den testede basisen har 64 publiserte. Testet basis/kandidatidentitet
holdes adskilt fra senere dokumentasjonscommit. Alle HOLD, B-051 37/0/1/1,
globalt UNKNOWN, P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. Fullverdi/personkrets
og øvrige pre-pilotpunkter står åpne. NITO og Sentralbord venter.
