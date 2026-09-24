# Pilot correctness – determinisme, pris og kilder

Status: **PILOT_DETERMINISM_PARTIAL**.

Arbeidet startet fra ren `main` på `4185ddc9262f39941dc3de66cf1f6facbacaf53f`, med 1167 beståtte tester. Sluttresultatet har 1211/1211 beståtte tester. Ingen commit eller push er utført.

Tre feilmekanismer er reprodusert og rettet: rått providernavn i presentasjonen, avvisning av sikre canonical årsbeløp med forklarende tekst, og katalogetiketter som blokkerte et canonical faktum uten å gi dokumentfeltet samme faktanøkkel. Identiske objektpriser og identiske betingede katalogfordeler vises heller ikke lenger som viktige forskjeller.

Den rapporterte produksjonsasymmetrien i totalskade er **ikke lokalisert**. Alle prøvde lokale baner bevarer dokumentets kilometergrense og dokumentkilde på begge sider. Produksjonens extraction-/mellomresultat foreligger ikke, og ingen privat PDF er åpnet eller analysert. Rapporten skiller derfor mellom påviste lokale feilmekanismer og uavklart årsak i den konkrete produksjonskjøringen. Det ville være feil å erklære den reelle totalskadefeilen lukket.

## Provider – punktene 1–7

1. Overskrift, tabellhode og selskapsrad brukte `company` direkte. Juridisk råtekst som «Gjensidige Forsikring ASA» ble dermed vist selv når produktet allerede var sikkert katalogkoblet.
2. Eksisterende aliasnormalisering gir begge navn `providerId=gjensidige`. Dette er verifisert gjennom hele den syntetiske banen med Kasko og Pluss. Oppgavens beskrivelse av positive katalogstatuser er forenlig med dette; produksjonens komplette rårespons er ikke tilgjengelig for separat inspeksjon.
3. Navneforskjellen er ikke den påviste prisårsaken. Objektmatch bruker objektidentitet; same-side konsolidering bruker allerede canonical provideridentitet. Produktkatalogen støtter aliaset. Prisfunksjonene bruker objektenes prisfakta, ikke selskapsnavnet. Disse mekanismene er ikke endret.
4. `providerDisplayName` bruker sikker katalogreferanse med provider/product/version. Uten produktreferanse brukes eksisterende eksakte provideraliaser, og navn velges bare hvis providerens katalogprodukter har ett entydig displaynavn. Eksakt produktreferanse bevarer kanalnavn når samme forsikringsgiver har flere distribusjonskanaler. Avtaleoverskriften kan bruke objektenes felles sikre displaynavn.
5. Hjelperen er ren presentasjon. `company`, dokumentopplysninger, record evidence og kildeinnhold overskrives ikke. Rånavnet beholdes blant annet i «Vis dokumentgrunnlag».
6. Ukjent provider eller tvetydig kanal beholder dokumentert navn. Ingen generisk fjerning av «Forsikring AS», fuzzy matching eller gjetting er lagt til.
7. Testen med syntetisk `providerId=nordlys` viser «Nordlys» for både «Nordlys» og «Nordlys Forsikring AS» når sikker produktreferanse finnes. Uten denne referansen beholdes det ukjente juridiske navnet. Testene kontrollerer også at originalobjektet ikke muteres.

## Porteføljepris – punktene 8–17

8. Reprodusert feilmekanisme: `annualAmount` godtok bare et rent beløp med en begrenset valuta-/årsendelse. Et canonical `premie.total` med teksten «kr 14 786 etter rabatter, inklusive trafikkforsikringsavgift» fikk `amount=null`. Når alle tre prisfelt hadde slike påheng, fikk porteføljen null prisede bidrag. UI-grenen krevde minst ett parset bidrag eller en konflikt og falt derfor tilbake til eldre `totalAnnualPremium`, som var null. Resultatet ble «Total årspris – Pris ikke oppgitt». Dette gjenskaper nøyaktig visningsgrenen, men kan ikke bevises å være eneste årsak i produksjonen uten de faktiske felttekstene.
9. Verditeksten forsvant ikke. Bruddet oppsto mellom `vehiclePrices` sin beløpstolkning, `portfolioPrice` sin fullstendighetsvurdering og valget av toppkomponent i `Comparison`.
10. Providernavnet inngår ikke i disse operasjonene. Testen varierer dette uavhengig av prisformatet.
11. Rene beløp på Offer-siden passerer den tidligere parseren. Dette forklarer den reproduserte asymmetrien. Om de reelle Offer-feltene hadde akkurat denne formen er ikke separat verifisert.
12. Samme parser med samme canonical prisnøkkel brukes på begge sider og ved vurdering av tekstlige konsolideringskonflikter. Ingen gren velges etter Existing/Offer. En kompatibel portefølje med flere objekter beholder nå porteføljekomponenten også når beløp er utilgjengelige; da vises eksplisitte manglende-/konfliktstatuser, ikke en misvisende legacy-fallback. Dokumentert avtaletotal beholdes separat i komponenten.
13. Hele syntetiske 2+2-banen gir følgende:

    | Side | Forsikringspris | TFA | Totalt |
    |---|---:|---:|---:|
    | Existing | 21 975 kr | 5 599 kr | 27 574 kr |
    | Offer | 21 975 kr | 5 599 kr | 27 574 kr |

14. Bytte av sidene gir samme komplette summer og samme dokumentfakta.
15. Omvendt dokument-/objektrekkefølge gir samme summer og eksakte objektpar. Omvendt batch-fullføringsrekkefølge inngår også.
16. Manglende total på ett objekt gir delsum fra det andre, merket delvis. Totalen rekonstrueres ikke ved å legge sammen premie og TFA. Uklart årsgrunnlag gir utilgjengelig beløp; månedsbeløp summeres ikke som årspris.
17. Duplikater med rent og dekorert prisformat konsolideres til to logical objects. Porteføljen teller ikke samme objekt to ganger. Bare tekstlig ulike, sikkert like årsbeløp kan behandles som like i prisvisningen; faktiske tallkonflikter beholdes.

## Prisvisning – punktene 18–25

18. Priskortene under «Viktigste forskjeller» krevde tidligere bare at minst én side hadde en prisverdi. En faktisk prisforskjell var ikke et vilkår.
19. Kortet krever nå ett sikkert sammenligningspar og minst én forskjell fra den eksisterende `vehiclePriceDifferences`-funksjonen. Prisgruppene under «Vis pris per forsikring» beholdes uavhengig av om beløpene er like.
20. Prisidentiteten er fortsatt `premie.ekskl_tfa`, `premie.tfa` eller `premie.total`. Sammenligning skjer bare mellom samme prisfelt og entydige annualiserte beløp, aldri mellom eksklusiv premie og inklusiv total. Bare dokument-/registreringsbaserte prisfakta brukes; katalogpris gir ikke individuell premie. Frittstående `annualPremium` med ukjent TFA-grunnlag får ikke ny sammenlignbarhet.
21. Et lite eksplisitt sett av påheng godtas ved kjent canonical prisnøkkel: årsbenevnelse, «etter rabatter», og avgiftsbenevnelse som passer den aktuelle nøkkelen. Inklusiv trafikkforsikringsavgift godtas bare for total; eksklusiv/uten avgift bare for forsikringspris. Originalteksten endres ikke. Det brukes verken fuzzy matching eller generell utplukking av tall fra prose.
22. Månedspris, uavklart periode, flere beløp, intervall, «før rabatter», motstridende avgiftsgrunnlag og ulike prisfelt forblir usammenlignbare. Advarselen finnes under «Vis pris per forsikring», også for én bil, selv når tallene tilfeldigvis er like.
23. Objektprisene er kontrollert i faktisk React-komponent og nettleser under «Vis pris per forsikring». Testobjektene bruker syntetiske ID-er.
24. Identiske sammenlignbare priser gir ingen priskort under «Viktigste forskjeller». Hele avtalen gir ingen falske forskjeller. Nettlesertesten avdekket også identiske betingede fordeler som tidligere ble lagt til uansett; samme katalogfordel-ID på begge sider undertrykkes nå som forskjell.
25. En sikker forskjell mellom 12 000 og 10 000 kr gir fortsatt priskort og korrekt differanse. Ulike betingede fordeler med sine kilder beholdes. Ingen forsikringsdata eller produktfordeler er slettet fra katalogen.

## Totalskade – punktene 26–39

26. **Første divergenspunkt i produksjonen er ukjent.** Testinstrumenteringen finner ingen sideavhengig divergens når dokumentets eksplisitte faktum finnes i extraction-lignende input.
27. Ingen dokumentert lokal årsak forklarer at akkurat den reelle Existing-kjøringen mistet 15 000 km. En katalogverdi som ender som effektiv, viser at dokumentoverstyringen ikke var aktiv der, men beviser ikke hvilket tidligere steg som manglet eller endret den.
28. Det er derfor heller ikke dokumentert hvorfor den forrige normaliseringsrettelsen ikke lukket produksjonscaset. Uttrekksvariasjon, ukjent etikett/kontekst eller en annen faktisk inputbane er muligheter, ikke konstaterte årsaker. Ingen ny totalskade-parserrettelse er gjort på spekulasjon.
29. Existing-sporingen er implementert utelukkende i `tests/helpers/pilot-determinism.mjs`.
30. Offer spores med samme testhjelper og egne dokumentreferanser:

    | Kontrollpunkt | Existing | Offer | Opphav |
    |---|---|---|---|
    | Extraction-like parse | `nyverdi.km = 15 000 km` | samme | dokument |
    | Første normalisering | 15 000 km | 15 000 km | dokument |
    | Gjentatt normalisering | 15 000 km | 15 000 km | dokument |
    | Same-object konsolidering | 15 000 km | 15 000 km | dokument |
    | Katalogberikelse | 15 000 km | 15 000 km | dokument |
    | Effektiv faktaliste | 15 000 km | 15 000 km | dokument |
    | Sanitizer | 15 000 km | 15 000 km | dokument |
    | Comparison-rad | 15 000 km | 15 000 km | dokumentkilder fra riktig side |

    «Effektiv faktaliste» er den eksisterende berikede `importantTerms`-listen. Det er ikke innført en alternativ resolver. Produksjonsbanen beriker enkeltbatcher før sammenslåing og beriker konsoliderte objekter på nytt. Testen undersøker begge veier.

31. Eksisterende canonical-key-bevaring gjennom normalisering er beholdt. Tester dekker både eksplisitt nøkkel og sammensatt totalskadetekst med registreringsdato som aldersanker. Ingen side kopierer faktum fra motparten.
32. Eksisterende document-over-catalog-regel hindrer katalogens 20 000 når dokumentets 15 000 finnes med riktig faktanøkkel. `catalogFacts` kan fortsatt inneholde grunnverdi som evidens; comparison bruker den effektive faktalisten.
33. `kjoretoy.kjorelengde = 20 000 km per forsikringsår` er separat. Kilometerstand holdes også utenfor `nyverdi.km`. Den nye oppgaven endrer ikke disse normaliseringsreglene.
34. Side swap består.
35. Omvendt dokument- og objektrekkefølge består.
36. Omvendt batch-fullføring og dupliserte same-object dokumenter består.
37. Ny åttestegsregresjon bruker også 12 345 km. Eksisterende tester med dokument X/katalog Y, alternative tall og både Gjensidige og Tryg består.
38. Ingen kilometergrenser, pilotpriser, kundenummer eller providertekst er hardkodet i produksjonsrettelsene.
39. Pluss 3 år / 60 000 km består på begge sider. Kasko gir 1 år / 15 000 km med kundedokumentkilde i de syntetiske testene. Dette er ikke en bekreftelse på at en ny analyse av de private produksjons-PDF-ene allerede er verifisert.

For å lokalisere den resterende produksjonsårsaken trengs et minimalt, anonymisert utdrag av de relevante uttrekksfeltene: `name`, `value`, `canonicalKey`, nødvendig dekningskontekst og kildeklassifisering for totalskade og separat kjørelengde, på hver side. Det trengs ikke registreringsnummer, kundenavn eller en privat PDF i rapporten. Ingen rå feltverdier eller identifikatorer er lagt til i produksjonstelemetry.

## Detaljert sammenligning – punktene 40–48

40. Følgende fakta er undersøkt. Tabellen beskriver de verifiserte lokale banene; den bestemmer ikke opphavet til ukjente felter i en utilgjengelig produksjonsrespons.

    | Undersøkt rad | Opphav når begge dokumenter er stille | Verifisert oppførsel |
    |---|---|---|
    | Kaskodekning / Kaskoskade (`kasko.dekning`) | offentlig vilkår | samme produktfaktum på begge sider; eksakt katalogetikett med dokumenttekst får samme nøkkel |
    | Rettshjelp (`rettshjelp.dekning` og detaljer) | offentlig vilkår | symmetrisk; eksisterende alias virker |
    | Ulykke | offentlig vilkår for `ulykke.invaliditet`, `.dod`, `.omfang` | detaljfakta symmetriske; et separat dokumentutsagn om hoveddekningen kopieres ikke automatisk |
    | Brann og tyveri | offentlig vilkår for `brann.dekning` og `tyveri.dekning` | to sikre canonical fakta; en fritekstrad med kombinert navn omtolkes ikke vilkårlig |
    | Veihjelp | offentlig vilkår ved stillhet; dokument ved eksplisitt utsagn | begge opprinnelser bevares korrekt; «Valgt» i kontrollen er dokumentert |
    | Geografisk område (`geografi.dekning`) | offentlig vilkår | eksakt dokumentetikett ligger nå på riktig canonical rad |
    | Reparasjonsgaranti | offentlig vilkår | symmetrisk produktregel |
    | Leiebil, individuell pris, kjørelengde og eget kundevilkår | krever relevant kundedokumentasjon | ingen kopiering mellom sider og ingen pris fra katalog |

41. I den reproduserte Kaskoskade-feilen var Existing-teksten **kundedokument**, mens Offer hadde **offentlig vilkår** på canonical rad. I den geografiske kontrollen var rollene motsatt. Den effektive raden kombinerer ikke opphavene til et nytt udokumentert faktum. Når begge er stille om produktfakta, er begge kilder katalog. Opphavet i den konkrete produksjonskjøringen kan ikke fastslås sikkert uten responsens evidensmetadata.
42. Den eksakte feilen lå i `catalog-enrichment.ts`: lik katalogetikett la canonical nøkkel i `documentedKeys`, slik at katalogfaktum ble filtrert bort, men dokumentfeltet beholdt ukjent nøkkel. Comparison fikk en rå etikett-rad og en annen canonical rad med manglende verdi. Nå festes nøkkelen til dokumentfeltet før undertrykking, bare ved eksakt, entydig etikett fra det sikkert identifiserte produktet. Eksplisitt eksisterende nøkkel respekteres. Ved flertydig etikett gjøres ingen gjetning og ikke begge katalogfakta undertrykkes.
43. Kundespesifikk asymmetri er legitim: individuelt dokumentert beløp, tillegg eller annet avtaleutsagn på én side blir ikke overført til den andre. Det samme gjelder fritekst som ikke sikkert kan identifiseres som et eksisterende produktfaktum.
44. Eksisterende kilde-/gyldighetspolicy og produktberikelse avgjør fortsatt hvilke generelle standardfakta som er anvendelige. Produktbeskrivelse, reparasjonsgaranti, geografiske vilkår og relevante begrensninger kan supplere stillhet der de allerede er kvalifisert. Det er ikke innført en ny generell «fyll alle hull»-regel.
45. Individuelle valg, premie, TFA, objektdata, årlig kjørelengde og kilometerstand forblir dokumentstyrte. Offentlige egenandelseksempler og summer kan fortsatt vises som nettopp offentlige vilkårseksempler; de er ikke gjort om til kundens avtalte egenandel eller individuelle sum.
46. Valgfri leiebil ved dokumentstillhet er fortsatt `unknown`, selv om produktet kan tilby dekningen. Den nye etikettkoblingen bekrefter faktumets identitet, ikke et ellers udokumentert valg.
47. «Leiebil: Ikke valgt» gir fortsatt `not_selected`, med dokumentevidens. Katalogtekst overstyrer ikke dette.
48. Dokumentverdier vinner fortsatt over katalogverdier. Detaljvisning og «Viktigste forskjeller» konsumerer samme effektive faktaliste og samme `groupTerms`/coverage-oppløsning. Detaljvisningen bruker nå eksisterende opphavsmetadata til «Vis kilde · kundedokument/offentlig vilkår». Ved tvetydige opphavsmetadata gjettes ikke et opphav.

## Missing-/unknown-tekster

Det er søkt eksplisitt i app og relevante presentasjons-/comparison-filer. Ingen ny generell omskriving av all hjelpetekst er gjort.

| Tekst | Faktisk betydning |
|---|---|
| `❌ Ikke valgt` | eksplisitt negativ status; ikke en tolkning av stillhet |
| `— Ikke dokumentert` | coverage-status kan ikke etableres sikkert; kan også skyldes konflikt. Betyr ikke at produktet mangler dekningen |
| `Ikke dokumentert / kan ikke avgjøres` | manglende sikker effektiv verdi for denne faktaraden |
| samme tekst med `(tillegget er ikke valgt)` | eksisterende særtekst for en manglende detalj knyttet til katalogtillegg som ikke er registrert valgt; ikke en ny selvstendig negativ coverage-status |
| `Ikke dokumentert` | manglende tilgjengelig feltverdi, eksempelvis et prisfelt eller en dokumentopplysning |
| `Ikke oppgitt`, `Pris ikke oppgitt`, `Selskap ikke oppgitt`, `Produkt ikke dokumentert` | respektive metadata-/pris-/produktfelt mangler. Ingen konklusjon om at forsikringen/dekningen ikke eksisterer |
| `Oppgitt årspris (prisgrunnlag ikke avklart)` | beløp finnes, men basis kan ikke brukes til sikker sammenligning |
| `Kan ikke sammenlignes direkte …` | ingen felles sikker prisbasis; like tall opphever ikke dette |
| `Motstridende prisopplysninger` | uløst priskonflikt, ikke manglende forsikring |
| `Ikke koblet til vilkårskatalogen …` | usikker/manglende produktkatalogmatch, ikke bevis for manglende offentlig vilkår |
| `Vilkår ikke funnet` | finnes ikke som nåværende sluttbrukertekst i den undersøkte resultatvisningen |
| `Ikke funnet i dokumentet` | finnes ikke som egen nåværende sluttbrukerlabel i den undersøkte resultatvisningen |

«Total årspremie» øverst i den eksisterende detaljtabellen er fortsatt dokumentets/avtalens samlede oppgitte felt, ikke den beregnede porteføljesummen. Den kan derfor vise «Pris ikke oppgitt» når toppoversikten har en beregnet sum. Dette er en eksisterende begrepsforskjell, og raden er ikke brukt som inngang til den nye porteføljevisningen. Den er ikke fremstilt i denne rapporten som en ukjent objektpris.

Produktkilder kan være tilgjengelige samtidig som kundens valg er ukjent. Faktaspesifikke kildemerker og eksisterende katalogstatus gjør denne forskjellen synlig. Et ukjent valg blir ikke et negativt valg.

## Frosne positive kontroller og visuell kontroll

- Mobilitet: Leiebil `not_selected`, Veihjelp `selected`, navngitte barn og riktig kilde er bevart.
- Skade på egen bil: Bilnøkkel, Kaskoskade, Feilfylling og parkeringsskade beholder faktanøkler, status og kilder der relevante fakta finnes. Ingen endring i kompaktkortets oppbygging.
- Maskinskade: 10 år / 200 000 km og relevante detaljer består i eksisterende regresjoner.
- Pluss: 3 år / 60 000 km består.
- «Se detaljer» viser fortsatt meningsfull tilleggsinformasjon. Sum og egenandel bevares separat fra kortbeskrivelse.
- Faktiske React-komponenter er kontrollert i nettleser ved 1280 px og 390 px, med syntetisk 2+2-input. Begge topper har canonical navn og riktige summer. Ingen identiske priskort under forskjeller.
- Prisdisclosure, detaljert tabell, «Se detaljer», dokumentkilde og offentlig kilde er åpnet med tastatur. Typefaner er kontrollert med piltast. Offentlig kilde beholdt lenken til originalvilkåret.
- Ved 390 px er `scrollWidth` lik viewportens 390 px. Pris-/dekningssider stables; lang pristekst brytes uten tap. Detaljtabellen beholder sin eksisterende interne horisontale scrolling.
- Ingen AI-kall, modellendring, semantic matching-endring, ny produksjonstelemetry, object-matching-endring, konsolideringsendring eller Phase 2-endring er introdusert.

## Endrede filer

| Fil | Begrunnelse |
|---|---|
| `app/page.tsx` | canonical selskapsvisning, trygg porteføljegren, forskjellsbaserte priskort, prisadvarsel under objektpriser, kildeopphav i detaljtabellen |
| `lib/provider-presentation.ts` (ny) | ren, konservativ displayoppløsning via eksisterende provider-/produktidentitet |
| `lib/vehicle-price-presentation.ts` | kontrollert parsing av eksplisitte annualprisformuleringer med canonical prisbasis |
| `lib/portfolio-price-presentation.ts` | samme prisbasis ved summering og formateringskonflikter |
| `lib/catalog-enrichment.ts` | entydig produktetikett gir dokumentfeltet canonical nøkkel før katalogundertrykking |
| `lib/comparison-presentation.ts` | samme betingede katalogfordel-ID på begge sider er ikke en forskjell |
| `tests/helpers/pilot-determinism.mjs` (ny) | syntetisk 2+2-fixture og lokal åttestegssporing |
| `tests/pilot-determinism.test.mjs` (ny) | 37 regresjoner for provider, prisbasis, rekkefølge, totalskade og kildebevisst berikelse |
| `tests/pilot-determinism-ui.test.mjs` (ny) | 7 tester av den faktiske resultatkomponenten, priser, manglende-tilstander og kildemerker |
| `tests/object-aware-comparison.test.mjs` | eksisterende isolert UI-testharness får den nye displayhjelperen; ingen forventninger er svekket |
| `docs/pilot-determinism-report.md` (ny) | denne rapporten |

Totalt 11 filer: 6 produksjon, 4 test/hjelper, 1 rapport. Ingen katalogdata, originale PDF-/HTML-kilder, manifester, schema, sikkerhetsfiler eller `.env.local` er endret.

## Validering

| Kontroll | Resultat |
|---|---|
| Full suite `node --test tests/*.test.mjs` | 1211/1211, 0 feil, 0 hoppet over; baseline 1167, 44 nye tester |
| `npx tsc --noEmit` | bestått |
| `npm run lint` | bestått |
| `npx next build --webpack` | bestått |
| `node scripts/verify-analysis-http.mjs` | bestått, syntetiske PDF-er og lokal AI-stub |
| `git diff --check` | bestått |
| Desktop / 390 px / tastatur | bestått som beskrevet over |

HTTP-kontrollen omfatter autentisering, avvisning av ugyldig PDF før AI, streaming, 10+10 dokumenter, begrenset concurrency, partial failure, standard-/tilleggsvalg, objektmatching og konsolidering. Kun syntetiske data og prosesslokale testcredentials brukes. Ingen testverdier skrives til `.env.local` eller produksjonskonfigurasjon.

Separate grupper er kjørt. Gruppene overlapper; tallene skal ikke summeres:

| Gruppe | Bestått |
|---|---:|
| Runtime | 1/1 |
| PDF | 21/21 |
| Security | 22/22 |
| Performance | 25/25 |
| Semantic/audit | 64/64 |
| Catalog | 486/486 |
| Canonical comparison | 23/23 |
| Document precedence | 39/39 |
| Effective facts | 76/76 |
| Pilot regressions | 109/109 |
| Add-ons | 14/14 |
| Fase 2 | 48/48 |
| Progress | 41/41 |
| Premium/TFA | 25/25 |
| Portfolio pricing | 129/129 |
| Coverage detail | 22/22 |
| Source presentation | 29/29 |
| Mileage isolation | 48/48 |
| Totalskade | 67/67 |
| Vehicle extensions | 66/66 |
| Source integrity | 70/70 |
| Object matching | 60/60 |
| Missing product/object | 60/60 |
| Same-object consolidation | 82/82 |
| Full portfolio simulation | 179/179 |
| Provider normalization/display | 65/65 |
| Detailed-comparison enrichment | 120/120 |

## Begrensning og avslutning

Samme modellerte avtale gir identisk effektiv betydning gjennom de testede sidene og rekkefølgene. Tester kan ikke garantere at to separate AI-uttrekk alltid etablerer samme fakta. Den konkrete produksjonens første divergenspunkt for totalskade, de faktiske rå prisformuleringene og kildeopphavet til alle rapporterte asymmetriske rader er fortsatt ikke verifisert. Det er ikke funnet en gjenværende deterministisk side-/rekkefølgefeil i den undersøkte pipeline-en, men den reelle totalskadeobservasjonen må fortsatt etterprøves.

Ingen commit, push, reset, revert eller stash. Ingen endring av `.env.local`. Ingen private kundedokumenter analysert. Ingen publisering utført.

**PILOT_DETERMINISM_PARTIAL**
