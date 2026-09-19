# If Bil, statisk katalogversjon MOT2-2

Katalogen er basert på [Kjøretøyforsikring MOT2-2](https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=MOT2-2), «Gjelder fra mars 2024». Den nedlastede PDF-en ligger i `catalog/sources/if/`. [Ifs produktside](https://www.if.no/privat/forsikring/bilforsikring) brukes bare til å bekrefte de fire navnene som kunden kan velge, og at Leiebil og Motor-/girskade tilbys med Kasko og Super.

Ansvar → Delkasko → Kasko er uttrykkelig beskrevet i MOT2-2 punkt 4. Produktsiden presenterer Super som et eget nivå, mens MOT2-2 punkt 4.11 beskriver det som en utvidelse av Kasko. Derfor er Super eget produktvalg med intern arv fra Kasko. Fører- og passasjerulykke ligger i Ansvar-komponenten, som arves av de øvrige nivåene, jf. punkt 4. Punkt 11.2 krever samtidig at den avtalte ulykkesdekningen fremgår av forsikringsbeviset; faktisk kundedekning må alltid kontrolleres der.

Datapunktene har komponent, feltnøkkel, verdi, dokumentnavn, vilkårsnummer, gyldighetsmåned, PDF-side, punkt og URL. En ny MOT2-2-PDF skal senere behandles som ny kildeversjon og valideres før katalogen endres; URL-en alene er ikke en versjonsidentitet.

## Bevisst ikke tolket som et sikkert datapunkt

- Punkt 8.4.2 omtaler fabrikknytt kjøretøy innen ett år / 15 000 km i generelle oppgjørsregler. Produktsiden fremstiller «ny bil ved totalskade» som Super-fordel. Katalogen tilordner derfor ikke 1 år / 15 000 km til Kasko eller Delkasko uten avklaring. Super-grensen 3 år / 60 000 km er uttrykkelig dokumentert i punkt 4.11.1.
- Super-vilkåret bruker gjenanskaffelsesverdi som utløsende kostnadsgrense, mens Tryg-katalogen har en prosent av nyanskaffelsesverdi. Disse er ikke samme måleenhet og har derfor separate feltnøkler.
- Produktsiden oppgir ansvarssummer og grense for når Motor-/girskade kan kjøpes, men MOT2-2 oppgir ikke de samme tallene som selvstendige vilkår. De er ikke registrert som vilkårsdata. MOT2-2 punkt 4.9.3 dokumenterer derimot grensen på 200 000 km for skader.
- Produktsiden beskriver leiebilstørrelse med en bilklasse, mens punkt 4.10.3 i MOT2-2 beskriver tilsvarende størrelse og en kostnadsgrense på 500 kr per dag. Katalogen bruker vilkårsteksten og registrerer ingen bestemt bilklasse.
- Ifs grense på 40 000 kr gjelder ettermontert tilleggsutstyr **og bagasje samlet**, med ytterligere 50 %-begrensning. Den får egen feltnøkkel og sammenlignes ikke automatisk som identisk med et annet selskaps grense for bare fastmontert tilbehør.
- Kundens valgte egenandel, pris, geografiske særvilkår og eventuelle avtaleendringer kan stå i forsikringsbeviset. De er ikke utledet fra standardvilkåret.
