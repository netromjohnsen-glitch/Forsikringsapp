# Fremtidige katalogoppdateringer

Dagens Tryg-data er registrert fra de ni lagrede PDF-ene i
`catalog/sources/tryg/`. Nettstedet brukes ikke til å endre produksjonsdata.
Hvert datapunkt har en kilde med dokumentnavn, vilkårsnummer,
gyldighetsdato, side og avsnitt.

## Foreslått innhentingsløp

1. Les selskapets offentlige vilkårsside og finn dokumentlenker. For Tryg
   listes bilvilkårene på
   `https://www.tryg.no/forsikringer/kjoretoy/bilforsikring/vilkar`.
   Observerte PDF-lenker bruker `/odpdf` og har blant annet en
   `vilkNr`-parameter. Lenketeksten kan brukes som kandidat til dokumentnavn.
2. Last ned kandidatene til et isolert område. Kontroller filtype, størrelse
   og at PDF-en kan åpnes. Beregn en innholdshash. Ikke bruk URL eller
   `vilkNr` alene som versjonsidentitet; innholdet kan endres bak samme URL.
3. Les dokumenttittel, vilkårsnummer og gyldighetsdato fra PDF-en. Sammenlign
   dette med URL/lenketekst og med siste godkjente kilde. Avvik må gjennomgås.
4. Lag en ny, uforanderlig kildeversjon og et forslag til strukturerte
   datapunkter. Sammenlign endringer på stabile feltnøkler og bevar både
   gamle og nye kilder.
5. Kjør kilde- og regresjonstester og krev faglig godkjenning før katalogens
   aktive produktreferanse flyttes til den nye versjonen.

Henting, strukturering og publisering er ikke implementert. Nettstedslenker
kan endre format eller være midlertidig utilgjengelige; det må ikke føre til
automatisk sletting eller overskriving av godkjente katalogdata.
