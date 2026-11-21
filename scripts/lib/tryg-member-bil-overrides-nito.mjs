/** PDF-verified overrides for NITO bil terms (PAU25/27 member PDFs). */
import { componentOverrides, mergeOverrides } from "./tryg-member-bil-override-builder.mjs";

const leiebilLegacy = {
  key: "bil.leiebil",
  label: "Leiebil ved erstatningsmessig skade",
  value:
    "Ved erstatningsmessig skade erstattes leiebil formidlet av Trygs leverandør når skaden overstiger egenandelen. Leiebil med ubegrenset kjørelengde i tilsvarende bilstørrelse, oppad begrenset til VW ID.4. Normal reparasjonstid inntil 60 dager. Ved kondemnasjon inntil 14 dager fra melding, aldri utover 60 dager. Ved brutt veiforbindelse etter naturulykke inntil 10 dager.",
  page: 1,
  section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade",
};

export const legacyKeys = {
  "bil-ekstra": [leiebilLegacy],
  "elbil-ekstra": [leiebilLegacy],
};

export const appendedFacts = {};

const ansvar = componentOverrides("ansvar", {
  values: {
    "ansvar.dekning":
      "Ansvar etter bilansvarsloven dekkes med ubegrenset beløp for personskade. Annen skade enn personskade dekkes med inntil 100 millioner kroner.",
    "ansvar.person.grense": "Ubegrenset beløp for personskade.",
    "ansvar.ting.grense": "Inntil 100 millioner kroner for annen skade enn personskade.",
    "rettshjelp.dekning": "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
    "bonus.ansvar": "Skade under 1.1 Ansvar fører til tap av bonus.",
  },
  pages: {
    "ansvar.dekning": { page: 1, section: "1.1 Ansvar" },
    "ansvar.person.grense": { page: 1, section: "1.1 Ansvar" },
    "ansvar.ting.grense": { page: 1, section: "1.1 Ansvar" },
    "rettshjelp.dekning": { page: 1, section: "1.2 Rettshjelp" },
    "bonus.ansvar": { page: 1, section: "3 Bonus" },
  },
});

const delkaskoShared = {
  values: {
    "tilbehor.grense":
      "Fastmontert tilbehør som det er lovlig å ha på kjøretøyet er omfattet med inntil 10 000 kroner. Det fremgår av forsikringsbeviset hvis annen sum er avtalt. Foliering regnes også som fastmontert tilbehør.",
    "tilbehor.unntak":
      "Spesiallakk omfattes ikke. Tilhenger eller tilbehør som kan fjernes uten bruk av verktøy regnes ikke som fastmontert tilbehør.",
    "brann.dekning": "Skade som følge av brann med åpen flamme, eksplosjon og lynnedslag.",
    "brann.egenandel":
      "Egenandelen er 6 000 kroner, hvis ikke lavere egenandel er avtalt og fremgår av forsikringsbeviset.",
    "tyveri.dekning":
      "Skade som følge av tyveri/brukstyveri av kjøretøyet eller deler av dette. Det samme gjelder skade eller hærverk i forbindelse med forsøk på tyveri.",
    "tyveri.egenandel":
      "Egenandelen er 6 000 kroner, hvis ikke lavere egenandel er avtalt og fremgår av forsikringsbeviset.",
    "glass.dekning":
      "Bruddskader på kjøretøyets glassruter, inkludert glasstak, er dekket når de repareres eller nye ruter settes inn hos ett av våre avtaleverksted.",
    "glass.egenandel.bytte": "Egenandelen er 3 000 kroner ved bytte av rute, ingen egenandel ved reparasjon.",
    "glass.egenandel.reparasjon": "Ingen egenandel ved reparasjon.",
    "glass.unntak":
      "Hvis ruten før bruddskade var i for dårlig stand på grunn av riper eller slitasje til å bli godkjent ved EU-kontroll, dekkes skaden ikke.",
    "veihjelp.dekning":
      "Når kjøretøyet er skadet erstattes nødvendige merutgifter til hjemreise for fører og passasjerer, inkludert bagasje.",
    "veihjelp.transport.grense": "Erstatningen er begrenset til 50 prosent av kjøretøyets verdi da skaden skjedde.",
    "veihjelp.egenandel": "Egenandelen er 750 kroner.",
    "veihjelp.unntak":
      "Transportutgifter for haikere erstattes ikke. Utgifter som kan kreves dekket under annen avtale, garanti eller redningsabonnement erstattes ikke. Utgifter på sted uten tilknytning til vei erstattes ikke.",
    "reparasjon.kontant":
      "Hvis kontantutbetaling er avtalt erstattes 70 prosent av takst uten merverdiavgift. Leiebil erstattes ikke ved kontanterstatning.",
    "totalskade.oppgjor":
      "Oppgjør ved totalskade eller tap beregnes etter markedsverdien på skadedagen.",
    "bonus.delkasko": "Skade fører ikke til tap av bonus.",
  },
};

const delkasko = componentOverrides("delkasko", {
  ...delkaskoShared,
  pages: {
    "tilbehor.grense": { page: 1, section: "1 Hva forsikringen omfatter – Fastmontert tilbehør" },
    "tilbehor.unntak": { page: 1, section: "1 Hva forsikringen omfatter – Unntak" },
    "brann.dekning": { page: 1, section: "2.1 Brann" },
    "brann.egenandel": { page: 1, section: "2.1 Brann – Egenandel" },
    "tyveri.dekning": { page: 1, section: "2.2 Tyveri" },
    "tyveri.egenandel": { page: 1, section: "2.2 Tyveri – Egenandel" },
    "glass.dekning": { page: 1, section: "2.3 Glass" },
    "glass.egenandel.bytte": { page: 1, section: "2.3 Glass – Egenandel" },
    "glass.egenandel.reparasjon": { page: 1, section: "2.3 Glass – Egenandel" },
    "glass.unntak": { page: 1, section: "2.3 Glass – Unntak" },
    "veihjelp.dekning": { page: 1, section: "2.4 Veihjelp" },
    "veihjelp.transport.grense": { page: 2, section: "2.4 Veihjelp" },
    "veihjelp.egenandel": { page: 2, section: "2.4 Veihjelp – Egenandel" },
    "veihjelp.unntak": { page: 2, section: "2.4 Veihjelp – Unntak" },
    "reparasjon.kontant": { page: 2, section: "3.2 Reparasjon" },
    "totalskade.oppgjor": { page: 2, section: "3.3 Totalskade og tap" },
    "bonus.delkasko": { page: 3, section: "4 Bonus" },
  },
});

const kaskoCover = componentOverrides("kasko", {
  values: {
    ...delkaskoShared.values,
    "kasko.dekning":
      "Skade som oppstår på eget kjøretøy ved sammenstøt, utforkjøring, velt, hærverk, feilfylling av drivstoff eller en plutselig, uventet og ytre påvirkning.",
    "haerverk.dekning": "Skade som oppstår på eget kjøretøy ved hærverk.",
    "feilfylling.dekning": "Skade som oppstår på eget kjøretøy ved feilfylling av drivstoff.",
    "kasko.egenandel": "Avtalt egenandel fremgår av forsikringsbeviset.",
    "kasko.egenandel.ung":
      "Er føreren under 23 år i skadeøyeblikket økes egenandelen med 5 000 kroner når ikke annet fremgår av forsikringsbeviset. Økt egenandel gjelder ikke for hovedeier, hovedeiers ektefelle/samboer eller fører som har øvelseskjørt 2 000 kilometer med appen «Tryg vei til lappen». Ved deltakelse i ferdighetskurs på is- eller hastighetsbane som er godkjent av selskapet, økes egenandelen med 20 000 kroner.",
    "kasko.unntak":
      "Skade som skyldes maskinbrudd eller frost er ikke dekket under kasko.",
    "kasko.dyr":
      "Det er ikke bonustap ved erstatningsmessig kaskoskade som følge av påkjørsel av dyr, forutsatt at politi eller viltnemnd blir varslet så snart som mulig etter uhellet. Foretatt varsling må kunne dokumenteres. Egenandelen er 2 000 kroner.",
    "kasko.var":
      "Ved værrelatert skade faller egenandelen bort dersom kjøretøyet var parkert innendørs i garasje eller lignende da skadetilfellet oppstod.",
    "nyverdi.alder":
      "Skaden må inntreffe innen ett år etter at kjøretøyet som fabrikknytt var registrert på forsikringstakeren.",
    "nyverdi.km": "Kjøretøyet må ikke ha kjørt mer enn 15 000 kilometer.",
    "nyverdi.skadegrad":
      "Forventet reparasjonsomkostning fra takst må overstige 80 prosent av kjøretøyets nyanskaffelsesverdi på skadedagen.",
    "nyverdi.tyveri":
      "Retten til nytt kjøretøy gjelder også ved tyveri dersom kjøretøyet ikke er kommet til rette innen 3 uker.",
    "nyverdi.unntak":
      "Kjøretøy som er utleid i henhold til leasingavtale er ikke omfattet av reglene om nyverdierstatning.",
    "bonus.kasko": "Skade under 2.1 Kasko fører til tap av bonus.",
  },
  pages: {
    "tilbehor.grense": { page: 1, section: "1 Hva forsikringen omfatter – Fastmontert tilbehør" },
    "tilbehor.unntak": { page: 1, section: "1 Hva forsikringen omfatter – Unntak" },
    "kasko.dekning": { page: 1, section: "2.1 Kasko" },
    "haerverk.dekning": { page: 1, section: "2.1 Kasko" },
    "feilfylling.dekning": { page: 1, section: "2.1 Kasko" },
    "kasko.egenandel": { page: 1, section: "2.1 Kasko – Egenandel" },
    "kasko.egenandel.ung": { page: 1, section: "2.1 Kasko – Egenandel" },
    "kasko.unntak": { page: 1, section: "2.1 Kasko – Unntak" },
    "kasko.dyr": { page: 1, section: "2.1 Kasko – Påkjørsel av dyr" },
    "kasko.var": { page: 1, section: "2.1 Kasko – Værrelatert skade" },
    "brann.dekning": { page: 2, section: "2.2 Brann" },
    "brann.egenandel": { page: 2, section: "2.2 Brann – Egenandel" },
    "tyveri.dekning": { page: 2, section: "2.3 Tyveri" },
    "tyveri.egenandel": { page: 2, section: "2.3 Tyveri – Egenandel" },
    "glass.dekning": { page: 2, section: "2.4 Glass" },
    "glass.egenandel.bytte": { page: 2, section: "2.4 Glass – Egenandel" },
    "glass.egenandel.reparasjon": { page: 2, section: "2.4 Glass – Egenandel" },
    "glass.unntak": { page: 2, section: "2.4 Glass – Unntak" },
    "veihjelp.dekning": { page: 2, section: "2.5 Veihjelp" },
    "veihjelp.transport.grense": { page: 2, section: "2.5 Veihjelp" },
    "veihjelp.egenandel": { page: 2, section: "2.5 Veihjelp – Egenandel" },
    "veihjelp.unntak": { page: 2, section: "2.5 Veihjelp – Unntak" },
    "reparasjon.kontant": { page: 3, section: "3.2 Reparasjon" },
    "totalskade.oppgjor": { page: 3, section: "3.3 Totalskade og tap" },
    "nyverdi.alder": { page: 3, section: "3.4 Nyverdierstatning" },
    "nyverdi.km": { page: 3, section: "3.4 Nyverdierstatning" },
    "nyverdi.skadegrad": { page: 3, section: "3.4 Nyverdierstatning" },
    "nyverdi.tyveri": { page: 3, section: "3.4 Nyverdierstatning" },
    "nyverdi.unntak": { page: 3, section: "3.4 Nyverdierstatning" },
    "bonus.kasko": { page: 4, section: "4 Bonus" },
  },
});

const bilEkstra = componentOverrides("bilEkstra", {
  values: {
    "bonus.parkert":
      "Erstatningsmessig kaskoskade som oppstår mens kjøretøyet er parkert dekkes uten tap av bonus når skadevolder er ukjent, reparasjon skjer på avtaleverksted og skaden inntreffer innen 10 år etter førstegangsregistrering som fabrikkny.",
    "tilbehor.grense":
      "Erstatningssummen for fastmontert tilbehør utvides til 50 000 kroner per skadetilfelle, samlet med ekstra dekk og felger. Foliering regnes som fastmontert tilbehør.",
    "feilfylling.rens":
      "Utgifter til rens av motor etter feilfylling av drivstoff med inntil 20 000 kroner. Egenandelen er 1 000 kroner.",
    "leiebil.dager": "Leiebil dekkes i normal reparasjonstid, inntil 60 dager.",
    "leiebil.bilklasse":
      "Leiebil med ubegrenset kjørelengde i tilsvarende bilstørrelse som det forsikrede kjøretøyet, oppad begrenset til VW ID.4.",
    "leiebil.kondemnasjon":
      "Ved kondemnasjon dekkes leiebil i inntil 14 dager fra selskapet har gitt melding om at kjøretøyet er kondemnert. Det gis likevel ikke leiebil utover 60 dager.",
    "leiebil.naturulykke":
      "Dersom kjøretøyet er utilgjengelig fordi veiforbindelsen er brutt etter naturulykke, dekkes leiebil i inntil 10 dager.",
    "leiebil.unntak":
      "Leiebildekningen gjelder ikke ved skade på glass/bilrute alene, skadet/tapt bilnøkkel eller kontantoppgjør som ikke er knyttet til totalskade og innløsning.",
    "leiebil.vilkar":
      "Når skade på kjøretøyet er dekket av forsikringen, erstatter selskapet leiebil formidlet av vår leverandør, forutsatt at skaden overstiger egenandel.",
    "leiebil.kostnader":
      "Utgifter som ikke dekkes: bøter, skader eller egenandel knyttet til leieforholdet, drivstoff, ladeutgifter, parkeringsutgifter, bompenger og drop-off gebyrer.",
    "bagasje.grense":
      "Ved tyveri av bagasje fra kjøretøyet eller låsbar bagasjeboks dekkes bagasje med inntil 20 000 kroner. Hver gjenstand er dekket med inntil 5 000 kroner. Egenandel er 1 000 kroner.",
    "bagasje.unntak":
      "Utstyr til bruk i næring, penger, verdipapirer og dyr erstattes ikke.",
    "bilnokkel.dekning":
      "Skade på eller tap av bilnøkkel og fjernkontroll til kupevarmer er dekket.",
    "bilnokkel.grense": "Samlet erstatning er begrenset til 20 000 kroner per forsikringsår.",
    "bilnokkel.egenandel": "Ingen egenandel.",
    "ladekabel.dekning":
      "Ladekabel til hybrid-/elbil er dekket som følge av brann, tyveri eller en plutselig, uventet og ytre påvirkning.",
    "ladekabel.egenandel": "Ingen egenandel.",
    "nyverdi.alder":
      "Skaden må inntreffe innen tre år etter at kjøretøyet som fabrikknytt var registrert på forsikringstakeren.",
    "nyverdi.km": "Kjøretøyet må ikke ha kjørt mer enn 60 000 kilometer.",
    "nyverdi.skadegrad":
      "Forventet reparasjonsomkostning fra takst må overstige 80 prosent av kjøretøyets nyanskaffelsesverdi på skadedagen.",
    "nyverdi.avtaler":
      "Inngåtte abonnement og avtaler knyttet til kjøretøyets verdi dekkes med inntil 10 000 kroner.",
    "leasing.startleie":
      "For kjøretøy som er utleid i henhold til leasingavtale dekker selskapet resterende startleie ved totalskade og totalforsvunnet kjøretøy. Erstatningen beregnes forholdsmessig nedskrevet etter innbetalt beløp og resterende leasingperiode.",
    "bonus.tillegg": "Utbetaling under NITO Bil Ekstra alene medfører ikke tap av bonus.",
  },
  meta: {
    "bilnokkel.egenandel": { stripDeductibleClassification: true },
    "ladekabel.egenandel": { stripDeductibleClassification: true },
  },
  pages: {
    "bonus.parkert": { page: 1, section: "1 Hva forsikringen omfatter – Fritak for bonustap ved skade på parkert bil" },
    "tilbehor.grense": { page: 1, section: "1 Hva forsikringen omfatter – Fastmontert tilbehør. Ekstra dekk og felger" },
    "feilfylling.rens": { page: 2, section: "1 Hva forsikringen omfatter – Rens av motor etter feilfylling" },
    "leiebil.dager": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.bilklasse": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kondemnasjon": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.naturulykke": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.unntak": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.vilkar": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kostnader": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "bagasje.grense": { page: 1, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bagasje.unntak": { page: 1, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bilnokkel.dekning": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.grense": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.egenandel": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "ladekabel.dekning": { page: 1, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "ladekabel.egenandel": { page: 1, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "nyverdi.alder": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.km": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.skadegrad": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.avtaler": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "leasing.startleie": { page: 2, section: "1 Hva forsikringen omfatter – Innskudd leaset kjøretøy" },
    "bonus.tillegg": { page: 2, section: "2 Bonus" },
  },
});

const elbilEkstra = componentOverrides("elbilEkstra", {
  values: {
    "bonus.parkert":
      "Erstatningsmessig kaskoskade som oppstår mens kjøretøyet er parkert dekkes uten tap av bonus når skadevolder er ukjent, reparasjon skjer på avtaleverksted og skaden inntreffer innen 10 år etter førstegangsregistrering som fabrikkny.",
    "tilbehor.grense":
      "Erstatningssummen for fastmontert tilbehør utvides til 50 000 kroner per skadetilfelle, samlet med ekstra dekk og felger. Foliering regnes som fastmontert tilbehør.",
    "leiebil.dager": "Leiebil dekkes i normal reparasjonstid, inntil 60 dager.",
    "leiebil.bilklasse":
      "Leiebil med ubegrenset kjørelengde i tilsvarende bilstørrelse som det forsikrede kjøretøyet, oppad begrenset til VW ID.4.",
    "leiebil.kondemnasjon":
      "Ved kondemnasjon dekkes leiebil i inntil 14 dager fra selskapet har gitt melding om at kjøretøyet er kondemnert. Det gis likevel ikke leiebil utover 60 dager.",
    "leiebil.naturulykke":
      "Dersom kjøretøyet er utilgjengelig fordi veiforbindelsen er brutt etter naturulykke, dekkes leiebil i inntil 10 dager.",
    "leiebil.unntak":
      "Leiebildekningen gjelder ikke ved skade på glass/bilrute alene, skadet/tapt bilnøkkel eller kontantoppgjør som ikke er knyttet til totalskade og innløsning.",
    "leiebil.vilkar":
      "Når skade på kjøretøyet er dekket av forsikringen, erstatter selskapet leiebil formidlet av vår leverandør, forutsatt at skaden overstiger egenandel.",
    "leiebil.kostnader":
      "Utgifter som ikke dekkes: bøter, skader eller egenandel knyttet til leieforholdet, drivstoff, ladeutgifter, parkeringsutgifter, bompenger og drop-off gebyrer.",
    "bagasje.grense":
      "Ved tyveri av bagasje fra kjøretøyet eller låsbar bagasjeboks dekkes bagasje med inntil 20 000 kroner. Hver gjenstand er dekket med inntil 5 000 kroner. Egenandel er 1 000 kroner.",
    "bagasje.unntak":
      "Utstyr til bruk i næring, penger, verdipapirer og dyr erstattes ikke.",
    "bilnokkel.dekning":
      "Skade på eller tap av bilnøkkel og fjernkontroll til kupevarmer er dekket.",
    "bilnokkel.grense": "Samlet erstatning er begrenset til 20 000 kroner per forsikringsår.",
    "bilnokkel.egenandel": "Ingen egenandel.",
    "ladekabel.dekning":
      "Ladekabel til hybrid-/elbil er dekket som følge av brann, tyveri eller en plutselig, uventet og ytre påvirkning.",
    "ladekabel.egenandel": "Ingen egenandel.",
    "nyverdi.alder":
      "Skaden må inntreffe innen tre år etter at kjøretøyet som fabrikknytt var registrert på forsikringstakeren.",
    "nyverdi.km": "Kjøretøyet må ikke ha kjørt mer enn 60 000 kilometer.",
    "nyverdi.skadegrad":
      "Forventet reparasjonsomkostning fra takst må overstige 80 prosent av kjøretøyets nyanskaffelsesverdi på skadedagen.",
    "nyverdi.avtaler":
      "Inngåtte abonnement og avtaler knyttet til kjøretøyets verdi dekkes med inntil 10 000 kroner.",
    "leasing.startleie":
      "For kjøretøy som er utleid i henhold til leasingavtale dekker selskapet resterende startleie ved totalskade og totalforsvunnet kjøretøy. Erstatningen beregnes forholdsmessig nedskrevet etter innbetalt beløp og resterende leasingperiode.",
    "bonus.tillegg": "Utbetaling under NITO Bil Ekstra alene medfører ikke tap av bonus.",
  },
  meta: {
    "bilnokkel.egenandel": { stripDeductibleClassification: true },
    "ladekabel.egenandel": { stripDeductibleClassification: true },
  },
  pages: {
    "bonus.parkert": { page: 1, section: "1 Hva forsikringen omfatter – Fritak for bonustap ved skade på parkert bil" },
    "tilbehor.grense": { page: 2, section: "1 Hva forsikringen omfatter – Fastmontert tilbehør. Ekstra dekk og felger" },
    "leiebil.dager": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.bilklasse": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kondemnasjon": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.naturulykke": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.unntak": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.vilkar": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kostnader": { page: 1, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "bagasje.grense": { page: 2, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bagasje.unntak": { page: 2, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bilnokkel.dekning": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.grense": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.egenandel": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "ladekabel.dekning": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "ladekabel.egenandel": { page: 2, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "nyverdi.alder": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.km": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.skadegrad": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "nyverdi.avtaler": { page: 1, section: "1 Hva forsikringen omfatter – Totalskadegaranti" },
    "leasing.startleie": { page: 2, section: "1 Hva forsikringen omfatter – Innskudd leaset kjøretøy" },
    "bonus.tillegg": { page: 2, section: "2 Bonus" },
  },
});

const kasko = kaskoCover;

export const overrides = mergeOverrides(
  { delkasko, kasko, bilEkstra, elbilEkstra },
  {
    "bil-ansvar": ansvar,
  },
);