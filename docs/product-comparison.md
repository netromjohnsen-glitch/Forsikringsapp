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

Resultatet bruker «Produkt A» og «Produkt B», kuraterte «Viktigste forskjeller», detaljert sammenligning og faktaspesifikke kildekontroller. Kilder merkes som offentlig vilkår, IPID/produktark eller produktside. Pris, TFA, objektidentitet, manglende objekt og kundestatusen «Valgt / Ikke valgt» vises ikke i produktmodus.

## Sikkerhet og avgrensning

Produktmodus krever ingen kundedata og lagrer ingen data. Den oppretter ingen API-rute, telemetry eller secrets og er fortsatt beskyttet av eksisterende pilotinnlogging på siden. V1 sammenligner to nåværende katalogprodukter om gangen og gir ingen rangering, anbefaling, pris, eksport eller delbar lenke.
