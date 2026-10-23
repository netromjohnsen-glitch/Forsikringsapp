# Publiseringsfullmakt – fraflyttet bolig

Brukerens instruks 23. oktober 2026:

> Publiser den validerte fraflyttingsbolken for 597df4c45c6d3db9 til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Fullmakten tillater én commit og ordinær push til main av den allerede validerte
kandidaten, tilhørende tester, receipt og prosjektstatus. Den erstatter bare
manglende commit/push-fullmakt i [implementeringsfullmakten](authorization.json).
Ingen nye kode-/testendringer, installasjon eller deployhandling utføres.
De to forutgående lesende bevispakkene inkluderes byte-identisk fordi kandidatens
tester og receipt avhenger av dem. De får ingen ny lukking eller omskrevet historikk.

[Førkontroll](publication-preflight.json) bekrefter fersk GitHub-main og hentet
origin/main lik testet basis f5f88cc08f7cd863c9ce5d618319fa06fa9c1493, tom staging,
18 identiske kode-/testfiler, alle åtte sluttgater PASS, samtlige 21 gate-logger,
originalkildene og 49 uendrede filer i tidligere bevispakker. Kode/test er uendret;
hele appsuiten gjentas derfor ikke for publiseringsmetadata alene.

[Filmanifest](publish-files.json) avgrenser staging. Etablert sikret
[publiseringsskript](../b050-diagnostics-integrity-3c5e869/publish.py) kontrollerer
exit-status, forventet HEAD/fersk remote main, eksakt staging og begge diffkontroller
før commit og ordinær push; ingen force. Remote-fremdrift stopper publiseringen.
Etter push kontrolleres HEAD = origin/main = GitHub-main, ren arbeidskopi og
rettelse/receipt/prosjektstatus på den konkrete publiseringsrevisjonen.

Publiseringsrevisjonen er Git-committen som inneholder denne bolken.
Publisert status og 64 dokumenterte kampanjesignaturer gjelder først når denne
committen er bekreftet på remote main; basisens publiserte antall er fortsatt 63.
Dette skiller testet basis og kandidatidentitet fra senere dokumentasjonscommit.
Alle HOLD, B-051 37/0/1/1, globalt UNKNOWN, P2-kreditt 0 og
REMEDIATION_REQUIRED beholdes. Øvrige tre B-130-reviews står åpne.
NITO og Sentralbord venter; øvrige pre-pilotpunkter beholdes synlige.
