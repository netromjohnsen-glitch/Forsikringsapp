Gjennomfør den demonstrerte B-050-diagnostikkløsningen. Dette er eksplisitt implementerings-, validerings-, receipt-, commit- og pushfullmakt for scopet nedenfor.

Les AGENTS.md, arbeidsflyt, checkpoint og kampanjepolicy. Verifiser fersk HEAD, remote main, arbeidskopi og alle 13 tidligere receipts. Forventet baseline:
df3041ee8488e2ef1e0aff59cfba0d6dc888afd6

AUTORISERT SCOPE

A. Eksakt shared-selection-retting
Legg bare dyr.diagnostikk.grense til eksisterende ikke-assertiv-mekanisme i lib/coverage-fact-semantics.ts.

Jeg godkjenner uttrykkelig:
- Generell diagnostikkgrense alene gir unknown, med bevart verdi og provenance.
- En dokumentert begrensning som henter kataloggrensen skal ikke indirekte etablere selected.
- Fremtind Katt Veterinærs komponentstatus går selected → unknown når statusgrunnlaget bare er denne detaljen.
- Eksisterende eksplisitte parentvalg i Fremtind Hund Veterinær og Topp bevares.
- Eksplisitt valg, avslag og konflikt følger eksisterende resolverprioritet.

Ikke legg til en Fremtind-spesialregel eller en ny parentrad som kompensasjon. Bevar legitim positiv Liv-sum-, Maskinskade-, Leiebil- og allergi-evidence.

B. Konservativ dokumentmapping
Implementer den demonstrerte kontrakten i:
lib/document-fact-normalization.ts
lib/insurance-normalization.ts

Godkjent kontrakt:
- Hele, presise MR/CT-grenseetiketter identifiserer dyr.diagnostikk.grense.
- Hele, presise etiketter for undersøkelse ledd/rygg frem til diagnose identifiserer dyr.diagnostikk.begrensning.
- De eksakte generiske diagnostikketikettene bevares som uavklart fritekst uten bestemt grenidentitet, også gjennom senere normalisering.
- Denne generiske etikettbeskyttelsen omfatter Hund/Katt og skal regresjonsverifiseres.
- Bare innen Gjensidige Hund Behandling, ordinary, kan en entydig grenetikett korrigere en motstridende identitet mellom akkurat disse to diagnostikknøklene.

Bevar øvrige gyldige canonical identiteter. Ingen beløpsmatching, fuzzy matching eller mapping fra generell veterinærtekst. Rå input skal ikke muteres. Gjentatt normalisering skal være stabil.

C. To kildebundne katalogregler
Endre bare de relevante Gjensidige Hund Behandling-faktaene i lib/boat-pet-catalog.ts:

7b2587a3bbc0c772 — GAP-2876/SF-4027
Nøkkel: dyr.diagnostikk.grense
Etikett: MR/CT – grense
Kontrakt: 5 000 kr per år ELLER skadetilfelle, innenfor valgt forsikringssum.
Bevar produktnettsidens registrerte kildeidentitet og avsnitt.

b5792662cc2fa9f8 — GAP-2884/SF-4036
Nøkkel: dyr.diagnostikk.begrensning
Etikett: Undersøkelse ledd/rygg frem til diagnose
Kontrakt: 3 000 kr frem til diagnose, selv om skaden ikke er dekket, med kildebestemt henvisning til summen i forsikringsbeviset.
Bevar Treatment-identiteten, PDF-side 1/trykt 5 og supplerende PDF-side 3/trykt 7.

Verifiser begge frosne kildehasher mot manifestet. Bevar eksisterende IPID-identitet, ukjent versjon og ukjent ikrafttredelse. De to radene skal ha separate presise etiketter slik at enrichment-fallbacken ikke binder generisk tekst til en bestemt gren.

GJENNOMFØRING

Gjennomfør A → B → C med separate diff- og testbevis.
Shared-selection-rettingen skal fullvalideres og commit/pushes separat før den avhengige mapping-/katalogbolken.
Fortsett deretter automatisk med B og C innen denne fullmakten. Ingen ny rutinebekreftelse er nødvendig.

Permanente tester kan tilføyes i:
tests/coverage-status.test.mjs
tests/insurance-normalization.test.mjs
tests/catalog-enrichment-provenance.test.mjs
tests/remediation-b-050.test.mjs

Kjør eksisterende B-071/B-072 og øvrige relevante assertions uendret først. Ingen eksisterende testkontraktsendring er forhåndsgodkjent utover de uttrykkelige semantiske kontraktene i A og B.

REGRESJONSMATRISE

Verifiser gjennom faktisk dokumentpipeline:
- Begge katalogreglene samtidig, med separate kildehenvisninger.
- MR/CT-kundegrense 4 200 kr overstyrer bare MR/CT.
- Ledd-/ryggkundevilkår 2 700 kr overstyrer bare ledd/rygg.
- Begge kundereglene samtidig.
- Presise detaljer uten parentvalg gir unknown.
- Eksplisitt valg, avslag og konflikt.
- Generiske etiketter, også med rå diagnostikknøkkel, overstyrer ingen bestemt gren.
- Motstridende grenetikett/nøkkel håndteres bare i godkjent scope.
- Ultralyd, generell veterinærtekst og generiske undersøkelsesetiketter får ingen grenidentitet.
- general_terms og ukjent dokumentrolle.
- Begge manuelle produktmodi etter deres eksisterende kontrakter.
- Hund/Katt-, produkt- og provider-isolasjon.
- Dokumentprioritet, provenance, samme produkt og begge sammenligningsretninger.
- Produktinformasjon bevares uten å bli kundens selection-evidence.

FULL VALIDERING OG CLOSURE

Følg gjeldende komplette gater:
målrettede tester, B-050, B-018/B-022/B-071/B-072, shared/Liv-guard, supporting terms, provenance/enrichment/comparison, alle remedieringsgater, fullsuite, TypeScript med nødvendig next typegen, ESLint, webpack production build, HTTP/PDF-runtime, kilde-/reverse-audit og repository-/receiptintegritet.

Opprett individuelle completion-receipts for bare de to katalogsignaturene etter komplett PASS. Shared-fixen gir ingen selvstendig signaturkreditt. Oppdater checkpoint og eksakt kampanjesett.

BUDSJETTFULLMAKT

A og B er to særskilt autoriserte semantiske kontraktsendringer:
1. Eksakt ikke-assertiv diagnostikkgrense med dokumentert cross-product-konsekvens.
2. Den beskrevne konservative diagnostikkmappingen og generiske etikettbeskyttelsen.

Registrer dem separat i et nytt, avgrenset semantisk scoperegnskap: maksimalt 2/2 navngitte røtter. Historiske rapporterte 19/16 og 10/8 skal ikke omskrives eller nullstilles. Dette unntaket gjelder ingen nye semantiske funn.

C er rutineimplementering av de godkjente kildefaktaene. Korrekte nye assertions er valideringsarbeid.

Mekanisk kampanjeforbruk er 11/12:
Autoriser maksimalt én ny, dokumentert mekanisk harnessrot for hele denne gjennomføringen, innen kampanjegrensen 12. Bevis semantisk ekvivalens før retting og tell roten én gang. Tidligere next typegen-rot skal ikke telles på nytt.

STOPPGRENSER

Ingen parser-, schema-, canonical register-, source-admission-, resolver- eller enrichment-endring er autorisert.
Ingen generell endring av .grense eller null-fortolkning.
Stopp ved nye semantiske røtter, kildekonflikt, uavklart mappingkonsekvens, integritetsavvik eller overskredet korreksjonsbudsjett. Bevar kandidaten og rapporter den minste konkrete beslutningen.

Rehabilitering og SC-035-holdet er utenfor scope.
Globalt resolved/open-regnskap forblir UKJENT. Ingen rekonstruert global totalsum eller P2-kreditt.

Etter PASS: commit/push de autoriserte endringene og receipts, verifiser remote SHA og ren arbeidskopi. Ingen egen deployhandling er autorisert.

Sluttrapport: eksakte endringer, Fremtind Katt-konsekvens, faktisk kjørte gater, to receipts, separate budsjettføringer, commits, remote- og arbeidskopistatus.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED