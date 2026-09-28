# MC og Bobil: kildegrunnlag og integrasjon

Start: `0411e8b47cc80033c2df5b907c950b5a05ee9820`, clean `main`.
Målt baseline: 1526/1526 tester, 121 produkter, 253 kildeposter, 44 tillegg.
Dette arbeidet publiserer ikke produksjon og behandler ingen kundedokumenter.

## Faseport før katalogimplementasjon

Alle tolv pakker ble klassifisert før katalogkode ble skrevet. Kildene er
gjeldende lenker fra offisielle produktsider, ikke bevis for kundens valg.

| Provider | MC | Bobil | Scope |
| --- | --- | --- | --- |
| Tryg | READY: Ansvar/Delkasko/Kasko/MC Ekstra | READY: Ansvar/Delkasko/Kasko/Bobil Ekstra | ordinary |
| If | READY: Ansvar/Delkasko/Kasko | READY: Ansvar/Delkasko/Kasko/Super | ordinary |
| Gjensidige | READY: Ansvar/Delkasko/Kasko | READY: Ansvar/Delkasko/Kasko/Pluss | ordinary |
| Storebrand | READY: Ansvar/Delkasko/Kasko | READY: Ansvar/Delkasko/Kasko/Super | ordinary |
| Fremtind | READY: Ansvar/Delkasko/Kasko | READY: Ansvar/Minikasko/Kasko/Topp | ordinary-sparebank1 / ordinary-dnb |
| Frende | READY: Ansvar/Delkasko/Kasko | READY: Ansvar/Delkasko/Kasko/Utvidet | ordinary |

READY betyr tilstrekkelig dokumentasjon for sikre produktnivåer og representative
facts. Det betyr ikke at alle vilkårsunntak eller alle medlems-/kanalprodukter er
kartlagt. Pakkenes manifest og de tre separate kilderevisjonene dokumenterer
datoer, versjoner, hash, originalfil, applicability og kjente avvik.

## Canonical design

Eksisterende objektstrategier for `mc` og `bobil` gjenbrukes uendret. Produkt er
provider + type + agreementScope + produkt-ID + versjon; produkt er ikke objekt.
Ingen indeksmatching, modell-/merkenavnmatching eller nye identitetsstrategier.

`mc-bobil-registry.ts` er et typeavgrenset register over semantiske dekninger og
detaljer. Det inneholder ingen forsikringsverdier. Felles begreper gjenbruker
`ansvar`, `rettshjelp`, `brann`, `tyveri`, `naturskade`, `kasko`, `glass`,
`veihjelp`, `ulykke`, `utstyr`, `nokkel`, `feilfylling`, `maskinskade`, `nyverdi`
og `leiebil`. Gjenbruk av nøkkel betyr samme begrep, ikke samme verdi eller
automatisk anvendelighet på tvers av typer.

MC har egne familier for `mc.kjoreutstyr`, `mc.hjelm`, `mc.bagasje`,
`mc.leiekjoretoy` og `mc.parkert`. Bobil har `bobil.losore`, `bobil.fortelt`,
`bobil.fukt`, `bobil.vann`, `bobil.skadedyr`, `bobil.ferieavbrudd`,
`bobil.feriegaranti` og `bobil.utleie`. Kontantytelse ved ferieavbrudd holdes
separat fra refusjon av faktiske ekstrautgifter, også når markedsnavnet ligner.

`kjoretoy.kjorelengde`, faktisk kilometerstand og avtalt maksimal kilometerstand
er kundedata. De holdes separat fra maskinskadens opphørsgrense, kjøpskrav,
egenandelsintervaller og nyverdigrense. `premie.*` gjenbrukes uten parserendring.
Ingen kundespesifikke kilometer-, pris- eller valgte egenandelsverdier katalogføres.

## Katalog og kilder

Tre providergrupper eier nye katalogmoduler og tilhørende kildepakker.
`mc-bobil-catalog-builder.ts` oversetter eksplisitte source-backed definisjoner
til eksisterende `CatalogProduct`, `CatalogFact`, `CatalogAddOn` og
`CatalogSource`. Ingen produktarv antas av nivånavn. Materialiserte produktfacts
angir dokumentert anvendelighet for hvert nivå. Tillegg får separate komponenter
og eksplisitte produkt-ID-er; de finnes ikke som valgt dekning i baseproduktet.

Nye kilder har provider, forsikringstype, avtalescope og kildeautoritet.
Samme uendrede PDF kan gjenbrukes via typeavgrensede metadatareferanser. Originaler
endres ikke. Dato ved innhenting er ikke dokumentdato/gyldighet. Udokumentert
versjon/gyldighet forblir ukjent; teknisk PDF-metadata brukes ikke som vilkårsdato.

Fullvilkår har prioritet over IPID og produktside når applicability stemmer.
Kundedokumenter har fortsatt prioritet over alle katalogfacts. To samtidige,
like autoritative motstridende facts skal være uavklart, ikke først-treff.

## Fremtind

Ny MC bruker `providerId=fremtind`, `agreementScope=ordinary-sparebank1`.
Ny Bobil bruker `providerId=fremtind`, `agreementScope=ordinary-dnb`.
Dette er de verifiserte distribuerte ordinære produktene, ikke en påstand om at
alle Fremtind-kanaler har samme sluttprodukt. DNB/SB1 står i kildeprovenance og
scope, ikke som ny forsikringsgiver. Tidligere legacy provider-ID-er og produkter
endres ikke. LOfavør, NITO og Utdanningsforbundet implementeres ikke.

## Dataflyt og manuell registrering

Eksakt typeavgrenset aliasnormalisering, dokumentfacts og gjentatt normalisering
gjenbruker eksisterende regler. Nye familier registreres uten provider-if i motoren.
Katalogkobling, document > catalog, optional status og supporting terms bruker
eksisterende mekanismer. General terms er fortsatt ikke kundeobjekter.

MC/Bobil legges til foreslåtte manuelle typer og bruker eksisterende dynamiske
produktvalg. Ingen ekstra typefelter eller ny medlems-UX. Manuell årlig kjørelengde
er fortsatt bare for Bil. Sikker objektidentitet kan fortsatt ikke registreres
manuelt; flere manuelle objekter uten sikker identitet håndteres konservativt.

Kuraterte presentasjonsbegreper bruker dagens forskjells-/detaljkomponenter,
kildelenker, ukjentstatus og mobile layout. Ingen score eller vinner.

## Bevisklasser

- SOURCE VERIFIED: kildeinventar og konkrete dokumentpunkter for katalogfacts.
- CODE VERIFIED: syntetiske regresjoner, runtime og validering.
- PRODUCTION VERIFIED: ingen påstand; denne oppgaven deployer ikke.

Endelig validering, faktatelling og komplett filklassifisering: [mc-bobil-validation.md](mc-bobil-validation.md). Produkt-/fact-/tilleggsmatriser: [mc-bobil-matrices.md](mc-bobil-matrices.md).
