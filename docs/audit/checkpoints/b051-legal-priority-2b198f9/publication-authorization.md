# Publiseringsfullmakt 22. oktober 2026

Bruker: «Publiser den validerte Rettshjelp-bolken til main med commit og push. Kontroller fersk main først og bekreft publiseringen av rettelsen, receipt og prosjektstatus. Ingen deploy; behold øvrige HOLD og la NITO og Sentralbord vente.»

Denne fullmakten supplerer implementeringsfullmakten i authorization.md. Publiser bare den validerte bolken med uendrede produksjons-/testbytes, tilhørende bevispakke og prosjektstatus. Tillatte dokumentendringer før commit: oppdatert publiseringsstatus, denne fullmakten, eksakt filmanifest, preflight-/integritetsbevis og nye checksums med dokumentert differanse fra forrige segl.

Mål: én atomisk commit og vanlig push origin HEAD:main uten force. Baseline og fersk main er 2b198f9ebf52aa283056b3a052edf0fa0cdd311f. Eksakt tested_candidate_identity_sha256 er 06751b3b8e1f150d9a7226aee56876475884e33a8cd53656a234afd820340329. Sikret eksisterende publish.py brukes med expected-head og publish-files.json. Ved endret remote main stopper publisering før integrasjon/revalidering; ingen overskriving.

Publiseringsrevisjonen er committen som inneholder receipt og denne fullmakten. Publisert status gjelder først når committen er lest tilbake på remote main og rettelse, receipt og prosjektstatus er bekreftet. Fil- og gateidentiteten er bevart; den erstattes ikke med en påstand om at en ny commit-SHA er testet på nytt.

HTU og alle øvrige HOLD, B-051 37/0/1/1, kampanjetallet 63, global UNKNOWN, P2-kreditt 0 og REMEDIATION_REQUIRED beholdes. NITO og Sentralbord venter. Ingen deploy eller ny arbeidsstrøm er autorisert.
