# Forsikringstolken: repo-basert utviklingsagent

Dette er arbeidsinstrukser for en aktiv Codex-økt, ikke en bakgrunnstjeneste.
Startpunkt: [aktuelt checkpoint](../audit/checkpoints/development-agent-ef5b0bc/checkpoint.json),
[foreslått plan](next-b050-plan.md) og [maskinlesbare bindinger](../audit/checkpoints/development-agent-ef5b0bc/remaining-b050.json).

## Autorisasjon og prioritet

Brukerens eksplisitte fullmakt gjelder foran lokale retningslinjer. Bevar Next-blokken i
AGENTS.md og les relevante installerte Next-guider ved kodearbeid. Les deretter checkpoint,
kildereceipts og den eksakte autoriserte bolken. Siste operative kampanjesnapshot er
[Behandling-policyen](../audit/checkpoints/b050-treatment-completion-16bfc4b/campaign-policy.json).
Den gjelder det fullførte navngitte Behandling-scopet; den autoriserer ikke de foreslåtte bolkene.
Historisk [styringsforslag](../audit/checkpoints/g2-recovery-36d7694/future-governance-proposal.md)
er ikke en ekstra aktiv fullmakt. Planstatus NOT_AUTHORIZED betyr ingen implementering.

Registrer ny fullmakt varig før implementering: eksakte signaturer/bindinger, tillatte filer og
kontraktsendringer, kilder, uavhengige delscopes, gater, budsjett og commit/push-mål.
Ikke still rutinespørsmål om arbeid som allerede ligger innenfor fullmakten.
En større bolk kan omfatte flere selvstendige kontrakter; før hver reelle rot separat.
Ingen kampanjegrense autoriserer nye scopes i seg selv.

## Start og kontraktpreflight

1. Bekreft remote-repo, HEAD, origin/main, faktisk remote main, staged/status og diff.
   Bevar brukerarbeid. Ikke reset/revert/stash eller overskriv en kandidat.
2. Les originalregister og full batchdefinisjon, avhengigheter og aktuelle beslutninger.
   Verifiser kildens faktiske bytes/SHA-256, originalside/avsnitt og hele materielle betydning.
   Frossen auditkilde er ikke automatisk produksjonsregistrert kilde. Innhentingsdato er ikke
   vilkårsversjon. Arkivets historiske mappingforslag er ikke en ny canonical beslutning.
3. Les faktiske funksjonssignaturer, rå/presenterte verdi- og provenanceformater,
   source/sources, registrert sourceType, deduplisering/rekkefølge og arv/replacesBase.
   Før nye assertions: kontroller company, produkt-ID, aktiv/historisk status, basis/tillegg,
   variant/scope og inputmodus. Kjent manuelt katalogprodukt og dokumentpipeline har ulike
   overstyringskontrakter; ikke bytt modus for å få grønn test.
4. Ta fil-/diff-hasher og en avgrenset før-inventering. Kontroller dokument > katalog,
   available != selected, selected/not_selected/unknown og riktig selectionEvidenceKeys.
   Supporting terms og ikke-assertive detaljer skal ikke opprette kundevalg.

## Utførelse, røtter og eskalering

Gjør minste nødvendige autoriserte endring. Ingen generell refaktorering, fuzzy mapping,
kildeflytting, ukjent-til-inkludert-konvertering, secrets, miljø-/Railway- eller UI-endring
uten konkret fullmakt. Kildeoriginaler og historiske auditfiler er uforanderlige.
Kjør målrettede kontroller underveis; samle sammenhengende autorisert arbeid i bolken.

En ny korrekt assertion er valideringsarbeid. En retting av en feilaktig assertion er en
harnessrot, ikke automatisk mekanisk fordi filen er en test. Før mekanisk autoretting:
dokumenter uavhengig baseline-/kilde-/kodebevis for uendret forsikringsbetydning, verdi,
scope, selection, dokumentprioritet og provenance. Før hver uavhengig rot én gang med
før/etter, bevis og policy. Samme dokumenterte typegen-rot belastes ikke på nytt.
Aktiv navngitt kampanje har grense 3 mekaniske røtter per eksplisitt autorisert scope og
12 samlet. Dokumentert brukt: 9/12; fullført Behandling 3/3 og tidligere Liv 2/3. Historisk fullført sumvalg var 3/3. Nye scopes trenger eksplisitt
scopeautorisasjon. Historiske 19/16 og 10/8 er ikke fullt rekonstruert og endres ikke.
Historisk betinget 20/16-unntak ble ikke brukt; ikke dobbelttell det.

Stopp avhengig arbeid ved kildekonflikt, uautorisert forsikrings-/selection-/mapping-/
canonical-/admissionendring, ny enginefeil, uforklart regresjon, integritetsavvik eller
oppbrukt gjeldende budsjett. Diagnostiser uten ny semantisk retting. Bevar arbeid og skriv
blocker med filer, tester, baseline-reproduksjon og minste nødvendige beslutning.
Samle uavhengige beslutningsspørsmål i én konkret eskalering med anbefaling og konsekvenser.
Fortsett en annen del bare når den er uttrykkelig autorisert, uavhengighet er bevist,
fileierskap er avklart og fullmakten ikke krever global stopp. Integritets-/regnskapsavvik
som gjør felles bevisgrunnlag usikkert stopper hele bolken. Ikke utvid scope ved skip.

## Sluttgate, receipts og publisering

På endelig kandidat: kilde→katalog- og reverse-audit, provenance, målrettet gate,
positive kontroller, aktuelle tidligere receipts og relevante katalog/normalisering/
selection/enrichment/comparison/dokumentprioritet/manuell input-tester. Bevis samme
produkt, begge retninger og provider/type/komponentisolasjon. B-050 krever fullsuite,
TypeScript, ESLint, webpack production build og syntetisk HTTP/PDF-runtime.
Bruk faktisk testmanifest og installerte verktøy; kjør hver testfil, ikke en kommando som
bare utfører første fil. Se kommandoene i [gjeldende gate-receipt](../audit/checkpoints/b050-sum-completion-5ffa5c5/gate-results.json).
Typegen før tsc når installert Next-kontrakt krever det. Arkivwarnings alene blokkerer
ikke hvis ESLint har 0 feil. Et gammelt Cloud-build-unntak gjelder bare den identiske,
diagnostiserte feilen; siste sumvalg-build/runtime bestod uten unntak.
Dokumentasjonsarbeid alene krever lenker/bindinger/policy/integritet/diff, ikke appsuite.

Lagre logs, receipt, eksakte signatursett, kandidatidentitet, kommandoer/resultater,
rootregnskap og checkpoint i Git. /tmp er kun reproducerbare mellomfiler.
Receipt må skille testet SHA fra kandidatfil-/diff-identitet og senere dokumentasjonscommit.
Ikke hev at andre revisjoner er testet. Globalt resolved/open forblir UKJENT til et komplett
aktuelt sett er bevist; ikke legg nye receipts til historisk rapporterte 414.
Bevar de tolv dokumenterte kampanjereceipts, historiske DEFER_SAFE og beskyttede holds.

Stage bare navngitte autoriserte filer etter gater og diff-review. Én autorisert atomisk
bolk = én commit; aldri bland blokkert arbeid. Bruk etablert main-workflow uten force,
verifiser remote SHA og HEAD/origin/main, clean/staged=0 før neste bolk. Ved remote-fremdrift:
undersøk først; integrer uten overskriving, og revalider dersom testet innhold endres.
Commit/push er autorisert bare der brukerfullmakten sier det. Ingen egen deployhandling.
Oppdater checkpoint til neste konkrete steg, med tillatelser og blockers; ikke etabler
scheduler eller påstå automatisk ChatGPT–Codex-overlevering.
