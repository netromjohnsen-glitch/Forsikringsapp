# Regenererte audit-fixtures etter katalogbevis-rettingene

Checkpoint: `docs/audit/checkpoints/catalog-evidence-corrections-20261121`.
Katalogendringene ligger i PR #6 (`43d60fb`). Dette notatet dekker bare
de frosne baseline- og oracle-filene som måtte følge etter, jf.
`docs/catalog-updates.md`: kilde-PDF-ene og den aktive produktreferansen er
ikke byttet ut. Ingen baseline er regenerert fra bunnen av.

## Miljø

- Node 24.22.3
- Poppler `pdftotext` 26.11.0, bygget til `/opt/poppler-26.11` med samme
  opsjoner som `.cursor/Dockerfile`. Apt-pakken 24.02.0 bryter linjebrytingen
  i `pdftotext -raw` og kan ikke brukes mot disse oraklene.

## Hva som er tillatt å endre

Hvert regenererte v8-snapshot er diffet felt for felt mot `HEAD` før
commit. Tillatte avvik er bare utdata fra de allerede gjennomgåtte
rettingene:

- kundeteksten `allmenlege` → `allmennlege` i `hus.service.helsehjelp`
- sidefelt som allerede er rettet i katalogen, og bare der én PDF-side
  inneholder kr-beløpet
- integritetssummer (`baseline_sha256`, `snapshot.sha256`,
  `publication-preflight`, `candidate-identity`, `prior-packet-integrity`)
  som peker på de oppdaterte filene

## Klassifisert diff

26 `baseline.v8.gz` / `baseline-catalog.v8.gz`:

- 8 976 felt er bare stavemåten `allmenlege` → `allmennlege`.
- Sidefelt finnes bare i `house-health-discount-27dffab/baseline.v8.gz`,
  og bare på disse nøklene:
  - `hus.gjenoppforing.klimatiltak` 8 → 2
  - `hus.tilpasning.grense` 8 → 2
  - `hus.alarm.egenandel.reduksjon` 5 → 3
  - `hus.skadedyr.egenandel` 29 → 30
  - `hus.rettshjelp.dekning` 41 → 42
  - `hus.hage.basseng` 2 → 3
  - `hus.ror.tining` 3 → 4
  - `hus.naturskade.egenandel` 7 → 8

Ingen andre nøkler, verdier, kilder eller strukturer avviker i disse
snapshotene. Splittede nøkler, nye Utdanningsforbundet-fakta og de
korrigerte Tryg-/katt-kildene ligger i katalogkoden og i kvitteringen
under; de frosne hus-snapshotene inneholdt ikke de radene.

`source-changes.v8.gz` mister komponenten `gjensidigeHusStandard`.
Eneste forskjell mellom den komponentens `before` og `after` var
helsehjelp-setningen. Setningen reverteres ikke lenger, så historiske
projeksjoner og de oppdaterte snapshotene sier `allmennlege`. Øvrige
komponenter står, slik at side- og kilderettingene fortsatt revertes der
testen sammenligner med tilstanden før denne PR-en.

`b051-health-help-732b4cc/source-oracle.json` har ny `value` med
`allmennlege`. `previous_value` og PDF-layoutfrasene er urørt.
Fingeravtrykkene i `tests/nito-remediation-b020.test.mjs`,
`tests/remediation-b-051-liability.test.mjs` og
`tests/remediation-b-051-health-help.test.mjs` er hashen av de samme
faktasettene etter stavemåten.

`tests/remediation-b-057.test.mjs` forventer side 1 for
Gjensidige tilhenger brann, tyveri og kasko. Side 1 i
`gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf` og
`gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf` er dekningsoversikten
som inneholder 4 000 og 6 000. Veihjelp blir stående på side 2.

## Uforklart

Ingen. Alt som ikke var stavemåten, de åtte hus-sidefeltene, fjerningen av
`gjensidigeHusStandard` fra kvitteringen, eller integritetssummen til en
fil over, er avvist.

## Medlems-Bil 2026-11-21

`source-changes.v8.gz` utvides med `before`/`after` for åtte aktive
Tryg-medlemskomponenter (NITO bil ×5, UDF bil ×3). Historiske utgaver
`tryg-utdanningsforbundet-bil-delkasko-terms-2026-01-01` og
`tryg-utdanningsforbundet-elbil-ekstra-terms-2026-01-01` er uendret.
Se også `docs/audit/checkpoints/nito-bil-catalog-facts-20261121/note.md` og
`udf-bil-catalog-facts-20261121/note.md`.
