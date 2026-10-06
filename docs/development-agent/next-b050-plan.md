# B-050-plan — Liv og Behandling FULLFØRT; resterende bolker NOT_AUTHORIZED

Opprinnelig read-only plan på ef5b0bc; oppdatert etter Liv-completion.
Liv-bolk A og Behandling-bolk C er eksplisitt autorisert og fullført PASS; øvrige bolker er ikke autorisert. Dette er ikke en gjenåpning av tolv dokumenterte
kampanjekontrakter eller en påstand om globalt OPEN-sett.
[Inventaret](../audit/checkpoints/development-agent-ef5b0bc/remaining-b050.json) inneholder
de fire gjenværende eksakte originalbindinger, RC-026, produktidentitet, kildehash og arkivets forslag.
[Originalplanen](../audit/legacy-local/source-catalog-remediation-triage/remediation-batches.md)
og [triage.json](../audit/legacy-local/source-catalog-remediation-triage/triage.json) definerer
B-050; source-clear i historisk plan betyr verken runtime-admission eller fullmakt i dag.

Felles scope er Gjensidige/Hund/ordinary, basis gjensidige-hund-behandling; Liv/Bruk er
separate valgfrie komponenter. Vilkårsversjon er ukjent; 2026-09-29 er innhentingsdato.
Ingen P2 foreslås lukket. Katt, andre providers og de fire tidligere receipts bevares.

## Kontrollert kildegrunnlag

Originalbytes er kontrollert mot alle tre forventede SHA-256 i B-050-evidence:

- Produkt: catalog/sources/boat-pet/gjensidige-dog-product.html,
  fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58.
  Registrert product_page: boat-pet:gjensidige:hund:product.
- Liv/Bruk: catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf,
  90536e3520ee46f476f480be9760bc92bd40162e29fd53e914df44b70ea150ea.
  Registrert full_terms: boat-pet:gjensidige:hund:life-use.
- Behandling: catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf,
  8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6.
  Eksplisitt produksjonsregistrert som boat-pet:gjensidige:hund:treatment, full_terms. Vilkårsnummer/versjon/ikrafttredelse ukjent. Bare den autoriserte fire-signaturbolken er implementert.

[Lesebeviset](../audit/checkpoints/development-agent-ef5b0bc/source-review.json) lagrer
reproduserbar PDF-side/trykt-side-kobling og originalavsnitt: PDF 1/2/3/8 = trykt 5/6/7/13.
Produktets relevante seksjoner er gjennomgått samlet. Ingen kilderefresh eller filendring.

## A — Liv-kvalifikasjoner og opphør (fullført)

Status COMPLETED_PASS etter eksplisitt brukerfullmakt. Se [completion-receipts](../audit/checkpoints/b050-liv-completion-04534f8/README.md).
Fire selvstendige kontrakter; felles RC-026 er ikke bevis på én korreksjonsrot.

| Signatur | Binding | Nødvendig representasjon / bevis |
| --- | --- | --- |
| 5839d2c13e186676 | GAP-2894 / SF-4046 | dyr.liv.dekning i gjensidige-hund-liv: valgfri Liv med død/avlivning av dyrevelferdshensyn ved sykdom/ulykke, tyveri og bortkomst. PDF 2/trykt 6; avlivnings-/veterinærdokumentasjon PDF 8/trykt 13. Ingen Katt-regler kopieres inn. |
| 373413bc13517ff4 | GAP-2896 / SF-4048 | dyr.liv.begrensning: tidligere sykdom og første 20 dager, også sumøkning/utvidelse; presise medfødte-/HD-/korsbånd-/tannkvalifikasjoner og veterinærkrav. PDF 2/6, 8/13. Ingen generell «før fire måneder» som skjuler alternative krav. |
| 72170f7dfe5c91b6 | GAP-2897 / SF-4049 | dyr.liv.opphor: hovedforfall i året 8/12/10, eksakte raselister/fallback. PDF 2–3/6–7. Eierskifte separat. Ikke bland opphør med 5/7/9-års sumreduksjon eller Bruks opphør ved 8 år. |
| 8c14a1328e5080cf | GAP-2899 / SF-4051 | dyr.liv.begrensning: politimelding og etterlysning ved annonsering; bortkommen Hund utbetales tidligst tre måneder etter melding til Gjensidige og politiet og annonsering. PDF 8/13. Ikke gjør dette til tre måneders karens ved kjøp eller automatisk universell tyveriventetid. |

Bevar alle øvrige materielle kvalifikasjoner i originalavsnittet. HD krever begge foreldre
HD-frie av NKK og egne bilder avlest NKK. Korsbånd krever sammenhengende veterinærdekning
fra før fire måneder ELLER minst ett år før skaden. Bittfeil/feilstilling har egen attest
7 uker–4 måneder uten anmerkning. Bevar import-/Mattilsyn-/tollkrav, forebyggende-/atferdsunntak
og forholdsmessig reduksjon ved annen erstatning der de kvalifiserer denne kontrakten.
Avlivning krever relevant behandling og begrunnet veterinærattest; usikker diagnose har
obduksjonsvilkår og inntil 1 500 kr nødvendig obduksjon. Slike kvalifikasjoner er vilkår,
ikke en selvstendig ny dekning eller garantert kundesum.

8-årslisten: Berner sennenhund, Blandingsrase Stor, Grand Danois, Irsk Ulvehund, Leonberger,
Newfoundlandshund, Pyrenéerhund, Napolitansk Mastiff, St. Bernhardshund.
12-årslisten: Bichon Havanais, Blandingsrase Liten, Border Terrier, Cairn Terrier, Chihuahua,
Chinese Crested, Dvergschnauzer, Finsk Lapphund, Finsk Spets, Foxterrier, Islandsk Fårehund,
Jack Russel Terrier, Lhasa Apso, Toy-, Dverg- og Mellompuddel, Kleiner og Grosser Münsterländer,
Norrbottenspets, Norsk Buhund, Papillon, Phalène, Schnauzer, Shih Tzu, Softcoated Wheaten Terrier,
Tibetansk Spaniel, Tibetansk Terrier, Västgötaspets, Welsh Springer Spaniel,
West Highland White Terrier, Whippet. Øvrige raser: 10 år.
Fullvilkårene har ikke mankehøydegrensene fra nettsiden. Nettsidens >55, 45–55 og <45 cm
må ikke flyttes inn som fullvilkårstekst eller brukes til å gjette eksakte grensetilfeller.
Bolken kan bruke PDF-listene uten nye høydeklassifiseringsregler.

Minste filer: lib/boat-pet-catalog.ts (kun Hund Liv), tests/remediation-b-050.test.mjs,
ny receipt/rootregnskap/checkpoint. Eksisterende register har dekning/begrensning/opphor;
begrensning og opphor er ikke-assertive. Samle samme canonical begrensningsrad uten å la
flere rader overskrive hverandre, og bruk presise kvalifikasjonskilder per rad.
Bevar Valgfri modul-identitet, Liv/Bruk-avhengighet og unknown uten dokumentert valg.
Ingen register-/engine-endring inngår. Hvis eksisterende representasjon likevel ikke
bevarer optional/status/provenance, stopp før utvidelse.

Tester: fire individuelt lukkbare kildekontrakter, alle rasenavn og fallback,
hovedforfall vs alder, karens vs erstatningsventetid, eksplisitt valg/avslag/konflikt,
begrensning/opphør alene uten Liv-valg, dokumentprioritet, samme produkt og begge retninger,
Bruk-avslag uten fjerning av Liv, provider-/Katt-isolasjon. Felles sluttgate nedenfor.
Risiko MEDIUM: lange negative vilkår må ikke endre hoveddekningens status.
Historisk beslutningskrav (nå oppfylt): autoriser eksakt fire-signaturbolk med disse filer/kontrakter/gater,
mekanisk grense 3 i nytt scope, gjenværende kampanjegrense 12 (brukt 4), receipt og atomisk
commit/push etter PASS. Ingen ny semantisk korreksjonsfullmakt eller kildeadmission.

## B — Offentlig egenandelskontrakt

NOT_AUTHORIZED. f8bd15c89bc0dbd6 — GAP-2872/SF-4021.
Produktseksjon «Hva er egenandelen?» dokumenterer Behandling: 1 300 kr fast per sykdom/
skadetilfelle + 20 % av resten; senere regninger i samme tilfelle bare 20 %. Mulige høyere
faste valg 2 000/3 500 kr, uten antatt kundens valg. Behandling-PDF 8 beskriver også ren
prosentvariant etter bevis, men denne auditkilden kan ikke brukes som runtime-provenance
før separat admission. Ikke hev at nettsiden selv dokumenterer ren prosentvariant.
Eksisterende dyr.veterinar.egenandel.fast/prosent kan beskrive offentlig valg og bevare
«Fremgår av forsikringsbeviset»; avklar downstream-format/standard vs kundesum før kode.
Krever eksplisitt katalogfullmakt og avgrensning av PDF-kvalifikasjonen; ingen automatisk
kundeegenandel. Filer katalog/B-050-gate/receipt. Tester dokumentert kundeegenandel vinner,
per tilfelle != per regning, produkt-/kundemodus, Liv/Bruk ingen egenandel, isolasjon.
Selvstendig formelrot; ikke legg under en Liv-rot for å spare budsjett.

## C — Behandling: periodetak, medisin, tann og definisjoner

COMPLETED_PASS etter eksplisitt fullmakt og separat kildeadmission.
[Fire nye completion-receipts](../audit/checkpoints/b050-treatment-completion-16bfc4b/README.md)
beviser kun 4165f79344a7d572/GAP-2868/SF-4017,
fbe23495ae09afb3/GAP-2875/SF-4025, 48393aac0a200fe5/GAP-2880/SF-4031 og
c5ccc4f26fd475ae/GAP-2907/SF-4060. Kilde: PDF 1–3/trykt 5–7 og tann-FAQ.

Veterinærdekning beskriver sykdom/ulykke, valgt årssum og tak per skadetilfelle.
Veterinærbegrensning bærer samme sykdom/ulykke, oppdagelsestid, friskt dyr og
materielle sykdomskvalifikasjoner. Medisin og Tann bruker eksisterende separate
canonical familier. Tannbegrensning bevarer unntak, sikkerhetsforskrifter og
kildebundet dokumentasjonskrav. Sumvalgidentitet, kundesum, egenandel, Katt og
Liv/Bruk er bevart. Ingen ny canonical nøkkel, engine eller shared-selectionendring.

Admission gjelder boat-pet:gjensidige:hund:treatment, full_terms, med ukjent
vilkårsnummer/versjon/ikrafttredelse. Root-ID boat-pet:gjensidige:hund er fortsatt
IPID. Admission autoriserer ikke andre avsnitt eller gjenværende signaturer.

## D — To forskjellige diagnostikkregler

NOT_AUTHORIZED; beslutningsgrense før implementering.
7b2587a3bbc0c772 — GAP-2876/SF-4027: nettside MR og CT, 5 000 kr per år ELLER
skadetilfelle, innen valgt forsikringssum.
b5792662cc2fa9f8 — GAP-2884/SF-4036: Behandling PDF 1 og 3/5 og 7, 3 000 kr for
ledd-/ryggundersøkelse frem til diagnose, selv når skaden ikke dekkes.
Arkivet foreslår dyr.diagnostikk.grense for begge. Dagens register har én slik detaljidentitet;
identiske keys må ikke kollidere eller bli første-treff-regler som mister den andre grenen.
Bevar ulikt objekt/formål, beløp, periode og unntak. Anbefalt neste steg er read-only
representasjonsbeslutning: bevis om én strukturert, kildebundet eksisterende detalj kan
vise begge vilkår uten at dokumentets spesifikke grense overstyrer feil gren. Hvis ikke,
kreves ny eksplisitt canonical/mappingbeslutning. Ingen slik beslutning tas i dette oppsettet.
Behandling-admission er nå utført; dette gir ikke fullmakt til diagnostikk. Mulige senere filer katalog/register/presentasjon/
normalisering avhenger av beslutningen; ingen av dem autoriseres nå.
Tester må bevise begge fakta samtidig, grenvis dokumentprioritet, begge retninger, ingen
samme-key-tap og ingen selection fra støttevilkår. To uavhengige kilderegler + eventuell
mappingrot, ikke en mekanisk harnessrot. Risiko HIGH.

## E — Rehabilitering / SC-035

NOT_AUTHORIZED. c1440948744bfa17 — GAP-2893/SF-4045.
Behandling PDF 8/13: gjennomført innen tre måneder etter veterinærforeskrivelse, på
veterinærklinikk eller henvist behandlingssted. Frist gjelder fullføring, ikke bare oppstart.
Eksisterende katalog har dyr.rehabilitering.grense 5 000 kr i basis. Detaljen er ikke blant
de eksakte ikke-assertive nøklene; positiv detail-evidence kan derfor påvirke selection.
Ikke klassifiser dette automatisk som feil eller gjør shared-fix under katalogfullmakt.
SC-035/SR-031 må avklare nettsidens inkluderte kiro/fysio/akupunktur vs valgfrie svømming/
vanntredemølle og PDF-ens fysikalsk/rehabilitering. Kildeprioritet alene løser ikke modalitet/
komponentvalg. PDF-admission er nå utført; egen selection-/SC-035-kontrakt og implementeringsfullmakt gjenstår.
Foreslått eksisterende dyr.rehabilitering.begrensning kan bære frist/sted, men først etter
komponentscopebeslutning. Senere filer: katalog og B-050-gate; eventuell selectionretting
må autoriseres separat etter read-only analyse. Tester basis/tillegg/modaliteter, frist,
avslag/unknown/valgt, vilkår uten valg, dokumentprioritet og provider-isolasjon.
Risiko HIGH, hold SC-035 åpen; ingen automatisk semantic/root-budgetøkning.

## Gater, budsjett og minste beslutning

For hver fremtidig autorisert bolk: nye korrekte assertions er validering, kildeverifisert
forhåndsgodkjent katalogarbeid er ikke automatisk correction-budgetforbruk. Planlagt
korreksjonsforbruk 0; faktisk hver uavhengig feilaktig harnessrot føres etter bevis.
Ny bolk kan bruke maks 3 mekaniske røtter hvis fullmakten aktiverer samme kampanjepolicy,
med samlet brukt 9/12 før neste start. Kapasitet 3 er ikke forhåndsgodkjenning. Ingen semantisk
korreksjonsfullmakt, økning eller reset av historiske 19/16 og 10/8 foreslås.
Budsjett-/kontraktsuklarhet stopper den avhengige delen.

Fullgate på ferdig bolk: faktumvis kildehash/provenance, source→catalog og reverse-audit,
B-050/B-022/B-018/B-071, Liv-guard, shared grensedetalj, supporting-terms,
Hund/Katt, normalisering/enrichment/dokumentprioritet/manuell input og sammenligning
(produkt/kunde, samme produkt, begge retninger), alle gjeldende remedieringsgater,
fullsuite, next typegen + tsc, ESLint 0 feil, webpack build, syntetisk HTTP/PDF-runtime,
diff/integritet. Bruk aktuelle kommandoer fra gate-results, ikke historiske PASS som ny gate.
Bevar closed-campaign gjenverdi/minimum 5 000/Død-sum, Bruk/Liv og eksakt shared-fix.
Nye receipts gjelder testet aktuell kandidat; globalt regnskap forblir UKJENT.

Aktuell rekkefølge: A og C er fullført PASS. Neste minste katalogscope er B,
PUBLIC_DEDUCTIBLE, kun f8bd15c89bc0dbd6 — GAP-2872/SF-4021, etter eksplisitt
fullmakt for den presise kildebeviste egenandelskontrakten og fullgate. Ikke endre
kundens egenandel ut fra offentlig tilgjengelige alternativer. Planlagt korrigerings-
forbruk er 0; ny bolk krever sin egen maks 3-røtters scopeautorisasjon innen 9/12.
D krever fortsatt selvstendig read-only mappingavklaring for de to forskjellige
MR/CT- og ledd/rygg-reglene. E krever selvstendig SC-035-/selectionbeslutning.
Den gjennomførte PDF-admissionen opphever ingen av disse grensene.

[Behandling-completion](next-treatment-proposal.md) er historisk oppfylt fullmakt;
den gir ikke fullmakt til resterende bolker. Globalt resolved/open forblir UKJENT.
