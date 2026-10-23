# Publiseringsfullmakt – katalogopprinnelse

Brukerens eksplisitte fullmakt 23. oktober 2026:

> Publiser den validerte katalogopprinnelsesbolken til main med commit og push. Kontroller fersk main først og bekreft rettelsen, receipt og prosjektstatus. Ingen deploy; behold alle HOLD. NITO og Sentralbord venter.

Fullmakten gjelder én atomisk commit og ordinær push til main av eksisterende
validert kandidat og tilhørende receipt/prosjektstatus. Basis er
`257a197aa016ba3c9567eeb4cebc8182d5e0aba5`; alle 14 kode-/testfiler er byte-identiske
med de åtte beståtte sluttgatene. Ingen ny kodeendring, installasjon eller deploy.
Alle HOLD, tellere og ventende NITO/Sentralbord beholdes.

Denne fullmakten erstatter bare det tidligere fraværet av commit/push-fullmakt
i [implementeringsfullmakten](authorization.md). [Preflight](publication-preflight.json)
bevarer den verifiserte opprinnelige pakkens filhasher.

Publiseringsrevisjonen er committen som inneholder rettelsen, receipt og
prosjektstatus. Publisert status gjelder etter kontroll på remote main;
basis-SHA og testet kandidatidentitet er separate bevis. Opprinnelig
[kandidatidentitet](candidate-identity.json) og [integritetsrapport](integrity-verification.json)
bevares som historiske beskrivelser av lokal validering. Ny
[publiseringsintegritet](publication-integrity.json) kontrollerer publiseringspakken.
