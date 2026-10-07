IMPLEMENTER B-051 OPPGJØR OG ALDERSFRADRAG

Dette er en eksplisitt implementeringsfullmakt, ikke en ny read-only-preflight. Bruk den siste SOURCE_CLEAR_READY_FOR_AUTHORIZATION-rapportens komplette kildekontrakter, foreslåtte verdier og radspesifikke provenance.

1. PREFLIGHT OG BASELINE

Les AGENTS.md, agentens workflow, gjeldende checkpoint og siste preflight.

Forventet base:
0bcd250944853607a01066c2c9566bed0c7118af

Kontroller faktisk HEAD, origin/main, remote main, arbeidskopi og integriteten til alle 44 dokumenterte signaturer/receipts.

Hvis main har gått videre, undersøk endringene før integrering. Bevar eksisterende arbeid og koordinering med sikkerhetsarbeidet. Ikke overskriv eller inkluder andre oppgavers endringer.

2. EKSAKT AUTORISERT SIGNATURSETT

0f7980d6139daa2e — Førsterisiko og verdiøkning
- Hus: GAP-2111 / SF-3029
- Hus Pluss: GAP-2170 / SF-3116

4971fe7dbeac3649 — Manglende gjenoppføring og rivning
- Hus: GAP-2112 / SF-3030
- Hus Pluss: GAP-2171 / SF-3117

6080e5e5a6bb3c63 — Felles aldersfradragsfritak
- Hus: GAP-2118 / SF-3042
- Hus Pluss: GAP-2177 / SF-3129

ce381a27b7435bec — Eldste ledningsdel ved brudd
- Hus: GAP-2117 / SF-3036
- Hus Pluss: GAP-2176 / SF-3123

Disse er fire selvstendige kildekontrakter. Ikke slå dem sammen til én korreksjonsrot.

3. PRODUKSJONSFULLMAKT

Endre bare åtte eksisterende Standard-rader i:
lib/gjensidige-hus-catalog.ts

- hus.forsikringsform
- hus.gjenoppforing.annetsted
- hus.aldersfradrag.utvendige_ledninger
- hus.aldersfradrag.varmepumpe_luft_luft
- hus.aldersfradrag.oppvarming_vvs
- hus.aldersfradrag.integrerte_hvitevarer
- hus.aldersfradrag.varmekabler_bereder
- hus.aldersfradrag.utvendig_badekilde

Jeg godkjenner preflightens komplette foreslåtte tekster og radspesifikke kildehenvisninger.

Bevar særlig:
- Førsterisikoens avtalte sum og femårsregel.
- 40 %-terskelen og skillet mellom markedsverdi og avkastningsverdi.
- Separat regel om enhver verdiøkning ved annet sted/formål.
- Laveste-beløp-regelen ved manglende reparasjon/gjenoppføring.
- Brukbare materialer ved bestemt rivning/utskiftning og unntaket for uavhengige rivingsutgifter.
- Eldste del ved ulik alder i et ledningsbrudd.
- Alle eksisterende satser, frie år, maksimum og reparasjonsunntak.
- Fullverdi-, brann- og naturskadefritakene med komplette kvalifikasjoner.
- Forsikringsbevisets forrang og Pluss-arven.

Tilføy de tre godkjente fritakene i structuredValue.exceptions på alle seks aldersfradragsrader. Bevar eksisterende unntak først, i eksisterende rekkefølge. Øvrige structuredValue-felter skal være uendret.

Ingen nye rader, canonical keys, kundeverdier, sourceType-felter eller endringer i engine, mapping, schema, selection eller kildeadmission.

4. KILDER OG PROVENANCE

Verifiser de frosne bytes og komplette originalavsnitt:

Standard:
d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc

Pluss:
79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792

Bruk Standard PDF-side 16–17 og kontroller den identiske Pluss-kontrakten på PDF-side 17–18.

Bevar preflightens eksakte avsnittshenvisninger, inkludert rivningsavsnittets fortsettelse på side 17. Ingen global sideforskyvning eller oppfunnet versjon/ikrafttredelse.

5. AUTORISERTE TEST- OG AUDITOPPDATERINGER

Opprett:
tests/remediation-b-051-settlement-age.test.mjs

Jeg autoriserer også de presise, forhåndsbeskrevne kompatibilitetsoppdateringene i:
- tests/nito-remediation-b020.test.mjs
- tests/gjensidige-hus-catalog.test.mjs
- tests/remediation-b-050.test.mjs
- tests/remediation-b-051.test.mjs
- tests/remediation-b-051-garden.test.mjs
- tests/remediation-b-051-events-buildings.test.mjs
- tests/remediation-b-051-craftsmanship.test.mjs

Bygg forventningene uavhengig fra baseline, originalkildene og de åtte autoriserte transformasjonene. Kandidaten skal ikke brukes som dynamisk fasit.

Fingerprintoppdateringer krever eksakt differansebevis først. Bevar alle tidligere transformasjoner og strenge full-field-kontroller.

Historiske auditpakker, receipts, logger, snapshots og checksums er immutable. Opprett en ny revisjonsbundet auditpakke:
docs/audit/checkpoints/b051-settlement-age-0bcd250/

Kontroller eksplisitt de dokumenterte representasjonskontraktene:
- replacesBase på råfacts og overriddenBase på enriched terms.
- raw productCode: undefined versus utelatt felt i JSON.
- source-only-input versus ordnet pipeline-sources.
- Registrert sourceType: undefined.
- Manuell note: undefined og eksisterende supplerende noter.
- Egendefinert catalogReference: null.
- Baselinebeviste overganger ved gjentatt enrichment.

Ikke svekk negative kontroller eller fjern felt for å oppnå PASS.

6. ISOLASJON OG REGRESJONER

Bevis at bare de åtte godkjente radene er endret:
- 317 øvrige komponenter.
- 4150 øvrige råfakta.
- 202 øvrige produkters effektive fakta.
- All øvrig katalogmetadata.
- B-020s skadedyrfakta og tidligere B-051-kontrakter.

Test begge produkter, kundeverdi/provenance, taushet, ukjent-sentinel, valg, avslag, konflikt, dokumentroller, supporting terms, begge manuelle modi, gjentatt enrichment, samme produkt og begge sammenligningsretninger.

Ingen ny kundevalgs- eller parent-status skal utledes.

7. BUDSJETT OG STOPPGRENSER

HARNESS_AUTONOMY_V1 står på 20/12. Ingen ny korreksjonskapasitet eller budsjettutvidelse autoriseres.

Kildegodkjent implementering, korrekte nye assertions og de uttrykkelig forhåndsgodkjente kompatibilitetsoppdateringene er planlagt scopearbeid.

Nye feilaktige assertions eller andre uventede korreksjonsrøtter skal diagnostiseres og rapporteres samlet før retting. Ikke omklassifiser dem som planlagt arbeid, dobbelttell kjente røtter eller nullstill tellere.

Stopp ved kildekonflikt, endret forsikringsbetydning, integritetsavvik eller behov for uautorisert produksjonsendring.

8. KOMPLETT SLUTTGATE

Kjør:
- Ny målrettet gate og kilde-/bindings-/reverse-audit.
- B-007/B-020/B-050/B-051/B-071 og relevante katalogregresjoner.
- Status, normalisering, provenance, dokumentprioritet, supporting terms, enrichment, manuelle modi og comparison.
- Komplett faktisk remedieringsmanifest og fullsuite.
- next typegen og TypeScript.
- ESLint, med separat rapportering av eventuelle nye warnings.
- Webpack production build.
- HTTP/PDF-runtime.
- Receipt-, checksum-, lenke- og repositoryintegritet.
- Arbeidsdiff, staged diff og eksakt staged-sett.

Ikke bruk historiske PASS-resultater som kandidatens sluttvalidering.

9. COMPLETION OG PUBLISERING

Etter komplett PASS:
- Opprett fire individuelle completion-receipts.
- Oppdater checkpoint, eksakt kampanjesett og kompakt prosjektstatus.
- Bevar alle 44 tidligere receipts og samtlige holds.
- Verifiser forventet sett på 48 unike dokumenterte signaturer og B-051s nye partisjon.
- Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.
- Commit og push atomisk gjennom sikret publish.py.
- Verifiser faktisk remote SHA og arbeidskopi etter push.

Ingen deploy eller neste produksjonsbolk autoriseres.

Sluttrapporten skal oppgi faktisk revisjon, endringer, ferske gater, isolasjon, receipts, budsjett og eventuell minste gjenværende beslutning.
