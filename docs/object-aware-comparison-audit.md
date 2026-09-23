# Objektbevisst porteføljesammenligning – ferdigrapport

23.09.2026. Lokal arbeidskopi på `main`, utgangspunkt `ae91aca635fbdfd938f3e707305cbd358b0af7f2`. Ingen publisering. Tidligere kjøretøyutvidelse er bevart.

## Resultat

Begge dokumenterte gap er rettet for sikre objektpar: manglende produkter vises i Oversikt, og flere objekter av samme type sammenlignes hver for seg. Hovedregresjonen inneholder **3 biler, 2 tilhengere, 1 snøscooter og 1 campingvogn**, stokket på tilbudssiden og med endret selskap/produktnivå. Ingen index-, provider-, produkt-, pris-, PDF- eller semantisk identitetsmatching brukes.

**907/907 tester består**, mot 847/847 før denne oppgaven. TypeScript, ESLint, webpack production build og diff-kontroll består. Lokal HTTP/PDF-integrasjon og visuell kontroll av den faktiske resultatkomponenten med syntetiske data er gjennomført.

Samlet vurdering er **BLINDTEST_PARTIAL**, ikke fordi flere biler/tilhengere kan kryssmatches i de testede tilfellene, men fordi samme objekt gjentatt som separate poster fra flere batcher ikke automatisk konsolideres. Slike poster vises konservativt som uavklarte. Flere objekter uten sikker ID kan heller ikke gi en komplett side-ved-side-sammenligning. Dette er synlige begrensninger, ikke skjult eller gjettet matching. Katalogbegrensningene fra forrige oppgave er uendret.

## Arkitektur – rapportpunkter 1–15 og siste presisering

### Årsaker

- **MISSING_PRODUCT_COMPARISON_GAP:** sammenligningen laget en forskjell for en type som manglet på én side, men den hadde lav detaljprioritet. Presentasjonsfilteret fjernet den fra Viktigste forskjeller.
- **MULTI_OBJECT_MATCHING_GAP:** `groupInsurances` brukte canonical forsikringstype som eneste gruppenøkkel. Flere biler/tilhengere havnet i samme arrays. Term-, coverage- og presentasjonsfunksjonene kunne dermed aggregere fakta som tilhørte forskjellige objekter. Semantiske termtreff var også bare typescopet.

### Generell objektmodell

Den logiske modellen er `insuranceType → object identity → product → effective facts/coverages`.

`object-matching.ts` er generell. `object-identity-strategies.ts` registrerer eksplisitte normaliseringsstrategier per canonical type og identifikatortype. Kjernealgoritmen vet ikke hva et kjøretøy eller registreringsnummer er. En syntetisk ikke-kjøretøytype med to objekter bruker en injisert `asset_id`-strategi og matcher riktig i motsatt rekkefølge. Ingen produksjonsstøtte for nye Hus-, Båt-, Dyr- eller personidentifikatorer er implementert.

For en fremtidig type må type-/identifikatorstrategi og dokumentert ekstraksjonskontrakt registreres. Matching- og comparison-kjernen trenger ikke en ny algoritme. Identifikatorer blir aldri utledet fra katalog, provider eller produktnivå.

### Faktisk pipeline

1. Eksisterende PDF-parsing og de avgrensede ekstraksjonsbatchene beholdes.
2. Schemaet får `objectIdentifiers`: type, rå dokumentverdi og eksakte `documentIndices`. Bare dokumenterte objekt-ID-er; ikke kunde-/polisenummer, adresse, personnummer eller gjetting/OCR-korreksjon.
3. Validatoren begrenser antall/lengde/typer. `enrichBatch` validerer at ID-kilden tilhører produktets dokumenter og fester dokumentprovenance. Katalogen beriker hvert separat objekt som før; den bestemmer aldri identiteten.
4. Alle vellykkede batchresultater samles i stabil dokumentrekkefølge. Objekter slås ikke sammen etter produkt, provider eller filnavn.
5. Deterministisk objektmatching kjøres på de samlede sidene. Semantisk matching får bare termkandidater fra allerede identifiserte objektpar.
6. Comparison og presentasjon bruker både canonical type og en separat, ugjennomsiktig `objectScope`. Dekninger, effektive verdier, priser og kildehenvisninger kommer fra akkurat paret.

`object:0` osv. er referanser til ferdige matchresultater, ikke objektidentitet. Indeks brukes til å finne igjen originalposten etter at ID-sammenligningen har bestemt paret, aldri til å avgjøre hvem som matcher.

### Identifikatorer og normalisering

| Strategi | Eksakt normalisering | Konservativ grense |
| --- | --- | --- |
| registration | Trim, store bokstaver, fjern whitespace | 1–3 bokstaver og 2–6 sifre; ingen vilkårlig tegnfjerning eller OCR-reparasjon |
| vin | Trim og store bokstaver | 17 VIN-tegn, I/O/Q tillates ikke; intern whitespace fjernes ikke |
| serial | Trim | 6–64 tegn i avgrenset alfanumerisk/bindestrek-format; store/små bokstaver beholdes |

Strategiene er registrert for eksisterende kjøretøytyper. Format som ikke støttes gir ingen sikker match; det blir ikke korrigert til et antatt nummer. Samme verdi i forskjellige identifikatortyper eller forsikringstyper er ikke et treff.

### Resultatmodell og sikkerhetsregler

Resultatet er en TypeScript-union: `matched`, `unmatched_existing`, `unmatched_offer`, `ambiguous`.

- `EXACT_OBJECT_ID`: minst én felles, lik normalisert identifikator, ingen motstridende felles identifikator, og entydig kandidat på begge sider.
- `UNIQUE_TYPE_PAIR`: nøyaktig ett objekt av kjent canonical type på hver side, ingen identifikator på noen av sidene og ingen feilede dokumenter som kan skjule flere objekter. Det er eksplisitt svakere enn eksakt identitet.
- UNIQUE_TYPE_PAIR brukes ikke ved flere objekter av typen, én-sidig ID, ugyldig/konfliktende ID eller delvis analyse. Det brukes heller ikke på det siste restparet etter at andre objekter er matchet.
- Ulike sikre registreringsnumre gir to unmatched objekter. Samme registrering kombinert med ulike VIN gir identitetskonflikt og ingen matching. Dublett-ID-er får ikke en vilkårlig vinner.
- Uavklarte objekter bevares som egne poster, men får ikke coverage-, pris- eller semantisk sammenligning mellom sidene.
- `MISSING_TYPE` og `MISSING_OBJECT` skilles: enten mangler hele typen på motpartens analyserte side, eller et bestemt objekt av en ellers tilstedeværende type.
- Manglende objekt på eksisterende eller tilbudssiden gir et eget synlig varsel. Ingen dekning settes automatisk til `not_selected`, og ingen manglende pris blir null kroner.
- Samlet prisfordel undertrykkes når objektsettene ikke er sikkert sammenlignbare. Eksplisitte dokumenttotaler beholdes som oppgitte verdier.

Delvis analyse bruker sidens faktiske feilliste. Manglende motpart gir `NOT_FOUND_WITH_PARTIAL_FAILURE` når dokumenter på den manglende siden feilet, ellers `CONFIRMED_ABSENT_FROM_ANALYZED_SET`. Dette beskriver dokumentsettet, ikke juridisk fravær av forsikring. Feil på motsatt, irrelevant side gir ikke feil missing-konklusjon. Request-level avvisning bygger fortsatt ikke en tom sammenligning.

## Personvern og sikkerhet – rapportpunkter 16–23

Rå ID og dokumentkilder ligger bare i eksisterende request/resultatmodell og klientens analyseobjekter. Normaliserte nøkler brukes internt under matching. Ingen database, permanent ID-lagring eller ny kundedatalogg er innført.

ID-er brukes ikke i React-/semantic-scopenøkler. Telemetry beholder sin numeriske allowlist; audit beholder trygge faktakategorier; progress beholder type/status. HTTP-regresjonen verifiserer at syntetiske ID-er ikke finnes i serverlogger eller progress. Semantisk audit testes også uten rå eller normaliserte ID-er. `objectMatchingCounts` gir bare tall og er ikke koblet til ny logging.

Ingen ekstra ekstraksjonskall eller objektmatch-LLM er introdusert. API-et bruker eksisterende ene, avgrensede semantiske kall, nå med kandidater separat per sikkert objektpar; maksimalt 12 termscopes/80 termer beholdes. Ekstraksjonsconcurrency på maksimalt to beholdes. At flere sikre par nå kan bidra med termkandidater betyr ikke ett AI-kall per objekt.

Eksisterende sikkerhetstester, avvisning før AI, kapasitet, avbrudd, 429 og ingen automatiske retries er beholdt. Ingen ekte OpenAI-kall, private kundedokumenter eller pappaens dokumenter er brukt. `.env.local` er urørt, og ingen verdier fra filen er hentet ut i verktøyoutput; filens mtime er fortsatt 17.09.2026. Ingen `.env` er tracked eller staged. Diff-/nyfilsjekk fant ingen API-nøkler, tokens eller private nøkler.

## UI – rapportpunkter 24–34

- Oversikt og typefaner beholdes. Bare aktuelle typer vises.
- Hvert sikkert par har egen overskrift, for eksempel type + dokumentert objekt-ID. Forskjeller og prisforskjeller filtreres på objektets scope, ikke bare forsikringstype.
- Manglende type, manglende objekt og offer-only objekter vises direkte øverst i Viktigste forskjeller, før prisfeltene, uten at et disclosure må åpnes.
- Ambiguous-gruppen forklarer at ingen par er antatt. Objekt 1/2 er bare visningsnummer innen hver side, ikke koblingsgrunnlag.
- Detaljvisningen har kompakte, separat åpnbare objektposter ved unmatched/ambiguous. Den viser egne verdier, tillegg, kilder og erstattede kataloggrunnverdier. Den lager ikke hundrevis av falske mangler på motpartens side.
- Matchede objekter beholder vanlig detaljtabell, med selskap/produkt på hver side, eksakt/entydig matchforklaring og identitetskilder i riktig sidekolonne.
- Partial failure gir «ikke funnet i de analyserte dokumentene» med forklaring om ufullstendig analyse.
- Objektetiketter er bare brukerens resultatvisning. De kopieres ikke til telemetry/audit/progress.

Faktisk `Comparison`-komponent, React og produksjons-CSS ble kjørt i en midlertidig lokal harness med kun syntetiske verdier. Oversikt, Bil, Tilhenger, Snøscooter, Campingvogn, detaljvisning, kilder, tastaturfaner, manglende objekter og ambiguous detaljer ble kontrollert. Desktop 1280 px og smal 390 px ble brukt; dokumentbredden var 390 px ved smal kontroll. Harness ligger utenfor repoet og er ikke en ny app-rute. Browserkontrollen er ikke en ekte OpenAI-/kunde-PDF-blindtest.

## Endrede og nye filer – rapportpunkter 35–36

Filer endret i denne oppgaven, også når filen allerede hadde lokale endringer:

| Fil | Formål |
| --- | --- |
| `app/api/analyze/route.ts` | Objektavgrenset semantisk matching etter merge, med per-side partial-kontekst |
| `app/page.tsx` | Objektscopet resultat, synlige varsler, separate uavklarte detaljer og identitetskilder |
| `lib/analysis-output.ts` | Minimalt ID-schema, eksplisitt ekstraksjonsinstruks og streng validering |
| `lib/analysis-merge.ts` | Valider og bevar ID-provenance gjennom enrichment/merge |
| `lib/comparison.ts` | Objektgrupper, isolerte fakta/differenser og konservative pris-/missing-regler |
| `lib/comparison-presentation.ts` | Fremhev object-varsler og avgrens konseptfamilier til paret |
| `lib/hybrid-matching.ts` | Termscopes per sikkert objektpar; ett begrenset kall |
| `scripts/verify-analysis-http.mjs` | Syvobjekts HTTP-regresjon og ID-personvern |
| `tests/vehicle-object-pipeline.test.mjs` | Tidligere dokumentert missing-gap-test forventer nå synlig varsel |

Nye filer i denne oppgaven:

| Fil | Formål |
| --- | --- |
| `lib/object-matching.ts` | Generell deterministisk matchkjerne, statuser og evidence/helpers |
| `lib/object-identity-strategies.ts` | Separate typespesifikke normaliseringsstrategier |
| `tests/object-aware-comparison.test.mjs` | 60 nye regresjonstester |
| `docs/object-aware-comparison-audit.md` | Denne rapporten |

Allerede eksisterende, tilsiktet arbeid er bevart: `app/components/vehicle-price.tsx`, `lib/document-fact-normalization.ts`, `lib/insurance-normalization.ts`, `lib/presentation-catalog.ts`, `lib/product-catalog.ts`; kjøretøykatalog/register/sources; katalogtestene; den tidligere rapporten; 49 PDF- og 20 HTML-originaler med manifest under `catalog/sources/vehicle-extensions/`. Disse katalogene/kildene er ikke revidert i denne oppgaven. Den forrige rapporten er historikk; dens to gapbeskrivelser beskriver status før denne implementasjonen.

## Tester og validering – rapportpunkter 37–53

| Kontroll | Resultat |
| --- | --- |
| Hele testsuiten | 907/907 bestått, ingen skipped/fail |
| Nye object/missing/portfolio-tester | 60/60 |
| Vehicle-extension katalogtester | 40/40; manifest/hash og kildeintegritet inkludert |
| Vehicle-extension pipeline | 26/26 |
| Eksisterende manual runtime | 1/1 |
| PDF-gruppen | 21/21 |
| Security-gruppen | 22/22 |
| Performance | 25/25 |
| Eksisterende semantic matching/audit | 64/64 |
| Katalog/canonical-gruppen | 454/454 |
| Document precedence | 23/23 |
| Effective facts | 42/42 |
| Pilot/add-on/Gjensidige-regresjoner | 41/41 |
| Fase 2 | 48/48 |
| Progress/pris | 45/45 |
| Premium/mileage | 21/21 |
| Totalskade | 14/14 |
| TypeScript | `npx tsc --noEmit` bestått |
| ESLint | `npm run lint` bestått uten feil/advarsler |
| Production build | `npx next build --webpack` bestått |
| Diff | `git diff --check` bestått |
| Runtime/HTTP/PDF | `scripts/verify-analysis-http.mjs`: PASS mot produksjonsbuild og lokal AI-mock |

Gruppene overlapper og skal ikke summeres. Den ene tidligere testen som eksplisitt forventet det dokumenterte missing-gapet er oppdatert; ingen regresjonstest er fjernet. Node gir fortsatt den eksisterende MODULE_TYPELESS_PACKAGE_JSON-advarselen i direkte TS-tester; prosjektets package.json er ikke endret for å skjule den.

Fullporteføljetestene dekker: alle sju objekter, hver av de sju utelatt enkeltvis, bare-offer objekt, to ID-løse objekter, eksplisitt konflikt, provider-/produktbytte, eksakt VIN/serial, ulike PDF-fordelinger, motsatt batch-completion order, partial failure, TFA per bil, tre coverage-statuser og semantisk treff som bare gjelder ett av tre bilpar. Registrerings-/VIN-konflikt, dubletter og cross-type samme ID får aldri automatisk treff.

HTTP-kontrollen dekker dessuten 10+10 PDF-er, maksimalt to samtidige uttrekk, 11-avvisning, korrupt PDF/partial, sikker session, manual-flow, kundevalg/tillegg, abort/admission cleanup og personvern i logger. Testserver måtte få lokal loopback-tilgang fordi sandkassen avviser `listen`; testen brukte bare lokalt genererte, midlertidige testcredentials og lokal AI-mock.

## Blindtest-klarhet per type

READY betyr at den implementerte stien kan testes konservativt, ikke at ukjent LLM-output eller alle vilkårsvarianter er forhåndsgodkjent. PARTIAL angir hvor en komplett automatisk sammenligning ikke kan garanteres.

| Område | Bil | Snøscooter | Campingvogn | Tilhenger |
| --- | --- | --- | --- | --- |
| Canonical type identification | READY | READY | READY | READY |
| Object identification | PARTIAL ved manglende/duplisert ID | PARTIAL ved manglende/duplisert ID | PARTIAL ved manglende/duplisert ID | PARTIAL ved manglende/duplisert ID |
| Provider identification | READY for registrerte aliaser | READY for registrerte aliaser | READY for registrerte aliaser | READY for registrerte aliaser |
| Product identification | READY for sikre kjente nivåer | PARTIAL for udokumenterte nivåer | PARTIAL for udokumenterte nivåer | PARTIAL for udokumenterte nivåer |
| Catalog matching | READY for eksisterende katalogprodukter | PARTIAL etter tidligere kildematrise | PARTIAL etter tidligere kildematrise | PARTIAL etter tidligere kildematrise |
| Document > catalog | READY | READY | READY | READY |
| Coverage comparison innen sikkert par | READY | READY | READY | READY |
| Pris/TFA med dokumentert sammenlignbart grunnlag | READY | READY | READY | READY |
| Add-ons | READY for dokumenterte valg | PARTIAL ved manglende vilkårsgrunnlag | PARTIAL ved manglende vilkårsgrunnlag | PARTIAL ved manglende vilkårsgrunnlag |
| Provenance | READY | READY | READY | READY |

Katalog-PARTIAL er ikke i seg selv en blocker: kjent dokumentinformasjon beholdes og katalogen finner ikke på manglende facts. Detaljene i uavklarte Tryg-, If-, Gjensidige- og Storebrand-kilder står i `docs/vehicle-object-catalog-audit.md` og er ikke løst eller omtolket her.

## Full portefølje – de 15 arbeidsflytene

| Scenario | Vurdering | Begrunnelse |
| --- | --- | --- |
| 1. Flere existing-PDF-er | READY | Eksisterende batching/merge og provenance bevart |
| 2. Flere offer-PDF-er | READY | Samme støtte på begge sider |
| 3. Én PDF med flere produkter | READY | Separate objekter; sjuobjekts test |
| 4. Flere PDF-er med samme produkt | PARTIAL | Ulike objekter med samme nivå matches sikkert med ID. Gjentatte poster for samme objekt på tvers av batcher blir konservativt ambiguous |
| 5. Flere objekter av samme type | READY med sikre ID-er | Tre biler og to tilhengere eksplisitt testet |
| 6. Ulik rekkefølge | READY | Identitet, ikke indeks/Promise-rekkefølge, bestemmer par |
| 7. Bare existing | READY | Synlig varsel og egne detaljer |
| 8. Bare offer | READY | Synlig varsel og egne detaljer |
| 9. Ett dokument feiler | PARTIAL | Vellykkede objekter beholdes; ufullstendighet varsles; ingen usikker unique-type fallback |
| 10. Ett objekt mangler ID | PARTIAL | Begge sider uten ID og ett sikkert typepar kan brukes; én-sidig ID blir uavklart |
| 11. Flere objekter mangler ID | PARTIAL | Ingen gjetting; egne objektposter vises uten krysssammenligning |
| 12. Provider endres | READY | Provider inngår ikke i identiteten |
| 13. Product level endres | READY | Produktnivå inngår ikke i identiteten |
| 14. PARTIAL katalog | PARTIAL | Dokumenterte kundeopplysninger brukes, resten forblir konservativt ukjent |
| 15. Semantic fallback for facts | READY innen sikkert par | Ett avgrenset kall med separat scope; aldri object identity |

## Gjenværende begrensninger og anbefalt neste steg

Ingen kjent kryssmatching av forskjellige sikre biler/tilhengere ble funnet i testene. De to opprinnelige gapene er ikke lenger blockers for porteføljen med sju entydig identifiserte objekter.

En komplett automatisk sammenligning er fortsatt begrenset i disse konkrete tilfellene:

1. **Samme objekt forekommer som flere selvstendige resultater fra forskjellige batcher.** Alle postene beholdes, men matching velger ikke hvilken som er riktig. En senere, separat oppgave kan konsolidere dokumentfragmenter bare når identitet, avtalerolle, produktnivå og individuelle facts er konsistente; konflikter må fortsatt være synlige.
2. **Flere objekter uten sikker identitet**, eller ID på bare én side. Ingen gjetting er introdusert. Rådgiverbekreftelse kan eventuelt bygges senere, men finnes ikke nå.
3. **Ustøttede identifikatorformater** håndteres konservativt. Ingen generisk adresse-/person-/dyridentitet er aktivert.
4. **Kilde-/katalog-PARTIAL og LLM-ekstraksjon fra hittil usette dokumenter.** Denne oppgaven har ikke gjennomført den reelle blindtesten og lover ikke feilfri uttrekking.

Trygt å teste nå: porteføljer der samme objekt fremkommer som én entydig identifisert post på hver side, også med flere biler/tilhengere, forskjellige selskaper, produktnivåer og PDF-fordeling. Trygt å vise, men ikke komplett sammenlignbart: de uavklarte scenarioene ovenfor. Ikke bruk en uavklart gruppe som om appen har bekreftet et objektpar.

## Anbefalt blindtest-protokoll – ikke utført

Når dere velger å gjennomføre den konservative blindtesten: bruk dokumentene direkte i piloten uten forhåndsanalyse eller tuning. Kontroller først at denne lokale versjonen senere er godkjent og publisert; det er ikke gjort nå. Behold første resultat som baseline før eventuelle rettelser, uten å innføre ny kundedatalagring i appen.

Registrer dokumentantall og eventuelle feilede dokumenter; tell objekter per type og side; kontroller exact/unique/unmatched/ambiguous; kontroller særlig alle tre biler og begge tilhengere mot deres dokumenterte ID. Kontroller provider, produktnivå, katalogstatus, prisgrunnlag/TFA/total, egenandel, dekninger, tillegg, sentrale grenser og kildereferanser per objekt. Se etter både skjulte mangler og krysskoblinger. Bruk bare eksisterende personvernvennlige metrics til server-/AI-/semantic-målinger. Ikke rett eller tune under den første baselinekjøringen.

## Nye regresjonstester

1. full portfolio: 3 cars, 2 trailers, snowmobile and caravan match shuffled provider/product-independent IDs
2. missing object 0 visible without contaminating other pairs
3. missing object 1 visible without contaminating other pairs
4. missing object 2 visible without contaminating other pairs
5. missing object 3 visible without contaminating other pairs
6. missing object 4 visible without contaminating other pairs
7. missing object 5 visible without contaminating other pairs
8. missing object 6 visible without contaminating other pairs
9. new offer-only object has its own warning; known car does not absorb it
10. Bil: two unknown IDs never pair by index, name, provider, product or price
11. Bil: a unique type pair is explicitly weaker than exact identity
12. Bil: conflicting explicit IDs prevent one-to-one fallback
13. Bil: one-sided identifier is ambiguous
14. Tilhenger: two unknown IDs never pair by index, name, provider, product or price
15. Tilhenger: a unique type pair is explicitly weaker than exact identity
16. Tilhenger: conflicting explicit IDs prevent one-to-one fallback
17. Tilhenger: one-sided identifier is ambiguous
18. Snøscooter: two unknown IDs never pair by index, name, provider, product or price
19. Snøscooter: a unique type pair is explicitly weaker than exact identity
20. Snøscooter: conflicting explicit IDs prevent one-to-one fallback
21. Snøscooter: one-sided identifier is ambiguous
22. Campingvogn: two unknown IDs never pair by index, name, provider, product or price
23. Campingvogn: a unique type pair is explicitly weaker than exact identity
24. Campingvogn: conflicting explicit IDs prevent one-to-one fallback
25. Campingvogn: one-sided identifier is ambiguous
26. exact matches do not enable a leftover unique fallback among originally multiple objects
27. matching registration plus conflicting VIN fails closed
28. duplicate registrations never produce a match
29. conflicting identifiers inside one extracted object fail closed
30. same identifier never crosses canonical insurance type
31. car aliases normalize before scoped identity matching
32. registration normalization is exact, with no arbitrary punctuation or OCR repair
33. VIN and serial normalizers retain their distinct safe rules
34. general architecture: two synthetic non-vehicle objects use an injected exact strategy
35. partial failure on missing existing side weakens evidence only for that side
36. partial failure on missing offer side weakens evidence only for that side
37. object count telemetry has only numeric counts and no raw/normalized IDs
38. price, TFA, effective facts and presentation never mix car/trailer objects
39. semantic fallback is one bounded call over already matched scopes, with no identity in audit
40. ambiguous and unmatched objects never invoke semantic object matching
41. an unscoped legacy semantic decision cannot leak across cars
42. 7 objects through extraction/enrichment/sanitizer across one PDF layout
43. 7 objects through extraction/enrichment/sanitizer across separate PDF layout
44. 7 objects through extraction/enrichment/sanitizer across mixed PDF layout
45. batch completion order is immaterial to object pairs
46. identity references must be within product document provenance
47. schema requires explicit identifiers, rejects unknown types and secrets as extra identity fields
48. missing warning is visible without opening a details disclosure
49. ambiguous detail shows separate objects and never paired values or fabricated missing coverages
50. unmatched detail preserves source links and only its own facts
51. UI scopes overview, type views, prices and details by object; responsive shared layout remains
52. partial analysis cannot infer a unique no-ID pair from an incomplete type count
53. explicit exact ID remains usable for surviving documents after partial failure
54. the production route opts into object-scoped semantic matching after batch merge
55. missing/ambiguous cards precede price lists and identity sources remain side-specific
56. vin alone identifies the same object without registration
57. serial alone identifies the same object without registration
58. three cars retain individual TFA and selected/not-selected/unknown coverage status
59. one accepted semantic term match cannot affect any other car scope
60. unmatched object retains selected add-ons and overridden catalog base provenance

## Git og bekreftelser

Ingen commit, push, reset, revert, stash, rebase eller amend. Ingen branch-/remote-/deployment-endring. Ingen kildeoriginaler lastet ned på nytt eller erstattet. Tidligere lokale endringer er bevart. Working tree er tilsiktet ikke clean; alle endringene står til gjennomgang.

Status ved sluttkontroll:

```text
 M app/api/analyze/route.ts
 M app/components/vehicle-price.tsx
 M app/page.tsx
 M lib/analysis-merge.ts
 M lib/analysis-output.ts
 M lib/comparison-presentation.ts
 M lib/comparison.ts
 M lib/document-fact-normalization.ts
 M lib/hybrid-matching.ts
 M lib/insurance-normalization.ts
 M lib/presentation-catalog.ts
 M lib/product-catalog.ts
 M scripts/verify-analysis-http.mjs
?? catalog/sources/vehicle-extensions/
?? docs/vehicle-object-catalog-audit.md
?? lib/object-identity-strategies.ts
?? lib/object-matching.ts
?? lib/vehicle-object-catalog.ts
?? lib/vehicle-object-registry.ts
?? lib/vehicle-object-sources.ts
?? tests/object-aware-comparison.test.mjs
?? tests/vehicle-object-catalog.test.mjs
?? tests/vehicle-object-pipeline.test.mjs
?? docs/object-aware-comparison-audit.md (denne nye rapporten)
```

Ingen kodeendringer skal publiseres som del av denne oppgaven. Hele det aktuelle resultatet er lokalt.

BLINDTEST_PARTIAL
