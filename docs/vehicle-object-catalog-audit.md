# Kjøretøyutvidelse – kilde-, katalog- og valideringsrapport

Kontrolldato: 23.09.2026. Utgangspunkt: `ae91aca635fbdfd938f3e707305cbd358b0af7f2`. Ingen private kunde-PDF-er er benyttet. Dette er lokal implementasjon; ingen commit eller push.

## 1. Resultat og avgrensning
Snøscooter, Campingvogn og Tilhenger bruker nå egne typeavgrensede produkt-/dekningsidentiteter i eksisterende katalog, normalisering, ekstraksjon og presentasjon. 47 dokumenterte produktnivåer og to eksplisitte Tryg-ulykkestillegg er registrert. 49 PDF-er og 20 HTML-originaler er bevart, med SHA-256. Katalogen fungerer uten nettsøk ved kundeanalyse.

**Ikke klar for uovervåket komplett porteføljeblindtest.** `MULTI_OBJECT_MATCHING_GAP` og `MISSING_PRODUCT_COMPARISON_GAP` er eksisterende begrensninger som oppgaven uttrykkelig ber oss rapportere fremfor å bygge en større løsning. Delvis kildekatalog må også tas med i vurderingen. Kontrollerte tester med ett objekt av hver type på hver side kan gjennomføres, med rådgiverkontroll.

## 2. Dekningsmatrise
SUPPORTED betyr at de registrerte kjerneproduktene har pålitelig fullvilkårsgrunnlag, ikke at alle juridiske unntak, kundevalg eller historiske versjoner er modellert. PARTIAL betyr at kobling og dokumenterte basisfakta fungerer, men at konkret kildeusikkerhet eller en viktig produktutvidelse mangler. Ingen av de 18 kombinasjonene er erklært NOT_OFFERED.

| Provider | Snøscooter | Campingvogn | Tilhenger |
| --- | --- | --- | --- |
| Tryg | PARTIAL – Brann/Tyveri og Kasko-lenker peker frem i tid | SUPPORTED – gjeldende PAU-vilkår og Ekstra | SUPPORTED – gjeldende PAU-vilkår |
| Gjensidige | PARTIAL – aktive offentlige eksempelvilkår uten tydelig versjonsdato | PARTIAL – eksempelbevis og ukjent versjonsdato | PARTIAL – eksempelbevis og ukjent versjonsdato |
| Eika / Fremtind | SUPPORTED – aktuell Eika-lenke, PMO og IPID V.104 | SUPPORTED – aktuell Eika-lenke, PMO og IPID V.103 | SUPPORTED – Kasko; Minikasko er inkludert del |
| Frende | SUPPORTED – eksplisitt omfattet av 01.01.2026-vilkår | SUPPORTED – fukt i Kasko, med testkrav | SUPPORTED – last/løsøre holdes utenfor |
| Storebrand | PARTIAL – motor09 omfatter typen, redningsscope krever forsiktighet | PARTIAL – motstridende Super-løsøresummer | SUPPORTED – camp02 omfatter tilhenger |
| If | PARTIAL – hovedvilkår, men feil lenket særvilkår | PARTIAL – Super-tillegg ikke fullt avklart mot fullvilkår | PARTIAL – MOT2-2 + aktuell lenke til gammelt S-709; revidert særvilkår bør bekreftes |

## 3. Kildeinnhenting og konflikter
Alle brukerens 16 startadresser er undersøkt. De 15 produktadressene er produktsider; Eika-adressen er vilkårsoversikt. Trygs tre egne vilkårsoversikter og Eikas produktinformasjonsside er også bevart. Fullvilkår/IPID fra disse lenkene, samt offisielle generelle vilkår, er lokale originaler. Det ble ikke brukt tredjepartsarkiv.

- [https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring](https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring)
- [https://www.tryg.no/forsikringer/kjoretoy/campingvognforsikring](https://www.tryg.no/forsikringer/kjoretoy/campingvognforsikring)
- [https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring](https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring)
- [https://www.gjensidige.no/forsikring/kjoretoy/snoscooterforsikring](https://www.gjensidige.no/forsikring/kjoretoy/snoscooterforsikring)
- [https://www.gjensidige.no/forsikring/kjoretoy/campingvognforsikring](https://www.gjensidige.no/forsikring/kjoretoy/campingvognforsikring)
- [https://www.gjensidige.no/forsikring/kjoretoy/tilhengerforsikring](https://www.gjensidige.no/forsikring/kjoretoy/tilhengerforsikring)
- [https://www.eikaforsikring.no/alle-forsikringer/vilkar](https://www.eikaforsikring.no/alle-forsikringer/vilkar)
- [https://www.frende.no/forsikringer/campingvognforsikring/](https://www.frende.no/forsikringer/campingvognforsikring/)
- [https://www.frende.no/forsikringer/snoscooterforsikring/](https://www.frende.no/forsikringer/snoscooterforsikring/)
- [https://www.frende.no/forsikringer/tilhengerforsikring/](https://www.frende.no/forsikringer/tilhengerforsikring/)
- [https://www.storebrand.no/privat/forsikring/campingvognforsikring](https://www.storebrand.no/privat/forsikring/campingvognforsikring)
- [https://www.storebrand.no/privat/forsikring/mc-forsikring](https://www.storebrand.no/privat/forsikring/mc-forsikring)
- [https://www.storebrand.no/privat/forsikring/tilhengerforsikring](https://www.storebrand.no/privat/forsikring/tilhengerforsikring)
- [https://www.if.no/privat/forsikring/kjoretoy/campingvognforsikring](https://www.if.no/privat/forsikring/kjoretoy/campingvognforsikring)
- [https://www.if.no/privat/forsikring/kjoretoy/tilhengerforsikring](https://www.if.no/privat/forsikring/kjoretoy/tilhengerforsikring)
- [https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring](https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring)

**Dokumenthierarki:** kundens individuelle dokument > registrerte fullvilkår > IPID > konkret produktside. Ingen markedsføringstekst brukes som kundens valg. Katalogverdier er kuratert fra PDF-er; HTML brukes til produktstruktur, aktuelle lenker og audit. Det er ikke implementert en ny automatisk kildekonfliktmotor. Tester kontrollerer at nettsidesummer ikke erstatter fullvilkår og at hver effektiv nøkkel bare har én verdi.

### Konflikter og bevisste utelatelser
1. **Tryg Snøscooter:** PAU26320 og PAU25505 som dagens sider lenker til er datert **01.10.2026**, etter kontrolldatoen. Tre nedlastinger av disse beholdes i manifestet som `future`, men ingen aktive fakta bruker dem. Ansvar PAU25004, produkt PAU21200 og IPID versjonsdato 01.07.2025 gir en begrenset base. Januar-/septembergjeldende skadevilkår for Brann/Tyveri og Kasko må fremskaffes før disse delene kan utvides. Et søketreff som omtalte eldre dato ble ikke brukt som erstatning for faktisk PDF.

2. **Storebrand Campingvogn Super:** camp02 har 30 000 kr i oversikt/prosa og 100 000 kr i tabell på PDF-side 4. Super-løsøresum er ikke aktivert; Kasko-summen arves derfor heller ikke inn som en antatt Super-verdi. Fuktgrense, årlig kontroll, feriegaranti og campingvognens egen nyverdiregel brukes fra fullvilkåret.

3. **If:** MOT2-2 er mars 2024, fortsatt offisielt lenket. Campingvognens Super-side beskriver mer enn det dokumenterte campingvognsgrunnlaget i hovedvilkåret; blant annet grense 100 000 kr kan ikke ukritisk erstatte hovedvilkårets kombinerte utstyr-/bagasjeregel. Disse usikre Super-detaljene er utelatt. Personbilens alder/km-regler er ikke kopiert til campingvogn. Snøscootersiden lenker til S-709, som faktisk er **tilhenger**; den brukes bare for tilhenger. S-709 er datert januar 1991 og trenger bekreftelse på at ingen nyere særvilkår supplerer det.

4. **Storebrand Snøscooter:** motor09 navngir snøscooter, slik at MC-siden ikke alene er grunnlag. Sidens avgrensning av veihjelp og vilkårets begrensede transportregel er ikke slått sammen til personbil-veihjelp. Redning er konservativt uavklart. Ansvar alene får ikke en antatt ulykkesdekning fra tabellen for høyere nivåer.

5. **Eika:** dagens vilkårsoversikt oppgir nytegning fra 13.10.2025 og peker på PMO-dokumentene. IPID V.103 dokumenterer bare **Kasko** som tilhengerprodukt, med Minikasko inkludert. Historiske M10/M10P-opplysninger brukes ikke. Ingen likhet med SpareBank 1/DNB er antatt.

6. **Gjensidige:** offentlig tilgjengelige eksempelbevis brukes sammen med vilkårsdelene. Eksempelvalg som «utleie ikke valgt» og kundespesifikke eksempelbeløp er ikke gjort til universelle kundedata. Dato/versjon er `null` når ikke dokumentert. Aktiv lenke er ikke bevis for hvilken versjon som gjelder for en bestemt eksisterende kunde.

7. **Frende:** de tre produktspesifikke API-endepunktene leverer byte-identisk fullvilkår. Scope for campingvogn, tilhenger og snøscooter er likevel beholdt per type. Løsøre i campingvogn er ikke lagt til som last på tilhenger.

Frendes generelle vilkår redirecter til `frende-cms-prod.s3.eu-central-1.amazonaws.com`, fra selskapets offisielle lenke; begge URL-er er registrert. Trygs to første DNS-feil ble løst ved ny kontroll; ingen manglende kilde er oppfunnet. IPID er bevart for Tryg, Gjensidige og Eika. Egen aktuell IPID for Frende, Storebrand og If ble ikke sikkert identifisert i den undersøkte lenkekjeden. Generelle vilkår for Tryg, Frende, Storebrand, If og Fremtind er bevart. Gjensidiges offentlig lenkede filer inneholder vilkårs-/generelle deler.

### Full dokumentliste
Alle filer nedenfor ligger i `catalog/sources/vehicle-extensions/`. Manifestet inneholder opprinnelige URL-er, endelig URL, dato, versjon, dokumentnummer, delvilkår, SHA-256 og `catalogUsage` med produkt-ID, canonical nøkkel og side/punkt. `null`/«ukjent» er ikke erstattet av hentetidspunkt. Kildene er hentet 23.09.2026; dette er separat fra gyldighetsdato.

| Fil / offisiell URL | Type | Nummer; dato; versjon | SHA-256 | Bruk |
| --- | --- | --- | --- | --- |
| [tryg-tilhengerforsikring.html](https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring) | product_page | ukjent; ukjent; ukjent | `726529e52f01d071e14d8a39729749815298bd2c6edf4f6837f26ce11a9c1e4c` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-snoscooterforsikring.html](https://www.gjensidige.no/forsikring/kjoretoy/snoscooterforsikring) | product_page | ukjent; ukjent; ukjent | `a777ebfa6dfb20479382fa62691b1192a6867daf8044fbf6c21ee9f9989e531c` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-campingvognforsikring.html](https://www.gjensidige.no/forsikring/kjoretoy/campingvognforsikring) | product_page | ukjent; ukjent; ukjent | `4f30c8c2a2dabd6425c61bba12513a824c6a2ac4d24a206a261d4f45b3c278a8` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-tilhengerforsikring.html](https://www.gjensidige.no/forsikring/kjoretoy/tilhengerforsikring) | product_page | ukjent; ukjent; ukjent | `516d76e88532d1319c9d390c107a70ba284335ea1f6f480e927fd57799dfb883` | kontekst/produktstruktur/kildekontroll |
| [eikaforsikring-vilkar.html](https://www.eikaforsikring.no/alle-forsikringer/vilkar) | product_page | ukjent; ukjent; ukjent | `926938c237700c63961e11a466ffa7dbca6b4e4a66778cc5320fcd9234390e09` | kontekst/produktstruktur/kildekontroll |
| [frende-campingvognforsikring.html](https://www.frende.no/forsikringer/campingvognforsikring/) | product_page | ukjent; ukjent; ukjent | `14db91b9abaed2a8ffc923f72522a62c3a9d127056193d84ef7c3cb29ec84fba` | kontekst/produktstruktur/kildekontroll |
| [frende-snoscooterforsikring.html](https://www.frende.no/forsikringer/snoscooterforsikring/) | product_page | ukjent; ukjent; ukjent | `98b6524f45c3e671e39e60c82ba8318314583a6aafd4e2e96bf3dec0605f26c3` | kontekst/produktstruktur/kildekontroll |
| [frende-tilhengerforsikring.html](https://www.frende.no/forsikringer/tilhengerforsikring/) | product_page | ukjent; ukjent; ukjent | `224e454c7280f9001d06af28ec51090175ccc6c8e76eb842e74bfa67d76ef93f` | kontekst/produktstruktur/kildekontroll |
| [storebrand-campingvognforsikring.html](https://www.storebrand.no/privat/forsikring/campingvognforsikring) | product_page | ukjent; ukjent; ukjent | `82ef7c5c1de0d2b8e4837c260210b5b5d66766d57942aabc5da1d18be58363a0` | kontekst/produktstruktur/kildekontroll |
| [storebrand-mc-forsikring.html](https://www.storebrand.no/privat/forsikring/mc-forsikring) | product_page | ukjent; ukjent; ukjent | `57eee721cf1591ca4728d32446d83df52872e84b21ae40fd9796fa3fddbd163d` | kontekst/produktstruktur/kildekontroll |
| [storebrand-tilhengerforsikring.html](https://www.storebrand.no/privat/forsikring/tilhengerforsikring) | product_page | ukjent; ukjent; ukjent | `378021a3e4d8dcd820dbfe9ca083d47d2719d49159e72e8152cfc71c0efc0be3` | kontekst/produktstruktur/kildekontroll |
| [if-campingvognforsikring.html](https://www.if.no/privat/forsikring/kjoretoy/campingvognforsikring) | product_page | ukjent; ukjent; ukjent | `aad3994299dd6f12a8603e98a17d9a4d7a528f1443bd47f9250aaf6cc8be8943` | kontekst/produktstruktur/kildekontroll |
| [if-tilhengerforsikring.html](https://www.if.no/privat/forsikring/kjoretoy/tilhengerforsikring) | product_page | ukjent; ukjent; ukjent | `108b76bd8b930752effa94f7d564f0199829537592a10b5fae9336bb613bceff` | kontekst/produktstruktur/kildekontroll |
| [if-snoscooterforsikring.html](https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring) | product_page | ukjent; ukjent; ukjent | `9546c45652e033a4b0e15700abacb52dd2d820b26c313858df5f92d1ba3e02f3` | kontekst/produktstruktur/kildekontroll |
| [tryg-snoscooterforsikring.html](https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring) | product_page | ukjent; ukjent; ukjent | `d7b63067996798fc5a839b56ac4af10fbd47bb027d74a21bcf0f6282efeb3243` | kontekst/produktstruktur/kildekontroll |
| [tryg-campingvognforsikring.html](https://www.tryg.no/forsikringer/kjoretoy/campingvognforsikring) | product_page | ukjent; ukjent; ukjent | `336dcfec7ef747c76980e46c536b84b1844457e9e8e1b4926ef0d01b03530df0` | kontekst/produktstruktur/kildekontroll |
| [tryg-vilkar-75f064ed.html](https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring/vilkar) | product_page | ukjent; ukjent; ukjent | `80fd6f58e66f40fe4294ff3f45eddfef0f40edc17f276918233333bdb567e409` | kontekst/produktstruktur/kildekontroll |
| [tryg-IPID-Campingvogn-og-tilhenger.pdf](https://www.tryg.no/system/files/download/pdf/ipid/IPID-Campingvogn-og-tilhenger.pdf) | ipid | ukjent; ukjent; 2025-07-01 | `4b1947c06b94206ce31fdfbb68fc7c10e65aeb63f69f8368d0c03f25ea7551a3` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-MOT05.pdf](https://www.gjensidige.no/ipid/gfno/MOT05) | ipid | ukjent; ukjent; ukjent | `24c231e42bf532f5d94ad9edfd2a6e2f66b1de58223786a3228cc87597a01901` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-MOT07.pdf](https://www.gjensidige.no/ipid/gfno/MOT07) | ipid | ukjent; ukjent; ukjent | `eedf3286cee2c73f0cb6a5f0eaadd9233b527625c1e2d2a763aa2d11b35d20e7` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-MOT09.pdf](https://www.gjensidige.no/ipid/gfno/MOT09) | ipid | ukjent; ukjent; ukjent | `700aa06dd8343c30fc0dfcb3e5ca513439806c620a297a32b297edcf3fa1d457` | kontekst/produktstruktur/kildekontroll |
| [frende-CaravanInsurance.pdf](https://api.frende.no/documents/terms/public/pnc/CaravanInsurance) | terms | ukjent; 2026-01-01; ukjent | `088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88` | canonical evidence |
| [frende-Generelle_vilkår-01012026.pdf](https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf) | terms | ukjent; ukjent; ukjent | `7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b` | kontekst/produktstruktur/kildekontroll |
| [frende-SnowmobileInsurance.pdf](https://api.frende.no/documents/terms/public/pnc/SnowmobileInsurance) | terms | ukjent; 2026-01-01; ukjent | `088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88` | canonical evidence |
| [frende-TrailerInsurance.pdf](https://api.frende.no/documents/terms/public/pnc/TrailerInsurance) | terms | ukjent; 2026-01-01; ukjent | `088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88` | canonical evidence |
| [storebrand-vilkar-campingvogn-og-tilhenger.pdf](https://www.storebrand.no/privat/forsikring/campingvognforsikring/_/attachment/inline/047a8396-0549-4f55-8afe-a20fe3cc42d6:af61e7bae3bcc2f6f5300195d35d576c461f0b33/vilkar-campingvogn-og-tilhenger.pdf) | terms | camp02; 2026-03-01; ukjent | `fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8` | canonical evidence |
| [storebrand-vilkar-generelle.pdf](https://www.storebrand.no/privat/forsikring/campingvognforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf) | terms | ukjent; ukjent; ukjent | `4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754` | kontekst/produktstruktur/kildekontroll |
| [storebrand-vilkar-motorvognforsikring.pdf](https://www.storebrand.no/privat/forsikring/mc-forsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:e9289744b0f0bb00c7304e715377b4be9a0e85d8/vilkar-motorvognforsikring.pdf) | terms | motor09; 2025-04-01; ukjent | `7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb` | canonical evidence |
| [if-Vilkaar-4103ea25.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring) | terms | MOT2-2; 2024-03; ukjent | `57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987` | canonical evidence |
| [if-Vilkaar-b7d19ed7.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV709) | terms | S-709; 1991-01; ukjent | `ec5d7fd0a585c1b1a0ee23cad31fc135ebcf35d1f67c5f559e15e378aa171743` | canonical evidence |
| [tryg-vilkar-fc5e4fcd.html](https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring/vilkar) | product_page | ukjent; ukjent; ukjent | `ab4f81d2250de4d77c6fbb8d2c7fdf22958c0733037ada642bbdbfe17ae442a0` | kontekst/produktstruktur/kildekontroll |
| [tryg-vilkar-812784ac.html](https://www.tryg.no/forsikringer/kjoretoy/campingvognforsikring/vilkar) | product_page | ukjent; ukjent; ukjent | `d091693e25ee16bec7696b19829d6f70ee6fdbdb0503a23e2e17b00d4d53ee0f` | kontekst/produktstruktur/kildekontroll |
| [gjensidige-Snoscooter-Kasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Snoscooter-Kasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `ba089fbe156e6f025971d3ab7ef6d78d9a6832d4bfac0af6743b1fa5494d47b4` | canonical evidence |
| [gjensidige-Snoscooter-Delkasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Snoscooter-Delkasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `ac376b33b1d9c90d82c2a478f9336eb7b09122a96a4bc90022d3432b0f9ce27b` | canonical evidence |
| [gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/snoscooter-ansvar-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `5c7e634313b96147b294cfa18ef6edf6e3f8c8e668dd2e1ea2ecead56b34e8be` | canonical evidence |
| [gjensidige-Campingvogn-Pluss-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Campingvogn-Pluss-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `129827ede6156025a74dae49392e2744eebff0d0e42a30a08e9b1449859365ca` | canonical evidence |
| [gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Campingvogn-Kasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `fb61c6696cbf3a12067cef1b71f73b6562c37495151268fe769d4520b7ac4194` | canonical evidence |
| [gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Campingvogn-Delkasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `aac62443966b522b04903f765eb31376b8a48cddd39d14781d447bcaa82677de` | canonical evidence |
| [gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/tilhenger-kasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `2c2f5b4a59d6dbe6564257319224d841e065eada4dab5f9c04ee05c6c3413328` | canonical evidence |
| [gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf](https://www.gjensidige.no/files/privat/vilkar/kjoretoy/tilhenger-delkasko-alminnelige-vilkar.pdf) | terms | ukjent; ukjent; ukjent | `9154b1ee38457ccf602854819c21fea4374c7265172a6d39bbd28775299209fc` | canonical evidence |
| [fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf](https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf) | terms | PMO-354.000-002; 2024-03-21; ukjent | `b858b6444a8dce7b9a6cf184b5e69ebe85eea2a1a1471f39712807a06986dc9a` | canonical evidence |
| [fremtind-Vilkar_Kasko_Snoscooter.pdf](https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Snoscooter.pdf) | terms | PMO-357.000-006; 2023-10-29; ukjent | `2103322d55713ff007aec488ffd3cc09ebd35d88ded5904314226f48c36915bb` | canonical evidence |
| [tryg-IPID-Snoscooter.pdf](https://www.tryg.no/system/files/download/pdf/ipid/IPID-Snoscooter.pdf) | ipid | ukjent; ukjent; 2025-07-01 | `4140b20c0d53e4430e008f1aed17c61c486f2be8cd14b00b3380ea72babac421` | canonical evidence |
| [tryg-odpdf-543856fa.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU26506&vilk=Brann-tilhenger) | terms | PAU26506; 2026-01-01; ukjent | `ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79` | canonical evidence |
| [tryg-odpdf-05b2538c.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU26307&vilk=Branntyveri-tilhenger) | terms | PAU26307; 2026-01-01; ukjent | `d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e` | canonical evidence |
| [tryg-odpdf-03ff0533.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25255&vilk=Kasko-tilhenger) | terms | PAU25255; 2026-01-01; ukjent | `44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-778e88dd.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU18200&vilk=Produktvilkaar-Tilhenger) | terms | PAU18200; 2024-01-01; ukjent | `d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-65439673.pdf](https://www.tryg.no/odpdf?vilkNr=05000PA182&vilk=Tilhenger-Sikkerhetsforskrift) | terms | ukjent; ukjent; ukjent | `037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-911ff8ae.pdf](https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Generelle-vilkaar) | terms | PGE91000; 2024-07-01; ukjent | `b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-d8d47def.pdf](https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Rettshjelp) | terms | PGE91500; 2026-01-01; ukjent | `bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-63601ed1.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU26506&vilk=Brann-campingvogn) | terms | PAU26506; 2026-01-01; ukjent | `ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-7112298e.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU26307&vilk=Branntyveri-campingvogn) | terms | PAU26307; 2026-01-01; ukjent | `d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-f862c645.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25255&vilk=Kasko-campingvogn) | terms | PAU25255; 2026-01-01; ukjent | `44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e` | canonical evidence |
| [tryg-odpdf-d09fac80.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU27016&vilk=campingvogn-ekstra) | terms | PAU27016; 2025-07-01; ukjent | `e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726` | canonical evidence |
| [tryg-odpdf-f52d5798.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU18200&vilk=Produktvilkaar-Campingvogn) | terms | PAU18200; 2024-01-01; ukjent | `d4ee41278c962160aa0a03b1e2f5fc6d77c039fb9af1a5108252e4b989034f70` | canonical evidence |
| [tryg-odpdf-b1fff53e.pdf](https://www.tryg.no/odpdf?vilkNr=05000PA182&vilk=Campingvogn-Sikkerhetsforskrift) | terms | ukjent; ukjent; ukjent | `037e9eeeb20d9b9576a648ac2e31be748f735fccaf78dc95e4e134c48262cffd` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-060a2170.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25004&vilk=Ansvar-Snoscooter) | terms | PAU25004; 2024-07-01; ukjent | `afcfd9bbc76e5fca4e2c1f70e007ff9062ff9b94d6a7917bb9e147046692c5f4` | canonical evidence |
| [tryg-odpdf-0d60de94.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU26320&vilk=Branntyveri-Snoscooter) | terms | PAU26320; 2026-10-01; ukjent | `576521c433ef20b4eedf09d0efde0fc7f7aeb378c83c16286c88bc84350dacbd` | FREMTID – ikke aktiv |
| [tryg-odpdf-5a0a847f.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU25505&vilk=Kasko-Snoscooter) | terms | PAU25505; 2026-10-01; ukjent | `1b073ad7823b6c4230786f70ded6da0d3403ab212b79f610951d32cfea76cad8` | FREMTID – ikke aktiv |
| [tryg-odpdf-2001c3a6.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU28002&vilk=Forerulykke) | terms | PAU28002; 2025-01-01; ukjent | `3ae14967e4d91e4c4a9c8541161206b86dda0c1bc1a7315ca9695f1c1da3c585` | canonical evidence |
| [tryg-odpdf-56716918.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU28003&vilk=Forerogpassasjerulykke) | terms | PAU28003; 2024-07-01; ukjent | `d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52` | canonical evidence |
| [tryg-odpdf-dbf5be98.pdf](https://www.tryg.no/odpdf?vilkNr=05PAU21200&vilk=Produktvilkaar-Snoscooter) | terms | PAU21200; 2024-01-01; ukjent | `6359e33c1a10c9e75a495f8945c3ef5335f0ce0f3000dfd378357cacf65eee06` | canonical evidence |
| [tryg-odpdf-e47c9440.pdf](https://www.tryg.no/odpdf?vilkNr=05000PA212&vilk=Snoscooter-Sikkerhetsforskrift) | terms | ukjent; ukjent; ukjent | `d746d335f8e71187716a873d4b90b28b0944c44a4bcc94fbb81b45b75f122674` | kontekst/produktstruktur/kildekontroll |
| [tryg-odpdf-a1702ca7.pdf](https://www.tryg.no/odpdf?amp%3Bvilk=Kasko-Snoscooter&vilkNr=05PAU25505) | terms | PAU25505; 2026-10-01; ukjent | `1b073ad7823b6c4230786f70ded6da0d3403ab212b79f610951d32cfea76cad8` | FREMTID – ikke aktiv |
| [eikaforsikring-produktinformasjon.html](https://www.eikaforsikring.no/alle-forsikringer/produktinformasjon) | product_page | ukjent; ukjent; ukjent | `afe01cef6bc2af99ebaaa9acc81442324b22e6af75a21187e39457f1e2107f16` | kontekst/produktstruktur/kildekontroll |
| [fremtind-IPID_Tilhenger_Campingvogn.pdf](https://dokument.fremtind.no/ipid/IPID_Tilhenger_Campingvogn.pdf) | ipid | ukjent; ukjent; V.103 | `86ea864fd38b24952a2406d75fc23ff07b9c5ab0899c8017c34af7ac6d2b9deb` | kontekst/produktstruktur/kildekontroll |
| [fremtind-IPID_Snoscooter.pdf](https://dokument.fremtind.no/ipid/IPID_Snoscooter.pdf) | ipid | ukjent; ukjent; V.104 | `afd36a47bff2b97d675b404bfe20c8cf549f68af8a19c3521c32c8cb23a7b800` | canonical evidence |
| [if-Vilkaar-df7c20ba.pdf](https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Generelle_vilk%C3%A5r) | terms | GEN2-9; 2025-06; ukjent | `b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046` | kontekst/produktstruktur/kildekontroll |
| [fremtind-Generelle_vilkar_skadeforsikring.pdf](https://dokument.fremtind.no/vilkar/fremtind/felles/Generelle_vilkar_skadeforsikring.pdf) | terms | FFE-000.001-006; 2024-05-21; ukjent | `cda0a2906cc488cd3f51d553fb55a7b553be025759e43cf5f64009b24ca114f5` | kontekst/produktstruktur/kildekontroll |

## 4. Produktnivåer, standarddekninger og tilvalg
Alle IDs er provider + type + dokumentert nivå. Eika bruker eksisterende `eika-fremtind`; «Eika» er et eksplisitt alias til denne kanalen, ikke til alle Fremtind-produkter. `productName` bevarer visnings-/objekttekst; `canonicalProductName` brukes til sikkert eksakt katalogoppslag. Ukjent nivå forblir ukoblet.

| Produkt-ID | Selskap / type / nivå | Standardfamilier | Valgfritt |
| --- | --- | --- | --- |
| tryg-snoscooter-ansvar | Tryg / Snøscooter / Ansvar | rettshjelp, ansvar | ulykke, forerulykke |
| tryg-snoscooter-brann-og-tyveri | Tryg / Snøscooter / Brann og tyveri | brann, tyveri, rettshjelp, ansvar | ulykke, forerulykke |
| tryg-snoscooter-kasko | Tryg / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, ansvar | ulykke, forerulykke |
| tryg-campingvogn-brann | Tryg / Campingvogn / Brann | brann, rettshjelp, utstyr, losore, fortelt | Ingen nye tilvalg modellert |
| tryg-campingvogn-brann-og-tyveri | Tryg / Campingvogn / Brann og tyveri | brann, tyveri, rettshjelp, utstyr, losore, fortelt | Ingen nye tilvalg modellert |
| tryg-campingvogn-kasko | Tryg / Campingvogn / Kasko | brann, tyveri, kasko, rettshjelp, utstyr, losore, fortelt, glass | Ingen nye tilvalg modellert |
| tryg-campingvogn-campingvogn-ekstra | Tryg / Campingvogn / Campingvogn Ekstra | brann, tyveri, kasko, rettshjelp, utstyr, losore, fortelt, fukt, skadedyr, ferie, glass | Ingen nye tilvalg modellert |
| tryg-tilhenger-brann | Tryg / Tilhenger / Brann | brann, rettshjelp, utstyr, naturskade | Ingen nye tilvalg modellert |
| tryg-tilhenger-brann-og-tyveri | Tryg / Tilhenger / Brann og tyveri | brann, tyveri, rettshjelp, utstyr, naturskade | Ingen nye tilvalg modellert |
| tryg-tilhenger-kasko | Tryg / Tilhenger / Kasko | brann, tyveri, kasko, rettshjelp, utstyr, naturskade | Ingen nye tilvalg modellert |
| gjensidige-snoscooter-ansvar | Gjensidige / Snøscooter / Ansvar | rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| gjensidige-snoscooter-delkasko | Gjensidige / Snøscooter / Delkasko | brann, tyveri, rettshjelp, utstyr, ansvar, ulykke, losore | Ingen nye tilvalg modellert |
| gjensidige-snoscooter-kasko | Gjensidige / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, utstyr, ansvar, ulykke, losore | Ingen nye tilvalg modellert |
| gjensidige-campingvogn-delkasko | Gjensidige / Campingvogn / Delkasko | brann, tyveri, redning, glass | Ingen nye tilvalg modellert |
| gjensidige-campingvogn-kasko | Gjensidige / Campingvogn / Kasko | brann, tyveri, kasko, redning, skadedyr, glass | Ingen nye tilvalg modellert |
| gjensidige-campingvogn-pluss | Gjensidige / Campingvogn / Pluss | brann, tyveri, kasko, redning, fukt, skadedyr, ferie, glass | Ingen nye tilvalg modellert |
| gjensidige-tilhenger-delkasko | Gjensidige / Tilhenger / Delkasko | brann, tyveri, redning | Ingen nye tilvalg modellert |
| gjensidige-tilhenger-kasko | Gjensidige / Tilhenger / Kasko | brann, tyveri, kasko, redning | Ingen nye tilvalg modellert |
| frende-snoscooter-ansvar | Frende / Snøscooter / Ansvar | rettshjelp, ansvar | Ingen nye tilvalg modellert |
| frende-snoscooter-brann-og-tyveri | Frende / Snøscooter / Brann og tyveri | brann, tyveri, rettshjelp, utstyr, ansvar | Ingen nye tilvalg modellert |
| frende-snoscooter-kasko | Frende / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, utstyr, ansvar | Ingen nye tilvalg modellert |
| frende-campingvogn-brann-og-tyveri | Frende / Campingvogn / Brann og tyveri | brann, tyveri, rettshjelp, utstyr, losore, fortelt | Ingen nye tilvalg modellert |
| frende-campingvogn-kasko | Frende / Campingvogn / Kasko | brann, tyveri, kasko, rettshjelp, utstyr, losore, fortelt, fukt | Ingen nye tilvalg modellert |
| frende-tilhenger-brann-og-tyveri | Frende / Tilhenger / Brann og tyveri | brann, tyveri, rettshjelp, utstyr | Ingen nye tilvalg modellert |
| frende-tilhenger-kasko | Frende / Tilhenger / Kasko | brann, tyveri, kasko, rettshjelp, utstyr | Ingen nye tilvalg modellert |
| storebrand-snoscooter-ansvar | Storebrand / Snøscooter / Ansvar | rettshjelp, ansvar | Ingen nye tilvalg modellert |
| storebrand-snoscooter-delkasko | Storebrand / Snøscooter / Delkasko | brann, tyveri, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| storebrand-snoscooter-kasko | Storebrand / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| storebrand-campingvogn-brann-og-tyveri | Storebrand / Campingvogn / Brann og tyveri | brann, tyveri, rettshjelp, redning, losore | Ingen nye tilvalg modellert |
| storebrand-campingvogn-kasko | Storebrand / Campingvogn / Kasko | brann, tyveri, kasko, rettshjelp, redning, losore | Ingen nye tilvalg modellert |
| storebrand-campingvogn-super | Storebrand / Campingvogn / Super | brann, tyveri, kasko, rettshjelp, redning, nyverdi, fukt, ferie | Ingen nye tilvalg modellert |
| storebrand-tilhenger-brann-og-tyveri | Storebrand / Tilhenger / Brann og tyveri | brann, tyveri, rettshjelp, redning | Ingen nye tilvalg modellert |
| storebrand-tilhenger-kasko | Storebrand / Tilhenger / Kasko | brann, tyveri, kasko, rettshjelp, redning | Ingen nye tilvalg modellert |
| if-snoscooter-ansvar | If / Snøscooter / Ansvar | rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| if-snoscooter-delkasko | If / Snøscooter / Delkasko | brann, tyveri, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| if-snoscooter-kasko | If / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| if-campingvogn-delkasko | If / Campingvogn / Delkasko | brann, tyveri, rettshjelp, naturskade, glass | Ingen nye tilvalg modellert |
| if-campingvogn-kasko | If / Campingvogn / Kasko | brann, tyveri, kasko, rettshjelp, naturskade, glass | Ingen nye tilvalg modellert |
| if-campingvogn-super | If / Campingvogn / Super | brann, tyveri, kasko, rettshjelp, naturskade, glass | Ingen nye tilvalg modellert |
| if-tilhenger-delkasko | If / Tilhenger / Delkasko | brann, tyveri, rettshjelp | Ingen nye tilvalg modellert |
| if-tilhenger-kasko | If / Tilhenger / Kasko | brann, tyveri, kasko, rettshjelp | Ingen nye tilvalg modellert |
| eika-fremtind-snoscooter-ansvar | Eika / Fremtind / Snøscooter / Ansvar | rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| eika-fremtind-snoscooter-minikasko | Eika / Fremtind / Snøscooter / Minikasko | brann, tyveri, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| eika-fremtind-snoscooter-kasko | Eika / Fremtind / Snøscooter / Kasko | brann, tyveri, kasko, rettshjelp, ansvar, ulykke | Ingen nye tilvalg modellert |
| eika-fremtind-campingvogn-minikasko | Eika / Fremtind / Campingvogn / Minikasko | brann, tyveri, redning, losore, glass | Ingen nye tilvalg modellert |
| eika-fremtind-campingvogn-kasko | Eika / Fremtind / Campingvogn / Kasko | brann, tyveri, kasko, redning, losore, glass | Ingen nye tilvalg modellert |
| eika-fremtind-tilhenger-kasko | Eika / Fremtind / Tilhenger / Kasko | brann, tyveri, kasko, redning | Ingen nye tilvalg modellert |

«Ingen nye tilvalg modellert» betyr ikke at kunden ikke har tillegg eller at selskapet ikke tilbyr andre tillegg. Ukjente/ikke dokumenterte valg forblir unknown. Tryg Snøscooter har to alternative ulykkestillegg: `tryg-snoscooter-forerulykke` og `tryg-snoscooter-ulykke`. De krever eksplisitt kundevalg og er gjensidig utelukkende i manuell registrering. Summer henvises til avtalt forsikringsbevis.

Dokumentert arv bruker eksisterende `inheritsProductId` og `replacesBase`: Tryg snøscooternivåene, Tryg Campingvogn Ekstra fra Kasko, Ifs dokumenterte nivåtrinn, og Eikas snøscooter-/campingvogntrinn. Andre produkter har egne kildebaserte snapshots. Storebrand Super arver ikke en motstridende løsøresum. Ingen provider- eller typekryssende arv er tillatt.

### Representative grenser og begrensninger
| Selskap / type | Registrert faktum | Kilde |
| --- | --- | --- |
| Tryg / Snøscooter | Ansvar: ubegrenset personskade / 100 mill. kr annen skade; Europa med angitte landunntak; sesongfordeling | PAU25004 §1.1; PAU21200 §§3,5 |
| Tryg / Campingvogn | Kasko løsøre 15 000 / 5 000 per ting; Ekstra 50 000 / 10 000, tekstilfortelt 15 000; fukt innen 10 år, egenandel 8 000 eller 25 % minst 8 000; ferie 1 500/dag maks 14 | PAU25255; PAU27016 |
| Tryg / Tilhenger | Fast utstyr 10 000; naturskade på brannforsikret tilhenger, 8 000 egenandel; last ikke antatt dekket | PAU26506 §2.2; PAU25255 |
| Gjensidige / Snøscooter | Ulykke 100 000 ved død / 200 000 invaliditet; utstyr 10 000, løsøre 5 000 i skadeprodukter | Offentlig snøscootervilkår, dekningstabell |
| Gjensidige / Campingvogn | Pluss fukt innen 15 produksjonsår, test under ett år; ferie 1 500/dag maks 14; fast/mobil geografi adskilt | Campingvogn Pluss PDF s.3–4 |
| Gjensidige / Tilhenger | Europa unntatt Kosovo/Russland/Belarus; redning og egen skade etter vilkår | Tilhenger Kasko PDF s.2 |
| Frende / alle tre | Europa unntatt Russland/Tyrkia/Belarus; utstyr 20 000 på skadeprodukter | 01.01.2026 s.2 |
| Frende / Campingvogn | Løsøre 20 000 eller avtalt sum; fukt i Kasko krever test som viser skade siste år; rørlekkasje/utbedring lekkasje unntatt | 01.01.2026 s.2–3 |
| Frende / Tilhenger | Løse ting/bagasje ikke omfattet | 01.01.2026 §3.9 |
| Storebrand / alle tre | Rettshjelp 100 000 per tvist; scope per produkt | motor09 s.32; camp02 s.14 |
| Storebrand / Campingvogn | Super: fukt under 15 år + årlig kontroll; ferie 1 500/dag maks 15; ny campingvogn innen 3 år etter egne taps-/gjenkjøpsvilkår | camp02 §§6.3.1–6.3.3 |
| Storebrand / Tilhenger | Brann standardegenandel 8 000 med forbehold om forsikringsbevis; geografi avgrenset | camp02 §§4,6.1.1 |
| If / alle tre | Brann/tyveri standardegenandel 8 000 med avtaleforbehold; rettshjelp 4 000 + 20 % overskytende | MOT2-2 §8.5 |
| If / Campingvogn | Glass: 3 000 ved skifte, ingen ved reparasjon; ingen personbil-km-grense kopiert | MOT2-2 §8.5.4 |
| If / Tilhenger | Angitt tilhenger med fastmontert utstyr, gjenanskaffelsesverdi | S-709 §1 |
| Eika / Snøscooter | Norden; ansvar også EØS; sesong/lagring; ansvar, ulykke og rettshjelp i Ansvar | PMO357; IPID V.104 |
| Eika / Campingvogn | 10 000 per gjenstand, totalsum i bevis; tyveri fra fortelt unntatt; fortelt krever avtalt sum | PMO354 §§1–3 |
| Eika / Tilhenger | Bare Kasko-produkt; Europa/Tyrkia/Israel; avtalt egenandel | PMO354; IPID V.103 |

For hvert produkt er komplett faktaliste med konkrete verdier og side/punkt i `lib/vehicle-object-catalog.ts`; manifestets `catalogUsage` gir omvendt oppslag fra hvert originaldokument til alle produkter/fakta. Katalogen gjør ikke offentlige eksempelbevis til kundens avtale.

## 5. Canonical modell og matching
Eksisterende canonical ID `snøscooter` beholdes for bakoverkompatibilitet; ASCII `snoscooter` brukes i faktanøkler og produkt-ID-er. `campingvogn` fantes allerede som type, men får egen katalog/faktastruktur. `tilhenger` er ny type. Ingen gamle IDs endres. Nye typer har egne coverage-familier og detaljnøkler; felles prisnøkler gjenbrukes.

| Type | Coverage-familier |
| --- | --- |
| snøscooter | brann, tyveri, kasko, rettshjelp, redning, utstyr, naturskade, ansvar, ulykke, forerulykke, losore |
| campingvogn | brann, tyveri, kasko, rettshjelp, redning, utstyr, naturskade, losore, nyverdi, fortelt, fukt, skadedyr, ferie, glass |
| tilhenger | brann, tyveri, kasko, rettshjelp, redning, utstyr, naturskade |

Hver familie har `.dekning`, `.grense`, `.egenandel`, `.alder`, `.geografi`, `.begrensning`. Avtalefelter: `.avtale.geografi`, `.avtale.sikkerhet`, `.avtale.sesong`, `.avtale.forsikringssum`, `.avtale.egenandel`. At en nøkkel er tillatt, betyr ikke at det er opprettet en verdi eller rad for hvert produkt. Ingen irrelevante Bil-fakta fylles ut.

Typealiaser: eksisterende Snøscooter/Snescooter suppleres med Snøskuter, Snoscooter og den offisielle betegnelsen Beltemotorsykkel; Tilhenger legges til. Eksisterende suffix-normalisering håndterer «forsikring». Caravan/Campingvogn beholdes. Kasko alene avgjør aldri type. Det er ikke lagt inn uverifiserte aliaser for teltvogn, hestehenger eller alle andre tilhengervarianter.

Dekningsaliaser er eksplisitte hele betegnelser, typeavgrenset: blant annet brannskade, tyveriskade, kaskoskade/skade på eget kjøretøy, berging/veihjelp, fastmontert ekstrautstyr/tilbehør, bagasje/løst utstyr, fukt og råte, insekter og gnagere, feriegaranti/ferieavbrudd, glasskade og campingvognens totalskadegaranti. Detaljaliaser kombinerer familie med forsikringssum/grense/beløpsgrense, egenandel, alder/aldersgrense, geografi/geografisk område og begrensning/unntak. Korte detaljaliaser krever entydig dekningskontekst. Ingen fuzzy matching.

Provideralias «Eika» er eneste nye selskapsalias. Eksisterende Gjensidige-juridisk-navn og øvrige provider-ID-er brukes uendret. Bare eksakt provider + canonical type + dokumentert nivå gir katalogtreff. Ukjent nivå beholder konservativ «Ikke koblet …»-status. Matching finner ikke automatisk Pluss hos en tilbyder som bare har Super.

Ekstraksjonsskjemaet har 227 tillatte canonical faktanøkler totalt. Prompten ber modellen bevare type-/objektidentitet, tillegg og eksplisitt prisgrunnlag. Produksjonsmodell `gpt-5.6-luna`, antall AI-steg og samtidighetsgrenser er uendret. Målte tester viser ikke produksjonslatens eller faktisk LLM-treffrate; utvidet schema kan påvirke tokenbruk og må observeres i senere pilot.

## 6. Kundedata, presentasjon og priser
Kundedokumentverdier normaliseres før katalogberikelse. Eksplisitt ikke valgt vinner; manglende dokumentasjon for valgfritt tillegg forblir unknown. Dokumentert ubetinget standarddekning i identifisert nivå kan berikes som selected med `coverageOrigin: catalog`. Katalogevidence beholdes selv når den effektive raden kommer fra dokumentet. Kildedato/URL/side/punkt følger katalogfakta; dokumentfakta bruker request-lokale dokumentreferanser.

Nye typedekkingsfamilier er integrert i Viktigste forskjeller. Tall, egenandeler og begrensninger sammenlignes innen samme familie/type. Bil-familier som leiebil, maskinskade og bilnøkkel legges ikke til de nye typene. Resultatnavigasjonen viser faktisk forekommende grupper, også de nye typene. Manuell typevelger bruker samme nye typeregister. Eksisterende detalj- og kildevisning gjenbrukes; ingen redesign.

Forsikringspris/TFA/Totalt hentes kun fra dokumenterte prisfelter. TFA-raden skjules for de tre nye typene når TFA ikke er dokumentert; det settes ikke 0 og total beregnes ikke. Eksplisitt TFA på snøscooter vises. Total merkes ikke automatisk «inkl. TFA» uten dokumentert TFA for disse typene. Prisdifferanser krever samme dokumenterte prisgrunnlag. Dette er konservativ dokumentpresentasjon, ikke en ny juridisk vurdering av avgiftsplikt. TFA-status uten dokumentasjon fastslås ikke fra type alene. Eksisterende porteføljesummeringsregler er uendret; uklar total/basis må fortsatt kontrolleres.

### Arkitekturgap før komplett porteføljetest
- **MULTI_OBJECT_MATCHING_GAP:** `analysis-merge.ts` bevarer to like produkter som separate objekter, med ulike `analysisObjectId` og dokumentreferanser; rekkefølge på ferdige kall endrer ikke utfallet. Men `groupInsurances` og hybridmatching grupperer etter forsikringstype. En typegruppe med to tilhengere er derfor ikke to matchede objektpar. Det finnes ingen sikker cross-side objekt-ID i etablert schema. Merke/modell, indeks og fullføringsrekkefølge brukes ikke som bevis. En egen senere oppgave bør innføre eksplisitt objektidentitet, entydige par og konservativ visning ved uklar identitet.

- **MISSING_PRODUCT_COMPARISON_GAP:** En manglende Snøscooter gir fortsatt typegruppe, tom tilbudsside og en rå sammenligningsforskjell. Den blir imidlertid filtrert bort fra Viktigste forskjeller fordi den eksisterende detaljprioriteten er for lav. Detaljvisningen bevarer produktet, men Oversikt advarer ikke tydelig. En avgrenset senere presentasjonsrettelse bør fremheve manglende produkt uten å konkludere at dekning faktisk mangler.

Begge gap er låst med beskrivende regresjonstester; testene dokumenterer begrensningen og påstår ikke at den er løst. Ingen stor objektmatching eller manglende-produkt-funksjon er implementert.

## 7. Fase 2, sikkerhet og blindtestklarhet
Én syntetisk PDF kan gi alle tre typer; tre PDF-er gir samme identiteter med separate kilder. 10+10 PDF-er er testet med Bil + de nye typene, maksimalt to samtidige ekstraksjoner, to kall for små batcher, delvis feil og deterministisk sammenslåing. Progress viser norske typenavn fra canonical register. HTTP-testen bruker faktisk production-server, syntetiske PDF-er og lokal OpenAI-stub; ingen ekte OpenAI-kall.

Semantic fallback holdes innen type; nye kjente canonical nøkler tillates i privacy-safe audit. Dokumenttekst, objekt-ID, registreringsnummer, modell og verdier logges ikke. Ukjente fritekstfakta kan fortsatt kreve fallback innen riktig type. Testsuiten kontrollerer scope og at private markører ikke lekker. Objektopplysninger kan bevares request-lokalt i eksisterende `productName`/importantTerms uten ny identifikator-regex. Ingen kundedata eller produksjonslogger ble brukt til tuning.

| Område | Status | Begrunnelse |
| --- | --- | --- |
| A PDF-identifikasjon | PARTIAL | Schema/pipeline testet syntetisk; ekte ukjente PDF-er og LLM-ekstraksjon ikke blindtestet. |
| B canonical type | READY | Eksakte aliaser, typeisolasjon og norske labels testet. |
| C katalogmatching | PARTIAL | 18 kombinasjoner med dokumenterte nivåer, men flere kildebegrensninger. |
| D produktmatching | PARTIAL | Eksakt kjent nivå fungerer; ukjent/uklar variant kobles ikke. |
| E comparison | PARTIAL | Ett objekt per type kan sammenlignes. Flere like typer og manglende-produktoversikt har dokumenterte gap. |
| F pricing | PARTIAL | Dokumenterte like prisgrunnlag testet. Avgift uten dokumentasjon og porteføljebasis avgjøres ikke ved gjetting. |
| G standard/add-ons | PARTIAL | Dokumenterte standarder og Tryg-ulykkestillegg testet; ukjente kanal-/kundetillegg må dokumenteres. |
| H provenance | READY | Hash, originalfiler, kildepunkt og kundedokumentreferanser bevart. Ukjent dato eksplisitt. |
| I multi-PDF | READY | Syntetisk 10+10 og faktisk lokal HTTP-rute bestått. Dette løser ikke cross-side objektmatching. |
| J progress | READY | Nye typer vises via register og eksisterende sikre events. |
| K partial failure | READY | Isolert PDF-feil, delvis resultat, kapasitet, avbrudd og feil før AI kontrollert. |

## 8. Endrede filer
| Fil | Formål |
| --- | --- |
| app/page.tsx | Manuell typevelger og resultatfaner omfatter nye faktiske typer. |
| app/components/vehicle-price.tsx | Skjuler udokumentert TFA for nye typer. |
| lib/analysis-output.ts | Tillatte typeavgrensede nøkler og ekstraksjonsinstruks. |
| lib/comparison.ts | Ingen automatisk TFA-merking av nye objekters pris uten dokumentasjon. |
| lib/document-fact-normalization.ts | Avviser feil typescope på canonical ekstraksjonsnøkler. |
| lib/insurance-normalization.ts | Eksplisitte type-/dekningsaliaser og registerintegrasjon. |
| lib/presentation-catalog.ts | Typeavgrensede dekningsfamilier i Viktigste forskjeller. |
| lib/product-catalog.ts | Registrerer nye kataloger og eksakt Eika-kanalalias; eksisterende produktrekkefølge bevart. |
| lib/vehicle-object-registry.ts | Nytt register for typer, dekningsfamilier, detaljaliaser og typesikre faktanøkler. |
| lib/vehicle-object-catalog.ts | Nye kildebaserte produkter, fakta, eksplisitt arv, tillegg og testbar dekningsmatrise. |
| lib/vehicle-object-sources.ts | Nye kildebeskrivelser og hasher, tilpasset eksisterende CatalogSource. |
| scripts/verify-analysis-http.mjs | Ny kjøretøyportefølje gjennom faktisk HTTP-rute med lokal stub. |
| tests/vehicle-object-catalog.test.mjs | 40 nye tester: kildeverdier, type/provider, standard/tillegg, arv, dokumentforrang og hash. |
| tests/vehicle-object-pipeline.test.mjs | 26 nye tester: batching, progress, sammenligning, pris, personvern og eksplisitte arkitekturgap. |
| catalog/sources/vehicle-extensions/manifest.json | 69 originalers metadata, hash, delvilkår og bruk per produkt/faktanøkkel. |
| catalog/sources/vehicle-extensions/* | 49 PDF-er og 20 HTML-originaler. Ingen PDF-uttrekk/render/scratch. |
| docs/vehicle-object-catalog-audit.md | Denne rapporten. |

Eksisterende Bil-/Innbo-/Hus-/Reise-katalogfiler, coverage-statusmotor, katalogberikelsesmotor, Fase 2-kontrollflyt, productionmodell, sikkerhet og deployment-konfigurasjon er ikke endret. De nødvendige felles register-/normaliserings-/presentasjonsutvidelsene er eksplisitt testet mot gammel suite.

## 9. Validering
Baseline **781/781** før de nye testene. Sluttresultat **847/847**, hvorav **66 nye**. TypeScript, ESLint, webpack production build og `git diff --check` bestått. Lokal production-HTTP/PDF/security-regresjon bestått, inkludert de nye typene.

| Separat kjøring | Bestått | Feil |
| --- | --- | --- |
| runtime | 1/1 | 0 |
| PDF | 21/21 | 0 |
| security | 22/22 | 0 |
| performance | 25/25 | 0 |
| semantic matching/audit | 64/64 | 0 |
| catalog/canonical | 454/454 | 0 |
| document precedence | 23/23 | 0 |
| effective facts | 42/42 | 0 |
| pilot/add-on | 41/41 | 0 |
| Fase 2 | 48/48 | 0 |
| progress/pris | 45/45 | 0 |
| premium/mileage | 21/21 | 0 |
| totalskade | 14/14 | 0 |
| nye typer/catalog/provenance | 66/66 | 0 |

Gruppene overlapper og skal ikke summeres. HTTP/PDF-kjøringen er i tillegg til de 847 node-testene. Nye UI-komponenttester renderer faktisk React-markup for pris og progress; ingen ny manuell fullside desktop-/mobilrunde er påstått.

Følgende kjøringer er utført: `node --test tests/*.test.mjs`, separate node-testgrupper, `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack`, `node scripts/verify-analysis-http.mjs` og `git diff --check`. Ingen tester er hoppet over. Node gir eksisterende advarsel om package module type; den er ikke endret som del av denne oppgaven. PDF-leseren rapporterte enkelte dupliserte MarkInfo-metadata i Tryg-originalene, uten feil ved tekstlesing/hash.

## 10. Gjenstående risiko og anbefalt neste steg
Før bred porteføljeblindtest bør de to navngitte sammenligningsgapene håndteres. Kildeoppfølging: gjeldende Tryg snøscooter-skadevilkår før 01.10.2026, avklart Storebrand Super-løsøresum, campingvognspesifikke If Super-vilkår og bekreftelse på If S-709, tydeligere Gjensidige versjonsinformasjon. Ikke utvid vilkårsverdier fra produktside der fullvilkår er motstridende eller uklart. Manglende dato/versjon er listet dokument for dokument ovenfor.

Ytterligere type-/produktaliaser, særlige utleie-/yrkes-/medlemsvarianter, bonus-/maskinskade-/transportregler og uavklarte tilleggsgrenser er ikke gjettet. Nye facts skal legges til fra kontrollerte autoritative vilkår. Positiv katalogstatus betyr sikker produktkobling, ikke full juridisk uttømming eller bevis for alle kundens valg.

Senere kildeoppdatering kan bruke manifestets offisielle URL → hent original → SHA-256 → sammenlign → gjennomgå ny dato/versjon og produktregler → menneskelig godkjenning → katalogoppdatering. Ingen overvåkingsjobb eller automatisk oppdatering er laget.

**Bekreftelse:** `.env.local` er ikke endret eller tracked. Ingen API-nøkler eller private credentials er introdusert. Et bredt secretsøk traff en offentlig HTML-heading-ID med «husk-…» i Frendes produktside; dette ble kontrollert som falskt positivt, ikke en nøkkel. Lokale testcredentials genereres bare i minnet av eksisterende runtime-test. Ingen kundedokumenter, tekstuttrekk, rendringer eller midlertidige analysefiler er lagt i prosjektet. Ingen commit, push, reset, revert, stash, rebase, amend eller force push er utført. Arbeidskopien inneholder tilsiktede, ucommittede endringer for gjennomgang.
