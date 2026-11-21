# Utdanningsforbundet Hus / Hus Ekstra – katalogfakta

- **Datoperiode:** 2026-11-21
- **Kilder:** `catalog/sources/tryg/member-agreements/udf-hus.pdf` (PPK11601), `udf-hus-ekstra.pdf` (PPK11602)
- **Fakta før/etter:** Hus 2 → 59, Hus Ekstra 2 → 60
- **Generator:** `scripts/generate-udf-hus-evidence.mjs` (deler kjerne med NITO via `scripts/lib/tryg-member-hus-evidence-core.mjs`; bygnings-PDF utsnitt validert mot PPK11601/11602)
- **Merk:** Medlems-PDF-ene er sammensatte; generatoren isolerer bygningsvilkårene før `pdftotext`-validering. `hus.forsikringssum` utelates der PPK-teksten ikke dokumenterer innledningen.