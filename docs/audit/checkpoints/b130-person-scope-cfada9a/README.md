# B-130 personkrets – validert bolk

Implementert på fersk main `cfada9a3c73de450f53b784ec2b60b41c434a10a`.
Bare `d58bff0e6b2d46eb`, begge originalbindinger. Publiseringsrevisjonen er den
inneholdende Git-committen; publisert status gjelder etter bekreftelse på remote main.
Commit/push er eksplisitt autorisert; ingen deploy.

- [Fullmakt](authorization.json)
- [Uavhengig kildekontrakt](source-oracle.json)
- [Før-baseline og reproduserbar innhenting](baseline-identity.json)
- [Kandidatidentitet](candidate-identity.json)
- [Kildeforover-/reverse-audit](source-and-reverse-audit.json)
- [Sluttgater med kommandoer og forseglede logger](gate-results.json)
- [Validering](validation-summary.json)
- [Receipt](completion-receipt-d58bff0e6b2d46eb.json)
- [Checkpoint](checkpoint.json)
- [Beskyttet status](protected-status-verification.json)
- [Mekaniske rettinger, historiske tellere uendret](autonomous-mechanical-corrections.json)
- [Integritetskontroll](integrity-verification.json)
- [Avklart beslutning](../b130-person-scope-review-cfada9a/decision-d58bff0e6b2d46eb.json)
- [Gjeldende prosjektstatus](../../../development-agent/current-project-status.md)

6225/6225 fullsuite,2533/2533 målrettede,79 nye kontrakttester; typegen,
TypeScript, webpack, ESLint0 feil/27 uendrede warnings og lokal syntetisk
HTTP/PDF22/22 PASS på samme kode-/testidentitet. Første77 nye kontrakttester
bestod før to ekstra sent-dokument-kontroller; ingen feil/skips i sluttgatene.
Alle HOLD beholdes. NITO og Sentralbord venter. Basis-main66/publisert67 etter bekreftet inneholdende commit.
Ferdige navngitte reviews gir ingen samlet katalog-/pilotklarering.
Alle filer i pakken forsegles av SHA256SUMS unntatt checksumfilen og
publication-integrity.json, som er bundet av Git-committen og stagingkontrollen.

- [Publiseringsfullmakt](publication-authorization.md)
- [Førkontroll](publication-preflight.json)
- [Eksakt filmanifest](publish-files.json)
- [Publiseringsintegritet](publication-integrity.json)
