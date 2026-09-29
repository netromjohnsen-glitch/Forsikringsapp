# Produktsammenligning: root-cause-analyse og correctness hardening

Dato: 29.09.2026. Baseline: `e8b7acb4dc9bed9cbcc1b80e691b78de39158c01`, 1882/1882 tester. Denne rapporten beskriver lokale, ikke publiserte endringer. Full suite er nå 1959/1959 PASS. Alle påkrevde sluttkontroller er fullført; lokale endringer er klare for review.

## Avgrensning og evidens

Utgangspunktet er bulk-auditen av «Sammenlign produkter», med tilgjengelig `root-cause-input.json`, full audit-JSON, Word-/Markdown-rapport og faktisk kode/katalog/kildemateriale. JSON-input var tilgjengelig. Auditens `LIKELY_SHARED` var en hypotese om mulig konsekvens for PDF-/avtaleflyten, ikke en bekreftet klassifisering.

Baseline-auditen omfattet 164 katalogprodukter, 162 eligible, 84 direkte testede produkter, ni familier, 75 primærsammenligninger og 18 kontroller. Alle 93 kjøringer fullførte. Den registrerte 7907 presenterte fakta, 6349 provenance-koblinger, 522 flagg, 156 signaturer, 2261 unknown-celler og 1648 unike unknown-signaturer. Ingen provenance-avvik eller runtime-feil ble registrert. Av flaggene var 40 forekomster/15 signaturer merket `LIKELY_SHARED`; 482 forekomster var merket `PRODUCT_MODE_ONLY`.

Alle 15 potensielt delte signaturer ble undersøkt før implementering. Reproduksjon brukte eksisterende katalogprodukter og deterministiske funksjoner. Kildekontroll brukte de lokale offentlige originalene; ingen private PDF-er eller produksjonsuttrekk ble brukt. Det ble ikke innført AI-tolkning, fuzzy matching eller eksterne kildekall i runtime.

## Phase A: komplett beslutningslogg for de 15 signaturene

| Signatur | Antall | Audit-reason | Produkt/fact | Konklusjon og lag |
|---|---:|---|---|---|
| `ISS-46814b5273aeeb71` | 2 | SAME_CONCEPT_DIFFERENT_STRUCTURE | Tryg/If mot Frende Bil, `feilfylling.dekning` | Korrekt eksisterende parent-visning. Ingen dokumentert innholdsfeil; separat latent identitetsguard er hardenet. PRODUCT_MODE_ONLY. |
| `ISS-9e52942abdd19d17` | 2 | PARENT_CONTAINS_CHILD_CANDIDATE | Frende Utvidet, `feilfylling.dekning` | Kilden inneholder child eksplisitt. Korrekt konservativ avledning med parent-provenance. PRODUCT_MODE_ONLY. |
| `ISS-ded8aa776d61af8e` | 2 | SAME_CONCEPT_DIFFERENT_STRUCTURE | Tryg/If mot Frende Bil, `haerverk.dekning` | Korrekt eksisterende parent-visning. Ingen sammenslåing av katalogfacts. PRODUCT_MODE_ONLY. |
| `ISS-645eb89e2730122c` | 2 | PARENT_CONTAINS_CHILD_CANDIDATE | Frende Utvidet, `haerverk.dekning` | Korrekt eksplisitt parent-evidens; child-egenandeler forblir unknown. PRODUCT_MODE_ONLY. |
| `ISS-ce1643a4e8fa94b0` | 1 | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | If Hus Super, `hus.takvegg.folgeskade` | Bekreftet: unntak for selve utettheten ble tolket som avslag på følgeskadedekningen. PRODUCT_MODE_ONLY for dette faktumet. |
| `ISS-aaa9c65e93359d5b` | 2 | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | If Hus Super, samme fact i andre par | Samme bekreftede statusfeil. |
| `ISS-9175f4a25c8b4179` | 1 | POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION | If Hus Utvidet, samme fact | Samme bekreftede statusfeil gjennom produktarv. |
| `ISS-8ebdde76f9685b8a` | 6 | STATUS_TEXT_CONTRADICTION | Tryg Snøscooter Kasko, `snoscooter.redning.begrensning` | Bekreftet: restriksjonsfact ble vist som inkludert dekning. Også SHARED_ENGINE: restriksjonsdetalj kunne alene etablere kundestatus selected. |
| `ISS-ba323b6fbe07792a` | 6 | OPTIONAL_INCLUDED_CONFLICT | Tryg Snøscooter Kasko, `snoscooter.ulykke.dekning` | Bekreftet feil i canonical addon-ordlyd fra base-helper; optional-materialisering var korrekt. SHARED_ENGINE (delt katalogdata). |
| `ISS-85ff6542766f8307` | 6 | OPTIONAL_INCLUDED_CONFLICT | Tryg Snøscooter Kasko, `snoscooter.forerulykke.dekning` | Samme bekreftede forfatting av base-ordlyd i optional komponent. SHARED_ENGINE (delt katalogdata). |
| `ISS-691de319e114fae3` | 6 | POSSIBLE_DUPLICATE_CONCEPT | Tryg Snøscooter Kasko, de to ulykkesbegrepene | Ikke bevis for duplikat. Personscope er forskjellig; ingen sammenslåing. Eksisterende alternativvalgsguard beholdes konservativt. |
| `ISS-e980d7d07e05ac7e` | 1 | STATUS_TEXT_CONTRADICTION | Tryg Brann og tyveri, `snoscooter.redning.begrensning` | Bekreftet visningsfeil og kilde-scope-feil: Kasko-begrensning var kopiert til lavere nivå uten særskilt kildegrunnlag. |
| `ISS-9903ef9575456a2a` | 1 | OPTIONAL_INCLUDED_CONFLICT | Tryg Brann og tyveri, `snoscooter.ulykke.dekning` | Samme addon-ordlydsfeil. |
| `ISS-6e2ed0255ef75485` | 1 | OPTIONAL_INCLUDED_CONFLICT | Tryg Brann og tyveri, `snoscooter.forerulykke.dekning` | Samme addon-ordlydsfeil. |
| `ISS-6c6034fb20e71653` | 1 | POSSIBLE_DUPLICATE_CONCEPT | Tryg Brann og tyveri, ulykkesbegrepene | Ingen kildebegrunnet sammenslåing; behold separate scopes. |

Summen er 15 signaturer/40 forekomster. Ni signaturer/25 forekomster viste konkrete status-/katalogfeil. Seks signaturer/15 forekomster ga ikke grunnlag for å endre det observerte innholdet: åtte korrekte parent-visninger og sju kandidater til konseptduplisering der kildene dokumenterer forskjellig scope. Forekomsttallene er ikke antall uavhengige juridiske feil. Flere par viste samme fact og samme årsak.

## Root cause 1: begrensning ble behandlet som selvstendig dekning

### Første feilpunkt

Før endringen brukte `materializeCatalogProduct()` i `lib/catalog-product-comparison.ts` samme statusregel på alle basefacts: en negativ tekst ga `unavailable`; enhver annen verdi ga `included`. Dermed ble et faktum om en begrensning fremstilt som om begrensningens dekningsområde var inkludert. `coverageStatusFromText()` gjenkjente ikke «er unntatt», men det sentrale problemet var manglende skille mellom dekningspåstand og kvalifiserende detalj. Å legge til enda et negativt tekstmønster ville ikke løst dette skillet.

`valueForKey()` satte statusprefikset foran teksten. `productComparisonView()` og React viste dette resultatet. Feilen oppstod før komponenten rendret.

### Kildeforankring og scope

- Canonical key: `snoscooter.redning.begrensning`.
- Provider/type/scope: `tryg` / Snøscooter / `ordinary`.
- Produkt: `tryg-snoscooter-kasko`; produktversjon er `null` fordi IPID-ens gyldighetsdato ikke er dokumentert. Ukjent gyldighetsdato blir ikke gjort om til en kjent dato.
- Fact-definisjon: `lib/vehicle-object-catalog.ts`, Tryg Snøscooter-loop.
- Source record: `vehicle:tryg-IPID-Snoscooter.pdf` i `lib/vehicle-object-sources.ts`.
- Original: `catalog/sources/vehicle-extensions/tryg-IPID-Snoscooter.pdf`, side 1, «Begrensninger i forsikringen» → «Kasko».
- Dokumentversjon: 01.07.2025; kontrollert manifestgrunnlag hentet 23.09.2026.
- SHA-256: `4140b20c0d53e4430e008f1aed17c61c486f2be8cd14b00b3380ea72babac421`.
- Offisiell URL: <https://www.tryg.no/system/files/download/pdf/ipid/IPID-Snoscooter.pdf>.

Originalen plasserer «Utgifter til redning/veihjelp» under Kasko-begrensninger. Den dokumenterer ikke at redning generelt er inkludert. Den konkrete listen gir heller ikke grunnlag for å kopiere Kasko-begrensningen til Ansvar og Brann og tyveri. Katalogloopen gjorde begge deler mulig: samme begrensningsfact var opprettet på alle tre nivåer.

### Delte konsekvenser og rettelse

`vehicleObjectCoverages()` registrerer begrensninger som detaljer. Før rettelsen ga `detailEvidence()` i `lib/coverage-status.ts` positive utslag for enhver dokumentert detalj som ikke ble tolket som negativ/unknown. En kundeterm med bare redningsbegrensningen kunne derfor etablere `snoscooter.redning.dekning = selected`.

Dette ble reproduksjonskontrollert gjennom faktisk `enrichExtractedAgreementWithCatalog()` og `deriveCanonicalCoverages()`:

| Kundeevidens før rettelse | Tidligere resultat |
|---|---|
| Ingen redningsopplysninger | unknown; katalogens parent-gate filtrerte begrensningen ut |
| Bare dokumentert redningsbegrensning | selected; bekreftet falsk positiv inferens |
| Eksplisitt «Valgt» | selected; dokumentpåstanden beholdt |
| Eksplisitt «Ikke valgt» | not_selected; katalogen blokkert |

Ny delt helper `isNonAssertingCoverageDetail()` bruker de eksakte canonical segmentene `unntak`, `begrensning`, `begrensninger`. Slike detaljer får `restriction`-evidens og status `unknown`. De etablerer ikke selected alene og de tolkes heller ikke automatisk som et avslag på hele parent-dekningen. Dokumentert tekst/provenance beholdes i effektive detaljer; eksisterende document-over-catalog-prioritet per detaljnøkkel beholdes. Alder, kilometer, sum og annen eksisterende positiv detailevidens beholder tidligere seleksjonsregler.

Produktadapteren skiller `role: coverage` fra `role: term`. Begrensninger vises som vilkårstekst, uten å bruke et inkludert-prefiks som om teksten var en dekningspåstand. Det interne `state`-feltet beholder materialiseringsinformasjon; `role` avgjør om tilstedeværelsen kan presenteres som selvstendig dekning. Den konkrete Kasko-begrensningen beholdes ordrett med kilde. De to lavere Tryg-nivåenes udokumenterte kopier fjernes; de får ikke en oppdiktet positiv eller negativ redningsdekning. Manifestets `catalogUsage` følger dette nøyaktige produktscopet.

Ingen global endring er gjort i tekstparserens positive/negative regex.

## Root cause 2: unntak for defekten opphevet følgeskadedekningen

### Evidens

- Fact: `hus.takvegg.folgeskade` i `lib/if-hus-catalog.ts`.
- Provider/type/scope: `if` / Hus / `ordinary`.
- Produkter: `if-hus-utvidet` og arvet av `if-hus-super`; versjon `2023-09`.
- Source: `ifHusTerms`, `lib/if-hus-sources.ts`.
- Original: `catalog/sources/if/hus/Bygningsforsikring.pdf`.
- Dokument: BGN1-0, September 2023, side 8, §4.4.
- SHA-256: `9d2d36695c5677aea3e92ff8d395a9c5403f3d7d2afedb8e3447d9af21f526fe`.
- Offisiell URL: <https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bygningsforsikring>.

Kilden dokumenterer positiv dekning for Utvidet/Super ved vann som trenger inn utenfra over terrengnivå. Den unntar utbedring av selve utettheten og nevner særskilte bygningsdeler eldre enn 50 år. Dette er forskjellige skadeobjekter/scopes. Canonical verdi beholdt skillet; materialiseringen lette derimot etter «ikke dekket» hvor som helst i teksten og gjorde hele factet unavailable.

Rettelsen tilfører valgfri `coverageAvailability`-metadata til `CatalogFact`, med verdier `included | unavailable`. Den betyr kildeverifisert tilgjengelighet for det eksakte factets subjekt, ikke et kundevalg. Bare det kildeverifiserte If-factet får `included`. Original ordlyd, alder, unntak, key, produktarv og source er uendret. En provider-spesifikk kontroll i UI eller tekstfiltrering er ikke brukt.

**Avgrensning mot PDF:** den konkrete `hus.takvegg.folgeskade` har ikke en registrert coverage-parent i dagens Hus-statusmodell. Full enrichment og coverage-derivasjon beholdt teksten uten å opprette not_selected for denne nøkkelen. Denne konkrete feilrettelsen er derfor `PRODUCT_MODE_ONLY`, selv om den gjenbrukte tekstparseren er delt kode. `coverageAvailability` overstyrer ikke kundedokumentfacts i enrichment.

En ekte negativ kontroll er Storebrand Hus Standard med samme key og teksten «Ikke omfattet på Standard utover de ordinære vannreglene.» Den skal fortsatt være unavailable. Samme key er ikke nok til å gi samme tilgjengelighet på tvers av produkter.

## Root cause 3: optional komponenter fikk ordlyd fra base-helper

Fire signaturer/14 forekomster gjaldt Tryg Snøscooters to ulykkestillegg. `included()` i `lib/vehicle-object-catalog.ts` produserte «Inkludert i produktnivået» også for addon-komponentene. Produktmaterialiseringen plasserte komponentene korrekt som `optional`; den uriktige teksten kom fra canonical komponentdata, ikke fra arv eller feil valg av tilgjengelighetsstatus.

### To kildeverifiserte personscopes

| Dimensjon | Førerulykke | Fører- og passasjerulykke |
|---|---|---|
| Addon ID | `tryg-snoscooter-forerulykke` | `tryg-snoscooter-ulykke` |
| Canonical parent | `snoscooter.forerulykke.dekning` | `snoscooter.ulykke.dekning` |
| Dokument | PAU28002 | PAU28003 |
| Gyldig fra | 01.01.2025 | 01.07.2024 |
| Original | `catalog/sources/vehicle-extensions/tryg-odpdf-2001c3a6.pdf` | `catalog/sources/vehicle-extensions/tryg-odpdf-56716918.pdf` |
| §1, side 1 | Fører; passasjer også hvis kjøretøyet er registrert for flere personer | Fører og passasjer |
| §§3.1–3.2, side 2 | Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr | Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr |
| SHA-256 | `3ae14967e4d91e4c4a9c8541161206b86dda0c1bc1a7315ca9695f1c1da3c585` | `d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52` |

Offisielle originaladresser:

- <https://www.tryg.no/odpdf?vilkNr=05PAU28002&vilk=Forerulykke>
- <https://www.tryg.no/odpdf?vilkNr=05PAU28003&vilk=Forerogpassasjerulykke>

Begge source records finnes i `lib/vehicle-object-sources.ts`. Produkt-/avtalescope er `tryg` / Snøscooter / `ordinary`; addonene kan brukes på de eksisterende `tryg-snoscooter-ansvar`, `tryg-snoscooter-brann-og-tyveri`, `tryg-snoscooter-kasko`. Produktnivåets versjon kan være ukjent mens hvert addon-fact har den konkrete vilkårsversjonen ovenfor.

Den lokale offentlige produktsiden `catalog/sources/vehicle-extensions/tryg-snoscooterforsikring.html` dokumenterer tilgjengelig tilvalg; SHA-256 `d7b63067996798fc5a839b56ac4af10fbd47bb027d74a21bcf0f6282efeb3243`, URL <https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring>. Vilkårsindeksen `tryg-vilkar-fc5e4fcd.html` lenker de to dokumentene; SHA-256 `ab4f81d2250de4d77c6fbb8d2c7fdf22958c0733037ada642bbdbfe17ae442a0`, URL <https://www.tryg.no/forsikringer/kjoretoy/snoscooterforsikring/vilkar>. Dette lokale grunnlaget ble hentet 23.09.2026; ukjente siderevisjonsdatoer er ikke gjort om til dokumenterte gyldighetsdatoer.

### Rettelse og falske duplikatkandidater

Parent-tekstene beskriver nå de respektive personscopene. Tilgjengelighet kommer fortsatt fra addon-plasseringen, ikke fra et innebygd «inkludert»-utsagn. De to `.grense`-factene hadde tidligere en udokumentert generell henvisning til avtalt forsikringssum. Kontroll av de samme fullvilkårene viste faste publiserte beløp i §§3.1–3.2; katalogen og manifestets side-/punktreferanser er korrigert etter dette. Det er en dokumentert katalogrettelse, ikke et fabrikkert kundevalg eller kundebeløp. Kundens eksplisitte avvikende beløp har fortsatt prioritet.

Denne rapporten erstatter den historiske formuleringen i `docs/vehicle-object-catalog-audit.md` om at disse to summene bare henvises til forsikringsbeviset. Originalfilene er uendret.

Signaturene `ISS-691de319e114fae3` og `ISS-6c6034fb20e71653` beviser ikke duplisering av juridisk identiske dekninger. Personscopet er betinget forskjellig. Ingen canonical concepts ble slått sammen. Begge beholder eksisterende addon-ID, key og kilder. Den eksisterende `exclusiveGroup`-guard beholdes som konservativ begrensning; kildene er ikke brukt til å hevde at gjensidig utelukkelse er en ny juridisk konklusjon.

Katalogrettelsen påvirker produktmodus og eksplisitt valgte manuelle addon-komponenter. PDF-/hybridflow beholder eksplisitt kundestatus og kundens dokumenterte grenser. Eksisterende Snøscooter-PDF-enrichment aktiverer ikke ulykkeskomponenter automatisk bare fordi produktet er Kasko; dokumenttaushet er fortsatt unknown.

## Canonical semantics: korrekt parent/child ble bevart; identitetsguard ble styrket

De fire Bil-signaturene/åtte forekomstene viste allerede korrekt kildeforankret presentasjon. Frendes Kasko-fact inneholder eksplisitt både hærverk og feilfylling, mens If/Tryg har separate child-facts.

- Frende source record: `frendeKasko` i `lib/frende-catalog.ts`.
- Original: `catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf`, 01.01.2026, side 3, §6.1.
- SHA-256: `088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88`.
- Offisiell Frende-URL: <https://api.frende.no/documents/terms/public/pnc/CarInsurance>.
- Provider/type/scope: `frende` / Bil / `ordinary`.
- Produkter: `frende-bil-kasko`, `frende-bil-utvidet`; versjon `2026-01-01`.
- Motpartens If-original: `catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf`, MOT2-2 mars 2024, side 5 §4.4 hærverk og side 12 §4.11.2 feilfylling; SHA-256 `57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987`.
- Offisiell If-URL: <https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=MOT2-2>.

`ProductParentEvidence` inneholder eksplisitt parent-key, child-keys, identisk parentverdi og dokument-/dato-/side-/punktreferanse. Ingen søk etter tilfeldige ord i fritekst brukes. Parentfactets ordlyd og provenance følger visningen; Ifs eller Trygs egenandeler kopieres ikke til Frende.

En separat, latent feil lot et syntetisk feilkonstruert resultat med feil provider-/produkt-ID bruke den samme parentrelasjonen dersom de øvrige feltene var like. Relasjonen krever nå eksplisitt `providerId` og `productIds`, i tillegg til eksisterende type, ordinary scope, versjon, eksakt verdi og kildeidentitet. Evaluatoren er generell; Frende-IDene er deklarativ kildeavgrensning i relasjonen, ikke UI-spesialkode basert på selskapsnavn. En annen syntetisk provider/child viser samme mekanisme i testen.

Endringen gjelder bare produktpresentasjon. Den utvider ikke canonical facts, PDF-semantic matching eller kundeberikelse.

## Unknown hygiene: sju representative kategorier

Unknown-tall skal ikke reduseres som et mål i seg selv. Disse kategoriene er kontrollert og beholdes med sine faktiske evidensgrenser:

| Kategori | Representativt eksempel | Beslutning |
|---|---|---|
| TRUE / LIKELY TRUE UNKNOWN | If Super `maskinskade.alder` mangler en sikkert sammenlignbar maksimal dekningsalder i katalogen | Behold unknown. Ikke bruk kjøpsalder eller Frendes aldersgrense. |
| INSUFFICIENT EVIDENCE | If `feilfylling.rens` mot Tryg | Generell skade ved feilfylling dokumenterer ikke nødvendigvis samme selvstendige renseytelse. Ikke kopier. |
| PROVIDER-SPECIFIC COUNTERPART NOT REQUIRED | If `maskinskade.fossil`, `.el`, `.drivverk`, egne transport-/unntaksdetaljer | Behold som providerspesifikke detaljer; ingen kunstig symmetrisk motpart. |
| CUSTOMER-SPECIFIC VALUE NOT EXPECTED | Frende `kasko.egenandel`, forsikringsbevisbestemt i §11.11, side 9 | Produktmodus har ingen kundeegenandel. Vis individuelt avtalt når den eksakte katalogteksten bare er en henvisning; bevar teksten/kilden. |
| SAME CONCEPT / DIFFERENT STRUCTURE | If `maskinskade.egenandel` + `.fradrag` mot Frendes tre kilometerbaserte egenandelsintervaller | Behold hver modell med sine intervaller og rekkefølge; ikke slå sammen beløp eller skape like regler. |
| PARENT CONTAINS CHILD | Frende Kasko inneholder hærverk/feilfylling | Bruk bare deklarert kildebundet parentrelasjon; behold unknown for udokumentert child-egenandel. |
| POSSIBLE CATALOG GAP | If `bilnokkel.grense`/egenandel | MOT2-2 §4.11.2–6 beskriver en delt Uhellsgrense/egenandel. Det er ikke bevis for en egen uavhengig bilnøkkelsum. Behold unknown inntil kombinert scope eventuelt modelleres. |

Bulk-klassifikatoren er et hjelpemiddel. Eksempelvis kan en conditional ung-fører-egenandel bli flagget kundespesifikk fordi nærliggende tekst nevner forsikringsbeviset; det beviser ikke at selve produktregelen mangler. Ingen brede regex-baserte unknown-omklassifiseringer er gjennomført.

## Phase C: avgrenset produktpresentasjon

Følgende presentasjonsendringer utføres uten å endre canonical key eller PDF-/kundemodus:

- Bare eksakt gjentatte overskrifter rett over tilhørende første rad skjules visuelt. En tilsvarende radoverskrift lenger ned beholdes når andre fakta eller modeller kommer imellom. Distinkte child-navn og alle factverdier beholdes. Tilgjengelige navn må fortsatt identifisere rad og produkt.
- Eksplisitt display-metadata gir naturlige navn for `<type>.avtale.geografi`, `.sesong`, `.egenandel`, `.forsikringssum`. Andre nøkler beholder sine eksisterende labels.
- En liten eksakt liste med komplette, ukvalifiserte henvisningstekster kan få prefikset «Individuelt avtalt». Originalteksten beholdes. Beløp, standardverdier, særgrenser, vilkår og blandede setninger omskrives ikke til en individuell verdi.
- Begrensninger er vilkårstekst, ikke selvstendige inkludert-påstander. Optional informasjon beholder eksisterende tilgjengelighetsstatus.
- Providerspesifikke modeller/detaljer, parentkilder og øvrig provenance beholdes.

Dette er ingen generell omskriving eller forkorting av forsikringsvilkår.

## PDF_CUSTOMER_IMPACT

| Område | Virkning / bevaringsregel |
|---|---|
| PDF extraction/prompt | Urørt; ingen nye AI-kall eller modellbytte |
| Document facts | Eksisterende keys/verdier beholdes; restriction-only evidence gir ikke lenger falsk selected |
| Catalog facts | Kun kildeverifiserte Tryg addon-tekster/summer/scope og Ifs subjectspecifikke availability-metadata korrigeres |
| Document > catalog | Eksisterende prioritet beholdes, også dokument X mot katalog Y og ved eksplisitt avslag |
| Manual registration | Valgt addon er fortsatt selected; uvalgte addons blir ikke valgt av katalogtilgjengelighet; restriction-only fakta etablerer ikke dekning |
| Hybrid flow | Samme delte coverage-regler brukes; ingen ny kobling mellom dokumenter eller objekter |
| Addons | Optional komponenter forblir optional i produktmodus; eksplisitt kundevalg styrer kundemodus |
| Agreement scope | Ingen ny avtalescope eller medlemsprodukt; kilde-/produktguard er strengere |
| Product/object identity | Ingen endring i normalisering, object matching eller konsolidering |
| Value equivalence/pris | Urørt |
| Comparison engine | Bare den avgrensede restriksjonsinferensen er herdet; ingen nye semantiske AI-par |
| Viktigste forskjeller/detaljer | Kundedekning skal ikke bli valgt av restriksjonsinformasjon alene; tekst, bevis og faktaspesifikke kilder beholdes |
| Produktmodus | Subjectspecific availability, term-role, parentguard og lesbarhet som beskrevet ovenfor |

## Regresjoner og filer

Nye `tests/product-coverage-evidence.test.mjs` dekker 20 tilfeller for delt coverage-inferens: faktisk Tryg enrichment, annen provider/type, selected/not_selected/unknown, taushet, restriction-provenance, document X over catalog Y, omvendt rekkefølge, manuell flyt og positive alder/km/sum-kontroller.

Nye `tests/product-catalog-evidence-hardening.test.mjs` verifiserer originalhash og kildetekst, begge addon-personscopes og summer, optional på tre nivåer, manuelle valg, PDF-taushet og eksplisitte status-/sumoverstyringer, type/provider/scope-isolasjon, Kasko-only redningsscope, manifestreferanser og Ifs følgeskadedekning.

`tests/product-comparison-semantic.test.mjs` beholder eksisterende assertions og utvider relasjonsfixturet med de nye påkrevde identitetsfeltene. Negative provider/product-tilfeller og positive If/Tryg mot Frende Kasko/Utvidet med sidebytter legges til. Dette svekker ikke eksisterende scope-/version-/source-kontroller.

Nye `tests/product-comparison-hardening.test.mjs` har 27 fokuserte produktmodus-/React-regresjoner for subjectspecific status, kildebevaring, reelt renderet hierarki, individuelle referanser, konservative unknowns, sidebytter og eksisterende lukket trace-vokabular. Totalt er 77 tester lagt til: 20 coverage-evidence, 23 catalog-evidence, 27 produktpresentasjon og sju ekstra semantic-tester.

Filer i den samlede runden ved rapportskriving:

| Fil | Begrunnelse |
|---|---|
| `lib/coverage-fact-semantics.ts` | Ny delt, eksplisitt canonical restriction-role-helper |
| `lib/coverage-status.ts` | Non-asserting restriction-evidens og bevaring av detaljer/provenance |
| `lib/catalog-product-comparison.ts` | Produktmaterialisering med subjectspecific availability og coverage/term-rolle |
| `lib/product-catalog.ts` | Valgfritt kildeverifisert `coverageAvailability` på CatalogFact |
| `lib/if-hus-catalog.ts` | Included metadata for eksakt kildeverifisert følgeskade; ingen endring i ordlyd |
| `lib/vehicle-object-catalog.ts` | Korrekt ulykkes-scope/sum og Kasko-only redningsbegrensning |
| `catalog/sources/vehicle-extensions/manifest.json` | `catalogUsage` justert til faktiske sider/punkter/produktniveau; originalhash uendret |
| `lib/product-comparison-presentation.ts` | Provider/product-guard, display-labels, individuelle referanser, overskriftshierarki |
| `app/components/product-comparison.tsx` | Render presentasjonsmetadata med eksisterende kildevisning og tilgjengelighet |
| `tests/product-coverage-evidence.test.mjs` | Nye delte inference-regresjoner |
| `tests/product-catalog-evidence-hardening.test.mjs` | Nye kilde-/katalogregresjoner |
| `tests/product-comparison-hardening.test.mjs` | Nye produktmodus-/React- og isolasjonsregresjoner |
| `tests/product-comparison-semantic.test.mjs` | Sterkere parent-identitetskontroller og sidebytter |
| `docs/product-comparison-root-cause-hardening.md` | Denne beslutnings- og valideringsrapporten |

Endelig filsett er disse 14 filene: åtte produksjons-/presentasjonsfiler, ett source-manifest, fire testfiler og én rapport. Ingen kildeoriginal er redigert.

## BEFORE_AFTER

Samme 93 comparison-IDer ble kjørt både før og etter. To måleserier er bevart: originaldetektoren uendret og en visibility-korrigert detektor som tar hensyn til hva React faktisk viser. Sistnevnte er kjørt både på et read-only HEAD-øyeblikksbilde og på arbeidskopien; baseline-tallene samsvarer med den opprinnelige auditen. Korrekte unknowns/providerspesifikke facts er ikke fjernet for å forbedre tallene.

| Måling | Før | Etter, originaldetektor | Etter, faktisk visning |
|---|---:|---:|---:|
| Primær-/kontrollkjøringer | 75 + 18 = 93 | 93/93 | 93/93 |
| Total flags | 522 | 444 | 174 |
| Dedupliserte issue signatures | 156 | 135 | 91 |
| Hypotetisk LIKELY_SHARED, forekomster | 40 | 21 | 15 |
| PRODUCT_MODE_ONLY, forekomster | 482 | 423 | 159 |
| Unknown-celler | 2261 | 2262 | 2262 |
| Unike unknown-signaturer | 1648 | 1649 | 1649 |
| Presenterte fakta | 7907 | 7906 | 7906 |
| Provenance-koblinger | 6349 | 6348 | 6348 |
| Provenance mismatches | 0 | 0 | 0 |
| Runtime errors | 0 | 0 | 0 |

Visibility-korreksjonen gjør bare to ting: eksakt skjulte hierarchy-labels telles ikke som synlige, og et non-asserting term-fact regnes ikke som en synlig inkludert-påstand uten et faktisk inkludert-prefiks. Originaldetektorens 264 label-flagg og seks redningsstatusflagg etter rettelsen viser metadata som ikke lenger presenteres slik. Ingen semantisk funnkategori er gitt unntak for å få lavere tall.

De 15 gjenværende hypotetisk delte forekomstene er nettopp de åtte allerede korrekte If/Tryg–Frende parent-/strukturforekomstene og sju ulykkes-overlap-kandidater der kildene ikke begrunner sammenslåing. De øvrige 159 er 106 kundespesifikke referanser og 53 providerspesifikke detaljer. Disse review-kandidatene skal ikke automatisk «rettes» bort.

Unknown øker med én fordi den kildeudokumenterte redningsbegrensningen på Tryg Brann og tyveri ikke lenger presenteres som et fact for det produktet. Samme korrigering forklarer én færre presentert fact/provenance-kobling. Ingen korrekt kildekobling er mistet ved formatering. Alle 81 providerspesifikke detaljrader beholdes.

Ni same-product-kontroller har null forskjeller; ti deterministiske gjentakelser, ni sidebytter og ti representative React SSR-krysskontroller består. Re-auditen utførte ingen AI-kall, PDF-operasjoner eller runtime-webkall. Den opprinnelige auditens manuelle 20+12+8+5+9-utvalg er historisk; det hevdes ikke at hele dette utvalget ble manuelt gjennomgått på nytt.

Maskinlesbar før/etter-oppsummering ligger i den midlertidige auditpakken `product-hardening-audit-after/before-after-summary.json`. Original auditpakke ble beholdt uendret; rå og visibility-korrigerte rapporter er separate.

## VALIDATION

Baseline full suite: **1882/1882 PASS**. Fokuserte resultater under implementeringen er ikke en erstatning for den samlede sluttkjøringen.

| Kontroll | Status |
|---|---|
| Nye delte restriction-inference tester | 20/20 PASS |
| Coverage + vehicle catalog + PDF add-on + effective facts, delkjøring | 130/130 PASS |
| Nye source-evidence tester + vehicle/If Hus, delkjøring | 81/81 PASS |
| Parent/semantic-focused suite, delkjøring | 73/73 PASS |
| Nye tester inkludert i full suite | 77/77 PASS |
| Relevant targeted suite | 734/734 PASS |
| Eksisterende/full suite | 1959/1959 PASS, inkludert tidligere 1882 |
| TypeScript | PASS |
| ESLint | PASS |
| Production webpack build | PASS (`npx next build --webpack`) |
| `git diff --check` | PASS |
| Syntetisk HTTP/PDF-runtime | PASS (`node scripts/verify-analysis-http.mjs`), lokal mock og syntetiske dokumenter |
| Produktcomparison runtime | PASS (`node scripts/verify-product-comparison.mjs`), alle ni familier; null runtime-network/AI |
| Desktop / 390 px / tastatur | PASS ved 1280×900 og 390×844; native navigasjon, Enter/Tab, fokus, kildeutvidelse og originalkildelenke |
| React runtime warnings/errors | Ingen i lokal produksjonsbuild; nettleserens warn/error-logg var tom |

Nettleserkontrollen brukte lokal webpack-production-build i Codex-nettleseren (Chrome var ikke tilgjengelig via nettlesergrensesnittet). Tryg/If Snøscooter, If Super/Storebrand Standard Hus og If Super/Frende Utvidet Bil ble kontrollert. Desktop viste to kolonner, mobil stablet innhold uten horisontal dokumentoverflow. Separate ulykkesdekninger, Redning uten inkludert-påstand, Ifs positive følgeskade med beholdte unntak, negative Standard-kontroll, parent-evidens og individuell egenandel var synlige. Hele auditmatrisen ble i tillegg kjørt gjennom faktisk React SSR.

Én mellomliggende targeted-kjøring samtidig med webpack-build fikk 733/734 på den uendrede testen `price trace: ON/OFF equality and exact refs, reverse=false, split=false`. Feilen gjaldt bare ulik fullføringsrekkefølge for Existing/Offer i progress-arrayet; testen bruker konkurrerende 2 ms/1 ms-timere og sammenligner eksakt arrayrekkefølge. Snapshot-assertionen før dette bestod. Den samme uendrede målrettede gruppen bestod 734/734 etter build. Full suite bestod 1959/1959. Ingen gammel test ble fjernet eller svekket. Dette er en dokumentert rekkefølgesensitiv testbegrensning, ikke grunnlag for endring av tracing eller pipeline i denne oppgaven.

De direkte Node-runtime-skriptene gir eksisterende `MODULE_TYPELESS_PACKAGE_JSON`-varsel ved import av TypeScript/ESM. Det er ikke en React-feil; pakkekonfigurasjonen er urørt.

## SECURITY_PRIVACY

Oppgaven bruker offentlige originalkilder og syntetiske regresjonsdata. Ingen private kundedokumenter, kundelogger eller kundeidentifikatorer er nødvendig. Korrekthetsendringene introduserer ingen runtime-AI, provider-webkall eller ny logging. `.env.local` er ikke endret, innholdet er ikke inspisert eller logget, og filen er fortsatt ignorert av Git; ingen env-fil er tracked i endringssettet. Railway er ikke kontaktet eller endret. Production tracing er ikke aktivert. Den eksisterende HTTP-regresjonen aktiverer trace kun inne i sin isolerte lokale syntetiske testprosess for å verifisere privacy-kontrakten; nettlesertestserveren hadde tracing OFF. Ingen ekte AI-kall ble utført. Ingen commit/push/deploy eller reset/revert/stash er utført. Ingen secrets eller private dokumenter er lagt til. Lokal testserver er stoppet og midlertidig viewport er tilbakestilt.

## KNOWN_GAPS og bevisste begrensninger

1. De gjennomgåtte signaturene dekker ikke en juridisk totalrevisjon av alle katalogprodukter. Kildeversjoner, eksisterende ukjente datoer og tidligere dokumenterte produktgap er ikke automatisk avklart.
2. Tryg Snøscooter IPID oppgir versjon, men ingen dokumentert gyldighetsdato. Fremtidige oktober-2026-vilkår blir ikke aktivert i denne rettelsen.
3. Førerulykke og fører/passasjerulykke har forskjellig dokumentert personscope. Det foreligger ikke tilstrekkelig grunnlag for å slå sammen concepts. Den eksisterende gjensidig-utlukkende UI-guarden beholdes konservativt; nøyaktig produktmigrasjon/samtidig kjøpsadgang er ikke nyverifisert.
4. Redningsdekning på Trygs lavere Snøscooter-nivåer blir ikke utledet fra Kasko-unntaket. Unknown er tilsiktet når det eksakte nivået mangler dokumentasjon.
5. `coverageAvailability` er bevisst brukt smalt. Andre sammensatte positive/negative coverage-facts trenger eventuell egen kildekontroll; det er ikke gjort masseendringer i teksten eller globale parserregler.
6. If Bil bilnøkkel og delt Uhellsgrense trenger eventuell senere kombinert-scope-modellering. Ingen delt sum kopieres til en selvstendig child-grense i denne runden.
7. Providertilpassede komponentlister, egenandelsmodeller og kundespesifikke referanser skal fortsatt være ulike der kildene er ulike.
8. Den nye interne evidence-kind `restriction` har status unknown og filtreres bort fra trace-vinnerberegningen. Restriction-only gir `NO_EVIDENCE`; eksplisitt kundevalg med restriction gir fortsatt `explicit_status`. Dette er regresjonstestet med faktisk restriction-evidens og godkjent av den eksisterende lukkede trace-sanitizeren. Trace-vokabularet er ikke endret.
9. Eksisterende historiske auditnotater er øyeblikksbilder. Denne rapportens source-verifiserte korrigering av ulykkes-summer overstyrer den eldre generelle forsikringsbevis-henvisningen for disse konkrete komponentene.

## GIT_STATUS og avslutning

Endringene står lokalt for review på `main`. HEAD er fortsatt `e8b7acb4dc9bed9cbcc1b80e691b78de39158c01`. Det er ni modifiserte tracked filer og fem nye prosjektfiler, null staged filer. Den eneste endringen under `catalog/sources` er det dokumenterte `catalogUsage`-manifestet. Ingen original PDF/HTML er endret, og kildehash-regresjonene består. Working tree er tilsiktet ikke clean. Ingen commit, push eller deployment er utført.

Sluttstatus: **PRODUCT_COMPARISON_ROOT_CAUSE_HARDENING_READY**. Dette bekrefter denne avgrensede hardeningen, ikke en total juridisk kvalitetsgaranti for hele katalogen.
