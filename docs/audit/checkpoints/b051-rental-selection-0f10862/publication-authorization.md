# Publiseringsfullmakt – 23. oktober 2026

Bruker: «Publiser den validerte dokumentbaserte Utleie-bolken til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Supplerer [implementeringsfullmakten](authorization.md). Publiser bare den validerte
dokumentbaserte Utleie-bolken for Gjensidige Hus Standard og Hus Pluss,
bevispakken og prosjektstatus. Ingen produksjons-/testbytes endres ved publisering.
Kun publiseringsmetadata, denne fullmakten, filmanifest og preflight-/integritetsbevis
oppdateres. Opprinnelig segl og alle 47 filer ble kontrollert før metadataendring;
publication-preflight.json bevarer hashene og forklarer nytt segl.

Mål: én atomisk commit og vanlig push origin HEAD:main uten force.
Fersk main og testet basis: 0f1086206e9aa713681d84ebe55766196e1a7609.
Testet kandidatidentitet: 32a8af8dd817ca84f42712bfa74148748748b86160aff1a74edec1e935d7d75a.
Alle syv produksjons-/testfiler er identiske med alle åtte sluttgater.
5895/5895 tester i 164 filer; 722 målrettede; HTTP/PDF 22; øvrige gater PASS.
Ingen ny applikasjonstestkjøring trengs når fersk main/basis og testede bytes er like.
Alle 26 gatelogger, også tidligere FAIL og PASS, beholdes med egen kandidatidentitet.

Eksisterende sikret publish.py brukes med expected-head og publish-files.json.
Endret remote main eller feil i diffkontroll/commit stopper publiseringen.
Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og prosjektstatus.
Publisert status gjelder etter bekreftet tilbakelesning på remote main. Basis-SHA
og kandidatidentitet er fortsatt testbeviset; publiserings-SHA hevdes ikke separat testet.

Ingen ny originalsignatur-kreditt. B-051 37/0/1/1, kampanje 63, global UNKNOWN,
P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. HTU og alle øvrige HOLD, NITO WAIT
og Sentralbord WAIT_SEPARATE beholdes. Ingen deploy eller ny arbeidsstrøm.
