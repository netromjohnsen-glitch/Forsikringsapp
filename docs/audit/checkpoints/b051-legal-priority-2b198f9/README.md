# Rettshjelp: produktbundet dokumentprioritet

Validert på main `2b198f9ebf52aa283056b3a052edf0fa0cdd311f`.
[Commit og push er eksplisitt autorisert](publication-authorization.md);
rettelsen, receipt og prosjektstatus er publisert når denne committen er
verifisert på remote main. Ingen installasjon eller deployhandling.
[Fullmakt](authorization.md), [main-kontroll](main-verification.json),
[receipt](completion-receipt-legal-document-priority.json),
[checkpoint](checkpoint.json) og [kandidatidentitet](candidate-identity.json).

## Resultat og avgrensning

Bare Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår.
Faktisk uttrekk av Rettshjelp kobles til eksisterende `hus.rettshjelp.dekning`.
Dokumentavslag/konflikt stopper katalogens påstand og tilhørende detaljer;
kundeverdier, kildebevis og separate supporting terms beholdes.
Gjentatt beriking beholder én dekning. Rettshjelp er basisdekning i disse
produktene og vises ikke som et valgt tillegg; rå addOn-bevis beholdes.
Ingen global alias, objektmatching, katalog-, kilde- eller HTU-endring.

[Baseline-reproduksjon](baseline-reproduction.json),
[sluttobservasjoner fra faktisk dokumentpipeline](pipeline-observations-publishable.json),
[permanent test](../../../../tests/remediation-b-051-legal-priority.test.mjs)
og [kundefeilens status](legal-customer-findings.json).
Historiske metadataoverganger er ikke generelt refaktorert eller erklært lukket.

## Kontrollgrunnlag

[Validering](validation-summary.json): 72/72 målrettede og 5592/5592 fullsuite,
160 filer, uten skip. Typegen/TypeScript, webpack-bygg, lokal syntetisk
HTTP/PDF-runtime 22/22 PASS. ESLint 0 feil / 27 identiske warnings.
Katalogens serialiserte identitet og 202 øvrige produkters kontrollerte
berikingsresultater er identiske med [baseline](baseline-identity.json).
Dette er presis isolasjonskontroll av de registrerte inputene, ikke en påstand
om at alle mulige kundeinput er uttømmende testet.

[Eksakte gater/kommandoer/hashes](gate-results.json),
[runner-parametere](runner-parameters.json), [160-filmanifest](test-manifest.json)
og [bevarte feilforsøk](failed-attempts.json).
Sluttgater er eksakt de syv etikettene i validation-summary.json.
`fullsuite-publishable` kjørte feilaktig bare første fil og gir ingen fullsuite-kreditt;
den er erstattet av `fullsuite-verified` med eksplisitt `--test` og 5592 PASS.
Ingen feil er gitt unntak. Tidligere tester som forventet den kjente duplikatfeilen,
er oppdatert til den autoriserte kontrakten med negative kontroller bevart;
[testkontrakter og mekaniske rettinger](test-contract-updates.json).

## Publiseringskontroller

[Preflight](publication-preflight.json) bekrefter fersk main, opprinnelig pakkesegl,
uendrede produksjons-/testbytes og gjeldende gater.
[Eksakt filmanifest](publish-files.json) brukes av sikret eksisterende publisher.
[Publiseringsintegritet](publication-integrity.json) dokumenterer de avgrensede
metadataendringene og det nye seglet. candidate-identity.json, validation-summary.json
og integrity-verification.json er beholdte snapshots fra den lokale valideringen;
gjeldende publiseringsstatus føres i receipt/checkpoint.

## HOLD og regnskap

HTU `157c7afed18eb0fe / SC-019/SR-033` står på HOLD. Insektsunntakets
anvendelse `8a89196fecd29ddb`, Smart-kundemodus, SC-020/SR-032,
SC-035/SR-031, B-071-holdet og øvrige HOLD er uendret.
63 dokumenterte kampanjesignaturer og B-051 37/0/1/1 er uendret;
dette er en kundefeilretting uten ekstra originalsignatur- eller P2-kreditt.
Global resolved/open UNKNOWN; CATALOG_PILOT_GATE REMEDIATION_REQUIRED.
NITO og Sentralbord venter. Ingen ny arbeidsstrøm er startet.

Historiske pakker er uendret, inkludert [forrige pakkeintegritet](prior-packet-integrity.json).
[SHA256SUMS](SHA256SUMS) dekker denne bevispakken, unntatt selve checksumfilen
og integrity-verification.json (opprinnelig validering) samt publication-integrity.json
(etterfølgende kontroll av seglet).
