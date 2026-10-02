# NITO pilot – manuell sjekkliste før første ekte kunde

Målversjon: `d3a37985fce4ada65fa2f7a88462d8834e4677af`

## Obligatorisk før ekte kundedata

- [ ] Målcommit er deployet og Railway viser ACTIVE / Deployment successful.
- [ ] Produksjons-HTTPS, 401-beskyttelse og no-store er smoke-testet.
- [ ] Edge-rate-limit for pilotinnlogging og analyse er dokumentert og testet lavvolum.
- [ ] Gateway body limit er maksimalt 25 MiB.
- [ ] Kun navngitte rådgivere har pilotkoden; distribusjon og offboarding er dokumentert.
- [ ] Beslutning om delt kode kontra individuelle brukere er godkjent; delte arbeidsstasjoner har logout/close-prosedyre.
- [ ] Railway/GitHub/OpenAI-tilgang og minste privilegium er gjennomgått.
- [ ] Railway logg/body/temp/backup-retention og tilgang er dokumentert.
- [ ] OpenAI data sharing, retention/ZDR/MAM, region, subprocessors og DPA er gjennomgått.
- [ ] Behandlingsansvarlig/databehandlerroller og behandlingsgrunnlag er juridisk vurdert.
- [ ] Pilotens personverninformasjon er juridisk gjennomgått og tilgjengelig.
- [ ] Retention/deletion-policy, data inventory og behandlingsprotokoll er godkjent.
- [ ] DPIA-screening er vurdert av personvern/juridisk ansvarlig.
- [ ] Incident-, vendor-incident-, avviks- og data-subject-request-prosess har navngitte eiere.
- [ ] Pilotens stop conditions og supportkontakt er kjent for alle rådgivere.
- [ ] Rådgiverens quick guide og kjent-begrensninger er tilgjengelig.
- [ ] Safari-smoke med syntetisk data er gjennomført dersom Safari skal brukes.
- [ ] Syntetisk demo av PDF, manual, hybrid, produktmodus, kilde og ny kunde er gjennomført.
- [ ] Production tracing er OFF.
- [ ] Ingen personforsikrings-/helseopplysningsdokumenter tillates.

## Per kundesak

- [ ] Last opp bare nødvendige dokumenter/sider; fjern irrelevante vedlegg.
- [ ] Kontroller «Ikke dokumentert», konflikt, manglende objekt og ufullstendig pris mot originalen.
- [ ] Kontroller viktige fakta og kilder før rådgivning.
- [ ] Ikke lim kundedata inn i ordinær feedback.
- [ ] Avslutt saken ved å tømme/oppdatere alle inputs og lukke/reloade fanen; bruk privat arbeidsstasjon.
- [ ] Ved tidligere kundedata eller mulig kryssbrukerlekkasje: stopp piloten og kontakt sikkerhets-/personvernansvarlig straks.

## Pilotstyring

- [ ] Definert start, review point, eier og stop condition.
- [ ] Privacy-safe metrics: antall forsøk/fullført, feilklasse, responstid og feedbackkategori – aldri navn, dokumenttekst, identifikatorer eller priser.
- [ ] Endringer følger change → test → deploy → smoke → rådgivervarsel.
- [ ] Kjent god commit og rollback-prosedyre er registrert.
