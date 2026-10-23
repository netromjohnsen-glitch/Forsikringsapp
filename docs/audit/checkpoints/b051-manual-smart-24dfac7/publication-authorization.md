# Publiseringsfullmakt 23. oktober 2026

Bruker: «Publiser den validerte manuelle Smart-valgbolken til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Supplerer authorization.md: publiser bare den validerte manuelle Smart-valgbolken,
bevispakken og prosjektstatus. Produksjons- og testbytes endres ikke. Bare
publiseringsmetadata, denne fullmakten, filmanifest og preflight-/integritetsbevis
oppdateres. Opprinnelig segl og alle filer er verifisert før metadataendringene;
publication-preflight.json bevarer hashene og forklarer nytt segl.

Mål: én atomisk commit og vanlig push origin HEAD:main uten force.
Fersk main/testet basis: 24dfac79717f3efeab7302ce4fa8010de64da3d2.
Testet kandidatidentitet: c0d109ba7e8fa868aa7d908cecb59265db4bedba6d92824babd5030a3314e8d4.
Eksisterende sikret publish.py brukes med expected-head og publish-files.json;
den stopper ved endret remote main og ved feil i diffkontroll eller commit.
Ingen endring i validerte applikasjonsfiler eller ny testkjøring er nødvendig.

Publiseringsrevisjonen er committen som inneholder receipt, prosjektstatus og
fullmakten. Publisert status gjelder etter at denne committen er lest tilbake på
remote main og de eksakte filene er bekreftet. Testet basis-SHA, kandidatidentitet
og åtte sluttgater beholdes; publiserings-SHA hevdes ikke separat testet.

HTU og øvrige HOLD beholdes. B-051 37/0/1/1, kampanje 63, global UNKNOWN,
P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. NITO og Sentralbord venter.
Ingen deploy eller ny arbeidsstrøm er autorisert.
