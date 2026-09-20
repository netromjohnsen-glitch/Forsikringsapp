import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { frendeHusSources } from "./frende-hus-sources.ts";
export { frendeHusSources } from "./frende-hus-sources.ts";

type Row = [key: string, label: string, value: string, section: string, page: number,
  deductibleClassification?: CatalogFact["deductibleClassification"], replacesBase?: boolean];

function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = frendeHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `hus.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: {
      documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, section, page,
      productCode: source.productCode, version: source.version,
      note: "Forsikringsbeviset avgjør forsikret bygning og sted, forsikringsform, valgte dekninger, forsikringssum, generell egenandel og særvilkår.",
    },
  }));
}

function age(component: string, label: string, freeYears: number, annualPercent: number,
  maximumPercent = 100): CatalogFact {
  const entry = facts("frendeHusStandard", [[`aldersfradrag.${component}`, `Aldersfradrag – ${label}`,
    `${annualPercent} % per år etter ${freeYears} år${maximumPercent < 100 ? `, maksimalt ${maximumPercent} %` : ""}. Beregnes av nødvendig reparasjon eller gjenanskaffelse; eldste skadde del styrer når delene har ulik alder.`,
    "6.12 Aldersfradrag", 8]])[0];
  entry.structuredValue = {
    kind: "age_deduction", component, scope: "building", freeYears, annualPercent,
    maximumPercent, minimumCompensationPercent: Math.max(0, 100 - maximumPercent), yearBasis: "year",
    exceptions: ["Bare når skaden skyldes lynnedslag, kortslutning, elektrisk fenomen eller brudd på ledning/utstyr"],
    calculationBasis: "Nødvendige utgifter til reparasjon eller gjenanskaffelse; alder på eldste skadde del",
  };
  return entry;
}

const standard = facts("frendeHusStandard", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset angir bygning, forsikringssted, hoved- og tilleggsdekninger, fullverdi/førsterisiko, eventuell sum og egenandel. Katalogen erstatter ikke kundens avtale.", "Innledning, 2–3 og 6.14", 1],
  ["forsikringsform", "Forsikringsform", "Fullverdi er et reparasjons-/gjenoppføringsprinsipp uten fast forsikringssum. Førsterisiko er begrenset til avtalt sum i forsikringsbeviset.", "6.4–6.5 og 6.14", 6],
  ["bygninger.dekning", "Forsikrede bygninger", "Bygninger i forsikringsbeviset med vanlig fastmontert utstyr og midlertidig nedmonterte eller kommende bygningsdeler. Frittliggende bygg inntil 10 m² uten egen forsikring omfattes bare av hendelsene i Standard punkt 5.1 nr. 1–10.", "3.1", 2],
  ["bygninger.tilbehor", "Fast inventar og installasjoner", "Fastmontert utstyr som er vanlig for bygningens formål er inkludert. Vilkåret navngir ikke ladeboks, ventilasjon eller integrerte hvitevarer særskilt.", "3.1", 2],
  ["andrebygninger.endring", "Tilbygg og verdiøkende endringer", "Tilbygg og andre verdiøkende endringer må meldes senest ved hovedforfall; ellers erstattes bare andelen som tilsvarer verdien før endringen.", "6.9 og 12", 7],
  ["ror.utvendig", "Utvendige ledninger", "Ledninger og utstyr koblet til bygningen for strøm, signaler, gass eller væske frem til offentlig tilknytning eller spredeledning. Brønn, borehull, drens-/infiltrasjons-/spredeledning og spredegrøft er unntatt, men drensledning har brann/naturskade.", "3.2 og 3.4", 2],
  ["solceller.dekning", "Solcelleanlegg", "Solcelleanlegg koblet til bygningen for produksjon til privat forbruk.", "3.2", 2],
  ["hage.objekter", "Hage og uteområde", "Hage inntil fem dekar rundt boligen; drivhus regnes ikke som hage.", "3.3", 2],
  ["hage.basseng", "Basseng, boblebad og badestamp", "Utvendig basseng, boblebad og badestamp med tilknyttede ledninger omfattes. Produkttekstens omtale som hageanlegg endrer ikke vilkårets egne objektgrenser.", "3.3", 2],
  ["hage.brygge", "Brygge og kai", "Fast trebrygge som tilhører boligen/hytta omfattes bare ved brann eller naturskade, inntil 100 000 kr inkludert riving/rydding. Stein-/betongkai, molo, flytebrygge og landgang er unntatt.", "3.3–3.4", 2],
  ["brann.dekning", "Brann", "Brann og nedsoting omfattes. Svimerker og gnistskader uten brann er unntatt.", "5.1 og 5.6", 4],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag og elektrisk fenomen omfattes; særskilte høyspennings-/transformatorunntak følger av brannbestemmelsene.", "4.1–4.2 og 5.1", 3],
  ["eksplosjon.dekning", "Eksplosjon og sprengning", "Eksplosjon og sprengning omfattes, med unntak blant annet for sprengningsarbeid på forsikringsstedet i brann-/naturskadedekningen og eksplosjon i selve maskinen/beholderen.", "4.1–4.2 og 5.1", 3],
  ["vann.utstromming", "Vann og annen væske", "Brudd på rør/ledning og tilknyttet utstyr samt lekkasje fra innvendig ledning eller tilknyttet utstyr omfattes.", "5.1 nr. 3 og 5", 4],
  ["vann.terreng", "Terreng-, grunn- og overvann", "Vann direkte fra terreng eller grunn ved nedbør, snøsmelting eller kjøving når vann flyter over gulvoverflaten, samt vann fra utvendig rørledning og vanninntrengning etter en dekket bygningsskade.", "5.1 nr. 4", 4],
  ["ror.brudd", "Rør- og ledningsbrudd", "Brudd på vann-, væske- og elektriske ledninger og angitt utstyr som pumpe, drenskum, septik-/oljetank og rensetank.", "5.1 nr. 3", 4],
  ["ror.tining", "Tining av utvendig ledning", "Rimelige og nødvendige utgifter til tining av frosset utvendig vann- eller avløpsrør tilknyttet bygningen, inntil 50 000 kr. Gjeldende fullvilkår plasserer dekningen i Standard.", "5.3", 4],
  ["snovejr.dekning", "Snø og vind svakere enn storm", "Plutselig og uforutsett skade ved snøtyngde, snøpress eller vind svakere enn storm.", "5.1 nr. 7", 4],
  ["tyveri.dekning", "Tyveri og hærverk", "Tyveri og hærverk etter straffeloven omfattes, med særskilt begrensning for leietaker.", "5.1 nr. 8 og 5.6 nr. 12", 4],
  ["plutselig.dekning", "Annen plutselig skade", "Annen plutselig og uforutsett skade på forsikrede objekter, underlagt punkt 5.6 om blant annet våtrom, takrenne, drenering, sopp/råte, setning, feil, slitasje og kosmetikk.", "5.1 nr. 10 og 5.6", 4],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Standard unntar både skaden fordi gulv/vegg i våtrom ikke er tett og følgeskadene av utettheten.", "5.6 nr. 3", 5],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Standard unntar skade fra utett våtrom og material-, konstruksjons- og montasjefeil.", "5.6 nr. 3 og 9", 5],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Standard unntar blant annet vann fra takrenne, utvendig nedløp og lekkasje mellom tak og taksluk; øvrige utettheter må oppfylle en annen dekningshendelse.", "5.6 nr. 2–5", 5],
  ["handverker.folgeskade", "Håndverker- og konstruksjonsfeil", "Materialfeil, konstruksjonsfeil, svak konstruksjon, uriktig montasje, setning og sviktende fundamentering er unntatt på Standard med mindre punkt 5.1 nr. 1–9 dekker skaden.", "5.6 nr. 8–9", 5],
  ["rate.dekning", "Sopp og råte", "Sopp, råte, heksesot og bakterier er unntatt uten valgt råte- og skadedyrsforsikring.", "5.6 nr. 7", 5],
  ["skadedyr.bygningsskade", "Bygningsskade fra dyr", "Plutselig og uforutsett skade fra dyr på bygning med boenhet og frittstående garasje i forsikringsbeviset. Insekter, kjæledyr, husdyr og virvelløse dyr er unntatt.", "5.2 og 5.6 nr. 7", 4],
  ["skadedyr.bekjempelse", "Bekjempelse av mus og rotter", "Bekjempelse av mus og rotter etter påvist aktivitet i bygning med boenhet og frittstående garasje; Vis Forsikring velger metode og nødvendig tilkomst. Aktiviteten må ha oppstått etter kjøpet, og tiltak utføres bare mens forsikringen løper.", "5.2", 4],
  ["skadedyr.egenandel", "Skadedyr – egenandel", "6 000 kr ved bygningsskade og 2 000 kr ved bekjempelse.", "6.14", 8, "override"],
  ["utleie.skadeverk", "Utleie – skadeverk", "Ikke aktiv uten at boligen er registrert helt eller delvis utleid i forsikringsbeviset. Ordinær Standard unntar leietakers tyveri, hærverk og slitasje.", "5.4 og 5.6 nr. 12", 4],
  ["leietap.skade", "Tapt leieinntekt etter bygningsskade", "Avtalt leie i normal reparasjons-/gjenoppføringstid når utleie står i forsikringsbeviset; leiekontrakten må dokumentere partene, pris, varighet, depositum/garanti og opphør.", "5.8 nr. 4 og 6.10", 5],
  ["tilpasning.grense", "Ombygging for livsvarig rullestolbruker", "Inntil 250 000 kr i nødvendige bygningsutgifter innen fem år når en forsikret blir livsvarig rullestolbruker etter ulykkesskade i forsikringstiden, eller et barn fødes med medfødt fysisk funksjonsnedsettelse. Frende dekker bare utgifter over støtte fra NAV eller ansvarlig skadevolder.", "5.5", 5],
  ["naturskade.dekning", "Naturskade", "Direkte skade ved skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv eller vulkanutbrudd etter naturskadeforsikringsloven.", "5.1 nr. 9 og 5.7", 4],
  ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr etter vilkåret.", "6.14", 9, "override"],
  ["gjenoppforing.hovedregel", "Fullverdigaranti og gjenoppføring", "Reparasjon/gjenoppføring til samme formål på samme gnr./bnr. innen fem år uten fradrag for verdiøkning når gammelt erstattes med nytt. Dette er ikke en ubegrenset kontantsum.", "6.3–6.4", 6],
  ["gjenoppforing.annetsted", "Annet sted eller formål", "Ved annet sted og samme formål trekkes markedsverdiøkning over 40 %; myndighetsnektelse gir unntak ved gjenoppføring i samme kommune. Ved annet formål trekkes hele økningen.", "6.4", 6],
  ["gjenoppforing.ingen", "Manglende gjenoppføring", "Hvis reparasjon/gjenoppføring ikke er avsluttet innen fem år, begrenses oppgjøret til reduksjonen i markedsverdi. Fristen kan forlenges ved offentlige inngrep.", "6.7", 7],
  ["pabud.dekning", "Offentlige påbud", "Nødvendige merkostnader etter dekningsmessig skade. Fullverdi dekker alle slike utgifter, fredet bygg inntil 1 000 000 kr; førsterisiko inntil 25 % av summen og maksimalt 250 000 kr. Skadeuavhengige påbud og opprettholdelse av areal er unntatt.", "5.8 nr. 5 og 6.6", 5],
  ["rydding.dekning", "Riving og rydding", "Riving, rydding og deponering av verdiløse rester etter dekningsmessig Standardskade.", "5.8 nr. 1", 5],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen står i forsikringsbeviset og kan ikke utledes som én generell katalogsum.", "6.14", 8, "reference"],
  ["glass.egenandel", "Glassrute – egenandel", "6 000 kr.", "6.14", 8, "override"],
  ["vann.egenandel", "Gjentatt skade", "Egenandelen økes med 20 000 kr ved ny skade av samme type innen 24 måneder for vannskade av samme årsak, avløpstilbakeslag, mus/rotter eller rørbrudd.", "6.14", 9, "override"],
  ["vannoverflate.egenandel", "Terrengvann og vind – egenandel", "8 000 kr ved vind svakere enn storm, overflatevann og vanninntrengning fra terreng/grunn, med mindre høyere avtalt egenandel står i forsikringsbeviset.", "6.14", 9, "override"],
  ["egenandel.fritak", "Egenandelsfritak", "Ingen egenandel ved aktiv varslet innbruddsalarm eller skade som bare rammer overspenningsvern/brann-/innbruddsalarm. Når aldersfradrag minst tilsvarer avtalt egenandel trekkes ikke egenandel.", "6.14", 9, "coverage"],
  ["ansvar.dekning", "Ansvar som eier", "Rettslig erstatningsansvar som eier av forsikret bygning for person- og tingskade; gjelder i Norden.", "2 og 7.1", 2],
  ["ansvar.grense", "Ansvar – forsikringssum", "5 000 000 kr per skadetilfelle og samlet per år.", "7.4", 10],
  ["ansvar.egenandel", "Ansvar – egenandel", "6 000 kr per skadetilfelle.", "7.4", 10, "override"],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige juridiske utgifter ved tvist som eier av forsikret bygning; gjelder i Norden. Mekle kan brukes kostnadsfritt uten egenandel før andre rettshjelpskostnader har påløpt.", "2 og 8.1–8.2", 2],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist, 250 000 kr ved minst tre parter og 1 000 000 kr ved minst 20 parter på samme side.", "8.4", 12],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "6 000 kr pluss 20 % av øvrige kostnader; Mekle-tilbudet er uten egenandel.", "8.2 og 8.4", 11, "override"],
]);

const form = standard.find((entry) => entry.key === "hus.forsikringsform")!;
form.structuredValue = { kind: "insurance_form", forms: ["full_value", "first_loss"], defaultForm: "full_value", authority: "policy" };
standard.push(
  age("utvendige_ledninger_tanker", "utvendige ledninger og tanker (ikke plast/glassfiber), inkludert bunnledning", 20, 5, 80),
  age("varmtvannsbereder_pumper", "varmtvannsberedere og inn-/utvendige pumper", 5, 10),
  age("basseng_boblebad", "utvendig basseng, boblebad og badestamp", 5, 10),
  age("oppvarming_kjoling", "annen innretning for oppvarming eller kjøling", 10, 5),
);

const extended = facts("frendeHusExtended", [
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Innvendig følgeskade innenfor konstruksjonens tettesjikt ved vann gjennom tak, vegg over bakken eller gulv/vegg på eller under bakken når vann flyter over gulvet. Selve taket/veggen og utettheten repareres ikke.", "9.1 og 9.5", 13, undefined, true],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Følgeskade på andre rom ved lekkasje fra utett våtrom.", "9.2", 13, undefined, true],
  ["vatrom.selverommet", "Våtrom – håndverkerfeil", "Følgeskade på våtrom etter material-, konstruksjons- eller montasjefeil utført av autorisert håndverker med ansvarsrett, når skaden skjer innen ti år. Når følgeskaden dekkes, dekkes også retting av selve håndverkerfeilen på våtrommet.", "9.2–9.3", 13, undefined, true],
  ["handverker.folgeskade", "Håndverker- og konstruksjonsfeil", "Følgeskade på bygningen ved material-/konstruksjonsfeil, uriktig montering eller utilstrekkelig/sviktende fundamentering utført av autorisert håndverker med ansvarsrett, innen ti år, samlet sum 10 000 000 kr. Selve feilen dekkes bare på våtrom; rettidig reklamasjon kreves.", "9.3 og 9.5", 13, undefined, true],
  ["glass.punktering", "Punktering av isolerglass", "Punktering omfattes. Det trekkes 10 % per år etter 10 år.", "9.4", 13],
]);
const glassAge = extended.find((entry) => entry.key === "hus.glass.punktering")!;
glassAge.structuredValue = { kind: "age_deduction", component: "isolerglass", scope: "building", freeYears: 10,
  annualPercent: 10, maximumPercent: 100, minimumCompensationPercent: 0, yearBasis: "year", exceptions: [],
  calculationBasis: "Erstatning for punktert isolerglass" };

const rot = facts("frendeHusRot", [
  ["rate.dekning", "Råte og langvarig vannskade", "Nedbryting av bygningsmaterialer fra råtesopper eller aktiv vannskade som har vart mer enn ett år. Varig innredning/fast utstyr, dører, vinduer, lekter, tak, laft og annet utvendig treverk er unntatt; mugg, blåved og rent kosmetiske forhold dekkes ikke.", "10.1–10.2", 13, undefined, true],
  ["skadedyr.bekjempelse", "Bekjempelse av skadeinsekter", "Bekjempelse av skadeinsekter ved aktivitet som oppsto etter kjøpet; Vis Forsikring velger metode og tilkomst, og tiltak utføres bare mens forsikringen løper. Grunnproduktets mus-/rottebekjempelse består også.", "5.2 og 10.1", 4, undefined, true],
  ["skadedyr.bygningsskade", "Bygningsskade og skadedyr", "Tillegget utvider grunnproduktets dyreskade med dokumentert råte/langvarig vannskade og bekjempelse av skadeinsekter; fullvilkåret dokumenterer ikke fysisk insektsskade, lukt eller svekket isolasjon som en egen ytelse.", "5.2 og 10.1", 4, undefined, true],
  ["rate.egenandel", "Råte-/skadedyrskade – egenandel", "6 000 kr ved bygningsskade; 2 000 kr ved bekjempelse av skadedyr og insekter.", "6.14", 8, "override"],
]);
const pestScope = rot.find((entry) => entry.key === "hus.skadedyr.bekjempelse")!;
pestScope.value += " Den offisielle produktsiden nevner stokkmaur, husbukk, stripet borebille, kakerlakk og veggedyr; fullvilkåret bruker det bredere uttrykket skadeinsekter.";
pestScope.qualificationSource = facts("frendeHusPestPage", [["skadedyr.kvalifikasjon",
  "Råte-/skadedyrstillegg – offentlig produktomtale",
  "Kan kjøpes til Standard og Utvidet; produktsiden eksemplifiserer hvilke skadeinsekter som bekjempes.",
  "Dette dekker råte- og skadedyrforsikringen", 1]])[0].source;

const rental = facts("frendeHusRental", [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Boligen må stå som helt eller delvis utleid i forsikringsbeviset. Skriftlig husleieavtale kreves. Produktsiden sier at utleie over én måned per år skal meldes; fullvilkåret styrer selve dekningen.", "5.4, 6.10 og 14 nr. 5", 4],
  ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk etter straffeloven § 351 fra leietaker, inntil 500 000 kr samlet per 12 måneder. Hakk, riper, avskallinger og annen slitasje er unntatt; dekningen gjelder ikke hytte.", "5.4", 4, undefined, true],
  ["utleie.egenandel", "Utleie – egenandel", "Ingen egen særandel er oppgitt i fullvilkåret; avtalt egenandel i forsikringsbeviset gjelder.", "5.4 og 6.14", 4, "reference"],
]);

const construction = facts("frendeHusConstruction", [
  ["byggunderoppforing.vilkar", "Bygg under oppføring", "Særskilt avtalt risikosituasjon i byggetiden for bygget/materialer, egne brakker/skur/containere, lånte/leide slike inntil 50 000 kr og eget verktøy inntil 50 000 kr. Ikke eksponert som ordinært katalogtillegg i UI.", "11–11.2", 14],
  ["byggunderoppforing.tyveri", "Bygg under oppføring – tyveri og glass", "Tyveri fra låste stålcontainere/faste brakker og fra lukket bygg etter montering/avstenging av åpninger; glass i ramme omfattes ved transport, lagring, montering og hærverk.", "11.3", 14],
  ["byggunderoppforing.merutgift", "Bygg under oppføring – merutgifter", "Tapt husleie/bruk ved forlenget byggetid og avtalte nødvendige merutgifter til opphold inntil 100 000 kr.", "11.4", 14],
  ["byggherre.ansvar", "Privat byggherreansvar", "Utvider eieransvaret til byggearbeid, graving, sprengning, spunting, riving og ras/jordforskyvning i det forsikrede byggearbeidet.", "11.6", 14],
  ["byggherre.rettshjelp", "Byggherre – rettshjelp", "Utvider rettshjelpen til tvist som privat byggherre for det forsikrede bygget.", "11.7", 14],
]);

export const frendeHusFacts: Record<string, CatalogFact[]> = {
  frendeHusStandard: standard,
  frendeHusExtended: extended,
  frendeHusRot: rot,
  frendeHusRental: rental,
  frendeHusConstruction: construction,
  frendeHusIpid: facts("frendeHusIpid", [["avtale.ipid", "IPID – produktoversikt",
    "Produktarket dokumenterer Standard, Utvidet og råte-/skadedyrstillegg, men forsikringsbevis og gjeldende fullvilkår styrer.", "Produktoversikt", 1]]),
  frendeHusGeneral: facts("frendeHusGeneral", [["avtale.generellevilkar", "Generelle vilkår",
    "Generelle regler om blant annet oppsigelse, skadeoppgjør, krig/terror og datakriminalitet gjelder sammen med produktvilkåret.", "Generelle vilkår", 1]]),
};

export const frendeHusProducts: CatalogProduct[] = [
  { company: "Frende", insuranceType: "Hus", name: "Standard", providerId: "frende",
    productId: "frende-hus-standard", version: "2026-09-01", sourceId: "frendeHusStandard",
    componentIds: ["frendeHusIpid", "frendeHusGeneral", "frendeHusStandard"] },
  { company: "Frende", insuranceType: "Hus", name: "Utvidet", providerId: "frende",
    productId: "frende-hus-utvidet", version: "2026-09-01", sourceId: "frendeHusExtended",
    componentIds: ["frendeHusExtended"], inheritsProductId: "frende-hus-standard" },
];

export const frendeHusAddOns: CatalogAddOn[] = [
  { id: "frende-hus-rate-skadedyr", name: "Råte- og skadedyrsforsikring", componentId: "frendeHusRot",
    providerId: "frende", requiresLevel: ["frende-hus-standard", "frende-hus-utvidet"], insuranceTypes: ["Hus"] },
  { id: "frende-hus-utleie", name: "Utleie", componentId: "frendeHusRental",
    providerId: "frende", requiresLevel: ["frende-hus-standard", "frende-hus-utvidet"], insuranceTypes: ["Hus"] },
];
