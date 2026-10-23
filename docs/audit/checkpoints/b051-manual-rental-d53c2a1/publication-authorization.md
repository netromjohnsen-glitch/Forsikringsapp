# Publiseringsfullmakt 23. oktober 2026

Bruker: «Publiser den validerte manuelle Utleie-valgbolken til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Supplerer authorization.md: publiser bare den validerte manuelle Utleie-valgbolken,
bevispakken og prosjektstatus. Produksjons- og testbytes endres ikke. Bare
publiseringsmetadata, fullmakten, filmanifest og preflight-/integritetsbevis
oppdateres. Opprinnelig segl og alle filer er verifisert før metadataendringene;
publication-preflight.json bevarer hashene og forklarer nytt segl.

Mål: én atomisk commit og vanlig push origin HEAD:main uten force.
Fersk main/testet basis: d53c2a1d60c907e71ad8f626a4a788d29f5ba203.
Testet kandidatidentitet: 62f34b58b8105d23b640411184d78d3d67c75bfd5152debbad451f42d37b0b5f.
Eksisterende sikret publish.py brukes med expected-head og publish-files.json.
Endret remote main eller feil i diffkontroll/commit stopper publiseringen.
Ingen produksjons-/testendring eller ny applikasjonstestkjøring trengs.

Publiseringsrevisjonen er committen som inneholder receipt, prosjektstatus og
fullmakten. Publisert status gjelder etter at committen er lest tilbake på remote
main og rettelse, receipt og prosjektstatus er bekreftet. Testet basis-SHA og
kandidatidentitet beholdes separat; publiserings-SHA hevdes ikke separat testet.
Åtte sluttgater beholdes; alle ni gatelogger inkludert tidligere forsøk bevares.

Bolken lukker bare manuell Utleie-videreføring. Rene dokumentforløp beholdes som før.
HTU og øvrige HOLD, B-051 37/0/1/1, kampanje 63, global UNKNOWN, P2-kreditt 0 og
REMEDIATION_REQUIRED beholdes. NITO og Sentralbord venter. Ingen deploy eller ny arbeidsstrøm.
