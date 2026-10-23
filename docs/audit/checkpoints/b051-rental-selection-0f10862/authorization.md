# Fullmakt før implementering – 23. oktober 2026

Bruker: «Implementer den avgrensede regelen for dokumentbasert Utleie-valg på Hus Standard og Hus Pluss på fersk main. Kjør kontroller og oppdater receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Basis: 0f1086206e9aa713681d84ebe55766196e1a7609, identisk lokal HEAD/origin/main/fersk GitHub-main; ren arbeidskopi, staged 0. Lokal kandidatbranch fix/document-rental-choice. Ingen commit/push-fullmakt.

Avklart kontrakt: Gjensidige gjensidige-hus og gjensidige-hus-pluss, bolig, ordinary, Alminnelige vilkår. Eksplisitt Utleie: Valgt eller strukturert avtalt Utleie-tillegg uten motsatt/ukjent parentstatus velger. Ikke valgt overstyrer oppført tillegg; valgt+avslag gir konflikt/unknown. Ukjent, detaljer, beskrivelse og general_terms alene velger ikke. Bare valgt aktiverer og vises. Lokale Valg/Valgstatus/Status/Dekning gjelder bare inne i dokumentert Utleie. Fem eksisterende detaljnøkler får samme scoped identitet, dokumentprioritet og komplette kilder; også ukjent kundedetalj blokkerer fallback. Tilleggsvalg kildebindes før konsolidering. Ingen global canonical-/alias-/schema-/admissionendring.

Tillatt produksjon: lib/hus-rental-selection.ts, lib/catalog-enrichment.ts, lib/comparison.ts, lib/analysis-merge.ts (bare scoped kildebinding), lib/supporting-terms.ts (bare scoped Utleie-identitet/prioritet). Tilhørende nye tester og eksakt dokumenterte aktive forventningsendringer; ny auditpakke og current-project-status.md. Ingen historiske audit-/kildebytes endres.

Bevar manuell Utleie/Smart/råte, Rettshjelp, B-020, basis hus.leietap.skade, priser/generell egenandel, object matching og alle HOLD. Ingen ny originalsignatur-kreditt. B051 37/0/1/1, kampanje 63, globalt UKJENT, P2 0, REMEDIATION_REQUIRED. NITO og Sentralbord venter.

Gater: målrettede kontrakt-/isolasjon-/dokumentpipeline-/repeat-/JSON-/kildekontroller, alle testfiler, typegen før tsc, ESLint, webpack production build, lokal syntetisk HTTP/PDF-runtime, diff/link/kilde/audit-integritet. Installering og deploy er ikke autorisert. Ingen numerisk budsjett forespurt; stående autonom mekanisk policy gjelder med separat logg. Sluttpunkt: lokal validert kandidat med receipt og prosjektstatus, klar for separat publiseringsbeslutning.
