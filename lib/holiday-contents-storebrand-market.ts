import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const effectiveFrom = "2026-09-20";
const version = "innbo10";
const filename = "Storebrand_Innbo_innbo10.pdf";
const url = "https://www.storebrand.no/privat/forsikring/innboforsikring-hytte/_/attachment/inline/9b3b5c27-3e81-4201-b0aa-a27ea63add19:bc9ded709c0c568e911dae5f8ebf9e1155de14ff/vilkar-innboforsikring.pdf";
const documentId = "storebrand:market:innbo-fritidsbolig:innbo10";
const insuranceType = "Innbo fritidsbolig";
const standardId = "sb-innbo-fritidsbolig-standard";
const superId = "sb-innbo-fritidsbolig-super";
const terms: CatalogSource = {
  id: documentId, company: "Storebrand", providerId: "storebrand", insuranceType, agreementScope: "ordinary",
  sourceType: "full_terms", filename, termsNumber: version, version, effectiveFrom, url, physicalPages: [1, 31],
  productIds: [standardId, superId],
  sha256: "b0e518d636a1350de08d5f9783ce65165d6b25b137382f089365344f5d836256",
};

const source = (page: number, section: string): CatalogFact["source"] => ({
  documentId, page, section, filename, termsNumber: version, version, effectiveFrom, url,
  company: "Storebrand", agreementScope: "ordinary",
});

const row = (key: string, label: string, value: string, page: number, section: string, options?: Pick<CatalogFact,
  "coverageAvailability" | "deductibleClassification" | "qualificationSource" | "replacesBase">): CatalogFact =>
  ({ key, label, value, source: source(page, section), ...options });

const unavailable = { coverageAvailability: "unavailable" } as const;

const facts: Record<string, CatalogFact[]> = {
  [standardId]: [
    row("innbo.forsikringssted", "Forsikringssted", "Adressen til hytta eller fritidsboligen i forsikringsbeviset.", 4, "B.2"),
    row("innbo.forsikringssum", "Samlet forsikringssum for innbo og løsøre", "Førsterisiko inntil summen du velger og som står i forsikringsbeviset. Egne beløpsgrenser kan gjelde per skadetype.", 13, "B.5"),
    row("egenandel.standard", "Generell egenandel", "Egenandelen står i forsikringsbeviset. Særskilte egenandeler følger vilkåret.", 15, "B.6.3", { deductibleClassification: "reference" }),
    row("brann.dekning", "Brann", "Brann, eksplosjon, plutselig og uventet nedsoting og utstrømming fra brannslokkingsutstyr.", 6, "B.4.1"),
    row("elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag og overspenning.", 7, "B.4.2"),
    row("vann.dekning", "Vannskade", "Blant annet utstrømming fra rør eller tilknyttet utstyr, lekkasje fra akvarium og direkte inntrenging fra terreng som fører til flytende vann utover gulvet.", 7, "B.4.4", { qualificationSource: source(8, "B.4.4") }),
    row("naturskade.dekning", "Naturskade", "I Norge etter naturskadeforsikringsloven, blant annet skred, storm, flom og stormflo.", 7, "B.4.3", { qualificationSource: source(4, "B.2") }),
    row("naturskade.egenandel", "Naturskade – egenandel", "Egenandelen som til enhver tid fastsettes av Justisdepartementet. Vilkåret oppgir 8 000 kr per 1. januar 2024.", 7, "B.4.3", { deductibleClassification: "override" }),
    row("tyveri.dekning", "Tyveri og skadeverk", "Tyveri fra bygning og skadeverk ved tyveri eller ulovlig inntrengning på forsikringsstedet.", 8, "B.4.5"),
    row("tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr for hagemøbler, hageredskap, grill og robotgressklipper og 40 000 kr for annet innbo. Fellesareal er unntatt.", 8, "B.4.5"),
    row("tyveri.utenforhjem.dekning", "Tyveri utenfor forsikringsstedet", "Standarddekningen for tyveri av gjenstander som midlertidig befinner seg utenfor forsikringsstedet, gjelder ikke for innbo på fritidsbolig.", 8, "B.4.5", unavailable),
    row("innbo.penger.dekning", "Penger og verdipapirer", "Penger og verdipapirer er unntatt for innbo i hytte eller fritidsbolig.", 5, "B.3", unavailable),
    row("innbo.fritidsbat.grense", "Fritidsbåt og angitt tilbehør – grense", "60 000 kr for fritidsbåt inntil 15 fot, påhengsmotor inntil 10 hk, kano, kajakk, seilbrett og SUP på forsikringsstedet eller låst fast på land i tilknytning til det.", 5, "B.3"),
    row("innbo.tilhenger.grense", "Tilhenger til person- og varebil – grense", "40 000 kr på forsikringsstedet.", 5, "B.3"),
    row("innbo.basseng.grense", "Frittstående basseng og badestamp – grense", "40 000 kr på forsikringsstedet. Badeinnretningen må stå løst og være uten fast røropplegg til bygningen.", 5, "B.3"),
    row("innbo.smabygg.grense", "Små bygg inntil 10 m² – grense", "50 000 kr på forsikringsstedet.", 5, "B.3"),
    row("innbo.fryserinnhold.dekning", "Matvarer i kjøleskap og fryser", "Matskade ved temperaturstigning fra strømbrudd eller angitt elektrisk fenomen. Følgeskade på kjøleskap eller fryser dekkes ved erstatningsmessig matskade.", 5, "B.3"),
    row("innbo.opphold.dekning", "Erstatningshytte etter skade", "Leie av tilsvarende fritidsbolig i Norge når en dekket skade hindrer planlagt bruk. Oppholdet må avtales med Storebrand på forhånd, og reglene om ekstra bokostnader i punkt 2 gjelder.", 13, "B.4.11 nr. 3"),
    row("innbo.opphold.grense", "Erstatningshytte etter skade – grense", "Inntil 40 000 kr.", 12, "B.4.11", { qualificationSource: source(13, "B.4.11 nr. 3") }),
    row("sikkerhet.vann", "Sikring mot frost og vannskade", "Bygningen må holdes varm nok, eller vannrørene tappes etter at det er kontrollert at stoppekranen er helt stengt.", 8, "B.4.4"),
    row("innbo.fraflyttet.begrensning", "Fraflyttet bolig", "Vilkårets 12-måneders begrensning ved fraflyttet bolig gjelder ikke for hytter og andre fritidsboliger.", 16, "B.7.2 nr. 3"),
    row("uhell.dekning", "Uhell", "Uhellsforsikringen i C.1.2 følger Storebrand Super.", 18, "C.1.2", unavailable),
    row("skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelsesdekningen i C.1.6 følger Storebrand Super.", 21, "C.1.6", unavailable),
    row("innbo.gnagerskade.dekning", "Skade på innbo fra rotter og mus", "Dekningen for skade forårsaket av mus og rotter i C.1.7 følger Storebrand Super.", 22, "C.1.7", unavailable),
    row("idtyveri.dekning", "ID-tyveri", "ID-tyveridekningen gjelder ikke for innbo i hytte eller fritidsbolig.", 22, "C.1.8", unavailable),
    row("ansvar.dekning", "Privatansvar", "Privatansvar etter del D gjelder ikke for innbo i hytte eller fritidsbolig.", 24, "D", unavailable),
    row("rettshjelp.dekning", "Rettshjelp", "Rettshjelp etter del E gjelder ikke for innbo i hytte eller fritidsbolig.", 27, "E", unavailable),
  ],
  [superId]: [
    row("tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr for innbo på privat uteareal på forsikringsstedet. Fellesareal er unntatt.", 8, "B.4.5", { replacesBase: true }),
    row("tyveri.utenforhjem.dekning", "Tyveri utenfor forsikringsstedet", "Super har en egen dekning for tyveri av ting i Norden, inntil 50 000 kr. Penger, verdipapirer, tyveri fra bagasje som er sendt på samme reise og tyveri ved flytting er unntatt her.", 17, "C.1.1", { replacesBase: true }),
    row("innbo.basseng.grense", "Frittstående basseng og badestamp – grense", "100 000 kr på forsikringsstedet. Badeinnretningen må stå løst og være uten fast røropplegg til bygningen.", 5, "B.3", { replacesBase: true }),
    row("innbo.smabygg.grense", "Små bygg inntil 10 m² – grense", "200 000 kr på forsikringsstedet.", 5, "B.3", { replacesBase: true }),
    row("innbo.opphold.grense", "Erstatningshytte etter skade – grense", "Inntil 80 000 kr.", 12, "B.4.11", { replacesBase: true, qualificationSource: source(13, "B.4.11 nr. 3") }),
    row("uhell.dekning", "Uhell", "Plutselig, tilfeldig ytre skade. Inntil forsikringssummen på forsikringsstedet. Inntil 100 000 kr utenfor boligen eller ved fall eller velt i Norden og inntil 40 000 kr ved slike fall- eller velteskader utenfor Norden.", 18, "C.1.2", { replacesBase: true }),
    row("uhell.egenandel", "Uhell – egenandel", "2 000 kr per gjenstand, eller 1 500 kr for en gjenstand nyere enn to år, høyst avtalt egenandel. Avtalt egenandel gjelder for mobiltelefon, sykkel og briller.", 19, "C.1.2", { deductibleClassification: "override" }),
    row("sykkel.uhell.grense", "Skade på egen sykkel og sportsutstyr under bruk", "40 000 kr. Luftsportsutstyr, små elektriske kjøretøy og skader i ritt, løp eller konkurranser er unntatt.", 19, "C.1.3"),
    row("skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av gnagere og skadeinsekter i fritidsboligen i Norge som står i forsikringsbeviset. Storebrand må kontaktes før tiltak.", 21, "C.1.6", { replacesBase: true }),
    row("skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr.", 21, "C.1.6"),
    row("skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr.", 22, "C.1.6", { deductibleClassification: "override" }),
    row("innbo.gnagerskade.dekning", "Skade på innbo fra rotter og mus", "Skade på innbo og løsøre ved aktivitet som startet etter at avtalen begynte. Gjenstander i bygg uten boligformål, for eksempel garasje eller utebod, er unntatt.", 22, "C.1.7", { replacesBase: true }),
  ],
};

const products: CatalogProduct[] = [
  { company: "Storebrand", providerId: "storebrand", insuranceType, agreementScope: "ordinary",
    productId: standardId, version, name: "Standard", sourceId: documentId, componentIds: [standardId] },
  { company: "Storebrand", providerId: "storebrand", insuranceType, agreementScope: "ordinary",
    productId: superId, version, name: "Super", sourceId: documentId, componentIds: [superId], inheritsProductId: standardId },
];

export const storebrandHolidayContentsMarket = {
  replacesProductIds: [] as string[],
  products,
  sources: { [documentId]: terms },
  facts,
  addOns: [] as CatalogAddOn[],
};

export const storebrandHolidayContentsArchives = [{
  provider: "storebrand",
  slug: "innbo-fritidsbolig-innbo10",
  archivePath: "catalog/sources/storebrand/innbo/" + filename,
  sources: [[documentId, effectiveFrom, url] as const],
}];
