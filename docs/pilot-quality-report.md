# Pilot Quality – pris, totalskade og progressiv presentasjon

Kontrollert 24.09.2026. Utgangspunkt: ren arbeidskopi på `main`, commit `e2c248835f0f4be4f02cfa2d4bf16f0b874fc1dd`, oppgitt baseline 1129 tester. Sluttresultat: **1167/1167**, 38 nye tester. Ingen publisering.

## Viktig avgrensning av beviset

To konkrete feilmekanismer er reprodusert og rettet. Hele den syntetiske 2+2-flyten, inkludert faktisk React-visning, gir riktige priser og totalskadegrenser. Testene bruker syntetiske objektidentifikatorer og brukerens oppgitte faktaverdier, ikke private PDF-er.

**Råuttaket fra den reelle produksjonskjøringen er ikke tilgjengelig i denne kontrollen.** Det kan derfor ikke fastslås at den reelle kjøringen hadde nøyaktig samme representasjon som de nye regresjonene. Særlig prisreproduksjonen ga «Motstridende prisopplysninger», mens brukeren rapporterte «Ikke dokumentert». Dette er ikke samme observerte tilstand, selv om begge stopper en gyldig sum. Rapporten skiller mellom bevist lokal feil og uavklart produksjonsårsak.

## Pris – punkt 1–8

1. **Root cause, reprodusert:** `vehiclePrices()` kunne tolke `14786 kr` og `14 786 kr` som samme årlige beløp. `portfolioPrice()` avviste likevel den sammensatte visningsteksten fordi den inneholdt `·`. Konsolidering kunne dessuten registrere tekstforskjellen som en faktakonflikt. Den eksakte årsaken til produksjonens «Ikke dokumentert» er fortsatt ikke dokumentert.
2. **Tapspunkt:** objektprisen hadde gyldig numerisk verdi; porteføljens konflikt-/completeness-kontroll fjernet bidraget. UI viste deretter porteføljestatusen. Objektidentitet, extraction, sumformel og prisdata ble ikke endret.
3. **Forsikringspris/TFA:** i reproduksjonen hadde disse én tekstrepresentasjon og ble ikke rammet. I produksjonen kan vi ikke bevise hvorfor akkurat disse to feltene overlevde uten rådata.
4. **Aggregering:** summerer fremdeles dokumenterte priser fra ferdig konsoliderte logiske objekter. Gjenbruker eksisterende strenge `annualAmount` og objektprisens numeriske resultat. Flere tekstformer av samme beløp teller én gang. Ingen total rekonstrueres fra premie + TFA.
5. **Completeness:** forskjellige beløp, uavklarte objekter, uleselige prisuttrykk, delvise dokumentfeil og manglende total behandles konservativt. Tekstlig konflikt ignoreres bare når samtlige konfliktverdier kan parses og er numerisk identiske. Månedlige priser eller sammensatte beløp godtas ikke som årsbeløp.
6. **2+2:** begge sider får forsikringspris **21 975 kr**, TFA **5 599 kr**, total **27 574 kr**. To objekter, ingen dobbelttelling. Kontrollert gjennom batch/enrichment/consolidation/sanitizer/comparison og faktisk UI.
7. **Rekkefølge:** åtte kombinasjoner av sidebytte, dokumentrekkefølge og batch completion order består. Andre beløp: 11 111 + 22 222 = 33 333 på begge sider.
8. **Partial:** 2 av 3 objekt-totaler gir delsummen 27 574 med `partial`, ikke komplett total. Objektet uten total får ikke en utledet total. Eksisterende tester hindrer prisbesparelseskonklusjoner for ulike/manglende objektsett.

## Totalskade – punkt 9–23

9. **Første divergens:** document fact normalization. Teksten «inntil 1 år fra førstegangsregistrering og inntil 15 000 km» ble avkortet ved `førstegangsregistrering`. Formen «fra første registreringsdato» ble ikke avkortet.
10. **Reprodusert 20 000-bane:** den eksplisitte kilometergrensen ble borte før enrichment. Katalogens Kasko-grense 20 000 fikk derfor fylle et tilsynelatende tomt felt. Det er denne konkrete kodebanen som er bevist, ikke ordlyden i produksjonens råuttak.
11. **Forrige fix:** sikret produktkvalifisert navn og canonical identity ved gjentatt normalisering. Den endret ikke grenseavskjæringen inne i verditeksten.
12. **Rettelse:** et eksplisitt tidsanker `fra/etter/siden førstegangsregistrering` regnes ikke som nytt kjøretøyfelt. Et faktisk felt «Førstegangsregistrering: …» stopper fortsatt dekningsteksten. Kilometerstand og årlig kjørelengde stopper fortsatt dekningens kontekst.
13. **Gjentatt normalisering:** canonical `nyverdi.km` og dokumentopprinnelse overlever; idempotens er testet etter full pipeline.
14. **Consolidation:** eksisterende mekanisme er urørt. Både helrecords og dupliserte/fraksjonerte records testes gjennom samme batch/consolidation-flyt; eksisterende cross-batch-tester består.
15. **Enrichment:** eksisterende document > catalog-policy er urørt. Når normaliseringen bevarer X som `nyverdi.km`, vinner X over katalog Y. Katalogens originale 20 000 er ikke endret.
16. **Existing:** syntetisk Kasko 1 år / 15 000 km.
17. **Offer:** syntetisk Kasko 1 år / 15 000 km.
18. **Side swap:** samme resultat.
19. **Reversert dokument-/batchrekkefølge:** samme resultat, samme objekter sammenlignes.
20. **Alternative X/Y:** dokument 12 000 mot syntetisk katalog 18 000, og dokument 12 345 mot syntetisk katalog 98 765. Testet for Gjensidige og Tryg. Katalogverdier var kun midlertidige testdata i prosessminnet og ble gjenopprettet; ingen katalogfiler er endret.
21. **Årlig kjørelengde:** 20 000 km per forsikringsår beholdes separat som `kjoretoy.kjorelengde`. Kilometerstand 164 000 blir ikke totalskadegrense.
22. **Pluss:** 3 år / 60 000 km består på begge sider.
23. **Ingen hardkoding:** rettelsen inneholder ingen kunderegistreringer, provider-betingelser eller pilotens kilometer-/prisverdier. Verdiene finnes bare i syntetiske tester/rapport.

## Presentasjon – punkt 24–36

24. **Kompakt:** navngitt dekning, status og eksisterende hovedbeskrivelse. Sum, egenandel, antallsgrenser, varighet og øvrige detaljer flyttes til «Se detaljer». Alder/km beholdes som kompakte ankerverdier.
25. **Beskrivelse mot grenser:** bruker allerede resolverte coverage-evidence og strukturerte detaljer. Semikolonbaserte repetisjoner kan faktoreres ut bare når resten består av bokstavelige eksisterende labels/verdier. Urepresenterte forbehold beholdes i fulltekst. Ingen nye canonical fakta, NLP-ekstraksjon eller semantisk tolkning i UI. Ustrukturert tekst beholdes; kortvisning kan derfor fortsatt bli lang når struktur mangler.
26. **Bilnøkkel:** «✓ Valgt» + «Tapt, stjålet eller skadet bilnøkkel». Detaljer: 7 500 kr forsikringssum, 1 500 kr egenandel og maks ett skadetilfelle når disse finnes strukturert. En variant med 15 000 kr på tilbudssiden viser beløpene ved siden av hverandre.
27. **Maskinskade:** navngitt status, alder og km er fortsatt synlig kompakt; full opprinnelig ordlyd, egenandeler og øvrige fakta er tilgjengelig i detaljene. Ingen status-/dekningsregel er endret.
28. **Totalskade:** kompakt alder/km-par. Komponenter med hver sin kilde i detaljene. Ingen tilfeldig felles kilde til det beregnede visningsparet.
29. **Familier:** hver child coverage har synlig navn før de to sidene. Leiebil, Veihjelp, Bilnøkkel m.fl. får ikke anonyme statussymboler.
30. **Unknown:** «— Ikke dokumentert» bevares. Ingen oppfunnet kildeknapp for et ukjent dekningsutsagn. Eksplisitt «Ikke valgt» kan ha sin dokumentkilde.
31. **Kilder:** står direkte under sitt faktum og sin side. Separat «Kilder – eksisterende/nytt tilbud»-dump er fjernet fra disse kortene. Eksisterende full detaljtabell og overordnede tjenestekilder er fortsatt tilgjengelige.
32. **Dedup:** side + fact identity + dokument-ID/fil/side/punkt/dokumentrolle. Samme kilde til ulike fakta beholdes per faktum. Ulike kilder til samme faktum beholdes. Ingen label-, DOM-, arrayposisjons- eller fuzzy matching for kildeassosiasjon.
33. **Opprinnelse:** kontrollen viser «Vis kilde · kundedokument» eller «Vis kilde · offentlig vilkår» før åpning, basert på eksisterende origin-metadata. Generelle eksemplers eksisterende forbehold beholdes. Ingen nedprioritert katalogverdi fremstilles som effektiv kundeverdi gjennom denne endringen.
34. **Avledede verdier:** porteføljesum er fortsatt merket beregnet og har ingen falsk PDF-kilde. Objektpriser har egen dokumentasjon. Totalskadeparet har kilde per komponent.
35. **Mobil:** kontrollert 390 × 844. Existing/Offer stables, tekst brytes, ingen horisontal side-overflow (scrollWidth = viewport = 390). Desktop 1280 × 900 har side-ved-side-visning. Detaljtabellen beholder eksisterende egen scroll.
36. **Tastatur/tilgjengelighet:** native `details/summary`, meningsfulle accessible names med side/faktum/verdi, synlig fokus. Enter åpnet/lukket detalj- og kildekontroller. Nettleserens accessibility tree viste collapsed/expanded korrekt; native semantics brukes fremfor en statisk `aria-expanded` som kunne blitt utdatert. Full detaljert sammenligning kunne fortsatt åpnes.

## Før/etter – faktisk implementert

| Område | Før, lokal reproduksjon | Etter |
|---|---|---|
| Porteføljetotal | To numerisk like totalformer utløste konflikt; gyldig bidrag ble forkastet | 27 574 kr begge sider, én pris per logisk objekt |
| Kasko | «fra førstegangsregistrering» kuttet vekk 15 000; katalog 20 000 fylte inn | 1 år / 15 000 km; årlig kjørelengde 20 000 separat |
| Bilnøkkel | Status/beløp kompakt, kilder i separat liste | Navn/status/beskrivelse kompakt; sum/egenandel/antall i detaljer, kilder ved verdien |
| Kilder | Brukeren måtte koble separat kildeliste tilbake til fakta | Kontroll ved faktum, synlig opprinnelse, side og verdi i accessible name |
| Totalskade | Kompakt par og løs kildeliste | Kompakt par og komponentkilder i detaljer |

## Filer – punkt 37–42

37. **Endrede produksjonsfiler:**
    - `app/page.tsx`: navngitte fakta, sidevisning og nærliggende kildekontroller i konseptkort; opprinnelse og fokus på kildekontrollen.
    - `lib/coverage-detail-presentation.ts`: progressiv detaljmodell, eksisterende hovedbeskrivelse, faktaspesifikke kilder og dedup.
    - `lib/comparison.ts`: bærer eksisterende source-origin videre til presentasjonen. Ingen endring i matching, effektive verdier eller prioritering.
    - `lib/portfolio-price-presentation.ts`: numerisk konsistent behandling av like prisrepresentasjoner.
    - `lib/document-fact-normalization.ts`: skiller registreringsanker i aldersvilkår fra et nytt kjøretøyfelt.
38. **Nye produksjonsfiler:** ingen.
39. **Endrede tester:** `tests/catalog-effective-facts.test.mjs`, `tests/presentation-integrity.test.mjs`, `tests/presentation-price.test.mjs`. Oppdaterte presentasjonsforventninger der oppgaven uttrykkelig flytter grenser/kilder. Ingen korrekthetsgarantier fjernet.
40. **Nye tester/helpers:** `tests/pilot-quality.test.mjs` (26), `tests/pilot-quality-presentation.test.mjs` (12), `tests/helpers/pilot-quality.mjs` (delt syntetisk pipeline-fixture).
41. **Dokumentasjon:** denne rapporten, `docs/pilot-quality-report.md`.
42. **Kataloger/originalkilder/manifester:** ingen endringer eller nye kilder. Midlertidig UI-bundle og kjørelogger ligger utenfor repoet i `/tmp`.

## Sikkerhet – punkt 43–50

43. Ingen nye AI-kall; syntetisk runtime bruker eksisterende lokal AI-stub.
44. Ingen fuzzy matching. Eksplisitt normalisering og bokstavelig presentasjonsfaktorering.
45. Ingen ny runtime web lookup.
46. Ingen nye persistent stores.
47. Ingen PII lagt til telemetry.
48. Ingen objektidentifikatorer lagt til audit/progress. Eksisterende privacy-regresjoner består.
49. `.env.local` er ikke endret eller åpnet som del av rettelsen.
50. Ingen private kunde-PDF-er brukt eller lagt i repo/tests. Ingen commit/push/reset/revert/stash.

## Validering – punkt 51–62

51. **Totalt:** 1167 tester.
52. **Nye:** 38, opp fra 1129.
53. **Full suite:** `node --test tests/*.test.mjs`: 1167 bestått, 0 feil, 0 skipped.
54. **Pris:** eksisterende presentation/price-testfil og nye pipeline-pristester består; formatting-duplikater, reell konflikt, ugyldig årsformat, partial, ingen rekonstruksjon og alternative beløp.
55. **Totalskade:** nye anker-/pipeline-/X/Y-regresjoner, eksisterende 16 document-survival-tester og 14 totalskade-presentasjonstester består.
56. **UX/kilder:** 12 nye progressive presentation-tester + 10 eksisterende presentation-integrity-tester består. Generisk ikke-Bilnøkkel-dekning med beskrivelse/sum/egenandel/varighet er testet. Flere kilder, duplikater, rekkefølge, ukjent og ikke-valgt er testet.
57. **Eksisterende grupper, særskilt kjørt:**

| Gruppe | Bestått |
|---|---:|
| Manual runtime | 1/1 |
| PDF | 21/21 |
| Security | 22/22 |
| Performance | 25/25 |
| Semantic matching/audit | 64/64 |
| Catalog/canonical | 502/502 |
| Document precedence | 23/23 |
| Effective facts | 42/42 |
| Pilot/add-on | 41/41 |
| Fase 2 | 48/48 |
| Progress/pris | 45/45 |
| Premium/mileage | 21/21 |
| Totalskade presentation | 14/14 |
| Vehicle extensions/source integrity | 66/66 |
| Object matching/missing products | 60/60 |
| Same-object/full-portfolio | 82/82 |

Gruppene overlapper og skal ikke summeres til totalen.

58. `npx tsc --noEmit`: bestått.
59. `npm run lint`: bestått.
60. `npx next build --webpack`: bestått. Ingen deployment-endring.
61. `git diff --check`: bestått.
62. `node scripts/verify-analysis-http.mjs`: PASS. Syntetisk PDF → stubbet AI → enrichment → response; 10+10, konsolidering, syv objekter, samtidighet, sikker upload, partial failure og tilgangskontroll. Ingen produksjonsanalyse eller privat PDF kjørt.

## Ekstern bruker – punkt 63–67

63. Navn → valgt/ikke valgt → konkret verdi → detaljer → kilde er nå synlig uten kjennskap til arkitekturen. At en ekstern bruker faktisk klarer seg uten opplæring må fortsatt bekreftes i brukertesten; lokal UI-kontroll er ikke brukerforskning.
64. TFA, hovedforfall, fullverdi, vilkårseksempel og betinget fordel kan fremdeles kreve forklaring for privatbrukere.
65. Provenance, skadegrad, egenandelsintervaller og avtale/vilkår-forbehold er nyttige for rådgiveren, men kan være tungt språk for privatbrukeren. Ordlyden er ikke omskrevet.
66. Samme progressive UI er et rimelig felles utgangspunkt; ingen B2C/B2B-modus er innført. Nyttige signaler fra ekstern tester bør avgjøre videre forenkling.
67. Full rå detaljtabell, dokumentgrunnlag og kompliserte intervaller kan vurderes som en senere avansert visning. Ikke implementert.

## Gjenstående avklaringer, klassifisert

- **CORRECTNESS_FOLLOWUP:** Produksjonens nøyaktige prisrepresentasjon må avklares gjennom kontrollert ny pilotkjøring eller et personvernvennlig, syntetisk reproduksjonsgrunnlag fra den aktuelle formen. Den reproduserte prisfeilen ga en annen status enn rapportert i piloten. Ikke påstått løst bare fordi testene er grønne.
- **CORRECTNESS_FOLLOWUP:** Normaliseringsfeilen for «førstegangsregistrering» er bevist og rettet, men produksjonens faktiske uttrekksordlyd er ikke sett. Kasko 15 000 må derfor bekreftes i ny pilotkjøring før produksjonsårsaken erklæres endelig lukket.
- **UX_FOLLOWUP:** Eksisterende Important Differences-policy kan fremdeles vise identiske familieopplysninger og lange betingede fordeler. Ingen ranking-/priority-redesign i denne oppgaven.
- **UX_FOLLOWUP:** To numerisk identiske prisformer kan fortsatt stå som `14786 kr · 14 786 kr` i objektets opprinnelige visning. Porteføljen summerer korrekt én gang; originalverdier er ikke skrevet om.
- **UX_FOLLOWUP:** Når beskrivelsen mangler struktur eller har et forbehold som ikke kan faktoreres tapsfritt, beholdes fulltekst. Det er en bevisst informasjonsbevaring, ikke skjult forkorting.
- Ingen ny, sikkert reprodusert correctness-blocker står uløst i den validerte syntetiske flyten. Produksjonsverifikasjonen ovenfor er likevel ikke erstattet av syntetiske tester.

## Fem spørsmål til ekstern pilotbruker

1. Hva i resultatet var uklart, særlig valgt/ikke valgt, pris og begrensninger?
2. Fant du hovedforskjellene raskere enn ved å lese dokumentene selv – hva tok unødvendig tid?
3. Gjorde kildevisningen det enkelt å kontrollere en bestemt verdi og stole på resultatet?
4. Hvilke opplysninger forventet du, men fant ikke eller måtte lete lenge etter?
5. Ville du brukt tjenesten neste gang du sammenligner forsikringer, og hva måtte eventuelt vært annerledes?

Arbeidet er stoppet før publisering. Lokal implementasjon og validering er ferdig; den eksakte produksjonsårsaken er ikke fullt dokumentert. Derfor gis ikke en ubetinget READY-status.

PILOT_QUALITY_PARTIAL
