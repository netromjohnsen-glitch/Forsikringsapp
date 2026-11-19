import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const insuranceType = "Innbo fritidsbolig";
const agreementScope = "ordinary";
const archiveFolder = "catalog/sources/private-holiday-contents";

const documents = {
  "gjensidige-innbo-hytte": {
    providerId: "gjensidige", company: "Gjensidige", slug: "innbo-hytte", filename: "gjensidige-standard.pdf",
    termsNumber: "Innbo Hytte – alminnelige vilkår", effectiveFrom: "", sourceType: "full_terms",
    url: "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Innbo-Standard-i-Hytte-alminnelige-vilkar.pdf",
    sha256: "8671f2c31f565fcf462af0b307f53edfc873539654d47eacbf15f16f6c31b68b", pages: 15,
    productIds: ["gjensidige-innbo-hytte"],
  },
  "gjensidige-innbo-hytte-pluss": {
    providerId: "gjensidige", company: "Gjensidige", slug: "innbo-hytte-pluss", filename: "gjensidige-pluss.pdf",
    termsNumber: "Innbo Hytte Pluss – alminnelige vilkår", effectiveFrom: "", sourceType: "full_terms",
    url: "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Innbo-Pluss-i-Hytte-alminnelige-vilkar.pdf",
    sha256: "63ee777d3bbeb6bcad2b92a31bde615c129d5115e7a45b3f7e12aeaa9df96548", pages: 16,
    productIds: ["gjensidige-innbo-hytte-pluss"],
  },
  "watercircles-innbo-fritidsbolig-terms": {
    providerId: "watercircles", company: "WaterCircles", slug: "innbo-fritidsbolig-105", filename: "watercircles-terms.pdf",
    termsNumber: "WtCIBF-1.05", effectiveFrom: "2026-01-01", sourceType: "full_terms",
    url: "https://www.watercircles.no/wp-content/uploads/2025/12/WaterCircles-Innbo-og-losore-Fritidsbolig-vilkar-WtCIBF-1.05-01.01.2026.pdf",
    sha256: "751079b0621201da359bed6b4290da48897fc45e65cbc28b4f8346605e7fe924", pages: 11,
    productIds: ["watercircles-innbo-fritidsbolig-standard", "watercircles-innbo-fritidsbolig-elite"],
  },
  "watercircles-innbo-fritidsbolig-ipid": {
    providerId: "watercircles", company: "WaterCircles", slug: "innbo-fritidsbolig-ipid", filename: "watercircles-ipid.pdf",
    termsNumber: "IPID Innbo fritidsbolig", effectiveFrom: "", sourceType: "ipid",
    url: "https://www.watercircles.no/wp-content/uploads/2023/11/InnboFritidsboligIPID.pdf",
    sha256: "bc3a6da38900ab3de21f552beb68d16068e019c222e96e47821786036c245402", pages: 2,
    productIds: ["watercircles-innbo-fritidsbolig-standard", "watercircles-innbo-fritidsbolig-elite"],
  },
} satisfies Record<string, Pick<CatalogSource,
  "providerId" | "company" | "filename" | "termsNumber" | "effectiveFrom" | "sourceType" | "url" | "sha256" | "productIds"> & {
    slug: string; pages: number;
  }>;

type DocumentId = keyof typeof documents;
type Row = readonly [
  key: string, label: string, value: string, page: number, section: string,
  availability?: CatalogFact["coverageAvailability"],
  deductible?: CatalogFact["deductibleClassification"],
];

const gjStandard = "gjensidige-innbo-hytte";
const gjPluss = "gjensidige-innbo-hytte-pluss";
const wcTerms = "watercircles-innbo-fritidsbolig-terms";
const wcIpid = "watercircles-innbo-fritidsbolig-ipid";
const wcStandard = "watercircles-innbo-fritidsbolig-standard";
const wcElite = "watercircles-innbo-fritidsbolig-elite";

function evidence(documentId: DocumentId, rows: readonly Row[]): CatalogFact[] {
  const { filename, termsNumber, effectiveFrom, company, url } = documents[documentId];
  return rows.map(([key, label, value, page, section, coverageAvailability, deductibleClassification]) => ({
    key, label, value, coverageAvailability, deductibleClassification,
    source: { documentId, filename, termsNumber, effectiveFrom, company, agreementScope, url, page, section },
  }));
}

function gjensidigeRows(pluss: boolean): Row[] {
  const standardDeductible = pluss ? "3 000 kr" : "4 000 kr";
  return [
    ["innbo.dekning", "Innbo og løsøre", "Innbo og løsøre i fritidsboligen er forsikret.", 2, "Hva er forsikret?"],
    ["innbo.forsikringssted", "Forsikringssted", "Avtalt sted i forsikringsbeviset. I Norden også blant annet ting som midlertidig er borte, skal selges eller står på nytt bosted etter flytting. Ting permanent lagret i en annen bygning i Norden er begrenset til 30 000 kr.", 2, "Hvor gjelder forsikringen?"],
    ["innbo.forsikringssum", "Forsikringssum", "Innbosummen angis i forsikringsbeviset.", 1, "Hva er forsikret – Innbosum"],
    ["egenandel.standard", "Generell egenandel", "Valgt egenandel står i forsikringsbeviset. Det alminnelige vilkåret viser " + standardDeductible + ".", 1, "Hva er forsikret – Egenandel", undefined, "reference"],
    ["brann.dekning", "Brann", "Plutselig og uforutsett skade ved blant annet brann, lynnedslag, eksplosjon, nedsoting eller elektrisk fenomen.", 2, "Hvilke skader?"],
    ["vann.dekning", "Vannskade", "Blant annet lekkasje fra rør, installasjoner eller akvarium, vanninntrenging som danner vannspeil og vann gjennom åpning etter dekningsmessig bygningsskade.", 2, "Hvilke skader?"],
    ["tyveri.dekning", "Tyveri og innbrudd", "Tyveri fra bygning på forsikringsstedet og andre angitte steder. Skade på innbo etter tyveri eller tyveriforsøk fra bygningen er omfattet.", 2, "Hvilke skader?"],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal", "100 000 kr for hagemøbler, hageredskap, grill og robotgressklipper. 30 000 kr for annet innbo.", 2, "Hvilke skader? – Tyveri"],
    ["naturskade.dekning", "Naturskade", "Direkte skade fra naturulykker som skred, storm, flom og stormflo etter naturskadeforsikringsloven.", 3, "Hvilke skader? – Naturskade"],
    ["naturskade.egenandel", "Egenandel ved naturskade", "8 000 kr.", 1, "Hva er forsikret – Naturskade", undefined, "coverage"],
    ["innbo.fritidsbat.grense", "Fritidsbåt på forsikringsstedet", "Inntil 60 000 kr for båt med deler og tilbehør, begrenset til brann, tyveri og naturskade.", 2, "Hva er forsikret? – Fritidsbåt"],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson i Europa for blant annet skade på tredjeperson eller andres ting.", pluss ? 6 : 5, "Fellesdekninger – Ansvar"],
    ["ansvar.grense", "Forsikringssum for ansvar", "5 000 000 kr.", 1, "Hva er forsikret – Ansvar"],
    ["ansvar.egenandel", "Egenandel ved ansvarsskade", "4 000 kr.", 1, "Hva er forsikret – Ansvar", undefined, "coverage"],
    ["rettshjelp.dekning", "Rettshjelp", "Dekning for tvist i egenskap av privatperson i Norden, med vilkår for hvilke tvister og utgifter som omfattes.", pluss ? 8 : 7, "Fellesdekninger – Rettshjelp"],
    ["rettshjelp.grense", "Forsikringssum for rettshjelp", "100 000 kr per tvist med én til to parter på samme side. Egne grenser gjelder for flere parter.", pluss ? 10 : 9, "Rettshjelp – Forsikringssum og egenandel"],
    ["rettshjelp.egenandel", "Egenandel ved rettshjelp", "4 000 kr pluss 20 % av de dekkede utgiftene. Utenrettslig mekling via Mekle.no har ingen egenandel.", pluss ? 10 : 9, "Rettshjelp – Forsikringssum og egenandel", undefined, "coverage"],
    ["sikkerhet.vann", "Sikkerhetskrav mot vannskade", "Steng hovedstoppekranen og åpne en vannkran for å tømme rørene når hytta står ubebodd i mer enn tre døgn. Hytta skal holdes tilstrekkelig oppvarmet mot frostskader.", 1, "Sikkerhetsforskrifter"],
  ];
}

const gjensidigeStandard = evidence(gjStandard, [
  ...gjensidigeRows(false),
  ["tyveri.bod.grense", "Tyveri fra bod", "Inntil 30 000 kr fra boder i felles kjeller eller loftsetasje.", 2, "Hvilke skader? – Tyveri"],
  ["sykkel.tyveri.grense", "Sykkel og elsykkel – tyverigrense", "Ved tyveri av sykkel, elsykkel eller sykkeltilhenger utenfor stedene som står i tyveripunktet, gjelder summen i forsikringsbeviset.", 2, "Hvilke skader? – Tyveri"],
  ["uhell.dekning", "Uhell", "Den utvidede dekningen for andre plutselige, ytre hendelser er del av Innbo Hytte Pluss.", 1, "Hva er forsikret – Innbo", "unavailable"],
  ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av veggedyr, kakerlakker, skjeggkre og sølvkre er del av Innbo Hytte Pluss.", 1, "Hva er forsikret – Innbo", "unavailable"],
]);

const gjensidigePluss = evidence(gjPluss, [
  ...gjensidigeRows(true),
  ["uhell.dekning", "Uhell", "Plutselige og uforutsette ytre hendelser som skader ting i fritidsboligen eller på privat uteareal. Egne unntak gjelder, blant annet for bortkomne ting og skader av kjæledyr.", 3, "Uhell på hytta"],
  ["utleie.vilkar", "Vilkår ved utleie", "Når utleie står i forsikringsbeviset: blant annet skadeverk og underslag begått av leietaker, misligholdt husleie i inntil seks måneder én gang per leietaker og nødvendige utkastelsesutgifter inntil 20 000 kr.", 3, "Uhell på hytta – Der utleie er angitt"],
  ["utleie.egenandel", "Egenandel ved misligholdt husleie", "10 000 kr når utleie er registrert.", 1, "Hva er forsikret – Misligholdt husleie", undefined, "coverage"],
  ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av veggedyr og kakerlakker på forsikringsstedet. Opptil tre åteutlegginger i boenheten for skjeggkre og sølvkre. Gjensidige må godkjenne bekjempelsen på forhånd.", 5, "Bekjempelse av veggedyr, kakerlakker, skjeggkre og sølvkre"],
  ["skadedyr.grense", "Grense for skadedyrbekjempelse", "150 000 kr per skade.", 5, "Bekjempelse av veggedyr, kakerlakker, skjeggkre og sølvkre"],
]);

function waterCirclesRows(elite: boolean): Row[] {
  return [
    ["innbo.dekning", "Innbo og løsøre", "Innbo og løsøre i fritidsboligen er forsikret.", 5, "A.2.1"],
    ["innbo.forsikringssted", "Forsikringssted", "Stedet angitt i forsikringsbeviset. Visse ting som midlertidig er borte eller skal selges, er også omfattet i rom for beboelse i Norden.", 6, "A.4.1–A.4.2"],
    ["innbo.forsikringssum", "Forsikringssum", "Avtalt sum i forsikringsbeviset. Enkeltgjenstander og samlinger er omfattet inntil 500 000 kr innenfor den avtalte summen. Høyere gjenstandsverdi kan avtales.", 5, "A.2.1"],
    ["egenandel.standard", "Generell egenandel", "Beløpet står i forsikringsbeviset hvis vilkårene ikke angir en særskilt egenandel.", 7, "A.5.6 Egenandel", undefined, "reference"],
    ["brann.dekning", "Brann", "Brann, plutselig nedsoting, eksplosjon, lynnedslag og elektrisk fenomen.", 3, "A.1.1–A.1.2"],
    ["vann.dekning", "Vannskade", "Blant annet vann, gass eller væske fra rør ved lekkasje, og plutselig vanninntrenging fra terreng som gir frittstående vann over laveste gulv.", 3, "A.1.4"],
    ["tyveri.dekning", "Tyveri og innbrudd", "Tyveri fra bygning på forsikringsstedet, annen bebodd bolig og andre angitte steder. Plutselig skadeverk i forbindelse med innbrudd er omfattet.", 4, "A.1.5.1–A.1.5.3"],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal", elite ? "50 000 kr, på privat uteareal utenom fellesareal." : "20 000 kr, på privat uteareal utenom fellesareal.", elite ? 9 : 4, elite ? "B.2.11, jf. A.1.5.3" : "A.1.5.3"],
    ["tyveri.bod.grense", "Tyveri fra bod", elite ? "100 000 kr fra bod med adgang fra fellesareal. Egne krav til oppbevaring gjelder for tyveriutsatte gjenstander." : "50 000 kr fra bod med adgang fra felles kjeller, loft, garasje eller annet fellesareal.", elite ? 9 : 4, elite ? "B.2.14" : "A.1.5.1"],
    ["sykkel.tyveri.grense", "Sykkel og elsykkel – tyverigrense", elite ? "40 000 kr per sykkel. Grensen økes til 50 000 kr ved tyveri fra låst bolig eller privat låst garasje." : "20 000 kr per sykkel eller sykkeltilhenger etter det gjeldende fullvilkåret. Sykkel skal være låst.", elite ? 9 : 4, elite ? "B.1.4 og B.2.2" : "A.1.5.4"],
    ["naturskade.dekning", "Naturskade", "Naturulykke som skred, storm, flom eller stormflo etter naturskadeforsikringsloven. Gjelder i Norge; blant annet småbåter og biltilhengere er unntatt fra naturskadedekningen.", 3, "A.1.3"],
    ["naturskade.egenandel", "Egenandel ved naturskade", "8 000 kr ved naturulykke, jf. egenandelen som til enhver tid er fastsatt etter naturskadereglene.", 7, "A.5.6 – Spesielle egenandeler 1", undefined, "coverage"],
    ["innbo.fritidsbat.grense", "Fritidsbåt på forsikringsstedet", elite ? "40 000 kr per fritidsbåt og per påhengsmotor. Grunnvilkårets avgrensning er inntil 15 fot og 10 hk, og småbåter er unntatt ved naturskade." : "20 000 kr per fritidsbåt inntil 15 fot og per påhengsmotor inntil 10 hk. Småbåter er unntatt ved naturskade.", elite ? 9 : 5, elite ? "B.2.4, jf. A.2.1 og A.1.3" : "A.2.1, jf. A.1.3"],
    ["sikkerhet.vann", "Sikkerhetskrav mot vannskade", "Bygningen skal være tilstrekkelig oppvarmet eller rørene tappes ned mot frost. Før nedtapping skal stoppekranen kontrolleres.", 4, "A.1.4 – Sikkerhetsforskrifter"],
  ];
}

const waterCirclesExclusions = evidence(wcIpid, [
  ["ansvar.dekning", "Privatansvar", "Privatansvar står som unntatt i produktarket for Innbo fritidsbolig.", 1, "Hva dekker forsikringen ikke?", "unavailable"],
  ["rettshjelp.dekning", "Rettshjelp", "Rettshjelp står som unntatt i produktarket for Innbo fritidsbolig.", 1, "Hva dekker forsikringen ikke?", "unavailable"],
]);

const facts: Record<string, CatalogFact[]> = {
  [gjStandard]: gjensidigeStandard,
  [gjPluss]: gjensidigePluss,
  [wcStandard]: [
    ...evidence(wcTerms, [
      ...waterCirclesRows(false),
      ["uhell.dekning", "Uhell", "Den utvidede dekningen for annen fysisk skade fra en plutselig, ytre årsak er del av Elite.", 8, "B.1.3", "unavailable"],
    ]),
    ...waterCirclesExclusions,
    ...evidence(wcIpid, [
      ["skadedyr.dekning", "Bekjempelse av skadedyr", "Skadedyr står som unntatt i produktarket for Innbo fritidsbolig.", 1, "Hva dekker forsikringen ikke?", "unavailable"],
    ]),
  ],
  [wcElite]: [
    ...evidence(wcTerms, [
      ...waterCirclesRows(true),
      ["uhell.dekning", "Uhell", "Annen fysisk skade på innbo og løsøre som skyldes en kjent, plutselig ytre årsak. Blant annet glemte gjenstander og vannskade på elektronikk er unntatt.", 8, "B.1.3"],
      ["uhell.grense", "Grense ved uhell", "100 000 kr per skadetilfelle utenfor bolig eller når ting skades ved fall eller velt.", 8, "B.1.3"],
      ["flytting.dekning", "Flytteskade", "Ved privat flytting med bil eller tilhenger, også under inn- og utbæring, dekkes skade inntil avtalt innbosum og 50 000 kr per gjenstand. Transportbyrå er unntatt.", 8, "B.1.3"],
      ["innbo.ombygging.grense", "Tilpasning av bolig etter ulykke", "250 000 kr for bygningsmessig tilpasning ved blant annet varig medisinsk invaliditet på minst 50 %, på vilkårene i B.1.5.", 9, "B.1.5"],
    ]),
    ...waterCirclesExclusions,
  ],
};

function product(productId: string, name: string, sourceId: DocumentId, version: string | null): CatalogProduct {
  const { providerId, company } = documents[sourceId];
  return { productId, name, providerId, company, insuranceType, agreementScope, sourceId, version, componentIds: [productId] };
}

const products = [
  product(gjStandard, "Innbo Hytte", gjStandard, null),
  product(gjPluss, "Innbo Hytte Pluss", gjPluss, null),
  product(wcStandard, "Standard", wcTerms, documents[wcTerms].termsNumber),
  product(wcElite, "Elite", wcTerms, documents[wcTerms].termsNumber),
];

const sources: Record<string, CatalogSource> = Object.fromEntries(Object.entries(documents).map(([id, {
  providerId, company, filename, termsNumber, effectiveFrom, sourceType, url, sha256, pages, productIds,
}]) => [id, {
  id, providerId, company, filename, termsNumber, effectiveFrom, sourceType, url, sha256, productIds,
  insuranceType, agreementScope, physicalPages: [1, pages],
} satisfies CatalogSource]));

export const privateHolidayContentsMarket = {
  replacesProductIds: [] as string[],
  products,
  facts,
  sources,
  addOns: [] as CatalogAddOn[],
};

export const privateHolidayContentsArchives = Object.entries(documents).map(([id, document]) => ({
  provider: document.providerId,
  slug: document.slug,
  archivePath: archiveFolder + "/" + document.filename,
  sources: [[id, document.effectiveFrom, document.url] as const],
}));
