# MC/Bobil – validering og sluttrevisjon

## Status

MC: FULL_PIPELINE_READY. Bobil: FULL_PIPELINE_READY.
Alle tolv provider/type-kombinasjoner er IMPLEMENTATION_READY for dokumenterte ordinary-produkter. Kildepakkene er READY med eksplisitte avvik/utelatelser; dette er ikke et løfte om å modellere alle vilkår. Ingen produksjonsverifisering eller deployment.

## Tall og integritet

- Produkter: 121 før, 19 MC + 24 Bobil nye, 164 etter.
- Tillegg: 44 før, 16 nye, 60 etter.
- Nye scoped source metadata records: 76; alle med SHA-256. 253 før, 329 etter.
- Source inventory: 61 oppføringer som refererer til 60 ulike lokale originaler. 44 nye fysiske artefakter (30 PDF, 14 HTML); 16 eksisterende originaler gjenbrukt uendret. Ingen hashavvik eller ulistede originaler.
- 59 nye produkt-/tilleggskomponenter, 1243 materialiserte fakta. Arv er eksplisitt materialisert per nivå, ikke semantisk duplisering i et effektivt produkt.
- Semantiske registernøkler: MC105, Bobil125, union149. 81 felles for begge typer, 24 mc.* og38 bobil.*. Ytterligere seks parkering.* er delt kjøretøysemantikk som brukes bare for Bobil i denne bølgen. Pris/objektfelter inngår i registertellingen, men aldri som antatte katalogverdier. Aliaser teller ikke som nye facts.

Full produkt-/tilleggs-/familie-/metadataoversikt: [mc-bobil-matrices.md](mc-bobil-matrices.md). Kildegrunnlag: de tre mc-bobil-sources-*.md-rapportene og tre JSON-manifester.

## Validering

| Kontroll | Resultat |
| --- | --- |
| Baseline full suite | 1526/1526 |
| Nye fokuserte tester | 264/264 |
| Relevant målrettet gruppe | 1012/1012 |
| Full suite etter | 1790/1790 |
| npx tsc --noEmit | PASS |
| npm run lint | PASS |
| npx next build --webpack | PASS |
| git diff --check | PASS |
| Syntetisk HTTP/PDF-runtime | PASS |
| Desktop | PASS |
| 390 px | PASS, document.scrollWidth=390 |
| Tastatur/tilgjengelighet | PASS |

264 nye tester: provider/source106 (Tryg/If47, Gjensidige/Storebrand33, Fremtind/Frende26), normalisering53, pipeline37, tillegg29, presentasjon19, manuell registrering20. Ingen tester fjernet.

Tre eksisterende agreement-scope-tester fikk presisert kontrollkatalog: de opprinnelige121 produktene har fortsatt ordinary/legacy-oppførsel; extraction-test uten registrerte scopes kjører eksplisitt med tom scope-definisjon. Dette var nødvendige endringer til gamle antakelser om at ALLE produkter i hele katalogen manglet scopevarianter. Testenes opprinnelige atferdskrav er beholdt. Nye scope-tester dekker faktisk MC/Bobil-katalog og ambiguity.

Full suite inkluderer alle eldre Bil/Innbo/Hus/Reise-, snøscooter/campingvogn/tilhenger-, security/upload/PDF/performance/semantic audit/source authority/coverage/effective-fact/portfolio-regresjoner. Ingen kjent flake eller uløst testfeil i sluttkjøringen.

## Testet korrekthet

- Document X vinner over catalog Y, også med alternative tall, gjentatt normalisering og konsolidering.
- Opphørsalder/km, kjøpskrav, egenandelsintervaller, alders-/kilometerfradrag, nyverdi, årlig kjørelengde og kilometerstand holdes adskilt.
- Sammensatt dokumentfact omscopes bare etter trygg splitting. Avvist grammatikk mister ikke sin etablerte canonical identity. Hovedforfallsforbehold bevares.
- Nye mc.*/bobil.* avvises på andre typer, uten å slette rå dokumenttekst. Presise labels kan reparere motstridende keys innen riktig type.
- Optional availability gir ikke selected. not_selected/conflict blokkerer tillegg. Eksakte navngitte varianter og eksklusive tillegg må være dokumentert; ingen fuzzy matching eller provider-if.
- Feil provider/type/scope/versjon/gyldighet gir ingen kilde-/tilleggslekkasje. Like autoritative motstridende kilder forblir uavklart.
- General terms alene gir ingen kundeobjekter/priser. Sikkert tilknyttede støttekilder bevarer scope/provenance og kan ikke importere kundepris.
- To MC + to Bobil matches med sikre identifiers i omvendt rekkefølge og ved bytte av provider/nivå/PDF-grense. Manglende/nye objekter synliggjøres. Flere uten sikker ID matches ikke etter indeks.
- Identiske facts undertrykkes som forskjeller; ensidige dokumenterte facts og unknown beholdes. Ingen winner/score. Dokumentert pris/TFA holdes på riktig objekt.

## Runtime og UI

Eksisterende script verify-analysis-http.mjs ble kjørt mot webpack production build med lokale syntetiske PDF-er og lokal OpenAI-mock. Alle tidligere kontroller er beholdt. Ny scenario: firePDFer per side, toMC og toBobil, stokket rekkefølge, If→Gjensidige, Kasko→Pluss, fireeksakte objektpar, komplette pris/TFA/total-komponenter, document>catalog, type-/kildeseparasjon, details og hovedvisning. Kun de to forventede lokale extraction-kallene, ingen ekstra semantic/network-kall. Ny scenario målte985ms; dette er mock-latency, ikke prognose for ekteAI.

Manuell nettlesertest på lokal production build: Tryg MC Ekstra/Bobil Ekstra mot If MC Kasko/Bobil Super. Oversikt, MC/Bobil-faner, full detaljsammenligning, åpne/lukke Se detaljer med Enter, Tab til kilde, Enter åpner kilde, og ArrowLeft skifter type. Kilden viste riktig selskap, vilkår, dato, side/punkt og original-URL. Responsiv test ved390px viste stablede sider, lesbar heltekst, bevart innrykk/fokus og ingen horisontal side-overflyt. Ingen klientfeil registrert. Fremtind MC scoped dropdown ble også kontrollert manuelt. Alle12 katalogdropdowns/roundtrips er testet automatisk. Ingen årlig kjørelengdefelt introdusert for MC/Bobil.

## Ytelse

Lokal100-pass lookup+fact-resolution-måling: før121produkter,6122.8ms (0.506ms/produkt); etter164produkter,3580.2ms (0.218ms/produkt). Ingen påvist regresjon i denne grove målingen; forskjell i warmup/systemlast gjør dette uegnet som påstand om produksjonsforbedring. Eksisterende concurrency og AI-antall er uendret. Extraction schema får canonical enumverdier og en kort typeavgrensningsinstruks; modell og antall kall er uendret.

## Kjente grenser og videre arbeid

- Kildekonflikter/ukjente: If Bobil60k/100k-sidekonflikt løst med fullvilkår60k; DNB-sideavvik løst med daterte fullvilkår; Gjensidige utvidet totalskade i IPID gir ingen antatt høyere grense; Gjensidige versjon/dato ukjent; Storebrand MC bagasjesum og Bobil Kasko-nyverdi utelatt ved utilstrekkelig typebevis; Frende maskinalder beholder begge presiseringer. Se kilderevisjonene for alle utelatelser.
- Fremtind MC er dokumentert viaSpareBank1 og Bobil viaDNB, ikke på tvers av alle kanaler. Eksisterende unambiguous-single-scope-policy gjenbrukes: bare én registrert scope kan løses; flere mulige scopes krever eksplisitt valg. Manuelt produktvalg lagrer eksakt scope. Legacy distribusjonsfelt og andre Fremtind-kataloger er ikke migrert.
- Manuell sikker objektidentitet og MC/Bobil årlig kjørelengde er fremtidig arbeid; flere manuelle objekter uten ID forblir konservativt uavklart.
- LOfavør, NITO, Utdanningsforbundet, bred Fremtind-migrering, Moped/ATV/Traktor/Veteran, dyr og personforsikring er ikke implementert.
- MC/Bobil source facts er SOURCE VERIFIED; programatferd er CODE VERIFIED. Ingen PRODUCTION VERIFIED-påstand. Eksisterende produksjonstrace kan fortsatt klassifisere de nye typene som unknown i sin lukkede allowlist; ingen nye telemetryfelter innført.
- Neste kjøretøybølge kan gjenbruke typeavgrenset registry, source-scoped builder, provider/type/scope-ID, objektmatching, status, priser og UI. Produktspecifikke fakta, nye objektsidentifierstrategier og egne offisielle kilder må fortsatt undersøkes separat.

## Sikkerhet og miljø

Kun offentlige provider-originaler fra offisielle URL-er; ingen kundebevis, privatePDFer, private screenshots eller autentiserte sessiondokumenter. Originaler/hash er uendret ved gjenbruk. Ingen hemmeligheter funnet i kontrollert endringssett; ingen env-filer tracked eller staged. Ingen nye API-nøkler, credentials, persistent kundelagring, PII-logging, produksjonstelemetry, runtime webkall eller AI-kall. .env.local og Railway urørt, oppgitt production tracingOFF er ikke endret/aktivert. Isolerte lokale testprosesser brukte midlertidige syntetiske envverdier, aldri skrevet til prosjektets konfigurasjon. Testserver og nettlesertab er avsluttet; viewport er gjenopprettet.

## Git og filklassifisering

Starten var clean påmain; alle endringer nedenfor er fra denne oppgaven. Ingen commit/push/staging/reset/revert/stash/branchendring. HEAD er fortsatt0411e8b47cc80033c2df5b907c950b5a05ee9820. Ingen uventede filer.

79 filer totalt: 12 produksjons-/integrasjonsfiler, tre provider-kataloger, tre source manifests, 44 offentlige originaler, ti test/helper-filer, ett runtime-script og seks dokumentasjonsfiler. Tracked diff er284 tillegg/22 slettinger; nye kode-/test-/dokfiler cirka4007 linjer før denne tellingen, source manifests5378 linjer, offentlige HTML-originaler39133 linjer og30 binære PDFer. Kataloger og originale kildeartefakter forklarer størstedelen av endringssettet; ingen bred omskriving av comparison/object/scope-arkitektur.

### C – Delt MC/Bobil-arkitektur/katalog/manifest/runtime (19)

- `app/page.tsx`
- `catalog/sources/mc-bobil/fremtind-frende-manifest.json`
- `catalog/sources/mc-bobil/gjensidige-storebrand-manifest.json`
- `catalog/sources/mc-bobil/tryg-if-manifest.json`
- `lib/analysis-output.ts`
- `lib/catalog-enrichment.ts`
- `lib/comparison-presentation.ts`
- `lib/document-fact-normalization.ts`
- `lib/insurance-normalization.ts`
- `lib/mc-bobil-catalog-builder.ts`
- `lib/mc-bobil-catalog.ts`
- `lib/mc-bobil-document-facts.ts`
- `lib/mc-bobil-fremtind-frende-catalog.ts`
- `lib/mc-bobil-gjensidige-storebrand-catalog.ts`
- `lib/mc-bobil-registry.ts`
- `lib/mc-bobil-tryg-if-catalog.ts`
- `lib/presentation-catalog.ts`
- `lib/product-catalog.ts`
- `scripts/verify-analysis-http.mjs`

### D – Offisiell offentlig source artifact (44)

- `catalog/sources/mc-bobil/fremtind-bobil-topp.pdf`
- `catalog/sources/mc-bobil/fremtind-dnb-bobil-page.html`
- `catalog/sources/mc-bobil/fremtind-mc-ipid.pdf`
- `catalog/sources/mc-bobil/fremtind-mc-terms.pdf`
- `catalog/sources/mc-bobil/fremtind-sb1-mc-page.html`
- `catalog/sources/mc-bobil/frende-bobil-ipid.pdf`
- `catalog/sources/mc-bobil/frende-bobil-page.html`
- `catalog/sources/mc-bobil/frende-mc-ipid.pdf`
- `catalog/sources/mc-bobil/frende-mc-mileage.html`
- `catalog/sources/mc-bobil/frende-mc-page.html`
- `catalog/sources/mc-bobil/gjensidige-bobil-MOT08-ipid.pdf`
- `catalog/sources/mc-bobil/gjensidige-bobil-ansvar-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-bobil-delkasko-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-bobil-kasko-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-bobil-pluss-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-bobil-produkt.html`
- `catalog/sources/mc-bobil/gjensidige-mc-MOT03-ipid.pdf`
- `catalog/sources/mc-bobil/gjensidige-mc-ansvar-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-mc-kasko-vilkar.pdf`
- `catalog/sources/mc-bobil/gjensidige-mc-produkt.html`
- `catalog/sources/mc-bobil/if-SV692.pdf`
- `catalog/sources/mc-bobil/if-SV707.pdf`
- `catalog/sources/mc-bobil/if-bobil-ipid.pdf`
- `catalog/sources/mc-bobil/if-bobil-product.html`
- `catalog/sources/mc-bobil/if-mc-ipid.pdf`
- `catalog/sources/mc-bobil/if-mc-product.html`
- `catalog/sources/mc-bobil/storebrand-bil-bobil-produkt.html`
- `catalog/sources/mc-bobil/tryg-05000PA188.pdf`
- `catalog/sources/mc-bobil/tryg-05000PA209.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU18800.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU20900.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU25305.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU25335.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU25405.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU25935.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU27007.pdf`
- `catalog/sources/mc-bobil/tryg-05PAU27010.pdf`
- `catalog/sources/mc-bobil/tryg-bobil-ipid.pdf`
- `catalog/sources/mc-bobil/tryg-bobil-product.html`
- `catalog/sources/mc-bobil/tryg-bobil-terms-index.html`
- `catalog/sources/mc-bobil/tryg-mc-ipid.pdf`
- `catalog/sources/mc-bobil/tryg-mc-product.html`
- `catalog/sources/mc-bobil/tryg-mc-terms-index.html`

### E – Test/helper (10)

- `tests/agreement-scope.test.mjs`
- `tests/helpers/mc-bobil.mjs`
- `tests/mc-bobil-addon-selection.test.mjs`
- `tests/mc-bobil-fremtind-frende.test.mjs`
- `tests/mc-bobil-gjensidige-storebrand.test.mjs`
- `tests/mc-bobil-manual.test.mjs`
- `tests/mc-bobil-normalization.test.mjs`
- `tests/mc-bobil-pipeline.test.mjs`
- `tests/mc-bobil-presentation.test.mjs`
- `tests/mc-bobil-tryg-if.test.mjs`

### F – Dokumentasjon (6)

- `docs/mc-bobil-architecture.md`
- `docs/mc-bobil-matrices.md`
- `docs/mc-bobil-sources-fremtind-frende.md`
- `docs/mc-bobil-sources-gjensidige-storebrand.md`
- `docs/mc-bobil-sources-tryg-if.md`
- `docs/mc-bobil-validation.md`
