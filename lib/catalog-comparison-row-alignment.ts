import { normalizeInsuranceType } from "./insurance-normalization.ts";
import type { CatalogProduct } from "./product-catalog.ts";

type RowLabels = Record<string, string>;
type Alignment = { keys: RowLabels; labels?: RowLabels };

// Exact legacy keys whose cited facts describe the same dimension as the established row.
const alignments: Readonly<Record<string, Alignment>> = {
  bil: {
    keys: {
      "bil.ansvar": "ansvar.dekning",
      "ansvar.utland": "ansvar.geografi",
      "bil.rettshjelp": "rettshjelp.dekning",
      "rettshjelp.geografi": "geografi.rettshjelp",
      "bil.brann": "brann.dekning",
      "bil.glass": "glass.dekning",
      "geografi.dekning": "avtale.geografi",
      "bil.leiebil": "leiebil.dekning",
      "maskinskade.egenandel.200": "maskinskade.egenandel.160000-200000",
      "veihjelp.omfang": "veihjelp.geografi",
    },
    labels: {
      "ansvar.dekning": "Ansvar",
      "geografi.rettshjelp": "Rettshjelp – geografisk område",
      "ansvar.geografi": "Lovvalg ved trafikkulykke utenfor Norge",
      "veihjelp.geografi": "Veihjelp – geografisk område",
    },
  },
  bolig: {
    keys: {
      "hus.utvendige_ror": "hus.ror.utvendig",
      "hus.kunstnerisk_utsmykning": "hus.bygninger.utsmykning",
      "hus.utleie_husleie": "hus.utleie.tapt-leie",
      "hus.gjenoppforing.annenbolig": "hus.gjenoppforing.markedsverdi",
      "hus.avtale.krig": "hus.krig.begrensning",
    },
  },
  fritidsbolig: {
    keys: {
      "hytte.avtale.krig": "hytte.unntak.krig",
      "hytte.avtale.terror": "hytte.unntak.terror",
      "hytte.teknisk.glass.egenandel": "hytte.glass.egenandel",
      "hytte.utleie.skadeverk.grense": "hytte.utleie.skadeverk",
      "hytte.utleie.tyveri.grense": "hytte.utleie.tyveri",
      "hytte.utleie.utkastelse.grense": "hytte.utleie.utkastelse",
    },
    labels: {
      "hytte.glass.egenandel": "Glass og sanitærporselen – egenandel",
      "hytte.utleie.skadeverk": "Skadeverk fra leietaker",
      "hytte.utleie.tyveri": "Tyveri og underslag fra leietaker",
      "hytte.utleie.utkastelse": "Utkastelse – kostnader",
    },
  },
  innbo: {
    keys: {
      "rettshjelp.sum": "rettshjelp.grense",
      "ansvar.grense": "ansvar.sum",
      "innbo.glass": "glass.sanitaer.dekning",
      "ran.dekning": "tyveri.ran",
      "innbo.forsikrede": "innbo.sikrede",
      "innbo.forsikringssted": "innbo.omrade",
      "innbo.ombygging": "uhell.ombygging",
    },
    labels: {
      "rettshjelp.grense": "Rettshjelp – forsikringssum",
      "glass.sanitaer.dekning": "Glass og sanitærporselen",
      "tyveri.ran": "Ran og overfall",
      "innbo.sikrede": "Hvem som er forsikret",
      "innbo.omrade": "Forsikringssted",
      "uhell.ombygging": "Tilpasning ved rullestolbehov",
    },
  },
  reise: {
    keys: {
      "reise.hvem": "reise.personer.omfang",
      "reise.avbestilling.aktivitet": "reise.avbestilling.arrangement",
      "reise.medisinsk.online": "reise.tjeneste.legehjelp",
      "reise.sykeledsagelse": "reise.sykeledsagelse.tilkalling",
    },
    labels: {
      "reise.personer.omfang": "Hvem forsikringen gjelder for",
      "reise.avbestilling.arrangement": "Avbestilling – forhåndsbetalte utflukter og arrangementer",
      "reise.tjeneste.skadedyr": "Bekjempelse av veggedyr og kakerlakker",
      "reise.tjeneste.skadedyr.egenandel": "Veggedyr og kakerlakker – egenandel",
      "reise.sykeledsagelse.tilkalling": "Tilkalling og sykeledsagelse",
    },
  },
};

// These legacy keys also occur with other meanings. Bind the verified uses to products.
const housePublicOrders = { "hus.pabud.vilkar": "hus.pabud.dekning" };
const cabinPublicOrders = { "hytte.pabud.vilkar": "hytte.pabud.dekning" };
const storebrandRentalDeductible = { "hus.utleie.mislighold.egenandel": "hus.utleie.egenandel" };
const houseGeneralTerms = { "hus.avtale.generellevilkar": "hus.avtale.generelle" };
const houseDocumentPriority = { "hus.avtale.generelle": "hus.avtale.dokumentrang" };

const productSpecificKeys: Readonly<Record<string, RowLabels>> = {
  "if-hus-basis": housePublicOrders,
  "if-hus-utvidet": housePublicOrders,
  "if-hus-super": housePublicOrders,
  "tryg-hus": housePublicOrders,
  "tryg-hus-ekstra": housePublicOrders,
  "if-hytte-basis": cabinPublicOrders,
  "if-hytte-utvidet": cabinPublicOrders,
  "if-hytte-super": cabinPublicOrders,
  "tryg-hytte-standard": cabinPublicOrders,
  "tryg-hytte-ekstra": cabinPublicOrders,
  "fremtind-hytte-standard": cabinPublicOrders,
  "fremtind-hytte-topp": cabinPublicOrders,
  "storebrand-hus-standard": storebrandRentalDeductible,
  "storebrand-hus-super": storebrandRentalDeductible,
  "frende-hus-standard": houseGeneralTerms,
  "frende-hus-utvidet": houseGeneralTerms,
  "klp-hus-hus": houseDocumentPriority,
  "klp-hus-utvidet-rate-og-insektskader": houseDocumentPriority,
  "klp-hus-hus-maks": houseDocumentPriority,
  "tryg-nito-hus": {
    "hus.fullverdi": "hus.forsikringsform",
    "hus.utleie_skadeverk": "hus.utleie.skadeverk",
  },
  "tryg-nito-hus-ekstra": {
    "hus.fullverdi": "hus.gjenoppforing.hovedregel",
    "hus.utleie_skadeverk": "hus.utleie.skadeverk",
  },
  "gjensidige-hytte-standard": { ...cabinPublicOrders, "hytte.avtale.meldefrist": "hytte.krav.meldefrist" },
  "frende-reiseforsikring": {
    "reise.skadedyr.dekning": "reise.tjeneste.skadedyr",
    "reise.skadedyr.egenandel": "reise.tjeneste.skadedyr.egenandel",
  },
  "gjensidige-hytte-pluss": { ...cabinPublicOrders, "hytte.avtale.meldefrist": "hytte.krav.meldefrist" },
  "landkreditt-hus-standard": { ...houseDocumentPriority, "hus.gjenoppforing.fullverdigaranti": "hus.gjenoppforing.hovedregel" },
  "landkreditt-hus-utvidet": { ...houseDocumentPriority, "hus.gjenoppforing.fullverdigaranti": "hus.gjenoppforing.hovedregel" },
  "fremtind-innbo-topp": { "flytting.transport.grense": "flytting.dekning" },
};

type EquipmentScope = { key: string; text: string };

const trygHouseEquipment: Record<string, EquipmentScope> = {
  "hus.aldersfradrag.varmepumpe": {
    key: "hus.aldersfradrag.luftvarmepumpe", text: "Luft-til-luft- og luft-til-vann-varmepumper",
  },
  "hus.aldersfradrag.tanker": {
    key: "hus.aldersfradrag.tanker_kummer", text: "Tanker og kummer uansett materiale",
  },
};

const fremtindHouseEquipment: Record<string, EquipmentScope> = {
  "hus.aldersfradrag.luftvarmepumpe": {
    key: "hus.aldersfradrag.luftvarmepumpe", text: "Luft-til-luft- og luft-til-væske-varmepumper",
  },
  "hus.aldersfradrag.tanker_kummer": {
    key: "hus.aldersfradrag.tanker_kummer", text: "Tanker og kummer av annet materiale enn plast eller glassfiber",
  },
};

// The compared equipment class is shared. The covered equipment differs and must
// remain explicit in each product cell when the former headings are standardized.
const houseEquipment: Readonly<Record<string, Readonly<Record<string, EquipmentScope>>>> = {
  "tryg-hus": trygHouseEquipment,
  "tryg-hus-ekstra": trygHouseEquipment,
  "fremtind-hus-standard": fremtindHouseEquipment,
  "fremtind-hus-topp": fremtindHouseEquipment,
};

export function comparisonRowKey(product: CatalogProduct, key: string): string {
  const alignment = alignments[normalizeInsuranceType(product.insuranceType)];
  return houseEquipment[product.productId]?.[key]?.key ??
    productSpecificKeys[product.productId]?.[key] ?? alignment?.keys[key] ?? key;
}

export function alignComparisonRow<T extends { key: string; label: string; value: string }>(product: CatalogProduct, row: T): T {
  const key = comparisonRowKey(product, row.key);
  const label = alignments[normalizeInsuranceType(product.insuranceType)]?.labels?.[key] ?? row.label;
  const equipment = houseEquipment[product.productId]?.[row.key];
  const value = equipment ? equipment.text + ". " + row.value : row.value;
  return key === row.key && label === row.label && value === row.value ? row : { ...row, key, label, value };
}

// These catalogue headings describe the shared comparison dimension. A particular
// product's scope, threshold, and service name belong in its own cell.
const sharedHeadings: Readonly<Record<string, string>> = {
  "dyr.diagnostikk.dekning": "Diagnostikk",
  "dyr.diagnostikk.grense": "Diagnostikk – grense",
  "innbo.fryserinnhold.dekning": "Matvarer ved temperaturstigning",
  "innbo.fryserinnhold.grense": "Matvarer ved temperaturstigning – beløpsgrense",
  "reise.bagasje.kontanter": "Penger",
  "reise.tjeneste.alarm": "Reiseassistanse",
  "reise.tjeneste.legehjelp": "Digital legehjelp",
  "hus.avtale.generelle": "Generelle avtalevilkår",
  "hus.avtale.dokumentrang": "Avtaledokumentenes rang",
  "hus.utleie.egenandel": "Utleie – egenandel",
  "hus.utleie.mislighold.egenandel": "Utleie – egenandel ved misligholdt leie",
  "hus.pabud.dekning": "Offentlige påbud – dekning",
  "hus.pabud.grense": "Offentlige påbud – beløpsgrense",
  "hus.pabud.vilkar": "Offentlige påbud – vilkår og unntak",
  "hytte.pabud.dekning": "Offentlige påbud – dekning",
  "hytte.pabud.grense": "Offentlige påbud – beløpsgrense",
  "hytte.pabud.vilkar": "Offentlige påbud – vilkår og unntak",
  "hus.aldersfradrag.luftvarmepumpe": "Aldersfradrag – luftvarmepumper",
  "hus.aldersfradrag.tanker_kummer": "Aldersfradrag – tanker og kummer",
  "person.behandling.medisin": "Medisiner i forbindelse med behandling",
  "person.behandling.hjelpemidler": "Medisinske og tekniske hjelpemidler",
  "person.behandling.mental_selvhjelp": "Digital psykisk helsehjelp",
  "person.behandling.helserad": "Medisinsk rådgivning og legehjelp",
};

const headingsByType: Readonly<Record<string, RowLabels>> = {
  "båt": {
    "bat.transport.dekning": "Transport til verksted etter skade",
    "bat.transport.skade.dekning": "Skade på båten under transport",
    "bat.redning.bergelonn": "Bergelønn",
    "bat.redning.hjemtransport.dekning": "Hjemtransport av båten",
  },
  bil: {
    "avtale.automatiskopphor": "Automatisk opphør",
    "avtale.geografi": "Geografisk område",
    "leiebil.dekning": "Leiebil",
    "kasko.egenandel.ung": "Kasko – egenandel ved ung fører",
    "kasko.egenandel.dyr": "Påkjørsel av dyr – egenandel",
    "kasko.dyr.bonus": "Påkjørsel av dyr – bonustap",
    "kasko.skadedyr.dekning": "Skade fra insekter, gnagere og andre skadedyr",
    "ulykke.invaliditet.barn": "Fører/passasjer – invaliditet barn",
  },
  innbo: {
    "ansvar.sum": "Privatansvar – forsikringssum",
    "innbo.geografi": "Innbo – geografisk område",
  },
};

export function comparisonRowHeading(type: string, key: string, first?: string, second?: string): string {
  const heading = headingsByType[type]?.[key] ?? sharedHeadings[key];
  if (heading) return heading;
  if (!first || !second) return first || second || key;
  // Prefer an existing concise heading without giving the first column priority.
  return first.length < second.length || (first.length === second.length && first <= second) ? first : second;
}
