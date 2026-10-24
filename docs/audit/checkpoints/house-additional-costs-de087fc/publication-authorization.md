# Publiseringsfullmakt – e103e7cb532fb8d4

Brukerens eksplisitte instruks 24. oktober 2026:

> Publiser den validerte bolken for e103e7cb532fb8d4 til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert bolk for
ordinært Hus Standard og Hus Pluss: GAP-2099/SF-3008 og GAP-2158/SF-3095,
seks rå rader under hus.rydding.dekning, hus.gjenoppforing.prisstigning og
hus.vann.vannavgift, kontroller, receipt og prosjektstatus. Eksakt ordlyd,
primære/avgrensende kilder og egne Pluss-rader med replacesBase beholdes identisk
med testet kandidat. Ingen nye kode-/testendringer.

Denne fullmakten erstatter manglende publiseringsfullmakt i uendret
implementation authorization.json, review-files.json og historiske
valideringssnapshots. Forutgående lesende revaliderings- og mappingpakker,
fire filer hver, følger med byte-identisk som nødvendig kilde-/beslutningsbevis.
Historiske statusfelt der omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
`de087fccb92706dbf8d2bf6a697aa6cf6a27081a`. Alle 14 kode-/testfiler samsvarer
med kandidaten som bestod 2801/2801 målrettede tester og 6493/6493 fullsuite,
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

Originalregisterets P2/DEFER_POST_PILOT bevares som historikk. Kampanje 67,
B-051 37/0/1/1, ny signaturkreditt 0, P2-kreditt 0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes,
inkludert HTU. Samlet katalog-/pilotklarering gis ikke. NITO venter;
Sentralbord venter separat. Ingen installasjon, deploy eller ny arbeidsstrøm.
