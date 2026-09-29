# Båt, Hund og Katt – katalog- og sammenligningsarkitektur

## Omfang

Implementasjonen legger Båt, Hund og Katt inn i den eksisterende katalog-, dokument-, manuell- og produktsammenligningsflyten. Den oppretter ingen parallell motor. Produktidentiteten følger fortsatt `providerId + insuranceType + agreementScope + productId + version`, og alle nye produkter bruker `ordinary` scope. Fremtind-postene representerer bare den dokumenterte SpareBank 1-kanalen.

## Produkter

| Familie | Tryg | If | Gjensidige | Storebrand | Fremtind / SpareBank 1 | Frende |
|---|---|---|---|---|---|---|
| Båt | Ansvar; Brann/Ansvar; Brann/Tyveri/Ansvar; Kasko/Ansvar; Båt Ekstra | Delkasko; Kasko; Super | Delkasko; Kasko; Pluss | Delkasko; Kasko; Super | Delkasko; Kasko; Toppkasko | Brann og tyveri; Kasko; Utvidet |
| Hund | Behandling | Basis; Standard; Super | Behandling | Veterinær; Dødsfall; Veterinær og Dødsfall | Veterinær | Veterinær |
| Katt | Behandling | Basis; Standard; Super | Behandling | Veterinær; Dødsfall; Veterinær og Dødsfall | Veterinær | Veterinær |

Valgfrie komponenter er separate katalogtillegg. Dette omfatter blant annet Tryg og Frende Båt Maskinskade/ulykke, If Båt Motor- og girskade, separate livsmoduler, Gjensidige Hund Bruk, Fremtind Hund Bruksverdi og Frende Medisin/Tann/Tap. Katalogtilgjengelighet blir aldri tolket som kundens valg.

## Canonical facts

Båt bruker `bat.*`. Skade på egen båt, totalskade, maskinskade, redning, ferieavbrudd, løsøre, fast utstyr, opplagsutstyr, rigg, jolle, transport, opplag, ulykke, brann, tyveri, hærverk, ansvar, rettshjelp og geografi har separate identiteter. Bilens `nyverdi.*` og `maskinskade.*` gjenbrukes ikke.

Hund og Katt deler `dyr.*` for faktiske fellesbegreper. Årlig veterinærsum, sum per skadetilfelle og valgbar sum er separate facts. Fast egenandel, prosentandel og egenandelsperiode er separate facts. Nytegningsalder, livsreduksjon, livsopphør og veterinærdekningens varighet er separate facts. Rollover er et eget faktum og øker ikke årsgrensen. Hundespesifikk bruksverdi bruker `hund.*` og kan ikke anvendes på Katt.

## Autoritet og optional-semantikk

Kundedokumentet har forrang over katalogen. Katalogen kan fylle dokumentstillhet for ubetinget produktinnhold, men et valgfritt tillegg blir ikke `selected` uten dokumentert kundevalg. Begrensninger og unntak er detaljer og etablerer ikke alene positiv eller negativ dekningsstatus.

## Objektidentitet

Den generelle objektmotoren er uendret. Båt registrerer en eksakt, typebestemt `serial`-strategi. Den bruker ikke modellnavn eller fritekst. Hund og Katt får ingen ny identifikator: navn og rase er ikke sikker identitet. To dyr av samme type uten sikker strukturert ID blir derfor uavklarte og pares ikke etter rekkefølge. Hund og Katt forblir separate canonical typer.

## Presentasjon og manuell registrering

Båt, Hund og Katt oppdages dynamisk i produktmodus og i den manuelle produktvelgeren. Produktmodus er lokal: ingen AI, PDF-operasjoner, kundepris eller provider-nettverk. Båt bruker en kuratert rekkefølge fra kasko til geografi. Dyrefamiliene skiller veterinærbehandling, summer, egenandel, behandlingstyper, alder og liv/tap. Interne keys vises ikke.

Manuell registrering legger ikke til et underwriting-skjema. Rådgiveren kan velge et eksakt katalogprodukt eller beholde et ukjent produkt som fritekst. Kundespesifikke summer og egenandeler må fortsatt komme fra registreringen eller kundedokumentet.

## Avgrensninger

Valpe- og kattungekull er tilstøtende, separate produkter og er ikke presset inn i ordinær Hund/Katt. Båttype er bevart som vilkårskontekst der kilden uttrykker den, men det er ikke innført et nytt tilfeldig båttypevalg i UI. DNB/Fremtind er ikke materialisert. Personforsikring inngår ikke.
