import type { CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { gjensidigeReiseSources } from "./gjensidige-reise-sources.ts";
export { gjensidigeReiseSources } from "./gjensidige-reise-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const s = gjensidigeReiseSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `reise.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: s.id, section, page, filename: s.filename, termsNumber: s.termsNumber,
      effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, productCode: s.productCode,
      version: s.version, note: "Forsikringsbeviset går foran for produkt, sikrede, reisevarighet, summer, egenandeler, utvidelser og særvilkår." },
  }));
}

const common = facts("gjensidigeReiseTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset avgjør Reise/Reise Pluss, enkeltperson/familie, sikrede, varighet og utvidelser, summer, egenandeler og særvilkår.", "Forsikringsbevis", 1],
  ["personer.omfang", "Enkeltperson eller familie", "Navngitte personer må ha folkeregistrert bostedsadresse i Norge, oppholde seg minst 6 måneder årlig i Norge og være medlem av norsk folketrygd. Familie omfatter ektefelle/samboer, barn og fosterbarn til fylte 21 år; samboer og fosterbarn må ha samme folkeregistrerte adresse. Familie omfatter også barnebarn og oldebarn under 21 år når de reiser alene sammen med sikrede.", "Hvem gjelder forsikringen for", 3],
  ["omrade.verden", "Geografisk område", "Ferie-, fritids- og yrkesreiser i hele verden som starter og slutter på bostedsadressen i Norge, også dagsturer uten overnatting. Gjelder ikke hjemme, fast arbeids-/studiested, barnehage eller lignende. Ansvar og rettshjelp gjelder utenfor Norden.", "Hvor gjelder forsikringen", 3],
  ["varighet.maks", "Maksimal standard reisevarighet", "70 dager (10 uker) per sammenhengende reise for både Reise og Reise Pluss; forsikringsbeviset styrer faktisk varighet.", "Hva er forsikret", 3],
  ["medisinsk.behandling", "Akutt sykdom og personskade", "Nødvendig behandling, lege, foreskrevne medisiner, sykehus, fysikalsk/kiropraktisk behandling, kriseterapi, transport til behandling og medisinsk nødvendig forlenget opphold ved uventet akutt sykdom eller skade på reisen; uten generell øvre sum etter forsikringsoversikten.", "Sykdom/ulykkesskade", 4],
  ["medisinsk.tann", "Tannbehandling", "Nødvendig tannlegebehandling og medisiner ved tannskade etter alvorlig ulykkesskade som må behandles på reisen; uten generell øvre sum. Alminnelig tannbehandling og tyggeskade er unntatt.", "Sykdom/ulykkesskade", 4],
  ["medisinsk.kjent", "Kjent sykdom og graviditet", "Ikke utgifter ved kjent sykdom/skade med behandlingsbehov, videre utredning eller stor sannsynlighet for forverring/komplikasjon, eller planlagt behandling. Uventede alvorlige svangerskapskomplikasjoner kan omfattes; fødsel etter uke 37 og vanlige kontroller/plager er unntatt.", "Sykdom/ulykkesskade", 4],
  ["hjemtransport", "Hjemtransport", "Forhåndsgodkjent medisinsk nødvendig hjemtransport til bostedsadresse eller behandlingssted i Norge, ledsager og innhenting av reiserute; hjemtransport av avdød er ubegrenset, eller begravelse på stedet inntil 50 000 kr.", "Transport og overnatting", 4],
  ["sykeledsagelse", "Tilkalling og ledsager", "Ved alvorlig medisinsk tilstand dekkes tilsvarende reise fra Norge og opphold for inntil to personer. Ledsagerutgifter og tilkalling skal forhåndsgodkjennes.", "Tilkalling", 4],
  ["hjemkallelse", "Hjemkalling", "Forhåndsgodkjent hjemreise ved alvorlig og uventet sykdom, ulykke eller dødsfall i nærmeste familie, eller alvorlig skade på egen bolig/forretning som krever tilstedeværelse; uten generell øvre sum.", "Hjemkalling", 4],
  ["reiseavbrudd", "Avbrutt ferie", "Feriekompensasjon ved sengeleie/sykehus på ferie inntil 5 uker: 2 000 kr per dag i inntil 10 dager, maks 20 000 kr. Ferieavbrytelse ved dekket hjemtransport/hjemkalling: 2 000 kr per tapt dag, begrenset av dokumentert pris og produktsum.", "Tapt ferie", 4],
  ["bagasje.dekning", "Reisegods", "Navngitte hendelser som tyveri, ran, skadeverk, brann, vann-/naturskade, trafikk-/båtuhell, transportørbekreftet skade/tap, personskadeuhell og skade fra dyr. Mistet, bortkommet, kosmetisk eller mekanisk skade er ikke generell uhellsdekning.", "Reisegods", 5],
  ["bagasje.per_gjenstand", "Enkeltgjenstand", "Annet reisegods enn særskilte kategorier er begrenset til 20 000 kr per gjenstand.", "Reisegods", 6],
  ["bagasje.sykkel", "Sykkel", "Inntil 40 000 kr for sykkel, elsykkel, elsparkesykkel og sykkeltilhenger på reise utenfor Norge.", "Reisegods", 1],
  ["bagasje.sportsutstyr", "Leid sports- og fritidsutstyr", "Dokumentert krav fra utleier etter dekket tap eller skade, inntil 10 000 kr.", "Reisegods", 6],
  ["bagasje.mobil", "Mobiltelefon", "Knust eller sprukket skjerm/bakside og annen skade som skjer samtidig, samt tyveri, ran eller brann. Reparasjon/skjermbytte eller brukt, renset og reparert erstatningsenhet; mistet/bortkommet telefon og smartklokke/nettbrett/PC er unntatt.", "Mobiltelefon", 6],
  ["bagasje.mobil_egenandel", "Mobiltelefon – egenandel", "1 000 kr for begge produkter ved Gjensidiges samarbeidspartner; 3 000 kr ved annen reparatør/leverandør.", "Mobiltelefon / Erstatningsregler", 6, "override"],
  ["bagasje.forsinket", "Forsinket bagasje", "Dokumenterte nødvendige klær og utstyr når ekspedert bagasje er forsinket eller forbyttet på utreise; PIR/transportørbekreftelse og kvitteringer kreves. Ikke ved hjemkomst.", "Forsinkelser", 6],
  ["forsinkelse.rute", "Forsinket transportmiddel", "Ved minst 1,5 times dokumentert forsinkelse/kansellering etter påbegynt transportetappe på grunn av vær, ras, teknisk/mekanisk feil, trafikkuhell eller nødlanding dekkes nødvendige merutgifter til overnatting og transport for å innhente forhåndsbetalt reiserute.", "Forsinkelser", 6],
  ["evakuering", "Evakuering", "Forhåndsgodkjente nødvendige merutgifter til reise/opphold hjem eller nærmeste sikre sted ved offisielt evakueringsråd etter krig, alvorlig uro, terror, naturkatastrofe eller epidemi/pandemi som oppstår under reisen; uten generell øvre sum. Tapt ferie inntil 15 000 kr.", "Evakuering", 7],
  ["avbestilling.dekning", "Avbestilling", "Dokumenterte, ikke-refunderbare transport-, overnattings-, leie- og arrangementsutgifter ved vilkårsbestemt sykdom/død, bolig-/virksomhetsskade, ny UD-advarsel, naturkatastrofe innen 72 timer, samlivsbrudd eller rettsplikt. Refusjon fra andre og bonuspoeng omfattes ikke.", "Avbestilling", 7],
  ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for person-, ting- eller formuesskade på reise utenfor Norden. Leiet fast eiendom/hotellrom kan omfattes; brukte/lånte/leide ting og motorvogn/båt/drone er blant unntakene.", "Ansvar", 12],
  ["ansvar.sum", "Privatansvar – sum", "15 000 000 kr per skadetilfelle; egenandel etter forsikringsbeviset.", "Ansvar", 13],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige juridiske kostnader ved privat tvist på reise utenfor Norden; omfatter også alternativ utenrettslig mekling via mekle.no etter vilkåret.", "Rettshjelp", 14],
  ["rettshjelp.sum", "Rettshjelp – sum", "100 000 kr per tvist for 1–2 parter; samlet grense øker trinnvis til 1 000 000 kr ved 50 eller flere parter.", "Forsikringssum og egenandel", 16],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "Ingen egenandel for Reiseforsikring dersom ikke annet fremgår av forsikringsbeviset.", "Forsikringssum og egenandel", 16, "reference"],
  ["omrade.ud", "UD, krig og uro", "Reiser til/fra/i område med offisiell UD-advarsel er unntatt uavhengig av om reisen er nødvendig, med mindre særskilt utvidelse er avtalt. Avbestilling før avreise og evakuering under reisen har egne vilkår.", "Hvor gjelder forsikringen", 3],
  ["aktivitet.unntak", "Sport og aktiviteter", "Luftsport krever særskilt utvidelse; basehopp, boksing og dykking dypere enn 40 meter er unntatt. Ekspedisjoner i Arktis/Antarktis, kryssing av Grønlandsisen og Himalaya over 4 500 moh. er unntatt eller krever særskilt avtale der dette tilbys.", "Hvor gjelder forsikringen", 3],
  ["sikkerhet.reisegods", "Sikkerhetsforskrifter", "Reisegods skal ha tilsyn eller sikres/låses forsvarlig. Verdigjenstander skal skjules og ikke sendes som innsjekket bagasje; sykkel skal låses fast; emballering og transportørens frister/regler må følges. Brudd kan redusere erstatningen.", "Sikkerhetsforskrifter", 2],
  ["bagasje.aldersfradrag", "Aldersfradrag", "Elektronikk 10 % per år; mobil 20 % per påbegynt år fra ett år; smartklokke/nettbrett 20 % per år; klær/sko/sportsutstyr/briller 10 % per år; sykkel 20 % per år fra fem år. Maksimalt fradrag 80 %.", "Erstatningsregler", 18],
]);

const reise = facts("gjensidigeReiseTerms", [
  ["bagasje.total", "Reisegods – samlet sum", "100 000 kr per sikret.", "Forsikringsoversikt", 1],
  ["bagasje.verdisaker", "Verdigjenstander samlet", "20 000 kr per sikret for foto/video/data, elektronisk/optisk utstyr, klokker og smykker.", "Forsikringsoversikt", 1],
  ["bagasje.kontanter", "Kontanter og gavekort", "2 000 kr per sikret; familiebegrensning følger vilkåret.", "Forsikringsoversikt", 1],
  ["bagasje.egenandel", "Generell egenandel", "1 000 kr for ferie/fritid og de dekningene oversikten underlegger avtalt egenandel; mobil har egen regel.", "Forsikringsoversikt", 1, "standard"],
  ["bagasje.forsinket_sum", "Forsinket bagasje – sum", "3 000 kr per sikret.", "Forsikringsoversikt", 1],
  ["forsinkelse.rute_sum", "Forsinket transport – sum", "20 000 kr per sikret.", "Forsikringsoversikt", 1],
  ["avbestilling.sum", "Avbestilling – sum", "50 000 kr per sikret.", "Forsikringsoversikt", 1],
  ["reiseavbrudd.sum", "Ferieavbrytelse – sum", "50 000 kr per sikret.", "Forsikringsoversikt", 1],
]);

const pluss = facts("gjensidigeReisePlussTerms", [
  ["bagasje.total", "Reisegods – samlet sum", "Ingen generell samlet øvre sum; kategori- og gjenstandsgrenser gjelder.", "Forsikringsoversikt", 1, undefined, true],
  ["bagasje.verdisaker", "Verdigjenstander samlet", "40 000 kr per sikret.", "Forsikringsoversikt", 1, undefined, true],
  ["bagasje.kontanter", "Kontanter og gavekort", "5 000 kr per sikret; familiebegrensning følger vilkåret.", "Forsikringsoversikt", 1, undefined, true],
  ["bagasje.egenandel", "Generell egenandel", "Ingen egenandel, bortsett fra mobiltelefon der 1 000/3 000 kr-regelen gjelder.", "Forsikringsoversikt", 1, "override", true],
  ["bagasje.forsinket_sum", "Forsinket bagasje – sum", "5 000 kr per sikret.", "Forsikringsoversikt", 1, undefined, true],
  ["forsinkelse.rute_sum", "Forsinket transport – sum", "25 000 kr per sikret.", "Forsikringsoversikt", 1, undefined, true],
  ["forsinkelse.hotell_arrangement", "Tapt overnatting og arrangement", "Inntil 5 000 kr ved ankomst mer enn åtte timer forsinket etter vilkåret.", "Forsikringsoversikt / Forsinkelser", 1],
  ["forsinkelse.leiebilavtale", "Forsinket uthenting av leiebil", "Inntil 10 000 kr ved dokumentert endring av leieavtale etter kvalifiserende transportforsinkelse.", "Forsikringsoversikt / Forsinkelser", 1],
  ["avbestilling.sum", "Avbestilling – sum", "Ingen generell øvre sum; dokumenterte ikke-refunderbare kostnader og vilkåret styrer.", "Forsikringsoversikt", 1, undefined, true],
  ["reiseavbrudd.sum", "Ferieavbrytelse – sum", "100 000 kr per sikret.", "Forsikringsoversikt", 1, undefined, true],
  ["leiebil.egenandel", "Egenandel leid kjøretøy", "Ubegrenset dokumentert fast egenandelskrav ved skade eller tyveri av leid bil/motorsykkel på feriereise når kjøretøyet har kaskoforsikring; forsikringsbevis og leieavtale styrer.", "Leiebil", 8],
  ["ulykke.dekning", "Helårs ulykkesforsikring", "Gjelder hele døgnet, også utenfor reise, for personer i forsikringsbeviset. Dekker dødsfall, varig medisinsk invaliditet og behandlingsutgifter etter erstatningsmessig ulykkesskade.", "Ulykke", 9],
  ["ulykke.invaliditet", "Ulykke – medisinsk invaliditet", "300 000 kr ved 100 % medisinsk invaliditet for voksen; barn under 21 år har inntil 500 000 kr.", "Forsikringsoversikt / Ulykke", 1],
  ["ulykke.dodsfall", "Ulykke – dødsfall", "100 000 kr; dødsfallet må følge innen ett år etter ulykkesskaden.", "Forsikringsoversikt / Ulykke", 1],
  ["ulykke.behandling", "Ulykke – behandlingsutgifter", "Inntil 15 000 kr i inntil to år etter skade; for barn under 21 år inntil 25 000 kr og særregel for utsatt tannbehandling til utgangen av året barnet fyller 25.", "Forsikringsoversikt / Ulykke", 1],
]);

const duration = facts("gjensidigeReiseDays", [[
  "varighet.utvidelse", "Utvidelse av reisedager", "Kundespesifikt tillegg for én sammenhengende reise: inntil 42 ekstra uker / 295 ekstra dager. Må kjøpes før avreise og kan ikke legges til underveis. Forsikringsbeviset angir avtalt periode.", "Hvor lenge kan jeg være bortreist", 1,
]]);
const services = [
  ...facts("gjensidigeReiseAlarm", [["tjeneste.alarm", "Gjensidige Travel Assistance", "Døgnåpen alarmsentral som gir personlig praktisk og medisinsk assistanse i utlandet; forhåndsgodkjenner blant annet hjemtransport og evakuering. Tjeneste, ikke forsikringssum.", "Alarmsentralen", 1]]),
  ...facts("gjensidigeReiseDoctor", [["tjeneste.legehjelp", "Online lege via Dr.Dropin", "Dr.Dropin gir videokonsultasjon med norsktalende lege ved sykdom eller skade på ferie i utlandet for personer som omfattes av reiseforsikringen. Tjeneste, ikke forsikringssum.", "Online lege på reise", 1]]),
];

export const gjensidigeReiseFacts: Record<string, CatalogFact[]> = {
  gjensidigeReiseCommon: common, gjensidigeReise: reise, gjensidigeReisePluss: pluss,
  gjensidigeReiseDuration: duration, gjensidigeReiseServices: services,
};
export const gjensidigeReiseProducts: CatalogProduct[] = [
  { company: "Gjensidige", insuranceType: "Reise", name: "Reise", providerId: "gjensidige",
    productId: "gjensidige-reise", version: "2026-09-20-canonical", sourceId: "gjensidigeReiseTerms",
    componentIds: ["gjensidigeReiseCommon", "gjensidigeReise", "gjensidigeReiseDuration", "gjensidigeReiseServices"] },
  { company: "Gjensidige", insuranceType: "Reise", name: "Reise Pluss", providerId: "gjensidige",
    productId: "gjensidige-reise-pluss", version: "2026-09-20-canonical", sourceId: "gjensidigeReisePlussTerms",
    componentIds: ["gjensidigeReisePluss"], inheritsProductId: "gjensidige-reise" },
];
export const gjensidigeReiseAddOns = [];
