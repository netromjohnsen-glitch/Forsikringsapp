import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { trygReiseSources } from "./tryg-reise-sources.ts";
export { trygReiseSources } from "./tryg-reise-sources.ts";

type Row = [key: string, label: string, value: string, section: string, page: number,
  deductibleClassification?: CatalogFact["deductibleClassification"], replacesBase?: boolean];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = trygReiseSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `reise.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: source.id, section, page, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url,
      productCode: source.productCode, version: source.version,
      note: "Forsikringsbeviset går foran vilkårene og avgjør valgte personer, dekninger, reisevarighet, summer, egenandeler og særvilkår." },
  }));
}

const productFacts = facts("trygReiseProduct", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset går foran vilkårene og angir hvem som er sikret, produktnivå, valgt ulykkesdekning, reisevarighet, summer, egenandeler, reservasjoner og særvilkår.", "Innledning og punkt 1–4", 1],
  ["personer.omfang", "Hvem forsikringen gjelder for", "Personene fremgår av forsikringsbeviset. Det aktive produktvilkåret definerer ikke en generell familie-, samboer-, fosterbarn- eller barnealdersgruppe som kan fylles inn i katalogen.", "1 Hvem forsikringen gjelder for", 1],
  ["omrade.verden", "Geografisk område", "Reiser i hele verden, men ikke fast/midlertidig bosted eller fast arbeids-/skole-/undervisningssted. Fritidsarrangement på slike steder er unntatt fra stedsbegrensningen.", "3 Hvor forsikringen gjelder", 1],
  ["omrade.ud", "UD-reiseadvarsel", "Forsikringen gjelder ikke for reise til område med gyldig offisiell UD-reiseadvarsel på reisetidspunktet; hele reisen er ugyldig selv om advarselen senere oppheves.", "3 Hvor forsikringen gjelder", 2],
  ["varighet.beregning", "Hvordan reisevarighet beregnes", "Fra avreise fra bostedsadressen i Norge til retur samme sted. For pendlere/studenter fra midlertidig bosted regnes retur dit eller fast bosted; sjøansatte starter ved avmønstring.", "4 Når forsikringen gjelder", 2],
  ["varighet.utvidelse", "Automatisk forlengelse", "Når hjemreise er forhåndsbestilt innen perioden: to døgn ved vær, teknisk feil, nødlanding eller terrortrussel og 30 døgn ved dekket sykdom/ulykke.", "4 Når forsikringen gjelder", 2],
  ["tjeneste.alarm", "Tryg Alarm", "Døgnåpen assistansetjeneste for akutt sykdom eller ulykkesskade med medisinsk koordinering og internasjonalt behandlingsnettverk. Dette er en tjeneste, ikke en forsikringssum.", "7 Hjelp under reisen", 2],
]);

const base = facts("trygReiseBase", [
  ["overnatting", "Reise med overnatting", "Reise gjelder bare fritidsreiser med overnatting.", "Produktstruktur og produktside", 1],
  ["tjenestereise", "Tjenestereise", "Tjenestereiser er ikke omfattet av Reise; de er også uttrykkelig unntatt fra avbestilling og flere forsinkelses-/reiseavbruddsytelser.", "2.2, 3.3 og 5.5", 2],
  ["avbestilling.dekning", "Avbestilling", "Uventet akutt sykdom, alvorlig ulykkesskade, akutt alvorlig forverring av kjent sykdom eller dødsfall hos sikrede, nærmeste familie, reisefølge eller eneste medreisendes nærmeste familie; også angitte savnet-, behandling-, boligskade-, naturkatastrofe- og UD-tilfeller.", "2.1", 1],
  ["avbestilling.ud", "Avbestilling ved UD-reiseadvarsel", "Dekkes når offisiell UD-advarsel foreligger når reisen starter, men ikke hvis advarselen forelå ved bestilling.", "2.1–2.2", 1],
  ["forsinkelse.rute", "Forsinket avgang og fremmøte", "Forsinket forhåndsbestilt offentlig transport eller fremmøte etter kollisjon, utforkjøring, teknisk feil, nødlanding, vær eller terrorhandling/-trussel. Rimelig transport for å innhente ruten og nødvendig overnatting omfattes.", "3.1", 2],
  ["bagasje.forsinket", "Forsinket bagasje", "Nødvendige klær, toalettsaker og leie av nødvendig utstyr når ekspedert bagasje ikke ankommer, er forbyttet i minst fire timer eller er utilgjengelig ved ufrivillig transitt med overnatting. Ikke ved ankomst til fast/midlertidig bosted.", "4.1–4.2", 3],
  ["bagasje.dekning", "Reisegods", "Personlige eiendeler med til eget bruk, samt ting lånt/leid og medbrakt som egne på hele reisen. Innsjekket bagasje, tyveri, ran, dyr, trafikkuhell, båtulykke, brann, vann, naturulykke og hærverk omfattes etter vilkåret.", "4–4.1", 3],
  ["bagasje.sport", "Sportsutstyr", "Eget sportsutstyr regnes som reisegods. Uhell på sykkel i bosteds-/arbeids-/studiekommune, lagidrett, sykkelritt og flere risikosituasjoner er begrenset eller unntatt.", "4.1 og sikkerhetsforskrift 3.1", 3],
  ["bagasje.uhell", "Uhell på reisegods", "Ikke omfattet på Reise.", "4.1 Uhellsdekning", 4],
  ["medisinsk.behandling", "Reisesyke – behandling", "Rimelige og nødvendige utgifter ved uventet akutt sykdom, ulykkesskade eller uventet akutt alvorlig forverring av kjent sykdom: lege, sykehus inntil 60 døgn, medisiner, hjelpemidler, foreskrevet fysikalsk behandling og transport.", "5.1–5.2", 5],
  ["medisinsk.tann", "Tannbehandling", "Tannskade og tannsykdom er unntatt under reisesyke. Tannbehandling kan følge separat valgt ulykkesdekning etter ulykkesvilkåret.", "5.6", 8],
  ["medisinsk.ledsager", "Tilkalling og sykeledsagelse", "Med forhåndsgodkjenning dekkes rimelige og nødvendige utgifter for inntil to nærstående når medisinsk nødvendig.", "5.2", 6],
  ["medisinsk.forlenget", "Utsatt hjemreise", "Nødvendige merutgifter til overnatting, måltider og transport til reiseruten kan dekkes når medisinske årsaker hindrer planlagt videre reise; forhåndsgodkjenning kreves.", "5.2", 6],
  ["medisinsk.kjent", "Kjent sykdom", "Dekker uventet akutt alvorlig forverring, men ikke planlagt behandling/kontroll på reisen eller sannsynlig komplikasjon/forverring etter objektiv medisinsk vurdering. Ved pågående/ventet behandling kreves legeerklæring før avreise.", "5.1, 5.6 og sikkerhetsforskrift 2", 5],
  ["medisinsk.graviditet", "Svangerskap og fødsel", "Svangerskap, frivillig abort og fødsel fra uke 37 regnes ikke som sykdom; sykdom/ulykke under svangerskap, abort eller fødsel kan likevel dekkes når øvrige kriterier er oppfylt.", "2.1 og 5.1", 1],
  ["hjemtransport", "Hjemtransport", "Nødvendige merutgifter ved medisinsk nødvendig tidligere hjemtransport, dødsfall, savnet nær familie, alvorlig familiehendelse eller alvorlig skade på bolig/virksomhet. Tryg/Tryg Alarm må godkjenne på forhånd.", "5.4", 7],
  ["evakuering", "Evakuering", "Nødvendige merutgifter til overnatting, måltider og transport til nærmeste sikre destinasjon eller bosted i Norden ved offisielt UD-evakueringsråd; reise inn etter varslet situasjon og manglende bestilt retur er unntatt.", "6", 8],
  ["reiseavbrudd", "Reiseavbrudd", "Ikke omfattet på Reise.", "5.5", 7],
  ["forsinkelse.hotell_arrangement", "Tapt hotell og arrangement", "Ikke omfattet på Reise.", "3.2", 3],
  ["forsinkelse.leiebilavtale", "Tapt leiebilavtale", "Ikke omfattet på Reise.", "3.2", 3],
  ["leiebil.egenandel", "Egenandel leiebil", "Ikke omfattet på Reise.", "7", 9],
  ["ansvar.dekning", "Privatansvar", "Rettslig privatansvar på reiser utenfor Norden. Gjeldende detaljvilkår per skjæringsdato er ikke publisert på vilkårssiden; fremtidig PGE90020 fra 01.10.2026 er ikke aktivert.", "Produktvilkår 2–3", 1],
  ["ulykke.dekning", "Ulykkesdekning", "Ikke inkludert i Reise uten at Ulykke er valgt og står i forsikringsbeviset.", "Produktvilkår punkt 2", 1],
]);

const baseSums = facts("trygReiseSums", [
  ["varighet.maks", "Maksimal sammenhengende reisevarighet", "45 dager per enkeltreise; forsikringsbeviset er autoritativt ved avtalt utvidelse.", "Forsikringssummer / produktoversikt", 1],
  ["avbestilling.sum", "Avbestilling – forsikringssum", "20 000 kr per skadetilfelle per sikret.", "Avbestilling", 1],
  ["forsinkelse.avgang_sum", "Forsinket avgang – sum", "1 500 kr.", "Forsinket avgang", 1],
  ["forsinkelse.fremmote_sum", "Forsinket fremmøte – sum", "20 000 kr; overnatting innenfor summen inntil 1 500 kr.", "Forsinket fremmøte", 1],
  ["bagasje.forsinket_sum", "Forsinket bagasje – sum", "2 000 kr per sikret; ved transitt inntil 500 kr.", "Forsinket bagasje", 1],
  ["bagasje.total", "Reisegods – samlet sum", "20 000 kr per skadetilfelle per sikret.", "Reisegods", 1],
  ["bagasje.per_gjenstand", "Reisegods – enkeltgjenstand", "6 000 kr per gjenstand med tilbehør.", "Reisegods", 1],
  ["bagasje.nokler", "Nøkler", "4 000 kr.", "Reisegods", 1],
  ["bagasje.kontanter", "Kontanter", "3 000 kr for alle sikrede samlet.", "Reisegods", 1],
  ["bagasje.pass_billetter", "Pass og billetter", "5 000 kr for alle sikrede samlet, inkludert nødvendige merutgifter til reise og opphold.", "Reisegods", 1],
  ["medisinsk.sum", "Reisesyke – samlet sum", "Ingen øvre samlet forsikringssum; bare rimelige/nødvendige utgifter og dokumenterte delgrenser.", "Reisesyke", 1],
  ["medisinsk.ledsager_sum", "Tilkalling og sykeledsagelse – sum", "30 000 kr; overnatting og måltider inntil 1 500 kr per døgn.", "Reisesyke", 1],
  ["medisinsk.eneste_medreisende_sum", "Eneste medreisende – sum", "15 000 kr; overnatting/måltider inntil 1 500 kr per døgn.", "Reisesyke hos eneste reiseledsager", 2],
  ["hjemtransport.sum", "Hjemtransport – sum", "Ingen øvre forsikringssum; rimelige og nødvendige merutgifter styrer.", "Hjemtransport", 2],
  ["evakuering.sum", "Evakuering – sum", "Ingen øvre forsikringssum; nødvendige merutgifter styrer.", "Evakuering", 2],
  ["ansvar.sum", "Privatansvar – forsikringssum", "4 000 000 kr per skadetilfelle for alle sikrede samlet.", "Privatansvar", 2],
  ["rettshjelp.sum", "Rettshjelp – forsikringssum", "100 000 kr per tvist; PGE91500 utvider til 250 000 kr ved minst tre parter.", "Rettshjelp / PGE91500 punkt 6.1", 2],
  ["bagasje.mobil_egenandel", "Mobiltelefon – gjentatt skade", "Fra andre tap/skade innen tre forsikringsår: egenandel 2 000 kr.", "Reisegods", 1, "override"],
]);

const extra = facts("trygReiseExtra", [
  ["overnatting", "Reise med eller uten overnatting", "Reise Ekstra gjelder fritids- og tjenestereiser med og uten overnatting.", "Produktstruktur og produktside", 1, undefined, true],
  ["tjenestereise", "Tjenestereise", "Reise Ekstra gjelder også tjenestereiser, men avbestilling, tjenestereiseutgifter og reiseavbrudd har uttrykkelige unntak i dekningsvilkåret.", "2.2, 3.3 og 5.5", 2, undefined, true],
  ["reiseavbrudd", "Reiseavbrudd", "Kompensasjon for ubenyttede kalenderdager ved sykehusinnleggelse, dekket hjemtransport/evakuering eller tilsvarende hendelse hos eneste medreisende; ikke på hjemreisedagen eller tjenestereise.", "5.5", 7, undefined, true],
  ["forsinkelse.hotell_arrangement", "Tapt hotell og arrangement", "Ubenyttet hotellovernatting og forhåndsbetalt arrangement etter minst fem timers dekket forsinkelse; inntil én hotellovernatting.", "3.2", 3, undefined, true],
  ["forsinkelse.leiebilavtale", "Tapt leiebilavtale", "Kansellert forhåndsbetalt leiebilavtale for bil etter minst 1,5 times dekket forsinkelse; privatleie, andre kjøretøy og bil for andre er unntatt.", "3.2–3.3", 3, undefined, true],
  ["bagasje.uhell", "Uhell på reisegods", "Plutselig og uforutsett fysisk skade med kjent ytre årsak og tidspunkt. Tingen må fremvises; mistet/gjenglemt ting og angitte objekt-/stedsunntak dekkes ikke.", "4.1", 4, undefined, true],
  ["leiebil.egenandel", "Egenandel leiebil", "Belastet egenandel ved skade eller tyveri av leiebil til eget bruk på feriereise med minst én overnatting og kontrakt med utleiefirma. Andre kjøretøy, bildeling, verkstedleie, flytting og varetransport er unntatt.", "7", 9, undefined, true],
]);

const extraSums = facts("trygReiseSums", [
  ["avbestilling.sum", "Avbestilling – forsikringssum", "Ingen øvre forsikringssum; dokumenterte avbestillingskostnader og vilkårets begrensninger styrer.", "Avbestilling", 1, undefined, true],
  ["forsinkelse.avgang_sum", "Forsinket avgang – sum", "3 000 kr.", "Forsinket avgang", 1, undefined, true],
  ["forsinkelse.fremmote_sum", "Forsinket fremmøte – sum", "Ingen øvre forsikringssum; overnatting inntil 3 000 kr.", "Forsinket fremmøte", 1, undefined, true],
  ["bagasje.forsinket_sum", "Forsinket bagasje – sum", "5 000 kr per sikret; ved transitt inntil 500 kr.", "Forsinket bagasje", 1, undefined, true],
  ["bagasje.total", "Reisegods – samlet sum", "Ingen øvre samlet forsikringssum; dokumenterte enkelt- og kategorigrenser gjelder.", "Reisegods", 1, undefined, true],
  ["bagasje.per_gjenstand", "Reisegods – enkeltgjenstand", "40 000 kr per gjenstand med tilbehør.", "Reisegods", 1, undefined, true],
  ["bagasje.kontanter", "Kontanter", "6 000 kr for alle sikrede samlet.", "Reisegods", 1, undefined, true],
  ["bagasje.pass_billetter", "Pass og billetter", "20 000 kr for alle sikrede samlet, inkludert nødvendige merutgifter.", "Reisegods", 1, undefined, true],
  ["bagasje.uhell_sum", "Uhell – sum", "8 000 kr per forsikringsår.", "Uhellsdekning", 1],
  ["bagasje.uhell_egenandel", "Uhell – egenandel", "1 500 kr per skadetilfelle.", "Uhellsdekning", 1, "override"],
  ["medisinsk.ledsager_sum", "Tilkalling og sykeledsagelse – sum", "Ingen særskilt øvre sum oppgitt; rimelige og nødvendige utgifter styrer.", "Reisesyke", 1, undefined, true],
  ["medisinsk.eneste_medreisende_sum", "Eneste medreisende – sum", "35 000 kr.", "Reisesyke hos eneste reiseledsager", 2, undefined, true],
  ["reiseavbrudd.sum", "Reiseavbrudd – sum", "Inntil 1 500 kr per døgn per sikret; beregnes etter ubenyttede dager og dokumenterte reisekostnader.", "Reiseavbrudd", 2],
  ["forsinkelse.hotell_arrangement_sum", "Tapt hotell/arrangement – sum", "5 000 kr.", "Tapt hotellovernatting og arrangement", 1],
  ["forsinkelse.leiebilavtale_sum", "Tapt leiebilavtale – sum", "8 000 kr per skadetilfelle.", "Tapt leiebilavtale", 1],
  ["leiebil.egenandel_sum", "Leiebilegenandel – sum", "40 000 kr.", "Egenandel leiebil", 2],
  ["ansvar.sum", "Privatansvar – forsikringssum", "15 000 000 kr per skadetilfelle for alle sikrede samlet.", "Privatansvar", 2, undefined, true],
]);

const premium = facts("trygReisePremium", [
  ["varighet.maks", "Maksimal sammenhengende reisevarighet", "70 dager per enkeltreise; forsikringsbeviset er autoritativt ved avtalt utvidelse.", "Produktvilkår og forsikringssummer", 1, undefined, true],
  ["idtyveri.dekning", "ID-tyveriforsikring", "Tryg ID gir telefonråd for å forebygge, oppdage og begrense identitetstyveri, identitetsmisbruk og misbruk i sosiale medier, samt hjelp med fjerning av innhold/falske profiler. Hendelsen må oppdages og anmeldes i perioden.", "8", 9],
  ["idtyveri.juridisk", "ID-tyveri – juridisk bistand", "Rimelige og nødvendige, forhåndsgodkjente juridiske utgifter inntil 25 000 kr når saken ikke kan løses uten bistand. Økonomisk tap og nye ID-papirer/bankkort dekkes ikke.", "8.1", 9],
]);

const legal = facts("trygReiseLegal", [
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige juridiske utgifter ved tvist som privatperson, når tvisten springer ut av forhold utenfor Norden de første 45 dagene av feriereisen.", "3.2 og 5.1", 1],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "Ingen egenandel for tvist omfattet av reiseforsikringen.", "6.2", 5, "override"],
]);
const premiumLegal = facts("trygReiseLegal", [["rettshjelp.dekning", "Rettshjelp",
  "Rimelige og nødvendige juridiske utgifter ved tvist som springer ut av forhold utenfor Norden de første 70 dagene av feriereisen.",
  "3.2 og 5.1", 1, undefined, true]]);
const premiumServices = facts("trygReiseProductPage", [
  ["tjeneste.lounge", "SmartDelay+ lounge", "Tjenestefordel på Premium: forhåndsregistrert flyreise, mer enn én times forsinkelse, lounge for sikrede og inntil fem medreisende; uten lounge kan inntil 40 euro per person tilbys. Ikke ordinær skadeforsikringsdekning.", "Lounge ved forsinkelse", 1],
  ["tjeneste.legehjelp", "Tryg Legehjelp", "Telefonisk tilgang til norske leger og sykepleiere 365 dager i året for sikrede, ektefelle og barn. Tjeneste, ikke behandlingssum.", "Tryg Legehjelp", 1],
]);

function accident(sourceId: string, level: string, invalidity: string, death: string): CatalogFact[] {
  return facts(sourceId, [
    ["ulykke.dekning", `${level} – omfang`, "Separat personforsikringskomponent for ulykkesskade: varig medisinsk invaliditet, dødsfall og nødvendige behandlingsutgifter. Gjelder ut forsikringsåret den forsikrede fyller 80 år.", "1–3", 1, undefined, true],
    ["ulykke.invaliditet", `${level} – medisinsk invaliditet`, invalidity, "Forsikringssummer / 3.1", 3],
    ["ulykke.dodsfall", `${level} – dødsfall`, death, "Forsikringssummer / 2.2 og 3.3", 3],
    ["ulykke.behandling", `${level} – behandlingsutgifter`, "5 % av invaliditetssummen for rimelig og nødvendig behandling innen tre år; lege, tannlege, offentlig sykehus, fysioterapi/kiropraktor, foreskrevet behandling, medisiner/proteser og billigste reise.", "Forsikringssummer / 3.2", 3],
  ]);
}

const accidentBasic = accident("trygReiseAccident", "Ulykke",
  "Til og med 69 år: 300 000 kr; 70–80 år: 100 000 kr. Fra 1 % varig medisinsk invaliditet hvis ikke annet er avtalt.",
  "Til og med 20 år: 50 000 kr; 21–69 år: 150 000 kr; 70–80 år: 100 000 kr.");
const accidentExtra = accident("trygReiseAccident", "Ulykke Ekstra",
  "Til og med 69 år: 500 000 kr; 70–80 år: 100 000 kr. Fra 1 % varig medisinsk invaliditet hvis ikke annet er avtalt.",
  "Til og med 20 år: 100 000 kr; 21–69 år: 500 000 kr; 70–80 år: 100 000 kr.");
const accidentPremium = accident("trygReiseAccidentPremium", "Ulykke Premium",
  "Til og med 69 år: 750 000 kr; 70–80 år: 100 000 kr. Fra 1 % varig medisinsk invaliditet hvis ikke annet er avtalt.",
  "Til og med 20 år: 100 000 kr; 21–69 år: 750 000 kr; 70–80 år: 100 000 kr.");

const safety = facts("trygReiseSafety", [
  ["sikkerhet.reisegods", "Sikkerhetsforskrifter – reisegods", "Bagasje skal pakkes og oppbevares etter transportørkrav; verdier skal være under tilsyn eller innelåst, og reisegods skal ikke ligge i bil, båt, telt eller campingvogn kl. 24–06.", "1 Sikkerhetsforskrifter", 1],
  ["sikkerhet.sykdom", "Sikkerhetsforskrifter – sykdom", "Lege skal kontaktes og råd følges. Tryg Alarm skal kontaktes straks ved sykehusinnleggelse eller behandlingsutgifter over 5 000 kr; hjemtransport krever forhåndsgodkjenning.", "2 Sykdom og ulykkesskade", 2],
  ["aktivitet.unntak", "Aktivitet og sport", "For personer fra 16 år gjelder blant annet unntak for base-/strikkhopp, mikro-/ultralett fly, kampidrett, motorsport, profesjonell idrett fra 1 G, yrkesdykking/udokumentert dykking, rus, slagsmål, ekspedisjoner og angitte sportsrelaterte reisegodsskader.", "3.1 Endring av risiko", 2],
  ["aktivitet.dykking", "Dykking", "Sportsdykking krever gyldig internasjonalt sertifikat (PADI, CMAS eller NAUI) for aktuell dybde; yrkesdykking er unntatt.", "1 og 3.1", 1],
]);

export const trygReiseFacts: Record<string, CatalogFact[]> = {
  trygReiseProduct: productFacts,
  trygReiseBase: base,
  trygReiseBaseSums: baseSums,
  trygReiseExtra: extra,
  trygReiseExtraSums: extraSums,
  trygReisePremium: premium,
  trygReisePremiumServices: premiumServices,
  trygReiseLegal: legal,
  trygReisePremiumLegal: premiumLegal,
  trygReiseAccident: accidentBasic,
  trygReiseAccidentExtra: accidentExtra,
  trygReiseAccidentPremium: accidentPremium,
  trygReiseSafety: safety,
};

export const trygReiseProducts: CatalogProduct[] = [
  { company: "Tryg", insuranceType: "Reise", name: "Reise", providerId: "tryg",
    productId: "tryg-reise", version: "2026-09-20-canonical", sourceId: "trygReiseBase",
    componentIds: ["trygReiseProduct", "trygReiseBase", "trygReiseBaseSums", "trygReiseSafety", "trygReiseLegal"] },
  { company: "Tryg", insuranceType: "Reise", name: "Reise Ekstra", providerId: "tryg",
    productId: "tryg-reise-ekstra", version: "2026-09-20-canonical", sourceId: "trygReiseExtra",
    componentIds: ["trygReiseExtra", "trygReiseExtraSums"], inheritsProductId: "tryg-reise" },
  { company: "Tryg", insuranceType: "Reise", name: "Reise Premium", providerId: "tryg",
    productId: "tryg-reise-premium", version: "2026-09-20-canonical", sourceId: "trygReisePremium",
    componentIds: ["trygReisePremium", "trygReisePremiumServices", "trygReisePremiumLegal", "trygReiseAccidentPremium"], inheritsProductId: "tryg-reise-ekstra" },
];

export const trygReiseAddOns: CatalogAddOn[] = [
  { id: "tryg-reise-ulykke", name: "Ulykke", componentId: "trygReiseAccident", providerId: "tryg",
    requiresLevel: ["tryg-reise"], insuranceTypes: ["Reise"], exclusiveGroup: "tryg-reise-ulykke" },
  { id: "tryg-reise-ulykke-ekstra", name: "Ulykke Ekstra", componentId: "trygReiseAccidentExtra", providerId: "tryg",
    requiresLevel: ["tryg-reise-ekstra"], insuranceTypes: ["Reise"], exclusiveGroup: "tryg-reise-ulykke" },
];
