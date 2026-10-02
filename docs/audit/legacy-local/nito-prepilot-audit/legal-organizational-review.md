# Legal / organizational review queue

Dette dokumentet inneholder bare spørsmål kode ikke kan avgjøre. Det er ikke juridisk rådgivning eller ferdig GDPR-dokumentasjon.

## Juridisk/personvern

1. Fastsett behandlingsansvarlig, databehandler og eventuelle felles roller for NITO-piloten.
2. Dokumenter behandlingsgrunnlag per aktivitet: dokumentanalyse, AI-overføring, driftslogger og fremtidig feedback.
3. Gjennomgå personverninformasjon: formål, datakategorier, mottakere, AI, lagring, rettigheter og kontakt.
4. Verifiser DPA/databehandleravtaler, subprocessors, behandlingsregion og overføringsmekanismer for Railway og OpenAI.
5. Godkjenn retention/deletion for requestdata, vendor safety/access logs og eventuelt feedback.
6. Vurder denne DPIA-screeningen og avgjør om full DPIA er nødvendig.
7. Avklar prosess for innsyn, retting, sletting, begrensning og hvor data kan finnes når appen er ephemeral.
8. Avklar forsikringsdistribusjons-/rådgivningsgrensen; verktøyet er beslutningsstøtte og krever menneskelig kildekontroll.
9. Personforsikring krever separat vurdering av særlige kategorier, tilgang, minimization, retention og DPIA før dokumenter aksepteres.

## Organisasjon/drift

1. Navngi pilot owner, technical incident owner, privacy contact, advisor support og feedback triage owner.
2. Kartlegg hvem som kan lese Railway/GitHub/OpenAI config, secrets, logs og deploye; fjern overflødig tilgang.
3. Bestem rådgiver-onboarding/offboarding, kodehåndtering, hele-pilot-revokering og shared-workstation-regler.
4. Verifiser Railway edge rate limit, body limit, log/body capture, log/temp retention, backups and rollback.
5. Etabler hendelsesvurdering og vendor-incident-escalation. Kryssbrukerdata er umiddelbar pilotstopp.
6. Skill vanlig feedback, correctness bug og security/privacy incident i rådgiverinstruksen.
7. Definer pilotens start, review point, stop conditions, scope og endringskommunikasjon.
8. Bekreft at pilot scope er supported skadeforsikring; ingen personforsikring, offentlig B2C eller automatisert salg.
