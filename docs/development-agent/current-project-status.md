# Aktuell dokumentert prosjektstatus

## Hus Smart – validert dokumentvalg 23. oktober 2026

Rettingen er validert på fersk main 85be811f596aa757f196f5f6f33f8fa0063b9123 og retter
dokumentvalget på Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår.
Én produktbundet valgregel styrer både komponentaktivering og tilleggsvisning:
Valgt eller et dokumentert avtalt tillegg gir selected; Ikke valgt overstyrer
navnelisten; Valgt + Ikke valgt gir unknown/conflict. Bare Ukjent, omtale,
detaljer eller generelle vilkår oppretter ikke kundevalg. Bare selected viser
Smart som valgt tillegg. Valgt bekrefter ikke aktiv alarm eller oppfylte
hendelsesvilkår for egenandelsreduksjon.

Eksakte Smart-identiteter, kundeverdier, kildebevis og dokumentvalg beholdes på
repeat. Støttevilkår bruker samme produktbundne nøkkel med general_terms-opprinnelse
og separat recordEvidence. Den separate eksisterende feilen ved gjentatt beriking
av et rent manuelt Smart-valg står fortsatt åpen og er baseline-identisk.

102 nye Smart-valgtester; 324/324 kontroller med den eksisterende Smart-gaten;
5694/5694 tester i 161 filer PASS uten skip. Typegen/TypeScript, webpack-bygg og
lokal syntetisk HTTP/PDF-runtime 22/22 PASS. ESLint 0 feil / 27 identiske warnings.
Katalog- og kildebytes er uendret. 202 øvrige produkters kontrollerte
berikingsresultater og seks manuelle initial-/repeat-output er eksakt baseline-identiske.
12 ekstra kontroller bekrefter dokumentoverstyring av manuelt katalogvalg.
[Receipt](../audit/checkpoints/b051-smart-selection-85be811/completion-receipt-smart-document-selection.json),
[gjeldende checkpoint](../audit/checkpoints/b051-smart-selection-85be811/checkpoint.json),
[validering](../audit/checkpoints/b051-smart-selection-85be811/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-smart-selection-85be811/README.md).

Publisering med commit og push er eksplisitt autorisert. Rettingen, receipt og
prosjektstatus er publisert når denne committen er verifisert på remote main;
[publiseringsfullmakt og kontroller](../audit/checkpoints/b051-smart-selection-85be811/publication-authorization.md).
Ingen deployhandling. Testet basis-SHA og kandidatens filidentitet er ført separat. Katalogtekst,
prisberegning, 8 000-kvalifikasjoner og 100 000-kroners tjenesteansvar er uendret.
Ingen ny originalsignatur- eller P2-kreditt: B-051 fortsatt 37/0/1/1 og kampanje 63.
HTU og alle øvrige HOLD er uendret; SC-020/SR-032 gjelder fysisk insektegenandel,
adskilt fra Smart-valget. NITO og Sentralbord venter. Ingen ny arbeidsstrøm er startet.

## Rettshjelp – validert dokumentprioritet 22. oktober 2026

Rettingen er validert på fersk main 2b198f9ebf52aa283056b3a052edf0fa0cdd311f og retter
Rettshjelp på Gjensidige Hus Standard og Hus Pluss, ordinary / Alminnelige vilkår.
Faktisk uttrekk bruker nå samme produktbundne dekning som katalogen.
«Ikke valgt» gir én not_selected; motstridende kundeopplysninger gir én
unknown/conflict. Katalogens rettshjelpspåstand og detaljer overstyrer ikke disse.
Kundeverdier, komplette kilder og supporting evidence beholdes; gjentatt beriking
lager ingen ekstra generisk valgt dekning. Dokumentert Rettshjelp vises som
basisdekning og ikke som et valgt tillegg; rå tilleggsopplysninger beholdes.

72/72 nye målrettede kontroller og 5592/5592 tester i 160 filer PASS, uten skip.
Typegen/TypeScript, webpack-bygg og lokal syntetisk HTTP/PDF-runtime 22/22 PASS.
ESLint 0 feil / 27 identiske warnings. Katalog og kildefiler er uendret;
202 øvrige produkters kontrollerte berikingsresultater er eksakt baseline-identiske.
[Receipt](../audit/checkpoints/b051-legal-priority-2b198f9/completion-receipt-legal-document-priority.json),
[gjeldende checkpoint](../audit/checkpoints/b051-legal-priority-2b198f9/checkpoint.json),
[validering](../audit/checkpoints/b051-legal-priority-2b198f9/validation-summary.json)
og [bevispakke](../audit/checkpoints/b051-legal-priority-2b198f9/README.md).

Rettshjelp-rettelsen, receipt og prosjektstatus er publisert på remote main i
85be811f596aa757f196f5f6f33f8fa0063b9123, verifisert før og etter Smart-arbeidet;
[publiseringsfullmakt og kontroller](../audit/checkpoints/b051-legal-priority-2b198f9/publication-authorization.md).
Ingen deployhandling. Testet basis-SHA og kandidatens filidentitet er ført separat
i receipt. Dette lukker bare den dokumenterte kundemapping-/prioritetsfeilen;
det gir ingen ny originalsignatur- eller P2-kreditt. HTU-konflikten
157c7afed18eb0fe / SC-019/SR-033 og alle øvrige HOLD er uendret.
B-051-partisjonen er fortsatt 37/0/1/1 og kampanjetallet er fortsatt 63.
NITO og Sentralbord venter. Ingen neste produksjonsbolk er startet.

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

Vannfullføringen er publisert på remote main i 2b198f9ebf52aa283056b3a052edf0fa0cdd311f,
verifisert ved starten og avslutningen av den lokale Rettshjelp-bolken.
Bare vannsignaturen ble flyttet til fullført i denne bolken. Ingen deployhandling.

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

Lukkingen er publisert i cd6e03de824d46a514413d2d86fbcae9c39e12c4, som inngår i fersk main.
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

Smart-dokumentvalg er validert ovenfor; den separate manuelle Smart-repeat-feilen
står åpen. HTU-konflikt, SC-020/SR-032, SC-035/SR-031, B-071-holdet og øvrige holds er bevart. Rettshjelps kundemapping/prioritet er validert rettet
i rettelsen ovenfor; historiske receipts og øvrige metadataoverganger er bevart.
8a89196fecd29ddb beholdes åpen og på HOLD: landbruks-/næringsunntakets
anvendelse på bekjempelse krever autoritativ avklaring. Ingen lukking av denne kandidaten.
Ingen ny produksjonsbolk eller deploy er autorisert. NITO og Sentralbord venter.
Øvrig pre-pilot: personforsikring/pilotscope, sikkerhet/GDPR (inkludert fortsatt
uavklart P3-A05-identitet/mergestatus), kritisk UX, feedback og operativ rådgiveraksept
forblir synlige og er ikke startet som nye arbeidsstrømmer.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
