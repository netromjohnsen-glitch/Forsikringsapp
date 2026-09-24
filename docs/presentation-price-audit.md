# Presentasjon og porteføljepris – ferdigrapport

Dato: 24.09.2026. Utgangspunkt: ren arbeidskopi på `main`, checkpoint `b2e3920b96ee569877a3ae681b89859466f1a8c4`, 989 tester. Ingen private pilot-/blindtest-PDF-er er brukt. Implementasjonen er lokal og ikke publisert.

## Resultat

**1055/1055 tester bestått**: eksisterende 989 og 66 nye. TypeScript, ESLint, webpack production build, syntetisk PDF/HTTP-runtime og `git diff --check` bestått.

### Detaljvisning, punkt 1–7

1. **Root cause:** `ConceptFamilyCard` i `app/page.tsx` opprettet alltid et `<details>`-element. Kortvisningen brukte `collapsedHero(..., difference.items)` mens ekspandert visning gjenga de samme `difference.items[].text`. En enkelt sammensatt dekningsoppsummering ble derfor vist to ganger. `items` var dessuten utvalgte forskjeller, ikke alle relevante effektive fakta; like, men viktige, underdetaljer kunne mangle.
2. **Beslutningsregel:** `coverageDetailPresentation` bygger en lokal visningsmodell, og `hasMeaningfulAdditionalDetails` sammenligner canonical fact-identiteter i compact/additional. `hasAdditional` styrer om ekspanderen finnes. Ulik tekstformattering, kildeinformasjon og tekstlengde er ikke selvstendige grunner til å opprette en ekspander.
3. **Compact:** løst dekningsstatus og canonical beløpsgrenser, alder, kilometer og varighet vises samlet per side. Eksisterende ordlyd beholdes. Totalskade bruker fortsatt eksisterende `limitPair`, med uendrede effektive alder-/kilometerverdier. Kortet skjuler ikke tekst med line-clamp. Ustrukturert tekst blir ikke tolket til nye sum-/egenandelsfakta.
4. **Expanded:** øvrige effektive fakta for aktuell presentasjonsfamilie og aktuelt objektpar vises som merkede rader, side ved side på desktop og stablet på mobil. Dette inkluderer blant annet egenandel, geografi og begrensninger. Like detaljer på begge sider kan være relevante. En direkte effektiv fritekstoppsummering uten strukturerte underdetaljer beholdes samlet som utdyping. Ingen ny dataoppløsning skjer ved åpning.
5. **Dedup:** canonical nøkkel brukes én gang i modellen. Forelderens genererte sammendrag gjentas ikke når strukturerte underdetaljer allerede representerer innholdet. Modellen bygger på eksisterende `groupTerms`, som allerede samler normaliserte identiteter og verdier. Flere motstridende verdier innen samme effektive rad slettes ikke. Full teknisk sammenligning er uendret.
6. **Source/evidence:** kildekontrollene ligger utenfor den valgfrie utdypingen, separat per side. De bruker eksisterende `FactSource` og `SourceDetails`. Kilde-/grunnverdihistorikk finnes også fortsatt i detaljert sammenligning. Beregnede porteføljepriser får ikke en oppdiktet PDF-kilde.
7. **Generell regel:** eksisterende `conceptForFactKey` avgrenser familie og eksisterende `sortDetailedTerms` gir rekkefølgen. Samme helper brukes på tvers av typer; tester dekker Bil, Innbo, Hus og Reise. Objektets scope følger eksisterende grupper. Ingen spesiell Rettshjelp- eller Maskinskade-betingelse er lagt i UI-et. For kort uten strukturert effective-fact-grunnlag beholdes eksisterende tekst; en enkelt slik tekst får ikke en meningsløs ekspander. Tjeneste-/fordelskilder beholder eksisterende visningsmåte.

### Pris, punkt 8–19

8. **Root cause:** oversikten brukte `annualPremiumLabel(document.insuranceData)`, som leser `insuranceData.totalAnnualPremium`. Bare sammenligninger med ett kjøretøy brukte `VehiclePriceList` direkte. To dokumenterte objektpriser nådde derfor ikke oversikten når avtaletotalen var null.
9. **Tidligere Total årspris:** feltet var avtaletotalen, eventuelt eksisterende manuell prissummering. Det var ikke en summering av alle analyserte objektpriser. `finalizeAgreementPricing` og batch-merging holder usikre/delvise avtaletotaler tilbake for å unngå dobbelttelling. Disse sikkerhetsreglene er uendret.
10. **Flere objekter:** `portfolioPrice` leser `insuranceData.insurances` etter eksisterende konsolidering. Den oppretter bare en presentasjonsmodell og skriver ikke summer tilbake i dokument-/canonical data.
11. **Forsikringspris:** summerer sikre årlige `premie.ekskl_tfa`-beløp i øre, én gang per logisk objekt. Katalogopprinnelse utelukkes. Ingen fratrekking av TFA eller bruk av forsikringssum/egenandel.
12. **TFA:** summerer `premie.tfa` separat. Den eksisterende objektprisvisningens valgfrie TFA-policy for tilhenger, campingvogn og snøscooter gjenbrukes: manglende TFA på disse skaper ingen kunstig nullverdi. En faktisk dokumentert TFA-verdi kan inngå. Ingen separat «billigere selskap»-konklusjon om TFA.
13. **Totalt:** summerer bare sikre `premie.total`-beløp. Parseren er den eksisterende eksakte årsbeløpsparseren fra objektprisvisningen, nå eksportert. Ingen månedlig ×12, range-ekstraksjon eller automatisk summering av forsikringspris og TFA til en udokumentert objekt-total.
14. **Duplikater:** eksisterende konsolidering avgjør hvilke dokumentposter som er ett logisk objekt før aggregasjonen. Prislaget innfører ingen ID-, PDF-rekkefølge- eller provider-basert deduplisering. Tester kjører ekte konsolidering, inkludert komplementære priser i tre dokumenter og doble syvobjekt-porteføljer.
15. **Missing objects:** eksisterende advarsler beholdes. Hver sides egne priser kan vises, men samlet besparelse krever et komplett, matchet objektsett. Et manglende objekt regnes ikke som null kroner.
16. **Manglende pris:** teller i nevneren. Delvis kjent sum merkes «Delsum · X av Y objekter priset». Ingen sikre beløp gir unavailable/ikke dokumentert. Uklassifisert `annualPremium` blir ikke automatisk antatt å være total inklusive TFA.
17. **Partial failure:** antall mislykkede dokumenter føres inn fra eksisterende `objectContext`. Kjent beløp merkes ufullstendig og kan ikke gi en sikker samlet prisforskjell.
18. **Konflikter:** ulike prisverdier, eksplisitte konsolideringskonflikter og uavklart konsolidering gir conflicting; ingen tilfeldig vinner eller falsk komplett sum. Dokumentert avtaletotal som avviker fra en komplett beregnet total beholdes og vises sammen med konfliktmeldingen. Eksisterende dokumentprioritet løses før prislaget og overstyres ikke her.
19. **Objektpriser:** eksisterende objektvise prisfelt består. «Vis pris per forsikring» er også tilgjengelig for flerobjekt-porteføljer med like priser, og viser eksisterende objektpris-komponent. Full detaljert sammenligning består.

### Filer og validering, punkt 20–23

20. **Alle endrede/nye prosjektfiler:**

| Fil | Endring |
|---|---|
| `app/page.tsx` | Kobler inn memoiserte porteføljepriser, sikker samlet prisforskjell, betingede detaljer og uavhengige kildekontroller. |
| `app/components/portfolio-price.tsx` | Ny visning av beregnede priskomponenter, delsummer, dokumentert avtaletotal og konflikter. |
| `lib/comparison-presentation.ts` | Knytter eksisterende effektive, objektskopede fakta til detaljmodellen; endrer ikke beregningen av forskjeller eller prioriteter. |
| `lib/coverage-detail-presentation.ts` | Ny generell, ren projeksjon til compact/additional/sources og testbar tilgjengelighetsregel. |
| `lib/portfolio-price-presentation.ts` | Ny konservativ prisaggregasjon, completeness, opprinnelse og kontroll mot eksisterende objektmatcher. |
| `lib/vehicle-price-presentation.ts` | Eksporterer eksisterende `annualAmount`; parserens regler er uendret. |
| `tests/presentation-price.test.mjs` | 66 nye regresjonstester. |
| `tests/totalskade-presentation.test.mjs` | Eksisterende isolerte JSX-test laster nå også `SourceDetails`; eksisterende forventninger er uendret. |
| `docs/presentation-price-audit.md` | Denne rapporten. |

21. **Nye tester:** pilotens 2-bilsummer; like priser; exact/unique-type-match; missing/ambiguous/partial failure; complete/partial/unavailable/conflicting; inkompatible prisformater; katalogeksempler; dokumentprioritet; årsbeløp versus scalar; avtaletotal versus beregnet total; manuell opprinnelse; rekkefølge; TFA; blandet portefølje; tre dokumenter om samme objekt; duplikater; syv objekter; generelle detaljer for fire typer; status/sum uten utdyping; ulike/like ekstra detaljer; source-only; fritekst; dedup; statusbevaring; objektisolasjon; faktapresedens; uendret 20 000 km; renhet uten mutasjon; rendering av ekte produksjonskomponenter og native disclosure-/kildesemantikk.
22. **Hele testsuiten:** `node --test tests/*.test.mjs`: **1055/1055**, 0 feil, 0 skipped. Baseline 989 beholdt, 66 lagt til. Nytt presentasjon/pris-sett + eksisterende totalskade-sett: **80/80**.
23. **Andre kontroller:** `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack` og `git diff --check`: bestått. `node scripts/verify-analysis-http.mjs`: PASS mot endelig production build, med syntetiske PDF-er, lokal AI-stub og kortlivede testverdier i prosessmiljøet. Ingen reell OpenAI-/Railway-kjøring eller private kunde-PDF-er ble brukt.

Separat kjørte regresjonsgrupper (gruppene overlapper og skal ikke summeres):

| Gruppe | Resultat |
|---|---:|
| Manuell runtime | 1/1 |
| PDF | 21/21 |
| Security | 22/22 |
| Performance | 25/25 |
| Semantic matching/audit | 64/64 |
| Catalog/canonical | 454/454 |
| Document precedence | 23/23 |
| Effective facts | 42/42 |
| Pilot/add-on | 41/41 |
| Fase 2 | 48/48 |
| Progress/pris | 45/45 |
| Premium/mileage | 21/21 |
| Totalskade | 14/14 |
| Vehicle extension/source integrity | 66/66 |
| Object matching/missing product | 60/60 |
| Same-object/full portfolio | 82/82 |

Den faktiske `Comparison`-komponenten er i tillegg nettlesertestet med syntetiske lokale data på desktop 1280 px og mobil 390 px. Kort, lange egenandelstekster, native tastaturåpning/lukking, kilde uten ekstra detaljer, full detaljert sammenligning, komplette/delvise priser og missing-object-advarsel er kontrollert. Målt sidebredde ved mobil: 390/390 px, også med detaljer og full sammenligning åpnet. Testharness og logger ligger under `/tmp`, ikke i prosjektet. Ingen private dokumenter inngår.

### Bevarte grenser og risiko, punkt 24–30

24. Ingen nye AI-kall, embeddings eller nettverkskall er introdusert.
25. Semantic matcher, semantic audit og produksjonsmodell er urørt; ingen typejustering i disse filene.
26. Fase 2, batching, concurrency, streaming/progress og stale-response-beskyttelse er urørt. Nye prissummer følger eksisterende resultater med `useMemo`; native åpning/lukking starter ingen analysepipeline.
27. Object matching/consolidation, provider-/produktidentitet og missing-object-regler er urørt. Prislaget bruker matcherens eksisterende resultat og teller ferdig konsoliderte objekter.
28. Vehicle-extension-katalogene, canonical data, kildeoriginalene og source manifests er urørt.
29. `.env.local` er urørt. Ingen commit, push, reset, revert eller stash er utført.
30. **Gjenværende begrensninger:** den nye komponentaggregasjonen er bevisst begrenset til kompatible kjøretøyobjekter med eksplisitte canonical årsbeløp. Blandede porteføljer bruker eksisterende avtaletotal. Tvetydige eller sammensatte beløp holdes konservativt tilbake. Prislaget kan ikke reparere feil i uttrekket. Fritekst som ikke har strukturerte underfakta vises samlet, ikke som UI-tolkede unntak. Ukjente presentasjonsfamilier bruker eksisterende tekstfallback. Nettleserkontrollen brukte syntetiske data; den reelle piloten er ikke analysert på nytt. Det kjente totalskadeproblemet på 20 000 km er ikke rettet.

### Prisopprinnelse og videre avgrensning, punkt 31–45

31. I det beskrevne 2+2-pilottilfellet, når avtaletotal mangler men de oppgitte objektprisene er sikre, brukes **beregnet logical-object total** i oversikten.
32. Hver beregnet komponent har `origin: calculated_portfolio`, beløp i øre og en bidragsliste med objektindeks, beløp og eksisterende kilder. Dette er lokal visningsmetadata.
33. Completeness beregnes per komponent: complete krever alle relevante logiske objekter priset, ingen feilende dokumenter og ingen konflikt; partial viser en kjent delsum; unavailable betyr at ingen sikker kompatibel sum kan vises; conflicting viser uavklart pris.
34. Avtaletotal beholdes separat med `documented_agreement` eller `manual_agreement`, opprinnelig tekst og eventuelt parsebart beløp. Den erstattes ikke i `insuranceData`. Når ingen objektaggregasjon er mulig, beholdes eksisterende avtale-/manuell prisvisning.
35. Hvis en komplett beregnet total og en parsebar avtaletotal er ulike, flagges konflikten og begge vises. Samlet prisforskjell holdes tilbake. Hvis beregningen er delvis, likestilles ikke delsum med avtaletotal.
36. Sammenlignbart objektsett krever at alle eksisterende grupper er `matched`, og at antall par stemmer med objekttallet på begge sider. `EXACT_OBJECT_ID` og eksisterende `UNIQUE_TYPE_PAIR` aksepteres; prislaget lager ingen egne identitetsregler.
37. Missing objekt blokkerer samlet besparelse selv om hver sides egne analyserte objekter har komplette priser.
38. Ambiguous matching blokkerer samlet besparelse. Uavklart same-side consolidation gjør også sidekomponenten conflicting. Ingen matching etter indeks introduseres.
39. Partial failure blokkerer complete og samlet prisforskjell. Brukeren får beskjed om ufullstendig dokumentanalyse.
40. TFA summeres separat etter eksisterende objektpris-policy. Ingen TFA settes til null for å få regnestykket til å gå opp. Hus/Innbo blandes ikke inn i kjøretøykomponentene.
41. En senere utvidelse til Hus/Innbo kan levere en eksplisitt kompatibilitets-/prisgrunnlagsstrategi som gir dokumenterte årsbeløp til samme origin/completeness/contribution-modell. Den trenger ikke endre object matching eller kreve TFA. Dette er ikke implementert nå.
42. Objektprisene er fortsatt tilgjengelige i objektseksjonene og via «Vis pris per forsikring».
43. «Vis kilde» er tilgjengelig selv når «Se detaljer» mangler, og full teknisk sammenligning beholder eksisterende kilde-/grunnverdier.
44. Ingen rå objekt-ID-er, priser eller nye kundedatafelter er lagt i telemetry, progress eller semantic audit.
45. Ingen persistent datalagring er introdusert. Modeller og summer beregnes lokalt fra eksisterende resultatdata.

## Konseptuelle før/etter-eksempler

| Case | Før | Etter |
|---|---|---|
| A. Rettshjelp: status + sum, ingen ekstra fakta | Kortet kunne gjenta samme tekst i «Se detaljer». | Status og sum vises per side. Ingen utdyping. Kilde kan fortsatt åpnes. |
| B. Rettshjelp: også område/egenandel | Hele oppsummeringen kunne vises både kort og ekspandert. | Status/sum i kortet. Område og full egenandelstekst som strukturerte ekstra rader. |
| C. Maskinskade: flere fakta | Utvalgte forskjellstekster ble gjenbrukt. | Status, alder/km og dokumentert varighet i kortet; øvrige relevante fakta i utdyping. Ingen fritekst tolkes til nye regler. |
| D. To biler | Oversikten kunne si «Pris ikke oppgitt» fordi avtaletotal var null. | På hver side: Forsikringspris **21 975 kr**, TFA **5 599 kr**, Totalt **27 574 kr**, merket beregnet årspris. Ingen 0 kr-besparelse. |
| E. Ett av to objekter priset | Ingen trygg komplett oversikt. | Eksempel: **14 786 kr – Delsum · 1 av 2 objekter priset**. Ingen sikker samlet besparelse. |

Forventningen ved ny reell pilotkjøring er uendret progress og uendret exact matching av de to dokumenterte bilidentitetene, uendrede objektpriser, de sikre sumkomponentene over, færre meningsløse ekspandere, relevante ekstra detaljer og fortsatt kildevisning. Dette forutsetter at uttrekket igjen gir de samme sikre effektive prisfaktaene. Ingen totalskadeverdi skal endres av denne oppgaven.

**PRESENTATION_PRICE_READY**
