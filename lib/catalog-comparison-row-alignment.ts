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
  "hus.utleie.egenandel": "Utleie – egenandel",
};

const headingsByType: Readonly<Record<string, RowLabels>> = {
  bil: {
    "avtale.automatiskopphor": "Automatisk opphør",
    "bil.leiebil": "Leiebil",
    "kasko.egenandel.ung": "Kasko – egenandel ved ung fører",
    "ulykke.invaliditet.barn": "Fører/passasjer – invaliditet barn",
  },
  innbo: {
    "ansvar.sum": "Privatansvar – forsikringssum",
    "innbo.geografi": "Innbo – geografisk område",
  },
};

const containsEgenandel = (label: string) => /egenandel/iu.test(label);

function shortestLabel(labels: readonly string[]): string {
  return labels.reduce((best, label) => label.length < best.length
    || (label.length === best.length && label.localeCompare(best, "nb") < 0) ? label : best);
}

export function comparisonRowHeading(type: string, key: string, first?: string, second?: string): string {
  const heading = headingsByType[type]?.[key] ?? sharedHeadings[key];
  if (heading) return heading;
  const labels = [first, second].filter((label): label is string => Boolean(label));
  if (!labels.length) return key;
  // A shorter label must not hide that the row is an egenandel.
  const deductibleLabels = labels.filter(containsEgenandel);
  return shortestLabel(deductibleLabels.length ? deductibleLabels : labels);
}
