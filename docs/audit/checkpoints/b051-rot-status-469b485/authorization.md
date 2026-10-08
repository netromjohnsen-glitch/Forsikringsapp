B-051 RÅTESTATUS — AUTORISERT AVGRENSET SELECTION-/MAPPINGRETTING

Les AGENTS.md, gjeldende autonom workflow, prosjektstatus
og hele beslutningspakken:

/workspace/preflight/b051-rot-status-43a7ae5/decision-report.md

Les også pakkens eksakte foreslåtte diff, prober,
kompatibilitetsinventar og integritetsgrunnlag.

REVISJONSAVSTEMMING

Testet preflightbaseline:
43a7ae5b00b533f89b13f0dfb1b43cba83cf5de6

Sist observerte remote:
469b4851a3a65066431fa4d3d31f3419680d63d5

Verifiser faktisk HEAD, origin/main og remote main.
Les alle mellomliggende endringer og gjeldende agentinstruksjoner.
Oppdater arbeidsgrunnlaget trygt uten å overskrive arbeid.
Revalider kandidat og isolasjon mot fersk baseline før skriving.
Ikke bruk gamle minneprober som sluttgatebevis.

AUTORISERT SIGNATUR OG KONTRAKT

6af32d21acb9584c:
- Hus: GAP-2101 / SF-3012.
- Hus Pluss: GAP-2160 / SF-3099.
- Provider Gjensidige, scope ordinary.
- Eksisterende nøkkel hus.rate.dekning.
- Eksisterende tillegg gjensidige-hus-rate-insekter.

Autoriser akkurat den dokumenterte selection-/mappingrettingen.
Ingen ny canonical nøkkel, ekstraksjonsschema eller generell
negativ tekstregel.

1. PRODUKSJONSFULLMAKT

Tillatte produksjonsfiler:
- lib/gjensidige-hus-catalog.ts
- lib/coverage-status.ts
- lib/catalog-enrichment.ts
- lib/manual-agreement.ts
- lib/catalog-product-comparison.ts

Bruk beslutningspakkens eksakte kandidat som utgangspunkt.

Autoriser:
- Strukturert utilgjengelig Standard-base.
- Eksplisitt selectionEvidenceKeys for eksisterende råtetillegg.
- Internt, termavgrenset assertivitetsflagg.
- Metadataavgrenset aktivering av dette Hus-tillegget.
- Tidlig entydig etikettbinding innen dokumentert scope.
- Bevaring av scoped støtterolle ved gjentatt enrichment.
- Samme selection-grense i kjent manuell katalogmodus.
- Metadataavgrenset produktvisning av optional foran
  utilgjengelig base, med begge tekster og kilder bevart.

Bevar den allerede fullvaliderte råteteksten, egenandel,
skadedyrfakta, Pluss-arv og komplett provenance.

Ingen global prioriteringsendring.
Ingen bred Hus-aktivering uten den autoriserte metadataavgrensningen.
Ingen ubegrunnet etikettbinding eller fuzzy matching.
Ingen andre produksjonsfiler uten separat beslutning.

2. PERMANENTE SEMANTISKE KRAV

Gjensidige Standard:
- Uten tilleggsbevis: unknown, ingen aktivert råtekomponent.
- Eksplisitt valgt: selected og korrekt addon-ID/komponent.
- Eksplisitt avslag: not_selected.
- Motstridende eksplisitt valg: unknown/conflict.
- Bare egenandelsdetalj: etablerer ikke parentvalg.
- General_terms: etablerer ikke kundevalg.
- Gjentatt enrichment: støtte- og katalogvilkår blir ikke
  assertivt dokumentvalg innen rettingens scope.
- Dokumentert kundeverdi og provenance beholder forrang.
- Kjent manuell Standard uten valgt tillegg: unknown.
- Egendefinert manuell modus: ingen katalogimport.

Gjensidige Pluss:
- Kjent produkt beholder etablert inkludert råtedekning.
- Eksplisitt dokumentavslag og konflikt beholder forrang
  etter gjeldende resolverkontrakt.

Produktmodus:
- Standard viser optional råtetillegg.
- Grunnunntaket og dets kilder bevares uten å fremstå included.
- Pluss beholder included.
- Begge tekster og kilder skal overleve aggregasjon.

Test valgets bevaring gjennom gjentatt enrichment.
Hvis addOnIds eller identitet ikke kan bevares innen denne
kandidaten, dokumenter konkret closure-konsekvens før lukking.

3. TESTFULLMAKT

Implementer permanente regresjoner etter rapportens inventar.

Autoriser presise oppdateringer av aktive forventninger som
pinnefester den dokumenterte selected/included-feilen.
Erstatt dem med uavhengige kontraktbaserte forventninger;
ikke fjern assertions eller bruk kandidaten som dynamisk fasit.

Katalogorakler får bare de to dokumenterte metadataendringene.
Bevar full-field-kontroll, negative assertions og alle øvrige felt.
B-020s fingerprints skal ikke endres.

Historiske snapshots, receipts og auditpakker er immutable.
Nye forventninger skal dokumentere hva som er endret og hvorfor.

Test:
- Begge originalbindinger og komplett kildekontrakt.
- Hele statusmatrisen ovenfor.
- Faktisk dokumentpipeline, ikke bare interne canonical-fixtures.
- Dokumentroller, supportingEvidence og gjentatt enrichment.
- Begge manuelle modi.
- Arv, relevante tilleggskombinasjoner og provenance.
- Samme produkt og begge sammenligningsretninger.
- Positive og negative kontroller for metadataavgrensningen.

4. DELT ENDRING OG ISOLASJON

Behandle dette som en separat atomisk selection-/mappingretting,
ikke som en mekanisk katalogjustering.

Revalider inventeringen av 13 Hus-produkter hos seks selskaper.
Bevis at de fire andre produkt-/nøkkelkombinasjonene som ville
blitt berørt av global prioritering, fortsatt er uendret.

Verifiser på fersk baseline:
- 317 øvrige komponenter.
- 4158 øvrige råfakta.
- Metadata utenfor de to autoriserte endringene.
- 201 øvrige sammenlignbare produkter.

Avstem faktiske denominatorer hvis fersk main har endret dem.
Forklar enhver differanse; ikke tilpass tall for å få PASS.

Hold Smart-kundemodus, Rettshjelp-aliasen, vannmapping,
HTU-konflikten og øvrige holds utenfor.
Dokumenter eventuelle felles avhengigheter uten å rette dem.

5. AUTONOMI OG STOPPGRENSER

Bruk gjeldende stående fullmakt for beviste mekaniske
test-/skript-/auditfeil. Loggfør rotårsaker separat.
Historisk 33/12 bevares uendret.

Ingen skjulte semantiske endringer eller svekkede kontroller.
Stopp berørt arbeid ved:
- Ny kildekonflikt eller usikker forsikringsbetydning.
- Behov for bredere mapping-/selection-/canonical-kontrakt.
- Uforklart kryssproduktendring.
- Integritets- eller regnskapsavvik.

Fortsett uavhengig autorisert arbeid der det er trygt.

6. KOMPLETTE SLUTTGATER

Kjør gjeldende prosjektgater på faktisk kandidat:
- Permanente råtestatusregresjoner og råtekataloggate.
- Relevante tidligere og delte regresjoner.
- Kilde-/bindings-/reverse-audit og kryssproduktisolasjon.
- Komplett faktisk remedieringsmanifest og fullsuite.
- Next typegen, TypeScript og ESLint med lintavstemming.
- Webpack production build og HTTP/PDF-runtime.
- Receipt-, checksum-, lenke-, kandidat- og staged-integritet.
- Arbeidsdiff og staged diff --check, inkludert nye filer.

Bevar alle 60 tidligere receipts, B-020-fakta og samtlige holds.
Lag én kompakt revisjonsbundet bevispakke med henvisninger
til tidligere pakker fremfor kopiering.

7. ORIGINALSIGNATUR OG CLOSURE

Etter den delte rettingens PASS:
revalider 6af32d21acb9584c separat mot begge originalbindinger.

Lukk bare dersom hele originalkravet nå er oppfylt,
inkludert unknown uten valgt tillegg og korrekt tilleggsaktivering.
Minneprober eller bestått delt gate er ikke alene closure-bevis.

Hvis alle originale closure-krav og sluttgater består:
- Opprett én individuell completion-receipt.
- Referer til både katalogrettingen og selection-/mappingbeviset.
- Verifiser 61 unike dokumenterte kampanjesignaturer.
- B-051: 35 fullført / 0 uten completion /
  2 revalideringskandidater / 2 holds.

Hvis krav fortsatt mangler:
behold signaturen OPEN uten kreditt og rapporter eksakt restkrav.

Ingen closure av andre signaturer eller separate funn.
Globalt resolved/open = UKJENT. Ingen P2-kreditt.

8. PUBLISERING

Commit/push av den autoriserte rettingen er tillatt etter komplett
PASS, også hvis et separat originalkrav må forbli åpent.
Rapporter implementeringsstatus og signaturstatus hver for seg.

Følg gjeldende atomiske publish.py-workflow.
Hvis workflowen krever separat commit for delt retting og lokal
closure, følg den uten å blande scopes.

Oppdater checkpoint/prosjektstatus presist.
Avstem remote på nytt umiddelbart før publisering.
Ved nyere endringer: les, avstem og kjør nødvendige berørte
kontroller igjen før push.

Verifiser remote SHA, clean working tree og staged = 0.
Ingen force-push, deploy eller senere bolk.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.