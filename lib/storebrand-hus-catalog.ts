import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { storebrandHusSources } from "./storebrand-hus-sources.ts";
export { storebrandHusSources } from "./storebrand-hus-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const s = storebrandHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `hus.${key}`, label, value, ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}), source: { documentId: s.id, filename: s.filename,
      termsNumber: s.termsNumber, effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, section, page,
      version: s.version },
  }));
}
function age(component: string, label: string, freeYears: number, annualPercent: number,
  maximumPercent = 80): CatalogFact {
  const item = facts("storebrandHusTerms", [[`aldersfradrag.${component}`, `Aldersfradrag – ${label}`,
    `${freeYears} år uten fradrag; deretter ${annualPercent} % per år, maksimalt ${maximumPercent} %. Fradraget gjelder alle kostnader knyttet til reparasjonen.`, "B.6.5", 29]])[0];
  item.structuredValue = { kind: "age_deduction", component, scope: "building", freeYears, annualPercent,
    maximumPercent, minimumCompensationPercent: 100 - maximumPercent, yearBasis: "year", exceptions: [],
    calculationBasis: "Alle kostnader knyttet til reparasjonen" };
  return item;
}

const standard = facts("storebrandHusTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset fastslår forsikret bygning, sted, Standard/Super, egenandel, forsikringsform, utleie og særvilkår, og gjelder foran vilkåret ved avvik.", "Innledning/A", 1],
  ["forsikringsform", "Forsikringsform", "Fullverdi dekker dokumentert gjenoppføringskostnad etter vilkårets regler; førsterisiko er begrenset til summen i forsikringsbeviset. Fullverdi er ikke en ubegrenset kontant forsikringssum.", "B.6.1", 20],
  ["bygninger.dekning", "Forsikrede bygninger", "Bygninger som står i forsikringsbeviset. Frittstående bygg opptil 10 m² omfattes med Standard selv om de ikke er spesifisert; større garasje, anneks og lignende må stå i beviset.", "B.3", 5],
  ["bygninger.tilbehor", "Fast inventar og installasjoner", "Grunnmur, fundamenter, innvendige rør og ledninger og fastmontert utstyr som er nødvendig og vanlig for bygningens formål. Integrerte hvitevarer og teknisk utstyr har egne aldersregler; ladeboks er ikke særskilt navngitt.", "B.3", 5],
  ["teknisk.solceller", "Solcelleanlegg", "Solcelleanlegg koblet til huset og brukt til privat strømforbruk.", "B.3", 5],
  ["ror.utvendig", "Utvendige rør og ledninger", "Tilknyttede kabler og rør frem til offentlig nett, brønn, tank, kum, reservoar eller spredeledning. Brønn, borehull, drens- og spredningsanlegg er unntatt, med særregel ved brann/naturskade.", "B.3", 5],
  ["hage.objekter", "Hage og uteområde", "Hage, gjerde og flaggstang på inntil 5 dekar samt tilknyttet basseng, boblebad og badestamp.", "B.3", 5],
  ["hage.brygge", "Brygge og treterrasse", "Privat flytebrygge, trebrygge og frittliggende treterrasse til sammen 100 000 kroner ved brann og naturskade; andre skader er unntatt.", "B.3/B.4.9", 5],
  ["bygninger.utsmykning", "Kunstnerisk utsmykning", "Inntil 500 000 kroner.", "B.3", 4],
  ["andrebygninger.endring", "Nye bygg, tilbygg og påbygg", "Trygghetsgaranti frem til første hovedforfall for garasje, naust, båthus, uthus, tilbygg eller påbygg siden forrige hovedforfall; må meldes før fornyelsen.", "B.3", 6],
  ["brann.dekning", "Brann", "Brann, plutselig og uforutsett eksplosjon, utstrømming fra brannslukningsutstyr og plutselig nedsoting. Gnist- og sviskade inntil 10 000 kroner.", "B.4.1", 7],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag, dokumentert overspenning og brudd på bygningens elektriske kabler.", "B.4.2", 7],
  ["vaer.dekning", "Snø, is og svakere vind", "Ras på/fra tak, snø-/istyngde og snøpress; annen plutselig skade kan omfatte vind svakere enn storm. Egne konstruksjons- og objektunntak gjelder.", "B.4.3/B.4.7", 8],
  ["ror.brudd", "Rør- og ledningsbrudd", "Brudd på væskeførende rør og tilknyttede radiatorer, beredere, tanker, pumper, kummer og fyrkjeler; tining av utvendig rør og oppspyling av tett rør inngår.", "B.4.4", 8],
  ["vann.utstromming", "Vann, gass og annen væske", "Plutselig lekkasje, oversvømmelse eller tilbakeslag fra væskeførende rør og tilknyttet utstyr, samt utstrømming fra akvarium og brannslukningsapparat.", "B.4.5", 9],
  ["vann.terreng", "Terreng-, grunn- og overflatevann", "Plutselig inntrengning fra terreng, grunn eller overflatevann som gir frittstående vann utover gulvet; omfatter regn, ispress og snøsmelting.", "B.4.5", 9],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Ikke omfattet på Standard utover de ordinære vannreglene.", "C.1.1", 33],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Skade og følgeskade fra utett gulv eller vegg i våtrom er unntatt på Standard.", "B.4.5", 10],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Selve våtrommet er unntatt når skaden skyldes utetthet.", "B.4.5", 10],
  ["tyveri.dekning", "Tyveri og skadeverk", "Tyveri og skadeverk på fastmonterte bygningsdeler, gjerde, flaggstang, hageanlegg og tilknyttede badeinnretninger. Leietakers handlinger krever utleietillegg.", "B.4.6", 10],
  ["plutselig.dekning", "Annen plutselig og uforutsett skade", "Andre plutselige og uforutsette fysiske skader, med detaljerte unntak for blant annet vann, våtrom, sopp/råte, feil, slitasje og teknisk svikt.", "B.4.7", 11],
  ["handverker.folgeskade", "Håndverkerfeil", "Utbedring av håndverkerfeil og følgeskade er unntatt på Standard.", "B.4.7", 11],
  ["rate.dekning", "Råte og sopp", "Sopp, råte, bakterier og mugg er unntatt på Standard.", "B.4.7", 11],
  ["skadedyr.bekjempelse", "Bekjempelse av skadeinsekter og gnagere", "Storebrand-rekvirert innendørs bekjempelse av skadeinsekter, veggedyr, kakerlakker, skjeggkre, rotter og mus; kartlegging og inntil to behandlinger.", "B.4.11", 15],
  ["skadedyr.bygningsskade", "Fysisk skade fra gnagere", "Standard dekker bygningsskade fra rotter og mus, men ikke fysisk skade fra andre dyr eller skadeinsekter.", "B.4.11", 15],
  ["tilpasning.grense", "Ombygging for rullestolbruker", "Inntil 500 000 kroner ved minst 50 % medisinsk invaliditet når sikrede blir rullestolbruker etter ulykke eller ved nærmere angitt fødselstilfelle; utgifter innen fem år. Gjelder ikke hytte.", "B.4.12", 16],
  ["rydding.dekning", "Riving, rydding og deponering", "Nødvendig riving, rydding og bortkjøring etter dekningsmessig skade. Ved førsterisiko gis inntil 20 % utover forsikringssummen.", "B.5.1", 17],
  ["brukstap.dekning", "Ubeboelig bolig etter skade", "Dokumenterte nødvendige ekstra boutgifter opptil markedsleie; uten dokumentasjon 50 % av markedsleie i normal reparasjonstid.", "B.5.2", 17],
  ["leietap.skade", "Tapt leieinntekt etter bygningsskade", "Når utleie er avtalt og står i forsikringsbeviset: tapt leieinntekt fra skadedato til normal reparasjon, begrenset til tidligere leieinntekt. Skilles fra leietakers betalingsmislighold.", "B.5.2.1.1", 18],
  ["pabud.grense", "Offentlige påbud", "Merutgifter ved endrede tekniske krav til skadd del. Fredet/verneverdig bygning er begrenset til 1 000 000 kroner; arbeidet må fullføres innen fem år.", "B.6.4.9", 24],
  ["gjenoppforing.klima", "Klima- og sikkerhetsoppgradering", "Inntil 150 000 kroner ved gjenoppføring av fullverdiforsikret bolig når reparasjonen overstiger 75 % av gjenoppføringsprisen, for tiltak utover lovkrav som reduserer utslipp/energi eller øker sikkerhet.", "B.5.4", 19],
  ["gjenoppforing.hovedregel", "Gjenoppføring – hovedregel", "Samme eiendom (eller samme kommune ved myndighetskrav), samme formål og sikrede/nærstående som byggherre innen fem år gir full erstatning etter fullverdireglene.", "B.6.2", 20],
  ["gjenoppforing.annetsted", "Gjenoppføring annet sted/formål", "Ved annet sted i Norge, annet formål eller annen byggherre trekkes hele verdiøkningen; manglende gjenoppføring innen fem år begrenses til omsetningsverdi.", "B.6.3", 21],
  ["gjenoppforing.markedsverdi", "Kjøp av annen bolig", "Ved totalskade kan tilsvarende bolig i Norge kjøpes innen fem år; oppussing/tilpasning inntil 1 000 000 kroner må ferdigstilles innen to år. Samlet oppgjør har dokumenterte verdi- og gjenoppføringsgrenser.", "B.6.3.3", 21],
  ["naturskade.dekning", "Naturskade", "Direkte skade ved skred, storm, flom, stormflo, flodbølge, meteoritt, jordskjelv eller vulkanutbrudd i Norge etter naturskadeforsikringsloven.", "B.4.9", 12],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen i forsikringsbeviset gjelder med mindre vilkåret fastsetter annet.", "B.7", 29, "reference"],
  ["naturskade.egenandel", "Naturskadeegenandel", "Myndighetsfastsatt egenandel; HUS10 oppgir 8 000 kroner per 01.01.2025.", "B.7", 29, "override"],
  ["vann.egenandel", "Vann/frost/alder – ekstra egenandel", "Avtalt egenandel økes med 8 000 kroner ved blant annet frost i innvendig rør, eldre rør, tak/våtrom over 30 år og eldre vanntilkoblet utstyr uten lekkasjestopper.", "B.7", 29, "override"],
  ["skadedyr.egenandel", "Bekjempelse – egenandel", "2 000 kroner ved bekjempelse av skadeinsekter og gnagere.", "B.7", 29, "override"],
  ["sikkerhet.egenandelsfritak", "Egenandelsfritak ved sikring", "Ingen egenandel ved dokumenterte FG-tiltak for brann, innbrudd, vann eller helhetlig vannstopp, og ved angitte overvannstiltak; heller ingen egenandel ved boligtilpasning.", "B.7", 30],
  ["byggunderoppforing", "Bygg under oppføring", "Nybygg/tilbygg/påbygg under oppføring inngår som risikosituasjon: materialer og eget verktøy, brakker 50 000 kroner, verktøy 100 000 kroner og grave-/sprengningsansvar 300 000 kroner ting/3 millioner person, med tyveri- og tetthetskrav.", "B.4.10", 14],
  ["ansvar.dekning", "Ansvar som eier", "Rettslig erstatningsansvar som personlig eier av forsikret eiendom for person- og tingskade i Norden.", "D.1-D.3", 37],
  ["ansvar.grense", "Ansvar – forsikringssum", "5 000 000 kroner per skadetilfelle; saksomkostninger kommer i tillegg.", "D.5", 39],
  ["ansvar.egenandel", "Ansvar – egenandel", "4 000 kroner per skadetilfelle.", "D.6", 39, "override"],
  ["rettshjelp.dekning", "Rettshjelp – eiendomstvister", "Rimelige og nødvendige utgifter ved tvist som personlig eier/fester av forsikret eiendom i Norden; rettsmegling inntil 7 500 kroner.", "E.1-E.3", 41],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kroner per tvist. Flerpart: 3–10: 250 000; 11–25: 500 000; 26–49: 750 000; 50+: 1 000 000 kroner.", "E", 40],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 % av resterende erstatningsbeløp.", "E.5", 44, "override"],
  ["service.psykolog", "Psykologhjelp", "Inntil 10 behandlingstimer etter alvorlig brann eller ran, overfall eller voldtekt ved hjemmet, innen 12 måneder.", "B.4.8", 12],
]);
const form = standard.find((f) => f.key === "hus.forsikringsform")!;
form.structuredValue = { kind: "insurance_form", forms: ["full_value", "first_loss"], defaultForm: "full_value",
  authority: "policy" };
standard.push(age("bereder_pumpe", "varmtvannsbereder, fyrkjele og pumper", 5, 5),
  age("oppvarming", "varme, kjøling, ventilasjon og strømproduksjon", 10, 10),
  age("hvitevarer", "integrerte hvitevarer", 5, 10), age("utvendige_ror", "utvendige rør, tanker, kummer og bunnledninger", 20, 5),
  age("badeinnretning", "elektrisk tilknyttet badeinnretning", 2, 10));

const superFacts = facts("storebrandHusTerms", [
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Følgeskade ved plutselig vanninntrengning over bakkenivå omfattes. Selve utettheten er unntatt; tak/takgjennomføring over 50 år er unntatt.", "C.1.1", 33, undefined, true],
  ["skadedyr.bygningsskade", "Fysisk skade fra skadedyr", "Fysisk bygningsskade fra skadeinsekter, skadedyr og gnagere omfattes, med unntak for kjæledyr, kosmetikk og isolasjon uten svekket funksjon.", "C.1.2", 33, undefined, true],
  ["rate.dekning", "Råte og sopp", "Ekte hussopp, andre treødeleggende sopper og råte som utvikles i forsikringstiden. Mugg, blåved, utvendig treverk og ikke-boligbygg eldre enn 50 år er blant unntakene.", "C.1.3", 34, undefined, true],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Følgeskade fra utett våtrom omfattes; selve våtrommet omfattes ikke av denne dekningen.", "C.1.4", 35, undefined, true],
  ["handverker.folgeskade", "Håndverkerfeil", "Fysisk følgeskade og skade ved utett våtrom fra dokumentert arbeid av autorisert håndverker under ti år; ved lekkasje i våtrom kan selve feilen/mangelen utbedres. Feil uten skade er unntatt.", "C.1.5", 35, undefined, true],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Utbedring av feilen/mangelen i våtrommet omfattes når autorisert håndverkerarbeid under ti år har gitt utetthet og lekkasje; ellers er selve våtrommet unntatt.", "C.1.5", 35, undefined, true],
  ["vann.vannstopper", "Vannstopper etter rørskade", "Inntil 6 000 kroner til forhåndsavklart installasjon av vannstopper etter dekningsmessig innvendig rørbrudd.", "C.1.6", 36],
]);

const rental = facts("storebrandHusRental", [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Valgfritt tillegg som må være avtalt og aktivt før leieforholdet og fremgå av forsikringsbeviset. Krever privat utleie, skriftlig kontrakt og normalt minst to måneders depositum/bankgaranti.", "A", 2],
  ["utleie.mislighold", "Utleie – betalingsmislighold", "Opptil seks måneders husleie, én gang per leietaker, fra krav om utkastelse til tilbakeføring pluss to måneder.", "A.3.1", 3],
  ["utleie.utkastelse", "Utleie – utkastelse", "Nødvendige og rimelige kostnader inntil 20 000 kroner.", "A.3.2", 3],
  ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk fra leietaker eller gjester på utleid bolig, innbo og uteområder; slitasje, feil bruk, dyr og kosmetiske skader er unntatt.", "A.3.3", 4],
  ["utleie.tyveri", "Utleie – tyveri og underslag", "Tyveri og underslag fra leietaker eller dennes husstand inntil 500 000 kroner.", "A.3.4", 4],
  ["utleie.mislighold.egenandel", "Utleie – egenandel", "Tre måneders husleie, minst depositum/betalingsgaranti; høyere sikkerhet trekkes fullt fra. Egne regler gjelder korttidsutleie av fritidsbolig.", "A.4", 4, "override"],
]);

export const storebrandHusFacts: Record<string, CatalogFact[]> = {
  storebrandHusStandard: standard,
  storebrandHusSuper: superFacts,
  storebrandHusRental: rental,
  storebrandHusGeneral: facts("storebrandHusGeneral", [["avtale.generelle", "Generelle vilkår", "Generelle regler om avtale, skadeoppgjør og felles begrensninger.", "Generelle vilkår", 1]]),
  storebrandHusIpid: facts("storebrandHusIpid", [["avtale.ipid", "IPID – produktoversikt", "Oversikt over Standard, Super og mulige tillegg; fullvilkår og forsikringsbevis avgjør.", "Produktoversikt", 1]]),
  storebrandHusProduct: facts("storebrandHusProduct", [["service.vilkarsgaranti", "Tjeneste – vilkårsgaranti",
    "Produktsiden markedsfører like gode eller bedre vilkår enn forrige selskap i to år etter bytte. Garantien gjelder innhold, ikke egenandeler eller partnerdekninger; konkret anvendelse må vurderes mot tidligere avtale og garantibetingelser.", "Ofte stilte spørsmål", 1]]),
};
export const storebrandHusProducts: CatalogProduct[] = [
  { company: "Storebrand", insuranceType: "Hus", name: "Standard", providerId: "storebrand", productId: "storebrand-hus-standard", version: "2025-08-15", sourceId: "storebrandHusTerms", componentIds: ["storebrandHusGeneral", "storebrandHusIpid", "storebrandHusProduct", "storebrandHusStandard"] },
  { company: "Storebrand", insuranceType: "Hus", name: "Super", providerId: "storebrand", productId: "storebrand-hus-super", version: "2025-08-15", sourceId: "storebrandHusTerms", componentIds: ["storebrandHusSuper"], inheritsProductId: "storebrand-hus-standard" },
];
export const storebrandHusAddOns: CatalogAddOn[] = [{ id: "storebrand-hus-utleie", name: "Utleieforsikring",
  componentId: "storebrandHusRental", providerId: "storebrand",
  requiresLevel: ["storebrand-hus-standard", "storebrand-hus-super"], insuranceTypes: ["Hus"] }];
