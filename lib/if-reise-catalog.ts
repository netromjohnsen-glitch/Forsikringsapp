import type { CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { ifReiseSources } from "./if-reise-sources.ts";
export { ifReiseSources } from "./if-reise-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const source = ifReiseSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `reise.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: source.id, section, page, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url,
      productCode: source.productCode, version: source.version,
      note: "Forsikringsbeviset går foran vilkårene og avgjør valgt nivå, personkrets, område, reisevarighet, summer, egenandeler og særvilkår." },
  }));
}

const common = facts("ifReiseTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset går foran vilkårene og angir nivå, hvem som er forsikret, område, valgt reisevarighet, summer, egenandeler og særvilkår.", "Innledning", 3],
  ["personer.omfang", "Enkeltperson eller familie", "Kan velges for forsikringstaker alene eller familie. Familie omfatter ektefelle/samboer med samme folkeregistrerte adresse og barn under 21 år; forsikringsbeviset avgjør personkretsen.", "1 Generelt og IPID", 3],
  ["omrade.verden", "Geografisk område", "Valgt område er Norden eller hele verden. Gjelder ikke hjemme, på undervisningssted eller jobb. Ansvar og rettshjelp krever verdensdekning og reise utenfor Norden.", "1 Generelt og IPID", 3],
  ["varighet.valg", "Kundespesifikt varighetsvalg", "45 eller 90 sammenhengende dager per utenlandsreise etter forsikringsbeviset. Historisk 180-dagersinformasjon er ikke aktiv i gjeldende IPID.", "IPID – hvilken forsikring", 1],
  ["varighet.norge", "Reisevarighet i Norge", "Ubegrenset antall dager per reise i Norge.", "IPID – hvilken forsikring", 1],
  ["overnatting", "Reise med eller uten overnatting", "Forsikringen gjelder fra du forlater hjemmet; ordinær reise krever ikke overnatting, men enkelte Super-dekninger krever feriereise med minst én overnatting.", "1 Generelt", 3],
  ["tjenestereise", "Jobbreise", "Ordinært reiseomfang kan gjelde uten at reisen er ferie, men avbestilling, tapt ferie og enkelte Super-ytelser gjelder ikke jobbreiser.", "2–5", 5],
  ["medisinsk.behandling", "Sykdom og ulykkesskade på reise", "Rimelige, nødvendige og dokumenterte utgifter ved uventet akutt sykdom eller alvorlig ulykkesskade: lege, sykehus, medisiner og behandling. Ingen generell øvre sum og ingen egenandel.", "5.1–5.2", 13],
  ["medisinsk.tann", "Tannbehandling", "Nødvendig tannbehandling ved akutt tannsykdom eller ulykkesskade dekkes inntil 5 000 kr per skadetilfelle.", "5.2.1", 13],
  ["hjemtransport", "Hjemtransport", "Rimelige og nødvendige utgifter ved medisinsk nødvendig, forhåndsgodkjent hjemtransport; også ledsagelse og hjemtransport av kiste eller urne. Begravelse på stedet kan erstattes inntil 40 000 kr.", "5.2.2 og 5.4", 14],
  ["evakuering", "Evakuering", "Nødvendige merutgifter til reise og overnatting til nærmeste sikre destinasjon eller hjemsted i Norge etter ordre/råd fra myndigheter ved krig, terror, politisk uro eller naturkatastrofe; ingen generell øvre sum.", "6", 17],
  ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for person- eller tingskade på reise utenfor Norden når verdensdekning er valgt. Motorvogn og flere kontrakts-/tingstilfeller er unntatt.", "7", 17],
  ["ansvar.sum", "Privatansvar – sum", "10 000 000 kr per skadetilfelle; saksomkostninger kommer i tillegg.", "7.3.2", 19],
  ["rettshjelp.dekning", "Rettshjelp", "Juridisk bistand ved privat tvist som oppstår under reise utenfor Norden når verdensdekning er valgt.", "8", 19],
  ["rettshjelp.sum", "Rettshjelp – sum", "100 000 kr per tvist; samlet 250 000 kr når minst tre parter har vesentlig samme problemstillinger.", "8.1", 19],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "ERA3-4 oppgir ingen særskilt egenandel for rettshjelp. Eventuell kundespesifikk egenandel må leses fra forsikringsbeviset.", "8", 19],
  ["idtyveri.dekning", "ID-tyveri", "Rimelig og nødvendig juridisk bistand ved dokumentert identitetstyveri, blant annet forebygging av videre misbruk og fjerning av uberettigede betalingsanmerkninger.", "9", 21],
  ["idtyveri.juridisk", "ID-tyveri – juridisk bistand", "Inntil 1 000 000 kr per identitetstyverihendelse. Økonomisk tap utover juridisk bistand er ikke dekket.", "9.1–9.3", 21],
  ["ulykke.dekning", "Ulykkeskapital", "Ikke inkludert: reiseforsikringen dekker behandlingsutgifter ved ulykkesskade, men gir ikke kapitalutbetaling ved varig medisinsk invaliditet eller dødsfall.", "Produktoversikt og produktside", 2],
  ["medisinsk.kjent", "Kjent sykdom", "Forverring eller komplikasjon ved sykdom/lidelse kjent før avreise er ikke dekket som uventet akutt sykdom. For avbestilling er skjæringstidspunktet før reisen ble betalt. Ifs helsesjekk kan brukes som forhåndsvurdering.", "2.2.1 og 5.3", 6],
  ["aktivitet.unntak", "Sport og ekspedisjon", "Medisinske utgifter ved blant annet dykking, klatring, tandemhopp og frikjøring kan omfattes. Ekspedisjoner og turer med dårlig infrastruktur, lang avstand til sykehus eller vanskelig transport krever særskilt tilleggsforsikring.", "12", 23],
  ["omrade.ud", "UD, krig og terror", "Områder med offisielt UD-reiseråd er unntatt etter vilkårets tidsregler. Avbestilling krever at rådet fortsatt gjelder 72 timer før avreise; evakuering har egne hendelsesvilkår.", "2.2.7 og 6", 6],
  ["sikkerhet.reisegods", "Sikkerhetsforskrifter", "Personlige eiendeler skal være under tilsyn, forsvarlig oppbevart, låst, emballert og korrekt innsjekket; verdigjenstander skal ikke ligge i innsjekket bagasje. Ved forsinkelse må tilstrekkelig tid beregnes.", "3.1.2 og 4.4", 8],
]);

const services = facts("ifReiseHelp", [
  ["tjeneste.legehjelp", "Digital legetime", "Kostnadsfri videosamtale med norsk lege når fysisk oppmøte ikke er nødvendig; normalt kontakt innen 20 minutter, åpent 07–22 norsk tid og resept i EU når medisinsk relevant. Tjeneste, ikke forsikringssum.", "Slik får du hjelp", 1],
  ["tjeneste.alarm", "If reisehjelp", "Døgnåpen assistanse året rundt med veiledning, medisinsk koordinering og anbefalt godkjent lege eller sykehus. If skal kontaktes ved alvorlig hendelse, operasjon eller forventede utgifter over 10 000 kr.", "Hjelp på reisen", 1],
]);

const basis = facts("ifReiseTerms", [
  ["avbestilling.dekning", "Avbestilling", "Ikke inkludert i Basis.", "Produktoversikt", 2],
  ["forsinkelse.rute", "Forsinkelse", "Ikke inkludert i Basis.", "Produktoversikt", 2],
  ["bagasje.forsinket", "Forsinket bagasje", "Ikke inkludert i Basis.", "Produktoversikt", 2],
  ["bagasje.dekning", "Personlige eiendeler", "Ikke inkludert i Basis.", "Produktoversikt", 2],
  ["reiseavbrudd", "Tapt ferie", "Ikke inkludert i Basis.", "Produktoversikt", 2],
  ["leiebil.egenandel", "Leiebilegenandel", "Ikke inkludert i Basis.", "Produktoversikt", 2],
]);

const standard = facts("ifReiseTerms", [
  ["avbestilling.dekning", "Avbestilling", "Ubegrenset forsikringssum for ikke-refunderbare reisekostnader ved dokumenterte årsaker som akutt sykdom, alvorlig ulykkesskade, dødsfall, boligskade, UD-råd og naturkatastrofe. Ingen egenandel; jobbreiser er unntatt.", "2", 5, undefined, true],
  ["forsinkelse.rute", "Forsinket avgang og fremmøte", "Nødvendige merutgifter til overnatting og innhenting av fastlagt reiserute. Alternativ transport ved forsinket offentlig transport er begrenset til 3 000 kr per person.", "3.1", 7, undefined, true],
  ["bagasje.forsinket", "Forsinket bagasje", "Nødvendige innkjøp på utreise: 5 000 kr per person og 25 000 kr per familie. Ufrivillig transitt med overnatting: 1 000/5 000 kr. PIR og originalkvitteringer kreves; hjemreise er unntatt.", "3.3", 9, undefined, true],
  ["bagasje.dekning", "Personlige eiendeler", "Tyveri, ran, hærverk, naturskade, trafikkskade, brann/vann og transportørbekreftet tap eller skade. Ingen samlet øvre sum, men objekt- og kategorigrenser gjelder.", "4.1–4.3", 10, undefined, true],
  ["bagasje.total", "Reisegods – samlet sum", "Ingen samlet øvre sum per hendelse; dokumenterte kategori- og enkeltgjenstandsgrenser gjelder.", "4.1 og 4.3", 10],
  ["bagasje.per_gjenstand", "Reisegods – enkeltgjenstand", "40 000 kr per gjenstand med tilbehør. Penger: 5 000 kr per person/10 000 kr per familie; klokker, smykker og edelmetall: 30 000 kr per skadetilfelle.", "4.3", 11],
  ["bagasje.uhell", "Uhell på eiendeler", "Ikke inkludert i Standard utover de navngitte skadeårsakene.", "4.2.9", 11],
  ["reiseavbrudd", "Kompensasjon for tapt ferie", "Kompensasjon etter dokumentert reisepris og forholdet mellom tapte og planlagte dager ved godkjent hjemreise/evakuering eller minst ett døgn på sykehus. Ingen generell øvre sum.", "5.2.5–5.2.6", 14, undefined, true],
]);

const superFacts = facts("ifReiseTerms", [
  ["avbestilling.turisttjeneste", "Avlyst turisttjeneste", "Når en forhåndsbetalt offentlig turisttjeneste på reisemålet avlyses eller flyttes utenfor reiseperioden: reise- og overnattingsutgifter inntil 5 000 kr per person og 25 000 kr per familie. Super må ha vært aktiv ved betaling, og refusjon fra leverandør går foran.", "2.2.9", 6],
  ["bagasje.uhell", "Uhell på eiendeler", "Plutselig og uforutsett fysisk skade med kjent ytre årsak og bestemt tidspunkt. Gjenstanden må kunne fremvises; mistet/gjenglemt, kosmetisk og intern mekanisk skade uten ytre årsak omfattes ikke.", "4.2.9", 11, undefined, true],
  ["bagasje.uhell_sum", "Uhell – sum", "Innenfor dokumenterte gjenstandsgrenser, normalt 40 000 kr per gjenstand.", "4.2.9 og 4.3", 11],
  ["bagasje.uhell_egenandel", "Uhell – egenandel", "3 000 kr per skadetilfelle.", "4.2.9", 11, "override"],
  ["bagasje.forsinket_super", "Utvidet forsinket bagasje", "Ytterligere 5 000 kr per person/25 000 kr per familie for spesialbagasje, og samme tilleggsgrense når bagasjen fortsatt er savnet fem dager etter ankomst.", "3.3.1", 9],
  ["forsinkelse.hotell_arrangement", "Tapt hotell og turisttjeneste", "Ved minst åtte timers forsinket ankomst: inntil 5 000 kr per person for tapt hotell eller turisttjeneste. Jobbreise og refunderbare kostnader er unntatt.", "3.2", 8],
  ["forsinkelse.leiebilavtale", "Tapt leieavtale", "Ved minst 1,5 timers forsinket ankomst til hentetid: kansellert forhåndsbetalt leieavtale for bil eller motorsykkel inntil 10 000 kr per skadetilfelle.", "3.2", 8],
  ["leiebil.egenandel", "Egenandel leid kjøretøy", "Egenandel ved skade på leid bil, motorsykkel, sykkel eller elsykkel, eller tap av tilhørende nøkkel, på feriereise med minst én overnatting og dokumentert leieavtale.", "10", 21, undefined, true],
  ["leiebil.egenandel_sum", "Leiebilegenandel – sum", "Ingen generell øvre forsikringssum; belastet og dokumentert egenandel etter gyldig leiekontrakt styrer.", "10.1", 22],
  ["ansvar.sum", "Privatansvar – sum", "15 000 000 kr per skadetilfelle; saksomkostninger kommer i tillegg.", "7.3.2", 19, undefined, true],
  ["skadedyr.dekning", "Skadedyr etter utenlandsreise", "Anticimex-ledet bekjempelse i fast bolig etter dokumenterbar utenlandsreise, inntil 100 000 kr per skadetilfelle og 2 000 kr egenandel.", "11", 22],
]);

const smartDelay = facts("ifReiseSmartDelay", [["tjeneste.lounge", "SmartDelay+",
  "Super-tjeneste: flyreisen registreres minst 24 timer før avreise. Ved mer enn én times registrert forsinkelse får sikrede og inntil fire medreisende lounge/andre flyplasstjenester eller 40 euro per person. Kansellering er ikke forsinkelse.",
  "SmartDelay+", 1]]);

export const ifReiseFacts: Record<string, CatalogFact[]> = {
  ifReiseCommon: common, ifReiseServices: services, ifReiseBasis: basis,
  ifReiseStandard: standard, ifReiseSuper: superFacts, ifReiseSmartDelay: smartDelay,
};

export const ifReiseProducts: CatalogProduct[] = [
  { company: "If", insuranceType: "Reise", name: "Basis", providerId: "if", productId: "if-reise-basis",
    version: "2026-09-20-canonical", sourceId: "ifReiseTerms", componentIds: ["ifReiseCommon", "ifReiseServices", "ifReiseBasis"] },
  { company: "If", insuranceType: "Reise", name: "Standard", providerId: "if", productId: "if-reise-standard",
    version: "2026-09-20-canonical", sourceId: "ifReiseTerms", componentIds: ["ifReiseStandard"], inheritsProductId: "if-reise-basis" },
  { company: "If", insuranceType: "Reise", name: "Super", providerId: "if", productId: "if-reise-super",
    version: "2026-09-20-canonical", sourceId: "ifReiseTerms", componentIds: ["ifReiseSuper", "ifReiseSmartDelay"], inheritsProductId: "if-reise-standard" },
];

export const ifReiseAddOns = [];
