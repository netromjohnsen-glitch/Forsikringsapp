# Publiseringsfullmakt – d68e94be42f1549b

Brukerens eksplisitte instruks 24. oktober 2026:

> Publiser den validerte bolken for d68e94be42f1549b til main med commit og push. Kontroller fersk main og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av ferdig validert
hagebeplantning/importverdsetting på ordinært Hus Standard og Hus Pluss:
GAP-2114/SF-3032 og GAP-2173/SF-3119, fire rå rader under hus.hage.oppgjor og
hus.gjenoppforing.import.begrensning, kontroller, receipt og prosjektstatus.
Standard-kilde side16 og Pluss-kilde side17 med replacesBase og avklart ordlyd
beholdes identisk med testet kandidat. Ingen nye kode-/testendringer.
Fullmakten erstatter manglende publiseringsfullmakt i uendret authorization.json,
review-files.json og historiske valideringssnapshots. Forutgående lesende
revaliderings- og mappingpakker, fire filer hver, følger med byte-identisk som
nødvendig kilde-/beslutningsbevis. Historiske statusfelt der omskrives ikke.

Fersk GitHub-main, HEAD og origin/main er lik testet basis
83c8fee68cc5accb76ded645b689976fff16d533. Alle10 kode-/testfiler samsvarer med
kandidaten som bestod2696/2696 målrettede og6388/6388 fullsuite uten skip og
ESLint0/0. Bare publiseringsmetadata endres; ingen ny appsuite kreves. Testet basis
og kandidatidentitet holdes adskilt fra publiseringscommitten. Publisert status
gjelder etter bekreftelse av den inneholdende committen på remote main.

publish-files.json avgrenser staging. Etablert sikret
../b050-diagnostics-integrity-3c5e869/publish.py kontrollerer eksakt staged-sett,
forventet HEAD og fersk remote main, begge diffkontroller og exit-status før
commit og ordinær push uten force. Remote-fremdrift stopper publisering.
Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi og eksakte
fil-/kandidat-hasher for rettelsen, receipt og prosjektstatus.

Originalregisterets P2/DEFER_POST_PILOT for d68e94be42f1549b bevares som historikk.
Kampanje67, B-05137/0/1/1, ny signaturkreditt0, P2-kreditt0, globalt UNKNOWN og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD beholdes inkludert HTU.
Samlet katalog-/pilotklarering gis ikke. NITO venter; Sentralbord venter separat.
Ingen installasjon, deploy eller ny arbeidsstrøm.
