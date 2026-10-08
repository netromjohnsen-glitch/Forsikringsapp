# B-051 manuelt råtevalg — read-only beslutningspakke

B051_MANUAL_ROT_SELECTION_PREFLIGHT = READY_FOR_BOUNDED_AUTHORIZATION

Analysert revisjon: `2a2d0fc2b38897037f1f12d5b7627a2ffbaf0382`.
HEAD, origin/main og faktisk remote main var identiske ved oppstart. Arbeidskopien og staged-settet var tomme. Ingen prosjektfil er endret. Kandidatene er lastet med Node `registerHooks`, kun i minnet. Dette er preflight, ikke implementering eller completion.

## Eksakte originalbindinger og bevart kildekontrakt

`6af32d21acb9584c`: Hus `GAP-2101/SF-3012`, ordinary, produkt `gjensidige-hus`, tillegg `gjensidige-hus-rate-insekter`; Hus Pluss `GAP-2160/SF-3099`, ordinary, produkt `gjensidige-hus-pluss`, inkludert base. Canonical parent er `hus.rate.dekning` i begge. Bindingene er kontrollert mot originalregisterets 1589 unike signaturer og gjeldende fullmakts original_binding.

Frosne og registrerte kilder er verifisert:

- Standard: `Hus-Standard-alminnelige-vilkar.pdf`, SHA256 `d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc`. Tabell starter PDF3; baseunntaket står PDF4. Eksisterende referanse PDF3 beholdes.
- Pluss: `Hus-Pluss-alminnelige-vilkar.pdf`, SHA256 `79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792`. PDF6 «Råte og skadeinsekter»: fullverdiforsikret bygning, materialnedbrytning; utvikling før/etter avtalen, forebygging/vedlikehold, landbruk/næring selv når oppført, dører/vinduer/lekter/laft/alt utvendig treverk, blåved/svertesopp/mugg/kosmetikk. Alle komplette avsnittskontroller er kjørt i uendret 140-test-gate.
- IPID: `IPID-Husforsikring-EAP01.pdf`, SHA256 `5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9`. PDF2 dokumenterer valgfri Standard-utvidelse. Tilgjengelighet dokumenterer ikke kundevalg. Pluss PDF1 dokumenterer eksisterende 6 000 kr-egenandel.

Katalogverdier, registrerte kilder, kildeidentiteter og råfakta er identiske mellom baseline og minnekandidat. Ingen kildeversjon/sourceType/ikrafttredelse er oppfunnet.

## Konkret rotårsak og faktisk dataflyt

1. UI lagrer avkryssing som rå `ManualProductInput.addOnIds`: `app/page.tsx:600–611`. Serverens manuelle gren kaller `normalizeManualAgreement` på ny input og bruker resultatet direkte, ikke dokumentekstraksjon (`app/api/analyze/route.ts:97`, `:183`).
2. `lib/manual-agreement.ts:154–166` validerer ID-ene gjennom resolveren og materialiserer valgt komponent. `:172–189` lager addOns med eksplisitt ID, registrert source og `coverageOrigin: catalog`. Det siste beskriver vilkårskilden, men skiller ikke *valgets* opprinnelse fra katalogopprinnelse.
3. `lib/catalog-enrichment.ts:128–131` godtar documentAddOns som dokument-origin eller eldre umerkede objekter uten ID/source. Det manuelle objektet er legitimt utelatt fra denne dokumentlisten. Samtidig filtrerer den publiserte, avgrensede statusrettingen katalogbaserte råteparent-termer før dokumentnormalisering. Dermed kan ikke generell katalogtekst rekonstruere kundevalget.
4. `selectedScopedAddOns` finner ikke dokumentbasert valgbevis. `:262` resolver da basen uten tillegget; `:392` erstatter effektive addOnIds med `[]`. addOns-objektets egen ID/source er fortsatt til stede, men det har ingen separat videreført manuell valgkontrakt. Parent-key og katalogproduktidentitet forsvinner ikke: innholdet erstattes av Standard-basen, med termbekreftelse false og status unknown.
5. `comparison.groupTerms` og `coverageDetailPresentation` bruker samme canonical-status: unknown og «Ikke dokumentert». Dette er virkelig tap av effektivt valg, ikke bare teksttap.

Eksakt minimal input: `{ company: 'Gjensidige', products: [{ type: 'Hus', productName: 'Hus', importantTerms: [], addOnIds: ['gjensidige-hus-rate-insekter'] }] }`. Første resultat er selected og valgt komponent. Etter enrichment: unknown, effective IDs [], Standard-basetekst; etter flere runder fortsatt unknown. Den publiserte statusrettingen skal beholdes: å gjeninnføre positiv katalogtekst som valg ville skjule feilen igjen.

### Eksisterende prioritet

Dokumentert eksplisitt valg/avslag er prioritet400; dokumentert hovedverdi280; kataloghovedverdi200. Motstridende eksplisitte dokumentvalg på samme prioritet gir konflikt/unknown. Et manuelt valgt tilleggs katalogvilkår beholder katalogprovenance og får ingen ny, høyere prioritet. Produktbekreftelse, egenandel og generelle vilkår er ikke manuelle valgbevis.

### Supplerende presentasjonsfunn

På uendret HEAD står tilleggsnavnet fortsatt i «Tilleggsdekninger» også ved dokumentert avslag/konflikt i en allerede manuelt valgt avtale. `lib/comparison.ts:188–195` søker canonical-status etter navnenormalisering; navnet «Sopp, råte og skadeinsekter» treffer ikke råteparenten, og `!coverage` godtar navnet. UI bruker dette resultatet ved `app/page.tsx:1279` og `:1328`. Dette er eksisterende oppførsel, ikke ny regressjon fra valgkandidaten. Canonical-status er korrekt not_selected/unknown. Ingen generell aliasretting anbefales.

## Minste komplette anbefalte kontrakt og filsett

Produksjon, senere eksplisitt autorisasjon nødvendig:

1. `lib/manual-agreement.ts`: Legg et internt `manualSelection: { origin: 'manual', catalogReference }` på kun eksplisitt valgte, allerede validerte Hus-addons med eksisterende selectionEvidenceKeys. Det er valgmetadata, ikke kildeprovenance. Rå kundevilkår og registrerte kildereferanser forblir urørt. Ikke fyll metadata på eldre/catalog-only objekter eller ut fra text/ID-tilstedeværelse alene.
2. `lib/catalog-enrichment.ts`: Typ internt felt i addon-DTO; kontroller nøyaktig provider, produkt, versjon, type/scope og eksisterende tillatt addon-ID. Bare dette beviset kan supplere eksisterende dokumentseleksjon innen den allerede konfigurerte Hus-opt-in. Behold dokumentavslag/konflikt, eksklusivitet og prerequisites. Viderefør marker gjennom eksisterende objektspread. Gjenoppbygg parentens komplette sources med eksisterende manuell provenancerepresentasjon, inklusive begge genererte noter; dette er avgrenset til det validerte manuelle råtevalget. Del valideringen mellom seleksjon og provenancenotebevaring ved implementering, slik at ingen uvalidert marker kan aktivere særbehandling.
3. `lib/comparison.ts`: For samme validerte interne manuelle addon bruker tilleggsnavnlisten den eksisterende, metadatafestede parentidentiteten (`selectionEvidenceKeys`) og krever effektiv selected uten konflikt. Ingen navnegjetting, ny alias, ny statusprioritet eller generell tilleggsregel. Typ internt felt i ComparedInsurance. Dette tredje punktet er en særskilt avgrenset forbrukerkontrakt som må inngå i fullmakten dersom hele presentasjonsmatrisen skal være konsistent.

Ingen katalog-, registry-, canonical-, ekstraksjonsschema-, coverage-status-, dokumentnormaliserings-, kilde- eller UI-endring trengs. Standard optional/unavailable og Pluss included/replacesBase består.

Eksisterende felter addOnIds, addOns.id, catalogReference og coverageOrigin er nyttige identiteter, men har ikke i dag et entydig per-tilleggsskille mellom *eksplisitt manuell beslutning* og effektiv katalog-/dokumentavledning. Top-level `source: manual` ligger utenfor insuranceData og følger ikke et insurance-only enrichment-kall. Bare å stole på alle catalog IDs eller source=manual på en senere, rekonstruert input anbefales ikke.

`simulated-production.diff` viser de tre faktisk simulerte runtimeendringene; `candidate-identity.json` binder dem til originalbytes og testet HEAD. Diffen er et preflightutkast, ikke en ferdig typekontrollert patch. Interne typeannotasjoner og én gjenbrukt, streng marker-validering må ferdigstilles innen de samme tre filene. TypeScript/ESLint for en implementering er NOT RUN her.

## Faktisk før/etter-matrise

Fire stadier = direkte resultat, enrichment1, enrichment2, enrichment3. `matrix.json` og baseline/candidate.json inneholder fullverdier, sources, status/conflict, addonobjekter og effektive IDs.

| Scenario | Baseline | Full minnekandidat |
|---|---|---|
| Kjent Standard, manuelt valgt råte | selected → unknown → unknown → unknown; ID → [] | selected x4; råte-ID x4 |
| Standard taus | unknown x4, [] | identisk |
| Pluss inkludert | selected x4, [] | identisk |
| Dokumentert Valgt, individual_agreement/unknown | selected x4, råte-ID x4 | identisk |
| Dokumentert Ikke valgt | not_selected x4, [] | identisk |
| Dokumentert Valgt + Ikke valgt | unknown/conflict x4, [] | identisk |
| Manuelt valg + dokumentert avslag | not_selected x4, []; navn fortsatt listet | samme status/IDs; navnet skjules |
| Manuelt valg + dokumentkonflikt | unknown/conflict x4, []; navn fortsatt listet | samme status/IDs; navnet skjules |
| Dokumentert kundeverdi17 000 kr alene | selected x4, [] | identisk; ingen komponent utledes fra beløpet |
| Manuelt valg + dokumentert kundeverdi17 000 kr | suppl. kontroll | selected + valgt-ID; dokumentverdi/fullkilde bevares fire runder og begge retninger |
| general_terms alene | 0 kunder; supportingEvidence beholdt | identisk |
| Taus kunde + general_terms Valgt | unknown x4, []; katalog-origin støtte bevares | identisk |
| Manuellt valg + supporting terms | selected → unknown | selected x4; støtteprov/rolle beholdt |
| Bare råteegenandel6 000 kr | unknown x4, [] | identisk |
| Råte + Utleie / Råte + Smart | begge initiale IDs → [] | råte-ID stabil; øvrig ID-tap er uendret og utenfor scope |
| Avkryssing fjernet og avtalen sendt på nytt | unknown x4, [], ingen addon | identisk, ingen gammel marker gjenoppstår |
| Egendefinert manual | initialt ingen katalogparent; catalogReference:null, fritekst | identisk; ingen katalogimport eller marker |

20 hovedscenarioer/80 stadier per variant, 12 customer-comparison-kontroller per variant, separate fire runder med dokumentprioritet og begge retninger. Full kildeprov for manuelt valgt parent (inklusive note, productCode:undefined og rekkefølge) er strict deep-compared; canonical key og valgt komponent er stabile. Kildene er fortsatt katalogkilder, ikke falske dokumentkilder. Supporting-kilder beholder general_terms-rollen.

Første smale marker-only-kandidat bevarte status/ID men mistet de to manuelle provenancenotene. Den er lagret som candidate-selection-only.json og probe-marker-only.mjs; den anbefales ikke som komplett løsning. Full kandidat bevarer også disse og den avgrensede navnelisten.

Validerte negative kontroller: ingen marker, ID uten valgmarker, feil provider/type/scope/produkt/versjon, ukjent addon-ID. Alle avvises som valgbevis. Endret navnetekst med riktig validert ID påvirker ikke valg. Ekstraksjonspipelinen avviser innsprøytet manualSelection i både insurance- og addon-objekt; en uvalgt manuell input får heller ikke valg ved å tilføre et tilsvarende felt.

### Fjerning og kontraktgrense

UI-fjerning muterer rå ManualProductInput.addOnIds og sender hele ny input. Ny normalisering lager bare aktuelle addons; marker fra et gammelt resultat kopieres ikke. Både avkryssing av og skifte til egendefinert produkt er prøvd. Å redigere kun effective addOnIds på et gammelt internt enriched objekt, samtidig som gammelt manualSelection beholdes, er ikke den eksisterende brukerhandlingen. Ingen slik ny endrings-/prioritetskontrakt foreslås.

## Isolasjon og kallere

- Alle 203 andre katalogproduktoppføringers manuelle avtaler er full-field-identiske før/etter gjennom gjentakelse.
- 157 andre gyldige tilleggsavtaler er full-field-identiske; to ytterligere kombinasjoner avvises likt av eksisterende resolver. Hele inventaret omfatter159 forsøk.
- Alle202 materialiserbare produkters materialisering og samme-produkt comparison er identiske. Hele råkatalogens typed-field-hash er identisk; B-020s11 tester og alle fingerprints består uendret.
- Den eksakte råteparenten brukes av13 produkter/selskap6: TrygHus/HusEkstra, IfBasis/Utvidet/Super, StorebrandStandard/Super, GjensidigeHus/HusPluss, FremtindStandard/Topp, FrendeStandard/Utvidet. Bare eksisterende metadatafestet Standard-tillegg får den nye manuelle valgmarkeren; Pluss får ingen påfunnet addon.
- Produksjonskallere for enrichment er `analysis-merge.enrichBatch` og `enrichConsolidatedInsurance` i konsolideringen. Dokumentfixtures går gjennom ekte enrichBatch/mergeBatchResults, ikke bare canonical-input. Manual route bruker normaliseringen direkte; sammenligning/presentasjon bruker deriveCanonicalCoverages og groupAddOnNames. Ingen API/UI-kaller må endres for dette forslaget.

Smart-/Utleie-ID-tap i kombinasjonsprober er uendret og skal ikke løses her. Rettshjelp-alias, vannmapping, HTU og SC-035/SR-031 forblir holds. Andre typer manuell addon-persistens er ikke automatisk autorisert av samme funn.

## Permanente regresjoner og kompatibilitet

Presist app-testfilsett senere:

- `tests/remediation-b-051-rot-status.test.mjs`: Utvid manuell valgt/taus/kombinasjon med minst tre enrichment-runder, ID/marker/komponent/status/canonical/full-source-kontroller; dokumenterte negative/conflict-overlays, source prioritet, supporting roles; strenge ugyldig-marker/ID/provenance-negative kontroller; tilleggsliste etter avslag/konflikt.
- `tests/manual-runtime-flow.test.mjs`: Verifiser rå checkbox-input → manuell normalisering → gjentakelse → begge comparison-retninger; avkryssing av og nytt submit; egendefinert modus. Ingen ny UI-mutasjonskontrakt.

De åtte gjennomgåtte aktive testfilene består uendret også under full minnekandidat. Ingen påvist nødvendig fingerprint-, radsett-, canonical-, reverse-audit- eller snapshotoppdatering: ingen katalogfakta endres. B-020 og eksisterende uavhengige helpers bevares. Historiske repeat-choice-diagnoser beholder sin faktiske revisjon og feil; ny aktuell receipt må ikke omskrive dem til PASS.

## Kjørte kontroller og begrensninger

PASS: fersk HEAD/origin/main/remote; ren/staged0; originalbindinger; alle60 immutable receiptbytes/status/bindinger; eksakt B-051-partisjon34/1/2/2; tre kildehasher/registrert metadata;273 manifestposter og21 aktuelle application-file-identiteter; minnematrisen og isolasjonen.

Baseline og full minnekandidat:289/289 målrettede tester hver, faktisk kommando per fil `node --no-warnings --test-reporter=tap tests/<fil>.test.mjs` (kandidat med den lokale --import-loaderen):
- rot-status72; rot140; manual-agreement9; manual-runtime-flow1; mc-bobil-manual20; product-coverage-evidence20; catalog-enrichment-provenance16; B-02011.

Den første samlede --test-kjøringen viste7/8 fil-level PASS; direkte diagnose viser to pdftotext EPERM fra sandboxen. Rerun med nødvendig subprocess-tilgang og repoets faktiske per-fil-kommandoer bestod ovenfor. Dette er miljø-/kjøremodusbevis, ikke en produksjonsretting. Opprinnelige forsøk og logger er beholdt.

NOT RUN: fullsuite, komplett remedieringsgate, next typegen/TypeScript, ESLint, webpack-build og HTTP/PDF-server-runtime. manual-runtime-flow-testen er én målrettet test, ikke full HTTP/PDF-runtime.

Egne preflightverktøy fikk to beviselig mekaniske feil rettet uten prosjektendringer: et supplementary overlay ble kontrollert som effektive IDs før enrichment, og en ubrukt import pekte på et ikke-eksisterende eksportnavn. Originale utkast er bevart; se mechanical-preflight-log.md. Kandidatens tap av provenancenoter og navnelistefunnet er reelle simulering-/baselinefunn, ikke ført som mekaniske rettinger eller skjult med løsere assertions.

## Minste nødvendige fullmakt og closure

Foreslått, IKKE AKTIVERT: Autoriser for bare `6af32d21acb9584c` de tre ovennevnte produksjonsfilene og to testfilene, intern produktbundet eksplisitt manuell valgmetadata kun for eksisterende Hus-opt-in, dens videreføring/komplette provenancenoter og parentfestet tilleggsnavnfiltrering. Behold eksisterende dokumentprioritet; ikke rett generell mapping/status eller andre addons. Autoriser nye aktuelle audit/checkpoint/completion-artefakter og atomisk commit/push bare etter komplett PASS. Dette er en avgrenset selection-/forbrukerbeslutning; stående mekanisk fullmakt alene gir ikke produksjonsautorisasjonen. Arkitekturen er tilstrekkelig, ingen redesign nødvendig.

Closure for begge originalbindinger krever på endelig faktisk kandidat:
1. Standard GAP-2101/SF-3012: full kildebetydning, unknown uten tillegg, manuelt/dokumentert valgt komponent og ID gjennom gjentakelse, avslag/conflict uten effektivt tillegg, støttekilder/egenandel uten valg, dokumentverdi/fullprovenance, støttet fjerning uten gjenoppliving og korrekt sammenlignings-/tilleggspresentasjon.
2. Pluss GAP-2160/SF-3099: inkludert base/fullverdikvalifikasjoner og alle unntak; stabile parentstatus/provenance/arv/replacesBase; dokumentvalg/avslag/conflict og kundeverdiens prioritet; ingen ny addon eller manuell avhengighet.
3. Begge: kilde-/reverse-audit og bindinger, ny permanent matrix, B-007/B-020/berørteB-051/B-050/B-071, status/normalisering/provenance/supporting terms/enrichment/manual/comparison, sammeprodukt/beggeretninger og kryssproduktisolasjon; komplett faktisk remedieringsmanifest og fullsuite; typegen/tsc, lint, webpack og HTTP/PDF-runtime; alle60 tidligere receipts/holds, checksums/lenker/kandidatidentitet, begge diffkontroller og eksakt staged-sett; sikret publish.py og remote/clean/staged0 etter push.
4. Først da én completion-receipt for originalsignaturen med begge bindinger. Forventet separat kampanjesett61 og B-05135/0/2/2 må beregnes fra eksakt sett og ikke føres før PASS. Publisert implementation-receipt alene gir fortsatt0 signaturkreditt.

Historisk HARNESS_AUTONOMY_V1=33/12 er verifisert og uendret. Ny analyse bruker ingen kvote/budsjettføring. Globalt resolved/open=UKJENT; ingen P2-kreditt. Alle60 receipts, tekst/statusretting, B-020-fakta og holds bevares. Ingen commit, push, deploy eller senere bolk.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
