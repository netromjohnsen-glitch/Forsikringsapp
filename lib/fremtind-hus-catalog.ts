import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { fremtindHusSources } from "./fremtind-hus-sources.ts";
export { fremtindHusSources } from "./fremtind-hus-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = fremtindHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `hus.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, section, page,
      version: source.version, productCode: source.productCode,
      note: "Kanonisk Fremtind-kilde distribuert gjennom Eika, SpareBank 1 og DNB; forsikringsbeviset avgjør avtalte valg." },
  }));
}
function age(component: string, label: string, freeYears: number, annualPercent: number): CatalogFact {
  const item = facts("fremtindHusStandard", [[`aldersfradrag.${component}`, `Aldersfradrag – ${label}`,
    `${freeYears} år uten fradrag; deretter ${annualPercent} % per påbegynt år, maksimalt 80 %. Fradraget beregnes av totale reparasjonskostnader.`,
    "5.3 Erstatningsregler for tilbehør", 6]])[0];
  item.structuredValue = { kind: "age_deduction", component, scope: "building", freeYears,
    annualPercent, maximumPercent: 80, minimumCompensationPercent: 20, yearBasis: "started_year",
    exceptions: [], calculationBasis: "Totale reparasjonskostnader" };
  return item;
}

const standard = facts("fremtindHusStandard", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset avgjør bygning, forsikringssted, Standard/Topp, fullverdi/førsterisiko, egenandel, tilleggsbygg, utleie, tillegg og sikkerhetsforskrifter.", "3 Hva forsikringen omfatter", 2],
  ["forsikringsform", "Forsikringsform", "Fullverdi dekker kostnaden ved tilsvarende eller vesentlig tilsvarende gjenoppføring etter oppgjørsreglene. Førsterisiko er begrenset til avtalt sum i forsikringsbeviset.", "5.2 Erstatningsregler for bygning", 5],
  ["bygninger.dekning", "Forsikrede bygninger", "Bygningen i forsikringsbeviset med fastmontert utstyr. Tilleggsbygg må avtales; bygg inntil 10 m² BTA har bare brann- og naturskadedekning uten særskilt avtale.", "3.1 Bygning", 2],
  ["bygninger.tilbehor", "Fast inventar og installasjoner", "Fastmontert utstyr som er vanlig for bygningens formål, herunder bygningsrør, oppvarmingsutstyr og integrerte installasjoner.", "3.1 Bygning", 2],
  ["andrebygninger.endring", "Bygningsendringer", "Tilbygg og andre verdiøkende forandringer må meldes for å unngå underforsikring. Topp omfatter bygningsmessige forandringer i avtaleperioden frem til periodens utløp.", "3.1 / 5.2.2", 2],
  ["bygninger.utsmykning", "Kunstnerisk utsmykning", "Kunstnerisk utsmykning av bygningen omfattes.", "3.1 Bygning", 2],
  ["ror.utvendig", "Utvendige rør og ledninger", "Utvendige rør og ledninger med tilknyttet utstyr frem til offentlig ledning eller brønn. Overvanns-/infiltrasjonsledning, spredegrøft, brønn og borehull er unntatt.", "3.2", 2],
  ["hage.objekter", "Hage og tomt", "Hageanlegg og tomt inntil fem mål rundt boligen.", "3.3", 2],
  ["hage.basseng", "Basseng og boblebad", "Utvendig basseng og boblebad med ledninger inntil 200 000 kroner.", "3.3", 2],
  ["hage.brygge", "Brygge", "Fast tre- og flytebrygge med installasjoner inntil 100 000 kroner; andel i fellesbrygge er unntatt.", "3.3", 2],
  ["pabud.dekning", "Offentlige påbud", "Bygningsmessige merutgifter ved skadeutbedring som følger av lovlig offentlig påbud. For førsterisiko inntil 20 % av forsikringssummen; forebyggende og skadeuavhengige påbud er unntatt.", "3.4 / 5.5.1", 2],
  ["rydding.dekning", "Riving og rydding", "Riving, rydding, bortkjøring og deponering etter dekningsmessig skade. For førsterisiko inntil 20 % av forsikringssummen.", "3.4", 2],
  ["brukstap.dekning", "Ubeboelig bolig", "Tap ved at egen bolig ikke kan brukes i normal reparasjons-/gjenoppføringstid, beregnet etter markedsleie for umøblerte rom.", "3.4 / 5.5.2", 2],
  ["leietap.skade", "Tapt leieinntekt etter bygningsskade", "Tapt husleie etter dekningsmessig bygningsskade i normal reparasjonstid, beregnet etter leie for umøblerte rom; korttidsleie brukes ikke som beregningsgrunnlag.", "5.5.2", 6],
  ["brann.dekning", "Brann", "Brann, eksplosjon/sprengning og nedsoting. Svi- og gnistskader uten brann er unntatt.", "4.1 Brann", 3],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag og spenningsfeil på strømnettet.", "4.1 Brann", 3],
  ["vann.utstromming", "Vann og annen væske", "Utstrømming ved brudd, lekkasje eller oversvømmelse fra bygningsrør med utstyr eller akvarium.", "4.2", 3],
  ["vann.terreng", "Terreng-, grunn- og avløpsvann", "Vann som plutselig trenger inn fra terreng, gjennom grunnen eller avløpssystemet i slik mengde at det står vann over gulvet.", "4.2", 3],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Vannskade på tilstøtende rom som følge av utett våtrom omfattes.", "4.2", 3],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Skade innenfor våtrommets bjelkelag og stenderverk som skyldes utetthet er unntatt på Standard.", "4.2", 3],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Vann fra tak, takrenne, utvendig nedløp eller utett forbindelse til taksluk/innvendig nedløp er unntatt på Standard.", "4.2", 3],
  ["ror.brudd", "Rørbrudd", "Brudd på innvendige og utvendige rørledninger med angitt utstyr, herunder radiator, varmtvannsbeholder, tank og drenskum.", "4.3", 3],
  ["ror.tining", "Tining av utvendig rør", "Tining av utvendig vann- og avløpsledning inntil 50 000 kroner inklusive tilleggsutgifter og tap.", "4.3", 3],
  ["plutselig.dekning", "Annen plutselig skade", "Andre tilfeldige og plutselige skader, med detaljerte unntak for blant annet feil, svak konstruksjon, frost, dyr, insekter, slitasje og kosmetikk.", "4.4", 4],
  ["handverker.folgeskade", "Håndverker- og entreprenørfeil", "Material-, konstruksjons- og montasjefeil og deres følger er unntatt på Standard med mindre en annen dekningshendelse gjelder.", "4.4", 4],
  ["rate.dekning", "Sopp og råte", "Sopp, råte og bakterier er unntatt uten valgfri tilleggsforsikring.", "4.2 / 4.4", 3],
  ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "Ikke omfattet på Standard.", "4.4", 4],
  ["skadedyr.bygningsskade", "Bygningsskade fra dyr", "Skade fra dyr og insekter er unntatt på Standard.", "4.4", 4],
  ["glass.dekning", "Bygningsglass og sanitærporselen", "Bruddskade omfattes etter vilkårets plutselighetsregler; egenandel 2 000 kroner.", "4.4 / 6.2", 4, "override"],
  ["gjenoppforing.hovedregel", "Gjenoppføring – hovedregel", "Samme eller vesentlig samme stand innen fem år. Fullverdi ved samme sted/formål gir ikke fradrag for verdiøkning; myndighetsnektelse tillater annet sted i samme kommune.", "5.2.1–5.2.2", 5],
  ["gjenoppforing.annetsted", "Annet sted eller formål", "Ved annet sted/formål trekkes verdiøkning over 40 % av tidligere omsetningsverdi. Ingen gjenoppføring innen fem år begrenser oppgjøret til markedsverdifallet.", "5.2.2.1–5.2.2.3", 5],
  ["gjenoppforing.markedsverdi", "Kjøp av annen bolig", "Ved totalskade kan annen bolig i Norge til samme formål kjøpes innen to år; oppussing/tilpasning inntil 1 000 000 kroner innen dokumenterte totalgrenser.", "5.2.2.4", 5],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen fremgår av forsikringsbeviset. Den kan ikke utledes som én generell katalogsum.", "6 Egenandel", 7, "reference"],
  ["sikkerhet.egenandelsreduksjon", "Egenandelsreduksjon ved sikring", "Inntil 6 000 kroner reduksjon ved angitte FG-godkjente el-kontroll-, alarm- og vannstopptiltak. Ingen egenandel ved dokumenterte overvannstiltak.", "6.1", 7],
  ["vann.egenandel.gjentatt_vann", "Gjentatte vannskader", "Avtalt egenandel økes med 20 000 kroner ved vannskader av samme årsak på samme bygning innen 24 måneder.", "6.4", 7, "override"],
  ["hvitevarer.egenandel", "Integrerte hvitevarer – egenandel", "2 000 kroner.", "6.3", 7, "override"],
  ["naturskade.dekning", "Naturskade", "Naturskade etter naturskadeforsikringsloven og det innarbeidede naturskadevilkåret.", "4.5 / FFE-001.001-006", 4],
  ["naturskade.egenandel", "Naturskade – egenandel", "Lovbestemt egenandel; vilkåret oppgir 8 000 kroner.", "6.7", 7, "override"],
  ["ansvar.dekning", "Ansvar som eier", "Rettslig erstatningsansvar for person-, ting- og følgetap som eier av forsikret eiendom.", "FFE-002.001-007", 8],
  ["ansvar.grense", "Ansvar – forsikringssum", "5 000 000 kroner per skadetilfelle ifølge den offentlige produktoversikten; forsikringsbeviset er autoritativt.", "FFE-002.001-007 / produktoversikt", 8, "reference"],
  ["ansvar.egenandel", "Ansvar – egenandel", "4 000 kroner.", "6.5", 7, "override"],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige juridiske utgifter ved tvist som personlig eier eller fester av forsikret eiendom.", "FFE-003.001-003", 10],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kroner per tvist; kan utvides til 250 000 kroner når minst tre parter står på samme side.", "FFE-003.001-003 punkt 5.1", 11],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 % av overskytende utgifter.", "6.6 / FFE-003.001-003 punkt 5.2", 7, "override"],
]);
const form = standard.find((fact) => fact.key === "hus.forsikringsform")!;
form.structuredValue = { kind: "insurance_form", forms: ["full_value", "first_loss"], defaultForm: "full_value", authority: "policy" };
standard.push(
  age("utvendige_ledninger", "utvendige og bunnledninger, sjø-/jordvarmeledning", 20, 5),
  age("tanker_kummer", "tanker og kummer (ikke plast/glassfiber)", 20, 5),
  age("basseng_boblebad", "basseng og boblebad", 5, 10),
  age("berg_jordvarmepumpe", "berg- og jordvarmepumpe", 7, 10),
  age("luftvarmepumpe", "luft-til-luft/luft-til-væske-varmepumpe", 5, 10),
  age("bereder_pumpe", "varmtvannsbeholder og vannpumpe", 5, 5),
  age("varmekabler", "varmekabler og annen oppvarming/kjøling", 10, 10),
  age("integrerte_hvitevarer", "integrerte elektriske husholdningsapparater", 5, 10),
  age("solceller", "solcelleanlegg", 20, 5),
  age("smarthus", "smarthus og elektroniske installasjoner", 5, 10),
);

const topp = facts("fremtindHusTopp", [
  ["hage.basseng", "Basseng og boblebad", "Utvendig basseng og boblebad med ledninger inntil 500 000 kroner.", "1.1", 1, undefined, true],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Følgeskade fra utett tak når taket er inntil 50 år, og vann over terreng som trenger inn gjennom utett bygning. Selve taket/veggen og feilen er unntatt.", "2.1", 1, undefined, true],
  ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "Bekjempelse etter påvist aktivitet på fullverdiforsikret bolig; Fremtind velger metode og skadedyrsfirma. Insekter er unntatt.", "2.2", 1, undefined, true],
  ["skadedyr.bygningsskade", "Bygningsskade fra dyr", "Fysisk skade, svekket isolasjonsevne og lukt fra dyr på fullverdiforsikret bolig. Kjæledyr og insekter er unntatt.", "2.2", 1, undefined, true],
  ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kroner.", "4", 2, "override"],
  ["vatrom.selverommet", "Våtrom – håndverkerfeil", "Skade på våtrom fra material-, konstruksjons- eller montasjefeil utført og dokumentert av godkjent/autorisert håndverker eller entreprenør, konstatert innen ti år. Selve feilen er unntatt.", "2.3", 1, undefined, true],
  ["handverker.folgeskade", "Andre håndverker- og entreprenørfeil", "Bygningsskade etter fundamenterings-, setnings-, material-, konstruksjons- eller montasjefeil utført av godkjent/autorisert håndverker/entreprenør, konstatert innen ti år. Reklamasjon kreves i tide; innen reklamasjonstiden dekkes når håndverker er konkurs. Selve feilen er unntatt.", "2.4", 2, undefined, true],
  ["gjenoppforing.totalskade", "Totalskadeterskel", "Skade over 75 % av gjenoppføringsprisen kan kreves oppgjort som totalskade når gjenverdiene rives og fjernes innen to år.", "3.1", 2],
]);

const rot = facts("fremtindHusRot", [
  ["rate.dekning", "Sopp og råte", "På fullverdiforsikret bolig: råte, ekte hussopp og andre sopper som ødelegger tre. Mugg, blåved, svertesopp, utvendig treverk og før-/etterperiodisk utvikling er unntatt.", "1.1", 1, undefined, true],
  ["skadedyr.bygningsskade", "Bygningsskade fra insekter", "Fysisk skade, svekket isolasjonsevne og lukt fra insekter på fullverdiforsikret bolig.", "1.2", 1, undefined, true],
  ["skadedyr.bekjempelse", "Bekjempelse av skadeinsekter", "Bekjempelse av insekter som gjør skade på bygningen; Fremtind velger metode og leverandør. Rent skjemmende insekter er unntatt.", "1.2", 1, undefined, true],
  ["rate.egenandel", "Råte – ekstra egenandel", "Avtalt egenandel økes med 15 000 kroner ved skade på etasjeskiller mot krypkjeller eller jordgulv.", "2", 1, "override"],
  ["skadedyr.egenandel", "Insektbekjempelse – egenandel", "2 000 kroner.", "2", 1, "override"],
]);

const rental = facts("fremtindHusRental", [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Valgfritt tillegg ved lovlig utleie. Utleien må varsles og fremgå av forsikringsbeviset; leieavtalen styrer husleie og sikkerhet.", "1", 1],
  ["utleie.mislighold", "Utleie – ubetalt husleie", "Inntil seks måneders husleie, én gang per leietaker. Rettslig inkasso omfattes når det er nødvendig.", "1.1 / 2.1", 1],
  ["utleie.utkastelse", "Utleie – utkastelse", "Nødvendige juridiske utgifter inntil 20 000 kroner.", "1.2 / 2.2", 1],
  ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk fra leietaker eller gjester på utleid bolig, tilhørende innbo og utearealer, inntil 500 000 kroner per skade.", "1.3", 1],
  ["utleie.egenandel", "Utleie – egenandel", "Tre måneders husleie, minimum depositum/bankgaranti. Ved korttidsutleie under én måned er egenandelen 30 000 kroner.", "3", 1, "override"],
]);

export const fremtindHusFacts: Record<string, CatalogFact[]> = {
  fremtindHusStandard: standard,
  fremtindHusTopp: topp,
  fremtindHusRot: rot,
  fremtindHusRental: rental,
  fremtindHusIpid: facts("fremtindHusIpid", [["avtale.ipid", "IPID – produktoversikt", "V.103 dokumenterer Standard, Topp og valgfrie tillegg; forsikringsbevis og fullvilkår avgjør.", "Produktoversikt", 1]]),
};

const version = "PBK-200.100-015+PBK-200.200-010";
export const fremtindHusProducts: CatalogProduct[] = [
  { company: "Fremtind", insuranceType: "Hus", name: "Standard", providerId: "fremtind",
    productId: "fremtind-hus-standard", version, sourceId: "fremtindHusStandard",
    componentIds: ["fremtindHusIpid", "fremtindHusStandard"] },
  { company: "Fremtind", insuranceType: "Hus", name: "Topp", providerId: "fremtind",
    productId: "fremtind-hus-topp", version, sourceId: "fremtindHusTopp",
    componentIds: ["fremtindHusTopp"], inheritsProductId: "fremtind-hus-standard" },
];
export const fremtindHusAddOns: CatalogAddOn[] = [
  { id: "fremtind-hus-rate-insekter", name: "Sopp, råte og insekter", componentId: "fremtindHusRot",
    providerId: "fremtind", requiresLevel: ["fremtind-hus-standard", "fremtind-hus-topp"], insuranceTypes: ["Hus"] },
  { id: "fremtind-hus-utleie", name: "Utleieforsikring", componentId: "fremtindHusRental",
    providerId: "fremtind", requiresLevel: ["fremtind-hus-standard", "fremtind-hus-topp"], insuranceTypes: ["Hus"] },
];
