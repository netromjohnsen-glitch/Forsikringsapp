import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const fullTermsUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Innboforsikring";
const liabilityUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?dt=2021-06-12&vilkaar=SV006";
const ipidUrl = "https://if.no/apps/vilkarsbasendokument/IPID?ipid=Innboforsikring";
const generalUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Generelle_vilk%C3%A5r";

const source = (id: string, filename: string, termsNumber: string, effectiveFrom: string,
  url: string, sha256: string): CatalogSource =>
  ({ id, company: "If", filename, termsNumber, effectiveFrom, url, sha256 });

const innboSource = (id: string): CatalogSource => source(id, "If_Innboforsikring_IBO2-1.pdf", "IBO2-1",
  "2022-06-01", fullTermsUrl, "0d5aaf3702020ca458bb9af64c0a089b488a41f11198e07368699ff2d57ec270");

export const ifInnboSources: Record<string, CatalogSource> = {
  ifInnboShared: innboSource("ifInnboShared"),
  ifInnboBasis: innboSource("ifInnboBasis"),
  ifInnboUtvidet: innboSource("ifInnboUtvidet"),
  ifInnboSuper: innboSource("ifInnboSuper"),
  ifInnboTerms: innboSource("ifInnboTerms"),
  ifInnboLiability: source("ifInnboLiability", "If_Ansvar_Rettshjelp_SV006.pdf", "S-006 / SV006",
    "2021-06-01", liabilityUrl, "7edf14be25afedc260ad602f87ddc7ba6c58c038bcbeaacc0bbf6301a0f15ceb"),
  ifInnboIpid: source("ifInnboIpid", "If_IPID_Innboforsikring.pdf", "Ikke oppgitt",
    "Ikke oppgitt", ipidUrl, "03af9f3bbd86afddb11e78fb1706f140492af668efcf374089edd2ef03492100"),
  ifInnboGeneral: source("ifInnboGeneral", "If_Generelle_vilkar_GEN2-9.pdf", "GEN2-9",
    "2025-06-01", generalUrl, "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046"),
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];

const facts = (rows: Row[]): CatalogFact[] => rows.map(([key, label, value, sourceId, section, page,
  replacesBase, deductibleClassification]) => {
  const metadata = ifInnboSources[sourceId];
  return {
    key, label, value,
    ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: sourceId, section, page, filename: metadata.filename, termsNumber: metadata.termsNumber,
      effectiveFrom: metadata.effectiveFrom, company: "If", url: metadata.url,
    },
  };
});

export const ifInnboFacts: Record<string, CatalogFact[]> = {
  ifInnboShared: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Forsikringssummen fremgår av forsikringsbeviset; ubegrenset forsikringssum gjelder bare når dette er avtalt", "ifInnboShared", "3.1, 3.4 og 5.1", 4, false, "reference"],
    ["innbo.verdigjenstander.sammensatte_grenser", "Verdigjenstander og enkeltgjenstander – særgrenser ved ubegrenset sum", "500 000 kr for hver angitt kategori og per enkeltgjenstand/samling; høyere sum kan avtales", "ifInnboShared", "3.4", 6],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "10 000 kr samlet", "ifInnboShared", "3.1", 4],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "40 000 kr samlet", "ifInnboShared", "3.1", 4],
    ["innbo.datalager.grense", "Rekonstruksjon av datalagre mv. – grense", "40 000 kr samlet", "ifInnboShared", "3.2.5", 5],
    ["innbo.tilleggsinnredning.grense", "Egen tilleggsinnredning i leiet bolig – grense", "100 000 kr", "ifInnboShared", "3.2.6", 5],
    ["innbo.egenandel", "Generell egenandel", "4 000 kr per skadetilfelle, med mindre annen egenandel er avtalt eller særskilt bestemt", "ifInnboShared", "5.4", 13, false, "standard"],
    ["naturskade.dekning", "Naturskade", "Skred, storm, flom, stormflo, jordskjelv og vulkanutbrudd etter naturskadeforsikringsloven", "ifInnboShared", "4.3", 6],
    ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr, fastsatt av Justis- og beredskapsdepartementet", "ifInnboShared", "5.4", 13, false, "override"],
    ["idtyveri.dekning", "ID-tyveri", "Rimelig og nødvendig bistand til forebygging av videre misbruk og fjerning av uberettigede betalingsanmerkninger", "ifInnboShared", "4.14", 11],
    ["idtyveri.grense", "ID-tyveri – grense", "1 000 000 kr per skadetilfelle for juridisk assistanse; annet økonomisk tap er unntatt", "ifInnboShared", "4.14", 11],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar for person- og tingskade voldt som privatperson", "ifInnboLiability", "2.3–2.4", 3],
    ["ansvar.geografi", "Privatansvar – geografisk område", "Norden", "ifInnboLiability", "2.2", 3],
    ["ansvar.grense", "Privatansvar – forsikringssum", "5 000 000 kr per skadetilfelle; saksomkostninger dekkes i tillegg", "ifInnboLiability", "2.6", 4],
    ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr per skadetilfelle", "ifInnboLiability", "2.7", 4, false, "override"],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter ved tvist der sikrede er part som privatperson", "ifInnboLiability", "1.3–1.4", 1],
    ["rettshjelp.geografi", "Rettshjelp – geografisk område", "Norden, med mindre annet fremgår av forsikringsbeviset", "ifInnboLiability", "1.2", 1],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist; 250 000 kr når minst tre parter står på samme side", "ifInnboLiability", "1.6", 2],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av det overskytende", "ifInnboLiability", "1.7", 2, false, "override"],
    ["sikkerhet.brann", "Sikkerhetsforskrift – brann", "Boligen skal ha røykvarsler og slokkeutstyr i samsvar med brannforskriftene", "ifInnboShared", "6.4.1", 15],
    ["sikkerhet.tyveri", "Sikkerhetsforskrift – låsing og oppbevaring", "Oppbevaringssted skal lukkes og låses; særlig tyveriutsatte gjenstander har egne oppbevaringskrav", "ifInnboShared", "6.4.2", 15],
    ["sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "Sykkel skal være låst når den ikke er i bruk; lett demonterbart tilbehør skal ikke etterlates", "ifInnboShared", "6.4.2", 15],
  ]),
  ifInnboBasis: facts([
    ["innbo.geografi", "Innbo – geografisk område", "Forsikringsstedet", "ifInnboBasis", "2", 4],
    ["innbo.opphold.grense", "Opphold utenfor hjemmet – grense", "Hotell inntil 100 000 kr; øvrige nødvendige merutgifter uten sumbegrensning", "ifInnboBasis", "3.2.2", 5],
    ["brann.dekning", "Brann", "Brann (ild som har kommet løs), plutselig nedsoting og eksplosjon", "ifInnboBasis", "4.1", 6],
    ["elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag og overspenning", "ifInnboBasis", "4.2", 6],
    ["vann.dekning", "Vannskade", "Plutselig utstrømming fra rør med tilknyttet utstyr, akvarium eller slokkeapparat, og vann som plutselig trenger inn", "ifInnboBasis", "4.4", 7],
    ["innbo.vaesketap.grense", "Tap av vann, gass eller annen væske – grense", "40 000 kr ved plutselig utstrømming", "ifInnboBasis", "4.4", 7],
    ["tyveri.dekning", "Tyveri, ran og skadeverk", "Tyveri på forsikringsstedet, ran/overfall på forsikringsstedet og forsettlig skadeverk", "ifInnboBasis", "4.5", 7],
    ["tyveri.fellesbod.grense", "Tyveri fra bod med adgang fra fellesareal – grense", "100 000 kr per hendelse", "ifInnboBasis", "4.5.1", 7],
    ["tyveri.fellesgarasje.grense", "Tyveri fra fellesgarasje og fellesrom – grense", "40 000 kr per hendelse", "ifInnboBasis", "4.5.1", 7],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "40 000 kr per hendelse", "ifInnboBasis", "4.5.1", 7],
  ]),
  ifInnboUtvidet: facts([
    ["innbo.geografi", "Innbo – geografisk område", "Norden for ting midlertidig utenfor forsikringsstedet i inntil 2 år, ting for salg og nytt bosted; enkelte objekter bare på forsikringsstedet", "ifInnboUtvidet", "2", 4, true],
    ["innbo.lagring.annenbygning.grense", "Permanent lagring i annen bygning – grense", "40 000 kr totalt i Norden", "ifInnboUtvidet", "2", 4],
    ["glass.sanitaer.dekning", "Glassruter og sanitærporselen", "Bruddskade på glassruter og sanitærporselen", "ifInnboUtvidet", "4.8", 8],
    ["glass.sanitaer.begrensning", "Glass og sanitærporselen – begrensninger", "Riper, rifter, skraper, hakk og avskalling er unntatt, det samme er utett innfatning for isolerglass, glass eller sanitærporselen knyttet til næringsvirksomhet og hobbyveksthus.", "ifInnboUtvidet", "4.8", 8],
    ["flytting.transport.grense", "Skade ved flytting", "Plutselig ytre skade ved transport samt inn- og utbæring til ny bolig eller fritidsbolig", "ifInnboUtvidet", "4.9", 8],
    ["uhell.dekning", "Uhell", "Annen fysisk skade ved plutselig ytre årsak; utenfor forsikringsstedet inntil 40 000 kr per skadetilfelle", "ifInnboUtvidet", "4.10", 9],
    ["uhell.geografi", "Uhell – geografisk område", "Norden", "ifInnboUtvidet", "2 og 4.10", 4],
    ["uhell.egenandel", "Uhell – egenandel", "4 000 kr per skadetilfelle, med mindre annen egenandel er avtalt", "ifInnboUtvidet", "5.4", 13, false, "standard"],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "40 000 kr per hendelse på dokumenterte steder i Norden", "ifInnboUtvidet", "2 og 4.5.1", 7],
    ["sykkel.tyveri.grense", "Sykkel, elsykkel, sykkeltilhenger og barnevogn – tyverigrense", "40 000 kr per sykkel eller barnevogn utenfor forsikringsstedet", "ifInnboUtvidet", "4.5.1", 7],
    ["utleie.dekning", "Utleieforsikring", "Skadeverk, tyveri/underslag, misligholdt husleie og nødvendige utkastelsesutgifter ved dokumentert privat utleie", "ifInnboUtvidet", "4.5 og 4.11", 9],
    ["utleie.husleietap.grense", "Utleie – tapt husleieinntekt – grense", "Inntil 6 måneders husleie, én gang per leietaker", "ifInnboUtvidet", "4.11.1", 10],
    ["utleie.utkastelse.grense", "Utleie – utkastelsesutgifter – grense", "20 000 kr", "ifInnboUtvidet", "4.11.2", 10],
    ["utleie.sikkerhetskrav", "Utleie – krav til avtale og sikkerhet", "Skriftlig husleieavtale og innbetalt depositum eller bankgaranti tilsvarende minst 2 måneders leie før innflytting", "ifInnboUtvidet", "4.11", 9],
    ["utleie.egenandel", "Utleie – egenandel", "3 måneders husleie; ved tyveri, underslag og skadeverk er egenandelen det høyeste av 10 000 kr og depositum/bankgaranti", "ifInnboUtvidet", "5.4", 13, false, "override"],
    ["ulykke.boligtilpasning.grense", "Tilpasning av bolig etter ulykke – grense", "250 000 kr ved minst 50 % varig medisinsk invaliditet; utgifter må påløpe innen 5 år", "ifInnboUtvidet", "4.13", 10],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av gnagere og skadeinsekter i fast bolig eller fritidsbolig i Norge, utført og ledet av Anticimex", "ifInnboUtvidet", "4.15", 11],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skadetilfelle", "ifInnboUtvidet", "4.15", 11],
    ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr; ingen egenandel på angitt telefonrådgivning, artsbestemmelse eller tilsendte midler", "ifInnboUtvidet", "5.4", 13, false, "override"],
    ["sikkerhet.utleie", "Sikkerhetsforskrift – utleie", "Varsel, begjæring om utkastelse og melding til If må skje innen de angitte fristene", "ifInnboUtvidet", "6.4.5", 16],
    ["sikkerhet.skadedyr", "Sikkerhetsforskrift – skadedyr", "Krav til forebyggende tiltak og inspeksjoner avtalt med Anticimex eller If skal følges", "ifInnboUtvidet", "6.4.6", 16],
  ]),
  ifInnboSuper: facts([
    ["innbo.opphold.grense", "Opphold utenfor hjemmet – grense", "Nødvendige merutgifter uten sumbegrensning, også hotell", "ifInnboSuper", "3.2.2", 5, true],
    ["innbo.hvitevarer.integrert.grense", "Integrerte hvitevarer – grense", "40 000 kr per hendelse", "ifInnboSuper", "3.1", 5],
    ["innbo.fryserinnhold.grense", "Innhold i fryser – grense", "40 000 kr ved dokumentert utilsiktet temperaturstigning", "ifInnboSuper", "4.7", 8],
    ["bunad.dekning", "Bunadsforsikring", "Plutselig ytre skade eller dokumentert tap av bunad med tilbehør", "ifInnboSuper", "4.12", 10],
    ["bunad.grense", "Bunad – grense", "500 000 kr", "ifInnboSuper", "4.12", 10],
    ["bunad.geografi", "Bunad – geografisk område", "Hele verden", "ifInnboSuper", "2", 4],
    ["bunad.egenandel", "Bunad – egenandel", "500 kr", "ifInnboSuper", "5.4", 14, false, "override"],
    ["uhell.egenandel", "Uhell – egenandel", "2 000 kr per skadet gjenstand, maksimalt 4 000 kr per skadetilfelle", "ifInnboSuper", "5.4", 13, true, "override"],
    ["tyveri.egenandel", "Tyveri, ran og skadeverk – egenandel", "2 000 kr per skadet gjenstand, maksimalt 4 000 kr per skadetilfelle", "ifInnboSuper", "5.4", 13, false, "override"],
    ["garanti.super", "Supergaranti", "IPID opplyser at Super garanterer like gode eller bedre vilkår enn forrige selskap; garantien endrer ikke katalogens konkrete verdier", "ifInnboIpid", "Super dekker i tillegg", 1],
  ]),
};

export const ifInnboProducts: CatalogProduct[] = [
  { company: "If", insuranceType: "Innbo", name: "Basis", providerId: "if", productId: "if-innbo-basis", version: "IBO2-1", sourceId: "ifInnboTerms", componentIds: ["ifInnboShared", "ifInnboBasis"] },
  { company: "If", insuranceType: "Innbo", name: "Utvidet", providerId: "if", productId: "if-innbo-utvidet", version: "IBO2-1", sourceId: "ifInnboTerms", inheritsProductId: "if-innbo-basis", componentIds: ["ifInnboUtvidet"] },
  { company: "If", insuranceType: "Innbo", name: "Super", providerId: "if", productId: "if-innbo-super", version: "IBO2-1", sourceId: "ifInnboTerms", inheritsProductId: "if-innbo-utvidet", componentIds: ["ifInnboSuper"] },
];
