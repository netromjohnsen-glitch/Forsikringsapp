# Publiseringsfullmakt – tre kildehenvisninger for gjenoppføring

Brukerens eksplisitte instruks 23. oktober 2026:

> Publiser den validerte gjenoppføringsbolken til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av den ferdig validerte bolken:
hus.gjenoppforing.hovedregel, hus.gjenoppforing.totalskade og hus.gjenoppforing.svanemerket,
Standard-side17 til16 med arv på Hus Pluss, kontroller, receipt og prosjektstatus.
Fullmakten erstatter manglende publiseringsfullmakt i uendret authorization.json.
Ingen nye kode-/testendringer, installasjon eller deploy. Forutgående lesende
revalidering, fire filer, følger med byte-identisk som nødvendig kilde-/beslutningsbevis.
Historiske statusfelt der beskriver tidspunktet for kontrollen og omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
39b63c1b9c50e77ba1777072f348854735840678. Alle fire kode-/testfiler er identiske med
kandidaten som bestod2555/2555 målrettede,6247/6247 fullsuite uten skip og scoped
ESLint0/0. Bare publiseringsmetadata endres; ingen ny appsuite kreves. Testet basis
og kandidatidentitet holdes adskilt fra publiseringscommitten. Publisert status gjelder
etter bekreftelse av den inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, receipt og prosjektstatus.

Kampanje67, B-05137/0/1/1, P2-kreditt0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes, inkludert HTU.
Samlet katalog-/pilotklarering gis ikke. NITO venter; Sentralbord venter separat.
Ingen deploy eller ny arbeidsstrøm.
