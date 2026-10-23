# B-130 underforsikring – lokalt validert kandidat

Implementert på fersk main `0e4c09d528e92da85e3afad6db50620f6db00983`.
Bare `15f5b4a3e9f79fd2`, begge originalbindinger. Publiseringsrevisjonen er den
inneholdende Git-committen; publisert status gjelder etter bekreftelse på remote main.
Commit/push er eksplisitt autorisert; ingen deploy.

- [Fullmakt](authorization.json)
- [Uavhengig kildekontrakt](source-oracle.json)
- [Før-baseline og reproduserbar innhenting](baseline-identity.json)
- [Kandidatidentitet](candidate-identity.json)
- [Kildeforover-/reverse-audit](source-and-reverse-audit.json)
- [Sluttgater med kommandoer og forseglede logger](gate-results.json)
- [Validering](validation-summary.json)
- [Receipt](completion-receipt-15f5b4a3e9f79fd2.json)
- [Checkpoint](checkpoint.json)
- [Beskyttet status](protected-status-verification.json)
- [Mekaniske rettinger, historiske tellere uendret](autonomous-mechanical-corrections.json)
- [Integritetskontroll](integrity-verification.json)
- [Avklart beslutning](../b130-underinsurance-review-0e4c09d/decision-15f5b4a3e9f79fd2.json)
- [Gjeldende prosjektstatus](../../../development-agent/current-project-status.md)

6146/6146 fullsuite, 2454/2454 målrettede, 65 nye kontrakttester; typegen,
TypeScript, webpack, ESLint 0 feil / 27 uendrede warnings og lokal syntetisk
HTTP/PDF 22/22 PASS på samme kode-/testidentitet. Første kildeassertsjoner og
sandbox-portforbud er dokumenterte diagnostiske forsøk, ikke sluttgater.
Alle HOLD beholdes; NITO og Sentralbord venter. Basis-main65 / publisert66 etter bekreftet inneholdende commit.
Alle filer i pakken forsegles av SHA256SUMS unntatt checksumfilen og
publication-integrity.json, som er bundet av Git-committen og stagingkontrollen.

- [Publiseringsfullmakt](publication-authorization.md)
- [Førkontroll](publication-preflight.json)
- [Eksakt filmanifest](publish-files.json)
- [Publiseringsintegritet](publication-integrity.json)
