# Fremtidig Wave 2-implementering — ikke utført

Denne filen er en konkret gjennomføringsplan, ikke en autorisasjon eller en utført endring. Kun B-017, B-019 og B-021 er READY_TO_IMPLEMENT. Øvrige batcher har navngitte inngangsgates.

**Rekkefølge:** B-019 → gate → B-017 → gate → B-021 → gate → B-015 → gate → B-020 → gate → B-022 → gate → B-018 → full gate.

## B-019 — READY_TO_IMPLEMENT

Avhengigheter: ingen. Modell: GPT-6 SOL MEDIUM. Risiko: LOW.

Inngangskrav: Separat implementeringsordre; kilder og semantikk avklart.

### WHAT TO CHANGE

- Legg en reise.overnatting-term i common ved hjelp av eksisterende faktafunksjon og storebrandReiseProductPage. Bruk eksplisitt positiv dagsturformulering med kildens betydning: reiser med og uten overnatting omfattes generelt.
- Standard og Super arver termen. Behold geografi-factens øvrige informasjon; ingen UI-parser av Dagstur og ingen ny boolsk sammenligningsmotor.
- Knyt direkte dagsturbevis til S05 FAQ, støttet av S04 B.1.2–3. Ikke gi FAQ en konstruert PDF-side/gyldighetsdato; bruk eksisterende HTML-kildekonvensjon.

### WHAT NOT TO CHANGE

- Storebrands geografiske unntak, medisinske kommunevilkår, avbestilling/arrangement, leiebilens overnattingskrav og tjenestereise.
- Tryg Ekstra/Premium og deres fritids-/tjenestereiseformuleringer; generell reiseadgang er ikke lik dekning av alle fordeler.

### AFFECTED SCOPE

- ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]
- ["storebrand","reise","ordinary","storebrand-reise-super","2026-09-20-canonical"]

### EXPECTED RESULT

Storebrand får kjent dagsturregel på reise.overnatting i samme rad som Tryg; tilstanden er dokumentert term, ikke unavailable fordi krav på overnatting er NO.

### SOURCE / PROVENANCE

Eksisterende storebrandReiseProductPage S05 FAQ; fullvilkår S04 PDF 4 underbygger den generelle rammen.

### TESTS

- R-019-01
- R-019-02
- R-019-03
- R-019-04
- R-019-05
- R-019-06
- R-019-07
- R-019-08
- R-019-09

### TARGETED RE-AUDIT

Standard/Super mot Tryg Ekstra/Premium begge veier, samme produkt; reise.overnatting skal ikke være unknown. Leiebil/arrangementsavbestilling og alle øvrige facts uendret.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Storebrand får kjent dagsturregel på reise.overnatting i samme rad som Tryg; tilstanden er dokumentert term, ikke unavailable fordi krav på overnatting er NO.

### FILES

- lib/storebrand-reise-catalog.ts
- tests/nito-remediation-wave2.test.mjs

## B-017 — READY_TO_IMPLEMENT

Avhengigheter: ingen. Modell: GPT-6 SOL HIGH. Risiko: MEDIUM.

Inngangskrav: Separat implementeringsordre; kilder og semantikk avklart.

### WHAT TO CHANGE

- Behold reise.forsinkelse.rute som felles vilkårsramme (påbegynt reise; dokumenterte utløsere; relevante utgifts-/transportørunntak). Fjern den overbrede ubegrenset-påstanden fra rammen.
- Bruk eksisterende reise.forsinkelse.fremmote_sum: for sent til forhåndsbetalt offentlig transport; hotell 6 000 kr per person per skadetilfelle; innhenting ubegrenset.
- Bruk eksisterende reise.forsinkelse.avgang_sum: forhåndsbetalt transport går ikke til avtalt tid; hotell + innhenting samlet 6 000 kr per person per skadetilfelle. Bare innhentingen har vilkår om at transportøren ikke klarer ruten innen 24 timer. Ikke 6 000 for hver av de to utgiftstypene.
- Behold opprinnelig reise.bagasje.forsinket §8.1. Legg til en separat CatalogFact med samme eksisterende nøkkel, presis label om utilgjengelig ekspedert bagasje og 500 kr/person ved overnatting, med egen §8.2 PDF 6-kilde. Ikke påfør denne grenen §8.1s firetimerskrav, og ikke gjør 500 til generell bagasjegrense.
- Definer eksplisitte Reise-labelaliaser for avgangssum og fremmøtesum dersom manglende. Ingen alias fra rute til én av dem. I katalogberikelse: dersom en reell dokument-origin rute-term fortsatt er uspesifisert, ikke fyll de to spesifiserte katalogbarna over den. Ved eksplisitt barn + bred rute bevares barnet og rute; uavklart søsken blokkeres. Unknown-placeholder er ikke dokumentert innhold. Ikke splitt beløp ved friteksttolking.

### WHAT NOT TO CHANGE

- Historiske eika-reise-p10 / eika-reise-pluss, 70/90/120/180-varighet og kanalregler.
- Forsinket ankomst/tapt ferie 500/døgn og 5 000-grenser; eksisterende forsinket bagasje 5 000 og jobb-/hjemreiseregler.
- Ingen skalarsammenligning som ignorerer at fremmøtebeløp kan ha ulik fordeling mellom hotell og transport.

### AFFECTED SCOPE

- ["fremtind","reise","ordinary","fremtind-reise","PRE-450.200-015"]

### EXPECTED RESULT

Fremmøte og avgang blir separate allerede kjente sammenligningsrader; betinget transittbeløp har egen kilde og beholdt hendelse.

### SOURCE / PROVENANCE

fremtindReiseUnifiedTerms, S02 §8.2 PDF 5–6; ikke historisk Eika-kilde.

### TESTS

- R-017-01
- R-017-02
- R-017-03
- R-017-04
- R-017-05
- R-017-06
- R-017-07
- R-017-08
- R-017-09
- R-017-10

### TARGETED RE-AUDIT

Bare aktivt fremtind-reise PRE-450.200-015, forsinkelses-/utilgjengelig-bagasjegrener; uendret historisk Eika-fingerprint. Kontroll mot Tryg og senere B-021 uten å endre Tryg-data.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Fremmøte og avgang blir separate allerede kjente sammenligningsrader; betinget transittbeløp har egen kilde og beholdt hendelse.

### FILES

- lib/fremtind-reise-catalog.ts
- lib/insurance-normalization.ts
- lib/catalog-enrichment.ts
- tests/nito-remediation-wave2.test.mjs

## B-021 — READY_TO_IMPLEMENT

Avhengigheter: B-017. Modell: GPT-6 SOL HIGH. Risiko: MEDIUM.

Inngangskrav: Separat implementeringsordre; kilder og semantikk avklart.

### WHAT TO CHANGE

- Etter B-017s mapping-/kundeprioritetsgate: skill Standard i eksisterende reise.forsinkelse.fremmote_sum og reise.forsinkelse.avgang_sum.
- Fremmøte: minst 1,5 times kvalifiserende forsinkelse etter påbegynt reise; hotell inntil 3 000/person/hendelse og transport inntil 20 000/person/hendelse. Det er ikke én sum på 23 000 og ikke avgangens 24-timersvilkår.
- Avgang: forhåndsbetalt offentlig transport går ikke som avtalt; hotell 3 000/person/hendelse. Ny transport 1 500/person/hendelse bare hvis transportøren ikke klarer å innhente innen 24 timer. Ikke innfør et generelt 24-timerskrav for hotell.
- Super erstatter de to beløpsgrenene hver for seg med ubegrensede summer, men beholder hendelsesvilkår. Felles rute-ramme skal fortsatt ha kvalifiserende årsaker, transportøransvar og forhåndsgodkjennelse etter B.3.1; ikke alle tenkelige forsinkelser.

### WHAT NOT TO CHANGE

- B-019s dagsturregel, utilgjengelig bagasje 500, forsinket bagasje 3 000/6 000, andre Super-tillegg, avbestilling og leiebil.

### AFFECTED SCOPE

- ["storebrand","reise","ordinary","storebrand-reise-standard","2026-09-20-canonical"]
- ["storebrand","reise","ordinary","storebrand-reise-super","2026-09-20-canonical"]

### EXPECTED RESULT

Standard får aldri fremmøtebeløpet på avgangsraden; Super-utvidelse fjerner ikke trigger- og dokumentasjonsvilkår.

### SOURCE / PROVENANCE

S04 tabell PDF 8, vilkår B.3.1.1–2 PDF 9. Lag riktige side/punktreferanser for beløp og betingelser.

### TESTS

- R-021-01
- R-021-02
- R-021-03
- R-021-04
- R-021-05
- R-021-06
- R-021-07
- R-021-08
- R-021-09

### TARGETED RE-AUDIT

Standard/Super hver for seg, innbyrdes og mot Fremtind/Tryg begge veier. 3 000/20 000/1 500 må være i riktige grener.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Standard får aldri fremmøtebeløpet på avgangsraden; Super-utvidelse fjerner ikke trigger- og dokumentasjonsvilkår.

### FILES

- lib/storebrand-reise-catalog.ts
- tests/nito-remediation-wave2.test.mjs

## B-015 — CANONICAL_EXTENSION_REQUIRED

Avhengigheter: ingen. Modell: GPT-6 SOL HIGH. Risiko: MEDIUM.

Inngangskrav: Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

### WHAT TO CHANGE

- Definer bare flytting.tyveri_skadeverk.grense (term) under eksisterende Innbo flytting-familie. Flytt Tryg Ekstra-raden dit; slett den feilaktige transportgrensen fra denne komponenten.
- Verdien må uttrykkelig omtale tyveri/skadeverk under privat flytting og særgrensen 30 000 kr per skadetilfelle for transportbyrå/idrettslag/forening o.l. Ingen påstand om ubegrenset privat erstatning.
- Registrer eventuelt bare hele, godkjente Innbo-labels som identifiserer flyttetyveri/skadeverk. Ikke alias transportskade eller generell tyverigrense. Generiske dokumentfacts bevares; ved uttrykkelig bredt dokumentert flyttevilkår må mulig overlapp blokkeres konservativt i katalogberikelsen.
- Eksakt guard: i Innbo skal en document-origin flytting.transport.grense med dokumentert innhold blokkere katalogutfylling av flytting.tyveri_skadeverk.grense. Presis dokumentert child beholdes alltid. Dette omdøper ikke parent og hevder ikke at hendelsene er like; det hindrer usikker overlapping i eldre dokumentdata.

### WHAT NOT TO CHANGE

- Tryg Innbo basis, uhell §2.5, valgt innbosum, flytteområde/varighet og utleie.
- Andre provideres flytting.transport.grense, inkludert B-005 Storebrand. Ingen migrering av deres fakta basert på Tryg.

### AFFECTED SCOPE

- ["tryg","innbo","ordinary","tryg-innbo-ekstra","2026-07-01"]

### EXPECTED RESULT

Egen presis flyttetyveri/skadeverk-rad; Tryg har ikke lenger en falsk generell transportgrense. Andre leverandørers usplittede fakta beholdes separat.

### SOURCE / PROVENANCE

trygInnboExtra, S01 §2.4 PDF 4. Samme offentlige original/hash; ingen ny source artifact.

### TESTS

- R-015-01
- R-015-02
- R-015-03
- R-015-04
- R-015-05
- R-015-06
- R-015-07
- R-015-08
- R-015-09

### TARGETED RE-AUDIT

Kun Tryg Innbo Ekstra berørt fact/komponent; kontroll av basis og B-005 Storebrand; avgrensede sammenligninger med transportskadeprodukter begge veier.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Egen presis flyttetyveri/skadeverk-rad; Tryg har ikke lenger en falsk generell transportgrense. Andre leverandørers usplittede fakta beholdes separat.

### FILES

- lib/tryg-innbo-catalog.ts
- lib/insurance-normalization.ts
- lib/catalog-enrichment.ts
- tests/nito-remediation-wave2.test.mjs

## B-020 — CANONICAL_EXTENSION_REQUIRED

Avhengigheter: ingen. Modell: GPT-6 SOL EXTRA HIGH. Risiko: MEDIUM.

Inngangskrav: Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

### WHAT TO CHANGE

- Definer presise søsken hus.skadedyr.dyr.bekjempelse og .bygningsskade versus hus.skadedyr.insekter.bekjempelse, .bygningsskade og .egenandel. Dyr-grenen betyr mus/rotter/andre dyr etter kildens avgrensning; ikke bare gnagere og ikke insekter.
- Flytt Standard-fakta til dyr-grenen, med fysisk bygningsskade, svekket isolasjonsevne og lukt. Ikke før videre katalogens usikre generelle firebeinsformulering; bruk kildeordlyden med insekt- og øvrige relevante unntak.
- Pluss beholder dyr-grenen via arv og legger til insekter. Endre rotOption-filteret til å kopiere de presise insektnøklene; ingen replacesBase mot dyr-grenen.
- Standard er uten insektdekning i grunndekningen, men utvidelsen er optional i produktmodus. Bruk eksisterende komponentmekanisme: ikke legg en konkurrerende unavailable-fact med samme nøkkel foran den valgfrie komponenten. Bevar eksplisitt grunnunntak som separat betingelse. Uvalgt tillegg hos kunde er unknown eller eksplisitt not_selected, aldri automatisk selected.
- Avgrens hus.rate.dekning til råtesopp og dens unntak når treødeleggende insekter flyttes til egen gren. Ikke slett insektinformasjon; unngå at samme insektdekning gis to konkurrerende canonical identities. Den felles bygningsskadeegenandelen kan fortsatt oppgi begge anvendelsesområder uttrykkelig.
- Behold fullverdikrav, råtesoppgren, 6 000 kr bygningsskade-egenandel med korrekt kombinert scope og 2 000 kr kun insektbekjempelse. Bevar qualificationSource til IPID for Standard-tilgjengelighet.
- Ingen globale aliaser fra generisk skadedyr til dyr eller insekter. Bare eksplisitt typescopede labels må velge barn. Dokumentert bred skadedyrregel må ikke overstyres av nye presise katalogbarn ved usikker scope; blokker berikelse konservativt og behold dokumentteksten.
- Eksakt Hus-guard: document-origin hus.skadedyr.bekjempelse blokkerer katalogfyll av dyr.bekjempelse og insekter.bekjempelse under hus.skadedyr; hus.skadedyr.bygningsskade blokkerer de to tilsvarende bygningsskadebarna; hus.skadedyr.egenandel blokkerer insekter.egenandel. Presise dokumentbarn beholdes. Ingen guarding basert på ordsøk eller gjetting av dyr i verditekst; unknown-placeholder teller ikke som dokumentert innhold.

### WHAT NOT TO CHANGE

- B-007s bygnings-/våtromsrettelser, øvrige Hus-facts, andre selskapers skadedyrnøkler, Innbo-skadedyr og Bobil.
- Det er ikke tillatt å behandle lukt/isolasjon som bare materialnedbrytning eller å gjøre hele skadedyrfamilien unavailable når bare insekter er avslått.

### AFFECTED SCOPE

- ["gjensidige","bolig","ordinary","gjensidige-hus","Alminnelige vilkår"]
- ["gjensidige","bolig","ordinary","gjensidige-hus-pluss","Alminnelige vilkår"]

### EXPECTED RESULT

Standard/valgt tillegg/Pluss beholder samme dyreskader. Insekter vises som egen valgfri/inkludert gren, med egne kilder og egenandel.

### SOURCE / PROVENANCE

S06 PDF 3–4 for grunnregler; S07 PDF 3–4/6/1 for Pluss; S08 PDF 2 som qualificationSource for valgfritt tillegg.

### TESTS

- R-020-01
- R-020-02
- R-020-03
- R-020-04
- R-020-05
- R-020-06
- R-020-07
- R-020-08
- R-020-09
- R-020-10
- R-020-11

### TARGETED RE-AUDIT

Gjensidige Hus uten/med gjensidige-hus-rate-insekter samt Hus Pluss; kontroll av B-007 og motsatt retning. Eksisterende presentation-concept hus.rate-skadedyr gjenbrukes uten redesign.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Standard/valgt tillegg/Pluss beholder samme dyreskader. Insekter vises som egen valgfri/inkludert gren, med egne kilder og egenandel.

### FILES

- lib/gjensidige-hus-catalog.ts
- lib/insurance-normalization.ts
- lib/catalog-enrichment.ts
- tests/nito-remediation-wave2.test.mjs

## B-022 — CANONICAL_EXTENSION_REQUIRED

Avhengigheter: ingen. Modell: GPT-6 SOL EXTRA HIGH. Risiko: HIGH.

Inngangskrav: Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

### WHAT TO CHANGE

- Utvid CatalogAddOn og BoatPetAddOnDefinition med optional requiresAddOnIds:string[] (all-of) og selectionEvidenceKeys:string[]. Fravær bevarer dagens oppførsel. Metadata er produktkonfigurasjon, aldri kundens valg.
- Valider avhengighetsreferanser i samme provider/type/agreementScope og det eksakte produktets versjons-/kildescope, selvreferanse/syklus/dangling/utestengte varianter. requiresLevel forblir hovedproduktkrav.
- availableAddOns skal fortsatt beskrive tilgjengelighet. Streng selectedComponents/manuell input krever eksplisitt hele valgte settet; Bruk alene skal avvises, aldri auto-velge Liv.
- Produktmodus må materialisere en avhengig tilleggspakke med dens nødvendige komponenter i katalogmodus, men merke alle som optional. Skille Bruk-innhold fra Liv-innhold gjennom componentId/evidence; ikke duplisere Liv som om bare Bruk ga det og ikke mutere et kundeseleksjonssett. Eksisterende resolveCatalogFacts(product,[addon.id]) kan ikke brukes uendret for avhengige tillegg.
- I selectedScopedAddOns: selectionEvidenceKeys avgrenser både generisk valgevidens og komponentavslag. Et eksplisitt avslag på underdekning blokkerer bare dens facts, ikke et dokumentert valgt overordnet tillegg. Eksakt navngitt addon-valg kan brukes; intern katalog-ID eller katalogtekst er ikke dokumentevidens.
- PDF: behold Bruk selected/not_selected/conflict fra kundedokumentet. Manglende/avvist Liv med Bruk valgt gir ingen katalogutfylling som forutsetter Liv og ingen automatisk Liv-status. La base og øvrige gyldige komponenter fortsette; ikke kast hele avtalen. Behold rå dokumentfakta/provenance i eksisterende datastrukturer, ikke telemetry.
- Konfigurer Gjensidige Hund Bruk → gjensidige-hund-liv; Katt Bruk → gjensidige-katt-liv. Bruk har eget valg selv når Liv er valgt. Gi Frende Tap selectionEvidenceKeys=[dyr.liv.dekning] i etterfølgende B-018. Ingen global selskapsregel basert på ordet Bruk.
- Utvid Katt-register med katt.bruksverdi.dekning/alder/begrensning (og eventuelt .grense bare når eget fullvilkår faktisk gir et slikt fact). Ingen hund.bruksverdi-key for katt og ingen påfunnet sum. Legg til gjensidige-katt-bruk og artsriktig presentation-metadata i eksisterende Katt-gruppe.
- Registrer de allerede lokale hund-/katt-Liv/Bruk-fullvilkårene og produktsidene som egne runtime sources med eksisterende hashes, ordinary scope og ukjent kildeversjon/dato beholdt. Knytt dependency til produktside og forsikringsinnhold til fullvilkåret; IPID er ikke eneste faktakilde. Bruk eksisterende qualificationSource-mønster (builder kan måtte føre feltet videre).
- Ikke kopier ufullstendig nettsideformulering om nedsatt avlsevne som universell terskel: fullvilkåret krever 100 % fysisk avlsevnetap for katt/avlshund. Hundens arbeidsfunksjon har egen 50 %-betingelse. Fullvilkårets presisering har høyere autoritet; dette er ikke bevis for kildeferskhet.

### WHAT NOT TO CHANGE

- Ingen selvstendig Liv-produktutvidelse, Valpekull/Kattungekull eller øvrige Wave 3-fakta.
- Ingen global Bruk→Liv for Fremtind eller automatisk Frende Bruk-komponent. Ingen migrering av kundens ukjente kontrakt til ordinary.
- Ingen ny coverage-statusmotor, objektsidentitet, priser, PDF-extraction eller prompt.

### AFFECTED SCOPE

- ["gjensidige","hund","ordinary","gjensidige-hund-behandling",null]
- ["gjensidige","katt","ordinary","gjensidige-katt-behandling",null]

### EXPECTED RESULT

Avhengighet er eksplisitt og håndheves uten å konvertere tilgjengelighet til kundevalg. Artsriktig Bruk blir sammenlignbart bare innen riktig art.

### SOURCE / PROVENANCE

S09/S10 produktsidene dokumenterer kjøpsavhengigheten; S11/S12 fullvilkår dokumenterer arts-/hendelsesscope. Originalene finnes allerede; ingen nedlasting/byteendring.

### TESTS

- R-022-01
- R-022-02
- R-022-03
- R-022-04
- R-022-05
- R-022-06
- R-022-07
- R-022-08
- R-022-09
- R-022-10
- R-022-11
- R-022-12

### TARGETED RE-AUDIT

Gjensidige Hund/Katt base, Liv, Bruk alene, Liv+Bruk; Frende sammensatt Tap via B-018. Negative provider/type/scope/version/cycle-cases; produktmodus, manuell og syntetisk PDF. Andre tillegg uten metadata må være uendret.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Avhengighet er eksplisitt og håndheves uten å konvertere tilgjengelighet til kundevalg. Artsriktig Bruk blir sammenlignbart bare innen riktig art.

### FILES

- lib/product-catalog.ts
- lib/boat-pet-catalog-builder.ts
- lib/boat-pet-catalog.ts
- lib/boat-pet-registry.ts
- lib/catalog-product-comparison.ts
- lib/catalog-enrichment.ts
- lib/presentation-catalog.ts
- lib/manual-agreement.ts
- app/page.tsx (bare nødvendig avhengighetsvalg/validering)
- tests/nito-remediation-wave2.test.mjs
- tests/agreement-scope.test.mjs

## B-018 — BLOCKED_BY_OTHER_BATCH

Avhengigheter: B-022. Modell: GPT-6 SOL HIGH. Risiko: MEDIUM.

Inngangskrav: B-022s selectionEvidenceKeys-kontrakt og delt seleksjonsguard må være implementert og bestå gate før Tap-komposisjonen endres. Ikke tilstrekkelig å flytte to katalograder.

### WHAT TO CHANGE

- Etter B-022s selectionEvidenceKeys-guard: sett Tap-komponentens kjøpsbevis til dyr.liv.dekning / eksakt Tap-navn. hund.bruksverdi.* skal ikke kunne velge hele Tap eller blokkere resten av Tap ved et avslag bare på underdekningen.
- Flytt hund.bruksverdi.dekning og .grense til frende-hund-tap; inkluder kildekvalifisering med eksisterende .alder/.begrensning: ferdig trent, regelmessig bruk, helt tap etter sykdom/ulykke, under 8 år, avl unntatt, særvilkår §7.3 og veterinærattest.
- Behold 50 % av valgt Tap-sum og avkorting av senere dødsfallserstatning etter §8.4, uten å regne ut kundens sum. Fjern frende-hund-bruksverdi fra kjøpbar add-on-liste og den nå overflødige komponenten.
- Gamle manuelle payloads med kun det fjernede ID-et skal avvises tydelig av eksisterende ukjent-tillegg-validering; aldri remappes automatisk til Tap. Gamle dokumentfacts/add-on-tekst bevares som dokumentasjon uten valgt Tap.

### WHAT NOT TO CHANGE

- Frende Katt, Medisin/Tann, Tap-hovedopphør ved hovedforfall etter 10 år. Bruksverdiens under 8 år er et annet vilkår.
- Ingen avhengighetsregel Bruk→Liv for Frende; ingen endring av andre selskapers selvstendige Bruk/Liv.

### AFFECTED SCOPE

- ["frende","hund","ordinary","frende-hund-veterin-r","2026-01-01"]

### EXPECTED RESULT

Tap valgt gir betinget bruksverdidekning i Hund. Uvalgt Tap gir ikke kundevalgt Bruksverdi. Produktmodus viser én tilgjengelig Tap-pakke med Bruksverdi som innhold.

### SOURCE / PROVENANCE

S03 §§7.1.3,7.3,8.2,8.4 PDF 3–4; samme boat-pet:frende:hund original.

### TESTS

- R-018-01
- R-018-02
- R-018-03
- R-018-04
- R-018-05
- R-018-06
- R-018-07
- R-018-08
- R-018-09

### TARGETED RE-AUDIT

Frende Hund base/Tap og ingen/Tap-avslag/Bruksverdi alene/Tap+underdekning-avslag; Frende Katt og andre tillegg uendret. Kjør B-022s felles seleksjonsregresjoner igjen.

### ACCEPTANCE CRITERIA

- Ingen endring utenfor batchens eksplisitte provider/type/scope/version/komponenter.
- Ingen offentlig kildesannhet utledes fra sammenligningsmotpart. Fravær av presis motpart = unknown, ikke not covered.
- Eksplisitt dokument X vinner over katalog Y med minst to alternative verdipar; taus valgfri dekning blir ikke selected.
- Samme produkt mot seg selv og begge sideretninger gir stabil semantikk; kilder følger korrekt fact.
- Alle tidligere godkjente Wave 1 og Wave 2-endringer består uendret; ingen ekstra oppgaver tas med.
- Tap valgt gir betinget bruksverdidekning i Hund. Uvalgt Tap gir ikke kundevalgt Bruksverdi. Produktmodus viser én tilgjengelig Tap-pakke med Bruksverdi som innhold.

### FILES

- lib/boat-pet-catalog.ts
- tests/nito-remediation-wave2.test.mjs

## Final gate

- Hele eksisterende suite må fortsatt bestå (sist dokumentert 2038/2038) sammen med nye regresjoner.
- TypeScript, ESLint, webpack production build, syntetisk HTTP/PDF-runtime og git diff --check.
- Ny målrettet re-audit av bare berørte produkter/familier, og kontrollfingerprint for tidligere validerte 22 produkter/182 uendrede. Ingen ny 204-produkt full-audit.
- Bevar source-originaler og alle tidligere arbeidspunkter. Ingen commit/push/deploy uten egen ordre.
