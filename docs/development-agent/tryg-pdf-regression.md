# PDF-regresjonstesting ved Tryg-endringer

Bruk denne rutinen for katalogen til NITO og Utdanningsforbundet. Den verifiserte matrisen
består av 109 syntetiske PDF-scenarioer i 22 grupper. Se
[gruppe- og scenariolisten i produksjonskvitteringen](../audit/checkpoints/tryg-tredjeparts-pdf-20261119/production-verification-8bfc5906.json)
under `receipt_evidence.groups`. Oppslag for ordinære Tryg-produkter som inngår i
samme produktvalg eller avgrensning, tas med der de er relevante.

## Velg grupper ved en avgrenset endring

1. Identifiser berørte produkter, avtaler, vilkårsutgaver og kilder i diffen. Finn
   de konkrete scenario-ID-ene i kvitteringen og velg hver gruppe som inneholder
   en berørt variant. Ta med nabovarianter når endringen kan påvirke valget mellom dem.
2. Kjør hele den valgte originalgruppen i samme rekkefølge. Bruk de opprinnelige
   syntetiske PDF-ene og den manuelle kontrollsiden. Legg til de negative kontrollene
   i tabellen når endringen berører avgrensning, produktvalg eller tilleggsvalg.
3. Ved en avgrenset kildeendring kontrollerer du også vilkårsutgave, dokument-ID,
   kilde-URL og fysisk PDF-side. Endre forventninger bare med belegg i
   originalvilkårene og versjonsbindingen. Kjør lokale regresjonstester først.
   Rapporter hvilke grupper som er kontrollert på den testede revisjonen.

| Endring | Velg aktuelle originalgrupper |
| --- | --- |
| Bil, elbil eller vilkårsutgave for bil | NITO ligger i `edition-01` til `edition-04`. Utdanningsforbundet ligger i `edition-05` til `edition-08`. Ved endringer i utgavevalget, ta med gruppene for begge berørte utgaver, for eksempel `edition-05` og `edition-06` for Utdanningsforbundet Bil Delkasko. |
| Reise, 70+ eller student | Reise ligger i `edition-01`, `edition-02`, `edition-05` og `edition-08`. 70+ ligger i `edition-05` og `edition-06`. Medlemsproduktene for studenter ligger i `edition-01`, `edition-02` og `edition-04`. |
| Innbo, innbo fritidsbolig og hytte | Innbo ligger i `edition-01`, `edition-03` og `edition-07`. NITO Innbo fritidsbolig ligger i `edition-04`. For Utdanningsforbundets hytteinnbo og hytteinnbo Ekstra, bruk `guard-07` og `guard-08`. Ved endret hyttealias eller skille mot bygning, se også `guard-01`, `guard-05` og `guard-06`. |
| Hus eller utleietillegg til hus | Hus og Hus Ekstra ligger i `edition-01`, `edition-04`, `edition-05` og `edition-06`. Utleietilleggene ligger i `addon-01` for NITO og `addon-02` for Utdanningsforbundet. Ved felles endring i valg av utleietillegg, ta med begge tilleggsgruppene og `guard-02` og `guard-07`. Ved overlapp med råte- eller skadedyrbevis, ta med `external-01` og `external-03`. |
| Liv, ulykke, uføre, Kritisk sykdom, barn eller behandling | Liv ligger i `edition-02`, `edition-05` og `edition-08`, NITO Ulykke i `edition-02` og `edition-03`, og uføre i `edition-03`, `edition-04`, `edition-06` og `edition-07`. Kritisk sykdom for Utdanningsforbundets ektefelle ligger i `edition-03` og for medlem i `edition-08`. Barneforsikring ligger i `edition-07`. Bruk relevante kontroller i `guard-01`, `guard-03`, `guard-04`, `guard-05`, `guard-07`, `guard-08` og `guard-09` ved overlapp med behandling, barn, ulykke eller NITO Kritisk sykdom. |
| Avgrensning mot ordinære vilkår, produkter uten verifisert medlemsutgave eller egne produktvarianter | Velg de berørte scenarioene i `guard-01` til `guard-09` og eventuelle positive motstykker i `edition-01` til `edition-08`. Bruk et eget syntetisk bevis for en ordinær produktvariant som ligger utenfor 109-matrisen. |
| Tredjepartsbevis, forsikringsgiver eller feil i blandede grupper | Kjør `external-01`, `external-02` og `external-03`. Gruppene dekker VIS og AmTrust for råte/skadedyr, inntekt og advokat. For en felles endring i behandlingen av slike grupper, kjør hele matrisen. |

De 38 utgavekontrollene krever riktig produkt, medlemsavtale, utgave og anvendte fakta
med riktig kilde. De to tilleggskontrollene krever utleietillegg for riktig avtale
og dokumentert valg. I de 63 avgrensningskontrollene skal katalogreferanse,
katalogfakta og anvendte fakta være fri for medlemsvilkår. Et gyldig ordinært oppslag kan forekomme.
For de seks tredjepartsbevisene skal riktig utsteder beholdes, med `null` for
medlemsavtale og katalogreferanse.

## Når alle 109 skal testes

Kjør fullmatrisen ved endringer i felles PDF-opplasting, parsing, ekstraksjon
(modell, instruks eller skjema), dokumenttilordning, batchkjøring eller sammenslåing.
Det samme gjelder felles regler for valg av forsikringsgiver, medlemsavtale,
produkt, vilkårsutgave, kildeprioritet eller avgrensning mot ordinære vilkår.
Kjør alle ved en tverrgående feil som kan treffe flere grupper, for eksempel en
503-feil i analysen, eller når omfanget fortsatt er uklart etter diffgjennomgang.
En full produksjonskvittering for en ny revisjon krever bestått resultat for alle
109 på den revisjonen.

Fullmatrisen består av `edition-01` til `edition-08` (38), `addon-01` og
`addon-02` (2), `guard-01` til `guard-09` (63) og `external-01` til
`external-03` (6). For dokumentasjonsendringer med uendret runtime og
uendrede testforventninger holder lenke- og diffkontroll.

## Produksjonskvittering og gjenbruk

Sjekk aktiv Railway-revisjon og utrullings-ID før kjøring. Planlegg om mulig
kjøringen i et vindu med stabil utrulling. For hver gruppe skal HTTP 200 og
fullført dokumentanalyse med null feil og `partial_success: false` følges av
beståtte vilkårskontroller. Match forespørsels-ID mot loggen for den testede
utrullingen. Registrer testet Git-SHA, Railway-utrullings-ID, gruppenes
forespørsels-ID-er og UTC-tidspunkter, testomfang og hasher for testgrunnlag og råresultater.
Gruppe- og scenario-ID-ene og hashene er lagret i kvitteringen. Ved ny kjøring
brukes de opprinnelige testartefaktene for PDF-matrisen.

Gjenbruk bare hele, beståtte grupper med identiske testdata og forventninger og
med loggbevis fra samme revisjon og utrullings-ID som kvitteringen gjelder.
Bevar råkvitteringens bytes og registrer den opprinnelige manifestrevisjonen hvis den
avviker fra revisjonen Railway-loggen bekrefter. Når revisjonen skifter under
kjøringen, registrer hvilke grupper som faktisk gikk på hver utrulling.
Gi 109/109-status først når alle 22 grupper kan avstemmes mot den valgte
utrullingen. Bevar eldre kvitteringer og publiser en revisjonsbundet kvittering
ved fullført verifisering.

Automatisk deploy er av. HOLD og NITO-pausen gjelder i den separate piloten
gjennom både målrettet testing og fullmatrisen.
