# Neste større bolk: Behandling — NOT_AUTHORIZED

Read-only forslag etter fullført Liv-bolk. Ingen produksjonsadmission eller implementering
aktiveres av dette dokumentet. [Aktuelt checkpoint](../audit/checkpoints/development-agent-ef5b0bc/checkpoint.json)
viser åtte dokumenterte kampanjesignaturer; globalt resolved/open er UKJENT.

## Eksakt scope

| Signatur | Binding | Kildeavsnitt | Foreslått dimensjon |
| --- | --- | --- | --- |
| 4165f79344a7d572 | GAP-2868/SF-4017 | PDF 2 / trykt 6 | Veterinær: valgt årssum er også tak per skadetilfelle; årsreset gir ikke nytt tak for samme sykdom. |
| fbe23495ae09afb3 | GAP-2875/SF-4025 | PDF 2 / trykt 6 | Bandasje/beskyttelse og foreskrevne medisiner/preparater som ledd i dekket sykdom/ulykke, journal/attest og innen valgt sum. |
| 48393aac0a200fe5 | GAP-2880/SF-4031 | PDF 1–2 / trykt 5–6, produktets tann-FAQ | Karies/emaljedefekter, årlig kontroll og rens ved behov; presise tannunntak og abscess ved avskalling/fraktur. |
| c5ccc4f26fd475ae | GAP-2907/SF-4060 | PDF 3 / trykt 7 | Samme sykdom/ulykke og alle utgifter; oppdagelsestid; friskt dyr og kronisk behandling siste 12 måneder/diagnose uten symptomer. |

Fire uavhengige materielle kontrakter; samme kilde/RC-026 gjør dem ikke til én rot.
Kun Gjensidige Hund Behandling, ordinary, ukjent vilkårsversjon. Ikke Liv/Bruk eller Katt.

## Kilde og nødvendig beslutning

Frossen Behandling-kilde er hashverifisert på Liv-bolkens sluttgate og tidligere read-only
kildegjennomgang: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf,
SHA-256 8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6.
PDF-sidene er lagret reproduserbart i [source-review.json](../audit/checkpoints/development-agent-ef5b0bc/source-review.json).
Produktets tann-FAQ: catalog/sources/boat-pet/gjensidige-dog-product.html,
SHA-256 fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58.

PDF-en er auditkilde, ikke produksjonsregistrert. Minste beslutning er eksplisitt å godkjenne:

- Snever admission av akkurat disse bytes som boat-pet:gjensidige:hund:treatment,
  sourceType full_terms, provider gjensidige, insuranceType Hund, scope ordinary,
  version/effectiveFrom tomme (ukjent), termsNumber/tittel «Hund Behandling og Rehabilitering»
  etter dokumenttittel/nettsidens lenkekontrakt. URL fra frossent manifest; innhentingsdato
  skal ikke gjøres til vilkårsversjon. Ingen kildeinnhenting eller endring av originalen.
- Den nøyaktige fire-signaturbolken ovenfor, tilhørende katalog/test/receipt/checkpoint,
  komplett sluttgate og atomisk commit/push etter PASS.
- R-050-SOURCE skal da verifisere eksakt registrert full_terms-identitet/hash/type/scope,
  fremfor den tidligere korrekte ikke-admission-forventningen. Endringen er del av den
  nye admissionbeslutningen, ikke en mekanisk «grønn test»-retting under gammel fullmakt.
- Definisjoner/periodetak skal kvalifisere Veterinær gjennom eksisterende begrensnings-/
  detaljstruktur, ikke flytte inn i sum.valgbar og endre sumvalgidentiteten. Bekreft faktisk
  kontrakt før kode; stopp hvis dette krever ny mapping/selection/shared-endring.

Admission betyr ikke at rehabilitering/SC-035 er avklart. Ingen nye rehabiliterings-/
diagnostikkfakta, modalitetsvalg eller kundesum inngår. Bevar alle øvrige gyldige fakta.

## Filer, gater og budsjetter

Planlagte filer: lib/boat-pet-catalog.ts (kilderegister + avgrensede Behandling-rader),
tests/remediation-b-050.test.mjs og nye audit/receipt/checkpoint-artefakter. Eventuelle
øvrige kildeallowlist-tester må preflightes og bare endres under nøyaktig godkjent kontrakt.
Ingen schema/registerfamilie/engine/selectionendring foreslås.

Eksisterende nøkler: dyr.veterinar.dekning/begrensning, dyr.medisin.dekning,
dyr.tannsykdom.dekning/begrensning. Ingen ny canonical nøkkel foreslås. Summer forblir
kundebevisets; 20/30/40/50-valgene og dokumentert 27 000 kr bevares.

Gater: originalavsnitt/hash og faktumvis provenance, source→catalog/reverse-audit,
alle kvalifikasjoner/egenandel uendret, år vs skadetilfelle, positive og negative tannregler,
medisin/journal, friskt-dyr/oppdagelsestid, available != selected, dokumentprioritet,
produkt/kunde/manuell modus, samme produkt/begge retninger, provider/Katt-isolasjon;
B-050/B-022/B-018/B-071, de åtte receipts/shared-fixer, Liv-guard/supporting-terms,
alle remedieringsgater og fullsuite, next typegen/TypeScript, ESLint, webpack production
build, syntetisk HTTP/PDF-runtime og diff/integritet.

Budsjett før foreslått start: kampanje 6/12, forrige fullførte Liv-bolk 2/3.
Foreslått ny mekanisk scopegrense 3, innen samlet 12; planlagt korreksjonsforbruk 0.
Korrekt godkjent kildeimplementering/admission og nye assertions føres som scopearbeid,
ikke skjulte mekaniske røtter. Faktiske harnessfeil føres etter uavhengig ekvivalensbevis.
Ingen automatisk semantisk korreksjonsfullmakt, ny økning eller historisk budsjettreset.
Historiske 19/16 og 10/8 er uendret og ikke fullt rekonstruert.

Øvrige egenandels-, diagnostikk- og rehabiliteringsbolker forblir NOT_AUTHORIZED.
Ingen videre arbeid starter før en slik konkret beslutning/fullmakt er gitt.
