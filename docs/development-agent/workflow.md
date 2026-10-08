# Forsikringstolken: repo-basert utviklingsagent

Dette er arbeidsinstrukser for en aktiv Codex-økt, ikke en bakgrunnstjeneste.
Startpunkt: [aktuelt checkpoint](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/checkpoint.json),
[foreslått plan](next-b050-plan.md) og [maskinlesbare bindinger](../audit/checkpoints/development-agent-ef5b0bc/remaining-b050.json).

## Autorisasjon og prioritet

Brukerens eksplisitte fullmakt gjelder foran lokale retningslinjer. Bevar Next-blokken i
AGENTS.md og les relevante installerte Next-guider ved kodearbeid. Les deretter checkpoint,
kildereceipts og den eksakte autoriserte bolken. Historisk kampanjesnapshot er
[PUBLIC_DEDUCTIBLE-policyen](../audit/checkpoints/b050-public-deductible-completion-b81ee91/campaign-policy.json).
Den gjelder det fullførte navngitte PUBLIC_DEDUCTIBLE-scopet; den autoriserer ikke de foreslåtte bolkene.
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
Historisk navngitt kampanje hadde grense 3 mekaniske røtter per eksplisitt autorisert scope og
12 samlet. Disse grensene er erstattet som operativ stoppgrunn av den aktive fullmakten nedenfor. Dokumentert brukt: 11/12; fullført PUBLIC_DEDUCTIBLE 2/3, Behandling 3/3 og tidligere Liv 2/3. Historisk fullført sumvalg var 3/3. Nye scopes trenger eksplisitt
scopeautorisasjon. Historiske 19/16 og 10/8 er ikke fullt rekonstruert og endres ikke.
Historisk betinget 20/16-unntak ble ikke brukt; ikke dobbelttell det.

Stopp avhengig arbeid ved kildekonflikt, uautorisert forsikrings-/selection-/mapping-/
canonical-/admissionendring, ny enginefeil eller regresjon uten bevis for uendret godkjent kontrakt, integritetsavvik. Oppbrukt historisk mekanisk budsjett er ikke lenger en stoppgrunn
for beviste mekaniske rettinger innen autorisert scope. Diagnostiser uten ny semantisk retting. Bevar arbeid og skriv
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
Bevar de tretten dokumenterte kampanjereceipts, historiske DEFER_SAFE og beskyttede holds.

Stage bare navngitte autoriserte filer etter gater og diff-review. Én autorisert atomisk
bolk = én commit; aldri bland blokkert arbeid. Bruk etablert main-workflow uten force,
verifiser remote SHA og HEAD/origin/main, clean/staged=0 før neste bolk. Ved remote-fremdrift:
undersøk først; integrer uten overskriving, og revalider dersom testet innhold endres.
Commit/push er autorisert bare der brukerfullmakten sier det. Ingen egen deployhandling.
Oppdater checkpoint til neste konkrete steg, med tillatelser og blockers; ikke etabler
scheduler eller påstå automatisk ChatGPT–Codex-overlevering.


## Historisk fullmakt: HARNESS_AUTONOMY_V1

Denne seksjonen bevarer den tidligere policyen som historisk dokumentasjon.
Den numeriske stoppkvoten og krav om ny godkjenning for mekaniske feil er erstattet
av «Aktiv fullmakt: autonom gjennomføring» nedenfor. Tidligere forbruk og unntak
skal ikke nullstilles, omskrives eller flyttes til det nye rettingsregisteret.

Denne seksjonen er aktivert av Morten 2026-10-06 og går foran eldre stoppregler
for mekaniske harnessbudsjetter i denne arbeidsflyten. Den autoriserer ingen ny
produksjonsbolk, rehabiliteringsimplementering eller endring av SC-035.

Innen et ellers eksplisitt autorisert scope kan agenten selv rette beviselig
mekaniske test-, fixture-, serialiserings- og dokumentasjonsfeil uten ny forespørsel.
Fullmakten omfatter eksempelvis source/sources-representasjon, key: undefined,
HTML-entities, LF-linjeskift og foreldede eksakte radsett/kildeallowlister når nye
rader og kildeidentiteter allerede er uttrykkelig godkjent.

Før retting skal agenten dokumentere uavhengig baseline-, kilde- og kodebevis:
rettingen må bevare den allerede godkjente forsikringsbetydningen, verdiene,
produkt-/variantscope, selection, mapping, dokumentprioritet og komplett provenance.
En baseline-forskjell alene beviser ikke at en test er feil. Ingen produksjonsendring
er tillatt under denne harnessfullmakten. Bevar negative kontroller, streng
sammenligning og eksplisitte forventninger; ikke svekk tester, fjern assertions,
hopp over testfiler eller utled forventningene fra kandidaten.

Nytt separat fremtidig regnskap: HARNESS_AUTONOMY_V1.
Startforbruk 0/12; maks 6 uavhengige røtter per autorisert scope og 12 totalt
under denne fullmakten. Tell faktisk utførte røtter én gang med før/etter-bevis.
Historisk rapporterte tellere og diagnostikkampanjens 19/12 beholdes uendret;
dette er ingen nullstilling eller retroaktiv omføring. Kontroller ferske
receipts/checkpoint før du oppgir øvrige historiske tall som verifisert.

Ved oppbrukt ny ramme: samle alle trygt diagnostiserbare funn i én rapport og
be om én konkret avgrenset beslutning. Nye semantiske, selection-, mapping-,
canonical-, engine- eller source-admission-røtter, kildekonflikter og uforklarte
integritetsavvik krever fortsatt stopp før retting. Et checksumavvik må forklares
før en checksum oppdateres; ikke regenerer bevis for å skjule ukjent endring.

Etter tillatt retting: kjør målrettede tester og fortsett automatisk gjennom
allerede autoriserte gater. Samle resterende testfeil med fullsuite og komplett
remedieringsutvalg der dette er teknisk forsvarlig, uten å rette uautoriserte røtter.
Publisering krever fortsatt alle gjeldende gater, kontrollert exit-status,
checksums, eksakt staged-sett og arbeidsdiff/staged diff --check. Bruk etablert
sikret publish.py der scopet krever det. Ingen gatefeil kan passeres til commit/push.

Denne fullmakten utvider ikke eksisterende commit/push- eller deploymyndighet.
Fortsett bare allerede autoriserte scopes; et read-only scope forblir read-only.
Agenten skal lese denne seksjonen ved neste oppstart eller videreføring og føre
nye HARNESS_AUTONOMY_V1-røtter varig i Git sammen med scopets auditbevis.

## Aktiv fullmakt: autonom gjennomføring

Eksplisitt aktivert av brukeren under B-051 Helsehjelp, etter de tre navngitte
harnessrettingene og historisk HARNESS_AUTONOMY_V1 33/12 (Helsehjelp3/6).
[Fullmakt og separat logg](../audit/checkpoints/b051-health-help-732b4cc/autonomous-workflow-authorization.json).
Denne stående fullmakten erstatter krav om stopp ved hver ny mekanisk test-, skript-
eller auditfeil og oppbrukt mekanisk kvote som stoppgrunn. Historiske policyversjoner,
tellere og unntak bevares i Git og tidligere auditpakker; de gir ingen ny produksjonsfullmakt.

Innen en ellers eksplisitt autorisert bolk håndterer agenten rutineavgjørelser og
beviste mekaniske rettinger selvstendig: egne kode-/test-/fixture-/skript-/generatorfeil,
syntaks, variabelbindinger, serialisering, felttilstedeværelse, linjeskift, lenkekontekst
og tilsvarende representasjonsfeil. Foreldede snapshots/fingerprints kan oppdateres bare
når den eksakte differansen følger av godkjent produksjonsendring. Eksisterende
valideringsverktøy kan tilpasses aktuell revisjon. Dette utvider ikke godkjent
forsikringsbetydning, kundevalg, produkt-/signatursett eller fil-/produksjonsscope.

Før retting: dokumenter uavhengig kontraktbevis fra originalkilder, baseline, etablert
representasjon eller tidligere eksplisitt beslutning. Kandidaten alene er ikke fasit.
Bevar kildebetydning, dokumentprioritet, selection, full provenance, isolasjon og
immutable historiske receipts/auditpakker. Ikke svekk assertions, hopp over tester eller
fjern negative kontroller. Gjenbruk etablerte helpers/verktøy; unngå nye generatorer og
kopiering av gamle auditpakker der eksisterende verktøy dekker behovet.

Nye mekaniske rettinger føres én gang per uavhengig rot i en separat varig logg uten
numerisk stoppkvote, med før/etter, begrunnelse, bevis og relevante nye kontroller.
Ikke belast, nullstill eller omskriv historiske budsjetter. Diagnostiser, rett,
revalider berørte kontrakter og fortsett automatisk gjennom allerede autoriserte
sluttgater uten rutinespørsmål. Eksisterende fullgate-, receipt- og publish.py-krav gjelder.

Stopp berørt arbeid ved ny/usikker forsikringsbetydning, motstridende kilder,
ny canonical-/mapping-/selection-kontrakt, scopeutvidelse, endring i sikkerhet/personvern/
tilgang/kundedatahåndtering, omskriving av historiske bevis eller uavklart integritetsavvik.
En feil uten mekanisk bevis må ikke behandles som mekanisk. Ved gjentatt feil uten ny
fremdrift: samle diagnosen og rapporter konkret manglende beslutning eller tilgang;
ingen ubegrenset rettingssløyfe. Uavhengig, allerede autorisert arbeid kan fortsette når
isolasjon er dokumentert. Samle nødvendige beslutninger i én konkret rapport.

Denne fullmakten gjelder også fremtidige eksplisitt autoriserte bolker. En foreslått
eller NOT_AUTHORIZED-bolk er fortsatt ikke godkjent. Commit/push krever eksplisitt
publiseringsfullmakt og komplett PASS, checksums, eksakt staged-sett, kontrollert
exit-status og begge diffkontroller. Ingen deployfullmakt eller bakgrunnsorkestrering.
