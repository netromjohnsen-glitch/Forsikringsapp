# NITO Hus / Hus Ekstra – katalogfakta

- **Datoperiode:** 2026-11-21
- **Kilder:** `catalog/sources/tryg/member-agreements/nito-hus.pdf` (PPK11507), `nito-hus-ekstra.pdf` (PPK11508)
- **Fakta før/etter:** Hus 2 → 60, Hus Ekstra 2 → 62
- **Generator:** `scripts/generate-nito-hus-evidence.mjs` (medlems-PDF-tekst validert for overstyringer; bygningsnøkler speiler `tryg-hus-catalog.ts`)
- **Gap-evidence:** Tomme `rows` for `tryg-nito-hus-terms` og `tryg-nito-hus-ekstra-terms` i `market-comparison-gap-evidence.json` fordi fullstendige fakta nå ligger i `nito-evidence.json`
- **Test:** `tests/nito-hus-catalog-comparison.test.mjs`