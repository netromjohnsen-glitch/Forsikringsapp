# Publiseringsfullmakt – a6beec054bdae0df

Brukerens eksplisitte instruks 24. oktober 2026:

> Publiser den validerte bolken for a6beec054bdae0df til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert bolk for
ordinært Hus Standard og Hus Pluss: GAP-2084/SF-2987 og GAP-2138/SF-3071.
Fire rå rader under hus.bygninger.hobbyveksthus.unntak og
hus.bygninger.mineralolje.unntak, kontroller, receipt og prosjektstatus følger med.
Eksakt ordlyd, egne Standard-/Pluss-kilder på PDF-side 3 og replacesBase på
Pluss beholdes identisk med testet kandidat. Ingen nye kode-/testendringer.

Fullmakten erstatter manglende publiseringsfullmakt i uendret authorization.json,
review-files.json og historiske valideringssnapshots. Forutgående lesende
revaliderings- og mappingpakker, fire filer hver, følger med byte-identisk som
nødvendig kilde-/beslutningsbevis. Historiske statusfelt der omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
`115ca6aba5d547e5059294bcce6dad6d0a19d59a`. Alle 10 kode-/testfiler samsvarer
med kandidaten som bestod 2886/2886 målrettede tester og 6578/6578 fullsuite,
uten feil eller skip, samt ESLint 0/0. Bare publiseringsmetadata endres;
ingen ny appsuite kreves. Testet basis og kandidatidentitet holdes adskilt fra
publiseringscommitten. Publisert status gjelder etter bekreftelse av den
inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, receipt og prosjektstatus.

Originalregisterets P2/DEFER_POST_PILOT beholdes som historikk. Kampanje 67,
B-051 37/0/1/1, ny signaturkreditt 0, P2-kreditt 0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes,
inkludert HTU. Samlet katalog-/pilotklarering gis ikke. NITO venter;
Sentralbord venter separat. Ingen installasjon, deploy eller ny arbeidsstrøm.
