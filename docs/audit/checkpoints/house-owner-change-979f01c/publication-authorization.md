# Publiseringsfullmakt – d1230f13e6b445d7, bare punkt 12

Brukerens eksplisitte instruks 24. oktober 2026:

> Publiser den validerte punkt 12-bolken under d1230f13e6b445d7 til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert punkt 12
«Opphør ved eierskifte» på ordinært Hus Standard og Hus Pluss: punkt 12 innen
GAP-2110/SF-3024 og GAP-2169/SF-3111. To rå rader under hus.avtale.eierskifte,
kontroller, delreceipt og prosjektstatus følger med. Eksakt hel ordlyd, egne
Standard-/Pluss-kilder på side 12/13 og replacesBase på Pluss er identiske med
testet kandidat. Ingen nye kode-/testendringer. Ingen automatisk oppsigelse,
datoberegning eller endring av kundens avtale-/dekningsstatus.

Øvrige dimensjoner i originalsignaturen er utenfor bolken, ikke ferdig vurdert
eller lukket. Delreceipt er completion-receipt-d1230f13e6b445d7-point12.json;
hele signaturen får ingen fullføringskreditt. Originalregisterets
P2/DEFER_POST_PILOT beholdes som historikk.

Fullmakten erstatter manglende publiseringsfullmakt i uendret authorization.json,
review-files.json og historiske valideringssnapshots. Forutgående lesende
revaliderings- og mappingpakker, fire filer hver, følger med byte-identisk som
nødvendig kilde-/beslutningsbevis. Historiske statusfelt der omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
979f01ca8cac052372cd610c537d9258269cc081. Alle 10 kode-/testfiler samsvarer med
kandidaten som bestod 2952/2952 målrettede tester og 6644/6644 fullsuite,
uten feil eller skip, samt ESLint 0/0. Bare publiseringsmetadata endres;
ingen ny appsuite kreves. Testet basis og kandidatidentitet holdes adskilt fra
publiseringscommitten. Publisert status gjelder etter bekreftelse av den
inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, delreceipt og prosjektstatus.

Kampanje 67, B-051 37/0/1/1, ny signaturkreditt 0, P2-kreditt 0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes,
inkludert HTU. Samlet katalog-/pilotklarering gis ikke. NITO venter;
Sentralbord venter separat. Ingen installasjon, deploy eller ny arbeidsstrøm.
