# PDF-analyse – fase 1

Lokal implementasjon. Ingen commit/push. Baseline: 564 tester.
**Reell OpenAI-/produksjonslatency er ikke målt. Valideringen bruker ingen eksterne modellkall.**

## 1–8. Pipeline, parallellitet og dobbeltarbeid

Faktisk flyt:

1. Multipart-upload med PDF eller manuell registrering på hver avtaleside.
2. Analyse-ruten kontrollerer pilotkonfigurasjon, signert session og same-origin før body leses.
3. Prosesslokal admission tillater én aktiv pipeline. Andre requests får 429 og Retry-After: 5, uten intern kø.
4. Deklarert størrelse og faktiske body-bytes kontrolleres før multipart dekodes.
5. Tillatte felt, modus, filantall, størrelser, extension/MIME og magic bytes kontrolleres.
6. Manuelle data normaliseres. PDF-buffere opprettes i minnet.
7. Alle PDF-er parses sekvensielt, én isolert Node-worker om gangen.
8. getInfo laster dokumentet og kontrollerer sideantallet; getText gjenbruker dokumentet og leser alle sider. Samlede side-/tekstgrenser sjekkes før neste fil.
9. Tekst redigeres og samles med interne dokumentgrenser, én input per avtaleside.
10. Inntil to uttrekkskall kjører samtidig, ett per PDF-side. Alle PDF-er må være validert først.
11. Modellens JSON valideres, type normaliseres, tilleggsvilkår samles, dokumentfakta normaliseres og katalogen supplerer.
12. Hybrid matching lager deterministiske kandidater og gjør eventuelt ett semantisk modellkall.
13. Sanitering, JSON-serialisering og private/no-store-respons.
14. Nettleseren grupperer, beregner forskjeller og presenterer dem. Dette ligger ikke i analyse-API-et.

Før var også de to AI-sideanalysene sekvensielle. Nå overlapper bare disse uavhengige kallene.
PDF-parsing forblir sekvensiell for å begrense minne. Semantic matching venter på begge resultatene.

N dokumenter kan gi M produkter. Én stor PDF med Bil/Hus/Innbo/Reise analyseres fortsatt samlet.
Ingen sider eller forsikringsfelt er fjernet.

Fjernet dobbeltarbeid:

- Next-proxyen klonet/bufret uploaden før API-ruten. API-et er nå unntatt fra proxy-matcher; eksisterende auth/origin beholdes i ruten før body leses.
- Dermed fjernes også proxyens separate standardgrense på 10 MiB, som kunne gi trunkert multipart. Appens vedtatte 25 MiB-grense er uendret.
- Buffer.from og pdf-parse sin videre Buffer→Uint8Array-kopiering er erstattet med overføring av buffer-eierskap til worker.
- Katalogberiking beregnet hele canonical coverage-settet på nytt for hver dekning. Nå beregnes det én gang per produkt og gjenbrukes via Map.
- Sammenligning/presentasjon memoiseres ved fanebytte og andre lokale rerenders.

Hver opplastingsoppføring ble normalt parset én gang også før. PDF-tekst inngår i ett uttrekkskall per side.
Semantic matching mottar avgrensede strukturerte kandidater, ikke original PDF-tekst.
Identiske filer lastet opp flere ganger dedupliseres ikke i denne fasen.
Katalogens separate audit/effective-oppløsninger beholdes fordi de gir forskjellige resultater.
Ingen persistent dokumentcache eller bakgrunnsjobb er innført.

## 9–11 og 28–29. Målinger og personvern

Serveren skriver én JSON-linje med prefiks ANALYSIS_METRICS ved avsluttet request:

- tilfeldig servergenerert requestId, HTTP-status, totalMs
- uploadBytes, documentCount, parsedDocumentCount, products
- uploadValidation, pdfWorker, pdfParsing, textExtraction, inputPreparation
- aiExtraction, structuredOutput, normalization, documentNormalization
- catalogLookup, catalogEnrichment, semanticMatching, semanticApi, response
- per vellykket PDF: intern ordinal, bytes, sider, tekstlengde, varighet
- per API-kall: extraction/semantic, konfigurert modell, varighet, completion-status
- inputTokens, outputTokens, totalTokens, cachedInputTokens

Manglende usage er null, ikke null kostnad. Modellnavnet kommer fra konfigurasjonen.
Ingen priser er hardkodet; prosjektet har ingen sentral prismekanisme.
Offisiell referanse: https://developers.openai.com/api/reference/typescript/resources/responses/methods/create

Nettleserens Performance API inneholder insurance.comparison og insurance.presentation.
Bare siste måling per navn beholdes. Ingen kundeverdier eller nettverkskall inngår:

    performance.getEntriesByType("measure")
      .filter(entry => entry.name.startsWith("insurance."))
      .map(({ name, duration }) => ({ name, duration }))

totalMs er handler-tid, ikke full nettverkstid eller klientrendering.
pdfWorker inkluderer oppstart/avslutning. Parsing og tekstuttrekk måles separat inne i workeren.
Tider kan være nestede; aiExtraction er summert arbeidstid for overlappende kall.
**Ikke summer alle timing-feltene som en tidslinje.**

Logging mottar ikke tekst, filnavn, helseopplysninger, prompts, modelltekst eller secrets.
SDK-loggnivå er eksplisitt off, også ved OPENAI_LOG=debug.
Worker stdout/stderr dreneres uten logging, og workeren arver ikke serverens environment.
Sanitert feillogging og no-store beholdes.

Bruk neste reelle pilotkjøring til å skille AI-, parser- og etterarbeidstid.
Samle flere representative kjøringer før p50/p95 vurderes sammen med Railway CPU/peak RSS.

## 12–20. Grenser og sikkerhet

| Grense | Før | Etter |
|---|---:|---:|
| PDF-er per side | 5 | 5 |
| Samlet antall | 5 + 5 | 5 + 5 |
| Filstørrelse | 10 MiB | 10 MiB |
| Samlet multipart | 25 MiB deklarert | 25 MiB deklarert og faktisk strøm |
| Sider per fil / side | 150 / 250 | samme |
| Teksttegn per fil / side | 500 000 / 750 000 | samme |
| Extraction | 90 s, 0 retries | samme + abort |
| Semantic | 45 s, 0 retries | samme + abort |
| Next maxDuration | 240 s | 240 s |
| Aktiv request-deadline | ingen egen | 220 s |
| Isolert PDF-deadline | ingen | 45 s per fil |
| Aktive pipelines per prosess | ubegrenset | 1 |
| Parallelle sideuttrekk | 1 per request | maks 2 samlet per prosess |
| Worker V8 old-generation | ingen separat grense | 256 MiB |
| Modelltekst før JSON.parse | ingen totalgrense | 4 MiB extraction / 128 000 tegn semantic |

Én pipeline er et konservativt pilotvalg: én upload innen 25 MiB, én parser og maksimalt to AI-kall.
Det er ikke dokumentasjon for kapasiteten til en bestemt Railway-instans.
V8-grensen er ikke total RSS/native/ArrayBuffer-grense eller en OS-sandbox.

PDF-validering:
- .pdf kreves sammen med application/pdf, application/octet-stream eller tom MIME.
- HTML-MIME med PDF-navn og HTML-navn med PDF-MIME avvises.
- %PDF- er nødvendig, men faktisk parsing avgjør videre gyldighet.
- Korrupt, tekstløs og passordkrevende PDF gir sanitert feil.
- Sidegrensen sjekkes før full tekstuttrekking.
- Tekstgrensen sjekkes etter uttrekk. Heapgrense/deadline reduserer, men eliminerer ikke, decompression/native-minnerisiko.
- Ingen opplastede filnavn brukes som sti, kommando eller worker-kode. Ingen kunde-tempfiler skrives.
- PDF.js eval-støtte er av.

Body-kontrollen gjelder uten Content-Length og ved falskt lav verdi.
Ukjente multipart-felt, dupliserte skalarfelt og filer på manuell side avvises.
Malformed prosentkoding i session-cookie gir ugyldig session fremfor URI-feil.

Avbrudd:
- Request.signal og deadline kobles til intern AbortController.
- Worker termineres og avventes ved avslutning, timeout og abort.
- SDK mottar signalet i tillegg til eksisterende kall-timeouts.
- Sidefeil aborterer søsken. Alle sidepromiser avventes før admission frigis.
- Semantic matching beholder konservativ fallback; global abort kontrolleres etterpå og blir ikke falsk suksess.
- Hosting/reverse proxy påvirker faktisk disconnect-signalering. Lokal signalpropagering er testet.

Fase 1 er fortsatt all-or-nothing for parsing/sideuttrekk.
Defekte dokumenter utelates ikke stille. Ingen delresultatkontrakt er innført.

Prompt injection og output:
- Eksisterende extraction/semantic-instruksjoner behandler dokumenter som ubetrodd data.
- Dokumenttekst ligger i input, ikke trusted instructions. Ingen verktøy/kommandoer er tilgjengelig for modellen.
- Dette garanterer ikke at adversarial tekst aldri påvirker modellens fakta.
- Strict JSON-schema og runtime-felt/type/enum/lengdekontroll beholdes.
- Ny totalgrense gjelder før JSON.parse; semantic-validator avviser også ukjente response-/decision-felt.
- Document > catalog, coverage-status, type-scoping, IDs og provenance er uendret for gyldige data.

Gjenstående risiko:
- Admission er ikke distribuert rate limiting eller kostnadsbudsjett. Flere replikaer multipliserer concurrency.
- Én request kan oppta pilotkapasiteten til deadline. Ingen fair/per-user kø.
- Login har ikke fått en ny brute-force-plattform i denne oppgaven.
- Teksttegn er ikke tokens. Gyldige store inputs kan fortsatt overskride modell-/kontokapasitet.
- Ingen ny max_output_tokens er valgt uten grunnlag som sikrer fullstendige forsikringsfakta.
- Regelbasert redigering er ikke full anonymisering.
- Native parser-avhengigheter og synkront etterarbeid har fortsatt ressursrisiko.
- Railway-ressurser, kontoens RPM/TPM og reell produksjonslast er ikke verifisert.

## 21–27. Modellkall og ytelse

Modellen er uendret: **gpt-5.6-luna** for extraction og semantic.
Ingen automatiske retries/backoff. Extraction-429 returneres kontrollert.

| Dokumentfordeling | Uttrekkskall | Eventuell semantic |
|---|---:|---:|
| 1 PDF + manuell | 1 | 0–1 |
| 2 PDF-er på samme side + manuell | 1 | 0–1 |
| 1 PDF på hver side | 2 parallelle | 0–1 etter begge |
| 5 PDF-er på samme side | 1 | 0–1 |
| 5 PDF-er fordelt over to sider | 2 parallelle | 0–1 |
| 5 + 5 PDF-er | 2 parallelle | 0–1 |
| Én PDF med flere produkter | 1 for siden | 0–1 |
| Bare manuell registrering | 0 | 0–1 |

Vanlig Responses API brukes med sammensatt input per avtale, ikke OpenAI Batch API.
Resultatrekkefølgen er alltid eksisterende → tilbud.

To sekvensielle AI-ventepunkter blir én overlappende fase.
Med sidetidene A og B kan den nærme seg max(A, B) fremfor A + B.
Antall modellkall og normal tokenbruk reduseres ikke av parallelliseringen.
Worker-start/getInfo gir noe overhead som aksepteres for isolasjon og tidlig sidekontroll.
**Ingen påstand om målt 60→30 sekunder eller annen produksjonsgevinst.**

Reproduserbar kontroll uten eksterne API-kall:

    node --test tests/analysis-performance.test.mjs
    npx next build --webpack
    node scripts/verify-analysis-http.mjs

Barrieretester beviser overlapp og rekkefølge uten millisekundkrav.
HTTP-skriptet bruker lokal production-server, lokal Responses-stub og tilfeldige midlertidige credentials.
Stub-tokenverdier og latency er syntetiske, ikke produksjonsmålinger.
Teksthash og sideantall fra to lokale Gjensidige/Tryg-kilder er identiske før/etter worker.

## 30–34. Fase 2 – bare anbefaling

Backend er bedre forberedt, men 10 + 10 er ikke godkjent som trygg kapasitet ennå.

1. Mål reelle tokenfordelinger, AI-p95, parserarbeid, RSS og Railway CPU/minne/replikaer.
2. Avklar RPM/TPM/kostnadsbudsjett og eventuell koordinert admission på tvers av prosesser.
3. Lasttest upload, dekomprimering, native minne, store sidebatches og avbrudd.
4. Behold konservativ parser-concurrency; ikke velg 2–4 samtidige analyser uten målegrunnlag.
5. Modellér dokument-ID, side, produkt-ID og dokument→produkt-proveniens separat. Ikke anta 1 PDF = 1 produkt.
6. Utvid kontrakten med dokumentfeil og completeness før delresultater vises. Manglende dokument er ikke manglende dekning.
7. Vis dokument-/pipeline-status før produktstatus; produktstatus krever validert struktur.
8. Vurder begrenset jobbkø etter målinger og beslutning om sikker retention. Ingen kø/background-job er implementert nå.

Semantic matching er fortsatt på kritisk bane fordi det inngår i dagens matchingPlan.
En senere todelt respons kan vurdere deterministisk resultat først, men krever kontrakts-/UI-design.
Sammenligning/presentasjon var allerede klientarbeid.

## 35. Endrede filer

| Fil | Formål |
|---|---|
| app/api/analyze/route.ts | Integrerer måling, body-grense, admission, abort, worker og sidekall |
| app/page.tsx | Memoisering/timing; ingen markup-/designendring |
| lib/analysis-control.ts | Livsløp, body-lesing, admission og ordnet sideanalyse |
| lib/analysis-telemetry.ts | Numerisk timing/usage og uendret modellnavn |
| lib/pdf-reader.ts | Starter, overvåker og terminerer worker |
| lib/pdf-text-worker.mjs | Isolert loading/tekstuttrekk uten rå logging |
| lib/comparison-performance.ts | Lokale varighetsmålinger |
| lib/analysis-output.ts | Modellkonstant og tekstgrense før JSON.parse |
| lib/catalog-enrichment.ts | Målekroker og gjenbruk av dekningsoppløsning |
| lib/semantic-matcher.ts | Abort, usage/timing, outputgrense |
| lib/hybrid-matching.ts | Avviser ukjente modellfelter |
| lib/pdf-upload-security.ts | MIME/extension-validering |
| lib/pilot-access.ts | Malformed-cookie-håndtering |
| proxy.ts | Unngår duplisert API-body-buffering |
| next.config.ts | Worker/avhengigheter inkluderes i production tracing |
| tests/analysis-performance.test.mjs | 25 nye tester |
| tests/helpers/synthetic-pdf.mjs | Syntetisk PDF-generator |
| scripts/verify-analysis-http.mjs | Lokal production/HTTP-stubkontroll |
| docs/pdf-analysis-phase1.md | Rapport og fase-2-plan |

## 36. Nye tester

1. Logging uten PII/innhold/secrets.
2. Manglende/ugyldig usage blir null.
3. Feil måles uten feilinnhold.
4. Parallelle sider, deterministisk rekkefølge.
5. Sidefeil, søskenabort og opprydding.
6. Concurrency/admission og idempotent release.
7. Strukturell benchmark for 1/2/5/5+5 dokumenter og N→M.
8. Disconnect/deadline.
9. Bytebegrensning uten Content-Length.
10. Gyldig/malformed multipart.
11. MIME/extension.
12. Worker-parsing, filnavn/path traversal og buffertransfer.
13. Faktisk korrupt/tekstløs PDF.
14. 151 sider avvises.
15. Worker-timeout og forhåndsavbrudd.
16. Prompt injection forblir data.
17. For stor modelloutput avvises.
18. Semantic abort/usage.
19. Ukjente semantic-felt avvises.
20. Nettlesermålinger inneholder ikke returdata.
21. Malformed session-cookie.
22. Avbrudd av pågående worker.
23. Falskt lav Content-Length.
24. Instrumentering bevarer effective facts.
25. Eksakt teksthash/sideantall fra lokale Gjensidige-/Tryg-PDF-er.

## 37–39. Validering

| Kontroll | Resultat |
|---|---:|
| Full testsuite | 589/589 |
| Separat runtime | 1/1 |
| Separat PDF add-on | 2/2 |
| Separat upload security | 7/7 |
| Separat security hardening | 15/15 |
| Separat katalog | 357/357 |
| Separat canonical/catalog comparison | 23/23 |
| Separat document precedence | 23/23 |
| Separat effective facts | 42/42 |
| Separat nye performance/security/worker | 25/25 |

TypeScript, ESLint, webpack production build og git diff --check: bestått.
Lokal production/HTTP-stub: bestått. Ekte OpenAI-latency ikke målt.
Kategoriene er delmengder av fullpakken og skal ikke summeres som ekstra tester.

## 40. Bekreftelser

.env.local er ikke endret. Ingen API-nøkler eller dokumentdata er lagt i logger.
Ingen persistent kunde-PDF-lagring, nye canonical katalogdata eller source manifests.
Gyldige matching-/precedence-/coverage-regler er bevart.
Ingen ny modell, 10-PDF-grense, progressiv status eller UI-design.
Ingen commit eller push.
