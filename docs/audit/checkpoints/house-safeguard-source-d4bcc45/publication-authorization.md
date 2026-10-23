# Publiseringsfullmakt – ordinært egenandelsfritak ved sikring

Brukerens eksplisitte instruks 23. oktober 2026:

> Publiser den validerte bolken for hus.sikkerhet.egenandelsfritak til main med commit og push. Kontroller fersk main og bekreft receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert rettelse:
hus.sikkerhet.egenandelsfritak, Standard-side 18 til 17 med arv på Hus Pluss,
tilhørende kontroller, receipt og prosjektstatus. Fullmakten erstatter manglende
publiseringsfullmakt i uendret authorization.json og historiske valideringssnapshots.
Ingen nye kode-/testendringer, installasjon eller deploy. Forutgående lesende
revalidering, fire filer, følger med byte-identisk som nødvendig kilde-/beslutningsbevis.
Historiske statusfelt beskriver kontrolltidspunktet og omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
d4bcc45e27ba41fe62c2f681c7de5e0dab51bb9b. Alle fem kode-/testfiler er identiske med
kandidaten som bestod 2558/2558 målrettede og 6250/6250 fullsuite uten skip og scoped
ESLint 0/0. Bare publiseringsmetadata endres; ingen ny appsuite kreves. Testet basis
og kandidatidentitet holdes adskilt fra publiseringscommitten. Publisert status gjelder
etter bekreftelse av den inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, receipt og prosjektstatus.

Kampanje 67, B-051 37/0/1/1, ny signaturkreditt 0, P2-kreditt 0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes, inkludert HTU.
Samlet katalog-/pilotklarering gis ikke. NITO venter; Sentralbord venter separat.
Ingen deploy eller ny arbeidsstrøm.
