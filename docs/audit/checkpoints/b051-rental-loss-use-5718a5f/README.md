# B-051 Utleie og brukstap — completion

Fem source-backed completion-receipts for Gjensidige Hus/Hus Pluss ordinary:

| Signatur | Standard GAP/SF | Pluss GAP/SF |
| --- | --- | --- |
| [08203cfa28493e63](receipt-08203cfa28493e63.json) | GAP-2089 / SF-2994 | GAP-2144 / SF-3078 |
| [8e8d82878deb95b5](receipt-8e8d82878deb95b5.json) | GAP-2090 / SF-2996 | GAP-2145 / SF-3080 |
| [b5b211cad16d32c6](receipt-b5b211cad16d32c6.json) | GAP-2091 / SF-2997 | GAP-2146 / SF-3081 |
| [4a844bae3be9dea8](receipt-4a844bae3be9dea8.json) | GAP-2100 / SF-3009 | GAP-2159 / SF-3096 |
| [8d28f56b17a9bae2](receipt-8d28f56b17a9bae2.json) | GAP-2116 / SF-3034 | GAP-2175 / SF-3121 |

[Fullmakt og originalbindinger](authorization.json) ble registrert før produksjonsendring.
Testet baseline: `5718a5fdcfe669d6afd11d4c27fe3a45ed24c175`, med eksakt endelig
[kandidatidentitet](application-identity.json). Publiserings-SHA fremgår av Git;
receipts hevder ikke at utestede andre revisjoner er validert.

## Kilde og kontrakt

Frosne fullvilkår Standard (SHA d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc), PDF 1, 3–5, 17;
Pluss (SHA 79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792), PDF 1, 3–4, 6, 18.
Alle relevante originalavsnitt ble gjennomgått samlet; fullside-ekstraksjonene er lagret som gzip.
[Uavhengig oracle](source-oracle.json) ble skrevet før katalogendring og er ikke avledet fra kandidatoutput.
Pluss arver Standard som før; de tilsvarende Pluss-klausulene er også kildeverifisert.
Ukjent ikrafttredelse bevares. Kildens eldre valgfrie sourceType-metadata er fortsatt fraværende;
produktpresentasjon beholder eksplisitt `sourceType: undefined`. Semantisk er de originale fullvilkår.
Ingen admission, engine, canonical, mapping, schema eller kilderegister endres.

Utleie krever registrering i beviset, villet skadeverk jf. §351, seks måneders mislighold én gang per leietaker,
utkastelse inntil 20 000 kr ved skadeverk ELLER mislighold, og etter dekket skade leietap utover summen for
rom godkjent for varig opphold. Kontrakt med depositum ELLER bankgaranti, parts-/leie-/flytte-/tvangsgrunnlag,
kopi og relevante opplysninger ved skade, subrogasjon for utbetalt beløp, fristene 14/14 dager og seks uker,
samt alle navngitte unntak er eksplisitte. Den eksisterende 10 000 kr-egenandelen er uendret.

Brukstap for egen bebodd bolig beholder markedspris for umøblerte rom, dekket hendelse på/i umiddelbar nærhet,
avtalt redning etter FAL §6-4 og blokkert ALL adkomst. Kun blokkert adkomst/naturskade har særgrensen
forsikringssummen og maks 10 millioner per kunde. Normalperioden inkluderer offentlig behandling,
tre måneder gjelder uten reparasjon/gjenoppføring, sparte utgifter/renter avkortes, og 50 % gjelder kun
perioden uten dokumenterte boutgifter annet sted. Utleietap beregnes etter leiekontrakt, korttid kun inngåtte kontrakter,
med samme normalperiode/tre måneder/avkortning; betalingsmislighold er særskilt.

## Isolasjon, fixtures og mekaniske røtter

[Eksakt diffbevis](catalog-delta.json): seks eksisterende rader, bare value og fire qualificationSource-tillegg.
Alle primærreferanser, canonical keys, etiketter og øvrige beskyttede felt er uendret.
316 hele komponenter, 4 152 øvrige råfakta og all katalogmetadata er identiske med baseline.
B-020s tre effektive produktfingerprints endres kun av brukstap/leietap. Gnager-/insektkontraktene,
53 arkiverte positive kontroller og SC-020/SR-032 bevares. Ingen rader ekskluderes fra fingerprinten.

[HARNESS_AUTONOMY_V1-røtter](harness-roots.json): seks uavhengige mekaniske kompatibilitetsrøtter,
scope 6/6, kampanje 5/12 → 11/12. De er R02006-fingerprints, legacy sourceType-forventning,
Ukjent-sentinelens verdi/provenance/rendering, B050s tre historiske whole-catalog reverse-auditer,
checksum-navnerom i ny verifikator og historiske checksums på uttrykkelig mutable statuspekere.
For akkurat status/start verifiseres gammel checksum mot opprinnelige Git-bytes; ny publiseringsmanifest
kontrollerer de oppdaterte pekerne. Alle gamle immutable bevisfiler kontrolleres fortsatt byte-for-byte.
Hver rot har uavhengig baseline-/kode-/kildebevis.
Subprocess-tilgang ved sandbox EPERM var kjøringsmiljø, ingen assertion-/produksjonsendring eller rot.
Korrekte nye statusassertions er valideringsarbeid. Historiske budsjetter endres ikke.

Kundetester bevarer eksplisitt valg/avslag/konflikt og meningsfull kundeverdi med komplett source-only provenance.
Ukjent-sentinel kan få eksisterende katalogfallback på basisrader; tilgjengelig Utleie velger ikke kundetillegg.
Kjent manuelt katalogprodukt med eksplisitt addOnIds følger egen eksisterende kontrakt.
Begge sammenligningsretninger, samme produkt og provider/type/variantisolasjon er permanente kontroller.

## Ferske sluttgater

[Gate-resultater](gate-results.json), [oppsummering](validation-summary.json),
[full testmanifest](test-manifest.json) og [komplett remedieringsmanifest](remediation-manifest.json):
B051 15/15, B007 20/20, B020 11/11, B050 97/97, B071 97/97,
fullsuite 146 filer / 3970 PASS, remediering 48 filer / 1819 PASS.
Typegen, TypeScript, ESLint 0 feil, webpack production build, HTTP/PDF-runtime 22/22 og diffkontroll PASS.
Ingen build-unntak brukt. Alle kommandoer, returnkoder, faktiske tall og komprimerte logger er bevart.
Tidlige feilforsøk bevares som diagnoser og brukes ikke som closure-bevis.

[26 tidligere receipts](prior-receipts.json) og alle deres checksum-pakker er uendret.
[Checkpoint](checkpoint.json): 31 unike dokumenterte signaturer. Globalt resolved/open er **UKJENT**;
historisk closure rekonstrueres ikke og ingen P2 krediteres. De øvrige 34 B051-signaturene får ingen
ny status i denne bolken. Alle uttrykkelige holds, særlig SC019, vannmapping, SC020, SC035 og B071-holdet, beholdes.

Ingen senere bolk er autorisert. Neste beslutning er et eksakt nytt source-clear B051-scope fra eksisterende preflight.
Publisering krever `verify.py`, eksakt staged-sett, checksums og både arbeidsdiff/staged diffkontroll,
deretter den uendrede sikrede `publish.py`. Ingen egen deployhandling.

`CATALOG_PILOT_GATE = REMEDIATION_REQUIRED`
