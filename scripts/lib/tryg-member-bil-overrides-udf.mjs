/** PDF-verified overrides for Utdanningsforbundet bil terms. */
import { componentOverrides, mergeOverrides } from "./tryg-member-bil-override-builder.mjs";

const leiebilLegacy = {
  key: "bil.leiebil",
  label: "Leiebil ved erstatningsmessig skade",
  value:
    "Ved erstatningsmessig skade erstattes leiebil formidlet av Trygs leverandør når skaden overstiger egenandelen. Leiebil med ubegrenset kjørelengde i tilsvarende bilstørrelse, oppad begrenset til VW ID.4. Normal reparasjonstid inntil 60 dager. Ved kondemnasjon inntil 14 dager fra melding, aldri utover 60 dager. Ved brutt veiforbindelse etter naturulykke inntil 10 dager.",
  page: 2,
  section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade",
};

export const legacyKeys = {
  "bil-ekstra": [leiebilLegacy],
  "elbil-ekstra": [leiebilLegacy],
};

export const appendedFacts = {
  "bil-delkasko": [
    {
      key: "bil.naturskade",
      label: "Naturskade på bilen",
      value:
        "Forsikringen dekker skade som direkte skyldes naturskade: skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv og vulkanutbrudd. Egenandelen er 3 000 kroner. Skade som skyldes lyn, frost, tele, tørke, nedbør, snøtyngde eller isgang, eller dyr, innsikter, bakterier, sopp eller råte, er unntatt.",
      page: 2,
      section: "2.5 Naturskade",
    },
  ],
};

const delkaskoShared = {
  values: {
    "tilbehor.grense":
      "Fastmontert tilbehør som det er lovlig å ha på kjøretøyet er omfattet med inntil 10 000 kroner. Foliering regnes også som fastmontert tilbehør.",
    "tilbehor.unntak":
      "Spesiallakk omfattes ikke. Tilhenger eller tilbehør som kan fjernes uten bruk av verktøy regnes ikke som fastmontert tilbehør.",
    "brann.dekning": "Skade som følge av brann med åpen flamme, eksplosjon og lynnedslag.",
    "brann.egenandel": "Egenandelen er 3 000 kroner.",
    "tyveri.dekning":
      "Skade som følge av tyveri/brukstyveri av kjøretøyet eller deler av dette. Det samme gjelder skade eller hærverk i forbindelse med forsøk på tyveri.",
    "tyveri.egenandel": "Egenandelen er 3 000 kroner.",
    "glass.dekning":
      "Bruddskader på kjøretøyets glassruter, inkludert glasstak, er dekket når de repareres eller nye ruter settes inn hos ett av våre avtaleverksted.",
    "glass.egenandel.bytte": "Egenandelen er 3 000 kroner ved bytte av rute, ingen egenandel ved reparasjon.",
    "glass.egenandel.reparasjon": "Ingen egenandel ved reparasjon.",
    "glass.unntak":
      "Hvis ruten før bruddskade var i for dårlig stand på grunn av riper eller slitasje til å bli godkjent ved EU-kontroll, dekkes skaden ikke.",
    "veihjelp.dekning":
      "Når kjøretøyet er skadet erstattes nødvendige merutgifter til hjemreise for fører og passasjerer, inkludert bagasje.",
    "veihjelp.transport.grense": "Erstatningen er begrenset til 50 prosent av kjøretøyets verdi da skaden skjedde.",
    "veihjelp.egenandel": "Egenandelen er 500 kroner.",
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
    "bonus.delkasko": { page: 4, section: "4 Bonus" },
  },
});

const udfEkstraSkip = [
  "tilbehor.grense",
  "nyverdi.alder",
  "nyverdi.km",
  "nyverdi.skadegrad",
  "nyverdi.avtaler",
  "leasing.startleie",
];

const bilEkstra = componentOverrides("bilEkstra", {
  skipKeys: udfEkstraSkip,
  values: {
    "bonus.parkert":
      "Erstatningsmessig kaskoskade som oppstår mens kjøretøyet er parkert dekkes uten tap av bonus når skadevolder er ukjent. Dekning gjelder til og med forsikringsperioden kjøretøyet blir 10 år, alderen beregnes fra førstegangs registrering.",
    "feilfylling.rens":
      "Utgifter til rens av motor etter feilfylling av drivstoff med inntil 15 000 kroner. Egenandelen er 1 000 kroner.",
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
      "Ved tyveri av bagasje fra kjøretøyet eller låsbar bagasjeboks dekkes bagasje med inntil 10 000 kroner. Hver gjenstand er dekket med inntil 5 000 kroner. Egenandel er 1 000 kroner.",
    "bagasje.unntak":
      "Utstyr til bruk i næring, penger, verdipapirer og dyr erstattes ikke.",
    "bilnokkel.dekning":
      "Skade på eller tap av bilnøkkel og fjernkontroll til kupevarmer er dekket.",
    "bilnokkel.grense": "Samlet erstatning er begrenset til 20 000 kroner per forsikringsår.",
    "bilnokkel.egenandel": "Ingen egenandel.",
    "ladekabel.dekning":
      "Ladekabel til hybrid-/elbil er dekket som følge av brann, tyveri eller en plutselig, uventet og ytre påvirkning.",
    "ladekabel.egenandel": "Egenandelen er 1 000 kroner.",
    "bonus.tillegg": "Utbetaling under Bil Ekstra alene medfører ikke tap av bonus.",
  },
  meta: {
    "bilnokkel.egenandel": { stripDeductibleClassification: true },
  },
  pages: {
    "bonus.parkert": { page: 1, section: "1 Hva forsikringen omfatter – Fritak for bonustap ved skade på parkert bil" },
    "feilfylling.rens": { page: 2, section: "1 Hva forsikringen omfatter – Rens av motor etter feilfylling" },
    "leiebil.dager": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.bilklasse": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kondemnasjon": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.naturulykke": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.unntak": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.vilkar": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kostnader": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "bagasje.grense": { page: 3, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bagasje.unntak": { page: 3, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bilnokkel.dekning": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.grense": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.egenandel": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "ladekabel.dekning": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "ladekabel.egenandel": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "bonus.tillegg": { page: 3, section: "2 Bonus" },
  },
});

const elbilEkstra = componentOverrides("elbilEkstra", {
  skipKeys: udfEkstraSkip,
  values: {
    "bonus.parkert":
      "Erstatningsmessig kaskoskade som oppstår mens kjøretøyet er parkert dekkes uten tap av bonus når skadevolder er ukjent. Dekning gjelder til og med forsikringsperioden kjøretøyet blir 10 år, alderen beregnes fra førstegangs registrering.",
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
      "Ved tyveri av bagasje fra kjøretøyet eller låsbar bagasjeboks dekkes bagasje med inntil 10 000 kroner. Hver gjenstand er dekket med inntil 5 000 kroner. Egenandel er 1 000 kroner.",
    "bagasje.unntak":
      "Utstyr til bruk i næring, penger, verdipapirer og dyr erstattes ikke.",
    "bilnokkel.dekning":
      "Skade på eller tap av bilnøkkel og fjernkontroll til kupevarmer er dekket.",
    "bilnokkel.grense": "Samlet erstatning er begrenset til 20 000 kroner per forsikringsår.",
    "bilnokkel.egenandel": "Ingen egenandel.",
    "ladekabel.dekning":
      "Ladekabel til hybrid-/elbil er dekket som følge av brann, tyveri eller en plutselig, uventet og ytre påvirkning.",
    "ladekabel.egenandel": "Egenandelen er 1 000 kroner.",
    "bonus.tillegg": "Utbetaling under Elbil Ekstra alene medfører ikke tap av bonus.",
  },
  meta: {
    "bilnokkel.egenandel": { stripDeductibleClassification: true },
  },
  pages: {
    "bonus.parkert": { page: 1, section: "1 Hva forsikringen omfatter – Fritak for bonustap ved skade på parkert bil" },
    "leiebil.dager": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.bilklasse": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kondemnasjon": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.naturulykke": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.unntak": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.vilkar": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "leiebil.kostnader": { page: 2, section: "1 Hva forsikringen omfatter – Leiebil ved erstatningsmessig skade" },
    "bagasje.grense": { page: 3, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bagasje.unntak": { page: 3, section: "1 Hva forsikringen omfatter – Bagasje" },
    "bilnokkel.dekning": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.grense": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "bilnokkel.egenandel": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tap av bilnøkkel" },
    "ladekabel.dekning": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "ladekabel.egenandel": { page: 3, section: "1 Hva forsikringen omfatter – Skade på eller tyveri av ladekabel" },
    "bonus.tillegg": { page: 3, section: "2 Bonus" },
  },
});

export const overrides = mergeOverrides({ delkasko, bilEkstra, elbilEkstra });