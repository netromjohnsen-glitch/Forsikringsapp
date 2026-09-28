# Kundepriser etter OBJECT_ROLE-rettelsen

Status: **CUSTOMER_PRICE_PRESERVATION_PARTIAL**.

Utgangspunkt: ren `main`, commit `22fd4cd66fabc782d036a333020b278f17132270`.
Undersøkelsen er begrenset til prisnøklene `premie.ekskl_tfa`, `premie.tfa`
og `premie.total` gjennom uttrekk, rollegrense, berikelse, normalisering,
støttevedlegg, konsolidering og klientrespons.

Brukeren har bekreftet at produksjonstracing var avslått under den aktuelle
kjøringen, og at uttrekksdata med postrolle/prisnøkler ikke er tilgjengelig.
Ingen private PDF-er, kundeidentifikatorer, produksjonsverdier eller gamle
traces er brukt. Ingen produksjonsårsak er utledet fra sluttvisningen alene.

## Første tapspunkt og hva som faktisk er bevist

**FIRST_PRICE_LOSS_STAGE i den reelle kjøringen: NOT_OBSERVED.**

Scenario A, der priser på en kundeberettiget post går tapt etter uttrekk,
ble **ikke reprodusert**. Både `individual_agreement`, `unknown` og manglende
legacy-rolle bevarer de dokumenterte prisene. Korrekt merket kombinert
avtale-/vilkårsinnhold bevarer pris, objekt-ID og egenandel.

To forskjellige syntetiske input gir derimot samme manglende kundepriser:

1. Kunden mangler prisnøklene i uttrekket, mens en `general_terms`-post har dem.
   `enrichBatch()` utelater støtteposten fra `insurances` ved
   `if (!isCustomerObject(documentRecord)) return []`.
   `mergeBatchResults()` holder den utenfor kundekonsolideringen.
   `attachSupportingTerms()` blokkerer `premie.*` fra generelle vilkår.
   Prisene er fortsatt bevart i `supportingEvidence`, men har ingen dokumentert
   kundeautoritet. Dette beviser filtreringsgrensen, ikke feilklassifisering.
2. Ingen uttrekksrader har prisnøklene. Det endelige kundeobjektet får samme
   manglende prisstatus som i scenario 1.

Hvis hele kundeposten feilmerkes `general_terms`, gjelder samme filter. Dagens
kode klassifiserer ikke posten fra pris eller navn; den bruker uttrekkets
eksplisitte rolle. Det finnes ikke bevis for at produksjonens uttrekker faktisk
ga en slik feil rolle. En generisk post med pris og ID kan heller ikke automatisk
oppgraderes: priseksempler i vilkår er ikke bevis på kundens avtale.

Den eksisterende parseren bevarer `documentRole`, `canonicalKey`, dokumentreferanser
og prisstrenger. Rollegrensen kommer før katalogberikelse. Ved flere kundeposter
normaliserer konsolideringen dem og beholder prisfakta fra de relevante postene;
støtteposter er ikke kandidater. For enkeltposter brukes det allerede berikede
kundeobjektet. Støttevedlegget skjer etter konsolidering. Sanitizeren sletter ikke
objektets prisfakta. Alle disse overgangene er kontrollert med syntetiske data.

## Postmatrise i reproduksjonene

Alle referanser under er lokale syntetiske referanser. «Alle» betyr tilstedeværelse
av de tre prisnøklene, ikke bestemte prisbeløp. Product identity viser kun det
kanoniske produktnivået.

| Scenario | Dokument/post | Rolle | Kundeberettiget | Prisnøkler ved uttrekk | Sikker ID | Produkt | Overlever som kunde | Støtteinformasjon |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Korrekte roller | left/doc_0/record_0 | individual_agreement | Ja | Alle | Ja | Kasko | Ja | Nei |
| Korrekte roller | left/doc_0/record_1 | general_terms | Nei | Ingen | Nei | Kasko | Nei | Ja |
| Korrekte roller | left/doc_1/record_0 | individual_agreement | Ja | Alle | Ja | Pluss | Ja | Nei |
| Korrekte roller | left/doc_1/record_1 | general_terms | Nei | Ingen | Nei | Pluss | Nei | Ja |
| Pris på støttepost | left/doc_0/record_0 | individual_agreement | Ja | Ingen | Ja | Kasko | Ja | Nei |
| Pris på støttepost | left/doc_0/record_1 | general_terms | Nei | Alle | Nei | Kasko | Nei | Ja |
| Pris på støttepost | left/doc_1/record_0 | individual_agreement | Ja | Ingen | Ja | Pluss | Ja | Nei |
| Pris på støttepost | left/doc_1/record_1 | general_terms | Nei | Alle | Nei | Pluss | Nei | Ja |
| Ingen pris i uttrekk | left/doc_0/record_0 | individual_agreement | Ja | Ingen | Ja | Kasko | Ja | Nei |
| Ingen pris i uttrekk | left/doc_0/record_1 | general_terms | Nei | Ingen | Nei | Kasko | Nei | Ja |
| Ingen pris i uttrekk | left/doc_1/record_0 | individual_agreement | Ja | Ingen | Ja | Pluss | Ja | Nei |
| Ingen pris i uttrekk | left/doc_1/record_1 | general_terms | Nei | Ingen | Nei | Pluss | Nei | Ja |

Med korrekte roller finnes alle tre prisnøklene på hvert kundeobjekt ved
validert uttrekk, etter `enrichBatch`, etter normalisering/gjentatt normalisering,
etter støttevedlegg/sammenslåing og i klientresponsen. Både normal og reversert
side-/dokument-/batchrekkefølge er kontrollert. Når prisene bare finnes på
støtteposter, beholder de samme nøklene sin støtteprovenance helt til responsen.

## Rettelse og endrede filer

Ingen produksjonsrettelse er implementert: korrekthetstap fra en kundeberettiget
post er ikke bevist. Ingen tilfeldig endring av prompt, extraction, roller eller
prisparser er gjort. Det ville være usikkert å kopiere priser fra støtteposter
basert bare på produktlikhet, PDF-tilhørighet eller en generisk posts objekt-ID.

Bare disse filene er nye:

- `tests/customer-price-preservation.test.mjs`: 22 målrettede regresjoner og
  kontroller som skiller korrekt rollebruk fra tvetydig uttrekksgrunnlag.
- `docs/customer-price-preservation-audit.md`: denne rapporten.

De nye testene dekker kombinert avtale/vilkår med kunderolle; separate roller
i samme/forskjellige PDF-er; terms-only; to reelle objekter med vilkår;
rekkefølge, begge sider og batchdeling; `kr`/`kr.`; kundekonsolidering;
reelt manglende kundepris; ukjent rolle/uten ID; Hus; manuell registrering;
og blokkering av generiske priseksempler selv med sikker ID.

## Validering

| Kontroll | Resultat |
| --- | --- |
| Eksisterende fokusgruppe før nye tester | 227/227 |
| Nye tester | 22/22 |
| Samlet fokusgruppe | 249/249 |
| Hele testsuiten | 1412/1412; baseline 1390 |
| Eksisterende supporting-terms-/UI-regresjoner | 46/46 |
| Eksisterende pris-tegnsettingsregresjoner | 16/16 |
| Totalskadeuttrekk/-presentasjon og same-object consolidation | Bestått i fokusgruppen |
| TypeScript, `npx tsc --noEmit` | Bestått |
| ESLint, `npm run lint` | Bestått |
| `npx next build --webpack` | Bestått |
| Syntetisk HTTP/PDF-runtime | PASS |
| `git diff --check`, også separat kontroll av de to nye filene | Bestått |

HTTP/PDF-kontrollen bruker eksisterende runtime-skript, syntetiske PDF-er og
lokal AI-stub. Første oppstart ble blokkert av sandboxens `listen EPERM` på
127.0.0.1. Etter godkjent lokal portbinding bestod kontrollen. Ingen ekte
AI-tjeneste eller Railway-variabel ble brukt/endret av testen. Dette er
regresjonsvalidering av uendret produksjonskode, ikke bevis på en løst
produksjonsfeil.

## Minimal observability for én ny produksjonskjøring

Eksisterende trace har allerede request-/post-/dokumentreferanser, eksplisitte
canonical key sets ved validert extraction, normalisering, konsolidering,
effective facts, klientmottak og prisbidrag. Den mangler `documentRole` og
en eksplisitt observasjon av kunde-/støttebeslutningen. Å slå på eksisterende
flagget alene kan vise nøkkeltilstedeværelse, men vil ikke fullt dokumentere
rolleårsaken.

Foreslått minste utvidelse, **ikke implementert eller aktivert her**:

1. Ved validert extraction: behold eksisterende request-lokale `object_N`,
   `doc_N`, `batch_N`, side og ID-present/invalid-booleans. Legg til
   `documentRole` som lukket enum. For hver av de tre prisnøklene skill mellom
   `keyPresent` og `valuePresent`; en nøkkel med «Ikke dokumentert» er ikke en
   dokumentert pris. Registrer bare boolean for `annualPremiumPresent`.
2. Ved den faktiske grenen i `enrichBatch`: observer
   `customerObjectEligible`, destinasjon `customer`/`supporting` og en lukket
   reason code, for eksempel `CUSTOMER_RECORD_RETAINED` eller
   `GENERAL_TERMS_RETAINED_AS_SUPPORT`. Bruk samme postreferanse og prisbooleans.
3. Ved støttevedlegget: observer kunde-/støttepostreferansene og kun de tre
   prisnøklenes tilstedeværelse før/etter; en blokkert generisk pris kan ha
   reason code `CUSTOMER_PRICE_FROM_SUPPORT_BLOCKED`. Registrer også en
   manglende sikker scopematch som lukket reason, uten produkt-/kildetekst.
4. Gjenbruk eksisterende normaliserings-, konsoliderings-, slutt-/klient- og
   prisbidragseventer. Bind de samme referansene, slik at et faktisk tap kan
   plasseres mellom to observerte trinn. Ikke gjør ny matching for telemetry.

Viktig begrensning: Manglende eksplisitt canonical key i extraction betyr ikke
at råteksten manglet pris. Nøklene kan også etableres fra eksisterende etikett-
normalisering. Vurder derfor både rå key presence og eksisterende
normaliseringseventer. Eventuelle ikke-kanoniske pristitler må ikke logges.

Utvidelsene må inn i den eksisterende strenge trace-whitelisten, med tester for
avvisning av vilkårlige strenger/felt. Ingen verdier, priser, identifikatorer,
filnavn, fritekst, PDF-/modelltekst, prompts eller kildeutdrag skal logges.
Samme tilfeldige trace-ID skal binde `ANALYSIS_METRICS`, servertrace og faktisk
client receipt. Krev komplett trace med null droppede events/observerfeil.

Etter særskilt godkjent utrulling av denne diagnostikken kan
`PILOT_TRACE_ENABLED=true` aktiveres for én manuell 2+2-kjøring og slås av igjen
etterpå. Ingen slik aktivering, deploy eller Railway-endring er utført nå.

## Avgrensning

Ingen nye AI-kall, modellendringer, produksjonslogger eller kundedatatester.
OBJECT_ROLE, supporting-terms-arkitekturen, `kr.`-parseren, totalskade,
Maskinskade, kildeautoritet, kataloger, matching og konsolidering er urørt.
`.env.local` og Railway er urørt. Ingen commit eller push.
