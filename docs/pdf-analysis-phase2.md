# Fase 2 – implementasjon og validering

Dato: 23.09.2026. Utgangspunkt: ren `main`, commit `b58a1c1570dd537ae6b2c9411400de936ce1a49c`.
Ingen commit/push eller publisering er utført. Alle runtime-kontroller bruker lokale, syntetiske PDF-er og simulert OpenAI. Rapportens tall er testresultater, ikke nye produksjonsmålinger.

## Arkitektur (1–18)

1. Eksisterende POST `/api/analyze` er beholdt. Autorisasjon → begrenset multipart-lesing → filvalidering → serialisert PDF-worker → ressursplan → uttrekkskø → validering/beriking av hvert produkt → deterministisk samling → eksisterende semantic fallback → ett sluttresultat. Tidligere ble alle PDF-er på hver side alltid samlet i ett kall. Produkter var allerede lister; dokumentstatus og presise dokumentreferanser manglet.
2. Progress bruker NDJSON over samme autentiserte POST. Klienten ber eksplisitt om dette med `Accept: application/x-ndjson`. JSON-responsen støttes fortsatt. Ingen ekstra AI-kall brukes for progress.
3. Polling krever jobblagring; separat SSE-endepunkt krever livssyklus på tvers av requests; WebSocket gir unødvendig infrastruktur. Request-lokal streaming dekker piloten. En heartbeat hvert tiende sekund er bare transport, ikke påstått arbeidsframdrift.
4. Maks 10 PDF-er per side, 20 totalt. UI og backend bruker samme grense.
5. Maks 10 MiB per fil, uendret.
6. Maks 25 MiB samlet multipart-request, inkludert overhead. Grensen ble ikke økt.
7. Maks 150 sider per fil, 250 per side og nå 400 totalt. Alle gjelder samtidig.
8. Maks 500 000 tegn per fil og 750 000 per side beholdes. I tillegg maks 1 000 000 UTF-8-bytes samlet modellinput etter redigering/personvernfiltrering og dokumentmarkører. Maks 160 000 inputbytes per batch, pluss konservativ reserve på 16 000 estimerte tokens for schema/instruksjoner. Bytes er et konservativt estimat, ikke faktisk tokenizer-måling eller en påstand om modellens eksakte kontekstvindu.
9. Batch-størrelsen bestemmes av UTF-8-input og sider, ikke et fast antall filer. Maks 150 sider per batch og åtte batches per jobb. Filgrenser respekteres.
10. Maks to samtidige extraction-kall per aktiv jobb. Eksisterende admission tillater én aktiv analyse per prosess.
11. Dokumentene legges i stabil rekkefølge per side. Neste dokument tas med dersom side-/inputbudsjettet tillater det; ellers starter en ny batch. Ingen dokumenttekst sendes i flere batches. Sidene blandes ikke.
12. Én stor PDF beholdes samlet. Overskrider den fil-/side-/tekst-/batchbudsjettet, avvises analysen eksplisitt; ingen truncation eller automatisk oppdeling med tapt kontekst.
13. Uttrekket kan returnere flere produkter med egne dokumentreferanser og selskap fra én PDF. Ingen antakelse om ett produkt per fil.
14. Ti små PDF-er på samme side kan gi ett kall. Dette er både enhets- og HTTP-testet.
15. Resultater sorteres etter side og opprinnelig batchindeks, aldri ferdigstillelsestid. Produktlisten beholdes. Samlet avtalepris fra én batch brukes bare når siden er komplett og består av én batch. Det summeres ikke potensielt overlappende avtaletotaler.
16. Provider/type/produktnavn brukes ikke til å slå sammen objekter. Ulike objekter får separate request-lokale analyse-ID-er. Manglende sikker objektidentitet på tvers av batches medfører konservativ separasjon og synlig advarsel.
17. Produkter og fakta peker til 1-baserte dokumentnumre i modellens batch. Backend validerer referansene, oversetter til original side/dokumentindeks og lager `pdf:<side>:<index>`. Faktareferanser utenfor produktets dokumenter avvises. Duplikate identiske fakta beholder unionen av kilder. PDF-sidetall/punkt er ikke tilgjengelig i dagens extraction-schema; det vises derfor ikke et oppdiktet sidetall.
18. Hvert bevart produkt berikes nøyaktig én gang med sitt eget selskap og sine dokumentfakta. Eksisterende document > catalog-/effective-fact-regler brukes. Dette er trygt per batch fordi det ikke skjer en etterfølgende navnebasert produktmerge. Modellinstruksjonene beskriver dokumentrolleprioritet, men backend finner ikke på roller eller en ny sikker objektidentitet. Uklar overlapping på tvers av batches blir ikke løst med vilkårlig kildevalg.

## Progress og feil (19–32)

19. Dokumentstatus: `queued`, `validating`, `extracting`, `ready`, `analyzing`, `completed`, `failed`. Normale steg går fremover; feil kan avslutte et pågående dokument. Terminale statuser kan ikke gå tilbake.
20. Produktstatus: `identified`, `analyzing`, `completed`, `failed`. Nåværende uttrekk returnerer produktlisten samlet; implementasjonen sender derfor `identified` og `completed` etter vellykket uttrekk/beriking. Den later ikke som modellen ferdigstiller produkter underveis.
21. Eventtyper: `analysis_started`, `document_status`, `batch_analyzing`, `product_status`, `comparison_started`, `analysis_completed`. Partial-status inngår eksplisitt i sluttevent/resultat. Transporten har i tillegg heartbeat-, result- og error-rammer.
22. Allowlist: side, dokument-/batch-/produktindeks, antall, status, kjent canonical forsikringstype og fast feilkategori. Ingen vilkårlige labels.
23. Events rekonstrueres fra allowlist både på server og klient. Ukjent rå forsikringstype blir `unknown` i progress. Filnavn, tekst, dokumentverdier, unntaksmeldinger og kundedata kopieres ikke til progress/telemetry. Den autoriserte sluttresponsen inneholder selvsagt selve analyseresultatet og må skilles fra telemetry.
24. Før produktidentifikasjon viser UI «Dokument 1: Leses/Analyseres» og faktisk antall behandlede dokumenter. Lokale filnavn i filvelgeren forblir lokal informasjon.
25. Etter uttrekk vises faktisk identifiserte forsikringstyper med status. Backend gjetter ikke typer fra filnavn.
26. For én multiprodukt-PDF vises dokumentarbeid først; alle produkter kan bli kjent samtidig når kallresultatet foreligger. Ingen kunstig produktprogresjon.
27. Lesbare dokumenter og vellykkede batches beholdes ved isolerte feil. Sluttresultatet merkes partial dersom noen dokumenter feilet. En PDF-side uten noe brukbart analyseresultat stopper sammenligningen.
28. Isolerte feil: korrupt PDF, kryptert PDF, manglende tekstlag, isolert worker-timeout eller extraction-/provenancefeil for en batch. Ved batchfeil markeres alle dokumentene i batchen som feilet; det gjøres ikke skjulte ekstrakall for å finne én skyldig fil.
29. Fail closed: ugyldig tilgang/origin, malformed multipart, signatur-/format-/ressursbrudd, for mange filer, overskredet budsjett, abort/deadline og globale kapasitets-/konfigurasjonsfeil. 429 fra AI utløser ikke retries. Identisk PDF gjentatt på samme side avvises med en forståelig feil.
30. UI viser eksplisitt at sammenligningen kan være ufullstendig, antall feilende og antall behandlede dokumenter. Endelig sammenligning vises først etter ferdig tilgjengelig datasett og matching.
31. AbortController følger upload, worker, uttrekkskø og AI. Ingen nye batches starter etter abort. Aktive søsken avventes/avbrytes før admission frigjøres. Frontend har både synkron request-ref og disable-status mot dobbeltklikk.
32. Disconnect avbryter arbeidet. Det finnes ingen reconnect/resume-lagring. Brukeren må starte ny analyse. File-objektene kan fortsatt ligge i den åpne nettleseren, men lastes opp på nytt.

## Ytelse og sikkerhet (33–45)

33. To konsumenter henter arbeid fra én bounded kø. Ingen `Promise.all` med 20 extraction-kall. Worker-delen er fortsatt seriell.
34. Eksisterende sessions/origin, én aktiv analyse per prosess, 25 MiB streaminggrense, fil-/side-/tekstgrenser, batchtak, produktgrense 120 totalt og jobbdeadline begrenser ressursmisbruk. Dette er ikke en global kvote på tvers av fremtidige replikaer.
35. Maks åtte extraction-kall, inputbudsjett og ingen automatiske retries begrenser kostnad. Dette er ikke en eksakt krone- eller outputtokenkvote; faktisk outputforbruk må følges i telemetry. Hvert modellresultat har eksisterende struktur-/størrelsesvalidering.
36. Én isolert PDF-worker om gangen; eksisterende 256 MiB old-generation heap-grense og 45 sekunders worker-timeout beholdes. Dette er ikke et løfte om total RSS inkludert native minne. Jobbdeadline er fortsatt 220 sekunder.
37. Estimering skjer før noen AI-kall. Samlet input og hver batch valideres. Produksjonsmodell er fortsatt `gpt-5.6-luna`, `store:false`.
38. Ingen tekst kuttes for å få den under budsjettet. For store dokumenter eller pakker avvises, med råd om mindre dokumentmengde.
39. Samme untrusted-document-markører, instruksjoner og personvernfiltrering beholdes per batch. En påvist treghet på svært lange ord uten e-post ble rettet med startgrense i e-postmønsteret; filtreringen forsøker ikke lenger på nytt fra hvert tegn i samme token. Regresjonstest dekker lang sammenhengende tekst.
40. Strengt output-schema utvides med kildereferanser og selskap per produkt; validering brukes for hvert kall. Ekstra felt, ugyldige referanser og malformed output avvises. Egen test kontrollerer at schemaets required-liste samsvarer nøyaktig med properties uten duplikater.
41. Eksisterende semantic fallback beholdes etter alle batches. Ingen nye semantic-kall innføres bare på grunn av progress.
42. Eksisterende type-/canonical-/scopegrenser beholdes. Flere objekter av samme type gir konservativ sperre mot pooling av termkandidater. Ukjente typer følger eksisterende begrensede unknown-path; det oppfinnes ikke canonical typer eller kataloger.
43. Telemetry inkluderer dokumentantall per side, vellykkede/feilede dokumenter, identifiserte produkter, partial, batchantall, dokumenter/sider/estimert input per batch, extractionCalls, maksimal samtidighet, transport, bytes, sider og eksisterende faser/kall/audit.
44. Faktiske input/output/total/cached-input-tokens summeres over alle registrerte extraction- og semantic-kall. Cached input rapporteres separat og legges ikke en gang til på totalen. Manglende usage gir ukjent verdi, ikke et oppdiktet nullforbruk.
45. Railway-planens RAM og proxyegenskaper er ikke antatt eller endret. RSS/minnetopp, CPU, streamingbuffering, avbrudd, requestdeadline, samtidige brukere og faktiske tokenkostnader må verifiseres etter godkjent deploy.

## Filer og tester (46–62)

46. Endrede/nye filer:

| Fil | Hvorfor |
|---|---|
| `app/api/analyze/route.ts` | Kobler bounded pipeline til eksisterende endpoint; JSON/NDJSON, abort og partial-resultat. |
| `app/page.tsx` | Ti-filers validering, progress-state, request-generation, avbryt og partial-/overlappvarsel; ingen fiktiv side 0. |
| `lib/analysis-output.ts` | Strengt batchschema, kildereferanser og selskap per produkt. |
| `lib/analysis-telemetry.ts` | Metadata for batches, dokumenter, samtidighet og samlet tokens. |
| `lib/document-fact-normalization.ts` | Bevarer alle kildereferanser når identiske dokumentfakta dedupliseres. |
| `lib/document-redaction.ts` | Hindrer gjentatt skanning av hvert tegn i lange sammenhengende e-postkandidater. |
| `lib/pdf-upload-security.ts` | Grense fra fem til ti PDF-er per side; øvrige eksisterende grenser beholdt. |
| `lib/analysis-batching.ts` (ny) | Ressursplan, request-lokal duplikatkontroll, kø med maks to kall. |
| `lib/pdf-analysis-pipeline.ts` (ny) | Workerflyt, feilpolicy, faktiske hendelser og kontrollert batchkjøring. |
| `lib/analysis-merge.ts` (ny) | Dokumentprovenance, én beriking per produkt, stabil samling og konservative totaler. |
| `lib/analysis-progress.ts` (ny) | Event-allowlist, eksplisitte tilstander og generation gate. |
| `lib/analysis-client.ts` (ny) | Delt frontendvalidering, streamlesing og avbrutt-responskontroll. |
| `tests/pdf-upload-security.test.mjs` | Oppdaterer gammel fem-filers forventning til ti. |
| `tests/phase2-analysis.test.mjs` (ny) | 48 Fase 2-regresjonstester. |
| `scripts/verify-analysis-http.mjs` | Production HTTP med 10+10, streaming, partial, avbrudd og telemetry. |
| `docs/pdf-analysis-phase2.md` (ny) | Denne rapporten og pilotplan. |

47. Nye testcases omfatter: 10/11 filer på begge sider; 10+10 innen bytegrense; fil-/samlet størrelse; strukturelle 1+1, 5, 10 og 10+10; input-/side-/batchgrenser; enkelt-PDF over budsjett; 500 sider; duplikater; én PDF med ett/fire produkter; flere dokumenter med fem produkter; stabil merge uavhengig av rekkefølge; to like produktnavn som separate objekter; identiske fakta med to kilder; usikker objektidentitet og konflikt; manglende/ugyldig provenance; strict schema; korrupt/kryptert/uten tekst; ressursfeil før AI; malformed batch; hel side feiler; out-of-order completion; abort stopper kø; monotone/terminale statuser; PII-allowlist; gamle generations; delte streamrammer og disconnect; tokensummer; semantic-sperre for flere objekter; ukjent type; lang sammenhengende tekst; to batches med Bil/Hus og Innbo/Reise; faktareferanse utenfor produkt; ulovlige statussteg; separat selskap per produkt; required/properties-integritet; stabil rekkefølge også på feilmetadata ved omvendt batchferdigstilling.
48. Baseline 657/657. Full suite etter implementering: **705/705**, ingen skipped/cancelled.
49. Eksisterende manuell runtime: **1/1**. Lokal production HTTP: **PASS**, med faktisk PDF-worker, simulert AI, JSON og NDJSON. Tester også login/admission/429, manuell katalog og siste add-on-regresjon.
50. Separat PDF-gruppe: **21/21**.
51. Separat upload/security-hardening: **22/22**. HTTP bekrefter at syntetiske sensitive markører og tilfeldige testcredentials ikke havner i serverlogger.
52. Separat performance: **25/25**. Batchingbenchmarks bruker stub, ikke tidsløfter mot ekte AI.
53. Separat semantic/hybrid/audit/pilot semantic: **64/64**.
54. Separat catalog/canonical: **414/414**.
55. Separat document precedence: **23/23**.
56. Separat effective facts: **42/42**.
57. Separat pilot/add-ons: **41/41**. HTTP bekrefter dokumenterte Leiebil/Maskinskade selv med tom addOns-liste.
58. Separat nye Fase 2-tester: **48/48**. HTTP viser 20 fullførte dokumenter, åtte produkter, to uttrekkskall, maks samtidighet to; korrupt testfil gir 5 fullførte/1 feilende og partial. Grupper overlapper og skal ikke summeres til fullsuite-tallet.
59. `npx tsc --noEmit`: bestått.
60. `npm run lint`: bestått.
61. `npx next build --webpack`: bestått.
62. `git diff --check`: bestått. Sluttkontroll er utført etter rapportskriving. Ingen .env.local-, katalog-, source-manifest-, deployment- eller dependency-endringer. Ingen nye secrets. Ingen commit/push/reset/revert/stash. Ny UI er testet via state-/transportkontroller og production-build; ingen ny manuell visuell nettlesergodkjenning påstås.

## Risiko og pilotplan (63–74)

63. Modellens kildeattribusjon må fortsatt være innholdsmessig korrekt; backend validerer referanseintegritet, ikke sannheten i PDF-tolkningen. Ingen sikker tverrbatch objekt-ID eller strukturert dokumentrolle finnes i tidligere schema. Uklarheter beholdes konservativt. Store batches kan feile samlet; strømming må verifiseres gjennom Railway-proxyen. Modelloutput-/enrichment-minnetopp må måles. Eksisterende typegruppering vises fortsatt; det er ikke innført en ny objektsammenligningsmotor.
64. 20 store PDF-er aksepteres bare hvis alle samlede budsjetter er overholdt; ellers eksplisitt avvisning før AI.
65. Ekstremt mange sider avvises ved fil-, side- eller jobbgrensen.
66. Svært stor samlet input kan batchdeles; en overstor enkeltfil eller samlet jobb avvises uten truncation.
67. Isolert batchfeil beholder andre resultater. Ingen brukbare produkter på en PDF-side, global servicefeil eller resource breach stopper sluttresultatet.
68. Eksisterende semantic-feilpolicy beholdes: konservativ fallback uten å anta nye matcher; jobbabort/deadline kontrolleres også etter matching.
69. Terminert Railway-request gir ingen lagret jobb. Klienten viser feil ved manglende sluttresultat; ny analyse kreves. Allerede påløpt AI-forbruk kan ikke garanteres refundert av abort.
70. En kø/bakgrunnsarkitektur kan bli nødvendig ved mange samtidige brukere, garantert resume eller større jobber enn requestdeadline. Ikke nødvendig eller innført for denne avgrensede piloten.
71. Egnet for kontrollert pilot med opptil 10+10 innen budsjett, med de eksplisitte begrensningene over. Ikke en garanti for enhver 20-filers pakke eller bred produksjonsbelastning.
72. Mål total-/fasevarighet, calls, maxConcurrency, per-batch input/sider, input/output/cached tokens, partial/error/abort, RSS/CPU og synlig progress i Railway/nettleser. Ingen PDF-tekst eller labels i logger.
73. Pilotplan (skal ikke kjøres automatisk): A: samme godkjente Gjensidige 1+1, kontroller fakta/add-ons/totalskade/km/prisesemantikk og latency mot ca. 24 sekunder. B: 5+5 små syntetiske filer, se batching/progress/tokens/minne. C: 10+10 små syntetiske filer, maks to samtidige kall, grenser og stabilitet. D: én multiprodukt-PDF, faktiske produktstatuser og kilder. E: én korrupt test-PDF blant lesbare, tydelig partial-varsel og korrekte resterende produkter.
74. Blockers før bredere bruk: feil kilder/objektblanding, catalog over document, falsk selected, silent truncation, umerket partial, PII i telemetry, mer enn to samtidige extraction-kall per prosess, ukontrollert minnevekst, timeout/avbrudd som låser admission, eller vesentlig uforklart 1+1-regresjon. Proxybuffering som skjuler progress må avklares før godkjenning av progressfunksjonen.

## Ekstra spørsmål (75–100)

75. Typiske stubresultater: én liten PDF på en PDF-side → ett extraction-kall; fem små → ett; ti små → ett; 10+10 små → to. Ti store → dynamisk antall, maksimalt åtte for hele jobben, ellers avvisning. Dersom begge sider har PDF-er må begge analyseres; en manuell side trenger ikke extraction. Eventuell eksisterende semantic fallback kommer i tillegg og utløses bare av relevante uløste kandidater.
76. Maks to extraction-kall samtidig; semantic kjøres etter extraction, innen samme aktive jobb.
77. Filantallet oppretter ikke promises direkte. Kun de to køkonsumentene starter modellkall.
78. Frontend beholder File-referanser, ikke egne kopier av alle ArrayBuffers. Server bruker fortsatt begrenset multipart-strøm, validerte bytes og én worker med overført buffer. Tekst beholdes request-lokalt og batches bygges innen fast budsjett. Ingen 20-worker-vifte eller samlet ekstra rå upload-buffer. Endelig resultat og streamingserialisering krever likevel minne; eksakt RSS må måles.
79. En enkelt PDF over inputbudsjettet avvises med beskjed om naturlige produktgrenser/mindre dokumentmengde, ikke kuttet tekst.
80. En gyldig, ekstremt lang PDF stoppes også av side-/tekstgrenser. «Gyldig PDF» betyr ikke ubegrenset ressursrettighet.
81. Små filer samlet over 25 MiB stoppes av requestgrensen. Samlet side-/tekst-/batchbudsjett kan også avvise dem.
82. En korrupt fil blant ti kan isoleres; ni lesbare dokumenter fortsetter dersom den andre sammenligningssiden også har brukbare data.
83. Ved feil i en AI-batch merkes alle dens dokumenter feilet. Dersom ti små filer lå i samme batch, finnes ikke ni separate AI-resultater å redde.
84. Andre ferdige batchresultater beholdes til requesten avsluttes og inngår i partial-resultatet når det er forsvarlig.
85. API: `analysis.partialSuccess` og antall/feilkategorier. UI: eksplisitt ufullstendig-varsel og dokumentstatus.
86. Ingen server-side retry av bare feilet batch. Ny analyse sender filene på nytt. I samme nettlesersesjon kan filvalget fortsatt brukes uten ny filvelger, men det er fortsatt en ny upload.
87. Abortsignal går til aktiv worker/AI og kø. Admission holdes til pipeline har avsluttet søsknene.
88. Ingen nye queued batches starter etter at signalet er abortert. Testet.
89. Request-lokal generation gate og AbortController hindrer gamle events, sluttresultater og feil fra å overskrive en nyere analyse.
90. Enhetstester for generation/terminal-state/køabort, streamfragments/EOF, to aktive kall og omvendt completion order; HTTP tester faktisk disconnect og etterfølgende frigjort admission.
91. Original side/index beholdes selv når en mellomliggende PDF feiler. Termens refs valideres mot produktet og produktet mot batchen; samme fact fra flere dokumenter beholder alle kilder.
92. Innen en batch kan modellen returnere ett objekt med flere dokumentreferanser. På tvers av batches finnes ingen sikker eksisterende identitet å merge på; objektene beholdes separate med advarsel. Ingen fuzzy matching.
93. Samme provider/product på to objekter beholdes som to produkter med separate analyse-ID-er. Navnelikhet gir ikke automatisk merge.
94. Ukjent forsikringstype beholdes i det autoriserte analyseresultatet; ingen katalog oppfinnes.
95. Progress viser «Ukjent forsikringstype», aldri rå label som kan inneholde kundedata.
96. Eksisterende begrensede unknown semantic-path er uendret; canonical konfliktsperrer og audit gjelder fortsatt. Flere objekter av samme type pools ikke automatisk.
97. Ingen ny produksjonsmåling er gjort. Fase 2 kan derfor ikke erklæres raskere eller like rask som ca. 24 sekunder fra piloten.
98. Nye steg for 1+1: lokal duplikathash, inputbudsjettplan, hendelser og kildeattribusjon/merge. Fortsatt to parallelle extraction-kall; ingen ekstra AI for progress. Utvidet output-schema kan påvirke outputtokenbruk og latency.
99. Lokal stub viser fungerende 1+1, men kan ikke kvantifisere modell-latency. Ingen tallfestet regresjonsgaranti. Bruk gjentatte sammenlignbare pilotmålinger fremfor ett enkelt kall.
100. Etter godkjent deploy: kontroller versjon, ekte streaming, 1+1 korrekthet/latency, 5+5/10+10 budgets/minne, maks samtidighet to, totalsummerte tokens, ukjente typer, kilder, partial/advarsel, abort/admission og fravær av sensitive logger. Ingen modellbytte anbefales på grunnlag av syntetiske tester.
