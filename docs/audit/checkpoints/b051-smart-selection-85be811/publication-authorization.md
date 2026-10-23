# Publiseringsfullmakt 23. oktober 2026

Bruker: «Publiser den validerte Smart-valgbolken til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold HTU og øvrige HOLD. NITO og Sentralbord venter.»

Supplerer authorization.md: publiser den validerte bolken med uendrede produksjons-/testbytes, tilhørende bevispakke og prosjektstatus. Bare publiseringsmetadata, denne fullmakten, eksakt filmanifest og preflight-/integritetsbevis oppdateres før commit. Nytt segl skal forklare differansen fra det verifiserte opprinnelige seglet.

Mål: én atomisk commit og vanlig push origin HEAD:main uten force. Fersk main og testet basis er 85be811f596aa757f196f5f6f33f8fa0063b9123. Testet kandidatidentitet er 319dcc9799ce28340f53a93a0c9b8cbcf5b1f57300329515cc151f572353cccf. Eksisterende sikret publish.py brukes med expected-head og publish-files.json. Endret remote main stopper publiseringen før integrasjon/revalidering; ingen overskriving.

Publiseringsrevisjonen er committen som inneholder receipt og denne fullmakten. Publisert status gjelder når committen er lest tilbake på remote main og rettelse, receipt og prosjektstatus er bekreftet. Den registrerte basis-/filidentiteten og de sju sluttgatene beholdes; ingen påstand om ny testkjøring på publiserings-SHA.

Manuell Smart-repeat forblir åpen. HTU og alle øvrige HOLD, B-051 37/0/1/1, kampanje 63, global UNKNOWN, P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. NITO og Sentralbord venter. Ingen deploy eller ny arbeidsstrøm er autorisert.
