import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import type { BuildingFactData } from "./building-facts.ts";
import { trygHusSources } from "./tryg-hus-sources.ts";
export { trygHusSources } from "./tryg-hus-sources.ts";

// PPK11501 og PPK11502 er selvstendige fullvilkår. Ingen juridisk arv
// er dokumentert. Felles formuleringer nedenfor er kontrollert i begge PDF-er;
// hvert produkt får alltid sin egen kilde og sine egne sidetall.
type Row = [key: string, label: string, value: string, section: string, page: number,
  classification?: CatalogFact["deductibleClassification"]];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const s = trygHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification]) => ({
    key: `hus.${key}`, label, value, ...(deductibleClassification ? { deductibleClassification } : {}),
    source: { documentId: s.id, filename: s.filename, termsNumber: s.termsNumber,
      effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, section, page },
  }));
}

const ageRows: [string, string, number, number, number][] = [
  ["utvendige_ror", "Utvendige ledninger og bunnledninger av annet materiale enn plast", 20, 5, 80],
  ["tanker", "Tanker og kummer uansett materiale", 20, 5, 100],
  ["varmepumpe", "Varmepumper luft-luft/luft-vann", 5, 10, 100],
  ["oppvarming", "Annen innretning for oppvarming eller kjøling", 10, 10, 100],
  ["bereder_pumpe", "Varmtvannsbeholdere og vann/kloakkpumper", 5, 10, 100],
  ["elektronikk", "Elektriske/elektroniske enheter, maskiner og apparater, inklusive smarthusløsninger", 5, 10, 100],
  ["hvitevarer", "Integrerte hvitevarer, kjøle- og fryserom", 5, 10, 80],
  ["badeinnretning", "Mindre badeinnretning som boblebad, badestamp o.l.", 5, 10, 80],
  ["solceller", "Solcelleanlegg", 20, 10, 80],
];
function ageFacts(sourceId: string, rows: typeof ageRows, section: string, page: number, rot = false): CatalogFact[] {
  return rows.map(([component, label, freeYears, annualPercent, maximumPercent]) => {
    const entry = facts(sourceId, [[`aldersfradrag.${rot ? "rate_skadedyr." : ""}${component}`,
      `${rot ? "Råte/skadedyr – " : ""}Aldersfradrag – ${label}`,
      `${freeYears} år uten fradrag; deretter ${annualPercent} % per ${rot ? "påbegynt " : ""}år, maksimalt ${maximumPercent} %. ${rot ? "Gjelder skader under råte- og skadedyrvilkåret." : "Ikke ved brann, naturskade eller totalskade på fullverdiforsikret bygning; fradrag før egenandel."}`,
      section, page]])[0];
    entry.structuredValue = { kind: "age_deduction", component, scope: rot ? "rot_pest" : "building",
      freeYears, annualPercent, maximumPercent, minimumCompensationPercent: 100 - maximumPercent,
      yearBasis: rot ? "started_year" : "year",
      exceptions: rot ? [] : ["fire", "natural_damage", "total_loss_full_value"],
      calculationBasis: rot ? "Eldste skadde del; totale reparasjonskostnader for elektrisk utstyr/installasjoner" : "Hele reparasjonskostnaden; eldste skadde del; isolerglass bare ved punktering" };
    return entry;
  });
}

function buildingFacts(extra: boolean): CatalogFact[] {
  const id = extra ? "trygHusExtra" : "trygHus";
  const items = facts(id, [
    ["forsikringsform", "Forsikringsform", extra
      ? "Fullverdi: gjenoppføring til samme eller vesentlig samme stand før skaden, med vilkårets begrensninger. Forsikringsbeviset har forrang."
      : "Fullverdi hvis ikke førsterisiko er angitt i forsikringsbeviset. Førsterisiko begrenser erstatningen til avtalt sum. Fullverdi tar utgangspunkt i gjenoppføring til samme stand, med vilkårets begrensninger.", "Innledning", 1],
    ["forsikringssum", "Forsikringssum og indeks", "Fullverdisummen brukes til prisberegning, ikke som ubetinget erstatningstak. Sum reguleres årlig etter SSBs prisindeks for nye eneboliger. Vilkårets særgrenser gjelder foran summen i beviset.", "Innledning", 1],
    ["bygninger.dekning", "Forsikrede bygninger", "Bygningene som er nevnt i forsikringsbeviset. Eksisterende garasje, uthus og andre bygninger antas ikke automatisk medforsikret.", "1.1", 1],
    ["bygninger.utsmykning", "Kunstnerisk utsmykning", extra ? "Omfattet" : "Ikke omfattet", "1.1", 1],
    ["andrebygninger.endring", "Nye bygninger og tilbygg i forsikringsåret", "Garasje, naust, uthus, tilbygg og påbygg under oppføring eller oppført på forsikringsstedet etter siste fornyelse omfattes til neste fornyelse. Meld endring snarest og senest ved fornyelsen.", "1.4", extra ? 1 : 2],
    ["ror.utvendig", "Utvendige rør og ledninger", "Med tilknyttet utstyr. Brønn, borehull, drens-/infiltrasjons-/spredeledning og spredegrøft er unntatt; drensledning omfattes likevel ved brann og naturskade. Utvendig basseng behandles som hageanlegg.", "1.2", 1],
    ["hage.grense", "Hageanlegg – grense", extra ? "Ingen særskilt beløpsgrense oppgitt i punkt 1.3; skadevilkår og naturskadens arealgrense gjelder." : "500 000 kr samlet; beløpsgrensen gjelder ikke brann og naturskade på hageanlegg til bolighus og våningshus.", "1.3", 1],
    ["hage.objekter", "Hageanlegg – objekter", "Utvendig vannbasseng fast tilkoblet bygningens ledningsanlegg regnes som hageanlegg. Brygger og kaier regnes ikke som hageanlegg.", "1.3", 1],
    ["hage.brygge", "Brygge – brann og naturskade", "Flytebrygge og trebrygge: samlet 100 000 kr, bare ved brann og naturskade; høyere sum må stå i forsikringsbeviset.", "1.3", 1],
    ["hage.oppgjor", "Hageanlegg – erstatning", "Tilbakeføring til samme eller vesentlig samme stand; planter erstattes som vanlig handelsvare fra gartneri (ung vekst).", "3.5", 7],
    ["rydding.dekning", "Riving, rydding og bortkjøring", extra ? "Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum." : "Merutgifter til riving, rydding, bortkjøring og deponering av verdiløse rester ved erstatningsmessig bygningsskade, i tillegg til avtalt sum. Førsterisiko: inntil 20 % av forsikringssummen.", "1.5", extra ? 1 : 2],
    ["pabud.grense", "Offentlige påbud – grense", extra ? "Ingen generell beløpsgrense oppgitt; fredede bygninger inntil 1 000 000 kr." : "Inntil 2 000 000 kr per skade; førsterisiko inntil 20 % av forsikringssummen, maksimalt 2 000 000 kr.", "1.5", 2],
    ["pabud.vilkar", "Offentlige påbud – vilkår", "Krever erstatningsmessig skade. Ved reparasjon bare merkostnader knyttet til skadde deler. Grunnundersøkelse/fundamentering kan omfattes, ikke utgraving av kjeller. Påbud som kunne vært gitt uten skaden er unntatt. Dokumenterte kostnader og ferdigstillelse innen 5 år.", "1.5, 3.6", 7],
    ["brukstap.dekning", "Ubeboelig bolig etter skade", "Normal reparasjons-/gjenoppføringstid, basert på markedsleie for umøblerte rom; fradrag for innsparte utgifter og renter. Ved kjøp av annen bolig senest til overtakelse.", "1.5, 3.7", extra ? 8 : 7],
    ["leietap.skade", "Tapt husleie etter bygningsskade", "Normal reparasjons-/gjenoppføringstid og årlig markedsleie; korttidsutleie er unntatt. Fradrag for innsparte utgifter og renter. Dette gjelder erstatningsmessig skade, ikke leietakers betalingsmislighold.", "3.8", 8],
    ["gjenoppforing.prisstigning", "Prisstigning etter skade", "Normal reparasjons-/gjenoppføringstid, beregnet etter SSBs byggekostnadsindeks; fradrag for innsparte utgifter og renter.", "1.5, 3.9", 8],
    ["gjenoppforing.klimatiltak", "Klimatiltak ved gjenoppføring", `${extra ? "50 000" : "25 000"} kr ved gjenoppføring av fullverdiforsikret bolighus; skade over 75 % av gjenoppføringspris. Tiltak utover lovkrav avtales på forhånd, utgifter må påløpe og dokumenteres.`, "1.6, 3.10", 8],
    ["brann.dekning", "Brann", "Plutselig og uforutsett skade ved ild som er kommet løs. Svi-/gnistskade uten brann og kosmetiske skader er unntatt.", "2.1", 3],
    ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Plutselig og uforutsett skade ved lynnedslag, kortslutning, elektrisk fenomen eller tilsvarende skade.", "2.2", 3],
    ["vann.utstromming", "Vann – utstrømming", "Plutselig og uforutsett utstrømming ved brudd, lekkasje eller oversvømmelse fra væskeførende bygningsrør og tilknyttet utstyr, slokkeapparat eller akvarium. Følgeskade og reparasjon av røret er separate dekninger.", "2.3", 3],
    ["vann.terreng", "Vann fra terreng og grunn", "Plutselig og uforutsett inntrengning ved nedbør, snøsmelting eller kjøving som gir frittstående vann over laveste gulv; også inntrengning fra utvendige rør.", "2.3", 3],
    ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", extra ? "Plutselig og uforutsett vanninntrengning over bakkeplan omfattes. Inntrengning gjennom tak/takgjennomføring eldre enn 50 år er unntatt." : "Inntrengning gjennom åpning eller utetthet dekkes når den skyldes annen dekningsmessig skade. Vann fra tak, takrenne og utvendig nedløp er ellers unntatt.", "2.3", 3],
    ["takvegg.skadearsak", "Utett tak/vegg – selve konstruksjonen", extra ? "Selve taket/veggen (alle sjikt inntil takstol/sperre eller bærende konstruksjon), manglende vedlikehold og utbedring av konstruksjons-/material-/monteringsfeil er unntatt ved inntrengning gjennom utett bygning." : "Ingen egen dekning for utbedring av utetthet dokumentert. Svak konstruksjon, materialfeil og feilmontering er unntatt.", "2.3, 2.6", extra ? 3 : 4],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", extra ? "Vann fra utett våtrom på tilstøtende og underliggende rom omfattes." : "Skade ved vann fra utett våtrom, inkludert sluk og oppforinger, er unntatt.", "2.3", 3],
    ["vatrom.selverommet", "Våtrom – selve rommet og feilen", extra ? "Vannskade på våtrom direkte som følge av svak konstruksjon, materialfeil eller feilmontering omfattes når godkjent/autorisert personell utførte arbeidet. Skaden må oppstå i forsikringstiden og konstateres innen 10 år etter arbeidet. Feil uten konstatert følgeskade på våtrommet er ikke skade. Eget/ufaglært arbeid, kosmetiske skader, sopp og råte er unntatt." : "Skade på våtrom fordi rommet er utett er unntatt; våtrom omfatter komponentene innenfor bjelkelag og stenderverk.", "2.3", 3],
    ["ror.brudd", "Rør og utstyr – brudd", "Brudd på innvendige rør og tilknyttet utstyr; utvendige væskerør, drenskum, septik-/olje-/rensetank, vann-/kloakkpumpe og elektrisk ledning.", "2.4", 4],
    ["ror.frost", "Utvendige rør – frost og tining", extra ? "PPK11502 punkt 2.4 har ikke Standard-vilkårets unntak for frysing uten fysisk brudd. IPID nevner tining; egen beløpsgrense/metode er ikke dokumentert i fullvilkåret." : "Utgifter/tap ved frysing av utvendige rør er unntatt med mindre røret har fysisk brudd. Takrenne og utvendig nedløp er unntatt.", "2.4", 4],
    ["tyveri.dekning", "Tyveri og skadeverk på bygning", "Tyveri og skadeverk på forsikringsstedet. Skadeverk på utleide rom utført av beboer/bruker og kosmetiske skader er unntatt.", "2.5", 4],
    ["plutselig.dekning", "Annen plutselig og uforutsett bygningsskade", extra ? "Andre plutselige og uforutsette skader enn brann, elektrisk, vann, rørbrudd og tyveri. Følgeskade av håndverkerfeil kan omfattes når fagfolk utførte arbeidet og skaden oppdages innen 10 år; selve feilen og unødvendig tilkomst utbedres ikke." : "Andre plutselige og uforutsette skader enn brann, elektrisk, vann, rørbrudd og tyveri. Unntak blant annet sviktende fundamentering, setninger, jordtrykk, frost/tele og konstruksjons-, material- og monteringsfeil.", "2.6", 4],
    ["plutselig.unntak", "Bygningsskade – slitasje og vedlikehold", "Slitasje, tæring, forbruk, alder, ødeleggelse av tingen selv og kosmetiske skader er unntatt. Naturulykke og skadetyper i 2.1–2.5 behandles uttømmende i sine respektive dekninger.", "2.6", 4],
    ["rate.dekning", "Råte og sopp – bygningsskade", "Sopp og råte er unntatt i ordinær bygningsdekning. Separat råte- og skadedyrdekning må være avtalt.", "2.3, 2.6", 4],
    ["skadedyr.bygningsskade", "Dyr – fysisk bygningsskade", extra ? "Plutselig og uforutsett skade fra dyr kan omfattes; kjæledyr, insekter, bakterier, sopp og råte er unntatt. Unntaket gjelder ikke bruddskade på glass. Bekjempelse følger ikke automatisk denne dekningen." : "Dyr, insekter, bakterier, sopp og råte er unntatt; unntaket gjelder ikke bruddskade på glass.", "2.6", 4],
    ["vaer.dekning", "Vind, snøtyngde og ras fra tak", "Vind svakere enn storm, snøtyngde og ras fra tak behandles som ordinær bygningsskade med vilkårets unntak; ikke som lovbestemt naturskade.", "2.6", 5],
    ["hage.vaer", "Hageanlegg – værunntak", extra ? "Dyr, frost og andre klimatiske forhold er unntatt; flomlignende situasjon dekkes." : "Frost og klimatiske forhold er unntatt; flomlignende situasjon dekkes. Dyreskade følger generelt unntak i 2.6.", "2.6", 4],
    ["egenandel.generell", "Generell egenandel", "Egenandelen i forsikringsbeviset gjelder hvis vilkåret ikke angir en annen; per skadetilfelle med mindre annet fremgår.", "3.2", 5, "reference"],
    ["vann.egenandel", "Vann fra terreng/grunn – egenandel", "Minimum 8 000 kr", "2.3", 4, "override"],
    ["vann.gjentakelse.egenandel", "Gjentatt vannskade – økt egenandel", extra ? "Økes med 20 000 kr ved tilsvarende skade siste 36 måneder fra terreng/grunn, flatt tak/balkong/terrasse eller innvendige rør." : "Økes med 20 000 kr ved tilsvarende skade siste 36 måneder fra terreng/grunn eller innvendige rør.", "2.3", extra ? 4 : 3, "override"],
    ["vaer.egenandel", "Vind/snø/ras fra tak – egenandel", "Minimum 8 000 kr", "2.6", 5, "override"],
    ["ror.egenandel", "Rørbrudd – egenandel", extra ? "Én egenandel per bruddsted. Ingen egenandel ved førstegangs staking eller TV-undersøkelse." : "Én egenandel per bruddsted", "2.4", 4, "override"],
    ["vann.egenandel.fritak", "Vann – egenandelsfritak", "Ingen egenandel ved brudd på innvendig vannledning når automatisk vannstopp sikrer hele bygningens rørsystem og er i bruk. Også fritak ved overvannsskade med angitte tiltak for magasinering/forsinkelse av ekstremnedbør.", "2.3", 3, "override"],
    ["alarm.egenandel.reduksjon", "Alarm – egenandelsreduksjon", "Inntil 6 000 kr reduksjon når brann- eller vannalarm til alarmsentral varsler den aktuelle skaden. Ingen egenandel når bare overspenningsvern eller brann-/innbrudds-/vannalarm skades.", "2.1, 2.3, 3.2", 5, "override"],
    ["gjenoppforing.hovedregel", "Gjenoppføring – hovedregel", "Samme eller vesentlig samme stand; gjenverdier trekkes fra. Samme sted og formål, eier/ektefelle/samboer/livsarving som byggherre og ferdig innen 5 år. Planlagt/nødvendig rehabilitering og estetiske forskjeller erstattes ikke ubetinget.", "3.3.1", 6],
    ["gjenoppforing.annetsted", "Gjenoppføring – annet sted eller formål", "Annet sted i Norge: fradrag for omsetningsverdiøkning over 40 %. Annet formål: hele verdiøkningen trekkes fra. Ved myndighetsforbud og gjenoppføring i samme kommune gjelder hovedregelen.", "3.3.2 A–B", 6],
    ["gjenoppforing.markedsverdi", "Ingen gjenoppføring / kjøp av annen bolig", "Andre byggherrer eller ingen gjenoppføring innen 5 år/i Norge: begrenset til fall i omsetningsverdi. Ved totalskade kan annen bolig med samme formål kjøpes i samme fylke innen 2 år; maksimalt tidligere omsetningsverdi, uten MVA, prisstigning og offentlige påbud.", "3.3.2 C–E", 6],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte", "Tryg velger kontantoppgjør, reparasjon/gjenoppføring eller gjenanskaffelse og leverandør. Kontantoppgjør begrenses til Trygs kostnad; MVA bare når dokumentert betalt og ikke fradragsberettiget.", "3.1", 5],
    ["ansvar.dekning", "Ansvar knyttet til Hus", "Privat erstatningsansvar er omfattet etter PGE90020. Aktiv sum, egenandel og detaljert scope per 19.09.2026 er ikke dokumentert: publisert fellesvilkår gjelder først 01.10.2026.", "1.8", 2],
  ]);
  items[0].structuredValue = { kind: "insurance_form", forms: extra ? ["full_value"] : ["full_value", "first_loss"],
    defaultForm: "full_value", authority: "catalog", index: "SSB prisindeks for nye eneboliger" };
  if (extra) items.push(...facts(id, [
    ["teknisk.isolerglass", "Punktering av isolerglass", "Punktering er ikke unntatt som i Standard; egen aldersfradragsregel med 10 fradragsfrie år og deretter 10 % per år, maksimalt 100 %.", "2.6, 3.4", 7],
    ["gjenoppforing.fullverdigaranti", "Fullverdigaranti ved totalskade", "Ingen fradrag for verdiøkning når fullverdiforsikret bygning eller bygningsdel erstattes med ny ved totalskade.", "3.3.1", 6],
    ["tilpasning.grense", "Tilpasning for rullestolbruker", "250 000 kr per forsikringstilfelle; ulykkesskade i forsikringstiden med minst 50 % varig medisinsk invaliditet, eller barn født med tilsvarende invaliditet. Påløpte utgifter innen 5 år; ingen egenandel.", "1.10, 3.11", 8],
  ]));
  else items.push(...facts(id, [["sprengning.egenandel", "Sprengning på forsikringsstedet – egenandel", "Minimum 10 000 kr", "2.6", 5, "override"]]));
  items.push(...ageFacts(id, extra ? [...ageRows, ["isolerglass", "Isolerglass (kun punktering)", 10, 10, 100]] : ageRows, "3.4", 7));
  return items;
}

export const trygHusFacts: Record<string, CatalogFact[]> = {
  trygHus: buildingFacts(false),
  trygHusExtra: buildingFacts(true),
  trygHusProduct: facts("trygHusProduct", [
    ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset gjelder foran vilkårene og fastslår valgte dekninger, forsikringssted og sikrede. Hus og Hus Ekstra er alternative bygningsvilkår; råte/skadedyr og utleie bekreftes mot avtalen.", "Innledning, 2–3", 1],
    ["geografi", "Geografisk område", "Bygning på forsikringsstedet; naturskade i Norge; ansvar og rettshjelp i Norden.", "3", 1],
  ]),
  trygHusIpid: facts("trygHusIpid", [
    ["bygninger.tilbehor", "Faste bygningsdeler og installasjoner", "Fast bygningstilbehør, faste bygningsdeler og faste installasjoner følger forsikret bygning. IPID er brukt til strukturkontroll; fullvilkårenes skaderegler, unntak og forsikringsbeviset avgjør faktisk dekning. Solceller, varmepumper, tekniske enheter og integrerte hvitevarer har dokumenterte aldersregler; ladeboks er ikke særskilt omtalt.", "Hva dekker forsikringen?", 1],
  ]),
  trygHusGeneral: facts("trygHusGeneral", [
    ["avtale.generelle", "Generelle avtalevilkår", "Fellesvilkåret regulerer blant annet avtaleperiode, betaling, skadebegrensning, meldefrister og skjønn. Produkt-, deknings- og sikkerhetsvilkårene gjelder sammen med forsikringsbeviset.", "1–16", 1],
  ]),
  trygHusNatural: facts("trygHusNatural", [
    ["naturskade.dekning", "Naturskade", "Direkte skade ved skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv og vulkanutbrudd på brannforsikrede ting, med særregler. Lyn, frost, tele, tørke, nedbør, snøtyngde og isgang er ikke naturskade her.", "1–2", 1],
    ["naturskade.egenandel", "Naturskade – lovbestemt egenandel", "8 000 kr i vilkåret; myndighetenes til enhver tid fastsatte beløp gjelder.", "2", 2, "override"],
    ["naturskade.hage", "Naturskade – hage og uteanlegg", "Hage/hageanlegg og tilførselsvei rundt huset inntil 5 dekar. Skog, avling på rot, beite, innmark og utmark unntatt. Skade som alene rammer antenne, skilt, markise eller lignende unntatt.", "1", 1],
    ["naturskade.relokalisering", "Naturskade – relokalisering", "Ved byggeforbud grunnet ny naturskadefare: tomtens omsetningsverdi før skaden, inntil 5 dekar, og særregler for bygning og medforsikret uthus. Selskapenes samlede katastrofegrense kan gi forholdsmessig reduksjon.", "1, 3", 2],
  ]),
  trygHusLegal: facts("trygHusLegal", [
    ["rettshjelp.dekning", "Rettshjelp – eiendomstvister", "Tvist som privat eier eller fester av forsikret eiendom i Norden, med angitte regler for kjøp/salg. Rimelige nødvendige dokumenterte utgifter; blant annet utgifter før tvist og idømte sakskostnader unntatt.", "2, 3.1, 5.2", 2],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist; 250 000 kr ved minst tre parter på samme side. Eiere av samme eiendom regnes som én part. Dekningstvist mot selskapet: 20 000 kr. Begrenset til økonomisk interesse med mindre mer godkjennes.", "6.1", 4],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr + 20 % av utgifter utover 4 000 kr; én egenandel per tvist.", "6.2", 5, "override"],
  ]),
  trygHusSafety: facts("trygHusSafety", [
    ["sikkerhet.vedlikehold", "Sikkerhet – vedlikehold og fagarbeid", "Vedlikehold eiendommen; godkjente/sertifiserte elektro- og VVS-håndverkere. Reparer synlige tak-/rørfeil umiddelbart og rens takrenner, nedløp, kummer og sluk vår og høst. Reklamer på håndverkerfeil.", "1.2", 1],
    ["sikkerhet.brann", "Sikkerhet – brann", "Røykvarsler i hver etasje og slokkeutstyr til alle rom; bygget skal følge brann-/byggeforskrifter og gassutstyr produsentens anvisninger.", "1.2", 1],
    ["sikkerhet.vann", "Sikkerhet – vann og frost", "Steng hovedstoppekran når bygget er ubebodd sammenhengende over én måned; tapp ned ved behov mot frost og hold bygget tilstrekkelig oppvarmet.", "1.2", 1],
    ["sikkerhet.sno", "Sikkerhet – snø", "Måk tak, balkong og terrasse for å unngå snøpress, snøras og snøsmelteskade.", "1.2", 1],
    ["sikkerhet.tyveri", "Sikkerhet – låsing", "Lås dører og lukk/steng vinduer når ingen er til stede; luftestilling er ikke forsvarlig sikring. Nøkler utilgjengelig for uvedkommende.", "1.2", 1],
    ["sikkerhet.risiko", "Sikkerhet – ombygging, utleie og fraflytting", "Meld ombygging som endrer gjenoppføringskostnad. Utleie krever avtale med Tryg med angitte familieunntak. Skader som skyldes fraflytting erstattes ikke; brann og naturskade beholdes.", "2", 2],
  ]),
  trygHusRot: [
    ...facts("trygHusRotProduct", [["rate_skadedyr.avtale", "Råte/skadedyr – valgt dekning", "Forsikringsbeviset gjelder foran vilkårene og viser hvilke dekninger som er valgt. Råte- og skadedyrdekningen må derfor bekreftes i kundens avtale.", "Innledning, 2", 1]]),
    ...facts("trygHusRot", [
      ["rate.dekning", "Råte og sopp – bygningsskade", "Nedbrytning av bygningsmaterialer ved råtesopper omfattes av valgt råte-/skadedyrdekning. Blåved, muggsopp og bare kosmetiske forhold er unntatt. Råte-/vannskade på fast innredning/utstyr, dører, vinduer, tak, laft og annet utvendig treverk er unntatt.", "2–3", 1],
      ["skadedyr.bygningsskade", "Dyr – fysisk bygningsskade", "Bygningsskade fra dyr omfattes under valgt råte-/skadedyrdekning; kjæledyr og husdyr i landbruket unntatt. Isolasjon krever påvist svekket funksjon; brann-/vannskade forårsaket av dyr er unntatt her og vurderes under hovedvilkåret.", "2–3", 1],
      ["skadedyr.bekjempelse", "Skadedyr – bekjempelse", "Reduksjon/utryddelse av skadeinsekter samt innvendig mus og rotter etter påvist aktivitet. VIS Forsikring velger metode og nødvendig tilkomst. Artenes enkeltvise omfang er ikke spesifisert i fullvilkåret.", "2", 1],
      ["rate_skadedyr.objekter", "Råte/skadedyr – forsikrede bygninger", "Bolig nevnt i forsikringsbeviset og frittstående garasje. Nærings-/landbruksbygg og utvendig basseng/boblebad med rør er unntatt.", "1.1", 1],
      ["rate_skadedyr.grense", "Råte/skadedyr – sum", "Ubegrenset sum for bygningsskade og bekjempelse hvis ikke annet står i forsikringsbeviset; særgrenser for vannskader og aldersregler gjelder. Dette er ikke fullverdibegrepet i hovedforsikringen.", "2, 4.4, 4.6", 1],
      ["rate_skadedyr.leverandor", "Råte/skadedyr – skadeoppgjør", "Tegnet i VIS Forsikring (Norsk Hussopp Forsikring), som foretar skadeoppgjør og velger leverandør/metode. Forhåndssamtykke kreves før bekjempelse/reparasjon. Kontroll, forebygging og tetting er unntatt.", "Innledning, 3, 4.1, 4.3.3", 3],
      ["rate_skadedyr.egenandel", "Råte/skadedyr – egenandel ved bygningsskade", "6 000 kr per skadetilfelle hvis ikke annen egenandel står i forsikringsbeviset.", "4.2", 2, "standard"],
      ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr hvis ikke annen egenandel står i forsikringsbeviset.", "4.2", 2, "standard"],
      ["rate_skadedyr.vann", "Råte/skadedyr – langvarig vannskade", "Aktiv vannskade ved oppdagelse med nedbrytning som har pågått over ett år. Slit/elde, korrosjon, konstruksjoner mot terreng/grunn og material-/konstruksjons-/monteringsfeil er blant unntakene.", "2–3", 1],
      ["rate_skadedyr.vann.grense", "Råte/skadedyr – vannskadens særgrenser", "Takinntrengning: 200 000 kr per skade og 600 000 kr per år. Kondens fra hvitevarer/varmepumper mv.: 50 000 kr per skade og 100 000 kr per år.", "4.6", 3],
      ["rate_skadedyr.tid", "Råte/skadedyr – skade før/etter avtalen", "Skadeutvikling før start/etter opphør er unntatt. Bekjempelse av aktivitet startet før avtalen er normalt unntatt; særregel når tidligere bygningsforsikring ville dekket aktiviteten. Fraflyttet bygning: bare råte-/skadedyrskader.", "3, 4.7", 3],
      ["rate_skadedyr.brukstap", "Råte/skadedyr – leietap og ubeboelighet", "Normal reparasjonstid, basert på markedsleie for godkjente umøblerte rom i tolv måneder. Skriftlig leiekontrakt før oppdagelse ved leietap. Uten dokumenterte boutgifter: 50 % av markedspris. Nødvendig flytting/lagring omfattes; hjemmekontor unntatt.", "4.3.1", 2],
      ["rate_skadedyr.prisstigning", "Råte/skadedyr – prisstigning", "Normal reparasjons-/gjenoppføringstid, maksimalt 24 måneder, etter SSBs byggekostnadsindeks.", "4.5", 3],
    ]).map((f) => ({ ...f, ...(["hus.rate.dekning", "hus.skadedyr.bygningsskade"].includes(f.key) ? { replacesBase: true } : {}) })),
    ...ageFacts("trygHusRot", [
      ["hvitevarer", "Innbygde elektriske husholdningsmaskiner/-apparater", 5, 10, 80],
      ["varmepumpe", "Berg-/jordvarmepumpe, luft til væske/luft", 5, 10, 80],
      ["bereder_pumpe", "Varmtvannsbeholdere, vannpumper og lignende", 5, 10, 80],
      ["oppvarming", "Varmekabler og annen oppvarming/kjøling", 10, 10, 80],
      ["badeinnretning", "Badeinnretning som boblebad", 5, 10, 80],
    ], "4.3.2", 2, true),
    ...([ ["tak", "Vann gjennom utett tak/beslag/pipe mv.", 30],
      ["terrasse", "Vann gjennom membran/papp på balkong/terrasse/overganger", 30],
      ["ror", "Vannskade fra brudd på innvendige rør", 50],
      ["vatrom", "Vann- og råteskade fra utett våtrom", 20] ] as const).map(([component, label, age]) => ({
        ...facts("trygHusRot", [[`aldersfradrag.rate_skadedyr.terskel.${component}`, `Råte/skadedyr – aldersregel – ${label}`,
          `Eldre enn ${age} år: 50 % fradrag i skadekostnaden og maksimalt 200 000 kr erstatning. Eldste konstruksjonsdel legges til grunn.`, "4.4", 3]])[0],
        structuredValue: { kind: "age_threshold", component, scope: "rot_pest", olderThanYears: age,
          deductionPercent: 50, maximumCompensationNok: 200000 } as BuildingFactData,
      })),
    ...facts("trygHusRotSafety", [["sikkerhet.rate_skadedyr", "Sikkerhet – råte og skadedyr", "Ettersyn og vedlikehold etter produsentens plan og forventet levetid; utbedre tak-/veggfeil straks. Følg selskapets pålegg og bruk kvalifiserte fagfolk; godkjent ombygging og sertifisert VVS-arbeid.", "1", 1]]),
  ],
  trygHusRental: [
    ...facts("trygHusRental", [
      ["utleie.skadeverk", "Utleie – skadeverk", "500 000 kr per skade på bygning, hageanlegg og innbo/løsøre utført av leietaker eller gjester. Bruksslitasje, kosmetiske skader, vedlikehold og forbedring unntatt.", "1, 2.1", 1],
      ["utleie.tyveri", "Utleie – tyveri og underslag", "500 000 kr per skade på innbo og løsøre utført av leietaker/gjester. Denne tilleggsregelen gjelder løsøre, ikke tyveri av bygningen, og gjør ikke ordinær Innbo til Husdekning.", "2.2", 1],
      ["utleie.mislighold", "Utleie – betalingsmislighold", "Inntil 6 måneders husleie, én gang per leietaker, ved manglende betaling etter leieavtalen. Adskilt fra leietap etter erstatningsmessig bygningsskade.", "2.3", 1],
      ["utleie.utkastelse", "Utleie – utkastelsesutgifter", "20 000 kr per skade for rimelige nødvendige utgifter når leietaker ikke flytter ved avsluttet/brutt avtale.", "2.4", 1],
      ["utleie.egenandel", "Utleie – egenandel", "6 000 kr per skadetilfelle", "2.5", 1, "override"],
      ["utleie.mislighold.egenandel", "Utleie – egenandel ved betalingsmislighold", "3 måneders husleie, minimum 10 000 kr", "2.5", 1, "override"],
      ["utleie.oppgjor", "Utleie – erstatningsregler", "Bygning/hage følger punkt 3.3 i valgt Bygning eller Bygning Ekstra. Innbo/løsøre følger tilleggsvilkårets egne reparasjons-, gjenanskaffelses- og verditapsregler.", "3", 1],
    ]),
    ...facts("trygHusRentalSafety", [["sikkerhet.utleie", "Sikkerhet – utleie", "Skriftlig avtale med tvangsgrunnlag og depositum/bankgaranti minst 3 måneders leie før innflytting. Varsle utkastelse senest 14 dager etter første mislighold, gi 14 dagers rettefrist. Begjær utkastelse innen én måned etter varsel og varsle Tryg innen 6 uker etter betalingsfrist.", "1", 1]]),
  ],
};

const shared = ["trygHusProduct", "trygHusIpid", "trygHusGeneral", "trygHusNatural", "trygHusLegal", "trygHusSafety"];
export const trygHusProducts: CatalogProduct[] = [
  { company: "Tryg", insuranceType: "Hus", name: "Hus", providerId: "tryg", productId: "tryg-hus", version: "2026-01-01", sourceId: "trygHus", componentIds: [...shared, "trygHus"] },
  { company: "Tryg", insuranceType: "Hus", name: "Hus Ekstra", providerId: "tryg", productId: "tryg-hus-ekstra", version: "2026-01-01", sourceId: "trygHusExtra", componentIds: [...shared, "trygHusExtra"] },
];
export const trygHusAddOns: CatalogAddOn[] = [
  { id: "tryg-hus-rate-skadedyr", name: "Råte- og skadedyr", componentId: "trygHusRot", providerId: "tryg", insuranceTypes: ["Hus"], requiresLevel: ["tryg-hus", "tryg-hus-ekstra"] },
  { id: "tryg-hus-utleie", name: "Utleieforsikring", componentId: "trygHusRental", providerId: "tryg", insuranceTypes: ["Hus"], requiresLevel: ["tryg-hus", "tryg-hus-ekstra"] },
];
