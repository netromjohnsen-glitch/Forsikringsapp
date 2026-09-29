import { catalogAgreementScope } from "./agreement-scope.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { conceptsForInsurance } from "./presentation-catalog.ts";
import type {
  CatalogProductComparison, ProductComparisonFact, ProductComparisonRow, ProductComparisonValue,
} from "./catalog-product-comparison.ts";

/** Presentation evidence, not new coverage data. A changed identity, value or source fails closed.
 * The evaluator never searches prose for a keyword or branches on a provider name.
 */
export type ProductParentEvidence = {
  providerId: string;
  productIds: readonly string[];
  insuranceType: string;
  agreementScope: string;
  productVersion: string;
  parentKey: string;
  childKeys: readonly string[];
  value: string;
  source: { documentId: string; effectiveFrom: string; page: number; section: string };
};

export const productParentEvidence: readonly ProductParentEvidence[] = [{
  providerId: "frende", productIds: ["frende-bil-kasko", "frende-bil-utvidet"],
  insuranceType: "bil", agreementScope: "ordinary", productVersion: "2026-01-01", parentKey: "kasko.dekning",
  childKeys: ["feilfylling.dekning", "haerverk.dekning"],
  value: "Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt, hærverk og feilfylling",
  source: { documentId: "frendeKasko", effectiveFrom: "2026-01-01", page: 3, section: "6.1" },
}];

// Product-mode order is independent of customer-mode importance/ranking.
const familyOrder: Record<string, readonly string[]> = {
  bil: ["egen-bil", "maskinskade", "totalskade", "mobilitet", "glass-redning", "elbil", "utstyr", "forer-passasjer", "brann-tyveri-natur", "ansvar-rettshjelp", "ovelseskjoring", "bonus-ung-forer", "ovrig"],
  bolig: ["plutselig", "gjenoppforing", "vann-fukt", "vatrom", "rate-skadedyr", "handverker", "vaer-natur", "utleie-bosted", "ansvar-rettshjelp", "tjenester", "aldersfradrag", "ovrig"],
  innbo: ["uhell", "tyveri", "brann-vann-natur", "sykkel-verdi", "forsikringssum", "skadedyr", "flytting-bosted", "ansvar-rettshjelp", "id-tjenester", "ovrig"],
  reise: ["rammer", "avbestilling", "sykdom-hjemtransport", "bagasje", "forsinkelse", "reiseavbrudd", "ulykke", "leiebil", "evakuering", "ansvar-rettshjelp", "tjenester", "ovrig"],
  "snøscooter": ["kasko", "utstyr", "losore", "redning", "ulykke", "forerulykke", "brann", "tyveri", "naturskade", "ansvar", "rettshjelp"],
  campingvogn: ["kasko", "fukt", "nyverdi", "ferie", "losore", "utstyr", "fortelt", "skadedyr", "redning", "glass", "brann", "tyveri", "naturskade", "rettshjelp"],
  tilhenger: ["kasko", "utstyr", "redning", "brann", "tyveri", "naturskade", "rettshjelp"],
  mc: ["egen-mc", "maskinskade", "totalskade", "kjoreutstyr", "fastmontert-utstyr", "bagasje", "parkert", "mobilitet", "ulykke", "glass-nokkel-feilfylling", "brann-tyveri-natur", "ansvar-rettshjelp", "geografi", "ovrig"],
  bobil: ["egen-bobil", "fukt-vann", "ferieavbrudd", "feriegaranti", "maskinskade", "totalskade", "losore-utstyr-fortelt", "skadedyr", "parkering", "utleie", "mobilitet", "ulykke", "glass-nokkel-feilfylling", "brann-tyveri-natur", "ansvar-rettshjelp", "geografi", "ovrig"],
  "båt": ["kasko", "totalskade", "maskinskade", "redning", "ferieavbrudd", "losore-utstyr", "rigg-jolle", "transport-opplag", "ulykke", "brann-tyveri", "ansvar-rettshjelp", "geografi", "ovrig"],
  hund: ["veterinar", "medisin-diagnostikk", "tann", "rehabilitering", "allergi-fodsel", "karenstid", "alder", "liv", "bruksverdi", "ovrig"],
  katt: ["veterinar", "medisin-diagnostikk", "tann", "rehabilitering", "allergi-fodsel", "karenstid", "alder", "liv", "ovrig"],
};

const shortLabels: Record<string, string> = {
  "egen-bil": "Kasko", "egen-mc": "Kasko", "egen-bobil": "Kasko",
  maskinskade: "Maskinskade", totalskade: "Totalskade", mobilitet: "Mobilitet",
  "ansvar-rettshjelp": "Ansvar", "forer-passasjer": "Fører/passasjer",
  "brann-tyveri-natur": "Brann, tyveri og natur", "glass-redning": "Glass og redning",
  "glass-nokkel-feilfylling": "Glass, nøkkel og feilfylling", "losore-utstyr-fortelt": "Løsøre, utstyr og fortelt",
  "ferieavbrudd": "Ferieavbrudd", "feriegaranti": "Feriegaranti", "gjenoppforing": "Gjenoppføring",
  "sykdom-hjemtransport": "Sykdom/hjemtransport", "flytting-bosted": "Flytting/bosted",
  "handverker": "Håndverkerfeil", "rammer": "Reisens rammer",
};

function sectionIdentity(type: string, row: ProductComparisonRow) {
  if (type === "bil" && /^(?:tilbehor|bagasje)\./u.test(row.key)) return { id: "bil.utstyr", label: "Utstyr og eiendeler" };
  if (["bil", "mc", "bobil"].includes(type) && /^(?:(?:mc|bobil)\.)?(?:brann|tyveri|natur|naturskade)\./u.test(row.key)) {
    return { id: `${type}.brann-tyveri-natur`, label: "Brann, tyveri og natur" };
  }
  if (row.conceptId.includes(".ufordelt.")) return { id: `${type}.ovrig`, label: "Andre vilkår" };
  return { id: row.conceptId, label: row.conceptLabel };
}

export function productSectionOrder(insuranceType: string): string[] {
  const type = normalizeInsuranceType(insuranceType);
  const prefix = type === "bolig" ? "hus" : type;
  const ordered = (familyOrder[type] ?? []).map((id) => `${prefix}.${id}`);
  return [...new Set([...ordered, ...conceptsForInsurance(type).map((concept) => concept.id), `${prefix}.ovrig`])];
}

// Encode canonical identity losslessly: no display-label collisions, including Unicode families.
export const productSectionAnchor = (id: string) => `product-section-${Array.from(id).map((character) => character.codePointAt(0)!.toString(16)).join("-")}`;

export type ProductDisplayValue = ProductComparisonValue & { parentLabel?: string };
export type ProductDisplayRow = Omit<ProductComparisonRow, "first" | "second"> & {
  first: ProductDisplayValue; second: ProductDisplayValue;
};
export type ProductCoverageGroup = {
  id: string; label: string; rows: ProductDisplayRow[];
  showHeading?: boolean;
  hiddenRowLabels?: string[];
  models: { label: string; first: ProductComparisonFact[]; second: ProductComparisonFact[] }[];
  details: { first: ProductComparisonFact[]; second: ProductComparisonFact[] };
};
export type ProductDisplaySection = {
  id: string; anchorId: string; label: string; navLabel: string; groups: ProductCoverageGroup[];
};

function parentValue(
  result: CatalogProductComparison, key: string, side: "first" | "second",
  relations: readonly ProductParentEvidence[],
): ProductDisplayValue | null {
  const materialized = result[side];
  const type = normalizeInsuranceType(materialized.product.insuranceType);
  for (const relation of relations) {
    if (relation.providerId !== materialized.product.providerId || !relation.productIds.includes(materialized.product.productId) ||
      relation.insuranceType !== type || relation.productVersion !== materialized.product.version ||
      relation.agreementScope !== catalogAgreementScope(materialized.product) || !relation.childKeys.includes(key)) continue;
    const parents = materialized.facts.filter((fact) => fact.key === relation.parentKey &&
      fact.value === relation.value && fact.state !== "unavailable" && fact.sources.some((source) =>
        source.documentId === relation.source.documentId && source.effectiveFrom === relation.source.effectiveFrom &&
        source.page === relation.source.page && source.section === relation.source.section &&
        (source.agreementScope == null || source.agreementScope === relation.agreementScope)));
    // Multiple competing parent facts are not a license to select the convenient one.
    if (parents.length !== 1 || materialized.facts.filter((fact) => fact.key === relation.parentKey).length !== 1) continue;
    const parent = parents[0];
    const raw = result.sections.flatMap((section) => section.rows).find((row) => row.key === parent.key)?.[side];
    if (!raw) continue;
    return { ...raw, parentLabel: parent.label };
  }
  return null;
}

// Only audited conditional/detail concepts use asymmetric nesting. New/unknown keys default
// to comparable rows with true unknowns; this is deliberately not a catch-all missing-data filter.
const bilDetailKeys = new Set([
  "tilbehor.bagasje.grense", "tilbehor.bagasje.unntak", "tilbehor.grense", "bagasje.grense",
  "maskinskade.fossil", "maskinskade.el", "maskinskade.drivverk",
  "veihjelp.transport.grense", "veihjelp.unntak", "leiebil.vilkar", "leiebil.unntak",
  "glass.unntak", "ulykke.omfang", "ulykke.avtalevilkar", "ulykke.unntak", "brann.unntak", "super.unntak",
]);

const groupLabels: Record<string, string> = {
  kasko: "Kaskoskade", maskinskade: "Maskinskade / motor- og girskade", nyverdi: "Totalskade og nybil",
  leiebil: "Leiebil", veihjelp: "Veihjelp", glass: "Glass", ulykke: "Fører- og passasjerulykke",
  utstyr: "Utstyr og eiendeler", parkering: "Parkeringsskade", bilnokkel: "Bilnøkkel",
};

const agreementLabels: Readonly<Record<string, string>> = {
  geografi: "Geografisk område", sesong: "Sesong / sesongvilkår",
  egenandel: "Egenandel", forsikringssum: "Forsikringssum",
};

export function catalogDisplayLabel(fact: Pick<ProductComparisonFact, "key" | "label">): string {
  const parts = fact.key.split(".");
  return parts.length === 3 && parts[1] === "avtale"
    ? agreementLabels[parts[2]] ?? fact.label : fact.label;
}

// Only complete, unqualified reference values are labelled individually agreed.
// Amounts, defaults, exceptions, combined limits and conditional cover stay verbatim.
const individualReferenceValues = new Set([
  "Fremgår av forsikringsbeviset",
  "Avtalt egenandel fremgår av forsikringsbeviset",
  "Forsikringssummen fremgår av forsikringsbeviset",
  "Forsikringssum står i forsikringsbeviset",
  "Forsikringssum fremgår av forsikringsbeviset",
  "Velges av forsikringstaker og står i forsikringsbeviset",
]);

export function catalogDisplayValue(fact: ProductComparisonFact): string {
  const isIndividualValue = /(?:^|\.)(?:egenandel|forsikringssum|sum)$/u.test(fact.key);
  return isIndividualValue && individualReferenceValues.has(fact.value)
    ? `Individuelt avtalt. ${fact.value}` : fact.value;
}

function displayValue(value: ProductDisplayValue): ProductDisplayValue {
  let text = value.text;
  for (const fact of value.facts) {
    const display = catalogDisplayValue(fact);
    if (display !== fact.value) text = text.replace(fact.value, display);
  }
  return text === value.text ? value : { ...value, text };
}

function groupIdentity(type: string, row: ProductDisplayRow): string {
  if (type === "bil") {
    if (/^(?:tilbehor|bagasje)\./u.test(row.key)) return "utstyr";
    // Evidence-derived children are nested with their documented parent, never promoted to
    // duplicate top-level navigation sections. Original child conditions remain separate.
    if (/^(?:kasko|haerverk|feilfylling)\./u.test(row.key)) return "kasko";
  }
  const parts = row.key.split(".");
  return ["hus", "innbo", "reise", "mc", "bobil", "bat", "dyr", "hund", "snoscooter", "campingvogn", "tilhenger"].includes(parts[0])
    ? parts.slice(0, 2).join(".") : parts[0];
}

export function productRowPriority(key: string): number {
  if (key.includes(".aldersfradrag")) return 6;
  if (key.endsWith(".dekning")) return 0;
  if (key.endsWith(".alder")) return 1;
  if (key.endsWith(".km")) return 2;
  if (key.includes(".egenandel")) return 3;
  if (/\.(?:unntak|begrensning|begrensninger|vilkar|avtalevilkar)(?:\.|$)/u.test(key)) return 5;
  if (/\.(?:grense|sum|forsikringssum|dager|skadegrad|bilklasse|fradrag)(?:\.|$)/u.test(key)) return 4;
  return 0;
}

export function productComparisonView(
  result: CatalogProductComparison,
  relations: readonly ProductParentEvidence[] = productParentEvidence,
): ProductDisplaySection[] {
  const type = normalizeInsuranceType(result.insuranceType);
  const sections = new Map<string, ProductDisplaySection>();
  for (const raw of result.sections.flatMap((section) => section.rows)) {
    const row: ProductDisplayRow = { ...raw,
      label: catalogDisplayLabel(raw),
      first: displayValue(raw.first.state === "unknown" ? parentValue(result, raw.key, "first", relations) ?? raw.first : raw.first),
      second: displayValue(raw.second.state === "unknown" ? parentValue(result, raw.key, "second", relations) ?? raw.second : raw.second),
    };
    if (!row.first.facts.length && !row.second.facts.length) continue;
    const identity = sectionIdentity(type, row);
    let section = sections.get(identity.id);
    if (!section) {
      section = { ...identity, anchorId: productSectionAnchor(identity.id), navLabel: shortLabels[identity.id.split(".").at(-1)!] ?? identity.label, groups: [] };
      sections.set(identity.id, section);
    }
    const id = groupIdentity(type, row);
    let group = section.groups.find((candidate) => candidate.id === id);
    if (!group) {
      group = { id, label: id.endsWith(".avtale") ? "Avtalevilkår" : groupLabels[id] ?? row.label.split(" – ")[0], rows: [], models: [], details: { first: [], second: [] } };
      section.groups.push(group);
    }
    if (type === "bil" && /^maskinskade\.(?:egenandel(?:\.|$)|fradrag$)/u.test(row.key)) {
      let model = group.models[0];
      if (!model) { model = { label: "Egenandel og kilometerfradrag", first: [], second: [] }; group.models.push(model); }
      model.first.push(...row.first.facts); model.second.push(...row.second.facts);
    } else if (type === "bil" && bilDetailKeys.has(row.key) && (row.first.state === "unknown" || row.second.state === "unknown")) {
      group.details.first.push(...row.first.facts); group.details.second.push(...row.second.facts);
    } else {
      group.rows.push(row);
    }
  }
  const order = productSectionOrder(type);
  const rank = (id: string) => order.indexOf(id) < 0 ? Number.MAX_SAFE_INTEGER : order.indexOf(id);
  for (const section of sections.values()) {
    for (const group of section.groups) {
      group.rows.sort((a, b) => productRowPriority(a.key) - productRowPriority(b.key) || a.key.localeCompare(b.key, "nb"));
      group.showHeading = group.label !== section.label;
      // Suppress only a repetition immediately below its heading. A later row
      // still needs its own label when other facts or models intervene.
      const firstLead = group.rows.find((row) => !row.first.parentLabel && !row.second.parentLabel && productRowPriority(row.key) <= 2);
      const firstVisible = firstLead ?? (!group.models.length && !group.rows.some((row) => row.first.parentLabel || row.second.parentLabel) ? group.rows[0] : undefined);
      group.hiddenRowLabels = firstVisible && (firstVisible.label === group.label ||
        (!group.showHeading && firstVisible.label === section.label)) ? [firstVisible.key] : [];
    }
    section.groups.sort((a, b) => {
      // In the damage section, Kasko remains the parent before individual benefits.
      if (a.id === "kasko") return -1;
      if (b.id === "kasko") return 1;
      const rank = (group: ProductCoverageGroup) => Math.min(...group.rows.map((row) => productRowPriority(row.key)), 6);
      return rank(a) - rank(b) || a.id.localeCompare(b.id, "nb");
    });
  }
  return [...sections.values()].sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id, "nb"));
}
