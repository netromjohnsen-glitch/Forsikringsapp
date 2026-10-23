# Fullmakt 23. oktober 2026

Bruker: «Implementer den avgrensede Smart-valgregelen for Hus Standard og Hus Pluss på fersk main. Kjør nødvendige kontroller og oppdater receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Basis: fersk main 85be811f596aa757f196f5f6f33f8fa0063b9123, ren arbeidskopi. Lokal branch fix/smart-document-selection. Ingen commit/push er bestilt; lever lokal validert kandidat. Ingen installasjon eller deploy.

Tillatt produksjonsscope: lib/hus-smart-selection.ts (felles produktbundet valgregel), lib/catalog-enrichment.ts (mapping og komponentaktivering), lib/comparison.ts (tilleggsvisning), lib/supporting-terms.ts (samme eksakte produktbundne nøkkel ved støttetilknytning). Nye permanente Smart-kontrakttester, nødvendige eksplisitte oppdateringer av aktive Smart-feilkarakteriseringer, denne bevispakken og docs/development-agent/current-project-status.md.

Kontrakt: bare sikkert identifisert gjensidige-hus / gjensidige-hus-pluss, ordinary, Alminnelige vilkår. Eksplisitt Valgt gir selected; dokumentuttrekkets avtalte Hus Smart-tillegg uten motstrid/ukjent valgstatus gir selected; Ikke valgt overstyrer navnelisten; Valgt+Ikke valgt på samme kundepost gir unknown/conflict; bare Ukjent, omtale, detaljer, supporting/general_terms eller manglende valgbevis gir unknown. Bare selected viser tillegget og aktiverer katalogkomponenten. Dokumentvalgets binding, verdier/kilder og identitet beholdes på repeat. Valgt er ikke dokumentasjon på aktiv alarm eller oppfylte hendelsesvilkår. Ingen fuzzy/global alias eller ny ekstraksjonsenum. Bevar de tre eksisterende Smart-nøklene og katalog-/kildetekstene. Priser, egne premier, 8 000-kvalifikasjonene og 100 000 tjenesteansvar endres ikke.

Den separate eksisterende feilen ved gjentatt beriking av manuelt Smart-valg er utenfor: reproduksjon lagres før endring, og initialt/repetert manuelt output skal være baseline-identisk uten dokumentert Smart-overstyring. Nye dokumentvalg skal bestå repeat. HTU, insektunntak og øvrige HOLD er uendret; SC-020/SR-032 gjelder insektegenandel og er ikke Smart-valget. Ingen ny originalsignatur- eller P2-kreditt; B-051 37/0/1/1, kampanje 63, global UNKNOWN og REMEDIATION_REQUIRED beholdes.

Gater: målrettet faktisk schema/pipeline begge sider/roller/produkter, avslag/konflikt/ukjent/valg/addon-only, supporting og provenance, repeat, sammenligning begge retninger, ukjent produkt/provider/type/scope/version og eksisterende manuell modus; katalogidentitet/202 øvrige produkter; fullsuite med eksplisitt --test og manifest; typegen/tsc, ESLint, webpack production build og lokal syntetisk HTTP/PDF-runtime. Historiske receipts/kilder er immutable; aktiv autonom mekanisk policy med separat logg, uten numerisk stoppkvote.

Avklart implementeringsdetalj: targeted-final.log.gz avdekket at mapping av kundeidentitet også krever samme identitet i den eksisterende supporting-grensen. Ellers kan generiske Smart-rader dupliseres ved siden av kundens canonical rad. Gjenbruk samme helper bare for de to produktene; ingen generell støttetilknytnings-/admissionendring. Behold general_terms-opprinnelse og komplett recordEvidence gjennom repeat.

## Etterfølgende publiseringsfullmakt

Begrensningen til lokal levering ovenfor beskriver opprinnelig fullmakt. Brukeren har deretter uttrykkelig autorisert commit og push av den validerte bolken; se [publiseringsfullmakten](publication-authorization.md). Ingen deploy.
