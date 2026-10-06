Implementer og fullfør det avgrensede B-050-rehabiliteringsscopet fra preflighten.

Dette autoriserer produksjonsendringen, de presise testutvidelsene, permanente regresjoner, receipt/checkpoint og commit/push etter komplett PASS.

BASELINE
Forventet HEAD/main:
25fabe1ba0d4c872a6884f15d56be64b7cc67c72

Les AGENTS.md, gjeldende workflow, checkpoint og HARNESS_AUTONOMY_V1.
Verifiser faktisk remote SHA, arbeidskopi, originalbinding og alle 15 tidligere kampanjereceipts.

ENESTE SIGNATUR
c1440948744bfa17 — GAP-2893/SF-4045.

PRODUKSJONSENDRING
I lib/boat-pet-catalog.ts, bare gjensidige-hund-behandling:

Legg til:
Key: dyr.rehabilitering.begrensning
Label: Rehabilitering – begrensninger

Verdi:
«Rehabiliteringen må være gjennomført innen 3 måneder etter at behandlende veterinær har foreskrevet den og skje på veterinærklinikk eller et behandlingssted som behandlende veterinær henviser til.»

Verifiser teksten mot den frosne originalkilden.
Primærkilde: boat-pet:gjensidige:hund:treatment
sourceType: full_terms
PDF-side 8, trykt side 13.
Avsnitt: Erstatningsregler – Rehabilitering (trykt side 13).

Bevar ukjent vilkårsnummer, versjon og ikrafttredelse.
Bevar eksisterende 5 000-grense og dens IPID-provenance.
Alle 13 eksisterende Behandling-rader, 317 øvrige faktakomponenter og katalogmetadata skal være uendret.

SELECTION OG HOLD
Den eksisterende før/etter-statusmatrisen skal bevares.
Dette scopet godkjenner ikke den eksisterende indirekte selection-effekten og autoriserer ingen retting av den.

Ingen register-, normaliserings-, coverage-status-, enrichment-, shared-selection-, schema- eller kildeadmissionendring.
SC-035/SR-031 skal forbli separat, åpent og uendret.

TESTER
Autoriser presise utvidelser i:
tests/remediation-b-050.test.mjs
tests/boat-pet-catalog.test.mjs

- Utvid begge reverse-audits og berørt helper med akkurat den nye raden.
- Behandling går 13 → 14 rader.
- Oppdater de verifiserte differansetallene +8 → +9 og +4 → +5.
- Bevar streng kontroll av alle eksisterende rader og øvrig katalogisolasjon.
- Utvid kildeallowlisten bare for den nye nøkkelen i akkurat Gjensidige Hund Behandling, med Treatment-side 8 og eksakt avsnitt.
- Bevar alle øvrige IPID-krav, særlig rehabiliteringsgrensen.

Tilføy permanente assertions for:
full kildetekst, fullføring innen fristen, friststart ved foreskrivelse, begge stedalternativer, eksakt provenance/sourceType, ikke-assertiv begrensning, uendret grense, dokumentprioritet, taushet, valg/avslag/konflikt, supportingEvidence, ukjent dokumentrolle, manuell produktmodus, samme produkt, begge retninger og provider/Hund/Katt-isolasjon.

Bruk de eksisterende raw source/canonical sources-kontraktene korrekt. Ikke svekk assertions eller bygg forventningene fra kandidaten.

BUDSJETT OG AUTONOMI
Den kildeverifiserte katalograden er godkjent rutineimplementering.
Diagnostikkens semantiske 2/2-ramme skal ikke gjenbrukes eller endres.

De to preflight-identifiserte kompatibilitetsrøttene håndteres under HARNESS_AUTONOMY_V1:
1. Reverse-audit-radsett mangler den godkjente rehabiliteringsraden.
2. Kildeallowlisten mangler dens godkjente kildebinding.

Dokumenter bevis og faktisk forbruk én gang per rot.
Startforbruk er rapportert 0/12; kontroller gjeldende ledger før føring.
Maks 6 røtter i scopet og 12 totalt under denne separate fullmakten.

Andre beviselig mekaniske harnessrettinger innen denne fullmakten kan utføres autonomt etter workflowens krav. Ikke spør om rutinegodkjenning.
Nye forsikrings-, mapping-, selection- eller enginebeslutninger krever fortsatt stopp.

Historisk kampanjeforbruk 19/12 og øvrige historiske tellere bevares. Ingen nullstilling eller retroaktiv omføring.

SLUTTGATER
Kjør alle gjeldende komplette gater på endelig kandidat:
- B-050, kilde-/reverse-audit og nye rehabiliteringsassertions.
- Katalog, provenance, status, dokumentroller, manuell input, enrichment og comparison.
- B-018/B-022/B-071/B-072, shared/Liv-guard og supporting terms.
- Komplett remedieringsmanifest og fullsuite.
- next typegen, TypeScript, ESLint.
- Webpack production build og HTTP/PDF-runtime.
- Receipt-, checksum- og repositoryintegritet.

Rapporter faktiske kommandoer og testantall.

ETTER KOMPLETT PASS
Opprett individuell completion-receipt for bare c1440948744bfa17.
Oppdater checkpoint og verifiser eksakt B-050-sett: 16 originalsignaturer mot 16 dokumenterte kampanjesignaturer, uten duplikater eller manglende bindinger.

Bevar samtlige 15 tidligere receipts.
Rapporter B-050-kampanjens fullføring separat fra SC-035 og samlet pilotstatus.
Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.

Commit/push gjennom sikret publish.py etter checksumkontroll, eksakt staged-sett og arbeidsdiff/staged diff --check.
Enhver påkrevd gatefeil skal hindre publisering.
Verifiser remote SHA og ren arbeidskopi etter push.

Ingen egen deployhandling eller senere produksjonsbolk.

Sluttrapport:
Kildekontrakt, eksakt katalog-/testdiff, uendret statusmatrise, faktisk HARNESS_AUTONOMY_V1-forbruk, sluttgater, receipt, 16-signaturavstemming, commit og repository-status.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED