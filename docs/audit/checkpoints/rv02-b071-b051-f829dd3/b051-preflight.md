# B-051 Gjensidige Hus: read-only preflight

Undersøkt revisjon: `f829dd3dba2ad8a5dbb0d0d9eb584be83f428f2e`.
Ingen B-051-produksjons- eller testendringer, closure eller budsjettføring.

## Eksakt omfang og avhengigheter

39 unike P1-signaturer, 71 forekomster og 69 kildebindinger stemmer med originalregisteret. Ingen P2 inngår. B-007s tining og B-020s presise skadedyrkontrakter består på denne revisjonen. Det beviser tekniske avhengigheter, ikke en rekonstruert historisk closure-kjede.

- 35 signaturer har kildeklare katalogmangler. Implementering er ikke autorisert.
- `41206e12c93c0058`: dyreskade/bekjempelse er allerede representert av B-020; foreslås revalidert separat.
- `8a89196fecd29ddb`: selve insektdimensjonen er representert. Felles unntak for landbruks-/næringsbygg må gjennomgås før full receipt.
- `157c7afed18eb0fe`: kildekonflikt SC-019/SR-033. Standard side 8 / Pluss side 9 dekker Husleietvistutvalget med 15 000 kr; de neste sidene unntar samme tvister. Ingen trygg avgjørelse foreligger.
- `25004bc4d7dd2c03`: presis mapping må avgjøres. Vann gjennom åpning skapt av dekket bygningsskade er ikke rørutstrømming, terrengvann eller våtromsfølgeskade. De eksisterende grenene skal ikke utvides semantisk uten beslutning.

SC-020/SR-032 beholdes: 6 000 kr for bygningsskade mot 2 000 kr for bekjempelse skal ikke blandes. SC-035/SR-031 og øvrige holds er urørt.

## Kilder, struktur og faktisk kontrakt

Originale Standard-/Pluss-vilkår, Smart-avtalens §6/§9 og relevante avsnitt på produktnettsiden er lest. Fire målrettede kildehasher stemmer; registrerte identiteter er bevart. Smart er en tjenesteavtale. Dens ansvarstak på 100 000 kr er ikke en forsikringssum. Innhentingsdato er ikke ikrafttredelse.

Baselineinventeringen og faktiske funksjonsprober finnes i [catalog-inspection.mjs](catalog-inspection.mjs) og `catalog-inspection.json.gz`. 40 enrichment-kombinasjoner bevarer dokumentverdier og kildehenvisning. Isolerte utleievilkår velger ikke et tillegg. Kjent manuelt katalogprodukt med eksplisitt tillegg henter riktig komponent. Fire sammenligninger bevarer samme produkt og begge retninger. Hus har ikke en registrert `relatedCoverage`-parentmodell; denne analysen innfører ingen slik modell.

Enkelte rå sidehenvisninger avviker fra PDF-ordinalen: hageobjekter side 2 mot PDF-side 3, Pluss-våtrom side 4 mot PDF-side 5, Helsehjelp side 12 mot Standard-side 11 og aldersfradrag side 18 mot Standard-side 17. Fremtidig retting må være per godkjent rad og avsnitt. Ingen global sideforskyvning er foreslått. Alle nåværende referanser er uendret.

## Neste kildeklare bolk: NOT_AUTHORIZED

Utleie og brukstap, fem eksakte signaturer:

- `08203cfa28493e63` — GAP-2089/SF-2994 og GAP-2144/SF-3078.
- `8e8d82878deb95b5` — GAP-2090/SF-2996 og GAP-2145/SF-3080.
- `b5b211cad16d32c6` — GAP-2091/SF-2997 og GAP-2146/SF-3081.
- `4a844bae3be9dea8` — GAP-2100/SF-3009 og GAP-2159/SF-3096.
- `8d28f56b17a9bae2` — GAP-2116/SF-3034 og GAP-2175/SF-3121.

Minste fullmakt: kildebundne endringer i eksisterende utleie-/leietap-/brukstap-rader i `lib/gjensidige-hus-catalog.ts`, ny permanent kildebasert gate, verifisert oppdatering av de tre berørte fingerprintene i B-020 R-020-06, individuelle completion-receipts og atomisk commit/push etter full PASS. Ingen engine-, schema-, mapping- eller kildeadmissionendring inngår.

Kilder: begge fullvilkår side 1 for sikkerhetsforskrifter; Standard side 3–5 og Pluss side 3–4/6 for hendelser; Standard side 17 og Pluss side 18 for leiekontrakt og oppgjør. Bevar registrert valgfritt tillegg, seks måneder én gang per leietaker, 20 000 kr utkastelse, 10 000 kr egenandel, begge 14-dagersregler, seksukersfrist, lovlig tilbakeholdt leie, markedsleie, adgangshindringens tak, tremånedersregel og fradrag for sparte utgifter/renter.

53 positive kontroller PC-0821–PC-0873, B-007/B-020, eksakte kilder/provenance, kundemodus mot produktmodus, valg/avslag/konflikt, dokumentprioritet, arv og begge retninger må inngå. Sluttgate: komplett remedieringsmanifest, fullsuite, typegen/TypeScript, ESLint, webpack-build, syntetisk HTTP/PDF, kilde-/reverse-audit og sikret publisering.

Vanlig godkjent kildeimplementering og korrekte nye assertions er scopearbeid. Eventuelle nye feilaktige harnessforventninger føres som separate røtter etter HARNESS_AUTONOMY_V1; uavhengige forsikringsregler skal ikke slås sammen for å passe et budsjett. Forslaget bruker ingen kapasitet og er ikke autorisert.

## Full signaturmatrise

[b051-preflight.json](b051-preflight.json) inneholder originalbindingene, samtlige 69 kildebevis, faktiske katalograder, minste endring per signatur og forventede testkontraktsendringer. Kildene kan etterprøves mot originalene og `b051-original-extraction.json.gz`.

|Signature|Dimension|Classification|
|---|---|---|
|08203cfa28493e63|Utleie / valg/hendelser|SOURCE_CLEAR_CATALOG_COMPLETION|
|0eda923b4090cf6c|Helsehjelp / hvem/hvor|SOURCE_CLEAR_CATALOG_COMPLETION|
|0f7980d6139daa2e|Førsterisiko / oppgjør|SOURCE_CLEAR_CATALOG_COMPLETION|
|157c7afed18eb0fe|Rettshjelp / unntak|BLOCKED_SOURCE_CONFLICT_SC019|
|2113807ceb290224|Håndverkerfeil våtrom / begrensninger|SOURCE_CLEAR_CATALOG_COMPLETION|
|239b00779349f2fd|Håndverkerfeil øvrig / begrensninger|SOURCE_CLEAR_CATALOG_COMPLETION|
|25004bc4d7dd2c03|Vann / hendelser|BLOCKED_PRECISE_MAPPING_DECISION|
|275365b3ec2971df|Ansvar / unntak|SOURCE_CLEAR_CATALOG_COMPLETION|
|292dacd4533926fd|Naturskade / nytomt|SOURCE_CLEAR_CATALOG_COMPLETION|
|35c58fbc06cf6e7d|Rettshjelp / tvistgrener|SOURCE_CLEAR_CATALOG_COMPLETION|
|403c9b3f0e9aa19f|Hage / omfang|SOURCE_CLEAR_CATALOG_COMPLETION|
|41206e12c93c0058|Skadedyr / skade og bekjempelse|IMPLEMENTED_DIMENSION_REVALIDATION_ONLY|
|416dfaab0492ce1b|Drensledning / årsaker|SOURCE_CLEAR_CATALOG_COMPLETION|
|46e94bcf464af845|Håndverkerfeil våtrom / utløser/tid|SOURCE_CLEAR_CATALOG_COMPLETION|
|4971fe7dbeac3649|Manglende gjenoppføring / oppgjør|SOURCE_CLEAR_CATALOG_COMPLETION|
|49adf65854171146|Brann / hendelser|SOURCE_CLEAR_CATALOG_COMPLETION|
|4a844bae3be9dea8|Brukstap / egen bolig|SOURCE_CLEAR_CATALOG_COMPLETION|
|57c775ac935fb504|Håndverker / klageforutsetning|SOURCE_CLEAR_CATALOG_COMPLETION|
|6080e5e5a6bb3c63|Aldersfradrag / fritak/beregningsbasis|SOURCE_CLEAR_CATALOG_COMPLETION|
|6af32d21acb9584c|Råte / unntak|SOURCE_CLEAR_CATALOG_COMPLETION|
|6ceaaaf84f1dc597|Hage/basseng/brygge / vær/dyr|SOURCE_CLEAR_CATALOG_COMPLETION|
|73aab8a0ad4f6c11|Smart / ansvarsgrense|SOURCE_CLEAR_CATALOG_COMPLETION|
|7ba0298883905c58|Vann / utett bygning|SOURCE_CLEAR_CATALOG_COMPLETION|
|86992ec620da2894|Bygging / begrensninger|SOURCE_CLEAR_CATALOG_COMPLETION|
|8a1beb3695ddb2fd|Helsehjelp / unntak|SOURCE_CLEAR_CATALOG_COMPLETION|
|8a89196fecd29ddb|Insekter / bekjempelse|IMPLEMENTED_DIMENSION_QUALIFICATION_REVIEW_BEFORE_REVALIDATION|
|8d28f56b17a9bae2|Brukstap / varighet|SOURCE_CLEAR_CATALOG_COMPLETION|
|8e8d82878deb95b5|Utleie / begrensninger|SOURCE_CLEAR_CATALOG_COMPLETION|
|90d49006ef7999d3|Rettshjelp / grunndimensjoner|SOURCE_CLEAR_CATALOG_COMPLETION|
|a4e5c76df5cbf2af|Skadedyr / avgrensninger|SOURCE_CLEAR_CATALOG_COMPLETION|
|a7561c0d03ede572|Brygge / sum/årsaker|SOURCE_CLEAR_CATALOG_COMPLETION|
|af150eab853a1648|Håndverkerfeil øvrig / utløser/tid|SOURCE_CLEAR_CATALOG_COMPLETION|
|af3a3ee673fedc83|Andreunntak / årsaker|SOURCE_CLEAR_CATALOG_COMPLETION|
|b3b964a9c6105360|Rullestol / sum/frister|SOURCE_CLEAR_CATALOG_COMPLETION|
|b5b211cad16d32c6|Utleie / kontrakt/tid|SOURCE_CLEAR_CATALOG_COMPLETION|
|bb47646cd8b17f20|Snø / glasshagestue|SOURCE_CLEAR_CATALOG_COMPLETION|
|cdd055ea730897ab|Smart / utrykning|SOURCE_CLEAR_CATALOG_COMPLETION|
|ce381a27b7435bec|Aldersfradrag / utvendigerør|SOURCE_CLEAR_CATALOG_COMPLETION|
|ed99577218e2302b|Offentlig påbud / vilkår|SOURCE_CLEAR_CATALOG_COMPLETION|


Globalt resolved/open = UKJENT. Ingen B-051-signatur er lukket.

`CATALOG_PILOT_GATE = REMEDIATION_REQUIRED`
