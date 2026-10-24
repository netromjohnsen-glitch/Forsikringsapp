# Aktuell dokumentert prosjektstatus

## Helsehjelp: rabatt på fysiske konsultasjoner – validert 24. oktober 2026

Fersk main-basis er `27dffab69b656e2ea56027f7515ee9955074fba6`. `ed34078f38391643` med begge originalbindinger
GAP-2123/SF-3053 og GAP-2182/SF-3139 er validert som én egen detaljrad:
`hus.service.helsehjelp.fysisk_rabatt`. Hus Standard eier raden; Hus Pluss
arver den. Registrert produktside dokumenterer 15 % rabatt på fysiske konsultasjoner
med allmennlege, psykolog og andre utvalgte helsetjenester hos Dr.Dropin.
Standard side 11 supplerer med tjenestens ordinære vilkår og avgrensning av
behandlingsutgifter. Hele eksisterende Helsehjelp-rad og øvrige produksjonsbytes
beholdes. Ingen rabatt-/premieberegning, forsikringsoppgjør eller nye kundevalg.

3422/3422 målrettede tester i 51 filer og 7114/7114 tester i 180 filer består
uten feil eller skip. 58 nye kontraktkontroller dekker kilder, begge husnivåer,
12 tilleggskombinasjoner, dokumentprioritet og tre JSON-berikinger.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger bevarer
øvrige felt, inkludert alle seks publiserte Smart-detaljer.
Kvalitetskontroll av ti kode-/testfiler: 0 feil og 0 warnings.

[Receipt](../audit/checkpoints/house-health-discount-27dffab/completion-receipt-ed34078f38391643.json),
[validering](../audit/checkpoints/house-health-discount-27dffab/validation-summary.json),
[beslutning](../audit/checkpoints/house-health-discount-27dffab/contract-decision.json) og
[checkpoint](../audit/checkpoints/house-health-discount-27dffab/checkpoint.json).
Publiseringsrevisjonen er committen som inneholder rettelsen, receipten og denne statusen.
Publisert status gjelder etter kontroll av remote main under
[publiseringsfullmakten](../audit/checkpoints/house-health-discount-27dffab/publication-authorization.md).
Ingen global signatur-/P2-/kampanjekreditt; historisk P2/DEFER_POST_PILOT beholdes.
Samlet ordinært grunnlag revalideres etter publisering. Alle HOLD og øvrige
pre-pilotpunkter beholdes: sikkerhet/GDPR og P3-A05-identitet/mergestatus,
personforsikring/pilotscope, kritisk UX, feedback og operativ rådgiveraksept.
B-051 37/0/1/1, kampanje 67, globalt resolved/open UKJENT og
REMEDIATION_REQUIRED er uendret. Ingen installasjon eller deploy.
NITO venter; Sentralbord venter separat.

## Seks ordinære Smart-detaljer – validert 24. oktober 2026

Fersk main-basis er `b618f7ecdb9fb99ea74ba0581b37ead8a406fd78`. Seks avgrensede røtter er validert på denne basisen:
pris, installasjon/leverandørbytte, aktivering/kundeplikter, utstyr/retur/skylagring,
flytting/oppsigelse og ordinært pakkeinnhold. De gir seks nye detaljrader i den
eksisterende valgfrie Smart-komponenten for Hus Standard og Hus Pluss.
Ingen nye kundevalg, premie-/sum-/dekningsberegninger eller globale aliaser.
Veiledende tjenestepris holdes separat fra forsikringspremien; kundens gjeldende
avtale styrer faktisk pris. Originalvilkårets punkt 8 og 10 beholdes ordrett,
inkludert skillet mellom flytting og bytte av selskap. Kjøpt ringeklokke og
leieutstyr skilles; skylagringens tolv måneder og etterfølgende avtale bevares.
Egne medlemsfordeler legges ikke til ordinærpakker. Begge registrerte HTML-kilder
og alle tolv opprinnelige GAP-/SF-bindinger er kontrollert.

3364/3364 målrettede tester i 50 filer og
7056/7056 tester i 179 filer består uten feil eller skip.
169 nye kontraktkontroller dekker 12 valgkombinasjoner, 140 individuelle dokumenttilfeller,
tre gjentatte JSON-berikinger, kildehenvisninger og kundeprioritet. 214 manuelle
kontroller, 144 dokumentflyter og 52 sammenligninger bevarer alle øvrige felt.
Kvalitetskontroll av ti kode-/testfiler: 0 feil og 0 warnings.

[Validering](../audit/checkpoints/house-smart-details-b618f7e/validation-summary.json),
[checkpoint med seks separate receipts](../audit/checkpoints/house-smart-details-b618f7e/checkpoint.json),
[kilde-/mappingbeslutning](../audit/checkpoints/house-smart-contract-b618f7e/receipt-house-smart-contract.json),
[forutgående samlet revalidering](../audit/checkpoints/house-foundation-revalidation-b618f7e/receipt-house-foundation.json).
Publiseringsrevisjonen er committen som inneholder rettelsen, de seks receipts
og denne statusen. Publisert status gjelder etter kontroll av remote main
under [publiseringsfullmakten](../audit/checkpoints/house-smart-details-b618f7e/publication-authorization.md).
Original P2/DEFER_POST_PILOT beholdes historisk; ingen global signatur-, P2- eller
kampanjekreditt utledes av denne bolken. Samlet ordinært katalogfundament krever
fortsatt egen revalidering på publisert main. Alle HOLD, B-051 37/0/1/1,
kampanje 67, globalt resolved/open UKJENT og REMEDIATION_REQUIRED beholdes.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige.
Ingen installasjon eller deploy. NITO venter; Sentralbord venter separat.

## Punkt 17: Krig og uroligheter – validert 24. oktober 2026

Fersk main, HEAD og origin/main er kontrollert til `5d38b87d71686ca2a3226439b6ad1ea4defaabbf`.
Punkt 12, 18 og 19 er publisert der. Punkt 17 under `d1230f13e6b445d7`
er validert på denne basisen. Publiseringsrevisjonen er committen som inneholder
rettelsen, delreceipten og denne prosjektstatusen. Publisert status gjelder
etter kontroll på remote main under [publiseringsfullmakten](../audit/checkpoints/house-war-5d38b87/publication-authorization.md).
Ingen installasjon eller deploy. Testet basis og kandidatidentitet er adskilt.

To rå rader under `hus.krig.begrensning` gir én effektiv begrensningsrad
på hvert husnivå. Hele punkt 17 er samlet: de tre alminnelige unntakene,
Norge/utland, reiseadvarsel og forbehold om annen skriftlig avtale i den
utenlandske regelen, deltakelse i krig, unntaket for personskade under
Lov om yrkesskadeforsikring og de særskilte person-/reise-/motorreglene
med seksukersvilkår. Disse typeavgrensede reglene oppretter ingen positiv
husdekning. Ingen reiseadvarsel, dato eller kundesituasjon beregnes automatisk.
Standard har hovedkilde på PDF-side 12 og fortsettelse på 13; Pluss har
hovedkilde på 13 og fortsettelse på 14 med `replacesBase`. Begge kildereferanser,
kildenoter og overstyrt Standard-provenance bevares. Alle øvrige produksjonsbytes,
inkludert punkt 12, 18 og 19, er identiske med testet main-basis.

[Delreceipt](../audit/checkpoints/house-war-5d38b87/completion-receipt-d1230f13e6b445d7-point17.json),
[validering](../audit/checkpoints/house-war-5d38b87/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-war-5d38b87/candidate-identity.json),
[checkpoint](../audit/checkpoints/house-war-5d38b87/checkpoint.json),
[forutgående revalidering](../audit/checkpoints/house-foundation-revalidation-5d38b87/receipt-house-foundation.json)
og [mappingbeslutning](../audit/checkpoints/house-war-contract-5d38b87/receipt-house-war-contract.json).
Originalbindingene GAP-2110/SF-3024 og GAP-2169/SF-3111 er validert bare for
punkt 17 i denne bolken. Hele signaturen er ikke automatisk lukket;
P2/DEFER_POST_PILOT og global signatur-/P2-/kampanjekreditt beholdes uendret.

3195/3195 målrettede tester i 49 filer og 6887/6887 tester i 178 filer består
uten feil eller skip. 87 nye kontraktkontroller dekker alle fire kildesider,
12 valgkombinasjoner, tre JSON-berikinger, dokumentprioritet, hoved-/fortsettelseskilder
og typegrensene. 214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger
bevarer øvrige felt og dekningsstatuser. Kvalitetskontroll av ti kode-/testfiler:
0 feil og 0 warnings. Mekaniske testtilpasninger gjelder bare de to kildeverifiserte
rå radene og én foreldet visningsside i ny test; historiske bevis er uendret.

Alle HOLD beholdes, inkludert HTU og de øvrige beskyttede signaturene.
B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0, P2-kreditt 0, globalt
resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.
Samlet revalidering og vurdering av originalbindingenes faktiske dimensjoner
følger etter publisering. Sikkerhet/GDPR og P3-A05-identitet/mergestatus,
personforsikring/pilotscope, kritisk UX, feedback og operativ rådgiveraksept
forblir synlige. NITO venter; Sentralbord venter separat.

## Punkt 19: Farlig spredning – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til `2028c16398b78f645eab2e42d1800c6598022470`.
Punkt 12, punkt 18 og tidligere bolker er publisert der. Punkt 19 under
`d1230f13e6b445d7` er validert på denne basisen. Publiseringsrevisjonen er
committen som inneholder rettelsen, delreceipten og denne prosjektstatusen.
Publisert status gjelder etter kontroll på remote main. Commit/push er
uttrykkelig autorisert i [publiseringsfullmakten](../audit/checkpoints/house-spread-2028c16/publication-authorization.md).
Testet basis og eksakt kandidatidentitet er adskilt fra publiseringscommitten.
Ingen installasjon eller deploy.

To rå rader under `hus.farlig_spredning.begrensning` gir én effektiv
begrensende vilkårsrad på hvert husnivå. Hele punkt 19 er bevart samlet med
alle tre ledd: de navngitte positive personskade-/reise-/personreglene,
hele farelisten med biologisk/kjemisk spredning, raketter, atomvåpen og
radioaktiv stråling, og avslutningen om at slike skader eller tap ikke dekkes
for øvrige forsikringer. Grensen på 500 millioner kroner gjelder samlet
for alle kunder og kravstillere bare innen den uttrykkelige reise-/personregelen
ved atomvåpen eller radioaktiv stråling. Regelen om samme hendelse eller en
sammenhengende hendelseskjede beholdes innen dette scopet. Beløpet er ikke
registrert som husforsikringssum, og det er ikke utledet positiv husdekning.

Standard har egen kilde på PDF-side 13, Pluss egen kilde på side 14 med
`replacesBase` og overstyrt Standard-provenance. Punkt 18 beholdes byte-identisk
som egen bestemmelse; reglene om 1 milliard/48 timer og 500 millioner/hendelseskjede
blandes ikke. Det legges ikke til noe terrorhensiktsvilkår i punkt 19.
Raden er et ikke-assertivt begrensningsvilkår: ingen automatisk dekning,
kundevalg, individuell sum, status eller hendelses-/ansvarsberegning.
Ingen engine, globale aliaser, extractor-enum, presentasjon eller kilderegister
er endret. Alle øvrige produksjonsbytes er identiske med testet main-basis.

[Delreceipt for punkt 19](../audit/checkpoints/house-spread-2028c16/completion-receipt-d1230f13e6b445d7-point19.json),
[validering](../audit/checkpoints/house-spread-2028c16/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-spread-2028c16/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-spread-2028c16/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-2028c16/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-spread-contract-2028c16/receipt-house-spread-contract.json)
beholdes byte-identisk. GAP-2110/SF-3024 og GAP-2169/SF-3111 er validert
**bare for punkt 19** i denne bolken. Publisert punkt 12 og 18 gjenåpnes ikke.
Øvrige dimensjoner i de bredere originalbindingene og signaturen er ikke
ferdig vurdert eller lukket. P2/DEFER_POST_PILOT beholdes, uten global
signatur-, P2- eller kampanjekreditt.

3108/3108 målrettede tester i 48 filer og 6800/6800 tester i 177 filer består
uten feil eller skip. 86 nye kontraktkontroller dekker komplette kildesider,
alle 12 valgkombinasjoner, tre JSON-berikinger, individuell dokumentprioritet
og typeavgrensningene for beløp og hendelser. 16 kombinerte dokumenttilfeller
bevarer uavhengige regler for punkt 18 og 19. 214 manuelle kontroller,
144 dokumentflyter og 52 sammenligninger bevarer øvrige felt og dekningsstatuser.
Støttevilkår alene oppretter ingen forsikring; generiske etiketter gir ingen
nye koblinger eller kundevalg. Kvalitetskontroll av 10 kode-/testfiler:
0 feil og 0 warnings. Dokumenterte testtilpasninger gjelder bare de to
kildeverifiserte rå radene; historiske snapshots, originaler og fingeravtrykk
beholdes uendret. Første nye fokuserte testkjøring bestod alle 86 kontroller.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet
revalidering på inneholdende publisert main er en separat oppgave.
NITO venter; Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.

## Punkt 18: Skade ved terrorhandlinger – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til `c93c33db262ddbd6906222bc4f11776ccc5ba8c3`.
Punkt 12 og tidligere bolker er publisert der. Punkt 18 under
`d1230f13e6b445d7` er validert på denne basisen. Publiseringsrevisjonen er
committen som inneholder rettelsen, delreceipten og denne prosjektstatusen.
Publisert status gjelder etter kontroll på remote main. Commit/push er
uttrykkelig autorisert i [publiseringsfullmakten](../audit/checkpoints/house-terror-c93c33d/publication-authorization.md).
Testet basis og eksakt kandidatidentitet er adskilt fra publiseringscommitten.
Ingen installasjon eller deploy.

To rå rader under `hus.terror.begrensning` gir én effektiv begrensende
vilkårsrad på hvert husnivå. Hele punkt 18 beholdes samlet: Gjensidiges
samlede erstatningsansvar overfor alle kunder og andre kravstillere er
begrenset til 1 milliard kroner per skadehendelse; skader innen 48 timer regnes
som samme hendelse, med forholdsmessig reduksjon dersom grensen overstiges.
Hele objektlisten, direkte/indirekte årsakssammenheng, bygninger med mer enn
25 etasjer, objekter/interesser utenfor Norden, typeavgrensningene for reise,
person og de navngitte personskadereglene, samt terrordefinisjonen er bevart.
Dette felles taket er ikke registrert som individuell husforsikringssum.
Ingen ubetinget terrordekning eller generelt terroravslag utledes.

Standard har egen kilde på PDF-side 13, Pluss egen kilde på side 14 med
`replacesBase` og overstyrt Standard-provenance. Raden er et ikke-assertivt
begrensningsvilkår: ingen automatisk dekning, kundevalg, status eller
beregning av hendelser, samlet ansvar eller fordeling. Ingen engine, globale
aliaser, extractor-enum, presentasjon eller kilderegister er endret.
Alle øvrige produksjonsbytes er identiske med testet main-basis.

[Delreceipt for punkt 18](../audit/checkpoints/house-terror-c93c33d/completion-receipt-d1230f13e6b445d7-point18.json),
[validering](../audit/checkpoints/house-terror-c93c33d/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-terror-c93c33d/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-terror-c93c33d/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-c93c33d/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-terror-contract-c93c33d/receipt-house-terror-contract.json)
beholdes byte-identisk. GAP-2110/SF-3024 og GAP-2169/SF-3111 er validert
**bare for punkt 18** i denne bolken. Publisert punkt 12 gjenåpnes ikke.
Øvrige dimensjoner i de bredere originalbindingene og signaturen er ikke
ferdig vurdert eller lukket. P2/DEFER_POST_PILOT beholdes, uten global
signatur-, P2- eller kampanjekreditt.

3022/3022 målrettede tester i 47 filer og 6714/6714 tester i 176 filer består
uten feil eller skip. 70 nye kontraktkontroller dekker komplette kildesider,
alle 12 valgkombinasjoner, tre JSON-berikinger, individuell dokumentprioritet
og vern mot feil ansvarstak, hendelsesregel, unntak og definisjon. 214 manuelle
kontroller, 144 dokumentflyter og 52 sammenligninger bevarer øvrige felt og
dekningsstatuser. Støttevilkår alene oppretter ingen forsikring; generiske
etiketter gir ingen nye koblinger eller kundevalg. Kvalitetskontroll av
10 kode-/testfiler: 0 feil og 0 warnings. Dokumenterte testtilpasninger gjelder
kun to kildeverifiserte rå rader og én gammel punkt 12-etikett i ny test.
Historiske snapshots, originaler og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet
revalidering på inneholdende publisert main er en separat oppgave.
NITO venter; Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.

## Punkt 12: Opphør ved eierskifte – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`979f01ca8cac052372cd610c537d9258269cc081`. Objektunntak og tidligere bolker er publisert der.
Punkt 12 under `d1230f13e6b445d7` er validert på denne basisen.
Publiseringsrevisjonen er committen som inneholder rettelsen, delreceipten og
denne prosjektstatusen. Publisert status gjelder etter kontroll på remote main.
Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-owner-change-979f01c/publication-authorization.md).
Ingen installasjon eller deploy. Testet basis og eksakt kandidatidentitet er adskilt.

To rå rader under `hus.avtale.eierskifte` gir én effektiv avtalevilkårsrad på
hvert husnivå. Hele punkt 12 beholdes samlet med vilkårets FAL § 7-2-henvisning:
Ved eierskifte faller forsikringen bort; Gjensidige svarer likevel for
forsikringstilfeller som inntrer innen fjorten dager etter eierskiftet;
forsikringen bortfaller uansett når ny eier har tegnet forsikring. Det er ikke
utledet en ubetinget 14-dagers videreføring av avtalen. Standard har egen kilde
på PDF-side 12, Pluss egen kilde på side 13 med `replacesBase` og overstyrt
Standard-provenance. Raden er beskrivende avtalevilkår: ingen datoberegning,
eiersjekk, automatisk oppsigelse eller endring av dekningsstatus/kundevalg.
Ingen engine, globale aliaser, extractor-enum, presentasjon eller kilderegister
er endret. Alle øvrige produksjonsbytes er identiske med testet main-basis.

[Delreceipt for punkt 12](../audit/checkpoints/house-owner-change-979f01c/completion-receipt-d1230f13e6b445d7-point12.json),
[validering](../audit/checkpoints/house-owner-change-979f01c/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-owner-change-979f01c/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-owner-change-979f01c/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-979f01c/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-owner-change-contract-979f01c/receipt-house-owner-change-contract.json)
beholdes byte-identisk. GAP-2110/SF-3024 og GAP-2169/SF-3111 er validert
**bare for punkt 12**. Øvrige dimensjoner i de bredere originalbindingene og
signaturen er ikke ferdig vurdert eller lukket. Originalregisterets
P2/DEFER_POST_PILOT beholdes; lokal delimplementering gir ingen global
signatur-, P2- eller kampanjekreditt.

2952/2952 målrettede tester i 46 filer og 6644/6644 tester i 175 filer består uten
feil eller skip. 66 nye kontroller dekker komplette kildesider, alle
12 valgkombinasjoner, tre JSON-berikinger, individuell dokumentprioritet og
vern mot å miste tidlig opphør eller endre 14-dagersleddet. 214 manuelle
kontroller, 144 dokumentflyter og 52 sammenligninger bevarer øvrige felt og
dekningsstatuser. Støttevilkår alene oppretter ingen forsikring; generiske
etiketter gir ingen nye aliaser/kundevalg. Kvalitetskontroll av 10 kode-/testfiler:
0 feil og 0 warnings. Dokumenterte testtilpasninger gjelder kun de to
kildeverifiserte rå radene og en ny testfixtures indeksfeil; historiske
snapshots, originaler og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende publisert main er en separat oppgave. NITO venter; Sentralbord
venter separat. Ingen ny arbeidsstrøm er startet.

## Objektunntak for hobbyveksthus og mineralolje – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`115ca6aba5d547e5059294bcce6dad6d0a19d59a`. Tilleggsutgifter og tidligere bolker er publisert der.
Objektunntaksbolken for `a6beec054bdae0df` er validert på denne basisen.
Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og denne
prosjektstatusen. Publisert status gjelder etter kontroll på remote main.
Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-object-exclusions-115ca6a/publication-authorization.md).
Ingen installasjon eller deploy. Testet basis og eksakt kandidatidentitet er adskilt.

Fire rå rader gir to effektive detaljer på hvert husnivå:
`hus.bygninger.hobbyveksthus.unntak` og `hus.bygninger.mineralolje.unntak`.
Hobbyveksthus er ikke forsikret. Tank og fyrkjel for mineralolje er ikke forsikret.
Begge er objektunntak under «Hva er forsikret? / Dekkes ikke», med egne
Standard-/Pluss-kilder på PDF-side 3. Pluss har `replacesBase` og beholder
overstyrt Standard-provenance. Det er ikke utledet generelle unntak for alle
veksthus, glassrom, tanker, varmeanlegg, rør eller andre energikilder.
Eksisterende bygningsdekning, fast inventar og krav om registrering av større
sidebygg er bevart. Begge nøklene er unntaksdetaljer som ikke oppretter dekning,
slår av bygningsdekningen eller oppretter kundevalg. En konkret dokumentregel
kan overstyre ett unntak uten å skjule det andre. Ingen engine, globale aliaser,
extractor-enum, presentasjon eller kilderegister er endret. Alle øvrige
produksjonsbytes er identiske med testet main-basis.

[Receipt](../audit/checkpoints/house-object-exclusions-115ca6a/completion-receipt-a6beec054bdae0df.json),
[validering](../audit/checkpoints/house-object-exclusions-115ca6a/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-object-exclusions-115ca6a/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-object-exclusions-115ca6a/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-115ca6a/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-object-exclusions-contract-115ca6a/receipt-house-object-exclusions-contract.json)
beholdes byte-identisk. GAP-2084/SF-2987 og GAP-2138/SF-3071 er validert for
begge objektunntakene. Originalregisterets P2/DEFER_POST_PILOT beholdes;
den uttrykkelig autoriserte lokale implementeringen føres separat uten global
telle- eller prioriteringsendring.

2886/2886 målrettede tester i 45 filer og 6578/6578 tester i 174 filer består uten
feil eller skip. 85 nye kontraktkontroller dekker komplette kildesider, alle
12 valgkombinasjoner, tre JSON-berikinger og individuell dokumentprioritet.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger bevarer
øvrige felt og dekningsstatuser. Støttevilkår alene oppretter ingen forsikring,
og generiske etiketter gir ingen ny mapping eller kundevalg. Kvalitetskontroll
av 10 kode-/testfiler: 0 feil og 0 warnings. Eldre testforventninger er tilpasset
kun den kildeverifiserte fire-radersendringen; historiske snapshots, originaler
og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende publisert main er en separat oppgave. NITO venter; Sentralbord
venter separat. Ingen ny arbeidsstrøm er startet.

## Tilleggsutgifter etter skade – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`de087fccb92706dbf8d2bf6a697aa6cf6a27081a`. Hage/importverdsetting og tidligere bolker er publisert der.
Tilleggsutgiftsbolken for `e103e7cb532fb8d4` er validert på denne basisen.
Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og denne
prosjektstatusen. Publisert status gjelder etter kontroll på remote main.
Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-additional-costs-de087fc/publication-authorization.md).
Ingen installasjon eller deploy. Testet basis og eksakt kandidatidentitet er adskilt.

Seks rå rader gir tre effektive regler på hvert husnivå:
`hus.rydding.dekning`, `hus.gjenoppforing.prisstigning` og `hus.vann.vannavgift`.
Etter erstatningsmessig skade dekkes tilleggene utover forsikringssummen.
Rydderegelen bevarer riving, rydding, bortkjøring og deponering av verdiløse
bygningsrester. Prisstigning følger gjennomsnittlig endring etter
byggekostnadsindeksen innen normal reparasjons-/gjenoppføringstid. Vannavgiften
må være økt som følge av skaden. Standard har egen kilde på side 5 og
prisstigningsavgrensning på side 18. Pluss bruker egen liste på side 6,
overskriften på side 5 og prisstigningsavgrensningen på side 19, med
`replacesBase` og overstyrt Standard-provenance. Påbud, brukstap og oppgjørsform
beholdes; brukstapets grense på 10 millioner overføres ikke til de tre tilleggene.
Ingen engine, alias, extractor-enum, presentasjon eller kilderegister er endret.
Alle øvrige produksjonsbytes er identiske med main-basis.

[Receipt](../audit/checkpoints/house-additional-costs-de087fc/completion-receipt-e103e7cb532fb8d4.json),
[validering](../audit/checkpoints/house-additional-costs-de087fc/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-additional-costs-de087fc/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-additional-costs-de087fc/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-de087fc/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-additional-costs-contract-de087fc/receipt-house-additional-costs-contract.json)
beholdes byte-identisk. GAP-2099/SF-3008 og GAP-2158/SF-3095 er validert for alle
tre dimensjoner. Originalregisterets P2/DEFER_POST_PILOT beholdes; den eksplisitt
autoriserte lokale implementeringen føres separat uten global telleendring.

2801/2801 målrettede tester i 44 filer og 6493/6493 tester i 173 filer består uten
feil eller skip. 105 nye kontraktkontroller dekker komplette kildesider, alle
12 valgkombinasjoner, tre JSON-berikinger og individuell dokumentprioritet.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger bevarer
øvrige felt. Ryddeytelsen bruker eksisterende dekningsrolle; de to øvrige er
vilkårsdetaljer. Katalog alene uten bekreftet produktvalg oppretter ikke valgt
dekning; støttevilkår alene oppretter ingen forsikring. Sammen med en identifisert
individuell avtale endrer støttevilkår ikke kundevalgene. Kvalitetskontroll av
14 kode-/testfiler: 0 feil og 0 warnings. Testtilpasninger er dokumentert med
før-bevis; historiske snapshots og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende publisert main er en separat oppgave. NITO venter; Sentralbord
venter separat. Ingen ny arbeidsstrøm er startet.

## Hagebeplantning og importverdsetting – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`83c8fee68cc5accb76ded645b689976fff16d533`. Oppgjørsform/arbeidsbetaling og tidligere
kildehenvisningsrettelser er publisert der. Verdsettingsbolken er validert på samme
basis. Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og
denne prosjektstatusen. Publisert status gjelder etter kontroll på remote main.
Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-garden-import-83c8fee/publication-authorization.md).
Testet basis og eksakt kandidatidentitet holdes adskilt. Ingen installasjon eller deploy.

Fire rå rader er lagt til: `hus.hage.oppgjor` og
`hus.gjenoppforing.import.begrensning`, hver med Standard-kilde på PDF-side 16
og egen Pluss-kilde på side 17 med `replacesBase`. Hvert nivå har én effektiv rad
per regel, og Pluss beholder overstyrt Standard-provenance. Skadet beplantning i
hageanlegg verdsettes til tilsvarende ung vekst i gartneri. Importbegrensningen
gjelder bare når gjenstand av samme merke/modell eller kvalitet ikke kan kjøpes
av forhandler i Norge; da begrenses erstatningen til kjøpesum inkludert frakt og
kostnader ved innførsel til Norge. Ingen generell importgrense, tollregel eller
fullvoksen planteerstatning er utledet. Hageomfang/fareunntak og den eksisterende
oppgjørs-/arbeidsbetalingsregelen er bevart. Ingen engine, globale aliaser,
extractor-enum, presentasjon eller kilderegister er endret. Alle øvrige
produksjonsbytes er identiske med testet main-basis.

[Receipt](../audit/checkpoints/house-garden-import-83c8fee/completion-receipt-d68e94be42f1549b.json),
[validering](../audit/checkpoints/house-garden-import-83c8fee/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-garden-import-83c8fee/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-garden-import-83c8fee/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-83c8fee/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-garden-import-contract-83c8fee/receipt-house-garden-import-contract.json)
beholdes byte-identisk som før-bevis. Begge originalbindinger,
GAP-2114/SF-3032 og GAP-2173/SF-3119, er validert for begge dimensjonene.
Originalregisteret beholder P2/DEFER_POST_PILOT for `d68e94be42f1549b`; den
uttrykkelig autoriserte implementeringen føres separat uten global
prioriterings- eller telleendring.

2696/2696 målrettede tester i 43 filer og 6388/6388 tester i 172 filer består uten
skip. 81 nye kontraktkontroller dekker begge kilder, alle 12 valgkombinasjoner,
tre JSON-berikinger og selvstendig dokumentprioritet for hver verdsettingsregel.
Støttevilkår, negative generiske etiketter, produktgrenser og at hver regel alene
ikke oppretter dekning er kontrollert. 214 manuelle kontroller, 144 dokumentflyter
og 52 sammenligninger i begge retninger bevarer øvrige felt. Trygs eksisterende
hagenøkkel er uendret. Kvalitetskontroll av 10 kode-/testfiler: 0 feil og 0 warnings.
Eldre testforventninger er tilpasset kun den kildeverifiserte fire-radersendringen;
historiske snapshots, originaler og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret, inkludert
HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende fersk main gjenstår som separat oppgave. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.

## Oppgjørsform og arbeidsbetaling – validert 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`6d42440b60cff961a9786bdde083506b96523661`. De tidligere kildehenvisningsrettelsene
er publisert der. Oppgjørsbolken er validert på samme basis. Publiseringsrevisjonen
er committen som inneholder rettelsen, receipt og denne prosjektstatusen. Publisert
status gjelder etter kontroll på remote main. Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-settlement-form-6d42440/publication-authorization.md).
Testet basis og kandidatidentitet holdes adskilt. Ingen installasjon eller deploy.

Bare `hus.gjenoppforing.oppgjorsmate` er lagt til: én Standard-rad med egen
fullvilkårskilde på PDF-side 16 og én Pluss-rad med egen kilde på side 17 og
`replacesBase`. Hvert nivå får én effektiv rad; Pluss beholder overstyrt
Standard-provenance i bevisgrunnlaget. Gjensidiges valg av oppgjør og leverandør,
kontanttaket, fakturakravet, 75 % av timesats ekskl. mva. etter selskapets
kalkyle og 300 kroner for øvrige arbeider er bevart. Dette er en oppgjørsregel;
ingen dekning, kundevalg, egenandel, aldersfradrag eller totalskadeterskel utledes.
Ingen engine, alias, extractor-enum eller kilderegister er endret. Alle øvrige
produksjonsbytes er identiske med testet main-basis.

[Receipt](../audit/checkpoints/house-settlement-form-6d42440/completion-receipt-8db65d4d3da9e98b.json),
[validering](../audit/checkpoints/house-settlement-form-6d42440/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-settlement-form-6d42440/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-settlement-form-6d42440/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-6d42440/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-settlement-contract-6d42440/receipt-house-settlement-contract.json)
beholdes byte-identisk som før-bevis. Begge originalbindinger,
GAP-2113/SF-3031 og GAP-2172/SF-3118, er validert i kandidaten. Originalregisteret
beholder P2/DEFER_POST_PILOT for `8db65d4d3da9e98b`; den eksplisitt autoriserte
implementeringen føres separat, uten global prioriterings- eller telleendring.

2615/2615 målrettede tester i 42 filer og 6307/6307 tester i 171 filer består uten
skip. 57 nye kontraktkontroller dekker begge originalkilder, alle 12
valgkombinasjoner, manuell registrering, tre JSON-berikinger, dokumentprioritet,
støttevilkår, generiske negative etiketter og provider/type/scope-isolasjon.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger i begge retninger
bevarer øvrig atferd. Kvalitetskontroll av 12 kode-/testfiler: 0 feil og 0 warnings.
Eldre fulle katalogforventninger er tilpasset med den kildeverifiserte toraders-
endringen; historiske snapshots, originaler og fingeravtrykk er uendret.
Diagnostikk og de mekaniske tilpasningene er dokumentert i auditpakken.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret, inkludert
HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende fersk main gjenstår som separat oppgave. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.

## Ordinært egenandelsfritak ved sikring – validert kildehenvisning 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`d4bcc45e27ba41fe62c2f681c7de5e0dab51bb9b`. Gjenoppføringsrettelsen, receipt og
prosjektstatus er publisert på denne revisjonen. Egenandelsfritaksbolken er validert
på samme basis. Publiseringsrevisjonen er committen som inneholder rettelsen,
receipt og denne prosjektstatusen. Publisert status gjelder etter kontroll på
remote main. Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-safeguard-source-d4bcc45/publication-authorization.md).
Ingen installasjon eller deploy.

Bare `hus.sikkerhet.egenandelsfritak` sin primære henvisning er rettet fra
Standard PDF-side 18 til 17. Hus Pluss arver den samme Standard-raden og kildeeieren.
Pluss-originalens egen side 18 bekrefter de tre ordinære fritakspunktene og
omnummereres ikke. Produksjonsdiffen er nøyaktig ett tegn. Ordlyd, verdi, nøkkel,
øvrig provenance, arv, dekning, kundevalg, mapping og dokumentprioritet er uendret.
Smart-reglene og andre henvisninger til Standard side 18 er uendret; objektradene
beholdes på side 3 og gjenoppføringsradene på side 16.

[Receipt](../audit/checkpoints/house-safeguard-source-d4bcc45/receipt-house-safeguard-source.json),
[validering](../audit/checkpoints/house-safeguard-source-d4bcc45/validation-summary.json),
[checkpoint](../audit/checkpoints/house-safeguard-source-d4bcc45/checkpoint.json) og
[kilde-/reverse-audit](../audit/checkpoints/house-safeguard-source-d4bcc45/source-and-reverse-audit.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-d4bcc45/receipt-house-foundation.json)
beholdes byte-identisk som før-bevis i samme publiseringsbolk. Dens presise
restmangel er rettet i den validerte kandidaten. Historiske receipts, originalkilder og testbaseliner er bevart.

2558/2558 målrettede tester i 41 filer og 6250/6250 tester i 170 filer består uten
skip. 25 kildekontraktkontroller, hvorav tre nye; ingen nye testfiler.
Kvalitetskontroll av de fem berørte kode-/testfilene: 0 feil og 0 warnings.
Alle 12 tilleggskombinasjoner og hele før-snapshottens 20 syntetiske dokumentrolleprober
bevarer alle felt bortsett fra det godkjente sidetallet. Regresjonssettet med 214
manuelle input, 144 dokumentkontroller og 52 sammenligninger i begge retninger består.
Eksakte originalavsnitt før den separate Smart-delen og negative kilde-/sidekontroller
er med. Første testkjøring fant én eldre FROST-forventning om side 18; den strenge
sammenligningen er tilpasset med samme avgrensede kildeprojeksjon. Diagnostikken
beholdes; faktiske nåverdier må være side 17. Ingen historiske snapshots er omskrevet.

Den navngitte sidetallsfeilen er rettet når inneholdende commit er bekreftet på
remote main. Samlet katalogfundament er ikke frigitt. Ingen videre kilde-/P2-opprydding eller ny forsikringsbetydning er
godkjent. B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0, P2-kreditt 0,
globalt resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.
Samlet revalidering av katalogfundamentet på inneholdende fersk main gjenstår
som separat oppgave; ingen ny implementering er startet.

Alle HOLD beholdes eksakt, inkludert HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og uavklart P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.


## Gjenoppføring – tre validerte kildehenvisninger 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`39b63c1b9c50e77ba1777072f348854735840678`. De to forutgående objekthenvisningene,
receipt og prosjektstatus er publisert på denne revisjonen. Gjenoppføringsbolken
er validert på samme basis. Publiseringsrevisjonen er committen som inneholder
rettelsene, receipt og denne prosjektstatusen. Publisert status gjelder etter
kontroll på remote main. Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-rebuilding-sources-39b63c1/publication-authorization.md).
Ingen installasjon eller deploy.

Bare primærsidene for `hus.gjenoppforing.hovedregel`,
`hus.gjenoppforing.totalskade` og `hus.gjenoppforing.svanemerket` er rettet fra
Standard PDF-side 17 til 16. Hus Pluss arver de samme Standard-radene og kildeeieren;
Pluss-originalens egen side 17 er bekreftende kilde og omnummereres ikke.
Produksjonsdiffen er nøyaktig tre tegn. Ordlyd, verdi, nøkkel, øvrig provenance,
arv, dekning, kundevalg, mapping og dokumentprioritet er uendret.
De tre objektradene beholdes på side 3. `gjenoppforing.annetsted` sin kvalifiserende
side 17 og underforsikringskildene er uendret; ingen generell side-17-omnummerering.

[Receipt](../audit/checkpoints/house-rebuilding-sources-39b63c1/receipt-house-rebuilding-sources.json),
[validering](../audit/checkpoints/house-rebuilding-sources-39b63c1/validation-summary.json),
[checkpoint](../audit/checkpoints/house-rebuilding-sources-39b63c1/checkpoint.json) og
[kilde-/reverse-audit](../audit/checkpoints/house-rebuilding-sources-39b63c1/source-and-reverse-audit.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-39b63c1/receipt-house-foundation.json)
beholdes byte-identisk som før-bevis i samme publiseringsbolk. Dens avgrensede
restmangel er rettet i den validerte kandidaten. Historiske receipts, originalkilder og testbaseliner er bevart.

2555/2555 målrettede tester i 41 filer og 6247/6247 tester i 170 filer består uten
skip. 22 kildekontraktkontroller, hvorav tre nye; ingen nye testfiler.
Kvalitetskontroll av de fire berørte kode-/testfilene: 0 feil og 0 warnings.
Alle 12 tilleggskombinasjoner og hele før-snapshottens 20 syntetiske dokumentrolleprober
bevarer alle felt bortsett fra godkjente sidetall. Regresjonssettet med 214 manuelle
input, 144 dokumentkontroller og 52 sammenligninger i begge retninger består.
Eksakte originalavsnitt og negative kilde-/sidekontroller er med. Uforanderlige
historiske snapshots sammenlignes via en navngitt, avgrenset kildeprojeksjon;
faktiske nåverdier må vise Standard side 16.

De tre navngitte sidetallsfeilene er rettet når inneholdende commit er bekreftet
på remote main. Samlet
katalogfundament er ikke frigitt. Ingen videre kilde-/P2-opprydding eller ny
forsikringsbetydning er godkjent. B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0,
P2-kreditt 0, globalt resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
beholdes. Samlet revalidering av katalogfundamentet på inneholdende fersk main
gjenstår som separat oppgave; ingen ny implementering er startet.

Alle HOLD beholdes eksakt, inkludert HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og uavklart P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.


## Fast inventar og solcelleanlegg – validerte kildehenvisninger 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`a563c50324f62cbdcd57c162fd0d02632def982b`. Den forutgående rettelsen av
`hus.bygninger.dekning`, receipt og prosjektstatus er publisert på denne revisjonen.
Bolken er validert på samme basis. Publiseringsrevisjonen er committen som
inneholder rettelsene, receipt og denne prosjektstatusen. Publisert status gjelder
etter kontroll på remote main. Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-object-sources-a563c50/publication-authorization.md).
Ingen installasjon eller deploy.

Bare `hus.bygninger.tilbehor` og `hus.teknisk.solceller` sin primære henvisning er
rettet fra Standard PDF-side 2 til 3. Hus Pluss arver begge felles rader og samme
kildeeier. Produksjonsdiffen er nøyaktig to tegn. Ordlyd, verdi, nøkkel, øvrig
kildemetadata, arv, dekning, kundevalg, mapping og dokumentprioritet er uendret.
Den tidligere rettede `hus.bygninger.dekning` beholdes på side 3.

[Receipt](../audit/checkpoints/house-object-sources-a563c50/receipt-house-object-sources.json),
[validering](../audit/checkpoints/house-object-sources-a563c50/validation-summary.json),
[checkpoint](../audit/checkpoints/house-object-sources-a563c50/checkpoint.json) og
[kilde-/reverse-audit](../audit/checkpoints/house-object-sources-a563c50/source-and-reverse-audit.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-a563c50/receipt-house-foundation.json)
beholdes byte-identisk som før-bevis i samme publiseringsbolk. Dens avgrensede
restmangel er rettet i den validerte kandidaten. Ingen historisk receipt, originalkilde eller testbaseline er skrevet om.

2552/2552 målrettede tester i 41 filer og 6244/6244 tester i 170 filer består uten
skip. De 19 eksisterende kildekontraktkontrollene er utvidet; ingen nye testfiler.
Kvalitetskontroll av de tre berørte kode-/testfilene: 0 feil og 0 warnings.
Alle 12 tilleggskombinasjoner og hele den forutgående runtime-snapshottens 20
syntetiske dokumentrolleprober er sammenlignet med før-grunnlaget; bare godkjente
sidetall avviker. Tidligere 214 manuelle input, 144 dokumentkontroller og 52
sammenligninger i begge retninger består. Historisk testhjelper projiserer bare
navngitte, kildebekreftede sidetallsbytter; faktiske nåverdier må være side 3.

Dette lukker bare de to navngitte sidetallsfeilene når inneholdende commit er
bekreftet på remote main. Samlet
katalogfundament er ikke frigitt. Ingen bredere kilde-/P2-opprydding eller
forsikringsbetydning er godkjent. B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0,
P2-kreditt 0, globalt resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
beholdes. Samlet revalidering av katalogfundamentet på inneholdende fersk main
gjenstår som separat oppgave; ingen ny implementering er startet.

Alle HOLD beholdes eksakt, inkludert HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og uavklart P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.


## Forsikrede bygninger – validert kildehenvisningsrettelse 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`1b5b5aaa7d2e56845146be0a935ddc0e5a697f4f`. Personkretsrettelsen og de tre
forutgående B-130-bolkene er faktisk publisert på denne revisjonen; 67 dokumenterte
kampanjesignaturer er på main. Sidetallsrettelsen er validert på samme basis.
Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og denne
prosjektstatusen; publisert status gjelder etter kontroll på remote main.
Commit/push er eksplisitt autorisert i
[publiseringsfullmakten](../audit/checkpoints/house-buildings-source-1b5b5aa/publication-authorization.md).
Ingen installasjon eller deploy.

Bare `hus.bygninger.dekning` sin primære kildehenvisning er rettet fra Standard
PDF-side 2 til 3. Hus Pluss arver samme felles rad og kildeidentitet. Produksjonsdiffen
er ett tegn i én katalograd; øvrig ordlyd, verdi, nøkkel, kildeeier, avsnitt, versjon,
arv, dekning, mapping, kundevalg og dokumentprioritet er uendret. Ingen bredere
sidetallsopprydding er gjort. Begge original-PDF-er og historiske receipts er bevart.

[Receipt](../audit/checkpoints/house-buildings-source-1b5b5aa/receipt-house-buildings-source.json),
[validering](../audit/checkpoints/house-buildings-source-1b5b5aa/validation-summary.json),
[checkpoint](../audit/checkpoints/house-buildings-source-1b5b5aa/checkpoint.json) og
[kilde-/reverse-audit](../audit/checkpoints/house-buildings-source-1b5b5aa/source-and-reverse-audit.json).
Den [forutgående lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-1b5b5aa/receipt-house-foundation.json)
beholdes byte-identisk som før-bevis i samme publiseringsbolk. Den navngitte
restmangelen er rettet i den validerte kandidaten. Historiske testbaseliner beholdes; beviste tilpasninger av testhjelpere
projiserer bare det godkjente sidetallsbyttet. Egne tester krever faktisk side 3 og
komplett likhet med uavhengig før-katalog bortsett fra denne ene endringen.

2552/2552 målrettede tester i 41 filer og 6244/6244 tester i 170 filer består uten
skip; 19 nye kilde-/kontraktkontroller. Kvalitetskontroll av de åtte berørte kode-/
testfilene: 0 feil og 0 warnings. Alle 12 tilleggskombinasjoner, 214 manuelle input,
144 syntetiske dokumentkontroller, gjentatt JSON-beriking, materialisering, visning
og 52 katalogsammenligninger i begge retninger er kontrollert mot før-grunnlaget.
Ingen ny type-/API-/engine- eller visningsendring; build/server/deploy er ikke kjørt.

Dette lukker bare den presise sidetallsrestmangelen når inneholdende commit er
bekreftet på remote main. Samlet
katalogfundament er ikke frigitt; resterende kilde-/P2-inventar og alle HOLD er
uendret. B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0, P2-kreditt 0, globalt
resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.
Samlet revalidering av katalogfundamentet på inneholdende fersk main gjenstår
som separat oppgave; ingen ny implementering er startet.

HTU `157c7afed18eb0fe` / SC-019/SR-033, `8a89196fecd29ddb`, SC-020/SR-032,
SC-035/SR-031, B-071-holdet og alle øvrige beskyttede HOLD beholdes eksakt.
Sikkerhet/GDPR og uavklart P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.


## Personkrets og sikrede – validert B-130-bolk 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`cfada9a3c73de450f53b784ec2b60b41c434a10a`. Underforsikringsrettelsen, receipt
og prosjektstatus er publisert på denne revisjonen. Personkretsbolken er implementert
og validert på samme basis. Publiseringsrevisjonen er committen som inneholder
rettelsen, receipt og denne prosjektstatusen. Publisert status gjelder etter
bekreftelse på remote main. Commit/push er eksplisitt autorisert.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b130-person-scope-cfada9a/publication-authorization.md).
Ingen installasjon eller deploy.

B-130 / CR-228 / `d58bff0e6b2d46eb` er avgrenset implementert for begge originalbindinger:
Hus Standard GAP-2081/SF-2982 og Hus Pluss GAP-2135/SF-3066, ordinary /
Alminnelige vilkår. `hus.personkrets.begrensning` bevarer alle seks grupper:
forsikringstaker; ektefelle/samboer med felles folkeregistrert adresse; barn hjemme
eller borte pga. utdanning/førstegangstjeneste uten meldt adresseendring;
privatperson som er medeier med tinglyst eiendomsrett; andre med tinglyst
eiendomsrett, panterett eller annen tinglyst sikkerhetsrett; og barn i fast husstand
med annen folkeregistrert adresse pga. delt foreldreansvar. Hver gruppes vilkår
beholdes særskilt. Ingen generell «hele husstanden», aldersgrense eller universell
fellesadresse innføres. Begge nivåer har egen original-PDF-side 3. Pluss erstatter
bare samme nøkkel; komplett baseevidens beholdes.

Regelen vises som betinget vilkårsdetalj og fastslår ikke hvem som faktisk er sikret.
Ingen person-/kundeobjekter, medlemskap, alder, adresse, tinglyste rettigheter,
tilleggsvalg eller erstatningsrett utledes. Helsehjelp, ansvar og Rettshjelp beholder
sine egne avgrensninger. Sikkerhetsforskriftenes ektefellekontekst, bygningsopptak,
fullverdi/underforsikring, fraflytting og øvrige regler er uendret. Kundens konkrete
dokumentregel med komplette kilder har forrang også sent, ved gjentatt beriking
og JSON. Generelle vilkår forblir evidens/katalog. Smart/Utleie/råte, B-020, priser,
summer og generell egenandel beholdes. Ingen schema-, alias-, global normalizer-,
engine- eller presentasjonsendring.

[Receipt](../audit/checkpoints/b130-person-scope-cfada9a/completion-receipt-d58bff0e6b2d46eb.json),
[validering](../audit/checkpoints/b130-person-scope-cfada9a/validation-summary.json),
[checkpoint](../audit/checkpoints/b130-person-scope-cfada9a/checkpoint.json) og
[bevispakke](../audit/checkpoints/b130-person-scope-cfada9a/README.md).
79 nye kontrakttester; 2533/2533 målrettede og 6225/6225 tester i 169 filer består,
uten skip. Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime
22/22 PASS. ESLint 0 feil og de samme 27 warnings. Åtte sluttgater deler samme
kode-/testidentitet. 214 manuelle input, 144 dokumentforløp og alle 12 gyldige
tilleggskombinasjoner bevarer tidligere felt; bare to nye rå katalogfakta er lagt
til. Kildeoriginaler, historiske bevis og forutgående avklaring er uendret.

Denne bolken fullfører bare denne ene originalsignaturen med begge bindinger.
Basis-main har **66** publiserte kampanjesignaturer; **67** inklusive denne signaturen
gjelder etter bekreftelse av den inneholdende committen på remote main. De fire navngitte B-130-reviewene er
dermed avklart/implementert, men dette gir ingen samlet katalog-/pilotklarering.
Samlet revalidering av ordinært Hus-katalogfundament gjenstår. B-051 37/0/1/1,
P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.

Alle HOLD beholdes, inkludert HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, fysisk insektegenandel SC-020/SR-032 og øvrige beskyttede holds.
Sikkerhet/GDPR/P3-A05 med uavklart identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept beholdes synlige. NITO og Sentralbord
venter. Ingen ny arbeidsstrøm er startet.


## Fullverdi og underforsikring – validert B-130-bolk 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`0e4c09d528e92da85e3afad6db50620f6db00983`. Frost/bygningsvern-bolken,
receipt og prosjektstatus er publisert på denne revisjonen. Underforsikringsbolken
er implementert og validert på samme basis. Publiseringsrevisjonen er committen
som inneholder rettelsen, receipt og denne prosjektstatusen. Publisert status gjelder
etter bekreftelse på remote main. Commit/push er eksplisitt autorisert.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b130-underinsurance-0e4c09d/publication-authorization.md).
Ingen installasjon eller deploy.

B-130 / CR-226 / `15f5b4a3e9f79fd2` er avgrenset implementert for begge originalbindinger:
Hus Standard GAP-2115/SF-3033 og Hus Pluss GAP-2174/SF-3120, ordinary /
Alminnelige vilkår. `hus.underforsikring.begrensning` bevarer plikten til å melde
tilbygg, påbygg og sidebygg innen førstkommende hovedforfall, reduksjonen ved
manglende melding og regelen ved større faktisk areal enn forsikringsbeviset.
Reduksjonsgrunnlaget er forholdet mellom avtalt og riktig **pris**, ikke arealbrøk.
Side-2-forbeholdet om økt gjenoppbyggingskostnad, neste hovedforfall og mulig
reduksjon er med. Standard har egen primærside 17, Pluss egen primærside 18;
begge beholder egen side 2 som supplerende kilde. Pluss erstatter bare samme nøkkel.

Regelen vises som betinget vilkårsdetalj. Ingen forsikringsform, faktisk areal,
oppfylt meldeplikt, bygningsopptak, kundevalg eller erstatningsberegning utledes.
Forsikringsform, fullverdigaranti og øvrige oppgjørs-/objektregler er uendret.
Kundens konkrete dokumentregel og komplette kilder beholder forrang, også sent,
ved gjentatt beriking og JSON. Generelle vilkår forblir evidens/katalog.
Smart/Utleie/råte, Rettshjelp, B-020, priser, summer og generell egenandel beholdes.
Ingen endring i schema, global normalizer/alias, engine eller presentasjon.

[Receipt](../audit/checkpoints/b130-underinsurance-0e4c09d/completion-receipt-15f5b4a3e9f79fd2.json),
[validering](../audit/checkpoints/b130-underinsurance-0e4c09d/validation-summary.json),
[checkpoint](../audit/checkpoints/b130-underinsurance-0e4c09d/checkpoint.json) og
[bevispakke](../audit/checkpoints/b130-underinsurance-0e4c09d/README.md).
65 nye kontrakttester; 2454/2454 målrettede og 6146/6146 tester i 168 filer består,
uten skip. Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime
22/22 PASS. ESLint 0 feil og eksakt de samme 27 warnings. Åtte sluttgater deler
samme kode-/testidentitet. Første runtimeforsøk ble stoppet av sandboxens lokale
portforbud; samme kandidat bestod med godkjent lokal tilgang. 214 manuelle input,
144 dokumentforløp og alle 12 gyldige tilleggskombinasjoner bevarer tidligere felt;
bare to nye rå katalogfakta er lagt til. Kildeoriginaler og tidligere bevis er uendret.

Denne bolken fullfører bare denne ene originalsignaturen med begge bindinger.
Basis-main har **65** publiserte kampanjesignaturer; **66** inklusive denne signaturen
gjelder etter bekreftelse av den inneholdende committen på remote main. B-051 37/0/1/1,
P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Ingen komplett pilotklarering.

Alle HOLD beholdes, inkludert HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, fysisk insektegenandel SC-020/SR-032 og øvrige beskyttede holds.
B-130 `d58bff0e6b2d46eb` (personkrets) står fortsatt åpen. Sikkerhet/GDPR/P3-A05 med
uavklart identitet/mergestatus, person/pilotscope, kritisk UX, feedback og operativ
rådgiveraksept beholdes synlige. NITO og Sentralbord venter. Ingen ny arbeidsstrøm.



## Frost og bygningsvern – validert B-130-bolk 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`8422e39214aadff2dd31292e84ee4ca9cf818b30`. Fraflyttingsrettelsen er publisert på
denne basisen. Frost/bygningsvern er validert på samme basis. Publiseringsrevisjonen
er committen som inneholder rettelsen, receipt og denne prosjektstatusen.
Publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b130-frost-8422e39/publication-authorization.md).
Ingen installasjon eller deploy.

B-130 / CR-229 / `ce90710821e28a97` er avgrenset implementert for Hus Standard
GAP-2121/SF-3048 og Hus Pluss GAP-2180/SF-3135, ordinary / Alminnelige vilkår.
`hus.sikkerhet.begrensning` bevarer alle ni generelle sikkerhetsplikter,
ektefelle-/samboerhenvisningen og mulig helt/delvis bortfall av erstatningsrett.
Begge nivåer har egen original-PDF, side 1; Pluss erstatter bare den arvede raden
med samme nøkkel og beholder komplett baseevidens.

Oppvarmingsplikten står selvstendig. Stoppekran og åpning av vannkran for å tømme
rørene gjelder bygning som ikke er fast bebodd og er ubebodd i mer enn tre døgn.
Regelen er en vilkårsdetalj; kundens bosituasjon, etterlevelse eller dekningsavslag
utledes ikke. Tolvmåneders fraflytting, Trygs énmånedsregel, hendelsesdekninger,
Utleies betalingsplikter, egenandelsfordeler og Smart/Utleie/råte-valg er uendret.
Kundens konkrete dokumentregel og komplette kilder beholder forrang, også ved
senere verdier, gjentatt beriking og JSON. General_terms forblir evidens/katalog.
Ingen endring i global normalizer, engine, schema, alias eller presentasjon.

[Receipt](../audit/checkpoints/b130-frost-8422e39/completion-receipt-ce90710821e28a97.json),
[validering](../audit/checkpoints/b130-frost-8422e39/validation-summary.json),
[checkpoint](../audit/checkpoints/b130-frost-8422e39/checkpoint.json) og
[bevispakke](../audit/checkpoints/b130-frost-8422e39/README.md).
63 nye kontrakttester; 2389/2389 målrettede og 6081/6081 tester i 167 filer består,
uten skip. Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime
22/22 PASS. ESLint 0 feil og de samme 27 warnings. Åtte sluttgater deler samme
kode-/testidentitet. 214 manuelle input og 144 dokumentforløp bevarer alle tidligere
felt; bare to nye rå katalogfakta er lagt til. Historiske bevis/kilder er uendret.

Denne bolken fullfører bare denne ene originalsignaturen med begge bindinger.
Basis-main har 64 publiserte kampanjesignaturer; 65 inklusive denne signaturen
gjelder etter bekreftelse av den inneholdende committen på remote main.
Dette gir ingen komplett katalog-/pilotklarering.
B-051 37/0/1/1, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.

Alle HOLD beholdes, inkl. HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, fysisk insektegenandel SC-020/SR-032 og øvrige beskyttede holds.
Øvrige B-130-reviews `15f5b4a3e9f79fd2` (fullverdi) og `d58bff0e6b2d46eb`
(personkrets) står åpne. Sikkerhet/GDPR/P3-A05 med uavklart identitet/mergestatus,
person/pilotscope, kritisk UX, feedback og operativ rådgiveraksept beholdes synlige.
NITO og Sentralbord venter. Ingen ny arbeidsstrøm. Commit/push er eksplisitt autorisert.


## Fraflyttet bolig – validert B-130-bolk 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`f5f88cc08f7cd863c9ce5d618319fa06fa9c1493`. Den publiserte katalogopprinnelsesrettelsen
finnes på denne revisjonen. Fraflyttingsregelen er validert på samme basis,
på `fix/house-vacancy`. Publiseringsrevisjonen er committen som inneholder rettelsen,
receipt og denne prosjektstatusen. Publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b130-vacancy-f5f88cc/publication-authorization.md).
Ingen installasjon eller deploy.

B-130 / CR-224 / `597df4c45c6d3db9` er avgrenset implementert for Hus Standard
GAP-2122/SF-3049 og Hus Pluss GAP-2181/SF-3136, ordinary / Alminnelige vilkår.
Begge original-PDF-er, side 2, definerer fraflyttet bolig som ikke bebodd de siste
12 måneder; da dekkes bare brann og naturskade dersom annet ikke er avtalt.
`hus.fraflyttet.begrensning` legges til som vilkårsdetalj med egen primærkilde for
hvert nivå. Pluss erstatter bare den arvede raden med samme nøkkel; baseevidens beholdes.

Regelen fastslår ikke at kundens bolig er fraflyttet og endrer ikke automatisk
kundens dekninger eller tilleggsvalg. Kundens særavtale beholder forrang gjennom
eksisterende eksakt produktbundet etikettmatching, også ved senere dokumentverdier,
gjentatt beriking og JSON. Generelle vilkår er fortsatt evidens/katalog. Ingen endring
i dekningsmotor, global normalizer, navnemapping, uttrekksskjema eller presentasjon.
Smart/Utleie/råte, Rettshjelp, priser og generell egenandel beholdes.

[Receipt](../audit/checkpoints/b130-vacancy-f5f88cc/completion-receipt-597df4c45c6d3db9.json),
[validering](../audit/checkpoints/b130-vacancy-f5f88cc/validation-summary.json),
[checkpoint](../audit/checkpoints/b130-vacancy-f5f88cc/checkpoint.json) og
[bevispakke](../audit/checkpoints/b130-vacancy-f5f88cc/README.md).
54 nye kontrakttester; 2326/2326 målrettede og 6018/6018 tester i 166 filer består,
uten skip. Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime
22/22 PASS. ESLint 0 feil og de samme 27 warnings. Åtte sluttgater har samme
kandidatidentitet. 214 tidligere manuelle input og 144 dokumentforløp bevarer
alle tidligere felt; nøyaktig to nye rå katalogfakta er uavhengig kildekontrollert.
Tidligere bevispakker og originalkilder er uendret.

Denne bolken fullfører bare den ene B-130-signaturen med begge bindinger.
Basis-main har 63 publiserte kampanjesignaturer; 64 inklusive denne nye signaturen
gjelder etter bekreftelse av den inneholdende committen på remote main. Dette gir
ingen komplett katalog-/pilotklarering. B-051 forblir 37/0/1/1; P2-kreditt 0, globalt resolved/open
UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.

Alle HOLD beholdes, inkl. HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, fysisk insektegenandel SC-020/SR-032 og øvrige beskyttede holds.
Øvrige B-130-reviews `15f5b4a3e9f79fd2`, `ce90710821e28a97` og
`d58bff0e6b2d46eb` forblir åpne. Sikkerhet/GDPR/P3-A05 med uavklart identitet/mergestatus,
person/pilotscope, kritisk UX, feedback og operativ rådgiveraksept beholdes synlige.
NITO og Sentralbord venter. Ingen ny arbeidsstrøm. Commit/push er eksplisitt autorisert.


## Katalogopprinnelse ved gjentatt beriking – validert 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`257a197aa016ba3c9567eeb4cebc8182d5e0aba5`. Dokumentbasert Utleie-valg, receipt og
prosjektstatus er publisert på denne revisjonen. Opprinnelsesrettingen er validert på samme basis.
Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og denne
prosjektstatusen. Publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b051-house-origin-257a197/publication-authorization.md).
Ingen installasjon eller deployhandling er utført.

Bare Gjensidige Hus Standard og Hus Pluss, bolig / ordinary / Alminnelige vilkår,
endrer produksjonsatferd. Én produksjonsfil skiller dokumentlaget fra katalog og
opplastede støttevilkår før dokumentnormalisering. Gjeldende kataloglag beregnes
fortsatt fra produkt og gyldige valg. Katalogopprinnelse, nøkler/verdier, komplette
kilder/noter, strukturdata, egenandelsklassifisering, availability og overriddenBase
beholdes gjennom gjentakelser og JSON. Tidligere presentasjonsnoter bevares bare
med uendret registrert faktum og komplett kildesett; endrede eller fjernede
kvalifikasjonsnoter og nye referanser oppdateres fra gjeldende katalog.

Senere kundeverdier får samme prioritet som opprinnelige kundeverdier. Gjeldende
ukjent-fallback videreføres som katalogopplysning. General_terms beholder
katalogopprinnelse og komplette kilder/evidens, uten å opprette kundevalg.
Smart/Utleie/råte, Rettshjelp, priser og generell egenandel beholdes. Global
normalizer, coverage engine, katalog, originalkilder, schema, alias/admission og
objektmatching er uendret. Ingen migrering eller heuristisk ommerking av eldre
lagrede dokumentrader utføres.

[Receipt](../audit/checkpoints/b051-house-origin-257a197/completion-receipt-house-catalog-origin.json),
[validering](../audit/checkpoints/b051-house-origin-257a197/validation-summary.json),
[checkpoint](../audit/checkpoints/b051-house-origin-257a197/checkpoint.json) og
[bevispakke](../audit/checkpoints/b051-house-origin-257a197/README.md).
69 nye tester; 1541/1541 målrettede kontroller og 5964/5964 tester i 165 filer, uten
skip. Typegen/TypeScript og webpack-bygg består; ESLint 0 feil og de samme 27
warnings. Lokal syntetisk HTTP/PDF-runtime 22/22. Alle åtte sluttgater er bundet
til samme kode-/testidentitet, adskilt fra basis-SHA og dokumentasjonen.

214 manuelle første resultater og 144 faktiske PDF-førsteresultater er uendret.
202 øvrige manuelle produkter har også identisk repeat-resultat. På målproduktene
kontrolleres den godkjente metadata-/rekkefølgedifferansen mot frosset før-baseline
med uendret komplett key/name/value/source/sources-multiset. 49 eldre assertions
som krevde feilmerket document-opprinnelse og metadatatap er oppdatert; samtlige
testsaker, kildeorakler og reelle dokument-/statuskontroller beholdes. Tidligere
bevispakke (51 filer), registrerte PDF-er og serialisert katalog er uendret.

Dette lukker bare den avgrensede opprinnelsesfeilen. Ingen ny original-
signaturkreditt eller pilotklarering. Alle HOLD beholdes, inkl. HTU
`157c7afed18eb0fe` / SC-019/SR-033, `8a89196fecd29ddb` og fysisk insektegenandel
SC-020/SR-032. B-051 37/0/1/1, kampanje 63, globalt resolved/open UKJENT, P2-kreditt 0
og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED. Sikkerhet/GDPR/P3-A05 med uavklart
identitet/mergestatus, person/pilotscope, kritisk UX, feedback og operativ
rådgiveraksept står fortsatt synlige på vent. NITO og Sentralbord venter;
ingen ny arbeidsstrøm. Publisering med commit og push er eksplisitt autorisert.

## Dokumentbasert Utleie-valg – validert 23. oktober 2026

Fersk remote main, lokal HEAD og origin/main er kontrollert til
`0f1086206e9aa713681d84ebe55766196e1a7609`. Den publiserte manuelle Utleie-rettelsen,
receipt og prosjektstatus finnes på denne revisjonen. Dokumentbasert Utleie-valg
er validert på samme basis. Publiseringsrevisjonen er committen som inneholder
rettelsen, receipt og denne prosjektstatusen. Publisert status gjelder etter
bekreftelse på remote main.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b051-rental-selection-0f10862/publication-authorization.md).
Ingen deployhandling eller installasjon er utført.

Gjensidige Hus Standard og Hus Pluss, bolig / ordinary / Alminnelige vilkår:
Utleie velges ved eksplisitt dokumentvalg eller strukturert avtalt tillegg uten
motsatt/ukjent parentstatus. Ikke valgt overstyrer oppført tillegg; valgt og avslag
gir konflikt/ukjent. Beskrivelse, detaljstatus, katalogtilgjengelighet og generelle
vilkår alene velger ikke. Bare valgt aktiverer komponenten og vises som valgt.
Tilleggsvalg bindes til originaldokumentets kilder før eventuell konsolidering;
objektmatching og opptak av dokumenter er uendret.

De fem eksisterende Utleie-nøklene, dokumentprioritet, komplette kilder/noter og
katalogopprinnelse for de fem supplerende katalogradene bevares gjennom gjentatt
beriking og JSON. Også ukjent kundedetalj blokkerer katalog-/supporting-fallback.
Generelle vilkår blir bevis, ikke kundevalg. Manuell Utleie/Smart/råte, Rettshjelp,
B-020, basis leietap, premier og generell egenandel beholdes. Et valgt tillegg er
ikke i seg selv bevis for registrering i forsikringsbeviset eller erstatningsrett.

[Receipt](../audit/checkpoints/b051-rental-selection-0f10862/completion-receipt-rental-document-selection.json),
[validering](../audit/checkpoints/b051-rental-selection-0f10862/validation-summary.json),
[checkpoint](../audit/checkpoints/b051-rental-selection-0f10862/checkpoint.json) og
[bevispakke](../audit/checkpoints/b051-rental-selection-0f10862/README.md).
129 nye dokumenttester; 722/722 målrettede og 5895/5895 tester i 164 filer, uten
skip. Typegen/TypeScript og webpack-bygg består. Lokal syntetisk HTTP/PDF-runtime
22/22; ESLint 0 feil / 27 eksakt uendrede warnings. Sluttgater og kandidatidentitet
er bundet sammen i receipt. 214 manuelle initial-/repeat-kontroller er eksakt
identiske med før-baseline. Alle 144 tidligere dokumentforløp kontrolleres mot
frosset baseline med bare de uttrykkelig godkjente forskjellene. Katalogen, begge
original-PDF-er og forrige bevispakke er uendret.

Dette lukker den avgrensede dokumentbaserte Utleie-feilen og gir ingen ny
originalsignatur-kreditt eller pilotklarering. HTU `157c7afed18eb0fe` / SC-019/SR-033,
`8a89196fecd29ddb`, fysisk insektegenandel SC-020/SR-032 og alle øvrige HOLD er
uendret. B-051 37/0/1/1, kampanje 63, globalt resolved/open UKJENT, P2-kreditt 0 og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED. Sikkerhet/GDPR/P3-A05 med uavklart
identitet/mergestatus, personforsikring/pilotscope, kritisk UX, feedback og operativ
rådgiveraksept står synlige på vent. NITO og Sentralbord venter; ingen ny
arbeidsstrøm er startet. Publisering med commit og push er eksplisitt autorisert.

## Manuelt Utleie-valg – validert 23. oktober 2026

Kontrollert basis på fersk main er `d53c2a1d60c907e71ad8f626a4a788d29f5ba203`.
Manuelt Utleie-valg er rettet og validert på denne basisen, bare for Gjensidige
Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår. Publiseringsrevisjonen
er committen som inneholder rettelsen, receipt og denne prosjektstatusen.
Publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b051-manual-rental-d53c2a1/publication-authorization.md).
**Ingen deployhandling.**

Et eksplisitt normalisert valg får strengt bevis bundet til Utleie-tillegget,
provider, produkt og versjon. ID, fem eksisterende vilkårsnøkler, verdier,
komplette kilder/noter og katalogopprinnelse beholdes gjennom gjentatt beriking
og JSON-lagring. Egenandelsklassifiseringen override beholdes; generell egenandel
og priser endres ikke. Valget dokumenterer manuell registrering, ikke at utleie
er angitt i forsikringsbeviset eller at erstatningsvilkårene er oppfylt.

I denne manuelle konteksten har eksplisitt dokumentavslag, konflikt og ukjent
valg forrang. Bare valgt viser tillegget som valgt; detaljvilkår og generelle
vilkår velger ikke Utleie. Kundeopplysninger og kilder beholdes, også uttrykkelig
ukjent detalj uten katalogfallback. Nytt manuelt avvalg fjerner beviset;
navn/rå-ID/tilgjengelighet og gamle katalograder gjenoppretter ikke valget.

44 nye kontrakttester og 593/593 målrettede kontroller består. Fullsuite:
5766/5766 tester i 163 filer, uten skip. Typegen/TypeScript, webpack-bygg og lokal
syntetisk HTTP/PDF-runtime 22/22 PASS. ESLint 0 feil / 27 eksakt uendrede warnings.
202 andre produkters manuelle initial-/repeat-resultater, seks ikke-Utleie-
kontroller på målproduktene og 144 faktiske rene dokumentforløp med visning er
eksakt baseline-identiske. Katalog/kildebytes og tidligere bevispakke er uendret.

[Receipt](../audit/checkpoints/b051-manual-rental-d53c2a1/completion-receipt-manual-rental-choice.json),
[checkpoint](../audit/checkpoints/b051-manual-rental-d53c2a1/checkpoint.json),
[validering](../audit/checkpoints/b051-manual-rental-d53c2a1/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-manual-rental-d53c2a1/README.md).
Dette lukker bare den avgrensede manuelle Utleie-feilen. Ren dokumentbasert
Utleie-aktivering/visning er beholdt som før og gis ingen lukking eller
pilotklarering. Publisering med commit og push er eksplisitt autorisert.

HTU `157c7afed18eb0fe` / SC-019/SR-033, `8a89196fecd29ddb`, fysisk insektegenandel
SC-020/SR-032 og alle øvrige HOLD er uendret. B-051 37/0/1/1, kampanje 63,
globalt resolved/open UKJENT, P2-kreditt 0 og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.
Sikkerhet/GDPR/P3-A05, personforsikring/pilotscope, kritisk UX, feedback og operativ
rådgiveraksept står fortsatt synlige på vent. NITO og Sentralbord venter.
Ingen ytterligere arbeidsstrøm er startet.

## Manuelt Hus Smart-valg – validert 23. oktober 2026

På fersk remote main `24dfac79717f3efeab7302ce4fa8010de64da3d2` er dokumentvalget
publisert. Feilen der et rent manuelt Smart-valg mistet ID og nøkler ved gjentatt
beriking, ble rettet og validert på denne basisen. Rettingen, receipt og
prosjektstatus er publisert i d53c2a1d60c907e71ad8f626a4a788d29f5ba203,
verifisert på remote main før og etter den lokale Utleie-bolken.
[Publiseringsfullmakt og kontroller](../audit/checkpoints/b051-manual-smart-24dfac7/publication-authorization.md).
**Ingen deployhandling.**

For Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår, bevares
Smart-valget med et eksplisitt valgbevis bundet til tillegg, provider, produkt og
versjon. Smart-ID, de tre eksisterende Smart-nøklene, katalogverdier og komplette
kilder beholdes gjennom gjentatt beriking og JSON-lagring. Verdier og kilder beholder
katalogopprinnelse. Dokumentavslag, konflikt og uttrykkelig ukjent beholder forrang;
nytt manuelt avvalg fjerner valgbeviset. Katalog-ID/navn/tilgjengelighet eller feil
valgbevis aktiverer ikke Smart. Øvrige manuelle tillegg følger eksisterende regler.

28 nye kontrakttester og 507/507 målrettede kontroller består. Fullsuite:
5722/5722 tester i 162 filer, uten skip. Typegen/TypeScript, webpack-bygg og lokal
syntetisk HTTP/PDF-runtime 22/22 PASS. ESLint 0 feil / 27 eksakt uendrede warnings.
202 øvrige produkters manuelle initial-/repeat-resultater, fem manuelle kontrollvalg
på målproduktene og 96 faktiske dokumentforløp med tilleggsvisning er eksakt
baseline-identiske. Katalog og kildebytes er uendret; gammel auditpakke er bevart.

[Receipt](../audit/checkpoints/b051-manual-smart-24dfac7/completion-receipt-manual-smart-choice.json),
[checkpoint](../audit/checkpoints/b051-manual-smart-24dfac7/checkpoint.json),
[validering](../audit/checkpoints/b051-manual-smart-24dfac7/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-manual-smart-24dfac7/README.md).
Dette løser bare den avgrensede manuelle Smart-repeat-feilen. Publisering med
commit og push er eksplisitt autorisert. Alarmaktivering, priser, betingelsene for
8 000 kroner og betydningen av tjenesteansvaret på 100 000 kroner er uendret.

HTU `157c7afed18eb0fe` / SC-019/SR-033 og alle øvrige HOLD beholdes,
inkludert `8a89196fecd29ddb` og fysisk insektegenandel SC-020/SR-032.
Ingen ny originalsignatur- eller P2-kreditt: B-051 37/0/1/1, kampanje 63,
globalt resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.
Sikkerhet/GDPR og P3-A05-avklaring, personforsikring/pilotscope, kritisk UX,
feedback og operativ rådgiveraksept står fortsatt som pre-pilotpunkter.
NITO og Sentralbord venter. Ingen ytterligere arbeidsstrøm er startet.

## Hus Smart – validert dokumentvalg 23. oktober 2026

Dokumentvalget er validert på basis 85be811f596aa757f196f5f6f33f8fa0063b9123 og
publisert på remote main 24dfac79717f3efeab7302ce4fa8010de64da3d2. Det retter dokumentvalget på Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår.
Én produktbundet valgregel styrer både komponentaktivering og tilleggsvisning:
Valgt eller et dokumentert avtalt tillegg gir selected; Ikke valgt overstyrer
navnelisten; Valgt + Ikke valgt gir unknown/conflict. Bare Ukjent, omtale,
detaljer eller generelle vilkår oppretter ikke kundevalg. Bare selected viser
Smart som valgt tillegg. Valgt bekrefter ikke aktiv alarm eller oppfylte
hendelsesvilkår for egenandelsreduksjon.

Eksakte Smart-identiteter, kundeverdier, kildebevis og dokumentvalg beholdes på
repeat. Støttevilkår bruker samme produktbundne nøkkel med general_terms-opprinnelse
og separat recordEvidence. På denne publiserte revisjonen er den separate feilen ved
gjentatt beriking av et rent manuelt Smart-valg fortsatt åpen. Den senere rettelsen
er publisert i d53c2a1d60c907e71ad8f626a4a788d29f5ba203, som dokumentert ovenfor.

102 nye Smart-valgtester; 324/324 kontroller med den eksisterende Smart-gaten;
5694/5694 tester i 161 filer PASS uten skip. Typegen/TypeScript, webpack-bygg og
lokal syntetisk HTTP/PDF-runtime 22/22 PASS. ESLint 0 feil / 27 identiske warnings.
Katalog- og kildebytes er uendret. 202 øvrige produkters kontrollerte
berikingsresultater og seks manuelle initial-/repeat-output er eksakt baseline-identiske.
12 ekstra kontroller bekrefter dokumentoverstyring av manuelt katalogvalg.
[Receipt](../audit/checkpoints/b051-smart-selection-85be811/completion-receipt-smart-document-selection.json),
[gjeldende checkpoint](../audit/checkpoints/b051-smart-selection-85be811/checkpoint.json),
[validering](../audit/checkpoints/b051-smart-selection-85be811/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-smart-selection-85be811/README.md).

Dokumentrettelsen, receipt og prosjektstatus er publisert i
24dfac79717f3efeab7302ce4fa8010de64da3d2 og verifisert på remote main;
[publiseringsfullmakt og kontroller](../audit/checkpoints/b051-smart-selection-85be811/publication-authorization.md).
Ingen deployhandling. Testet basis-SHA og kandidatens filidentitet er ført separat. Katalogtekst,
prisberegning, 8 000-kvalifikasjoner og 100 000-kroners tjenesteansvar er uendret.
Ingen ny originalsignatur- eller P2-kreditt: B-051 fortsatt 37/0/1/1 og kampanje 63.
HTU og alle øvrige HOLD er uendret; SC-020/SR-032 gjelder fysisk insektegenandel,
adskilt fra Smart-valget. NITO og Sentralbord venter. Ingen ny arbeidsstrøm er startet.

## Rettshjelp – validert dokumentprioritet 22. oktober 2026

Rettingen er validert på fersk main 2b198f9ebf52aa283056b3a052edf0fa0cdd311f og retter
Rettshjelp på Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår.
Faktisk uttrekk bruker nå samme produktbundne dekning som katalogen.
«Ikke valgt» gir én not_selected; motstridende kundeopplysninger gir én
unknown/conflict. Katalogens rettshjelpspåstand og detaljer overstyrer ikke disse.
Kundeverdier, komplette kilder og supporting evidence beholdes; gjentatt beriking
lager ingen ekstra generisk valgt dekning. Dokumentert Rettshjelp vises som
basisdekning og ikke som et valgt tillegg; rå tilleggsopplysninger beholdes.

72/72 nye målrettede kontroller og 5592/5592 tester i 160 filer PASS, uten skip.
Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime 22/22 PASS.
ESLint 0 feil / 27 identiske warnings. Katalog og kildefiler er uendret;
202 øvrige produkters kontrollerte berikingsresultater er eksakt baseline-identiske.
[Receipt](../audit/checkpoints/b051-legal-priority-2b198f9/completion-receipt-legal-document-priority.json),
[gjeldende checkpoint](../audit/checkpoints/b051-legal-priority-2b198f9/checkpoint.json),
[validering](../audit/checkpoints/b051-legal-priority-2b198f9/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-legal-priority-2b198f9/README.md).

Rettshjelp-rettelsen, receipt og prosjektstatus er publisert på remote main i
85be811f596aa757f196f5f6f33f8fa0063b9123, verifisert før og etter Smart-arbeidet;
[publiseringsfullmakt og kontroller](../audit/checkpoints/b051-legal-priority-2b198f9/publication-authorization.md).
Ingen deployhandling. Testet basis-SHA og kandidatens filidentitet er ført separat
i receipt. Dette lukker bare den dokumenterte kundemapping-/prioritetsfeilen;
det gir ingen ny originalsignatur- eller P2-kreditt. HTU-konflikten
157c7afed18eb0fe / SC-019/SR-033 og alle øvrige HOLD er uendret.
B-051-partisjonen er fortsatt 37/0/1/1 og kampanjetallet er fortsatt 63.
NITO og Sentralbord venter. Ingen neste produksjonsbolk er startet.

## Vann etter dekket bygningsskade – validert fullføring

25004bc4d7dd2c03 er implementert for Hus Standard GAP-2088/SF-2991 og
Hus Pluss GAP-2142/SF-3075 på basis cd6e03de824d46a514413d2d86fbcae9c39e12c4.
Ny egen gren hus.vann.inntrengning_etter_bygningsskade bevarer kravet om at
åpningen/utettheten oppstod ved erstatningsmessig bygningsskade. Begge produkter
har egen kilde på PDF-side 3. Eksisterende vanngreners verdi/status/kilder,
Pluss-utvidelsen for utett bygning og øvrig katalogmetadata er uendret.

5520/5520 tester i 159 filer PASS, inkludert 27/27 nye vanntester.
Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime PASS.
ESLint 0 feil / 27 uendrede warnings. Full identitet og bevis:
[receipt](../audit/checkpoints/b051-water-25004-cd6e03d/completion-receipt-25004bc4d7dd2c03.json),
[gjeldende checkpoint](../audit/checkpoints/b051-water-25004-cd6e03d/checkpoint.json),
[validering](../audit/checkpoints/b051-water-25004-cd6e03d/validation-summary.json).

Vannfullføringen er publisert på remote main i 2b198f9ebf52aa283056b3a052edf0fa0cdd311f,
verifisert ved starten og avslutningen av den lokale Rettshjelp-bolken.
Bare vannsignaturen ble flyttet til fullført i denne bolken. Ingen deployhandling.

## Tidligere publisert revalidering av dyredekning

## Avgrenset revalidering 22. oktober 2026

41206e12c93c0058 er revalidert mot main f7b4007181507b0746c720f55182bee5bc426933.
Originalbindingen er GAP-2092/SF-2998 på Hus Standard, med to dimensjoner;
Hus Pluss og valgt insekttillegg er arve-/regresjonskontroller, ikke ekstra originalbindinger.
B-020 dekker bekjempelse og bygningsskade; ingen produksjonsretting var nødvendig.
247/247 målrettede tester i 7 filer PASS, 0 fail og 0 skip. Kildehasher og
kildepunkt er kontrollert på nytt; fullsuite, bygg og runtime er ikke kjørt på nytt.
[Ny receipt](../audit/checkpoints/b051-revalidation-41206-f7b4007/receipt-41206e12c93c0058.json),
[gjeldende checkpoint](../audit/checkpoints/b051-revalidation-41206-f7b4007/checkpoint.json) og
[validering](../audit/checkpoints/b051-revalidation-41206-f7b4007/validation-summary.json).

Lukkingen er publisert i cd6e03de824d46a514413d2d86fbcae9c39e12c4, som inngår i fersk main.
Testet applikasjonsrevisjon er f7b4007; publiseringscommitten inneholder bare dokumentasjon.
Historiske receipts og øvrige HOLD er uendret. Ingen deploy.

## Tidligere publisert råtearbeid

B-051 råte er fullført for 6af32d21acb9584c, begge originalbindinger:
Hus GAP-2101/SF-3012 og Hus Pluss GAP-2160/SF-3099.
[Historisk råte-checkpoint](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/checkpoint.json),
[completion-receipt](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/completion-receipt-6af32d21acb9584c.json)
og [bevispakke](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/README.md).

Standard uten valg er unknown. Et eksplisitt manuelt råtevalg beholder produktbundet
valgbevis, addon-ID, komponent og komplette kilder gjennom gjentatt enrichment.
Dokumentavslag og konflikt overstyrer valget; navnelisten følger effektiv status,
mens fakta/provenance bevares. Dokumentert kundeverdi beholder forrang.
Avkrysset av og nytt manuelt input gjenoppretter ikke gammelt valg. Pluss inkludert består.
Publisert råtetekst, katalogmetadata og tidligere statusretting er uendret.

[Historiske råtegater](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/validation-summary.json):
83/83 råtestatus, 2/2 manuell runtime-flyt og 140/140 råtekatalog;
2295/2295 målrettet i 36 filer; 3339/3339 remediering i 60 filer;
5493/5493 fullsuite i 158 filer.
Next typegen/TypeScript, webpack build og HTTP/PDF-runtime 22/22 PASS.
ESLint: 0 feil, 27 eksakt uendrede warnings.
203 øvrige manuelle produktavtaler, 157 gyldige øvrige tilleggsavtaler og
202 materialiserte produkter er baseline-identiske; katalogen og B-020 består.

63 unike dokumenterte kampanjesignaturer: B-050 16, B-071 10, B-051 37.
Alle 60 tidligere receipts og historiske auditpakker er bevart.
B-051s 39-partisjon: 37 fullført / 0 uten completion /
1 revalideringskandidat / 1 opprinnelig HOLD. Manglende receipt er ikke alene produksjonsfeil.

Globalt resolved/open er UKJENT. Historiske 414/1589, 19/16, 10/8,
diagnostikk 19/12, HARNESS_AUTONOMY_V1 33/12 og DEFER_SAFE omskrives ikke.
[Nye mekaniske rettinger](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/autonomous-mechanical-corrections.json)
føres separat uten numerisk stoppkvote. Ingen P2-kreditt.

Smart-dokumentvalg er publisert; den separate manuelle Smart-repeat-feilen er
rettet, validert og publisert i d53c2a1 som dokumentert ovenfor. HTU-konflikt, SC-020/SR-032, SC-035/SR-031, B-071-holdet og øvrige holds er bevart. Rettshjelps kundemapping/prioritet er validert rettet
i rettelsen ovenfor; historiske receipts og øvrige metadataoverganger er bevart.
8a89196fecd29ddb beholdes åpen og på HOLD: landbruks-/næringsunntakets
anvendelse på bekjempelse krever autoritativ avklaring. Ingen lukking av denne kandidaten.
Ingen ny produksjonsbolk eller deploy er autorisert. NITO og Sentralbord venter.
Øvrig pre-pilot: personforsikring/pilotscope, sikkerhet/GDPR (inkludert fortsatt
uavklart P3-A05-identitet/mergestatus), kritisk UX, feedback og operativ rådgiveraksept
forblir synlige og er ikke startet som nye arbeidsstrømmer.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
