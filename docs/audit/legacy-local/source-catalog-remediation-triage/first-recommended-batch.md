# Første anbefalte implementeringsbatch: B-001

**Avgrens Gjensidige MC ferie-leie til dokumenterte nivåer.** Dette er et forslag for senere godkjenning; ingen rettelse er utført.

- Bølge: 1. Rotårsak: RC-101, tidligere SCRC-031 / RB-27.
- Funn: GAP-2361, signatur ab868c6b64912871; 1 P1-signatur / 1 forekomst.
- Positiv feil: tre `mc.leiekjoretoy.*`-påstander på Gjensidige MC Delkasko (CC-04481, CC-04482, CC-04483).
- Produkt: ["gjensidige","mc","ordinary","gjensidige-mc-delkasko",null]. Ingen tilleggsmodul. Familie MC, scope ordinary; ukjent kildeversjon/dato forblir ukjent.
- Eksakt lag: katalogforfatting/nivåpredicate, ikke sammenligningsmotoren.
- Fil: `lib/mc-bobil-gjensidige-storebrand-catalog.ts`, grenen på linje 343–346. `type === "mc" && tier !== "ansvar"` legger både bagasjeforbehold og Kaskos leie-MC-regel på Delkasko. Den legitime bagasjeraden må beholdes; bare leie-MC-radene skal avgrenses. Det finnes ingen Gjensidige MC Pluss i denne katalogen.
- Kilde: `catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf`, full pakke/PDF 3–4, SHA-256 `45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7`. Egen Kasko-kilde side 4 dokumenterer ferie-leie; fullført audit gjennomgikk Delkasko/IPID/produktside uten støtte for denne utvidelsen.
- Behold ordinær veihjelp, bagasje, Kaskos leie-MC og øvrige MC/Bobil-nivåer. Ingen omskriving av kildefravær til eksplisitt «ikke dekket».
- Risiko: lav; liten kataloggren. Kompleksitet TRIVIAL_DATA; modellen **GPT-6 SOL MEDIUM** er tilstrekkelig for godkjent avgrenset edit med kilde-/reviewkontroll.
- Kundepåvirkning: feil katalogpositiv kan ellers supplere kundemodus. Dokumentdata og valgt tilvalg skal fortsatt ha forrang. Ingen extraction-endring.

Hvorfor først: bekreftet positiv feil, ett eksakt nivå, tre uriktige reverse claims og eksisterende own-source negativ/positiv nivåkontroll. Ingen uavklart kildekonflikt eller canonical nykonstruksjon blokkerer. Dette velges foran automatisk gjenbruk av gammel RB-11: Storebrand flytting er også kildeklar, men krever større varsomhet rundt avtalt sum versus hendelsesbetinget særgrense. Raw occurrence count er ikke prioriteringsgrunnlaget.

Krav til regresjon: Delkasko får ikke Kasko-utvidelsen; Kasko beholder 15-dagersregelen og to-virkedagersvilkåret; bagasje/veihjelp beholdes; Ansvar og Bobil uendret; begge sammenligningsretninger; kildebindinger riktig; dokument X over katalog Y og optional-status. Test forventet kildebetydning, ikke bare at tre rader ble fjernet.

Post-fix: exact-level source→catalog + reverse-check av alle tre claims, held-out Kasko/bagasje/veihjelp, targeted MC bulk comparison, full suite/type/lint/build/synthetic runtime/diff. Fellesfilen er også brukt av Storebrand og Bobil: én fil-eier, ingen samtidige writes fra andre batcher.
