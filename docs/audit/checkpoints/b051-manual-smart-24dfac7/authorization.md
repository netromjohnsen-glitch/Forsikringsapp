# Fullmakt 23. oktober 2026

Bruker: «Rett bevaring av manuelt Smart-valg gjennom gjentatt beriking på Hus Standard og Hus Pluss på fersk main. Kjør kontroller og oppdater receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Basis: fersk main 24dfac79717f3efeab7302ce4fa8010de64da3d2, ren arbeidskopi. Lokal branch fix/manual-smart-choice. Lever lokal kandidat; commit/push er ikke bestilt. Ingen installasjon eller deploy.

Scope: bare gjensidige-hus og gjensidige-hus-pluss, ordinary / Alminnelige vilkår. Normalisert eksplisitt manuelt Smart-valg får produkt-/versjonsbundet manualSelection-bevis. Katalogopprinnelse for verdier/kilder beholdes. Strengt validert manuelt valg skal beholde Smart-ID og de tre eksisterende Smart-nøklene med komplette kilder på repeat. Dokumentstatus, inkludert avslag/konflikt/uttrykkelig ukjent, beholder forrang slik den allerede har på main. Avvalg via nytt manuelt input fjerner beviset og må ikke gjenoppstå fra gammelt navn/katalog-ID/tilgjengelighet. Ukjent produkt/provider/type/scope/version eller ugyldig markør kan ikke aktivere Smart. Ingen generell videreføring av øvrige manuelle tillegg.

Tillatte produksjonsfiler: lib/hus-smart-selection.ts, lib/manual-agreement.ts, lib/catalog-enrichment.ts, lib/comparison.ts. Ny permanent manuell Smart-kontrakttest; nødvendige eksakte oppdateringer av aktive gamle manual-repeat-karakteriseringer; denne auditpakken og docs/development-agent/current-project-status.md. Katalog, kilder, globale aliaser/enum, objektmatching, priser, betinget 8 000-kronersreduksjon og 100 000-kroners tjenesteansvar endres ikke.

Gater: kjent manuelt input begge produkter, gjentatt beriking og JSON-roundtrip, valg/avvalg, kilde- og feltbevaring, dokumentavslag/konflikt/ukjent/kundeverdi og begge sammenligningsretninger, ugyldige/kopierte markører, rå-ID/tilgjengelighet ikke valg, scope-/produktisolasjon og eksisterende dokument-Smart/Rettshjelp/råte. Før-baseline for øvrige produkter, manuell input og faktisk dokumentpipeline. Fullsuite med --test og manifest, typegen/tsc, ESLint, webpack build og lokal syntetisk HTTP/PDF. Aktiv autonom policy med varig separat rettingslogg; historiske budsjetter og receipts omskrives ikke.

HTU og alle øvrige HOLD bevares. B-051 37/0/1/1, kampanje 63, global UNKNOWN, P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. NITO og Sentralbord venter. Ingen ny originalsignaturkreditt eller ny arbeidsstrøm.
