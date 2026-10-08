B-051 MANUELT RÅTEVALG — AUTORISERT AVGRENSET IMPLEMENTERING

Les AGENTS.md, gjeldende autonom workflow, prosjektstatus
og hele preflightpakken:

/workspace/preflight/b051-manual-rot-choice-2a2d0fc/

Bruk decision-report.md, matrix.json og
simulated-production.diff som revisjonsbundet grunnlag.

Forventet baseline:
2a2d0fc2b38897037f1f12d5b7627a2ffbaf0382

Verifiser faktisk HEAD, origin/main og remote main.
Avstem nyere endringer uten å overskrive arbeid.
Revalider berørte kontrakter hvis baseline har flyttet seg.

AUTORISERT SCOPE

6af32d21acb9584c:
- Hus: GAP-2101 / SF-3012.
- Hus Pluss: GAP-2160 / SF-3099.
- Tillegg: gjensidige-hus-rate-insekter.
- Nøkkel: hus.rate.dekning.

Autoriser akkurat preflightens manuelle valgvidereføring
og tilhørende presentasjonskontroll.

1. PRODUKSJONSFULLMAKT

Tillatte produksjonsfiler:
- lib/manual-agreement.ts
- lib/catalog-enrichment.ts
- lib/comparison.ts

Implementer minste komplette diff fra preflighten:

manual-agreement.ts:
- Opprett internt, produktbundet manuelt valgbevis bare
  fra brukerens eksplisitte tilleggsvalg.

catalog-enrichment.ts:
- Viderefør bare strengt validert manuelt valg.
- Bevar addon-ID, riktig komponent og valggrunnlag.
- Bevar eksisterende dokumentprioritet og komplette
  provenancenoter gjennom gjentatt enrichment.

comparison.ts:
- Bruk eksisterende selectionEvidenceKeys for det
  autoriserte tilleggets navneliste.
- Tilleggsnavnet skal ikke presenteres som valgt ved
  eksplisitt avslag eller konflikt.
- Bevar negative/ukjente fakta og kilder i relevante
  detaljvisninger; ikke skjul dem som følge av navnefiltrering.

Ingen nye canonical-nøkler, tekstaliaser, ekstraksjonsschema
eller generell selection-regel.
Ingen øvrige produksjonsfiler eller utvidelse til andre
tillegg uten separat beslutning.

2. VALGBEVIS OG PRIORITET

Valgbeviset skal være bundet til riktig provider,
produkt og eksisterende tillegg etter preflightens kontrakt.

Valget skal aldri rekonstrueres bare fra:
- addOnIds eller tilleggsnavn uten gyldig valggrunnlag.
- Positiv katalogtekst.
- coverageOrigin: catalog.
- Produktbekreftelse.
- Egenandelsdetalj.
- General_terms eller supportingEvidence.

Valider at feil produkt, ukjent tillegg, ugyldig eller
ufullstendig markør ikke etablerer valg.
Ikke behandle en kopiert intern markør som nytt dokumentbevis.

Bevar gjeldende prioritet:
- Dokumentert avslag overstyrer manuelt positivt valg.
- Dokumentkonflikt forblir unknown/conflict.
- Dokumentert kundeverdi og provenance beholder forrang.

Når tillegget avkrysses av og nytt input normaliseres:
ingen addon-ID eller videreført manuelt valg.
Gammelt valg skal ikke gjenoppstå.

3. PERMANENTE REGRESJONER

Oppdater etter preflightens presise inventar:
- tests/remediation-b-051-rot-status.test.mjs
- tests/manual-runtime-flow.test.mjs

Bruk uavhengige kontraktbaserte forventninger.
Bevar full-field-kontroller og negative assertions.

Test alle fire stadier fra preflightmatrisen:
- Eksplisitt manuelt valgt Standard-tillegg.
- Standard uten valg.
- Dokumentert valg, avslag og konflikt.
- Manuellt valg sammen med dokumentavslag/konflikt.
- Pluss inkludert.
- General_terms og bare egenandel.
- Avkrysset av og input sendt på nytt.
- Begge manuelle modi.
- Gjentatt enrichment.
- Kundeverdi og komplett provenance.
- Samme produkt og begge sammenligningsretninger.
- Tilleggsnavn kontra canonical-status.
- Ugyldig eller feilbundet manuelt valgbevis.

Bruk faktisk normalisering og dokumentpipeline.
Interne fixtures alene er ikke tilstrekkelig bevis.

Ingen fingerprint- eller reverse-audit-oppdatering er
forhåndsautorisert; preflighten påviste ikke behov.
Hvis nye kollisjoner oppstår, undersøk rotårsaken.
Ikke oppdater forventninger bare for å få PASS.

Historiske snapshots, receipts og auditpakker er immutable.

4. ISOLASJON OG AUTONOMI

Verifiser preflightens isolasjon på faktisk kandidat:
- 203 andre produktavtaler.
- 157 gyldige andre tilleggsavtaler.
- 202 materialiserte produkter.
- B-020-fakta og fingerprints uendret.

Avstem faktiske denominatorer mot fersk baseline.

Bevar publisert råtetekst og råtestatusretting.
Smart, Rettshjelp-aliasen, vannmapping, HTU-konflikten,
revalideringskandidatene og øvrige holds er utenfor scope.

Bruk gjeldende stående fullmakt for beviste mekaniske
verktøy-/testrettinger, med separat rotårsakslogg.
Historisk 33/12 bevares uendret.

Stopp berørt arbeid ved ny semantisk usikkerhet,
utvidet selection-/mappingbehov eller integritetsavvik.
Ingen svekkede assertions eller skjulte kontraktendringer.

5. KOMPLETTE SLUTTGATER

Kjør på faktisk implementert kandidat:
- Permanente manuelle flyt- og råtestatusregresjoner.
- Råtekataloggate og relevante tidligere regresjoner.
- Kilde-/bindings-/reverse-audit og kryssproduktisolasjon.
- Komplett faktisk remedieringsmanifest og fullsuite.
- Next typegen, TypeScript og ESLint med lintavstemming.
- Webpack production build og HTTP/PDF-runtime.
- Receipt-, checksum-, lenke-, kandidat- og staged-integritet.
- Arbeidsdiff og staged diff --check, inkludert nye filer.

Bevar alle 60 tidligere completion-receipts og samtlige holds.
Lag én kompakt revisjonsbundet bevispakke med henvisninger
til tidligere pakker.

6. SIGNATURREVALIDERING OG CLOSURE

Etter implementerings-PASS:
revalider begge originalbindingene for 6af32d21acb9584c.

Kontroller hele originalkontrakten, inkludert:
- Standard uten valgt tillegg gir unknown.
- Dokumentert og manuelt valgt tillegg aktiveres korrekt.
- Manuelt valg og addon-ID bevares gjennom gjentakelse.
- Dokumentavslag og konflikt beholder forrang.
- Pluss inkludert og produktmodus fungerer korrekt.
- Kildebetydning og provenance er komplett bevart.

Hvis alle closure-krav og sluttgater består:
- Opprett én individuell completion-receipt.
- Referer til katalogretting, statusretting og manuell retting.
- Verifiser 61 unike dokumenterte kampanjesignaturer.
- B-051: 35 fullført / 0 uten completion /
  2 revalideringskandidater / 2 holds.

Hvis noe gjenstår:
behold signaturen OPEN uten kreditt og rapporter eksakt restkrav.
Ingen endring av originalkrav for å muliggjøre closure.

Globalt resolved/open = UKJENT. Ingen P2-kreditt.
Ingen closure av andre funn eller signaturer.

7. PUBLISERING

Commit/push av autorisert retting etter komplett PASS er tillatt.
Følg gjeldende atomiske publish.py-workflow og eventuell
separasjon mellom delt retting og lokal closure.

Oppdater checkpoint/prosjektstatus presist.
Avstem remote umiddelbart før publisering.
Revalider berørte kontroller ved nyere endringer.

Verifiser remote SHA, clean working tree og staged = 0.
Ingen force-push, deploy eller senere bolk.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.