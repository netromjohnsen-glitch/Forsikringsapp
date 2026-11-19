import { gjensidigeStorebrandMcBobilCatalog } from "./mc-bobil-gjensidige-storebrand-catalog.ts";
import { storebrandAddOns, storebrandFacts, storebrandProducts } from "./storebrand-catalog.ts";
import { vehicleObjectAddOns, vehicleObjectFacts, vehicleObjectProducts } from "./vehicle-object-catalog.ts";
import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const attachment = "/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:49412a46852264b027eb6ff60fb9f1ad0db8d2a4/vilkar-motorvognforsikring.pdf";
const archivePath = "catalog/sources/storebrand/vilkar-motorvognforsikring-motor10.pdf";
const effectiveFrom = "2026-11-15";
const version = "motor10";
const filename = "vilkar-motorvognforsikring-motor10.pdf";
const sha256 = "40e0be304d36a651ab77c76bb9af02ab771b20e516aa0d671d17188d9623ccd7";

const productPages = {
  Bil: "bilforsikring",
  MC: "mc-forsikring",
  Bobil: "bobilforsikring",
  Snøscooter: "snoscooterforsikring",
} as const;

type MotorType = keyof typeof productPages;
const motorTypes = Object.keys(productPages) as MotorType[];
const marketId = (id: string) => id + "-motor10";
const sourceId = (type: MotorType) => "storebrand:motor10:" + type.toLowerCase();
const sourceUrl = (type: MotorType) => "https://www.storebrand.no/privat/forsikring/" + productPages[type] + attachment;

const sources: Record<string, CatalogSource> = Object.fromEntries(motorTypes.map(type => [
  sourceId(type), {
    id: sourceId(type), company: "Storebrand", providerId: "storebrand", insuranceType: type,
    sourceType: "full_terms", agreementScope: "ordinary", termsNumber: version, version, effectiveFrom,
    filename, url: sourceUrl(type), sha256, physicalPages: [1, 33],
    documentName: "Vilkår kjøretøy (motor10)",
  } satisfies CatalogSource,
]));

export const storebrandMotorMarketArchives = [{
  provider: "storebrand",
  slug: "motor10",
  archivePath,
  sources: motorTypes.map(type => [sourceId(type), effectiveFrom, sourceUrl(type)] as const),
}];

const legacyProducts = [
  ...storebrandProducts.filter(product => product.insuranceType === "Bil" && product.version === "motor09"),
  ...gjensidigeStorebrandMcBobilCatalog.products.filter(product => product.providerId === "storebrand" && product.version === "motor09"),
  ...vehicleObjectProducts.filter(product => product.sourceId === "vehicle:storebrand-vilkar-motorvognforsikring.pdf"),
];

const legacyProductTypes = new Map(legacyProducts.map(product => [product.productId, product.insuranceType as MotorType]));
const legacyFacts = { ...storebrandFacts, ...gjensidigeStorebrandMcBobilCatalog.facts, ...vehicleObjectFacts };
const legacyAddOns = [
  ...storebrandAddOns,
  ...gjensidigeStorebrandMcBobilCatalog.addOns,
  ...vehicleObjectAddOns,
].filter(addOn => addOn.providerId === "storebrand" && addOn.requiresLevel?.some(level => legacyProductTypes.has(level)));

const geography = "Europa, unntatt Tyrkia, Russland, Belarus, Kosovo og land eller områder med reiseadvarsel.";
const roadAssistance = "Transport til nærmeste verksted eller reparasjon på stedet hvis det er rimeligere. Ved hjemtransport og hjemreise etter vilkårene inngår bagasje.";
const glass = "Reparasjon eller skifte ved skade på kjøretøyets ruter som skyldes en tilfeldig, plutselig ytre hendelse. Slitasje og riper omfattes ikke.";
const naturalDamage = "Direkte skade fra skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden. Påkjørsel av stasjonære gjenstander som naturhendelsen har veltet, flyttet eller ført med seg, regnes ikke som naturskade.";
const parking = "Erstatningsmessig kaskoskade på parkert kjøretøy når skadevolderen er ukjent, sted og tidspunkt kjent og et av Storebrands avtaleverksteder utfører reparasjonen.";
const moistureChecks = "Fuktkontroll uten anmerkninger hos forhandler eller godkjent verksted mindre enn ett år før skaden oppdages. Det kreves årlige kontroller fra bobilen var ny.";
const moistureExclusions = "Frostskade og skade der frost eller snøtyngde er en medvirkende årsak, omfattes ikke.";
const electricComponents = "Blant annet høyvoltbatteri, høyspentkabler til batteri og elmotor, ladekontakt i bilen, batterikjøling og overvåking, spenningsomformer, strømveksler og fabrikkmontert batterilader.";
const machineExclusions = "Blant annet gradvis forringelse, varmgang, korrosjon, koks og sot, clutchlamell, understell, bremser, luftbelger og luftfjæringskompressor. Garanti og ordinær kasko kan gå foran. Servicehistorikk må kunne dokumenteres, og reparasjon krever Storebrands samtykke.";
const machineDetails = "Opplistede deler i motor, gir, drivlinje, elektronikk, styring, varme og kjøling, blant annet Start/Stop-styring, funksjonsfeil på multifunksjonsratt og fabrikkmontert parkeringsvarmer. Omfatter også styreenheter til airbag, ABS og TCS og hovedenheten i infotainmentsystemet.";

type Change = { page?: number; section?: string; value?: string; qualifier?: readonly [number, string] };
const changes: Record<string, Change> = {
  "geografi.dekning": { value: geography },
  "avtale.geografi": { value: geography },
  "veihjelp.dekning": { value: roadAssistance },
  "veihjelp.transport.grense": { value: "Hjemtransport av kjøretøy med bagasje etter punkt 6.2.3 nr. 2: inntil 50 % av kjøretøyets verdi i den stand det er ved hjemsendelse." },
  "glass.dekning": { value: glass },
  "natur.dekning": { value: naturalDamage },
  "naturskade.dekning": { value: naturalDamage },
  "tilbehor.grense": { qualifier: [6, "5 Dekningstabell – fastmontert tilleggsutstyr"] },
  "utstyr.grense": { page: 6, section: "5 Dekningstabell – fastmontert tilleggsutstyr" },
  "maskinskade.el": { value: electricComponents },
  "maskinskade.komponenter": { page: 15, value: machineDetails, qualifier: [16, "6.4.3 Sikkerhets- og komfortsystemer"] },
  "maskinskade.begrensning": { page: 16, value: machineExclusions, qualifier: [15, "6.4.3 Service og vedlikehold"] },
  "maskinskade.unntak": { page: 16, value: machineExclusions, qualifier: [15, "6.4.3 Service og vedlikehold"] },
  "parkering.dekning": { value: parking },
  "parkering.grense": { page: 13, section: "6.4 Dekningstabell – parkeringsskade uten bonustap", value: "Ubegrenset beløp for bonustapsfritaket.", qualifier: [17, "6.4.5 Parkeringsskade uten bonustap"] },
  "parkering.bonus": { value: "Ingen bonustap når vilkårene for parkeringsskade er oppfylt." },
  "parkering.begrensning": { value: "Ukjent skadevolder, kjent sted og tidspunkt og reparasjon hos et av Storebrands avtaleverksteder." },
  "bonus.parkert": { value: "Ingen bonustap når vilkårene for parkeringsskade er oppfylt." },
  "bobil.fukt.dekning": { value: "Fuktskader i vegger, tak og gulv ved oppfylt krav om fuktkontroll." },
  "bobil.fukt.alder": { value: "Nyere enn 12 år fra produksjonsår." },
  "bobil.fukt.kontroll": { value: moistureChecks },
  "bobil.fukt.begrensning": { value: moistureExclusions },
  "bobil.vann.dekning": { value: "Fukt- og vannskader etter punkt 6.4.8 nr. 1. Vilkåret beskriver dekning av fuktskader i vegger, tak og gulv." },
  "bobil.vann.begrensning": { value: "Bobil nyere enn 12 år fra produksjonsår. " + moistureExclusions },
  "ulykke.dekning": { page: 28, section: "12.1 Hvem forsikringen gjelder for", value: "Fører- og passasjerulykke når dekningen er avtalt i forsikringsbeviset." },
  "snoscooter.ulykke.dekning": { page: 28, section: "12.1 Hvem forsikringen gjelder for", value: "Fører- og passasjerulykke når dekningen er avtalt i forsikringsbeviset." },
  "rettshjelp.dekning": { page: 31, section: "13.3.1 I hvilken egenskap sikrede er dekket" },
  "leiebil.unntak": { page: 19, section: "7 Vilkår for leiebil", value: "Må være avtalt i forsikringsbeviset. Ingen leiebil ved glasskade alene eller skade dekket av garanti eller reklamasjonsrett." },
};

const latePageMoves: Record<number, number> = { 24: 25, 26: 27, 27: 28, 29: 30, 30: 31, 32: 33 };

function citation(old: CatalogFact["source"], type: MotorType, page: number, section: string): CatalogFact["source"] {
  return {
    ...old, documentId: sourceId(type), termsNumber: version, version, effectiveFrom, filename,
    company: "Storebrand", url: sourceUrl(type), agreementScope: "ordinary", page, section,
  };
}

function updateFact(fact: CatalogFact, type: MotorType): CatalogFact {
  const { source, key, value } = fact;
  if (source.termsNumber !== "motor09") return fact;
  const change = changes[key];
  let page = change?.page ?? latePageMoves[source.page] ?? source.page;
  let section = change?.section ?? source.section;
  let updatedValue = change?.value ?? value;
  let qualifier = change?.qualifier;

  if (section.startsWith("6.4.1")) page = 14;
  if (section.startsWith("6.4.7")) page = 18;
  if (section.startsWith("6.4.8.1")) section = "6.4.8 nr. 1 Fukt- og vannskader";
  if (section.startsWith("6.4.8.2")) section = "6.4.8 nr. 2 Feriegaranti";
  if (key.startsWith("maskinskade.egenandel") || (section.startsWith("6.4.4") && source.page === 16)) page = 17;
  if (key === "veihjelp.geografi") {
    page = 6;
    section = "4 Hvor forsikringen gjelder";
    updatedValue = value === "Norden" ? "Norden ved delkasko." : geography + " Gjelder veihjelp ved kasko og super.";
    qualifier = [11, "6.2.3 Veihjelp – dekningstabell"];
  }
  if (key === "ulykke.dod" && source.page === 5) {
    page = 28;
    section = "12.3 Hvilke skader Storebrand svarer for";
  }
  if (key === "ulykke.invaliditet" && source.page === 5) {
    page = 28;
    section = "12.3 Hvilke skader Storebrand svarer for";
  }
  if (key === "bobil.losore.grense" && value === "100 000 kr") {
    page = 18;
    section = "6.4.8 nr. 3 Utvidet løsøreforsikring";
  }
  if (section.includes("7.1–7.2 på side 19")) {
    if (key !== "leiebil.dekning") page = 19;
    section = key === "leiebil.dekning" ? "7 Leiebilkostnader" : "7.1–7.2 Leiebil – dekning og varighet";
    if (key === "leiebil.begrensning") updatedValue += ". Gjelder heller ikke ved garanti eller reklamasjonsrett.";
  }
  if (key === "maskinskade.dekning" && type === "Bil") {
    updatedValue += ". De særskilt opplistede sikkerhets- og komfortsystemene omfattes også.";
    qualifier = [16, "6.4.3 Sikkerhets- og komfortsystemer"];
  }
  if (key === "nyverdi.unntak" && source.section === "10.3") qualifier = [26, "10.3 Vilkår for nytt kjøretøy (fortsetter)"];
  if (key === "leiebil.unntak") qualifier = [18, "7 Leiebilkostnader – avtalt dekning"];

  return {
    ...fact,
    value: updatedValue,
    source: citation(source, type, page, section),
    ...(qualifier ? { qualificationSource: citation(source, type, qualifier[0], qualifier[1]) } : {}),
  };
}

const products: CatalogProduct[] = legacyProducts.map(product => ({
  ...product,
  agreementScope: "ordinary",
  productId: marketId(product.productId),
  version,
  sourceId: sourceId(product.insuranceType as MotorType),
  componentIds: product.componentIds?.map(marketId),
  ...(product.inheritsProductId ? { inheritsProductId: marketId(product.inheritsProductId) } : {}),
}));

const addOns: CatalogAddOn[] = legacyAddOns.map(addOn => ({
  ...addOn,
  id: marketId(addOn.id),
  componentId: marketId(addOn.componentId),
  requiresLevel: addOn.requiresLevel?.filter(level => legacyProductTypes.has(level)).map(marketId) ?? null,
}));

const typesByComponent = Object.fromEntries(legacyProducts.flatMap(product =>
  (product.componentIds ?? []).map(id => [id, product.insuranceType as MotorType] as const),
));
for (const addOn of legacyAddOns) {
  const type = addOn.requiresLevel?.map(level => legacyProductTypes.get(level)).find(Boolean);
  if (type) typesByComponent[addOn.componentId] = type;
}
const facts: Record<string, CatalogFact[]> = Object.fromEntries(Object.entries(typesByComponent).map(([id, type]) => [
  marketId(id), legacyFacts[id].map(fact => updateFact(fact, type)),
]));

const cableSource = facts[marketId("sbDelkasko")].find(fact => fact.key === "brann.egenandel")!.source;
facts[marketId("sbDelkasko")].push({
  key: "ladekabel.dekning",
  label: "Ladekabel",
  value: "Ladekabel til elbil eller hybridbil ved en dekket skade etter valgt produktnivå.",
  source: citation(cableSource, "Bil", 7, "5 Hva er forsikret – ladekabel"),
}, {
  key: "ladekabel.egenandel",
  label: "Ladekabel – egenandel",
  value: "1 000 kr ved dekket skade på ladekabel til elbil eller hybridbil alene.",
  deductibleClassification: "coverage",
  source: citation(cableSource, "Bil", 10, "6.2.1–6.2.2 Brann og tyveri – egenandel for ladekabel"),
  qualificationSource: citation(cableSource, "Bil", 13, "6.3 Kasko – egenandel for ladekabel"),
});

const machineSource = facts[marketId("sbSuper")].find(fact => fact.key === "maskinskade.dekning")!.source;
facts[marketId("sbSuper")].push({
  key: "maskinskade.komponenter",
  label: "Motor/gir/kraftoverføring – særskilt opplistede komponenter",
  value: machineDetails,
  source: citation(machineSource, "Bil", 15, "6.4.3 Opplistede komponenter"),
  qualificationSource: citation(machineSource, "Bil", 16, "6.4.3 Sikkerhets- og komfortsystemer"),
});

export const storebrandMotorMarket = {
  replacesProductIds: legacyProducts.map(product => product.productId),
  products, sources, facts, addOns,
};
