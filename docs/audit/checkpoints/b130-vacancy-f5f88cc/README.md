# Fraflyttet bolig – validert B-130-bolk

Basis/fersk main: `f5f88cc08f7cd863c9ce5d618319fa06fa9c1493`.
Branch: `fix/house-vacancy`. Publiseringsrevisjonen er committen som inneholder
bolken; publisert status gjelder etter bekreftelse på remote main.
[Publiseringsfullmakt](publication-authorization.md), [førkontroll](publication-preflight.json)
og [publiseringsintegritet](publication-integrity.json). Ingen installasjon eller deploy.

[Fullmakt](authorization.json), [forutgående beslutning](../b130-vacancy-review-f5f88cc/decision-597df4c45c6d3db9.json),
[kildekontrakt](source-oracle.json), [receipt](completion-receipt-597df4c45c6d3db9.json),
[validering](validation-summary.json), [checkpoint](checkpoint.json),
[kandidatidentitet](candidate-identity.json) og [source/reverse-audit](source-and-reverse-audit.json).

597df4c45c6d3db9 / CR-224 er implementert for Hus Standard GAP-2122/SF-3049 og
Hus Pluss GAP-2181/SF-3136, bare ordinary / Alminnelige vilkår. Begge original-PDF-er
har samme regel på side 2: ikke bebodd siste tolv måneder gir fraflyttet bolig,
med bare brann- og naturskadedekning dersom annet ikke er avtalt.
Én produksjonsfil tilføyer to kildebundne rader for `hus.fraflyttet.begrensning`.
Pluss beholder egen primærkilde og erstatter bare arvet rad med samme nøkkel.

Raden er et vilkår, ikke en ny valgt dekning eller bevis for kundens bosituasjon.
Eksisterende produktbundet eksakt etikettmatching gir kundens særavtale forrang;
ingen navneheuristikk, alias, schema, motor, global normalizer eller presentasjon endres.
Supporting terms forblir evidens/katalog, og gjentatt beriking/JSON beholder kilder
og metadata. Smart/Utleie/råte, Rettshjelp, priser og generell egenandel er uendret.

54 nye kontrakttester; 2326/2326 målrettede og 6018/6018 fullsuite i 166 filer.
Typegen/TypeScript, ESLint 0 feil / 27 eksakt uendrede warnings, webpack-bygg og
lokal syntetisk HTTP/PDF-runtime 22/22 PASS. Alle åtte sluttgater har samme kode-/testidentitet.
[Før-baseline](baseline-identity.json) og [mekanisk rettingslogg](autonomous-mechanical-corrections.json)
skiller beviste aktive forventningsendringer fra produksjonskontrakten. 214 tidligere
manuelle input og 144 dokumentforløp bevarer alle tidligere felt; bare den strengt
kildekontrollerte nye raden er prosjektert bort ved gamle snapshots. Nye rader og
full metadata kontrolleres separat mot før-implementeringsoraklet. Ingen testsaker
eller historiske bytes fjernes; tidlige FAIL beholdes med egne identiteter og logger.

[Beskyttet status](protected-status-verification.json) og [tidligere pakkers integritet](prior-packets-integrity.json).
49 filer i forrige publiserte pakke og de to lokale lesende pakkene er uendret.
Basis-main har 63 publiserte kampanjesignaturer; 64 inklusive denne ene opprinnelige
B-130-signaturen gjelder etter bekreftelse av den inneholdende committen på remote main.
Dette er ikke et rekonstruert globalt resolved/open-register. B-051 forblir 37/0/1/1. P2-kreditt 0 og globalt UNKNOWN.
Alle HOLD, inkludert HTU, bekjempelsesunntak og fysisk insektegenandel, beholdes.
Øvrige tre B-130-reviews står åpne; sikkerhet/GDPR/P3-A05, person/pilotscope,
kritisk UX, feedback og rådgiveraksept beholdes synlige. REMEDIATION_REQUIRED består.
NITO og Sentralbord venter. Ingen ny arbeidsstrøm. Commit/push er eksplisitt autorisert.

Opprinnelig kandidatidentitet, integritetsrapport, protected-status-verification og
main-verification beskriver den lokale valideringen før publiseringsfullmakten og
beholdes uendret. [Publiseringsførkontrollen](publication-preflight.json) bevarer alle
44 opprinnelige filhasher og hashen av prosjektstatus før metadataoppdatering.
De syv filene i de to forutgående lokale pakkene publiseres uten byteendring.
Gjeldende SHA256SUMS forsegler alle pakkefiler unntatt selve checksumfilen og
publication-integrity.json. Sistnevnte kontrollerer checksumfilen og er selv bundet
av Git-commit og kontroll av staging; slik unngås sirkulære hasher.
