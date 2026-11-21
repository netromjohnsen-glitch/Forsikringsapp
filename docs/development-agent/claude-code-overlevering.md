# Forsikringstolken i Claude Code

## Arbeidskopi

Bruk Ubuntu-24.04 i WSL og prosjektet `/home/johnsen/c46-local/person-kataloghull-20261119`. Grenen er `catalog/person-kataloghull-20261119`. De testede katalogrettelsene følger med grenen på GitHub. Start med `git status --short` og les `AGENTS.md` før du endrer noe.

Windows-startfilen `Start-Forsikringstolken.cmd` åpner Claude Code i denne mappen og legger prosjektets Node 24 på PATH. Logg inn med egen Anthropic-konto ved første oppstart. `/memory` viser hvilke prosjektinstrukser som er lastet. [Claude Code-oppsett](https://code.claude.com/docs/en/setup) · [Prosjektinstrukser](https://code.claude.com/docs/en/memory)

## Hvor arbeidet ligger

- `lib/market-product-catalog.ts` samler dataene i katalogutvalget. Rettelser ligger både i `catalog/market-comparison-gap-evidence.json` og i produktspesifikke moduler under `lib/`.
- `lib/catalog-product-comparison.ts` materialiserer sammenligningen. Kontroller radnøkkel, produktvariant, avtale, vilkårsutgave og fysisk PDF-side når et felt endres.
- Sjekk om den berørte raden kommer fra katalogutvalget, manuell registrering eller en opplastet avtale. Bruk riktig inngang i testen. Behold originalkilder og tidligere kontrollbevis.

## Lokale kontroller

Kjør fra arbeidskopien i WSL. Bruk `npm ci` dersom den eksisterende `node_modules`-lenken mangler. PDF-kildekontrollene bruker Poppler-verktøyene i WSL.

```bash
export PATH="/home/johnsen/c46-local/node-v24.22.1-linux-x64/bin:$PATH"
git diff --check
node --test --test-concurrency=8 --test-reporter=tap tests/*.test.mjs
npm run lint
npm run build -- --webpack
node scripts/verify-analysis-http.mjs
node scripts/verify-product-comparison.mjs
```

HTTP-kontrollen starter en lokal server med syntetiske dokumenter og simulert uttrekk. Den trenger ingen API-nøkkel. Den lokale katalogen kan også åpnes i nettleseren etter et produksjonsbygg. Følgende kommando lager en ny pilotkode for lokal bruk på `http://127.0.0.1:3000`.

```bash
local_preview_code=$(openssl rand -hex 8)
printf 'Lokal pilotkode %s\n' "$local_preview_code"
PILOT_ACCESS_CODE="$local_preview_code" \
  PILOT_SESSION_SECRET="$(openssl rand -hex 24)" \
  npm run start -- --hostname 127.0.0.1 --port 3000
```

## Testet versjon

Produksjonsbygget `9ILx8NMDe8ejGYJPky496` ble verifisert 21. november 2026. Alle 7 595 tester passerte. Sammenligningen ble kontrollert for 3 884 produktpar i begge rekkefølger, og alle 255 lokale PDF-ruter svarte med forventet dokument. TypeScript, ESLint (0 feil, 29 eksisterende advarsler), analyse-API-et med syntetiske dokumenter og utvalgte Chrome-flyter passerte.

## Tilbake i Codex

Åpne samme WSL-mappe. Del denne overleveringen sammen med en kort logg over endringene fra prøveperioden, siste testresultater og eventuelle åpne saker. Ta med `git status --short` og siste commit-ID. Den lokale sikkerhetskopien i `/home/johnsen/c46-local/handoff/claude-code-20261120` gir et kontrollert utgangspunkt for å se hva som har endret seg.
