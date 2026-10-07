Implementer B-051 Hus Pluss — håndverks-/entreprenørfeil og våtrom etter den komplette preflighten.

Dette autoriserer de to katalogradene, planlagte testoppdateringer, ny auditpakke, fem individuelle completion-receipts og commit/push etter komplett PASS.

BASELINE
Forventet HEAD/main:
0cedd98cc3ae1e885902aba585ef65054985c5e5

Les AGENTS.md, workflow, gjeldende checkpoint og hele preflighten.
Verifiser faktisk remote SHA, ren arbeidskopi og alle 39 tidligere dokumenterte signaturer/receipts.

EKSAKT SCOPE
46e94bcf464af845 — GAP-2153/SF-3090
2113807ceb290224 — GAP-2154/SF-3091
af150eab853a1648 — GAP-2155/SF-3092
239b00779349f2fd — GAP-2156/SF-3093
57c775ac935fb504 — GAP-2183/SF-3140

Alle gjelder Gjensidige Hus Pluss, ordinary.
Verifiser bindingene og RC-027 mot originalregisteret.

PRODUKSJON
Endre bare disse to gjensidigeHusPluss-radene i
lib/gjensidige-hus-catalog.ts:
- hus.vatrom.selverommet
- hus.handverker.folgeskade

Preflightens komplette foreslåtte verdier og radspesifikke provenance er uttrykkelig godkjent. Verifiser hele teksten mot frosne originalkilder før implementering.

Bevar særlig:
- Faglært håndverker eller godkjent/registrert entreprenør.
- De fire kildebestemte feiltypene.
- Skaden/følgeskaden må oppstå i forsikringstiden.
- Konstatering innen ti år fra utført arbeid.
- Alle radspesifikke unntak.
- Skillet mellom våtromsskade og andre følgeskader.
- Garanti-/avtaleunntakets krav om både plikt og økonomisk evne.
- Produktsidens reklamasjonsforutsetning med separat provenance.
- Standard-produktets negative regler og Pluss’ replacesBase.

Femårsregelen skal ikke bli en universell dekningsgrense.
Unntaket for utbedring av selve feilen i andre bygningsskader skal ikke overføres til våtrom.

PROVENANCE
Korriger de to primærhenvisningene fra PDF4 til faktisk PDF5, med preflightens eksakte avsnitt.
Tilføy den godkjente supplerende produktnettsidehenvisningen for håndverkerfølgeskade, page: 1, etter eksisterende HTML-konvensjon.

Bevar øvrige kildefelter, etiketter og arv.
Ingen sourceType oppfinnes. Ikrafttredelse er fortsatt ukjent.
Verifiser alle tre frosne kildehasher.

PLANLAGTE TESTENDRINGER
Autoriser:
- Ny tests/remediation-b-051-craftsmanship.test.mjs.
- Bare Pluss-fingerprinten i B-020 R-020-06, etter eksakt to-rads-differansebevis.
- To eksplisitte kildebaserte transformasjoner i B-050s forventningsbygger.
- Nye revisjonsbundne reverse-auditreferanser i B-051 og Hage-gaten.
- Brann/vær-gatens uavhengige forventningskatalog og reverse-audit med akkurat de to godkjente transformasjonene.

Bevar Standards fingerprints, tidligere transformasjoner, eksisterende radkontrakter og alle øvrige full-field-kontroller.
Hage-gatens canonical DOCUMENT/MANUAL-forventninger skal ikke endres uten nytt konkret bevis.

Dette er uttrykkelig godkjent planlagt scopearbeid og belastes ikke harnessbudsjettet.
Historiske auditpakker, orakler, receipts, logger og checksums skal ikke omskrives.

REGRESJONER
Kontroller de komplette kildekvalifikasjonene og fem bindingene.
Bevis dokumentprioritet, begge manuelle modi, dokumentroller,
supportingEvidence, arv, samme produkt og begge retninger.

Bruk faktiske representasjonskontrakter:
replacesBase på råfacts, overriddenBase på enriched terms,
baseline-verifisert rettshjelp-aliasovergang, source/sources,
undefined-felter og catalogReference/catalogFacts: null.

De to nøklene er term-rader, ikke egne selection-parents.
Ingen ny parent eller positiv kundedekning skal utledes.

Bevis isolasjon:
317 øvrige komponenter, 4156 øvrige råfakta, metadata og
203 øvrige produkters effektive fakta uendret.
Bevar B-020s skadedyrfakta og alle 13 tidligere B-051-completions.

SEPARAT AUTORISERT HARNESSROTTING
Rett den baseline-påviste personvernassertionen i
tests/supporting-terms.test.mjs:250 som feilaktig matcher
privatmarkøren «8641» inne i et legitimt tidsmålingstall.

Autorisasjonen gjelder bare testens matchingskontrakt.
Ingen produksjons-, logging- eller personvernendring.

Bevar eller styrk kontrollen av:
- faktiske private felt og kundedata;
- hele fixture-markører i relevante tekst-/JSON-verdier;
- uautoriserte private opplysninger i output.

Tilføy kontroller som beviser både:
- legitim timing med tallsekvensen gir ikke falsk feil;
- en faktisk lekket privat fixture-markør fortsatt oppdages.

Ikke løs dette bare med ordgrenser, omkjøring til PASS,
fjerning av personvernassertionen eller generell utelatelse av output.
Bruk felt-/strukturbevis for den presise avgrensningen.

Før dette som ett separat navngitt mekanisk unntak:
«Personvernregex matcher privatmarkør inne i legitim timing».
HARNESS_AUTONOMY_V1: 18/12 → 19/12 ved faktisk retting.
Ordinær grense forblir 12. Ingen kapasitet til andre røtter.
Historiske tellere bevares.

GJENNOMFØRING
Rett og valider den separate harnessroten før komplett sluttgate.
Ved nye uautoriserte røtter: diagnostiser samlet, bevar kandidaten og stopp før retting.

Kjør alle gjeldende sluttgater:
kilde-/bindingkontroller, målrettet gate, kilde-/reverse-audit,
relevante B-007/B-020/B-050/B-051/B-071,
status, normalisering, provenance, supporting terms, enrichment,
manuelle modi og comparison,
komplett remedieringsmanifest og fullsuite,
typegen/TypeScript, ESLint, webpack build, HTTP/PDF-runtime
samt receipt-/checksum-/repositoryintegritet.

ETTER KOMPLETT PASS
Opprett fem individuelle completion-receipts.
Bevar alla 39 tidligere dokumenterte signaturer/receipts.
Oppdater B-051s eksakte partisjon, checkpoint og prosjektstatus.
Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.
Alle holds bevares.

Commit/push gjennom sikret publish.py med kontrollert exit-status,
checksums, eksakt staged-sett og begge diffkontroller.
Verifiser remote SHA og ren arbeidskopi.

Ingen egen deployhandling eller senere produksjonsbolk.

Sluttrapport:
Fem individuelle resultater, full kildebetydning/provenance,
testoppdateringer, separat personverntestbevis og budsjett,
isolasjon, faktiske sluttgater, receipts og repository-status.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
