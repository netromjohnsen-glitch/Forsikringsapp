# Same-object cross-document consolidation – ferdigrapport

Dato: 23.09.2026. Baseline ved oppgavestart: **907/907**. Sluttresultat: **989/989**, inkludert **82 nye tester**. Rapporten gjelder tilleggene i denne oppgaven; tidligere lokale kjøretøy-/objektendringer er bevart. Ingen publisering er utført.

## Konsolidering – punkt 1–15

1. **Root cause:** `mergeBatchResults` samlet tidligere berikede dokumentposter med `flatMap`, uten et eget same-side objektlag. Ett objekt omtalt i flere PDF-er/batcher kunne derfor nå cross-side matching som flere objekter. Den konservative matcheren kunne korrekt avvise tvetydige poster, men manglet konsoliderte logiske objekter å sammenligne.
2. **Plassering:** `enrichBatch` bevarer nå dokumentpostene med globale dokumentreferanser før katalogberikelse. `mergeBatchResults` samler alle vellykkede batcher per side, konsoliderer disse postene og beriker det sammenslåtte dokumentgrunnlaget før resultatet sendes til `runHybridMatching` og `groupInsurances`.
3. **Hvorfor:** Alle batcher må være tilgjengelige for å oppdage både duplikater og konflikter. Cross-side matching må se logiske objekter. Eksisterende berikelse av enkeltposter er bevart for kompatibilitet; konsolideringen bruker det separate dokumentgrunnlaget, aldri en sammenblanding av katalog- og kundefakta. Konsoliderte objekter får katalogberikelse på nytt med de ferdig prioriterte dokumentfaktaene.
4. **Identity-regel:** Én side + samme canonical forsikringstype + samme eksakte, gyldig normaliserte, typespesifikke ID. Generell kjerne indekserer `[insuranceType, identifierType, normalizedIdentifier]`. Provider, produktnivå, pris, navn, filnavn, dokumentrekkefølge, PDF-grense og batchnummer brukes ikke som objektidentitet. Policy-laget avviser en inputliste som blander existing/offer.
5. **Identifier-typer:** Registreringsnummer, VIN og serienummer gjennom det eksisterende strategiregisteret for kjøretøy. Kjernen kjenner ikke formatene. Syntetisk `property_id` injiseres i arkitekturtesten, uten å aktivere Hus eller andre nye produkter.
6. **Flere identifiers:** En eksakt felles ID kan knytte komplementære poster sammen. Hele den sammenhengende gruppen kontrolleres før merge. Alle gyldige ID-tokens tas med i indeksen, også når én post selv oppgir to motstridende verdier av samme ID-type.
7. **Identity-konflikt:** Samme registrering + ulike VIN, konflikt gjennom en mellomliggende post eller interne motstridende IDs blokkerer hele den berørte gruppen. Ingen delgruppe velges tilfeldig. Postene beholdes med `unresolved`/`identity_conflict`, og cross-side matcher lager ikke et antatt par.
8. **Uten identity:** Poster uten sikker ID forblir separate. En post med ID absorberer aldri en uten ID. Ingen fuzzy matching, OCR-reparasjon eller index-matching er innført.
9. **Komplementære facts:** Dokumentfakta normaliseres per originalpost, grupperes innenfor det sikre objektet og beholdes som separate canonical fakta. Pris, TFA, total, egenandel, dekninger og detaljer går ikke til andre objekter.
10. **Identiske facts:** Samme normaliserte faktanøkkel og tekstverdi dedupliseres. Ulik case/whitespace kan normaliseres for faktadeduplisering; ulike tall/innhold tolkes ikke som like. Alle tilhørende dokumentkilder beholdes. Ingen global deduplisering på tvers av objekter.
11. **Konfliktende facts:** Dokumentert individuell avtale prioriteres over dokumenterte generelle vilkår. `unknown` dokumentrolle gis ingen oppfunnet lavere prioritet. Uavklarte verdikonflikter beholdes i `factConflicts` og vises med et synlig varsel; begge verdier og originalposter finnes i detaljene. Ingen første/siste/batch-vinner. Underordnede verdier som erstattes har `overriddenBase`; hele originalgrunnlaget finnes dessuten i `recordEvidence`, også når et generelt dekningsutsagn må vike for individuelt detaljbevis.
12. **Produktkonflikt:** Eksisterende eksakt provider-/produktnormalisering brukes for kompatibilitetskontroll. Sikkert identiske katalogprodukter kan deles selv om visningsnavnet varierer. Kasko kontra Pluss beholdes som separate uavklarte poster. Ulike eksplisitte providers på samme side behandles også som konflikt; provider er fremdeles ikke object identity. Ukjent canonical produkt tolkes ikke fra et objektnavn.
13. **Temporal konflikt:** Uttrekket har nå minimale felt `documentRole` og `agreementPeriod` (`from`/`to`, ISO-dato eller null). Schema/prompt og validering krever eksplisitt dokumentbelegg; filnavn, vilkårsversjon, dokumentdato og registreringsdato skal ikke brukes som avtaleperiode. Ugyldige/reverserte datoer avvises. Ulike dokumenterte periodegrenser blokkerer merge. Manglende periode alene blokkerer ikke den ellers sikre minimumsregelen. Ingen historikkmotor er bygget.
14. **Provenance:** Fakta beholder opprinnelig `pdf:side:documentIndex` og dokumentrolle. Objektet får unionen av dokumentreferanser, mens fakta beholder sine egne kildesett. Originalpostene med produkt, selskap, periode, rolle, scalarverdier og fakta ligger i `recordEvidence`. UI tilbyr «Vis dokumentgrunnlag» og eksisterende «Vis kilde». PDF-kilder vises som dokumentreferanser; private original-PDF-er lagres ikke for nye nedlastingslenker. Katalogkilder beholder sine opprinnelige metadata/URL-er.
15. **Document > catalog:** Ny inngang `enrichConsolidatedInsurance` bruker de ferdig løste dokumentfaktaene i samme katalogberikelsespolicy. Sammensatt summary normaliseres ikke på nytt over prioriterte fakta. Katalogen overstyrer ikke kundens verdier eller valg. `selected`/`not_selected`/`unknown`, dokumentert avslag, tillegg og standarddekninger følger eksisterende coverage-motor. Katalogtilgjengelighet alene gjør ikke valgfri dekning selected.

## Cross-side – punkt 16–24

16. Konsoliderte objekter returneres på samme plass i `insuranceData.insurances`. API-et bruker disse før hybrid-/cross-side matching; ingen ny parallell matchsti.
17. Eksakt matching er fremdeles typeavgrenset og ID-basert. Tre dokumentposter mot to blir først ett objekt på hver side, deretter ett eksakt par. Endret provider/produkt på motsatt side hindrer ikke objektmatch.
18. `UNIQUE_TYPE_PAIR` er bevart som eksplisitt svakere regel for ett kjent typeobjekt per side uten IDs, uten identitetskonflikt og uten relevant partial failure. Konsolidering absorberer ikke no-ID-poster. Flere uidentifiserte objekter og restposter etter andre eksakte treff matches ikke ved gjetting.
19. Missing object/product beregnes fra de konsoliderte listene. Gjentatte PDF-poster skaper ikke ekstra missing warnings. Et faktisk manglende objekt beholder egen advarsel selv om samme forsikringstype finnes på begge sider. Et nytt offer-objekt gis ikke pris 0 på existing.
20. Uavklarte same-side grupper merkes `CONSOLIDATION_CONFLICT`. Eksisterende ambiguous-visning brukes: synlig varsel og separate dokumentposter i detaljene, uten påstått sammenligningspar. Fact-konflikter på et sikkert identifisert objekt markeres separat; øvrige ukonfliktende fakta kan fortsatt sammenlignes.
21. Partial failure beholdes i respons/progress og i matchingkonteksten. Vellykkede fragmenter kan konsolideres. Eksakt dokumentert ID kan fortsatt matches. Fravær tolkes ikke som sikkert fravær i et ufullstendig dokumentsett; den eksisterende partial-advarselen beholdes.
22. **Flere biler:** Tre biler med syv dokumentposter blir tre separate objekter. Faktaverdier, status og kilder holdes per objekt, også med stokket rekkefølge og andre produkter/providers på offer.
23. **Flere tilhengere:** To tilhengere med flere poster blir to objekter. Missing/new/ambiguous-varianter er testet sammen med biler, snøscooter og campingvogn.
24. **Generell arkitektur:** Syntetisk ikke-kjøretøytype med Property A, to komplementære dokumenter og injisert `property_id` konsolideres til ett objekt. Property B forblir separat; to poster uten sikker ID forblir separate. Ingen ny Hus-, Båt-, Dyr- eller personforsikringsimplementering.

## Privacy og performance – punkt 25–32

25. IDs brukes request-lokalt i konsolidering/matching og i den autentiserte resultat-/kildevisningen.
26. Ingen IDs eller filnavn er lagt til telemetry, semantic audit eller progress. De eksisterende allowlist-grensene beholdes. Både enhets-/integrasjonstester og faktiske lokale HTTP-logger/progress kontrolleres med syntetiske ID-sentinels.
27. Ingen nye telemetry-events eller identity-felt. Eksisterende numeriske object-/batch-/progress-målinger er tilstrekkelige. Progress viser fortsatt behandlingsposter, mens resultatet viser logiske objekter; dette er ikke en ny progress-designrunde.
28. Ingen nye AI-kall. 10+10 flerbatch-testen gjør akkurat de åtte planlagte extraction-kallene, ikke et konsolideringskall. Faktisk lokal HTTP-regresjon bruker en lokal stub; ingen produksjons-AI ble kalt.
29. Ingen embeddings eller semantisk object matching.
30. Ingen database, persistent PDF/object storage eller delt LLM-historikk mellom batcher er innført.
31. ID-indeksering og union-find krever tilnærmet lineær behandling av ID-tokenene; fakta/kilder sorteres og dedupliseres innenfor gruppen. Ingen nettverks-I/O. Dagens produkt-/dokumentbudsjetter er beholdt. Det er litt lokal ekstrakostnad ved ny katalogberikelse av sammenslåtte objekter; ingen produksjonslatensgevinst eller eksakt produksjonskostnad påstås fra syntetiske tester.
32. Extraction concurrency er fortsatt **2**; målt og testet i 10+10-batchtesten og HTTP-regresjonen.

## Filer og tester – punkt 33–35

33. **Eksisterende filer endret i denne oppgaven** (mot arbeidskopien ved oppgavestart, ikke mot eldre HEAD):

| Fil | Endring |
| --- | --- |
| `lib/analysis-merge.ts` | Bevarer kundefaktagrunnlag med dokumentroller; konsoliderer samme side før cross-side og beriker konsoliderte objekter. |
| `lib/analysis-output.ts` | Minimale eksplisitte dokumentrolle-/avtaleperiodefelt, prompt og streng dato-/enumvalidering. Eldre interne kall uten feltene er kompatible. |
| `lib/catalog-enrichment.ts` | Gjenbruk av katalogpolicy med allerede løste dokumentfakta uten ny summary-normalisering. |
| `lib/object-matching.ts` | Eksporterer gjenbrukbar identitetslesing, bevarer alle ID-tokens og avviser uavklarte same-side konflikter. Filen var allerede ny/untracked fra forrige oppgave. |
| `lib/comparison.ts` | Typer for metadata/provenance og synlig fact-konfliktvarsel, uten å bytte coverage-motor. |
| `app/page.tsx` | Minimal dokumentgrunnlag-/periode-/rollevisning i eksisterende detaljer og uavklarte poster. |
| `scripts/verify-analysis-http.mjs` | Syntetisk HTTP-regresjon: ti poster per side blir syv objektpar med komplementære fakta/kilder. |

34. **Nye filer i denne oppgaven:**

| Fil | Formål |
| --- | --- |
| `lib/object-consolidation.ts` | Generell, type-/strategistyrt same-side identitetskjerne og konfliktmetadata. |
| `lib/insurance-object-consolidation.ts` | Produkt/provider/periode-policy, dokumentprioritet, fact-/scalar-/addonmerge og provenienshistorikk. |
| `tests/same-object-consolidation.test.mjs` | 82 nye regresjonstester, inkludert alle 60 bestilte scenarier og ytterligere sikkerhets-/integrasjonstilfeller. |
| `docs/same-object-consolidation-audit.md` | Denne rapporten. |

Tidligere ucommittede vehicle-extension-kataloger, kilder, typeutvidelser, objektmatcher, sammenlignings-/runtime-endringer og rapporter er bevart. Ingen katalogverdier eller kildeoriginaler er endret i denne oppgaven. Ingen ny nedlasting. Midlertidige logger og den syntetiske UI-harnessen ligger utenfor prosjektet i `/tmp`.

35. De bestilte testene 1–60 er nummerert i den nye testfilen. Hele listen over 82 nye testnavn står i vedlegget nedenfor. Testene går gjennom generell kjerne, policy, ekte normalisering/berikelse, batchpool, semantic/matching, pris, coverage, provenance, progress og UI-markup. Fullporteføljen har ti existing-dokumenter og ti offer-dokumenter med ulik fordeling/rekkefølge, inkludert PDF-er med flere objekter og objekter fordelt over flere PDF-er.

## Validering – punkt 36–52

36. **989 tester totalt**, baseline 907 + 82 nye.
37. `node --test tests/*.test.mjs`: **989/989 bestått**, 0 feil, 0 skipped.
38. Same-object consolidation: **82/82**, herunder de 60 nummererte kravscenariene.
39. Eksisterende object-aware/multi-object-gruppe: **60/60**.
40. Cross-batch: samme ID i forskjellige batcher konsolideres; reversert resultatrekkefølge gir identisk resultat/provenance. 10+10 bruker åtte batcher og maks to parallelle kall.
41. Konflikter: ID, flere ID-typer, interne motstridende IDs, bridge-konflikt, provider, produkt, periode, pris og coverage er testet konservativt. Uavklart rollekonflikt får ingen vilkårlig vinner.
42. Provenance: fakta fra dokument 1/4 beholder riktige kilder; identiske fakta beholder begge; katalogkilder omklassifiseres ikke. UI-kildeåpning kontrollert.
43. Privacy: interne IDs finnes ikke i telemetry/semantic-audit/progress. Filnavn er ikke identity. HTTP-loggkontroll bestått.
44. Full portfolio: **3 Bil + 2 Tilhenger + 1 Snøscooter + 1 Campingvogn = 7 eksakte par**. Manglende bil dekkes av eksisterende 60-tester; ny fullportefølje tester bestemt manglende tilhenger, nytt offer-objekt, no-ID/ambiguous, partial failure og forskjellig provider/produkt/fordeling. Ingen falsk nullpris eller missing fra fragmentering.
45. Vehicle-extension/source integrity: **66/66** (40 katalog/source-hash + 26 pipeline).
46. Fase 2: **48/48**, pluss nye flerbatch-/concurrency-/partial-tester.
47. Gjensidige Bil-regresjoner og øvrige providers bestått i full suite og separate grupper for catalog, document precedence, effective facts, pilot/add-ons, pris/km og totalskade. Coverage-statusmotoren er ikke redesignet.
48. Runtime/HTTP/PDF: eksisterende `node scripts/verify-analysis-http.mjs` **PASS** mot siste webpack production-build. Reelle syntetiske PDF-byte går gjennom PDF-leser, API, lokal AI-stub, merge, sanitizer og sammenligning. Kontrollerer også pilottilgang, ugyldig PDF før AI, 10+10, partial corrupt PDF, avbrudd, 429/ingen retries, concurrency, sikre logger og progresjon. Ingen private kundedokumenter. Desktop og **390 px** kontrollert med faktisk React-resultatkomponent og syntetisk fixture: faner, tastaturåpning av dokumentgrunnlag, periode/rolle, «Vis kilde», uavklarte objekter. Ingen side-overflow (390/390); detaljtabellen beholder eksisterende horisontale rulling.
49. `npx tsc --noEmit`: **bestått**.
50. `npm run lint`: **bestått**, ingen ESLint-feil/advarsler.
51. `npx next build --webpack`: **bestått**.
52. `git diff --check`: **bestått**.

Node gir fortsatt repoets eksisterende MODULE_TYPELESS_PACKAGE_JSON-advarsel. Den er ikke en testfeil og er ikke endret som en sideoppgave.

Separate grupper (overlapper; skal ikke summeres):

| Gruppe | Resultat |
| --- | --- |
| Runtime | 1/1 |
| PDF | 21/21 |
| Security | 22/22 |
| Performance | 25/25 |
| Semantic matching/audit | 64/64 |
| Catalog/canonical | 454/454 |
| Document precedence | 23/23 |
| Effective facts | 42/42 |
| Pilot/add-ons | 41/41 |
| Fase 2 | 48/48 |
| Progress/pris | 45/45 |
| Premium/mileage | 21/21 |
| Totalskade | 14/14 |
| Vehicle-extension/source integrity | 66/66 |
| Object matching/missing product | 60/60 |
| Same-object/full-portfolio | 82/82 |

## Blindtestmatrise A–P

READY betyr sikker behandling og synlig usikkerhet, ikke at alle opplastede dokumenter eller kataloger alltid kan identifiseres fullstendig.

| Område | Status | Teknisk begrunnelse |
| --- | --- | --- |
| A Same-side consolidation | READY | Eksakte typed IDs, hele konfliktkomponenter avvises, cross-batch testet. |
| B Multiple cars | READY | Tre biler holdes adskilt gjennom fragmentering og stokket offer. |
| C Multiple trailers | READY | To tilhengere med duplikatposter, missing/new/ambiguous testet. |
| D Snøscooter | READY | Eget typescope og eksisterende kildebasert katalog/pipeline består. Ukjent produkt/grense forblir udokumentert. |
| E Campingvogn | READY | Eget typescope, kildegrunnlag og pris uten automatisk TFA består. |
| F Cross-side exact matching | READY | Skjer etter same-side consolidation; ingen provider-/produkt-/index-identitet. |
| G Missing object | READY | Logiske objekter, ikke dokumentposter; partial-kontekst beholdes. |
| H Missing product | READY | Manglende type/objekt vises; ukjent produkt gjettes ikke til en katalog. |
| I Pricing | READY | Identiske priser dobles ikke, konflikter beholdes, ulike prisgrunnlag og totalsummer summeres ikke. |
| J TFA | READY | Separat canonical key, ingen syntetisk TFA eller automatisk TFA for de nye typene. |
| K Coverage comparison | READY | Dokumentprioritet og selected/not_selected/unknown består; konflikter synlige. |
| L Add-ons | READY | Komplementære dokumenterte valg beholdes og duplikater vises én gang. Katalogmulighet er ikke kundens valg. |
| M Catalog matching | READY | Eksakt eksisterende katalogmatching beriker ett logisk objekt. Status innebærer ikke komplett vilkårsdekning for ukjente produkter. |
| N Provenance | READY | Per-fact originalkilder, dokumentgrunnlag, rolle/periode og katalogkilder bevart. |
| O Partial failure | READY | Overlevende objekter konsolideres; advarsel og svakere fraværskonklusjon beholdes. |
| P Fase 2 multi-PDF | READY | 10+10, flere batcher, concurrency 2, budsjett/failure/privacy og ekte lokal HTTP/PDF består. |

## SYSTEM_GAP versus INSUFFICIENT_DOCUMENT_EVIDENCE

Det dokumenterte **SYSTEM_GAP** – gjentatte logical objects på tvers av dokumenter/batcher – er løst og regresjonstestet. Ingen kjent utestet indeks-/provider-/produktbasert snarvei brukes for objektidentitet.

Følgende kan fortsatt kreve rådgiverkontroll, og skal ikke løses ved gjetting:

- Manglende eller ugyldig sikker object ID, særlig flere objekter av samme type.
- Eksplisitt ID-, provider-, produkt- eller periodekonflikt på samme side.
- Ulike faktaverdier uten dokumentert prioritet, eller ukjent dokumentrolle.
- Partial failure og dokumenter som ikke inneholder de nødvendige opplysningene.
- Ukjent produktvariant eller utilstrekkelige autoritative katalogkilder.

Dette er **INSUFFICIENT_DOCUMENT_EVIDENCE** når systemet viser usikkerheten og avstår fra antatte treff/verdier. Eksisterende kildebegrensninger i `docs/vehicle-object-catalog-audit.md` er ikke fylt med antakelser eller erklært kildeavklart her: blant annet Tryg snøscooter før 01.10.2026, Storebrand Super-løsøresum, If campingvogn Super/S-709 og Gjensidige versjonsinformasjon. Kildearbeid ligger utenfor denne oppgaven. READY gjelder den sikre blindtestflyten, ikke en garanti for fullstendig vilkårskatalog eller feilfritt AI-uttrekk fra alle reelle PDF-er.

## Git og stoppunkt

Arbeidskopien er med vilje ikke clean. Tidligere arbeid og denne implementasjonen står lokalt til gjennomgang. `.env.local` er ikke endret. Ingen private PDF-er, credentials eller nye secrets er introdusert. Ingen commit, push, reset, revert, stash, rebase, amend, branch-/remote-endring eller deployment-endring er utført.

Neste steg er **gjennomgang → én samlet commit/push etter ny beskjed → deploy → ekte blindtest**. Ingen av disse publiseringsstegene er startet.

## Vedlegg: alle nye testnavn

1. 01 same-side records become one logical object
2. 02 complementary canonical facts retained
3. 03 union of document references preserves both documents
4. 04 same object across extraction batches is consolidated before matching
5. 05 batch completion order is deterministic
6. 06 three cars with seven records become three objects
7. 07 canonical facts never leak between cars
8. 08 input order does not alter merged data/provenance
9. 09 two repeated trailers remain two objects
10. 10 multiple records without IDs remain separate
11. 11 one-sided identifier never absorbs unidentified record
12. 12 distinct IDs never merge
13. 13 same registration and VIN consolidate
14. 14 same registration conflicting VIN fails closed
15. 15 safe registration formatting normalization
16. 16 OCR similarity cannot merge identities
17. 17 identical facts deduplicate with both sources
18. 18 documented individual agreement outranks general terms with history
19. 19 unknown equal roles retain conflicting values and mark conflict
20. 20 conflict resolution independent of order
21. 21 repeated premie.ekskl_tfa is never summed
22. 22 repeated premie.tfa is never summed
23. 23 repeated premie.total is never summed
24. 24 premium TFA total remain separate canonical values
25. 25 conflicting totals remain explicit and no numeric winner
26. 26 complementary selected addons survive consolidation
27. 27 individual not_selected beats general selected/detail evidence
28. 28 duplicate selected addon appears once
29. 29 document limits outrank catalog limits after consolidation
30. 30 optional catalog-only coverage never becomes selected
31. 31 catalog and customer source origins stay distinct
32. 32 catalog enrichment does not duplicate consolidated object
33. 33 three versus two document fragments match as one object
34. 34 two cars split differently match their exact counterparts
35. 35 repeated fragments do not generate false missing warnings
36. 36 actual missing consolidated object remains visible
37. 37 cross-batch different document fragments preserve sources
38. 38 reversed completion across both sides keeps results stable
39. 39 ten existing PDFs consolidate into seven logical objects
40. 40 10+10 multi-batch portfolio does not add AI calls or concurrency
41. 41 partial failure still consolidates successful fragments
42. 42 partial result warning/context retained after consolidation
43. 43 internal object identifiers remain available for exact matching
44. 44 telemetry contains no identifiers or filenames
45. 45 semantic matching/audit only sees matched fact scopes
46. 46 safe progress discards object identity injected as extras
47. 47 safe object matching counts contain only numbers
48. 48 filename never serves as identity
49. 49 non-vehicle Property A complementary records consolidate
50. 50 non-vehicle Property A and B stay separate
51. 51 non-vehicle no-ID records never fuzzy merge
52. 52 compatible same product merges complementary documents
53. 53 product level conflict remains unresolved, never picks Pluss or Kasko
54. 54 explicit different agreement periods cannot merge
55. 55 unknown period does not prevent otherwise safe consolidation
56. 56 fact A retains original document 1 provenance
57. 57 fact B retains original document 4 provenance
58. 58 detail rows retain independently accessible source lists
59. 59 catalog sources are never reassigned to customer PDF
60. 60 completion order cannot alter provenance
61. identity bridge conflict rejects the whole connected component
62. same registration across types cannot consolidate
63. provider alias variation can merge but different insurers cannot
64. same-side API rejects cross-side input
65. unknown role not invented lower priority than individual
66. equal-priority selected/refused evidence remains unknown
67. individual details are not defeated by general parent refusal
68. unknown product marker cannot derive conflict from object display label
69. extraction accepts explicit role and period but rejects invalid dates
70. full portfolio actual missing trailer is isolated without false warnings
71. new trailer only in offer remains missing and price is not zero
72. multiple no-ID trailers remain ambiguous alongside safe exact pair
73. fact conflicts are visible in important differences
74. unresolved side-only consolidation is ambiguous rather than missing
75. UI exposes preserved document records and periods without hiding source details
76. same vin alone consolidates without registration
77. same serial alone consolidates without registration
78. serial identifiers remain case sensitive
79. conflicting annual scalar premiums and deductibles are retained with evidence
80. document role cannot be arbitrary extraction metadata
81. catalog matching for existing non-car types survives consolidation
82. conflicting repeated identifier kind connects and blocks every affected component

BLINDTEST_READY
