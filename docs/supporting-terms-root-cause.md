# Kundeobjekter og støttende produktvilkår

STATUS: OBJECT_ROLE_ROOT_CAUSE_PARTIAL

## Bevis og avgrensning

Arbeidet startet fra ren `main` på `c5a53316ef0774b1ac9f8afb5835b624a1f0d754`.
Prisrettelsen for `kr.` var allerede committed og publisert, selv om vedlegget
omtalte den som upushet. Den er bevart.

Siste produksjonskjøring hadde tracing avslått. Ingen private PDF-er, nye
produksjonsuttrekk eller gamle traces ble brukt i denne oppgaven. Rapporten
skiller derfor mellom en bevist strukturell kodefeil og ukjent innhold i den
konkrete produksjonsresponsen.

**FIRST_FALSE_OBJECT_STAGE: ENRICH_BATCH_PROMOTES_GENERAL_TERMS_TO_CUSTOMER_OBJECT.**

- Uttrekkskontrakten tillater flere rader per PDF og krever allerede
  `documentRole`: `individual_agreement`, `general_terms` eller `unknown`.
- Instruksen ber om separate poster for forskjellige dokumentroller. En
  generell vilkårspost i uttrekksresponsen er derfor legitim støtteinformasjon.
- Tidligere sendte `enrichBatch()` alle disse radene til katalogberikelse og
  returnerte alle som `insurances`, uansett dokumentrolle.
- `analyzePdfBatches()` publiserte produktfremdrift fra denne listen.
- Konsolideringen beholder naturlig nok rader uten sikker objektidentitet som
  selvstendige. Dette er riktig for uidentifiserte kundeavtaler, men feil input
  for en produktvilkårspost.
- Prisberegning og kryssidematching fikk dermed generelle vilkår som ekstra
  kundeobjekter. Feilen ligger foran begge disse forbrukerne.

Før produksjonskode ble endret feilet tre nye tester: 2 objekter i stedet for 1,
4 i stedet for 2 i prisgrunnlaget, og 4 sammenligningsgrupper i stedet for 2.
Samme tester består etter rettelsen. Ingen UI-filter eller prisworkaround brukes.

## Symptommatrise

| Symptom | Konklusjon |
| --- | --- |
| 8 produkter i status | FIXED BY ROOT CAUSE i den strukturelle reproduksjonen. Sluttstatus teller konsoliderte kundeobjekter. |
| Pris merket 2 av 4 | FIXED BY ROOT CAUSE. Vilkårsposter er ikke medlemmer av porteføljen. |
| Falske manglende Bil-objekter | FIXED BY ROOT CAUSE. Støtteposter går ikke til kryssidematching. |
| Konfliktvarsler i siste produksjonskjøring | NOT PROVEN. Generelle støtteposter kan ikke lenger delta i kundekonsolideringen, men de faktiske konflikt­nøklene/rollene fra siste respons er ikke tilgjengelige. |
| Kasko totalskadefallback i produksjon | NOT PROVEN. Syntetisk kundegrense bevares, men vi vet ikke hvilken uttrekksrad som bar grensen i den siste kjøringen. |
| Pluss totalskadefallback i produksjon | NOT PROVEN av samme grunn. Ingen ekstra totalskaderettelse er gjort. |

Det er ikke bevist om produksjonen laget støtteposter på begge sider, eller
om forskjellig identifikatortilknytning/konsolidering forklarte asymmetrien.
Vi hevder heller ikke at de konkrete produksjonskonfliktene var
`FALSE_TERMS_PROMOTION_CONFLICT`. Reelle konflikter mellom kundeposter forblir
synlige og testes som positiv kontroll.

## Reproduksjon per dokument

Følgende tabell beskriver den syntetiske 2+2-kjøringen, ikke en rekonstruert
produksjonstrace. Alle poster bruker kanonisk Bil og dokumentert Gjensidige-produkt.

| Side/dokument | Uttrekksrader | Kundeobjekt | Vilkårspost | Selvstendige objekter etter rettelsen |
| --- | --- | --- | --- | --- |
| left/doc_0 | 2 | Kasko, sikker syntetisk ID, individuelle fakta/priser | Kasko, general_terms, ingen objekt-ID | 1 |
| left/doc_1 | 2 | Pluss, sikker syntetisk ID, individuelle fakta/priser | Pluss, general_terms, ingen objekt-ID | 1 |
| right/doc_0 | 2 | Pluss, samme sikre objekt, annen rekkefølge | Pluss, general_terms | 1 |
| right/doc_1 | 2 | Kasko, samme sikre objekt, annen rekkefølge | Kasko, general_terms | 1 |

Dermed: **4 dokumenter, 8 uttrekksrader, 4 støtteposter, 4 kundeobjekter og
2 eksakte objektpar**. Begge sider har komplett prisgrunnlag med nevner 2.
Kasko beholder dokumentets 1 år / 15 000 km, Pluss 3 år / 60 000 km.
Årlig kjørelengde forblir separat. Alternative grenseverdier testes også.
Maskinskade på Pluss beholder dokumentert valgt-status og grenser.

## Implementasjon og kildeprioritet

- Eksplisitt `general_terms` klassifiseres som støtteinformasjon før
  katalogberikelse, produktfremdrift og kundekonsolidering. Manglende ID eller
  pris medfører aldri denne klassifikasjonen. `unknown` beholdes konservativt.
- Den eksisterende rollemetadataen gjenbrukes; intet nytt AI-kall eller egen
  AI-klassifikator. Prompten presiserer rolle på postnivå og avtalevariant.
  Totalskadeinstruksen er uendret.
- Bare kundeposter konsolideres. Etterpå knyttes støtteinformasjon til hvert
  sikkert avgrensede produkt på samme side. To kunderisikoer med samme produkt
  forblir to objekter; de kan dele generelle produktvilkår.
- Scope krever eksakt provider, kanonisk type og produktidentitet. Et eksplisitt
  objekt-ID i støtteposten snevrer scope inn. Ingen fuzzy matching, indeks-,
  rekkefølge- eller PDF-basert objekttilknytning brukes.
- Kjente avtaleperioder, vilkårsnumre og gyldighetsdatoer begrenser bruken.
  Ukjent eller uforenlig versjon beholdes som ubundet evidens. Et nytt
  versjoneringssystem eller medlemskatalog er ikke innført.
- Kundens effektive fakta, priser, egenandel, objektidentitet og tilleggsvalg
  overskrives ikke. Katalogmotoren er urørt. Støtteinformasjon supplerer bare
  manglende, sikkert anvendelige produktfakta; en annen generisk verdi erstatter
  ikke en eksisterende effektiv verdi fra dokument eller katalog.
- Valgfri dekning uten kundevalg blir ikke valgt fra støtteinformasjon.
  `not_selected` og reelle konflikter blokkerer slike dekningsdetaljer.
  Allerede dokumentert/ubetinget etablert dekning kan få manglende vilkårsdetaljer.
- Støttefakta bruker eksisterende produktvilkårsprioritet (`coverageOrigin:
  catalog`) og beholder `source.documentRole: general_terms` samt opplastet
  dokumentreferanse. Dette gjør dem ikke til et innebygd offentlig katalogdokument.
  Kildeknappen viser derfor «produktvilkår» for disse kildene.
- Alle støtteposter beholdes i `insuranceData.supportingEvidence`. Anvendelige
  poster finnes dessuten i objektets eksisterende `recordEvidence` og detaljvisning,
  også når fakta er overstyrt eller ikke kan avgjøre et kundevalg. Generiske
  konfliktverdier beholdes der uten at en tilfeldig effektiv vinner velges.
- Dokumentfremdriften er fortsatt inkrementell. Ny, personvernbegrenset
  `products_resolved` erstatter den foreløpige produktlisten med faktiske
  konsoliderte kundeobjekter før analysen ferdigstilles. Bare kanoniske typer
  sendes i hendelsen; ingen identifikatorer, navn, priser eller kildeutdrag.

## Tester og validering

| Kontroll | Resultat |
| --- | --- |
| Tre opprinnelige reproduksjoner før rettelse | 3 feilet som forventet |
| Ny fokusgruppe, inkludert faktisk React-rendering | 46/46 bestått |
| Samlet målrettet gruppe | 591/591 bestått |
| Hele testsuiten | 1390/1390 bestått; baseline 1344, 46 nye |
| TypeScript | Bestått |
| ESLint | Bestått |
| Webpack production build | Bestått |
| Syntetisk HTTP/PDF-runtime | PASS |
| Desktop 1280 px / mobil 390 px | Antall, native detalj-/kildevisning og tastatur bestått; ingen sideoverflow |
| git diff --check | Bestått, inklusive separate kontroller av nye filer |

Fokusgruppen dekker kunde + vilkår i samme/separate PDF-er, to/tre ekte biler,
delte produktvilkår, terms-only, ukjent rolle og manglende ID/pris, Hus, manuell
registrering, sikker provideralias, forskjellig produkt/type/provider/avtale,
periode/versjon, objekt-ID-konflikt, dokumentprioritet med alternative verdier,
ekte kundekonflikt, valgt/ikke valgt/ukjent, vilkårskonflikt uten tilfeldig vinner,
reelt manglende objekt, partiell kundepris, batch-/side-/rekkefølgeuavhengighet,
asynkron PDF-flyt, delvis dokumentfeil, personvern og de faktiske UI-komponentene.

Den målrettede gruppen inkluderer eksisterende object-aware comparison,
same-object consolidation, missing objects, vehicle pipelines, porteføljepris,
`kr.`-regresjoner, totalskadeuttrekk/-overlevelse/-presentasjon,
catalog/effective facts, document precedence, source authority, coverage-status,
manuell registrering/runtime og Fase 2. Hele suiten dekker også PDF/security,
performance, semantic audit og øvrige kataloger.

HTTP-kontrollen bruker syntetiske PDF-er og lokal OpenAI-stub gjennom den bygde
Next-applikasjonen. Den nye 2+2-kontrollen bruker nøyaktig to uttrekkskall uten
semantisk ekstrakall. Den eksisterende tracingtesten kjøres lokalt; Railway og
produksjonstracing er ikke berørt. Nettleserkontrollen bruker faktisk
serverrendret React-markup og bygget CSS med syntetiske data, ikke private PDF-er
eller en ny reell pilotanalyse.

## Filer og arbeidskopi

| Fil | Klasse | Formål |
| --- | --- | --- |
| lib/supporting-terms.ts | B: ny strukturell rettelse | Rollegrense, sikker scope og bevaring/tilknytning av produktvilkår |
| lib/analysis-merge.ts | B | Kunde-only berikelse/konsolidering; støtteinformasjon beholdes separat |
| lib/analysis-output.ts | B | Presisere eksisterende postrolle og avtalevariant i prompt |
| lib/analysis-progress.ts | B | Personvernbegrenset sluttavstemming av objektlisten |
| app/api/analyze/route.ts | B | Sende avstemt objektantall etter sammenslåing |
| app/page.tsx | B | Eksisterende dokumentgrunnlag også for støtteposter; korrekt kilderolle |
| tests/supporting-terms.test.mjs | C: tester for B | 43 struktur-/dataflyt-/personverntester |
| tests/supporting-terms-ui.test.mjs | C | 3 tester av faktisk React-rendering |
| tests/helpers/supporting-terms.mjs | C | Syntetiske dokument-/vilkårsfixtures |
| scripts/verify-analysis-http.mjs | C | Ny lokal HTTP/PDF-regresjon; tidligere prisregresjon bevart |
| docs/supporting-terms-root-cause.md | C: dokumentasjon for B | Denne rapporten |

A: prisrettelsen er allerede i HEAD, så den har ikke egne ucommittede endringer.
`lib/vehicle-price-presentation.ts`, `tests/portfolio-price-punctuation.test.mjs`
og `tests/pilot-determinism-ui.test.mjs` er uendret fra checkpointet.
Runtime-skriptets prisregresjon er bevart; bare en ny scenario-kontroll er lagt til.
Ingen D/uventede filer er identifisert. Ingen kataloger eller source-originaler
er endret.

## Sikkerhet og gjenstående gap

Ingen private kunde-PDF-er eller kundeidentifikatorer er lagt til. Nye fixtures
bruker syntetiske identifikatorer og eksisterende/syntetiske produktfakta.
Ingen nye AI-kall, modellbytte, runtime-weboppslag, logging av kundedata eller
ny persistent lagring. Ingen endringer i `.env.local`, Railway-konfigurasjon
eller produksjonstracing. Tracing er ikke reaktivert. Ingen commit, push,
reset, revert eller stash er utført i denne oppgaven.

Gjenværende usikkerhet gjelder siste faktiske produksjonsrespons:

1. Faktiske `documentRole` og ID-tilknytning per uttrekksrad er ikke tilgjengelige.
   En feilaktig `unknown`-klassifisert vilkårspost beholdes bevisst konservativt.
2. Det er ikke bevist om kundens totalskadegrenser manglet ved uttrekk, lå på
   feil produkt/post eller ble klassifisert som generelle vilkår. Rettelsen
   gjetter ikke kundeverdier fra generiske poster.
3. De konkrete konfliktnøklene og kildeprioritetene fra siste kjøring er ukjente.
4. Manuell registrering er bevart og den generelle støttefunksjonen er testet
   med manuell post. Eksisterende API tillater fortsatt ikke samtidig manuell
   registrering og PDF-opplasting på samme side; slik ny inputflyt er ikke lagt til.
5. Uttrekkskontrakten har ikke full eksplisitt vilkårsversjon/valid-to per post.
   Eksisterende metadata respekteres når de finnes; vilkårsversjoner kan ikke
   bevises identiske når metadata mangler.

Neste nødvendige verifisering er en godkjent reell kjøring. Hvis symptomer
gjenstår, er minimumsbeviset postrolle, type-/produktidentitet,
ID-tilstedeværelse (ikke rå ID), canonical key presence og source-role per
stage for samme request. Ingen slik observability eller ny tracing er aktivert
i denne oppgaven.
