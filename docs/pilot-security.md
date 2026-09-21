# Sikkerhetskrav for lukket pilot

Denne pilotversjonen er laget for én eller noen få betrodde brukere. Den er ikke en offentlig lansering.

## Servermiljø

Følgende secrets må settes i produksjonsplattformens secret manager, aldri i klientvariabler eller kildekode:

- `OPENAI_API_KEY`: prosjektspesifikk OpenAI API-nøkkel.
- `PILOT_ACCESS_CODE`: delt pilotkode på minst 12 tegn.
- `PILOT_SESSION_SECRET`: tilfeldig signeringssecret på minst 32 tegn.

Ingen av variablene skal ha `NEXT_PUBLIC_`-prefiks. Lokal `.env.local` er ignorert av Git, men produksjon skal bruke plattformens server-side secret manager.

## Nettverk og tilgang

- All trafikk skal bruke HTTPS.
- Både `/` og `/api/analyze` er beskyttet av pilotsesjonen. API-ruten gjør i tillegg egen session- og same-origin-kontroll.
- CDN og reverse proxy skal aldri cache `/api/analyze`. Appen sender `Cache-Control: private, no-store, max-age=0` og `Pragma: no-cache`.
- Sett en rate limit ved host/edge, for eksempel per pilot/IP, før URL-en deles. Appen bruker med vilje ikke en in-memory rate limiter som kan gi falsk trygghet i en serverless eller flerinstans-deploy.
- Sett budsjett- og bruksvarsler på OpenAI-prosjektet. Pilotnøkkelen skal ikke deles med andre apper.

## Request- og runtimegrenser

Appen håndhever:

- maksimalt 5 PDF-er per side
- maksimalt 10 MiB per fil
- maksimalt 25 MiB samlet request/filinnhold
- maksimalt 150 sider per fil og 250 sider per side
- maksimalt 500 000 teksttegn per fil og 750 000 per side
- `%PDF-`-signatur og kontrollert håndtering av korrupt, kryptert eller tekstløs PDF

Reverse proxy/gateway må også avvise request bodies over 25 MiB. Appens `Content-Length`-kontroll og etterkontroll av `File.size` kan ikke garantere avvisning før Next.js har bufret `request.formData()`.

OpenAI-uttak har 90 sekunders timeout. Semantisk matching har 45 sekunders timeout. Automatiske SDK-retries er slått av; brukeren kan prøve requesten på nytt. Route Handler har en maksimal varighet på 240 sekunder der plattformen støtter dette.

## Logging og midlertidige data

- Request- eller response-body, dokumenttekst, modellinput/output, ekte filnavn og kundeopplysninger skal ikke logges.
- Produksjonsloggen skal bare inneholde generert request-ID, intern feilklasse, ekstern status og eventuell ufølsom OpenAI request-ID.
- Hostens access-/errorlogg-retention og eventuell midlertidig buffering eller diskbruk må dokumenteres før første ekte PDF.
- Body logging og debug tracing av `/api/analyze` skal være deaktivert.

## OpenAI og personvern

- Begge Responses API-kall bruker `store: false`.
- Bare maskert tekst sendes; original-PDF-en og ekte filnavn sendes ikke til OpenAI.
- OpenAI-organisasjonens data-sharing-innstillinger, abuse-monitoring-retention, eventuell ZDR/MAM, databehandleravtale og behandlingsregion må kontrolleres før pilot.
- Behandlingsgrunnlag og informasjon til pilotbrukeren må være avklart. Ikke beskriv løsningen som GDPR-compliant uten separat juridisk vurdering.

## Deploy-sjekkliste

1. Sett alle tre server-secrets i secret manager.
2. Bekreft HTTPS og `Secure` session-cookie i produksjon.
3. Sett gateway body limit til 25 MiB.
4. Aktiver host/edge-rate-limit og OpenAI-prosjektbudsjett.
5. Deaktiver body logging og avklar hostens logg-/temp-retention.
6. Bekreft at CDN ikke cacher `/api/analyze`.
7. Kontroller OpenAI data-sharing, retention, DPA og region.
8. Kjør security-, runtime- og regresjonstestene mot production build før første ekte dokument.
