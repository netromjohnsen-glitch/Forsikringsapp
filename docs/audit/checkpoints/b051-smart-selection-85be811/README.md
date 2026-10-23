# Hus Smart: produktbundet dokumentvalg

Basis main 85be811f596aa757f196f5f6f33f8fa0063b9123. Lokal branch fix/smart-document-selection.
[Fullmakt](authorization.md) og [kilde-/kontraktpreflight](source-and-contract-preflight.json).
[Commit og push er eksplisitt autorisert](publication-authorization.md). Rettingen,
receipt og prosjektstatus er publisert når denne committen er verifisert på remote main.
Ingen installasjon eller deployhandling.

## Kontrakt

Bare sikkert identifisert Gjensidige Hus Standard / Hus Pluss, ordinary,
Alminnelige vilkår. En felles valgregel brukes ved dokumentberiking og i
sammenligningens tilleggsvisning. Eksisterende identitet hus.service.smart og
komponent gjensidige-hus-smart beholdes. Ingen ny global alias/ekstraksjonsenum.

- Eksplisitt Valgt: selected.
- Avtalt Hus Smart i dokumentuttrekkets addOns uten motstrid/ukjent valgstatus: selected.
- Ikke valgt overstyrer tilleggslisten: not_selected.
- Både Valgt og Ikke valgt for samme kundepost: unknown/conflict; begge bevis beholdes.
- Bare Ukjent, omtale/detaljer eller generelle vilkår: unknown.
- Bare selected aktiverer komponenten og viser Smart som valgt tillegg.

Valg/Valgstatus/Status/Dekning inne i et dokumentert Hus Smart-tillegg kan
identifisere tilleggets valgstatus; samme overskrift uten denne konteksten er
ingen Smart-alias. Et avtalttillegg uten egne vilkår gir et dokumentfaktum Valgt,
avledet fra strukturert tilleggsbevis. Den faktiske pipelinen knytter kundepostens
kildehenvisning til dette faktumet. Rå tilleggsopplysninger beholdes.

Katalogens Smart-rader som berikes på dokumentert valg, re-resolveres på repeat
og gjøres ikke til nye dokumentbevis. Støttevilkår bruker samme eksakte
produktbundne identitet, med general_terms-opprinnelse og separat recordEvidence.
Kundeverdier, konfliktbevis og full provenance beholdes.

Valgt betyr dokumentert valg i kundeposten, også i tilbud. Det bekrefter ikke
installert/aktiv alarm eller at hendelsesvilkår for egenandelsreduksjon er oppfylt.
Ingen prisberegning, katalog-/kildetekst, betinget 8 000-kronersreduksjon eller
100 000-kroners tjenesteansvar endres.

## Kontrollgrunnlag

Den permanente Smart-valgtesten kontrollerer faktisk schema/pipeline, begge
produkter/sider, individual_agreement/unknown, positive og negative valg,
ukjent/konflikt, støttevilkår, kilder, repeat og sammenligning begge retninger.
Andre produkters kontrollerte input og eksisterende manuelle output sammenholdes
med en V8-baseline tatt før produksjonsendringen, med undefined-felter bevart.
[Baselineidentitet](baseline-identity.json), [testmanifest](test-manifest.json),
[gatekommandoer og logger](gate-results.json),
[testkontrakter og dokumenterte rettinger](test-contract-updates.json).
[Validering](validation-summary.json): 102 nye tester, 324/324 målrettet med gammel
Smart-gate, 5694/5694 fullsuite i 161 filer uten skip. Typegen/TypeScript, webpack-bygg,
0 lintfeil / 27 identiske warnings og syntetisk lokal HTTP/PDF 22/22 PASS.
12 ekstra dokument-over-manuell-prober PASS. Seks manuelle initial-/repeat-output
og 202 øvrige produkters kontrollerte berikingsresultater er eksakt baseline-identiske.
[Kandidatidentitet](candidate-identity.json),
[receipt](completion-receipt-smart-document-selection.json), [checkpoint](checkpoint.json),
[gjeldende Smart-funn](smart-customer-findings.json),
[bevarte feilforsøk](failed-attempts.json) og [main-kontroll](main-verification.json).
Bare de sju final_gate_labels i validation-summary.json gir sluttgatekreditt.
Tidligere PASS/FAIL beholdes med sine eksakte filidentiteter. Ingen gateunntak.

## Publiseringskontroller

[Preflight](publication-preflight.json) bekrefter fersk main, opprinnelig pakkesegl,
uendrede produksjons-/testbytes og sju sluttgater.
[Eksakt filmanifest](publish-files.json) brukes av eksisterende sikret publisher.
[Publiseringsintegritet](publication-integrity.json) dokumenterer de avgrensede
metadataendringene og nytt segl. candidate-identity.json, validation-summary.json
og integrity-verification.json er beholdte snapshots fra den lokale valideringen;
gjeldende publiseringsstatus føres i receipt/checkpoint.

## Uendret avgrensning

Den separate eksisterende feilen ved gjentatt dokumentberiking av et manuelt
Smart-valg beholdes. Seks manuelle initial-/repeat-output kontrolleres eksakt mot
baseline. De tidligere DATA_ONLY-Smart-receipts er ikke nye kundemodusreceipts.

HTU, insektunntak, SC-020/SR-032 (fysisk insektegenandel), SC-035/SR-031,
B-071-holdet og øvrige HOLD er uendret. B-051 37/0/1/1 og kampanjetallet 63 er
uendret; ingen originalsignatur- eller P2-kreditt. Global resolved/open UNKNOWN;
CATALOG_PILOT_GATE REMEDIATION_REQUIRED. NITO og Sentralbord venter.
Ingen ny arbeidsstrøm er startet.

## Integritet

[Forrige pakke](prior-packet-integrity.json) er byteidentisk.
[Beskyttede checkpointsett](protected-checkpoint-proof.json) er uendret.
[SHA256SUMS](SHA256SUMS) dekker pakkens filer unntatt seglet selv og
integrity-verification.json (opprinnelig validering) samt publication-integrity.json
(etterfølgende kontroll av publiseringsseglet).
