import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, page: number, section: string,
  deductibleClassification?: CatalogFact["deductibleClassification"],
  coverageAvailability?: CatalogFact["coverageAvailability"],
];

type ReviewedDocument = {
  id: string;
  sha256: string;
  termsNumber: string;
  effectiveFrom: string;
};

const ifBoat: ReviewedDocument = {
  id: "boat-pet:if:båt",
  sha256: "57e7aac8542dd10bfc92611f380b68754905b6808a66590307af86517c2072ae",
  termsNumber: "BÅT2-1",
  effectiveFrom: "2023-02-01",
};
const ifBoatUrl = "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=B%C3%A5tforsikring";
const gjensidigeBoatDelkasko = {
  id: "boat-pet:gjensidige:båt:delkasko",
  filename: "gjensidige-boat-delkasko-terms.pdf",
  providerId: "gjensidige",
  company: "Gjensidige",
  insuranceType: "Båt",
  agreementScope: "ordinary",
  sourceType: "full_terms",
  termsNumber: "Fritidsbåt – Delkasko",
  effectiveFrom: "",
  documentName: "Fritidsbåt – Delkasko",
  physicalPages: [1, 15],
  productIds: ["gjensidige-bat-delkasko"],
  url: "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bat-Delkasko-alminnelige-vilkar.pdf",
  sha256: "c957957adc960efefaf50717d1e85bd186297fad9e5cf21d014f08f330752233",
} satisfies CatalogSource & ReviewedDocument;

const workshopLabel = "Transport til verksted etter skade";
const inTransitLabel = "Skade på båten under transport";
const boatRecoveryLabel = "Hjemtransport av båten";
const frendeBoat: ReviewedDocument = {
  id: "boat-pet:frende:båt:2026-11-20",
  sha256: "ac87efb9e5c43b27b8b16b3eb955ef0476730e6b779a54afc47d8679df737c5c",
  termsNumber: "Båtforsikring",
  effectiveFrom: "2026-11-20",
};

const ifBoatCommon: ReviewedRow[] = [
  ["bat.transport.dekning", workshopLabel, "Ved en dekket skade erstattes rimelige kostnader til nødvendig transport eller midlertidig reparasjon for å få skadet båt eller tilbehør til nærmeste verksted som kan reparere.", 4, "4.5 Transport av skadet båt til nærmeste verksted"],
  ["bat.haerverk.dekning", "Hærverk", "Skade som følge av hærverk omfattes.", 3, "4.2"],
  ["bat.ulykke.dekning", "Fører- og passasjerulykke", "Gjelder rettmessig fører og passasjerer om bord, og utenfor båten når båten er direkte årsak til skaden under bruk. Betalende passasjerer er unntatt. Dekningen må fremgå av forsikringsbeviset.", 17, "10.2–10.4, jf. 4.1 side 3"],
  ["bat.ulykke.invaliditet", "Fører- og passasjerulykke – medisinsk invaliditet", "200 000 kr per forsikret ved 100 % medisinsk invaliditet; forholdsmessig ved lavere invaliditetsgrad.", 17, "10.5.1"],
  ["bat.ulykke.dod", "Fører- og passasjerulykke – dødsfall", "100 000 kr ved dødsfall som følge av dekket ulykkesskade.", 17, "10.5.2"],
  ["bat.rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av overskytende; én egenandel når flere parter står på samme side.", 13, "6.3.2", "coverage"],
  ["bat.redning.bergelonn", "Bergelønn", "Bergelønn etter sjøloven kan dekkes når båten utsettes for en fare forsikringen dekker. Krever Ifs samtykke til avtalen om bergelønn.", 4, "4.6, jf. 7.1.5 side 14"],
  ["bat.vrakfjerning.grense", "Vrakfjerning – beløpsgrense", "Inntil 10 % av båtens forsikringssum ved offentlig pålagt fjerning etter en fare forsikringen dekker. Krever Ifs samtykke til avtalen om vrakfjerning.", 4, "4.7, jf. 7.1.5 side 14"],
];

const ifBoatKasko: ReviewedRow[] = [
  ["bat.transport.skade.dekning", inTransitLabel, "Kasko dekker tilfeldig og plutselig ytre skade på forsikret båt under transport til lands og til vanns.", 4, "4.3 Kasko, jf. 2 Hvor forsikringen gjelder på PDF-side 2"],
  ["bat.redning.dekning", "Redning og berging", "Rimelige utgifter til slep til nærmeste trygge fortøyningssted etter en plutselig og uforutsett hendelse som hindrer videre seilas.", 4, "4.8"],
  ["bat.redning.egenandel", "Redning og berging – egenandel", "Ingen egenandel ved redningsforanstaltning, bergelønn eller båtredning.", 13, "6.3.3", "coverage"],
];

const ifBoatSuper: ReviewedRow[] = [
  ["bat.ferieavbrudd.dekning", "Ferieavbrudd", "Avlyst, planlagt båtferie fra 1. mai til og med 31. august når båten ikke lenger er sjødyktig etter dekket brann-, tyveri- eller kaskoskade. Tapet må sannsynliggjøres.", 7, "4.10.2"],
  ["bat.ferieavbrudd.dagsbelop", "Ferieavbrudd – beløp per dag", "2 000 kr per feriedag som må avlyses.", 7, "4.10.2"],
  ["bat.ferieavbrudd.dager", "Ferieavbrudd – antall dager", "Inntil 21 avlyste feriedager.", 7, "4.10.2"],
  ["bat.totalskade.dekning", "Totalskade og ny båt", "Ved totalskade dekkes kjøpesummen eller høyere gjenanskaffelsesverdi for tilsvarende båt med utstyr, begrenset til avtalt forsikringssum. Båten må ha vært forsikret for gjenanskaffelsesverdi ved kjøp av forsikringen, og kjøp og førstegangssalg må dokumenteres.", 7, "4.10.5"],
  ["bat.totalskade.alder", "Totalskade og ny båt – aldersgrense", "Inntil tre år etter at båten første gang ble solgt som ny.", 7, "4.10.5"],
  ["bat.losore.dekning", "Løsøre og bagasje", "Utvidet dekning for bagasje som midlertidig befinner seg om bord, etter vilkårets objektavgrensninger.", 6, "4.10.1, jf. 3.1–3.2 side 3"],
  ["bat.opplagsutstyr.dekning", "Opplagsutstyr", "Krybbe, presenning og stativ til bruk under opplag omfattes. Ved skade gjelder avtalt kaskoegenandel.", 7, "4.10.6, jf. 3.1 side 3"],
  ["bat.opplagsutstyr.grense", "Opplagsutstyr – beløpsgrense", "Ingen særskilt beløpsgrense for krybbe, presenning og stativ omfattet av punkt 3.1.", 7, "4.10.6, jf. 3.1 side 3"],
];

const gjensidigeBoatKasko: ReviewedDocument = {
  id: "boat-pet:gjensidige:båt:kasko",
  sha256: "efff0f6c28d758d9e8d707ce698394d8173c5892541aaa0f26ff2a9f4a03742e",
  termsNumber: "Fritidsbåt – Kasko",
  effectiveFrom: "",
};
const gjensidigeBoatPluss: ReviewedDocument = {
  id: "boat-pet:gjensidige:båt:pluss",
  sha256: "1f0a4130b2b6ce03404b71bf301f8efdb70c01005b3f96d017116018bf7eb6ae",
  termsNumber: "Fritidsbåt – Pluss",
  effectiveFrom: "",
};
const gjensidigeBoatOverview: ReviewedDocument = {
  id: "boat-pet:gjensidige:båt",
  sha256: "c0e14e39f1c5dce3c6d238e8822eb14267e998ad0e762f08887d05bc3cb9c7a0",
  termsNumber: "EAP14",
  effectiveFrom: "",
};

function gjensidigeBoatCommon(coveragePage: number, geographyPage: number, accidentPage: number, legalPage: number, contentsLimit: string): ReviewedRow[] {
  return [
    ["bat.redning.dekning", "Redning og berging", "Assistanse ved båtskade, tyveri eller driftsstans slik at båten ikke kan seile videre, eller ved sykdom, ulykke eller dødsfall hos fører eller passasjer.", coveragePage, "Forsikringsbevis – Hvilke skader?"],
    ["bat.redning.bergelonn", "Bergelønn", "Bergelønn inngår i redningsdekningen ved skade, tyveri eller driftsstans slik at båten ikke kan seile videre, eller ved sykdom, ulykke eller dødsfall hos fører eller passasjer.", coveragePage, "Forsikringsbevis – Hvilke skader?"],
    ["bat.transport.dekning", workshopLabel, "Dekker transport til nærmeste verksted som kan reparere skaden, eller reparasjon på stedet hvis det er rimeligere.", coveragePage, "Forsikringsbevis – Hvilke skader?"],
    ["bat.redning.hjemtransport.dekning", boatRecoveryLabel, "Dekker hjemtransport hvis transport til verksted eller reparasjon på stedet ikke lar seg gjøre, eller etter at båten er reparert på nærmeste egnede verksted. Dekker også hjemtransport av båten når sykdom, ulykke eller dødsfall hos fører eller passasjer hindrer videre reise.", coveragePage, "Forsikringsbevis – Hvilke skader?"],
    ["bat.redning.egenandel", "Redning og berging – egenandel", "750 kr; 0 kr for totalmedlemmer i Redningsselskapet.", 1, "Forsikringsbevis – Redning og assistanse", "coverage"],
    ["bat.redning.hjemtransport.geografi", "Hjemtransport av båten – geografisk område", "Hjemtransport av båten under redningsdekningen er begrenset til Skandinavia.", geographyPage, "Forsikringsbevis – Hvor gjelder forsikringen?"],
    ["bat.losore.dekning", "Løsøre og bagasje", "Løst utstyr og personlige eiendeler i båten ved en skade forsikringen dekker.", 1, "Forsikringsbevis – Hva er forsikret?"],
    ["bat.losore.grense", "Løsøre og bagasje – beløpsgrense", contentsLimit, 1, "Forsikringsbevis – Hva er forsikret?"],
    ["bat.ulykke.dekning", "Fører- og passasjerulykke", "Ulykkesskade for rettmessig fører og passasjerer om bord, og ved båten når båten er direkte årsak til skaden.", accidentPage, "Fellesdekninger – Ulykke"],
    ["bat.ulykke.invaliditet", "Fører- og passasjerulykke – medisinsk invaliditet", "Inntil 500 000 kr ved varig medisinsk invaliditet.", 1, "Forsikringsbevis – Ulykke"],
    ["bat.ulykke.dod", "Fører- og passasjerulykke – dødsfall", "100 000 kr ved dødsfall som følge av dekket ulykkesskade.", 1, "Forsikringsbevis – Ulykke"],
    ["bat.ulykke.behandling", "Fører- og passasjerulykke – behandlingsutgifter", "Inntil 15 000 kr i behandlingsutgifter etter dekket ulykkesskade.", 1, "Forsikringsbevis – Ulykke"],
    ["bat.rettshjelp.grense", "Rettshjelp – beløpsgrense", "100 000 kr per tvist med 1–2 parter på sikredes side. Ved 3–10 parter: 250 000 kr; 11–25: 500 000 kr; 26–49: 750 000 kr; 50 eller flere: 1 000 000 kr.", legalPage, "Rettshjelp – Forsikringssum og egenandel"],
    ["bat.rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av dekningsmessige utgifter; én egenandel per tvist. Utenrettslig mekling via Mekle.no er uten egenandel.", legalPage, "Rettshjelp – Forsikringssum og egenandel", "coverage"],
  ];
}

const gjensidigeBoatPlussRows: ReviewedRow[] = [
  ["bat.ferieavbrudd.dekning", "Ferieavbrudd", "Kompensasjon når en erstatningsmessig skade gjør at båten ikke kan brukes til det planlagte formålet.", 4, "Forsikringsbevis – Feriegaranti"],
  ["bat.ferieavbrudd.dagsbelop", "Ferieavbrudd – beløp per dag", "Inntil 1 500 kr per dag.", 4, "Forsikringsbevis – Feriegaranti"],
  ["bat.ferieavbrudd.dager", "Ferieavbrudd – antall dager", "Inntil 14 dager.", 4, "Forsikringsbevis – Feriegaranti"],
  ["bat.maskinskade.alder", "Motor- og maskinskade – aldersgrense", "Forsikringsoversikten angir dekning til første hovedforfall etter at motoren har fylt ti år. Skadetabellen viser aldersgrensen for motor, drivverk og drivlinje for utenbords- og innenbordsmotor samt seilbåt.", 1, "Forsikringsbevis – Motorskade, jf. Hvilke skader? side 4"],
  ["bat.opplagsutstyr.dekning", "Opplagsutstyr", "Skade på krybbe, presenning og stativ omfattes. Skade på kalesje under opplag er unntatt.", 4, "Forsikringsbevis – Hvilke skader?"],
];

const frendeBoatKasko: ReviewedRow[] = [
  ["bat.redning.dekning", "Redning og berging", "Ved dekket båtskade, eller akutt sykdom, ulykke eller dødsfall hos sikrede, fører eller passasjer som hindrer videre reise, dekkes rimelige og nødvendige redningstiltak. Det kan omfatte assistanse, lokal transport, hjemreise for fører og passasjerer eller avtalt hotellopphold, med vilkårene i punkt 5.3.", 3, "5.3 nr. 1 og bokstav a–c (fortsetter på PDF-side 4)"],
  ["bat.transport.dekning", workshopLabel, "Transport av skadet båt til nærmeste verksted, eller reparasjon på stedet hvis det er billigere. Frende må godkjenne transporten på forhånd.", 3, "5.3 nr. 2 Redningstiltak"],
  ["bat.transport.skade.dekning", inTransitLabel, "Plutselig og uforutsett skade på båten under transport til lands eller til vanns omfattes av kasko, med unntakene i vilkåret.", 3, "5.1 nr. 4 og 5.2"],
  ["bat.redning.bergelonn", "Bergelønn", "Bergelønn dekkes etter reglene om berging i sjøloven.", 3, "5.3 nr. 3 Redningstiltak"],
  ["bat.vrakfjerning.grense", "Vrakfjerning – beløpsgrense", "Inntil 10 % av båtens forsikringssum ved fjerning av vrak som offentlige myndigheter pålegger.", 3, "5.3 nr. 4 Redningstiltak"],
];

function frendeBoatRecovery(extended: boolean): ReviewedRow[] {
  return [
    ["bat.redning.hjemtransport.dekning", boatRecoveryLabel,
      "Hjemtransport av båten hvis den må etterlates som følge av forhold nevnt i punkt 5.1." +
      (extended ? " Utvidet dekker også merutgifter til hjemtransport fra andre land i forsikringsområdet." : ""),
      4, extended ? "5.3 bokstav d og 7.4" : "5.3 bokstav d"],
    ["bat.redning.hjemtransport.geografi", "Hjemtransport av båten – geografisk område",
      extended ? "Norge og Sverige samt øvrige land i forsikringsområdet etter punkt 2." : "Kun i Norge og Sverige.",
      2, extended ? "2 Hvor forsikringen gjelder, jf. 7.4 på PDF-side 4" : "2 Hvor forsikringen gjelder, jf. 5.3 på PDF-side 4"],
    ["bat.redning.hjemtransport.grense", "Hjemtransport av båten – beløpsgrense",
      "Fra Norge og Sverige er grensen båtens verdi på tidspunktet for hjemtransport." +
      (extended ? " Fra andre land i forsikringsområdet dekkes merutgifter med inntil 50 000 kr." : ""),
      4, extended ? "5.3 bokstav d og 7.4" : "5.3 bokstav d"],
  ];
}

const frendeBoatExtended: ReviewedRow[] = [
  ["bat.ferieavbrudd.dekning", "Ferieavbrudd", "Fra 1. mai til 31. august dekkes utgifter til leiebåt, leiebil og overnatting når en dekket skade gjør at båten ikke kan brukes til en planlagt ferie på minst sju dager. Utgiftene og feriens varighet må dokumenteres.", 4, "7.2 Kompensasjon ved ferieavbrudd, jf. 10.2 på PDF-side 6"],
  ["bat.ferieavbrudd.dagsbelop", "Ferieavbrudd – beløp per dag", "Inntil 1 500 kr per dag.", 4, "7.2 Kompensasjon ved ferieavbrudd"],
  ["bat.ferieavbrudd.dager", "Ferieavbrudd – antall dager", "Inntil 14 dager.", 4, "7.2 Kompensasjon ved ferieavbrudd"],
];

const gjensidigeMotorDocuments = [
  ["gjensidige-mc-delkasko", "45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7", "MC", "Delkasko"],
  ["gjensidige-mc-kasko", "735f518bd45c6470965c1ea6be2f596b6504cee9a09c47718a629ed319db5e58", "MC", "Kasko"],
  ["gjensidige-bobil-delkasko", "978ff27d1df6f978775356ec1a65c164a2d18d2912d1b13bb63b99a110e1f1fd", "Bobil", "Delkasko"],
  ["gjensidige-bobil-kasko", "7971a0170cf272cacec8e9da23633fa630245631d04e99f455b174dd3a2fc734", "Bobil", "Kasko"],
  ["gjensidige-bobil-pluss", "64eff6544529afba60722892de07b2db9ee8c3d0b0123001cbb7dfedfcd7e7d7", "Bobil", "Pluss"],
] as const;

function gjensidigeMotorDocumentId(productId: string, type: "MC" | "Bobil") {
  return `mc-bobil:${productId}-vilkar.pdf:${type.toLowerCase()}`;
}

function gjensidigeMotorUrl(type: "MC" | "Bobil", level: string) {
  return `https://www.gjensidige.no/files/privat/vilkar/kjoretoy/${type}-${level}-alminnelige-vilkar.pdf`;
}

const glassRows: ReviewedRow[] = [
  ["glass.reparasjon.grense", "Glassreparasjon – beløpsgrense", "Inntil 1 000 kr i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Glass"],
  ["glass.skifte.grense", "Glassbytte – beløpsgrense", "Ubegrenset i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Glass"],
];

const bobilGlassRows: ReviewedRow[] = [
  ["glass.dekning", "Glasskade", "Bruddskade på ruter eller glasstak; reparasjon og skifte omfattes etter vilkårets regler.", 1, "Forsikringsbevis – Glass, jf. Hvilke skader? side 3"],
  ["glass.begrensning", "Glasskade – begrensninger", "Solcellepanel regnes ikke som glasskade. Vilkåret henviser slike skader til kaskodekningen.", 3, "Forsikringsbevis – Hvilke skader?"],
];

const mcKaskoRows: ReviewedRow[] = [
  ["ladekabel.dekning", "Ladekabel", "Tyveri av eller ytre skade på ladekabel til el-motorsykkel.", 1, "Forsikringsbevis – Ladekabel, jf. Hva er forsikret? side 3"],
  ["ladekabel.egenandel", "Ladekabel – egenandel", "2 000 kr i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Ladekabel", "coverage"],
];

function matchesDocument(source: CatalogSource | undefined, expected: ReviewedDocument): source is CatalogSource {
  return source?.id === expected.id && source.sha256 === expected.sha256 &&
    source.termsNumber === expected.termsNumber && source.effectiveFrom === expected.effectiveFrom &&
    source.agreementScope === "ordinary";
}

export function addBoatMotorMarketEvidence(
  sources: Record<string, CatalogSource>,
  facts: Record<string, CatalogFact[]>,
  products: readonly CatalogProduct[],
): void {
  const productById = new Map(products.map(product => [product.productId, product]));

  function applyRows(
    productId: string, version: string | null, document: ReviewedDocument, rows: ReviewedRow[],
    productDocument = document,
    component = productId,
    removedKeys: string[] = [],
  ) {
    const product = productById.get(productId);
    const source = sources[document.id];
    const existingFacts = facts[component];
    if (!existingFacts || !product || product.agreementScope !== "ordinary" || product.version !== version ||
      product.sourceId !== productDocument.id || !product.componentIds?.includes(component) ||
      !matchesDocument(sources[productDocument.id], productDocument) ||
      !matchesDocument(source, document) || source.sourceType !== "full_terms" ||
      source.insuranceType !== product.insuranceType || source.providerId !== product.providerId ||
      (source.productIds && !source.productIds.includes(productId))) return;

    const reviewedKeys = new Set([...removedKeys, ...rows.map(([key]) => key)]);
    facts[component] = [
      ...existingFacts.filter(fact => !reviewedKeys.has(fact.key)),
      ...rows.map(([key, label, value, page, section, deductibleClassification, coverageAvailability]) => ({
        key, label, value,
        ...(deductibleClassification ? { deductibleClassification } : {}),
        ...(coverageAvailability ? { coverageAvailability } : {}),
        source: {
          documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, url: source.url, company: source.company,
          version: source.version, agreementScope: source.agreementScope, page, section,
        },
      })),
    ];
  }

  applyRows("if-bat-delkasko", "2023-02-01", ifBoat, ifBoatCommon);
  applyRows("if-bat-kasko", "2023-02-01", ifBoat, [...ifBoatCommon, ...ifBoatKasko]);
  applyRows("if-bat-super", "2023-02-01", ifBoat, [...ifBoatCommon, ...ifBoatKasko, ...ifBoatSuper]);

  const frendeEdition = frendeBoat.effectiveFrom;
  const frendeFire = "frende-bat-brann-og-tyveri";
  applyRows(frendeFire, frendeEdition, frendeBoat, [
    ["bat.redning.dekning", "Redning og berging", "Brann og tyveri dekker bergelønn. Den øvrige redningsdekningen i punkt 5.3 inngår i Kasko og Utvidet.", 3, "4.1 nr. 4, jf. 5.1 og 5.3", undefined, "unavailable"],
    ["bat.redning.bergelonn", "Bergelønn", "Ansvar for bergelønn dekkes etter reglene om berging i sjøloven.", 3, "4.1 nr. 4 Brann og tyveri"],
  ], frendeBoat, frendeFire + ":" + frendeEdition);
  for (const level of ["kasko", "utvidet"]) {
    const productId = "frende-bat-" + level;
    const extended = level === "utvidet";
    applyRows(productId, frendeEdition, frendeBoat, [
      ...frendeBoatKasko,
      ...frendeBoatRecovery(extended),
      ...(extended ? frendeBoatExtended : []),
    ], frendeBoat, productId + ":" + frendeEdition, ["bat.redning.geografi", "bat.redning.grense"]);
  }

  if (!sources[gjensidigeBoatDelkasko.id]) sources[gjensidigeBoatDelkasko.id] = gjensidigeBoatDelkasko;
  const looseGearCap = "50 000 kr for løst utstyr og personlige eiendeler i båten.";
  applyRows("gjensidige-bat-delkasko", null, gjensidigeBoatDelkasko,
    gjensidigeBoatCommon(2, 2, 4, 10, looseGearCap), gjensidigeBoatOverview);
  applyRows("gjensidige-bat-kasko", null, gjensidigeBoatKasko,
    gjensidigeBoatCommon(3, 2, 5, 11, looseGearCap), gjensidigeBoatOverview);
  applyRows("gjensidige-bat-pluss", null, gjensidigeBoatPluss, [
    ...gjensidigeBoatCommon(4, 3, 6, 12, "Ubegrenset for løst utstyr og personlige eiendeler i båten."),
    ...gjensidigeBoatPlussRows,
  ], gjensidigeBoatOverview);

  for (const [productId, sha256, type] of gjensidigeMotorDocuments) {
    const document = { id: gjensidigeMotorDocumentId(productId, type), sha256, termsNumber: "", effectiveFrom: "" };
    applyRows(productId, null, document, [
      ...glassRows,
      ...(type === "Bobil" ? bobilGlassRows : []),
      ...(productId === "gjensidige-mc-kasko" ? mcKaskoRows : []),
    ]);
  }
}

export const boatMotorMarketArchives = [
  {
    provider: "if",
    slug: "bat-bat2-1",
    archivePath: "catalog/sources/boat-pet/if-boat-terms.pdf",
    sources: [[ifBoat.id, ifBoat.effectiveFrom, ifBoatUrl]],
  },
  {
    provider: "gjensidige",
    slug: "bat-delkasko",
    archivePath: "catalog/sources/boat-pet/gjensidige-boat-delkasko-terms.pdf",
    sources: [[gjensidigeBoatDelkasko.id, gjensidigeBoatDelkasko.effectiveFrom, gjensidigeBoatDelkasko.url]],
  },
  ...gjensidigeMotorDocuments.map(([productId, , type, level]) => ({
    provider: "gjensidige",
    slug: productId.slice("gjensidige-".length),
    archivePath: `catalog/sources/mc-bobil/${productId}-vilkar.pdf`,
    sources: [[gjensidigeMotorDocumentId(productId, type), "", gjensidigeMotorUrl(type, level)]] as const,
  })),
] as const;
