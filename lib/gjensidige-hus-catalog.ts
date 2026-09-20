import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { gjensidigeHusSources } from "./gjensidige-hus-sources.ts";
export { gjensidigeHusSources } from "./gjensidige-hus-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = gjensidigeHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `hus.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, section, page,
      version: source.version, productCode: source.productCode },
  }));
}
function age(component: string, label: string, freeYears: number, annualPercent: number,
  exceptions: string[] = []): CatalogFact {
  const fact = facts("gjensidigeHusStandard", [[`aldersfradrag.${component}`, `Aldersfradrag – ${label}`,
    `${freeYears} år uten fradrag; deretter ${annualPercent} % for hvert påbegynte år, maksimalt 80 %.`,
    "Erstatningsregler – Egenandel / Aldersfradrag", 18]])[0];
  fact.structuredValue = { kind: "age_deduction", component, scope: "building", freeYears,
    annualPercent, maximumPercent: 80, minimumCompensationPercent: 20, yearBasis: "started_year",
    exceptions, calculationBasis: "Skadet gjenstand og nødvendige reparasjons- eller utskiftningskostnader" };
  return fact;
}

const standard = facts("gjensidigeHusStandard", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "De alminnelige vilkårene er en generell oversikt og er ikke del av den enkelte avtalen. Forsikringsbeviset og kundens fullstendige vilkår avgjør valgt dekning, summer, egenandeler og registrerte utvidelser.", "Forsikringsoversikt / Forsikringsbevis", 1],
  ["forsikringsform", "Forsikringsform", "Fullverdi gir gjenoppføring etter vilkårsreglene uten fast sum. Førsterisiko er begrenset til avtalt forsikringssum. Forsikringsbeviset avgjør formen.", "Erstatningsregler – Hus", 17],
  ["bygninger.dekning", "Forsikrede bygninger", "Bygningen i forsikringsbeviset med fastmontert utstyr, samt frittliggende bygg på forsikringsstedet inntil 10 m² BTA. Større sidebygg må fremgå av beviset.", "Hus – Hva forsikringen omfatter", 2],
  ["bygninger.tilbehor", "Fast inventar og installasjoner", "Fastmontert utstyr og tilbehør som er vanlig for bygningens formål inngår.", "Hus – Hva forsikringen omfatter", 2],
  ["teknisk.solceller", "Solcelleanlegg", "Solcelleanlegg til privat strømforbruk inngår.", "Hus – Hva forsikringen omfatter", 2],
  ["ror.utvendig", "Utvendige rør og ledninger", "Tilknyttede utvendige ledninger frem til offentlig ledning eller spredeledning. Brønn og borehull er unntatt.", "Hus – Hva forsikringen omfatter", 2],
  ["hage.objekter", "Hage og uteområde", "Hageanlegg på inntil fem dekar, inkludert fast utendørs svømmebasseng.", "Hus – Hva forsikringen omfatter", 2],
  ["hage.brygge", "Fast brygge", "Fast brygge inntil 100 000 kroner ved brann og naturskade. Flytebrygge og molo er unntatt; utvidet sum kan avtales.", "Hus – Hva forsikringen omfatter", 2],
  ["byggunderoppforing", "Bygg under oppføring", "Bygningsmaterialer, brakker og containere til byggearbeid på forsikringsstedet inngår etter vilkårets regler.", "Hus – Hva forsikringen omfatter", 2],
  ["brann.dekning", "Brann", "Brann, lynnedslag, eksplosjon, elektrisk fenomen og plutselig nedsoting.", "Hus – Dekkes", 3],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag og annet elektrisk fenomen etter vilkårets regler.", "Hus – Dekkes", 3],
  ["vann.utstromming", "Vann og annen væske", "Plutselig utstrømming fra rør, tilknyttet utstyr, akvarium eller slokkeanlegg.", "Hus – Dekkes", 3],
  ["ror.brudd", "Rørbrudd", "Brudd på bygningens og tilknyttede utvendige væskeledninger med tilhørende utstyr.", "Hus – Dekkes", 3],
  ["ror.tining", "Tining og oppspyling av rør", "Tining av utvendig rør og oppspyling av tett rør omfattes etter vilkårets regler.", "Hus – Dekkes", 3],
  ["vann.terreng", "Vann fra terreng", "Vann fra terreng når det dannes vannspeil over laveste gulv.", "Hus – Dekkes", 3],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Vannskade på tilstøtende rom som følge av utett våtrom omfattes.", "Hus – Dekkes", 3],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Skaden innenfor våtrommets bjelkelag er unntatt på Hus.", "Hus – Dekkes ikke", 3],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Vann gjennom utett bygning er ikke særskilt omfattet på Hus utover ordinære dekningshendelser.", "Hus – Dekkes ikke", 3],
  ["tyveri.dekning", "Tyveri og skadeverk", "Tyveri og skadeverk på forsikret bygning. Skadeverk fra leietaker krever registrert utleie.", "Hus – Dekkes", 3],
  ["plutselig.dekning", "Annen plutselig skade", "Andre plutselige og uforutsette fysiske skader med vilkårets unntak.", "Hus – Dekkes", 3],
  ["glass.dekning", "Bygningsglass og sanitærporselen", "Bruddskade på bygningsglass og sanitærporselen omfattes; egenandel 3 000 kroner.", "Forsikringsoversikt / Hus", 1, "override"],
  ["vaer.dekning", "Snø, is og vær", "Plutselig bygningsskade kan omfattes, mens vedlikehold, svak konstruksjon og særskilte begrensninger for uferdige utvendige arbeider gjelder.", "Hus – Dekkes / Dekkes ikke", 3],
  ["handverker.folgeskade", "Håndverkerfeil", "Følgeskade etter material-, konstruksjons-, prosjekterings- eller montasjefeil er ikke særskilt omfattet på Hus.", "Hus – Dekkes ikke", 4],
  ["rate.dekning", "Råte og sopp", "Sopp og råte er unntatt på Hus uten valgfri utvidelse.", "Hus – Dekkes ikke", 3],
  ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "Bekjempelse av mus, rotter og andre skadedyr med inntil fire bein.", "Hus – Dekkes", 3],
  ["skadedyr.bygningsskade", "Bygningsskade fra skadedyr", "Skade som følge av mus, rotter og andre skadedyr med inntil fire bein.", "Hus – Dekkes", 3],
  ["tilpasning.grense", "Ombygging for rullestolbruker", "Inntil 250 000 kroner ved varig rullestolbruk etter plutselig ytre ulykke eller medfødt funksjonsnedsettelse. Egne tiårsfrister og senest 20 år fra fødsel gjelder.", "Hus – Ombygging for rullestolbruker", 5],
  ["brukstap.dekning", "Ubeboelig bolig etter skade", "Tap tilsvarende markedsleie i normal reparasjons-/gjenoppføringstid; uten dokumenterte boutgifter begrenses erstatningen til 50 % av gjeldende leiepris.", "Erstatningsregler – Husleietap og brukstap", 17],
  ["leietap.skade", "Tapt leieinntekt etter bygningsskade", "Registrert leieinntekt etter leiekontrakt i normal reparasjonstid; korttidsutleie bare for inngåtte kontrakter. Dette er skilt fra betalingsmislighold.", "Erstatningsregler – Husleietap og brukstap", 17],
  ["gjenoppforing.hovedregel", "Fullverdigaranti", "Ingen fradrag for verdiøkning når fullverdiforsikret bygning repareres eller gjenoppføres til samme formål og sted innen fem år.", "Erstatningsregler – Hus", 17],
  ["gjenoppforing.totalskade", "Totalskadeterskel", "Når skaden overstiger 75 % av gjenoppføringskostnaden kan sikrede kreve totalskadeoppgjør uten fradrag for gjenverdier, forutsatt at de rives og fjernes innen to år.", "Erstatningsregler – Hus", 17],
  ["gjenoppforing.annetsted", "Gjenoppføring annet sted eller formål", "Ved annet sted eller annet formål trekkes verdiøkning beregnet som forskjellen i markedsverdi før og etter skade. Manglende reparasjon/gjenoppføring innen fem år begrenses til det laveste av beregnet skade og markedsverdifall.", "Erstatningsregler – Hus", 17],
  ["gjenoppforing.klima", "Svanemerket gjenoppføring", "Når Gjensidige styrer gjenoppføringen av totalskadet bolig på samme sted og til samme formål, kan kunden velge Svanemerket bolig; merkostnad inntil 250 000 kroner.", "Erstatningsregler – Hus", 17],
  ["pabud.dekning", "Offentlige påbud", "Merutgifter på grunn av offentlig påbud etter dekningsmessig skade omfattes etter vilkårets regler. Omlegging av utvendige vann-/kloakkledninger eller renseanlegg bare som følge av lekkasje er unntatt.", "Hus – Tilleggsutgifter", 5],
  ["naturskade.dekning", "Naturskade", "Naturskade på brannforsikret bygning etter naturskadeforsikringsloven.", "Erstatningsregler – Naturskade", 18],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen i forsikringsbeviset gjelder. Produktsiden oppgir 8 000 kroner som standardvalg og valgmuligheter fra 8 000 til 20 000 kroner.", "Forsikringsoversikt / Egenandel", 1, "reference"],
  ["naturskade.egenandel", "Naturskadeegenandel", "8 000 kroner.", "Forsikringsoversikt", 1, "override"],
  ["sikkerhet.egenandelsfritak", "Egenandelsfritak ved sikring", "Ingen egenandel ved innvendig vannledningsbrudd med heldekkende vannstopp, elektrisk brann etter godkjent kontroll siste fem år, eller skade som bare rammer overspenningsvern/brann-/innbruddsalarm.", "Erstatningsregler – Egenandel / Aldersfradrag", 18],
  ["ansvar.dekning", "Ansvar som eier", "Rettslig erstatningsansvar som eier av forsikret eiendom i Norden.", "Ansvar", 7],
  ["ansvar.grense", "Ansvar – forsikringssum", "5 000 000 kroner per skadetilfelle.", "Ansvar – Forsikringssum", 8],
  ["ansvar.egenandel", "Ansvar – egenandel", "4 000 kroner per skadetilfelle.", "Ansvar – Egenandel", 8, "override"],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter ved tvist i egenskap av personlig eier av forsikret eiendom, innenfor vilkårets domstols- og tvistkrav.", "Rettshjelp", 10],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kroner per tvist. Flerpart: 3–10 parter 250 000, 11–25 parter 500 000, 26–49 parter 750 000 og 50+ parter 1 000 000 kroner.", "Rettshjelp – Forsikringssum og egenandel", 11],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 % av de dekkede utgiftene. Ved utenrettslig mekling via Mekle.no er egenandelen 0 kroner.", "Rettshjelp – Forsikringssum og egenandel", 11, "override"],
  ["service.helsehjelp", "Helsehjelp 24/7", "Tjeneste for husstanden i hele verden: ubegrenset videolege, én videokonsultasjon med psykolog og fysioterapeut per husstandsmedlem per 12 måneder, selvhjelpsprogrammer, rabatter og digital veiledning.", "Helsehjelp 24/7", 12],
]);
const form = standard.find((fact) => fact.key === "hus.forsikringsform")!;
form.structuredValue = { kind: "insurance_form", forms: ["full_value", "first_loss"], defaultForm: "full_value", authority: "policy" };
standard.push(
  age("utvendige_ledninger", "utvendige ledninger og tanker (ikke plast/glassfiber)", 20, 5),
  age("varmepumpe_luft_luft", "luft-til-luft-varmepumpe", 5, 10),
  age("oppvarming_vvs", "andre oppvarmings-, kjøle-, ventilasjons- og VVS-installasjoner", 7, 10, ["Tilhørende rør"]),
  age("integrerte_hvitevarer", "integrerte hvitevarer", 5, 10, ["Ingen fradrag ved reparasjon"]),
  age("varmekabler_bereder", "varmekabler og varmtvannsbereder", 10, 10, ["Ingen fradrag ved punktreparasjon"]),
  age("utvendig_badekilde", "utvendig badekilde med utstyr", 5, 10),
);

const pluss = facts("gjensidigeHusPluss", [
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Følgeskade ved vanninntrengning gjennom utett bygning over bakkenivå. Selve feilen/utettheten og tak eldre enn 50 år er unntatt; bygningen må være fullverdiforsikret.", "Hus – Dekkes / Dekkes ikke", 3, undefined, true],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Skade på våtrom etter material-, konstruksjons-, prosjekterings- eller montasjefeil utført av faglært håndverker eller godkjent/registrert entreprenør, konstatert innen ti år.", "Håndverks- og entreprenørfeil – våtrom", 4, undefined, true],
  ["handverker.folgeskade", "Håndverkerfeil", "Følgeskade på bygning etter material-, konstruksjons-, prosjekterings- eller montasjefeil utført av faglært håndverker eller godkjent/registrert entreprenør, konstatert innen ti år. Selve feilen er unntatt utenfor våtrom.", "Håndverks- og entreprenørfeil", 4, undefined, true],
  ["rate.dekning", "Råte og sopp", "På fullverdiforsikret bygning: materialnedbrytning fra råtesopper og treødeleggende insekter. Mugg, blåved, svertesopp og utvendig treverk er blant unntakene.", "Råte og skadeinsekter", 6, undefined, true],
  ["skadedyr.bekjempelse", "Bekjempelse av skadeinsekter", "Bekjempelse av blant annet stokkmaur, husbukk, stripet borebille, kakerlakk, veggedyr og skjeggkre. Gjensidige velger metode.", "Råte og skadeinsekter", 6, undefined, true],
  ["skadedyr.bygningsskade", "Bygningsskade fra treødeleggende insekter", "Materialnedbrytning fra treødeleggende insekter på fullverdiforsikret bygning.", "Råte og skadeinsekter", 6, undefined, true],
  ["rate.egenandel", "Råte og skadeinsekter – egenandel", "6 000 kroner for bygningsskade.", "Forsikringsoversikt", 1, "override"],
  ["skadedyr.egenandel", "Bekjempelse av skadeinsekter – egenandel", "2 000 kroner.", "Forsikringsoversikt", 1, "override"],
]);

const rental = facts("gjensidigeHusStandard", [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Valgfri utvidelse som må være registrert i forsikringsbeviset. Skriftlig leieavtale med angitte parts-, leie-, sikkerhets- og utkastelsespunkter kreves.", "Hus / Erstatningsregler – Leiekontrakten", 17],
  ["utleie.mislighold", "Utleie – betalingsmislighold", "Misligholdt husleie i inntil seks måneder, én gang per leietaker. Varsel må sendes innen 14 dager; ved fortsatt mislighold må utkastelse begjæres innen seks uker etter første mislighold.", "Hus – Utleie", 3],
  ["utleie.utkastelse", "Utleie – utkastelse", "Nødvendige utgifter til utkastelse inntil 20 000 kroner.", "Hus – Utleie", 3],
  ["utleie.skadeverk", "Utleie – skadeverk", "Skadeverk på bygningen fra registrert leietaker.", "Hus – Utleie", 3],
  ["utleie.egenandel", "Utleie – egenandel", "10 000 kroner ved misligholdt husleie og skadeverk av leietaker.", "Forsikringsoversikt", 1, "override"],
]);

const rotOption = pluss.filter((fact) => ["hus.rate.dekning", "hus.skadedyr.bekjempelse", "hus.skadedyr.bygningsskade", "hus.rate.egenandel", "hus.skadedyr.egenandel"].includes(fact.key)).map((fact) => ({ ...fact,
  qualificationSource: facts("gjensidigeHusIpid", [["rate.valgfritt", "Råte og skadeinsekter – valgfritt på Hus", "Hus kan utvides med sopp, råte og skadeinsekter; Pluss har dekningen inkludert.", "Utvidelser", 2]])[0].source,
}));

const smart = facts("gjensidigeHusSmart", [
  ["service.smart", "Hus Smart – alarmtjeneste", "Valgfri alarmtjeneste til Hus eller Hus Pluss, med sensorer koblet til døgnbemannet alarmstasjon for vann og brann; innbruddsalarm kan velges. Alarmprisen er en separat løpende tjenestepris.", "Hus Smart", 1],
  ["sikkerhet.egenandelsreduksjon", "Hus Smart – redusert egenandel", "Egenandelen reduseres med inntil 8 000 kroner ved brann når tilkoblet brannalarm varsler, og ved tyveri/forsøk når tilkoblet tyverialarm varsler.", "Fordeler med Hus Smart", 1],
]);
smart.push(...facts("gjensidigeHusSmartTerms", [["service.smart.avtale", "Alarmtjenestens avtalevilkår", "Alarmutstyret leies, tjenesten har egne betalings-, installasjons-, bruk- og oppsigelsesvilkår. Forsikringsdekningen og alarmabonnementet må vurderes separat.", "Avtalevilkår", 1]]));

export const gjensidigeHusFacts: Record<string, CatalogFact[]> = {
  gjensidigeHusStandard: standard,
  gjensidigeHusPluss: pluss,
  gjensidigeHusRental: rental,
  gjensidigeHusRotOption: rotOption,
  gjensidigeHusSmart: smart,
  gjensidigeHusIpid: facts("gjensidigeHusIpid", [["avtale.ipid", "IPID – produktoversikt", "EAP01 oppsummerer Hus, Hus Pluss og valgfrie utvidelser; forsikringsbevis og fullstendige kundevilkår avgjør.", "Produktoversikt", 1]]),
  gjensidigeHusProduct: facts("gjensidigeHusProduct", [["avtale.produktside", "Produktside – veiledende informasjon", "Produktsiden beskriver nivåer og valg kontrollert 20.09.2026. Pris og konkret dekning bestemmes av tilbud, forsikringsbevis og fullstendige vilkår.", "Husforsikring", 1]]),
};

export const gjensidigeHusProducts: CatalogProduct[] = [
  { company: "Gjensidige", insuranceType: "Hus", name: "Hus", providerId: "gjensidige",
    productId: "gjensidige-hus", version: "Alminnelige vilkår", sourceId: "gjensidigeHusStandard",
    componentIds: ["gjensidigeHusIpid", "gjensidigeHusProduct", "gjensidigeHusStandard"] },
  { company: "Gjensidige", insuranceType: "Hus", name: "Hus Pluss", providerId: "gjensidige",
    productId: "gjensidige-hus-pluss", version: "Alminnelige vilkår", sourceId: "gjensidigeHusPluss",
    componentIds: ["gjensidigeHusPluss"], inheritsProductId: "gjensidige-hus" },
];
export const gjensidigeHusAddOns: CatalogAddOn[] = [
  { id: "gjensidige-hus-utleie", name: "Utleie", componentId: "gjensidigeHusRental", providerId: "gjensidige",
    requiresLevel: ["gjensidige-hus", "gjensidige-hus-pluss"], insuranceTypes: ["Hus"] },
  { id: "gjensidige-hus-rate-insekter", name: "Sopp, råte og skadeinsekter", componentId: "gjensidigeHusRotOption", providerId: "gjensidige",
    requiresLevel: ["gjensidige-hus"], insuranceTypes: ["Hus"] },
  { id: "gjensidige-hus-smart", name: "Hus Smart", componentId: "gjensidigeHusSmart", providerId: "gjensidige",
    requiresLevel: ["gjensidige-hus", "gjensidige-hus-pluss"], insuranceTypes: ["Hus"] },
];
