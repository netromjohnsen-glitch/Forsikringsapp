# Regresjon og ny audit etter fremtidig implementasjon

Ingen applikasjonstester ble skrevet eller kjørt i denne triagen. Kontrollene her er krav til fremtidig arbeid.

## Per batch

1. Egen, kildeledet oracle: eksakt produktidentitet, hendelse, objekt, sum/enhet, periode, betingelser og kildepunkt. Testen skal ikke bare kopiere katalograden.
2. Base/arv/tilvalg: berørte nivåer, nærmeste nivå som ikke skal endres, valgfri dekning tilgjengelig men ikke valgt, eksplisitt valgt/ikke valgt.
3. Kundedokument X over katalog Y, stille dokument beholder ukjent valg, separate objekter beholder egne facts.
4. Begge sammenligningsretninger, samme produkt, provider-spesifikke fakta, source-knapp og parent/detail uten oppfunnet motstykke.
5. Egen source-hash og eksakt type/scope/version; ingen peer-lekkasje.
6. Full eksisterende suite, TypeScript, ESLint, webpack production build, syntetisk HTTP/PDF-runtime og diff-check etter implementering. Ingen nye AI-kall er planlagt.

## Navngitte kontroller

regression-control-registry.csv bevarer alle 29 observerte false-unknown-kontroller og separat Storebrand dagstur (OVERNIGHT-01). De 2 227 eksisterende positive kontrollene er bevart med source_fact_id; 182 gjelder kundespesifikke verdier. Ingen av dem konverteres til katalogmangel fordi valgt kundesum mangler.

Kontroller særskilt Tryg MCs egne nyverdikriterier; Fremtind MC kontra Snøscooter; If Campingvogn Super kontra Kasko; Frende Hus structuredValue/label-scope; Storebrand Båt objektunntak for verdi over terskel kontra erstatningstak; Frende Reise SC-005s allerede avklarte fullvilkår; Fjernede feilaktige positive claims blir ikke automatisk eksplisitt ikke-dekket. Produkt-/versjonskontroller må bevare den frosne 29.09-basis og skille fremtidige kilder.

## Etter hver bølge

Uavhengig kontrollør sammenholder endret katalog med originalt source-first inventory, ikke bare green tests. Reverse-check alle nye/endret material claims; kontroller nivåscope, negative controls og kildeproveniens; kjør berørte familie-/produktpar begge veier. Oppdater separat remediation-ledger med hver signatur lukket, beholdt, omklassifisert eller gjenåpnet. Ny kilde eller semantisk kontradiksjon stopper berørt batch.

## Endelig full gate

Gjenta source → independent fact inventory → authored/resolved catalog → product comparison, for alle aktive produkter og 84 addons i riktig scope. Oppdater kildeinventory og hashes dersom en senere godkjent research har utvidet korpuset. Gjenta full reverse support check, full bulk product comparison, de 29 false-unknown-kontrollene, dagsturkontrollen, egne positive kontroller og relevante syntetiske PDF/customer flows. Reconcile aktive P1 og historiske avgrensninger på både signatur- og forekomstnivå.

READY krever ingen uløste materielle, kildeklare P1-mangler, ingen udokumenterte material claims og ingen ukorrekt falsk unknown fra kjent kilde. Eventuelle uløste kildekonflikter må ha bevist ikke-villedende representasjon, konkret begrensningsregister og uttrykkelig menneskelig godkjenning. Tester alene, redusert funnantall eller denne triagen gir ikke pilotgodkjenning.

Menneskelig fagkontroll av motstridende fullvilkår, selektive grenseverdier og optional-status inngår før publisering. Ingen juridisk godkjenning er implisert.
