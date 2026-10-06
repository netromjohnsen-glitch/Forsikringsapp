Gjennomfør B-050 PUBLIC_DEDUCTIBLE i netromjohnsen-glitch/Forsikringsapp.

EKSPLISITT FULLMAKT
Kun:
f8bd15c89bc0dbd6 — GAP-2872/SF-4021
Gjensidige Hund, ordinary, Behandling.

Autoriserte endringer: kildebundet egenandelsrepresentasjon, presise regresjonstester, authorization/audit/receipts/rootledger/checkpoint og atomisk commit/push til main etter komplett PASS.

Ingen senere bolk autoriseres.

PREFLIGHT
Les AGENTS.md, docs/development-agent/workflow.md, aktuelt checkpoint, gjeldende kampanjepolicy og eventuell lagret PUBLIC_DEDUCTIBLE-plan.

Sist rapportert HEAD = origin/main = GitHub main:
b81ee91e8693dc7962040219768283a2270cfea6

Verifiser faktisk remote main, arbeidskopi, staged og eventuell remote-fremdrift. Bevar brukerarbeid. Ingen reset, overskriving eller force-push.

Kontroller at de 12 eksisterende kampanjereceipts og Treatment-kildens separate registrering består. Registrer denne eksakte fullmakten varig før implementering.

KILDEBEVIS
Les originalavsnittene samlet:
- gjensidige-dog-product.html: «Egenandel»
- gjensidige-dog-treatment-terms.pdf: PDF-side 8, egenandelsvarianter

Verifiser frosne bytes:
Produktnettside SHA-256:
fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58

Behandling-PDF SHA-256:
8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6

Bevar registrerte kildeidentiteter:
boat-pet:gjensidige:hund:treatment = full_terms
boat-pet:gjensidige:hund = eksisterende IPID, uendret

Vilkårsnummer, versjon og ikrafttredelse for Treatment er ukjent. Ikke bruk innhentingsdato som versjon.

KONTRAKT
Representer det kildene faktisk dokumenterer:
- Offentlig standard: 1 300 kr + 20 % av resten.
- Fastdelen betales én gang per sykdom/ulykke, med kildens eksakte periode-/saksbetydning.
- Valgbare fastdeler: 2 000 og 3 500 kr, med eksakt kildebestemt prosent/formel.
- Bevar mulig ren prosentvariant og forsikringsbevisets forrang.

Ikke anta at nettsidens standard er kundens avtalte egenandel.
Ikke bland alternative egenandelsvarianter til én obligatorisk formel.
Ikke gjør «20 % av resten» til «20 % av hele utgiften».
Ikke innfør årsreset eller gjentatt fastdel uten kildegrunnlag.

Hvis originalkildene avviker fra punktene ovenfor, skal kildebetydningen styre. Dokumenter en reell konflikt før avhengig implementering.

REPRESENTASJON OG FILER
Bekreft faktisk kontrakt for eksisterende egenandelsnøkler før skriving. Bruk eksisterende struktur når den uttrykker formel, alternativer og periode korrekt.

Tillatt:
- lib/boat-pet-catalog.ts: kun berørte Gjensidige Hund Behandling-egenandelsfakta/provenance
- tests/remediation-b-050.test.mjs
- presise berørte testforventninger når ekvivalens eller autorisert kontraktendring er dokumentert
- nye scope-/audit-/receipt-/rootledger-artefakter og nødvendige checkpoint-/plandokumenter

Ingen ny canonical nøkkel, schema-, engine-, parser-, mapping- eller selectionendring.
Ingen generell endring for beløp/prosent/egenandelsdetaljer.
Ingen ny kildeadmission, kildeoriginalendring, Katt-, Liv/Bruk-, diagnostikk- eller rehabiliteringsendring.
Ingen UI-, miljø-, secrets- eller egen deployhandling.
Ikke bruk GitHub Mention-integrasjonen eller merge test-PR #1/#2.

BUDSJETT
Verifiser aktuell føring. Sist rapportert kampanje: 9/12.
Ny bolk tillater maksimalt 3 dokumenterte mekaniske harnessrøtter, innen samlet kampanjegrense 12.

Rutineimplementering av disse godkjente kildefakta og nye korrekte assertions er scopearbeid.
Faktiske harnessrettinger krever uavhengig bevis for bevart kildebetydning, verdi, scope, kundevalg, dokumentprioritet og provenance. Før hver rot én gang.
Eksisterende typegen-rot belastes ikke på nytt.

Ingen ny semantisk korreksjonsfullmakt eller budsjettreset.
Historiske rapporterte 19/16 og 10/8 bevares.
Globalt resolved/open forblir UKJENT.

Stopp ved kildekonflikt, behov for ny canonical/mapping/selection/shared-endring, uforklart regresjon, integritetsavvik eller overskredet budsjett. Rutinearbeid innen fullmakten krever ikke nye spørsmål.

PERMANENTE REGRESJONER
Bevis:
- Eksakt standardformel og prosentgrunnlag.
- Eksakte alternative fastdeler og kildebestemte varianter.
- Fastdelens sykdom-/ulykke-/periodebetydning.
- Offentlig standard/valgmuligheter etablerer ikke kundens avtalte variant.
- Dokumentert kundeegenandel overstyrer katalog med bevart provenance.
- Ren prosentvariant bevares der kilde og etablert kontrakt støtter den.
- Kjent manuelt katalogprodukt følger eksisterende katalogkontrakt; ikke forvent fritekstoverstyring fra feil produktmodus.
- Rå og presentert provenance, sourceType, rekkefølge og deduplisering består.
- Selection-status mot baseline er uendret.
- Samme produkt og begge sammenligningsretninger.
- Alle øvrige produkter, komponenter og katalogmetadata er uendret.

Hvis strukturert beregning allerede finnes, test den faktiske beregningen med et meningsfullt eksempel. Ikke bygg ny beregningsmotor for denne bolken.

SLUTTGATE
På endelig kandidat:
- kildehash-/originalavsnittkontroll og source→catalog/reverse-audit
- B-050 og relevante egenandels-/dokumentprioritet-/manuell-/provenance-/enrichment-/comparison-regresjoner
- tidligere 12 receipts, B-022/B-018/B-071, shared/Liv-guard og supporting-terms
- komplett remedieringsmanifest og fullsuite, alle testfiler
- next typegen og TypeScript
- ESLint
- webpack production build
- HTTP/PDF-runtime
- diff, isolasjon, receipt-/checkpointintegritet

Rapporter faktiske testdenominatorer; ikke kopier gamle resultater eller bruk uautoriserte build-unntak.

FULLFØRING
Etter komplett PASS: lag individuell current completion-receipt kun for f8bd15c89bc0dbd6. Bevar alle tidligere receipts og holds.

Ikke øk historiske 414, rekonstruer globalt regnskap eller gi P2-kreditt.

Commit/push den eksakte atomiske bolken til main uten force etter diff-review. Kontroller remote-fremdrift før push; revalider hvis innhold endres.
Verifiser HEAD/origin/main/faktisk remote SHA og clean/staged=0.

Lagre faktiske logger, kandidatidentitet og receipts varig i Git. Ved blokkering: bevar arbeid og dokumenter den minste konkrete beslutningen som trengs; ikke hev completion.

Sluttrapport:
status, signatur, kildekontrakt, faktiske gater, mekaniske røtter/budsjett, receiptplassering, commit/remote SHA og neste sikre steg.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED.