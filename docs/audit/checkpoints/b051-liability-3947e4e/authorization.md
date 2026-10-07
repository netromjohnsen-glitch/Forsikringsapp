B-051 ANSVAR — AUTORISERT IMPLEMENTERING

Gjennomfør Ansvar-bolken fra preflight-rapporten. Dette er en
implementeringsoppgave med fullmakt til tester, receipts og atomisk
commit/push etter komplett PASS.

Les AGENTS.md, gjeldende workflow, checkpoint og preflight før arbeid.

FORVENTET BASELINE
3947e4e90b9ab09ea46dda659a2271d956ae1dd3

Verifiser faktisk HEAD, origin/main og remote main.
Avstem eventuelle nyere endringer uten å overskrive arbeid.

1. EKSAKT SCOPE

Kun signatur:
275365b3ec2971df

Bindinger:
- Gjensidige Hus: GAP-2104 / SF-3017.
- Gjensidige Hus Pluss: GAP-2163 / SF-3104.

Provider: Gjensidige.
Scope: ordinary.
Versjon: Alminnelige vilkår.
Ikrafttredelse: fortsatt ukjent.

Produksjonsfil:
lib/gjensidige-hus-catalog.ts

Endre bare hus.ansvar.dekning i gjensidigeHusStandard.
Pluss beholder eksisterende arv.

Implementer den komplette verdien fra preflightens
«Foreslått katalogdiff». Kontroller den på nytt mot originalene
før innsetting. Bevar alle kvalifikasjoner, unntak og særregler,
inkludert landbruk/bolandbruk, familie- og eierforhold,
avtalebasert ansvar, forurensning og kjøretøy-/båtavgrensninger.

Ikke importer byggeforsikringens særskilte byggherredekning.

Korriger primærhenvisningen til:
- Standard PDF-side 6.
- «Ansvar – Dekkes / Dekkes ikke».

Bevar kildeidentiteten gjensidigeHusStandard og øvrige
referansefelter. Verifiser den identiske Pluss-kontrakten separat
på PDF-side 7.

Bevar ansvarsgrensen på 5 millioner kroner og egenandelen
på 4 000 kroner.

Ingen nye rader, canonical keys, kilder eller sourceType-metadata.
Ingen engine-, mapping-, schema- eller selection-endringer.

2. KILDER

Verifiser frosne bytes mot:

Standard:
d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc

Pluss:
79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792

Kildekonflikt eller endret forsikringsbetydning krever stopp.

3. AUTORISERTE TESTENDRINGER

Opprett:
tests/remediation-b-051-liability.test.mjs

Godkjente kompatibilitetsoppdateringer:
- B-020s tre R-020-06-fingerprints.
- B-050s assertB050OutsideComponent.
- B-051s reverse-kontroll.
- Hage-, hendelser/bygging-, håndverksfeil-, oppgjør-,
  recovery-benefits- og physical-exclusions-testenes berørte
  forventningskataloger, canonical-/manuelle forventninger
  og reverse-referanser.

Bruk én eksplisitt, kildeverifisert radtransformasjon med
uavhengig baselinegrunnlag. Kandidaten skal ikke være dynamisk fasit.

Bevar tidligere transformasjoner og strenge full-field-kontroller.
Historiske auditpakker, snapshots, receipts og logger er immutable.

Test hele kildebetydningen, begge produktbindinger, arv,
kundeverdi/provenance, taushet, valg, avslag, konflikt,
dokumentroller, supportingEvidence, begge manuelle modi,
gjentatt enrichment, samme produkt og begge retninger.

Kontroller representasjonen i riktig lag:
raw facts, enriched terms, canonical facts og JSON-snapshots.
Bevar eksisterende aliasoverganger uten å tillate andre nye
identiteter eller duplikater.

4. ISOLASJON OG HOLDS

Bevis at bare den autoriserte raden og dens provenance endres.

Verifiser preflightens isolasjonsgrunnlag:
317 øvrige komponenter, 4158 øvrige råfakta, katalogmetadata
og 202 øvrige produkters effektive fakta.

Bevar B-020s skadedyrfakta, alle 53 tidligere receipts og samtlige
holds, inkludert HTU-konflikten, vannmapping, råtestatusfunnet
og SC-035/SR-031.

Rettshjelp og øvrige katalogkandidater inngår ikke.

5. BUDSJETT

HARNESS_AUTONOMY_V1 forblir 29/12 uten gjenværende kapasitet.

Kildegodkjent implementering, korrekte nye assertions og de
uttrykkelig forhåndsgodkjente kompatibilitetsoppdateringene
er planlagt scopearbeid.

Ingen nye korreksjonsunntak eller policyendringer autoriseres.
Ved en uventet rot: diagnostiser, samle berørte feil og stopp
før retting. Ikke omklassifiser en faktisk korreksjon som scopearbeid.

6. SLUTTVALIDERING OG BEVISPAKKE

Gjenbruk eksisterende helpers, receiptformat, duplikatbevisst
lintmatcher og sikret publish.py.

Tilpass eksplisitte revisjons-/outputparametre til den nye pakken.
Ikke endre historiske kjørere eller deres output.

Kjør:
- Ny målrettet gate og kilde-/bindings-/reverse-audit.
- Relevante B-007/B-020/B-050/B-051/B-071-regresjoner.
- Status, normalisering, provenance, supporting terms,
  enrichment, manuell input og comparison.
- Komplett faktisk remedieringsmanifest og fullsuite.
- Next typegen og TypeScript.
- ESLint med eksakt avstemming av eksisterende warnings.
- Webpack production build og HTTP/PDF-runtime.
- Receipt-, checksum-, lenke- og kandidatkontroller.
- Arbeidsdiff og staged diff --check.

Lag én kompakt revisjonsbundet auditpakke.
Referer til tidligere immutable pakker fremfor å kopiere dem.
Kontroller også nye/untracked filer før staging.

7. COMPLETION OG PUBLISERING

Etter komplett PASS:
- Opprett individuell completion-receipt kun for
  275365b3ec2971df.
- Oppdater checkpoint og kompakt prosjektstatus.
- Verifiser 54 unike dokumenterte kampanjesignaturer.
- B-051 skal være 28 fullført / 7 kandidater /
  2 revalideringskandidater / 2 holds.
- Globalt resolved/open forblir UKJENT. Ingen P2-kreditt.

Avstem fersk remote før publisering.
Bruk publish.py med eksakt staged-sett og kontrollerte exit-statuser.
Commit og push atomisk etter PASS; verifiser remote SHA,
ren arbeidskopi og staged = 0.

Ingen force-push, deploy eller senere bolk.

Rapporter kort: endring, gater, receipt, budsjett, commit,
repository-status og neste sikre steg.
