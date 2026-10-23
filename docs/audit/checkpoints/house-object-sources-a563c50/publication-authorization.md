# Publiseringsfullmakt – fast inventar og solcelleanlegg

Brukerens eksplisitte instruks 23. oktober 2026:

> Publiser den validerte bolken for hus.bygninger.tilbehor og hus.teknisk.solceller til main med commit og push. Kontroller fersk main og bekreft receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av den validerte rettelsen,
nødvendige tester, receipt, prosjektstatus og auditbevis. Fullmakten erstatter
manglende publiseringsfullmakt i den uendrede implementeringsfullmakten authorization.json.
Ingen nye kode-/testendringer, installasjon eller deploy. Forutgående lesende
revalidering, fire filer, følger med byte-identisk som nødvendig kilde-/beslutningsbevis.
Historiske statusfelt der beskriver tidspunktet for kontrollen og omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
a563c50324f62cbdcd57c162fd0d02632def982b. Alle tre kode-/testfiler er identiske med
kandidaten som bestod2552/2552 målrettede og6244/6244 fullsuite, uten skip, samt
scoped ESLint0/0. Bare publiseringsmetadata endres; ingen ny appsuite kreves.
Testet basis og eksakt kandidatidentitet holdes adskilt fra publiseringscommitten.
Publisert status gjelder etter bekreftelse av den inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og publiserte
rettelser, receipt og prosjektstatus med eksakte fil-/kandidat-hasher.

Kampanje67, B-05137/0/1/1, P2-kreditt0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes, inkludert HTU.
Samlet katalog-/pilotklarering gis ikke. NITO venter; Sentralbord venter separat.
Ingen deploy eller ny arbeidsstrøm.
