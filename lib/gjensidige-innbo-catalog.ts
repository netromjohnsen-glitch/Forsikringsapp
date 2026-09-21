import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const standardUrl = "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Innbo-Standard-alminnelige%20vilkar.pdf";
const plusUrl = "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Innbo-Pluss-alminnelige-vilkar.pdf";
const ipidUrl = "https://www.gjensidige.no/ipid/gfno/EAP02";

const source = (id: string, filename: string, termsNumber: string, url: string, sha256: string,
  productCode = "EAP02"): CatalogSource => ({
  id, company: "Gjensidige", filename, termsNumber, effectiveFrom: "Ikke oppgitt",
  productCode, version: "Ikke oppgitt", url, sha256,
});
const standardSource = (id: string) => source(id, "Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf",
  "Ikke oppgitt", standardUrl, "df7af2a169d293e22df138e6561c4c34da854d4923596a828e14bcea7f28cf20");
const plusSource = (id: string) => source(id, "Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf",
  "Ikke oppgitt", plusUrl, "4e10857cb9b7832b5661d48089a6024c3622a499d66156b6122f2010574787a1");

export const gjensidigeInnboSources: Record<string, CatalogSource> = {
  gjInnboShared: standardSource("gjInnboShared"),
  gjInnboStandard: standardSource("gjInnboStandard"),
  gjInnboPlus: plusSource("gjInnboPlus"),
  gjInnboUtleie: plusSource("gjInnboUtleie"),
  gjInnboSykkelUtvidelse: plusSource("gjInnboSykkelUtvidelse"),
  gjInnboIpid: source("gjInnboIpid", "Gjensidige_IPID_Innbo_EAP02.pdf", "EAP02", ipidUrl,
    "7610a939488c74d4cf0162b0945cc1825779b0d7765847bf522f0c651d6dcf6f"),
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (rows: Row[]): CatalogFact[] => rows.map(([key, label, value, sourceId, section, page,
  replacesBase, deductibleClassification]) => {
  const metadata = gjensidigeInnboSources[sourceId];
  return {
    key, label, value,
    ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: sourceId, section, page, filename: metadata.filename, termsNumber: metadata.termsNumber,
      effectiveFrom: metadata.effectiveFrom, company: "Gjensidige", url: metadata.url,
      productCode: metadata.productCode, version: metadata.version,
    },
  };
});

export const gjensidigeInnboFacts: Record<string, CatalogFact[]> = {
  gjInnboShared: facts([
    ["innbo.geografi", "Innbo – geografisk område", "Forsikringsstedet; i Norden for ting midlertidig borte, ting for salg og ting på nytt bosted etter flytting", "gjInnboShared", "Forsikringsbevis – Hvor gjelder forsikringen", 3],
    ["innbo.lagring.annenbygning.grense", "Permanent lagring i annen bygning – grense", "30 000 kr", "gjInnboShared", "Forsikringsbevis – Hvor gjelder forsikringen", 3],
    ["innbo.penger.grense", "Kontanter og verdipapirer – grense", "20 000 kr", "gjInnboShared", "Forsikringsbevis – Hva er forsikret", 3],
    ["innbo.yrkeslosore.grense", "Eiendeler og varer i sikredes foretak – grense", "100 000 kr i bygning på forsikringsstedet", "gjInnboShared", "Forsikringsbevis – Hva er forsikret", 3],
    ["innbo.kjoretoytilbehor.grense", "Deler og tilbehør til privat kjøretøy – grense", "30 000 kr på forsikringsstedet", "gjInnboShared", "Forsikringsbevis – Hva er forsikret", 3],
    ["innbo.fritidsbat.grense", "Fritidsbåt med tilbehør – grense", "60 000 kr på forsikringsstedet, begrenset til brann, tyveri og naturskade", "gjInnboShared", "Forsikringsbevis – Hva er forsikret", 3],
    ["brann.dekning", "Brann", "Brannskade og skade som følge av lynnedslag, eksplosjon, nedsoting og elektriske fenomen", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 3],
    ["vann.dekning", "Vannskade", "Lekkasje fra rørledning, installasjoner og akvarium samt dokumentert vanninntrengning", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 3],
    ["tyveri.dekning", "Tyveri, ran og skadeverk", "Tyveri fra dokumenterte steder, skade etter tyveri eller forsøk, ran og veskenapping", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 3],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr for hagemøbler, hageredskap, grill og robotgressklipper; 30 000 kr for annet innbo", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 3],
    ["sykkel.tyveri.grense", "Sykkel, elsykkel og sykkeltilhenger – tyverigrense", "30 000 kr per sykkel eller sykkeltilhenger utenfor bygning på forsikringsstedet eller bebodd bolig", "gjInnboShared", "Forsikringsoversikt", 1],
    ["naturskade.dekning", "Naturskade", "Skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv og vulkanutbrudd etter naturskadeforsikringsloven", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 4],
    ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr", "gjInnboShared", "Forsikringsoversikt", 1, false, "override"],
    ["glass.sanitaer.dekning", "Bygningsglass og sanitærporselen", "Bruddskade på bygningsglass, inkludert innglasset veranda, og sanitærporselen", "gjInnboShared", "Forsikringsbevis – Hvilke skader", 4],
    ["glass.sanitaer.egenandel", "Bygningsglass – egenandel", "3 000 kr", "gjInnboShared", "Forsikringsoversikt", 1, false, "override"],
    ["ulykke.boligtilpasning.grense", "Tilpasning av bolig etter ulykke – grense", "250 000 kr for nødvendig ombygging når sikrede blir varig rullestolbruker; dokumenterte tiårsfrister gjelder", "gjInnboShared", "Ombygging for rullestolbruker", 5],
    ["innbo.datalager.grense", "Rekonstruksjon av datalagre mv. – grense", "50 000 kr", "gjInnboShared", "Etter en erstatningsmessig skade", 5],
    ["innbo.opphold.grense", "Opphold utenfor hjemmet – grense", "Nødvendige merutgifter i normal reparasjonsperiode; enkelte blokkerte-adkomst- og naturskadetilfeller samlet inntil 10 000 000 kr per kunde", "gjInnboShared", "Etter en erstatningsmessig skade", 6],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar for skade på person eller ting voldt som privatperson", "gjInnboShared", "Fellesdekninger – Ansvar", 8],
    ["ansvar.geografi", "Privatansvar – geografisk område", "Norden", "gjInnboShared", "Fellesdekninger – Ansvar", 8],
    ["ansvar.grense", "Privatansvar – forsikringssum", "5 000 000 kr per skadetilfelle", "gjInnboShared", "Forsikringsoversikt", 1],
    ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr per skadetilfelle", "gjInnboShared", "Forsikringsoversikt", 1, false, "override"],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter ved dokumentert tvist; utenrettslig mekling kan brukes uten egenandel", "gjInnboShared", "Fellesdekninger – Rettshjelp", 9],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr for 1–2 parter; 250 000 kr for 3–10, 500 000 kr for 11–25, 750 000 kr for 26–49 og 1 000 000 kr for minst 50 parter", "gjInnboShared", "Rettshjelp – Forsikringssum og egenandel", 12],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av utgiftene; 0 kr ved utenrettslig mekling hos Mekle.no", "gjInnboShared", "Rettshjelp – Forsikringssum og egenandel", 12, false, "override"],
    ["sikkerhet.brann", "Sikkerhetsforskrift – brann", "Brannvern og installasjoner skal følges opp etter dokumenterte sikkerhetskrav", "gjInnboShared", "Sikkerhetsforskrifter", 1],
    ["sikkerhet.tyveri", "Sikkerhetsforskrift – låsing og oppbevaring", "Dører og vinduer skal være lukket og låst; nøkler og tyveriutsatte gjenstander har egne oppbevaringskrav", "gjInnboShared", "Sikkerhetsforskrifter", 1],
    ["sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "Sykkel og tilbehør skal låses; verdi over 15 000 kr krever FG-godkjent lås", "gjInnboShared", "Sikkerhetsforskrifter", 1],
    ["sikkerhet.transport", "Sikkerhetsforskrift – transport", "Eiendeler skal være innpakket, emballert og sikret for normale transportpåkjenninger", "gjInnboShared", "Sikkerhetsforskrifter", 1],
  ]),
  gjInnboStandard: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Forsikringssummen er ikke oppgitt i det alminnelige vilkåret og må kontrolleres i forsikringsbeviset", "gjInnboStandard", "Forsikringsoversikt", 1, false, "reference"],
    ["innbo.egenandel", "Generell egenandel", "4 000 kr", "gjInnboStandard", "Forsikringsoversikt", 1, false, "standard"],
    ["tyveri.fellesbod.grense", "Tyveri fra bod i felles kjeller eller loft – grense", "30 000 kr", "gjInnboStandard", "Forsikringsbevis – Hvilke skader", 3],
  ]),
  gjInnboPlus: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Ubegrenset for innbo og løsøre, med dokumenterte særgrenser", "gjInnboPlus", "Forsikringsoversikt", 1, true],
    ["innbo.verdigjenstander.grense", "Verdigjenstander og enkeltgjenstander – særgrenser", "500 000 kr for hver angitt kategori og per øvrig enkeltgjenstand eller samling", "gjInnboPlus", "Forsikringsoversikt og Hva er forsikret", 1],
    ["innbo.egenandel", "Generell egenandel", "3 000 kr", "gjInnboPlus", "Forsikringsoversikt", 1, true, "standard"],
    ["tyveri.fellesbod.grense", "Tyveri fra bod i felles kjeller eller loft – grense", "Ingen separat generell bodgrense; innbo omfattes innenfor ubegrenset innbosum, mens objekt- og kategorigrenser fortsatt gjelder", "gjInnboPlus", "Forsikringsbevis – Hvilke skader", 4, true],
    ["tyveri.fellesbod.sykkelgrense", "Fellesbod – sykkelgrense", "30 000 kr per sykkel, elsykkel eller sykkeltilhenger.", "gjInnboPlus", "Forsikringsoversikt / Hvilke skader", 1],
    ["tyveri.fellesbod.sikkerhet", "Fellesbod – oppbevaringskrav", "Elektronisk og optisk utstyr, smykker, ur, kontanter, verdipapirer og kunst skal ikke oppbevares i bod i felles kjeller eller loft.", "gjInnboPlus", "Sikkerhetsforskrifter", 1],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "30 000 kr for annet innbo og løsøre i Norden", "gjInnboPlus", "Forsikringsbevis – Hvilke skader", 4],
    ["uhell.dekning", "Uhell", "Plutselig og uforutsett ytre skade hjemme og på privat uteareal; utenfor hjemmet inntil 30 000 kr i hele verden", "gjInnboPlus", "Uhell hjemme og borte", 4],
    ["uhell.geografi", "Uhell – geografisk område", "Hele verden; utenfor bolig og privat uteareal gjelder grense 30 000 kr", "gjInnboPlus", "Uhell borte", 4],
    ["sykkel.uhell.grense", "Sykkel og sportsutstyr – uhellsgrense", "30 000 kr i Norden; ritt, løp og konkurranse er unntatt", "gjInnboPlus", "Uhell borte", 4],
    ["sykkel.skadeverk.grense", "Sykkel – skadeverksgrense", "30 000 kr i Norden", "gjInnboPlus", "Uhell borte", 4],
    ["sykkel.veihjelp.dekning", "Veihjelp for sykkel og elsykkel", "Driftsstans på offentlig vei eller sted med biladkomst i Norge; reparasjon på stedet eller transport", "gjInnboPlus", "Veihjelp for sykkel/elsykkel", 5],
    ["sykkel.veihjelp.egenandel", "Sykkelveihjelp – egenandel", "500 kr", "gjInnboPlus", "Forsikringsoversikt", 1, false, "override"],
    ["mobil.skjerm.dekning", "Knust mobilskjerm", "Bytte av knust eller sprukket skjerm eller deksel via Gjensidiges samarbeidspartner", "gjInnboPlus", "Mobilforsikring – knust skjerm", 4],
    ["mobil.skjerm.egenandel", "Knust mobilskjerm – egenandel", "1 000 kr ved bruk av samarbeidspartner; 3 000 kr ellers", "gjInnboPlus", "Forsikringsoversikt og Mobilforsikring", 1, false, "override"],
    ["flytting.transport.grense", "Skade ved flytting", "Plutselig og uforutsett ytre skade og tyveri fra transportmiddel ved flytting til ny bolig i Norge", "gjInnboPlus", "Flytteforsikring", 4],
    ["skadedyr.dekning", "Bekjempelse av skadeinsekter", "Bekjempelse av veggedyr og kakerlakker samt begrenset åtebehandling mot skjeggkre og sølvkre", "gjInnboPlus", "Bekjempelse av veggedyr, kakerlakker og skjeggkre", 6],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skade", "gjInnboPlus", "Bekjempelse av veggedyr, kakerlakker og skjeggkre", 6],
    ["idtyveri.dekning", "ID-tyveri", "Praktisk rådgivning og hjelp fra Mehrwerk til å oppdage, kartlegge og begrense identitetstyveri", "gjInnboPlus", "Hjelp ved ID-tyveri", 6],
    ["idtyveri.grense", "ID-tyveri – økonomisk grense", "Ingen økonomisk forsikringssum er oppgitt; økonomisk tap og dokumentkostnader er unntatt", "gjInnboPlus", "Hjelp ved ID-tyveri", 6],
  ]),
  gjInnboUtleie: facts([
    ["utleie.dekning", "Utleieforsikring", "Gjelder bare når utleie er angitt i forsikringsbeviset; omfatter skadeverk, misligholdt husleie, utkastelse og underslag", "gjInnboUtleie", "Utleie", 4],
    ["utleie.husleietap.grense", "Utleie – tapt husleieinntekt – grense", "Inntil 6 måneders husleie, én gang per leietaker", "gjInnboUtleie", "Utleie", 4],
    ["utleie.utkastelse.grense", "Utleie – utkastelsesutgifter – grense", "20 000 kr", "gjInnboUtleie", "Utleie", 4],
    ["utleie.egenandel", "Utleie – egenandel", "10 000 kr ved misligholdt husleie og skadeverk utført av leietaker", "gjInnboUtleie", "Forsikringsoversikt", 1, false, "override"],
    ["utleie.sikkerhetskrav", "Utleie – sikkerhetskrav", "Utleie må være registrert; leiekontrakt og dokumenterte frister for varsel og begjæring om utkastelse gjelder", "gjInnboUtleie", "Sikkerhetsforskrifter og Leiekontrakt", 1],
  ]),
  gjInnboSykkelUtvidelse: facts([
    ["sykkel.tyveri.grense", "Sykkel – valgt tyverisum", "Høyere forsikringssum kan velges; den avtalte summen må kontrolleres i forsikringsbeviset", "gjInnboSykkelUtvidelse", "Forsikringsbevis og IPID – Utvidelser", 1, true, "reference"],
  ]),
};

// IPID EAP02 beskriver at Pluss dekker i tillegg til Standard. UI-navnet
// følger produktsiden, mens EAP02-betegnelsen er bevart i kildemetadata.
export const gjensidigeInnboProducts: CatalogProduct[] = [
  { company: "Gjensidige", insuranceType: "Innbo", name: "Innbo", providerId: "gjensidige", productId: "gj-innbo", version: null, sourceId: "gjInnboIpid", componentIds: ["gjInnboShared", "gjInnboStandard"] },
  { company: "Gjensidige", insuranceType: "Innbo", name: "Innbo Pluss", providerId: "gjensidige", productId: "gj-innbo-pluss", version: null, sourceId: "gjInnboIpid", inheritsProductId: "gj-innbo", componentIds: ["gjInnboPlus"] },
];

export const gjensidigeInnboAddOns: CatalogAddOn[] = [
  { id: "gj-innbo-utleie", name: "Utleie", providerId: "gjensidige", componentId: "gjInnboUtleie", requiresLevel: ["gj-innbo-pluss"], insuranceTypes: ["Innbo"] },
  { id: "gj-innbo-sykkel-hoyere-sum", name: "Høyere forsikringssum for sykkel", providerId: "gjensidige", componentId: "gjInnboSykkelUtvidelse", requiresLevel: ["gj-innbo-pluss"], insuranceTypes: ["Innbo"] },
];
