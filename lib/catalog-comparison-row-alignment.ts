import { normalizeInsuranceType } from "./insurance-normalization.ts";
import type { CatalogProduct } from "./product-catalog.ts";

type RowLabels = Record<string, string>;
type Alignment = { keys: RowLabels; labels?: RowLabels };

// Exact legacy keys whose cited facts describe the same dimension as the established row.
const alignments: Readonly<Record<string, Alignment>> = {
  bil: {
    keys: {
      "bil.ansvar": "ansvar.dekning",
      "bil.rettshjelp": "rettshjelp.dekning",
      "bil.brann": "brann.dekning",
      "bil.glass": "glass.dekning",
      "maskinskade.egenandel.200": "maskinskade.egenandel.160000-200000",
      "veihjelp.omfang": "veihjelp.geografi",
    },
    labels: {
      "ansvar.dekning": "Ansvar",
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
    },
    labels: {
      "hytte.glass.egenandel": "Glass og sanitærporselen – egenandel",
    },
  },
  innbo: {
    keys: {
      "rettshjelp.sum": "rettshjelp.grense",
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
      "reise.sykeledsagelse": "reise.sykeledsagelse.tilkalling",
    },
    labels: {
      "reise.personer.omfang": "Hvem forsikringen gjelder for",
      "reise.sykeledsagelse.tilkalling": "Tilkalling og sykeledsagelse",
    },
  },
};

// These legacy keys also occur with other meanings. Bind the verified uses to products.
const productSpecificKeys: Readonly<Record<string, RowLabels>> = {
  "tryg-nito-hus": {
    "hus.fullverdi": "hus.forsikringsform",
    "hus.utleie_skadeverk": "hus.utleie.skadeverk",
  },
  "tryg-nito-hus-ekstra": {
    "hus.fullverdi": "hus.gjenoppforing.hovedregel",
    "hus.utleie_skadeverk": "hus.utleie.skadeverk",
  },
  "fremtind-innbo-topp": { "flytting.transport.grense": "flytting.dekning" },
};

export function comparisonRowKey(product: CatalogProduct, key: string): string {
  const alignment = alignments[normalizeInsuranceType(product.insuranceType)];
  return productSpecificKeys[product.productId]?.[key] ?? alignment?.keys[key] ?? key;
}

export function alignComparisonRow<T extends { key: string; label: string }>(product: CatalogProduct, row: T): T {
  const key = comparisonRowKey(product, row.key);
  const label = alignments[normalizeInsuranceType(product.insuranceType)]?.labels?.[key] ?? row.label;
  return key === row.key && label === row.label ? row : { ...row, key, label };
}
