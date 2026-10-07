# Personvernassertion — ett eksplisitt mekanisk unntak

Den uendrede baseline-testen matcher `8641` i `catalogEnrichment: 12.338641999999936`.
[Opprinnelig logg](preflight-privacy-baseline.log.gz) og [opprinnelig test](before-supporting-terms.test.mjs.gz) bevarer feilbeviset.

`analysis-telemetry.ts` beskriver et fast sett stage-navn og numeriske tidsmålinger.
Testen kontrollerer nå hele strukturen rekursivt: alle feltnavn, tekstverdier og øvrige numeriske verdier. Bare eksakte kjente duration-stier kan inneholde tilfeldige tallsekvenser; disse må være endelige ikke-negative tall. Ingen output utelates generelt. Private felter avvises eksplisitt.

To nye permanente tester reproducerer den gamle falske positiven, aksepterer legitime timingfelt og avviser alle seks faktiske fixture-markører i tekst, nøkler og feiltypede timingfelt, samt private felter, numerisk kunde-ID og uventet timingsti. Progress-events beholder opprinnelig personvernassertion.

Forsikringsbetydning, verdier, scope, mapping, selection, dokumentprioritet og provenance er uendret. Produksjonslogging og personvernkode er ikke endret. Budsjett18/12 →19/12, scope1/6; ordinær grense12 består uten ny kapasitet.
