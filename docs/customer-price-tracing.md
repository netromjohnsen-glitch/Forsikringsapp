# Privacy-safe observability for kundepriser

Status: **CUSTOMER_PRICE_TRACE_READY** – lokalt implementert og validert;
ikke publisert eller aktivert i produksjon.

Utvider eksisterende `ANALYSIS_TRACE`. Ingen pris-, rolle-, scope-, matching-,
normaliserings- eller dekningsrettelse er implementert. Extraction-prompten,
prisparseren og antall AI-kall er uendret. Den tidligere analysen og de 22
prisbevaringsregresjonene er bevart i sine opprinnelige filer.

## Hendelser og eksakte felt

Transporten bruker fortsatt `traceId`, `phase: server` og `sequence`.
`traceId` er den eksisterende tilfeldige request-ID-en fra `ANALYSIS_METRICS`.

`pricePresence`, `pricePresenceBefore` og `pricePresenceAfter` har alle samme
lukkede format: nøyaktig tre objekter i denne rekkefølgen:

```json
[
  { "key": "premie.ekskl_tfa", "present": false, "documentedValuePresent": false },
  { "key": "premie.tfa", "present": false, "documentedValuePresent": false },
  { "key": "premie.total", "present": false, "documentedValuePresent": false }
]
```

Dette er et struktureksempel, ikke et produksjonsresultat. `present` betyr at
en term har den eksakte `key`/`canonicalKey`. `documentedValuePresent` betyr at
minst én slik term har en ikke-tom verdi som ikke er «Ikke dokumentert» eller
tilsvarende etter eksisterende policy. Det er ingen ny prisparser eller kontroll
av om beløpet kan brukes i porteføljeprisen. Numeriske verdier sendes aldri.

| Stage | Felt |
| --- | --- |
| `extraction` – utvidet | Nye felt: `recordRef`, `documentRole`, `pricePresence`, `secureObjectIdentityPresent`, `objectIdentityInvalid`, `providerId`, `productId`. Eksisterende felt beholdes: `side`, `objectRef`, `batchRef`, `documentRefs`, `insuranceType`, `keys`, `coverageKeys`, `providerPresent`, `productPresent`, `productIdentityState`, `identityProvided`, `identityInvalid`, `identityPresent`. |
| `role_boundary` – ny | `side`, `objectRef`, `recordRef`, `documentRole`, `customerEligible`, `destination`, `reason`, `pricePresence`. |
| `supporting_attachment` – ny | `side`, `supportingRecordRef`, `objectRef`, `attached`, `reason`, `pricePresence`, `pricePresenceBefore`, `pricePresenceAfter`. `targetObjectRef` finnes bare når `attached=true`. |
| `normalization` / `repeated_normalization` – utvidet | Eksisterende felt samt `pricePresenceBefore` og `pricePresenceAfter`. |
| `consolidation` – utvidet | Eksisterende felt, særlig `inputRefs` og resultatets `objectRef`, samt `pricePresenceBefore` og `pricePresenceAfter`. |

Ved extraction er `recordRef === objectRef`, med format `object_N`. Ingen ny
identifikatorstrategi eller egen referanseteller er innført.

`documentRole` er nøyaktig én av `individual_agreement`, `general_terms`,
`unknown`. Legacy-fravær projiseres som `unknown`, uten å endre inputposten.
`destination` er `customer` eller `supporting`.

Produkt-ID sendes bare dersom den allerede finnes som tillatt katalogmetadata
på den observerte posten. Det gjøres ikke ekstra katalogoppslag i tracing.
Ved rått, validert extraction er `providerId`/`productId` derfor normalt `null`;
`productIdentityState` viser tilstedeværelsestilstanden uten produkttekst.
Eksisterende `product`-event viser senere det faktisk valgte katalogproduktet.

## Lukkede reason codes

Rollegrensen:

- `CUSTOMER_RECORD_RETAINED`
- `GENERAL_TERMS_RETAINED_AS_SUPPORT`

Støttevedlegget:

- `SUPPORT_SCOPE_NOT_APPLICABLE`
- `SUPPORT_ATTACHED_NO_PRICE`
- `CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED`

`role_boundary` observerer den faktiske `isCustomerObject`-grenen i `enrichBatch`.
Filteret og returverdiene er uendret. Ufullstendige eller inkonsistente nye
grenseevents avvises av sanitizeren.

`supporting_attachment` bruker resultatet av den eksisterende scope-kontrollen
og observerer den eksisterende `continue`-grenen som blokkerer kundepriser.
Det gjøres ikke en ny scope-beregning for telemetry. `pricePresence` gjelder
støtteposten, normalisert med den eksisterende funksjonen dersom den var
anvendelig. Kundevektorene før/etter gjelder det samlede attachment-kallet,
ikke en oppdiktet sekvensiell anvendelse av hver støttepost.

`objectRef` identifiserer kunden som ble vurdert. `targetObjectRef` gjentar denne
bare ved faktisk vedlagt evidens. Ved scope-avslag finnes ingen target-ref, men
kandidatens `objectRef` og uendrede før-/ettervektorer er tilgjengelige.
Terms-only uten kundekandidat har extraction/role-event og ingen oppdiktet
attachment-event eller kundeobjekt.

## Referanser gjennom pipeline

Den eksisterende request-lokale WeakMap-en knytter uttrekksobjektet til
dokumentposten og berikede kopier. Rollegrensen bruker samme referanse som
extraction. Støtteposten beholder sin egen extraction-ref, også når den
normaliseres til støtteinformasjon.

Konsolidering gjenbruker eksisterende `inputRefs` og lager en ny `objectRef`
bare når flere kundeposter faktisk konsolideres. Denne referansen bindes til
kundeobjektet før og etter attachment. `final`, `sanitizer` og eksisterende
client receipt følger samme resultatref. Sammenligningssidene og samtidige
requests får ingen delte tellere eller map-er. Ingen hash av kunde-ID brukes.

## Hvordan én komplett kjøring skiller A, B og C

1. Korreler `ANALYSIS_METRICS.requestId`, servertrace og client receipt på samme
   `traceId`. Krev avslutningseventer uten `droppedEvents`/`observerFailures`.
   Koble de faktiske kundeobjektene via klientrefs og konsolideringens `inputRefs`.
2. **A – ikke dokumentert ved extraction:** De tre canonical key-/value-flaggene
   mangler på de relevante uttrekksradene. Sjekk samtidig om eksisterende
   etikett-normalisering etablerer nøkkelen senere. «Ingen eksplisitt canonical
   key» er ikke bevis for at rå PDF- eller modelltekst manglet all prisomtale.
3. **B – bare på støtteinformasjon:** Pris er observert på en extraction-ref som
   går til `destination=supporting`. Attachment viser enten scope-avslag eller
   `CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED` og uendrede kundeprisvektorer.
   Dette beviser plassering/behandling, ikke at modellen burde ha valgt en annen
   rolle uten videre dokumentbevis.
4. **C – senere tap fra kundepost:** Extraction har dokumentert pris på en ref
   med `customerEligible=true`. Følg før/etter-normalisering, konsolidering,
   attachment, effective/sanitizer og klientens eksisterende prisbidragsreason.
   Første overgang fra tilstede til manglende avgrenser tapspunktet. En bevart
   canonical key med udokumentert verdi kan nå skilles fra nøkkelfravær.

Klassifiser per side, post og nøkkel: samme kjøring kan inneholde både A og B,
eller flere uavhengige forløp. Et ufullstendig trace kan ikke bevise fravær.
Et kontrollert, testinjisert senere tap verifiserer C-observasjonen; det hevdes
ikke å være en reproduksjon av den ukjente produksjonsfeilen.

## Personvern og avviste felt

Alle felter utenfor eksisterende/utvidet whitelist avvises, også inni
prisvektorene. Eksempelvis er følgende eksakte feltnavn avvist av testene:
`value`, `values`, `amount`, `price`, `annualPremium`, `registration`, `vin`,
`objectIdentifiers`, `identifierHash`, `hash`, `filename`, `name`, `address`,
`pdfText`, `extractedText`, `modelResponse`, `prompt`, `source`, `sources`,
`sourceExcerpt`, `text`.

Dette forbyr prisverdier, registreringsnummer/andre objektidentifikatorer og
deres hashes, filnavn, personnavn, adresser, PDF-/uttrekks-/modelltekst, prompts,
kildeutdrag og annen kundefritekst. Eksisterende avvisning av secrets og andre
ukjente felter er bevart. Canonical keys må være nøyaktig én av de tre prisnøklene;
prefiks med private suffikser, manglende/dupliserte nøkler, feil typer og fritekst
i ref-/rolle-/reason-felt avvises. Canary-tester verifiserer også hele loggutdata.

Alle nye observasjoner går gjennom eksisterende feilisolerte collector.
Observer-/sink-feil kan ikke endre analyseresultatet. Collectorens eksisterende
eventgrense og feil-/dropp-tellere er bevart. Ingen persistens eller ny
telemetry-tjeneste er innført. De nye serverstages er ikke tillatt som client
receipt-stages av den eksisterende HTTP-ruten.

## Validering og overhead

| Kontroll | Resultat |
| --- | --- |
| Nye trace-regresjoner | 22/22 |
| Hele testsuiten | 1434/1434; alle 1412 tidligere tester bevart |
| `npx tsc --noEmit` | Bestått |
| `npm run lint` | Bestått |
| `npx next build --webpack` | Bestått |
| `git diff --check`, inklusive separate kontroller av nye filer | Bestått |
| Syntetisk HTTP/PDF-runtime | PASS |

Regresjonene dekker kundepris, støttepris, fravær ved extraction, blandet
kundepost/vilkår, to objekter med støtteposter, reversert rekkefølge,
batchdeling, konsolidering, samtidige requests, ON/OFF-likhet, observerfeil,
terms-only, ukjent rolle, ugyldig ID, tom/udokumentert verdi, nullpris,
senere etikett-normalisering, kontrollert senere pristap og personvernavvisning.
Én ny test antok først at generiske etiketter var støttede aliaser; testdataene
ble korrigert til eksisterende eksplisitte aliaser. Ingen normaliseringslogikk
ble endret. Hele suiten ble kjørt på nytt og bestod.

HTTP/PDF-kontrollen bruker den bygde appen, syntetiske PDF-er og lokal AI-stub.
Den verifiserer canonical priser på kunde versus støtte versus fravær,
de faktiske boundary-/attachment-eventene, signert klientmottak og uendrede
to uttrekkskall per 2+2-kjøring. Eksisterende PDF/security/price/object-regresjoner
kjøres fortsatt. Lokal portbinding ble kjørt med godkjent sandbox-unntak;
Railway og ekte AI-tjeneste er ikke brukt.

Lokal 2+2-benchmark: 12 oppvarmingsrunder per modus og 40 alternerende målinger
per modus av berikelse, sammenslåing, sluttprojeksjon og trace-serialisering.
Tracing OFF: median **66,453 ms**, p90 **73,977 ms**.
Tracing ON: median **70,194 ms**, p90 **77,696 ms**.
Medianforskjell: **+3,741 ms**. 68 serverevents, null observerfeil og null dropp.
Dette måler hele den eksisterende tracen med utvidelsen, ikke bare de nye feltene.
PDF-parsing, AI, HTTP, Railway/stdout-transport og klientarbeid inngår ikke.

## Filer og avgrensning

- `lib/production-trace.ts`: eksakte felt, projeksjon, whitelist og konsistenskontroll.
- `lib/production-trace-server.ts`: emission og eksisterende request-lokale refs.
- `lib/analysis-merge.ts`: observerkall ved faktisk rollegrense og binding før attachment.
- `lib/supporting-terms.ts`: valgfrie observer-hooks rundt uendrede beslutninger/resultater.
- `tests/customer-price-trace.test.mjs`: 22 nye trace-, dataflyt- og personverntester.
- `scripts/verify-analysis-http.mjs`: syntetiske HTTP/PDF-kontroller av prisplassering,
  fravær, trace-refkobling og faktisk signert klientmottak; to stub-uttrekkskall per kjøring.
- `docs/customer-price-tracing.md`: denne kontrakten og bruksbeskrivelsen.

Bevart uendret fra forrige oppgave:
`tests/customer-price-preservation.test.mjs` og
`docs/customer-price-preservation-audit.md`.

Ingen prompt-, katalog-, pris-, totalskade-, Maskinskade-, UI- eller kundedatarettelse.
Ingen nye AI-kall. `.env.local` og Railway er urørt. Ingen tracingaktivering,
commit, push eller deployment er utført. Produksjonskjøring krever senere
godkjent publisering og midlertidig aktivering av det eksisterende trace-flagget.
