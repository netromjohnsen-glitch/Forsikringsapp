# Katalogopprinnelse ved gjentatt beriking – validert bolk

Testet basis/fersk main: `257a197aa016ba3c9567eeb4cebc8182d5e0aba5`.
Utviklingsbranch: `fix/house-catalog-origin`. Commit og push er eksplisitt autorisert.
Publisert status gjelder etter bekreftelse av inneholdende commit på remote main.
Ingen installasjon eller deploy.
[Publiseringsfullmakt](publication-authorization.md), [preflight](publication-preflight.json)
og [publiseringsintegritet](publication-integrity.json).

[Fullmakt](authorization.md), [kilde-/kontraktpreflight](source-and-contract-preflight.json),
[receipt](completion-receipt-house-catalog-origin.json), [validering](validation-summary.json),
[kandidatidentitet](candidate-identity.json), [checkpoint](checkpoint.json).

Kun `lib/catalog-enrichment.ts` endrer produksjonsatferd. Eksakt scope er Gjensidige
Hus Standard og Hus Pluss, bolig / ordinary / Alminnelige vilkår. Ved gjentatt
beriking normaliseres bare dokumentlaget. Gjeldende kataloggrunnlag beregnes fra
produkt og gyldige valg. Det beholder katalogopprinnelse, nøkkel/verdi, komplette
kilder, strukturdata, egenandelsklassifisering, availability og overriddenBase.

Komplette tidligere presentasjonsnoter gjenbrukes bare med samme faktumverdi,
primærkilde og hele registrerte kildesett, inklusive kvalifikasjonsnoter. Nye eller
fjernede registrerte kvalifikasjonsnoter og endrede kildehenvisninger fornyes;
gamle katalograder kan ikke gjenopprette et ugyldig tilleggsvalg.

Kundeverdier har samme forrang når de foreligger først eller kommer senere.
Gjeldende ukjent-fallback videreføres som katalogopplysning. Støttevilkår fra
opplastede general_terms holdes utenfor dokumentnormalisering, med komplette
kilder/evidens og uten bekreftelse av kundevalg. Manuelle og dokumentbaserte
Smart/Utleie/råte-regler, Rettshjelp, priser og generell egenandel beholdes.
Ingen global normalizer, coverage engine, schema, alias, admission eller matching endres.
Eksisterende feilmerkede lagrede dokumentrader omklassifiseres ikke med kildeheuristikker;
bolken forhindrer ny konvertering fra korrekt katalogopprinnelse.

[Før-baseline](baseline-identity.json) binder `baseline.v8.gz` til ren basis før
produksjonsendring: 214 manuelle initial-/repeat-/visningsresultater og 144 faktiske
PDF-forløp. Alle første manuelle/PDF-resultater i inventaret er uendret. 202 andre manuelle
produkter har identisk repeat-resultat. På de to målproduktene kontrolleres den
eksakte repeat-differansen mot frosne før-data: uendret key/name/value/source/sources-
multiset, gjenopprettet full førstegangsmetadata og registrert resolverrekkefølge.
Helperen bruker ingen kandidatgenerert fasit.

[Testkontrakt og rettingslogg](test-contract-updates.json) dokumenterer også de
49 eldre assertions som krevde den feilaktige konverteringen til document og tap
av metadata. Bare aktive forventninger oppdateres; kildeorakler, reelle dokument-
grener, avslag/konflikt/ukjent og alle testsaker beholdes. Historiske auditbytes
endres ikke. Tidlige FAIL/PASS beholdes med egen filidentitet i
[gate-results.json](gate-results.json); bare sluttetikettene i valideringen gjelder.

[Testmanifest](test-manifest.json), [main-kontroll](main-verification.json),
[beskyttet status](protected-status-verification.json), [integritet](integrity-verification.json)
og [checksums](SHA256SUMS). [Forrige pakke](prior-packet-integrity.json) verifiseres
byte for byte; begge registrerte original-PDF-er og serialisert katalog er uendret.
HTTP/PDF-runtime kjøres lokalt med syntetiske dokumenter og modellmock.

Alle HOLD, inkl. HTU og fysisk insektegenandel, beholdes. B-051 37/0/1/1,
kampanje 63, globalt UNKNOWN, P2-kreditt 0, originalsignatur-kreditt 0 og
REMEDIATION_REQUIRED beholdes. Sikkerhet/GDPR/P3-A05, person/pilotscope, kritisk UX,
feedback og rådgiveraksept står synlige i checkpoint. NITO og Sentralbord venter.
Ingen ny arbeidsstrøm. Publiseringsfullmakten gjelder bare denne validerte bolken.
Opprinnelig kandidatidentitet og integritetsrapport beskriver lokal validering og
bevares uendret. Publiseringspreflight bevarer opprinnelige hasher; ny seal dekker
alle pakkefiler unntatt SHA256SUMS og publication-integrity.json (unngår hashsyklus).
