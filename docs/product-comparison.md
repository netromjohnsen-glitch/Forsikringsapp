# Produktsammenligning

Produktsammenligning lar en rådgiver sammenligne to eksakte, katalogførte forsikringsprodukter uten kundedokumenter, kundeobjekter, pris eller AI-analyse. Den eksisterende avtalesammenligningen er fortsatt standardmodus og har separat state og dataflyt.

## Dataflyt

`CatalogProduct` velges med den eksisterende kanoniske identiteten `providerId + insuranceType + agreementScope + productId + version`. `lib/catalog-product-comparison.ts` materialiserer arvede grunnkomponenter med `resolveCatalogFacts`, finner tilgjengelige tillegg med `availableAddOns`, beholder faktaspesifikk provenance og grupperer fakta med de eksisterende kuraterte presentasjonskonseptene.

Adapteren kjører ikke dokumentnormalisering, supporting-terms attachment, objektmatching, objektkonsolidering, PDF-behandling eller analyse-API. Den gjør heller ingen nettverkskall mot leverandører. Sammenligningen skjer deterministisk i den eksisterende klienten, der katalogen allerede er tilgjengelig for manuell produktregistrering.

## Produktnivåsemantikk

- `included`: faktumet følger det eksakte produktets arvede grunnkomponenter.
- `optional`: faktumet kommer bare fra et dokumentert, tilgjengelig tillegg. Det presenteres som vilkår dersom tillegget velges, aldri som et kundevalg.
- `unavailable`: katalogen dokumenterer eksplisitt at dekningen ikke er inkludert eller tilgjengelig.
- `unknown`: det valgte produktets kataloggrunnlag dokumenterer ikke faktumet sikkert. Fravær tolkes ikke som manglende dekning.

Kundespesifikke fakta som premie, faktisk kjørelengde, kilometerstand og objektidentifikatorer materialiseres ikke. Produktdefinerte grenser, summer, varigheter, faste dekningsspesifikke egenandeler og offentlige kilder beholdes.

## Katalogvalg og scopes

Forsikringstyper, selskaper, avtalescopes og produkter avledes fra den eksisterende katalogen. Historiske produkter med eksplisitt historisk/utgått markør skjules fra standardvalget. Uklart eller ukjent produkt-ID gir kontrollert avslag; det finnes ingen fuzzy matching eller fallback til nærmeste produkt.

Agreement scope er en egen identitetsdimensjon. Fremtind MC bruker `ordinary-sparebank1`, Fremtind Bobil bruker `ordinary-dnb`, og fakta/kilder krysser ikke scopes. Den samme mekanismen støtter fremtidige medlemsprodukter uten leverandørspesialkode.

## Presentasjon og kilder

Resultatet bruker «Produkt A» og «Produkt B» og én direkte synlig «Dekninger og vilkår»-visning. «Viktigste forskjeller» og den overordnede detaljporten finnes fortsatt i kundemodus, men ikke i produktmodus. Hovedseksjonene har native «Hopp til»-ankre, og faktaspesifikke kildekontroller følger innholdet. Kilder merkes som offentlig vilkår, IPID/produktark eller produktside. Pris, TFA, objektidentitet, manglende objekt og kundestatusen «Valgt / Ikke valgt» vises ikke i produktmodus.

## Sikkerhet og avgrensning

Produktmodus krever ingen kundedata og lagrer ingen data. Den oppretter ingen API-rute, telemetry eller secrets og er fortsatt beskyttet av eksisterende pilotinnlogging på siden. V1 sammenligner to nåværende katalogprodukter om gangen og gir ingen rangering, anbefaling, pris, eksport eller delbar lenke.


## Semantisk produktpresentasjon

`lib/product-comparison-presentation.ts` lager et separat visningslag over det uendrede adapterresultatet. Det endrer verken canonical facts, produktmaterialisering, kundesammenligning eller kundens coverage-status.

- `productParentEvidence` er eksplisitt kildebundet presentasjonsmetadata: canonical type, avtalescope, produktversjon, parent-key, child-keys, eksakt eksisterende parent-tekst og dokument-ID/dato/side/punkt. Evaluatoren bruker ingen selskapsnavn, ordsøk, fuzzy matching eller AI. Endret tekst/kildeversjon/scope, konkurrerende parents eller eksplisitt child-status stopper utfylling. Negative kontrolltester og en annen syntetisk provider med et annet child-konsept beviser dette.
- En parent-relasjon supplerer bare en ukjent child i visningen. Den bruker parentens faktiske tekst, status og kilder og merkes «Dokumentert under …». Den kopierer aldri den andre produktkolonnens vilkår. Children ligger innrykket under parent, uten egne dupliserte hovedseksjoner.
- Auditerte sidespesifikke detaljer grupperes per produkt med originalt label/verdi/kilde. En egenandelsmodell kan vise flere originale child-fakta per side. Beløp summeres ikke, prosentfradrag flattenes ikke, og nye ukjente keys forblir konservativt sammenlignbare med unknown.
- Parent-relasjoner og detaljmetadata er eksplisitte; det finnes ingen universell «Kasko inkluderer alt»-regel. Ingen mapping ble lagt til bare på grunn av navnelikhet.
- Familiespesifikk seksjonsrekkefølge er separat fra kundemodusens prioritet. Ufordelte facts beholdes under «Andre vilkår». Bare seksjoner med innhold gir navigasjonslenker. Stable anchors koder canonical section identity uten kollisjoner. `tabIndex=-1`, `aria-labelledby` og scroll-margin bevarer native ankerfokus.
- Desktop viser sidekolonner og navigasjon som kan brytes over flere linjer; smal skjerm stabler kolonnene og lar kun chip-raden scrolle horisontalt. Ingen scrollspy, sticky-navigation, søk eller nye nettverkskall.

Se [semantisk audit og validering](product-comparison-semantic-audit.md) for klassifisering av alle 34 asymmetriske If Super / Frende Utvidet-rader, kildeavgrensninger og kjente hull.
