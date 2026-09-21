import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

export const FRENDE_INNBO_TERMS_URL = "https://api.frende.no/documents/terms/public/pnc/ContentInsurance";
export const FRENDE_INNBO_IPID_URL = "https://www.frende.no/documents/194/IPID_Innbo.pdf";
export const FRENDE_GENERAL_URL = "https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf";

export const frendeInnboSources: Record<string, CatalogSource> = {
  frendeInnboStandard: {
    id: "frendeInnboStandard", company: "Frende", insuranceType: "Innbo",
    documentName: "Vilkår for innboforsikring", filename: "Vilkar_innboforsikring_01092026.pdf",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", url: FRENDE_INNBO_TERMS_URL,
    sha256: "608a09ff2513ac8756bd3cb12736a4d04e3dce51b87ca4a986c47b5ab2bc12db",
  },
  frendeInnboUhell: {
    id: "frendeInnboUhell", company: "Frende", insuranceType: "Innbo",
    documentName: "Vilkår for innboforsikring – Uhell punkt 11", filename: "Vilkar_innboforsikring_01092026.pdf",
    termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt", version: "Ikke oppgitt",
    effectiveFrom: "2026-09-01", url: FRENDE_INNBO_TERMS_URL,
    sha256: "608a09ff2513ac8756bd3cb12736a4d04e3dce51b87ca4a986c47b5ab2bc12db",
  },
  frendeInnboIpid: {
    id: "frendeInnboIpid", company: "Frende", insuranceType: "Innbo",
    documentName: "Innboforsikring – dokument med opplysninger om forsikringsproduktet",
    filename: "IPID_Innbo.pdf", termsNumber: "Ikke oppgitt", productCode: "Ikke oppgitt",
    version: "Ikke oppgitt", effectiveFrom: "Ikke oppgitt", updatedAt: "2025-01-01",
    url: FRENDE_INNBO_IPID_URL,
    sha256: "9aef7acd6b6f80c8ebea822ec9a8a9613e37a0d67e2bb37a5fbb665c53ae5057",
  },
  frendeInnboGeneral: {
    id: "frendeInnboGeneral", company: "Frende", insuranceType: "Innbo",
    documentName: "Generelle vilkår for alle skadeforsikringer i Frende",
    filename: "Generelle_vilkar-01012026.pdf", termsNumber: "Ikke oppgitt",
    productCode: "Ikke oppgitt", version: "Ikke oppgitt", effectiveFrom: "2026-01-01",
    url: FRENDE_GENERAL_URL,
    sha256: "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b",
  },
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (rows: Row[]): CatalogFact[] => rows.map(([key, label, value, sourceId, section, page,
  replacesBase, deductibleClassification]) => {
  const source = frendeInnboSources[sourceId];
  return {
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: sourceId, section, page, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: "Frende", url: source.url,
      productCode: source.productCode, version: source.version,
      note: "Forsikringsbeviset angir valgte dekninger, forsikringssum og generell egenandel",
    },
  };
});

export const frendeInnboFacts: Record<string, CatalogFact[]> = {
  frendeInnboStandard: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Ubegrenset med mindre en avtalt samlet forsikringssum står i forsikringsbeviset; dokumenterte særgrenser gjelder uansett", "frendeInnboStandard", "3.1 og 6.7", 2, false, "reference"],
    ["innbo.forsikrede", "Hvem som er forsikret", "Forsikringstaker, ektefelle eller registrert samboer, barn hjemme eller borte på grunn av utdanning/førstegangstjeneste uten adresseendring, og øvrige medlemmer av fast husstand; leietakere og bokollektiv er unntatt", "frendeInnboStandard", "1", 2],
    ["innbo.geografi", "Innbo – geografisk område", "Forsikringsstedet og midlertidig annet sted i Norden i inntil 12 måneder", "frendeInnboStandard", "2.1–2.2", 2],
    ["innbo.lagring.tid", "Midlertidig oppbevaring – tidsgrense", "Inntil 12 måneder på annet sted i Norden", "frendeInnboStandard", "2.2", 2],
    ["innbo.verdigjenstander.enkeltgjenstand.grense", "Enkeltgjenstand – grense", "500 000 kr per enkeltgjenstand", "frendeInnboStandard", "3.1", 3],
    ["innbo.kunst.grense", "Kunst – grense", "500 000 kr samlet", "frendeInnboStandard", "3.1", 3],
    ["innbo.samling.grense", "Samlinger – grense", "500 000 kr samlet per samling", "frendeInnboStandard", "3.1", 3],
    ["innbo.hobbyveksthus.grense", "Hobbydrivhus – grense", "40 000 kr på forsikringsstedet", "frendeInnboStandard", "3.1", 3],
    ["innbo.basseng.grense", "Frittstående badestamp og basseng – grense", "40 000 kr samlet på forsikringsstedet", "frendeInnboStandard", "3.1", 3],
    ["innbo.fritidsbat.grense", "Mindre fritidsbåt – grense", "40 000 kr samlet for fritidsbåt under 15 fot og påhengsmotor inntil 10 hk på forsikringsstedet", "frendeInnboStandard", "3.1", 3],
    ["innbo.kjoretoytilbehor.grense", "Tilhenger, løse deler og tilbehør til kjøretøy og båt – grense", "40 000 kr samlet på forsikringsstedet; dekk og felger er unntatt", "frendeInnboStandard", "3.1", 3],
    ["innbo.tilhenger.grense", "Bil- og båttilhenger – grense", "40 000 kr samlet med løse deler og tilbehør til kjøretøy og båt", "frendeInnboStandard", "3.1", 3],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "40 000 kr samlet i bygning på forsikringsstedet", "frendeInnboStandard", "3.1", 3],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "20 000 kr samlet inne i boenheten", "frendeInnboStandard", "3.1", 3],
    ["innbo.andres.grense", "Andres løsøre – grense", "100 000 kr på forsikringsstedet når sikrede har overtatt risikoen ved lov eller skriftlig avtale; andres penger og verdipapirer er unntatt", "frendeInnboStandard", "3.1", 3],
    ["innbo.luftvannsport.grense", "Luft- og vannsportutstyr – grense", "40 000 kr samlet for hangglider, paraglider, fallskjerm, droner, kano, kajakk og seilbrett", "frendeInnboStandard", "3.2", 3],
    ["innbo.motorredskap.grense", "Mindre motorredskap og arbeidsmaskin – grense", "40 000 kr samlet for maskin inntil 750 kg som ikke omfattes av bilansvarsloven", "frendeInnboStandard", "3.2", 3],
    ["sykkel.tyveri.grense", "Sykkel, elsykkel og sykkeltilhenger – grense", "Ubegrenset i bygning på forsikringsstedet; tyveri og hærverk andre steder inntil 40 000 kr per sykkel inkludert tilbehør", "frendeInnboStandard", "3.3", 3],
    ["sykkel.geografi", "Sykkel – geografisk område", "Forsikringsstedet og ellers i Norden innenfor vilkårets midlertidige område", "frendeInnboStandard", "2.2 og 3.3", 2],
    ["elsparkesykkel.unntak", "Liten elektrisk motorvogn", "Elsparkesykkel, segway og hoverboard er ikke omfattet som innbo", "frendeInnboStandard", "3.4", 3],
    ["brann.dekning", "Brann", "Brann, nedsoting, lynnedslag, elektrisk fenomen, eksplosjon og sprenging", "frendeInnboStandard", "5.1", 4],
    ["vann.dekning", "Vannskade", "Rør- og ledningsbrudd, vanninntrengning fra terreng/grunn når vann flyter over gulvet, og lekkasje fra innvendig ledning eller tilknyttet utstyr", "frendeInnboStandard", "5.1", 4],
    ["naturskade.dekning", "Naturskade", "Skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv og vulkanutbrudd etter naturskadeforsikringsloven", "frendeInnboStandard", "4.1 og 5.1", 4],
    ["naturskade.geografi", "Naturskade – geografisk område", "Norge etter naturskadeforsikringsloven", "frendeInnboStandard", "4.1 og 6.4", 4],
    ["tyveri.dekning", "Tyveri, innbrudd og hærverk", "Tyveri og hærverk etter straffeloven på og utenfor forsikringsstedet med oppbevaringsavhengige grenser", "frendeInnboStandard", "5.1", 4],
    ["tyveri.fellesbod.grense", "Tyveri fra bod i felles kjeller eller loft – grense", "100 000 kr", "frendeInnboStandard", "5.1", 4],
    ["tyveri.kjoretoy.grense", "Tyveri fra kjøretøy – grense", "40 000 kr på forsikringsstedet", "frendeInnboStandard", "5.1", 4],
    ["tyveri.uteareal.grense", "Tyveri fra ute- eller fellesareal ved bostedet – grense", "40 000 kr", "frendeInnboStandard", "5.1", 4],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "Forsikringssummene i punkt 3 i bebodd bolig; 40 000 kr i privat rom eller hos håndverker og 10 000 kr i garderobeskap", "frendeInnboStandard", "5.1", 5],
    ["ran.dekning", "Ran", "Skade og tap ved ran etter straffeloven § 327", "frendeInnboStandard", "5.1", 4],
    ["glass.sanitaer.grense", "Bygningsglass og sanitærporselen – grense", "40 000 kr for leietaker eller beboer i borettslag/sameie", "frendeInnboStandard", "5.1", 5],
    ["innbo.datalager.grense", "Rekonstruksjon av notater, tegninger og datalagre – grense", "30 000 kr", "frendeInnboStandard", "5.3", 5],
    ["innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige merutgifter i normal reparasjons- eller gjenoppføringstid; må avtales med Frende på forhånd", "frendeInnboStandard", "5.3", 5],
    ["innbo.vaesketap.grense", "Tap av vann, fyringsolje, annen væske eller gass – grense", "10 000 kr", "frendeInnboStandard", "5.3", 5],
    ["innbo.tilleggsinnredning.grense", "Tilleggsinnredning i leid bolig – grense", "100 000 kr når innredningen skades og leieforholdet avsluttes eller skaden ikke utbedres", "frendeInnboStandard", "5.3", 5],
    ["innbo.egenandel", "Generell egenandel", "Egenandelen står i forsikringsbeviset", "frendeInnboStandard", "6.7", 6, false, "reference"],
    ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr; samme egenandel ved vind svakere enn storm og vanninntrengning fra terreng eller grunn", "frendeInnboStandard", "6.7", 7, false, "override"],
    ["sykkel.egenandel", "Sykkel – egenandel", "Avtalt egenandel reduseres med 2 000 kr ved gyldig registrering i FG-godkjent sykkelregister", "frendeInnboStandard", "6.7", 7, false, "coverage"],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av veggedyr, kakerlakker, skjeggkre, andre skadeinsekter, rotter og mus på forsikringsstedet; leveres av Vis Forsikring", "frendeInnboStandard", "7", 7],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skadetilfelle", "frendeInnboStandard", "7.2", 7],
    ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr per skade", "frendeInnboStandard", "7.2", 7, false, "override"],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for person- og tingskade; angitte kjøretøy-, familie-, eiendoms- og virksomhetsunntak gjelder", "frendeInnboStandard", "8", 8],
    ["ansvar.geografi", "Privatansvar – geografisk område", "Norden", "frendeInnboStandard", "2.2", 2],
    ["ansvar.grense", "Privatansvar – forsikringssum", "5 000 000 kr per skadetilfelle og samlet per år", "frendeInnboStandard", "8.4", 9],
    ["ansvar.egenandel", "Privatansvar – egenandel", "6 000 kr per skadetilfelle", "frendeInnboStandard", "8.4", 9, false, "override"],
    ["rettshjelp.dekning", "Rettshjelp", "Refusjon av rimelige og nødvendige utgifter til juridisk bistand ved dokumentert tvist knyttet til bolighus eller leilighet", "frendeInnboStandard", "9", 9],
    ["rettshjelp.geografi", "Rettshjelp – geografisk område", "Norden", "frendeInnboStandard", "2.2 og 9", 2],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist; 250 000 kr ved minst tre parter og 1 000 000 kr ved minst 20 parter på samme side", "frendeInnboStandard", "9.4", 10],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av øvrige kostnader; godkjent Mekle-tjeneste er uten egenandel", "frendeInnboStandard", "9.2 og 9.4", 10, false, "override"],
    ["idtyveri.dekning", "ID-sikring", "Gratis praktisk bistand og rådgivning fra Mehrwerk for å oppdage, kartlegge og begrense ID-tyveri; økonomisk tap, nye ID-papirer og advokatbistand er unntatt", "frendeInnboStandard", "10 og 10.3", 11],
    ["idtyveri.geografi", "ID-sikring – geografisk område", "Norden", "frendeInnboStandard", "2.2 og 10", 2],
    ["nettmisbruk.dekning", "Hjelp ved nettmisbruk", "Gratis rådgivning og praktisk hjelp fra Mehrwerk til å forsøke å fjerne krenkende innhold, falske profiler og hackede kontoer; økonomisk tap er unntatt", "frendeInnboStandard", "10.2–10.3", 11],
    ["sikkerhet.brann", "Sikkerhetsforskrift – brann", "Røykvarsler og slokkeutstyr skal følge forskriftene; brannfarlige stoffer og gassutstyr skal sikres og vedlikeholdes", "frendeInnboStandard", "14", 13],
    ["sikkerhet.tyveri", "Sikkerhetsforskrift – låsing og oppbevaring", "Dører skal låses, vinduer lukkes og nøkler/koder holdes utilgjengelige; ting utenfor boenheten skal oppbevares forsvarlig", "frendeInnboStandard", "14", 13],
    ["sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "Sykkel og elsykkel skal låses, nøkkelen oppbevares separat og sykkeltilhengeren låses fast", "frendeInnboStandard", "14", 13],
    ["sikkerhet.vann", "Sikkerhetsforskrift – vann, snø og frost", "Vann-, snø- og frostsikringskrav i punkt 14 skal følges", "frendeInnboStandard", "14", 14],
  ]),
  frendeInnboUhell: facts([
    ["uhell.dekning", "Uhell", "Tyveri eller skade ved plutselig og uforutsett ytre hendelse som sikrede ser idet den skjer; dekningen må stå i forsikringsbeviset", "frendeInnboUhell", "11 og 11.3", 12],
    ["uhell.hjem.grense", "Uhell hjemme – grense", "Ubegrenset med mindre en egen sum står i forsikringsbeviset", "frendeInnboUhell", "11.3", 12],
    ["uhell.grense", "Uhell utenfor hjemmet – grense", "40 000 kr", "frendeInnboUhell", "11.3", 12],
    ["uhell.geografi", "Uhell – geografisk område", "Hele verden når innboforsikringen gjelder hjemmet; for hytte bare forsikringsstedet", "frendeInnboUhell", "2.2–2.3", 2],
    ["flytting.transport.grense", "Skade ved flytting", "100 000 kr samlet ved flytting til nytt forsikringssted innen Norden, under transport og inn- eller utbæring", "frendeInnboUhell", "11.3", 12],
    ["uhell.egenandel", "Uhell – egenandel", "2 000 kr ved skade inntil 40 000 kr; ved skade over 40 000 kr og fra andre skade i forsikringsåret gjelder egenandelen i forsikringsbeviset", "frendeInnboUhell", "6.7", 7, false, "override"],
    ["uhell.unntak", "Uhell – viktige unntak", "Penger, luft- og vannsportutstyr, kjøretøy/tilbehør, droner, sykkel/elsykkel, yrkesløsøre, utlånte/utleide og sendte ting er unntatt; mistet eller gjenglemt ting dekkes ikke", "frendeInnboUhell", "11.2 og 11.4", 12],
  ]),
};

export const frendeInnboProducts: CatalogProduct[] = [{
  company: "Frende", insuranceType: "Innbo", name: "Standard", providerId: "frende",
  productId: "frende-innbo-standard", version: "2026-09-01", sourceId: "frendeInnboStandard",
  componentIds: ["frendeInnboStandard"],
}];

export const frendeInnboAddOns: CatalogAddOn[] = [{
  id: "frende-innbo-uhell", name: "Uhellsdekning", componentId: "frendeInnboUhell",
  providerId: "frende", insuranceTypes: ["Innbo"], requiresLevel: ["frende-innbo-standard"],
}];
