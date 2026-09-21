import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import type { BuildingFactData } from "./building-facts.ts";
import { ifHusSources } from "./if-hus-sources.ts";
export { ifHusSources } from "./if-hus-sources.ts";

type Row = [key: string, label: string, value: string, section: string, page: number,
  classification?: CatalogFact["deductibleClassification"], replacesBase?: boolean];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = ifHusSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `hus.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, section, page,
      version: source.version },
  }));
}

function ageFact(component: string, label: string, freeYears: number, annualPercent: number,
  maximumPercent: number, page = 19): CatalogFact {
  const item = facts("ifHusTerms", [[`aldersfradrag.${component}`, `Aldersfradrag - ${label}`,
    `${freeYears} år uten fradrag; deretter ${annualPercent} % for hvert påbegynt år, maksimalt ${maximumPercent} %. Fradraget beregnes av totale reparasjonskostnader.`,
    "5.7.1", page]])[0];
  item.structuredValue = { kind: "age_deduction", component, scope: "building", freeYears,
    annualPercent, maximumPercent, minimumCompensationPercent: 100 - maximumPercent,
    yearBasis: "started_year", exceptions: [], calculationBasis: "Totale reparasjonskostnader" };
  return item;
}

const basis = facts("ifHusTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbevisets spesifikasjoner og valgte dekning gjelder foran vilkårene. Beviset fastslår blant annet nivå, bygninger, forsikringssted og avtalt egenandel.", "Innledning", 4],
  ["forsikringsform", "Forsikringsform", "Fullverdi er hovedformen. Vilkåret har også egne oppgjørsregler for førsterisikoforsikret bygning; forsikringsbeviset avgjør formen og eventuell sum.", "5.1.1-5.1.2", 16],
  ["bygninger.dekning", "Forsikrede bygninger", "Bygningen eller bygningene som er angitt i forsikringsbeviset. Frittliggende bygg på forsikringsstedet inntil 10 m² omfattes også uten spesifikasjon.", "3.1", 4],
  ["bygninger.tilbehor", "Fastmontert utstyr og installasjoner", "Fastmontert utstyr som er vanlig for bygningens formål. IPID nevner blant annet fast kjøkkeninnredning, røranlegg og hageanlegg. Integrerte hvitevarer, oppvarming/kjøling og strømproduksjon har egne aldersregler; ladeboks er ikke særskilt navngitt som forsikret objekt.", "3.1.1", 4],
  ["bygninger.utsmykning", "Kunstnerisk utsmykning", "Inntil 200 000 kroner.", "3.1.1", 4],
  ["andrebygninger.endring", "Nye bygninger, tilbygg og påbygg", "Garasje, naust, båthus, uthus, tilbygg og påbygg under oppføring eller oppført siden siste hovedforfall omfattes til neste hovedforfall. Endringen må meldes senest da.", "3.1.2", 5],
  ["ror.utvendig", "Utvendige rør og ledninger", "Utvendige ledninger med tilknyttet utstyr frem til spredeledning eller offentlig ledning. Brønn og borehull er unntatt.", "3.1.1", 4],
  ["hage.objekter", "Hageanlegg og andre konstruksjoner", "Hageanlegg rundt bolig/fritidsbolig inntil 5 dekar, tilførselsvei innenfor området, fast tilkoblet vannbasseng/badeinnretning, gjerde og flaggstang.", "3.1.1", 5],
  ["hage.brygge", "Fast trebrygge", "Egen fast trebrygge til bolig, våningshus eller fritidshus inntil 100 000 kroner. Andel i fellesbrygge og andre brygge-/kaianlegg er unntatt.", "3.1.1", 5],
  ["rydding.dekning", "Riving, rydding og deponering", "Merutgifter til riving, rydding og deponering av verdiløse rester ved dekningsmessig skade.", "3.2.1", 5],
  ["brukstap.dekning", "Ubeboelig bolig etter skade", "Nødvendige dokumenterte boutgifter i normal reparasjons-/gjenoppføringstid, inntil beregnet markedspris for tilsvarende umøblerte rom. Uten dokumenterte boutgifter: 50 % av markedspris.", "3.2.2", 5],
  ["leietap.skade", "Tapt husleie etter bygningsskade", "Leieinntekt for godkjente umøblerte rom i normal reparasjons-/gjenoppføringstid. Dette er adskilt fra betalingsmislighold under If Utleieforsikring.", "3.2.2", 5],
  ["pabud.vilkar", "Offentlige påbud", "Merutgifter ved endrede tekniske krav når påbudet gjelder skadd del og følger direkte av skaden. Omfatter visse grunnundersøkelser/fundamentering; latente påbud, kulturminnekrav, kjellerutgraving og større gjenoppføring er unntatt. Utbedring innen fem år.", "3.2.3, 5.5", 6],
  ["gjenoppforing.prisstigning", "Prisstigning etter skade", "Påløpte merutgifter frem til normal reparasjon/gjenanskaffelse/gjenoppføring, beregnet etter SSBs prisindekser.", "3.2.4", 6],
  ["brann.dekning", "Brann", "Brann (løs ild), plutselig nedsoting og eksplosjon. Plutselige gnist- og sviskader omfattes inntil 10 000 kroner.", "4.1.1", 6],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag, overspenning og brudd på bygningens elektriske kabler.", "4.1.2", 7],
  ["naturskade.dekning", "Naturskade", "Direkte skade ved skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv eller vulkanutbrudd i Norge etter naturskadeforsikringsloven.", "4.2", 7],
  ["vaer.dekning", "Snø, is og svakere vind", "Ras på eller fra tak, snø- og istyngde og snøpress er ordinær bygningsdekning med konstruksjons- og objektunntak. Vind svakere enn storm har en separat dokumentert egenandelsregel.", "4.3", 7],
  ["vaer.begrensning", "Snø og is – begrensninger", "Skade der råte, svak eller feil konstruksjon eller uriktig montasje medvirker er unntatt. Det samme gjelder skade som alene rammer antenner, skilt eller markiser; veksthus, plasthall, pergola eller paviljong; hageanlegg, beplantning, utvendig basseng eller fast trebrygge; og ikke-boligbygg med takkonstruksjon eldre enn 50 år. Dokumentert rydding for de to sistnevnte bygningskategoriene kan dekkes inntil 150 000 kr.", "4.3", 7],
  ["vann.utstromming", "Vann, gass og annen væske", "Lekkasje, oversvømmelse eller tilbakeslag fra bygningens rør og tilknyttet utstyr; også akvarium, vannseng og brannslukningsapparat.", "4.4", 8],
  ["ror.brudd", "Rørbrudd", "Brudd på bygningens rørledning og tilknyttede beholdere, tanker, pumper, drenskum og fyrkjele. Følgeskade og selve bruddet må vurderes etter sine respektive vilkår.", "4.4", 8],
  ["vann.terreng", "Vann fra terreng, grunn og overflate", "Plutselig inntrengning i slik mengde at synlig vann blir stående på gulvet. Vann i oppforet gulvkonstruksjon regnes ikke som synlig stående vann.", "4.4", 8],
  ["ror.tining", "Tining av utvendig rør", "Dokumenterte utgifter til tining eller tilrettelegging når utvendig vann-/avløpsledning er frosset: inntil 50 000 kroner inklusive relevante merutgifter og tap.", "4.4", 8],
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Ikke dokumentert som egen Basis-utvidelse. Vanninntrengning utenfra over terrengnivå omfattes på Utvidet/Super med vilkårets alders- og objektbegrensninger.", "4.4", 8],
  ["vatrom.folgeskade", "Utett våtrom - følgeskade", "Skade i tilstøtende eller underliggende rom som følge av utett våtrom er unntatt på Basis.", "4.4", 8],
  ["vatrom.selverommet", "Våtrom - selve rommet og feilen", "Skade i våtrom på gulv/vegg som skal tåle vann og oppforinger rundt sluk er unntatt på Basis. Feil uten skade er ikke dekket.", "4.4", 8],
  ["tyveri.dekning", "Tyveri og skadeverk på bygning", "Tyveri og skadeverk på forsikringsstedet. Husstandsmedlems skadeverk og kosmetiske skader er unntatt; hendelsen skal politianmeldes.", "4.5", 8],
  ["plutselig.dekning", "Annen plutselig og uforutsett bygningsskade", "Andre plutselige og uforutsette skader, med uttrykkelige unntak for blant annet frost, tele, setninger, konstruksjons-/materialfeil, kondens, sopp/råte og skadedyr.", "4.7", 9],
  ["rate.dekning", "Råte og sopp - bygningsskade", "Sopp og råte er unntatt på Basis.", "4.7", 9],
  ["skadedyr.bygningsskade", "Skadedyr - fysisk bygningsskade", "Basis dekker fysisk skade fra mus, rotter og andre gnagere. Andre skadedyr og insekter omfattes først på Utvidet/Super.", "4.10", 11],
  ["skadedyr.bekjempelse", "Skadedyr - bekjempelse", "Basis dekker Anticimex-ledet bekjempelse av mus, rotter og andre gnagere i oppgitt fast bolig/fritidsbolig i Norden.", "4.10", 11],
  ["utleie.mislighold", "Utleie - betalingsmislighold", "Maksimalt seks måneders husleie, én gang per leieavtale, med tidsavgrensning fra begjæring om fravikelse til tilbakeføring pluss to måneder.", "4.8.1", 10],
  ["utleie.utkastelse", "Utleie - utkastelsesutgifter", "Rimelige nødvendige utgifter inntil 20 000 kroner.", "4.8.2", 10],
  ["utleie.skadeverk", "Utleie - skadeverk", "Forsettlig skadeverk fra leietaker eller gjester på utleid bolig, tilhørende innbo og utearealer. Kosmetisk skade, dyrehold og hard/feil bruk er unntatt.", "4.8.3", 10],
  ["utleie.tyveri", "Utleie - tyveri og underslag", "Tyveri og underslag utført av leietaker eller dennes husstandsmedlemmer.", "4.8.4", 10],
  ["utleie.vilkar", "Utleie - avtalevilkår", "Privat, ikke-næringsmessig utleie; skriftlig husleieavtale og minst to måneders innbetalt depositum eller bankgaranti før innflytting. Riktige opplysninger om egen beboelse må fremgå av forsikringsbeviset.", "4.8, 6.1.2", 9],
  ["gjenoppforing.hovedregel", "Gjenoppføring - hovedregel", "Samme eller vesentlig samme stand og formål, normalt på forsikringsstedet, med sikrede/nærstående som byggherre og ferdigstillelse innen fem år.", "5.1", 16],
  ["gjenoppforing.annetsted", "Gjenoppføring annet sted eller formål", "Annet sted er bare likestilt når myndighetene krever flytting innen samme kommune. Ellers, ved annet formål eller annen byggherre, begrenses erstatningen til omsetningsverdifallet.", "5.1, 5.2.1", 17],
  ["gjenoppforing.markedsverdi", "Kjøp av annen bolig ved totalskade", "Eksisterende bolig til samme formål innen Norge, samlet begrenset av gjenoppføringspris uten MVA og omsetningsverdiregelen. Oppussing/tilpasning inntil 1 000 000 kroner innen to år; kjøp og arbeid innen fem år.", "5.2.2", 17],
  ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte", "If velger reparasjon, gjenanskaffelse, gjenoppføring eller kontantoppgjør samt reparatør/leverandør. Udokumentert arbeidslønn erstattes med 75 % av Ifs avtalepartnerpris uten MVA.", "5", 15],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen i forsikringsbeviset gjelder med mindre vilkåret fastsetter en særskilt egenandel.", "5.7", 19, "reference"],
  ["utleie.egenandel", "Utleie - egenandel", "Tre måneders husleie. Høyere sikkerhet trekkes fullt fra. Ved ordinært tyveri/skadeverk på utleid bolig: depositum/bankgaranti, minst 10 000 kroner.", "5.7.7", 20, "override"],
  ["skadedyr.egenandel", "Gnagere/skadedyr - bekjempelsesegenandel", "2 000 kroner; ingen egenandel for telefon, artsbestemmelse eller løsning med tilsendt middel/utstyr.", "5.7.8", 20, "override"],
  ["naturskade.egenandel", "Naturskade - lovbestemt egenandel", "8 000 kroner i vilkåret, fastsatt av Justis- og beredskapsdepartementet.", "5.7.3", 20, "override"],
  ["vaer.egenandel", "Vind svakere enn storm - egenandel", "8 000 kroner hvis ikke forsikringsbeviset angir høyere egenandel.", "5.7.3", 20, "override"],
  ["ror.frost.egenandel", "Frost på innvendige rør - egenandel", "Avtalt egenandel økes med 8 000 kroner, med dokumenterte unntak for ren tining og aldersfradrag over 50 år.", "5.7.4", 20, "override"],
  ["teknisk.glass.egenandel", "Glass og sanitærporselen - egenandel", "4 000 kroner når skaden alene rammer glassrute eller sanitærporselen.", "5.7.6", 20, "override"],
  ["service.byggteknisk", "Tjeneste - If Byggteknisk rådgivning", "Rådgivning er inkludert på alle tre nivåer. Dette er en tjeneste, ikke en skadeforsikringssum.", "Oversikt", 3],
  ["byggunderoppforing", "Bygg under oppføring", "Fullvilkåret har særregler og omfattende unntak for bygg under oppføring. Det er en risikosituasjon under bygningsvilkåret, ikke et valgbart UI-tillegg.", "4.13", 14],
]);

const insuranceForm = basis.find((item) => item.key === "hus.forsikringsform")!;
insuranceForm.structuredValue = { kind: "insurance_form", forms: ["full_value", "first_loss"],
  defaultForm: "full_value", authority: "catalog", index: "SSBs prisindekser ved prisstigning etter skade" };
basis.push(
  ageFact("bereder_pumpe", "varmtvannsbeholder/-bereder, fyrkjele og vann-/avløpspumpe", 5, 5, 80),
  ageFact("oppvarming", "elektrisk utstyr for oppvarming eller kjøling", 5, 10, 80),
  ageFact("ventilasjon_solceller", "varmekabler, balansert ventilasjon og utstyr for strømproduksjon", 10, 10, 80),
  ageFact("integrerte_hvitevarer", "integrerte hvitevarer og husholdningsapparater", 5, 10, 80),
  ageFact("utvendige_ror", "utvendige/bunnledninger, tanker og kummer av annet enn plast", 20, 5, 80),
  ageFact("badeinnretning", "utvendig/innvendig elektrisk tilkoblet badeinnretning", 2, 10, 80),
);

const productFacts = facts("ifHusProductPage", [
  ["egenandel.standard", "Produktets publiserte standardegenandel", "Basis og Utvidet: 10 000 kroner. Forsikringsbeviset viser kundens faktiske egenandel.", "Hva er egenandelen ved skade?", 1, "standard"],
]);

const extended = facts("ifHusTerms", [
  ["takvegg.folgeskade", "Vann gjennom tak og yttervegg", "Utvidet/Super dekker vann som trenger inn utenfra over terrengnivå. Selve utettheten er ikke dekket. Tak, takgjennomføring, balkong, terrasse og overgang eldre enn 50 år er unntatt.", "4.4", 8, undefined, true],
  ["vatrom.folgeskade", "Utett våtrom - følgeskade", "Skade i tilstøtende og underliggende rom som følge av utett våtrom omfattes. Selve våtrommet og oppforing rundt sluk omfattes ikke av denne dekningen.", "4.4", 8, undefined, true],
  ["rate.dekning", "Råte og sopp - bygningsskade", "Ekte hussopp, andre treødeleggende sopper og råte som utvikler seg i forsikringstiden. Blåved, mugg, bakterier, kosmetiske forhold, utvendig treverk og ikke-boligbygg eldre enn 50 år er blant unntakene.", "4.11", 12, undefined, true],
  ["skadedyr.bygningsskade", "Skadedyr - fysisk bygningsskade", "Utvidet/Super dekker i tillegg fysisk bygningsskade fra skadedyr. Kosmetisk skade og isolasjon uten dokumentert svekket funksjon er unntatt; ikke-boligbygg er unntatt.", "4.10", 11, undefined, true],
  ["skadedyr.bekjempelse", "Skadedyr og insekter - bekjempelse", "Anticimex-ledet bekjempelse av skadedyr og skadeinsekter, blant annet skjeggkre, veggedyr og kakerlakker, i oppgitt bolig. Forebygging, utendørs anlegg og flere insekt-/metodeunntak gjelder.", "4.10", 11, undefined, true],
  ["tilpasning.grense", "Tilpasning av bolig etter ulykke", "Inntil 250 000 kroner til bygningsmessig tilpasning av primærbolig eller dokumentavgift ved flytting. Krever minst 50 % varig medisinsk invaliditet; utgifter innen fem år.", "4.9", 10],
  ["aldersfradrag.tak_vatrom", "Aldersfradrag - eldre tak og våtrom", "8 000 kroner i tillegg til avtalt egenandel når vanninntrengningsstedet i tak mv. eller utett våtrom er eldre enn 30 år. Eldste del legges til grunn.", "5.7.2", 19],
]);
extended.at(-1)!.structuredValue = { kind: "age_threshold", component: "tak_vatrom", scope: "building",
  olderThanYears: 30, fixedDeductionNok: 8000,
  note: "Fast aldersfradrag 8 000 kroner utover avtalt egenandel" } as BuildingFactData;

const superFacts = [
  ...facts("ifHusTerms", [
    ["vatrom.selverommet", "Våtrom - selve rommet og feilen", "Ved konstatert følgeskade dekkes skade på gulv og vegger i våtrommet som direkte følge av monterings-, material-, konstruksjons- eller prosjekteringsfeil utført av autorisert håndverker for mindre enn ti år siden. Feil uten følgeskade og selve følgeskaden vurderes separat.", "4.12.1", 13, undefined, true],
    ["handverker.folgeskade", "Håndverkerfeil - fysisk følgeskade", "Direkte fysisk følgeskade etter feil montering, materiale, konstruksjon eller prosjektering utført av autorisert håndverker for mindre enn ti år siden. Selve feilen, tilkomst og en rekke objekter/skadeårsaker er unntatt.", "4.12.2", 13],
    ["handverker.juridisk", "Håndverkerfeil - juridisk rådgivning", "Ved skade innen reklamasjonstid: inntil 15 000 kroner per forsikringsår, uten egenandel. Dekningen er en avgrenset ytelse knyttet til håndverkerfeil.", "4.12.2", 13],
    ["service.boligsjekk", "Tjeneste - If Boligsjekk", "Kan bestilles uten ekstra kostnad for Super-helårsbolig og gjentas hvert fjerde år. Utføres av Anticimex; dokumenterte bygnings-, bruks- og adkomstbegrensninger gjelder.", "3.3", 6],
    ["service.overvannsrapport", "Tjeneste - overvannsrapport", "Ved relevant dekningsmessig vann-/flomskade: rapportkostnad inntil 10 000 kroner, maksimalt én gang per eiendom.", "3.4", 6],
    ["service.nokkel", "Nøkkelservice", "Tapt nøkkel til boligens utgangsdør: låsbytte inntil 5 000 kroner per hendelse; egenandel 1 000 kroner.", "4.6, 5.7.5", 9],
  ]),
  ...facts("ifHusProductPage", [
    ["egenandel.standard", "Produktets publiserte standardegenandel", "Super: 8 000 kroner. Forsikringsbeviset viser kundens faktiske egenandel.", "Hva er egenandelen ved skade?", 1, "standard", true],
    ["service.juridisk", "Tjeneste - juridisk rådgivning", "To timer juridisk rådgivning per år fra Advokatfirmaet Solver for privatrettslige spørsmål. Dette er en tjeneste og ikke rettshjelpssummen.", "Tjenester", 1],
    ["service.supergaranti", "Tjeneste - Supergaranti", "Markedsført garanti i to år ved flytting fra annet selskap. Detaljert anvendelse må avgjøres mot tidligere forsikringsbevis/vilkår og gjeldende garantibetingelser; den er ikke modellert som automatisk overstyring av katalogdekningene.", "Supergaranti", 1],
    ["service.tryggere_hjem", "Tjeneste - Tryggere Hjem", "Super inkluderer den markedsførte alarmtjenesten Tryggere Hjem, levert av Ohma, for varsling av vannlekkasje, brann og innbrudd. Dette er registrert som tjeneste, ikke som en ordinær skadeforsikringssum.", "Fordeler for deg som If-kunde", 1],
  ]),
];

const liability = facts("ifHusLiability", [
  ["rettshjelp.dekning", "Rettshjelp - eiendomstvister", "Tvist som personlig eier av forsikret eiendom. Gjelder eiendomsforsikring i Norden hvis beviset ikke sier annet; nødvendige rimelige advokat-, retts-, sakkyndig- og vitneutgifter med dokumenterte unntak.", "1.2-1.5", 1],
  ["rettshjelp.begrensning", "Rettshjelp – sentrale begrensninger", "Tvister om familie, arv, samboerforhold eller skifte, yrke eller erverv, annen fast eiendom, kjøretøy, båt eller luftfartøy er unntatt. Ved offentlig forvaltningsvedtak dekkes søksmål først når administrativ klagemulighet er fullt utnyttet; utgifter under forvaltningsbehandlingen er unntatt.", "1.5.3", 2],
  ["rettshjelp.grense", "Rettshjelp - forsikringssum", "100 000 kroner per tvist; samlet 250 000 kroner ved minst tre parter på samme side med i hovedsak samme faktiske og juridiske spørsmål.", "1.6", 2],
  ["rettshjelp.egenandel", "Rettshjelp - egenandel", "4 000 kroner + 20 % av overskytende; én egenandel per tvist.", "1.7", 2, "override"],
  ["ansvar.dekning", "Ansvar knyttet til Hus", "Rettslig erstatningsansvar i egenskap av personlig eier av forsikret eiendom, for person- og tingskade. Gjelder skade i Norden etter nordisk rett.", "2.2-2.4", 3],
  ["ansvar.grense", "Ansvar - forsikringssum", "5 000 000 kroner per skadetilfelle; saksomkostninger kommer i tillegg.", "2.6", 4],
  ["ansvar.egenandel", "Ansvar - egenandel", "4 000 kroner per skadetilfelle.", "2.7", 4, "override"],
]);

const general = facts("ifHusGeneral", [["avtale.generelle", "Generelle avtalevilkår",
  "Regulerer blant annet avtaleperiode, betaling, skadeplikter og generelle begrensninger. Bransjevilkår og forsikringsbevis kan fravike dem; SV006 erstatter det generelle rettshjelpspunktet.", "Generelle vilkår", 2]]);

export const ifHusFacts: Record<string, CatalogFact[]> = {
  ifHusBasis: [...basis, ...productFacts],
  ifHusExtended: extended,
  ifHusSuper: superFacts,
  ifHusLiability: liability,
  ifHusGeneral: general,
  ifHusIpid: facts("ifHusIpid", [["avtale.ipid", "IPID - produktavgrensning",
    "Privateide bygninger brukt som permanent bolig; fastmontert utstyr og angitte tilleggsbygninger. IPID er oversikt, mens fullvilkår og forsikringsbevis avgjør dekningen.", "Hvilken forsikring er dette?", 1]]),
};

const common = ["ifHusGeneral", "ifHusIpid", "ifHusLiability"];
export const ifHusProducts: CatalogProduct[] = [
  { company: "If", insuranceType: "Hus", name: "Basis", providerId: "if", productId: "if-hus-basis",
    version: "2023-09", sourceId: "ifHusTerms", componentIds: [...common, "ifHusBasis"] },
  { company: "If", insuranceType: "Hus", name: "Utvidet", providerId: "if", productId: "if-hus-utvidet",
    version: "2023-09", sourceId: "ifHusTerms", componentIds: ["ifHusExtended"], inheritsProductId: "if-hus-basis" },
  { company: "If", insuranceType: "Hus", name: "Super", providerId: "if", productId: "if-hus-super",
    version: "2023-09", sourceId: "ifHusTerms", componentIds: ["ifHusSuper"], inheritsProductId: "if-hus-utvidet" },
];

// Utleie, gnagerdekning og nivåutvidelsene inngår i hovedproduktene. IPID nevner
// Innbo og Trebrygge som mulige tillegg, men de er ikke modellert som Hus-add-ons:
// Innbo er en egen forsikringstype, og fullvilkåret har allerede fast trebrygge til 100 000 kroner.
export const ifHusAddOns: CatalogAddOn[] = [];
