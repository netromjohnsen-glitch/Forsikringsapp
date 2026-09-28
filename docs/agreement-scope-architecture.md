# Agreement scope: arkitektur og migrasjonsplan

Arbeidsgrunnlag: `7cd47a5` (`Improve manual product selection and annual mileage`).
Ingen nye medlemsprodukter, forsikringsfacts eller offentlige kilder er lagt inn.

## Bekreftet opprinnelig modell

- `CatalogProduct` hadde selskap, `providerId`, `insuranceType`, `productId`,
  `version`, komponenter og eventuell produktarv. Ingen generell avtaleidentitet.
- `findCatalogProduct` brukte provider + produkt-ID + versjon og første treff.
  Navneoppslag brukte eksakt normalisert selskap/type/produktnavn; flere treff
  ga ingen match. Provider-aliaser var eksplisitte.
- Manuell dropdown filtrerte på selskap/type. Dens interne valgverdi inneholdt
  provider/produkt/versjon, men ingen avtale eller forsikringstype.
- `distributionChannel` lå på manuell avtale, enkelte tillegg og kildemetadata.
  Det var ikke en generell dimensjon i produktidentitet, produktlookup eller
  kildeanvendelighet.
- Fremtind-kanaler bruker allerede forskjellige provider-ID-er:
  `fremtind`, `sparebank1-fremtind`, `dnb-fremtind`, `eika-fremtind` og
  `fremtind-eika-legacy`. Dette er bevart i denne oppgaven.

## Modell og grenser

Det nye begrepet er `agreementScope`. Det er katalogens avtale-ID, ikke
kundemedlemskap og ikke et nytt forsikringsselskap. Det kan representere
ordinær avtale, medlemsavtale, gruppeavtale eller distribusjonsavtale.

```ts
type AgreementScopeId = string;
type AgreementScopeDefinition = {
  id: AgreementScopeId;
  providerId: string;
  name: string;
};
```

Et scope er en eksakt, registrert ID under provider. Ekstern input valideres mot
`ProductCatalog.agreementScopes`; format alene godtar ikke en ID. `ordinary`
er den reserverte kompatibilitetsverdien. Store bokstaver, stavevarianter,
kundetekst, medlemsnummer og andre uregistrerte verdier avvises. Ingen fuzzy
matching. Registeret inneholder kun betrodde katalog-ID-er og visningsnavn.

Canonical produktidentitet er en serialisert tuple:

```text
[providerId, canonicalInsuranceType, agreementScope, productId, version]
```

Scope og versjon er uavhengige. Ingen versjon velges etter sortering, nyeste
tekst eller rekkefølge. Navneoppslag med to aktuelle versjoner er uavklart;
eksplisitt referanse kan velge den eksakte versjonen. Produktarv må være innen
samme provider, type, scope og versjon.

**Viktig forskjell:** fravær/null på gammel katalogmetadata betyr `ordinary`.
Fravær/null i en kundeforespørsel betyr ukjent. Ved navn/dropdown filtreres
provider/type først. Hvis flere scopes finnes, gir ukjent scope tom kandidatliste,
også hvis et produktnavn bare finnes i ett av disse scopene. Med ett scope og
entydig produkt beholdes eksisterende identifikasjon. ID-oppslag krever ett
entydig treff innen oppgitte dimensjoner; gjenbruk av ID på flere typer/scopes
krever ytterligere scope/type. Ingen tilfeldig første match.

Et kundedokument er fortsatt autoritativt over den anvendelige katalogen.
Valgfrie tillegg blir ikke valgt av katalogtilgjengelighet. Eksplisitt avslag
bevares. Ukjent produkt/scope kan fremdeles sammenlignes med dokumentfacts alene.

## Dataflyt og presentasjon

- Optional `agreementScope` finnes på katalogprodukt, tillegg, kilde,
  kildehenvisning, manuell produktinput, extraction-record, sammenligningsprodukt,
  konsolidert record-evidence og betinget presentasjonsmetadata.
- `CatalogProductReference` utvides med optional `insuranceType` og
  `agreementScope`. Gamle ordinære referanser med tre felt beholdes. Nye
  eksplisitt scoped katalogprodukter gir referanser med type og scope.
- PDF-valideringen kan motta null eller et registrert provider-scope. Dagens
  extraction-prompt og output-schema er uendret fordi produksjonsregisteret
  ikke har medlemsavtaler. Når slike registreres, legges én nullable enum til
  samme extraction-kall, med krav om uttrykkelig dokumentert avtale. Ingen
  ekstra AI-kall eller modellendring.
- Det finnes en katalogstyrt, native select med label «Avtale / medlemsavtale».
  Den er skjult når provider/type bare har ordinære produkter. Unknown er et
  eget valg. Produkter og tillegg fra andre scopes er ikke valgbare.
- Scopebytte tømmer gammel katalogreferanse og tillegg. Eksplisitt custom
  produktnavn bevares, uten automatisk enrichment. Årlig kjørelengde for Bil
  og separate manuelle produkter beholder tidligere logikk.
- Visningsnavnet på forsikringsgiver er fortsatt provider, eksempelvis Tryg.
  Registrert avtalenavn kan vises separat. Ordinære produkter får ingen ekstra
  avtalerad. Katalogbaserte betingede fordeler har samme scopegrense.

## Kilder, tillegg og supporting terms

Scope er et ekstra applicability-filter før eksisterende autoritets-, dato-,
produkt- og versjonsregler. Det erstatter ingen av disse reglene. Også legacy
kilder må passere scopegrensen. En umerket ordinær kilde er ikke universell.
Kilderegister og eksplisitt inline scope kan ikke motsi hverandre. Eventuell
`qualificationSource` må også passe avtalen. Cross-scope `replacesBase` filtreres
bort før det kan fjerne en korrekt basefact.

Tillegg velges gjennom samme eksisterende mekanisme, med provider/type/nivå,
gyldighet og eldre `distributionChannel`-krav bevart. I tillegg må avtalescope
på tillegg og eventuell komponentkilde passe produktet. Katalogevidence som
eksponeres i manuell flyt filtreres ved samme scopegrense.

Supporting terms krever kompatibel provider, type, produkt og avtale, i tillegg
til eksisterende side-/objekt-/periodekrav. Ukjent avtale med flere muligheter
kan ikke omgå dette med et identisk fritekstproduktnavn. Uavklarte katalogversjoner
kan heller ikke falle tilbake til rått produktnavn. Ikke-tilknyttede kilder beholdes
som supporting evidence; de blir ikke kundeobjekter. Prissperrer er uendret.

Scope er **ikke** objektidentitet. To biler med samme medlemsprodukt er to objekter.
Et sikkert identifisert objekt kan sammenlignes på tvers av avtaler/provider.
Motstridende avtaler på samme side hindrer derimot at produktfacts slås sammen.
Dette bruker eksisterende konservative `product_conflict`, uten ny telemetri.
Originale source IDs, kildehenvisninger, dokumentroller og record-evidence bevares.

## Migrasjonsplan

### A. Ingen migrering nødvendig nå

Alle 121 eksisterende produkter, deres facts, originalkilder, manifest og hashes
beholdes. Ingen katalogfil per selskap må masseoppdateres. Manglende scope på
disse katalogpostene har ordinær kompatibilitetsbetydning innen deres eksisterende
provider-ID. Dette er ikke en påstand om at Fremtind-kanalenes vilkår er identiske.

### B. Mulig senere Fremtind-migrering

Etter separat kildeverifisering kan `sparebank1-fremtind`, `dnb-fremtind` og
`eika-fremtind` representeres som provider `fremtind` med eksplisitte kanal-scopes.
Migrer da samlet: provider-aliaser, produktreferanser, komponentarv, kilde- og
tilleggsscope, presentasjonsmetadata og regresjonsfixtures. Gamle referanser
trenger eksplisitt migreringsmapping; ikke slå sammen ved felles forsikringsgiver.
Eksisterende `distributionChannel` må mappes deterministisk og først fjernes når
alle berørte callers/data er migrert. Ingenting av dette er utført her.

Historisk Eika Reise er fortsatt merket som historisk og har separat legacy-ID,
men kan fortsatt stå i samme produktliste. Current/historical er produktlivsløp,
ikke medlemsavtale. Skjuling/valg av historiske produkter er en separat oppgave;
denne endringen innfører ikke et lifecycle-system.

### C. Utvidede lookup-signaturer

Gamle argumenter er beholdt; nye er optional:

```ts
findCatalogProduct(providerId, productId, version, { insuranceType?, agreementScope? }?, catalog?)
findCatalogProductBySelection(company, type, name, agreementScope?, catalog?)
catalogProductMatchesSelection(product, company, type, name, agreementScope?, catalog?)
catalogProductsForSelection(catalog, company, type, agreementScope?)
productSuggestions(catalog, company, type, agreementScope?)
manualProductOptions(company, type, catalog?, agreementScope?)
```

Resolve/enrichment/valideringsfunksjoner tillater også injisert katalog for
isolerte arkitekturtester. Produksjonscallers bruker fortsatt standardkatalogen.

### D. Optional strukturer

Se listen under dataflyt. `agreementScopes` er et optional katalogregister.
Objektidentifikatorer og identitetsstrategier får **ikke** agreementScope.
Scope sendes heller ikke som nytt felt i trace/progress/semantic audit.

### E. Gamle callers

Eksisterende ID-referanser, navneoppslag, manual/PDF, dropdown, tillegg og
komponentresolver fortsetter å virke uten nytt input når lookup er entydig.
Den gamle standalone-produktpredikaten støttes også, med ny ambiguity-kontroll.
Feil manuell type/provider-referanse avvises fortsatt; custom-fallback kan ikke
ta med en foreldet katalogreferanse.

## Fremtidige medlemsprodukter: kun foreslått struktur

Dette er dokumentasjon av formen, **ikke** nye produktdata. Navn, nivå, versjon,
kilder og facts må hentes fra autoritative kilder i en senere oppgave. Ingen av
disse ID-ene er registrert i produksjonskatalogen nå.

```ts
const futureAgreementScopes: AgreementScopeDefinition[] = [
  { providerId: "tryg", id: "nito", name: "NITO" },
  { providerId: "tryg", id: "utdanningsforbundet", name: "Utdanningsforbundet" },
];

const futureNitoBil: CatalogProduct = {
  company: "Tryg", providerId: "tryg", insuranceType: "Bil", agreementScope: "nito",
  productId: "tryg-nito-bil-<dokumentert-nivaa>", name: "<dokumentert produktnavn>",
  version: "<dokumentert versjon>", componentIds: ["tryg-nito-bil-<versjon>-terms"],
};
const futureNitoHus: CatalogProduct = {
  company: "Tryg", providerId: "tryg", insuranceType: "Hus", agreementScope: "nito",
  productId: "tryg-nito-hus-<dokumentert-nivaa>", name: "<dokumentert produktnavn>",
  version: "<dokumentert versjon>", componentIds: ["tryg-nito-hus-<versjon>-terms"],
};
const futureUtdanningsforbundet: CatalogProduct = {
  company: "Tryg", providerId: "tryg", insuranceType: "<dokumentert forsikringstype>",
  agreementScope: "utdanningsforbundet",
  productId: "tryg-utdanningsforbundet-<type>-<nivaa>", name: "<dokumentert produktnavn>",
  version: "<dokumentert versjon>", componentIds: ["tryg-utdanningsforbundet-<type>-<versjon>-terms"],
};
```

Tilhørende `CatalogSource` må ha riktig `agreementScope`, `providerId`,
`insuranceType`, dokumentnummer, gyldighet/versjon, produkt-ID-er og verifisert
original/hash. `CatalogFact.source.documentId` refererer denne kilden; inline
`agreementScope` kan gjenta samme scope. Medlemstillegg får samme eksplisitte scope.
Kilde-/komponentnøkler må fortsatt være globalt unike i dagens record-baserte
kataloglagring. Del bare facts etter dokumentert anvendelighet, ikke fordi navn
eller forsikringsgiver er like. Ingen verdier er foreslått her.

## Avgrensninger og validering

Syntetiske avtaletester dekker Tryg og If, same-name produkter, uavklart scope,
versjoner, arv, kilde-/tilleggsisolasjon, document > catalog, supporting terms,
manual/custom, personvern og flere objekter. En eksplisitt kontroll slår opp alle
121 eksisterende produkter og sammenligner implicit/explicit ordinary facts.
Eksisterende render-test får den nye avtalevisningshjelperen injisert; assertions
er beholdt. Full suite og produksjonsruntime kjøres før ferdigrapporten.

Validering gjennomført 2026-09-28:

| Kontroll | Resultat |
| --- | --- |
| Nye fokuserte avtalescope-tester | 55/55 |
| Målrettet katalog/manual/kilde/tillegg/supporting/objekt/presentasjonsgruppe | 882/882 |
| `node --test tests/*.test.mjs` | 1526/1526, alle 1471 eksisterende inkludert |
| `npx tsc --noEmit` | Bestått |
| `npm run lint` | Bestått |
| `npx next build --webpack` | Bestått |
| `git diff --check` | Bestått |
| `node scripts/verify-analysis-http.mjs` | PASS |

Runtime-scriptet ble først blokkert av sandboxens loopback-sperre (`listen EPERM`)
og bestod med nødvendig tilgang til lokal port. Det kontrollerte blant annet
manual/katalog, syntetisk PDF, 10+10-dokumentflyt, syv objektpar, supporting terms,
porteføljepris, provenance, personvern, kapasitet og feilrespons uten nye AI-kall.
Eksisterende Node-varsel om manglende eksplisitt module-type i package.json er
uendret og førte ikke til feil.

Ingen synlig UI-endring med dagens katalogdata: ny selector og avtalerad er skjult.
Eksisterende render-/manualtester er grønne; separat desktop/390 px-inspeksjon ble
derfor ikke kjørt, i tråd med oppgavens betingelse om synlige UI-endringer.

Ingen nye produksjonsprodukter, katalogfacts, kilder, AI-kall, medlemsdata eller
personopplysninger. Ingen endring i `.env.local` eller Railway. Production tracing
beholdes OFF; eksisterende syntetisk runtime-script bruker kun isolert lokal
testtracing og mock OpenAI. Ingen commit/push/reset/revert/stash.
