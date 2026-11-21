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
  ["rettshjelp.grense", "Rettshjelp – grense", "Forsikringssummen i forsikringsbeviset gjelder per tvist, også ved flere parter og forsikringer. Uten forhåndsgodkjenning begrenses erstatningen til sikredes antatte økonomiske interesse i saken.", "9.3", 9],
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
    ["tilpasning.grense", "Tilpasning av bolig", "Inntil 250 000 kroner for bedre bevegelsesmuligheter i egen bolig, ved angitte tilfeller og minst 50 prosent varig medisinsk invaliditet.", "D C nr. 2", 20],
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

// Complete the material clauses in the archived private Bil/Hus documents. Page numbers
// below are physical PDF pages. Separate products and selected options retain their scope.
function extendTerms(source: CatalogSource, componentIds: string[], rows: FactRow[]) {
  for (const componentId of componentIds) {
    const target = facts[componentId];
    if (!target) throw new Error(`Unknown motor/home component: ${componentId}`);
    for (const [key, label, value, section, page, coverageAvailability, deductibleClassification] of rows) {
      const qualifiedKey = source.insuranceType === "Hus" ? `hus.${key}` : key;
      if (target.some(fact => fact.key === qualifiedKey)) throw new Error(`Duplicate motor/home fact: ${componentId}/${qualifiedKey}`);
      target.push({ key: qualifiedKey, label, value,
        ...(coverageAvailability ? { coverageAvailability } : {}),
        ...(deductibleClassification ? { deductibleClassification } : {}),
        source: { documentId: source.id, section, page, filename: source.filename, company: source.company,
          url: source.url, termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
          version: source.version, agreementScope: "ordinary" },
      });
    }
  }
}

function klpGeneralRows(start: number): FactRow[] {
  return [
    ["avtale.generelle", "Avtaledokumenter og lovverk", "Forsikringsbevis, vilkår og sikkerhetsforskrifter går foran fravikelig lov; beviset går foran vilkår og sikkerhetsforskrifter.", "Generelle vilkår – Forsikringsavtalen", start],
    ["avtale.fornyelse", "Varighet og fornyelse", "Avtalen fornyes automatisk ett år om gangen. Kunden må varsle før utløpet for å hindre fornyelse. Selskapet kan varsle manglende fornyelse to måneder før ved særlige grunner.", "Generelle vilkår – Varighet", start],
    ["avtale.oppsigelse", "Oppsigelse i avtaleperioden", "Kunden kan si opp med én måneds varsel ved bortfalt behov, særlige grunner eller flytting til navngitt selskap på oppgitt dato. Restpremie tilbakebetales etter gjenværende periode med avtalens forbehold. Manglende betaling, feil opplysninger, uvanlig mange skader eller grove/gjentatte sikkerhetsbrudd kan gi oppsigelse.", "Generelle vilkår – Opphør i avtaleperioden", start],
    ["avtale.eierskifte", "Eierskifte", "Forsikringen opphører ved eierskifte; gjelder likevel i inntil 14 dager hvis ny eier ikke har tegnet egen forsikring.", "Generelle vilkår – Eierskifte", start],
    ["avtale.forsett", "Grov uaktsomhet og forsett", "Erstatning kan reduseres eller falle bort ved grov uaktsomhet eller forsett. Ansvarsforsikring har særregler i lov eller vilkår.", "Generelle vilkår – Grov uaktsomhet og forsett", start],
    ["avtale.svik", "Svik", "Svik medfører tap av erstatningskrav ved samme hendelse og kan gi oppsigelse av alle avtaler. Premie og kostnader refunderes ikke ved oppsigelse på grunn av svik.", "Generelle vilkår – Svik", start],
    ["egenandel.sammeskade", "Flere dekninger ved samme skade", "Ved utbetaling under flere KLP-dekninger for samme hendelse trekkes bare én egenandel, den høyeste.", "Generelle vilkår – Én egenandel", start + 1],
    ["oppgjor.skjonn", "Skjønn ved tingskade", "Hver part velger en uavhengig skjønnsmann; motparten har én uke etter varsel. Oppmann brukes ved uenighet. Verdsettelsen er bindende innenfor partenes vurderinger. Hver part bærer egen skjønnsmann og halvparten av felleskostnadene, men KLP betaler alt når KLP krever skjønn overfor privatkunde.", "Generelle vilkår – Skjønn", start + 1],
    ["avtale.katastrofe", "Særlige unntak", "Jordskjelv, vulkanutbrudd, atomskade og krig/opprør er unntatt med de uttrykkelige unntakene i produktvilkårene, blant annet lovbestemt naturskadedekning for bygning og angitt lovlig bruk av radioisotoper.", "Generelle vilkår – Særlige begrensninger", start + 2],
    ["avtale.terror", "Terrorbegrensning", "Biologisk, kjemisk eller kjernefysisk terrorforurensning er unntatt. Annen terror har samlet grense 300 millioner kroner per 48-timershendelse og forholdsmessig reduksjon ved overskridelse. Forsikrede ting utenfor Norden dekkes ikke ved terror. Grensen gjelder ikke personskade under bilansvarsloven.", "Generelle vilkår – Terrorhandling", start + 2],
    ["avtale.skaderegister", "Skaderegister", "Meldte skader kan registreres i FOSS med innsynsrett og sletting etter 10 år.", "Generelle vilkår – Felles registre", start + 1],
    ["avtale.personvern", "Personopplysninger", "Nødvendige opplysninger behandles for avtale, skadeoppgjør, klage/regress og bedrageriforebygging; angitt markedsføring og lovpålagte beregninger inngår. Samarbeidspartnere får nødvendige opplysninger. Kunden har personvernrettigheter og innsyn; lagring følger kundeforhold og foreldelsesfrister.", "Generelle vilkår – Personopplysninger", start + 3],
  ];
}

function klpClaimsRows(page: number): FactRow[] {
  return [
    ["oppgjor.skademelding", "Skademelding og dokumentasjon", "Meld skade snarest. Tyveri/ran, skadeverk, brann, personskade og viltskade skal også politianmeldes. Kunden må dokumentere tap og gi korrekte nødvendige opplysninger; utbetaling skjer etter undersøkelser og besiktigelse.", "Generelle oppgjørsregler – Ved skade", page],
    ["oppgjor.reparasjon", "Oppgjørsform og reparatør", "KLP velger reparatør/leverandør og kontantoppgjør, reparasjon eller gjenanskaffelse/gjenoppføring. Skadde ting skal fremvises for mulig reparasjon eller sanering. Kontantoppgjør kan ikke overstige KLPs kostnad. Gjenfunne ting må meldes; beholdes de, tilbakebetales erstatningen.", "Generelle oppgjørsregler – Oppgjør", page],
    ["oppgjor.renter", "Renter", "Renter følger forsikringsavtaleloven § 8-4/18-4. Kunden får ikke renter for forsinkelse som skyldes manglende opplysninger/dokumenter eller urettmessig avvist oppgjør.", "Generelle oppgjørsregler – Renter", page],
    ["ansvar.skadebehandling", "Behandling av ansvarskrav", "KLP utreder, forhandler og fører dekkede krav over egenandelen. Kunden skal møte ved behov og må ikke erkjenne ansvar eller forhandle uten samtykke. Videre kostnader etter KLPs tilbud om forlik dekkes ikke; manglende anke i strid med instruks kan føre til bortfall.", "Generelle oppgjørsregler – Erstatningskrav mot deg", page],
  ];
}

function klpLegalRows(coveragePage: number, settlementPage: number, building: boolean): FactRow[] {
  return [
    ["rettshjelp.vilkar", "Rettshjelp – tvist og utgifter", "Kravet må være fremsatt og helt eller delvis bestridt i avtaleperioden og høre under ordinære domstoler; vedvarende taushet kan regnes som tvist. Advokat, retten, rettsoppnevnte sakkyndige og vitner dekkes; andre sakkyndige har grense 40 prosent av rettshjelpssummen.", "Rettshjelp – Utgifter til juridisk bistand", coveragePage],
    ["rettshjelp.mekling", "Rettshjelp – mekling", "Utenrettslig mekling hos mekle.no kan velges i stedet for ordinær bistand. Egen advokat i meklingen dekkes ikke; avsluttet mekling opphever ikke den øvrige rettshjelpsdekningen.", "Rettshjelp – Mekling", coveragePage],
    ["rettshjelp.unntak", "Rettshjelp – sentrale unntak", "Unntatt er yrke/erverv, familie/arv/skifte, ubestridt inkasso, gjeld/konkurs, straffbar handling, advokatsalær og KLPs avslag på rettshjelp. Forvaltningssaker dekkes først fra søksmål etter fullført klage; utlendings- og oppholdssaker er unntatt. Personskade krever skriftlig avslag fra motpart på juridiske kostnader.", "Rettshjelp – Hva som ikke dekkes", coveragePage],
    ["rettshjelp.sakskostnader", "Rettshjelp – kostnadsunntak", "Idømte sakskostnader og rettsgebyr i ankeinstans dekkes ikke. Tilkjente kostnader trekkes fra, unntatt ved dokumentert betalingsudyktig motpart. Tidligere tilkjente kostnader som oppgis i senere ankeforlik dekkes ikke. Tvister med grunnlag før oppstart er unntatt.", "Rettshjelp – Hva som ikke dekkes", coveragePage],
    ["rettshjelp.frist", "Rettshjelp – melding og advokatvalg", "Kunden velger kvalifisert advokat. Søknad skal meldes snarest og senest ett år etter at advokat er engasjert.", "Oppgjørsregler – Rettshjelp", settlementPage],
    ["rettshjelp.grense", "Rettshjelp – samlet sum", "Summen i forsikringsbeviset gjelder per tvist. Ved minst tre forsikrede parter på samme side økes den fra 100 000 til 250 000 kroner. Bare KLP-forsikrede parter dekkes; selskapet kan kreve felles bistand. Uten forhåndsgodkjenning begrenses utgiftene til kundens antatte økonomiske interesse.", "Oppgjørsregler – Én/flere tvister og flere parter", settlementPage],
    ["rettshjelp.dokumentasjon", "Rettshjelp – salær og dokumentasjon", "Timeliste, timesats og betalt egenandel skal dokumenteres. KLP kan følge kostnadene og kreve rettslig salærfastsettelse. Før søksmål dekkes nødvendig bistand; etter søksmål nødvendige kostnader etter tvisteloven § 20-5.", "Oppgjørsregler – Dokumentasjon", settlementPage],
    ["rettshjelp.solgt", "Rettshjelp etter salg", "Tvist som tidligere eier kan dekkes etter at forsikringen opphørte ved salget. Boligtvist ved kjøp før innflytting/egen forsikring kan dekkes når nåværende bolig var forsikret på kjøpstidspunktet.", "Oppgjørsregler – Tvist etter salg/kjøp", settlementPage + 1],
    ...(building ? [
      ["rettshjelp.eiendomunntak", "Rettshjelp – eiendomsbegrensninger", "Annen eiendom, salg med eierskifteforsikring, sameiertvist (med unntak for ulike seksjoner/andeler), trav-/galopphest, ærekrenkelse/nettsjikane og juridiske personer/dødsbo er unntatt. Flere bygg/innbo på samme eiendom gir ikke flere rettshjelpssummer; bygningsforsikringen brukes.", "Rettshjelp – Eiendom og juridiske personer / Oppgjørsregler", coveragePage],
    ] as FactRow[] : []),
  ];
}

for (const [source, componentId, shift] of [
  [klpLiability, "klp-bil-ansvar", -3], [klpPartial, "klp-bil-delkasko", -1],
  [klpComprehensive, "klp-bil-kasko", -1], [klpMax, "klp-bil-kasko-maks", 0],
] as const) {
  const ownDamage = componentId !== "klp-bil-ansvar";
  const max = componentId === "klp-bil-kasko-maks";
  extendTerms(source, [componentId], [
    ...klpGeneralRows(16 + shift), ...klpClaimsRows(7 + shift), ...klpLegalRows(5 + shift, 12 + shift, false),
    ["avtale.personkrets", "Hvem som er forsikret", "Ansvar gjelder forsikringstakeren og enhver rettmessig bruker. Vognskadedekningen gjelder forsikringstakeren, panthaver og andre med eierinteresse når slik dekning er valgt.", "Hvem forsikringen gjelder for", 1],
    ["avtale.objekt", "Forsikret kjøretøy", "Motorvognen i forsikringsbeviset i fabrikk-/importørutførelse, med ekstra hjulsett av samme type, sikkerhetsutstyr og ladekabel. Skadeomfang følger valgt dekning.", "Hva forsikringen omfatter", 1],
    ["tilbehor.unntak", "Gjenstander som ikke omfattes", "Mobiltelefon, penger, verdipapirer, smykker, klokker og ulovlig innførte gjenstander omfattes ikke.", "Hva forsikringen ikke omfatter", 1],
    ["ulykke.avtalevilkar", "Ulykke – personkrets og område", "Dødsfall og medisinsk invaliditet gjelder når angitt i beviset, for rettmessig fører/passasjer i eller ved bilen når bilen eller fast utstyr er direkte skadeårsak. Området er Europa, Israel og Tyrkia. Plutselig ytre ulykkesskade omfatter også angitt fall, vridning i kne/ankel og bestemte brudd etter landing.", "Ulykke – Dødsfall og medisinsk invaliditet", 6 + shift],
    ["ulykke.unntak", "Ulykke – unntak", "Unntatt er kriminalitet/slagsmål (overfall/forsvar dekkes), sykdom og sykelige tilstander, rygglidelse uten ulykkesbrudd, infeksjon uten ulykkesvevsskade, insektstikk/-bitt, psykiske lidelser ICD-10 F 00–F 99, arr under 15 prosent invaliditet, mat-/drikkeforgiftning og medisinsk undersøkelse/behandling/medikamenter. Selvmord har særunntak ved sannsynliggjort akutt sinnsforvirring med ytre årsak.", "Ulykke – Hva som ikke dekkes", 6 + shift],
    ["ulykke.invaliditet", "Ulykke – invaliditetssum", "Inntil 200 000 kroner per person. Tillatt passasjerantall i vognkortet gjelder. Erstatning følger varig medisinsk invaliditet, med samlet tak 100 prosent og fradrag for tidligere funksjonstap/andre medvirkende forhold.", "Oppgjørsregler – Medisinsk invaliditet", 14 + shift],
    ["ulykke.invaliditet.oppgjor", "Ulykke – beregning og tid", "Invaliditet fastsettes tidligst etter ett år og senest ut fra varig tilstand på treårsdagen. Invaliditetstabellen 21.04.1997 del II/III brukes. Over 50 prosent invaliditet legges det dobbelte av graden over 50 til invaliditetsgraden, likevel maksimalt 100 prosent av summen. Tilgjengelig helseopplysninger og eventuell undersøkelse må gis.", "Oppgjørsregler – Ulykke", 14 + shift],
    ["ulykke.dod", "Ulykke – dødsfall", "Ved ulykkesdød innen ett år er summen 100 000 kroner når ektefelle, kvalifisert samboer eller forsørget barn er i live på skadetidspunktet, ellers 10 000 kroner. Forskuddsbetalt invaliditet trekkes fra. Senere ulykkesdød gir bare eventuell invaliditet; annen dødsårsak innen ett år gir ingen av delene.", "Oppgjørsregler – Dødsfall", 15 + shift],
    ["ulykke.mottaker", "Ulykke – mottaker og samlet grense", "Dødsfall utbetales til ektefelle eller arvinger etter lov/testament, eventuelt oppnevnt begunstiget. Samboer krever to års felles folkeregistrert adresse eller felles barn/bopel og adgang til ekteskap. Samlet invaliditets- og dødsfallserstatning er 3 millioner kroner per ulykke, fordelt forholdsmessig ved flere skadelidte.", "Oppgjørsregler – Ulykke", 15 + shift],
    ["avtale.bonus.ordning", "Bonus – opptjening og bonustap", "Bonus gjelder ansvar og kasko. Ti prosentpoeng opptjenes per skadefritt år til 70 prosent, deretter 75 prosent etter ett år. Etter fem skadefrie år med 75 kan 80 velges ved melding. Skade gir normalt høyst ti prosentpoeng tap: 80 til 70, 75 i 1–5 år til 70, mens 75 i minst seks år beholdes med opptjening på nytt fra år 1.", "Oppgjørsregler – Bonus", 10 + shift],
    ["avtale.bonus.unntak", "Skader uten bonustap", "Brann, tyveri, glass, veihjelp, direkte kollisjon med løse dyr på vei, lovbestemt naturulykke og bare leiebilutbetaling gir ikke bonustap. Regulering skjer fra neste hovedforfall; KLP kan kontrollere bonusopplysninger.", "Oppgjørsregler – Bonus", 10 + shift],
    ["avtale.kjorelengde", "Overskredet kjørelengde", "Ved for lang kjørelengde reduseres erstatningen i forhold til betalt og riktig premie, også ved overskridelse i tidligere perioder. Dette gjelder ikke brann, tyveri, glass og veihjelp.", "Oppgjørsregler – Kjørelengde", 11 + shift],
    ["avtale.underforsikring", "Feil premiegrunnlag og identifikasjon", "For lav sum/premiegrunnlag gir forholdsmessig reduksjon og regress ved ansvar. Handlinger fra den som med samtykke er ansvarlig for bilen kan få samme virkning som kundens egne handlinger.", "Oppgjørsregler – Underforsikring og identifikasjon", 11 + shift],
    ["avtale.automatiskopphor", "Automatisk opphør", "Forsikringen opphører automatisk ved melding fra motorvognregisteret om salg, vraking, tyveri eller avregistrering, i henhold til fullmakt i beviset.", "Oppgjørsregler – Automatisk opphør", 11 + shift],
    ...(ownDamage ? [
      ...(!max ? [["tilbehor.grense", "Fastmontert tilleggsutstyr", "Lovlig fastmontert tilleggsutstyr inntil 15 000 kroner.", "Hva forsikringen omfatter", 1]] as FactRow[] : []),
      ["tilbehor.lakk.grense", "Lakk, beskyttelse og folie", `Lakk, lakkbeskyttelse og folie utover original stand inntil ${max ? "40 000" : "20 000"} kroner.`, max ? "Maks" : "Hva forsikringen omfatter", max ? 3 : 1],
      ["glass.unntak", "Glass – begrensninger", "Lykteglass og glass som på grunn av riper/slitasje ikke ville bestått EU-kontroll er unntatt. Utbetaling krever reparasjon eller skifte.", "Glass", 2],
      ["brann.unntak", "Brann – bruksbegrensninger", "Bruk i næring, løp/trening til løp og skader andre er ansvarlige for etter fabrikk-/importør-/selger-/verkstedansvar omfattes ikke av branndekningen.", "Brann – Hva som ikke dekkes", 1],
      ["tyveri.unntak", "Tyveri – annet ansvar", "Skade som fabrikk, importør, selger eller verksted kan holdes ansvarlig for er unntatt.", "Tyveri – Hva som ikke dekkes", 2],
      ["veihjelp.person", "Veihjelp – personer", "Rimeligste nødvendige mertransport hjem eller til bestemmelsessted innen hjemreisekostnaden dekkes ved ulykke, død, plutselig sykdom, tyveri eller upåregnelig driftsstans som ikke repareres innen rimelig tid. Hotell i stedet krever avtale med KLP.", "Veihjelp for person", 2],
      ["veihjelp.transport.grense", "Veihjelp – transport og begrensning", "Bil med tilkoblet tilhenger/campingvogn transporteres til nærmeste kvalifiserte verksted, eller repareres på stedet når rimeligere. Henting/transport ved forsinket reparasjon omfattes. Erstatningen er begrenset til bilens verdi etter skade.", "Veihjelp for motorvognen", 2],
      ["veihjelp.leiebil", "Veihjelp – leiebil utenfor Norden", "Ved redning utenfor Norden når bilen ikke kan repareres innen rimelig tid, kan forhåndsavtalt leiebil dekkes med inntil 350 kroner per dag i maksimalt 45 dager.", "Veihjelp", 3],
      ["reparasjon.kontant", "Reparasjon og kontantoppgjør", "Taksering må avtales; manglende takst kan gi avslag. KLP velger økonomisk/teknisk forsvarlig reparasjon eller likeverdige deler og fradrag for tidligere skade/slitasje. Kontant arbeidskostnad er 50 prosent; avgift må dokumenteres betalt. Egen vask/rydding erstattes med 200 kroner/time.", "Oppgjørsregler – Skade på egen bil", 8 + shift],
      ["reparasjon.unntak", "Reparasjon – merkostnader og verdifall", "Foreløpig reparasjon, flyfrakt, overtid, forbedringer, forandringer, verdiforringelse og tapt garanti erstattes ikke. Utilgjengelige deler kan gjøres opp kontant etter antatt delepris.", "Oppgjørsregler – Skade på egen bil", 8 + shift],
      ["totalskade.oppgjor", "Kondemnasjon og tyveri", "Hvis reparasjon ikke er økonomisk eller teknisk forsvarlig, eller bilen er stjålet/tapt, erstattes markedsverdien og bilen tilfaller KLP.", "Oppgjørsregler – Kondemnasjon", 8 + shift],
      ["tilbehor.dokumentasjon", "Utstyr – dokumentasjon og verdi", "Tilsvarende anskaffelse eller reparasjon prises på skadedagen. KLP kan kreve kjøpsdato, type, verdi, selger og montør dokumentert; mangler kan gi helt eller delvis avslag.", "Oppgjørsregler – Tilleggsutstyr og eiendeler", 9 + shift],
      ["tilbehor.aldersfradrag", "Elektronisk utstyr – aldersfradrag", "Radio, musikk og annet elektronisk utstyr avskrives med 10 prosent per år fra gjenstanden er to år, maksimalt 80 prosent, ut fra nyverdi på skadedagen.", "Oppgjørsregler – Aldersfradrag", 10 + shift],
      ["kasko.egenandel.dyr", "Påkjørsel av dyr – egenandel", "Ingen egenandel ved påkjørsel av løse dyr på vei når politi eller viltnemnd varsles umiddelbart.", "Oppgjørsregler – Egenandel", 9 + shift, undefined, "override"],
      ["tyveri.alarm", "Tyveri – egenandelsreduksjon", "Egenandelen reduseres med 5 000 kroner ved tyveri av/fra bil med aktiv FG-godkjent alarm eller godkjent søke-/gjenfinningsutstyr.", "Oppgjørsregler – Egenandel", 9 + shift, undefined, "override"],
      ["ladekabel.egenandel", "Ladekabel – egenandel", "750 kroner ved tyveri eller skade på ladekabel til elbil.", "Oppgjørsregler – Egenandel", 9 + shift, undefined, "override"],
    ] as FactRow[] : []),
    ...(componentId.includes("kasko") && componentId !== "klp-bil-delkasko" ? [
      ["kasko.unntak", "Kasko – bruksunntak", "Ulovlig terrengkjøring, næringsbruk, løp/trening, rus når kunden visste/burde vite om den og skade som andre kan holdes ansvarlig for, er unntatt.", "Kasko – Hva som ikke dekkes", 3],
      ["nyverdi.unntak", "Ny bil – tilleggsvilkår", "Bilen må ikke tidligere ha hatt skade over ti prosent av nyanskaffelsesverdien, være leaset eller brukt i næring. KLP kan velge kontantoppgjør; grensen er 115 prosent av nyanskaffelsesverdien på kjøpstidspunktet.", "Oppgjørsregler – Erstatning som ny", 8 + shift],
    ] as FactRow[] : []),
    ...(max ? [
      ["maskinskade.unntak", "Maskinskade – unntak", "Annet ansvar, gradvis slitasje/korrosjon, uoriginale deler, ombygging/effektjustering og unormal bruk/belastning er unntatt. Nødvendig demontering/undersøkelser for å avklare dekningsmessig skade erstattes når beløpet overstiger egenandelen.", "Maks", 3],
      ["ulykke.invaliditet.barn", "Ulykke – barn under 16", "Når Bil Maks er valgt, er invaliditetssummen inntil 1 million kroner for barn under 16 år, innen samlet ulykkesgrense på 3 millioner kroner.", "Oppgjørsregler – Ulykke", 15],
      ["parkering.vilkar", "Parkeringsskade – vilkår", "Ukjent skadevolder, parkert bil under 10 år og dekket kaskoskade inntil 30 000 kroner kreves for bonusfritaket. Takst skal avtales og avtaleverksted brukes hvis mulig.", "Oppgjørsregler – Bonus", 10],
    ] as FactRow[] : []),
  ]);
}

for (const [source, componentId, shift] of [
  [klpHouseStandard, "klp-hus-hus", -2],
  [klpHouseRot, "klp-hus-utvidet-rate-og-insektskader", -1],
  [klpHouseMax, "klp-hus-hus-maks", 0],
] as const) {
  const max = componentId === "klp-hus-hus-maks";
  const rot = componentId !== "klp-hus-hus";
  const settlement = 11 + shift;
  const deductible = 12 + shift;
  extendTerms(source, [componentId], [
    ...klpGeneralRows(18 + shift), ...klpClaimsRows(10 + shift), ...klpLegalRows(8 + shift, 16 + shift, true),
    ["personkrets.begrensning", "Hvem forsikringen gjelder for", "Forsikringstaker, ektefelle eller samboer med felles folkeregistrert adresse og innehaver av tinglyst eiendoms-, pante- eller annen sikkerhetsrett i eiendommen.", "Hvem forsikringen gjelder for", 1],
    ["geografi", "Forsikringssted", "Adressen som er nevnt i forsikringsbeviset.", "Hvor forsikringen gjelder", 1],
    ["bygninger.tilbehor", "Ledninger og tilleggsbygg", "Utvendige ledninger med tilknyttet utstyr frem til brønn, tank, spredeledning eller offentlig ledning og drenssystem omfattes. Tilleggsbygg inntil 10 m² har brann/naturdekning uten egen forsikring; eldre avtaler før 17.11.2018 har særregel inntil 250 000 kroner, mens senere bygg må oppgis særskilt.", "Hva forsikringen omfatter", 1],
    ["hage.brygge", "Fast trebrygge", "Brann og naturskade på tilhørende fast trebrygge inntil 100 000 kroner inkludert riving/rydding, med mindre høyere sum står i beviset.", "Hva forsikringen omfatter", 1],
    ["bygninger.unntak", "Objekter som ikke omfattes", "Brønn, borehull, infiltrasjons-/spredeledning, spredegrøft, flytebrygge, molo og andel i felles brygge omfattes ikke.", "Hva forsikringen ikke omfatter", 1],
    ["hage.omfang", "Hageanlegg – omfang", "Hageanlegg og tilførselsvei rundt bygningen omfattes inntil 5 dekar. Basseng/boblebad/badestamp tilkoblet faste ledninger regnes som hageanlegg. Klimatiske skader, frost og skader fra dyr/insekter på hageanlegg og badeinnretning er unntatt.", "Hva forsikringen omfatter / Standard dekning – unntak", 1],
    ["vann.inntrengning_etter_bygningsskade", "Vann etter annen bygningsskade", "Vann gjennom åpning eller utetthet som skyldes en annen dekningsmessig skade omfattes. Vann fra takrenne, utvendig nedløp eller utett overgang til innvendig taksluk er unntatt i grunnvilkåret.", "Standard dekning – vann og unntak", 2],
    ["vaer.dekning", "Snø og vind", "Snøtyngde og vind svakere enn storm omfattes. Naturskade følger egne lovregler; tørke, nedbør, isgang og skader bare på antenner/skilt/markiser samt visse ulovlige bygg/flytende konstruksjoner er unntatt fra naturskadedelen.", "Standard dekning", 2],
    ["plutselig.dekning", "Andre plutselige skader", "Andre plutselige og uforutsette skader omfattes med de samme begrensningene som for de særskilt angitte skadetypene.", "Standard dekning", 2],
    ["plutselig.unntak", "Bruk, utseende og biologiske skader", "Svi/gnist uten brann, flekker, svinn/riss/riper/avskalling/knirk/hakk, vanlig bruk, søl, kondens, bakterier, heksesot, kjæledyr og punktert isolerglass er unntatt. Isolasjon må ha påvist redusert funksjon; rester/ekskrementer uten bygningsskade dekkes ikke.", "Standard dekning – Hva som ikke dekkes", 2],
    ["plutselig.begrensning_ovrig", "Konstruksjon og maskineri – grunnunntak", "Tele, setninger, jordtrykk, sviktende fundament, materiale/konstruksjon/montasje og følgeskader er unntatt i grunnvilkåret, med bare uttrykkelige valgte Maks-utvidelser. Skade alene på mekanisk/elektrisk innretning krever plutselig ytre påvirkning. Hærverk/slitasje fra beboer/bruker i utleid rom er unntatt med særregelen for utleiedekningen.", "Standard dekning – Hva som ikke dekkes", 3],
    ["pabud.dekning", "Offentlige påbud", "Etter dekket skade erstattes nødvendige merutgifter til reparasjon/gjenoppføring, grunnundersøkelser/fundament og vilkår for byggetillatelse. Påbudet må gjennomføres; annet offentlig tilskudd trekkes fra. Arealøkning forholdsberegnes. KLP kan kreve eller selv fremme klage.", "Standard dekning / Oppgjørsregler – Offentlig påbud", 14 + shift],
    ["pabud.vilkar", "Offentlige påbud – unntak", "Påbud som kunne vært gitt uten skaden, opprettholdelse av opprinnelig innvendig areal og midlertidig/rivnings-/ombyggings-/rehabiliteringsbygning omfattes ikke.", "Oppgjørsregler – Offentlig påbud", 14 + shift],
    ["service.alarmutrykning", "Alarmutrykning", "Utgifter til utrykning etter utløst tyveri- eller brannalarm er nevnt som tilleggsutgift etter en skade som dekkes.", "Standard dekning", 2],
    ["gjenoppforing.fullverdigaranti", "Fullverdi – frist og formål", "Ved reparasjon/gjenoppføring av bolig til samme formål på samme sted av kunden eller livsarving innen 5 år gjøres ikke fradrag for verdiøkning fra nytt for gammelt. For øvrige bygg trekkes gevinst over 40 prosent av tidligere omsetningsverdi.", "Oppgjørsregler – Fullverdiforsikret bygning", settlement],
    ["gjenoppforing.annetsted", "Gjenoppføring annet sted eller formål", "Ved annet sted/formål trekkes den delen av økonomisk gevinst som overstiger 40 prosent av bygningens tidligere omsetningsverdi.", "Oppgjørsregler – Fullverdiforsikret bygning", settlement],
    ["forsikringsform", "Førsterisiko", "Førsterisikoforsikret bygning erstattes inntil summen i beviset. Verdiøkning over 40 prosent av tidligere omsetningsverdi trekkes fra.", "Oppgjørsregler – Bygning inntil avtalt sum", settlement],
    ["gjenoppforing.ingen", "Uten gjenoppføring og ved rivning", "Uten reparasjon/gjenoppføring innen 5 år begrenses oppgjøret til nedgang i omsetningsverdi, eventuelt avtalt sum, og aldri høyere enn fullverdioppgjør. Bygg/bygningsdel som skal rives verdsettes til brukbare materialer fratrukket rivningskostnad.", "Oppgjørsregler – Bygning som ikke gjenoppføres", settlement],
    ["underforsikring.begrensning", "Tilbygg og verdiøkning", "Tilbygg, påbygg og verdiøkende endringer må meldes. Uten melding reduseres erstatning etter forholdet mellom verdi før og etter endringen.", "Oppgjørsregler – Underforsikring", settlement],
    ["brukstap.beregning", "Ubeboelig bolig – beregning", "Dekket husleietap følger kontraktsleie. Egne boutgifter må være nødvendige og dokumenterte, inntil markedsleie for umøblert bolig; uten dokumenterte utgifter ytes 50 prosent av beregnet markedsleie. Perioden er normal reparasjons-/byggetid, med fradrag for innsparte utgifter og renter.", "Oppgjørsregler – Tapt husleieinntekt", settlement],
    ["gjenoppforing.kontant", "Arbeid og merverdiavgift", "Uten dokumentert betalte arbeidspenger erstattes 75 prosent av normalpris uten mva på arbeidet. Påløpt mva erstattes mot dokumentasjon. Egen vask/rydding erstattes med 250 kroner/time etter normalt firmatimeforbruk.", "Oppgjørsregler – Arbeidspenger og merverdiavgift", deductible],
    ["egenandel.fritak", "Egenandelsfritak", "Ingen egenandel ved tyveri når aktiv innbruddsalarm varsler alarmsentral, vaktselskap eller nabo via fast avtale, eller skade bare på overspenningsvern, brannalarm eller innbruddsalarm.", "Oppgjørsregler – Egenandel", deductible, undefined, "override"],
    ["vaer.egenandel", "Snø og svak vind – egenandel", "15 000 kroner ved snøtyngde, snøpress, takras og vind svakere enn storm, med mindre høyere egenandel er valgt.", "Oppgjørsregler – Spesielle egenandeler", deductible, undefined, "standard"],
    ["vann.egenandel.gjentatt_vann", "Gjentatt vannskade – ekstra egenandel", "Avtalt egenandel økes 20 000 kroner ved samme skadetype siste 3 år: innvendig rørutstrømming ved tæring/slitasje, terreng/grunnvann eller avløpstilbakeslag.", "Oppgjørsregler – Gjentatte vannskader", deductible, undefined, "coverage"],
    ["ror.egenandel", "Gamle innvendige rør – ekstra egenandel", "Ved brudd på innvendige rør eldre enn 50 år økes avtalt egenandel 10 000 kroner for vannskaden. Eldste konstruksjons-/røralder legges til grunn.", "Oppgjørsregler – Innvendige rør", deductible, undefined, "coverage"],
    ["aldersfradrag.utvendige_ledninger", "Utvendige rør – aldersfradrag", "Rør/bunnledninger med utstyr av annet materiale enn plast:5 prosent per år etter 20 år, maksimalt 80 prosent.", "Oppgjørsregler – Aldersfradrag", 13 + shift],
    ["aldersfradrag.bereder_pumpe", "Bereder, kjel og pumper – aldersfradrag", "Varmtvannsbereder, fyringskjel og pumper/varmepumper:10 prosent per år etter 5 år.", "Oppgjørsregler – Aldersfradrag", 13 + shift],
    ["aldersfradrag.badeinnretning", "Basseng og badeinnretning – aldersfradrag", "Utvendig basseng, boblebad og lignende:10 prosent per år etter 5 år.", "Oppgjørsregler – Aldersfradrag", 13 + shift],
    ["aldersfradrag.oppvarming_kjoling", "Annet varme-/kjøleutstyr – aldersfradrag", "Annen elektrisk installasjon for oppvarming/kjøling, inkludert varmekabler:10 prosent per år etter 10 år.", "Oppgjørsregler – Aldersfradrag", 13 + shift],
    ["aldersfradrag.integrerte_hvitevarer", "Integrerte hvitevarer – aldersfradrag", "Integrerte hvitevarer og kjøle-/fryserom:10 prosent per år etter 5 år. Fradrag gjelder skadd ting og nødvendige totale reparasjonskostnader; eldste del brukes. Er fradraget større enn egenandelen, trekkes bare fradraget.", "Oppgjørsregler – Aldersfradrag", 13 + shift],
    ["hage.oppgjor", "Hage – oppgjør", "Beplantning verdsettes som tilsvarende ung handelsvare. Ved naturskade beregnes hage/tilførselsvei/tomt etter kostnad eller verdifall med særregel om toppsjikt; sikring og forebygging erstattes ikke.", "Oppgjørsregler – Hageanlegg og Naturskade", 13 + shift],
    ["gjenoppforing.prisstigning", "Prisstigning", "Gjennomsnittlig byggekostnadsindeks brukes. Utbetalt prisstigning trekkes fra renter eller omvendt.", "Oppgjørsregler – Prisstigning", 13 + shift],
    ["naturskade.relokalisering", "Naturskade – byggeforbud", "Ved nektet reparasjon/gjenoppføring på grunn av ny naturrisiko erstattes hus og forsikrede uthus som totalskadet og tomtens tidligere omsetningsverdi inntil 5 dekar. Det samme gjelder ustabil grunn selv uten husskade. KLP kan med skriftlig samtykke sikre og vedlikeholde stedet i stedet.", "Oppgjørsregler – Naturskade", 14 + shift],
    ["naturskade.begrensning", "Naturskade – konstruksjon og samlet grense", "Svak konstruksjon, dårlig vedlikehold/tilsyn eller manglende forebygging kan gi avkortning med hensyn til skyld og mulighet til utbedring; liten skyld skal ikke gi avkortning. Samlet selskapsgrense fastsettes av myndighetene (kilden oppgir 16 milliarder) og kan gi forholdsmessig reduksjon. Tvil kan forelegges naturskadenemnda.", "Oppgjørsregler – Naturskade", 15 + shift],
    ["avtale.identifikasjon", "Ektefelle/samboer og panthaver", "Ektefelle/samboers handlinger kan gi samme erstatningsreduksjon som kundens. Betaler KLP panthaver uten ansvar overfor eier, overtar KLP panteretten tilsvarende utbetalingen.", "Oppgjørsregler – Identifikasjon og panthaver", 13 + shift],
    ["ansvar.utvidelser", "Eieransvar – byggherre og forurensning", "Omfatter rettslig ansvar for person-/tingskade konstatert i avtaleperioden, byggherreansvar ved bygg på eiendommen og plutselig uforutsett forurensning.", "Ansvar – Hva som dekkes", 7 + shift],
    ["ansvar.unntak", "Eieransvar – unntak", "Unntatt er yrke/erverv, garanti/avtaleansvar utover lov, lånte/leide/oppbevarte ting, nær familie, egne selskaper/felles eierinteresser, graving/sprengning/peling/spunting/riving, gradvis forurensning/fukt/sopp/råte, smitte, styreansvar og annen eiendom. Motor-/båt-/luftfartøy har særunntak; angitt hobbydroneansvar har grense 750 000 SDR og unntar skade på andre luftfartøy.", "Ansvar – Hva som ikke dekkes", 7 + shift],
    ["utleie.skadeverk", "Utleie – skadeverk", "Forsettlig skadeverk fra leietaker eller dennes medboende ektefelle/samboer/barn på utleid bygning/rom dekkes inntil 40 000 kroner, med egenandel i beviset og kravene til privat utleie.", "Utleiedekning", 3],
    ["utleie.tyveri", "Utleie – tyveri", "Tyveri og tyverirelatert hærverk fra leietaker eller dennes medboende ektefelle/samboer/barn omfattes med egenandel i beviset og vilkårenes krav til privat utleie.", "Utleiedekning", 3],
    ["utleie.mislighold", "Utleie – misligholdt leie", "Inntil 6 måneders ubetalt kontraktsleie fra begjæring om fravikelse sendes namsmannen til boligen er tilbake i eierens besittelse, bare én gang per leietaker. Rettsmessig tilbakeholdt leie er unntatt.", "Utleiedekning", 3],
    ["utleie.utkastelse", "Utleie – utkastelse", "Nødvendig utkastelse ved avsluttet eller misligholdt leieforhold dekkes inntil 20 000 kroner.", "Utleiedekning", max ? 4 : 3],
    ["utleie.vilkar", "Utleie – vilkår og begrensninger", "Bare utleie til privatpersoner uten næringskarakter. Skriftlig avtale må inneholde tvangsfravikelse og depositum/bankgaranti på minst 2 måneders leie før innflytting. Slitasje, flekker/riper/hakk, sopp/råte/mugg/bakterier/insekter/kjæledyr, heksesot, søl og feil/hard bruk dekkes ikke.", "Utleiedekning – Forutsetninger og unntak", 4],
    ...(rot ? [
      ["skadedyr.grunnunntak", "Råte/skadedyr – unntak", "Utvendig treverk, dører/vinduer/lekter, blåved/sverte-/muggsopp, forebygging/vedlikehold, rester/døde dyr uten lukt-/bygningsskade, kjæledyr/husdyr, følgeskader/indirekte tap, utvendige/bunnledninger og dyreutløst brann/vann er unntatt. Kilden har også et særskilt isolasjonsunntak; full ordlyd i originalvilkåret gjelder.", "Råte- og insektskader – Hva som ikke dekkes", max ? 6 : 4],
      ["skadedyr.tid", "Råte/skadedyr – tidsavgrensning", "Skadeutvikling før start eller etter opphør dekkes ikke. Bekjempelse av aktivitet som startet før eller fortsetter etter avtalen er unntatt, med særregel når tidligere gjeldende bygningsforsikring ville dekket aktiviteten ved start. VIS avgjør metode og nødvendig tilgang.", "Råte- og insektskader", max ? 6 : 4],
      ["rate.egenandel", "Råte/skadedyr – egenandel", "4 000 kroner for råte-/insektskade, skade fra rotter/mus og skadedyrbekjempelse.", "Oppgjørsregler – Egenandel", 13 + shift, undefined, "override"],
    ] as FactRow[] : []),
    ...(max ? [
      ["handverker.unntak", "Maks – fagfeil og tak/vegg", "Godkjent/autorisert utførelse og rettidig reklamasjon kreves. Selve feil/utetthet, tak over 50 år, kondens, ufaglært/eget arbeid, løpende garanti/mangelsansvar (med konkurs-/opphørsunntak), kjente feil og mangelfull utførelse uten skade er unntatt.", "Utvidet dekning Maks – Vilkår/unntak", 5],
      ["handverker.egenandel", "Håndverksfeil – egenandel", "10 000 kroner hvis høyere ikke er valgt; ved våtrom eldre enn 30 år legges 10 000 kroner til avtalt egenandel. Følgeskade i tilstøtende rom fra utett våtrom over 30 år har samme tillegg.", "Oppgjørsregler – Håndverksfeil/følgeskade", 12, undefined, "coverage"],
      ["takvegg.egenandel", "Utett tak/vegg – tillegg", "20 000 kroner i tillegg til avtalt egenandel ved flatt tak, tak eldre enn 30 år og terrasse/overgang terrasse/veranda/balkong/altan mot vegg.", "Oppgjørsregler – Utett tak/vegg", 13, undefined, "coverage"],
      ["bygninger.utsmykning", "Maks – kunst og byggeskikk", "Kunstnerisk utsmykning og urasjonell byggeskikk omfattes med inntil 500 000 kroner for hver kategori.", "Utvidet dekning Hus Maks", 5],
      ["tilpasning.grense", "Maks – tilpasning for rullestol", "Bygningsmessig ombygging inntil 250 000 kroner ved ulykke eller barn med medfødt funksjonsnedsettelse som medfører minst 50 prosent invaliditet. Hendelsen/fødselen må skje i avtaleperioden og utgiftene påløpe innen 5 år.", "Utvidet dekning Hus Maks", 5],
    ] as FactRow[] : []),
  ]);
}

function privateGeneralSource(providerId: string, company: string, insuranceType: "Bil" | "Hus", filename: string,
  url: string, sha256: string, pages: number, effectiveFrom: string, termsNumber = ""): CatalogSource {
  const source: CatalogSource = { id: `new-private:motor-home:${providerId}-general:${insuranceType.toLowerCase()}`,
    providerId, company, insuranceType, filename: `private-insurers-general/${filename}`,
    documentName: `${company} – Generelle vilkår`, url, sha256, physicalPages: [1, pages],
    effectiveFrom, termsNumber, version: termsNumber || effectiveFrom, sourceType: "full_terms", agreementScope: "ordinary",
    productIds: products.filter(product => product.providerId === providerId && product.insuranceType === insuranceType).map(product => product.productId),
  };
  sources[source.id] = source;
  return source;
}

const landkredittGeneralRows: FactRow[] = [
  ["avtale.generelle", "Avtaledokumentenes rang", "Forsikringsbevis, sikkerhetsforskrifter i bevisets del 2 og produktvilkår inngår i avtalen. Bevis går foran vilkår/sikkerhetsforskrifter og spesielle regler foran generelle. Fravikelig lov viker for avtalen.", "1.2", 3],
  ["avtale.varighet", "Begynnelse og slutt", "Forsikringen gjelder fra kl 00 på avtalt dato til kl 24 siste dag. Avtale inngått med start samme dag gjelder fra inngåelsestidspunktet. Norske kroner er oppgjørsvaluta hvis annet ikke er avtalt.", "1.1 og1.5", 3],
  ["avtale.fornyelse", "Fornyelse og tidsbegrenset avtale", "Fornyes ett år om gangen med mulige pris-/vilkårsendringer, med mindre oppsigelse eller avtalt tidsbegrensning. Tidsbegrenset forsikring opphører uten varsel.", "2", 3],
  ["avtale.oppsigelse", "Kundens oppsigelse", "Varsle innen utløpet for å unngå fornyelse. I perioden kan kunden si opp ved bortfalt behov, flytting eller særlige grunner med én måneds varsel.", "3.1", 4],
  ["avtale.selskapoppsigelse", "Selskapets oppsigelse", "Ved fornyelse kreves særlige grunner og tomånedersvarsel. I perioden gir svik umiddelbart opphør, manglende legitimering/betaling normalt toukersvarsel og endret risiko, vanskjøtsel, uvanlig skadeforløp, truende opptreden, relevante opplysningsbrudd og gjentatt betalings-/sikkerhetsbrudd tomånedersvarsel, etter vilkårenes nærmere regler.", "3.2", 4],
  ["avtale.angrerett", "Angrerett ved fjernsalg", "Privat skadeforsikring kjøpt på telefon/internett har 14 dagers angrerett fra dokumentene mottas. Kunden betaler premie og eventuell trafikkavgift for tiden forsikringen gjaldt.", "3.3", 5],
  ["avtale.eierskifte", "Eierskifte", "Forsikringen opphører ved eierskifte, men gjelder inntil 14 dager hvis ny eier ikke har tegnet egen forsikring.", "3.4", 5],
  ["avtale.restpremie", "Restpremie og grunnpris", "Gjenstående periode tilbakeberegnes etter eventuell korttids-/sesongtabell; fast administrasjonsgrunnpris refunderes ikke. Endringsbeløp over 100 kroner avregnes særskilt; mindre beløp tas ved neste premievarsel.", "1.4 og4", 5],
  ["oppgjor.frist", "Meldingsfrist", "Meld mulig krav snarest. Rett til erstatning kan falle bort ved senere melding enn ett år etter kunnskap om grunnlaget, etter forsikringsavtalelovens fristregler.", "5.1", 6],
  ["oppgjor.politi", "Politianmeldelse", "Brann, innbrudd, skadeverk, tyveri, ran/overfall og påkjørsel av dyr skal meldes politiet.", "5.2", 6],
  ["avtale.forsett", "Uaktsomhet, forsett og andre personers handlinger", "Grov uaktsomhet eller forsett kan redusere eller fjerne erstatning, med særregler for ansvar. Andre personers handlinger får virkning etter avtalens identifikasjonsregler og FAL§4-11.", "5.3–5.4", 6],
  ["sikkerhet.begrensning", "Sikkerhetsforskrifter", "Avtalens sikkerhetsforskrifter er påpekt i beviset og kan stille krav til sikring, adferd, kvalifikasjoner og sertifikater. Brudd kan redusere eller fjerne erstatningen; kundens konkrete bevis må kontrolleres.", "5.5", 6],
  ["oppgjor.skjonn", "Skjønn", "Uavhengige skjønnsmenn fastsetter verdier/skade; motparten har én uke til valg etter varsel og oppmann brukes ved uenighet. Verdsettelsen binder innenfor vurderingenes yttergrenser. Partene betaler hver sin og halvparten av felleskostnader, men selskapet betaler alt når det krever skjønn ved privat tingskade.", "5.7", 7],
  ["avtale.opplysningsplikt", "Opplysninger og underforsikring", "Riktige og fullstendige opplysninger kreves ved inngåelse, fornyelse og skade. Feil risikoforhold eller for lave summer kan gi reduksjon. Svik fjerner erstatning og refusjonsrett; utbetalte beløp kan kreves tilbake.", "5.8", 7],
  ["oppgjor.renter", "Renter", "Renter følger FAL§8-4/18-4, med fradrag for forsinkelse på grunn av manglende dokumentasjon eller urettmessig avvist oppgjør.", "5.9", 7],
  ["oppgjor.mva", "Merverdiavgift", "Mva erstattes bare når påløpt, dokumentert og ikke fradragsberettiget. Dette gjelder også ansvar.", "5.10", 8],
  ["avtale.lovliginteresse", "Lovlig interesse og innførsel", "Bare lovlig økonomisk interesse omfattes. Gjenstander kjøpt i utlandet må dokumenteres lovlig fortollet. Forsikringen erstatter faktisk tap og skal ikke gi vinning; oppgitt sum er ikke verdibevis.", "5.6 og5.11", 8],
  ["avtale.krig", "Krig og uroligheter", "Krig/alvorlige uroligheter i Norge, deltakelse i krig og innreise/opphold i utenlandske risikoområder med UD-reiseråd er unntatt uten skriftlig avtale. Produktets særregler går foran generelle begrensninger.", "6.2", 8],
  ["avtale.terror", "Terror – samlet grense", "Terror har samlet grense 100 millioner kroner per 48-timershendelse og 300 millioner per kalenderår, med forholdsmessig reduksjon. Objekter utenfor Norden og angitte store/særlige objekter er unntatt. Begrensningen gjelder ikke personskade under bilansvarsloven.", "6.3", 8],
  ["avtale.atom", "Biologisk, kjemisk og atomrisiko", "Farlig spredning av biologiske/kjemiske substanser, raketter, atomvåpen og radioaktiv stråling er unntatt uten skriftlig avtale. Unntaket gjelder ikke personskade som omfattes av bilansvarsloven.", "6.4", 9],
  ["ansvar.pfas", "PFAS-ansvar", "Erstatningsansvar knyttet til perfluorerte stoffer/PFAS dekkes ikke.", "6.5", 9],
  ["avtale.pandemi", "Pandemi og epidemi", "Økt skadeomfang på bygnings-/maskin-/tingskadeforsikring som skyldes pandemi/epidemi, og slikt avbruddstap, omfattes ikke.", "6.6", 9],
  ["avtale.sanksjoner", "Sanksjoner", "Forpliktelser bortfaller når oppfyllelse ville bryte bindende FN-/EU-vedtak eller sanksjoner fra Norge, Storbritannia eller USA.", "6.7", 9],
  ["avtale.dataunntak", "Datakriminalitet", "Egne tap og ansvar fra datakriminalitet og personvernbrudd er unntatt. Fysisk person-/tingskade etter datakriminalitet er likevel omfattet når den kan kreves dekket under produktvilkåret.", "6.8", 9],
  ["avtale.personvern", "Skaderegister og personvern", "Skader kan registreres i FOSS og slettes etter 10 år. Kunden har innsynsrett. Nødvendige personopplysninger behandles for identifikasjon og avtaleoppfyllelse; ansatte har taushetsplikt og lovpålagt utlevering kan skje.", "7.1,7.3 og7.5", 10],
  ["avtale.klage", "Lovvalg og klage", "Norsk lov og norske domstoler gjelder med ufravikelige lovvalgsforbehold. Avtale-/oppgjørsklager kan tas til Landkreditts kundeombud og Finansklagenemnda.", "8–9", 11],
];
for (const type of ["Bil", "Hus"] as const) {
  const general = privateGeneralSource("landkreditt", "Landkreditt", type, "landkreditt-general.pdf",
    "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-generelle.pdf",
    "bef93e5ae0dceeb7bf41fef26fd5137dede34e5e9291de973406d47ba7752c79", 11, "2025-01-01");
  extendTerms(general, general.productIds!, landkredittGeneralRows);
  if (type === "Bil") extendTerms(general, general.productIds!, [["avtale.automatiskopphor", "Automatisk opphør og trafikkavgift", "Registrert bilforsikring opphører ved salg, vraking, tyveri og avregistrering. Trafikkforsikringsavgift betales for perioden bilen er registrert.", "3.5–3.6", 5]]);
}

const lkCarIds = products.filter(product => product.providerId === "landkreditt" && product.insuranceType === "Bil").map(product => product.productId);
extendTerms(landkredittCar, lkCarIds, [
  ["avtale.personkrets", "Hvem forsikringen gjelder for", "Forsikringstaker, registrert eier, lovlig bruker og andre med tinglyst eiendomsrett i bilen omfattes, etter valgt dekning.", "1.1", 3],
  ["avtale.objekt", "Person-/varebil til privat bruk", "Bilen i beviset med ett ekstra hjulsett i standardutførelse, ekstrautstyr og personlig løsøre. Omfang og beløpsgrenser følger valgt dekning.", "1.3.1", 3],
  ["geografi.rettshjelp", "Rettshjelp – område", "Rettshjelpsdekningen gjelder i Norden.", "1.2d", 3],
  ["ansvar.egenandel", "Ansvar – egenandel", "Ingen egenandel med mindre annet fremgår av forsikringsbeviset; særregelen ved uavtalt ung fører gjelder i tillegg.", "2.4 og7.3a", 4, undefined, "reference"],
  ["ansvar.unntak", "Ansvar – rettsgrunnlag", "Erstatningsansvar etter annet rettsgrunnlag enn bilansvarsloven dekkes ikke; utenlandsansvar vurderes etter skadestedets lov.", "2.1–2.2", 3],
  ["avtale.bruksunntak", "Bruksbegrensninger", "Rus, grov uaktsomhet/forsett, løp/fartsprøve/terrengkjøring og avsperret bane/vei kan gi bortfall/reduksjon. Obligatorisk føreropplæring er unntatt banebegrensningen. Ikke godkjent ombygging/tuning/programvare, bildeling og passasjertransport mot betaling omfattes ikke.", "8.1–8.6", 7],
  ["natur.unntak", "Jordskjelv og vulkanutbrudd", "Tap/skade knyttet til jordskjelv og vulkanutbrudd er unntatt i motorvognvilkåret. Personskade under bilansvarsloven følger særregelen i generelle vilkår.", "8.7 / Generelle vilkår6.1", 7],
  ["oppgjor.skademelding", "Skademelding", "Meld snarest før bilen settes på verksted. Person-/dyreskade, brann, innbrudd, tyveri, hærverk og ran skal politianmeldes. Fristen er ett år fra kunnskap om grunnlaget.", "7", 6],
  ["rettshjelp.vilkar", "Rettshjelp – vilkår", "Tvist må oppstå mens forsikringen gjelder som personlig eier/rettmessig bruker/fører. Ordinære domstoler og angitte meklingsinstitusjoner omfattes; særdomstol kan omfattes når saken kunne gått ordinært. Ikke rettsoppnevnt sakkyndig krever forhåndsgodkjenning; vitner bare ved hovedforhandling/bevisopptak.", "9.1", 7],
  ["rettshjelp.sakskostnader", "Rettshjelp – kostnadsbegrensninger", "Tilkjente kostnader trekkes fra unntatt ved dokumentert usøkegod motpart. Forlik som oppgir tilkjente kostnader krever forhåndsgodkjenning. Idømte sakskostnader og rettsgebyr i ankeinstans dekkes ikke.", "9.1.2 og9.2i–j", 8],
  ["rettshjelp.solgt", "Rettshjelp etter salg/kjøp", "Tidligere eier kan være dekket etter salg og opphør; ved kjøp av ny bil før egen forsikring gjelder særregel når nåværende bil var Landkreditt-forsikret på kjøpstidspunktet.", "9.1.3", 8],
  ["rettshjelp.unntak", "Rettshjelp – unntak", "Yrke/erverv (med særregel for førerskade), familie/arv/skifte, namsmyndighet, ubestridt inkasso/gjeld/konkurs, straff/ærekrenkelse, advokatsalær og forvaltningsutgifter er unntatt. Søksmål etter fullført forvaltningsklage kan dekkes. Trafikkpersonskade krever avslag fra trafikkforsikrer etter vilkårets regler.", "9.2", 8],
  ["rettshjelp.frist", "Rettshjelp – melding og advokat", "Krav meldes snarest og senest ett år etter advokatkontakt, eller fullført forvaltningsklage. Landkreditt kan velge egnet advokat og kreve felles bistand ved likelydende interesser. Oppdragsbekreftelse, timelister, spesifisert salær og betalt egenandel må dokumenteres.", "9.5", 9],
  ["ulykke.vilkar", "Ulykke – hendelse og oppgjør", "Bilen eller tilkoblet tilhenger/utstyr må være direkte årsak til plutselig ytre fysisk kroppsskade. Invaliditet fastsettes tidligst etter ett år, senest ut fra antatt varig tilstand på treårsdagen etter invaliditetstabellen. Fradrag gjøres for tidligere mén og medvirkende sykdom; yrke/inntekt påvirker ikke graden.", "10.1–10.1.4", 9],
  ["ulykke.unntak", "Ulykke – unntak", "Behandlingsutgifter, ren psykisk skade, sykdom/disposisjon, angitte muskel-/skjelett- og hjerte-/karlidelser, infeksjon, forgiftning, visse medisinske komplikasjoner, lys/temperatur, forsett, selvmord og kriminalitet/slagsmål er unntatt med vilkårets nød-/sinnstilstands-/behandlingsunntak. Tannskade og bare kosmetiske arr gir ikke invaliditetserstatning.", "10.1.3d og10.2", 11],
  ["ulykke.dod.vilkar", "Ulykke – dødsfall og mottaker", "Ulykkesdød må skje innen ett år; uten etterlatt ektefelle/kvalifisert samboer, egne barn eller dokumentert forsørgede foreldre begrenses beløpet til 10 000 kroner. Invaliditet trekkes fra. Mottaker er ektefelle/samboer eller arvinger, eventuelt avtalt begunstiget. Senere død gir eventuell invaliditet.", "10.1.1", 10],
  ["ulykke.samletgrense", "Ulykke – samlet grense og egenandel", "Samlet erstatning ved flere skadelidte er 1 million kroner per ulykke, forholdsmessig fordelt. Ingen egenandel.", "10.3–10.4", 12],
  ["avtale.bonus.ordning", "Bonus", "Ti prosentpoeng per skadefritt år til 70 prosent;75 prosent etter tre år på 70. Etter tre skadefrie år med 75 tapes ikke bonus ved første skade. Ellers tap 5 prosentpoeng fra 75 og 10 fra 70 eller lavere. Ansvar og kasko gir bonustap; politimeldt dyrepåkjørsel og angitt naturulykke gir ikke tap. Regulering fra neste hovedforfall.", "11.1", 12],
]);
const lkPhysicalIds = lkCarIds.filter(id => id !== "landkreditt-bil-ansvar");
extendTerms(landkredittCar, lkPhysicalIds, [
  ["tilbehor.bagasje.unntak", "Gjenstander og skader som er unntatt", "Gradvis slitasje/korrosjon/tæring og skade under garanti/annet leverandøransvar er unntatt. Kontanter, mobiltelefon, smykker, antikviteter, verdipapirer, bank-/kredittkort, yrkesvarer/-utstyr, mat, tobakk og alkohol dekkes ikke som personlig løsøre.", "3.2", 4],
  ["veihjelp.vilkar", "Redning – omfang", "Når redning er avtalt: transport til nærmeste verksted eller rimeligere stedlig hjelp ved dekket skade, utelåsing/mistet nøkkel, tomt batteri/drivstoff. Hjemreise ved plutselig sykdom/ulykke/død, forhåndsavtalt hotell og reservedelstransport utenfor Norden kan dekkes.", "5.1", 5],
  ["veihjelp.unntak", "Redning – unntak og sum", "Verkstedreparasjon/deler, transport/hjemreise/hotell uten forhåndsavtale og utgifter under garanti omfattes ikke. Grensen er 50 prosent av bilens markedsverdi.", "5.2–5.3", 5],
  ["reparasjon.kontant", "Reparasjon og kontantoppgjør", "Likeverdige deler og reparasjon til tidligere stand brukes; Landkreditt velger verksted/oppgjørsform. Verdiforringelse erstattes ikke, forbedring trekkes fra. Ettermontert utstyr avskrives 10 prosent per påbegynt år, maksimalt 50 prosent. Kontant arbeidskostnad er 50 prosent uten mva.", "7.1", 6],
  ["totalskade.oppgjor", "Tap og totalskade", "Markedsverdi for tilsvarende brukt bil erstattes når reparasjon ikke lønner seg eller bilen er tapt. Selskapet overtar skadet/gjenfunnet bil og utstyr etter utbetaling, med særregler ved valgt Kasko Pluss.", "7.2", 6],
]);
extendTerms(landkredittCar, ["landkreditt-bil-kasko-pluss"], [
  ["interiorrens.grense", "Uflaks – interiør og feilfylling", "Rens av motor/tank ved feilfylling og kupe etter mat-/drikkesøl omfattes av felles 25 000 kronersgrense, ett tilfelle per år. Søl fra bagasjerom omfattes ikke, også åpent bagasjerom.", "12.4.1d,12.4.2b og12.4.3b", 14],
  ["interiorrens.egenandel", "Uflaks – egenandel", "1 000 kroner ved uflaksdekningen; øvrige dekninger har ordinær kasko-/delkaskoegenandel.", "12.4.4", 14, undefined, "override"],
  ["nyverdi.skadegrad", "Ny bil – skadegrense", "Totalskadevilkåret krever at tap/skade overstiger 80 prosent etter beregningen i punkt 12.4.1 e; fabrikkny førstegangsregistrering på forsikringstakeren kreves.", "12.4.1e", 14],
  ["nyverdi.unntak", "Ny bil – unntak", "Nybiloppgjør gjelder ikke leaset bil, leiebil eller kjøretøy med rett til fradrag for inngående mva. Leasing har i stedet særregelen om resterende startleie.", "12.4.2c", 14],
]);
extendTerms(sources["landkreditt-bil-leiebil"], ["landkreditt-bil-leiebil"], [
  ["leiebil.unntak", "Leiebil – vilkår og unntak", "Krever dekket kasko-/tyveriskade eller avtalt redning utenfor Norden når bilen ikke blir trafikksikker innen to arbeidsdager. Samme størrelse/drivstoff krever avtale. Ingen dekning utover normal reparasjonstid, etter mottatt totalskade-/tyverioppgjør, ved stedlig reparasjon eller bare glass. Ingen egenandel utover kasko/delkasko.", "12.1", 13],
]);
extendTerms(landkredittCar, ["landkreditt-bil-kasko-pluss"], [
  ["leiebil.unntak", "Leiebil – vilkår og unntak", "Krever dekket kasko-/tyveriskade eller avtalt redning utenfor Norden når bilen ikke blir trafikksikker innen to arbeidsdager. Samme størrelse/drivstoff krever avtale. Ingen dekning utover normal reparasjonstid, etter mottatt totalskade-/tyverioppgjør, ved stedlig reparasjon eller bare glass. Ingen egenandel utover kasko/delkasko.", "12.1", 13],
]);
extendTerms(sources["landkreditt-bil-maskinskade"], ["landkreditt-bil-maskinskade"], [
  ["maskinskade.unntak", "Maskinskade – unntak", "Bremsesystem/clutchbelegg alene og følgeskader, gradvis slitasje/korrosjon, garantiansvar, feil bruk/uforsvarlig belastning/prøving/eksperimentering og produsentens modifiseringsprogram omfattes ikke.", "12.5.2", 14],
  ["maskinskade.grense", "Maskinskade – sum", "Markedsverdi er øvre erstatningsgrense.", "12.5.3", 15],
  ["maskinskade.egenandel.100000-149999", "Maskinskade –100 000–150 000 km", "20 prosent av reparasjonskostnadene, minst 10 000 kroner.", "12.5.4", 15, undefined, "coverage"],
  ["maskinskade.egenandel.150000-174999", "Maskinskade –150 000–175 000 km", "30 prosent av reparasjonskostnadene, minst 10 000 kroner.", "12.5.4", 15, undefined, "coverage"],
  ["maskinskade.egenandel.175000-200000", "Maskinskade –175 000–200 000 km", "40 prosent av reparasjonskostnadene, minst 10 000 kroner.", "12.5.4", 15, undefined, "coverage"],
]);

const lkHouseIds = ["landkreditt-hus-standard", "landkreditt-hus-utvidet"];
extendTerms(landkredittHouse, lkHouseIds, [
  ["personkrets.begrensning", "Hvem forsikringen gjelder for", "Forsikringstaker, ektefelle/samboer med felles folkeregistrert adresse, hjemmeboende barn og angitte barn utenfor hjemmet ved utdanning/førstegangstjeneste eller delt foreldreansvar samt tinglyste rettighetshavere.", "1", 3],
  ["geografi", "Forsikringssted", "Stedet angitt i forsikringsbeviset.", "2", 3],
  ["bygninger.tilbehor", "Tilleggsbygg og ledninger", "Frittliggende bygg inntil 10 m² og utvendige rør/ledninger med utstyr frem til tilknytningspunkt for brønn/borehull/spredeledning/offentlig ledning omfattes.", "3.2a,c", 3],
  ["teknisk.solceller", "Solceller", "Solceller som bare dekker eget privatforbruk omfattes.", "3.2b", 3],
  ["hage.brygge", "Fast trebrygge", "Brann/naturskade på tilhørende fast trebrygge inntil 100 000 kroner.", "3.2e", 3],
  ["bygninger.unntak", "Objekter som ikke omfattes", "Brønn/borehull, drensledning med avløp, molo/bølgebryter, uspesisifisert bygg over 10 m², hobbyveksthus, mineraloljetank/-fyrkjel og andel i felles brygge er unntatt.", "3.3", 3],
  ["plutselig.unntak", "Grunnunntak – bruk og bygningsforhold", "Vedlikehold/slitasje/standardheving, svi/gnist uten brann, kosmetiske merker/knirk, søl/kondens, punktert isolerglass, utett våtrom, sopp/råte/heksesot/bakterier/dyr, estetisk mismatch ved reparasjon og isolasjon uten funksjonstap er unntatt med uttrykkelige skadedyr-/Utvidet-regler.", "4.2a–i", 4],
  ["plutselig.begrensning_ovrig", "Grunnunntak – konstruksjon og fraflytting", "Takrenner/nedløp, dårlig drenering/utett bygning, tele/setning/jordtrykk/fundament, fag-/konstruksjonsfeil, urasjonell byggeskikk og kunst uten avtale, klimatiske hageskader, ulovlig bygg og ny eiers mangelskrav er unntatt. Etter 12 måneder ubebodd gjenstår bare brann/natur. Utvidet kan uttrykkelig endre enkelte unntak.", "4.2j–t", 4],
  ["skadedyr.omfang", "VIS – forsikrede bygninger", "Boenhet i beviset med fast innredning/utstyr og frittstående garasje omfattes. Bygg brukt/registrert for næring/landbruk og utvendig basseng/boblebad med ledninger er unntatt. Skadeoppgjør foretas av VIS.", "4.4–4.4.1", 5],
  ["skadedyr.tid", "VIS – tidsavgrensning", "Skadeutvikling før oppstart eller etter opphør er unntatt. Bekjempelse av aktivitet før start/etter opphør er unntatt, med særregel når tidligere gjeldende bygningsforsikring ville dekket bekjempelsen ved aktivitetens start.", "4.4.3 og10.5.3", 5],
  ["skadedyr.grunnunntak", "VIS – felles unntak", "Rent kosmetisk skade, isolasjon uten dokumentert svekket effekt, forebygging/vedlikehold, fjerning av dyr/rester uten lukt-/bygningsskade, kjæledyr/husdyr, indirekte tap, utvendige/bunnledninger og dyreutløst brann/el-/vannskade omfattes ikke.", "4.4.3", 5],
  ["skadedyr.egenandel", "VIS – skade og bekjempelse", "6 000 kroner per bygningsskade med mindre annet er avtalt;2 000 kroner ved skadedyrbekjempelse.", "4.4.4 og10.5.4", 6, undefined, "standard"],
  ["oppgjor.skademelding", "Skademelding", "Skade meldes snarest; brann, innbrudd, tyveri, skadeverk og ran politianmeldes. Ettårsfristen fra kunnskap om grunnlaget gjelder.", "5", 6],
  ["gjenoppforing.oppgjorsmate", "Oppgjørsform og egeninnsats", "Selskapet velger reparasjon, tilsvarende anskaffelse/gjenoppføring, reparatør eller kontantoppgjør. Kontantoppgjør kan ikke overstige selskapets kostnad. Uten fakturert arbeid ytes 300 kroner/time og ingen mva på arbeidsdelen. Beplantning erstattes med ung handelsvare.", "5.1", 7],
  ["gjenoppforing.fullverdigaranti", "Fullverdigaranti", "Samme sted (gnr/bnr), formål og gjenoppføring/reparasjon innen 5 år gir intet fradrag for verdiøkning fra nytt for gammelt. Ved annet sted/formål trekkes enhver økonomisk verdiøkning.", "5.1.1", 7],
  ["gjenoppforing.totalskade", "Totalskadegaranti", "Over 75 prosent av gjenoppføringskostnaden kan kunden kreve totalskadeoppgjør uten restverdifradrag når restene er revet/fjernet innen 2 år. Verdien av materialrester trekkes fra.", "5.1.1", 7],
  ["gjenoppforing.svanemerket", "Svanemerket bolig", "Når Landkreditt gjenoppfører totalskadet bolig på samme sted/formål, dekkes inntil 250 000 kroner i merkostnad for svanemerking.", "5.1.1", 7],
  ["forsikringsform", "Førsterisiko", "Reparasjon/gjenoppføring innen 5 år erstattes inntil avtalt sum uten underforsikring. Annet sted/formål med gevinst gir fradrag for økning over 40 prosent av tidligere lokal omsetningsverdi.", "5.1.2", 7],
  ["gjenoppforing.ingen", "Uten gjenoppføring og ved planlagt rivning", "Uten reparasjon/gjenoppføring innen 5 år trekkes all verdiøkning og oppgjøret begrenses til tidligere omsetningsverdi/avtalt sum. Nødvendig utskiftning/rehabilitering/rivning gir fradrag for elde og sparte kostnader; rivningsbygg verdsettes til brukbare materialer.", "5.1.3–5.1.4", 7],
  ["gjenoppforing.annenbolig", "Kjøp av annen bolig", "Etter totalskade kan tilsvarende formål-bolig kjøpes innen 2 år med skriftlig samtykke fra rettighetshaverne. Oppgjøret begrenses normalt til tidligere markedsverdi justert for prisendringer, uten mva. Husleietap dekkes frem til overtakelse, maksimalt 2 år.", "5.1.5", 8],
  ["gjenoppforing.klimatiltak", "Klimatiltak ved kjøp av annen bolig", "Inntil 250 000 kroner til dokumenterte tiltak som reduserer utslipp/energi, utført innen ett år etter overtakelse og forhåndsgodkjent.", "5.1.5", 8],
  ["leietap.beregning", "Leietap og ubeboelighet", "Normal reparasjons-/byggetid fra skadedagen dekkes; egne rom etter markedsleie for umøblert bolig, utleie etter avtalt utleiedekning. Uten gjenoppføring maksimalt 3 måneder. Innsparte utgifter og renter trekkes fra.", "5.1.6", 8],
  ["underforsikring.begrensning", "Risikoendring og areal", "Utvidelse, oppgradering og utleie må meldes. Verdiøkende endringer må meldes innen hovedforfall; ellers forholdsmessig reduksjon etter gjenoppføringskostnad før/etter eller faktisk kontra oppgitt areal.", "5.1.7", 8],
  ["egenandel.fritak", "Egenandelsfritak", "Ingen egenandel ved aktiv innbruddsalarm til alarmsentral/vakt, brudd på innvendig vannledning med aktiv helhus-vannstoppventil eller skade bare på overspenningsvern/brann-/innbruddsalarm.", "5.2", 9, undefined, "override"],
  ["ror.egenandel", "Gamle innvendige rør", "Ved vannledningsbrudd på rør eldre enn 35 år økes avtalt egenandel 15 000 kroner fra skade nummer 2, for både rør- og følgeskade.", "5.2.1", 9, undefined, "coverage"],
  ["aldersfradrag.utvendige_ledninger_tanker", "Utvendige ledninger, tanker og kummer", "Annet materiale enn plast/glassfiber:20 fradragsfrie år, deretter 5 prosent per år, maksimalt 80 prosent; eldste del legges til grunn.", "5.2.2", 9],
  ["aldersfradrag.varmepumpe", "Varme- og vannpumper", "5 fradragsfrie år, deretter 5 prosent per år, maksimalt 80 prosent.", "5.2.2", 9],
  ["aldersfradrag.oppvarming_vvs", "Varme, kjøling, ventilasjon og VVS", "7 fradragsfrie år, deretter 10 prosent per år, maksimalt 80 prosent.", "5.2.2", 9],
  ["aldersfradrag.badeinnretning", "Badeinnretning – fradrag", "5 fradragsfrie år, deretter 10 prosent per år, maksimalt 80 prosent.", "5.2.2", 9],
  ["aldersfradrag.varmekabler_bereder", "Varmekabler og varmtvannsbereder", "10 fradragsfrie år, deretter 10 prosent per år, maksimalt 80 prosent.", "5.2.2", 9],
  ["aldersfradrag.integrerte_hvitevarer", "Elektriske apparater og integrerte hvitevarer", "5 fradragsfrie år, deretter 10 prosent per år, maksimalt 80 prosent. Fradrag gjelder skadet ting og nødvendig reparasjon, minimum egenandel. Reparerte integrerte hvitevarer får ikke aldersfradrag.", "5.2.2", 9],
  ["gjenoppforing.prisstigning", "Utbetaling og prisstigning", "Utbetaling følger fremdrift og gjennomsnittlig byggekostnadsindeks. Annet sted/formål og kontantoppgjør krever samtykke fra tinglyste rettighetshavere. Påløpt mva må dokumenteres.", "5.3", 9],
  ["avtale.identifikasjon", "Ektefelle/samboer", "Sikredes eller ektefelle/samboers handlinger/unnlatelser kan redusere eller fjerne erstatningen etter FAL§4-11.", "5.4", 9],
  ["pabud.dekning", "Offentlige påbud", "Nødvendige merutgifter ved dekket skade til bygg, grunnundersøkelse/fundament eller betingelser for gjenoppføring omfattes på samme tomt, eller annet sted ved lovhjemlet hinder. Offentlige bidrag trekkes fra og større bygg arealforholdberegnes. Selskapet kan påklage påbud.", "6.1–6.2", 10],
  ["pabud.grense", "Påbud – førsterisiko", "For førsterisikobygg begrenses påbudsdekningen til 20 prosent av forsikringssummen.", "6.2", 10],
  ["pabud.vilkar", "Påbud – unntak og frist", "Tapt nytteareal, påbud som kunne vært gitt uten skade og midlertidige/rivnings-/rehabiliteringsbygg er unntatt. Reparasjon/gjenoppføring innen 5 år kreves, med mulig forlengelse ved offentlige hindringer.", "6.3–6.4", 10],
  ["ansvar.geografi", "Ansvar – område og tidspunkt", "Ansvar gjelder skade i Norden konstatert i forsikringstiden som personlig eier/bruker, etter gjeldende nordisk rett. Samme utløsende forhold/kjede regnes som én serieskade med summen ved første skade.", "7.2–7.4 og7.9", 10],
  ["ansvar.unntak", "Ansvar – unntak", "Yrke, avtale-/garantiansvar, familie/felles eierinteresse, lånte/leide/oppbevarte ting, annen eiendom, styreansvar, smitte, ærekrenkelse/oppreisning/bøter, grave-/sprengningsarbeid og gradvis forurensning/fukt/sopp/råte er unntatt. Motor-/båt-/luftfartøy har spesifikke unntak for små fritidsfartøy/hjelpemidler.", "7.5", 11],
  ["ansvar.skadebehandling", "Ansvar – melding og behandling", "Krav meldes uten ugrunnet opphold og innen ett år. Selskapet behandler dekkede krav over egenandel; kunden må levere opplysninger, gjøre nødvendige undersøkelser og møte. Ansvar/forhandling må ikke erkjennes uten godkjenning. Delvis dekkede krav kostnadsfordeles; videre kostnad etter tilbudt oppgjør dekkes ikke.", "7.6–7.8", 12],
  ["ansvar.grense", "Ansvar – sum", "Summen i forsikringsbeviset gjelder ved hvert skadetilfelle, med vilkårets særregler for serieskader og godkjente prosessutgifter.", "7.9–7.11", 13],
  ["ansvar.egenandel", "Ansvar – egenandel", "Egenandelen i forsikringsbeviset trekkes for hvert skadetilfelle.", "7.10", 13, undefined, "reference"],
  ["rettshjelp.vilkar", "Rettshjelp – tvist og kostnader", "Tvist i forsikringstiden som eier/bruker av forsikret eiendom. Rimelig nødvendig advokat, retten, sakkyndig og vitner omfattes; ekstern sakkyndig krever forhåndsgodkjenning. Ordinære domstoler og angitte meklingsinstitusjoner gjelder. Idømte kostnader/ankegebyr dekkes ikke; tilkjente kostnader fratrekkes med usøkegodhetsunntak.", "8.1–8.5", 13],
  ["rettshjelp.solgt", "Rettshjelp etter salg/kjøp", "Tidligere eier kan være dekket etter salg/opphør. Kjøp før innflytting/egen forsikring kan omfattes når nåværende bolig var forsikret på kjøpstidspunktet.", "8.6", 14],
  ["rettshjelp.grense", "Rettshjelp – sum og flere parter", "Bevisets sum gjelder per tvist selv ved flere parter/forsikringer/selskaper. Uforsikrede holdes utenfor. Uten forhåndsgodkjenning kan ikke erstatningen overstige kundens økonomiske interesse.", "8.7", 14],
  ["rettshjelp.unntak", "Rettshjelp – unntak", "Yrke, annen eiendom, kjøp/salg med særskilt boligkjøper-/eierskifteforsikring, familie/arv/skifte, tvangsfullbyrdelse (unntatt forsikret husleietvist), inkasso/gjeld/konkurs, motor-/båt-/luftfartøy og straff/ærekrenkelse er unntatt. Forvaltning krever full klageutnyttelse; juridiske personer, advokatsalær, før-tvistsutgifter og sameiertvist har nærmere unntak.", "8.8", 14],
  ["rettshjelp.frist", "Rettshjelp – melding og advokatvalg", "Meld snarest og senest ett år etter advokatkontakt/fullført forvaltningsklage. Selskapet kan velge egnet advokat og felles bistand. Kunden må begrense kostnadene og dokumentere oppdrag, timer, salær og betalt egenandel.", "8.9", 15],
  ["naturskade.begrensning", "Naturskade – avkortning og samlet grense", "Svak konstruksjon, manglende vedlikehold/tilsyn eller forebygging kan gi avkortning, men ikke ved liten skyld. Samlet erstatningsansvar er myndighetsbegrenset med forholdsmessig reduksjon. Tvil kan forelegges naturskadenemnda.", "9.2", 16],
  ["naturskade.relokalisering", "Naturskade – byggeforbud og tomt", "Ved ny naturrisiko og nektet reparasjon/gjenoppføring på stedet erstattes bygning/uthus som totalskadet og tomt inntil 5 dekar etter førverdi, også ved ustabil grunn uten husskade. Selskapet kan med skriftlig samtykke sikre stedet i stedet.", "9.3.1", 16],
  ["skadedyr.oppgjor", "VIS – melding og oppgjørsform", "Meld til VIS uten ugrunnet opphold og innen ett år. VIS velger kontantoppgjør, reparasjon, gjenoppføring eller bekjempelse og leverandør. Kontantbeløp begrenses til selskapets kostnad. Avtalt egeninnsats honoreres 250 kroner/time; forhåndssamtykke kreves før egne tiltak.", "12.1–12.3", 21],
  ["skadedyr.brukstap", "VIS – ubeboelig bolig og flytting", "Normal reparasjons-/byggetid, nødvendig flytting/lagring og godkjente oppholdsrom omfattes etter markedsleie for umøblert bolig. Husleietap krever kontrakt fra før oppdagelse; hjemmekontor/arbeidsplass dekkes ikke. Innsparte utgifter trekkes fra.", "12.3.1", 21],
  ["skadedyr.aldersfradrag", "VIS – utstyr og aldersfradrag", "Integrerte apparater, varmepumper, beredere/vannpumper og badeinnretning:10 prosent per år etter 5 år; varmekabler/annet varme-/kjøleutstyr etter 10 år. Maks 80 prosent, eldste del, og total reparasjon for elektrisk utstyr.", "12.3.2", 22],
  ["skadedyr.vannfradrag", "VIS – gammel konstruksjon og vann", "50 prosent fradrag og maksimal sum 200 000 kroner ved tak mv over 50 år, terrassemembran/overgang over 30 år, innvendig rør over 50 år og våtrom over 20 år. Eldste del avgjør.", "12.4", 22],
  ["skadedyr.vanngrense", "VIS – særlige vannsummer", "Vanninntrengning via tak:200 000 kroner per skade og 600 000 per år. Kondensvann fra hvitevarer/varmepumper:50 000 per skade og 100 000 per år. Bransje-/årsaksunntak gjelder fortsatt; dette oppretter ingen ny grunnleggende vannskadedekning.", "12.6", 22],
  ["skadedyr.prisstigning", "VIS – prisstigning og mva", "Prisstigning i normal utbedringstid dekkes maksimalt 24 måneder etter byggekostnadsindeksen. Mva krever dokumentasjon og påløpt kostnad. Urational byggemåte, skadepåvisning og befaring erstattes ikke.", "12.3.3,12.5–12.6", 22],
  ["skadedyr.fraflyttet", "VIS – fraflytting og inspeksjon", "I ubebodd bygning dekkes bare råte-/skadedyrskader. VIS kan besiktige gratis, uten garanti mot skjulte feil; kunden skal gi effektiv tilgang og etterkomme instrukser. Skjønn kan kreves og renter følgerFAL§8-4.", "12.7–12.10", 23],
]);
extendTerms(landkredittHouse, ["landkreditt-hus-standard"], [
  ["tilpasning.grense", "Tilpasning for rullestol", "Inntil 250 000 kroner samlet i selskapet ved varig rullestolbehov etter ulykke eller medfødt funksjonsnedsettelse hos barn. Ulykken/fødselen må være i perioden. Utgifter etter ulykke innen 5 år; ved barn innen 5 år etter offentlig rullestolvedtak og senest 20 år etter fødsel.", "4.3", 5],
  ["skadedyr.virvellose", "Standard VIS – virvelløse dyr", "Bygningsskader fra virvelløse dyr er unntatt i standard skadedyrdekning.", "4.4.3.1", 5],
]);
extendTerms(landkredittHouse, ["landkreditt-hus-utvidet"], [
  ["tilpasning.vilkar", "Rullestoltilpasning – vilkår", "Den forhøyede summen på 500 000 kroner følger ellers punkt 4.3:varig rullestolbehov, ulykke/fødsel i forsikringstiden og angitte frister for utgifter.", "10 og4.3", 17],
  ["handverker.egenandel", "Utvidet – andre skader", "Minst 10 000 kroner i egenandel ved dekkede andre skader etter punkt 10.3. Selve feilen/mangelen dekkes ikke.", "10.3.1–10.3.2", 18, undefined, "coverage"],
  ["plutselig.utvidet", "Utvidet – tele og fundamentering", "Utvidet omfatter også skader fra tele, setninger, jordtrykk og utilstrekkelig/sviktende fundamentering. Angitte fagfeil krever kvalifisert utførelse og følgeskade innen 10 år; selve feilen er unntatt.", "10.3.1", 17],
  ["brukstap.ferietur", "Ferietur etter stor skade", "Inntil 25 000 kroner til reise/overnatting når egen folkeregistrerte bolig er ubeboelig i mer enn 4 måneder etter dekket skade. Forhåndsgodkjenning, originalkvitteringer og reise innen 12 måneder kreves; bortfalt bruk må meldes straks.", "10.4", 18],
  ["rate.vannskade", "VIS Utvidet – langvarig aktiv vannskade", "Materialnedbrytning fra aktiv vannskade som har utviklet seg over ett år kan dekkes etter VIS Topp. Ubegrenset sum hvis ikke annet er avtalt, med de særskilte vannsum-/fradrags-/årsaksbegrensningene i punkt 12.", "10.5.2", 18],
  ["rate.unntak", "VIS Utvidet – særunntak", "Slitasje/korrosjonsvannskade, råte/vann på fast innredning/utstyr og utvendig treverk, blåved/mugg, terreng-/grunnkonstruksjoner og vannskade fra konstruksjons-/montasjefeil er unntatt i tillegg til de øvrige VIS-unntakene.", "10.5.3", 18],
]);
extendTerms(sources["landkreditt-hus-utleie"], ["landkreditt-hus-utleie"], [
  ["utleie.leietap", "Utleie – brukstap og prisstigning", "Etter dekket skade beregnes tap etter umøblert leie i normal gjenoppføringstid. Innsparte utgifter og renter trekkes fra; uten reparasjon/gjenoppføring maksimalt 3 måneder.", "11.2.1", 20],
  ["utleie.dokumentasjon", "Utleie – avtale og regress", "Leieavtalen skal regulere parter/identifikasjon, leie/regulering/forskudd, sikkerhet, fraflytting, varighet og tvangsfravikelse 14 dager etter varsel. Kopi og relevante skadeopplysninger sendes selskapet; utbetalt krav overtas mot leietaker.", "11.2.2", 20],
]);

const waterCirclesGeneralRows: FactRow[] = [
  ["avtale.generelle", "Generelle vilkårs anvendelse", "Generelle vilkår gjelder bare i den grad de ikke er fraveket i produktvilkår eller forsikringsbevis.", "Generelle vilkår – innledning", 3],
  ["avtale.krigatom", "Jordskjelv, krig og atomrisiko", "Jordskjelv og vulkanutbrudd er unntatt med mindre produktvilkåret uttrykkelig dekker dem, slik bygningsvilkårets naturskade gjør. Krig/krigslignende handlinger/opprør og atomskade er unntatt med avtalte uttrykkelige unntak og særregelen for lovlig bruk av visse radioisotoper.", "1.1–1.3", 3],
  ["avtale.pandemi", "Pandemi", "Tap/skade og økning knyttet til pandemi eller frykt/trussel om pandemi er unntatt uavhengig av formell erklæring. Definisjonen krever alvorlig smittsom sykdom i minst 3 land og 2 kontinenter.", "1.4", 3],
  ["avtale.toll", "Fortolling", "Tollpliktige gjenstander uten lovlig tolldeklarasjon og angitte tilknyttede tjenester/reparasjoner er unntatt.", "1.5", 3],
  ["oppgjor.skjonn", "Skjønn", "Hver part velger uavhengig skjønnsmann innen 3 uker etter varsel; oppmann benyttes ved uenighet. Verdsettelsen binder innenfor vurderingenes yttergrenser. Partene deler normalt kostnader, men selskapet betaler alt når det krever skjønn ved privat tingskade.", "2", 4],
  ["oppgjor.renter", "Renter", "Erstatningsrenter følgerFAL§8-4/18-4.", "3", 4],
  ["avtale.svik", "Svik", "Svik medfører tap av erstatningskrav under alle avtaler ved samme hendelse og kan gi oppsigelse av avtalene.", "4", 4],
  ["oppgjor.frist", "Meldings- og søksmålsfrist", "Krav må meldes innen ett år fra kunnskap om grunnlaget. Etter skriftlig avslag med korrekt fristvarsel må sak/nemndbehandling kreves innen 6 måneder. Øvrig foreldelse følgerFAL.", "5", 4],
  ["avtale.selskapoppsigelse", "Selskapets oppsigelse", "Feil risikoopplysninger kan gi 14 dagersvarsel, svik umiddelbart eller én uke etter skadeoppgjørssvik. Forsett/sikkerhetsbrudd, unormalt skadeforløp/minst 3 skader siste 12 måneder, vesentlig risikoendring, gjentatt sen premie og trusler kan gi tomånedersvarsel etter vilkårets regler.", "6.1", 4],
  ["avtale.oppsigelse", "Kundens oppsigelse", "Skadeforsikring kan sies opp ved bortfalt behov/særlige grunner eller flytting til annet selskap med én måneds varsel og opplysninger om dato/selskap. Ny forsikring må ha minst tilnærmet samme omfang ved flytting.", "6.2.3", 5],
  ["avtale.varighet", "Start, betaling og opphør", "Dekning gjelder fra avtalt start til kl 24 siste dag, for hendelser i avtaleperioden og etter da gjeldende vilkår/summer. Premien må betales; uteblitt utvidelsespremie annullerer utvidelsen. Manglende betaling etter nytt varsel kan gi opphør, med premiekrav og inntil 60 dagers kostnadstillegg. Terminbetaling har tillegg.", "7", 5],
  ["avtale.restpremie", "Tilgodehavende", "Ved opphør avregnes gjenstående periode med produktets eventuelle særregler. Utbetaling til privatkunde krever kundens eget kontonummer.", "7.4 og8", 5],
  ["avtale.fornyelse", "Fornyelse", "Ettårig forsikring fornyes automatisk med mulig ny premie/vilkår. Tidsbegrenset avtale opphører uten varsel. Selskapets varslingsfrist ved manglende fornyelse er 2 måneder.", "9", 5],
  ["avtale.eierskifte", "Eierskifte", "Ved overdragelse opphører forsikringen, men selskapet svarer inntil 14 dager hvis ny eier ikke har tegnet forsikring.", "9", 5],
  ["avtale.lovliginteresse", "Lovlig interesse og vinningsforbud", "Bare lovlige interesser som kan verdsettes i penger omfattes. Forsikringen erstatter faktisk tap innen avtalen og skal ikke gi vinning; oppgitt sum er ikke verdibevis.", "11–12", 6],
  ["avtale.lovvalg", "Lovvalg og valuta", "Norsk rett og norske domstoler gjelder med ufravikelige lovvalgsforbehold. Oppgjør/premie regnes i NOK med mindre annet er angitt.", "13–14", 6],
  ["avtale.personvern", "Personopplysninger", "Nødvendige kundeopplysninger brukes til avtaleadministrasjon og angitte analyse-/markedsføringsformål og kan deles med samarbeidspartnere innen/utenforEØS. Kunden har innsyn/retting og kan reservere seg mot direkte markedsføring; lovpålagt utlevering kan skje.", "15", 6],
  ["rettshjelp.vilkar", "Rettshjelp – tvist og domstoler", "Et krav må være fremsatt og bestridt, eventuelt vedvarende taushet, mens forsikringen gjelder. Ordinære domstoler og jordskifterett omfattes; andre særdomstolsutgifter dekkes først ved ordinær domstol og ikke forberedelsen før dette.", "16.1 og16.3", 6],
  ["rettshjelp.sakskostnader", "Rettshjelp – kostnader", "Rimelige nødvendige utgifter dekkes; ekstern sakkyndig krever forhåndsgodkjenning og vitner dekkes ved hovedforhandling/bevisopptak. Voldgift, idømte kostnader og ankegebyr dekkes ikke. Motpartsbetalte kostnader trekkes fra, med unntak etter forsøkt innkreving hos usøkegod motpart.", "16.2.1", 6],
  ["rettshjelp.forlik", "Rettshjelp – forlik", "Å frafalle tilkjente/vesentlig oppnådde kostnader i forlik krever forhåndsgodkjenning. Uten godkjenning dekkes bare 50 prosent av egne kostnader oppad til 50 prosent av forsikringssummen, eller tilkjente kostnader trekkes fra.", "16.2.2", 6],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kroner per tvist;250 000 ved minst 3 parter med vesentlig like problemstillinger, også ved flere forsikringer/selskaper. Uten forhåndsgodkjenning begrenses dekningen til kundens økonomiske interesse. Produktets særregel går foran.", "16.4", 7],
  ["rettshjelp.unntak", "Rettshjelp – generelle unntak", "Unntatt er før-avtale-tvist, familie/arv/skifte, yrke/erverv, namsmyndighet, ubestridt inkasso/gjeld/konkurs, straffbar handling/ærekrenkelse/oppreisning, advokatsalær, før-tvistsutgifter og tvist med eget selskap. Forvaltningssøksmål kan dekkes etter uttømt klage, men ikke forvaltningsutgiftene. Sameiertvist unntas med særregel for ulike seksjoner/borettslagsandeler.", "16.6", 7],
  ["rettshjelp.frist", "Rettshjelp – melding og advokat", "Skriftlig melding snarest og senest ett år etter advokatengasjement/fullført forvaltningsbehandling. Kunden velger egnet advokat, men må bruke aktuell fri rettshjelp/eierskifte-/kjøperforsikring. Merkostnad ved advokatbytte eller urimelig reise dekkes ikke; selskapet kan kreve felles bistand.", "16.7.1–16.7.3", 7],
  ["rettshjelp.dokumentasjon", "Rettshjelp – dokumentasjon", "Selskapet skal kunne følge kostnadene og kreve spesifisert tidsbruk og betalt egenandel dokumentert. Salær avregnes maksimalt 2 ganger i året; rimelighet kan forelegges Advokatforeningen eller retten.", "16.7.4", 8],
  ["avtale.garantiordning", "Garantiordning", "Ordningen dekker inntil 90 prosent av hvert krav, men bolig og tvungen ansvar 100 prosent, med maksimal 20 millioner kroner per krav/sikret/skadetilfelle. Ordningen har nærmere produktunntak.", "17", 8],
  ["avtale.skaderegister", "FOSS", "Meldte skader registreres i FOSS med kundens innsyn/rettingsrett. Tilgang gis ved registrering av skade; opplysninger slettes etter 10 år.", "18", 8],
];
for (const type of ["Bil", "Hus"] as const) {
  const general = privateGeneralSource("watercircles", "WaterCircles", type, "watercircles-general.pdf",
    "https://www.watercircles.no/wp-content/uploads/2025/11/WaterCircles-Generelle-vilkar-WtCGEN-2.14-01.01.26.pdf",
    "4c36eb01274c59fc95be0597a87434b9244833d1f91c406cdd22b3f0e50ba01c", 8, "2026-01-01", "WTC-GEN-2.14");
  extendTerms(general, general.productIds!, waterCirclesGeneralRows);
  if (type === "Hus") extendTerms(general, general.productIds!, [
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "5 000 kroner pluss 20 prosent av overskytende, én egenandel per tvist selv med flere parter, med forbehold om særregel i produktvilkåret.", "16.5", 7, undefined, "standard"],
  ]);
  else extendTerms(general, general.productIds!, [
    ["avtale.trafikkavgift", "Trafikkforsikringsavgift", "Statlig trafikkavgift kreves inn sammen med forsikringen; manglende avgiftsbetaling kan gi opphør etter vilkåret.", "19", 8],
  ]);
}

const wcCarIds = products.filter(product => product.providerId === "watercircles" && product.insuranceType === "Bil").map(product => product.productId);
extendTerms(waterCirclesCar, wcCarIds, [
  ["avtale.personkrets", "Personkrets og forutsetninger", "Ansvar gjelder navngitt forsikringstaker og rettmessig bruker/fører; vognskade gjelder forsikringstakeren. Andre økonomiske interesser krever angitt medforsikring/bekreftelse. Privatkunden skal ha vanlig bosted i Norge og bilen være registrert her.", "1.1–1.5", 3],
  ["geografi.dekning", "Geografisk område", "Europa unntatt Tyrkia, Russland, Belarus og Kosovo. Rettshjelp gjelder i Norden. Ved påkrevd grenseforsikring begrenses selskapets ansvar etter særregelen for fører/passasjer, ikke haiker.", "2", 3],
  ["ansvar.egenandel", "Ansvar – egenandel", "Ordinært ingen egenandel, med avtalens særregler ved endret risiko.", "7.4.1", 9, undefined, "reference"],
  ["ansvar.utland", "Ansvar utenfor Norge", "Skadestedets lov gjelder. InnenEØS brukes norske regler dersom de gir høyere dekning.", "3.1", 3],
  ["avtale.bruksunntak", "Bruksbegrensninger", "Rekvisisjon, forsett/grov uaktsomhet/rus, avsperret bane/løp, snøbrøyting/vinsj/terrengkjøring, taxi/bud/betalt passasjertransport, trafikkskole/utleie/russebil og prøvekjennemerke er unntatt med angitte føreropplærings-/glattkjøringsunntak. Ikke godkjent ombygging/tuning/programvare omfattes ikke.", "4.1–4.16", 5],
  ["avtale.garanti", "Garantiansvar og andre tap", "Skade andre er ansvarlige for erstattes ikke, men hvis kravet ikke fører frem kan ellers dekket skade betales med overtakelse av kravet. Verdifall, arbeidsfortjeneste og avsavn dekkes ikke. Maskin-/elektronikk alene krever angitt annen dekket skade, med Elite-utvidelsen som særregel.", "4.6 og4.8–4.12", 5],
  ["avtale.risiko", "Risikoendring", "Premiebestemmende endringer skal meldes straks. Uavtalt bruk/ombygging, kjørelengde, utleie, ung fører og umerket iskjøring kan gi reduksjon/bortfall. Ved ansvar er forholdsmessig regress begrenset til 5 ganger årspremie uten bonus. Brann/tyveri/veihjelp har angitt unntak fra risikoreduksjon.", "5.1", 5],
  ["avtale.kjorelengde", "Kjørelengde", "Kilometerstand kontrolleres mot avtalt kjørelengde. For lav kjørelengde gir forholdsmessig erstatning etter betalt/riktig premie, og avtalt kjørelengde oppjusteres for resten av perioden.", "5.1.2", 6],
  ["kasko.egenandel.ung", "Uavtalt ung fører", "Når føreren er yngre enn angitt yngste fører og dette skulle gitt pristillegg, økes avtalt egenandel med minst 20 000 kroner; gjelder ikke når ung fører er avtalt i beviset.", "5.1.2", 6, undefined, "coverage"],
  ["sikkerhet.vedlikehold", "Sikkerhet – vedlikehold", "Kjøretøyet skal oppfylle gjeldende forskrifter, vedlikeholdes etter produsentens anbefalinger og ha frostvæske tilpasset klima. Sikkerhetsbrudd kan redusere eller fjerne erstatning.", "5.2–5.2.1", 6],
  ["sikkerhet.tyveri", "Sikkerhet – låsing og nøkler", "Forlatt bil skal være lukket/låst; nøkkel oppbevares trygt utenfor bilen. Ved salg skal eier/fullmektig være i bilen mens tenningsnøkkel er der. Løse hjul/deler oppbevares låst; i fellesgarasje/bod skal ekstra hjul også fastlåses til vegg/tak/gulv.", "5.2.2", 6],
  ["sikkerhet.bagasje", "Sikkerhet – bagasje", "Smykker, ur, pels, musikkinstrumenter og elektronikk/kamera med tilbehør skal aldri etterlates i bilen. Annet personlig løsøre skal ligge i låst vindusløst bagasjerom eller låst takboks.", "5.2.2", 6],
  ["sikkerhet.bruk", "Sikkerhet – fører og bruk", "Påkrevde førerkort/bevis og angitt legeattest må foreligge; øvelseskjøring skal følge lovkrav. Produsentens råd om drivstoff, slep, starthjelp og belastning/vognkort skal følges.", "5.2.3", 6],
  ["sikkerhet.lading", "Sikkerhet – lading av elbil", "Hovedladested hjemme skal ha overspenningsvern og jordfeilvern typeB etter denne sikkerhetsforskriften.", "5.2.4", 7],
  ["oppgjor.skademelding", "Skademelding og dokumentasjon", "Meld omgående og lever tilgjengelige dokumenter/registreringsdata. Brann, tyveri, hærverk og personskade politianmeldes straks. Ved tyveri kan samtlige nøkler/nøkkelregister kreves; ekstrautstyr må dokumenteres. Utbetaling avventer nødvendige undersøkelser.", "7.1", 7],
  ["oppgjor.identifikasjon", "Identifikasjon og regress", "Handlinger fra personer som med samtykke er ansvarlige for bilen kan få samme erstatningsvirkning som kundens. Utbetaling uten vilkårsdekning, ubetalt premie eller feil skadeopplysninger kan gi tilbakebetalingskrav.", "7.7–8", 9],
  ["avtale.bonus.ordning", "Bonus", "Ti prosentpoeng per skadefritt år til 70 prosent og 75 etter ett år på 70. Ved 75 i minst 6 år beholdes 75 men opptjening starter på nytt; ellers tap 5 fra 75 og 10 fra 70 eller lavere. Brann, tyveri, glass, natur, transport, veihjelp og straks politimeldt dyrepåkjørsel gir ikke bonustap. Feil bonusopplysninger kan gi forholdsmessig reduksjon.", "9", 9],
  ["ulykke.omfang", "Fører-/passasjerulykke – omfang", "Når avtalt i beviset omfattes rettmessig fører og tillatt antall passasjerer i/på bilen; fører også utenfor når bilen er direkte årsak. Betalt passasjer omfattes ikke. Området følger ansvar. Ved øvelseskjøring er lærer fører og elev passasjer.", "10.2–10.4", 10],
  ["ulykke.unntak", "Ulykke – unntak", "Psykiske lidelser, sykdom/sykelig anlegg og angitte sykdomsfølger, ryggsmerter uten røntgenpåvist ulykkesbrudd, arr under 15 prosent, slagsmål/kriminalitet og gjengjeldelse er unntatt. Forsett/selvmord har særregel ved alder/sinnstilstand og akutt ytre sinnsforvirring. Grov uaktsomhet kan gi reduksjon.", "10.6", 11],
  ["ulykke.oppgjor", "Ulykke – invaliditet og medvirkning", "Medisinsk invaliditet følger tabellen 21.04.1997 uten hensyn til yrke/inntekt. Prosent av summen følger varig grad, med samlet vurdering av flere skader og fradrag for tidligere funksjonstap/andre årsaker. Selskapet kan kreve legeerklæring/undersøkelse i Norge og betaler legens honorar.", "10.1.4 og10.7", 11],
  ["ulykke.dod.vilkar", "Ulykke – dødsfall og mottaker", "Død må følge ulykken innen ett år; tidligere invaliditet fratrekkes. Annen dødsårsak innen ett år gir ingen av delene; senere død gir mulig invaliditet. Uten ektefelle/partner/kvalifisert samboer/forsørget barn er angitt sum 20 000 kroner, men mottakerregelen sier ingen utbetaling hvis verken ektefelle/samboer eller barn etterlates; bestemmelsene må leses samlet.", "10.5.2 og10.7.2–10.7.3", 11],
  ["ulykke.samboer", "Ulykke – samboer", "Samboer krever to års felles folkeregistrert bolig eller felles barn og bolig, adgang til ekteskap og at samliv ikke faktisk er brutt. Ved separasjon/skilsmisse regnes personen ikke som ektefelle/partner selv før rettskraft.", "10.1.5 og10.7.3.2", 10],
  ["avtale.korttid", "Korttidsberegning av premie", "Ved opphør og mer enn dobbelt jevnt fordelt kjørelengde kan restpremien omberegnes. Tabellens månedsterskel / avtalt årsgruppe / ny årsgruppe er: 1 400 km / 8 000 km / 20 000 km; 1 700 / inntil 12 000 / 25 000; 2 700 / inntil 16 000 / 30 000; 3 400 / inntil 20 000 / ubegrenset; 5 000 / inntil 25 000 / ubegrenset; 7 000 / inntil 30 000 / ubegrenset. Ubrukt premie refunderes og for lite betalt kreves inn.", "11.1", 12],
  ["avtale.automatiskopphor", "Motorvognregister", "Forsikringen opphører ved registrert salg, vraking, tyveri eller avregistrering i henhold til fullmakt.", "14", 13],
  ["rettshjelp.salg", "Rettshjelp – salg og særunntak", "Tvist som tidligere eier dekkes etter salg/opphør. Entreprise-/transportoppdrag og trafikkpersonskade før trafikkforsikrers skriftlige avslag på juridisk bistand før søksmål er unntatt.", "13.2–13.4", 13],
]);
const wcPhysicalIds = wcCarIds.filter(id => id !== "watercircles-bil-ansvar");
extendTerms(waterCirclesCar, wcPhysicalIds, [
  ["avtale.objekt", "Forsikret bil og hjul", "Bilen beskrevet med kjennemerke/modell og integrert fabrikkmontert lyd-/bildeanlegg omfattes, med ett sett sommer- og vinterhjul av serietype. Omfang følger valgt vognskadedekning.", "3.2a–b", 3],
  ["glass.unntak", "Glass – særgrenser", "Solcellepanel er unntatt. Kabrioletglass/hardt plastglass har grense 15 000 kroner; ruteskifte høyst 50 prosent av bilens gjenanskaffelsesverdi, reparasjon inntil 500 kroner. Ferge-/biltransportskade er omfattet av delkasko.", "3.2.3", 4],
  ["tyveri.unntak", "Tyveri – husstand og sjåfør", "Tyveri/brannskade/hærverk ved tyveri og brukstyveri omfattes, men ikke når gjerningspersonen tilhører kundens husstand eller er ansatt sjåfør.", "3.2.2", 4],
  ["veihjelp.unntak", "Veihjelp – vilkår og grenser", "Tilgjengelig, normalt fremkommelig område kreves. Tilkoblet tilhenger kan medforsikres uten annen tilsvarende dekning. Nærmeste verksted eller rimeligere nødreparasjon og nødvendig hjemreise (ikke haiker) kan dekkes. Verkstedreparasjon og annen garanti-/abonnementsytelse er unntatt. Transport begrenses til 50 prosent av bilens verdi; feilfyllingstømming/rens høyst 5 000 kroner.", "3.3", 4],
  ["reparasjon.kontant", "Reparasjon og kontantoppgjør", "Selskapet velger verksted og økonomisk reparasjon/likeverdige deler; samtykke kreves før start. Slitasje/tidligere skade kan fratrekkes. Utilgjengelig del kan gjøres opp til siste kjente pris. Arbeid uten verksted betales 50 prosent av normalpris; påløpt mva dokumenteres.", "7.2", 7],
  ["reparasjon.unntak", "Reparasjon – ikke dekket", "Verdifall, tapt garanti, overtid, flyfrakt og foreløpig reparasjon erstattes ikke.", "7.2.6–7.2.7", 7],
  ["reparasjon.garanti", "Karosserireparasjon – garanti", "For skade etter 01.01.2024 gir anbefalt og selskapsbetalt verksted garanti på karosserideler/arbeid frem til vraking ved løpende WaterCircles-forsikring. Mekanikk, elektronikk, høyvoltbatteri og slitedeler er unntatt. Reklamer straks og innen 2 måneder til både selskap og verksted.", "7.2.10", 8],
  ["totalskade.oppgjor", "Kondemnasjon", "Ved tapt eller ulønnsomt reparerbar bil/del kan selskapet betale kontant eller levere tilsvarende. Oppgjøret bygger på brukt gjenanskaffelsesverdi. Selskapet bestemmer råderetten; beholdes vraket, trekkes vrakverdi/omregistrering. Gjenfunnet ting kan beholdes mot tilbakebetaling innen 21 dager.", "6.1,7.3 og7.6", 8],
  ["tilbehor.aldersfradrag", "Tilleggsutstyr – aldersfradrag", "Tilleggs- og sikkerhetsutstyr verdsettes nytt med 5 prosent fradrag per påbegynt år etter ett år, maksimalt 50 prosent. Ved bilens totalskade verdsettes utstyret sammen med tilsvarende brukt bil.", "6.1–6.2", 7],
  ["egenandel.sammeskade", "Egenandeler ved samme skade", "Bare høyeste egenandel trekkes ved samme hendelse på flere forsikringer. Førsterisikoutstyr med tap utover sum kan helt/delvis absorbere bilens egenandel etter beregningen i 7.4. Lov-/vilkårsreduksjoner gjøres før egenandel.", "7.4", 9],
  ["kasko.egenandel.dyr", "Påkjørsel av dyr", "Ingen egenandel ved straks politimeldt påkjørsel av løse dyr på vei når valgt egenandel er inntil 8 000 kroner; høyere egenandel reduseres 8 000.", "7.4.5", 9, undefined, "override"],
]);
extendTerms(waterCirclesCar, ["watercircles-bil-delkasko"], [
  ["tilbehor.grense", "Tilleggsutstyr og ladekabel", "Inntil 10 000 kroner samlet for lovlig ettermontert fastutstyr, folie/lakk utover originalt, lyd/datautstyr, stativer/boks og tyveri av ladekabel.", "3.2c", 4],
]);
for (const componentId of ["watercircles-bil-kasko", "watercircles-bil-elite"]) extendTerms(waterCirclesCar, [componentId], [
  ["kasko.dyr", "Kasko – skadedyr", "Uforutsett bygningsuavhengig skade på bilen fra insekter, gnagere og andre skadedyr omfattes etter kaskovilåret.", "3.2.4", 4],
  ["leiebil.unntak", "Leiebil – krav og beregning", "Krever forhåndsgodkjenning og dekket kasko/tyveri eller skadevolders ansvar. Glass alene, streik/lockout og ekstra drivstoffulempe omfattes ikke. Samme avkortning som bilskaden gjelder. Ved totalskade betales inntil 10 dager etter avgjort ansvar og ved tyveri fra melding, innen nivåets makstid.", "12", 12],
]);
extendTerms(waterCirclesCar, ["watercircles-bil-kasko"], [
  ["nyverdi.unntak", "Ny bil – øvrige betingelser", "Første eier med original kjøpekontrakt kreves; tidligere skade over 10 prosent, leasing/taxi/trafikkskole/utleie/prøve- og særkjennemerker er unntatt. Ved privatimport kreves tollkvittering. Uten tilsvarende gjenkjøp/dokumentasjon brukes ordinært bruktbiloppgjør.", "7.3.1", 8],
]);
extendTerms(waterCirclesCar, ["watercircles-bil-elite"], [
  ["nyverdi.utvidetvilkar", "Elite – nybiloppgjør", "Første eier og original kjøpekontrakt/tollkvittering kreves. Leaset bil omfattes av egen innskuddsregel. Merkostnad for ny modell-/utstyrsvariant dekkes inntil 25 000 kroner utover siste listepris. Uten gjenkjøp/dokumentasjon gjelder bruktbiloppgjør; tyveri uten gjenfinning innen 30 dager følger særregelen.", "15 pkt1.1–1.2", 13],
  ["maskinskade.unntak", "Elite – maskinskadeunntak", "Korrosjon/tæring, ledningsnett alene, startbatterier og angitte bly-/nikkel-/saltbatterier, garantiansvar, garantiavvik for bruktimport, ordinær kaskoskade og ikke godkjent tuning/programvare er unntatt. Mislykket garantikrav kan gi dekning med regress.", "15 pkt2.2", 14],
  ["maskinskade.service", "Elite – service og oppgjør", "Autoriserte dokumenterte serviceintervaller etter fabrikkens anvisninger kreves. Varsle før reparasjon; utskiftede deler må kunne fremvises. Unormalt slitte deler kan gi ekstra fradrag.", "15 pkt2.1,2.3–2.4", 14],
  ["leiebil.elitevilkar", "Elite – motor/gir og drosje", "Ved meldt motor-/girskade, også kvalifiserende garantiskade, gis leiebil inntil selskapets avgjørelse uten særskilt egenandel; ved dekket skade videre i reparasjonstiden innen 45 dager. Drosje på skadedagen inntil 750 kroner.", "15 pkt3.1–3.3", 14],
  ["bilnokkel.vilkar", "Elite – nøkkel", "Skadeårsak må være kjent og tapet knyttet til bestemt tidspunkt. Ny nøkkel, programmering og omkoding omfattes innen 20 000 kroner og 1 000 egenandel.", "15 pkt4", 14],
  ["parkering.vilkar", "Elite – parkering", "Annet ukjent kjøretøy må ha forårsaket skaden, sted/tid må være kjent, bilen høyst 10 år og avtaleverksted brukes for bonusfritaket.", "15 pkt5", 15],
  ["avtale.bonus.maskinskade", "Elite – skader uten bonustap", "Motor/gir, bilnøkkel og kvalifiserende parkeringsskade etter Elite-vilkåret medfører ikke bonustap.", "15 pkt7", 15],
  ["tilbehor.software", "Elite – programvare", "Programvare kjøpt som tillegg etter nybillevering omfattes innen den samlede tilleggsutstyrsgrensen på 40 000 kroner.", "15 pkt6.1", 15],
]);

const wcHouseIds = ["watercircles-hus-standard", "watercircles-hus-elite"];
extendTerms(waterCirclesHouse, wcHouseIds, [
  ["personkrets.begrensning", "Bygning – sikrede", "Tinglyst eier/panthaver eller annen sikkerhetsrett og annen panthaver omfattes. Selskapet kan normalt forhandle med hjemmelshaver med virkning for medforsikrede, med særregel når interessen meldes etter skade før oppgjør.", "A.3", 7],
  ["geografi", "Forsikringssted", "Stedet i beviset gjelder. Lovbestemt naturskade gjelder bare i Norge.", "A.4", 7],
  ["bygninger.tilbehor", "Ledninger og små uthus", "Bygningens fundament inngår. Uthus inntil 10 m² har brann/naturdekning uten egen spesifikasjon. Utvendige rør/ledninger/tanker/drenskum til eller fra bygningen frem til offentlig ledning, brønn eller gasstank inngår.", "A.2.1–A.2.2.1", 6],
  ["bygninger.utsmykning", "Kunstnerisk utsmykning", "Bygningens kunstneriske utsmykning inngår ikke i det ordinære bygningsobjektet.", "A.2.1", 6],
  ["plutselig.dekning", "Andre plutselige skader", "Fysisk plutselig skade på forsikret bygning omfattes innenfor de angitte skadetypene og unntakene. Vedlikehold og forbedring dekkes ikke.", "A ogA.1.5.1", 3],
  ["brann.unntak", "Brann – unntak", "Svi/gnist uten brann, heksesot/kjemisk sverting og skade fra rystelser eller sprengning er unntatt.", "A.1.1", 3],
  ["sikkerhet.vedlikehold", "Vedlikehold og tilsyn", "Bygning og tilknyttet utstyr skal vedlikeholdes og ha jevnlig tilsyn slik at de tåler beregnede påkjenninger.", "A – Sikkerhetsforskrift", 3],
  ["sikkerhet.brann", "Brann og elektrisk sikkerhet", "Offentlige pålegg om røykvarsler, slokkeutstyr, pipe/ildsted og elektrisk anlegg skal følges. Elbilkurs skal ha overspenningsvern og produsentråd følges; små elektriske kjøretøy lades bare med våkent tilstedeværende tilsyn. Gassanlegg følger Gassnorm/produsent, og uteboblebad skal varsle bortfalt strøm.", "A.1.1 – Sikkerhetsforskrift", 3],
  ["vaer.dekning", "Svak vind, snø og takras", "Plutselig skade ved vind svakere enn storm samt snøtyngde/snøpress og ras på/fra tak omfattes. Svinn/merker, utvendig vann/snø/sand uten annen dekket bygningsskade, hage/veksthus og visse utendørsobjekter, sopp/råte og svak/feil konstruksjon har særunntak.", "A.1.2.3–A.1.2.4", 4],
  ["naturskade.antenner", "Naturskade på antenne/markise", "Naturulykke som rammer bare antenne eller markise kan dekkes når ferdig montert og fastskrudd/boltet til bygning/fundament.", "A.1.2.2", 3],
  ["sikkerhet.sno", "Snø og is", "Snø/is fjernes jevnlig og forsvarlig fra tak, takrenner, vegger, balkong og terrasse før bæreevnen overskrides eller ras-/annen risiko oppstår. Ryddingen tilpasses værvarsel, årstid og sted.", "A.1.2.4 – Sikkerhetsforskrift", 4],
  ["ror.brudd", "Rør, tanker og utstrømming", "Plutselig brudd på rør/angitte tanker/bereder/kjel/pumper og lekkasje/tilbakeslag fra tilknyttet utstyr omfattes. Akvarium, vannseng og slokkeapparat inngår. Selve skadeårsaken ved slitasje/material-/montasjefeil mv er unntatt selv om dekket utstrømmingsfølgeskade kan erstattes.", "A.1.3.1–A.1.3.2", 4],
  ["vann.terreng", "Vann fra terreng, grunn og avløp", "Plutselig inntrengning fra terreng/grunn/avløp omfattes når synlig frittstående vann står over laveste gulv. Vann i oppforet gulv regnes ikke som frittstående. Sopp/råte/bakterier er unntatt.", "A.1.3.3", 4],
  ["vann.unntak", "Vann og rør – begrensninger", "Søl/kondens/vanlig bruk, våtromsgulv/-vegg som skal tåle vann, drens-/infiltrasjons-/spredeledning, takrenne/nedløp/taksluk og angitte biologiske/konstruksjons-/slitasje-/grunnforhold er unntatt. Utett oppforing rundt sluk og kondens er særskilt unntatt. Produktets uttrykkelige Elite-utvidelser gjelder foran grunnunntakene.", "A.1.3", 4],
  ["sikkerhet.vann", "Frost, hovedstoppekran og vannapparater", "Hold bygningen/badeinnretning varm eller tapp ned. Ved boligfravær over 3 uker stenges hovedkran, tappekraner åpnes og tetthet kontrolleres; ubebodd/fritidsbygning har 3 døgn. Vannkoblet kjøleskap/kaffe-/ismaskin skal ha automatisk stopp med føler. Produsentråd følges.", "A.1.3 – Sikkerhetsforskrift", 5],
  ["sikkerhet.kjokken", "Nye kjøkken fra 2026", "Gulv under skap/kjøleskap/bak sokler skal sikres mot lekkasjefølgeskade med dryppbrett/membran/belegg eller tilsvarende. FG-godkjent automatisk lekkasjestopper skal fortrinnsvis sitte på inntaket og sensorstyres.", "A.1.3 – Nye kjøkken fra01.01.2026", 5],
  ["sikkerhet.vvs", "VVS, takrenner og oljetank", "Elektrisk/VVS-arbeid krever godkjent håndverker. Takrenner, nedløp og sluk renses vår og høst. Ubrukte oljetanker tømmes/fjernes og påfylling fjernes av kvalifisert personell.", "A.1.3 – Sikkerhetsforskrift", 5],
  ["tyveri.unntak", "Tyveri/skadeverk – personunntak", "Skade fra husstandsmedlem, leieboer eller leieboers husstand erstattes ikke under grunnvilkåret. Avtalt utleietillegg vurderes etter sitt særvilkår.", "A.1.4", 5],
  ["sikkerhet.tyveri", "Sikring mot innbrudd", "Dører/boder låses og nøkler oppbevares utilgjengelig. Vinduer/åpninger skal være lukket og forsvarlig sikret; luftestilling er ikke tilstrekkelig.", "A.1.4 – Sikkerhetsforskrift", 5],
  ["plutselig.unntak", "Andre skader – unntak", "Kosmetiske merker, vann/snø/sand utenfra uten dekket bygningsskade, fundament/setninger/jordtrykk/frost/tele/material-/montasje-/håndverksfeil, dyr/insekter/sopp/råte/mugg/parasitter/bakterier, kondens, maskin/elektrisk innretning alene, utett isolerglass og våtrom er unntatt. Isolasjon krever funksjonstap; slitasje/elde/vedlikehold og flere utendørsobjekter er unntatt med uttrykkelige Elite-unntak.", "A.1.5.1", 5],
  ["konstruksjon.svikt", "Svikt i bærende konstruksjon", "Ekstraordinær bæresvikt de første 25 år fra eldste byggdel kan dekkes. Etter 15 år trekkes 10 prosent per år, minst egenandel. Garanti og første 12 måneder etter overtakelse, selve svakheten, bare konstruksjon under laveste gulv og biologisk skade er unntatt; utvikling etter opphør dekkes ikke.", "A.1.5.2", 6],
  ["sikkerhet.bygningsarbeid", "Bygningsarbeid og fagfolk", "Nybygg, ombygging og påbygg skal meldes/godkjennes og følge tegninger/materialbeskrivelser med kompetent ansvarshavende. Elektrisk og VVS-arbeid skal utføres av godkjent/sertifisert håndverker.", "A.1.5 – Sikkerhetsforskrift", 6],
  ["rydding.dekning", "Riving, rydding og bortkjøring", "Utgifter til riving, rydding og bortkjøring av verdiløse rester etter dekket skade inngår.", "A.2.2.3", 6],
  ["brukstap.dekning", "Ubeboelig bolig og leietap", "Etter dekket skade ytes normal reparasjons-/byggetid etter umøblert markedsleie/kontraktsleie. For egne rom brukes minst 12 måneders markedsleie som grunnlag. Innsparte utgifter og renter trekkes fra; forlenget byggetid på grunn av forbedring/utvidelse omfattes ikke.", "A.2.2.4 ogA.5.5.2", 9],
  ["pabud.dekning", "Offentlige påbud", "Nødvendige merutgifter til skadd byggdel/gjenoppføring, grunnundersøkelse/fundament og betingelser for bygg på samme tomt omfattes ved nye tekniske krav direkte etter skade. Påbud som kunne vært gitt uten skade er unntatt; dispensasjon kan kreves søkt.", "A.2.2.5", 6],
  ["pabud.vilkar", "Påbud – beregning og frist", "Større kjeller/arealøkning og tapt nytteareal dekkes ikke. Reparasjon/gjenoppføring må fullføres innen 5 år; oppgjør forfaller etter utbedring.", "A.5.4.4", 9],
  ["forsikringsform", "Fullverdi og førsterisiko", "Fullverdi bygger på tilsvarende gjenoppføringspris på skadestedet uten urasjonell byggemåte. Verdiøkende tilbygg må meldes ellers underforsikring. Førsterisiko begrenses til avtalt sum inkludert tillegg, uten underforsikring.", "A.5.1", 7],
  ["gjenoppforing.oppgjorsmate", "Oppgjørsform", "Selskapet velger reparasjon, tilsvarende anskaffelse/gjenoppføring, leverandør eller kontantoppgjør basert på skadedagens priser og tidligere stand.", "A.5.2", 7],
  ["gjenoppforing.fullverdigaranti", "Fast bolig – fullverdigaranti", "Totalskadet fast folkeregistrert bolig gjenoppført på samme sted/formål innen 5 år av eier/ektefelle/samboer/livsarving får ikke fradrag for nytt-for-gammelt-verdiøkning. Estetisk mismatch og planlagt/nødvendig utskiftning kan likevel ikke erstattes. Offentlig byggeforbud kan åpne for annet sted i kommunen.", "A.5.4.1.1", 8],
  ["gjenoppforing.annetsted", "Andre bygg og annet formål/sted", "Andre bygg får fradrag for verdiøkning over 40 prosent av tidligere omsetningsverdi. Annet sted/formål innenlands gir fradrag for enhver økning.", "A.5.4.1.2–A.5.4.1.3", 8],
  ["gjenoppforing.ingen", "Uten reparasjon og ved rivning", "Uten gjenoppføring begrenses oppgjør til tidligere omsetningsverdi/bruksverdi. Rivnings-/midlertidige bygg verdsettes til nedtatte brukbare materialer fratrukket rivningskostnad.", "A.5.4.2–A.5.4.3", 8],
  ["gjenoppforing.annenbolig", "Kjøp av annen bolig etter totalskade", "Dokumentert oppussing/tilpasning av kjøpt bolig kan dekkes inntil 1 million kroner når ferdig innen 2 år etter overtakelse. Totalt oppgjør begrenses til laveste av gjenoppføringspris uten mva og tidligere omsetningsverdi tillagt 100 prosent. Verdiøkning over 100 prosent trekkes fra; tilpasning regnes fullt verdiøkende.", "A.5.4.2", 8],
  ["gjenoppforing.kontant", "Kontantoppgjør og egeninnsats", "Arbeid prises etter selskapets avtalepartnere uten mva; autorisertVVS/elektro etter avtalepriser inkludert mva. Egen skadebegrensning, vask og rydding erstattes 250 kroner/time. Mva må være påløpt/dokumentert innen 5 år.", "A.5.4.1.4 ogA.5.12", 8],
  ["hage.oppgjor", "Hage – erstatningsberegning", "Ung handelsvare brukes for beplantning. Reparasjon/gjenanskaffelse prises på skadedagen; uten reparasjon brukes laveste av kostnad og tomtens verdifall. Sikring/forebygging dekkes ikke.", "A.5.4.5", 9],
  ["gjenoppforing.prisstigning", "Prisstigning", "Normal reparasjons-/gjenoppføringstid fra skadedag beregnes etter SSB-indeks. Oppgjør forfaller etter utbedring og opptjente renter trekkes fra sammen med leietap.", "A.5.5", 9],
  ["aldersfradrag.bereder_pumpe", "Bereder, kjel og pumper", "10 prosent per påbegynt år fra 5 år, maksimalt 80 prosent, av totale reparasjonskostnader.", "A.5.6.1", 9],
  ["aldersfradrag.oppvarming_kjoling", "Oppvarming og kjøling", "10 prosent per påbegynt år fra 5 år, maksimalt 80 prosent, av totale reparasjonskostnader.", "A.5.6.2", 9],
  ["aldersfradrag.integrerte_hvitevarer", "Integrerte hvitevarer", "10 prosent per påbegynt år fra 5 år, maksimalt 80 prosent, av totale reparasjonskostnader.", "A.5.6.3", 9],
  ["aldersfradrag.utvendige_ledninger_tanker", "Utvendige rør, tanker, kummer og bunnledning", "Annet rørmateriale enn plast:5 prosent per påbegynt år fra 20 år, maksimalt 80 prosent inkludert oppgraving/istandsetting; eldste del avgjør. Bunnledninger følger samme regel.", "A.5.6.4–A.5.6.5", 9],
  ["aldersfradrag.badeinnretning", "Badeinnretning", "10 prosent per påbegynt år fra 5 år, maksimalt 80 prosent. Alder regnes fra kalenderåret etter første bruk.", "A.5.6.4", 9],
  ["egenandel.sammeskade", "Samme hendelse og beregning", "Bare høyeste egenandel trekkes ved flere forsikrede ting i samme hendelse. Lov-/vilkårsreduksjon gjøres før egenandel.", "A.5.7", 10],
  ["vaer.egenandel", "Snø og svak vind – egenandel", "Egenandel som for naturskade, med mindre høyere står i beviset.", "A.5.7.2", 10, undefined, "reference"],
  ["vann.egenandel.terreng_grunnvann", "Terreng-/grunn-/avløpsvann – tillegg", "Avtalt egenandel ved første skade i 3 år. Samme årsak siste 36 måneder gir 25 000 kroner ekstra; ved manglende/sviktende drenering gjelder tillegget uansett.", "A.5.7.3", 10, undefined, "coverage"],
  ["ror.frost.egenandel", "Rør og utstrømming – frost/gjentakelse", "Frost gir 10 000 kroner tillegg. Andre årsaker gir samme tillegg ved tilsvarende skade siste 36 måneder.", "A.5.7.4a", 10, undefined, "coverage"],
  ["ror.egenandel", "Gamle innvendige vannrør", "Ved brudd på vannledning over 30 år gjelder avtalt egenandel første skade i 3 år; ny skade med samme årsak innen 36 måneder gir 25 000 kroner tillegg for både rør og følgeskade.", "A.5.7.4b", 10, undefined, "coverage"],
  ["konstruksjon.egenandel", "Bæresvikt – egenandel", "25 000 kroner ved ekstraordinær svikt i bygningskonstruksjon.", "A.5.7.5", 10, undefined, "override"],
  ["alarm.egenandel.reduksjon", "Alarm – egenandelsreduksjon", "Ved tyveri med utløst alarm til alarmsentral med utrykning dekkes egenandel inntil 8 000 kroner; høyere avtalt egenandel reduseres 8 000.", "A.5.7.6", 10, undefined, "override"],
  ["naturskade.begrensning", "Naturskade – avkortning og samlet ansvar", "Svak konstruksjon, dårlig vedlikehold/tilsyn eller manglende forebygging kan gi avkortning etter skyld/mulighet, men ikke ved liten skyld. Samlet myndighetsfastsatt katastrofegrense kan gi forholdsmessig reduksjon. Tvister kan forelegges naturskadenemnda.", "A.5.3", 7],
  ["naturskade.relokalisering", "Naturskade – byggeforbud", "Brannforsikret bygg som nektes reparert/gjenoppført på stedet på grunn av ny naturrisiko erstattes som totalskadet etter naturskadelovens særregler.", "A.5.3.1", 7],
  ["oppgjor.panthaver", "Panthaver og nye eiere", "For panthaver/konkursbo mv begrenses ansvar til laveste av verdifall og økonomisk interesse; særregel for leaset fast eiendom. Nye eiere utenfor ektefelle/samboer/livsarving vurderes uten gjenoppføring. Betaling til panthaver uten ansvar til eier gir overtakelse av panteretten.", "A.5.9", 10],
  ["avtale.nyeier", "Ny eiers mangelskrav", "Skader som kan kreves dekket gjennom ny eiers mangelskrav mot sikrede omfattes ikke av denne forsikringen.", "A.5.10", 10],
  ["oppgjor.gjenfunnet", "Skadde og gjenfunne ting", "Kunden beholder normalt skadd ting med erstatning, men selskapet kan overta. Gjenfunnet ting kan beholdes mot tilbakebetaling, ellers tilfaller den selskapet.", "A.5.11", 10],
  ["oppgjor.skademelding", "Skademelding", "Meld uten ugrunnet opphold. Brann, tyveri og skadeverk politianmeldes; selskapet kan kreve flere opplysninger/anmeldelser.", "A.6.1", 11],
  ["avtale.identifikasjon", "Ektefelle og samboer", "Samboende ektefelle eller person i fast etablert forhold kan utløse samme bortfall/reduksjon gjennom handlinger/unnlatelser som kunden.", "A.6.2.1", 11],
  ["sikkerhet.risiko", "Endret risiko og utleie", "Premiebestemmende endringer meldes straks. Bortfalte rabattgivende sikringstiltak kan gi forholdsmessig reduksjon. Utleie må være avtalt i beviset, ellers mulig avkortning/bortfall; bruk av familie i opp-/nedstigende linje inntil 2 generasjoner regnes ikke som utleie. Næringsutleie dekkes ikke.", "A.6.2.2–A.6.2.2.1", 11],
  ["fraflyttet.begrensning", "Ubebodd/fraflyttet bygning", "Bare brann-/naturskade gjenstår, begrenset til verdifallet. Fraflytting omfatter manglende fast bruk med vesentlig innbo fjernet, og uansett 12 måneder uten fast bruk, med særregel for avtalt utleie/fritidsbruk.", "A.6.2.2.2", 11],
  ["sikkerhet.begrensning", "Brudd på sikkerhetsforskrifter", "Forsømt sikkerhetsforskrift eller tilsyn med at den følges kan helt eller delvis fjerne erstatningsretten etter FAL§4-8.", "A.6.2.3", 11],
  ["ansvar.dekning", "Eieransvar – omfang", "Privat forsikringstaker, ektefelle/samboer, fast husstand og tinglyst eier er omfattet som personlig eier i Norden. Person-/tingskade må konstateres i perioden; økonomisk følgetap regnes med. Samme hendelse henføres til første konstaterte skade.", "B.1–B.3", 11],
  ["ansvar.unntak", "Eieransvar – unntak", "Avtale-/garantiansvar, lånte/leide ting, oppreisning/bøter, familie/egne selskaper, motor-/båt-/luftfartøy, grave-/sprengningsarbeid, foreldres objektive ansvar, yrke, annen eiendom, forsett, gradvis forurensning/fukt/sopp/råte, smitte og PFAS er unntatt med angitte fritidsfartøy-/hjelpemiddelunntak.", "B.4", 12],
  ["ansvar.sikkerhet", "Forurensningsansvar – tanker", "Plutselig uforutsett forurensning kan dekkes. Tankregler må følges; nedgravd tank kontrolleres/tetthetsprøves innen 15 år og deretter hvert 5 år, rekondisjonert innen 10 år og deretter hvert 5 år.50 prosent redusert veggtykkelse tillater ikke rekondisjonering. Skriftlig dokumentasjon kreves.", "B.4.12", 12],
  ["ansvar.skadebehandling", "Ansvar – plikter og oppgjør", "Varsle mulig krav straks, lever opplysninger, gjennomfør nødvendige undersøkelser og møt ved behov. Selskapet utreder/forhandler/fører dekket krav over egenandelen og kan betale direkte. Erkjennelse/forhandling uten samtykke binder ikke selskapet. Delvis dekket krav kostnadsfordeles; videre kostnad etter mulig forlik dekkes ikke.", "B.7–B.8", 13],
  ["rettshjelp.eiendom", "Rettshjelp – personkrets og eiendom", "Privat forsikringstaker, ektefelle/samboer, husstand og tinglyst eier omfattes som personlig eier. Juridiske personer/dødsbo omfattes ikke. Tvist som tidligere eier og kjøp før innflytting kan være dekket, men annen eiendom, bestemte kjøretøy/fartøy og tvist under eierskifte-/kjøpsforsikring er unntatt med avslagssærregel.", "C.1–C.5", 13],
  ["byggunderoppforing", "Bygg under oppføring", "Det særskilte byggevilkåret gjelder bare når Bygg under oppføring er angitt i forsikringsbeviset; ordinært husnivå dokumenterer ikke i seg selv slik valgt dekning.", "E – innledning", 15],
]);
extendTerms(waterCirclesHouse, ["watercircles-hus-standard"], [
  ["pabud.grense", "Offentlige påbud – sum", "Inntil 1 million kroner etter grunnvilkåret.", "A.2.2.5", 7],
]);
extendTerms(waterCirclesHouse, ["watercircles-hus-elite"], [
  ["avtale.eliteomfang", "Elite – bygninger", "Utvidelsen gjelder hovedbygningen; tilleggsbygning krever spesifikasjon. Elite inkludererVIS-vilkåretF.", "D – innledning", 14],
  ["pabud.grense", "Elite – offentlige påbud", "Ingen sumbegrensning for bygning som ikke er fredet eller verneverdig. Ellers grunnvilkårets grense.", "D B.2", 14],
  ["skadedyr.unntak", "Elite – dyreskade", "Kosmetisk skade, kjæledyr, selve skadeårsaken/forebygging og ikke dekket vannskade som oppsto før insektsangrep er unntatt. Sopp/råte og angitte skadedyr vurderes etterVIS-vilkåret.", "D A.2", 14],
  ["tilpasning.vilkar", "Elite – rullestoltilpasning", "Utgifter innen 5 år etter ulykke/fødsel og hendelse i perioden kreves. Medfødt barns invaliditet må fastsettes innen 2 år. Dokumenterte beløp ytes i tillegg til berettiget offentlig støtte, etter invaliditetstabellen.", "D C.2", 14],
  ["gjenoppforing.verdiforringelse", "Elite – nektet gjenoppføring", "Verdifall i eiendommen ved offentlig bygge-/reparasjonsforbud etter skade kan dekkes inntil 1 million kroner etter fradrag for bygningsoppgjøret. Verdier fastsettes ved skjønn; selskapet kan kreve klage. Erstatningen kan tinglyses og senere innfris ved tillatt bygging eller salg/ekspropriasjon etter særregelen.", "D C.3", 15],
  ["skadedyr.omfang", "VIS – personer, sted og objekter", "Forsikringstaker og angitt forsikringssted gjelder for boenhet med fast innredning/utstyr og frittstående garasje. Nærings-/landbruksbygg og utvendig basseng/boblebad med ledninger er unntatt.", "F.1–F.3", 24],
  ["rate.vannskade", "VIS – langvarig aktiv vannskade", "Materialnedbrytning fra råtesopp eller aktiv vannskade som har pågått over ett år omfattes. Bygningsskade fra dyr og angitt bekjempelse har ubegrenset sum med mindre annet er avtalt, med de særskilte årsaks-/sumbegrensningene.", "F.4", 24],
  ["skadedyr.grunnunntak", "VIS – unntak", "Slitasje/korrosjonsvann, råte/vann på fast innredning og utvendig treverk, mugg/blåved/kosmetikk, isolasjon uten funksjonstap, forebygging/vedlikehold, dyrerester uten skade/lukt, kjæledyr/husdyr, indirekte tap, utvendige/bunnledninger, dyreutløst brann/vann, grunnkonstruksjoner og konstruksjons-/montasjefeil med følgeskader er unntatt.", "F.5", 25],
  ["skadedyr.tid", "VIS – tid og aktivitet", "Skadeutvikling før start/etter opphør og bekjempelse av aktivitet som startet før avtalen eller fortsetter etter opphør omfattes ikke. Unntak ved oppdaget aktivitet etter start når tidligere gjeldende bygningsforsikring ville dekket bekjempelsen ved start.", "F.5.4–F.5.5", 25],
  ["skadedyr.oppgjor", "VIS – melding og oppgjør", "MeldVIS uten ugrunnet opphold og innen ett år. VIS velger kontantoppgjør, reparasjon, gjenoppføring eller bekjempelse og leverandør. Kontantoppgjør kan ikke overstige selskapets kostnad; avtalt egeninnsats 250 kroner/time. Tiltak uten samtykke, egne påvisningskostnader og urasjonell byggeskikk dekkes ikke.", "F.6.1–F.6.3", 25],
  ["skadedyr.brukstap", "VIS – ubeboelig bolig", "Normal byggetid, nødvendig flytting/lagring og godkjente oppholdsrom dekkes etter markedsleie for umøblert bolig. Utleie krever tidligere leiekontrakt. Uten dokumenterte boutgifter begrenses dekningen til 50 prosent; innsparte utgifter trekkes fra. Hjemmekontor/arbeidsplass dekkes ikke.", "F.6.3.1", 26],
  ["skadedyr.aldersfradrag", "VIS – utstyr", "Innbygde apparater, varmepumper, bereder/vannpumper og badeinnretning:10 prosent per år etter 5 år; varmekabler/annet varme-/kjøleutstyr etter 10 år. Maks 80 prosent, eldste del og totale reparasjonskostnader for elektrisk utstyr.", "F.6.3.2", 26],
  ["skadedyr.vannfradrag", "VIS – gamle konstruksjoner", "50 prosent fradrag og maksimal 200 000 kroner ved vann gjennom tak/beslag/pipe over 30 år, terrassemembran/overgang over 30 år, innvendig rør over 50 år eller utett våtrom over 20 år. Eldste del avgjør.", "F.6.4", 26],
  ["skadedyr.vanngrense", "VIS – vannsummer", "Takinntrengning:200 000 kroner per skade og 600 000 per år. Kondensvann fra hvitevarer/varmepumper:50 000 per skade og 100 000 per år. Årsaks-/dekningsunntak gjelder fortsatt.", "F.6.6", 26],
  ["skadedyr.prisstigning", "VIS – prisstigning", "Normal utbedringstid, maksimalt 24 måneder etter byggekostnadsindeksen; mva erstattes bare når påløpt og dokumentert.", "F.6.5–F.6.6", 26],
  ["skadedyr.fraflyttet", "VIS – fraflyttet bygning", "Etter fraflytting gjenstår bare råte- og skadedyrskader. Dette særvilkåret omfatter ikke ny vannskadedekning i fraflyttet bygning.", "F.6.7", 27],
  ["skadedyr.egenandel", "VIS – egenandel", "6 000 kroner ved bygningsskade,2 000 ved skadedyrbekjempelse, med mindre annet er avtalt.", "F.7", 27, undefined, "standard"],
  ["skadedyr.sikkerhet", "VIS – sikkerhet og tilgang", "Tak/vegger, åpninger og synlige lekkasjer må ettersees/utbedres straks. Pålegg følges uten ugrunnet opphold med fagfolk. Ombygging godkjennes og VVS utføres sertifisert. VIS kan besiktige uten garanti mot skjulte feil; kunden gir effektiv tilgang og følger instrukser.", "F.9–F.10", 27],
  ["skadedyr.katastrofe", "VIS – generelle unntak", "VIS-delen unntar jordskjelv/vulkan, atomreaksjon og krig/opprør. Dette gjelderVIS og opphever ikke bygningens ordinære lovbestemte naturskadedekning.", "F.11.1", 27],
  ["skadedyr.avtaleregler", "VIS – oppsigelse og fornyelse", "VIS kan si opp ved feil opplysninger med 14 dagersvarsel, svik umiddelbart/én uke og grove/gjentatte sikkerhetsbrudd, minst 3 skader eller uakseptabel risiko med 2 måneder. Avtalen fornyes normalt årlig med mulig ny pris/vilkår; kunden kan si opp/flytte etter FAL.", "F.11.3–F.11.6", 28],
  ["skadedyr.foreldelse", "VIS – frister og eierskifte", "Meldingsfrist ett år og søksmåls-/nemndfrist 6 måneder etter korrekt varslet avslag gjelder. Ved eierskifte opphører dekning med inntil 14 dagers overgang; salg meldesVIS. Norsk lov/NOK og lovlig faktisk tap gjelder. Klager kan tas til VIS/Finansklagenemnda.", "F.11.4 ogF.11.7–F.11.14", 29],
]);
extendTerms(sources["watercircles-hus-utleie"], ["watercircles-hus-utleie"], [
  ["utleie.avtalestart", "Utleie – start og sted", "Dekning gjelder navngitt forsikringstaker på angitt sted i forsikringstiden. Leieavtaler inngått før forsikringen trådte i kraft omfattes ikke. Avtalen skal regulere parter, leie/regulering/forskudd, sikkerhet, ordensregler, tilbakelevering, varighet og tvangsfravikelse.", "G.1–G.3", 29],
  ["utleie.leietapvilkar", "Utleie – perioden etter tilbakelevering", "Innen totalgrensen 6 måneder kan det ytes inntil 2 måneder etter at boligen er tilbake, frem til ny leie, hvis eier/nær familie ikke bruker den. Leie, avtalt regulering, renter/gebyrer og andre avtalte tillegg inngår i beregningsgrunnlaget.", "G.4.1 ogG.5.1", 30],
  ["utleie.unntak", "Utleie – skadeverk og slitasje", "Slitasje, hakk, riper og avskalling regnes ikke som dekket forsettlig skadeverk. Vedlikehold og forbedringer er unntatt.", "G.4.3 oginnledning", 30],
  ["utleie.oppgjor", "Utleie – innbo og løsøre", "Selskapet velger reparasjon/tilsvarende anskaffelse eller kontantoppgjør inntil egen kostnad. Nyanskaffede ting får fradrag etter innbotabellen; brukte/arvede ting etter tilsvarende bruktverdi. Antikviteter/kunst og utrangerte ting følger brukt-/omsetningsverdi.", "G.5.3.1", 30],
  ["utleie.bygningoppgjor", "Utleie – bygning og hage", "Reparasjon til tidligere stand prises på skadedagen innen sum, med fradrag for planlagt/nødvendig utskiftning og all verdiøkning. Prisstigning i normal reparasjonstid med rentefradrag inngår. Nye eiere/konkursbo begrenses til laveste av verdifall og økonomisk interesse.", "G.5.3.2–G.5.3.5", 31],
  ["utleie.sikkerhet", "Utleie – misligholdsfrister", "Varsel om utkastelse sendes senest 14 dager etter første mislighold med 14 dagers rettefrist. Begjæring til namsmannen sendes innen én måned etter varselet, senest 6 uker etter opprinnelig forfall. Selskapet varsles innen 6 uker. Sikkerhetsbrudd kan gi avkortning også ved ektefelle/samboers forsømmelse.", "G.6.4", 31],
  ["utleie.meldingregress", "Utleie – melding og regress", "Meld skade uten ugrunnet opphold og politianmeld brann, tyveri og skadeverk. Selskapet overtar utbetalt krav mot tredjepart. Gjenfunne ting kan beholdes mot tilbakebetaling; skjønn kan kreves etter generelle vilkår.", "G.5.3.4,G.5.3.6 ogG.6.1–G.6.3", 31],
]);


// Additional tables and qualification clauses retain the same selected contracts.
extendTerms(klpMax, ["klp-bil-kasko-maks"], [
  ["maskinskade.egenandel.kilometer", "Maskinskade – kilometertabell", "Inntil 100 000 km: avtalt egenandel. Over 100 000 til og med 150 000 km: 20 prosent. Over 150 000 til og med 200 000 km: 50 prosent. Over 200 000 km: 80 prosent. Prosentegenandel er minst avtalt egenandel. Ved vesentlig tilsvarende brukte deler gjøres fradraget bare i arbeidspenger inklusive avgift.", "Egenandel og aldersfradrag – Utvidet Bil Maks", 9, undefined, "coverage"],
]);
for (const [source, id, page] of [[klpHouseRot, "klp-hus-utvidet-rate-og-insektskader", 4], [klpHouseMax, "klp-hus-hus-maks", 6]] as const) extendTerms(source, [id], [
  ["skadedyr.isolasjon", "Råte/skadedyr – isolasjonsunntak", "Særvilkåret unntar uttrykkelig skade på bygningens isolasjon når det kan påvises svekket isolasjonsevne. Dette er ordlyden i særvilkåret og må leses sammen med grunnvilkårets separate isolasjonsregel.", "Råte- og insektskader – Hva som ikke dekkes", page],
]);
extendTerms(landkredittCar, lkCarIds, [
  ["avtale.panthavervilkar", "Særskilt panthaverdekning", "Når pant er registrert og forsikringsattest utstedt, kan panthaverinteressen være dekket ved tyveri/totalskade selv om eier taper erstatning eller ikke har betalt. Betalingsudyktighet må dokumenteres; slike kostnader og skade erstattet av andre omfattes ikke. Dekningen opphører med kasko/maskinskade og panthaver varsles 14 dager før.", "12.2", 13],
  ["avtale.leasingvilkar", "Leasing – eierens særvern", "Ved lovlig leasing gjelder særvernet mot manglende betaling/sikkerhetsbrudd bare når eier ikke visste eller burde vite om bruddet. Leietakers manglende betalingsevne må dokumenteres uten kostnadsdekning. Vernet opphører med kasko/forsikring og eier varsles 14 dager før.", "12.3", 13],
]);
extendTerms(landkredittHouse, lkHouseIds, [
  ["byggunderoppforing", "Særskilt byggeforsikring", "Byggeforsikring gjelder bare når den er angitt i forsikringsbeviset, for angitt bygg/bygningsdel under oppføring eller ombygging på oppføringsstedet. Ordinært husnivå dokumenterer ikke et slikt kundevalg.", "11 og11.1", 19],
]);

export {
  products as newMotorHomeProducts, sources as newMotorHomeSources,
  facts as newMotorHomeFacts, addOns as newMotorHomeAddOns,
};
