B-051 SKADEDYR OG ØVRIGE SKADEUNNTAK — IMPLEMENTER AUTORISERT BOLK

Dette autoriserer implementering av siste preflights eksakte to-signaturforslag.

1. BASELINE

Les AGENTS.md, workflow, checkpoint og komplett siste preflight.

Forventet base:
0be8fadb7e90fc527cd81c5ae5c89accabb2deb0

Verifiser faktisk HEAD, origin/main, remote main, arbeidskopi og alle 51 dokumenterte signaturer/receipts.

Undersøk eventuelle nye main-endringer før integrering. Bevar parallelt sikkerhetsarbeid og NITO-kartlegging.

2. EKSAKT SIGNATURSETT

a4e5c76df5cbf2af — Riving uten godkjenning
- Hus: GAP-2093 / SF-2999
- Hus Pluss: GAP-2148 / SF-3083

af3a3ee673fedc83 — Øvrige skadeunntak
- Hus: GAP-2094 / SF-3003
- Hus Pluss: GAP-2149 / SF-3086

Kun disse to signaturene kan få nye completion-receipts.

3. PRODUKSJONSFULLMAKT

Jeg godkjenner siste preflights komplette foreslåtte verdier og provenance for fire radkontrakter i:
lib/gjensidige-hus-catalog.ts

Standard — oppdater tre eksisterende rader:
- hus.plutselig.begrensning
- hus.plutselig.begrensning_ovrig
- hus.skadedyr.dyr.bygningsskade

Pluss — tilføy én overstyring på eksisterende key:
- hus.plutselig.begrensning_ovrig
- replacesBase: true

Godkjenningen omfatter uttrykkelig:
- Kildepresis «kondens» fremfor dagens bredere «fukt».
- Garanti-/avtaleunntakets krav om både plikt og økonomisk evne.
- Unntaket for bygningsdeler revet uten Gjensidiges godkjenning.
- Pluss’ separate henvisninger til Råte/skadeinsekter og Håndverks-/entreprenørfeil.

Bevar alle materielle kvalifikasjoner, eksisterende etiketter og kildeidentiteter. Henvisninger til særdekninger skal ikke bli generell dekning eller kundevalg.

Bevar bekjempelsesraden og øvrige gyldige B-020-gnagerfakta.

Ingen ny canonical key, parent, mapping, engine, schema, selection eller kildeadmission.

4. KILDER

Verifiser frosne originalbytes:

Standard:
d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc

Pluss:
79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792

Verifiser også eksisterende IPID mot manifestet der denne brukes som støtte.

Kontroller komplette avsnitt og kolonner på PDF3–4, Pluss-krysshenvisninger på PDF5–6 og Standard-utvidelsens IPID-grunnlag.

Bruk preflightens eksakte primær- og supplerende referanser. Ikke oppfinn sourceType, versjon eller ikrafttredelse.

5. PLANLAGTE TESTOPPDATERINGER

Opprett:
tests/remediation-b-051-physical-exclusions.test.mjs

Autoriser de konkret beskrevne kompatibilitetsoppdateringene i:
- tests/nito-remediation-b020.test.mjs
- tests/gjensidige-hus-catalog.test.mjs
- tests/remediation-b-050.test.mjs
- tests/remediation-b-051.test.mjs
- tests/remediation-b-051-garden.test.mjs
- tests/remediation-b-051-events-buildings.test.mjs
- tests/remediation-b-051-craftsmanship.test.mjs
- tests/remediation-b-051-settlement-age.test.mjs
- tests/remediation-b-051-recovery-benefits.test.mjs

Bygg forventningene uavhengig fra originalkilder og baseline:
tre eksplisitte Standard-transformasjoner og én Pluss-innsetting.

Kontroller tidligere verdi, identitet og provenance før transformasjon. Kandidatoutput er ikke fasit.

Bevar strenge full-field-kontroller, tidligere kildeorakler, negative kontroller og historiske immutable auditpakker.

Fingerprintoppdateringer krever eksakt differansebevis først.

6. PERMANENTE REGRESJONER OG ISOLASJON

Test komplette verdier, fire produktbindinger, provenance, Pluss-overstyring/arv, dokumentprioritet, valg/avslag/konflikt, dokumentroller, supporting terms, begge manuelle modi, gjentatt enrichment og begge sammenligningsretninger.

Bevar skillet mellom:
- Raw replacesBase og enriched overriddenBase.
- Raw undefined-felter og JSON-representasjon.
- Source-only-fixtures og pipeline-sources.
- Katalogmodus og egendefinert catalogReference: null.

Verifiser:
- 316 øvrige komponenter uendret.
- 4155 eksisterende råfakta utenfor de tre endrede Standard-radene uendret.
- Totalen øker fra 4158 til 4159 bare gjennom Pluss-overstyringen.
- Metadata og 202 øvrige produkters effektive fakta uendret.
- Alle 51 tidligere receipts, B-020-kontrakter og holds bevart.

7. SEPARAT RÅTESTATUSFUNN

Baselinefunnet om selected for Standard-råte uten valgt tillegg er utenfor denne fullmakten.

Dokumenter det som separat funn med revisjons- og reproduksjonsreferanse. Ikke rett det, skjul det, før det som løst eller bruk disse to completion-receiptene som bevis på at råtestatus er korrekt.

Hvis implementeringen viser at bolken ikke kan isoleres fra dette funnet, stopp og rapporter den konkrete avhengigheten.

8. KOMPAKT BEVISPAKKE

Opprett:
docs/audit/checkpoints/b051-physical-exclusions-0be8fad/

Bruk siste preflights kompakte oppsett:
- Fullmakt, bindinger og kildeorakel.
- Én kontrollert baseline-representasjon.
- Eksakt full-field-delta og uavhengig forventningsbygger.
- Kommando-/testmanifest, komprimerte logger og resultatoversikt.
- To individuelle receipts etter PASS.
- Revisjons-/hashreferanser til tidligere immutable bevis fremfor kopierte rålogger.
- Checksums, lenke-, kandidat- og staged-manifestkontroll.

Kontroller nye/untracked filer for LF og trailing whitespace før publiseringsfasen.

Eventuelle logger som gjengir ugyldig whitespace lagres tapsfritt kodet med originalhash og round-trip-kontroll. Bevar korrekt originalkontekst for arkiverte relative lenker.

9. BUDSJETT

HARNESS_AUTONOMY_V1 forblir 24/12 uten ny kapasitet.

Godkjent kildeimplementering, korrekte nye assertions og de forhåndsbeskrevne kompatibilitetsoppdateringene er planlagt scopearbeid.

Nye korreksjonsrøtter krever diagnose og stopp før retting. Ingen budsjettutvidelse, nullstilling eller historisk omføring autoriseres.

Lintopprydding er fortsatt utenfor.

10. SLUTTGATER OG PUBLISERING

Kjør ferskt på endelig kandidat:
- Ny gate, kilde-/bindings-/reverse-audit.
- B-007/B-020 og relevante B-050/B-051/B-071-regresjoner.
- Status, normalisering, provenance, supporting terms, enrichment, manuell input og comparison.
- Komplett faktisk remedieringsmanifest og fullsuite.
- next typegen og TypeScript.
- Full ESLint med dokumentert warning-differanse.
- Webpack production build.
- HTTP/PDF-runtime.
- Receipt-, checksum-, lenke- og repositoryintegritet.
- Eksakt staged-sett og begge diffkontroller.

Etter komplett PASS:
- Opprett to individuelle completion-receipts.
- Oppdater checkpoint og kompakt prosjektstatus.
- Verifiser 53 unike dokumenterte kampanjesignaturer.
- Verifiser B-051: 27 fullført, 8 kandidater, 2 revalideringskandidater og 2 holds.
- Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.
- Commit og push atomisk gjennom sikret publish.py.
- Verifiser faktisk remote SHA og arbeidskopi etter push.

Ingen deploy eller senere produksjonsbolk autoriseres.
CATALOG_PILOT_GATE forblir REMEDIATION_REQUIRED.