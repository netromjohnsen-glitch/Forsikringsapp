# Kilde- og semantiske beslutningsregler

Dette er en plan basert på fullført audit, ikke en ny kildeaudit. Ingen nettsøk eller kildeinnhenting er gjort. Alle endelige katalogverdier må valideres mot egne offentlige kilder i den godkjente batchen.

## Kilder og blokkering

110 åpne køposter blir 70 koordinerte avklaringsoppgaver. De 3 lukkede og 2 alias-postene er bevart i avstemmingen av alle 115. Av 70 konfliktposter er SC-005 allerede avklart, SC-003 gjelder eldre IPID, og 68 er fortsatt åpne. Samme anskaffelsesoppgave kan inneholde flere eksakte spørsmål, men ett svar eller felles forsikringsgiver er aldri bevis for lik regel på tvers av type/kanal.

65 oppgaver må ha et eksplisitt verdict før full aktiv pilotgate. Dette betyr ikke 65 nødvendige nedlastinger eller 65 katalogfeil: en oppgave kan lukkes med bevist konservativ representasjon og særskilt godkjent begrensning. De øvrige 5 gjelder historisk Eika, eldre Frende-IPID, lav/uklar HTU-anvendelse, boligsituasjon for Storebrand Innbo og ekstra If Supergaranti. Ingen automatisk godkjenning gis her.

Konfliktlisten og source-research-plan.csv inneholder de eksakte spørsmålene og originalkildene. Kildearbeid skal hente aktivt datert offentlig fullvilkår, IPID/kanaltillegg og eventuell skriftlig produktavklaring. Private forsikringsbevis skal ikke etterspørres for å fylle generelle katalogmangler.

## Korriger bare avklart deldimensjon

Frende Bil GAP-1370: leasing-/kontantoppgjør kan presiseres fra egen kilde. Aldersoperatoren i CC-01253/01291 hører til SC-012 og skal ikke velges i samme dataedit. Fremtind Hund GAP-5601 kan gjenopprette niårsgruppen; SC-068s «i året» versus «etter fylte år» er separat. Gjensidige Hus bekjempelsesegenandel er ikke automatisk egenandel for fysisk insektskade (SC-020). Gjensidige Hund rehabilitering flyttes ikke før SC-035s behandlingsmodaliteter er avklart. Supergaranti er holdt utenfor If Campingvogns kildeklare Super-utvidelse.

## Modell og nøkkelvalg

Gjeldende CatalogFact kan bære presis tekst med faktaspesifikk kilde. Manglende auditforslag til nøkkel beviser derfor ikke schema-gap. 317 P1-signaturer trenger canonical review; 166 trenger mapping review. De 469 koordinerte CR-radene er eksplisitte konsept/dimensjon/type-spørsmål, ikke 469 nye features eller nye nøkler. Hver kan godkjenne eksisterende nøkkel, provider-detalj eller en liten typeavgrenset registrering. Først ved dokumentert informasjonstap eller falsk ekvivalens vurderes ny nøkkel.

Gjensidige Bruk → Liv er det konkrete avhengighetsgapet: requiresLevel gjelder hovedprodukt, ikke valgt annet tillegg. Avklar minste representasjon, ikke global omskriving. Gnager/insekt-tapet skyldes same-key/replacesBase-forfatting; resolveren følger de gitte dataene. Storebrand dagstur finnes i geografitekst, men ikke egen generell overnattingsdimensjon; eksakt key-comparison skal ikke gjette fra fritekst.

Hold alltid atskilt:
- tegning, dekning, reduksjon og opphør; dyr-, motor-, kjøretøy- og bygningsalder
- årlig kjørelengde, aktuell kilometerstand, maskinskade- og nyverdigrense
- fast/prosent/kombinert egenandel, minimum, maksimum og fradrag
- samlet sum, per gjenstand/person/hendelse/år/livstid og valgt kundesum
- dekning, utløsende hendelse, oppgjørsform, nødvendig betingelse og uttrykkelig unntak
- ordinær geografi, assistansegeografi, valgfri utvidelse og kundens reise
- standard inkludert, valgfritt tilgjengelig, dokumentert valgt, ikke valgt og ukjent.

Ikke lag symmetriske rader når kildene beskriver forskjellige konsepter. Ikke fyll hull med konkurrents opplysninger. Et annet selskap brukes bare som view-kontroll; egne kilder er fasit. Negative fakta krever uttrykkelig kilde; fravær alene er ukjent. Presise provider-spesifikke detaljer kan være riktig løsning.

## P2 og historikk

To uavhengige P2-signaturer (tre forekomster) følger eksplisitt samme korrigering: Storebrand Hus badeinnretningens material-/objektscope og If Reise Basis sikkerhetsregel. I tillegg følger tre P2-forekomster automatisk en signatur som allerede er P1 et annet sted. Disse telles ikke som tre ekstra P2-signaturer. Øvrig P2 utsettes med begrunnelse; ingen P3 finnes.

21 P1-signaturer / 37 forekomster gjelder to historiske Eika-produkter. Defer gjelder bare aktiv produktpilot med disse avgrenset bort. Historiske kunde-PDF-er er ikke sertifisert. Fremtidig bruk av P10/P15 krever den historiske batchen og kildeavklaring, ikke en generell «Fremtind»-fallback.
