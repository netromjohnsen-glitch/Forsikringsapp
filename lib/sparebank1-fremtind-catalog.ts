import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

// Offisielle vilkår lenket fra SpareBank 1s bilforsikringsside 19.09.2026.
// Katalogen gjelder bare SpareBank 1-distribusjonen av Fremtind Bil. Kundens
// forsikringsbevis bestemmer valgte dekninger, egenandeler og øvrige avtalevalg.
const root = "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/";
export const SPAREBANK1_FREMTIND_PRODUCT_URL =
  "https://www.sparebank1.no/nb/bank/privat/forsikring/bilforsikring.html";
export const SPAREBANK1_FREMTIND_URLS = {
  ansvar: `${root}Vilkar_ansvar_bil.pdf`,
  delkasko: `${root}Vilkar_Minikasko_Bil.pdf`,
  kasko: `${root}Vilkar_Kasko_Bil.pdf`,
  toppkasko: `${root}Vilkar_Toppkasko_Bil.pdf`,
  leiebil: `${root}Vilkar_leiebil.pdf`,
  maskinskade: `${root}Vilkar_maskinskade.pdf`,
  ipid: "https://dokument.fremtind.no/ipid/IPID_Bil.pdf",
} as const;

const source = (id: string, filename: string, termsNumber: string, effectiveFrom: string,
  url: string, sha256: string): CatalogSource => ({
  id, company: "Fremtind", filename, termsNumber, effectiveFrom, url, sha256,
});

export const sparebank1FremtindSources: Record<string, CatalogSource> = {
  sp1Core: source("sp1Core", "Vilkar_ansvar_bil.pdf", "PMO-357.001-004", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.ansvar, "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568"),
  sp1Ansvar: source("sp1Ansvar", "Vilkar_ansvar_bil.pdf", "FMO-001.100-007", "2023-10-29",
    SPAREBANK1_FREMTIND_URLS.ansvar, "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568"),
  sp1Ulykke: source("sp1Ulykke", "Vilkar_ansvar_bil.pdf", "FMO-002.401-003", "2019-04-01",
    SPAREBANK1_FREMTIND_URLS.ansvar, "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568"),
  sp1Rettshjelp: source("sp1Rettshjelp", "Vilkar_ansvar_bil.pdf", "FFE-003.001-003", "2025-01-01",
    SPAREBANK1_FREMTIND_URLS.ansvar, "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568"),
  sp1Delkasko: source("sp1Delkasko", "Vilkar_Minikasko_Bil.pdf", "PMO-357.210-012", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.delkasko, "8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818"),
  sp1Kasko: source("sp1Kasko", "Vilkar_Kasko_Bil.pdf", "PMO-357.220-007", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.kasko, "87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739"),
  sp1Toppkasko: source("sp1Toppkasko", "Vilkar_Toppkasko_Bil.pdf", "PMO-350.200-016", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.toppkasko, "cc9af96bd2f91dffe76dced3d58481007d3036ba452e695f4f2b4a9489e01781"),
  sp1Leiebil: source("sp1Leiebil", "Vilkar_leiebil.pdf", "PMO-350.402-003", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.leiebil, "fa207fd6d1d8a4f02b6245362bd932bbe70408202d486afa25fd3d9edae1726c"),
  sp1Maskinskade: source("sp1Maskinskade", "Vilkar_maskinskade.pdf", "PMO-350.201-001", "2025-09-18",
    SPAREBANK1_FREMTIND_URLS.maskinskade, "0ad5c24b9dca610189dfcd9f10ee6a56a37fa977ed4b1da00a1725baa05d63db"),
  sp1Ipid: source("sp1Ipid", "IPID_Bil.pdf", "V.106", "", SPAREBANK1_FREMTIND_URLS.ipid,
    "429a3e267cfbbcfa6da651997497386ffc7391c5f3aab461d469e4d5e65a5d94"),
};

type Row = [key: string, label: string, value: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"],
  coverageAvailability?: CatalogFact["coverageAvailability"]];
const facts = (id: string, rows: Row[]): CatalogFact[] => rows.map(
  ([key, label, value, section, page, replacesBase, deductibleClassification, coverageAvailability]) => ({
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(coverageAvailability ? { coverageAvailability } : {}),
    source: { documentId: id, section, page, filename: sparebank1FremtindSources[id].filename,
      termsNumber: sparebank1FremtindSources[id].termsNumber,
      effectiveFrom: sparebank1FremtindSources[id].effectiveFrom,
      company: "Fremtind", url: sparebank1FremtindSources[id].url,
      note: id === "sp1Leiebil" || id === "sp1Maskinskade"
        ? "Aktivt generisk Fremtind-tilleggsvilkår; distribusjonskanalen avgjør tilgjengelighet, og forsikringsbeviset avgjør valgt dekning og avtalte egenandeler"
        : "Kanonisk Fremtind-vilkår lenket identisk fra SpareBank 1 og DNB; forsikringsbeviset avgjør valgte dekninger og avtalte egenandeler" },
  }),
);

export const sparebank1FremtindFacts: Record<string, CatalogFact[]> = {
  sp1Core: facts("sp1Core", [
    ["geografi.dekning", "Geografisk område", "Europa, unntatt Tyrkia, Kosovo, Russland og Belarus", "2", 1],
    ["bonus.regel", "Bonus og bonustap", "Bonustap etter dekket ansvars- eller kaskoskade; ikke ved blant annet ulykke, rettshjelp, brann, tyveri, glass, veihjelp, leiebil eller maskinskade", "Bonus – Bonustap", 1],
    ["bonus.ordning", "Bonusordning", "Valgt toppbonusordning fremgår av forsikringsbeviset", "Bonus – Valgfri toppbonusordning", 2],
  ]),
  sp1Ansvar: facts("sp1Ansvar", [
    ["ansvar.dekning", "Ansvar", "Ansvar etter bilansvarsloven; utenfor Norge etter skadestedets bilansvarslov, med norske regler innen EØS når de gir høyere erstatning", "1.1, 2.1", 2],
    ["ansvar.person.grense", "Ansvar – personskade", "Ubegrenset", "2.1", 2],
    ["ansvar.ting.grense", "Ansvar – tingskade", "Inntil 100 000 000 kr per skadetilfelle", "2.1", 2],
  ]),
  sp1Ulykke: facts("sp1Ulykke", [
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", "Ulykkesskade på fører eller passasjer i, på eller utenfor kjøretøyet når kjøretøyet er direkte årsak til skaden. Sykdom eller sykelig tilstand/disposisjon, besvimelse, forgiftning og inntak av sovemidler, smertestillende eller narkotiske midler er unntatt; unntakene for forgiftning og disse midlene gjelder ikke barn under 16 år", "1", 2, false, undefined, "included"],
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Voksne: 200 000 kr ved 100 % livsvarig medisinsk invaliditet", "2, 5.2", 3],
    ["ulykke.invaliditet.barn", "Fører/passasjer – invaliditet barn", "Barn under 20 år: 1 000 000 kr ved 100 % livsvarig medisinsk invaliditet", "2", 3],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr med ektefelle/samboer og/eller barn under 20 år; ellers 50 000 kr; dødsfall innen 1 år etter ulykken", "2, 5.1", 3],
  ]),
  sp1Rettshjelp: facts("sp1Rettshjelp", [
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter til juridisk bistand når eier eller rettmessig bruker/fører er part i tvist om forsikret kjøretøy", "1, 4.1–4.2", 4],
    ["geografi.rettshjelp", "Rettshjelp – geografisk område", "Norden", "2", 4],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "Inntil sikredes økonomiske interesse, maksimalt 100 000 kr per tvist; kan utvides til 250 000 kr ved minst tre parter på sikredes side (ektefeller/samboere regnes som én part). Finansklagenemnda: inntil 15 000 kr; forliksråd/jordskifterett: inntil 25 000 kr. Sakkyndige som ikke er oppnevnt av retten: inntil 20 % av forsikringssummen; interessetaket kan fravikes for utgifter godkjent av selskapet på forhånd", "5.1; 4.1–4.2 side 4", 5],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "Avtalt egenandel fremgår av forsikringsbeviset, i tillegg 20 % av utgifter til advokat og sakkyndig bistand", "5.2", 6, false, "reference"],
  ]),
  sp1Delkasko: facts("sp1Delkasko", [
    ["tilbehor.grense", "Fastmontert tilleggsutstyr – forsikringssum", "Inntil 50 000 kr, eller beløpet i forsikringsbeviset", "1.2", 4],
    ["bagasje.grense", "Personlige eiendeler – forsikringssum", "Inntil 20 000 kr i bilen; penger, gavekort, verdipapirer, smykker og klokker er unntatt", "1.3", 4],
    ["brann.dekning", "Brann", "Brann, lynnedslag og eksplosjon", "2.1", 4],
    ["tyveri.dekning", "Tyveri", "Tyveri, tyveriforsøk og hærverk; handlinger utført av sikredes husstand eller ansatt sjåfør er unntatt fra tyveribegrepet. Underslag ved prøvekjøring omfattes når bilen selges gjennom offentlig tilgjengelige annonsemedier. Når bilen ikke er kommet til rette etter 21 dager erstattes markedsverdien på skadedagen. Ved bare stjålet nøkkel dekkes ny nøkkel, programmering og omkoding når dette er hensiktsmessig som et skadeforebyggende tiltak", "2.2 side 4 og 3.4 side 6", 4],
    ["glass.dekning", "Glass", "Reparasjon eller skifte av rute, glasstak og takluke ved bruddskade; solcellepanel er unntatt. Ved skifte erstattes inntil 50 % av bilens markedsverdi", "2.3 side 4 og 3.5 side 6", 4],
    ["veihjelp.dekning", "Veihjelp", "Persontransport og transport/assistanse ved dekket skade eller upåregnelig driftsstans etter vilkårene. Nødvendige merutgifter til hjemreise med rimeligste kommunikasjonsmiddel til bosted når fører/passasjer rammes av ulykkestilfelle, plutselig sykdom eller død som hindrer fortsatt reise med bilen, når dekket skade eller upåregnelig driftsstopp gjør at bilen ikke kan settes i trafikksikker stand innen rimelig tid, eller når bilen er stjålet og ikke kommet til rette innen rimelig tid. Etter sikredes ønske erstattes videre reise til bestemmelsesstedet når dette er rimeligere enn hjemreise", "2.4.1–2.4.2", 5],
    ["veihjelp.feilfylling.grense", "Veihjelp – feilfylling", "Tømming og rens av drivstofftank inntil 10 000 kr", "2.4.2", 5],
    ["veihjelp.transport.grense", "Veihjelp – transportgrense", "Inntil 50 % av bilens markedsverdi", "2.4.2", 5],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 1 år etter registrering som fabrikkny", "3.2.1", 5],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Ikke kjørt over 15 000 km", "3.2.1", 5],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Reparasjonskostnad over 80 % av bilens nyanskaffelsesverdi", "3.2.1", 5],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Ny bil etter hovedregelen gjelder ikke leaset bil. Startleie erstattes forholdsmessig nedskrevet etter gjenstående leiemåneder ved dekningsmessig skade innen 1 år etter registrering som fabrikkny, ikke kjørt over 15 000 km og reparasjonskostnad over 80 % av nyanskaffelsesverdien på skadedagen (listepris uten rabatter eller spesialpris)", "3.2.2", 6],
    ["reparasjon.garanti", "Reparasjonsgaranti", "8 år for privatbil inntil 3 500 kg ved reparasjon på Fremtinds avtaleverksted; glass og slitasjedeler er unntatt. Garantien gjelder utbedring av feil og mangler som følge av reparasjoner utført etter 01.01.2023, fra dagen bilen utleveres fra verkstedet. Leiebil ved garantireparasjon: inntil 600 kr per dag i inntil 45 dager; veihjelp etter gjeldende vilkår. Reklamasjon til både verkstedet og Fremtind snarest og senest innen to måneder etter at en mulig mangel er oppdaget", "3.3", 6],
    ["delkasko.egenandel", "Delkasko – avtalt egenandel", "Fremgår av forsikringsbeviset", "4", 7, false, "reference"],
  ]),
  sp1Kasko: facts("sp1Kasko", [
    ["kasko.dekning", "Kaskoskade", "Sammenstøt, utforkjøring, velting, feilfylling eller annen tilfeldig, plutselig ytre påvirkning. Maskinskade og leiebil er separate valgfrie dekninger. Slitasje, gradvis utviklet skade, frost, skade ved ruspåvirket kjøring når sikrede visste eller burde vite om påvirkningen, ulovlig terrengkjøring, samt kjøring på avsperret område er unntatt; unntaket for avsperret område har særregel for autorisert trafikkskole og førerutviklingskurs forhåndsgodkjent av selskapet. Utleieskade er unntatt med mindre forsikringsbeviset uttrykkelig omfatter utleie; skade ved bruk som drosje, budbil eller annen næringsvirksomhet er unntatt", "1.1", 8],
    ["kasko.egenandel", "Kasko – avtalt egenandel", "Fremgår av forsikringsbeviset", "3.1", 8, false, "reference"],
    ["kasko.egenandel.ung", "Kasko – tillegg for uregistrert fører under 23 år", "Avtalt egenandel økes med 12 000 kr", "3.1", 8, false, "override"],
    ["kasko.egenandel.dyr", "Kasko – reduksjon ved skade fra dyr", "Avtalt egenandel reduseres med inntil 2 000 kr", "3.1", 8, false, "override"],
  ]),
  sp1Toppkasko: facts("sp1Toppkasko", [
    ["bilnokkel.dekning", "Bilnøkkel", "Ny nøkkel, programmering og omkoding når nøkkelen er mistet, stjålet eller skadet ved tilfeldig, plutselig ytre påvirkning", "1.1.1", 8],
    ["bilnokkel.grense", "Bilnøkkel – forsikringssum", "Inntil 15 000 kr", "1.1.1", 8],
    ["bilnokkel.egenandel", "Bilnøkkel – egenandel", "1 000 kr", "3.1", 9, false, "override"],
    ["ladekabel.dekning", "Ladekabel", "Tyveri eller annen skade ved tilfeldig, plutselig ytre påvirkning på ladekabel til el- og hybridbil", "1.1.2", 9],
    ["ladekabel.grense", "Ladekabel – forsikringssum", "Inntil 10 000 kr for ny ladekabel til el- og hybridbil", "1.1.2", 9],
    ["ladekabel.egenandel", "Ladekabel – egenandel", "1 000 kr", "3.2", 9, false, "override"],
    ["interiorrens.grense", "Rens av interiør – forsikringssum", "Inntil 10 000 kr etter tilfeldig, plutselig søl", "1.1.3", 9],
    ["interiorrens.egenandel", "Rens av interiør – egenandel", "1 000 kr", "3.3", 9, false, "override"],
    ["parkering.dekning", "Parkeringsskade", "Skade på parkert bil med ukjent skadevolder uten bonustap når tid og sted er kjent", "1.1.4", 9],
    ["parkering.alder", "Parkeringsskade – alder", "Til første hovedforfall etter at bilen har blitt 6 år", "1.1.4", 9],
    ["bonus.parkert", "Parkeringsskade – bonustap", "Ingen bonustap når vilkårene er oppfylt", "1.1.4", 9],
    ["feilfylling.egenandel", "Feilfylling – egenandel", "1 000 kr", "3.4", 9, false, "override"],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 3 år etter registrering som fabrikkny", "2.1", 9, true],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Ikke kjørt over 100 000 km", "2.1", 9, true],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Reparasjonskostnad over 80 % av bilens nyanskaffelsesverdi", "2.1", 9, true],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Ny bil etter hovedregelen gjelder ikke leaset bil. Startleie erstattes forholdsmessig nedskrevet etter gjenstående leiemåneder ved dekningsmessig skade innen 3 år etter registrering som fabrikkny, ikke kjørt over 100 000 km og reparasjonskostnad over 80 % av nyanskaffelsesverdien på skadedagen (listepris uten rabatter eller spesialpris)", "2.1", 9, true],
  ]),
  sp1Leiebil: facts("sp1Leiebil", [
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 45 dager ved normal reparasjonstid", "1.1", 1],
    ["leiebil.bilklasse", "Leiebil – biltype", "Tilsvarende biltype som den forsikrede bilen", "1.1", 1],
    ["leiebil.dagsgrense", "Leiebil – dagsgrense", "Inntil 600 kr per dag", "1.1", 1],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon eller tyveri", "Fra meldt skade til 15 dager etter sendt erstatningstilbud, samlet høyst 45 dager", "2.1", 1],
    ["leiebil.godkjenning", "Leiebil – godkjenning", "Bruk av leiebil og leverandør skal godkjennes av selskapet", "1.1", 1],
    ["leiebil.unntak", "Leiebil – begrensning", "Ikke drivstoff, bompenger, parkering eller leiebil ved bare glasskade", "1.1", 1],
  ]),
  sp1Maskinskade: facts("sp1Maskinskade", [
    ["maskinskade.dekning", "Maskinskade – komponenter", "Tilfeldig og plutselig skade på følgende oppregnede komponenter: bensin/diesel – motorblokk og innvendige deler, topplokk, ventiler, kamaksel, turbo, wastegate/ladeluftkompressor, coil, innsug og eksosmanifold, innsprøytningssystem med pumper/dyser/sensorer, EGR-ventil/kjøler, vannpumpe, startmotor, dynamo, lambdasonde, NOX-sensor og AdBlue-dyse/styreenhet med tank. Gir/styring/kraftoverføring – innvendige bevegelige girkassedeler, dobbeltmasse svinghjul, hoved-/slavesylinder, fordelingsgirkasse/vinkeldrev, differensial, mellom-/drivaksel uten mansjetter, innvendig elektronisk girvelger, servopumpe og elektroniske styreenheter til fremdriftsmotor og girkasse. El-/hybridkomponenter følger den særskilte oppregningen", "1.1", 1],
    ["maskinskade.alder", "Maskinskade – alder", "Til første hovedforfall etter at bilen har blitt 10 år", "1.1", 1],
    ["maskinskade.km", "Maskinskade – kilometer", "Til 200 000 km; det som inntreffer først", "1.1", 1],
    ["maskinskade.el", "Maskinskade – el-/hybridkomponenter", "Høyvoltsbatteri, spenningsomformer (DC/DC), strømveksler, fabrikkmontert batterilader, el-motor og dens girkasse, styreenhet for el-motor og høyvoltsbatteri, ladekontakten og dens stillmotor, samt PTC-varmer og AC/klimakompressor der den har kjøle- og/eller varmefunksjon mot høyvoltsbatteri", "1.1", 1],
    ["maskinskade.batteri.fradrag", "Høyvoltbatteri – aldersfradrag", "10 % ved 5 år, økende med 10 prosentpoeng per år til maksimalt 50 %", "2.1", 1],
    ["maskinskade.egenandel.0-99999", "Maskinskade – egenandel 0–99 999 km", "10 000 kr", "3", 2, false, "override"],
    ["maskinskade.egenandel.100000-149999", "Maskinskade – egenandel 100 000–149 999 km", "15 000 kr", "3", 2, false, "override"],
    ["maskinskade.egenandel.150000-200000", "Maskinskade – egenandel 150 000–200 000 km", "20 000 kr", "3", 2, false, "override"],
    ["maskinskade.unntak", "Maskinskade – unntak", "Blant annet slitasje, varmgang, frost, fukt, garantiskade, ikke godkjent tuning/ombygging og komponenter som ikke er uttrykkelig nevnt", "1.1", 1],
  ]),
};

const version = "PMO-357.001-004";
export const sparebank1FremtindProducts: CatalogProduct[] = [
  { company: "SpareBank 1 / Fremtind", insuranceType: "Bil", name: "Ansvar", providerId: "sparebank1-fremtind", productId: "sb1-bil-ansvar", version, sourceId: "sp1Ipid", componentIds: ["sp1Core", "sp1Ansvar", "sp1Ulykke", "sp1Rettshjelp"] },
  { company: "SpareBank 1 / Fremtind", insuranceType: "Bil", name: "Delkasko", providerId: "sparebank1-fremtind", productId: "sb1-bil-delkasko", version, sourceId: "sp1Ipid", inheritsProductId: "sb1-bil-ansvar", componentIds: ["sp1Delkasko"] },
  { company: "SpareBank 1 / Fremtind", insuranceType: "Bil", name: "Kasko", providerId: "sparebank1-fremtind", productId: "sb1-bil-kasko", version, sourceId: "sp1Ipid", inheritsProductId: "sb1-bil-delkasko", componentIds: ["sp1Kasko"] },
  { company: "SpareBank 1 / Fremtind", insuranceType: "Bil", name: "Toppkasko", providerId: "sparebank1-fremtind", productId: "sb1-bil-toppkasko", version, sourceId: "sp1Ipid", inheritsProductId: "sb1-bil-kasko", componentIds: ["sp1Toppkasko"] },
];

export const sparebank1FremtindAddOns: CatalogAddOn[] = [
  { id: "sb1-leiebil", name: "Leiebil", componentId: "sp1Leiebil", providerId: "sparebank1-fremtind", requiresLevel: ["sb1-bil-kasko", "sb1-bil-toppkasko"] },
  { id: "sb1-maskinskade", name: "Maskinskade", componentId: "sp1Maskinskade", providerId: "sparebank1-fremtind", requiresLevel: ["sb1-bil-kasko", "sb1-bil-toppkasko"] },
];
