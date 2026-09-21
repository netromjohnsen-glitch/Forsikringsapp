import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

// Kun fakta fra de ni vedlagte PDF-ene. Forsikringsbevis, generelle vilkår og
// rettshjelpsvilkår er ikke vedlagt og kan derfor ikke utfylles her.
const source = (id: string, filename: string, termsNumber: string, effectiveFrom: string): CatalogSource =>
  ({ id, company: "Tryg", filename, termsNumber, effectiveFrom });
export const trygSources: Record<string, CatalogSource> = {
  ansvar: source("ansvar", "Bilforsikring-Ansvar.pdf", "PAU25003", "2024-07-01"),
  delkasko: source("delkasko", "Bilforsikring-Delkasko.pdf", "PAU25835", "2026-01-01"),
  kasko: source("kasko", "Bilforsikring-Kasko.pdf", "PAU25205", "2026-07-01"),
  bilEkstra: source("bilEkstra", "Bilforsikring-BilEkstra.pdf", "PAU27002", "2026-07-01"),
  elbilEkstra: source("elbilEkstra", "Bilforsikring-ElbilEkstra.pdf", "PAU27013", "2026-07-01"),
  leiebil: source("leiebil", "Bilforsikring-Leiebil.pdf", "PAU27008", "2026-10-01"),
  maskinskade: source("maskinskade", "Bilforsikring-Maskinskade.pdf", "PAU27110", "2026-08-01"),
  ulykke: source("ulykke", "Fører- og Passasjerulykke.pdf", "PAU28003", "2024-07-01"),
  ulykkeEkstra: source("ulykkeEkstra", "Fører- og passasjerulykke Ekstra.pdf", "PAU28013", "2024-05-01"),
};

type Row = [key: string, label: string, value: string, section: string, page: number,
  deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (documentId: string, rows: Row[]): CatalogFact[] =>
  rows.map(([key, label, value, section, page, deductibleClassification]) => ({
    key, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    replacesBase: (documentId === "bilEkstra" || documentId === "elbilEkstra") &&
      ["tilbehor.grense", "nyverdi.alder", "nyverdi.km", "nyverdi.skadegrad"].includes(key),
    source: {
      documentId, section, page,
      filename: trygSources[documentId].filename,
      termsNumber: trygSources[documentId].termsNumber,
      effectiveFrom: trygSources[documentId].effectiveFrom,
      company: "Tryg",
    },
  }));

function partialCover(id: "delkasko" | "kasko"): CatalogFact[] {
  const k = id === "kasko";
  const s = k ? ["2.2", "2.3", "2.4", "2.5"] : ["2.1", "2.2", "2.3", "2.4"];
  return facts(id, [
    ["tilbehor.grense", "Fastmontert tilbehør", "Inntil 10 000 kr; annen avtalt sum kan stå i forsikringsbeviset", "1", 1],
    ["tilbehor.unntak", "Tilbehør – unntak", "Spesiallakk, tilhenger og tilbehør som kan fjernes uten verktøy omfattes ikke", "1", 1],
    ["brann.dekning", "Brann", "Åpen flamme, eksplosjon og lynnedslag", s[0], k ? 2 : 1],
    ["brann.egenandel", "Brann – egenandel", "6 000 kr, med mindre lavere egenandel er avtalt i forsikringsbeviset", s[0], k ? 2 : 1, "standard"],
    ["tyveri.dekning", "Tyveri", "Tyveri/brukstyveri av kjøretøy eller deler; skade og hærverk ved tyveriforsøk", s[1], 1],
    ["tyveri.egenandel", "Tyveri – egenandel", "6 000 kr, med mindre lavere egenandel er avtalt i forsikringsbeviset", s[1], 1, "standard"],
    ["glass.dekning", "Glass", "Brudd på glassruter inklusiv glasstak ved reparasjon/bytte hos avtaleverksted", s[2], 1],
    ["glass.egenandel.bytte", "Glass – egenandel ved bytte", "3 000 kr", s[2], 1, "coverage"],
    ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "0 kr", s[2], 1, "coverage"],
    ["glass.unntak", "Glass – begrensning", "For slitt eller ripet til EU-godkjenning før skaden: ikke dekket", s[2], 1],
    ["veihjelp.dekning", "Veihjelp", "Hjemreise, berging og tauing ved skade, utelåsing, startproblem, uventet driftsstopp eller tomt for drivstoff/strøm", s[3], 1],
    ["veihjelp.grense", "Veihjelp – erstatningsgrense", "50 % av kjøretøyets verdi på skadedagen", s[3], 2],
    ["veihjelp.egenandel", "Veihjelp – egenandel", "750 kr", s[3], 2, "coverage"],
    ["veihjelp.unntak", "Veihjelp – unntak", "Ikke assistanse uten veitilknytning eller utgift dekket av annen avtale/garanti/redningsabonnement", s[3], 2],
    ["reparasjon.kontant", "Kontanterstatning ved reparasjon", "Etter avtale 70 % av takst uten merverdiavgift; leiebil erstattes ikke", "3.2", k ? 3 : 2],
    ["totalskade.oppgjor", "Totalskade – oppgjør", "Markedsverdi på skadedagen ved kontantoppgjør", "3.3", 3],
    ...(k ? [] : [["bonus.delkasko", "Bonus ved delkaskoskade", "Skade fører ikke til bonustap", "4", 3] as Row]),
  ]);
}

export const trygFacts: Record<string, CatalogFact[]> = {
  ansvar: facts("ansvar", [
    ["ansvar.dekning", "Ansvar", "Erstatningsansvar etter bilansvarsloven", "1.1", 1],
    ["ansvar.person.grense", "Ansvar – personskade", "Ubegrenset beløp", "1.1", 1],
    ["ansvar.annen.grense", "Ansvar – annen skade", "Inntil 100 000 000 kr", "1.1", 1],
    ["rettshjelp", "Rettshjelp", "Omfattet; detaljer i ikke vedlagt vilkår PGE91500", "1.2", 1],
    ["bonus.ansvar", "Bonus ved ansvarsskade", "Skade under ansvar fører til bonustap", "3", 1],
  ]),
  delkasko: partialCover("delkasko"),
  kasko: [
    ...partialCover("kasko"),
    ...facts("kasko", [
      ["kasko.dekning", "Kaskoskade", "Sammenstøt, utforkjøring, velt, hærverk, feilfylling og plutselig, uventet ytre påvirkning", "2.1", 1],
      ["haerverk.dekning", "Hærverk", "Skade på eget kjøretøy ved hærverk", "2.1", 1],
      ["feilfylling.dekning", "Feilfylling", "Skade på eget kjøretøy ved feilfylling av drivstoff", "2.1", 1],
      ["kasko.egenandel", "Kasko – egenandel", "Avtalt egenandel fremgår av forsikringsbeviset", "2.1", 1, "reference"],
      ["kasko.ungforer", "Kasko – fører under 23 år", "Egenandelen økes med 5 000 kr hvis ikke annet står i forsikringsbeviset. Økningen gjelder ikke hovedeier, hovedeiers ektefelle eller samboer, eller fører som har øvelseskjørt 2 000 km med «Tryg vei til lappen».", "2.1", 1],
      ["kasko.unntak", "Kasko – unntak", "Maskinbrudd og frost er ikke dekket under kasko", "2.1", 1],
      ["kasko.dyr", "Påkjørsel av dyr", "Ingen bonustap ved dokumentert varsling til politi/viltnemnd; egenandel 2 000 kr", "2.1", 1],
      ["kasko.var", "Værskade – egenandel", "Egenandel bortfaller når bilen var parkert innendørs i garasje eller lignende", "2.1", 1],
      ["nyverdi.alder", "Nyverdierstatning – alder", "Innen 1 år etter registrering som fabrikkny på forsikringstaker", "3.4", 4],
      ["nyverdi.km", "Nyverdierstatning – kilometer", "Høyst 15 000 km", "3.4", 4],
      ["nyverdi.skadegrad", "Nyverdierstatning – skadegrad", "Forventet reparasjon over 80 % av nyanskaffelsesverdi", "3.4", 4],
      ["nyverdi.tyveri", "Nyverdierstatning – tyveri", "Også ved tyveri når bilen ikke er kommet til rette innen 3 uker", "3.4", 4],
      ["nyverdi.unntak", "Nyverdierstatning – unntak", "Leasingbil omfattes ikke", "3.4", 4],
      ["bonus.kasko", "Bonus ved kaskoskade", "Skade under kasko 2.1 fører til bonustap", "4", 4],
    ]),
  ],
  bilEkstra: facts("bilEkstra", [
    ["bonus.parkert", "Parkert bil – bonustap", "Ingen bonustap ved ukjent skadevolder og avtaleverksted når skaden skjer innen 6 år etter førstegangs registrering som fabrikkny", "1 Fritak for bonustap", 1],
    ["tilbehor.grense", "Fastmontert tilbehør og ekstra hjul", "Samlet inntil 50 000 kr per skadetilfelle", "1 Fastmontert tilbehør", 1],
    ["feilfylling.rens", "Rens etter feilfylling", "Inntil 15 000 kr; egenandel 1 000 kr", "1 Rens av motor", 1],
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 60 dager", "1 Leiebil", 1],
    ["leiebil.bilklasse", "Leiebil – bilstørrelse", "Tilsvarende størrelse, høyst VW ID.4; ubegrenset kjørelengde", "1 Leiebil", 1],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon", "Inntil 14 dager etter melding, aldri utover 60 dager", "1 Leiebil", 1],
    ["leiebil.naturulykke", "Leiebil – brutt veiforbindelse", "Inntil 10 dager", "1 Leiebil", 1],
    ["leiebil.unntak", "Leiebil – unntak", "Ikke ved bare glasskade, tapt/skadet nøkkel eller kontantoppgjør uten totalskade/innløsning", "1 Leiebil", 1],
    ["leiebil.vilkar", "Leiebil – utløser", "Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør", "1 Leiebil", 1],
    ["leiebil.kostnader", "Leiebil – utgifter som ikke dekkes", "Blant annet bøter, skade/egenandel i leieforhold, drivstoff/lading, parkering, bompenger og drop-off-gebyr", "1 Leiebil", 1],
    ["bagasje.grense", "Bagasje ved tyveri", "Inntil 10 000 kr samlet og 5 000 kr per gjenstand; egenandel 1 000 kr", "1 Bagasje", 1],
    ["bagasje.unntak", "Bagasje – unntak", "Næringsutstyr, penger, verdipapirer og dyr erstattes ikke", "1 Bagasje", 1],
    ["bilnokkel", "Bilnøkkel/fjernkontroll", "Inntil 20 000 kr per forsikringsår; egenandel 1 000 kr", "1 Bilnøkkel", 1],
    ["ladekabel", "Ladekabel", "Brann, tyveri eller plutselig, uventet ytre påvirkning; egenandel 1 000 kr", "1 Ladekabel", 1],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 3 år etter registrering som fabrikkny på forsikringstaker", "1 Totalskadegaranti", 2],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Høyst 60 000 km", "1 Totalskadegaranti", 2],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Forventet reparasjon over 80 % av nyanskaffelsesverdi", "1 Totalskadegaranti", 2],
    ["nyverdi.avtaler", "Totalskadegaranti – avtaler", "Abonnement/avtaler knyttet til kjøretøyets verdi inntil 10 000 kr", "1 Totalskadegaranti", 2],
    ["leasing.startleie", "Leasing – resterende startleie", "Forholdsmessig nedskrevet ved totalskade eller totalforsvunnet kjøretøy", "1 Innskudd leaset kjøretøy", 2],
    ["bonus.tillegg", "Bonus ved tilleggsskade", "Utbetaling under Bil Ekstra alene gir ikke bonustap", "2", 2],
  ]),
  elbilEkstra: facts("elbilEkstra", [
    ["bonus.parkert", "Parkert bil – bonustap", "Ingen bonustap ved ukjent skadevolder og avtaleverksted når skaden skjer innen 6 år etter førstegangs registrering som fabrikkny", "1 Fritak for bonustap", 1],
    ["tilbehor.grense", "Fastmontert tilbehør og ekstra hjul", "Samlet inntil 50 000 kr per skadetilfelle", "1 Fastmontert tilbehør", 1],
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 60 dager", "1 Leiebil", 1],
    ["leiebil.bilklasse", "Leiebil – bilstørrelse", "Tilsvarende størrelse, høyst VW ID.4; ubegrenset kjørelengde", "1 Leiebil", 1],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon", "Inntil 14 dager etter melding, aldri utover 60 dager", "1 Leiebil", 1],
    ["leiebil.naturulykke", "Leiebil – brutt veiforbindelse", "Inntil 10 dager", "1 Leiebil", 1],
    ["leiebil.unntak", "Leiebil – unntak", "Ikke ved bare glasskade, tapt/skadet nøkkel eller kontantoppgjør uten totalskade/innløsning", "1 Leiebil", 1],
    ["leiebil.vilkar", "Leiebil – utløser", "Erstatningsmessig skade som overstiger egenandelen; leiebil formidlet av Trygs leverandør", "1 Leiebil", 1],
    ["leiebil.kostnader", "Leiebil – utgifter som ikke dekkes", "Blant annet bøter, skade/egenandel i leieforhold, drivstoff/lading, parkering, bompenger og drop-off-gebyr", "1 Leiebil", 1],
    ["bagasje.grense", "Bagasje ved tyveri", "Inntil 10 000 kr samlet og 5 000 kr per gjenstand; egenandel 1 000 kr", "1 Bagasje", 1],
    ["bagasje.unntak", "Bagasje – unntak", "Næringsutstyr, penger, verdipapirer og dyr erstattes ikke", "1 Bagasje", 1],
    ["bilnokkel", "Bilnøkkel/fjernkontroll", "Inntil 20 000 kr per forsikringsår; egenandel 1 000 kr", "1 Bilnøkkel", 1],
    ["ladekabel", "Ladekabel", "Brann, tyveri eller plutselig, uventet ytre påvirkning; egenandel 1 000 kr", "1 Ladekabel", 2],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 3 år etter registrering som fabrikkny på forsikringstaker", "1 Totalskadegaranti", 2],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Høyst 60 000 km", "1 Totalskadegaranti", 2],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Forventet reparasjon over 80 % av nyanskaffelsesverdi", "1 Totalskadegaranti", 2],
    ["nyverdi.avtaler", "Totalskadegaranti – avtaler", "Abonnement/avtaler knyttet til kjøretøyets verdi inntil 10 000 kr", "1 Totalskadegaranti", 2],
    ["leasing.startleie", "Leasing – resterende startleie", "Forholdsmessig nedskrevet ved totalskade eller totalforsvunnet kjøretøy", "1 Innskudd leaset kjøretøy", 2],
    ["bonus.tillegg", "Bonus ved tilleggsskade", "Utbetaling under Elbil Ekstra alene gir ikke bonustap", "2", 2],
  ]),
  leiebil: facts("leiebil", [
    ["leiebil.vilkar", "Leiebil – utløser", "Skade på kjøretøyet må være dekket av forsikringen; leiebil formidlet av Trygs leverandør", "1", 1],
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 10 dager", "1", 1],
    ["leiebil.bilklasse", "Leiebil – bilstørrelse", "VW e-up!; ubegrenset kjørelengde", "1", 1],
    ["leiebil.unntak", "Leiebil – unntak", "Ikke ved bare glasskade, tapt/skadet nøkkel eller kontantoppgjør uten totalskade/innløsning", "1", 1],
    ["leiebil.kostnader", "Leiebil – utgifter som ikke dekkes", "Blant annet bøter, skade/egenandel i leieforhold, drivstoff/lading, parkering og bompenger", "1", 1],
    ["bonus.tillegg", "Bonus ved tilleggsskade", "Utbetaling under Leiebil alene gir ikke bonustap", "2", 1],
  ]),
  maskinskade: facts("maskinskade", [
    ["maskinskade.dekning", "Maskinskade – komponenter", "Plutselige og uforutsette feil på oppregnede motor-, gir-, drivverk-, styrings-, varme-, kjøle-, sikkerhets- og komfortkomponenter", "1", 1],
    ["maskinskade.alder", "Maskinskade – alder", "Til og med forsikringsperioden bilen blir 10 år fra førstegangs registrering", "1", 1],
    ["maskinskade.km", "Maskinskade – kilometer", "Gjelder til 200 000 km; alder eller kilometergrense som nås først", "1", 1],
    ["maskinskade.ekstra", "Maskinskade – komponenter til 100 000 km", "Eksosanlegg/katalysator/partikkelfilter, dobbeltmassesvinghjul og clutch", "1", 1],
    ["maskinskade.fossil", "Maskinskade – diesel/bensin", "Motor, oljekjøler/radiator, topplokk, manifolder, turbo/EGR/ladeluftkjøler, AdBlue og innsprøytningssystem", "1", 1],
    ["maskinskade.el", "Maskinskade – elbil/hybrid", "Motor, høyvoltbatteri og høyspentkabel inkl. ladekontakt, batterikjøling/-styring, spenningsomformer og fabrikkmontert lader", "1", 1],
    ["maskinskade.drivverk", "Maskinskade – gir og kraftoverføring", "Girkasse, differensial, fordelingskasse, vinkeldrev og oppregnede aksler/hjullager", "1", 1],
    ["maskinskade.komfort", "Maskinskade – sikkerhet og komfort", "Oppregnede styringsenheter for airbag/ABS, radar for blindsone/adaptiv cruise og hovedenhet for infotainment", "1", 2],
    ["maskinskade.egenandel.120", "Maskinskade – egenandel til 120 000 km", "10 000 kr", "1 Egenandel", 2, "coverage"],
    ["maskinskade.egenandel.160", "Maskinskade – egenandel 120 000–160 000 km", "14 000 kr", "1 Egenandel", 2, "coverage"],
    ["maskinskade.egenandel.200", "Maskinskade – egenandel 160 000–200 000 km", "18 000 kr", "1 Egenandel", 2, "coverage"],
    ["maskinskade.unntak", "Maskinskade – unntak", "Blant annet slitasje/korrosjon, lavvoltsbatteri, understell/bremser, ordinær kasko/garanti og manipulerte ytelser", "1 Unntak", 2],
    ["bonus.tillegg", "Bonus ved tilleggsskade", "Utbetaling under Maskinskade alene gir ikke bonustap", "2", 2],
  ]),
  ulykke: facts("ulykke", [
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 200 000 kr", "3.1", 2],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr; dødsfall innen 1 år etter ulykken", "2.2, 3.2", 2],
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", "I eller på kjøretøyet; også utenfor når kjøretøyet er direkte skadeårsak", "2", 1],
    ["ulykke.unntak", "Fører/passasjer – unntak", "Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1", "2.3", 1],
  ]),
  ulykkeEkstra: facts("ulykkeEkstra", [
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 500 000 kr", "3.1", 2],
    ["ulykke.invaliditet.barn", "Fører/passasjer – invaliditet barn under 18 år", "Inntil 1 000 000 kr", "3.1", 2],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr; dødsfall innen 1 år etter ulykken", "2.2, 3.2", 2],
    ["ulykke.sykehus", "Fører/passasjer – sykehuskompensasjon", "5 000 kr per skadetilfelle ved minst 48 timer sammenhengende innleggelse", "3.3", 2],
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", "I eller på kjøretøyet; også utenfor når kjøretøyet er direkte skadeårsak", "2", 1],
    ["ulykke.unntak", "Fører/passasjer – unntak", "Blant annet tannskade ved spising og psykisk skade uten PTSD etter ICD-10 F43.1", "2.4", 1],
  ]),
};

// Hovednivåer er separate vilkårsdokumenter. Vi utleder ikke at kasko eller
// delkasko automatisk inkluderer PAU25003; det må bekreftes i forsikringsbeviset.
export const trygProducts: CatalogProduct[] = [
  { company: "Tryg", insuranceType: "Bil", name: "Ansvar", providerId: "tryg", productId: "bil-ansvar", version: "PAU25003", componentIds: ["ansvar"] },
  { company: "Tryg", insuranceType: "Bil", name: "Delkasko", providerId: "tryg", productId: "bil-delkasko", version: "PAU25835", componentIds: ["delkasko"] },
  { company: "Tryg", insuranceType: "Bil", name: "Kasko", providerId: "tryg", productId: "bil-kasko", version: "PAU25205", componentIds: ["kasko"] },
];

export const trygAddOns: CatalogAddOn[] = [
  { id: "bil-ekstra", name: "Bil Ekstra", componentId: "bilEkstra", providerId: "tryg", requiresLevel: ["bil-kasko"] },
  { id: "elbil-ekstra", name: "Elbil Ekstra", componentId: "elbilEkstra", providerId: "tryg", requiresLevel: ["bil-kasko"] },
  { id: "leiebil", name: "Leiebil", componentId: "leiebil", providerId: "tryg", requiresLevel: null, insuranceTypes: ["Bil"] },
  { id: "maskinskade", name: "Maskinskade", componentId: "maskinskade", providerId: "tryg", requiresLevel: ["bil-kasko"] },
  { id: "forer-passasjerulykke", name: "Fører- og Passasjerulykke", componentId: "ulykke", providerId: "tryg", requiresLevel: null, insuranceTypes: ["Bil"] },
  { id: "forer-passasjerulykke-ekstra", name: "Fører- og Passasjerulykke Ekstra", componentId: "ulykkeEkstra", providerId: "tryg", requiresLevel: null, insuranceTypes: ["Bil"] },
];
