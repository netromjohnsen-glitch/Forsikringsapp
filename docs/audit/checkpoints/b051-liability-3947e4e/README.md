# B-051 Ansvar — aktuell completion

Kun **275365b3ec2971df**: GAP-2104/SF-3017 (Hus) og GAP-2163/SF-3104 (Hus Pluss).
[Fullmakt](authorization.md), [eksakte bindinger og filsett](authorization.json),
[kildefasit](source-oracle.json) og [individuell receipt](completion-receipt-275365b3ec2971df.json).
Testet HEAD: `3947e4e90b9ab09ea46dda659a2271d956ae1dd3` med
[eksakt kandidatidentitet](final-candidate-identity.json). Publiseringsrevisjonen er committen
som inneholder pakken, og hevdes ikke å være en annen testet applikasjonsrevisjon.
Receipten blir publisert completion først etter sikret publish.py og verifisert remote main.

Én Standard-rad, hus.ansvar.dekning, inneholder komplett kildebasert ansvar og unntak;
primærhenvisningen er Standard PDF6, «Ansvar – Dekkes / Dekkes ikke». Hus Pluss arver.
Standard PDF6 og Pluss PDF7 er kontrollert separat mot uendrede originale kildebytes.
Byggeforsikringens særregel importeres ikke. Ansvarssum 5 millioner og egenandel 4 000,
produktscope, øvrige kilder og eksisterende selection-/mappingkontrakter er uendret.
[Diff- og fingerprintbevis](catalog-delta.json): én rad, 317 øvrige komponenter,
4158 øvrige råfakta, metadata og 202 øvrige produkters effektive fakta bevart.

Planlagt scopearbeid: tre B-020-fingerprints, én uavhengig kildebasert transformasjon i
[den delte hjelperen](../../../../tests/helpers/b051-liability.mjs), B-050/B-051 reverse-audits
og tidligere B-051-gaters fulle forventninger. Historiske auditverktøy, snapshots, receipts
og bevispakker er uendret. Ingen forventning bygges dynamisk fra produksjonskandidaten.
Baseline i alle ni berørte eksisterende testfiler: 743/743, før produksjonsendringen.

[Ferske sluttgater](validation-summary.json): ny gate 119/119, målrettet 1370/1370 i
26 filer, remediering 2558/2558 i 55 filer og fullsuite 4711/4711 i 153 filer.
[Remedieringsmanifest](remediation-manifest.json) og [fullsuite-manifest](test-manifest.json)
kjøres fil for fil; ingen tidligere fil er utelatt. Typegen/TypeScript, webpack-build og
HTTP/PDF 22/22 PASS. ESLint 0 feil/27 eksisterende warnings. [Lintavstemmingen](lint-occurrence-reconciliation.json)
bevarer full feltidentitet og duplikatantall: 26 eksakte treff og én dokumentert flytting
av uendret protectedCount fra linje55 til56. Oppryddingssaken er urørt.
[Alle faktiske kommandoer, logghasher og kandidatidentiteter](gate-results.json).

## Separat autorisert receipt-formatrot

[Opprinnelig blocker](blocker.json), eksakt failed-preflight.py.gz og det opprinnelige
receiptinventaret er bevart. [15 eksplisitte etablerte formater](receipt-formats.json)
verifiserer [alle 53 tidligere receipts](prior-receipts.json) mot originalregisteret uten
fallback, utfylling eller gjetning. Flere representasjoner må samsvare. [Resultater](receipt-format-results.json).
`receipt_formats_test.py` kontrollerer alle obligatoriske felt, feil typer, signatur/GAP/SF/
produkt/scope/versjon, motstrid og ukjente/tvetydige format for hver historisk receipt.
Det innledende negative kontrollresultatet og endelig PASS er bevart hver for seg.
[Navngitt unntak og rotbevis](receipt-format-authorization-and-ledger.json):
LIABILITY_PREFLIGHT_EXISTING_RECEIPT_FORMATS, 29/12 → 30/12, Ansvar-scope0/6 → 1/6.
Ordinær grense12, ingen kapasitet til andre røtter. Ingen produksjons- eller app-testendring
utføres under formatrettingen. Planlagte katalog-/kompatibilitetsendringer føres separat.

## Integritet og reproduksjon

[Parameterstyrt gjenbruk av eksisterende gateverktøy](runner-parameters.json),
[eksisterende completion-mal](completion-tool-reuse.json) og [verifier](verification-parameters.json).
Ingen historisk generator er kopiert eller endret. Originale eksisterende Python-verktøy
lastes fra de oppgitte stiene og hashkontrolleres; bare eksplisitte nye revisjons-/scope-
og outputparametre tilpasses i minnet. Gatefunksjonen `run` brukes før dens historiske
mode-dispatch. Faktiske kommandoer og miljøoverstyring finnes i gate-results.json.
Verifieren reproduseres ved å lese verification-parameters.json, SHA-kontrollere origin,
utføre hver eksakt before/after-erstatning én gang og kjøre den resulterende koden med
`__file__` satt til denne katalogens verify.py-kontekst. Ingen ny generatorfil lagres.
Formatkontroller: `PYTHONDONTWRITEBYTECODE=1 python docs/audit/checkpoints/b051-liability-3947e4e/receipt_formats_test.py`.

[Aktivt eksakt publiseringssett](staged-files.json), [manifestavstemming](publication-manifest.json)
og SHA256SUMS omfatter bare autoriserte filer. Nye filer kontrolleres også for LF og
trailing whitespace. Begge diffkontroller og exit-status er obligatoriske. Publiser kun med
[eksisterende sikret publish.py](../b050-diagnostics-integrity-3c5e869/publish.py), expected-head
3947e4e90b9ab09ea46dda659a2271d956ae1dd3 og eksakt staged-files.json. Ingen force/deploy.
[Checksumovergangen](checksum-transition.json) bevarer den opprinnelige blockerlisten.

[Checkpoint](checkpoint.json): 54 unike dokumenterte kampanjesignaturer etter verifisert
publisering, de 53 tidligere byteidentiske. [B-051-partisjon](completion-b051-partition.json):
28 fullført,7 kildeklare kandidater uten receipt,2 revalideringskandidater,2 holds.
Globalt resolved/open **UKJENT**; historiske tellere og DEFER_SAFE uendret; ingen P2-kreditt.
HTU, vannmapping, SC020/SR032, SC035/SR031, B071-holdet og råtestatusfunnet bevares.
Ingen senere produksjonsbolk er autorisert. Neste steg krever eksplisitt avgrenset fullmakt.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
