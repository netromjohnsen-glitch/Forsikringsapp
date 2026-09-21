import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const url = (vilk: string, vilkNr: string) => `https://www.tryg.no/odpdf?vilk=${vilk}&vilkNr=${vilkNr}`;
const source = (id: string, filename: string, termsNumber: string, effectiveFrom: string, sourceUrl: string, sha256: string): CatalogSource =>
  ({ id, company: "Tryg", filename, termsNumber, effectiveFrom, url: sourceUrl, sha256 });

export const trygInnboSources: Record<string, CatalogSource> = {
  trygInnbo: source("trygInnbo", "Innbo_og_losore_PPK13301.pdf", "PPK13301", "2026-07-01",
    url("Hjemforsikring-Dekningsvilkaar", "05PPK13301"), "dc1232e8506616af03a937c97a381ccc962eccca61bbd9544bf55b86b8effb39"),
  trygInnboExtra: source("trygInnboExtra", "Innbo_og_losore_Ekstra_PPK13302.pdf", "PPK13302", "2026-07-01",
    url("Hjemforsikring-Dekningsvilkaar-Ekstra", "05PPK13302"), "4cffa3b051f329da0fe178b20243a0920d2b5928e9995d485c35b58a48f1f810"),
  trygInnboUtleie: source("trygInnboUtleie", "Utleie_PPK13306.pdf", "PPK13306", "2026-01-01",
    url("Hjemforsikring-Utleie", "05PPK13306"), "fd832414658149b9816267cd50b01d04a02723022f2d16d05cad763296f11c79"),
  trygInnboProduct: source("trygInnboProduct", "Produktvilkar_PPK13300.pdf", "PPK13300", "2026-01-01",
    url("Hjemforsikring-Produkt", "05PPK13300"), "37407dcab9274909eebe7d220d302132e9b0a6c7042dc246ad6ccf92d5f184d0"),
  trygInnboSafety: source("trygInnboSafety", "Sikkerhetsforskrifter_PF133.pdf", "PF133", "",
    url("Hjemforsikring-Sikkerhetsforskrift", "05000PF133"), "7da2036f15e872921970058117ebbc84dc38d6025bcbf2543f19777e93023e5d"),
  trygInnboGeneral: source("trygInnboGeneral", "Generelle_vilkar_PGE91000.pdf", "PGE91000", "2024-07-01",
    url("Fellesvilkaar-Generelle", "05PGE91000"), "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320"),
  // Denne publiserte filen er fremtidig på skjæringsdatoen 19.09.2026 og
  // brukes derfor ikke som aktiv faktakilde i komponentene nedenfor.
  trygInnboLiabilityFuture: source("trygInnboLiabilityFuture", "Privatansvar_PGE90020.pdf", "PGE90020", "2026-10-01",
    url("Fellesvilkaar-Privat", "05PGE90020"), "c75dcb29b61d990dd95869e884fb64f59dd839717f9cb88fa9d85f0618d000df"),
  trygInnboLegal: source("trygInnboLegal", "Rettshjelp_PGE91500.pdf", "PGE91500", "2026-01-01",
    url("Fellesvilkaar-Rettshjelp", "05PGE91500"), "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291"),
  trygInnboNatural: source("trygInnboNatural", "Naturskade_PGE90010.pdf", "PGE90010", "2025-01-01",
    url("Fellesvilkaar-Naturskade", "05PGE90010"), "11439a7669131319396db7c2caa6f28ac140389e3e11408bb75badea0fdccef6"),
  trygInnboIpid: source("trygInnboIpid", "IPID_Innbo.pdf", "Ikke oppgitt", "2022-07-01",
    "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Innbo.pdf", "b354221fc37cf96e5b9725e19d29dd77073b15543099135642603463df403a54"),
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (rows: Row[]): CatalogFact[] => rows.map(([key,label,value,sourceId,section,page,replacesBase,deductibleClassification]) => {
  const metadata = trygInnboSources[sourceId];
  return { key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}), source: {
      documentId: sourceId, section, page, filename: metadata.filename, termsNumber: metadata.termsNumber,
      effectiveFrom: metadata.effectiveFrom, company: "Tryg", url: metadata.url,
    } };
});

const qualifiedFact = (row: Row, qualificationSourceId: string, qualificationSection: string,
  qualificationPage: number): CatalogFact => {
  const fact = facts([row])[0];
  const metadata = trygInnboSources[qualificationSourceId];
  return { ...fact, qualificationSource: {
    documentId: qualificationSourceId,
    section: qualificationSection,
    page: qualificationPage,
    filename: metadata.filename,
    termsNumber: metadata.termsNumber,
    effectiveFrom: metadata.effectiveFrom,
    company: "Tryg",
    url: metadata.url,
  } };
};

export const trygInnboFacts: Record<string, CatalogFact[]> = {
  trygInnboShared: facts([
    ["innbo.geografi","Innbo – geografisk område","Forsikringsstedet; midlertidig borte i Norden. Ved flytting innen Norden gjelder gammel og ny bolig i inntil 1 år","trygInnboProduct","3",1],
    ["innbo.forsikringssum","Samlet forsikringssum","Velges av forsikringstaker og står i forsikringsbeviset","trygInnbo","1.1",1,false,"reference"],
    ["naturskade.dekning","Naturskade","Skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv og vulkanutbrudd","trygInnboNatural","2",1],
    ["naturskade.egenandel","Naturskade – egenandel","8 000 kr, eller beløpet myndighetene til enhver tid fastsetter","trygInnboNatural","2",2,false,"override"],
    ["ansvar.dekning","Privatansvar","Privat erstatningsansvar er omfattet; aktive detaljer følger vilkår PGE90020","trygInnbo","1.4",2],
    ["ansvar.geografi","Privatansvar – geografisk område","Norden","trygInnboProduct","3",1],
    ["rettshjelp.dekning","Rettshjelp","Utgifter ved tvisteløsning med advokat eller registrert rettshjelper etter vilkåret","trygInnboLegal","1–5",1],
    ["rettshjelp.geografi","Rettshjelp – geografisk område","Norden","trygInnboProduct","3",1],
    ["rettshjelp.grense","Rettshjelp – forsikringssum","100 000 kr per tvist; 250 000 kr når minst tre parter står på samme side","trygInnboLegal","6.1",4],
    ["rettshjelp.egenandel","Rettshjelp – egenandel","4 000 kr pluss 20 % av utgifter utover 4 000 kr","trygInnboLegal","6.2",4,false,"override"],
    ["sikkerhet.brann","Sikkerhetsforskrift – brann","Godkjent røykvarsler i hver etasje og slokkeutstyr som kan brukes i alle rom","trygInnboSafety","1.2",1],
    ["sikkerhet.tyveri","Sikkerhetsforskrift – låsing","Dører skal låses, vinduer lukkes og ting borte fra forsikringsstedet holdes under tilsyn eller innelåst","trygInnboSafety","1.2",1],
    ["sikkerhet.sykkel","Sikkerhetsforskrift – sykkel","Sykkel og elsykkel skal låses når de forlates uten tilsyn","trygInnboSafety","1.2",1],
  ]),
  trygInnbo: facts([
    ["innbo.yrkeslosore.grense","Yrkesløsøre og varer – grense","50 000 kr samlet","trygInnbo","1.1",1],
    ["innbo.datalager.grense","Rekonstruksjon av datalagre mv. – grense","10 000 kr samlet","trygInnbo","1.1",1],
    ["innbo.vaesketap.grense","Tap av vann, olje, væske eller gass – grense","20 000 kr samlet ved plutselig utstrømming fra rørledning","trygInnbo","1.1",1],
    ["innbo.opphold.grense","Opphold utenfor hjemmet – grense","120 000 kr for ekstra nødvendige utgifter","trygInnbo","1.2",2],
    ["innbo.tilleggsinnredning.grense","Egen tilleggsinnredning i leiet bolig – grense","150 000 kr","trygInnbo","1.2",2],
    ["brann.dekning","Brann","Plutselig og uforutsett skade ved brann, lynnedslag, kortslutning, elektrisk fenomen, eksplosjon og sprengning","trygInnbo","2.1–2.2, 2.5",3],
    ["vann.dekning","Vannskade","Plutselig og uforutsett utstrømming fra rør, slokkeapparat eller akvarium og nærmere angitt inntrengning","trygInnbo","2.3",3],
    ["tyveri.dekning","Tyveri, skadeverk og ran","Ran, overfall og dokumenterte tyveri- og skadeverkstilfeller","trygInnbo","2.4",3],
    ["tyveri.fellesbod.grense","Tyveri fra bod med adgang fra fellesareal – grense","50 000 kr","trygInnbo","2.4",3],
    ["tyveri.privatbod.grense","Tyveri fra privat bod utenfor forsikringsstedet – grense","30 000 kr samlet","trygInnbo","2.4",3],
    ["tyveri.fellesgarasje.grense","Tyveri fra felles bod eller garasje – grense","15 000 kr samlet","trygInnbo","2.4",3],
    ["tyveri.uteareal.grense","Tyveri på privat boligs uteareal – grense","20 000 kr","trygInnbo","2.4",3],
    ["sykkel.tyveri.grense","Sykkel, elsykkel, barnevogn og sykkeltilhenger – tyverigrense","20 000 kr per gjenstand utenfor angitte oppbevaringssteder","trygInnbo","2.4",3],
    ["sykkel.egenandel.rabatt","Sykkeltyveri – egenandelsreduksjon","2 000 kr reduksjon ved løpende registrering i FG-godkjent sykkelregister","trygInnbo","2.4",4,false,"coverage"],
    ["innbo.hvitevarer.dekning","Hvitevarer","Plutselige og uforutsette skader på hvitevarer","trygInnbo","2.5",4],
    ["innbo.egenandel","Generell egenandel","Egenandelen i forsikringsbeviset gjelder når vilkåret ikke angir en annen egenandel","trygInnbo","3.2",5,false,"reference"],
  ]),
  trygInnboExtra: facts([
    ["innbo.yrkeslosore.grense","Yrkesløsøre og varer – grense","100 000 kr samlet","trygInnboExtra","1.1",1,true],
    ["innbo.datalager.grense","Rekonstruksjon av datalagre mv. – grense","50 000 kr samlet","trygInnboExtra","1.1",1,true],
    ["innbo.vaesketap.grense","Tap av vann, olje, væske eller gass – grense","40 000 kr samlet ved plutselig utstrømming fra rørledning","trygInnboExtra","1.1",1,true],
    ["innbo.opphold.grense","Opphold utenfor hjemmet – grense","Ekstra nødvendige utgifter i normal reparasjonstid","trygInnboExtra","1.2",2,true],
    ["innbo.tilleggsinnredning.grense","Egen tilleggsinnredning i leiet bolig – grense","500 000 kr","trygInnboExtra","1.2",2,true],
    ["tyveri.fellesbod.grense","Tyveri fra bod med adgang fra fellesareal – grense","350 000 kr","trygInnboExtra","2.4",4,true],
    ["tyveri.privatbod.grense","Tyveri fra privat bod utenfor forsikringsstedet – grense","60 000 kr","trygInnboExtra","2.4",4,true],
    ["tyveri.uteareal.grense","Tyveri på privat boligs uteareal – grense","40 000 kr","trygInnboExtra","2.4",4,true],
    ["tyveri.utenforhjem.grense","Tyveri utenfor hjemmet – grense","30 000 kr per skadetilfelle på andre dokumenterte steder","trygInnboExtra","2.4",4],
    ["flytting.transport.grense","Transportskade ved flytting – grense","30 000 kr per skadetilfelle ved transportbyrå, idrettslag, forening eller lignende","trygInnboExtra","2.4",4],
    ["sykkel.tyveri.grense","Sykkel, elsykkel, barnevogn og sykkeltilhenger – tyverigrense","40 000 kr per gjenstand","trygInnboExtra","2.4",4,true],
    ["uhell.dekning","Plutselige og uforutsette skader","Skader som består i annet enn at tingen er borte","trygInnboExtra","2.5",4],
    ["uhell.begrensning","Uhell – sentrale begrensninger","Ukjent skadeårsak, kosmetiske skader, garanti eller selgers ansvar, slitasje, alder eller egenødeleggelse, frost, insekter, bakterier, sopp eller råte og skade fra kjæledyr er unntatt. Sykkel og elsykkel over 40 000 kr og skade under ritt, løp eller konkurranse er også unntatt.","trygInnboExtra","2.5",4],
    ["uhell.egenandel","Uhell – egenandel","2 000 kr per skadetilfelle","trygInnboExtra","2.5",4,false,"override"],
    ["skadedyr.dekning","Bekjempelse av skadeinsekter, mus og rotter","Utgifter til reduksjon eller utryddelse på fast bosted i Norge","trygInnboExtra","2.6",5],
    ["skadedyr.grense","Skadedyrbekjempelse – grense","150 000 kr per skadetilfelle","trygInnboExtra","2.6",5],
    ["skadedyr.egenandel","Skadedyrbekjempelse – egenandel","2 000 kr per skadetilfelle","trygInnboExtra","2.6",5,false,"override"],
    ["sikkerhet.transport","Sikkerhetsforskrift – transport","Gjenstander skal pakkes og sikres for normale og påregnelige transportpåkjenninger","trygInnboSafety","1.3",2],
  ]).concat(qualifiedFact(
    ["uhell.geografi", "Uhell – geografisk område", "Norden når tingen er midlertidig borte fra forsikringsstedet",
      "trygInnboProduct", "3", 1],
    "trygInnboIpid", "Hva dekker forsikringen? – Ekstra", 1,
  )),
  trygInnboUtleie: facts([
    ["utleie.skadeverk.grense","Utleie – skadeverk utført av leietaker – grense","500 000 kr per skadetilfelle","trygInnboUtleie","2.1",1],
    ["utleie.tyveri.grense","Utleie – tyveri og underslag – grense","500 000 kr","trygInnboUtleie","2.2",1],
    ["utleie.husleietap.grense","Utleie – tapt husleieinntekt – grense","Inntil 6 måneders husleie, én gang per leietaker","trygInnboUtleie","2.3",1],
    ["utleie.utkastelse.grense","Utleie – utkastelsesutgifter – grense","20 000 kr per skadetilfelle","trygInnboUtleie","2.4",1],
    ["utleie.egenandel","Utleie – egenandel","6 000 kr per skadetilfelle","trygInnboUtleie","2.5",1,false,"override"],
    ["utleie.husleietap.egenandel","Utleie – egenandel ved tapt husleie","3 måneders husleie, minimum 10 000 kr","trygInnboUtleie","2.5",1,false,"override"],
  ]),
};

export const trygInnboProducts: CatalogProduct[] = [
  { company:"Tryg", insuranceType:"Innbo", name:"Innbo", providerId:"tryg", productId:"tryg-innbo", version:"2026-07-01", sourceId:"trygInnbo", componentIds:["trygInnboShared","trygInnbo"] },
  { company:"Tryg", insuranceType:"Innbo", name:"Innbo Ekstra", providerId:"tryg", productId:"tryg-innbo-ekstra", version:"2026-07-01", sourceId:"trygInnboExtra", inheritsProductId:"tryg-innbo", componentIds:["trygInnboExtra"] },
];

export const trygInnboAddOns: CatalogAddOn[] = [
  { id:"tryg-innbo-utleie", name:"Utleieforsikring", componentId:"trygInnboUtleie", providerId:"tryg", requiresLevel:["tryg-innbo","tryg-innbo-ekstra"] },
];
