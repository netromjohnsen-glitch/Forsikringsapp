# Publiseringsfullmakt – oppgjørsform og arbeidsbetaling

Brukerens eksplisitte instruks 24. oktober 2026:

> Publiser den validerte bolken for oppgjørsform og arbeidsbetaling til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert bolk:
hus.gjenoppforing.oppgjorsmate på ordinært Hus Standard og Hus Pluss, begge
originalbindinger GAP-2113/SF-3031 og GAP-2172/SF-3118, kontroller, receipt og
prosjektstatus. Ingen nye kode-/testendringer. Standard-kilde side16 og Pluss-kilde
side17 med replacesBase og avklart ordlyd beholdes identisk med testet kandidat.
Fullmakten erstatter manglende publiseringsfullmakt i uendret authorization.json,
review-files.json og historiske valideringssnapshots. De tidligere lesende
revaliderings- og mappingpakkene, fire og fem filer, følger med byte-identisk som
nødvendig kilde-/beslutningsbevis. Deres historiske statusfelt omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
6d42440b60cff961a9786bdde083506b96523661. Alle12 kode-/testfiler samsvarer med
kandidaten som bestod2615/2615 målrettede og6307/6307 fullsuite uten skip og
ESLint0/0. Bare publiseringsmetadata endres; ingen ny appsuite kreves. Testet basis
og kandidatidentitet holdes adskilt fra publiseringscommitten. Publisert status
gjelder etter bekreftelse av den inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, receipt og prosjektstatus.

Originalregisterets P2/DEFER_POST_PILOT for8db65d4d3da9e98b bevares som historikk.
Kampanje67, B-05137/0/1/1, ny signaturkreditt0, P2-kreditt0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes inkludert HTU.
Samlet katalog-/pilotklarering gis ikke. NITO venter; Sentralbord venter separat.
Ingen installasjon, deploy eller ny arbeidsstrøm.
