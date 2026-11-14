import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type FactRow = [
  key: string, label: string, value: string, section: string, page: number,
  availability?: CatalogFact["coverageAvailability"],
  deductible?: CatalogFact["deductibleClassification"],
];

type Level = [suffix: string, name: string, rows: FactRow[]];

const sources: Record<string, CatalogSource> = {};
const products: CatalogProduct[] = [];
const addOns: CatalogAddOn[] = [];
const facts: Record<string, CatalogFact[]> = {};

function terms(
  providerId: string, company: string, insuranceType: "Bil" | "Hus", filename: string,
  documentName: string, url: string, sha256: string, pageCount: number,
  effectiveFrom = "", termsNumber = "",
): CatalogSource {
  const id = `new-private:${filename}`;
  const source: CatalogSource = {
    id, providerId, company, insuranceType, documentName, filename, url, sha256, termsNumber,
    effectiveFrom, sourceType: "full_terms", agreementScope: "ordinary", physicalPages: [1, pageCount],
    productIds: [], ...(termsNumber ? { version: termsNumber } : {}),
  };
  sources[id] = source;
  return source;
}

function bindFacts(source: CatalogSource, componentId: string, rows: FactRow[]) {
  facts[componentId] = rows.map(([key, label, value, section, page, coverageAvailability, deductibleClassification]) => ({
    key: source.insuranceType === "Hus" ? `hus.${key}` : key,
    label, value,
    ...(coverageAvailability ? { coverageAvailability } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: source.id, section, page, filename: source.filename, company: source.company,
      url: source.url, termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
      version: source.version, agreementScope: "ordinary",
    },
  }));
}

function addLevels(source: CatalogSource, levels: Level[]) {
  for (const [suffix, name, rows] of levels) {
    const productId = `${source.providerId}-${source.insuranceType!.toLowerCase()}-${suffix}`;
    source.productIds!.push(productId);
    bindFacts(source, productId, rows);
    products.push({
      providerId: source.providerId!, company: source.company!, insuranceType: source.insuranceType!,
      productId, name, version: source.version ?? (source.effectiveFrom || null), sourceId: source.id,
      componentIds: [productId], agreementScope: "ordinary",
    });
  }
}

function addOptionalCover(
  source: CatalogSource, id: string, name: string, requiresLevel: string[], rows: FactRow[],
) {
  const optionSource: CatalogSource = { ...source, id, productIds: requiresLevel };
  sources[id] = optionSource;
  bindFacts(optionSource, id, rows);
  addOns.push({
    id, name, componentId: id, providerId: source.providerId!, insuranceTypes: [source.insuranceType!],
    requiresLevel, agreementScope: "ordinary",
  });
}

const klpCar = "https://www.klp.no/media/forsikring/Privatbil-";
const klpHouse = "https://www.klp.no/media/forsikring/Vilkar-Hus";

// Disse KLP-originalene oppgir verken utgavekode eller ikrafttredelsesdato.
const klpLiability = terms("klp", "KLP", "Bil", "klp-bil-ansvar.pdf", "Privatbil – Ansvar",
  `${klpCar}Ansvar.pdf`, "7b7c9cf0139af7a4dda95fc37dd7346226f092bd98d10e1fd1e5dea92fa415ea", 16);
const klpPartial = terms("klp", "KLP", "Bil", "klp-bil-delkasko.pdf", "Privatbil – Delkasko",
  `${klpCar}Delkasko.pdf`, "b3acb6a95e44c5315c7c3fe151d359a63040f4ff784b28ff00738a495192e1f9", 18);
const klpComprehensive = terms("klp", "KLP", "Bil", "klp-bil-kasko.pdf", "Privatbil – Kasko",
  `${klpCar}Kasko.pdf`, "3fbfa81e3454a95898f7746f9858f7a173dbf433e5597ce58e08213251c5d477", 18);
const klpMax = terms("klp", "KLP", "Bil", "klp-bil-kasko-maks.pdf", "Privatbil – Kasko Maks",
  `${klpCar}Kasko-maks.pdf`, "d61a75ea110a00367448f674597b777ea20e89df1faf53f76806c440801716a8", 19);
const klpHouseStandard = terms("klp", "KLP", "Hus", "klp-hus.pdf", "Vilkår bygning – Hus",
  `${klpHouse}.pdf`, "6a6e92d877d45e4547c075d2f4ff8967fa3d41d93aad35ba1a919043acfd6cd5", 19);
const klpHouseRot = terms("klp", "KLP", "Hus", "klp-hus-rate.pdf", "Vilkår bygning – Hus utvidet med råte- og insektskader",
  `${klpHouse}-utvidet-med-raate-og-insektskader.pdf`, "4003b4b656437fcfe48703e91bde7d51f52b07f781c68fbbdc82af8062f572cf", 20);
const klpHouseMax = terms("klp", "KLP", "Hus", "klp-hus-maks.pdf", "Vilkår bygning – Hus Maks",
  `${klpHouse}-Maks.pdf`, "de573541144530e4c0b2333d59f4b9493c8ffa7f9d845b4589202f376fec2c22", 21);

function klpCarCommon(legalPage: number, accidentPage: number, settlementPage: number): FactRow[] {
  return [
    ["ansvar.dekning", "Ansvar", "Erstatningsansvar for skade forårsaket av kjøretøyet etter bilansvarsloven.", "Ansvar", 1, "included"],
    ["geografi.dekning", "Geografisk område", "Europa med unntak av Russland, Belarus og Kosovo.", "Hvor forsikringen gjelder", 1],
    ["rettshjelp.dekning", "Rettshjelp", "Juridisk bistand ved tvist som personlig eier, rettmessig bruker eller fører av forsikret kjøretøy.", "Rettshjelp, felles vilkår", legalPage, "included"],
    ["ulykke.omfang", "Fører- og passasjerulykke", "Ulykkesskade for fører og passasjerer som rettmessig oppholder seg i eller ved kjøretøyet, etter vilkårets regler.", "Ulykke, felles vilkår", accidentPage],
    ["egenandel.generell", "Avtalt egenandel", "Egenandelen følger forsikringsbeviset med særregler i oppgjørsvilkåret.", "Egenandel og aldersfradrag", settlementPage, undefined, "reference"],
    ["egenandel.ung", "Fører under 23 år – egenandel", "10 000 kroner i tillegg hvis føreren er under 23 år og bruk av fører under 23 år ikke er avtalt og fremgår av forsikringsbeviset.", "Egenandel og aldersfradrag", settlementPage, undefined, "coverage"],
  ];
}

function klpCarPartial(settlementPage: number, assistance: string): FactRow[] {
  return [
    ["brann.dekning", "Brann", "Brann, lynnedslag og eksplosjon.", "Brann", 1, "included"],
    ["tyveri.dekning", "Tyveri", "Tyveri, tyveriforsøk og hærverk i forbindelse med forsøk på å stjele bilen eller deler av den.", "Tyveri", 2, "included"],
    ["glass.dekning", "Glass", "Plutselig ytre bruddskade på glassrute og glasstak, ved reparasjon eller utskifting. Brudd i lykteglass er unntatt.", "Glass", 2, "included"],
    ["glass.grense.bytte", "Glass – erstatningsgrense", "Inntil 50 prosent av kjøretøyets verdi før skaden.", "Glass", 2],
    ["glass.egenandel.reparasjon", "Glass – reparasjon", "Ingen egenandel ved reparasjon.", "Egenandel og aldersfradrag", settlementPage, undefined, "override"],
    ["veihjelp.dekning", "Veihjelp", assistance, "Veihjelp", 2, "included"],
  ];
}

const klpCarCollision: FactRow = ["kasko.dekning", "Kaskoskade",
  "Sammenstøt, utforkjøring, velt, hærverk, annen plutselig ytre påvirkning og feilfylling av drivstoff.", "Kasko", 3, "included"];

addLevels(klpLiability, [["ansvar", "Ansvar", klpCarCommon(2, 3, 6)]]);
addLevels(klpPartial, [["delkasko", "Delkasko", [
  ...klpCarCommon(4, 5, 8), ...klpCarPartial(8, "Berging ved dekningsmessig skade og andre angitte hendelser, etter reglene for redning i og utenfor Norden."),
  ["bagasje.grense", "Eiendeler i bilen", "Inntil 10 000 kroner for eiendeler i personbil, med angitte unntak.", "Hva forsikringen omfatter", 1],
]]]);
addLevels(klpComprehensive, [["kasko", "Kasko", [
  ...klpCarCommon(4, 5, 8), ...klpCarPartial(8, "Berging ved dekningsmessig skade og andre angitte hendelser, etter reglene for redning i og utenfor Norden."), klpCarCollision,
  ["bagasje.grense", "Eiendeler i bilen", "Inntil 10 000 kroner for eiendeler i personbil, med angitte unntak.", "Hva forsikringen omfatter", 1],
  ["leiebil.dekning", "Leiebil", "Leiebil ved dekningsmessig skade på personbil, med KLPs godkjenning.", "Leiebil Kasko", 3, "included"],
  ["leiebil.dager", "Leiebil – varighet", "Inntil 30 dager etter dekningsmessig skade på personbil. Leiebilklasse B hos Hertz og godkjenning fra KLP.", "Leiebil Kasko", 3],
  ["leiebil.kontant", "Leiebil – kontantkompensasjon", "250 kroner per dag i normal reparasjonstid, inntil 30 dager, som alternativ til leiebil.", "Leiebil Kasko", 3],
  ["nyverdi.alder", "Totalskadegaranti – alder", "Innen ett år etter registrering av bilen som fabrikkny på sikrede.", "Erstatning som ny", 7],
  ["nyverdi.km", "Totalskadegaranti – kilometer", "Inntil 20 000 km.", "Erstatning som ny", 7],
  ["nyverdi.skadegrad", "Totalskadegaranti – vilkår", "Reparasjon må koste mer enn 80 prosent av nyanskaffelsesverdien. Vilkåret begrenser adgangen blant annet ved leasing og tidligere vesentlig skade.", "Erstatning som ny", 7],
]]]);
addLevels(klpMax, [["kasko-maks", "Kasko Maks", [
  ...klpCarCommon(5, 6, 9), ...klpCarPartial(9, "Berging ved dekningsmessig skade og andre angitte hendelser, etter reglene for redning i og utenfor Norden."), klpCarCollision,
  ["bagasje.grense", "Eiendeler i bilen", "Inntil 15 000 kroner.", "Maks", 3],
  ["tilbehor.grense", "Fastmontert tilleggsutstyr", "Inntil 50 000 kroner for lovlig fastmontert tilleggsutstyr.", "Maks", 3],
  ["leiebil.dekning", "Leiebil", "Utvidet dekning ved dekningsmessig skade på personbil, med KLPs godkjenning.", "Leiebil Maks", 4, "included"],
  ["leiebil.dager", "Leiebil – varighet", "Inntil 45 dager etter dekningsmessig skade på personbil. Klasse A, B eller C etter tilgjengelighet hos Hertz og med KLPs godkjenning.", "Leiebil Maks", 4],
  ["leiebil.kontant", "Leiebil – kontantkompensasjon", "250 kroner per dag i normal reparasjonstid, inntil 45 dager, som alternativ til leiebil.", "Leiebil Maks", 4],
  ["nyverdi.alder", "Totalskadegaranti – alder", "Inntil tre år etter registrering av bilen som fabrikkny på sikrede.", "Erstatning som ny", 8],
  ["nyverdi.km", "Totalskadegaranti – kilometer", "Inntil 60 000 km.", "Erstatning som ny", 8],
  ["nyverdi.skadegrad", "Totalskadegaranti – vilkår", "Reparasjon må koste mer enn 80 prosent av nyanskaffelsesverdien. Vilkåret begrenser adgangen blant annet ved leasing og tidligere vesentlig skade.", "Erstatning som ny", 8],
  ["maskinskade.dekning", "Maskinskade", "Plutselig, tilfeldig mekanisk eller elektrisk brudd på motor, girkasse eller drivverk for fremdrift.", "Maks", 3, "included"],
  ["maskinskade.alder", "Maskinskade – alder", "Dekningen opphører når bilen blir 10 år.", "Egenandel og aldersfradrag – Bil Maks", 9],
  ["maskinskade.egenandel", "Maskinskade – egenandel", "Avtalt egenandel inntil 100 000 km, deretter 20, 50 eller 80 prosent etter kilometertrinn; minst avtalt egenandel.", "Egenandel og aldersfradrag – Bil Maks", 9, undefined, "coverage"],
  ["bilnokkel.dekning", "Bilnøkkel", "Mistet, stjålet eller ødelagt nøkkel, inkludert programmering og omkoding hos godkjent fagperson, inntil 12 000 kroner.", "Maks", 3, "included"],
  ["bilnokkel.egenandel", "Bilnøkkel – egenandel", "750 kroner.", "Egenandel og aldersfradrag", 9, undefined, "override"],
  ["bonus.parkert", "Parkeringsskade – bonus", "Ingen bonustap ved kvalifiserende kaskoskade inntil 30 000 kroner, før bilen blir 10 år og med øvrige vilkår for parkert bil.", "Hvilke skader som ikke gir bonustap", 10],
]]]);

function klpHouseCommon(liabilityPage: number, legalPage: number, settlementPage: number, deductiblePage: number): FactRow[] {
  return [
    ["bygninger.dekning", "Forsikret bygning", "Bygningen i forsikringsbeviset og fastmontert utstyr.", "Hva forsikringen omfatter", 1, "included"],
    ["brann.dekning", "Brann", "Brann, nedsoting og eksplosjon.", "Standard dekning – Hus", 1, "included"],
    ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag og elektrisk fenomen.", "Standard dekning – Hus", 1, "included"],
    ["vann.utstromming", "Vann fra rør og tilknyttet utstyr", "Lekkasje fra bygningens rør og tilknyttet utstyr, samt angitte installasjoner, akvarium og kjøleskap eller fryser.", "Standard dekning – Hus", 1],
    ["vann.terreng", "Vann fra terreng og grunn", "Direkte inntrenging som gir synlig vannspeil over laveste gulv. Vann i oppforet gulv regnes ikke som frittstående.", "Standard dekning – Hus", 2],
    ["ror.brudd", "Rørbrudd", "Brudd på innvendige og utvendige rør, og enkelte tilknyttede tanker, kummer og pumper.", "Standard dekning – Hus", 2],
    ["tyveri.dekning", "Tyveri og innbrudd", "Tyveri fra bygning og skade som følge av tyveriet.", "Standard dekning – Hus", 2, "included"],
    ["naturskade.dekning", "Naturskade", "Lovbestemt dekning for blant annet storm, flom, skred og stormflo.", "Standard dekning – Hus", 2, "included"],
    ["naturskade.egenandel", "Naturskade – egenandel", "Vilkåret oppgir 8 000 kroner.", "Egenandeler", deductiblePage, undefined, "override"],
    ["brukstap.dekning", "Ubeboelig bolig", "Tap når boligen ikke kan brukes i normal reparasjons- eller gjenoppføringstid etter en dekningsmessig skade.", "Standard dekning – Hus", 2, "included"],
    ["rydding.dekning", "Riving, rydding og deponering", "Utgifter til riving, rydding, bortkjøring og deponering av verdiløse eller miljøfarlige bygningsrester.", "Standard dekning – Hus", 2, "included"],
    ["ansvar.dekning", "Ansvar som eier", "Erstatningsansvar som eier av forsikret eiendom for skade på andre personer eller deres ting.", "Ansvar, felles vilkår", liabilityPage, "included"],
    ["rettshjelp.dekning", "Rettshjelp", "Juridisk bistand ved tvist som eier av forsikret eiendom, med vilkårets krav og unntak.", "Rettshjelp, felles vilkår", legalPage, "included"],
    ["gjenoppforing.hovedregel", "Fullverdiforsikret bygning", "Oppgjør ved utbedring eller gjenoppføring som nærmere bestemt i fullverdireglene.", "Fullverdiforsikret bygning", settlementPage],
  ];
}

addLevels(klpHouseStandard, [["hus", "Hus", [
  ...klpHouseCommon(5, 6, 9, 11),
  ["hage.objekter", "Hageanlegg", "Inntil 250 000 kroner ved andre dekningsmessige skader enn brann og naturskade. Vilkåret oppgir ubegrenset erstatning ved brann og naturskade.", "Hva forsikringen omfatter", 1],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Skade på tilstøtende rom når vannet kommer fra bygningens rørledning eller tilknyttet utstyr.", "Standard dekning – Hus", 2],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Gulv og vegger som skal tåle vann er unntatt under standarddekningen.", "Standard dekning – Hus, unntak", 2],
  ["rate.dekning", "Råte og sopp", "Råte, sopp og insektskader er unntatt under standarddekningen.", "Standard dekning – Hus, unntak", 3, "unavailable"],
]]]);
addLevels(klpHouseRot, [["utvidet-rate-og-insektskader", "Hus utvidet med råte- og insektskader", [
  ...klpHouseCommon(6, 7, 10, 12),
  ["hage.objekter", "Hageanlegg", "Inntil 250 000 kroner ved andre dekningsmessige skader enn brann og naturskade. Vilkåret oppgir ubegrenset erstatning ved brann og naturskade.", "Hva forsikringen omfatter", 1],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Skade på tilstøtende rom når vannet kommer fra bygningens rørledning eller tilknyttet utstyr.", "Standard dekning – Hus", 2],
  ["rate.dekning", "Råte og sopp", "Skader fra råtesopper og insekter på hovedbygningen med angitte avgrensninger. VIS Forsikring behandler skaden.", "Utvidet dekning – råte- og insektskader", 4, "included"],
  ["skadedyr.bygningsskade", "Skadedyr – bygningsskade", "Skader fra mus, rotter og andre skadedyr på hovedbygningen, med angitte avgrensninger.", "Utvidet dekning – råte- og insektskader", 4],
  ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "Bekjempelse av angitte skadeinsekter og skadedyr i hovedbygningen, med avgrensninger blant annet for allerede påbegynt aktivitet.", "Utvidet dekning – råte- og insektskader, s. 4–5", 4],
]]]);
addLevels(klpHouseMax, [["hus-maks", "Hus Maks", [
  ...klpHouseCommon(7, 8, 11, 13),
  ["hage.objekter", "Hageanlegg", "Inntil 500 000 kroner ved andre dekningsmessige skader enn brann og naturskade. Vilkåret oppgir ubegrenset erstatning ved brann og naturskade.", "Hva forsikringen omfatter", 1],
  ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Vannskade på tilstøtende rom som følge av utett bad.", "Utvidet dekning Hus Maks", 5],
  ["vatrom.selverommet", "Våtrom – selve rommet", "Dekker kvalifiserende fagfeil i hovedbygningen hvis våtromsdekning fremgår av forsikringsbeviset. Skaden må konstateres innen ti år etter arbeidet, med rettidig reklamasjon.", "Utvidet dekning Hus Maks – Håndverksfeil våtrom", 4],
  ["takvegg.folgeskade", "Vann gjennom tak eller yttervegg", "Plutselig vanninntrenging gjennom utett konstruksjon over bakkeplan. Utbedring av utettheten og inntrenging gjennom tak eldre enn 50 år er unntatt.", "Utvidet dekning Hus Maks – utett tak/vegg, s. 4–5", 5],
  ["handverker.folgeskade", "Håndverkerfeil", "Plutselig, uforutsett følgeskade på hovedbygning etter dokumentert fagfeil, konstatert innen ti år etter arbeidet og med rettidig reklamasjon.", "Utvidet dekning Hus Maks – andre bygningsskader", 4],
  ["ror.tining", "Tining av utvendig rør", "Inntil 50 000 kroner én gang per år for nødvendig tining.", "Utvidet dekning Hus Maks", 5],
  ["rate.dekning", "Råte og sopp", "Skade fra råtesopper på hovedbygning, med vilkårets unntak. VIS Forsikring behandler skaden.", "Utvidet dekning Hus Maks", 5, "included"],
  ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "Bekjempelse av angitte skadeinsekter, mus og rotter i hovedbygningen via VIS Forsikring.", "Utvidet dekning Hus Maks", 5],
  ["skadedyr.bygningsskade", "Skadedyr – bygningsskade", "Skade på hovedbygning fra rotter, mus og andre skadedyr, med vilkårets unntak.", "Utvidet dekning Hus Maks", 5],
]]]);

const landkredittTerms = "https://www.landkreditt.no/globalassets/forsikring/vilkar";
const landkredittCar = terms("landkreditt", "Landkreditt", "Bil", "landkreditt-bil.pdf", "Motorvogn – vilkår",
  `${landkredittTerms}/vilkar-motorvogn.pdf`, "5459d712e9c59125646314bff36af58a4a1a839c3672c1a2d937ef92096df6ca", 15, "2023-09-15");
const landkredittHouse = terms("landkreditt", "Landkreditt", "Hus", "landkreditt-hus.pdf", "Hus og hytte – vilkår",
  `${landkredittTerms}/vilkar-hus-og-hytte.pdf`, "8e173190f1f4cfb1d8f06ae0c34e543a5002fed266018ada5eaad7bea79b252d", 23, "2026-01-01");

const landkredittCarCommon: FactRow[] = [
  ["ansvar.dekning", "Ansvar", "Erstatningsansvar etter bilansvarsloven i Norge og etter skadestedets lovgivning i andre land.", "2.1", 3, "included"],
  ["ansvar.grense", "Ansvar – skade på andre", "Ubegrenset for personskade; inntil 100 millioner kroner ved skade på andres ting.", "2.3", 4],
  ["geografi.dekning", "Geografisk område", "Europa utenom Russland og Belarus. Utenfor EU/EØS gjelder bare ansvar på reiser i inntil tre måneder.", "1.2", 3],
  ["rettshjelp.dekning", "Rettshjelp", "Nødvendige utgifter til juridisk bistand ved tvist som eier, rettmessig bruker eller fører av kjøretøyet.", "9.1", 7, "included"],
  ["rettshjelp.grense", "Rettshjelp – grense", "Inntil 100 000 kroner per tvist etter vilkårets regler.", "9.3", 9],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 prosent av det overskytende.", "9.4", 9, undefined, "override"],
  ["ulykke.invaliditet", "Fører og passasjer – ulykkesskade", "Inntil 200 000 kroner per person, med samlet grense på 1 million kroner ved skade på flere.", "10.3", 12],
  ["ulykke.dod", "Fører og passasjer – dødsfall", "Inntil 100 000 kroner per person.", "10.3", 12],
];
const landkredittCarPartial: FactRow[] = [
  ["brann.dekning", "Brann", "Skade eller tap ved brann, lynnedslag, kortslutning og eksplosjon.", "3.1 a", 4, "included"],
  ["tyveri.dekning", "Tyveri", "Skade eller tap som følge av tyveri eller forsøk på tyveri.", "3.1 b", 4, "included"],
  ["glass.dekning", "Glass", "Skade på glassruter, inkludert soltak; inntil 50 prosent av bilens markedsverdi.", "3.1 c og 3.3 b", 4, "included"],
  ["glass.egenandel.bytte", "Glass – egenandel ved bytte", "2 500 kroner hvis forsikringsbeviset ikke sier noe annet.", "3.4 b", 4, undefined, "standard"],
  ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "Ingen egenandel ved reparasjon av glass.", "3.4 b", 4, undefined, "override"],
  ["brann.egenandel", "Brann og tyveri – egenandel", "4 000 kroner hvis forsikringsbeviset ikke sier noe annet.", "3.4 a", 4, undefined, "standard"],
  ["veihjelp.dekning", "Veihjelp", "Berging og tauing til nærmeste verksted som kan reparere, eller rimeligere reparasjon på stedet, ved driftsstans eller dekningsmessig skade.", "5.1", 5, "included"],
  ["veihjelp.egenandel", "Veihjelp – egenandel", "500 kroner hvis forsikringsbeviset ikke sier noe annet.", "5.4", 5, undefined, "standard"],
];
const landkredittKasko: FactRow[] = [
  ["kasko.dekning", "Kaskoskade", "Sammenstøt, utforkjøring, velt, annen plutselig, tilfeldig ytre påvirkning og feilfylling av drivstoff.", "4.1", 4, "included"],
  ["kasko.egenandel", "Kasko – egenandel", "Det avtalte beløpet fremgår av forsikringsbeviset.", "4.4", 4, undefined, "reference"],
];
const landkredittKaskoStandardEquipment: FactRow = ["tilbehor.bagasje.grense", "Hjul, utstyr og personlig løsøre",
  "Vilkåret oppgir inntil 10 000 kroner med maksimalt 5 000 kroner per gjenstand i punkt 3.3 c.", "3.3 c", 4];
const landkredittRental: FactRow[] = [
  ["leiebil.dekning", "Leiebil", "Utgifter til leiebil ved kvalifiserende kasko- eller tyveriskade. Glasskade alene er unntatt.", "12.1.1–12.1.2", 13, "included"],
  ["leiebil.dager", "Leiebil – varighet", "Inntil 31 dager med forutsetninger og unntak i leiebilvilkåret.", "12.1.1–12.1.3", 13],
  ["leiebil.bilklasse", "Leiebil – beløp per dag", "Inntil 800 kroner per dag, eller 250 kroner per dag i kontantoppgjør når leiebil ikke brukes.", "12.1.3", 13],
];

addLevels(landkredittCar, [
  ["ansvar", "Ansvar", landkredittCarCommon],
  ["delkasko", "Delkasko", [...landkredittCarCommon, ...landkredittCarPartial, landkredittKaskoStandardEquipment,
    ["veihjelp.omfang", "Veihjelp – geografisk område", "Når bare delkasko er valgt, gjelder redningsforsikringen i Norden.", "1.2 c", 3]]],
  ["kasko", "Kasko", [...landkredittCarCommon, ...landkredittCarPartial, ...landkredittKasko, landkredittKaskoStandardEquipment,
    ["nyverdi.unntak", "Totalskade – erstatningsgrunnlag", "Markedsverdi når bilen er tapt eller reparasjon ikke er økonomisk forsvarlig. Ny bil er en egen Kasko Pluss-dekning.", "7.2", 6]]],
  ["kasko-pluss", "Kasko Pluss", [
    ...landkredittCarCommon, ...landkredittCarPartial, ...landkredittKasko, ...landkredittRental,
    ["tilbehor.grense", "Ekstra hjul og utstyr", "Inntil 50 000 kroner for ekstra sett hjul og ekstrautstyr.", "12.4.3 a", 14],
    ["parkering.dekning", "Parkeringsskade", "Skade på parkert bil under ti år som skyldes ukjent motpart.", "12.4.1 c og 12.4.2 a", 14, "included"],
    ["parkering.grense", "Parkeringsskade og uflaks – felles grense", "Inntil 25 000 kroner samlet for parkeringsskade og uflaksdekning, begrenset til ett tilfelle per år.", "12.4.3 b", 14],
    ["bilnokkel.dekning", "Bilnøkkel", "Skade på eller tap av nøkkel under uflaksdekningen, omfattet av felles beløpsgrense.", "12.4.1 d og 12.4.3 b", 14, "included"],
    ["ladekabel.dekning", "Ladekabel", "Skade på eller tap av ladekabel under uflaksdekningen, omfattet av felles beløpsgrense.", "12.4.1 d og 12.4.3 b", 14, "included"],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Bilen må være under tre år og registrert som fabrikkny på forsikringstakeren.", "12.4.1 e", 14],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Inntil 60 000 km.", "12.4.1 e", 14],
    ["leasing.startleie", "Leasing – resterende startleie", "Resterende startleie ved dekningsmessig totalskade på bil som er leaset fabrikkny på forsikringstakeren, under tre år og inntil 60 000 km.", "12.4.1 f og 12.4.3 d", 14],
  ]],
]);
addOptionalCover(landkredittCar, "landkreditt-bil-leiebil", "Leiebil", ["landkreditt-bil-kasko"], landkredittRental);
addOptionalCover(landkredittCar, "landkreditt-bil-maskinskade", "Maskinskade", ["landkreditt-bil-kasko-pluss"], [
  ["maskinskade.dekning", "Maskinskade", "Skade på motor, girkasse, kraftoverføring, styreenhet og batteri, etter vilkårets unntak.", "12.5.1–12.5.2", 14, "included"],
  ["maskinskade.alder", "Maskinskade – alder", "Inntil ti år fra bilen var ny.", "12.5.1", 14],
  ["maskinskade.km", "Maskinskade – kilometer", "Inntil 200 000 km.", "12.5.1", 14],
  ["maskinskade.egenandel", "Maskinskade – egenandel", "10 000 kroner inntil 100 000 km, deretter prosentfradrag etter kilometertrinn med minst 10 000 kroner.", "12.5.4", 15, undefined, "coverage"],
]);

const landkredittHouseCommon: FactRow[] = [
  ["bygninger.dekning", "Forsikret bygning", "Bygning angitt i forsikringsbeviset, med fastmontert utstyr som er vanlig for formålet.", "3.1", 3, "included"],
  ["plutselig.dekning", "Plutselig bygningsskade", "Plutselige og uforutsette skader innenfor begrensningene og unntakene i vilkåret.", "4.1–4.2", 4, "included"],
  ["brann.dekning", "Brann", "Plutselige og uforutsette brannskader; gnist- og sviskader uten brann er unntatt.", "4.1–4.2 b", 4, "included"],
  ["vann.terreng", "Vann fra terreng og grunn", "Plutselig vanninntrenging som gir vannspeil over laveste gulv. Vilkåret har særskilte begrensninger om drenering og utett bygning.", "4.2 k", 4],
  ["brukstap.dekning", "Ubeboelig bolig", "Utgifter hvis boligen blir ubeboelig etter dekningsmessig skade, med egne beregningsregler for reparasjons- eller gjenoppføringstiden.", "5.1.5", 8, "included"],
  ["leietap.skade", "Tapt leieinntekt etter skade", "Tapt leieinntekt i normal reparasjons- eller gjenoppføringstid etter dekningsmessig skade.", "5.1.5", 8],
  ["egenandel.generell", "Avtalt egenandel", "Beløpet følger forsikringsbeviset, med særregler i vilkåret.", "5.2", 8, undefined, "reference"],
  ["ansvar.dekning", "Ansvar som eier", "Erstatningsansvar knyttet til sikredes rolle som eier eller bruker av den forsikrede faste eiendommen.", "7.2–7.4", 10, "included"],
  ["rettshjelp.dekning", "Rettshjelp", "Juridisk bistand i Norden ved tvist som personlig eier av den forsikrede eiendommen.", "8.1–8.2", 13, "included"],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 prosent av overskytende beløp.", "8.7", 14, undefined, "override"],
  ["naturskade.dekning", "Naturskade", "Naturskade på brannforsikret eiendom som følger direkte av en lovbestemt naturulykke.", "9.1–9.2", 16, "included"],
  ["naturskade.egenandel", "Naturskade – egenandel", "Beløpet fastsettes av departementet og oppgis i forsikringsbeviset.", "9.4", 17, undefined, "reference"],
];

addLevels(landkredittHouse, [
  ["standard", "Standard", [
    ...landkredittHouseCommon,
    ["hage.objekter", "Hageanlegg", "Inntil 500 000 kroner for hageanlegg med fast utvendig badeinnretning eller basseng.", "3.2 d", 3],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Vannskade på våtrom eller tilstøtende rom som skyldes utett våtrom eller sanitærrom er unntatt.", "4.2 f", 4],
    ["skadedyr.bygningsskade", "Skadedyr – bygningsskade", "Skade fra dyr dekkes gjennom VIS Forsikring for forsikret boenhet og frittstående garasje, med unntak blant annet for virvelløse dyr.", "4.4.1–4.4.3", 5],
    ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "VIS Forsikring dekker bekjempelse av mus og rotter etter påvist aktivitet.", "4.4.2 nr. 2", 5],
  ]],
  ["utvidet", "Utvidet", [
    ...landkredittHouseCommon,
    ["hage.objekter", "Hageanlegg", "Inntil 1 million kroner for hageanlegg med fast utvendig badeinnretning eller basseng.", "10", 17],
    ["takvegg.folgeskade", "Vann gjennom tak eller yttervegg", "Følgeskade ved plutselig og uforutsett inntrenging gjennom utett tak eller vegg over bakken. Utbedring av selve utettheten er unntatt.", "10.1.1–10.1.2", 17],
    ["takvegg.egenandel", "Tak eller yttervegg – egenandel", "Minst 10 000 kroner for tak eldre enn 30 år, flatt tak, terrasse og overgang mellom terrasse og vegg.", "10.1.3", 17, undefined, "coverage"],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Skade på våtrom og tilstøtende rom etter angitt fagfeil, utført av kvalifisert håndverker eller entreprenør og konstatert senest ti år etter arbeidet.", "10.2.1", 17],
    ["vatrom.egenandel", "Utett våtrom – egenandel", "Minst 10 000 kroner for bad eldre enn 20 år.", "10.2.2", 17, undefined, "coverage"],
    ["handverker.folgeskade", "Håndverkerfeil – følgeskade", "Følgeskade ved angitt fagfeil innen ti år etter arbeid utført av kvalifisert fagperson. Selve feilen eller mangelen erstattes ikke.", "10.3.1, s. 17–18", 18],
    ["rate.dekning", "Råte og sopp", "Bygningsskade fra råtesopp på forsikret bygning dekkes gjennom VIS Forsikring, med angitte unntak.", "10.5.1–10.5.3", 18, "included"],
    ["skadedyr.bygningsskade", "Skadedyr – bygningsskade", "VIS Forsikring dekker bygningsskade fra dyr, med angitte begrensninger og unntak.", "10.5.1–10.5.3", 18],
    ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "VIS Forsikring dekker bekjempelse av skadeinsekter og innvendig bekjempelse av mus og rotter etter påvist aktivitet.", "10.5.2 nr. 4", 18],
    ["tilpasning.grense", "Tilpasning av bolig", "Inntil 500 000 kroner til ombygging for rullestolbruker når vilkårene i punkt 4.3 er oppfylt.", "10", 17],
  ]],
]);
addOptionalCover(landkredittHouse, "landkreditt-hus-utleie", "Utleieforsikring", ["landkreditt-hus-standard", "landkreditt-hus-utvidet"], [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Utleie må fremgå av forsikringsbeviset. Krever skriftlig leieavtale med angitte vilkår blant annet for betaling og sikkerhet.", "11.2.2", 20],
  ["utleie.mislighold", "Utleie – ubetalt husleie", "Inntil seks måneders ubetalt husleie, én gang per leietaker. Rettsmessig tilbakeholdt husleie er unntatt.", "11.2.2 b", 20],
  ["utleie.utkastelse", "Utleie – utkastelse", "Nødvendige utgifter ved utkastelse på grunn av skadeverk eller misligholdt husleie, inntil 20 000 kroner.", "11.2.2 c", 20],
  ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk påført av leietaker.", "11.2.2 a", 20],
]);

const waterCirclesTerms = "https://www.watercircles.no/wp-content/uploads/2026";
const waterCirclesCar = terms("watercircles", "WaterCircles", "Bil", "watercircles-bil.pdf", "Bilforsikring – vilkår",
  `${waterCirclesTerms}/02/WaterCircles-Bil-vilkar-WtCBil-2.19-01.03.26.pdf`, "41b60ce2e10f7b31de13521f7bce3f5deef5cfd749549a8059736997b9284e65", 16,
  "2026-03-01", "WTC-BIL-2.19");
const waterCirclesHouse = terms("watercircles", "WaterCircles", "Hus", "watercircles-hus.pdf", "Villaforsikring – vilkår",
  `${waterCirclesTerms}/06/WaterCircles-Villa-vilkar-WtCVIL-2.17-01.08.2026.pdf`, "133afa1893075c936691a65fd4b736718a304bf3917ce6909a598add09fc27e0", 32,
  "2026-08-01", "WTC-VIL-2.17");

const waterCirclesCarCommon: FactRow[] = [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset med avtalespesifikasjonene går foran vilkårene.", "Bilforsikring – innledning", 3],
  ["ansvar.dekning", "Ansvar", "Erstatningsansvar for person- og tingskade etter bilansvarsloven.", "3.1", 3, "included"],
  ["ansvar.grense", "Ansvar – skade på andre", "Ubegrenset ved personskade; inntil 100 millioner kroner ved tingskade.", "3.1", 3],
  ["rettshjelp.dekning", "Rettshjelp", "Nødvendige utgifter ved tvist som personlig eier, rettmessig bruker eller fører av den forsikrede bilen.", "13.1", 13, "included"],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "5 000 kroner pluss 20 prosent av overskytende beløp.", "7.4.2", 9, undefined, "override"],
  ["ulykke.invaliditet", "Fører og passasjer – medisinsk invaliditet", "Forsikringssum 200 000 kroner per forsikret, med avtalens vilkår for erstatning etter invaliditetsgrad.", "10.5.1", 11],
  ["ulykke.dod", "Fører og passasjer – dødsfall", "Vilkåret oppgir 100 000 kroner hvis forsikrede etterlater ektefelle, partner, folkeregistrert samboer eller forsørget barn. Forsikringssummen må leses sammen med reglene om hvem som får utbetaling.", "10.5.2 og 10.7.3.2, s. 11–12", 11],
];
const waterCirclesPartial: FactRow[] = [
  ["brann.dekning", "Brann", "Brann, lynnedslag og eksplosjon. Kortslutning i batteri alene og oppheting uten åpen ild regnes ikke som brann.", "3.2.1", 4, "included"],
  ["tyveri.dekning", "Tyveri", "Tap eller fysisk skade ved tyveri, brukstyveri eller forsøk på tyveri, med angitte begrensninger.", "3.2.2", 4, "included"],
  ["glass.dekning", "Glass", "Brudd på glassruter og glasstak ved tilfeldig, plutselig ytre påvirkning, med særregler for blant annet solcellepanel og kabriolet.", "3.2.3", 4, "included"],
  ["glass.egenandel.bytte", "Glass – egenandel ved bytte", "3 000 kroner med mindre forsikringsbeviset sier noe annet.", "7.4.4", 9, undefined, "standard"],
  ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "Ingen egenandel ved reparasjon av rute.", "7.4.4", 9, undefined, "override"],
  ["brann.egenandel", "Brann og tyveri – egenandel", "8 000 kroner hvis forsikringsbeviset ikke sier noe annet.", "7.4.3", 9, undefined, "standard"],
  ["veihjelp.egenandel", "Veihjelp – egenandel", "750 kroner hvis forsikringsbeviset ikke sier noe annet.", "7.4.6", 9, undefined, "standard"],
];
const waterCirclesKasko: FactRow[] = [
  ["kasko.dekning", "Kaskoskade", "Skade ved sammenstøt, utforkjøring, velt og annen tilfeldig, plutselig og ytre hendelse, innenfor vilkårets regler.", "3.2.4", 4, "included"],
  ["kasko.egenandel", "Kasko – egenandel", "8 000 kroner hvis forsikringsbeviset ikke sier noe annet, med blant annet særregel ved meldt påkjørsel av løse dyr på vei.", "7.4.5", 9, undefined, "standard"],
  ["veihjelp.dekning", "Veihjelp", "Norden og reiser i inntil tre måneder ellers i Europa der vilkåret gjelder. Kasko inkluderer også bilhjelp hjemme på vilkårets betingelser.", "3.3–3.5", 4, "included"],
];

addLevels(waterCirclesCar, [
  ["ansvar", "Ansvar", waterCirclesCarCommon],
  ["delkasko", "Delkasko", [...waterCirclesCarCommon, ...waterCirclesPartial,
    ["veihjelp.dekning", "Veihjelp", "Assistanse i Norden ved angitte hendelser.", "3.3–3.4", 4, "included"]]],
  ["kasko", "Kasko", [
    ...waterCirclesCarCommon, ...waterCirclesPartial, ...waterCirclesKasko,
    ["bagasje.grense", "Bagasje i bilen", "Inntil 5 000 kroner for relevant tyveri eller skade etter vilkårets regler.", "3.6, s. 4–5", 5],
    ["tilbehor.grense", "Tilleggsutstyr", "Inntil 10 000 kroner for blant annet angitt fastmontert utstyr, lakk og folie.", "3.2 c", 4],
    ["leiebil.dekning", "Leiebil", "Utgifter til leiebil ved kvalifiserende skade, tyveri eller dekningsmessig ansvarsskade. Glasskade alene er unntatt.", "12.1", 12, "included"],
    ["leiebil.dager", "Leiebil – varighet", "Inntil 15 dager ved kvalifiserende skade, tyveri eller dekningsmessig ansvarsskade. Ikke ved glasskade alene.", "12.1–12.3", 12],
    ["leiebil.bilklasse", "Leiebil – beløp per dag", "Inntil 500 kroner per dag for dokumenterte leiebilutgifter.", "12.2", 12],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen ett år etter at kjøretøyet ble registrert som fabrikkny på forsikringstakeren.", "7.3.1", 8],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Bilen må ikke ha kjørt over 20 000 km.", "7.3.1", 8],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Reparasjonsomkostninger over 80 prosent av samlet kjøpesum som ny, med vilkårene i 7.3.1.", "7.3.1", 8],
  ]],
  ["elite", "Elite", [
    ...waterCirclesCarCommon, ...waterCirclesPartial, ...waterCirclesKasko,
    ["bagasje.grense", "Bagasje i bilen", "Inntil 20 000 kroner.", "15 pkt. 6 nr. 2", 15],
    ["tilbehor.grense", "Tilleggsutstyr", "Inntil 40 000 kroner for angitt utstyr, dekor, folie og spesiell lakk.", "15 pkt. 6 nr. 1", 15],
    ["leiebil.dekning", "Leiebil", "Utvidet leiebildekning ved kvalifiserende skade, etter vilkårets regler.", "15 pkt. 3.1", 14, "included"],
    ["leiebil.dager", "Leiebil – varighet", "Hele reparasjonstiden, inntil 45 dager ved kvalifiserende skade.", "15 pkt. 3.1", 14],
    ["leiebil.bilklasse", "Leiebil – beløp per dag", "Tilsvarende egen motorvogn med inntil 700 kroner per dag for privatbil.", "15 pkt. 3.2", 14],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen tre år etter at kjøretøyet ble registrert som fabrikkny på forsikringstakeren.", "15 pkt. 1.1", 13],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Bilen må ikke ha kjørt over 60 000 km.", "15 pkt. 1.1", 13],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Reparasjonsomkostninger over 80 prosent av samlet kjøpesum som ny, med vilkårene i punkt 1.1.", "15 pkt. 1.1", 13],
    ["leasing.startleie", "Leasing – innskudd", "Forholdsmessig erstatning for innskudd knyttet til gjenstående hele måneder av leieperioden, inntil 100 000 kroner.", "15 pkt. 1.2", 13],
    ["maskinskade.dekning", "Maskinskade", "Plutselig og uforutsett skade på angitte komponenter i motor, gir eller drivverk, og angitte høyvoltkomponenter for elbil og hybrid.", "15 pkt. 2.1–2.2, s. 13–14", 14, "included"],
    ["maskinskade.alder", "Maskinskade – alder", "Inntil åtte år fra første registreringsdato.", "15 pkt. 2.1", 14],
    ["maskinskade.km", "Maskinskade – kilometer", "Inntil 200 000 km.", "15 pkt. 2.1", 14],
    ["maskinskade.egenandel", "Maskinskade – egenandel", "8 000 kroner før 100 000 km. Deretter 20 prosent, minst 12 000 kroner, eller 40 prosent, minst 16 000 kroner, fra 150 000 km.", "15 pkt. 2.5", 14, undefined, "coverage"],
    ["bilnokkel.dekning", "Bilnøkkel", "Tap, tyveri eller angitt plutselig skade på nøkkel; ny nøkkel, programmering og omkoding, inntil 20 000 kroner.", "15 pkt. 4.1", 14, "included"],
    ["bilnokkel.egenandel", "Bilnøkkel – egenandel", "1 000 kroner.", "15 pkt. 4.2", 14, undefined, "override"],
    ["parkering.dekning", "Parkeringsskade", "Kvalifiserende kaskoskade på parkert kjøretøy inntil 40 000 kroner uten bonustap, med vilkårets aldersgrense og øvrige krav.", "15 pkt. 5.1", 15, "included"],
    ["parkering.egenandel", "Parkeringsskade – egenandel", "Valgt kaskoegenandel.", "15 pkt. 5.2", 15, undefined, "reference"],
  ]],
]);

const waterCirclesHouseCommon: FactRow[] = [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset med avtalespesifikasjonene går foran vilkårene. Villavilkåret gjelder privat eide boliger.", "Bygningsforsikring – Villa", 3],
  ["bygninger.dekning", "Forsikret bygning", "Bygninger angitt i forsikringsbeviset, med vilkårets regler for fastmontert utstyr og mindre uthus.", "A.2.1", 6, "included"],
  ["brann.dekning", "Brann", "Brann, plutselig nedsoting og eksplosjon. Gnist- og sviskader uten brann er unntatt.", "A.1.1", 3, "included"],
  ["elektrisk.dekning", "Lyn og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag, overspenning og brudd på bygningens elektriske kabler.", "A.1.1", 3, "included"],
  ["naturskade.dekning", "Naturskade", "Dekning for naturulykke som skred, storm, flom eller stormflo i Norge etter lov om naturskadeforsikring.", "A.1.2.1", 3, "included"],
  ["vann.utstromming", "Vann, gass og annen væske", "Brudd og utstrømming fra angitte rør og tilknyttet utstyr med egne sikkerhetskrav.", "A.1.3, s. 4–5", 4],
  ["ror.tining", "Tining av utvendig rør", "Dokumenterte utgifter til tining av utvendig rørledning inntil 30 000 kroner én gang.", "A.1.3", 4],
  ["tyveri.dekning", "Tyveri og skadeverk", "Tyveri av og plutselig skadeverk i eller på bygningsdeler, innenfor vilkårets regler.", "A.1.4", 5, "included"],
  ["gjenoppforing.hovedregel", "Fullverdi", "Opp til kostnaden ved å gjenoppføre en tilsvarende eller vesentlig tilsvarende bygning på skadestedet, etter fullverdireglene.", "A.5.1 nr. 1", 7],
  ["egenandel.generell", "Avtalt egenandel", "Egenandelen i forsikringsbeviset eller særskilt egenandel i vilkåret.", "A.5.7", 10, undefined, "reference"],
  ["naturskade.egenandel", "Naturskade – egenandel", "Lovbestemt egenandel. Vilkåret oppgir 8 000 kroner med forbehold om beløpet fastsatt av departementet.", "A.5.7 nr. 1", 10, undefined, "override"],
  ["ansvar.grense", "Ansvar – forsikringssum", "Inntil 5 millioner kroner per skadetilfelle; saksomkostninger kan komme i tillegg.", "B.5", 12],
  ["ansvar.egenandel", "Ansvar – egenandel", "5 000 kroner per skadetilfelle.", "B.6", 13, undefined, "override"],
  ["rettshjelp.dekning", "Rettshjelp", "Nødvendige juridiske utgifter i Norden ved tvist som personlig eier av den forsikrede eiendommen.", "C.1–C.3", 13, "included"],
];

addLevels(waterCirclesHouse, [
  ["standard", "Standard", [
    ...waterCirclesHouseCommon,
    ["hage.objekter", "Hageanlegg", "Inntil 150 000 kroner samlet for angitt hageanlegg, basseng og fast trebrygge, med egen beløpsgrense for brygge.", "A.2.2 nr. 2", 6],
  ]],
  ["elite", "Elite", [
    ...waterCirclesHouseCommon,
    ["hage.objekter", "Hageanlegg", "Inntil 2 millioner kroner samlet for angitt hageanlegg og utvendig basseng, inkludert fast trebrygge inntil 100 000 kroner.", "D B nr. 1", 14],
    ["takvegg.folgeskade", "Vann gjennom tak eller yttervegg", "Innvendig følgeskade ved plutselig inntrenging av vann over bakken. Utbedring av utettheten er unntatt.", "D A nr. 1", 14],
    ["takvegg.egenandel", "Tak eller yttervegg – egenandel", "Ved de angitte inntrengingsstedene økes avtalt egenandel med 25 000 kroner hvis bygningen har vært rammet av slik inntrenging siste 36 måneder.", "D A nr. 1", 14, undefined, "coverage"],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Følgeskade i andre rom fra vann fra utett våtrom.", "D A nr. 3", 14],
    ["handverker.folgeskade", "Håndverkerfeil – følgeskade", "Plutselig direkte følgeskade fra dokumentert fagfeil ved arbeid siste ti år. Utbedring av selve feilen er unntatt.", "D A nr. 4", 14],
    ["rate.dekning", "Råte og sopp", "Bygningsskade fra råtesopp i boligen dekkes etter VIS-vilkåret med angitte unntak.", "D og F 4.1, s. 14 og 24", 24, "included"],
    ["skadedyr.bygningsskade", "Skadedyr – bygningsskade", "Bygningsskade forårsaket av dyr og insekter under vilkårets avgrensninger. Kjæledyrskade og tiltak for å forebygge nytt angrep er unntatt.", "D A nr. 2", 14],
    ["skadedyr.bekjempelse", "Bekjempelse av skadedyr", "VIS-vilkåret dekker bekjempelse av angitte skadeinsekter og innvendig bekjempelse av mus og rotter etter påvist aktivitet.", "F 4.4", 24],
    ["gjenoppforing.totalskade", "Totalskadegaranti", "Ved skade over 75 prosent av gjenoppføringsprisen kan det kreves totalskadeoppgjør uten fradrag for gjenverdier dersom de er revet.", "D C nr. 1", 14],
    ["tilpasning.grense", "Tilpasning av bolig", "Inntil 250 000 kroner for bedre bevegelsesmuligheter i egen bolig, ved angitte tilfeller og minst 50 prosent varig medisinsk invaliditet.", "D C nr. 2", 14],
  ]],
]);
addOptionalCover(waterCirclesHouse, "watercircles-hus-utleie", "Utleieforsikring", ["watercircles-hus-elite"], [
  ["utleie.vilkar", "Utleie – avtalevilkår", "Tillegget må fremgå av forsikringsbeviset og være aktivt da leieavtalen inngås. Krever skriftlig avtale og minst tre måneders depositum eller tilsvarende bankgaranti.", "G pkt. 2", 29],
  ["utleie.mislighold", "Utleie – ubetalt husleie", "Inntil seks måneders avtalt husleie, én gang per leietaker. Egne vilkår gjelder for perioden etter at boligen er tilbakelevert.", "G pkt. 4.1", 30],
  ["utleie.utkastelse", "Utleie – utkastelse", "Rimelige og nødvendige utgifter ved utkastelse, inntil 20 000 kroner.", "G pkt. 4.2", 30],
  ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk av leietaker eller gjester på utleid bolig, tilhørende innbo eller uteareal, inntil 500 000 kroner.", "G pkt. 4.3", 30],
  ["utleie.tyveri", "Utleie – tyveri og underslag", "Tyveri eller underslag begått av leietaker eller husstandsmedlemmer, inntil 200 000 kroner.", "G pkt. 4.4", 30],
  ["utleie.egenandel", "Utleie – egenandel", "Depositum eller bankgaranti trekkes først. Deretter trekkes avtalt egenandel for bygningsskade, minst 10 000 kroner ved hærverk.", "G pkt. 6.2", 31, undefined, "coverage"],
]);

export {
  products as newMotorHomeProducts, sources as newMotorHomeSources,
  facts as newMotorHomeFacts, addOns as newMotorHomeAddOns,
};
