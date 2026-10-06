Fortsett Forsikringstolken i netromjohnsen-glitch/Forsikringsapp.

GitHub Mention-integrasjonen er avsluttet. Ikke bruk den til nye oppgaver. Den tidligere Treatment-kandidaten ee227f3d81a1a6e26c09feb45fad81fb4eb3761f er utilgjengelig og ble aldri publisert. Tidligere rapporterte tester fra denne kandidaten er ikke valideringsbevis for en ny implementering.

FULLMAKT
Gjennomfør en ny, selvstendig kildeverifisert implementering av bare:
- 4165f79344a7d572 — GAP-2868/SF-4017
- fbe23495ae09afb3 — GAP-2875/SF-4025
- 48393aac0a200fe5 — GAP-2880/SF-4031
- c5ccc4f26fd475ae — GAP-2907/SF-4060

Dette autoriserer ny implementering fra originalkildene, ikke rekonstruksjon av den utilgjengelige kandidaten eller gjenbruk av dens receipts.

PREFLIGHT
Les AGENTS.md, docs/development-agent/workflow.md, aktuelt checkpoint, next-treatment-proposal.md og gjeldende kampanjepolicy.

Bekreft repo, faktisk remote main, HEAD/origin/main, status og staged. Sist verifisert main:
16bfc4bd5db0b9dbfa9b8646f4aae902ba5d8d90

Undersøk eventuell senere remote-fremdrift og eksisterende brukerarbeid før endringer. Bevar alt arbeid; ingen reset, revert, force-push eller overskriving.

Kontroller tidlig at dette opprinnelige miljøet fortsatt har støttet autentisert GitHub-publisering. Ikke be om eller eksponer tokens. Hvis publisering mangler, stopp før implementering og rapporter konkret blokkering.

Registrer denne fullmakten varig før produksjonsendringer.

KILDEADMISSION
Godkjent separat identitet:
boat-pet:gjensidige:hund:treatment

Bevar boat-pet:gjensidige:hund uendret som IPID-identitet og bevar eksisterende referanser.

Frossen kilde:
catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf
SHA-256:
8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6

Registrer som full_terms, gjensidige, Hund, ordinary, med URL fra manifestet. Vilkårsnummer, versjon og ikrafttredelsesdato er ukjent. Ikke bruk beskrivende tittel som termsNumber eller innhentingsdato som versjon.

Produktnettsiden:
catalog/sources/boat-pet/gjensidige-dog-product.html
SHA-256:
fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58

Les hele relevante originalavsnitt på PDF-side 1–3 og tann-FAQ før implementering.

KONTRAKTER
1. Veterinær: sykdom/ulykke, valgt årssum og tak per skadetilfelle. Bevar kildebetydningen for samme sykdom og årsreset.
2. Medisin: foreskrevne medisiner/preparater, bandasje/beskyttelse, dokumentasjonskrav og innen valgt sum.
3. Tann: presise dekkede hendelser, kvalifikasjoner, unntak og sikkerhetsforskrifter.
4. Definisjoner: oppdagelsestidspunkt, alle utgifter fra samme sykdom/ulykke og «friskt dyr»-definisjonen.

Bruk eksisterende veterinær-, medisin-, tann- og begrensningsstruktur når faktisk kontrakt støtter det. Ikke endre sumvalgidentiteten.

AVGRENSNING
Tillatt:
- lib/boat-pet-catalog.ts
- tests/remediation-b-050.test.mjs
- eksakte kildeallowlist-/admissionassertions i øvrige tester når nødvendig
- bolkens authorization, audit, logger, rootledger, receipts og checkpoint-/plandokumentasjon

R-050-SOURCE kan oppdateres til eksakt registrert treatment-identitet/hash/type/scope. Dette er autorisert admissionarbeid, ikke en mekanisk retting.

Ingen nye canonical keys, schema-, engine-, mapping- eller selectionendringer.
Ingen egenandelsbolk, diagnostikkmapping, rehabilitering/SC-035, Katt-endringer, secrets, miljøendringer eller egen deployhandling.
Ikke merge test-PR #1 eller #2.

BUDSJETT
Verifiser gjeldende kampanjeføring. Sist dokumentert:
kampanje 6/12; ny bolk maks 3 mekaniske røtter innen samlet 12.

Autoriserte kildefakta/admission og nye korrekte assertions er scopearbeid. Faktiske harnessrettinger krever uavhengig ekvivalensbevis og føres én gang per rot. Eksisterende typegen-rot belastes ikke på nytt.

Ingen ny semantisk korreksjonsfullmakt eller budsjettreset.
Historiske rapporterte 19/16 og 10/8 bevares.
Globalt resolved/open forblir UKJENT.

Stopp ved reell kildekonflikt, uautorisert semantisk/shared/mapping/selectionendring, integritetsavvik eller oppbrukt budsjett. Rutinearbeid innen fullmakten krever ikke nye spørsmål.

VALIDERING
Kjør nye kontroller på den faktiske endelige kandidaten:
- kildehasher og komplette originalkvalifikasjoner
- source→catalog/reverse-audit, rå/presentert provenance og isolasjon
- B-050 og relevante B-022/B-018/B-071/shared/Liv/supporting-terms-regresjoner
- dokumentprioritet, manuell kontrakt, sumvalg og dokumentert kundesum
- selected/not_selected/unknown, konflikt, Liv/Bruk-avhengighet
- samme produkt og begge sammenligningsretninger
- komplett remedieringsmanifest og fullsuite, alle testfiler
- next typegen, TypeScript, ESLint, webpack production build
- HTTP/PDF-runtime og diff-/receiptintegritet

Avstem testmanifest og faktiske denominatore eksplisitt. Den utilgjengelige kandidatens rapport om 1685 remedieringstester skal ikke overtas som komplett gate.

Ingen uautoriserte build-unntak eller produksjonsendringer for å omgå miljøfeil.

FULLFØRING
Etter komplett PASS: lag individuelle current completion-receipts for bare de fire signaturene. Bevar de åtte eksisterende kampanjereceipts og alle holds. Ikke øk historiske 414 eller gi P2-kreditt.

Commit/push av den eksakte atomiske bolken til main er autorisert etter gate og diff-review, uten force. Kontroller remote-fremdrift før push og revalider dersom innhold endres. Verifiser publisert SHA og clean/staged=0.

Lagre alle nødvendige bevis varig i Git; ikke stol på /tmp eller chat som eneste lagring. Hvis en blokkering oppstår, bevar kandidaten og faktiske bevis gjennom støttet varig publisering på en egen gren, uten completion-påstand.

Rapporter kort: status, eksakte signaturer, faktisk validering, budsjett, receiptplassering, commit/remote SHA og neste konkrete steg.

CATALOG_PILOT_GATE forblir REMEDIATION_REQUIRED.
Ingen senere bolk autoriseres.