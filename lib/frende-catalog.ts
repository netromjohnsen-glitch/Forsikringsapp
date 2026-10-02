import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const termsUrl = "https://api.frende.no/documents/terms/public/pnc/CarInsurance";
const ipidUrl = "https://www.frende.no/documents/198/IPID_Personbil.pdf";
export const frendeSources: Record<string, CatalogSource> = {
  frendeTerms: { id: "frendeTerms", company: "Frende", filename: "Vilkar_kjoretoyforsikring.pdf", termsNumber: "Ikke oppgitt", effectiveFrom: "2026-01-01", url: termsUrl, sha256: "088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88" },
  frendeIpid: { id: "frendeIpid", company: "Frende", filename: "IPID_Personbil.pdf", termsNumber: "Ikke oppgitt", effectiveFrom: "2026-01-01", url: ipidUrl, sha256: "4c2dca2923583ba1d46dea924730335b064d8e94cd4cb1df544a520ed2683b8d" },
  frendeGeneral: { id: "frendeGeneral", company: "Frende", filename: "Generelle_vilkar-01012026.pdf", termsNumber: "Ikke oppgitt", effectiveFrom: "2026-01-01", url: "https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf", sha256: "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b" },
};

for (const id of ["frendeAnsvar", "frendeDelkasko", "frendeKasko", "frendeUtvidet", "frendeLeiebil", "frendeMaskinskade"]) {
  frendeSources[id] = { ...frendeSources.frendeTerms, id };
}

type Row = [key: string, label: string, value: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"],
  coverageAvailability?: CatalogFact["coverageAvailability"]];
const facts = (documentId: string, rows: Row[]): CatalogFact[] => rows.map(([key,label,value,section,page,replacesBase,deductibleClassification,coverageAvailability]) => ({
  key,label,value,...(replacesBase ? {replacesBase}:{}),...(deductibleClassification?{deductibleClassification}:{}),
  ...(coverageAvailability?{coverageAvailability}:{}),
  source: { documentId, section, page, filename: frendeSources.frendeTerms.filename,
    termsNumber: "Ikke oppgitt", effectiveFrom: "2026-01-01", company: "Frende", url: termsUrl },
}));

export const frendeFacts: Record<string, CatalogFact[]> = {
  frendeAnsvar: facts("frendeAnsvar", [
    ["geografi.dekning","Geografisk område","Europa, unntatt Russland, Tyrkia og Belarus","2",2],
    ["geografi.rettshjelp","Rettshjelp – geografisk område","Norden","2",2],
    ["bonus.delkasko","Bonus – kildebundne fritak","Ved dekningsmessig skade gir tyveri, brann, glass og veihjelp ikke bonustap. Det samme gjelder skade fra ukjent kjøretøy mens bilen står parkert når skaden kan knyttes til en bestemt parkering i et avgrenset tidsrom, valgt maskinskade, nøkkel/fjernkontroll og ladekabel erstattet på Utvidet, påkjørsel av dyr omgående meldt til politi eller viltnemnda, og skade direkte fra naturulykke etter naturskadeloven. Fritakene utvider ikke produktets dekninger","11.13",10],
    ["ansvar.dekning","Ansvar","Ansvar for person- og tingskade etter bilansvarslova; også ansvar etter ulovfestede regler ved bruk av kjøretøyet for skade konstatert i forsikringstiden, inntil 10 000 000 kr per skadetilfelle og samlet per år. Ansvar etter lov om vegfraktavtaler er unntatt","13.1",11],
    ["ulykke.invaliditet","Fører/passasjer – medisinsk invaliditet","200 000 kr ved 100 % livsvarig medisinsk invaliditet; forholdsmessig erstatning ved delvis invaliditet, samlet maksimalt 100 % for samme ulykke. Tidligere nedsatt funksjon og medvirkende sykelig tilstand gir fradrag; organ uten brukbar funksjon før ulykken gir ikke invaliditetserstatning. Endelig oppgjør innen tre år etter ulykkesdagen, basert på antatt livsvarig invaliditet på treårsdagen hvis graden ikke kan fastsettes endelig","12.3 side 10–11",10],
    ["ulykke.dod","Fører/passasjer – dødsfall","100 000 kr når avdøde etterlot ektefelle, samboer eller barn, eller var under 21 år","12.2",10],
    ["rettshjelp.dekning","Rettshjelp","Privatkundens tvist som personlig eier, rettmessig bruker eller fører av forsikret kjøretøy; også salgstvist etter at forsikringen opphørte ved salget, og tvist med selger ved nytt kjøp før egen forsikring når nåværende kjøretøy var forsikret i Frende ved kjøpet. Alminnelige domstoler, og voldgift når tvisten ellers ville vært dekket. Rimelige og nødvendige utgifter til egen advokat, registrert rettshjelper, godkjent advokatmekler og sakkyndige; vitner og rettsgebyr i forliksråd og tingrett ved rettslig behandling. Ankegebyr og idømte eller påtatte saksomkostninger er unntatt. Tvist mellom sameiere, yrke/virksomhet, familie/arv/skifte, namsmyndigheter, ubestridt inkasso/gjeldsforhandling/konkurs eller akkord som skyldner, straffesak, krenkelseserstatning/bøter/gebyr, ulovlig handling og advokat-/sakkyndigsalær er unntatt. Forvaltningsvedtak omfattes bare ved søksmål etter fullt utnyttet klageadgang; tidligere utgifter er unntatt. Utgifter før tvisten og grunnlag oppstått før forsikringen er unntatt","14.1–14.3 side 11–12",11,false,undefined,"included"],
    ["rettshjelp.grense","Rettshjelp – forsikringssum","100 000 kr per tvist; 250 000 kr med minst tre parter på samme side, begrenset til sikredes økonomiske interesse i saken","14.4 side 12–13",12],
    ["rettshjelp.egenandel","Rettshjelp – egenandel","4 000 kr pluss 20 % av øvrige kostnader","14.4",12,false,"override"],
  ]),
  frendeDelkasko: facts("frendeDelkasko", [
    ["tilbehor.grense","Fastmontert tilleggsutstyr – forsikringssum","20 000 kr, eller summen i forsikringsbeviset; inkluderer skade på lakk utover original lakk, lakkbeskyttelse og ny foliering av det skadede området","3 nr. 7",2],
    ["brann.dekning","Brann","Skade etter brann eller lynnedslag; svimerker og skade på delen eller komponenten der brann eller kortslutning oppstod er unntatt, men følgeskaden er omfattet","4.1–4.2",3],
    ["tyveri.dekning","Tyveri","Tyveri av kjøretøyet og skade ved tyveri eller forsøk på tyveri; tyveri utført av husstand eller ansatte, og kjøretøy som er utlånt eller prøvekjørt og ikke tilbakelevert, er unntatt","4.1–4.2",3],
    ["glass.dekning","Glass","Bruddskade på glassruter, også glasstak, ved tilfeldig plutselig ytre påvirkning","5.1",3],
    ["veihjelp.dekning","Veihjelp","Nødvendig berging av kjøretøy og påkoblet tilhenger eller campingvogn til nærmeste verksted; reparasjon på stedet når det er rimeligere enn berging. Skade, motorstopp, punktering, tomt batteri, sykdom eller hvilken som helst annen årsak som hindrer videre kjøring; gjelder også hjemme","5.2",3],
    ["glass.egenandel.bytte","Glass – egenandel ved skifte","3 000 kr","11.11",9,false,"coverage"],
    ["glass.egenandel.reparasjon","Glass – egenandel ved reparasjon","0 kr","11.11",9,false,"coverage"],
    ["veihjelp.egenandel","Veihjelp – egenandel","750 kr","11.11",9,false,"coverage"],
    ["brann.egenandel","Brann – standardegenandel","6 000 kr med mindre lavere egenandel står i forsikringsbeviset","11.11",9,false,"standard"],
    ["tyveri.egenandel","Tyveri – standardegenandel","6 000 kr med mindre lavere egenandel står i forsikringsbeviset; ingen egenandel hvis tyverialarm fungerte på skadetidspunktet","11.11",9,false,"standard"],
  ]),
  frendeKasko: facts("frendeKasko", [
    ["kasko.dekning","Kaskoskade","Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling","6.1",3],
    ["bagasje.grense","Personlige eiendeler – forsikringssum","Inntil 10 000 kr","6.1",3],
    ["bilnokkel.dekning","Bilnøkkel","Tap av nøkkel når den er skadet, stjålet eller mistet; avtalt egenandel på kasko gjelder, mens Utvidet har særskilt nøkkelgrense uten egenandel og bonustap","6.1.4 side 4; 11.11 side 9",4],
    ["nyverdi.alder","Totalskadegaranti – alder","Under 1 år","6.1, 11.7",4],
    ["nyverdi.km","Totalskadegaranti – kilometer","Under 15 000 km","6.1, 11.7",4],
    ["nyverdi.skadegrad","Totalskadegaranti – skadegrad","Reparasjon over 80 % av prisen for ny bil","6.1, 11.7",4],
    ["nyverdi.unntak","Totalskadegaranti – unntak","Gjelder ikke leaset bil; Frende kan velge kontantutbetaling for tilsvarende ny bil","11.7",8],
    ["kasko.egenandel","Kasko – avtalt egenandel","Fremgår av forsikringsbeviset","11.11",9,false,"reference"],
    ["bonus.kasko","Bonus ved kaskoskade","Skader med utbetaling kan redusere bonus etter bonusnivå og opptjeningsår","11.13",9],
    ["bonus.parkert","Parkeringsskade – bonustap","Ingen bonustap ved skade som et ukjent kjøretøy påfører kjøretøyet mens det står parkert, når skaden kan knyttes til en bestemt parkering i et avgrenset tidsrom","11.13",10],
  ]),
  frendeUtvidet: facts("frendeUtvidet", [
    ["nyverdi.alder","Totalskadegaranti – alder","Under 3 år","8.1",4,true],
    ["nyverdi.km","Totalskadegaranti – kilometer","Under 60 000 km","8.1",4,true],
    ["nyverdi.skadegrad","Totalskadegaranti – skadegrad","Reparasjon over 80 % av listepris for ny bil","8.1",4,true],
    ["nyverdi.unntak","Totalskadegaranti – unntak","Gjelder ikke leaset bil eller bil som ikke kommer til rette etter tyveri","8.1",4,true],
    ["bilnokkel.grense","Bilnøkkel – forsikringssum","Inntil 20 000 kr uten egenandel og bonustap","8.2",4],
    ["ladekabel.dekning","Ladekabel","Skadet eller stjålet ladekabel uten egenandel og bonustap","8.3",4],
    ["tilbehor.grense","Fastmontert tilleggsutstyr – forsikringssum","Inntil 50 000 kr; inkluderer skade på lakk utover original lakk, lakkbeskyttelse og ny foliering av det skadede området","8.4",5,true],
    ["bagasje.grense","Personlige eiendeler – forsikringssum","Inntil 20 000 kr","8.5",5,true],
    ["leasing.startleie","Leasing – startleie","Forholdsmessig erstatning av resterende startleie ved totalskade eller tyveri","8.6",5],
  ]),
  frendeLeiebil: facts("frendeLeiebil", [
    ["leiebil.bilklasse","Leiebil – bilklasse","Klasse C når tillegget er valgt i forsikringsbeviset, ved dekket brann-, tyveri-, kasko- eller maskinskade","7",4],
    ["leiebil.dager","Leiebil – reparasjonstid","Hele reparasjonstiden uten fast daggrense","7",4],
    ["leiebil.kondemnasjon","Leiebil – kondemnasjon eller tyveri","Inntil 31 dager","7",4],
    ["leiebil.kontant","Leiebil – kontantkompensasjon","250 kr per dag i inntil 31 dager hvis leiebil ikke brukes","7",4],
  ]),
  frendeMaskinskade: facts("frendeMaskinskade", [
    ["maskinskade.dekning","Maskinskade – komponenter","Plutselig og uforutsett skade på oppregnede komponenter som hindrer kjøring; bare når dekningen står i forsikringsbeviset, serviceintervall er fulgt og motor ikke er chippet eller trimmet. Omfatter tenningslås/-modul, startmotor, dynamo, motor med topp/blokk/innvendige bevegelige deler, oljekjøler, innsug-/eksosmanifold, turbo/kompressor/intercooler, dieselpartikkelfilter/katalysator, EGR, AdBlue med slanger, innsprøytningspumpe/dyser/sensorer, girkasse/fordelingskasse, bak-/mellom-/drivakslinger, dobbeltmasse svinghjul/trykkplate, hoved-/slavesylinder til clutch/bremser, motor-/girsensorer, termostat, vannpumpe, radiator, varmeapparatregister, klimakontrollpanel/kupevifte, AC-kompressor, fabrikkmontert kupevarmer, Start/Stop, servo, rattstamme/tannstang og funksjonsfeil på multifunksjonsratt uten belysningsfeil. Sikkerhet/komfort: luftfjæringskompressor/-belger, mekanisk fjær, airbagstyreenhet, ABS/TCS-hydraulikk, adaptive lykters styreenhet, blindsone-/cruiseradar og infotainmentskjerm. El/hybrid: elbilbatteri, drive-unit, ladekontakt/batterilader, høyvoltbatteriets kjølesystem/givere, høyvoltovervåking/spenningsomformer/strømveksler og koblingsenhet mellom forbrenningsmotor og elektrisk motor; tilhørende elektroniske styreenheter til alle oppregnede komponenter","9.1 side 5–6",5],
    ["maskinskade.alder","Maskinskade – alder","Ut forsikringsåret bilen blir 12 år","9.1",5],
    ["maskinskade.km","Maskinskade – kilometer","Inntil 200 000 km","9.1",5],
    ["maskinskade.egenandel.0-99999","Maskinskade – egenandel 0–100 000 km","10 000 kr","11.11",9,false,"override"],
    ["maskinskade.egenandel.100000-149999","Maskinskade – egenandel 100 001–150 000 km","15 000 kr","11.11",9,false,"override"],
    ["maskinskade.egenandel.150000-200000","Maskinskade – egenandel 150 001–200 000 km","20 000 kr","11.11",9,false,"override"],
    ["maskinskade.unntak","Maskinskade – begrensning","Skade og følgeskade på clutchlamell, bremser med deler, lykter/pærer, start-/12 V-batterier, styrestag/hjullagre/hjuloppheng og drivakselmansjetter er unntatt. Luftfjæring/fjær erstattes bare på skadet side; fysisk følgeskade etter knekt fjær hører til kasko. Gradvis slitasje/korrosjon/tæring, skade dekket av kasko eller garanti og redusert batterikapasitet er unntatt. Avvist garantikrav kan dekkes når skaden ellers er omfattet; Frende overtar kravet mot fabrikant","9.2–9.3",6],
  ]).concat([{ key: "maskinskade.unntak", label: "Maskinskade – IPID-begrensning", value: "IPID oppgir at maskinskader på leaset bil er unntatt", source: { documentId: "frendeIpid", filename: frendeSources.frendeIpid.filename, termsNumber: "Ikke oppgitt", effectiveFrom: "2026-01-01", company: "Frende", url: ipidUrl, section: "Maskinskade dekker ikke", page: 2 } }]),
};

export const frendeProducts: CatalogProduct[] = [
  {company:"Frende",insuranceType:"Bil",name:"Ansvar",providerId:"frende",productId:"frende-bil-ansvar",version:"2026-01-01",sourceId:"frendeIpid",componentIds:["frendeAnsvar"]},
  {company:"Frende",insuranceType:"Bil",name:"Delkasko",providerId:"frende",productId:"frende-bil-delkasko",version:"2026-01-01",sourceId:"frendeIpid",inheritsProductId:"frende-bil-ansvar",componentIds:["frendeDelkasko"]},
  {company:"Frende",insuranceType:"Bil",name:"Kasko",providerId:"frende",productId:"frende-bil-kasko",version:"2026-01-01",sourceId:"frendeIpid",inheritsProductId:"frende-bil-delkasko",componentIds:["frendeKasko"]},
  {company:"Frende",insuranceType:"Bil",name:"Utvidet",providerId:"frende",productId:"frende-bil-utvidet",version:"2026-01-01",sourceId:"frendeIpid",inheritsProductId:"frende-bil-kasko",componentIds:["frendeUtvidet"]},
];
export const frendeAddOns: CatalogAddOn[] = [
  {id:"frende-leiebil",name:"Leiebil",componentId:"frendeLeiebil",providerId:"frende",requiresLevel:["frende-bil-kasko","frende-bil-utvidet"]},
  {id:"frende-maskinskade",name:"Maskinskade",componentId:"frendeMaskinskade",providerId:"frende",requiresLevel:["frende-bil-kasko","frende-bil-utvidet"]},
];
