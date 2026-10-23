# Publiseringsfullmakt – Forsikrede bygninger, kildehenvisning

Brukerens eksplisitte instruks 23. oktober 2026:

> Publiser den validerte kildehenvisningsrettelsen for hus.bygninger.dekning til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av den ferdig validerte
side2-til3-rettelsen, nødvendige tester, receipt, prosjektstatus og tilhørende auditbevis.
Fullmakten erstatter manglende publiseringsfullmakt fra implementeringsturnen,
registrert uendret i authorization.json. Ingen nye kode-/testendringer, installasjon
eller deploy. Den fem filer store forutgående lesende revalideringen følger med
byte-identisk som nødvendig kilde-/beslutningsbevis; historiske statusfelt i den
beskriver tidspunktet for lesekontrollen og omskrives ikke.

Fersk GitHub-main er lik HEAD og origin/main på
1b5b5aaa7d2e56845146be0a935ddc0e5a697f4f. Alle åtte kode-/testfiler er identiske med
kandidaten som bestod2552/2552 målrettede,6244/6244 fullsuite og scoped ESLint0/0.
Ingen gjenkjøring av appsuite for publiseringsmetadata alene; eksakt kandidatidentitet
beholdes adskilt fra senere publiseringscommit. Publiseringsstatus gjelder først
etter verifisering av den inneholdende committen på remote main.

Filmanifestet publish-files.json avgrenser staging. Publisering bruker etablert
sikret ../b050-diagnostics-integrity-3c5e869/publish.py: eksakt staging og forventet
HEAD/fersk remote main, begge diffkontroller, kontrollert exit-status, commit og
ordinær push uten force. Remote-fremdrift stopper publisering. Etterpå bekreftes
HEAD = origin/main = remote main, ren arbeidskopi og de publiserte filenes hashes.

Alle HOLD, B-05137/0/1/1, kampanje67, globalt UNKNOWN, P2-kreditt0 og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Ingen komplett katalog-/pilotklarering.
NITO venter; Sentralbord venter separat. Ingen ny arbeidsstrøm eller deploy.
