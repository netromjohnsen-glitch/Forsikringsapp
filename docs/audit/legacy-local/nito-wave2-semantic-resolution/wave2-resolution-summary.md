# NITO_WAVE2_SEMANTIC_RESOLUTION

Status: **WAVE2_SEMANTIC_RESOLUTION_COMPLETE**. Analyse fullført; ingen batch er implementert i denne oppgaven.

## Baseline

Branch main; HEAD `d3a37985fce4ada65fa2f7a88462d8834e4677af`; 17 eksisterende prosjektendringer; 0 staged. Sist dokumentert validering er 2038/2038, TypeScript, lint, webpack build, syntetisk HTTP/PDF-runtime og targeted audit PASS. Disse implementeringskontrollene er ikke kjørt på nytt i en read-only semantikkreview.

Wave 1 og trygg Wave 2: 21 P1-signaturer løst, 22 produkter tilsiktet endret, 182 uendret, 16 tidligere kildehasher, 714 sammenligningsretninger og 496 berørte rader kontrollert. Ingen av tallene er omregnet som nye resultater her.

## Batch decisions

| Batch | Disposition | Risiko | Anbefalt implementeringsmodell |
|---|---|---|---|
| B-015 | CANONICAL_EXTENSION_REQUIRED | MEDIUM | GPT-6 SOL HIGH |
| B-017 | READY_TO_IMPLEMENT | MEDIUM | GPT-6 SOL HIGH |
| B-018 | BLOCKED_BY_OTHER_BATCH | MEDIUM | GPT-6 SOL HIGH |
| B-019 | READY_TO_IMPLEMENT | LOW | GPT-6 SOL MEDIUM |
| B-020 | CANONICAL_EXTENSION_REQUIRED | MEDIUM | GPT-6 SOL EXTRA HIGH |
| B-021 | READY_TO_IMPLEMENT | MEDIUM | GPT-6 SOL HIGH |
| B-022 | CANONICAL_EXTENSION_REQUIRED | HIGH | GPT-6 SOL EXTRA HIGH |

Input batches: 7. Sum sluttklassifiseringer: 7.

- READY_TO_IMPLEMENT: **3**
- READY_TO_IMPLEMENT_AFTER_SPLIT: **0**
- SOURCE_RESEARCH_REQUIRED: **0**
- HUMAN_DOMAIN_REVIEW_REQUIRED: **0**
- CANONICAL_EXTENSION_REQUIRED: **3**
- KEEP_CURRENT_CONSERVATIVE_STATE: **0**
- BLOCKED_BY_OTHER_BATCH: **1**

## Semantiske beslutninger per batch

### B-015 — Skill Tryg Innbo flyttetyveri fra generell transportskade

**CANONICAL_EXTENSION_REQUIRED** — MAPPING_ERROR + narrow CANONICAL_GAP: profesjonell flyttings tyveri/skadeverk står som generell transportskade.

**Katalog nå:** trygInnboExtra: flytting.transport.grense = 30 000 per skadetilfelle ved transportbyrå/idrettslag/forening.

**Canonical nå:** flytting.transport.grense er brukt av andre tilbydere for ytre skade/transport/bæring. Ingen egen presis flyttetyveri/skadeverk-identitet finnes. CatalogFact kan lagre en ny termnøkkel uten skjemaendring.

**Beslutning:** Flytt akkurat denne opplysningen til ny flytting.tyveri_skadeverk.grense. Privat og profesjonell flytting beholdes som eksplisitt kvalifiserte grener i samme term. Ingen global alias fra transport til tyveri.

**Produktvisning:** Egen presis flyttetyveri/skadeverk-rad; Tryg har ikke lenger en falsk generell transportgrense. Andre leverandørers usplittede fakta beholdes separat.

**Kundemodus:** Samme presise dokumentnøkkel vinner. Eksakt, entydig label kan mappes; gamle generiske dokumentfacts om transport må beholdes uten å omdøpes eller få denne tyverigrensen tillagt.

**Avhengigheter:** Ingen annen batch. Opprinnelige review-ID-er: CR-254.

**Risiko:** MEDIUM — Begrenset kilde-/mappingendring innen oppgitt scope; særskilte dokumentprioritets- og arvstester kreves.

**Gjenstående krav:** Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

**Avgrenset kildebevis:**

- **S01**: [catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/tryg/innbo/Innbo_og_losore_Ekstra_PPK13302.pdf); PDF 4 §2.4; dokument PPK13302, gyldighet 2026-07-01. SHA-256 `4cffa3b051f329da0fe178b20243a0920d2b5928e9995d485c35b58a48f1f810`. [Offisiell referanse](https://www.tryg.no/odpdf?vilk=Hjemforsikring-Dekningsvilkaar-Ekstra&vilkNr=05PPK13302). Tyveri og skadeverk under flytting. 30 000 per skadetilfelle ved transportbyrå/idrettslag/forening o.l.; privat flytting omfattes uten denne særgrensen. Ikke bevis for generell transportskade eller ubegrenset erstatning.

**Testplan:** R-015-01, R-015-02, R-015-03, R-015-04, R-015-05, R-015-06, R-015-07, R-015-08, R-015-09. Navngitte kontroller: PC-0091, PC-0092, PC-0093, PC-1724, PC-1725, PC-1726, PC-1727, PC-1728, PC-1729, PC-1730.

**Fremtidige filer:** lib/tryg-innbo-catalog.ts, lib/insurance-normalization.ts, lib/catalog-enrichment.ts, tests/nito-remediation-wave2.test.mjs.

### B-017 — Skill Fremtind Reise avgang, innhenting og transittutgift

**READY_TO_IMPLEMENT** — MAPPING_ERROR / for grov oppsummering: ubegrenset innhenting ved fremmøte fremstår som generell regel også ved forsinket avgang.

**Katalog nå:** fremtind-reise: reise.forsinkelse.rute blander hendelser; avgangens samlede 6 000-grense og 24-timersvilkår mangler.

**Canonical nå:** reise.forsinkelse.avgang_sum og reise.forsinkelse.fremmote_sum finnes allerede hos Tryg. Verdier er kvalifiserte tekster, ikke bare skalare tall.

**Beslutning:** Gjenbruk begge eksisterende hendelsesnøkler med egne fullstendige utløsere/beløp. Behold rute som ikke-numerisk felles ramme. Legg til den dokumenterte 500-kronersregelen som egen kildebelagt term under eksisterende reise.bagasje.forsinket, tydelig knyttet til utilgjengelig bagasje ved forsinkelse med overnatting.

**Produktvisning:** Fremmøte og avgang blir separate allerede kjente sammenligningsrader; betinget transittbeløp har egen kilde og beholdt hendelse.

**Kundemodus:** Ikke avled kundens faktiske merutgifter fra produktgrenser. Nøyaktige dokumentnøkler/entydige hendelseslabels vinner; dokumentert bred rute-term blokkerer ny katalogavgang/fremmøte når dokumentet ikke kan deles sikkert. Historisk Eika er urørt.

**Avhengigheter:** Ingen annen batch. Opprinnelige review-ID-er: CR-382.

**Risiko:** MEDIUM — Begrenset kilde-/mappingendring innen oppgitt scope; særskilte dokumentprioritets- og arvstester kreves.

**Gjenstående krav:** Ingen uavklart semantikk; egen ordre kreves før implementering.

**Avgrenset kildebevis:**

- **S02**: [catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/fremtind/reise/canonical/fremtind-reise-vilkar.pdf); PDF 5–6 §8.2; dokument PRE-450.200-015, gyldighet 2025-03-17. SHA-256 `2e410ce7bb27c5d355f564d4fd44c88e28e5199448cb691f139440cacc8d4267`. [Offisiell referanse](https://dokument.fremtind.no/vilkar/fremtind/pm/reise/Reise_PM.pdf). Fremmøte: overnatting 6 000/person/skadetilfelle, innhenting ubegrenset. Avgang: overnatting og innhenting samlet 6 000/person/skadetilfelle; innhenting først når transportør ikke klarer ruten innen 24 timer. Klær/toalett 500/person ved overnatting og utilgjengelig ekspedert bagasje.

**Testplan:** R-017-01, R-017-02, R-017-03, R-017-04, R-017-05, R-017-06, R-017-07, R-017-08, R-017-09, R-017-10. Navngitte kontroller: PC-2070, PC-2071, PC-2072, PC-2073, PC-2074, PC-2075, PC-2076, PC-2077, PC-2078, PC-2079, PC-2080, PC-2081, PC-2082.

**Fremtidige filer:** lib/fremtind-reise-catalog.ts, lib/insurance-normalization.ts, lib/catalog-enrichment.ts, tests/nito-remediation-wave2.test.mjs.

### B-018 — Samle dokumentert brukstap under Frende Hund Tap

**BLOCKED_BY_OTHER_BATCH** — PRODUCT_COMPONENT_ERROR: del av valgt Tap er eksponert som selvstendig tillegg. I tillegg kan generisk tilleggsinferens velge hele Tap fra en underdekning etter en naiv flytting.

**Katalog nå:** Tap alene gir bare dyr.liv.*. Separat frende-hund-bruksverdi gir hund.bruksverdi.* uten Tap. Bekreftet med read-only resolverprobe.

**Canonical nå:** hund.bruksverdi.dekning/grense/alder/begrensning finnes. Komponentstruktur støtter innhold i Tap. Men selectedScopedAddOns søker alle komponentens hoveddekninger; den skiller ikke kjøpsbevis fra inkluderende underdekning.

**Beslutning:** Etter felles seleksjonsguard fra B-022: flytt Bruksverdi inn i frende-hund-tap; fjern den separate kjøpbare Bruksverdi-komponenten; behold betingelser og 50 %-regel. Ikke opprett Bruk → Liv-avhengighet for Frende: dette er inklusjon i Tap.

**Produktvisning:** Tap valgt gir betinget bruksverdidekning i Hund. Uvalgt Tap gir ikke kundevalgt Bruksverdi. Produktmodus viser én tilgjengelig Tap-pakke med Bruksverdi som innhold.

**Kundemodus:** Bare eksplisitt Tap/Liv-valg kan gi katalogbasert Tap-innhold. Dokumentert Bruksverdi alene bevares som dokumentfakta, men velger ikke hele Tap. Bruksverdi ikke valgt skal ikke oppheve øvrig dokumentert Tap.

**Avhengigheter:** B-022. Opprinnelige review-ID-er: CR-162.

**Risiko:** MEDIUM — Begrenset kilde-/mappingendring innen oppgitt scope; særskilte dokumentprioritets- og arvstester kreves.

**Gjenstående krav:** B-022s selectionEvidenceKeys-kontrakt og delt seleksjonsguard må være implementert og bestå gate før Tap-komposisjonen endres. Ikke tilstrekkelig å flytte to katalograder.

**Avgrenset kildebevis:**

- **S03**: [catalog/sources/boat-pet/frende-dog-terms.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/boat-pet/frende-dog-terms.pdf); PDF 3–4 §§7, 7.1.3, 7.3, 8.2, 8.4; dokument Hundeforsikring, gyldighet 2026-01-01. SHA-256 `6d052e5092d9f92050dcf95a92fa6ce5deda18a5825cdd00ca1c8cd2658c9135`. [Offisiell referanse](https://www.frende.no/forsikringer/hundeforsikring/). Bruksegenskapstap inngår i valgt Tap, ikke eget kjøpbart tillegg. Ferdig trent og regelmessig brukt hund; helt tap etter sykdom/ulykke; ikke hund åtte år eller eldre; avlsevne er unntatt. 50 % av Tap-summen. Tidligere bruksverdiutbetaling trekkes fra dødsfallserstatningen.

**Testplan:** R-018-01, R-018-02, R-018-03, R-018-04, R-018-05, R-018-06, R-018-07, R-018-08, R-018-09. Navngitte kontroller: PC-0571, PC-0572, PC-0573, PC-0574.

**Fremtidige filer:** lib/boat-pet-catalog.ts, tests/nito-remediation-wave2.test.mjs.

Feil nåværende komponentvalg er observert i resolverprobe. Risikoen etter en naiv flytting er utledet fra selectedScopedAddOns-koden, ikke fra en implementert eller mutert testkatalog.

### B-019 — Representer Storebrand Reise dagstur på korrekt overnattingsdimensjon

**READY_TO_IMPLEMENT** — MAPPING_ERROR: kjent dagsturregel ligger under geografi; reise.overnatting blir falskt ukjent.

**Katalog nå:** reise.omrade.verden inneholder Dagstur er omfattet. Probe viser unknown på reise.overnatting for Standard og Super mot Tryg.

**Canonical nå:** reise.overnatting finnes hos Tryg; eksisterende presentation-concept reise.rammer gjenkjenner den. Dette er term/eligibility, ikke fravær av dekning.

**Beslutning:** Legg eksplisitt kildebelagt reise.overnatting i Storebrands common-komponent. Betydning: dagstur YES, generelt overnattingskrav NO. Behold geografi og alle fordelsspesifikke overnattingsvilkår. Ingen ny state-enum, ingen UI-teksttolking.

**Produktvisning:** Storebrand får kjent dagsturregel på reise.overnatting i samme rad som Tryg; tilstanden er dokumentert term, ikke unavailable fordi krav på overnatting er NO.

**Kundemodus:** Dokumentert reise.overnatting har forrang. Ny term sier ikke at alle fordeler gjelder uten overnatting; leiebil/arrangementsavbestilling har egne betingelser.

**Avhengigheter:** Ingen annen batch. Opprinnelige review-ID-er: CR-394.

**Risiko:** LOW — Eksisterende termnøkkel og eksisterende source record; kun presis plassering av allerede kjent regel.

**Gjenstående krav:** Ingen uavklart semantikk; egen ordre kreves før implementering.

**Avgrenset kildebevis:**

- **S04**: [catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf); PDF 4 B.1.2–3; PDF 8–9 B.3/B.3.1.1–2; PDF 6 B.2.1; C.1 leiebil; dokument reise10, gyldighet 2025-06-01. SHA-256 `d44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414`. [Offisiell referanse](https://www.storebrand.no/privat/forsikring/reiseforsikring/_/attachment/inline/d834efe9-3dd1-4ac5-b81a-e88b9e4aa8d9:e889200271f53a0b6bf8059b3aff6bd43f442696/vilkar-reiseforsikring.pdf). Generell reise starter ved avreise fra hjemmet. B.3-tabell: Standard fremmøte 3 000 hotell/20 000 videretransport, avgang 3 000 hotell/1 500 ny transport per person per hendelse; Super ubegrensede beløp. Fremmøte minst 1,5 time; avgangsinnhenting krever transportør ikke kan innen 24 timer. Beløpsutvidelse fjerner ikke triggerne.
- **S05**: [catalog/sources/storebrand/reise/canonical/Reiseforsikring-produktside.html](/Users/morten/Documents/forsikringsapp/catalog/sources/storebrand/reise/canonical/Reiseforsikring-produktside.html); FAQ: Når gjelder reiseforsikringen?; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `fc65e95caadecb0ad10d557b276e8befaf39fe5da9ebb40f70c8d3d87ce2636d`. [Offisiell referanse](https://www.storebrand.no/privat/forsikring/reiseforsikring). Du og tingene dine er forsikret på dagstur eller lengre reiser. Dette gjelder generell reiseadgang, ikke alle enkeltfordelers vilkår.

**Testplan:** R-019-01, R-019-02, R-019-03, R-019-04, R-019-05, R-019-06, R-019-07, R-019-08, R-019-09. Navngitte kontroller: OVERNIGHT-01, PC-0532, PC-0533, PC-0534, PC-0535, PC-0536, PC-0537, PC-0538, PC-0539, PC-0540, PC-0541, PC-0542, PC-0543.

**Fremtidige filer:** lib/storebrand-reise-catalog.ts, tests/nito-remediation-wave2.test.mjs.

### B-020 — Bevar Gjensidige Hus gnagerfakta ved råte-/insektutvidelse

**CANONICAL_EXTENSION_REQUIRED** — INHERITANCE_ERROR + CANONICAL_GAP: Pluss/tillegg bruker samme nøkler som dyr/gnagere og replacesBase sletter grunnproduktets fakta.

**Katalog nå:** Standard har hus.skadedyr.bekjempelse/bygningsskade. Pluss og valgt råte/insekter erstatter disse med insektvilkår. Uvalgt tillegg skjules delvis av included-preferanse på samme nøkkel.

**Canonical nå:** Generiske skadedyrnøkler skiller handling (bekjempelse/bygningsskade), men ikke dyregruppe. Ingen sikre barn for dyr versus insekter finnes. Kun å fjerne replacesBase er utilstrekkelig i både produkt- og kundemodus.

**Beslutning:** Innfør søsken under hus.skadedyr: dyr.bekjempelse/bygningsskade og insekter.bekjempelse/bygningsskade/egenandel. Grunndyr arves; insekter er optional på Standard og included på Pluss. Råte holdes separat. Ingen global omtolking av andre provideres generiske skadedyrfakta.

**Produktvisning:** Standard/valgt tillegg/Pluss beholder samme dyreskader. Insekter vises som egen valgfri/inkludert gren, med egne kilder og egenandel.

**Kundemodus:** Dokumentert avslag på insekter skal ikke fjerne dyreskader og omvendt. Bred skadedyr-dokumentasjon er ikke bevis for begge undergrupper; uklar bred dokumentasjon blokkerer katalogutfylling i berørt gren fremfor å overstyres.

**Avhengigheter:** Ingen annen batch. Opprinnelige review-ID-er: CR-230, CR-231.

**Risiko:** MEDIUM — Begrenset kilde-/mappingendring innen oppgitt scope; særskilte dokumentprioritets- og arvstester kreves.

**Gjenstående krav:** Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

**Avgrenset kildebevis:**

- **S06**: [catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/gjensidige/hus/Hus-Standard-alminnelige-vilkar.pdf); PDF 3–4 Hus – Dekkes / Dekkes ikke; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc`. [Offisiell referanse](https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Standard-alminnelige-vilkar.pdf). Bekjempelse av levende mus, rotter og andre skadedyr i bygning. Skade fra mus, rotter og andre dyr omfatter fysisk bygningsskade, svekket isolasjon og lukt. Insekter unntas i grunnvilkåret på PDF 4. Ikke en kilde for universell firebeinsavgrensning.
- **S07**: [catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/gjensidige/hus/Hus-Pluss-alminnelige-vilkar.pdf); PDF 3–4 grunnskader; PDF 6 Råte og skadeinsekter; PDF 1 egenandeler; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792`. [Offisiell referanse](https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Pluss-alminnelige-vilkar.pdf). Beholder grunnproduktets dyreskader. På fullverdibygning: materialnedbrytning fra råtesopp/treødeleggende insekter; separat insektbekjempelse. Dekningene kommer i tillegg og erstatter ikke gnager-/andre dyreskader.
- **S08**: [catalog/sources/gjensidige/hus/IPID-Husforsikring-EAP01.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/gjensidige/hus/IPID-Husforsikring-EAP01.pdf); PDF 2 valgfrie utvidelser; dokument EAP01, gyldighet ikke oppgitt. SHA-256 `5550cd9753fe374a8d4e54e147ecca30e5be09b8c85fb34a52f04c18f3de14b9`. [Offisiell referanse](https://www.gjensidige.no/ipid/gfno/EAP01). Sopp/råte/skadeinsekter kan velges på Hus; inkludert i Pluss. Produktnivåbevis, ikke kundens valg.

**Testplan:** R-020-01, R-020-02, R-020-03, R-020-04, R-020-05, R-020-06, R-020-07, R-020-08, R-020-09, R-020-10, R-020-11. Navngitte kontroller: PC-0821, PC-0822, PC-0823, PC-0824, PC-0825, PC-0826, PC-0827, PC-0828, PC-0829, PC-0830, PC-0831, PC-0832, PC-0833, PC-0834, PC-0835, PC-0836, PC-0837, PC-0838, PC-0839, PC-0840, PC-0841, PC-0842, PC-0843, PC-0844, PC-0845, PC-0846, PC-0847, PC-0848, PC-0849, PC-0850, PC-0851, PC-0852, PC-0853, PC-0854, PC-0855, PC-0856, PC-0857, PC-0858, PC-0859, PC-0860, PC-0861, PC-0862, PC-0863, PC-0864, PC-0865, PC-0866, PC-0867, PC-0868, PC-0869, PC-0870, PC-0871, PC-0872, PC-0873.

**Fremtidige filer:** lib/gjensidige-hus-catalog.ts, lib/insurance-normalization.ts, lib/catalog-enrichment.ts, tests/nito-remediation-wave2.test.mjs.

### B-021 — Skill Storebrand forsinket avgang fra fremmøte

**READY_TO_IMPLEMENT** — MAPPING_ERROR: 20 000 for fremmøte brukes også om avgang der kilden sier 1 500 for ny transport. Super mister hendelsesvilkår i generell ubegrenset-tekst.

**Katalog nå:** Standard og Super har bare reise.forsinkelse.rute med sammenblandede hendelser.

**Canonical nå:** Gjenbruk samme avgang_sum/fremmote_sum-identiteter som B-017/Tryg. Forskjellige grenser for hotell og transport bevares i tydelig kvalifisert term, uten å gjøre dem til én felles sum.

**Beslutning:** Felles rute-ramme uten blandede summer. Standard: fremmøte hotell 3 000/transport 20 000; avgang hotell 3 000/transport 1 500. Super erstatter hver av de to summetermene med ubegrensede beløp, men beholder 1,5-times/24-times-triggerne i riktig gren.

**Produktvisning:** Standard får aldri fremmøtebeløpet på avgangsraden; Super-utvidelse fjerner ikke trigger- og dokumentasjonsvilkår.

**Kundemodus:** Bruk kompatibilitetsmappingen fra B-017 for dokument > katalog, uten generell alias av rute til én hendelse.

**Avhengigheter:** B-017. Opprinnelige review-ID-er: CR-381.

**Risiko:** MEDIUM — Begrenset kilde-/mappingendring innen oppgitt scope; særskilte dokumentprioritets- og arvstester kreves.

**Gjenstående krav:** Ingen uavklart semantikk; egen ordre kreves før implementering.

**Avgrenset kildebevis:**

- **S04**: [catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf); PDF 4 B.1.2–3; PDF 8–9 B.3/B.3.1.1–2; PDF 6 B.2.1; C.1 leiebil; dokument reise10, gyldighet 2025-06-01. SHA-256 `d44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414`. [Offisiell referanse](https://www.storebrand.no/privat/forsikring/reiseforsikring/_/attachment/inline/d834efe9-3dd1-4ac5-b81a-e88b9e4aa8d9:e889200271f53a0b6bf8059b3aff6bd43f442696/vilkar-reiseforsikring.pdf). Generell reise starter ved avreise fra hjemmet. B.3-tabell: Standard fremmøte 3 000 hotell/20 000 videretransport, avgang 3 000 hotell/1 500 ny transport per person per hendelse; Super ubegrensede beløp. Fremmøte minst 1,5 time; avgangsinnhenting krever transportør ikke kan innen 24 timer. Beløpsutvidelse fjerner ikke triggerne.

**Testplan:** R-021-01, R-021-02, R-021-03, R-021-04, R-021-05, R-021-06, R-021-07, R-021-08, R-021-09. Navngitte kontroller: PC-0532, PC-0533, PC-0534, PC-0535, PC-0536, PC-0537, PC-0538, PC-0539, PC-0540, PC-0541, PC-0542, PC-0543.

**Fremtidige filer:** lib/storebrand-reise-catalog.ts, tests/nito-remediation-wave2.test.mjs.

### B-022 — Avklar Gjensidige Bruk som avhengig tillegg til Liv

**CANONICAL_EXTENSION_REQUIRED** — CANONICAL_GAP: modellen kan kreve hovedprodukt, men ikke annet tillegg. Katt mangler artsriktig Bruk-identitet.

**Katalog nå:** Gjensidige Hund Bruk kan resolveres alene uten Liv. Katt har ingen Bruk-komponent. Begge hovedprodukter er Behandling; sourceSeeds har IPID, mens relevante fullvilkår allerede finnes lokalt.

**Canonical nå:** CatalogAddOn.requiresLevel validerer produkt-ID, ikke tillegg. Ingen requiresAddOnIds. Katt mangler katt.bruksverdi.*; hund.bruksverdi må ikke gjenbrukes.

**Beslutning:** Legg til eksplisitt all-of requiresAddOnIds, adskilt fra availableAddOns. Legg til eksplisitte selectionEvidenceKeys som avgrenser hva som kan velge et sammensatt tillegg. Bruk → samme arts Liv, aldri motsatt eller automatisk valg. Katt får artsavgrenset Bruksverdi. Registrer de eksisterende riktige fullvilkårene og produktsidene som faktakilder.

**Produktvisning:** Avhengighet er eksplisitt og håndheves uten å konvertere tilgjengelighet til kundevalg. Artsriktig Bruk blir sammenlignbart bare innen riktig art.

**Kundemodus:** Streng manuell validering av Bruk uten Liv. PDF med eksplisitt Bruk og taus/avvist Liv beholder dokumentert Bruk, men får ikke Liv valgt eller katalogberikelse som forutsetter Liv. Ingen global Frende/Fremtind/Tryg/If/Storebrand-avhengighet.

**Avhengigheter:** Ingen annen batch. Opprinnelige review-ID-er: CR-160, CR-292.

**Risiko:** HIGH — HIGH: delt tilleggsresolver, produktmodus og PDF/manuell bruker samme primitive. En naiv dependency closure kan feilaktig velge Liv, eller en streng throw kan forkaste kundedokumentet. Krever separat arkitekturgate og negative tester før katalogkobling.

**Gjenstående krav:** Ny implementeringsautorisasjon må eksplisitt omfatte den spesifiserte minimale utvidelsen og dens gate. Kildespørsmålet er avklart i frosset korpus; utvidelsen er ikke implementert eller regresjonsvalidert her.

**Avgrenset kildebevis:**

- **S09**: [catalog/sources/boat-pet/gjensidige-dog-product.html](/Users/morten/Documents/forsikringsapp/catalog/sources/boat-pet/gjensidige-dog-product.html); Sett sammen / Liv / Bruk (valgfritt); dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58`. [Offisiell referanse](https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring). Bruk legges til Liv. Valgfritt, ikke ubetinget del av Liv og ikke selvstendig tilvalg på Behandling.
- **S10**: [catalog/sources/boat-pet/gjensidige-cat-product.html](/Users/morten/Documents/forsikringsapp/catalog/sources/boat-pet/gjensidige-cat-product.html); Sett sammen / Liv / Bruk – tap av bruksverdi som avlskatt; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `f9bc6e31f84bfe1660b0014798ce144fa6fc5ee7f34ccbe14acf28feab883d4f`. [Offisiell referanse](https://www.gjensidige.no/forsikring/dyreforsikring/katteforsikring). Bruk er valgfritt tillegg til Liv. Gjelder avlskatt, ikke arbeidshund. Nettbeskrivelsen er kortfattet; fullvilkåret presiserer det kvalifiserende tapet.
- **S11**: [catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf); PDF 2–3 (trykt 6–7): tap av bruksverdi / opphør; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `90536e3520ee46f476f480be9760bc92bd40162e29fd53e914df44b70ea150ea`. [Offisiell referanse](https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring). Livsvarig tap innen forsikret bruksområde. Avl 100 % fysisk tap samt kullkrav; jakt/gjeting/tjeneste minst 50 % funksjonstap og dokumentert trening/bruk. Veterinær og adekvat behandling/rekonvalesens. Bruk opphører ved hovedforfall året hunden fyller 8.
- **S12**: [catalog/sources/boat-pet/gjensidige-cat-life-use-terms.pdf](/Users/morten/Documents/forsikringsapp/catalog/sources/boat-pet/gjensidige-cat-life-use-terms.pdf); PDF 2 (trykt 6): tap av bruksverdi, avlskatt / opphør; dokument ikke oppgitt, gyldighet ikke oppgitt. SHA-256 `47750999d5bdbe5fc9bf5a2ffe24def17dd1664a2b8f9886bc7868dbf8049f5e`. [Offisiell referanse](https://www.gjensidige.no/forsikring/dyreforsikring/katteforsikring). Avlskatt må ha mistet fysisk avlsevne 100 %, dokumentert av veterinær, med hann-/hunnkullkrav siste to år. Bruk opphører ved hovedforfall året katten fyller 10; Liv 13 er en annen dekning.

**Testplan:** R-022-01, R-022-02, R-022-03, R-022-04, R-022-05, R-022-06, R-022-07, R-022-08, R-022-09, R-022-10, R-022-11, R-022-12. Navngitte kontroller: PC-1056, PC-1057, PC-1058, PC-1059, PC-1060, PC-1061.

**Fremtidige filer:** lib/product-catalog.ts, lib/boat-pet-catalog-builder.ts, lib/boat-pet-catalog.ts, lib/boat-pet-registry.ts, lib/catalog-product-comparison.ts, lib/catalog-enrichment.ts, lib/presentation-catalog.ts, lib/manual-agreement.ts, app/page.tsx (bare nødvendig avhengighetsvalg/validering), tests/nito-remediation-wave2.test.mjs, tests/agreement-scope.test.mjs.

## Canonical decisions

- **CD-015 / CANONICAL_GAP**: Tap ved tyveri/skadeverk under flytting med eksplisitt utførerscope og per-skadetilfelle-grense. Term, ikke generell transportskadedekning. Generell transport/bæring, tyveri utenfor hjem og uhell er ikke samme hendelse. Ny presis child-key i eksisterende flytting-familie er nok; ingen schemautvidelse.
- **CD-017-021 / EXISTING_KEYS_REUSED**: Avgang: avtalt transport går ikke som planlagt. Fremmøte: kunden når ikke planlagt transport. Beløp for hotell/transport beholdes kvalifisert; samme key betyr samme hendelsesfamilie, ikke identisk vilkår. Eksisterende Tryg-nøkler og tekstlige CatalogFact verdier kan bevare trigger, person/hendelse og hotell/transport. Ingen ny scalar-beløpsmodell er nødvendig for disse batchene.
- **CD-018 / EXISTING_KEYS_COMPOSITION_FIX**: Frende Bruksverdi er et betinget innhold i valgt Tap, ikke kjøpbart separat produkt. Eksisterende keys og komponentmekanisme er tilstrekkelige for fakta; delt seleksjonsguard fra CD-022-SELECT er nødvendig for kundemodus.
- **CD-019 / EXISTING_KEY_REUSED**: Generell adgang for dagstur/reise uten overnatting. YES for dagstur; NO for et generelt overnattingskrav; ikke NOT_COVERED. Nøkkelen finnes allerede. Mangel er katalogplassering, ikke manglende produktkunnskap eller behov for ny state-enum.
- **CD-020 / CANONICAL_GAP**: To søsken etter skadevoldergruppe, hver med handling/ytelse. Dyr betyr kildens mus/rotter/andre dyr med egne unntak, ikke bare gnagere; insekter betyr kildebestemte skadeinsekter. Generiske keys får replacesBase og included-preferanse til å slå sammen/fjerne ulike ytelser. Nye child keys er nok; ingen ny product inheritance-motor.
- **CD-022-DEP / CANONICAL_GAP**: Optional all-of liste over tillegg som eksplisitt må være valgt for en gyldig katalogkombinasjon. Krever ikke automatisk kundeseleksjon. requiresLevel gjelder hovedprodukt. exclusiveGroup er gjensidig utelukkelse, ikke avhengighet. Produktarv ville uriktig gjøre Bruk inkludert i Liv.
- **CD-022-SELECT / CANONICAL_GAP**: Eksplisitt hvilke canonical parent-keys som kan velge eller blokkere hele tilleggskomponenten; øvrige faktanøkler er innhold/underdekninger. Eksakt navngitt dokumentvalg er fortsatt mulig. selectedScopedAddOns utleder alle parent keys fra faktalisten og bruker alle som valg-/avslagsbevis. Dette blander produktkomposisjon og individuell seleksjon.
- **CD-022-CAT / CANONICAL_GAP**: Katt: dokumentert tap av avlsegenskaper innen forsikret bruksområde, betinget av eget Bruk-valg og Liv. Katt-register mangler Bruk. hund.bruksverdi gjelder hund og blir avvist eller feilsemantisk på katt. Ingen ny generell dyr-liv-fact kan erstatte artsdistinksjonen.

Alle nøkkeldefinisjoner, scope, produkt-/kundekonsekvenser, falsk-ekvivalensrisiko og test-ID-er står i `canonical-decisions.csv` og JSON. Tre batcher trenger utvidelse; ikke tre nye generelle motorer. B-015 og B-020 trenger smalere termidentiteter. B-022 trenger eksplisitte tilleggsavhengigheter, seleksjonsevidens og et artsriktig Katt-barn.

## Mapping decisions

B-017 og B-021 gjenbruker eksisterende avgang_sum/fremmote_sum. B-019 gjenbruker reise.overnatting. B-018 er komposisjon, ikke et nytt forsikringsbegrep. Ikke aliaser brede eldre keys globalt til ett eller flere presise barn. Dokumenter med usikker scope beholdes konservativt; de gir ikke lisens til å fylle en motstridende kataloggrense.

## Source research required

Ingen ny source-research-oppgave er identifisert for de sju avgrensede semantiske spørsmålene. Gjensidiges ukjente dokumentdatoer/versjoner beholdes som ukjente. Rapporten validerer ikke offentlig ferskhet. Nettsidens korte Bruk-omtale erstatter ikke fullvilkårenes presise kvalifikasjoner.

## Human review required

Ingen av de fem globale human-domain-spørsmålene er registrert som avhengighet til disse sju batchene. Ingen menneskelig godkjenning er simulert. De tidligere CR-plassholderne for human signoff er ikke bevis for faktisk godkjenning; implementering og de spesifiserte arkitekturutvidelsene må autoriseres separat.

## Implementation-ready batches

**B-017, B-019, B-021**. B-021 har eksplisitt ordnet avhengighet av B-017s mapping-/kundeprioritetsgate. **B-015, B-020, B-022** har konkrete minimale utvidelsesdesign, men klassifiseres som CANONICAL_EXTENSION_REQUIRED. **B-018** venter på B-022s delte seleksjonsguard. Fullstendige fremtidige endringsinstruksjoner finnes i `implementation-ready-batches.md`.

## Recommended execution order

**B-019 → gate → B-017 → gate → B-021 → gate → B-015 (canonical gate først) → gate → B-020 (canonical gate først) → gate → B-022 (delt kontrakt før providerkobling) → gate → B-018 → full Wave 2-gate.**

Ingen child batches er opprettet; READY_TO_IMPLEMENT_AFTER_SPLIT = 0. De interne arkitekturgatene er ikke nye batch-ID-er.

## Regression plan

69 eksplisitte fremtidige testspesifikasjoner i regression-plan.csv; ingen nye prosjekttester er skrevet eller kjørt. Dekker egne kilder, scope, arv, tilvalg, samme produkt, sideskifte, kryssprodukt, produktvisning, syntetisk kundemodus og relevant type-/artsisolasjon.

Navngitte positive kontroller er koblet maskinlesbart til hver batch. OVERNIGHT-01 er eksplisitt inkludert. PC-2076 beskytter Fremtinds riktige fremmøteregel; PC-0534 beskytter Storebrands betingede bagasje500; PC-0826/0847 beskytter Gjensidiges grunnunntak/tilvalgsgrense; Frende Tap-opphør og artsisolasjon beholdes.

Endelig implementeringsgate:

- Hele eksisterende suite må fortsatt bestå (sist dokumentert 2038/2038) sammen med nye regresjoner.
- TypeScript, ESLint, webpack production build, syntetisk HTTP/PDF-runtime og git diff --check.
- Ny målrettet re-audit av bare berørte produkter/familier, og kontrollfingerprint for tidligere validerte 22 produkter/182 uendrede. Ingen ny 204-produkt full-audit.
- Bevar source-originaler og alle tidligere arbeidspunkter. Ingen commit/push/deploy uten egen ordre.

## Wave 3 readiness

**YES — betinget av implementering og PASS for hele sekvensen, inkludert utvidelsene.** Det er ikke grønt lys for Wave 3 nå. Bare å gjennomføre de tre READY-batchene lukker ikke Wave 2. Ingen av de 73 Wave 3-batchene er vurdert eller igangsatt. Dette er heller ikke en ny pilotgodkjenning.

## Project integrity

Se quality-check.json for faktisk sluttverifikasjon mot review-baseline.json: HEAD, branch, staged, git-status, alle prosjektfingeravtrykk og alle tre immutable inputtrær. En dirty working tree med de samme 17 endringene er forventet og korrekt. .env.local er ikke lest eller endret. Ingen stage/commit/push/deploy/reset/revert/stash/clean; Railway urørt.

## Output files

- [wave2-resolution-summary.md](/tmp/nito-wave2-semantic-resolution/wave2-resolution-summary.md)
- [wave2-resolution.json](/tmp/nito-wave2-semantic-resolution/wave2-resolution.json)
- [batch-resolutions.csv](/tmp/nito-wave2-semantic-resolution/batch-resolutions.csv)
- [canonical-decisions.csv](/tmp/nito-wave2-semantic-resolution/canonical-decisions.csv)
- [mapping-decisions.csv](/tmp/nito-wave2-semantic-resolution/mapping-decisions.csv)
- [implementation-ready-batches.md](/tmp/nito-wave2-semantic-resolution/implementation-ready-batches.md)
- [unresolved-dependencies.csv](/tmp/nito-wave2-semantic-resolution/unresolved-dependencies.csv)
- [regression-plan.csv](/tmp/nito-wave2-semantic-resolution/regression-plan.csv)
- [quality-check.json](/tmp/nito-wave2-semantic-resolution/quality-check.json)

Støttefiler i samme tillatte mappe: review-baseline.json, current-state-probe.mjs, current-state-evidence.json og write-review.py. Proben leste nåværende kode/katalog (13 avgrensede produkter, fire komponentkombinasjoner, fire sammenligningspar og én syntetisk dokumentnøkkel), uten mutert katalog eller nye tester. Node varslet bare eksisterende MODULE_TYPELESS_PACKAGE_JSON; ingen endring utført.

## Next step

Be om/gi en egen kontrollert implementeringsordre for den nå spesifiserte Wave 2-sekvensen. Start B-019; ingen ny kilde- eller menneskelig domeneavklaring er identifisert som nødvendig for disse sju batchenes avgrensede spørsmål. Ikke start implementering i denne oppgaven.

STOPP. Ingen implementering startet.
