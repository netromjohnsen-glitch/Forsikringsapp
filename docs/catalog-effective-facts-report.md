# Katalog, effective facts og presentation integrity

Dato: 24.09.2026. Utgangspunkt: ren `main`, `b6ac0603ac9c9732f72edb71cff2a74c6529e2a6`, 1055 tester. Sluttstatus: **CATALOG_EFFECTIVE_FACTS_PARTIAL**. Oppdatert med brukerens nye dokumentbevis for den konkrete Kasko-avtalen.

Implementasjonen og alle automatiske kontroller er ferdige. Brukerens kontrollerte tidligere reelle analyser dokumenterer Kasko 1 år / 15 000 km og separat årlig kjørelengde 20 000 km. Dette er nå det aksepterte dokumentgrunnlaget og forventede resultatet for denne avtalen. Katalogens 20 000 km må ikke erstatte kundens 15 000 km. PARTIAL gjelder fortsatt eksakt rå uttrekksform i den siste produksjonskjøringen og Veihjelp-observasjonen; ingen private PDF-er eller rå produksjonsuttrekk er undersøkt.

## A–D: observasjon, årsak, rettelse og validering

| Område | Observation | Root cause | Fix | Validation |
|---|---|---|---|---|
| Bilnøkkel | Offentlig eksempel-egenandel på bare én side | En dokumentrad «Ikke dokumentert» sperret hele dekningens katalogdetaljer. Manglende opplysning ble behandlet som en innsigelse. Reprodusert lokalt; koblingen til akkurat produksjonsuttrekket er ikke bevist. | Ukjente dokumentverdier sperrer ikke kvalifiserte katalogfakta. Faktiske dokumentverdier, negativ status og konflikter har fortsatt forrang. Sammensatt nøkkeltekst får separate detaljer. | Silence/unknown, individuell sum/egenandel, composite sum/egenandel/antall, to objekter og begge sider. |
| Veihjelp | 750 vist som forsikringssum, ulik enrichment | Samme unknown-sperre. I tillegg kunne en feil modellnøkkel `veihjelp.grense` overstyre den sikre etiketten «Veihjelp – egenandel», som ble transportgrense og samtidig sperret riktig katalogfelt via lik etikett. Denne formen er reprodusert, men produksjonsformen er ukjent. | Eksplisitte Bil-aliaser prioriterer sikker egenandelsetikett. Deductible knyttes til riktig dekning. Ingen regel utleder egenandel bare fra tallet 750. | Både 750 og 900, dokumentforrang, ingen samtidig sum, symmetrisk katalogeksempel. |
| Mobilitet/familier | Anonyme selected/not_selected eller flere selected | Kortvisningen fjernet etiketten fra statusrader. Flere selvstendige child-dekninger ble dermed visuelt anonyme. | Canonical child-navn beholdes foran status. Samme generelle projeksjon for alle familier. | Mixed, selected/unknown, fire selected, omvendt rekkefølge, annen familie, faktisk React-rendering. |
| Totalskade 20 000 | Feil for den konkrete avtalen: tidligere dokumentresultat sier 15000, separat årlig20000 | Lokal `gjKasko` har allerede `nyverdi.km = Inntil 20 000 km`, direkte fra Kasko fullvilkår side 15. Den lokale kilden og dagens offisielle PDF sier 1 år/20 000 km. Kundens avtale er nå bekreftet til15000 av brukerens tidligere analyseresultat. Produktkvalifisert rad med null canonicalKey ble ikke splittet; gjentatt normalisering kunne dessuten miste intern key. | Eksakt produktkvalifisert totalskaderad normaliseres, og intern dokumentnøkkel bevares. Katalogverdien er bevart som generelt grunnlag, ikke brukt foran kundeverdien. Generell, eksplisitt kildepolicy er lagt til; ingen tallrettelse eller Gjensidige-spesifikk prioritering. Eksisterende isolasjon av årlig/faktisk/maksimal kjørelengde er testet. | Katalogprovenance, dokument 15/17/20 tusen, feil modellnøkkel på årlig kjørelengde, flere kilometeridentiteter, source authority/validity/scope. |

## Lokale offentlige kilder

Alle filer ligger under `catalog/sources/gjensidige/`. Originalene er uendret. README oppgir innhenting 18.09.2026; dette er ikke en gyldighetsdato. Fullvilkårene oppgir ikke separat vilkårsnummer, versjon eller gyldighetsdato i prosjektets metadata. Produktarket har identifikator MOT01. Dette skal ikke fremstilles som dokumentert gyldighet for en bestemt kundes individuelle avtale.

| Fil | Type / brukt innhold | SHA-256 |
|---|---|---|
| `bil-ansvar-alminnelige-vilkar.pdf` | Offentlig fullvilkårseksempel. Generell totalskadeseksjon s.14 er ikke bevis for at Ansvar inkluderer Kasko. | `bbfd85aaeb572102fb295f99d83d12963d7584266bc027e4ed01eda89211f2b2` |
| `Bil-Delkasko-alminnelige-vilkar.pdf` | Offentlig fullvilkårseksempel. Veihjelp 750 i egenandelskolonnen s.1; omfang s.3. Generell totalskadeseksjon s.15. | `90947312022821f8e6233b8d71d5eed13110f54640cf753b992d519809901c88` |
| `Bil-Kasko-alminnelige-vilkar.pdf` | Offentlig fullvilkårseksempel. Bilnøkkel sum 7500/egenandel 1500 og Kasko-egenandel 8000 s.1. Totalskade 1 år/20000 og reparasjonsgaranti 8 år s.15. | `4c9b088ab208453c6437e02c3962f38186c8e86d2f4c106658e634560b783aef` |
| `Bil-Pluss-alminnelige-vilkar.pdf` | Offentlig fullvilkårseksempel. Bilnøkkel 15000 er en sum, ikke totalskadens kilometergrense. Totalskadeseksjon s.15 oppgir 20000. | `c512ffc7dbcfc60737f018aae0d47e2883a300ede36f65ab51d8e50133a7189d` |
| `Bilforsikring-Produktark-MOT01.pdf` | IPID / produktark MOT01; ikke valgt som kilde for `nyverdi.km`. | `32f3428e0f758e7380d54b9aaaa9da994b5f854e1707142f744576d792af9642` |

Offisiell kontroll: [Kasko fullvilkår, side 15](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bil-Kasko-alminnelige-vilkar.pdf) og [Gjensidiges bilproduktside](https://www.gjensidige.no/forsikring/bilforsikring). Begge støttet 1 år/20 000 km ved kontroll. Dette var utviklingskontroll, ikke en ny runtime-avhengighet. Ingen kilde ble erstattet, ingen hash eller originalfil endret.

## Nummerert ferdigrapport

### Del A – asymmetri (1–10)

1. Bilnøkkel: `catalog-enrichment.ts` behandlet en ukjent status med dokumentevidens som en generell sperre mot katalogdetaljer. Det forklarer den reproduserte asymmetrien.
2. Veihjelp: samme sperre, pluss sikker etikett/feil canonical nøkkel som beskrevet i tabellen.
3. Årsakene er delvis felles; feil beløpstype og manglende composite splitting er separate forhold.
4. Asymmetrien oppstod etter dokumentnormalisering ved utvalg av supplemental catalog terms, før sammenligning. Ingen kopiering mellom sider er innført.
5. Kasko-egenandel og reparasjonsgaranti ble ikke rammet av akkurat Bilnøkkel/Veihjelp-foreldrenes unknown-sperre. De er grønne kontrollfelt i samme fixture.
6. Silence og «Ikke dokumentert» er ikke dokumentert motstrid. En ukjent placeholder erstattes i effective-visningen bare når samme nøkkel får en kvalifisert katalogverdi.
7. Eksakte produktfakta, ubetingede hoveddekninger og tilhørende detaljer kan supplere etter eksisterende produkt-/dekningmetadata. Offentlig eksempel beholdes som eksempel.
8. Ukvalifiserte produkter, valgfrie detaljer uten dokumentert valg/hoveddekning, eksplisitt not_selected, dokumentkonflikt og uløst klassifisert kildekonflikt gir ikke aktive katalogvilkår.
9. Leiebil uten dokumentbevis forblir unknown både i Kasko og Pluss. Katalogens mulige dager finnes fortsatt separat i catalog evidence.
10. En dokumentert nøkkel-egenandel på 1000 beholdes på den siden. Andre siden kan fortsatt vise katalogeksempel 1500. Samme prinsipp for sum, veihjelp og kilometergrense.

### Del B – Mobilitet (11–15)

11. Statuslinjer mistet etiketten ved kortets tekstprojeksjon, ikke i coverage-motoren.
12. Den reproduserte Mobilitet-kombinasjonen er Veihjelp selected og Leiebil not_selected. Andre familier kan ha flere selvstendige selected-dekninger. Hvilke child-rader alle produksjonslinjene stammet fra kan ikke bevises uten produksjonsgrunnlaget.
13. `coverage.label` brukes som statusens identitet. Presentation family bestemmer ikke status.
14. Eksempel: «Veihjelp: ✓ Valgt» og «Leiebil: ❌ Ikke valgt». Samme løsning for andre familier og statuser.
15. Kasko Leiebil not_selected består; katalogdetaljer vises ikke som aktive leiebilvilkår.

### Del C – Veihjelp/Bilnøkkel (16–21)

16. 750 kr står i egenandelskolonnen i det offentlige vilkårseksemplet, ikke i forsikringssumkolonnen.
17. Katalogen hadde allerede riktig egenandel. Feilklassifisering er reprodusert med sikker egenandelsetikett og feil modellnøkkel. En modell som bare sier «forsikringssum 750» uten sikker kontekst kan ikke korrigeres ved tallgjetting.
18. Canonical nøkkel er `veihjelp.egenandel`.
19. Begge sider får samme offentlige eksempel der dokumentet ikke har en individuell verdi eller avslag. En individuell 900-verdi vinner bare på sin side.
20. `bilnokkel.grense`, `bilnokkel.egenandel` og `bilnokkel.antall_skader` er separate. Composite dokumenttekst splittes deterministisk; råtekst/provenance beholdes. Summary-parseren gjør ikke en tydelig egenandel til sum.
21. Eksisterende ordlyd «i offentlig vilkårseksempel», `coverageOrigin: catalog`, kilde-note, dokumentnavn, side/punkt og original-URL beholdes. Det fremstilles ikke som kundens avtalte beløp.

### Del D – Totalskade og kildepolicy (22–33)

22. Se kildetabellen. Kasko-dokumentet er faktisk canonical kilde; de andre dokumentene gir kontroll og produktkontekst.
23. Brukerens nye dokumentbevis fastslår15000 km for kundens Kasko-avtale. Ingen av de lokale offentlige Gjensidige-kildene er funnet å angi denne kundespesifikke grensen. Pluss' 15000 kroner for nøkkel er et annet faktum. 15000 km er nå også akseptert avtalegrunnlag fra brukerens tidligere reelle analyser. Testene gjengir bare feltene syntetisk, uten private PDF-er.
24. Kasko fullvilkår side 15 inneholder 20000 km; tilsvarende generell erstatningsregel finnes i øvrige fullvilkårseksempler.
25. Offentlig20000-kilde er `full_terms`; kundens15000 er dokument-/avtalegrunnlag. Dette løses med document > catalog, ikke ved å bytte offentlig katalogverdi eller late som to offentlige kilder motsier hverandre.
26. Vilkårsnummer/versjon/gyldighet er ikke oppgitt for disse fullvilkårseksemplene. Innhentingsdato og webkontroll beviser ikke kundens avtaleperiode.
27. Runtime bruker lokal `gjKasko`, ikke en live produktside.
28. Bevist lokal kjede: `gjKasko` → `nyverdi.km` → resolveCatalogFacts → catalog-enrichment → importantTerms med catalog-origin og side 15 → groupTerms → presentation. Den nye produktkvalifiserte reproduksjonen viser katalogens20000 fylle plass etter manglende normalisering av dokumentets15000. Siste produksjonskjørings rå extraction er fortsatt ikke tilgjengelig for å fastslå at den fulgte akkurat denne grenen.
29. I den syntetiske silent-casen kommer 20000 fra katalogen. Et dokument som eksplisitt angir samme canonical faktum overstyrer katalogen. Presentation endrer ikke tallet.
30. 20000 er en korrekt offentlig katalogverdi, men feil effective verdi for den bekreftede individuelle Kasko-avtalen. Feilen rettes ved å bevare/identifisere dokumentfaktumet15000; ingen tallverdi er hardkodet eller katalogverdi omskrevet.
31. Katalogresolveren har nå semantisk `sourceType` (full_terms > ipid > product_page), dokumentert gyldighetsintervall, provider/type, eksakte productIds og productVersion. Applicability og gyldighet kontrolleres før autoritet; eksakt produktscope kan skille like sterke kilder. Versjonsstrenger sorteres ikke som dato. Like sterke, overlappende/ukjente motstridende verdier gir conflict uten aktiv vinner. Rå evidence beholdes, og resolveren returnerer winners/evidence/reason. Eksisterende uttrykkelig `replacesBase`/produktarv løses først og bevares.
32. Ingen provider-/produktnavn eller faktumverdier inngår i prioritetspolitikken. Syntetisk provider og alternativene 12000/18000 beviser generalitet. Tryg-silence er også testet.
33. Ingen nye 15000/20000-tall er hardkodet i produksjonslogikk. Eksisterende autoritative katalogverdi er uendret.

Viktig avgrensning: eldre `appliesTo` inneholder presentasjonsnavn, ikke nødvendigvis canonical IDs. Feltet er derfor ikke omtolket. Nytt `productIds` har eksplisitt ID-semantikk. Uklassifiserte legacy-kilder følger fortsatt eksisterende komponent-/arvpolicy; metadata migreres ikke automatisk. Gjensidiges offentlige fullvilkår har fått `sourceType: full_terms`, uten å finne på datoer. Dette er ingen full revisjon av alle andre katalogers kildemetadata. `catalogFacts` beholder original evidence; beslutningsobjektet er tilgjengelig fra resolveren, ikke en ny produksjonslogg/telemetry eller UI-konfliktvisning.

### Del E – nye regresjoner (34–42)

34. Dokument 15000 totalskade + 20000 årlig: begge beholdes med forskjellige canonical identiteter. 17000 og 20000 eksplisitt totalskade er også testet.
35. Fullvilkår slår produktside for samme nøkkel; alternative tall, utløpt versjon, fremtidig versjon, feil provider/type/product/version, specificity, same-authority conflict og evidence består.
36. Kundedokument overstyrer samme catalog fact, ikke andre kilometer-/dekningidentiteter.
37. Fire kombinasjoner av reversert objekt-/dokumentrekkefølge og batch completion består gjennom extraction parsing, enrichment, sammenslåing og sammenligning.
38. Syntetisk Kasko: egen dokumentert totalskade 1 år/15000, årlig 20000, Bilnøkkel/Veihjelp-eksempel, Leiebil not_selected, egne priser/TFA består.
39. Syntetisk Pluss: Leiebil og Maskinskade selected, 10 år/200000, dokumenterte leiebildager 60/30/30/15, nøkkelsum15000 og add-on-navn består. Ingen private identifikatorer er brukt i testene.
40. Veihjelp: 750/900, feil modellnøkkel med sikker etikett, catalog-only korrekt beløpstype, symmetri og dokumentoverride består.
41. Bilnøkkel: sum/egenandel/antall, dokumentoverride, summary med bare egenandel, compact/additional uten detaljduplikat består.
42. Mobilitet og annen familie: statusidentitet, mixed/unknown, fire children, kildeknapper og rekkefølge består.

### Del F – bevarte systemer (43–52)

43. Portfolio pricing består, inkludert 21975 forsikringspris + 5599 TFA = 27574 totalt.
44. Presentation/coverage details består, meningsfulle expanders beholdes. Ingen kunstig selected-status legges på totalskadegrenser.
45. Exact object matching består.
46. Same-side og cross-batch consolidation består.
47. Missing og ambiguous object/product består.
48. Snøscooter, Campingvogn, Tilhenger og kildeintegritet består.
49. Fase 2 og syntetisk 10+10 HTTP-flyt består.
50. Semantic matching/audit består, ingen matcher-/auditendring.
51. Dokumentprioritet og effective-fact-regresjoner består.
52. Security/privacy består; ingen private dokumenter eller nye loggverdier.

### Filer og validering (53–69)

53. Endrede eksisterende filer:
    - `app/page.tsx`: child labels og faktakontekst ved kildeknapper, også tilgjengelig navn.
    - `lib/catalog-enrichment.ts`: skille unknown fra avslag/konflikt og bevare dokumentforrang.
    - `lib/coverage-detail-presentation.ts`: canonical child label og fact-scoped kildeassosiasjon.
    - `lib/document-fact-normalization.ts`: sikre etiketter foran feil modellnøkkel; splitte Bilnøkkel-fakta; trygg summary-egenandel; eksakt produktkvalifisert totalskade og idempotent intern dokumentidentitet.
    - `lib/insurance-normalization.ts`: eksakte aliaser og deklarerte child-detail-relasjoner.
    - `lib/product-catalog.ts`: minimale source metadata-typer og kobling til kildepolicy etter eksisterende arv.
    - `lib/gjensidige-catalog.ts`: kun `full_terms`-klassifisering av offentlige fullvilkår.
54. Nye filer:
    - `lib/catalog-source-resolution.ts`: generell lokal source resolution med beslutningsgrunnlag.
    - `tests/catalog-effective-facts.test.mjs`: 34 asymmetri-, semantikk-, status- og pipeline-regresjoner.
    - `tests/catalog-source-resolution.test.mjs`: 14 source-policy-regresjoner.
    - `tests/presentation-integrity.test.mjs`: 10 tester av faktisk React-visning og faktakilder.
    - `tests/document-totalskade-survival.test.mjs`:16 tester gjennom samtlige trinn, alternative tall, kildeopprinnelse, konsolidering, produkt-/typescope og gjentatt normalisering.
    - `docs/catalog-effective-facts-report.md`: denne rapporten.
55. Ingen filer under `catalog/sources` eller source manifests endret. Gjensidige TypeScript-katalogen har kun metadataendringen nevnt ovenfor.
56. Full_terms-klassifisering beskriver faktisk dokumenttype. Ingen beløp, grenser, versjoner, gyldighetsdatoer, PDF-er eller hashes er omskrevet.
57. 74 nye tester, se grupper over og tabellen nedenfor.
58. Totalt 1129 tester, opp fra1055.
59. `node --test tests/*.test.mjs`: 1129 bestått, 0 feil, 0 skipped.
60. `npx tsc --noEmit`: bestått.
61. `npm run lint`: bestått.
62. `npx next build --webpack`: bestått.
63. `git diff --check`: bestått.
64. `node scripts/verify-analysis-http.mjs`: PASS med syntetisk PDF, lokal AI-stub, production-server, streaming, 10+10, object consolidation, add-ons og privacy. Desktop1280 og mobil390 kontrollert med de faktiske React-komponentene og syntetiske data: ingen horisontal overflyt, tastaturdisclosures og kildekontekst fungerer. Dette er ikke en privat pilotkjøring eller et ekte OpenAI-kall.
65. Ingen nye AI-kall, modellbytte, runtime-web eller endret concurrency. Resolveren er lokal. Performance-regresjoner består; ingen ny produksjonslatency-måling påstås.
66. `.env.local` er urørt.
67. Ingen private kunde-PDF-er brukt, analysert eller lagt til.
68. Ingen commit, reset, revert, stash eller rebase.
69. Ingen push eller deployment-konfigurasjonsendring.

## Resultater per testgruppe

Grupper overlapper og skal ikke summeres til suite-totalen.

| Gruppe | Bestått |
|---|---:|
| Nye asymmetri / Bilnøkkel / Veihjelp / mileage / familie / tobil-pipeline | 34/34 |
| Ny dokument-totalskadeoverlevelse, etter siste dokumentbevis | 16/16 |
| Ny source priority | 14/14 |
| Ny presentation integrity, faktisk React/SSR | 10/10 |
| Eksisterende portfolio price / coverage detail presentation | 66/66 |
| Runtime/manual | 1/1 |
| PDF | 21/21 |
| Security | 22/22 |
| Performance | 25/25 |
| Semantic matching/audit | 64/64 |
| Catalog/canonical inkl. nye katalogtester | 502/502 |
| Document precedence | 23/23 |
| Effective facts | 42/42 |
| Pilot/add-ons | 41/41 |
| Fase 2 | 48/48 |
| Progress/pris | 45/45 |
| Premium/mileage | 21/21 |
| Totalskade | 14/14 |
| Vehicle extensions/source integrity | 66/66 |
| Object matching/missing product | 60/60 |
| Same-object/full-portfolio | 82/82 |

## Tillegget: presentation integrity

- Anonyme statuser skyldtes fjerning av radens identitet i compact projection. Nå følger canonical child label hver status, også når flere children er selected. Ingen felles family-status beregnes.
- Maskinskade beholder selected og egne alder/km-rader. Å vise «Maskinskade: ✓ Valgt» under Maskinskade-header er bevisst tillatt og konsistent; ingen ukjent status omskrives.
- Totalskade har konkrete alder/km-fakta og får ingen ny selected-rad. Ingen generell regel skjuler eksisterende mixed/negative/unknown-statuser som «redundante».
- Kildeprosjektering bruker canonical fact key + side + faktumets provenance, ikke arrayposisjon eller nærmeste knapp. Samme dokument kan nå ha egne knapper for flere fakta.
- Coverage-status bruker kilder fra evidens med den aktuelle statusen, ikke den aggregerte kildeposen som også kan inneholde andre detaljer.
- Knapper har synlig navn/verdi og tilgjengelig navn «Vis kilde: [faktum]: [verdi]». Sammensatt totalskadevisning beholder separate kilder for alder og km.
- Offentlige eksempler beholder eksempelordlyd og offentlig kilde-note i kildevisningen; dokumentgrunnlag beholder egne dokumentreferanser. Ingen kilde gjøres om til kundeavtale, og ingen universell opprinnelsesetikett gjettes for eldre kilder uten metadata.
- 10 nye integritetstester dekker fire selected, mixed, Maskinskade, totalskade, fem source entries, delt kilde, offentlig/dokument, omvendt kilde-/dekningrekkefølge og isolasjon av statuskilden.

## Konkret sjekkliste for neste reelle 2+2-pilot

Kjør manuelt etter separat godkjent publisering; denne oppgaven publiserer ikke.

1. Første kjente bil matches nøyaktig mot samme objekt på tilbudssiden, uansett PDF-rekkefølge.
2. Andre kjente bil matches nøyaktig mot sitt objekt. Ingen pris-/dekninglekkasje mellom dem.
3. Komplett porteføljepris: 21975 + 5599 =27574, dersom dokumentenes prisgrunnlag er uendret og komplett.
4. Kontroller hver objektpris/TFA/total mot respektivt dokument.
5. Bilnøkkel sum og egenandel står som forskjellige fakta.
6. Offentlig nøkkel-egenandel vises symmetrisk når relevant, men individuell avvikende verdi beholdes på riktig side.
7. Veihjelp750 er egenandel; hvis produksjonsuttrekket fortsatt sier forsikringssum, noter faktumets label/key/origin lokalt uten å dele privat PDF.
8. Mobilitet har navngitte child-statuser, ingen anonyme motstridende linjer.
9. Kasko Leiebil er fortsatt ikke valgt.
10. Pluss Leiebil er fortsatt valgt.
11. Pluss Maskinskade er fortsatt valgt; add-on-linjen gjenspeiler dokumentvalgene.
12. Pluss dokumentert Maskinskade10år/200000 beholdes, og leiebil60/30/30/15 er bevart.
13. Kasko skal vise1år/15000 fra dokumentet; Pluss3år/60000. Dette er akseptert dokumentbevis fra brukeren. Kontroller at Vis kilde viser dokumentprovenance, ikke gjKasko, for disse verdiene. Katalogens20000 skal ikke være effective Kasko-grense.
14. Årlig kjørelengde, faktisk kilometerstand og avtalt maksimal kilometerstand holdes separat fra totalskade/maskin.
15. Se detaljer finnes bare når den tilfører innhold; Maskinskade og Totalskade beholder konkrete grenser.
16. Vis kilde åpner riktig fact-/child-grunnlag, offentlig eksempel fremstår ikke som kundeavtale, og de samme kontrollene fungerer på mobil.

Den konkrete avtalens15000 er ikke lenger usikkert. Det gjenstående bevisgapet er hvilken rå uttrekksform den siste produksjonskjøringen hadde, samt nøyaktig Veihjelp-feilform, ikke en kjent feilet test. Ikke tving tall eller symmetri for å skjule dette. **CATALOG_EFFECTIVE_FACTS_PARTIAL**.

## Nytt dokumentbevis: presis tracing av totalskade

Forventningen for denne avtalen er nå uttrykkelig **Kasko1år/15000**, **årlig20000**, **Pluss3år/60000**. Min tidligere vurdering av at den offentlige kilden støttet20000 var korrekt for katalogen, men utilstrekkelig til å vurdere kundens effective avtaleverdi. Brukerens nye bevis avgjør dette skillet.

| Trinn | Funn og kontroll |
|---|---|
| Extraction/schema | Schemaet tilbyr allerede nyverdi.alder, nyverdi.km og nyverdi.grenser. Korrekt separate nøkler beholdes. Ingen modell-/promptendring er nødvendig for den reproducerte normaliseringsfeilen. Dersom AI helt utelater dokumentverdien, kan lokal etterbehandling ikke rekonstruere den. |
| Document fact normalization | Før rettelsen: «Totalskadegaranti – Kasko» med hele setningen og null canonicalKey ble ikke gjenkjent, mens «Totalskadegaranti» ble det. Den produktkvalifiserte teksten beholdt15000 som fritekst, men produserte ingen nyverdi.km. |
| Gjentatt normalisering | canonicalKey konverteres til intern key. En senere normalisering leste ikke denne interne nøkkelen. Testen med en korrekt canonical dokumentnøkkel og ellers generell etikett reproduserte identitetstap. Bevar nå key fra interne document-fakta, med eksisterende type-/etikettkontroller foran. Raw schema tillater ikke innsendt key/coverageOrigin. |
| Same-object consolidation | Den ordinære HTTP-batchflyten lagrer rå documentRecords før enrichment. En korrekt separat canonicalKey ble ikke borte her i testene. Ingen consolideringsregel er endret. Produktkvalifisert tekst normaliseres nå også korrekt når den kommer fra en egen batch for samme objekt. |
| Catalog enrichment/effective facts | Uten dokumentets canonical nøkkel fylte gjKasko20000 plassen. Med dokumentnøkkelen er denne plassen opptatt av dokumentetsX, og offentligY beholdes bare som catalog evidence. |
| Comparison | groupTerms mottar nyverdi.km=X fra document, og kjoretoy.kjorelengde=20000 som et separat faktum. Ingen numerisk krysskobling. |
| Presentation | Den eksisterende limitPair-projeksjonen viser1år/X mot3år/60000. Ingen tallrettelse i UI. Sources beholder document-opprinnelse gjennom sanitizer. |

Produktkvalifikatoren matches eksplisitt mot objektets produktnavn/canonicalProductName etter eksisterende ordnormalisering. Ingen hardkodet Gjensidige, Kasko, Pluss eller kilometerverdi. Feil produktkvalifikator, Tilhenger og generisk kilometeretikett uten sikker nøkkel får ikke Bil-totalskadeidentitet. Tryg testes med18000 foran sitt generelle kataloggrunnlag; Gjensidige testes med15000,17000 og12000 foran20000.

16 nye regresjoner:9 kombinasjoner (3 verdier × separate/produktkvalifiserte/canonical sammensatte rader) med kontroll etter extraction, normalization, enrichment, merge, sanitizer, comparison og limitPair;1 cross-batch samme objekt i begge completion-rekkefølger;1 idempotens;1 annen provider;1 feil produkt;1 feil kjøretøytype;1 tvetydig label;1 full tobilportefølje med reversert rekkefølge og begge kundeverdier. Ingen eksisterende arbeid forkastet.

Dette beviser at de dokumenterte inputformene nå overlever. Det er ikke bevis for at en rå siste produksjonsrespons som vi ikke har sett inneholdt samme form. Den begrensningen endrer ikke avtaleverdien eller regelen document > catalog.
