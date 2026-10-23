# Fullmakt før implementering – 23. oktober 2026

Bruker: «Implementer den avgrensede rettingen av katalogopprinnelse ved gjentatt beriking på Hus Standard og Hus Pluss på fersk main. Kjør kontroller og oppdater receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.»

Basis: 257a197aa016ba3c9567eeb4cebc8182d5e0aba5, identisk fersk GitHub-main, HEAD og origin/main; arbeidskopi ren, staged 0. Branch fix/house-catalog-origin.

Én avklart rot: katalograder passerer dokumentnormalisering og blir document, med tap av strukturdata og egenandelsklassifisering. Bare Gjensidige gjensidige-hus og gjensidige-hus-pluss, bolig / ordinary / Alminnelige vilkår. Skill reelt kundedokument, generert kataloggrunnlag og general_terms før normalisering. Bevar gjeldende faktagrunnlag, katalogopprinnelse, identiteter, komplette kilde-/presentasjonsnoter, structuredValue, deductibleClassification, overriddenBase og availability. Sen kundeverdi skal ha samme prioritet som opprinnelig kundeverdi. Gjeldende unknown-fallback beholdes som katalog. Supporting terms forblir katalog/evidens, aldri kundevalg.

Tillatt produksjonsfil: lib/catalog-enrichment.ts. Ingen endring i global normalizer, coverage engine, katalog/kilder, schema, alias/admission eller objektmatching. Bevar publiserte manuelle og dokumentbaserte Smart/Utleie/råte-regler, gyldige/ugyldige valgbevis, Rettshjelp, priser og generell egenandel. Alle HOLD og vilkårsverdier beholdes.

Tillatt validering: ny målrettet test og eventuell testhelper; eksakte begrunnede forventningsendringer i aktive berørte tester, uten skip eller svekkede kontroller. Historiske receipts/baselines/auditbytes er uforanderlige. Ny auditpakke og current-project-status.md oppdateres. Før-baseline og uavhengig kontraktbevis tas før produksjonsendringen. Mekaniske rettinger føres separat etter stående autonom policy; ingen numerisk ramme forespurt.

Gater: begge produkter/retninger, manual/PDF, genuine dokumentverdier og senere dokumentverdier, avslag/konflikt/ukjent, supporting, repeat tre ganger+JSON, full metadata/proveniens, gyldig valg og isolasjon. Alle testfiler, typegen før TypeScript, ESLint, webpack-bygg, lokal syntetisk HTTP/PDF-runtime og kilde-/audit-/lenke-/diffintegritet. Ingen installasjon, commit/push eller deploy i denne fullmakten.

Sluttpunkt: lokal validert kandidat, receipt og prosjektstatus. Ingen originalsignatur-kreditt; B051 37/0/1/1, kampanje 63, P2 0, global UNKNOWN og REMEDIATION_REQUIRED består. Alle pre-pilotpunkter synlige; NITO og Sentralbord venter.
