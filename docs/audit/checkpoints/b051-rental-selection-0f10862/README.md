# Dokumentbasert Utleie – avgrenset validert bolk

Basis/fersk main: `0f1086206e9aa713681d84ebe55766196e1a7609`.
Utviklingsbranch: `fix/document-rental-choice`. Commit/push er eksplisitt autorisert;
publisert status gjelder når den inneholdende committen er verifisert på remote main.
[Publiseringsfullmakt](publication-authorization.md), [preflight](publication-preflight.json)
og [publiseringsintegritet](publication-integrity.json). Ingen installasjon eller deploy.
Opprinnelig segl og alle 47 opprinnelige filhasher er kontrollert og bevart i
preflight før metadataendringene. Det nye seglet utelater bare seg selv og
publication-integrity.json. Opprinnelig integrity-verification.json og
candidate-identity.json beskriver den tidligere lokale valideringen og beholdes uendret.

[Fullmakt](authorization.md), [kilde-/kontraktpreflight](source-and-contract-preflight.json),
[receipt](completion-receipt-rental-document-selection.json),
[validering](validation-summary.json), [checkpoint](checkpoint.json).

Bare de to ordinære Gjensidige-husproduktenes dokumentbaserte Utleie-valg omfattes.
Valgt eller strukturert avtalt tillegg uten motsatt/ukjent parentstatus aktiverer.
Avslag, konflikt, ukjent og rent beskrivende dokumenter aktiverer ikke. Lokale
valgoverskrifter krever dokumentert Utleie-kontekst. Generelle vilkår kan aldri
opprette kundevalg. Ingen ny canonical parent/enum, global alias eller kildeopptak.

Kildebinding skjer før konsolidering. Fem eksisterende detaljidentiteter,
komplette kilder og dokumentprioritet (inkludert ukjent detalj) beholdes på repeat
og JSON. De fem katalogdetaljenes opprinnelse, egenandel override og eksisterende
noter er bevart. Valg er ikke bevis på at alle erstatningsvilkår er oppfylt.
Priser, generell egenandel, base leietap, manuelle bevis og andre valg er uendret.

Før-baseline er `baseline.v8.gz`, bundet til SHA i [baseline-identity.json](baseline-identity.json).
Den ble tatt på ren basis før kodeendring: 202 andre manuelle produkter, seks
ikke-Utleie-kontroller og seks manuelle Utleie-kombinasjoner; 144 opprinnelige
fullstendige dokumentforløp fra den uforanderlige forrige bevispakken.
Kontrollene sammenligner hele resultatet og tilleggsvisningen. Dokumentenes
forventede endringer bygges av rå input og de frosne, allerede publiserte fem
manuelle katalogradene/faktaene. Forventningene genereres ikke av kandidaten.

[Testendringer og mekaniske rettinger](test-contract-updates.json) skiller den
uttrykkelig godkjente dokumentkontrakten fra nye test-/runner-rettinger.
Ingen tester er hoppet over. Tidlige FAIL og eldre PASS beholdes med sine egne
filhasher i [gate-results.json](gate-results.json); kun sluttetikettene i
`validation-summary.json` validerer sluttkandidaten. Testmanifestet inneholder
alle 164 testfilene. Runneren bruker installert Node/Next/Poppler uten installasjon.
HTTP/PDF-kontrollen kjører lokalt med syntetiske dokumenter og modellmock.

[Kandidatidentitet](candidate-identity.json), [main-kontroll](main-verification.json),
[beskyttet status](protected-status-verification.json),
[integritet](integrity-verification.json) og [checksums](SHA256SUMS).
Forrige pakke kontrolleres byte for byte gjennom [manifestet](prior-packet-integrity.json).
Begge original-PDF-er og serialisert katalog er kontrollert uendret.

B-051 37/0/1/1, kampanje 63, globalt UKJENT, P2 0, REMEDIATION_REQUIRED.
HTU og alle andre HOLD, inkl. fysisk insektegenandel, er beholdt.
Sikkerhet/GDPR/P3-A05, person/pilotscope, kritisk UX, feedback og rådgiveraksept
står fortsatt synlige i checkpoint. NITO og Sentralbord venter.
