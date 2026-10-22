# Aktuell dokumentert prosjektstatus

## Vann etter dekket bygningsskade – validert fullføring

25004bc4d7dd2c03 er implementert for Hus Standard GAP-2088/SF-2991 og
Hus Pluss GAP-2142/SF-3075 på basis cd6e03de824d46a514413d2d86fbcae9c39e12c4.
Ny egen gren hus.vann.inntrengning_etter_bygningsskade bevarer kravet om at
åpningen/utettheten oppstod ved erstatningsmessig bygningsskade. Begge produkter
har egen kilde på PDF-side 3. Eksisterende vanngreners verdi/status/kilder,
Pluss-utvidelsen for utett bygning og øvrig katalogmetadata er uendret.

5520/5520 tester i 159 filer PASS, inkludert 27/27 nye vanntester.
Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime PASS.
ESLint 0 feil / 27 uendrede warnings. Full identitet og bevis:
[receipt](../audit/checkpoints/b051-water-25004-cd6e03d/completion-receipt-25004bc4d7dd2c03.json),
[gjeldende checkpoint](../audit/checkpoints/b051-water-25004-cd6e03d/checkpoint.json),
[validering](../audit/checkpoints/b051-water-25004-cd6e03d/validation-summary.json).

Fullføringen er publisert når denne committen er verifisert på remote main.
Bare vannsignaturen flyttes til fullført i denne bolken. Ingen deployhandling.

## Tidligere publisert revalidering av dyredekning

## Avgrenset revalidering 22. oktober 2026

41206e12c93c0058 er revalidert mot main f7b4007181507b0746c720f55182bee5bc426933.
Originalbindingen er GAP-2092/SF-2998 på Hus Standard, med to dimensjoner;
Hus Pluss og valgt insekttillegg er arve-/regresjonskontroller, ikke ekstra originalbindinger.
B-020 dekker bekjempelse og bygningsskade; ingen produksjonsretting var nødvendig.
247/247 målrettede tester i 7 filer PASS, 0 fail og 0 skip. Kildehasher og
kildepunkt er kontrollert på nytt; fullsuite, bygg og runtime er ikke kjørt på nytt.
[Ny receipt](../audit/checkpoints/b051-revalidation-41206-f7b4007/receipt-41206e12c93c0058.json),
[gjeldende checkpoint](../audit/checkpoints/b051-revalidation-41206-f7b4007/checkpoint.json) og
[validering](../audit/checkpoints/b051-revalidation-41206-f7b4007/validation-summary.json).

Lukkingen er publisert når denne dokumentasjonscommitten er verifisert på remote main.
Testet applikasjonsrevisjon er f7b4007; publiseringscommitten inneholder bare dokumentasjon.
Historiske receipts og øvrige HOLD er uendret. Ingen deploy.

## Tidligere publisert råtearbeid

B-051 råte er fullført for 6af32d21acb9584c, begge originalbindinger:
Hus GAP-2101/SF-3012 og Hus Pluss GAP-2160/SF-3099.
[Historisk råte-checkpoint](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/checkpoint.json),
[completion-receipt](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/completion-receipt-6af32d21acb9584c.json)
og [bevispakke](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/README.md).

Standard uten valg er unknown. Et eksplisitt manuelt råtevalg beholder produktbundet
valgbevis, addon-ID, komponent og komplette kilder gjennom gjentatt enrichment.
Dokumentavslag og konflikt overstyrer valget; navnelisten følger effektiv status,
mens fakta/provenance bevares. Dokumentert kundeverdi beholder forrang.
Avkrysset av og nytt manuelt input gjenoppretter ikke gammelt valg. Pluss inkludert består.
Publisert råtetekst, katalogmetadata og tidligere statusretting er uendret.

[Historiske råtegater](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/validation-summary.json):
83/83 råtestatus, 2/2 manuell runtime-flyt og 140/140 råtekatalog;
2295/2295 målrettet i 36 filer; 3339/3339 remediering i 60 filer;
5493/5493 fullsuite i 158 filer.
Next typegen/TypeScript, webpack build og HTTP/PDF-runtime 22/22 PASS.
ESLint: 0 feil, 27 eksakt uendrede warnings.
203 øvrige manuelle produktavtaler, 157 gyldige øvrige tilleggsavtaler og
202 materialiserte produkter er baseline-identiske; katalogen og B-020 består.

63 unike dokumenterte kampanjesignaturer: B-050 16, B-071 10, B-051 37.
Alle 60 tidligere receipts og historiske auditpakker er bevart.
B-051s 39-partisjon: 37 fullført / 0 uten completion /
1 revalideringskandidat / 1 opprinnelig HOLD. Manglende receipt er ikke alene produksjonsfeil.

Globalt resolved/open er UKJENT. Historiske 414/1589, 19/16, 10/8,
diagnostikk 19/12, HARNESS_AUTONOMY_V1 33/12 og DEFER_SAFE omskrives ikke.
[Nye mekaniske rettinger](../audit/checkpoints/b051-manual-rot-choice-2a2d0fc/autonomous-mechanical-corrections.json)
føres separat uten numerisk stoppkvote. Ingen P2-kreditt.

Smart-kundemodus, Rettshjelp-alias, HTU-konflikt,
SC-020/SR-032, SC-035/SR-031, B-071-holdet og øvrige holds er bevart.
8a89196fecd29ddb beholdes åpen og på HOLD: landbruks-/næringsunntakets
anvendelse på bekjempelse krever autoritativ avklaring. Ingen lukking av denne kandidaten.
Ingen senere produksjonsbolk eller deploy er autorisert. NITO og Sentralbord venter.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
