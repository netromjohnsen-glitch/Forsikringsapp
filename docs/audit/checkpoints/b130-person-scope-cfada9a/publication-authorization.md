# Publiseringsfullmakt – personkrets

Brukerens instruks 23. oktober 2026:

> Publiser den validerte bolken for d58bff0e6b2d46eb til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Tillater én atomisk commit og ordinær push til main av den validerte bolken,
begge originalbindinger GAP-2081/SF-2982 og GAP-2135/SF-3066, kontroller, receipt
og prosjektstatus. Den går foran manglende commit/push-fullmakt i
[implementeringsfullmakten](authorization.json). Ingen nye kode-/testendringer,
installasjon eller deploy. Den tre filer store forutgående avklaringen publiseres
byte-identisk som nødvendig kilde- og beslutningsbevis.

[Førkontrollen](publication-preflight.json) bekrefter at fersk GitHub-main,
hentet origin/main og HEAD er lik testet basis
`cfada9a3c73de450f53b784ec2b60b41c434a10a`. Alle ni kode-/testfiler er identiske
med kandidaten, alle åtte sluttgater og ni gatelogger er verifisert. Fullsuite
6225/6225, målrettet2533/2533, typegen/TypeScript, webpack, ESLint0/27 uendrede
warnings og lokal syntetisk HTTP/PDF22/22 PASS. Ingen appsuite gjentas for disse
publiseringsmetadataene alene. Testet basis og kandidatidentitet holdes adskilt
fra publiseringscommitten.

Alle komprimerte bevis er lest ut og V8-baselinen er dekodet. Ingen nøkkel-/tokenfunn;
214 manuelle input, 144 dokumentinput og 12 tilleggskonfigurasjoner er identiske
med publiserte syntetiske fixtures. Manifestet inneholder bare godkjent kode/test,
offentlige vilkår/katalogdata, syntetiske kontroller og nødvendig auditmetadata.
Ingen kundedata-, miljø- eller nøkkelfiler inngår.

[Filmanifest](publish-files.json) avgrenser staging. [Publiseringsintegritet](publication-integrity.json)
bekrefter identitet, kilder, historiske bevis, HOLD og lenker.
Etablert sikret [publiseringsskript](../b050-diagnostics-integrity-3c5e869/publish.py)
kontrollerer eksakt staging, forventet HEAD/fersk remote main, begge diffkontroller
og exit-status før commit og ordinær push. Ingen force. Remote-fremdrift stopper
publiseringen. Etterpå bekreftes HEAD = origin/main = GitHub-main, ren arbeidskopi
og rettelse/receipt/prosjektstatus på den konkrete publiseringsrevisjonen.

Publisert status og 67 dokumenterte kampanjesignaturer gjelder etter at den
inneholdende committen er verifisert på remote main; basisen har 66 publiserte.
Alle HOLD, B-05137/0/1/1, globalt UNKNOWN, P2-kreditt0 og REMEDIATION_REQUIRED
beholdes. Samlet katalogrevalidering og øvrige pre-pilotpunkter gjenstår. NITO og Sentralbord venter.
