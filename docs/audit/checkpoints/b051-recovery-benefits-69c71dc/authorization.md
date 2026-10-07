B-051 — IMPLEMENTER NATURSKADEOPPGJØR, PÅBUD OG RULLESTOLTILPASNING

Dette er eksplisitt implementeringsfullmakt for siste preflights foreslåtte bolk.

1. BASELINE

Les AGENTS.md, workflow, gjeldende checkpoint og den komplette siste preflighten.

Forventet base:
69c71dcc48258ba52f33a77a54126f1f065d7d7c

Verifiser faktisk HEAD, origin/main, remote main, arbeidskopi og alle 48 dokumenterte signaturer/receipts.

Hvis main har gått videre, undersøk endringene og integrer bare når isolasjon er bevist. Ikke overskriv eller inkluder sikkerhetsarbeidets endringer.

2. EKSAKT AUTORISERT SCOPE

292dacd4533926fd — Naturskadeoppgjør
- Hus: GAP-2119 / SF-3045
- Hus Pluss: GAP-2178 / SF-3132
- hus.naturskade.dekning

b3b964a9c6105360 — Rullestoltilpasning
- Hus: GAP-2098 / SF-3007
- Hus Pluss: GAP-2157 / SF-3094
- hus.tilpasning.grense

ed99577218e2302b — Offentlige påbud
- Hus: GAP-2120 / SF-3046
- Hus Pluss: GAP-2179 / SF-3133
- hus.pabud.dekning

Jeg godkjenner siste preflights tre komplette foreslåtte katalogverdier og eksakte radspesifikke provenance.

Endre bare disse tre eksisterende Standard-radene i:
lib/gjensidige-hus-catalog.ts

Bevar etiketter, keys, øvrige referansefelter, metadata, tilleggsmatrise og Pluss-arv.

3. MATERIELLE KILDEKRAV

Naturskade:
Bevar vilkårene for gjenoppføringsnekt, ustabil grunn, totalskade og tomteerstatning. Fem dekar gjelder bare den kildebestemte bolighus-/fritidshusgrenen. Bevar skriftlig samtykke, nødvendig sikringsnivå og selskapets ansvar for ettersyn og vedlikehold.

Rullestoltilpasning:
Bevar nødvendighetskravet og ulykkestilfelle/medfødt funksjonsnedsettelse som uttrykkelige alternativer.
Kontroller de forskjellige tiårsstartpunktene.
Tjueårsfristen gjelder bare den medfødte grenen.
Bevar samlet grense på 250 000 kr også ved både Hus og Innbo, samt alle kildebestemte unntak.
Ikke innfør en ny tilpasning-parent eller kundevalgsstatus.

Offentlige påbud:
Bevar dekningsmessig skade, nødvendige merutgifter, hjemmel, offentlig finansiering, arealforhold, dispensasjonskrav og alle avgrensninger.
Bevar lekkasjeunntaket for utvendige vann-/kloakkledninger og renseanlegg.

Ikke utled ubetinget tomteerstatning, generell værdekning eller nye kundevalg.

4. KILDER OG PROVENANCE

Verifiser begge frosne SHA-256-hasher:

Standard:
d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc

Pluss:
79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792

Bruk siste preflights eksakte avsnittshenvisninger:
- Naturskade: Standard PDF18; Pluss-kontrakt PDF19.
- Tilpasning: Standard PDF5; Pluss-kontrakt PDF5.
- Påbud: Standard PDF18 med supplerende PDF5; Pluss-kontrakt PDF19 og PDF6.

Bevar eksisterende PDF5-henvisning som supplerende påbudskilde.
Ikrafttredelse forblir ukjent.
Ikke tilføy sourceType i registrert metadata.

5. TESTFULLMAKT

Opprett:
tests/remediation-b-051-recovery-benefits.test.mjs

Jeg autoriserer de syv presist beskrevne kompatibilitetsoppdateringene fra preflighten:
- tests/nito-remediation-b020.test.mjs
- tests/remediation-b-050.test.mjs
- tests/remediation-b-051.test.mjs
- tests/remediation-b-051-garden.test.mjs
- tests/remediation-b-051-events-buildings.test.mjs
- tests/remediation-b-051-craftsmanship.test.mjs
- tests/remediation-b-051-settlement-age.test.mjs

Bruk originalkildene, eksisterende frosne snapshots og tre eksplisitte radtransformasjoner som uavhengig forventningsgrunnlag.

Kontroller tidligere verdi, identitet og provenance før transformasjon.
Kandidatoutput skal ikke brukes som forventningsfasit.
Fingerprintoppdateringer krever eksakt tre-rads-differansebevis.

Bevar tidligere bolkers egne kildeorakler, negative kontroller, status, konflikt, provenance og full-field-sammenligninger.

Historiske auditpakker, receipts, logger og checksums skal ikke omskrives.

6. REPRESENTASJON OG ISOLASJON

Bruk de baselinebeviste kontraktene fra preflighten:
- Naturskade/påbud er coverage; tilpasning er term.
- Ingen nye replacesBase eller rå overriddenBase.
- Gjentatt enrichment har dokumenterte representasjons- og coverageOrigin-overganger.
- Rettshjelp-aliasovergangen er uendret.
- Source-only-fixtures og pipeline-sources testes i riktig lag.
- undefined-felter kontrolleres separat fra JSON-serialisering.
- Kjent manuell katalogmodus og egendefinert modus holdes adskilt.

Bevis kundeverdiens forrang, valg/avslag/konflikt, dokumentroller, supportingEvidence, arv, tillegg, samme produkt og begge sammenligningsretninger.

Kontroller at følgende er uendret:
- 317 øvrige komponenter.
- 4155 øvrige råfacts.
- 202 øvrige produkters effektive fakta.
- Øvrig metadata, B-020-skadedyr og tidligere B-051-rader.
- Alle 48 tidligere receipts og samtlige holds.

7. BUDSJETT OG AVGRENSNING

HARNESS_AUTONOMY_V1 forblir 20/12.
Ingen ny korreksjonskapasitet eller generelt unntak autoriseres.

Kildeimplementeringen, korrekte nye assertions og de uttrykkelig forhåndsgodkjente kompatibilitetsoppdateringene er planlagt scopearbeid.

Uventede korreksjonsrøtter skal diagnostiseres og rapporteres samlet før retting. Ikke kamufler nye feil som planlagt arbeid eller nullstill tellere.

Ingen engine-, canonical-, mapping-, selection-, schema- eller kildeadmissionendring inngår.

protectedCount-warningen holdes som separat oppryddingssak og skal ikke rettes i denne bolken.

8. KOMPLETT SLUTTVALIDERING

Kjør ferskt på endelig kandidat:
- Ny gate, seks originalbindinger og komplette kildeavsnitt.
- Begge kildehasher, kildeaudit og ny revisjonsbundet reverse-audit.
- B-007/B-020/B-050/B-071 og alle berørte B-051-gater.
- Status, normalisering, provenance, supporting terms, enrichment, dokumentprioritet, manuelle modi og comparison.
- Samme produkt, begge retninger og provider-/variantisolasjon.
- Komplett faktisk remedieringsmanifest og fullsuite.
- next typegen før TypeScript.
- Full ESLint med dokumentert warning-differanse.
- Webpack production build.
- HTTP/PDF-runtime.
- Receipts, checksums, historikk og repositoryintegritet.
- Begge diffkontroller og eksakt staged-sett.

Gamle gate-resultater eller auditkjøring mot en annen revisjon validerer ikke kandidaten.

9. RECEIPTS OG PUBLISERING

Opprett ny bevispakke:
docs/audit/checkpoints/b051-recovery-benefits-69c71dc/

Etter komplett PASS:
- Opprett tre individuelle completion-receipts.
- Oppdater checkpoint og kompakt prosjektstatus.
- Verifiser 51 unike dokumenterte kampanjesignaturer.
- Verifiser B-051-partisjonen: 25 fullført, 10 kandidater, 2 revalideringskandidater og 2 holds.
- Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.
- Bevar historiske tellere og alle tidligere receipts.
- Commit og push atomisk gjennom sikret publish.py.
- Verifiser faktisk remote SHA og arbeidskopi etter push.

Ingen deploy eller neste produksjonsbolk autoriseres.

Rapporter kort faktisk endring, ferske gater, isolasjon, budsjett, receipts og repositorytilstand.
CATALOG_PILOT_GATE forblir REMEDIATION_REQUIRED.
