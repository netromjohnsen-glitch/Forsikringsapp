import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

// Statisk uttrekk fra Ifs Kjøretøyforsikring MOT2-2. Produktnivåenes
// sammensetning følger pkt. 4; forsikringsbeviset avgjør faktisk avtale.
export const IF_TERMS_URL = "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=MOT2-2";
export const IF_PRODUCT_URL = "https://www.if.no/privat/forsikring/bilforsikring";
const document = (id: string): CatalogSource => ({
  id, company: "If", filename: "Kjoretoyforsikring-MOT2-2.pdf", termsNumber: "MOT2-2",
  effectiveFrom: "2024-03", url: IF_TERMS_URL,
});

export const ifSources: Record<string, CatalogSource> = {
  ifAnsvar: document("ifAnsvar"),
  ifDelkasko: document("ifDelkasko"),
  ifKasko: document("ifKasko"),
  ifSuper: document("ifSuper"),
  ifLeiebil: document("ifLeiebil"),
  ifMotorGir: document("ifMotorGir"),
};

type Row = [key: string, label: string, value: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (documentId: string, rows: Row[]): CatalogFact[] => rows.map(
  ([key, label, value, section, page, replacesBase, deductibleClassification]) => ({
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(deductibleClassification === "standard" ? { qualificationSource: {
      documentId, section: "8.5", page: 18, filename: ifSources[documentId].filename,
      termsNumber: "MOT2-2", effectiveFrom: "2024-03", company: "If", url: IF_TERMS_URL,
    } } : {}),
    source: { documentId, section, page, filename: ifSources[documentId].filename,
      termsNumber: "MOT2-2", effectiveFrom: "2024-03", company: "If", url: IF_TERMS_URL },
  }),
);

export const ifFacts: Record<string, CatalogFact[]> = {
  ifAnsvar: facts("ifAnsvar", [
    ["ansvar.dekning", "Ansvar", "Person- og tingskade voldt av forsikret kjøretøy etter bilansvarsloven", "4.1", 4],
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 200 000 kr per forsikret", "4, 11.5.1", 22],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr; dødsfall innen 2 år etter ulykken", "11.5.2, 11.7.2.2", 23],
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", "I eller på motorvognen; fører også utenfor når motorvognen er direkte skadeårsak", "11.4", 22],
    ["ulykke.avtalevilkar", "Fører/passasjer – avtalevilkår", "Den avtalte ulykkesdekningen skal fremgå av forsikringsbeviset", "11.2", 21],
    ["ulykke.unntak", "Fører/passasjer – unntak", "Blant annet psykiske lidelser/atferdsforstyrrelser og tannskade ved invaliditet", "11.6.1–11.6.2", 22],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter ved tvist knyttet til forsikret kjøretøy", "12.1", 24],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr + 20 % av det overskytende", "8.5.2", 19, false, "standard"],
    ["geografi.dekning", "Geografisk område", "Europa, unntatt Kosovo, Russland og Belarus; i Tyrkia bare europeisk del", "2", 3],
    ["geografi.rettshjelp", "Rettshjelp – geografisk område", "Norden", "2", 3],
  ]),
  ifDelkasko: facts("ifDelkasko", [
    ["tilbehor.bagasje.grense", "Ettermontert utstyr og bagasje – samlet grense", "Inntil 40 000 kr samlet, høyst 50 % av kjøretøyets gjenanskaffelsesverdi; avtalt sum kan utvides", "3.4", 3],
    ["tilbehor.bagasje.unntak", "Utstyr og bagasje – unntak", "Penger/verdipapir og fastmontert ladestasjon i bygning er ikke inkludert", "3.5", 4],
    ["brann.dekning", "Brann", "Åpen flamme, eksplosjon og lynnedslag", "4.2", 4],
    ["brann.unntak", "Brann – begrensning", "Batterier og elektroniske enheter krever åpen ild på utsiden av enheten", "4.2", 4],
    ["brann.egenandel", "Brann – egenandel", "8 000 kr hvis ikke annen egenandel står i særvilkår eller forsikringsbevis", "8.5.3", 19, false, "standard"],
    ["tyveri.dekning", "Tyveri", "Tyveri, forsøk på tyveri og innbrudd; underslag ved annonsert prøvekjøring på vilkår", "4.3", 5],
    ["tyveri.egenandel", "Tyveri – egenandel", "8 000 kr hvis ikke annen egenandel står i særvilkår eller forsikringsbevis", "8.5.3", 19, false, "standard"],
    ["haerverk.dekning", "Hærverk", "Forsettlig hærverk på kjøretøyet", "4.4", 5],
    ["natur.dekning", "Naturskade", "Skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden", "4.5", 5],
    ["glass.dekning", "Glass", "Brudd på utvendige ruter av glass/plexiglass ved tilfeldig, plutselig hendelse", "4.6", 5],
    ["glass.egenandel.bytte", "Glass – egenandel ved bytte", "3 000 kr", "8.5.4", 19, false, "standard"],
    ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "0 kr", "8.5.4", 19, false, "standard"],
    ["glass.grense.bytte", "Glass – grense ved bytte", "Høyst 50 % av kjøretøyets gjenanskaffelsesverdi", "4.6", 5],
    ["glass.unntak", "Glass – begrensning", "Lykter og slitasjeskader ved normal bruk dekkes ikke", "4.6", 5],
    ["veihjelp.dekning", "Veihjelp", "Assistanse, transport og hjemreise ved dekningsmessig skade, driftsstopp, utelåsing, tom tank eller tomt driftsbatteri", "4.7–4.7.2", 5],
    ["veihjelp.egenandel", "Veihjelp – egenandel", "750 kr", "8.5.6", 19, false, "standard"],
    ["veihjelp.transport.grense", "Veihjelp – transportgrense", "Transportkostnader høyst 50 % av kjøretøyets verdi på transporttidspunktet", "4.7.3", 6],
    ["veihjelp.unntak", "Veihjelp – unntak", "Verkstedreparasjon og ytelser fra abonnement eller garanti dekkes ikke", "4.7.3", 6],
    ["bonus.delkasko", "Bonus ved delkaskoskade", "Brann, tyveri, glass, natur, hærverk og veihjelp reduserer ikke bonus", "9.4", 20],
  ]),
  ifKasko: facts("ifKasko", [
    ["kasko.dekning", "Kaskoskade", "Sammenstøt, utforkjøring, velt, feilfylling og annen tilfeldig, plutselig ytre hendelse", "4.8", 6],
    ["kasko.egenandel", "Kasko – egenandel", "8 000 kr hvis ikke annen egenandel står i særvilkår eller forsikringsbevis", "8.5.5", 19, false, "standard"],
    ["feilfylling.egenandel", "Feilfylling – egenandel", "Ordinær kaskoegenandel: 8 000 kr hvis ikke annet er avtalt", "4.8, 8.5.5", 19, false, "standard"],
    ["bonus.kasko", "Bonus ved kaskoskade", "Ansvars- og kaskoskader kan redusere bonus", "9.4", 20],
  ]),
  ifSuper: facts("ifSuper", [
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 3 år etter registrering som fabrikkny", "4.11.1", 11],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Før 60 000 km", "4.11.1", 11],
    ["nyverdi.skadegrad", "Totalskadegaranti – utløsende kostnadsgrense", "Reparasjonsomkostningene må overstige bilens gjenanskaffelsesverdi", "4.11.1", 11],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Fabrikkny bil etter del A gjelder ikke leaset bil; del B gjelder resterende startleie", "4.11.1", 11],
    ["leasing.startleie", "Leasing – resterende startleie", "Forholdsmessig nedskrevet ved totalskade eller totalforsvunnet bil", "4.11.1 del B", 11],
    ["bilnokkel.dekning", "Bilnøkkel/fjernkontroll", "Ny nøkkel, programmering og omkoding ved plutselig ytre skade, tap eller tyveri", "4.11.2", 12],
    ["ladekabel.dekning", "Ladekabel", "Tilfeldig, plutselig ytre hendelse eller tyveri/hærverk på ladekabel", "4.11.2", 12],
    ["feilfylling.dekning", "Feilfylling", "Skade direkte som følge av fylling av feil væske", "4.11.2", 12],
    ["feilfylling.egenandel", "Feilfylling – egenandel", "1 000 kr under Uhellsforsikring", "4.11.3", 12, true, "coverage"],
    ["parkering.dekning", "Parkeringsskade", "Skade fra ukjent kjøretøy mens bilen er parkert; tidspunkt og sted må kunne angis", "4.11.4", 12],
    ["parkering.grense", "Parkeringsskade – erstatningsgrense", "Uhells- og parkeringsskade: inntil 20 000 kr per skadetilfelle", "4.11.6", 12],
    ["parkering.egenandel", "Parkeringsskade – egenandel", "Valgt kaskoegenandel", "4.11.5", 12, false, "reference"],
    ["bonus.parkert", "Parkert bil – bonustap", "Ingen bonustap for skade dekket under parkeringsskadeforsikringen", "4.11.7", 12],
    ["super.unntak", "Super – unntak", "Gjelder ikke drosje, trafikkskole- eller utleiebil, ikke godkjent effektøkning eller skade ved prøvekjennemerke", "4.11", 11],
  ]),
  ifLeiebil: facts("ifLeiebil", [
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 90 dager ved reparasjon", "4.10.5", 10],
    ["leiebil.bilklasse", "Leiebil – bilstørrelse", "Tilsvarende størrelse, høyst 500 kr inkl. mva per dag", "4.10.3", 10],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon", "Til 10 dager etter tilbud om erstatning", "4.10.5", 10],
    ["leiebil.vilkar", "Leiebil – utløser", "Dekket skade eller tyveri; ved motor-/girskade inntil 7 dager mens dekning vurderes", "4.10.1", 10],
    ["leiebil.unntak", "Leiebil – unntak", "Ingen leiebil ved ren glasskade eller når leiebil dekkes etter lov eller mobilitetsgaranti. Likevel dekkes inntil 7 dager når forhandler eller verksted er ansvarlig etter lov/forskrift, skaden ellers ville vært dekningsmessig og overstiger aktuell egenandel.", "4.10.2", 10],
    ["leiebil.kontant", "Leiebil – kontantkompensasjon", "200 kr per dag når leiebil ikke benyttes; normalt høyst 15 dager", "4.10.4–4.10.5", 10],
  ]),
  ifMotorGir: facts("ifMotorGir", [
    ["maskinskade.dekning", "Motor- og girskade – komponenter", "Plutselige og uforutsette skader på oppregnede motor-, gir-, drivverk-, styrings-, varme-, kjøle-, sikkerhets- og komfortkomponenter", "4.9.1", 7],
    ["maskinskade.fossil", "Motor- og girskade – diesel/bensin", "Motor, topplokk, turbo/EGR, AdBlue og innsprøytningssystem etter oppregning", "4.9.1", 7],
    ["maskinskade.el", "Motor- og girskade – elbil/hybrid", "Høyvoltbatteri, høyspentkabel og ladekontakt, batterikjøling/-overvåking, omformer og fabrikkmontert lader", "4.9.1", 7],
    ["maskinskade.drivverk", "Motor- og girskade – gir og kraftoverføring", "Girkasse, fordelingskasse, vinkeldrev og oppregnede aksler og clutchdeler", "4.9.1", 7],
    ["maskinskade.km", "Motor- og girskade – kilometer", "Gjelder til 200 000 km; skader etter mer enn 200 000 km dekkes ikke", "4.9.3", 8],
    ["maskinskade.egenandel", "Motor- og girskade – egenandel", "8 000 kr, med kilometerfradrag før egenandel", "4.9.6", 9, false, "coverage"],
    ["maskinskade.fradrag", "Motor- og girskade – kilometerfradrag", "10 % etter 100 000 km, 20 % etter 150 000 km, 30 % etter 175 000 km", "4.9.6", 9],
    ["maskinskade.unntak", "Motor- og girskade – unntak", "Blant annet slitasje/korrosjon, clutchlamell, understell/bremser, hjullager og skader dekket under ordinær kasko", "4.9.2–4.9.3", 8],
  ]),
};

// UI-nivåene følger produktsiden; intern arv følger MOT2-2 pkt. 4 og 4.11.
export const ifProducts: CatalogProduct[] = [
  { company: "If", insuranceType: "Bil", name: "Ansvar", providerId: "if", productId: "if-bil-ansvar", version: "MOT2-2", componentIds: ["ifAnsvar"] },
  { company: "If", insuranceType: "Bil", name: "Delkasko", providerId: "if", productId: "if-bil-delkasko", version: "MOT2-2", inheritsProductId: "if-bil-ansvar", componentIds: ["ifDelkasko"] },
  { company: "If", insuranceType: "Bil", name: "Kasko", providerId: "if", productId: "if-bil-kasko", version: "MOT2-2", inheritsProductId: "if-bil-delkasko", componentIds: ["ifKasko"] },
  { company: "If", insuranceType: "Bil", name: "Super", providerId: "if", productId: "if-bil-super", version: "MOT2-2", inheritsProductId: "if-bil-kasko", componentIds: ["ifSuper"] },
];

export const ifAddOns: CatalogAddOn[] = [
  { id: "if-leiebil", name: "Leiebil", providerId: "if", componentId: "ifLeiebil", requiresLevel: ["if-bil-kasko", "if-bil-super"] },
  { id: "if-motor-gir", name: "Motor- og girskade", providerId: "if", componentId: "ifMotorGir", requiresLevel: ["if-bil-kasko", "if-bil-super"] },
];
